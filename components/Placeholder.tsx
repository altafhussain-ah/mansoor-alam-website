import { Fragment } from "react";
import { isBlank } from "@/lib/content";
import { PLACEHOLDER } from "@/lib/types";

/** The "[Information to be added]" marker, styled so it reads as a gap. */
export function PlaceholderTag() {
  return <span className="text-maroon-600 italic">{PLACEHOLDER}</span>;
}

/**
 * Renders a content string, styling any embedded "to be added" marker.
 * An empty value becomes the marker on its own.
 */
export function Field({ value }: { value: string | number | null | undefined }) {
  if (isBlank(value)) return <PlaceholderTag />;

  const parts = String(value).split(PLACEHOLDER);
  if (parts.length === 1) return <>{parts[0]}</>;

  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && <PlaceholderTag />}
        </Fragment>
      ))}
    </>
  );
}

/** Quiet note shown where a whole section has no content yet. */
export function EmptyNote({ message }: { message?: string }) {
  return (
    <p className="rounded-lg border border-dashed border-line bg-white/50 p-5 text-ink-500 italic">
      {message ?? PLACEHOLDER}
    </p>
  );
}
