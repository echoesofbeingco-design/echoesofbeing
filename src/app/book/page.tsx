"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBooking, updateBookingCalendly } from "@/lib/booking";

type Step = "form" | "calendly";

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL!;

export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const calendlyContainerRef = useRef<HTMLDivElement>(null);

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

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const id = await createBooking(form);
      setBookingId(id);
      setStep("calendly");
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
        >
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
                className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm"
              />
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
                className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
              WhatsApp number <span className="text-sage-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={form.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm"
            />
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
                className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                Gender <span className="text-sage-500">*</span>
              </label>
              <select
                required
                value={form.gender}
                onChange={(e) => updateField("gender", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm"
              >
                <option value="" disabled>Select</option>
                <option>Female</option>
                <option>Male</option>
                <option>Non-binary</option>
                <option>Genderqueer</option>
                <option>Genderfluid</option>
                <option>Agender</option>
                <option>Other</option>
                <option>Rather not say</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                Pronouns
              </label>
              <select
                value={form.pronouns}
                onChange={(e) => updateField("pronouns", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm"
              >
                <option value="">Select</option>
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
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
              What brings you here? (optional)
            </label>
            <textarea
              rows={4}
              value={form.concern}
              onChange={(e) => updateField("concern", e.target.value)}
              placeholder="A few words about what you're going through, or any questions you have."
              className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm resize-y"
            />
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
                className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm"
              >
                <option value="" disabled>Select session type</option>
                <option value="Introductory consultation">Introductory consultation (Free)</option>
                <option value="Individual therapy">Individual therapy (₹2,000)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                What do you need help with? <span className="text-sage-500">*</span>
              </label>
              <select
                required
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm"
              >
                <option value="" disabled>Select a category</option>
                <option>Relationships</option>
                <option>Loneliness</option>
                <option>Anxiety</option>
                <option>Depression</option>
                <option>Trauma</option>
                <option>Self-Esteem</option>
                <option>Women&apos;s Issues</option>
                <option>Other / Not sure</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest text-cream py-3.5 rounded-lg text-sm font-medium hover:bg-sage-700 hover:shadow-lg hover:shadow-sage-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Continue to scheduling"}
          </button>

          <p className="text-xs text-muted text-center">
            Your information is kept strictly confidential.
          </p>
        </form>
      </section>
    </>
  );
}
