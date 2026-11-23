"use client";

import { PDF_TOOLS } from "@/lib/pdf-tools";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function PdfToolsCrossNav({ currentHref }: { currentHref: string }) {
  const others = PDF_TOOLS.filter((tool) => tool.href !== currentHref);
  if (others.length === 0) return null;

  return (
    <section aria-label="Alat PDF lainnya" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">Alat PDF Lainnya</h2>
        <Link
          href="/#tools"
          className="text-xs font-semibold text-ink underline decoration-2 underline-offset-4 hover:text-coral-deep"
        >
          Lihat semua
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {others.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="nb-sm nb-hover group flex items-center gap-3 rounded-lg bg-paper p-4"
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-ink text-on-accent ${
                  tool.accent === "red" ? "bg-coral" : "bg-butter"
                }`}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold leading-tight">
                  {tool.name}
                </div>
                <div className="mt-0.5 text-xs leading-snug text-ink-soft">
                  {tool.shortName}
                </div>
              </div>
              <ArrowRight className="size-4 shrink-0 opacity-60 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
