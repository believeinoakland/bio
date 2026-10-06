# extraction (T33)

**Status** · session_01G7Adz3cZJyj9EDveznQ5vf · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R69 (T33-23a): my best readings, on which I am building now. Answer only where one is wrong.
1. **Which commits.** Every write through R19's writer (`writeReading`): promotion's projection (R20), the re-read (R34) and the N26/N439 migrations (R66, R68). The call is held with `record-core.afterCommit` (its R66), so it runs once after the outermost transaction commits (promotion's, for R20) and is dropped on rollback. `indexTestimony` writes no reading and calls nothing.
2. **The capture class** is the reading's `content_type` (reading-pipeline's Suggestion proposes the profile's content-type key), null when the reading names none (so no hook is called).
3. **The hook's shape.** reading-pipeline is not merged yet, so I reach `afterRead` through a namespace import (no link error before its merge) as a module-level export, and the instance also takes an injected `afterRead` (as `promotion` and `calibration` are injected) for tests. If reading-pipeline makes it an instance method instead, tell me its accessor.
4. **"Reported with the reading."** `writeReading`'s answer gains `afterRead`, a promise of `afterRead`'s `{ran, failed}` settled after the commit (a thrown/rejected `afterRead` itself is caught and reported as `failed: [{module: "reading-pipeline", error}]`); the re-read's `reextraction` gains `after_read: {ran, failed}`; the promise is also handed to the object's `waitUntil` so a hook finishes. Promotion's answer is promotion's and is not changed by me (its projection answers null today); a failure there is reported only in `writeReading`'s answer. Say if you want more.

## Completion

**Entries applied.** T33-23a (K1521): R69. `writeReading` (R19, the one writer behind promotion's projection R20, the re-read R34 and the N26/N439 migrations R66, R68) holds a call of `reading-pipeline.afterRead({captureSha, captureClass, reading, committed: true})` with `record-core.afterCommit` (its R66): it runs once per reading just after the outermost transaction commits, and never on a rollback (a throw, a refusal, or a throwing R24 listener). The capture class is the reading's `content_type` (null when none); the hooks get the reading as written (a copy). `writeReading`'s answer carries `afterRead`, a promise of `{ran, failed}`; `afterRead`'s own throw or rejection is reported as `failed: [{module: "reading-pipeline", error}]` and never undoes the reading; the run is handed to the object's `waitUntil`. The re-read's `reextraction` gains `after_read`. `afterRead` is reached as reading-pipeline's module-level export through a namespace import (no link error before reading-pipeline merges), or the one handed to the constructor (tests). All four readings of J1 accepted by BOB (B2, K1554).

**Deferred.** None. Until reading-pipeline's T33-23 merges, its module exports no `afterRead`, so `#holdAfterRead` answers null and nothing is called; once it merges, the default path calls the real hook with no change here. My tests reach R69 through an injected `afterRead` (reading-pipeline R26 is that module's to test); if BOB wants a test over the real module after its merge, a CHANGE adds it.

**Found in other modules.** None.

**Tests and checks.**
- `node --test bio-plane/test/m/extraction/`: ℹ pass 119, ℹ fail 0 (new: `afterread.test.mjs`, 7 tests, R69 and R34's answer).
- No layer tests are named in `build/manifest.md`.
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture`: 25 product files, 94 relative imports; 0 failures. `coverage`: 45 of 45 live requirement ids named by a test; 0 failures. `ownership`: 4 files changed by extraction between tranche/T33 and HEAD; 0 failures.
- Uses unchanged (`reading-pipeline`, `record-core` already in `modules.json`).

Size (session_01G7Adz3cZJyj9EDveznQ5vf): test runs 3, module lines 2715

## J2 · COMPLETE

R69 (T33-23a) met: afterRead held with record-core.afterCommit in writeReading, once per committed reading; capture class = content_type; outcome reported with the reading (writeReading's afterRead, the re-read's after_read). 119/119 extraction tests; format, architecture, coverage (45/45), ownership (4 files) 0 failures. Uses unchanged. Merges after reading-pipeline; nothing is called until its afterRead export lands. Record: build/jobs/T33/extraction.md.

## CHANGE B3 (K1555)

Merged `tranche/T33` (reading-pipeline's wording above its R25). R69 now calls the storage's own registry, `reading-pipeline.readHooksOf(storage).afterRead(…)` (keyed by the storage as `extractionOf` keys this module), resolved at call time through the namespace import, so before reading-pipeline merges nothing is called; the constructor's injected form is now `readHooks` (a ReadHooks-like object), used by the tests. Everything else as in Completion. Checked once, uncommitted and removed afterwards, against `job/T33/reading-pipeline`'s `hooks.mjs`: a hook registered with `readHooksOf(ctx).onRead` for `minutes` ran after a `minutes` reading's commit, a throwing one was reported in `failed`, and an `agenda` reading ran none.

Tests and checks re-run: `node --test bio-plane/test/m/extraction/`: ℹ pass 119, ℹ fail 0. format 0 failures; architecture (26 product files, 95 imports) 0 failures; coverage 45 of 45, 0 failures; ownership 4 files, 0 failures.

Size (session_01G7Adz3cZJyj9EDveznQ5vf): test runs 6, module lines 2716
