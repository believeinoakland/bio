/* events: the time of an event, read from what attests it (R9, R10, R24, R29, R31). Pure: no store, no clock. A `when`
   is `{start, end, precision, zone, value}`, `start` and `end` instants (`ISO_TS_RE`) of the half-open span civil-time's
   `bounds` gives, or null where not stated; an upper bound (R24) has `start` null and `precision` `upper_bound`. A day is
   never read as its midnight (K1464): it is its whole local day. Sequence is computed here on each read and never stored. */
import { bounds, compare, isCalendarDate } from "../civil-time/index.mjs";
import { localize } from "../setup-words/index.mjs";
import { reason, reasonText } from "./reasons.mjs";

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MINUTE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const SECOND = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

/** A stated date as a date-time `{value, precision, zone}`, or `{bad: why}`. `v` is a day `YYYY-MM-DD`, a minute
 *  `YYYY-MM-DDTHH:MM`, a second, a UTC instant, or a date-time object; `zone` is the view's, used when `v` gives none.
 *  A day that is no calendar day (2026-02-31) is bad (civil-time R6). */
export function readDate(v, zone) {
  let value, precision, z = zone ?? null;
  if (typeof v === "string") {
    const s = v.trim();
    if (DAY.test(s)) { value = s; precision = "day"; }
    else if (MINUTE.test(s)) { value = s; precision = "minute"; }
    else if (SECOND.test(s)) { value = s; precision = "second"; }
    else if (INSTANT.test(s)) { value = s.slice(0, 19); precision = "second"; z = "UTC"; }
    else return { bad: localize("events.time.value_is_not_a_date", "{value} is not a date: write a day as YYYY-MM-DD, with a time of day if it has one", { value: String(s.slice(0, 60)) }) };
  } else if (v && typeof v === "object" && !Array.isArray(v) && typeof v.value === "string" && typeof v.precision === "string") {
    value = v.value; precision = v.precision; if (typeof v.zone === "string" && v.zone) z = v.zone;
  } else return { bad: localize("events.time.a_date_is_written_as", "a date is written as a day (YYYY-MM-DD), with a time of day if it has one, or given with its precision and its zone") };
  if (precision !== "edtf" && !isCalendarDate(value.slice(0, 10)))
    return { bad: localize("events.time.day_is_not_a_day", "{day} is not a day of the calendar", { day: String(value.slice(0, 10)) }) };
  if (z !== null) {
    let b;
    try { b = bounds({ value, precision, zone: z }); } catch (e) { return { bad: String(e && e.message || e) }; }
    if (b.refused) return { bad: reasonText(b.why) };
    if (b.undetermined) return { bad: reasonText(b.why) };
  } else if (!["day", "minute", "second", "edtf"].includes(precision)) return { bad: localize("events.time.precision_is_not_a_precision", "{precision} is not a precision", { precision: String(precision) }) };
  return { value, precision, zone: z };
}

/** R9, R24: the when an attestation's date gives, `{start, end, precision, zone, value}`; an upper bound has `start`
 *  null. With no zone the span is not known: `start` and `end` are null and the precision and value are kept. */
export function whenOf({ value, precision, zone, upper_bound = 0 }) {
  if (value == null) return null;
  if (!zone) return { start: null, end: null, precision, zone: null, value };
  const b = bounds({ value, precision, zone });
  if (!b || b.refused || b.undetermined) return { start: null, end: null, precision, zone, value };
  if (upper_bound) return { start: null, end: b.latest, precision: "upper_bound", zone, value };
  return { start: b.earliest, end: b.latest, precision, zone, value };
}

const dt = (w) => ({ value: w.value, precision: w.precision, zone: w.zone });

/** R31: `before`, `after` or `{undetermined, why}`, comparing two whens; never a guess, never stored. */
export function sequenceOf(a, b) {
  if (!a || !b) return { undetermined: true, why: reason("events.why.placed_nowhere_event") };
  if (a.precision === "upper_bound" || b.precision === "upper_bound" || !a.zone || !b.zone) {
    if (a.end && b.start && a.end <= b.start) return "before";
    if (b.end && a.start && b.end <= a.start) return "after";
    const why = !a.zone || !b.zone ? reason("events.text.held_zone_span") : reason("events.text.upper_bound_says");
    return { undetermined: true, why };
  }
  const c = compare(dt(a), dt(b));
  if (c === "before" || c === "after") return c;
  return { undetermined: true, why: c && c.why ? c.why : reason("events.why.precision_held_settle") };
}

/** A time a caller names (`from`, `to`, `at`): a day, a minute or an instant, as a span in `zone`; null when absent. */
export function spanOfBound(v, zone) {
  if (v === undefined || v === null || v === "") return null;
  const d = readDate(v, zone || "UTC");
  if (d.bad) return { bad: d.bad };
  return whenOf(d);
}

/** Whether a when lies wholly before (`before`), wholly after (`after`) a bound span, or overlaps it. */
export function placeAgainst(w, s) {
  if (!w || !s) return "unknown";
  if (w.end && s.start && w.end <= s.start) return "before";
  if (w.start && s.end && w.start >= s.end) return "after";
  return "overlaps";
}

/** R29: order a list of `{when, …}` items by start then end then id, each marked with every other item its order with is
 *  undetermined (a band with its bounds, R31), the items with no `when` listed apart as "placed nowhere". Two whens with
 *  both bounds and a zone are R31's comparison of their spans (civil-time R5: before only when one ends by the other's
 *  start), so those pairs are read by one sweep in start order; every pair with another when is asked of `sequenceOf`. */
export function orderByWhen(items, idOf) {
  const placed = items.filter((i) => i.when), nowhere = items.filter((i) => !i.when);
  const key = (w) => w.start || w.end || "";
  placed.sort((x, y) => (key(x.when) < key(y.when) ? -1 : key(x.when) > key(y.when) ? 1 : 0)
    || String(x.when.end || "").localeCompare(String(y.when.end || "")) || String(idOf(x)).localeCompare(String(idOf(y))));
  const w = placed.map((i) => i.when), marks = placed.map(() => new Set());
  const mark = (i, k) => { marks[i].add(k); marks[k].add(i); };
  const spans = [], others = [];
  w.forEach((x, n) => (x.start && x.end && x.zone && x.precision !== "upper_bound" ? spans : others).push(n));
  /* spans in start order: one overlaps each later span until the first starting at or after its end */
  for (let p = 0; p < spans.length; p++)
    for (let q = p + 1; q < spans.length && w[spans[q]].start < w[spans[p]].end; q++) mark(spans[p], spans[q]);
  const other = new Set(others);
  for (const i of others)
    for (let k = 0; k < placed.length; k++) {
      if (k === i || (other.has(k) && k < i)) continue;
      const s = sequenceOf(w[i], w[k]);
      if (s && s.undetermined) mark(i, k);
    }
  const out = placed.map((i, n) => {
    const with_ = [...marks[n]].sort((a, b) => a - b).map((k) => idOf(placed[k]));
    return { ...i, order: with_.length ? { undetermined: true, with: with_, band: { start: i.when.start, end: i.when.end } }
                                       : { undetermined: false } };
  });
  return { placed: out, nowhere };
}
