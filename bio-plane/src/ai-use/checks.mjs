/* ai-use's own refusal rows (R8; DEC-49, K6, K231): every code this module mints carries its row here, its member-facing
 * sentence read by key from the design stream's `words.json` (R13; DEC-188 (7)), never a copy written here. Family C-143 (K2480),
 * a new family for this new module (K2373 B11: each code the next free number of its module's family at the job's
 * START), awaiting promotion's stamp (T41). `AI_LIMIT_REACHED` replaces `run-rules`' retired C-109.8 and C-109.9
 * (`AI_USE_CEILING_REACHED`, `AI_USE_COPY_CEILING_REACHED`) and `AI_LIMIT_INVALID` its C-109.12 (`AI_CEILING_INVALID`),
 * their numbers never reused (run-rules R20). `AI_RUN_CONSUME_INVALID` (C-22.13) and `NOT_YOUR_CEILING` (C-109.11) are
 * run-rules' rows, read there by key. Each row's `where` names its one site in `index.mjs`. Tested in
 * `test/m/ai-use/`. */

const at = (fn, region) => `src/ai-use/index.mjs ${fn} > ${region}`;

/* R13 (DEC-188 (7); T43, N856, N862: DEC-189, DEC-190; T44, N859, N869, N876: DEC-191, DEC-192): the words of
   `words.json` (`docs/development/ux-substrate/screens/words.json`) this module's refusals and its Ask item read, each `en`
   verbatim, by key, a test failing on any difference. A refusal reaches its member through every caller as it is
   answered (ai-runs' open and tick, answers' ask and standing relay it unchanged), so each refusal's sentence is answered
   whole, every placeholder filled by key and none by this module (K2514; DEC-189 (1)): `{whose}` from `ai.whose.*`,
   `{use}` inside a sentence from `ai.use.<use>.inline` and `{Use}` at a sentence's start from `ai.use.<use>.name`, for
   all nine uses (DEC-191 (2)), `{period}` from `ai.period.*`, `{when}` from `ai.when.*` with `{month}` from
   `date.month.*` (`ai.until.*` is the queue item's, notice-producers'), `{field}` from `ai.limitfield.*`; R3's unjudged
   refusal reads `ai.refused.limit.unjudged`. Only the Ask item, a queue item `notice-producers` renders, leaves `{scope}`
   and `{account}` for the screen. `ai.use.suggestions` names a switch, not a use, and is not read here. */
export const AI_USE_WORDS = Object.freeze({
  'ai.use.ask.name': 'Asking',
  'ai.use.draft.name': 'Drafting',
  'ai.use.run.name': 'Runs',
  'ai.use.standing.name': 'Standing questions',
  'ai.use.explore.name': 'Exploring',
  'ai.use.enquire.name': 'Interviews and planning',
  'ai.use.read.name': 'Reading inside documents',
  'ai.use.transcribe.name': 'Reading page pictures',
  'ai.use.account.name': 'A case\'s account',
  'ai.use.ask.inline': 'asking',
  'ai.use.draft.inline': 'drafting',
  'ai.use.run.inline': 'runs',
  'ai.use.standing.inline': 'standing questions',
  'ai.use.explore.inline': 'exploring',
  'ai.use.enquire.inline': 'interviews and planning',
  'ai.use.read.inline': 'reading inside documents',
  'ai.use.transcribe.inline': 'reading page pictures',
  'ai.use.account.inline': 'a case\'s account',
  'ai.whose.group': 'your group\'s',
  'ai.whose.project': 'this project\'s',
  'ai.whose.own': 'your own',
  'ai.period.day': 'daily',
  'ai.period.month': 'monthly',
  'ai.when.day': 'tomorrow',
  'ai.when.month': 'on 1 {month}',
  'date.month.january': 'January',
  'date.month.february': 'February',
  'date.month.march': 'March',
  'date.month.april': 'April',
  'date.month.may': 'May',
  'date.month.june': 'June',
  'date.month.july': 'July',
  'date.month.august': 'August',
  'date.month.september': 'September',
  'date.month.october': 'October',
  'date.month.november': 'November',
  'date.month.december': 'December',
  'ai.refused.limit': 'The assistant stopped here: {whose} {period} limit for {use} is reached. It works again {when}. '
    + 'Everything else works as usual.',
  'ai.refused.limit.overall': 'The assistant stopped here: {whose} {period} limit is reached. It works again {when}. '
    + 'Everything else works as usual.',
  'ai.refused.limit.member': 'The assistant stopped here: you have used the {period} amount each member may use of '
    + '{whose} account. It works again {when}. Everything else works as usual.',
  'ai.refused.limit.unjudged': 'The assistant stopped here: Civicsmith couldn\'t check the use of {whose} account just '
    + 'now, and it spends nothing it can\'t count. Try again in a moment. Everything else works as usual.',
  'ai.refused.limitinvalid': 'That limit can\'t be set: {field}. A limit is a positive amount in dollars, tokens or calls, '
    + 'for a day or a month.',
  'ai.limitfield.owner': 'it doesn\'t say which account it is for',
  'ai.limitfield.scope': 'that isn\'t something a limit can cover',
  'ai.limitfield.unit': 'that isn\'t a unit a limit takes',
  'ai.limitfield.period': 'that isn\'t a period a limit takes',
  'ai.limitfield.amount': 'that isn\'t an amount a limit takes',
  'ai.limitfield.inclusive': 'only a limit on one use can be on top of the overall limit',
  'ai.limitfield.use': 'that isn\'t one of the assistant\'s uses',
  'ai.limitfield.count': 'the count is a whole number, one or more',
  'ai.refused.unitunavailable': 'A limit in dollars needs an API key: a subscription doesn\'t report what a use costs. Set '
    + 'it in tokens or calls instead.',
  'ai.refused.explorenotenabled': 'Exploring is off on {whose} account. Its owners can switch it on.',
  'ai.refused.exploreoutofscope': 'The assistant can\'t explore this question on {whose} account: it lies outside what '
    + 'the account\'s owners chose to explore.',
  'ai.refused.exploreaskinvalid': 'Nothing was recorded: an ask to explore names the day and what is worth exploring that '
    + 'day.',
  'ai.queue.exploreask': 'The assistant found something worth exploring in {scope} today: {what}. Explore it today on '
    + '{account}? If nobody says yes today, it doesn\'t.',
});

/* R13: the key each refusal and each fill reads. `AI_LIMIT_REACHED` by its scope (a use's own: `ai.refused.limit`), or
   `ai.refused.limit.unjudged` when R3 cannot judge it; `{whose}` by the account's kind; `{period}`, `{when}` by the
   limit's period; `{month}` by the next period's month (0 for January); `{field}` by the field R2 refuses. */
export const LIMIT_WORD_BY_SCOPE = Object.freeze({ overall: 'ai.refused.limit.overall', per_member: 'ai.refused.limit.member' });
export const UNJUDGED_WORD = 'ai.refused.limit.unjudged';
export const WHOSE_WORD = Object.freeze({ group: 'ai.whose.group', project: 'ai.whose.project', own: 'ai.whose.own' });
export const PERIOD_WORD = Object.freeze({ day: 'ai.period.day', month: 'ai.period.month' });
export const WHEN_WORD = Object.freeze({ day: 'ai.when.day', month: 'ai.when.month' });
export const MONTH_WORD = Object.freeze(['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december'].map((m) => `date.month.${m}`));
export const LIMIT_FIELD_WORD = Object.freeze(Object.fromEntries(['owner', 'scope', 'unit', 'period', 'amount', 'inclusive',
  'use', 'count'].map((f) => [f, `ai.limitfield.${f}`])));
export const useInlineWord = (use) => `ai.use.${use}.inline`;
export const useNameWord = (use) => `ai.use.${use}.name`;

/* R13: one sentence filled by key: each `{name}` of `fills` replaced by its value, as given, never read as a replacement
   pattern (a `$` in a member's own words, the Ask item's `{what}`, stays as written). A placeholder not in `fills` is
   left for the screen. */
export function fillWords(sentence, fills) {
  return Object.entries(fills).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), sentence);
}

export const AI_USE_CHECKS = Object.freeze({
  /* R3 (D38 C, D39; B3, B5, B7): a limit of the paying account is reached for the current period: its own use's, its
     overall one (over the uses that are not exclusive), or its per-member one. Carries `whose` (`group`, `project` or
     `own`), `scope` and `period`, and names no cost (K1450). (T43; DEC-189 (5)) When the limit cannot be judged, it
     carries `unjudged: true` and no `scope`, `unit` or `period`. The row's sentence is the use-scope one; the answer
     reads the one for its scope, or the unjudged one (R13). */
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
     J1 (5), K2480. (T44; N859, N869; DEC-191 (1)) Carries `whose` (`group`, `project` or `own`), as `AI_LIMIT_REACHED`
     does; its sentence is `ai.refused.exploreoutofscope`, the answer's `{whose}` filled from `ai.whose.*` (R13). */
  EXPLORE_OUT_OF_SCOPE: {
    check: 'C-143.5',
    where: at('#outOfScope', 'is-explore-out-of-scope'),
    translation: AI_USE_WORDS['ai.refused.exploreoutofscope'],
  },
  /* R9: an exploring ask or approval that names no day or no thing worth exploring. Named by this job's J2, K2486.
     (T44; N859, N869; DEC-191 (1)) Its sentence is `ai.refused.exploreaskinvalid`. */
  EXPLORE_ASK_INVALID: {
    check: 'C-143.6',
    where: at('#askFault', 'is-explore-ask-invalid'),
    translation: AI_USE_WORDS['ai.refused.exploreaskinvalid'],
  },
});
