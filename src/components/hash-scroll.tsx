"use client";

import * as React from "react";

/** How far (px) a section may sit from its resting spot before we nudge it into place. */
const TOLERANCE = 4;
const MAX_CORRECTIONS = 3;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Distance between the target's top and where `scroll-margin-top` says it should rest. */
function offsetFromRest(target: HTMLElement) {
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  return target.getBoundingClientRect().top - margin;
}

/** Resolves once the page has stopped scrolling (uses `scrollend` where supported). */
function waitForScrollEnd(signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    let idle: ReturnType<typeof setTimeout>;
    const done = () => {
      clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", done);
      resolve();
    };
    // Fallback for browsers without `scrollend`: no scroll events for 150ms.
    const onScroll = () => {
      clearTimeout(idle);
      idle = setTimeout(done, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", done, { once: true });
    signal.addEventListener("abort", done, { once: true });
    idle = setTimeout(done, 150);
  });
}

/**
 * Makes every in-page `#section` link scroll to its section on every click, and land exactly.
 *
 * - Next's <Link> does nothing when the URL already has that hash (e.g. clicking "Expertise" a
 *   second time after scrolling away), so clicks are captured here first.
 * - Images and logos above the target can finish loading during a long smooth scroll and push
 *   the section down, so after the scroll settles we check the position and finish the job.
 *   Any manual scroll input (wheel, touch, keys) cancels the correction.
 */
export function HashScroll() {
  React.useEffect(() => {
    let controller: AbortController | null = null;

    const scrollToTarget = async (target: HTMLElement) => {
      controller?.abort();
      const current = new AbortController();
      controller = current;
      const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";

      const cancel = () => current.abort();
      const userInput = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
      userInput.forEach((type) => window.addEventListener(type, cancel, { passive: true, once: true }));

      try {
        target.scrollIntoView({ behavior, block: "start" });
        for (let i = 0; i < MAX_CORRECTIONS; i++) {
          await waitForScrollEnd(current.signal);
          if (current.signal.aborted || Math.abs(offsetFromRest(target)) <= TOLERANCE) break;
          target.scrollIntoView({ behavior, block: "start" });
        }
      } finally {
        userInput.forEach((type) => window.removeEventListener(type, cancel));
        if (controller === current) controller = null;
      }
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as Element | null)?.closest?.("a[href^='#']");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;

      const hash = link.getAttribute("href") ?? "";
      const target = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      if (!target) return;

      e.preventDefault();
      if (location.hash !== hash) history.pushState(null, "", hash);
      // Let the click finish (e.g. the mobile menu closing and unlocking scroll) before scrolling.
      requestAnimationFrame(() => void scrollToTarget(target));
    };

    // Arriving with a hash (e.g. "/#results" from a case page): the browser jumps before images
    // load, so settle on the section once the page has finished loading.
    const settleInitialHash = () => {
      const target = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
      if (target && Math.abs(offsetFromRest(target)) > TOLERANCE) void scrollToTarget(target);
    };
    if (document.readyState === "complete") settleInitialHash();
    else window.addEventListener("load", settleInitialHash, { once: true });

    document.addEventListener("click", onClick, true);
    return () => {
      controller?.abort();
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("load", settleInitialHash);
    };
  }, []);

  return null;
}
