"use client";

import { m } from "motion/react";
import type { TargetAndTransition } from "motion/react";
import type { ReactNode } from "react";
import { VARIANTS, staggerParent, type VariantName } from "@/lib/motion";
import { useReveal } from "./useReveal";

const GROUP_TAGS = { div: m.div, header: m.header, ul: m.ul, ol: m.ol, dl: m.dl } as const;
const ITEM_TAGS = {
  div: m.div,
  li: m.li,
  p: m.p,
  article: m.article,
  figure: m.figure,
  span: m.span,
} as const;

interface GroupProps {
  as?: keyof typeof GROUP_TAGS;
  className?: string;
  children: ReactNode;
  /** Seconds between each child starting. */
  stagger?: number;
  /** Seconds to wait before the first child starts. */
  delayChildren?: number;
  amount?: number;
  "aria-label"?: string;
}

/**
 * Reveals its children one after another as the group scrolls into view.
 *
 * The group itself does the observing, so a grid animates as one gesture
 * rather than as a dozen elements each deciding for themselves — which is
 * both calmer to look at and cheaper, since it is one observer instead of N.
 * Children opt in by being a `StaggerItem`.
 */
export function StaggerGroup({
  as = "div",
  className,
  children,
  stagger = 0.08,
  delayChildren = 0,
  amount = 0.1,
  ...rest
}: GroupProps) {
  const { ref, controls } = useReveal(amount);
  const Tag = GROUP_TAGS[as] as typeof m.div;

  return (
    <Tag
      ref={ref}
      className={className}
      initial={false}
      animate={controls}
      variants={staggerParent(stagger, delayChildren)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

interface ItemProps {
  as?: keyof typeof ITEM_TAGS;
  className?: string;
  children: ReactNode;
  variant?: VariantName;
  /**
   * Hover target. Needed because Motion writes `transform` inline once the
   * item has animated, which overrides any `hover:translate-*` class.
   */
  whileHover?: TargetAndTransition;
}

/**
 * A child of `StaggerGroup`.
 *
 * It deliberately has no `animate` prop: Motion propagates the parent's
 * variant label down to any child that declares `variants`, and that
 * propagation is what produces the stagger.
 */
export function StaggerItem({
  as = "div",
  className,
  children,
  variant = "fadeUp",
  whileHover,
}: ItemProps) {
  const Tag = ITEM_TAGS[as] as typeof m.div;
  return (
    <Tag
      className={className}
      variants={VARIANTS[variant]}
      whileHover={whileHover}
      transition={whileHover ? { type: "spring", stiffness: 300, damping: 24 } : undefined}
    >
      {children}
    </Tag>
  );
}
