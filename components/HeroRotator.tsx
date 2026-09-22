"use client";

import { useEffect, useRef, useState } from "react";

const HOLD_MS = 3200;
const FADE_MS = 350;

/** Cycles through the research-area titles under the hero role. */
export function HeroRotator({ items }: { items: string[] }) {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const swapRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = setInterval(() => {
      setFading(true);
      swapRef.current = setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setFading(false);
      }, FADE_MS);
    }, HOLD_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(swapRef.current);
    };
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <p className="mt-[-6px] mb-[18px] min-h-[1.6em] text-[1.05rem] text-white/75">
      <span>Research in</span>{" "}
      <span
        className={`inline-block border-b-2 border-blush-500 font-bold text-white transition-[opacity,transform] duration-350 ${
          fading ? "translate-y-2 opacity-0" : ""
        }`}
      >
        {items[index]}
      </span>
    </p>
  );
}
