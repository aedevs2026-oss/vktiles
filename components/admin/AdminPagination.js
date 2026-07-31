import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@/components/admin/AdminIcons";

function buildHref(basePath, params, page) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.perPage) sp.set("perPage", String(params.perPage));
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
    result.push(sorted[i]);
  }
  return result;
}

export default function AdminPagination({
  page = 1,
  perPage = 20,
  total = 0,
  basePath = "/admin/products",
  params = {},
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * perPage + 1;
  const to = Math.min(safePage * perPage, total);

  if (total <= perPage) return null;

  const pages = pageNumbers(safePage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-4 border-t border-slate-100 bg-slate-50/50">
      <p className="text-sm text-gray">
        Showing <span className="font-semibold text-navy">{from}</span>–
        <span className="font-semibold text-navy">{to}</span> of{" "}
        <span className="font-semibold text-navy">{total}</span> products
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <PaginationLink
          href={buildHref(basePath, params, safePage - 1)}
          disabled={safePage <= 1}
          label="Previous page"
        >
          <IconChevronLeft className="w-4 h-4" />
        </PaginationLink>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray">
              …
            </span>
          ) : (
            <PaginationLink
              key={p}
              href={buildHref(basePath, params, p)}
              active={p === safePage}
              label={`Page ${p}`}
            >
              {p}
            </PaginationLink>
          )
        )}

        <PaginationLink
          href={buildHref(basePath, params, safePage + 1)}
          disabled={safePage >= totalPages}
          label="Next page"
        >
          <IconChevronRight className="w-4 h-4" />
        </PaginationLink>
      </nav>
    </div>
  );
}

function PaginationLink({ href, children, active, disabled, label }) {
  const base =
    "inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-xl text-sm font-medium transition-all";

  if (disabled) {
    return (
      <span
        aria-label={label}
        className={`${base} text-slate-300 cursor-not-allowed`}
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }

  if (active) {
    return (
      <Link
        href={href}
        aria-label={label}
        aria-current="page"
        className={`${base} bg-gradient-to-br from-sky to-sky-bright text-white shadow-md shadow-sky/30`}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={`${base} text-navy/70 hover:bg-white hover:text-navy hover:shadow-sm border border-transparent hover:border-slate-200`}
    >
      {children}
    </Link>
  );
}
