import { PublicPageShell } from "@/components/public-page-shell";
import type { ReactNode } from "react";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return <PublicPageShell>{children}</PublicPageShell>;
}
