/* action-producers' keyed sentences (R1; v0.2 rule 6; the plan's "Owed to UX"): a missed date's summary is read by key, so
 * the words a member reads for each basis are one table. `queue.action-clock-overdue.noreply` is canon's own question
 * (`BIO_Action_v0_2.md` §4 rule 6: "Noticed: no reply recorded by 25 Oct"). `.ours` and `.theirs` are the design stream's
 * and not yet given (no key in `words.json`): the sentences below hold their place, saying neither "overdue" nor
 * "violation" nor that a date is a legal one, until that stream's words replace them. `{placeholders}` are filled by
 * `index.mjs` from the clock entry's own facts. */
export const ACTION_WORDS = Object.freeze({
  "queue.action-clock-overdue.noreply": "Noticed: no reply recorded by {date}",
  "queue.action-clock-overdue.ours": "Our own date has passed: {text}, {date}",
  "queue.action-clock-overdue.theirs": "A date the other side stated has passed: {text}, {date}",
});

/** The keys whose words are the design stream's and are held here only until it gives them. */
export const WORDS_OWED = Object.freeze(["queue.action-clock-overdue.ours", "queue.action-clock-overdue.theirs"]);

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
