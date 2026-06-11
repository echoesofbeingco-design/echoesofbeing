import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="w-8 h-px bg-sage-600" />
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted">
            Lost in thought
          </span>
          <span className="w-8 h-px bg-sage-600" />
        </div>

        <h1 className="font-serif text-6xl md:text-7xl font-medium text-sage-400 mb-4">
          404
        </h1>

        <p className="font-serif text-2xl md:text-3xl font-medium mb-4">
          This page doesn&apos;t exist.
        </p>

        <p className="text-muted leading-relaxed mb-10 max-w-md mx-auto">
          It&apos;s okay to lose your way sometimes. Let&apos;s help you find
          your way back.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/"
            className="group bg-sage-600 text-cream px-6 py-3 rounded-full text-sm font-medium hover:bg-sage-700 hover:shadow-lg hover:shadow-sage-600/20 transition-all duration-300 inline-flex items-center gap-2"
          >
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
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
            Go home
          </Link>
          <Link
            href="/book"
            className="group border border-sage-600 text-sage-600 px-6 py-3 rounded-full text-sm font-medium hover:bg-sage-600 hover:text-cream transition-all duration-300 inline-flex items-center gap-2"
          >
            Book a session
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
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
      </div>
    </section>
  );
}
