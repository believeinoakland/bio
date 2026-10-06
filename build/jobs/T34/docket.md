# docket (T34)

**Status** · session_011xvZrjC2VEHSEoquWKsvpe · depth 2 · WORKING · handled B1

## Completion

**Entries applied.**
- T34-45 (N595; K1632, K1635): docket's R26 source already took the `viewer` (failing closed without one) and answered `truncated`; with events passing the reader's `viewer` (events R30, T34-17) the lane now shows a member's cases. No code change was needed in the source. New `test/m/docket/lane.test.mjs` proves it through the real `events.timeline` (R26): the lane carries exactly the source's items for a viewer who sees the project in full, a joined non-owner included; a reader who does not see the project, and a timeline naming no viewer, get an empty lane; a member of another project sees only that project's entries; the source's own `truncated` is carried at events' limit, with a negative control.
- T34-87 (DEC-149's rows; K1811): C-129.16 `DOCKET_NO_GROUP_SLUG` and C-129.22 `DOCKET_STALE` now say "Your group's Civicsmith …" in place of "This copy …" (`checks.mjs`; the header comment notes it). Reading the module whole found no other member-facing string of that kind. New `test/m/docket/words.test.mjs` drives each refusal and checks the translation whole, plus a sweep over every row and outward sentence; 0 of 3 pass on the old wording, 3 of 3 on the new. No requirement changed.

**Deferred.** None.

**Found in other modules / named reds.**
- `promotion` row census (`test/system/row-census.test.mjs`): C-129.16 and C-129.22 now read "changed with no record", joining the rows awaiting T35's stamp (plan Rules 5 (4)); the census was already red before this change with other layers' rows. `CATALOG_VERSION` moves at that stamp (promotion's, P7).
- `monitoring` `test/m/monitoring/cadence.test.mjs`:298 (R18) fails with and without this change (114 pass, 1 fail both ways); not docket's.
- Generated artifacts made stale (mechanics §14): the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) carries the old wording of the two rows; BOB regenerates at the layer close.

**Ran.** `node --test test/m/docket/`: tests 59, pass 59, fail 0. Users (wording only, run anyway): public-read 123/123, network-notices 68/68, queue 124/124, affordances catalogue 50/50, control-plane families 10/10, monitoring 114 pass 1 fail (as above). No layer tests are named in `build/manifest.md`. Checks: format "127 modules, 126 requirements files; 0 failures"; architecture "10 product files, 52 relative imports …; 0 failures"; coverage "26 of 26 live requirement ids named by a test; 0 failures"; ownership "4 files changed by docket between tranche/T34 and HEAD; 0 failures".

Size (session_011xvZrjC2VEHSEoquWKsvpe): test runs 9, module lines 1483
