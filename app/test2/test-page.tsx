"use client";

import { Product } from '@/types/global';

interface DashboardProductsProps {
  products: Product[],
}

export default function DashboardProducts({ products }: DashboardProductsProps) {
  return (
    <section className="mx-auto my-8 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Creative Neo-Pop</h2>
        <p className="mt-1 text-sm text-slate-500">Playful rotating frames, vibrant pastel contrasts, and magnetic buttons.</p>
      </div>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rise group relative flex flex-col justify-between overflow-hidden rounded-[2.2rem] p-6 text-[#151722] shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl" style={{ background: "#FFE66D" }}>
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-black/90 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">Design</span>
              <span className="text-xs font-bold opacity-60">03 Oct</span>
            </div>

            <div className="relative mt-6 rotate-2 overflow-hidden rounded-2xl border-4 border-white shadow-md transition-transform duration-500 ease-out group-hover:rotate-0 group-hover:scale-105">
              <img src="https://picsum.photos/seed/blog14/700/560" alt="" loading="lazy" className="aspect-[5/4] w-full object-cover" />
            </div>

            <h3 className="display mt-6 text-2xl font-semibold leading-snug">
              The quiet return of white space in product design
            </h3>
            <p className="mt-2 text-sm leading-relaxed opacity-80">
              Why the best interfaces now say less, and how spacing became the loudest choice.
            </p>
          </div>

          <div className="mt-8">
            <a href="#" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-white hover:text-black">
              Read story
              <svg className="h-3.5 w-3.5 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </a>
          </div>
        </article>

        <article className="rise group relative flex flex-col justify-between overflow-hidden rounded-[2.2rem] p-6 text-[#151722] shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl" style={{ background: "#FF9E79" }}>
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-black/90 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">Technology</span>
              <span className="text-xs font-bold opacity-60">29 Sep</span>
            </div>

            <div className="relative mt-6 -rotate-2 overflow-hidden rounded-2xl border-4 border-white shadow-md transition-transform duration-500 ease-out group-hover:rotate-0 group-hover:scale-105">
              <img src="https://picsum.photos/seed/blog21/700/560" alt="" loading="lazy" className="aspect-[5/4] w-full object-cover" />
            </div>

            <h3 className="display mt-6 text-2xl font-semibold leading-snug">
              Why small language models are winning at edge
            </h3>
            <p className="mt-2 text-sm leading-relaxed opacity-80">
              Smaller models are running on phones, and the trade-offs are stunningly better.
            </p>
          </div>

          <div className="mt-8">
            <a href="#" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-white hover:text-black">
              Read story
              <svg className="h-3.5 w-3.5 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </a>
          </div>
        </article>

        <article className="rise group relative flex flex-col justify-between overflow-hidden rounded-[2.2rem] p-6 text-[#151722] shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl" style={{ background: "#B3A2FF" }}>
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-black/90 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">Travel</span>
              <span className="text-xs font-bold opacity-60">26 Sep</span>
            </div>

            <div className="relative mt-6 rotate-2 overflow-hidden rounded-2xl border-4 border-white shadow-md transition-transform duration-500 ease-out group-hover:rotate-0 group-hover:scale-105">
              <img src="https://picsum.photos/seed/blog41/700/560" alt="" loading="lazy" className="aspect-[5/4] w-full object-cover" />
            </div>

            <h3 className="display mt-6 text-2xl font-semibold leading-snug">
              Slow mornings in Jaipur: guide beyond the forts
            </h3>
            <p className="mt-2 text-sm leading-relaxed opacity-80">
              Chai stalls, step-wells and rooftop breakfasts for quiet travellers.
            </p>
          </div>

          <div className="mt-8">
            <a href="#" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-white hover:text-black">
              Read story
              <svg className="h-3.5 w-3.5 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}