"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createBooking,
  updateBookingCalendly,
  sendEmailOtp,
  verifyEmailOtp,
} from "@/lib/booking";
import { showToast } from "@/components/Toast";

type Step = "form" | "verify" | "calendly" | "under18";

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL!;

/* ----------  Validation helpers  ---------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\d{10}$/;

/** Strip spaces, dashes, leading +91 / 0 */
function sanitizePhone(raw: string): string {
  return raw.replace(/[\s\-().]/g, "").replace(/^(\+91|91|0)/, "");
}

/* ----------  Rate-limit / spam helpers  ---------- */

const RATE_LIMIT_KEY = "eob_submit_ts";
const RATE_LIMIT_COOLDOWN = 60_000; // 1 minute between submissions
const HONEYPOT_FIELD = "website"; // invisible field bots will fill

function isRateLimited(): boolean {
  try {
    const last = Number(localStorage.getItem(RATE_LIMIT_KEY) || 0);
    return Date.now() - last < RATE_LIMIT_COOLDOWN;
  } catch {
    return false;
  }
}

function markSubmission() {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
  } catch {
    /* private browsing */
  }
}

/* ----------  Component  ---------- */

export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const calendlyContainerRef = useRef<HTMLDivElement>(null);
  const formStartTime = useRef(Date.now());

  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    age: "",
    gender: "",
    pronouns: "",
    sessionType: "",
    category: "",
    concern: "",
  });

  // Honeypot field — invisible to real users, bots auto-fill it
  const [genderOther, setGenderOther] = useState("");
  const [pronounsOther, setPronounsOther] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Email verification (OTP) state
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  /* ----------  Resend cooldown countdown  ---------- */

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  /* ----------  Validation  ---------- */

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!EMAIL_RE.test(form.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    const cleanPhone = sanitizePhone(form.whatsapp);
    if (!cleanPhone) {
      errors.whatsapp = "WhatsApp number is required.";
    } else if (!PHONE_RE.test(cleanPhone)) {
      errors.whatsapp = "Please enter a valid 10-digit mobile number.";
    }

    if (!form.age) {
      errors.age = "Age is required.";
    } else {
      const ageNum = Number(form.age);
      if (ageNum < 1 || ageNum > 120) errors.age = "Enter a valid age.";
    }

    if (!form.gender) {
      errors.gender = "Please select your gender.";
    } else if (form.gender === "Other" && !genderOther.trim()) {
      errors.gender = "Please specify your gender.";
    }
    if (!form.pronouns) {
      errors.pronouns = "Please select your pronouns.";
    } else if (form.pronouns === "Other" && !pronounsOther.trim()) {
      errors.pronouns = "Please specify your pronouns.";
    }
    if (!form.concern.trim())
      errors.concern = "Please let us know what brings you here.";
    if (!form.sessionType) errors.sessionType = "Please select a session type.";
    if (!form.category) errors.category = "Please select a category.";
    if (!agreedTerms)
      errors.terms = "Please accept the Terms & Conditions to continue.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  /* ----------  Submit  ---------- */

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot — bots fill this, real users don't see it
    if (honeypot) {
      showToast("Your booking has been submitted.", "success");
      return;
    }

    // Time-based spam check — form filled in under 3 seconds = bot
    if (Date.now() - formStartTime.current < 3000) {
      showToast("Please take a moment to fill out the form.", "info");
      return;
    }

    // Rate limit — 1 submission per minute
    if (isRateLimited()) {
      showToast(
        "You've already submitted recently. Please wait a minute before trying again.",
        "info"
      );
      return;
    }

    // Validate all fields
    if (!validateForm()) {
      showToast("Please fix the highlighted fields before continuing.", "error");
      const firstError = document.querySelector("[data-field-error]");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Under-18 gate — we only work with adults right now.
    if (Number(form.age) < 18) {
      setStep("under18");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    try {
      const cleanData = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        whatsapp: sanitizePhone(form.whatsapp),
        gender:
          form.gender === "Other" ? `Other: ${genderOther.trim()}` : form.gender,
        pronouns:
          form.pronouns === "Other"
            ? `Other: ${pronounsOther.trim()}`
            : form.pronouns,
        concern: form.concern.trim(),
        termsAccepted: true,
      };

      const id = await createBooking(cleanData);
      const { cooldownMs } = await sendEmailOtp(id, "client", cleanData.email);

      markSubmission();
      setBookingId(id);
      setOtpCode("");
      setOtpError("");
      setCooldown(Math.ceil((cooldownMs ?? 45000) / 1000));
      setStep("verify");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Booking error:", err);
      showToast(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  /* ----------  Email verification  ---------- */

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingId || otpCode.length !== 6) return;

    setVerifying(true);
    setOtpError("");
    try {
      await verifyEmailOtp(
        bookingId,
        "client",
        form.email.trim().toLowerCase(),
        otpCode
      );
      setStep("calendly");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setOtpError(
        err instanceof Error ? err.message : "Verification failed. Try again."
      );
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (!bookingId || cooldown > 0 || resending) return;
    setResending(true);
    setOtpError("");
    try {
      const { cooldownMs } = await sendEmailOtp(
        bookingId,
        "client",
        form.email.trim().toLowerCase()
      );
      setCooldown(Math.ceil((cooldownMs ?? 45000) / 1000));
      showToast("A new code is on its way.", "success");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not resend the code.";
      // If the server returned a cooldown, reflect it
      setOtpError(msg);
    } finally {
      setResending(false);
    }
  }

  /* ----------  Calendly  ---------- */

  const handleCalendlyEvent = useCallback(
    async (e: MessageEvent) => {
      if (e.data.event === "calendly.event_scheduled" && bookingId) {
        const payload = e.data.payload;
        await updateBookingCalendly(bookingId, {
          eventUri: payload.event?.uri || "",
          inviteeUri: payload.invitee?.uri || "",
        });
        router.push(`/book/consent?id=${bookingId}`);
      }
    },
    [bookingId, router]
  );

  useEffect(() => {
    window.addEventListener("message", handleCalendlyEvent);
    return () => window.removeEventListener("message", handleCalendlyEvent);
  }, [handleCalendlyEvent]);

  useEffect(() => {
    if (step !== "calendly" || !calendlyContainerRef.current) return;

    const container = calendlyContainerRef.current;
    container.innerHTML = "";

    const prefill = new URLSearchParams({
      name: form.name,
      email: form.email,
    });

    const widget = document.createElement("div");
    widget.className = "calendly-inline-widget";
    widget.dataset.url = `${CALENDLY_URL}?${prefill.toString()}&hide_gdpr_banner=1`;
    widget.style.minWidth = "320px";
    widget.style.height = "700px";
    container.appendChild(widget);

    if (!document.querySelector('script[src*="calendly.com"]')) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.head.appendChild(script);
    } else {
      // @ts-expect-error Calendly global
      window.Calendly?.initInlineWidget?.({
        url: `${CALENDLY_URL}?${prefill.toString()}&hide_gdpr_banner=1`,
        parentElement: container,
      });
    }
  }, [step, form.name, form.email]);

  /* ----------  Inline error helper  ---------- */

  function FieldError({ field }: { field: string }) {
    const msg = fieldErrors[field];
    if (!msg) return null;
    return (
      <p data-field-error className="text-xs text-red-500 mt-1.5">
        {msg}
      </p>
    );
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-lg border bg-cream-light focus:outline-none focus:ring-2 transition-shadow duration-300 text-sm ${
      fieldErrors[field]
        ? "border-red-400 focus:ring-red-300/40"
        : "border-border focus:ring-sage-400/40"
    }`;

  /* ----------  Render: Under-18 notice  ---------- */

  if (step === "under18") {
    return (
      <section className="max-w-2xl mx-auto px-6 pt-16 pb-24">
        <button
          onClick={() => setStep("form")}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-sage-600 transition-colors duration-300 mb-8"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to the form
        </button>

        <h1 className="display text-4xl md:text-5xl mb-6">
          Thank you for reaching out.
        </h1>

        <div className="space-y-5 text-muted leading-relaxed">
          <p>
            Right now I work with adults aged eighteen and above, so I am not
            able to take this booking just yet. Support for younger people is
            something we hope to bring to Echoes of Being before long, so please
            do check back with us.
          </p>
          <p>
            In the meantime, please do not let this stop you from finding
            support, because it is out there and you deserve it. It can really
            help to talk to a trusted adult. There are also services in India
            made especially for young people, with people trained to listen.
          </p>

          <div className="bg-accent-bg/50 rounded-2xl p-6 space-y-4 my-2">
            <div>
              <p className="text-forest font-medium">
                Childline India:{" "}
                <a href="tel:1098" className="text-sage-700 underline">
                  1098
                </a>
              </p>
              <p className="text-sm">
                Available any time, free of cost.
              </p>
            </div>
            <div>
              <p className="text-forest font-medium">
                Tele MANAS (national mental health helpline):{" "}
                <a href="tel:14416" className="text-sage-700 underline">
                  14416
                </a>
              </p>
              <p className="text-sm">
                Free and available day and night.
              </p>
            </div>
          </div>

          <p>
            I hope you find the right space soon. And you are always welcome
            here, whether that is once you turn eighteen, or sooner if we are
            able to open this space up.
          </p>
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-sage-600 text-cream px-6 py-3 rounded-full text-sm font-medium hover:bg-sage-700 transition-colors duration-300"
          >
            Back to home
          </Link>
        </div>
      </section>
    );
  }

  /* ----------  Render: Verify step  ---------- */

  if (step === "verify") {
    return (
      <>
        <section className="max-w-md mx-auto px-6 pt-16 pb-4">
          <button
            onClick={() => setStep("form")}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-sage-600 transition-colors duration-300 mb-6"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Wrong email? Go back
          </button>
          <h1 className="display text-4xl md:text-5xl mb-3">
            Confirm your email.
          </h1>
          <p className="text-muted">
            We sent a 6-digit code to{" "}
            <span className="text-forest font-medium">{form.email}</span>. Enter
            it below to continue.
          </p>
        </section>

        <section className="max-w-md mx-auto px-6 pb-20">
          <form
            onSubmit={handleVerify}
            className="border border-border rounded-2xl p-8 space-y-5"
          >
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              value={otpCode}
              onChange={(e) => {
                setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setOtpError("");
              }}
              placeholder="000000"
              className={`w-full text-center tracking-[0.5em] text-2xl font-medium px-4 py-3.5 rounded-lg border bg-cream-light focus:outline-none focus:ring-2 transition-shadow duration-300 ${
                otpError
                  ? "border-red-400 focus:ring-red-300/40"
                  : "border-border focus:ring-sage-400/40"
              }`}
            />
            {otpError && <p className="text-xs text-red-500">{otpError}</p>}

            <button
              type="submit"
              disabled={verifying || otpCode.length !== 6}
              className="w-full bg-forest text-cream py-3.5 rounded-lg text-sm font-medium hover:bg-sage-700 hover:shadow-lg hover:shadow-sage-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? "Verifying..." : "Verify & continue"}
            </button>

            <div className="text-center text-sm text-muted">
              Didn&apos;t get it?{" "}
              {cooldown > 0 ? (
                <span>Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-sage-600 hover:text-sage-700 font-medium underline disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend code"}
                </button>
              )}
            </div>
          </form>
        </section>
      </>
    );
  }

  /* ----------  Render: Calendly step  ---------- */

  if (step === "calendly") {
    return (
      <>
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-4">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-4">
            Step 2 of 3
          </span>
          <h1 className="display text-4xl md:text-5xl mb-3">
            Choose a time.
          </h1>
          <p className="text-muted max-w-xl mb-2">
            Select a slot that works for you. This will temporarily reserve your
            spot on the calendar.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 pb-20">
          <div
            ref={calendlyContainerRef}
            className="rounded-2xl overflow-hidden border border-border"
          />
        </section>
      </>
    );
  }

  /* ----------  Render: Form step  ---------- */

  return (
    <>
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-8">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-4">
          Step 1 of 3
        </span>
        <h1 className="display text-4xl md:text-5xl mb-4">
          Tell us a little about yourself.
        </h1>
        <p className="text-muted max-w-xl">
          This helps us understand what brings you here before we meet.
          Everything you share is kept strictly confidential.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20">
        <form
          onSubmit={handleFormSubmit}
          className="border border-border rounded-2xl p-8 md:p-10 space-y-6"
          noValidate
        >
          {/* Honeypot — hidden from real users, bots will fill it */}
          <div
            className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden"
            aria-hidden="true"
          >
            <label>
              Website
              <input
                type="text"
                name={HONEYPOT_FIELD}
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                Full name <span className="text-sage-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Your name"
                className={inputClass("name")}
              />
              <FieldError field="name" />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                Email <span className="text-sage-500">*</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="you@example.com"
                className={inputClass("email")}
              />
              <FieldError field="email" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
              WhatsApp number <span className="text-sage-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-border bg-accent-bg/60 text-sm text-muted">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={14}
                value={form.whatsapp}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d\s-]/g, "");
                  updateField("whatsapp", val);
                }}
                placeholder="98765 43210"
                className={`flex-1 px-4 py-3 rounded-r-lg border bg-cream-light focus:outline-none focus:ring-2 transition-shadow duration-300 text-sm ${
                  fieldErrors.whatsapp
                    ? "border-red-400 focus:ring-red-300/40"
                    : "border-border focus:ring-sage-400/40"
                }`}
              />
            </div>
            <FieldError field="whatsapp" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                Age <span className="text-sage-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                max="120"
                value={form.age}
                onChange={(e) => updateField("age", e.target.value)}
                placeholder="Your age"
                className={inputClass("age")}
              />
              <FieldError field="age" />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                Gender <span className="text-sage-500">*</span>
              </label>
              <select
                required
                value={form.gender}
                onChange={(e) => {
                  updateField("gender", e.target.value);
                  if (e.target.value !== "Other") setGenderOther("");
                }}
                className={inputClass("gender")}
              >
                <option value="" disabled>
                  Select
                </option>
                <option>Female</option>
                <option>Male</option>
                <option>Transgender</option>
                <option>Non-binary</option>
                <option>Genderqueer</option>
                <option>Genderfluid</option>
                <option>Agender</option>
                <option>Other</option>
                <option>Rather not say</option>
              </select>
              {form.gender === "Other" && (
                <input
                  type="text"
                  value={genderOther}
                  onChange={(e) => setGenderOther(e.target.value)}
                  placeholder="Please specify"
                  className="mt-2 w-full px-4 py-2.5 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm"
                />
              )}
              <FieldError field="gender" />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                Pronouns <span className="text-sage-500">*</span>
              </label>
              <select
                required
                value={form.pronouns}
                onChange={(e) => {
                  updateField("pronouns", e.target.value);
                  if (e.target.value !== "Other") setPronounsOther("");
                }}
                className={inputClass("pronouns")}
              >
                <option value="" disabled>
                  Select
                </option>
                <option>She/Her</option>
                <option>He/Him</option>
                <option>They/Them</option>
                <option>She/They</option>
                <option>He/They</option>
                <option>Ze/Zir</option>
                <option>Any pronouns</option>
                <option>Other</option>
                <option>Rather not say</option>
              </select>
              {form.pronouns === "Other" && (
                <input
                  type="text"
                  value={pronounsOther}
                  onChange={(e) => setPronounsOther(e.target.value)}
                  placeholder="Please specify"
                  className="mt-2 w-full px-4 py-2.5 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm"
                />
              )}
              <FieldError field="pronouns" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
              What brings you here? <span className="text-sage-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              maxLength={2000}
              value={form.concern}
              onChange={(e) => updateField("concern", e.target.value)}
              placeholder="A few words about what you're going through, or any questions you have."
              className={`w-full px-4 py-3 rounded-lg border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm resize-y ${
                fieldErrors.concern ? "border-red-300" : "border-border"
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              <FieldError field="concern" />
              <p className="text-[11px] text-muted">{form.concern.length}/2000</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                Type of session <span className="text-sage-500">*</span>
              </label>
              <select
                required
                value={form.sessionType}
                onChange={(e) => updateField("sessionType", e.target.value)}
                className={inputClass("sessionType")}
              >
                <option value="" disabled>
                  Select session type
                </option>
                <option value="Introductory consultation">
                  Introductory consultation (Free)
                </option>
                <option value="Individual therapy">
                  Individual therapy (₹2,000)
                </option>
              </select>
              <FieldError field="sessionType" />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                What do you need help with?{" "}
                <span className="text-sage-500">*</span>
              </label>
              <select
                required
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className={inputClass("category")}
              >
                <option value="" disabled>
                  Select a category
                </option>
                <option>Relationships</option>
                <option>Loneliness</option>
                <option>Anxiety</option>
                <option>Depression</option>
                <option>Trauma</option>
                <option>Self-Esteem</option>
                <option>Women&apos;s Issues</option>
                <option>Other / Not sure</option>
              </select>
              <FieldError field="category" />
            </div>
          </div>

          {/* Terms acceptance */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => {
                  setAgreedTerms(e.target.checked);
                  if (e.target.checked && fieldErrors.terms) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.terms;
                      return next;
                    });
                  }
                }}
                className="mt-0.5 w-4 h-4 rounded border-border text-sage-600 focus:ring-sage-400/40 flex-shrink-0"
              />
              <span className="text-sm text-muted leading-relaxed group-hover:text-forest transition-colors duration-300">
                I have read and agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sage-600 underline hover:text-sage-700"
                >
                  Terms &amp; Conditions
                </a>{" "}
                and the practice&apos;s privacy practices.{" "}
                <span className="text-sage-500">*</span>
              </span>
            </label>
            <FieldError field="terms" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest text-cream py-3.5 rounded-lg text-sm font-medium hover:bg-sage-700 hover:shadow-lg hover:shadow-sage-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending verification code..." : "Continue"}
          </button>

          <p className="text-xs text-muted text-center leading-relaxed">
            We&apos;ll send a quick confirmation code to your email so we know
            it&apos;s really you. Your details stay private and are only ever
            used to arrange your session.
          </p>
        </form>
      </section>
    </>
  );
}
