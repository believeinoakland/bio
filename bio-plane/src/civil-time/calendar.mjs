/* civil-time: which days are closed, from the jurisdiction view alone (R9, R16, R27, R28). Nothing local is held
 * here: the weekend, the closure lists and their offices, and each entry's status on this instance (through the
 * caller's `factOf`) all come from the arguments. A missing fact is never read as an open day, a closed day or a
 * zero: it makes the answer that needs it undetermined, with why. */
import { civil, dayText, weekdayOf, parseDay } from "./days.mjs";
import { word, localize } from "../setup-words/index.mjs";

const no = (code, why) => ({ undetermined: true, code, why });

/** The conflicts of the view about one fact (`jurisdictions` R15: a fact profiles disagree on is withheld). */
export function conflictsAbout(view, key) {
  const cs = view && Array.isArray(view.conflicts) ? view.conflicts : [];
  return cs.filter((c) => c && typeof c.at === "string" && (c.at === key || c.at.startsWith(`${key}.`) || c.at.startsWith(`${key}[`)));
}

/** Why a fact the count needs is absent: withheld as a conflict, or not held. */
export function missing(view, key, words) {
  const c = conflictsAbout(view, key);
  if (c.length) return no("FACT_WITHHELD", `${words} is withheld: the active profiles disagree on it (${c.map((x) => x.at).join(", ")})`);
  return no("FACT_ABSENT", `${words} is not held by the jurisdiction view`);
}

const officeWords = (o) => (o === null || o === undefined ? "every office" : typeof o === "string" ? o : o && o.venue ? word("civil-time.venue", { venue: String(o.venue) }) : String(o));
function namesOffice(entry, office) {
  if (!Array.isArray(entry.offices)) return true;
  if (office === null || office === undefined) return false;
  return entry.offices.some((o) => (typeof o === "string" ? o === office
    : !!(o && typeof o === "object" && office && typeof office === "object" && o.venue === office.venue)));
}

/* R9, R16 (N603; local-facts R2, R3): the days of a member's correction that governs on this instance, else null. A
 * correction governs until a later act, and a later `confirm` confirms it, so it is counted on whenever the answer says
 * the governing value is a correction (`corrected: true`), whatever the status reads now, as well as while the status
 * reads `corrected`. The value is the entry's days, or the entry itself with its days. */
function governingCorrection(f) {
  if (!f || (f.status !== "corrected" && f.corrected !== true)) return null;
  if (Array.isArray(f.value)) return f.value;
  if (f.value && typeof f.value === "object" && Array.isArray(f.value.days)) return f.value.days;
  return null;
}

/**
 * A calendar: `closedOn(n)` answers whether local day `n` is closed, `{closed, why}`, or undetermined. `list` names
 * the closure list (R47) a rule counts on; null takes the office calendar (the entries with no `list`). `tolled` days
 * are reported apart by the counter, not here. `read` collects, once per entry, what `factOf` said of it (R16, R25).
 */
export function calendar({ view, list = null, office = null, factOf = null }) {
  const holidays = view && Array.isArray(view.holidays) ? view.holidays : [];
  const selected = holidays.filter((h) => h && (list ? h.list === list : h.list === undefined || h.list === null) && namesOffice(h, office));
  const weekend = view && view.weekend && Array.isArray(view.weekend.days) ? new Set(view.weekend.days) : null;
  const readable = typeof factOf === "function";
  const read = [];
  const years = new Map();
  const listWords = list ? word("civil-time.closure_list", { list: String(list) }) : word("civil-time.office_calendar");
  const listHeld = !list || holidays.some((h) => h && h.list === list);

  function year(y) {
    if (years.has(y)) return years.get(y);
    let out;
    const entries = selected.filter((h) => Number(h.year) === y);
    if (!listHeld) out = missing(view, "holidays", word("civil-time.rule_names", { list_words: String(listWords) }));
    else if (!entries.length) {
      const c = conflictsAbout(view, "holidays").filter((x) => x.at.includes(String(y)));
      out = c.length ? no("FACT_WITHHELD", `${listWords} for ${y} is withheld: the active profiles disagree on it`)
        : no("CALENDAR_UNCOVERED", `the count reaches ${y}, a year ${listWords} does not cover for ${officeWords(office)}`);
    } else {
      const days = new Map();
      for (const h of entries) {
        let f = null;
        if (readable) { try { f = factOf(h) || { status: "absent", why: word("action-clocks.why.reader_gave_answer") }; } catch { f = { status: "absent", why: word("civil-time.why.reader_failed") }; } }
        const governs = governingCorrection(f);
        read.push({ year: y, list: h.list ?? null, offices: Array.isArray(h.offices) ? h.offices : null, basis: h.basis ?? null,
                    status: f ? f.status : "not_read", ...(f && f.why ? { why: f.why } : {}),
                    ...(f && f.status === "corrected" ? { corrected_by: f.by ?? null, corrected_at: f.at ?? null } : {}),
                    ...(governs ? { governs: "correction", ...(typeof f.says === "string" ? { says: f.says } : {}) } : {}) });
        if (f && (f.status === "disputed" || f.status === "absent")) {
          const at = { list_words: String(listWords), year: String(y), offices: Array.isArray(h.offices) ? ` (${h.offices.map(officeWords).join(", ")})` : "" };
          out = no(f.status === "disputed" ? "FACT_DISPUTED" : "FACT_ABSENT",
            f.status === "disputed" ? localize("civil-time.calendar.disputed", "{list_words} for {year}{offices} is disputed in your team's Civicsmith", at)
              : f.why ? localize("civil-time.calendar.cannot_read_why", "{list_words} for {year}{offices} cannot be read in your team's Civicsmith: {why}", { ...at, why: String(f.why) })
                : localize("civil-time.calendar.cannot_read", "{list_words} for {year}{offices} cannot be read in your team's Civicsmith", at));
          break;
        }
        const list2 = governs || h.days;
        for (const d of list2 || []) {
          const n = d && parseDay(d.date);
          if (n !== null && n !== undefined) days.set(n, d.name || "a closure day");
        }
      }
      if (!out) out = { days };
    }
    years.set(y, out);
    return out;
  }

  function closedOn(n) {
    if (!weekend) return missing(view, "weekend", "the weekend");
    const wd = weekdayOf(n);
    if (weekend.has(wd)) return { closed: true, why: `weekend (${wd})` };
    const y = year(civil(n).y);
    if (y.undetermined) return y;
    if (y.days.has(n)) return { closed: true, why: `${y.days.get(n)} (${list || "office calendar"})` };
    return { closed: false };
  }

  return { closedOn, read, list, office, describe: listWords, readable };
}

/** What the trace says of the calendar's entries (R25; `action-clocks` R10's statement). */
export function calendarStated(cal) {
  const notes = [];
  for (const r of cal.read) {
    if (r.status === "unconfirmed") notes.push(word("civil-time.counted_unconfirmed_calendar", { basis: String(r.basis ?? localize("civil-time.calendar.no_source_stated", "no source stated")), year: String(r.year) }));
    if (r.governs === "correction" && r.status !== "corrected")
      notes.push(word("civil-time.counted_correction_governs", { status: String(r.status), says: String(r.says ? ` (${r.says})` : ""), year: String(r.year) }));
    if (r.status === "corrected") notes.push(word("civil-time.counted_calendar_corrected", { corrected_by: String(r.corrected_by ? ` by ${r.corrected_by}` : ""), corrected_at: String(r.corrected_at ? `, ${r.corrected_at}` : ""), year: String(r.year) }));
  }
  return { list: cal.list, office: cal.office ?? null, entries: cal.read, status: cal.readable ? (cal.read.length ? "read" : "none_read") : "not_read", notes };
}

export { dayText };
