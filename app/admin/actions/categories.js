"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveImageFromForm } from "@/lib/supabase/upload";

async function getAdminSupabase() {
  const admin = createAdminClient();
  if (admin) return admin;
  return createClient();
}

export async function getAdminCategories() {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAdminCategory(id) {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getAdminCollections() {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data || [];
}

export async function saveCategoryAction(id, formData) {
  try {
    const supabase = await getAdminSupabase();
    const slug = String(formData.get("slug") || "").trim();
    const name = String(formData.get("name") || "").trim();

    if (!slug || !name) return { error: "Slug and name are required." };

    const image = await resolveImageFromForm(
      formData,
      "imageFile",
      "image",
      "existingImage",
      `categories/${slug}`
    );

    const row = {
      slug,
      name,
      blurb: formData.get("blurb"),
      image,
      sort_order: Number(formData.get("sortOrder") || 0),
      published: formData.get("published") !== "off",
    };

    let error;
    if (id && id !== "new") {
      ({ error } = await supabase.from("categories").update(row).eq("id", id));
    } else {
      ({ error } = await supabase.from("categories").insert(row));
    }

    if (error) return { error: error.message };

    revalidatePath("/admin/categories");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return { error: err.message || "Failed to save category." };
  }
}

export async function deleteCategoryAction(id) {
  const supabase = await getAdminSupabase();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategoryFormAction(id) {
  await deleteCategoryAction(id);
}
