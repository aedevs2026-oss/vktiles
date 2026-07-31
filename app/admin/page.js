import AdminDashboardView from "@/components/admin/AdminDashboardView";
import { getProducts } from "@/lib/products";
import { getEnquiries } from "@/app/admin/actions/site-content";
import { getAdminCategories } from "@/app/admin/actions/categories";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getSupabaseCounts() {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    if (!supabase) return null;
    const [products, gallery, testimonials, enquiries] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("gallery_items").select("id", { count: "exact", head: true }),
      supabase.from("testimonials").select("id", { count: "exact", head: true }),
      supabase.from("contact_enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    ]);
    return {
      products: products.count || 0,
      gallery: gallery.count || 0,
      testimonials: testimonials.count || 0,
      newEnquiries: enquiries.count || 0,
    };
  } catch {
    return null;
  }
}

async function getRecentEnquiries() {
  if (!isSupabaseConfigured()) return [];
  try {
    const enquiries = await getEnquiries();
    return enquiries.slice(0, 4);
  } catch {
    return [];
  }
}

async function getCategoriesCount() {
  if (!isSupabaseConfigured()) {
    const { getCategories } = await import("@/lib/products");
    return getCategories().length;
  }
  try {
    const categories = await getAdminCategories();
    return categories.length;
  } catch {
    return 0;
  }
}

export default async function AdminDashboardPage() {
  const [liveProducts, dbCounts, recentEnquiries, categoriesCount] = await Promise.all([
    Promise.resolve(getProducts().length),
    getSupabaseCounts(),
    getRecentEnquiries(),
    getCategoriesCount(),
  ]);

  return (
    <AdminDashboardView
      liveProducts={liveProducts}
      dbCounts={dbCounts}
      recentEnquiries={recentEnquiries}
      categoriesCount={categoriesCount}
    />
  );
}
