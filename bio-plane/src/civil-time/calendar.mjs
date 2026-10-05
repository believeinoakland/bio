/* civil-time: which days are closed, from the jurisdiction view alone (R9, R16, R27, R28). Nothing local is held
 * here: the weekend, the closure lists and their offices, and each entry's status on this instance (through the
 * caller's `factOf`) all come from the arguments. A missing fact is never read as an open day, a closed day or a
 * zero: it makes the answer that needs it undetermined, with why. */
import { civil, dayText, weekdayOf, parseDay } from "./days.mjs";

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

const officeWords = (o) => (o === null || o === undefined ? "every office" : typeof o === "string" ? o : o && o.venue ? `the venue of ${o.venue}` : String(o));
function namesOffice(entry, office) {
  if (!Array.isArray(entry.offices)) return true;
  if (office === null || office === undefined) return false;
  return entry.offices.some((o) => (typeof o === "string" ? o === office
    : !!(o && typeof o === "object" && office && typeof office === "object" && o.venue === office.venue)));
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
  const listWords = list ? `the closure list '${list}'` : "the office calendar";
  const listHeld = !list || holidays.some((h) => h && h.list === list);

  function year(y) {
    if (years.has(y)) return years.get(y);
    let out;
    const entries = selected.filter((h) => Number(h.year) === y);
    if (!listHeld) out = missing(view, "holidays", `${listWords}, which the rule names,`);
    else if (!entries.length) {
      const c = conflictsAbout(view, "holidays").filter((x) => x.at.includes(String(y)));
      out = c.length ? no("FACT_WITHHELD", `${listWords} for ${y} is withheld: the active profiles disagree on it`)
        : no("CALENDAR_UNCOVERED", `the count reaches ${y}, a year ${listWords} does not cover for ${officeWords(office)}`);
    } else {
      const days = new Map();
      for (const h of entries) {
        let f = null;
        if (readable) { try { f = factOf(h) || { status: "absent", why: "the reader gave no answer" }; } catch { f = { status: "absent", why: "the reader failed" }; } }
        read.push({ year: y, list: h.list ?? null, offices: Array.isArray(h.offices) ? h.offices : null, basis: h.basis ?? null,
                    status: f ? f.status : "not_read", ...(f && f.why ? { why: f.why } : {}),
                    ...(f && f.status === "corrected" ? { corrected_by: f.by ?? null, corrected_at: f.at ?? null } : {}) });
        if (f && (f.status === "disputed" || f.status === "absent")) {
          out = no(f.status === "disputed" ? "FACT_DISPUTED" : "FACT_ABSENT",
            `${listWords} for ${y}${Array.isArray(h.offices) ? ` (${h.offices.map(officeWords).join(", ")})` : ""} `
            + (f.status === "disputed" ? "is disputed on this instance" : `cannot be read on this instance${f.why ? `: ${f.why}` : ""}`));
          break;
        }
        const list2 = f && f.status === "corrected" && Array.isArray(f.value) ? f.value : h.days;
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
    if (r.status === "unconfirmed") notes.push(`counted on an unconfirmed calendar (${r.basis ?? "no source stated"}, ${r.year})`);
    if (r.status === "corrected") notes.push(`counted on a calendar corrected on this instance${r.corrected_by ? ` by ${r.corrected_by}` : ""}${r.corrected_at ? `, ${r.corrected_at}` : ""} (${r.year})`);
  }
  return { list: cal.list, office: cal.office ?? null, entries: cal.read, status: cal.readable ? (cal.read.length ? "read" : "none_read") : "not_read", notes };
}

export { dayText };
