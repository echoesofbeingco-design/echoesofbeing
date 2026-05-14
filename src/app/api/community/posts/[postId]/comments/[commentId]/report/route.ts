import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { rateLimits } from "@/lib/rate-limit";
import { reportComment } from "@/lib/community";

const reportSchema = z.object({
  reason: z
    .string()
    .min(10, "Please provide a reason (at least 10 characters)")
    .max(500, "Reason must be under 500 characters"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string; commentId: string }> }
) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimits.report(ip);
    if (rl.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, commentId } = await params;
    const body = await request.json();
    const parsed = reportSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const result = await reportComment(
      postId,
      commentId,
      session.userId,
      parsed.data.reason
    );

    if (result.alreadyReported) {
      return NextResponse.json(
        { error: "You have already reported this comment" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for helping keep our community safe.",
    });
  } catch (error) {
    console.error("Report comment error:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
