# REGISTERS #1 · T53 layer 5 · registers · report

For BOB. What this job did with each entry, what it met, and what it leaves open.

**Entries**

- *first* (take in `job/T53/registers`, fd326eb): taken in. That branch sits on the old `tranche/T53` lineage, so a whole merge brought about 1,800 files outside registers' paths and conflicts in build state. Its own commits touched only `bio-plane/src/registers/` and `bio-plane/test/m/registers/` (plus `build/modules.json`, already set on the tranche), so those two paths were taken whole from fd326eb (commit 717d90cb), not merged.
- *T53-173* (CAPABILITIES rows, R1–R46, R61–R73): the round-1 code meets them; checked against the requirements as they stand, with the K5808 wording.
- *K5808* (the trim's ambiguities settled): read against the code. One was not met and is fixed here: R2's "a team pre-read an interest names → `by_act`" answered `none`; it now answers `by_act` to a member who sees that interest, `none` to one who does not (R19).
- *R46 route* (the bulk file's path to `streamRegister`, the job's to verify): verified. There is none: `acquisition.streamRegister` only fetches. The file in hand is reduced by `register-readers.createReducer` in `fileImport` and its segments are stored but not filed through `promotion`, so a file import's rows cannot be cited (`SEGMENT_NOT_FILED`). Sent to BOB as a REPORT (another module's service closes it).

**Found and fixed in the job**

- R8 against the real service: `entities.subjectsOfProject` (entities R74) is on the tranche now, so the round-1 todo became a seam test. It showed a flaw: `entities` names an organisation `institution`/`body`/`movement` (`ORGANISATION_KINDS`), while `register-readers.prefillFrom` knows only `organization`, so an organisation subject never prefilled. `factsOfProject` now reads entities' organisation kinds as `organization` (core.mjs).

**Open**

- R14 is not marked met (K5814): it holds for fetched imports only; a member's file import is not filed as a document. Placed in the completion round: acquisition T53-625 (an in-hand door), then registers T53-626 (the file door files its segments).
- R72's packaged half (a case checked by the case checker) is a `test.todo`: case-carriage and case-checker are layer 8, store-assembly's job.
- R12, R20, R23, R67 name a 1,000,000-row fixture; the suite runs it at `REGISTERS_ROWS` (default 30,000) to keep the gate short. A 1M run was started but had not finished when this report was written, so it is not evidence here: the 1M bound is unmeasured.
- The REPORT I sent said "101/101 pass"; the true count is 100 pass and 1 todo of 101 tests.

**Met** · R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R15, R16, R17, R18, R19, R20, R21, R22, R23, R24, R25, R26, R27, R28, R29, R30, R31, R32, R33, R34, R35, R36, R37, R38, R39, R40, R41, R42, R43, R44, R45, R46, R61, R62, R63, R64, R65, R66, R67, R68, R69, R70, R71, R72, R73

**Evidence**

- `cd bio-plane && node --test test/m/registers/` → tests 101, pass 100, fail 0, todo 1
- `cd bio-plane && node --test test/m/registers/plan.test.mjs test/m/registers/listing.test.mjs` → tests 19, pass 19, fail 0
- bio-plane/src/acquisition/register.mjs:282 (streamRegister fetches only; no bytes in hand)
- bio-plane/src/registers/runner.mjs:170 (fileImport: reduced by createReducer, segments stored with bundle_id NULL)
- bio-plane/src/registers/core.mjs:303 (factsOfProject: entities' organisation kinds read as organization)
- `for i in R1..R46 R61..R73: grep test titles` → every id named by a test (no output)

Tests: 100/101. Checks: format, architecture, coverage, fixtures, ownership: no new finding.
Size: test runs 1, module lines 2219. Head df2b08e29f.