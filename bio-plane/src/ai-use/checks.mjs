/* ai-use's own refusal rows (R8; DEC-49, K6, K231): every code this module mints carries its row here, its member-facing
 * sentence read by key from the design stream's `words.json` (R13; DEC-188 (7)), never a copy written here. Family C-143 (K2480),
 * a new family for this new module (K2373 B11: each code the next free number of its module's family at the job's
 * START), awaiting promotion's stamp (T41). `AI_LIMIT_REACHED` replaces `run-rules`' retired C-109.8 and C-109.9
 * (`AI_USE_CEILING_REACHED`, `AI_USE_COPY_CEILING_REACHED`) and `AI_LIMIT_INVALID` its C-109.12 (`AI_CEILING_INVALID`),
 * their numbers never reused (run-rules R20). `AI_RUN_CONSUME_INVALID` (C-22.13) and `NOT_YOUR_CEILING` (C-109.11) are
 * run-rules' rows, read there by key. Each row's `where` names its one site in `index.mjs`. Tested in
 * `test/m/ai-use/`. */

const at = (fn, region) => `src/ai-use/index.mjs ${fn} > ${region}`;

/* R13 (DEC-188 (7)): the words of `words.json` (`docs/development/ux-substrate/screens/words.json`) this module's refusals
   and its Ask item read, each `en` verbatim, by key. `{whose}` is filled from `ai.whose.*` (R13); every other
   placeholder (`{period}`, `{use}`, `{when}`, `{field}`, `{scope}`, `{what}`, `{account}`) is left for the screen, with
   the fields that fill it carried beside the sentence. A key the words file lacks fails this module's test. */
export const AI_USE_WORDS = Object.freeze({
  'ai.whose.group': 'your group\'s',
  'ai.whose.project': 'this project\'s',
  'ai.whose.own': 'your own',
  'ai.refused.limit': 'The assistant stopped here: {whose} {period} limit for {use} is reached. It works again {when}. '
    + 'Everything else works as usual.',
  'ai.refused.limit.overall': 'The assistant stopped here: {whose} {period} limit is reached. It works again {when}. '
    + 'Everything else works as usual.',
  'ai.refused.limit.member': 'The assistant stopped here: you have used the {period} amount each member may use of '
    + '{whose} account. It works again {when}. Everything else works as usual.',
  'ai.refused.limitinvalid': 'That limit can\'t be set: {field}. A limit is a positive amount in dollars, tokens or calls, '
    + 'for a day or a month.',
  'ai.refused.unitunavailable': 'A limit in dollars needs an API key: a subscription doesn\'t report what a use costs. Set '
    + 'it in tokens or calls instead.',
  'ai.refused.explorenotenabled': 'Exploring is off on {whose} account, or has no limit of its own yet: it runs only '
    + 'within an exploring limit its owners set.',
  'ai.queue.exploreask': 'The assistant found something worth exploring in {scope} today: {what}. Explore it today on '
    + '{account}? If nobody says yes today, it doesn\'t.',
});

/* R13: the key each refusal reads, `AI_LIMIT_REACHED` by its scope. */
export const LIMIT_WORD_BY_SCOPE = Object.freeze({ overall: 'ai.refused.limit.overall', per_member: 'ai.refused.limit.member' });
export const WHOSE_WORD = Object.freeze({ group: 'ai.whose.group', project: 'ai.whose.project', own: 'ai.whose.own' });

export const AI_USE_CHECKS = Object.freeze({
  /* R3 (D38 C, D39; B3, B5, B7): a limit of the paying account is reached for the current period: its own use's, its
     overall one (over the uses that are not exclusive), or its per-member one. Carries `whose` (`group`, `project` or
     `own`), `scope` and `period`, and names no cost (K1450). The row's sentence is the use-scope one; the answer reads
     the one for its scope (R13). */
  AI_LIMIT_REACHED: {
    check: 'C-143.1',
    where: at('#limitReached', 'is-ai-limit-reached'),
    translation: AI_USE_WORDS['ai.refused.limit'],
  },
  /* R2: a limit as set is not one: the owner, scope, unit, period, amount or inclusive flag is outside R2's, named. */
  AI_LIMIT_INVALID: {
    check: 'C-143.2',
    where: at('#invalid', 'is-ai-limit-invalid'),
    translation: AI_USE_WORDS['ai.refused.limitinvalid'],
  },
  /* R2 (B4; fact 3): a dollar limit on an account served by a sign-in, which reports no cost. */
  LIMIT_UNIT_UNAVAILABLE: {
    check: 'C-143.3',
    where: at('aiLimitSet', 'is-limit-unit-unavailable'),
    translation: AI_USE_WORDS['ai.refused.unitunavailable'],
  },
  /* R3, R6, R9 (A5, B6; K2350, K2400): exploring is `no` on the account that would pay for it. */
  EXPLORE_NOT_ENABLED: {
    check: 'C-143.4',
    where: at('#exploreOff', 'is-explore-not-enabled'),
    translation: AI_USE_WORDS['ai.refused.explorenotenabled'],
  },
  /* R6 (B6): the question lies outside what the owner may explore: the group's, a question of the record; a
     project's, a question it draws on (`connections.citesInto`); a member's, none yet (D36 open). Named by this job's
     J1 (5), K2480; no `words.json` key exists for it, so its sentence is this row's own. */
  EXPLORE_OUT_OF_SCOPE: {
    check: 'C-143.5',
    where: at('exploreAllowed', 'is-explore-out-of-scope'),
    translation: 'The assistant can\'t explore this question on this account: it lies outside what the account\'s owners '
      + 'explore.',
  },
  /* R9: an exploring ask or approval that names no day or no thing worth exploring. Named by this job's J2, K2486; no
     `words.json` key exists for it. */
  EXPLORE_ASK_INVALID: {
    check: 'C-143.6',
    where: at('#askFault', 'is-explore-ask-invalid'),
    translation: 'Nothing was recorded: an ask to explore names the day and what is worth exploring that day.',
  },
});
