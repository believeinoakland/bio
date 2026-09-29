# agent-worker (T12)

**Status** · session_01DRuQmSgvivEsNW6ej9Jqmf · depth 2 · WORKING · handled B2

## Work

N304 (B1): the eight arms re-anchored and measured on `tranche/T12` @ `89107afbe8`, each run alone:
- `agent-worker.control` V1, V2, V4 re-anchored against what `coverage.mjs --strict` prints on the clean tree (taken once before the first V arm): V1's plane figures were pinned at `(100.0%)`, which op reach and check naming stopped being when they became reported figures (K153; clean 87.7% / 91.0%); V2 asserted `--strict` exits non-zero on the FLEET FLOOR, which N88 (K100 (1)) made reported, not gated (it now asserts the floor report names the lost member and the exit is the clean run's); V4 asserted no FLEET FLOOR line, and the clean tree already prints one (the arm floor, 71 < 100). V3's readout moved to the same baseline. V5 was already AS DECLARED; its stale "the 118" wording corrected.
- `harness.control` G2 re-anchored: `#aiRunTerminate` moved from `store.mjs` into `bio-plane/src/ai-runs/index.mjs` (T7), so its patch matched zero times. F1, G3 and G5 are AS DECLARED unchanged (airun 134/0 and skillsequencing 27/0 clean; the legacy `airun` failures N304 names are gone on this tree).
- Measured: V1–V5 AS DECLARED; F1, G2, G3, G5 AS DECLARED; D1–D5, O1 AS DECLARED.
- Sweep of the rest (own module's flaws): `harness.control` H1–H9, E1, E2 AS DECLARED (11 of 11; 10m03s, the chunk ran just over ten minutes: later chunks are smaller).
- `harness.control` F2–F4, G1, G4 AS DECLARED (3m57s); T1–T3, D1, D2, H10 AS DECLARED (7m18s; H10: harness 260/0, member 139/0, `--strict` exit 0). The whole driver: 26 of 26.
- `agent-worker.control` A1–A6, N1, N2 AS DECLARED (1m55s): the driver is 20 of 20. `fanout.control` 10 of 10 (4m58s); `wire-vocabulary.control` 5 of 5 (5m12s); `cascade.control` arms 1–3 red as declared, baseline 29/0; `versions.control` arms 1–3 red as declared, baseline 22/0. No control arm in this module is stale on `tranche/T12`.

## Completion

- **Applied:** N304. `agent-worker.control` V1, V2, V4 re-anchored on a clean-run `--strict` baseline (V3's readout with them; V5 held, wording only); `harness.control` G2 re-anchored on `bio-plane/src/ai-runs/index.mjs`. F1, G3, G5 needed no change on this tree. No source file changed; the bundle is not staled (no bundle input moved). R49 untouched.
- **Deferred:** none.
- **Found elsewhere:** the legacy `airun` suite failures N304 attributes to F1, G3, G5 do not reproduce on `tranche/T12` @ `89107afbe8` (`airun.test.mjs` 134/0, `skillsequencing.test.mjs` 27/0 clean; under the arms airun reads 134/0 in F1, 132/2 in G3 (V9, W3 as declared), 134/0 in G5), so no legacy-tests work arises from them. `coverage.mjs` (the plane's) still prints FLEET CONTROL for `agent-worker/test/requirements.test.mjs` (no negative-control declaration): reported, not gated (N88), noted only.
- **Not yet met marks met:** none (R40, R41, R47, R48 stand).
- **Tests:** agent-worker 139/0, cascade 29/0, fanout 185/0, harness 260/0, requirements 255/0, versions 22/0, wire-vocabulary 83/0. Controls: agent-worker 20/20, harness 26/26, fanout 10/10, wire-vocabulary 5/5, cascade and versions 3 arms red as declared with baselines green. No layer tests named in `build/manifest.md`.
- **Checks:** `format: 69 modules, 64 requirements files; 0 failures` · `architecture: 29 product files, 71 relative imports (0 naming no tracked file, not judged); 0 failures` · `coverage: 1 modules, 49 of 49 live requirement ids named by a test; 0 failures` · `ownership: 3 files changed by agent-worker between tranche/T12 and HEAD; 0 failures`.
- A lesson: my first full `agent-worker.control` run was cut by a shell `timeout` mid-arm and left two files armed (restored from git before any further run, verified clean). Arms are run by name, in chunks, never under a kill timer.

Size (session_01DRuQmSgvivEsNW6ej9Jqmf): test runs 25, module lines 54
