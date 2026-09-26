# retrieval — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 5. Code today (measured on `tranche/T3` @ `7d915799`, after membership's early merge; `build/extraction/retrieval.md` has the table): `bio-plane/src/store.mjs` 1014–1047 and 1107–1129 (the projection columns), 1513–1559 (their indexes and `bundles_fts`), 1634–1655 and 1670–1701 (the selection tables, the start-up backfill), 1736–1862 (`projectionOf`, the clock rules, `#writeProjection`), 1900–2080 (the text index writer, `reproject`, `projection`), 2190–2906 (`projectionPlan`, `projectionClear`, `#runQuery`, `search`, `meaningRows`, `#legEarnedCapture`, `#contentAxisTally`, `#meaningLevels`, `searchFields`, `searchIndexCheck`), 3216–3226, 3236, 3336–3344, 3363–3371 and 3943–4278 (selections and facet counts), 28575–28579, 42897–43076 (`contentAxis`, K73), and the dispatch entries `contentaxis`, `projection`, `search`, `meaningrows`, `searchfields`, `select`, `selection`, `selectionlist`, `selectionrelease`, `searchindexcheck`, `projectionplan`, `projectionclear`, `reproject` (50511–50731). `bio-plane/checks/bio-checks.mjs` 7565–7610 (C-23) and the rows C-33.20 (10633–10638) and C-33.32 (10868–10891). `from`: `legacy-store` and `legacy-checks` (K64's pattern). Not yet met: R25 (D-672), R27 (D-724), R33 (K23). Old-plan rows carried to `retrieval`: D-672 (on which D-684, D-685 and D-724 are stacked, N42).

**Size (P6).** About 1,900 lines move (about 950 without comment-only and blank lines): `store.mjs` 1,821 (908), `bio-checks.mjs` 76 (42). Under the 4,000 at which BOB reports a module. Together with `query-language` (2,665) it would be about 4,560, which is one reason to keep the two apart.

## Public

### Purpose

Retrieval runs the query language over the record and says what it could not see. It keeps each bundle's metadata projection and text index current with its promotion; answers searches at bundle grain (a page, a count, every id, facet counts, the wider reading of an empty conjunction) and at meaning grain, with the four-level statement of which absence is true and, for passages, the content-axis tally; publishes the vocabulary; checks the index against the corpus; holds a member's selections and says whether a selected set moved; and answers one capture's content-axis state. It builds no SQL of its own for a search (`query-language` compiles every statement) and runs none that lacks the viewer's gate. It mints nothing: a hit is an address.

### Provides

Terms. A **viewer** and an **owner** are the control plane's stamps. The **projection** is the columns of a bundle's row that `query-language`'s fields read; the **text index** is `bundles_fts`. **Hidden** means a bundle the viewer may not see (`membership` R43); a hidden thing answers exactly as an absent one, and no count includes it. Every bound is published as applied, after clamping.

**The projection and the text index** (a projection registered with `promotion`, K31)
- **R1** After a promotion commits, the bundle's projection equals `projectionOf` over its `bundle.md`, and its text-index row equals `query-language.textOf` over its files, in the same transaction. A revision replaces the bundle's own index row: the row key is allocated once per bundle and never reassigned while the bundle exists.
- **R2** `projectionOf(bundleMd, nowMs)` is pure: `schema_id`, `produced_mode`, `capability_tier`, `source_locator`, `source_authority`, `source_retrieved`, `source_status`, `content_hash`, the three monitoring columns, `annotations_open`, the three re-evaluation columns (a record or a legacy boolean), `fm_json`, and, only for a bundle whose type normalises to `action`, the six action columns, `action_clock_overdue` judged at `nowMs`. Frontmatter that does not parse gives every column null, never a guess.
- **R3** `reproject({limit})` re-derives the projection and index of rows lacking either, at most `limit` (500 by default, 1–5,000) per call, and answers `{reprojected, reindexed, limit, remaining}`; the instance runs it once at start with 500.
- **R4** `projectionPlan()` shows the query plan uses the index for four filtered columns; `projectionClear({bundleId, text})` nulls a projection (and by default its index row). Both are test seams no member's op needs.

**projection({bundleId, jsonPath, jsonEquals, limit, after, viewer, nowMs})** (`op=projection`)
- **R5** With `bundleId`: the row, or null when absent or hidden. Without: `{bundles, limit, cursor, total}` in id order, `limit` 200 by default and at most 5,000, `cursor` the last id when the page is full, `total` counted through the gate; `jsonPath` with `jsonEquals` filters on the frontmatter.

**search({q, viewer, sort, dir, limit, offset, mode, facets, facetMode, widen, snippetChars})** (`op=search`)
- **R6** `mode` is `page` (default), `ids` or `count`. The answer carries `query {q, terms, match, sort, warnings, mode}`, `gate {scope, applied}` where `applied` is the number of statements run, `total`, `limit`, `offset`; a page's `hits`, each with the bundle's provenance columns and a snippet and no score; or `ids`, every id in the page's order, with `truncated` when the cap (`IDS_MAX`) was reached.
- **R7** Facet counts accompany every answer but a count unless `facets` is false: per field, `{value, n}` by count descending then value, nulls excluded. The `scan` form (default) and the `groupby` form give identical counts.
- **R8** `cached` publishes `query-language.cachedNotes` for the routes this answer actually ran (no facet route on a count, no sort route on a count).
- **R9** When a conjunction of more than one atom finds nothing, and `widen` is not false, the OR reading is counted, and offered as `widen {interpretation: "OR", total, q, detail}` only when it finds something; otherwise `widen` is null.

**meaningRows({q, rows, viewer, limit, offset, ids})** (`op=meaningrows`)
- **R10** No `rows` is `MEANING_ROWS_NO_ARM` (C-23.1); a `rows` that is not an arm is `MEANING_ROWS_UNKNOWN_ARM` (C-23.2), its detail naming every arm with its grain. Each refusal carries its `check` and `translation`.
- **R11** The answer: `arm`, `table`, `grain`, `identity`, `query {q, warnings, meaningArms}`, `gate`, `cached` (filter route only), `rows`, `count`, `limit`, `offset`, `total` (the gated count of matching rows, never larger than paging reaches), and the four-level statement (R13).
- **R12** A leg row carries `grade` resolved against what the record can earn for its target on the capture axis, `grade_authored` verbatim, and `grade_why` (null when the authored letter stands); a connection-axis leg, a null grade and an inquiry target pass unchanged. One earned-registry read per page.
- **R13** The four-level statement: `level`; `scope {documents, documents_with_rows, documents_without_rows}` over the query's other arms; `levels` naming all four: `internet` undetermined (this read does not reach the observation log) with its reason, `document` counted, `content` and `meaning` counted at the arm's own level and undetermined otherwise, each saying which read answers it; and `says`, one sentence distinguishing no document in scope, no row of this kind in any document, and rows the filters excluded.
- **R14** For `rows=passage` the statement also carries the content-axis tally over the captures of the documents in scope (other arms): at most 500 counted, `captures_counted`, `captures_truncated` observed by reading one more, `captures_bound`, and one count per state of `observation-log`'s content-axis vocabulary plus `undetermined`; a state the vocabulary does not know is counted undetermined, never dropped; the vocabulary travels with the answer. `says` leads with coverage: how many captures in scope were never read at passage grain, and whether an absence covers the documents or only the part read.
- **R15** A text term found only inside a captured document's text is found by `passage:` and not by `text:`; searching mints no content row.

**searchFields()** (`op=searchfields`)
- **R16** The fields `{type, freeText, column}`, `ftsColumns`, `defaultFacets`, `idsMax`, `meaning` (`query-language.meaningVocabulary()`), and the syntax sentences, which say that `content:` searches what has been cited or marked citable and never a document's text.

**searchIndexCheck({after, limit, viewer})** (`op=searchindexcheck`)
- **R17** Over up to `limit` (200 by default, 1–1,000) visible bundles after `after`, each finding is `NO_FTS_ID`, `NO_INDEX_ROW` or `DIVERGED` (its columns and both lengths), the stored row compared with `textOf` over the stored files. `orphans` lists index rows no bundle claims, at most 100 with `orphans_truncated`. `counts {bundles, indexed, keyed}` are taken through the gate (`indexed` excludes rows a hidden bundle claims and keeps every orphan). `cursor` is set when the page is full; `ok` only with no finding and no orphan.

**Selections** (`op=select`, `op=selection`, `op=selectionlist`, `op=selectionrelease`)
- **R18** `selectionCreate({q, viewer, owner, sort, dir, ids, kind})`: `NO_OWNER`; `BAD_KIND` unless `query` or `enumerated` (ids given means enumerated); `EMPTY` for an enumeration of no id; `TOO_LARGE` over 10,000 ids with `limit` and `got`, never turned into a query. Members are resolved through the compiler under the viewer, so a hidden id never enters. A query selection stores its criterion and a digest of the ordered ids, no items; an enumeration stores each item with its sha. An owner holds at most 32: the oldest is collected, the new one never refused. It answers `{handle, kind, n, q, expires, ttlSeconds, gate}`; a selection lives 300 s from its last use.
- **R19** `selectionResolve({handle, viewer, owner, weight})`: an unknown, released or expired handle is `NO_SUCH_SELECTION` (C-33.20), one answer; another owner's is `NOT_YOURS`. Use extends the life. An enumeration is re-resolved under the current viewer: an item now hidden or purged leaves it (`drift.hidden`, `drift.purged`), a revised one is reported with its class (`mechanical` with its operation, `authored`, or `unknown`), nothing is ever added. A query selection is re-run and its digest compared: `added`, `removed`, `digestChanged` and the sentence that which rows moved is not recoverable. `moved` is per-row movement.
- **R20** With `weight: "refuse"`, an answer that changed (a moved row, or a query whose digest changed at a constant count) is `SET_MOVED` (C-33.32) with no members; with `report` the members are given with the drift.
- **R21** `selectionList({owner, viewer})`: `NO_OWNER`; the owner's selections newest first, the caps, and the instance's selection bytes, excluding rows that name a bundle the viewer cannot see. `selectionRelease({handle, owner})`: `NO_OWNER`, `NOT_YOURS`; releases one, or all the owner's, and answers how many.
- **R22** `sweepSelections()` removes every expired selection and answers how many; it runs before every selection act.

**contentAxis({captureSha, viewer})** (`op=contentaxis`, K73)
- **R23** No sha answers `found: false` with the vocabulary and a note. A capture this record does not hold, and one in a hidden bundle, answer the same `found: false, capture_held: false`, decided before any observation is read.
- **R24** Otherwise: `extraction`, the latest content-level observation with the `extract` authority; `index`, the latest with the `derive` authority (null when none); `indexed`, `determined` and `why` by `observation-log`'s content-axis rule over them; `missing_cause` by its missing-row rule when no extraction row exists; `bundle_id`; the vocabularies. The extraction axis and the index axis are never merged.

**D-672 and D-724**
- **R25** A workbook's text is found by `passage:` at sheet grain: one unit per sheet whose used range the reader names, answered with its `sheet-range` extent, and a workbook indexed so reads as indexed on the content axis, not as a container with no unit arm. *(not yet met: D-672; the unit is written by `extraction`)*
- **R26** The content-axis tally and `contentAxis` read a capture promoted before D-672 as it was indexed then, until it is re-promoted.
- **R27** `contentAxis` names the runs of units a partial index skipped, at most `CAPTURE_TEXT_SKIPPED_RUNS_MAX` with `skipped_truncated`. *(not yet met: D-724)*

## Private

### Uses

- `query-language`: `compile`, `textOf`, `FIELDS`, `FTS_COLUMNS`, `DEFAULT_FACETS`, `IDS_MAX`, `MEANING`, `meaningVocabulary`, `cachedNotes`, `MEANING_AXIS_CAP`, `GATE_MARK`.
- `membership`: `viewerPredicate` (R5, R17, R21) and `inSight` for `contentAxis` (R23; `legacy-store`'s `#bundleRedactor` wraps it today). *(not declared in `modules.json` today)*
- `record-core`: `recordOf(ctx)`, `transact`, the `bundles` read contract (R37) and the bundle's live files (R41–R43), the latest manifest row (R19's revision class), `declarePurge`.
- `promotion`: `registerStep` for R1's projection (K31). *(not declared)*
- `provenance`: the `register` read contract (R48) for R14 and R23. *(not declared)*
- `extraction`: the `readings` and `capture_text` read contracts (its map §3), the units behind R25.
- `observation-log`: its content-axis vocabulary and rule (`CONTENT_AXIS_STATES`, `CONTENT_AXIS_UNDETERMINED`, `contentAxisFor`), the missing-row rule (`#missingCauseFrom`, `#missingContentCause`) and the `observation_log` reads.
- `entities`, `content`: tables the compiler's arms read (`resolutions`, `content`).
- `legacy-checks`: `parseFrontmatter`, `normalizeType`; C-23, C-33.20, C-33.32 until they move here (R31).
- `capture`, `connections`, `progressions`: nothing in this module's share calls them (map §5).

### Invariants

- **R28** No statement runs without the gate's mark: `retrieval` refuses (throws) rather than execute one, and every statement comes from `query-language`.
- **R29** Hidden answers as absent everywhere: no total, tally, cursor or byte count includes what the viewer may not see, and none states how much was withheld.
- **R30** The projection and the text index are derived, never a record: a promotion that fails leaves neither changed, and both can be rebuilt from the stored files (R3, R17).
- **R31** Each check moves here as an invariant with its test (K6): C-23.1, C-23.2, C-33.20, C-33.32.
- **R32** Nothing here mints, cites or promotes: a search, a selection and a content-axis read write only the projection, the index and the selections.
- **R33** `selections`, `selection_items` and `bundles_fts` are declared to record-core's purge (K23); a bundle's purge removes its index row. *(not yet met: K23 — `legacy-store` declares them and deletes the index row itself)*
- **R34** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_System_Design.md` §3, construct 9 (the read-through cache; the four-level search; FTS5 inside the Durable Object).
- `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.3 (the three axes and the four-level search; saying which absence is true).
- `docs/development/RETRIEVAL-SUBSTRATE.md`, the settled design (Bob, 2026-07-25): 2, 3, 4 (a selection is server-side and an action refers to it by handle; `weight`), 6 (the widening affordance), and "A selection is a lease".
- `docs/development/CONTENT-SEARCH-DESIGN.md` §2, §4.1 (the workbook unit, D-672), §4.3 (truncation stated), §4.4 (the level and the content-axis tally, UI-62's four rules served by R14), §4.5, §8.
- `docs/development/OBSERVATION-LOG-DESIGN.md` §4.2 and §6 (the content-axis read).
- `docs/architecture/BIO_Membership_Architecture_v2.md` §7.9 (sight; D-464's counts).
- DEC-24 (a hit is an address; nothing minted by searching).

### Suggestions

- **Factory.** `retrievalOf(ctx)` answers the one instance per Durable Object storage and reaches `record-core`, `membership`, `promotion`, `provenance`, `extraction` and `observation-log` through theirs (K61). The op handlers move here (K3); `index.mjs`'s routing (`RETRIEVAL_READS`, the stamps) stays with `control-plane`.
- **What later modules register.** `#legEarnedCapture` (R12) reads `strength`'s earned registry and `#capturedAt` (layer 6); the single-bundle `projection` answer's `action`, `no_project_conclusion` and `surfaced_in` blocks are `actions`', `inquiry`'s and `ai-runs`'. Each is a decoration its owner registers (K31's pattern), `legacy-store` registering them until then; map §5.
- **Scheduling.** The selection sweep's wake and tick are `scheduler`'s consumer calling R22; `selectionCreate` arms it through a listener `retrieval` offers (K72 (9)'s pattern), not a call.
- Tests: R28 by handing the executor a statement without the mark; R29 by a hidden project in every read; R18–R20 over the 64-id chunk boundary and at 10,000 and 10,001 ids; R14 by a miss over a scope with one indexed, one unindexed and one never-extracted capture; R30 by `projectionClear` then `reproject`. Built work for D-672 and D-724 is on their `land/worker/*` branches, judged at the job.

## Open for Bob

1. **Should an empty passage search say, per capture, whether nobody ever read it or whether the record cannot tell?** The tally (R14) computes, for each unread capture, whether nobody looked or the log cannot rule out an earlier reading or a purge, and then counts all of them as "not extracted"; `CONTENT-SEARCH-DESIGN.md` §4.4 records that loss. *Recommendation:* yes: split the count into "never looked" and "undetermined", so an empty search can say "nobody has read these 3" only when that is known; the figures are already computed.
2. **Should a workbook's named tables and ranges be their own search hits?** D-672 makes each sheet one searchable unit (R25). A workbook also names tables and ranges inside a sheet (D-415); they can be cited but not searched, and making them searchable means the same words answer twice, once for the table and once for its sheet. *Recommendation:* not now; a sheet hit already leads to the table, and a member can cite the table; revisit when a member asks.
