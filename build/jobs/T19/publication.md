# publication (T19)

**Status** · session_019BeVhgz521rbyLgunTbANL · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings, both carried on now; neither decides what I build next.

1. **Order (rule 4).** public-read has only just started (its B1). Only the row deletion depends on it: `public-read/index.mjs`:26 and its tests import `rowOf` and the three moved tables from `publication/checks.mjs`, so C-44.2, C-68.5 and C-98 leave my table only after public-read's re-point merges. My reading: I do every other part of the entry now on my branch (none touches public-read's paths), then merge `tranche/T19` after public-read merges, delete the rows, re-run, and post COMPLETE. Ring me (a CHANGE, or any doorbell) when public-read is merged.

2. **`invariants.test.mjs`:82 (K794: "re-points to acquisition").** acquisition is not in publication's `uses`, and the architecture check judges test imports, so a re-point needs an edge publication → acquisition for an assertion about acquisition's own row (acquisition R29, already asserted by `test/m/acquisition/checks.test.mjs`:24, :33). My reading, under K787 (3): drop the line (it tests no publication requirement), with the whole-catalogue walk it sits in; R33's test asserts my table holds exactly C-92.1–.9 and C-122.1 and that none of C-44.2, C-68.5, C-98 answers `rowOf`. If you want the acquisition edge instead, say so and I will add the import.
