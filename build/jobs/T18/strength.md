# strength (T18)

**Status** · session_013c7GEWiwQ1d3AtiM5gG6dd · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Two points on N137 (R23's cache table), both with my best reading, which I am building now.

(1) **`retrieval` is not in strength's `uses`** (`modules.json`, and the requirements' Uses list), but R23 has strength register its table with `retrieval` (R62, `registerField`). inquiry and basis-versions already declare `retrieval`. My reading: add `retrieval` (layer 5, earlier) to strength's `uses` in `modules.json` and to the Uses list ("`retrieval`: `registerField` (its R62), R23"). My factory imports `retrievalOf` for its default, so `architecture.mjs` fails until the line changes. Also in Uses, `promotion`'s `registerStep` now fills R13 (it is already listed).

(2) **`store.mjs`**: plan rule (8) lists inquiry and ai-runs as the layer-6 editors of `store.mjs`, not strength. But moving the cache means legacy-store's copy stops being written or migrated. Under START's "a move out of the store deletes the legacy copy in this job where `from` allows (§12.2)", I am removing: the four `addColumns` rows for `bundles.inquiry_capture_strength` / `_state` / `inquiry_connection_strength` / `_state`, with their comment (~store.mjs 636–650); the index loop over those two columns (~745–750); the `#writeStrengthProjection` call in `#promoteProjections` and its comment (~1725–1732); and the method with its comment (~2250–2303). Strength registers its own projection step with promotion (R13, promotion R39) and writes `strength_cache` (bundle_id PK, per-axis grade and state), which is declared to purge and registered with retrieval for `capture` and `connection`. On a store written before this change, the migration copies the values from the `bundles` columns once where they exist, so no answer changes (retrieval R62). The addColumns block sits next to inquiry's `inquiry_basis_count` row (store.mjs 651), which inquiry's N136 also removes: adjacent hunks, so whichever of us merges second may conflict. Please serialise us, or tell me to leave `store.mjs` to inquiry or legacy-store and keep only my side (then legacy-store would keep writing the dead `bundles` columns until L10).

## J2 · COMPLETE

**Entries applied** (`current.md` layer 6, strength). Code at `job/T18/strength`, merged with `tranche/T18` @ 61da100c01 (B2, K675 (2)).
- **`STRENGTH_STATES`** is now defined in strength (`arithmetic.mjs`, frozen, exported from `index.mjs`). This is a copy: the catalogue's copy stays, because `ratification/checks.mjs` still imports it. It re-points in layer 8, and T19 deletes the catalogue's copy (rule (3): held twice for one tranche, named here).
- **N411** (`index.mjs`:786, `is-strength-bar-grade`): `BAD_GRADE` no longer takes its verdict from a spread (`{ ...refusal(…), axis }`). The region's refusal helper now takes `extra`, and the site returns `refusal("BAD_GRADE", …, { axis })`. The answer is unchanged. The DEC-49 guard's print named this site before the change and does not now: `inheritedVerdicts` fell from 6 to 5, measured (control-plane's and basis-versions' shares remain).
- **N242's share** (`#refusePairComposed`): the `where` it named was already corrected by N184 (3) in T10. C-30.7 and C-30.8 name `refusePairComposed`. The guard's print on this tree has no strength finding except N411's, which is now gone: `refusePairComposed > is-pair-composed` resolves as 29L, 5 judged. Nothing further to do.
- **N137, R23's cache table** (K649 (6)): the cache moved from `bundles` to strength's own `strength_cache`: `bundle_id` PK, `capture_grade`, `capture_state`, `connection_grade`, `connection_state`, with the two grade columns indexed.
  - It is declared to purge by bundle; `group_strength_bar` stays exempt.
  - It is written by strength's own projection step with promotion (`registerStep("strength", {project})`, R13, promotion R39). That step runs after inquiry's, inside the one transaction. A bundle promoted as something other than an inquiry holds no row.
  - The table is registered with retrieval as the `capture` and `connection` fields (R62: `{strength_cache, bundle_id, capture_grade | connection_grade}`). The registration happens on the first `strengthOf(host, {retrieval})` call, which is the store's at boot. This follows basis-versions' pattern: a host whose strength is never given a retrieval (another module's test fixture) is not made to join retrieval's projection to every promotion. That was measured: with a default `retrievalOf(host)`, 198 tests of reevaluation, case-authoring, conformance, consequences and review failed on `no such table: bundle_projection`.
  - On a store written before the move, `migrateStrength` copies the four `bundles` columns into the table once, while the table is empty, so no search answer changes (R62).
  - Removed from `store.mjs` under §12.2 (B2): the four `addColumns` rows and their comment, the index loop, the `#writeStrengthProjection` call and the method with its comment. That is 83 lines removed and 2 added, both listed by the ownership check for review: line 536 `strengthModule(ctx, { retrieval })`, and a one-line pointer comment at 1705 where the call stood. `#promoteProjections`' local `isInquiry` is now unused there; it is legacy-store's to drop.
- **Converts** (T17 legacy-tests rows), each as requirement-named module tests:
  - `d216-sharing.probe`: crossed per-project bars (R14).
  - `publish`: the bar's source is the project (R14).
  - `testimonyaxis`: per-axis figures with testimony (R1, R4).
  - `rec108-cache-asof`: the cache end to end (R13). The row stays at the last promotion when the record moves beneath it. A refused promotion writes nothing. A corrected one moves it, and the column the field reads follows. Also R6: `inquirystrength`'s exact key set.
  - `d280-strengthbar`: R16's `BAR_IS_A_PROJECT_PROPERTY` detail; R14's key set with no composed key, and source `none`.
  - `grounds`: R4's exact key sets, per-set population and load-bearing count, and the winning set named; R2/R4's `undetermined_at` and the every-set-undetermined detail.
  - `partitionindependence`: R11/R12's version-arm key set with no strength key, positions out of order and a POST body read the same, `capture:<sha>` named, one part unchecked, and C-71.3 for no partition.
  - The old suites are not deleted (K619 (3)).
  - Smoke test: the old `test/rec108-cache-asof.test.mjs` over the real store on this tree gives 38 pass and 1 fail. The one failure is its source-text arm looking for `#writeStrengthProjection` in `store.mjs`. It stays unrun (K653).
- `not yet met` marks this code meets (rule (5), for BOB to strike): **R5** (a hunch is inert in every pair; `pair.test.mjs` "R5: …") and **R15** (only an active administrator sets the default, C-107.1; `reads.test.mjs` "R15, R24: …"). Both have been met since the extraction, and their marks and the Status line's "Not yet met: … R5 and R15 (K102)" still stand. R26 and R27 are met too (`pair.test.mjs`, `version.test.mjs`), so that sentence can go whole.

**Awaiting stamp** (rule (4), for T19's promotion): no catalogue row moved or changed in this job. C-107.2's row is unchanged; only its site's shape changed.

**Found in other modules and the process (REPORT):**
- **legacy-store**: after the move, `#promoteProjections` declares `isInquiry` and no longer reads it. On stores written before T18, the four `bundles` columns stay orphaned: nothing writes them, and nothing reads them once strength's registration stands. The `static STRENGTH_AXES` and `strengthOf` delegates still serve `publishCase` and others.
- **legacy-tests** (for the release pass): these old suites read the moved `bundles` columns or `#writeStrengthProjection` directly: `rec108-cache-asof` (1 arm, measured failing), `nc-rec108.mjs` and `migrate-released.control.mjs` (not run).
- **Requirements wording**: R13's heading names `writeProjection(bundleId, isInquiry, subjectEntity)`. `subjectEntity` is inquiry's (`inquiry_subject_entity` stays on `bundles`, inquiry R40), so the method takes `(bundleId, isInquiry)`. The heading could drop the third argument.
- **retrieval, query-language**: their module fixtures still create the cache columns on `bundles` and read them there, which R62 allows ("a field with none registered is read where it stands"). They pass, and nothing is stale.
- **control-plane**: one test fails, the same on `tranche/T18` without this job: R36 (N380, K559; capture R65), "the pull and its promotion are one act…". It is not caused by this job.
- Generated artifacts: `bio-plane/dist/bio-plane.bundled.mjs` (not_product) goes stale by this change to `store.mjs` and strength; BOB regenerates it at the close. No other manifest row takes strength.

**Deferred:** none.

**Tests and checks:**
- `node --test bio-plane/test/m/strength/`: tests 69, pass 69, fail 0. New: `cache.test.mjs` (7), `converts.test.mjs` (8), one factory arm against the real promotion and retrieval.
- Tests of the modules that use strength, and of retrieval and query-language: run-productions 35/0, skills 33/0, reevaluation 67/0, case-authoring 69/0, review 30/0, conformance 47/0, consequences 24/0, control-plane 79/1 (the same failure on the tranche, above), retrieval 113/0, query-language 38/0, inquiry 91/0, basis-versions 53/0. action-plans has no tests yet. Layer tests: none (manifest).
- `format`: 82 modules, 77 requirements files, 0 failures. `architecture strength`: 13 product files, 46 relative imports, 0 failures. `coverage strength`: 28 of 28 live ids, 0 failures. `ownership strength tranche/T18`: 9 files; legacy-store 2 lines added, 83 removed; legacy-checks 0/0; 0 failures.

Size (session_013c7GEWiwQ1d3AtiM5gG6dd): test runs 14, module lines 1553
