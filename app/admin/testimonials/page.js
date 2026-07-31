import Link from "next/link";

import Image from "next/image";

import { AdminPageHeader, AdminCard, AdminAddLink, AdminTable, AdminTableHead, AdminTableRow } from "@/components/admin/AdminSidebarLayout";

import { ui } from "@/components/admin/admin-ui";

import DeleteButton from "@/components/admin/DeleteButton";

import { getAdminTestimonials, deleteTestimonialFormAction } from "@/app/admin/actions/site-content";



export const dynamic = "force-dynamic";



export default async function AdminTestimonialsPage() {

  let items = [];

  try {

    items = await getAdminTestimonials();

  } catch {

    items = [];

  }



  return (

    <>

      <AdminPageHeader

        title="Testimonials"

        subtitle="Customer reviews shown on the homepage and testimonials page."

        actions={<AdminAddLink href="/admin/testimonials/new">+ Add testimonial</AdminAddLink>}

      />

      <AdminCard className="overflow-hidden">

        <AdminTable>

          <AdminTableHead>

            <tr>

              <th className={ui.th}>Customer</th>

              <th className={ui.th}>Quote</th>

              <th className={ui.th}>Rating</th>

              <th className={`${ui.th} text-right`}>Actions</th>

            </tr>

          </AdminTableHead>

          <tbody>

            {items.map((item) => (

              <AdminTableRow key={item.id}>

                <td className={ui.td}>

                  <div className="flex items-center gap-3">

                    {item.avatar && (

                      <Image src={item.avatar} alt="" width={36} height={36} className="rounded-full w-9 h-9 object-cover" unoptimized />

                    )}

                    <div>

                      <p className="font-medium text-navy">{item.name}</p>

                      <p className="text-xs text-gray">{item.role}</p>

                    </div>

                  </div>

                </td>

                <td className={`${ui.td} max-w-md truncate`}>{item.quote}</td>

                <td className={ui.td}>{"★".repeat(item.rating || 5)}</td>

                <td className={`${ui.td} text-right space-x-3`}>

                  <Link href={`/admin/testimonials/${item.id}`} className={ui.link}>Edit</Link>

                  <DeleteButton action={deleteTestimonialFormAction.bind(null, item.id)} />

                </td>

              </AdminTableRow>

            ))}

          </tbody>

        </AdminTable>

      </AdminCard>

    </>

  );

}


