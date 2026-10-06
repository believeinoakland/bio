// @ts-check
/* explore: whether validities and a window share an instant, three-valued through civil-time (R11). A validity holds
   from its `from` bound's start to its `to` bound's end, as civil-time's `validAt` reads it; a bound not stated, or an
   event bound not resolved, is unknown, never "always". Which instant comes first is civil-time's `compare`, the one
   sequence read (civil-time R5); nothing here orders instants itself. */
import { bounds, compare } from '../civil-time/index.mjs';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** One bound of a validity as a date-time, null when not stated or not resolved. */
function boundDate(b, precision, zone) {
  if (b === null || b === undefined) return null;
  if (typeof b === 'string') return { value: b, precision: precision || 'day', zone };
  if (isObj(b)) {
    if (b.value !== undefined && b.value !== null) return { value: b.value, precision: b.precision || precision || 'day', zone: b.zone || zone };
    if (b.at !== undefined && b.at !== null) return b.at;
  }
  return null;
}

const instant = (dt, side) => {
  if (dt === null) return null;
  try {
    const b = bounds(dt);
    if (!b || b.refused || b.undetermined) return null;
    return side === 'start' ? b.earliest : b.latest;
  } catch { return null; }
};

/** A validity `{from, to, precision, zone}` as `{start, end}` instants, null where unknown. @param {any} valid */
export function spanOfValidity(valid) {
  if (!isObj(valid)) return { start: null, end: null };
  return { start: instant(boundDate(valid.from, valid.precision, valid.zone), 'start'), end: instant(boundDate(valid.to, valid.precision, valid.zone), 'end') };
}

/** A window (a date-time: a day, a minute, an EDTF interval) as `{start, end}`. @param {any} dt */
export function spanOfWindow(dt) {
  try {
    const b = bounds(dt);
    if (!b || b.refused || b.undetermined) return { start: null, end: null };
    return { start: b.earliest, end: b.latest };
  } catch { return { start: null, end: null }; }
}

/** a strictly before b, through civil-time; equal instants are not before. */
const before = (a, b) => a !== b && compare(a, b) === 'before';
const latest = (xs) => xs.reduce((m, x) => (m === null || before(m, x) ? x : m), null);
const earliest = (xs) => xs.reduce((m, x) => (m === null || before(x, m) ? x : m), null);

/**
 * Whether the spans share an instant: `in` (they surely do), `out` (they surely do not) or `undetermined` with why;
 * with the known part of the shared span.
 * @param {{start: string|null, end: string|null}[]} spans
 */
export function intersect(spans) {
  const starts = spans.map((s) => s.start), ends = spans.map((s) => s.end);
  const ks = starts.filter((x) => x !== null), ke = ends.filter((x) => x !== null);
  const from = latest(ks), to = earliest(ke);
  if (from !== null && to !== null && !before(from, to)) return { holds: 'out', from, to };
  if (ks.length === spans.length && ke.length === spans.length) return { holds: 'in', from, to };
  return { holds: 'undetermined', from, to, why: 'a start or an end is not stated, so whether the spans meet is not settled' };
}
