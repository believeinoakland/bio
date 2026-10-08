# scheduler (T38)

**Status** · session_0125jcHshqfdCDMLVf27NVih · depth 2 · WORKING · handled B0

## Completion

**Entry applied: T38-30 (N789's other share; K2235, K2293), test only.** `bio-plane/test/m/scheduler/files.test.mjs`:288 now asserts R39's new answer against the real `file-safety` with no scanner bound: `scanWake` and `renderWake` both null; the firing ticks neither (`filescan` and `filerender` absent, so no `RENDERER_ABSENT` tick); `nextAt` is R39's earliest wake and the alarm is set to it, never at once; five minutes on (`FILE_SAFETY_POLL_MS`) render still does not tick and `nextAt` is again R39's (no crawl). Title names R24. No `src/` change: `index.mjs` skips a consumer whose due is null and the reconcile ignores a null wake (worker summary, `index.mjs`:266-269, 483, 518). Clears plan rule 6 item 14.

**Other tests checked:** `files.test.mjs`:161 keeps `RENDERER_ABSENT` as a stand-in refusal (R24 still names it as a possible tick answer); no other scheduler test pins a render tick with no renderer bound. `plane.test.mjs` (K2235's red, rule 6 item 23) is green.

**Deferred:** nothing. **Found in other modules:** nothing.

**Reading set:** measured at about 303 KB (own requirements 23 KB; used modules' Purposes 16 KB; the services my Uses names 45 KB; code 49 KB; tests 170 KB), over 300 KB, so option (3) as the START requires. Read whole myself: `build/requirements/scheduler.md`, layer 10's row of `build/layers.md`, `files.test.mjs`, `file-safety` R39, plan T38-30 and rule 6 item 14, K2235 and K2293. A worker read whole `src/scheduler/index.mjs` and the other ten files under `test/m/scheduler/` (199 KB) and wrote a task summary of about 6 KB, each statement citing file and line.

**Tests run** (on `job/T38/scheduler` from `tranche/T38` @ `cc16f3684b`):
- before the change: `files.test.mjs` 14/1 (`:288`, `filerender` undefined: rule 6 item 14).
- after: `test/m/scheduler/` 110 pass, 0 fail.
- No layer tests are named in the manifest; no service I provide changed.

**Checks** (process repository):
- `format: 137 modules, 136 requirements files; 0 failures`
- `architecture: 12 product files, 59 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 24 of 24 live requirement ids named by a test; 0 failures`
- `ownership: 1 files changed by scheduler between tranche/T38 and HEAD; 0 failures`

Size (session_0125jcHshqfdCDMLVf27NVih): test runs 2, module lines 724
