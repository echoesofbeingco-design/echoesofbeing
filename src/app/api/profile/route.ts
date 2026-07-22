import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSession, deleteSession } from "@/lib/session";
import { ageFromDateOfBirth, getUserById, verifyPassword } from "@/lib/auth";
import {
  TERMS_VERSION,
  missingProfileFields,
  needsTermsAcceptance,
} from "@/lib/profile-fields";
import { rateLimit } from "@/lib/rate-limit";
import { RELEASED_STATUSES } from "@/lib/booking-types";
import { deleteCalendarEvent } from "@/lib/google-calendar";
import { syncClientFromUser } from "@/lib/client-sync";

export const dynamic = "force-dynamic";

function ip(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

/** GET — the signed-in user's profile plus their bookings. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const snap = await adminDb
    .collection("bookings")
    .where("userId", "==", session.userId)
    .get();

  const bookings = snap.docs
    .map((doc) => {
      const b = doc.data() as Record<string, unknown>;
      const slot = b.slot as
        | { startMs?: number; startISO?: string; timezone?: string }
        | undefined;
      const googleEvent = b.googleEvent as { meetLink?: string } | undefined;
      return {
        id: doc.id,
        status: String(b.status ?? ""),
        sessionType: String(b.sessionType ?? ""),
        category: String(b.category ?? ""),
        startMs: slot?.startMs ?? null,
        startISO: slot?.startISO ?? null,
        timezone: slot?.timezone ?? "Asia/Kolkata",
        meetLink: googleEvent?.meetLink ?? null,
      };
    })
    .sort((a, b) => (b.startMs ?? 0) - (a.startMs ?? 0));

  const profile = {
    phone: user.phone ?? "",
    dateOfBirth: user.dateOfBirth ?? "",
    gender: user.gender ?? "",
    pronouns: user.pronouns ?? "",
  };

  return NextResponse.json({
    user: {
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      ...profile,
      termsAcceptedAt: user.termsAcceptedAt ?? null,
      termsVersion: user.termsVersion ?? null,
      createdAt: user.createdAt,
    },
    // Accounts created before these fields existed are prompted to fill them.
    missingFields: missingProfileFields(profile),
    complete: missingProfileFields(profile).length === 0,
    // Older accounts predate consent capture, so they are asked once.
    needsTerms: needsTermsAcceptance(user),
    bookings,
  });
}

/** PATCH — update editable profile details. */
export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const limit = rateLimit(`profile:${ip(request)}`, 20, 60_000);
  if (limit.limited) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const clean = (v: unknown, max = 60) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";

  const displayName = clean(body.displayName, 50);
  if (displayName && !/^[a-zA-Z0-9_ ]{2,50}$/.test(displayName)) {
    return NextResponse.json(
      { error: "Name can only contain letters, numbers and spaces." },
      { status: 400 }
    );
  }

  const phoneRaw = clean(body.phone, 20).replace(/[\s\-().]/g, "").replace(/^(\+91|91|0)/, "");
  if (phoneRaw && !/^\d{10}$/.test(phoneRaw)) {
    return NextResponse.json(
      { error: "Please enter a valid 10-digit mobile number." },
      { status: 400 }
    );
  }

  const updates: Record<string, string> = { updatedAt: new Date().toISOString() };

  // Existing accounts accepting the terms for the first time (or re-accepting
  // after a version bump).
  if (body.acceptTerms === true) {
    updates.termsAcceptedAt = new Date().toISOString();
    updates.termsVersion = TERMS_VERSION;
  }

  if (displayName) updates.displayName = displayName;
  if (phoneRaw) updates.phone = phoneRaw;
  const gender = clean(body.gender);
  const pronouns = clean(body.pronouns);
  if (gender) updates.gender = gender;
  if (pronouns) updates.pronouns = pronouns;

  // Date of birth is write-once: older accounts may not have it, but once set
  // it can only be corrected by us (it drives the adults-only rule).
  const dateOfBirth = clean(body.dateOfBirth, 10);
  if (dateOfBirth) {
    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    if (String(user.dateOfBirth ?? "").trim()) {
      if (user.dateOfBirth !== dateOfBirth) {
        return NextResponse.json(
          {
            error:
              "Your date of birth can't be changed here. Please email us if it needs correcting.",
          },
          { status: 400 }
        );
      }
    } else {
      const age = ageFromDateOfBirth(dateOfBirth);
      if (age === null || age > 120) {
        return NextResponse.json(
          { error: "Please enter a valid date of birth." },
          { status: 400 }
        );
      }
      if (age < 18) {
        return NextResponse.json(
          {
            error:
              "We currently work only with adults aged 18 and above.",
            code: "UNDER_18",
          },
          { status: 403 }
        );
      }
      updates.dateOfBirth = dateOfBirth;
    }
  }

  await adminDb.collection("community_users").doc(session.userId).update(updates);

  // Keep the clinical client record aligned with what they just changed.
  const updated = await getUserById(session.userId);
  if (updated) {
    await syncClientFromUser(updated).catch((e) =>
      console.error("profile: client sync failed", e)
    );
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE — delete the account.
 *
 * Mirrors exactly what the Privacy Policy promises: credentials and profile go,
 * upcoming sessions are cancelled and their slots released, but clinical
 * records are retained for the professional retention period and simply
 * severed from the login.
 */
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const limit = rateLimit(`profile-delete:${ip(request)}`, 5, 60_000);
  if (limit.limited) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    password?: string;
    confirm?: string;
  };

  if (body.confirm !== "DELETE") {
    return NextResponse.json(
      { error: 'Please type DELETE to confirm.' },
      { status: 400 }
    );
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const passwordOk =
    typeof body.password === "string" &&
    (await verifyPassword(body.password, user.passwordHash));
  if (!passwordOk) {
    return NextResponse.json(
      { error: "That password is not correct." },
      { status: 403 }
    );
  }

  const nowMs = Date.now();
  const nowIso = new Date().toISOString();

  const snap = await adminDb
    .collection("bookings")
    .where("userId", "==", session.userId)
    .get();

  let cancelled = 0;
  let retained = 0;

  for (const doc of snap.docs) {
    const b = doc.data() as Record<string, unknown>;
    const slot = b.slot as { startMs?: number } | undefined;
    const googleEvent = b.googleEvent as { eventId?: string } | undefined;
    const status = String(b.status ?? "");
    const isFuture = (slot?.startMs ?? 0) > nowMs;

    if (isFuture && !RELEASED_STATUSES.has(status)) {
      // Free the slot so someone else can have it.
      if (typeof slot?.startMs === "number") {
        await adminDb
          .collection("slot_locks")
          .doc(String(slot.startMs))
          .delete()
          .catch(() => {});
      }
      if (googleEvent?.eventId) await deleteCalendarEvent(googleEvent.eventId);
      await doc.ref.update({
        status: "cancelled",
        cancelledAt: nowIso,
        cancelledBy: "account_deleted",
        userId: null,
        accountDeleted: true,
        updatedAt: nowIso,
      });
      cancelled++;
    } else {
      // Past/attended sessions: sever from the login, keep the record.
      await doc.ref.update({
        userId: null,
        accountDeleted: true,
        accountDeletedAt: nowIso,
        updatedAt: nowIso,
      });
      retained++;
    }
  }

  // Mark the clinical client record as detached, but never delete it.
  const clients = await adminDb
    .collection("clients")
    .where("email", "==", user.email.toLowerCase())
    .limit(1)
    .get();
  if (!clients.empty) {
    await clients.docs[0].ref.update({
      userId: null,
      accountDeleted: true,
      accountDeletedAt: nowIso,
      updatedAt: nowIso,
    });
  }

  // Finally remove credentials + profile and any reset tokens.
  const tokens = await adminDb
    .collection("password_reset_tokens")
    .where("userId", "==", session.userId)
    .get();
  for (const t of tokens.docs) await t.ref.delete();

  await adminDb.collection("community_users").doc(session.userId).delete();
  await deleteSession();

  return NextResponse.json({ success: true, cancelled, retained });
}
