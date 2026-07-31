"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions/auth";
import { ui } from "@/components/admin/admin-ui";
import {
  IconDashboard,
  IconProducts,
  IconCategories,
  IconGallery,
  IconTestimonials,
  IconContact,
  IconEnquiries,
  IconExternal,
  IconLogout,
  IconPlus,
} from "@/components/admin/AdminIcons";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: IconDashboard, color: "from-sky to-blue-500", bg: "bg-sky-soft" },
  { href: "/admin/products", label: "Products", icon: IconProducts, color: "from-violet-500 to-indigo-500", bg: "bg-violet-50" },
  { href: "/admin/categories", label: "Categories", icon: IconCategories, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50" },
  { href: "/admin/gallery", label: "Gallery", icon: IconGallery, color: "from-amber-500 to-orange-500", bg: "bg-amber-50" },
  { href: "/admin/testimonials", label: "Testimonials", icon: IconTestimonials, color: "from-rose-500 to-pink-500", bg: "bg-rose-50" },
  { href: "/admin/contact", label: "Contact & Email", icon: IconContact, color: "from-cyan-500 to-sky", bg: "bg-cyan-50" },
  { href: "/admin/enquiries", label: "Enquiries", icon: IconEnquiries, color: "from-fuchsia-500 to-purple-500", bg: "bg-fuchsia-50" },
];

export default function AdminSidebarLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-soft/20 to-white text-navy flex">
      <aside className="hidden lg:flex w-[270px] flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200/80 shadow-[4px_0_24px_-12px_rgba(11,31,58,0.12)]">
        <div className="p-6 border-b border-slate-100">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky to-sky-bright flex items-center justify-center shadow-lg shadow-sky/25 group-hover:scale-105 transition-transform">
              <span className="font-display text-white text-lg font-bold">VK</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-sky font-semibold">VK Tiles</p>
              <p className="font-display text-lg font-semibold text-navy leading-tight">Admin Console</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-white to-slate-50 shadow-md shadow-slate-200/60 border border-slate-200/80 text-navy font-semibold"
                    : "text-navy/65 hover:bg-slate-50 hover:text-navy border border-transparent"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
                    active
                      ? `bg-gradient-to-br ${item.color} text-white shadow-md`
                      : `${item.bg} text-navy/70`
                  }`}
                >
                  <Icon className="w-[17px] h-[17px]" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm border border-slate-200 text-navy/80 hover:bg-sky-soft/40 hover:border-sky/30 transition-all"
          >
            <IconExternal className="w-4 h-4 text-sky" />
            View website
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm border border-slate-200 text-navy/80 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
            >
              <IconLogout className="w-4 h-4" />
              Secure logout
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky to-sky-bright flex items-center justify-center">
              <span className="text-white text-xs font-bold">VK</span>
            </div>
            <span className="font-display text-lg text-navy">Admin</span>
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-gray hover:text-navy">
              Logout
            </button>
          </form>
        </header>

        <div className="lg:hidden overflow-x-auto border-b border-slate-200 bg-white px-2 py-2">
          <div className="flex gap-2 min-w-max">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors ${
                    active
                      ? `bg-gradient-to-r ${item.color} text-white font-medium shadow-sm`
                      : "text-gray hover:text-navy bg-slate-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export function AdminPageHeader({ title, subtitle, actions, badge }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        {badge && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-sky-soft to-white border border-sky/20 text-[10px] uppercase tracking-[0.2em] text-sky font-semibold mb-3">
            {badge}
          </span>
        )}
        {!badge && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-sky font-semibold mb-2">Administration</p>
        )}
        <h1 className="font-display text-2xl sm:text-3xl text-navy">{title}</h1>
        {subtitle && <p className="text-gray text-sm mt-1.5 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function AdminCard({ children, className = "", accent }) {
  return (
    <div
      className={`relative bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl shadow-[0_8px_30px_-12px_rgba(11,31,58,0.12)] overflow-hidden ${className}`}
    >
      {accent && (
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent}`} />
      )}
      {children}
    </div>
  );
}

export function AdminPrimaryButton({ children, className = "", ...props }) {
  return (
    <button type="button" className={`${ui.btnPrimary} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function AdminAddLink({ href, children }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-4 py-2.5 ${ui.btnPrimary}`}
    >
      <IconPlus className="w-4 h-4" />
      {children}
    </Link>
  );
}

export function AdminTable({ children }) {
  return <table className={ui.table}>{children}</table>;
}

export function AdminTableHead({ children }) {
  return <thead className={ui.thead}>{children}</thead>;
}

export function AdminTableRow({ children, className = "" }) {
  return (
    <tr className={`${ui.tr} hover:bg-sky-soft/20 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function AdminStatCard({ label, value, icon: Icon, gradient, accent }) {
  return (
    <AdminCard className="p-5" accent={accent}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray mb-1.5 font-semibold">{label}</p>
          <p className={`font-display text-3xl bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg text-white shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </AdminCard>
  );
}
