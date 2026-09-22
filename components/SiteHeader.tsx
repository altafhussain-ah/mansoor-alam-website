"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("home");
  const progressRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  /* Scroll progress, header shadow and which section is in view. */
  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;

      if (progressRef.current) {
        progressRef.current.style.width = `${scrollable > 0 ? (y / scrollable) * 100 : 0}%`;
      }
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
      <div
        ref={progressRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[1001] h-[3px] w-0 bg-accent"
      />

      <header
        className={`site-header on-dark sticky top-0 z-[900] h-19 border-b border-white/8 bg-[rgba(16,21,28,0.9)] backdrop-blur-[14px] backdrop-saturate-[1.4] transition-shadow ${
          scrolled ? "shadow-[0_4px_20px_rgba(0,0,0,0.25)]" : ""
        }`}
      >
        <Container className="flex h-full items-center justify-between gap-4">
          <a
            href="#home"
            className="font-serif text-[1.02rem] font-semibold whitespace-nowrap text-white no-underline hover:text-maroon-400 xs:text-[1.2rem]"
          >
            {profile.shortName || profile.fullName}
          </a>

          <button
            ref={toggleRef}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nav-menu"
            onClick={() => setOpen((v) => !v)}
            className="flex size-11 shrink-0 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-sm border border-white/25 bg-transparent nav:hidden"
          >
            <span
              className={`block h-0.5 w-5 bg-white transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span className={`block h-0.5 w-5 bg-white transition-opacity ${open ? "opacity-0" : ""}`} />
            <span
              className={`block h-0.5 w-5 bg-white transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>

          <ul
            id="nav-menu"
            onClick={close}
            className={`fixed inset-x-0 top-19 max-h-[calc(100vh-76px)] flex-col items-stretch gap-0 overflow-y-auto border-b border-maroon-500/30 bg-steel-950 px-4 pt-2 pb-5 transition-all duration-200 nav:static nav:max-h-none nav:flex-row nav:items-center nav:gap-0.5 nav:overflow-visible nav:border-0 nav:bg-transparent nav:p-0 ${
              open
                ? "visible flex translate-y-0 opacity-100"
                : "invisible flex -translate-y-2 opacity-0 nav:visible nav:translate-y-0 nav:opacity-100"
            }`}
          >
            {NAV_ITEMS.map(([id, label]) => {
              const isActive = active === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative block border-b border-white/7 px-2 py-3 text-base font-medium whitespace-nowrap no-underline transition-colors nav:border-0 nav:py-2 nav:text-[0.9rem] ${
                      isActive ? "text-white" : "text-white/82 hover:text-white"
                    } after:absolute after:inset-x-2 after:bottom-0.5 after:hidden after:h-[3px] after:rounded-sm after:bg-accent after:transition-transform after:content-[''] nav:after:block ${
                      isActive ? "after:scale-x-100" : "after:scale-x-0"
                    }`}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </Container>
      </header>
    </>
  );
}
