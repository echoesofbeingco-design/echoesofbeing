import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { rateLimits } from "@/lib/rate-limit";
import { resend, FROM_EMAIL, otpEmailHtml } from "@/lib/resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 45 * 1000; // min gap between sends per booking+purpose
const MAX_ATTEMPTS = 5;

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function genCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rl = rateLimits.otp(ip);
    if (rl.limited) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const data = await request.json();
    const { action, bookingId, purpose, email, code } = data;

    if (!bookingId || !purpose || !email || !EMAIL_RE.test(String(email))) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }
    const normalizedEmail = String(email).toLowerCase().trim();

    // ── Send a code ──
    if (action === "send") {
      const existing = await adminDb
        .collection("email_otps")
        .where("bookingId", "==", bookingId)
        .where("purpose", "==", purpose)
        .where("used", "==", false)
        .get();

      // Enforce a resend cooldown based on the most recent active code.
      const now = Date.now();
      let mostRecent = 0;
      existing.forEach((doc) => {
        const c = doc.data().createdAt as number;
        if (typeof c === "number" && c > mostRecent) mostRecent = c;
      });
      if (mostRecent && now - mostRecent < RESEND_COOLDOWN_MS) {
        return NextResponse.json(
          {
            error: "Please wait before requesting another code.",
            cooldownMs: RESEND_COOLDOWN_MS - (now - mostRecent),
          },
          { status: 429 }
        );
      }

      // Invalidate prior unused codes for this booking + purpose.
      await Promise.all(existing.docs.map((d) => d.ref.update({ used: true })));

      const codePlain = genCode();
      await adminDb.collection("email_otps").add({
        bookingId,
        purpose,
        email: normalizedEmail,
        codeHash: hashCode(codePlain),
        expiresAt: now + CODE_TTL_MS,
        used: false,
        attempts: 0,
        createdAt: now,
      });

      const { error: emailError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: normalizedEmail,
        subject: "Your verification code — Echoes of Being",
        html: otpEmailHtml(codePlain),
      });

      if (emailError) {
        console.error("Resend error (otp):", emailError);
        return NextResponse.json(
          { error: "Could not send the code. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        cooldownMs: RESEND_COOLDOWN_MS,
      });
    }

    // ── Verify a code ──
    if (action === "verify") {
      if (!code || !/^\d{6}$/.test(String(code))) {
        return NextResponse.json(
          { error: "Enter the 6-digit code." },
          { status: 400 }
        );
      }

      const snap = await adminDb
        .collection("email_otps")
        .where("bookingId", "==", bookingId)
        .where("purpose", "==", purpose)
        .where("used", "==", false)
        .get();

      if (snap.empty) {
        return NextResponse.json(
          { error: "This code has expired. Please request a new one." },
          { status: 400 }
        );
      }

      // Newest active code wins.
      const docSnap = snap.docs.sort(
        (a, b) => (b.data().createdAt as number) - (a.data().createdAt as number)
      )[0];
      const otp = docSnap.data();

      if ((otp.expiresAt as number) < Date.now()) {
        await docSnap.ref.update({ used: true });
        return NextResponse.json(
          { error: "This code has expired. Please request a new one." },
          { status: 400 }
        );
      }

      if ((otp.attempts as number) >= MAX_ATTEMPTS) {
        await docSnap.ref.update({ used: true });
        return NextResponse.json(
          { error: "Too many attempts. Please request a new code." },
          { status: 429 }
        );
      }

      if (otp.email !== normalizedEmail || otp.codeHash !== hashCode(String(code))) {
        await docSnap.ref.update({ attempts: FieldValue.increment(1) });
        return NextResponse.json(
          { error: "That code doesn't match. Please try again." },
          { status: 400 }
        );
      }

      // Success — mark used and flag the booking as verified.
      await docSnap.ref.update({ used: true });
      const field = purpose === "guardian" ? "guardianEmailVerified" : "emailVerified";
      await adminDb
        .collection("bookings")
        .doc(bookingId)
        .update({
          [field]: true,
          [`${field}At`]: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })
        .catch(() => {
          /* booking may not exist in edge cases; verification still succeeds */
        });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("OTP API error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
