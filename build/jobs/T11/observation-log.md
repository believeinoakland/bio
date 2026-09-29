# observation-log (T11)

**Status** · session_01TigRGSFxE29ocquNjATfru · depth 2 · COMPLETE · handled B1

## Work (OBSERVATION-LOG #3)

Read whole: `roles/JOB.md`; B1; the plan's opening paragraph and layer 5; N294 in `next.md`; `build/requirements/observation-log.md`; extraction's R24, R60, R61, R62 and its `onReading`/`onIndexed`/`#register`/`indexUnits`/`indexTestimony`; the module's four source files and seven test files; legacy-store's `#testimonyWithin` (the direct `observeIndexed` call R7's listener will replace at layer 10).

**Applied** (0e5cb9fcb5):
- **N294 (my share).** `listenTo(extraction)` now registers `onIndexNotice` with extraction's index notice (its R62) beside `onReadingNotice` on its reading notice (R24), each once, and answers whether it listens to both; the factory does it as before. `onIndexNotice` writes one `derive` row per indexed authored observation by R7's own rule (`observeIndexed`): `PRESENT` when every unit was stored, `partial` with the bound, `LOOKED_ABSENT` when the index offered no glyph-holding unit (no text), `LOOKED_INDETERMINATE` naming the container when the notice names one with no unit arm (only `document` has one: `INDEX_NOTICE_UNIT_CONTAINERS`). The referent is the capture (`result_kind: reading`). It writes no content row (R6) and no reader run (R8), since no reader ran. A refused row throws, so the index write fails rather than stand with no observation (extraction R62's reason). A notice naming no capture writes nothing.
- `observeIndexed` takes an optional `noTextDetail`, so the testimony's no-text row says why (no glyph) instead of pointing at an extraction row that does not exist. Its reading-path behaviour is unchanged.
- **Tests** (`writers.test.mjs`, `fixture.mjs`): the fixture's controlled notice gains `onIndexed`/`fireIndexed`, and `world({ extraction: "module" })` builds over extraction itself. Two R7 tests: every arm of the rule over the notice (states, bound, truncation, referent, actor class, no other rows, no capture, R6's first-extraction reading unaffected, one registration), and end to end through `indexTestimony` (PRESENT, glyphless words LOOKED_ABSENT, no capture no row). Negative control: with the registration removed, three R7 tests fail by name.

**Marks met, for BOB to strike:** R7's `(not yet met: N294; the index notice is not yet registered)`. Also stale, found while reading: R20's `(not yet met: D-681)`; `leadList` is built and `lead.test.mjs` tests R20 in full (and the op), so it holds. R21's D-682 mark: `leadRead` carries the vocabulary (tested); its other half, the internet frontier, is retrieval's read, so I leave that mark to you.

**Found in other modules:** legacy-store's `#testimonyWithin` still calls extraction's `indexUnits` and this module's `observeIndexed` directly (`store.mjs` ~1930). When it moves to `indexTestimony` in layer 10 (N294), it must drop its own `observeIndexed` call, or the capture gets two index rows. Nothing else.

**Stale generated artifacts (mechanics §14):** `agent-worker/dist/agent-worker.bundled.mjs` (and `.bundle.json`), whose inputs include `bio-plane/src/observation-log/index.mjs`: `fleetbundles.test.mjs` fails `agent-worker: STALE BUNDLE` on my commit and passes without it. Also, by its inputs, `bio-plane/dist/bio-plane.bundled.mjs`. Not rebuilt.

**Tests and checks run** (on 0e5cb9fcb5):
- `node --test bio-plane/test/m/observation-log/`: tests 45, pass 45, fail 0, todo 0.
- `node --test bio-plane/test/m/extraction/`: tests 83, pass 81, fail 0, todo 2.
- `node --test bio-plane/test/m/` (every module, this module's users included): tests 2468, pass 2441, fail 0, todo 27.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture`: 11 product files, 35 relative imports; 0 failures. `coverage`: 29 of 29 live requirement ids named by a test; 0 failures. `ownership`: 4 files changed by observation-log between tranche/T11 and HEAD; legacy-store and legacy-checks 0 lines; 0 failures.

**Deferred:** nothing.

Size (session_01TigRGSFxE29ocquNjATfru): test runs 8, module lines 2863
