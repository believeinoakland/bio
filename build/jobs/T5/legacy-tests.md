# T5 · legacy-tests — job record

**Session** LEGACY-TESTS #3, `session_01TW5ASSYtwo47MkR2AdX1H6`, on `job/T5/legacy-tests` (from `tranche/T5` @ `054006d1d5`, fast-forwarded to `7a2cc56e1f`, layer 11's start). Process: civicos-process `roles/JOB.md`, mechanics §6, §13, §16. BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T5` (BOB #46, `session_01Q3WyZBMy4MH1Acpgtw9awA`, at the start).

**Status** · IN PROGRESS. Baseline taken; six workers of this session on the families below, every diff to be read here before it is committed.

**Contract** (no requirements file; `build/modules.json`): the old battery (`bio-plane/test/`, `civicos-ui/test/`, minus `bio-plane/test/m/<module>/`) and `civicos-ui/check-refusal-codes.mjs`, `check-semantics.mjs`. Entry: **T5-12** (`build/plan/current.md`, Layer 11). Rule (T4's, unchanged): a test pinning moved source text is re-anchored on the module's interface or retired with the moved code; a fixture an intended rule now refuses is fixed; no assertion of product behaviour is weakened; a red that looks like a product defect is REPORTed. A red owed only to a route or stamp LEGACY-INDEX #3 adds (T5-11) is noted and re-run after its merge.

**Read whole:** `roles/JOB.md`, `build/manifest.md`, my entry, the plan's layer notes, LEGACY-TESTS #2's record (`build/jobs/T4/legacy-tests.md`), and the T5 records T5-12 cites (record-core, calibration, content, extraction, entities, query-language, retrieval, bias, observation-log, connections, promotion), with the rulings they cite.

## Baseline

Every suite of the old battery (367 plane suites `bio-plane/test/*.test.mjs`, 90 `civicos-ui/test/*.test.mjs`), each `node test/<name>.test.mjs` from its package, four at a time, on a pristine worktree of `tranche/T5` @ `7a2cc56e1f` (layer 11's start), 2026-09-27 ~09:15–10:15 UTC, before any change of this job: **93 RED** (85 plane, 8 civicos-ui).

Plane: affordances aicredential airun airuns bias bounds browser-render calibration capture-text-index capturerequests cite-extent content-arm content-chain-kind content-extent-arms content-extent-leg content-machine-mint content-reads d280-strengthbar d311-roster-affordances d389-fullfetch d470-catalog-census d484-refusal-translation d522-unattended-render d543-instant-precision d606-perpage-ocr dec65-strength-reach derivation-bounds doorbell drive formats founder-sight frontier-chunk group-identity hygiene identity-claims inquiry lead m025-arm-anchor-witness machine-attest machinefences-dec49 meaning-bounds meaningquery meaningread mint-ledger mk7-attribution monitor-rendered observation-content observation-log observation-meaning ocr-member-e2e opaque-ids owed-controls passage-arm pen-sweep peritem project-discoverable project-sight projection-noproject query reading-position readingname rec108-cache-asof rec114-leg-earned rec118-reeval-earned rec120-onpoint-undetermined rec122-onpoint-choice rec155-session-routes rec169-consume rec174-supplyfetch rec203-idspaces rec207-bias-debt-settle reextract refuse-gate rendered-capture reopen resolution run-conditions rung-ladder search severedhomes skilldoctrine skillpack subresources textchain transcribe

civicos-ui: bound-sweep finder member-respect onpoint-choice passage-surface semantics-harvest surface-registry version-predecessor

Of these, T4 closed with d311-roster-affordances, owed-controls (N88, now T5-11), skilldoctrine, skillpack, rung-ladder (T4 REPORT 7), affordances (T4 REPORT 11), project-sight (T4 REPORT 6), semantics-harvest and surface-registry red (N70); every other red is new in T5 or a parallel-run artefact (re-run alone: below).

## Done

- `d470-catalog-census` 13/0: rows `1.34.0` (PROMOTION #3's print) and `1.35.0` (census 519, `e4d92a7e…`, source `32b7b0bb…` printed on the tranche tip after connections moved the pair predicates' code out of the file; PROMOTION #4 measured `18a61872…` before that); A5 reads 1.35.0; A1's literal-site floor 50 → 46, the seven departures C-26.1–C-26.7 named (bias).

## Channel to BOB

**Messages to BOB cannot be sent from this session.** `create_trigger` (mechanics §13) is refused: "caller session is at lineage depth 8 (limit 8); cannot spawn or re-arm further child sessions" (2026-09-27 09:22 UTC); BOB's session is not reachable by `SendMessage` either (it is not listed). Every REPORT, QUESTION and the COMPLETE are therefore in this record, pushed, for BOB to read on `job/T5/legacy-tests`. BOB: a future legacy-tests session should be started at a shallower lineage.

## Found in other modules (REPORT)

1. **connections (its factory, `connectionsOf`), with legacy-store's creation order — a product defect: rendering is dead on the tranche.** `src/store.mjs`'s constructor calls `connectionsOf(ctx, { env })` (store.mjs ~L778) before `captureOf(ctx, { env })` (~L797), and `connectionsOf` creates capture as `captureOf(host)` (`src/connections/index.mjs` L1329) with no `env`. `captureOf` memoises per storage, so the store's later `captureOf(ctx, { env })` gets the env-less instance: capture's `cap.env` is undefined, `rendererFor(undefined)` finds no renderer, and every `op=acquire` with `render: true` answers `RENDER_NO_RENDERER` (501); host-governor is created from it with `env: null` too (`governorOf(ctx, { env: opts.env ?? null })`), so the governor never reads its bindings. Measured: `browser-render` 48/0 at the T5 opening (`64386f16eb`), 28/20 on `tranche/T5` @ `7a2cc56e1f` (A1–A8g: `RENDER_NO_RENDERER`); with only `captureOf(host, { env: d.env ?? null })` in `connectionsOf` (a scratch tree, never this branch) 48/0. `rendered-capture` and `monitor-rendered` (red in the baseline) are being re-measured for the same cause. Fix is connections' (pass `d.env` to `captureOf`) or legacy-store's (create capture before connections); either restores it.
