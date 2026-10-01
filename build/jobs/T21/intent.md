# intent (T21)

**Status** · session_01Ld95mtgmHB7ZNFnrh5y7Nt · depth 2 · COMPLETE · handled B0

## J1 · REPORT

Found while applying B1. I edited none of these files.

1. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`). The bundle carries `src/intent/grammar.mjs` and `src/intent/index.mjs`, and this job changed both (the ids, a comment). Regenerate them at layer close. No other generated artifact takes intent's files.
2. **Whole `test/m`:** nothing new is red. I ran my branch and `origin/tranche/T21` side by side. Every failure on my branch also fails on the baseline: 41 failures, filings' R6/R7/R16/R22/R25 and the R43/R22 decoration test among them. Those belong to other modules and are not caused by intent. The baseline also fails the accepted R29 red (K939), and this job fixes it.
