# admission (T38)

**Status** · session_01CTyGZe6hkFn6SZXskpYRyL · depth 2 · WORKING · handled B1

## Completion (ADMISSION #7)

**Reading set (mechanics §17).** Measured at about 256 KB, under the 300 KB limit, so read whole by this session itself: `build/requirements/admission.md` (24.5 KB, both parts); the Purpose of each module in my Uses and, in their Provides, the services my Uses names (op-declarations R2, R3, R6; runtime-limits' `liveToken` lines; credentials R5, R15, R38, R42, R44, R50; capture R56; about 14 KB); layer 11's row and its split section in `build/layers.md`; the module's code (`index.mjs`, `window.mjs`, `checks.mjs`, 93.4 KB) and tests (all 10 files with the harness, 123.4 KB); my entry T38-24 in `build/plan/current.md`, `plan/draft-T38-L11.md` §6, K2300 and K2318. No summary was used.

**Entry applied.** T38-24 (N792; K2247, K2300, K2318): R21 amended is met.
- `window.mjs`: `doorWindow` takes `count`; with exactly `false` it answers `{ source }` (capture R56's fingerprint, or the shared source for no address) and reads, counts, refuses and writes nothing (no row, no dropped bucket). `admissionOps`' `doorwindow` passes the body's `count: false`; any other value counts as before. No new route, so op-declarations R6 is untouched.
- `index.mjs`: `sourceOf(req, env)` with no `KNOCK_FINGERPRINT_KEY` POSTs `{address, count: false}` to `bio`'s `doorwindow` (the address in the body only) and answers the store's `source`. It answers `null` when the store cannot be asked or does not answer, logs by correlation id only (a UUID-shaped one, else `none`), and never throws. The bound arm and the no-address arm are unchanged and ask no store. Signature unchanged, so control-plane's two call sites need no change.
- Tests: new `t38.test.mjs` (3 tests, each titled R21): both arms, where login's source (`doorWindowGate`) equals setpassword's (`sourceOf`) for each address, nothing is counted, even on a full window, and the store request is checked; the store side's `count: false` against other values; and the failure paths. `storeWorld` and `bridged` moved from `window.test.mjs` into `harness.mjs` so both files share them; `window.test.mjs`'s unbound assertion now says it has no store to ask. All three new tests fail on the old code and pass on the new.

**Deferred.** Nothing.

**Found in another module (REPORT J1).** control-plane `index.mjs`:654, `windowed.source ?? await sourceOf(req, env)`: when the window was not read (a store fault), the fallback now asks the same store a second time for an unbound key. The result is right (`null` again on a dead store) but costs one extra request on the fault path only. Improvement for control-plane: drop the fallback for a public op, since the window's source is the fingerprint. Not urgent.

**Generated artifacts.** None made stale (the plane bundle is regenerated at layer close, per the manifest).

**Tests and checks.**
- admission `node --test test/m/admission/`: 37 tests, 37 pass, 0 fail.
- Users of `sourceOf` and `admissionOps`, `node --test test/m/control-plane/ test/m/plane/`: 338 tests, 335 pass, 3 fail, the same three before and after this change. All three are plane's: R10 `stats`, both tests, and R18/R5 case-carriage's map. They belong to plane's T38-26 entries, not to this change.
- No layer tests are named in the manifest.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs admission`: 0 failures. `checks/coverage.mjs admission`: 22 of 22 ids named, 0 failures. `checks/ownership.mjs admission tranche/T38`: 6 files, 0 failures.

Size (session_01CTyGZe6hkFn6SZXskpYRyL): test runs 5, module lines 1379

## J1 · REPORT

control-plane index.mjs:654, `windowed.source ?? await sourceOf(req, env)`: since T38-24, sourceOf with an unbound key asks the store's doorwindow (count: false), so when the window was not read (a store fault) the fallback asks the same store a second time. The result is right (null again on a dead store), but the fault path costs one extra request. Improvement for control-plane: drop the fallback for a public op, since the window's source is already the fingerprint. Not urgent; for next.md.
