/* notice-producers' words (R16, R17, R20, R23; DEC-198 (3), N889; DEC-188 (6), (7); DEC-189 (2), (5)–(7); N856; DEC-191 (3), DEC-192 (3), (5); N869, N876;
 * N1133, K3393, K3366): every sentence and every fill this module says is read by key through `setup-words` (`word`, `hasWord`), which holds the design
 * stream's `words.json` (`docs/development/ux-substrate/screens/words.json`) verbatim. No sentence is copied here (R23 retired the copies). A key the
 * word list lacks fails, never a fallback sentence. `{placeholders}` are filled by `index.mjs` from its sources' own facts. R12's item keeps its plain sentence. */
import { word, hasWord } from "../setup-words/index.mjs";

/** The sentence of `key` from setup-words (R11), each `{name}` filled from `fills`. Every placeholder of the key must be given
 *  a fill (`word` throws WORD_VAR_MISSING otherwise); a fill given as null or undefined is filled with nothing, so one absent
 *  fact never drops a whole provider's items. A key the word list lacks throws: its item is then its provider's failure (R1),
 *  never a fallback sentence. */
export function wordsOf(key, fills = {}) {
  if (!hasWord(key)) throw new Error(`notice-producers: no words for ${key}`);
  const vars = Object.fromEntries(Object.entries(fills ?? {}).map(([k, v]) => [k, v === null || v === undefined ? "" : v]));
  return word(key, vars);
}

/** Whether `key` is one of the word list's keys (a use with no `ai.use.<use>.inline` key, J1 (3)). */
export const hasWords = (key) => hasWord(key);

const MONTHS = Object.freeze(["january", "february", "march", "april", "may", "june", "july", "august", "september", "october",
  "november", "december"]);
/** The name of month `m` (1–12), from `date.month.*`; null for no month. */
export function monthName(m) {
  return Number.isInteger(m) && m >= 1 && m <= 12 ? wordsOf(`date.month.${MONTHS[m - 1]}`) : null;
}
const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
/** A local day `YYYY-MM-DD` as a sentence names it (R16's, R17's and R20's `{date}`; DEC-191 (3), DEC-192 (3)): `date.daymonth`,
 *  `{day}` the day of the month with no leading zero and `{month}` from `date.month.*`; or `date.daymonthyear`, `{year}` in
 *  four digits, when the day is not in the year of `today` (the current local day, `YYYY-MM-DD`; a `today` that is no day
 *  names the year). Null for no day. */
export function dayInSentence(day, today) {
  const x = typeof day === "string" ? DAY.exec(day) : null;
  const month = x ? monthName(Number(x[2])) : null;
  if (!month) return null;
  const t = typeof today === "string" ? DAY.exec(today) : null;
  const fills = { day: String(Number(x[3])), month, year: x[1] };
  return wordsOf(t && t[1] === x[1] ? "date.daymonth" : "date.daymonthyear", fills);
}

/** R16's `{when}` after "until" (DEC-192 (5)): a day's limit `ai.until.day`; a month's `ai.until.month` with `{month}` the
 *  name of month `next` (1–12), the period after the one reached. Null for any other period or no month. */
export function untilWords(period, next) {
  if (period === "day") return wordsOf("ai.until.day");
  const name = period === "month" ? monthName(next) : null;
  return name ? wordsOf("ai.until.month", { month: name }) : null;
}
