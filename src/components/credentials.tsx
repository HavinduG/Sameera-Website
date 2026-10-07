"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CredentialsContent } from "@/lib/wordpress";
import { easeOutExpo } from "@/components/motion/ease";
import { SplitText } from "@/components/motion/split-text";

type CredentialsProps = {
  credentials: CredentialsContent;
  /** Eyebrow text, taken from the matching WordPress nav item. */
  label?: string;
  /** Position of the section in the nav (1-based), shown as "06". */
  index?: number;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: easeOutExpo } },
};

const pop: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: easeOutExpo } },
};

const inView = { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "0px 0px -12% 0px" } } as const;

const pad = (n: number) => String(n).padStart(2, "0");

export function Credentials({ credentials, label = "Credentials", index }: CredentialsProps) {
  const { title, education, awards } = credentials;
  const both = education.length > 0 && awards.length > 0;

  return (
    <section id="credentials" className="relative w-full scroll-mt-24 pt-16 pb-24 md:pt-20 md:pb-32">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12 lg:px-20">
        {/* Section header */}
        <header className="mb-14 md:mb-20">
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

        <div className={cn("grid gap-16", both && "lg:grid-cols-[1fr_1.1fr] lg:gap-20")}>
          {education.length > 0 && <Education items={education} />}
          {awards.length > 0 && <Awards items={awards} />}
        </div>
      </div>
    </section>
  );
}

function GroupHeading({ children, count }: { children: React.ReactNode; count: number }) {
  return (
    <motion.h3
      variants={fadeUp}
      {...inView}
      className="mb-8 flex items-baseline justify-between border-b border-border pb-4 text-sm font-medium tracking-tight"
    >
      {children}
      <span className="font-mono text-xs font-normal text-muted-foreground">{pad(count)}</span>
    </motion.h3>
  );
}

/** Timeline whose rail fills with brand colour as you scroll through it. */
function Education({ items }: { items: CredentialsContent["education"] }) {
  const ref = React.useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.55"] });
  const fill = useSpring(useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0, 1]), {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });

  return (
    <div>
      <GroupHeading count={items.length}>Education &amp; memberships</GroupHeading>
      <ol ref={ref} className="relative">
        {/* Rail */}
        <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-border" />
        <motion.span
          aria-hidden
          style={{ scaleY: fill }}
          className="absolute top-2 bottom-2 left-[5px] w-px origin-top bg-brand"
        />

        {items.map((item, i) => (
          <motion.li
            key={`${item.level}-${i}`}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 0.7, delay: 0.05 * i, ease: easeOutExpo }}
            className="group relative pb-9 pl-9 last:pb-0"
          >
            {/* Node: fills in once the row scrolls into view */}
            <span
              aria-hidden
              className="absolute top-1.5 left-0 grid size-[11px] place-items-center rounded-full border-2 border-brand bg-background ring-4 ring-background"
            >
              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: "0px 0px -35% 0px" }}
                transition={{ duration: 0.5, ease: easeOutExpo }}
                className="size-full rounded-full bg-brand"
              />
            </span>
            {item.level && (
              <span className="inline-flex rounded-full border border-brand/30 bg-brand/[0.07] px-2.5 py-0.5 font-mono text-[11px] tracking-wide text-brand">
                {item.level}
              </span>
            )}
            {item.qualification && (
              <p className="mt-2.5 text-lg leading-snug tracking-tight transition-transform duration-500 ease-out group-hover:translate-x-1 md:text-xl">
                {item.qualification}
              </p>
            )}
            {item.institute && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.institute}</p>}
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

function Awards({ items }: { items: CredentialsContent["awards"] }) {
  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div>
      <GroupHeading count={items.length}>Licences &amp; awards</GroupHeading>
      <motion.ul
        {...inView}
        variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
        onPointerMove={onPointerMove}
        // Hairline grid: the list draws the top/left edges, each cell its right/bottom.
        className="group/grid relative grid grid-cols-2 border-t border-l border-border sm:grid-cols-3"
      >
        {/* One spotlight shared by the grid, following the cursor */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover/grid:opacity-100"
          style={{ background: "radial-gradient(260px circle at var(--mx) var(--my), var(--brand-soft), transparent 70%)" }}
        />

        {items.map((award, i) => (
          <motion.li
            key={`${award.name}-${i}`}
            variants={pop}
            className="group relative z-10 flex flex-col items-center border-r border-b border-border px-3 pt-6 pb-5 text-center"
          >
            {/* Badge on a white tile (the images are screenshots on white) with a light sweep on hover */}
            <span className="relative grid aspect-[4/3] w-full max-w-[150px] place-items-center overflow-hidden rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-black/5 transition-[transform,box-shadow] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:-rotate-2 group-hover:shadow-[0_20px_40px_-20px_var(--brand)] dark:ring-white/10">
              {award.image ? (
                <Image
                  src={award.image.url}
                  alt=""
                  width={award.image.width ?? 160}
                  height={award.image.height ?? 120}
                  sizes="150px"
                  className="h-full w-auto object-contain"
                />
              ) : (
                <span aria-hidden className="font-mono text-sm text-neutral-400">
                  {pad(i + 1)}
                </span>
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/80 to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[420%] group-hover:opacity-100 motion-reduce:hidden"
              />
            </span>

            {award.name && (
              <p className="mt-4 text-[13px] leading-snug transition-colors duration-300 group-hover:text-foreground md:text-sm">
                {award.name}
              </p>
            )}
            {award.issuer && <p className="mt-1 text-xs text-muted-foreground transition-colors duration-300 group-hover:text-brand">{award.issuer}</p>}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
