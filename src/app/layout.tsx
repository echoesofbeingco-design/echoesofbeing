import type { Metadata } from "next";
import { Lora, Nunito_Sans } from "next/font/google";
import "./globals.css";
import TopLoader from "@/components/TopLoader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
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
    "A counselling psychology practice offering gentle, confidential, evidence-informed therapy for anxiety, depression, relationships, trauma, and more.",
  keywords: [
    "therapy", "counselling", "psychology", "mental health", "anxiety",
    "depression", "trauma", "relationships", "self-esteem", "counselling psychologist",
    "online therapy", "India", "therapy near me",
  ],
  authors: [{ name: "Echoes of Being" }],
  creator: "Echoes of Being",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.echoesofbeing.co.in",
    siteName: "Echoes of Being",
    title: "Echoes of Being | A quiet space for therapy",
    description:
      "A counselling psychology practice. Gentle, confidential, evidence-informed therapy for anxiety, depression, relationships, trauma, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Echoes of Being — A quiet space for therapy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Echoes of Being | A quiet space for therapy",
    description:
      "A counselling psychology practice. Gentle, confidential, evidence-informed.",
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
              "@type": "ProfessionalService",
              name: "Echoes of Being",
              description:
                "A counselling psychology practice offering gentle, confidential, evidence-informed therapy.",
              url: "https://www.echoesofbeing.co.in",
              email: "echoesofbeing.co@gmail.com",
              areaServed: { "@type": "Country", name: "India" },
              serviceType: "Counselling Psychology",
              priceRange: "$$",
              sameAs: [],
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
        </AuthProvider>
      </body>
    </html>
  );
}
