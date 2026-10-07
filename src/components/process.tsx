"use client";

import * as React from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";
import type { ProcessContent } from "@/lib/wordpress";
import { easeOutExpo } from "@/components/motion/ease";
import { SplitText } from "@/components/motion/split-text";

type ProcessProps = {
  process: ProcessContent;
  /** Eyebrow text, taken from the matching WordPress nav item. */
  label?: string;
  /** Position of the section in the nav (1-based), shown as "07". */
  index?: number;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: easeOutExpo } },
};

const inView = { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "0px 0px -12% 0px" } } as const;

const pad = (n: number) => String(n).padStart(2, "0");

export function Process({ process, label = "Process", index }: ProcessProps) {
  const { title, description, steps, services } = process;

  return (
    <section id="process" className="relative w-full scroll-mt-24 pt-16 pb-24 md:pt-20 md:pb-32">
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

        {steps.length > 0 && <Steps steps={steps} />}
      </div>

      {services.length > 0 && <ServiceRibbon services={services} />}
    </section>
  );
}

/**
 * Steps on a rail that fills with brand colour as you scroll: horizontal on desktop, vertical on
 * smaller screens. Each step's node lights up once the fill reaches it.
 */
function Steps({ steps }: { steps: ProcessContent["steps"] }) {
  const ref = React.useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.6"] });
  const fill = useSpring(useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0, 1]), {
    stiffness: 110,
    damping: 26,
    mass: 0.4,
  });

  // How many nodes the fill has reached (step i sits at i / (n - 1) along the rail).
  const [reached, setReached] = React.useState(reduce ? steps.length : 0);
  useMotionValueEvent(fill, "change", (v) => {
    const n = steps.length;
    const count = n === 1 ? (v > 0.02 ? 1 : 0) : Math.min(n, Math.floor(v * (n - 1) + 1.02));
    setReached((prev) => (prev === count ? prev : count));
  });

  // Last column starts one column-width (plus gaps) from the right; its node centre is 20px in.
  const railRight = { right: "calc((100% - (var(--steps) - 1) * 2.5rem) / var(--steps) - 20px)" };

  return (
    <ol
      ref={ref}
      style={{ "--steps": steps.length } as React.CSSProperties}
      className="relative grid gap-12 lg:grid-cols-[repeat(var(--steps),minmax(0,1fr))] lg:gap-10"
    >
      {/* Rail: horizontal from the first node centre to the last on desktop… */}
      <span aria-hidden style={railRight} className="absolute top-[19px] left-5 hidden h-px bg-border lg:block" />
      <motion.span
        aria-hidden
        style={{ ...railRight, scaleX: fill }}
        className="absolute top-[19px] left-5 hidden h-px origin-left bg-brand lg:block"
      />
      {/* …and vertical down the left on smaller screens */}
      <span aria-hidden className="absolute top-[19px] bottom-6 left-[19px] w-px bg-border lg:hidden" />
      <motion.span
        aria-hidden
        style={{ scaleY: fill }}
        className="absolute top-[19px] bottom-6 left-[19px] w-px origin-top bg-brand lg:hidden"
      />

      {steps.map((step, i) => {
        const lit = i < reached;
        return (
          <motion.li
            key={`${step.title}-${i}`}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.8, delay: 0.08 * i, ease: easeOutExpo }}
            className="group relative pl-16 lg:pl-0"
          >
            {/* Node */}
            <span
              className={cn(
                "absolute top-0 left-0 grid size-10 place-items-center rounded-full border font-mono text-xs transition-[background-color,border-color,color,box-shadow] duration-500 lg:relative",
                lit
                  ? "border-brand bg-brand text-white shadow-[0_0_0_6px_var(--brand-soft)]"
                  : "border-border bg-background text-muted-foreground"
              )}
            >
              {pad(i + 1)}
            </span>

            <div className="transition-transform duration-500 ease-out group-hover:-translate-y-1 lg:mt-8">
              {step.image && (
                <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={step.image.url}
                    alt={step.image.alt || step.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 260px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              )}
              <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Step {pad(i + 1)}</p>
              {step.title && (
                <h3
                  className={cn(
                    "mt-2 text-xl leading-snug tracking-tight transition-colors duration-500 md:text-[1.4rem]",
                    lit ? "text-foreground" : "text-foreground/70",
                    "group-hover:text-brand"
                  )}
                >
                  {step.title}
                </h3>
              )}
              {step.description && (
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{step.description}</p>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

/** Large, alternating solid/outlined service names scrolling across the screen. */
function ServiceRibbon({ services }: { services: string[] }) {
  // Repeat until one copy is comfortably wider than any screen, then render it twice for the loop.
  const repeats = Math.max(1, Math.ceil(8 / services.length));
  const copy = Array.from({ length: repeats }, () => services).flat();

  const strip = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className={cn("flex shrink-0 items-center", hidden && "motion-reduce:hidden")}>
      {copy.map((service, i) => (
        <li
          key={i}
          aria-hidden={i >= services.length || undefined}
          className={cn("flex items-center", i >= services.length && "motion-reduce:hidden")}
        >
          <span
            className={cn(
              "px-6 text-[clamp(1.75rem,4.5vw,3.5rem)] leading-none font-normal tracking-tight whitespace-nowrap transition-colors duration-300 md:px-10",
              i % 2 === 0
                ? "text-foreground hover:text-brand"
                : "text-transparent [-webkit-text-stroke:1px_var(--foreground)] hover:[-webkit-text-stroke:1px_var(--brand)]"
            )}
          >
            {service}
          </span>
          <span aria-hidden className="text-[clamp(1rem,2vw,1.5rem)] text-brand">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <motion.div
      variants={fadeUp}
      {...inView}
      role="region"
      aria-label="Services"
      className="group/ribbon mt-20 flex overflow-hidden border-y border-border py-8 mask-fade-x md:mt-28 md:py-10 motion-reduce:[mask-image:none]"
    >
      <div
        className="animate-marquee flex w-max group-hover/ribbon:[animation-play-state:paused] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-4"
        style={{ "--marquee-duration": `${copy.length * 6}s` } as React.CSSProperties}
      >
        {strip(false)}
        {strip(true)}
      </div>
    </motion.div>
  );
}
