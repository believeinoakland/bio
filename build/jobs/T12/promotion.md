# promotion (T12)

**Status** · session_01WeEThE5XFsoayhvn9So6tj · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** N302: `CATALOG_VERSION` 1.41.0 -> 1.42.0 (`bio-plane/src/gate.mjs`, R34), stamping every check-row change since 1.41.0 was minted (7702929d29), read by diffing every file holding a `check: 'C-…'` row between that commit and `tranche/T12`, not only N302's list. The note above the constant names each row. EIGHT ARRIVALS: C-22.18 (ai-runs); C-112.11 (standards); C-113.22 (conformance); C-117.2, C-117.3, C-117.4, C-117.5, C-117.6 (actions). FOUR DEPARTURES: C-113.2, C-111.2, C-115.2, C-116.11. ONE CHANGED: C-113.17 (now refuses one condition, C-113.22 taking the absent reason). MOVED, NOT CHANGED: C-22.7's catalogue copy left (N299); ai-runs holds the row. Wording only: `where`s of C-73.6, C-90.2, C-113.12, C-44.1, C-44.3–.5, C-114.1, C-114.3, C-114.12–.17; translations of C-73.3, C-113.17, C-114.3, .10, .12, .17. T12's later rows (N306, K380) are N318's.

**Beyond N302's list** (found by the diff; stamped here because R34 needs one version per catalogue): actions' C-117.2 NO_SUCH_ACTION, C-117.3 ACTION_TOO_LARGE, C-117.6 ACTION_NO_DETERMINATION; intent's C-111.2 retired (N208); the wording-only moves above in actions, case-authoring and consequences.

**Deferred.** None in this module. A possible improvement, not made: R34's test checks that the stamp is in both gates' answer, not that the stamp moves when any row moves. Only the d470 census (legacy-tests', catalogue file only) guards that, which is why 1.40.0–1.42.0 were assembled by hand. A census over every module's row table, pinned beside `CATALOG_VERSION`, would guard R34 in full, but it would turn red in this tranche as soon as layers 8–9 change rows that N318 stamps. That is BOB's to word (reported).

**Found in other modules (reported to BOB).**
- legacy-tests: `test/d470-catalog-census.test.mjs` needs its 1.42.0 row: `"1.42.0": { count: 396, digest: "de54b8bd85553c5d588c0b82fdbf0ea48a4bed3fe47d982fd9a8c1e3c5c023fe", source: "8ada0f4c65a617f0e120bdfe8359f2b591d039b8a02e2cc3967d8aa27fd90f03" }`. It is red on A3 and A5 now; it was already red on A3 and A9 before this change, from N299. The count differs from 1.41.0's, so A4 needs no `changed`.
- Generated artifacts: `agent-worker/dist/agent-worker.bundled.mjs` and `bio-plane/dist/bio-plane.bundled.mjs` are stale (gate.mjs is an input of both). They are reported, not rebuilt.

**Tests and checks.**
- `node --test bio-plane/test/m/promotion/`: 67 pass, 0 fail, 0 todo.
- Legacy suites reading the stamp: `test/ratify.test.mjs` 43 pass, 0 fail; `test/conformance.test.mjs` 57 pass, 0 fail; `test/d470-catalog-census.test.mjs` 11 pass, 2 fail (A3, A5: the re-pin above).
- `bio-plane/test/fleetbundles.test.mjs`: agent-worker STALE (expected, above); ocr-worker and pdf-worker PASS.
- `checks/format.mjs`: 0 failures. `architecture.mjs promotion`: 0 failures. `coverage.mjs promotion`: 49 of 49 live ids named; 0 failures. `ownership.mjs promotion tranche/T12`: 1 file changed; 0 failures.

Size (session_01SZn97qkUSZot248omWCcQA): test runs 6, module lines 17

## Completion (B2 CHANGE, K422; PROMOTION #13, restarted)

**Applied** (03869d6d50). `test/m/promotion/write-path.test.mjs` now boots the plane's exported `Store` (N333's layer-2 share): Miniflare runs an inline probe at `src/write-path-probe.mjs` (a virtual path, no file) that re-exports `Store` from `./index.mjs` and relays each request to it, as `store.mjs`'s own default fetch does; `nodejs_compat` added as the plane's other Miniflare suites carry it; the unused `readFileSync` import removed. Nothing else changed. Before the change the suite failed `FACT_UNAVAILABLE producingGroup` (C-102.4), reproduced here.

**Deferred.** Nothing. **Found in other modules.** None. **Stale generated artifacts.** None (a test file only).

**Tests and checks** (on 03869d6d50):
- `node --test bio-plane/test/m/promotion/`: tests 67, pass 67, fail 0, todo 0.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture promotion`: 16 product files, 58 relative imports (1 naming no tracked file, not judged: the probe's `./index.mjs`, resolved from its virtual path); 0 failures. `coverage promotion`: 49 of 49 live requirement ids named by a test; 0 failures. `ownership promotion tranche/T12`: 1 file changed; legacy-checks and legacy-store 0 lines; 0 failures.

Size (session_01WeEThE5XFsoayhvn9So6tj): test runs 3, module lines 6

## J1 · REPORT

For other modules (details in my record's Completion):
1. legacy-tests (layer 11): d470-catalog-census needs its 1.42.0 row: count 396, digest de54b8bd85553c5d588c0b82fdbf0ea48a4bed3fe47d982fd9a8c1e3c5c023fe, source 8ada0f4c65a617f0e120bdfe8359f2b591d039b8a02e2cc3967d8aa27fd90f03. It fails A3 and A5 now; it already failed A3 and A9 after N299.
2. Generated artifacts made stale by gate.mjs: agent-worker/dist/agent-worker.bundled.mjs and bio-plane/dist/bio-plane.bundled.mjs. Reported, not rebuilt.
3. N302's list was incomplete. Diffing every row table since 7702929d29 also found: actions' C-117.2, C-117.3 and C-117.6 added; intent's C-111.2 retired; wording-only where and translation moves in actions (C-73.3, C-73.6, C-90.2), case-authoring (C-44.1, C-44.3–.5) and consequences (C-114.x). 1.42.0 stamps all of them.
4. For BOB to word (a promotion improvement, not made): R34's own test cannot see a row move. Only the d470 census guards that, and it covers the catalogue file only. A census over every module's row table, pinned beside CATALOG_VERSION, would guard R34 in full, but it would go red mid-tranche whenever a later layer changes rows before the next stamp.

## J2 · COMPLETE

N302 applied: CATALOG_VERSION 1.42.0 (8 arrivals, 4 departures, 1 changed, C-22.7 moved), commit f955769afc on job/T12/promotion. Promotion tests 67/0; format, architecture, coverage (49/49) and ownership: 0 failures. Stale bundles and the d470 re-pin are in the REPORT.
