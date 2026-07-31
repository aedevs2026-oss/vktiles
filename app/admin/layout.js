import AdminRootLayout from "@/components/admin/AdminRootLayout";

export const metadata = {
  title: "Admin | VK Tiles",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminRootLayout>{children}</AdminRootLayout>;
}
