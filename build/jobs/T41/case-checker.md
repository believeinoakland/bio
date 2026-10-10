# case-checker (T41)

**Status** · session_0165W4ZKVnAtc4FUGvKYg4Xb · depth 2 · WORKING · handled B5

## J1 · QUESTION

My readings for R23 and R24, which I am building on now. Answer only where you would decide otherwise.

1. **R24 through `answers.checkSentences`.** Each account sentence goes to `checkSentences` as one sentence of kind `explain`, citing a holding `{address: ref, quote: text}` for each of its `cites` found in `cited`. The read log is the cited objects. Two codes map to arms: `ANSWER_CITES_UNREAD` becomes `ACCOUNT_SENTENCE_UNSUPPORTED`, and `ANSWER_FIGURE_UNSOURCED` becomes `ACCOUNT_FACT_NOT_IN_CITED`. A figure the sentence takes word for word from what it cites is passed marked as a quotation of it. The answers' voice codes (`ANSWER_VERDICT_WORD`, `ANSWER_CAUSE_UNESTABLISHED`) are the assistant's own voice (answers R32), not R30 arms, so they are not answered. `checkSentences` answers the voice first, so I pass the sentence with those words taken out; otherwise they would hide the two arms. Dates, names and quotations are not covered by `checkSentences`, so this module judges them as the rest of arm 2: an ISO or month-name date, a run of capitalised words, or a quoted passage that is not in the cited text.
2. **Shapes.** `cites` spellings: a finding id, a leg `<finding>#<ord>`, a passage's `content_id`, or a material's `ref` or `sha`. `cited` is `[{ref, text}]` (or a map from ref to text). `printed` lists the statement ids (`lens_statements` `id`, or its `bundle#id` key). `conclusions` is `[{finding, claim, claim_state, legs: [{ord, target, role}]}]`. Offline, R1 builds them from the signed document: a finding's text is its `case_conclusions` claim, a leg's text is its target and ground, a passage's is its `quoted`, a material's is its carried extracted text or observation text, and `printed` comes from `lensOf`. If case-grammar R23 spells the cites differently, I follow it at its CHANGE.
3. **Arm 3, mechanical.** A sentence is contradicted when (a) it cites a finding whose recorded claim is not adopted and states it as determined (established, found, concluded, determined, proved, shows that); (b) it cites a finding and states its adopted claim negated, or a negated claim un-negated; or (c) it cites a leg whose role is `cuts_against` with supporting words (supports, shows, confirms, proves, establishes, demonstrates) and no contrary words (against, contradicts, undermines, disputes, however, despite, but). Arm 5's "a finding's outcome" is (a)'s words or a cited finding's claim text.
4. **Order.** Every arm runs on every sentence and each departure is answered. Arm 2 is skipped when arm 1 fired, because there is nothing cited to compare. Arms 1 and 2 are not asked of a bias-marked sentence; its facts are arm 5's.
5. **R23 lens model.** `as_published` is R5's pair and comparison, unchanged. `removed` recomputes each finding from its legs with every published `grade_lowered` restored to `from`; an excluded leg or refused inference is carried in the facts and counts again. A reader's lens starts from that unbiased base and applies its own applications whose `statement` is among its `statements`: `grade_lowered` sets `to`, while `leg_excluded` and `inference_refused` drop the leg. Any other application is named under `not_applied`. A lens pair propagates to the inquiry legs that inherit it. Under a non-default lens, `pair` and `bar_met` are the lens's (with `as_published: {pair, bar_met}` and `lens_changes` beside them). `result`, `missing` and `differs` stay the as-published integrity check: a lens re-weighs and adds no `differs`. Every answer carries `lens` and the limit sentence.
6. **case-grammar R23 and R24** (`accountOf`, `biasApplicationsOf`) are not in the code yet. I read the two blocks with a local reader of R23's and R24's row shapes and switch to the services at case-grammar's CHANGE.

## Completion (CASE-CHECKER #10, T41-40)

**Entries applied.**
- **R14** (N798; DEC-185 (1); K2394): `spec.mjs`'s `/3` specification, section 4, now labels every photo copy: a marked photo's copy as obscured, an unmarked photo's copy as published (nothing covered), a member document's copy as cleaned. It names `obscured_marked` as what tells a marked copy from an unmarked one, read by the label when the field is absent. The old words "(an unmarked photo's copy has none)" are gone. Words only: the format is unchanged, and `/1` and `/2` are untouched.
- **R23** (D59; K2529, K2530): new `lens.mjs` (`LENS_LIMIT_STATEMENT`, `lensOfArg`, `applicationOf`, `pairsUnderLens`) and `reweigh({parts, documents, answer, lens})` in `check.mjs`, pure and synchronous, verifying no signature again.
  - `checkCaseFile` takes `lens` and its lens arm is `reweigh` over its own as-published answer.
  - The lenses work as J1 (5) proposed and K2530 confirmed: `as_published` is R5's pair; `removed` restores each published lowered grade to `from`; a reader's lens keeps the published applications whose statement it holds, reverses the rest, and applies its own (`grade_lowered` sets `to`; `leg_excluded` and `inference_refused` leave the leg out). A lens pair flows to the findings resting on it, and the change is named `through` that finding.
  - Under a non-default lens each finding answers `pair` and `bar_met` under that lens, plus `as_published` and `lens_changes`. The answer carries `lens` (`name`, `statements`, `departure`, `not_applied`) and `lens_statement`. A lens adds no `differs` entry.
  - The program takes `--lens as_published|removed|<file>`.
- **R24** (D56; K2471, K2528, K2531): new `account.mjs`, `checkAccount({account, cited, printed, conclusions})`, answering `{ok: true, departures: [{ord, code, detail}]}` or `{ok: false, reason: "MALFORMED", field}`. It runs through `answers.checkSentences`, imported from answers' pure `sentences.mjs`, and judges R30's five arms in order, as J1 (1)–(4) proposed and K2530 confirmed.
  - Cites are `{kind, ref, ord}` (K2528); `citeOf` gives a leg the key `<finding>#<ord>`.
  - R1 runs it offline (`accountUseOf`). Its inputs: each `case_conclusions:` claim, each leg's target, ground and role, each passage's `quoted`, each carried material's text, and `lensOf`'s printed statements. Each departure is a case `differs` entry with `check: "account"` and its `code`. A sentence citing material the case file lacks is not judged, is named, and is a case `missing` entry. The answer gains `account` (null with no block).
- `index.mjs` exports `checkAccount`, `ACCOUNT_CODES`, `reweigh`, `LENS_LIMIT_STATEMENT` and `LENS_NAMES`. The answer's top-level keys gain `account`, `lens` and `lens_statement`.

**Final `uses`** (for BOB at the merge): unchanged from `modules.json`. `answers` is now used, through `answers/sentences.mjs` (`checkSentences`, `VERDICT_WORDS`, `CAUSE_MARKERS`). `case-grammar`'s `lensOf` is used. `strength`'s `recomputePair` is used as before.

**Deferred.**
- `case-grammar` R23 and R24 (`accountOf`, `biasApplicationsOf`) are not on the tranche yet. This module reads `fm.account` and `fm.bias_applications` itself, in R23's and R24's row shapes (J1 (6), confirmed). It switches to those services at case-grammar's CHANGE.
- Arm 3's negation reading is mechanical. It catches a claim stated with a negation added or removed in the same words ("was approved" / "was not approved"), but not a rephrased verb ("approved" / "did not approve"). The model-based `account_check` flags remain `run-rules` R25's, which is not judged here.

**Found in other modules, and generated artifacts.**
- `bio-plane/src/case-checker/program.mjs` is stale (rule 4 (14)), so `program.test.mjs`'s two R13 tests are red until L8's close.
- I regenerated it locally to verify: 77 of 77 case-checker tests pass with it. The bundle grows from 662 KB to 695 KB with answers' `sentences.mjs`, and it holds no network call. I then restored the committed file.
- The plane bundle is staled too (it bundles `program.mjs`).
- Users' suites: case-import, case-disclosures, public-read, `plane/accepted`, `answers/sentences`, case-authoring (imported, standards), affordances, op-declarations, op-grades, signatures, control-plane and `answer-envelope/families` give 356 pass, 4 fail.
- The same 4 fail on the tranche branch without this change, so none is this job's: answer-envelope `families.test.mjs` (`CHECK_FAMILIES` total; C-120 .20–.22; C-141), and case-disclosures R22's `PHOTO_*` words.

**Reading (K2304, mechanics §17).** The set was over 300 KB, so I followed (3).
- **Read whole myself:** my requirements; layer 8's row; `check.mjs`, `spec.mjs`, `index.mjs`, `main.mjs`, `build-program.mjs`; `check.test.mjs`, `spec.test.mjs`, `fixture.mjs`; and the used services named: answers R4, R33 with `sentences.mjs`; strength R32 with `recomputePair`; case-grammar R9's `lensOf`, R12, R23, R24; case-disclosures R30; `inquiry-grammar` R18's effects.
- **Worker summary:** a worker read `standards.mjs`, `zip.mjs`, `standards.test.mjs`, `standards-offline.test.mjs` and `program.test.mjs` whole. Its summary is about 4 KB and cites file:line throughout.
- **What it changed:** its notes shaped two things. Whole-answer comparisons must hold under the default lens. R13's network-word scan covers answers' bundled code. Nothing it left out mattered.

**Tests and checks.**
- `node --test bio-plane/test/m/case-checker/`: 75 pass, 2 fail (the two stale-`program.mjs` R13 tests). With `program.mjs` regenerated: 77 pass, 0 fail.
- New suites: `account.test.mjs` (R24, 9 tests) and `lens.test.mjs` (R23, 6 tests); one more R14 test in `spec.test.mjs`. Mutation checks: disabling arm 4 failed 3 account tests; dropping R23's `from` restore failed 2 lens tests; dropping `reweigh`'s document fill failed 1.
- Process checks: `format`: 0 failures. `architecture case-checker`: 19 files, 77 imports, 0 failures. `coverage case-checker`: 24 of 24 ids, 0 failures. `ownership case-checker tranche/T41`: 0 failures.

**Size.** Module code is 2,067 lines without the generated `program.mjs`, against the plan's ~1,650 and under 4,000 (K617). Tests are 1,981 lines.

Size (session_0165W4ZKVnAtc4FUGvKYg4Xb): test runs 22, module lines 2067

## J2 · COMPLETE

T41-40 complete (record's Completion, commit 1e6424c11f): R14 /3 labels an unmarked photo's copy, with obscured_marked; R23 lens + reweigh (K2529), cites {kind, ref, ord} (K2528); R24 checkAccount in K2531's shape, run offline by R1. Case-checker tests 75/2: only the two R13 tests for the stale program.mjs (rule 4 (14)), 77/77 with it regenerated locally (not committed). Users' suites 356 pass, 4 fail, the same 4 fail on the tranche without this change. All four checks 0 failures. Uses unchanged. Module 2,067 lines. Switch to case-grammar accountOf/biasApplicationsOf awaits its CHANGE.
