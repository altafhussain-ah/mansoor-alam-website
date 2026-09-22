import type { SVGProps } from "react";

/** Single-stroke 24×24 glyphs, drawn with currentColor. */
const PATHS = {
  brain:
    "M9 4a3 3 0 0 0-3 3v.2A3 3 0 0 0 4 10a3 3 0 0 0 1 2.2A3 3 0 0 0 6 17a3 3 0 0 0 3 3 3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zM15 4a3 3 0 0 1 3 3v.2A3 3 0 0 1 20 10a3 3 0 0 1-1 2.2A3 3 0 0 1 18 17a3 3 0 0 1-3 3 3 3 0 0 1-3-3",
  code: "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
  chip: "M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4",
  file: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5",
  download: "M12 4v11m0 0l-4-4m4 4l4-4M5 20h14",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z",
  building: "M4 21V5l8-3 8 3v16M9 21v-5h6v5M8 8h2M14 8h2M8 12h2M14 12h2",
  scholar: "M12 3L1 9l11 6 9-4.9V17h2V9zM5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  linkedin: "M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7",
  github:
    "M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.5 2.5 5.5 2.8 5.5 2.8a4.3 4.3 0 0 0-.1 3.2A4.7 4.7 0 0 0 4 9.2c0 4.6 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3V21",
  cert: "M9 13.5L8 21l4-2 4 2-1-7.5M10 9l1.5 1.5L14.5 7.5",
  award: "M8.5 14l-1.5 8 5-3 5 3-1.5-8",
  arrowUp: "M12 5l-7 7m7-7l7 7M12 5v14",
  send: "M4 12l16-8-6 16-2.5-6.5L4 12z",
  close: "M6 6l12 12M18 6L6 18",
  lock: "M8 11V7a4 4 0 0 1 8 0v4",
  chat: "M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.3-.6L3 21l1.8-5A8.3 8.3 0 0 1 4 11.5a8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 8 8.4z",
} as const;

/** Glyphs that need extra shapes alongside their path. */
const EXTRAS: Partial<Record<IconName, React.ReactNode>> = {
  eye: <circle cx="12" cy="12" r="3" />,
  chip: <rect x="6" y="6" width="12" height="12" rx="2" />,
  compass: <circle cx="12" cy="12" r="9" />,
  award: <circle cx="12" cy="9" r="6" />,
  cert: <circle cx="12" cy="9" r="5" />,
  pin: <circle cx="12" cy="10" r="2.5" />,
  orcid: <circle cx="12" cy="12" r="9" />,
  linkedin: <rect x="3" y="3" width="18" height="18" rx="2" />,
  mail: <rect x="3" y="5" width="18" height="14" rx="2" />,
  lock: <rect x="5" y="11" width="14" height="10" rx="2" />,
};

/** Glyphs whose main outline differs from the PATHS entry. */
const OVERRIDES: Partial<Record<IconName, string>> = {
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z",
  compass: "M15.5 8.5l-2 5-5 2 2-5z",
  orcid: "M9 8v8M9 6v.01M12 8h2.5a4 4 0 0 1 0 8H12z",
  mail: "M3 7l9 6 9-6",
};

export type IconName =
  | keyof typeof PATHS
  | "eye"
  | "compass"
  | "orcid"
  | "mail";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  const d = OVERRIDES[name] ?? PATHS[name as keyof typeof PATHS] ?? PATHS.link;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {EXTRAS[name]}
      <path d={d} />
    </svg>
  );
}
