/* calculations' machine patterns (requirements: `build/requirements/calculations.md`, R22, R23; K1471, K1473, K1491;
 * plan Rules 7, Choices 17). Each pattern is data: its name, version, words, denominator and method, and one evaluator
 * that gathers its units through the upstream modules' public reads and computes every number through calc-grammar's
 * recipes (R25), never by its own arithmetic. A result is a measured quantity with its denominator and its cited
 * derivation (every row it rests on); it is written to the patterns' own result table, never onto a person or entity,
 * and it is shown only once the pattern's gate is recorded at a measured false-alarm rate of at most 20% (K1504,
 * M-C8). No pattern judges: lateness is days or hours, an order is "out of the declared flow's order", never a
 * failing, and no score is composed. */

import { evaluate, METHOD } from "../calc-grammar/index.mjs";
import { word } from "../setup-words/index.mjs";

/** R23 (K1504, M-C8): the highest false-alarm rate at which a pattern's results are shown. */
export const GATE_MAX_RATE = 0.2;
/** How many units one pattern gathers in one run, at most. There is no cursor: a run that stops at the bound is a
 *  sample, and its denominator says so (`capped: true`, `of_total` the whole when it is known; K4571). */
export const UNITS_MAX = 2000;

/** R22: the shipped patterns, data-defined, each with its denominator and method. */
export const PATTERNS = Object.freeze([
  Object.freeze({ pattern: "flow_out_of_order", version: 1, label: word("calculations.label.events_declared_flow"),
    denominator: word("calculations.threaded_flow_instances"), method: "progressions' out-of-order findings (its R38, ordered by events' three-valued sequence); share of instances holding one, by calc-grammar" }),
  Object.freeze({ pattern: "duty_lateness", version: 1, label: word("calculations.label.days_late_per"),
    denominator: word("calculations.duty_occurrences_recorded"), method: "duties' recorded transitions and occurrences (its R9, R13); days from the due date to the meeting event, by calc-grammar's span over civil-time" }),
  Object.freeze({ pattern: "posting_lateness", version: 1, label: word("calculations.label.hours_meeting_posting"),
    denominator: word("calculations.meetings_posting_held"), method: "events' meetings and the publication events within them (its R24, R27); calc-grammar's span in hours and in days" }),
  Object.freeze({ pattern: "office_lateness", version: 1, label: word("calculations.label.share_office_decided"),
    denominator: word("calculations.office_duty_occurrences"), method: "duties' recorded transitions, grouped by the duty's obligor; calc-grammar's share" }),
  Object.freeze({ pattern: "proceeding_lateness", version: 1, label: word("calculations.label.share_decided_duty"),
    denominator: word("calculations.duty_occurrences_arising"), method: "duties' recorded transitions, grouped by the duty's arising_in proceeding; calc-grammar's share" }),
]);

const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const list = (v, ...keys) => (Array.isArray(v) ? v : plain(v) ? (keys.map((k) => v[k]).find(Array.isArray) || []) : []);
const found = (r) => !!r && r.ok !== false && r.found !== false;
const dayOf = (v) => {
  const s = typeof v === "string" ? v : plain(v) ? (typeof v.value === "string" ? v.value : plain(v.date) ? v.date.value
    : plain(v.due) ? v.due.value : typeof v.start === "string" ? v.start : null) : null;
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}/.test(s) ? s : null;
};
/* A denominator, with the bound stated when the gather stopped at it: a sample is never shown as a census. */
const stated = (den, cap) => (cap && cap.capped ? { ...den, capped: true, of_total: cap.total } : den);
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
  if (!duties || typeof duties.transitionsOf !== "function") return { units: null, why: word("calculations.why.duties_module_reachable") };
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
  const all = [...latest.values()].filter((t) => t.state === "met" || t.state === "met_late");
  const units = all.slice(0, UNITS_MAX);
  const meta = new Map();
  for (const u of units) {
    if (meta.has(u.duty)) continue;
    let d = null;
    try { d = typeof duties.readDuty === "function" ? await duties.readDuty({ dutyId: u.duty, viewer }) : null; } catch { d = null; }
    const duty = found(d) ? (d.duty || d) : null;
    const ent = (x) => (typeof x === "string" ? x : plain(x) ? (x.entity_id ?? x.entity ?? x.id ?? null) : null);
    meta.set(u.duty, { office: duty ? ent(duty.obligor) : null, proceeding: duty ? ent(duty.arising_in) : null });
  }
  return { units: units.map((u) => ({ ...u, ...meta.get(u.duty) })), capped: all.length > UNITS_MAX, total: all.length };
}

const EVALUATORS = {
  async flow_out_of_order(deps) {
    const p = deps.progressions;
    if (!p || typeof p.proposalsFeed !== "function") return { results: [], denominator: { n: null, why: word("calculations.why.progressions_module_reachable") }, evaluated: 0 };
    const feed = await p.proposalsFeed(Date.parse(deps.now));
    const every = list(feed, "instances").filter(plain);
    const instances = every.slice(0, UNITS_MAX);
    const cap = { capped: every.length > UNITS_MAX, total: every.length };
    const rows = instances.map((x) => {
      const ooo = list(x.findings, "findings").filter((f) => plain(f) && f.kind === "out_of_order");
      return { x, ooo, row: { instance: `${x.progression_key ?? x.progressionKey}\u0000${x.entity_id ?? x.entityId}`, late: ooo.length ? "true" : "false" } };
    });
    const t = { fields: [{ name: "instance", type: "string" }, { name: "late", type: "boolean" }], rows: rows.map((r) => r.row) };
    const share = rows.length ? shareOf(t, null, null) : null;
    const denominator = stated({ n: rows.length, of: word("calculations.threaded_flow_instances_open"), share_out_of_order: share }, cap);
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
        value: { duty: x.u.duty, occurrence: x.u.key, days_late: cell ?? { undetermined: true, why: word("calculations.why.due_date_meeting") } },
        derivation: { due: x.due, met: x.met, transition: { state: x.u.state, as_of: x.u.as_of ?? null, at: x.u.at ?? null }, event: x.event },
        rests_on: [x.u.duty, ...(x.event ? [x.event] : [])] };
    });
    return { results, denominator: stated({ n: d.units.length, of: word("calculations.duty_occurrences_recorded_met"), late: late.length }, d), evaluated: d.units.length };
  },

  async posting_lateness(deps) {
    const e = deps.events;
    const d = await decidedOccurrences(deps.duties, deps.viewer);
    if (!e || typeof e.eventsFor !== "function") return { results: [], denominator: { n: null, why: word("calculations.why.events_module_reachable") }, evaluated: 0 };
    const bodies = [...new Set((d.units || []).map((u) => u.office).filter(Boolean))];
    const units = [];
    let capped = false;   /* the bound was reached, or a body's meetings were listed only to their own limit: of_total is not known */
    for (const body of bodies) {
      if (units.length >= UNITS_MAX) break;
      let got = null;
      try { got = await e.eventsFor({ entity: body, kinds: ["meeting"], limit: 500, viewer: deps.viewer }); } catch { got = null; }
      if (got && got.truncated) capped = true;
      for (const m of list(got, "events", "items").filter(plain)) {
        if (units.length >= UNITS_MAX) break;
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
          if (units.length >= UNITS_MAX) { capped = true; break; }
          units.push({ body, meeting: id, posting: pid, start, posted: dayOf(p.when), startDt: (full.event || full).when, postedDt: p.when });
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
        says: word("calculations.says.posting_time_upper") },
      derivation: { meeting_when: u.startDt ?? null, posting_when: u.postedDt ?? null, method: "events R24" },
      rests_on: [u.meeting, u.posting] }));
    return { results, denominator: stated({ n: new Set(units.map((u) => u.meeting)).size, of: word("calculations.meetings_posting_held_within") }, { capped, total: null }), evaluated: units.length };
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
      denominator: stated({ n: mine.length, of: word("calculations.duty_occurrences_recorded_met_met", { field: String(field === "office" ? "office" : "proceeding") }) }, d),
      derivation: { occurrences: mine.map((u) => ({ duty: u.duty, occurrence: u.key, state: u.state })) },
      rests_on: [...new Set(mine.map((u) => u.duty))] });
  }
  return { results, denominator: stated({ n: units.length, of: word("calculations.duty_occurrences_with_recorded_met", { field: String(field === "office" ? word("calculations.obligor_office") : word("calculations.proceeding_arose")) }), subjects: results.length }, d), evaluated: units.length };
}

/** R22: one pattern's run: `{results, denominator, evaluated}`. */
export async function runPattern(p, deps) {
  const f = EVALUATORS[p.pattern];
  if (!f) return { results: [], denominator: { n: null, why: "no evaluator" }, evaluated: 0 };
  return f(deps);
}
