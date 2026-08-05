"use client";

import Image from "next/image";
import { useState } from "react";
import { BLUR_DATA_URL } from "@/lib/images";

/**
 * next/image wrapper with blur placeholder, skeleton, and soft fade-in.
 */
export default function AppImage({
  src,
  alt = "",
  fill = false,
  width,
  height,
  className = "",
  wrapperClassName = "",
  sizes,
  priority = false,
  quality,
  onError,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`bg-gradient-to-br from-sky-soft/40 via-white to-navy/5 flex items-center justify-center ${
          fill ? "absolute inset-0" : ""
        } ${wrapperClassName}`}
        aria-hidden={!alt}
      >
        <svg className="w-10 h-10 text-navy/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5h16v14H4V5z" />
        </svg>
      </div>
    );
  }

  const wrapperBase = fill ? "absolute inset-0 overflow-hidden" : "relative overflow-hidden";

  const imageClass = [
    fill ? "object-cover" : "",
    "transition-opacity duration-700 ease-out",
    loaded ? "opacity-100" : "opacity-0",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={`${wrapperBase} ${wrapperClassName}`}>
      {!loaded && (
        <span
          className="absolute inset-0 z-0 bg-gradient-to-br from-sky-soft/45 via-slate-50 to-navy/[0.04] animate-pulse"
          aria-hidden="true"
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        quality={quality ?? (priority ? 85 : 72)}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        loading={priority ? undefined : "lazy"}
        className={`relative z-[1] ${imageClass}`}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setFailed(true);
          onError?.(e);
        }}
        {...rest}
      />
    </span>
  );
}
