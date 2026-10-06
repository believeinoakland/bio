# corpus-export (T33)

**Status** · session_015fetSSaZfSXHXf2d4cJb5A · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Six readings for T33-61, each my best reading. I am building on them now and will bring the work in line with your answer.

1. **R7, reading another module's rows.** No read contract covers most declared tables. My reading: a `declareTable` entry with `export: "yes"` or `"admin-only"` is its owner's statement that its rows travel in the export. corpus-export reads such a table whole (`SELECT *`) and writes nothing to it. Key order is the table's primary key columns, or `rowid` when there is none.
2. **R7, the rule of a `derived-rebuildable` table.** `declaredTables()` gives the owner, the key columns and the classes, but not "the stored tables it is rebuilt from" (record-core R77). `declareTable` neither takes nor keeps such a list. My reading: the manifest carries `{owner, table, classes, key, rule: "rebuilt by <owner> from its stored rows (record-core R77)"}` with no `from` list. The missing `from` is a gap in record-core R21/R77, which I report separately. If you would rather fold `from` into record-core now, say so and I will carry it once it is merged.
3. **R8, fetching a page.** R1 answers the manifest, which holds each page's index, row count and SHA-256. The page's canonical bytes travel beside the manifest, as file bytes do for R3. My reading:
   - A new service `exportPage({table, index})` answers one page's rows and its canonical bytes, so a page can be fetched and resumed alone.
   - `corpusExportOps` gains a third arm, `exportpage`, with the same credential as `export` (root of trust). That changes R6's "exactly two arms".
   - The page bound is in bytes: at most 256 KiB of canonical JSON per page, and at most 1,000 rows. The bound is measured on a large fixture and reported in COMPLETE.
4. **R10's op and sight.** My reading:
   - R10 is its own op, `exportrender`, a fourth arm of `corpusExportOps` taking `format` and the stamped `viewer`.
   - Sight comes from an injected `sight(viewer)`: membership's `viewerPredicate`, handed in by the composition root as record-core R73's is, so there is no new `membership` edge.
   - Each row is judged by its table's declared `sight` class. `group` rows go to any member. `bundle` rows go when their bundle is visible. `source` rows go when the bundle of the capture they cite is visible, through provenance's `register`. `owner` rows are never rendered.
   - `never` and `admin-only` tables are never rendered.
   - Which credential reaches `exportrender` is op-declarations' (T33-88).
5. **R10's standard versions, pinned in the job:**
   - FollowTheMoney schema 3.x, entity JSON `{id, schema, properties}`.
   - OCEL 2.0 JSON.
   - Popolo, the 2014 JSON spec: persons, organizations, memberships.
   - OCDS 1.1, release package.
   - Frictionless Fiscal Data Package v1, `datapackage.json` with inline resources.
6. **R7 versus people's declaration.** R7 says member ties are declared `never` (K1489, K1490). `people` declares `member_ties` as `export: "admin-only"`, sight `owner` (`people/schema.mjs`:168). My reading: corpus-export carries whatever class the owner declares and does not override it. The mismatch is people's to fix, or R7's wording is. I am raising it as a REPORT.

## J2 · REPORT

Two findings in other modules, against their requirements:
(1) people: `member_ties` is declared `export: "admin-only"` (`people/schema.mjs`:168). corpus-export R7 (K1489, K1490) says member ties are declared `never`. corpus-export carries whatever class the owner declares, so as things stand a root export carries members' ties. Either people's declaration or R7's wording needs to change.
(2) record-core: `declareTable` neither takes nor keeps the stored tables a `derived-rebuildable` table is rebuilt from. R77 implies them, and corpus-export R7 needs them to carry the rule. So `declaredTables()` cannot answer them, and the export's rule names its owner and key only (my J1 item 2).

## Completion (T33-61)

**Entries applied.** T33-61 (S0-15, B0.13; DEC-112, K1489, K1493), on J1's readings as K1632 answered them:
- **R1.** The manifest carries `tables` (R7) and counts `tables` and `rows` beside `bundles` and `files`. The `export_log` row records them in two new nullable columns, `tables` and `rows`, added to an existing store by a guarded `ALTER`. R2 answers them, with `format`.
- **R7.** Every `record-core.declaredTables()` entry travels under its owner with its classes, read fresh at each export, so a later declaration is named by the next export:
  - `yes` tables travel with their rows; `admin-only` tables travel with their rows and `admin_only: true`.
  - `never` tables are named with no row.
  - `derived-rebuildable` tables travel as their rule (owner and key; no `from` until N593).
  - People's `member_ties` is held `never`, fail closed, until N594 (`HELD_NEVER`; K1632 (6)), with a test.
- **R8.** Pages run in key order: the primary key, or `rowid` when there is none. Each page holds at most 1,000 rows and at most 256 KiB of canonical rows; one larger row travels alone. A page's canonical bytes are the sorted-key JSON of `{index, owner, rows, table}`. The manifest states each page's `index`, `rows`, `bytes`, `sha256` and `after`. `exportPage({table, index, after})` fetches one page alone, with `next` to resume from (op `exportpage`, R6 as amended).
- **R9.** Expunged rows are gone from their table, so they are not carried. Each table's tombstones travel as `{table, key, ground, at}`; the test shows none of the removed content is anywhere in the manifest or its pages.
- **R3.** `verifyCorpusExport` re-derives every page. It refuses by name, each with a test:
  - `PAGE_HASH_MISMATCH`, `PAGE_SIZE_MISMATCH`, `PAGE_MALFORMED`, `PAGE_MISPLACED` (bytes of another table or index), `PAGE_ROWS_MISMATCH`, `PAGE_MISSING` and `BYTES_MISSING`;
  - `TABLE_ROWS_MISMATCH`, `TABLE_NEVER_CARRIED`, and `TABLE_NOT_CARRIED` for a table the importer's `declared` list names that the manifest neither carries nor names;
  - `COUNTS_MISMATCH` on `counts.tables` and `counts.rows`.
- **R10.** `exportRendering({format, viewer})` (op `exportrender`) renders seven formats at the versions pinned in J1 (5): `ftm-event`, `ocel2`, `popolo`, `ftm-people`, `ftm`, `ocds` and `fdp`.
  - It reads only tables declared `yes`. Events, lines and money facts come through their owners' viewer reads (`readEvent`, `readLine`, `readFact`), so the owner's sight decides.
  - Entities come from the group-wide registry. Person facts of kinds `name`, `birth` and `death` are read only when the bundle of their citing capture is visible (`membership.viewerPredicate` over provenance's `register`); `address`, `contact` and `locality` are never read (K1485).
  - Withdrawn rows are left out, and a field the record does not hold is omitted. Every item carries `record_id` and `citation`.
  - An unknown format is refused `EXPORT_FORMAT_UNKNOWN` and logs nothing. Otherwise it writes one `export_log` row (scope `rendering`, `format`, `rows` = items).
  - Each source is bounded at 5,000 records, with `truncated`.
- **Departure from J1 (4)'s wording.** Sight is not an injected `sight(viewer)`. Each owner judges its own rows through its viewer read, and person facts use `membership.viewerPredicate` directly. The result is the same rule with no second copy of it, and it needs a `membership` edge (below).

**R8's paging cost, measured** (the `tables.test.mjs` R8 test): 200,000 rows of about 120 bytes, 200 pages, 2.7 s CPU and a heap delta of about 50 MB, within 30 s and 128 MB. Only the page being built is held. The bound is set at 1,000 rows and 256 KiB.

**Final `uses` (K1505 (7), K1563 (3)), for BOB to set in `modules.json`:** record-grammar, record-core, membership (new: `viewerPredicate`, R10), provenance (its `register`, R1 and R10), connections, entities, events, lines, money, and people (test fixture only: `rich.mjs` builds on `test/m/people/fixture.mjs`; the code reads people's `person_facts` as a declared table and imports nothing of people). Until then the architecture check names these 6 edges.

**Found in other modules.**
- people `member_ties` declared `admin-only` (N594) and record-core's missing `from` (N593): both already reported in J2.
- **plane** `test/m/plane/notices.test.mjs`:120 (R5) pins `corpusExportOps`' keys to `export`, `exportlog` and is red against R6 as amended (K1632). It is plane's test to update (T33-90), so I report it rather than change it.
- **op-declarations / control-plane** (T33-88, T33-89): `exportpage` (with `export`'s credential) and `exportrender` (the stamped viewer) need declaring and routing.
- **Generated artifacts:** the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale with this module's source; it is regenerated at the layer close.

**Deferred.** None.

**Tests and checks run.**
- `node --test bio-plane/test/m/corpus-export/`: 24 pass, 0 fail (R1–R10).
- Users of the changed service: `test/m/publication/` and `test/m/plane/`, 193 pass, 1 fail. The fail is the plane R5 pin above.
- `control-plane` 156/3, `op-declarations` 59/0, `affordances` 165/2: identical with and without this change (named reds).
- `checks/format.mjs`: 0 failures. `checks/coverage.mjs corpus-export`: 10 of 10 live ids, 0 failures. `checks/ownership.mjs corpus-export tranche/T33`: 13 files, 0 failures.
- `checks/architecture.mjs corpus-export`: 6 failures, the undeclared edges above (membership, entities, events, lines, money; people from the test fixture).

Size (session_015fetSSaZfSXHXf2d4cJb5A): test runs 22, module lines 1033
