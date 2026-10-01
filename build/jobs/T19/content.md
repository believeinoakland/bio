# content (T19)

**Status** · session_018xyRdoKhudz527RSyBF7oX · depth 2 · COMPLETE · handled B1

## Completion (CONTENT #7)

**Entries applied** (`build/plan/current.md` L4 content, kept; `draft-T19.md` L4; B1):
- **R48, the core:** the catalogue's C-45 rows and extent core are copied into `src/content/extent-core.mjs`, line for line from `bio-checks.mjs` with its quoting kept: `CONTENT_EXTENT_KIND_NO_PRODUCER`, `legExtent`, `legHasAuthoredExtent`, `CONTENT_ID_RE`, `CONTENT_EXTENT_DOCUMENT_ONLY`, `extentRelation`, `checkContentExtent` with its private cover predicates, and `imagePartUndetermined`. The rows (`CONTENT_EXTENT_CHECKS`) are in `checks.mjs`. Only the imports, the header, the `refusal` helper's one table and three comments about the catalogue's own file changed. `extent.mjs` stays the one public face, and its additions (envelope, C-45.13, the MediaBox bound) are unchanged.
- **R48, the algebra:** `CONTENT_EXTENT_KINDS`' eight, `CONTENT_EXTENT_A1_RE`, `canonicalExtent`, `describeExtent`, `contentCitedAs`, `rangeCorners` and `a1ToRowCol` are read from text-chain.
- **Rule 1:**
  - `extent.mjs` gets the core from `./extent-core.mjs`, the algebra from text-chain, and `canonicalJson`/`sha256HexSync` from record-grammar `json.mjs`/`sha256.mjs`.
  - `index.mjs` reads `actors.mjs`, `types.mjs`, `labels.mjs` and `sha256.mjs` from record-grammar.
  - The tests are re-pointed: `citations.test.mjs` uses content's own `CONTENT_EXTENT_CHECKS`; `converts-extent` and `converts-reads` use record-grammar.
  - `transcribe.test.mjs`' R38 test loses its dynamic catalogue import, its `TRANSCRIBE_CHECKS` absence arm and its `VERSION_NOTICE_CHECKS` comparison.
  - The catalogue's C-80 `VERSION_NOTICE_CHECKS` and its header are deleted (27 lines, legacy-checks −27/+0). No other importer is left at HEAD except two old suites, which stay unrun until the release (K653 BOB-1). No content file, product or test, imports `bio-checks.mjs`.
- **R49:** `contentOf` registers `{check, project}` once on provenance's `onTestimony` (a provenance without the seam is left alone; a refusal throws).
  - `testimonyCheck` runs `checkContentExtent({kind: "document"}, contentContextFor(captureSha))`.
  - `testimonyProject` mints the `document` row over the path's capture, `mintedBy` the author and `at` its `recordedAt`, and answers `{content_id}`. A refused mint throws with the store's own message, naming the code.
  - Nothing runs the slot until legacy-store's step calls it, so nothing is minted twice.
- **R50:** `contentOps(content, url, body)` in `ops.mjs`, re-exported from `index.mjs`, holds the store's eight arms as they are, with its own copy of the store's `safeJson` for `textattest`'s `rect`.
- **R51:** `registerCounts("content", ["content", "contentStale"], …)`. `counts(hid)` is keyed on `bundle_id` with `COALESCE`, as the store's `nx` took them. It is synchronous and writes nothing.

**Decision (mine, within R48):** the copied C-45 rows keep their codes, numbers and translations. Each `where` is changed to name the site in this module that answers it (`src/content/extent-core.mjs checkContentExtent > is-content-extent`; C-45.5/.6 already named `index.mjs #rowFor`), following `checks.mjs`' rule that a row's `where` names this module's site. Refusals carry only `check` and `translation`, so no answer changes.

**Copied unchanged, measured** (a scratch sweep, not committed, so no test of mine imports the catalogue that inquiry-grammar empties):
- Over 2,954 extents × 8 contexts, plus every pair from the first 400 and every leg shape, the copy's `checkContentExtent`, `imagePartUndetermined`, `extentRelation`, `legExtent` and `legHasAuthoredExtent` gave the catalogue's answers in 219,071 of 219,071 comparisons. The rows' keys, checks and translations are identical too.
- The face's `canonicalExtent`, `describeExtent`, `contentCitedAs` and `contentIdFor` matched the catalogue's in 205,920 of 205,920 comparisons over the eight kinds. No content id moves.

**Rs met, with their tests (for BOB to strike):**
- R48: `seams.test.mjs`, four "R48: …" tests.
- R49: `seams.test.mjs`, two "R49: …" tests.
- R50: `seams.test.mjs`, two "R50: …" tests.
- R51: `seams.test.mjs`, "R51: …".

**Deferred:** nothing.

**Found in other modules (REPORT):**
1. **legacy-store (L10):** it will:
   - replace its eight content arms (`content`, `contentcrop`, `contentmint`, `textattest`, `attesttext`, `transcribe`, `transcriptionattest`, `transcription`) with `...contentOps(contentOf(ctx), url, body)`;
   - replace its C-45 extent check (`extentBad`) and `#testimonyWithin`'s mint with the slot's two calls once observation-log registers (L5);
   - delete `#counts`' `content` and `contentStale` lines, which the registered figures now give identically.
2. **For inquiry-grammar's deletion of the catalogue's C-45 copy (L6):** three other importers still read the catalogue's `CONTENT_EXTENT_CHECKS`. Each must re-point to content's (same rows) or to its own first:
   - `bio-plane/src/basis-versions/index.mjs`:30, which uses its `translation`;
   - `test/m/citation/invariants.test.mjs`:8;
   - `test/m/inquiry/content-legs.test.mjs`:18, already listed for `contentIdFor`.
3. **Generated artifact staled:** `bio-plane/dist/bio-plane.bundled.mjs` (inputs `src/content/*`, `checks/bio-checks.mjs`), for the layer close's regeneration.

**Tests and checks:**
- `node --test bio-plane/test/m/content/`: tests 113, pass 113, fail 0 (start: 104).
- `node --test bio-plane/test/m/` on this branch and on its base (`tranche/T19` @ c6c79e7fdc, my changes stashed): the same 254 failing tests, all in later layers' modules (ratification, bias, queue, ai-runs, queue-producers, publication, …). None is added and none is removed, and there are 9 more passing (the new tests).
- `node --test bio-plane/test/m/promotion/` after the C-80 deletion: 99 pass, 0 fail.
- `format`: 87 modules, 0 failures. `architecture content`: 22 product files, 0 failures. `coverage content`: 51 of 51 live ids. `ownership content tranche/T19`: legacy-store 0/0, legacy-checks 0 added, 27 removed, 0 failures.

Size (session_018xyRdoKhudz527RSyBF7oX): test runs 8, module lines 3457

## J1 · COMPLETE

Done; pushed to job/T19/content. Record: build/jobs/T19/content.md, Completion section. Met, with tests (seams.test.mjs): R48, R49, R50, R51, plus rule 1 (no content file imports bio-checks.mjs) and the catalogue's C-80 VERSION_NOTICE_CHECKS deleted (legacy-checks -27). The copied core matches the catalogue's answers in 219,071 of 219,071 comparisons, and the face's algebra matches in 205,920 of 205,920, so no content id moves. Content's tests are 113/113. The test/m failures are the base's 254, none added. All four checks pass. One decision: the copied C-45 rows' wheres name content's own sites. Three reports in the record: the spread of my ops map, the slot calls and the counts lines are legacy-store's (L10); for inquiry-grammar's L6 deletion, basis-versions/index.mjs:30 and citation's invariants test still read the catalogue's CONTENT_EXTENT_CHECKS; the plane bundle needs regenerating.
