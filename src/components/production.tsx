"use client";

import * as React from "react";
import Image from "next/image";
import { Camera, Clapperboard, Maximize2, Smartphone, Tv, Video } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ProductionContent, ProductionImage } from "@/lib/wordpress";
import { easeOutExpo } from "@/components/motion/ease";
import { SplitText } from "@/components/motion/split-text";
import { Lightbox, type Zoomed } from "@/components/lightbox";

type ProductionProps = {
  production: ProductionContent;
  /** Eyebrow from the WordPress nav when a "Production" menu item exists. */
  label?: string;
  index?: number;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: easeOutExpo } },
};

const inView = { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "0px 0px -12% 0px" } } as const;

// Pick an icon from the capability wording so new bullets in WordPress get a sensible one.
function CapabilityIcon({ text, className }: { text: string; className?: string }) {
  const t = text.toLowerCase();
  if (/photo/.test(t)) return <Camera className={className} />;
  if (/interview|panel|multi-camera/.test(t)) return <Video className={className} />;
  if (/broadcast|floor|segment|event/.test(t)) return <Tv className={className} />;
  if (/ugc|social|product|reel/.test(t)) return <Smartphone className={className} />;
  return <Clapperboard className={className} />;
}

const imageAlt = (img: ProductionImage, fallback: string) => img.alt || img.caption || fallback;

export function Production({ production, label, index }: ProductionProps) {
  const { title, eyebrow, paragraphs, capabilities, images } = production;
  const [zoomed, setZoomed] = React.useState<Zoomed>(null);
  const close = React.useCallback(() => setZoomed(null), []);
  const open = (img: ProductionImage) => setZoomed({ src: img.url, alt: imageAlt(img, title) });
  const heading = label ?? eyebrow;

  return (
    <section id="production" className="relative w-full scroll-mt-24 pt-16 pb-24 md:pt-20 md:pb-32">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12 lg:px-20">
        {/* Section header — same pattern as About / Expertise / Results */}
        <header className="mb-14 md:mb-20">
          {heading && (
            <motion.p
              variants={fadeUp}
              {...inView}
              className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase"
            >
              {index !== undefined && (
                <span className="font-mono tracking-normal text-brand">{String(index).padStart(2, "0")}</span>
              )}
              <span aria-hidden className="h-px w-8 bg-foreground/25" />
              {heading}
            </motion.p>
          )}
          {title && (
            <h2 className="max-w-4xl text-[clamp(2.125rem,4.5vw,3.5rem)] leading-[1.08] font-normal tracking-tight">
              <SplitText text={title} inView stagger={0.05} />
            </h2>
          )}
        </header>

        <div className={cn("grid gap-14 lg:gap-20", images.length > 0 && "lg:grid-cols-[1fr_1.1fr] lg:items-start")}>
          {/* Copy */}
          <div>
            {paragraphs.map((html, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                {...inView}
                className="max-w-xl text-[15px] leading-[1.8] text-muted-foreground md:text-base [&_a]:text-brand [&_a]:underline [&_b]:font-medium [&_b]:text-foreground [&_strong]:font-medium [&_strong]:text-foreground [&+&]:mt-5"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ))}

            {capabilities.length > 0 && (
              <motion.ul
                {...inView}
                variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
                className={cn("divide-y divide-border border-y border-border", paragraphs.length > 0 && "mt-10")}
              >
                {capabilities.map((cap, i) => (
                  <motion.li key={`${cap}-${i}`} variants={fadeUp} className="group flex items-center gap-4 py-4">
                    <span className="font-mono text-xs text-muted-foreground transition-colors duration-300 group-hover:text-brand">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <CapabilityIcon
                      text={cap}
                      className="size-4 shrink-0 text-muted-foreground transition-colors duration-300 group-hover:text-brand"
                    />
                    <span className="text-[15px] leading-snug transition-transform duration-500 ease-out group-hover:translate-x-1">
                      {cap}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>

          {/* Images */}
          {images.length > 0 && <Collage images={images} title={title} onOpen={open} />}
        </div>
      </div>

      <Lightbox image={zoomed} onClose={close} />
    </section>
  );
}

function Collage({
  images,
  title,
  onOpen,
}: {
  images: ProductionImage[];
  title: string;
  onOpen: (img: ProductionImage) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const mainScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.15, 1]);
  const secondY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [50, -50]);
  const [main, second, ...rest] = images;

  return (
    <div ref={ref}>
      <div className={cn("relative", second && "pb-14 sm:pb-20")}>
        <motion.div
          initial={{ clipPath: "inset(10% 10% 10% 10% round 1.5rem)", opacity: 0 }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0% round 1.5rem)", opacity: 1 }}
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          transition={{ duration: 1.3, ease: easeOutExpo }}
          className={cn(second && "sm:ml-[14%]")}
        >
          <ImageButton image={main} title={title} onOpen={onOpen} className="aspect-[4/3] rounded-3xl">
            <motion.div style={{ scale: mainScale }} className="absolute inset-0">
              <Image
                src={main.url}
                alt={imageAlt(main, title)}
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
              />
            </motion.div>
          </ImageButton>
        </motion.div>

        {second && (
          <motion.div
            style={{ y: secondY }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 1.1, delay: 0.25, ease: easeOutExpo }}
            className="absolute bottom-0 left-0 z-10 w-[50%] sm:w-[44%]"
          >
            <ImageButton
              image={second}
              title={title}
              onOpen={onOpen}
              className="aspect-[4/3] rounded-2xl border-4 border-background shadow-[0_24px_50px_-24px_rgb(0_0_0/0.45)]"
            >
              <Image
                src={second.url}
                alt={imageAlt(second, title)}
                fill
                sizes="(max-width: 1024px) 50vw, 260px"
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.06]"
              />
            </ImageButton>
          </motion.div>
        )}
      </div>

      {/* Any further images: a simple row of thumbnails */}
      {rest.length > 0 && (
        <motion.ul
          {...inView}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="mt-6 grid grid-cols-3 gap-3"
        >
          {rest.map((img, i) => (
            <motion.li key={`${img.url}-${i}`} variants={fadeUp}>
              <ImageButton image={img} title={title} onOpen={onOpen} className="aspect-[4/3] rounded-xl">
                <Image
                  src={img.url}
                  alt={imageAlt(img, title)}
                  fill
                  sizes="180px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
              </ImageButton>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}

function ImageButton({
  image,
  title,
  onOpen,
  className,
  children,
}: {
  image: ProductionImage;
  title: string;
  onOpen: (img: ProductionImage) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(image)}
      aria-label={`Open “${imageAlt(image, title)}” full size`}
      className={cn("group relative block w-full cursor-zoom-in overflow-hidden bg-muted", className)}
    >
      {children}
      <span aria-hidden className="absolute inset-0 rounded-[inherit] ring-1 ring-foreground/10 ring-inset" />
      <span className="absolute right-3 bottom-3 grid size-8 place-items-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
        <Maximize2 className="size-3.5" />
      </span>
    </button>
  );
}
