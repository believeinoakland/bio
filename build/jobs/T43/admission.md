# admission (T43)

**Status** · session_012MAkFR3nxswi8gLq5bSoFY · depth 2 · COMPLETE · handled B1

## Record: T43-21 (K2708, widened by K2710, K2719)

**Read.** B1 START. Read whole: `build/requirements/admission.md`; every file under `src/admission/` and `test/m/admission/`; doorbell's Purpose, Provides and R12, R25 (`build/requirements/doorbell.md`) and its `doorbellOf`, `#knockKey`, `sourceFingerprint` and `schema.mjs`; the plan's rule 4 and T43-21; K2708, K2710, K2719; layer 11's row in `build/layers.md`.

**Entries applied.**
- `src/admission/window.mjs`: the door window's fingerprint is `doorbellOf(ctx).sourceFingerprint(address)` (doorbell R12), reached at the first fingerprint asked; the import of `capture` is gone. No admission file imports `capture` any more (src or tests).
- `test/m/admission/harness.mjs` (was :189): `storeWorld` builds the doorbell over its storage (`doorbellOf(ctx, { capture: { env } })`, doorbell R25's `env` seam), which creates `knock_key` and its other tables by its own declared schema; the harness no longer imports `capture` or cuts DDL from `CAPTURE_DERIVED_SCHEMA`. `w.capture` is `w.doorbell`.
- `window.test.mjs`:29, 71, 92 and `t38.test.mjs`:27, 61, 69 call `w.doorbell.sourceFingerprint` (doorbell R12); titles and comments re-worded from capture R56 to doorbell R12. `git grep sourceFingerprint bio-plane/src/admission bio-plane/test/m/admission` names the doorbell's only.
- New `t43.test.mjs` (R21): the window's fingerprint, counted and asked alone, equals doorbell R12's for the same storage and source, key bound and unbound (control: a different source differs; another storage's instance key differs; a doorbell made after the window is the one reached); and each file of `src/admission`, loaded afresh under a module resolution hook, resolves no import into `src/capture/` and `window.mjs` resolves the doorbell's (control: the doorbell's own `index.mjs` is seen importing capture). Run against a `window.mjs` that imports capture, it fails.
- Comments in `src/admission/index.mjs` (R21's `sourceOf`, `storeSource`) name doorbell R12 in place of capture R56.

**Edges (BOB's, modules.json).** New: `admission` → `doorbell`. Dropped: `admission` → `capture` (no admission file imports it).

**Deferred.** None.

**Found in other modules.** Nothing new. Users' reds are all accepted by rule 4 (below).

**Tests.**
- admission: 43 pass, 0 fail (rule 4 (12)'s 5 R21 tests in `window.test.mjs` and `t38.test.mjs` pass: cleared).
- answer-envelope 25/5: `catalogue-end.test.mjs`:17, `envelope.test.mjs`:63, `families.test.mjs`:49, 377, 424 — doorbell's C-85/C-118 family missing, rule 4 (9), until T43-14; the same 5 red on `tranche/T43` without this change.
- control-plane 222/1: `envelope.test.mjs`:387 (assert :391, `NO_SUCH_KNOCK` pinned in capture's table), rule 4 (12), until T43-23.
- plane 185/0 (`test/m/plane/` and `test/system/migrate-released.test.mjs`).

**Checks** (process repository): format 0 failures; coverage admission 22 of 22, 0 failures; ownership admission `tranche/T43` 0 failures; architecture admission 3 failures, each the new import of doorbell (`window.mjs`, `harness.mjs`, `t43.test.mjs`) that the edge `admission` → `doorbell` clears (expected, B1).

Size (session_012MAkFR3nxswi8gLq5bSoFY): test runs 7, module lines 3401
