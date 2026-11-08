"use client";

import { PDF_TOOLS } from "@/lib/pdf-tools";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function PdfToolsCrossNav({ currentHref }: { currentHref: string }) {
  const others = PDF_TOOLS.filter((tool) => tool.href !== currentHref);
  if (others.length === 0) return null;

  return (
    <section aria-label="Alat PDF lainnya" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg md:text-xl font-black tracking-tight">Alat PDF Lainnya</h2>
        <Link href="/#tools" className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-[#ef3936] dark:hover:text-[#d9302d]">
          Lihat semua
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {others.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="group flex items-center gap-3 p-4 rounded-2xl border-2 border-foreground bg-background shadow-[3px_3px_0px_0px] shadow-foreground hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px] transition-all"
            >
              <div className={`w-10 h-10 shrink-0 rounded-xl border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px] shadow-foreground ${tool.accent === "red" ? "bg-[#ef3936] dark:bg-[#d9302d] text-white" : "bg-[#f68e51] dark:bg-[#d97941] text-black"}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-black text-sm leading-tight">{tool.name}</div>
                <div className="text-xs font-medium text-foreground/70 leading-snug mt-0.5">{tool.shortName}</div>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
