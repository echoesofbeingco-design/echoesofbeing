import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    // Fetch full user data to include email
    const fullUser = await getUserById(session.userId);

    return NextResponse.json({
      user: {
        id: session.userId,
        displayName: session.displayName,
        email: fullUser?.email || undefined,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
