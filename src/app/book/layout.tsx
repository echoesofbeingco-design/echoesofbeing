import type { Metadata } from "next";
import { requireSession } from "@/lib/require-session";

export const metadata: Metadata = {
  title: "Book a Session",
  description:
    "Schedule your therapy session with Echoes of Being. Choose a convenient time for a safe, confidential counselling session.",
  alternates: { canonical: "https://www.echoesofbeing.co.in/book" },
  openGraph: {
    title: "Book a Session | Echoes of Being",
    description:
      "Schedule your therapy session. Choose a convenient time for a safe, confidential counselling session.",
    type: "website",
  },
  robots: { index: false },
};

export default async function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative check — the proxy only confirms a cookie exists.
  await requireSession("/book");
  return children;
}
