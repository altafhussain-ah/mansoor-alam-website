"use client";

import { Fragment, useDeferredValue, useEffect, useMemo, useState } from "react";
import { onPublicationSearch } from "@/lib/pub-search";
import {
  isBlank,
  publicationStats,
  publicationType,
  publications,
  publicationsByYear,
} from "@/lib/content";
import type { Publication, PublicationType } from "@/lib/types";
import { PLACEHOLDER } from "@/lib/types";
import { Badge } from "./Badge";
import { Field, PlaceholderTag } from "./Placeholder";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

const PAGE_SIZE = 15;

const FILTERS: ReadonlyArray<[PublicationType | "all", string]> = [
  ["all", "All"],
  ["journal", "Journals"],
  ["conference", "Conferences"],
  ["other", "Other"],
];

/** Name variants to embolden in the author list. */
const SELF = /(Muhammad Mans+oor Alam|Muhammad Alam|M\. ?M\. Alam|M\. Alam)/g;

function Authors({ value }: { value: string }) {
  const parts = value.split(SELF);
  return (
    <>
      {parts.map((part, i) =>
        // Odd indices are the captured name matches.
        i % 2 === 1 ? (
          <strong key={i} className="font-bold text-steel-900">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function StatTiles() {
  const tiles: Array<[string, number | null]> = [
    ["Total publications", publicationStats.totalPublications],
    ["Journal articles listed", publicationStats.totalJournalArticles],
    ["Conference papers", publicationStats.totalConferencePapers],
    ["Citations", publicationStats.totalCitations],
  ];
  if (publicationStats.hIndex != null) tiles.push(["h-index", publicationStats.hIndex]);
  if (publicationStats.i10Index != null) tiles.push(["i10-index", publicationStats.i10Index]);

  return (
    <Reveal className="grid grid-cols-2 gap-3 cards:grid-cols-3 lg:grid-cols-6">
      {tiles.map(([label, value]) => (
        <div
          key={label}
          className="rounded-2xl border border-line bg-white p-5 px-4 text-center shadow-card"
        >
          {typeof value === "number" ? (
            <div className="text-accent-gradient font-serif text-[2rem] leading-[1.1] font-bold">
              {value.toLocaleString("en-US")}
            </div>
          ) : (
            <div className="py-2.5 text-[0.82rem] font-sans italic text-maroon-600">
              {PLACEHOLDER}
            </div>
          )}
          <div className="mt-1.5 text-[0.78rem] font-semibold tracking-[0.1em] text-ink-500 uppercase">
            {label}
          </div>
        </div>
      ))}
    </Reveal>
  );
}

function PublicationItem({ item }: { item: Publication }) {
  const links: React.ReactNode[] = [];
  if (!isBlank(item.doi)) {
    links.push(
      <a
        key="doi"
        href={`https://doi.org/${item.doi}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold"
      >
        DOI: {item.doi}
      </a>,
    );
  }
  if (!isBlank(item.link)) {
    links.push(
      <a
        key="link"
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold"
      >
        View article
      </a>,
    );
  }
  if (!isBlank(item.indexing)) {
    links.push(<Badge key="idx">{item.indexing}</Badge>);
  }
  if (!isBlank(item.notice)) {
    links.push(
      <Badge key="notice" variant="danger">
        {item.notice}
      </Badge>,
    );
  }

  return (
    <li className="relative mb-1.5 grid grid-cols-[auto_1fr] gap-x-4.5 gap-y-1 rounded-[14px] p-5 px-4 transition-[background,box-shadow] before:absolute before:top-4.5 before:bottom-4.5 before:left-0 before:w-[3px] before:rounded-sm before:bg-accent before:opacity-0 before:transition-opacity before:content-[''] hover:bg-mist-50 hover:shadow-card hover:before:opacity-100">
      {typeof item.year === "number" ? (
        <div className="text-accent-gradient min-w-[52px] font-serif text-[1.15rem] leading-[1.4] font-bold">
          {item.year}
        </div>
      ) : (
        <div className="max-w-[70px] min-w-[52px] text-[0.72rem] leading-[1.3] italic text-maroon-600">
          {PLACEHOLDER}
        </div>
      )}
      <div>
        <h3 className="mb-1 font-sans text-[1.05rem] leading-[1.4] font-semibold text-steel-900">
          {item.title}
        </h3>
        <p className="mb-[3px] text-[0.93rem] text-ink-700">
          <Authors value={item.authors} />
        </p>
        <p className="mb-1.5 text-[0.93rem] italic text-ink-500">{item.venue}</p>
        {links.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[0.85rem]">{links}</div>
        )}
        {!isBlank(item.abstract) && (
          <details className="mt-2">
            <summary className="cursor-pointer text-[0.9rem] font-semibold">Abstract</summary>
            <p className="mt-1.5 text-[0.93rem] text-ink-700">{item.abstract}</p>
          </details>
        )}
      </div>
    </li>
  );
}

export function PublicationsSection() {
  const [type, setType] = useState<PublicationType | "all">("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  // Keeps typing responsive while the 67-item list re-filters.
  const deferredQuery = useDeferredValue(query);

  // The assistant's "Show these in Publications" button drives this box.
  useEffect(
    () =>
      onPublicationSearch((incoming) => {
        setQuery(incoming);
        setType("all");
      }),
    [],
  );

  const counts = useMemo(() => {
    const byType = { journal: 0, conference: 0, other: 0 };
    for (const p of publications) byType[publicationType(p)] += 1;
    return byType;
  }, []);

  const matched = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    const words = needle ? needle.split(/\s+/) : [];
    return publicationsByYear.filter((p) => {
      if (type !== "all" && publicationType(p) !== type) return false;
      if (words.length === 0) return true;
      const haystack = `${p.title} ${p.authors} ${p.venue}`.toLowerCase();
      return words.every((w) => haystack.includes(w));
    });
  }, [type, deferredQuery]);

  const limited = !expanded && !deferredQuery.trim() && matched.length > PAGE_SIZE;
  const shown = limited ? matched.slice(0, PAGE_SIZE) : matched;

  return (
    <Section id="publications" kicker="Scholarly output" title="Publications">
      <StatTiles />
      <p className="my-3 mb-8 text-[0.86rem] text-ink-500">
        {!isBlank(publicationStats.sourceNote) && (
          <>
            Source: <Field value={publicationStats.sourceNote} />
          </>
        )}
        {!isBlank(publicationStats.asOf) && <> (as of {publicationStats.asOf})</>}
      </p>

      <Reveal className="mb-3 flex flex-col gap-3.5 wide:flex-row wide:items-center wide:justify-between">
        <label htmlFor="pub-search" className="sr-only">
          Search publications
        </label>
        <input
          id="pub-search"
          type="search"
          autoComplete="off"
          placeholder="Search title, author or venue…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-[480px] rounded-full border border-line bg-mist-50 px-5 py-3 text-base text-ink-900 focus:border-steel-600 focus:shadow-[0_0_0_3px_rgba(79,93,110,0.18)] focus:outline-none"
        />
        <div role="group" aria-label="Filter publications by type" className="flex flex-wrap gap-2">
          {FILTERS.map(([value, label]) => {
            const n = value === "all" ? publications.length : counts[value];
            const pressed = type === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={pressed}
                onClick={() => {
                  setType(value);
                  setExpanded(false);
                }}
                className={`min-h-10 cursor-pointer rounded-full px-4 py-2 text-[0.9rem] font-semibold transition-colors ${
                  pressed
                    ? "border border-transparent bg-accent text-white shadow-glow"
                    : "border border-line bg-white text-ink-700 hover:border-steel-600 hover:text-steel-800"
                }`}
              >
                {label} ({n})
              </button>
            );
          })}
        </div>
      </Reveal>

      <p className="mb-3 text-[0.9rem] text-ink-500" aria-live="polite">
        Showing {shown.length} of {matched.length} matching publication
        {matched.length === 1 ? "" : "s"}.
      </p>

      <ol>
        {shown.length > 0 ? (
          shown.map((item) => <PublicationItem key={item.id} item={item} />)
        ) : (
          <li className="rounded-lg border border-dashed border-line bg-white/50 p-5 text-ink-500 italic">
            {publications.length > 0 ? "No publications match your search." : <PlaceholderTag />}
          </li>
        )}
      </ol>

      {limited && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-steel-700 px-6 py-3 text-[0.98rem] font-semibold text-steel-800 transition-colors hover:bg-steel-800 hover:text-white"
          >
            Show all {matched.length} publications
          </button>
        </div>
      )}
    </Section>
  );
}
