import { AppSidebar } from "@/components/app-sidebar";
import { PageTitleProvider } from "@/components/context/dashboard-page-title";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Script from "next/script";
import { getProducts } from "@/lib/actions/product";
import { Product } from "@/types/global";

export const metadata: Metadata = {
  title: "Dashboard",
  // Seluruh area dashboard bersifat privat, jadi jangan pernah diindeks.
  robots: {
    index: false,
    follow: false,
  },
};

/** Produk dianggap baru jika dibuat dalam 14 hari terakhir. */
function isNewProduct(createdAt: string) {
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  return new Date(createdAt).getTime() >= twoWeeksAgo;
}

export default async function DashBoardLayout({ children }: LayoutProps<"/dashboard">) {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    redirect("/");
  }

  const products = (await getProducts(true)) as Product[];
  const hasNewProducts = products.some((p) => isNewProduct(p.created_at));

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" hasNewProducts={hasNewProducts} />
      <SidebarInset>
        <PageTitleProvider defaultTitle="Dashboard">
          <SiteHeader />
          <main className="p-4 lg:p-6">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 md:gap-6">
                {children}
              </div>
            </div>
          </main>
          <Script
            src="https://app.midtrans.com/snap/snap.js"
            data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
            strategy="lazyOnload" // Tidak akan memperlambat loading web Anda
          />
        </PageTitleProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}