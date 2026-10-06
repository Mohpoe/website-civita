import { AppSidebar } from "@/components/app-sidebar";
import { PageTitleProvider } from "@/components/context/dashboard-page-title";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashBoardLayout({ children }: LayoutProps<"/dashboard">) {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    redirect("/");
  }
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
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
        </PageTitleProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}