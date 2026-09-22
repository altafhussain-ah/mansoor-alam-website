"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/**
 * Wraps the page in Motion's lazy feature bundle.
 *
 * `domAnimation` covers transforms, opacity, variants, gestures and
 * AnimatePresence, and is roughly a third the size of the full bundle. Every
 * component in this project therefore uses `m.*` rather than `motion.*` —
 * importing `motion.*` anywhere would pull the full bundle back in and undo
 * the saving.
 *
 * `reducedMotion="user"` is the single switch for accessibility: Motion then
 * drops transform and layout animations for anyone who asks the OS for
 * reduced motion, while still allowing opacity so content does not simply
 * appear without explanation.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
