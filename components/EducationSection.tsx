import { education, isBlank } from "@/lib/content";
import { EmptyNote, Field } from "./Placeholder";
import { Section } from "./Section";
import { Timeline, TimelineItem, TimelineMeta } from "./Timeline";

export function EducationSection() {
  return (
    <Section id="education" kicker="Qualifications" title="Academic Profile">
      {education.length === 0 ? (
        <EmptyNote />
      ) : (
        <Timeline>
          {education.map((entry, i) => (
            <TimelineItem key={`${entry.degree}-${i}`}>
              <TimelineMeta date={<Field value={entry.year} />} />
              <h3 className="mb-1 text-[1.2rem]">
                <Field value={entry.degree} />
              </h3>
              <p className="mb-1.5 font-semibold text-steel-700">
                <Field value={entry.institution} />
              </p>
              {!isBlank(entry.specialization) && (
                <p className="m-0 text-[0.98rem] text-ink-700">
                  <Field value={entry.specialization} />
                </p>
              )}
              {!isBlank(entry.link) && (
                <a
                  href={entry.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[0.92rem] font-semibold"
                >
                  Read the thesis
                </a>
              )}
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Section>
  );
}
