"use client";

import { m, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /** Fraction of the viewport travelled across the element's full scroll. */
  speed?: number;
}

/**
 * Drifts its children against the scroll, gently.
 *
 * `speed` is deliberately small by default. Anything stronger reads as the
 * page lagging rather than as depth, and on a long publications list it also
 * means more work per frame.
 *
 * The spring is what keeps it from feeling mechanical, and the reduced-motion
 * check is explicit because binding a motion value to `style` is not an
 * animation — `MotionConfig reducedMotion` would not catch it.
 */
export function Parallax({ children, className, speed = 0.12 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const distance = speed * 120;
  const raw = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const y = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <m.div ref={ref} className={className} style={reduced ? undefined : { y }}>
      {children}
    </m.div>
  );
}
