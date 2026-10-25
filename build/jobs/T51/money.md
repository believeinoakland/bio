# money (T51)

**Status** · session_014aMgy6krydsoCbHAbQm7TM · depth 2 · COMPLETE · handled B11

## J1 · REPORT

Findings in other modules, seen by the checks run for money (not changed here, per P9; each is for its own module's job or for BOB):

- `contradiction` `bio-plane/src/contradiction/index.mjs:876`: inline sentence "{} candidate pair(s) were NOT formed because money's reconciliation..." (the words check, inline arm).
- `events` `bio-plane/src/events/index.mjs:109`: inline "a payer or payee lives on the money fact, never on an event" (inline, plain).
- `calculations` `bio-plane/test/m/calculations/money.test.mjs:99`: testcopy "only at a member's request" (code).
- `money-checks` `bio-plane/test/m/money-checks/run.test.mjs:167`: testcopy "no threshold stated" (its entry T51-199).
- `screens-investigate` `bio-plane/test/m/screens-investigate/money.test.mjs:58`: testcopy "phase or stage" (a words.json en; the test copies it).
- `affordances` `bio-plane/test/m/affordances/t33.test.mjs:57`: handlist of money's op names (moneyof, moneysummable, ...), K3268: a hand-list of another module's ops, assembled from that module's own declaration.
- Design list, for BOB: `docs/development/ux-substrate/screens/words-reads.json` lists money's refusal details as "never drawn by the shell" (DEC-258 (3)), with line numbers from before this job. R13 binds them, so this job read every money refusal detail through localize; the design may want its list updated.

One string left in source on purpose, for BOB to settle: `money/index.mjs` line 956, "events is not wired here, so no event the fact concerns is read", on the design's unkeyed list as a wiring diagnostic for builders (no member reaches it on a wired host). Every other sentence money reads is keyed.

## J2 · COMPLETE

Completion record, T51-198 (money, words). Layer 5, re-run R5. Model claude-haiku-5-5, medium effort. Commits on `job/T51/money`: `6ce8fb314c` (the change) and merge `97587a6881` (tranche/T51 merged in, B2 CHANGE and the rest of the tranche).

**Entries applied**
- Every member-facing sentence in `bio-plane/src/money/index.mjs` is now `localize('money.index.<slug>', en, vars)` with a fixed id (the first five words of the sentence; a second, different sentence with the same opening takes `_2`), or `word(key)` where the list already holds it (`money.push.phase_stage` for "phase or stage"). The six findings in `build/plan/words-pass/money.md` are all converted (inline 0). The 46 plain findings are converted (plain 0).
- Two sentences in one `localize` call that were built from `+` concatenation are one literal now, with their exact text.
- Refusal details, the `why` of undetermined answers, and the `says` texts that people read are all in localize or word; the sentences a test held as text are gone from tests (see the test list below).
- K3958: civil-time's undetermined `why` is a `{key, vars}`. Money relayed it as `String(why)` ("[object Object]") on the period's start and end refusals. Both now read the sentence through civil-time's `reasonText` and pass the reason on as given (`why` on the refusal). Connection-grammar's conformance battery (R16, `connections.test.mjs`) already passes.
- Test files changed, each sentence regex or copy now a `word(key)` comparison or a structural check: `found`, `refusals`, `record` (citation, `word("money.citation")`), `rules` (labels by `word`, the no-authority `says` checked as a string with the `unauthori` check kept), `sets` (`word("screen.money.proposed")`), `trail` (`word` for both undetermined whys).

**Deferred**: nothing. The one string left in source (line 956, a wiring diagnostic) is on the design's unkeyed list and is in the REPORT for BOB's decision.

**Other modules**: the REPORT posted with this record lists the findings the checks show in other modules' code and tests (contradiction, events, calculations, money-checks, screens-investigate, affordances). None changed here.

**Checks and tests, summary lines**
- `node bio-plane && node --test test/m/money/`: `ℹ tests 72 · ℹ pass 72 · ℹ fail 0` (four runs: before, after the product change, after the test edits, after the merge).
- `node checks/format.mjs /home/user/bio`: `format: 175 modules, 174 requirements files; 0 failures`.
- `node checks/architecture.mjs /home/user/bio money`: `architecture: 16 product files, 50 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `node checks/coverage.mjs /home/user/bio money`: `coverage: 1 modules, 26 of 26 live requirement ids named by a test; 0 failures`.
- `node checks/words.mjs /home/user/bio money`: `words: 1 modules, 2251 string literals read, 15346 words; inline 0, plain 0, testcopy 0, missingkey 0, handlist 0 (0 tagged ?), marker 0, dev 2, unkeyed 3; 0 failures`.
- `node checks/ownership.mjs /home/user/bio money tranche/T51 job/T51/money`: `ownership: 8 files changed by money between tranche/T51 and job/T51/money; 0 failures`.
- `node checks/run.mjs /home/user/bio` (full): the words arm reports findings in other modules only (see REPORT); none in money.
- `node bio-plane/src/setup-words/build.mjs --check`: a stale-rows note for `rows.mjs` (expected, BOB regenerates at the layer close); no refusal naming money.

**Size (session_01EALiSa4XrZJimPmaSkDTWA)**: test runs 4, module lines 1424

**Note**: one commit message (`6ce8fb314c`) carries a meaningless `Co-Authored-By: none` line I wrote in error; it is on the job branch and I did not rewrite it (the branch carries the merge on top).

## J3 · BLOCKED

NEEDS BOB. Cause: needs Bob.

My permission check refused `git push -u origin job/T51/money`, so the two product commits are local only: `6ce8fb314c` (money: member-facing sentences read through localize and word, T51-198) and the merge `97587a6881` (tranche/T51 merged in). The record commits are on origin (J1 REPORT, J2 COMPLETE, state COMPLETE), so the record is ahead of the code; I have set the state to NEEDS BOB.

Act needed: push the branch from /home/user/bio with `git push -u origin job/T51/money` (or give me the push permission and I push it, then post COMPLETE again). Nothing else is blocked: the money tests pass 72 of 72 and the checks in the COMPLETE record are clean.

## J4 · COMPLETE

Pushed. The product commits are on origin: `6ce8fb314c` (the change) and `97587a6881` (merge of tranche/T51) reached origin with the mail pushes; `git push origin HEAD:job/T51/money` reports up to date. This withdraws J3 BLOCKED. Nothing else changed: the record in J2 COMPLETE stands, with the same checks and the Size line `test runs 4, module lines 1424`.

## J5 · COMPLETE

Completion, T51 fix round 3, money #6 (session_013Lo8EBZnWAC7FpsjEcuWjd).

**Cause met: C8 + N1, money R28** (my part: the read). `moneySets({concerns, purpose?, limit, after, viewer}) → {ok: true, sets, limit, truncated, next}` (`op=moneysets`, served by the ops map and declared in `DECLARED_OPS` as a read, classes admin/member/probe, accepts concerns/purpose/limit/after, requires concerns). Sets whose `concerns` equal the id asked, newest first by creation (`at`, then insertion), each `{set_id, purpose, label, concerns, inclusions, exclusions}` with the facts the viewer may see; `purpose` narrows (`UNKNOWN_PURPOSE` otherwise); bounded 1–500 (default 100); `next` is the last set_id of a cut page and `after` continues from it (`BAD_AFTER` for an id not in the list). An id naming a bundle the viewer cannot see (a project, membership R43 through `#visibleBundle`) answers exactly as an id naming nothing: `{ok: true, sets: [], truncated: false, next: null}`, the id not echoed. No write change.

**The confirmation asked for:** a trail started in a project carries the project in its `concerns` if the caller passes it: `createSet` keeps one `concerns` string for a trail, with no kind check, so a project id is held as given (a write change is not needed). The screen that starts a trail must send `concerns=<project id>` (screens-investigate, wave 2). Nothing to ask BOB.

**Tests** (`bio-plane/test/m/money/moneysets.test.mjs`, 7 tests, all named R28, seen failing first with `moneySets is not a function`): four trails in one project listed newest first in the set's shape; another project's trail not listed; a hidden project lists none and equals an id naming nothing (also viewer ""); controls: a set with no concerns is listed under no id, `purpose: attribution` lists no trail on a project and does list the attribution set on its contract, `purpose: trail` on the contract lists none; bound, `truncated`, `next`, no repeat or gap across pages; read writes nothing and `readSet` and `createSet` unchanged; the ops-map arm and the declaration. `ops.test.mjs` line 8 gained `moneysets` in R18's list of arms (the arm count is the requirement; nothing weakened).

**Runs:** money 86/86; money-checks 48/48, duties 75/75, people 79/79, explore 59/59, query-language 57/57, retrieval-browse 51/51, retrieval 178/178, calculations 62/62, strength 177/177, op-grades 145/145, control-plane 340/340. Checks: architecture 0 failures; words 0 failures (money); coverage money 28 of 28 live ids named (0 failures); ownership 0 failures (4 files); format 1 failure, `build/rulings.md:4346` K4349 (BOB's file, not mine, red on the tranche tip). impact.mjs flags 90 modules because `DECLARED_OPS` is a shared table; I ran the direct users above, not all 1304 files.

**For BOB (REPORT, other modules, P9):**
1. `moneysets` has no spec yet: `op-declarations` (its spec for the op, and a NEEDS row of null for a read, R17–R20) and `op-grades` (a "read" row beside `moneyset`, t33.mjs line ~213) must add it. Until then two suites are red on my branch only because of the new op: `op-declarations` t33.test.mjs:290 (R19, R6: "money" lists `moneysets` as served with no spec) and `affordances` t33.test.mjs:195 (R12 R24: `moneysets` unaccounted). The rest of both suites pass.
2. `plane` release.test.mjs:78 (R24) fails "screen.objective.purpose is held by the words list": nothing of money's; not checked against the tranche tip, I believe it is red there (words list of the design stream).
3. Words: no new member-facing sentence on a drawn screen; the three new refusal details are `localize` ids (`money.index.money_sets_are_listed_by`, `…a_money_sets_purpose_is_2`, `…after_names_no_set_in`), so there is no word-table stand-in to list.
4. R28's text in `build/requirements/money.md` says "a set holds `concerns`"; the Terms still say `concerns?` is one entity or none and name events, entities and a line, not a project (RC-11 in fix-round-3-reqs.md). BOB to line the Terms up.

No proposed requirement lines beyond R28; the `limit` key in the answer (beside `sets`, `truncated`, `next`) is mine, add it to R28's shape if wanted.

Size (session_013Lo8EBZnWAC7FpsjEcuWjd): test runs 14, module lines 1478

## J6 · QUESTION

Fix round 4, cause C8-words (money R29), mid-job. Work committed locally as 15607d09e8 on job/T51/money (pushing with this post).

**Cause, four fields**
1. Root cause (certain): `bio-plane/src/money/index.mjs:238` and `:248` refused an unmapped fiscal key with `BAD_PERIOD`, the code `following` also answers; the translation is keyed by code, so money's real reason was hidden. Platform: N (pure code).
2. Test gap: each module tests only its own code; the census that no two modules share a code is not in place (see question A).
3. Failing-first: `bio-plane/test/m/money/refusal-codes.test.mjs` (R29 titles). Red before the change: `{fiscal:"FY2025-26", body:"Port Ellery Harbour District"}` and `{fiscal:"FY1999-00X", body:"Nobody"}` both answered `BAD_PERIOD`. Green after: both answer `MONEY_BAD_PERIOD`, detail names the fiscal key and body. Controls: a first day after a last day stays `BAD_PERIOD`; a valid fiscal key (`FY2013-14`) is accepted and writes a fact.
4. Platform: N.

Changed: `money/index.mjs` (two `refusal` codes), `money/test record.test.mjs` (two expectations moved to `MONEY_BAD_PERIOD` per R29). Money suite: 90 of 90 pass. Format, architecture, coverage (29 of 29 R-ids named), ownership: clean. `checks/run.mjs`: the words failures are on other modules' lines (op-grades t33, t51), not money's; I have not touched them.

**Question A (decides what I build next).** R29 says `BAD_PERIOD` "remains following's and civil-time's alone" and "a census test finds no code answered by two modules". Today money still answers `BAD_PERIOD` for its other period refusals (from/to, `index.mjs:226-263`, about ten sites), and `following` and `calculations` answer it too. Options:
- (a) Recommended: money's own period refusals (from/to too) move to `MONEY_BAD_PERIOD`, so money answers no `BAD_PERIOD`. The "refused as before" control stays a refusal; only its code changes. The calculations' use is calculations' to change; I will report it.
- (b) Keep from/to on `BAD_PERIOD`, and scope the census to codes money answers uniquely.
Also the census scope: a literal survey of refusal codes across `bio-plane/src` shows many codes answered by several modules, mostly shared act rows (record-grammar's `SHARED_ACT_CHECKS`, e.g. `NO_REASON` in eight modules). Recommended scope: codes not in `SHARED_ACT_CHECKS`. Please answer which of (a)/(b) and the census scope.

**Question B (words).** `refusal.MONEY_BAD_PERIOD` has no row in `docs/development/ux-substrate/screens/words.json` (DESIGN handoff ask 1). I have not invented a sentence. The refusal's `detail` carries the real reason through the existing money keys (`money.index.the_profiles_fiscal_year_for`, `money.index.the_active_profiles_hold_no`). Please have the design stream write the row, or tell me the stand-in key you want.

Impact: 90 modules use money; I am running their affected suites (1327 files) now and will report the counts in COMPLETE.

## J7 · QUESTION

Money fix round 4, after your ANSWER B5 (applied; commits 7dd51def43 and 2b5885dbb9 on job/T51/money, pushed).

**REPORT: a test of another module breaks on my change.** `bio-plane/test/m/intent/amount.test.mjs:119` asserts `row(bad, "ENT-1").amount.code === "BAD_PERIOD"`, a money period refusal. Under R29 (a) money now answers `MONEY_BAD_PERIOD`, so this assertion fails. I have not edited intent (P9). Its owner needs to move the expectation to `MONEY_BAD_PERIOD`, or intent's own code path needs to be checked. The same grep found `calculations/index.mjs` and `following` answering `BAD_PERIOD` for their own reasons: calculations' use is what your ANSWER asked me to report in COMPLETE.

**QUESTION C: the census clashes 16 money codes.** `bio-plane/test/m/money/refusal-census.test.mjs` (R29's census, red by name) finds 16 codes money answers that another module also answers, with the record-grammar shared rows excluded:
- NO_PERIOD (events, workbooks); BAD_RANGE (workbooks); UNKNOWN_BASIS (people); NO_STAGE (progressions); NO_SUCH_LINE (lines); QUESTION_NOT_HELD (events, people, standards); NO_METHOD (events); MACHINE_NEEDS_IDENTIFIERS (lines); LISTENER_FAILED (events); NO_REASON (consequences, events, lines, people, progressions, workbooks); NO_SHA (lines, people, workbooks); NO_LABEL (money-checks); NO_CONTRACT (money-checks); MEMBER_ACT_ONLY (events, money-checks, people); NO_SET (events, progressions); NO_BASIS (lines, progressions).

My recommendation: (1) the codes that are a shared act row in `record-grammar`'s `SHARED_ACT_CHECKS` (NO_REASON, NO_SHA, MEMBER_ACT_ONLY, and others that the table names) are excluded by design, but the census check reads the table by text, so please confirm which of these are in the table and I'll correct the exclusion; (2) for the rest, money keeps its own code by prefixing it `MONEY_` (renaming around 12 codes and their tests; no screen row is keyed to them yet, to my reading); (3) money-checks is a sibling module of money: its `NO_LABEL`, `NO_CONTRACT` and `MEMBER_ACT_ONLY` are its own to rename, and I will not change them. Please answer which way, and whether money-checks is in scope.

Until the answer, COMPLETE stays open. The census test is red by name, not silent.

Impact: 90 modules, 10,485 tests run on the earlier build (before the all-period change): 10,456 pass, 17 fail. The failures are in screens, plane, affordances, words, and tasks modules, plus the intent test above. I have not yet confirmed which of the 17 are on the tranche tip. I will re-run on the current build and name them.

## J8 · COMPLETE

COMPLETE, cause C8-words (money R29). Head: b6a11c41ff on job/T51/money (pushed). Merged tranche/T51 at 1b032f9d00.

**The cause, four fields**
1. Root cause (certain): `bio-plane/src/money/index.mjs` refused an unmapped fiscal key with `BAD_PERIOD`, the code `following` also answers, so the translation keyed by code hid money's reason (the fiscal key and the body). Per B5, every period refusal of money (from, to, fiscal) now goes through one `badPeriod` helper and answers `MONEY_BAD_PERIOD`; money answers no `BAD_PERIOD`. The stand-in sentence is `localize("refusal.MONEY_BAD_PERIOD", "That period is not one this team's money records can read.")`, the detail keeps the real reason.
2. Test gap: each module tested only its own code, so no test saw two modules answering one code. Added `bio-plane/test/m/money/refusal-census.test.mjs`: no money act answers `BAD_PERIOD` (the census narrowed per B6, K4444), with a control that the census sees `MONEY_BAD_PERIOD` on money alone.
3. Failing-first: `refusal-codes.test.mjs` (R29 titles). Red before: `{fiscal:"FY2025-26", body:"Port Ellery Harbour District"}` and `{fiscal:"FY1999-00X", body:"Nobody"}` both answered `BAD_PERIOD`. Green after: both answer `MONEY_BAD_PERIOD`, the detail names the key and body. Controls: a first day after a last day is refused (now `MONEY_BAD_PERIOD`, per B5); a valid fiscal key (`FY2013-14`) is accepted and writes a fact. The census was red first, with sixteen clashing codes (the broader reading, J7); it is green on the narrowed reading.
4. Platform: N (pure code).

**Requirement met:** R29 (money). R1 stands; R1's `BAD_PERIOD` remains following's and civil-time's.

**Suites**
- money: 92 of 92 pass (`bio-plane/test/m/money/*.test.mjs`).
- checks: format (175 modules, 0 failures); architecture (money, 0 failures); coverage (money, 29 of 29 ids named); ownership (money, 0 failures, 5 files).
- `checks/run.mjs` on the repo: the three words failures and the coverage/architecture reds are in other modules' files (op-grades t33, t51; case-authoring, acquisition, agent-harness, agent-runner, control-plane, installer-steps, interface-shell, journey-check, pdf-reader, public-read, screens-daily, screens-inquiry, screens-publish). None is in money's files.
- impact (`build/plan/impact.mjs origin/tranche/T51 HEAD`): 90 modules, 1,327 test files, run on the current build: 10,486 tests, 10,454 pass, 20 fail.

**Each red from the impact run**
- **Caused by my change (intent):** `bio-plane/test/m/intent/amount.test.mjs:119` (`R31 R4 a total summable refuses…`) expects `BAD_PERIOD` from money. Per B6, BOB fixes this at the merge (test file only). I have not touched intent.
- **Not money's, not yet confirmed on the tranche tip:** `journey-check/pseudo.test.mjs` (R29 (a)-(c), six tests, words); `filings/packet.test.mjs` (R30 and R9, claim deadline and calendar); `plane/store.test.mjs` (R9, the plane's route); `agent-worker/test/requirements.test.mjs` (a file-level failure, 60 s). I tried to run these on a tranche-tip worktree to compare, and that command was refused by the permission check, so I have not run them on the tip. I'm not claiming they are pre-existing. BOB or a tip run can settle each.
- Calculations: `calculations/index.mjs:167` is a comment still citing money R1's `BAD_PERIOD`. It is stale, not a code path. Report for calculations to update.

**Reported to BOB:** REPORT (intent test, J7); QUESTION C (census clash, answered by B6); the stand-in key `refusal.MONEY_BAD_PERIOD` awaits the design's row (words batch).

**Open:** none held by me. The intent test and the tip check for the four red files are BOB's to settle at the merge. No QUESTION is open.

**Size (session_016NRUKZLwLKyy8zbRsvcjbP): test runs 8, module lines 1482** (money's `bio-plane/src/money/*.mjs`, held code only).

## J9 · COMPLETE

COMPLETE, G55 tier 1 (money). Head: see the pushed branch job/T51/money; tranche/T51 merged in. Tier 2 not started (waits for BOB's word).

**Cause (R-FOUR).** 1. `Money#view()` (index.mjs, was :217) ran `jurisdictions.combine` on every `recordFact`/`moneyOf` period. 2. Missed: nothing counted builds; the gap is closed by `viewBuilds()` and the test. 3. Failing-first `test/m/money/g55-view.test.mjs`, seen red (500 facts built the view 500 times), green now (at most 1). 4. Platform: L belongs to calculations.

**Change.** `#view()` holds its last view with its key (JSON of the active-profiles list; null, non-list or unreadable keyed `[]`), re-reading the setting every call, deep-frozen, one private entry; `viewBuilds()` counts builds. No fact differs: a fact from the held view equals one from a fresh view field for field (test).

**Item 2 confirmed by test:** `recordFact` inside an outer `record.transact` commits and rolls back with it; a fact is written twice for one (table, row, binding) source (not idempotent). No money change for either.

**Proposed requirement text (BOB writes it at merge).** R30 (G55; K4562): "The module holds its last jurisdiction view, keyed by the active profiles' list as the setting reads on each call, deep-frozen, replaced when the key changes (one entry, about 145 KB); a null, non-list or unreadable setting is keyed as the empty list. `viewBuilds()` answers how many times this instance has built it. No fact, refusal or read differs." Uses: no new edge.

**Deferred / not tested:** the frozen view is private, so no test at the interface can try to mutate it; if BOB wants that tested, an accessor is a requirement change. Tier 2 (partial marker, `markIngest`) not started.

**Found in other modules:** none.

**Ran:** money 98 of 98 pass. Direct users (money-checks, duties, people, explore, query-language, retrieval-browse, retrieval, calculations, strength, contradiction, intent, corpus-export): 155 files, each run alone, every one `fail 0`. I did not run the full 1,441-file impact set; the change adds one method and alters no answer. Checks: format 0 failures; architecture 0; coverage 6686 of 6686; ownership money 0 (3 files); `checks/run.mjs`: words shows the inherited `case-checker/spec.mjs:11` inline 1 only, none in money. Declarations: no census op changed.

Size (session_01RUnq4fs9yS6fvUi9DZjnt9): test runs 160, module lines 1496

## J10 · COMPLETE

COMPLETE again, after B8 (CHANGE): merged tranche/T51 (entities' G55 tier 1 in) into job/T51/money, pushed. Money suite 98 of 98 pass; coverage 29 of 29; ownership 0 failures (3 files). Nothing in money waited on entities. Tier 1 stands as in J9; tier 2 still waits for BOB's word.

Size (session_01RUnq4fs9yS6fvUi9DZjnt9): test runs 162, module lines 1496

## J11 · COMPLETE

COMPLETE, G55 tier 2 (money), after B9 and B10. tranche/T51 merged; pushed.

**Built to B10's contract, spelled the same.** `markIngest(key, open)` is synchronous, joins the caller's transaction (tested: a throw after it leaves no marker and no fact), idempotent; refuses `NO_INGEST` for an empty or over-200-character key or a non-boolean. A table-row source accepts `ingest: <key>` (`SOURCE_FIELDS`); on any other source, or empty/over-long, `UNKNOWN_FIELD` (field `ingest`). `recordFact` stays synchronous. Facts store the key in new column `source_ingest` (added to existing stores by `migrate`); money owns table `money_ingests (ingest_key, open, opened_at, closed_at)`, declared (group sight) and in the purge list.

**Partial.** A fact whose key is open in `money_ingests` (opened and not closed, so a stopped ingest stays marked) is answered `{partial: true, ingest, partial_says}` by `readFact`, `moneyOf`, the sides of `committedAgainstPaid`, `neighbours` items, `recordedBy` items, a trail row and its adjustments. `summable` and `reconcile` answer ids, so they carry `partial: true, ingests: [keys]` only when a fact named is partial. Closing removes it; reopening restores it; a key never opened, and every old fact (no key), is unmarked (R-OLD). Answers for facts without a marker are byte for byte as before. The sentence is `localize("money.ingest.partial", …)`; its row in setup-words is not yet generated (BOB regenerates; words check shows no finding in money).

**Proposed requirement text (BOB writes).** R30 as in J9. R31 (G55; K4562, K4571): "A source that is a table row may carry `ingest`, the key of the background ingest reading it. `markIngest(key, open)` (synchronous, in the caller's transaction) opens or closes a key; money holds the open keys. Every read that answers a fact of an open key, one never closed (a stopped ingest) included, answers `partial: true`, the key and `localize('money.ingest.partial')`; summable and reconcile answer `partial` and `ingests`; a fact with no key, or whose key was never opened, is unmarked. Refusals: `NO_INGEST`; `UNKNOWN_FIELD` for `ingest` on another source." R2's source forms gain `ingest`. R21: `money_ingests` declared.

**Tests.** `g55-view.test.mjs` 12 tests (6 tier 1, 6 tier 2: every read partial with key and sentence; close, stopped, reopen; unopened key and old fact; transaction; refusals; field for field with and without a key). Seen red on the base (no `markIngest`, no `viewBuilds`). `record.test.mjs` R21's declared-table list gained `money_ingests`. Money 104 of 104 pass.

**Ran.** Direct users of money (155 files, each alone) plus plane `migrate-released`: all `fail 0`. format, architecture (money), coverage 29 of 29, ownership 0 failures (5 files); `checks/run.mjs`: only the inherited `case-checker/spec.mjs:11`. Declarations: no census op changed (no new op).

**Made stale (not edited, P9):** `bio-plane/dist/bio-plane.bundled.mjs` embeds money's source; BOB regenerates it at the layer close.

Size (session_01RUnq4fs9yS6fvUi9DZjnt9): test runs 330, module lines 1566

## J12 · COMPLETE

COMPLETE, fix round 10 Wave A batch 3 (B11). tranche/T51 merged; pushed.

**Fixtures published** (`bio-plane/test/m/money/fixtures.mjs`, new; each made by money's real code when called, checked by `fixtures.test.mjs`, R8): `readFactNotFound()` (the real `readFact` answer `{ok:true, found:false, fact_id, fact:null}` over an empty record) for ratification's 1 line; `readFactOf(over?)` (the real `readFact` answer `{ok, found:true, fact}` over a seeded fact, fields overridable) for strength's 1 line. Their users re-point in their own jobs.

**Own fixture line done:** `ops.test.mjs:48` (promotion/makePromotion): the hand-built `promotionStandIn` is gone; R5's test now joins a real promotion (`promotionOver` over promotion's `makeRecord`/`makeMembership`, steps read back with `registeredSteps`), all from promotion's `fixtures.mjs`. Lines left: none. `fixtures-own` / `fixtures-generic` markers added: none.

**Ran.** Money 106 of 106 pass (all files in one run). `checks/fixtures.mjs . money --list`: 0 failures (was 1). format 0; architecture 0; coverage 31 of 31; ownership 0 failures. Impact set: tests only (no src change), users of money's src are unaffected; impact.mjs run after commit below.

Size (session_01EsE9gtefQQBM7aApNuuTJS): test runs 8, module lines 1566

## J13 · COMPLETE

Fix round 10 Wave A batch 3 done (record J12). Published readFactNotFound and readFactOf in bio-plane/test/m/money/fixtures.mjs, each tested (R8); re-pointed my line ops.test.mjs:48 to promotion's real fixtures. Fixtures check for money: 0 failures. Money 106/106 pass; format, architecture, coverage 31/31, ownership 0. No fixtures-own/generic markers added. Impact set names only money's own tests (run).

## J14 · COMPLETE

COMPLETE, fix round 10, the final pass's causes (B12). Entries applied: 1 (hidden project's trail), 2 (checks for callers). tranche/T51 merged before starting.

**1. `readSet` fenced** (diag2-07 §13; money R12). A set whose `concerns` names a bundle the viewer may not see is answered `{ok:true, found:false, set_id}`, exactly as an absent set (same keys; no label, project, who or when), as `moneySets` is fenced (R28). A set with no `concerns`, or whose `concerns` is no bundle, reads as before. No caller of `readSet` outside money passes no viewer for a bundle-concerning set: the op `moneyset` stamps `viewer`; the screens, op-declarations and op-grades only read the op. Test: `moneysets.test.mjs` (R12; trail in a fenced project: outsider and blank viewer equal an absent set, member with sight reads it, bare set still readable). Why the tests missed it: the R28 test read only the list; set/trail tests read as the creating member.

**2. `checkConstant` and `factBySource`** (diag2-07 §5, §6; money R7). `checkConstant({role, value})` (no write): `{ok:true, role}` or money's own refusal beside `role`: `MONEY_BAD_PERIOD` (period; a string is read as calculations reads a binding's period, `YYYY-MM-DD/YYYY-MM-DD?` else a fiscal key, or a money period object; an empty value is also `MONEY_BAD_PERIOD`), `UNKNOWN_MONEY_KIND`, `UNKNOWN_PHASE`, `UNKNOWN_STAGE` (against the stage list; the kind's family is the write's check), `UNKNOWN_BASIS`, `NO_CURRENCY`; other role `UNKNOWN_ROLE`. `factBySource({table, row, binding, viewer?})`: `{ok:true, found:true, fact_id}` of the earliest live fact written from that row, else `{ok:true, found:false}`; a withdrawn fact is none; a row given as a number reads as its string (as the write stores it); `NO_SOURCE` for a missing part. Index `money_facts_source_row (source_binding, source_table, source_row)` in `schema.mjs` (created by `migrate` on existing stores); the test reads the query plan. Fixtures (R8-style, `fixtures.mjs`, checked by `fixtures.test.mjs`): `checkConstantOk`, `checkConstantRefused`, `factBySourceFound`, `factBySourceNone`. Why the tests missed it: money had no check to call, and no test wrote the same source row twice.

**For calculations' job (after mine merges):** pass `moneyPeriod(value)` or the string to `checkConstant`; its `code`/`detail`/`translation` are money's. Names for `adoptBinding`: kind, phase, stage, basis, currency, period.

**Not done / reported.** The door case (member `max` opens `/app/money/<trail>`, `r8-money-trail-hidden.test.mjs`) is control-plane's (K5138): for BOB to place. No change outside my paths. R27 carries a "not yet met: T51" mark that this batch does not name; not touched. Requirements met by this job: R12 (the `readSet` fence), R7 (the two checks); BOB strikes the marks. No `fixtures-*` marker added.

**Ran.** Money 114 of 114 pass (all files in one run); the six new tests seen red on the base (5 checks + the R12 fence) and green after. Users reading sets (screens-investigate money, fix2, fix4, fold, fix4-seam, fix2w2; op-grades cause3): all `fail 0` (screens-investigate money 14, fix2 12, fix4 3, fold 9, fix4-seam 4, fix2w2 21; op-grades cause3 4); the op-declarations files were not run to the end, as none reads a set. Checks from the process repo, absolute root: format 0; architecture 0; coverage 31 of 31, 0; words 0; ownership 0; `fixtures.mjs money --list` 0 failures. Stale (not edited, P9): `bio-plane/dist/bio-plane.bundled.mjs` embeds money's source; BOB regenerates it.

Size (session_014aMgy6krydsoCbHAbQm7TM): test runs 14, module lines 1631

## J15 · COMPLETE

Fix round 10 (B12) done, record J14. R12: readSet fences a set concerning a bundle the viewer cannot see (answers as absent). R7: checkConstant and factBySource published, index money_facts_source_row, four fixtures. Met: R12, R7 (strike marks). Money 114/114; format, architecture, coverage 31/31, words, ownership, fixtures 0 failures; dependent set-reading tests pass. Door case (max opens /app/money/trail) is control-plane's, for you to place. Stale: bio-plane.bundled.mjs.
