import { compact, profile } from "@/lib/content";
import { Field } from "./Placeholder";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function About() {
  const facts: Array<[string, string]> = [
    ["Designation", profile.designation],
    ["Department", profile.department],
    ["Institution", profile.institution],
    ["Location", profile.location],
    ["Qualifications", profile.credentials],
    ["Languages", profile.languages],
  ];

  return (
    <Section id="about" tint kicker="Biography" title="About">
      <Reveal className="grid grid-cols-1 gap-8 wide:grid-cols-[1.7fr_1fr] wide:gap-14">
        <div className="[&_p]:mb-4 [&_p]:text-ink-700 [&_p]:max-[599px]:text-left wide:[&_p]:text-justify wide:[&_p]:hyphens-auto">
          {compact(profile.biography).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <aside
          aria-label="Key facts"
          className="relative self-start overflow-hidden rounded-[18px] border border-line bg-white p-6 shadow-card before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-accent before:content-['']"
        >
          <dl className="grid gap-3.5">
            {facts.map(([term, value]) => (
              <div key={term}>
                <dt className="text-[0.76rem] font-semibold tracking-[0.1em] text-ink-500 uppercase">
                  {term}
                </dt>
                <dd className="mt-0.5 font-medium break-words text-ink-900">
                  <Field value={value} />
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </Reveal>
    </Section>
  );
}
