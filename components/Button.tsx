import type { AnchorHTMLAttributes, ReactNode } from "react";

const BASE =
  "inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-transparent px-6 py-3 text-[0.98rem] font-semibold no-underline transition-all";

export const BUTTON_VARIANTS = {
  /** Gradient fill; the gradient slides on hover. */
  primary:
    `${BASE} bg-accent bg-[length:160%_160%] bg-[position:0%_50%] text-white shadow-glow hover:-translate-y-0.5 hover:bg-[position:100%_50%] hover:text-white hover:shadow-[0_14px_34px_-10px_rgba(224,86,107,0.7)]`,
  /** Frosted outline, for use on the dark hero. */
  ghost:
    `${BASE} glass text-white hover:border-white hover:bg-white/8 hover:text-white`,
  /** Outlined, for use on light sections. */
  outline:
    `${BASE} border-steel-700 bg-transparent text-steel-800 hover:bg-steel-800 hover:text-white`,
} as const;

type Variant = keyof typeof BUTTON_VARIANTS;

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant: Variant;
  children: ReactNode;
}

export function LinkButton({ variant, className = "", children, ...rest }: LinkButtonProps) {
  return (
    <a className={`${BUTTON_VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </a>
  );
}
