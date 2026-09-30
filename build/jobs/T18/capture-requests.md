# capture-requests (T18)

**Status** · session_01Ff7skf5DLANXvvLjjJWTYg · depth 2 · COMPLETE · handled B2

**Completion** (CAPTURE-REQUESTS #4, 2026-09-30)

Entries applied (`build/plan/current.md` layer 6, capture-requests; B1, B2):
- **C-28 less C-28.13 copied** into `src/capture-requests/checks.mjs` as `CAPTURE_REQUEST_CHECKS` (15 rows: C-28.1–.4, .6–.11, .14–.18), each row's code, number, translation and `where` unchanged, frozen; the catalogue's comments carried. The catalogue's copy stays (promotion's `gate.mjs` reads it), held twice for T19's layer 1 (rule (3), K529). **`awaiting stamp`** for T19's promotion job: every C-28 row copied (C-28.1–.4, .6–.11, .14–.18).
- **✱ `CAPTURE_PURPOSES`, `CAPTURE_UA_MODES`, `userAgentIsLegible` moved** into `checks.mjs` (the two lists now frozen) and deleted from `bio-checks.mjs` (28 lines removed, none added; `from` gained `legacy-checks`, K673). The module re-exports all four names from `index.mjs`.
- **Re-pointed:** `civicosUserAgent` and `RENDER_CAPTURE_CHECKS` to `acquisition`; `runPrincipalGate` to `run-rules` (after run-rules' early merge, `8d070e74ec`); in the tests, `drain.test.mjs`' `acquire` to `acquisition`, and every C-28 / C-83 / agent import to the module or `acquisition` (no module test reads the catalogue for these any more). Stale comments naming `capture` R1 and "the catalogue's composer" corrected.
- **Convert `leadslug`** (capture-requests' share, `build/jobs/T17/legacy-tests.md`): R3's lead test drives a legacy-typed `focus` and `problem` question as a lead, and no lead, an empty and a blank one each stored and answered `null`. The old suite is not deleted (K619).
- New tests: R34 (the table's exact rows, frozen, each `where` a region of this module; C-28.13 absent), R14 (the conduct vocabulary in full: both lists exact and frozen, the legibility rule's accepted and refused shapes).

Deferred: none.

Found in other modules (REPORT):
- `bio-checks.mjs` changed, so `agent-worker/dist/agent-worker.bundled.mjs` (its manifest hashes `bio-checks.mjs`, legacy-checks' input) and `bio-plane/dist/bio-plane.bundled.mjs` are stale until BOB regenerates them at the layer close (mechanics §14); not written by this job.
- The catalogue's C-28 family header comment and its C-28.13 row stay in `bio-checks.mjs`; the header's sentence about `CAPTURE_PURPOSES` now describes a list held in this module (for the catalogue's T19 job, when it deletes the C-28 copy).

Tests and checks (on `job/T18/capture-requests` after merging `tranche/T18` @ `8d070e74ec`):
- `node --test bio-plane/test/m/capture-requests/`: tests 63, pass 63, fail 0, skipped 0 (the Miniflare plane test included). No layer tests are named in `build/manifest.md`; no service this module provides changed.
- `format`: 82 modules, 77 requirements files; 0 failures. `architecture`: 9 product files, 31 relative imports; 0 failures. `coverage`: 44 of 44 live requirement ids named by a test; 0 failures. `ownership` (tranche/T18): 8 files; legacy-store 0 added, 0 removed; legacy-checks 0 added, 28 removed; 0 failures.

Size (session_01Ff7skf5DLANXvvLjjJWTYg): test runs 4, module lines 1579

## J1 · QUESTION

The ✱ deletion of `CAPTURE_PURPOSES`, `CAPTURE_UA_MODES` and `userAgentIsLegible` from `bio-checks.mjs` needs `legacy-checks` in capture-requests' `from`: `modules.json` (here and on `tranche/T18`) gives only `from: "legacy-store"`, so `checks/ownership.mjs` would refuse every removed catalogue line as "outside capture-requests' paths" (capture, entities, strength and ai-runs carry `legacy-checks` in their `from` for the same kind of move).

My best reading: BOB adds `legacy-checks` to capture-requests' `from` (`["legacy-store", "legacy-checks"]`) on `tranche/T18`, and I merge it with run-rules' merge. Until the answer comes I do the work as planned (the three names moved into `src/capture-requests/checks.mjs` and deleted from the catalogue, C-28 less C-28.13 copied) and hold the ownership check for after the merge. If BOB would rather the move be a copy (no ✱), say so and I keep the catalogue's three names.

## J2 · COMPLETE

Done on job/T18/capture-requests (tranche/T18 @ 8d070e74ec merged: run-rules and K673's from). C-28 less C-28.13 copied (awaiting stamp); ✱ CAPTURE_PURPOSES, CAPTURE_UA_MODES, userAgentIsLegible moved and deleted from the catalogue (28 lines removed, 0 added); civicosUserAgent and C-83 re-pointed to acquisition, runPrincipalGate to run-rules, drain.test's acquire to acquisition; leadslug's share converted. 63/63 module tests; format, architecture, coverage, ownership 0 failures. REPORT in the record: the agent-worker and bio-plane bundles are stale from the catalogue edit (regenerate at the close). Details in the record's Completion.
