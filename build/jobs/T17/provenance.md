# provenance (T17)

**Status** · session_01YBB3FhBVLLqxoQXxXj1PVQ · depth 2 · WORKING · handled B2

## Completion (PROVENANCE #7)

**Entries applied.** N381 (K560), layer 3, first: `src/provenance/register-checks.mjs` refused capture R65's pulled-knock document at C-18.1 (`capture.grade` not a letter; `origin.kind` `doorbell` unknown), so no pull could be filed. C-18.1 now has a doorbell arm: a document whose `origin.kind` is `doorbell` carries no capture letter (`grade` null or absent) and states R51's basis (`grade_basis: "CAPTURE_RECEIVED_NOT_FETCHED"`), as the authored arm admits none; a letter on it, or a missing or other basis, is an error naming why. `doorbell` joins the origin kinds. The basis has one spelling, `RECEIVED_NOT_FETCHED` (with `DOORBELL_ORIGIN`), exported and read by `captureGrade` (R51), so the document and the grade cannot state two bases. The basis excuses only a doorbell document: a fetched one stating it still owes a letter. No catalogue row changed (C-18.1 is a finding; C-103.1's row is untouched), so nothing is `awaiting stamp`.

**Tests** (`test/m/provenance/register-checks.test.mjs`, both naming R42 and R51): the document field for field as `capture.pullKnock` writes it (its `#pulledDocument`; copied, since this module's tests cannot import the later `capture`, P4) passes every arm at information@1 and @2, collected and verified; negative controls for each finding; and at the write, a lettered one is refused `PROVENANCE_REGISTER_REFUSED` with nothing written, the real one is filed with its register row, and with the pull's receipt `captureGrade` answers the basis the document states. Both tests fail on the code before the change (7 pass, 2 fail), pass after.

**End to end, measured** (a scratch copy of control-plane's `doorbell.test.mjs`, not committed): through the record store's door with the real capture, promotion and provenance, `inboxpullfile` now pulls and files the knock: bundle `INFO-2026-0001-doorbell-knock`, the register row homed there, the receipt written.

**Reported (another module).** `control-plane`: `test/m/control-plane/doorbell.test.mjs`:365–371 asserts the refusal N381 removes (`PROVENANCE_REGISTER_REFUSED` from the dry run), so it now fails, the one failure in `test/m/`; the door now files the pull (above). Its layer-11 entry (N381's share: R36's end-to-end `test.todo` runs, its mark goes) replaces it. REPORT J1.

**Deferred, each needs a requirement change (BOB's).**
1. R42's text names no doorbell arm ("a `grade` in `CAPTURE_GRADES` (none for an authored observation)"; the kinds are not listed). Proposed: "(none for an authored observation; none for a document received through the doorbell, `origin.kind` `doorbell`, which states R51's `grade_basis`)" and `doorbell` among the kinds. Built on R51 and the entry's text.
2. R19 (`chainFromEvidence`): a doorbell document with no chain would be reconstructed as a fetched hop, "these bytes were served for knock:… at …", `via: "direct"`, which R51 contradicts (received, not fetched), and R22 would count its route `derivable`. Not reachable today (the pull writes the document's chain, so R20 answers `already_recorded`), but R19 defines a fetched route by its fields alone. Proposed: a `doorbell` document is not a fetched route; its hop, when missing, comes from the knock's receipt (`source.receipt`) or it is `undetermined`. Left as it is, because R19's arms are stated.

**Checks.** `node --test test/m/provenance/`: 66 pass, 0 fail. `test/m/` whole: 3193 tests, 3169 pass, 1 fail (control-plane, above), 23 todo. Old battery: no test names the old kind list. `format`: 0 failures. `architecture provenance`: 13 product files, 41 imports, 0 failures. `coverage provenance`: 51 of 51 live ids named, 0 failures. `ownership provenance tranche/T17`: 4 files changed, legacy modules 0 added, 0 removed, 0 failures.

Size (session_01YBB3FhBVLLqxoQXxXj1PVQ): test runs 8, module lines 3269

## J1 · REPORT

control-plane: test/m/control-plane/doorbell.test.mjs:365-371 asserts the refusal N381 removes (PROVENANCE_REGISTER_REFUSED from the pull's dry run), so it now fails: the one failure in test/m/ (3193 tests, 3169 pass, 1 fail, 23 todo). Measured with a scratch copy (not committed): through the record store's door with the real capture, promotion and provenance, inboxpullfile now pulls and files the knock (bundle INFO-2026-0001-doorbell-knock, register row homed there, receipt written). Control-plane's layer-11 entry (N381's share: R36's end-to-end test.todo runs, its mark goes) replaces the stale assertion.

## J2 · COMPLETE

N381 applied: C-18.1 admits capture R65's pulled-knock document (no letter, grade_basis CAPTURE_RECEIVED_NOT_FETCHED; doorbell among the origin kinds), one spelling of the basis shared with captureGrade. Tested at the arms and at the write with capture's document as the pull writes it; end to end the real door now files the pull (measured, scratch). No catalogue row changed, nothing awaiting stamp. Two requirement changes proposed for you (record, Deferred): R42's text to name the doorbell arm; R19 so a doorbell document with no chain is not reconstructed as a fetched hop. Checks: format, architecture, coverage (51/51), ownership all 0 failures; test/m/ 1 fail, control-plane's stale assertion (REPORT J1). Record: build/jobs/T17/provenance.md.

## Completion again, after B2 · CHANGE (K581)

**Applied.** Merged `tranche/T17` (R19 and R42 reworded by BOB, K581; deferred items 1 and 2 above are now requirements). R42's doorbell arm was already built (N381, above). R19: `chainFromEvidence` has a doorbell arm, asked before the fetched one: a document whose `origin.kind` is `doorbell` is never a fetched route (though its `knock:` locator, `retrieved` and `capture.method` are all present); with no chain, its one hop is read from the knock's receipt it states, "these bytes were received for knock:<knock_id> at <received>", `via: "doorbell"`, `bound: false`, `reconstructed.from` naming the receipt's fields; without a receipt carrying `knock_id` and `received` it is undetermined, `missing` naming `source.receipt`. R20 and R22 read it through R19, so the rebuild answers `reconstructed` (and applies the receipt's hop) or `EVIDENCE_INSUFFICIENT`/`undetermined`, and the route mark `derivable` (PRESENT) or `undetermined` (LOOKED_INDETERMINATE).

**Tests** (`chain-route.test.mjs`): R19's arm, pure, with and without the receipt (and a partial one), a timestamp cited, and the same fields under a fetched origin still direct; R19, R20, R22 over filed doorbell bundles without chains, with and without the receipt, including the applied rebuild. Both fail without the change (6 pass, 2 fail), pass with it.

**Checks.** `test/m/provenance/`: 68 pass, 0 fail. `test/m/` whole: 3195 tests, 3171 pass, 1 fail (control-plane's stale assertion, its layer-11 entry's, K581), 23 todo. `format`, `architecture provenance`, `coverage provenance` (51 of 51), `ownership provenance tranche/T17` (5 files; legacy modules 0 added, 0 removed): 0 failures each.

Size (session_01YBB3FhBVLLqxoQXxXj1PVQ): test runs 12, module lines 3297
