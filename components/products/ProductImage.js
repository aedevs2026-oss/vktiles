"use client";

import Image from "next/image";
import { useState } from "react";
import { BLUR_DATA_URL } from "@/lib/images";

export default function ProductImage({
  src,
  fallbackSrc,
  alt,
  className = "",
  sizes,
  priority = false,
  fill = false,
  width,
  height,
}) {
  const [current, setCurrent] = useState(src);

  const handleError = () => {
    if (fallbackSrc && current !== fallbackSrc) setCurrent(fallbackSrc);
  };

  const props = {
    src: current,
    alt,
    className,
    onError: handleError,
    placeholder: "blur",
    blurDataURL: BLUR_DATA_URL,
    priority,
    sizes,
  };

  if (fill) {
    return <Image {...props} fill />;
  }

  return <Image {...props} width={width} height={height} />;
}
