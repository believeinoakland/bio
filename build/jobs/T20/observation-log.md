# observation-log (T20)

**Status** · session_01UacP3DwJUSWFBSvrTh4tEa · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

Job done on `job/T20/observation-log` (pushed, `e674376303`; ready to merge early, before plane's L11 job).

**Entries applied** (`build/plan/current.md` L5, B1):
- R32 (K842, K861; plane R10): `ObservationLog.COUNT_KEYS` (`observations`, `leads`, frozen) and `counts(hid)`. Each figure is the `count(*)` statement in plane's held copy: `observations` counts every row of `observation_log`, lead looks and run rows included, and `leads` counts every row of `leads`. Neither table names a bundle (R23), so `hid` is taken to fit R63's shape and never read, and every `hid`, null included, counts whole. A table that cannot be read is left out, so R63 answers it null, never zero. `observationsNonLead` is not touched and stays plane's (K861 (2)). Observation-log registers nothing itself. For plane, the registration is `registerCounts("observation-log", [...ObservationLog.COUNT_KEYS], (hid) => o.counts(hid))`, where `o` is `observationLogOf(ctx)`. **R32 is still marked not yet met:** it is met once plane registers it.
  Test: `bio-plane/test/m/observation-log/figures.test.mjs`, 3 tests, each named R32, on the module's own fixture:
  - (1) The source alone, checked against plane's copy's statement for 7 viewers (never sent, founder, machine, member inside the hidden project, member outside it, a lead's author outside it, refused). It also checks that new rows move the figures.
  - (2) An unread table is left out and R63 answers it null. Counting writes nothing.
  - (3) Registered through the real record-core R63 under `observation-log`. Purge's proof (`proofCounts`) counts the whole log, lead rows included (6), and the leads (2). `op=stats` carries neither key, for every viewer, with and without capacity. `op=purge` of one project leaves both figures and the whole-store purge takes all. A second registration is refused `COUNTS_DECLARED`.
  - Negative control: with `observations` made to skip lead looks, tests (1) and (3) fail. Restored.
- K882 (K820's share): the `src/observation-log/checks.mjs` header now says what holds. These rows are the only copy (the catalogue is deleted, K858), `run-rules` builds its map and `translationOf` from them (its R11), and `inquiry-grammar`'s `leadLegFindings` reads `LEAD_ID_RE` from here. `airun.mjs` and "until T19's layer 1" are gone.
- Own module: the `index.mjs` header now names R1–R32 and the exported figure source.

**Deferred:** none.

**Found in other modules (REPORT):**
1. **Generated artifact staled by this change:** `agent-worker/dist/agent-worker.bundled.mjs` / `.bundle.json` (owner `agent-worker`). Its manifest hashes `bio-plane/src/observation-log/checks.mjs` (through run-rules), whose comment changed. The bundle's bytes are unchanged: `fleetbundles.test.mjs` reports a fresh build byte-identical, and only the input hash moved. Regenerate at layer close (`node bio-plane/scripts/bundles.mjs`). I did not write it (§14).
2. Stale words in this module's own published text, left as they are because they are outward vocabulary, not comments: `CONDITION_KINDS["render-deferred"]` (`vocabulary.mjs`:1400–1402) ends "LIVE: store.mjs #conditionsRenderDeferred". `store.mjs` is deleted; the producer is now `queue-producers` (`src/queue-producers/index.mjs`:1825). `queue` re-exports this table, so re-wording it changes a sentence a surface may render. If you want it re-worded, say so (a CHANGE here) and I will do it. Comment-only cousins: `vocabulary.mjs`:1592–1595 name `store.mjs #aiRunSearchState`, now `ai-runs`' (`src/ai-runs/index.mjs`:394), and the `vocabulary.mjs` header still says "Written here from `airun.mjs`" as provenance, which may stay.
3. Red on the base, not from this change: the two known `MODULE_ORDER` tests that assert `legacy-store`'s place, `bias/promotion.test.mjs`:134 (R23) and `ai-runs/hidden-notices.test.mjs`:149 (R43). Their L5 and L6 jobs carry them (K881).

**Tests and checks run:**
- `node --test bio-plane/test/m/observation-log/`: tests 59, pass 59, fail 0.
- Users that read this module's `checks.mjs` and plane: `test/m/plane`, `test/m/run-rules`, `test/m/inquiry-grammar`: tests 67, pass 67, fail 0.
- Whole `bio-plane/test/m`: tests 4608, pass 4586, fail 2 (item 3), skipped 0, todo 20.
- `bio-plane/test/system/fleetbundles.test.mjs`: agent-worker stale-input arms fail (item 1); the byte-identity arm passes.
- Layer tests: none named in the manifest.
- `node checks/format.mjs`: 84 modules, 82 requirements files; 0 failures.
- `node checks/architecture.mjs … observation-log`: 14 product files, 49 relative imports; 0 failures.
- `node checks/coverage.mjs … observation-log`: 32 of 32 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … observation-log tranche/T20`: 4 files changed by observation-log; 0 failures.

Size (session_01UacP3DwJUSWFBSvrTh4tEa): test runs 6, module lines 3123
