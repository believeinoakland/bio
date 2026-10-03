# affordances (T28)

**Status** · session_01PjbqD3UQJJBDSqXLMiUhac · depth 2 · WORKING · handled B1

## Completion record (AFFORDANCES #18)

**Entries applied** (`build/plan/current.md` T28 L11; B1):
- **R35** (N520, N522; K1313), in `bio-plane/src/affordances.mjs`:
  - `RUNGS`: `importaccept`, `importacceptwithdraw`, `importflag`, `importflagclear` are `reasoned`. `IMPORT_ACCEPT_NO_REASON` and `IMPORT_FLAG_NO_ISSUE` join `JUSTIFICATION_REFUSALS`.
  - `RUNG_ABSENT`: `caseimport` and `caseimportdocument` are `undetermined`, as `inboxpull` is. R27's count now reads 25.
  - `NON_ACTS`: the six writes are import-directed. `importedcases` and `importedcase` read `read: …`. `casechecker` and `casefilespec` read `read: public, no credential`.
  - Not in `MACHINE_REFUSALS`. No vocabulary added.
- **From docket (K1314–K1316):** `catalogue.test.mjs` now names `MACHINE_CANNOT_MARK_DOCKET_PRESSURE` among docket's codes kept out of the family (docket R2, N526).
- **From publication (K1321):** no change was needed in this module's files. No test here calls `commitCaseEdition` directly. The R19 cases that sign a case go through `case-authoring`'s fixture (`statementack`), which already signs `/6` since that module's L8 merge, and `publication`'s fixture `signCase` (not used here). Both pass against R58. Accepted red 7's arm for `affordances' backing.test.mjs` is therefore already clear.

**Tests added or changed** (each names R35):
- `catalogue.test.mjs`: a new R35 test, keyed to `caseImportOps`. It checks each grade, both codes against `CASE_IMPORT_CHECKS`, every other import code kept out of the family, each `NON_ACTS` reason word for word, the absence from `MACHINE_REFUSALS`, no vocabulary added, and R12's totality with the control plane's rows. It has negative controls for a misgraded op, an ungated read and an op left out.
  - R2's bands now include the four acts.
  - R27's test counts 25, with R35's two beside R32's and R34's.
- `backing.test.mjs`, driven at `case-import`'s interface over its fixture:
  - Each of the four reasoned acts, with each account field absent, null, empty, blank or over 2,000 characters, is refused with its owner's code, which is in the family, and writes nothing. With the account it is accepted.
  - Correction forward: the acceptance stays after its withdrawal, a later acceptance is accepted, and the flag stays after its clear.
  - `caseimport` and `caseimportdocument` are accepted with no reason given.
- `plane.test.mjs`: R19's "every reasoned op is driven" guard lists the four acts, at the backing drive.

**Catalogue rows added that read `awaiting stamp`:** none. This module adds no check rows. Its two new family codes are `case-import`'s rows C-130.8 and C-130.13.

**Deferred:** nothing.

**Found in other modules** (also sent to BOB as a REPORT):
- `control-plane` `totality.test.mjs` (R2, R41): `unaccounted` over the door's table now reads `stale` for my ten names. These are `caseimport`, `caseimportdocument`, `importaccept`, `importacceptwithdraw`, `importflag`, `importflagclear`, `importedcases`, `importedcase`, `casechecker` and `casefilespec`. They read `stale` because `op-declarations` R14 has not yet put them in the table. Before my change, the table did not have them either, so this test was green on them. This is the arm accepted red 4 names. It clears when op-declarations' and control-plane's L11 merges carry the rows (both come after mine). Nothing is unpublished or unranked.
- `control-plane`: two failures are red on `tranche/T28` without my change, and my change does not alter them:
  - `catalogue-end.test.mjs` (R43, R22: C-92.4's decorated hash, accepted red 7, control-plane's re-wording);
  - `families.test.mjs` (R22: `CHECK_FAMILIES` totality, accepted red 6).

**Test runs and checks:**
- `node --test bio-plane/test/m/affordances/`: tests 156, pass 156, fail 0.
- Every user of `affordances`, before and after my change:
  - tasks 71/0 → 71/0;
  - queue (with `conclude-project`) 106/0 → 106/0;
  - op-declarations 43/0 → 43/0;
  - plane (with `migrate-released`) 66/0 → 66/0;
  - control-plane 137 pass / 2 fail → 136 pass / 3 fail. The third failure is the `stale` arm above.
- `format: 95 modules, 94 requirements files; 0 failures`
- `architecture: 13 product files, 142 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 35 of 35 live requirement ids named by a test; 0 failures`
- `ownership: 5 files changed by affordances between tranche/T28 and HEAD; 0 failures`

Size (session_01PjbqD3UQJJBDSqXLMiUhac): test runs 15, module lines 3263
