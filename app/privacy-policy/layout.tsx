import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Kebijakan Privasi",
  description:
    "Pelajari bagaimana CIVITA mengumpulkan, menggunakan, dan melindungi data Anda, termasuk pemrosesan file pada alat PDF dan penggunaan hasil desain sebagai portofolio.",
  path: ROUTES.POLICY,
});

export default function PrivacyPolicyLayout({ children }: { children: ReactNode }) {
  return children;
}
