# progressions (T53)

**Status** · session_018BhcefkfuJhoEDmxX32LxQ · depth 2 · WORKING
**Sessions** · 1

## Completion (2026-10-28)

# T53 R1 · progressions · job report (entry T53-153, K5565: English in tests)

## Entries applied

- **T53-153 · K5565 · English in tests** — PART DONE.
  - Converted 4 of the 7 A sites (text in a `words.json` value), commit `9772ce4d`:
    - `basis.test.mjs` line 70 → `wordRx("progressions.why.time_zone_governs")`
    - `overdue.test.mjs` line 108 → `wordRx("progressions.why.time_zone_governs")`
    - `owndates.test.mjs` line 61 → `wordRx("progressions.events_holds_dated_fact")`
    - `owndates.test.mjs` line 71 → `word("progressions.event_placed_nowhere", { event_id: E1 })`
  - The progressions lines of `build/tests-english-baseline.json` could be lowered (basis and overdue removed; owndates 4 → 2), but the ownership check refuses that file in a job diff (outside the job's paths). I reverted my edit to it, so the baseline is as the tranche has it. The ratchet still passes (counts only dropped). BOB to lower those three lines at the layer close.
  - Module suite: 96 pass, 0 fail (same as baseline). Words check: 0 failures, testenglish 0.

## Not done, and why

- **A sites left (3):**
  - `feeds.test.mjs` line 131, `/predates the record/` (negative control). Its text belongs to another module's word (`case-inputs` / `review`), not to progressions' output. Asserting on another module's key would hand-list its words (K3268). Bob to decide: drop the control, or keep it against a progressions-owned key once one exists.
  - `owndates.test.mjs` line 139, `/overlaps the term's last day/`. Key `progressions.why.overlaps_term_last` has placeholders (`{own_date}`, `{value}`). I did not guess their rendered values.
  - `owndates.test.mjs` line 148, `/has no own date/`. Keys `progressions.why.document_date` / `progressions.document_date` / `progressions.why.date_came_first`, all with placeholders. Same reason.
- **B sites (2):**
  - `feeds.test.mjs` line 179, `/capture sha256/`. Its text is an inline source string at `bio-plane/src/progressions/index.mjs:1465` (`noSha(...)` detail, no key). Needs a key in the module first (a source change), per the rows file.
  - `define.test.mjs` line 214, `/^src\/progressions\/checks\.mjs notADisposition > is-disposition-word$/`. Not English: it asserts a `where` identifier path, which the classifier flags only because the path has spaces. Left as is; no conversion applies.
- **C sites (3), test input, not converted:**
  - `define.test.mjs` line 195, `/holds versions 1/`. Rendered from `localize("progressions.index.key_has_no_version_string", …)` with placeholders; the source key is not in `words.json`.
  - `overdue.test.mjs` line 101, `/2 dated facts/`.
  - `owndates.test.mjs` line 59, `/2 dated facts/`.
  - Both need a decision: keep as input data, or assert the key once the source key is in the word table.

## Model note (for Bob)

The rows file marks this job `sonnet-5-5`, because a B site needs a source key first. This session runs on `claude-haiku-5-5`. The remaining work (the three A sites, the two B sites, and the three C-site decisions) is best re-run by a `sonnet-5-5` session. The B site needs a source change, so it is outside the test-only scope this session did.

## Other modules

- Nothing outside this module changed. The `build/tests-english-baseline.json` regeneration printed other modules' lines as absent; I did not apply those, only the progressions lines.

**Met** · none

Tests: 96/96. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcefkfuJhoEDmxX32LxQ): test runs 1, module lines 2251
