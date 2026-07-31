import { AdminPageHeader } from "@/components/admin/AdminSidebarLayout";
import ContactSettingsForm from "@/components/admin/ContactSettingsForm";
import { getContactSettings } from "@/app/admin/actions/site-content";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  let settings = {};
  try {
    settings = await getContactSettings();
  } catch {
    const fallback = getSiteContent();
    settings = {
      business: fallback.business,
      contact: fallback.contact,
      emailConfig: fallback.emailConfig,
      businessHours: fallback.businessHours,
    };
  }

  return (
    <>
      <AdminPageHeader
        title="Contact & Email"
        subtitle="Update showroom details, business hours, and enquiry form email settings."
      />
      <ContactSettingsForm settings={settings} />
    </>
  );
}
