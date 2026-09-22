import { certifications } from "@/lib/content";
import { Icon } from "./Icon";
import { EmptyNote, Field } from "./Placeholder";
import { StaggerGroup, StaggerItem } from "./motion/Stagger";
import { Section } from "./Section";

export function CertificationsSection() {
  return (
    <Section id="certifications" kicker="Credentials & training" title="Certifications">
      {certifications.length === 0 ? (
        <EmptyNote />
      ) : (
        <StaggerGroup as="ul" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert, i) => (
            <StaggerItem
              as="li"
              key={`${cert.title}-${i}`}
              whileHover={{ y: -4 }}
              className="flex items-start gap-4 rounded-[18px] border border-line bg-mist-50 p-5 transition-shadow hover:shadow-lift"
            >
              <span className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-accent text-white">
                <Icon name="cert" className="size-5" />
              </span>
              <div>
                <h3 className="mb-0.5 font-sans text-base font-semibold">
                  <Field value={cert.title} />
                </h3>
                <p className="m-0 text-[0.9rem] text-ink-500">
                  <Field value={cert.issuer} />
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </Section>
  );
}
