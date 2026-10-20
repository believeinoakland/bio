/* Another group's case (registry screen `imported`; R7; DEC-96, DEC-112): Projects › Imported › Another group's case,
 * drawn read-only in the imported band. The cases imported, and the one chosen: each finding with whether it recreated
 * here, in part, or not; importing a case, accepting what recreated with a reason, flagging an issue, watching the
 * publisher's docket. Its subject is an import's id (or none, for the list). Every function is self-contained
 * (interface-shell R21 (1)). */
import { PARTS } from "./parts.mjs";

export const IMPORTED = Object.freeze({
  id: "imported",
  // R25: an import or edition the team does not hold is answered `IMPORT_NO_SUCH_EDITION` (`case-import` R4): "Nothing is here".
  ABSENT_CODES: Object.freeze(["IMPORT_NO_SUCH_EDITION"]),
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
      const group = String(c.group && (c.group.name || c.group.slug) || c.group || "");
      const findings = Array.isArray(ed.findings) ? ed.findings : [];
      const resultOf = function (f) { return f.result === "recreated" || f.result === "yes" ? "yes" : f.result === "partial" || f.result === "part" || f.result === "in_part" ? "part" : "no"; };
      const importer = ed.importer && ed.importer.handle ? ed.importer.handle : ed.imported_by || "";
      // R25: the band says whose case it is and how far it recreated here; the line beneath, who brought it in and when.
      // R20: no count at zero, so an edition with no finding listed draws no band.
      if (findings.length) out.push('<p class="mk-note" data-imported-band>' + cs.w("screen.imported.band", { group: group, edition: String(ed.edition || ""),
        recreated: String(findings.filter(function (f) { return resultOf(f) === "yes"; }).length), findings: String(findings.length) }) + "</p>");
      out.push('<p class="mk-sub">' + cs.mark("origin", "elsewhere") + " " + cs.w("screen.imported.from", { group: group,
        edition: String(ed.edition || ""), by: importer, at: { html: ed.imported_at ? cs.date(ed.imported_at) : "" } }) + "</p>");
      out.push(P.sec(cs, "screen.imported.findings", findings.length ? cs.sheet(findings.map(function (f) {
        const r = resultOf(f);
        const own = f.origin && f.origin.acceptance ? cs.mark("origin", "accepted") : f.origin && Array.isArray(f.origin.flags) && f.origin.flags.length ? cs.mark("origin", "flagged") : "";
        return cs.row("", '<span class="rec">' + cs.esc(f.title || f.finding || "") + "</span>",
          '<span class="cs-recreate" data-r="' + r + '">' + cs.w("screen.imported.result." + r) + "</span>", own);
      }).join("")) : ""));

      // R26 (N933; DEC-304 (4); DEC-323): whose stake this states: the source team's identity and declared stake as it
      // stated them when they were read, never this team's; an edition recorded without them says so in its fold, and a
      // stake stated in a form that cannot be read says so in its own, the other fields still drawn.
      const gf = ed.group_fields && typeof ed.group_fields === "object" ? ed.group_fields : null;
      const said = function (v) { return v && typeof v === "object" ? String(v.stake || v.text || "") : v ? String(v) : ""; };
      let stake;
      if (!gf) stake = P.fold(cs, "caseimport.notrecorded.summary", "<p>" + cs.w("case-import.group_fields_none") + "</p>");
      else {
        const matter = gf.matter_stake && typeof gf.matter_stake === "object" ? gf.matter_stake : null;
        const rows = [gf.name, gf.domain, said(gf.stake), gf.detail].filter(function (x) { return x !== null && x !== undefined && x !== ""; }).map(function (x) {
          return cs.row("", '<span class="rec">' + cs.esc(String(x)) + "</span>"); }).join("")
          + (matter ? cs.row("", cs.w("stake.inmatter") + ': <span class="rec">' + (matter.stake === "undetermined" ? cs.w("stake.unreadable") : cs.esc(said(matter))) + "</span>",
            matter.set_by || matter.set_at ? '<span class="meta">' + cs.w("stake.set", { who: matter.set_by || "", date: { html: matter.set_at ? cs.date(matter.set_at) : "" } }) + "</span>" : "") : "");
        stake = '<p class="mk-note" data-group-fields>' + cs.w("case-import.group_fields_label") + "</p>" + (rows ? cs.sheet(rows) : "")
          + (ed.group_fields_note ? P.fold(cs, "caseimport.unreadable.summary", "<p>" + cs.w("caseimport.stake.unreadable") + "</p>") : "");
      }
      out.push(cs.sec("caseimport.stake.heading", stake));

      out.push(cs.sec("screen.imported.accept", cs.field("im-checked", "screen.imported.checked.label", { area: true })
        + cs.field("im-reason", "screen.imported.reason.label", { area: true })
        + '<div class="mk-acts">' + cs.act("importaccept", { tone: "primary" }) + "</div>" + P.said(view, "importaccept")));
      // R55 (C51; DEC-374): an import some of whose findings the team accepted can have the acceptance withdrawn, with a reason; an
      // import with none accepted offers nothing. Rejecting an import and public acceptance with dependencies are not drawn.
      const accepted = findings.filter(function (f) { return f.origin && f.origin.acceptance; });
      if (accepted.length) out.push(cs.sec("screen.imported.accepted.heading", cs.field("im-withdraw", "screen.imported.withdraw.label", { area: true, help: "screen.imported.withdraw.help" })
        + '<div class="mk-acts">' + cs.act("importacceptwithdraw", { label: "screen.imported.withdraw.button" }) + "</div>" + P.said(view, "importacceptwithdraw")));
      out.push(cs.sec("screen.imported.flag", cs.field("im-issue", "screen.imported.issue.label", { area: true }) + '<div class="mk-acts">' + cs.act("importflag") + "</div>" + P.said(view, "importflag")));
      out.push(cs.sec("screen.imported.watch", cs.field("im-publisher", "screen.imported.publisher.label", { type: "url", help: "screen.imported.publisher.help" })
        + '<div class="mk-acts">' + cs.act("importwatch") + "</div>" + P.said(view, "importwatch")));
    } else if (view.subject) out.push(cs.state("chosen", function () { return ""; }));

    // R25: the cases imported, each opening its own page, with who brought it in and how far it recreated; with none
    // imported, the screen's one empty state, which names the first step, is drawn without a section (R20).
    const listed = view.data.cases && view.data.cases.state === "empty";
    const count = function (v) { return typeof v === "number" ? String(v) : "–"; }; // no recreation recorded is not zero
    out.push(listed ? cs.state("cases", function () { return ""; }, { empty: "screen.imported.list.none" }) : cs.sec("screen.imported.list", '<p class="mk-sub">' + cs.w("screen.imported.list.says") + "</p>"
      + cs.state("cases", function (v) {
        return cs.sheet(v.imports.map(function (x) {
          const eds = Array.isArray(x.editions) ? x.editions : [];
          const ed = eds.find(function (e) { return String(e.edition) === String(x.latest_edition); }) || eds[eds.length - 1] || {};
          const who = ed.importer && ed.importer.handle ? ed.importer.handle : ed.imported_by && ed.imported_by !== "admin" ? ed.imported_by : "–";
          let says = cs.w("screen.imported.list.row", { group: String(x.group && (x.group.name || x.group.slug) || x.group || ""),
            edition: String(x.latest_edition !== undefined && x.latest_edition !== null ? x.latest_edition : ed.edition || ""), who: who,
            date: { html: ed.imported_at ? cs.date(ed.imported_at) : "" }, recreated: count(ed.recreated), findings: count(ed.findings) });
          if (typeof ed.recreated_in_part === "number" && ed.recreated_in_part > 0) says += " · " + cs.w("screen.imported.list.row.part", { n: String(ed.recreated_in_part) });
          return cs.row(cs.mark("origin", "elsewhere"), '<a href="/app/imported/' + encodeURIComponent(x.import) + '" data-nav>'
            + cs.esc((x.case && (x.case.title || x.case.id)) || x.case || x.import) + "</a>", '<span class="meta">' + says + "</span>");
        }).join(""));
      }), { help: "screen.imported.list.tip" }));
    out.push(cs.sec("screen.imported.import", cs.field("im-file", "screen.imported.file.label", { type: "file", help: "screen.imported.file.help" })
      + '<div class="mk-acts">' + cs.act("caseimport") + "</div>" + P.said(view, "caseimport")));
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
        if (view.parts.refused(cs, view, "caseimport", answer)) return; // D29: no import is opened on a refusal
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
      done: function (view, answer, cs) { view.parts.refused(cs, view, "importaccept", answer); }, // D29
    },
    {
      // R55: "Withdraw this acceptance, with a reason": nothing is sent without one.
      op: "importacceptwithdraw", label: "act.importacceptwithdraw.label.imported", reasonField: "reason",
      refusals: { IMPORT_ACCEPT_NO_REASON: "screen.imported.withdraw.label", IMPORT_NOTHING_ACCEPTED: "screen.imported.withdraw.none.summary" },
      send: function (view, el, cs) {
        const c = view.data.chosen && view.data.chosen.state === "ok" ? view.data.chosen.value : null;
        if (!c) return null;
        const reason = String(cs.value("im-withdraw") || "").trim();
        if (!reason) return { refuse: "screen.imported.withdraw.label" };
        return { body: { import: c.import, edition: (c.edition || {}).edition, reason: reason } };
      },
      done: function (view, answer, cs) { if (!view.parts.refused(cs, view, "importacceptwithdraw", answer)) view.parts.forget(view); }, // D29
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
      done: function (view, answer, cs) { view.parts.refused(cs, view, "importflag", answer); }, // D29
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
      done: function (view, answer, cs) { view.parts.refused(cs, view, "importwatch", answer); }, // D29
    },
  ],
});
