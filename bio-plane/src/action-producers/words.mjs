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
  "queue.plan-review-due.summary": "Review due: {plan}",
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
});

/** The keys whose `en` differs from `words.json`'s by R23's own words (canon's question, unchanged). */
export const WORDS_CANON = Object.freeze(["queue.action-clock-overdue.noreply"]);

/** R23: the keyed sentences that keep this module's present text in T46, each returned to BOB; read by key once its
 *  words and the item agree. (`.ours.detail` and `plan-review-due.detail` lack a fact the item holds: J1.) */
export const KEPT = Object.freeze(["queue.action-clock-overdue.theirs.detail", "queue.plan-look-again.detail",
  "queue.litigation-hold.docket.detail", "queue.watch-keep-or-stop.detail (relied on)",
  "queue.action-clock-overdue.ours.detail", "queue.plan-review-due.detail"]);

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
  "November", "December"];

/** A local day in a sentence: "25 October", with its year only when it is not the year of `today` (a local day too). */
export function dayWords(day, today = null) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof day === "string" ? day : "");
  if (!m) return null;
  const said = `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]}`;
  return typeof today === "string" && today.slice(0, 4) === m[1] ? said : `${said} ${m[1]}`;
}

/** The sentence a key names, its `{placeholders}` filled from `fills` (an unfilled one is left out with its braces). */
export function say(key, fills = {}) {
  const t = ACTION_WORDS[key];
  if (typeof t !== "string") return null;
  return t.replace(/\{([a-z_]+)\}/g, (_, k) => (fills[k] === null || fills[k] === undefined ? "" : String(fills[k])));
}
