/**
 * The "Ask me" assistant's brain.
 *
 * It answers only from the JSON in /content — no AI service, no network call,
 * no cost. Update the content and the answers follow automatically.
 *
 * Replies are HTML strings assembled here and escaped at every interpolation,
 * so the panel can render them directly.
 */
import {
  awards,
  certifications,
  education,
  experience,
  profile,
  projects,
  publicationStats,
  publications,
  researchAreas,
  skills,
} from "./content";
import { PLACEHOLDER } from "./types";

const NAME = profile.shortName || profile.fullName || "the professor";
const SURNAME = (profile.shortName || "").split(" ").slice(-1)[0] || NAME;
export const HONORIFIC = /Prof/i.test(profile.fullName || "") ? `Prof. ${SURNAME}` : NAME;

/* ---------- text helpers ---------- */

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A value that is present and not the "to be added" marker. */
function known(value: unknown): boolean {
  return value != null && String(value).trim() !== "" && !String(value).includes(PLACEHOLDER);
}

/** Strips "[Information to be added]" out of otherwise usable prose. */
function clean(value: unknown): string {
  return String(value ?? "")
    .replace(/\s*[—–-]?\s*(project title)?\s*\[Information to be added\]\s*/gi, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();
}

const STOP_WORDS = new Set(
  "a an the of in on at to for and or is are was were be been by with about from as it its this that these those what which who whom whose how when where why do does did can could would should will has have had he his him she her they their them me my i you your prof professor dr doctor mansoor alam muhammad sir please tell show give list any some all more much many there here also get find know want need like".split(
    " ",
  ),
);

/** Crude suffix stripping — enough to match "networks" with "network". */
function stem(word: string): string {
  if (word.length > 5 && /ies$/.test(word)) return `${word.slice(0, -3)}y`;
  if (word.length > 5 && /ing$/.test(word)) return word.slice(0, -3);
  if (word.length > 4 && /ed$/.test(word)) return word.slice(0, -2);
  if (word.length > 3 && /s$/.test(word) && !/ss$/.test(word)) return word.slice(0, -1);
  return word;
}

/** Acronyms expanded to the words actually used in the content. */
const SYNONYMS: Record<string, string> = {
  ai: "artificial intelligence",
  ml: "machine learning",
  dl: "deep learning",
  iot: "internet things iot",
  sdn: "software defined networking sdn",
  nlp: "sentiment text language",
  cnn: "convolutional neural network",
  "5g": "5g network",
  uav: "uav drone aerial",
  xai: "explainable artificial intelligence",
  gsd: "global software development",
};

function tokenize(text: string): string[] {
  const normalised = String(text ?? "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ");

  const out: string[] = [];
  for (const word of normalised.split(/[\s-]+/)) {
    if (!word) continue;
    if (SYNONYMS[word]) {
      for (const part of SYNONYMS[word].split(" ")) out.push(stem(part));
      continue;
    }
    if (STOP_WORDS.has(word) || word.length < 2) continue;
    out.push(stem(word));
  }
  return out;
}

/* ---------- knowledge index ---------- */

type DocKind = "pub" | "research" | "project" | "exp" | "edu" | "award" | "cert";

interface IndexedDoc {
  kind: DocKind;
  // Heterogeneous by design — each kind is narrowed at its use site.
  item: Record<string, unknown>;
  tokens: string[];
}

const DOCS: IndexedDoc[] = [];

function addDoc(kind: DocKind, text: string, item: unknown) {
  DOCS.push({ kind, item: item as Record<string, unknown>, tokens: tokenize(text) });
}

for (const p of publications) addDoc("pub", [p.title, p.venue, p.indexing].join(" "), p);
for (const r of researchAreas) {
  addDoc("research", [r.title, r.description, (r.keywords ?? []).join(" ")].join(" "), r);
}
for (const p of projects) {
  addDoc("project", [p.title, p.description, p.fundingOrganization, p.researchArea].join(" "), p);
}
for (const e of experience) {
  addDoc(
    "exp",
    [e.title, e.organization, e.department, e.location, (e.responsibilities ?? []).join(" ")].join(
      " ",
    ),
    e,
  );
}
for (const e of education) addDoc("edu", [e.degree, e.institution, e.specialization].join(" "), e);
for (const a of awards) addDoc("award", [a.title, a.organization, a.description].join(" "), a);
for (const c of certifications) addDoc("cert", [c.title, c.issuer].join(" "), c);

/** Document frequency, for inverse-document-frequency weighting. */
const DF = new Map<string, number>();
for (const doc of DOCS) {
  for (const token of new Set(doc.tokens)) DF.set(token, (DF.get(token) ?? 0) + 1);
}

function scoreDoc(queryTokens: string[], doc: IndexedDoc): number {
  let score = 0;
  let hits = 0;
  for (const token of queryTokens) {
    if (!doc.tokens.includes(token)) continue;
    score += Math.log(1 + DOCS.length / (DF.get(token) ?? 1));
    hits += 1;
  }
  // Reward matching a larger share of the question.
  return hits ? score * (hits / queryTokens.length + 0.5) : 0;
}

interface Hit {
  doc: IndexedDoc;
  score: number;
}

function search(query: string, kinds: DocKind[] | null, limit = 5): Hit[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];
  return DOCS.filter((d) => !kinds || kinds.includes(d.kind))
    .map((doc) => ({ doc, score: scoreDoc(queryTokens, doc) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/* ---------- reply fragments ---------- */

/** A button the panel turns into a scroll-to-section action. */
function jump(section: string, label: string): string {
  return `<button type="button" class="ai-jump" data-jump="${section}">${esc(label)} →</button>`;
}

function ul(items: string[]): string {
  return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
}

function pubLine(p: (typeof publications)[number]): string {
  const year = typeof p.year === "number" ? `${p.year} · ` : "";
  const doi = known(p.doi)
    ? ` <a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener noreferrer">DOI</a>`
    : "";
  const notice = known(p.notice) ? ` <span class="ai-note">(${esc(p.notice)})</span>` : "";
  return `<strong>${esc(p.title)}</strong><br><span class="ai-muted">${year}${esc(p.venue)}</span>${doi}${notice}`;
}

function fmt(n: unknown): string | null {
  return typeof n === "number" && Number.isFinite(n) ? n.toLocaleString("en-US") : null;
}

function currentRole() {
  return experience.find((e) => e.current) ?? experience[0];
}

/* ---------- answers ---------- */

const A = {
  greet: () =>
    `Hello! I'm the site assistant for <strong>${esc(profile.fullName || NAME)}</strong>. Ask me about his research, publications, education, career, awards or how to get in touch.`,

  thanks: () => "You're welcome! Anything else you'd like to know?",

  help: () =>
    "I can answer questions using the information on this website, for example:" +
    ul([
      `Who is ${esc(HONORIFIC)}?`,
      "What are his research areas?",
      "Papers on machine learning / IoT / computer vision",
      "Publications from 2024",
      "Citations and h-index",
      "Where did he do his PhD?",
      "How can I contact him?",
    ]),

  about: () => {
    const bio = profile.biography.filter(known)[0] || profile.introduction || "";
    return `${esc(clean(bio))}<br>${jump("about", "Read the full biography")}`;
  },

  position: () => {
    const role = currentRole();
    let out =
      `<strong>${esc(profile.fullName || NAME)}</strong> is ` +
      esc(profile.designation || role?.title || "") +
      (known(profile.department) ? `, ${esc(profile.department)}` : "") +
      (known(profile.institution) ? `, ${esc(profile.institution)}` : "") +
      (known(profile.location) ? ` (${esc(profile.location)})` : "") +
      ".";
    const concurrent = experience.filter((e) => /present/i.test(e.endDate || "") && !e.current);
    if (concurrent.length > 0) {
      out +=
        "<br>He also currently holds:" +
        ul(concurrent.map((e) => `${esc(e.title)}, ${esc(e.organization)}`));
    }
    return out + jump("experience", "See full career");
  },

  contact: () => {
    const c = profile.contact;
    const rows: string[] = [];
    if (known(c.email)) {
      rows.push(`Email: <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`);
    }
    if (known(c.institutionAddress)) rows.push(`Address: ${esc(c.institutionAddress)}`);
    if (known(c.office)) rows.push(`Office: ${esc(c.office)}`);
    return (
      (rows.length > 0
        ? `You can reach him here:${ul(rows)}`
        : "Contact details haven't been added yet.") + jump("contact", "Open the contact form")
    );
  },

  education: (query: string) => {
    let items = education;
    let filter: RegExp | null = null;
    if (/post\s*-?doc/i.test(query)) filter = /post/i;
    else if (/ph\.?\s?d|doctor/i.test(query)) filter = /ph\.?d/i;
    else if (/\bms\b|master|m\.?sc|mphil/i.test(query)) filter = /^(ms|m\.sc|mphil)/i;
    else if (/b\.?sc|bachelor|undergrad/i.test(query)) filter = /^b\.?sc/i;

    if (filter) {
      const pattern = filter;
      const subset = education.filter((e) => pattern.test(e.degree));
      if (subset.length > 0) items = subset;
    }

    return (
      (items === education ? "His academic qualifications:" : "Here's what I found:") +
      ul(
        items.map(
          (e) =>
            `<strong>${esc(e.degree)}</strong> — ${esc(e.institution)}` +
            (known(e.year) ? ` (${esc(e.year)})` : "") +
            (known(e.specialization)
              ? `<br><span class="ai-muted">${esc(e.specialization)}</span>`
              : ""),
        ),
      ) +
      jump("education", "View academic profile")
    );
  },

  experience: (query: string) => {
    const hits = search(query, ["exp"], 3).filter((h) => h.score > 1.5);
    const isSpecific = tokenize(query).some(
      (t) => !/^(experience|career|work|job|position|role|past|previou|history)$/.test(t),
    );

    if (hits.length > 0 && isSpecific) {
      return (
        ul(
          hits.map((h) => {
            const e = h.doc.item as unknown as (typeof experience)[number];
            const responsibilities = (e.responsibilities ?? []).filter(known);
            return (
              `<strong>${esc(e.title)}</strong>, ${esc(e.organization)} ` +
              `<span class="ai-muted">(${esc([e.startDate, e.endDate].filter(known).join(" – "))})</span>` +
              (responsibilities.length > 0 ? ul(responsibilities.slice(0, 4).map(esc)) : "")
            );
          }),
        ) + jump("experience", "See full career")
      );
    }

    return (
      "His career so far:" +
      ul(
        experience
          .filter((e) => known(e.title) || known(e.organization))
          .slice(0, 8)
          .map(
            (e) =>
              `${esc(clean(e.title) || "Role")}, ${esc(e.organization)} ` +
              `<span class="ai-muted">(${esc([e.startDate, e.endDate].filter(known).join(" – "))})</span>`,
          ),
      ) +
      jump("experience", "See full career")
    );
  },

  leadership: (): string | null => {
    const rows: string[] = [];
    for (const e of experience) {
      for (const r of e.responsibilities ?? []) {
        if (/dean|head|hod|director|chair|coordinator|cluster|editor/i.test(r)) {
          rows.push(`${esc(r)} <span class="ai-muted">— ${esc(e.organization)}</span>`);
        }
      }
    }
    if (rows.length === 0) return null;
    return (
      `Leadership and service roles:${ul(rows.slice(0, 10))}` + jump("experience", "See full career")
    );
  },

  research: () =>
    "His main research areas:" +
    ul(
      researchAreas.map(
        (r) =>
          `<strong>${esc(r.title)}</strong>` +
          ((r.keywords ?? []).length > 0
            ? `<br><span class="ai-muted">${esc(r.keywords.join(", "))}</span>`
            : ""),
      ),
    ) +
    jump("research", "Explore research"),

  metrics: () => {
    const s = publicationStats;
    const rows: string[] = [];
    if (fmt(s.totalPublications)) rows.push(`Publications: <strong>${fmt(s.totalPublications)}</strong>`);
    if (fmt(s.totalCitations)) rows.push(`Citations: <strong>${fmt(s.totalCitations)}</strong>`);
    if (fmt(s.hIndex)) rows.push(`h-index: <strong>${fmt(s.hIndex)}</strong>`);
    if (fmt(s.i10Index)) rows.push(`i10-index: <strong>${fmt(s.i10Index)}</strong>`);

    const scholar = profile.socialLinks.googleScholar;
    return (
      `Research metrics${known(s.asOf) ? ` (as of ${esc(s.asOf)})` : ""}:` +
      ul(rows) +
      `<span class="ai-muted">${esc(clean(s.sourceNote))}</span>` +
      (known(scholar)
        ? `<br><a href="${esc(scholar)}" target="_blank" rel="noopener noreferrer">Google Scholar profile</a>`
        : "")
    );
  },

  pubYear: (year: number) => {
    const list = publications.filter((p) => p.year === year);
    if (list.length === 0) {
      return (
        `I couldn't find publications from ${year} among the ${publications.length} listed on this site.` +
        jump("publications", "Browse all publications")
      );
    }
    return (
      `<strong>${list.length}</strong> listed publication${list.length > 1 ? "s" : ""} from ${year}:` +
      ul(list.slice(0, 6).map(pubLine)) +
      (list.length > 6
        ? `<span class="ai-muted">…and ${list.length - 6} more.</span><br>`
        : "") +
      jump("publications", "See all publications")
    );
  },

  pubLatest: () => {
    const list = publications
      .filter((p) => typeof p.year === "number")
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    return (
      "His most recent listed publications:" +
      ul(list.slice(0, 5).map(pubLine)) +
      jump("publications", "See all publications")
    );
  },

  pubCount: () => {
    const total = fmt(publicationStats.totalPublications);
    return (
      (total
        ? `He has <strong>${total}</strong> publications in total` +
          (known(publicationStats.asOf) ? ` (as of ${esc(publicationStats.asOf)})` : "") +
          ". "
        : "") +
      `This website lists <strong>${publications.length}</strong> selected journal articles.` +
      jump("publications", "Browse publications")
    );
  },

  pubTopic: (query: string): string | null => {
    const topic = query
      .replace(
        /\b(papers?|publications?|articles?|research|work|works|published|publish|journals?|on|about|in|related|to|regarding|any|his|he|has|did|written|write|wrote|show|list|find|me)\b/gi,
        " ",
      )
      .trim();
    const hits = search(topic || query, ["pub"], 60).filter((h) => h.score > 1.2);
    if (hits.length === 0) return null;

    const top = hits.slice(0, 5).map((h) => h.doc.item as unknown as (typeof publications)[number]);
    return (
      `I found <strong>${hits.length}</strong> related publication${hits.length > 1 ? "s" : ""}. Top matches:` +
      ul(top.map(pubLine)) +
      `<button type="button" class="ai-jump" data-pubsearch="${esc(topic || query)}">Show these in Publications →</button>`
    );
  },

  retracted: () => {
    const list = publications.filter((p) => /retract/i.test(p.notice || ""));
    return list.length > 0
      ? `These listed publications carry a retraction notice:${ul(list.map(pubLine))}`
      : "None of the listed publications carry a retraction notice.";
  },

  awards: () =>
    "Awards and achievements:" +
    ul(
      awards.map(
        (a) =>
          `<strong>${esc(a.title)}</strong>` +
          (known(a.organization) ? ` — ${esc(a.organization)}` : "") +
          (known(a.year) ? ` <span class="ai-muted">(${esc(a.year)})</span>` : ""),
      ),
    ) +
    jump("awards", "View awards"),

  funding: () => {
    const funded = projects.filter((p) => known(p.fundingOrganization) || /grant/i.test(p.title));
    const rows = funded.map(
      (p) =>
        `<strong>${esc(clean(p.title))}</strong>` +
        (known(p.fundingOrganization) ? ` — ${esc(p.fundingOrganization)}` : "") +
        (known(p.duration) ? ` <span class="ai-muted">(${esc(clean(p.duration))})</span>` : ""),
    );

    for (const a of awards.filter((a) => /grant|scholarship|funding/i.test(a.title))) {
      if (funded.some((p) => p.title.includes(a.title))) continue;
      rows.push(
        `<strong>${esc(a.title)}</strong> — ${esc(a.organization)}` +
          (known(a.year) ? ` <span class="ai-muted">(${esc(a.year)})</span>` : ""),
      );
    }

    return `Research funding and grants:${ul(rows)}${jump("projects", "View projects")}`;
  },

  projects: () =>
    "Research projects:" +
    ul(
      projects.map(
        (p) =>
          `<strong>${esc(clean(p.title))}</strong>` +
          (known(p.status) ? ` <span class="ai-muted">(${esc(p.status)})</span>` : ""),
      ),
    ) +
    jump("projects", "View projects"),

  certs: () =>
    "Certifications and training:" +
    ul(
      certifications.map(
        (c) =>
          esc(c.title) + (known(c.issuer) ? ` <span class="ai-muted">— ${esc(c.issuer)}</span>` : ""),
      ),
    ) +
    jump("certifications", "View certifications"),

  skills: () => {
    const groups: Array<[string, string[]]> = [
      ["Research", skills.research],
      ["Technical", skills.technical],
      ["Teaching & supervision", skills.teaching],
      ["Professional", skills.professional],
    ];
    return (
      groups
        .filter(([, items]) => (items ?? []).length > 0)
        .map(([label, items]) => `<strong>${label}:</strong> ${esc(items.join(", "))}`)
        .join("<br>") +
      "<br>" +
      jump("skills", "View skills")
    );
  },

  supervision: (): string => {
    const rows: string[] = [];
    for (const t of skills.teaching ?? []) {
      if (/supervis/i.test(t)) rows.push(esc(t));
    }
    for (const e of experience) {
      for (const r of e.responsibilities ?? []) {
        if (/supervis/i.test(r) && known(r)) {
          rows.push(`${esc(r)} <span class="ai-muted">— ${esc(e.organization)}</span>`);
        }
      }
    }
    let out = rows.length > 0 ? `Supervision:${ul(rows)}` : "";
    const email = profile.contact.email;
    if (known(email)) {
      out += `Prospective students can write to <a href="mailto:${esc(email)}">${esc(email)}</a>.`;
    }
    return out;
  },

  cv: () => {
    const email = profile.contact.email;
    return (
      "The CV isn't available for download on this website. Most of its content — education, career, research, publications and awards — is shown on this page." +
      (known(email)
        ? ` For a copy, please email <a href="mailto:${esc(email)}">${esc(email)}</a>.`
        : "")
    );
  },

  profiles: (): string | null => {
    const names: Record<string, string> = {
      googleScholar: "Google Scholar",
      orcid: "ORCID",
      scopus: "Scopus",
      researchGate: "ResearchGate",
      universityProfile: "University profile",
      linkedin: "LinkedIn",
      dblp: "dblp",
      github: "GitHub",
      academiaEdu: "Academia.edu",
    };
    const rows = Object.entries(names)
      .filter(([key]) => known(profile.socialLinks[key as keyof typeof profile.socialLinks]))
      .map(([key, label]) => {
        const href = profile.socialLinks[key as keyof typeof profile.socialLinks];
        return `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      });
    return rows.length > 0 ? `His academic profiles:${ul(rows)}` : null;
  },

  fallback: (query: string) => {
    const hits = search(query, null, 4).filter((h) => h.score > 1.2);
    if (hits.length > 0) {
      const labels: Record<DocKind, string> = {
        pub: "Publication",
        research: "Research area",
        project: "Project",
        exp: "Experience",
        edu: "Education",
        award: "Award",
        cert: "Certification",
      };
      return (
        "Here's what I found on the site:" +
        ul(
          hits.map((h) => {
            if (h.doc.kind === "pub") {
              return pubLine(h.doc.item as unknown as (typeof publications)[number]);
            }
            const item = h.doc.item;
            const title = (item.title as string) || (item.degree as string) || "";
            const sub =
              (item.organization as string) ||
              (item.institution as string) ||
              (item.issuer as string) ||
              (item.fundingOrganization as string) ||
              "";
            return (
              `<span class="ai-muted">${labels[h.doc.kind]}:</span> <strong>${esc(clean(title))}</strong>` +
              (known(sub) ? ` — ${esc(sub)}` : "")
            );
          }),
        )
      );
    }

    const email = profile.contact.email;
    return (
      "Sorry, I couldn't find that on this website. I can only answer from the information shown here." +
      (known(email)
        ? ` You could ask directly at <a href="mailto:${esc(email)}">${esc(email)}</a>.`
        : "") +
      "<br>Try: <em>research areas</em>, <em>papers on IoT</em>, <em>h-index</em> or <em>education</em>."
    );
  },
};

/* ---------- intent router ---------- */

/** Maps a visitor's question to one of the answers above. */
export function answer(raw: string): string {
  const q = raw.trim();
  const l = q.toLowerCase();
  if (!q) return A.help();

  if (/^(hi|hello|hey|salam|assalam|aoa|good (morning|afternoon|evening))\b/.test(l) && l.split(/\s+/).length <= 4) {
    return A.greet();
  }
  if (/^(thanks|thank you|thx|jazak|shukriya)/.test(l)) return A.thanks();
  if (/\b(help|what can you (do|answer)|how does this work)\b/.test(l)) return A.help();
  if (/\b(cv|resume|résumé|curriculum vitae)\b/.test(l)) return A.cv();
  if (/retract/.test(l)) return A.retracted();
  if (/(h-?\s?index|i10|citation|cited|impact|metrics?|scholar stat)/.test(l)) return A.metrics();
  if (/(contact|email|e-mail|reach|get in touch|address|office|meet|phone|call)/.test(l)) {
    return A.contact();
  }
  if (/(google scholar|orcid|scopus|researchgate|linkedin|profiles?\b|social)/.test(l)) {
    return A.profiles() ?? A.contact();
  }

  const year = l.match(/\b(19[89]\d|20[0-4]\d)\b/);
  if (year && /(paper|publication|article|publish|journal|research|work)/.test(l)) {
    return A.pubYear(Number(year[1]));
  }
  if (/(latest|recent|newest|new) (paper|publication|article|work|research)/.test(l)) {
    return A.pubLatest();
  }
  if (/how many (paper|publication|article)|number of (paper|publication)|total (paper|publication)/.test(l)) {
    return A.pubCount();
  }
  if (/(supervis|phd student|students|postdoc(toral)? (position|researcher)|admission|join (his|the) (lab|group)|prospective)/.test(l)) {
    return A.supervision() || A.fallback(q);
  }
  if (/(post\s*-?doc|ph\.?\s?d|degree|education|qualification|studied|study|university did|graduat|master|bachelor|m\.?sc|b\.?sc|thesis|alma mater)/.test(l)) {
    return A.education(q);
  }
  if (/(award|honou?r|prize|medal|recogni|achievement)/.test(l)) return A.awards();
  if (/(grant|fund|nrpu|scholarship)/.test(l)) return A.funding();
  if (/(project)/.test(l)) return A.projects();
  if (/(certif|training|ccna|cisco|course taken)/.test(l)) return A.certs();
  if (/(dean|head of|hod|leadership|director|admin(istrative)? role|editor|reviewer)/.test(l)) {
    return A.leadership() ?? A.experience(q);
  }
  if (/(skill|expertise|good at|technolog|tools)/.test(l)) return A.skills();
  if (/(paper|publication|article|published|journal)/.test(l)) return A.pubTopic(q) ?? A.pubCount();
  if (/(research (area|interest|field|focus|topic)|research\?*$|interests?|work on|field|speciali[sz])/.test(l)) {
    const topic = A.pubTopic(q);
    return /(area|interest|field|focus|topic)|research\?*$/.test(l) || !topic ? A.research() : topic;
  }
  if (/(current|currently|now|present) (position|job|role|work)|where does he work|what does he do|designation|job title|which university/.test(l)) {
    return A.position();
  }
  if (/(experience|career|worked|work history|previous|past (job|position)|visiting|adjunct|taught|teach)/.test(l)) {
    return A.experience(q);
  }
  if (/^(who|about|introduce|tell me about|bio|biography)\b|who is/.test(l)) return A.about();

  return A.pubTopic(q) ?? A.fallback(q);
}

export const GREETING = A.greet();

/** Quick-question chips shown under the log. */
export const SUGGESTIONS = [
  `Who is ${HONORIFIC}?`,
  "Research areas",
  "Papers on machine learning",
  "Citations & h-index",
  "Education",
  "How to contact?",
];
