import { AdminPageHeader } from "@/components/admin/AdminSidebarLayout";
import ProductForm from "@/components/admin/ProductForm";
import { getAdminCategories } from "@/app/admin/actions/categories";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  let categories = [];
  if (isSupabaseConfigured()) {
    try {
      categories = await getAdminCategories();
    } catch {
      categories = [];
    }
  }

  return (
    <>
      <AdminPageHeader title="Add product" />
      <ProductForm categories={categories} />
    </>
  );
}
