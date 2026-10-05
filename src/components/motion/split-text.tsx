"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "./ease";

type SplitTextProps = {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  /** Reveal when scrolled into view instead of on mount. */
  inView?: boolean;
};

const word: Variants = {
  hidden: { y: "110%", rotate: 4 },
  visible: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: easeOutExpo } },
};

/** Masked word-by-word reveal. The plain text stays available to screen readers. */
export function SplitText({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.06,
  inView = false,
}: SplitTextProps) {
  const words = text.split(/\s+/).filter(Boolean);
  const trigger = inView
    ? { whileInView: "visible", viewport: { once: true, margin: "0px 0px -10% 0px" } }
    : { animate: "visible" };

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        initial="hidden"
        {...trigger}
        variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      >
        {words.map((w, i) => (
          <span key={`${w}-${i}`}>
            <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
              <motion.span variants={word} className={cn("inline-block origin-bottom-left", wordClassName)}>
                {w}
              </motion.span>
            </span>
            {i < words.length - 1 && " "}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
