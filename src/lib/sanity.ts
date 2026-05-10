import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "4rg0twm2",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: process.env.NODE_ENV === "production",
};

export const sanityClient = createClient({
  ...sanityConfig,
  token: process.env.SANITY_API_TOKEN,
});

// Image URL builder
const builder = createImageUrlBuilder(sanityClient);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source);
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface SanityPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  coverImage: {
    asset: { _ref: string };
    alt: string;
    hotspot?: { x: number; y: number };
  };
  categories: Array<{
    _id: string;
    title: string;
    slug: { current: string };
  }> | null;
  publishedAt: string;
  body: unknown[];
  estimatedReadTime?: number;
}

export interface SanityCategory {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
