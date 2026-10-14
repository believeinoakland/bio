/* screens-investigate R2: exploring connections from a person or organisation (People › Person › Explore connections;
 * registry screen `explore`, its 5 acts; K1469, K1486, K1487). The member ticks the kinds to follow (the composed
 * vocabulary's `connection_kinds`, by their words), an optional end, and the day it is explored as of (never "now");
 * `explore` answers the chains, each drawn hop by hop, every hop a reference with its cited source, the chain's grade its
 * weakest hop's. A step declared and not evidenced is a lead, never a finding. No score, rank or "most connected". */

import { row } from "./row.mjs";
import { PARTS } from "./parts.mjs";

const S = "screen.explore.";

function reads() {
  const S = "screen.explore.";
  return {
    vocab: { op: "affordances", query: {}, empty: (v) => !v || !v.vocabularies || !v.vocabularies.connection_kinds
      || !Array.isArray(v.vocabularies.connection_kinds.values) || !v.vocabularies.connection_kinds.values.length },
    presets: { op: "explorepreset", body: { preset: "presets" }, empty: (v) => !Array.isArray(v) || !v.length },
  };
}

function render(cs, view) {
  const S = "screen.explore.";
  const P = view.parts;
  const from = String(view.subject || "");
  const ui = view.ui;
  const out = [cs.title()];
  out.push(`<p class="cs-sub">${cs.w(S + "from")} ${P.refOf(cs, from, from, [])}</p>`);
  const vocab = view.data.vocab && view.data.vocab.state === "ok" ? view.data.vocab.value.vocabularies.connection_kinds : null;
  const wordOf = (k) => (vocab && vocab.words && vocab.words[k] && vocab.words[k].word) || k;
  out.push(cs.sec(S + "follow", cs.state("vocab", view, (v) => {
    const ck = v.vocabularies.connection_kinds;
    const on = Array.isArray(ui.kinds) ? ui.kinds : null;
    return `<fieldset class="cs-field" id="explore-kinds"><legend>${cs.w(S + "follow.legend")}</legend>`
      + ck.values.map((k, i) => `<label><input type="checkbox" name="explore-kinds" id="explore-kinds-${i}" value="${cs.esc(k)}"${!on || on.includes(k) ? " checked" : ""}> ${cs.esc(wordOf(k))}</label>`).join("")
      + "</fieldset>";
  }))
    + cs.field("explore-to", S + "to", { value: ui.to || "", help: S + "to.help" })
    + cs.field("explore-at", S + "at", { type: "date", value: ui.at || P.today(cs), help: S + "at.help" })
    + `<div class="cs-actrow">${cs.act("explore", { label: "act.explore.label.explore", tone: "primary" })}</div>`
    + cs.state("presets", view, (list) => cs.choice("explore-preset", S + "preset", list.map((x) => ({ value: x.name, text: x.words || x.name })), { value: ui.preset || "" })
      + cs.act("explorepreset", { label: "act.explorepreset.label.explore" })));

  /* the chains, as the last walk answered them */
  const a = ui.answer;
  if (ui.refusal) out.push(P.said(cs, ui.refusal));
  if (a) {
    const paths = Array.isArray(a.paths) ? a.paths : [];
    const hopLine = (h, path) => {
      const ev = Array.isArray(h.evidence) ? h.evidence : [];
      const src = ev.map((e) => {
        const s = String(e.source || "");
        if (/^capture:/.test(s)) return P.refOf(cs, s.slice(8), cs.w(S + "cited"), [e.extent && e.extent.page !== undefined ? cs.w(S + "page", { page: String(Number(e.extent.page) + 1) }) : ""], "capture");
        if (/^testimony:/.test(s)) return `<span class="cs-meta">${cs.w(S + "testimony")}</span>`;
        return s ? `<span class="cs-meta">${cs.esc(s)}</span>` : "";
      }).join(" ");
      const mark = (path.marks || []).find((m) => m.hop === h.id);
      const declared = h.label === "declared, not evidenced" || (mark && mark.mark === "declared, not evidenced");
      const hunch = h.label === "hunch" || (mark && mark.mark === "hunch");
      const g = h.grade && /^[A-D]$/.test(h.grade.assertion || "") ? cs.grade("connection", h.grade.assertion) : cs.mark("gap", "unrated");
      return `<li data-hop="${cs.esc(h.id)}">${P.refOf(cs, h.from, h.from, [])} → <i>${cs.esc(wordOf(h.kind))}</i> → ${P.refOf(cs, h.to, h.to, [])} ${g} `
        + (declared ? `<b>${cs.w(S + "declared")}</b> ` + cs.act("connectionassert", { label: "act.connectionassert.label.explore", data: { hop: h.id } })
          : hunch ? cs.mark("hunch") : src || cs.mark("gap", "undetermined", { reason: cs.w(S + "nosource") }))
        + (h.undetermined && h.undetermined.why ? " " + cs.mark("gap", "undetermined", { reason: h.undetermined.why }) : "") + "</li>";
    };
    const chain = (path, i) => {
      const lead = path.label === "lead";
      const grade = path.grade && /^[A-D]$/.test(path.grade.assertion || "") ? cs.grade("connection", path.grade.assertion) : cs.mark("gap", "unrated");
      const derived = (path.hops || []).some((h) => h.derived);
      return `<div class="cs-chain" data-chain="${i}">${grade} <span class="cs-meta">${cs.w(lead ? S + "lead" : S + "evidenced")}</span>`
        + `<ol class="cs-hops">${(path.hops || []).map((h) => hopLine(h, path)).join("")}</ol>`
        + (path.at_date === "undetermined" ? cs.mark("gap", "undetermined", { reason: (path.undetermined && path.undetermined.why) || cs.w(S + "atdate") }) : "")
        + `<div class="cs-actrow">${derived ? cs.act("exploreverify", { label: "act.exploreverify.label.explore", data: { chain: String(i) } }) : ""}`
        + `${cs.act("promote", { label: "act.promote.label.explore", data: { chain: String(i) } })}</div>`
        + (ui.verified && ui.verified[i] ? `<ul class="cs-meta">${ui.verified[i].map((v) => `<li>${cs.w(v.matches ? S + "verify.matches" : S + "verify.differs", { why: v.why || "" })}</li>`).join("")}</ul>` : "")
        + "</div>";
    };
    out.push(cs.sec(S + "chains", paths.length ? cs.sheet(paths.map(chain).join("")) + `<p class="cs-meta">${cs.w(S + "noscore")}</p>`
      : `<p>${a.absence && a.absence.meaning ? cs.esc(a.absence.meaning) : cs.w(S + "nochains")}</p>`, { fills: { n: String(paths.length) } }));
    /* a walk stopped at a bound says so: what lies beyond is undetermined, never absent */
    if (a.truncated || a.complete === false)
      out.push(cs.mark("gap", "undetermined", { reason: a.why || cs.w(S + "stopped", { depth: String(a.depth || "") }) }));
  }
  if (ui.promoted) out.push(`<p class="cs-note">${cs.w(S + "promoted")}</p>`);
  /* "Attach a source to this step": the document that shows it, and the one the step was declared from */
  if (a && (a.paths || []).some((p) => (p.marks || []).some((m) => m.mark === "declared, not evidenced") || (p.hops || []).some((h) => h.label === "declared, not evidenced")))
    out.push(cs.sec(S + "assert.head", cs.field("explore-assert-a", S + "assert.a", { help: S + "assert.a.help" })
      + cs.field("explore-assert-b", S + "assert.b", {}) + cs.field("explore-assert-basis", S + "assert.basis", { area: true, rec: true })));
  return out.join("");
}

const acts = [
  { op: "explore", label: "act.explore.label.explore", rereads: [],
    send(view, el, cs) {
      const kinds = cs.value("explore-kinds");
      const at = String(cs.value("explore-at") || "").trim();
      const to = String(cs.value("explore-to") || "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(at)) return { refuse: "screen.explore.at.empty" };
      view.ui.kinds = Array.isArray(kinds) ? kinds : null;
      view.ui.at = at;
      view.ui.to = to;
      const body = { from: String(view.subject || ""), at: { value: at, precision: "day", zone: "UTC" } };
      if (to) body.to = to;
      if (Array.isArray(kinds) && kinds.length) body.kinds = kinds;
      return { body };
    },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      if (r && typeof r.refused === "string") { view.ui.answer = null; cs.set("refusal", { code: r.refused, translation: r.why || null }); return { stay: true }; }
      view.ui.refusal = null; view.ui.verified = {};
      cs.set("answer", r);
      return { stay: true };
    } },
  { op: "explorepreset", label: "act.explorepreset.label.explore", rereads: [],
    send(view, el, cs) {
      const preset = String(cs.value("explore-preset") || "");
      const at = String(cs.value("explore-at") || "").trim();
      const to = String(cs.value("explore-to") || "").trim();
      if (!preset || !/^\d{4}-\d{2}-\d{2}$/.test(at)) return { refuse: "screen.explore.at.empty" };
      view.ui.preset = preset;
      const body = { preset, from: String(view.subject || ""), at: { value: at, precision: "day", zone: "UTC" } };
      if (to) body.to = to;
      if (preset === "overlaps") { body.a = body.from; body.b = to; delete body.from; delete body.to; }
      return { body };
    },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      if (r && typeof r.refused === "string") { view.ui.answer = null; cs.set("refusal", { code: r.refused, translation: r.why || null }); return { stay: true }; }
      view.ui.refusal = null; view.ui.verified = {};
      cs.set("answer", r);
      return { stay: true };
    } },
  /* "Check this chain": each derived step re-derived from what the record holds now (explore R7), each answer drawn */
  { op: "exploreverify", label: "act.exploreverify.label.explore",
    send(view, el, cs) {
      const i = Number(el.dataset.chain);
      const path = view.ui.answer && view.ui.answer.paths ? view.ui.answer.paths[i] : null;
      if (!path) return null;
      const hops = (path.hops || []).filter((h) => h.derived);
      Promise.all(hops.map((h) => cs.call("exploreverify", { body: { kind: h.kind, from: h.from, to: h.to, id: h.id,
        as_of: h.derived.as_of, method: h.derived.method } }).then((a) => {
        const r = a && a.result !== undefined ? a.result : a;
        return { matches: !!(r && r.matches), why: (r && (r.why || r.translation || r.code || r.reason)) || "" };
      }))).then((list) => { const v = Object.assign({}, view.ui.verified || {}); v[i] = list; cs.set("verified", v); });
      return null;
    } },
  /* "Attach a source to this step": joins the document that shows the step to the one it was declared from, with the
     member's basis (connections R53), so the step can be cited */
  { op: "connectionassert", label: "act.connectionassert.label.explore", reasonField: "basis",
    send(view, el, cs) {
      const a = String(cs.value("explore-assert-a") || "").trim(), b = String(cs.value("explore-assert-b") || "").trim();
      const basis = String(cs.value("explore-assert-basis") || "").trim();
      if (!a || !b || !basis) return { refuse: "screen.explore.assert.empty" };
      return { body: { a, b, basis: basis + " (" + String(el.dataset.hop || "") + ")" } };
    } },
  /* "Open a question from this chain": a new inquiry whose question names the chain, opened at its screen */
  { op: "promote", label: "act.promote.label.explore",
    send(view, el, cs) {
      const i = Number(el.dataset.chain);
      const path = view.ui.answer && view.ui.answer.paths ? view.ui.answer.paths[i] : null;
      if (!path) return null;
      const steps = (path.hops || []).map((h) => h.from + " → " + h.kind + " → " + h.to).join("; ");
      const title = ("What does this chain show: " + steps).replace(/\s+/g, " ").slice(0, 120);
      const fail = (a) => { const r = a && a.result !== undefined ? a.result : a; cs.set("refusal", { code: (r && (r.code || r.reason)) || "", translation: (r && r.translation) || null }); };
      const clock = new Date(cs.now());
      cs.call("allocid", { query: { prefix: "INQ", year: String(clock.getUTCFullYear()) } }).then((a) => {
        const r = a && a.result !== undefined ? a.result : a;
        if (!r || !r.id) return fail(a);
        const id = r.id + "-chain";
        const now = clock.toISOString().split(".")[0] + "Z";
        const lines = ["---", "id: " + id, "object_type: inquiry", "schema: inquiry@1", "title: " + JSON.stringify(title),
          "current_state: open", "prior_state: null", "created: " + now, "last_updated: " + now,
          "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []",
          "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
          "surfaced_by: human", "recheck_triggers:", "  - text: Revisit this chain",
          "    description: Opened from a chain found by exploring connections; re-explore when its steps change.", "---", ""];
        ["## Question", "## What It Rests On", "## Conclusion", "## What Would Falsify This", "## Session Log", "## Review Notes"].forEach((h, k) => {
          lines.push(h, "");
          if (k === 0) lines.push("What does this chain of connections show, and does each step hold? " + steps, "");
          if (k === 1) lines.push("Explored as of " + ((view.ui.at) || "") + ", each step as the record cites it: " + steps, "");
        });
        const stamp = now.replace(/[-:]/g, "") + "_" + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
        return cs.call("promote", { body: { bundleId: id, base: null, snapKey: stamp,
          meta: { object_type: "inquiry", title, current_state: "open", created: now, last_updated: now },
          files: [{ path: "bundle.md", text: lines.join("\n") }] } }).then((p) => {
          const pr = p && p.result !== undefined ? p.result : p;
          if (!p || p.ok === false || !pr || pr.ok === false) return fail(p);
          view.ui.promoted = id;
          cs.go("question", id);
        });
      }, () => fail(null));
      return null;
    } },
];

export const EXPLORE_WORDS = [
  row(S + "from", "From"),
  row(S + "follow", "What to follow"),
  row(S + "follow.holds", "The kinds of connection the walk follows, by their words. Untick a kind to leave it out."),
  row(S + "follow.legend", "Follow"),
  row(S + "to", "To (optional)"),
  row(S + "to.help", "Another person, organisation, payment or project, by its record id. Leave it empty to see where the connections lead."),
  row(S + "at", "As of"),
  row(S + "at.help", "The day the connections are explored as of: a post held then, a payment made by then."),
  row(S + "at.empty", "Give the day to explore as of."),
  row(S + "preset", "A ready-made search"),
  row(S + "chains", "Chains found: {n}"),
  row(S + "chains.holds", "Each chain step by step, every step cited and graded; a chain is only as strong as its weakest step."),
  row(S + "lead", "a lead, not a finding: a step in it was declared or suspected, with no source attached"),
  row(S + "evidenced", "each step cited; the chain's grade is its weakest step's"),
  row(S + "declared", "declared, not evidenced"),
  row(S + "cited", "the cited passage"),
  row(S + "page", "page {page}"),
  row(S + "testimony", "a member's own testimony"),
  row(S + "nosource", "this step names no source"),
  row(S + "atdate", "whether this held on that day"),
  row(S + "nochains", "No chain was found among the connections the record holds."),
  row(S + "noscore", "Chains are listed by how few steps they take, never scored or ranked."),
  row(S + "stopped", "Stopped at the limit: the walk went {depth} steps and stopped; what lies beyond is undetermined, not absent."),
  row(S + "verify.matches", "This step holds as the record has it now."),
  row(S + "verify.differs", "This step does not hold as recorded: {why}"),
  row(S + "promoted", "The question was opened from this chain."),
  row(S + "assert.head", "Attach a source to a declared step"),
  row(S + "assert.a", "The document that shows the step"),
  row(S + "assert.a.help", "The document, by its record id, whose passage shows this step."),
  row(S + "assert.b", "The document the step was declared from"),
  row(S + "assert.basis", "What the document shows, in your words"),
  row(S + "assert.empty", "Name both documents and say what the passage shows."),
];

const words = ["screen.explore.name", "screen.explore.purpose",
  ...["explore", "explorepreset", "exploreverify", "connectionassert", "promote"].flatMap((op) => ["act." + op + ".label.explore", "act." + op + ".does"]),
  "mark.scale.connection.name", "mark.scale.connection.means", "mark.grade.reading", "mark.hunch.means",
  "mark.gap.undetermined.name", "mark.gap.undetermined.means", "mark.gap.unrated.name", "mark.gap.unrated.means",
  "state.empty", "state.loading", "state.failed", ...EXPLORE_WORDS];

export const EXPLORE_SCREEN = Object.freeze({ id: "explore", reads, render, acts, words, parts: PARTS });
