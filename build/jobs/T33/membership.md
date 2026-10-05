# membership (T33)

**Status** · session_0177vLzjSyU8nj98B8SxWTmZ · depth 2 · WORKING · handled B1

## Completion

**Entries applied.** T33-19a (B1a.12, A LAW membership; K1438, K1504). R83 is met.
- `index.mjs`: `MODULE_ORDER` is re-pinned to `build/modules.json` as it stands after the opening, which is plan T33's Rules (2). It has 126 ids. The new modules sit in their places, `local-facts` and `standards` are in layer 5, and `observation-log` follows `connections`. The list holds every module the file names, built or not, so a new module's listeners are ordered correctly from the day it registers. The comment says so.
- `module-order.test.mjs`: two new tests, plus the three existing R83 tests, which are unchanged.
  - (1) Plan T33's order, pinned. Layers 1, 5, 6 and 10 are checked whole. Layers 8 and 11 are checked by the run each new module sits in. The test also checks that `local-facts` and `standards` are in layer 5, that `observation-log` comes straight after `connections`, and that every T33 module is held.
  - (2) Every module in the file is built: its `paths` are non-empty and on disk. The one exception is a T33 module with empty `paths`, the state a new module is registered in until its merge (K1336). Only the 28 names R83 lists are tolerated this way. The test names each of them in a diagnostic as not yet built and does not fail on them. Today that is 18 modules: events, lines, money, money-checks, duties, people, explore, calculations, workbooks, leg-earning, hypotheses, answers, agent-harness, agent-model, agent-runner, case-tensions, following and notice-producers.
- **My reading of "removes it from the tolerated names" (P17, my choice; BOB may CHANGE it).** A module stops being tolerated when its merge gives it `paths`. From then on it is held to those paths, so no later job has to edit membership's test (P7). The 28 names stay in the test as the list R83 allows. This module's next job can prune them once all 28 have merged.
- The accepted red named by plan Rules (9) item 2 (membership's R83 test) is gone: the test is green, and it stays green while those 18 modules remain unbuilt.

**Deferred.** None.

**Found in other modules** (REPORT J2):
- **entities**: `test/m/entities/resolve.test.mjs:177` ("R13 (N202) … the listeners run in the modules' total order") hard-codes `["connections", "progressions", "observation-log"]` as the total order. Under T33's order, `observation-log` precedes `progressions`, so the test now fails: actual `[50, 53, 51]`, expected sorted. Entities' code orders correctly through `MODULE_ORDER`; only the test's expected list is stale. It is red from this merge until entities' job (T33-25), or until BOB routes it there by CHANGE. It is green on `tranche/T33` without my change (9/9).
- **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` and its `.bundle.json` (owner `not_product`). The bundle inlines membership's `index.mjs`, which this change edits. BOB regenerates it at layer close (§14). Nothing else is stale: `program.mjs` and the other bundles do not include membership.

**Tests and checks run** (after merging `tranche/T33` @ d112635986):
- `node --test bio-plane/test/m/membership/`: tests 141, pass 141, fail 0. Negative control: with the old list restored, the three order tests and t9's R79 order test fail (4); restored, green.
- `node bio-plane/test/members.test.mjs`: 96 pass, 0 fail.
- Layer tests: none (manifest).
- Users of `MODULE_ORDER`: the full suites of promotion, provenance, calibration, extraction, content, entities, connections, progressions, bias, retrieval, ai-runs, capture-requests, plane and control-plane (`test/m/…`, `d526-refusal-order`, `mk6-bundle-names-no-author`): tests 1257, pass 1254, fail 3. Two are named reds: ai-runs `scheduler.test.mjs:123` (K1514) and entities `idmatch.test.mjs:20` (K1515). One is entities `resolve.test.mjs:177`, above.
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture membership`: 23 product files, 59 relative imports; 0 failures. `coverage membership`: 79 of 79 live requirement ids named by a test; 0 failures. `ownership membership tranche/T33`: in the commit line below.

Size (session_0177vLzjSyU8nj98B8SxWTmZ): test runs 8, module lines 3356
