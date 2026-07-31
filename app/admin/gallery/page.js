import Link from "next/link";

import Image from "next/image";

import { AdminPageHeader, AdminCard, AdminAddLink, AdminTable, AdminTableHead, AdminTableRow } from "@/components/admin/AdminSidebarLayout";

import { ui } from "@/components/admin/admin-ui";

import DeleteButton from "@/components/admin/DeleteButton";

import { getAdminGallery, deleteGalleryFormAction } from "@/app/admin/actions/site-content";



export const dynamic = "force-dynamic";



export default async function AdminGalleryPage() {

  let items = [];

  try {

    items = await getAdminGallery();

  } catch {

    items = [];

  }



  return (

    <>

      <AdminPageHeader

        title="Gallery"

        subtitle="Manage installation photos shown on the homepage and gallery page."

        actions={<AdminAddLink href="/admin/gallery/new">+ Add image</AdminAddLink>}

      />

      <AdminCard className="overflow-hidden">

        <AdminTable>

          <AdminTableHead>

            <tr>

              <th className={ui.th}>Image</th>

              <th className={ui.th}>Caption</th>

              <th className={ui.th}>Order</th>

              <th className={`${ui.th} text-right`}>Actions</th>

            </tr>

          </AdminTableHead>

          <tbody>

            {items.map((item) => (

              <AdminTableRow key={item.id}>

                <td className={ui.td}>

                  {item.image && (

                    <Image src={item.image} alt="" width={56} height={40} className="rounded-lg object-cover w-14 h-10" unoptimized />

                  )}

                </td>

                <td className={ui.td}>{item.caption}</td>

                <td className={ui.td}>{item.sort_order}</td>

                <td className={`${ui.td} text-right space-x-3`}>

                  <Link href={`/admin/gallery/${item.id}`} className={ui.link}>Edit</Link>

                  <DeleteButton action={deleteGalleryFormAction.bind(null, item.id)} />

                </td>

              </AdminTableRow>

            ))}

          </tbody>

        </AdminTable>

      </AdminCard>

    </>

  );

}


