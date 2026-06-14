import { Resend } from "resend";

/**
 * Shared Resend client + sender identity, used by the email-sending routes
 * (booking notifications, OTP verification codes).
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "echoesofbeing.co@gmail.com";

const FROM_ADDRESS = process.env.EMAIL_FROM || "noreply@echoesofbeing.co.in";

export const FROM_EMAIL = `Echoes of Being <${FROM_ADDRESS}>`;

/** Email body for a 6-digit booking verification code. */
export function otpEmailHtml(code: string) {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #2d352d;">
      <h2 style="font-size: 22px; font-weight: 500; margin-bottom: 16px;">Confirm your booking</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #5a6055; margin-bottom: 24px;">
        Here is your verification code. Enter it on the booking page to confirm your email and continue.
      </p>
      <div style="text-align: center; margin: 8px 0 24px;">
        <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 10px; color: #2d352d; background: #f7f5ec; border: 1px solid #d1d2c7; border-radius: 12px; padding: 16px 24px;">
          ${code}
        </span>
      </div>
      <p style="font-size: 13px; color: #5a6055; margin-top: 8px; line-height: 1.5;">
        This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #d1d2c7; margin: 28px 0;" />
      <p style="font-size: 12px; color: #84a284;">Echoes of Being</p>
    </div>
  `;
}
