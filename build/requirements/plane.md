# plane — requirements

**Status** · DRAFT by a worker for BOB #80, 2026-10-01, on `tranche/T19` before layer 11 starts, for BOB's review; a new module by K617 and K653 BOB-2 (`draft-T19.md`, layer 11: "plane (new; last product module of layer 11, after control-plane; `from: ["legacy-store", "legacy-index"]`)"), placed directly after `control-plane`, with no change to any requirement's meaning. It holds what is left once T19 empties the catalogue, `store.mjs`, `schema.mjs` and `src/index.mjs`: the composition root (`build/extraction/legacy-store.md`, what is left "for plane"; `build/extraction/legacy-index.md`, the config "to plane") and the plane's deployment config, re-assigned from `legacy-index` at this fold. R1 is `control-plane` R35, moved without change of meaning (marked "was") and retired there with a pointer here. R2–R6 state today's behaviour of `store.mjs`' constructor, `#migrate`, `alarm`/`onAlarm`, `routes` and `src/index.mjs`' exports, which no requirement held, as a module's own (rule 3's later-new case: `control-plane` and `legacy-store` merge their seams early, this module copies, `control-plane`'s wrapper goes, then this module deletes the three files). R7 is the deployment config as `draft-T19.md` (adopted, K653) sets it. Every id is not yet met until PLANE #1 (T19 layer 11). Layer 11. Code: `bio-plane/src/plane/` (none yet), `bio-plane/wrangler.jsonc`, `package.json`, `package-lock.json`, `.gitignore`, `.dev.vars.example`; `from: ["legacy-store", "legacy-index"]`.

**Size (P6).** About 250 lines written and moved (`draft-T19.md`: ~170 of `store.mjs`' composition root, the Worker's entry, the class from `dispatch.mjs`), and the config re-assigned.

## Public

### Purpose

The instance's composition root. It builds every module on one Durable Object's storage, in the modules' order, runs their migrations before any request, hands the alarm to `scheduler`, assembles the one route map from every module's ops map and passes every store request through `control-plane`'s door, and exports the Worker's entry and the class the deployment config names. It holds no construct of its own: no table, no check row, no op and no answer.

### Provides

**The Durable Object class** (`Store`)
- **R1** (was `control-plane` R35) The Durable Object class the instance exports is this module's (`Store`, `extends DurableObject`). At construction it starts `instance-setup` once per object (`instanceSetupOf(ctx, env).start()`), and `instance-setup`'s routes (`instanceSetupOps`) are part of R5's route map. So every store route passes the one frame, `control-plane`'s `dispatch` (its R26's body read and envelope, R27's existence read and R25's catch). No module answers a store route outside it.
- **R2** At construction, before any route or alarm can run, every module is built on the object's storage in the order `store.mjs`' constructor builds them today, so every listener, promotion step, count, grammar and fact a module registers at start is held before the first request, each slot ordering its registrations by the modules' total order (`membership` R83), never by construction order: record-core handed the evidence bucket (`env.CAPTURES`) and its key prefix (`<namespace>/captures/`, the namespace being the object's own name, `bio` or `scratch`, else `bio`); the testimony slot held inside the `plane-held` step (R10) until `control-plane` holds it (its R42, T20; K846); `queue` and `tasks` creating their tables (queue R36, tasks R8). A factory a module's `deps` are read from on its first call is built first with them, as today.
- **R3** The migration pass runs once per construction inside `blockConcurrencyWhile`, before any request: record-core's `RECORD_SCHEMA` first, then each owner's `migrate()` in today's order (`store.mjs`' `#migrate`), additive columns added before and after the tables as today (REC-143), so a store written by any earlier release opens; then `scheduler`'s `start`. A migration that throws leaves the object unanswering, as today; none is skipped.
- **R4** `alarm()` and `onAlarm(now)` are `scheduler`'s (its `alarm` and `onAlarm`), called as given; this module decides no wake.
- **R5** The route map is the union of every module's own ops map (the `membershipOps` pattern), `instanceSetupOps` and `control-plane`'s `controlPlaneRoutes`, spread in today's order, so each op reaches the handler it reaches today; a request is answered by `control-plane`'s `dispatch(req, {routes, membership})`. This module holds no route of its own.

**The Worker's entry**
- **R6** The Worker's module exports `default { fetch }`, `control-plane`'s `makeFetch` over the hooks the door takes (today `publicOp`, `gatedOp` and `publicInstanceGroup`, each the arms' owners' once their arms have moved), and `{ Store }` (R1); it hands the published read its plane binding (`bindPublishedPlane`, `public-read`'s), as `src/index.mjs` does today. No other export.

**The deployment config**
- **R7** `wrangler.jsonc`'s `main` names this module's Worker entry (R6), its bindings unchanged; `package.json`'s `test` runs the module tests and `test:system` the old system suites for the release (K619), the old suites' other `test:*` entries dropped; `build-plane.mjs` and the fleet bundle (`bundler`) take this entry.

## Private

### Uses

- `control-plane`: `dispatch`, `controlPlaneRoutes`, `makeFetch` and the door's hooks (R1, R5, R6); the testimony slot's registration (its R42).
- `instance-setup`: `instanceSetupOf` and its `start`, `instanceSetupOps` (R1, R5).
- `scheduler`: `alarm`, `onAlarm`, `start` (R3, R4).
- `record-core`: `recordOf` with the evidence bucket and prefix, `RECORD_SCHEMA` first (R2, R3).
- `public-read`: `bindPublishedPlane` (R6).
- Every module whose factory, `migrate()` or ops map today's composition root (`store.mjs`' constructor and `routes`, `src/index.mjs`, `dispatch.mjs`) reaches (R2, R3, R5), as `modules.json` lists them.

### Invariants

- **R8** Once this module's job closes, `bio-plane/src/store.mjs` and `bio-plane/src/schema.mjs` do not exist, `bio-plane/src/index.mjs` is only a one-line re-export of R6's entry until `bundler`'s T20 job re-points `planeMember` (K846), and no file imports them; no module's own requirement is answered here, save the held code R10 names.
- **R9** It writes no row, mints no refusal and answers no op itself: every answer is a module's, through `control-plane`'s door. No place is named in its behaviour or outward text.
- **R10** (K842) Until each owner's T20 job takes its share, `src/plane/held.mjs` holds, moved whole from `store.mjs` with their behaviour unchanged and each headed with its owner: the stats figures `store.mjs` registered as `legacy-store` (membership, run-productions, inquiry, basis-versions, observation-log and the bundle, file, history, ref and text-index counts), the leg-grade registration (inquiry R13/R14), and the promotion step `legacy-store` registered (provenance's testimony slot; the sight index and the rest of its projections), registered as `plane-held`. Each owner's job registers its share under its own name (record-core R63, retrieval's `registerLegGrades`, promotion's `registerStep`) and deletes it here; the file is deleted with the last.

### Satisfies

- `docs/architecture/BIO_System_Design.md` §3, construct 15 (distribution: one instance, one deployable plane) and §2 (the trustworthiness of the record: a store written before opens after).
- `docs/architecture/BIO_Distribution_v0_1.md` §6 (the deployment and its bindings).
- Bob's rulings K617, K653 BOB-2; `layers.md` ruling 2.

### Suggestions

- **Order of the work** (rule 3's later-new case, `draft-T19.md` rule 4): copy the class and the Worker's entry and merge early; `control-plane` then deletes `dispatch.mjs`' `Store extends LegacyStore` and its default forwarder; after `control-plane`'s catalogue deletion merges, delete `store.mjs`, `schema.mjs` and `src/index.mjs`, regenerate `dist/bio-plane.bundled.mjs`, and BOB updates the manifest's generated-artifact rows.
- **Tests.** Construction twice on one storage starts `instance-setup` once and migrates idempotently; an old store's tables open (R3); every op of today's route map is reached (R5); the Worker module's exports are exactly R6's.

## Open for Bob

None.
