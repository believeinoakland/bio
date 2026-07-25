# Retrieval substrate: what search, filter, list, sort, and select require of the plane

Status: measured, 2026-07-25. Reproduce with `npm run probe:facets` (capability
probe: `node test/facet-probe.mjs caps`; real-corpus anchor: `... real`).
Companion to RETRIEVAL-PROBE.md, which answered probe 1 for free text only.

## Why probe 2 exists

Probe 1 measured one shape: free-text term matching. It chose FTS5 inside the
Durable Object because cost tracks result size rather than corpus size.

The requirement is larger than free text. Searching is mining, and mining is a
component of the research, analysis, reporting, and action workflow the system
exists to serve. A capable surface is five verbs, not one:

| verb | what it is | what it demands of the plane |
| --- | --- | --- |
| search | defining what is looked for, from a bare string up to nested booleans with typed metadata selectors | a query language, a parser, and a compiler to SQL |
| filter | defining the subset of corpus or results to search within | indexed predicates on typed fields, and facet counts to populate the control |
| list | which values, metadata, and properties are shown per match | projection of arbitrary metadata alongside each hit, plus ranking and snippets |
| sort | the order results are presented in | ordering by any listed field, stably |
| select | picking which results are acted on | a stable, complete result set, not just the visible page |

Free text is a substrate element of this, not the whole of it. Filtering on typed
frontmatter, counting facets for a sidebar, ordering by an arbitrary field,
paging, and selecting a whole set are different query shapes with their own cost
curves. Assuming they inherit probe 1's curve would be an unverified pass, so
they are measured here.

## Finding 1: the engine has everything the query language needs

Attempted for real against the workerd SQLite the deployed plane runs. All
available:

| feature | why it matters to the UX |
| --- | --- |
| `AND` / `OR` / `NOT`, nested parens | nested boolean structure in the query bar |
| quoted phrases | `"service fund"` as one unit |
| prefix `audit*` | type-ahead and stem-ish matching without a stemmer |
| `NEAR(a b, n)` | proximity, which is what "these two ideas together" usually means |
| `bm25()` ranking | relevance order, not just id order |
| `snippet()`, `highlight()` | the rich listing: a match shown in context with the hit marked |
| `unicode61` tokenizer, case-insensitive | queries match regardless of case |
| column-scoped `title:sewer` | restricting a term to one text field |
| `json_extract`, `json_each`, `json_valid` | querying frontmatter that no column projects |
| generated columns, index on expression | making an unprojected JSON field indexed and fast |
| `EXPLAIN QUERY PLAN` | proving an index is used rather than believing it |

Two consequences. First, Google-like syntax compiles almost entirely into
constructs that already exist, so the query language is a parser and a compiler
rather than a search engine. Second, JSON1 plus generated columns plus expression
indexes means heterogeneous frontmatter does not need a separate schema.

## Finding 2: frontmatter is heterogeneous, and the current projection covers about half of it

Read from the real 30-bundle corpus. `bundles` already projects `object_type`,
`group_id`, `title`, `current_state`, `prior_state`, `created`, `last_updated`,
`criticality`, `classification`. Present in real frontmatter and not projected:

- `schema` (`information@1`, `information@2`, `problem@1`, `project@1`)
- `produced_by.mode` (`interactive_chat`, `agent`), `produced_by.capability_tier`
- `source.locator`, `source.authority`, `source.retrieved`
- `source_status` (`unchanged`, `modified`), `content_hash`
- `monitoring.enabled`, `monitoring.frequency`, `monitoring.last_checked`
- `annotations_open`, `reeval_pending.flag` / `.since` / `.source`
- `visuals`, and the per-type fields: `surfaced_by`, `disposition_reason`,
  `objective`, `workproduct_state`, `evaluations`

The per-type fields are the structural point. `information@1`, `information@2`,
`problem@1`, and `project@1` carry different field sets, and schema versions will
keep arriving. A fixed column set cannot be the whole answer.

## Finding 3: typed columns beat a facet table, and JSON1 covers the rest

Two candidate metadata substrates were built over the same corpus and held to
exact agreement with an unindexed ground truth:

- WIDE: one indexed typed column per field, which is what `bundles` already is.
- EAV: `facets(field, value, row)` rows, one shape absorbing any frontmatter key.

WIDE wins on every axis once the filterable columns are indexed:

| | WIDE + FTS5 | EAV |
| --- | --- | --- |
| build cost per doc | ~28us | ~258us (~9x) |
| index space per doc | ~430B for FTS5 text | ~2.4KB (~5.5x the text index) |
| query latency | equal or faster on every shape | never faster once WIDE is indexed |

EAV is rejected. Its one advantage was absorbing unknown fields, and JSON1 with a
generated column and an expression index does that without a second table and
without the write amplification. So: typed indexed columns for the fields the UX
filters and sorts on, and a JSON column with generated columns promoted as
needed for the long, per-schema tail.

## Finding 4: indexing the filter fields is the difference between a seek and a scan

Before indexes, filtering on `current_state` produced
`SCAN m USING INDEX sqlite_autoindex_meta_1`, a full table scan riding the id
index. After, `SEARCH m USING INDEX meta_current_state (current_state=?)`. The
plan is recorded rather than the latency alone, because at 20k a scan is still
fast enough to look like success. It is the curve that matters: a scan grows with
the corpus, a seek tracks the result. Same property probe 1 chose FTS5 for.

## Actuals at 20,000 documents

Min of five runs. `truth` is the unindexed ground-truth implementation, shown to
give the honest baseline the indexed paths are beating. All shapes agree exactly
with it, and separately on the real 30-bundle corpus, where every shape is under
10ms.

| shape | hits | truth | measured |
| --- | --- | --- | --- |
| text, selective | 40 | 1018ms | 4ms |
| text, broad | 19,987 | 626ms | 34ms |
| metadata only, rare value | 634 | 200ms | 5ms |
| metadata only, dominant value | 17,212 | 197ms | 29ms |
| metadata, two fields | 4,746 | 238ms | 17ms |
| text AND metadata, selective | 34 | 516ms | 3ms |
| text AND metadata, broad | 11,252 | 483ms | 25ms |
| metadata AND time range | 9,778 | 210ms | 22ms |
| sorted by `last_updated` desc | 19,987 | 652ms | 45ms |
| sorted by `source_authority` | 17,212 | 226ms | 37ms |

Compound booleans mixing text with metadata, which FTS5 `MATCH` cannot express
alone because it only knows the text table:

| shape | measured |
| --- | --- |
| `(text:rare OR state:X) AND type:Y` | 5ms |
| `(text:broad OR state:X) AND type:Y` | 46ms |
| `type:Y NOT text:rare` | 32ms |
| `type:Y NOT text:broad` | 12ms |

Facet counts, which is what a filter sidebar must render:

| over | measured |
| --- | --- |
| whole corpus, 20,000 rows | 5ms |
| after a selective text filter, 40 rows | 3ms |
| after a broad text filter, 19,987 rows | 11ms |
| after a metadata filter, 17,212 rows | 4ms |

Listing, paging, ranking, selection:

| operation | measured |
| --- | --- |
| first page, `LIMIT 50` | 8ms |
| deep page, `OFFSET 2000` | 15ms |
| select-all, every id in a 19,987 set | 37ms |
| ranked top 50 with bm25 and snippets | 21ms |

Nothing exceeds ~46ms at 20k, including the deliberately pessimal shapes. The
sidebar is affordable, which was the open risk: a facet count is an aggregate
over the whole filtered set and does not track result size, but at 5ms over
20,000 rows it does not need to.

## What the measurements constrain in the UX

**Sort needs a declared stable tiebreaker.** The probe's ground truth disagreed
with both indexed paths at 20k on the sorted shape only, because it applied sort
direction to the tiebreaker as well as the sort field. At 30 documents every
timestamp was distinct, there were no ties, and it agreed for a reason that had
not been verified. Real corpora tie heavily on `current_state`, `criticality`,
and coarse dates. Without a declared stable tiebreak, paging is not just
inconsistent, it is wrong: a row can appear on two pages or on none. Every sort
compiles to `ORDER BY <field> <dir>, id ASC`.

**Select-all is a different request from a page.** Acting on a selection needs
every id in the set, not the 50 on screen. That is 37ms and roughly 400KB of ids
for a 20k set. It is affordable but it is a distinct operation with a distinct
payload, and the result set must be stable between the moment of selection and
the moment of action, or the action lands on a set the operator never saw.

**Ranking and id order are different orders.** bm25 relevance is what a bare text
search should return; explicit `sort:` overrides it. Both are cheap; the contract
has to say which is the default.

## Recommendation

One substrate, inside the Durable Object:

1. FTS5 over the text surface, `unicode61` tokenizer, rowid aligned with the
   metadata table so text-plus-metadata is an integer join.
2. Typed, indexed columns for every field the UX filters or sorts on. Extend the
   projection to cover the unprojected frontmatter listed in finding 2.
3. A JSON column holding the full frontmatter, with generated columns and
   expression indexes promoted for per-schema fields as they are needed.
4. Query compilation: text arms into one `MATCH`, metadata arms into indexed
   predicates, `AND` as intersect, `OR` as union, `NOT` as except, always with a
   stable id tiebreak.
5. Facet counts as `GROUP BY` on an indexed column over the current filtered set.
6. Maintained transactionally inside the same write that changes a bundle, so the
   index cannot diverge from the corpus.

This keeps the whole surface behind the two-bucket fence by construction and
keeps the shape D-26 chose: one call in, one answer out, run where the data is.

## Open, and not decided by measurement

1. Which text and which metadata fields are searchable, and to whom. `source.locator`
   and `source.authority` are the citation surface and also a minable index.
2. The result contract: ids, ranked snippets, or full provenance per hit.
3. Whether results are filtered by the viewer's position now or when the
   membership model exists (D-15).
4. Whether working-corpus metadata is public, given `op=index` is granted to the
   `public` token class while reading the working corpus.
5. Result-set stability for selection: whether a selection is a set of ids held by
   the client or a server-side snapshot the action refers to.
