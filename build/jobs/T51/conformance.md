# conformance (T51)

**Status** · session_011kaeq1oqwM8DTfsD6rg1kR · depth 2 · WORKING · handled B10

## J1 · REPORT

Found in another module (not changed by this job): `actions` test `bio-plane/test/m/actions/t34.test.mjs:101` copies the sentence of `actions` `localize("actions.index.an_action_recorded_for_a_2", ...)` (`bio-plane/src/actions/index.mjs:1240`) as a literal. The words check (cross-module run over the list you named) flags it as a testcopy `[code]` in `actions`. It does not name conformance's module; the excerpt only reads "conformance determination" because the sentence says so. For `actions` to fix, not this job.

## J2 · COMPLETE

Entries applied (T51-85, words, K3949 / K3962 / K3986):
- Inline sentences converted to `localize`, text byte-identical: `checks.mjs` DETERMINATION_ONLY_BY_ITS_ACT (`conformance.checks.a_determination_is_recorded_only`); `index.mjs` NO_OFFICE_ENTITY (`conformance.index.no_office_entity_is_held`); `index.mjs` NO_STANDARDS detail (`conformance.index.a_determination_measures_the_act`).
- Test copies (the 6 testcopy findings, including the t46 code copies) replaced by `word("refusal.STANDARD_SIDE_UNNAMED")`, `word("refusal.CONFORMANCE_BAD_REASON")` and key-free checks: `dec149.test.mjs` (translation through `word`; detail sentence no longer held: the NAMES_THE_PLANE check stays), `determine.test.mjs` (C-113.17 through `word`), `t46-words.test.mjs` (`KEPT_THREE` holds check and where only; the KEPT canonical-JSON hash pins the three kept translations, text unchanged; expected values read from `CONFORMANCE_CHECKS.<row>.translation`).

Deferred: none in the module.

Found in another module (REPORT posted): `actions` `test/m/actions/t34.test.mjs:101`, a literal copy of `actions`' own sentence.

Tests run: `node --test test/m/conformance/` (bio-plane) 3 times; final run 119 pass, 0 fail.
Checks run (civicos-process checks, product `/home/user/bio`):
- `checks/words.mjs /home/user/bio conformance`: 0 failures (4085 string literals read; before: 9)
- `checks/words.mjs ... consequences action-grammar actions action-holds escalation filing-templates filings action-clocks action-plans action-records plan-work action-replies`: no line of conformance; one line in `actions` (see REPORT)
- `checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; channels 0 failures; coverage 26 failures across other modules (none conformance); conformance's own coverage 41 of 41 ids, 0 failures; words failures in other modules only
- `checks/architecture.mjs /home/user/bio conformance`: 0 failures
- `checks/coverage.mjs /home/user/bio conformance`: 41 of 41 live ids, 0 failures
- `checks/ownership.mjs /home/user/bio conformance tranche/T51 job/T51/conformance`: 1 file changed, 0 failures
- `bio-plane/src/setup-words/build.mjs --check`: rows.mjs stale, as expected (BOB regenerates at layer close); no refusal naming conformance

Size (session_01ViYfNCYcxxWgYECRmXKcky): test runs 3, module lines 2709

## Fix round 10, Wave A batch 1 (B2) · work

Published `bio-plane/test/m/conformance/fixtures.mjs` (new): `curesOf` (real `curesOf` over a noncompliant determination, its later compliant cure and the recorded link, R37), `determinationRead` (live, superseded-with-successor and unclear determinations, R9), `noDeterminations` (real module over an empty store, R19). Each returns `{conformance, ids, viewer, outsider, world}`, made by the real code when called. Their test `fixtures.test.mjs` calls each and checks the real answer (3 pass).

Markers added: no `fixtures-own` or `fixtures-generic`.

Lines left in `fixtures.mjs --list conformance`: 4, the FIX-E lines named in B2 (fixture.mjs:147 retrieval, :173 basis-versions, :263 case-import, t45.test.mjs:402 case-import/case-check/queue); they arrive as a CHANGE.

Checks: module tests 123 pass, 0 fail; words 0 failures; format 0; architecture 0; coverage 42 of 42, 0 failures; `impact.mjs origin/tranche/T51 HEAD`: affected modules 0 (no source change), no user tests to run.

Size (session_014bYaS8aw3Ywr8iWF6pbvdN): test runs 4, module lines 0 (source unchanged; 63 test lines added)

## J3 · COMPLETE

Fix round 10 Wave A batch 1 done: fixtures.mjs publishes curesOf, determinationRead, noDeterminations (real code, tested in fixtures.test.mjs). No fixtures-own/-generic markers added. 4 FIX-E lines left (retrieval, basis-versions, case-import x2), as B2 said. Module tests 123/0, words/format/architecture/coverage 0 failures, impact: 0 affected.

## J4 · QUESTION

B3: merged tranche/T51. Re-pointing fixture.mjs:147 to retrieval's noSelection().selectionResolve works (123 tests pass, the fixtures line clears), but checks/architecture.mjs fails: 'fixture.mjs imports bio-plane/test/m/retrieval/fixtures.mjs of retrieval, which conformance does not declare in uses'. build/modules.json is not mine. Please add retrieval to conformance's uses (or rule otherwise); I then apply the 3-line change (import noSelection; retrieval: { selectionResolve: noSelection().selectionResolve }) and re-COMPLETE. Reverted locally meanwhile; branch has only the tranche merge.

## Fix round 10, Wave A batch 1 (B3, B4) · retrieval re-point

Merged `tranche/T51`; `fixture.mjs:147` now takes retrieval's published `noSelection().selectionResolve` (was a hand-built NO_SUCH_SELECTION). Markers added: none. Lines left in `fixtures.mjs --list conformance`: 3 (basis-versions :174, case-import :264 and t45.test.mjs:402), waiting on their providers. Module tests 123 pass, 0 fail; format, architecture, coverage (42 of 42), words and ownership 0 failures.

Size (session_014bYaS8aw3Ywr8iWF6pbvdN): test runs 6, module lines 0 (source unchanged)

## J5 · COMPLETE

B3/B4 done: fixture.mjs:147 re-pointed to retrieval's noSelection (no markers added). 3 FIX-E lines left (basis-versions, case-import x2). Tests 123/0; format, architecture, coverage, words, ownership 0 failures.

## Fix round 10, follow-up for actions (B5) · determination variants

Published in `bio-plane/test/m/conformance/fixtures.mjs`, made by the real code at call time: `determinationVariants()` (a determination resting on a held check, basis `checked_held`; one on another group's accepted finding, basis `accepted`; a compliant one; a superseded one with `superseded_by` set and its successor; a live one with `superseded_by: null`) and `voidDetermination()` (a determination whose held check's source lapsed: reads void, outcome undetermined with the recorded one beside it; plus a not-void control). Each has a test in `fixtures.test.mjs` checking the real answer. Every state in B5 is reachable by the real code; none is left unpublished. Users (re-pointed by a later actions session): actions `t45.test.mjs:40`, `t50.test.mjs:27`, `t12.test.mjs:55`.

Re-pointed: `fixture.mjs` IMPORT_NO_SUCH_EDITION (was :264, a hand-built refusal) now takes case-import's real answer from its published `importedWorld({imports: []})` (code, check, translation included). case-import is already in conformance's `uses`.

Markers added: no `fixtures-own` or `fixtures-generic`.

Lines left in `fixtures.mjs --list conformance` (2):
- `fixture.mjs:178` basis-versions `conclude`: basis-versions publishes no `fixtures.mjs` yet (batch 4).
- `t45.test.mjs:402` NO_SUCH_CASE for a viewer: B5 names case-import's fixtures, but the part-3 plan classes it as `case-check/caseCheckOfNoSuchCase`, and case-check publishes no `fixtures.mjs` yet. `openFlagsUnread` is not this line's answer. Waits on case-check.

Checks: module tests 125 pass, 0 fail; format 0; architecture 0; coverage 42 of 42, 0 failures; words 0; ownership 0 (before commit); `impact.mjs origin/tranche/T51 HEAD`: 0 affected.

Size (session_01JnMCs91Bn1r2Lm9pGuRv7D): test runs 4, module lines 0 (source unchanged; test lines added)

## J6 · COMPLETE

B5 done. Published determinationVariants (held-check basis, accepted basis, compliant, superseded with superseded_by set, live with superseded_by null) and voidDetermination, from real code, each tested in fixtures.test.mjs; every state was reachable. Re-pointed the hand-built IMPORT_NO_SUCH_EDITION to case-import's importedWorld. No fixtures-own/-generic markers added. 2 lines left: fixture.mjs:178 (basis-versions, no fixtures.mjs yet) and t45.test.mjs:402 (NO_SUCH_CASE; its provider is case-check, not case-import, and publishes none yet). Module tests 125/0; format, architecture, coverage 42/42, words, ownership 0 failures; impact 0 affected.

## J7 · QUESTION

B6 (follow-up 7): one edge to rule. Two lines were left; one is done, the other needs a `uses` edge.

(2) Done. `t45.test.mjs:402`, the fenced `caseCheckOf` refusal, now takes case-check's published `caseCheckOfNoSuchCase().refusal`. case-check is already in conformance's `uses`. Committed as 19fc12e3fe; 125 tests pass, 0 fail.

(1) Needs an edge. `fixture.mjs:178`, the `conclude` stand-in, can take basis-versions' published `concludeAct({kind, target})`. I tried it: 125 tests pass, and the fixtures check clears the line. But importing `bio-plane/test/m/basis-versions/fixtures.mjs` needs basis-versions in conformance's `uses`, which it is not, and `checks/architecture.mjs` fails on that one import. I reverted the change on the branch so the branch stays green (as with the retrieval edge at J4).

Please add `basis-versions` to conformance's `uses` in `build/modules.json` at the tranche tip, or rule otherwise. Then I apply this change, and nothing else:
- one import, `import { concludeAct } from "../basis-versions/fixtures.mjs";`
- in `conclude(args)`, keep the stand-in's promotion write (contradiction's R21 test reads the concluded question through it), and return `r.ok ? concludeAct({ kind: "concluded", target: args.target }) : r` in place of the hand-built object.

`concludeAct` takes only `kind` and `target`, so the returned claim text is the fixture's own wording, not the caller's conclusion. The stand-in's result is used only for its `ok` flag and passed on by `resolve`, so no test in this module reads the wording.

Until the ruling the fixtures check lists one line, `fixture.mjs:178`. Nothing else is open.

## J8 · COMPLETE

Follow-up 7 done (B6, B7). Both lines re-pointed; no fixtures-own or fixtures-generic markers added.

Applied:
- t45.test.mjs:402: the fenced caseCheckOf refusal takes case-check's published caseCheckOfNoSuchCase().refusal (commit 19fc12e3fe).
- fixture.mjs:178: the conclude stand-in keeps its promotion write (contradiction's R21 test reads the concluded question through it) and returns basis-versions' concludeAct({kind: "concluded", target}) on success, in place of the hand-built answer. basis-versions is in conformance's uses on tranche/T51 (B7). Commit b49ab14265, after merging origin/tranche/T51 (never a rebase).

Checks by failure count (absolute root /home/user/bio):
- checks/fixtures.mjs /home/user/bio conformance --list: 0 failures (answer 0)
- checks/architecture.mjs: 0 failures
- checks/format.mjs: 0 failures
- checks/coverage.mjs conformance: 42 of 42 live ids, 0 failures
- checks/words.mjs conformance: 0 failures
- checks/ownership.mjs /home/user/bio conformance tranche/T51 job/T51/conformance: 0 failures
- module tests (bio-plane/test/m/conformance/*.test.mjs): 125 pass, 0 fail

Size (session_01H6qaqGGdsgsJYq9QcBswrD): test runs 4, module lines 0 (source unchanged; test and stand-in lines only)

## Fix round 10, plan item 97 (B8) · actions' determination states

Published in `bio-plane/test/m/conformance/fixtures.mjs`, each made by conformance's real `determine` and `determinationRead` when called (no stored values, no `fixtures-own` or `fixtures-generic` markers):

- `determinationBothBases()` (line 66): one determination resting on a held check (`checked_held`) and on another group's accepted finding (`accepted`) together. Users: `actions/t45.test.mjs:41` (ACTIONS #26 J8 item 1).
- `matterStakeBases()` (line 84): three determinations, each on an accepted finding of an import whose source facts are one of the three states case-import answers: a matter stake recorded at import (`withStake`), recorded with none (`withoutStake`, `matter_stake: null`), and not recorded at all (`undetermined`, `matter_stake: "undetermined"`, identity null, stake undetermined). User: `actions/t50.test.mjs:27` (ACTIONS #26 J8 item 2).

Tests in `fixtures.test.mjs` (lines 57 and 65) check each state's real answer. Red first: the file failed with `does not provide an export named 'determinationBothBases'`; green after the fixtures: 7 of 7 in that file.

Stand-in, reported to BOB: the import facts for `matterStakeBases` are set through conformance's world stand-in `w.imports.editions` (the `case-import` R4 shape, as `t47.test.mjs` sets them), not through case-import's real import. The shape matches case-import's R25 in `case-import/matter-stake.test.mjs`. The accepted finding is the world's `w.accept` stand-in as before. No case-import-real path reaches conformance's test world today (its `caseImport` is the stand-in in `fixture.mjs:263`).

Deferred: none. Found in another module: none new.

Checks (absolute root `/home/user/bio`):
- conformance suite `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/conformance/*.test.mjs`: 127 pass, 0 fail (125 before, plus the two new tests)
- `checks/fixtures.mjs /home/user/bio conformance --list`: 0 failures
- `checks/format.mjs`: 0 failures; `checks/architecture.mjs conformance`: 0 failures; `checks/coverage.mjs conformance`: 42 of 42, 0 failures; `checks/words.mjs conformance`: 0 failures
- `checks/ownership.mjs` run after the commit (see the COMPLETE)

Size (session_016jHoSN6Fe8DtYJkQyfT6Rr): test runs 5, module lines 0 (source unchanged; 51 test lines added)

## J9 · COMPLETE

B8 done (commit 495e6f8773, pushed; fast-forward from a0aabbbfdc). Published two determination states for actions, each made by conformance's real `determine` and `determinationRead`:

1. `determinationBothBases()` (bio-plane/test/m/conformance/fixtures.mjs:66): one determination resting on a held check and on another group's accepted finding together. For actions t45.test.mjs:41.
2. `matterStakeBases()` (fixtures.mjs:84): accepted bases with a matter stake recorded at import, recorded with none (matter_stake null), and not recorded at all (matter_stake "undetermined", identity null, stake undetermined). For actions t50.test.mjs:27.

Stand-in, stated plainly: the import facts for (2) are set through conformance's world stand-in `w.imports.editions` (the case-import R4 shape, as t47 does), not through case-import's real import. The shape matches case-import's R25 in case-import/matter-stake.test.mjs. The accepted finding is the world's `w.accept` stand-in as before. Nothing of case-import's real import reaches conformance's test world today.

Tests (bio-plane/test/m/conformance/fixtures.test.mjs:57, :65): red first (the file failed with "does not provide an export named 'determinationBothBases'"), then green: 7 of 7 in that file. Conformance suite: 127 pass, 0 fail (125 before, plus 2).

Checks (absolute root /home/user/bio): fixtures --list 0 failures; format 0; architecture 0; coverage 42 of 42 live ids named, 0 failures; words 0 failures; ownership 0 failures (3 files changed by conformance vs tranche, committed HEAD).

Met ids: none of conformance's marks changed by this round; the new tests name R9, R14, R31, R32, R41 (conformance's own), as the fixtures are read by actions and do not change conformance's requirements.

Markers: none added (no fixtures-own, no fixtures-generic).

Deferred: none. Found in another module: none new.

Size (session_016jHoSN6Fe8DtYJkQyfT6Rr): test runs 5, module lines 0 (source unchanged; 51 test lines added)

Waiting on BOB (J8) to merge; ACTIONS re-points after the merge.

## J10 · COMPLETE

B9 done (START #29, walk E C2a). R43 met: `determine` now answers its own code for an undetermined binding.

**Changed (commit on job/T51/conformance):**
- `bio-plane/src/conformance/index.mjs:1066-1079`: `STANDARD_NOT_BINDING` only for `binds === false` (a benchmark); a new region `is-standard-binding-determined` answers `STANDARD_BINDING_UNDETERMINED` for `binds === "undetermined"`, same `why` detail (it says why, and that a member settles it in standards first), fields `standard, body, binds`.
- `bio-plane/src/conformance/checks.mjs:172`: new row C-113.45 `STANDARD_BINDING_UNDETERMINED`, translation `localize('conformance.checks.civicsmith_cannot_yet_tell_whether', ...)` (BOB's draft; no design key exists in words.json yet), awaiting the next promotion stamp.
- Fixture published: `standardBindingUndetermined()` (bio-plane/test/m/conformance/fixtures.mjs:42): the walker's shape (ordinance, `period {from, to: null}`, body as text) plus the issuer-entity variant (`askedByIssuerEntity.typed`/`.picked`), `benchmarkAsked`, `bindsAsked`. screens-action draws the code through this fixture.

**Tests, red then green** (`t51-binding.test.mjs`, 5 tests, all name R43): red first: 3 failed (`STANDARD_NOT_BINDING` answered where `STANDARD_BINDING_UNDETERMINED` expected; row absent), the benchmark control passed; green after the change, 5 of 5. Existing tests that encoded the old behaviour were moved to the new code (t35.test.mjs:54 area, t36.test.mjs three tests); t46-words.test.mjs's "every other row keeps its own" set leaves out the new row (its count and hash for the other 34 rows are unchanged).

**Suites:** conformance 132 pass, 0 fail (127 before, +5); users run: escalation 103/103, consequences 73/73, screens-action 297/297. Impact names 45 modules, 1002 test files; the modules that read this refusal (escalation, consequences, screens-action) were run.
**Checks (absolute root):** format 0, architecture 0, words 0 failures (conformance), ownership 0 failures; coverage: no conformance finding (the 8 failing ids are other modules'). `setup-words/build.mjs --check`: stale-rows note naming `conformance.checks.civicsmith_cannot_yet_tell_whether`, expected (BOB regenerates).
**Inherited/expected red:** `bio-plane/test/system/row-census.test.mjs` is red with many rows from other modules (C-102.34 ... ) and now C-113.45 as well, accepted by name until the next stamp.
**Markers:** none added (no fixtures-own, no fixtures-generic).

**REPORT for BOB (other modules):**
1. screens-action `matter.mjs` (the `determine` act, ~538-577) has no handler for the new code; it draws `refusal.<code>` when a key is held, so for `STANDARD_BINDING_UNDETERMINED` it falls back to the plane's translation. The design stream owes a `refusal.STANDARD_BINDING_UNDETERMINED` key; screens-action should draw the refusal's `detail` (the why) beside it. Causes (a) body typed as text vs an entity issuer, (b) no "known in force through" door, are screens-action / screens-investigate / standards causes in causes-E.md C2a.
2. Generated artifacts made stale: `bio-plane/src/setup-words/rows.mjs` (new `localize` id), `bio-plane/src/case-checker/program.mjs` and `bio-plane/dist/bio-plane.bundled.mjs` (they hold conformance's refusal table).

Deferred: none. Size (session_01SB37ZomNUisnUzz3WLTSui): test runs 8, module lines 14 (source) + 20 fixture lines + 66 test lines

## Round 10 · item 143 (B10) — CONFORMANCE #30 · re-walk area E N4 (causes-rewalk.md §2)

**Changed** (`bio-plane/src/conformance/index.mjs`): `reasonText` helper (:2056) draws a `why` `{key, vars}` through the word table (civil-time's reasons fall back to its own `reasonText`); `Conformance.datesOf` (:626, :627) and `whenWords` (:2169, :2170) use it, so the act event's reason is words, never `[object Object]`; `#bindings` (:~810) now carries `body_label` and `cite` (read through `standards.standardRead`), and `determine` draws both refusals (`STANDARD_NOT_BINDING` :~1070, `STANDARD_BINDING_UNDETERMINED` :1079) with the body's label and the standard's citation, `b.why` through `reasonText`. The refusal's data fields (`standard`, `body`) still carry the ids.
**Tests** (`test/m/conformance/t51-binding.test.mjs`, appended): the walker's case (noncompliant, body picked as an entity, act event placed nowhere) asserts no `[object Object]`, no `ENT-`/`STD-` id in `detail` or `translation`, the body's label and the standard's citation present; and a compliant determination of an act placed nowhere asserts none in its `in_force_why` or its document (`w.text`). Both red on the old code (pass 5 / fail 2), green now (7/7).
**Suite:** conformance 134/134. Users run: consequences 73, actions 157, action-clocks 87, filings 168, escalation 103, action-plans 110, plan-work 52, screens-action 310, all green. `checks/run.mjs`: no finding in conformance; words 0 failures, count not risen. Ownership 0 failures.
**Met ids:** R3, R17, R27, R43. **Markers added:** none. **REPORTed:** none. **Deferred:** none.

Size (session_0194RwZ8cmBo7rAcUqnf6xx9): test runs 12, module lines 21 (source) + 29 test lines

## J11 · COMPLETE

COMPLETE · item 143 (E N4). Changed bio-plane/src/conformance/index.mjs: reasonText helper :2056; datesOf :626-627 and whenWords :2169-2170 draw the act event's {key,vars} reason in words; #bindings carries body_label and cite; both binding refusals draw the body's label and the standard's citation (:1079). Test red then green (t51-binding.test.mjs, 2 new: pass 5/fail 2 before, 7/7 after). Conformance 134/134; consequences 73, actions 157, action-clocks 87, filings 168, escalation 103, action-plans 110, plan-work 52, screens-action 310 green. checks/run.mjs: no conformance finding, words not risen; ownership 0. Met: R3, R17, R27, R43. No markers, no REPORT. Size (session_0194RwZ8cmBo7rAcUqnf6xx9): test runs 12, module lines 21
