import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ageFromDateOfBirth, createUser, getUserByEmail } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { rateLimits } from "@/lib/rate-limit";

/** Strip spaces, dashes, leading +91 / 0 from an Indian mobile number. */
function sanitizePhone(raw: string): string {
  return raw.replace(/[\s\-().]/g, "").replace(/^(\+91|91|0)/, "");
}

const signupSchema = z.object({
  email: z.string().email("Invalid email address").max(254),
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be under 50 characters")
    .regex(
      /^[a-zA-Z0-9_ ]+$/,
      "Name can only contain letters, numbers, spaces, and underscores"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  phone: z.string().min(1, "WhatsApp number is required").max(20),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter your date of birth"),
  gender: z.string().min(1, "Please select your gender").max(60),
  pronouns: z.string().min(1, "Please select your pronouns").max(60),
  acceptedTerms: z.literal(true, {
    message: "Please accept the Terms & Conditions and Privacy Policy",
  }),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimits.auth(ip);
    if (rl.limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
        }
      );
    }

    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const {
      email,
      displayName,
      password,
      phone,
      dateOfBirth,
      gender,
      pronouns,
    } = parsed.data;

    const cleanPhone = sanitizePhone(phone);
    if (!/^\d{10}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Age gate. The practice only works with adults, so this is checked once
    // here rather than at every booking.
    const age = ageFromDateOfBirth(dateOfBirth);
    if (age === null) {
      return NextResponse.json(
        { error: "Please enter a valid date of birth." },
        { status: 400 }
      );
    }
    if (age < 18) {
      return NextResponse.json(
        {
          error:
            "We currently work only with adults aged 18 and above, so we're not able to open an account just yet.",
          code: "UNDER_18",
        },
        { status: 403 }
      );
    }
    if (age > 120) {
      return NextResponse.json(
        { error: "Please enter a valid date of birth." },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const user = await createUser(email, displayName, password, {
      phone: cleanPhone,
      dateOfBirth,
      gender,
      pronouns,
    });

    await createSession(user._id, user.displayName);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
