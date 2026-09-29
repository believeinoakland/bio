# consequences (T12)

**Status** · session_01UQSjUGxLUNtpem1MJpHfiF · depth 2 · WORKING · handled B0

## Work

**Entry N309 (K380), applied** against conformance R19/R20's wording, tested with a local stub of the two helpers (never committed); to be re-tested against the real helpers when BOB merges conformance and sends a CHANGE.
- R1 answers `NO_SUCH_DETERMINATION` through `conformance.noSuchDetermination` (R19) and, second in the order, `DETERMINATION_SUPERSEDED` through `conformance.determinationSuperseded` (R20, `superseded_by` from what `determinationRead` shows the author). Before, a superseded determination answered `NOT_NONCOMPLIANT`; now that is its own condition. R7 (`consequencesOf`) and R9 (`addressed`) answer `NO_SUCH_DETERMINATION` through R19; R6's revision gets R1's refusals, so a revision on a superseded determination answers R20.
- Renames: `NOT_NONCOMPLIANT` → `CONSEQUENCE_NOT_NONCOMPLIANT` (C-114.2, translation no longer speaks of supersession), `NOT_A_PARTICIPANT` → `CONSEQUENCE_NOT_A_PARTICIPANT` (C-114.3). C-114.1 is retired and its number is not reused; this module mints neither of conformance's codes.
- Tests: R1's test checks both conformance answers whole (`deepEqual` to the helper's answer) and that they write nothing, the order ahead of the standard, the rows (no C-114.1, no row for the four old codes), invisible = absent, and a live negative control. R6, R7 and R9's tests read the same answers.

**Mark:** R1's `*(not yet met: N309)*` is met once the real helpers are merged and pass; BOB strikes it (the requirements file is outside my paths).

**Found for others** (REPORT J2):
- promotion (N318): `bio-plane/src/gate.mjs` 243, 296–297 name C-114.1 and C-114.3's translation; the stamp is N318's.
- legacy-tests: `civicos-ui/check-refusal-codes.mjs` harvests module check families; C-114.1's departure and the two renames may move its census and ratchets. No hit there or in affordances' lists for `CONSEQUENCE_NOT_NONCOMPLIANT`, `CONSEQUENCE_NOT_A_PARTICIPANT` or C-114 (affordances' `NOT_A_PARTICIPANT` hits are membership's `projectleave`).
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` holds the old `CONSEQUENCES_CHECKS` (stale; not rebuilt).

**Runs so far** (with the stub): `test/m/consequences/` 24 pass, 0 fail; users: `test/m/filings/` 34/0, `test/m/escalation/` 28/0, `test/m/affordances/catalogue.test.mjs` 26/0, `test/gate-reads.test.mjs` 1/0. Checks: format 0 failures; architecture 0 failures; coverage 14 of 14 ids, 0 failures; ownership 7 files, 0 failures.

**Next step:** on BOB's CHANGE, merge `tranche/T12`, drop the stub, re-run step 5–7.
