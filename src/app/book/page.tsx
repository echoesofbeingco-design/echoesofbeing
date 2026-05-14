"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createBooking,
  updateBookingCalendly,
  uploadAadharImages,
  updateBookingAadhar,
  validateAadharFile,
} from "@/lib/booking";
import { showToast } from "@/components/Toast";

type Step = "form" | "calendly";

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
  const [aadharFront, setAadharFront] = useState<File | null>(null);
  const [aadharBack, setAadharBack] = useState<File | null>(null);
  const [fileErrors, setFileErrors] = useState<{
    front?: string;
    back?: string;
  }>({});
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

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
    if (!form.concern.trim()) errors.concern = "Please let us know what brings you here.";
    if (!form.sessionType) errors.sessionType = "Please select a session type.";
    if (!form.category) errors.category = "Please select a category.";

    if (!aadharFront || !aadharBack) {
      if (!aadharFront)
        setFileErrors((prev) => ({
          ...prev,
          front: "Please upload the front side.",
        }));
      if (!aadharBack)
        setFileErrors((prev) => ({
          ...prev,
          back: "Please upload the back side.",
        }));
    }

    setFieldErrors(errors);
    return (
      Object.keys(errors).length === 0 &&
      !!aadharFront &&
      !!aadharBack
    );
  }

  /* ----------  File handling  ---------- */

  function handleFileSelect(side: "front" | "back", file: File | null) {
    if (side === "front" && frontPreview) URL.revokeObjectURL(frontPreview);
    if (side === "back" && backPreview) URL.revokeObjectURL(backPreview);

    if (!file) {
      if (side === "front") {
        setAadharFront(null);
        setFrontPreview(null);
      } else {
        setAadharBack(null);
        setBackPreview(null);
      }
      setFileErrors((prev) => ({ ...prev, [side]: undefined }));
      return;
    }

    const error = validateAadharFile(file);
    if (error) {
      setFileErrors((prev) => ({ ...prev, [side]: error }));
      return;
    }

    setFileErrors((prev) => ({ ...prev, [side]: undefined }));
    const preview = URL.createObjectURL(file);
    if (side === "front") {
      setAadharFront(file);
      setFrontPreview(preview);
    } else {
      setAadharBack(file);
      setBackPreview(preview);
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /* ----------  Submit  ---------- */

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot — bots fill this, real users don't see it
    if (honeypot) {
      // Fake success so the bot doesn't retry
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
      // Scroll to first error
      const firstError = document.querySelector("[data-field-error]");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);
    try {
      // Normalize phone to 10 digits before saving
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
      };

      const id = await createBooking(cleanData);

      // Upload Aadhaar images to Cloudinary
      const aadharUrls = await uploadAadharImages(
        id,
        aadharFront!,
        aadharBack!
      );
      await updateBookingAadhar(id, aadharUrls);

      markSubmission();
      setBookingId(id);
      setStep("calendly");
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

  /* ----------  Render: Calendly step  ---------- */

  if (step === "calendly") {
    return (
      <>
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-4">
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
            Back to form
          </button>
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-4">
            Step 2 of 3
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-medium mb-3">
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
        <h1 className="font-serif text-3xl md:text-4xl font-medium mb-4">
          Tell us a little about yourself.
        </h1>
        <p className="text-muted max-w-xl">
          This helps us understand what brings you here before we meet. Everything
          you share is kept strictly confidential.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20">
        <form
          onSubmit={handleFormSubmit}
          className="border border-border rounded-2xl p-8 md:p-10 space-y-6"
          noValidate
        >
          {/* Honeypot — hidden from real users, bots will fill it */}
          <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
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
                  // Allow only digits, spaces, dashes
                  const val = e.target.value.replace(/[^\d\s\-]/g, "");
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
                <option value="" disabled>Select</option>
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
              <p className="text-[11px] text-muted">
                {form.concern.length}/2000
              </p>
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

          {/* Aadhaar upload */}
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase block mb-1">
              Aadhaar card <span className="text-sage-500">*</span>
            </label>
            <p className="text-xs text-muted mb-4">
              Upload clear images of the front and back. JPG, PNG, or WebP — max
              5 MB each.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Front side */}
              <div>
                {aadharFront && frontPreview ? (
                  <div className="relative rounded-lg border border-sage-400/50 overflow-hidden bg-cream-light">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={frontPreview}
                      alt="Aadhaar front"
                      className="w-full h-36 object-cover"
                    />
                    <div className="px-3 py-2 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">
                          Front side
                        </p>
                        <p className="text-[11px] text-muted">
                          {formatFileSize(aadharFront.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileSelect("front", null)}
                        className="text-muted hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                        aria-label="Remove front image"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 rounded-lg border-2 border-dashed border-border hover:border-sage-400/60 bg-cream-light cursor-pointer transition-colors duration-300">
                    <svg
                      className="w-8 h-8 text-sage-400 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <span className="text-xs font-medium text-sage-600">
                      Front side
                    </span>
                    <span className="text-[11px] text-muted mt-0.5">
                      Click to upload
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        handleFileSelect("front", e.target.files?.[0] || null)
                      }
                    />
                  </label>
                )}
                {fileErrors.front && (
                  <p data-field-error className="text-xs text-red-500 mt-1.5">
                    {fileErrors.front}
                  </p>
                )}
              </div>

              {/* Back side */}
              <div>
                {aadharBack && backPreview ? (
                  <div className="relative rounded-lg border border-sage-400/50 overflow-hidden bg-cream-light">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={backPreview}
                      alt="Aadhaar back"
                      className="w-full h-36 object-cover"
                    />
                    <div className="px-3 py-2 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">
                          Back side
                        </p>
                        <p className="text-[11px] text-muted">
                          {formatFileSize(aadharBack.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileSelect("back", null)}
                        className="text-muted hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                        aria-label="Remove back image"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 rounded-lg border-2 border-dashed border-border hover:border-sage-400/60 bg-cream-light cursor-pointer transition-colors duration-300">
                    <svg
                      className="w-8 h-8 text-sage-400 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <span className="text-xs font-medium text-sage-600">
                      Back side
                    </span>
                    <span className="text-[11px] text-muted mt-0.5">
                      Click to upload
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        handleFileSelect("back", e.target.files?.[0] || null)
                      }
                    />
                  </label>
                )}
                {fileErrors.back && (
                  <p data-field-error className="text-xs text-red-500 mt-1.5">
                    {fileErrors.back}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest text-cream py-3.5 rounded-lg text-sm font-medium hover:bg-sage-700 hover:shadow-lg hover:shadow-sage-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading & saving..." : "Continue to scheduling"}
          </button>

          <p className="text-xs text-muted text-center">
            Your information is kept strictly confidential and encrypted.
          </p>
        </form>
      </section>
    </>
  );
}
