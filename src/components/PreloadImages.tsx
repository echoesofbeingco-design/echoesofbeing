"use client";

import { useEffect } from "react";
import { services } from "@/data/services";

export default function PreloadImages() {
  useEffect(() => {
    services.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  return null;
}
