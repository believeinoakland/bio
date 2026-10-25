# conformance (T51)

**Status** · session_01H6qaqGGdsgsJYq9QcBswrD · depth 2 · WAITING ON BOB (J7) · handled B5

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
