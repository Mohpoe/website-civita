"use client";

import { useSiteSettings } from "@/components/site-settings-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Testimonial } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/** Jumlah kartu maksimal yang tampil; sisanya tetap tersimpan di dashboard. */
const MAX_CARDS = 9;
const MOBILE_CARDS = 6;

type Accent = "coral" | "sage" | "butter" | "sky" | "lilac";

const ACCENTS: Accent[] = ["coral", "sage", "butter", "sky", "lilac"];

const ACCENT_MAT: Record<Accent, string> = {
  coral: "bg-coral",
  sage: "bg-sage",
  butter: "bg-butter",
  sky: "bg-sky",
  lilac: "bg-lilac",
};

const ACCENT_DOT: Record<Accent, string> = {
  coral: "bg-coral-deep",
  sage: "bg-sage",
  butter: "bg-butter",
  sky: "bg-sky",
  lilac: "bg-lilac",
};

type ColumnKey = "left" | "center" | "right";

interface ColumnConfig {
  key: ColumnKey;
  /** Jarak gerak parallax vertikal (px). Kolom tengah paling cepat. */
  travel: number;
  /** Jarak turun kolom supaya susunan terasa staggered. */
  offset: string;
  /** Rasio kartu di kolom ini. */
  aspect: string;
  sizes: string;
}

/**
 * Tiga kolom asimetris: tengah lebih lebar dan lebih tinggi sebagai fokus,
 * samping lebih kecil. Offset vertikal membuat susunannya tidak kaku.
 */
const COLUMNS: ColumnConfig[] = [
  {
    key: "left",
    travel: 36,
    offset: "md:pt-14",
    aspect: "aspect-[3/4]",
    sizes: "(max-width: 768px) 92vw, 26vw",
  },
  {
    key: "center",
    travel: 70,
    offset: "",
    aspect: "aspect-[4/5]",
    sizes: "(max-width: 768px) 92vw, 40vw",
  },
  {
    key: "right",
    travel: 28,
    offset: "md:pt-7",
    aspect: "aspect-[3/4]",
    sizes: "(max-width: 768px) 92vw, 26vw",
  },
];

/**
 * Urutan pengisian kolom: tengah lebih dulu supaya tetap jadi fokus saat
 * testimoni yang tersedia sedikit. Selanjutnya bergiliran kiri dan kanan.
 */
const COLUMN_FILL_ORDER: ColumnKey[] = ["center", "left", "right"];

interface CardEntry {
  testimonial: Testimonial;
  accent: Accent;
  /** Nomor urut tampil, dihitung dari kiri ke kanan lalu atas ke bawah. */
  number: number;
}

interface PreviewTarget {
  testimonial: Testimonial;
  number: number;
}

/** Bagi testimoni ke tiga kolom dan beri nomor urut sesuai posisi tampil. */
function groupByColumn(items: Testimonial[]): Record<ColumnKey, CardEntry[]> {
  const buckets: Record<ColumnKey, Testimonial[]> = {
    left: [],
    center: [],
    right: [],
  };

  items.forEach((testimonial, index) => {
    buckets[COLUMN_FILL_ORDER[index % COLUMN_FILL_ORDER.length]].push(testimonial);
  });

  const columns: Record<ColumnKey, CardEntry[]> = {
    left: [],
    center: [],
    right: [],
  };

  let number = 0;
  (["left", "center", "right"] as const).forEach((key) => {
    columns[key] = buckets[key].map((testimonial) => {
      const entry: CardEntry = {
        testimonial,
        accent: ACCENTS[number % ACCENTS.length],
        number: number + 1,
      };
      number += 1;
      return entry;
    });
  });

  return columns;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface TestimonialWallProps {
  testimonials: Testimonial[];
}

export function TestimonialWall({ testimonials }: TestimonialWallProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { settings } = useSiteSettings();

  // Progres scroll section dipakai bersama oleh ketiga kolom. Spring tipis
  // menjaga gerakan tetap mulus saat roda mouse diputar.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 32,
    mass: 0.3,
  });

  // Render awal memakai urutan server supaya tidak hydration mismatch,
  // lalu diacak di klien setiap kali halaman dibuka.
  const [items, setItems] = useState(() => testimonials.slice(0, MAX_CARDS));

  // Testimoni yang sedang dibuka di lightbox. Null berarti lightbox tertutup.
  const [preview, setPreview] = useState<PreviewTarget | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pengacakan dilakukan setelah mount agar aman saat hidrasi
    setItems(shuffle(testimonials).slice(0, MAX_CARDS));
  }, [testimonials]);

  const columns = groupByColumn(items);

  return (
    <section
      id="testimoni"
      ref={sectionRef}
      aria-labelledby="testimoni-title"
      className="relative scroll-mt-24 overflow-hidden bg-paper py-20 md:py-28"
    >
      {/* Menyatu dengan section di atas (paper-2) dan di bawah (paper). */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-paper-2 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-paper to-transparent" />

      {/* Tekstur titik tipis ala kertas kerja, bukan bagian dari konten. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--paper-2) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral/25 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="nb-sm inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-ink">
            Testimoni
          </span>
          <h2
            id="testimoni-title"
            className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl"
          >
            Kata mereka yang sudah lolos screening.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
            Cuplikan chat asli dari klien yang memakai jasa CV ATS Friendly, resume,
            surat lamaran, dan cover letter{" "}
            <span className="font-semibold text-ink">{settings.brandName}</span>.
          </p>
        </div>

        {items.length === 0 ? (
          <TestimonialSkeleton />
        ) : (
          <>
            {/* Masonry 3 kolom: tiap kolom bergerak vertikal dengan kecepatan
                berbeda mengikuti scroll, sehingga terasa seperti lapisan 3D. */}
            <div className="mt-12 hidden gap-4 md:grid md:grid-cols-[0.9fr_1.3fr_0.9fr] md:gap-5 lg:gap-6">
              {COLUMNS.map((column) => (
                <ParallaxColumn
                  key={column.key}
                  column={column}
                  entries={columns[column.key]}
                  scrollYProgress={smoothProgress}
                  reduceMotion={!!reduceMotion}
                  brandName={settings.brandName}
                  onOpen={(entry) =>
                    setPreview({
                      testimonial: entry.testimonial,
                      number: entry.number,
                    })
                  }
                />
              ))}
            </div>

            {/* Mobile: satu kolom rapi tanpa parallax agar mudah dibaca. */}
            <ul className="mt-8 flex list-none flex-col gap-4 md:hidden">
              {items.slice(0, MOBILE_CARDS).map((testimonial, index) => (
                <li key={testimonial.id}>
                  <CardSurface
                    testimonial={testimonial}
                    accent={ACCENTS[index % ACCENTS.length]}
                    featured={index === 0}
                    number={index + 1}
                    aspect="aspect-[4/5]"
                    sizes="(max-width: 768px) 92vw, 40vw"
                    brandName={settings.brandName}
                    onOpen={() =>
                      setPreview({ testimonial, number: index + 1 })
                    }
                  />
                </li>
              ))}
            </ul>

            <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-ink-soft">
              Tangkapan layar dikirim klien lewat WhatsApp dan ditampilkan dengan izin.
              Identitas sensitif disamarkan.
            </p>
          </>
        )}
      </div>

      <TestimonialLightbox
        preview={preview}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
        brandName={settings.brandName}
      />
    </section>
  );
}

function ParallaxColumn({
  column,
  entries,
  scrollYProgress,
  reduceMotion,
  brandName,
  onOpen,
}: {
  column: ColumnConfig;
  entries: CardEntry[];
  scrollYProgress: MotionValue<number>;
  reduceMotion: boolean;
  brandName: string;
  onOpen: (entry: CardEntry) => void;
}) {
  // Kolom tengah bergerak paling jauh karena dianggap paling dekat ke mata,
  // kolom samping lebih lambat. Perbedaan kecepatan inilah ilusi kedalamannya.
  const scrollY = useTransform(scrollYProgress, [0, 1], [
    column.travel,
    -column.travel,
  ]);

  return (
    <motion.ul
      className={cn("flex list-none flex-col gap-4 md:gap-5 lg:gap-6", column.offset)}
      style={{ y: reduceMotion ? 0 : scrollY }}
    >
      {entries.map((entry, position) => (
        <li key={entry.testimonial.id}>
          <CardSurface
            testimonial={entry.testimonial}
            accent={entry.accent}
            featured={column.key === "center" && position === 0}
            number={entry.number}
            aspect={column.aspect}
            sizes={column.sizes}
            brandName={brandName}
            onOpen={() => onOpen(entry)}
          />
        </li>
      ))}
    </motion.ul>
  );
}

function CardSurface({
  testimonial,
  accent,
  featured,
  number,
  aspect,
  sizes,
  brandName,
  onOpen,
}: {
  testimonial: Testimonial;
  accent: Accent;
  featured?: boolean;
  number: number;
  aspect: string;
  sizes: string;
  brandName: string;
  onOpen?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure
      className={cn(
        "relative rounded-md border-2 border-ink p-1.5",
        ACCENT_MAT[accent],
        featured
          ? "shadow-[8px_8px_0_0_var(--ink)]"
          : "shadow-[5px_5px_0_0_var(--ink)]",
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-sm border-2 border-on-accent/20 bg-paper-2",
          aspect,
        )}
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--paper) 1px, transparent 0)",
          backgroundSize: "7px 7px",
        }}
      >
        {!loaded ? <Skeleton className="absolute inset-0 rounded-sm" /> : null}
        <Image
          src={testimonial.image_url}
          alt={testimonial.alt_text || `Tangkapan layar testimoni klien ${brandName}`}
          fill
          sizes={sizes}
          className={cn(
            "object-contain object-top transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
        {onOpen ? (
          <span className="pointer-events-none absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-full border-2 border-ink bg-paper px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink shadow-[2px_2px_0_0_var(--ink)]">
            <Maximize2 className="size-3" />
            Perbesar
          </span>
        ) : null}
      </div>

      <figcaption className="flex items-center justify-between gap-2 px-1 pt-1.5">
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            className={cn(
              "size-2 shrink-0 rounded-full border border-on-accent",
              ACCENT_DOT[accent],
            )}
          />
          <span
            className={cn(
              "truncate font-bold uppercase tracking-[0.16em] text-on-accent",
              featured ? "text-[11px]" : "text-[10px]",
            )}
          >
            {featured ? "Chat asli klien" : "Testimoni"}
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 font-mono font-bold text-on-accent/70",
            featured ? "text-[11px]" : "text-[10px]",
          )}
        >
          {String(number).padStart(2, "0")}
        </span>
      </figcaption>

      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Perbesar testimoni nomor ${number}`}
          className="absolute inset-0 z-20 cursor-zoom-in rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        />
      ) : null}
    </figure>
  );
}

/**
 * Lightbox untuk membaca screenshot chat pada ukuran penuh.
 *
 * Screenshot WhatsApp umumnya tinggi, jadi gambar ditampilkan selebar dialog
 * dan bisa digulir. Zoom memperbesar lebar gambar, bukan mengecilkan tingginya,
 * supaya teks chat tetap sebesar mungkin.
 */
function TestimonialLightbox({
  preview,
  onOpenChange,
  brandName,
}: {
  preview: PreviewTarget | null;
  onOpenChange: (open: boolean) => void;
  brandName: string;
}) {
  return (
    <Dialog open={preview !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        {preview ? (
          <LightboxBody
            key={preview.testimonial.id}
            preview={preview}
            brandName={brandName}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function LightboxBody({
  preview,
  brandName,
}: {
  preview: PreviewTarget;
  brandName: string;
}) {
  const [zoom, setZoom] = useState(1);
  const { testimonial, number } = preview;
  const percent = Math.round(zoom * 100);

  const zoomIn = () =>
    setZoom((value) => Math.min(4, Math.round((value + 0.25) * 100) / 100));
  const zoomOut = () =>
    setZoom((value) => Math.max(1, Math.round((value - 0.25) * 100) / 100));
  const toggleZoom = () => setZoom((value) => (value === 1 ? 2 : 1));

  return (
    <>
      <DialogHeader>
        <DialogTitle>Testimoni {String(number).padStart(2, "0")}</DialogTitle>
        <DialogDescription>
          Gulir untuk membaca. Gunakan tombol zoom atau klik dua kali gambar
          untuk memperbesar.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          {testimonial.alt_text || "Tangkapan layar chat klien"}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={zoomOut}
            disabled={zoom <= 1}
            aria-label="Perkecil gambar"
          >
            <ZoomOut />
          </Button>
          <span className="w-12 text-center text-xs font-bold tabular-nums">
            {percent}%
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={zoomIn}
            disabled={zoom >= 4}
            aria-label="Perbesar gambar"
          >
            <ZoomIn />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setZoom(1)}
            disabled={zoom === 1}
            aria-label="Kembalikan ukuran gambar"
          >
            <RotateCcw />
          </Button>
        </div>
      </div>

      <div className="h-[58vh] overflow-auto rounded-md border-2 border-ink bg-paper-2 sm:h-[64vh]">
        {/* eslint-disable-next-line @next/next/no-img-element -- rasio asli screenshot tidak tersimpan, jadi gambar dibiarkan mengikuti ukuran aslinya */}
        <img
          src={testimonial.image_url}
          alt={testimonial.alt_text || `Tangkapan layar testimoni klien ${brandName}`}
          style={{ width: `${zoom * 100}%` }}
          className="mx-auto block h-auto max-w-none"
          draggable={false}
          onDoubleClick={toggleZoom}
        />
      </div>
    </>
  );
}

/** Kerangka kartu chat untuk keadaan "belum ada testimoni". */
function SkeletonChat({ aspect = "aspect-[3/4]" }: { aspect?: string }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-sm border-2 border-on-accent/20 bg-paper-2",
        aspect,
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, var(--paper) 1px, transparent 0)",
        backgroundSize: "7px 7px",
      }}
    >
      <div className="flex h-7 items-center gap-1.5 border-b-2 border-on-accent/15 bg-sage px-2 md:h-8">
        <span className="size-2 shrink-0 rounded-full border border-on-accent/40 bg-paper" />
        <Skeleton className="h-1.5 w-16 rounded-full bg-on-accent/25" />
      </div>
      <div className="flex flex-col gap-1.5 p-2 md:gap-2 md:p-2.5">
        <Skeleton className="h-2.5 w-4/5 rounded-full bg-on-accent/20" />
        <Skeleton className="h-2.5 w-3/5 rounded-full bg-on-accent/20" />
        <Skeleton className="ml-auto h-2.5 w-2/3 rounded-full bg-on-accent/25" />
        <Skeleton className="h-2.5 w-3/4 rounded-full bg-on-accent/20" />
        <Skeleton className="ml-auto h-2.5 w-1/2 rounded-full bg-on-accent/25" />
      </div>
    </div>
  );
}

function TestimonialSkeleton() {
  return (
    <>
      <div className="mt-12 hidden gap-4 md:grid md:grid-cols-[0.9fr_1.3fr_0.9fr] md:gap-5 lg:gap-6">
        {COLUMNS.map((column) => (
          <div
            key={column.key}
            className={cn("flex flex-col gap-4 md:gap-5 lg:gap-6", column.offset)}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-md border-2 border-ink p-1.5",
                  ACCENT_MAT[ACCENTS[index % ACCENTS.length]],
                  column.key === "center" && index === 0
                    ? "shadow-[8px_8px_0_0_var(--ink)]"
                    : "shadow-[5px_5px_0_0_var(--ink)]",
                )}
              >
                <SkeletonChat aspect={column.aspect} />
                <div className="flex items-center justify-between gap-2 px-1 pt-1.5">
                  <Skeleton className="h-2 w-16 rounded-full bg-on-accent/25" />
                  <Skeleton className="h-2 w-4 rounded-full bg-on-accent/20" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "rounded-md border-2 border-ink p-1.5",
              ACCENT_MAT[ACCENTS[index % ACCENTS.length]],
              index === 0
                ? "shadow-[6px_6px_0_0_var(--ink)]"
                : "shadow-[4px_4px_0_0_var(--ink)]",
            )}
          >
            <SkeletonChat aspect="aspect-[4/5]" />
            <div className="flex items-center justify-between gap-2 px-1 pt-1.5">
              <Skeleton className="h-2 w-14 rounded-full bg-on-accent/25" />
              <Skeleton className="h-2 w-4 rounded-full bg-on-accent/20" />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-ink-soft">
        Testimoni sedang disiapkan. Chat admin untuk melihat contoh hasil sebelumnya.
      </p>
    </>
  );
}
