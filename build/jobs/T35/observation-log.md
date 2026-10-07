# observation-log (T35)

**Status** · session_01A9EYJuESL7uTGS8gLgUrJf · depth 2 · COMPLETE · handled B1

## Completion (T35-30)

**Entries applied.** T35-30, the DEC-149 sweep's four M rows, worded as R36 states them (BOB's wording, K1801); every key, code and stored value unchanged (`plane` and `objective` stay the stored values of `actor_class` and `authority_kind`, R29):
- `vocabulary.mjs`:176, `OBSERVATION_ACTOR_CLASSES.plane`: "the scheduler of your group's Civicsmith looked, with no member and no machine behind it".
- `vocabulary.mjs`:198, `OBSERVATION_AUTHORITY_KINDS.objective`: "a standing objective your group's Civicsmith is monitoring for".
- `vocabulary.mjs`:626, R6's content-level detail when pages were left unread (`tier3_candidate`): "this document has pages no engine in your group's Civicsmith could read".
- `vocabulary.mjs`:1409, `CONDITION_KINDS["render-deferred"]`: opens "a render your group's Civicsmith could not do is held under its C-83 reason", the rest unchanged.
No check row's translation moved, so nothing awaits stamp. Rows already written keep their stored `detail` (R4, R22). The sweep's six X rows stay: `index.mjs`:784 and :885 ("this call carries nobody. The plane stamps …", the control plane's stamp named to a caller with none) and the `schema.mjs` comments :62, :109, :110, :131. One reading, not a question: `CONDITION_KINDS["notice-attestation-missed"]` says "for want of an instance key"; that is network-notices' and machinery-producers' term for the key (network-notices R13, R136), not "the instance" for the group's Civicsmith, and the sweep did not list it, so it stays.

**Tests.** `bio-plane/test/m/observation-log/vocabulary.test.mjs` gains R36's test: each of the four sentences held whole (the content detail at every arm `contentObservationsFor` composes it and in the row `observeExtraction` appends, and absent where no page was left unread), the keys unchanged and `render-deferred` still accepted by C-22.4, no exported vocabulary or published answer word saying "the plane", "this/the instance", "copy" or "server", and a row written with the old detail read back as written. Negative control: with the source change reverted the R36 test fails, the other nine pass.

**Deferred.** None.

**Found in other modules / stale artifacts (REPORT J1).** My change makes two generated artifacts stale (§14), neither mine to write: the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (:66472, :66677, :66939 embed the old sentences) and agent-worker's bundle `agent-worker/dist/agent-worker.bundled.mjs` (:1547, `render-deferred`; it bundles this module's `vocabulary.mjs` through `run-rules`). `release/bio-plane.bundled.mjs` and `newgroup/src/release.mjs` also carry the old text; they are release outputs, rebuilt at the release. No other module's test pins any of the four sentences (grep over the repository).

**Ran.** `node --test bio-plane/test/m/observation-log/`: tests 67, pass 67, fail 0. Layer tests: none named in `build/manifest.md`. No provided service changed (served wording only); as a check, the tests of the modules that read these vocabularies (extraction, reading-pipeline, capture-requests, retrieval, queue, machinery-producers, queue-producers, link-sweep, and two system suites; 24 files): tests 207, pass 207, fail 0. Checks (civicos-process): `format.mjs`: 130 modules, 129 requirements files; 2 failures, both accepted red 24 (`law-relations`' paths and tests entries, until T35-78). `architecture.mjs … observation-log`: 15 product files, 58 relative imports; 0 failures. `coverage.mjs … observation-log`: 36 of 36 live requirement ids named by a test; 0 failures. `ownership.mjs … observation-log tranche/T35`: 0 failures.

Size (session_01A9EYJuESL7uTGS8gLgUrJf): test runs 4, module lines 3235

## J1 · REPORT

Stale artifacts (record, Completion): R36's rewording makes the plane bundle bio-plane/dist/bio-plane.bundled.mjs (:66472, :66677, :66939) and agent-worker's bundle agent-worker/dist/agent-worker.bundled.mjs (:1547, render-deferred, through run-rules) stale; neither is mine to regenerate (§14). No other module's test pins the four sentences.

## J2 · COMPLETE

T35-30 applied: R36's four sentences (vocabulary.mjs :176, :198, :626, :1409) say your group's Civicsmith in K1801's words; keys and stored values unchanged; no check translation moved, nothing awaits stamp. R36 named by a test in test/m/observation-log/vocabulary.test.mjs (negative control run). Module tests 67/67; users' vocabulary tests 207/207; architecture, coverage (36/36), ownership: 0 failures; format: 2 failures, accepted red 24 only. Record: build/jobs/T35/observation-log.md, Completion. Pushed job/T35/observation-log.
