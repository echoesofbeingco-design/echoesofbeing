import "server-only";
import bcrypt from "bcryptjs";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin";

const SALT_ROUNDS = 12;

// Defined in profile-fields so client components can read it too.
export { TERMS_VERSION } from "@/lib/profile-fields";
import { TERMS_VERSION as CURRENT_TERMS_VERSION } from "@/lib/profile-fields";

/**
 * A site account. Originally built for the community feature (hence the
 * collection name, kept to avoid a risky migration); it is now also the
 * account used to book sessions, which is why it carries consent and basic
 * profile fields.
 */
export interface CommunityUser {
  _id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  isBanned: boolean;
  /** Booking profile — collected once at sign-up, editable from /profile. */
  phone?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  gender?: string;
  pronouns?: string;
  /** Consent captured once, so we never ask again per booking. */
  termsAcceptedAt?: string;
  termsVersion?: string;
  role?: "user" | "admin";
  /** Link to the clinical `clients` record, once they book. */
  clientId?: string;
  /**
   * True for accounts the practice created on the client's behalf. Such an
   * account has an empty passwordHash and cannot be logged into until the
   * person sets a password from their invite email.
   */
  mustSetPassword?: boolean;
}

export interface NewUserProfile {
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  pronouns?: string;
}

/** Whole years old on a given date. Returns null for unparseable input. */
export function ageFromDateOfBirth(
  dateOfBirth: string,
  nowMs: number = Date.now()
): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth ?? "");
  if (!m) return null;
  const born = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(born)) return null;
  const now = new Date(nowMs);
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  if (born > today) return null;
  let age = now.getUTCFullYear() - Number(m[1]);
  const hadBirthday =
    now.getUTCMonth() + 1 > Number(m[2]) ||
    (now.getUTCMonth() + 1 === Number(m[2]) &&
      now.getUTCDate() >= Number(m[3]));
  if (!hadBirthday) age -= 1;
  return age;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getUserByEmail(
  email: string
): Promise<CommunityUser | null> {
  const snap = await adminDb
    .collection("community_users")
    .where("email", "==", email.toLowerCase().trim())
    .limit(1)
    .get();

  if (snap.empty) return null;

  const doc = snap.docs[0];
  return { _id: doc.id, ...doc.data() } as CommunityUser;
}

export async function getUserById(
  id: string
): Promise<CommunityUser | null> {
  const doc = await adminDb.collection("community_users").doc(id).get();
  if (!doc.exists) return null;
  return { _id: doc.id, ...doc.data() } as CommunityUser;
}

export async function createUser(
  email: string,
  displayName: string,
  password: string,
  profile: NewUserProfile = {}
): Promise<CommunityUser> {
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  const record = {
    email: email.toLowerCase().trim(),
    displayName: displayName.trim(),
    passwordHash,
    createdAt: now,
    updatedAt: now,
    isBanned: false,
    phone: profile.phone?.trim() ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
    gender: profile.gender ?? "",
    pronouns: profile.pronouns ?? "",
    // Consent is captured once, here, and reused for every future booking.
    termsAcceptedAt: now,
    termsVersion: CURRENT_TERMS_VERSION,
    role: "user" as const,
  };

  const docRef = await adminDb.collection("community_users").add(record);

  return { _id: docRef.id, ...record };
}

export async function updatePassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  await adminDb.collection("community_users").doc(userId).update({
    passwordHash,
    // Whatever route they came in by, they now have a password of their own.
    mustSetPassword: false,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a user account and all associated data:
 * - Soft-delete their posts (mark isDeleted = true)
 * - Soft-delete their comments
 * - Remove their votes
 * - Remove their reports
 * - Delete the user document
 */
export async function deleteUser(userId: string): Promise<void> {
  const batch = adminDb.batch();

  // 1. Soft-delete all posts by this user
  const postsSnap = await adminDb
    .collection("community_posts")
    .where("_realAuthorId", "==", userId)
    .get();

  for (const postDoc of postsSnap.docs) {
    batch.update(postDoc.ref, {
      isDeleted: true,
      updatedAt: new Date().toISOString(),
    });
  }

  // 2. Remove all votes by this user
  const votesSnap = await adminDb
    .collection("community_votes")
    .where("userId", "==", userId)
    .get();

  for (const voteDoc of votesSnap.docs) {
    // Decrement the post's upvote count
    const voteData = voteDoc.data();
    if (voteData.postId) {
      batch.update(
        adminDb.collection("community_posts").doc(voteData.postId),
        { upvoteCount: FieldValue.increment(-1) }
      );
    }
    batch.delete(voteDoc.ref);
  }

  // 3. Remove all reports by this user
  const reportsSnap = await adminDb
    .collection("community_reports")
    .where("reporterId", "==", userId)
    .get();

  for (const reportDoc of reportsSnap.docs) {
    batch.delete(reportDoc.ref);
  }

  // 4. Remove any password reset tokens
  const tokensSnap = await adminDb
    .collection("password_reset_tokens")
    .where("userId", "==", userId)
    .get();

  for (const tokenDoc of tokensSnap.docs) {
    batch.delete(tokenDoc.ref);
  }

  // 5. Delete the user document
  batch.delete(adminDb.collection("community_users").doc(userId));

  // Commit all in one batch
  await batch.commit();

  // 6. Soft-delete comments (subcollections need per-post iteration)
  for (const postDoc of postsSnap.docs) {
    const commentsSnap = await postDoc.ref
      .collection("comments")
      .where("_realAuthorId", "==", userId)
      .get();

    if (!commentsSnap.empty) {
      const commentBatch = adminDb.batch();
      for (const commentDoc of commentsSnap.docs) {
        commentBatch.update(commentDoc.ref, { isDeleted: true });
      }
      commentBatch.update(postDoc.ref, {
        commentCount: FieldValue.increment(
          -commentsSnap.size
        ),
      });
      await commentBatch.commit();
    }
  }

  // Also check comments on OTHER users' posts
  const allPostsSnap = await adminDb.collection("community_posts").get();
  for (const postDoc of allPostsSnap.docs) {
    // Skip posts we already handled
    if (postsSnap.docs.some((d) => d.id === postDoc.id)) continue;

    const commentsSnap = await postDoc.ref
      .collection("comments")
      .where("_realAuthorId", "==", userId)
      .get();

    if (!commentsSnap.empty) {
      const commentBatch = adminDb.batch();
      for (const commentDoc of commentsSnap.docs) {
        commentBatch.update(commentDoc.ref, { isDeleted: true });
      }
      commentBatch.update(postDoc.ref, {
        commentCount: FieldValue.increment(
          -commentsSnap.size
        ),
      });
      await commentBatch.commit();
    }
  }
}
