import { isBlank, profile } from "@/lib/content";
import { Icon } from "./Icon";
import { Container } from "./Section";
import { SocialLinks } from "./SocialLinks";

export function SiteFooter() {
  const parts = [profile.fullName, profile.institution].filter((p) => !isBlank(p));

  return (
    <footer className="on-dark relative bg-dark-wash pt-9 pb-26 text-[0.92rem] text-white/70 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-accent before:content-[''] min-[800px]:pb-9">
      <Container className="flex flex-col items-start gap-4 min-[800px]:flex-row min-[800px]:items-center min-[800px]:justify-between quad:gap-8">
        <p className="m-0 quad:flex-1">
          © {new Date().getFullYear()} {parts.join(" · ")}
        </p>
        <div className="flex flex-wrap items-center gap-2.5 quad:flex-nowrap">
          <SocialLinks compactSize />
          <a
            href="/admin/"
            rel="nofollow"
            title="Edit website content (login required)"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-3.5 text-[0.88rem] font-semibold text-white no-underline shadow-glow transition-[filter] hover:text-white hover:brightness-110"
          >
            <Icon name="lock" className="size-4" />
            <span>Admin</span>
          </a>
        </div>
      </Container>
    </footer>
  );
}
