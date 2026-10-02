# plane (T22)

**Status** · session_01M2Ai5WCq95ADyqQPiCffH8 · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

Completion, on `job/T22/plane` @ e7f06820d6 (one commit over `tranche/T22` @ 7a83cbbd0d; no merge needed: no CHANGE has come, and my change depends on nothing merged in L11).

Entries applied:
(1) **R12 met** (K1061; inquiry R53, bias R40). `src/plane/store.mjs`: directly after `biasOf(ctx, { env })` (was :120), `biasOf(ctx).registerWorkProducts("finding", inquiryFindings(ctx, biasOf(ctx)))`, with `inquiryFindings` imported from `../inquiry/index.mjs`. Nothing else built. Proof, `test/m/plane/findings.test.mjs` (3 tests, all on the composition root, the class constructed for real over every real module):
 - A question concluded under its project's lens: inquiry's source offers its finding with the lens it was made under, and the kind is held (a second registration is `WORK_PRODUCTS_DECLARED`). No debt while the lens is unchanged. When the lens changes, the plane's `onAlarm` reaches the scheduler's `bias-debt` tick and the debt is raised (context project P, `at_open`, lens then and now, recipients `["ruth"]`, open). It reads back through `op=biasdebt` (bias R33–R38).
 - Negative control: a host where `finding` is taken before the plane registers it (so inquiry's findings are not bias's work products) raises no debt on the same flow.
 - Environment: with `BIAS_DEBT_DELAY_MS=7000`, `BIAS_DEBT_BATCH=3`, bias's wake is now+7000 and its sweep's batch 3; with neither set, the defaults (1000, 50).
 - Mutation check: with the R12 line removed, the first and third tests fail and the control passes.
(2) Re-scan (N469, N471, N480): nothing in plane's paths names a deleted file, `tools/`, the legacy store or the deleted plane `index.mjs` as live. The `store.mjs` / `src/index.mjs` / `legacy-store` mentions are past-tense provenance and stay. Two notes said "`store.mjs`" meaning plane's own live file (`src/plane/stats.mjs`:5, `test/m/plane/maps.mjs`:2), which reads like the deleted `src/store.mjs`. I qualified both as `src/plane/store.mjs`.

**Stale generated artifact (§14):** the plane bundle `bio-plane/dist/bio-plane.bundled.mjs`. `fleetbundles.test.mjs` is red on bio-plane only (staleness, byte identity, manifest sha). I regenerated nothing.

Deferred: none.

Found in other modules (no fault, for your record): `ai-runs`' constructor (`src/ai-runs/index.mjs`:111) already builds bias, with `env`, when the plane builds ai-runs (`store.mjs`:108). So bias's first build is there, not at :120, and :120 returns the same instance. The environment holds either way, and the R12 test pins it. If a future change built bias without `env` before ai-runs, the test's env arm would catch it.

Tests: `test/m/plane/` 36/36. `test/system/migrate-released.test.mjs` 543 pass, 0 fail. inquiry + bias suites 222 pass, 0 fail (sanity; I changed no service). Whole `test/m`: 4957 tests, 4936 pass, 9 fail, 12 todo. The 9 are exactly your accepted reds: control-plane catalogue-end:15 and doorbell:310; membership module-order:12, t9-notice-sight-bounds:185, promotion registry:58 (accepted red 4); queue-producers proposals:78, :124, :153, :167.
Checks: format 86 modules, 0 failures; architecture 0 failures; coverage 12 of 12 live ids, 0 failures (R12 now named, so plane leaves the coverage check's accepted list); ownership 5 files, 0 failures.
Merge order: after affordances, op-declarations and control-plane, as your START says. I will merge `tranche/T22` on a CHANGE if you want it before my merge.

Size (session_01M2Ai5WCq95ADyqQPiCffH8): test runs 11, module lines 475
