# case-disclosures (T37)

**Status** · session_016xh7RqppffzGDLer6pVudY · depth 2 · COMPLETE · handled B3

## Completion

**Reading (B1, mechanics §17).** The measured set was over 300 KB (requirements 31 KB, code 121 KB, tests 168 KB, before the used modules' public parts), so I followed option (3). I read whole: my requirements (public and private), layer 8's row of `build/layers.md` and its T29 split section, the plan's entry T37-41 and its "Rules at the opening", DEC-180, DEC-83, and K2108, K2171 and K2206. I also read whole `case-carriage`'s public part (Purpose, R1–R5, R8–R11, R13), `case-grammar` R12–R14's `obscured` text, `materials.mjs`, `materialsJudged`, `disclosureBlocks`, `carries.test.mjs` and `fixture.mjs`, and `capture.captureAccountsOf`.

A worker read the rest in full: `checks.mjs`, `accepted.mjs`, `document.mjs`, `people.mjs`, the rest of `index.mjs`, and the tests `captures`, `imported`, `seam`, `people`, `tensions` and `hunch`. Its summary is about 11 KB, each statement citing file and line. It covered:
- the C-120 table's shape and the T33 provisional-number convention;
- `carriesBodyLines`' fields and its pinned hashes;
- seam.test's R22 table, its one-negative-control-per-row arm, the R23 throwing-deps arm (every service listed) and the R23 writes-nothing arm;
- the DEC-149 wording guard.

Nothing it left out mattered. One thing it pointed out did matter: seam.test lists every service, so `photosOf` had to be added there.

**Entries applied (T37-41; N757; K2206).**
- **R6.** `materialsJudged` now reads each document's marks through `case-carriage.photoMarks({captureSha, viewer})` (its R10), using `photoRead` (new, pure, in `materials.mjs`). Each material now carries `obscured` and `photo`.
  - A marked photo with a copy is `included: false` with `obscured: {copy, label: OBSCURED_LABEL}`. It is never C-120.8, even with no extracted text held.
  - A marked photo whose cover was refused gets `PHOTO_NOT_COVERABLE`, naming each photo and member (`not_coverable`), when a load-bearing chain reaches it. A refused cover governs over an earlier copy. When only supporting members reach it, it is `included: false`.
  - An unmarked photo (`nothing_to_obscure`, `unchecked`) is judged as any document.
  - A photo whose marks cannot be read gets `PHOTO_MARKS_UNDETERMINED`, naming it (`undetermined`), whoever reaches it. It is never included.
  - Refusals come in R6's order: C-120.8, then PHOTO_NOT_COVERABLE, then PHOTO_MARKS_UNDETERMINED.
- **R7.** `materialRows` writes `obscured: {copy, label}` on the row, or null. The row's fingerprints, origin and archived copy stay the original's.
- **R22.** Two new rows, provisionally `C-120.17` `PHOTO_NOT_COVERABLE` (`is-photo-coverable`) and `C-120.18` `PHOTO_MARKS_UNDETERMINED` (`is-photo-marks-determined`). Their translations are word for word from the requirements, and they await promotion's stamp (rule 6 item 2).
- **R29.** `photosOf(materials, memberRoles, viewer)` is new.
  - It returns entries `{ref, sha, taken_by, relied_on_by, state, marks, copy, refused, words, unread}` plus `unchecked`.
  - It reuses R6's read when the materials carry one, and otherwise reads as `viewer`.
  - `taken_by` is the capture's first actor as `captureAccountsOf` lets the viewer see them.
  - `words` is `OBSCURED_LABEL`, or the new exported `PHOTO_NOT_COVERABLE_WORDS`, or null.
- **Dependency.** A new `caseCarriage` dep (a lazy `caseCarriageOf(host)`), and `OBSCURED_LABEL` imported from `case-carriage`.

**My reading, not asked as a QUESTION (it decides nothing I would build differently).** R6's "a photo whose marks cannot be read" covers any document whose `photoMarks` read throws, refuses (including `NO_SUCH_PHOTO`), or answers a shape R10 does not state. That includes a marked photo with neither a copy nor a refused cover. So such a document is refused `PHOTO_MARKS_UNDETERMINED` even when it may not be a photo. It fails closed and is never carried whole. Observations are never asked.

**Tests.** There is a new `photos.test.mjs` with 10 tests, each naming R6, R7 or R29. Other test changes:
- `seam.test.mjs`: R22's table gains the two rows, plus a raise and a negative control for each. R23's throwing-deps arm gains `caseCarriage` and `photosOf`, and asserts the failure is closed.
- `carries.test.mjs`: rows now state `obscured: null`.
- `fixture.mjs`: a `photoMarks` stand-in at case-carriage's R10 interface (`marksStandIn`), as the fixture already does for case-import.

**Depends on T37-34 and T37-40, neither built when I finished.**
- `index.mjs` imports `OBSCURED_LABEL` from `case-carriage`. Until T37-34 merges, the module does not load. I ran the tests with a local uncommitted line exporting the label, now removed.
- Two tests are red until case-grammar T37-40 merges, because they round-trip rows through its `materialsOf` with `obscured`: carries.test.mjs:75 (R6, R7) and photos.test.mjs:184 (R7). Nothing else failed.
- I re-run on BOB's CHANGE after those merges.

**Found in another module (REPORT).**
- `case-authoring` (T37-21): two of its R29 tests pin the C-120 family as C-120.1–C-120.16, and now need C-120.17 and C-120.18.
- Its fixture passes no `caseCarriage`, so it reaches the real `case-carriage`, whose `photoMarks` must answer `photo: false` for a non-image there. With a local `photo: false` stub, case-authoring ran 156 pass and 2 fail (those two). Without `photoMarks` it ran 17 pass and 141 fail, every document failing closed.

**Tests and checks run.**
- `node --test bio-plane/test/m/case-disclosures/`: 66 pass, 2 fail (the two case-grammar round trips above).
- `node --test bio-plane/test/m/case-authoring/` with the stub: 156 pass, 2 fail (reported).
- `format`: 0 failures.
- `architecture case-disclosures`: 0 failures.
- `coverage case-disclosures`: 29 of 29 ids, 0 failures.
- `ownership case-disclosures tranche/T37`: 8 files, 0 failures.
- Layer tests: none named in the manifest.

**Deferred.** None.

**P6 (size).** The module is now 1,907 lines, against the estimate of about 1,770.

Size (session_016xh7RqppffzGDLer6pVudY): test runs 14, module lines 1907

## J1 · COMPLETE

T37-41 done (record on job/T37/case-disclosures). R6/R7/R22/R29 applied; new rows C-120.17 PHOTO_NOT_COVERABLE, C-120.18 PHOTO_MARKS_UNDETERMINED (provisional, awaiting stamp). Depends at merge: case-carriage T37-34 must merge first (index.mjs imports OBSCURED_LABEL; module does not load before it); 2 tests red until case-grammar T37-40 (round-trip of obscured through materialsOf: carries.test.mjs:75, photos.test.mjs:184). REPORT for case-authoring T37-21: its two R29 tests pin C-120.1–.16 (now .17/.18); its fixture reaches real case-carriage, whose photoMarks must answer photo:false for non-images (with that stub: 156 pass, 2 fail = those). Reading: an unreadable marks read (incl. NO_SUCH_PHOTO) on any reached document fails closed as PHOTO_MARKS_UNDETERMINED. Size 1,907 lines (est. 1,770). Ready to re-run on CHANGE after the upstream merges.

## B2 · CHANGE (case-grammar merged, K2224)

- Merged `tranche/T37` @ `f3f6002068` into this branch. The two case-grammar round-trip reds now pass: carries.test.mjs (R12's `obscured: null`) and photos.test.mjs (R7). No change to the module or its tests was needed.
- Re-ran the module's tests with the same local, uncommitted `OBSCURED_LABEL` line, because case-carriage is still unmerged: `node --test bio-plane/test/m/case-disclosures/` gave 68 pass, 0 fail.
- Re-ran the checks: format, architecture, coverage (29 of 29) and ownership (8 files) each report 0 failures.
- Still owed: a re-run when case-carriage T37-34 merges (BOB's next CHANGE).

Size (session_016xh7RqppffzGDLer6pVudY): test runs 15, module lines 1907

## J3 · COMPLETE

B2 done: tranche/T37 @ f3f6002068 merged; the two case-grammar round-trip reds pass with no change. case-disclosures tests 68 pass, 0 fail (with a local uncommitted OBSCURED_LABEL line, case-carriage still unmerged); format/architecture/coverage 29 of 29/ownership 0 failures. Awaiting your CHANGE when case-carriage merges.

## B3 · CHANGE (case-carriage merged, K2226)

- Merged `tranche/T37` @ `50f65ce6ac`. No local `OBSCURED_LABEL` line remains: it was never committed and was removed after B2. The module now runs on the real `case-carriage`, whose `photoMarks` answers the shape R6 reads: `copy {sha256, …}` and `refused {code, detail}`. A marked photo whose latest derivation holds neither a copy nor a refused cover is read as unread, which fails closed.
- **One refinement to my fail-closed reading, found by case-authoring's R17 test (document.test.mjs:244).** That test's supporting-only finding reaches captures nobody holds. `photoMarks` answers `NO_SUCH_PHOTO` for them, and I refused the case. Such material travels in no case (before T37 it was listed `included: false`), so refusing it protects nothing.
  - An unreadable marks read now refuses (`PHOTO_MARKS_UNDETERMINED`) only where the answer decides what travels (`marksDecide`): the material is held whole, or a load-bearing member reaches it.
  - Supporting-only material not held whole stays `included: false`, unrefused. `photosOf` does not list it.
  - Load-bearing material whose read fails is `PHOTO_MARKS_UNDETERMINED`, never C-120.8, because its copy may yet make it presentable.
  - Nothing unread travels whole. A new arm in photos.test.mjs covers all three cases.
- **Tests:** `node --test bio-plane/test/m/case-disclosures/` gives 68 pass, 0 fail.
- **Checks:** format, architecture, coverage (29 of 29) and ownership (8 files) each report 0 failures.
- **case-authoring** (REPORT, T37-21's): 155 pass, 3 fail.
  - The two R29 tests pin C-120.1–C-120.16, so they now need C-120.17 and C-120.18.
  - carries.test.mjs:49 (R55) is already red on `tranche/T37` alone (1 fail there): case-grammar's `materialsOf` now answers `obscured: null`. Its expected rows need `obscured: null`.

Size (session_016xh7RqppffzGDLer6pVudY): test runs 21, module lines 1918
