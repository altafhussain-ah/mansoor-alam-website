import type { ReactNode } from "react";

const VARIANTS = {
  accent: "bg-accent text-white",
  danger: "border border-[#e8c2c2] bg-[#fbeaea] text-danger",
  muted: "border border-line bg-mist-100 text-ink-700",
} as const;

export function Badge({
  variant = "muted",
  children,
}: {
  variant?: keyof typeof VARIANTS;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-[3px] text-[0.72rem] font-bold tracking-[0.08em] uppercase ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}
