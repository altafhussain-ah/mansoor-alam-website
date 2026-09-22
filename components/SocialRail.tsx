import { isBlank, profile } from "@/lib/content";
import type { SocialKey } from "@/lib/types";
import { Icon, type IconName } from "./Icon";

/**
 * Floating quick-contact rail, pinned to the right edge of the viewport.
 *
 * Deliberately short: these are the three ways people actually try to reach an
 * academic. The complete set of profiles still lives in the hero and footer.
 *
 * A link with an empty URL in profile.json is skipped rather than rendered
 * dead, which is the same rule the rest of the site follows.
 */
const RAIL_LINKS: ReadonlyArray<[SocialKey, string, IconName]> = [
  ["whatsapp", "WhatsApp", "whatsapp"],
  ["googleScholar", "Google Scholar", "scholar"],
  ["linkedin", "LinkedIn", "linkedin"],
];

export function SocialRail() {
  const links = RAIL_LINKS.filter(([key]) => !isBlank(profile.socialLinks[key]));
  if (links.length === 0) return null;

  return (
    <div
      // Sits mid-height so it clears the assistant launcher and the
      // back-to-top button, which both live in the bottom-right corner.
      className="no-print fixed top-1/2 right-3 z-[820] -translate-y-1/2"
    >
      <ul aria-label="Quick contact" className="flex flex-col gap-2">
        {links.map(([key, label, icon], index) => (
          <li key={key} className="group relative">
            <a
              href={profile.socialLinks[key]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${label} (opens in a new tab)`}
              data-enter="fade"
              // Arrives after the hero has settled, one beat apart.
              style={{ animationDelay: `${0.95 + index * 0.09}s` }}
              className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-steel-900/85 text-white/85 no-underline shadow-lift backdrop-blur-[8px] transition-[transform,background-color,border-color,color] duration-200 hover:-translate-x-0.5 hover:scale-110 hover:border-blush-400/60 hover:bg-steel-900 hover:text-blush-400 wide:size-12"
            >
              <Icon name={icon} className="size-[19px]" />
            </a>

            {/* Label slides out on hover. Pointer-events off so it never
                intercepts the click meant for the button. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-full mr-2.5 -translate-y-1/2 translate-x-1 rounded-md bg-steel-950 px-2.5 py-1 text-[0.78rem] font-medium whitespace-nowrap text-white opacity-0 shadow-lift transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100"
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
