# T5 · retrieval — job record

**Session** RETRIEVAL #1, `session_01Fv7FCJzWqLPnaNpjhg33rD`, on `job/T5/retrieval` (from `tranche/T5` @ `f05090bcad`). Process: civicos-process `main`, `roles/JOB.md`, mechanics §6, §12.2, §13, §14, §16. BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T5`.

**Status** · IN PROGRESS. Entry T5-10: extract `retrieval` from `legacy-store` and `legacy-checks` per `build/extraction/retrieval.md` and `build/requirements/retrieval.md` (the frontier included, K80), with D-672, D-682, D-724 and every requirement marked not yet met. Waiting on BOB for Q1 only; building everything else on the stated reading meanwhile.

**Read whole:** `roles/JOB.md`, `PROCESS-MECHANICS.md`, `build/manifest.md`, `build/layers.md`, `build/plan/current.md`, `build/requirements/retrieval.md` (both parts), `build/extraction/retrieval.md`, the public parts of `query-language`, `observation-log`, `membership`, `record-core`, `promotion`, `provenance` (and the Provides of `extraction`, `capture`, `connections`, `entities`, `content` that the Uses name), rulings K3, K4, K6, K23, K31, K61, K63, K64, K72, K73, K75, K78, K80, K90, K92, K96, K102, K105, K109, K126, K140; the moved code in `store.mjs` and `bio-checks.mjs`; the built work on `land/worker/D-672`, `D-724`, `D-682`.

## Questions to BOB

- **Q1 · K75 (3) and where the projection columns live.** K75 (3) rules that the projection columns on record-core's `bundles` move to a table of retrieval's own keyed by `bundle_id` "at retrieval's extraction". But every statement `query-language` compiles reads them as `b.<column>` of `bundles b` and keys the text index through `b.fts_id` (`query.mjs`: `ALL`, `metaSql`, every `JOIN bundles b ON b.fts_id = s.fid`, `FIELDS`' columns), and query-language is being extracted concurrently (T5-9) with no entry for it; the strength, inquiry and action columns (`inquiry_*`, and the six `action_*` of R2) sit beside them and are read the same way. Moving the table in this job alone breaks every search; moving it properly is a coordinated change to query-language's statement shapes (a join on every statement, which probe 2's measurements chose against) plus the legacy writers of the `inquiry_*` columns. **Best reading, which I am building:** the columns stay on `bundles` for T5; retrieval, not legacy-store, declares and adds its 22 projection columns, `fts_id` and their indexes (its `migrate()`), writes them only through its registered promotion projection (R1) and `reproject` (R3), and the move to its own table is an entry for `next.md` against `retrieval` and `query-language` together. Record-core's R37 then wants a line saying these columns are retrieval's (written only by it) — or you rule the move now and tell query-language.

## Answers from BOB

(none yet)

## Decisions made in the module (P17: recorded, not asked)

- **observation-log is not yet merged.** Until its CHANGE, `retrievalOf(ctx, deps)` takes `deps.observation` (its R9–R13, R18–R21 services and the vocabulary K78 (3) moves out of `airun.mjs`); `legacy-store` passes an adapter over its own methods and `airun.mjs`'s constants (K120's pattern, as content did with extraction). On the CHANGE I switch to observation-log's factory.
- **Layer-6 and layer-9 parts arrive by registration** (K75 (2), K80, K96): `registerActionFacts` (R53, `actions`), a leg-grade resolver (R12, `strength`), the single-bundle `projection` decorations (`actions`, `inquiry`, `ai-runs`), and the hidden-run tail of R39 (`ai-runs`); `legacy-store` registers each until its owner is extracted.
- **R33, the text index's per-bundle purge.** `bundles_fts` gains an UNINDEXED `bundle_id` column (rebuilt in place at start, rows copied, never re-indexed), so it is declared keyed by `bundle_id` in record-core's R46 form and a bundle's purge removes its row without the store's own delete. `selections` and `selection_items` are declared whole-store only: a per-bundle purge must leave an enumerated item for R19 to report as `drift.purged`.

## Found in other modules (REPORT)

(to be sent with COMPLETE)
