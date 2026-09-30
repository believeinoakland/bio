# query-language (T18)

**Status** · session_011qbp7AFm5Cs13omsiZBw2X · depth 2 · COMPLETE · handled B0

## Completion

**Entries applied** (`build/plan/current.md` layer 5, query-language; B1):
- **N136's and N137's shares, R26.** `compile(query, {fields: {<field>: {table, key, col}}})` reads each named field's column through the caller's relation wherever the plan filters (`metaSql`: the bundles whose key the relation holds with the value, a set keyed on `fts_id` like every other leaf, through the projection relation when one is named), facets (`facets`, `facetScan`) or sorts (the ORDER BY) by it. The names are only the caller's, each tested as an SQL identifier; a relation that is not three identifiers is ignored with the warning `fields: "<f>" is not a table, a key and a column; read as before`. The plan keeps naming the field by R3's registry column (the AST, `cached`, `facetCols`, `facetScan`'s row keys), so R17's marks (`capture`, `connection` cached, `legs` exact) and every answer are unchanged. A field named with no relation reads `bundles` as before; the gate is untouched (R8). This module names no later module's table. R26 is met (the file's "Not yet met: none" stands).
- **Converts** (K619; old suites not deleted, not run): `meaningquery` (R14 the nesting under workerd's five-term compound ceiling, the eight-arm and mixed queries; R1 `has:leg`; R1/R5 quoted and case-folded arm values, qualified = bare; R5/R14 one row per bundle, OR and NOT between arms, the hunch partition), `search` (R1 quoted values: the column phrase, word order, typed and punctuated values, negated and OR'd; R14 seven filters and a seven-arm OR), `content-arm` (R6/R18 `cited` against live and version legs and the filters, `chain_last` and the bytes row's `does-not-apply` on chain and cap, columns = vocabulary; R15 the whole-set rule on `rows=content`, `rows=leg`'s content columns one row per leg), `meaningread` (no row; its share: R15 the grain inert unless named, case-folded, composed with the bundle grain, the whole basis, paging exactly once, `resolves`/`concerns` one table; R12 the count unpaged; R15/R16/R8 a project's meaning row withheld whole from the uninvited, counts and levels gated with the rows), `passage-arm` (no row; its share: R6 `passage:` vs `text:`, phrase, prefix, presence, composition; R15 only the matched units, snippet, ref, seq, chain, both truncation values, `content_id` only where a current row exists, the unmatched listing; R16 a miss counted over the other arms' scope, the true zero, the axis on the same scope; R8 a denied viewer). All in `bio-plane/test/m/query-language/converts.test.mjs`, each test titled with its R ids and its old suite.
- No catalogue row moved or changed (nothing `awaiting stamp`); no legacy file touched (the module has no `from`).

**Decisions made in the job** (below BOB's level, stated here for the record):
- A field read through a relation for a facet or a sort is a scalar subquery on the relation's key (`(SELECT fr.col FROM table fr WHERE fr.key = b.bundle_id)`), not a JOIN, so a relation holding two rows for one bundle can never multiply a row, a count or a facet. It assumes what retrieval R62 and the registrants intend: one row per bundle in each registered relation (see the report below).
- Two further warnings beside R26's: a name in `fields` that is not a field (`fields: "<f>" is not a field; ignored`) and `fields` that is not a map (`fields: not a map of fields to relations; every field is read as before`); both leave every field read as before, in R2's and R25's manner.
- The test fixture now opens every database with node:sqlite's `limits: {compoundSelect: 5}`, workerd's measured ceiling, so R14's nesting is proven against the engine, not against SQL text (the old suites needed workerd for it). Every existing test passes under it.

**Deferred:** nothing.

**Found in other modules (REPORT to BOB):**
- `agent-worker`: its suite `agent-worker/test/agent-worker.test.mjs` fails 5 of 139 with and without this job's change (measured both ways): the pins of the mutating ops against PL-11's `AI_RUN_ACTIONS` (`airunclose`, `airuntick`, `capturerequest`, `suggest`) and of the plane's namespace set read from source. Its own source-text pins, not this module's service.
- `retrieval` (R62) and its registrants (`inquiry` for `legs`, `strength` R23 for `capture`/`connection`): R26 reads a registered relation as one row per bundle key. A relation keyed otherwise (several rows per bundle) answers a filter by any row and a facet or sort by one row; each registrant's table should hold its key unique (a primary key), which R62 could state.

**Tests and checks run:**
- `node --test bio-plane/test/m/query-language/` → `tests 38, pass 38, fail 0` (25 before the job; 3 added for R26, 10 converts).
- Two mutations, each alone, restored by `cp` and verified by `cmp`: `MAX_COMPOUND` 4 → 8 fails the two R14 converts; R26's facet/sort read ignoring the relation fails the R26 walk.
- Users of the module: `node --test bio-plane/test/m/retrieval/` → `tests 70, pass 70, fail 0`; `node agent-worker/test/agent-worker.test.mjs` → `134 passed, 5 failed`, identical without this change (above).
- Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs` → `82 modules, 77 requirements files; 0 failures`; `architecture.mjs … query-language` → `8 product files, 28 relative imports …; 0 failures`; `coverage.mjs … query-language` → `26 of 26 live requirement ids named by a test; 0 failures`; `ownership.mjs … query-language tranche/T18` → `5 files changed …; 0 failures`.

Size (session_011qbp7AFm5Cs13omsiZBw2X): test runs 12, module lines 2730

## J1 · REPORT

Two findings outside query-language (record, Completion). (1) agent-worker: agent-worker/test/agent-worker.test.mjs fails 5 of 139 with and without this job's change: its pins of the mutating ops against PL-11's AI_RUN_ACTIONS (airunclose, airuntick, capturerequest, suggest) and of the plane's namespace set read from source. (2) retrieval R62 and its registrants (inquiry legs; strength R23 capture/connection): R26 reads a registered relation as one row per bundle key (a filter by any row, a facet or sort by one scalar row); each registrant's table should hold its key unique, which R62 could state.

## J2 · COMPLETE

query-language T18 done on job/T18/query-language @ cdb757243d. R26 applied and met: compile(query, {fields: {<field>: {table, key, col}}}) reads the field through the caller's relation wherever the plan filters, facets or sorts; bad relations ignored with a warning; cached, facetCols and every answer unchanged. Converts meaningquery, search, content-arm, meaningread, passage-arm in test/m/query-language/converts.test.mjs; the fixture now enforces workerd's five-term compound ceiling. No catalogue row changed, nothing awaiting stamp, nothing deferred. Module tests 38/38; retrieval 70/70; agent-worker 134/5 (pre-existing, REPORT J1); format, architecture, coverage (26 of 26), ownership all 0 failures. Size: test runs 12, module lines 2730.
