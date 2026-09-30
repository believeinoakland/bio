# provenance (T16)

**Status** · session_01VKXANZkXWm7m6KERHYiYdY · depth 2 · WORKING · handled B1

## Completion (PROVENANCE #6)

**Entry applied** · N364's share (K509 (3); W4): R51. `captureGrade` answers a capture whose receipt is `via: "doorbell"` with `route: "doorbell"`, `determined: false`, `basis: "CAPTURE_RECEIVED_NOT_FETCHED"`, `grade: null`, `ceiling: EARNED_CAPTURE_CEILING` (the author's letter stays under it, stated as authored), and `received: {address, address_norm, at}`: the earliest doorbell receipt (`knock:<knockId>`), whose timestamp proves the record held the bytes at the pull's instant. The via's one spelling is exported as `DOORBELL_VIA` for capture R65's writer. R15's writers now name `capture.pullKnock`: nothing changes at this module's interface (`recordReceipt` is the one writer; which acquisition calls it is capture's), and R15's test still holds.

**My reading of R51's precedence** (posted to BOB as J2): authored (R27) first; a fetched route this instance recorded (direct R24, then archive R25) is measured and answers before the doorbell, since it is the stronger fact about the same bytes; the doorbell answers before a via no ruling names (R26's `CAPTURE_GRADE_VIA_UNRULED`), since it is a ruled route.

**Not yet met marks my work meets** · R51 (N364) in `build/requirements/provenance.md` (the id's own mark and the Status line's "N364 … R51, and R15's writers gain `capture.pullKnock`; not yet met").

**Check rows** · none added, moved or retired.

**Grep** · `civicos-ui/` and affordances' paths: no hit for `DOORBELL_VIA`, `CAPTURE_RECEIVED_NOT_FETCHED` or `captureGrade`.

**Generated artifacts** · none made stale (provenance feeds no bundle in the manifest's table).

**Found in another module** (J2) · `inquiry` (`src/inquiry/index.mjs` ~2230) reads `captureGrade` and maps only `CAPTURE_ROUTE_UNRECORDED` to "the author's letter under the ceiling"; a doorbell capture (`CAPTURE_RECEIVED_NOT_FETCHED`) falls into its `unruled` count and contributes no byte grade, where R51 says its grade is the author's letter under the ceiling, as for R26's unrecorded route. No regression (today the same capture answers `CAPTURE_GRADE_VIA_UNRULED` and is counted unruled there too). `consequences` copies `grade`, `route`, `determined`, `basis` through unchanged.

**Deferred** · none.

**Tests and checks**
- `node --test test/m/provenance/`: tests 64, pass 64, fail 0, todo 0 (R51's test in `grade-origin.test.mjs`).
- Users of `captureGrade`: `test/m/capture/` tests 75, pass 75; `test/m/inquiry/` tests 75, pass 74, todo 1, fail 0; `test/m/consequences/` tests 24, pass 24.
- `format`: 72 modules, 67 requirements files; 0 failures. `architecture`: 13 product files, 41 relative imports; 0 failures. `coverage`: 51 of 51 live requirement ids named by a test; 0 failures. `ownership` (tranche/T16): 0 failures, legacy modules 0 lines added.

Size (session_01VKXANZkXWm7m6KERHYiYdY): test runs 5, module lines 3257

## J1 · REPORT

R51's precedence, my reading (applied; say if otherwise): authored (R27) first; a fetched route this instance recorded (direct R24, then archive R25) is measured and answers before the doorbell; the doorbell answers before a via no ruling names (R26 CAPTURE_GRADE_VIA_UNRULED). Found in inquiry (src/inquiry/index.mjs ~2230): it maps only CAPTURE_ROUTE_UNRECORDED to the author's letter under the ceiling, so a doorbell capture (CAPTURE_RECEIVED_NOT_FETCHED) counts as unruled and contributes no byte grade, where R51 gives it the author's letter under the ceiling. No regression: today the same capture answers CAPTURE_GRADE_VIA_UNRULED and is unruled there too. captureGrade's doorbell answer carries ceiling for that reader.
