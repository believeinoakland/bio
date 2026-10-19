/* action-producers' keyed sentences (R1, R23–R25; v0.2 rule 6; DEC-194, N913). Each sentence this module puts to a member is
 * read through `word(key, vars)` (setup-words R11): its key is `words.json`'s, and its English is that row's `en`, held
 * there and not copied here. Canon's question (`queue.action-clock-overdue.noreply`) is the one exception: R23 keeps it
 * unchanged, so `say` holds its text apart by `localize` under its own id (`WORDS_CANON`, asked of BOB, J1). The sentences
 * R23 keeps in this module's present text (`KEPT`) live in `index.mjs` beside the item that answers them. `{placeholders}`
 * are filled by `index.mjs` from the item's own facts. */
import { word, localize } from "../setup-words/index.mjs";

/** The keys this module reads from `words.json` (R23–R25); the tests hold each one to the list. */
export const ACTION_KEYS = Object.freeze([
  "queue.action-clock-overdue.ours.summary", "queue.action-clock-overdue.ours.detail", "queue.action-clock-overdue.theirs.summary",
  "queue.member-left-items.summary", "queue.member-left-items.detail",
  "queue.watch-keep-or-stop.summary", "queue.watch-keep-or-stop.detail",
  "queue.plan-review-due.summary", "queue.plan-review-due.detail", "queue.plan-look-again.summary",
  "queue.litigation-hold.docket.summary",
  /* R11, R21, R23: the doors' labels, `door.<op>` */
  "door.actioncorrespond", "door.clockentrystate", "door.itemtakeup", "door.checkpointrecord", "door.escalationadvance",
  "door.escalationdecline", "door.reminderanswer", "door.actionhold", "door.watchanswer", "door.planreviewrecord",
  "door.planresume",
  /* R25: the unsent request's sentences and its registered acts' labels */
  "request-unsent.summary", "request-unsent.summary.mine", "request-unsent.detail", "request-unsent.detail.undated",
  "request-unsent.open", "act.queuesnooze.label.queue", "act.actionmove.label.queue",
  /* R24 (DEC-191, DEC-192, DEC-333): a local day in a sentence, its month by name */
  "date.daymonth", "date.daymonthyear",
  "date.month.january", "date.month.february", "date.month.march", "date.month.april", "date.month.may", "date.month.june",
  "date.month.july", "date.month.august", "date.month.september", "date.month.october", "date.month.november",
  "date.month.december",
]);

/** The keys whose sentence differs from `words.json`'s by R23's own words (canon's question, unchanged). */
export const WORDS_CANON = Object.freeze(["queue.action-clock-overdue.noreply"]);

/** R23, R24: the keyed sentences that keep this module's present text, each returned to BOB; read by key once its words
 *  and the item agree. R24 reads `.ours.detail` and `plan-review-due.detail` by key where the item holds every fact they
 *  name; they keep the present text only on the arms named (no office or venue held; a rhythm not one occurrence a
 *  period, or no day it counts since). */
export const KEPT = Object.freeze(["queue.action-clock-overdue.theirs.detail", "queue.plan-look-again.detail",
  "queue.litigation-hold.docket.detail", "queue.watch-keep-or-stop.detail (relied on)",
  "queue.action-clock-overdue.ours.detail (no venue held)", "queue.plan-review-due.detail (no rhythm in words, or no day since)"]);

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october",
  "november", "december"];

/** A local day in a sentence (R24; DEC-191, DEC-192): `date.daymonth` ("October 25"), or `date.daymonthyear` when it is
 *  not in the year of `today` (a local day too), the month by its `date.month.*` key. */
export function dayWords(day, today = null) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof day === "string" ? day : "");
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) return null;
  const fills = { day: Number(m[3]), month: say(`date.month.${MONTHS[Number(m[2]) - 1]}`), year: m[1] };
  return say(typeof today === "string" && today.slice(0, 4) === m[1] ? "date.daymonth" : "date.daymonthyear", fills);
}

/** The sentence a key names, its `{placeholders}` filled from `fills`; a null or absent value fills as "" (R23: an item
 *  lacking a fact leaves its placeholder empty). Unknown keys throw (setup-words' UNKNOWN_WORD). */
export function say(key, fills = {}) {
  const vars = Object.fromEntries(Object.entries(fills).map(([k, v]) => [k, v ?? ""]));
  if (key === WORDS_CANON[0]) return localize("action-producers.words.noreply_canon", "Noticed: no reply recorded by {date}", vars);
  return word(key, vars);
}
