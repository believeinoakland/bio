# Draft: T43 requirement text for N856, N859, N862 (DEC-189, DEC-190)

Sources: DEC-189, DEC-190 and `ux-substrate/screens/words.json` on PR #23; U149, U152; B123–B132; the four modules' requirements; ai-use `checks.mjs` on T42. Next free ids: ai-use R14, notice-producers R18, extraction R73, plane R39. All text below is written as amendments appended to the existing requirements, so no new id is needed.

## N856: ai-use, notice-producers (DEC-189)

**(a)** ai-use R3 and R13 amended. notice-producers R16 and R17 amended.

**(b)**
- ai-use **R3**, append: (T43; N856; DEC-189 (5)) When the limit cannot be judged (the counter cannot be read, or the use is not a `USE_KINDS` entry), the refusal is still `AI_LIMIT_REACHED`, but it carries `unjudged: true` and no `scope`, `unit` or `period`, because nothing was reached. *(not yet met: T43)*
- ai-use **R13**, append: (T43; N856; DEC-189 (1), (5); B123 (1)) Every placeholder is filled by key, and this module writes no fill of its own:
  - `{period}` from `ai.period.day|month`;
  - `{when}` from `ai.when.day`, or from `ai.when.month` with `{month}` (the next period's month) from `date.month.<month>`;
  - `{use}` inside a sentence from `ai.use.<use>.inline`, and `{Use}` at a sentence's start from `ai.use.<use>.name`;
  - `{field}` from `ai.limitfield.<field>`;
  - R3's unjudged refusal from `ai.refused.limit.unjudged`, with `{whose}` only.

  Each entry of `AI_USE_WORDS` equals its `words.json` `en` verbatim, `ai.refused.explorenotenabled` included ("Exploring is off on {whose} account. Its owners can switch it on."). A test fails on any difference. *(not yet met: T43)*
- notice-producers **R16**, append: (T43; N856; DEC-189 (5), (6)) The "Noticed" item for a reached limit reads its sentence by the limit's scope:
  - `ai.queue.limitreached` for a use;
  - `ai.queue.limitreached.overall` for the overall limit;
  - `ai.queue.limitreached.member` for the per-member limit.

  Its fills:
  - `{account}` from `ai.account.group|project|own` (`{project}` the project's name);
  - `{period}` from `ai.period.*`;
  - `{use}` from `ai.use.<use>.inline`;
  - `{when}` from `ai.when.*` with `date.month.*`;
  - `{date}` the local day `reached_at` falls on.

  The Ask item fills `{scope}` from `ai.scope.group` or `ai.scope.own`, or the project's name for a project account, and `{account}` from `ai.account.<kind>.inline`. No sentence or fill is written here. A key the file lacks fails the test. *(not yet met: T43)*
- notice-producers **R17**, append: (T43; N856; DEC-189 (2), (7)) Each kind's `summary` and `detail` are read by key, `queue.<kind>.summary` and `queue.<kind>.detail`, for all ten kinds. Their placeholders are filled from the source's own facts. A find made while exploring carries `ai.label.explored` (with `{owner}`) only for the paying account's owners. Every other viewer gets `ai.label.explored.member`, which names no account and no person. This replaces "the words other members see are the design stream's (NOTICE)". A key the file lacks fails the test. *(not yet met: T43)*

**(c) Keys, verbatim from DEC-189's owed line and (5)–(7).**
- ai-use reads: `ai.period.day`, `ai.period.month`, `ai.when.day`, `ai.when.month`, `date.month.*` (january … december), `ai.limitfield.owner|scope|unit|period|amount|inclusive|use|count`, `ai.refused.limit.unjudged`, `ai.use.*.inline`, and the B123 wording of `ai.refused.explorenotenabled`.
- notice-producers reads: `ai.queue.limitreached`, `ai.queue.limitreached.overall`, `ai.queue.limitreached.member`, `ai.account.group|project|own` and their `.inline` forms, `ai.use.*.inline`, `ai.scope.group`, `ai.scope.own`, `ai.label.explored.member`, and `queue.<kind>.summary|detail` for these kinds: question-find, step-later-found, step-date-due, step-reminder, step-cost-shared, step-cost-message, milestone-overdue, milestone-reminder, project-quiet, review-comment-left-out.

**(d) Doubts.**
1. **`ai.use.*` keys are missing for three uses.** `words.json` has `ai.use.*` keys for ask, draft, run, standing, transcribe, explore and `suggestions`. It has none for `enquire`, `read` and `account`, which are in `credentials` R55's `USE_KINDS`. It also has a `suggestions` key, but `suggestions` is not a use kind. My best reading: R13's "a key the file lacks fails the test" covers only the uses that can reach a refusal in T43. BOB asks the design stream for the three missing keys in the NOTICE proposed under N859.
2. **`{date}` has no format key.** Only month names are keyed. My best reading: the local day, written with its month named from `date.month.*`. Worth asking about in the same NOTICE.
3. **ai-use's Terms are stale.** They still list five `USE_KINDS`. Fix them with N862 (below).

**Doable once PR #23 is on main:** yes, apart from doubt 1, which affects only uses with no AI path in T43 (N842).

## N859: ai-use R8, R13 (`EXPLORE_OUT_OF_SCOPE`, `EXPLORE_ASK_INVALID`)

**(a)** ai-use R8 and R13 amended.

**(b)**
- ai-use **R8**, append: (T43; N859; K2650) Its codes also include `EXPLORE_OUT_OF_SCOPE` (C-143.5, R6) and `EXPLORE_ASK_INVALID` (C-143.6, R9). Each has its row in `checks.mjs` and a test. *(not yet met: T43)*
- ai-use **R13**, append: (T43; N859) `EXPLORE_OUT_OF_SCOPE` is read as `<key: the design stream's>` and `EXPLORE_ASK_INVALID` as `<key: the design stream's>`. Neither row keeps a sentence of its own. *(not yet met: T43)*

**(c) Keys:** none exist. DEC-189 does not name them, and `words.json` on PR #23 has no key for either code. Its only explore refusal is `ai.refused.explorenotenabled`.

**(d) Doubt: the keys are missing.** N859's hard reason says "the keys are the design stream's: a NOTICE asks for them", but no such NOTICE has been sent. B123–B132 do not mention C-143.5 or C-143.6. Best reading: BOB sends that NOTICE now. It could propose, for the design stream to accept or change:
- `ai.refused.exploreoutofscope`, starting from today's row: "The assistant can't explore this question on this account: it lies outside what the account's owners explore.";
- `ai.refused.exploreaskinvalid`, starting from "Nothing was recorded: an ask to explore names the day and what is worth exploring that day.".

The same NOTICE can ask for N856's missing use keys and the `{date}` format.

**Doable once PR #23 is on main:** no. This entry has a second hard reason: the keys have not been given. It waits for a DEC answering that NOTICE.

## N862: extraction, plane, the Document read, ai-use (DEC-190)

**(a)**
- extraction R47 and R71 amended, and R27 amended. R27 is `readingFor`, `op=reading`, which is the read that answers a document's reading. No requirement uses the phrase "the Document read".
- plane R24 amended. This is the screens registry: the `bundle` entry, "The document", lists neither `pagetranscribe` nor `transcribe`.
- ai-use Terms and R13 amended.
- plane R36 is unchanged. Its AI path already answers each reason as given, and those reasons become `{why}`.

**(b)**
- extraction **R47**, append: (T43; N862; DEC-190 (2)) C-51.7's translation is `transcribe.refused.notdeployed`, read by key and verbatim. It replaces BOB's draft. It names no account. *(not yet met: T43)*
- extraction **R71**, append: (T43; N862; DEC-190 (2)) The answer's `transcription.label` is `transcribe.label`, read by key, in place of "the AI's reading". The answer also carries `says`, one sentence read by key:
  - `transcribe.done` when pages were filled and written;
  - `transcribe.none` when nothing was filled, with `{why}` the reason as answered.

  In both, `{pages}` is the pages asked for, in ascending order. A key the file lacks fails the test. *(not yet met: T43)*
- extraction **R27**, append: (T43; N862; DEC-190 (1), (2)) For a PDF reading, the answer carries `unread_pages`: the pages its reading could not make out, in ascending order. These are the pages that hold no glyph after every tier, which are the pages `tier4Pages` would ask for. It is `[]` when there are none and absent for a reading with no pages (R45: absent, empty and null stay three facts). When the list is non-empty, the answer also carries `unread_says`, which is `document.unread.pages` read by key with `{pages}` filled. Both are withheld with the bundle. *(not yet met: T43)*
- plane **R24**, append: (T43; N862; DEC-190 (1)) The `bundle` screen's `acts` gain `reading`, `pagetranscribe` and `transcribe`. *(not yet met: T43)*
- ai-use **Terms**: "a use is a `credentials.USE_KINDS` entry, its R55's nine". **R13**, append: (T43; N862; DEC-190 (3)) `{use}` for `transcribe` reads `ai.use.transcribe.name` and `ai.use.transcribe.inline`. *(not yet met: T43)*

**(c) Keys, verbatim from DEC-190 (2), (3).** `transcribe.refused.notdeployed`, `transcribe.label`, `transcribe.done`, `transcribe.none`, `document.unread.pages`, `ai.use.transcribe.name`, `ai.use.transcribe.inline`. The act help, `act.owed_pagetranscribe.does` and `act.transcribe.does`, belongs to the design stream's registry, which re-points the act once the op is served. It is not a module requirement.

**(d) Doubts.**
1. **`transcribe.none` does not fit every outcome.** It says "The assistant read pages {pages} …", but several `why` values mean no page was ever sent: `AGENT_WORKER_UNBOUND`, `EVIDENCE_ABSENT` and `NO_PAGE_RENDERED` (plane R36). An account or limit refusal also arrives as `aiNote` (N853). Best reading:
   - use `transcribe.none` only when `agent-worker` was asked and filled nothing;
   - answer a relayed refusal with its own translation (with N853);
   - fill `{why}` with the reason's catalogue sentence where it has one.

   Codes with no member sentence still need keys, so ask in the NOTICE proposed under N859.
2. **The format of `{pages}` is not given.** The mock writes "7 to 9" and "7–9". Best reading: ascending page numbers, with runs joined. The design stream's call.
3. **The unread sentence may belong to the screen.** `document.unread.pages` is noted as "the Document screen's section". The alternative is that R27 answers only `unread_pages` and the interface fills the sentence. I recommend carrying both, so that the key test guards the sentence.
4. **Only the Document read is covered.** The DEC owes "the Document read". I read that as `op=reading`. If the new interface's Document screen reads through some other op, the clause moves there.

**Doable once PR #23 is on main:** yes, provided T42-29 and T42-30 merge (`op=pagetranscribe` served). Doubt 1's keys for the no-post reasons can follow later without blocking.
