# public-read (T36)

**Status** · session_01BL4TP2ShNVLY5f5dC9jEtM · depth 2 · WORKING · handled B3

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

**B3 (ANSWER re J1, K2145) applied.** R28 with R32: when an order withholds a carried material's `document` file, every `archive` and `container` file the case file carries under that material's ref is withheld by the same orders (`withholdChains` in `public-read/index.mjs`, applied in `#withheldIndex`), so `publishedbytes`, the case file's parts and `publishedCase`'s file listing all withhold them; an unseal serves them again. Test `archives.test.mjs` "R28 R32 …" (fails with the propagation disabled, passes with it). After B3: public-read 146/146; format, architecture, coverage (33/33), ownership (5 files): 0 failures; case-import 88/0, ratification 213/0, filings 70/0, network-notices 72/0, case-checker 41/3 (unchanged, not this job's). 3,423 lines.

*Repair:* this record's J1 REPORT was cut by a hand edit of the notes and the COMPLETE then posted as J1; J1 restored byte for byte from 7a9c2437d0 and COMPLETE re-posted as J2.

Size (session_01BL4TP2ShNVLY5f5dC9jEtM): test runs 18, module lines 3423

## J1 · REPORT

Progress: R32 and R33 written and tested on my branch (649c49fd17), waiting on case-grammar's merge (`caseFilePath` for `archive`, `container`, `criteria`; `/2`). Until then every /6 assembly states CASE_FILE_NOT_ASSEMBLED on my branch, as expected. Please announce case-grammar's merge.

Two findings, for your decision (no change made):
1. R28 and R32 (my module; R28 sits in "Open for Bob"). A court order that removes or seals a carried member document by its hash or path does not reach the member's archive, which R32 now carries under its own hash and path and which `publishedbytes` serves: the archive's bytes contain the withheld member, so `unzip -p` recovers it. R28 says "bytes the order removes or seals are withheld from serving"; whether an order over a member extends to the archives (and container records) carried for it is a policy reading. My recommendation: extend it (withhold every R32 file carried under that material's ref when its document is withheld), as a CHANGE in a later tranche or now if you rule it; I can do it in this job in ~20 lines if you say so.
2. case-carriage (R8, its `hold` dedupe, `case-carriage/index.mjs`:107–109): a record or archive two included materials share is registered once per commit, under the first material's ref only. I read the chain over every included ref of the edition, so public-read carries it for both; but `published_shas` names only one ref for it. No defect against case-carriage's own requirements as written; noted for its next job.

## J2 · COMPLETE

T36-27 complete (B2 processed): R32 and R33 met; stored /1 case files served via CASE_FILE_FORMATS_ACCEPTED, with a test. public-read 145/145; format, architecture, coverage (33/33), ownership: 0 failures. case-checker has 3 reds from case-grammar's /2 (program.mjs, R14 spec), the same without my changes: T36-51 and the close. J1 (REPORT: the R28/R32 court-order question, and case-carriage's shared-archive note) stands for you. Note: a hand edit of my notes had cut J1 and a first COMPLETE went out numbered J1 (7660a78da1); J1 is restored byte for byte from 7a9c2437d0 and this COMPLETE is J2. Record: build/jobs/T36/public-read.md.
