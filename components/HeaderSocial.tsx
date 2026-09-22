"use client";

import { m } from "motion/react";
import { isBlank, profile } from "@/lib/content";
import type { SocialKey } from "@/lib/types";
import { Icon, type IconName } from "./Icon";

/**
 * The quick-reach links in the top bar.
 *
 * A short, deliberately fixed list: these are the three ways people actually
 * try to reach an academic. The full set still lives in the hero and footer.
 * Anything with an empty URL in profile.json is skipped, so a link only shows
 * once there is somewhere for it to go.
 */
const BAR_LINKS: ReadonlyArray<[SocialKey, string, IconName]> = [
  ["whatsapp", "WhatsApp", "whatsapp"],
  ["linkedin", "LinkedIn", "linkedin"],
  ["googleScholar", "Google Scholar", "scholar"],
];

export function HeaderSocial({ inSheet = false }: { inSheet?: boolean }) {
  const links = BAR_LINKS.filter(([key]) => !isBlank(profile.socialLinks[key]));
  if (links.length === 0) return null;

  return (
    <ul
      aria-label="Quick links"
      className={
        inSheet
          ? "mt-3 flex gap-2 border-t border-white/10 pt-4 nav:hidden"
          : "hidden shrink-0 items-center gap-1.5 nav:flex"
      }
    >
      {links.map(([key, label, icon]) => (
        <li key={key}>
          <m.a
            href={profile.socialLinks[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} (opens in a new tab)`}
            title={label}
            whileHover={{ scale: 1.12, y: -2 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="flex size-9 items-center justify-center rounded-full border border-white/18 bg-white/6 text-white/80 no-underline transition-colors hover:border-blush-400/60 hover:text-blush-400"
          >
            <Icon name={icon} className="size-[17px]" />
          </m.a>
        </li>
      ))}
    </ul>
  );
}
