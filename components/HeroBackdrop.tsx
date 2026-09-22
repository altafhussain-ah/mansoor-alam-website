"use client";

import { m, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * The hero's decorative orbs and grid, with a light scroll parallax.
 *
 * Each orb is two elements on purpose: the outer one carries the parallax
 * transform from Motion, the inner keeps its CSS float animation. Putting both
 * on one element would not work — Motion writes `transform` inline and the
 * keyframes would be overridden.
 */
export function HeroBackdrop() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  // Over the first viewport of scrolling, drift the layers apart slightly.
  const orbOne = useTransform(scrollY, [0, 700], [0, 90]);
  const orbTwo = useTransform(scrollY, [0, 700], [0, -70]);
  const grid = useTransform(scrollY, [0, 700], [0, 45]);
  const fade = useTransform(scrollY, [0, 700], [1, 0.35]);

  const drift = (value: typeof orbOne) => (reduced ? undefined : { y: value });

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <m.div className="absolute inset-0" style={drift(orbOne)}>
        <span className="absolute -top-35 -right-30 size-130 animate-orb-float rounded-full bg-[radial-gradient(circle,rgba(224,86,107,0.75),rgba(224,86,107,0)_70%)] opacity-55 blur-[60px]" />
      </m.div>

      <m.div className="absolute inset-0" style={drift(orbTwo)}>
        <span className="absolute -bottom-50 -left-40 size-115 animate-orb-float rounded-full bg-[radial-gradient(circle,rgba(163,42,61,0.8),rgba(163,42,61,0)_70%)] opacity-55 blur-[60px] [animation-direction:reverse] [animation-duration:18s]" />
      </m.div>

      <m.span
        className="hero-grid absolute inset-0"
        style={reduced ? undefined : { y: grid, opacity: fade }}
      />
    </div>
  );
}
