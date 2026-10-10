/* notice-producers' words (R16, R17; DEC-188 (6), (7)): the design stream's sentences this module's AI-account and
 * exploring items read, each read by key from `words.json` (`docs/development/ux-substrate/screens/words.json`), its
 * `en` verbatim. A key the words file lacks, or an `en` that differs, fails this module's test (`accounts.test.mjs`),
 * never a fallback sentence. `{placeholders}` are filled by `index.mjs` (R16's fills; J1). */
export const NOTICE_WORDS = Object.freeze({
  "ai.queue.limitreached": "{account} reached its {period} limit{for_use} on {date}. {Uses} on it pause until {when}; its other uses go on.",
  "ai.queue.suspended": "Your sign-in no longer serves {project}: a second member joined, and a sign-in serves a project only while it "
    + "has one member. Members' acts there now use their own accounts, or the group's key.",
  "ai.queue.exploreask": "The assistant found something worth exploring in {scope} today: {what}. Explore it today on {account}? If "
    + "nobody says yes today, it doesn't.",
  "ai.label.explored": "Machine work · found while exploring · enabled by {owner}",
  "ai.owner.group": "the group",
  "ai.whose.group": "your group's",
  "ai.whose.own": "your own",
  "ai.use.ask.name": "Asking",
  "ai.use.draft.name": "Drafting",
  "ai.use.run.name": "Runs",
  "ai.use.standing.name": "Standing questions",
  "ai.use.explore.name": "Exploring",
  "ai.use.suggestions.name": "Suggestions",
  "act.owed_exploreapprove.label.queue": "Let the assistant explore today",
});

/** The sentence of `key`, its `{name}` placeholders filled from `fills` (a placeholder with no fill is left as it is). */
export function wordsOf(key, fills = {}) {
  const en = NOTICE_WORDS[key];
  if (typeof en !== "string") throw new Error(`notice-producers: no words for ${key}`);
  return en.replace(/\{([A-Za-z_]+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(fills, k) && fills[k] !== null && fills[k] !== undefined ? String(fills[k]) : m));
}
