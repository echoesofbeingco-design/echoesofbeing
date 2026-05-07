"use client";

import { useState } from "react";

const timeSlots = ["09:00", "10:30", "12:00", "15:00", "16:30", "18:00"];

export default function BookPage() {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [format, setFormat] = useState<"Online" | "In-person">("Online");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-28 text-center">
        <div className="w-16 h-16 rounded-full bg-sage-600/10 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-sage-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-medium mb-4">
          Request received.
        </h1>
        <p className="text-muted leading-relaxed">
          Thank you for reaching out. I&apos;ll confirm your session by email
          within one working day.
        </p>
      </section>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-8">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-4">
          Book a session
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-medium mb-4">
          Choose a time that feels right.
        </h1>
        <p className="text-muted max-w-xl">
          Submit a request and I&apos;ll confirm by email within one working
          day. Payment details are shared with your confirmation.
        </p>
      </section>

      {/* Form */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <form
          onSubmit={handleSubmit}
          className="border border-border rounded-2xl p-8 md:p-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column */}
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                  Full name <span className="text-sage-500">*</span>
                </label>
                <input
                  type="text"
                  required
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
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                  Type of session <span className="text-sage-500">*</span>
                </label>
                <select
                  required
                  defaultValue="Individual therapy"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm"
                >
                  <option>Individual therapy</option>
                  <option>Introductory consultation</option>
                  <option>Couples session</option>
                  <option>Extended deep-dive</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                  Format <span className="text-sage-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["Online", "In-person"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      className={`py-3 rounded-lg border text-sm font-medium transition-all duration-300 ${
                        format === f
                          ? "border-sage-500 bg-sage-600/5 text-sage-600"
                          : "border-border text-muted hover:border-sage-400/50"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                  Preferred date <span className="text-sage-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                  Preferred time <span className="text-sage-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-lg border text-sm font-medium transition-all duration-300 ${
                        selectedTime === time
                          ? "border-sage-500 bg-sage-600/5 text-sage-600"
                          : "border-border text-muted hover:border-sage-400/50"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted mt-2">All times shown in IST.</p>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                  Anything you&apos;d like me to know? (optional)
                </label>
                <textarea
                  rows={5}
                  placeholder="A few words about what brings you in, or any questions you have."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm resize-y"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-forest text-cream py-3.5 rounded-lg text-sm font-medium hover:bg-sage-700 hover:shadow-lg hover:shadow-sage-600/20 transition-all duration-300"
              >
                Send request
              </button>

              <p className="text-xs text-muted text-center">
                Your information is kept strictly confidential.
              </p>
            </div>
          </div>
        </form>
      </section>
    </>
  );
}
