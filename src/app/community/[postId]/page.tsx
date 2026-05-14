import type { Metadata } from "next";
import PostDetail from "./PostDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
    const res = await fetch(`${baseUrl}/api/community/posts/${postId}`, {
      cache: "no-store",
    });
    if (!res.ok) return { title: "Post Not Found | Echos of Being" };

    const data = await res.json();
    return {
      title: `${data.post.title} | Community — Echos of Being`,
      description: data.post.body.slice(0, 160),
    };
  } catch {
    return { title: "Community | Echos of Being" };
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  return <PostDetail postId={postId} />;
}
