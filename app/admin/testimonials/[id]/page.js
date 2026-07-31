import { AdminPageHeader } from "@/components/admin/AdminSidebarLayout";
import TestimonialForm from "@/components/admin/TestimonialForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { getAdminTestimonial, deleteTestimonialFormAction } from "@/app/admin/actions/site-content";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({ params }) {
  const { id } = await params;
  const item = await getAdminTestimonial(id);

  return (
    <>
      <AdminPageHeader title={item ? `Edit: ${item.name}` : "Edit testimonial"} />
      {item ? (
        <div className="space-y-6">
          <TestimonialForm item={item} id={item.id} />
          <DeleteButton action={deleteTestimonialFormAction.bind(null, item.id)} label="Delete testimonial" />
        </div>
      ) : (
        <p className="text-gray">Testimonial not found.</p>
      )}
    </>
  );
}
