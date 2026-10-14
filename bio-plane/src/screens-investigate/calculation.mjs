/* screens-investigate R5, R14, R11: a calculation and its spot-check (Projects › <project> › Calculation; registry screen
 * `calculation`, its 9 acts; N735; U115), and the help page "How spot-checks work" (registry screen `help`, no acts;
 * N997). Reads `calculations`' `calculation` (the computed fact, its method as written, its inputs with their grades,
 * its checks) and, where it rests on a draw, `spotcheck` (the draw, the question, each drawn item with its visits and
 * standing, the counts) with the estimate and its exact range from the estimate's own calculation. A member records
 * what she saw at a drawn report in two acts: `testify` (her own words) and `spotcheckvisit` (tying it to the item). */

import { PARTS } from "./parts.mjs";

function reads(view) {
  const id = String(view.subject || "");
  return { calc: { op: "calculation", query: { id }, subject: true, empty: (v) => !v || v.found === false } };
}

/** R8's project step: the calculation's project, by its id (the project's title is read where it is drawn). */
function place(view) {
  const c = view.data && view.data.calc;
  const p = c && c.state === "ok" ? String(c.value.project || "") : "";
  return { project: { id: p, title: p } };
}

function render(cs, view) {
  const S = "screen.calculation.";
  const P = view.parts;
  const ui = view.ui;
  const c = view.data.calc && view.data.calc.state === "ok" ? view.data.calc.value : null;
  const out = [cs.title(c ? c.question || c.calc_id : String(view.subject || ""), { thing: { kind: "record", facts: c ? [c.kind || ""] : [] } })];
  const fig = (o) => (o && o.value !== undefined ? (o.sign === "-" ? "−" : "") + String(o.value) : o && o.low !== undefined ? o.low + "–" + o.high : "");
  out.push(cs.state("calc", view, (v) => {
    const r = v.results || {};
    const g = v.grade || {};
    const status = ["unchecked", "agrees", "differs", "stale"].includes(v.recompute_status) ? v.recompute_status : "unchecked";
    return `<div class="mk-bignum"><b>${cs.esc(fig(r.output))}</b><span>${cs.esc(r.says || "")}</span></div>`
      + cs.sec(S + "method", `<p class="rec">${cs.esc(v.method_note || (g.method && g.method.note) || v.method_version || "")}</p>`
        + (v.calculation && v.calculation.recipe ? `<pre class="mk-small">${cs.esc(JSON.stringify(v.calculation.recipe, null, 1))}</pre>` : "")
        + `<p class="mk-small">${cs.w(S + "status." + status)}${v.accepted_by ? " · " + cs.w(S + "accepted", { by: String(v.accepted_by).replace(/^member:/, ""), date: cs.date(v.accepted_at || "") }) : ""}</p>`)
      + cs.sec(S + "inputs", cs.sheet(((g.inputs && g.inputs.length ? g.inputs : (v.inputs || []).map((x) => ({ name: x.name, kind: x.kind, ref: x.sha || x.content_id })))).map((x) =>
        cs.row(/^[A-D]$/.test(x.grade || "") ? cs.grade("capture", x.grade) : cs.mark("gap", "unrated"),
          `<b>${cs.esc(x.name)}</b> · ${cs.esc(x.kind || "")} ${x.ref ? P.refOf(cs, x.ref, x.ref, [x.why || ""]) : ""}`, x.unbound ? cs.mark("gap", "undetermined", { reason: cs.w(S + "unbound") }) : "")).join(""))
        + (g.capture && g.capture.why ? `<p class="mk-small">${cs.esc(g.capture.why)}</p>` : ""))
      + ((r.counted_apart || []).length ? `<p class="mk-small">${cs.w(S + "apart", { n: String(r.counted_apart.length) })}</p>` : "");
  }));
  out.push(`<div class="mk-acts">${cs.act("calculationaccept", { label: "act.calculationaccept.label.calculation" })}${cs.act("recordcheck", { label: "act.recordcheck.label.calculation" })}</div>`);
  /* the spot-check: the draw the calculation rests on, or the one drawn here */
  const drawKey = ui.draw || (c && (c.inputs || []).map((x) => x.draw || (x.kind === "draw" ? x.sha || x.ref : null)).find(Boolean)) || null;
  const spot = drawKey ? P.later(cs, view, "spot", "spotcheck", { query: { draw: drawKey } }) : null;
  const estId = spot && spot.state === "ok" && (spot.value.estimates || [])[0] ? spot.value.estimates[0].calc_id : null;
  const est = estId ? (c && estId === c.calc_id ? { state: "ok", value: c } : P.later(cs, view, "est", "calculation", { query: { id: estId } })) : null;
  const spotInner = !spot ? "" : cs.state(spot, (s) => {
    if (s.found === false) return "";
    const d = s.draw || {};
    const k = s.counts || {};
    /* the draw's question is answered yes, no or could not tell: the sentences that name the answer use the keyed "Yes", lower-cased */
    const yes = cs.w(S + "standing.yes").toLowerCase();
    const range = est && est.state === "ok" && est.value.results && est.value.results.interval ? est.value.results.interval : null;
    return `<dl class="mk-facts"><dt>${cs.w(S + "draw")}</dt><dd>${cs.w(S + "draw.what", { n: String(d.n || 0), size: String(d.set_size || 0), seed: String(d.seed || "") })}<span class="mk-small">${cs.w(S + "draw.repeat")} ${cs.esc(d.method || "")}</span></dd>`
      + (s.question ? `<dt>${cs.w(S + "question")}</dt><dd class="rec">${cs.esc(s.question)}</dd>` : "")
      + (() => {
        /* R22: no count is drawn at zero: only the findings that were made. The design's one sentence for the counts
           (`counts`) names all three, zeros included, so the parts are drawn by their own words */
        const bits = [["yes", k.yes], ["no", k.no], ["unsure", k.could_not_tell], ["disagree", k.disagree], ["notvisited", k.not_visited]].filter((x) => x[1]).map((x) => cs.w(S + "counts." + x[0], { n: String(x[1]) }));
        return bits.length ? `<dt>${cs.w(S + "found")}</dt><dd>${bits.join(", ")}</dd>` : "";
      })()
      + `<dt>${cs.w(S + "estimate")}</dt><dd>${range ? cs.w(S + "range", { share: String(Math.round((range.successes / Math.max(1, range.sample_size)) * 100)), judged: String(range.sample_size), answer: yes, confidence: String(Math.round((range.confidence || 0.95) * 100)), low: String(Math.round((range.low_share || 0) * 100)), high: String(Math.round((range.high_share || 0) * 100)) })
        : est ? cs.state(est, () => cs.mark("gap", "undetermined", { reason: cs.w(S + "noestimate") })) : cs.mark("gap", "undetermined", { reason: cs.w(S + "noestimate") })}</dd></dl>`
      + cs.sheet((s.items || []).map((it) => cs.row(`<span class="cs-kind" data-standing="${cs.esc(it.standing)}">${cs.w(S + "standing." + (["yes", "no", "disagree", "could_not_tell", "not_visited"].includes(it.standing) ? it.standing : "not_visited"))}</span>`,
        `<b>${cs.w(S + "item", { item: String(it.item) })}</b>` + (it.standing === "disagree" ? ` <span class="mk-small">${cs.w(S + "tension")}</span>` : ""),
        (it.visits || []).map((x) => `<span>${cs.grade("testimony", x.grade || "D")} ${cs.w(S + "visit", { finding: cs.w(S + "finding." + (["yes", "no", "could_not_tell"].includes(x.finding) ? x.finding : "could_not_tell")), by: String(x.visitor || "").replace(/^member:/, ""), date: cs.date(x.observed_at || "") })} ${P.refOf(cs, x.testimony, cs.w(S + "account"), [], "capture")}</span>`).join(" "))).join(""));
  });
  const items = spot && spot.state === "ok" ? (spot.value.items || []).map((x) => ({ value: String(x.item), text: cs.w(S + "item", { item: String(x.item) }) })) : [];
  out.push(cs.sec(S + "spot", spotInner
    + `<p class="mk-small">${cs.w("screen.help.notsays.p")} <a href="/app/help" data-nav>${cs.w(S + "help")}</a></p>`
    + cs.field("calc-set", S + "set", { help: S + "set.help" }) + cs.field("calc-n", S + "n", { value: "40" }) + cs.field("calc-seed", S + "seed", { help: S + "seed.help" })
    + cs.field("calc-dq", S + "dq", { area: true, rec: true })
    + cs.act("calculationdraw", { label: "act.calculationdraw.label.calculation" })
    + cs.field("calc-words", S + "words", { area: true, rec: true, help: S + "words.help" }) + cs.field("calc-observed", S + "observed", { type: "date", value: P.today(cs) })
    + cs.act("testify", { label: "act.testify.label.calculation" })
    + (ui.testimony ? `<p class="mk-note">${cs.w(S + "testified")}</p>` : "")
    + cs.choice("calc-item", S + "itempick", items, {})
    + cs.checks("calc-finding", S + "finding", [["yes", S + "finding.yes", false], ["no", S + "finding.no", false], ["could_not_tell", S + "finding.could_not_tell", false]], { radio: true })
    + cs.field("calc-photo", S + "photo", { help: S + "photo.help" })
    + cs.act("spotcheckvisit", { label: "act.spotcheckvisit.label.calculation" }), { help: S + "spot.help" }));
  /* working it out, and a member's own spreadsheet */
  out.push(cs.sec(S + "work", cs.field("calc-q", S + "q", { rec: true }) + cs.field("calc-from", S + "from", { type: "date" }) + cs.field("calc-to", S + "to", { type: "date" })
    + cs.choice("calc-kind", S + "kind", ["count", "total", "share", "ratio", "difference", "estimate"].map((k) => [k, S + "kind." + k]), {})
    + cs.field("calc-input", S + "input", { help: S + "input.help" })
    + cs.act("calculationcreate", { label: "act.calculationcreate.label.calculation", tone: "primary" })
    + cs.field("calc-content", S + "content", { help: S + "content.help" }) + cs.field("calc-header", S + "header", { help: S + "header.help" })
    + cs.act("tabledeclare", { label: "act.tabledeclare.label.calculation" })));
  out.push(cs.sec(S + "workbook", cs.field("calc-wb", S + "wb", { help: S + "wb.help" }) + cs.field("calc-period", S + "period", {})
    + cs.act("addworkbook", { label: "act.addworkbook.label.calculation" })
    + cs.field("calc-range", S + "range.field", { help: S + "range.help" }) + cs.field("calc-table", S + "table", {}) + cs.field("calc-trange", S + "trange", {})
    + cs.act("bind", { label: "act.bind.label.calculation" })
    + cs.choice("calc-outcome", S + "outcome", [["agrees", S + "outcome.agrees"], ["disagrees", S + "outcome.disagrees"], ["could_not_check", S + "outcome.could_not_check"]], {})
    + cs.field("calc-note", S + "note", {})));
  return out.join("");
}

const acts = [
  { op: "calculationcreate", label: "act.calculationcreate.label.calculation",
    send(view, el, cs) {
      const question = String(cs.value("calc-q") || "").trim(), input = String(cs.value("calc-input") || "").trim();
      const from = String(cs.value("calc-from") || ""), to = String(cs.value("calc-to") || "");
      if (!question || !input || (!from && !to)) return { refuse: "screen.calculation.work.empty" };
      const kind = String(cs.value("calc-kind") || "count");
      const ref = /^MNY-/.test(input) ? { money: input } : /^CALC-/.test(input) ? { calculation: input } : /^[0-9a-f]{64}$/.test(input) ? (kind === "estimate" ? { draw: input } : { table: input }) : { figure: input };
      const c = view.data.calc && view.data.calc.state === "ok" ? view.data.calc.value : null;
      return { body: Object.assign({ question, period: { from: from || null, to: to || null }, kind, inputs: [Object.assign({ name: "input" }, ref)] }, c && c.project ? { project: c.project } : {}) };
    },
    done(view, answer, cs) { const r = answer && answer.result !== undefined ? answer.result : answer; if (r && r.calc_id) cs.go("calculation", r.calc_id); } },
  { op: "tabledeclare", label: "act.tabledeclare.label.calculation",
    send(view, el, cs) {
      const source = String(cs.value("calc-content") || "").trim();
      const header = String(cs.value("calc-header") || "").split(",").map((x) => x.trim()).filter(Boolean);
      if (!source || !header.length) return { refuse: "screen.calculation.table.empty" };
      return { body: { source, header, schema: { fields: header.map((name) => ({ name, type: "string" })) } } };
    } },
  { op: "calculationdraw", label: "act.calculationdraw.label.calculation",
    send(view, el, cs) {
      const set = String(cs.value("calc-set") || "").trim().toLowerCase(), n = Number(cs.value("calc-n"));
      if (!/^[0-9a-f]{64}$/.test(set) || !Number.isInteger(n) || n < 1) return { refuse: "screen.calculation.draw.empty" };
      const seed = String(cs.value("calc-seed") || "").trim(), question = String(cs.value("calc-dq") || "").trim();
      const c = view.data.calc && view.data.calc.state === "ok" ? view.data.calc.value : null;
      return { body: Object.assign({ set, n }, seed ? { seed } : {}, question ? { question } : {}, c && c.project ? { project: c.project } : {}) };
    },
    done(view, answer) { const r = answer && answer.result !== undefined ? answer.result : answer; if (r && r.draw) { view.ui.draw = r.draw; view.ui.later = {}; } } },
  { op: "addworkbook", label: "act.addworkbook.label.calculation",
    send(view, el, cs) {
      const captureSha = String(cs.value("calc-wb") || "").trim().toLowerCase(), period = String(cs.value("calc-period") || "").trim();
      const c = view.data.calc && view.data.calc.state === "ok" ? view.data.calc.value : null;
      if (!/^[0-9a-f]{64}$/.test(captureSha) || !period || !c || !c.project) return { refuse: "screen.calculation.wb.empty" };
      return { body: { captureSha, question: c.question || "", period, project: c.project } };
    } },
  { op: "bind", label: "act.bind.label.calculation",
    send(view, el, cs) {
      const captureSha = String(cs.value("calc-wb") || "").trim().toLowerCase(), range = String(cs.value("calc-range") || "").trim();
      const table = String(cs.value("calc-table") || "").trim(), trange = String(cs.value("calc-trange") || "").trim();
      const c = view.data.calc && view.data.calc.state === "ok" ? view.data.calc.value : null;
      if (!captureSha || !range || !table || !c || !c.project) return { refuse: "screen.calculation.bind.empty" };
      return { body: { captureSha, project: c.project, range, input: /^[0-9a-f]{64}$/.test(table) ? { table, range: trange || "A1:A1" } : { extent: table } } };
    } },
  { op: "recordcheck", label: "act.recordcheck.label.calculation", reasonField: "note",
    send(view, el, cs) {
      const captureSha = String(cs.value("calc-wb") || "").trim().toLowerCase();
      const c = view.data.calc && view.data.calc.state === "ok" ? view.data.calc.value : null;
      if (!captureSha || !c || !c.project) return { refuse: "screen.calculation.wb.empty" };
      return { body: { captureSha, project: c.project, outcome: String(cs.value("calc-outcome") || "agrees"), note: String(cs.value("calc-note") || "").trim() } };
    } },
  { op: "calculationaccept", label: "act.calculationaccept.label.calculation",
    send(view) { return { query: { id: String(view.subject || "") } }; } },
  /* R14: "Record what you saw at a report": her own words, as testimony (its words serve as its reason, DEC-88) */
  { op: "testify", label: "act.testify.label.calculation", reasonField: "words", rereads: [],
    send(view, el, cs) {
      const words = String(cs.value("calc-words") || "").trim(), observedAt = String(cs.value("calc-observed") || "").trim();
      if (!words || !/^\d{4}-\d{2}-\d{2}$/.test(observedAt)) return { refuse: "screen.calculation.words.empty" };
      return { body: { words, observedAt } };
    },
    done(view, answer, cs) { const r = answer && answer.result !== undefined ? answer.result : answer; if (r && r.capture_sha) cs.set("testimony", r.capture_sha); return { stay: true }; } },
  /* R14: "Count it for the drawn report": her testimony tied to one drawn item, with her finding */
  { op: "spotcheckvisit", label: "act.spotcheckvisit.label.calculation",
    send(view, el, cs) {
      const draw = view.ui.draw || null;
      const c = view.data.calc && view.data.calc.state === "ok" ? view.data.calc.value : null;
      const key = draw || (c && (c.inputs || []).map((x) => x.draw || (x.kind === "draw" ? x.sha || x.ref : null)).find(Boolean));
      const item = String(cs.value("calc-item") || ""), testimony = view.ui.testimony;
      const finding = ["yes", "no", "could_not_tell"].find((f, i) => cs.value("calc-finding-" + i) === true);
      if (!key || !item || !testimony || !finding) return { refuse: "screen.calculation.visit.empty" };
      const photo = String(cs.value("calc-photo") || "").trim().toLowerCase();
      return { body: Object.assign({ draw: key, item, testimony, finding }, /^[0-9a-f]{64}$/.test(photo) ? { exhibits: [photo] } : {}) };
    },
    done(view) { view.ui.testimony = null; view.ui.later = {}; } },
];

const CALCULATION_KEYS = [
  "screen.calculation.counts.yes", "screen.calculation.counts.no", "screen.calculation.counts.unsure",
  "screen.calculation.method", "screen.calculation.method.holds", "screen.calculation.status.unchecked", "screen.calculation.status.agrees",
  "screen.calculation.status.differs", "screen.calculation.status.stale", "screen.calculation.accepted", "screen.calculation.inputs",
  "screen.calculation.unbound", "screen.calculation.apart", "screen.calculation.draw", "screen.calculation.draw.what",
  "screen.calculation.draw.repeat", "screen.calculation.question", "screen.calculation.found",
  "screen.calculation.counts.disagree",
  "screen.calculation.counts.notvisited", "screen.calculation.estimate", "screen.calculation.range", "screen.calculation.noestimate",
  "screen.calculation.standing.yes", "screen.calculation.standing.no", "screen.calculation.standing.disagree",
  "screen.calculation.standing.could_not_tell", "screen.calculation.standing.not_visited", "screen.calculation.item", "screen.calculation.tension",
  "screen.calculation.visit", "screen.calculation.account", "screen.calculation.finding", "screen.calculation.finding.yes",
  "screen.calculation.finding.no", "screen.calculation.finding.could_not_tell", "screen.calculation.spot", "screen.calculation.spot.help",
  "screen.calculation.help", "screen.calculation.set", "screen.calculation.set.help", "screen.calculation.n",
  "screen.calculation.seed", "screen.calculation.seed.help", "screen.calculation.dq", "screen.calculation.words", "screen.calculation.words.help",
  "screen.calculation.observed", "screen.calculation.testified", "screen.calculation.itempick", "screen.calculation.photo",
  "screen.calculation.photo.help", "screen.calculation.work", "screen.calculation.q", "screen.calculation.from", "screen.calculation.to",
  "screen.calculation.kind", "screen.calculation.kind.count", "screen.calculation.kind.total", "screen.calculation.kind.share",
  "screen.calculation.kind.ratio", "screen.calculation.kind.difference", "screen.calculation.kind.estimate", "screen.calculation.input",
  "screen.calculation.input.help", "screen.calculation.content", "screen.calculation.content.help", "screen.calculation.header",
  "screen.calculation.header.help", "screen.calculation.workbook", "screen.calculation.wb", "screen.calculation.wb.help",
  "screen.calculation.period", "screen.calculation.range.field", "screen.calculation.range.help", "screen.calculation.table",
  "screen.calculation.trange", "screen.calculation.outcome", "screen.calculation.outcome.agrees", "screen.calculation.outcome.disagrees",
  "screen.calculation.outcome.could_not_check", "screen.calculation.note", "screen.calculation.work.empty", "screen.calculation.table.empty",
  "screen.calculation.draw.empty", "screen.calculation.wb.empty", "screen.calculation.bind.empty", "screen.calculation.words.empty",
  "screen.calculation.visit.empty",
];

/** R11: the help page's sentences, plain words for any calculation a group tests against what members see. */
const HELP_KEYS = [
  "screen.help.sub", "screen.help.does", "screen.help.does.p", "screen.help.random", "screen.help.random.p", "screen.help.says",
  "screen.help.says.p", "screen.help.notsays", "screen.help.notsays.p", "screen.help.evidence", "screen.help.evidence.p", "screen.help.back",
  "screen.help.purpose",
];

function renderHelp(cs) {
  const H = "screen.help.";
  return cs.title() + `<p class="mk-sub">${cs.w(H + "sub")}</p>`
    + ["does", "random", "says", "notsays", "evidence"].map((k) => cs.sec(H + k, `<p>${cs.w(H + k + ".p")}</p>`)).join("");
}

const words = ["screen.calculation.name", "screen.calculation.purpose",
  ...["calculationcreate", "tabledeclare", "calculationdraw", "addworkbook", "bind", "recordcheck", "calculationaccept", "testify", "spotcheckvisit"]
    .flatMap((op) => ["act." + op + ".label.calculation", "act." + op + ".does"]),
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.scale.testimony.name", "mark.scale.testimony.means", "mark.grade.reading",
  "mark.gap.undetermined.name", "mark.gap.undetermined.means", "mark.gap.unrated.name", "mark.gap.unrated.means",
  "screen.help.notsays.p", "state.empty", "state.loading", "state.failed", ...CALCULATION_KEYS];

export const CALCULATION_SCREEN = Object.freeze({ id: "calculation", ABSENT_CODES: Object.freeze(["NO_ENTITY", "NO_CALC"]), reads, place, render, acts, words, parts: PARTS });
export const HELP_SCREEN = Object.freeze({ id: "help", reads: () => ({}), render: renderHelp, acts: [], words: ["screen.help.name", ...HELP_KEYS] });
