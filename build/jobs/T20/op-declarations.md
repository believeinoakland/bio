# op-declarations (T20)

**Status** · session_01R8izBGeMMKg6JzLqkqLuGN · depth 2 · WORKING · handled B1


### Completion

- **Applied (B1; K899 (7), K902; actions R52):** `actionhold` declared as `actionpressure` is. `OPS.actionhold` = `{classes: ["admin", "member", "probe"], mutating: true}`, no `machineClasses` (`src/op-declarations/index.mjs`, beside `actionpressure`); in `ACTIONS_ACTIONS`, so it is in `QUERY_AUTHOR_ACTIONS` (its `author` query-stamped), `ACTION_LAYER_ACTIONS` and both `SESSION_OPS` sets through their spreads; `NEEDS.actionhold = "contribute"` (beside `actionpressure`). `ACT_GATE` answers `contribute` / `session` for it. Not in `UNATTENDED_BY_DECISION`. R6: the handler exists (`actions/index.mjs` `actionsOps().actionhold`).
- **Tests:** `tables.test.mjs`: the action-layer test's `ACTIONS_ACTIONS` expectation now includes `actionhold` (title "actions' four" → "five"); a new test (R2, R3, R4, R6) asserts `actionhold`'s spec equals `actionpressure`'s, that exactly the lists holding `actionpressure` hold it, both session sets, `contribute`, the gate's answers, and no unattended row. The totality tests (R2–R6) pass with the op present. No suite deleted (K619).
- **Deferred:** none.
- **Found in other modules / stale generated artifacts (mechanics §14):** the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`) is stale (fleetbundles: "STALE BUNDLE — src/op-declarations/index.mjs has changed"), and with it whatever embeds it (`release/bio-plane.bundled.mjs`, `newgroup/src/release.mjs`, newgroup's dist). Not written by this job. Affordances (its R3, R12) has not yet graded or published `actionhold`; its own L11 job carries that (K902); its suite is green today.
- **Reading (step 2):** read whole: `build/requirements/op-declarations.md`, affordances' public part (its only Use), `build/layers.md` layer 11, `src/op-declarations/index.mjs`, the three test files, B1 and its plan entries (`build/plan/current.md` L11, K899 (7), K902); actions R48, R52 and `actionsOps().actionhold` for the op's shape.
- **Tests run:** `node --test bio-plane/test/m/op-declarations/`: tests 17, pass 17, fail 0. Users and readers of the tables: affordances 131/0, admission 19/0, control-plane 85/0, actions 62/0, queue 74/0. Full `test/m`: tests 4662, pass 4642, fail 0, todo 20. `fleetbundles.test.mjs`: the plane bundle stale (this change) plus the 3 accepted reds (legacy-tests' L11 job). No layer tests named in `build/manifest.md`.
- **Checks:** format: 84 modules, 82 requirements files; 0 failures. architecture: 4 product files, 7 relative imports; 0 failures. coverage: 7 of 7 live requirement ids named by a test; 0 failures. ownership: see below (re-run after commit).
- Size (session_01R8izBGeMMKg6JzLqkqLuGN): test runs 5, module lines 2254
