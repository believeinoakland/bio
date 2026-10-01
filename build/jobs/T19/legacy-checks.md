# legacy-checks (T19)

**Status** · session_01BjfEuoaa6XVXhVaMbV2YC9 · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

Three points from the importer check, each with the reading I am working on now.

**Q1 · Two listed deletions still have a module-test importer in a later layer.** Measured on `job/T19/legacy-checks` @ 35d05bab1a, over every file importing the catalogue (named, namespace and dynamic imports):
- `MECHANICAL_FIELD_SETS`: `bio-plane/test/m/promotion/moved.test.mjs`:146 compares promotion's registry with `C.MECHANICAL_FIELD_SETS` (namespace import, :7). Promotion is layer 2.
- `VERSION_NOTICE_CHECKS` (C-80): `bio-plane/test/m/content/transcribe.test.mjs`:119–123 compares content's copy with `catalogue.VERSION_NOTICE_CHECKS` (dynamic import). Content is layer 4.

Deleting either fails a module test that is not mine to change. **My reading:** both are held under rule 1, like C-22 and the rest: promotion's L2 job and content's L4 job each drop their comparison and delete the catalogue's copy (both modules have `legacy-checks` in their `from`). I leave both in place and say so in my record. Every other name on my list has no importer outside the old suites and the generated bundles.

**Q2 · `isMachineMinted` overlaps record-grammar's move.** My entry deletes it (K653 BOB-1: no reader). record-grammar's entry moves "the machine-work labels (`CONTENT_MINTED_BY_PLANE` … `isMachineMinted`, …)", which names it as the end of the moved range. Once it is in record-grammar's paths I cannot delete it. **My reading:** record-grammar moves the range without `isMachineMinted`, and I delete it from the catalogue after record-grammar merges. Please confirm, or tell record-grammar. (`isSufficiencyClaimed` sits just before that range and is deleted now.)

**Q3 · Order of C-2.7 and the wrapper.** record-grammar removes `checkBundle` and its structural arms from the catalogue, and C-2.7's code sits between them. To avoid a conflicting merge, I delete C-2.7 and build the wrapper after record-grammar merges, as your START says for the wrapper. One correction to the list: the catalogue's `CONTENT_HASH_RE` is not C-2.7's alone. `correspondenceFindings` (C-2.10) also uses it, so it stays until action-grammar or actions takes C-2.10 (layer 9). It is not exported, so no importer is affected.

Done meanwhile, not yet committed: `SUGGEST_LEVELS`, `CIVICOS_CONTACT_URL` and `civicosUserAgent`, C-83 `RENDER_CAPTURE_CHECKS`, `DRIVE_CAPTURE_CHECKS` and `isSufficiencyClaimed` deleted, each leaving a one-line note. N437's three comments re-worded. Five stale `where`s fixed: C-28.13 now names `src/acquisition/index.mjs` (`awaiting stamp`), and C-32.1 and C-33.10–.12 now name `src/ratification/release.mjs`. N70's and N44's promotion rows already resolve: every promotion `where` names a live function and region.

## J2 · QUESTION

**Q4 (on B4) · Deleting C-2.7 turns four module tests in other modules red.** The wrapper is written. Parity, measured by running the whole `test/m` battery with every catalogue `checkBundle` call also run through the pre-change catalogue (scratch instrument, not committed): 420 calls. Every finding other than C-2.7 is identical in content, ids, severities, messages, codes and order in all 420. 163 calls differ, and only in C-2.7:
- 162 are calls that register no C-2.7 grammar, so the catalogue's built-in arm no longer fires for them;
- one is an error message naming a list position. Fixed: the caller's grammars now come first.

Four module tests assert the built-in arm and fail once C-2.7's code is deleted:
- `test/m/capture/grammar.test.mjs`, both R37 tests (layer 3): they compare capture's grammar with "the catalogue's own arm";
- `test/m/promotion/gate.test.mjs` R27 (layer 2): "the built-in information arm judges this document";
- `test/m/instance-setup/intake.test.mjs` R45 (layer 11): it calls the catalogue's `checkBundle` with no grammars and expects C-2.7 for a missing hash.

**Product callers (your check):** every catalogue `checkBundle` caller in the product registers capture's grammar or judges no information bundle:
- the audit (`record-core` `auditPass`) passes `grammars()`;
- the gate goes through `promotion.runGate`, which passes `record.grammars()`; ratification and action-plans reach it there;
- capture registers its grammar in `captureOf`, which `Store`'s constructor calls (`src/store.mjs`:159);
- `inquiry/grammar.mjs` `checkInquiryEntry` judges inquiries only, and C-2.7 fires only on `information`.

So the product loses nothing. Only the four tests do.

**My reading, built now:** C-2.7's code stays in the catalogue as one more `LEGACY_GRAMMARS` entry, held under rule 1. It fills the C-2.7 slot only when the caller's grammars claim none, so a caller registering capture's grammar gets capture's, and the battery stays green with exact parity. The held copy is deleted by the last of the three jobs to re-point its test to capture's grammar: promotion (L2), capture (L3) and instance-setup (L11). All three have `legacy-checks` in `from`. **The alternative:** delete it now and route the four tests to those jobs, with layer 1 closing red on them by name. Say which; switching is a small change on my side.

`isMachineMinted` and every structural-arm copy record-grammar now holds are deleted, and `EXTENSION_ARMS` is re-exported.

## J3 · COMPLETE

**Entries applied** (`current.md` T19 layer 1, legacy-checks, amended; B1, B4, K750, K767):
- **`SUGGEST_LEVELS` (K679):** deleted; run-productions holds it.
- **Rule 2's wrapper (B4, record-grammar R28, R40, R41):**
  - The catalogue's `checkBundle` calls record-grammar's, with `LEGACY_GRAMMARS` filling the slots the caller's grammars do not claim.
  - `LEGACY_GRAMMARS` is frozen, one entry per `EXTENSION_ARMS` slot, each claimed whole:
    - C-2.7, held (J2, K767);
    - C-18.6/.7, `checkInfo2Contract`;
    - C-6.1, `supersedesEdgeFindings` then `divisionDisclosureFindings`;
    - C-15.1, `checkRecheckCoverage`;
    - C-2.8, `checkInquiryExtension`;
    - C-2.9/C-9.1, `checkProjectExtension`.
  - A caller's grammar claiming any id of a slot replaces that legacy entry. The caller's grammars come first, so a refusal names its own list position. A malformed list reaches record-grammar unchanged and throws there.
  - `EXTENSION_ARMS` is re-exported from record-grammar.
- **Deleted, each confirmed first over the repository and the bundles' inputs:**
  - `CIVICOS_CONTACT_URL` and `civicosUserAgent`;
  - C-83 `RENDER_CAPTURE_CHECKS`;
  - `DRIVE_CAPTURE_CHECKS` whole;
  - `isSufficiencyClaimed`, `isMachineMinted` (K750);
  - the copies record-grammar now holds: the structural arms, `checkReferences`' core, `checkAppendOnly`, `checkHistoryCoherence`, `hasFile_`, `latestHistorySnapshot`, `REL_VOCAB`, `SOURCE_ASSERTED_RELS`, `EDGE_STATUS`, the old seam (`grammarsOf`) and the old runner.
  - Each leaves a one-line note naming the holder. `MONITOR_FREQ` is no longer exported.
- **Held (rule 1):**
  - `MECHANICAL_FIELD_SETS`: promotion L2 deletes it (K750).
  - `VERSION_NOTICE_CHECKS`: content L4 deletes it (K750).
  - C-2.7's code: the last of promotion, capture and instance-setup to re-point its test deletes it (K767).
  - C-22, `STRENGTH_STATES`, `contentIdFor`, C-28 with C-28.13, `LEAD_ID_RE`: as the plan says.
  - `CONTENT_HASH_RE`: stays for C-2.10's `correspondenceFindings` (actions or action-grammar, L9).
- **N70's and N44's `where`s:** every promotion row's `where` resolves to a live function and region (done in T4). Re-measured over all 218 rows, five stale `where`s are fixed (`awaiting stamp`, promotion's stamp in L2):
  - C-28.13 now names `src/acquisition/index.mjs acquire > is-capture-request-arm`;
  - C-32.1 and C-33.10–.12 now name `src/ratification/release.mjs release > …`.
  - C-33.41 was record-grammar's (R29). The C-48 and C-83 rows went with their families.
- **N437:** the three comments naming the retired `scripts/coverage.mjs` as live are reworded, and one naming the migrate tool.

**Parity (B4):** measured with a scratch instrument, never committed. Every catalogue `checkBundle` call in the whole `test/m` battery (420) was run through both the pre-change catalogue and the wrapper. Every non-C-2.7 finding was identical in content, ids, severities, messages, codes and order in all 420. With C-2.7 held, the C-2.7 findings are identical too.

**Product callers (B4):** each registers capture's grammar or judges no information bundle:
- `record-core` `auditPass` passes `grammars()`;
- `promotion.runGate` passes `record.grammars()` (ratification and action-plans reach the gate through it);
- capture registers in `captureOf`, called by `Store`'s constructor (`src/store.mjs`:159);
- `inquiry/grammar.mjs` judges inquiries only.

**Deferred:** none of my own.

**Found in other modules (all routed by K767; no new REPORT):**
- Four module tests read the catalogue's own C-2.7 arm. They pass today because C-2.7 is held:
  - `test/m/capture/grammar.test.mjs` R37, two tests;
  - `test/m/promotion/gate.test.mjs` R27;
  - `test/m/instance-setup/intake.test.mjs` R45.
- record-grammar's `bundle.mjs` comments still name "the migrate tool" in `checkBundle`'s context (N437's kind, record-grammar's own).

**Generated artifacts (§14), stale:** the plane bundle `bio-plane/dist/bio-plane.bundled.mjs`, and through it `newgroup/src/release.mjs` and `release/`. BOB regenerates them at the close.

**Tests:**
- `bio-plane/test/m/legacy-checks/`: 23 pass, 0 fail.
- `test/m` whole: 4,318 tests, 4,295 pass, 3 fail, 20 todo. The 3 are `MODULE_ORDER` (membership R83, R79; promotion R39/R45/R46), red on `tranche/T19` already (rule 8).
- Baseline before my change: 4,210 tests, 4,188 pass, 2 fail. Those 2 were extraction tests that did not recur.
- `build/manifest.md` names no layer tests.

**Checks:**
- `format: 85 modules, 80 requirements files; 0 failures`
- `architecture: 2 product files, 6 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 0 modules, 0 of 0 live requirement ids named by a test; 0 failures`
- `ownership: 3 files changed by legacy-checks between tranche/T19 and HEAD; 0 failures`

The catalogue went from 8,811 lines at the opening to 6,769, net of record-grammar's move.

Size (session_01BjfEuoaa6XVXhVaMbV2YC9): test runs 14, module lines 1271 (200 added, 1071 removed)

## J4 · REPORT

Correction to J3: the catalogue is 7,124 lines now (`wc -l`), not 6,769; it was 8,811 at the opening. Nothing else in J3 changes.
