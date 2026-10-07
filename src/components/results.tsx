"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import type { ResultCard } from "@/lib/wordpress";
import { CountUp } from "@/components/motion/count-up";
import { easeOutExpo } from "@/components/motion/ease";
import { SplitText } from "@/components/motion/split-text";

/** Card data without the long case-study body (that only ships to the detail page). */
export type ResultCardSummary = Omit<ResultCard, "body">;

type ResultsProps = {
  title: string;
  description: string;
  cards: ResultCardSummary[];
  /** Eyebrow text, taken from the matching WordPress nav item. */
  label?: string;
  /** Position of the section in the nav (1-based), shown as "04". */
  index?: number;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: easeOutExpo } },
};

const inView = { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "0px 0px -12% 0px" } } as const;

const pad = (n: number) => String(n).padStart(2, "0");

export function Results({ title, description, cards, label = "Results", index }: ResultsProps) {
  return (
    <section id="results" className="relative w-full scroll-mt-24 pt-16 pb-24 md:pt-20 md:pb-32">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12 lg:px-20">
        {/* Section header */}
        <header className="mb-14 grid gap-6 md:mb-20 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
          <div>
            <motion.p
              variants={fadeUp}
              {...inView}
              className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase"
            >
              {index !== undefined && <span className="font-mono tracking-normal text-brand">{pad(index)}</span>}
              <span aria-hidden className="h-px w-8 bg-foreground/25" />
              {label}
            </motion.p>
            {title && (
              <h2 className="text-[clamp(2.125rem,4.5vw,3.5rem)] leading-[1.08] font-normal tracking-tight">
                <SplitText text={title} inView stagger={0.04} />
              </h2>
            )}
          </div>
          {description && (
            <motion.p variants={fadeUp} {...inView} className="max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">
              {description}
            </motion.p>
          )}
        </header>

        {cards.length > 0 && (
          <motion.ul
            {...inView}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="grid gap-5 md:grid-cols-2"
          >
            {cards.map((card, i) => (
              <motion.li key={card.slug} variants={fadeUp} className="h-full">
                <ResultCardLink card={card} number={i + 1} />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  );
}

function ResultCardLink({ card, number }: { card: ResultCardSummary; number: number }) {
  const onPointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <Link
      href={`/results/${card.slug}`}
      onPointerMove={onPointerMove}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-[transform,border-color,box-shadow] duration-500 ease-out outline-none hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-[0_30px_60px_-30px_var(--brand)] focus-visible:ring-2 focus-visible:ring-brand/50"
    >
      {/* Cursor spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(360px circle at var(--mx) var(--my), var(--brand-soft), transparent 70%)" }}
      />

      {/* Report screenshot */}
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-muted">
        {card.image ? (
          <Image
            src={card.image.url}
            alt={card.image.alt || card.title}
            fill
            sizes="(max-width: 768px) 100vw, 560px"
            className="object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="bg-grid absolute inset-0" />
        )}
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
        <span className="absolute top-4 left-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 font-mono text-[11px] tracking-wider text-white backdrop-blur-md">
          Case {pad(number)}
        </span>
        <span className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-background/90 text-foreground shadow-lg backdrop-blur-md transition-all duration-500 group-hover:rotate-45 group-hover:bg-brand group-hover:text-white">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      {/* Copy */}
      <div className="relative flex flex-1 flex-col p-6 md:p-7">
        <h3 className="text-xl leading-snug font-normal tracking-tight md:text-[1.4rem]">{card.title}</h3>
        {card.summary && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{card.summary}</p>
        )}

        {card.metrics.length > 0 && (
          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border">
            {card.metrics.slice(0, 4).map((m, i) => (
              <div key={i} className="bg-card p-4">
                <dt className="sr-only">{m.label}</dt>
                <dd>
                  <CountUp
                    value={m.value}
                    delay={0.1 + i * 0.08}
                    className="block text-2xl font-light tracking-tight transition-colors duration-500 group-hover:text-brand"
                  />
                  <span aria-hidden className="mt-1 block text-xs leading-snug text-muted-foreground">
                    {m.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        )}

        <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-medium">
          Read the full case
          <span className="relative flex h-px w-6 items-center bg-foreground/40 transition-all duration-500 group-hover:w-10 group-hover:bg-brand">
            <ArrowRight className="absolute -right-1.5 size-3.5 text-foreground/60 transition-colors duration-500 group-hover:text-brand" />
          </span>
        </span>
      </div>
    </Link>
  );
}
