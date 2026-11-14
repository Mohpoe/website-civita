import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan layanan CIVITA: ruang lingkup layanan, pemesanan, revisi, pembayaran, pengembalian dana, dan hak kekayaan intelektual.",
  path: ROUTES.TERMS,
});

export default function TermsOfServiceLayout({ children }: { children: ReactNode }) {
  return children;
}
