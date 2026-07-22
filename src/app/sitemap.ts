import type { MetadataRoute } from "next";
import { sanityClient } from "@/lib/sanity";
import { COMMUNITY_ENABLED } from "@/lib/features";

const BASE_URL = "https://www.echoesofbeing.co.in";

const SERVICE_SLUGS = [
  "relationships",
  "loneliness",
  "anxiety",
  "depression",
  "for-women",
  "trauma",
  "self-esteem",
];

export const dynamic = "force-dynamic";
export const revalidate = 3600; // regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all blog posts with their publish dates from Sanity
  const posts = await sanityClient.fetch<
    Array<{ slug: string; publishedAt: string }>
  >(`*[_type == "post"]{ "slug": slug.current, publishedAt } | order(publishedAt desc)`);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/echoes`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    // Community is hidden for now — only list it when the feature is enabled.
    ...(COMMUNITY_ENABLED
      ? [
          {
            url: `${BASE_URL}/community`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.6,
          },
        ]
      : []),
    {
      url: `${BASE_URL}/book`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Service pages
  const servicePages: MetadataRoute.Sitemap = SERVICE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Echoes post pages (dynamic — auto-updates as posts are published)
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/echoes/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...servicePages, ...blogPages];
}
