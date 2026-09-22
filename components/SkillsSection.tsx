import { compact, skills } from "@/lib/content";
import type { Skills } from "@/lib/types";
import { EmptyNote, Field } from "./Placeholder";
import { StaggerGroup, StaggerItem } from "./motion/Stagger";
import { Section } from "./Section";

const GROUPS: ReadonlyArray<[keyof Skills, string]> = [
  ["research", "Research"],
  ["technical", "Technical"],
  ["teaching", "Teaching & Supervision"],
  ["professional", "Professional"],
];

export function SkillsSection() {
  return (
    <Section id="skills" tint kicker="Capabilities" title="Skills & Expertise">
      <StaggerGroup className="grid grid-cols-1 gap-5.5 cards:grid-cols-2 quad:grid-cols-4">
        {GROUPS.map(([key, label]) => {
          const items = compact(skills[key]);
          return (
            <StaggerItem
              key={key}
              className="relative overflow-hidden rounded-[18px] border border-line bg-white p-6 shadow-card before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-accent before:content-['']"
            >
              <h3 className="mb-3.5 text-[1.1rem]">{label}</h3>
              {items.length === 0 ? (
                <EmptyNote />
              ) : (
                <ul>
                  {items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-baseline gap-2.5 border-b border-mist-200 py-1.5 text-[0.96rem] text-ink-700 last:border-b-0"
                    >
                      <span className="size-[7px] shrink-0 -translate-y-px rounded-full bg-accent" />
                      <span>
                        <Field value={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </Section>
  );
}
