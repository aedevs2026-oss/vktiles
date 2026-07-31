"use client";



import { useActionState } from "react";

import Link from "next/link";

import { saveCategoryAction } from "@/app/admin/actions/categories";

import ImageUploadField from "@/components/admin/ImageUploadField";

import { AdminField, AdminSection, ui } from "@/components/admin/admin-ui";



const empty = { slug: "", name: "", blurb: "", image: "", sort_order: 0, published: true };



export default function CategoryForm({ category, id = "new" }) {

  const data = category || empty;

  const [state, formAction, pending] = useActionState(

    async (_prev, formData) => saveCategoryAction(id, formData),

    null

  );



  return (

    <form action={formAction} className="space-y-5 max-w-3xl">

      <div className="grid sm:grid-cols-2 gap-4">

        <AdminField label="Name" name="name" defaultValue={data.name} required />

        <AdminField label="Slug" name="slug" defaultValue={data.slug} required />

        <AdminField label="Sort order" name="sortOrder" type="number" defaultValue={data.sort_order ?? 0} />

        <div className="flex items-end pb-2">

          <label className={ui.checkbox}>

            <input type="checkbox" name="published" defaultChecked={data.published !== false} />

            Published

          </label>

        </div>

      </div>



      <div>

        <label className={ui.label}>Blurb</label>

        <textarea

          name="blurb"

          rows={3}

          defaultValue={data.blurb || ""}

          className={ui.textarea}

        />

      </div>



      <AdminSection title="Category image">

        <ImageUploadField label="Category image" defaultUrl={data.image || ""} />

      </AdminSection>



      {state?.error && <p className={ui.error}>{state.error}</p>}

      {state?.success && <p className={ui.success}>Category saved.</p>}



      <div className="flex gap-3">

        <button type="submit" disabled={pending} className={ui.btnPrimary}>

          {pending ? "Saving..." : "Save category"}

        </button>

        <Link href="/admin/categories" className={ui.btnSecondary}>

          Cancel

        </Link>

      </div>

    </form>

  );

}


