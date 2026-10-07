"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/wordpress";
import { Magnetic } from "@/components/motion/magnetic";
import { ThemeToggle } from "./theme-toggle";

type NavbarProps = {
  name: string;
  navItems: NavItem[];
  buttonText: string;
  buttonUrl: string;
  /** Forces the active link (e.g. "/#results" on a result detail page) instead of tracking scroll. */
  activeUrl?: string;
  /** Where the logo links to: the #home section on the home page, "/" elsewhere. */
  homeHref?: string;
};

/**
 * Returns the `#hash` nav URL of the section currently being read: the last section whose top
 * has passed 40% of the viewport. Defaults to `#home` (or the first link), so Home is active
 * on load, through the hero and revenue cards, and in the gaps between sections.
 */
function useActiveSection(navItems: NavItem[]) {
  const hashes = navItems.map((i) => i.url).filter((u) => u.startsWith("#") && u.length > 1);
  const fallback = hashes.includes("#home") ? "#home" : (hashes[0] ?? null);
  const [active, setActive] = React.useState<string | null>(fallback);
  const key = hashes.join("|");

  React.useEffect(() => {
    const sections = key
      .split("|")
      .map((hash) => document.getElementById(decodeURIComponent(hash.slice(1))))
      .filter((el): el is HTMLElement => !!el)
      // Page order, not menu order.
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    if (!sections.length) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current: string | null = null;
      for (const el of sections) {
        const rect = el.getBoundingClientRect();
        // Last section whose top has passed the line; sections without a nav item (e.g. Production)
        // keep the previous one active instead of falling back to Home.
        if (rect.top <= line) current = `#${el.id}`;
      }
      setActive(current ?? fallback);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [key, fallback]);

  return active;
}

export function Navbar({ name, navItems, buttonText, buttonUrl, activeUrl, homeHref = "#home" }: NavbarProps) {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const [scrolled, setScrolled] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 20));
  const tracked = useActiveSection(navItems);
  const active = activeUrl ?? tracked;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const closeMenu = React.useCallback(() => setMenuOpen(false), []);
  const menuId = React.useId();

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b transition-[background-color,border-color,backdrop-filter] duration-500",
          menuOpen
            ? "border-border/60 bg-background"
            : scrolled
              ? "border-border/60 bg-background/70 backdrop-blur-xl"
              : "border-transparent bg-transparent"
        )}
      >
        <motion.div
          aria-hidden
          style={{ scaleX: progress }}
          className="absolute inset-x-0 top-0 h-0.5 origin-left bg-brand"
        />
        <div className="mx-auto flex h-24 w-full max-w-[1400px] items-center justify-between px-6 md:px-12 lg:px-20">
          {/* Logo */}
          <Link href={homeHref} aria-label="Home" className="shrink-0">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="block pt-2 text-3xl tracking-tight select-none sm:text-4xl"
              style={{ fontFamily: "var(--font-caveat)", fontWeight: 500 }}
            >
              {name}
            </motion.span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-6 text-xs font-normal md:flex lg:gap-8 lg:text-sm">
            {navItems.map((item, i) => (
              <motion.div
                key={`${item.url}-${i}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.04 }}
              >
                <Link
                  href={item.url}
                  aria-current={active === item.url ? "location" : undefined}
                  className="group relative py-1 text-muted-foreground transition-colors hover:text-foreground aria-[current]:text-foreground"
                >
                  {item.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-brand transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100 group-aria-[current]:origin-left group-aria-[current]:scale-x-100" />
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            {buttonText && (
              <Magnetic strength={0.25} className="hidden sm:inline-flex">
                <Link
                  href={buttonUrl}
                  className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-xs whitespace-nowrap sm:px-6 font-medium text-background transition-shadow duration-300 hover:shadow-[0_8px_30px_-8px_var(--brand)] lg:text-sm"
                >
                  {buttonText}
                </Link>
              </Magnetic>
            )}
            {navItems.length > 0 && (
              <MenuButton open={menuOpen} controls={menuId} onToggle={() => setMenuOpen((o) => !o)} />
            )}
          </div>
        </div>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would trap a fixed overlay inside it. */}
      <MobileMenu
        id={menuId}
        open={menuOpen}
        onClose={closeMenu}
        navItems={navItems}
        active={active}
        buttonText={buttonText}
        buttonUrl={buttonUrl}
      />
    </>
  );
}

function MenuButton({ open, controls, onToggle }: { open: boolean; controls: string; onToggle: () => void }) {
  const bar = "absolute left-1/2 h-[1.5px] w-5 -translate-x-1/2 rounded-full bg-current transition-all duration-300 ease-out";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? "Close menu" : "Open menu"}
      className="relative grid size-10 place-items-center rounded-full border border-border bg-background/60 backdrop-blur md:hidden"
    >
      <span className={cn(bar, open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[15px]")} />
      <span className={cn(bar, open ? "top-1/2 -translate-y-1/2 -rotate-45" : "top-[23px]")} />
    </button>
  );
}

function MobileMenu({
  id,
  open,
  onClose,
  navItems,
  active,
  buttonText,
  buttonUrl,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  active: string | null;
  buttonText: string;
  buttonUrl: string;
}) {
  // Lock page scroll while open; close on Escape or when resized up to the desktop nav.
  React.useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const desktop = window.matchMedia("(min-width: 768px)");
    const onResize = () => desktop.matches && onClose();
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id={id}
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-background px-6 pt-28 pb-10 md:hidden"
        >
          <nav aria-label="Mobile" className="flex-1">
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }}
              className="divide-y divide-border border-y border-border"
            >
              {navItems.map((item, i) => {
                const current = active === item.url;
                return (
                  <motion.li
                    key={`${item.url}-${i}`}
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
                    }}
                  >
                    <Link
                      href={item.url}
                      onClick={onClose}
                      aria-current={current ? "location" : undefined}
                      className="group flex items-baseline gap-4 py-4 text-3xl tracking-tight text-muted-foreground transition-colors aria-[current]:text-foreground"
                    >
                      <span className="font-mono text-xs text-muted-foreground group-aria-[current]:text-brand">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item.label}
                      {current && <span aria-hidden className="ml-auto size-2 self-center rounded-full bg-brand" />}
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          </nav>

          {buttonText && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="pt-8"
            >
              <Link
                href={buttonUrl}
                onClick={onClose}
                className="flex h-12 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background"
              >
                {buttonText}
              </Link>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
