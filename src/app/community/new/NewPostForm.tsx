"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { COMMUNITY_TOPICS } from "@/data/community-topics";
import TopicIcon from "@/components/TopicIcon";

export default function NewPostForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState("general");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, topic, isAnonymous }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create post");
        return;
      }

      router.push(`/community/${data.post._id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Topic */}
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-3">
          Topic
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMUNITY_TOPICS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTopic(t.value)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full transition-colors duration-200 ${
                topic === t.value
                  ? "bg-sage-600 text-cream"
                  : "bg-accent-bg text-muted hover:bg-secondary-bg"
              }`}
            >
              <TopicIcon icon={t.icon} className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          minLength={3}
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-cream-light border border-border rounded-xl px-4 py-3 text-forest focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow"
          placeholder="What's on your mind?"
        />
        <p className="text-xs text-muted mt-1 text-right">
          {title.length}/200
        </p>
      </div>

      {/* Body */}
      <div>
        <label
          htmlFor="body"
          className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2"
        >
          Your thoughts
        </label>
        <textarea
          id="body"
          required
          minLength={10}
          maxLength={5000}
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full bg-cream-light border border-border rounded-xl px-4 py-3 text-forest focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow resize-y leading-relaxed"
          placeholder="Take your time. There's no right or wrong way to share..."
        />
        <p className="text-xs text-muted mt-1 text-right">
          {body.length}/5000
        </p>
      </div>

      {/* Anonymous toggle */}
      <label className="flex items-center gap-3 cursor-pointer py-2">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="w-4 h-4 rounded border-border text-sage-600 focus:ring-sage-400/40"
        />
        <div>
          <span className="text-sm font-medium text-forest">
            Post anonymously
          </span>
          <p className="text-xs text-muted mt-0.5">
            Your name won&apos;t be shown on this post
          </p>
        </div>
      </label>

      {/* Community guidelines reminder */}
      <div className="bg-accent-bg/50 rounded-xl px-5 py-4 border border-border/50">
        <p className="text-xs text-muted leading-relaxed">
          <strong className="text-forest/80">Community guidelines:</strong> Be
          kind, respectful, and supportive. Offensive language, hate speech, and
          harmful content are not allowed and will be automatically removed.
          Read our{" "}
          <Link
            href="/terms#community-guidelines"
            className="text-sage-600 underline underline-offset-2"
          >
            full guidelines
          </Link>
          .
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-sage-600 text-cream px-8 py-3.5 rounded-full text-sm font-medium hover:bg-sage-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Posting..." : "Share"}
        </button>
        <Link
          href="/community"
          className="text-sm text-muted hover:text-sage-600 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
