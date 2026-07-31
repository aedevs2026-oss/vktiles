import Link from "next/link";

import Image from "next/image";

import { AdminPageHeader, AdminCard, AdminAddLink, AdminTable, AdminTableHead, AdminTableRow } from "@/components/admin/AdminSidebarLayout";

import { ui } from "@/components/admin/admin-ui";

import DeleteButton from "@/components/admin/DeleteButton";

import { getAdminCategories, deleteCategoryFormAction } from "@/app/admin/actions/categories";

import { getCategories } from "@/lib/products";

import { isSupabaseConfigured } from "@/lib/supabase/admin";



export const dynamic = "force-dynamic";



export default async function AdminCategoriesPage() {

  let categories = [];

  if (isSupabaseConfigured()) {

    try {

      categories = await getAdminCategories();

    } catch {

      categories = getCategories();

    }

  } else {

    categories = getCategories();

  }



  return (

    <>

      <AdminPageHeader

        title="Categories"

        subtitle="Product lines shown on your website."

        actions={<AdminAddLink href="/admin/categories/new">+ Add category</AdminAddLink>}

      />



      <AdminCard className="overflow-hidden">

        <AdminTable>

          <AdminTableHead>

            <tr>

              <th className={ui.th}>Image</th>

              <th className={ui.th}>Name</th>

              <th className={ui.th}>Slug</th>

              <th className={`${ui.th} text-right`}>Actions</th>

            </tr>

          </AdminTableHead>

          <tbody>

            {categories.map((c) => (

              <AdminTableRow key={c.id || c.slug}>

                <td className={ui.td}>

                  {c.image ? (

                    <Image src={c.image} alt="" width={48} height={48} className="rounded-lg object-cover w-12 h-12" unoptimized />

                  ) : (

                    <span className="text-gray text-xs">—</span>

                  )}

                </td>

                <td className={`${ui.td} font-medium text-navy`}>{c.name}</td>

                <td className={ui.td}>{c.slug}</td>

                <td className={`${ui.td} text-right space-x-3`}>

                  {c.id && (

                    <>

                      <Link href={`/admin/categories/${c.id}`} className={ui.link}>Edit</Link>

                      <DeleteButton action={deleteCategoryFormAction.bind(null, c.id)} />

                    </>

                  )}

                </td>

              </AdminTableRow>

            ))}

          </tbody>

        </AdminTable>

      </AdminCard>

    </>

  );

}


