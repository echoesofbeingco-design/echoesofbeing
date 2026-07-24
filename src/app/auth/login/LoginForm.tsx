"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refresh } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Set when the account exists but the practice created it and no password
  // has been chosen yet — we offer to send a fresh set-password link.
  const [needsPassword, setNeedsPassword] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const target = useCallback(() => {
    const t = searchParams.get("redirect");
    return t && t.startsWith("/") ? t : "/profile";
  }, [searchParams]);

  // The proxy no longer bounces signed-in visitors away from this page (doing
  // so risked a redirect loop against the server-side session check), so send
  // them on from here instead.
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(target());
    }
  }, [authLoading, user, router, target]);

  async function sendSetPasswordLink() {
    setSendingLink(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setLinkSent(true);
    } finally {
      setSendingLink(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNeedsPassword(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setNeedsPassword(data.code === "MUST_SET_PASSWORD");
        return;
      }

      await refresh();
      // Drop any RSC payloads cached while signed out — /book is prefetched
      // from the header, and replaying that cached redirect would land the
      // visitor straight back on this page.
      router.refresh();
      router.replace(target());
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          className={`text-sm rounded-xl px-4 py-3 ${
            needsPassword
              ? "bg-secondary-bg/60 border border-sage-400/40 text-forest"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <p>{error}</p>
          {needsPassword && !linkSent && (
            <button
              type="button"
              onClick={sendSetPasswordLink}
              disabled={sendingLink}
              className="mt-2 text-sage-600 hover:text-sage-700 font-medium underline disabled:opacity-50"
            >
              {sendingLink ? "Sending…" : "Email me a link to set it"}
            </button>
          )}
          {linkSent && (
            <p className="mt-2 text-forest">
              Sent. Check your inbox for a link to set your password.
            </p>
          )}
        </div>
      )}

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
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="password"
            className="text-xs font-semibold tracking-wider uppercase text-muted"
          >
            Password
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-sage-600 hover:text-sage-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-cream-light border border-border rounded-xl px-4 py-3 text-forest focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow"
          placeholder="Your password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sage-600 text-cream py-3.5 rounded-full text-sm font-medium hover:bg-sage-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Just a moment..." : "Continue"}
      </button>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-sage-600 hover:text-sage-700 font-medium transition-colors"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
