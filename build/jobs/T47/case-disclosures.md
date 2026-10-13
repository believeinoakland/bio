# case-disclosures (T47)

**Status** · session_017ZBDmksjrNtUgd9oEHF8Hy · depth 2 · COMPLETE · handled B4

## Completion (CASE-DISCLOSURES #12)

**Entry applied** · T47-76 (N953, K3038, K3096): R32 met, on J1's reading confirmed by B2 (K3109). R6 answers case-carriage R22's `obscured` object whole (`kind` included) with K2483's `label_key` beside it; R7 writes `{copy, label, marked (a photo's), kind}` into the `materials:` row, so case-grammar R31 writes `obscured_kind`; nothing derives `kind`; an answer naming a copy whose object R22 does not state fails closed (PHOTO_MARKS_UNDETERMINED / DOCUMENT_COPY_UNDETERMINED). Details in Progress below.

**After B4 (case-carriage T47-26 and case-grammar T47-25 merged, K3115)** · tranche merged in; every arm over the real case-carriage and through case-grammar's read-back green with no further change.

**Found in other modules (REPORT J3)** · case-authoring: its `photos.test.mjs`:36 stand-in for `photoMarks` answers the pre-R22 shape (a copy with no `obscured` object), so R34's two photo arms ("R34 (T38; DEC-183 (1)): signing is refused while any photo …" and "R34: steps gains photos …") now see the photos as unread (R32 fails closed) and go red; the stand-in needs R22's `obscured: {copy, label, marked, kind: "photo"}` (CASE-AUTHORING #28's). Every other red in case-authoring (3), plane (2) and answer-envelope (6) is the same title for title before and after my change (diffed against tranche/T47's case-disclosures).

**Tests and checks** (on `job/T47/case-disclosures` with tranche/T47 merged per B4)
- `node --test test/m/case-disclosures/`: tests 99, pass 99, fail 0.
- Users: case-account 41/0, case-check 34/0, review 46/0; case-authoring 205/5 (3 inherited + the 2 above); plane 221/2 and answer-envelope 27/6 inherited, identical before and after.
- `format.mjs` 0; `architecture.mjs … case-disclosures` 0 (18 files); `coverage.mjs … case-disclosures` 32 of 32, 0; `ownership.mjs … tranche/T47` 0 (7 files).
- `checks/run.mjs`: format 0, architecture 0 (3106 files), channels 0; coverage 38 failures, none case-disclosures'.

Size (session_017ZBDmksjrNtUgd9oEHF8Hy): test runs 16, module lines 2290

## Progress (CASE-DISCLOSURES #12)

**Entry** · T47-76 (N953, K3038, K3096): R32 applied on my J1 reading, awaiting BOB's answer and case-carriage's and case-grammar's T47 merges (B1: CHANGE when they do).
- `photoRead`/`documentRead` (`materials.mjs`) take case-carriage R22's `obscured` object from the answer that names a copy, through `obscuredRead` (new, exported): the object unchanged when its `copy` is the answer's copy, `label` words, `kind` the read's own (`photo` / `document`), a photo's `marked` a boolean equal to its standing marks' state; otherwise the answer is one R10/R16 do not state and fails closed (PHOTO_MARKS_UNDETERMINED / DOCUMENT_COPY_UNDETERMINED). `kind` is never derived.
- R6 (`materialsJudged`) answers that object whole with K2483's `label_key` beside it; R7 (`materialRows`) writes `{copy, label, marked (a photo's), kind}`, never `label_key`. `COPY_CLEANED_LABEL` is no longer imported by `index.mjs` (the words arrive in the object).
- Tests: `copies.test.mjs` (new, two R32 arms: the marker per kind with the carried-whole control; the label's words decide nothing and every unstated object fails closed); `photos.test.mjs`, `documents.test.mjs` and the fixture's case-carriage stand-in updated to R22's shapes.

**Read** · requirements (whole); all module code (`index.mjs`, `materials.mjs`, `document.mjs` whole; `accepted.mjs`, `checks.mjs`, `people.mjs` not touched by the entry, read in part); `fixture.mjs`, `photos.test.mjs`, `documents.test.mjs` whole myself; case-carriage R10, R11, R22 and case-grammar R12, R31 (the services R32 names). Over the 600 KB limit (§17 (3)): a helper in this session read whole and digested, citing each section, `account`, `captures`, `hunch`, `imported`, `people`, `seam`, `tensions`, `carries` tests. Sources stayed binding.

**B3 (case-grammar merged, K3111)** · tranche merged in; my R7 rows already carried `kind`, so both R7 read-back arms and R32's marker arm are green with no change: module 97/2. The two left wait on case-carriage R22.

**Reds before B3, each awaiting a merge (not mine to fix)** · module 95/5 of 100: over the real case-carriage, "R6, R29 over the real case-carriage" and "R6, R7 over the real case-carriage" (R22 not yet merged: no `obscured` in the real answer, so fail closed); the case-grammar read-back in both R7 row arms and R32's marker arm (R31 not yet merged: `obscured_kind` not written or read).

**Found in other modules (REPORT J2)** · case-authoring 205/5 (base 209/1, R73 inherited): its R14 rows arms (photo, member document) and R34's two photo arms go red, through the real case-carriage until R22 merges, and its R14 arms' expected rows then need `kind` (case-authoring's job, CASE-AUTHORING #28, which merges after me).

**Deferred (test flaws the digest found, not affecting compliance)** · `carries.test.mjs`:151 a timestamp-row arm that cannot fail; `seam.test.mjs` R23 `disclosureBlocks` arm asserts only `group`; several titles name more than they check (carries "R6, R7", seam K1333). Left to keep this job to its entry.

**Checks so far** · format 0; architecture case-disclosures 0; coverage 32/32, 0; ownership 0 (7 files); run.mjs: format 0, architecture 0 (3084 files), channels 0, coverage 43 failures none mine. Users: case-account 41/0, case-check 34/0, review 46/0, case-authoring as above.

## J1 · QUESTION

R32, my best reading on two points (I carry on with it):
(a) K2483's `label_key` stays: R6's `obscured` is case-carriage R22's object with every field it answers unchanged (`copy`, `label`, `marked` for a photo, `kind`), plus K2483's `label_key` beside them as today; R7's row writes the object's fields `{copy, label, marked (a photo's), kind}` and never `label_key`.
(b) Fail closed: an answer naming a copy whose `obscured` is absent, or whose `kind` is not the read's own (`photo` from `photoMarks`, `document` from `documentCopy`), whose `copy` is not the copy the answer names, or (a photo) whose `marked` is not the standing marks' state, is an answer R10/R16 as amended do not state: the photo is PHOTO_MARKS_UNDETERMINED, the document DOCUMENT_COPY_UNDETERMINED. Nothing derives `kind`. Consequence: my arms over the real case-carriage (photos.test.mjs, documents.test.mjs) and the rows' read-back through case-grammar go red until case-carriage's and case-grammar's T47 merges reach tranche/T47; I re-run them at your CHANGE.

## J2 · REPORT

R32 built on my J1 reading and pushed (record: Progress). Reds that wait on merges, not mine: my 5 arms over the real case-carriage (R22) and through case-grammar's read-back (R31). case-authoring: 205/5 vs base 209/1 — its R14 rows arms (photo, member document) and R34's two photo arms, through the real case-carriage until R22 merges; its R14 expected rows then need kind (CASE-AUTHORING #28's, merging after me).

## J3 · REPORT

case-authoring photos.test.mjs:36's photoMarks stand-in answers the pre-R22 shape (copy, no obscured), so R32 fails closed and R34's two photo arms ('R34 (T38; DEC-183 (1)): signing is refused …', 'R34: steps gains photos …') go red; it needs obscured {copy, label, marked, kind: photo} (CASE-AUTHORING #28's). All other case-authoring, plane and answer-envelope reds identical before and after.

## J4 · COMPLETE

T47-76 applied: R32 met (K3109 reading). B4 merged; case-disclosures 99/99; format, architecture, coverage 32/32, ownership 0 failures; run.mjs architecture 0. One finding in case-authoring (REPORT J3). Record: build/jobs/T47/case-disclosures.md on job/T47/case-disclosures.
