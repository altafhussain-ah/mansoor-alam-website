/**
 * Shapes of the JSON in /content. These mirror what the admin panel
 * (Decap CMS) writes, so changing a field here means changing
 * public/admin/config.yml too.
 */

export const PLACEHOLDER = "[Information to be added]";

export type SocialKey =
  | "googleScholar"
  | "orcid"
  | "scopus"
  | "researchGate"
  | "dblp"
  | "universityProfile"
  | "academiaEdu"
  | "linkedin"
  | "github";

export interface HeroButton {
  label: string;
  href: string;
}

export interface Profile {
  fullName: string;
  shortName: string;
  credentials: string;
  headline: string;
  designation: string;
  department: string;
  institution: string;
  location: string;
  languages: string;
  introduction: string;
  biography: string[];
  heroButtons: { primary: HeroButton; secondary: HeroButton };
  photo: { src: string; alt: string; isPlaceholder: boolean };
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
    siteUrl: string;
  };
  contact: { email: string; institutionAddress: string; office: string };
  socialLinks: Record<SocialKey, string>;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  specialization: string;
  link: string;
}

export interface Experience {
  current?: boolean;
  title: string;
  organization: string;
  department: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
  achievements: string[];
}

export type ResearchIcon = "brain" | "code" | "eye" | "chip" | "compass";

export interface ResearchArea {
  icon: ResearchIcon;
  title: string;
  description: string;
  keywords: string[];
  relatedPublicationIds: string[];
}

export type PublicationType = "journal" | "conference" | "other";

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  /** null when the year is unknown. */
  year: number | null;
  type: PublicationType;
  /** Bare DOI, without the https://doi.org/ prefix. */
  doi: string;
  link: string;
  indexing: string;
  /** Non-empty renders a red tag, e.g. "Retracted". */
  notice: string;
  abstract: string;
}

export interface PublicationStats {
  totalPublications: number | null;
  totalJournalArticles: number | null;
  totalConferencePapers: number | null;
  totalCitations: number | null;
  hIndex: number | null;
  i10Index: number | null;
  asOf: string;
  sourceNote: string;
}

export interface Project {
  title: string;
  description: string;
  role: string;
  fundingOrganization: string;
  collaborators: string;
  duration: string;
  researchArea: string;
  status: string;
  relatedOutputs: string[];
}

export interface Award {
  title: string;
  organization: string;
  year: string;
  description: string;
}

export interface Certification {
  title: string;
  issuer: string;
}

export interface Skills {
  research: string[];
  technical: string[];
  teaching: string[];
  professional: string[];
}
