"use client";

import Image from "next/image";
import { useState } from "react";

export default function FadeImage(
  props: React.ComponentProps<typeof Image>
) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      className={`${props.className ?? ""} transition-opacity duration-700 ease-out ${loaded ? "opacity-100" : "opacity-0"}`}
      onLoad={() => setLoaded(true)}
    />
  );
}
