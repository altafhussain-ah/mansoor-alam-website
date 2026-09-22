import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/** Vertical rule with dots, shared by Education and Experience. */
export function Timeline({ children }: { children: ReactNode }) {
  return (
    <ol className="relative pl-7 before:absolute before:top-1.5 before:bottom-1.5 before:left-[7px] before:w-[3px] before:bg-[linear-gradient(var(--color-maroon-500),var(--color-blush-400),rgba(240,138,154,0.15))] before:content-['']">
      {children}
    </ol>
  );
}

export function TimelineItem({
  current = false,
  children,
}: {
  current?: boolean;
  children: ReactNode;
}) {
  return (
    <Reveal
      as="li"
      className={`relative mb-[22px] before:absolute before:top-6 before:-left-[27px] before:size-3.5 before:rounded-full before:border-[3px] before:border-maroon-500 before:content-[''] ${
        current
          ? "before:border-white before:bg-accent before:shadow-[0_0_0_4px_rgba(224,86,107,0.35)]"
          : "before:bg-white"
      }`}
    >
      <div
        className={`rounded-[18px] p-5 px-[22px] shadow-card transition-[transform,box-shadow] hover:translate-x-1 hover:shadow-lift ${
          current ? "border-gradient" : "border border-line bg-mist-50"
        }`}
      >
        {children}
      </div>
    </Reveal>
  );
}

/** Date line above a timeline entry's title, optionally with a badge. */
export function TimelineMeta({ date, badge }: { date: ReactNode; badge?: ReactNode }) {
  return (
    <div className="mb-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[0.88rem] text-ink-500">
      <span className="font-semibold tracking-[0.02em] text-maroon-600">{date}</span>
      {badge}
    </div>
  );
}
