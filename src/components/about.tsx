"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import type { AboutBlock, AboutContent } from "@/lib/wordpress";
import { easeOutExpo } from "@/components/motion/ease";
import { SplitText } from "@/components/motion/split-text";

type AboutProps = {
  about: AboutContent;
  /** Used as image alt text when WordPress has none. */
  name: string;
  /** Eyebrow text, taken from the matching WordPress nav item. */
  label?: string;
  /** Position of the section in the nav (1-based), shown as "02". */
  index?: number;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: easeOutExpo } },
};

const inView = { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "0px 0px -12% 0px" } } as const;

export function About({ about, name, label = "About", index }: AboutProps) {
  const { title, blocks, image, outcomesTitle, outcomesIntro, outcomes } = about;

  return (
    <section id="about" className="relative w-full scroll-mt-24 pt-16 pb-24 md:pt-20 md:pb-32">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12 lg:px-20">
        {/* Section header */}
        <header className="mb-14 md:mb-20">
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
            <h2 className="max-w-4xl text-[clamp(2.125rem,4.5vw,3.5rem)] leading-[1.08] font-normal tracking-tight">
              <SplitText text={title} inView stagger={0.05} />
            </h2>
          )}
        </header>

        <div className={image ? "grid items-start gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20" : "max-w-3xl"}>
          {image && <AboutImage image={image} name={name} />}

          <div className="space-y-6">
            {blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        </div>

        {outcomes.length > 0 && (
          <div className="mt-24 md:mt-32">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              {outcomesTitle && (
                <h3 className="max-w-xl text-3xl leading-tight font-normal tracking-tight md:text-4xl">
                  <SplitText text={outcomesTitle} inView />
                </h3>
              )}
              {outcomesIntro && (
                <motion.p variants={fadeUp} {...inView} className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {outcomesIntro}
                </motion.p>
              )}
            </div>

            <motion.ol
              {...inView}
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              style={{ "--cols": Math.min(outcomes.length, 5) } as React.CSSProperties}
              className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
            >
              {outcomes.map((outcome, i) => (
                <motion.li key={`${outcome}-${i}`} variants={fadeUp}>
                  <OutcomeCard index={i} text={outcome} />
                </motion.li>
              ))}
            </motion.ol>
          </div>
        )}
      </div>
    </section>
  );
}

function AboutImage({ image, name }: { image: NonNullable<AboutContent["image"]>; name: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.18, 1]);
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);

  return (
    <div className="lg:sticky lg:top-32">
      <motion.div
        ref={ref}
        initial={{ clipPath: "inset(12% 12% 12% 12% round 1.5rem)", opacity: 0 }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0% round 1.5rem)", opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 1.3, ease: easeOutExpo }}
        className="group relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-3xl bg-muted"
      >
        <motion.div style={{ scale, y }} className="absolute inset-0">
          <Image
            src={image.url}
            alt={image.alt || name}
            fill
            sizes="(max-width: 1024px) 420px, 400px"
            className="object-cover grayscale transition-[filter] duration-1000 group-hover:grayscale-0"
          />
        </motion.div>
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
        <div aria-hidden className="absolute inset-0 rounded-3xl ring-1 ring-foreground/10 ring-inset" />
      </motion.div>
    </div>
  );
}

function Block({ block }: { block: AboutBlock }) {
  if (block.type === "quote") return <PullQuote text={block.text} />;

  if (block.type === "list") {
    return (
      <motion.ul variants={fadeUp} {...inView} className="space-y-2 text-[15px] leading-relaxed text-muted-foreground">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand" />
            <span dangerouslySetInnerHTML={{ __html: item }} />
          </li>
        ))}
      </motion.ul>
    );
  }

  return (
    <motion.p
      variants={fadeUp}
      {...inView}
      className="max-w-[60ch] text-[15px] leading-[1.8] text-muted-foreground md:text-base [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-4 [&_b]:font-medium [&_b]:text-foreground [&_strong]:font-medium [&_strong]:text-foreground"
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
}

/** Quote whose words light up one by one as it scrolls through the viewport. */
function PullQuote({ text }: { text: string }) {
  const ref = React.useRef<HTMLQuoteElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.5"] });
  const words = text.split(/\s+/);

  return (
    <motion.blockquote
      ref={ref}
      variants={fadeUp}
      {...inView}
      className="relative my-12 border-l-2 border-brand py-2 pl-6 md:pl-8"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-8 left-4 font-serif text-8xl leading-none text-brand/15 select-none md:left-6"
      >
        &ldquo;
      </span>
      <p className="relative text-2xl leading-snug font-normal tracking-tight md:text-[2rem]">
        <span className="sr-only">{text}</span>
        <span aria-hidden>
          {words.map((word, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} still={!!reduce}>
              {word}
            </Word>
          ))}
        </span>
      </p>
    </motion.blockquote>
  );
}

function Word({
  children,
  progress,
  range,
  still,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  still: boolean;
}) {
  const opacity = useTransform(progress, range, still ? [1, 1] : [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {children}{" "}
    </motion.span>
  );
}

function OutcomeCard({ index, text }: { index: number; text: string }) {
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      onPointerMove={onPointerMove}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-[0_20px_50px_-24px_var(--brand)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(240px circle at var(--mx) var(--my), var(--brand-soft), transparent 70%)" }}
      />
      <div className="relative flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground transition-colors duration-500 group-hover:text-brand">
          {String(index + 1).padStart(2, "0")}
        </span>
        <ArrowUpRight className="size-4 -translate-x-1 translate-y-1 text-brand opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
      </div>
      <p className="relative mt-3 text-[15px] leading-snug font-medium tracking-tight">{text}</p>
    </div>
  );
}
