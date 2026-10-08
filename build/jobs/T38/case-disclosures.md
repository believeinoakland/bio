# case-disclosures (T38)

**Status** · session_016Wyn6CMpXu3twcahXtRYbM · depth 2 · WORKING · handled B2

## Job

**Entry.** T38-12 (N779, N788 (1); DEC-183 (1); K2220, K2248, K2291, K2303), the plan's rules 4 and 8.

**Reading set (mechanics §17).** Measured at START: 787 KB (over 300 KB). Option (3) followed. I read in full: my requirements; layer 8's row of `build/layers.md`; case-carriage's Purpose, R10, R11 and R14 (the services my Uses names for this entry); the `photo.*` entries of `words.json`; and the code and tests this entry changes: `src/case-disclosures/index.mjs`, `materials.mjs`, `checks.mjs`, and `test/m/case-disclosures/photos.test.mjs` and `fixture.mjs`. My own worker read the rest in full (`document.mjs`, `accepted.mjs`, `people.mjs`; `captures`, `carries`, `hunch`, `imported`, `people`, `seam` and `tensions` tests; 2,311 lines). It wrote a summary of about 6 KB, each statement citing file and line, covering:
- what depends on `materialsJudged`, `photosOf`, the C-120 rows and the photo exports;
- seam.test's row table and photo arms, quoted verbatim.

Nothing it left out mattered. `document.mjs` never reads `obscured`.

**Applied.**
- **R6.**
  - A photo never travels whole: `included: false` always, and never C-120.8.
  - Refusals, in R6's order: C-120.8, `PHOTO_MARKS_UNDETERMINED`, then new `PHOTO_UNCHECKED`, then `PHOTO_NOT_COVERABLE`.
  - `PHOTO_UNCHECKED` covers every unchecked photo any member's chain reaches, load-bearing or supporting (K2291's reading). It names each photo with its members.
  - `PHOTO_NOT_COVERABLE` now applies to a refused cover whether the photo is marked or `nothing_to_obscure`.
  - A checked photo with a copy travels as `obscured: {copy, label}`. `label` is `OBSCURED_LABEL` only when marked, else null.
  - A withdrawn mark counts as withdrawn. `photoRead` derives the state from the standing marks (`withdrawn == null`); an answer whose state disagrees fails closed as unread.
  - Also unread: a mark with no `areas`, and a checked photo holding neither a copy nor a refused cover.
  - An unchecked photo has no copy.
  - The `PHOTO_UNCHECKED` and `PHOTO_NOT_COVERABLE` refusals carry `photo`: the photos' refs, which fill `{photo}`. The translation stays the row's verbatim template.
- **R22.**
  - New row `PHOTO_UNCHECKED`, provisional C-120.19, region `is-photo-checked`.
  - C-120.17's translation is now `photo.refused.format`.
  - Both translations are held once in the exported `PHOTO_WORDS`, keyed by their `words.json` keys and verbatim; a test reads `words.json` by key against them. The generated `setup-words.mjs` holds no `photo.*` words, so they are held here.
  - Rows awaiting stamp: **C-120.17 PHOTO_NOT_COVERABLE (translation changed) awaiting stamp; C-120.19 PHOTO_UNCHECKED (new) awaiting stamp** (T39's promotion job).
- **R29.**
  - `words` is `photo.refused.unchecked` for an unchecked photo and `photo.refused.format` for any refused cover. `OBSCURED_LABEL` is for a marked copy only; otherwise null.
  - `marks` are passed with their withdrawals.
  - New export `PHOTO_UNCHECKED_WORDS`. `PHOTO_NOT_COVERABLE_WORDS` is now `photo.refused.format`.
  - "Never blocks signing" is reversed.

**Deferred.** None.

**Found in other modules** (also in REPORT J1):
1. **case-authoring** (merges after me in L8). 4 tests are red against this change and green on `tranche/T38`, each pinning K2206's behaviour that R6, R22 and R29 now reverse:
   - R29 (two tests): the C-120 row lists up to .18;
   - R14: an unchecked or nothing-to-obscure photo travels whole;
   - R34: an unchecked photo is never among blockers.

   Its T38 R34 amendment covers them.
2. **answer-envelope** (L11). One new red, `families.test.mjs`'s C-120 test: it pins C-120.1–.18's words and needs C-120.17's new words and C-120.19. Its other three reds are on `tranche/T38` too (accepted reds 11 and 13).
3. **plane**: two reds in `stats.test.mjs`, and `test/system/migrate-released.test.mjs` red. All are accepted red 11, not from this change.
4. **Row census** (`test/system/row-census.test.mjs`) names C-120.17 changed and C-120.19 arrived "with no record". This falls under accepted red 6.2: T38's L3–L11 rows stay awaiting until T39. This record names both rows as awaiting stamp.
5. **`dist/` bundles and `case-checker/program.mjs`**: staled as accepted red 8.

**Tests and checks.**
- `node --test bio-plane/test/m/case-disclosures/`: pass 70, fail 0.
- No layer tests are named (manifest).
- Users:

  | Tests | Pass | Fail | Cause |
  |---|---|---|---|
  | case-authoring | 159 | 4 | above |
  | answer-envelope | 24 | 4 | 3 pre-existing |
  | plane | 144 | 2 | accepted red 11 |

- Baseline on `tranche/T38`:

  | Tests | Pass | Fail |
  |---|---|---|
  | case-authoring | 163 | 0 |
  | answer-envelope | 25 | 3 |

- Checks:
  - `format`: 137 modules, 136 requirements files; 0 failures.
  - `architecture`: 15 product files, 90 relative imports; 0 failures.
  - `coverage`: 29 of 29 live requirement ids named by a test; 0 failures.
  - `ownership`: 6 files changed; 0 failures.

Size (session_016Wyn6CMpXu3twcahXtRYbM): test runs 12, module lines 1972

## J1 · REPORT

Other modules, from T38-12 (details in my record, Found in other modules): (1) case-authoring: 4 tests red against this change, green on tranche/T38. They pin K2206's behaviour, which R6, R22 and R29 now reverse: R29 (x2) pins the C-120 row lists to .18; R14 has an unchecked or nothing-to-obscure photo travel whole; R34 has an unchecked photo never blocking. Its T38 R34 amendment covers them. (2) answer-envelope families.test.mjs C-120 test (N529): new red; it pins C-120.1–.18 words and needs C-120.17's new words (photo.refused.format) and C-120.19 PHOTO_UNCHECKED. (3) Row census: C-120.17 changed, C-120.19 arrived; red 6.2; my record names both 'awaiting stamp'. (4) dist bundles and case-checker stale (red 8). Reading: refusals carry `photo` (the refs filling {photo}); translations stay the verbatim template.

## J2 · COMPLETE

T38-12 applied: R6 (a photo never whole; PHOTO_UNCHECKED; NOT_COVERABLE marked or not; label only when marked; withdrawn marks counted), R22 (C-120.19 PHOTO_UNCHECKED, C-120.17 re-worded, both from words.json by key), R29 (words, marks with withdrawals). case-disclosures 70/70; format, architecture, coverage, ownership 0 failures. Record pushed on job/T38/case-disclosures.

## B2 · CHANGE (case-carriage merged, K2311)

- Merged `tranche/T38` into this branch.
- Added one test arm in `photos.test.mjs` that runs over the real case-carriage (`world({ realCarriage: true })`), with no stand-in for its R10–R14. The fixture supplies an evidence store and a bucket stand-in and a scripted `coverAreas`.
- The arm walks one photo through:
  - unchecked: `PHOTO_UNCHECKED`;
  - `obscureMark` with an area: carried as its copy, labelled;
  - `obscureMarkWithdraw` of that only mark: unchecked again, the withdrawal shown in R29's marks;
  - `obscureMark` with no areas: copy, label null.
- On a second photo, a refused cover on a nothing-to-obscure mark is `PHOTO_NOT_COVERABLE`.
- A document that is no image still travels whole.
- Nothing moved in the code. R10's real answers fit `photoRead` as written.

**Tests and checks.**
- `node --test bio-plane/test/m/case-disclosures/`: pass 71, fail 0.
- `format`: 0 failures.
- `architecture`: 91 relative imports; 0 failures.
- `coverage`: 29 of 29; 0 failures.
- `ownership`: 7 files; 0 failures.

Size (session_016Wyn6CMpXu3twcahXtRYbM): test runs 15, module lines 1972

## J3 · COMPLETE

B2 done: tranche/T38 (case-carriage merged) merged into job/T38/case-disclosures. A new photos.test arm runs R6/R29 over the real case-carriage R10–R14 (mark, withdraw, nothing-to-obscure, refused cover; no stand-in). Nothing moved in the code. case-disclosures 71/71; format, architecture, coverage, ownership 0 failures. Record updated.
