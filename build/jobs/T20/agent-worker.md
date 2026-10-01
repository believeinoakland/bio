# agent-worker (T20)

**Status** · session_01LCAbc33dhaBdU5szJg3Mky · depth 2 · WORKING · handled B0

## Completion (AGENT-WORKER #7)

**Entries applied (B1).**
- K846 / K861 (6), plane R8: the four suites that stand up the real plane now name `bio-plane/src/plane/index.mjs` (plane R6's entry): `requirements.test.mjs`:65 `PLANE_ENTRY`; `harness.test.mjs`:132 `PLANE_INDEX` and :1643 `PLANE_IDX_PATH`, comment :1620; `agent-worker.test.mjs`:601 `PLANE_ENTRY`, comment :595; `versions.test.mjs`:117 `PLANE_IDX_PATH`, comment :24. Re-scan of `agent-worker/test/`: no other read of `bio-plane/src/index.mjs`. The `*.control.mjs` names of the member's own `src/index.mjs` and `src/index.mjs`:1560's note left, as B1 says.
- K882 (K820's share): `airun.mjs` citations re-worded to run-rules (comments and arm descriptions only): `src/harness.mjs` :138, :223, :245, :646; `src/subsession.mjs` :105, :117, :319; `test/harness.control.mjs` :232, :765, :767, :789 (B1's ":24" held no such citation); re-scan found one more, `test/fanout.test.mjs`:360. Left as history: `harness.control.mjs`:249 and `harness.test.mjs`:392, which already say the vocabulary moved from `airun.mjs` to run-rules. `DEFINITIVE_STATES` and `OBSERVATION_LEVELS` are observation-log's, re-exported by run-rules, so "run-rules" is accurate where cited.
- K890 (N437's share, K739): `fleet-member.json`'s top-level `note` re-worded to the readers now (`bio-plane/scripts/battery.mjs`, `bio-plane/scripts/fleet-bundle.mjs`), the coverage instrument named as retired and the surface held by the member's suites (R34). Text only; no key changed. It does NOT stale the bundle manifest (`fleet-member.json` is not a bundle input).

**Generated artifact.** The comment edits in `src/harness.mjs` and `src/subsession.mjs` staled the input hashes in `dist/agent-worker.bundle.json` (R45 went red). Regenerated with `npm run build` in `agent-worker/` (own artifact, as K816): the bundle's bytes are unchanged (sha256 `e6afb19e…eadd0`, 170331 B); only the two input hashes in the manifest moved. Nothing else staled.

**Deferred.** None.

**Found in another module (bundler, `bio-plane/test/system/fleetbundles.test.mjs`).** Red on `tranche/T20` before this change too (stash-checked): "agent-worker's 153 inputs are all recorded — … R48's pack check with everything it imports" expects the pre-T18-L6 input set; since K683 the member has 13 first-party inputs (no catalogue/skills). Also, on the unchanged tree, two arms "(j) … name `node tools/bundles.mjs`" and "(j) the corpus is non-empty" fail; on this branch they pass. Against build/manifest.md's verify line ("0 fail"), bundler's.

**Tests and checks.**
- agent-worker 140 passed, 0 failed; harness 261/0; fanout 184/0; cascade 29/0; versions 20/0; wire-vocabulary 83/0; plan 55/0; requirements 272/0 (real-plane sections in requirements, harness R, agent-worker §8, versions B all against `src/plane/index.mjs`).
- `fleetbundles.test.mjs`: agent-worker "no staleness, no recipe drift, no unresolvable import" PASS; one fail, bundler's, above.
- format: 84 modules, 82 requirements files; 0 failures. architecture: 31 product files, 83 relative imports; 0 failures. coverage: 53 of 53 live requirement ids named by a test; 0 failures. ownership: see commit (re-run after commit, below).

Size (session_01LCAbc33dhaBdU5szJg3Mky): test runs 12, module lines 25
