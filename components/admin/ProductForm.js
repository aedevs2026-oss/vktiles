"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveProductAction } from "@/app/admin/actions/products";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { AdminField, AdminSection, ui } from "@/components/admin/admin-ui";

const empty = {
  slug: "", name: "", category: "gvt-pgvt", subcategory: "600x1200", collection: "",
  collectionSlug: "", series: "", description: "", size: "600x1200 MM", finish: "Matt",
  surface: "Matt", pattern: "Random", thickness: "9 MM", image: "", availability: "In Stock",
  featured: false, published: true,
};

export default function ProductForm({ product, categories = [], id = "new" }) {
  const data = product || empty;
  const [state, formAction, pending] = useActionState(
    async (_prev, formData) => saveProductAction(id, formData),
    null
  );

  const categoryValue = data.category || data.category_slug || "gvt-pgvt";

  return (
    <form action={formAction} className="space-y-5 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <AdminField label="Name" name="name" defaultValue={data.name} required />
        <AdminField label="Slug" name="slug" defaultValue={data.slug} required />

        <div>
          <label className={ui.label}>Category</label>
          <select name="category" defaultValue={categoryValue} className={ui.select}>
            {categories.length > 0 ? (
              categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)
            ) : (
              <>
                <option value="gvt-pgvt">GVT / PGVT Floor Tiles</option>
                <option value="wooden-strip">Wooden Strip</option>
              </>
            )}
          </select>
        </div>

        <AdminField label="Subcategory" name="subcategory" defaultValue={data.subcategory || "600x1200"} />
        <AdminField label="Collection" name="collection" defaultValue={data.collection || data.collection_name} />
        <AdminField label="Collection slug" name="collectionSlug" defaultValue={data.collectionSlug || data.collection_slug} />
        <AdminField label="Series" name="series" defaultValue={data.series} />
        <AdminField label="Size" name="size" defaultValue={data.size} />
        <AdminField label="Finish" name="finish" defaultValue={data.finish} />
        <AdminField label="Surface" name="surface" defaultValue={data.surface} />
        <AdminField label="Pattern" name="pattern" defaultValue={data.pattern} />
        <AdminField label="Thickness" name="thickness" defaultValue={data.thickness} />
        <AdminField label="Availability" name="availability" defaultValue={data.availability} />
      </div>

      <AdminSection title="Product image">
        <ImageUploadField label="Product image" defaultUrl={data.image || ""} />
      </AdminSection>

      <div>
        <label className={ui.label}>Description</label>
        <textarea name="description" rows={5} defaultValue={data.description} className={ui.textarea} />
      </div>

      <div className="flex gap-6">
        <label className={ui.checkbox}>
          <input type="checkbox" name="featured" defaultChecked={data.featured} /> Featured
        </label>
        <label className={ui.checkbox}>
          <input type="checkbox" name="published" defaultChecked={data.published !== false} /> Published
        </label>
      </div>

      {state?.error && <p className={ui.error}>{state.error}</p>}
      {state?.success && <p className={ui.success}>Product saved.</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={ui.btnPrimary}>
          {pending ? "Saving..." : "Save product"}
        </button>
        <Link href="/admin/products" className={ui.btnSecondary}>Cancel</Link>
      </div>
    </form>
  );
}
