"use client"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { ROUTES } from "@/lib/constants"
import { useUser } from "@clerk/nextjs"
import { BoltIcon, GroupIcon, PackageIcon, PackagePlusIcon, ShoppingBagIcon, SquareTextIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"
import { NavSecondary } from "./nav-secondary"
import { Separator } from "./ui/separator"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isSignedIn, isLoaded, user } = useUser();

  const role = user?.publicMetadata.role;

  const { setOpenMobile, isMobile } = useSidebar();

  const data = {
    navMain: [
      {
        title: "Daftar Produk",
        url: ROUTES.DASHBOARD.HOME,
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
          url: ROUTES.DASHBOARD.ADMIN,
          icon: (
            <GroupIcon />
          ),
        },
        {
          title: "Laporan Penjualan",
          url: ROUTES.DASHBOARD.ADMIN,
          icon: (
            <SquareTextIcon />
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
              render={<Link href={ROUTES.DASHBOARD.HOME} />}
              onClick={() => { if (isMobile) setOpenMobile(false) }}
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
              {/* Tombol pembungkus dengan ukuran yang sama (size="lg") */}
              <SidebarMenuButton size="lg" className="pointer-events-none select-none">
                {/* Placeholder untuk Avatar */}
                <div className="size-8 rounded-lg bg-foreground/40 animate-pulse shrink-0" />

                {/* Placeholder untuk Teks (Nama & Email) */}
                <div className="grid flex-1 text-left text-sm leading-tight gap-1.5">
                  {/* Baris Nama */}
                  <div className="h-4 w-28 bg-foreground/40 animate-pulse rounded" />
                  {/* Baris Email */}
                  <div className="h-3 w-36 bg-foreground/20 animate-pulse rounded" />
                </div>

                {/* Placeholder untuk Ellipsis Icon */}
                <div className="ml-auto size-4 bg-foreground/40 animate-pulse rounded-full shrink-0" />
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
