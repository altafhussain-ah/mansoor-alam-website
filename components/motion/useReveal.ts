"use client";

import { useRef } from "react";
import { useAnimationControls } from "motion/react";
import { VIEWPORT_MARGIN, useIsomorphicLayoutEffect } from "@/lib/motion";

/**
 * Drives a scroll reveal without ever risking stranded content.
 *
 * The element is rendered in its final, visible state — that is what ships in
 * the static HTML, so it is what crawlers and anyone without working
 * JavaScript get. Only once this hook has run and attached an observer does it
 * hide the element, and it does that in the layout phase, before the browser
 * paints, so the reader never sees the visible state flicker away.
 *
 * Anything already on screen at first paint is left alone. The server HTML has
 * already been painted by the time React hydrates, so hiding it here would be
 * a visible flash rather than an entrance. Above-the-fold motion is done in
 * CSS instead (see the hero entrance in globals.css).
 */
export function useReveal(amount = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    controls.set("hidden");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          void controls.start("visible");
          observer.disconnect();
          return;
        }
      },
      { rootMargin: VIEWPORT_MARGIN, threshold: amount },
    );
    observer.observe(el);

    // Printing does not scroll, so anything still waiting would print blank.
    const revealNow = () => {
      void controls.start("visible");
      observer.disconnect();
    };
    window.addEventListener("beforeprint", revealNow);

    return () => {
      observer.disconnect();
      window.removeEventListener("beforeprint", revealNow);
    };
  }, [controls, amount]);

  return { ref, controls };
}
