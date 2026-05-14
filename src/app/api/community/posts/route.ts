import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { rateLimits } from "@/lib/rate-limit";
import { moderateContent } from "@/lib/content-moderation";
import { createPost, getPosts, getUserUpvotedPosts, getRecentComments } from "@/lib/community";
import { TOPIC_VALUES } from "@/data/community-topics";

const createPostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be under 200 characters"),
  body: z
    .string()
    .min(10, "Post must be at least 10 characters")
    .max(5000, "Post must be under 5000 characters"),
  topic: z.enum(TOPIC_VALUES as unknown as [string, ...string[]]),
  isAnonymous: z.boolean().default(false),
});

// GET: List posts (paginated, filtered)
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimits.communityRead(ip);
    if (rl.limited) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
    );
    const topic = searchParams.get("topic") || undefined;
    const search = searchParams.get("q") || undefined;

    const result = await getPosts(page, pageSize, topic, search);

    // If user is logged in, include their upvote status
    const session = await getSession();
    let upvotedSet = new Set<string>();
    if (session) {
      const postIds = result.posts.map((p) => p._id);
      upvotedSet = await getUserUpvotedPosts(session.userId, postIds);
    }

    // Fetch preview comments (latest 2) for posts that have comments
    const postsWithComments = result.posts.filter((p) => p.commentCount > 0);
    const previewCommentsMap = new Map<
      string,
      { authorName: string; body: string; createdAt: string }[]
    >();

    if (postsWithComments.length > 0) {
      const commentResults = await Promise.all(
        postsWithComments.map(async (p) => ({
          postId: p._id,
          comments: await getRecentComments(p._id, 2),
        }))
      );
      for (const { postId, comments } of commentResults) {
        previewCommentsMap.set(
          postId,
          comments.map((c) => ({
            authorName: c.authorName,
            body: c.body,
            createdAt: c.createdAt,
          }))
        );
      }
    }

    const postsWithUpvoteStatus = result.posts.map((post) => ({
      ...post,
      hasUpvoted: upvotedSet.has(post._id),
      previewComments: previewCommentsMap.get(post._id) || [],
    }));

    return NextResponse.json({
      ...result,
      posts: postsWithUpvoteStatus,
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { error: "Failed to load posts" },
      { status: 500 }
    );
  }
}

// POST: Create a new post
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimits.communityWrite(ip);
    if (rl.limited) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to post" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { title, body: postBody, topic, isAnonymous } = parsed.data;

    // Strip HTML tags
    const cleanTitle = title.replace(/<[^>]*>/g, "").trim();
    const cleanBody = postBody.replace(/<[^>]*>/g, "").trim();

    // Content moderation
    const modResult = moderateContent(cleanTitle, cleanBody);
    if (!modResult.isClean) {
      return NextResponse.json(
        {
          error:
            "Your post contains language that goes against our community guidelines. Please revise and try again.",
        },
        { status: 400 }
      );
    }

    const post = await createPost({
      authorId: session.userId,
      authorName: session.displayName,
      isAnonymous,
      title: cleanTitle,
      body: cleanBody,
      topic,
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
