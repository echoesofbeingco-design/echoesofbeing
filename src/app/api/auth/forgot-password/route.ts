import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getUserByEmail } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { Resend } from "resend";
import { rateLimits } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimits.auth(ip);
    if (rl.limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { email } = parsed.data;

    // Always return success to not reveal if email exists
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate token
    const rawToken = crypto.randomUUID();
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Store hashed token (expires in 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await adminDb.collection("password_reset_tokens").add({
      userId: user._id,
      tokenHash,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    });

    // Send email
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
    const resetLink = `${appUrl}/auth/reset-password?token=${rawToken}`;
    const fromEmail =
      process.env.EMAIL_FROM || "Echos of Being <onboarding@resend.dev>";

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Reset your password — Echos of Being",
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #2d352d;">
          <h2 style="font-size: 22px; font-weight: 500; margin-bottom: 16px;">Reset your password</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #5a6055; margin-bottom: 24px;">
            We received a request to reset the password for your Echos of Being community account.
            Click the button below to choose a new password.
          </p>
          <a href="${resetLink}" style="display: inline-block; background: #617962; color: #f7f5ec; padding: 12px 32px; border-radius: 999px; text-decoration: none; font-size: 14px; font-weight: 500;">
            Reset password
          </a>
          <p style="font-size: 13px; color: #5a6055; margin-top: 28px; line-height: 1.5;">
            This link expires in 1 hour and can only be used once. If you didn't request this, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #d1d2c7; margin: 28px 0;" />
          <p style="font-size: 12px; color: #84a284;">Echos of Being</p>
        </div>
      `,
    });

    // Mask email for the confirmation message: am***@gmail.com
    const [localPart, domain] = email.split("@");
    const masked =
      localPart.length <= 2
        ? localPart[0] + "***"
        : localPart.slice(0, 2) + "***";
    const maskedEmail = `${masked}@${domain}`;

    return NextResponse.json({ success: true, maskedEmail });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
