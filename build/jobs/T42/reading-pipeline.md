# reading-pipeline (T42)

**Status** · session_01Tc6bhUF3M5vKa36y66nHwL · depth 2 · COMPLETE · handled B0

## J1 · REPORT

**Two findings in other modules (T42-9).**

1. **Stale generated artifacts (mechanics §14).** `bio-plane/dist/bio-plane.bundled.mjs`, `release/bio-plane.bundled.mjs` and `newgroup/dist/newgroup.bundled.mjs` carry reading-pipeline's `tier3SeedFrom`, `tier3Extend` and `tier4Extend`. After this job they hold the old code. They are not mine to write, so I have not rebuilt them.
2. **For `extraction` T42-10 (R71, against R30's purpose).** `tier3Extend` now keeps the seeded pages whether or not an OCR member is bound, and whether or not that member fails. To keep the AI's pages out of the next request to the AI, R71's transcribe path needs to call `tier3Extend` with `seed: tier3SeedFrom(stored, units)` **even when no OCR member is bound**. `tier4Pages` over that text then leaves out every page an earlier reading transcribed. If R71 skips tier 3 when OCR is unbound, a second `op=transcribe` would ask the AI again for pages it has already read, and charge for them again.
   - The re-read (`ocr=1`) path is unchanged for extraction: the 139 extraction tests pass.

## J2 · COMPLETE

**T42-9 complete** at `job/T42/reading-pipeline` (tranche/T42 @ f99cf2582f merged).

**Entries applied:**
- **(1) N835**, tests only (R29 stands). `tier4Extend` builds the paying owner from the bare member id: a stamped `member:ann` and a bare `ann` both give `member:ann`, never `member:member:ann`. `accountFor` and `useCheck` still get `member` exactly as it was handed in.
  - Tested with both spellings, including a negative control that no `member:member:` reaches the limits. Also tested that a project's owner stays `project:P1`.
- **(2) R30.** `tier3SeedFrom` now also seeds `pixels → ai_transcription` parts, each under its own chain. `tier3Extend` keeps the seeded pages in its text and chain in every case:
  - when the OCR member is asked for the rest;
  - when every wanted page was already held (before this change the text and chain were left unchanged in that case);
  - when the member answers an error or cannot be reached (before, the seed was dropped);
  - when no member is bound (before, the seed was ignored).

  The wired tier is 4 when a kept part is the AI's. `tier4Pages` over the result lists no kept page. The notes for the unseeded paths are unchanged, and a new note says when pages were kept with no member bound.
- **R30's tests** (`transcribe.test.mjs`):
  - the seed of a stored OCR+AI reading;
  - a re-read that asks the OCR member only for the unread page, never asks the AI or reads an account, and whose `readingFromWire` reading still carries page 1 at tier 4;
  - the failing, unreachable, unbound and all-kept cases;
  - negative controls: an OCR-only seed seeded as before, a chain that does not check gives no seed, and the unseeded member-less note is byte for byte the same.

**Deferred:** none.

**Found in other modules:** see J1. Three bundles are stale. Extraction R71 should call `tier3Extend` with the seed even with no OCR member bound.

**Reading set:** 484 KB at START, over 300 KB, so I read part of it myself and had a worker read the rest (K2304).
- Read whole myself: `requirements/reading-pipeline.md`; layer 4's row of `layers.md`; my plan entry; K2500, K2611, K2613; `draft-T42-transcribe.md` §0–§3; `reading-pipeline/index.mjs`; `transcribe.test.mjs`; extraction's re-read site (`extraction/index.mjs`:1320–1470); `credentials.accountFor` and `ai-use.parseOwner` (the services this entry touches).
- A worker read the rest in full: `hooks.mjs`, `readingprov.mjs`, the other 12 module test files and the four legacy-path tests, 4,235 lines and 289 KB. It wrote a summary of about 3 KB, with every statement citing file and line.

**Tests:**
- `node --test test/m/reading-pipeline/`: 104 pass, 0 fail.
- `test/m/extraction/`: 139 pass, 0 fail.
- `test/system/pdf-worker-binding.test.mjs`: 1 pass.
- `d606-perpage-ocr`: 28 passed, 0 failed.
- `tier2-wire`: 46 pass, 0 fail.
- `manifest.md` names no layer tests.

**Checks:**
- format: 147 modules, 0 failures;
- architecture: 0 failures;
- coverage: 30 of 30 live requirement ids named by a test, 0 failures;
- ownership: 0 failures.

Size (session_01Tc6bhUF3M5vKa36y66nHwL): test runs 6, module lines 1654
