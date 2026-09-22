import { compact, experience, isBlank } from "@/lib/content";
import { Badge } from "./Badge";
import { EmptyNote, Field } from "./Placeholder";
import { Section } from "./Section";
import { Timeline, TimelineItem, TimelineMeta } from "./Timeline";

/** Small diamond bullets; achievements use the cooler colour. */
function BulletList({ items, tone }: { items: string[]; tone: "accent" | "muted" }) {
  return (
    <ul className="mt-2.5">
      {items.map((item, i) => (
        <li
          key={i}
          className={`relative mb-[5px] pl-[18px] text-[0.98rem] text-ink-700 before:absolute before:top-[0.7em] before:left-0.5 before:size-1.5 before:rotate-45 before:content-[''] ${
            tone === "accent" ? "before:bg-maroon-500" : "before:bg-steel-600"
          }`}
        >
          <Field value={item} />
        </li>
      ))}
    </ul>
  );
}

export function ExperienceSection() {
  return (
    <Section id="experience" kicker="Career" title="Experience">
      {experience.length === 0 ? (
        <EmptyNote />
      ) : (
        <Timeline>
          {experience.map((role, i) => {
            const dates = [role.startDate, role.endDate].filter((d) => !isBlank(d));
            const subtitle = [role.department, role.location].filter((d) => !isBlank(d)).join(" · ");
            const responsibilities = compact(role.responsibilities);
            const achievements = compact(role.achievements);

            return (
              <TimelineItem key={`${role.title}-${i}`} current={role.current}>
                <TimelineMeta
                  date={
                    dates.length > 0 ? (
                      dates.map((d, di) => (
                        <span key={di}>
                          {di > 0 && " – "}
                          <Field value={d} />
                        </span>
                      ))
                    ) : (
                      <Field value="" />
                    )
                  }
                  badge={role.current ? <Badge variant="accent">Current</Badge> : undefined}
                />
                <h3 className="mb-1 text-[1.2rem]">
                  <Field value={role.title} />
                </h3>
                <p className="mb-1.5 font-semibold text-steel-700">
                  <Field value={role.organization} />
                </p>
                {subtitle && <p className="m-0 text-[0.98rem] text-ink-700">{subtitle}</p>}
                {responsibilities.length > 0 && (
                  <BulletList items={responsibilities} tone="accent" />
                )}
                {achievements.length > 0 && <BulletList items={achievements} tone="muted" />}
              </TimelineItem>
            );
          })}
        </Timeline>
      )}
    </Section>
  );
}
