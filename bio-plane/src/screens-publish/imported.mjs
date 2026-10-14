/* Another group's case (registry screen `imported`; R7; DEC-96, DEC-112): Projects › Imported › Another group's case,
 * drawn read-only in the imported band. The cases imported, and the one chosen: each finding with whether it recreated
 * here, in part, or not; importing a case, accepting what recreated with a reason, flagging an issue, watching the
 * publisher's docket. Its subject is an import's id (or none, for the list). Every function is self-contained
 * (interface-shell R21 (1)). */
import { PARTS } from "./parts.mjs";

export const IMPORTED = Object.freeze({
  id: "imported",
  parts: PARTS,

  reads: function (view) {
    const r = { cases: { op: "importedcases", empty: function (v) { return !v || !Array.isArray(v.imports) || v.imports.length === 0; } } };
    const s = String(view.subject || "").split("/");
    if (s[0]) r.chosen = { op: "importedcase", query: Object.assign({ import: s[0] }, s[1] ? { edition: s[1] } : {}), subject: true };
    return r;
  },

  render: function (cs, view) {
    const P = view.parts;
    const c = view.data.chosen && view.data.chosen.state === "ok" ? view.data.chosen.value : null;
    const out = [cs.title(c ? (c.case && (c.case.title || c.case.id)) || c.case || c.import : null, { thing: "case" })];
    if (c) {
      const ed = c.edition || {};
      out.push('<p class="mk-sub">' + cs.mark("origin", "elsewhere") + " " + cs.w("screen.imported.from", { group: String(c.group && (c.group.name || c.group.slug) || c.group || ""),
        edition: String(ed.edition || ""), by: ed.imported_by || "", at: { html: ed.imported_at ? cs.date(ed.imported_at) : "" } }) + "</p>");
      const findings = Array.isArray(ed.findings) ? ed.findings : [];
      out.push(cs.sec("screen.imported.findings", findings.length ? cs.sheet(findings.map(function (f) {
        const r = f.result === "recreated" || f.result === "yes" ? "yes" : f.result === "partial" || f.result === "part" || f.result === "in_part" ? "part" : "no";
        const own = f.origin && f.origin.acceptance ? cs.mark("origin", "accepted") : f.origin && Array.isArray(f.origin.flags) && f.origin.flags.length ? cs.mark("origin", "flagged") : "";
        return cs.row("", '<span class="rec">' + cs.esc(f.title || f.finding || "") + "</span>",
          '<span class="cs-recreate" data-r="' + r + '">' + cs.w("screen.imported.result." + r) + "</span>", own);
      }).join("")) : '<p class="muted">' + cs.w("screen.imported.nofindings") + "</p>"));
      out.push(cs.sec("screen.imported.accept", cs.field("im-checked", "screen.imported.checked.label", { area: true })
        + cs.field("im-reason", "screen.imported.reason.label", { area: true })
        + '<div class="cs-actrow">' + cs.act("importaccept", { tone: "primary" }) + "</div>"));
      out.push(cs.sec("screen.imported.flag", cs.field("im-issue", "screen.imported.issue.label", { area: true }) + '<div class="cs-actrow">' + cs.act("importflag") + "</div>"));
      out.push(cs.sec("screen.imported.watch", cs.field("im-publisher", "screen.imported.publisher.label", { type: "url", help: "screen.imported.publisher.help" })
        + '<div class="cs-actrow">' + cs.act("importwatch") + "</div>"));
    } else if (view.subject) out.push(cs.state("chosen", function () { return ""; }));

    // The cases imported, each opening its own page.
    out.push(cs.sec("screen.imported.list", cs.state("cases", function (v) {
      return cs.sheet(v.imports.map(function (x) {
        return cs.row(cs.mark("origin", "elsewhere"), '<a href="/app/imported/' + encodeURIComponent(x.import) + '" data-nav>'
          + cs.esc((x.case && (x.case.title || x.case.id)) || x.case || x.import) + "</a>", '<span class="meta">' + cs.esc(String(x.group && (x.group.name || x.group.slug) || x.group || "")) + "</span>");
      }).join(""));
    }, { empty: "screen.imported.none" })));
    out.push(cs.sec("screen.imported.import", cs.field("im-file", "screen.imported.file.label", { type: "file", help: "screen.imported.file.help" })
      + '<div class="cs-actrow">' + cs.act("caseimport") + "</div>" + P.said(view, "caseimport")));
    return out.join("");
  },

  acts: [
    {
      // R7: "Import a case": the case file the member chose, its bytes sent as one part.
      op: "caseimport", label: "act.caseimport.label.imported",
      send: async function (view, el, cs) {
        const f = cs.file("im-file");
        if (!f) return { refuse: "screen.imported.file.needed" };
        const bytes = new Uint8Array(await f.arrayBuffer());
        let bin = "";
        for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 0x8000)));
        return { body: { parts: [btoa(bin)] } };
      },
      done: function (view, answer, cs) {
        const r = view.parts.value(answer) || {};
        if (r.import) cs.go("imported", r.import);
      },
    },
    {
      // R7: "Accept what recreated, with a reason": the findings that recreated, what the member checked, and why.
      op: "importaccept", label: "act.importaccept.label.imported", reasonField: "reason",
      send: function (view, el, cs) {
        const c = view.data.chosen && view.data.chosen.state === "ok" ? view.data.chosen.value : null;
        if (!c) return null;
        const ed = c.edition || {};
        const findings = (Array.isArray(ed.findings) ? ed.findings : []).filter(function (f) { return f.result === "recreated" || f.result === "yes"; }).map(function (f) { return f.finding; });
        const checked = String(cs.value("im-checked") || "").trim();
        if (!checked) return { refuse: "screen.imported.checked.needed" };
        return { body: { import: c.import, edition: ed.edition, findings: findings, checked: checked, reason: String(cs.value("im-reason") || "").trim() } };
      },
    },
    {
      // R7: "Flag an issue", kept within the group.
      op: "importflag", label: "act.importflag.label.imported",
      send: function (view, el, cs) {
        const c = view.data.chosen && view.data.chosen.state === "ok" ? view.data.chosen.value : null;
        const issue = String(cs.value("im-issue") || "").trim();
        if (!c) return null;
        if (!issue) return { refuse: "screen.imported.issue.needed" };
        return { body: { import: c.import, edition: (c.edition || {}).edition, issue: issue } };
      },
    },
    {
      // R7: "Watch the publisher's docket".
      op: "importwatch", label: "act.importwatch.label.imported",
      send: function (view, el, cs) {
        const c = view.data.chosen && view.data.chosen.state === "ok" ? view.data.chosen.value : null;
        const publisher = String(cs.value("im-publisher") || "").trim();
        if (!c) return null;
        if (!/^https:\/\//.test(publisher)) return { refuse: "screen.imported.publisher.needed" };
        return { body: { import: c.import, publisher: publisher } };
      },
    },
  ],
});
