import "server-only";
import { getProductImage } from "@/lib/category-images";
import { isVerifiedImageUrl } from "@/lib/verified-images";

function uniqueUrls(urls) {
  const seen = new Set();
  const out = [];
  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}

export function resolveProductImages(product) {
  const candidates = uniqueUrls([
    product.image,
    product.imageMedium,
    product.imageThumb,
    ...(product.images || []),
  ]);

  const verified = candidates.filter(isVerifiedImageUrl);
  const fallback = getProductImage(product);
  const primary =
    verified[0] || (isVerifiedImageUrl(fallback) ? fallback : null);

  if (!primary) {
    return {
      image: fallback,
      images: [fallback],
      imageThumb: fallback,
      imageMedium: fallback,
      imageFallback: fallback,
    };
  }

  const gallery = uniqueUrls([primary, ...verified.filter((u) => u !== primary)]);

  return {
    image: primary,
    images: gallery,
    imageFallback: fallback,
    imageThumb:
      product.imageThumb && isVerifiedImageUrl(product.imageThumb)
        ? product.imageThumb
        : primary,
    imageMedium:
      product.imageMedium && isVerifiedImageUrl(product.imageMedium)
        ? product.imageMedium
        : primary,
  };
}
