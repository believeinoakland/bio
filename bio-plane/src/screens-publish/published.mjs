/* A published case (registry screen `published`; R6; DEC-112, DEC-147 (5)), drawn in the public frame with no session
 * (interface-shell R30) at `/app/published/<case>`: the edition's findings, each with its two strengths and whether it
 * meets the project's bar, its timeline, the people it names, its evidence, when it was signed and when published; whose
 * work it is and how to read it; "Check the signature". Nothing here needs an account. Every function is
 * self-contained (interface-shell R21 (1)). */
import { PARTS } from "./parts.mjs";

export const PUBLISHED = Object.freeze({
  id: "published",
  parts: PARTS,

  reads: function (view) {
    const s = String(view.subject || "").split("/");
    const query = { id: s[0], caseId: s[0] };
    if (s[1]) query.edition = s[1];
    return {
      group: { op: "groupidentity" },
      edition: { op: "publishedcase", query: query, subject: true },
    };
  },

  render: function (cs, view) {
    const P = view.parts;
    const g = view.data.group && view.data.group.state === "ok" ? view.data.group.value : null;
    const group = g ? g.display_name || g.group || "" : "";
    const e = view.data.edition && view.data.edition.state === "ok" ? view.data.edition.value : null;
    const out = [cs.title(e ? e.scope || e.project_reference || e.caseId || null : null, { thing: "case" })];
    if (!e) { out.push(cs.state("edition", function () { return ""; })); return out.join(""); }
    const caseId = String(e.caseId || String(view.subject || "").split("/")[0]);

    // When it was signed and published, and its other editions.
    const editions = Array.isArray(e.editions) ? e.editions : [];
    out.push('<p class="mk-sub">' + cs.w("screen.published.dated", { edition: String(e.edition || ""),
      signed: { html: e.signed_at ? cs.date(e.signed_at) : "" }, published: { html: e.published_at ? cs.date(e.published_at) : "" } })
      + editions.filter(function (x) { return String(x.edition !== undefined ? x.edition : x) !== String(e.edition); }).map(function (x) {
        const n = String(x.edition !== undefined ? x.edition : x);
        return ' · <a href="/app/published/' + encodeURIComponent(caseId + "/" + n) + '" data-nav>' + cs.w("screen.published.edition", { n: n }) + "</a>";
      }).join("") + "</p>");
    if (e.withdrawn) out.push('<p role="status">' + cs.w("screen.published.withdrawn") + "</p>");

    // Whose work it is, and how to read a case.
    out.push('<p class="mk-explain">' + cs.w("screen.published.whose", { group: group }) + " " + cs.w("screen.published.howtoread") + "</p>");

    // The findings: each with its two strengths and whether it meets the project's bar.
    const findings = Array.isArray(e.findings) ? e.findings : [];
    out.push(cs.sec("screen.published.findings", findings.length ? findings.map(function (f, i) {
      const body = f.body || {};
      const st = Array.isArray(f.strength) ? f.strength : [];
      const axis = function (a) { const x = st.find(function (y) { return y.axis === a; }); return x && x.grade ? cs.grade(a, String(x.grade)) : ""; };
      const meets = f.meets_bar === true || f.meetsBar === true ? "yes" : f.meets_bar === false || f.meetsBar === false ? "no" : null;
      return '<article class="mk-finding" data-finding="' + cs.esc(f.bundle_id || f.id || String(i)) + '"><span class="eyebrow">' + cs.w("screen.published.finding", { n: String(i + 1) }) + "</span>"
        + '<p class="rec">' + cs.esc(body.conclusion || body.question || f.title || "") + "</p><p>" + axis("capture") + " " + axis("connection")
        + (meets ? " " + cs.w(meets === "yes" ? "screen.published.meets" : "screen.published.below") : "") + "</p></article>";
    }).join("") : '<p class="muted">' + cs.w("screen.published.nofindings") + "</p>"));

    // Its timeline, the people it names and its evidence, as the edition carries them.
    const timeline = e.method && Array.isArray(e.method.timeline) ? e.method.timeline : Array.isArray(e.timeline) ? e.timeline : [];
    if (timeline.length) out.push(cs.sec("screen.published.timeline", cs.sheet(timeline.map(function (t) {
      return cs.row("", '<span class="rec">' + cs.esc(t.what || t.summary || t.title || "") + "</span>", t.at || t.date ? cs.date(t.at || t.date) : "");
    }).join(""))));
    const people = Array.isArray(e.people) ? e.people : e.lens && Array.isArray(e.lens.people) ? e.lens.people : [];
    out.push(cs.sec("screen.published.people", people.length ? cs.sheet(people.map(function (p) {
      return cs.row("", '<span class="rec">' + cs.esc(p.shown || p.name || p.title || "") + "</span>", p.reason ? '<span class="meta">' + cs.esc(p.reason) + "</span>" : "");
    }).join("")) : '<p class="muted">' + cs.w("screen.published.nopeople") + "</p>"));
    const evidence = Array.isArray(e.captures) ? e.captures : Array.isArray(e.materials) ? e.materials : [];
    out.push(cs.sec("screen.published.evidence", evidence.length ? cs.sheet(evidence.map(function (x) {
      return cs.row("", '<span class="rec">' + cs.esc(x.title || x.label || x.locator || x.sha256 || "") + "</span>",
        x.sha256 || x.capture_sha ? '<span class="id">' + cs.esc(String(x.sha256 || x.capture_sha).slice(0, 12)) + "</span>" : "");
    }).join("")) : '<p class="muted">' + cs.w("screen.published.noevidence") + "</p>"));

    out.push('<div class="cs-actrow">' + cs.act("verify", { data: { sha: String(e.manifest_sha || "") } }) + cs.act("publishedcase") + "</div>" + P.said(view, "verify"));
    return out.join("");
  },

  acts: [
    {
      // R6: "Check the signature": the edition's manifest checked against what the group published, without the group.
      op: "verify", label: "act.verify.label.published",
      send: function (view, el) { return /^[0-9a-f]{64}$/.test(el.dataset.sha || "") ? { query: { sha256: el.dataset.sha } } : { refuse: "screen.published.verify.none" }; },
      done: function (view, answer, cs) {
        const r = view.parts.value(answer) || {};
        view.parts.say(cs, view, "verify", cs.w(r.published && Array.isArray(r.matches) && r.matches.length ? "screen.published.verify.ok" : "screen.published.verify.no"), !!r.published);
        return { stay: true };
      },
    },
    {
      // R6: "Read the case": the edition read again, whole.
      op: "publishedcase", label: "act.publishedcase.label.published",
      send: function (view) { const s = String(view.subject || "").split("/"); return { query: Object.assign({ id: s[0], caseId: s[0] }, s[1] ? { edition: s[1] } : {}) }; },
    },
  ],
});
