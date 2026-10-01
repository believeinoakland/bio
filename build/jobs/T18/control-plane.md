# control-plane (T18)

**Status** · session_0186jCyJmRTyxZqB9kJXtScm · depth 2 · WORKING · handled B6

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
