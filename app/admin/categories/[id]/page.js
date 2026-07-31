import { AdminPageHeader } from "@/components/admin/AdminSidebarLayout";
import CategoryForm from "@/components/admin/CategoryForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { getAdminCategory, deleteCategoryFormAction } from "@/app/admin/actions/categories";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }) {
  const { id } = await params;
  const category = await getAdminCategory(id);

  return (
    <>
      <AdminPageHeader title={category ? `Edit: ${category.name}` : "Edit category"} />
      {category ? (
        <div className="space-y-6">
          <CategoryForm category={category} id={category.id} />
          <DeleteButton action={deleteCategoryFormAction.bind(null, category.id)} label="Delete category" />
        </div>
      ) : (
        <p className="text-gray">Category not found.</p>
      )}
    </>
  );
}
