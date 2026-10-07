"use client";

import * as React from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StackContent } from "@/lib/wordpress";
import { easeOutExpo } from "@/components/motion/ease";
import { SplitText } from "@/components/motion/split-text";

type StackProps = {
  stack: StackContent;
  /** Eyebrow from the WordPress nav when a matching menu item exists. */
  label?: string;
  index?: number;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: easeOutExpo } },
};

const pop: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.94, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.7, ease: easeOutExpo } },
};

const inView = { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "0px 0px -12% 0px" } } as const;

const pad = (n: number) => String(n).padStart(2, "0");

export function Stack({ stack, label = "Stack", index }: StackProps) {
  const { title, areas, tools } = stack;

  return (
    <section id="stack" className="relative w-full scroll-mt-24 pt-16 pb-24 md:pt-20 md:pb-32">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12 lg:px-20">
        {/* Section header */}
        <header className="mb-14 md:mb-16">
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
            <h2 className="max-w-4xl text-[clamp(2.125rem,4.5vw,3.5rem)] leading-[1.08] font-normal tracking-tight">
              <SplitText text={title} inView stagger={0.05} />
            </h2>
          )}
        </header>

        {/* Disciplines */}
        {areas.length > 0 && (
          <motion.div
            {...inView}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className={cn("grid gap-10 md:gap-0", areas.length > 1 && "md:grid-cols-2")}
          >
            {areas.map((area, i) => (
              <motion.article
                key={`${area.title}-${i}`}
                variants={fadeUp}
                className={cn(
                  "group relative pt-8 md:pb-2",
                  areas.length > 1 && (i % 2 === 0 ? "md:pr-12" : "md:border-l md:border-border md:pl-12")
                )}
              >
                {/* Top hairline that draws in, then turns brand on hover */}
                <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-border" />
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.2 + i * 0.15, ease: easeOutExpo }}
                  className="absolute inset-x-0 top-0 h-px origin-left bg-linear-to-r from-brand via-brand/40 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className="font-mono text-xs text-muted-foreground transition-colors duration-300 group-hover:text-brand">
                  {pad(i + 1)}
                </span>
                {area.title && <h3 className="mt-3 text-2xl leading-tight font-normal tracking-tight md:text-[1.75rem]">{area.title}</h3>}
                {area.description && (
                  <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.8] text-muted-foreground">{area.description}</p>
                )}
              </motion.article>
            ))}
          </motion.div>
        )}

        {/* Tools */}
        {tools.length > 0 && <ToolGrid tools={tools} className={areas.length > 0 ? "mt-16 md:mt-20" : undefined} />}
      </div>
    </section>
  );
}

function ToolGrid({ tools, className }: { tools: StackContent["tools"]; className?: string }) {
  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.ul
      {...inView}
      variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
      onPointerMove={onPointerMove}
      aria-label="Tools"
      // Hairline grid: the list draws the top/left edges, each cell its right/bottom.
      className={cn(
        "group/grid relative grid grid-cols-2 border-t border-l border-border sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-[repeat(auto-fit,minmax(130px,1fr))]",
        className
      )}
    >
      {/* One spotlight shared by the whole grid, following the cursor across cells */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover/grid:opacity-100"
        style={{ background: "radial-gradient(280px circle at var(--mx) var(--my), var(--brand-soft), transparent 70%)" }}
      />

      {tools.map((tool, i) => (
        <motion.li
          key={`${tool.name}-${i}`}
          variants={pop}
          className="group relative z-10 flex flex-col items-center justify-start gap-4 border-r border-b border-border px-4 pt-10 pb-8 text-center md:pt-12 md:pb-10"
        >
          <span className="absolute top-3 left-3 font-mono text-[10px] text-muted-foreground/70 transition-colors duration-300 group-hover:text-brand">
            {pad(i + 1)}
          </span>

          {/* Icons are screenshots on white, so they sit on a white app-style tile in both themes. */}
          <span className="relative grid size-16 place-items-center rounded-2xl bg-white shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-black/5 transition-[transform,box-shadow] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_18px_36px_-18px_var(--brand)] group-hover:ring-brand/40 dark:ring-white/10">
            {tool.image ? (
              <Image
                src={tool.image.url}
                alt=""
                width={tool.image.width ?? 64}
                height={tool.image.height ?? 44}
                sizes="64px"
                className="h-8 w-auto max-w-11 object-contain"
              />
            ) : (
              <span aria-hidden className="font-mono text-base text-neutral-500">
                {tool.name.slice(0, 2)}
              </span>
            )}
          </span>

          <span className="text-[13px] leading-snug text-muted-foreground transition-colors duration-300 group-hover:text-foreground md:text-sm">
            {tool.name}
          </span>

          {/* Accent line along the bottom edge */}
          <span
            aria-hidden
            className="absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-brand transition-transform duration-500 ease-out group-hover:scale-x-100"
          />
        </motion.li>
      ))}
    </motion.ul>
  );
}
