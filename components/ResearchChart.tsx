"use client";

import { useEffect, useRef, useState } from "react";

export interface ChartRow {
  label: string;
  value: number;
}

/**
 * Horizontal bars for publications per research area.
 *
 * Bars render at their true width so the chart is correct without JS; the
 * grow-in only runs once the chart scrolls into view.
 */
export function ResearchChart({ rows }: { rows: ChartRow[] }) {
  const [grown, setGrown] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setGrown(false);
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setGrown(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (rows.length === 0) return null;
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div
      ref={ref}
      className="mt-11 rounded-[18px] border border-line bg-white p-6.5 shadow-card"
    >
      <h3 className="mb-1.5 text-[1.12rem]">Publications per research area</h3>
      <p className="mb-4.5 text-[0.9rem] text-ink-500">
        Based on the selected publications listed on this page; an article may belong to more than
        one area.
      </p>

      {rows.map((row) => (
        <div
          key={row.label}
          className="mb-3.5 grid grid-cols-1 gap-1.5 cards:grid-cols-[minmax(220px,300px)_1fr] cards:items-center cards:gap-4"
        >
          <span className="text-[0.94rem] font-medium text-ink-700">{row.label}</span>
          <div
            role="img"
            aria-label={`${row.label}: ${row.value} publications`}
            className="relative h-[22px] overflow-hidden rounded-full bg-mist-100"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
              style={{ width: grown ? `${Math.round((row.value / max) * 100)}%` : "0%" }}
            />
            <span className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-[3px] bg-white/85 px-1.5 text-[0.85rem] font-bold text-steel-900">
              {row.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
