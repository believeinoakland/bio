/* events: the time of an event, read from what attests it (R9, R10, R24, R29, R31). Pure: no store, no clock. A `when`
   is `{start, end, precision, zone, value}`, `start` and `end` instants (`ISO_TS_RE`) of the half-open span civil-time's
   `bounds` gives, or null where not stated; an upper bound (R24) has `start` null and `precision` `upper_bound`. A day is
   never read as its midnight (K1464): it is its whole local day. Sequence is computed here on each read and never stored. */
import { bounds, compare, isCalendarDate } from "../civil-time/index.mjs";

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MINUTE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const SECOND = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

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
    else return { bad: `'${s.slice(0, 60)}' is not a date (YYYY-MM-DD, or with a time of day)` };
  } else if (v && typeof v === "object" && !Array.isArray(v) && typeof v.value === "string" && typeof v.precision === "string") {
    value = v.value; precision = v.precision; if (typeof v.zone === "string" && v.zone) z = v.zone;
  } else return { bad: "a date is a string YYYY-MM-DD (or with a time of day) or {value, precision, zone}" };
  if (precision !== "edtf" && !isCalendarDate(value.slice(0, 10)))
    return { bad: `'${value.slice(0, 10)}' is not a day of the calendar` };
  if (z !== null) {
    let b;
    try { b = bounds({ value, precision, zone: z }); } catch (e) { return { bad: String(e && e.message || e) }; }
    if (b.refused) return { bad: b.why };
    if (b.undetermined) return { bad: b.why };
  } else if (!["day", "minute", "second", "edtf"].includes(precision)) return { bad: `'${precision}' is not a precision` };
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
  if (!a || !b) return { undetermined: true, why: "placed nowhere: an event with no dated attestation has no when" };
  if (a.precision === "upper_bound" || b.precision === "upper_bound" || !a.zone || !b.zone) {
    if (a.end && b.start && a.end <= b.start) return "before";
    if (b.end && a.start && b.end <= a.start) return "after";
    const why = !a.zone || !b.zone ? "a when held with no zone has no span, so which came first is not settled"
      : "an upper bound says only \"on or before\", so which came first is not settled";
    return { undetermined: true, why };
  }
  const c = compare(dt(a), dt(b));
  if (c === "before" || c === "after") return c;
  return { undetermined: true, why: c && c.why ? c.why : "the precision held does not settle the order" };
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

/** R29: order a list of `{when, …}` items by start then end then id, each marked with the neighbours its order with is
 *  undetermined (a band with its bounds, R31), the items with no `when` listed apart as "placed nowhere". */
export function orderByWhen(items, idOf) {
  const placed = items.filter((i) => i.when), nowhere = items.filter((i) => !i.when);
  const key = (w) => w.start || w.end || "";
  placed.sort((x, y) => (key(x.when) < key(y.when) ? -1 : key(x.when) > key(y.when) ? 1 : 0)
    || String(x.when.end || "").localeCompare(String(y.when.end || "")) || String(idOf(x)).localeCompare(String(idOf(y))));
  const out = placed.map((i, n) => {
    const with_ = [];
    for (let k = Math.max(0, n - 25); k < Math.min(placed.length, n + 26); k++) {
      if (k === n) continue;
      const s = sequenceOf(i.when, placed[k].when);
      if (s && s.undetermined) with_.push(idOf(placed[k]));
    }
    return { ...i, order: with_.length ? { undetermined: true, with: with_, band: { start: i.when.start, end: i.when.end } }
                                       : { undetermined: false } };
  });
  return { placed: out, nowhere };
}
