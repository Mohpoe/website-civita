import { FaqAccordion } from "@/components/faq-accordion";

export type PdfToolGuideProps = {
  toolName: string;
  steps: readonly string[];
  faqs: readonly { question: string; answer: string }[];
};

/**
 * Blok "Cara Menggunakan" + FAQ untuk halaman tool PDF.
 *
 * Selain menambah kedalaman konten (halaman tool sebelumnya sangat tipis),
 * FAQ dirender sebagai JSON-LD agar mesin pencari memahami pasangan
 * pertanyaan-jawaban. Semua jawaban juga terlihat di halaman, sesuai syarat
 * structured data.
 */
export function PdfToolGuide({ toolName, steps, faqs }: PdfToolGuideProps) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="nb rounded-lg bg-paper p-6 md:p-8">
        <h2 className="mb-5 text-2xl font-bold tracking-tight md:text-3xl">
          Cara Menggunakan {toolName}
        </h2>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-butter text-sm font-bold text-on-accent">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed text-ink-soft md:text-base">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="nb rounded-lg bg-paper p-6 md:p-8">
        <h2 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">
          Pertanyaan Umum
        </h2>
        <FaqAccordion items={faqs} />
      </section>
    </div>
  );
}
