import "server-only";
import bcrypt from "bcryptjs";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin";

const SALT_ROUNDS = 12;

export interface CommunityUser {
  _id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  isBanned: boolean;
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
  password: string
): Promise<CommunityUser> {
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  const docRef = await adminDb.collection("community_users").add({
    email: email.toLowerCase().trim(),
    displayName: displayName.trim(),
    passwordHash,
    createdAt: now,
    updatedAt: now,
    isBanned: false,
  });

  return {
    _id: docRef.id,
    email: email.toLowerCase().trim(),
    displayName: displayName.trim(),
    passwordHash,
    createdAt: now,
    updatedAt: now,
    isBanned: false,
  };
}

export async function updatePassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  await adminDb.collection("community_users").doc(userId).update({
    passwordHash,
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
