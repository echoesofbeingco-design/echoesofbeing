import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, deleteSession } from "@/lib/session";
import { getUserById, verifyPassword, deleteUser } from "@/lib/auth";
import { rateLimits } from "@/lib/rate-limit";

const schema = z.object({
  password: z.string().min(1, "Password is required"),
  confirmation: z.literal("DELETE", {
    message: 'Please type "DELETE" to confirm',
  }),
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

    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { password } = parsed.data;

    // Verify the user exists and password is correct
    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 403 }
      );
    }

    // Delete all user data
    await deleteUser(session.userId);

    // Clear the session cookie
    await deleteSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
