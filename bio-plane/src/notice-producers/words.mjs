/* notice-producers' words (R16, R17; DEC-188 (6), (7); DEC-189 (2), (5)–(7); N856; DEC-191 (3), DEC-192 (3), (5); N869, N876): every sentence and every fill this
 * module's AI-account and investigation items say, each read by key from the design stream's `words.json`
 * (`docs/development/ux-substrate/screens/words.json`), its `en` verbatim. No sentence or fill is written here. A key the
 * words file lacks, or an `en` that differs, fails this module's test (`words.test.mjs`), never a fallback sentence.
 * `{placeholders}` are filled by `index.mjs` from its sources' own facts. */
export const NOTICE_WORDS = Object.freeze({
  /* R16: the AI accounts' three items and the Ask's act (DEC-188 (6); DEC-189 (5), (6)) */
  "ai.queue.limitreached": "{account} reached its {period} limit for {use} on {date}. It pauses {use} until {when}; its other uses go on.",
  "ai.queue.limitreached.overall": "{account} reached its {period} limit on {date}. Uses counted in its overall limit pause until {when}; uses with their own limit on top of it go on.",
  "ai.queue.limitreached.member": "{account}: a member reached the {period} amount each member may use, on {date}. Their uses on it pause until {when}; other members' go on.",
  "ai.queue.suspended": "Your sign-in no longer serves {project}: a second member joined, and a sign-in serves a project only while it has one member. Members' acts there now use their own accounts, or the group's key.",
  "ai.queue.exploreask": "The assistant found something worth exploring in {scope} today: {what}. Explore it today on {account}? If nobody says yes today, it doesn't.",
  "act.exploreapprove.label.queue": "Let the assistant explore today",
  /* R16: their fills */
  "ai.account.group": "Your group's key",
  "ai.account.project": "{project}'s account",
  "ai.account.own": "Your own account",
  "ai.account.group.inline": "your group's key",
  "ai.account.project.inline": "the project's account",
  "ai.account.own.inline": "your own account",
  "ai.scope.group": "your group's work",
  "ai.scope.own": "your own questions",
  "ai.period.day": "daily",
  "ai.period.month": "monthly",
  /* R16 (DEC-192 (5)): `{when}` after "until" in `ai.queue.limitreached*` (the refusals' `ai.when.*` are ai-use's) */
  "ai.until.day": "tomorrow",
  "ai.until.month": "1 {month}",
  "ai.use.ask.inline": "asking",
  "ai.use.draft.inline": "drafting",
  "ai.use.run.inline": "runs",
  "ai.use.standing.inline": "standing questions",
  "ai.use.transcribe.inline": "reading page pictures",
  "ai.use.explore.inline": "exploring",
  "ai.use.suggestions.inline": "suggestions",
  "ai.use.enquire.inline": "interviews and planning",
  "ai.use.read.inline": "reading inside documents",
  "ai.use.account.inline": "a case's account",
  /* R16, R17 (DEC-191 (3), DEC-192 (3)): a local day in a sentence, with its year only when not in the current local year */
  "date.daymonth": "{day} {month}",
  "date.daymonthyear": "{day} {month} {year}",
  "date.month.january": "January",
  "date.month.february": "February",
  "date.month.march": "March",
  "date.month.april": "April",
  "date.month.may": "May",
  "date.month.june": "June",
  "date.month.july": "July",
  "date.month.august": "August",
  "date.month.september": "September",
  "date.month.october": "October",
  "date.month.november": "November",
  "date.month.december": "December",
  /* R17: the explored label (DEC-189 (7); D64) and its {owner} for the group */
  "ai.label.explored": "Machine work · found while exploring · enabled by {owner}",
  "ai.label.explored.member": "Machine work · found while exploring",
  "ai.owner.group": "the group",
  /* R17: the ten kinds' summary and detail (DEC-189 (2)) */
  "queue.question-find.summary": "Found while looking into {question}: {what}",
  "queue.question-find.detail": "The assistant found this while looking into a question you can see. It is a lead, not evidence: it becomes evidence only if a member opens it, checks it and cites the source.",
  "queue.step-later-found.summary": "Found later: {what}",
  "queue.step-later-found.detail": "You looked for this on {date} and didn't find it; it has since arrived. Your earlier look stays as it was, dated. Open the step to say whether this changes what it shows for each question.",
  "queue.step-date-due.summary": "Past its date: {step}",
  "queue.step-date-due.detail": "You set {date} for this step, and it isn't done. Only you are told. Finish it, move the date, or end it with a reason.",
  "queue.step-reminder.summary": "Your reminder: {step}",
  "queue.step-reminder.detail": "You asked to be reminded about this step today. Only you are told.",
  "queue.step-cost-shared.summary": "Shared work: {step}",
  "queue.step-cost-shared.detail": "This step's costs ({totals}) serve questions that {projects} each draw on. Its owners are told, so they can talk about sharing the cost; Civicsmith records no split and no payment.",
  "queue.step-cost-message.summary": "A message about the cost of {step}",
  "queue.step-cost-message.detail": "{member}, an owner of another project that draws on this step, wrote: “{text}”",
  "queue.milestone-overdue.summary": "Overdue: {milestone}",
  "queue.milestone-overdue.detail": "This milestone was due on {date}. Everyone who joined the project is told once.",
  "queue.milestone-reminder.summary": "Your reminder: {milestone}",
  "queue.milestone-reminder.detail": "You asked to be reminded about this milestone today. Only you are told.",
  "queue.project-quiet.summary": "Quiet: {project}",
  "queue.project-quiet.detail": "Nothing has moved in this project for a while. Where it stands: {progress}. You can write it up and act, keep watching its sources, close it with what remains unknown, or revise what it set out to show. Nobody is asked again until it moves.",
  "queue.review-comment-left-out.summary": "Your comments were not included: {case}",
  "queue.review-comment-left-out.detail": "The case was published without your review comments. You may file a response in its docket, as anyone may.",
});

/** The sentence of `key`, its `{name}` placeholders filled from `fills` (a placeholder with no fill is left as it is).
 *  A key this module does not hold throws: its item is then its provider's failure (R1), never a fallback sentence. */
export function wordsOf(key, fills = {}) {
  const en = NOTICE_WORDS[key];
  if (typeof en !== "string") throw new Error(`notice-producers: no words for ${key}`);
  return en.replace(/\{([A-Za-z_]+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(fills, k) && fills[k] !== null && fills[k] !== undefined ? String(fills[k]) : m));
}

/** Whether `key` is one of this module's words (a use with no `ai.use.<use>.inline` key, J1 (3)). */
export const hasWords = (key) => typeof NOTICE_WORDS[key] === "string";

const MONTHS = Object.freeze(["january", "february", "march", "april", "may", "june", "july", "august", "september", "october",
  "november", "december"]);
/** The name of month `m` (1–12), from `date.month.*`; null for no month. */
export function monthName(m) {
  return Number.isInteger(m) && m >= 1 && m <= 12 ? wordsOf(`date.month.${MONTHS[m - 1]}`) : null;
}
const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
/** A local day `YYYY-MM-DD` as a sentence names it (R16's and R17's `{date}`; DEC-191 (3), DEC-192 (3)): `date.daymonth`,
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
