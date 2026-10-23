/* queue-producers' words (R43; DEC-329 (10), N1231, K3766, K3806; DEC-335): every sentence an item says and every date or
 * time inside one is read by key through `setup-words` (`word`, `hasWord`), which holds the design stream's `words.json`.
 * No sentence is written here. A key the list lacks fails (the feed that raised it is then named, R45), never a fallback
 * sentence. A fill given as null, undefined or empty is filled with nothing, and the blank it leaves in the sentence is
 * closed up (a doubled space, a space before a stop) so that one absent fact never leaves a gap in the item. */
import { word, hasWord } from "../setup-words/index.mjs";
import { localDay, localClock, isCalendarDate } from "../civil-time/index.mjs";

/** The sentence of `key` (R11), each `{name}` filled from `fills`; a blank fill leaves nothing. */
export function say(key, fills = {}) {
  if (!hasWord(key)) throw new Error(`queue-producers: no words for ${key}`);
  const vars = Object.fromEntries(Object.entries(fills ?? {}).map(([k, v]) => [k, v === null || v === undefined ? "" : v]));
  return tidy(word(key, vars));
}

/** A sentence with the blanks its empty fills left closed: runs of spaces become one, no space stands before a stop. */
export function tidy(text) {
  return String(text).replace(/ {2,}/g, " ").replace(/ ([.,;:])/g, "$1").trim();
}

/** The sentences that exist, joined by a space: an optional fact's sentence is present only with the fact. */
export function joined(...parts) {
  return parts.filter((x) => typeof x === "string" && x !== "").join(" ");
}

/** Whether `key` is one the word list holds. */
export const holds = (key) => hasWord(key);

const MONTHS = Object.freeze(["january", "february", "march", "april", "may", "june", "july", "august", "september", "october",
  "november", "december"]);
const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

/** A local day `YYYY-MM-DD` as a sentence names it: `date.daymonth` (`{day}` with no leading zero, `{month}` from
 *  `date.month.*`), or `date.daymonthyear` when the day is not in the year of `today` (the current local day), or when no
 *  `today` is known. Empty for no day. */
export function dayText(day, today = null) {
  const x = typeof day === "string" ? DAY.exec(day) : null;
  const m = x ? Number(x[2]) : 0;
  if (!x || m < 1 || m > 12) return "";
  const t = typeof today === "string" ? DAY.exec(today) : null;
  const fills = { day: String(Number(x[3])), month: say(`date.month.${MONTHS[m - 1]}`), year: x[1] };
  return say(t && t[1] === x[1] ? "date.daymonth" : "date.daymonthyear", fills);
}

/** The local day of a value a provider states: a calendar day as it stands; an instant (or a date-time the clock can read)
 *  as its local day in `zone` through civil-time, the UTC day when no zone is held (a sentence's date, never an age or a
 *  comparison, R36). Null when it is neither. */
export function localDayOf(value, zone = null) {
  if (typeof value !== "string" || value === "") return null;
  if (isCalendarDate(value)) return value;
  if (!INSTANT.test(value)) return null;
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return null;
  try {
    const d = localDay(new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z"), zone || "UTC");
    return typeof d === "string" ? d : null;
  } catch { return null; }
}

/** The 12-hour clock of `time.clock` (DEC-335) for an hour 0–23 and a minute 0–59. */
export function clockText(hour, minute) {
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return "";
  return say("time.clock", { hour: String(hour % 12 === 0 ? 12 : hour % 12), minute: String(minute).padStart(2, "0"),
                             ampm: say(hour < 12 ? "time.am" : "time.pm") });
}

/** `publish-schedule` R4's stored `HH:MM` as the clock the member reads; empty when it is not one. */
export function clockOfStored(hhmm) {
  const x = typeof hhmm === "string" ? /^(\d{2}):(\d{2})$/.exec(hhmm) : null;
  return x ? clockText(Number(x[1]), Number(x[2])) : "";
}

/** An instant the plane stamped as `time.at` ("{date}, {time}") in `zone`, the UTC when none is held; empty when it is no
 *  instant. `today` is the current local day, which decides whether the year is named. */
export function instantText(value, zone, today) {
  const day = localDayOf(value, zone);
  if (!day || isCalendarDate(value)) return "";
  const c = (() => { try { const r = localClock(new Date(Date.parse(value)).toISOString().replace(/\.\d{3}Z$/, "Z"), zone || "UTC"); return r; } catch { return null; } })();
  const time = c && Number.isInteger(c.hour) ? clockText(c.hour, c.minute) : "";
  return day && time ? say("time.at", { date: dayText(day, today), time }) : "";
}

/** `time.at` for a date and a stored `HH:MM` as set, in the group's zone, never converted (R37); empty when either is unreadable. */
export function setText(date, hhmm, today) {
  const time = clockOfStored(hhmm);
  return isCalendarDate(date) && time ? say("time.at", { date: dayText(date, today), time }) : "";
}

/** A code another module states, read through its word `queue.fill.<kind>.<code>` (DEC-359): a grade lower-cased with its underscores
 *  closed up (content's `NOT_FOUND` is the row `notfound`); empty when the list holds no word for the code, so a code with no
 *  key is never written into a sentence. */
export function fillWord(kind, code) {
  if (typeof code !== "string" || code === "") return "";
  const key = `queue.fill.${kind}.${kind === "grade" ? code.toLowerCase().replace(/_/g, "") : code}`;
  return /^[A-Za-z0-9_-]+$/.test(code) && hasWord(key) ? say(key) : "";
}

/** A docket read's recorded reason: `queue.fill.reason.<code>`, and `queue.fill.reason.http` with `{status}` for `http_<n>`. */
export function reasonWord(reason) {
  const http = typeof reason === "string" ? /^http_(\d{3})$/.exec(reason) : null;
  if (http) return say("queue.fill.reason.http", { status: http[1] });
  return fillWord("reason", reason);
}
