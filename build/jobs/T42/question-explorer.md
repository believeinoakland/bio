# question-explorer (T42)

**Status** · session_01RQyJav79UQDg97kG4FrsPk · depth 2 · RUNNING until 2026-10-11T03:11:40Z (users' suites (P11)) · handled B1

## Completion (QUESTION-EXPLORER #2)

**Reading set** (mechanics §17). START measured 563 KB, an over-estimate (each used module's whole public part). What this entry needs, read whole myself: my requirements (8 KB); layer 6's row of `build/layers.md`; my plan entry T42-19; `draft-T42-reqs.md` N845; K2571; my module's code (`index.mjs`, `schema.mjs`, `checks.mjs`, 62 KB) and tests (`fixture.mjs` and the four test files, 65 KB). About 140 KB, under 300 KB: no worker, no summary. The entry touches one used service, `record-core`'s `declarePurge` (R21, R46), already called by this factory and unchanged in shape. `publish-schedule`'s factory read in an excerpt (its lines 118–140, the factory whole) for the pattern R15 names.

**Entry applied (T42-19, N845): R15.** `questionExplorerOf` now runs the instance's `migrate()` once at creation, after it is cached and before `record.declarePurge(...)` (`src/question-explorer/index.mjs`, the factory), as `publish-schedule`'s factory does. `migrate()` stays public and idempotent (`CREATE … IF NOT EXISTS`). The header names R1–R15.

**Tests.** `module.test.mjs` R15: a world built through the factory alone (`fixture.mjs` gains `world({migrate: false})`, which skips the fixture's own `p.migrate()` and records `tablesBefore`): every declared table exists, `exploreDue`, `exploreWake`, `exploreTick`, `find`, `findsFor`, `stopsFor` and both purges (by document, by question) run; `migrate()` twice over held rows changes no table (snapshot), and the factory asked again answers the same instance. Negative control (K874): the storage held none of the tables before the factory ran; and the same test run against the unchanged factory fails ("every table it declares to purge, created by the factory alone").

**Deferred:** none. **Found in another module:** none.

**Users' suites (P11), from `bio-plane/`:** scheduler 129/129; notice-producers 90/90; op-declarations 128/128; control-plane 216/216; plane 166/166; answer-envelope 28/29, its one red `test/m/answer-envelope/catalogue-end.test.mjs`:17 (`PROPOSAL_NO_RUN`, `NO_SUCH_PROPOSAL` pins) is the plan's inherited red rule 4 (6), red on this branch without my change too; system `migrate-released.test.mjs` MIGRATE_RESULT.
