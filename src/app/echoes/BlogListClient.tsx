"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import Reveal from "@/components/Reveal";
import type { SanityPost, SanityCategory, PaginatedResult } from "@/lib/sanity";

interface Props {
  initialPosts: PaginatedResult<SanityPost>;
  categories: SanityCategory[];
  initialSearch: string;
  initialCategory: string;
}

export default function BlogListClient({
  initialPosts,
  categories,
  initialSearch,
  initialCategory,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Build URL and navigate
  const navigate = useCallback(
    (params: { q?: string; category?: string; page?: number }) => {
      const url = new URLSearchParams();
      if (params.q) url.set("q", params.q);
      if (params.category) url.set("category", params.category);
      if (params.page && params.page > 1) url.set("page", String(params.page));
      const qs = url.toString();
      router.push(`/echoes${qs ? `?${qs}` : ""}`);
    },
    [router]
  );

  // Debounced search
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      navigate({ q: search, category: activeCategory, page: 1 });
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, activeCategory, navigate]);

  // Sync state when server re-renders with new searchParams
  useEffect(() => {
    setPosts(initialPosts);
    setLoading(false);
  }, [initialPosts]);

  const currentPage = parseInt(searchParams.get("page") || "1", 10) || 1;

  function handleCategoryClick(slug: string) {
    setActiveCategory(slug === activeCategory ? "" : slug);
  }

  function handlePageChange(page: number) {
    setLoading(true);
    navigate({ q: search, category: activeCategory, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10 md:pt-20 md:pb-12">
        <Reveal>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-sage-600" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted">
              Journal
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-4">
            Echoes
          </h1>
          <p className="text-muted max-w-xl leading-relaxed">
            Short reflections on what it means to be human.
          </p>
        </Reveal>
      </section>

      {/* Search & Filters */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search input */}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-11 pr-4 py-3 rounded-full border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 focus:border-sage-400 text-sm transition-all duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-forest transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setActiveCategory("")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !activeCategory
                  ? "bg-sage-600 text-cream shadow-sm"
                  : "bg-accent-bg text-muted hover:bg-secondary-bg hover:text-forest"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryClick(cat.slug.current)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.slug.current
                    ? "bg-sage-600 text-cream shadow-sm"
                    : "bg-accent-bg text-muted hover:bg-secondary-bg hover:text-forest"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Posts grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] bg-accent-bg rounded-2xl mb-4" />
                <div className="h-4 bg-accent-bg rounded w-1/4 mb-3" />
                <div className="h-6 bg-accent-bg rounded w-3/4 mb-2" />
                <div className="h-4 bg-accent-bg rounded w-full" />
              </div>
            ))}
          </div>
        ) : posts.items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-accent-bg flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-medium mb-2">No posts found</h3>
            <p className="text-muted text-sm">
              {search
                ? "Try adjusting your search or removing filters."
                : "Posts will appear here once published."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.items.map((post, i) => (
                <Reveal key={post._id} delay={(i % 3) * 90} className="h-full">
                  <BlogCard post={post} />
                </Reveal>
              ))}
            </div>

            {/* Pagination */}
            {posts.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-14">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2.5 rounded-full border border-border hover:bg-accent-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                {Array.from({ length: posts.totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                        pageNum === currentPage
                          ? "bg-sage-600 text-cream shadow-sm"
                          : "text-muted hover:bg-accent-bg hover:text-forest"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= posts.totalPages}
                  className="p-2.5 rounded-full border border-border hover:bg-accent-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
