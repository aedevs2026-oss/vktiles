import "server-only";
import fs from "fs";
import path from "path";

let goodUrls = null;

export function getVerifiedGoodUrls() {
  if (!goodUrls) {
    const filePath = path.join(process.cwd(), "content", "verified-images.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    goodUrls = new Set(data.good || []);
  }
  return goodUrls;
}

/** True when URL is safe for next/image (real image bytes, not Valenza HTML placeholders). */
export function isVerifiedImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.includes("images.unsplash.com")) return true;
  if (!trimmed.includes("valenzaceramic.com")) return true;
  return getVerifiedGoodUrls().has(trimmed);
}
