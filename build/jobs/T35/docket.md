# docket (T35)

**Status** · session_011Vi7vfBaCXdnheezEF7LYc · depth 2 · WORKING · handled B0

## Completion

**Entries applied.**
- T35-55 (N685; K1834, DEC-149): C-129.16 `DOCKET_NO_GROUP_SLUG` now says "Your group has no name recorded yet, and a docket entry is never anonymous. Record the group's name first. Nothing was published.", as `network-notices`' C-127.4 says it. C-129.22 `DOCKET_STALE` already had C-127.12's form ("Your group's Civicsmith holds no prepared … from you with this fingerprint, … prepared more than an hour ago. Prepare it again and sign what it shows. Nothing was published."); its added clause "or the docket has moved since" is R5's own third condition (another entry took the `seq`, or the record entry settled), so it stays, and the row is unchanged. The header comment of `checks.mjs` records both. `words.test.mjs` re-pins C-129.16 (driven to its refusal, translation checked whole) and names N685 in both rows' tests. No requirement changed.

**Deferred.** None.

**Found in other modules / named reds.**
- Row census (`test/system/row-census.test.mjs`, accepted red 2): C-129.16 is re-worded again and awaits T36's promotion stamp; the census is red with and without this change. `promotion`'s `gate.mjs` history note already lists "docket C-129.16, .22" among T35's changed rows; no edit owed there.
- control-plane `catalogue-end.test.mjs` (accepted red 19): red with and without this change, on C-29.3; it pins no docket row.
- Generated artifacts made stale (§14): the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) carries C-129.16's previous words; BOB regenerates at the layer close.

**Ran.** `node --test bio-plane/test/m/docket/`: tests 59, pass 59, fail 0. Users (wording only): public-read 131/0, network-notices 72/0; promotion `gate.test.mjs` 8/0. No layer tests named in `build/manifest.md`. Checks: format "130 modules, 129 requirements files; 0 failures"; architecture "12 product files, 55 relative imports (0 naming no tracked file, not judged); 0 failures"; coverage "26 of 26 live requirement ids named by a test; 0 failures"; ownership "3 files changed by docket between tranche/T35 and HEAD; 0 failures".

Size (session_011Vi7vfBaCXdnheezEF7LYc): test runs 9, module lines 1486
