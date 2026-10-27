# publication → publication-seams — split map (T51-146, T51-147)

**Status** · Draft by a planning worker for BOB #215, 2026-10-18; T51-146 (new module) and T51-147 (publication); C57, P6, K624, K657, K1043, K3268, K3809 (1), K3921. Not reviewed. Read in full: `requirements/publication.md`, `extraction/retrieval-browse.md` (the format), `extraction/publication-split-4.md`, `src/deliverer.mjs`, `src/publication/index.mjs`, `schema.mjs`, `checks.mjs`, `door.mjs`, `worker.mjs`, the `modules.json` entries of publication and of every module before it (index 0 to 105). Read in part: users and tests, by grep (the lines named); rulings K1821 (5), K2053, K2982, K3189, K3268, K3809, K3915, K3921. Line numbers: `tranche/T51` today (`d51e826e42`).

**Why.** `plan/current.md` T51-146: "publication is 4,468 raw lines (2,444 without comments and blanks)".

| file in publication's `paths` | lines | bytes | owned by (most specific path) |
|---|---|---|---|
| `src/publication/index.mjs` | 2,747 | 195,408 | publication |
| `src/publication/schema.mjs` | 614 | 41,125 | publication |
| `src/publication/checks.mjs` | 112 | 8,123 | publication |
| `src/publication/door.mjs` | 109 | 7,253 | publication |
| `src/deliverer.mjs` | 55 | 3,408 | publication |
| **publication's own code** | **3,637** | **255,317** | |
| `src/publication/worker.mjs` | 833 | 59,188 | **public-read** (`modules.json` index 108 names it) |
| what the plan counted | 4,470 | | |

- The 4,468 is the figure K2982 already struck: `worker.mjs` is public-read's by the most specific path (K1821 (5), K2424). By that rule publication is **3,637**, no split owed (K2982, K3189). Nothing in T51 adds code to publication (T51-140's re-exports are already in the tree: `index.mjs`:133–134, `checks.mjs`:23–29).
- The binding measure K3809 (1) gives is the reading set (K2053, 300 KB): requirements 62.7 KB + own code 255.3 KB = **318 KB**, over. The cut below brings it to about **285 KB**. BOB's call whether that is the reason to split (doubt 1).

## 0. Was `publication-split-4.md` done, and is it still the right cut?

**Not done.** There is no `edition-index` in `modules.json` or `src`; K2982 mapped it only ("headroom cut, mapped only"); N909 closed.

**Not the right cut for T51-146/147, for one reason: it sits after publication.** Its reads (R37, R38's third read, R41–R43) read publication's tables. A module placed before publication cannot read them (P4), so `edition-index` had to go after publication, publication could not delegate to it, and every user re-pointed (its §4). K3268 (2026-10-14, after the map) rules the opposite: a split keeps delegating, no user re-points. Its stamps share (R62, R64, the court-order source, `edition_stamps`) is reusable and is in the cut below. Its line numbers are close to today's (index 2,744 then, 2,747 now).

**The same constraint decides this map.** Every large block of publication reads or writes its tables (`published_*`, `cases`, `case_documents`, `case_exclusions`). The new module is before publication, so it may use only code that touches none of them, or code that owns the tables it touches. A cut that moved the tables would move about nine tenths of the module (doubt 3). The six DEC-49 regions in `commitCaseEdition` (`is-counsel-matter-published`, `is-case-format-current`, `is-source-consent-withdrawn`, `is-photo-marks-current`, `is-document-copy-current`, `is-accepted-work-standing`) and the C-122 rows stay: `answer-envelope/families.mjs`:105 and :240 read `publication/checks.mjs` by path, and the rows' `where` strings name `index.mjs`.

## 1. The cut and the new module

**Proposed name `publication-seams`; BOB's (K569).** Purpose: what publication asks of other modules and offers to them that touches none of its tables: the criteria a commit freezes (R72, R75), the counsel-matter scope read (R78's read), the court-order stamps with their source (R62, R64), the two provider slots (R23 review, R77 waiting editions) and the public group description (R65).

| | `publication-seams` |
|---|---|
| layer | 8 |
| place in `modules.json` | index 105, directly after `case-tensions` and before `publication`; its row empty (`"paths": [], "tests": [], "uses": []`, K1043), filled by T51-146 in the commit that creates the directories. A `layers.md` L8 row and a `MODULE_ORDER` entry in `membership/order.mjs`:110 (K657: before `"publication"`) go with it, "accepted red" as K1043's. |
| why not literally first in layer 8 (index 101) | its code reads `case-grammar` (`materialsOf`, `calculationsOf`, `caseFilePath`: index 101). "First in R8" is the merge order (K624, plan merge orders): T51-146 merges first, as `retrieval-browse` does in L5 and sits directly before `retrieval`. |
| `paths` / `tests` | `["bio-plane/src/publication-seams/"]` / `["bio-plane/test/m/publication-seams/"]` |
| from | none (K624) |
| `uses` | `record-grammar` (1: `parseFrontmatter`, `BUNDLE_ID_RE`), `record-core` (34: `textAtSha`, `bundleInfo`, `declareTable`), `membership` (35: `groupDescription`), `project-roster` (36: `projectScope`), `promotion` (39), `standards` (61: `standardRead`, `bindsAt`), `entities` (54: `readEntity`), `content` (53: its `content` read contract), `case-grammar` (101). Each index is below 105, and each is already in publication's own `uses`, so no edge is new except publication → `publication-seams`. Tests: `test-support` and the fixture modules, as publication's. |
| entry point | `publicationSeamsOf(host, deps)` (K61), created inside `publicationOf` as `corpus-export`, `case-carriage` and `case-tensions` are (`void p.caseCarriage`, index.mjs:2689), so `plane/store.mjs` changes nothing. `deps`: `storage`, `record`, `membership`, `promotion`, `now`, optional `standards`, `entities`, `roster` (a test's own, forwarded as publication forwards `sources`), and one host read `signedEditionsOf(caseId)` (publication's `#signedEditions`, index.mjs:1372, which reads `case_documents`; the one place the stamps need a publication table, handed in as `retrieval-browse` is handed its host reads). |
| files | `index.mjs` (factory, class, R65), `criteria.mjs` (R72, R75, counsel scope, calculation inputs), `stamps.mjs` (R62, R64), `providers.mjs` (R23, R77), `schema.mjs` (`edition_stamps`) |

## 2. What moves (by copy, K624)

| moved | from | lines | requirement |
|---|---|---|---|
| `HEX64`, `isStandardId`, `CRITERIA_NOT_RECORDED`, `ACCESS_WORDS`, `MACHINE_VIEWER` (and `str`, copied) | `publication/index.mjs` 178–185, 188–189 | 10 | R72 |
| the `standards`, `roster`, `entities` lazy getters | 241–250 | 10 | R72, R78 |
| `#counselMatterIn`, `#committedProject` (the read only; the refusal stays) | 1176–1214 | 39 | R78 |
| `#criteriaOf`, `criteriaFor`, `#criterion`, `#withCaptures`, `#entityName` | 1216–1319 | 104 | R72, R75 |
| `#calculationInputs`, `#withInputs` | 1321–1342 | 22 | R22 |
| `EDITION_STAMP_EFFECTS`, `safeJson` (copied) | 148–149, 176–177 | 4 | R62 |
| `#orders`, `registerOrderSource`, `orderSource` | 220, 322–341 | 21 | R62 |
| `stampEdition`, `stampsOf`, `stampedEditions` (`#signedEditions` 1371–1375 stays, handed in) | 1377–1457 | 81 | R62, R64 |
| `edition_stamps` DDL and its comment | `schema.mjs` 470–485 | 16 | R62, R31 |
| `WAITING_DOORS`, `#waiting`, `registerWaitingEditions`, `waitingSource`, `#waits`, `#signedAtOf` | 186–187, 221, 343–379 | 39 | R77 |
| `REVIEW_DOORS`, `NO_REVIEW_PROVIDER`, `#review`, `registerReviewProvider`, `reviewProvider` | 192–205, 219, 292–320 | 44 | R23 |
| `publicGroupDescription` | 381–392 | 12 | R65 |
| **total** | | **403** (about 28 KB) | |

**In the copy:**
- `#rows` and `#one` become the module's own closures over `storage.sql` (K57); the `content` read in `#withCaptures` is the `content` module's stated read contract.
- `shaOf`, `HEX64` and `str` stay in publication too (one line each; both use them elsewhere).
- No answer, refusal (`PROVIDER_DECLARED`, `PROVIDER_MALFORMED`, `STAMP_NO_ORDER`, `NO_SUCH_CASE_EDITION`, `NO_ID`, `MALFORMED`), bound (`RESTING…`, none here) or order of reads changes. A source that throws is still read as waiting (`#waits`) and as no instant (`#signedAtOf`).
- `publishedWorkOf` (R76, index.mjs:421–429) reads the registered waiting source's doors directly and lets a throw reach its own catch (`{unreadable: true}`): the module exposes `waitingDoors()` (the registered `{module, isWaiting, signedAtOf, signerOf}` or null) so that read is unchanged.

**Stays in publication (not moved, and why):**
- the six DEC-49 regions and the C-122 rows (`checks.mjs`, `PUBLICATION_WORDS`): paths named by `answer-envelope` and by the rows' `where`;
- `commitEdition`, `commitCaseEdition`, `caseEditionState`, `caseDocumentFacts`, `storeCaseDocument`, `reauthorSection`, the R37/R41–R43/R42/R38 reads, the registries, `publicationProvider`, `publishedWorkOf`, `door.mjs`, `deliverer.mjs`, `worker.mjs`: each reads or writes publication's tables or is another module's by path;
- every re-export: `index.mjs`:132–146 and `checks.mjs`:23–29.

## 3. Requirement ids

| publication | `publication-seams` | what |
|---|---|---|
| R75 | **R1** | `criteriaFor` |
| R72 (its row composition: rows, `body`, `binds`, `access`, `passages`, `captures`, "not held", label, access words, the reads made as the signer or a machine viewer) | **R2** | the criteria one commit records, as a read |
| R78 (what is named: `{project, findings}`, at most 200, each project asked once, a scope that cannot be read is `none`) | **R3** | the counsel-matter scope read |
| R62 | **R4** | `stampEdition`, `stampsOf`, the court-order source |
| R64 | **R5** | `stampedEditions` |
| R23 | **R6** | the review provider |
| R77 | **R7** | the waiting editions' source |
| R65 | **R8** | `publicGroupDescription` |
| R31 (its `edition_stamps` clause) | **R9** | exempt from purge |
| R24, R34 (copies) | **R10, R11** | append-only (stamps); no place named |
| new | **R12** | `publicationSeamsOf(deps)`, the seam: the one host read, `waitingDoors` |

**Retired in publication as "moved to `publication-seams` R<n>":** R75 → R1, R62 → R4, R64 → R5, R23 → R6, R77 → R7, R65 → R8. Ids never reused.

**Re-worded in publication, meaning unchanged:** R72 (the commit records the rows `publication-seams` R2 answers, frozen, answered by R53 as `criteria`), R78 (the refusal, the order of refusals and the controls stay; its scope read is R3), R31 (stamps' clause), R21, R70, R76 (name R7's doors), R22 (calculation inputs), Uses (+`publication-seams`; the job greps whether `standards`, `entities`, `content`, `project-roster` are still named by a source or test fixture, else drops them), Purpose, Status, Size. R40's tables are unchanged.

**Wording only elsewhere:** `docket` R25, `public-read` R28, `review`, `publish-schedule` R8, `case-authoring`, `case-inputs` R1, `membership` R125 cite R23, R62, R64, R75, R77 by id; not edited here (K3268).

## 4. How publication delegates, and what is re-exported

- `publicationOf` builds `publicationSeamsOf(host, {…})` after `migrate()` and the purge declaration; the Publication keeps it as `this.seams`.
- One-line delegates keep every public name and signature: `criteriaFor`, `stampEdition`, `stampsOf`, `stampedEditions`, `registerOrderSource`, `orderSource`, `registerReviewProvider`, `reviewProvider`, `registerWaitingEditions`, `waitingSource`, `publicGroupDescription`. The internal calls (`#waits`, `#signedAtOf`, `#counselMatterIn`, `#criteriaOf`, `#withCaptures`, `#calculationInputs`, `#withInputs`, `CRITERIA_NOT_RECORDED`) call the module's.
- `EDITION_STAMP_EFFECTS` is re-exported from the new module (`t33.test.mjs` imports it from publication).
- **No user re-points (K3268).** Every user calls the instance (`docket` index.mjs:842, :1184; `public-read` `stampedEditions`; `ratification/schedule.mjs` `stampsOf`; `review`; `case-authoring`, `case-inputs`; `publish-schedule`); the plane composes publication only.
- **K651 identity test** (`casedoc.test.mjs`:121) and **T51-140's four re-exports** (`WORDS`, `caseWordsOf`, `lensClosingSentencesOf`, `CASE_DOCUMENT_FORMAT_V7`): no re-export line moves. T51-147 leaves `index.mjs`:132–146 and `checks.mjs`:23–29 as they are.
- The table `edition_stamps` keeps its name and its columns; only its owner changes. `PUBLICATION_EXEMPT` loses it and `publicationOwns("edition_stamps")` becomes false.

## 5. Tests

Today `test/m/publication/` is 5,277 lines in 27 files. A moved test cannot use publication's `planeWorld` (publication is later).
- **To `test/m/publication-seams/`, rewritten on its own fixture** (a store with `record-core`, `membership`, `promotion`, `standards`, `entities`, `content`, `project-roster`; a stand-in `signedEditionsOf`):
  - `t33`:147–229 (R62's three arms);
  - `t34`:40–89 (R64, R65);
  - `t35`:182–266 (R75's three arms and the machine-viewer arm);
  - `t37`:80–131 and :191–207 (the `captures` arms of R72);
  - `t41`:38–63 (R77's registration);
  - `t48`:14–84, `casedoc`:202–222 (R23);
  - `invariants`:23's stamps clause (R31).
  - New: R12, R3's two arms (a counsel scope read, a scope that throws), and the module's `waitingDoors`.
- **Stay, re-tagged as delegation tests:** `t35`:78–181 and `t37`:141–218 (they drive `commitCaseEdition`: rows recorded equal the module's rows, refusals in order), all of `t45` (R78's refusals), `t41`:83–229 (R21, R70, R76 through the slot), `t47`:82 (no provider), and one arm per delegated method.
## 6. Sizes after

| | lines | bytes |
|---|---|---|
| publication's own code before | 3,637 | 255 KB |
| moved | 403 | about 28 KB |
| delegation added to publication (11 delegates, wiring, one re-export, imports) | about 45 | about 3 KB |
| **publication's own code after** | **about 3,280** | **about 230 KB** |
| the plan's count (with `worker.mjs`) after | about 4,110 | |
| requirements: R23, R62, R64, R65, R75, R77 retired, R72 and R78 shortened | | 62.7 KB → about 55 KB |
| reading set: requirements + own code | | 318 KB → about **285 KB** |
| `publication-seams` | about **490** (index about 130, criteria about 200, stamps about 110, providers about 90, schema about 25) | about 35 KB |

By the plan's own count (4,468) the cut leaves publication near 4,110, still over about 4,000. No cut that obeys the constraints in §0 takes more than about 400 lines (doubt 2).

## 7. Risks

1. **The identity test and the re-exports** hold only if T51-147 leaves lines 132–146 and `checks.mjs`:23–29 alone and adds the `EDITION_STAMP_EFFECTS` re-export in the same commit that deletes the constant.
2. **Declaration window for `edition_stamps`** (split-4's risk 3). Both modules would declare it while both live (`TABLE_DECLARED`; publication keeps the answer in `purgeDeclaration`). Nothing composes the new module until T51-147 builds it in `publicationOf`, in the same commit that removes the DDL and the exempt entry; between the two merges only its own tests run it.
3. **Slot identity and order.** Each of the three slots (R23, R62's source, R77) is one per host: one `publicationSeamsOf` per host (a `WeakMap`, K61), so `PROVIDER_DECLARED` still answers once. R21 and R76 call the waiting doors synchronously inside the caller's transaction; the delegation adds a call and no `await`.
4. **Forwarded test injection.** A test that passes `standards`, `entities` or `roster` to `publicationOf` must reach the module (as `sources` reaches `case-carriage`): `fixture.mjs` of publication, `case-authoring`, `public-read`, `docket` pass them.
5. **Refusal order** in `commitCaseEdition` (R78, R58, R51, R57, R59, then criteria) is unchanged because the regions stay; `t45`:89 and `t37`:169 are the controls.
6. **`membership`'s `MODULE_ORDER`** test is red from the `modules.json` row until its L2 job adds the id, the same accepted red as `corpus-export`'s (K1043, K657).
7. **Generated artifact.** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` regenerate at the layer close with `src/publication-seams/*.mjs`.
## 8. T51 job sequence

1. **T51-146 PUBLICATION-SEAMS (new, L8, first):** create the directories, copy §2 and its tests (§5), write `requirements/publication-seams.md` (R1–R12), fill the `modules.json` row (§1), add the `layers.md` L8 row. Merges early.
2. **T51-147 PUBLICATION (L8, after):** delete the copies, add the delegates and the factory call (§4), re-export `EDITION_STAMP_EFFECTS`, drop `edition_stamps` from `PUBLICATION_SCHEMA` and `PUBLICATION_EXEMPT`, retire R23, R62, R64, R65, R75, R77 and re-word R72, R78, R31, R21, R70, R76, R22, Uses and Size (§3), re-tag the delegation tests, report the size.
3. **Membership L2 job (K657):** `MODULE_ORDER` gains `publication-seams` before `publication` (`membership/order.mjs`:110), with the same act as the `modules.json` row.

## 9. Doubts for BOB (best reading in each)

1. **Whether to split at all.** By K1821 (5), K2982 and K3189 publication is 3,637 raw, no split owed; the plan's 4,468 counts `worker.mjs`. By K2053's reading set it is 318 KB. *Reading:* split, as K3921's rebuilt plan asks, and restate M-T51-1's figure as 3,637 raw / 318 KB.
2. **How big the cut can be.** About 400 lines (28 KB) is the most that meets K3268 and P4 without moving tables. *Reading:* take all three themes (criteria, stamps with their table, the provider slots). Without the stamps and their table the cut is 281 lines (about 19 KB) and no table changes owner; the reading set then reads about 292 KB.
3. **The bigger cut, rejected.** A module owning the tables (schema, every table read and write, `commitEdition`, `caseEditionState`, the reads) is about 2,600 lines and re-slices R24, R31, R40 and most of 75 requirements: a rewrite of the commit, not a copy. *Reading:* no.
4. **The name.** `publication-seams` names three small themes by what they do not touch. A one-theme name does not exist at this size. BOB's.
5. **R72 and R78 are split, not moved.** The commit's refusal and its recording stay publication's (their regions and rows cannot move without a catalogue change and a re-point of `answer-envelope`); only the read each composes moves, as R2 and R3. *Reading:* as drawn; moving the regions would re-point `answer-envelope` and move `CATALOG_VERSION` (rule 17), against K3268.

