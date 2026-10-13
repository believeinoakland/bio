# escalation (T47)

**Status** · session_01WD3ZmTKBeisfe99Nk6Rbb4 · depth 2 · WORKING · handled B1

## Completion (ESCALATION #16)

**Reading.** The requirements (`build/requirements/escalation.md`), the module's code (`bio-plane/src/escalation/`, all five files) and its tests (`bio-plane/test/m/escalation/`, all fourteen files) were read whole by this session (464 KB). The used modules' Purpose and the services the Uses names, `build/requirements/action-records.md`, `build/extraction/actions-split.md` and layer 9's contract were read in full by a helper in this session, which wrote a digest citing each section (K2032, §17 (3)). No flaw was found in the module beyond the entries.

**Entries applied (T47-42).**
- (N962, N992; R36) C-116.41 `ESCALATION_BY_ACT_ONLY` and C-116.14 `ALREADY_ATTACHED` take their translations from `words.json`'s `refusal.ESCALATION_BY_ACT_ONLY` and `refusal.ALREADY_ATTACHED`, held verbatim in `ESCALATION_WORDS` and read by key (`checks.mjs`). Codes, numbers and `where`s are unmoved. C-116.27 `NOT_OPEN` stays as R35 states. Tests: `t47.test.mjs` (R36 ×2); `stopped.test.mjs`'s R33 test now lists the four keys.
- (N983, K3027; R37) the `escalation`, `escalationsdue` and `escalationreasondraft` arms pass no instant. A `now` in the query or the body is never read, so the reads run at the module's clock (`escalationOf`'s `now`). Tests: `codes-ops.test.mjs` R25 is re-pinned (no `nowMs`; its over-the-module test sets the module's clock). `t47.test.mjs` adds R37 ×2: the same request answers byte-identically with or without a `now`, and moving the clock across a deadline moves the proposal, the due list and the draft's passed date.
- (N961) `real.test.mjs` driving `action-records`: **held for BOB's CHANGE**, as START B1 says. `action-records` is not on the tranche yet, and today's `actions.actionScope` (line 367) is the only moved act the module's tests call. R30's code needs no change: `actions.actionRead` still answers `confidential` (`action-records` R5).

**Deferred.** None beyond N961, which waits on the CHANGE.

**Found in other modules (REPORT).**
- The generated artifacts that carry the two old translations are now stale: `bio-plane/dist/bio-plane.bundled.mjs`, `release/bio-plane.bundled.mjs`, `newgroup/src/release.mjs` and `newgroup/dist/newgroup.bundled.mjs`. Each is regenerated at layer close (mechanics §14).
- promotion's row census, `bio-plane/test/fixtures/row-census-1.74.0.jsonl`, still holds the two old translations of C-116.14 and C-116.41. This is accepted until T48's stamp (rule 5 (2)).
- The helper's digest flags that, in T47, `actions` R12 and R100 compute `clock_overdue` in `actionZone(fm, view)`, not in `place()`'s zone. Escalation calls `actionFacts(text, t, place)` with `actions.place()` or the combined view. With one active profile the two zones agree. Once actions' T47 job lands, BOB may want escalation's third argument checked against R100's signature; no escalation requirement names it today.

**Tests and checks.**
- `node --test bio-plane/test/m/escalation/`: tests 89, pass 89, fail 0.
- Users, since the ops map changed (P11):
  - pass with 0 fail: action-plans 79, plan-work 45, monitoring 137, action-producers 45, op-grades 79, wizard-scripts 82, `test/system/migrate-released.test.mjs` 1.
  - affordances 238/7 fail, op-declarations 144/12, answer-envelope 25/8, control-plane 235/7, plane 218/5. The failing tests are identical by name on `origin/tranche/T47` without this change (inherited reds, rule 5 7a/7b/7c/8); none is this job's.
- `checks/format.mjs`: 168 modules, 0 failures.
- `checks/architecture.mjs bio escalation`: 19 product files, 0 failures.
- `checks/coverage.mjs bio escalation`: 37 of 37 live ids named by a test, 0 failures.
- `checks/ownership.mjs bio escalation tranche/T47`: 6 files changed, 0 failures.
- `checks/run.mjs bio`: format 0, architecture 3106 product files 0 failures, channels 0. Coverage has 37 failures, all in other modules (screens-*, setup-words, signin-door, tasks, wizard-scripts and others); none is escalation's.

Size (session_01WD3ZmTKBeisfe99Nk6Rbb4): test runs 4, module lines 2374
