# escalation (T18)

**Status** · session_01Sa2gjuhjzD2CRUGeynitk9 · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied** (`build/plan/current.md` layer 9, escalation):
- **N-A6, R16:** `escalationsDue` items carry the escalation's `project` and `opened_by` (the member who opened it), beside the edge, instant and age (`src/escalation/index.mjs` `escalationsDue`). Test: exit.test.mjs "R16 …" (an escalation opened by alice reads `opened_by: member:alice`, the others bob).
- **N-A6, R22:** `escalationsFor({determination, viewer})` is new: every escalation of the determination the viewer may see, oldest first (opened_at, then id), each with `id`, `state`, `stage`, `stage_name`, `opened_by`, `opened_at`; an absent, invisible or unnamed determination answers `conformance.noSuchDetermination` (its R19; no row of escalation's own); none answers `items: []`; a superseded determination still answers its escalations (R22 refuses only absent or invisible). Writes nothing; answers `PROVIDER_UNAVAILABLE` when conformance is absent, like every service. Test: exit.test.mjs "R22 …".
- **N-A6, R23:** `escalationAttach` refuses an action whose document states a `premise_override` (actions R8) `ACTION_PREMISE_OVERRIDDEN`, after `NO_SUCH_ACTION` and before `NOT_A_BREACH_ACTION` (so ahead of `STAGE_TAKES_NO_ACTION` too), its detail naming the action and the override. New row **C-116.45** `ACTION_PREMISE_OVERRIDDEN` (`where`: `escalationAttach > is-premise-established`, a 6-line DEC-49 region), **awaiting stamp** (rule (4): promotion stamps it in T19). Test: stages.test.mjs "R23 …" (breach with no leg, with this determination's leg, another's, and no breach; at stages 1, 2, 5 and 7; the machine, escalation and NO_SUCH_ACTION fences ahead of it; nothing written; the same action without the override attaches).
- **N242's share** (unclassified outcomes; 3-line regions): **already met** (ESCALATION #3, T11, N297: the five three-line regions widened, `#edgeArgs`' three outcomes classified). Confirmed on this tree: `node civicos-ui/check-refusal-codes.mjs --strict` prints no FAIL naming escalation or C-116, no escalation outcome among the unclassified (its one is record-core's), and every escalation region is 4–6 lines, each judged. The new region `is-premise-established` reads 6L, 1 judged, 1 code checked.

**Not yet met marks this work meets (rule (5)):** R22 "(not yet met: new; `action-plans` R6, R15)" and R23 "(not yet met: new)" in `build/requirements/escalation.md`; the Status line's "R22, R23 added, not yet met". BOB strikes them.

**Reading taken, no question needed:** R23's override is read from the action's document (`premise_override`, where actions R8 says it is stated), after `actionRead` has answered the action to this viewer, so the refusal does not depend on the field name actions' R25 read gives it (actions' N-A4 is not yet on `tranche/T18`). Any non-null value is an override. The stand-in `actionRead` in the fixture also answers `premise_override`, the name I expect R25 to use.

**Deferred:** none. The real-actions arm of R23 (an action written through `actions` with a member's override, then refused here) is not in `real.test.mjs` yet because actions' R8 override is not on `tranche/T18`; when BOB's CHANGE says actions and filings have merged, I can add it in minutes if BOB wants it (the stand-in test already proves the behaviour at this interface).

**Found in other modules:** none. The DEC-49 guard's floors (`rows`, `census`, `reach`, `governedSites`, `regions`, `regionLines`, `codesChecked`, `refusalsJudged`) each move by one with C-116.45; they are re-pinned at the release (K619), not here.

**Tests and checks run:**
- `node --test bio-plane/test/m/escalation/`: tests 31, pass 31, fail 0. No layer tests are named in `build/manifest.md`. No provided service changed meaning (R16 adds two fields, K569), so no user's suites re-run.
- `node checks/format.mjs /home/user/bio`: 82 modules, 77 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio escalation`: 10 product files, 41 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio escalation`: 23 of 23 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio escalation tranche/T18`: 6 files changed by escalation between tranche/T18 and HEAD; 0 failures.

Size (session_01Sa2gjuhjzD2CRUGeynitk9): test runs 3, module lines 42

## J1 · COMPLETE

ESCALATION #6 complete on job/T18/escalation. N-A6 applied: R16 escalationsDue items carry project and opened_by; R22 escalationsFor({determination, viewer}) new (oldest first, id/state/stage; conformance.noSuchDetermination for absent/invisible; items [] for none; writes nothing); R23 escalationAttach refuses an action whose document states premise_override ACTION_PREMISE_OVERRIDDEN after NO_SUCH_ACTION and before NOT_A_BREACH_ACTION, new row C-116.45 awaiting stamp (T19). N242's share already met since T11 (N297), confirmed with the DEC-49 guard on this tree: no FAIL names escalation; only release-pinned floors move by one. Marks met (rule 5): R22's and R23's 'not yet met', and the Status line's. R23 reads the override from the action's document, so it does not depend on actions' R25 field name; a real-actions arm can be added after actions and filings merge if you want it. Tests 31/31; format, architecture, coverage (23/23), ownership: 0 failures. Nothing in other modules. Ready to merge early for action-plans.

## B2 · CHANGE processed

Merged `tranche/T18` (filings, actions and action-clocks merged, K706). Added the real-actions arm of R23 (`real.test.mjs` "R23 over the real actions": a member's breach action with `premise_override: {reason}` and no `rests_on` leg, written through actions' own check, read back with its override, refused `ACTION_PREMISE_OVERRIDDEN` C-116.45 at stage 2 with nothing written; the same kind of action resting on the determination attaches). The override is now read by actions' own rule, `Actions.overrideOf` (`{reason}` with a non-empty reason, else none), so the two modules cannot disagree about what an override is; my earlier "any non-null value" reading is replaced.

Re-run after the merge: `node --test bio-plane/test/m/escalation/`: tests 32, pass 32, fail 0. DEC-49 guard: no FAIL names escalation, C-116 or the new code. format: 0 failures; architecture: 0 failures; coverage: 23 of 23; ownership: 7 files changed by escalation between tranche/T18 and HEAD; 0 failures.

Size (session_01Sa2gjuhjzD2CRUGeynitk9): test runs 6, module lines 40

