import { AdminPageHeader } from "@/components/admin/AdminSidebarLayout";
import GalleryForm from "@/components/admin/GalleryForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { getAdminGalleryItem, deleteGalleryFormAction } from "@/app/admin/actions/site-content";

export const dynamic = "force-dynamic";

export default async function EditGalleryPage({ params }) {
  const { id } = await params;
  const item = await getAdminGalleryItem(id);

  return (
    <>
      <AdminPageHeader title={item ? `Edit: ${item.caption}` : "Edit gallery image"} />
      {item ? (
        <div className="space-y-6">
          <GalleryForm item={item} id={item.id} />
          <DeleteButton action={deleteGalleryFormAction.bind(null, item.id)} label="Delete image" />
        </div>
      ) : (
        <p className="text-gray">Item not found.</p>
      )}
    </>
  );
}
