import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export type FaqEntry = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: readonly FaqEntry[];
  className?: string;
  /**
   * "divided" menampilkan garis pemisah antar pertanyaan di dalam satu panel.
   * "card" menampilkan setiap pertanyaan sebagai kartu neo-brutalis terpisah.
   */
  variant?: "divided" | "card";
  triggerClassName?: string;
  contentClassName?: string;
};

const ITEM_VARIANTS = {
  divided: "not-last:border-b-2 not-last:border-ink/10",
  card: "nb rounded-lg bg-paper px-4 not-last:border-b-2",
} as const;

/**
 * Daftar pertanyaan umum memakai Accordion Shadcn.
 *
 * Dipakai di pusat bantuan, panduan alat PDF, dan beranda supaya perilaku
 * buka-tutup, aksesibilitas, dan tampilannya sama di semua halaman.
 */
export function FaqAccordion({
  items,
  className,
  variant = "divided",
  triggerClassName,
  contentClassName,
}: FaqAccordionProps) {
  return (
    <Accordion className={cn("w-full", className)}>
      {items.map((item) => (
        <AccordionItem
          key={item.question}
          value={item.question}
          className={ITEM_VARIANTS[variant]}
        >
          <AccordionTrigger
            className={cn(
              "items-center gap-4 py-4 text-left text-sm font-bold text-ink hover:no-underline md:text-base",
              triggerClassName,
            )}
          >
            {item.question}
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "pb-4 text-sm leading-relaxed text-ink-soft md:text-base",
              contentClassName,
            )}
          >
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
