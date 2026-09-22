import { About } from "@/components/About";
import { Assistant } from "@/components/Assistant";
import { AwardsSection } from "@/components/AwardsSection";
import { BackToTop } from "@/components/BackToTop";
import { CertificationsSection } from "@/components/CertificationsSection";
import { ContactSection } from "@/components/ContactSection";
import { EducationSection } from "@/components/EducationSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { Hero } from "@/components/Hero";
import { ProjectsSection } from "@/components/ProjectsSection";
import { PublicationsSection } from "@/components/PublicationsSection";
import { ResearchSection } from "@/components/ResearchSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SkillsSection } from "@/components/SkillsSection";
import { SocialRail } from "@/components/SocialRail";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <About />
        <EducationSection />
        <ResearchSection />
        <PublicationsSection />
        <ProjectsSection />
        <ExperienceSection />
        <AwardsSection />
        <CertificationsSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <SiteFooter />
      <SocialRail />
      <BackToTop />
      <Assistant />
    </>
  );
}
