"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Collapsible } from "@base-ui/react/collapsible"
import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

/** Satu kelompok menu admin, mis. "Produk & Penjualan". */
export interface AdminNavGroup {
  id: string
  label: string
  items: {
    title: string
    url: string
    icon: React.ReactNode
  }[]
}

/** Preferensi buka/tutup grup disimpan agar tidak berubah setiap navigasi. */
const STORAGE_KEY = "civita:admin-nav-groups"

/** URL dianggap aktif jika sama persis atau merupakan halaman turunannya. */
function matchesPath(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`)
}

/**
 * Menu administrasi dengan grup yang bisa dilipat.
 *
 * Grup yang memuat halaman aktif otomatis terbuka, sedangkan pilihan manual
 * pengguna diingat lewat localStorage. Saat sidebar menyusut menjadi rail
 * ikon, label grup disembunyikan dan semua item tetap tampil.
 */
export function NavAdminGroups({ groups }: { groups: AdminNavGroup[] }) {
  const pathname = usePathname()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const collapsed = !isMobile && state === "collapsed"

  // Cari item paling spesifik yang cocok supaya halaman turunan tidak
  // menyalakan dua menu sekaligus (mis. daftar pesanan vs pengelolaan layanan).
  const activeUrl = groups
    .flatMap((group) => group.items)
    .filter((item) => matchesPath(pathname, item.url))
    .sort((a, b) => b.url.length - a.url.length)[0]?.url

  const activeGroupId = groups.find((group) =>
    group.items.some((item) => item.url === activeUrl),
  )?.id

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    activeGroupId ? { [activeGroupId]: true } : {},
  )

  useEffect(() => {
    let stored: Record<string, boolean> = {}
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) stored = JSON.parse(raw) as Record<string, boolean>
    } catch {
      stored = {}
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- membaca preferensi dari localStorage setelah mount
    setOpenGroups({
      ...stored,
      ...(activeGroupId ? { [activeGroupId]: true } : {}),
    })
  }, [activeGroupId])

  const setGroupOpen = (id: string, open: boolean) => {
    const next = { ...openGroups, [id]: open }
    setOpenGroups(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // localStorage bisa diblokir; abaikan dan tetap pakai state di memori.
    }
  }

  if (groups.length === 0) return null

  return (
    <SidebarGroup className="gap-1 py-1">
      {groups.map((group) => {
        const expanded = collapsed || Boolean(openGroups[group.id])

        return (
          <Collapsible.Root
            key={group.id}
            open={expanded}
            onOpenChange={(open) => setGroupOpen(group.id, open)}
          >
            <Collapsible.Trigger
              className={cn(
                "flex h-8 w-full shrink-0 items-center gap-1 rounded-md px-2 text-xs font-semibold tracking-wide text-sidebar-foreground/60 uppercase ring-sidebar-ring outline-hidden transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:ring-2",
                "group-data-[collapsible=icon]:hidden",
              )}
            >
              <span className="truncate">{group.label}</span>
              <ChevronRightIcon
                className={cn(
                  "ml-auto size-3.5 shrink-0 transition-transform duration-200",
                  expanded && "rotate-90",
                )}
              />
            </Collapsible.Trigger>
            <Collapsible.Panel className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={item.url === activeUrl}
                        tooltip={item.title}
                        render={<Link href={item.url} />}
                        onClick={() => {
                          if (isMobile) setOpenMobile(false)
                        }}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </Collapsible.Panel>
          </Collapsible.Root>
        )
      })}
    </SidebarGroup>
  )
}
