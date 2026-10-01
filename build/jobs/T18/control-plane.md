# control-plane (T18)

**Status** · session_0186jCyJmRTyxZqB9kJXtScm · depth 2 · COMPLETE · handled B10

## Completion (CONTROL-PLANE #9)

**Entries applied** (`build/plan/current.md` layer 11, control-plane; B1–B10):
- [x] **The split's deletion (K624 (1), (2)).** `ops.mjs` is now legacy-index's 4-line act-gate re-export (`decorateAct`, `ACT_GATE` from op-declarations); every table is read from `op-declarations`. The admission path of `index.mjs` (`classify`, `scopeFor`, the namespace gates, the agent credential's resolution, confinement and task scope, `resolveSession`, `sessionOpGate`, the admission region, the bearer fences, the mint's declarations and secrets) and its rows in `checks.mjs` (C-38, C-78, C-29.6–.10, C-32.17, C-64.4) are deleted; the door calls `admission`'s `namespaceGate`, `aiCredentialPresented`, `confinedNamespaceGate`, `pinnedNamespaceGate`, `admit`, `bearerFence`, `projectCreationGate`, `aiCredentialMint`, `reviewGrantSecret` and `readerOf` in R28's order, answering each `{status, body}` as given and a silence as R23's. Kept for legacy-index alone (`src/index.mjs`' arms, its imports unchanged): `caseReader` (a 4-line adapter over `readerOf`, the silence in the shape those arms read) and the re-exports of `SCRATCH`, `NAMESPACES`, `classify`, `scopeFor`. Tests naming the moved Rs deleted (R3–R14, R19, R31, R34); `admission.test.mjs` is now `gates.test.mjs` (R15, R16, R28). Module: 3,268 lines (`index.mjs` 2,590).
- [x] **§1a, N245, N272, N414, K704, K717, K676 (1), K669's C-74/C-52:** `CHECK_FAMILIES` (`families.mjs`): the catalogue, every module's families in the module order (text-chain's, acquisition's, connections' `checks.mjs` and `themes.mjs`, content's, run-rules' in place of `ai-runs/checks.mjs`, action-clocks' `ACTION_CLOCK_CHECKS`, action-plans', monitoring's `MONITORING_CHECKS`, instance-setup's, admission's), then its own; each code once (the first translated row); `dec49Row` reads it. Totality test (`families.test.mjs`): every `*_CHECKS` row any plane file of any module exports is reached, with a negative control per dropped file.
- [x] **R41 (K664, K674 (1), N157's plane side):** the untargeted `op=affordances` answer gains `fences` (`machineFences(CHECK_FAMILIES)`) and `pack` (`renderPack` over the answer with its fences); a render that throws answers `pack: null`, `pack_absent`.
- [x] **R39 (K621) and ✱ C-61 (K636):** `op=purge`'s confirm gate at the door before the store; `REQUIRED_ARGUMENT_CHECKS` moved from the catalogue into `checks.mjs` (`where` re-pointed, awaiting stamp) with its raiser `requiredArgument`; `src/index.mjs`' copy and purge arm deleted, `requiredArgument` imported from here (§12.2). Marks met: **R39**, **R41**.
- [x] **N13 (K723 A):** the store door's `Store` constructs queue (`migrate()`) then tasks; `controlPlaneRoutes` dispatches `queueOps`, `tasksOps`, `affordancesOps` (lazily, as sources'); `store.mjs` loses its affordances, queue and tasks imports, construction line, spreads and `affordancefacts` arm, `schema.mjs` its `QUEUE_SCHEMA` (the architecture check's four standing failures clear: whole product 0); whoami's vocabulary is `Membership.CAPABILITIES`.
- [x] **N402, N413, K675 (4), K683:** `members-pin.test.mjs` pins agent-worker's `PLANE_OPS` and ocr-worker's against the op table (presence, `mutating`, member reach), every write an AI-run act or plan mode's (`PLAN_RUN_SCOPE.writes`, `optionpropose`), the sub-session scope reads only, `search`/`basisversions`/`versionchain` member-class reads, and both `NAMESPACES` equal to the gate's; plus a drive through the door.
- [x] **N336 (K723, K724):** `PLANE_LIMITS` (`{subrequests: 10000}`) and `PLANE_LIMITS_STATEMENT` (`"bio-plane-limits/1 subrequests=10000"`) on the door (`makeFetch(...).limits`, `.limitsStatement`), `PLANE_LIMITS` re-exported from `src/index.mjs` (a string cannot be a Worker entry's export, B9); pinned to `wrangler.jsonc` (`limits.test.mjs`); the statement checked present in an esbuild bundle of `src/index.mjs`.
- [x] **K701, K711, K727:** action-plans', action-clocks', actions' and filings' (`communicationprepare`, `templatesave`, `templates`) stamps through op-declarations' lists; `optionpropose`'s `proposer` and `principal` (`stamps-action.test.mjs`).
- [x] **N407 (B7):** the door's share: `op=publishpreflight` carries `aiCred` (`{tokenId, principal}`, never the value) beside the viewer for an agent caller; `aiCred` joins the stamps deleted from every caller.
- [x] **N419:** `doorbell.test.mjs` asserts capture's `PULL_WITHIN_FAILED_DETAIL`; `pull.mjs`' `promoteOrFault` comment re-worded.
- [x] **K669:** named, not changed: R21 and R26 hold a module's refusal at its handler's status (J1).
- [x] **Converts** (`converts.test.mjs`): `rec173-migration-replay` (R16 over-strictness, N3b, N5b, the rule-2 exemption), `d543-instant-precision` (`inband.date` = `last_change.at`), `reviewcopy` (`op=casedocument` by secret, the digest alone), `textchain` (`op=image` carries the chain). Old suites not deleted (K619).

**Rows awaiting stamp (T19):** C-61.1 (moved to `src/control-plane/checks.mjs`, `where` `src/control-plane/index.mjs requiredArgument > is-required-argument`). Deleted here as admission's copies hold them: C-38.1–.8, C-78.1–.3, C-29.6–.10, C-32.17, C-64.4.

**Proposed wordings (BOB's):** R20 gains "`op=reviewcopy`'s in-band `date` is the copy's `last_change.at` as the store states it" (d543); R17's stamp list gains `aiCred` (N407); `op=image` carrying the chain needs no new R (R21: a forwarded answer is the handler's).

**Deferred:** nothing of this module.

**Found in other modules** (REPORTs J2, J3; and):
1. **case-authoring** (N407's other half): its `publishpreflight` route passes `viewer: q("viewer")`; to hold an agent to ratification R18's fences it reads `aiCred` too: `viewer: q("aiCred") ? { stamp: q("viewer"), aiCred: JSON.parse(q("aiCred")) } : q("viewer")`.
2. **Duplicate codes** across progressions, intent, reevaluation (J2 (2)).
3. **Generated artifacts stale (§14):** the plane bundle (`src/index.mjs`, `store.mjs`, `schema.mjs`, the catalogue and control-plane changed); agent-worker's and ocr-worker's take no control-plane input. I rebuilt none.
4. Old suites broken by the split, unrun (K653): those importing `control-plane/ops.mjs`' tables or the deleted admission functions from `control-plane/index.mjs` (e.g. `test/daemon-token`, `aicredential`, `fence`, `system/d270-refusal-truth`), and `civicos-ui/test/plane-refusal-wire.mjs` (parses `MODULE_CHECK_FILES`).

**Tests and checks** (on `job/T18/control-plane` after merging `tranche/T18` @ B10):
- `node --test test/m/control-plane/`: tests 85, pass 85, fail 0.
- `node --test "test/m/**/*.test.mjs"`: tests 4221, pass 4201, fail 0, todo 20.
- `format`: 82 modules, 77 requirements files; 0 failures.
- `architecture control-plane`: 26 product files, 137 relative imports; 0 failures (whole product: 0 failures).
- `coverage control-plane`: 26 of 26 live requirement ids named by a test; 0 failures.
- `ownership control-plane tranche/T18`: 28 files changed; legacy-index 2 added (the re-export of `PLANE_LIMITS`, the import gaining `requiredArgument`), 56 removed; legacy-store 0 added, 18 removed; legacy-checks 0 added, 45 removed; 0 failures.

Size (session_0186jCyJmRTyxZqB9kJXtScm): test runs 48, module lines 3268

## J1 · QUESTION

Two points, each with my best reading; I carry on with the rest meanwhile (none blocks what I do next).

1. **Uses.** My entries make control-plane import modules it does not declare, which the architecture check refuses: `text-chain` (`textchain.mjs`' `TEXT_CHAIN_CHECKS`, N414), `acquisition` (its `checks.mjs`, the plan's "acquisition's and run-rules' tables"), `monitoring` (`MONITORING_CHECKS`, K717) in `CHECK_FAMILIES`; and in the tests, `agent-worker` (`PLANE_OPS`, `NAMESPACES`, `SUBSESSION_OPS`, K683) and `ocr-worker` (`contract.mjs`' `PLANE_OPS`, `NAMESPACES`, N413) for the N402 pin. All are earlier in the order. Best reading: you add the five to control-plane's `uses` in `modules.json` on `tranche/T18`; I merge it before my checks.

2. **K701 (filings' `communicationprepare`, `templatesave`, `templates`).** Since the split, an op's spec is `op-declarations`' (its R2), not mine, and its layer-11 entry names `communicationprepare` but not `templatesave` or `templates`. Best reading: op-declarations writes the three specs (its paths); I stamp them (R17, R29): `communicationprepare` `preparer` and `viewer` (filings R23), `templatesave` `author` and `viewer`, `templates` `viewer` (filings R26), by the action layer's expressions, and test them through the door once the specs exist. If op-declarations merges without the two, I report it and stamp what exists.

Also, for your record (K669, no answer needed unless you disagree): `op=linkproject`'s refusal reaches the caller at 200 because connections' handler answers it so (`json({ok: true, ...p.result})` in `connections/ops.mjs`, the route's own `{ok: false}` overriding the spread). The door keeps a handler's answer and its status (R21) and decorates a refusal at either level (R22); the store's envelope is `{ok: true, result}` for a route's answer (R26). So R21 and R26 hold it as it is; the status of a module's refusal is the module's handler's to choose (connections), not the door's.

## J2 · REPORT

Found for other modules, while applying R41 and `CHECK_FAMILIES` (both pushed on `job/T18/control-plane`):

1. **affordances** (its job is running): `test/m/affordances/plane.test.mjs`:276 (R17) pins the untargeted `op=affordances` answer's keys exactly (`capture_acts, catalog, detail, set_acts, target, vocabularies`). With R41 the door adds `fences` and `pack` (K585 (1): control-plane's decoration, not an R17 change), so that arm goes red once control-plane merges. Its re-point: R17's keys are the handler's and the door's two are allowed beside them (e.g. assert the six are present and nothing else but `fences`/`pack`). Not mine to edit.
2. **Codes held in two module tables with different rows** (a DEC-49 ambiguity; `dec49Row` now resolves in module order, the catalogue first, where it was alphabetical by file): `NO_SUCH_PROGRESSION` (progressions C-100.11, intent C-111.4), `BAD_STAGE` (C-100.14, C-111.6), `NO_REASON` (progressions C-100.18, reevaluation C-113.22), `BAD_REASON` (C-100.21, C-113.17). A forwarded refusal with one of these and no `check` of its own now gains progressions' row where it gained intent's or reevaluation's. The owners (intent, reevaluation, progressions) would each need a code of their own; recorded for the guard's arm A, not fixed here.
3. Pre-existing on `tranche/T18`, not mine: `test/m/affordances/catalogue.test.mjs` "R3 R7 R12: layer 9's 22 mutating ops …" fails before my change too.
4. `civicos-ui/test/plane-refusal-wire.mjs`:62–70 parses `const MODULE_CHECK_FILES = [...]` out of `control-plane/index.mjs`' source; that list is now `CHECK_FAMILY_FILES` in `control-plane/families.mjs`. An old suite (K619): unrun, its re-point at the release.

## J3 · REPORT

N13 is applied on `job/T18/control-plane` (3 commits since J2): the store door's `Store` constructs queue (`migrate()`) then tasks, and `controlPlaneRoutes` dispatches `queueOps` and `tasksOps`; `store.mjs` loses its queue and tasks imports, construction line and spreads, and `schema.mjs` its `QUEUE_SCHEMA` import and use (§12.2). The architecture check's standing failures fall from four to one (store.mjs → affordances, which goes with B3 (a) once affordances merges).

Found for another module: **queue's own test fixture** (`test/m/queue/world.mjs`:46) builds its tables from legacy-store's `SCHEMA` and never calls `queueOf(...).migrate()`, so with `QUEUE_SCHEMA` gone from `schema.mjs` 55 queue tests fail `no such table: finding_dispositions` once this merges. Its re-point is one line in queue's fixture: call `q.migrate()` (queue R36 makes its own tables) after `queueOf(host, …)`. Not mine to edit; I hold the schema edit as the plan words it. Tell me if you would rather I keep `${QUEUE_SCHEMA}` in `schema.mjs` until queue's fixture moves (the architecture failure then stands).

Also, on B3 (b): a Worker entry module cannot export a string — workerd refuses a named export that is not a function or an object at startup (measured and recorded at `agent-worker/src/harness.mjs`:332–336). So `src/index.mjs` re-exports `PLANE_LIMITS` (the frozen parsed object; the entry already exports `PUBLISHED_TOKEN_HASHES`, a Set), and `PLANE_LIMITS_STATEMENT = "bio-plane-limits/1 subrequests=10000"` is control-plane's, carried on the door (`makeFetch(...).limitsStatement`), so the bundle keeps it: checked with esbuild over `src/index.mjs` (the statement's text is in the bundle). Pinned to `wrangler.jsonc` by `limits.test.mjs`.

## J4 · COMPLETE

Complete, on job/T18/control-plane (merged with tranche/T18 @ B10). Every entry applied: the split's deletion (admission's gates called in R28's order, op-declarations' tables read; ops.mjs now legacy-index's 4-line act-gate re-export), CHECK_FAMILIES with its totality test, R41's fences and pack, R39 and the C-61 move (✱), N13 (queue, tasks and affordances maps; architecture 0 failures product-wide), the N402/N413 pin, N336's PLANE_LIMITS_STATEMENT on the door (re-exported object from src/index.mjs, B9), the action layer's stamps (K701, K711, K727), N407's door share (aiCred on publishpreflight; case-authoring's reading of it is its one line, in my record), N419, and the four converts. Marks met: R39, R41. Awaiting stamp (T19): C-61.1. Module 3,268 lines. Tests: control-plane 85/85; test/m whole 4221, 4201 pass, 0 fail, 20 todo. format, architecture, coverage (26/26), ownership: 0 failures each. Details, proposed wordings and findings for other modules in my record's Completion. installer can pin against PLANE_LIMITS_STATEMENT now.
