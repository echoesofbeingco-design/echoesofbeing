import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, createSession } from "@/lib/session";
import { rateLimits } from "@/lib/rate-limit";
import { adminDb } from "@/lib/firebase-admin";

const schema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be under 50 characters")
    .regex(
      /^[a-zA-Z0-9_ ]+$/,
      "Name can only contain letters, numbers, spaces, and underscores"
    ),
});

export async function PATCH(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimits.auth(ip);
    if (rl.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { displayName } = parsed.data;

    await adminDb
      .collection("community_users")
      .doc(session.userId)
      .update({
        displayName: displayName.trim(),
        updatedAt: new Date().toISOString(),
      });

    // Refresh the session with the new display name
    await createSession(session.userId, displayName.trim());

    return NextResponse.json({ success: true, displayName: displayName.trim() });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
