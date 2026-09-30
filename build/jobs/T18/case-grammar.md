# case-grammar (T18)

**Status** · session_01FvS5vYSk4ExST6yH9bgCDD · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entries applied** (`current.md` layer 8, case-grammar; merge early, rule (10)). Code at `job/T18/case-grammar`.
- The split by copy (K651, K624 (1)): `bio-plane/src/case-grammar/formats.mjs` (the format block, `publication/checks.mjs` 14–48), `blocks.mjs` and `tensions.mjs` (copied whole, their one import re-pointed from `./checks.mjs` to `./formats.mjs`), and `index.mjs` (`SECTIONS`, `REAUTHORABLE_SECTIONS`, `signedCitations`, `ATTRIBUTION_LEVELS`, `ATTRIBUTION_PROSE_HEAD`, `attributionFrontmatterLines`, `attributionBodyLines`, `publishedGraphEdges`, from `publication/index.mjs` 188–320), re-exporting every name of the other three. Nothing written in `publication`'s paths; no `from`, so nothing deleted.
- Services ready for publication: import from `src/case-grammar/index.mjs`. Every name `publication/index.mjs` re-exports today from `checks.mjs`, `blocks.mjs` and `tensions.mjs` is exported here, plus `sourceRowsStanding`, `disclosedCandidates`, `fmSafe`, `SECTIONS` (R3's locators, which `reauthorSection` needs), `signedCitations` (R4, private in publication today) and `CITATIONS_UNDETERMINED_SENTENCE` (R4's sentence, byte-identical to publication's).
- Improvements in my own copy (same answer for every input publication's copy answered without throwing): R2's renderers take a non-array as no rows, R3's locators answer null for anything that is not an array of lines, and `signedCitations` and `publishedGraphEdges` answer undetermined and `[]` where a hostile value would have thrown. That is what "never throw" asks. `fmSafe` is now spelled once, in `blocks.mjs` (it was `oneLine` there and `fmSafe` in index).
- No catalogue row moved or changed, so nothing is `awaiting stamp`. No `not yet met` mark.

**Found in other modules (REPORT, for publication's job and later):**
- publication: its deletion must re-point `reauthorSection` to this module's `SECTIONS` and its case-document reads to `signedCitations`. Neither is exported there today. `test/ratify-authority.test.mjs` §8's structural arm counts `export function publishedGraphEdges(` in `src/publication/index.mjs` only. Once publication re-exports, that count is 0 and the arm (a legacy suite, K653) needs re-anchoring to `src/case-grammar/index.mjs`.
- case-authoring: `#reauthorAcknowledgements` (`src/case-authoring/index.mjs` ~1784–1788) spells R3's acknowledgements locator a second time. A later case-authoring job can call `SECTIONS.acknowledgements`. Its `document.mjs` has its own `fmSafe` too, where R2's could be imported.
- Generated artifacts: I made none stale. No bundle takes `publication` or `case-grammar`.

**Deferred:** none.

**Tests and checks:**
- `node --test bio-plane/test/m/case-grammar/`: tests 20, pass 20, fail 0. Every one of R1–R7 is named. The R20 arms of `casedoc`, `sources` and `tensions` are copied, renamed R1, and run on bytes alone, with no world fixture. So are the attribution-renderer and `REAUTHORABLE_SECTIONS` arms (R2, R3). R4 covers `/5`, `/4`, `/3` and older. R5 covers the D-431 arms (a `relates_to` counts; a division disclosure is never `serve`). R6 and R7 cover every reader. No layer tests are named in the manifest.
- `format`: 82 modules, 0 failures. `architecture case-grammar`: 9 files, 17 imports, 0 failures. `coverage case-grammar`: 7 of 7, 0 failures. `ownership case-grammar tranche/T18`: 10 files, 0 failures.

Size (session_01FvS5vYSk4ExST6yH9bgCDD): test runs 5, module lines 446
