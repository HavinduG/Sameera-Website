"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";
import type { Testimonial, TestimonialsContent } from "@/lib/wordpress";
import { easeOutExpo } from "@/components/motion/ease";
import { SplitText } from "@/components/motion/split-text";

/** Time each quote stays on screen before auto-advancing. */
const SLIDE_MS = 7000;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: easeOutExpo } },
};

const inView = { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "0px 0px -12% 0px" } } as const;

const pad = (n: number) => String(n).padStart(2, "0");

const initials = (name: string) =>
  name
    .replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

export function Testimonials({ testimonials }: { testimonials: TestimonialsContent }) {
  const { title, description, items } = testimonials;
  const count = items.length;
  const sectionRef = React.useRef<HTMLElement>(null);
  const visible = useInView(sectionRef, { margin: "-20% 0px -20% 0px" });
  const reduce = useReducedMotion();

  const [active, setActive] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [hovering, setHovering] = React.useState(false);
  const [userPaused, setUserPaused] = React.useState(false);

  // Auto-advance: a frame-driven timer so it can pause mid-way (hover, off-screen, user pause).
  const progress = useMotionValue(0);
  const elapsed = React.useRef(0);
  const running = count > 1 && visible && !hovering && !userPaused && !reduce;

  const go = React.useCallback(
    (next: number, dir: number) => {
      setDirection(dir);
      setActive(((next % count) + count) % count);
      elapsed.current = 0;
      progress.set(0);
    },
    [count, progress]
  );
  const next = React.useCallback(() => go(active + 1, 1), [go, active]);
  const prev = React.useCallback(() => go(active - 1, -1), [go, active]);
  const select = (i: number) => i !== active && go(i, i > active ? 1 : -1);

  useAnimationFrame((_, delta) => {
    if (!running) return;
    elapsed.current += delta;
    progress.set(Math.min(elapsed.current / SLIDE_MS, 1));
    if (elapsed.current >= SLIDE_MS) next();
  });

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
    else return;
    e.preventDefault();
  };

  // Big decorative quote mark drifts with scroll.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const markY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, -60]);
  const markRotate = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-8, 8]);

  const current = items[active];

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      aria-roledescription="carousel"
      aria-label={title || "Testimonials"}
      className="relative w-full scroll-mt-24 overflow-hidden pt-16 pb-24 md:pt-20 md:pb-32"
    >
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12 lg:px-20">
        {/* Section header */}
        <header className="mb-14 grid gap-6 md:mb-16 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
          <div>
            <motion.p
              variants={fadeUp}
              {...inView}
              className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase"
            >
              <span aria-hidden className="h-px w-8 bg-foreground/25" />
              Testimonials
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

        <motion.div
          variants={fadeUp}
          {...inView}
          className="grid gap-12 lg:grid-cols-[1.55fr_1fr] lg:gap-16"
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onFocus={() => setHovering(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHovering(false)}
        >
          {/* Featured quote */}
          <div className="relative" onKeyDown={onKeyDown}>
            <motion.span
              aria-hidden
              style={{ y: markY, rotate: markRotate }}
              className="pointer-events-none absolute -top-16 -left-3 font-serif text-[11rem] leading-none text-brand/15 select-none md:-top-20 md:-left-6 md:text-[14rem]"
            >
              &ldquo;
            </motion.span>

            {/* Every quote stacked invisibly in one cell, so the block is as tall as the longest
                quote and nothing below jumps when the slide changes. */}
            <div className="relative grid">
              {items.map((t, i) => (
                <div key={i} aria-hidden className="invisible [grid-area:1/1]">
                  <QuoteBody testimonial={t} animate={false} />
                </div>
              ))}
              <div className="[grid-area:1/1]" aria-live={running ? "off" : "polite"}>
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div
                    key={active}
                    custom={direction}
                    drag={count > 1 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.18}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -60) next();
                      else if (info.offset.x > 60) prev();
                    }}
                    variants={{
                      enter: (dir: number) => ({ opacity: 0, x: reduce ? 0 : dir * 40 }),
                      center: { opacity: 1, x: 0 },
                      exit: (dir: number) => ({ opacity: 0, x: reduce ? 0 : dir * -40 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.45, ease: easeOutExpo }}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${active + 1} of ${count}`}
                    className={cn(count > 1 && "cursor-grab active:cursor-grabbing")}
                  >
                    <QuoteBody testimonial={current} animate={!reduce} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Controls */}
            {count > 1 && (
              <div className="mt-10 flex items-center gap-5">
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  <span className="text-foreground">{pad(active + 1)}</span> / {pad(count)}
                </span>
                <ProgressLine progress={progress} />
                <div className="flex items-center gap-2">
                  {!reduce && (
                    <ControlButton
                      label={userPaused ? "Play testimonials" : "Pause testimonials"}
                      onClick={() => setUserPaused((p) => !p)}
                    >
                      {userPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                    </ControlButton>
                  )}
                  <ControlButton label="Previous testimonial" onClick={prev}>
                    <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                  </ControlButton>
                  <ControlButton label="Next testimonial" onClick={next}>
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </ControlButton>
                </div>
              </div>
            )}
          </div>

          {/* People list (desktop) / avatar strip (mobile) */}
          {count > 1 && (
            <>
              <ul className="hidden divide-y divide-border border-y border-border lg:block" aria-label="Choose a testimonial">
                {items.map((t, i) => {
                  const selected = i === active;
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => select(i)}
                        aria-current={selected || undefined}
                        className="group relative flex w-full items-center gap-4 py-4 text-left outline-none focus-visible:bg-muted"
                      >
                        <Avatar testimonial={t} active={selected} />
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block truncate text-[15px] transition-colors duration-300",
                              selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                            )}
                          >
                            {t.name}
                          </span>
                          {t.role && <span className="block truncate text-xs text-muted-foreground">{t.role}</span>}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">{pad(i + 1)}</span>
                        {/* Active marker slides between rows */}
                        {selected && (
                          <motion.span
                            layoutId="testimonial-marker"
                            transition={{ type: "spring", stiffness: 400, damping: 36 }}
                            className="absolute top-0 -left-px h-full w-0.5 bg-brand"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <ul className="flex flex-wrap gap-2 lg:hidden" aria-label="Choose a testimonial">
                {items.map((t, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => select(i)}
                      aria-label={`Show testimonial from ${t.name}`}
                      aria-current={i === active || undefined}
                      className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                    >
                      <Avatar testimonial={t} active={i === active} />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/** Quote text (word-by-word reveal) and attribution. */
function QuoteBody({ testimonial, animate }: { testimonial: Testimonial; animate: boolean }) {
  const words = testimonial.quote.split(/\s+/);
  return (
    <figure>
      <blockquote className="relative text-[clamp(1.375rem,2.6vw,2.125rem)] leading-[1.35] font-normal tracking-tight">
        {animate ? (
          <>
            <span className="sr-only">{testimonial.quote}</span>
            <motion.span
              aria-hidden
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.022, delayChildren: 0.05 } } }}
            >
              {words.map((w, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
                    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: easeOutExpo } },
                  }}
                >
                  {w}
                  {i < words.length - 1 && " "}
                </motion.span>
              ))}
            </motion.span>
          </>
        ) : (
          testimonial.quote
        )}
      </blockquote>
      <motion.figcaption
        initial={animate ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: animate ? 0.35 : 0, ease: easeOutExpo }}
        className="mt-8 flex items-center gap-4"
      >
        <Avatar testimonial={testimonial} active size="lg" />
        <span>
          <span className="block text-base font-medium">{testimonial.name}</span>
          {testimonial.role && <span className="block text-sm text-muted-foreground">{testimonial.role}</span>}
        </span>
      </motion.figcaption>
    </figure>
  );
}

/** WordPress photo when set, otherwise initials on a soft brand gradient. */
function Avatar({ testimonial, active, size = "md" }: { testimonial: Testimonial; active: boolean; size?: "md" | "lg" }) {
  const px = size === "lg" ? 52 : 40;
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full font-mono text-xs transition-all duration-500",
        size === "lg" ? "size-13" : "size-10",
        active
          ? "bg-linear-to-br from-brand to-brand/60 text-white ring-2 ring-brand/30 ring-offset-2 ring-offset-background"
          : "bg-muted text-muted-foreground"
      )}
    >
      {testimonial.image ? (
        <Image
          src={testimonial.image.url}
          alt={testimonial.image.alt || testimonial.name}
          width={px}
          height={px}
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden>{initials(testimonial.name)}</span>
      )}
    </span>
  );
}

function ProgressLine({ progress }: { progress: MotionValue<number> }) {
  return (
    <span aria-hidden className="relative h-px flex-1 overflow-hidden bg-border">
      <motion.span style={{ scaleX: progress }} className="absolute inset-0 origin-left bg-brand" />
    </span>
  );
}

function ControlButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="group grid size-10 place-items-center rounded-full border border-border text-foreground transition-colors duration-300 hover:border-brand hover:bg-brand hover:text-white focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:outline-none"
    >
      {children}
    </button>
  );
}
