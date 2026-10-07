"use client";

import * as React from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ClientsContent, WPImage } from "@/lib/wordpress";
import { easeOutExpo } from "@/components/motion/ease";
import { SplitText } from "@/components/motion/split-text";

type ClientsProps = {
  clients: ClientsContent;
  /** Eyebrow text, taken from the matching WordPress nav item. */
  label?: string;
  /** Position of the section in the nav (1-based), shown as "05". */
  index?: number;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: easeOutExpo } },
};

const inView = { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "0px 0px -12% 0px" } } as const;

/** Each marquee copy needs at least this many logos so it is wider than the screen (no gap at the seam). */
const MIN_PER_COPY = 10;

export function Clients({ clients, label = "Clients", index }: ClientsProps) {
  const { title, description, logos, industries } = clients;

  // Six or more logos: two rows moving in opposite directions. Fewer: one row.
  const rows = logos.length >= 6 ? [logos.filter((_, i) => i % 2 === 0), logos.filter((_, i) => i % 2 === 1)] : [logos];

  return (
    <section aria-labelledby="clients-title" className="relative w-full pt-16 pb-24 md:pt-20 md:pb-32">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12 lg:px-20">
        {/* Section header */}
        <header className="mb-14 grid gap-6 md:mb-16 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
          <div>
            <motion.p
              variants={fadeUp}
              {...inView}
              className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase"
            >
              {index !== undefined && (
                <span className="font-mono tracking-normal text-brand">{String(index).padStart(2, "0")}</span>
              )}
              <span aria-hidden className="h-px w-8 bg-foreground/25" />
              {label}
            </motion.p>
            {title && (
              <h2 id="clients-title" className="text-[clamp(2.125rem,4.5vw,3.5rem)] leading-[1.08] font-normal tracking-tight">
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
      </div>

      {/* Logo marquee: full-bleed so logos glide in from the screen edges */}
      {logos.length > 0 && (
        <motion.div
          variants={fadeUp}
          {...inView}
          aria-label="Client logos"
          role="region"
          className="relative space-y-6 border-y border-border py-8 md:space-y-8 md:py-10"
        >
          {rows.map((row, i) => (
            <LogoRow key={i} logos={row} reverse={i % 2 === 1} hideFromScreenReaders={i > 0} />
          ))}
        </motion.div>
      )}

      {/* Industries */}
      {industries.length > 0 && (
        <div className="mx-auto mt-12 w-full max-w-[1200px] px-6 md:mt-14 md:px-12 lg:px-20">
          <motion.ul
            {...inView}
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            aria-label="Industries"
            className="flex flex-wrap gap-x-8 gap-y-4"
          >
            {industries.map((industry, i) => (
              <motion.li key={`${industry}-${i}`} variants={fadeUp} className="group flex items-center gap-3 text-sm md:text-[15px]">
                <span className="font-mono text-xs text-muted-foreground transition-colors duration-300 group-hover:text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative">
                  {industry}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-brand transition-transform duration-500 group-hover:scale-x-100"
                  />
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}
    </section>
  );
}

function LogoRow({
  logos,
  reverse,
  hideFromScreenReaders,
}: {
  logos: WPImage[];
  reverse: boolean;
  hideFromScreenReaders: boolean;
}) {
  // Repeat the set until one copy is wide enough, then render that copy twice for a seamless loop.
  const repeats = Math.max(1, Math.ceil(MIN_PER_COPY / logos.length));
  const copy = Array.from({ length: repeats }, () => logos).flat();
  const duration = copy.length * 3.5; // ~constant speed regardless of how many logos WordPress has

  const strip = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className={cn(
        "flex shrink-0 items-center gap-12 pr-12 md:gap-20 md:pr-20",
        hidden && "motion-reduce:hidden"
      )}
    >
      {copy.map((logo, i) => (
        <li
          key={i}
          // Only the first copy of the first set is announced; repeats are visual filler.
          aria-hidden={i >= logos.length || undefined}
          className={cn(i >= logos.length && "motion-reduce:hidden")}
        >
          <Logo logo={logo} />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      aria-hidden={hideFromScreenReaders || undefined}
      className="group/row flex overflow-hidden mask-fade-x motion-reduce:justify-center motion-reduce:[mask-image:none]"
    >
      {/* The track's transform isolates blending, so it carries the page background (same as <body>
          in layout.tsx); the logos' blend modes then remove their white screenshot backgrounds. */}
      <div
        className={cn(
          "animate-marquee flex w-max bg-[#f3f4f6] group-hover/row:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:flex-wrap dark:bg-[#0a0a0a]",
          reverse && "[animation-direction:reverse]"
        )}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {strip(false)}
        {strip(true)}
      </div>
    </div>
  );
}

function Logo({ logo }: { logo: WPImage }) {
  const w = logo.width ?? 200;
  const h = logo.height ?? 80;

  return (
    <div className="group/logo relative flex h-14 items-center md:h-16">
      <Image
        src={logo.url}
        alt={logo.alt || "Client logo"}
        width={w}
        height={h}
        sizes="200px"
        // Logos are screenshots on white and stay in full colour. Light mode: multiply drops the white.
        // Dark mode: invert + hue-rotate(180deg) flips the white to black while keeping the hues, then
        // screen drops the black, so the logo sits on the dark page without a white box.
        className={cn(
          "h-full w-auto max-w-[180px] object-contain transition-[filter,opacity,transform] duration-500 ease-out md:max-w-[200px]",
          "mix-blend-multiply group-hover/logo:scale-110",
          "dark:mix-blend-screen dark:hue-rotate-180 dark:invert"
        )}
      />
    </div>
  );
}
