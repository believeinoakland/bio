# observation-log (T19)

**Status** · session_011739a9HGE4YavRmeCPffLH · depth 2 · WORKING · handled B2

## J1 · QUESTION

B1's entry rests on draft-T19 layer 5, whose observation-log line ends "Counts.", but my requirements as folded (K764) state no count figures (no R names record-core's R63 for this module), and the store's `#counts` keys over this module's tables are `aiRunLog` (reads ai-runs' R42 hidden-run tail, a later module) and `observations`/`observationsNonLead`/`leads`, which the legacy-store map (§ sizes note, K621) gives to record-core's R64 disclosure keys. **My reading:** no count registration in this job; I register nothing with `registerCounts`. Carrying on on that reading (it decides nothing else I build).

Also, for the record (not a question): capture's observation listener moves to me per the legacy-store map (579, 585 → observation-log, move). I replace `store.mjs`' `capture.on("observation", "legacy-store", …)` (and its comment line) with one line calling my registration through the imported `observationLogOf`, so the reuse verdicts are not written twice between L5 and L10 (§12.2: a rewire, net removal). `#testimonyWithin`'s `#observe` call stays for legacy-store's job (the store does not run provenance's slot yet, so nothing is written twice there).

## J2 · REPORT

Found for other modules and for legacy-store (nothing here blocks this job):

1. **inquiry-grammar (L6), the `LEAD_CHECKS` arm handed over (B1, K787).** `vocabulary.test.mjs`'s R26 test no longer reads the catalogue. The arm it dropped asserted the catalogue's `LEAD_CHECKS` holds only `LEAD_NOT_EVIDENCE` (C-54.1); it belongs with C-54.1's owner: inquiry-grammar's test should assert its own `LEAD_CHECKS` is exactly `{LEAD_NOT_EVIDENCE: C-54.1}`. `lead.test.mjs`'s `leadLegFindings` arm (a lead id refused C-54.1 at a leg) is dropped likewise; inquiry-grammar's tests carry it. observation-log keeps only that its own `LEAD_CHECKS` holds no C-54.1 row.
2. **legacy-store (L10).** `store.mjs`' `#testimonyWithin` still writes the testimony look itself (`#observe`, 874–878): when its step switches to `provenance.testimonySlot()`, that call, its comment block (856–867) and `#observe` go, since observation-log's projection (R30) is registered on the slot. Capture's listener is already rewired (one line, `observationLogOf(ctx).listenToCapture(capture)`, approved B2).
3. **Generated artifact made stale (§14):** `bio-plane/dist/bio-plane.bundled.mjs` (inputs `src/observation-log/index.mjs`, `src/store.mjs`, `checks/bio-checks.mjs` changed); regenerate at the layer close. agent-worker's inputs from this module (`checks.mjs`, `vocabulary.mjs`) are unchanged.
4. **Old suites (not run, K619, K779):** `test/observation-log.test.mjs`:381 imports the catalogue's `AI_RUN_CHECKS`, now deleted; it fails at load. Nothing else in the repository imports it (product code, module tests, bundles' inputs re-scanned; the legacy-ui guard and old suites hold no copy).
