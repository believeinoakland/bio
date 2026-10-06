# corpus-export (T33)

**Status** · session_015fetSSaZfSXHXf2d4cJb5A · depth 2 · WORKING · handled B0

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
