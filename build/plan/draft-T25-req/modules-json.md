# modules.json — the edits for N512 and N513

> **DRAFT by a worker for BOB #100, not reviewed.** 2026-10-02, on `tranche/T24` (P18), for T25's opening fold 3. The lines are `build/modules.json`'s at `tranche/T24`. Nothing here is applied yet.

Checked by a script over the file with these edits applied. Every module's `uses` names only earlier modules (P4); the only exception is `legacy-ui`'s `*earlier`, which is already there. Layers stay monotone in the order. No new path overlaps another module's. The order around the new modules is: … host-governor, **provenance, attestation, provenance-routes**, capture-sources, acquisition, capture, sources, **calibration, reading-pipeline, extraction**, content ….

## 1. New entries

Insert after line 30 (`provenance`), before `capture-sources`:

```json
    {"id": "attestation", "layer": 3, "paths": ["bio-plane/src/attestation/"], "tests": ["bio-plane/test/m/attestation/"], "uses": ["record-grammar", "signatures", "record-core", "membership", "credentials", "promotion", "provenance", "test-support"]},
    {"id": "provenance-routes", "layer": 3, "paths": ["bio-plane/src/provenance-routes/"], "tests": ["bio-plane/test/m/provenance-routes/"], "uses": ["record-grammar", "record-core", "membership", "credentials", "promotion", "provenance", "test-support"]},
```

Insert after line 35 (`calibration`), before `extraction`:

```json
    {"id": "reading-pipeline", "layer": 4, "paths": ["bio-plane/src/reading-pipeline/", "bio-plane/src/readingprov.mjs"], "tests": ["bio-plane/test/m/reading-pipeline/", "bio-plane/test/d606-perpage-ocr.test.mjs", "bio-plane/test/tier2-wire.test.mjs", "bio-plane/test/tier-pagewise.probe.mjs", "bio-plane/test/system/pdf-worker-binding.test.mjs", "bio-plane/test/fixtures/d460/", "bio-plane/test/fixtures/cpdf20/tier2-recorded.json"], "uses": ["jurisdictions", "test-support", "pdf-reader", "format-registry", "text-chain", "docprofile", "pdf-worker", "ocr-worker", "capture-sources"]},
```

Notes on the new entries:
- **attestation**, `uses`:
  - services: `record-grammar` (`isPublicHttpsLocator`), `signatures` (the TSA and archive constants), `record-core` (evidence store, `readFile`, `declarePurge`), `provenance` (`registerHolds`, `homeOf`, R48's contract, the C-103 rows of its R58);
  - the shared test world only (`provenance`'s fixture builds record-core, membership, credentials, promotion and provenance): `membership`, `credentials`, `promotion`, `test-support`.
- **provenance-routes**, `uses`:
  - services: `record-grammar` (`isMachineIdentity`), `record-core`, `membership` (`viewerPredicate`, `sight`), `promotion` (`promote`), `provenance` (`DOORBELL_ORIGIN`, the C-103.3 row);
  - the test world only: `credentials`, `test-support`.
  - No edge to `attestation`, which comes before it, because neither calls the other.
- **reading-pipeline**, `uses`:
  - from the code: `text-chain`, `format-registry`, `docprofile` (pipeline and `readingprov.mjs`), `capture-sources` (`drive.mjs`), `pdf-worker` and `ocr-worker` (bindings, and the member definitions the moved tests import);
  - from the moved tests: `pdf-reader` (`pdfstructure.mjs` in `tier2-wire.test.mjs` and `tier-pagewise.probe.mjs`), `jurisdictions` (`combine` for a test's view) and `test-support` (`stdio.mjs`, `sandbox.mjs`).
  - **Not** `record-grammar`. The splits draft lists it, but neither file imports it. Add it if the job's fixture needs it, which is legal (P4).
  - **Not** `calibration`, whose live calibration is a callback. If the moved fixture builds a real calibration (`read.test.mjs`'s `calibration` helper), the edge is legal too (calibration is earlier).
  - `paths` lists `bio-plane/src/readingprov.mjs` as well as its directory. Under the opening's rule, "a split's new module owns its moved files from the opening", this module's job moves the file. That path is dropped at reading-pipeline's L4 merge, when the file no longer exists. `extraction/pipeline.mjs` stays under `extraction`'s directory path, and extraction's job deletes it (T24 L10's pattern).
  - `tests` takes over the six legacy-path tests and fixtures from `extraction`. Their files do not move, so they are re-owned at the fold.

## 2. Edits to existing entries

### 2.1 `extraction` (line 36)

`paths` drops `bio-plane/src/readingprov.mjs` (now reading-pipeline's); `tests` drops the six moved paths; `uses` gains `reading-pipeline` (after `calibration`). `pdf-worker` is kept: dropping it is the L4 job's to measure (splits draft E-1).

Before:
```json
    {"id": "extraction", "layer": 4, "paths": ["bio-plane/src/extractrun.mjs", "bio-plane/src/readingprov.mjs", "bio-plane/src/extraction/"], "tests": ["bio-plane/test/m/extraction/", "bio-plane/test/d606-perpage-ocr.test.mjs", "bio-plane/test/tier2-wire.test.mjs", "bio-plane/test/tier-pagewise.probe.mjs", "bio-plane/test/system/pdf-worker-binding.test.mjs", "bio-plane/test/fixtures/d460/", "bio-plane/test/fixtures/cpdf20/tier2-recorded.json"], "uses": ["record-grammar", "jurisdictions", "text-chain", "format-registry", "office-readers", "docprofile", "pdf-worker", "ocr-worker", "record-core", "membership", "capture-sources", "capture", "acquisition", "provenance", "promotion", "calibration", "test-support", "pdf-reader"]},
```
After:
```json
    {"id": "extraction", "layer": 4, "paths": ["bio-plane/src/extractrun.mjs", "bio-plane/src/extraction/"], "tests": ["bio-plane/test/m/extraction/"], "uses": ["record-grammar", "jurisdictions", "text-chain", "format-registry", "office-readers", "docprofile", "pdf-worker", "ocr-worker", "record-core", "membership", "capture-sources", "capture", "acquisition", "provenance", "promotion", "calibration", "reading-pipeline", "test-support", "pdf-reader"]},
```

### 2.2 `acquisition` (line 32)

`uses` gains `attestation` (`attest`, `signReceipt`; `index.mjs`:30, :1025).

Before:
```json
    {"id": "acquisition", "layer": 3, "paths": ["bio-plane/src/acquisition/"], "tests": ["bio-plane/test/m/acquisition/"], "uses": ["record-grammar", "jurisdictions", "subresources", "odf-reader", "format-registry", "docprofile", "record-core", "host-governor", "provenance", "capture-sources"]},
```
After:
```json
    {"id": "acquisition", "layer": 3, "paths": ["bio-plane/src/acquisition/"], "tests": ["bio-plane/test/m/acquisition/"], "uses": ["record-grammar", "jurisdictions", "subresources", "odf-reader", "format-registry", "docprofile", "record-core", "host-governor", "provenance", "attestation", "capture-sources"]},
```

### 2.3 `capture` (line 33)

`uses` gains `attestation` (`attest`; `index.mjs`:28, :979; capture R68's `reattest`).

Before:
```json
    {"id": "capture", "layer": 3, "paths": ["bio-plane/src/capture/"], "tests": ["bio-plane/test/m/capture/", "bio-plane/test/cap13-reuse-pages.test.mjs", "bio-plane/test/d57selflink.test.mjs"], "uses": ["record-grammar", "jurisdictions", "subresources", "odf-reader", "format-registry", "docprofile", "record-core", "membership", "credentials", "host-governor", "provenance", "capture-sources", "acquisition", "signatures", "test-support"]},
```
After:
```json
    {"id": "capture", "layer": 3, "paths": ["bio-plane/src/capture/"], "tests": ["bio-plane/test/m/capture/", "bio-plane/test/cap13-reuse-pages.test.mjs", "bio-plane/test/d57selflink.test.mjs"], "uses": ["record-grammar", "jurisdictions", "subresources", "odf-reader", "format-registry", "docprofile", "record-core", "membership", "credentials", "host-governor", "provenance", "attestation", "capture-sources", "acquisition", "signatures", "test-support"]},
```

### 2.4 `case-authoring` (line 66)

`uses` gains `attestation` (`attestationsOf`; `index.mjs`:1145, R35).

Before:
```json
    {"id": "case-authoring", "layer": 8, "paths": ["bio-plane/src/case-authoring/"], "tests": ["bio-plane/test/m/case-authoring/"], "uses": ["record-grammar", "record-core", "membership", "provenance", "extraction", "content", "bias", "observation-log", "inquiry", "basis-versions", "strength", "contradiction", "reevaluation", "publication", "ratification", "capture", "sources", "case-grammar", "credentials", "network-notices"]},
```
After:
```json
    {"id": "case-authoring", "layer": 8, "paths": ["bio-plane/src/case-authoring/"], "tests": ["bio-plane/test/m/case-authoring/"], "uses": ["record-grammar", "record-core", "membership", "provenance", "attestation", "extraction", "content", "bias", "observation-log", "inquiry", "basis-versions", "strength", "contradiction", "reevaluation", "publication", "ratification", "capture", "sources", "case-grammar", "credentials", "network-notices"]},
```

### 2.5 `filings` (line 76)

`uses` gains `attestation` (`attestationsOf`; `index.mjs`:897, R9).

Before:
```json
    {"id": "filings", "layer": 9, "paths": ["bio-plane/src/filings/"], "tests": ["bio-plane/test/m/filings/"], "uses": ["record-grammar", "jurisdictions", "record-core", "membership", "promotion", "provenance", "content", "publication", "standards", "conformance", "consequences", "actions", "action-clocks", "public-read", "strength", "filing-templates", "local-facts"]},
```
After:
```json
    {"id": "filings", "layer": 9, "paths": ["bio-plane/src/filings/"], "tests": ["bio-plane/test/m/filings/"], "uses": ["record-grammar", "jurisdictions", "record-core", "membership", "promotion", "provenance", "attestation", "content", "publication", "standards", "conformance", "consequences", "actions", "action-clocks", "public-read", "strength", "filing-templates", "local-facts"]},
```

### 2.6 `network-notices` (line 64)

`uses` gains `attestation` (`instanceStatement`, `instanceSign`, `instanceKeys`, `instanceKeyBound`; R1, R13, R21).

Before:
```json
    {"id": "network-notices", "layer": 8, "paths": ["bio-plane/src/network-notices/"], "tests": ["bio-plane/test/m/network-notices/"], "uses": ["record-grammar", "signatures", "record-core", "membership", "credentials", "promotion", "host-governor", "provenance", "capture", "publication", "public-read", "project-stage"]},
```
After:
```json
    {"id": "network-notices", "layer": 8, "paths": ["bio-plane/src/network-notices/"], "tests": ["bio-plane/test/m/network-notices/"], "uses": ["record-grammar", "signatures", "record-core", "membership", "credentials", "promotion", "host-governor", "provenance", "attestation", "capture", "publication", "public-read", "project-stage"]},
```

### 2.7 `retrieval` (line 44)

`uses` gains `provenance-routes` (`routeFinding` and R63's join; `index.mjs`:24, `roster.test.mjs`:9, its fixture's migration).

Before:
```json
    {"id": "retrieval", "layer": 5, "paths": ["bio-plane/src/retrieval/"], "tests": ["bio-plane/test/m/retrieval/"], "uses": ["record-grammar", "record-core", "membership", "promotion", "provenance", "capture", "extraction", "content", "entities", "connections", "observation-log", "query-language"]},
```
After:
```json
    {"id": "retrieval", "layer": 5, "paths": ["bio-plane/src/retrieval/"], "tests": ["bio-plane/test/m/retrieval/"], "uses": ["record-grammar", "record-core", "membership", "promotion", "provenance", "provenance-routes", "capture", "extraction", "content", "entities", "connections", "observation-log", "query-language"]},
```

### 2.8 `affordances` (line 82)

`uses` gains `attestation` and `provenance-routes`. **Not in `draft-T25.md` fold 3's list**, but its L11 entry needs them: `catalogue.test.mjs`:958 reads the new checks files, and `backing.test.mjs` migrates the new modules. BOB's to confirm.

Before:
```json
    {"id": "affordances", "layer": 11, "paths": ["bio-plane/src/affordances.mjs", "bio-plane/src/affordances/"], "tests": ["bio-plane/test/m/affordances/"], "uses": ["action-clocks", "action-plans", "jurisdictions", "record-core", "membership", "promotion", "content", "entities", "connections", "progressions", "inquiry", "citation", "basis-versions", "contradiction", "intent", "publication", "ratification", "case-authoring", "standards", "conformance", "consequences", "actions", "filings", "escalation", "capture", "sources", "record-grammar", "action-grammar", "credentials", "filing-templates", "local-facts", "provenance", "observation-log", "bias", "strength", "reevaluation", "monitoring"]},
```
After:
```json
    {"id": "affordances", "layer": 11, "paths": ["bio-plane/src/affordances.mjs", "bio-plane/src/affordances/"], "tests": ["bio-plane/test/m/affordances/"], "uses": ["action-clocks", "action-plans", "jurisdictions", "record-core", "membership", "promotion", "content", "entities", "connections", "progressions", "inquiry", "citation", "basis-versions", "contradiction", "intent", "publication", "ratification", "case-authoring", "standards", "conformance", "consequences", "actions", "filings", "escalation", "capture", "sources", "record-grammar", "action-grammar", "credentials", "filing-templates", "local-facts", "provenance", "attestation", "provenance-routes", "observation-log", "bias", "strength", "reevaluation", "monitoring"]},
```

### 2.9 `control-plane` (line 89)

`uses` gains `attestation` and `provenance-routes` (`families.mjs`:19, :82 gain C-89's and C-34's files; `record.mjs`:17's ops spread).

Before:
```json
    {"id": "control-plane", "layer": 11, "paths": ["bio-plane/src/control-plane/"], "tests": ["bio-plane/test/m/control-plane/"], "uses": ["text-chain", "acquisition", "monitoring", "agent-worker", "ocr-worker", "record-core", "runtime-limits", "subresources", "queue", "tasks", "signatures", "membership", "promotion", "provenance", "capture-sources", "capture", "calibration", "extraction", "content", "entities", "connections", "progressions", "bias", "observation-log", "retrieval", "inquiry", "citation", "strength", "contradiction", "ai-runs", "run-rules", "run-productions", "capture-requests", "skills", "intent", "reevaluation", "publication", "ratification", "case-authoring", "review", "standards", "conformance", "consequences", "actions", "action-clocks", "filings", "escalation", "action-plans", "affordances", "instance-setup", "sources", "op-declarations", "admission", "public-read", "record-grammar", "credentials", "inquiry-grammar", "basis-versions", "action-grammar", "filing-templates", "local-facts", "network-notices", "link-sweep"]},
```
After:
```json
    {"id": "control-plane", "layer": 11, "paths": ["bio-plane/src/control-plane/"], "tests": ["bio-plane/test/m/control-plane/"], "uses": ["text-chain", "acquisition", "monitoring", "agent-worker", "ocr-worker", "record-core", "runtime-limits", "subresources", "queue", "tasks", "signatures", "membership", "promotion", "provenance", "attestation", "provenance-routes", "capture-sources", "capture", "calibration", "extraction", "content", "entities", "connections", "progressions", "bias", "observation-log", "retrieval", "inquiry", "citation", "strength", "contradiction", "ai-runs", "run-rules", "run-productions", "capture-requests", "skills", "intent", "reevaluation", "publication", "ratification", "case-authoring", "review", "standards", "conformance", "consequences", "actions", "action-clocks", "filings", "escalation", "action-plans", "affordances", "instance-setup", "sources", "op-declarations", "admission", "public-read", "record-grammar", "credentials", "inquiry-grammar", "basis-versions", "action-grammar", "filing-templates", "local-facts", "network-notices", "link-sweep"]},
```

### 2.10 `plane` (line 90)

`uses` gains `attestation` and `provenance-routes` (`attestationOf` with `signingKey`, `door.mjs`:12's `attestOp`, `provenanceRouteOps` beside `provenanceOps` in `store.mjs`:301, `maps.mjs`:15).

Before:
```json
    {"id": "plane", "layer": 11, "paths": ["bio-plane/src/plane/", "bio-plane/wrangler.jsonc", "bio-plane/package.json", "bio-plane/package-lock.json", "bio-plane/.gitignore", "bio-plane/.dev.vars.example"], "tests": ["bio-plane/test/m/plane/", "bio-plane/test/system/migrate-released.test.mjs"], "uses": ["record-grammar", "signatures", "record-core", "membership", "credentials", "promotion", "host-governor", "provenance", "capture", "calibration", "extraction", "content", "entities", "connections", "progressions", "bias", "observation-log", "retrieval", "inquiry-grammar", "inquiry", "citation", "basis-versions", "strength", "contradiction", "ai-runs", "run-productions", "capture-requests", "intent", "reevaluation", "publication", "public-read", "project-stage", "ratification", "case-authoring", "review", "standards", "conformance", "consequences", "actions", "action-clocks", "filings", "escalation", "action-plans", "monitoring", "link-sweep", "scheduler", "affordances", "tasks", "queue", "instance-setup", "op-declarations", "control-plane", "local-facts", "filing-templates", "test-support", "network-notices", "subresources", "bundler", "corpus-export"]},
```
After:
```json
    {"id": "plane", "layer": 11, "paths": ["bio-plane/src/plane/", "bio-plane/wrangler.jsonc", "bio-plane/package.json", "bio-plane/package-lock.json", "bio-plane/.gitignore", "bio-plane/.dev.vars.example"], "tests": ["bio-plane/test/m/plane/", "bio-plane/test/system/migrate-released.test.mjs"], "uses": ["record-grammar", "signatures", "record-core", "membership", "credentials", "promotion", "host-governor", "provenance", "attestation", "provenance-routes", "capture", "calibration", "extraction", "content", "entities", "connections", "progressions", "bias", "observation-log", "retrieval", "inquiry-grammar", "inquiry", "citation", "basis-versions", "strength", "contradiction", "ai-runs", "run-productions", "capture-requests", "intent", "reevaluation", "publication", "public-read", "project-stage", "ratification", "case-authoring", "review", "standards", "conformance", "consequences", "actions", "action-clocks", "filings", "escalation", "action-plans", "monitoring", "link-sweep", "scheduler", "affordances", "tasks", "queue", "instance-setup", "op-declarations", "control-plane", "local-facts", "filing-templates", "test-support", "network-notices", "subresources", "bundler", "corpus-export"]},
```

### Unchanged
`provenance` (line 30) is unchanged. Its `paths` is a directory, the moved code is ranges inside its files, and its tests directory keeps the tests that stay. Its `uses` keep `signatures`, because under option B its T25 job keeps `attest` behind `attestOp` until T26. Its T26 job may drop `signatures` then. `observation-log` gains no edge: it reads `text_chars` on the reading `extraction` hands its listener (reading-pipeline R17), never importing the pipeline. `calibration` gains none.

## 3. The Status's AMENDED line (appended to `status`)

```text
AMENDED by BOB #100 at T25's opening, 2026-10-02 (K617, K1193; N512, N513; build/plan/draft-T25-splits.md P-1, P-2, E-1): attestation and provenance-routes, product modules with no from, split from provenance (its R31–R34, R39, R49, R56, R57 and R19–R23, R36, R54, no change of meaning), in layer 3 directly after provenance (provenance, attestation, provenance-routes, capture-sources); reading-pipeline, split from extraction (its R2–R17, R25, R26, R60), in layer 4 directly before extraction (calibration, reading-pipeline, extraction); each new module's paths and tests directories absent until its T25 job creates them (K1043's form), reading-pipeline owning bio-plane/src/readingprov.mjs and the six legacy-path tests extraction held from the opening; extraction uses reading-pipeline; acquisition, capture, case-authoring, filings and network-notices use attestation; retrieval uses provenance-routes; affordances, control-plane and plane use both.
```

Membership's `MODULE_ORDER` (its R83) and `layers.md` follow the same order (folds 3 and 4; accepted red 5). They are not drafted here.
