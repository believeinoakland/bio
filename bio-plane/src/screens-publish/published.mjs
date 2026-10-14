/* A published case (registry screen `published`; R6; DEC-112, DEC-147 (5)), drawn in the public frame with no session
 * (interface-shell R30) at `/app/published/<case>`: the edition's findings, each with its two strengths and whether it
 * meets the project's bar, its timeline, the people it names, its evidence, when it was signed and when published; whose
 * work it is and how to read it; "Check the signature"; "Check a file you hold" (R22). Nothing here needs an account. Every function is
 * self-contained (interface-shell R21 (1)). */
import { PARTS } from "./parts.mjs";

export const PUBLISHED = Object.freeze({
  id: "published",
  parts: PARTS,

  reads: function (view) {
    if (!view.parts.subject(view, 1)) return {}; // K3171: no subject in the address, no subject read
    const s = String(view.subject || "").split("/");
    const query = { id: s[0], caseId: s[0] };
    if (s[1]) query.edition = s[1];
    return {
      group: { op: "groupidentity" },
      edition: { op: "publishedcase", query: query, subject: true },
    };
  },

  render: function (cs, view) {
    if (!view.parts.subject(view, 1)) return view.parts.nothing(cs, "public"); // R21: the way an outsider can go, never "Go to Home"
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
    out.push(P.sec(cs, "screen.published.findings", findings.length ? findings.map(function (f, i) {
      const body = f.body || {};
      const st = Array.isArray(f.strength) ? f.strength : [];
      const axis = function (a) { const x = st.find(function (y) { return y.axis === a; }); return x && x.grade ? cs.grade(a, String(x.grade)) : ""; };
      // `standing` is the plane's reading of the finding against the project's bar (`case-grammar` R15): `meets` is true
      // or false when the bar was asked of it, else "not_asked" or "no_bar", for which nothing is said.
      const stand = f.standing && typeof f.standing === "object" ? f.standing : {};
      const meets = stand.meets === true ? "yes" : stand.meets === false ? "no" : null;
      const bar = stand.bar && typeof stand.bar === "object" ? stand.bar : {};
      return '<article class="mk-finding" data-finding="' + cs.esc(f.bundle_id || f.id || String(i)) + '"><span class="eyebrow">' + cs.w("screen.published.finding", { n: String(i + 1) }) + "</span>"
        + '<p class="rec">' + cs.esc(body.conclusion || body.question || f.title || "") + "</p><p>" + axis("capture") + " " + axis("connection")
        + (meets ? " " + cs.w(meets === "yes" ? "screen.published.meets" : "screen.published.below", { capture: String(bar.capture || "–"), connection: String(bar.connection || "–") }) : "") + "</p></article>";
    }).join("") : ""));

    // Its timeline, the people it names and its evidence, as the edition carries them.
    const timeline = e.method && Array.isArray(e.method.timeline) ? e.method.timeline : Array.isArray(e.timeline) ? e.timeline : [];
    if (timeline.length) out.push(cs.sec("screen.published.timeline", cs.sheet(timeline.map(function (t) {
      return cs.row("", '<span class="rec">' + cs.esc(t.what || t.summary || t.title || "") + "</span>", t.at || t.date ? cs.date(t.at || t.date) : "");
    }).join(""))));
    const people = Array.isArray(e.people) ? e.people : e.lens && Array.isArray(e.lens.people) ? e.lens.people : [];
    out.push(P.sec(cs, "screen.published.people", people.length ? cs.sheet(people.map(function (p) {
      return cs.row("", '<span class="rec">' + cs.esc(p.shown || p.name || p.title || "") + "</span>", p.reason ? '<span class="meta">' + cs.esc(p.reason) + "</span>" : "");
    }).join("")) : ""));
    const evidence = Array.isArray(e.captures) ? e.captures : Array.isArray(e.materials) ? e.materials : [];
    // R19: each piece of evidence with a full SHA-256 opens its bytes by that hash (`publishedbytes`, no credential); a row
    // with no full hash draws no hash and no link.
    out.push(P.sec(cs, "screen.published.evidence", evidence.length ? cs.sheet(evidence.map(function (x) {
      const sha = String(x.sha256 || x.capture_sha || "").toLowerCase();
      const full = /^[0-9a-f]{64}$/.test(sha);
      return cs.row("", '<span class="rec">' + cs.esc(x.title || x.label || x.locator || (full ? sha : "")) + "</span>",
        full ? '<span class="id">' + cs.esc(sha.slice(0, 12)) + "</span>" : "",
        full ? cs.act("publishedcase", { label: "screen.published.evidence.open", data: { sha: sha } }) : "");
    }).join("")) : ""));

    out.push('<div class="mk-acts">' + cs.act("verify", { data: { sha: String(e.manifest_sha || "") } }) + cs.act("publishedcase")
      + (/^[0-9a-f]{64}$/.test(String(e.manifest_sha || "")) ? cs.act("publishedcase", { label: "screen.published.download", data: { download: "1", manifest: String(e.manifest_sha) } }) : "") + "</div>" + P.said(view, "verify") + P.said(view, "download"));

    // R22 (N1094; DEC-240 (P1)): "Check a file you hold": the member of the public pastes the file's SHA-256 (the file itself
    // never reaches the page); `verify` answers whether this case rests on it, as a public op with no credential.
    out.push(cs.sec("published.check.title", cs.field("pb-sha", "published.check.field", { rec: true, help: "published.check.field.help" })
      + '<div class="mk-acts">' + cs.act("verify", { label: "published.check.go", data: { check: "1" } }) + "</div>" + P.said(view, "check"), { help: "published.check.help" }));
    return out.join("");
  },

  acts: [
    {
      // R6: "Check the signature": the edition's manifest checked against what the group published, without the group.
      op: "verify", label: "act.verify.label.published",
      // R22: the same act also takes the 64-character fingerprint a reader typed ("Check it"); nothing but that hash is sent.
      send: function (view, el, cs) {
        view.ui.checking = "";
        if (el.dataset.check === "1") {
          const typed = String(cs.value("pb-sha") || "").trim().toLowerCase();
          if (!/^[0-9a-f]{64}$/.test(typed)) return { refuse: "published.check.field.help" };
          view.ui.checking = typed;
          return { query: { sha256: typed } };
        }
        return /^[0-9a-f]{64}$/.test(el.dataset.sha || "") ? { query: { sha256: el.dataset.sha } } : { refuse: "screen.published.verify.none" };
      },
      done: async function (view, answer, cs) {
        const P = view.parts, typed = view.ui.checking || "";
        view.ui.checking = "";
        const key = typed ? "check" : "verify";
        if (P.refused(cs, view, key, answer)) return { stay: true }; // D29
        const r = P.value(answer) || {};
        const published = r.published === true && Array.isArray(r.matches) && r.matches.length > 0;
        if (!typed) { P.say(cs, view, "verify", cs.w(published ? "screen.published.verify.ok" : "screen.published.verify.no"), !!r.published); return { stay: true }; }
        // R22: held by this edition when the hash is published and `publishedcase`, read by that hash, names a finding of the
        // edition on this page. A finding's pinned hash is answered by `publishedcase` itself; a file the findings rest on is
        // not, so the edition's own parts (`files`, each with its finding) name the finding for it.
        const e = view.data.edition && view.data.edition.state === "ok" ? view.data.edition.value : null;
        const findings = e && Array.isArray(e.findings) ? e.findings : [];
        const at = function (id) {
          for (let i = 0; i < findings.length; i++) if (String(findings[i].bundle_id || findings[i].id || "") === String(id)) return i;
          return -1;
        };
        let i = -1;
        if (published && e) {
          let c = null;
          try { c = P.value(await cs.call("publishedcase", { query: { sha256: typed } })); } catch (x) { c = null; }
          if (c && c.ok !== false && String(c.caseId) === String(e.caseId) && String(c.edition) === String(e.edition)) {
            const pinned = (Array.isArray(c.findings) ? c.findings : []).find(function (f) { return String(f.version_sha || "").toLowerCase() === typed; });
            i = at(pinned ? pinned.bundle_id : c.asked);
          }
          if (i < 0 && Array.isArray(e.files)) {
            const part = e.files.find(function (x) { return x && String(x.sha256 || "").toLowerCase() === typed && x.finding; });
            if (part) i = at(part.finding);
          }
        }
        const body = i >= 0 ? findings[i].body || {} : {};
        P.say(cs, view, "check", i >= 0 ? cs.w("published.check.yes", { n: String(i + 1), finding: body.conclusion || body.question || findings[i].title || "" })
          : cs.w("published.check.no"), i >= 0);
        return { stay: true };
      },
    },
    {
      // R6: "Read the case": the edition read again, whole. R19: the same op also opens a piece of evidence's bytes by its
      // hash and downloads the complete edition's file (the case file, by the manifest's hash), both through `publishedbytes`,
      // public, with no credential.
      op: "publishedcase", label: "act.publishedcase.label.published",
      send: async function (view, el, cs) {
        const P = view.parts;
        const s = String(view.subject || "").split("/");
        const query = Object.assign({ id: s[0], caseId: s[0] }, s[1] ? { edition: s[1] } : {});
        const sha = el && el.dataset ? el.dataset.sha : "";
        const download = el && el.dataset && el.dataset.download === "1";
        if (!sha && !download) return { query: query };
        const got = sha ? await cs.download("publishedbytes", { query: { sha256: sha }, name: sha.slice(0, 12) })
          : await cs.download("publishedbytes", { query: { sha256: el.dataset.manifest, format: "zip" }, name: s[0] + (s[1] ? "-edition-" + s[1] : "") + ".zip" });
        const a = got && got.answer && typeof got.answer === "object" ? (got.answer.result && typeof got.answer.result === "object" ? got.answer.result : got.answer) : {};
        const why = a.translation || a.reason || a.code || "";
        P.say(cs, view, "download", got && got.ok ? cs.w("screen.published.download.done") : why ? cs.esc(why) : cs.w("screen.published.download.failed"), !!(got && got.ok));
        return null;
      },
    },
  ],
});
