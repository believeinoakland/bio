# escalation (T51)

**Status** · session_018J3iWfL3tx9JNibc3aC31F · depth 2 · WORKING · handled B2

## J1 · REPORT

Findings in other modules, not changed here (P9), and artifacts my change makes stale:

1. Hand-listed escalation op names in other modules' tests (K3268: a list assembled from the owning module's declaration). Owners to fix: `affordances` (`test/m/affordances/catalogue.test.mjs:770`, five ops incl. `escalationreasondraft`); `op-grades` (`test/m/op-grades/owners.test.mjs:46`; `pins.test.mjs:114` incl. `escalationend`, `escalationopen`; `pins.test.mjs:187`); `plane` (`test/m/plane/t46.test.mjs:385`, incl. `escalationstoppursuing`, `escalationreopen`). Each is a `handlist` finding of the words check.
2. `wizard-scripts`: `src/wizard-scripts/data.mjs:54` "Take an escalation to its next stage" is a copy of a word row (inline, copy); `test/m/wizard-scripts/library.test.mjs:41, :67, :366` copy it too. Owner: wizard-scripts.
3. The full `checks/run.mjs` words total (1379 failures over 175 modules) and coverage (28 failures) are other modules'. None names escalation.

Generated artifacts made stale by this job (BOB regenerates at the layer close; I did not touch them):
- `bio-plane/src/setup-words/rows.mjs`: seven `localize` ids are new (`escalation.index.consequence_state_undetermined`, `escalation.index.clock_entry_past_undetermined`, `escalation.index.determination_states`, `escalation.index.its_state_is`, `escalation.index.date_undetermined`, `escalation.index.basis_undetermined`, `escalation.index.doubt_and_reason`). `node bio-plane/src/setup-words/build.mjs --check` exits 1 with the stale-rows note naming `escalation.index.basis_undetermined`: the expected note, not a refusal.
- `words-unreviewed.json` (release mode) will list those seven rows.
- `bio-plane/dist/bio-plane.bundled.mjs` and `release/bio-plane.bundled.mjs` (built from the escalation source).

For Bob (a word-policy question, not decided here): the seven new sentences are `localize` sentences with no words.json row yet. Whether they get rows (K3944) is for the design stream.

Defect fixed in this module (P8): the lines module answers an undetermined reason as `{key, vars}` (civil-time, K3958). Two places in `src/escalation/index.mjs` rendered it with `String()`, so a member would read "[object Object]" (the part-of line sentence, and the joined doubt). They now render through `reasonText`, which calls `word(key, vars)`.

## J2 · COMPLETE

T51-94 · escalation (R30, R31, R33; the words pass)

Entries applied:
- The 27 findings of `node checks/words.mjs /home/user/bio escalation` at START (inline 23, plain 3, testcopy 4), and the 17 `plain` and 2 `code` test-copy findings listed in `build/plan/words-pass/escalation.md`. Each is read by key where its words.json row holds the same sentence (17 rows, compared character by character with the literal they replace: 0 mismatches), else through `localize('escalation.index.<slug>', en, vars)` (seven new ids, listed in the REPORT). Test copies read the key, or compare with `word`/`localize` by equality.
- Red R30 (`structure.test.mjs`, "what we did" lane): the labels are compared with `word('screen.timeline.lane.ours' / '.world')`, which are `What we did` / `What they did`.
- Red R12 (`structure.test.mjs`, the line's undetermined reason): asserted by key (`civil-time.end_stated`), per K4036.
- `reasonText` renders a keyed reason by key where a member reads it (see the REPORT).

Deferred: none.

Found in other modules: see the REPORT (handlist op lists in affordances, op-grades and plane; wizard-scripts' copy of a word row).

Tests and checks (run from /home/user/bio, after the merge of tranche/T51 at 0c5bbb62c6):
- `node --test test/m/escalation/*.test.mjs` (bio-plane): 89 tests, 89 pass, 0 fail (before and after the merge).
- `node checks/format.mjs /home/user/bio`: 176 modules, 175 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio escalation`: 20 product files; 0 failures.
- `node checks/coverage.mjs /home/user/bio escalation`: 37 of 37 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio escalation tranche/T51 job/T51/escalation`: 6 files changed by escalation; 0 failures.
- `node checks/words.mjs /home/user/bio escalation`: 0 failures. The cross-module group (`conformance consequences action-grammar actions action-holds escalation filing-templates filings action-clocks action-plans action-records plan-work action-replies`): no line names escalation.
- `node checks/run.mjs /home/user/bio`: exit 1, from other modules' words and coverage findings only; none names escalation.
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note (expected; see the REPORT).

Size (session_013AsFroTyykKKbdaHRfrSrH): test runs 4, module lines 2308

## J3 · COMPLETE

Fix round 10, Wave A batch 3 (B2). Session session_01JWt7Mqtc8vPeZptturDMR6.

Fixtures published (`bio-plane/test/m/escalation/fixtures.mjs`, tests in `fixtures.test.mjs`, R2 R3 R22 R16): `escalationRead` (read, unknown and unseen refusal, `escalationsFor` over a determination with one, none, unknown, unseen) and `escalationsDue` (empty fresh world; one item after a real `escalationOpen`). Note for the users: the real item is `{id, project, opened_by, from, to, stage, instant, age_ms, ids, by}`, with `as_of`, `truncated`, `limit`; it carries no `state` (B2 listed one), and `stage` is the stage name (`notification`).

Own lines done (5, all FIX-E, re-pointed to actions' published `actionRead` / `actionsForRefusal`): `fixture.mjs` `noSuchAction(id)` is now actions' real refusal (R43, R106, `NO_SUCH_ACTION` naming the id), used for the unknown, no-action and hidden action in the stand-in `actionRead` (was lines 162, 163, 165) and in `draft.test.mjs` (the withheld action, was :143); `draft.test.mjs` the unreadable `actionsFor` takes `actionsForRefusal().unknownRead` (was :110). Markers added: none (no `fixtures-own`, no `fixtures-generic`, no `fixtures-contract`).

Left: `draft.test.mjs:113` (`consequences.consequencesOf` UNAVAILABLE), the one FIX-E line whose provider (consequences) is not merged in this batch; arrives as a CHANGE.

Checks: escalation tests 102 pass, 0 fail; format 0; architecture 0; coverage 38 of 38 live ids; words 0 (and the joint group names no escalation line); ownership 0; `checks/fixtures.mjs . escalation --list`: 1 line (the consequences one); impact: 0 affected modules.

Size (session_01JWt7Mqtc8vPeZptturDMR6): test runs 4, module lines 0

## J4 · COMPLETE

Fix round 10 batch 3 done (record J3). Published fixtures escalationRead and escalationsDue (fixtures.mjs + fixtures.test.mjs). Re-pointed my 5 own actions lines to actions' published fixtures. No fixtures-own/generic/contract markers added. Left: draft.test.mjs:113 (consequences, arrives as CHANGE). Note: the real escalationsDue item has age_ms and by, no state; stage is the name. Tests 102 pass; format, architecture, coverage (38/38), words, ownership 0 failures; impact 0 modules.

## J5 · COMPLETE

Follow-up 17 (B3) done. Test files only.

Entries applied:
- `bio-plane/test/m/escalation/draft.test.mjs:113` (R29's unreadable case): the consequences answer is no longer hand-built `{ok:false, reason:"UNAVAILABLE"}`. It is consequences' real refusal, taken from its published fixture `consequencesOfRefusal` (`bio-plane/test/m/consequences/fixtures.mjs`) for this draft's determination (`w.D`), which consequences does not hold: `NO_SUCH_DETERMINATION`. Import added at line 7. The expected parts (the two undetermined lines, the actions and consequences) are unchanged and still pass.
- Commit 1fb74fda1b (the escalation test change only).

Deferred: none. Found in other modules: none new.

Tests and checks (from /home/user/bio, absolute root):
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/escalation/*.test.mjs`: 102 tests, 102 pass, 0 fail.
- `node checks/fixtures.mjs /home/user/bio escalation --list`: 0 failures (3275 test files read; escalation's list is empty).
- `node checks/words.mjs /home/user/bio escalation`: 0 failures.
- `node checks/architecture.mjs /home/user/bio escalation`: 23 product files; 0 failures. No `uses` edge requested (consequences is earlier in the order; the test-side import is not a product edge).
- `node checks/format.mjs /home/user/bio`: 178 modules, 178 requirements files; 0 failures.
- `node checks/ownership.mjs /home/user/bio escalation tranche/T51`: 1 file changed by escalation; 0 failures.
- `node checks/coverage.mjs /home/user/bio escalation`: 38 of 38 live requirement ids named by a test; 0 failures.

Size (session_018J3iWfL3tx9JNibc3aC31F): test runs 2, module lines 0
