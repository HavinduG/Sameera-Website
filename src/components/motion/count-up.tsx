"use client";

import * as React from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "./ease";

type Parsed = {
  num: number;
  decimals: number;
  grouping: boolean;
  before: string;
  after: string;
};

// Pull the number out of WordPress strings like "4.5", "5,364+" or "15.73".
function parse(value: string): Parsed | null {
  const match = value.match(/\d[\d,]*(?:\.\d+)?/);
  if (!match || match.index === undefined) return null;
  const raw = match[0];
  const num = Number.parseFloat(raw.replace(/,/g, ""));
  if (!Number.isFinite(num)) return null;
  return {
    num,
    decimals: raw.includes(".") ? raw.split(".")[1].length : 0,
    grouping: raw.includes(","),
    before: value.slice(0, match.index),
    after: value.slice(match.index + raw.length),
  };
}

function format(p: Parsed, n: number) {
  return (
    p.before +
    n.toLocaleString("en-US", {
      minimumFractionDigits: p.decimals,
      maximumFractionDigits: p.decimals,
      useGrouping: p.grouping,
    }) +
    p.after
  );
}

type CountUpProps = {
  value: string;
  className?: string;
  duration?: number;
  delay?: number;
};

/** Animates from 0 to the numeric part of `value` once it scrolls into view. */
export function CountUp({ value, className, duration = 2, delay = 0 }: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const parsed = React.useMemo(() => parse(value), [value]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || !parsed || !inView) return;
    if (reduce) {
      el.textContent = value;
      return;
    }
    const controls = animate(0, parsed.num, {
      duration,
      delay,
      ease: easeOutExpo,
      onUpdate: (n) => {
        el.textContent = format(parsed, n);
      },
      onComplete: () => {
        el.textContent = value;
      },
    });
    return () => controls.stop();
  }, [inView, parsed, value, reduce, duration, delay]);

  if (!parsed) return <span className={className}>{value}</span>;

  return (
    <span className={cn("tabular-nums", className)}>
      <span className="sr-only">{value}</span>
      <span ref={ref} aria-hidden>
        {format(parsed, 0)}
      </span>
    </span>
  );
}
