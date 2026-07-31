"use client";

import { usePathname } from "next/navigation";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";

const BARE_ROUTES = ["/admin/login", "/admin/setup"];

export default function AdminRootLayout({ children }) {
  const pathname = usePathname();

  if (BARE_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  return <AdminSidebarLayout>{children}</AdminSidebarLayout>;
}
