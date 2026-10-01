# plane (T21)

**Status** · session_01HoVP9i8qUseArUa5tUcoYL · depth 2 · RUNNING until 2026-10-01T22:08:22Z (node --test test/m) · handled B3

## Completion

**Entries applied** (B1, B2):
- (1) N463: `bio-plane/src/index.mjs` deleted. Re-scan of `bio-plane/`, `agent-worker/`, `newgroup/` and the other members: no read or import left once affordances' `test/m/affordances/plane.test.mjs` re-pointed (K1001); the rest is provenance prose or the members' own `src/index.mjs`. R8's test re-keyed (`test/m/plane/worker.test.mjs`): the three legacy files do not exist and no file under `src/`, `test/` (module tests and kept suites) or `scripts/` imports them, with a negative control on the scanner. `build/modules.json`'s plane `paths` still name `bio-plane/src/index.mjs` and R8's words still describe it: BOB corrects both at the merge (B2).
- (2) R11 (K921, K927, K989, K991): `src/plane/store.mjs` builds `localFactsOf(ctx)` at the head of the layer-9 block (before `conformanceOf`) and `filingTemplatesOf(ctx)` after `actionClocksOf` and before `filingsOf`; each factory creates its tables and declares them to purge (K23), filing-templates also its mint seed and its take of the library `filings` R26 kept. `#migrate` runs `localFacts.migrate()`, `filingTemplates.migrate()` and `migrateFromFilings()` after intent's, before REC-143's second pass (all idempotent). `queueOf(ctx, {env, filingTemplates, localFacts})` (queue's `PRODUCER_DEPS`, K1004). `localFactsOps` spread beside `actionClocksOps`; `filingTemplatesOps` after `filingsOps`, so `op=templates` is filing-templates' (K991). Figures: neither module registers a count; `op=stats` and purge's proof unchanged, their tables purged as declared.
  - Note: conformance, actions and standards are first built earlier than the layer-9 block (through `actionsOf` at the reevaluation step, and standards with `filingsOf`), so "before standards and conformance" holds for the block as placed (B1), not for the first construction; registrations are ordered by the modules' order (R2) regardless, and local-facts reads none of them.
- (3) N468: `src/plane/stats.mjs` (owners' figures registered by plane under each owner's name, order pinned), `src/plane/store.mjs` (STEP_ORDER and promotion comments), `test/m/plane/stats.test.mjs` (header, `WIRE`, two titles), `step.test.mjs` (header), `store.test.mjs` (R2/R10 title) re-worded; pinned values kept as pinned.
- (4) N469: `held.mjs` moot. Re-scan of my paths: two notes in `wrangler.jsonc` named the deleted `index.mjs` as live code (`OCR_WORKER`'s reader, the capture-limit read): re-pointed to `extraction/pipeline.mjs` and ratification's `ops.mjs`. Provenance notes kept.

**`not yet met: T21` marks met:** plane R11.

**Deferred:** none.

**Found in other modules / for BOB:**
- Generated artifact stale (J1): `bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json` (`not_product`); not regenerated. The entry builds: esbuild over `src/plane/index.mjs`, 0 errors, 6,890,669 B (scratch).
- `test/m/queue-producers/` "R8, R15–R18 (K728): a caller's fakes … reach queue-producers" failed on `tranche/T21` before queue's re-merge (K1004) as on my branch; green after merging `tranche/T21` @ 6a8aa2636e.
- `test/m/bundler` (or the tmp-tree test) "R2 a tree a test left read-only is removed …" failed once on the baseline worktree only (environment), not on my branch.

**Tests and checks** (on `job/T21/plane` after merging `tranche/T21` @ 6a8aa2636e unless said):
- `node --test test/m/plane/`: tests 33, pass 33, fail 0. New `compose.test.mjs` (R11: tables and purge, construction order, an older store's migration and filings' library taken once, every new op through the door, queue reading the composed instances for queue-producers R20/R21).
- Users and neighbours: affordances 138/0 fail, control-plane 102/0, op-declarations 21/0, queue 80/0, queue-producers 49/0, local-facts 22/0, filing-templates 46/0.
- Whole `test/m` (before the last merge, tranche @ e41621b7a7 era): tests 4815, pass 4794, fail 1, todo 20; the tranche itself: 4810, 4788, fail 2; no new red (the one fail was queue-producers' above, fixed by K1004).
- `checks/format.mjs`: 86 modules, 84 requirements files; 0 failures. `architecture.mjs … plane`: 17 product files, 172 relative imports; 0 failures. `coverage.mjs … plane`: 11 of 11 live ids; 0 failures. `ownership.mjs … plane tranche/T21`: 11 files; 0 failures.

Size (session_01HoVP9i8qUseArUa5tUcoYL): test runs 11, module lines 471

## J1 · REPORT

Generated artifact staled (manifest, "Generated artifacts"): `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`), by my changes to `bio-plane/src/plane/store.mjs` and `stats.mjs` (c7163f1544) and the deletion of `bio-plane/src/index.mjs`. Not regenerated. The entry builds: esbuild over `src/plane/index.mjs` (the `planeMember` entry) into my scratch, 0 errors, 6,890,669 B.

Also for your merge: `build/modules.json`'s plane `paths` still name `bio-plane/src/index.mjs` (deleted; B1 (1)), and R8's words still say `src/index.mjs` "is only a one-line re-export … until bundler's T20 job re-points `planeMember`"; my R8 test now states that the file does not exist.

Order: my branch deletes `src/index.mjs` while `test/m/affordances/plane.test.mjs`:23–:24 (AFFORDANCES #12, not yet merged) still reads it; that test is red on my branch until affordances' re-point merges, which comes before mine (rule 2). I merge `tranche/T21` and re-run before COMPLETE.
