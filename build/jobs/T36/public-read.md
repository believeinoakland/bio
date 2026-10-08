# public-read (T36)

**Status** · session_01BL4TP2ShNVLY5f5dC9jEtM · depth 2 · WAITING ON BOB (J1) · handled B2

## Notes (working)

- **Reading set (N739).** Measured: code 232 KB (3,345 lines) and tests ~480 KB, over 300 KB. Read whole myself: `build/requirements/public-read.md`; layer 8's rows of `build/layers.md`; the plan's T36-27 entry, rules at the opening, K2004, K2129 and the draft's public-read section with BOB's review; `public-read/casefile.mjs`, `test/m/public-read/casefile.test.mjs`, `fixture.mjs`, `criteria.test.mjs`; `public-read/index.mjs` `caseFileFacts` (lines 1086–1175); the used services: `case-grammar/casefile.mjs` (`caseFilePath`, `CASE_FILE_FORMAT`, kinds), `case-carriage` R8 and `#holdArchives`, `publication` R57's registration (`index.mjs` 1005–1020). Two workers read the rest of the code (≈11 KB summary, citing file:line in `index.mjs`, `worker.mjs`, `container.mjs`, `inband.mjs`, `door.mjs`, `checks.mjs`, `courtorders.mjs`, `credit.mjs`, `reads.mjs`) and the other 30 test files (≈9 KB, citing each). What they found that mattered: `isCaseFileManifest` would stop serving stored `/1` case files under `/2` (fixed); case-carriage holds a shared archive once per commit, under the first ref (handled: the chain is read over every included ref of the edition); new files must go in before the unspelled-path check (done). Nothing they left out mattered.
- **B2 (CHANGE) processed:** `tranche/T36` merged (case-grammar K2144); `isCaseFileManifest` reads `case-grammar`'s `CASE_FILE_FORMATS_ACCEPTED`, with a test that a stored `/1` case file is recognised and served part by part as written.

## Completion

**Entries applied.** T36-27 (N717's share; K2004, K2129):
- **R32:** `caseFileFacts` (`public-read/index.mjs`) answers each included document's chain, read from the published projection only: the `container` records and archives the commit registered (`publication` R57 through `case-carriage` R8), walked from the material's own digest (record naming it as member → its archive → the record naming that archive → …, outward; a cycle ends it). The pool is read over every included ref of the edition, because case-carriage registers a record or archive two materials share only once, under the first ref. `buildCaseFile` carries each at `caseFilePath` (archive by its SHA-256, record by its member's) under the material's ref, only for a document carried whole; bytes not hashing to the registered digest, and an archive a record names that the commit did not register, are named in `unheld` and never carried. Tokens travel as today (the material's co-attestation row).
- **R33:** `caseFileFacts` answers `criteria` (R53's frozen rows, null when not recorded); `buildCaseFile` carries `criteria.json` (kind `criteria`) in canonical JSON, exactly R31's rows; none when null; `[]` carried as `[]`.
- `/2`: stored `/1` case files are still served (`CASE_FILE_FORMATS_ACCEPTED`).
- The Uses note on `calculations` stays as it was: this job reads nothing of it (every byte the case file needs is in the published projection).

**Deferred.** None in this module. The R28/R32 question (a court order over a member reaching its carried archive) is BOB's, posted as J1; nothing changed for it.

**Found in other modules.** (1) `case-carriage` R8 (`hold`, `case-carriage/index.mjs`:107–109): a shared record or archive is registered under the first material's ref only (J1). (2) `case-checker`: 3 tests red after case-grammar's `/2`, the same with and without this job's changes: `R13` (`program.mjs` stale; regenerated at the layer close), `R14` spec of `bio-case-file/1` and `R14 R20` fields/kinds (T36-51's work). No generated artifact made stale by this job beyond `case-checker/program.mjs`, which is stale already from case-grammar.

**Tests and checks.**
- `node --test bio-plane/test/m/public-read/`: tests 145, pass 145, fail 0 (new `archives.test.mjs`: R32 ×4 including the outsider's three steps with the real `unzip` and `openssl ts -verify`, R33 ×2, R5 R6 `/1` ×1; `casefile.test.mjs` R23's file list gains `criteria.json`).
- Users of my services: case-import 88/0, ratification 213/0, filings 70/0, network-notices 72/0; case-checker 41 pass, 3 fail (above, not this job's).
- `format`: 135 modules, 134 requirements files; 0 failures. `architecture public-read`: 44 product files, 146 relative imports; 0 failures (the test archives are written with this module's own `container.mjs` and `ooxml`'s `crc32`, so no `test-support` edge is needed). `coverage public-read`: 33 of 33 live ids named; 0 failures. `ownership public-read tranche/T36`: 4 files changed; 0 failures.
- P6: 3,406 lines (paths), well under 4,000.

Size (session_01BL4TP2ShNVLY5f5dC9jEtM): test runs 14, module lines 3406
