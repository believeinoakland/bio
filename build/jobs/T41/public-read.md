# public-read (T41)

**Status** · session_01GmwKwFGVsgqKaYYdEX3pJa · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

Two readings of R3's `label_key` (T41-38), building on both meanwhile:

(1) **Marked.** R3 says `photo.obscured.label` for a photo's copy "whose signed `label` is not null or whose row states it marked". From T40 an unmarked photo's copy is signed with case-carriage's `PUBLISHED_LABEL`, which is not null, so read literally every T40+ photo would key `photo.obscured.label`. My reading: "marked" exactly as `case-grammar` R12 reads it: `obscured_marked` when the row states it, else by the label (not null = marked), so T40+ rows go by `obscured_marked` and earlier rows by their label. `photo.published.label` otherwise. Until case-grammar's merge I read `marked` from `materialsOf`'s `obscured.marked` when present, else the raw row's `obscured_marked`, else the label.

(2) **Photo or member document.** Nothing in a `materials:` row tells a photo's copy from a member document's cleaned copy (case-grammar's own `complete.mjs` says so and reads the copy's bytes), and `publishedCase` is a synchronous read over the published projection with no bytes in reach. My reading: a copy whose signed label is word for word `case-carriage`'s `COPY_CLEANED_LABEL` (R15; every member document's copy carries it, never a photo's) keys `document.cleaned.label`; every other copy is a photo's. That adds the edge public-read → case-carriage (`COPY_CLEANED_LABEL` only; case-carriage precedes public-read in layer 8 and does not use it), which I will record in my final `uses`. Alternative if you prefer no new edge: case-grammar exports a predicate — another module's change, not mine.

## Completion

**Entry applied.** T41-38 (was T40-14; N798, N811; DEC-179, DEC-185 (1), DEC-187): `publishedCase` (R3) answers, on each `materials` row carried as its copy, `label_key` beside `obscured` as signed: `photo.obscured.label` for a photo's copy `case-grammar` R12 reads `marked` (its `obscured_marked`, else a non-null label), `photo.published.label` for one with nothing covered, `document.cleaned.label` for a copy whose signed label is `case-carriage`'s `COPY_CLEANED_LABEL` word for word (J1, answered B2, K2527). A row carried whole has no key. `bio-plane/src/public-read/index.mjs` (`LABEL_KEY_*`, `labelKeyOf`, `keyedMaterialsOf`); the Worker relays the field unchanged (`publication/worker.mjs`, `{ok: true, ...c, findings, verification}`). CHANGE B3 (K2537): merged `tranche/T41` @ 7fe0e94f76 after case-grammar's merge; the key now reads case-grammar's real `obscured.marked` (the interim raw-row reading removed), the test writes `obscured_marked` through case-grammar's own writer, and `obscured.test.mjs`' R3 arms (:156, :365) are re-stated for `marked` (rule 4 (19)). CHANGE B4 (K2539): merged `tranche/T41` @ a79622d456 after case-carriage's merge; `label-key.test.mjs` and `photos.test.mjs` import `OBSCURED_LABEL`, `PUBLISHED_LABEL` and `CASE_CARRIAGE_WORDS` by name (the stand-in sentence and the copied words removed), and the test also holds that each key names, in `CASE_CARRIAGE_WORDS`, exactly the label a copy signed now carries.

**Final `uses`** (for BOB at the merge): `record-grammar`, `signatures`, `ooxml`, `case-grammar`, `publication`, `docket`, and **`case-carriage`** (new: `COPY_CLEANED_LABEL`, for R3's `label_key`; K2527). The architecture check's three failures are this edge (`index.mjs`, `label-key.test.mjs`, `photos.test.mjs`), cleared when `uses` gains it. `calculations` is not imported by this module (Uses' open line): every byte R23 needs is in the published projection.

**Also fixed in this module.** `door.mjs`' header names R25, which it serves.

**Tests.** New `test/m/public-read/label-key.test.mjs`, two tests naming R3: all three keys over five copies and a material carried whole, the label as signed beside each, through the store op and the Worker's public route; negative controls: a non-null label with `obscured_marked: false` keys `photo.published.label` and without it `photo.obscured.label`; a label one character short of `COPY_CLEANED_LABEL` is a photo's; an edition stating no copy keys nothing. Mutations (key read by the label alone; `materialsOf` unkeyed) each fail both tests.

**Reading set (mechanics §17; K2304).** Measured: requirements 27 KB plus code and tests ~724 KB, over 300 KB. Read whole myself: `build/requirements/public-read.md`; layer 8's row of `build/layers.md`; `publishedCase` (`index.mjs` HEAD :700–1140), the helpers my change sits beside, and the Worker's `publishedcase` relay (`worker.mjs`:632–700); `obscured.test.mjs`; the used services my entry names (`case-grammar` R12 and `materialsOf`/`obscuredRead`, `case-carriage`'s `COPY_CLEANED_LABEL`, R11/R15 lines). A worker read the rest of the module's code and tests in full and wrote a 17 KB summary, every statement citing file and line (door, checks, casefile, courtorders, credit, reads, index outside :700–1140, worker, container, inband, every test file but obscured/convert-publishedcase/photos, and fixture). Nothing it left out mattered: it confirmed the Worker and the door pass `materials` through unprojected, that no code before this told a photo's copy from a document's, and that `publishedSix` cannot carry materials rows (so the test builds its own edition). Of its flaw list: the `marked` reading and the case-carriage edge are K2527's; pairing raw rows by index is gone with the interim reading; door's R25 fixed; the rest below.

**Found in other places (for BOB).**
- `build/requirements/public-read.md` Status line says "Last changed" twice and marks T37 and T40 not yet met while R3 carries the T41 mark (wording, BOB's).
- `published.test.mjs`' R16 arm (:296) lists the publication services `publishedCase` reaches (`caseDocMemberFrozen`, `caseEditionState`, `soleCase`, `stampedEditions`); `publishedManifest`'s archive walk also reaches `publishedMaterialText` (`index.mjs` `#copiedOriginals`) when a copied original is present, a service Uses names, so no flaw against R16, but that arm's world never exercises it. Left as is.
- `case-checker`'s `program.mjs` is stale after case-grammar's merge (`program.test.mjs`:19); rule 4 (14), not this module's input.

**Tests and checks run.**
- `node --test bio-plane/test/m/public-read/` (after both merges): tests 158, pass 158, fail 0.
- Users of the service I changed (R3), each against the commit before my change (`931fde1837`), failing test names compared with durations stripped: network-notices 66 pass / 6 fail, filings 69/1, op-declarations 109/8, answer-envelope 24/4, control-plane 191/4, plane 148/7, each identical to the base (inherited reds, rule 4); ratification 220/0, case-checker 61/0 before the merge. After the merge: ratification 220/0, case-checker 60/1 (`program.mjs`, above), network-notices 66/6 (same).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs public-read`: 3 failures, each the `case-carriage` edge above. `checks/coverage.mjs public-read`: 33 of 33 live ids named, 0 failures. `checks/ownership.mjs public-read tranche/T41`: 5 files, 0 failures.
- `test/system/migrate-released.test.mjs` (plane's system test): fail 1 both with my change and at `931fde1837`, the same cause (released stores lack the current tables against a fresh store); not this module's.

Size (session_01GmwKwFGVsgqKaYYdEX3pJa): test runs 22, module lines 3,563

## J2 · COMPLETE

T41-38 complete after CHANGE B3 (case-grammar, K2537) and B4 (case-carriage, K2539), tranche merged @ a79622d456. R3 label_key applied per K2527 and tested with negative controls (label-key.test.mjs). public-read 158/158; users' reds identical to the base; format 0, coverage 0, ownership 0; architecture 3, each the new case-carriage edge: final uses add case-carriage. Details and findings for you in the record's Completion.

CHANGE B5 (K2543): merged `tranche/T41` @ e2f3e4b7f7 after publication's merge; re-run on the merged tip: `test/m/public-read/` 158 pass, 0 fail; format 0, coverage 0 (33 of 33), ownership 0, architecture 3 (the `case-carriage` edge, as above). Nothing changed; the completion above stands.

## J3 · COMPLETE

B5 handled: tranche merged @ e2f3e4b7f7; public-read 158/158; format 0, coverage 0, ownership 0, architecture 3 (the case-carriage edge for your merge). Nothing changed; J2's COMPLETE stands.
