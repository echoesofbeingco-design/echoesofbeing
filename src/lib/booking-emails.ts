import "server-only";
import { resend, ADMIN_EMAIL, FROM_EMAIL } from "@/lib/resend";
import { buildIcs } from "@/lib/ics";

/** Escape user-supplied text before putting it in an HTML email. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface BookingEmailInput {
  bookingId: string;
  name: string;
  email: string;
  phone?: string;
  sessionLabel: string;
  category?: string;
  concern?: string;
  startISO: string;
  endISO: string;
  timezone: string;
  meetLink?: string | null;
}

function whenLabel(startISO: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).format(new Date(startISO));
}

const shell = (body: string) => `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#faf8f3;padding:32px 16px;">
  <div style="max-width:520px;margin:0 auto;background:#fffdf8;border-radius:20px;padding:32px;">
    ${body}
    <p style="color:#8a8f88;font-size:12px;line-height:1.6;margin-top:28px;">
      Echoes of Being &middot; A counselling psychology practice
    </p>
  </div>
</div>`;

/**
 * Confirmation to the client (with an .ics attachment) and a heads-up to the
 * practice. Never throws — a mail failure must not fail the booking.
 */
export async function sendBookingEmails(
  input: BookingEmailInput
): Promise<void> {
  const when = whenLabel(input.startISO, input.timezone);

  const ics = buildIcs({
    uid: `booking-${input.bookingId}@echoesofbeing.co.in`,
    startISO: input.startISO,
    endISO: input.endISO,
    summary: `${input.sessionLabel} — Echoes of Being`,
    description: input.meetLink
      ? `Your session with Echoes of Being.\nJoin: ${input.meetLink}`
      : "Your session with Echoes of Being.",
    location: input.meetLink ?? "Online",
    organizerEmail: ADMIN_EMAIL,
    organizerName: "Echoes of Being",
    attendeeEmail: input.email,
    attendeeName: input.name,
  });

  const attachments = [
    {
      filename: "session.ics",
      content: Buffer.from(ics, "utf-8").toString("base64"),
    },
  ];

  const clientHtml = shell(`
    <h1 style="font-family:Georgia,serif;font-size:22px;color:#2d352d;margin:0 0 16px;">
      Your slot is reserved
    </h1>
    <p style="color:#5a615a;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Hi ${esc(input.name.split(" ")[0] || input.name)}, thank you for taking this step.
      Here are your session details.
    </p>
    <div style="background:#f2efe6;border-radius:14px;padding:18px;margin-bottom:20px;">
      <p style="margin:0 0 6px;color:#2d352d;font-size:15px;font-weight:600;">
        ${esc(input.sessionLabel)}
      </p>
      <p style="margin:0;color:#5a615a;font-size:14px;">${esc(when)} (IST)</p>
      ${
        input.meetLink
          ? `<p style="margin:12px 0 0;font-size:14px;">
               <a href="${esc(input.meetLink)}" style="color:#5c7a5c;">Join the session</a>
             </p>`
          : ""
      }
    </div>
    <p style="color:#5a615a;font-size:14px;line-height:1.7;margin:0 0 8px;">
      Your slot is held but not yet confirmed. We&rsquo;ll message you on WhatsApp
      with payment details, and your session is confirmed once payment is verified.
    </p>
    <p style="color:#5a615a;font-size:14px;line-height:1.7;margin:0;">
      The attached calendar file will add this to any calendar app.
    </p>
  `);

  const adminHtml = shell(`
    <h1 style="font-family:Georgia,serif;font-size:20px;color:#2d352d;margin:0 0 16px;">
      New booking — ${esc(input.name)}
    </h1>
    <table style="width:100%;font-size:14px;color:#5a615a;border-collapse:collapse;">
      <tr><td style="padding:6px 0;">When</td><td style="padding:6px 0;color:#2d352d;">${esc(when)} IST</td></tr>
      <tr><td style="padding:6px 0;">Session</td><td style="padding:6px 0;color:#2d352d;">${esc(input.sessionLabel)}</td></tr>
      <tr><td style="padding:6px 0;">Email</td><td style="padding:6px 0;color:#2d352d;">${esc(input.email)}</td></tr>
      <tr><td style="padding:6px 0;">WhatsApp</td><td style="padding:6px 0;color:#2d352d;">${esc(input.phone ?? "")}</td></tr>
      <tr><td style="padding:6px 0;">Focus</td><td style="padding:6px 0;color:#2d352d;">${esc(input.category ?? "")}</td></tr>
    </table>
    ${
      input.concern
        ? `<div style="background:#f2efe6;border-radius:14px;padding:16px;margin-top:16px;">
             <p style="margin:0;color:#5a615a;font-size:14px;line-height:1.7;white-space:pre-wrap;">${esc(input.concern)}</p>
           </div>`
        : ""
    }
  `);

  const results = await Promise.allSettled([
    resend.emails.send({
      from: FROM_EMAIL,
      to: input.email,
      subject: "Your slot is reserved | Echoes of Being",
      html: clientHtml,
      attachments,
    }),
    resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New booking: ${input.name}`,
      html: adminHtml,
      attachments,
    }),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("booking-emails: send failed", result.reason);
    }
  }
}

export interface CancellationEmailInput {
  name: string;
  email: string;
  sessionLabel: string;
  startISO: string;
  timezone: string;
  /** Who cancelled — shapes the wording for the client. */
  cancelledBy: "client" | "practice";
  reason?: string;
}

/**
 * Tell both sides a session was cancelled. Google also emails its own
 * cancellation when the calendar event is deleted, but that only reaches
 * Google Calendar users — this is the reliable one.
 */
export async function sendCancellationEmails(
  input: CancellationEmailInput
): Promise<void> {
  const when = whenLabel(input.startISO, input.timezone);
  const byPractice = input.cancelledBy === "practice";

  const clientHtml = shell(`
    <h1 style="font-family:Georgia,serif;font-size:22px;color:#2d352d;margin:0 0 16px;">
      Your session has been cancelled
    </h1>
    <p style="color:#5a615a;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Hi ${esc(input.name.split(" ")[0] || input.name)}, ${
        byPractice
          ? "we've had to cancel the session below. We're sorry for the disruption."
          : "this confirms the session below has been cancelled."
      }
    </p>
    <div style="background:#f2efe6;border-radius:14px;padding:18px;margin-bottom:20px;">
      <p style="margin:0 0 6px;color:#2d352d;font-size:15px;font-weight:600;">
        ${esc(input.sessionLabel)}
      </p>
      <p style="margin:0;color:#5a615a;font-size:14px;text-decoration:line-through;">
        ${esc(when)} (IST)
      </p>
    </div>
    ${
      input.reason
        ? `<p style="color:#5a615a;font-size:14px;line-height:1.7;margin:0 0 16px;">${esc(input.reason)}</p>`
        : ""
    }
    <p style="color:#5a615a;font-size:14px;line-height:1.7;margin:0;">
      The time has been released. Whenever you're ready, you can book another
      session from your account — there's no rush, and no need to explain.
    </p>
  `);

  const adminHtml = shell(`
    <h1 style="font-family:Georgia,serif;font-size:20px;color:#2d352d;margin:0 0 16px;">
      Session cancelled — ${esc(input.name)}
    </h1>
    <table style="width:100%;font-size:14px;color:#5a615a;border-collapse:collapse;">
      <tr><td style="padding:6px 0;">When</td><td style="padding:6px 0;color:#2d352d;">${esc(when)} IST</td></tr>
      <tr><td style="padding:6px 0;">Session</td><td style="padding:6px 0;color:#2d352d;">${esc(input.sessionLabel)}</td></tr>
      <tr><td style="padding:6px 0;">Email</td><td style="padding:6px 0;color:#2d352d;">${esc(input.email)}</td></tr>
      <tr><td style="padding:6px 0;">Cancelled by</td><td style="padding:6px 0;color:#2d352d;">${byPractice ? "the practice" : "the client"}</td></tr>
    </table>
    <p style="color:#5a615a;font-size:14px;line-height:1.7;margin:16px 0 0;">
      The slot has been released and the calendar event removed.
    </p>
  `);

  const results = await Promise.allSettled([
    resend.emails.send({
      from: FROM_EMAIL,
      to: input.email,
      subject: "Your session has been cancelled | Echoes of Being",
      html: clientHtml,
    }),
    resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Cancelled: ${input.name}`,
      html: adminHtml,
    }),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("booking-emails: cancellation send failed", result.reason);
    }
  }
}
