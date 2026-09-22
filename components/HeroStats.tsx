"use client";

import { useEffect, useState } from "react";

export interface StatTile {
  label: string;
  value: number;
}

const DURATION_MS = 1400;
/** easeOutCubic — fast start, gentle settle. */
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Metric tiles that count up on load.
 *
 * Renders the final values server-side, so the real numbers are what gets
 * indexed and what shows without JavaScript or with reduced motion.
 */
export function HeroStats({ tiles }: { tiles: StatTile[] }) {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / DURATION_MS, 1);
      setProgress(ease(t));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    setProgress(0);
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (tiles.length === 0) return null;

  return (
    <ul
      className="mt-10 grid grid-cols-2 gap-3 cards:grid-cols-4 cards:gap-4"
      aria-label="Research metrics"
    >
      {tiles.map((tile) => (
        <li
          key={tile.label}
          className="glass relative overflow-hidden rounded-[18px] px-[18px] pt-[18px] pb-4 transition-[transform,border-color] before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-accent before:content-[''] hover:-translate-y-1 hover:border-blush-400/50"
        >
          <span className="block font-serif text-[clamp(1.6rem,3.2vw,2.3rem)] leading-tight font-bold text-white tabular-nums">
            {Math.round(tile.value * progress).toLocaleString("en-US")}
          </span>
          <span className="mt-1 block text-[0.78rem] font-semibold tracking-[0.12em] text-white/65 uppercase">
            {tile.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
