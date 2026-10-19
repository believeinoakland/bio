# run-productions (T51)

**Status** · session_01W8n89yfSFWhfBxwhhKKJLr · depth 2 · WORKING · handled B0

## J1 · REPORT

Found outside run-productions, not changed by this job (for BOB to route to the owning modules):

- The repository-wide `checks/run.mjs` words arm reports 3361 failures in other modules (inline 2455, plain 844, testcopy 734, handlist 172, unkeyed 2062 not counted), and the coverage arm 28 failures, all outside run-productions. run-productions' own words and coverage arms are clean (below).
- `bio-plane/src/setup-words/build.mjs --check` reports rows.mjs stale. That is the expected stale-rows note: the new ids `run-productions.index.*` are not yet in rows.mjs, which BOB regenerates at the layer close. No refusal names run-productions.
