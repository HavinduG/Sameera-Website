"use client";

import * as React from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { easeOutExpo } from "@/components/motion/ease";

/** Image shown full screen; null when closed. */
export type Zoomed = { src: string; alt: string } | null;

/** Full-screen image viewer. Closes on backdrop click, the close button or Escape; locks page scroll while open. */
export function Lightbox({ image, onClose }: { image: Zoomed; onClose: () => void }) {
  React.useEffect(() => {
    if (!image) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [image, onClose]);

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={image.alt || "Report, full size"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] grid cursor-zoom-out place-items-center bg-black/85 p-4 backdrop-blur-sm md:p-10"
        >
          <motion.img
            src={image.src}
            alt={image.alt}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.45, ease: easeOutExpo }}
            className="max-h-full max-w-full rounded-xl bg-white object-contain shadow-2xl"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
