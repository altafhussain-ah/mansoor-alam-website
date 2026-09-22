import type { ReactNode } from "react";
import { StaggerGroup, StaggerItem } from "./motion/Stagger";

/**
 * Shared surface for Research, Projects and Awards.
 *
 * The lift on hover moved from a `hover:-translate-y-1.5` class to Motion,
 * because Motion writes `transform` inline once the card has animated in and
 * that would have overridden the class. Colour, shadow and the gradient rule
 * that wipes across the top stay in CSS.
 */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <StaggerItem
      as="article"
      whileHover={{ y: -6 }}
      className={`group relative flex flex-col overflow-hidden rounded-[18px] border border-line bg-white p-6.5 shadow-card transition-[box-shadow,border-color] before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:origin-left before:scale-x-0 before:bg-accent before:transition-transform before:duration-450 before:content-[''] hover:border-blush-500/30 hover:shadow-lift hover:before:scale-x-100 ${className}`}
    >
      {children}
    </StaggerItem>
  );
}

/** Gradient tile holding a section glyph. */
export function CardIcon({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4.5 flex size-12 items-center justify-center rounded-[14px] bg-accent text-white shadow-glow">
      {children}
    </div>
  );
}

export function CardGrid({
  children,
  columns = 2,
}: {
  children: ReactNode;
  /** 3 gives a third column on large screens; 2 tops out at two. */
  columns?: 2 | 3;
}) {
  return (
    <StaggerGroup
      className={`grid grid-cols-1 gap-5.5 cards:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : ""}`}
    >
      {children}
    </StaggerGroup>
  );
}
