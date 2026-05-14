import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { rateLimits } from "@/lib/rate-limit";
import { getPostById, deletePost, updatePost, hasUserUpvoted } from "@/lib/community";
import { moderateContent } from "@/lib/content-moderation";
import { TOPIC_VALUES } from "@/data/community-topics";

// GET: Single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimits.communityRead(ip);
    if (rl.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { postId } = await params;
    const post = await getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if current user has upvoted
    const session = await getSession();
    let hasUpvoted = false;
    if (session) {
      hasUpvoted = await hasUserUpvoted(postId, session.userId);
    }

    return NextResponse.json({ post: { ...post, hasUpvoted } });
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json({ error: "Failed to load post" }, { status: 500 });
  }
}

// PATCH: Edit own post
const editSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be under 150 characters")
    .optional(),
  body: z
    .string()
    .min(10, "Post body must be at least 10 characters")
    .max(5000, "Post body must be under 5000 characters")
    .optional(),
  topic: z
    .string()
    .refine((v) => TOPIC_VALUES.includes(v as (typeof TOPIC_VALUES)[number]), {
      message: "Invalid topic",
    })
    .optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimits.communityWrite(ip);
    if (rl.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    const body = await request.json();
    const parsed = editSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const updates = parsed.data;

    // Content moderation on edited content
    const modCheck = moderateContent(updates.title || "", updates.body || "");
    if (!modCheck.isClean) {
      return NextResponse.json(
        { error: "Your post contains content that violates our community guidelines. Please revise and try again." },
        { status: 400 }
      );
    }

    const updated = await updatePost(postId, session.userId, updates);
    if (!updated) {
      return NextResponse.json(
        { error: "Post not found or you don't have permission to edit it" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Edit post error:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE: Delete own post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimits.communityWrite(ip);
    if (rl.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    const deleted = await deletePost(postId, session.userId);
    if (!deleted) {
      return NextResponse.json(
        { error: "Post not found or you don't have permission to delete it" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
