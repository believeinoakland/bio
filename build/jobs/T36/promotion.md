# promotion (T36)

**Status** · session_01PfzH458a5tMgwWs1AQfAys · depth 2 · WORKING · handled B2

## J1 · REPORT

T36-8's stamp is done and pushed on `job/T36/promotion` @ `db387837ad`, over `tranche/T36` after its layer 1. The stamp of layer 2's own rows waits on their merges.

**The stamp.** `CATALOG_VERSION` moves 1.62.0 → **1.63.0** (MINOR). `ROW_CENSUS` is **1467 rows, `a72e0b63cd85272feb3b737b7da8c053db3bd54ecb9ad8e47f14332f530c6094`**. Against 1.62.0: 77 new rows, 44 changed, none departed. I checked every moved row against the T35 record that names it (standards, law-relations, acquisition, capture-requests, capture-sources, conformance, filing-templates, publication, duties, answers, admission, citation, case-authoring, answer-envelope, hypotheses, capture, extraction, provenance, attestation, reevaluation, intent, docket, bias). No row moved without a record. T36's layer 1 added and changed no row, and no record names a change to which checks a gate runs. `gate.mjs`'s 1.63.0 note lists the rows by family. The fixture `row-census-1.63.0.jsonl` is written and 1.62.0's is deleted. row-census: 8 pass, 0 fail.

**Note on C-137.** acquisition's C-137.1–.19 (its archive family) are stamped under the same numbers following's C-137.1–.20 hold. Each row is counted as its own. T36-10 (red 8) renumbers them, and that change is T37's stamp.

**What waits: layer 2's rows** (membership's, and credentials' keep-away and counts-read refusals, T36-7). As in T35, I re-pin 1.63.0 in place at each merge, so T36 names one catalogue. **Please send a CHANGE after credentials' merge** (or one after each L2 merge). I will check that the moved rows are exactly the ones its record names, then re-pin and complete.

**Pins that move with the stamp** (§14; summary by my reading worker, file:line):
- case-checker `bio-plane/src/case-checker/program.mjs`:4 (generated) embeds `CATALOG_VERSION` "1.62.0" and the old `ROW_CENSUS`. Its `program.test.mjs`:19/:23 and :49 are red until it is regenerated (`node bio-plane/src/case-checker/build-program.mjs`, first in K1540's order at L2's close).
- The plane bundle `bio-plane/dist/bio-plane.bundled.mjs`:26318, :139810 (generated): "1.62.0", the second inside the embedded `program.mjs`. `fleetbundles.test.mjs` `verifyFresh` stays stale until it is rebuilt.
- `build/modules.json`:39: swap promotion's `tests` entry `row-census-1.62.0.jsonl` → `row-census-1.63.0.jsonl`. Until then, format and ownership each show exactly this one failure.
- Every other module reads the version live. No other test pins "1.62.0". answer-envelope's `rows-before-r43.json` pins translations, re-pinned by their owners when they change, not by the stamp.

**Tests and checks.**
- promotion and d526: 118/119. The 1 red is accepted red 3 (`registry.test.mjs`, `MODULE_ORDER`, until T36-6).
- architecture: 0 failures. coverage: 56/56.
- format and ownership: 1 failure each, the swap above.

## Completion

**Entry applied (T36-8, T35's red 2 / T36's red 4).**
- **The stamp.** `CATALOG_VERSION` moves 1.62.0 → **1.63.0** (MINOR), over `tranche/T36` after L1 (`db387837ad`): T35's layers 3–11 rows, 77 new, 44 changed, none departed, each named by its T35 job record (J1). T36's layer 1 moved no row.
- **Re-pinned in place at L2's merges:** membership (K2090) moved no row. credentials (B3, K2093, `tranche/T36` @ 5b3d7fb633) moved exactly the rows its record names: C-29.31 AI_KEPT_AWAY, C-29.32 NO_REASON and C-96.44 SECURITY_COUNTS_UNREADABLE arrived; C-96.43 SECURITY_PERIOD_INVALID changed its `where` only.
- **Final `ROW_CENSUS`:** **1470 rows, `e9ef089b7a25c5e6fff51a1ee185b89dccf1c2364389129044b093a8a0d00af8`**. The fixture is `bio-plane/test/fixtures/row-census-1.63.0.jsonl`; 1.62.0's is deleted. `gate.mjs`'s 1.63.0 note lists every row by family. Red 4 is cleared up to L2. Rows T36's L3–L11 jobs add are T37's stamp.

**Deferred.** None.

**Reading (mechanics §17).** I read these whole myself: my requirements; `layers.md` layer 2's row; the plan's rules and T36-8; K1542, K1545, K1855; `row-census.mjs` and `row-census.test.mjs`; `gate.mjs`'s stamp, pin and the 1.62.0 note; and the Purpose of each used module. A worker read the rest of promotion's code and tests in full and grepped the repository for every reader of the version, the pin and the fixture. Its summary was about 3.9 KB, citing file:line. Nothing it left out mattered: the stamp changes no code path, only the constants and the fixture.

**Found in other modules (§14, for BOB at L2's close).**
- case-checker `src/case-checker/program.mjs`:4 (generated) embeds "1.62.0" and the old `ROW_CENSUS`. Its `program.test.mjs`:19/:23 and :49 stay red until it is regenerated.
- The plane bundle `dist/bio-plane.bundled.mjs` (generated) carries "1.62.0" twice.
- `build/modules.json`:39: swap promotion's `tests` entry `row-census-1.62.0.jsonl` → `row-census-1.63.0.jsonl` (BOB's at merge, B2).

**Tests and checks** (final tree, after B3's merge):
- `node test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (1.63.0, 1470 rows, `e9ef089b…`).
- `node --test test/m/promotion/ test/d526-refusal-order.test.mjs`: 119 pass, 0 fail. Red 3 cleared with membership's merge.
- credentials, membership and record-core: 454 pass, 0 fail.
- `checks/format.mjs`: 1 failure (the `modules.json` entry above).
- `checks/architecture.mjs bio promotion`: 0 failures.
- `checks/coverage.mjs bio promotion`: 56 of 56, 0 failures.
- `checks/ownership.mjs bio promotion tranche/T36`: 1 failure (the new fixture, until the swap).

Size (session_01PfzH458a5tMgwWs1AQfAys): test runs 8, module lines 3420
