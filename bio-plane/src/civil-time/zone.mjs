/* civil-time: zones. An instant is held inside the module as whole seconds since 1970-01-01T00:00:00Z (a Number);
 * a zone's offset at an instant comes from `Intl.DateTimeFormat` with the IANA name (the runtime's tz data, named in
 * every trace, R25). No clock is read: every instant comes from an argument (R26). */
import { ISO_TS_RE } from "../record-grammar/index.mjs";
import { dayNumber, civil, yearText, monthLength } from "./days.mjs";

const DAY_S = 86400;
const INTL_LIMIT_S = 8.64e12;           /* the range a JavaScript time value can hold, in seconds */
const formatters = new Map();

function formatter(zone) {
  if (formatters.has(zone)) return formatters.get(zone);
  let f = null;
  try {
    f = new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", era: "short", year: "numeric",
      month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" });
  } catch { f = null; }
  formatters.set(zone, f);
  return f;
}

/** An IANA zone name the runtime knows (`Area/Location`, or `UTC`); never a bare offset. */
export function isZone(zone) {
  return typeof zone === "string" && /^[A-Za-z][A-Za-z0-9_+\-]*(\/[A-Za-z0-9_+\-]+)*$/.test(zone) && formatter(zone) !== null;
}

/** The zone's offset from UTC, in seconds, at instant `t`. Outside the range the runtime can format, 0 (only an EDTF
 *  year far beyond any calendar reaches there, and its trace says so). */
export function offsetAt(t, zone) {
  if (Math.abs(t) > INTL_LIMIT_S - 2 * DAY_S) return 0;
  const parts = formatter(zone).formatToParts(new Date(t * 1000));
  const v = {};
  for (const p of parts) v[p.type] = p.value;
  let y = +v.year;
  if (/^B/.test(v.era || "")) y = 1 - y;
  const wall = dayNumber(y, +v.month, +v.day) * DAY_S + (+v.hour % 24) * 3600 + +v.minute * 60 + +v.second;
  return wall - t;
}

/** The wall clock, as seconds counted as though UTC, that instant `t` shows in `zone`. */
export const wallOf = (t, zone) => t + offsetAt(t, zone);
/** The local day (a day number) on which `t` falls in `zone` (R1). */
export const localDayNumber = (t, zone) => Math.floor(wallOf(t, zone) / DAY_S);

/** Every instant at which `zone` shows the wall time `wall`: none in a spring gap, two in an autumn overlap. */
export function wallToInstants(wall, zone) {
  const offs = new Set([offsetAt(wall - DAY_S, zone), offsetAt(wall, zone), offsetAt(wall + DAY_S, zone)]);
  const out = [];
  for (const o of offs) {
    const t = wall - o;
    if (wallOf(t, zone) === wall && !out.includes(t)) out.push(t);
  }
  return out.sort((a, b) => a - b);
}

/** The first instant of local day `n` in `zone` (its midnight, or the end of a gap that swallows midnight). */
export function startOfDay(n, zone) {
  const wall = n * DAY_S;
  const c = wallToInstants(wall, zone);
  if (c.length) return c[0];
  let lo = wall - 20 * 3600, hi = wall + 20 * 3600;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (localDayNumber(mid, zone) >= n) hi = mid; else lo = mid;
  }
  return hi;
}

/** An instant in `record-grammar`'s form (`ISO_TS_RE`); years outside 0000–9999 in the expanded form. */
export function instantText(t) {
  const n = Math.floor(t / DAY_S), s = t - n * DAY_S;
  const { y, m, d } = civil(n);
  const p = (x) => String(x).padStart(2, "0");
  return `${yearText(y)}-${p(m)}-${p(d)}T${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}Z`;
}

/** An instant string (`ISO_TS_RE`) as seconds, else null. */
export function parseInstant(s) {
  if (typeof s !== "string" || !ISO_TS_RE.test(s)) return null;
  const y = +s.slice(0, 4), mo = +s.slice(5, 7), d = +s.slice(8, 10);
  const h = +s.slice(11, 13), mi = +s.slice(14, 16), se = +s.slice(17, 19);
  if (mo < 1 || mo > 12 || d < 1 || d > monthLength(y, mo)) return null;
  if (h > 23 || mi > 59 || se > 59) return null;
  return dayNumber(y, mo, d) * DAY_S + h * 3600 + mi * 60 + se;
}

/** The runtime's tz and ICU versions, or `unknown` where it does not state them (R25). Read from the runtime's own
 *  description, never from a clock. */
export function runtimeVersions() {
  let v = null;
  try { v = globalThis.process && globalThis.process.versions ? globalThis.process.versions : null; } catch { v = null; }
  return { tz: (v && typeof v.tz === "string" && v.tz) || "unknown", icu: (v && typeof v.icu === "string" && v.icu) || "unknown" };
}
