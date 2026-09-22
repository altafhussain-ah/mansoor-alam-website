import { useEffect, useLayoutEffect } from "react";
import type { Transition, Variants } from "motion/react";

/**
 * Shared motion language for the site.
 *
 * One set of curves and durations so every animation feels like it belongs to
 * the same object. Kept restrained on purpose: this is an academic portfolio,
 * so motion should read as polish, not as decoration.
 */

/** Calm deceleration — the house curve for anything entering the viewport. */
export const EASE_OUT = [0.22, 0.61, 0.36, 1] as const;
/** Slight overshoot, for small interactive elements only. */
export const EASE_SPRING = [0.34, 1.32, 0.64, 1] as const;

export const DURATION = {
  fast: 0.28,
  base: 0.55,
  slow: 0.75,
} as const;

/** Spring used by the magnetic buttons and the cursor ring. */
export const FOLLOW_SPRING: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 26,
  mass: 0.6,
};

/** Distance an element travels while fading in, in pixels. */
export const TRAVEL = 22;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: TRAVEL },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.base, ease: EASE_OUT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: TRAVEL * 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

/** Slides in from the timeline rule rather than from below. */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: -TRAVEL },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

export const VARIANTS = { fadeUp, fadeIn, scaleIn, slideRight } as const;
export type VariantName = keyof typeof VARIANTS;

/**
 * Parent for a stagger group. Children inheriting a variant label animate in
 * sequence; the parent itself does not move.
 */
export function staggerParent(stagger = 0.08, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}

/**
 * useLayoutEffect on the client, useEffect on the server.
 *
 * The layout pass matters: it runs before the browser paints the hydration
 * render, which is what lets a reveal hide itself without the reader ever
 * seeing the un-hidden state.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Viewport margin shared by the scroll reveals. */
export const VIEWPORT_MARGIN = "0px 0px -8% 0px";
