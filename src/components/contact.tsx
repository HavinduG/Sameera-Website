"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CalendarDays, Check, Copy, Link2, Mail, MessageCircle, Phone } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ContactContent, ContactKind, ContactLink } from "@/lib/wordpress";
import { easeOutExpo } from "@/components/motion/ease";
import { Magnetic } from "@/components/motion/magnetic";
import { SplitText } from "@/components/motion/split-text";

type ContactProps = {
  contact: ContactContent;
  /** Used as image alt text when WordPress has none. */
  name: string;
  /** Eyebrow text, taken from the matching WordPress nav item. */
  label?: string;
  /** Position of the section in the nav (1-based), shown as "08". */
  index?: number;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: easeOutExpo } },
};

const inView = { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "0px 0px -12% 0px" } } as const;

/** lucide v1 dropped brand icons, so LinkedIn is drawn inline. */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

function KindIcon({ kind, className }: { kind: ContactKind; className?: string }) {
  switch (kind) {
    case "whatsapp":
      return <MessageCircle className={className} />;
    case "email":
      return <Mail className={className} />;
    case "phone":
      return <Phone className={className} />;
    case "linkedin":
      return <LinkedInIcon className={className} />;
    case "booking":
      return <CalendarDays className={className} />;
    default:
      return <Link2 className={className} />;
  }
}

const linkProps = (link: ContactLink) =>
  link.external ? { target: "_blank", rel: "noopener noreferrer" } : {};

export function Contact({ contact, name, label = "Contact", index }: ContactProps) {
  const { title, description, image, buttons, details } = contact;

  return (
    <section id="contact" className="relative isolate w-full scroll-mt-24 overflow-hidden pt-16 pb-24 md:pt-20 md:pb-32">
      {/* Soft brand glow behind the section */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-aurora absolute top-1/4 -right-1/4 size-[34rem] rounded-full bg-brand/10 blur-[130px]" />
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12 lg:px-20">
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

        <div className={cn("grid gap-14 lg:gap-20", image && "lg:grid-cols-[0.8fr_1.2fr] lg:items-center")}>
          {image && <ContactImage image={image} name={name} />}

          <div>
            {title && (
              <h2 className="text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02] font-normal tracking-tight">
                <SplitText text={title} inView stagger={0.06} />
              </h2>
            )}
            {description && (
              <motion.p
                variants={fadeUp}
                {...inView}
                className="mt-7 max-w-xl text-[15px] leading-[1.8] text-muted-foreground md:text-base"
              >
                {description}
              </motion.p>
            )}

            {buttons.length > 0 && (
              <motion.div
                {...inView}
                variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
                className="mt-9 flex flex-wrap gap-3"
              >
                {buttons.map((button, i) => (
                  <motion.div key={`${button.label}-${i}`} variants={fadeUp}>
                    <Magnetic strength={0.2}>
                      <ContactButton link={button} primary={i === 0} />
                    </Magnetic>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {details.length > 0 && (
              <motion.ul
                {...inView}
                variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
                className="mt-12 divide-y divide-border border-y border-border"
              >
                {details.map((detail, i) => (
                  <motion.li key={`${detail.label}-${i}`} variants={fadeUp}>
                    <DetailRow detail={detail} />
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactImage({ image, name }: { image: NonNullable<ContactContent["image"]>; name: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.15, 1]);

  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: "inset(12% 12% 12% 12% round 1.5rem)", opacity: 0 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 1.5rem)", opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 1.3, ease: easeOutExpo }}
      className="relative mx-auto aspect-[4/5] w-full max-w-[400px] overflow-hidden rounded-3xl bg-muted"
    >
      <motion.div style={{ scale }} className="absolute inset-0">
        <Image src={image.url} alt={image.alt || name} fill sizes="(max-width: 1024px) 400px, 380px" className="object-cover" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
      {/* Availability chip */}
      <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-background/85 px-3.5 py-1.5 text-xs font-medium backdrop-blur-md">
        <span className="relative flex size-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/70 motion-reduce:hidden" />
          <span className="relative size-2 rounded-full bg-emerald-500" />
        </span>
        Available for projects
      </span>
      <span aria-hidden className="absolute inset-0 rounded-3xl ring-1 ring-foreground/10 ring-inset" />
    </motion.div>
  );
}

function ContactButton({ link, primary }: { link: ContactLink; primary: boolean }) {
  return (
    <Link
      href={link.href}
      {...linkProps(link)}
      className={cn(
        "group relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-full px-6 text-sm font-medium transition-[background-color,border-color,box-shadow,color] duration-300",
        primary
          ? "bg-foreground text-background shadow-[0_10px_40px_-12px_var(--brand)] hover:shadow-[0_14px_50px_-10px_var(--brand)]"
          : "border border-border bg-background/60 backdrop-blur-md hover:border-brand/50"
      )}
    >
      {primary && (
        <span
          aria-hidden
          className="animate-shine absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/30 to-transparent"
        />
      )}
      <KindIcon kind={link.kind} className={cn("relative size-4", !primary && "transition-colors duration-300 group-hover:text-brand")} />
      <span className="relative">{link.label}</span>
      <ArrowUpRight className="relative size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}

function DetailRow({ detail }: { detail: ContactLink }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(detail.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable (e.g. insecure context); the link still works */
    }
  };

  const content = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-white">
        {detail.image ? (
          <Image src={detail.image.url} alt="" width={20} height={20} className="size-5 object-contain" />
        ) : (
          <KindIcon kind={detail.kind} className="size-4" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{detail.label}</span>
        <span className="block truncate text-base transition-transform duration-500 ease-out group-hover:translate-x-1 md:text-lg">
          {detail.value}
        </span>
      </span>
    </>
  );

  return (
    <div className="flex items-center gap-2">
      {detail.href ? (
        <Link href={detail.href} {...linkProps(detail)} className="group flex min-w-0 flex-1 items-center gap-4 py-4">
          {content}
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
        </Link>
      ) : (
        <div className="group flex min-w-0 flex-1 items-center gap-4 py-4">{content}</div>
      )}

      {detail.value && (
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? `${detail.label} copied` : `Copy ${detail.label}`}
          className="relative grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors duration-300 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:outline-none"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? "done" : "copy"}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            </motion.span>
          </AnimatePresence>
          <span aria-live="polite" className="sr-only">
            {copied ? "Copied" : ""}
          </span>
        </button>
      )}
    </div>
  );
}
