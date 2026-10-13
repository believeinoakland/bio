# case-grammar (T47)

**Status** · session_01MumH1LDmj58bzBZXFqYHEm · depth 2 · COMPLETE · handled B0

## Completion (CASE-GRAMMAR #15)

**Entry applied** · T47-25 (N952, N953; and N908's re-pointed cross-references): R30, R31 met; R8, R23, R29 met.
- **R30** (N952) `workingOnOf(fm)` / `workingOnLines(ref)` already behaved exactly as R30 states (gate `caseDocumentRequiresTensionSection`, `isNoticeReference`, null otherwise; the line folded onto one line as handed, none for null). No code change but the comments citing R30 and `public-read` R19. New tests name R30 with both controls R30 names (a `/4` document with a well-formed `working_on` answers null; a malformed value answers null), every format from `/5` and before it, and the one-reading equivalence over arbitrary values.
- **R31** (N953) `materials.mjs`: `MATERIAL_OBSCURED_KIND_FIELD` (`obscured_kind`) and `MATERIAL_OBSCURED_KINDS` (`photo`, `document`), both re-exported from the index. A `document` row handed `obscured.kind` writes `obscured_kind` flat after `obscured_label` (and after `obscured_marked` when that is written). Its value is the kind when it is one of the two words, else `null`. `materialsOf` reads `obscured: {copy, label, marked, kind}`. `kind` is null on a row stating none or a value outside the two words. A row handed no kind is written byte for byte as before. Ruled here (a detail, mine): "handed a kind" means the key is present and not `undefined`. So a kind handed as `null` writes `obscured_kind: null` (undetermined), and an absent or `undefined` kind writes no line. That keeps every current writer's bytes unchanged until it hands a kind (`case-carriage` T47-26). The `obscured:` trigger is unchanged: a row states `obscured` by `obscured_copy`/`obscured_label`, as R12 says. R13's check and R14's edition are untouched: R14 still picks the cleaned-copy line by the copy's bytes, as its T39 test pins ("never by the row"). Whether R14 should read `kind` first is left to BOB, since R14 does not say.
- **R8, R23, R29** (N908): the comments' cross-references are re-pointed to `case-inputs` R6 and R9 and `case-authoring` R74 (`edition.mjs`, `account.mjs`, `outcomes.mjs`). The meaning is unchanged, and their existing tests still name them.

**Read** · I read whole, myself: `build/requirements/case-grammar.md`; the public parts of `record-grammar`, `calc-grammar` and `strength`; layer 8's contract and T47's opening table in `build/layers.md`; the plan's T47-25 entry and its "Rules at the opening"; every source file in `bio-plane/src/case-grammar/` (17 files) and every test file and fixture in `bio-plane/test/m/case-grammar/` (the two golden JSON files excepted, as fixtures). No flaw found that a requirement or this entry reaches. The only deliberate non-change is R14's choice by bytes (above).

**Deferred** · none.

**Found in other modules (REPORT J1)** · R31's reading shape (`kind` added to `obscured`) opens 7 reds in other modules' tests. Each deep-compares a read-back `obscured` against `{copy, label, marked}` and needs `kind: null` added to its expected value (or the kind its writer will hand from T47-26 on):
- `case-carriage` `obscured.test.mjs`:31 "R1 case-grammar reads the obscured row this module's tests write …";
- `public-read` `obscured.test.mjs`:156 "R3 a row carried as its copy answers obscured: {copy, label} exactly as signed …" and :366 "R23 a member document carried as its cleaned copy …";
- `case-disclosures` `documents.test.mjs`:234 and `photos.test.mjs`:251, "R7: a member document / a photo R6 answers with obscured …";
- `case-authoring` `documents.test.mjs`:147 and `photos.test.mjs`:60, "R14: a member document carried as its cleaned copy / a marked photo …".

Also stale: `case-checker`'s generated `program.mjs` (its R13 test). That is rule 5.4's accepted red, regenerated at layer close. Unchanged before and after: `case-authoring` `t46-words.test.mjs`:193 R73 (inherited, rule 5.7a).

**Tests and checks** (on `job/T47/case-grammar` @ the commit carrying this change; `tranche/T47` has moved since only in mail and docket/publication files this job does not read)
- `node --test test/m/case-grammar/*.test.mjs`: tests 152, pass 152, fail 0 (146 before the new tests; `kind.test.mjs` R31 ×4, `reference.test.mjs` R30 ×2).
- Users' tests, before → after: case-carriage 80/0 → 79/1; public-read 186/0 → 184/2; case-checker 80/0 → 79/1 (program.mjs); case-disclosures 97/0 → 95/2; case-authoring 209/1 → 207/3. Unchanged after, 0 fail: case-tensions 23, publication 141, docket 75, case-catalogue 16, ratification 233, case-import 101, case-account 41, review 46. case-inputs has no tests yet.
- `checks/format.mjs`: 0 failures; `architecture.mjs … case-grammar`: 0 failures; `coverage.mjs … case-grammar`: 31 of 31 live ids named, 0 failures; `ownership.mjs … tranche/T47`: 0 failures.
- `checks/run.mjs`: format 0, architecture 0 failures (3084 files), channels 0; coverage 43 failures, none case-grammar's (other modules' T47 ids, rule 5.1).

Size (session_01MumH1LDmj58bzBZXFqYHEm): test runs 8, module lines 2795

## J1 · REPORT

R31's reading shape (obscured gains kind, null on a row stating none) opens 7 reds in other modules' tests, each deep-comparing a read-back obscured to {copy, label, marked}; each needs kind: null in its expected value (or the kind its writer hands from T47-26): case-carriage obscured.test.mjs:31 (R1); public-read obscured.test.mjs:156 (R3) and :366 (R23); case-disclosures documents.test.mjs:234 and photos.test.mjs:251 (R7); case-authoring documents.test.mjs:147 and photos.test.mjs:60 (R14). Also case-checker's program.mjs stale (rule 5.4). Before/after counts and detail in my record. Open for BOB, not taken: R14 still chooses the cleaned-copy line by the copy's bytes (its T39 test pins 'never by the row'); whether it should read R31's kind first is R14's wording, not this entry's.

## J2 · COMPLETE

T47-25 applied: R30 met as built (tests name it with both controls); R31 obscured_kind written/read (photo | document, other values null, absent writes no line; detail ruled in record); R8, R23, R29 cross-references re-pointed. case-grammar 152/152; format, architecture, coverage (31/31), ownership 0 failures; run.mjs architecture 0. 7 reds in users' tests from R31's shape (REPORT J1). Record: build/jobs/T47/case-grammar.md on job/T47/case-grammar.
