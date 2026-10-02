# corpus-export (T23)

**Status** · session_018tg1ECR7JsNZhPSSSfBouG · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (`build/plan/current.md` T23 L8, corpus-export; B1):
- N483 (K1122), R6: `corpusExportOps(ce, q)` published from `bio-plane/src/corpus-export/index.mjs`, in escalation's `escalationOps` form: `export: () => ce.exportManifest({ note: q("note") })` and `exportlog: () => ce.exportLog({ limit: q("limit") })`, publication's arms (`publication/index.mjs`:2702–2703) moved with today's behaviour. No credential in the map (op-declarations' and control-plane's). The module header no longer says it has no op map; `export.test.mjs`'s header says the same.
- N484: Uses re-worded by BOB at the opening (fold 3); nothing for this job.

**Tests.** New `bio-plane/test/m/corpus-export/ops.test.mjs`, three R6 tests at the interface: the map holds exactly `export` and `exportlog`, each of no arguments, and survives a spread; the `export` arm answers deep-equal to `exportManifest` and logs the same row, with `note` passed through (including a 400-character note cut to 280, and none), read when the arm runs; the `exportlog` arm answers deep-equal to `exportLog` for every `limit` R2 clamps (none, 2, 0, -5, 5000, x, 2.9, 5, 4), each arm reading only its own parameter.
- `node --test bio-plane/test/m/corpus-export/`: tests 13, pass 13, fail 0.
- whole `bio-plane/test/m`: tests 5056, pass 5041, fail 3, todo 12, skipped 0. The three are accepted reds named in B1: red 9 (control-plane `inbox-door.test.mjs`:81) and red 13 (queue `catalogue.test.mjs` R1 :34, R5 :116). No other red.

**Checks** (process repository):
- `format.mjs`: 87 modules, 86 requirements files; 0 failures
- `architecture.mjs corpus-export`: 6 product files, 13 relative imports; 0 failures
- `coverage.mjs corpus-export`: 6 of 6 live requirement ids named by a test; 0 failures
- `ownership.mjs corpus-export tranche/T23`: 0 failures

**Deferred:** none.

**For BOB / other modules:**
- R6's `*(not yet met: T23)*` mark in `build/requirements/corpus-export.md` can be struck: R6 is met (BOB's file).
- The plane bundle's inputs changed (`corpus-export/index.mjs`); regenerated nothing (§14).
- `publication` can now retire its `export`/`exportlog` arms; the plane (L11) spreads `corpusExportOps(corpusExportOf(ctx), q)` (accepted red 14 until then).

Size (session_018tg1ECR7JsNZhPSSSfBouG): test runs 2, module lines 359
