# Independent review of `draft-G56-plan.md` (G56, reading-pipeline)

Checked against `bio-plane/src/reading-pipeline/index.mjs`, `bio-plane/src/pdfstructure.mjs` (`extractPdfRange`), `pdf-pieces.test.mjs`, `pdf-ranges.test.mjs`, `build/requirements/reading-pipeline.md` R40, K4693 (rulings.md:4688) and section 0 of `fix-round-6-T51.md` (lines 5-12). I ran nothing; I re-read the code only.

K4693, whole: "G56, reading-pipeline's page-range piece sized by measure so every tick keeps the bar with margin (target 8 s), the bar kept (K4670)".

Confirmed and not defects:
- The cause and its lines are right: `PDF_RANGE_PAGES = 200` at :1239, `pieceAsk.rangePages` at :2023, `extractPdfRange(bytes, {from, count: pieceAsk.rangePages})` at :2137, the budget acting after the parse in `rangePieceAnswer` :1520-1531 (called at :2235).
- R-OLD cursor compatibility holds. `rangeCursorIn` :1509-1516 reads `{v:1, s, k:"p", n, i}`, where `i` is the next page. Nothing in the cursor carries the piece size.
- The last piece's `piece.pages` is `[400, 500]` for 450 pages, because `next = from + count` where `count` is the pages built. `next - from <= 100` still holds.
- No retry cap exists. `pending.mjs:112,121` resets attempts to 0 on progress, so 14 ticks instead of 7 are safe.

## DEFECTS

1. **A fixed page count does not meet "every tick keeps the bar" for heavier pages, and the draft's reason for refusing a byte bound is wrong.**
   - Evidence: the draft's cost model "about 3 s + 0.04 s a page" (entry (1)) and its whole table come from one file, a text volume of 11.8 KiB a page (15.2 MiB over 1,354 pages). `extractPdfRange` (`pdfstructure.mjs:4419-4476`) does, for each of the `count` pages: `extractPageText`, then `pdfPageImages`, which calls `decodeContentStreams` and tokenizes the content (:2945-2960), and then `tier2Escalate` on the range in `index.mjs` ~:2155. Cost per page depends on content-stream and font weight, which no 100 bounds.
   - The 23.2 MB PDF of the re-walk, the 0111 volume (15.9 MB) and scanned or image-heavy volumes are all unmeasured at 100. The draft's own text says "a page-dense volume is held by the 512 KiB units budget after the parse", and that budget cannot shorten the parse (entry (1) says so). Its claim "a byte or heap budget needs the range's cost before it is parsed, which nothing offers" is false. `bytes.length` is in hand. The page total `n` is in the cursor from tick 2 (`ranged.n`, :1515), and on tick 1 `loadPdf` yields `doc.pageCount` before `count` is clamped (`pdfstructure.mjs:4425-4429`). So a bytes-per-page density is known before any page is parsed.
   - Deferring it ("only if its own measure shows a 100-page range over the bar, and asks BOB first") leaves K4693's "every tick" unmet by construction. The job's only L (`g26.probe.mjs`) is the same text volume, so it cannot find the heavier case.
   - Fix to the plan text:
     - Replace "Pages, not bytes ... asks BOB first" with a bounded addition in the job. A range is `min(PDF_RANGE_PAGES, max(1, floor(PDF_RANGE_BYTES / (bytes.length / n))))`. The anchor is the measure: 100 pages of BUDGET-2024-APP is about 1.2 MB of file bytes and ran 6.4-7.5 s, so `PDF_RANGE_BYTES` of about 1.2 MB, to be confirmed by the job's measure.
     - Name the owner. On tick 1 `n` is only known inside `extractPdfRange`, so either pdf-reader gains an optional `{maxBytes}` that clamps `count` after `loadPdf` (a provider change under R-SEAM, to be declared in the START with a pdf-reader job), or reading-pipeline bounds ticks 2 and later from the cursor's `n` and clamps tick 1 only through pdf-reader. Choose one and write it.
     - Note that file bytes over-count a scan, whose image bytes are not inflated by the walk. The bound can therefore only shrink a range, never widen it past 100, with a floor of a few pages so the cursor always moves. The job must measure one scan-shaped synth (bigpdf with large image streams) and one content-heavy synth at the bound and report the first tick.
     - Add a test at `read`'s interface: a synth of 450 pages with about 6x the bytes a page (same page count) must give `piece.pages` spans of at most `floor(PDF_RANGE_BYTES / bytes per page)`. This asserts bytes and pages, not time (R-CLOCK).
     - Add the bound to the requirement line and to the census (it changes no key of `read`).

2. **Entry (2) states something false about the suite: "no test in the normal suite measures a tick's wall time: only `g26.probe.mjs` does".**
   - Evidence: `pdf-pieces.test.mjs:59` asserts `Math.max(...r.ms) < 10_000` in a node child (the file header says R-CLOCK is respected because node's clock is real), and :58 asserts the parse ratio. The same file is the draft's source for the 1.5 bar.
   - The gap actually missed is that this test runs without the plane's 87.6 MB idle heap (the draft's own finding), so its piece times (3.8 s for 200 pages) cannot see the plane's collector cost.
   - Fix: reword (2) to "the node-child test measures wall time but not the plane's live heap; only the harness does". State that the new interface test pins the work done (pages, bytes), and that `g26.probe.mjs` stays the only time proof.

3. **The 1.75 bar at `pdf-pieces.test.mjs:58` is partly justified and partly hides a regression; the text should not call it "a machine's, not the size's".**
   - Evidence: the draft's own numbers are 1.53 at 200, 1.57 at 100 and 1.63 at 75, so the size does move the ratio (+0.04 per halving), and at the new size the planner's machine reads 1.57. G37's own record (the comment at :1233-1238) had 1.40-1.51 at 100 on its machine, so 1.5 was already marginal at 100 and the bar is a stability bar, not a margin bar. A bar at 1.75 allows 11% over the measured 1.57 (and 0.22 over G37's 1.51 run) before it can fail. A regression that doubles the per-piece fixed cost would pass.
   - The test does not bind anything to the size now chosen. The 1.5 "bar kept" of K4670 is the 10 s bar, not this ratio, so changing the ratio is a detail ruling, but the plan must say it is a loosening and by how much.
   - Fix to plan text: (a) restate as "1.7, the measured 1.57 plus the 0.1-0.15 run-to-run spread seen on G37's runs", or keep 1.75 but say plainly "a loosening of 0.25 over the base because the ratio rises with piece count"; (b) add that the binding assertions are the 10 s piece bar and `distinctPages === units`, which are not changed; (c) require the job to record all three of its own runs of the ratio in the comment, not the planner's.

4. **Requirement ids to amend are incomplete: the draft names only R40/R41 and a line "at most `PDF_RANGE_PAGES` = 100".**
   - Evidence: `requirements/reading-pipeline.md:108` (R40) holds three sentences that go stale: `PDF_RANGE_PAGES (200, measured at the plane's shape: the first piece 8.2 s; K4620)`, `the pieces under 1.5 parses of the whole` in the G26 clause, and the same in its `Test:` line (the volume test). R41 does not mention ranges, so it needs no change.
   - Fix to plan text: say "R40 only (R41 unchanged); amend the value 200 to 100 and its measure (first piece 6.4-7.5 s at the plane's shape), the 1.5 parses to the new ratio (defect 3), and add the byte bound of defect 1". Add that BOB writes it (the job proposes). Also add that `build/jobs/T51/reading-pipeline.md`'s earlier "200" lines are history and stay.

5. **The failing-first test pins a constant rather than the cause, and parts of it cannot be red.**
   - Evidence, entry (3): only "`PDF_RANGE_PAGES` is at most 100" and "pieces at least `ceil(450/100)`" are red today. "`next - from` at most `PDF_RANGE_PAGES`" is true by construction for any constant (it is `rangePages`), and (c) "a caller's rangePages wins" already passes today (`pdf-ranges.test.mjs:47-71` uses it). That is fine for controls, but the plan calls all of (a)-(c) failing-first.
   - Good points: it goes through `read` with `pieces` and no `rangePages` (the plane's way), and asserts pages not time (R-CLOCK met).
   - Fix: mark which assertions are red on the base (the `<= 100` and the piece count) and which are controls. Replace the literal `<= 100` with the derived invariant once defect 1's byte bound exists: a heavier synth (same page count, more bytes a page) must give smaller `piece.pages` spans than the light one. That is the case that fails today for the stated reason (the range is chosen from a page count alone) and is not a number copied from one table.

6. **The choice of 100 is not supported by the table as worded ("the largest size that keeps the first tick at most 8 s with the spread inside it").**
   - Evidence: the table has 125 at 7,339 ms (one run) against 100 at 7,518 / 6,392 ms (two runs), so the table is not monotone and 125 is not shown to fail 8 s. The linear model in entry (1) (3 s + 0.04 s a page) gives 7.0 s at 100 and 8.0 s at 125. J37's machine was 6% slower (11.7 s against 11.0 s), so 7.5 s measured here is 8.0 s there, with no margin to the 8 s target, and the harness is node, not workerd.
   - Fix: say "100 on the model (7.0 s) and the runs (6.4-7.5 s); 125 is at the edge of the target on J37's scale; 100 is the round value that holds 8 s on both machines". Remove "largest". State the margin to the 10 s bar (2.5 s).

7. **The platform check L is incomplete for the claims made.**
   - Evidence: the draft proves only `g26.probe.mjs` (one file, one text density). The set that exercises other piece shapes (`g13`, `g15`, `keep40`, `fault`) is named in K4693 ("re-run G26 and its shape set") but the plan writes only "a CHANGE to its job" without the text of that change.
   - Fix: give the exact text for BOB to post to PLANE #52: re-run `g26.probe.mjs` plus the shape set, assert slowest tick at most 10 s with the first tick target at most 8 s, ticks 14 or more, `units === 1354`, state `whole`; and add one heavy-page PDF to the harness (see Gaps) if the byte bound lands.

8. **P is not testable as written.** "the 23.2 MB PDF (and 0111) read whole with no stall ... `last_ms` of every tick under the bar" has no pass number for a first tick, no named place in the re-walk checklist, and the draft says the 23.2 MB PDF "is the P check below" because it is not in the fixture cache. Fix: state P as: for each of the two files, every `last_ms` under 10 s and the first at most 8 s, `reading` row ended, no `interrupted`, `text_units` holding the last page's words (R-STOP, which the draft does have), and say that the figures are recorded in the re-walk 6 sheet, and that a first tick between 8 s and 10 s is reported to BOB, not sized down by the job.

## GAPS

- **No heavy-page measure exists anywhere in the plan**, in the harness or the job (defect 1). Neither the 23.2 MB PDF nor the 60-page scan is available for L; `r37.test.mjs` (60 pages, 24 a call) is under the 100-page range and so proves nothing about the size. The job should build one synthetic heavy PDF (`bigpdf.mjs`, with more bytes a page) and run it through the harness shape once.
- **Tier 2 to 4 cost per range is unmeasured.** `tier2Escalate` and OCR run on the range's pages inside the tick (:2155+, `ocrInvocations` 24 a request). The draft's table is a text-layer volume with no OCR, so the OCR share of a scan range (bounded by 24 calls, but the cursor then moves back) is not in any number.
- **In-flight readings (R-OLD):** the draft says "new reads only" but does not say that a stored first-piece reading keeps `provenance.text_scope = {pages:[0,200]}` (index.mjs:2320-2321) while its later pieces run at 100. Add one sentence so the job does not "repair" it. The R-OLD test (first piece cut at 200, rest at default) is sound.
- **Unit counts:** the draft quotes 14 pieces for 1,354 pages. With the byte bound this can rise, and the plan must not hold the count as a control.
- The one-off `make-g56-answers.mjs` with `fixtures/g56-answers.json` is sound for R-OLD and byte-identity, but its 450-page synth (30 lines a page) is light; add the heavy synth to it so the bound's output is also checked against the unbounded run (units identical).
- Section 0 R-FOUR (3) asks for a test "on the walker's exact case through the real entry path"; the walker's case is the 15.2 MiB volume, which is in the harness, not the suite. The plan says so (red by name until PLANE #52), which is acceptable, but should cite that this is R-SEAM's "stays red by name" provision.

## VERDICT

8 defects: the fixed 100-page piece meets the bar for G26's text density only, so the plan needs a bounded byte/density addition plus correct requirement, test and bar wording before it is ready for BOB.
