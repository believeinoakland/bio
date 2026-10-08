# file-safety (T39)

**Status** · session_01TJ4PTCM3iSyJeRYmdDY3L3 · depth 2 · WORKING · handled B1

## Progress

**Built against R62's text, before provenance merged** · `threatOf`'s source condition now calls `provenance.fetchedByThisCopy` (R62) and `source` is its answer as given; `FETCHED_VIAS`, `UNPACKED` and the old `#sourceOf` walk are deleted from `bio-plane/src/file-safety/index.mjs`. A private guard, `#fetched`, answers `{fetched: false, routes: [], archive: null}` when the call throws or answers no boolean `fetched` (fail closed, as R62 does). A new R6 test in `grade.test.mjs` proves `source` deep-equals R62's answer across every source arm (direct, web archive, capture request, knock, no receipt, archive member, nested member, knocked archive's member) and fail-closed for three unreadable answers.
- Until provenance's R62 merges, the module's tests fail (8 of 53), since the call is absent. Against a scratch stand-in of R62 written from its text and never committed: `bio-plane/test/m/file-safety/` 53/0.
- Next: when BOB says provenance has merged, merge `tranche/T39`, re-run against the merged code, run negative controls and the checks, complete.
