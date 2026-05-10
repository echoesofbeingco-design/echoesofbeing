import Image from "next/image";
import Link from "next/link";
import { urlFor, type SanityPost } from "@/lib/sanity";

export default function BlogCard({ post }: { post: SanityPost }) {
  const date = new Date(post.publishedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const readTime = post.estimatedReadTime || 3;

  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className="group block"
    >
      <article className="border border-border rounded-2xl overflow-hidden bg-cream-light hover:shadow-lg hover:shadow-sage-400/10 transition-all duration-300">
        {/* Cover image */}
        <div className="relative overflow-hidden aspect-[16/10]">
          {post.coverImage?.asset && (
            <Image
              src={urlFor(post.coverImage).width(600).height(375).quality(80).url()}
              alt={post.coverImage.alt || post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.categories.map((cat) => (
                <span
                  key={cat._id}
                  className="text-[11px] font-semibold tracking-wider uppercase text-sage-600 bg-secondary-bg/60 px-2.5 py-1 rounded-full"
                >
                  {cat.title}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="font-serif text-lg sm:text-xl font-medium leading-snug mb-2 group-hover:text-sage-600 transition-colors duration-300 line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-2">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted">
            <time dateTime={post.publishedAt}>{date}</time>
            <span className="w-1 h-1 rounded-full bg-sage-400" />
            <span>{readTime} min read</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
