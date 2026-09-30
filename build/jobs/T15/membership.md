# membership (T15)

**Status** · session_01Wczft1gsPUnco6CaLvEUg5 · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entry applied** (layer 2's membership bullet; N352, K477; B1), commit e42e34800b (+16 −1 in `src/membership/index.mjs`, one new test file):
- **R88 `hiddenBundles(viewer)`**, a module-level export beside `viewerPredicate`. `null` for R43's see-all arms (scope `member`: every machine credential and the founder's bare `admin` viewer). Otherwise `{sql, args}`: `(SELECT bundle_id FROM bundles EXCEPT SELECT b.bundle_id FROM bundles b WHERE (<the compiled gate>))`, with the gate's args copied. That is the exact spelling of the three copies (store `#hiddenBundles`, queue `#hiddenBundles`, retrieval `hiddenSet`), so each caller can swap to it with no change in behaviour. A viewer R43 refuses (the asked-but-absent one included) hides every bundle. The store's "never sent means whole" rule stays the caller's; the function does not read `undefined` specially. It writes nothing, never throws, and returns a fresh `args` array each call.
- **`not yet met` to strike:** R88's mark (`build/requirements/membership.md`:86).

**Rows (N318):** none added, moved or retired.

**Deferred:** none.

**Found in other modules / artifacts:**
1. **Generated artifacts (§14), not rebuilt:** `bio-plane/dist/bio-plane.bundled.mjs` and `agent-worker/dist/agent-worker.bundled.mjs` are STALE against `src/membership/index.mjs` (`fleetbundles`: source now sha256 cef8a9dd86c2…, bundles built from 73886c5df445…).
2. **civicos-ui / affordances:** no hit for `hiddenBundles`. The other hits are the three callers (layers 5, 10, 11), the bundle, and legacy-tests' prose about the store's private copy: `test/project-sight.control.mjs`:220, 238, 292, 381, 397, 405, and `test/run-conditions.test.mjs`:397. These concern the callers' moves, not this job.
3. **Observation, my module, not changed:** R43 counts the founder among the "active administrators" (Terms, R64), but `viewerPredicate`'s member arm looks up a `members` row only. So `member:admin` as a *viewer* sees no project it does not participate in, while the bare `admin` viewer sees all. Today the founder's viewer is stamped as bare `admin` (`member:admin` is only the positional identity), so I know of no wrong answer. The R88 test checks the complement for `member:admin` without pinning its set.

**Tests and checks** (base `tranche/T15` @ c1ebe62c87):
- `node --test test/m/membership/` (from `bio-plane/`): tests 113, pass 113, fail 0, todo 0 (six are R88's, in `hidden-bundles.test.mjs`).
- Mutation control: answering `null` for R43's DENY arm fails 3 of the 6 R88 tests. Restored.
- `node --test bio-plane/test/fleetbundles.test.mjs`: fails only on the two stale bundles above.
- No layer tests are named in `build/manifest.md`. No provided service changed (R88 is new, with no caller yet), so no user's suite is owed.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture membership`: 0 failures. `coverage membership`: 88 of 88 live ids named; 0 failures. `ownership membership tranche/T15`: 3 files; legacy-store 0 added, 0 removed; 0 failures.

Size (session_01Wczft1gsPUnco6CaLvEUg5): test runs 4, module lines 3755
