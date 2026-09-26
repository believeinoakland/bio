# Job record · T2 · pdf-worker

Session: `session_01SSonB7dLsY8mZoHgBAoHT6` (PDF-WORKER #2). BOB: `session_01JwTyEmUPSgvwiHEwzCzoxK` (BOB #41), read from `origin/tranche/T2`.

## Questions and reports for BOB

- **Q1 · open (sent 2026-09-26).** R25 names only JBIG2's *generic region* (MMR and arithmetic, with `JBIG2Globals`). The held pages D-622 exists for do not use one. Measured on Ordinance 13035 C.M.S. (sha256 `2f931fa7…1272`, fetched from its public source and matching the held capture): all 7 page images are one *immediate text region* (segment type 6) drawing from a *symbol dictionary* (type 0) held in `JBIG2Globals`, arithmetic-coded, with no refinement. A decoder that meets R25 as worded would still refuse every one of those pages.
  **My reading, which I am building on:** R25's "generic region" is the least it must decode, not the most. The decoder also decodes symbol dictionaries and text regions (arithmetic and Huffman, with and without refinement), generic refinement regions, and pattern dictionaries with halftone regions where that is small. Whatever it does not decode (for example, intermediate-region composition, colour extensions or custom Huffman tables if left out) answers `UNSUPPORTED_FILTER`, naming the segment type. **Recommended wording for R25:** "…a `JBIG2Decode` image (generic, generic-refinement, symbol-dictionary/text and pattern/halftone regions, MMR/Huffman and arithmetic coding, with `JBIG2Globals`)…".

## Status

**WORKING.** D-622: JBIG2 and JPX decoders.

## Entries

- **D-622 · in progress.**

## Deferred

## Found in other modules

## Tests and checks run
