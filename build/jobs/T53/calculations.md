# calculations (T53)

**Status** · session_018BhceeSbhNof9BnUV5osj4 · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# calculations · T53 · report

**T53-170 (R-65, BLOCKS; R53).** Cause found: the door stamps a selection's owner with the session's identity (`select`'s `owner`, `store-request` `owner: I`), while `calculationcreate` and `calculationevaluate` carry only the session's viewer, and `calculations` asked `retrieval.selectionResolve` with the viewer as owner. Applied here: `create` and `evaluate` take `owner`; the ops map reads it from the door's address stamp (never the body, which `strip` now also drops); the selection resolves as that owner (viewer when none is stamped, so R52's tests stand). New test `r53-own-selection.test.mjs`: the maker's count is made, read and evaluated; another member with the maker's handle is still `SELECTION_NOT_YOURS`; a body-named owner is not taken. The requirements file is BOB's, so R53 is not amended here: BOB adds to R53 that the door stamps the selection's owner as the session's identity and that `calculationcreate` and `calculationevaluate` read that stamp.

**Not done: the door half, which is `op-declarations`'.** Its `calculations` family (`bio-plane/src/op-declarations/index.mjs`, `extra: { spotcheckvisit: ["by"] }`) must become `extra: { spotcheckvisit: ["by"], calculationcreate: ["owner"], calculationevaluate: ["owner"] }` so the door stamps `owner` on both ops. Until that lands R-65 is unfixed in the app, so R53 is not claimed met.

**T53-171 (K5565).** All 15 testenglish sites converted: 10 prose assertions now read the word (`word(key, vars)`, or `localize` for one), 3 SQL-text regexes became string checks, 2 refusal-tail regexes became `typeof detail === "string"` (nothing-written is asserted by the snapshot or count beside them), one redundant assertion removed. One B site got its key in the module: the pattern gate's reason is now `localize("calculations.index.this_patterns_false_alarm_rate", …)`. The words check reads 0 failures, testenglish 0; the module suite is 165 of 165.

**For BOB (files outside this module's ownership):** `build/tests-english-baseline.json` should drop its 8 `bio-plane/test/m/calculations/` entries (the module now has 0 testenglish sites, so the file's check passes either way); `build/requirements/calculations.md` R53 as above.

**Found in other modules / stale artifacts (not edited):** `op-declarations` as above. `bio-plane/src/setup-words/rows.mjs` is stale for the one new `localize` key until its regenerate runs; the bundles under `dist` are stale for the `calculations` change.

**Met** · none

Tests: 165/165. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhceeSbhNof9BnUV5osj4): test runs 1, module lines 4288
