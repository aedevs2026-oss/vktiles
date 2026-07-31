"use client";



import { useActionState } from "react";

import Link from "next/link";

import ImageUploadField from "@/components/admin/ImageUploadField";

import { saveGalleryAction } from "@/app/admin/actions/site-content";

import { AdminField, AdminSection, ui } from "@/components/admin/admin-ui";



const empty = { slug: "", caption: "", image: "", thumb: "", sort_order: 0, published: true };



export default function GalleryForm({ item, id = "new" }) {

  const data = item || empty;

  const [state, formAction, pending] = useActionState(

    async (_prev, formData) => saveGalleryAction(id, formData),

    null

  );



  return (

    <form action={formAction} className="space-y-5 max-w-3xl">

      <div className="grid sm:grid-cols-2 gap-4">

        <AdminField label="Caption" name="caption" defaultValue={data.caption} required />

        <AdminField label="Slug" name="slug" defaultValue={data.slug} required />

        <AdminField label="Sort order" name="sortOrder" type="number" defaultValue={data.sort_order ?? 0} />

        <div className="flex items-end pb-2">

          <label className={ui.checkbox}>

            <input type="checkbox" name="published" defaultChecked={data.published !== false} />

            Published

          </label>

        </div>

      </div>



      <AdminSection title="Gallery image">

        <ImageUploadField

          label="Gallery image"

          defaultUrl={data.image || ""}

          existingFieldName="existingImage"

        />

      </AdminSection>



      <AdminSection title="Thumbnail (optional)" description="Optional smaller image for carousel. Uses main image if empty.">

        <ImageUploadField

          name="thumbFile"

          urlFieldName="thumb"

          existingFieldName="existingThumb"

          label="Thumbnail"

          defaultUrl={data.thumb || data.image || ""}

        />

      </AdminSection>



      {state?.error && <p className={ui.error}>{state.error}</p>}

      {state?.success && <p className={ui.success}>Gallery item saved.</p>}



      <div className="flex gap-3">

        <button type="submit" disabled={pending} className={ui.btnPrimary}>

          {pending ? "Saving..." : "Save"}

        </button>

        <Link href="/admin/gallery" className={ui.btnSecondary}>

          Cancel

        </Link>

      </div>

    </form>

  );

}


