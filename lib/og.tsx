import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";

/**
 * Template Open Graph neo-brutalis CIVITA.
 *
 * Semua route OG memakai bingkai, tipografi, dan tumpukan dokumen yang sama
 * supaya pratinjau tautan terasa satu keluarga dengan landing page:
 * latar paper + grid tipis, border tinta tebal, bayangan keras, aksen pastel,
 * dan Geist Mono sebagai satu-satunya font.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export const OG_COLORS = {
  paper: "#faf7f2",
  paper2: "#f2ece3",
  ink: "#221f1b",
  inkSoft: "#5a534b",
  white: "#fffdf9",
  coral: "#e7a79c",
  coralDeep: "#b96a5c",
  sage: "#afc6a6",
  butter: "#f2ddb0",
  sky: "#b3c9e4",
  lilac: "#cfc3e6",
  line: "#ded5c8",
} as const;

export type OgAccent = "coral" | "sage" | "butter" | "sky" | "lilac";

const ACCENT_HEX: Record<OgAccent, string> = {
  coral: OG_COLORS.coral,
  sage: OG_COLORS.sage,
  butter: OG_COLORS.butter,
  sky: OG_COLORS.sky,
  lilac: OG_COLORS.lilac,
};

type OgFont = {
  name: string;
  data: Buffer;
  weight: 400 | 700 | 900;
  style: "normal";
};

let fontsPromise: Promise<OgFont[]> | null = null;

/** Muat Geist Mono (400/700/900) sekali per proses render. */
export function getOgFonts(): Promise<OgFont[]> {
  fontsPromise ??= Promise.all([
    readFile(join(process.cwd(), "assets/fonts/GeistMono-Regular.woff")),
    readFile(join(process.cwd(), "assets/fonts/GeistMono-Bold.woff")),
    readFile(join(process.cwd(), "assets/fonts/GeistMono-Black.woff")),
  ]).then(([regular, bold, black]) => [
    { name: "Geist Mono", data: regular, weight: 400, style: "normal" },
    { name: "Geist Mono", data: bold, weight: 700, style: "normal" },
    { name: "Geist Mono", data: black, weight: 900, style: "normal" },
  ]);

  return fontsPromise;
}

/** Potong teks pada batas kata supaya tidak berakhir di tengah kata. */
export function truncate(text: string, max = 150): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max)}…`;
}

function titleFontSize(title: string): number {
  if (title.length <= 18) return 86;
  if (title.length <= 30) return 74;
  if (title.length <= 44) return 62;
  if (title.length <= 62) return 52;
  if (title.length <= 90) return 44;
  if (title.length <= 120) return 38;
  return 34;
}

function BrandMark() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 52,
        height: 52,
        backgroundColor: OG_COLORS.coral,
        border: `3px solid ${OG_COLORS.ink}`,
        borderRadius: 12,
        boxShadow: `3px 3px 0 0 ${OG_COLORS.ink}`,
        fontSize: 34,
        fontWeight: 900,
        lineHeight: 1,
        color: OG_COLORS.ink,
      }}
    >
      C
    </div>
  );
}

function Chip({
  children,
  background,
}: {
  children: ReactNode;
  background: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "6px 13px",
        backgroundColor: background,
        border: `2px solid ${OG_COLORS.ink}`,
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 0.3,
        whiteSpace: "nowrap",
        color: OG_COLORS.ink,
      }}
    >
      {children}
    </div>
  );
}

function DocumentLines({ count, width }: { count: number; width?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        width: width ?? "100%",
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            height: 5,
            width: index === count - 1 ? "64%" : index === 1 ? "88%" : "100%",
            backgroundColor: OG_COLORS.line,
            borderRadius: 999,
          }}
        />
      ))}
    </div>
  );
}

function DocSection({ title, lines }: { title: string; lines: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        marginTop: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: 1.6,
          color: OG_COLORS.ink,
        }}
      >
        {title}
      </div>
      <DocumentLines count={lines} />
    </div>
  );
}

function DocumentStack({ accent, sticker }: { accent: OgAccent; sticker: string }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 380,
        height: 430,
      }}
    >
      {/* Kartu belakang */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 8,
          display: "flex",
          width: 196,
          height: 264,
          backgroundColor: ACCENT_HEX[accent],
          border: `4px solid ${OG_COLORS.ink}`,
          borderRadius: 14,
          transform: "rotate(-13deg)",
          boxShadow: `7px 7px 0 0 ${OG_COLORS.ink}`,
        }}
      />

      {/* Kartu tengah */}
      <div
        style={{
          position: "absolute",
          top: 70,
          right: 10,
          display: "flex",
          width: 196,
          height: 264,
          backgroundColor: OG_COLORS.sky,
          border: `4px solid ${OG_COLORS.ink}`,
          borderRadius: 14,
          transform: "rotate(9deg)",
          boxShadow: `7px 7px 0 0 ${OG_COLORS.ink}`,
        }}
      />

      {/* Kartu depan */}
      <div
        style={{
          position: "absolute",
          top: 58,
          left: 66,
          display: "flex",
          flexDirection: "column",
          width: 228,
          height: 302,
          padding: 18,
          backgroundColor: OG_COLORS.white,
          border: `4px solid ${OG_COLORS.ink}`,
          borderRadius: 14,
          transform: "rotate(-2deg)",
          boxShadow: `9px 9px 0 0 ${OG_COLORS.ink}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              width: 40,
              height: 40,
              backgroundColor: ACCENT_HEX[accent],
              border: `3px solid ${OG_COLORS.ink}`,
              borderRadius: 999,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                display: "flex",
                width: 108,
                height: 9,
                backgroundColor: OG_COLORS.ink,
                borderRadius: 999,
              }}
            />
            <div
              style={{
                display: "flex",
                width: 72,
                height: 6,
                backgroundColor: OG_COLORS.line,
                borderRadius: 999,
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginTop: 15,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1.8,
              color: OG_COLORS.ink,
            }}
          >
            CURRICULUM VITAE
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 3,
              backgroundColor: OG_COLORS.ink,
            }}
          />
        </div>

        <DocSection title="PROFIL" lines={3} />
        <DocSection title="PENGALAMAN" lines={3} />
        <DocSection title="KEAHLIAN" lines={2} />
      </div>

      {/* Stiker harga */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 26,
          display: "flex",
          padding: "8px 14px",
          backgroundColor: OG_COLORS.butter,
          border: `3px solid ${OG_COLORS.ink}`,
          borderRadius: 8,
          boxShadow: `4px 4px 0 0 ${OG_COLORS.ink}`,
          transform: "rotate(-5deg)",
          fontSize: 17,
          fontWeight: 900,
          letterSpacing: 0.2,
          color: OG_COLORS.ink,
        }}
      >
        {sticker}
      </div>
    </div>
  );
}

export type OgTemplateProps = {
  eyebrow: string;
  title: string;
  description: string;
  chips: { label: string; background: string }[];
  accent: OgAccent;
  sticker: string;
  footerLeft: string;
  footerRight: string;
  badge?: string;
};

export function OgTemplate({
  eyebrow,
  title,
  description,
  chips,
  accent,
  sticker,
  footerLeft,
  footerRight,
  badge = "civita.id",
}: OgTemplateProps) {
  // Judul produk bisa sangat panjang; batasi agar tidak terpotong di tengah baris.
  const displayTitle = truncate(title, 160);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        backgroundColor: OG_COLORS.paper,
        border: `10px solid ${OG_COLORS.ink}`,
        fontFamily: "Geist Mono",
        color: OG_COLORS.ink,
      }}
    >
      {/* Grid tipis seperti hero landing page */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          backgroundImage: `linear-gradient(to right, ${OG_COLORS.paper2} 1px, transparent 1px), linear-gradient(to bottom, ${OG_COLORS.paper2} 1px, transparent 1px)`,
          backgroundSize: "34px 34px",
          opacity: 0.85,
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "38px 46px 30px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <BrandMark />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 23,
                  fontWeight: 900,
                  letterSpacing: 1.5,
                }}
              >
                CIVITA
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 12,
                  fontWeight: 400,
                  color: OG_COLORS.inkSoft,
                }}
              >
                Bantu kamu lolos kerja!
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "7px 14px",
              backgroundColor: OG_COLORS.white,
              border: `2px solid ${OG_COLORS.ink}`,
              borderRadius: 999,
              boxShadow: `3px 3px 0 0 ${OG_COLORS.ink}`,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.4,
            }}
          >
            {badge}
          </div>
        </div>

        {/* Isi */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            gap: 24,
            marginTop: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 682,
              paddingBottom: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 3,
                color: OG_COLORS.coralDeep,
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 10,
                fontSize: titleFontSize(displayTitle),
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: -2,
                maxHeight: 200,
                overflow: "hidden",
              }}
            >
              {displayTitle}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 14,
                fontSize: 18,
                fontWeight: 400,
                lineHeight: 1.5,
                color: OG_COLORS.inkSoft,
                maxHeight: 82,
                overflow: "hidden",
              }}
            >
              {truncate(description, 170)}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 20,
              }}
            >
              {chips.map((chip) => (
                <Chip key={chip.label} background={chip.background}>
                  {chip.label}
                </Chip>
              ))}
            </div>
          </div>

          <DocumentStack accent={accent} sticker={sticker} />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${OG_COLORS.ink}`,
            paddingTop: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: 0.2,
            }}
          >
            {footerLeft}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 13,
              fontWeight: 400,
              color: OG_COLORS.inkSoft,
            }}
          >
            {footerRight}
          </div>
        </div>
      </div>
    </div>
  );
}
