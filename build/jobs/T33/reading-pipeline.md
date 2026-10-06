# reading-pipeline (T33)

**Status** · session_01KYowDaH5VcYb58osy2yLAZ · depth 2 · WORKING · handled B0

## J1 · QUESTION

T33-23, R25–R27: where the after-read registry lives. My best reading, which I am building on now.

R25/R26 name `onRead(module, fn, {captureClasses})` and `afterRead({...})` but not how a registering module and the committing module (extraction, T33-23a) reach the same registry. A module-level singleton would be wrong: an isolate serves several storages (`extractionOf` keys its instances by `ctx.storage`), so a second storage's module would be refused `LISTENER_DECLARED` and one storage's `afterRead` would run hooks bound to another's instance.

Best reading: the registry is per storage, as extraction's own listener slots are. reading-pipeline exports `readHooksOf(ctx)` (one `ReadHooks` per `ctx.storage ?? ctx`, held in a WeakMap, memory only, no table) and the class `ReadHooks`, whose methods are `onRead` and `afterRead` exactly as R25–R26 state them. Extraction (T33-23a) calls `readHooksOf(ctx).afterRead({...})` after its commit; a later module calls `readHooksOf(ctx).onRead(...)` at its start. No module-level `onRead`/`afterRead` is exported.

Details I read the same way unless you say otherwise: (a) `ran` lists the modules whose hook was called and returned or resolved; one that threw or rejected is in `failed` only, not in `ran`; (b) `afterRead` is async: hooks are awaited one at a time, so a rejection is caught and named; (c) `captureClasses` must be a non-empty list of non-empty strings; a malformed list is refused through `listenerRefusal` with a null `fn` (ai-runs' precedent), so membership stays the one site of the code; (d) each hook gets its own structured clone of the reading, so no hook can change what a later hook or the caller holds.
