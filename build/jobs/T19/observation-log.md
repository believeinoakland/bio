# observation-log (T19)

**Status** · session_011739a9HGE4YavRmeCPffLH · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

B1's entry rests on draft-T19 layer 5, whose observation-log line ends "Counts.", but my requirements as folded (K764) state no count figures (no R names record-core's R63 for this module), and the store's `#counts` keys over this module's tables are `aiRunLog` (reads ai-runs' R42 hidden-run tail, a later module) and `observations`/`observationsNonLead`/`leads`, which the legacy-store map (§ sizes note, K621) gives to record-core's R64 disclosure keys. **My reading:** no count registration in this job; I register nothing with `registerCounts`. Carrying on on that reading (it decides nothing else I build).

Also, for the record (not a question): capture's observation listener moves to me per the legacy-store map (579, 585 → observation-log, move). I replace `store.mjs`' `capture.on("observation", "legacy-store", …)` (and its comment line) with one line calling my registration through the imported `observationLogOf`, so the reuse verdicts are not written twice between L5 and L10 (§12.2: a rewire, net removal). `#testimonyWithin`'s `#observe` call stays for legacy-store's job (the store does not run provenance's slot yet, so nothing is written twice there).

## J2 · REPORT

Found for other modules and for legacy-store (nothing here blocks this job):

1. **inquiry-grammar (L6), the `LEAD_CHECKS` arm handed over (B1, K787).** `vocabulary.test.mjs`'s R26 test no longer reads the catalogue. The arm it dropped asserted the catalogue's `LEAD_CHECKS` holds only `LEAD_NOT_EVIDENCE` (C-54.1); it belongs with C-54.1's owner: inquiry-grammar's test should assert its own `LEAD_CHECKS` is exactly `{LEAD_NOT_EVIDENCE: C-54.1}`. `lead.test.mjs`'s `leadLegFindings` arm (a lead id refused C-54.1 at a leg) is dropped likewise; inquiry-grammar's tests carry it. observation-log keeps only that its own `LEAD_CHECKS` holds no C-54.1 row.
2. **legacy-store (L10).** `store.mjs`' `#testimonyWithin` still writes the testimony look itself (`#observe`, 874–878): when its step switches to `provenance.testimonySlot()`, that call, its comment block (856–867) and `#observe` go, since observation-log's projection (R30) is registered on the slot. Capture's listener is already rewired (one line, `observationLogOf(ctx).listenToCapture(capture)`, approved B2).
3. **Generated artifact made stale (§14):** `bio-plane/dist/bio-plane.bundled.mjs` (inputs `src/observation-log/index.mjs`, `src/store.mjs`, `checks/bio-checks.mjs` changed); regenerate at the layer close. agent-worker's inputs from this module (`checks.mjs`, `vocabulary.mjs`) are unchanged.
4. **Old suites (not run, K619, K779):** `test/observation-log.test.mjs`:381 imports the catalogue's `AI_RUN_CHECKS`, now deleted; it fails at load. Nothing else in the repository imports it (product code, module tests, bundles' inputs re-scanned; the legacy-ui guard and old suites hold no copy).

## J3 · COMPLETE

**Entries applied (B1, current.md layer 5, draft-T19 layer 5, requirements as folded K764):**
- R30: `testimonyLook`, registered by the factory in provenance's testimony slot (its R52; provenance's module order runs it after content's, whatever order the modules are made in). One content-level `extract` row (member, the path's author, the bundle, the capture, PRESENT, no condition, referent content's `content_id` from `earlier`, the first-extraction detail); a refused row throws with `err.refusal`; answers null into the promotion's answer.
- R31: `listenToCapture(capture)` registers on capture's `observation` event under this module's name and appends each row through `observe(row, at)`, answering what it answers; the factory calls it when handed `deps.capture`. `store.mjs`: the legacy-store registration and its comment line replaced by `observationLogOf(ctx).listenToCapture(capture);` (B2; ownership: 1 added, 2 removed).
- Rule 1: `index.mjs` imports `contentMintState` from record-grammar `labels.mjs` and `isMachineIdentity` from `actors.mjs`; `vocabulary.test.mjs` drops the catalogue import, the C-22 parity arm and the `LEAD_CHECKS` arm (REPORT J2 hands it to inquiry-grammar); `lead.test.mjs` takes `BUNDLE_ID_RE` from record-grammar `ids.mjs` and drops the `leadLegFindings` arm (K787). No observation-log file imports the catalogue.
- The catalogue's held C-22 `AI_RUN_CHECKS` and its header deleted (235 lines, pure removal) after a re-scan: no product or module-test importer left (only the old suite `test/observation-log.test.mjs`, not run, K619/K779).
- Counts: none (B2, K804).

**Rs met, with tests** (K775 (6)): R30 — `registrations.test.mjs` "R30 the testimony look…", "R30 so op=contentaxis finds an extract row…", "R30 a refused row throws…"; R31 — "R31 capture's observation rows…", "R31 the factory registers…". Every other R as before (coverage 31/31).

**Deferred:** none. **Found elsewhere:** J2 (inquiry-grammar's arm, legacy-store's `#testimonyWithin`, the stale plane bundle, the old suite).

**Tests and checks:**
- `node --test bio-plane/test/m/observation-log/`: tests 56, pass 56, fail 0 (negative control: R30/R31 arms fail 4 of 5 with the projection and the registration broken).
- Users and neighbours (legacy-checks, record-core, promotion, provenance, capture, content, retrieval, inquiry, run-rules, ai-runs, capture-requests, skills, case-authoring, monitoring, queue, control-plane): tests 1272, pass 1190, fail 75 — the identical 75 failing tests with and without this change (ai-runs, queue, control-plane's R22, legacy-checks' rule 2 arm…; none new).
- format: 0 failures · architecture: 0 failures · coverage: 31 of 31 live ids named, 0 failures · ownership: legacy-store 1 added 2 removed, legacy-checks 0 added 235 removed, 0 failures.

Size (session_011739a9HGE4YavRmeCPffLH): test runs 6, module lines 3100
