import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { rateLimits } from "@/lib/rate-limit";
import { moderateText } from "@/lib/content-moderation";
import { createComment, getComments } from "@/lib/community";

const commentSchema = z.object({
  body: z
    .string()
    .min(2, "Comment must be at least 2 characters")
    .max(2000, "Comment must be under 2000 characters"),
  isAnonymous: z.boolean().default(false),
});

// GET: List comments for a post
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
    const comments = await getComments(postId);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { error: "Failed to load comments" },
      { status: 500 }
    );
  }
}

// POST: Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
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
        { error: "You must be logged in to comment" },
        { status: 401 }
      );
    }

    const { postId } = await params;
    const body = await request.json();
    const parsed = commentSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { body: commentBody, isAnonymous } = parsed.data;

    // Strip HTML
    const cleanBody = commentBody.replace(/<[^>]*>/g, "").trim();

    // Content moderation
    const modResult = moderateText(cleanBody);
    if (!modResult.isClean) {
      return NextResponse.json(
        {
          error:
            "Your comment contains language that goes against our community guidelines. Please revise and try again.",
        },
        { status: 400 }
      );
    }

    const comment = await createComment({
      postId,
      authorId: session.userId,
      authorName: session.displayName,
      isAnonymous,
      body: cleanBody,
    });

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
