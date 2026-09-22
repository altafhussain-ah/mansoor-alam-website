"use client";

import { m } from "motion/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useMagnetic } from "./motion/useMagnetic";

const BASE =
  "inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-transparent px-6 py-3 text-[0.98rem] font-semibold no-underline transition-[background-position,box-shadow,border-color,color]";

export const BUTTON_VARIANTS = {
  /** Gradient fill; the gradient slides on hover. */
  primary:
    `${BASE} bg-accent bg-[length:160%_160%] bg-[position:0%_50%] text-white shadow-glow hover:bg-[position:100%_50%] hover:text-white hover:shadow-[0_14px_34px_-10px_rgba(224,86,107,0.7)]`,
  /** Frosted outline, for use on the dark hero. */
  ghost: `${BASE} glass text-white hover:border-white hover:bg-white/8 hover:text-white`,
  /** Outlined, for use on light sections. */
  outline:
    `${BASE} border-steel-700 bg-transparent text-steel-800 hover:bg-steel-800 hover:text-white`,
} as const;

type Variant = keyof typeof BUTTON_VARIANTS;

/**
 * React's animation and drag handlers have different signatures from Motion's,
 * so they are dropped from the passthrough rather than fought with a cast.
 * Nothing in this project passes them to a button.
 */
type PassthroughAnchorProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag" | "onDragStart" | "onDragEnd"
>;

interface LinkButtonProps extends PassthroughAnchorProps {
  variant: Variant;
  children: ReactNode;
}

/**
 * The site's link-styled button.
 *
 * Motion owns the transform here — the magnetic offset, the hover lift and the
 * press. The old `hover:-translate-y-0.5` class was removed rather than kept,
 * because Motion writes `transform` inline and would have silently overridden
 * it. The lift now comes from the magnetic offset; `whileHover` only scales,
 * since animating `y` here would fight the spring bound to that same value.
 * Colour, shadow and the sliding gradient stay in CSS, where they cost nothing.
 */
export function LinkButton({ variant, className = "", children, ...rest }: LinkButtonProps) {
  const magnetic = useMagnetic({ strength: 0.25, max: 7 });

  return (
    <m.a
      className={`${BUTTON_VARIANTS[variant]} ${className}`}
      style={magnetic.style}
      onPointerMove={magnetic.onPointerMove}
      onPointerLeave={magnetic.onPointerLeave}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 25 }}
      {...rest}
    >
      {children}
    </m.a>
  );
}
