"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { COMMUNITY_TOPICS } from "@/data/community-topics";
import TopicIcon from "@/components/TopicIcon";
import { getGreeting, getFollowUp } from "@/data/greetings";

interface PreviewComment {
  authorName: string;
  body: string;
  createdAt: string;
}

interface Post {
  _id: string;
  authorName: string;
  isAnonymous: boolean;
  title: string;
  body: string;
  topic: string;
  upvoteCount: number;
  commentCount: number;
  hasUpvoted: boolean;
  createdAt: string;
  previewComments: PreviewComment[];
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

export default function CommunityFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const activeTopic = searchParams.get("topic") || "all";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const searchQuery = searchParams.get("q") || "";

  const [search, setSearch] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", "10");
      if (activeTopic !== "all") params.set("topic", activeTopic);
      if (searchQuery) params.set("q", searchQuery);

      const res = await fetch(`/api/community/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTopic, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    // Reset to page 1 when filters change
    if (!("page" in updates)) params.delete("page");
    router.push(`/community?${params.toString()}`, { scroll: false });
  }

  function handleSearchInput(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ q: value || null, page: null });
    }, 400);
  }

  async function handleUpvote(postId: string) {
    if (!user) {
      router.push("/auth/login?redirect=/community");
      return;
    }

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              hasUpvoted: !p.hasUpvoted,
              upvoteCount: p.hasUpvoted
                ? p.upvoteCount - 1
                : p.upvoteCount + 1,
            }
          : p
      )
    );

    try {
      await fetch(`/api/community/posts/${postId}/upvote`, { method: "POST" });
    } catch {
      // Revert on failure
      fetchPosts();
    }
  }

  const topicLabel =
    COMMUNITY_TOPICS.find((t) => t.value === activeTopic)?.label || "All";

  // Memoize greeting so it doesn't change on every re-render
  const greeting = useMemo(() => getGreeting(), []);
  const followUp = useMemo(() => getFollowUp(), []);

  return (
    <section className="max-w-4xl mx-auto px-6 py-10 md:py-14">
      {/* Personalized greeting for logged-in users */}
      {user && (
        <div className="mb-10 pb-8 border-b border-border">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-forest mb-2">
            {greeting}, {user.displayName}
          </h2>
          <p className="text-muted text-sm md:text-base">{followUp}</p>
        </div>
      )}

      {/* Top bar: search + new post */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="w-full bg-cream-light border border-border rounded-full pl-11 pr-4 py-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow"
          />
        </div>

        {/* New post button */}
        <Link
          href={user ? "/community/new" : "/auth/login?redirect=/community/new"}
          className="inline-flex items-center justify-center gap-2 bg-sage-600 text-cream px-6 py-3 rounded-full text-sm font-medium hover:bg-sage-700 transition-colors duration-300 whitespace-nowrap"
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
          Share a thought
        </Link>
      </div>

      {/* Topic pills */}
      <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-border">
        <button
          onClick={() => updateParams({ topic: null })}
          className={`text-xs font-medium px-4 py-2 rounded-full transition-colors duration-200 ${
            activeTopic === "all"
              ? "bg-sage-600 text-cream"
              : "bg-accent-bg text-muted hover:bg-secondary-bg"
          }`}
        >
          All
        </button>
        {COMMUNITY_TOPICS.map((topic) => (
          <button
            key={topic.value}
            onClick={() => updateParams({ topic: topic.value })}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full transition-colors duration-200 ${
              activeTopic === topic.value
                ? "bg-sage-600 text-cream"
                : "bg-accent-bg text-muted hover:bg-secondary-bg"
            }`}
          >
            <TopicIcon icon={topic.icon} className="w-3.5 h-3.5" />
            {topic.label}
          </button>
        ))}
      </div>

      {/* Results info */}
      {searchQuery && (
        <p className="text-sm text-muted mb-6">
          Showing results for &ldquo;{searchQuery}&rdquo;
          {activeTopic !== "all" && ` in ${topicLabel}`}
        </p>
      )}

      {/* Posts list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border border-border rounded-2xl p-6 animate-pulse"
            >
              <div className="h-3 bg-secondary-bg rounded w-20 mb-3" />
              <div className="h-5 bg-secondary-bg rounded w-3/4 mb-3" />
              <div className="h-4 bg-secondary-bg rounded w-full mb-2" />
              <div className="h-4 bg-secondary-bg rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted mb-4">
            {searchQuery
              ? "No posts found for your search."
              : "No posts yet. Be the first to share."}
          </p>
          {!searchQuery && (
            <Link
              href={
                user
                  ? "/community/new"
                  : "/auth/login?redirect=/community/new"
              }
              className="inline-flex items-center gap-2 text-sm text-sage-600 hover:text-sage-700 font-medium transition-colors"
            >
              Share a thought
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
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <article
              key={post._id}
              className="border border-border rounded-2xl p-6 hover:border-sage-400/40 transition-colors duration-200"
            >
              {/* Topic badge + meta */}
              <div className="flex items-center gap-3 mb-3">
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
              </div>

              {/* Title */}
              <Link href={`/community/${post._id}`} className="cursor-pointer">
                <h2 className="font-serif text-xl font-medium mb-2 hover:text-sage-700 transition-colors cursor-pointer">
                  {post.title}
                </h2>
              </Link>

              {/* Body preview */}
              <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-3">
                {post.body}
              </p>

              {/* Footer: author + actions */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">
                  by{" "}
                  <span className="font-medium text-forest/80">
                    {post.authorName}
                  </span>
                </span>

                <div className="flex items-center gap-4">
                  {/* Upvote */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleUpvote(post._id);
                    }}
                    className={`inline-flex items-center gap-1.5 text-xs cursor-pointer transition-colors ${
                      post.hasUpvoted
                        ? "text-sage-600 font-medium"
                        : "text-muted hover:text-sage-600"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill={post.hasUpvoted ? "currentColor" : "none"}
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
                  </button>

                  {/* Comments count */}
                  <Link
                    href={`/community/${post._id}`}
                    className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-sage-600 cursor-pointer transition-colors"
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
                        d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                      />
                    </svg>
                    {post.commentCount}
                  </Link>

                  {/* Reply button */}
                  <Link
                    href={`/community/${post._id}#comments`}
                    className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-sage-600 cursor-pointer transition-colors"
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
                        d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                      />
                    </svg>
                    Reply
                  </Link>
                </div>
              </div>

              {/* Preview comments */}
              {post.previewComments && post.previewComments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/60 space-y-3">
                  {post.previewComments.map((comment, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-sage-600/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                        <svg
                          className="w-3 h-3 text-sage-600/60"
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
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium text-forest/70">
                            {comment.authorName}
                          </span>
                          <span className="text-[11px] text-muted/60">
                            {timeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed line-clamp-2">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  ))}

                  {post.commentCount > 2 && (
                    <Link
                      href={`/community/${post._id}`}
                      className="block text-xs text-sage-600 hover:text-sage-700 font-medium cursor-pointer transition-colors pt-1"
                    >
                      View all {post.commentCount} responses
                    </Link>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10 pt-8 border-t border-border">
          <button
            disabled={currentPage <= 1}
            onClick={() =>
              updateParams({ page: String(currentPage - 1) })
            }
            className="text-sm text-muted hover:text-sage-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() =>
              updateParams({ page: String(currentPage + 1) })
            }
            className="text-sm text-muted hover:text-sage-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
