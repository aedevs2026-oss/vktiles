"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  rowToProduct,
  productToRow,
  writeCatalogJson,
  buildCatalogFromProducts,
} from "@/lib/products-db";
import { resolveImageFromForm } from "@/lib/supabase/upload";

async function getAdminSupabase() {
  const admin = createAdminClient();
  if (admin) return admin;
  return createClient();
}

export async function getAdminProducts({
  search = "",
  category = "",
  page = 1,
  perPage = 20,
} = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePerPage = Math.min(100, Math.max(10, Number(perPage) || 20));
  const from = (safePage - 1) * safePerPage;
  const to = from + safePerPage - 1;

  const supabase = await getAdminSupabase();
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("name");
  if (category) query = query.eq("category_slug", category);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  return {
    products: (data || []).map(rowToProduct),
    total: count || 0,
    page: safePage,
    perPage: safePerPage,
  };
}

export async function getAdminProduct(id) {
  const supabase = await getAdminSupabase();
  const isUuid = /^[0-9a-f-]{36}$/i.test(id);
  const query = supabase.from("products").select("*");
  const { data, error } = isUuid
    ? await query.eq("id", id).single()
    : await query.eq("slug", id).single();
  if (error) return null;
  return rowToProduct(data);
}

export async function saveProductAction(id, formData) {
  try {
    const supabase = await getAdminSupabase();
    const slug = String(formData.get("slug") || "").trim();
    const name = String(formData.get("name") || "").trim();

    if (!slug || !name) {
      return { error: "Slug and name are required." };
    }

    const image = await resolveImageFromForm(
      formData,
      "imageFile",
      "image",
      "existingImage",
      `products/${slug}`
    );

    const row = {
      slug,
      name,
      category_slug: formData.get("category"),
      subcategory: formData.get("subcategory"),
      collection_name: formData.get("collection"),
      collection_slug: formData.get("collectionSlug"),
      series: formData.get("series"),
      description: formData.get("description"),
      size: formData.get("size"),
      finish: formData.get("finish"),
      surface: formData.get("surface"),
      pattern: formData.get("pattern"),
      thickness: formData.get("thickness"),
      image,
      availability: formData.get("availability") || "In Stock",
      featured: formData.get("featured") === "on",
      published: formData.get("published") !== "off",
    };

    row.images = row.image ? [row.image] : [];
    row.image_thumb = row.image;
    row.image_medium = row.image;
    row.finishes = row.finish ? [row.finish] : [];
    row.sizes = row.size ? [row.size] : [];
    row.thicknesses = row.thickness ? [row.thickness] : [];
    row.packing = [
      {
        size: row.size?.replace(" MM", "") || "600x1200",
        thickness: row.thickness || "9 MM",
        tilesPerBox: 2,
        coverage: "1.44 SQM",
        weight: "30 KG",
      },
    ];
    row.features = [
      "Low Water Absorption",
      "High Breaking Strength",
      "Frost Resistant",
      "Stain Resistant",
      "Easy Maintenance",
    ];
    row.applications =
      row.category_slug === "wooden-strip"
        ? ["Living Room", "Bedroom", "Commercial Spaces"]
        : ["Living Room", "Bedroom", "Commercial Spaces", "Hotels", "Office"];
    row.specifications = {
      size: row.size,
      thickness: row.thickness,
      finish: row.finish,
      surface: row.surface,
      pattern: row.pattern,
      material:
        row.category_slug === "wooden-strip"
          ? "Porcelain Wood-Look Tile"
          : "Glazed Vitrified Tile (GVT/PGVT)",
      tilesPerBox: 2,
      coverage: "1.44 SQM",
      weightPerBox: "30 KG",
    };
    row.seo = {
      title: `${row.name} | ${row.size} ${row.finish} | VK Tiles`,
      description: row.description?.slice(0, 160),
    };

    let error;
    if (id && id !== "new") {
      ({ error } = await supabase.from("products").update(row).eq("id", id));
    } else {
      ({ error } = await supabase.from("products").insert(row));
    }

    if (error) return { error: error.message };

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    return { error: err.message || "Failed to save product." };
  }
}

export async function deleteProductAction(id) {
  const supabase = await getAdminSupabase();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function deleteProductFormAction(id) {
  await deleteProductAction(id);
}

export async function publishCatalogAction() {
  const supabase = await getAdminSupabase();
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("*")
    .eq("published", true)
    .order("name");
  if (pErr) return { error: pErr.message };

  const { data: categories, error: cErr } = await supabase
    .from("categories")
    .select("*")
    .eq("published", true)
    .order("sort_order");
  if (cErr) return { error: cErr.message };

  const mappedProducts = (products || []).map(rowToProduct);
  const catalogCategories = (categories || []).map((c) => ({
    slug: c.slug,
    name: c.name,
    category: c.slug,
    subcategory: "600x1200",
    parent: c.slug,
    blurb: c.blurb,
    image: c.image,
    count: mappedProducts.filter((p) => p.category === c.slug).length,
  }));

  const catalog = buildCatalogFromProducts(mappedProducts, catalogCategories);
  writeCatalogJson(catalog);

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");

  return { success: true, count: mappedProducts.length };
}

export async function publishCatalogFormAction() {
  const result = await publishCatalogAction();
  if (result?.error) {
    throw new Error(result.error);
  }
}
