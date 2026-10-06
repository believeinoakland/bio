/* civil-time: the proleptic Gregorian calendar as day numbers (days since 1970-01-01), for any integer year.
 * Pure arithmetic: no zone, no clock, no `Date`. A day is written `YYYY-MM-DD` for years 0000–9999 and in
 * ISO 8601's expanded form (`+YYYYY-MM-DD`, `-YYYY-MM-DD`) outside them. */

export const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const floorDiv = (a, b) => Math.floor(a / b);

export const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export function monthLength(y, m) {
  return m === 2 ? (isLeap(y) ? 29 : 28) : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

/** Days since 1970-01-01 of a civil date (Hinnant's days_from_civil). */
export function dayNumber(y, m, d) {
  y -= m <= 2 ? 1 : 0;
  const era = floorDiv(y, 400);
  const yoe = y - era * 400;
  const doy = floorDiv(153 * (m + (m > 2 ? -3 : 9)) + 2, 5) + d - 1;
  const doe = yoe * 365 + floorDiv(yoe, 4) - floorDiv(yoe, 100) + doy;
  return era * 146097 + doe - 719468;
}

/** The civil date of a day number (Hinnant's civil_from_days). */
export function civil(n) {
  n += 719468;
  const era = floorDiv(n, 146097);
  const doe = n - era * 146097;
  const yoe = floorDiv(doe - floorDiv(doe, 1460) + floorDiv(doe, 36524) - floorDiv(doe, 146096), 365);
  const doy = doe - (365 * yoe + floorDiv(yoe, 4) - floorDiv(yoe, 100));
  const mp = floorDiv(5 * doy + 2, 153);
  const d = doy - floorDiv(153 * mp + 2, 5) + 1;
  const m = mp + (mp < 10 ? 3 : -9);
  return { y: yoe + era * 400 + (m <= 2 ? 1 : 0), m, d };
}

const pad = (n, w) => String(n).padStart(w, "0");
export function yearText(y) {
  if (y >= 0 && y <= 9999) return pad(y, 4);
  return (y < 0 ? "-" : "+") + pad(Math.abs(y), 4);
}
export const dayText = (n) => { const { y, m, d } = civil(n); return `${yearText(y)}-${pad(m, 2)}-${pad(d, 2)}`; };
export const weekdayOf = (n) => WEEKDAYS[((n % 7) + 7 + 4) % 7];   /* 1970-01-01 was a Thursday */

/** R6: a `YYYY-MM-DD` naming a real day; its day number, else null. */
export function parseDay(s) {
  if (typeof s !== "string") return null;
  const m = DAY_RE.exec(s);
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  if (mo < 1 || mo > 12 || d < 1 || d > monthLength(y, mo)) return null;
  return dayNumber(y, mo, d);
}

/** The same day-number `months` later (or earlier) and, where the target month is too short, both readings: its
 *  last day and the next month's first (R13). */
export function addMonths(n, months) {
  const { y, m, d } = civil(n);
  const idx = y * 12 + (m - 1) + months;
  const ty = floorDiv(idx, 12), tm = idx - ty * 12 + 1;
  const len = monthLength(ty, tm);
  if (d <= len) return { day: dayNumber(ty, tm, d) };
  return { candidates: [dayNumber(ty, tm, len), dayNumber(ty, tm, len) + 1] };
}
