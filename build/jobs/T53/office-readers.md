# office-readers (T53)

**Status** · session_018BhcegdvdcHawV5kVZ1wKW · depth 2 · WORKING
**Sessions** · 1

## Completion (2026-10-27)

# office-readers (T53) · report

**Entries applied**
- T53-39 · K5565 · English in tests. Census (`build/plan/beta/tests-sweep/CENSUS.md`, `CENSUS-RX.md`): 0 literal A/B files; 0 regex A/B and 3 regex C sites (3 files). Each C site was read in context; none needs a key, so none was converted:
  - `bio-plane/test/m/office-readers/builders-invariants.test.mjs:145` `/secret slide/` checks the text of a fixture the same test built (its own input data). Kept as input data.
  - `bio-plane/test/m/office-readers/r46-memory.test.mjs:100` `/cap (\d+) MB, child survived/` parses the report line the shape probe prints. It is tool output, not member-facing words. Kept.
  - `bio-plane/test/m/office-readers/fixtures.mjs:187` is a comment, not an assertion. The classifier matched it because "mismatch" contains "match". Nothing to convert.
- No code change. The words check's `testenglish` baseline (`build/tests-english-baseline.json`) has no office-readers files, and none of the three sites is counted (they are not in words.json or product source), so the baseline is unchanged.

**Not done and why**
- Nothing left for this entry.

**Found in other modules**
- None from this job's work. Possible classifier issue for BOB: `build/plan/beta/tests-sweep/classify-rx.mjs` reads regex-like text inside comments as sites (fixtures.mjs:187), which inflates the C count. Low priority; recorded here only.

**Tests**
- `proc tests --modules office-readers`: 164/164, no new red, no new NO RESULT.
- Dependencies installed first (`npm ci --ignore-scripts`) in `bio-plane/src/journey-check` and `site`, per the standing rules.

**Met** · none

Tests: 164/164. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegdvdcHawV5kVZ1wKW): test runs 1, module lines 4735

## Completion (2026-10-28)

# office-readers (T53) · CHANGE T53-510 (R37, K5624) · report

BOB's CHANGE message names T53-503; the plan's office-readers block names this entry as T53-510 (R37, K5624). This report follows the plan block.

**Entries applied**
- T53-510 · the module's tests read each figure they bound from runtime-limits, never a pinned number:
  - `fixtures.mjs`: `OVER` = `boundOf("office","streamed_text_bytes")+1`, `OVER_WHOLE` = `boundOf("office","text_bytes")+1` (were pinned 32 MiB and 20 MiB).
  - `text.test.mjs`: `BOUND` = `boundOf("office","text_bytes")`.
  - `scan-bounds.test.mjs` (R12 footnotes): asserts the bound as `boundOf("office","streamed_text_bytes")`.
  - Tied rows (`ARCHIVE_TOTAL_MAX` to `archive.unpacked_bytes`, `MEMBER_MAX` to `archive.member_bytes`) already come through `boundOf` in `src/ooxml.mjs`; their tests import those constants and were left as they are.
- Confirmed at the standard (beta) figures: a temporary local flip of the reader rows (`office.text_bytes`, `office.streamed_text_bytes`, `archive.unpacked_bytes`, `archive.member_bytes`, `xlsx.declared_text`) in `BETA_STANDARD_ROWS`, run only for measurement and reverted. The flip itself is RUNTIME-LIMITS' T53-511 and is NOT committed here.

**Measurement at standard figures** (temporary flip, after the pin conversion)
- 150 of 164 pass; 14 fail. The reader's fixtures are sized to the alpha figures (20 MiB, 32 MiB), so they are under the standard (100 MB) whole-read and streamed bounds and no longer exercise the over-bound path:
  - R35 piece tests (large-text): 64, 66, 67, 69, 71, 73, 74, 76. Their packages declare 20–32 MB of text; the standard bound is 100 MB.
  - R35 memory (68): about 30 MiB declared under a 128 MB old-space cap; at the standard figures the case needs about 100 MB.
  - R37 cellsIn over the whole-read bound (62): 20.8 MB workbook, under the 50 MB spreadsheet bound at standard.
  - R46 (106, 107): the 150,000-row workbook is read in pieces only at the alpha figure.
  - R12 (10) and R43 (129): the over-ARCHIVE_TOTAL_MAX and over-MEMBER_MAX cases build members that are only over the alpha 256 MiB total.
- Not held and not measured: a reader at 100 MB of text or 2 GiB of archive. Scaling those fixtures needs generated packages of that size under the suite's memory cap (the R35 suite already peaks at 2.6 GB heap), so the reads at the standard figure are NOT confirmed. Each failing case needs a measured peak before the figure can be called held. This is the figure I cannot yet hold with a measurement.

**Not done and why**
- Scaling the 14 over-bound fixtures to the standard figures, and measuring the reader's peak at 100 MB of text and 2 GiB of archive. Not done in this session.
- The RUNTIME-LIMITS flip (T53-511) is not mine; left for that job.

**Found in other modules**
- None.

**Tests (committed state, active figures)**
- `proc tests --modules office-readers`: 164/164, no new red.

**Met** · none

Tests: 164/164. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Heavy tests: bio-plane/test/m/office-readers/large-text.test.mjs 2663 MB
Size (session_018BhcegdvdcHawV5kVZ1wKW): test runs 2, module lines 4735

## Completion (2026-10-28)

# office-readers (T53) · CHANGE T53-537 (K5637) · report

**Entries applied**
- T53-537: the over-bound fixtures reach the over-bound path at the active figure.
  - `fixtures.mjs`: `OVER` = `boundOf("office","streamed_text_bytes")+1`, `OVER_WHOLE` = `boundOf("office","text_bytes")+1`.
  - `active.test.mjs` (R12 archive total): members at `MEMBER_MAX`, together over `ARCHIVE_TOTAL_MAX` (was pinned 200 MiB each).
  - `scan-bounds.test.mjs` (R43 member refusal): the huge member is `boundOf("archive","member_bytes")+1` (was pinned 300 MiB).
- Merged `origin/tranche/T53` (RUNTIME-LIMITS flip, K5643): `office.text_bytes` 20 MiB, `office.streamed_text_bytes` 100 MB, `archive.unpacked_bytes` and `archive.member_bytes` 2 GiB, `xlsx.declared_text` 50 MB.

**Tests**
- At the active figures (after the merge): 164/164, no new red.

**R46 shape probe (`plane/shape/g41.probe.mjs`, 150,000-row xlsx), BOB's 85 % bar**
- Not brought under 85 % by this job's code. The peak is the sheet text held whole by the plane ledger, which is plane's code and outside this module. The probe and the bar are unchanged.
- Measured peaks (each one run, `r46-sweep.mjs` in the scratchpad; the cap is the probe's `capFor`):
  - 150,000 rows, declared 33.38 MB: 166.1 MB of cap 202 MB = 82.2 % (this run); 175.3 MB = 86.8 % in the suite run. The margin is about the bar and varies between runs.
  - 120,000 rows, declared 26.57 MB: 157.9 MB of 203 = 77.8 %.
  - 100,000 rows, declared 22.03 MB: 151.8 MB of 203 = 74.8 %.
  - 80,000 rows, declared 17.61 MB: 143.6 MB of 204 = 70.4 %.
- Largest declared xlsx text I can state holds under 85 % with margin: about 26.6 MB (120,000 rows). The 150,000-row case (33.4 MB) is at the bar and fails in some runs. This is the figure for `xlsx.declared_text` if BOB sets it from this measurement. The standard figure in the table is 50 MB, so it is NOT held at the standard figure.

**Not done and why**
- Bringing the 150,000-row peak under 85 % in this module's code: the held sheet text is in plane's ledger, not in the module's reader. Not changed here.

**Found in other modules**
- The R46 peak is plane's ledger holding the sheet text whole (declared 33 MB, peak 166–175 MB at cap 202 MB). Plane's design owns it.

**Met** · none

Tests: 164/164. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegdvdcHawV5kVZ1wKW): test runs 3, module lines 4735
