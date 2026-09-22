import { isBlank, profile } from "@/lib/content";
import type { SocialKey } from "@/lib/types";
import { Icon, type IconName } from "./Icon";

/** Display order and glyph for each profile link. */
const SOCIAL: ReadonlyArray<[SocialKey, string, IconName]> = [
  ["googleScholar", "Google Scholar", "scholar"],
  ["orcid", "ORCID", "orcid"],
  ["scopus", "Scopus", "link"],
  ["researchGate", "ResearchGate", "link"],
  ["dblp", "dblp", "link"],
  ["universityProfile", "University Profile", "building"],
  ["academiaEdu", "Academia.edu", "link"],
  ["linkedin", "LinkedIn", "linkedin"],
  ["github", "GitHub", "github"],
];

/** Links with an empty URL in profile.json are hidden entirely. */
export function SocialLinks({ compactSize = false }: { compactSize?: boolean }) {
  const links = SOCIAL.filter(([key]) => !isBlank(profile.socialLinks[key]));
  if (links.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2.5" aria-label="Academic profiles">
      {links.map(([key, label, icon]) => (
        <li key={key}>
          <a
            href={profile.socialLinks[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} (opens in a new tab)`}
            className={`inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/6 font-medium text-white/88 no-underline transition-colors hover:border-maroon-400 hover:text-maroon-400 ${
              compactSize ? "h-9 px-3 text-[0.88rem]" : "h-10 px-3.5 text-[0.88rem]"
            }`}
          >
            <Icon name={icon} className="size-[17px] shrink-0" />
            <span>{label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
