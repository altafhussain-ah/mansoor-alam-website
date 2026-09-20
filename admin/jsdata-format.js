/* =========================================================
   Teaches the admin panel (Decap CMS) to read and write the
   site's data/*.js files, which look like:
       const NAME = { ...JSON... };
   A file may contain several such declarations.
   ========================================================= */
(function (root) {
  "use strict";

  var HEADERS = {
    PROFILE: "PROFILE — name, headline, biography, contact, social links.\n   Leave a social link as \"\" to hide it.",
    EDUCATION: "EDUCATION — newest first. \"link\" is optional (\"\" hides it).",
    EXPERIENCE: "EXPERIENCE — complete career history, newest first.\n   Exactly ONE entry may have \"current\": true (gets the Current badge).",
    RESEARCH_AREAS: "RESEARCH AREAS — icon: brain | code | eye | chip | compass.\n   relatedPublicationIds: ids from publications.js (drives the bar chart).",
    PUBLICATIONS: "PUBLICATIONS — id: j# journal, c# conference, o# other.\n   year: a number, or null if unknown. notice: shows a red tag (e.g. retraction).\n   PUBLICATION_STATS: the figures at the top of the section (null = unknown).",
    PROJECTS: "PROJECTS & RESEARCH FUNDING — relatedOutputs: publication ids.",
    AWARDS: "AWARDS & ACHIEVEMENTS — year: text such as \"2012\" or \"2010 – 2011\"; \"\" if unknown.",
    CERTIFICATIONS: "CERTIFICATIONS & PROFESSIONAL TRAINING",
    SKILLS: "SKILLS & EXPERTISE — four groups of short phrases."
  };

  function fromFile(text) {
    var src = String(text || "");
    var re = /(^|\n)\s*const\s+([A-Z_][A-Z0-9_]*)\s*=\s*/g;
    var hits = [], m;
    while ((m = re.exec(src))) hits.push({ name: m[2], start: m.index, valueStart: re.lastIndex });
    var out = {};
    hits.forEach(function (h, i) {
      var end = i + 1 < hits.length ? hits[i + 1].start : src.length;
      var raw = src.slice(h.valueStart, end).trim().replace(/;\s*$/, "");
      out[h.name] = JSON.parse(raw);
    });
    return out;
  }

  /* Decap may leave empty strings in number fields — turn them back into null */
  function clean(v) {
    if (Array.isArray(v)) return v.map(clean);
    if (v && typeof v === "object") {
      var o = {};
      Object.keys(v).forEach(function (k) { o[k] = clean(v[k]); });
      return o;
    }
    return v === undefined ? null : v;
  }

  function toFile(data) {
    var names = Object.keys(data || {}).filter(function (k) { return /^[A-Z_][A-Z0-9_]*$/.test(k); });
    var first = names[0] || "";
    var head = "/* =========================================================\n   " +
      (HEADERS[first] || first) +
      "\n   This file is edited by the admin panel (/admin) — you can also\n   edit it by hand; keep it valid JSON after the \"=\" sign.\n   ========================================================= */\n";
    return head + names.map(function (n) {
      return "const " + n + " = " + JSON.stringify(clean(data[n]), null, 2) + ";\n";
    }).join("");
  }

  var api = { fromFile: fromFile, toFile: toFile };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root && root.CMS) root.CMS.registerCustomFormat("jsdata", "js", api);
})(typeof window !== "undefined" ? window : null);
