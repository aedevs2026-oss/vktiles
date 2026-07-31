import { AdminPageHeader, AdminCard, AdminTable, AdminTableHead, AdminTableRow } from "@/components/admin/AdminSidebarLayout";

import { ui } from "@/components/admin/admin-ui";

import { getEnquiries } from "@/app/admin/actions/site-content";



export const dynamic = "force-dynamic";



export default async function AdminEnquiriesPage() {

  let enquiries = [];

  try {

    enquiries = await getEnquiries();

  } catch {

    enquiries = [];

  }



  return (

    <>

      <AdminPageHeader

        title="Enquiries"

        subtitle="Contact form submissions from your website."

      />

      <AdminCard className="overflow-hidden">

        <AdminTable>

          <AdminTableHead>

            <tr>

              <th className={ui.th}>Date</th>

              <th className={ui.th}>Name</th>

              <th className={ui.th}>Phone</th>

              <th className={ui.th}>Type</th>

              <th className={ui.th}>Message</th>

            </tr>

          </AdminTableHead>

          <tbody>

            {enquiries.length === 0 ? (

              <tr>

                <td colSpan={5} className={ui.empty}>

                  No enquiries yet.

                </td>

              </tr>

            ) : (

              enquiries.map((e) => (

                <AdminTableRow key={e.id} className="align-top">

                  <td className={`${ui.td} text-xs text-gray whitespace-nowrap`}>

                    {new Date(e.created_at).toLocaleString("en-IN")}

                  </td>

                  <td className={ui.td}>

                    <p className="font-medium text-navy">{e.name}</p>

                    {e.email && <p className="text-xs text-gray">{e.email}</p>}

                  </td>

                  <td className={ui.td}>{e.phone}</td>

                  <td className={ui.td}>{e.inquiry_type}</td>

                  <td className={`${ui.td} max-w-sm text-navy/70`}>{e.message}</td>

                </AdminTableRow>

              ))

            )}

          </tbody>

        </AdminTable>

      </AdminCard>

    </>

  );

}


