# capture (T19)

**Status** · session_01JMDXaCWfQTso3u1jkN2vbZ · depth 2 · WORKING · handled B2

## J1 · QUESTION

K787 (C-68.1 `EVIDENCE_STORAGE_NOT_CONFIGURED`): deleting the catalogue's row in this job breaks code that is not mine, measured at HEAD of `job/T19/capture`:
- `src/control-plane/index.mjs`:7 imports `INSTALLATION_CHECKS` by name from the catalogue, and `installationRow` (:378) reads C-68.1 from it for `storageAbsent` (`src/index.mjs`:66). Deleting the export is an ESM link error for control-plane and everything importing it; emptying the object makes `storageAbsent` throw (500) instead of answering 503 C-68.1.
- `test/m/publication/invariants.test.mjs`:82 and `test/system/d278-codeless-refusals.test.mjs`:62 read `CATALOGUE.INSTALLATION_CHECKS.EVIDENCE_STORAGE_NOT_CONFIGURED`.
- Holding the row in both places fails the DEC-49 guard's arm A (`civicos-ui/check-refusal-codes.mjs` `HELD_TWICE` is empty; legacy-ui's file).
- Also: `acquisition` (earlier than capture) raises `EVIDENCE_STORAGE_NOT_CONFIGURED` with no row (`src/acquisition/index.mjs`:298), and so does capture's own `pullKnock` (`src/capture/index.mjs`:589). By K78 (3) the earliest raiser is now `acquisition`, which cannot read a row held here.

My best reading, which I am carrying on with: I add C-68.1 to capture's table (id, translation, `where` unchanged: `src/index.mjs storageAbsent > is-storage-absent`) and make `pullKnock`'s refusal carry it, but do NOT delete the catalogue's copy in this job; the copy is deleted when control-plane re-points `installationRow` (rule 1: control-plane's last act), with `HELD_TWICE` gaining C-68.1 for that window (legacy-ui's edit, BOB's to route). If you would rather the row went to `acquisition` (earliest raiser) or that I leave C-68.1 wholly alone this tranche, say so; adding it here is the only part I will do before your answer, and it is one revertable hunk.

Question: (a) confirm or correct the reading above; (b) who makes control-plane's one-line re-point and `HELD_TWICE`'s entry, or should I instead leave capture's table without C-68.1 until then (avoiding the guard red)?

## J2 · REPORT

B2 applied as far as it can be: my C-68.1 hunk is reverted (capture's table and the catalogue untouched). `pullKnock`'s refusal will carry acquisition's row once it is on `tranche/T19` (`origin/job/T19/acquisition` and the tranche hold no C-68.1 yet, measured at `584bd35cd6`). Send me a CHANGE when acquisition merges, naming the export (I will import it from `../acquisition/index.mjs` or its `checks.mjs`, R37's rule: the refusal carries its row).

Everything else in B1 is built, tested and pushed (`job/T19/capture` @ 675c11e1ee):
- `capture/acquire.mjs` deleted (no importer left at HEAD).
- `grammar.mjs` (`canonicalJson`, `ISO_TS_RE`) and `index.mjs` (`isPublicHttpsLocator`, `createSha256`) import record-grammar; `doorbell.test.mjs`' catalogue import dropped (its one line asserted the catalogue's export, not my interface). Only `grammar.test.mjs`' C-2.7 comparison names the catalogue (`LEGACY_GRAMMARS`, the held copy: instance-setup's `intake.test.mjs` R45 still judges through the catalogue's `checkBundle`, so the copy stays; promotion's `gate.test.mjs` R27 registers its own stand-in).
- R69 reads `credentials.attestingKeys` (`credentialsOf` on the instance's storage; constructor option `credentials`, the unused `membership` option gone).
- R75: `taskQueue`, `sourceReachability` registered with `registerCounts` in `captureOf`, once per storage; a refusal throws as the grammar's does. The store's `#counts` holds two capture figures, not three; R75 names those two. The store's lines stay for legacy-store (R75).
- K783: `grammar.test.mjs` to R67 as worded (a second module's C-2.7 claim runs beside capture's; capture's own second registration is still loud); the comparison uses record-grammar's `checkBundle`, and the "without" world fills C-2.7 through `registerLegacyGrammars(record, LEGACY_GRAMMARS)`.
- K789: the fixture builds credentials after membership; the three reds are green.

Tests: `test/m/capture/` 94 pass, 0 fail. Uses' tests (sources, extraction, connections, observation-log, retrieval, capture-requests, ratification, case-authoring, monitoring, scheduler, affordances, tasks, queue-producers, instance-setup, control-plane): every red is red identically on `origin/tranche/T19` (ratification 81, queue-producers 32, instance-setup 4, tasks 2, case-authoring 1, monitoring 1, control-plane 1); none from this change. Checks: format, architecture, coverage (48/48), ownership: 0 failures.

Found for others:
1. legacy-tests: `test/capturerequests.control.mjs`:49 and `test/system/fence-e2e.control.mjs`:54 anchor on `src/capture/acquire.mjs` (now deleted; it was already a 6-line re-export, so their arms and `MIN_BYTES.acquire` 5000 were already stale). Their anchor is `src/acquisition/index.mjs`. Not run (old suites).
2. Generated artifact (§14): the plane bundle's inputs changed (`capture/acquire.mjs` gone, `capture/index.mjs`, `grammar.mjs`); not rebuilt.
