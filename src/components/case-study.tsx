"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ResultCard } from "@/lib/wordpress";
import { CountUp } from "@/components/motion/count-up";
import { easeOutExpo } from "@/components/motion/ease";
import { SplitText } from "@/components/motion/split-text";
import { Lightbox, type Zoomed } from "@/components/lightbox";

const pad = (n: number) => String(n).padStart(2, "0");

const rise: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, delay, ease: easeOutExpo },
  }),
};

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

type CaseHeroProps = {
  card: Omit<ResultCard, "body">;
  number: number;
  total: number;
  sectionLabel: string;
  backHref: string;
};

export function CaseHero({ card, number, total, sectionLabel, backHref }: CaseHeroProps) {
  const [zoomed, setZoomed] = React.useState<Zoomed>(null);
  const close = React.useCallback(() => setZoomed(null), []);
  const columns = Math.min(card.metrics.length, 4);

  return (
    <header className="relative isolate overflow-hidden pt-10 pb-16 md:pt-14 md:pb-20">
      {/* Soft background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0" />
        <div className="animate-aurora absolute -top-1/3 -right-[10%] size-[36rem] rounded-full bg-brand/15 blur-[120px]" />
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12 lg:px-20">
        <motion.div variants={rise} initial="hidden" animate="visible">
          <Link
            href={backHref}
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            All {sectionLabel.toLowerCase()}
          </Link>
        </motion.div>

        <motion.p
          variants={rise}
          custom={0.08}
          initial="hidden"
          animate="visible"
          className="mt-10 flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase"
        >
          <span className="font-mono tracking-normal text-brand">
            {pad(number)} / {pad(total)}
          </span>
          <span aria-hidden className="h-px w-8 bg-foreground/25" />
          {sectionLabel}
        </motion.p>

        <h1 className="mt-6 max-w-4xl text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] font-normal tracking-tight">
          <SplitText text={card.title} delay={0.15} stagger={0.04} />
        </h1>

        {card.summary && (
          <motion.p
            variants={rise}
            custom={0.45}
            initial="hidden"
            animate="visible"
            className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            {card.summary}
          </motion.p>
        )}

        {card.metrics.length > 0 && (
          <motion.dl
            variants={rise}
            custom={0.6}
            initial="hidden"
            animate="visible"
            style={{ "--cols": columns } as React.CSSProperties}
            className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
          >
            {card.metrics.map((m, i) => (
              <div key={i} className="group relative bg-card px-5 py-6 md:px-7 md:py-8">
                <dt className="sr-only">{m.label}</dt>
                <dd>
                  <CountUp
                    value={m.value}
                    delay={0.7 + i * 0.1}
                    className="block text-2xl font-light tracking-tight whitespace-nowrap transition-colors duration-500 group-hover:text-brand sm:text-3xl md:text-[2.5rem]"
                  />
                  <span aria-hidden className="mt-2 block text-xs leading-snug text-muted-foreground md:text-sm">
                    {m.label}
                  </span>
                </dd>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-brand transition-transform duration-500 group-hover:scale-x-100"
                />
              </div>
            ))}
          </motion.dl>
        )}

        {card.image && (
          <motion.button
            type="button"
            onClick={() => setZoomed({ src: card.image!.url, alt: card.image!.alt || card.title })}
            initial={{ opacity: 0, clipPath: "inset(10% 6% 10% 6% round 1.5rem)" }}
            animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0% round 1.5rem)" }}
            transition={{ duration: 1.2, delay: 0.75, ease: easeOutExpo }}
            aria-label="Open report full size"
            className="group relative mt-8 block w-full cursor-zoom-in overflow-hidden rounded-3xl border border-border bg-white"
          >
            <Image
              src={card.image.url}
              alt={card.image.alt || card.title}
              width={card.image.width ?? 1200}
              height={card.image.height ?? 800}
              sizes="(max-width: 1200px) 100vw, 1040px"
              preload
              className="mx-auto h-auto max-h-[70vh] w-auto max-w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <span className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
              <Maximize2 className="size-3.5" /> Full size
            </span>
          </motion.button>
        )}
      </div>

      <Lightbox image={zoomed} onClose={close} />
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Body (long description from WordPress)                              */
/* ------------------------------------------------------------------ */

/**
 * Renders the sanitized case-study HTML (see `sanitizeRichHtml`). Blocks fade up as they scroll
 * into view, and any report image opens in the lightbox.
 */
export function CaseBody({ html }: { html: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [zoomed, setZoomed] = React.useState<Zoomed>(null);
  const close = React.useCallback(() => setZoomed(null), []);

  // Scroll reveal: only enabled once JS runs, so content is never hidden without it.
  React.useEffect(() => {
    const root = ref.current;
    if (!root || reduce) return;
    const blocks = root.querySelectorAll<HTMLElement>(
      ":scope > :not(.cs-grid), :scope > .cs-grid > *, .ticks > li, .shot"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.shown = "";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    blocks.forEach((el, i) => {
      el.dataset.reveal = "";
      el.style.transitionDelay = el.matches(".ticks > li") ? `${(i % 6) * 60}ms` : "";
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [html, reduce]);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const img = (e.target as HTMLElement).closest("img");
    if (!img) return;
    setZoomed({ src: img.currentSrc || img.src, alt: img.alt });
  };

  if (!html) return null;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pb-8 md:px-12 lg:px-20">
      {/* Clicking a report image zooms it; a mouse-only enhancement, the content reads fine without it. */}
      <div ref={ref} onClick={onClick} className="case-study" dangerouslySetInnerHTML={{ __html: html }} />
      <Lightbox image={zoomed} onClose={close} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Previous / next                                                     */
/* ------------------------------------------------------------------ */

type Neighbour = { slug: string; title: string } | null;

export function CaseNav({ prev, next, backHref, sectionLabel }: { prev: Neighbour; next: Neighbour; backHref: string; sectionLabel: string }) {
  return (
    <nav aria-label="More cases" className="mx-auto w-full max-w-[1200px] px-6 pt-8 pb-24 md:px-12 lg:px-20">
      <div className="grid gap-4 border-t border-border pt-10 md:grid-cols-2">
        {prev ? (
          <NeighbourLink href={`/results/${prev.slug}`} title={prev.title} direction="prev" />
        ) : (
          <NeighbourLink href={backHref} title={`All ${sectionLabel.toLowerCase()}`} direction="prev" kicker="Back to" />
        )}
        {next ? (
          <NeighbourLink href={`/results/${next.slug}`} title={next.title} direction="next" />
        ) : (
          <NeighbourLink href={backHref} title={`All ${sectionLabel.toLowerCase()}`} direction="next" kicker="Back to" />
        )}
      </div>
    </nav>
  );
}

function NeighbourLink({
  href,
  title,
  direction,
  kicker,
}: {
  href: string;
  title: string;
  direction: "prev" | "next";
  kicker?: string;
}) {
  const isNext = direction === "next";
  return (
    <Link
      href={href}
      className={`group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-6 transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-brand/40 md:p-8 ${isNext ? "md:items-end md:text-right" : ""}`}
    >
      <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        {!isNext && <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1" />}
        {kicker ?? (isNext ? "Next case" : "Previous case")}
        {isNext && <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />}
      </span>
      <span className="text-lg leading-snug tracking-tight transition-colors duration-300 group-hover:text-brand md:text-xl">
        {title}
      </span>
    </Link>
  );
}
