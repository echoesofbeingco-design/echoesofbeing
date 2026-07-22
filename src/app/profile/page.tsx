"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cancelBooking } from "@/lib/booking";
import { showToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useAuth } from "@/components/AuthProvider";
import {
  GENDER_OPTIONS,
  PRONOUN_OPTIONS,
  formatDateOfBirth,
  type BookingProfile,
} from "@/lib/profile-fields";

interface ProfileUser {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  pronouns: string;
  termsAcceptedAt: string | null;
  createdAt: string;
}

interface ProfileBooking {
  id: string;
  status: string;
  sessionType: string;
  category: string;
  startMs: number | null;
  startISO: string | null;
  timezone: string;
  meetLink: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  intake_submitted: "Intake submitted",
  slot_reserved: "Slot reserved",
  pending_payment: "Pending payment",
  payment_received: "Confirmed",
  session_completed: "Completed",
  cancelled: "Cancelled",
  no_show: "Missed",
};

const FIELD_LABELS: Record<string, string> = {
  phone: "WhatsApp number",
  dateOfBirth: "date of birth",
  gender: "gender",
  pronouns: "pronouns",
};

function formatWhen(startISO: string | null, timezone: string): string {
  if (!startISO) return "Time to be confirmed";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).format(new Date(startISO));
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-3 py-3 border-b border-border/60 last:border-0">
      <span className="text-xs font-semibold tracking-wider uppercase text-muted">
        {label}
      </span>
      <span className="text-sm text-forest">{value || "—"}</span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [bookings, setBookings] = useState<ProfileBooking[]>([]);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [needsTerms, setNeedsTerms] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [acceptingTerms, setAcceptingTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    pronouns: "",
  });

  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.status === 401) {
        router.push("/auth/login?redirect=/profile");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setBookings(data.bookings ?? []);
      setMissingFields(data.missingFields ?? []);
      setNeedsTerms(Boolean(data.needsTerms));
      setForm({
        displayName: data.user.displayName ?? "",
        phone: data.user.phone ?? "",
        dateOfBirth: data.user.dateOfBirth ?? "",
        gender: data.user.gender ?? "",
        pronouns: data.user.pronouns ?? "",
      });
      // Existing accounts missing details land straight in the editor.
      if ((data.missingFields ?? []).length > 0) setEditing(true);
    } catch {
      showToast("Could not load your profile.", "error");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Could not save.", "error");
        return;
      }
      showToast("Your details have been updated.", "success");
      setEditing(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function doCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelTarget);
      showToast("Session cancelled.", "success");
      setCancelTarget(null);
      await load();
    } catch (error) {
      showToast((error as Error).message, "error");
    } finally {
      setCancelling(false);
    }
  }

  async function doDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: deletePassword,
          confirm: deleteConfirm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Could not delete your account.", "error");
        setConfirmDelete(false);
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  async function handleAcceptTerms() {
    setAcceptingTerms(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptTerms: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Could not record your acceptance.", "error");
        return;
      }
      showToast("Thank you. That's recorded.", "success");
      setTermsChecked(false);
      await load();
    } finally {
      setAcceptingTerms(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <section className="max-w-3xl mx-auto px-6 py-24">
        <p className="text-muted">Loading…</p>
      </section>
    );
  }

  if (!user) return null;

  const now = Date.now();
  const upcoming = bookings.filter(
    (b) => (b.startMs ?? 0) > now && b.status !== "cancelled"
  );
  const past = bookings.filter(
    (b) => (b.startMs ?? 0) <= now || b.status === "cancelled"
  );
  const incomplete = missingFields.length > 0;

  return (
    <>
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-4">
              Your account
            </span>
            <h1 className="display text-4xl md:text-5xl mb-3">
              Hello, {user.displayName.split(" ")[0]}.
            </h1>
            <p className="text-muted">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-pill-outline text-sm"
          >
            Sign out
          </button>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24 space-y-12">
        {/* Terms acceptance for accounts that predate consent capture */}
        {needsTerms && (
          <div className="rounded-[1.5rem] border border-sage-400 bg-secondary-bg/50 p-6">
            <h2 className="font-serif text-lg font-medium mb-2">
              Please review our terms
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-5">
              Your account was created before we introduced our current terms,
              so we need your agreement once before your next booking. We
              won&apos;t ask again unless they change materially.
            </p>
            <label className="flex items-start gap-3 cursor-pointer group mb-5">
              <input
                type="checkbox"
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border text-sage-600 focus:ring-sage-400/40 flex-shrink-0"
              />
              <span className="text-sm text-muted leading-relaxed group-hover:text-forest transition-colors">
                I have read and agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-sage-600 underline"
                >
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="text-sage-600 underline"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            <button
              onClick={handleAcceptTerms}
              disabled={!termsChecked || acceptingTerms}
              className="btn-pill disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {acceptingTerms ? "Saving…" : "I agree"}
            </button>
          </div>
        )}

        {/* Missing details prompt for older accounts */}
        {incomplete && (
          <div className="rounded-[1.5rem] border border-sage-400 bg-secondary-bg/50 p-6">
            <h2 className="font-serif text-lg font-medium mb-2">
              Please complete your details
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Before you can book, we need your{" "}
              {missingFields
                .map((f) => FIELD_LABELS[f] ?? f)
                .join(", ")
                .replace(/, ([^,]*)$/, " and $1")}
              . It only takes a moment, and we won&apos;t ask again.
            </p>
          </div>
        )}

        {/* Upcoming */}
        <div>
          <h2 className="display text-2xl mb-5">Upcoming sessions</h2>
          {upcoming.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border p-8">
              <p className="text-muted mb-5">
                You don&apos;t have any sessions booked.
              </p>
              <Link href="/book" className="btn-pill">
                Book a session
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((b) => (
                <div
                  key={b.id}
                  className="rounded-[1.5rem] border border-border p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <h3 className="font-serif text-lg font-medium">
                      {b.sessionType}
                    </h3>
                    <span className="text-xs px-3 py-1 rounded-full bg-accent-bg text-sage-700">
                      {STATUS_LABELS[b.status] ?? b.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted">
                    {formatWhen(b.startISO, b.timezone)} IST
                  </p>
                  {b.meetLink && (
                    <a
                      href={b.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-sm text-sage-600 underline break-all"
                    >
                      Join the session
                    </a>
                  )}
                  <div className="mt-5">
                    <button
                      onClick={() => setCancelTarget(b.id)}
                      className="text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      Cancel this session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div>
            <h2 className="display text-2xl mb-5">Past sessions</h2>
            <div className="space-y-3">
              {past.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border border-border px-5 py-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium">{b.sessionType}</p>
                    <p className="text-xs text-muted">
                      {formatWhen(b.startISO, b.timezone)}
                    </p>
                  </div>
                  <span className="text-xs text-muted">
                    {STATUS_LABELS[b.status] ?? b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details — view / edit */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="display text-2xl">Your details</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm px-5 py-2 rounded-full border border-border hover:bg-accent-bg transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {!editing ? (
            <div className="rounded-[1.5rem] border border-border p-6 md:p-8">
              <Row label="Name" value={user.displayName} />
              <Row label="Email" value={user.email} />
              <Row
                label="Date of birth"
                value={formatDateOfBirth(user.dateOfBirth)}
              />
              <Row
                label="WhatsApp number"
                value={user.phone ? `+91 ${user.phone}` : ""}
              />
              <Row label="Gender" value={user.gender} />
              <Row label="Pronouns" value={user.pronouns} />
              <Row
                label="Terms accepted"
                value={
                  user.termsAcceptedAt
                    ? new Intl.DateTimeFormat("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(new Date(user.termsAcceptedAt))
                    : ""
                }
              />
            </div>
          ) : (
            <form
              onSubmit={handleSave}
              className="rounded-[1.5rem] border border-border p-6 md:p-8 space-y-5"
            >
              <div>
                <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.displayName}
                  onChange={(e) =>
                    setForm({ ...form, displayName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                  WhatsApp number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-border bg-accent-bg/60 text-sm text-muted">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value.replace(/[^\d\s-]/g, ""),
                      })
                    }
                    placeholder="98765 43210"
                    className="flex-1 px-4 py-3 rounded-r-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                  Date of birth
                </label>
                {user.dateOfBirth ? (
                  <>
                    <input
                      type="text"
                      disabled
                      value={formatDateOfBirth(user.dateOfBirth)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-accent-bg/40 text-sm text-muted"
                    />
                    <p className="text-xs text-muted mt-1.5">
                      Email us if this needs correcting.
                    </p>
                  </>
                ) : (
                  <>
                    <input
                      type="date"
                      required
                      value={form.dateOfBirth}
                      onChange={(e) =>
                        setForm({ ...form, dateOfBirth: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 text-sm"
                    />
                    <p className="text-xs text-muted mt-1.5">
                      We work with adults aged 18 and above.
                    </p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                    Gender
                  </label>
                  <select
                    required
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 text-sm"
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                    Pronouns
                  </label>
                  <select
                    required
                    value={form.pronouns}
                    onChange={(e) =>
                      setForm({ ...form, pronouns: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 text-sm"
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {PRONOUN_OPTIONS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-xs text-muted">
                Your email address can&apos;t be changed here. Email us if it
                needs correcting.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-pill disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                {!incomplete && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setForm({
                        displayName: user.displayName,
                        phone: user.phone,
                        dateOfBirth: user.dateOfBirth,
                        gender: user.gender,
                        pronouns: user.pronouns,
                      });
                    }}
                    className="btn-pill-outline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Danger zone */}
        <div>
          <h2 className="display text-2xl mb-5">Delete your account</h2>
          <div className="rounded-[1.5rem] border border-red-200 bg-red-50/40 p-6 md:p-8">
            <p className="text-sm text-muted leading-relaxed mb-4">
              This removes your login and profile, and cancels any upcoming
              sessions. Please note that where you have already attended
              sessions, professional record-keeping rules require us to retain
              the clinical notes for the period set out in our{" "}
              <Link href="/privacy" className="text-sage-600 underline">
                Privacy Policy
              </Link>
              . Those records are detached from your login and are no longer
              used for any active purpose.
            </p>

            {!showDelete ? (
              <button
                onClick={() => setShowDelete(true)}
                className="text-sm px-5 py-2.5 rounded-full border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
              >
                Delete my account
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                    Your password
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-red-300/40 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                    Type DELETE to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-red-300/40 text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(true)}
                    disabled={
                      deleteConfirm !== "DELETE" || deletePassword.length === 0
                    }
                    className="text-sm px-5 py-2.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40"
                  >
                    Permanently delete
                  </button>
                  <button
                    onClick={() => setShowDelete(false)}
                    className="text-sm px-5 py-2.5 rounded-full border border-border hover:bg-accent-bg transition-colors"
                  >
                    Keep my account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={cancelTarget !== null}
        title="Cancel this session?"
        message="The time will be released for someone else, and the calendar invite will be removed. You can always book again."
        confirmLabel="Yes, cancel it"
        cancelLabel="Keep it"
        danger
        busy={cancelling}
        onConfirm={doCancel}
        onCancel={() => setCancelTarget(null)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your account?"
        message="This cannot be undone. Your login and profile will be removed and any upcoming sessions cancelled."
        confirmLabel="Delete permanently"
        cancelLabel="Go back"
        danger
        busy={deleting}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
