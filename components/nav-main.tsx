"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Badge } from "./ui/badge"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    special?: boolean | null
  }[]
}) {
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                className="text-base md:text-sm"
                tooltip={item.title}
                render={<Link href={item.url} />}
                onClick={() => { if (isMobile) setOpenMobile(false) }}
              >
                {item.icon}
                <span>{item.title}</span>
                {item.special && (
                  <>
                    <div className="ml-auto text-[.6rem] bg-foreground text-background py-0.5 px-2 rounded-full opacity-90 animate-bounce">Baru!</div>
                    {/* <Badge className="ml-auto text-[.6rem]">Baru!</Badge> */}
                    {/* <span className="bg-foreground w-1.5 h-1.5 inline-block rounded-full animate-ping" /> */}
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
