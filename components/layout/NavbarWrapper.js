import { getProducts } from "@/lib/products";
import Navbar from "@/components/layout/Navbar";

export default function NavbarWrapper() {
  const previewProducts = getProducts().filter((p) => p.image).slice(0, 150);
  return <Navbar previewProducts={previewProducts} />;
}
