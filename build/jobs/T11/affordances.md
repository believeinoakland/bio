# affordances (T11)

**Status** · session_01B7kiVs24JbVTE4P4CTC88x · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (N310, K370):
- `JUSTIFICATION_REFUSALS` names `ACTION_MOVE_NO_REASON` (actions R13, K368); `NO_REASON` stays, the code of the other reasoned ops. `RUNGS.actionmove`'s backing comment names the new code. R19's plane drive of `actionmove` is green again.
- `determine` is graded `reasoned` (with conformance's N233): it left `RUNG_ABSENT` (`undetermined`) for `RUNGS`; the layer-9 comment in `RUNG_ABSENT` says so. R19's backing is driven at conformance's interface over its fixture's scene (`backing.test.mjs`): a first determination asks no reason (K212); a supersession with an absent reason (`undefined`, `""`, blanks) is refused `NO_REASON`, and with one accepted. The tests of R2 (reasoned list), R19 (family; the drives reach every `reasoned` op), R27 (the undetermined list) and the layer-9 table (R3 R7 R12) carry the change.

**Deferred:** nothing. No `not yet met` mark is met by this job (R26 stays not yet met, N231; its `test.todo` names the cause).

**Found for BOB** (in J1 REPORT):
- `build/requirements/affordances.md` R2's `reasoned` list does not name `determine`, and R27's count ("the 57 ops graded `undetermined`", "the action acts") predates it; the code and tests now grade `determine` `reasoned` (N310). BOB's wording.
- `bio-plane/test/rung-ladder.test.mjs` (legacy) fails at file level, identically before and after this change (checked by stashing): legacy-tests' to re-anchor.
- No generated artifact read by this change is stale beyond the plane bundle, which is `not_product` and rebuilt by BOB at the layer close (`affordances.mjs` is its input).

**Tests and checks run**
- `node --test test/m/affordances/` (bio-plane): before, 72 pass, 1 fail (R19 plane drive, `actionmove` → `ACTION_MOVE_NO_REASON`), 1 todo; after, tests 75, pass 74, fail 0, todo 1.
- Users of the changed tables: `node --test test/m/queue/`: tests 10, pass 10, fail 0 (control-plane has no module tests yet). Legacy `test/rung-ladder.test.mjs test/affordances.test.mjs`: pass 1, fail 1 before and after (above).
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures. `architecture.mjs … affordances`: 7 product files, 52 relative imports; 0 failures. `coverage.mjs … affordances`: 27 of 27 live requirement ids named by a test; 0 failures. `ownership.mjs … affordances tranche/T11`: 5 files changed by affordances; legacy-store 0/0, legacy-index 0/0; 0 failures.

Size (session_01B7kiVs24JbVTE4P4CTC88x): test runs 5, module lines 2713

## J1 · REPORT

Two findings outside my paths. (1) build/requirements/affordances.md: R2's `reasoned` list does not name `determine`, and R27's "57 ops graded `undetermined`" (naming the action acts) predates it; with N310 the code and tests grade `determine` `reasoned` (conformance R7 refuses an absent supersession reason NO_REASON; a first determination asks none, K212). Your wording. (2) Legacy bio-plane/test/rung-ladder.test.mjs fails at file level, identically before and after my change (checked by stashing): legacy-tests' to re-anchor. No generated artifact other than the plane bundle (not_product, rebuilt at your layer close) takes affordances.mjs as input.

## J2 · COMPLETE

N310 applied: JUSTIFICATION_REFUSALS names ACTION_MOVE_NO_REASON (actions R13); determine graded reasoned, its R19 backing driven at conformance's interface. Module tests 74 pass, 0 fail, 1 todo (R26, N231); queue 10/10; format, architecture, coverage (27/27), ownership: 0 failures. Record has the detail; findings in J1.
