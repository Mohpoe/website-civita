import { APP_CONFIG } from '@/lib/constants';
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = `${APP_CONFIG.NAME} - Jasa Pembuatan CV, Portfolio & Desain Karir`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const geistBlack = await readFile(join(process.cwd(), 'assets/fonts/Geist-Black.ttf'));
const geistMedium = await readFile(join(process.cwd(), 'assets/fonts/Geist-Medium.ttf'));

const INK = '#141414';
const PAPER = '#fdfaf8';
const MUTED = '#57534e';
const LINE = '#d6d3d1';
const RED = '#ef3936';
const ORANGE = '#f68e51';
const TEAL = '#8fd6c8';

const chips = [
  { label: 'CV ATS-friendly', background: '#ffffff' },
  { label: 'CV Kreatif', background: ORANGE },
  { label: 'Cover Letter', background: '#ffffff' },
  { label: 'Portfolio', background: TEAL },
];

function DocumentLines({ count = 3, width = '100%' }: { count?: number; width?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width }}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            height: 6,
            width: index === count - 1 ? '68%' : index === 1 ? '88%' : '100%',
            backgroundColor: LINE,
            borderRadius: 999,
          }}
        />
      ))}
    </div>
  );
}

function Section({ title, lines }: { title: string; lines: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
      <div style={{ display: 'flex', fontSize: 10, fontWeight: 900, letterSpacing: 1.5, color: INK }}>
        {title}
      </div>
      <DocumentLines count={lines} />
    </div>
  );
}

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: PAPER,
          fontFamily: 'Geist',
        }}
      >
        {/* Ornamen neo-brutalis */}
        <div
          style={{
            position: 'absolute',
            top: -110,
            right: -80,
            width: 310,
            height: 310,
            display: 'flex',
            backgroundColor: ORANGE,
            border: `10px solid ${INK}`,
            borderRadius: 999,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -90,
            left: -70,
            width: 230,
            height: 230,
            display: 'flex',
            backgroundColor: RED,
            border: `10px solid ${INK}`,
            transform: 'rotate(14deg)',
          }}
        />

        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 36,
            padding: '52px 64px',
          }}
        >
          {/* Kolom teks */}
          <div style={{ display: 'flex', flexDirection: 'column', width: 650 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                alignSelf: 'flex-start',
                padding: '7px 16px',
                backgroundColor: '#ffffff',
                border: `3px solid ${INK}`,
                borderRadius: 999,
                boxShadow: `4px 4px 0 0 ${INK}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: 11,
                  height: 11,
                  backgroundColor: RED,
                  borderRadius: 999,
                }}
              />
              <div style={{ display: 'flex', fontSize: 16, fontWeight: 900, letterSpacing: 2 }}>
                JASA CV &amp; PORTFOLIO
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                marginTop: 18,
                fontSize: 150,
                fontWeight: 900,
                letterSpacing: -7,
                lineHeight: 0.9,
                color: INK,
              }}
            >
              {APP_CONFIG.NAME}
            </div>

            <div
              style={{
                display: 'flex',
                marginTop: 8,
                fontSize: 34,
                fontWeight: 900,
                color: INK,
              }}
            >
              {APP_CONFIG.TAGLINE}
            </div>

            <div
              style={{
                display: 'flex',
                marginTop: 10,
                maxWidth: 570,
                fontSize: 19,
                fontWeight: 500,
                lineHeight: 1.45,
                color: MUTED,
              }}
            >
              CV ATS-friendly, CV kreatif, surat lamaran, dan portfolio dengan desain rapi &amp; profesional.
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 22, maxWidth: 600 }}>
              {chips.map((chip) => (
                <div
                  key={chip.label}
                  style={{
                    display: 'flex',
                    padding: '6px 13px',
                    fontSize: 15,
                    fontWeight: 500,
                    backgroundColor: chip.background,
                    border: `3px solid ${INK}`,
                    borderRadius: 999,
                  }}
                >
                  {chip.label}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
              <div
                style={{
                  display: 'flex',
                  padding: '7px 16px',
                  fontSize: 17,
                  fontWeight: 900,
                  letterSpacing: 0.5,
                  color: '#ffffff',
                  backgroundColor: INK,
                  borderRadius: 999,
                }}
              >
                {APP_CONFIG.DOMAIN}
              </div>
              <div style={{ display: 'flex', fontSize: 16, fontWeight: 500, color: MUTED }}>
                Mulai dari 13K
              </div>
            </div>
          </div>

          {/* Tumpukan dokumen */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              width: 410,
              height: 500,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 52,
                left: 4,
                display: 'flex',
                width: 205,
                height: 288,
                backgroundColor: ORANGE,
                border: `5px solid ${INK}`,
                borderRadius: 20,
                transform: 'rotate(-13deg)',
                boxShadow: `8px 8px 0 0 ${INK}`,
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: 84,
                left: 182,
                display: 'flex',
                flexDirection: 'column',
                width: 205,
                height: 288,
                padding: 18,
                backgroundColor: '#ffffff',
                border: `5px solid ${INK}`,
                borderRadius: 20,
                transform: 'rotate(9deg)',
                boxShadow: `8px 8px 0 0 ${INK}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: 9,
                  backgroundColor: TEAL,
                  border: `2px solid ${INK}`,
                  borderRadius: 999,
                }}
              />
              <Section title="PORTFOLIO" lines={2} />
              <Section title="PROJECTS" lines={4} />
            </div>

            <div
              style={{
                position: 'absolute',
                top: 142,
                left: 68,
                display: 'flex',
                flexDirection: 'column',
                width: 238,
                height: 318,
                padding: 20,
                backgroundColor: '#ffffff',
                border: `5px solid ${INK}`,
                borderRadius: 20,
                transform: 'rotate(-3deg)',
                boxShadow: `10px 10px 0 0 ${INK}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div
                  style={{
                    display: 'flex',
                    width: 44,
                    height: 44,
                    backgroundColor: TEAL,
                    border: `3px solid ${INK}`,
                    borderRadius: 999,
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div
                    style={{
                      display: 'flex',
                      width: 112,
                      height: 10,
                      backgroundColor: INK,
                      borderRadius: 999,
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      width: 74,
                      height: 7,
                      backgroundColor: LINE,
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: 1.5,
                    color: INK,
                  }}
                >
                  CURRICULUM VITAE
                </div>
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    height: 4,
                    backgroundColor: INK,
                  }}
                />
              </div>

              <Section title="PROFILE" lines={3} />
              <Section title="EXPERIENCE" lines={4} />
              <Section title="SKILLS" lines={2} />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Geist',
          data: geistBlack,
          style: 'normal',
          weight: 900,
        },
        {
          name: 'Geist',
          data: geistMedium,
          style: 'normal',
          weight: 500,
        },
      ],
    }
  );
}
