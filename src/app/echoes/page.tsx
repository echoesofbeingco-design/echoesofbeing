import type { Metadata } from "next";
import { getPosts, getCategories } from "@/lib/sanity-queries";
import BlogListClient from "./BlogListClient";

export const metadata: Metadata = {
  title: "Echoes",
  description:
    "Short reflections on what it means to be human. Notes on mental health, therapy, relationships, and the quiet work of becoming yourself.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const category = params.category || "";
  const search = params.q || "";

  const [postsResult, categories] = await Promise.all([
    getPosts(page, 6, category || undefined, search || undefined),
    getCategories(),
  ]);

  return (
    <BlogListClient
      initialPosts={postsResult}
      categories={categories}
      initialSearch={search}
      initialCategory={category}
    />
  );
}
