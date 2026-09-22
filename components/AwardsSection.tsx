import { awards, isBlank } from "@/lib/content";
import { Card, CardGrid } from "./Card";
import { EmptyNote, Field, PlaceholderTag } from "./Placeholder";
import { Section } from "./Section";

export function AwardsSection() {
  return (
    <Section id="awards" tint kicker="Recognition" title="Awards & Achievements">
      {awards.length === 0 ? (
        <EmptyNote />
      ) : (
        <CardGrid columns={3}>
          {awards.map((award, i) => (
            <Card key={`${award.title}-${i}`}>
              {isBlank(award.year) ? (
                <div className="mb-3 text-[0.9rem]">
                  <PlaceholderTag />
                </div>
              ) : (
                <div className="text-accent-gradient mb-3 font-serif text-[1.5rem] leading-none font-bold">
                  {award.year}
                </div>
              )}
              <h3 className="mb-2.5 text-[1.18rem]">
                <Field value={award.title} />
              </h3>
              <p className="mb-2 text-[0.95rem] font-semibold text-steel-700">
                <Field value={award.organization} />
              </p>
              {!isBlank(award.description) && (
                <p className="text-ink-700">
                  <Field value={award.description} />
                </p>
              )}
            </Card>
          ))}
        </CardGrid>
      )}
    </Section>
  );
}
