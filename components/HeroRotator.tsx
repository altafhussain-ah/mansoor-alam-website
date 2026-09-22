"use client";

import { useEffect, useRef, useState } from "react";

const TYPE_MS = 55; // per character, typing
const DELETE_MS = 28; // per character, clearing — faster, as real typing is
const HOLD_MS = 1900; // pause on a completed area
const GAP_MS = 320; // pause on an empty line before the next area

/**
 * Types the research areas out one after another, under the hero role.
 *
 * The first area is rendered in full on the server, so the line is never empty
 * and never depends on JavaScript. The effect starts by clearing that word,
 * which is why it opens in the deleting phase.
 *
 * Screen readers get the whole list once, statically; the animated copy is
 * hidden from them, because a line retyping itself every few seconds is noise
 * rather than information.
 */
export function HeroRotator({ items }: { items: string[] }) {
  const [text, setText] = useState(items[0] ?? "");
  const [live, setLive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let index = 0;
    let chars = items[0].length;
    let deleting = true;

    const schedule = (ms: number) => {
      timer.current = setTimeout(() => {
        if (!cancelled) step();
      }, ms);
    };

    const step = () => {
      if (deleting) {
        chars -= 1;
        setText(items[index].slice(0, Math.max(chars, 0)));
        if (chars <= 0) {
          deleting = false;
          index = (index + 1) % items.length;
          schedule(GAP_MS);
        } else {
          schedule(DELETE_MS);
        }
        return;
      }

      chars += 1;
      setText(items[index].slice(0, chars));
      if (chars >= items[index].length) {
        deleting = true;
        schedule(HOLD_MS);
      } else {
        schedule(TYPE_MS);
      }
    };

    setLive(true);
    schedule(HOLD_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer.current);
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <p className="mt-[-6px] mb-[18px] min-h-[1.6em] text-[1.05rem] text-white/75">
      <span>Research in</span>{" "}
      <span className="sr-only">{items.join(", ")}</span>
      <span
        aria-hidden="true"
        className="inline-block border-b-2 border-blush-500 font-bold text-white"
      >
        {text}
        {live && (
          <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-caret bg-blush-400" />
        )}
      </span>
    </p>
  );
}
