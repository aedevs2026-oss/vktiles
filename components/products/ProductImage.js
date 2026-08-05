"use client";

import { useState } from "react";
import AppImage from "@/components/ui/AppImage";

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

  return (
    <AppImage
      src={current}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={handleError}
    />
  );
}
