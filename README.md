# Academic Portfolio Website — Prof. Dr. Muhammad Mansoor Alam

A personal academic website built with **Next.js** and **Tailwind CSS**. It is a fully static site: the build produces plain HTML, CSS and JavaScript, which Netlify serves directly.

**If you only want to change the words on the site, you never need to read past section 2.** Use the admin panel.

---

## 1. Edit the website (no code)

Go to **<https://prof-mansoor-alam.netlify.app/admin/>** and log in with GitHub. You get a form for every section: Profile, Education, Research, Publications, Projects, Experience, Awards, Certifications and Skills.

You can edit text, add or remove items, drag items to reorder them, and upload a new photo. When you click **Publish → Publish now**, the change is saved to GitHub, Netlify rebuilds the site, and the update is live in about a minute.

The panel is [Decap CMS](https://decapcms.org), which is free and open-source. Setup instructions are in section 8.

**Everyday tips**

- **Add a publication:** *4 · Publications* → **Add publication** (new items appear at the top). Give it a new unique id, e.g. `j68`.
- **Remove an item:** click the **×** on its row. **Reorder:** drag the **═** handle.
- **Change the photo:** *1 · Profile* → *Profile photo* → *Choose different image*.
- **Update citation figures:** *4 · Publications* → *Publication statistics*. Update **As of** at the same time.
- Leave a field empty to show `[Information to be added]` on the site, or to hide an optional link.
- **Safety tip:** if a list ever appears empty (e.g. "0 publications") when you know it has items, **reload the page before saving**. Saving an empty list would remove those items from the site. They could still be recovered from GitHub's history.

## 2. Where the content lives

All content is plain JSON in `content/`. The admin panel writes these files; you can also edit them directly.

| File | What it holds |
|---|---|
| `content/profile.json` | Name, headline, biography, contact details, profile links, SEO settings |
| `content/education.json` | Degrees, newest first |
| `content/experience.json` | Every post held, newest first |
| `content/research.json` | Research areas — also drives the bar chart |
| `content/publications.json` | The publication list **and** the statistics shown above it |
| `content/projects.json` | Funded and doctoral research |
| `content/awards.json`, `content/certifications.json`, `content/skills.json` | Recognition, credentials, capabilities |

Every list file wraps its array in `"items"`, and `publications.json` also has a `"stats"` object. That wrapper is what lets the admin panel bind to the file.

Editing by hand: change only the text between the quotation marks, keep every comma and bracket where it is, and write a literal `"` inside text as `\"`.

`year` in `publications.json` is a number with no quotes, or `null` if unknown. `doi` is only the DOI itself, without `https://doi.org/`. `notice` shows a red tag and is used for retractions (see section 10).

## 3. Project structure

| Item | What it does | Do you edit it? |
|---|---|---|
| `content/*.json` | **All the content.** | **Yes — via the admin panel.** |
| `app/` | Page shell, global styles, SEO metadata, `robots.txt` and `sitemap.xml` generation. | Rarely. |
| `components/` | One component per section of the page. | For layout changes. |
| `lib/content.ts` | Loads and types the JSON. | No. |
| `lib/types.ts` | The shape of every content file. Changing a field here means changing `public/admin/config.yml` too. | With care. |
| `lib/assistant.ts` | The "Ask me" assistant's logic (see section 11). | Rarely. |
| `public/assets/` | Photo, favicon, CV PDF and anything uploaded through the admin panel. | Via the panel. |
| `public/admin/` | The admin panel: `index.html` and `config.yml` (which fields can be edited). | Only `config.yml`, once (section 8). |
| `netlify.toml` | Build command, caching and security headers. | Rarely. |

## 4. Run it on your own computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>. The page reloads as you edit.

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Builds the static site into `out/`. |
| `npm run typecheck` | Checks the TypeScript types. |
| `npm run lint` | Runs ESLint. |
| `npm run cms` | Starts a local admin-panel backend, so the panel writes to the files on your computer instead of GitHub. Run `npm run dev` in a second terminal, then open <http://localhost:3000/admin/index.html>. |

## 5. Change colours or fonts

All design tokens are at the top of `app/globals.css`, inside the `@theme` block:

- `--color-steel-*` — the dark hero, top bar and footer
- `--color-maroon-*` — the primary accent
- `--color-blush-*` / `--color-ember-400` — the warm end of the accent gradient
- `--color-mist-*` — the light greys of alternate sections
- `--color-ink-*` — body text

The accent gradient itself (`--grad-accent`) and the dark wash (`--grad-dark`) are just below, in the `:root` block. Change a value there and the whole site updates.

Fonts are Playfair Display and Source Sans 3, loaded through `next/font` in `app/layout.tsx`. They are downloaded at build time and served from your own domain, so the site makes no request to Google Fonts.

## 6. Deploy

Netlify is already configured by `netlify.toml`:

- **Build command:** `npm run build`
- **Publish directory:** `out`

Every push to `main` triggers a rebuild. Nothing else is needed.

To host somewhere other than Netlify, run `npm run build` and upload the **contents** of `out/` to any static host. The admin panel's login still needs a free Netlify site (see section 8).

## 7. Move to your own domain

The site address appears in `content/profile.json` (`seo.siteUrl`) and `public/admin/config.yml` (`site_url` and `display_url`). `robots.txt`, `sitemap.xml` and every canonical, Open Graph and structured-data tag are generated from `seo.siteUrl`, so changing it in those two places is enough.

## 8. Admin panel setup (one time, about 15 minutes)

1. **Tell the panel which repository to use.** In `public/admin/config.yml`, `repo:` should be your GitHub repository (currently `altafhussain-ah/mansoor-alam-website`).
2. **Host it on Netlify.** app.netlify.com → *Add new site* → *Import an existing project* → *GitHub* and pick the repository. Netlify reads `netlify.toml`, so leave the build settings alone.
3. **Create a GitHub OAuth app**, which lets the panel log in with GitHub. In GitHub → *Settings* → *Developer settings* → *OAuth Apps* → *New OAuth App*:
   - Homepage URL: your Netlify address, e.g. `https://prof-mansoor-alam.netlify.app`
   - Authorization callback URL: **`https://api.netlify.com/auth/done`**
   - Click *Register*, then *Generate a new client secret*. Copy both the **Client ID** and the **Client secret**.
4. **Connect it to Netlify.** Open your site in Netlify → *Site configuration* → *Access & security* → *OAuth* → *Install provider* → **GitHub**, and paste in the Client ID and secret.
5. Open `https://your-site/admin/` and click **Login with GitHub**.

Anyone who should be able to edit the site needs a GitHub account with write access to the repository (*Settings → Collaborators* on GitHub).

`/admin/` is kept out of search results by `robots.txt` and a `noindex` tag. It is protected by the GitHub login, not by being hidden.

## 9. The contact form

The form posts to **Netlify Forms**. For messages to arrive, Netlify must detect the form on a deploy and the feature must be enabled:

1. In Netlify → *Site configuration* → *Forms*, make sure form detection is enabled.
2. Redeploy. Netlify picks up the `contact` form from the built HTML.
3. Submissions then appear under *Forms* in the Netlify dashboard. Add a notification there to get them by email.

Until that is done, the form shows an error and points visitors at the email address instead — it does not silently discard messages.

## 10. Notes on sources and accuracy

- The content comes from the supplied CV, cross-checked against the Riphah International University faculty profile. The citation figures come from the Riphah profile and should be confirmed against Google Scholar.
- Two publications listed on the CV have been retracted by their publishers: **j18** (*Computational and Mathematical Methods in Medicine*, 2023) and **j20** (*Frontiers in Public Health*, October 2025). Both remain listed with a red "Retracted" tag. Remove them, or clear the `notice` field, only after discussing it with Prof. Alam.
- The CV PDF is in `public/assets/cv/` but nothing on the site links to it. To add a download button, fill in *Second button* (label and link) under *1 · Profile → Hero buttons*.

## 11. The "Ask me" assistant

The chat button in the bottom-right corner opens an assistant that answers visitors' questions: research areas, papers on a topic or from a given year, citations and h-index, education, career, awards, contact details and more.

- **It is free and private.** It runs entirely in the visitor's browser (`lib/assistant.ts`), makes no calls to any AI service, and costs nothing.
- **It only knows what is on the site.** It reads the same `content/*.json` as the page, so whatever you update in the admin panel, the assistant knows straight away. For anything not on the site, it points visitors to the contact email.
- **Suggested questions:** to change the quick-question chips, edit `SUGGESTIONS` at the bottom of `lib/assistant.ts`.

## 12. Still to do

- [ ] Fill in or remove the remaining `[Information to be added]` markers — mostly in Projects, plus two education years, three certification issuers and the Languages and Office fields.
- [ ] Confirm the figures in *Publication statistics* against Google Scholar and update **As of**.
- [ ] Add a conference-paper count, or leave that tile showing the placeholder.
- [ ] Enable Netlify Forms so the contact form delivers (section 9).
- [ ] Replace `public/assets/images/profile.jpg` with a larger portrait — the current file is 267 × 285 px but is displayed at 320 px wide, so it is being upscaled.
- [ ] Decide how to present the retracted publications (section 10).
