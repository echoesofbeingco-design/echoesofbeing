import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { getSession } from "@/lib/session";
import { ageFromDateOfBirth, getUserById } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  getAvailabilityConfig,
} from "@/lib/availability-server";
import {
  formatDateInZone,
  formatTimeInZone,
  getSessionType,
  respectsBuffer,
  validateSlot,
  type BusyInterval,
} from "@/lib/availability";
import { RELEASED_STATUSES } from "@/lib/booking-types";
import { syncClientFromUser } from "@/lib/client-sync";
import { needsTermsAcceptance } from "@/lib/profile-fields";
import {
  createCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/google-calendar";
import {
  sendBookingEmails,
  sendCancellationEmails,
} from "@/lib/booking-emails";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

/** Thrown inside the transaction when the slot is no longer free. */
class SlotTakenError extends Error {}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function str(value: unknown, max = 2000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);

  // Booking is an authenticated, side-effectful action — always rate limit.
  const limit = rateLimit(`bookings:${ip}`, 20, 60_000);
  if (limit.limited) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  // Every action here is scoped to the signed-in user. The old version of this
  // route was unauthenticated, which let anyone read or mutate a booking by id.
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Please sign in to manage bookings." },
      { status: 401 }
    );
  }

  let data: Record<string, unknown>;
  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const action = str(data.action, 40);

  try {
    switch (action) {
      case "create":
        return await handleCreate(session.userId, data);
      case "get":
        return await handleGet(session.userId, str(data.bookingId, 200));
      case "list":
        return await handleList(session.userId);
      case "cancel":
        return await handleCancel(session.userId, str(data.bookingId, 200));
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof SlotTakenError) {
      return NextResponse.json(
        {
          error:
            "Sorry, that time was just taken. Please choose another slot.",
          code: "SLOT_TAKEN",
        },
        { status: 409 }
      );
    }
    console.error("bookings API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

/* ────────────────────────────  create  ───────────────────────────── */

async function handleCreate(userId: string, data: Record<string, unknown>) {
  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 401 });
  }
  if (user.isBanned) {
    return NextResponse.json({ error: "Account suspended." }, { status: 403 });
  }

  // Terms are accepted once at sign-up; older accounts predate that, so they
  // must accept before booking.
  if (needsTermsAcceptance(user)) {
    return NextResponse.json(
      {
        error:
          "Please review and accept our Terms & Conditions and Privacy Policy from your profile before booking.",
        code: "TERMS_REQUIRED",
      },
      { status: 403 }
    );
  }

  const sessionTypeId = str(data.sessionTypeId, 40);
  const startMs = typeof data.startMs === "number" ? data.startMs : NaN;
  const category = str(data.category, 100);
  const concern = str(data.concern, 2000);

  const rawConsent = (data.consent ?? {}) as Record<string, unknown>;
  const consent = {
    paidSession: rawConsent.paidSession === true,
    paymentFirst: rawConsent.paymentFirst === true,
    communicationConsent: rawConsent.communicationConsent === true,
    notes: str(rawConsent.notes, 1000),
  };

  if (!sessionTypeId || !Number.isFinite(startMs)) {
    return NextResponse.json(
      { error: "Please choose a session type and a time." },
      { status: 400 }
    );
  }
  if (!concern) {
    return NextResponse.json(
      { error: "Please tell us a little about what brings you here." },
      { status: 400 }
    );
  }
  if (
    !consent.paidSession ||
    !consent.paymentFirst ||
    !consent.communicationConsent
  ) {
    return NextResponse.json(
      { error: "Please confirm all three acknowledgements to continue." },
      { status: 400 }
    );
  }

  const config = await getAvailabilityConfig();
  const sessionType = getSessionType(config, sessionTypeId);
  if (!sessionType) {
    return NextResponse.json(
      { error: "Unknown session type." },
      { status: 400 }
    );
  }

  // Widest window in which another session could affect this one.
  const maxDurationMin = Math.max(
    ...config.sessionTypes.map((s) => s.durationMin)
  );
  const windowMs = (config.bufferMin + maxDurationMin) * 60_000;

  const bookingRef = adminDb.collection("bookings").doc();
  // Deterministic id gives us a hard uniqueness guarantee on the exact slot,
  // independent of the (softer) buffer query below.
  const lockRef = adminDb.collection("slot_locks").doc(String(startMs));

  const nowIso = new Date().toISOString();
  let endMs = 0;

  await adminDb.runTransaction(async (t) => {
    // ---- reads first (Firestore requires this) ----
    const lockSnap = await t.get(lockRef);

    const neighbourQuery = adminDb
      .collection("bookings")
      .where("slot.startMs", ">=", startMs - windowMs)
      .where("slot.startMs", "<=", startMs + windowMs)
      .select("status", "slot");
    const neighbours = await t.get(neighbourQuery);

    if (lockSnap.exists) throw new SlotTakenError();

    const busy: BusyInterval[] = [];
    for (const doc of neighbours.docs) {
      const d = doc.data() as {
        status?: string;
        slot?: { startMs?: number; endMs?: number };
      };
      if (RELEASED_STATUSES.has(d.status ?? "")) continue;
      if (
        typeof d.slot?.startMs === "number" &&
        typeof d.slot?.endMs === "number"
      ) {
        busy.push({ startMs: d.slot.startMs, endMs: d.slot.endMs });
      }
    }

    // Re-validate everything server-side: hours, Saturday, 24h notice, buffer.
    const check = validateSlot({
      config,
      sessionTypeId,
      startMs,
      busy,
      nowMs: Date.now(),
    });
    if (!check.ok) throw new SlotTakenError(check.reason);
    endMs = check.endMs;

    if (!respectsBuffer(startMs, endMs, busy, config.bufferMin)) {
      throw new SlotTakenError();
    }

    // ---- writes ----
    t.create(lockRef, {
      bookingId: bookingRef.id,
      userId,
      startMs,
      endMs,
      createdAt: nowIso,
    });

    t.create(bookingRef, {
      userId,
      name: user.displayName,
      email: user.email,
      whatsapp: user.phone ?? "",
      // Store the birth date and the age at time of booking — the age field is
      // what the dashboard displays, and it must be a number of years.
      dateOfBirth: user.dateOfBirth ?? "",
      age:
        user.dateOfBirth && ageFromDateOfBirth(user.dateOfBirth) !== null
          ? String(ageFromDateOfBirth(user.dateOfBirth))
          : "",
      gender: user.gender ?? "",
      pronouns: user.pronouns ?? "",
      sessionType: sessionType.label,
      sessionTypeId,
      category,
      concern,
      slot: {
        startMs,
        endMs,
        startISO: new Date(startMs).toISOString(),
        endISO: new Date(endMs).toISOString(),
        durationMin: sessionType.durationMin,
        timezone: config.timezone,
        sessionTypeId,
      },
      // Terms were accepted once at sign-up; carry that onto the record.
      termsAccepted: true,
      termsAcceptedAt: user.termsAcceptedAt ?? nowIso,
      termsVersion: user.termsVersion ?? "",
      // Session-specific acknowledgements, taken on every booking.
      consent: { ...consent, acceptedAt: nowIso },
      status: "slot_reserved",
      source: "website",
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  });

  // ---- after the slot is safely held ----
  const sync = await syncClientFromUser(user, {
    createIfMissing: true,
    bookingId: bookingRef.id,
  });
  const clientId = sync.clientId;
  if (clientId) await bookingRef.update({ clientId });

  const calendar = await addToCalendar({
    sessionLabel: sessionType.label,
    name: user.displayName,
    email: user.email,
    concern,
    category,
    startISO: new Date(startMs).toISOString(),
    endISO: new Date(endMs).toISOString(),
    timezone: config.timezone,
  });

  if (calendar) {
    await bookingRef.update({
      googleEvent: { ...calendar, createdAt: new Date().toISOString() },
      updatedAt: new Date().toISOString(),
    });
  }

  // Fire-and-forget: a mail problem must never fail a confirmed booking.
  await sendBookingEmails({
    bookingId: bookingRef.id,
    name: user.displayName,
    email: user.email,
    phone: user.phone,
    sessionLabel: sessionType.label,
    category,
    concern,
    startISO: new Date(startMs).toISOString(),
    endISO: new Date(endMs).toISOString(),
    timezone: config.timezone,
    meetLink: calendar?.meetLink ?? null,
  }).catch((error) => console.error("bookings: emails failed", error));

  await logActivity({
    type: "booking_created",
    message: `New booking — ${user.displayName}, ${formatDateInZone(
      startMs,
      config.timezone
    )} at ${formatTimeInZone(startMs, config.timezone)} (${sessionType.label})`,
    actor: user.displayName,
    source: "website",
    bookingId: bookingRef.id,
    clientId: clientId ?? undefined,
  });

  return NextResponse.json({
    id: bookingRef.id,
    startISO: new Date(startMs).toISOString(),
    endISO: new Date(endMs).toISOString(),
    date: formatDateInZone(startMs, config.timezone),
    time: formatTimeInZone(startMs, config.timezone),
    timezone: config.timezone,
    meetLink: calendar?.meetLink ?? null,
    calendarSynced: Boolean(calendar),
  });
}

async function addToCalendar(input: {
  sessionLabel: string;
  name: string;
  email: string;
  concern: string;
  category: string;
  startISO: string;
  endISO: string;
  timezone: string;
}) {
  try {
    return await createCalendarEvent({
      summary: `${input.sessionLabel} — ${input.name}`,
      // Deliberately brief: the calendar entry is not the clinical record.
      description: [
        `Client: ${input.name}`,
        `Email: ${input.email}`,
        input.category ? `Focus: ${input.category}` : "",
        "",
        "Booked via echoesofbeing.co.in",
      ]
        .filter(Boolean)
        .join("\n"),
      startISO: input.startISO,
      endISO: input.endISO,
      timezone: input.timezone,
      attendeeEmail: input.email,
      attendeeName: input.name,
    });
  } catch (error) {
    console.error("bookings: calendar sync failed", error);
    return null;
  }
}

/* ─────────────────────────  get / list  ──────────────────────────── */

async function handleGet(userId: string, bookingId: string) {
  if (!bookingId) {
    return NextResponse.json({ error: "Missing booking id." }, { status: 400 });
  }

  const snap = await adminDb.collection("bookings").doc(bookingId).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const booking = snap.data() as Record<string, unknown>;
  // Ownership check — a booking id alone must never be enough.
  if (booking.userId !== userId) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  return NextResponse.json({ booking: serialize(snap.id, booking) });
}

async function handleList(userId: string) {
  const snap = await adminDb
    .collection("bookings")
    .where("userId", "==", userId)
    .get();

  const bookings = snap.docs
    .map((d) => serialize(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => (b.startMs ?? 0) - (a.startMs ?? 0));

  return NextResponse.json({ bookings });
}

function serialize(id: string, booking: Record<string, unknown>) {
  const slot = booking.slot as
    | { startMs?: number; startISO?: string; endISO?: string; timezone?: string }
    | undefined;
  const googleEvent = booking.googleEvent as { meetLink?: string } | undefined;

  return {
    id,
    status: booking.status ?? "",
    sessionType: booking.sessionType ?? "",
    category: booking.category ?? "",
    concern: booking.concern ?? "",
    startMs: slot?.startMs,
    startISO: slot?.startISO ?? null,
    endISO: slot?.endISO ?? null,
    timezone: slot?.timezone ?? "Asia/Kolkata",
    meetLink: googleEvent?.meetLink ?? null,
    createdAt: booking.createdAt ?? "",
  };
}

/* ────────────────────────────  cancel  ───────────────────────────── */

async function handleCancel(userId: string, bookingId: string) {
  if (!bookingId) {
    return NextResponse.json({ error: "Missing booking id." }, { status: 400 });
  }

  const ref = adminDb.collection("bookings").doc(bookingId);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const booking = snap.data() as Record<string, unknown>;
  if (booking.userId !== userId) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (RELEASED_STATUSES.has(String(booking.status ?? ""))) {
    return NextResponse.json({ success: true, alreadyCancelled: true });
  }

  const slot = booking.slot as { startMs?: number } | undefined;
  const googleEvent = booking.googleEvent as { eventId?: string } | undefined;

  await ref.update({
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
    cancelledBy: "client",
    updatedAt: new Date().toISOString(),
  });

  // Release the slot so it becomes bookable again.
  if (typeof slot?.startMs === "number") {
    try {
      await adminDb.collection("slot_locks").doc(String(slot.startMs)).delete();
    } catch (error) {
      console.error("bookings: failed to release slot lock", error);
    }
  }

  if (googleEvent?.eventId) {
    await deleteCalendarEvent(googleEvent.eventId);
  }

  const startISO = (booking.slot as { startISO?: string } | undefined)?.startISO;
  const timezone =
    (booking.slot as { timezone?: string } | undefined)?.timezone ??
    "Asia/Kolkata";
  const whenLabel = startISO
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: timezone,
      }).format(new Date(startISO))
    : "unscheduled";

  if (startISO) {
    await sendCancellationEmails({
      name: String(booking.name ?? ""),
      email: String(booking.email ?? ""),
      sessionLabel: String(booking.sessionType ?? "Session"),
      startISO,
      timezone,
      cancelledBy: "client",
    }).catch((e) => console.error("bookings: cancellation emails failed", e));
  }

  await logActivity({
    type: "booking_cancelled",
    message: `Session cancelled by ${booking.name ?? "a client"} — ${whenLabel}`,
    actor: String(booking.name ?? "client"),
    source: "website",
    bookingId,
    clientId: booking.clientId ? String(booking.clientId) : undefined,
  });

  return NextResponse.json({ success: true });
}
