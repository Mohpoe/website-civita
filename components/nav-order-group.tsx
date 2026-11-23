"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface OrderNavItem {
  title: string;
  url: string;
  icon: React.ReactNode;
}

const STORAGE_KEY = "civita:order-nav-open";

function matchesPath(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`);
}

/**
 * Grup "Pesanan Saya" di sidebar.
 *
 * Produk dan jasa punya tujuan yang sama, jadi keduanya dikelompokkan agar
 * tidak terlihat seperti dua menu yang berbeda jauh. Grup otomatis terbuka
 * saat salah satu halamannya aktif.
 */
export function NavOrderGroup({ items }: { items: OrderNavItem[] }) {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = !isMobile && state === "collapsed";

  const activeUrl = items
    .filter((item) => matchesPath(pathname, item.url))
    .sort((a, b) => b.url.length - a.url.length)[0]?.url;

  const [open, setOpen] = useState<boolean>(() => Boolean(activeUrl));

  useEffect(() => {
    let stored = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw !== null) stored = raw === "true";
    } catch {
      stored = true;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- membaca preferensi dari localStorage setelah mount
    setOpen(Boolean(activeUrl) || stored);
  }, [activeUrl]);

  const setGroupOpen = (next: boolean) => {
    setOpen(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // localStorage bisa diblokir; abaikan dan tetap pakai state di memori.
    }
  };

  return (
    <SidebarGroup className="gap-1 py-1">
      <Collapsible.Root open={collapsed || open} onOpenChange={setGroupOpen}>
        <Collapsible.Trigger
          className={cn(
            "flex h-8 w-full shrink-0 items-center gap-1 rounded-md px-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/60 ring-sidebar-ring outline-hidden transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:ring-2",
            "group-data-[collapsible=icon]:hidden",
          )}
        >
          <span className="truncate">Pesanan Saya</span>
          <ChevronRightIcon
            className={cn(
              "ml-auto size-3.5 shrink-0 transition-transform duration-200",
              (collapsed || open) && "rotate-90",
            )}
          />
        </Collapsible.Trigger>
        <Collapsible.Panel className="-mx-0.5 -mb-0.5 h-[var(--collapsible-panel-height)] overflow-hidden px-0.5 pb-0.5 transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={item.url === activeUrl}
                    tooltip={item.title}
                    render={<Link href={item.url} />}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
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
    </SidebarGroup>
  );
}
