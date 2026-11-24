import type { LucideIcon } from "lucide-react";
import {
  Award,
  Briefcase,
  FileCheck2,
  FileText,
  Languages,
  LogOut,
  Mail,
  Palette,
  PenLine,
  ReceiptText,
  ScrollText,
  Sparkles,
} from "lucide-react";

/** Palet aksen yang tersedia untuk kartu layanan. */
export const SERVICE_ACCENTS = [
  { value: "coral", label: "Coral" },
  { value: "sage", label: "Sage" },
  { value: "butter", label: "Butter" },
  { value: "sky", label: "Sky" },
  { value: "lilac", label: "Lilac" },
] as const;

export type ServiceAccent = (typeof SERVICE_ACCENTS)[number]["value"];

export const ACCENT_BG: Record<ServiceAccent, string> = {
  coral: "bg-coral",
  sage: "bg-sage",
  butter: "bg-butter",
  sky: "bg-sky",
  lilac: "bg-lilac",
};

export function isServiceAccent(value: string | null | undefined): value is ServiceAccent {
  return SERVICE_ACCENTS.some((accent) => accent.value === value);
}

/**
 * Kumpulan ikon kurasi. Ikon harus berupa komponen di sisi klien, jadi daftar
 * ini tetap di kode; yang disimpan di database hanya `key`-nya.
 */
export const SERVICE_ICONS = [
  { key: "file-check", label: "Berkas centang", icon: FileCheck2 },
  { key: "file-text", label: "Dokumen", icon: FileText },
  { key: "scroll-text", label: "Resume", icon: ScrollText },
  { key: "mail", label: "Surat", icon: Mail },
  { key: "pen-line", label: "Menulis", icon: PenLine },
  { key: "palette", label: "Kreatif", icon: Palette },
  { key: "log-out", label: "Resign", icon: LogOut },
  { key: "receipt", label: "Invoice", icon: ReceiptText },
  { key: "briefcase", label: "Karier", icon: Briefcase },
  { key: "languages", label: "Bahasa", icon: Languages },
  { key: "sparkles", label: "Spesial", icon: Sparkles },
  { key: "award", label: "Pencapaian", icon: Award },
] as const;

export type ServiceIconKey = (typeof SERVICE_ICONS)[number]["key"];

export const SERVICE_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  SERVICE_ICONS.map((item) => [item.key, item.icon]),
);

const DEFAULT_ICON = SERVICE_ICONS[0].icon;

export interface ServiceVisualInput {
  id: string;
  slug?: string | null;
  icon?: string | null;
  accent?: string | null;
  tags?: string[] | null;
  languages?: string[];
}

export interface ResolvedServiceVisual {
  icon: LucideIcon;
  iconKey: string;
  accent: ServiceAccent;
  accentBg: string;
  tags: string[];
}

/** Hash deterministik supaya layanan tanpa ikon selalu dapat visual yang sama. */
function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (Math.imul(result, 31) + value.charCodeAt(index)) >>> 0;
  }
  return result;
}

/**
 * Tentukan ikon, warna, dan tag sebuah layanan.
 *
 * Urutan prioritas: nilai yang dipilih admin di database → fallback otomatis
 * deterministik (hash dari id/slug). Tag kosong memakai kode bahasa.
 */
export function resolveServiceVisual(service: ServiceVisualInput): ResolvedServiceVisual {
  const seed = service.id || service.slug || "service";

  const iconKey =
    service.icon && SERVICE_ICON_MAP[service.icon]
      ? service.icon
      : SERVICE_ICONS[hash(seed) % SERVICE_ICONS.length].key;

  const accent = isServiceAccent(service.accent)
    ? service.accent
    : SERVICE_ACCENTS[hash(`accent:${seed}`) % SERVICE_ACCENTS.length].value;

  const storedTags = Array.isArray(service.tags)
    ? service.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
    : [];
  const tags =
    storedTags.length > 0
      ? storedTags.slice(0, 2)
      : (service.languages ?? []).slice(0, 2).map((code) => code.toUpperCase());

  return {
    icon: SERVICE_ICON_MAP[iconKey] ?? DEFAULT_ICON,
    iconKey,
    accent,
    accentBg: ACCENT_BG[accent],
    tags,
  };
}
