"use client";

import { useEffect, useState } from "react";
import { m, useMotionValue, useSpring } from "motion/react";

const INTERACTIVE = 'a, button, input, textarea, select, summary, [role="button"], [tabindex]:not([tabindex="-1"])';

/**
 * A soft ring that trails the pointer and widens over anything clickable.
 *
 * Deliberately additive: the real cursor is never hidden. Replacing it looks
 * striking in a showreel and is a genuine usability regression — people lose
 * the shape that tells them whether they are over text, a link or a field.
 * This only adds a hint of weight to the pointer.
 *
 * Mounts for mouse and trackpad users who have not asked for reduced motion.
 * Touch devices render nothing at all.
 */
export function CursorRing() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hot, setHot] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.35 });

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

  useEffect(() => {
    if (!enabled) return;

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      const target = event.target as Element | null;
      setHot(Boolean(target?.closest?.(INTERACTIVE)));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <m.div
      aria-hidden="true"
      className="no-print pointer-events-none fixed top-0 left-0 z-[2000] size-7 rounded-full border border-blush-500/60 will-change-transform"
      style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
      animate={{
        opacity: visible ? (hot ? 0.9 : 0.4) : 0,
        scale: hot ? 1.7 : 1,
        backgroundColor: hot ? "rgba(224,86,107,0.10)" : "rgba(224,86,107,0)",
      }}
      transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
    />
  );
}
