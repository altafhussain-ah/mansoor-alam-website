"use client";

import { m } from "motion/react";
import type { TargetAndTransition, Variants } from "motion/react";
import type { ReactNode } from "react";
import { VARIANTS, type VariantName } from "@/lib/motion";
import { useReveal } from "./motion/useReveal";

/** The elements this wrapper is used as. Add to the map to allow more. */
const TAGS = {
  div: m.div,
  header: m.header,
  section: m.section,
  article: m.article,
  aside: m.aside,
  figure: m.figure,
  ul: m.ul,
  ol: m.ol,
  li: m.li,
  p: m.p,
} as const;

export type RevealTag = keyof typeof TAGS;

/** Copies a variant set with a start delay applied to its `visible` state. */
export function withDelay(variants: Variants, delay: number): Variants {
  if (!delay) return variants;
  const visible = variants.visible as TargetAndTransition;
  return {
    ...variants,
    visible: { ...visible, transition: { ...visible.transition, delay } },
  };
}

interface RevealProps {
  as?: RevealTag;
  className?: string;
  children: ReactNode;
  /** Which entrance to use. Defaults to a short fade and rise. */
  variant?: VariantName;
  /** Seconds to wait once the element is in view. */
  delay?: number;
  /** Fraction of the element that must be visible before it plays. */
  amount?: number;
  /**
   * Hover target. Needed because Motion writes `transform` inline once the
   * element has animated, which overrides any `hover:translate-*` class.
   */
  whileHover?: TargetAndTransition;
}

/** Fades content in as it scrolls into view. */
export function Reveal({
  as = "div",
  className,
  children,
  variant = "fadeUp",
  delay = 0,
  amount = 0.12,
  whileHover,
}: RevealProps) {
  const { ref, controls } = useReveal(amount);
  const Tag = TAGS[as] as typeof m.div;

  return (
    <Tag
      ref={ref}
      className={className}
      initial={false}
      animate={controls}
      variants={withDelay(VARIANTS[variant], delay)}
      whileHover={whileHover}
    >
      {children}
    </Tag>
  );
}
