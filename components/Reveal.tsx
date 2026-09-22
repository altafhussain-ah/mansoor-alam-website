"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

interface RevealProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/**
 * Fades content in as it scrolls into view.
 *
 * Renders visible and only hides itself once the effect has confirmed it can
 * observe and restore it. The previous CSS-first approach (`opacity: 0` in the
 * stylesheet) left whole sections blank whenever the observer never fired.
 * Content above the fold is left alone so it never flashes.
 */
export function Reveal({ as: Tag = "div", className, children }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Already on screen: showing it is the correct final state.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "shown";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} data-reveal="shown" className={className}>
      {children}
    </Tag>
  );
}
