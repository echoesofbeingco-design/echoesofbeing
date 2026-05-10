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
    items,
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
  return post;
}

export async function getRelatedPosts(
  currentSlug: string,
  categorySlugs: string[],
  limit = 3
): Promise<SanityPost[]> {
  if (categorySlugs.length === 0) {
    // Just get latest posts excluding current
    return sanityClient.fetch<SanityPost[]>(
      `*[_type == "post" && slug.current != $currentSlug] | order(publishedAt desc) [0...${limit}] { ${postFields} }`,
      { currentSlug }
    );
  }

  return sanityClient.fetch<SanityPost[]>(
    `*[_type == "post" && slug.current != $currentSlug && count((categories[]->slug.current)[@ in $categorySlugs]) > 0] | order(publishedAt desc) [0...${limit}] { ${postFields} }`,
    { currentSlug, categorySlugs }
  );
}

export async function getAllPostSlugs(): Promise<string[]> {
  return sanityClient.fetch<string[]>(
    `*[_type == "post"].slug.current`
  );
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function getCategories(): Promise<SanityCategory[]> {
  return sanityClient.fetch<SanityCategory[]>(
    `*[_type == "category"] | order(title asc) { _id, title, slug, description }`
  );
}
