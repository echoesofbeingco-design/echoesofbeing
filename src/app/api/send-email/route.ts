import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "echoesofbeing.co@gmail.com";
const FROM_EMAIL = "Echos of Being <onboarding@resend.dev>";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, booking } = body;

    if (type === "slot_reserved") {
      await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          to: booking.email,
          subject: "Your slot has been reserved | Echos of Being",
          html: userSlotReservedEmail(booking),
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `New booking: ${booking.name}`,
          html: adminBookingEmail(booking),
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

function userSlotReservedEmail(booking: Record<string, unknown>) {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; color: #2d352d;">
      <div style="padding: 32px 24px; background: #f7f5ec; border-radius: 12px;">
        <h1 style="font-size: 22px; margin-bottom: 8px; color: #2d352d;">
          Your slot has been reserved.
        </h1>
        <p style="color: #617962; font-size: 14px; margin-bottom: 24px;">
          Echos of Being
        </p>
        <p style="font-size: 15px; line-height: 1.7; color: #5a6055;">
          Hi ${booking.name},
        </p>
        <p style="font-size: 15px; line-height: 1.7; color: #5a6055;">
          Thank you for taking this step. Your slot has been temporarily reserved.
          To finalize your session, please complete your payment. We will reach
          out to you on WhatsApp with payment details shortly.
        </p>
        <div style="background: #dce4d5; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
          <p style="margin: 0; font-size: 14px; color: #2d352d; font-weight: 600;">
            What happens next:
          </p>
          <ul style="margin: 8px 0 0; padding-left: 18px; font-size: 14px; color: #5a6055; line-height: 1.8;">
            <li>We will contact you on WhatsApp with payment details</li>
            <li>Complete your payment via UPI or bank transfer</li>
            <li>Once payment is verified, your session is confirmed</li>
            <li>Therapist and session details will be shared after verification</li>
          </ul>
        </div>
        <p style="font-size: 13px; color: #5a6055; line-height: 1.7;">
          If you have any questions, simply reply to this email or reach out on WhatsApp.
        </p>
        <p style="font-size: 13px; color: #5a6055; margin-top: 24px;">
          With care,<br/>
          Echos of Being
        </p>
      </div>
    </div>
  `;
}

function adminBookingEmail(booking: Record<string, unknown>) {
  const consent = (booking.consent as Record<string, unknown>) || {};
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; color: #2d352d;">
      <h2 style="margin-bottom: 16px;">New Booking: ${booking.name}</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #d1d2c7; font-weight: 600; background: #f7f5ec;">Name</td>
          <td style="padding: 8px 12px; border: 1px solid #d1d2c7;">${booking.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #d1d2c7; font-weight: 600; background: #f7f5ec;">Email</td>
          <td style="padding: 8px 12px; border: 1px solid #d1d2c7;">${booking.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #d1d2c7; font-weight: 600; background: #f7f5ec;">WhatsApp</td>
          <td style="padding: 8px 12px; border: 1px solid #d1d2c7;">${booking.whatsapp}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #d1d2c7; font-weight: 600; background: #f7f5ec;">Session Type</td>
          <td style="padding: 8px 12px; border: 1px solid #d1d2c7;">${booking.sessionType || "Not selected"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #d1d2c7; font-weight: 600; background: #f7f5ec;">Category</td>
          <td style="padding: 8px 12px; border: 1px solid #d1d2c7;">${booking.category || "Not selected"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #d1d2c7; font-weight: 600; background: #f7f5ec;">Concern</td>
          <td style="padding: 8px 12px; border: 1px solid #d1d2c7;">${booking.concern || "Not provided"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #d1d2c7; font-weight: 600; background: #f7f5ec;">Status</td>
          <td style="padding: 8px 12px; border: 1px solid #d1d2c7;">${booking.status}</td>
        </tr>
      </table>
      ${
        consent.paidSession !== undefined
          ? `
        <h3 style="margin-top: 20px;">Consent Responses</h3>
        <ul style="font-size: 14px; line-height: 1.8;">
          <li>Understands session is paid: ${consent.paidSession ? "Yes" : "No"}</li>
          <li>Understands confirmation after payment: ${consent.paymentFirst ? "Yes" : "No"}</li>
          <li>Communication consent (email/WhatsApp): ${consent.communicationConsent ? "Yes" : "No"}</li>
          ${consent.notes ? `<li>Additional notes: ${consent.notes}</li>` : ""}
        </ul>
      `
          : ""
      }
    </div>
  `;
}
