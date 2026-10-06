"use client"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useUser } from "@clerk/nextjs"
import { PackageIcon, Settings2Icon, ShoppingBagIcon } from "lucide-react"
import Image from "next/image"
import * as React from "react"
import { Separator } from "./ui/separator"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isSignedIn, isLoaded, user } = useUser();

  const data = {
    navMain: [
      {
        title: "Daftar Produk",
        url: "#",
        icon: (
          <ShoppingBagIcon />
        ),
      },
      {
        title: "Pesanan Saya",
        url: "#",
        icon: (
          <PackageIcon />
        ),
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "#",
        icon: (
          <Settings2Icon />
        ),
      },
    ],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
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
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        {!isLoaded || !isSignedIn ? (
          <div>Loading...</div>
        ) : (
          <NavUser />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
