/* A deadline's date (filings R9; `jurisdictions` R26, R33; K108 (5), N72): computed only from a recorded start event and
 * the rule's `days` and `count`, a `business` count on the profile's holiday calendar as confirmed on this instance
 * (R30: `action-clocks` R10, read through `local-facts`), else undetermined with why, by `action-clocks`' count (its R2).
 * Never throws; it reads only through the `factOf` it is handed. The count starts on the day after the start event,
 * so a period of N days ends on the Nth counted day (the rule is stated beside every date it answers). */

import { computeDeadline } from "../action-clocks/index.mjs";
import { factPath } from "../local-facts/index.mjs";

export const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export const COUNTED_FROM = "counted from the day after the start event";

/** A `YYYY-MM-DD` that names a real calendar day, as that string; else null. */
export function realDate(v) {
  const m = DATE_RE.exec(String(v ?? ""));
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toISOString().slice(0, 10) === m[0] ? m[0] : null;
}

/** R30 (`action-clocks` R10): a reader of each holiday entry's confirmation on this instance, through `local-facts`'
 *  `factStatus` (its R2) at the entry's path (its R6), answered in the shape `computeDeadline` takes. A read that fails,
 *  or that local-facts cannot answer, is `absent`, so the count is undetermined rather than counted on a calendar whose
 *  state is unknown. Null without a `factStatus` to read: the count then states its calendar `not_read`. */
export function factReader(localFacts, viewer) {
  if (!localFacts || typeof localFacts.factStatus !== "function") return null;
  return (h) => {
    let path = null;
    try {
      path = factPath({ profile: h.profile ?? null, fact: "holidays", year: Number(h.year),
                        ...(Array.isArray(h.offices) ? { offices: h.offices } : {}) });
    } catch { path = null; }
    if (typeof path !== "string") return { path, status: "absent", why: "the holiday entry names no local fact" };
    let r = null;
    try { r = localFacts.factStatus({ path, viewer }); } catch { r = null; }
    if (!r || typeof r !== "object" || r.ok === false)
      return { path, status: "absent", why: (r && (r.reason || r.code)) || "local facts did not answer" };
    const g = r.governs && typeof r.governs === "object" ? r.governs : {};
    const last = r.latest && typeof r.latest === "object" ? r.latest : {};
    const lapsed = r.lapsed && typeof r.lapsed === "object" ? r.lapsed : {};
    const day = (v) => (typeof v === "string" ? v.slice(0, 10) : null);
    return { path, status: typeof r.status === "string" ? r.status : "absent", why: r.why ?? null,
             value: g.value ?? null, corrected: g.origin === "corrected", says: g.says ?? null,
             by: last.by ?? null, at: day(last.at), last_at: day(lapsed.at) };
  };
}

/** `{state: "determined", date, counted, calendar?}` or `{state: "undetermined", why, calendar?}`. `view` is the
 *  combined profile view (its `holidays`, and its `action_kinds` for the venue an action is filed at; `holidays` alone
 *  stands for a view holding only those); `counterparty` and `kind` the action's, so a business count reads the
 *  holiday entries for all offices and those for the action's one office (`action-clocks` R10, K986); `factOf` each
 *  entry's confirmation (`factReader`). A business count reaching into a year the calendar does not list for that
 *  office, or reading an entry disputed or absent here, is undetermined, never counted as though that year had none
 *  (jurisdictions R33). The count itself is `action-clocks`' (its R2's `computeDeadline`, the one rule a clock entry's
 *  date and a packet's deadline are counted by): here the start is the one this module's R9 found (the act, or a ledger
 *  event), handed to it as the event its rule starts from. `calendar` is its statement of the calendar it read (R30). */
export function deadlineDate({ start = null, days = null, count = null, holidays = null, view = null, counterparty = null,
                               kind = null, factOf = null } = {}) {
  const from = realDate(start);
  if (!from) return { state: "undetermined", why: "no start event is recorded, so no date is computed from it" };
  if (!Number.isInteger(days) || days < 0)
    return { state: "undetermined", why: "the rule states no whole number of days (the profiles may disagree on it)" };
  if (count !== "calendar" && count !== "business")
    return { state: "undetermined", why: "the rule states no count (calendar or business days), so no date is computed" };
  if (count === "business" && days > 2600)
    return { state: "undetermined", why: "the count runs past ten years" };
  const v = view && typeof view === "object" ? view : { holidays: Array.isArray(holidays) ? holidays : [] };
  const c = computeDeadline({ starts: "filed", days, count },
                            { correspondence: [{ direction: "sent", at: from }], counterparty, action_kind: kind }, v,
                            { factOf: typeof factOf === "function" ? factOf : null });
  const calendar = c.calendar ? { calendar: c.calendar } : {};
  if (!c.date)
    return { state: "undetermined",
             why: count === "business" ? `${c.why.replace(/^the count reaches (\d{4})/, "the business-day count reaches into $1")}`
                                         + " (or withholds, the active profiles disagreeing), so it is not counted" : c.why,
             ...calendar };
  return { state: "determined", date: c.date,
           counted: count === "calendar" ? `${days} calendar days, ${COUNTED_FROM}`
             : `${days} business days on the profile's holiday calendar, ${COUNTED_FROM}`, ...calendar };
}
