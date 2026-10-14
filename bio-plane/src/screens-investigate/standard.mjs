/* screens-investigate R8: a standard the city set itself (Projects › <project> › Standard; registry screen `standard`,
 * its 3 acts). Reads the standard (`standards`' `standard`: its words as written, its source passage, its issuer, kind and
 * when it is in force), its relations to laws (`lawrelations`) and, only while the assistant is reachable, the proposals
 * (`proposals`), each drawn as machine work, "not a standard until a member adopts it". */

import { row } from "./row.mjs";
import { PARTS } from "./parts.mjs";

function reads(view) {
  const id = String(view.subject || "");
  const out = {};
  if (/^STD-/.test(id)) {
    out.standard = { op: "standard", query: { id }, subject: true };
    out.relations = { op: "lawrelations", query: { id } };
  }
  if (view.reachable) out.proposals = { op: "proposals", query: {} };
  return out;
}

function render(cs, view) {
  const S = "screen.standard.";
  const P = view.parts;
  const id = String(view.subject || "");
  const s = view.data.standard && view.data.standard.state === "ok" ? view.data.standard.value : null;
  const out = [cs.title(s ? s.cite || id : cs.w("screen.standard.name"), { thing: { kind: "standard", facts: s ? [s.kind || "", s.issuer || ""] : [] } })];
  if (/^STD-/.test(id)) out.push(cs.state("standard", view, (v) => {
    const texts = Array.isArray(v.texts) ? v.texts : (v.text || []).map((c) => ({ content_id: c }));
    const per = v.period || {};
    return `<p class="cs-sub">${cs.w(S + "sub", { kind: cs.w(S + "kind." + (["statute", "regulation", "ordinance", "court", "policy", "commitment", "standard"].includes(v.kind) ? v.kind : "standard")), issuer: v.issuer || "" })}`
      + ` · ${per.from ? cs.w(per.to ? S + "inforce.span" : S + "inforce.since", { from: cs.date(per.from), to: per.to ? cs.date(per.to) : "" }) : cs.mark("gap", "undetermined", { reason: cs.w(S + "inforce.none") })}</p>`
      + (v.reason ? `<blockquote class="mk-passage rec">${cs.esc(v.reason)}</blockquote>` : "")
      + (texts.length ? `<p class="cs-meta">${cs.w(S + "words")} ${texts.map((t) => cs.ref("passage", t.content_id, t.content_id, [t.standing || ""])).join(", ")}</p>` : "")
      + (v.text_withheld ? cs.mark("gap", "withheld") : "");
  }));
  if (/^STD-/.test(id)) out.push(cs.sec(S + "laws", cs.state("relations", view, (v) => {
    const all = (v.temporal || []).concat(v.referential || []).filter((r) => !r.withdrawn);
    return all.length ? cs.sheet(all.map((r) => cs.row(`<b>${cs.w(S + "rel." + (r.type || "refers_to"))}</b>`,
      cs.esc(((r.direction === "in" ? r.from : r.to) || {}).standard || ""), `<span class="cs-meta">${cs.esc(r.reason || "")}</span>`)).join("")) : `<p>${cs.w(S + "laws.none")}</p>`;
  })
    + cs.choice("st-type", S + "type", ["implements", "refers_to", "amends", "repeals", "defines", "excepts"].map((k) => [k, S + "rel." + k]), {})
    + cs.field("st-to", S + "to", { help: S + "to.help" }) + cs.field("st-citation", S + "citation", {}) + cs.field("st-effective", S + "effective", { type: "date", help: S + "effective.help" })
    + cs.act("lawrelate", { label: "act.lawrelate.label.standard" })));
  /* the assistant's proposals: machine work, only while it is reachable, never a standard until adopted */
  if (view.reachable) out.push(cs.sec(S + "proposals", cs.state("proposals", view, (v) => {
    const list = (Array.isArray(v.proposals) ? v.proposals : []).filter((p) => p && (p.proposal_id || p.cite));
    return list.length ? cs.sheet(list.map((p) => cs.row(cs.mark("origin", "machine"), `<span class="rec">${cs.esc(p.cite || p.proposal_id)}</span> · ${cs.w(S + "notyet")}`, `<span class="cs-meta">${cs.esc(p.proposal_id || "")}</span>`)).join(""))
      : `<p>${cs.w(S + "proposals.none")}</p>`;
  }) + cs.field("st-proposal", S + "proposal", { help: S + "proposal.help" })
    + cs.act("standardadopt", { label: "act.standardadopt.label.standard" })));
  /* "Hold this as a standard", from a passage */
  out.push(cs.sec(S + "declare", cs.field("st-cite", S + "cite", { help: S + "cite.help" })
    + cs.choice("st-kind", S + "kindpick", ["policy", "ordinance", "regulation", "statute", "commitment", "standard"].map((k) => [k, S + "kind." + k]), {})
    + cs.field("st-issuer", S + "issuer", {}) + cs.field("st-text", S + "text", { help: S + "text.help" })
    + cs.field("st-from", S + "from", { type: "date" })
    + cs.act("standarddeclare", { label: "act.standarddeclare.label.standard", tone: "primary" })));
  return out.join("");
}

const acts = [
  { op: "standarddeclare", label: "act.standarddeclare.label.standard",
    send(view, el, cs) {
      const cite = String(cs.value("st-cite") || "").trim(), issuer = String(cs.value("st-issuer") || "").trim();
      const text = String(cs.value("st-text") || "").split(",").map((x) => x.trim()).filter(Boolean);
      const from = String(cs.value("st-from") || "").trim();
      if (!cite || !issuer || !text.length) return { refuse: "screen.standard.declare.empty" };
      return { body: Object.assign({ cite, kind: String(cs.value("st-kind") || "policy"), issuer, text }, from ? { period: { from, to: null } } : {}) };
    },
    done(view, answer, cs) { const r = answer && answer.result !== undefined ? answer.result : answer; if (r && r.id) cs.go("standard", r.id); } },
  /* adopting a proposal is the member's own act, with her own reason */
  { op: "standardadopt", label: "act.standardadopt.label.standard",
    send(view, el, cs) {
      const proposal = String(cs.value("st-proposal") || "").trim();
      if (!proposal) return { refuse: "screen.standard.adopt.empty" };
      return { body: { proposal } };
    },
    done(view, answer, cs) { const r = answer && answer.result !== undefined ? answer.result : answer; if (r && r.id) cs.go("standard", r.id); } },
  { op: "lawrelate", label: "act.lawrelate.label.standard",
    send(view, el, cs) {
      const to = String(cs.value("st-to") || "").trim(), citation = String(cs.value("st-citation") || "").trim();
      const type = String(cs.value("st-type") || "implements"), effective = String(cs.value("st-effective") || "").trim();
      if (!to || !citation) return { refuse: "screen.standard.relate.empty" };
      if (["amends", "repeals"].includes(type) && !effective) return { refuse: "screen.standard.relate.effective" };
      return { body: Object.assign({ type, from: String(view.subject || ""), to, citation }, effective ? { effective } : {}) };
    } },
];

export const STANDARD_WORDS = [
  ["sub", "{kind} · {issuer}"],
  ...["statute", "regulation", "ordinance", "court", "policy", "commitment", "standard"].map((k) => ["kind." + k,
    { statute: "Statute", regulation: "Regulation", ordinance: "Ordinance", court: "Court decision", policy: "Policy", commitment: "Commitment", standard: "Standard" }[k]]),
  ["inforce.since", "in force since {from}"],
  ["inforce.span", "in force {from} to {to}"],
  ["inforce.none", "when it is in force is not recorded"],
  ["words", "Its words as written:"],
  ["laws", "Related laws"],
  ["laws.none", "No law is related to this standard yet."],
  ...["implements", "refers_to", "amends", "repeals", "renumbers", "recodifies", "defines", "excepts", "incorporates"].map((k) => ["rel." + k,
    { implements: "Implements", refers_to: "Refers to", amends: "Amends", repeals: "Repeals", renumbers: "Renumbers", recodifies: "Recodifies", defines: "Defines a term of", excepts: "Makes an exception to", incorporates: "Incorporates" }[k]]),
  ["type", "How it relates"],
  ["to", "The law (a standard's id)"],
  ["to.help", "The statute, regulation or ordinance, held as a standard."],
  ["citation", "The passage that says so (a content id)"],
  ["effective", "In effect from (for an amendment or repeal)"],
  ["effective.help", "The day the change takes effect."],
  ["proposals", "Proposed by the assistant"],
  ["proposals.none", "The assistant has proposed no standard here."],
  ["notyet", "not a standard until a member adopts it"],
  ["proposal", "The proposal to adopt"],
  ["proposal.help", "Its id. Adopting it is your own act, with your own reason."],
  ["declare", "Hold a standard"],
  ["cite", "Its citation"],
  ["cite.help", "As the city cites it, for example \"Administrative Instruction 4.12, §3\"."],
  ["kindpick", "What it is"],
  ["issuer", "Who set it"],
  ["text", "Its words (the passage's content ids, separated by commas)"],
  ["text.help", "The passage that states the requirement, as captured."],
  ["from", "In force from (optional)"],
  ["declare.empty", "Give its citation, who set it and the passage that states it."],
  ["adopt.empty", "Name the proposal to adopt."],
  ["relate.empty", "Name the law and the passage that relates them."],
  ["relate.effective", "An amendment or repeal needs the day it takes effect."],
].map(([k, en]) => row("screen.standard." + k, en));

const words = ["screen.standard.name", "screen.standard.purpose",
  ...["standarddeclare", "standardadopt", "lawrelate"].flatMap((op) => ["act." + op + ".label.standard", "act." + op + ".does"]),
  "mark.origin.machine.name", "mark.origin.machine.means", "mark.gap.undetermined.name", "mark.gap.undetermined.means",
  "mark.gap.withheld.name", "mark.gap.withheld.means", "state.empty", "state.loading", "state.failed", ...STANDARD_WORDS];

export const STANDARD_SCREEN = Object.freeze({ id: "standard", reads, render, acts, words, parts: PARTS });
