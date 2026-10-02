# calibration (T23)

**Status** · session_01Mjvo5XojdSxchMV4AYk7Ss · depth 2 · WORKING · handled B1

## Completion

**Entries applied.** N497 (K1087, K1099; N469's rule), tests only. The retired `"legacy-store"` no longer stands as a live listener in my tests; each place now names a live module id in the same slot of the order the test gives, so each assertion keeps its meaning:
- `bio-plane/test/m/calibration/store.test.mjs`, R12's two order tests (:429–:459): `"legacy-store"` → `"scheduler"`, a real listener (`scheduler/index.mjs`:363–:364) and after `content` in `MODULE_ORDER` too. The given orders stay `[calibration, extraction, content, scheduler]` and `[extraction, content, scheduler]`: an order still listed, `"unlisted"` still last, obligations concatenated in that order (the marker `{from: "legacy"}` → `{from: "scheduler"}`).
- `bio-plane/test/m/calibration/notices.test.mjs`, the listener slots (:59, :61, :64, :87): `"legacy-store"` → `"tasks"`. `scheduler` already holds the slot before it, and `tasks` is the first live module after `scheduler` in `MODULE_ORDER`, so the hostile test, which runs under the default order, keeps its four listeners in the same order.

**Re-scan** (N469, N471, N480): no note in `bio-plane/src/calibration.mjs`, `bio-plane/src/calibration/` or `bio-plane/test/m/calibration/` names a T20-deleted file, `tools/`, `legacy-tests` or `legacy-store` as live. The notes that remain are provenance: `checks.mjs`:8 (moved from `bio-checks.mjs`), `schema.mjs`:2–4 and the `replaced_by` comment (the `schema.mjs` pass deleted at T19, `versionchain.test.mjs` deleted at T20, both past tense), `migrate.test.mjs`:28 ("as the legacy schema pass did"). `textchain.mjs`, `plane/store.mjs` and extraction's `op=calibrationdrift`, which notes name as live, are live. Nothing changed.

**Negative control.** With `#rank` in `calibration/index.mjs` temporarily answering `Infinity` for every module (registration order only; restored, not committed), six order tests fail: R12's two (order given; `MODULE_ORDER`) and R18's and R19's two each; the rest pass.

**Deferred.** None. **Found in another module.** None. No provided service changed; no generated artifact staled.

**Tests and checks.**
- `node --test bio-plane/test/m/calibration/`: tests 65, pass 65, fail 0.
- the whole `bio-plane/test/m` (every `*.test.mjs` under it): tests 5038, pass 5025, fail 1, todo 12, skipped 0. The one red is accepted red 9, control-plane `inbox-door.test.mjs`:81. test-support R2 passed here.
- `checks/format.mjs`: 87 modules, 86 requirements files; 0 failures.
- `checks/architecture.mjs … calibration`: 9 product files, 23 relative imports; 0 failures.
- `checks/coverage.mjs … calibration`: 20 of 20 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … calibration tranche/T23`: 3 files changed; 0 failures.

Size (session_01Mjvo5XojdSxchMV4AYk7Ss): test runs 5, module lines 2094
