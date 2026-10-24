# query-language (T51)

**Status** · session_01Uv26d4DQG2M8TmwzaWeGkF · depth 2 · COMPLETE · handled B5

## J1 · COMPLETE

T51-41 · query-language: done. Commit 73ccc0bb78 on job/T51/query-language.

Entries applied:
- T51-41 (K3807): the stale comment in `bio-plane/src/query.mjs` at the `op=searchfields` note named `civicos-ui`, deleted in T51-126. Restated without naming it: the measurement (2026-08-09, no non-test caller of `op=meaningrows`) is kept, and the surface that called `op=searchfields` is described as removed. No behaviour change; no code, test or requirement changed.
- BOB note 2 (retrieval R88 / parsed-query route): nothing asked of query-language; no change.

Deferred: none.

Found in other modules: none from this job's changes. The full suite (`node checks/run.mjs /home/user/bio`) reports 13 coverage failures in modules other than query-language (agent-harness R17; agent-runner R36 R37 R38 R40; agent-steps, all 49 ids; agent-worker R119; basis-versions R55; case-grammar R33; entities R57–R61; explore R26; journey-check R19; people R40 R41; progressions R46; retrieval-browse, all 18 ids; retrieval R87 R89 R90). Those are live ids named by no test in their modules; I did not touch them. Format and architecture are clean across the tree (3538 product files, 0 failures).

Tests and checks:
- `node --test test/m/query-language/` (in bio-plane): 56 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 174 modules, 172 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio query-language`: 10 product files; 0 failures.
- `checks/coverage.mjs /home/user/bio query-language`: 33 of 33 live ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio query-language tranche/T51`: 1 file changed; 0 failures.
- `checks/run.mjs /home/user/bio`: architecture 0 failures; coverage 13 failures, all in other modules (above); channels 0 failures.

Size (session_01FS8FKWSy2DYXTK38z1ksz2): test runs 1, module lines 3030

## J2 · QUESTION

T51-41 · query-language · CHANGE B2 (K3872): one question on wording.

The ids arm now binds the list once, as a single JSON argument read through json_each, so a statement binds one variable at any count (commit a1cc6dbb39). Measured before the fix, with the fixture's SQLite capped at 100 bound variables (the plane's ceiling, D-36): 100 ids run, 101 are refused "too many SQL variables", so 5,000 ids failed. The new test "R14 an ids list binds one variable whatever its count" passes after the change and fails before it.

No requirement states the bound. R12 bounds the select-all count at IDS_MAX (50,000) and R14 says an ids list is an arm; neither names the bound-variable ceiling, and the number is only in the code comments and the measurement records (about 100). Proposed wording for R14, to add:

"An `ids` list of any length is bound as one statement argument (a JSON array read through `json_each`), so every statement stays within the plane's bound-variable ceiling (D-36, about 100) however many ids a scope holds."

Please word it, or tell me the wording you want; I will then name it in the test title and post COMPLETE again.

## J3 · COMPLETE

T51-41 · query-language · CHANGE B2 (K3872): done, commit a1cc6dbb39 on job/T51/query-language. Tranche T51 is merged in (the merge is in this branch).

Applied:
- K3872: the ids arm (`compile`'s `ids`, both the bundle and the projection forms) binds the list once, as a JSON argument read through `json_each`. Same answers at any count. Test: `R14 an ids list binds one variable whatever its count` (statements.test.mjs): 5,000 ids answer the three held, a control with two ids answers the one held. Before the change the same test fails with "too many SQL variables" under the ceiling.
- Fixture: `test/m/query-language/fixture.mjs` now caps each test database at `PLANE_VARIABLE_CEILING` = 100 bound variables, the plane's bound (D-36). Every existing test still passes under it.
- Earlier entry T51-41 (the comment) is unchanged.

Requirement wording: a QUESTION is posted for it (no requirement states the bound yet). The test names R14 in the meantime.

Tests and checks:
- `node --test test/m/query-language/` (bio-plane): 57 pass, 0 fail.
- `node --test test/m/retrieval/`: 193 of 194 pass. The one failure, "R10, R16, R19, R20, R73 (plan rule 6): the module's keys are the owner's declared list", fails without my change too (checked with my changes stashed): retrieval's word list, not query-language. Reporting it, not touching it.
- format: 174 modules, 0 failures. architecture (query-language): 0 failures. coverage (query-language): 33 of 33 live ids named, 0 failures. ownership (query-language, tranche/T51): 0 failures.

Size (session_01FS8FKWSy2DYXTK38z1ksz2): test runs 6, module lines 3034

## J4 · BLOCKED

T51-202 · query-language · words pass (B4), commit b5b2429fa2 on job/T51/query-language (pushed). BLOCKED: cause NEEDS BOB, one act.

Applied (the seven findings of build/plan/words-pass/query-language.md):
- Plain (K3957), query.mjs CACHED_FIELDS whys, each now a localize call read by cachedNotes and the field detail: capture → new id `query-language.query.capture_letter_bounded` (no row yet; rows.mjs is stale for it, as setup-words build --check notes); connection → existing `query.why.leg_raised_anywhere`; due → existing `query.why.clock_next_date`; overdue → existing `query.why.flag_computed_local`. Connection's why was not in the three counted findings (it is a two-literal concatenation), converted for the same reason.
- Test copies (K3962, K3810): t33.test.mjs (3 lines), statements.test.mjs (1 line), grammar.test.mjs (NEAR warning checks now compare the reason with word(key, vars) and assert hasWord for the wrapper; message text reworded), converts.test.mjs and grammar.test.mjs (content:chain/cap query strings built from CHAIN_DOES_NOT_APPLY, CAP_DOES_NOT_APPLY and a local UNDETERMINED constant).

Tests and checks:
- node --test test/m/query-language/ (bio-plane): 57 pass, 0 fail.
- checks/run.mjs /home/user/bio: format 0 failures; architecture 0 failures; channels 0 failures; coverage reports 30 failures, none naming query-language; words reports no finding naming query-language.js except the one below.
- setup-words build.mjs --check: stale-rows note for capture_letter_bounded only (expected); no refusal.
- checks/ownership.mjs query-language tranche/T51 job/T51/query-language: 0 failures.

NEEDS BOB (the one open item): three findings the checker raises in my test file t33.test.mjs, not fixable inside this job:
- missingkey: `query-language.query.stringify_is_not_available_here`, `query-language.query.sort_stringify_can_hold_many`, `query-language.query.facets_stringify_can_hold_many` (t33.test.mjs:215, :227, :231). These keys exist in rows.mjs as code-tagged rows (words-unreviewed.json), but the checker reads docs/development/ux-substrate/screens/words.json, which lacks them, so tests cannot reference them by word().
- The tests now call word() on them, keeping the exact assertions. Without the keys in words.json, the only alternative is to weaken the assertions, which I will not do.
- Ask: add those three keys (with these English sentences, unchanged) to the design's words.json, through the design stream, and BOB regenerates rows at the layer close. Recommended: yes, since members read these warnings. After that the job re-runs the words check and posts COMPLETE.

Deferred: none. Found in other modules: none from this job.
Size (session_01ViKHjERep3ZC62ov1p3v8e): test runs 1, module lines 3000

## J5 · COMPLETE

T51-202 · query-language · words pass (B4), COMPLETE on job/T51/query-language (pushed; tranche/T51 merged in).

Applied (B4 findings, per B5):
- Plain (K3957): CACHED_FIELDS whys in query.mjs now localize: capture → new id `query-language.query.capture_letter_bounded`; connection, due, overdue → existing `query.why.leg_raised_anywhere`, `query.why.clock_next_date`, `query.why.flag_computed_local`.
- Test copies (K3962): content:chain/cap query strings built from CHAIN_/CAP_DOES_NOT_APPLY and a local UNDETERMINED; NEAR warnings compare with word(key, vars) and hasWord; relevance warning with word(); t33's three code-written warnings with localize(id, en, vars) per B5.

Tests and checks:
- node --test test/m/query-language/ (bio-plane): 57 pass, 0 fail.
- checks/run.mjs /home/user/bio: format 0 failures; architecture 0 failures; words: no finding naming query-language (missingkey 0 tree-wide); coverage and words failures present only in other modules.
- setup-words build.mjs --check: stale-rows note only (expected); no refusal naming query-language.
- checks/ownership.mjs query-language tranche/T51 job/T51/query-language: 0 failures.

Deferred: none. Found in other modules: none from this job.
Size (session_01ViKHjERep3ZC62ov1p3v8e): test runs 2, module lines 3000

## Completion · fix round 9, batch D (B6): R34 a passage snippet names its unit (K4922)

Session session_01Uv26d4DQG2M8TmwzaWeGkF (QUERY-LANGUAGE #13). Tranche T51 merged into the branch first.

**Applied.** `query.mjs` `page()`: every hit carries `snippet_unit` (always a column, after `snippet_from`): the `rowid` of the unit row the passage snippet was cut from when `snippet_from` is `"passage"`, else `null`. One `firstUnit(select)` selection (same `ORDER BY capture_sha, seq, extent_kind, extent LIMIT 1`) now serves both the snippet and the unit, so the unit named is the unit cut. No sentence a member reads was added. Tests (`snippets.test.mjs`): two naming R34 (unit holds the snippet's words, first of several by the order, extent breaks a tie; controls: text hit, text-over-passage hit, unmatched hit carry `null`, key always present); red first (both failed without the change), green after. `statements.test.mjs` R14's key list now includes `snippet_unit`.

**Tests and checks.**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/query-language/`: 59 pass, 0 fail.
- format 0 failures; architecture (query-language) 0 failures; coverage (query-language) 34 of 34 live ids named, 0 failures; ownership 0 failures; `checks/run.mjs`: no finding naming query-language (words inline 14, all other modules).
- `impact.mjs origin/tranche/T51 HEAD`: 82 of 176 modules affected. Users run: retrieval, agent-steps, agent-worker.

**Found in other modules (for BOB).**
1. retrieval, `bio-plane/test/m/retrieval/search.test.mjs:30` (R6) lists the hit keys exactly and fails on the new `snippet_unit` (it passes the row through). Retrieval's job 30 (R95/R96) must add `snippet_unit` to that list; it is not mine to edit.
2. retrieval's three R94 tests fail on the unchanged tranche too (inherited; not from this change).
3. agent-worker bundles `query.mjs` (manifest §14): its bundle is stale for this change, to be regenerated at the layer close. Its `requirements.test.mjs` R45 byte-identity and static-check tests already fail on the unchanged tranche (no lockfile or `node_modules` in `agent-worker/` and `agent-steps/`, so `npm ci` could not run there). agent-steps: all its tests pass.

**Deferred:** none.
Size (session_01Uv26d4DQG2M8TmwzaWeGkF): test runs 9, module lines 3006

## J6 · COMPLETE

T51 query-language · fix round 9 batch D (B6): R34 done, on job/T51/query-language (pushed; tranche/T51 merged in). Entries applied: R34: every page hit carries snippet_unit, the rowid of the unit the passage snippet was cut from (one shared unit selection, same order as R33), else null. Tests: R34 x2 (red first, then green); query-language suite 59 pass, 0 fail. Checks: format 0, architecture 0, coverage 34/34 ids named 0, ownership 0, words: no finding naming query-language. impact: retrieval, agent-steps, agent-worker run. FOUND IN OTHER MODULES: (1) retrieval search.test.mjs:30 (R6) lists hit keys exactly and now fails on snippet_unit: retrieval job 30 must add it (R95/R96). (2) retrieval's three R94 tests and agent-worker R45 (bundle byte-identity, static check) fail on the unchanged tranche too (inherited). (3) agent-worker's bundle includes query.mjs: stale for this change, regenerate at layer close. Deferred: none. Size (session_01Uv26d4DQG2M8TmwzaWeGkF): test runs 9, module lines 3006.
