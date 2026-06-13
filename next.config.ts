import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  // The blog now lives at /echoes. Permanent (308) redirects preserve SEO and
  // keep old links working: /blog → /echoes and /blog/<slug> → /echoes/<slug>.
  async redirects() {
    return [
      { source: "/blog", destination: "/echoes", permanent: true },
      { source: "/blog/:slug*", destination: "/echoes/:slug*", permanent: true },
    ];
  },
};

export default nextConfig;
