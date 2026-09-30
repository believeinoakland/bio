# retrieval (T15)

**Status** · session_01JyAyVDeMrxmFvfB74PUdqx · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entry applied** (layer 5's retrieval bullet; N352, K477; B1), commit 949caafa9a (+7 −14 in `src/retrieval/index.mjs`; +37 −6 in `test/m/retrieval/selections.test.mjs`):
- **`hiddenSet` is gone** (`src/retrieval/index.mjs`:73, with its misplaced comment at :66–68). Its two callers read `membership.hiddenBundles(viewer)` (membership R88) and pass the viewer the gate was built from:
  - `searchIndexCheck`'s `counts.indexed` (R17): `this.#indexedCount(hiddenBundles(viewer))`.
  - `selectionList`'s `bytes` (R21): `viewer === undefined ? null : hiddenBundles(viewer)`. The "never sent means whole" rule stays this module's, as R88 says.
- **Each caller's result is identical.** `hiddenBundles(v)` is byte-for-byte `hiddenSet(viewerPredicate(v))`: `null` for scope `member`, else the same SQL with the gate's args (copied). The new test below passes on the old code as well as the new.
- **Import edge:** `membership` is already in retrieval's `uses`; no new module is imported.
- **Tests:** the R60 test's hand-built copy of the set (`hidFor`) now reads `hiddenBundles`. A new test, `R17, R21, R29, R60 (N352)`, holds `searchIndexCheck`'s `indexed` and `selectionList`'s `bytes` to the figures taken through `hiddenBundles`. It covers a participant, a member outside the project, an administrator, the founder, a machine credential, and three refused viewers (absent, empty, unrecognised), and it pins how the set moves them.
- **`not yet met` marks my work meets:** none. N352 adds no retrieval requirement, and no retrieval id carries a mark for it.

**Rows (N318):** none added, moved or retired.

**Deferred:** none.

**Found in other modules / artifacts, and for BOB:**
1. **Generated artifacts (§14), not rebuilt.** `bio-plane/dist/bio-plane.bundled.mjs` and `agent-worker/dist/agent-worker.bundled.mjs` are now STALE against `src/retrieval/index.mjs` (source sha256 e30d872b46d0…; agent-worker's was built from a81306b99ee3…). `fleetbundles.test.mjs` passes on the tranche's `index.mjs` and fails on mine for exactly these two members.
2. **civicos-ui / affordances:** no hit for `hiddenSet` or `hiddenBundles`. `hiddenSet` was never exported, so nothing outside the module can have named it.
3. **Requirements text (BOB's), `build/requirements/retrieval.md`:**
   - Private › Uses › `membership` names `viewerPredicate`, `inSight`, `positionalMember`, `listenerRefusal` and `MODULE_ORDER`, but not `hiddenBundles` (R88), which R17, R21 and R60's subtraction now read. I suggest adding "`hiddenBundles` (R88) for R17's and R21's subtraction".
   - The Status line still says "R51–R53, not yet met" (N63, N65 (1)). R51, R52 and R53 are each tested and pass today (`selections.test.mjs` R51 and R52 ×2; `projection.test.mjs` R53), so the mark looks stale. My work did not meet them; I'm naming the mark only so BOB can judge it.
4. **legacy-tests:** project-sight's `stats-whole-store` arm is theirs to widen after N352 (per B1). Nothing of mine changes what it reads.

**Tests and checks** (base `tranche/T15` @ 790123dbdf; branch at 7f47967b33 + my commits):
- `node --test test/m/retrieval/` (from `bio-plane/`): before, tests 65, pass 65, fail 0. After, tests 66, pass 66, fail 0, todo 0.
- Identity control: the new test run over the old `index.mjs`: 15 of 15 pass in `selections.test.mjs`.
- Mutation controls: (a) `selectionList` subtracting nothing: 2 of 15 fail in `selections.test.mjs` (R21's and the new test). (b) `searchIndexCheck` subtracting nothing: 3 of 66 fail. Both restored.
- No layer tests are named in `build/manifest.md`. No service I provide changed, so no user's suite is owed.
- `node --test bio-plane/test/fleetbundles.test.mjs`: fails only on the two stale bundles in item 1 (passes before my change).
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture retrieval`: 13 product files, 47 relative imports; 0 failures. `coverage retrieval`: 61 of 61 live ids named by a test; 0 failures. `ownership retrieval tranche/T15`: 3 files; legacy-store 0 added, 0 removed; legacy-checks 0 added, 0 removed; 0 failures.

Size (session_01JyAyVDeMrxmFvfB74PUdqx): test runs 9, module lines 2202
