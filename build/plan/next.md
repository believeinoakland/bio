# Plan: next (T29)

**Status** · Entries for the tranche after T28, written as T28 runs (P18). Started at T28's opening by BOB #104, 2026-10-03 (K1299).

## Entries

- S5 · 2026-10-03 · **promotion**: stamp the catalogue rows T28's L6–L11 jobs add (case-checker's, case-import's, accepted-work's and docket's new rows, and any the drafts name that did not exist at T28's L2), as their T28 records name them; `CATALOG_VERSION` MINOR; `ROW_CENSUS` re-pinned. **Why next:** promotion is L2, before the rows exist (P8, P10). Clears T28's red 2.

- N528 · 2026-10-03 · **DEC-120–DEC-123** (U30–U32): the wizard and its two libraries, a phone's act set and handoff, both themes, bundled typefaces and scripts, the 57 design principles. Their owed server-side work is folded into requirements once on `main` (the design stream's next PR, merged at a tranche close) or as Bob names it; the screens are the UX stream's (K633). **Hard reason:** the DECs are not yet on `main` (manifest "Parallel work").

- N529 · 2026-10-03 · **case-authoring split** (K1315): if CASE-AUTHORING #13 completes past ~4,000 lines (measured 3,426 at its START; R43–R54 add ~700–800), split it at the disclosures seam (R31–R37, R43–R54), the new arms already in their own files (`materials.mjs`, `accepted.mjs`), so the split moves whole files. **Why next:** one job per module (P8); the split is a new module's job (P6).

- N530 · 2026-10-03 · **capture's account statement, one spelling** (K1317): `case-checker` spells `bio-capture-account <sha>\n<text>` itself (R3, R14) because `capture` is store-bound; move `captureAccountStatement` into a pure module both use (`record-grammar` or a pure file of `capture`). **Why next:** both jobs are running or merged (P8).

- N531 · 2026-10-03 · **reevaluation**: `acceptanceWithdrawn`'s detail read passes `class:admin` as its viewer, which `case-import` R16 answers null, so the acceptance cause's `group` and `case` read null (CASE-IMPORT #1 J3; K1319). Read as the plane (no viewer) for the telling's detail, or state why not. **Why next:** reevaluation's T28 job is merged (P8).

- N532 · 2026-10-03 · **publication split** (K1322): 3,996 lines at its T28 merge, at the ~4,000 mark (P6). Split at the seam its job named (R57's holding: `#holdMaterials`, `#tokenFiles`, `publishedMaterialText`, `heldMaterialsOf`, ~140 lines; R59's re-read, ~50) before its next job adds to it. **Why next:** its T28 job is merged (P8). **Seam (K1332, `build/extraction/publication-split-2.md`):** new module `case-carriage` (L8, directly before publication) takes R57's holding, R59's and R51's re-reads (~270 lines; publication ~3,820) and owns `published_material_texts`, `published_case_materials`; publication keeps one-line delegates and writes every `published_shas` row. With it: provenance R48 names `register.bytes`; publication R57's timestamp-token sentence reworded to the capture's `provenance.json` as built (K1322).

- N533 · 2026-10-03 · **docket, then control-plane** (K1331; CONTROL-PLANE #18 J1): docket's family shares `PRESSURE_MARKED` (C-129.12 / action-grammar C-117.17) and `PRESSURE_REFUSED` (C-129.13 / C-117.15) with action-grammar, so reading it at its module-order place would re-row both. docket: its own codes for the two (catalogue rows re-worded, stamped by promotion); then control-plane: `CHECK_FAMILY_FILES` reads docket at its module-order place (R43's docket clause). **Why next:** docket's T28 job is merged (P8); control-plane's move follows docket's codes (dependency).

## Carried from T28

The left-out table of `current.md` (T28), unchanged until re-read at T29's opening.
