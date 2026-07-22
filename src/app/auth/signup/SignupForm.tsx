"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

export default function SignupForm() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [under18, setUnder18] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreed) {
      setError(
        "Please accept the Terms & Conditions and Privacy Policy to continue."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          displayName,
          password,
          phone,
          dateOfBirth,
          gender,
          pronouns,
          acceptedTerms: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "UNDER_18") {
          setUnder18(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        setError(data.error || "Signup failed");
        return;
      }

      await refresh();
      // Drop RSC payloads cached while signed out, or the prefetched /book
      // redirect gets replayed and bounces them back here.
      router.refresh();
      // Send them onward to wherever they were headed (usually /book).
      const params = new URLSearchParams(window.location.search);
      const target = params.get("redirect");
      router.replace(target && target.startsWith("/") ? target : "/profile");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // We only work with adults, so this is a dead end — but a kind one, with
  // real places to turn.
  if (under18) {
    return (
      <div className="space-y-5">
        <h2 className="display text-2xl">Thank you for reaching out.</h2>
        <div className="space-y-4 text-sm text-muted leading-relaxed">
          <p>
            Right now we work with adults aged eighteen and above, so we are not
            able to open an account just yet. Support for younger people is
            something we hope to bring to Echoes of Being before long.
          </p>
          <p>
            Please don&apos;t let this stop you from finding support, because it
            is out there and you deserve it. It can really help to talk to a
            trusted adult. There are also services in India made especially for
            young people, with people trained to listen.
          </p>
          <div className="bg-accent-bg/50 rounded-2xl p-5 space-y-3">
            <p className="text-forest font-medium">
              Childline India:{" "}
              <a href="tel:1098" className="text-sage-700 underline">
                1098
              </a>
            </p>
            <p className="text-forest font-medium">
              Tele MANAS:{" "}
              <a href="tel:14416" className="text-sage-700 underline">
                14416
              </a>
            </p>
            <p className="text-xs">Both are free and available day and night.</p>
          </div>
        </div>
        <Link href="/" className="btn-pill">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="displayName"
          className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2"
        >
          Display name
        </label>
        <input
          id="displayName"
          type="text"
          required
          minLength={2}
          maxLength={50}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full bg-cream-light border border-border rounded-xl px-4 py-3 text-forest focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow"
          placeholder="How you'd like to be known"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-cream-light border border-border rounded-xl px-4 py-3 text-forest focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-cream-light border border-border rounded-xl px-4 py-3 pr-11 text-forest focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow"
            placeholder="Min 8 chars, 1 letter, 1 number, 1 special"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-forest transition-colors p-1"
            tabIndex={-1}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        <p className="text-xs text-muted mt-1.5">
          At least 8 characters with a letter, number, and special character
        </p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2"
        >
          Confirm password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-cream-light border border-border rounded-xl px-4 py-3 pr-11 text-forest focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow"
            placeholder="Re-enter your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-forest transition-colors p-1"
            tabIndex={-1}
          >
            <EyeIcon open={showConfirm} />
          </button>
        </div>
      </div>

      {/* Booking profile — collected once so we never ask again per booking */}
      <div>
        <label
          htmlFor="phone"
          className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2"
        >
          WhatsApp number
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-border bg-accent-bg/60 text-sm text-muted">
            +91
          </span>
          <input
            id="phone"
            type="tel"
            required
            maxLength={14}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d\s-]/g, ""))}
            className="flex-1 bg-cream-light border border-border rounded-r-xl px-4 py-3 text-forest focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow"
            placeholder="98765 43210"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="dateOfBirth"
          className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2"
        >
          Date of birth
        </label>
        <input
          id="dateOfBirth"
          type="date"
          required
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="w-full bg-cream-light border border-border rounded-xl px-4 py-3 text-forest focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow"
        />
        <p className="text-xs text-muted mt-1.5">
          We currently work with adults aged 18 and above.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="gender"
            className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2"
          >
            Gender
          </label>
          <select
            id="gender"
            required
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-cream-light border border-border rounded-xl px-4 py-3 text-forest focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow"
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
            <option>Rather not say</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="pronouns"
            className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2"
          >
            Pronouns
          </label>
          <select
            id="pronouns"
            required
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            className="w-full bg-cream-light border border-border rounded-xl px-4 py-3 text-forest focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow"
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
            <option>Rather not say</option>
          </select>
        </div>
      </div>

      {/* Terms agreement — captured once, here */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-border text-sage-600 focus:ring-sage-400/40"
        />
        <span className="text-sm text-muted leading-snug">
          I have read and agree to the{" "}
          <Link
            href="/terms"
            target="_blank"
            className="text-sage-600 hover:text-sage-700 underline underline-offset-2"
          >
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="text-sage-600 hover:text-sage-700 underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          . You won&apos;t be asked again at each booking.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sage-600 text-cream py-3.5 rounded-full text-sm font-medium hover:bg-sage-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Just a moment..." : "Continue"}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-sage-600 hover:text-sage-700 font-medium transition-colors"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
