"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenError, setTokenError] = useState("");
  // "invite" when the practice created the account for them.
  const [kind, setKind] = useState<"reset" | "invite">("reset");

  // Validate token on page load
  useEffect(() => {
    if (!token) {
      setValidating(false);
      return;
    }

    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.kind) setKind(data.kind);
        if (!data.valid) {
          setTokenError(data.error || "This reset link is invalid.");
        }
      })
      .catch(() => {
        setTokenError("Unable to verify reset link. Please try again.");
      })
      .finally(() => {
        setValidating(false);
      });
  }, [token]);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-muted">
          This reset link is invalid. Please request a new one.
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-block text-sm text-sage-600 hover:text-sage-700 font-medium transition-colors"
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (validating) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="w-8 h-8 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin mx-auto" />
        <p className="text-muted text-sm">Verifying reset link...</p>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="font-serif text-xl font-medium">Link expired</h2>
        <p className="text-muted text-sm">{tokenError}</p>
        <Link
          href="/auth/forgot-password"
          className="inline-block bg-sage-600 text-cream px-8 py-3 rounded-full text-sm font-medium hover:bg-sage-700 transition-colors duration-300 mt-2"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-accent-bg flex items-center justify-center">
          <svg
            className="w-8 h-8 text-sage-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="font-serif text-xl font-medium">Password updated</h2>
        <p className="text-muted text-sm">
          Your password has been reset successfully.
        </p>
        <Link
          href="/auth/login"
          className="inline-block bg-sage-600 text-cream px-8 py-3 rounded-full text-sm font-medium hover:bg-sage-700 transition-colors duration-300 mt-2"
        >
          Log in
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
          htmlFor="password"
          className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2"
        >
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-cream-light border border-border rounded-xl px-4 py-3 text-forest focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow"
          placeholder="Min 8 chars, 1 letter, 1 number, 1 special"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-cream-light border border-border rounded-xl px-4 py-3 text-forest focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow"
          placeholder="Re-enter your new password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sage-600 text-cream py-3.5 rounded-full text-sm font-medium hover:bg-sage-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : kind === "invite" ? "Set my password" : "Reset password"}
      </button>
    </form>
  );
}
