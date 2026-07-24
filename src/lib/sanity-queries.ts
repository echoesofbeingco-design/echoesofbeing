import { sanityClient } from "./sanity";
import type { SanityPost, SanityCategory, PaginatedResult } from "./sanity";

// ── Shared fragments ───────────────────────────────────────────────────────
const postFields = `
  _id,
  title,
  slug,
  excerpt,
  coverImage,
  publishedAt,
  categories[]->{ _id, title, slug },
  "estimatedReadTime": round(length(pt::text(body)) / 5 / 200)
`;

const postFieldsFull = `
  ${postFields},
  body
`;

/**
 * Strip category references that did not resolve.
 *
 * A `categories[]->` dereference yields null when the referenced document is
 * missing — deleted, or only ever saved as a draft. The raw shape is therefore
 * `(Category | null)[]`, and mapping it straight to `cat.title` took the whole
 * /echoes page down with a 500. Cleaning the data once here means every
 * consumer can trust the type it was already given.
 */
function cleanPost<T extends SanityPost | null>(post: T): T {
  if (!post) return post;
  const categories = Array.isArray(post.categories)
    ? post.categories.filter(
        (c): c is NonNullable<(typeof post.categories)[number]> =>
          Boolean(c) && Boolean(c?._id)
      )
    : [];
  return { ...post, categories } as T;
}

function cleanPosts(posts: SanityPost[]): SanityPost[] {
  return (posts ?? []).filter(Boolean).map((p) => cleanPost(p));
}

// ── Posts ───────────────────────────────────────────────────────────────────

export async function getPosts(
  page = 1,
  pageSize = 6,
  category?: string,
  search?: string
): Promise<PaginatedResult<SanityPost>> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  let filter = `_type == "post"`;

  if (category) {
    filter += ` && "${category}" in categories[]->slug.current`;
  }

  if (search) {
    // Sanity GROQ text search
    filter += ` && (title match "${search}*" || excerpt match "${search}*" || pt::text(body) match "${search}*")`;
  }

  const [items, total] = await Promise.all([
    sanityClient.fetch<SanityPost[]>(
      `*[${filter}] | order(publishedAt desc) [${start}...${end}] { ${postFields} }`
    ),
    sanityClient.fetch<number>(`count(*[${filter}])`),
  ]);

  return {
    items: cleanPosts(items),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  const post = await sanityClient.fetch<SanityPost | null>(
    `*[_type == "post" && slug.current == $slug][0] { ${postFieldsFull} }`,
    { slug }
  );
  return cleanPost(post);
}

export async function getRelatedPosts(
  currentSlug: string,
  categorySlugs: string[],
  limit = 3
): Promise<SanityPost[]> {
  if (categorySlugs.length === 0) {
    // Just get latest posts excluding current
    return cleanPosts(
      await sanityClient.fetch<SanityPost[]>(
        `*[_type == "post" && slug.current != $currentSlug] | order(publishedAt desc) [0...${limit}] { ${postFields} }`,
        { currentSlug }
      )
    );
  }

  return cleanPosts(
    await sanityClient.fetch<SanityPost[]>(
      `*[_type == "post" && slug.current != $currentSlug && count((categories[]->slug.current)[@ in $categorySlugs]) > 0] | order(publishedAt desc) [0...${limit}] { ${postFields} }`,
      { currentSlug, categorySlugs }
    )
  );
}

export async function getAllPostSlugs(): Promise<string[]> {
  return sanityClient.fetch<string[]>(
    `*[_type == "post"].slug.current`
  );
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function getCategories(): Promise<SanityCategory[]> {
  const cats = await sanityClient.fetch<SanityCategory[]>(
    `*[_type == "category"] | order(title asc) { _id, title, slug, description }`
  );
  // A category with no slug would break the filter links, so drop it.
  return (cats ?? []).filter((c) => c && c._id && c.slug?.current);
}
