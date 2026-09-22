"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { m, useScroll, useSpring } from "motion/react";
import type { Variants } from "motion/react";
import { profile } from "@/lib/content";
import { Container } from "./Section";

const NAV_ITEMS = [
  ["home", "Home"],
  ["about", "About"],
  ["education", "Education"],
  ["research", "Research"],
  ["publications", "Publications"],
  ["projects", "Projects"],
  ["experience", "Experience"],
  ["awards", "Awards"],
  ["certifications", "Certifications"],
  ["skills", "Skills"],
  ["contact", "Contact"],
] as const;

const NAV_HEIGHT = 76;
/** Width at which the full horizontal menu replaces the hamburger. */
const DESKTOP_NAV = 1181;

/** Orchestration only — the sheet's own visibility stays in CSS. */
const MENU: Variants = {
  closed: {},
  open: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
};

const MENU_ITEM: Variants = {
  closed: { opacity: 0, x: -10 },
  open: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 0.61, 0.36, 1] } },
};

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("home");
  const [isMobile, setIsMobile] = useState(false);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  /**
   * Reading progress.
   *
   * A spring on `scaleX`, not a `width` set each frame: a transform is
   * composited, where width forces layout on every scroll tick.
   */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.3 });

  /* Header shadow and which section is in view. */
  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const doc = document.documentElement;
      setScrolled(y > 8);

      // The section whose top has passed just under the sticky header wins.
      const mark = y + NAV_HEIGHT + 40;
      let current = NAV_ITEMS[0][0] as string;
      for (const [id] of NAV_ITEMS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= mark) current = id;
      }
      // At the very bottom, the last section is the one being read.
      if (y + window.innerHeight >= doc.scrollHeight - 4) {
        current = NAV_ITEMS[NAV_ITEMS.length - 1][0];
      }
      setActive(current);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  /* Track the breakpoint so the sheet only animates where it actually opens. */
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${DESKTOP_NAV - 1}px)`);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /**
   * Position the sliding underline under the active link.
   *
   * Measured and animated as left/width rather than done with a layout
   * transition, which would need Motion's larger feature bundle.
   */
  useEffect(() => {
    const update = () => {
      const list = listRef.current;
      if (!list || window.innerWidth < DESKTOP_NAV) {
        setIndicator(null);
        return;
      }
      const link = list.querySelector<HTMLElement>(`a[data-nav="${active}"]`);
      setIndicator(link ? { left: link.offsetLeft, width: link.offsetWidth } : null);
    };
    update();
    // Web fonts land after first paint and shift every link along.
    const settle = setTimeout(update, 250);
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(settle);
      window.removeEventListener("resize", update);
    };
  }, [active, isMobile]);

  /* Escape closes the mobile menu; widening past the breakpoint dismisses it. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      close();
      toggleRef.current?.focus();
    };
    const onResize = () => {
      if (window.innerWidth >= DESKTOP_NAV) close();
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  return (
    <>
      <m.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="fixed top-0 left-0 z-[1001] h-[3px] w-full origin-left bg-accent"
      />

      <header
        className={`site-header on-dark sticky top-0 z-[900] h-19 border-b border-white/8 bg-[rgba(16,21,28,0.9)] backdrop-blur-[14px] backdrop-saturate-[1.4] transition-shadow duration-300 ${
          scrolled ? "shadow-[0_4px_20px_rgba(0,0,0,0.25)]" : ""
        }`}
      >
        <Container className="flex h-full items-center justify-between gap-4">
          <m.a
            href="#home"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="font-serif text-[1.02rem] font-semibold whitespace-nowrap text-white no-underline hover:text-maroon-400 xs:text-[1.2rem]"
          >
            {profile.shortName || profile.fullName}
          </m.a>

          <button
            ref={toggleRef}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nav-menu"
            onClick={() => setOpen((v) => !v)}
            className="flex size-11 shrink-0 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-sm border border-white/25 bg-transparent transition-colors hover:border-white/50 nav:hidden"
          >
            <span
              className={`block h-0.5 w-5 bg-white transition-transform duration-300 ${open ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition-opacity duration-300 ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition-transform duration-300 ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>

          <m.ul
            ref={listRef}
            id="nav-menu"
            onClick={close}
            // Desktop keeps the list permanently open; only the mobile sheet toggles.
            animate={isMobile ? (open ? "open" : "closed") : "open"}
            variants={MENU}
            className={`fixed inset-x-0 top-19 max-h-[calc(100vh-76px)] flex-col items-stretch gap-0 overflow-y-auto border-b border-maroon-500/30 bg-steel-950 px-4 pt-2 pb-5 transition-all duration-300 nav:relative nav:inset-auto nav:max-h-none nav:flex-row nav:items-center nav:gap-0.5 nav:overflow-visible nav:border-0 nav:bg-transparent nav:p-0 ${
              open
                ? "visible flex translate-y-0 opacity-100"
                : "invisible flex -translate-y-2 opacity-0 nav:visible nav:translate-y-0 nav:opacity-100"
            }`}
          >
            {indicator && (
              <m.span
                aria-hidden="true"
                className="absolute bottom-0.5 hidden h-[3px] rounded-sm bg-accent nav:block"
                initial={false}
                animate={{ left: indicator.left + 8, width: Math.max(indicator.width - 16, 0) }}
                transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.7 }}
              />
            )}

            {NAV_ITEMS.map(([id, label]) => {
              const isActive = active === id;
              return (
                <m.li key={id} variants={MENU_ITEM}>
                  <a
                    href={`#${id}`}
                    data-nav={id}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative block border-b border-white/7 px-2 py-3 text-base font-medium whitespace-nowrap no-underline transition-colors duration-200 nav:border-0 nav:py-2 nav:text-[0.9rem] ${
                      isActive ? "text-white" : "text-white/82 hover:text-white"
                    }`}
                  >
                    {label}
                  </a>
                </m.li>
              );
            })}

          </m.ul>
        </Container>
      </header>
    </>
  );
}
