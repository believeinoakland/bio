# promotion (T36)

**Status** · session_01PfzH458a5tMgwWs1AQfAys · depth 2 · WORKING · handled B0

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
