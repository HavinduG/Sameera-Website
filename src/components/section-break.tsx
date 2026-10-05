"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * Divider between sections. The hairline draws outward from the centre as it scrolls through
 * the viewport, a light glint runs along it, and the centre node turns with scroll.
 */
export function SectionBreak() {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 0.55"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const scaleX = useTransform(progress, [0, 1], reduce ? [1, 1] : [0, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], reduce ? [45, 45] : [-135, 45]);

  return (
    <div ref={ref} aria-hidden className="mx-auto w-full max-w-[1200px] px-6 py-6 md:px-12 lg:px-20">
      <div className="flex items-center gap-4">
        {/* Left line grows from the node outward */}
        <div className="relative h-px flex-1 overflow-hidden">
          <motion.div style={{ scaleX }} className="absolute inset-0 origin-right bg-linear-to-l from-foreground/30 to-foreground/5" />
          <div className="animate-glint absolute inset-y-0 w-1/4 bg-linear-to-r from-transparent via-brand to-transparent [animation-direction:reverse]" />
        </div>

        {/* Centre node */}
        <div className="relative grid size-6 place-items-center">
          <motion.span style={{ rotate }} className="absolute inset-0.5 rounded-[4px] border border-foreground/25" />
          <span className="animate-pulse-dot size-1.5 rounded-full bg-brand" />
        </div>

        {/* Right line */}
        <div className="relative h-px flex-1 overflow-hidden">
          <motion.div style={{ scaleX }} className="absolute inset-0 origin-left bg-linear-to-r from-foreground/30 to-foreground/5" />
          <div className="animate-glint absolute inset-y-0 w-1/4 bg-linear-to-r from-transparent via-brand to-transparent" />
        </div>
      </div>
    </div>
  );
}
