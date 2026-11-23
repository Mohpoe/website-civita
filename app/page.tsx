import { FaqAccordion } from "@/components/faq-accordion";
import { ServiceOrderLink } from "@/components/landing/service-order-link";
import { TestimonialWall } from "@/components/landing/testimonial-wall";
import { PublicFooter } from "@/components/public-footer";
import { PublicNavigation } from "@/components/public-header";
import { ProductCard } from "@/components/products/product-card";
import { buttonVariants } from "@/components/ui/button";
import { getProducts } from "@/lib/actions/product";
import { PDF_TOOLS } from "@/lib/pdf-tools";
import { getActiveServices } from "@/lib/service-catalog";
import {
  SERVICE_HIGHLIGHTS,
  getServiceVisual,
  type ServiceAccent,
  type ServiceHighlight,
} from "@/lib/services";
import { getSiteSettings } from "@/lib/settings";
import { getSiteLinks } from "@/lib/site-config";
import { getActiveTestimonials } from "@/lib/testimonials";
import { cn, formatRupiah } from "@/lib/utils";
import {
  ArrowRight,
  ClipboardList,
  CreditCard,
  Download,
  FileCheck2,
  Languages,
  Mail,
  MessagesSquare,
  PencilRuler,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { SiWhatsapp } from "react-icons/si";

export const revalidate = 300;

const ACCENT_BG: Record<ServiceAccent, string> = {
  coral: "bg-coral",
  sage: "bg-sage",
  butter: "bg-butter",
  sky: "bg-sky",
  lilac: "bg-lilac",
};

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "ATS-friendly", detail: "Mudah dibaca sistem" },
  { icon: Languages, label: "ID & English", detail: "Dua bahasa" },
  { icon: RefreshCcw, label: "Bisa revisi", detail: "Sampai sesuai" },
  { icon: FileCheck2, label: "Rapi & siap kirim", detail: "Format PDF" },
] as const;

const PROCESS_STEPS = [
  {
    icon: MessagesSquare,
    title: "Konsultasi",
    description: "Ceritakan posisi dan perusahaan yang dilamar. Kami bantu pilih jenis berkas yang paling pas.",
  },
  {
    icon: ClipboardList,
    title: "Kirim data",
    description: "Isi data diri, pengalaman, dan pencapaian. Bisa bahasa Indonesia maupun Inggris.",
  },
  {
    icon: CreditCard,
    title: "Bayar & dikerjakan",
    description: "Pembayaran aman lewat Midtrans. Admin mengerjakan berkas dan memberi kabar lewat chat.",
  },
  {
    icon: Download,
    title: "Terima berkas",
    description: "Unduh hasil final dari dashboard. Revisi tetap bisa diminta sampai sesuai.",
  },
] as const;

const FAQ_ITEMS = [
  {
    question: "Apakah CV-nya benar-benar ATS-friendly?",
    answer:
      "Ya. Kami memakai format satu kolom, tanpa tabel, teks dalam bentuk teks asli (bukan gambar), dan judul bagian yang standar. Struktur seperti ini yang paling mudah dibaca sistem ATS.",
  },
  {
    question: "Bisa dibuat dalam bahasa Inggris?",
    answer:
      "Bisa. Semua layanan tersedia dalam bahasa Indonesia dan Inggris, termasuk CV, resume, surat lamaran, dan cover letter.",
  },
  {
    question: "Berapa lama proses pengerjaannya?",
    answer:
      "Rata-rata 1–3 hari kerja setelah data lengkap dan pembayaran diterima. Untuk kebutuhan mendesak, tanyakan ketersediaan slot cepat lewat WhatsApp.",
  },
  {
    question: "Apakah bisa revisi?",
    answer:
      "Bisa. Revisi mencakup perbaikan penulisan, penyesuaian urutan, dan perubahan kecil pada tampilan. Jumlah revisi mengikuti paket yang dipilih.",
  },
  {
    question: "Bagaimana cara memesannya?",
    answer:
      "Mulai dari tombol konsultasi atau halaman layanan. Setelah detail disepakati, kamu membayar melalui Midtrans dan admin langsung mengerjakan pesanan.",
  },
  {
    question: "Apakah data saya aman?",
    answer:
      "Data hanya dipakai untuk menyusun berkas lamaranmu. File hasil dikirim lewat tautan privat yang hanya bisa diakses oleh pemilik pesanan.",
  },
] as const;

interface LandingServiceCard {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number | null;
  tags: string[];
  icon: ServiceHighlight["icon"];
  accent: ServiceAccent;
}

export default async function HomePage() {
  const [settings, products, testimonials, services] = await Promise.all([
    getSiteSettings(),
    getProducts(true),
    getActiveTestimonials(),
    getActiveServices(),
  ]);

  const links = getSiteLinks(settings);
  const featuredProducts = products.slice(0, 6);

  // Katalog dari database diprioritaskan. Kalau tabel belum ada (mis. sebelum
  // migrasi di production), kartu tetap tampil memakai daftar statis tanpa harga.
  const serviceCards: LandingServiceCard[] =
    services.length > 0
      ? services.map((service) => {
          const visual =
            getServiceVisual(service.id) ?? getServiceVisual(service.slug);

          return {
            id: service.id,
            slug: service.slug,
            title: service.name,
            description: service.description,
            price: service.price,
            tags: visual?.tags ?? service.languages.map((code) => code.toUpperCase()),
            icon: visual?.icon ?? FileCheck2,
            accent: visual?.accent ?? "butter",
          };
        })
      : SERVICE_HIGHLIGHTS.map((service) => ({
          ...service,
          slug: service.id,
          price: null,
        }));

  return (
    <div className="min-h-screen bg-paper font-mono text-ink">
      <PublicNavigation />

      <main>
        {/* ---------------------------------------------------------------- Hero */}
        <section className="relative overflow-hidden pt-24 pb-12 sm:pt-28 md:pt-32 md:pb-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--paper-2) 1px, transparent 1px), linear-gradient(to bottom, var(--paper-2) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-paper" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
            <div>
              <span className="nb-sm inline-flex items-center gap-2 rounded-full bg-sage px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-on-accent">
                <Sparkles className="size-3.5" />
                Jasa bikin CV · ID & EN
              </span>

              <h1 className="mt-5 max-w-xl text-[2rem] leading-[1.12] font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
                <HeadlineWithMarker text={settings.heroHeadline} />
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
                {settings.heroSubheadline}
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <a
                  href={links.consult}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "nb-sm nb-press h-11 bg-coral px-5 text-sm font-semibold text-on-accent hover:bg-coral",
                  )}
                >
                  <SiWhatsapp className="mr-2 size-4" /> Konsultasi gratis
                </a>
                <Link
                  href="/jasa"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "nb-sm nb-press h-11 border-2 border-ink bg-paper px-5 text-sm font-semibold text-ink hover:bg-paper-2",
                  )}
                >
                  Lihat layanan <ArrowRight className="ml-2 size-4" />
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-coral-deep" />
                  Dipercaya 1000+ pelamar
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  Dikerjakan tenaga profesional
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky" />
                  Hasil rapi & siap kirim
                </span>
              </div>
            </div>

            <DocumentStack />
          </div>
        </section>

        {/* -------------------------------------------------------- Trust strip */}
        <section aria-label="Keunggulan" className="border-y-2 border-ink bg-sage/35">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-0 sm:grid-cols-4">
            {TRUST_ITEMS.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="flex items-center gap-2.5 px-4 py-3.5 sm:px-5">
                <Icon className="size-5 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ink sm:text-sm">{label}</p>
                  <p className="truncate text-[10px] text-ink-soft sm:text-[11px]">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------ Layanan */}
        <section id="layanan" className="scroll-mt-24 bg-paper px-4 py-14 sm:px-6 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="Layanan"
                title="Berkas lamaran yang siap di-screening HR."
                description="Pilih satu berkas atau paket lengkap. Semua disusun custom dari riwayat pendidikan, pengalaman, dan pencapaianmu."
                className="max-w-2xl"
              />
              <Link
                href="/jasa"
                className="inline-flex w-max items-center gap-1.5 text-xs font-semibold text-ink underline decoration-2 underline-offset-4 hover:text-coral-deep"
              >
                Lihat semua jasa <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
              {serviceCards.map((service) => {
                const Icon = service.icon;
                return (
                  <article key={service.id} className="nb nb-hover flex flex-col rounded-lg bg-paper p-4">
                    <span
                      className={cn(
                        "mb-3 flex h-10 w-10 items-center justify-center rounded-md border-2 border-ink text-on-accent",
                        ACCENT_BG[service.accent],
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <h3 className="text-sm font-bold tracking-tight text-ink">{service.title}</h3>
                    <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-soft">
                      {service.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-ink/25 bg-paper-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-2 border-t border-ink/10 pt-3">
                      {service.price !== null ? (
                        <>
                          <span className="text-sm font-bold text-ink">
                            {formatRupiah(service.price)}
                          </span>
                          <ServiceOrderLink slug={service.slug}>
                            Lihat detail <ArrowRight className="ml-1 size-3.5" />
                          </ServiceOrderLink>
                        </>
                      ) : (
                        <a
                          href={links.consult}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink underline decoration-2 underline-offset-4 hover:text-coral-deep"
                        >
                          Tanya admin <ArrowRight className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="nb mt-6 flex flex-col items-start justify-between gap-3 rounded-lg bg-butter px-4 py-4 text-on-accent sm:flex-row sm:items-center">
              <p className="text-sm font-medium text-on-accent">
                Butuh kombinasi berbeda, misalnya CV + surat lamaran + portofolio?
              </p>
              <a
                href={links.consult}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "nb-sm nb-press h-9 shrink-0 bg-ink px-4 text-xs font-semibold text-paper hover:bg-ink",
                )}
              >
                <SiWhatsapp className="mr-2 size-3.5" /> Tanya admin
              </a>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ Produk */}
        <section id="produk" className="scroll-mt-24 border-y-2 border-ink bg-paper-2 px-4 py-14 sm:px-6 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="Produk digital"
                title="Template CV & resume siap pakai."
                description="Template terlaris untuk berbagai profesi, tersedia dalam bahasa Indonesia dan Inggris. Beli sekali, pakai berkali-kali."
                className="max-w-2xl"
              />
              <Link
                href="/produk"
                className="inline-flex w-max items-center gap-1.5 text-xs font-semibold text-ink underline decoration-2 underline-offset-4 hover:text-coral-deep"
              >
                Lihat semua template <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {featuredProducts.length === 0 ? (
              <div className="nb mt-8 flex flex-col items-start gap-3 rounded-lg bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">Katalog template sedang disiapkan.</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    Sementara itu, chat admin untuk rekomendasi template yang cocok dengan posisi yang kamu lamar.
                  </p>
                </div>
                <a
                  href={links.consult}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "nb-sm nb-press h-9 shrink-0 bg-ink px-4 text-xs font-semibold text-paper hover:bg-ink",
                  )}
                >
                  <SiWhatsapp className="mr-2 size-3.5" /> Tanya admin
                </a>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < 3}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------ Proses */}
        <section className="bg-paper px-4 py-14 sm:px-6 md:py-20">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Proses"
              title="Empat langkah, berkas siap kirim."
              description="Tanpa ribet. Kamu fokus menyiapkan data, kami yang merapikan sisanya."
            />

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
              {PROCESS_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="nb relative flex flex-col rounded-lg bg-paper p-4">
                    <div className="flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-ink bg-paper-2 text-sm font-bold">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <Icon className="size-5 text-ink-soft" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold">{step.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- PDF tools */}
        <section id="tools" className="scroll-mt-24 border-t-2 border-ink bg-paper-2 px-4 py-14 sm:px-6 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="Alat pendukung"
                title="Alat PDF gratis untuk melengkapi lamaran."
                description="Gabung, pisah, kompres, dan konversi PDF langsung di peramban. Tanpa instalasi, file diproses di perangkatmu."
                className="max-w-2xl"
              />
              <span className="nb-sm inline-flex w-max items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-[11px] font-semibold text-ink">
                <span className="h-2 w-2 rounded-full bg-sage" /> Gratis
              </span>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">
              {PDF_TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="nb nb-hover group flex items-start gap-3 rounded-lg bg-paper p-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-sky text-on-accent">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold">{tool.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                        {tool.description}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold">
                        Buka alat
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- Testimoni */}
        <TestimonialWall testimonials={testimonials} />

        {/* --------------------------------------------------------------- FAQ */}
        <section className="bg-paper px-4 py-14 sm:px-6 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
            <div>
              <SectionHeading
                eyebrow="FAQ"
                title="Masih ada yang ingin ditanyakan?"
                description="Beberapa pertanyaan yang paling sering masuk. Kalau belum terjawab, chat admin langsung."
              />
              <a
                href={links.consult}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "nb-sm nb-press mt-5 h-10 bg-ink px-4 text-xs font-semibold text-paper hover:bg-ink",
                )}
              >
                <SiWhatsapp className="mr-2 size-3.5" /> Tanya via WhatsApp
              </a>
            </div>

            <FaqAccordion
              items={FAQ_ITEMS}
              variant="card"
              className="gap-2.5"
              triggerClassName="py-4 text-sm font-semibold"
              contentClassName="pb-4 text-xs"
            />
          </div>
        </section>

        {/* --------------------------------------------------------------- CTA */}
        <section className="bg-paper px-4 pb-16 sm:px-6 md:pb-20">
          <div className="nb mx-auto max-w-6xl rounded-lg bg-coral p-6 text-on-accent sm:p-8 md:p-10">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-on-accent/70">
                  Mulai hari ini
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-on-accent sm:text-3xl">
                  Berkas rapi, peluang lebih besar.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-on-accent/80">
                  Ceritakan posisi yang kamu incar. Kami bantu susun CV, resume, dan surat lamaran
                  yang enak dibaca recruiter sekaligus ramah ATS.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col">
                <a
                  href={links.consult}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "nb-sm nb-press h-11 justify-center bg-ink px-5 text-sm font-semibold text-paper hover:bg-ink",
                  )}
                >
                  <SiWhatsapp className="mr-2 size-4" /> Chat WhatsApp
                </a>
                <a
                  href={links.email}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "nb-sm nb-press h-11 justify-center border-2 border-ink bg-paper px-5 text-sm font-semibold text-ink hover:bg-paper-2",
                  )}
                >
                  <Mail className="mr-2 size-4" /> Kirim email
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter services={services} />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-coral-deep">
        {eyebrow}
      </span>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-[2rem]">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{description}</p>
    </div>
  );
}

/** Beri sorotan coral pada dua kata terakhir judul hero. */
function HeadlineWithMarker({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);

  if (words.length <= 3) return <>{text}</>;

  const head = words.slice(0, -2).join(" ");
  const tail = words.slice(-2).join(" ");

  return (
    <>
      {head}{" "}
      <span className="relative inline-block">
        <span aria-hidden="true" className="absolute inset-x-0 bottom-1 h-2.5 bg-coral/80 sm:h-3" />
        <span className="relative">{tail}</span>
      </span>
    </>
  );
}

/** Tumpukan dokumen dekoratif di sisi kanan hero. */
function DocumentStack() {
  return (
    <div className="relative mx-auto h-[320px] w-full max-w-sm sm:h-[380px]" aria-hidden="true">
      <div className="absolute top-8 left-0 w-48 -rotate-6 rounded-lg border-2 border-ink bg-butter p-3.5 text-on-accent shadow-[4px_4px_0_0_var(--ink)] sm:w-52">
        <div className="h-2 w-16 rounded-sm bg-ink/70" />
        <div className="mt-3 space-y-1.5">
          {[90, 70, 80, 55].map((width, index) => (
            <div key={index} className="h-1.5 rounded-sm bg-ink/20" style={{ width: `${width}%` }} />
          ))}
        </div>
        <div className="mt-3 h-1.5 w-20 rounded-sm bg-ink/40" />
        <div className="mt-1.5 space-y-1.5">
          {[85, 65, 75].map((width, index) => (
            <div key={index} className="h-1.5 rounded-sm bg-ink/15" style={{ width: `${width}%` }} />
          ))}
        </div>
      </div>

      <div className="absolute top-2 right-0 w-44 rotate-[7deg] rounded-lg border-2 border-ink bg-sage p-3.5 text-on-accent shadow-[4px_4px_0_0_var(--ink)] sm:w-48">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md border-2 border-ink bg-paper" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2 w-full rounded-sm bg-ink/70" />
            <div className="h-1.5 w-2/3 rounded-sm bg-ink/30" />
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          {[80, 95, 60].map((width, index) => (
            <div key={index} className="h-1.5 rounded-sm bg-ink/20" style={{ width: `${width}%` }} />
          ))}
        </div>
      </div>

      <div className="absolute top-24 left-1/2 w-56 -translate-x-1/2 rotate-[-2deg] rounded-lg border-2 border-ink bg-paper p-4 text-ink shadow-[5px_5px_0_0_var(--ink)] sm:w-64">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-ink bg-coral text-on-accent">
            <FileCheck2 className="size-5" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-3/4 rounded-sm bg-ink/80" />
            <div className="h-1.5 w-1/2 rounded-sm bg-ink/30" />
          </div>
        </div>

        <div className="mt-4 h-1.5 w-16 rounded-sm bg-coral-deep" />
        <div className="mt-2 space-y-1.5">
          {[100, 88, 94].map((width, index) => (
            <div key={index} className="h-1.5 rounded-sm bg-ink/15" style={{ width: `${width}%` }} />
          ))}
        </div>

        <div className="mt-3 h-1.5 w-20 rounded-sm bg-sage" />
        <div className="mt-2 space-y-1.5">
          {[92, 78, 85, 60].map((width, index) => (
            <div key={index} className="h-1.5 rounded-sm bg-ink/15" style={{ width: `${width}%` }} />
          ))}
        </div>
      </div>

      <div className="absolute right-1 bottom-10 rotate-3 rounded-md border-2 border-ink bg-coral px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-on-accent shadow-[3px_3px_0_0_var(--ink)]">
        ATS Passed
      </div>
      <div className="absolute bottom-24 left-0 -rotate-6 rounded-md border-2 border-ink bg-paper px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-ink shadow-[3px_3px_0_0_var(--ink)]">
        ID & EN
      </div>
      <div className="absolute top-1/2 right-2 rounded-md border-2 border-ink bg-paper px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-ink shadow-[3px_3px_0_0_var(--ink)]">
        <PencilRuler className="size-3" />
      </div>
    </div>
  );
}
