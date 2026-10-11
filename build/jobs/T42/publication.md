# publication (T42)

**Status** · session_01PoAppEh7TVor7LEbvFgRXU · depth 2 · WORKING · handled B0

## Completion

**Entry applied.** T42-23c (K2659; INQUIRY #17 J2), test-only: `bio-plane/test/m/publication/fixture.mjs` hands `sources` its stand-in for the doorbell's keyed read as `doorbell: {pulledKnocksOf}` (sources' deps since T42-8; sources R1, doorbell R18) in place of `capture: {pulledKnocksOf}`, and its comment now names the doorbell. That was the whole change: no test needed more, and no module code changed. It clears rule 4 (16)'s publication half (the 5 tests of R2, R51, R52 in `sources.test.mjs`, which answered `NO_SUCH_SOURCE` at the fixture's `knock`).

**Reading set (mechanics §17), read whole:** `build/requirements/publication.md`; layer 8's row of `build/layers.md`; the fixture, and the failing tests' red output. As B1 states, the rest of the module's code is not touched by this entry, so it was not read.

**Deferred:** none. **Found in another module:** nothing new.

**Tests.**
- publication (`bio-plane/test/m/publication/`): before, 5 fail (`NO_SUCH_SOURCE`); after, `tests 135, pass 134, fail 0, todo 1` (R30's TODO, D-246, as before).
- Users' suites (P11), each `node --test` over its `tests` path: publish-schedule 22/0, docket 59/0, public-read 158/0, project-stage 23/0, network-notices 73/0, ratification 233/0, case-authoring 181/0, review 45/0, conformance 87/0, filings 70/0, monitoring 124/0, affordances 232/0, queue-producers 84/0, op-declarations 128/0, control-plane 216/0, plane (with `test/system/migrate-released.test.mjs`) 167/0 (pass/fail). case-account has no tests path yet. Two reds, both already accepted and neither publication's:
  - case-disclosures 94 pass, 1 fail: `test/m/case-disclosures/carries.test.mjs`:139 (R7, "no table is added"), rule 4 (14), until T42-23b.
  - answer-envelope 28 pass, 1 fail: `test/m/answer-envelope/families.test.mjs`:425 (`HELD_EARLIER`), rule 4 (6), until T42-14, T42-21 and T42-27.
- No layer tests are named in `build/manifest.md`.

**Checks** (civicos-process @ bbe8f30730):
- `format: 147 modules, 146 requirements files; 0 failures`
- `architecture: 29 product files, 109 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 47 of 47 live requirement ids named by a test; 0 failures`
- `ownership: 1 files changed by publication between tranche/T42 and HEAD; 0 failures`

Size (session_01PoAppEh7TVor7LEbvFgRXU): test runs 22, module lines 6
