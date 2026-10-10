# answers (T41)

**Status** · session_01AYLXqGDu2yvQaZ7USf6Dv7 · depth 2 · COMPLETE · handled B5

## Completion (ANSWERS #7)

**Entry applied: T41-29** (R30; R19's sign-in arm; R31–R33; the reds of rule 4 (6) and (12)). The readings are J1 and J2, taken in B2 (K2482) and B3 (K2486). B4's CHANGE is applied: ai-use was merged, and the tranche merged in.
- **R30.**
  - `askAccount({member, project?, at?})` (`index.mjs`) calls `accountFor` with kind `ask` and the ask's project. It judges the account chosen by `useCheck` for its owner (`ownerOf`: `member:<id>`, `project:<id>` or `group`). It answers `{ok, account, owner}`, or the refusal unchanged. A limit it cannot judge is fail-closed `LIMITS_UNREADABLE`, and an unreadable account `ACCOUNT_UNREADABLE`, both with no row. It is in-plane and not in the ops map, because its answer carries the account's key.
  - `useCheck` is ai-use's own on the same host (`aiUseOf(host).useCheck`), unless the composition root or a test hands one in. It replaces `ceilingRefusal`.
  - R2 widened: `logRead` takes the grant's `use` (`ask` by default, `draft`, `standing`; `GRANT_USES`), fixed when its log opens. Each read and each rule answer under the grant drops the rows of projects that `credentials.projectsKeptAway({use})` names: the project's own bundle and every bundle it holds. Counts beside lists count none of them. Unreadable limits drop every project's rows (fail closed).
  - The B4 change named `countAskUsage`: answers never called it. An ask's usage is store-door's route (requirements, Uses), so there was nothing here to replace.
- **R19.**
  - Keep-away is read as `aiKeptAway({use: "standing"})`. `accountFor` is asked with kind `standing` and no project.
  - Credentials R56's `AI_USE_SWITCHED_OFF` maps to `{switch_off, switch}`, naming the account (`own` gives `member`, else `group` or `project`). R32's `STANDING_SWITCH_OFF` maps the same way.
  - `useCheck`'s refusal is `{condition: "limit", code: "AI_LIMIT_REACHED", translation}`. A check that cannot be read is `{limit, code: null}`.
  - The sign-in arm runs when its `standing` use is on: a grant and one model call. When the use is off: `{switch_off, member}`, no grant, no model call. Both ways are tested.
  - The standing run's read log reads under use `standing`.
- **R31.** Sentence kind `baseline`: `{baselines: [{value, rests_on, basis_kind, looked}], difference}`, as J2 5'. `BASIS_KINDS`, `LOOKED_STATES`.
- **R32.**
  - `VERDICT_WORDS`: the closed list (K2472), frozen and tested whole. It is matched as whole words in Civicsmith's own text (outside quotations and the cited quotes), the summary included. A percentage counts as a likelihood when "sure", "certain" or "confident" stands beside it.
  - Cause words are allowed only inside a quotation that is part of a read quote the sentence cites (J2 6'; rule items' quotes count too).
  - New rows C-135.14 `ANSWER_VERDICT_WORD` and C-135.15 `ANSWER_CAUSE_UNESTABLISHED`. They await promotion's stamp (rule 4 (2)).
- **R33.** `checkSentences(sentences, {cited, readLog, viewer?})` is in `sentences.mjs`, which imports only pure files: record-grammar `json.mjs`, calc-grammar `figures.mjs`, observation-log `vocabulary.mjs`, and this module's `checks.mjs` and `readlog.mjs`. That keeps it bundleable for case-checker (K2471). `readLog` is a ReadLog, or, offline, the list of objects read. `checkAnswer` judges through the same `judge`.
- **Reds cleared:** rule 4 (6) `standing.test.mjs`:122, :273 and rule 4 (12) :154, :183, :210. The tests now set switches through `accountUsesSet`.

**Deferred:** none.

**Found in other modules (REPORT J3):**
1. The plane's composition, `bio-plane/src/plane/store.mjs`:219, still hands `ceilingRefusal` (ai-runs' retired `aiUseCheck`). answers no longer reads it, and takes ai-use's `useCheck` on its own host, so it is dead wiring for T41-63 to drop. The plane's ask path (`plane/ask.mjs`:68, :119) and store-door (`dispatch.mjs`:278) may now call `answers.askAccount` (R30) in place of their own `accountFor` and ceiling (T41-63; store-door at L11). They should pass `use: "draft"` to `logRead` for a draft's reads.
2. Generated artifacts: the plane bundle (`bio-plane/dist/`) bundles answers, so it is stale (rule 4 (14)). `case-checker/program.mjs` is unaffected until case-checker imports `checkSentences` (T41 L8).
3. `reading-pipeline/index.mjs`:698 spells the paying owner `member:${member}` from the `member` it was handed. A stamp (`member:bob`) would make `member:member:bob`, so the owner should be built from the bare id. This is against ai-use R1's owner spelling; reading-pipeline's to judge.

**Tests and checks** (on `job/T41/answers` with `tranche/T41` @ cbdca49cd0 merged):
- answers: `node --test bio-plane/test/m/answers/*.test.mjs`: **57 pass, 0 fail**. New files: `accounts.test.mjs` (R30) and `sentences.test.mjs` (R31–R33). Each check has a negative control (K874).
- The users of answers were run on my branch and on `tranche/T41` alone, by test name:
  - case-checker, scheduler, affordances, notice-producers, op-declarations, answer-envelope, store-door, control-plane, plane, and `migrate-released`: 1014 tests, 960 pass, 54 fail on both. The same 54 by name: no red added, none cleared.
  - agent-worker: 12 tests, 10 pass, 2 fail on both, the same 2.
- From the process repository:
  - `node checks/format.mjs`: 0 failures.
  - `node checks/architecture.mjs answers`: 20 files, 65 imports, 0 failures.
  - `node checks/coverage.mjs answers`: 33 of 33 live ids named, 0 failures.
  - `node checks/ownership.mjs answers tranche/T41`: 12 files, 0 failures.

**Reading set:** measured at about 290 KB, under 300 KB, so I read all of it myself:
- the requirements, whole;
- every code and test file of the module, whole;
- the Purpose of each used module, and the services named: credentials R28, R32, R35, R55–R57, R60, and its `accountFor`, `aiKeptAway`, `projectsKeptAway` and `aiGrantMintStanding` code; ai-use R1 and R3, and its `useCheck`, `countAskUsage` and `aiLimitSet` code after B4; record-core R34; membership `inSight`;
- layer 6's row;
- case-checker R24 and case-disclosures R30.

**Final `uses`:** the current list without `ai-runs` (B3): record-grammar, jurisdictions, civil-time, calc-grammar, record-core, membership, credentials, content, entities, events, lines, observation-log, standards, duties, people, query-language, retrieval, calculations, ai-use.

Size (session_01AYLXqGDu2yvQaZ7USf6Dv7): test runs 21, module lines 1833

## J1 · QUESTION

My readings of R30, R19, R31–R33, on which I am building now (stop me only if one is wrong):

1. **R30, the ask's account.** `answers` has no ask entry today: the ask's `accountFor` is called by `plane/ask.mjs`:68, :119 and `store-door/dispatch.mjs`:278. I add `askAccount({member, project?, at?})` to answers: `accountFor({member, act: {kind: "ask", member, project?}})`, then `useCheck({owner, member, use: "ask", at})` for the account chosen (owner `member:<id>`, `project:<id>` or `group` from the answer's `level`); it answers `{ok: true, account, owner}` or the refusal unchanged (`AI_LIMIT_REACHED`, `AI_USE_SWITCHED_OFF`, `PROJECT_ACT_NOT_A_PARTICIPANT`, ...). A project the member has not joined is refused by credentials R56 itself; answers adds no check of its own. The plane and store-door calling it are their jobs (T41-63, L11).
2. **`useCheck` reaches answers as a dependency** handed in by the composition root (`deps.useCheck`, a function `({owner, member, use, at})`), replacing `ceilingRefusal`, since ai-use is a same-layer provider not yet merged. `member` is passed bare (`bob`), as `ceilingRefusal` was.
3. **R30's widening of R2.** A read log carries its grant's use (`ask` by default; `draft`; `standing` for R19's run), given to `logRead` as `use`. Each read removes rows naming a bundle whose project (`bundleInfo.project`, or the project bundle itself) is in `credentials.projectsKeptAway({use})`. When that answers `null` (unreadable), every row naming a project's bundle is removed (fail closed). Counts beside lists count none.
4. **R19.** Keep-away is read as `aiKeptAway({use: "standing"})`. `accountFor`'s `AI_USE_SWITCHED_OFF` (credentials R56, which now comes before R32) maps to `{condition: "switch_off", switch}`, where `switch` is `member` for `whose` `own`, else `group` or `project`. That clears rule 4 (6) and (12): the tests switch through `accountUsesSet`. R32's `STANDING_SWITCH_OFF` maps as before. A `useCheck` refusal gives `{condition: "limit", code: "AI_LIMIT_REACHED", translation}`, replacing `ceiling`.
5. **R31 `baseline`.** A sentence of kind `baseline` carries `baselines` and `difference` beside `{text, kind, support}`. Each baseline is `{value, rests_on, basis_kind, looked}`: `rests_on` names its support ids (`h<i>`/`r<i>`/`l<i>`, the sentence's own support); `looked` is `not_yet_looked_for`, or `{state: "looked_for_and_not_found", where}` with `where` naming the place looked. `difference` is null or a string. Any other shape, or a missing `basis_kind`, is `ANSWER_MALFORMED`. A baseline sentence then passes R4's checks over its support, as an `explain` does.
6. **R32.** The closed list is matched in the sentence's and the summary's text outside quotation marks and outside the quotes of the holdings and rule items it cites. A percentage reads as a likelihood when a likelihood word or "chance" stands next to it. A cause is a sentence of kind `explain` stating a causal link (`because`, `caused`, `due to`, `led to`, `as a result of`, `resulted in`, `owing to`). It is kept only when it cites a holding whose address the read log answered as a concluded finding (an object at that address with `concluded: true`, or a `state`/`status` of `concluded`) and the cause's words are within that holding's quote, or when the causal words are inside a quotation (a body's cause, shown quoted). Otherwise it is withheld as `ANSWER_CAUSE_UNESTABLISHED`. The two codes are new rows C-135.14 and .15.
7. **R33.** `checkSentences(sentences, {cited, readLog})` lives in a new pure file, `answers/sentences.mjs`, with no plane imports beyond record-grammar, calc-grammar and observation-log constants, so case-checker's program can bundle it (K2471). `cited` is `{holdings, rules, looks}` as in an answer. It answers `{ok: true, withheld}` (R4's entries) or `ANSWER_MALFORMED`, and never throws. `checkAnswer` runs through it.

Final `uses` (for BOB at merge): the current list unchanged (`ai-use` is already in it).

## J2 · QUESTION

Replaces J1's items 5 and 6 only; the rest of J1 stands as taken (K2482). While building, I narrowed these two. Unless you answer otherwise, I keep them:

5'. **R31 `looked`.** It is required, one of the two, for a baseline of basis `firsthand` or `as_recalled`. For basis `document` it is null: the document was found, so neither state applies. A document's baseline must rest on a holding (`rests_on` names an `h<i>` in its sentence's support). A baseline's own value is labelled by its basis, so R4's figure check exempts it: `firsthand`/`as_recalled` always, and `document` only when its value is within the quote of a holding it rests on. Every other figure in the sentence is checked as R4 states.
6'. **R32's cause.** No `concluded` marker is read. A cause word (`because`, `caused`, `due to`, `led to`, `as a result of`, `resulted in`, `owing to`, ...) is allowed only inside a quotation that is part of the quote of a holding the sentence cites and the read log answered. That covers both a concluded finding quoted and a body's own cause shown as theirs. A cause word in Civicsmith's own words, or inside a quotation not read, is withheld `ANSWER_CAUSE_UNESTABLISHED`, and its translation says "the cause is not established". Reason: "concluded" has no one field across the reads, and R32 says "only quoting", which this checks exactly.

Also, for my record: the final `uses` drops `ai-runs`. answers no longer reaches it, since the ceiling (`aiUseCheck`) is replaced by `ai-use.useCheck`. The rest of the list is unchanged.

## J3 · REPORT

**Found in other modules:**
1. The plane's composition, `bio-plane/src/plane/store.mjs`:219, still hands `ceilingRefusal` (ai-runs' retired `aiUseCheck`). answers no longer reads it, and takes ai-use's `useCheck` on its own host, so it is dead wiring for T41-63 to drop. The plane's ask path (`plane/ask.mjs`:68, :119) and store-door (`dispatch.mjs`:278) may now call `answers.askAccount` (R30) in place of their own `accountFor` and ceiling (T41-63; store-door at L11). They should pass `use: "draft"` to `logRead` for a draft's reads.
2. Generated artifacts: the plane bundle (`bio-plane/dist/`) bundles answers, so it is stale (rule 4 (14)). `case-checker/program.mjs` is unaffected until case-checker imports `checkSentences` (T41 L8).
3. `reading-pipeline/index.mjs`:698 spells the paying owner `member:${member}` from the `member` it was handed. A stamp (`member:bob`) would make `member:member:bob`, so the owner should be built from the bare id. This is against ai-use R1's owner spelling; reading-pipeline's to judge.

## J4 · COMPLETE

T41-29 complete, B4 applied. The record's Completion section has the details.
- R30: `askAccount`; `useCheck` is ai-use's own on the host by default, replacing `ceilingRefusal`; R2 widened by the grant's use.
- R19: kind `standing`; `AI_USE_SWITCHED_OFF` maps to `switch_off`, and the limit to `limit`; the sign-in arm is tested both ways.
- R31–R33: `baseline`, the closed verdict list, causes allowed only quoted, and `checkSentences` in the pure `sentences.mjs`.

Results:
- Rule 4 (6) and (12) are cleared.
- answers: 57/57.
- The users' suites are identical to the tranche alone by test name (54 and 2 failing on both; none added).
- Format, architecture and ownership: 0 failures. Coverage: 33/33.
- Final `uses`: the current list without `ai-runs`.
- Generated artifact: the plane bundle is stale (J3).
