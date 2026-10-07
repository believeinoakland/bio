/* action-clocks — the count of a deadline from a profile rule, the statement of the calendar it read, and the reader of
 * that calendar's confirmations (requirements: `build/requirements/action-clocks.md`, R2, R10, R11, R12; K986, K998,
 * K1444, K1445, K1519, K1847). Pure: it reads only its arguments and `jurisdictions`' held profiles.
 *
 * The count itself is `civil-time`'s (`evaluateRule`, its R9–R17, R25: the direction, calendar or business days, the
 * weekend from the profile, the closure list a rule names, the roll, the extension, hours and the close of business);
 * this file chooses the start from the action's ledger, the office whose calendar governs, and states what it read.
 * Moved here from `index.mjs` at T33-74, `computeDeadline` delegating since (C-2, C-4). T34-50: a named closure list's
 * entry is a local fact at its own path (N562; `local-facts` R6), read and stated as any holiday year is; and civil-time
 * counts on a correction that governs whatever its status now (N603, its R16), so the count hands it every answer as
 * read and no longer rewrites the view itself. T35-62: R11's paths include the entries of each named closure list a
 * live deadline counts or rolls on (`closureListsRead`; N689). */

import { evaluateRule, localDay, isCalendarDate } from "../civil-time/index.mjs";
import { stampInstant } from "../record-core/index.mjs";
import { factPath, LOCAL_FACT_STATUSES } from "../local-facts/index.mjs";
import { get as profileOf } from "../../../jurisdictions/index.mjs";

const textOf = (v) => { try { return v === undefined || v === null ? null : String(v); } catch { return null; } };
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);

/** A closure-list entry (`jurisdictions` R47): it belongs to a named list a rule's `closures` selects, never to the
 *  office calendar (K1519); it is a local fact at its own path, naming its list (`local-facts` R6; N562). */
export const isListEntry = (h) => isObj(h) && h.list !== undefined && h.list !== null;

/* R10 (jurisdictions R43; K986): the ONE office a count for an action is for, as a list of none or one: its addressee
   when that is a named office (its `role` and `body`), else the venue its kind is filed at when the view's kind carries
   one (`{venue: <kind>}`); none for any other action, whose count reads only the entries for all offices. */
export function actionOffices(fm, view) {
  const cp = fm && typeof fm === "object" ? fm.counterparty : null;
  if (cp && typeof cp === "object" && cp.state === "named" && (cp.kind === undefined || cp.kind === null || cp.kind === "office")
      && typeof cp.role === "string" && cp.role.trim())
    return [{ role: cp.role.trim(), body: typeof cp.body === "string" ? cp.body.trim() : null }];
  const kind = fm && typeof fm === "object" ? fm.action_kind : null;
  if ((view && Array.isArray(view.action_kinds) ? view.action_kinds : []).some((k) => k && k.kind === kind && k.venue))
    return [{ venue: kind }];
  return [];
}
const officeKey = (o) => (typeof o === "string" ? `role:${o}` : o && typeof o.venue === "string" ? `venue:${o.venue}`
  : o && typeof o.role === "string" ? `role:${o.role}` : null);

/* The office as `civil-time` names it (its R9): a counterparty's role, or `{venue: <kind>}`; null for none. */
const civilOffice = (o) => (!o ? null : o.venue ? { venue: o.venue } : o.role);

/* R3, R5, R6 (actions R12, K1444 (iii)): the zone of an action's jurisdiction: the time zone of the profile that gives
   its addressed office (or its kind's venue), else the view's `time_zone`; null when none is held, and every local
   day that needs it is then undetermined, never the UTC day. */
export function actionZone(fm, view) {
  if (!view || typeof view !== "object") return null;
  const o = actionOffices(fm, view)[0];
  let pid = null;
  if (o && o.role) {
    const c = (Array.isArray(view.counterparties) ? view.counterparties : [])
      .find((x) => x && x.role === o.role && (o.body === null || x.body === o.body));
    pid = c && typeof c.profile === "string" ? c.profile : null;
  } else if (o && o.venue) {
    const k = (Array.isArray(view.action_kinds) ? view.action_kinds : []).find((x) => x && x.kind === o.venue);
    pid = k && typeof k.profile === "string" ? k.profile : null;
  }
  if (pid) {
    let p = null;
    try { p = profileOf(pid); } catch { p = null; }
    const z = p && p.time_zone && p.time_zone.value;
    if (typeof z === "string" && z) return z;
  }
  const z = view.time_zone && view.time_zone.value;
  return typeof z === "string" && z ? z : null;
}

/** The local day (`YYYY-MM-DD`) of the instant `ms` in `zone`, through `civil-time.localDay` (its R1); null when the
 *  zone is absent or unknown, never the UTC day. */
export function localDayOf(ms, zone) {
  if (typeof zone !== "string" || !zone || !Number.isFinite(ms)) return null;
  let d = null;
  try { d = localDay(stampInstant("second", ms), zone); } catch { d = null; }
  return typeof d === "string" ? d : null;
}

/* R11 (jurisdictions R33, R43, R47): the office-calendar entries a count for `offices` (`actionOffices`: none or one)
   reads for `year`: the year's entry for all offices and those naming the office; a closure-list entry is never one
   (K1519). With `list`, the same for the entries of that named closure list instead (N689), and no office-calendar
   entry. An office covered by neither leaves the year undetermined (`uncovered`), as does a year with no entry. */
export function yearEntries(view, offices, year, list = null) {
  const named = (h) => (typeof list === "string" && list ? isListEntry(h) && h.list === list : !isListEntry(h));
  const hs = (view && Array.isArray(view.holidays) ? view.holidays : []).filter((h) => h && named(h) && Number(h.year) === year);
  const keys = new Set((offices || []).map(officeKey).filter(Boolean));
  const all = hs.filter((h) => !Array.isArray(h.offices));
  const theirs = hs.filter((h) => Array.isArray(h.offices) && h.offices.some((o) => keys.has(officeKey(o))));
  const uncovered = all.length ? [] : (offices || [])
    .filter((o) => !theirs.some((h) => h.offices.some((x) => officeKey(x) === officeKey(o))));
  return { entries: [...all, ...theirs], uncovered };
}
/* R10, R11, R12: the `local-facts` fact of one holiday entry (a closure-list entry's naming its `list`, local-facts R6),
   and those of the offices' `hours` the view holds. */
export const holidayFact = (h) => ({ profile: h.profile ?? null, fact: "holidays", year: Number(h.year),
                                     ...(Array.isArray(h.offices) ? { offices: h.offices } : {}),
                                     ...(isListEntry(h) ? { list: h.list } : {}) });
export function officeHours(view, offices) {
  const out = [];
  for (const o of offices || []) {
    if (o.venue) {
      const k = (view && Array.isArray(view.action_kinds) ? view.action_kinds : []).find((x) => x && x.kind === o.venue);
      if (k && k.venue && k.venue.hours) out.push({ profile: k.profile ?? null, fact: "hours", office: { venue: k.kind } });
    } else {
      const c = (view && Array.isArray(view.counterparties) ? view.counterparties : [])
        .find((x) => x && x.role === o.role && (o.body === null || x.body === o.body));
      if (c && c.hours) out.push({ profile: c.profile ?? null, fact: "hours", office: { role: c.role, body: c.body } });
    }
  }
  return out;
}

/* R2, R11: whether a rule's count reads closed days at all: it skips them (a business count, business hours, or an
   extension counted in business days) or rolls past them. */
const readsClosed = (d) => d.count === "business" || d.units === "business_hours" || d.roll === true
  || (isObj(d.extension) && d.extension.count === "business");

/** R11: whether a rule's count reads the office calendar: a count that skips or rolls past closed days (a business
 *  count, business hours, an extension in business days, or a roll) and names no closure list. */
export function readsOfficeCalendar(d) {
  if (!isObj(d) || (typeof d.closures === "string" && d.closures)) return false;
  return readsClosed(d);
}

/** R11 (N689; jurisdictions R26, R47): the named closure lists a rule's count reads, each once: its `closures` and its
 *  `observed.closures`, when the count counts on the list or only rolls on it (as `readsOfficeCalendar` asks of the
 *  office calendar); none for a rule that reads no closed day. */
export function closureListsRead(d) {
  if (!isObj(d) || !readsClosed(d)) return [];
  const names = [d.closures, isObj(d.observed) ? d.observed.closures : null];
  return [...new Set(names.filter((n) => typeof n === "string" && n))];
}

/* R10: local-facts' answer for one path (its R2), as the count reads it: its status; the value that governs here
   (`governs.value`: the latest correction's, else the profile's) and whether it is a correction, which civil-time counts
   on whatever the status (N603, its R16); for a
   correction its member and date (the correcting act is the latest while the status is `corrected`) and its `says`; for
   a lapsed confirmation the date it was made; for a dispute who disputed it and when. A refusal, or a status local-facts
   does not give (its R7's `LOCAL_FACT_STATUSES`), is `absent` with why. */
function factAnswer(path, r) {
  if (!r || typeof r !== "object" || r.ok === false) {
    const why = r && typeof r === "object" ? textOf(r.reason || r.code) : null;
    return { path, status: "absent", why: why ? `local facts refused the read: ${why}` : "local facts did not answer" };
  }
  if (typeof r.status !== "string" || !LOCAL_FACT_STATUSES.includes(r.status))
    return { path, status: "absent", why: `local facts answered no status it gives (${textOf(r.status)?.slice(0, 40) ?? "none"})` };
  const g = r.governs && typeof r.governs === "object" ? r.governs : {};
  const last = r.latest && typeof r.latest === "object" ? r.latest : {};
  const lapsed = r.lapsed && typeof r.lapsed === "object" ? r.lapsed : {};
  const day = (v) => (typeof v === "string" ? v.slice(0, 10) : null);
  return { path, status: r.status, why: r.why ?? null,
           value: g.value ?? null, corrected: g.origin === "corrected", says: g.says ?? null,
           by: last.by ?? null, at: day(last.at), last_at: day(lapsed.at) };
}

/** R12 (K998, N474; for `filings` R30): the `factOf` `computeDeadline` takes, over local-facts' `factStatus` (its R2)
 *  for `viewer`, and the one reader R10's own count uses. Given a holiday entry, it reads the entry's path (`factPath`,
 *  local-facts R6: a named closure list's entry at its own path, `list=<name>`, never the office calendar's for the same
 *  year and offices; N562) and answers as R10's count reads it (`factAnswer`). An entry naming no local fact, a read
 *  that throws or is refused, or an answer local-facts cannot give is `absent` with why. Null when `localFacts` has no
 *  `factStatus`: the count then states its calendar `not_read`. Writes nothing; neither it nor the reader it answers
 *  ever throws. */
export function factReader(localFacts, viewer) {
  let read = null;
  try { read = localFacts && (typeof localFacts === "object" || typeof localFacts === "function") ? localFacts.factStatus : null; }
  catch { read = null; }
  if (typeof read !== "function") return null;
  return (h) => {
    let path = null;
    try { path = factPath(holidayFact(h)); } catch { path = null; }
    if (typeof path !== "string") return { path: null, status: "absent", why: "the holiday entry names no local fact" };
    let r;
    try { r = read.call(localFacts, { path, viewer }); }
    catch (e) {
      let m = null;
      try { m = e && typeof e.message === "string" ? e.message.slice(0, 200) : null; } catch { m = null; }
      return { path, status: "absent", why: `local facts' read failed${m ? `: ${m}` : ""}` };
    }
    try { return factAnswer(path, r); }
    catch { return { path, status: "absent", why: "local facts answered in a shape the count cannot read" }; }
  };
}

/* R10, R12: what a count states of the calendar it read: each entry read, once, with its path and status, and the
   whole `confirmed` when every entry is, `corrected` (naming each correction's member and date) when one is and none is
   unconfirmed, `unconfirmed` ("counted on an unconfirmed calendar (<source>, <date>)", the entry's basis and the lapsed
   confirmation's date) when any is. A named closure list's entry (jurisdictions R47) is stated by its own status, apart
   from the office calendar's, its words naming the list and year (N562). A correction a later confirmation confirmed is
   counted on (civil-time R16, N603) and reads `confirmed`, as R10 states it. Without a reader of the confirmations (a
   pure caller), `not_read`. */
function calendarStated(calls, readable) {
  const years = calls.map(({ h, f }) => ({ year: Number(h.year), list: isListEntry(h) ? h.list : null,
    offices: Array.isArray(h.offices) ? h.offices : null, path: f.path ?? null, status: f.status, basis: h.basis ?? null,
    ...(f.status === "corrected" ? { corrected_by: f.by ?? null, corrected_at: f.at ?? null } : {}) }));
  if (!readable) return { status: "not_read", years, says: ["whether your group has confirmed the calendar was not read"] };
  const says = [];
  for (const { h, f } of calls) {
    const which = isListEntry(h) ? `: the closure list '${h.list}', ${h.year}` : "";
    if (f.status === "unconfirmed")
      says.push(`counted on an unconfirmed calendar (${f.basis ?? "no source stated"}, ${f.last_at ?? "never confirmed here"})${which}`);
    else if (f.status === "corrected") says.push(`counted on a calendar ${f.says ?? `corrected locally by ${f.by}, ${f.at}`}${which}`);
  }
  const st = calls.map((c) => c.f.status);
  const status = st.some((s) => s === "unconfirmed") ? "unconfirmed" : st.some((s) => s === "corrected") ? "corrected" : "confirmed";
  return { status, years, says };
}

/* The reader civil-time is handed (its R16 `factOf`): every holiday entry, a closure list's among them, through the
   caller's `factOf` (absent when it throws or answers nothing), or `not_read` with none; civil-time counts on the
   correction an answer says governs (N603). Each entry is asked once per count, its answer kept in `cache` (the rule's
   count, its extension and its observed practice read the same entries), and every read is kept, in order, for the
   statement. */
function recorder(factOf, cache) {
  const calls = [];
  const readable = typeof factOf === "function";
  const read = (h) => {
    let f = cache.get(h);
    if (!f) {
      f = readable ? askOnce(factOf, h) : { path: null, status: "not_read" };
      f = { ...f, basis: h && h.basis !== undefined ? h.basis : f.basis };
      cache.set(h, f);
    }
    calls.push({ h, f });
    return f;
  };
  return { calls, read, readable };
}
function askOnce(factOf, h) {
  let f;
  try { f = factOf(h); } catch (e) { f = { status: "absent", why: `the reader failed${e && e.message ? `: ${String(e.message).slice(0, 200)}` : ""}` }; }
  return f && typeof f === "object" ? f : { status: "absent", why: "the reader gave no answer" };
}

const dayOf = (dt) => (dt && typeof dt.value === "string" ? dt.value.slice(0, 10) : null);
const earliestDay = (due) => (due && Array.isArray(due.candidates) ? dayOf(due.candidates[0]) : dayOf(due));

/* R2: the words civil-time's undetermined answer gives, the office calendar's named as the profile's holiday calendar. */
function whyOf(r) {
  const w = textOf(r && (r.why || r.refused)) || "the count is undetermined";
  return w.replace(/the office calendar/g, "the profile's holiday calendar");
}

/**
 * R2, R10 (C-1, C-2, C-4; K1444, K1445, K1519): a deadline's date from its profile rule `d` (`jurisdictions` R26),
 * counted by `civil-time.evaluateRule` from the event the rule names in the action's ledger: `received` (the
 * counterparty's receipt of the group's request) and `filed` are both counted from the group's own first `sent`
 * entry, never from a `received` entry; any other start is not a ledger event, so the answer is undetermined. The
 * office whose calendar governs is the action's one office (`actionOffices`). A rule whose basis is `UNMEASURED` is no
 * basis (K1445). `factOf` reads each holiday entry's confirmation (`factReader`), a named closure list's at its own path
 * (R12, N562). Answers `{date, start, due, candidates?, extension?, observed?, trace, calendar?}` (`date` the earliest
 * candidate when the date is uncertain, K1444 (i)) or `{date: null, start?, why, code?, calendar?}`; `calendar` is the
 * statement of what the count read (R10), present when the rule reads a calendar. Nothing is written; never throws.
 */
export function computeDeadline(d, fm, view, { factOf = null } = {}) {
  try {
    const rule = d && typeof d === "object" ? d : {};
    const ledger = fm && Array.isArray(fm.correspondence) ? fm.correspondence : [];
    if (rule.starts !== "received" && rule.starts !== "filed")
      return { date: null, why: `the rule starts from '${textOf(rule.starts)}', an event the action's ledger does not record` };
    const e = ledger.find((x) => x && x.direction === "sent" && typeof x.at === "string" && /^\d{4}-\d{2}-\d{2}/.test(x.at));
    if (!e) return { date: null, why: rule.starts === "received"
      ? "the action's ledger holds no sent entry: the counterparty's receipt of the group's request is counted from it"
      : "the action's ledger holds no sent entry, the event this rule starts from" };
    const start = e.at.slice(0, 10);
    if (!isCalendarDate(start)) return { date: null, start, why: `the sent entry's date '${start}' is not a calendar day` };
    if (rule.basis === "UNMEASURED")
      return { date: null, start, code: "UNMEASURED", why: "the rule is not held with a primary source: UNMEASURED is not a basis (K1445)" };
    const v = view && typeof view === "object" ? view : {};
    const office = civilOffice(actionOffices(fm, v)[0]);
    const zone = actionZone(fm, v) || "UTC";
    const anchor = { value: start, precision: "day", zone };
    const reads = readsClosed(rule);
    const base = { ...rule, observed: undefined };
    const cache = new Map();
    const rec = recorder(factOf, cache);
    let r;
    try { r = evaluateRule({ rule: base, anchor, view: v, office, factOf: rec.read }); }
    catch (x) { r = { undetermined: true, code: "RULE_INVALID", why: `the rule cannot be counted: ${textOf(x && x.message) || "a malformed rule"}` }; }
    const calendar = reads || rec.calls.length ? { calendar: calendarStated(rec.calls, rec.readable) } : {};
    if (!r || r.refused || r.undetermined) {
      /* R10: a disputed year names who disputed it and when, as local-facts answered them. */
      const disputed = r && r.code === "FACT_DISPUTED" ? rec.calls.find((c) => c.f.status === "disputed") : null;
      const by = disputed ? `${disputed.f.by ? ` by ${disputed.f.by}` : ""}${disputed.f.at ? `, ${disputed.f.at}` : ""}` : "";
      return { date: null, start, why: `${whyOf(r)}${by}`, code: (r && (r.code || r.refused)) || null, ...calendar };
    }
    const out = { date: earliestDay(r.due), start, due: r.due,
                  ...(Array.isArray(r.due && r.due.candidates) ? { candidates: r.due.candidates.map(dayOf) } : {}),
                  ...(r.extension ? { extension: r.extension } : {}), trace: r.trace, ...calendar };
    if (!out.date) return { date: null, start, why: "the count answered no day", ...calendar };
    /* R2 (K1504 (1); civil-time R10): a body's observed practice, counted on its own list and labelled as practice,
       answered beside the rule's date and never as it. */
    if (isObj(rule.observed) && typeof rule.observed.closures === "string") {
      let o;
      try { o = evaluateRule({ rule: { ...base, closures: rule.observed.closures }, anchor, view: v, office,
                               factOf: recorder(factOf, cache).read }); }
      catch { o = { undetermined: true, why: "the practice calendar cannot be counted" }; }
      out.observed = [{ label: "observed practice", closures: rule.observed.closures, basis: rule.observed.basis ?? null,
        status: rule.observed.status ?? null, ...(o.refused || o.undetermined ? { date: null, why: whyOf(o) }
          : { date: earliestDay(o.due), due: o.due }) }];
    }
    return out;
  } catch (x) {
    return { date: null, why: `the count failed: ${textOf(x && x.message) || "unknown"}` };
  }
}

/** R2, R13: a one-line account of a count's trace, for the clock entry a member adopts (the grammar holds scalars
 *  only; the whole trace stays with the proposal). */
export function traceLine(c) {
  if (!c || typeof c !== "object") return "";
  const t = c.trace && typeof c.trace === "object" ? c.trace : {};
  const parts = [];
  const unit = t.units === "days" ? `${t.count || ""} day${t.amount === 1 ? "" : "s"}`.trim() : String(t.units || "").replace(/_/g, " ");
  if (t.amount !== undefined) parts.push(`${t.amount} ${unit} ${t.direction === "backward" ? "before" : "after"} ${t.anchor_day ?? c.start ?? "the start"}`);
  if (t.closures) parts.push(`counted on the closure list ${t.closures}`);
  if (Array.isArray(t.skipped) && t.skipped.length) parts.push(`${t.skipped.length} closed day${t.skipped.length === 1 ? "" : "s"} skipped`);
  if (Array.isArray(t.roll) && t.roll.length) parts.push(`rolled from ${t.roll[0].from} to ${t.roll[t.roll.length - 1].to}`);
  if (t.receipt) parts.push(`received ${t.receipt.to} (${t.receipt.rule})`);
  if (Array.isArray(c.candidates)) parts.push(`uncertain between ${c.candidates.join(" and ")}, the earliest taken`);
  if (c.calendar && c.calendar.status) parts.push(`calendar ${c.calendar.status}`);
  return parts.join("; ").replace(/[\r\n]+/g, " ").replace(/["\\]/g, "'").slice(0, 400);
}
