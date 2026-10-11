# reading-pipeline (T42)

**Status** · session_01Tc6bhUF3M5vKa36y66nHwL · depth 2 · WORKING · handled B0

## J1 · REPORT

**Two findings in other modules (T42-9).**

1. **Stale generated artifacts (mechanics §14).** `bio-plane/dist/bio-plane.bundled.mjs`, `release/bio-plane.bundled.mjs` and `newgroup/dist/newgroup.bundled.mjs` carry reading-pipeline's `tier3SeedFrom`, `tier3Extend` and `tier4Extend`. After this job they hold the old code. They are not mine to write, so I have not rebuilt them.
2. **For `extraction` T42-10 (R71, against R30's purpose).** `tier3Extend` now keeps the seeded pages whether or not an OCR member is bound, and whether or not that member fails. To keep the AI's pages out of the next request to the AI, R71's transcribe path needs to call `tier3Extend` with `seed: tier3SeedFrom(stored, units)` **even when no OCR member is bound**. `tier4Pages` over that text then leaves out every page an earlier reading transcribed. If R71 skips tier 3 when OCR is unbound, a second `op=transcribe` would ask the AI again for pages it has already read, and charge for them again.
   - The re-read (`ocr=1`) path is unchanged for extraction: the 139 extraction tests pass.
