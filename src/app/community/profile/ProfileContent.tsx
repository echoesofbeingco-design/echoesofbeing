"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { COMMUNITY_TOPICS } from "@/data/community-topics";
import TopicIcon from "@/components/TopicIcon";

interface Post {
  _id: string;
  title: string;
  body: string;
  topic: string;
  isAnonymous: boolean;
  upvoteCount: number;
  commentCount: number;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function ProfileContent() {
  const router = useRouter();
  const { user, loading: authLoading, refresh, logout } = useAuth();

  // Posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Edit post state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editTopic, setEditTopic] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Display name
  const [displayName, setDisplayName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  // Password reset
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  // Logout confirmation
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const res = await fetch("/api/community/my-posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/community/profile");
      return;
    }
    if (user) {
      setDisplayName(user.displayName);
      fetchPosts();
    }
  }, [user, authLoading, router, fetchPosts]);

  // ── Edit post handlers ──
  function startEditing(post: Post) {
    setEditingId(post._id);
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditTopic(post.topic);
    setEditError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditError("");
  }

  async function saveEdit() {
    if (!editingId) return;
    setEditSaving(true);
    setEditError("");

    try {
      const res = await fetch(`/api/community/posts/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          body: editBody.trim(),
          topic: editTopic,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Failed to update");
        return;
      }

      // Update locally
      setPosts((prev) =>
        prev.map((p) =>
          p._id === editingId
            ? { ...p, title: editTitle.trim(), body: editBody.trim(), topic: editTopic }
            : p
        )
      );
      setEditingId(null);
    } catch {
      setEditError("Something went wrong");
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete post ──
  async function confirmDelete() {
    if (!deletingId) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/community/posts/${deletingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== deletingId));
      }
    } catch {
      // silently fail
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  }

  // ── Display name update ──
  async function handleNameUpdate(e: React.FormEvent) {
    e.preventDefault();
    setNameSaving(true);
    setNameError("");
    setNameSuccess(false);

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setNameError(data.error || "Failed to update");
        return;
      }

      setNameSuccess(true);
      await refresh();
      setTimeout(() => setNameSuccess(false), 3000);
    } catch {
      setNameError("Something went wrong");
    } finally {
      setNameSaving(false);
    }
  }

  // ── Password reset ──
  async function handlePasswordReset() {
    setResetSending(true);
    setResetError("");
    setResetSent(false);

    try {
      // We need the user's email — fetch from /api/auth/me which returns it
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      const email = meData.user?.email;

      if (!email) {
        setResetError("Could not find your email. Please try again.");
        return;
      }

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setResetSent(true);
        setMaskedEmail(data.maskedEmail || "your email");
      } else {
        setResetError(data.error || "Failed to send reset email");
      }
    } catch {
      setResetError("Something went wrong");
    } finally {
      setResetSending(false);
    }
  }

  // ── Logout ──
  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    router.push("/community");
  }

  // Loading / not logged in
  if (authLoading || !user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary-bg rounded w-48" />
          <div className="h-4 bg-secondary-bg rounded w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 md:py-14">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-full bg-sage-600/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-sage-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-medium text-forest">
              {user.displayName}
            </h1>
            <p className="text-sm text-muted">Your community profile</p>
          </div>
        </div>
      </div>

      {/* ── My Posts ── */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-medium text-forest">
            My Posts
          </h2>
          <Link
            href="/community/new"
            className="inline-flex items-center gap-2 text-sm text-sage-600 hover:text-sage-700 font-medium transition-colors"
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            New post
          </Link>
        </div>

        {postsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="border border-border rounded-2xl p-5 animate-pulse"
              >
                <div className="h-4 bg-secondary-bg rounded w-3/4 mb-3" />
                <div className="h-3 bg-secondary-bg rounded w-full mb-2" />
                <div className="h-3 bg-secondary-bg rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 border border-border border-dashed rounded-2xl">
            <p className="text-muted mb-3">You haven&apos;t shared anything yet.</p>
            <Link
              href="/community/new"
              className="inline-flex items-center gap-2 text-sm text-sage-600 hover:text-sage-700 font-medium transition-colors"
            >
              Share your first thought
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post._id}
                className="border border-border rounded-2xl p-5 hover:border-sage-400/40 transition-colors duration-200"
              >
                {editingId === post._id ? (
                  /* ── Inline edit form ── */
                  <div className="space-y-4">
                    {editError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">
                        {editError}
                      </div>
                    )}

                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-cream-light border border-border rounded-xl px-4 py-2.5 text-forest text-sm focus:outline-none focus:ring-2 focus:ring-sage-400/40"
                      placeholder="Title"
                    />

                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={4}
                      className="w-full bg-cream-light border border-border rounded-xl px-4 py-2.5 text-forest text-sm focus:outline-none focus:ring-2 focus:ring-sage-400/40 resize-none"
                      placeholder="Body"
                    />

                    {/* Topic select */}
                    <div className="flex flex-wrap gap-2">
                      {COMMUNITY_TOPICS.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setEditTopic(t.value)}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                            editTopic === t.value
                              ? "bg-sage-600 text-cream"
                              : "bg-accent-bg text-muted hover:bg-secondary-bg"
                          }`}
                        >
                          <TopicIcon icon={t.icon} className="w-3 h-3" />
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={saveEdit}
                        disabled={editSaving}
                        className="bg-sage-600 text-cream text-sm px-5 py-2 rounded-full hover:bg-sage-700 transition-colors disabled:opacity-50"
                      >
                        {editSaving ? "Saving..." : "Save changes"}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-sm text-muted hover:text-forest transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Normal display ── */
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-sage-600 bg-accent-bg px-2.5 py-1 rounded-full">
                        <TopicIcon
                          icon={
                            COMMUNITY_TOPICS.find((t) => t.value === post.topic)
                              ?.icon || "chat"
                          }
                          className="w-3 h-3"
                        />
                        {COMMUNITY_TOPICS.find((t) => t.value === post.topic)
                          ?.label || post.topic}
                      </span>
                      <span className="text-xs text-muted">
                        {timeAgo(post.createdAt)}
                      </span>
                      {post.isAnonymous && (
                        <span className="text-[11px] text-muted/60 italic">
                          posted anonymously
                        </span>
                      )}
                    </div>

                    <Link href={`/community/${post._id}`}>
                      <h3 className="font-serif text-lg font-medium mb-1.5 hover:text-sage-700 transition-colors">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-muted text-sm leading-relaxed mb-3 line-clamp-2">
                      {post.body}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted">
                        <span className="inline-flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                            />
                          </svg>
                          {post.upvoteCount}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                            />
                          </svg>
                          {post.commentCount}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(post)}
                          className="text-xs text-muted hover:text-sage-600 transition-colors p-1.5"
                          title="Edit"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeletingId(post._id)}
                          className="text-xs text-muted hover:text-red-500 transition-colors p-1.5"
                          title="Delete"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Account Settings ── */}
      <section className="border-t border-border pt-10">
        <h2 className="font-serif text-xl font-medium text-forest mb-6">
          Account Settings
        </h2>

        {/* Display name */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-muted mb-3">
            Display Name
          </h3>
          <form
            onSubmit={handleNameUpdate}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              minLength={2}
              maxLength={50}
              required
              className="flex-1 bg-cream-light border border-border rounded-xl px-4 py-2.5 text-forest text-sm focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow"
              placeholder="Your display name"
            />
            <button
              type="submit"
              disabled={nameSaving || displayName.trim() === user.displayName}
              className="bg-sage-600 text-cream text-sm px-6 py-2.5 rounded-full hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {nameSaving ? "Saving..." : "Update name"}
            </button>
          </form>
          {nameError && (
            <p className="text-sm text-red-600 mt-2">{nameError}</p>
          )}
          {nameSuccess && (
            <p className="text-sm text-sage-600 mt-2">
              Display name updated successfully
            </p>
          )}
        </div>

        {/* Password reset */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-muted mb-3">
            Password
          </h3>
          <p className="text-sm text-muted mb-3">
            We&apos;ll send a password reset link to your email address.
          </p>
          {resetSent ? (
            <div className="bg-sage-600/5 border border-sage-600/20 rounded-xl px-4 py-3">
              <p className="text-sm text-sage-700">
                Reset link sent to{" "}
                <span className="font-medium">{maskedEmail}</span>
              </p>
              <p className="text-xs text-muted mt-1">
                Check your inbox and spam folder. The link expires in 1 hour.
              </p>
            </div>
          ) : (
            <button
              onClick={handlePasswordReset}
              disabled={resetSending}
              className="text-sm text-sage-600 hover:text-sage-700 font-medium transition-colors disabled:opacity-50"
            >
              {resetSending ? "Sending..." : "Send password reset email"}
            </button>
          )}
          {resetError && (
            <p className="text-sm text-red-600 mt-2">{resetError}</p>
          )}
        </div>

        {/* Logout */}
        <div className="pt-6 border-t border-border">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-red-500 font-medium transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            Log out
          </button>
        </div>
      </section>

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-forest/30 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative bg-cream border border-border rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-xl">
            <h3 className="font-serif text-xl font-medium text-forest mb-2">
              Log out?
            </h3>
            <p className="text-sm text-muted mb-6">
              Are you sure you want to log out of your community account?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 bg-red-500 text-white text-sm py-2.5 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loggingOut ? "Logging out..." : "Yes, log out"}
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 border border-border text-forest text-sm py-2.5 rounded-full hover:bg-accent-bg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-forest/30 backdrop-blur-sm"
            onClick={() => setDeletingId(null)}
          />
          <div className="relative bg-cream border border-border rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-xl">
            <h3 className="font-serif text-xl font-medium text-forest mb-2">
              Delete post?
            </h3>
            <p className="text-sm text-muted mb-6">
              This action cannot be undone. The post will be permanently
              removed.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-500 text-white text-sm py-2.5 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 border border-border text-forest text-sm py-2.5 rounded-full hover:bg-accent-bg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
