import "server-only";
import bcrypt from "bcryptjs";
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
