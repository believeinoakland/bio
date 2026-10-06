# public-read (T34)

**Status** · session_01DA3fU4xbZtzcUJYePtzwib · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R29 / publication R70: through which service does public-read read `signed_at` and `published_at`?

R70 says publication answers them "in R53's `document` and to `public-read`", but names no list-wide read and no column under R40's read contract. `publishedCase` already calls `caseEditionState` for the answered edition, but R29 also needs both dates on each entry of its `editions` and on every case-edition row of `publishedList` (and `publishedEditions`), which today come from one SQL over `published_cases`. Reading them through R53 means one `caseEditionState` per case edition on the public index, which is the N+1 shape N598 (R64 `stampedEditions()`) removes for R28.

My best reading, which I am coding now: both dates come from `caseEditionState(case, edition).document.signed_at` / `.published_at` (R53, R70), called once per case edition listed; null where the edition has no ratified document.

Proposed (BOB's call, a publication requirement change while PUBLICATION #21 is still live): R40's read contract names the two columns where publication stores them (e.g. `case_documents.signed_at`, `published_at`, with R70's pre-T34 rule applied in the stored value or stated as "null means `ratified_at` for both"), so public-read reads them in its one SQL per list. If you rule that, I read the columns and drop the per-edition calls.

Also, for `publishedEditions(id)`: its rows are finding editions; I read R29's "for each case edition they list" there as the row's sole case edition (`case_id`/`case_edition`), dates null when the finding serves several cases (as its other case fields are, D-309), and a loose finding's row unchanged.

## J2 · COMPLETE

Branch `job/T34/public-read` @ 95e9c7d9f6, `tranche/T34` merged in (K1826's wording).

**Entries applied:**
- **T34-46, R29** (DEC-147 (5); K1790, K1826): `signed_at` and `published_at` read from `published_cases` (publication R40, R70) in the same query as each row: on `publishedCase` (its edition, and each `edition_index` entry), `publishedList`'s `cases` rows and `publishedEditions`' rows (the row's sole case edition; null when the finding serves several cases, as its other case fields; a loose finding's row unchanged, per J1 as ruled). `publishedList`'s finding rows unchanged. `publishedCase`'s loose branch answers both null, so its two branches keep one key set. No per-edition `caseEditionState` call was added. Neither date enters the case file (R23): `caseFileFacts` is unchanged. A prepared, uncommitted edition (a waiting edition's state, publication R66) has no `published_cases` row and answers exactly as one that never existed.
- **T34-46, R28 (N598, K1644):** `#withheldIndex` reads every stamp with one `publication.stampedEditions()` (R64), and only a stamped edition is opened. `stampsOf` is no longer called. If no edition has a stamp, nothing more is read.
- **T34-87, DEC-149 (K1811, K1821):** all 26 P rows now say "this group's Civicsmith": `checks.mjs` C-68.5, C-98.1, .2, .4, .5, .6, .8, .9, and C-98.10 exactly as R17 words it; `index.mjs`:262, :471, :1048; `publication/worker.mjs`:112, :346, :366–367, :544–545, :753, :832. Every number and `where` is unchanged. `container.mjs`:116 stays (addressed to the agent). The remaining "this instance" matches are comments.

**Tests:** new `dec149.test.mjs` names each changed string, whole, at its site, with a negative control. New `dates.test.mjs` covers R29 (four arms) and R28's one read (spy: exactly one `stampedEditions`, zero `stampsOf`, per read). Updated: `checks.test.mjs` (the nine new translation digests), `public-reads.test.mjs`, `convert-deliverer.test.mjs` (the container's `verify` sentence, worker.mjs's three rows), `convert-publishedcase.test.mjs` and `published.test.mjs` (the new keys, and the publication methods it reaches).

**Stand-ins until publication merges** (`fixture.mjs` `publicationT34`; each is a no-op once publication provides the real thing, K1826): the `signed_at`/`published_at` columns, filled with the commit instant by a trigger, and `stampedEditions()` built from publication's own `stampsOf`. `docket-real.test.mjs` applies the same stand-ins to docket's world. After publication's merge they can be deleted. Send a CHANGE if you want that done in this job.

**Deferred:** none.

**Found in other modules / for BOB:**
1. My code needs publication's T34 merge (R64 `stampedEditions`, R70 columns), which comes first by the merge order. Users' tests on this branch, compared with `tranche/T34` without publication: 10 failures here against 4 on the tranche (the 4 are already named: control-plane catalogue-end R43 and r53-routes R53, plane migrate R2/R10 rank, filings chronology R33). The 6 new ones all fail with `stampedEditions is not a function` or `no such column: signed_at`: filings `reads.test.mjs` R15 ×2 and R21, filings `packet.test.mjs` R11, plane `store.test.mjs` R5 ×2. They should clear once publication merges. I could not verify that here.
2. Row census (promotion `row-census.test.mjs`): C-68.5, C-98.1, C-98.2, C-98.4, C-98.5, C-98.6, C-98.8, C-98.9 and C-98.10 changed their translations: awaiting stamp (T35's promotion job, plan Rules (5) item 4). C-98.11 is still awaiting stamp as before. Control-plane `catalogue-end.test.mjs` will see the same nine digests change, inside its named R43 red (K1708; re-pinned by T34-60).
3. Requirements wording, BOB's: public-read's Uses still names `stampsOf` (its R62, for R28) and `signed_at`/`published_at` "(its R70)". They are now `stampedEditions` (R64) and the R40 columns (K1826). The header of `index.mjs` already says so.
4. Generated artifacts: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale from these source changes (regenerated at the layer close).

**Tests and checks:**
- `node --test bio-plane/test/m/public-read/`: tests 131, pass 131, fail 0.
- Users (network-notices, ratification, case-checker, filings, control-plane, plane, `migrate-released`): tests 649, pass 639, fail 10 (tranche: 649/645/4; see item 1).
- `checks/format.mjs`: 127 modules, 126 requirements files; 0 failures.
- `checks/architecture.mjs … public-read`: 39 product files, 127 relative imports; 0 failures.
- `checks/coverage.mjs … public-read`: 29 of 29 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … public-read tranche/T34`: 8 files changed; 0 failures.
- P6: 3,297 lines over `paths` (under 4,000).

Size (session_01DA3fU4xbZtzcUJYePtzwib): test runs 16, module lines 3297
