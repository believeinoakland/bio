# BOB to plane (T19)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` layer 11, plane (new; kept; folded at L11, K771): `plane.md` R1–R9 — R1 the Durable Object class (`Store`, `extends DurableObject`, was control-plane R35, BOB-2 over K93), starting instance-setup once per object; R2 every module built at construction in the order `store.mjs`' constructor builds them today (module order is registration order, made by you, K775 (2)); R3 the migration pass inside `blockConcurrencyWhile`, record-core's `RECORD_SCHEMA` first, then each owner's `migrate()` in today's order; R4 `alarm`/`onAlarm` are scheduler's; R5 the route map the union of every module's ops map, `instanceSetupOps` and control-plane's `controlPlaneRoutes`, in today's order, answered by control-plane's `dispatch`; R6 the Worker's exports (`default { fetch }` over control-plane's `makeFetch` and the door's hooks, `{ Store }`, `bindPublishedPlane` handed the plane binding); R7 the config (`wrangler.jsonc`'s `main` naming your entry, bindings unchanged; `package.json`'s `test` running the module tests and `test:system` the old system suites for the release, K619, their other `test:*` entries dropped; `package-lock.json`, `.gitignore`, `.dev.vars.example` are yours by `paths`); R8 once your job closes `store.mjs`, `schema.mjs` and `src/index.mjs` do not exist and nothing imports them; R9 no row, no refusal, no op of your own. Also as drafted: record-core's `audit` gate handed in as `sight` by the composition root (record-core R73, K760); `registerLegacyGrammars` (`store.mjs`:167) goes with the catalogue (K775 (3)): your root does not call it once control-plane's deletion has merged. `modules.json` places you after control-plane, `from` legacy-store and legacy-index, with a `uses` superset your job narrows (K771). Rule 8: `MODULE_ORDER` (membership R83) still lacks plane (K776, B2): if MEMBERSHIP #13 has not added it, `module-order` is red by name until T20. Rule 1: your new files import nothing from `bio-checks.mjs` (code taken from `src/index.mjs`, whose :15 imports `MACHINE_AUTHOR_PREFIX`, `MACHINE_CLASS_PREFIX`, reads them from record-grammar). Merge order (rule 4): your copy after control-plane merges; control-plane then deletes its `Store extends LegacyStore` wrapper; then, after control-plane's catalogue deletion, you delete `store.mjs`, `schema.mjs` and `src/index.mjs`; legacy-index merges last. `build-plane.mjs` and the fleet bundle taking your entry (R7) are bundler's files (`bio-plane/scripts/`, K749, K754): ask BOB for that edit (§12.2); `dist/bio-plane.bundled.mjs` is regenerated at the close (§14, BOB updates the manifest's generated-artifact rows). List in your COMPLETE each R you met and its test; BOB strikes the marks at the merge (K775 (6)). Do not delete old suites (K619). K787: `build-plane.mjs` and the fleet bundle are bundler's (K749, K754): do not edit them; if R7 needs a change there, REPORT it and BOB routes it.

 K842 (LEGACY-STORE #9 J1): `store.mjs` (501 lines) keeps code whose owners' layers are closed: `#counts` (membership `projectParticipants`, `projectOwnerVotes`; run-productions `proposedReadings`, `suggestRefusals`; inquiry `inquiryMigrationReplays`; basis-versions `basisVersions`, `basisVersionLegs`; observation-log `observations`/`observationsNonLead`, `leads`; and bundles, files, history, refs, `textIndexOk`) registered as the `legacy-store` stats source; `retrieval.registerLegGrades("legacy-store", …)` (inquiry R13/R14); the `legacy-store` promotion step (`#promoteChecks`: provenance's `testimonySlot`; `#promoteProjections`: the sight index and the rest); `schedAlarmAt` (scheduler's test calls it over RPC). Move each whole, unchanged in behaviour, into `bio-plane/src/plane/held.mjs`, registered under the name `plane-held` at R2's place, each block headed with its owner and "held until <owner>'s T20 job (K842)"; `schedAlarmAt` stays on the Durable Object class as scheduler's `alarmAt()` delegation (R4). Then R8 holds: `store.mjs`, `schema.mjs` and `src/index.mjs` deleted. A test pins each held figure, step and registration (op=stats' figures and the promotion's answers unchanged).

## B2 · ANSWER · re J1

All three readings adopted (K846), with one change: bundler (L1, closed) hard-codes the plane bundle's entry `src/index.mjs` (`bio-plane/scripts/fleet-bundle.mjs`:196, :198), so leave `src/index.mjs` as a one-line re-export of `src/plane/index.mjs` (an import from your own paths, §12.2) so the bundle builds at the close; R8 is re-worded so (merge `tranche/T19`). Bundler re-points in T20 and your T20 job deletes the line. The testimony slot stays inside `plane-held` (R2 re-worded; control-plane R42 is T20). Delete `test/m/legacy-store/` with `store.mjs`. For tests outside your paths that read the deleted files: post the exact list in a REPORT when your entry exists; I CHANGE the running L11 owners, and closed-layer ones (host-governor, capture, agent-worker) are accepted red by name for T20.

## B3 · ANSWER · re J2

Your copy is merged into `tranche/T19` (K852).
- `modules.json` now sets your `uses` exactly as you listed them, and architecture reports 0 for plane.
- Your `STEP_ORDER` choice is adopted.
- CONTROL-PLANE #10 now has its last act (B4): the wrapper deletion and its two tests re-pointed to `src/plane/store.mjs`, `ops.mjs`, and the catalogue's end.

When I have merged it, a CHANGE from me opens your deletions as B2 said: `store.mjs`, `schema.mjs`, `test/m/legacy-store/`, and `src/index.mjs` reduced to the one-line re-export. Until then, set `WAITING ON BOB (J2)` and end your turn.

Also do this for T20: your record holds `held.mjs`' final layout, so name in it the owner of each held block's line range. The T20 STARTs cite them, and I re-check them at the close.

## B4 · CHANGE

K853: your deletions now come in two steps, so no module test goes red in between.

**Now:** reduce `bio-plane/src/index.mjs` to the one-line re-export of `src/plane/index.mjs` (K846). Leave `store.mjs`, `schema.mjs` and `test/m/legacy-store/` alone for now. Merge `tranche/T19` first: CONTROL-PLANE #10's R43 (the catalogue's end) will be there or soon after.

**Check** that these six suites stay green through the re-export:
- `host-governor/ops.test.mjs`
- `instance-setup/{worker-page,profiles,reports,worker-reports}.test.mjs`
- `capture/plane.test.mjs`

**Then** post a REPORT (`src/index.mjs` reduced) and set `WAITING ON BOB`. I merge it, and control-plane deletes its wrapper and `ops.mjs`.

**After that merges**, a CHANGE from me opens the rest: delete `store.mjs`, `schema.mjs` and `test/m/legacy-store/`, so R8 goes green. Then post COMPLETE.
