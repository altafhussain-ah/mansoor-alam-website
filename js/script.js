/* =========================================================
   Renders the page from the globals in data/*.js.
   No content lives here — edit the data files instead.
   ========================================================= */
(function () {
  "use strict";

  var PLACEHOLDER = "[Information to be added]";
  var PUB_PAGE = 15;
  var doc = document;
  var $ = function (id) { return doc.getElementById(id); };


  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function isBlank(v) { return v == null || String(v).trim() === ""; }
  function isPh(v) { return isBlank(v) || String(v).trim() === PLACEHOLDER; }
  /* Escapes text and styles any "[Information to be added]" inside it */
  function txt(v) {
    if (isBlank(v)) return '<span class="placeholder">' + PLACEHOLDER + "</span>";
    return esc(v).split(esc(PLACEHOLDER)).join('<span class="placeholder">' + PLACEHOLDER + "</span>");
  }
  function list(v) { return Array.isArray(v) ? v.filter(function (x) { return !isBlank(x); }) : []; }
  function empty(msg) { return '<p class="empty-note">' + esc(msg || PLACEHOLDER) + "</p>"; }
  /* data globals are declared with const in data/*.js — read them defensively */
  var P = typeof PROFILE !== "undefined" ? PROFILE : {};
  var EDU = typeof EDUCATION !== "undefined" ? EDUCATION : [];
  var EXP = typeof EXPERIENCE !== "undefined" ? EXPERIENCE : [];
  var RES = typeof RESEARCH_AREAS !== "undefined" ? RESEARCH_AREAS : [];
  var PUBS = typeof PUBLICATIONS !== "undefined" ? PUBLICATIONS : [];
  var STATS = typeof PUBLICATION_STATS !== "undefined" ? PUBLICATION_STATS : {};
  var PROJ = typeof PROJECTS !== "undefined" ? PROJECTS : [];
  var AWARDS_ = typeof AWARDS !== "undefined" ? AWARDS : [];
  var CERTS = typeof CERTIFICATIONS !== "undefined" ? CERTIFICATIONS : [];
  var SK = typeof SKILLS !== "undefined" ? SKILLS : {};

  /* ---------- icons (UI only) ---------- */
  var I = {
    brain: '<path d="M9 4a3 3 0 0 0-3 3v.2A3 3 0 0 0 4 10a3 3 0 0 0 1 2.2A3 3 0 0 0 6 17a3 3 0 0 0 3 3 3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zM15 4a3 3 0 0 1 3 3v.2A3 3 0 0 1 20 10a3 3 0 0 1-1 2.2A3 3 0 0 1 18 17a3 3 0 0 1-3 3 3 3 0 0 1-3-3"/>',
    code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14l-1.5 8 5-3 5 3-1.5-8"/>',
    cert: '<circle cx="12" cy="9" r="5"/><path d="M9 13.5L8 21l4-2 4 2-1-7.5"/><path d="M10 9l1.5 1.5L14.5 7.5"/>',
    file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    download: '<path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    building: '<path d="M4 21V5l8-3 8 3v16M9 21v-5h6v5M8 8h2M14 8h2M8 12h2M14 12h2"/>',
    scholar: '<path d="M12 3L1 9l11 6 9-4.9V17h2V9z"/><path d="M5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8"/>',
    orcid: '<circle cx="12" cy="12" r="9"/><path d="M9 8v8M9 6v.01M12 8h2.5a4 4 0 0 1 0 8H12z"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
    github: '<path d="M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.5 2.5 5.5 2.8 5.5 2.8a4.3 4.3 0 0 0-.1 3.2A4.7 4.7 0 0 0 4 9.2c0 4.6 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3V21"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[name] || I.link) + "</svg>";
  }

  var SOCIAL_META = {
    googleScholar: ["Google Scholar", "scholar"],
    orcid: ["ORCID", "orcid"],
    scopus: ["Scopus", "link"],
    researchGate: ["ResearchGate", "link"],
    dblp: ["dblp", "link"],
    universityProfile: ["University Profile", "building"],
    academiaEdu: ["Academia.edu", "link"],
    linkedin: ["LinkedIn", "linkedin"],
    github: ["GitHub", "github"]
  };
  function renderSocial(el) {
    var links = P.socialLinks || {};
    var html = "";
    Object.keys(SOCIAL_META).forEach(function (k) {
      if (isBlank(links[k])) return;
      var m = SOCIAL_META[k];
      html += '<li><a href="' + esc(links[k]) + '" target="_blank" rel="noopener" aria-label="' + esc(m[0]) + ' (opens in a new tab)">' + icon(m[1]) + "<span>" + esc(m[0]) + "</span></a></li>";
    });
    el.innerHTML = html;
    if (!html) el.hidden = true;
  }
  function btn(b, cls) {
    if (!b || isBlank(b.href)) return "";
    var ext = /\.pdf$|^https?:/i.test(b.href);
    return '<a class="btn ' + cls + '" href="' + esc(b.href) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(b.label) + "</a>";
  }

  /* ---------- HERO ---------- */
  function renderHero() {
    $("heroEyebrow").textContent = P.headline || "";
    $("heroName").textContent = P.fullName || "";
    var parts = [P.department, P.institution, P.location].filter(function (x) { return !isBlank(x); });
    $("heroRole").innerHTML = "<strong>" + esc(P.designation || "") + "</strong>" + (parts.length ? "<br>" + esc(parts.join(", ")) : "");
    $("heroIntro").textContent = P.introduction || "";
    var hb = P.heroButtons || {};
    $("heroActions").innerHTML = btn(hb.primary, "btn--primary") + btn(hb.secondary, "btn--ghost");
    var img = $("heroPhoto");
    if (P.photo && P.photo.src) img.src = P.photo.src;
    img.alt = (P.photo && P.photo.alt) || P.fullName || "Profile photo";
    img.addEventListener("error", function () {
      if (img.dataset.fallback) return;
      img.dataset.fallback = "1";
      img.src = "assets/images/placeholder.svg";
    });
    renderSocial($("heroSocial"));
    $("navBrand").textContent = P.shortName || P.fullName || "";
  }

  /* ---------- ABOUT ---------- */
  function renderAbout() {
    var bio = list(P.biography);
    $("aboutBio").innerHTML = bio.length ? bio.map(function (p) { return "<p>" + txt(p) + "</p>"; }).join("") : empty();
    var facts = [
      ["Designation", P.designation], ["Department", P.department], ["Institution", P.institution],
      ["Location", P.location], ["Qualifications", P.credentials], ["Languages", P.languages]
    ];
    $("aboutFacts").innerHTML = "<dl>" + facts.map(function (f) {
      return "<div><dt>" + esc(f[0]) + "</dt><dd>" + txt(f[1]) + "</dd></div>";
    }).join("") + "</dl>";
  }

  /* ---------- EDUCATION ---------- */
  function renderEducation() {
    var el = $("educationList");
    if (!EDU.length) { el.outerHTML = empty(); return; }
    el.innerHTML = EDU.map(function (e) {
      return '<li class="tl-item reveal"><div class="tl-card">' +
        '<div class="tl-meta"><span class="tl-date">' + txt(e.year) + "</span></div>" +
        "<h3>" + txt(e.degree) + "</h3>" +
        '<p class="tl-org">' + txt(e.institution) + "</p>" +
        (isBlank(e.specialization) ? "" : '<p class="tl-sub">' + txt(e.specialization) + "</p>") +
        (isBlank(e.link) ? "" : '<a class="tl-link" href="' + esc(e.link) + '" target="_blank" rel="noopener">Read the thesis</a>') +
        "</div></li>";
    }).join("");
  }

  /* ---------- RESEARCH ---------- */
  var pubIds = {};
  PUBS.forEach(function (p) { pubIds[p.id] = true; });
  function areaCount(a) { return list(a.relatedPublicationIds).filter(function (id) { return pubIds[id]; }).length; }

  function renderResearch() {
    var grid = $("researchGrid");
    if (!RES.length) { grid.innerHTML = empty(); $("researchChart").hidden = true; return; }
    grid.innerHTML = RES.map(function (a) {
      var n = areaCount(a);
      return '<article class="card reveal">' +
        '<div class="card__icon">' + icon(a.icon) + "</div>" +
        "<h3>" + txt(a.title) + "</h3>" +
        '<p class="card__desc">' + txt(a.description) + "</p>" +
        '<div class="tags">' + list(a.keywords).map(function (k) { return '<span class="tag">' + esc(k) + "</span>"; }).join("") + "</div>" +
        (n ? '<p class="card__count">' + n + " listed publication" + (n === 1 ? "" : "s") + "</p>" : "") +
        "</article>";
    }).join("");

    var max = Math.max.apply(null, RES.map(areaCount).concat([1]));
    $("researchChart").innerHTML = "<h3>Publications per research area</h3>" +
      '<p class="chart__sub">Based on the selected publications listed on this page; an article may belong to more than one area.</p>' +
      RES.map(function (a) {
        var n = areaCount(a);
        return '<div class="bar"><span class="bar__label">' + esc(a.title) + '</span>' +
          '<div class="bar__track" role="img" aria-label="' + esc(a.title) + ": " + n + ' publications">' +
          '<div class="bar__fill" data-width="' + Math.round((n / max) * 100) + '"></div><span class="bar__value">' + n + "</span></div></div>";
      }).join("");
  }

  /* ---------- PUBLICATIONS ---------- */
  var pubState = { type: "all", q: "", expanded: false };
  var TYPES = [["all", "All"], ["journal", "Journals"], ["conference", "Conferences"], ["other", "Other"]];
  var SELF = /(Muhammad Mans+oor Alam|Muhammad Alam|M\. ?M\. Alam|M\. Alam)/g;

  function fmtNum(n) {
    return (typeof n === "number" && isFinite(n)) ? n.toLocaleString("en-US") : null;
  }
  function renderStats() {
    var S = STATS || {};
    var tiles = [
      ["Total publications", S.totalPublications], ["Journal articles listed", S.totalJournalArticles],
      ["Conference papers", S.totalConferencePapers], ["Citations", S.totalCitations]
    ];
    if (S.hIndex != null) tiles.push(["h-index", S.hIndex]);
    if (S.i10Index != null) tiles.push(["i10-index", S.i10Index]);
    $("pubStats").innerHTML = tiles.map(function (t) {
      var v = fmtNum(t[1]);
      return '<div class="stat"><div class="stat__num' + (v ? "" : " is-placeholder") + '">' + (v || PLACEHOLDER) + '</div><div class="stat__label">' + esc(t[0]) + "</div></div>";
    }).join("");
    $("pubStatsNote").innerHTML = (S.sourceNote ? "Source: " + txt(S.sourceNote) : "") + (S.asOf ? " (as of " + esc(S.asOf) + ")" : "");
  }
  function sortedPubs() {
    return PUBS.slice().sort(function (a, b) {
      var ya = typeof a.year === "number" ? a.year : -1, yb = typeof b.year === "number" ? b.year : -1;
      return yb - ya;
    });
  }
  function typeOf(p) { return p.type === "journal" || p.type === "conference" ? p.type : "other"; }
  function matches(p) {
    if (pubState.type !== "all" && typeOf(p) !== pubState.type) return false;
    if (!pubState.q) return true;
    var hay = (p.title + " " + p.authors + " " + p.venue).toLowerCase();
    return pubState.q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }
  function renderFilters() {
    $("pubFilters").innerHTML = TYPES.map(function (t) {
      var n = t[0] === "all" ? PUBS.length : PUBS.filter(function (p) { return typeOf(p) === t[0]; }).length;
      return '<button type="button" class="pub-filter" data-type="' + t[0] + '" aria-pressed="' + (pubState.type === t[0]) + '">' + t[1] + " (" + n + ")</button>";
    }).join("");
  }
  function pubItem(p) {
    var y = typeof p.year === "number";
    var links = [];
    if (!isBlank(p.doi)) links.push('<a href="https://doi.org/' + esc(p.doi) + '" target="_blank" rel="noopener">DOI: ' + esc(p.doi) + "</a>");
    if (!isBlank(p.link)) links.push('<a href="' + esc(p.link) + '" target="_blank" rel="noopener">View article</a>');
    if (!isBlank(p.indexing)) links.push('<span class="badge badge--muted">' + esc(p.indexing) + "</span>");
    if (!isBlank(p.notice)) links.push('<span class="badge badge--danger">' + esc(p.notice) + "</span>");
    return '<li class="pub" data-id="' + esc(p.id) + '">' +
      '<div class="pub__year' + (y ? "" : " is-placeholder") + '">' + (y ? p.year : PLACEHOLDER) + "</div>" +
      "<div>" +
      '<h3 class="pub__title">' + esc(p.title) + "</h3>" +
      '<p class="pub__authors">' + esc(p.authors).replace(SELF, "<mark>$1</mark>") + "</p>" +
      '<p class="pub__venue">' + esc(p.venue) + "</p>" +
      (links.length ? '<div class="pub__foot">' + links.join("") + "</div>" : "") +
      (isBlank(p.abstract) ? "" : '<details><summary>Abstract</summary><p>' + esc(p.abstract) + "</p></details>") +
      "</div></li>";
  }
  function renderPubs() {
    var all = sortedPubs().filter(matches);
    var limited = !pubState.expanded && !pubState.q && all.length > PUB_PAGE;
    var shown = limited ? all.slice(0, PUB_PAGE) : all;
    var listEl = $("pubList");
    listEl.innerHTML = shown.length ? shown.map(pubItem).join("") : "<li>" + empty(PUBS.length ? "No publications match your search." : PLACEHOLDER) + "</li>";
    $("pubCount").textContent = "Showing " + shown.length + " of " + all.length + " matching publication" + (all.length === 1 ? "" : "s") + ".";
    var more = $("pubMore");
    if (more) more.remove();
    if (limited) {
      listEl.insertAdjacentHTML("afterend", '<div class="pub-more" id="pubMore"><button type="button" class="btn btn--outline" id="pubMoreBtn">Show all ' + all.length + " publications</button></div>");
      $("pubMoreBtn").addEventListener("click", function () { pubState.expanded = true; renderPubs(); });
    }
  }
  function initPubs() {
    renderStats(); renderFilters(); renderPubs();
    $("pubFilters").addEventListener("click", function (e) {
      var b = e.target.closest(".pub-filter");
      if (!b) return;
      pubState.type = b.getAttribute("data-type");
      Array.prototype.forEach.call(this.querySelectorAll(".pub-filter"), function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      renderPubs();
    });
    var t;
    $("pubSearch").addEventListener("input", function () {
      var v = this.value;
      clearTimeout(t);
      t = setTimeout(function () { pubState.q = v.trim().toLowerCase(); renderPubs(); }, 120);
    });
  }

  /* ---------- PROJECTS ---------- */
  function renderProjects() {
    var el = $("projectGrid");
    if (!PROJ.length) { el.innerHTML = empty(); return; }
    el.innerHTML = PROJ.map(function (p) {
      var rows = [["Role", p.role], ["Funding", p.fundingOrganization], ["Duration", p.duration], ["Area", p.researchArea], ["Collaborators", p.collaborators]];
      var outs = list(p.relatedOutputs).filter(function (id) { return pubIds[id]; });
      return '<article class="card reveal">' +
        '<div class="proj-head"><h3>' + txt(p.title) + "</h3>" +
        (isBlank(p.status) || isPh(p.status) ? "" : '<span class="badge badge--muted">' + esc(p.status) + "</span>") + "</div>" +
        '<p class="card__desc">' + txt(p.description) + "</p>" +
        '<dl class="proj-meta">' + rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + txt(r[1]) + "</dd>"; }).join("") +
        (outs.length ? "<dt>Outputs</dt><dd>" + outs.map(function (id) { return '<a href="#publications" data-pub="' + esc(id) + '">' + esc(id.toUpperCase()) + "</a>"; }).join(", ") + "</dd>" : "") +
        "</dl></article>";
    }).join("");
    el.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-pub]");
      if (!a) return;
      var p = PUBS.filter(function (x) { return x.id === a.getAttribute("data-pub"); })[0];
      if (p) { $("pubSearch").value = p.title; pubState.q = p.title.toLowerCase(); renderPubs(); }
    });
  }

  /* ---------- EXPERIENCE ---------- */
  function renderExperience() {
    var el = $("experienceList");
    if (!EXP.length) { el.outerHTML = empty(); return; }
    el.innerHTML = EXP.map(function (x) {
      var dates = [x.startDate, x.endDate].filter(function (d) { return !isBlank(d); });
      var r = list(x.responsibilities), a = list(x.achievements);
      var sub = [x.department, x.location].filter(function (d) { return !isBlank(d); }).join(" · ");
      return '<li class="tl-item reveal' + (x.current ? " is-current" : "") + '"><div class="tl-card">' +
        '<div class="tl-meta"><span class="tl-date">' + (dates.length ? dates.map(txt).join(" – ") : txt("")) + "</span>" +
        (x.current ? '<span class="badge badge--accent">Current</span>' : "") + "</div>" +
        "<h3>" + txt(x.title) + "</h3>" +
        '<p class="tl-org">' + txt(x.organization) + "</p>" +
        (sub ? '<p class="tl-sub">' + txt(sub) + "</p>" : "") +
        (r.length ? "<ul>" + r.map(function (i) { return "<li>" + txt(i) + "</li>"; }).join("") + "</ul>" : "") +
        (a.length ? '<ul class="tl-achieve">' + a.map(function (i) { return "<li>" + txt(i) + "</li>"; }).join("") + "</ul>" : "") +
        "</div></li>";
    }).join("");
  }

  /* ---------- AWARDS ---------- */
  function renderAwards() {
    var el = $("awardGrid");
    if (!AWARDS_.length) { el.innerHTML = empty(); return; }
    el.innerHTML = AWARDS_.map(function (w) {
      var y = !isBlank(w.year);
      return '<article class="card award reveal">' +
        '<div class="award__year' + (y ? "" : " placeholder") + '"' + (y ? "" : ' style="font-size:.9rem"') + ">" + (y ? esc(w.year) : PLACEHOLDER) + "</div>" +
        "<h3>" + txt(w.title) + "</h3>" +
        '<p class="award__org">' + txt(w.organization) + "</p>" +
        (isBlank(w.description) ? "" : "<p>" + txt(w.description) + "</p>") +
        "</article>";
    }).join("");
  }

  /* ---------- CERTIFICATIONS ---------- */
  function renderCerts() {
    var el = $("certGrid");
    if (!CERTS.length) { el.outerHTML = empty(); return; }
    el.innerHTML = CERTS.map(function (c) {
      return '<li class="cert reveal"><span class="cert__icon">' + icon("cert") + "</span><div><h3>" + txt(c.title) + "</h3><p>" + txt(c.issuer) + "</p></div></li>";
    }).join("");
  }

  /* ---------- SKILLS ---------- */
  function renderSkills() {
    var groups = [["research", "Research"], ["technical", "Technical"], ["teaching", "Teaching & Supervision"], ["professional", "Professional"]];
    $("skillsGrid").innerHTML = groups.map(function (g) {
      var items = list(SK[g[0]]);
      return '<div class="skill-group reveal"><h3>' + g[1] + "</h3>" +
        (items.length ? "<ul>" + items.map(function (s) { return "<li>" + txt(s) + "</li>"; }).join("") + "</ul>" : empty()) + "</div>";
    }).join("");
  }

  /* ---------- CV ---------- */
  function renderCV() {
    var href = (P.heroButtons && P.heroButtons.secondary && P.heroButtons.secondary.href) || "";
    if (isBlank(href)) { $("cvCard").innerHTML = "<p>" + PLACEHOLDER + "</p>"; return; }
    $("cvCard").innerHTML =
      '<div class="cv-card__icon">' + icon("file") + "</div>" +
      "<div><h3>Curriculum Vitae</h3><p>Full record of education, appointments, research funding, awards and selected publications (PDF).</p></div>" +
      '<div class="cv-card__actions">' +
      '<a class="btn btn--primary" href="' + esc(href) + '" target="_blank" rel="noopener">' + icon("external") + "View CV</a>" +
      '<a class="btn btn--ghost" href="' + esc(href) + '" target="_blank" rel="noopener">' + icon("download") + "Download CV</a></div>";
  }

  /* ---------- CONTACT ---------- */
  function renderContact() {
    var c = P.contact || {};
    var items = [];
    items.push(["mail", "Email", isBlank(c.email) ? txt("") : '<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a>"]);
    items.push(["pin", "Address", txt(c.institutionAddress)]);
    items.push(["building", "Office", txt(c.office)]);
    $("contactInfo").innerHTML = items.map(function (i) {
      return '<div class="contact__item"><span class="contact__item-icon">' + icon(i[0]) + "</span><div><h3>" + i[1] + "</h3><p>" + i[2] + "</p></div></div>";
    }).join("");

    var form = $("contactForm");
    function setErr(input, errEl, msg) {
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg) input.setAttribute("aria-describedby", errEl.id); else input.removeAttribute("aria-describedby");
      errEl.textContent = msg;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = $("cfName"), m = $("cfEmail"), msg = $("cfMessage");
      var ok = true, first = null;
      function check(input, errEl, message) { setErr(input, errEl, message); if (message) { ok = false; first = first || input; } }
      check(n, $("cfNameErr"), n.value.trim() ? "" : "Please enter your name.");
      check(m, $("cfEmailErr"), /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.value.trim()) ? "" : "Please enter a valid email address.");
      check(msg, $("cfMessageErr"), msg.value.trim().length >= 10 ? "" : "Please enter a message (at least 10 characters).");
      if (!ok) { $("formStatus").textContent = ""; first.focus(); return; }
      $("formStatus").textContent = "Thank you — your message has been noted. (This form is not yet connected to an email service; please also write to " + (c.email || "the address shown") + ".)";
      form.reset();
    });
  }

  /* ---------- FOOTER ---------- */
  function renderFooter() {
    $("footerText").textContent = "© " + new Date().getFullYear() + " " + (P.fullName || "") + (P.institution ? " · " + P.institution : "");
    renderSocial($("footerSocial"));
  }

  /* ---------- behaviour ---------- */
  function initNav() {
    var toggle = $("navToggle"), menu = $("navMenu");
    function close() { menu.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "Open menu"); }
    toggle.addEventListener("click", function () {
      var open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) close(); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("is-open")) { close(); toggle.focus(); } });
    window.addEventListener("resize", function () { if (window.innerWidth > 1180) close(); });
  }

  function initScroll() {
    var links = Array.prototype.slice.call(doc.querySelectorAll(".nav__menu a"));
    var sections = links.map(function (a) { return doc.querySelector(a.getAttribute("href")); }).filter(Boolean);
    var bar = $("scrollProgress"), header = $("siteHeader"), top = $("toTop");
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.pageYOffset, h = doc.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      header.classList.toggle("is-scrolled", y > 8);
      top.classList.toggle("is-visible", y > 600);
      var mark = y + parseInt(getComputedStyle(doc.documentElement).getPropertyValue("--nav-height"), 10) + 40;
      var current = sections[0];
      sections.forEach(function (s) { if (s.offsetTop <= mark) current = s; });
      if (y + window.innerHeight >= doc.documentElement.scrollHeight - 4) current = sections[sections.length - 1];
      links.forEach(function (a) {
        var on = current && a.getAttribute("href") === "#" + current.id;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); $("navBrand").focus({ preventScroll: true }); });
    update();
  }

  function fillBars() {
    Array.prototype.forEach.call(doc.querySelectorAll(".bar__fill"), function (b) { b.style.width = b.getAttribute("data-width") + "%"; });
  }
  function initReveal() {
    var els = doc.querySelectorAll(".reveal");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add("is-visible"); });
      fillBars(); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-visible");
        if (en.target.id === "researchChart") fillBars();
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  /* ---------- go ---------- */
  renderHero(); renderAbout(); renderEducation(); renderResearch(); initPubs();
  renderProjects(); renderExperience(); renderAwards(); renderCerts(); renderSkills();
  renderCV(); renderContact(); renderFooter();
  initNav(); initScroll(); initReveal();
})();
