<!-- Seam read for ratification's split before T34-85 (K617), written for BOB #125 on 2026-10-06 on tranche/T34 by a worker. Uncommitted; BOB reviews it. -->
# ratification — split before T34-85 (seam read, K617)

**Status** · DRAFT for BOB #125, 2026-10-06, on `tranche/T34`, uncommitted. Why: ratification measures **3,987** lines (`checks.mjs` 1,281, `index.mjs` 1,219, `ops.mjs` 921, `release.mjs` 304, `refusals.mjs` 149, `retire.mjs` 113). T34-85 (R3 and R32 amended, R40–R48) would take it past 4,000. Read whole: `requirements/ratification.md`, all six source files, the test list (17 suites and `fixture.mjs`, 5,227 lines), its `modules.json` entry, `plan/current.md` T34-85 and the L8 merge order, K617, K624, K1505 (1), publication's "SPLIT for T33" paragraph and `extraction/publication-split-2.md`. Users were found by grep over `bio-plane/src`, `bio-plane/test` and `build/requirements/*.md`.

## 0. The answer

**Neither A nor B. Split the case-document catalogue out (seam D):** the pure C-41 catalogue and C-2.8's case-member arm (R8 and R9's definitions, R38) go by copy to a new module **`case-catalogue`**. It sits in layer 8 **directly before** `ratification`. Ratification keeps both registrations with `promotion` and re-exports every moved name, so no importer changes code.

| seam | ratification after split | after T34-85 (400 / 650 lines) | new module | other modules' requirements re-worded | code outside the two modules |
|---|---|---|---|---|---|
| A `bulk-acts` (release + retire) | ~3,500 | ~3,900 / **~4,150** | ~520 | 2 (capture, promotion) | none (if placed *before* ratification, §5) |
| B new module for R40–R48 | **~4,050** (hooks only) | ~4,050 | ~450–650 | 5+ (publication, affordances, op-declarations, scheduler, case-grammar) | plane (`door.mjs`, `store.mjs` op map) |
| **D `case-catalogue`** | **~3,005** | **~3,400 / ~3,650** | ~1,000 | 4 (case-authoring, case-checker, case-grammar, publication), wording only | none; case-checker regenerates `program.mjs` in T34-47 |

**Why not B.** Ratification is already 13 lines under the mark. T34-85 still needs these inside ratification:
- R3's waiting clause;
- the pre-commit refusals of `ratifyCaseDocument` (718–966) exposed as a service, plus the commit and the after-commit steps (R6, R36, R37, R39), which the publisher re-runs;
- R44 in the pre-flight;
- R47's re-wording.

That is about 60–100 lines, so ratification passes 4,000 before anything is moved. B also re-points every requirement already worded for T34 that says "`ratification` serves `op=publishat`": `publication` R66, R67 and the T34-79 Suggestion, `affordances` R42, `op-declarations` R25, `scheduler`, and `case-grammar` R21's status. The Worker half would also need a new route in `plane/door.mjs`, and `plane/store.mjs` would have to spread a new op map.

**Why not A.** A frees about 490 lines, leaving ratification at about 3,500. The estimate of 400 lines for T34-85 is low on this module's own record:
- `retire`, specified at about 130 lines (K653), landed at +158 net (f8082b16).
- R18's pre-flight landed at +180 (b89c9dba).
- T34-85 states nine ids. These include a second ceremony path, the `checked` snapshot over four sources, a re-checking publisher with its after-commit steps run from the Durable Object, a registration and five catalogue rows.

On those figures 550–650 lines is the honest range, which puts A at about 4,050–4,150. **A stays the reserve cut** (§6) for the next tranche that adds more than about 300 lines here.

**Why D.**
- **Headroom.** It removes about 980 lines, leaving ratification at about 3,000, and about 3,650 at worst after T34-85.
- **No catalogue churn.** The moved code is pure, owns no table and calls nothing of ratification's. `CASE_DOCUMENT_FAMILY` is deliberately not `*_CHECKS` (`checks.mjs` 476–479), and its rows carry no `where`. So control-plane's `CHECK_FAMILIES`, the DEC-49 totality test and the census lines (`[check, code, where, translation]`) are untouched.
- **No meaning change.** No requirement's meaning changes and no catalogue row moves.

## 1. The new module

- **Name:** `case-catalogue`, the case-document catalogue (C-41) and C-2.8's case-member arm. The alternative is `case-document-checks`.
- **Place:** layer 8, in `modules.json` directly before `ratification`: … `project-stage`, `network-notices`, **`case-catalogue`**, `ratification`, `case-checker`, ….
- **Merge:** early in L8, right after `case-grammar` (T34-88), copy first (K624 (1)).
- **Paths:** `bio-plane/src/case-catalogue/` (`checks.mjs`, one pure file; an `index.mjs` re-exporting it is optional). Per K1043, `paths` and `tests` stay empty in `modules.json` until its job creates them.
- **Tests:** `bio-plane/test/m/case-catalogue/`.
- **Uses** (each earlier; none is ratification):
  - `record-grammar`: `ISO_TS_RE`, `BUNDLE_ID_RE`, `BASIS_GRADES`, `GRADE_AXES`.
  - `strength`: `STRENGTH_STATES`, through `strength/arithmetic.mjs` only (K1317: pure spellings, so case-checker's bundle stays pure).
  - `case-grammar`: `CASE_DOCUMENT_FORMAT(S_ACCEPTED)`, the three format predicates, `whatChangedOf` (its R8), `isNoticeReference` and `WORKING_ON_KEY` (its R10).
- **No table, no store, no registration of its own.** Ratification keeps registering it.

## 2. What moves (`ratification/checks.mjs`, by copy)

| moved | lines today | to |
|---|---|---|
| the finding shape `f()` (copied; ratification keeps none it needs) | 23–29 | private |
| the case relation in a document's bytes and C-2.8's case-member arm: `caseEditionClaimed`, `isCaseMemberBytes`, `SUBJECT_POSITIONS`, `CASE_MEMBER_ROLES`, `biasAcknowledgementOf`, `completenessFields`, `checkPublishedExtension` | 31–415 | R2 |
| the C-41 catalogue: `SEARCHED_SUBJECT_SOURCES`, `CASE_DOCUMENT_FAMILY` (C-41.1–.17), `CASE_CITATION_VERSIONS`, `checkCaseDocument` | 416–962 | R1, R3 |
| where the arm runs: `caseMemberFindings`, `caseMemberImageFindings`, `withCaseMemberChecks` | 1246–1281 | R2 |

**Stays in ratification's `checks.mjs`:**
- the refusal rows (963–1245): `RATIFY_MACHINE_FENCE_CHECKS`, `RATIFY_TESTIMONY_CHECKS`, `RATIFY_ATTRIBUTION_CHECKS`, `CASE_CONCLUSION_CHECKS`, `RATIFY_SCOPE_CHECKS`, `RELEASE_CHECKS`, `RATIFY_REGISTRATION_CHECKS`, `rowOf`;
- a header;
- one line, `export * from "../case-catalogue/checks.mjs";`.

That re-export keeps every importer whole:
- `index.mjs` (`export * from "./checks.mjs"`);
- `ops.mjs:27`;
- `affordances.mjs:93`;
- `case-authoring/{index,searched}.mjs`;
- `case-checker/check.mjs:25`;
- the tests `case-authoring/fences.test.mjs` and `affordances/catalogue.test.mjs`.

Rule for the re-export: it must point at the pure `checks.mjs`, never at an index that imports store-bound code (K1317).

**Not moved:**
- R1 (the case-conclusion comparison, which reads publication and basis-versions);
- the ceremonies;
- `refusals.mjs`;
- the bulk acts (A's seam, kept in reserve);
- every C-32, C-53, C-58, C-65, C-92, C-102 and C-33 row.

## 3. Requirement ids

**`case-catalogue`, numbered afresh:**
- **R1** (was ratification R8, its catalogue): `checkCaseDocument(fm, ctx)` answers the findings of C-41.1–C-41.17 and the case arms of C-2.8, C-3.1 and C-21.1. It is pure and never throws, and an absent member basis leaves those arms unasked. It exports `CASE_DOCUMENT_FAMILY`, `CASE_CITATION_VERSIONS` and `SEARCHED_SUBJECT_SOURCES`. It also carries C-41.16's rule and its translation, word for word.
- **R2** (was ratification R9, its definitions): `checkPublishedExtension` (C-2.8's case-member arm), asked only of bytes `isCaseMemberBytes(fm)` answers true for. It exports `caseEditionClaimed`, `isCaseMemberBytes`, `completenessFields`, `biasAcknowledgementOf`, `CASE_MEMBER_ROLES` and `SUBJECT_POSITIONS`, all pure, and the three runners `caseMemberFindings`, `caseMemberImageFindings` and `withCaseMemberChecks`.
- **R3** (was ratification R38): `working_on`, when present and not a notice reference by `case-grammar` R10, is refused under C-41.17.
- **R4** (was ratification R14, its C-41 share): each check is an invariant with its test (K6): C-41.1–C-41.17 with the case arms of C-2.8, C-3.1 and C-21.1. A change moves `CATALOG_VERSION` (rule 17).
- **R5** (copy of ratification R15, which stays): no place is named in this module's findings or vocabularies.
- **Decided** (copied from ratification's Decided 4, 5, 6): `SUBJECT_POSITIONS`, `SEARCHED_SUBJECT_SOURCES`, `caseEditionClaimed` and `isCaseMemberBytes` are this module's. record-grammar keeps its own `isCaseMemberBytes` for C-3.1 (record-grammar R33, unchanged).

**Retired in ratification as moved:** R38.

**Re-worded in ratification (wording only, ids kept, as publication-split-2 kept R57):**
- **R8:** "This module registers `case-catalogue`'s `checkCaseDocument` (its R1) with `promotion` as the catalogue `runCaseGate` runs (K31), and re-exports its names. Since `runCaseGate` runs it, `op=caseratify` (R2's `GATE_REFUSED`) and the pre-flight (R18) refuse C-41.16 before signing." So `promotion` R47's "(`ratification`, its R8)" stays true, unchanged.
- **R9:** "This module registers `case-catalogue`'s `checkPublishedExtension` (its R2) with `promotion` as a check, and as an audit check, on bytes `isCaseMemberBytes` answers true for, and re-exports its names."
- **R14:** the C-41 and case-arm clause becomes "C-41.1–C-41.17 and the case arms are `case-catalogue`'s (its R4)". Every row it lists stays here.
- **Status:** gains a "SPLIT for T34" paragraph in K1505 (1)'s form.
- **Uses:**
  - gains `case-catalogue` (R8, R9, and the gate and audit image);
  - `case-grammar` (K1074)'s `whatChangedOf` line goes, while case-grammar stays for K1816's `peopleOf` and `memberTiesOf`;
  - `strength` keeps `testimonyCorroboration`, and its `STRENGTH_STATES` clause goes.
- **Decided 4–6:** say "`case-catalogue`'s; re-exported here".

## 4. Other modules (requirement text: wording only; code: none required this tranche)

| module | requirement text | code |
|---|---|---|
| `case-checker` | Status ("after `ratification`, whose pure case-document checks it runs" becomes "after `case-catalogue`…"); R7: `case-catalogue.checkCaseDocument` (its R1); Uses: `case-catalogue`: `checkCaseDocument`, `CASE_MEMBER_ROLES` (its R1, R2) | **T34-47** (its job, already in L8 after ratification) re-points `check.mjs:25` to `../case-catalogue/checks.mjs` and **regenerates `program.mjs`** (§7 (1)); `modules.json` `uses` gains `case-catalogue` (and drops `ratification` if nothing else is read) |
| `case-authoring` | R3 (`NO_SUBJECT_POSITION`: `case-catalogue`'s `SUBJECT_POSITIONS`); R10 (`case-catalogue.completenessFields`); Uses line split: `ratification` keeps `caseConclusionFor`, `editionsRecordingConclusion`, `caseRatifyPreflight`; `case-catalogue` takes `completenessFields`, `biasAcknowledgementOf`, `SUBJECT_POSITIONS`, `SEARCHED_SUBJECT_SOURCES`; the Suggestion naming the `SEARCHED_SUBJECT_SOURCES` re-export | none (reads through ratification's re-export); re-points at its next job that touches those imports (owed N-entry, T35) |
| `case-grammar` | R10: "refused by `case-catalogue` R3" (was `ratification` R38) | none |
| `publication` | Decided ("The C-41 family and `checkCaseDocument` are `case-catalogue`'s") | none |
| `affordances` | none (its requirements do not name the owner of `SUBJECT_POSITIONS`) | none (`affordances.mjs:93` reads through the re-export) |
| `promotion` | none (R47 still reads true) | none |

**Catalogue rows (C-…) that move: none.** C-41.1–C-41.17 are gate findings in `CASE_DOCUMENT_FAMILY`, held by the module that defines them. Every refusal row (C-32.12–.15, C-53.10–.12, C-58.1–.5, C-65.1, C-92.10–.12, C-32.1, C-33.10–.12, C-102.10) stays in ratification. T34-85's C-58.6–.10 land there too.

**`modules.json`:**
- a new entry before `ratification`;
- `ratification.uses` gains `case-catalogue`;
- `case-checker.uses` gains it in T34-47.
- No import cycle: case-catalogue uses three modules from layers 1, 6 and 8, all earlier.

## 5. Tests

**Move to `test/m/case-catalogue/`.** These are the pure arms of `ratification/checks.test.mjs` (383 lines): lines 74–262 (R8 ×7, R38, R9 ×5) and 350–383 (N538, /7), re-labelled with the new ids. Their header helpers are lines 14–73. None of them uses `fixture.mjs`'s `world`. About 290 lines.

**Stay in ratification:**
- the rows arms (286–336);
- the registration arm, which uses `world()` (263–285);
- R15 (337, split: the rows part stays, and the vocabularies part is copied).

The remaining suites stay. `converted-*`, `case-commit` and `registration` reach `checkCaseDocument` through ratification's registration, which is unchanged.

## 6. Line counts after the split

| module | lines |
|---|---|
| `case-catalogue` | ~1,000 (986 moved + header) |
| `ratification` | **~3,005**: `checks.mjs` ~300, `index.mjs` 1,219, `ops.mjs` 921, `release.mjs` 304, `refusals.mjs` 149, `retire.mjs` 113 |
| `ratification` after T34-85 | ~3,400 at 400 lines; ~3,650 at 650 lines |

**Reserve cut (seam A), for a later tranche.** Release and retire, with `RELEASE_CHECKS` and C-58.4, R20–R31, R33 and R34, would form `bulk-acts`, about 520 lines. Place it **before** ratification, not after: it uses only record-grammar, record-core, promotion, retrieval, connections, contradiction and capture. Ratification would keep R32's `release` and `retire` arms as delegates, and its `checks.mjs` would re-export `RELEASE_CHECKS`, so `plane/store.mjs`, `families.mjs` and capture's code need no change. Requirement re-wording would touch only `capture` R78 and its Suggestion, and `promotion` R52 and its Status. Keep the family name `RELEASE_CHECKS`: `skillpack.machineFences` publishes `family` for `MACHINE_CANNOT_RELEASE`. The moved rows' `where` would change, so the census moves (rule 17).

## 7. Risks

1. **case-checker's program goes stale** for a window. Once ratification's `checks.mjs` re-exports from `case-catalogue`, the bundled `program.mjs` names `src/case-catalogue/checks.mjs`, so its bytes and `PROGRAM_SHA256` change. `program.test.mjs` R13 is red from ratification's L8 merge until case-checker's (T34-47, later in the L8 order). Accept it **by name** (K545's precedent). T34-47 regenerates the program anyway for its own R9 change. The checker's behaviour is unchanged, and so is `bio-case-file/1`.
2. **Two copies in the window** (K624 (1)). Between case-catalogue's early merge and ratification's, the same code is held twice. `test/system/row-census.mjs` dedupes tables and rows by identity, so it counts the 17 C-41 rows twice in that window. Accept it by name with accepted red 4 (the census is awaiting stamp all of T34). To shorten the window, merge case-catalogue just after case-grammar and have ratification merge the tranche branch at its START, as T34-88 already arranges.
3. **The job's size.** T34-85 now also deletes ratification's copy and re-points `index.mjs`'s and `ops.mjs`'s imports to `./checks.mjs` (unchanged lines). That is mechanical and adds no new job. **T34's job count rises by one (73 → 74): CASE-CATALOGUE #1.**
4. **Meaning.** None changes. Both registrations stay ratification's, so `promotion` R47, the gate and the audit read the same function. Every moved name keeps its spelling and is re-exported. C-41's rows, ids, words and `CATALOG_VERSION` are untouched. *Flag:* "this module's" in Decided 4–6 changes owner (wording). `SUBJECT_POSITIONS` is still spelled in one place only.
5. **R8's sentence order.** C-41.16's translation is stated inside R8. It moves with the catalogue (case-catalogue R1), and ratification R8 keeps the consequence sentence, so both files state it. Nothing is restated differently.
