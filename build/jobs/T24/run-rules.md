# run-rules (T24)

**Status** · session_01XiDMY8V5iF59Evun86B5pi · depth 2 · WORKING · handled B0

## Completion

**Entries applied** (B1 START; `build/plan/current.md` T24 L6, run-rules: N502; wording only, no meaning changed, no requirement changed):
- N502: `bio-plane/src/run-rules/checks.mjs`:4–5 said each row whose `where` the split re-pointed "is `awaiting stamp` for promotion's next job (T19)". 1.49.0 took them (`gate.mjs` stamp history, PROMOTION #20, T19 layer 2: "CHANGED … the `where`s of C-22.5, C-22.7, C-22.8, C-22.11–C-22.16, C-22.18 (run-rules)"). Re-worded to "each such change stamped by 1.49.0 (PROMOTION #20, T19 layer 2)".
- Re-scan of the module for the same kind (N469's rule), one more re-worded:
  - `rules.mjs`:798–799 (`checkRunContextKind`'s note) said "The store asks sight through `#inSight`", a private method of the retired legacy store. Today `ai-runs` asks sight through membership's `inSight` (`ai-runs/index.mjs`:597, :616). Re-worded to "`ai-runs` asks sight through membership's `inSight`".
  - Not stale (left as they are): `rules.mjs`:41, :60, :165–166, :285, :343, :491 and `checks.mjs`:223–226 name `store.mjs` only as history ("once `store.mjs`'s", "then `store.mjs`, now `ai-runs`", "was written twice inside"). The generic "the store" in `rules.mjs` (:668, :699, :725, :757, :797, :857) reads as the plane store `ai-runs` runs in. `aiRunOpen` (`skill-version.mjs`:172, `checks.mjs`:253) is `ai-runs`' own name for its open, which it still uses (`ai-runs/index.mjs`:721). No test carries a stale note.
- No catalogue row added or changed: both edits are comments. Red 5 (rows awaiting T25's stamp): none from this job.

**Deferred:** none.

**Read:** `build/requirements/run-rules.md` (whole), the module's code and tests (whole), its plan entry (N502), `plan/t24-stale-notes.md`, and `gate.mjs`'s 1.49.0 stamp note. Layer 6's contract and the Uses' public parts were not read: this wording-only job changes no call into them.

**Found in another module or artifact (REPORT J1):**
- The comment-only edits stale two generated bundles. Nothing was regenerated:
  - `agent-worker/dist/agent-worker.bundled.mjs` (owned by `agent-worker`): `fleetbundles.test.mjs` reports STALE BUNDLE against `run-rules/checks.mjs` and `rules.mjs`. That test passes without my edits.
  - the plane's `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`): its manifest lists `run-rules`, and the bundled file still carries the old wording.
- `build/requirements/run-rules.md`'s Status line still says "Not yet met: R13–R15 (new, K660)". All three are now met and named by passing tests (`rules.test.mjs` R13, `deployment.test.mjs` R14, `table.test.mjs` R15). The requirement text is BOB's.

**Tests and checks** (on `job/T24/run-rules` after merging `tranche/T24` @ d91bc1c77a):
- `node --test bio-plane/test/m/run-rules/`: tests 16, pass 16, fail 0.
- `node --test bio-plane/test/m/` (whole): tests 5236, pass 5225, fail 0, skipped 0, todo 11. No red beyond the accepted ones (none appeared).
- `checks/format.mjs`: 88 modules, 87 requirements files; 2 failures, both link-sweep's absent `paths` and `tests` directories (accepted red 4).
- `checks/architecture.mjs bio run-rules`: 10 product files, 15 relative imports; 0 failures.
- `checks/coverage.mjs bio run-rules`: 15 of 15 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs bio run-rules tranche/T24`: 3 files changed; 0 failures.
- `bio-plane/test/system/fleetbundles.test.mjs`: agent-worker STALE BUNDLE (reported above; it is not this job's to regenerate).

Size (session_01XiDMY8V5iF59Evun86B5pi): test runs 4, module lines 1703

## J1 · REPORT

Two things outside my module (wording job, no requirement change made): (1) My comment-only edits to bio-plane/src/run-rules/checks.mjs and rules.mjs stale two bundles: agent-worker/dist/agent-worker.bundled.mjs (agent-worker's; fleetbundles.test.mjs reports STALE BUNDLE against both files, and passes without my edits) and the plane's bio-plane/dist/bio-plane.bundled.mjs (not_product; its manifest lists run-rules). Nothing regenerated. (2) build/requirements/run-rules.md's Status line still says 'Not yet met: R13–R15 (new, K660)'; all three are met and named by passing tests. The requirement text is yours.
