import type { Metadata } from "next";
import { requireSession } from "@/lib/require-session";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false },
};

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative check — the proxy only confirms a cookie exists.
  await requireSession("/profile");
  return children;
}
