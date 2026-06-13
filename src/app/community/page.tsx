import type { Metadata } from "next";
import { Suspense } from "react";
import CommunityFeed from "./CommunityFeed";

export const metadata: Metadata = {
  title: "Community | Echoes of Being",
  description:
    "A safe space to share your thoughts, find support, and connect with others on their healing journey.",
};

export const dynamic = "force-dynamic";

export default function CommunityPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-accent-bg/40 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-14 md:py-20 text-center">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium mb-4">
            Community
          </h1>
          <p className="text-muted max-w-lg mx-auto leading-relaxed">
            A gentle space to share, reflect, and be heard. You are not alone
            in what you carry.
          </p>
        </div>
      </section>

      {/* Feed */}
      <Suspense
        fallback={
          <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-border rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-3 bg-secondary-bg rounded w-20 mb-3" />
                  <div className="h-5 bg-secondary-bg rounded w-3/4 mb-3" />
                  <div className="h-4 bg-secondary-bg rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <CommunityFeed />
      </Suspense>
    </>
  );
}
