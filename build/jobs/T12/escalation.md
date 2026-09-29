# escalation (T12)

**Status** · session_01Tt8xQRrVDzqdXdqgxzdFMT · depth 2 · COMPLETE · handled B2

## Work

Entries N309, N312 (K380), applied on `job/T12/escalation`:
- **R1** `NO_SUCH_DETERMINATION` and `DETERMINATION_SUPERSEDED` are answered through conformance's `noSuchDetermination` (R19) and `determinationSuperseded` (R20), imported from conformance (merged K400; the interim stand-in removed on B2). `determination` is the id as asked (null when none, empty or not text); `superseded_by` is passed only when this viewer can read the successor (read through `determinationRead`). Rows C-116.3 and C-116.4 retired, their numbers not reused; their DEC-49 regions removed.
- **Renames** `NOT_A_PARTICIPANT` → `ESCALATION_NOT_A_PARTICIPANT` (C-116.6), `NOT_PROPOSED` → `EDGE_NOT_PROPOSED` (C-116.30); rows and sites keep their numbers, regions and translations.
- Requirement marks left to BOB (B2): my strike of R13's mark was reverted. R1 and R13 are both met.

Tests: `open.test.mjs` R1 (the relayed answers' fields, absent and unseen alike, successor named only when readable, the codes not in `ESCALATION_CHECKS`); `stages.test.mjs` R13 (`EDGE_NOT_PROPOSED`, C-116.30); `invariants.test.mjs` (relayed codes carry conformance's row); `real.test.mjs` "R1 over the real conformance" asserts escalation's answer equals each real helper's exactly (absent, unseen, none, superseded).

## Found elsewhere (reported)

- `bio-plane/dist/bio-plane.bundled.mjs` (not_product's generated bundle) is stale: it still holds C-116.3, C-116.4 and the old names of C-116.6, C-116.30. Not rebuilt.
- N318 (promotion R34, next tranche): check rows changed here: C-116.3 and C-116.4 retired; C-116.6 renamed `ESCALATION_NOT_A_PARTICIPANT`; C-116.30 renamed `EDGE_NOT_PROPOSED`.
- `civicos-ui/check-refusal-codes.mjs` (legacy-tests'): 25 failures on this branch, most from other modules' T12 work. Escalation's share: the regions/rows/governedSites figures move with the two retired rows. `ESCALATION_CHECKS.NOT_NONCOMPLIANT` minted at two sites (consequences and escalation) is consequences' rename to fix (`CONSEQUENCE_NOT_NONCOMPLIANT`, K380). Re-anchoring is legacy-tests'.
- Grep of `civicos-ui/` and affordances for the added and retired codes: no escalation hit (`affordances/facts.mjs`:117's `NOT_A_PARTICIPANT` is membership's leave).

## J1 · REPORT

N309, N312 built on `job/T12/escalation` (pushed). R1 answers `NO_SUCH_DETERMINATION` and `DETERMINATION_SUPERSEDED` through conformance's `noSuchDetermination`/`determinationSuperseded`, reached as `conformanceModule.<name>` with a stand-in in R19/R20's wording until they are merged; renames `ESCALATION_NOT_A_PARTICIPANT` (C-116.6) and `EDGE_NOT_PROPOSED` (C-116.30); C-116.3 and C-116.4 retired. Tests: 28 pass, 0 fail, 1 todo (R1 over the real conformance, waiting on its merge). format, architecture, coverage (21/21): 0 failures. ownership: 1 failure, `build/requirements/escalation.md`, which is me striking R13's `not yet met: N309` mark (as K395 accepted for publication); R1's mark stays until the real helpers land. Waiting on your CHANGE with conformance R19/R20 merged; I then drop the stand-in, run the real-helper test and complete. Reported (details in my record): `bio-plane/dist/bio-plane.bundled.mjs` stale; N318 rows (C-116.3/.4 retired, C-116.6/.30 renamed); legacy-tests' `check-refusal-codes.mjs` shifts, including arm G counting the stand-in's `NO_SUCH_DETERMINATION` literal until the helper lands; `NOT_NONCOMPLIANT` still minted in consequences too (its K380 rename). No civicos-ui or affordances hit for escalation's codes.

## Completion

Entries applied: N309, N312 (R1 through conformance R19/R20; renames C-116.6 `ESCALATION_NOT_A_PARTICIPANT`, C-116.30 `EDGE_NOT_PROPOSED`; C-116.3, C-116.4 retired). Deferred: nothing.

- `node --test test/m/escalation/` (in `bio-plane/`): tests 29, pass 29, fail 0, todo 0. No layer tests are named in the manifest.
- `checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `checks/architecture.mjs escalation`: 10 product files, 40 relative imports; 0 failures.
- `checks/coverage.mjs escalation`: 21 of 21 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs escalation tranche/T12`: 7 files changed; 0 failures.

Size (session_01Tt8xQRrVDzqdXdqgxzdFMT): test runs 5, module lines 1421
