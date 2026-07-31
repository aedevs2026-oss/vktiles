import Link from "next/link";
import Image from "next/image";
import {
  AdminPageHeader,
  AdminCard,
  AdminAddLink,
  AdminTable,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin/AdminSidebarLayout";
import { ui } from "@/components/admin/admin-ui";
import { IconSearch, IconEdit } from "@/components/admin/AdminIcons";
import AdminPagination from "@/components/admin/AdminPagination";
import DeleteButton from "@/components/admin/DeleteButton";
import { getAdminProducts, deleteProductFormAction } from "@/app/admin/actions/products";
import { getProducts } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const PER_PAGE_OPTIONS = [10, 20, 50];

function paginateLocal(products, page, perPage) {
  const safePage = Math.max(1, page);
  const safePerPage = Math.min(100, Math.max(10, perPage));
  const from = (safePage - 1) * safePerPage;
  return {
    products: products.slice(from, from + safePerPage),
    total: products.length,
    page: safePage,
    perPage: safePerPage,
  };
}

function filterLocal(products, search, category) {
  let list = products;
  if (category) list = list.filter((p) => (p.category || p.category_slug) === category);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((p) => p.name?.toLowerCase().includes(q));
  }
  return list;
}

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.q || "";
  const category = params?.category || "";
  const page = Math.max(1, Number(params?.page) || 1);
  const perPage = PER_PAGE_OPTIONS.includes(Number(params?.perPage))
    ? Number(params.perPage)
    : 20;

  let result = { products: [], total: 0, page, perPage };

  if (isSupabaseConfigured()) {
    try {
      result = await getAdminProducts({ search, category, page, perPage });
    } catch {
      const filtered = filterLocal(getProducts(), search, category);
      result = paginateLocal(filtered, page, perPage);
    }
  } else {
    const filtered = filterLocal(getProducts(), search, category);
    result = paginateLocal(filtered, page, perPage);
  }

  const { products, total } = result;
  const paginationParams = { q: search, category, perPage };

  return (
    <>
      <AdminPageHeader
        title="Products"
        subtitle={`${total} products in your catalog`}
        actions={<AdminAddLink href="/admin/products/new">Add product</AdminAddLink>}
      />

      <AdminCard className="p-4 mb-6" accent="from-violet-500 to-indigo-500">
        <form className="flex flex-wrap items-center gap-3" method="get" action="/admin/products">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray pointer-events-none" />
            <input
              name="q"
              defaultValue={search}
              placeholder="Search products..."
              className={`pl-10 ${ui.input}`}
            />
          </div>
          <select name="category" defaultValue={category} className={`min-w-[160px] ${ui.select}`}>
            <option value="">All categories</option>
            <option value="gvt-pgvt">GVT / PGVT</option>
            <option value="wooden-strip">Wooden Strip</option>
          </select>
          <select name="perPage" defaultValue={String(perPage)} className={`min-w-[120px] ${ui.select}`}>
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
          <button type="submit" className={ui.btnGhost}>
            Apply filters
          </button>
        </form>
      </AdminCard>

      <AdminCard className="overflow-hidden" accent="from-sky to-sky-bright">
        {products.length === 0 ? (
          <p className={ui.empty}>No products found. Try adjusting your search or filters.</p>
        ) : (
          <>
            <AdminTable>
              <AdminTableHead>
                <tr>
                  <th className={ui.th}>Image</th>
                  <th className={ui.th}>Name</th>
                  <th className={ui.th}>Collection</th>
                  <th className={ui.th}>Size</th>
                  <th className={`${ui.th} text-right`}>Actions</th>
                </tr>
              </AdminTableHead>
              <tbody>
                {products.map((p) => (
                  <AdminTableRow key={p.slug}>
                    <td className={ui.td}>
                      {p.image ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-2 ring-slate-100 shadow-sm">
                          <Image
                            src={p.image}
                            alt=""
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-gray text-xs">
                          —
                        </div>
                      )}
                    </td>
                    <td className={`${ui.td} font-semibold text-navy`}>{p.name}</td>
                    <td className={ui.td}>
                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-medium">
                        {p.collection || "—"}
                      </span>
                    </td>
                    <td className={ui.td}>
                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-sky-soft text-sky text-xs font-medium">
                        {p.size || "—"}
                      </span>
                    </td>
                    <td className={`${ui.td} text-right`}>
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/admin/products/${p.id || p.slug}`} className={ui.link}>
                          <IconEdit className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                        {p.id && <DeleteButton action={deleteProductFormAction.bind(null, p.id)} />}
                      </div>
                    </td>
                  </AdminTableRow>
                ))}
              </tbody>
            </AdminTable>

            <AdminPagination
              page={result.page}
              perPage={result.perPage}
              total={total}
              basePath="/admin/products"
              params={paginationParams}
            />
          </>
        )}
      </AdminCard>
    </>
  );
}
