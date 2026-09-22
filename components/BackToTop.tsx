"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Icon } from "./Icon";

/** Appears once the reader is well down the page. Sits above the assistant. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <m.button
          type="button"
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 360, damping: 26 }}
          onClick={() => {
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          }}
          className="no-print fixed right-[22px] bottom-23 z-[800] flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-[rgba(22,27,34,0.85)] text-maroon-400 shadow-lift backdrop-blur-[8px]"
        >
          <Icon name="arrowUp" className="size-5" strokeWidth={2} />
        </m.button>
      )}
    </AnimatePresence>
  );
}
