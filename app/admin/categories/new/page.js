import { AdminPageHeader } from "@/components/admin/AdminSidebarLayout";
import CategoryForm from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <>
      <AdminPageHeader title="Add category" />
      <CategoryForm />
    </>
  );
}
