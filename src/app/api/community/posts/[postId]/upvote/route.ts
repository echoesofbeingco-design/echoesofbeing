import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { rateLimits } from "@/lib/rate-limit";
import { toggleUpvote } from "@/lib/community";

// POST: Toggle upvote on a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimits.upvote(ip);
    if (rl.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    const result = await toggleUpvote(postId, session.userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Upvote error:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}
