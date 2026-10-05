"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "./ease";

type RoleRotatorProps = {
  roles: string[];
  interval?: number;
  className?: string;
};

/** Cycles through roles with a per-character 3D flip and a drawn underline. */
export function RoleRotator({ roles, interval = 2800, className }: RoleRotatorProps) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (roles.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % roles.length), interval);
    return () => clearInterval(id);
  }, [roles.length, interval]);

  if (roles.length === 0) return null;
  const role = roles[index % roles.length];

  return (
    <motion.span
      layout
      transition={{ layout: { duration: 0.5, ease: easeOutExpo } }}
      className={cn("relative inline-flex overflow-hidden pb-1.5 align-bottom [perspective:600px]", className)}
    >
      <span className="sr-only">{roles.join(", ")}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={index} aria-hidden className="inline-flex whitespace-nowrap">
          {Array.from(role).map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block origin-bottom"
              initial={{ y: "100%", opacity: 0, rotateX: -80 }}
              animate={{ y: "0%", opacity: 1, rotateX: 0 }}
              exit={{ y: "-100%", opacity: 0, rotateX: 80 }}
              transition={{ duration: 0.55, delay: i * 0.018, ease: easeOutExpo }}
            >
              {ch === " " ? " " : ch}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
      <motion.span
        key={`line-${index}`}
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left rounded-full bg-brand"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: easeOutExpo }}
      />
    </motion.span>
  );
}
