import type { MetadataRoute } from "next";

const BASE_URL = "https://www.echoesofbeing.co.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/book/consent", "/book/confirmed", "/community/profile"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
