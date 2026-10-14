/* screens-investigate R5, R14, R11: a calculation and its spot-check (Projects › <project> › Calculation; registry screen
 * `calculation`, its 9 acts; N735; U115), and the help page "How spot-checks work" (registry screen `help`, no acts;
 * N997). Reads `calculations`' `calculation` (the computed fact, its method as written, its inputs with their grades,
 * its checks) and, where it rests on a draw, `spotcheck` (the draw, the question, each drawn item with its visits and
 * standing, the counts) with the estimate and its exact range from the estimate's own calculation. A member records
 * what she saw at a drawn report in two acts: `testify` (her own words) and `spotcheckvisit` (tying it to the item). */

import { row } from "./row.mjs";
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
    const range = est && est.state === "ok" && est.value.results && est.value.results.interval ? est.value.results.interval : null;
    return `<dl class="mk-facts"><dt>${cs.w(S + "draw")}</dt><dd>${cs.w(S + "draw.what", { n: String(d.n || 0), size: String(d.set_size || 0), seed: String(d.seed || "") })}<span class="mk-small">${cs.w(S + "draw.repeat")} ${cs.esc(d.method || "")}</span></dd>`
      + (s.question ? `<dt>${cs.w(S + "question")}</dt><dd class="rec">${cs.esc(s.question)}</dd>` : "")
      + (() => {
        /* R22: no count is drawn at zero: only the findings that were made */
        const bits = [["yes", k.yes], ["no", k.no], ["unsure", k.could_not_tell], ["disagree", k.disagree], ["notvisited", k.not_visited]].filter((x) => x[1]).map((x) => cs.w(S + "counts." + x[0], { n: String(x[1]) }));
        return bits.length ? `<dt>${cs.w(S + "found")}</dt><dd>${cs.w(S + "counts", { judged: String(k.judged || 0), n: String(d.n || 0), list: bits.join(", ") })}</dd>` : "";
      })()
      + `<dt>${cs.w(S + "estimate")}</dt><dd>${range ? cs.w(S + "range", { share: String(Math.round((range.successes / Math.max(1, range.sample_size)) * 100)), low: String(Math.round((range.low_share || 0) * 100)), high: String(Math.round((range.high_share || 0) * 100)), confidence: String(Math.round((range.confidence || 0.95) * 100)), lowc: String(range.low), highc: String(range.high), size: String(range.frame_size) })
        : est ? cs.state(est, () => cs.mark("gap", "undetermined", { reason: cs.w(S + "noestimate") })) : cs.mark("gap", "undetermined", { reason: cs.w(S + "noestimate") })}</dd></dl>`
      + cs.sheet((s.items || []).map((it) => cs.row(`<span class="cs-kind" data-standing="${cs.esc(it.standing)}">${cs.w(S + "standing." + (["yes", "no", "disagree", "could_not_tell", "not_visited"].includes(it.standing) ? it.standing : "not_visited"))}</span>`,
        `<b>${cs.w(S + "item", { item: String(it.item) })}</b>` + (it.standing === "disagree" ? ` <span class="mk-small">${cs.w(S + "tension")}</span>` : ""),
        (it.visits || []).map((x) => `<span>${cs.grade("testimony", x.grade || "D")} ${cs.w(S + "visit", { finding: cs.w(S + "finding." + (["yes", "no", "could_not_tell"].includes(x.finding) ? x.finding : "could_not_tell")), by: String(x.visitor || "").replace(/^member:/, ""), date: cs.date(x.observed_at || "") })} ${P.refOf(cs, x.testimony, cs.w(S + "account"), [], "capture")}</span>`).join(" "))).join(""));
  });
  const items = spot && spot.state === "ok" ? (spot.value.items || []).map((x) => ({ value: String(x.item), text: cs.w(S + "item", { item: String(x.item) }) })) : [];
  out.push(cs.sec(S + "spot", spotInner
    + `<p class="mk-small">${cs.w(S + "notsays")} <a href="/app/help" data-nav>${cs.w(S + "help")}</a></p>`
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

export const CALCULATION_WORDS = [
  ["method", "Method"],
  ["method.holds", "How the figure was worked out, as written, so anyone can repeat it."],
  ["status.unchecked", "Not yet recomputed by a second member."],
  ["status.agrees", "Recomputed: it agrees."],
  ["status.differs", "Recomputed: it differs from what is stored."],
  ["status.stale", "An input changed since it was worked out: work it out again."],
  ["accepted", "accepted by {by} on {date}"],
  ["inputs", "Inputs"],
  ["unbound", "not tied to the record"],
  ["apart", "{n} items were counted apart, never guessed."],
  ["draw", "The draw"],
  ["draw.what", "{n} of {size} picked at random · seed {seed}"],
  ["draw.repeat", "Anyone can repeat it from the seed and get the same items, so no one chose which ones to visit."],
  ["question", "The question"],
  ["found", "What members found"],
  ["counts", "{judged} of {n} judged: {list}"],
  ["counts.yes", "{n} yes"],
  ["counts.no", "{n} no"],
  ["counts.unsure", "{n} could not tell"],
  ["counts.disagree", "{n} in tension"],
  ["counts.notvisited", "{n} not visited"],
  ["estimate", "What it estimates"],
  ["range", "{share}% of those judged · exact {confidence}% range {low}% to {high}% · between {lowc} and {highc} of all {size}"],
  ["noestimate", "no estimate is worked out over this draw yet"],
  ["standing.yes", "Yes"],
  ["standing.no", "No"],
  ["standing.disagree", "In tension"],
  ["standing.could_not_tell", "Could not tell"],
  ["standing.not_visited", "Not visited"],
  ["item", "Item {item}"],
  ["tension", "the visits disagree; both are shown, never one picked"],
  ["visit", "{finding}, seen by {by} on {date}"],
  ["account", "their account"],
  ["finding", "What you found"],
  ["finding.yes", "Yes"],
  ["finding.no", "No"],
  ["finding.could_not_tell", "Could not tell"],
  ["spot", "Spot-check"],
  ["spot.help", "A spot-check tests the city's count against the street: members visit a random sample of the counted items and record what they find, and it estimates, with a range, how many of all of them really were so."],
  ["notsays", "It says nothing certain about any one item no one visited, and nothing about items outside the set drawn from."],
  ["help", "How spot-checks work"],
  ["set", "The set to draw from"],
  ["set.help", "The table's or set's fingerprint."],
  ["n", "How many to draw"],
  ["seed", "Seed (optional)"],
  ["seed.help", "Recorded with the draw, so anyone can repeat it; left empty, a random one is chosen and recorded."],
  ["dq", "What members check at each drawn item"],
  ["words", "What you saw at the report, in your own words"],
  ["words.help", "Recorded as your testimony, under your name, and never changed afterwards."],
  ["observed", "The day you saw it"],
  ["testified", "Your account is recorded. Now count it for the drawn report it was about."],
  ["itempick", "The drawn report"],
  ["photo", "A photo you captured (optional)"],
  ["photo.help", "Its fingerprint. Your account counts with or without one."],
  ["work", "Work it out"],
  ["q", "The question the figure answers"],
  ["from", "Period from"],
  ["to", "Period to"],
  ["kind", "What to work out"],
  ["kind.count", "A count"],
  ["kind.total", "A total"],
  ["kind.share", "A share"],
  ["kind.ratio", "A ratio"],
  ["kind.difference", "A difference"],
  ["kind.estimate", "An estimate over a draw"],
  ["input", "Its input"],
  ["input.help", "A money fact, a calculation, a table's or a draw's fingerprint, or a figure, by its id."],
  ["content", "The table's source"],
  ["content.help", "The passage's content id."],
  ["header", "Its columns, separated by commas"],
  ["header.help", "Each column's name, in order, as the table heads it."],
  ["workbook", "Your own spreadsheet"],
  ["wb", "The spreadsheet"],
  ["wb.help", "The captured workbook's fingerprint."],
  ["period", "Its period"],
  ["range.field", "The cells to tie"],
  ["range.help", "One block on one sheet, for example Budget!B2:B5."],
  ["table", "Tied to (a table's fingerprint, or a passage's content id)"],
  ["trange", "The table's cells (for a table)"],
  ["outcome", "The second member's check"],
  ["outcome.agrees", "It agrees"],
  ["outcome.disagrees", "It disagrees"],
  ["outcome.could_not_check", "Could not check"],
  ["note", "What they found, in their words"],
  ["work.empty", "Give the question, its period and its input."],
  ["table.empty", "Give the table's source and its columns."],
  ["draw.empty", "Give the set's fingerprint and how many to draw."],
  ["wb.empty", "Give the spreadsheet's fingerprint and its period."],
  ["bind.empty", "Give the spreadsheet, its cells and what they are tied to."],
  ["words.empty", "Say what you saw, and the day you saw it."],
  ["visit.empty", "Record your account first, then choose the drawn report and what you found."],
].map(([k, en]) => row("screen.calculation." + k, en));

/** R11: the help page's sentences, plain words for any calculation a group tests against what members see. */
export const HELP_WORDS = [
  ["sub", "Help · for any calculation your group can test against what members see"],
  ["does", "What a spot-check does"],
  ["does.p", "A calculation counts what a source records, such as the reports the city marked closed. A spot-check tests whether the record matches what is really there: members visit a random sample of the counted items and record what they find."],
  ["random", "Why the sample is random, and recorded"],
  ["random.p", "The sample is drawn from a recorded seed. Anyone, including the city or a reporter, can repeat the draw and get exactly the same items, so no one could have picked the easy or the damning ones."],
  ["says", "What the result says"],
  ["says.p", "The share of visited items that matched, and an exact range for the whole set. The range is what the sample can honestly support: the true share for all items is very likely inside it. A larger sample gives a narrower range: about 13 points either way for 40 items, about 9 for 100."],
  ["notsays", "What it does not say"],
  ["notsays.p", "Nothing certain about any one item no one visited. Nothing about items outside the set that was drawn from. Items members could not judge are counted apart and named, never guessed; the estimate assumes they are like the rest, and says so."],
  ["evidence", "Each visit is evidence"],
  ["evidence.p", "Each visit is recorded as the testimony of the member who made it. A photo, where the member took one, lets others see what was there; the member's account counts with or without one. A finding resting on a spot-check shows the draw, every visit, and the range."],
  ["back", "Back to the calculation"],
  ["purpose", "A help page: one of your group's Civicsmith's methods explained in plain words, opened from the screens where it is used."],
].map(([k, en]) => row("screen.help." + k, en));

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
  "state.empty", "state.loading", "state.failed", ...CALCULATION_WORDS];

export const CALCULATION_SCREEN = Object.freeze({ id: "calculation", ABSENT_CODES: Object.freeze(["NO_ENTITY", "NO_CALC"]), reads, place, render, acts, words, parts: PARTS });
export const HELP_SCREEN = Object.freeze({ id: "help", reads: () => ({}), render: renderHelp, acts: [], words: ["screen.help.name", ...HELP_WORDS] });
