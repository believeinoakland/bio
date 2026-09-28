/* A deadline's date (filings R9; `jurisdictions` R26, R33; K108 (5), N72): computed only from a recorded start event and
 * the rule's `days` and `count`, a `business` count on the profile's holiday calendar, else undetermined with why. Pure;
 * never throws. The count starts on the day after the start event, so a period of N days ends on the Nth counted day
 * (the rule is stated beside every date it answers). */

export const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export const COUNTED_FROM = "counted from the day after the start event";

/** A `YYYY-MM-DD` that names a real calendar day, as that string; else null. */
export function realDate(v) {
  const m = DATE_RE.exec(String(v ?? ""));
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toISOString().slice(0, 10) === m[0] ? m[0] : null;
}

const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

/** `{state: "determined", date, basis}` or `{state: "undetermined", why}`. `holidays` is the view's `holidays`
 *  (`[{year, days: [{date}]}]`); a business count reaching into a year it does not list is undetermined, never counted
 *  as though that year had none (jurisdictions R33). */
export function deadlineDate({ start = null, days = null, count = null, holidays = null } = {}) {
  const from = realDate(start);
  if (!from) return { state: "undetermined", why: "no start event is recorded, so no date is computed from it" };
  if (!Number.isInteger(days) || days < 0)
    return { state: "undetermined", why: "the rule states no whole number of days (the profiles may disagree on it)" };
  if (count === "calendar")
    return { state: "determined", date: addDays(from, days), counted: `${days} calendar days, ${COUNTED_FROM}` };
  if (count !== "business")
    return { state: "undetermined", why: "the rule states no count (calendar or business days), so no date is computed" };
  const years = new Map();
  for (const h of Array.isArray(holidays) ? holidays : [])
    if (h && Number.isInteger(Number(h.year)))
      years.set(Number(h.year), new Set((Array.isArray(h.days) ? h.days : []).map((d) => d && d.date)));
  let day = from, n = 0;
  for (let guard = 0; n < days; guard++) {
    if (guard > 3700) return { state: "undetermined", why: "the count runs past ten years" };
    day = addDays(day, 1);
    const y = Number(day.slice(0, 4));
    if (!years.has(y))
      return { state: "undetermined",
               why: `the business-day count reaches into ${y}, a year the profile's holiday calendar does not list`
                  + " (or withholds, the active profiles disagreeing), so it is not counted" };
    const wd = new Date(`${day}T00:00:00Z`).getUTCDay();
    if (wd !== 0 && wd !== 6 && !years.get(y).has(day)) n++;
  }
  return { state: "determined", date: day,
           counted: `${days} business days on the profile's holiday calendar, ${COUNTED_FROM}` };
}
