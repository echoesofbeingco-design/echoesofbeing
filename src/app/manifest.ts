import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Echoes of Being",
    short_name: "Echoes",
    description:
      "A counselling psychology practice. Safe, confidential, evidence-informed.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5ec",
    theme_color: "#2d352d",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
