import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-4 md:px-8 ${className}`}>{children}</div>
  );
}

interface SectionProps {
  id: string;
  /** Alternating background: tinted mist or plain white. */
  tint?: boolean;
  kicker: string;
  title: string;
  children: ReactNode;
}

export function Section({ id, tint = false, kicker, title, children }: SectionProps) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`py-18 wide:py-24 ${tint ? "bg-section-tint" : "bg-white"}`}
    >
      <Container>
        <Reveal as="header" className="mb-10">
          <p className="mb-2 inline-block rounded-full bg-maroon-500/8 px-3 py-[5px] text-[0.78rem] font-bold tracking-[0.14em] text-maroon-600 uppercase">
            {kicker}
          </p>
          <h2
            id={headingId}
            className="relative pb-4 text-[clamp(2rem,4vw,2.8rem)] after:absolute after:bottom-0 after:left-0 after:h-1 after:w-18 after:rounded-sm after:bg-accent after:content-['']"
          >
            {title}
          </h2>
        </Reveal>
        {children}
      </Container>
    </section>
  );
}
