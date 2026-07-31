import Link from "next/link";
import { AdminCard } from "@/components/admin/AdminSidebarLayout";
import { ui } from "@/components/admin/admin-ui";
import {
  IconProducts,
  IconGallery,
  IconTestimonials,
  IconEnquiries,
  IconPublish,
  IconCategories,
  IconContact,
  IconClock,
  IconCheck,
  IconArrowRight,
  IconDatabase,
  IconSparkle,
  IconExternal,
} from "@/components/admin/AdminIcons";
import { publishCatalogFormAction } from "@/app/admin/actions/products";
import { publishSiteContentFormAction } from "@/app/admin/actions/site-content";

const QUICK_ACTIONS = [
  { href: "/admin/products", label: "Products", desc: "Manage catalog", icon: IconProducts, color: "from-violet-500 to-indigo-600" },
  { href: "/admin/categories", label: "Categories", desc: "Product lines", icon: IconCategories, color: "from-emerald-500 to-teal-600" },
  { href: "/admin/gallery", label: "Gallery", desc: "Install photos", icon: IconGallery, color: "from-amber-500 to-orange-600" },
  { href: "/admin/testimonials", label: "Reviews", desc: "Customer quotes", icon: IconTestimonials, color: "from-rose-500 to-pink-600" },
  { href: "/admin/contact", label: "Contact", desc: "Business info", icon: IconContact, color: "from-cyan-500 to-sky" },
  { href: "/admin/enquiries", label: "Enquiries", desc: "Form leads", icon: IconEnquiries, color: "from-fuchsia-500 to-purple-600" },
];

function formatDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function initials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminDashboardView({
  liveProducts,
  dbCounts,
  recentEnquiries = [],
  categoriesCount = 0,
}) {
  const newEnquiries = dbCounts?.newEnquiries ?? 0;
  const dbProducts = dbCounts?.products ?? null;
  const inSync = dbProducts !== null && dbProducts === liveProducts;

  const stats = [
    {
      label: "Live products",
      value: liveProducts,
      hint: "Published on website",
      icon: IconProducts,
      gradient: "from-violet-500 to-indigo-600",
      glow: "shadow-violet-500/20",
      href: "/admin/products",
    },
    {
      label: "Database",
      value: dbProducts ?? "—",
      hint: inSync ? "In sync with live" : "May need publish",
      icon: IconDatabase,
      gradient: "from-sky to-blue-600",
      glow: "shadow-sky/25",
      href: "/admin/products",
      status: inSync ? "synced" : "pending",
    },
    {
      label: "Gallery",
      value: dbCounts?.gallery ?? "—",
      hint: "Installation photos",
      icon: IconGallery,
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/20",
      href: "/admin/gallery",
    },
    {
      label: "New enquiries",
      value: newEnquiries,
      hint: "Awaiting response",
      icon: IconEnquiries,
      gradient: "from-fuchsia-500 to-purple-600",
      glow: "shadow-fuchsia-500/20",
      href: "/admin/enquiries",
      highlight: newEnquiries > 0,
    },
  ];

  const healthItems = [
    { label: "Products", current: liveProducts, target: dbProducts || liveProducts, color: "bg-violet-500" },
    { label: "Gallery", current: dbCounts?.gallery ?? 0, target: Math.max(dbCounts?.gallery ?? 0, 1), color: "bg-amber-500" },
    { label: "Testimonials", current: dbCounts?.testimonials ?? 0, target: Math.max(dbCounts?.testimonials ?? 0, 1), color: "bg-rose-500" },
    { label: "Categories", current: categoriesCount, target: Math.max(categoriesCount, 1), color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-[#0f2d52] to-navy-deep text-white p-6 sm:p-8 lg:p-10 shadow-[0_20px_60px_-20px_rgba(11,31,58,0.5)]">
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-sky/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-cyan-400/10 blur-2xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] uppercase tracking-[0.2em] text-sky-bright font-semibold mb-4">
              <IconSparkle className="w-3.5 h-3.5" />
              Admin Dashboard
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight mb-3">
              Welcome to VK Tiles Console
            </h1>
            <p className="text-white/60 text-sm sm:text-base max-w-xl">
              Manage your product catalog, gallery, testimonials, and customer enquiries — all in one place.
            </p>
            <p className="flex items-center gap-2 text-white/40 text-xs mt-4">
              <IconClock className="w-3.5 h-3.5" />
              {formatDate()}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky to-sky-bright text-white text-sm font-semibold shadow-lg shadow-sky/30 hover:shadow-sky/50 transition-all hover:-translate-y-0.5"
            >
              Add product
              <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-all"
            >
              <IconExternal className="w-4 h-4" />
              View site
            </Link>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <PremiumStatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Bento grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Quick actions */}
        <AdminCard className="lg:col-span-7 p-6" accent="from-emerald-500 to-teal-500">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl text-navy">Quick actions</h2>
              <p className="text-sm text-gray mt-0.5">Jump to any section</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-navy text-sm">{item.label}</p>
                    <p className="text-xs text-gray">{item.desc}</p>
                  </div>
                  <IconArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-sky group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
          </div>
        </AdminCard>

        {/* Content health */}
        <AdminCard className="lg:col-span-5 p-6" accent="from-violet-500 to-indigo-500">
          <h2 className="font-display text-xl text-navy mb-1">Content overview</h2>
          <p className="text-sm text-gray mb-6">Your website content at a glance</p>
          <div className="space-y-5">
            {healthItems.map((item) => {
              const pct = Math.min(100, Math.round((item.current / item.target) * 100));
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-navy">{item.label}</span>
                    <span className="text-sm font-semibold text-navy">{item.current}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className={`mt-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${inSync ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
            {inSync ? <IconCheck className="w-4 h-4 shrink-0" /> : <IconClock className="w-4 h-4 shrink-0" />}
            {inSync ? "Catalog is synced between database and live site" : "Publish catalog to sync database with live site"}
          </div>
        </AdminCard>

        {/* Recent enquiries */}
        <AdminCard className="lg:col-span-7 p-6" accent="from-fuchsia-500 to-purple-500">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl text-navy">Recent enquiries</h2>
              <p className="text-sm text-gray mt-0.5">Latest contact form submissions</p>
            </div>
            <Link href="/admin/enquiries" className={`text-sm ${ui.link}`}>
              View all
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="text-center py-10 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
              <IconEnquiries className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-gray">No enquiries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEnquiries.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-slate-50/50 hover:border-sky/20 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {initials(e.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-navy text-sm">{e.name}</p>
                      {e.status === "new" && (
                        <span className="px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 text-[10px] font-bold uppercase tracking-wide">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray mt-0.5 truncate">{e.inquiry_type} · {e.phone}</p>
                    <p className="text-sm text-navy/70 mt-1 line-clamp-1">{e.message}</p>
                  </div>
                  <time className="text-[10px] text-gray whitespace-nowrap shrink-0">
                    {new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </time>
                </div>
              ))}
            </div>
          )}
        </AdminCard>

        {/* Publish panel */}
        <AdminCard className="lg:col-span-5 p-6" accent="from-sky to-sky-bright">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky to-sky-bright flex items-center justify-center text-white shadow-xl shadow-sky/30">
              <IconPublish className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl text-navy">Publish to website</h2>
              <p className="text-sm text-gray">Deploy changes to the live site</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {[
              { step: "1", label: "Edit content in admin", done: true },
              { step: "2", label: "Review in database", done: dbCounts !== null },
              { step: "3", label: "Publish to live JSON", done: inSync },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-3">
                <span className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${s.done ? "bg-emerald-500 text-white" : "bg-slate-100 text-gray"}`}>
                  {s.done ? <IconCheck className="w-3.5 h-3.5" /> : s.step}
                </span>
                <span className={`text-sm ${s.done ? "text-navy font-medium" : "text-gray"}`}>{s.label}</span>
              </div>
            ))}
          </div>

          <form action={publishCatalogFormAction} className="mb-3">
            <button type="submit" className={`w-full py-3.5 ${ui.btnPrimary}`}>
              Publish product catalog
            </button>
          </form>
          <form action={publishSiteContentFormAction}>
            <button type="submit" className={`w-full py-3.5 ${ui.btnOutlineSky}`}>
              Publish gallery & contact
            </button>
          </form>
        </AdminCard>
      </div>
    </div>
  );
}

function PremiumStatCard({ label, value, hint, icon: Icon, gradient, glow, href, status, highlight }) {
  return (
    <Link href={href} className="group block">
      <div className={`relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-xl ${glow} hover:-translate-y-1 transition-all duration-300`}>
        <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray font-semibold mb-2">{label}</p>
            <p className={`font-display text-4xl bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
              {value}
            </p>
            <p className="text-xs text-gray mt-2">{hint}</p>
            {status === "synced" && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                <IconCheck className="w-3 h-3" /> Synced
              </span>
            )}
            {status === "pending" && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold">
                <IconClock className="w-3 h-3" /> Pending
              </span>
            )}
            {highlight && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-fuchsia-50 text-fuchsia-700 text-[10px] font-semibold animate-pulse">
                Action needed
              </span>
            )}
          </div>
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
