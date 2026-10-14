/* action-producers' keyed sentences (R1, R23; v0.2 rule 6; DEC-194, N913). Each key below is `words.json`'s
 * (`docs/development/ux-substrate/screens/words.json`), its `en` held verbatim and read by key, as `membership`'s
 * `HANDLE_WORDS` and `extraction`'s `TRANSCRIBE_WORDS` are; the tests hold each equal to the list's. Two exceptions,
 * named: `queue.action-clock-overdue.noreply` keeps canon's own question (`BIO_Action_v0_2.md` §4 rule 6: "Noticed: no
 * reply recorded by 25 Oct"), R23's "unchanged" (asked of BOB, J1); and the sentences R23 keeps in this module's present
 * text (`KEPT`), each returned to BOB, live in `index.mjs` beside the item that answers them. `{placeholders}` are filled
 * by `index.mjs` from the item's own facts. */
export const ACTION_WORDS = Object.freeze({
  "queue.action-clock-overdue.noreply": "Noticed: no reply recorded by {date}",
  "queue.action-clock-overdue.ours.summary": "Our deadline passed: {what}",
  "queue.action-clock-overdue.theirs.summary": "The date they gave has passed: {what}",
  "queue.member-left-items.summary": "{member} left, with {n} dated items",
  "queue.member-left-items.detail": "{member} is no longer in {place}, and these were routed to them: {items}. Take up the ones you can.",
  "queue.watch-keep-or-stop.summary": "Keep watching {what}?",
  "queue.watch-keep-or-stop.detail": "{plan} has closed, or its promises are all met. Keep this watch until a date, or stop it now. You are asked once.",
  "queue.action-clock-overdue.ours.detail": "Your group's deadline to {what} with {venue} was {date}, and nothing is recorded as done. See what can still be done.",
  "queue.plan-review-due.summary": "Review due: {plan}",
  "queue.plan-review-due.detail": "Your group set {plan} to be reviewed every {rhythm}, and nothing has been reviewed since {date}. See what changed, then record the review.",
  "queue.plan-look-again.summary": "Look again at {plan}",
  "queue.litigation-hold.docket.summary": "A legal threat with no hold: {entry}",
  /* R11, R21, R23: the doors' labels, `door.<op>` */
  "door.actioncorrespond": "Record a reply",
  "door.clockentrystate": "Mark it met or waived",
  "door.itemtakeup": "Take this up",
  "door.checkpointrecord": "Record the checkpoint",
  "door.escalationadvance": "Advance the escalation",
  "door.escalationdecline": "Decline to escalate",
  "door.reminderanswer": "Answer the reminder",
  "door.actionhold": "Place a hold",
  "door.watchanswer": "Keep or stop",
  "door.planreviewrecord": "Record the review",
  "door.planresume": "Resume the plan",
  /* R25: the unsent request's two registered acts, labelled as the queue labels them */
  "act.queuesnooze.label.queue": "Snooze to a date",
  "act.actionmove.label.queue": "Drop an unsent request, with a reason",
  /* R24 (DEC-191, DEC-192): a local day in a sentence, its month by name */
  "date.daymonth": "{day} {month}",
  "date.daymonthyear": "{day} {month} {year}",
  "date.month.january": "January", "date.month.february": "February", "date.month.march": "March",
  "date.month.april": "April", "date.month.may": "May", "date.month.june": "June", "date.month.july": "July",
  "date.month.august": "August", "date.month.september": "September", "date.month.october": "October",
  "date.month.november": "November", "date.month.december": "December",
});

/** The keys whose `en` differs from `words.json`'s by R23's own words (canon's question, unchanged). */
export const WORDS_CANON = Object.freeze(["queue.action-clock-overdue.noreply"]);

/** R23, R24: the keyed sentences that keep this module's present text, each returned to BOB; read by key once its words
 *  and the item agree. R24 reads `.ours.detail` and `plan-review-due.detail` by key where the item holds every fact they
 *  name; they keep the present text only on the arms named (no office or venue held; a rhythm not one occurrence a
 *  period, or no day it counts since). */
export const KEPT = Object.freeze(["queue.action-clock-overdue.theirs.detail", "queue.plan-look-again.detail",
  "queue.litigation-hold.docket.detail", "queue.watch-keep-or-stop.detail (relied on)",
  "queue.action-clock-overdue.ours.detail (no venue held)", "queue.plan-review-due.detail (no rhythm in words, or no day since)"]);

/** R25: the unsent request's sentences, which `words.json` does not hold (no `queue.request-unsent.*` key): this module's
 *  own, after the design stream's drawing (DEC-212), returned to BOB; answered with no `summary_key` or `detail_key`. */
export const OWN_WORDS = Object.freeze({
  "request-unsent.summary.mine": "You left a request unsent: {what}",
  "request-unsent.summary": "A request was left unsent: {what}",
  "request-unsent.detail": "Approved on {date}, not yet sent: nothing has gone to the office. Pick up where you left off, "
    + "keep it for later, or drop it with a reason.",
  "request-unsent.detail.undated": "Approved, not yet sent: nothing has gone to the office. Pick up where you left off, "
    + "keep it for later, or drop it with a reason.",
  "request-unsent.open": "Pick up where you left off",
});

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october",
  "november", "december"];

/** A local day in a sentence (R24; DEC-191, DEC-192): `date.daymonth` ("25 October"), or `date.daymonthyear` when it is
 *  not in the year of `today` (a local day too), the month by its `date.month.*` key. */
export function dayWords(day, today = null) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof day === "string" ? day : "");
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) return null;
  const fills = { day: Number(m[3]), month: ACTION_WORDS[`date.month.${MONTHS[Number(m[2]) - 1]}`], year: m[1] };
  return say(typeof today === "string" && today.slice(0, 4) === m[1] ? "date.daymonth" : "date.daymonthyear", fills);
}

/** The sentence a key names, its `{placeholders}` filled from `fills` (an unfilled one is left out with its braces). */
export function say(key, fills = {}) {
  const t = ACTION_WORDS[key] ?? OWN_WORDS[key];
  if (typeof t !== "string") return null;
  return t.replace(/\{([a-z_]+)\}/g, (_, k) => (fills[k] === null || fills[k] === undefined ? "" : String(fills[k])));
}
