import { hasPublication, isPlaceholder, compact, projects } from "@/lib/content";
import { Badge } from "./Badge";
import { Card, CardGrid } from "./Card";
import { EmptyNote, Field } from "./Placeholder";
import { Section } from "./Section";

export function ProjectsSection() {
  return (
    <Section id="projects" tint kicker="Funded & doctoral research" title="Projects">
      {projects.length === 0 ? (
        <EmptyNote />
      ) : (
        <CardGrid>
          {projects.map((project, i) => {
            const rows: Array<[string, string]> = [
              ["Role", project.role],
              ["Funding", project.fundingOrganization],
              ["Duration", project.duration],
              ["Area", project.researchArea],
              ["Collaborators", project.collaborators],
            ];
            const outputs = compact(project.relatedOutputs).filter(hasPublication);

            return (
              <Card key={`${project.title}-${i}`}>
                <div className="mb-2.5 flex items-start justify-between gap-3">
                  <h3 className="text-[1.18rem]">
                    <Field value={project.title} />
                  </h3>
                  {!isPlaceholder(project.status) && <Badge>{project.status}</Badge>}
                </div>
                <p className="text-ink-700">
                  <Field value={project.description} />
                </p>
                <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1.5 text-[0.94rem]">
                  {rows.map(([term, value]) => (
                    <div key={term} className="contents">
                      <dt className="font-semibold text-ink-500">{term}</dt>
                      <dd className="m-0 break-words text-ink-900">
                        <Field value={value} />
                      </dd>
                    </div>
                  ))}
                  {outputs.length > 0 && (
                    <div className="contents">
                      <dt className="font-semibold text-ink-500">Outputs</dt>
                      <dd className="m-0 break-words text-ink-900">
                        {outputs.map((id, oi) => (
                          <span key={id}>
                            {oi > 0 && ", "}
                            <a href="#publications">{id.toUpperCase()}</a>
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </Card>
            );
          })}
        </CardGrid>
      )}
    </Section>
  );
}
