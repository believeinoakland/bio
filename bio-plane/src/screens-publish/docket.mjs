/* The case's docket (registry screen `docket`; R8, R16; DEC-116, DEC-100): Projects › <project> › Docket. The case's
 * entries (editions, corrections, withdrawals, court orders), each drafted or posted; filing an entry with the member's
 * reason for the record or public choice; posting a drafted entry signed with the member's own key, through the signer
 * kit, within its prepared statement's hour. Its subject is `<project>/<case>`. Every function is self-contained
 * (interface-shell R21 (1)). */
import { PARTS } from "./parts.mjs";

export const DOCKET = Object.freeze({
  id: "docket",
  parts: PARTS,

  reads: function (view) {
    if (!view.parts.subject(view, 2)) return {}; // K3171: no subject in the address, no subject read
    const s = String(view.subject || "").split("/");
    return {
      project: { op: "image", query: { id: s[0] } },
      docket: { op: "docket", query: { case: s[1] || "" }, subject: true,
        empty: function (v) { return !v || !Array.isArray(v.entries) || v.entries.length === 0; } },
    };
  },

  place: function (view) {
    const id = String(view.subject || "").split("/")[0];
    const p = view.data.project;
    return { project: { id: id, title: view.parts.titleOf(p && p.state === "ok" ? p.value : null, id) } };
  },

  render: function (cs, view) {
    if (!view.parts.subject(view, 2)) return view.parts.nothing(cs);
    const P = view.parts;
    const caseId = String(view.subject || "").split("/")[1] || "";
    const out = [cs.title(null), '<p class="mk-sub">' + cs.w("screen.docket.sub", { case: caseId }) + "</p>"];
    out.push(cs.sec("screen.docket.entries", cs.state("docket", function (v) {
      return cs.sheet(v.entries.map(function (e) {
        const posted = e.shelf !== "record" || e.state === "posted" || e.published_at;
        const said = e.summary || e.reason || e.kind || "";
        let prep = "";
        if (!posted && e.proposed && e.proposed !== "record" && e.state !== "taken-back") {
          const pr = P.later(cs, view, "prepare:" + e.entry, "docketprepare", { query: { case: caseId, entry: String(e.entry), kind: e.kind } });
          prep = cs.state(pr, function (x) { return x.warning ? '<p class="cs-note">' + cs.esc(x.warning) + "</p>" : ""; })
            + cs.act("docketpost", { data: { entry: String(e.entry), kind: String(e.kind || "") } });
        }
        return cs.row("", "<b>" + cs.w("screen.docket.kind." + (["edition", "correction", "withdrawal", "court-order", "response", "statement", "reaction", "outcome"].includes(e.kind) ? e.kind : "other")) + "</b> · "
          + '<span class="rec">' + cs.esc(said) + "</span>",
          '<span class="meta">' + cs.w(posted ? "screen.docket.posted" : "screen.docket.drafted") + (e.filed_at || e.published_at ? " · " + cs.date(e.published_at || e.filed_at) : "") + "</span>", prep);
      }).join(""));
    }, { empty: "screen.docket.none" })));
    out.push(cs.sec("screen.docket.file", cs.choice("dk-kind", "screen.docket.kind.label", [["response", "screen.docket.kind.response"], ["statement", "screen.docket.kind.statement"],
      ["reaction", "screen.docket.kind.reaction"], ["outcome", "screen.docket.kind.outcome"]])
      + cs.field("dk-from", "screen.docket.from.label", { rec: true, help: "screen.docket.from.help" })
      + cs.field("dk-summary", "screen.docket.summary.label", { area: true, rec: true })
      + cs.choice("dk-proposed", "screen.docket.proposed.label", [["record", "screen.docket.proposed.record"], ["public", "screen.docket.proposed.public"], ["both", "screen.docket.proposed.both"]])
      + cs.field("dk-reason", "screen.docket.reason.label", { area: true, help: "screen.docket.reason.help" })
      + '<div class="cs-actrow">' + cs.act("docketfile") + "</div>"));
    out.push('<p class="muted">' + cs.w("screen.docket.order") + "</p>" + P.said(view, "docketpost"));
    return out.join("");
  },

  acts: [
    {
      // R8: "File a docket entry", with the member's reason for the record or public choice.
      op: "docketfile", label: "act.docketfile.label.docket", reasonField: "reason",
      send: function (view, el, cs) {
        const caseId = String(view.subject || "").split("/")[1] || "";
        const summary = String(cs.value("dk-summary") || "").trim();
        const from = String(cs.value("dk-from") || "").trim();
        if (!summary || !from) return { refuse: "screen.docket.file.needed" };
        return { body: { case: caseId, kind: String(cs.value("dk-kind") || "response"), from: { kind: "other", name: from }, summary: summary,
          proposed: String(cs.value("dk-proposed") || "record"), reason: String(cs.value("dk-reason") || "").trim() } };
      },
      done: function (view) { view.parts.forget(view); },
    },
    {
      // R8, R16: "Post it, signed": the prepared `docketStatement` (namespace `bio-docket`), prepared again once its hour has
      // passed, signed through the signer kit, and posted with its digest; declined, nothing is sent.
      op: "docketpost", label: "act.docketpost.label.docket",
      send: async function (view, el, cs) {
        const P = view.parts;
        const caseId = String(view.subject || "").split("/")[1] || "";
        const L = view.ui.later || {};
        let pr = L["prepare:" + el.dataset.entry] && L["prepare:" + el.dataset.entry].state === "ok" ? L["prepare:" + el.dataset.entry].value : null;
        if (!pr || !pr.statement || (pr.expires && Date.parse(pr.expires) <= cs.now())) {
          pr = P.value(await cs.call("docketprepare", { query: { case: caseId, entry: el.dataset.entry, kind: el.dataset.kind } }));
          if (!pr || pr.ok === false || typeof pr.statement !== "string") return { refuse: "screen.docket.prepare.failed" };
        }
        const signed = await cs.signer.sign([{ label: "docket " + caseId, bytes: P.bytes(pr.statement), namespace: "bio-docket" }]);
        if (!signed || signed.ok !== true || !Array.isArray(signed.signatures) || signed.signatures.length !== 1) return { refuse: "signing.ceremony.declined" };
        return { body: { digest: pr.digest, signature: signed.signatures[0], acknowledged: true } };
      },
      done: function (view, answer, cs) { view.parts.forget(view); view.parts.say(cs, view, "docketpost", cs.w("screen.docket.posted.said")); },
    },
  ],
});
