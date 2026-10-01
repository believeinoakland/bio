# action-grammar (T19)

**Status** · session_015rMVgJZQghuCsnEjWv73v9 · depth 2 · WORKING · handled B1

## Completion (ACTION-GRAMMAR #1)

**Entries applied** (`build/plan/current.md` layer 9; B1):
- New module `bio-plane/src/action-grammar/`, 1,750 lines.
  - `grammar.mjs` is the catalogue's text moved line for line: `ACTION_KINDS`, `RISK_TIERS`, `riskTierState`, `lawProposalLabel`, `ACTION_BASIS_KINDS`, `CORRESPONDENCE_DIRECTIONS`, `RFC_RESPONSE_WINDOW_PRECEDENT`, `actionBasisFindings`, `correspondenceFindings`, `QUOTE_KEYS`, `QUOTE_NUMBER_RE`, `ORD_RE`, `isQuoteEntry`, `quoteValue`, `quoteFindings`, `CORRESPONDENCE_STAGES`, `CORRESPONDENCE_OUTCOMES`, `DECISION_STAGES`, `LIFECYCLE_KEYS`, `lifecycleFindings`. It imports record-grammar (`BUNDLE_ID_RE`, `OBJECT_TYPES`, `proposalLabel`), inquiry-grammar (`leadLegFindings`, K766) and connections (`themeLegFindings`).
  - `checks.mjs` is `actions/checks.mjs` copied whole, with three changes. It re-exports `grammar.mjs` and `jurisdictions`' `LAW_LEVELS` (the same binding). It leaves out `PENDING_CLOCKS_BAD_BEFORE` (C-117.5, action-clocks', N428). C-73.6's `where` now names `src/action-grammar/checks.mjs recordsLawRefusal > is-records-law`.
  - `index.mjs` is the one face. Its exports are exactly `actions/checks.mjs`' exports plus `ACTION_KINDS`, checked name for name.
- No import from `bio-checks.mjs` in the module or its tests (rule 1). The catalogue and `actions/checks.mjs` are untouched: their copies go in actions' job after its re-point, as B1 says. Ownership: legacy-checks 0 lines added, 0 removed.
- Improvements made in my own module (R8, R10's "never throw"):
  - `quoteFindings` and `lifecycleFindings` answer `[]` for a non-list ledger.
  - `counterpartyFindings` reads a non-object document as one with no counterparty.
  - `checkActionExtension` answers nothing for a missing `ctx`.
  - An unused `CONTENT_HASH_RE` in the copy is dropped.
  Every input the corpus holds answers exactly as before.

**Requirements met, each with its test** (`bio-plane/test/m/action-grammar/grammar.test.mjs`):
- R1: "R1, R2: every vocabulary…", "R1: riskTierState…", "R1, R11: actionKinds(view)…".
- R2: "R1, R2…", "R2: LAW_LEVELS is jurisdictions' own binding…", "R2: kindReadsAsWritten…".
- R3: "R3: the records law…" (parity), "R3 by hand…".
- R4: "R4: quoteFindings…" (parity), "R4 by hand…".
- R5: "R5: lifecycleFindings…" (parity), "R5 by hand…".
- R6: "R6: actionBasisFindings and correspondenceFindings…" (parity), "R6 by hand (DEC-13)…".
- R7: "R7: checkActionExtension…" (parity, 119 documents × 3 instance kind sets), "R7 by hand…".
- R8: "R8: every reader and arm…" (parity), "R8 by hand…".
- R9: "R9: every row is held as before the move…", "R9 by hand: the rows are exactly…".
- R10: "R10: pure: deeply frozen inputs…", "R10: never throws…".
- R11: "R11: no place is named…" (both profiles' names and covers, over every row, finding and reading); "R1, R11: actionKinds(view)…" (the test profile `test-port-ellery`).

**Parity basis.** `golden.json` (119 documents, the scalar readers, every value and row) was recorded on this branch before any edit outside my paths. It was made by running `fixture.mjs`' `suite` over `src/actions/checks.mjs` with the catalogue's `ACTION_KINDS` beside it; `corpus.mjs`' header says how. The rows differ from it in exactly the two places above.

**Awaiting stamp.** C-73.6 (`RECORDS_LAW_REFUSED`): `where` is now `src/action-grammar/checks.mjs recordsLawRefusal > is-records-law`.

**Found in other modules** (each is the owner's to fix):
- **actions (L9, next):** re-point `index.mjs`:41–48 and `export * from "./checks.mjs"` to `../action-grammar/index.mjs`. Then delete `checks.mjs` and the catalogue's copies (rule 1, B1). `index.mjs`:2124 refuses `PENDING_CLOCKS_BAD_BEFORE`, whose row is not here (C-117.5 is action-clocks'). It goes with N428's `pendingClocks` deletion.
- **Importers of `src/actions/checks.mjs` that will break when actions deletes it:**
  - `src/control-plane/families.mjs`:51 and :103 (`CHECK_FAMILY_FILES`; control-plane, L11). Re-point both to `src/action-grammar/checks.mjs`, or C-73.6's new row and the rest stop reaching the DEC-49 guard.
  - `src/setup.mjs`:23 (`RISK_TIERS`, `riskTierState`; instance-setup, L11, already worded K768).
  - These tests: `test/m/instance-setup/page.test.mjs`, `worker-page.test.mjs`, `test/m/escalation/stages.test.mjs`, `test/system/conformance.test.mjs`, `check-firing.test.mjs`, `machinefences-dec49.test.mjs`, `fence-e2e.test.mjs`, `test/risk-tier.test.mjs`, `test/d470-catalog-census.control.mjs`.
  Either actions keeps a re-exporting `checks.mjs` until they re-point, or BOB orders the re-points first.
- **R11, for BOB's reading:** R2 keeps `ACTION_KINDS`' value unchanged, and it holds `cpra_request`, a kind named after one state's records act. It is a stored value read as written (actions R4, R41), never outward text, so I left it.
- **Bundles:** none stale. Nothing imports the new module yet, so no bundle's inputs changed.

**Deferred.** None.

**Tests and checks:**
- Module: `node --test test/m/action-grammar/`: 22 pass, 0 fail.
- `test/m/control-plane/`, `test/m/legacy-checks/` and `test/system/machinefences-dec49.test.mjs`, at HEAD and at `tranche/T19`: the same 5 failures at both (control-plane R22, its "T19 wheres", legacy-checks' two rule-2 arms, and the dec49 system file). None is new.
- Layer tests: none named.
- `format`: 0 failures.
- `architecture action-grammar`: 7 files, 13 imports, 0 failures.
- `coverage action-grammar`: 11 of 11, 0 failures.
- `ownership action-grammar tranche/T19`: 0 failures (legacy-checks +0/−0).

Size (session_015rMVgJZQghuCsnEjWv73v9): test runs 6, module lines 1750

## J1 · COMPLETE

Done. Details are in the record's Completion section (job/T19/action-grammar).

Met, each with its test in test/m/action-grammar/grammar.test.mjs (titles listed in the record): R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11. Module tests: 22 of 22 pass.

Checks, all 0 failures: format, architecture, coverage (11 of 11) and ownership (legacy-checks +0/−0). The catalogue and actions/checks.mjs are untouched; their copies are for actions' job.

Rows: C-73.6's where now names src/action-grammar/checks.mjs (awaiting stamp). C-117.5 is not here; it is action-clocks'.

Reported in the record:
- When actions deletes checks.mjs, these importers break: control-plane's families.mjs:51 and :103, setup.mjs:23, and nine tests. Either they re-point first, or actions keeps a re-exporting checks.mjs until they do.
- ACTION_KINDS keeps cpra_request unchanged (R2). It is for your reading under R11.
- No bundle is stale.
