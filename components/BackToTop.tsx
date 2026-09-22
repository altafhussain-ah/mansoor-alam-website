"use client";

import { useEffect, useState } from "react";
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
    <button
      type="button"
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
      className={`no-print fixed right-[22px] bottom-23 z-[800] flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-[rgba(22,27,34,0.85)] text-maroon-400 shadow-lift backdrop-blur-[8px] transition-[opacity,transform,visibility] ${
        visible ? "visible translate-y-0 opacity-100" : "invisible translate-y-2.5 opacity-0"
      }`}
    >
      <Icon name="arrowUp" className="size-5" strokeWidth={2} />
    </button>
  );
}
