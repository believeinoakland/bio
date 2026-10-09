# extraction (T41)

**Status** · session_01JGmpMryVXRkDRTjTm7xrXJ · depth 2 · WORKING · handled B2

## Completion (EXTRACTION #18)

**Entry applied: T41-10** (N820, D4; K2418, K2448; answered K2461). `extraction` R42 amended, in `bio-plane/src/extractrun.mjs`:
- **Signature (for T41-24, run-productions, to code against):** `proposedReadingGrade(entry, capture = null)` and `checkProposedRef(entry, capture = null)`, both pure. `capture` is `{text, ceiling}`, read by the CALLER from the record and never taken from the proposal: `text` is the capture's extracted text at the entry's extent, and `ceiling` is the capture's own grade letter, or null (undetermined). Fields the entry itself carries (`text`, `ceiling`, `capture`) are ignored.
- **A verified quote** has three conditions: the entry has a `quote` that is a non-empty, well-formed string; its `source` can be read by `text-chain.readingSource`; and `quote` is a byte-exact substring of `capture.text`, with no folding of case, whitespace or Unicode form. `capture.ceiling` must be a grade or null.
- **What a verified quote earns:** `grade` = `capture.ceiling`. That can be weaker than B, and null stays null, explained in `why` as "earned undetermined". The answer also gives `verified_quote: true` and `check: quoteFigures(quote)`.
- **Otherwise** the answer is exactly as before: B for a kind and a key, C for a label alone, null for neither, with `verified_quote: false` and `check: []`. Today's one-argument callers are therefore unchanged.
- **`quoteFigures(quote)`** is a new export. It returns `[{kind: "date"|"number", text, at}]` in quote order: ISO, slashed and month-name dates first, then digit numbers (with currency, separators, %, ordinal or magnitude), spelled-out cardinals, and finally any digit run still unnamed. No digit goes unnamed.
- **Refusals:** `PROPOSAL_ABOVE_CEILING` refuses a grade above B unless the quote is verified, and above `capture.ceiling` when it is (still unreachable from the grader, by design). `PROPOSAL_NAMES_NOTHING`, `GRADE_OFFERED` and `PROPOSAL_POSITION` are unchanged, verified quote or not.

**Improvement in my own module:** `pdfStructure` (`index.mjs`). When an R24 listener refuses a re-read's write, the answer used to give the wrong reason ("no longer held for this caller"). It now says the write was rolled back whole. Test: `pdfstructure.test.mjs` "R34 R24: a re-read whose write a listener refuses…". It fails without the fix and passes with it, and the same re-read with the listener quiet serves as its control.

**Tests** (`rules.test.mjs`):
- "R42 R44 (T41, D4)" covers the verified quote at every ceiling (A–D and null), reached from a key and from a name alone, with the exact `check`.
- Its negative controls must keep the old B/C, unverified, with nothing named. They are: one byte changed, case folded, whitespace changed, NFD against NFC text (with its NFC twin verifying), a lone surrogate, no place, an empty quote, no record text, text that is not a string, a ceiling that is not a grade, and a proposal handing in its own text and ceiling.
- The same test also checks that a verified quote does not rescue `PROPOSAL_NAMES_NOTHING`, `GRADE_OFFERED` or `PROPOSAL_POSITION`.
- "R42 (T41, D4): quoteFigures…" checks the exact figures, and that every digit in three mixed quotes is named.

**D54:** no extraction test assumes an administrator's `FULL` sight of a hidden project. The tests' "hidden" bundles are ordinary out-of-sight ones (not a D54 hidden project), and all passed at START, so nothing was re-stated.

**Reading set (§17, K2304).** BOB's measure was 633 KB; the module's code and tests alone are 450 KB, so the set is over 300 KB and step (3) applied.
- **Read whole myself:** `build/requirements/extraction.md`, layer 4's row of `build/layers.md`, `extractrun.mjs`, `test/m/extraction/rules.test.mjs`, and the used services this change names (`text-chain.readingSource`, `record-grammar` `BASIS_GRADES`).
- **Read by a worker:** the rest of the code (`src/extraction/*.mjs`, about 150 KB) and every other test file, all in full. Its summary is about 8 KB. It cites file and line for:
  - every use of `extractrun.mjs`; in scope that is only `convert-names.test.mjs`:11–12 and :105–143, whose pins I kept;
  - where text by extent lives (`capture_text`, schema.mjs:283–294; `indexUnits` index.mjs:837–917; `unitsOf` :1043);
  - the candidates for a capture's ceiling (`EARNED_CAPTURE_CEILING`, grades.mjs:98; `gradeCeiling` and `captureBound`, textchain.mjs:1281 and :1317);
  - a responsibility map by R-id, and six flaws.
- **Whether anything it left out mattered:** nothing did. Its findings changed what I report (below) and led to the `pdfStructure` fix. Its flaw 4 (digest case) is already guarded by `pdfStructureOp` (ops.mjs:57). Its flaw 6 (a redundant `COALESCE`) is harmless and left alone.

**Reported to BOB** (REPORT J2):
1. A capture's own ceiling is never stronger than B (`EARNED_CAPTURE_CEILING = 'B'`, grades.mjs:98; `gradeCeiling` and `captureBound`). So D4 as worded never lifts a quote above B. In practice it raises a name-only verified quote from C to the capture's B, and lowers a key's B on a weaker or undetermined chain.
2. For T41-24, the caller's `text` must be the stored text containing the entry's place. `capture_text` units are coarser than proposal positions: a page, paragraph, slide or sheet range, while a proposal can name a rect, a run, a shape or a cell. Units are also capped (`truncated`), and `unitsOf` is not viewer-gated. A quote beyond the cap simply reads unverified.
3. My change stales the generated artifact `bio-plane/dist/bio-plane.bundled.mjs` (and its `.bundle.json`), which is regenerated at layer close.

**Deferred:** nothing.

**Tests and checks run:**
- `node --test test/m/extraction/`: tests 139, pass 139, fail 0 (136 at START).
- Its users' tests: `node --test test/m/run-productions/`: tests 39, pass 39, fail 0 both before and after (the only importer of `extractrun.mjs`). Layer tests: none named in the manifest.
- `format`: 145 modules, 144 requirements files; 0 failures.
- `architecture`: 28 product files, 105 relative imports; 0 failures.
- `coverage`: 46 of 46 live requirement ids named by a test; 0 failures.
- `ownership`: 5 files changed by extraction between tranche/T41 and HEAD; 0 failures.

Size (session_01JGmpMryVXRkDRTjTm7xrXJ): test runs 12, module lines 2867

## J1 · QUESTION

R42 (D4) interface, my best reading; I am building it now and will bring it in line with your answer.
`proposedReadingGrade(entry, capture?)` and `checkProposedRef(entry, capture?)` stay pure. `capture` is `{text, ceiling}`, read by the CALLER from the record, never from the proposal: `text` the capture's extracted text at the entry's extent, `ceiling` the capture's own grade letter (or null, undetermined). A quote is verified when the entry carries `quote` (a non-empty string), a position (`source`, readable by `readingSource`), and `quote` is a byte-exact substring of `capture.text` (no folding of case, whitespace or Unicode form). A verified quote earns `capture.ceiling` (so it may also be weaker than B; null stays null, stated), with `verified_quote: true` and `check: [{kind: "date"|"number", text, at}]`, every date and number in the quote read by code (digits, currency, percents, ISO/slashed/month-name dates, spelled-out cardinals). Without `capture`, or with any of those unmet, the grade is exactly as before (B/C/null, `verified_quote: false`, `check: []`), so run-productions' current call is unchanged. PROPOSAL_ABOVE_CEILING refuses a grade above B unless verified, and above `capture.ceiling` when verified. PROPOSAL_NAMES_NOTHING is unchanged (a ref with neither kind+key nor label is still refused, verified quote or not). The read of `{text, ceiling}` is the caller's (run-productions R21/R11, T41-24): this module adds no store read for it; `unitsOf` (R36) already gives the text by extent. Say if you want a store-side helper here instead.

## J2 · REPORT

Found while applying T41-10 (record, 'Reported to BOB'). (1) A capture's own ceiling is never stronger than B (record-grammar grades.mjs:98 EARNED_CAPTURE_CEILING = 'B'; textchain gradeCeiling :1281, captureBound :1317): D4's verified quote never lifts above B; in practice it lifts a name-only quote C to B and lowers a key's B on a weaker or undetermined chain. Built as R42 and K2461 say; if Bob meant a lift above B, that is a doctrine question for him. (2) For T41-24 (run-productions): capture_text units are coarser than proposal positions (page, paragraph, slide, sheet range against rect, run, shape, cell), capped per unit (truncated) and unitsOf is not viewer-gated; the caller hands {text, ceiling} for the unit containing the place, gated, and a quote beyond the cap reads unverified. (3) Stale generated artifact: bio-plane/dist/bio-plane.bundled.mjs (+ .bundle.json) from extractrun.mjs and extraction/index.mjs; for layer close.
