/* calculations' machine patterns (requirements: `build/requirements/calculations.md`, R22, R23; K1471, K1473, K1491;
 * plan Rules 7, Choices 17). Each pattern is data: its name, version, words, denominator and method, and one evaluator
 * that gathers its units through the upstream modules' public reads and computes every number through calc-grammar's
 * recipes (R25), never by its own arithmetic. A result is a measured quantity with its denominator and its cited
 * derivation (every row it rests on); it is written to the patterns' own result table, never onto a person or entity,
 * and it is shown only once the pattern's gate is recorded at a measured false-alarm rate of at most 20% (K1504,
 * M-C8). No pattern judges: lateness is days or hours, an order is "out of the declared flow's order", never a
 * failing, and no score is composed. */

import { evaluate, METHOD } from "../calc-grammar/index.mjs";

/** R23 (K1504, M-C8): the highest false-alarm rate at which a pattern's results are shown. */
export const GATE_MAX_RATE = 0.2;
/** How many units one pattern gathers in one run, at most (the rest wait for the next run's cursor). */
export const UNITS_MAX = 2000;

/** R22: the shipped patterns, data-defined, each with its denominator and method. */
export const PATTERNS = Object.freeze([
  Object.freeze({ pattern: "flow_out_of_order", version: 1, label: "events out of their declared flow's order",
    denominator: "the threaded flow instances read", method: "progressions' out-of-order findings (its R38, ordered by events' three-valued sequence); share of instances holding one, by calc-grammar" }),
  Object.freeze({ pattern: "duty_lateness", version: 1, label: "days late, per duty occurrence met after its due date",
    denominator: "the duty occurrences recorded met or met late", method: "duties' recorded transitions and occurrences (its R9, R13); days from the due date to the meeting event, by calc-grammar's span over civil-time" }),
  Object.freeze({ pattern: "posting_lateness", version: 1, label: "hours from a meeting's posting to the meeting, and days from the meeting to a posting after it",
    denominator: "the meetings with a posting held within them", method: "events' meetings and the publication events within them (its R24, R27); calc-grammar's span in hours and in days" }),
  Object.freeze({ pattern: "office_lateness", version: 1, label: "share of an office's decided duty occurrences met late",
    denominator: "the office's duty occurrences recorded met or met late", method: "duties' recorded transitions, grouped by the duty's obligor; calc-grammar's share" }),
  Object.freeze({ pattern: "proceeding_lateness", version: 1, label: "share of decided duty occurrences met late, per proceeding they arose in, across proceedings",
    denominator: "the duty occurrences arising in each proceeding recorded met or met late", method: "duties' recorded transitions, grouped by the duty's arising_in proceeding; calc-grammar's share" }),
]);

const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const list = (v, ...keys) => (Array.isArray(v) ? v : plain(v) ? (keys.map((k) => v[k]).find(Array.isArray) || []) : []);
const found = (r) => !!r && r.ok !== false && r.found !== false;
const dayOf = (v) => {
  const s = typeof v === "string" ? v : plain(v) ? (typeof v.value === "string" ? v.value : plain(v.due) ? v.due.value : typeof v.start === "string" ? v.start : null) : null;
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}/.test(s) ? s : null;
};
const recipe = (steps, output) => ({ method: METHOD, inputs: [{ name: "t", kind: "table" }], steps, output });

/* A share through calc-grammar: rows of `t` where `field` is `value` (or all), and of those, where `late` is true. */
function shareOf(t, field, value) {
  const steps = [];
  let whole = "t";
  if (field) { steps.push({ op: "select", from: "t", where: [{ field, test: "eq", value }], as: "whole" }); whole = "whole"; }
  steps.push({ op: "select", from: whole, where: [{ field: "late", test: "eq", value: true }], as: "late_rows" },
    { op: "share", part: "late_rows", whole, as: "share" });
  const r = evaluate(recipe(steps, "share"), { t });
  return r.refused ? null : r.result;
}

/* The decided occurrences: the latest recorded transition of each (duty, occurrence), met or met late. */
async function decidedOccurrences(duties, viewer) {
  if (!duties || typeof duties.transitionsOf !== "function") return { units: null, why: "the duties module is not reachable here" };
  const got = await duties.transitionsOf({ viewer });
  const latest = new Map();
  for (const t of list(got, "transitions", "items")) {
    if (!plain(t)) continue;
    const duty = t.duty_id ?? t.dutyId ?? t.duty;
    const key = t.occurrence_key ?? t.occurrenceKey ?? t.occurrence;
    if (typeof duty !== "string" || typeof key !== "string") continue;
    const k = `${duty}\u0000${key}`;
    const prev = latest.get(k);
    if (!prev || String(t.at ?? "") >= String(prev.at ?? "")) latest.set(k, { ...t, duty, key });
  }
  const units = [...latest.values()].filter((t) => t.state === "met" || t.state === "met_late").slice(0, UNITS_MAX);
  const meta = new Map();
  for (const u of units) {
    if (meta.has(u.duty)) continue;
    let d = null;
    try { d = typeof duties.readDuty === "function" ? await duties.readDuty({ dutyId: u.duty, viewer }) : null; } catch { d = null; }
    const duty = found(d) ? (d.duty || d) : null;
    const ent = (x) => (typeof x === "string" ? x : plain(x) ? (x.entity_id ?? x.entity ?? x.id ?? null) : null);
    meta.set(u.duty, { office: duty ? ent(duty.obligor) : null, proceeding: duty ? ent(duty.arising_in) : null });
  }
  return { units: units.map((u) => ({ ...u, ...meta.get(u.duty) })) };
}

const EVALUATORS = {
  async flow_out_of_order(deps) {
    const p = deps.progressions;
    if (!p || typeof p.proposalsFeed !== "function") return { results: [], denominator: { n: null, why: "the progressions module is not reachable here" }, evaluated: 0 };
    const feed = await p.proposalsFeed(Date.parse(deps.now));
    const instances = list(feed, "instances").filter(plain).slice(0, UNITS_MAX);
    const rows = instances.map((x) => {
      const ooo = list(x.findings, "findings").filter((f) => plain(f) && f.kind === "out_of_order");
      return { x, ooo, row: { instance: `${x.progression_key ?? x.progressionKey}\u0000${x.entity_id ?? x.entityId}`, late: ooo.length ? "true" : "false" } };
    });
    const t = { fields: [{ name: "instance", type: "string" }, { name: "late", type: "boolean" }], rows: rows.map((r) => r.row) };
    const share = rows.length ? shareOf(t, null, null) : null;
    const denominator = { n: rows.length, of: "threaded flow instances with an open finding, as progressions' feed lists them", share_out_of_order: share };
    const results = rows.filter((r) => r.ooo.length).map((r) => ({
      subject: r.x.entity_id ?? r.x.entityId ?? null,
      value: { progression: r.x.progression_key ?? r.x.progressionKey, out_of_order: r.ooo.map((f) => ({ stage: f.stage_key ?? null, after: f.after_stage ?? null, placements: f.placements ?? null })) },
      derivation: { findings: r.ooo, definition_version: r.x.definition_version ?? null, method: "progressions R38" },
      rests_on: [r.x.entity_id ?? r.x.entityId, ...r.ooo.flatMap((f) => list(f.placements).map((pl) => pl && pl.bundle_id).filter(Boolean))].filter(Boolean),
    }));
    return { results, denominator, evaluated: rows.length };
  },

  async duty_lateness(deps) {
    const d = await decidedOccurrences(deps.duties, deps.viewer);
    if (!d.units) return { results: [], denominator: { n: null, why: d.why }, evaluated: 0 };
    const late = [];
    for (const u of d.units.filter((x) => x.state === "met_late")) {
      let occ = null;
      try {
        const got = await deps.duties.occurrencesOf({ dutyId: u.duty, from: "0001-01-01", to: deps.now.slice(0, 10), asOf: deps.now, viewer: deps.viewer });
        occ = list(got, "occurrences", "items").find((o) => plain(o) && (o.key ?? o.occurrence_key) === u.key) || null;
      } catch { occ = null; }
      const due = occ ? dayOf(occ.due) : null;
      const metBy = occ ? (list(occ.evidence, "events")[0] || occ.matched || null) : null;
      const met = metBy ? dayOf(metBy.when ?? metBy) : null;
      late.push({ u, due, met, event: metBy && (metBy.event_id ?? metBy.eventId ?? null) });
    }
    const t = { fields: [{ name: "due", type: "date" }, { name: "met", type: "date" }], rows: late.map((x) => ({ due: x.due ?? "", met: x.met ?? "" })) };
    const r = late.length ? evaluate(recipe([{ op: "span", from: "t", start: "due", end: "met", unit: "days", as: "days_late" }], "days_late"), { t }) : null;
    const results = late.map((x, i) => {
      const cell = r && !r.refused ? r.result.rows[i].days_late : null;
      return { subject: x.u.office ?? null,
        value: { duty: x.u.duty, occurrence: x.u.key, days_late: cell ?? { undetermined: true, why: "the due date or the meeting event's date is not settled" } },
        derivation: { due: x.due, met: x.met, transition: { state: x.u.state, as_of: x.u.as_of ?? null, at: x.u.at ?? null }, event: x.event },
        rests_on: [x.u.duty, ...(x.event ? [x.event] : [])] };
    });
    return { results, denominator: { n: d.units.length, of: "duty occurrences recorded met or met late", late: late.length }, evaluated: d.units.length };
  },

  async posting_lateness(deps) {
    const e = deps.events;
    const d = await decidedOccurrences(deps.duties, deps.viewer);
    if (!e || typeof e.eventsFor !== "function") return { results: [], denominator: { n: null, why: "the events module is not reachable here" }, evaluated: 0 };
    const bodies = [...new Set((d.units || []).map((u) => u.office).filter(Boolean))];
    const units = [];
    for (const body of bodies) {
      let got = null;
      try { got = await e.eventsFor({ entity: body, kinds: ["meeting"], limit: 500, viewer: deps.viewer }); } catch { got = null; }
      for (const m of list(got, "events", "items").filter(plain)) {
        const id = m.event_id ?? m.eventId;
        let full = null;
        try { full = await e.readEvent({ eventId: id, viewer: deps.viewer }); } catch { full = null; }
        if (!found(full)) continue;
        const start = dayOf((full.event || full).when);
        const rels = list((full.event || full).relations, "in", "relations").filter((r) => plain(r) && r.kind === "within");
        for (const rel of rels) {
          const pid = rel.from === id ? rel.to : rel.from;
          let pe = null;
          try { pe = await e.readEvent({ eventId: pid, viewer: deps.viewer }); } catch { pe = null; }
          const p = found(pe) ? (pe.event || pe) : null;
          if (!p || p.kind !== "publication") continue;
          units.push({ body, meeting: id, posting: pid, start, posted: dayOf(p.when), startDt: (full.event || full).when, postedDt: p.when });
          if (units.length >= UNITS_MAX) break;
        }
      }
    }
    /* events' when: the local value at its precision in its zone (events R9), never the UTC instant read as local */
    const dt = (v) => (plain(v) && typeof v.value === "string" ? { value: v.value, precision: v.precision || "day", zone: v.zone || "UTC" } : "");
    const t = { fields: [{ name: "start", type: "datetime" }, { name: "posted", type: "datetime" }],
      rows: units.map((u) => ({ start: dt(u.startDt), posted: dt(u.postedDt) })) };
    const hours = units.length ? evaluate(recipe([{ op: "span", from: "t", start: "posted", end: "start", unit: "hours", as: "hours_before" }], "hours_before"), { t }) : null;
    const days = units.length ? evaluate(recipe([{ op: "span", from: "t", start: "start", end: "posted", unit: "days", as: "days_after" }], "days_after"), { t }) : null;
    const results = units.map((u, i) => ({
      subject: u.body,
      value: { meeting: u.meeting, posting: u.posting, hours_before: hours && !hours.refused ? hours.result.rows[i].hours_before : null,
        days_after: days && !days.refused ? days.result.rows[i].days_after : null,
        says: "a posting's time is an upper bound (on or before the first instant the record observed it)" },
      derivation: { meeting_when: u.startDt ?? null, posting_when: u.postedDt ?? null, method: "events R24" },
      rests_on: [u.meeting, u.posting] }));
    return { results, denominator: { n: new Set(units.map((u) => u.meeting)).size, of: "meetings with a posting held within them" }, evaluated: units.length };
  },

  async office_lateness(deps) { return byGroup(deps, "office"); },
  async proceeding_lateness(deps) { return byGroup(deps, "proceeding"); },
};

/* R22: patterns about an office and across proceedings: per subject, the share of its decided occurrences met late. */
async function byGroup(deps, field) {
  const d = await decidedOccurrences(deps.duties, deps.viewer);
  if (!d.units) return { results: [], denominator: { n: null, why: d.why }, evaluated: 0 };
  const units = d.units.filter((u) => u[field]);
  const t = { fields: [{ name: field, type: "string" }, { name: "late", type: "boolean" }],
    rows: units.map((u) => ({ [field]: u[field], late: u.state === "met_late" ? "true" : "false" })) };
  const results = [];
  for (const subject of [...new Set(units.map((u) => u[field]))].sort()) {
    const mine = units.filter((u) => u[field] === subject);
    const share = shareOf(t, field, subject);
    results.push({ subject, value: { share_met_late: share },
      denominator: { n: mine.length, of: `duty occurrences of this ${field === "office" ? "office" : "proceeding"} recorded met or met late` },
      derivation: { occurrences: mine.map((u) => ({ duty: u.duty, occurrence: u.key, state: u.state })) },
      rests_on: [...new Set(mine.map((u) => u.duty))] });
  }
  return { results, denominator: { n: units.length, of: `duty occurrences with ${field === "office" ? "an obligor office" : "a proceeding they arose in"}, recorded met or met late`, subjects: results.length }, evaluated: units.length };
}

/** R22: one pattern's run: `{results, denominator, evaluated}`. */
export async function runPattern(p, deps) {
  const f = EVALUATORS[p.pattern];
  if (!f) return { results: [], denominator: { n: null, why: "no evaluator" }, evaluated: 0 };
  return f(deps);
}
