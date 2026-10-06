# reading-pipeline (T33)

**Status** · session_01KYowDaH5VcYb58osy2yLAZ · depth 2 · WORKING · handled B2

## Completion

**Entries applied.**
- T33-23 (B1a.4; K1468, D177; R25–R27, with the accessor BOB folded above R25 by K1555): the opt-in after-read hook, a new file `bio-plane/src/reading-pipeline/hooks.mjs`, exported from the module's `index.mjs`. `ReadHooks` holds the registry in memory (no table); `readHooksOf(ctx)` answers one per `ctx.storage` (or `ctx`), in a WeakMap, as `extractionOf` keys its instances; a ctx that is no object gets a fresh, empty one.
  - `onRead(module, fn, {captureClasses})` (R25): every refusal is membership's `listenerRefusal` (R81) with `{slot: "onRead"}`; a `captureClasses` that is not a non-empty list of non-empty strings goes to it with a null `fn` (ai-runs' precedent), so it answers `LISTENER_MALFORMED`; a second registration by a module is `LISTENER_DECLARED` naming it. Accepted registrations are ordered by `MODULE_ORDER` (R83), a module outside it last, in the order it registered.
  - `afterRead({captureSha, captureClass, reading, committed})` (R26): `committed !== true` runs nothing and answers `{ran: []}`; otherwise each hook for that class is awaited one at a time, in order, with `{captureSha, captureClass, reading}` (its own structured clone of the reading). `ran` is the modules whose hook returned or resolved, `failed` each `{module, error}` that threw or rejected; it never rejects.
  - R27: `read` never reaches the registry; the test reads a text capture, a PDF through tier 3 and a failed reading with and without hooks registered and compares the answers byte for byte.
- Header comment of `index.mjs` names R1–R27.

**Deferred.** None.

**Found in other modules.**
- `extraction` (T33-23a): R26 has no caller until extraction calls `readHooksOf(ctx).afterRead({...})` after its commit. BOB has told EXTRACTION #13 (B2).
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`, plane's source) is stale by the new `hooks.mjs` and the export, for BOB's regeneration at the layer close (manifest §14). No other artifact takes reading-pipeline's files.
- Final `uses` (K1505 (7)): unchanged from `modules.json`; `membership` is now used by product code (`listenerRefusal`, `MODULE_ORDER`).

**Tests and checks** (after merging `tranche/T33` with K1555's fold):
- `node --test test/m/reading-pipeline/ test/d606-perpage-ocr.test.mjs test/tier2-wire.test.mjs test/system/pdf-worker-binding.test.mjs` (in `bio-plane/`): tests 81, pass 81, fail 0, skipped 0. New: `hooks.test.mjs`, 4 tests (R25, R25 R26, R26, R27). `tier-pagewise.probe.mjs` is a probe, not run. No layer tests are named in the manifest. No service another module already uses changed, so no user's tests were run.
- `format`: 126 modules, 125 requirements files; 0 failures.
- `architecture reading-pipeline`: 22 product files, 52 relative imports; 0 failures.
- `coverage reading-pipeline`: 27 of 27 live requirement ids named by a test; 0 failures.
- `ownership reading-pipeline tranche/T33`: 4 files; 0 failures.

Size (session_01KYowDaH5VcYb58osy2yLAZ): test runs 5, module lines 1400

## J1 · QUESTION

T33-23, R25–R27: where the after-read registry lives. My best reading, which I am building on now.

R25/R26 name `onRead(module, fn, {captureClasses})` and `afterRead({...})` but not how a registering module and the committing module (extraction, T33-23a) reach the same registry. A module-level singleton would be wrong: an isolate serves several storages (`extractionOf` keys its instances by `ctx.storage`), so a second storage's module would be refused `LISTENER_DECLARED` and one storage's `afterRead` would run hooks bound to another's instance.

Best reading: the registry is per storage, as extraction's own listener slots are. reading-pipeline exports `readHooksOf(ctx)` (one `ReadHooks` per `ctx.storage ?? ctx`, held in a WeakMap, memory only, no table) and the class `ReadHooks`, whose methods are `onRead` and `afterRead` exactly as R25–R26 state them. Extraction (T33-23a) calls `readHooksOf(ctx).afterRead({...})` after its commit; a later module calls `readHooksOf(ctx).onRead(...)` at its start. No module-level `onRead`/`afterRead` is exported.

Details I read the same way unless you say otherwise: (a) `ran` lists the modules whose hook was called and returned or resolved; one that threw or rejected is in `failed` only, not in `ran`; (b) `afterRead` is async: hooks are awaited one at a time, so a rejection is caught and named; (c) `captureClasses` must be a non-empty list of non-empty strings; a malformed list is refused through `listenerRefusal` with a null `fn` (ai-runs' precedent), so membership stays the one site of the code; (d) each hook gets its own structured clone of the reading, so no hook can change what a later hook or the caller holds.
