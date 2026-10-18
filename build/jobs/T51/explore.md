# explore (T51)

**Status** · session_0116nsZX4FFi5h4wdkKtE4rd · depth 2 · COMPLETE · handled B1

## Completion (EXPLORE #6)

**Entries applied.** T51-39 / R26: every hop an answer lists carries `from_label` and `to_label` (the canonical label of the registered entity for an `ENT-` end through `entities.labelsOf`, R56; `null` for an unnamed entity, an event or any non-entity end; never the id). Applies to `explore` paths (R3), the presets (R10, being the same walk), `overlaps`' hops, and `exploregraph`'s steps (R21). New `labels.mjs` reads the distinct ends once per answer in reads of at most 500; `graph.mjs` now reads nodes and step ends in one pass (R25's node labels unchanged). A hop the viewer cannot see is never listed, so it names nothing (R7). Answers data only (K3665).

**Not done / deferred.** `exploreverify`'s `rests_on[].connection` and chain hops are not named: R26 lists paths, presets and graph steps only. If BOB wants them named, it is a requirement change.

**Found elsewhere.** `ai-use` tests (6 R13 tests, `words.json` fixture comparisons) fail in this checkout: not explore's, not touched by this job.

**Environment.** The wall-clock M-X1a tests (`mx1a.test.mjs`, `mx1a-events.test.mjs`: 4,000-vote walks within the 10,000 ms budget) fail on this container with or without my change (baseline measured with the change stashed: 13,753 ms and 19,973 ms elapsed; with it 10,098 ms). Not recorded as an R20 re-measure; the K1726 comparison needs a faster desk.

**Tests and checks.** `hop-names.test.mjs` (4 tests, R26; all pass); `walk.test.mjs` R3 test now strips the two labels before comparing to the owner's hop. All non-M-X1a explore tests: 49 pass (after that fix, 0 fail). hypotheses, plane t33: pass. Checks: format 0 failures; architecture explore 0 failures; coverage 26 of 26 ids named; ownership 0 failures.

Size (session_0116nsZX4FFi5h4wdkKtE4rd): test runs 14, module lines 1081

## J1 · COMPLETE

R26 met: from_label/to_label on every hop of explore paths, presets, overlaps and exploregraph steps. Checks clean (format, architecture, coverage 26/26, ownership). Open: M-X1a wall-clock tests fail on this container with or without my change; ai-use R13 words tests fail (not mine). Details in my record.
