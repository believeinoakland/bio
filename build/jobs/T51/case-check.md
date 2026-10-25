# case-check (T51)

**Status** · session_016ctg5nhcTUAhdWo4A3CTkV · depth 2 · WORKING · handled B0

## J1 · COMPLETE

Completion of T51-265 (words, plain findings K3957), commit 2c99dce35d on job/T51/case-check (merged tranche/T51 first; no file of this module changed by the merge).

**Entries applied.** T51-265: both plain findings in `bio-plane/src/case-check/index.mjs` are judged as sentences a member reads (refusal `detail`, shown to the member) and converted through `localize`:
- line 123 → `case-check.index.the_pre_flight_gave_no_answer`
- line 146 → `case-check.index.the_preparation_was_not_found_where_publication_stores_it`
No test copies either sentence (grep of the test tree: none), so no test change was needed. No REPORT is owed: nothing unjudged, nothing left to the design's `unkeyed` list.

**Deferred.** None.

**Found in another module.** None. (`case-authoring` index.mjs:1653 holds a similar sentence; it is listed in that module's own words-pass file, so it belongs to that job.)

**Tests and checks.**
- `node --test test/m/case-check/*.test.mjs` (bio-plane): 34 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio case-check`: 0 failures.
- `checks/coverage.mjs /home/user/bio case-check`: 5 of 5 live ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio case-check tranche/T51 job/T51/case-check`: 0 failures.
- `checks/run.mjs /home/user/bio`: exits 1 on other modules' findings (words 2263 failures across modules; coverage 25 failures, e.g. case-checker R27). None names case-check. Not this job's to fix.
- `bio-plane/src/setup-words/build.mjs --check`: the stale-rows note for the new word `case-check.index.the_pre_flight_gave_no_answer` is expected (rows regenerate at the layer close); no refusal names case-check.
- Layer tests: `build/manifest.md` names none for layer 8.

Size (session_01J2t3i3VhkxqkCZisrCcbZ6): test runs 1, module lines 423
