import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { updatePassword } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { rateLimits } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
});

// POST: Validate token + update password
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimits.auth(ip);
    if (rl.limited) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { token, password } = parsed.data;

    // Hash the token to look up
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find valid token
    const snap = await adminDb
      .collection("password_reset_tokens")
      .where("tokenHash", "==", tokenHash)
      .where("used", "==", false)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json(
        { error: "This reset link is invalid or has already been used." },
        { status: 400 }
      );
    }

    const tokenDoc = snap.docs[0];
    const tokenData = tokenDoc.data();

    // Check expiry
    if (new Date(tokenData.expiresAt) < new Date()) {
      // Mark as used so it can't be retried
      await tokenDoc.ref.update({ used: true });
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark token as used IMMEDIATELY (one-time use)
    await tokenDoc.ref.update({ used: true });

    // Update password
    await updatePassword(tokenData.userId, password);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
