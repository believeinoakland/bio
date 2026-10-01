/* A deadline's date (filings R9; `jurisdictions` R26, R33; K108 (5), N72): computed only from a recorded start event and
 * the rule's `days` and `count`, a `business` count on the profile's holiday calendar, else undetermined with why, by
 * `action-clocks`' count (its R2). Pure;
 * never throws. The count starts on the day after the start event, so a period of N days ends on the Nth counted day
 * (the rule is stated beside every date it answers). */

import { computeDeadline } from "../action-clocks/index.mjs";

export const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export const COUNTED_FROM = "counted from the day after the start event";

/** A `YYYY-MM-DD` that names a real calendar day, as that string; else null. */
export function realDate(v) {
  const m = DATE_RE.exec(String(v ?? ""));
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toISOString().slice(0, 10) === m[0] ? m[0] : null;
}

/** `{state: "determined", date, counted}` or `{state: "undetermined", why}`. `holidays` is the view's `holidays`
 *  (`[{year, days: [{date}]}]`); a business count reaching into a year it does not list is undetermined, never counted
 *  as though that year had none (jurisdictions R33). The count itself is `action-clocks`' (its R2's `computeDeadline`,
 *  the one rule a clock entry's date and a packet's deadline are counted by): here the start is the one this module's
 *  R9 found (the act, or a ledger event), handed to it as the event its rule starts from. */
export function deadlineDate({ start = null, days = null, count = null, holidays = null } = {}) {
  const from = realDate(start);
  if (!from) return { state: "undetermined", why: "no start event is recorded, so no date is computed from it" };
  if (!Number.isInteger(days) || days < 0)
    return { state: "undetermined", why: "the rule states no whole number of days (the profiles may disagree on it)" };
  if (count !== "calendar" && count !== "business")
    return { state: "undetermined", why: "the rule states no count (calendar or business days), so no date is computed" };
  if (count === "business" && days > 2600)
    return { state: "undetermined", why: "the count runs past ten years" };
  const c = computeDeadline({ starts: "filed", days, count }, { correspondence: [{ direction: "sent", at: from }] },
                            { holidays: Array.isArray(holidays) ? holidays : [] });
  if (!c.date)
    return { state: "undetermined",
             why: count === "business" ? `${c.why.replace(/^the count reaches (\d{4})/, "the business-day count reaches into $1")}`
                                         + " (or withholds, the active profiles disagreeing), so it is not counted" : c.why };
  return { state: "determined", date: c.date,
           counted: count === "calendar" ? `${days} calendar days, ${COUNTED_FROM}`
             : `${days} business days on the profile's holiday calendar, ${COUNTED_FROM}` };
}
