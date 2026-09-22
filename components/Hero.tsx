import Image from "next/image";
import {
  assetPath,
  compact,
  isBlank,
  profile,
  publicationStats,
  researchAreas,
} from "@/lib/content";
import { LinkButton } from "./Button";
import { HeroBackdrop } from "./HeroBackdrop";
import { Parallax } from "./motion/Parallax";
import { HeroRotator } from "./HeroRotator";
import { HeroStats, type StatTile } from "./HeroStats";
import { Container } from "./Section";
import { SocialLinks } from "./SocialLinks";

/** Splits a leading honorific ("Prof. Dr.") so it can be set above the name. */
function splitHonorific(fullName: string): { prefix: string; name: string } {
  const match = fullName.match(/^((?:(?:Prof|Dr|Engr|Mr|Ms|Mrs)\.?\s+)+)(.*)$/i);
  return match ? { prefix: match[1].trim(), name: match[2] } : { prefix: "", name: fullName };
}

function statTiles(): StatTile[] {
  const candidates: Array<[string, number | null]> = [
    ["Publications", publicationStats.totalPublications],
    ["Citations", publicationStats.totalCitations],
    ["h-index", publicationStats.hIndex],
    ["i10-index", publicationStats.i10Index],
  ];
  return candidates
    .filter((entry): entry is [string, number] => typeof entry[1] === "number")
    .map(([label, value]) => ({ label, value }));
}

export function Hero() {
  const { prefix, name } = splitHonorific(profile.fullName);
  const roleParts = [profile.department, profile.institution, profile.location].filter(
    (part) => !isBlank(part),
  );
  const { primary, secondary } = profile.heroButtons;
  const areas = compact(researchAreas.map((area) => area.title));

  return (
    <section
      id="home"
      aria-labelledby="hero-name"
      className="on-dark relative isolate overflow-hidden bg-dark-wash pt-16 pb-12 text-white after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-accent after:content-['']"
    >
      {/* Decorative depth: two blurred orbs behind a faint grid, drifting on scroll. */}
      <HeroBackdrop />

      <Container className="grid grid-cols-1 items-center gap-10 wide:grid-cols-[1.5fr_1fr] wide:gap-16">
        <div>
          {!isBlank(profile.headline) && (
            <p
              data-enter
              style={{ animationDelay: "0.05s" }}
              className="inline-flex items-center gap-2 rounded-full border border-blush-400/35 bg-blush-500/14 px-3.5 py-1.5 text-[0.74rem] font-semibold tracking-[0.12em] text-blush-400 uppercase before:size-[7px] before:animate-pulse-dot before:rounded-full before:bg-blush-500 before:content-['']">
              {profile.headline}
            </p>
          )}

          <h1
            id="hero-name"
            data-enter
            style={{ animationDelay: "0.14s" }}
            className="my-[18px] mb-3.5 text-[clamp(2.3rem,6vw,4rem)] leading-[1.05] font-semibold tracking-[-0.01em] text-white"
          >
            {prefix && (
              <span className="mb-2.5 block font-sans text-[0.32em] font-semibold tracking-[0.22em] text-white/60 uppercase">
                {prefix}
              </span>
            )}
            <span className="text-name-gradient inline">{name}</span>
          </h1>

          <p
            data-enter
            style={{ animationDelay: "0.22s" }}
            className="mb-5 text-[1.12rem] text-white/88"
          >
            <strong className="font-semibold text-white">{profile.designation}</strong>
            {roleParts.length > 0 && (
              <>
                <br />
                {roleParts.join(", ")}
              </>
            )}
          </p>

          <div data-enter style={{ animationDelay: "0.3s" }}>
            <HeroRotator items={areas} />
          </div>

          <p
            data-enter
            style={{ animationDelay: "0.38s" }}
            className="mb-7 max-w-[62ch] text-white/80 max-[599px]:text-left wide:text-justify wide:hyphens-auto">
            {profile.introduction}
          </p>

          <div data-enter style={{ animationDelay: "0.46s" }} className="mb-7 flex flex-wrap gap-3">
            {!isBlank(primary.href) && (
              <LinkButton variant="primary" href={primary.href}>
                {primary.label}
              </LinkButton>
            )}
            {!isBlank(secondary.href) && (
              <LinkButton
                variant="ghost"
                href={secondary.href}
                target={/^https?:|\.pdf$/i.test(secondary.href) ? "_blank" : undefined}
                rel={/^https?:|\.pdf$/i.test(secondary.href) ? "noopener noreferrer" : undefined}
              >
                {secondary.label}
              </LinkButton>
            )}
          </div>

          <div data-enter style={{ animationDelay: "0.54s" }}>
            <SocialLinks />
          </div>
        </div>

        <figure className="order-first m-0 justify-self-center wide:order-none wide:justify-self-end">
          <Parallax speed={0.06}>
            <div
              data-enter="scale"
              style={{ animationDelay: "0.18s" }}
              className="relative rounded-3xl bg-accent p-1.5 shadow-[0_30px_70px_-20px_rgba(224,86,107,0.55)] before:absolute before:-inset-[18px] before:animate-spin-slow before:rounded-[32px] before:border before:border-dashed before:border-blush-400/35 before:content-['']">
              <Image
                src={assetPath(profile.photo.src)}
                alt={profile.photo.alt || profile.fullName}
                width={267}
                height={285}
                priority
                className="w-[230px] rounded-[19px] bg-white object-cover wide:w-[320px]"
                style={{ aspectRatio: "267 / 285" }}
              />
            </div>
          </Parallax>
        </figure>
      </Container>

      <Container>
        <HeroStats tiles={statTiles()} />
      </Container>
    </section>
  );
}
