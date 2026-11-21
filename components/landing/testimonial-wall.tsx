"use client";

import { useSiteSettings } from "@/components/site-settings-provider";
import { Skeleton } from "@/components/ui/skeleton";
import type { Testimonial } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

/** Jumlah kartu maksimal yang tampil; sisanya tetap tersimpan di dashboard. */
const MAX_CARDS = 10;
const MOBILE_CARDS = 6;

type Accent = "coral" | "sage" | "butter" | "sky" | "lilac";

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

interface CardSlot {
  key: string;
  /** Posisi dan lebar dalam persen terhadap panggung 3D. */
  left: number;
  top: number;
  width: number;
  /** Rotasi statis supaya kartu terasa ditempel manual, bukan grid kaku. */
  rotate: number;
  /** Kedalaman kartu (px). Negatif = jauh di belakang. */
  depth: number;
  /** Jarak gerak parallax scroll (px). Kartu depan bergerak lebih jauh. */
  travel: number;
  /** Jarak gerak parallax kursor (px). */
  mouse: number;
  /** Kemiringan 3D saat kursor bergerak (derajat). */
  tilt: number;
  z: number;
  accent: Accent;
  featured?: boolean;
  /** Kartu terkecil hanya ditampilkan di layar lebar. */
  hideBelowLg?: boolean;
  sizes: string;
}

/**
 * Susunan asimetris dengan hierarki kedalaman.
 *
 * Urutan array sekaligus menjadi prioritas pengisian: kartu utama lebih dulu,
 * lalu pendukung. Kalau testimoni di database lebih sedikit dari jumlah slot,
 * panggung tetap seimbang karena slot belakang yang kosong tidak dipaksa ada.
 */
const SLOTS: CardSlot[] = [
  {
    key: "main",
    left: 34,
    top: 10,
    width: 32,
    rotate: -1.2,
    depth: 0,
    travel: 52,
    mouse: 10,
    tilt: 4,
    z: 30,
    accent: "coral",
    featured: true,
    sizes: "(max-width: 768px) 100vw, 34vw",
  },
  {
    key: "mid-left",
    left: 1,
    top: 28,
    width: 20,
    rotate: 2.6,
    depth: -110,
    travel: 36,
    mouse: 6,
    tilt: 3,
    z: 12,
    accent: "sage",
    sizes: "(max-width: 768px) 50vw, 22vw",
  },
  {
    key: "mid-right",
    left: 78,
    top: 26,
    width: 20,
    rotate: -2.8,
    depth: -95,
    travel: 40,
    mouse: 7,
    tilt: 3,
    z: 13,
    accent: "lilac",
    sizes: "(max-width: 768px) 50vw, 22vw",
  },
  {
    key: "near-left",
    left: 14,
    top: 50,
    width: 18,
    rotate: -3.4,
    depth: 110,
    travel: 72,
    mouse: 16,
    tilt: 5,
    z: 44,
    accent: "sky",
    sizes: "(max-width: 768px) 50vw, 20vw",
  },
  {
    key: "near-right",
    left: 67,
    top: 52,
    width: 18,
    rotate: 3.2,
    depth: 130,
    travel: 78,
    mouse: 18,
    tilt: 5,
    z: 45,
    accent: "butter",
    sizes: "(max-width: 768px) 50vw, 20vw",
  },
  {
    key: "back-left",
    left: 8,
    top: 3,
    width: 18,
    rotate: -5,
    depth: -240,
    travel: 16,
    mouse: 4,
    tilt: 2,
    z: 4,
    accent: "butter",
    sizes: "(max-width: 768px) 50vw, 20vw",
  },
  {
    key: "back-right",
    left: 74,
    top: 4,
    width: 18,
    rotate: 4.5,
    depth: -260,
    travel: 14,
    mouse: 3,
    tilt: 2,
    z: 3,
    accent: "sky",
    sizes: "(max-width: 768px) 50vw, 20vw",
  },
  {
    key: "back-center",
    left: 42,
    top: 3,
    width: 16,
    rotate: 2,
    depth: -280,
    travel: 10,
    mouse: 2,
    tilt: 1.5,
    z: 2,
    accent: "lilac",
    hideBelowLg: true,
    sizes: "(max-width: 768px) 40vw, 18vw",
  },
  {
    key: "front-left",
    left: 3,
    top: 58,
    width: 13,
    rotate: 5,
    depth: 190,
    travel: 98,
    mouse: 22,
    tilt: 7,
    z: 54,
    accent: "coral",
    hideBelowLg: true,
    sizes: "(max-width: 768px) 40vw, 15vw",
  },
  {
    key: "front-right",
    left: 84,
    top: 56,
    width: 13,
    rotate: -5,
    depth: 210,
    travel: 106,
    mouse: 24,
    tilt: 7,
    z: 55,
    accent: "sage",
    hideBelowLg: true,
    sizes: "(max-width: 768px) 40vw, 15vw",
  },
];

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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax kursor memakai spring agar gerakannya halus, bukan mengikuti
  // pointer secara mentah. Nilainya dinormalisasi -0.5..0.5 terhadap panggung.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 70, damping: 18, mass: 0.4 });
  const smoothY = useSpring(pointerY, { stiffness: 70, damping: 18, mass: 0.4 });

  // Render awal memakai urutan server supaya tidak hydration mismatch,
  // lalu diacak di klien setiap kali halaman dibuka.
  const [items, setItems] = useState(() => testimonials.slice(0, MAX_CARDS));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pengacakan dilakukan setelah mount agar aman saat hidrasi
    setItems(shuffle(testimonials).slice(0, MAX_CARDS));
  }, [testimonials]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

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
            {/* Panggung 3D: kartu melayang, bertumpuk, dan bergerak per lapisan. */}
            <div
              className="relative mt-12 hidden md:block"
              style={{ perspective: "1600px" }}
              onPointerMove={handlePointerMove}
              onPointerLeave={resetPointer}
            >
              <ul
                className="relative h-[600px] w-full list-none lg:h-[720px]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {items.map((testimonial, index) => {
                  const slot = SLOTS[index];
                  if (!slot) return null;

                  return (
                    <FloatingCard
                      key={testimonial.id}
                      slot={slot}
                      testimonial={testimonial}
                      index={index}
                      scrollYProgress={scrollYProgress}
                      pointerX={smoothX}
                      pointerY={smoothY}
                      reduceMotion={!!reduceMotion}
                      brandName={settings.brandName}
                    />
                  );
                })}
              </ul>
            </div>

            {/* Mobile: grid dua kolom dengan offset dan rotasi kecil. */}
            <ul className="mt-8 grid list-none grid-cols-2 gap-3 md:hidden">
              {items.slice(0, MOBILE_CARDS).map((testimonial, index) => (
                <li
                  key={testimonial.id}
                  className={cn(
                    index === 0 && "col-span-2",
                    index % 3 === 1 && "mt-4",
                  )}
                >
                  <div
                    style={{
                      rotate: `${index === 0 ? -0.8 : index % 2 === 0 ? 1.4 : -1.6}deg`,
                    }}
                  >
                    <CardSurface
                      testimonial={testimonial}
                      accent={SLOTS[index]?.accent ?? "coral"}
                      featured={index === 0}
                      index={index}
                      sizes={index === 0 ? "90vw" : "45vw"}
                      brandName={settings.brandName}
                    />
                  </div>
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
    </section>
  );
}

function FloatingCard({
  slot,
  testimonial,
  index,
  scrollYProgress,
  pointerX,
  pointerY,
  reduceMotion,
  brandName,
}: {
  slot: CardSlot;
  testimonial: Testimonial;
  index: number;
  scrollYProgress: MotionValue<number>;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  reduceMotion: boolean;
  brandName: string;
}) {
  // Lapisan belakang bergerak lambat, lapisan depan bergerak cepat. Inilah
  // yang membuat kedalaman terasa saat halaman di-scroll.
  const scrollY = useTransform(scrollYProgress, [0, 1], [slot.travel, -slot.travel]);
  const shiftX = useTransform(pointerX, [-0.5, 0.5], [-slot.mouse, slot.mouse]);
  const shiftY = useTransform(pointerY, [-0.5, 0.5], [
    -slot.mouse * 0.55,
    slot.mouse * 0.55,
  ]);
  const rotateY = useTransform(pointerX, [-0.5, 0.5], [slot.tilt, -slot.tilt]);
  const rotateX = useTransform(pointerY, [-0.5, 0.5], [
    -slot.tilt * 0.5,
    slot.tilt * 0.5,
  ]);

  return (
    <li
      className={cn("absolute", slot.hideBelowLg && "hidden lg:block")}
      style={{
        left: `${slot.left}%`,
        top: `${slot.top}%`,
        width: `${slot.width}%`,
        zIndex: slot.z,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        style={{ y: reduceMotion ? 0 : scrollY, transformStyle: "preserve-3d" }}
        className="will-change-transform"
      >
        <motion.div
          style={{
            x: reduceMotion ? 0 : shiftX,
            y: reduceMotion ? 0 : shiftY,
            transformStyle: "preserve-3d",
          }}
        >
          <motion.div
            style={{
              rotate: slot.rotate,
              rotateX: reduceMotion ? 0 : rotateX,
              rotateY: reduceMotion ? 0 : rotateY,
              translateZ: slot.depth,
              transformStyle: "preserve-3d",
            }}
          >
            <CardSurface
              testimonial={testimonial}
              accent={slot.accent}
              featured={slot.featured}
              index={index}
              sizes={slot.sizes}
              brandName={brandName}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </li>
  );
}

function CardSurface({
  testimonial,
  accent,
  featured,
  index,
  sizes,
  brandName,
}: {
  testimonial: Testimonial;
  accent: Accent;
  featured?: boolean;
  index: number;
  sizes: string;
  brandName: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure
      className={cn(
        "rounded-md border-2 border-ink p-1.5",
        ACCENT_MAT[accent],
        featured
          ? "shadow-[8px_8px_0_0_var(--ink)]"
          : "shadow-[5px_5px_0_0_var(--ink)]",
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-sm border-2 border-on-accent/20 bg-paper-2",
          featured ? "aspect-[4/5]" : "aspect-[3/4]",
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
          {String(index + 1).padStart(2, "0")}
        </span>
      </figcaption>
    </figure>
  );
}

/** Kerangka kartu chat untuk keadaan "belum ada testimoni". */
function SkeletonChat({ featured }: { featured?: boolean }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-sm border-2 border-on-accent/20 bg-paper-2",
        featured ? "aspect-[4/5]" : "aspect-[3/4]",
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
      <div
        className="relative mx-auto mt-12 hidden h-[600px] w-full md:block lg:h-[720px]"
        style={{ perspective: "1600px" }}
      >
        <ul
          className="relative size-full list-none"
          style={{ transformStyle: "preserve-3d" }}
        >
          {SLOTS.slice(0, 5).map((slot) => (
            <li
              key={slot.key}
              className="absolute"
              style={{
                left: `${slot.left}%`,
                top: `${slot.top}%`,
                width: `${slot.width}%`,
                zIndex: slot.z,
              }}
            >
              <div
                className={cn(
                  "rounded-md border-2 border-ink p-1.5",
                  ACCENT_MAT[slot.accent],
                  slot.featured
                    ? "shadow-[8px_8px_0_0_var(--ink)]"
                    : "shadow-[5px_5px_0_0_var(--ink)]",
                )}
                style={{ rotate: `${slot.rotate}deg` }}
              >
                <SkeletonChat featured={slot.featured} />
                <div className="flex items-center justify-between gap-2 px-1 pt-1.5">
                  <Skeleton className="h-2 w-16 rounded-full bg-on-accent/25" />
                  <Skeleton className="h-2 w-4 rounded-full bg-on-accent/20" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "rounded-md border-2 border-ink p-1.5",
              ACCENT_MAT[["coral", "sage", "sky", "butter"][index] as Accent],
              index === 0
                ? "col-span-2 shadow-[6px_6px_0_0_var(--ink)]"
                : "shadow-[4px_4px_0_0_var(--ink)]",
            )}
            style={{ rotate: `${index === 0 ? -0.8 : index % 2 === 0 ? 1.4 : -1.6}deg` }}
          >
            <SkeletonChat featured={index === 0} />
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
