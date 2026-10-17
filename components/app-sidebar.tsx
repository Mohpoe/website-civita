"use client"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { ROUTES } from "@/lib/constants"
import { useUser } from "@clerk/nextjs"
import { GroupIcon, HomeIcon, PackageIcon, PackagePlusIcon, ShoppingBagIcon, SquareTextIcon, UsersIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"
import { NavSecondary } from "./nav-secondary"
import { Separator } from "./ui/separator"
import { Skeleton } from "./ui/skeleton"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isSignedIn, isLoaded, user } = useUser();

  const role = user?.publicMetadata.role;

  const { setOpenMobile, isMobile } = useSidebar();

  const data = {
    navMain: [
      {
        title: "Daftar Produk",
        url: ROUTES.DASHBOARD.HOME,
        special: true,
        icon: (
          <ShoppingBagIcon />
        ),
      },
      {
        title: "Pesanan Saya",
        url: ROUTES.DASHBOARD.INVENTORY,
        icon: (
          <PackageIcon />
        ),
      },
    ],
    navSecondary: role === "admin"
      ? [
        {
          title: "Kelola Produk",
          url: ROUTES.DASHBOARD.ADMIN,
          icon: (
            <PackagePlusIcon />
          ),
        },
        {
          title: "Kelola Kategori",
          url: ROUTES.DASHBOARD.CATEGORY,
          icon: (
            <GroupIcon />
          ),
        },
        {
          title: "Laporan Penjualan",
          url: ROUTES.DASHBOARD.REPORT,
          icon: (
            <SquareTextIcon />
          ),
        },
        {
          title: "[TBA] Kelola Pengguna",
          url: ROUTES.DASHBOARD.USERS,
          icon: (
            <UsersIcon />
          ),
        },
      ]
      : [],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href={ROUTES.ROOT} />}
              onClick={() => setOpenMobile(!isMobile)}
            >
              <Image alt="Logo" src="/assets/Icon.svg" className="size-5" width={100} height={100} />
              <span className="text-base font-bold">CIVITA.ID</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <NavMain items={data.navMain} />
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
    </Sidebar>
  )
}
