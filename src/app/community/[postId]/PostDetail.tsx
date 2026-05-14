"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { COMMUNITY_TOPICS } from "@/data/community-topics";
import TopicIcon from "@/components/TopicIcon";

interface Post {
  _id: string;
  authorId: string;
  authorName: string;
  isAnonymous: boolean;
  title: string;
  body: string;
  topic: string;
  upvoteCount: number;
  commentCount: number;
  hasUpvoted: boolean;
  createdAt: string;
}

interface Comment {
  _id: string;
  authorName: string;
  isAnonymous: boolean;
  body: string;
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
    year: "numeric",
  });
}

export default function PostDetail({ postId }: { postId: string }) {
  const router = useRouter();
  const { user } = useAuth();

  const INITIAL_COMMENTS = 3;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllComments, setShowAllComments] = useState(false);

  // Comment form
  const [commentBody, setCommentBody] = useState("");
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  // Report modal
  const [showReport, setShowReport] = useState<{
    type: "post" | "comment";
    id: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMsg, setReportMsg] = useState("");

  const fetchPost = useCallback(async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        fetch(`/api/community/posts/${postId}`),
        fetch(`/api/community/posts/${postId}/comments`),
      ]);
      const postData = await postRes.json();
      const commentsData = await commentsRes.json();

      if (!postRes.ok) {
        setPost(null);
      } else {
        setPost(postData.post);
      }
      setComments(commentsData.comments || []);
    } catch {
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  async function handleUpvote() {
    if (!user) {
      router.push(`/auth/login?redirect=/community/${postId}`);
      return;
    }
    if (!post) return;

    // Optimistic
    setPost((p) =>
      p
        ? {
            ...p,
            hasUpvoted: !p.hasUpvoted,
            upvoteCount: p.hasUpvoted
              ? p.upvoteCount - 1
              : p.upvoteCount + 1,
          }
        : p
    );

    try {
      await fetch(`/api/community/posts/${postId}/upvote`, { method: "POST" });
    } catch {
      fetchPost();
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    setCommentError("");
    if (!user) {
      router.push(`/auth/login?redirect=/community/${postId}`);
      return;
    }

    setCommentLoading(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: commentBody,
          isAnonymous: commentAnonymous,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCommentError(data.error || "Failed to add comment");
        return;
      }

      setCommentBody("");
      setCommentAnonymous(false);
      // Add to list optimistically
      setComments((prev) => [...prev, data.comment]);
      // Update comment count
      setPost((p) => (p ? { ...p, commentCount: p.commentCount + 1 } : p));
    } catch {
      setCommentError("Something went wrong");
    } finally {
      setCommentLoading(false);
    }
  }

  async function handleReport() {
    if (!showReport) return;
    setReportLoading(true);
    setReportMsg("");

    try {
      const url =
        showReport.type === "post"
          ? `/api/community/posts/${postId}/report`
          : `/api/community/posts/${postId}/comments/${showReport.id}/report`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason }),
      });
      const data = await res.json();

      if (!res.ok) {
        setReportMsg(data.error || "Failed to submit report");
      } else {
        setReportMsg("Report submitted. Thank you for keeping our community safe.");
        setTimeout(() => {
          setShowReport(null);
          setReportReason("");
          setReportMsg("");
        }, 2000);
      }
    } catch {
      setReportMsg("Something went wrong");
    } finally {
      setReportLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/community");
      }
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 animate-pulse">
        <div className="h-4 bg-secondary-bg rounded w-24 mb-6" />
        <div className="h-8 bg-secondary-bg rounded w-3/4 mb-4" />
        <div className="h-4 bg-secondary-bg rounded w-full mb-2" />
        <div className="h-4 bg-secondary-bg rounded w-2/3" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="font-serif text-2xl font-medium mb-3">
          Post not found
        </h1>
        <p className="text-muted mb-6">
          This post may have been removed by its author or our moderation team.
        </p>
        <Link
          href="/community"
          className="text-sm text-sage-600 hover:text-sage-700 font-medium transition-colors"
        >
          Back to community
        </Link>
      </div>
    );
  }

  const topicInfo = COMMUNITY_TOPICS.find((t) => t.value === post.topic);
  const isOwnPost = user && post.authorId === user.id;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 md:py-16">
      {/* Back link */}
      <Link
        href="/community"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-sage-600 cursor-pointer transition-colors duration-300 mb-8"
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
        Back to community
      </Link>

      {/* Post */}
      <article>
        {/* Topic + meta */}
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-sage-600 bg-accent-bg px-3 py-1.5 rounded-full">
            <TopicIcon icon={topicInfo?.icon || "chat"} className="w-3.5 h-3.5" />
            {topicInfo?.label || post.topic}
          </span>
          <span className="text-xs text-muted">{timeAgo(post.createdAt)}</span>
        </div>

        <h1 className="font-serif text-2xl md:text-3xl font-medium mb-4">
          {post.title}
        </h1>

        <p className="text-sm text-muted mb-6">
          by{" "}
          <span className="font-medium text-forest/80">
            {post.authorName}
          </span>
        </p>

        {/* Body */}
        <div className="text-forest/90 leading-relaxed whitespace-pre-wrap mb-8">
          {post.body}
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between py-4 border-t border-b border-border">
          <div className="flex items-center gap-5">
            {/* Upvote */}
            <button
              onClick={handleUpvote}
              className={`inline-flex items-center gap-2 text-sm transition-colors ${
                post.hasUpvoted
                  ? "text-sage-600 font-medium"
                  : "text-muted hover:text-sage-600"
              }`}
            >
              <svg
                className="w-5 h-5"
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
              {post.upvoteCount} {post.upvoteCount === 1 ? "heart" : "hearts"}
            </button>

            {/* Comment count */}
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <svg
                className="w-5 h-5"
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
              {comments.length}{" "}
              {comments.length === 1 ? "response" : "responses"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Report */}
            {user && !isOwnPost && (
              <button
                onClick={() => setShowReport({ type: "post", id: post._id })}
                className="text-xs text-muted hover:text-red-500 transition-colors"
              >
                Report
              </button>
            )}
            {/* Delete own post */}
            {isOwnPost && (
              <button
                onClick={handleDelete}
                className="text-xs text-muted hover:text-red-500 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Comments section */}
      <section id="comments" className="mt-10 scroll-mt-24">
        <h2 className="font-serif text-xl font-medium mb-6">Responses</h2>

        {/* Comment form */}
        {user ? (
          <form onSubmit={handleComment} className="mb-8">
            {commentError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                {commentError}
              </div>
            )}
            <textarea
              rows={3}
              required
              minLength={2}
              maxLength={2000}
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              className="w-full bg-cream-light border border-border rounded-xl px-4 py-3 text-forest text-sm focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow resize-y leading-relaxed mb-3"
              placeholder="Share a kind word or thought..."
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={commentAnonymous}
                  onChange={(e) => setCommentAnonymous(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-border text-sage-600 focus:ring-sage-400/40"
                />
                <span className="text-xs text-muted">Post anonymously</span>
              </label>
              <button
                type="submit"
                disabled={commentLoading}
                className="bg-sage-600 text-cream px-6 py-2.5 rounded-full text-xs font-medium hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentLoading ? "Sending..." : "Reply"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-accent-bg/40 rounded-xl px-5 py-4 mb-8 text-center">
            <p className="text-sm text-muted">
              <Link
                href={`/auth/login?redirect=/community/${postId}`}
                className="text-sage-600 hover:text-sage-700 font-medium"
              >
                Log in
              </Link>{" "}
              to share a response
            </p>
          </div>
        )}

        {/* Comments list */}
        {comments.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">
            No responses yet. Be the first to share a kind word.
          </p>
        ) : (
          <>
            <div className="space-y-0 divide-y divide-border">
              {(showAllComments
                ? comments
                : comments.slice(0, INITIAL_COMMENTS)
              ).map((comment) => (
                <div key={comment._id} className="py-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-forest/80">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-muted">
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>
                    {user && (
                      <button
                        onClick={() =>
                          setShowReport({ type: "comment", id: comment._id })
                        }
                        className="text-[11px] text-muted hover:text-red-500 transition-colors"
                      >
                        Report
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-forest/85 leading-relaxed whitespace-pre-wrap">
                    {comment.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Load more button */}
            {!showAllComments && comments.length > INITIAL_COMMENTS && (
              <button
                onClick={() => setShowAllComments(true)}
                className="mt-4 w-full py-3 text-sm text-sage-600 hover:text-sage-700 font-medium border border-border hover:border-sage-400/40 rounded-xl transition-colors duration-200"
              >
                View all {comments.length} responses
              </button>
            )}
          </>
        )}
      </section>

      {/* Report modal */}
      {showReport && (
        <div className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-cream rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-serif text-xl font-medium mb-2">
              Report {showReport.type}
            </h3>
            <p className="text-sm text-muted mb-5">
              Help us keep this space safe. Let us know why you&apos;re
              reporting this.
            </p>

            {reportMsg && (
              <div
                className={`text-sm rounded-xl px-4 py-3 mb-4 ${
                  reportMsg.includes("Thank you")
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {reportMsg}
              </div>
            )}

            <textarea
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-cream-light border border-border rounded-xl px-4 py-3 text-forest text-sm focus:outline-none focus:ring-2 focus:ring-sage-400/40 resize-none mb-4"
              placeholder="Please describe the issue (min 10 characters)..."
            />

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowReport(null);
                  setReportReason("");
                  setReportMsg("");
                }}
                className="text-sm text-muted hover:text-forest transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={reportLoading || reportReason.length < 10}
                className="bg-red-500 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reportLoading ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
