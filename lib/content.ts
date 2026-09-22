import awardsJson from "@/content/awards.json";
import certificationsJson from "@/content/certifications.json";
import educationJson from "@/content/education.json";
import experienceJson from "@/content/experience.json";
import profileJson from "@/content/profile.json";
import publicationsJson from "@/content/publications.json";
import projectsJson from "@/content/projects.json";
import researchJson from "@/content/research.json";
import skillsJson from "@/content/skills.json";

import type {
  Award,
  Certification,
  Education,
  Experience,
  Profile,
  Project,
  Publication,
  PublicationStats,
  ResearchArea,
  Skills,
} from "./types";
import { PLACEHOLDER } from "./types";

/*
 * The JSON is authored by the admin panel, so it is cast rather than parsed.
 * List files wrap their array in `items` because Decap CMS file collections
 * read fields off a root object and cannot bind to a bare array.
 */
export const profile = profileJson as Profile;
export const education = educationJson.items as Education[];
export const experience = experienceJson.items as Experience[];
export const researchAreas = researchJson.items as ResearchArea[];
export const publications = publicationsJson.items as Publication[];
export const publicationStats = publicationsJson.stats as PublicationStats;
export const projects = projectsJson.items as Project[];
export const awards = awardsJson.items as Award[];
export const certifications = certificationsJson.items as Certification[];
export const skills = skillsJson as Skills;

/* ---------- small helpers shared by the section components ---------- */

export function isBlank(value: unknown): boolean {
  return value == null || String(value).trim() === "";
}

/** True when a field is empty or still carries the "to be added" marker. */
export function isPlaceholder(value: unknown): boolean {
  return isBlank(value) || String(value).trim() === PLACEHOLDER;
}

/** Drops empty entries so an unfinished list renders as absent, not as blanks. */
export function compact(value: string[] | undefined | null): string[] {
  return Array.isArray(value) ? value.filter((item) => !isBlank(item)) : [];
}

/** content JSON stores "assets/…"; the static export serves it from the root. */
export function assetPath(src: string): string {
  if (isBlank(src)) return "";
  if (/^https?:/i.test(src)) return src;
  return src.startsWith("/") ? src : `/${src}`;
}

export const siteUrl = profile.seo.siteUrl.replace(/\/+$/, "");

const publicationIds = new Set(publications.map((p) => p.id));

/** How many of an area's linked papers actually exist in publications.json. */
export function areaPublicationCount(area: ResearchArea): number {
  return compact(area.relatedPublicationIds).filter((id) => publicationIds.has(id)).length;
}

export function hasPublication(id: string): boolean {
  return publicationIds.has(id);
}

/** Newest first; publications with an unknown year sort last. */
export const publicationsByYear: Publication[] = [...publications].sort(
  (a, b) => (b.year ?? -1) - (a.year ?? -1),
);

export function publicationType(p: Publication): Publication["type"] {
  return p.type === "journal" || p.type === "conference" ? p.type : "other";
}
