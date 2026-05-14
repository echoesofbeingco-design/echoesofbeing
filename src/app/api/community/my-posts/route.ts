import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { rateLimits } from "@/lib/rate-limit";
import { getPostsByUser } from "@/lib/community";

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimits.communityRead(ip);
    if (rl.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await getPostsByUser(session.userId);
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Get my posts error:", error);
    return NextResponse.json(
      { error: "Failed to load your posts" },
      { status: 500 }
    );
  }
}
