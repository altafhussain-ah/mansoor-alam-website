# Academic Portfolio Website — Prof. Dr. Muhammad Mansoor Alam

A complete personal academic website. It is plain HTML, CSS and JavaScript: no installation, no build step, no special software. All content lives in the `data/` folder, and you can edit it through the built-in admin panel (section 13) without touching code.

---

## 1. What each file and folder is for

| Item | What it does | Do you edit it? |
|---|---|---|
| `index.html` | The page skeleton and search-engine (SEO) tags. | Only to replace the placeholder domain (section 10). |
| `css/style.css` | All colours, fonts and layout. Colours are at the very top, under `:root`. | Rarely. |
| `js/script.js` | Reads the data files and builds the page. Contains no content. | No. |
| `data/*.js` | **All the content.** One file per section. | **Yes. This is where you edit.** |
| `assets/images/` | `profile.jpg` (the portrait) and `placeholder.svg` (shown if the photo is missing). | To swap the photo. |
| `assets/icons/favicon.svg` | The small icon in the browser tab. | Optional. |
| `assets/cv/` | `Muhammad-Mansoor-Alam-CV.pdf`, opened by the “View CV” and “Download CV” buttons. | To update the CV. |
| `assets/documents/` | Space for any other public files (e.g. slides, certificates). | Optional. |
| `admin/` | The admin panel: `index.html`, `config.yml` (which fields can be edited) and `jsdata-format.js` (reads and writes the data files). | Only `config.yml`, once (section 13). |
| `assets/uploads/` | Photos and PDFs uploaded through the admin panel. | No. |
| `robots.txt`, `sitemap.xml` | Help search engines find the site. | Replace the placeholder domain. |

## 2. Preview the site

Double-click `index.html`. It opens in your web browser and works fully offline. The only exception is the fonts, which need an internet connection; without one, the page falls back to standard fonts.

After editing a data file, save it and press **Refresh** in the browser.

## 3. How to edit the data files

Open any file in `data/` with a plain text editor: Notepad (Windows), TextEdit in plain-text mode (Mac), or the free VS Code. Do **not** use Word.

**Easiest way: the admin panel (section 13).** It gives you a form for every section, so you never touch code. To edit by hand instead, follow three rules:

1. Change only the text **between the quotation marks** on the right-hand side.
2. Keep every comma, bracket `[ ]` and brace `{ }` where it is. Everything after `=` must stay valid JSON, meaning names are in double quotes.
3. If your text contains a double quote `"`, write it as `\"`, or use curly quotes “ ” instead.

Anywhere you see `[Information to be added]`, the information was not in the CV or on a public profile. Replace it with the real value, or delete that line (see the checklist in section 11).

### 3.1 `data/profile.js`: name, biography, contact

Before:
```js
"contact": {
  "email": "m.mansoor@riphah.edu.pk",
  "institutionAddress": "Riphah International University, I-14/3, Islamabad, Pakistan",
  "office": "[Information to be added]"
},
```
After:
```js
  "office": "Faculty of Computing, Block B, Room 210"
```
Other fields in this file: `headline` (the small maroon line above the name), `introduction` (the hero paragraph), and `biography` (the About paragraphs; add a paragraph by adding another `"...",` line inside the brackets).

### 3.2 `data/education.js`

Before:
```js
{ "degree": "Post-Doctorate", "institution": "Universiti Kuala Lumpur, Kuala Lumpur, Malaysia",
  "year": "[Information to be added]", "specialization": "Research: ...", "link": "" },
```
After:
```js
  "year": "2019",
```
`link` is optional. When it is filled in, a “Read the thesis” link appears.

### 3.3 `data/experience.js`

Every post goes here, newest first, including teaching, administrative and service roles. Only **one** entry may have `current: true`, and that entry gets the maroon “Current” badge.

Before:
```js
"title": "[Information to be added]",
"organization": "Laureate Online Education (Colorado State University)",
```
After:
```js
"title": "Online Faculty (Computer Science)",
```

### 3.4 `data/research.js`

`icon` can be `brain`, `code`, `eye`, `chip` or `compass`. The bar chart counts the ids listed in `relatedPublicationIds`.

Before: `"relatedPublicationIds": ["j21","j25"]`. After: `"relatedPublicationIds": ["j21","j25","j68"]`.

### 3.5 `data/publications.js`

Before:
```js
{ "id": "j7", ..., "year": null, ... "doi": "", ... }
```
After:
```js
{ "id": "j7", ..., "year": 2023, ... "doi": "10.1016/j.rsma.2023.xxxxx", ... }
```
`year` is a number with no quotes, or `null` if unknown. `doi` is only the DOI itself, without `https://doi.org/`. `indexing` holds the quartile or impact factor as stated on the CV. `notice` shows a red tag and is used for retractions (see section 12).

The six figures at the top of the section come from `PUBLICATION_STATS` at the bottom of this file. Update them whenever Google Scholar changes:
```js
"totalCitations": 8177,   →   "totalCitations": 8420,
"asOf": "September 2026", →   "asOf": "January 2027",
```

### 3.6 `data/projects.js`, `data/awards.js`, `data/certifications.js`, `data/skills.js`

These work the same way. For example, in `skills.js`:
```js
"teaching": [ "MS / PhD supervision (HEC Approved Supervisor)" ]
→
"teaching": [ "MS / PhD supervision (HEC Approved Supervisor)", "Curriculum design" ]
```

An empty list (`[]`) is safe. The section then shows a quiet “information to be added” note instead of breaking the layout.

## 4. Swap the photo or the CV

- **Photo:** save the new portrait as `assets/images/profile.jpg` so it replaces the old file. A portrait shape of about 600 × 640 px works best. If you use a different file name, update `photo.src` in `profile.js`.
- **CV:** save the new PDF as `assets/cv/Muhammad-Mansoor-Alam-CV.pdf`. The CV published here is a copy of the supplied CV with the mobile numbers and the referees' phone numbers and e-mail addresses removed. Remove them again from any new version before you upload it.

## 5. Add a publication, project, award or certification

Copy an existing entry, including its `{ ... },`, paste it directly below, and change the text.

**Publication:** give it a new unique id (`j68` for a journal, `c1` for a conference, `o1` for other) and set `type` to `"journal"`, `"conference"` or `"other"`. The filters, search and counts update automatically.
```js
{ "id": "c1", "title": "Paper title", "authors": "A. Author, Muhammad Mansoor Alam", "venue": "Conference name, City",
  "year": 2026, "type": "conference", "doi": "", "link": "", "indexing": "", "notice": "", "abstract": "" },
```
**Project:**
```js
{ "title": "", "description": "", "role": "", "fundingOrganization": "", "collaborators": "", "duration": "",
  "researchArea": "", "status": "Ongoing", "relatedOutputs": ["j1"] },
```
**Award:** `{ "title": "", "organization": "", "year": "2026", "description": "" },`

**Certification:** `{ "title": "", "issuer": "" },`

## 6. Change or hide a social or profile link

In `profile.js`, under `socialLinks`:
```js
"researchGate": "",   →   "researchGate": "https://www.researchgate.net/profile/Your-Name",
```
An empty value `""` hides that button completely. The available keys are `googleScholar`, `orcid`, `scopus`, `researchGate`, `dblp`, `universityProfile`, `academiaEdu`, `linkedin` and `github`.

## 7. Connect the contact form

For now the form only checks the fields and shows a confirmation message. It does not send e-mail. To receive messages:

**Formspree (any host):**

1. Create a free form at formspree.io and copy its endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
2. In `index.html`, change `<form class="contact__form" id="contactForm" novalidate>` to
   `<form class="contact__form" id="contactForm" action="https://formspree.io/f/abcdwxyz" method="POST" novalidate>`.
3. In `js/script.js`, in the contact-form section, replace the `form.reset();` line after the thank-you message with `form.submit();`.

**Netlify Forms (only if hosted on Netlify):** add `name="contact" method="POST" data-netlify="true"` to the `<form>` tag and make the same `form.submit();` change. Messages then appear under *Forms* in the Netlify dashboard.

## 8. Deploy (put the site online)

Upload the **contents** of this folder (the folder holding `index.html`), not the folder itself.

- **Shared hosting / cPanel:** File Manager → `public_html` → Upload → select everything in this folder. You can also upload a .zip and choose *Extract*.
- **GitHub Pages:** create a public repository, click *Add file → Upload files*, and drag in the folder's **contents**. Then go to *Settings → Pages* and set the source to `main` branch, `/ (root)`. The site appears at `https://USERNAME.github.io/REPO/`.
- **Netlify:** app.netlify.com → *Add new site → Deploy manually* → drag the folder onto the page.
- **Vercel:** vercel.com → *Add New → Project* → import the GitHub repository (framework preset: *Other*, no build command).

## 9. Change colours or fonts

The site uses a **maroon + slate** palette. All colours are defined once, at the top of `css/style.css` under `:root`:

- `--color-slate-900` / `--color-slate-950`: the dark hero, top bar and footer
- `--color-maroon-500`: the accent colour for buttons, rules, badges and the chart bars
- `--color-maroon-600`: accent text on light backgrounds
- `--color-maroon-400`: accent text on dark backgrounds
- `--color-mist-100`: the light grey of alternate sections

Change a value there and the whole site updates.

## 10. Replace the placeholder domain

Search every file for `YOUR-DOMAIN.com` and replace it with the real address. It appears in `index.html` (canonical, Open Graph, Twitter and JSON-LD tags), `robots.txt`, `sitemap.xml`, `data/profile.js` (`seo.siteUrl`) and `admin/config.yml`.

## 11. Pre-launch checklist

- [ ] Replace `YOUR-DOMAIN.com` everywhere (section 10), including `site_url`/`display_url` in `admin/config.yml`.
- [ ] Set `repo:` in `admin/config.yml` and complete the admin login setup (section 13).
- [ ] Search all `data/*.js` files for `[Information to be added]` and fill in or remove every one.
- [ ] Confirm the figures in `PUBLICATION_STATS` against Google Scholar and update `asOf`.
- [ ] Decide how to present the retracted publications (section 12).
- [ ] Confirm the CV PDF contains no private phone numbers.
- [ ] Connect the contact form (section 7), or accept that it is display-only.
- [ ] Open the site on a phone and a computer and click every menu item.
- [ ] Ask Prof. Alam to approve the final text.

## 12. Notes on sources and accuracy

- The content comes from the supplied CV, cross-checked against the Riphah International University faculty profile. Google Scholar could not be read automatically, so the citation figures come from the Riphah profile.
- Two publications listed on the CV have been retracted by their publishers: **j18** (*Computational and Mathematical Methods in Medicine*, 2023) and **j20** (*Frontiers in Public Health*, October 2025). Both remain listed with a red “Retracted” tag. Remove them, or clear the `notice` field, only after discussing it with Prof. Alam.
- The CV PDF was supplied as a PDF, so it is published as-is (with redactions). Exporting a fresh PDF directly from Word may give cleaner typography.

## 13. The admin panel (edit the website in your browser)

Go to **`https://YOUR-SITE/admin/`**, log in with GitHub, and you get a form for every section: Profile, Education, Research, Publications, Projects, Experience, Awards, Certifications and Skills. You can edit text, add or remove items, drag items to reorder them, and upload a new photo or CV. When you click **Publish → Publish now**, the change is saved to GitHub and Netlify rebuilds the site. The update is live in about a minute.

The panel is [Decap CMS](https://decapcms.org), which is free and open-source. It writes straight into the `data/*.js` files, so the site itself works exactly as before.

### 13.1 One-time setup (about 15 minutes)

1. **Put the site on GitHub.** Create a repository (for example `mansoor-alam-website`) and upload the **contents** of this folder, so that `index.html` sits at the top level.
2. **Tell the admin panel which repository to use.** In `admin/config.yml`, change `repo: YOUR-GITHUB-USERNAME/YOUR-REPO` to your repository (e.g. `repo: altafhussain/mansoor-alam-website`) and commit the change.
3. **Host it on Netlify.** Go to app.netlify.com → *Add new site* → *Import an existing project* → *GitHub* and pick the repository. Leave the build command empty and set the publish directory to `/`. Netlify gives you an address such as `mansoor-alam.netlify.app`, and you can attach your own domain later.
4. **Create a GitHub OAuth app, which lets the admin panel log in with GitHub.** In GitHub → *Settings* → *Developer settings* → *OAuth Apps* → *New OAuth App*:
   - Homepage URL: your Netlify address, e.g. `https://mansoor-alam.netlify.app`
   - Authorization callback URL: **`https://api.netlify.com/auth/done`**
   - Click *Register*, then *Generate a new client secret*. Copy both the **Client ID** and the **Client secret**.
5. **Connect it to Netlify.** Open your site in Netlify → *Site configuration* → *Access & security* → *OAuth* → *Install provider* → **GitHub**, and paste in the Client ID and secret.
6. Open `https://mansoor-alam.netlify.app/admin/` and click **Login with GitHub**. Done.

Anyone who should be able to edit the site needs a GitHub account with write access to the repository (*Settings → Collaborators* on GitHub).

**Hosting on GitHub Pages or cPanel instead?** The login step still needs a free Netlify site. Create one as in step 3, complete steps 4–5 for it, and then add `site_domain: your-site-name.netlify.app` under `backend:` in `admin/config.yml`. Edits made in the panel are saved to GitHub, which is enough for GitHub Pages. For cPanel you would still have to upload the changed files yourself.

### 13.2 Everyday use

- **Add a publication:** *4 · Publications* → **Add publication** (new items appear at the top). Give it a new unique id, e.g. `j68`.
- **Remove an item:** click the **×** on its row. **Reorder:** drag the **═** handle.
- **Change the photo:** *1 · Profile* → *Profile photo* → *Choose different image*. **Replace the CV:** *1 · Profile* → *Hero buttons* → *CV PDF*. Remove private phone numbers from a new CV before you upload it.
- **Update citation figures:** *4 · Publications* → *Publication statistics*. Update **As of** at the same time.
- Leave a field empty to show `[Information to be added]` on the site, or to hide an optional link.
- **Safety tip:** if a list ever appears empty (e.g. “0 publications”) when you know it has items, **reload the page before saving**. Saving an empty list would remove those items from the site. They could still be recovered from GitHub's history.

### 13.3 Try the admin panel on your own computer (optional)

In a terminal inside this folder, run `npx decap-server`, and in a second terminal run `python -m http.server 8080`. Open `http://localhost:8080/admin/` and click **Login**. Any changes are written directly to the files on your computer, with no GitHub needed. This works because of `local_backend: true` in `admin/config.yml`.

### 13.4 Notes

- The admin page loads Decap CMS from the unpkg.com CDN. The public website still loads nothing external except Google Fonts.
- `/admin/` is hidden from search engines (`robots.txt` and a `noindex` tag). It is protected by the GitHub login, not by being hidden.
