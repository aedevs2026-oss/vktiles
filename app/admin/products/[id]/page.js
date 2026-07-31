import { AdminPageHeader } from "@/components/admin/AdminSidebarLayout";
import ProductForm from "@/components/admin/ProductForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { getAdminProduct, deleteProductFormAction } from "@/app/admin/actions/products";
import { getAdminCategories } from "@/app/admin/actions/categories";
import { getProductBySlug } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  let product = null;
  let categories = [];

  if (isSupabaseConfigured()) {
    product = await getAdminProduct(id);
    try {
      categories = await getAdminCategories();
    } catch {
      categories = [];
    }
  }
  if (!product) product = getProductBySlug(id);

  return (
    <>
      <AdminPageHeader title={product ? `Edit: ${product.name}` : "Edit product"} />
      {product ? (
        <div className="space-y-6">
          <ProductForm product={product} categories={categories} id={product.id || id} />
          {product.id && (
            <DeleteButton action={deleteProductFormAction.bind(null, product.id)} label="Delete product" />
          )}
        </div>
      ) : (
        <p className="text-gray">Product not found.</p>
      )}
    </>
  );
}
