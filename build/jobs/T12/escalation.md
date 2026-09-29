# escalation (T12)

**Status** · session_01Tt8xQRrVDzqdXdqgxzdFMT · depth 2 · WORKING · handled B1

## Work

Entries N309, N312 (K380), applied on `job/T12/escalation`:
- **R1** `NO_SUCH_DETERMINATION` and `DETERMINATION_SUPERSEDED` are answered through conformance's `noSuchDetermination` (R19) and `determinationSuperseded` (R20), reached as `conformanceModule.<name>`. Until conformance's helpers are merged into `tranche/T12`, a stand-in in their wording answers (conformance's own row where it has one: C-113.15 today; `DETERMINATION_SUPERSEDED` has no row until conformance adds it, so `check`/`translation` are null meanwhile). The stand-in goes on BOB's CHANGE. `determination` is the id as asked (null when none, empty or not text); `superseded_by` is named only when this viewer can read the successor (read through `determinationRead`). Rows C-116.3 and C-116.4 retired, their numbers not reused; their DEC-49 regions removed.
- **Renames** `NOT_A_PARTICIPANT` → `ESCALATION_NOT_A_PARTICIPANT` (C-116.6), `NOT_PROPOSED` → `EDGE_NOT_PROPOSED` (C-116.30); rows and sites keep their numbers, regions and translations.
- R13's `not yet met: N309` mark struck. R1's mark stays until the real helpers are merged and its real-helper test runs.

Tests: `open.test.mjs` R1 (the relayed answers' fields, absent and unseen alike, successor named only when readable, the codes not in `ESCALATION_CHECKS`); `stages.test.mjs` R13 (`EDGE_NOT_PROPOSED`, C-116.30); `invariants.test.mjs` (relayed codes carry conformance's row); `real.test.mjs` "R1 over the real conformance" is a `test.todo` until conformance's R19/R20 are exported, then it asserts escalation's answer equals each helper's exactly.

## Found elsewhere (reported)

- `bio-plane/dist/bio-plane.bundled.mjs` (not_product's generated bundle) is stale: it still holds C-116.3, C-116.4 and the old names of C-116.6, C-116.30. Not rebuilt.
- N318 (promotion R34, next tranche): check rows changed here: C-116.3 and C-116.4 retired; C-116.6 renamed `ESCALATION_NOT_A_PARTICIPANT`; C-116.30 renamed `EDGE_NOT_PROPOSED`.
- `civicos-ui/check-refusal-codes.mjs` (legacy-tests'): 25 failures on this branch, most from other modules' T12 work. Escalation's share: arm G counts the stand-in's `"NO_SUCH_DETERMINATION"` literal as a third site until conformance's helper lands; the regions/rows/governedSites figures move with the two retired rows. `ESCALATION_CHECKS.NOT_NONCOMPLIANT` minted at two sites (consequences and escalation) is consequences' rename to fix (`CONSEQUENCE_NOT_NONCOMPLIANT`, K380). Re-anchoring is legacy-tests'.
- Grep of `civicos-ui/` and affordances for the added and retired codes: no escalation hit (`affordances/facts.mjs`:117's `NOT_A_PARTICIPANT` is membership's leave).
