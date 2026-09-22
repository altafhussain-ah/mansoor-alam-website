import type { Metadata, Viewport } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { education, isBlank, profile, researchAreas, siteUrl } from "@/lib/content";
import "./globals.css";

/**
 * Self-hosted at build time by next/font — no Google Fonts request at runtime,
 * which removes a render-blocking round trip and the third-party connection.
 */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: profile.seo.title,
  description: profile.seo.description,
  keywords: profile.seo.keywords.split(",").map((k) => k.trim()),
  authors: [{ name: profile.fullName }],
  alternates: { canonical: "/" },
  icons: { icon: [{ url: "/assets/icons/favicon.svg", type: "image/svg+xml" }] },
  openGraph: {
    type: "profile",
    title: `${profile.fullName} — ${profile.designation}`,
    description: `Machine learning, AI and intelligent decision support research at ${profile.institution}, ${profile.location}.`,
    url: "/",
    images: [{ url: `/${profile.seo.ogImage}`, width: 267, height: 285, alt: profile.photo.alt }],
  },
  twitter: {
    card: "summary",
    title: `${profile.fullName} — ${profile.designation}`,
    description: `Machine learning, AI and intelligent decision support research at ${profile.institution}, ${profile.location}.`,
    images: [`/${profile.seo.ogImage}`],
  },
};

export const viewport: Viewport = {
  themeColor: "#1f2733",
};

/** Built from the content files so it can never drift from the page. */
function structuredData() {
  const alumniOf = Array.from(
    new Set(
      education
        .map((e) => e.institution.split(",")[0].trim())
        .filter((name) => !isBlank(name)),
    ),
  ).map((name) => ({ "@type": "CollegeOrUniversity", name }));

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.shortName,
    honorificPrefix: "Prof. Dr.",
    jobTitle: profile.designation,
    description: profile.introduction,
    worksFor: {
      "@type": "CollegeOrUniversity",
      name: profile.institution,
      address: {
        "@type": "PostalAddress",
        streetAddress: "I-14/3",
        addressLocality: "Islamabad",
        addressCountry: "PK",
      },
    },
    alumniOf,
    email: `mailto:${profile.contact.email}`,
    image: `${siteUrl}/${profile.seo.ogImage}`,
    url: `${siteUrl}/`,
    knowsAbout: researchAreas.map((area) => area.title),
    sameAs: Object.values(profile.socialLinks).filter((url) => !isBlank(url)),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body>
        <a
          href="#main"
          className="absolute left-4 top-[-60px] z-[1000] rounded-sm bg-maroon-500 px-4 py-2.5 font-semibold text-white no-underline focus:top-3"
        >
          Skip to main content
        </a>
        {children}
        <script
          type="application/ld+json"
          // Generated above from our own content; no external input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
        />
      </body>
    </html>
  );
}
