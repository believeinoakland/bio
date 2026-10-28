# explore (T53)

**Status** · session_018BhcecCDCpuTthEgNRVFXA · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# explore T53 report

**Entries applied**
- T53-162 (N1260, DEC-409..411): R30 `exploreall` (`connectionsBetween`), R31 `explorepath` (`mostDirect`), R32 `exploreshorter` (`shorterThan`), R33 `explorecontinue` (`continueWalk`, a signed token of the arguments and the nodes read, no stored state), R34 (the four ops take `budget_ms`, 1,500 by default, up to 10,000; the existing walks keep 10,000), R35 (four `DECLARED_OPS` rows). New file `bio-plane/src/explore/chains.mjs`; `reader.mjs` gains `replay`/`spent` (nodes read again by a continued search are not charged to the slice); `walk.mjs` exports `sourcedSteps` and `absence`. The search reads from both ends (a pair six steps apart is found by reading three rings from each end). It was measured against a one-direction reference enumerator over 200 random graphs (equal) and a 6-step pair that stops a one-direction walk at 5,000 nodes (answered whole).
- T53-164 (JOURNEYS): R-74 owner half is R37 (`presets()` rows carry `name`, the plain-word name by key, with `preset` the id and `kinds`; `explorepreset` runs by id or by name). R-86 has no explore requirement line: nothing built.
- T53-165 (English in tests): the one regex site (`verify-timeline-ops.test.mjs`) no longer holds English; the words check run on explore with the baseline off reports no test English. The entry for that file in `build/tests-english-baseline.json` can go (outside my paths).
- Not mine, nothing done: R36 (the five money family kinds) is `money`'s text filed in explore.md (it registers the kinds and edges); it stays unmet, named by a `test.todo`. T53-163 (`followfrom`, DEC-447) is affordances'.

**Readings to confirm** (sent to BOB at start, no answer yet)
- R37: `name` is now the plain-word text and `preset` the id (the old `name` id is `preset`); `explorepreset` accepts either, so `screens-investigate`, which sends `x.name`, keeps working until it draws `x.name` itself.
- `complete_through_steps` holds for chains that do not pass a hub; with a hub named, `more_may_exist` is true with `stopped.reason` `hub` (a chain through two hubs side by side is not listed, as R30 says). `depth_stopped` follows R22: nodes the record joins to an end at exactly `depth`.

**Found in other modules / stale artifacts**
- Generated and stale by this change: `bio-plane/src/setup-words/rows.mjs` (new `localize` sentences), and the bundles that include explore (`bio-plane/dist` and the others in the manifest table). `proc merge` regenerates them.
- `op-declarations` lists ops by hand: the four new ops need a spec row there (its job), and `control-plane` routes them.
- screens-investigate should draw `presets()` `name` and may use `preset` as the value sent back.
- Inherited reds, unchanged by this job: op-declarations 10, screens-investigate 11, op-grades 1 (same counts with and without my changes).

**Met** · R30, R31, R32, R33, R34, R35, R37

Tests: 84/85. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcecCDCpuTthEgNRVFXA): test runs 1, module lines 1713

## Completion (2026-10-28)

# explore T53 report

**Entries applied**
- T53-162 (N1260, DEC-409..411): R30 `exploreall` (`connectionsBetween`), R31 `explorepath` (`mostDirect`), R32 `exploreshorter` (`shorterThan`), R33 `explorecontinue` (`continueWalk`, a signed token of the arguments and the nodes read, no stored state), R34 (the four ops take `budget_ms`, 1,500 by default, up to 10,000; the existing walks keep 10,000), R35 (four `DECLARED_OPS` rows). New file `bio-plane/src/explore/chains.mjs`; `reader.mjs` gains `replay`/`spent` (nodes read again by a continued search are not charged to the slice); `walk.mjs` exports `sourcedSteps` and `absence`. The search reads from both ends (a pair six steps apart is found by reading three rings from each end). It was measured against a one-direction reference enumerator over 200 random graphs (equal) and a 6-step pair that stops a one-direction walk at 5,000 nodes (answered whole).
- T53-164 (JOURNEYS): R-74 owner half is R37 (`presets()` rows carry `name`, the plain-word name by key, with `preset` the id and `kinds`; `explorepreset` runs by id or by name). R-86 has no explore requirement line: nothing built.
- T53-165 (English in tests): the one regex site (`verify-timeline-ops.test.mjs`) no longer holds English; the words check run on explore with the baseline off reports no test English. The entry for that file in `build/tests-english-baseline.json` can go (outside my paths).
- Not mine, nothing done: R36 (the five money family kinds) is `money`'s text filed in explore.md (it registers the kinds and edges); it stays unmet, named by a `test.todo`. T53-163 (`followfrom`, DEC-447) is affordances'.

**Readings to confirm** (sent to BOB at start, no answer yet)
- R37 (BOB #332 accepted): `name` stays the run id, `words` is the plain-word name read from a key.
- `complete_through_steps` holds for chains that do not pass a hub; with a hub named, `more_may_exist` is true with `stopped.reason` `hub` (a chain through two hubs side by side is not listed, as R30 says). `depth_stopped` follows R22: nodes the record joins to an end at exactly `depth`.

**Found in other modules / stale artifacts**
- Generated and stale by this change: `bio-plane/src/setup-words/rows.mjs` (new `localize` sentences), and the bundles that include explore (`bio-plane/dist` and the others in the manifest table). `proc merge` regenerates them.
- `op-declarations` lists ops by hand: the four new ops need a spec row there (its job), and `control-plane` routes them.
- screens-investigate should draw `presets()` `name` and may use `preset` as the value sent back.
- Inherited reds, unchanged by this job: op-declarations 10, screens-investigate 11, op-grades 1 (same counts with and without my changes).

**Met** · R30, R31, R32, R33, R34, R35, R37

Tests: 84/85. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcecCDCpuTthEgNRVFXA): test runs 2, module lines 1701
