import { ChevronDown } from "lucide-react";

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
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="bg-card border-4 border-foreground rounded-[2rem] shadow-[6px_6px_0px_0px] shadow-foreground p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-5">
          Cara Menggunakan {toolName}
        </h2>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-brand-orange text-sm font-black">
                {index + 1}
              </span>
              <p className="font-medium leading-relaxed text-foreground/80">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-card border-4 border-foreground rounded-[2rem] shadow-[6px_6px_0px_0px] shadow-foreground p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
          Pertanyaan Umum
        </h2>
        <div className="divide-y-2 divide-foreground/10">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                <h3 className="text-base md:text-lg">{faq.question}</h3>
                <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 font-medium leading-relaxed text-foreground/80">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
