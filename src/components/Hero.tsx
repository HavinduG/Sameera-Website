"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";
import type { StatItem, WPImage } from "@/lib/wordpress";
import { CountUp } from "@/components/motion/count-up";
import { easeOutExpo } from "@/components/motion/ease";
import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/motion/marquee";
import { RoleRotator } from "@/components/motion/role-rotator";
import { SplitText } from "@/components/motion/split-text";
import { TiltCard } from "@/components/motion/tilt-card";

type Cta = { text: string; url: string };

type HeroProps = {
  name: string;
  roles: string[];
  description: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  education: string;
  heroImage: WPImage | null;
  /** The first two stats are shown as floating badges next to the portrait. */
  stats?: StatItem[];
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, delay, ease: easeOutExpo },
  }),
};

// Split on commas that are not inside parentheses.
const splitCredentials = (text: string) =>
  text
    .split(/,(?![^()]*\))/)
    .map((s) => s.trim())
    .filter(Boolean);

export function Hero({
  name,
  roles,
  description,
  primaryCta,
  secondaryCta,
  education,
  heroImage,
  stats = [],
}: HeroProps) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.join(" ");
  const credentials = splitCredentials(education);
  const badges = stats.slice(0, 2);

  // Cursor spotlight that follows the pointer across the section.
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${mx}px ${my}px, var(--brand-soft), transparent 70%)`;
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  // Scroll-linked parallax for the portrait and a gentle fade of the copy.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 140]);
  const imageScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.12]);
  const copyY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -60]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      className="relative isolate flex min-h-[calc(100svh-6rem)] w-full flex-col overflow-hidden"
    >
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0" />
        <div className="animate-aurora absolute -top-1/3 -left-[10%] size-[40rem] rounded-full bg-brand/20 blur-[120px]" />
        <div className="animate-aurora absolute top-1/4 -right-[15%] size-[34rem] rounded-full bg-brand/15 blur-[120px] [animation-delay:-6s]" />
        <div className="animate-aurora absolute -bottom-1/4 left-1/3 size-[26rem] rounded-full bg-foreground/10 blur-[100px] [animation-delay:-12s]" />
        <motion.div className="absolute inset-0" style={{ background: spotlight }} />
        <div className="noise absolute inset-0" />
      </div>

      <div className="mx-auto grid w-full max-w-[1200px] flex-1 items-center gap-14 px-6 py-10 md:px-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:px-20 lg:py-6">
        {/* Copy */}
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="relative z-10 max-w-[620px]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-background/60 py-1.5 pr-4 pl-2.5 backdrop-blur-md"
          >
            <span className="animate-pulse-dot size-2 rounded-full bg-brand" />
            <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase md:text-[11px]">
              Full Stack Digital Marketer
            </span>
          </motion.div>

          <h1 className="text-[clamp(3rem,8vw,5.25rem)] leading-[1.02] font-normal tracking-tight">
            <SplitText
              text="Hey,"
              className="mb-1 block text-[0.55em] font-light text-muted-foreground"
              delay={0.1}
            />
            <SplitText text={`I'm ${first}`} className="block" delay={0.2} />
            {last && (
              <SplitText
                text={last}
                className="block"
                wordClassName="text-gradient-brand pr-[0.05em]"
                delay={0.35}
              />
            )}
          </h1>

          {roles.length > 0 && (
            <motion.p
              variants={fadeUp}
              custom={0.6}
              initial="hidden"
              animate="visible"
              className="mt-6 flex items-center gap-3 text-2xl font-medium md:text-3xl"
            >
              <span aria-hidden className="h-px w-8 bg-foreground/30" />
              <RoleRotator roles={roles} />
            </motion.p>
          )}

          {description && (
            <motion.p
              variants={fadeUp}
              custom={0.75}
              initial="hidden"
              animate="visible"
              className="mt-7 max-w-[520px] text-sm leading-relaxed text-muted-foreground md:text-[15px]"
            >
              {description}
            </motion.p>
          )}

          <motion.div
            variants={fadeUp}
            custom={0.9}
            initial="hidden"
            animate="visible"
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            {primaryCta.text && (
              <Magnetic>
                <Link
                  href={primaryCta.url}
                  className="group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-foreground px-7 text-sm font-medium text-background shadow-[0_10px_40px_-10px_var(--brand)] transition-shadow duration-500 hover:shadow-[0_14px_50px_-8px_var(--brand)] sm:w-auto"
                >
                  <span
                    aria-hidden
                    className="animate-shine absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/30 to-transparent"
                  />
                  <span className="relative">{primaryCta.text}</span>
                  <span className="relative grid size-6 place-items-center overflow-hidden rounded-full bg-brand text-white">
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-5" />
                    <ArrowRight className="absolute size-3.5 -translate-x-5 transition-transform duration-300 group-hover:translate-x-0" />
                  </span>
                </Link>
              </Magnetic>
            )}
            {secondaryCta.text && (
              <Magnetic>
                <Link
                  href={secondaryCta.url}
                  className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-background/50 px-7 text-sm font-medium backdrop-blur-md transition-colors duration-300 hover:border-brand/50 hover:bg-background/80 sm:w-auto"
                >
                  {secondaryCta.text}
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
                </Link>
              </Magnetic>
            )}
          </motion.div>
        </motion.div>

        {/* Portrait */}
        <motion.div style={{ y: imageY }} className="relative mx-auto w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[440px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.25, ease: easeOutExpo }}
          >
            <TiltCard max={7} className="aspect-[4/5] rounded-[2rem]">
              {/* Glow + rotating border */}
              <div aria-hidden className="absolute -inset-6 -z-10 rounded-[3rem] bg-brand/25 blur-3xl" />
              <div aria-hidden className="conic-border animate-border-spin absolute -inset-[1.5px] rounded-[calc(2rem+1.5px)]" />

              <motion.div
                initial={{ clipPath: "inset(100% 0% 0% 0% round 2rem)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0% round 2rem)" }}
                transition={{ duration: 1.4, delay: 0.35, ease: easeOutExpo }}
                className="absolute inset-0 overflow-hidden rounded-[2rem] bg-muted"
              >
                {heroImage ? (
                  <motion.div style={{ scale: imageScale }} className="absolute inset-0">
                    <Image
                      src={heroImage.url}
                      alt={heroImage.alt || name}
                      fill
                      preload
                      sizes="(max-width: 640px) 340px, (max-width: 1024px) 400px, 440px"
                      className="object-cover grayscale transition-[filter] duration-1000 group-hover/tilt:grayscale-0"
                    />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
                    {name}
                  </div>
                )}
                <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/tilt:opacity-100"
                  style={{
                    background:
                      "radial-gradient(420px circle at var(--mx) var(--my), rgb(255 255 255 / 0.18), transparent 60%)",
                  }}
                />
              </motion.div>

              {badges.map((stat, i) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 + i * 0.15, ease: easeOutExpo }}
                  style={{ z: 50 }}
                  className={cn(
                    "absolute z-10",
                    i === 0 ? "top-[12%] -left-2 sm:-left-10" : "-right-2 bottom-[12%] sm:-right-10"
                  )}
                >
                  <motion.div
                    animate={reduce ? undefined : { y: [0, -8, 0] }}
                    transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
                    className="rounded-2xl border border-border/60 bg-background/75 px-4 py-3 shadow-xl backdrop-blur-xl"
                  >
                    <p className="flex items-baseline gap-1 text-xl font-medium tracking-tight">
                      {stat.prefix && <span className="text-[11px] text-muted-foreground">{stat.prefix}</span>}
                      <CountUp value={stat.value} delay={1.3 + i * 0.15} />
                      {stat.suffix && <span className="text-sm text-brand">{stat.suffix}</span>}
                    </p>
                    <p className="mt-0.5 text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                      {stat.title}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </TiltCard>
          </motion.div>
        </motion.div>
      </div>

      {/* Credentials + scroll cue */}
      <motion.div
        variants={fadeUp}
        custom={1.1}
        initial="hidden"
        animate="visible"
        className="mx-auto flex w-full max-w-[1200px] items-center gap-6 px-6 pt-2 pb-6 md:px-12 lg:px-20"
      >
        <Marquee
          items={credentials}
          className="min-w-0 flex-1 border-t border-border/40 pt-4 font-mono text-[10px] tracking-wide text-muted-foreground md:text-xs"
        />
        <Link
          href="#highlights"
          aria-label="Scroll to results"
          className="hidden h-10 w-6 shrink-0 justify-center rounded-full border border-border pt-2 md:flex"
        >
          <span className="animate-scroll-cue block size-1.5 rounded-full bg-brand" />
        </Link>
      </motion.div>
    </section>
  );
}
