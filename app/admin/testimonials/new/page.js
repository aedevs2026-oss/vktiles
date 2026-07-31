import { AdminPageHeader } from "@/components/admin/AdminSidebarLayout";
import TestimonialForm from "@/components/admin/TestimonialForm";

export default function NewTestimonialPage() {
  return (
    <>
      <AdminPageHeader title="Add testimonial" />
      <TestimonialForm />
    </>
  );
}
