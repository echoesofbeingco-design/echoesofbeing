import "server-only";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Creates session events on the practice's Google Calendar.
 *
 * The OAuth *connection* is made once from the admin dashboard; the refresh
 * token it stores in Firestore (`config/google`) is shared, so this app only
 * needs GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET to mint access tokens.
 *
 * Every function degrades gracefully — a calendar problem must never stop
 * someone booking therapy, so callers get null and the booking still stands.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const EVENTS_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

interface GoogleConnection {
  connected?: boolean;
  refreshToken?: string;
}

function getCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

async function getAccessToken(): Promise<string | null> {
  const creds = getCredentials();
  if (!creds) return null;

  try {
    const snap = await adminDb.collection("config").doc("google").get();
    if (!snap.exists) return null;
    const connection = snap.data() as GoogleConnection;
    if (!connection.connected || !connection.refreshToken) return null;

    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        refresh_token: connection.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const data = (await res.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!res.ok || !data.access_token) {
      console.error(
        "google-calendar: token refresh failed",
        data.error_description || data.error
      );
      return null;
    }
    return data.access_token;
  } catch (error) {
    console.error("google-calendar: token refresh threw", error);
    return null;
  }
}

export interface CreateEventInput {
  summary: string;
  description?: string;
  startISO: string;
  endISO: string;
  timezone: string;
  attendeeEmail?: string;
  attendeeName?: string;
}

export interface CreatedEvent {
  eventId: string;
  htmlLink?: string;
  meetLink?: string;
}

/**
 * Create the session on the practice calendar with a Meet link, inviting the
 * client so Google emails them an invite that lands in their own calendar.
 */
export async function createCalendarEvent(
  input: CreateEventInput
): Promise<CreatedEvent | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const body: Record<string, unknown> = {
    summary: input.summary,
    description: input.description ?? "",
    start: { dateTime: input.startISO, timeZone: input.timezone },
    end: { dateTime: input.endISO, timeZone: input.timezone },
    reminders: { useDefault: true },
    conferenceData: {
      createRequest: {
        requestId: `eob-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  if (input.attendeeEmail) {
    body.attendees = [
      { email: input.attendeeEmail, displayName: input.attendeeName },
    ];
  }

  try {
    const params = new URLSearchParams({
      conferenceDataVersion: "1",
      sendUpdates: "all",
    });
    const res = await fetch(`${EVENTS_URL}?${params.toString()}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as {
      id?: string;
      htmlLink?: string;
      hangoutLink?: string;
      error?: { message?: string };
    };

    if (!res.ok || !data.id) {
      console.error(
        "google-calendar: create event failed",
        data.error?.message ?? data
      );
      return null;
    }

    return {
      eventId: data.id,
      htmlLink: data.htmlLink,
      meetLink: data.hangoutLink,
    };
  } catch (error) {
    console.error("google-calendar: create event threw", error);
    return null;
  }
}

/** Remove a session from the calendar, notifying the attendee. */
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const accessToken = await getAccessToken();
  if (!accessToken) return false;

  try {
    const res = await fetch(
      `${EVENTS_URL}/${encodeURIComponent(eventId)}?sendUpdates=all`,
      { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return res.ok || res.status === 410; // 410 = already gone
  } catch (error) {
    console.error("google-calendar: delete event threw", error);
    return false;
  }
}
