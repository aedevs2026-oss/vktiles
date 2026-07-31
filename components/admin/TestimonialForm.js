"use client";



import { useActionState } from "react";

import Link from "next/link";

import ImageUploadField from "@/components/admin/ImageUploadField";

import { saveTestimonialAction } from "@/app/admin/actions/site-content";

import { AdminField, AdminSection, ui } from "@/components/admin/admin-ui";



const empty = { name: "", role: "", quote: "", avatar: "", rating: 5, sort_order: 0, published: true };



export default function TestimonialForm({ item, id = "new" }) {

  const data = item || empty;

  const [state, formAction, pending] = useActionState(

    async (_prev, formData) => saveTestimonialAction(id, formData),

    null

  );



  return (

    <form action={formAction} className="space-y-5 max-w-3xl">

      <div className="grid sm:grid-cols-2 gap-4">

        <AdminField label="Name" name="name" defaultValue={data.name} required />

        <AdminField label="Role / Location" name="role" defaultValue={data.role} />

        <AdminField label="Rating (1-5)" name="rating" type="number" defaultValue={data.rating ?? 5} />

        <AdminField label="Sort order" name="sortOrder" type="number" defaultValue={data.sort_order ?? 0} />

        <div className="flex items-end pb-2 sm:col-span-2">

          <label className={ui.checkbox}>

            <input type="checkbox" name="published" defaultChecked={data.published !== false} />

            Published

          </label>

        </div>

      </div>



      <div>

        <label className={ui.label}>Quote</label>

        <textarea

          name="quote"

          rows={4}

          required

          defaultValue={data.quote}

          className={ui.textarea}

        />

      </div>



      <AdminSection title="Avatar photo">

        <ImageUploadField

          name="avatarFile"

          urlFieldName="avatar"

          existingFieldName="existingAvatar"

          label="Avatar photo"

          defaultUrl={data.avatar || ""}

        />

      </AdminSection>



      {state?.error && <p className={ui.error}>{state.error}</p>}

      {state?.success && <p className={ui.success}>Testimonial saved.</p>}



      <div className="flex gap-3">

        <button type="submit" disabled={pending} className={ui.btnPrimary}>

          {pending ? "Saving..." : "Save"}

        </button>

        <Link href="/admin/testimonials" className={ui.btnSecondary}>

          Cancel

        </Link>

      </div>

    </form>

  );

}


