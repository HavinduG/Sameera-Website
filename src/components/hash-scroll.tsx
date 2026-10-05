"use client";

import * as React from "react";

/**
 * Makes every in-page `#section` link scroll to its section on every click.
 *
 * Next's <Link> does nothing when the URL already has that hash (e.g. clicking "Expertise" a
 * second time after scrolling away). This captures those clicks first, scrolls to the target
 * (honouring each section's `scroll-margin-top` and reduced motion), and updates the URL.
 */
export function HashScroll() {
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as Element | null)?.closest?.("a[href^='#']");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;

      const hash = link.getAttribute("href") ?? "";
      const target = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      if (!target) return;

      e.preventDefault();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      if (location.hash !== hash) history.pushState(null, "", hash);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
