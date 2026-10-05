import * as React from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  items: string[];
  className?: string;
  /** Seconds for one full loop. */
  duration?: number;
};

/** Infinite CSS marquee with faded edges. Pauses on hover; wraps when motion is reduced. */
export function Marquee({ items, className, duration = 40 }: MarqueeProps) {
  if (items.length === 0) return null;

  const row = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className={cn(
        "flex shrink-0 items-center gap-8 pr-8 motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:gap-y-2",
        hidden && "motion-reduce:hidden"
      )}
    >
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-8 whitespace-nowrap">
          {item}
          <span className="size-1 rounded-full bg-brand" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className={cn("group flex overflow-hidden mask-fade-x motion-reduce:[mask-image:none]", className)}>
      <div
        className="animate-marquee flex w-max group-hover:[animation-play-state:paused] motion-reduce:w-full"
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
