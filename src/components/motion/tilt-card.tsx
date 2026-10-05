"use client";

import * as React from "react";
import { motion, useReducedMotion, useSpring, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type TiltCardProps = HTMLMotionProps<"div"> & {
  /** Maximum tilt in degrees. */
  max?: number;
};

const spring = { stiffness: 160, damping: 18, mass: 0.5 };

/**
 * 3D pointer tilt. Also exposes the cursor position as `--mx` / `--my`
 * so children can draw a spotlight with `group-hover/tilt:`.
 */
export function TiltCard({ max = 8, className, style, children, ...props }: TiltCardProps) {
  const reduce = useReducedMotion();
  const rotateX = useSpring(0, spring);
  const rotateY = useSpring(0, spring);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    if (reduce || e.pointerType !== "mouse") return;
    rotateY.set((px - 0.5) * max * 2);
    rotateX.set(-(py - 0.5) * max * 2);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      {...props}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1000, ...style }}
      className={cn("group/tilt relative [--mx:50%] [--my:50%] [transform-style:preserve-3d]", className)}
    >
      {children}
    </motion.div>
  );
}
