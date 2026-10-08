# case-grammar (T36)

**Status** · session_01BVidzT6qpVnrWbodBnLE5N · depth 2 · COMPLETE · handled B1

## Record

**Reading set (mechanics §17, N739).** Measured: requirements 29 KB, the module's code 147 KB and tests about 175 KB without the golden fixture, plus the used services: over 300 KB. So, as B1 says: read whole myself `build/requirements/case-grammar.md`, layer 8's row of `build/layers.md`, the plan's rules at the opening and T36-25 (with T36-27, T36-28, T36-51 that build on it), K2129 with the draft's case-grammar section and "BOB's review", K1941, K2002, K2004; the code and tests the entry changes: `casefile.mjs`, `index.mjs`, `casefile.test.mjs`, `casefile-fixture.mjs`, `helpers.mjs`; and `record-grammar`'s `parseFrontmatter` behaviour for the rows R22 reads. One worker read the other 12 source files (1,726 lines) and 11 test files (1,729 lines) whole and wrote a 5 KB summary citing file and line: only `complete.mjs` imports from `casefile.mjs` (`caseFilePath` for `case_document`, `grading_facts`, `passages`, `:149`, `:181`, `:183`) and it looks files up by path only, never by kind or file format (`:116–129`); `case_roles:`/`case_conclusions:` are read only in `complete.mjs` `:170`, `:188`, keyed by `target`; no other test pins the file format or the kinds. Nothing it left out mattered: the edition is unchanged by the new kinds, which a new test proves.

**Entries applied: T36-25.**
- **R13** `CASE_FILE_FORMAT` is `bio-case-file/2`; `CASE_FILE_FORMAT_V1` and `CASE_FILE_FORMATS_ACCEPTED` (`/2`, `/1`) added, with `CASE_FILE_V2_KINDS` and `CASE_FILE_OPTIONAL_SINGLE_KINDS`. New kinds and paths (the draft's suggestion): `archive` at `materials/<ref>/archives/<archive sha256>`, `container` at `materials/<ref>/containers/<member sha256>.json`, `criteria` at `criteria.json`; `caseFileEntryOf` reads them back (`archive`, `member`). `caseFileManifestCheck` accepts both formats and names the new departures: `kind_format` (a `/1` manifest naming a `/2` kind), `chain_without_document` (an `archive` or `container` under a ref carrying no `document`), `criteria` (more than one), `archive_sha` (an archive listed under a hash other than its path's). A `/1` manifest with none of the new kinds checks clean, as before.
- **R22** `memberSubjectOf(fm, finding)` in a new `subject.mjs`. Reading (a detail, mine): the first of the member's `case_roles:` then `case_conclusions:` rows that *has* the `subject_entity` field answers, so a roles row stating null is never filled from the conclusions row; a value that is not a non-empty string is null.
- P6: the module is 2,226 lines (+78).

**Found in other modules (REPORT J2).**
- `public-read` `casefile.mjs`:195 `isCaseFileManifest` compares `format === CASE_FILE_FORMAT`, so from this merge a stored `/1` case file's manifest is no longer recognised as a case file's; it should test `CASE_FILE_FORMATS_ACCEPTED.includes(format)` (exported for it). Its tests stay green today (they write the current format). For T36-27.
- `case-checker` (T36-51, and BOB's regeneration at the layer close), expected red from this merge: `spec.test.mjs`:14 (`CASE_FILE_SPEC_VERSIONS` vs `CASE_FILE_FORMAT`, now `/2`), `spec.test.mjs`:19 (the spec does not state `archive`, `container`, `criteria`), and `program.test.mjs`:19 (`program.mjs` stale: it bundles case-grammar). 41 pass, 3 fail; on `tranche/T36` without my change 44/44.

**Deferred:** none.

**Tests and checks.**
- `node --test bio-plane/test/m/case-grammar/`: 88 pass, 0 fail.
- Users: public-read 138/0, case-import 88/0, case-authoring 151/0, case-disclosures 59/0, publication 118/0, case-checker 41/3 (the three above).
- `checks/format.mjs`: 135 modules, 134 requirements files; 0 failures. `architecture.mjs case-grammar`: 0 failures. `coverage.mjs case-grammar`: 22 of 22 live ids named; 0 failures. `ownership.mjs case-grammar tranche/T36`: 0 failures.

Size (session_01BVidzT6qpVnrWbodBnLE5N): test runs 11, module lines 2226

## J1 · REPORT

public-read casefile.mjs:195 isCaseFileManifest tests format === CASE_FILE_FORMAT, so a stored bio-case-file/1 manifest is no longer recognised after this merge; use CASE_FILE_FORMATS_ACCEPTED (now exported) in T36-27. case-checker goes red on spec.test.mjs:14, :19 and program.test.mjs:19 (spec lacks /2 and its kinds; program.mjs stale) until T36-51 and the layer-close regeneration. Details in my record.

## J2 · COMPLETE

T36-25 applied: bio-case-file/2 (archive, container, criteria; /1 read as written) and R22 memberSubjectOf. case-grammar 88/0; coverage 22/22; format, architecture, ownership 0 failures. Users green but case-checker's 3 expected reds (REPORT). 2,226 lines. Merge early: public-read, case-checker, case-authoring build on it.
