"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

/** Floating WhatsApp/contact button. Rendered only when WordPress provides a URL. */
export function FloatingContact({ url }: { url: string | null }) {
  if (!url) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -45 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 1.8 }}
      className="fixed right-6 bottom-6 z-50 md:right-8 md:bottom-8"
    >
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative grid size-14 place-items-center rounded-full bg-foreground text-background shadow-[0_10px_40px_-10px_var(--brand)] transition-transform duration-300 hover:scale-110"
      >
        <span aria-hidden className="absolute inset-0 animate-ping rounded-full motion-reduce:hidden bg-brand/30 [animation-duration:2.5s]" />
        <MessageCircle className="relative size-6 transition-transform duration-300 group-hover:-rotate-12" />
      </Link>
    </motion.div>
  );
}
