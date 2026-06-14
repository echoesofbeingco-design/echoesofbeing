import type { Metadata } from "next";

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

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
