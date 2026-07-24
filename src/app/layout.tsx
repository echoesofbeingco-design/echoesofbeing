import type { Metadata } from "next";
import { Suspense } from "react";
import { Lora, Nunito_Sans } from "next/font/google";
import "./globals.css";
import TopLoader from "@/components/TopLoader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Analytics from "@/components/Analytics";
import PreloadImages from "@/components/PreloadImages";
import ToastProvider from "@/components/Toast";
import { AuthProvider } from "@/components/AuthProvider";
import FloatingBookBtn from "@/components/FloatingBookBtn";
import SmoothScroll from "@/components/SmoothScroll";

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.echoesofbeing.co.in"),
  title: {
    default: "Echoes of Being | A quiet space for therapy",
    template: "%s | Echoes of Being",
  },
  description:
    "A counselling psychology practice offering safe, confidential, evidence-informed therapy for anxiety, depression, relationships, trauma, and more.",
  applicationName: "Echoes of Being",
  keywords: [
    "Echoes of Being", "Nidhi Kishore", "counselling psychologist", "therapist India",
    "online therapy India", "trauma-informed therapy", "therapy", "counselling",
    "psychology", "mental health", "anxiety", "depression", "trauma", "relationships",
    "loneliness", "self-esteem", "online therapy", "therapy near me",
  ],
  authors: [{ name: "Nidhi Kishore" }],
  creator: "Echoes of Being",
  publisher: "Echoes of Being",
  category: "Health",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.echoesofbeing.co.in",
    siteName: "Echoes of Being",
    title: "Echoes of Being | A quiet space for therapy",
    description:
      "A counselling psychology practice. Safe, confidential, evidence-informed therapy for anxiety, depression, relationships, trauma, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Echoes of Being, a quiet space for therapy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Echoes of Being | A quiet space for therapy",
    description:
      "A counselling psychology practice. Safe, confidential, evidence-informed.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.echoesofbeing.co.in",
  },
  // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in your env to the code Google
  // Search Console gives you (the "HTML tag" verification method). When unset,
  // no tag is rendered.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${nunitoSans.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        {/* Without JS, reveal-on-scroll elements would stay hidden — force them visible. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://www.echoesofbeing.co.in/#website",
                  url: "https://www.echoesofbeing.co.in",
                  name: "Echoes of Being",
                  alternateName: "Echoes of Being Therapy",
                  description:
                    "A counselling psychology practice. Safe, confidential, evidence-informed therapy.",
                  inLanguage: "en-IN",
                  publisher: {
                    "@id": "https://www.echoesofbeing.co.in/#practice",
                  },
                },
                {
                  "@type": ["ProfessionalService", "MedicalBusiness"],
                  "@id": "https://www.echoesofbeing.co.in/#practice",
                  name: "Echoes of Being",
                  url: "https://www.echoesofbeing.co.in",
                  description:
                    "A counselling psychology practice offering safe, confidential, evidence-informed therapy for anxiety, depression, relationships, trauma, loneliness, and self-esteem.",
                  email: "echoesofbeing.co@gmail.com",
                  image: "https://www.echoesofbeing.co.in/og-image.png",
                  logo: "https://www.echoesofbeing.co.in/og-image.png",
                  priceRange: "₹₹",
                  areaServed: { "@type": "Country", name: "India" },
                  serviceType: "Counselling Psychology",
                  knowsAbout: [
                    "Anxiety",
                    "Depression",
                    "Relationships",
                    "Trauma",
                    "Loneliness",
                    "Self-esteem",
                    "Women's mental health",
                  ],
                  founder: {
                    "@type": "Person",
                    name: "Nidhi Kishore",
                    jobTitle: "Counselling Psychologist",
                  },
                  sameAs: [
                    "https://www.instagram.com/echoesofbeing.therapy",
                  ],
                },
              ],
            }),
          }}
        />
        <TopLoader />
        <SmoothScroll />
        <AuthProvider>
          <Navbar />
          <main className="flex-1 overflow-x-clip">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <FloatingBookBtn />
          <PreloadImages />
          <ToastProvider />
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
