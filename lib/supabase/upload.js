import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "product-images";

function sanitizeFilename(name) {
  return String(name || "image")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/**
 * Upload a File from a server action FormData to Supabase Storage.
 * Returns the public URL.
 */
export async function uploadImageFile(file, folder = "uploads") {
  if (!file || typeof file === "string") return null;
  if (!file.size) return null;

  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("Supabase service role key is not configured.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const base = sanitizeFilename(file.name.replace(/\.[^.]+$/, ""));
  const path = `${folder}/${Date.now()}-${base}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || `image/${ext}`,
    upsert: false,
  });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Resolve image URL from form: new upload takes priority, else existing URL field.
 */
export async function resolveImageFromForm(formData, fileField, urlField, existingField, folder) {
  const file = formData.get(fileField);
  if (file && typeof file !== "string" && file.size > 0) {
    return uploadImageFile(file, folder);
  }
  const url = formData.get(urlField);
  if (typeof url === "string" && url.trim()) return url.trim();
  const existing = formData.get(existingField);
  if (typeof existing === "string" && existing.trim()) return existing.trim();
  return null;
}
