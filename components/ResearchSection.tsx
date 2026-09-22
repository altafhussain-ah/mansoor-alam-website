import { areaPublicationCount, compact, researchAreas } from "@/lib/content";
import { Card, CardGrid, CardIcon } from "./Card";
import { Icon, type IconName } from "./Icon";
import { EmptyNote, Field } from "./Placeholder";
import { ResearchChart } from "./ResearchChart";
import { Section } from "./Section";

export function ResearchSection() {
  if (researchAreas.length === 0) {
    return (
      <Section id="research" tint kicker="Areas of inquiry" title="Research">
        <EmptyNote />
      </Section>
    );
  }

  const rows = researchAreas.map((area) => ({
    label: area.title,
    value: areaPublicationCount(area),
  }));

  return (
    <Section id="research" tint kicker="Areas of inquiry" title="Research">
      <CardGrid columns={3}>
        {researchAreas.map((area) => {
          const count = areaPublicationCount(area);
          return (
            <Card key={area.title}>
              <CardIcon>
                <Icon name={area.icon as IconName} className="size-6" />
              </CardIcon>
              <h3 className="mb-2.5 text-[1.18rem]">
                <Field value={area.title} />
              </h3>
              <p className="text-ink-700">
                <Field value={area.description} />
              </p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                {compact(area.keywords).map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-line bg-white px-2.5 py-[3px] text-[0.8rem] text-ink-700"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              {count > 0 && (
                <p className="mt-3 text-[0.86rem] font-semibold text-maroon-600">
                  {count} listed publication{count === 1 ? "" : "s"}
                </p>
              )}
            </Card>
          );
        })}
      </CardGrid>

      <ResearchChart rows={rows} />
    </Section>
  );
}
