/* screens-publish: the review copy saved as a stamped file (R40; DEC-330 A81; `review` R11, R35; `public-read` R7;
 * `control-plane` R20). Built in the page from the one answer `reviewcopy` gave the member, and handed to the member by the
 * kit's own save control; stored nowhere, sent nowhere. Self-contained like `PARTS`; the file's sentences are read by key. */

export const REVIEW_COPY_FILE = Object.freeze({
  /* The stamp the control plane attached to the answer (`inband`): the fingerprint over the copy's bytes, the date it last
     changed, its author and the minimum strengths it was read at; null when the answer carries any of them not, because a copy
     may not leave without all four. */
  stampOf: function (copy) {
    const s = copy && typeof copy === "object" && copy.inband && typeof copy.inband === "object" ? copy.inband : copy;
    const hash = s && s.hash && typeof s.hash === "object" ? String(s.hash.sha256 || "").toLowerCase() : "";
    const date = s && typeof s.date === "string" ? s.date : "";
    const author = s && typeof s.author === "string" ? s.author : "";
    const floors = s && s.floors && typeof s.floors === "object" ? s.floors : null;
    return /^[0-9a-f]{64}$/.test(hash) && date && author && floors ? { hash: hash, date: date, author: author, floors: floors } : null;
  },

  /* The file is named by the case, its edition and the short fingerprint. */
  fileName: function (copy, stamp) {
    const c = copy && copy.case && typeof copy.case === "object" ? copy.case : {};
    const part = function (x) { return String(x === undefined || x === null ? "" : x).replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, ""); };
    return [part(c.case_id || c.identity || copy.draft || "review-copy"), c.edition ? "edition-" + part(c.edition) : "", stamp.hash.slice(0, 8)].filter(Boolean).join("-") + ".html";
  },

  /* The stamped HTML file: the stamp on every page of a printout (a fixed header the file's own style repeats), then the
     copy's case, authored fields, findings, gates and what is missing as the answer states them. The grant part, the
     readers' names and the comments are not in it. */
  stampedFile: function (cs, copy, stamp) {
    const E = cs.esc, c = copy.case && typeof copy.case === "object" ? copy.case : {}, a = copy.authored && typeof copy.authored === "object" ? copy.authored : {};
    const list = function (x) { return Array.isArray(x) ? x : []; };
    const text = function (x) { return typeof x === "string" ? x : x && typeof x === "object" ? String(x.text || x.says || x.description || x.detail || x.target || x.code || "") : ""; };
    const floors = ["capture", "connection"].map(function (axis) {
      const g = stamp.floors[axis];
      return cs.w("mark.scale." + axis + ".name") + " " + (typeof g === "string" && /^[A-D]$/.test(g) ? E(g) : "–");
    }).join(" · ");
    const para = function (labelKey, body) { return body ? "<h2>" + cs.w(labelKey) + "</h2>" + body : ""; };
    const stampHtml = '<header data-stamp><p>' + cs.w("screen.review_copy.carries.fingerprint") + ": <code>" + E(stamp.hash) + "</code></p>"
      + "<p>" + cs.w("screen.review_copy.the.date.this.copy.last") + ": " + cs.date(stamp.date) + "</p><p>" + cs.w("screen.review_copy.carries.author") + ": " + E(stamp.author) + "</p>"
      + "<p>" + cs.w("screen.review_copy.the.minimum.strengths.it.was") + ": " + floors + "</p></header>";
    const excluded = list(a.excluded).map(function (x) { return "<li>" + E(text(x)) + (x && x.reason ? " · " + E(x.reason) : "") + "</li>"; }).join("");
    const findings = list(copy.findings).map(function (f) { return "<li>" + E(f && typeof f.statement === "string" && f.statement ? f.statement : text(f)) + "</li>"; }).join("");
    const missing = list(copy.missing).map(function (m) { return "<li>" + E(text(m)) + "</li>"; }).join("");
    const gates = typeof copy.gates === "string" ? "<p>" + E(copy.gates) + "</p>" : "";
    const css = "body{font:16px/1.5 serif;margin:0;padding:96px 24px 24px}header{position:fixed;top:0;left:0;right:0;padding:8px 24px;background:#fff;border-bottom:1px solid #000;font-size:12px}"
      + "header p{margin:0}@media print{header{position:fixed}}";
    return "<!doctype html><html><head><meta charset=\"utf-8\"><title>" + E(c.identity || "") + "</title><style>" + css + "</style></head><body>" + stampHtml
      + "<h1>" + E(c.identity || "") + "</h1>"
      + para("screen.case-editor.scope.label", a.scope ? "<p>" + E(a.scope) + "</p>" : "")
      + para("review.statement.title", a.statement ? "<p>" + E(a.statement) + "</p>" : "")
      + para("screen.case-editor.leavesout", excluded ? "<ul>" + excluded + "</ul>" : "")
      + para("screen.published.findings", findings ? "<ol>" + findings + "</ol>" : "")
      + (gates ? gates : "") + (missing ? "<ul>" + missing + "</ul>" : "") + "</body></html>";
  },
});
