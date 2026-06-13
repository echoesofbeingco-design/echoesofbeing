import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getRelatedPosts } from "@/lib/sanity-queries";
import { urlFor } from "@/lib/sanity";
import FadeImage from "@/components/FadeImage";
import PortableText from "@/components/PortableText";
import BlogCard from "@/components/BlogCard";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: "Post Not Found | Echoes of Being" };

  return {
    title: `${post.title} | Echoes of Being`,
    description: post.excerpt,
    alternates: { canonical: `https://www.echoesofbeing.co.in/echoes/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      images: post.coverImage?.asset
        ? [{ url: urlFor(post.coverImage).width(1200).height(630).url() }]
        : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const categorySlugs =
    post.categories?.map((c) => c.slug.current) || [];

  const relatedPosts = await getRelatedPosts(
    post.slug.current,
    categorySlugs,
    3
  );

  const date = new Date(post.publishedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const readTime = post.estimatedReadTime || 3;

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    image: post.coverImage?.asset
      ? urlFor(post.coverImage).width(1200).height(630).url()
      : undefined,
    author: {
      "@type": "Organization",
      name: "Echoes of Being",
    },
    publisher: {
      "@type": "Organization",
      name: "Echoes of Being",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
    },
  };

  return (
    <article>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero image — clean, no overlay ── */}
      {post.coverImage?.asset && (
        <div className="w-full">
          <div className="max-w-5xl mx-auto px-6 pt-8 md:pt-12">
            <div className="rounded-2xl overflow-hidden aspect-[2/1] md:aspect-[2.4/1] relative bg-secondary-bg">
              <FadeImage
                src={urlFor(post.coverImage)
                  .width(1400)
                  .height(600)
                  .quality(85)
                  .url()}
                alt={post.coverImage.alt || post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Header card overlapping the image ── */}
      <div className="max-w-3xl mx-auto px-6">
        <div
          className={`bg-cream relative z-10 rounded-2xl px-8 md:px-12 pt-10 pb-10 shadow-sm ${
            post.coverImage?.asset
              ? "-mt-16 md:-mt-20 border border-border/50"
              : "mt-10 md:mt-14"
          }`}
        >
          {/* Back link */}
          <Link
            href="/echoes"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-sage-600 transition-colors duration-300 mb-6"
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
            Back to Echoes
          </Link>

          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {post.categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/echoes?category=${cat.slug.current}`}
                  className="text-[11px] font-semibold tracking-wider uppercase text-sage-600 bg-secondary-bg/60 px-3 py-1.5 rounded-full hover:bg-secondary-bg transition-colors duration-200"
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] font-medium leading-tight mb-4">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-muted text-lg leading-relaxed mb-6 max-w-2xl">
            {post.excerpt}
          </p>

          {/* Divider + Meta */}
          <div className="flex items-center gap-4 text-sm text-muted pt-6 border-t border-border/60">
            <time dateTime={post.publishedAt}>{date}</time>
            <span className="w-1 h-1 rounded-full bg-sage-400" />
            <span>{readTime} min read</span>
          </div>
        </div>
      </div>

      {/* ── Body content ── */}
      <section className="max-w-3xl mx-auto px-6 py-16 md:py-20">
        <Reveal>
          {post.body && <PortableText value={post.body} />}
        </Reveal>

        {/* Closing divider */}
        <Reveal className="mt-16 pt-10 border-t border-border block">
          <p className="font-serif text-lg md:text-xl leading-relaxed text-forest/70 italic text-center">
            Thank you for reading. If this resonated with you, I&apos;d love to
            hear from you.
          </p>
        </Reveal>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal y={36} className="bg-sage-600 rounded-3xl py-14 md:py-16 px-6 text-center block">
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-cream mb-3">
              Let&apos;s begin a conversation
            </h2>
            <p className="text-cream/80 mb-8 max-w-md mx-auto text-sm">
              You don&apos;t need to have the right words. Just showing up is
              the first step.
            </p>
            <Link
              href="/book"
              className="group inline-flex items-center gap-2 bg-cream text-forest px-8 py-3.5 rounded-full text-sm font-medium hover:bg-cream-light hover:shadow-lg hover:shadow-black/10 transition-all duration-300"
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
          </Reveal>
        </div>
      </section>

      {/* ── Related posts ── */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-border bg-accent-bg/30">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <Reveal className="flex items-center gap-3 mb-10">
              <span className="w-8 h-px bg-sage-600" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted">
                Keep reading
              </span>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((related, i) => (
                <Reveal key={related._id} delay={(i % 3) * 90} className="h-full">
                  <BlogCard post={related} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
