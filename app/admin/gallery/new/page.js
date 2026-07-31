import { AdminPageHeader } from "@/components/admin/AdminSidebarLayout";
import GalleryForm from "@/components/admin/GalleryForm";

export default function NewGalleryPage() {
  return (
    <>
      <AdminPageHeader title="Add gallery image" />
      <GalleryForm />
    </>
  );
}
