"use client"

import { NavAdminGroups, type AdminNavGroup } from "@/components/nav-admin-groups"
import { NavMain } from "@/components/nav-main"
import { NavOrderGroup } from "@/components/nav-order-group"
import { NavUser } from "@/components/nav-user"
import { useSiteSettings } from "@/components/site-settings-provider"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, useSidebar } from "@/components/ui/sidebar"
import { ROUTES } from "@/lib/constants"
import { useUser } from "@clerk/nextjs"
import { BriefcaseBusinessIcon, FileDownIcon, FileImageIcon, FileTextIcon, FileType2Icon, Grid2X2PlusIcon, HelpCircleIcon, ImagesIcon, InboxIcon, PackageIcon, PackagePlusIcon, ScissorsIcon, SettingsIcon, ShoppingBagIcon, SquareTextIcon, StarPlusIcon, TagPlusIcon, UsersIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"
import { NavDocuments } from "./nav-documents"
import { NavSecondary } from "./nav-secondary"
import { Separator } from "./ui/separator"
import { Skeleton } from "./ui/skeleton"

export function AppSidebar({ hasNewProducts, ...props }: React.ComponentProps<typeof Sidebar> & { hasNewProducts?: boolean }) {
  const { isSignedIn, isLoaded, user } = useUser();
  const { settings } = useSiteSettings();

  const role = user?.publicMetadata.role;
  const isAdmin = role === "admin" || role === "superadmin";
  const isSuperadmin = role === "superadmin";

  const { setOpenMobile, isMobile } = useSidebar();

  const data = {
    navMain: [
      {
        title: "Katalog Produk",
        url: ROUTES.PRODUCTS,
        special: hasNewProducts,
        icon: (
          <ShoppingBagIcon />
        ),
      },
      {
        title: "Katalog Jasa",
        url: ROUTES.SERVICES,
        icon: (
          <BriefcaseBusinessIcon />
        ),
      },
    ],
    navOrders: [
      {
        title: "Produk",
        url: ROUTES.DASHBOARD.ORDER_PRODUCTS,
        icon: <PackageIcon />,
      },
      {
        title: "Jasa",
        url: ROUTES.DASHBOARD.ORDER_SERVICES,
        icon: <InboxIcon />,
      },
    ],
    navSecondary: [
      {
        title: "Bantuan",
        url: ROUTES.HELP,
        icon: (
          <HelpCircleIcon />
        ),
      },
    ],
    // Menu administrasi dikelompokkan agar tidak menjadi daftar panjang.
    navAdmin: (isAdmin
      ? [
        {
          id: "katalog-penjualan",
          label: "Produk & Penjualan",
          items: [
            {
              title: "Kelola Produk",
              url: ROUTES.DASHBOARD.ADMIN,
              icon: <PackagePlusIcon />,
            },
            {
              title: "Kelola Kategori",
              url: ROUTES.DASHBOARD.CATEGORY,
              icon: <TagPlusIcon />,
            },
          ],
        },
        {
          id: "layanan-jasa",
          label: "Layanan Jasa",
          items: [
            {
              title: "Pesanan Jasa Masuk",
              url: ROUTES.DASHBOARD.ADMIN_SERVICES,
              icon: <InboxIcon />,
            },
            ...(isSuperadmin
              ? [
                {
                  title: "Kelola Layanan",
                  url: ROUTES.DASHBOARD.SERVICE_CATALOG,
                  icon: <Grid2X2PlusIcon />,
                },
              ]
              : []),
          ],
        },
        {
          id: "laporan",
          label: "Laporan",
          items: [
            {
              title: "Laporan Penjualan",
              url: ROUTES.DASHBOARD.REPORT,
              icon: <SquareTextIcon />,
            },
          ],
        },
        {
          id: "situs-akses",
          label: "Situs & Akses",
          items: [
            ...(isSuperadmin
              ? [
                {
                  title: "Pengaturan Situs",
                  url: ROUTES.DASHBOARD.SETTINGS,
                  icon: <SettingsIcon />,
                },
                {
                  title: "Kelola Testimoni",
                  url: ROUTES.DASHBOARD.TESTIMONIALS,
                  icon: <StarPlusIcon />,
                },
                {
                  title: "Kelola Pengguna",
                  url: ROUTES.DASHBOARD.USERS,
                  icon: <UsersIcon />,
                },
              ]
              : []),
          ],
        },
      ].filter((group) => group.items.length > 0) as AdminNavGroup[]
      : []),
    documents: [
      {
        name: "PDF Merger",
        url: ROUTES.PDF_TOOLS.PDF_MERGER,
        icon: <FileTextIcon />,
        external: true,
      },
      {
        name: "PDF Splitter",
        url: ROUTES.PDF_TOOLS.PDF_SPLITTER,
        icon: <ScissorsIcon />,
        external: true,
      },
      {
        name: "PDF Compressor",
        url: ROUTES.PDF_TOOLS.PDF_COMPRESSOR,
        icon: <FileDownIcon />,
        external: true,
      },
      {
        name: "PDF to Image",
        url: ROUTES.PDF_TOOLS.PDF_TO_IMAGE,
        icon: <FileImageIcon />,
        external: true,
      },
      {
        name: "PDF to Word",
        url: ROUTES.PDF_TOOLS.PDF_TO_WORD,
        icon: <FileType2Icon />,
        external: true,
      },
      {
        name: "Image to PDF",
        url: ROUTES.PDF_TOOLS.IMAGE_TO_PDF,
        icon: <ImagesIcon />,
        external: true,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              tooltip={settings.brandName}
              render={<Link href={ROUTES.ROOT} />}
              onClick={() => setOpenMobile(!isMobile)}
            >
              <Image alt="Logo" src={settings.logoUrl} className="size-5" width={100} height={100} />
              <span className="text-base font-bold group-data-[collapsible=icon]:hidden">{settings.brandName}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavOrderGroup items={data.navOrders} />
        <NavAdminGroups groups={data.navAdmin} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {!isLoaded || !isSignedIn ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="pointer-events-none select-none">
                <Skeleton className="size-10 rounded-lg shrink-0" />
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="size-4 ml-auto" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <NavUser />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
