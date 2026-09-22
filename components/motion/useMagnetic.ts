"use client";

import { useCallback, useEffect, useState } from "react";
import { useMotionValue, useSpring } from "motion/react";
import { FOLLOW_SPRING } from "@/lib/motion";

interface MagneticOptions {
  /** How far the element leans toward the pointer, as a fraction of offset. */
  strength?: number;
  /** Hard cap on travel in pixels, so the control never leaves its slot. */
  max?: number;
}

/**
 * Makes an element lean slightly toward the pointer while it is hovered.
 *
 * Only runs for a mouse or trackpad: on touch there is no hover to respond to,
 * and on a coarse pointer the offset would just make the target harder to hit.
 * Returns springs to bind to `style`, so the element keeps its natural layout
 * position and only the transform moves.
 */
export function useMagnetic({ strength = 0.28, max = 8 }: MagneticOptions = {}) {
  const [enabled, setEnabled] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, FOLLOW_SPRING);
  const springY = useSpring(y, FOLLOW_SPRING);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(fine.matches && !reduced.matches);
    sync();
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!enabled) return;
      const el = event.currentTarget;
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      x.set(Math.max(-max, Math.min(max, dx * strength)));
      y.set(Math.max(-max, Math.min(max, dy * strength)));
    },
    [enabled, max, strength, x, y],
  );

  const onPointerLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { enabled, style: { x: springX, y: springY }, onPointerMove, onPointerLeave };
}
