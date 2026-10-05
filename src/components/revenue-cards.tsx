"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import type { StatItem } from "@/lib/wordpress";
import { CountUp } from "@/components/motion/count-up";
import { easeOutExpo } from "@/components/motion/ease";

type RevenueCardsProps = {
  stats: StatItem[];
};

const panel: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: easeOutExpo, staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cell: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: easeOutExpo } },
};

/** Joined stat panel under the hero. Every value comes from the WordPress `revenue_cards` field. */
export function RevenueCards({ stats }: RevenueCardsProps) {
  if (stats.length === 0) return null;
  const columns = Math.min(stats.length, 4);

  return (
    <section id="highlights" className="w-full scroll-mt-28 pb-16 md:pb-20">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12 lg:px-20">
        <motion.ul
          variants={panel}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          style={{ "--cols": columns } as React.CSSProperties}
          className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-[0_1px_2px_rgb(0_0_0/0.04)] sm:grid-cols-2 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
        >
          {stats.map((stat, i) => (
            <motion.li key={`${stat.title}-${i}`} variants={cell} className="bg-card">
              <StatCell stat={stat} index={i} />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

function StatCell({ stat, index }: { stat: StatItem; index: number }) {
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div onPointerMove={onPointerMove} className="group relative h-full overflow-hidden px-7 py-8">
      {/* Cursor spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(260px circle at var(--mx) var(--my), var(--brand-soft), transparent 70%)" }}
      />

      <p className="relative flex items-baseline gap-1">
        {stat.prefix && <span className="text-base text-muted-foreground">{stat.prefix}</span>}
        <CountUp
          value={stat.value}
          delay={0.2 + index * 0.1}
          className="text-5xl font-light tracking-tight transition-colors duration-500 group-hover:text-brand"
        />
        {stat.suffix && <span className="text-lg text-muted-foreground">{stat.suffix}</span>}
      </p>

      {stat.title && (
        <p className="relative mt-4 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {stat.title}
        </p>
      )}
      {stat.description && (
        <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground/80">{stat.description}</p>
      )}

      {/* Accent line that sweeps in on hover */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-brand transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
    </div>
  );
}
