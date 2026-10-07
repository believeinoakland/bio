/* calculations' patterns of application (requirements: `build/requirements/calculations.md`, R32–R37; T35-38, N645;
 * Capability Ladders §6B.5, §6C.5; K1713 (2), K1723, K1471, K1483). The held uses of powers frozen as a table (R32)
 * and the recipes of application over it (R33–R36), each a template a member instantiates through `create`: given the
 * template's name as the calculation's `kind`, its parameters as `terms` and the table's rows, a composer answers the
 * calc-grammar recipe (`bio-calc/1`) the evaluator runs and a plan naming the steps each answer is read from. Pure:
 * nothing here reads the record, a clock or the network, and nothing here computes a number; every number is
 * calc-grammar's (R25). Choosing which steps to compose (the groups the rows hold, a group's most frequent outcome
 * from calc-grammar's own counts) is planning, never arithmetic. No sentence here says why a pattern exists (K1713),
 * and none says "nonconforming", "violated", "breach" or "not met" against a standard that does not bind (R37). */

import { evaluate, METHOD } from "../calc-grammar/index.mjs";
import { normAlias } from "../extraction/index.mjs";

/** R32: the columns of a frozen uses table, in order, with their Table Schema types. */
export const USES_FIELDS = Object.freeze([
  { name: "event_id", type: "string" }, { name: "kind", type: "string" },
  { name: "provision_standard", type: "string" }, { name: "provision_portion", type: "string" },
  { name: "decider", type: "string" }, { name: "decider_kind", type: "string" },
  { name: "subject", type: "string" }, { name: "subject_kind", type: "string" }, { name: "subject_sector", type: "string" },
  { name: "when_start", type: "date" }, { name: "when_end", type: "date" }, { name: "when_precision", type: "string" },
  { name: "reason_stated", type: "integer" }, { name: "reason_fold", type: "string" },
  { name: "outcome", type: "string" }, { name: "relationships", type: "string" },
].map((f) => Object.freeze(f)));
export const USES_HEADER = Object.freeze(USES_FIELDS.map((f) => f.name));

/** R32: the kinds of direct tie the `relationships` column names. */
export const TIES = Object.freeze(["post", "employment", "former_employment", "contract", "donation", "declared"]);
/** R32: money kinds read as a donation. */
const DONATION_KINDS = Object.freeze(["contribution", "gift", "behested"]);
/** R32: how an empty `relationships` cell is read: no tie of these kinds is held, never "none exists". */
export const NONE_HELD = "none held";

/** R32: the tie a connection of `kind` (of `cls`, its registered class) names, or null. `item` the connection. */
export function tieOf(kind, cls, item) {
  if (cls === "declared") return "declared";
  if (kind === "line:holds:employee") return "employment";
  if (kind === "line:holds:contractor" || kind === "line:contracts_with") return "contract";
  if (kind === "line:seat_on" || kind === "line:post_in" || (typeof kind === "string" && kind.startsWith("line:holds:"))) return "post";
  if (kind === "money_flow") return item && item.money && DONATION_KINDS.includes(item.money.kind) ? "donation" : null;
  return null;
}

/** R32 (extraction's fold, R59 there): the reason's words with `normAlias`'s case and spacing, split on every run of
 *  characters that are neither a letter nor a digit, every term kept in order (two different reasons never fold
 *  equal by dropping a repeated or a 25th term). Empty when there are no words. */
export function foldReason(text) {
  return normAlias(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean).join(" ");
}

/** R33–R36: the recipes of application, as data. */
export const APPLICATION_RECIPES = Object.freeze([
  { recipe: "outcome_rate_by", inputs: { uses: "a frozen uses table (R32)" },
    terms: { by: "the column to group by: decider, subject, subject_kind, subject_sector, reason_stated, relationships, kind, provision_standard, or when (with period)",
      period: "for by: when, year or month", outcomes: "optional: the outcomes named; any other is counted apart" },
    says: "the share of each outcome in each group, with the group's size" },
  { recipe: "reasons_missing", inputs: { uses: "a frozen uses table (R32)" }, terms: { by: "optional: a column to group by" },
    says: "the share of acts with no reason stated" },
  { recipe: "reasons_repeated", inputs: { uses: "a frozen uses table (R32)" }, terms: {},
    says: "the number of distinct stated reasons and the share of acts whose folded reason is given word for word in another act, each reason listed with its count" },
  { recipe: "waiver_share", inputs: { uses: "a frozen uses table (R32)" }, terms: { by: "optional: a column to group by, such as provision_standard" },
    says: "waivers as a share of all uses" },
  { recipe: "consistency", inputs: { uses: "a frozen uses table (R32)" }, terms: { keys: "the like-case keys: one or more columns" },
    says: "for each group of two or more like cases, the share whose outcome is the group's most frequent; groups of one counted apart" },
  { recipe: "before_after", inputs: { uses: "a frozen uses table (R32)" },
    terms: { change: "{standard}: a held standard's version, its period's from; or {date}", outcomes: "optional: the outcomes named" },
    says: "the outcome shares before and after the change; an act whose when falls across it counted apart" },
  { recipe: "target_met", inputs: { measure: "a calculation or cited figure (one period, the calculation's), or a table with from, to and value columns (one row per period)" },
    terms: { target: "the held standard carrying the target (standards R42)", body: "the body measured (an entity id)", definition_differs: "optional: the member's words when the measure's definition differs from the target's" },
    says: "per period, the measured value beside the threshold, with whether a target that binds the body was met; against a benchmark, the comparison alone, labelled" },
  { recipe: "policy_against_practice", inputs: { practice: "a table, or a calculation answering a table, of the acts measured" },
    terms: { provision: "{standard, portion?}", departure: "the conditions (calc-grammar's select) a departing act meets, as the member defines departure" },
    says: "the measured rate of departing acts with its denominator, beside the provision's words; the practice is never the rule" },
].map((r) => Object.freeze(r)));
export const APPLICATION_KINDS = Object.freeze(APPLICATION_RECIPES.map((r) => r.recipe));

/** The columns a uses recipe may group by. */
const GROUP_COLUMNS = Object.freeze(["decider", "decider_kind", "subject", "subject_kind", "subject_sector", "reason_stated",
  "relationships", "kind", "provision_standard", "provision_portion", "outcome", "when"]);
const TIME_UNITS = /^(seconds?|minutes?|hours?|days?|weeks?|months?|years?)$/i;
const PEOPLE = "people in a group are named by their entity ids in the record, as K1483 allows; nothing here says why a pattern exists (K1713)";

const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const no = (reason, detail, extra = {}) => ({ ok: false, reason, detail, ...extra });
const recipeOf = (inputs, steps, output) => ({ method: METHOD, inputs, steps, output });
const isDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const lit = (v) => (typeof v === "string" || typeof v === "boolean" || Number.isSafeInteger(v));

/** A bound table's rows as objects (a streamed table, calc-grammar's R22, or row objects). */
export function rowsOf(t) {
  if (!plain(t) || !Array.isArray(t.fields)) return null;
  if (Array.isArray(t.rows)) return t.rows;
  if (typeof t.rows !== "function") return null;
  const names = t.fields.map((f) => f.name);
  const out = [];
  for (const r of t.rows()) { const o = {}; names.forEach((n, k) => { o[n] = r[k] ?? ""; }); out.push(o); }
  return out;
}

/* Distinct non-empty values of a column, in first-seen order. */
function distinct(rows, col) {
  const seen = new Set();
  for (const r of rows) { const v = String(r[col] ?? ""); if (v.trim() !== "") seen.add(v); }
  return [...seen];
}

/* The years or months the rows' `when` covers, each {label, from, to}. */
function periodsOf(rows, unit) {
  const days = rows.flatMap((r) => [r.when_start, r.when_end]).filter(isDate).sort();
  if (!days.length) return [];
  const out = [];
  if (unit === "year") {
    for (let y = Number(days[0].slice(0, 4)); y <= Number(days.at(-1).slice(0, 4)); y++)
      out.push({ label: String(y), from: `${y}-01-01`, to: `${y}-12-31` });
  } else {
    let y = Number(days[0].slice(0, 4)), m = Number(days[0].slice(5, 7));
    const ey = Number(days.at(-1).slice(0, 4)), em = Number(days.at(-1).slice(5, 7));
    while (y < ey || (y === ey && m <= em)) {
      const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const mm = String(m).padStart(2, "0");
      out.push({ label: `${y}-${mm}`, from: `${y}-${mm}-01`, to: `${y}-${mm}-${String(last).padStart(2, "0")}` });
      m += 1; if (m > 12) { m = 1; y += 1; }
    }
  }
  return out;
}

/* The uses table's columns are R32's: a recipe of application over another table is refused by name. */
function usesFault(t, need = USES_HEADER) {
  const names = plain(t) && Array.isArray(t.fields) ? t.fields.map((f) => f.name) : [];
  const missing = need.filter((n) => !names.includes(n));
  return missing.length ? no("NOT_A_USES_TABLE", `a recipe of application runs over a frozen uses table (R32), its columns ${USES_HEADER.join(", ")}; this input lacks ${missing.join(", ")}. Nothing was written.`, { missing }) : null;
}

/* Per group (or once, over the whole), the share of rows meeting each of `measures` ({key, where}) among the group's
   rows. Answers the steps and the plan. `base` names the table the groups are selected from. */
function groupedShares(base, groups, measures, steps) {
  const plan = [];
  const each = groups.length ? groups : [{ label: null, where: null }];
  each.forEach((g, i) => {
    let whole = base;
    if (g.where) { whole = `g${i}`; steps.push({ op: "select", from: base, where: g.where, as: whole }); }
    const count = `n${i}`;
    steps.push({ op: "count", from: whole, as: count });
    const shares = {};
    measures.forEach((m, j) => {
      steps.push({ op: "select", from: whole, where: m.where, as: `p${i}_${j}` }, { op: "share", part: `p${i}_${j}`, whole, as: `s${i}_${j}` });
      shares[m.key] = `s${i}_${j}`;
    });
    plan.push({ group: g.label, rows: count, shares });
  });
  return plan;
}

/* The groups of `by`: each value of the column, or each period of `when`. */
function groupsOf(rows, terms) {
  const by = terms && terms.by;
  if (by === undefined || by === null) return { groups: [] };
  if (!GROUP_COLUMNS.includes(by)) return no("BAD_TERMS", `a recipe of application groups by one of ${GROUP_COLUMNS.join(", ")}. Nothing was written.`, { field: "by" });
  if (by === "when") {
    const unit = terms.period;
    if (unit !== "year" && unit !== "month") return no("BAD_TERMS", "grouping by when names its period: year or month. Nothing was written.", { field: "period" });
    return { by, groups: periodsOf(rows, unit).map((p) => ({ label: p.label,
      where: [{ field: "when_start", test: "between", value: [p.from, p.to] }, { field: "when_end", test: "between", value: [p.from, p.to] }] })) };
  }
  const values = distinct(rows, by);
  return { by, groups: values.map((v) => ({ label: v, where: [{ field: by, test: "eq", value: by === "reason_stated" ? Number(v) : v }] })) };
}

/* The outcomes measured, and the select keeping them, when the member names them. */
function outcomesOf(rows, terms) {
  const named = terms && terms.outcomes;
  if (named === undefined || named === null) return { outcomes: distinct(rows, "outcome"), named: null };
  if (!Array.isArray(named) || !named.length || !named.every((x) => typeof x === "string" && x.trim()))
    return no("BAD_TERMS", "outcomes, when named, is a list of outcome values. Nothing was written.", { field: "outcomes" });
  return { outcomes: [...new Set(named)], named: [...new Set(named)] };
}

/* Applies `named` outcomes: rows of another outcome are counted apart. Answers the base table's name. */
function namedBase(named, steps, apart) {
  if (!named) return "uses";
  steps.push({ op: "select", from: "uses", where: [{ field: "outcome", test: "in", value: named }], as: "named" },
    { op: "count", from: "uses", as: "all_rows" }, { op: "count", from: "named", as: "named_rows" },
    { op: "difference", a: "all_rows", b: "named_rows", as: "other_outcome" });
  apart.push({ step: "other_outcome", why: `acts whose outcome is not one named (${named.join(", ")}), counted apart` });
  return "named";
}

/** R33–R36: compose the recipe of application `kind` over `bound` (the bound inputs) with `terms`. `ctx` carries what
 *  the module read for it (a change's date, a target, a provision's state): `{change, target, provision}`. Answers
 *  `{ok: true, recipe, plan, extra?}` (`extra` inputs to bind beside the member's: name → figure) or a refusal. */
export function composeApplication(kind, terms, bound, ctx = {}) {
  const t = terms && plain(terms) ? terms : {};
  const steps = [], apart = [];
  if (["outcome_rate_by", "reasons_missing", "reasons_repeated", "waiver_share", "consistency", "before_after"].includes(kind)) {
    const fault = !bound.uses ? no("NO_USES_INPUT", "a recipe of application names its frozen uses table as the input uses. Nothing was written.") : usesFault(bound.uses);
    if (fault) return fault;
  }
  const rows = bound.uses ? rowsOf(bound.uses) : null;
  const inputs = [{ name: "uses", kind: "table" }];
  if (kind === "outcome_rate_by") {
    if (t.by === undefined) return no("BAD_TERMS", "outcome_rate_by names the column it groups by. Nothing was written.", { field: "by" });
    const g = groupsOf(rows, t); if (g.ok === false) return g;
    const o = outcomesOf(rows, t); if (o.ok === false) return o;
    const base = namedBase(o.named, steps, apart);
    const plan = groupedShares(base, g.groups, o.outcomes.map((x) => ({ key: x, where: [{ field: "outcome", test: "eq", value: x }] })), steps);
    steps.push({ op: "count", from: base, as: "rows_counted" });
    if (g.by === "when") apart.push({ why: "an act whose when is undetermined, or falls across a period's bounds, is in no period's group: counted apart by the select steps" });
    return { ok: true, recipe: recipeOf(inputs, steps, "rows_counted"), plan: { groups: plan, by: g.by, apart, denominator: "rows_counted" } };
  }
  if (kind === "reasons_missing" || kind === "waiver_share") {
    const g = groupsOf(rows, t); if (g.ok === false) return g;
    const m = kind === "reasons_missing" ? { key: "no_reason_stated", where: [{ field: "reason_stated", test: "eq", value: 0 }] }
      : { key: "waiver", where: [{ field: "kind", test: "eq", value: "waiver" }] };
    const plan = groupedShares("uses", g.groups, [m], steps);
    steps.push({ op: "count", from: "uses", as: "rows_counted" });
    return { ok: true, recipe: recipeOf(inputs, steps, "rows_counted"), plan: { groups: plan, by: g.by ?? null, apart, denominator: "rows_counted" } };
  }
  if (kind === "reasons_repeated") {
    steps.push({ op: "select", from: "uses", where: [{ field: "reason_stated", test: "eq", value: 1 }], as: "stated" },
      { op: "group", from: "stated", by: ["reason_fold"], measure: { op: "count" }, as: "reasons" },
      { op: "count", from: "reasons", as: "distinct_reasons" },
      { op: "select", from: "reasons", where: [{ field: "count", test: "ge", value: 2 }], as: "repeated" },
      { op: "share", part: "repeated", whole: "reasons", field: "count", as: "share_repeated" },
      { op: "count", from: "stated", as: "acts_with_reason" },
      { op: "sort", from: "reasons", by: "count", order: "desc", as: "listed" });
    return { ok: true, recipe: recipeOf(inputs, steps, "listed"), plan: { repeated: true, apart, denominator: "acts_with_reason" } };
  }
  if (kind === "consistency") {
    const keys = t.keys;
    if (!Array.isArray(keys) || !keys.length) return no("NO_LIKE_CASE_KEYS", "consistency names the like-case keys: one or more columns of the uses table. Nothing was written.");
    const bad = keys.find((k) => typeof k !== "string" || !USES_HEADER.includes(k) || k === "outcome" || k === "event_id");
    if (bad !== undefined) return no("NO_LIKE_CASE_KEYS", `"${String(bad).slice(0, 64)}" is not a like-case key: a key is a column of the uses table other than outcome and event_id. Nothing was written.`, { key: bad });
    /* the groups the rows hold, and each group's counts by outcome, from calc-grammar */
    const counted = evaluate(recipeOf(inputs, [{ op: "group", from: "uses", by: [...keys, "outcome"], measure: { op: "count" }, as: "c" }], "c"), { uses: bound.uses });
    if (counted.refused) return no(counted.refused, `calc-grammar refused the like-case grouping: ${counted.why}. Nothing was written.`);
    const tally = new Map();
    for (const r of rowsOf(counted.result)) {
      const key = JSON.stringify(keys.map((k) => r[k]));
      if (!tally.has(key)) tally.set(key, { values: keys.map((k) => r[k]), outcomes: [] });
      tally.get(key).outcomes.push({ outcome: r.outcome, n: Number(r.count) });
    }
    const plan = [];
    let i = 0;
    for (const g of tally.values()) {
      const size = g.outcomes.reduce((a, b) => a + b.n, 0);   /* planning only: which groups hold two or more acts */
      if (size < 2) continue;
      const top = Math.max(...g.outcomes.map((x) => x.n));
      const modal = g.outcomes.filter((x) => x.n === top).map((x) => x.outcome);
      const where = keys.map((k, j) => ({ field: k, test: "eq", value: k === "reason_stated" ? Number(g.values[j]) : g.values[j] }));
      steps.push({ op: "select", from: "uses", where, as: `g${i}` }, { op: "count", from: `g${i}`, as: `n${i}` },
        { op: "select", from: `g${i}`, where: [{ field: "outcome", test: "eq", value: modal[0] }], as: `m${i}` },
        { op: "share", part: `m${i}`, whole: `g${i}`, as: `s${i}` });
      plan.push({ group: Object.fromEntries(keys.map((k, j) => [k, g.values[j]])), rows: `n${i}`, most_frequent: modal[0],
        ...(modal.length > 1 ? { tied: modal } : {}), share: `s${i}` });
      i++;
    }
    steps.push({ op: "group", from: "uses", by: keys, measure: { op: "count" }, as: "cases" },
      { op: "select", from: "cases", where: [{ field: "count", test: "eq", value: 1 }], as: "singles" },
      { op: "count", from: "singles", as: "groups_of_one" }, { op: "count", from: "uses", as: "rows_counted" });
    apart.push({ step: "groups_of_one", why: "groups of one act have no like case: counted apart" });
    return { ok: true, recipe: recipeOf(inputs, steps, "rows_counted"), plan: { consistency: plan, keys, apart, denominator: "rows_counted" } };
  }
  if (kind === "before_after") {
    const ch = ctx.change;
    if (!ch || ch.ok === false) return ch || no("NO_CHANGE", "before_after names its change: {standard} or {date}. Nothing was written.");
    const o = outcomesOf(rows, t); if (o.ok === false) return o;
    const base = namedBase(o.named, steps, apart);
    steps.push({ op: "select", from: base, where: [{ field: "when_end", test: "lt", value: ch.date }], as: "before" },
      { op: "select", from: base, where: [{ field: "when_start", test: "ge", value: ch.date }], as: "after" },
      { op: "count", from: base, as: "rows_counted" }, { op: "count", from: "before", as: "n_before" }, { op: "count", from: "after", as: "n_after" },
      { op: "difference", a: "rows_counted", b: "n_before", as: "not_before" }, { op: "difference", a: "not_before", b: "n_after", as: "across_change" });
    const shares = { before: {}, after: {} };
    o.outcomes.forEach((x, j) => {
      for (const side of ["before", "after"]) {
        steps.push({ op: "select", from: side, where: [{ field: "outcome", test: "eq", value: x }], as: `${side}_${j}` },
          { op: "share", part: `${side}_${j}`, whole: side, as: `${side}_share_${j}` });
        shares[side][x] = `${side}_share_${j}`;
      }
    });
    apart.push({ step: "across_change", why: "acts whose when falls in a band across the change, or is undetermined, counted apart" });
    return { ok: true, recipe: recipeOf(inputs, steps, "rows_counted"),
      plan: { before_after: { shares, before: "n_before", after: "n_after" }, change: ch, apart, denominator: "rows_counted" } };
  }
  if (kind === "target_met") {
    const tg = ctx.target;
    if (!tg || tg.ok === false) return tg || no("NO_TARGET", "target_met names the held standard carrying the target. Nothing was written.");
    const m = bound.measure;
    if (m === undefined) return no("NO_MEASURE_INPUT", "target_met names its measure as the input measure. Nothing was written.");
    const periods = [];
    const tin = [{ name: "target_value", kind: "figure" }];
    if (plain(m) && Array.isArray(m.fields)) {
      const fault = ["from", "to", "value"].filter((n) => !m.fields.some((f) => f.name === n));
      if (fault.length) return no("BAD_MEASURE", `a measure table has from, to and value columns, one row per period; it lacks ${fault.join(", ")}. Nothing was written.`);
      const seen = new Set();
      for (const r of rowsOf(m)) {
        const k = `${r.from}/${r.to}`;
        if (seen.has(k)) continue;
        seen.add(k);
        const i = periods.length;
        steps.push({ op: "select", from: "measure", where: [{ field: "from", test: "eq", value: String(r.from) }, { field: "to", test: "eq", value: String(r.to) }], as: `p${i}` },
          { op: "sum", from: `p${i}`, field: "value", as: `v${i}` }, { op: "compare", a: `v${i}`, b: "target_value", as: `c${i}` });
        periods.push({ from: String(r.from), to: String(r.to), value: `v${i}`, comparison: `c${i}` });
      }
      inputs.splice(0, 1, { name: "measure", kind: "table" });
    } else {
      steps.push({ op: "compare", a: "measure", b: "target_value", as: "c0" });
      periods.push({ from: ctx.period && ctx.period.from || null, to: ctx.period && ctx.period.to || null, value: "measure", comparison: "c0" });
      inputs.splice(0, 1, { name: "measure", kind: "figure" });
    }
    if (!periods.length) return no("BAD_MEASURE", "the measure states no period. Nothing was written.");
    return { ok: true, recipe: recipeOf([...inputs, ...tin], steps, periods.at(-1).comparison),
      plan: { target: tg, periods, apart }, extra: { target_value: tg.figure } };
  }
  if (kind === "policy_against_practice") {
    const pv = ctx.provision;
    if (!pv || pv.ok === false) return pv || no("NO_PROVISION", "policy_against_practice names its provision, {standard, portion?}. Nothing was written.");
    const p = bound.practice;
    if (!plain(p) || !Array.isArray(p.fields)) return no("NO_PRACTICE_INPUT", "policy_against_practice names the acts measured as the input practice: a table, or a calculation answering a table. Nothing was written.");
    const dep = t.departure;
    if (!Array.isArray(dep) || !dep.length || !dep.every((c) => plain(c) && typeof c.field === "string" && typeof c.test === "string" && (lit(c.value) || Array.isArray(c.value))))
      return no("BAD_TERMS", "departure is the member's definition of a departing act: one or more conditions {field, test, value} over the practice's columns. Nothing was written.", { field: "departure" });
    steps.push({ op: "select", from: "practice", where: dep, as: "departing" }, { op: "share", part: "departing", whole: "practice", as: "divergence" },
      { op: "count", from: "practice", as: "rows_counted" });
    return { ok: true, recipe: recipeOf([{ name: "practice", kind: "table" }], steps, "divergence"), plan: { provision: pv, apart, denominator: "rows_counted" } };
  }
  return no("UNKNOWN_KIND", `"${String(kind).slice(0, 64)}" is not a recipe of application. Nothing was written.`);
}

/* The words a comparison of the measured value with a benchmark's threshold reads as (R35, R37; K1723). */
function benchmarkWords(relation, unit) {
  if (relation !== "lower" && relation !== "equal" && relation !== "higher") return null;
  if (TIME_UNITS.test(String(unit || "").trim())) return relation === "lower" ? "faster than" : relation === "higher" ? "slower than" : "equal to";
  return relation === "lower" ? "below" : "at or above";
}

/* Whether a binding target was met, from calc-grammar's relation and the target's comparator. */
function metOf(relation, comparator) {
  if (relation !== "lower" && relation !== "equal" && relation !== "higher") return "undetermined";
  if (comparator === "at_least") return relation === "lower" ? "not met" : "met";
  return relation === "higher" ? "not met" : "met";   /* at_most, within: at or under the threshold */
}

/** R33–R36: the answer of a recipe of application, read from the evaluator's trace by the plan. `at(step)` answers a
 *  step's output; `ctx` as `composeApplication`'s, with `binds(to)` answering `standards.bindsAt` for a period's end
 *  and `inForce(to)` the target's standing. Every number is a step's output. */
export function answerApplication(kind, plan, at, ctx = {}) {
  const population = ctx.population || null;
  const out = { recipe: kind, population, derivation: "the recipe stored with this calculation, evaluated by calc-grammar (bio-calc/1)",
    counted_apart: plan.apart.map((a) => ({ ...a, ...(a.step ? { rows: at(a.step) } : {}) })) };
  if (plan.denominator) out.denominator = { rows: at(plan.denominator), says: "the rows counted" };
  if (plan.groups) {
    out.by = plan.by ?? null;
    out.groups = plan.groups.map((g) => ({ group: g.group, rows: at(g.rows),
      shares: Object.fromEntries(Object.entries(g.shares).map(([k, s]) => [k, at(s)])) }));
    if (["decider", "subject"].includes(plan.by)) out.people = PEOPLE;
  }
  if (plan.repeated) {
    out.distinct_reasons = at("distinct_reasons");
    out.share_repeated = at("share_repeated");
    out.reasons = at("listed");
    out.says = "reasons given word for word in more than one act, shown as a measured quantity with each reason's count";
  }
  if (plan.consistency) {
    out.keys = plan.keys;
    out.groups = plan.consistency.map((g) => ({ group: g.group, rows: at(g.rows), most_frequent: g.most_frequent,
      ...(g.tied ? { tied: g.tied, says: "two or more outcomes are each the most frequent; the share is the same for each" } : {}), share: at(g.share) }));
    out.groups_of_one = at("groups_of_one");
  }
  if (plan.before_after) {
    const b = plan.before_after;
    out.change = plan.change;
    out.before = { rows: at(b.before), shares: Object.fromEntries(Object.entries(b.shares.before).map(([k, s]) => [k, at(s)])) };
    out.after = { rows: at(b.after), shares: Object.fromEntries(Object.entries(b.shares.after).map(([k, s]) => [k, at(s)])) };
  }
  if (plan.periods) {
    const tg = plan.target;
    out.target = { standard: tg.standard, metric: tg.metric ?? null, threshold: tg.threshold, period: tg.period ?? null,
      definition: tg.definition ?? null };
    if (ctx.definitionDiffers) out.definition_differs = { says: ctx.definitionDiffers, by: "the member: the module never judges two definitions equal" };
    out.periods = plan.periods.map((p) => {
      const cmp = at(p.comparison);
      const relation = plain(cmp) ? cmp.relation : null;
      const b = typeof ctx.binds === "function" ? ctx.binds(p.to) : { state: "undetermined", why: "the standards module is not reachable here" };
      const row = { from: p.from, to: p.to, measured: at(p.value), threshold: tg.threshold, comparison: cmp, bindingness: b,
        ...(p.standing ? { target_standing: p.standing } : {}) };
      if (b.state === "binds") row.met = metOf(relation, tg.threshold.comparator);
      else {
        row.compared = benchmarkWords(relation, tg.threshold.unit) ?? "undetermined";
        if (b.state === "benchmark") row.label = `Benchmark · not binding on ${ctx.bodyLabel || b.body || "the body measured"}`;
        else row.why = b.why || "whether the target binds the body is undetermined";
      }
      return row;
    });
  }
  if (plan.provision) {
    out.provision = plan.provision;
    out.practice = { divergence: at("divergence"), rows: at("rows_counted"),
      says: "the measured practice beside the provision: the practice is never the rule and is never stored as a standard" };
  }
  return out;
}
