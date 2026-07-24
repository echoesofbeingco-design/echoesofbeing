import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserByEmail, verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { syncClientFromUser } from "@/lib/client-sync";
import { rateLimits } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimits.auth(ip);
    if (rl.limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: "This account has been suspended" },
        { status: 403 }
      );
    }

    // Accounts the practice created have no password until the client sets
    // one. Say so plainly rather than "invalid password", which would be both
    // wrong and a dead end — the login page offers to resend the link.
    if (!user.passwordHash || user.mustSetPassword) {
      return NextResponse.json(
        {
          error:
            "Your account was created by the practice. Set a password to continue.",
          code: "MUST_SET_PASSWORD",
        },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createSession(user._id, user.displayName);

    // Push the account's current details onto their clinical client record, so
    // accounts that predate these fields self-heal on their next sign-in.
    // Deliberately not awaited-into-failure: sync issues must never block login.
    await syncClientFromUser(user).catch((e) =>
      console.error("login: client sync failed", e)
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
