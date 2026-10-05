"use client";

import * as React from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ExpertiseCard, ExpertiseContent, ExpertisePoint } from "@/lib/wordpress";
import { easeOutExpo } from "@/components/motion/ease";
import { SplitText } from "@/components/motion/split-text";

type ExpertiseProps = {
  expertise: ExpertiseContent;
  /** Eyebrow text, taken from the matching WordPress nav item. */
  label?: string;
  /** Position of the section in the nav (1-based), shown as "03". */
  index?: number;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: easeOutExpo } },
};

const inView = { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "0px 0px -12% 0px" } } as const;

const pad = (n: number) => String(n).padStart(2, "0");

export function Expertise({ expertise, label = "Expertise", index }: ExpertiseProps) {
  const { title, description, cards } = expertise;
  const [active, setActive] = React.useState(0);
  const tabsId = React.useId();

  return (
    <section id="expertise" className="relative w-full scroll-mt-24 pt-16 pb-24 md:pt-20 md:pb-32">
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
                <SplitText text={title} inView stagger={0.05} />
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
          <>
            {/* Desktop: tabs + detail panel */}
            <motion.div
              variants={fadeUp}
              {...inView}
              className="hidden gap-6 lg:grid lg:grid-cols-[0.95fr_1.05fr]"
            >
              <TabList cards={cards} active={active} onSelect={setActive} tabsId={tabsId} />
              {/* Invisible copies of every panel share one grid cell, so the box is always as
                  tall as the longest card and switching tabs never shifts the page. */}
              <div className="grid">
                {cards.map((card, i) => (
                  <div key={i} aria-hidden className={cn(PANEL_CLASS, "invisible [grid-area:1/1]")}>
                    <PanelBody card={card} number={i + 1} total={cards.length} />
                  </div>
                ))}
                <div className="[grid-area:1/1]">
                  <AnimatePresence mode="wait" initial={false}>
                    <DetailPanel
                      key={active}
                      card={cards[active]}
                      number={active + 1}
                      total={cards.length}
                      id={`${tabsId}-panel`}
                      labelledBy={`${tabsId}-tab-${active}`}
                    />
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Mobile / tablet: accordion */}
            <Accordion cards={cards} />
          </>
        )}
      </div>
    </section>
  );
}

function TabList({
  cards,
  active,
  onSelect,
  tabsId,
}: {
  cards: ExpertiseCard[];
  active: number;
  onSelect: (i: number) => void;
  tabsId: string;
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const next =
      e.key === "ArrowDown" ? (i + 1) % cards.length
      : e.key === "ArrowUp" ? (i - 1 + cards.length) % cards.length
      : e.key === "Home" ? 0
      : e.key === "End" ? cards.length - 1
      : -1;
    if (next === -1) return;
    e.preventDefault();
    onSelect(next);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-orientation="vertical" className="relative flex flex-col gap-1 self-start">
      {/* Funnel rail: a hairline with a brand segment that grows with the active step */}
      <div aria-hidden className="absolute top-6 bottom-6 left-[2.15rem] w-px bg-border">
        <motion.div
          className="w-full origin-top bg-brand"
          initial={false}
          animate={{ height: `${cards.length > 1 ? (active / (cards.length - 1)) * 100 : 100}%` }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
        />
      </div>

      {cards.map((card, i) => {
        const selected = i === active;
        return (
          <button
            key={`${card.title}-${i}`}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${tabsId}-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`${tabsId}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(i)}
            onMouseEnter={() => onSelect(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="group relative flex w-full items-start gap-5 rounded-2xl px-5 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            {selected && (
              <motion.span
                layoutId="expertise-active"
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                className="absolute inset-0 rounded-2xl border border-border bg-card shadow-[0_12px_40px_-24px_var(--brand)]"
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border bg-background font-mono text-[11px] transition-colors duration-300",
                selected ? "border-brand bg-brand text-white" : "border-border text-muted-foreground group-hover:border-foreground/30"
              )}
            >
              {pad(i + 1)}
            </span>
            <span className="relative z-10 min-w-0">
              <span
                className={cn(
                  "block text-lg leading-snug tracking-tight transition-colors duration-300",
                  selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {card.title}
              </span>
              {card.summary && (
                <span
                  className={cn(
                    "mt-1 block text-sm leading-relaxed text-muted-foreground transition-opacity duration-300",
                    selected ? "opacity-100" : "opacity-60"
                  )}
                >
                  {card.summary}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DetailPanel({
  card,
  number,
  total,
  id,
  labelledBy,
}: {
  card: ExpertiseCard;
  number: number;
  total: number;
  id: string;
  labelledBy: string;
}) {
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      onPointerMove={onPointerMove}
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
      transition={{ duration: 0.45, ease: easeOutExpo }}
      className={cn(PANEL_CLASS, "group h-full")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(320px circle at var(--mx) var(--my), var(--brand-soft), transparent 70%)" }}
      />
      {/* Oversized step number in the corner */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-6 right-4 font-mono text-[9rem] leading-none font-light text-foreground/[0.04] select-none"
      >
        {pad(number)}
      </span>

      <PanelBody card={card} number={number} total={total} animated />
    </motion.div>
  );
}

const PANEL_CLASS = "relative overflow-hidden rounded-3xl border border-border bg-card p-8 xl:p-10";

/** Panel content. `animated` staggers the points in; the invisible sizing copies render it static. */
function PanelBody({
  card,
  number,
  total,
  animated = false,
}: {
  card: ExpertiseCard;
  number: number;
  total: number;
  animated?: boolean;
}) {
  return (
    <>
      {card.image && (
        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={card.image.url}
            alt={card.image.alt || card.title}
            fill
            sizes="(max-width: 1280px) 50vw, 560px"
            className="object-cover"
          />
        </div>
      )}

      <p className="relative font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        <span className="text-brand">{pad(number)}</span> / {pad(total)}
      </p>
      <h3 className="relative mt-3 text-3xl leading-tight font-normal tracking-tight">{card.title}</h3>

      {card.points.length > 0 && (
        <motion.ul
          initial={animated ? "hidden" : false}
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } } }}
          className="relative mt-8 divide-y divide-border border-t border-border"
        >
          {card.points.map((point, i) => (
            <motion.li
              key={i}
              variants={{
                hidden: { opacity: 0, x: 12 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeOutExpo } },
              }}
            >
              <Point point={point} />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </>
  );
}

function Point({ point }: { point: ExpertisePoint }) {
  return (
    <div className="flex gap-4 py-4">
      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
      <p className="text-[15px] leading-relaxed text-muted-foreground [&_a]:text-brand [&_a]:underline [&_b]:font-medium [&_b]:text-foreground [&_strong]:font-medium [&_strong]:text-foreground">
        {point.lead && <span className="font-medium text-foreground">{point.lead} </span>}
        <span dangerouslySetInnerHTML={{ __html: point.html }} />
      </p>
    </div>
  );
}

function Accordion({ cards }: { cards: ExpertiseCard[] }) {
  const [open, setOpen] = React.useState<number | null>(0);
  const baseId = React.useId();

  return (
    <motion.ul
      {...inView}
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card lg:hidden"
    >
      {cards.map((card, i) => {
        const isOpen = open === i;
        return (
          <motion.li key={`${card.title}-${i}`} variants={fadeUp}>
            <h3>
              <button
                type="button"
                id={`${baseId}-btn-${i}`}
                aria-expanded={isOpen}
                aria-controls={`${baseId}-panel-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-start gap-4 px-5 py-5 text-left outline-none focus-visible:bg-muted sm:px-7"
              >
                <span
                  className={cn(
                    "mt-0.5 font-mono text-xs transition-colors duration-300",
                    isOpen ? "text-brand" : "text-muted-foreground"
                  )}
                >
                  {pad(i + 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg leading-snug tracking-tight">{card.title}</span>
                  {card.summary && (
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{card.summary}</span>
                  )}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.35, ease: easeOutExpo }}
                  className={cn(
                    "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border transition-colors duration-300",
                    isOpen ? "border-brand bg-brand text-white" : "border-border text-muted-foreground"
                  )}
                >
                  <Plus className="size-3.5" />
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${baseId}-panel-${i}`}
                  role="region"
                  aria-labelledby={`${baseId}-btn-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: easeOutExpo }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 sm:px-7 sm:pl-[3.75rem]">
                    {card.image && (
                      <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
                        <Image src={card.image.url} alt={card.image.alt || card.title} fill sizes="100vw" className="object-cover" />
                      </div>
                    )}
                    <ul className="divide-y divide-border border-t border-border">
                      {card.points.map((point, j) => (
                        <li key={j}>
                          <Point point={point} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
