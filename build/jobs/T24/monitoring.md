# monitoring (T24)

**Status** · session_01LubdwpQSMaaKPPQPfezUV3 · depth 2 · WORKING · handled B3

## J1 · QUESTION

Two readings I am building on; I carry on with the job on them, and none of them decides what I build next.

(1) C-18.16 `SWEEP_TERM_REFUSED` stays in monitoring's table, as `SWEEP_TERM_CHECKS` (renamed from `SWEEP_CHECKS`), its row unchanged (`where` stays `src/monitoring/index.mjs gatheringCheck > is-sweep-term`): R66 keeps that refusal minted in monitoring's `gatheringCheck` (one refusal, `SWEEP_TERM_REFUSED` before `GATHERING_REFUSED`), and a row lives with the site that mints its code (DEC-49). A registered grammar marks a refused term by a finding carrying `code: "SWEEP_TERM_REFUSED"`. C-18.17 and C-18.18 leave with the fence (`sweepFence` moves to link-sweep), so their `where`s change in link-sweep's job. Consequence: from my merge until link-sweep's, the row census (`row-census.test.mjs`) reads two rows fewer (1071, not 1073); I ask that this be accepted with red 7 (the sweep's composition), or name it red 10. Link-sweep's requirements' Suggestion that its table holds all three codes binds nothing; if you rule C-18.16 moves too, I move it (the refusal's row then has to reach monitoring through the registration, which R66's signature does not carry).

(2) R66 "With nothing registered, C-18.5 reads no sweep arm (a `sweeps[]` entry draws no finding of R27's)": I read it whole, so with nothing registered no `sweeps[]` entry draws any finding, not even "is not an object"; with a share registered, a non-object entry is monitoring's finding and an object entry is the grammar's.

Also, for your planning: `sweep_runs` and `sweep_filed` leave my schema and purge declaration (link-sweep's, per its Size and Suggestions); `queue-producers` calls `monitoring.sweepConditions` (its index.mjs:2911), which leaves with N506, so its R26 sweep items go dark from my merge until its L11 re-point. I report every red my merge makes in `bio-plane/test/m`, by file and line, in COMPLETE.

## Completion

Entries applied, signatures, reds and reports: as in J2 below. Deferred: none.

Tests and checks run, with summary lines:
- `node --test bio-plane/test/m/monitoring/` → tests 99, pass 99, fail 0.
- `node --test bio-plane/test/m/` → tests 5246, pass 5222, fail 13 (each named in J2; baseline before my change: fail 4).
- `node --test bio-plane/test/system/fleetbundles.test.mjs` → the plane bundle STALE (reported, not regenerated).
- `node --test bio-plane/test/system/row-census.test.mjs` → census 1070 rows against the pin's 1073 (red 7, K1206).
- `checks/format.mjs` → 2 failures (red 4). `checks/architecture.mjs monitoring` → 0 failures. `checks/coverage.mjs monitoring` → 57 of 65, 1 failure (the requirements file's retirement wording, J2). `checks/ownership.mjs monitoring tranche/T24` → 15 files, 0 failures.

Size (session_01LubdwpQSMaaKPPQPfezUV3): test runs 30, module lines 3208
