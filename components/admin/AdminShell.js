import Link from "next/link";
import { logoutAction } from "@/app/admin/actions/auth";

export default function AdminShell({ children, title }) {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-navy">
      <header className="bg-navy text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-display text-lg font-semibold">
              VK Tiles Admin
            </Link>
            <nav className="hidden md:flex items-center gap-5 text-sm text-white/80">
              <Link href="/admin" className="hover:text-white">
                Dashboard
              </Link>
              <Link href="/admin/products" className="hover:text-white">
                Products
              </Link>
              <Link href="/admin/categories" className="hover:text-white">
                Categories
              </Link>
              <Link href="/" className="hover:text-white" target="_blank">
                View site
              </Link>
            </nav>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <div className="mb-8">
            <h1 className="font-display text-3xl text-navy">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
