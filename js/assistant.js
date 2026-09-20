/* =========================================================
   Site assistant — a free, in-browser Q&A helper.
   It answers ONLY from the content in data/*.js (no AI service,
   no internet calls, no cost). Edit the data files and the
   assistant's knowledge updates automatically.
   ========================================================= */
(function () {
  "use strict";

  var doc = document;
  var P = typeof PROFILE !== "undefined" ? PROFILE : {};
  var EDU = typeof EDUCATION !== "undefined" ? EDUCATION : [];
  var EXP = typeof EXPERIENCE !== "undefined" ? EXPERIENCE : [];
  var RES = typeof RESEARCH_AREAS !== "undefined" ? RESEARCH_AREAS : [];
  var PUBS = typeof PUBLICATIONS !== "undefined" ? PUBLICATIONS : [];
  var STATS = typeof PUBLICATION_STATS !== "undefined" ? PUBLICATION_STATS : {};
  var PROJ = typeof PROJECTS !== "undefined" ? PROJECTS : [];
  var AW = typeof AWARDS !== "undefined" ? AWARDS : [];
  var CERTS = typeof CERTIFICATIONS !== "undefined" ? CERTIFICATIONS : [];
  var SK = typeof SKILLS !== "undefined" ? SKILLS : {};

  var PH = "[Information to be added]";
  var NAME = P.shortName || P.fullName || "the professor";
  var SURNAME = (P.shortName || "").split(" ").slice(-1)[0] || NAME;
  var HONORIFIC = /Prof/i.test(P.fullName || "") ? "Prof. " + SURNAME : NAME;

  /* ---------- text helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function known(v) { return v != null && String(v).trim() !== "" && String(v).indexOf(PH) === -1; }
  function clean(v) { return String(v || "").replace(/\s*[—–-]?\s*(project title)?\s*\[Information to be added\]\s*/gi, " ").replace(/\s+([.,;:])/g, "$1").trim(); }
  var STOP = "a an the of in on at to for and or is are was were be been by with about from as it its this that these those what which who whom whose how when where why do does did can could would should will has have had he his him she her they their them me my i you your prof professor dr doctor mansoor alam muhammad sir please tell show give list any some all more much many there here also get find know want need like".split(" ");
  var STOPSET = {}; STOP.forEach(function (w) { STOPSET[w] = 1; });
  function stem(w) {
    if (w.length > 5 && /ies$/.test(w)) return w.slice(0, -3) + "y";
    if (w.length > 5 && /ing$/.test(w)) return w.slice(0, -3);
    if (w.length > 4 && /ed$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
    return w;
  }
  var SYN = { ai: "artificial intelligence", ml: "machine learning", dl: "deep learning", iot: "internet things iot", sdn: "software defined networking sdn", nlp: "sentiment text language", cnn: "convolutional neural network", "5g": "5g network", uav: "uav drone aerial", xai: "explainable artificial intelligence", gsd: "global software development" };
  function tokens(text) {
    var t = String(text || "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9\s-]/g, " ");
    var out = [];
    t.split(/[\s-]+/).forEach(function (w) {
      if (!w) return;
      if (SYN[w]) { SYN[w].split(" ").forEach(function (x) { out.push(stem(x)); }); return; }
      if (STOPSET[w] || w.length < 2) return;
      out.push(stem(w));
    });
    return out;
  }

  /* ---------- knowledge index ---------- */
  var DOCS = [];
  function addDoc(kind, text, item) { DOCS.push({ kind: kind, item: item, toks: tokens(text) }); }
  PUBS.forEach(function (p) { addDoc("pub", [p.title, p.venue, p.indexing].join(" "), p); });
  RES.forEach(function (r) { addDoc("research", [r.title, r.description, (r.keywords || []).join(" ")].join(" "), r); });
  PROJ.forEach(function (r) { addDoc("project", [r.title, r.description, r.fundingOrganization, r.researchArea].join(" "), r); });
  EXP.forEach(function (r) { addDoc("exp", [r.title, r.organization, r.department, r.location, (r.responsibilities || []).join(" ")].join(" "), r); });
  EDU.forEach(function (r) { addDoc("edu", [r.degree, r.institution, r.specialization].join(" "), r); });
  AW.forEach(function (r) { addDoc("award", [r.title, r.organization, r.description].join(" "), r); });
  CERTS.forEach(function (r) { addDoc("cert", [r.title, r.issuer].join(" "), r); });
  var DF = {};
  DOCS.forEach(function (d) { var seen = {}; d.toks.forEach(function (t) { if (!seen[t]) { seen[t] = 1; DF[t] = (DF[t] || 0) + 1; } }); });
  function score(qt, d) {
    var s = 0, hit = 0;
    qt.forEach(function (t) {
      if (d.toks.indexOf(t) !== -1) { s += Math.log(1 + DOCS.length / (DF[t] || 1)); hit++; }
    });
    return hit ? s * (hit / qt.length + 0.5) : 0;
  }
  function search(q, kinds, limit) {
    var qt = tokens(q);
    if (!qt.length) return [];
    return DOCS.filter(function (d) { return !kinds || kinds.indexOf(d.kind) !== -1; })
      .map(function (d) { return { d: d, s: score(qt, d) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, limit || 5);
  }

  /* ---------- answer builders ---------- */
  function link(section, label) { return '<button type="button" class="ai-jump" data-jump="' + section + '">' + esc(label) + " →</button>"; }
  function ul(items) { return "<ul>" + items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul>"; }
  function pubLine(p) {
    var y = typeof p.year === "number" ? p.year + " · " : "";
    var doi = known(p.doi) ? ' <a href="https://doi.org/' + esc(p.doi) + '" target="_blank" rel="noopener">DOI</a>' : "";
    var note = known(p.notice) ? ' <span class="ai-note">(' + esc(p.notice) + ")</span>" : "";
    return "<strong>" + esc(p.title) + "</strong><br><span class=\"ai-muted\">" + y + esc(p.venue) + "</span>" + doi + note;
  }
  function fmt(n) { return typeof n === "number" ? n.toLocaleString("en-US") : null; }
  function current() { return EXP.filter(function (e) { return e.current; })[0] || EXP[0]; }

  var A = {
    greet: function () {
      return "Hello! I'm the site assistant for <strong>" + esc(P.fullName || NAME) + "</strong>. Ask me about his research, publications, education, career, awards or how to get in touch.";
    },
    thanks: function () { return "You're welcome! Anything else you'd like to know?"; },
    help: function () {
      return "I can answer questions using the information on this website, for example:" +
        ul(["Who is " + esc(HONORIFIC) + "?", "What are his research areas?", "Papers on machine learning / IoT / computer vision", "Publications from 2024", "Citations and h-index", "Where did he do his PhD?", "How can I contact him?"]);
    },
    about: function () {
      var bio = (P.biography || []).filter(known)[0] || P.introduction || "";
      return esc(clean(bio)) + "<br>" + link("about", "Read the full biography");
    },
    position: function () {
      var c = current();
      var out = "<strong>" + esc(P.fullName || NAME) + "</strong> is " + esc(P.designation || (c && c.title) || "") +
        (known(P.department) ? ", " + esc(P.department) : "") + (known(P.institution) ? ", " + esc(P.institution) : "") +
        (known(P.location) ? " (" + esc(P.location) + ")" : "") + ".";
      var others = EXP.filter(function (e) { return /present/i.test(e.endDate || "") && !e.current; });
      if (others.length) out += "<br>He also currently holds:" + ul(others.map(function (e) { return esc(e.title) + ", " + esc(e.organization); }));
      return out + link("experience", "See full career");
    },
    contact: function () {
      var c = P.contact || {};
      var rows = [];
      if (known(c.email)) rows.push('Email: <a href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a>");
      if (known(c.institutionAddress)) rows.push("Address: " + esc(c.institutionAddress));
      if (known(c.office)) rows.push("Office: " + esc(c.office));
      return (rows.length ? "You can reach him here:" + ul(rows) : "Contact details haven't been added yet.") + link("contact", "Open the contact form");
    },
    education: function (q) {
      var items = EDU;
      var f = null;
      if (/post\s*-?doc/i.test(q)) f = /post/i;
      else if (/ph\.?\s?d|doctor/i.test(q)) f = /ph\.?d/i;
      else if (/\bms\b|master|m\.?sc|mphil/i.test(q)) f = /^(ms|m\.sc|mphil)/i;
      else if (/b\.?sc|bachelor|undergrad/i.test(q)) f = /^b\.?sc/i;
      if (f) { var sub = EDU.filter(function (e) { return f.test(e.degree); }); if (sub.length) items = sub; }
      return (items === EDU ? "His academic qualifications:" : "Here's what I found:") + ul(items.map(function (e) {
        return "<strong>" + esc(e.degree) + "</strong> — " + esc(e.institution) + (known(e.year) ? " (" + esc(e.year) + ")" : "") +
          (known(e.specialization) ? '<br><span class="ai-muted">' + esc(e.specialization) + "</span>" : "");
      })) + link("education", "View academic profile");
    },
    experience: function (q) {
      var hits = search(q, ["exp"], 3).filter(function (h) { return h.s > 1.5; });
      if (hits.length && tokens(q).some(function (t) { return !/^(experience|career|work|job|position|role|past|previou|history)$/.test(t); })) {
        return ul(hits.map(function (h) {
          var e = h.d.item;
          return "<strong>" + esc(e.title) + "</strong>, " + esc(e.organization) + ' <span class="ai-muted">(' + esc([e.startDate, e.endDate].filter(known).join(" – ")) + ")</span>" +
            ((e.responsibilities || []).filter(known).length ? ul(e.responsibilities.filter(known).slice(0, 4).map(esc)) : "");
        })) + link("experience", "See full career");
      }
      return "His career so far:" + ul(EXP.filter(function (e) { return known(e.title) || known(e.organization); }).slice(0, 8).map(function (e) {
        return esc(clean(e.title) || "Role") + ", " + esc(e.organization) + ' <span class="ai-muted">(' + esc([e.startDate, e.endDate].filter(known).join(" – ")) + ")</span>";
      })) + link("experience", "See full career");
    },
    leadership: function () {
      var rows = [];
      EXP.forEach(function (e) { (e.responsibilities || []).forEach(function (r) { if (/dean|head|hod|director|chair|coordinator|cluster|editor/i.test(r)) rows.push(esc(r) + ' <span class="ai-muted">— ' + esc(e.organization) + "</span>"); }); });
      return rows.length ? "Leadership and service roles:" + ul(rows.slice(0, 10)) + link("experience", "See full career") : null;
    },
    research: function () {
      return "His main research areas:" + ul(RES.map(function (r) { return "<strong>" + esc(r.title) + "</strong>" + ((r.keywords || []).length ? '<br><span class="ai-muted">' + esc(r.keywords.join(", ")) + "</span>" : ""); })) + link("research", "Explore research");
    },
    metrics: function () {
      var S = STATS, rows = [];
      if (fmt(S.totalPublications)) rows.push("Publications: <strong>" + fmt(S.totalPublications) + "</strong>");
      if (fmt(S.totalCitations)) rows.push("Citations: <strong>" + fmt(S.totalCitations) + "</strong>");
      if (fmt(S.hIndex)) rows.push("h-index: <strong>" + fmt(S.hIndex) + "</strong>");
      if (fmt(S.i10Index)) rows.push("i10-index: <strong>" + fmt(S.i10Index) + "</strong>");
      return "Research metrics" + (known(S.asOf) ? " (as of " + esc(S.asOf) + ")" : "") + ":" + ul(rows) +
        '<span class="ai-muted">' + esc(clean(S.sourceNote || "")) + "</span>" +
        (P.socialLinks && known(P.socialLinks.googleScholar) ? '<br><a href="' + esc(P.socialLinks.googleScholar) + '" target="_blank" rel="noopener">Google Scholar profile</a>' : "");
    },
    pubYear: function (year) {
      var list = PUBS.filter(function (p) { return p.year === year; });
      if (!list.length) return "I couldn't find publications from " + year + " among the " + PUBS.length + " listed on this site." + link("publications", "Browse all publications");
      return "<strong>" + list.length + "</strong> listed publication" + (list.length > 1 ? "s" : "") + " from " + year + ":" + ul(list.slice(0, 6).map(pubLine)) +
        (list.length > 6 ? '<span class="ai-muted">…and ' + (list.length - 6) + " more.</span><br>" : "") + link("publications", "See all publications");
    },
    pubLatest: function () {
      var list = PUBS.filter(function (p) { return typeof p.year === "number"; }).sort(function (a, b) { return b.year - a.year; });
      return "His most recent listed publications:" + ul(list.slice(0, 5).map(pubLine)) + link("publications", "See all publications");
    },
    pubCount: function () {
      var S = STATS;
      return (fmt(S.totalPublications) ? "He has <strong>" + fmt(S.totalPublications) + "</strong> publications in total" + (known(S.asOf) ? " (as of " + esc(S.asOf) + ")" : "") + ". " : "") +
        "This website lists <strong>" + PUBS.length + "</strong> selected journal articles." + link("publications", "Browse publications");
    },
    pubTopic: function (q) {
      var topic = q.replace(/\b(papers?|publications?|articles?|research|work|works|published|publish|journals?|on|about|in|related|to|regarding|any|his|he|has|did|written|write|wrote|show|list|find|me)\b/gi, " ").trim();
      var hits = search(topic || q, ["pub"], 60).filter(function (h) { return h.s > 1.2; });
      if (!hits.length) return null;
      var top = hits.slice(0, 5).map(function (h) { return h.d.item; });
      return "I found <strong>" + hits.length + "</strong> related publication" + (hits.length > 1 ? "s" : "") + ". Top matches:" + ul(top.map(pubLine)) +
        '<button type="button" class="ai-jump" data-pubsearch="' + esc(topic || q) + '">Show these in Publications →</button>';
    },
    retracted: function () {
      var list = PUBS.filter(function (p) { return /retract/i.test(p.notice || ""); });
      return list.length ? "These listed publications carry a retraction notice:" + ul(list.map(pubLine)) : "None of the listed publications carry a retraction notice.";
    },
    awards: function () {
      return "Awards and achievements:" + ul(AW.map(function (a) { return "<strong>" + esc(a.title) + "</strong>" + (known(a.organization) ? " — " + esc(a.organization) : "") + (known(a.year) ? ' <span class="ai-muted">(' + esc(a.year) + ")</span>" : ""); })) + link("awards", "View awards");
    },
    funding: function () {
      var list = PROJ.filter(function (p) { return known(p.fundingOrganization) || /grant/i.test(p.title); });
      var aw = AW.filter(function (a) { return /grant|scholarship|funding/i.test(a.title); });
      var rows = list.map(function (p) { return "<strong>" + esc(clean(p.title)) + "</strong>" + (known(p.fundingOrganization) ? " — " + esc(p.fundingOrganization) : "") + (known(p.duration) ? ' <span class="ai-muted">(' + esc(clean(p.duration)) + ")</span>" : ""); });
      aw.forEach(function (a) { if (!list.some(function (p) { return p.title.indexOf(a.title) !== -1; })) rows.push("<strong>" + esc(a.title) + "</strong> — " + esc(a.organization) + (known(a.year) ? ' <span class="ai-muted">(' + esc(a.year) + ")</span>" : "")); });
      return "Research funding and grants:" + ul(rows) + link("projects", "View projects");
    },
    projects: function () {
      return "Research projects:" + ul(PROJ.map(function (p) { return "<strong>" + esc(clean(p.title)) + "</strong>" + (known(p.status) ? ' <span class="ai-muted">(' + esc(p.status) + ")</span>" : ""); })) + link("projects", "View projects");
    },
    certs: function () {
      return "Certifications and training:" + ul(CERTS.map(function (c) { return esc(c.title) + (known(c.issuer) ? ' <span class="ai-muted">— ' + esc(c.issuer) + "</span>" : ""); })) + link("certifications", "View certifications");
    },
    skills: function () {
      var g = [["Research", SK.research], ["Technical", SK.technical], ["Teaching & supervision", SK.teaching], ["Professional", SK.professional]];
      return g.filter(function (x) { return (x[1] || []).length; }).map(function (x) { return "<strong>" + x[0] + ":</strong> " + esc(x[1].join(", ")); }).join("<br>") + "<br>" + link("skills", "View skills");
    },
    supervision: function () {
      var rows = [];
      (SK.teaching || []).forEach(function (t) { if (/supervis/i.test(t)) rows.push(esc(t)); });
      EXP.forEach(function (e) { (e.responsibilities || []).forEach(function (r) { if (/supervis/i.test(r) && known(r)) rows.push(esc(r) + ' <span class="ai-muted">— ' + esc(e.organization) + "</span>"); }); });
      var out = rows.length ? "Supervision:" + ul(rows) : "";
      var c = P.contact || {};
      if (known(c.email)) out += 'Prospective students can write to <a href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a>.";
      return out;
    },
    cv: function () {
      var c = P.contact || {};
      return "The CV isn't available for download on this website. Most of its content — education, career, research, publications and awards — is shown on this page." +
        (known(c.email) ? ' For a copy, please email <a href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a>." : "");
    },
    profiles: function () {
      var L = P.socialLinks || {}, names = { googleScholar: "Google Scholar", orcid: "ORCID", scopus: "Scopus", researchGate: "ResearchGate", universityProfile: "University profile", linkedin: "LinkedIn", dblp: "dblp", github: "GitHub", academiaEdu: "Academia.edu" };
      var rows = Object.keys(names).filter(function (k) { return known(L[k]); }).map(function (k) { return '<a href="' + esc(L[k]) + '" target="_blank" rel="noopener">' + names[k] + "</a>"; });
      return rows.length ? "His academic profiles:" + ul(rows) : null;
    },
    fallback: function (q) {
      var hits = search(q, null, 4).filter(function (h) { return h.s > 1.2; });
      if (hits.length) {
        var label = { pub: "Publication", research: "Research area", project: "Project", exp: "Experience", edu: "Education", award: "Award", cert: "Certification" };
        return "Here's what I found on the site:" + ul(hits.map(function (h) {
          var it = h.d.item, k = h.d.kind;
          if (k === "pub") return pubLine(it);
          var t = it.title || it.degree || "";
          var sub = it.organization || it.institution || it.issuer || it.fundingOrganization || "";
          return '<span class="ai-muted">' + label[k] + ":</span> <strong>" + esc(clean(t)) + "</strong>" + (known(sub) ? " — " + esc(sub) : "");
        }));
      }
      var c = P.contact || {};
      return "Sorry, I couldn't find that on this website. I can only answer from the information shown here." +
        (known(c.email) ? ' You could ask directly at <a href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a>." : "") + "<br>Try: <em>research areas</em>, <em>papers on IoT</em>, <em>h-index</em> or <em>education</em>.";
    }
  };

  /* ---------- intent router ---------- */
  function answer(raw) {
    var q = raw.trim(), l = q.toLowerCase();
    if (!q) return A.help();
    if (/^(hi|hello|hey|salam|assalam|aoa|good (morning|afternoon|evening))\b/.test(l) && l.split(/\s+/).length <= 4) return A.greet();
    if (/^(thanks|thank you|thx|jazak|shukriya)/.test(l)) return A.thanks();
    if (/\b(help|what can you (do|answer)|how does this work)\b/.test(l)) return A.help();
    if (/\b(cv|resume|résumé|curriculum vitae)\b/.test(l)) return A.cv();
    if (/retract/.test(l)) return A.retracted();
    if (/(h-?\s?index|i10|citation|cited|impact|metrics?|scholar stat)/.test(l)) return A.metrics();
    if (/(contact|email|e-mail|reach|get in touch|address|office|meet|phone|call)/.test(l)) return A.contact();
    if (/(google scholar|orcid|scopus|researchgate|linkedin|profiles?\b|social)/.test(l)) return A.profiles() || A.contact();
    var y = l.match(/\b(19[89]\d|20[0-4]\d)\b/);
    if (y && /(paper|publication|article|publish|journal|research|work)/.test(l)) return A.pubYear(+y[1]);
    if (/(latest|recent|newest|new) (paper|publication|article|work|research)/.test(l)) return A.pubLatest();
    if (/how many (paper|publication|article)|number of (paper|publication)|total (paper|publication)/.test(l)) return A.pubCount();
    if (/(supervis|phd student|students|postdoc(toral)? (position|researcher)|admission|join (his|the) (lab|group)|prospective)/.test(l)) return A.supervision() || A.fallback(q);
    if (/(post\s*-?doc|ph\.?\s?d|degree|education|qualification|studied|study|university did|graduat|master|bachelor|m\.?sc|b\.?sc|thesis|alma mater)/.test(l)) return A.education(q);
    if (/(award|honou?r|prize|medal|recogni|achievement)/.test(l)) return A.awards();
    if (/(grant|fund|nrpu|scholarship)/.test(l)) return A.funding();
    if (/(project)/.test(l)) return A.projects();
    if (/(certif|training|ccna|cisco|course taken)/.test(l)) return A.certs();
    if (/(dean|head of|hod|leadership|director|admin(istrative)? role|editor|reviewer)/.test(l)) return A.leadership() || A.experience(q);
    if (/(skill|expertise|good at|technolog|tools)/.test(l)) return A.skills();
    if (/(paper|publication|article|published|journal)/.test(l)) return A.pubTopic(q) || A.pubCount();
    if (/(research (area|interest|field|focus|topic)|research\?*$|interests?|work on|field|speciali[sz])/.test(l)) {
      var t = A.pubTopic(q);
      return /(area|interest|field|focus|topic)|research\?*$/.test(l) || !t ? A.research() : t;
    }
    if (/(current|currently|now|present) (position|job|role|work)|where does he work|what does he do|designation|job title|which university/.test(l)) return A.position();
    if (/(experience|career|worked|work history|previous|past (job|position)|visiting|adjunct|taught|teach)/.test(l)) return A.experience(q);
    if (/^(who|about|introduce|tell me about|bio|biography)\b|who is/.test(l)) return A.about();
    return A.pubTopic(q) || A.fallback(q);
  }

  /* ---------- UI ---------- */
  var SUGGEST = ["Who is " + HONORIFIC + "?", "Research areas", "Papers on machine learning", "Citations & h-index", "Education", "How to contact?"];
  var ICON_CHAT = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var photo = (P.photo && P.photo.src) || "";

  var root = doc.createElement("div");
  root.className = "ai";
  root.innerHTML =
    '<button type="button" class="ai-launcher" id="aiLauncher" aria-expanded="false" aria-controls="aiPanel">' + ICON_CHAT + '<span class="ai-launcher__label">Ask me</span></button>' +
    '<section class="ai-panel" id="aiPanel" role="dialog" aria-modal="false" aria-labelledby="aiTitle" hidden>' +
      '<header class="ai-head">' +
        (photo ? '<img class="ai-avatar" src="' + esc(photo) + '" alt="" width="40" height="40">' : '<span class="ai-avatar ai-avatar--dot"></span>') +
        '<div class="ai-head__text"><h2 id="aiTitle">Ask about ' + esc(HONORIFIC) + '</h2><p><span class="ai-live"></span>Instant answers from this website</p></div>' +
        '<button type="button" class="ai-close" id="aiClose" aria-label="Close assistant">' + ICON_X + "</button>" +
      "</header>" +
      '<div class="ai-log" id="aiLog" role="log" aria-live="polite" aria-relevant="additions"></div>' +
      '<div class="ai-chips" id="aiChips"></div>' +
      '<form class="ai-form" id="aiForm" autocomplete="off">' +
        '<label for="aiInput" class="visually-hidden">Your question</label>' +
        '<input id="aiInput" type="text" maxlength="200" placeholder="Ask a question…">' +
        '<button type="submit" class="ai-send" aria-label="Send">' + ICON_SEND + "</button>" +
      "</form>" +
      '<p class="ai-foot">Answers come only from the content on this page.</p>' +
    "</section>";
  doc.body.appendChild(root);

  var launcher = doc.getElementById("aiLauncher"), panel = doc.getElementById("aiPanel"), log = doc.getElementById("aiLog");
  var form = doc.getElementById("aiForm"), input = doc.getElementById("aiInput"), chips = doc.getElementById("aiChips");
  var started = false;

  function bubble(html, who) {
    var d = doc.createElement("div");
    d.className = "ai-msg ai-msg--" + who;
    d.innerHTML = html;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  function renderChips() {
    chips.innerHTML = SUGGEST.map(function (s) { return '<button type="button" class="ai-chip">' + esc(s) + "</button>"; }).join("");
  }
  function ask(text) {
    if (!text.trim()) return;
    bubble(esc(text), "user");
    var typing = bubble('<span class="ai-typing"><i></i><i></i><i></i></span>', "bot");
    var reply;
    try { reply = answer(text); } catch (e) { reply = A.fallback(text); }
    setTimeout(function () { typing.innerHTML = reply; log.scrollTop = log.scrollHeight; }, 380 + Math.min(text.length * 8, 420));
  }
  function open() {
    panel.hidden = false;
    root.classList.add("is-open");
    launcher.setAttribute("aria-expanded", "true");
    if (!started) { started = true; bubble(A.greet(), "bot"); renderChips(); }
    setTimeout(function () { input.focus(); }, 60);
  }
  function close() {
    root.classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
    setTimeout(function () { panel.hidden = true; }, 200);
    launcher.focus();
  }
  launcher.addEventListener("click", function () { root.classList.contains("is-open") ? close() : open(); });
  doc.getElementById("aiClose").addEventListener("click", close);
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && root.classList.contains("is-open")) close(); });
  form.addEventListener("submit", function (e) { e.preventDefault(); var v = input.value; input.value = ""; ask(v); });
  chips.addEventListener("click", function (e) { var b = e.target.closest(".ai-chip"); if (b) ask(b.textContent); });
  log.addEventListener("click", function (e) {
    var b = e.target.closest(".ai-jump");
    if (!b) return;
    var q = b.getAttribute("data-pubsearch");
    var target = q !== null ? "publications" : b.getAttribute("data-jump");
    if (q !== null) {
      var s = doc.getElementById("pubSearch");
      if (s) { s.value = q; s.dispatchEvent(new Event("input", { bubbles: true })); }
    }
    var sec = doc.getElementById(target);
    if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.innerWidth < 640) close();
  });

  /* expose for testing */
  window.__siteAssistant = { answer: answer };
})();
