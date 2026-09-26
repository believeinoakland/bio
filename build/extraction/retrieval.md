# retrieval — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `7d915799` (after membership's early merge) by a drafting worker for BOB #42 (P18). Line ranges are `grep -n`-verified in `bio-plane/src/store.mjs` (51,006 lines) and `checks/bio-checks.mjs` (16,591) at that date; the extraction job confirms them. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/retrieval.md` (R1–R34); K3, K4, K6, K23, K31, K61, K63 and K73 apply. The module exports `retrievalOf(ctx)`, its one instance per Durable Object `ctx`, reaching `record-core`, `membership`, `promotion`, `provenance`, `extraction` and `observation-log` through their factories on the same `ctx` (K61); `legacy-store` delegates to it. `from` should read `["legacy-store", "legacy-checks"]` (K64's pattern): C-23, C-33.20 and C-33.32 are in the catalogue. Nothing moves from `schema.mjs` (every table here is created in `store.mjs`) or from `index.mjs` (§2). `query.mjs` is `query-language`'s and stays where it is.

## 1. What moves to `retrieval`

All in `store.mjs` unless named otherwise.

| what | lines | moves |
| --- | --- | --- |
| `ADDITIVE_COLUMNS`: the S-10 projection columns `schema_id` … `fm_json`, `fts_id` | 1014–1047 | yes (R1, R2), as columns this module adds to `bundles` (§5.2) |
| `ADDITIVE_COLUMNS`: the six `action_*` columns | 1107–1129 | yes, with `projectionOf` (§5.3) |
| the projection indexes loop, `bundles_fts_id`, `bundles_fts` DDL | 1513–1559 | yes. The loop also indexes `inquiry_capture_strength` and `inquiry_connection_strength`, which `strength` writes (§5.3) |
| the selections comment, `selections`, `selection_items` and their indexes | 1634–1655, 1670–1692 | yes (R18–R22) |
| the start-up `#backfillProjection(500)` | 1694–1701 | yes, into the module's start (R3) |
| `projectionOf`, `actionClockNext`, `actionOverdue`, `PROJECTION_LIMIT_*`, `PROJECTION_COLS`, `#writeProjection` | 1736–1862 | yes (R1, R2, R5); the two clock rules (1806–1833) are shared with `#actionDerived` (§5.3) |
| `#ftsIdFor`, `#writeText`, `#filesOf`, `#backfillProjection`, `reproject` | 1900–1981 | yes (R1, R3); `#filesOf` reads `files` through `record-core` (R41–R43) |
| `projection` | 1983–2080 | yes (R5), without the single-bundle decorations (§2) |
| `projectionPlan`, `projectionClear` | 2190–2220 | yes (R4) |
| `#runQuery`, `search`, `meaningRows`, `#legEarnedCapture`, `#contentAxisTally`, `#meaningLevels`, `searchFields`, `searchIndexCheck` | 2222–2906 | yes (R6–R17, R28). `#legEarnedCapture` (2416–2487) calls `strength` (§5.3) |
| `SELECTION_TTL_MS`, `SELECTION_MAX_ITEMS`, `SELECTION_MAX_PER_OWNER`, `SELECTION_ID_CHUNK`, `#sweepSelections` | 3216–3226, 3236, 3336–3344, 3363–3371 | yes (R18, R22). `CASE_FLAGS_LIMIT` (3235) and `CITE_*` (3346–3361) stay |
| `#digestOf`, `selectionCreate`, `#revisionKind`, `#answerChanged`, `selectionResolve`, `selectionList`, `selectionRelease`, `FACET_MODE_DEFAULT`, `#facetCounts` | 3943–4278 | yes (R7, R18–R21) |
| `SEARCH_ORPHAN_MAX` | 28575–28579 | yes (R17) |
| `contentAxis` | 42897–43076 | yes (R23, R24; K73) |
| dispatch: `contentaxis`; `projection`; `search`, `meaningrows`, `searchfields`; `select`, `selection`; `selectionlist`, `selectionrelease`, `searchindexcheck`, `projectionplan`, `projectionclear`, `reproject` | 50511–50517, 50533–50550, 50600–50634, 50644–50661, 50720–50731 | yes (K3); `affordancefacts` (50635–50643) and `cite` stay |
| `MEANING_READ_CHECKS` (C-23.1, C-23.2) with its header | bio-checks.mjs 7565–7610 | yes (R10, R31) |
| `NO_SUCH_SELECTION` (C-33.20), `SET_MOVED` (C-33.32) with its comment | bio-checks.mjs 10633–10638, 10868–10891 | yes (R19, R20, R31); split out of `ACT_SHAPE_CHECKS` (C-33), numbers unchanged |

**Tables (K4).** `selections`, `selection_items`, the virtual table `bundles_fts`, and the projection columns on `bundles`. `bundles_fts`, `selections` and `selection_items` are in `legacy-store`'s `declarePurge` list today (876, 887), which the job moves to the module's own declaration (R33).

**Ops (K3).** `search`, `meaningrows`, `searchfields`, `select`, `selection`, `selectionlist`, `selectionrelease`, `searchindexcheck`, `projection`, `projectionplan`, `projectionclear`, `reproject`, `contentaxis`.

**Checks it needs and does not take:** `parseFrontmatter`, `normalizeType` (`legacy-checks`); `ACT_SHAPE_CHECKS`' other rows.

**Measured size:** store.mjs 1,821 (908 code), bio-checks.mjs 76 (42): about 1,900 lines, about 950 of code.

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `#writeSupersededBy`, `supersededByOf` (`inquiry_superseded_by`) | 1864–1898 | `inquiry` | a reverse view of `supersedes` edges on inquiries |
| the `inquiry_*` strength columns and their writer | `ADDITIVE_COLUMNS` between 1048 and 1106; 33465 (`UPDATE`) | `strength`, `inquiry` | written from the walk and `inquiry_basis`; the compiler reads them as fields (§5.3) |
| `#actionDerived` | 2082–2167 | `actions` | the action page's derived block, decorating `projection`'s single-bundle answer |
| `#surfacedIn`; `no_project_conclusion` (`#noProjectConclusionOf`) | 2169–2188; inside `projection` | `ai-runs`; `inquiry` | the other two decorations of the same answer |
| `#missingCauseFrom`, `#missingContentCause` | 42786–42896 | `observation-log` | the missing-row rule; also read by the frontier (43581) and the case's searched section (10169). `contentAxis` and the tally call it |
| the frontier (`#frontierLatest` … `frontier`, `op=frontier`) | 43078–44628 (to the end of `frontier`) | `observation-log` | §5 of its design: the frontier is a view over the log. Claimable here (§5.6) |
| `#bundleRedactor`, `#viewerSees`, `#bundleGate` | 17188, 17244–17290 or so | `membership` (`inSight`, R43) | the viewer's sight; `contentAxis` calls it |
| `affordanceFacts`, `op=affordancefacts` | 2908–3214 | `affordances` | the facts behind the act list |
| `cite`, `#edgeTransition`, `dispose`, `retire`, `release` (the acts that take a selection) | 13774, 4324, 4566, 5323, 5448 | `inquiry`, `publication` | they call `selectionResolve` (R19, R20) |
| the `selection-sweep` consumer, `#armSweep` | 3432–3436, 3910 | `scheduler` | its registry calls R22; `selectionCreate` (4019) arms it through a listener this module offers (K72 (9)) |
| `index.mjs`: `RETRIEVAL_READS` (1671), the OPS lists (2177, 2226), the stamps (11965–12031, 12511) | index.mjs | `control-plane` | routing, authentication and stamps (K3) |
| `capture_text`, `capture_text_fts`, their triggers, `#writeCaptureText`, `CAPTURE_TEXT_*` | 1561–1632 and the writer | `extraction` | written in the reading's transaction; K73 and its map §5 |

## 3. Callers to rewire

Each calls a moved method or touches a moved table today, and calls `retrievalOf(ctx)` after.

- `promote` (17598): `#writeProjection` (19653) and `#writeText` (19662) become the projection this module registers with `promotion` (R1, K31).
- `selectionResolve`: `#edgeTransition` (4328), `dispose` (4598), `retire` (5334), `release` (5482), `cite` (13778).
- `purge` (33498): the `bundles_fts` row delete keyed through `bundles.fts_id` (33503) becomes this module's purge work (§5.4).
- `#counts` / `op=stats` (31864): the `bundles_fts` orphan count (31909) and the `selections`/`selection_items` bytes (31948) become reads this module answers, or a stated read contract.
- The scheduler registry (3432–3436) and `selectionCreate`'s arm (4019), as §2.
- `query.mjs`'s `viewerPredicate` stays imported from `query-language` until N37, then from `membership`.

## 4. Old-battery tests that anchor on the moved source

Negative controls that patch the text of moved code (a `legacy-tests` entry, K53): `nc-rec90.mjs` and `nc-rec92.mjs` (`#runQuery`), `nc-rec94.mjs` (`contentAxis`), `nc-rec114.mjs`, `nc-rec118.mjs`, `nc-rec119.mjs` (`#legEarnedCapture`), `fieldread.control.mjs` (`#runQuery`, `meaningRows`). Suites that scan the source: `bounds.test.mjs` (the named bounds `PROJECTION_LIMIT_*`, `SEARCH_ORPHAN_MAX`, `SELECTION_*`), `hygiene.test.mjs` (the purge tables), `meaningquery.test.mjs` and `passage-arm.test.mjs` (read `store.mjs` and `query.mjs` text). Suites that drive the behaviour and follow the module as its tests: `search`, `selection`, `projection`, `projection-noproject` (with `inquiry`), `meaningread`, `meaningquery`, `meaning-bounds`, `content-arm`, `passage-arm`, `rec108-cache-asof`, `rec114-leg-earned`, `rec118-reeval-earned`, `rec119-version-legs-earned`, `observation-content` (the `contentAxis` arms), `project-sight`, `founder-sight`, `casesearched` (with `publication`). `retrieval-scale.mjs`, `retrieval-probe*.mjs`, `facet-probe*.mjs`, `meaning-index-probe.mjs`, `passage-axis-probe.mjs` are measurement instruments.

## 5. Undetermined, conflicts, and code others could claim

1. **Uses.** `modules.json` gives `retrieval` record-core, capture, extraction, content, entities, connections, progressions, observation-log and query-language. The moved code also needs `membership` (`viewerPredicate`, `inSight`), `promotion` (R1's projection), `provenance` (the `register` read contract in `contentAxis` and the tally) and `legacy-checks` (`parseFrontmatter`, `normalizeType`); it calls nothing of `capture`, `connections` or `progressions`, and reads `entities`' and `content`'s tables only through the compiler's arms. Proposed: add the four, drop the three. For `query-language`: add `content` (the extent kinds and mint literal move there, content map §1).
2. **The projection columns sit on `record-core`'s `bundles`.** K4 gives each module its tables; these 30 columns are written by `retrieval` (23, the six action columns included), `strength` and `inquiry` (7) and read by every search statement. Moving them to a table of their own would add a join to every statement and re-open probe 2's measurements. *Recommendation:* `record-core` states the projection columns as added and written by their owners (a stated write contract beside R37), `bundles` staying one row per bundle.
3. **Later layers inside layer 5.** `#legEarnedCapture` calls `strength`'s earned registry and `#capturedAt`; `projectionOf`'s action columns and the two clock rules are `actions`' doctrine (pure code, no import); `projection`'s single-bundle answer is decorated by `actions`, `inquiry` and `ai-runs`; `query-language`'s `leg:` arm and `content:cited` read `inquiry_basis` and `inquiry_basis_version_legs`, and its `capture`, `connection`, `legs` and action fields read columns `strength`, `inquiry` and `actions` write. *Recommendation:* the K31 pattern: `query-language` offers registration of an arm, a sub-field predicate and a field, and `retrieval` of a row decoration and a projection column; each owner registers at its extraction, `legacy-store` registering all of them until then, so nothing here names a later module and the grammar a member types does not change. BOB decides (P17).
4. **Purge of one bundle's index row.** `bundles_fts` is keyed by `bundles.fts_id`, which record-core R46's keyed-table form cannot express, and the row must go before the `bundles` row does. Either `record-core` gains a per-module purge hook run before the bundle row is deleted, or this module's purge work reads the key first (as `capture-requests`' `lead_inquiry` also needs, K71).
5. **The content-axis vocabulary is in `ai-runs`' file.** `CONTENT_AXIS_STATES`, `CONTENT_AXIS_UNDETERMINED`, `contentAxisFor`, `MISSING_ROW_CAUSES`, `enteredAfterFirstRow` and the other observation vocabularies live in `bio-plane/src/airun.mjs` (106–1140), owned by `ai-runs` (layer 6). `retrieval` and `observation-log` (layer 5) may not import it. *Recommendation:* `observation-log`'s extraction takes them into its own file first; until then `legacy-store` passes them in.
6. **Other claimants.** `observation-log`: `contentAxis` itself (its design §6 lists it among the log's readers; K73 placed it here), the missing-row rule and the frontier. `extraction`: the `capture_text` index `passage:` reads (its map §5), and all of D-672's code: `textUnitsFor` in `index.mjs` and `CAPTURE_TEXT_UNIT_CONTAINERS` (store.mjs 800); D-672's store diff touches nothing listed here. `inquiry`: the acts that take a selection, and the `leg:` arm (item 3). `strength`: the earned leg grade. `actions`: the action projection and clock rules. `affordances`: `affordanceFacts`, which sits between the search surface and the selections.
7. **D-672, D-684, D-685, D-724 (N42).** D-672's branch (`land/worker/D-672` @ `f676a996`) changes `index.mjs`'s `textUnitsFor`, `store.mjs`'s `CAPTURE_TEXT_UNIT_CONTAINERS` (both `extraction`'s) and a comment in `airun.mjs`; D-724's (`a944481e`) adds the skipped-unit runs to `contentAxis` (R27) and `capture_text_skipped`. *Recommendation:* judge D-672's code in `extraction`'s job and meet R25 and R27 here with tests at this module's interface; N42's entry against `retrieval` then carries only D-724's `contentAxis` half and R25's test.
8. **Canon and code.** `CONTENT-SEARCH-DESIGN.md` §4.2 gives `rows=content` and `rows=passage` a `refs: bundle_id`; the code declares none, with the reason (the owner is already gated). §8 says a fifth arm is refused; the compiler nests (query-language Open 3). Both are BOB's to correct in the design (P17).
