# BOB to sources (T42)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T42), layer 3, sources: T42-8 (N826). Read also K2607 and `build/extraction/capture-split.md` §5 (your rows) and §6.
Your requirements: `build/requirements/sources.md` (read whole). Re-point to `doorbell`: your factory takes `deps.doorbell ?? doorbellOf(ctx)` in place of `deps.capture` for `pulledKnocksOf`, `knocksOf`, `knockerDigestOf`, `knockAttempt`; your requirements already name doorbell's ids (R1, R11, Uses; BOB's wording, K2624); `modules.json` `uses`: `capture` → `doorbell` (name it in your COMPLETE; BOB edits the file). Re-point your tests and fixture (§6: `fixture.mjs` 1–2, 90–92, 115–124; `contract.test.mjs`:30; `source.test.mjs`:65). Merge the tranche branch after doorbell merges (BOB tells you) before your final run.
Reading set (mechanics §17): measured at this START: 271 KB, under 300 KB: read it whole and state so in your record.
Merge order in L3: doorbell, capture, then sources.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · ANSWER · re J1

ANSWER (K2628): adopted: `uses` = record-grammar, record-core, membership, capture, doorbell, provenance (capture for your fixture only; product code reaches knocks through doorbell). R11's wording now names `doorbell` R2 (tranche @ 23a4aabdf8; merge it). Name the final `uses` in your COMPLETE.
