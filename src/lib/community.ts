import "server-only";
import { adminDb } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const REPORT_THRESHOLD = parseInt(process.env.REPORT_THRESHOLD || "5", 10);

// ── Types ──────────────────────────────────────────────────────────────────

export interface CommunityPost {
  _id: string;
  authorId: string;
  authorName: string;
  isAnonymous: boolean;
  title: string;
  body: string;
  topic: string;
  upvoteCount: number;
  commentCount: number;
  reportCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityComment {
  _id: string;
  postId: string;
  authorId: string;
  authorName: string;
  isAnonymous: boolean;
  body: string;
  reportCount: number;
  isDeleted: boolean;
  createdAt: string;
}

export interface PaginatedPosts {
  posts: CommunityPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Posts ───────────────────────────────────────────────────────────────────

export async function createPost(data: {
  authorId: string;
  authorName: string;
  isAnonymous: boolean;
  title: string;
  body: string;
  topic: string;
}): Promise<CommunityPost> {
  const now = new Date().toISOString();
  const doc = {
    authorId: data.isAnonymous ? "anonymous" : data.authorId,
    authorName: data.isAnonymous ? "Anonymous" : data.authorName,
    isAnonymous: data.isAnonymous,
    title: data.title.trim(),
    body: data.body.trim(),
    topic: data.topic,
    upvoteCount: 0,
    commentCount: 0,
    reportCount: 0,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    // Store real author for admin reference (not exposed to clients)
    _realAuthorId: data.authorId,
  };

  const ref = await adminDb.collection("community_posts").add(doc);
  return { _id: ref.id, ...doc };
}

export async function getPosts(
  page: number = 1,
  pageSize: number = 10,
  topic?: string,
  search?: string
): Promise<PaginatedPosts> {
  try {
    // Simple query — fetch all, then filter/sort in-memory
    // This avoids the need for composite Firestore indexes
    const snap = await adminDb
      .collection("community_posts")
      .orderBy("createdAt", "desc")
      .get();

    // Filter in-memory
    let docs = snap.docs.filter((doc) => {
      const d = doc.data();
      if (d.isDeleted) return false;
      if (topic && topic !== "all" && d.topic !== topic) return false;
      return true;
    });

    // Search filtering
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      docs = docs.filter((doc) => {
        const d = doc.data();
        return (
          d.title?.toLowerCase().includes(searchLower) ||
          d.body?.toLowerCase().includes(searchLower)
        );
      });
    }

    const total = docs.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const paginated = docs.slice(start, start + pageSize);

    return {
      posts: paginated.map((doc) => sanitizePost(doc.id, doc.data())),
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error("getPosts error:", error);
    return { posts: [], total: 0, page, pageSize, totalPages: 1 };
  }
}

export async function getPostsByUser(userId: string): Promise<CommunityPost[]> {
  // Simple where query — sort in-memory to avoid needing a composite index
  const snap = await adminDb
    .collection("community_posts")
    .where("_realAuthorId", "==", userId)
    .get();

  return snap.docs
    .filter((doc) => !doc.data().isDeleted)
    .sort((a, b) => {
      const aTime = a.data().createdAt || "";
      const bTime = b.data().createdAt || "";
      return bTime.localeCompare(aTime); // desc
    })
    .map((doc) => sanitizePost(doc.id, doc.data()));
}

export async function updatePost(
  postId: string,
  userId: string,
  updates: { title?: string; body?: string; topic?: string }
): Promise<boolean> {
  const doc = await adminDb.collection("community_posts").doc(postId).get();
  if (!doc.exists) return false;
  const data = doc.data()!;
  if (data._realAuthorId !== userId) return false;

  await adminDb
    .collection("community_posts")
    .doc(postId)
    .update({ ...updates, updatedAt: new Date().toISOString() });
  return true;
}

export async function getPostById(
  postId: string
): Promise<CommunityPost | null> {
  const doc = await adminDb.collection("community_posts").doc(postId).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  if (data.isDeleted) return null;
  return sanitizePost(doc.id, data);
}

export async function deletePost(
  postId: string,
  userId: string
): Promise<boolean> {
  const doc = await adminDb.collection("community_posts").doc(postId).get();
  if (!doc.exists) return false;

  const data = doc.data()!;
  // Allow deletion by real author or if anonymous by matching _realAuthorId
  if (data._realAuthorId !== userId && data.authorId !== userId) return false;

  await adminDb
    .collection("community_posts")
    .doc(postId)
    .update({ isDeleted: true, updatedAt: new Date().toISOString() });
  return true;
}

/** Strip internal fields before sending to client */
function sanitizePost(
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
): CommunityPost {
  return {
    _id: id,
    authorId: data.isAnonymous ? "anonymous" : data.authorId,
    authorName: data.isAnonymous ? "Anonymous" : data.authorName,
    isAnonymous: data.isAnonymous,
    title: data.title,
    body: data.body,
    topic: data.topic,
    upvoteCount: data.upvoteCount || 0,
    commentCount: data.commentCount || 0,
    reportCount: data.reportCount || 0,
    isDeleted: data.isDeleted || false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

// ── Comments ───────────────────────────────────────────────────────────────

export async function createComment(data: {
  postId: string;
  authorId: string;
  authorName: string;
  isAnonymous: boolean;
  body: string;
}): Promise<CommunityComment> {
  const now = new Date().toISOString();
  const doc = {
    postId: data.postId,
    authorId: data.isAnonymous ? "anonymous" : data.authorId,
    authorName: data.isAnonymous ? "Anonymous" : data.authorName,
    isAnonymous: data.isAnonymous,
    body: data.body.trim(),
    reportCount: 0,
    isDeleted: false,
    createdAt: now,
    _realAuthorId: data.authorId,
  };

  const ref = await adminDb
    .collection("community_posts")
    .doc(data.postId)
    .collection("comments")
    .add(doc);

  // Increment comment count on the post
  await adminDb
    .collection("community_posts")
    .doc(data.postId)
    .update({ commentCount: FieldValue.increment(1) });

  return { _id: ref.id, ...doc };
}

export async function getComments(postId: string): Promise<CommunityComment[]> {
  const snap = await adminDb
    .collection("community_posts")
    .doc(postId)
    .collection("comments")
    .orderBy("createdAt", "asc")
    .get();

  return snap.docs
    .filter((doc) => !doc.data().isDeleted)
    .map((doc) => {
      const d = doc.data();
      return {
        _id: doc.id,
        postId,
        authorId: d.isAnonymous ? "anonymous" : d.authorId,
        authorName: d.isAnonymous ? "Anonymous" : d.authorName,
        isAnonymous: d.isAnonymous,
        body: d.body,
        reportCount: d.reportCount || 0,
        isDeleted: false,
        createdAt: d.createdAt,
      };
    });
}

/** Fetch the most recent N comments for a post (for preview on feed) */
export async function getRecentComments(
  postId: string,
  limit: number = 2
): Promise<CommunityComment[]> {
  const snap = await adminDb
    .collection("community_posts")
    .doc(postId)
    .collection("comments")
    .orderBy("createdAt", "desc")
    .limit(limit + 5) // fetch a few extra in case some are deleted
    .get();

  return snap.docs
    .filter((doc) => !doc.data().isDeleted)
    .slice(0, limit)
    .reverse() // back to chronological order
    .map((doc) => {
      const d = doc.data();
      return {
        _id: doc.id,
        postId,
        authorId: d.isAnonymous ? "anonymous" : d.authorId,
        authorName: d.isAnonymous ? "Anonymous" : d.authorName,
        isAnonymous: d.isAnonymous,
        body: d.body,
        reportCount: d.reportCount || 0,
        isDeleted: false,
        createdAt: d.createdAt,
      };
    });
}

// ── Upvotes ────────────────────────────────────────────────────────────────

export async function toggleUpvote(
  postId: string,
  userId: string
): Promise<{ upvoted: boolean; newCount: number }> {
  const voteId = `${postId}_${userId}`;
  const voteRef = adminDb.collection("community_votes").doc(voteId);
  const postRef = adminDb.collection("community_posts").doc(postId);

  const voteDoc = await voteRef.get();

  if (voteDoc.exists) {
    // Un-upvote
    const batch = adminDb.batch();
    batch.delete(voteRef);
    batch.update(postRef, { upvoteCount: FieldValue.increment(-1) });
    await batch.commit();

    const post = await postRef.get();
    return { upvoted: false, newCount: post.data()?.upvoteCount || 0 };
  } else {
    // Upvote
    const batch = adminDb.batch();
    batch.set(voteRef, {
      postId,
      userId,
      createdAt: new Date().toISOString(),
    });
    batch.update(postRef, { upvoteCount: FieldValue.increment(1) });
    await batch.commit();

    const post = await postRef.get();
    return { upvoted: true, newCount: post.data()?.upvoteCount || 0 };
  }
}

export async function hasUserUpvoted(
  postId: string,
  userId: string
): Promise<boolean> {
  const voteId = `${postId}_${userId}`;
  const doc = await adminDb.collection("community_votes").doc(voteId).get();
  return doc.exists;
}

export async function getUserUpvotedPosts(
  userId: string,
  postIds: string[]
): Promise<Set<string>> {
  if (postIds.length === 0) return new Set();

  // Firestore 'in' queries max 30 items
  const chunks: string[][] = [];
  for (let i = 0; i < postIds.length; i += 30) {
    chunks.push(postIds.slice(i, i + 30));
  }

  const upvoted = new Set<string>();
  for (const chunk of chunks) {
    const voteIds = chunk.map((pid) => `${pid}_${userId}`);
    // We can't do an 'in' on doc IDs directly; getAll is the right approach
    const refs = voteIds.map((id) =>
      adminDb.collection("community_votes").doc(id)
    );
    const docs = await adminDb.getAll(...refs);
    for (const doc of docs) {
      if (doc.exists) {
        const data = doc.data();
        if (data?.postId) upvoted.add(data.postId);
      }
    }
  }

  return upvoted;
}

// ── Reports ────────────────────────────────────────────────────────────────

export async function reportPost(
  postId: string,
  reporterId: string,
  reason: string
): Promise<{ alreadyReported: boolean; autoDeleted: boolean }> {
  // Check duplicate
  const existing = await adminDb
    .collection("community_reports")
    .where("targetType", "==", "post")
    .where("targetId", "==", postId)
    .where("reporterId", "==", reporterId)
    .limit(1)
    .get();

  if (!existing.empty) return { alreadyReported: true, autoDeleted: false };

  // Create report
  await adminDb.collection("community_reports").add({
    targetType: "post",
    targetId: postId,
    postId,
    reporterId,
    reason: reason.trim(),
    createdAt: new Date().toISOString(),
  });

  // Increment count
  const postRef = adminDb.collection("community_posts").doc(postId);
  await postRef.update({ reportCount: FieldValue.increment(1) });

  // Check threshold
  const post = await postRef.get();
  const count = post.data()?.reportCount || 0;
  const autoDeleted = count >= REPORT_THRESHOLD;

  if (autoDeleted) {
    await postRef.update({
      isDeleted: true,
      updatedAt: new Date().toISOString(),
    });
  }

  return { alreadyReported: false, autoDeleted };
}

export async function reportComment(
  postId: string,
  commentId: string,
  reporterId: string,
  reason: string
): Promise<{ alreadyReported: boolean; autoDeleted: boolean }> {
  const existing = await adminDb
    .collection("community_reports")
    .where("targetType", "==", "comment")
    .where("targetId", "==", commentId)
    .where("reporterId", "==", reporterId)
    .limit(1)
    .get();

  if (!existing.empty) return { alreadyReported: true, autoDeleted: false };

  await adminDb.collection("community_reports").add({
    targetType: "comment",
    targetId: commentId,
    postId,
    reporterId,
    reason: reason.trim(),
    createdAt: new Date().toISOString(),
  });

  const commentRef = adminDb
    .collection("community_posts")
    .doc(postId)
    .collection("comments")
    .doc(commentId);

  await commentRef.update({ reportCount: FieldValue.increment(1) });

  const comment = await commentRef.get();
  const count = comment.data()?.reportCount || 0;
  const autoDeleted = count >= REPORT_THRESHOLD;

  if (autoDeleted) {
    await commentRef.update({ isDeleted: true });
    // Decrement comment count on parent post
    await adminDb
      .collection("community_posts")
      .doc(postId)
      .update({ commentCount: FieldValue.increment(-1) });
  }

  return { alreadyReported: false, autoDeleted };
}
