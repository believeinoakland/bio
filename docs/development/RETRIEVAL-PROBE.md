# RETRIEVAL PROBE: Conversion Plan probe 1, answered with actuals

FTS5 virtual tables versus an exported index, measured on the real workerd
SQLite the deployed Durable Object runs, not argued about. This is the
measurement S-8 could not make because it ran before FTS5 existed to compare,
and it is the input to the retrieval design conversation, not the design.

Nothing here ships a retrieval op. The plane is unchanged. What ships is the
harness (`bio-plane/test/retrieval-probe.mjs`, run with `npm run
probe:retrieval`) and this record.

## The blocker that was in the way is gone

The S-8 note and D-28's neighbours assumed FTS5 might not be usable inside a
Durable Object at all. It is. A probe that creates the virtual table on the
same workerd SQLite the deployed Store uses returns:

- `CREATE VIRTUAL TABLE ... USING fts5(...)` succeeds, `INSERT` and `MATCH`
  behave, and the `trigram` tokenizer (substring matching) also works.
- `fts4` is refused (`SQLITE_AUTH`), and `PRAGMA compile_options` and
  `sqlite_version()` are also refused by workerd's authorizer. FTS5 itself is
  not refused. So FTS5 is the full-text primitive available; FTS4 is not, and
  neither is introspection of how SQLite was compiled.

There is no prediction table to check these against: the Conversion Plan is not
in the corpus (D-28). These are actuals, recorded as actuals.

## What was measured, and how agreement was made meaningful

A search result is only comparable across implementations if the matching rule
is fixed first, so the probe fixes one v0 semantics and holds three
implementations to it:

- normalize(text) = lowercase, split on `[^a-z0-9]+`, keep tokens of length two
  or more.
- a query is a token set; a document matches if its token set contains every
  query token (AND).

Three implementations of that one rule:

1. **scan**, the ground truth: the normalized body in a plain column, matched by
   space-delimited `LIKE` with no index. A full table scan, the brute-force
   baseline, the same shape a whole-store pass takes today.
2. **fts5**: an `fts5(id, body, tokenize='ascii')` virtual table. The `ascii`
   tokenizer reproduces the normalized tokens exactly, so it indexes the same
   token stream the scan sees. One `MATCH` query, run inside the object.
3. **exported index**: a token to sorted-id inverted map, built inside the
   object, serialized to JSON, shipped out, parsed, and queried by intersecting
   postings lists outside the object.

The agreement standard is the one `op=audit` already set: an index that
disagrees with a scan is worse than no index. Every query must return the same
id set from all three, and the harness proves the agreement check actually
judges by first planting a divergence (silently dropping one document from one
token's postings) and confirming the scan catches it before trusting any pass.
The 30-document real corpus first passed for a reason that was not verified (a
single seed chunk hid a duplicate-insertion bug in the harness); scaling to
5,000 exposed it, which is the whole argument for measuring rather than
asserting.

## Actuals

Real corpus, the 30 bundles on biosmoke7, as the agreement anchor:

- three-way exact agreement across eight real queries (`sewer`, `transfer`,
  `sewer AND fund`, `auditor`, `daemon`, `fund AND statements`, and two
  zero-hit controls). Everything sub-millisecond. fts5 adds 152 KB to the DB
  for 110 KB of text; the exported index serializes to 37 KB.

Synthetic corpus, Zipfian vocabulary so postings lists have realistic spread,
min-over-five-repeats latency:

|                                   | 5,000    | 20,000   | shape                         |
|-----------------------------------|----------|----------|-------------------------------|
| fts5 build (populate)             | 88 ms    | 310 ms   | linear                        |
| fts5 index size (DB delta)        | 2,148 KB | 8,608 KB | linear, ~430 B/doc            |
| exported index build, in-object   | 151 ms   | 873 ms   | linear                        |
| exported index serialized         | 1,892 KB | 8,536 KB | linear, ~437 B/doc            |
| exported index parse, client      | 19 ms    | 25 ms    | linear                        |
| scan, any query                   | ~5-7 ms  | ~20-31 ms| linear in CORPUS, flat in hits|
| fts5, selective query (few hits)  | ~0 ms    | ~0 ms    | flat as corpus grows          |
| fts5, whole-corpus query          | ~6 ms    | ~25 ms   | tracks RESULT size            |
| exported, query once resident     | 0-2 ms   | 0-9 ms   | tracks RESULT size            |

Three-way exact agreement held at both scales after the harness bug was fixed.

## What the numbers say

- **The scan never gets cheaper for a selective query.** A four-hit query over
  20,000 documents still costs about 22 ms, because it reads the whole corpus
  every time. That is roughly 110 ms at 100,000 and about a second at a million,
  per search, whether the query hits four documents or four hundred thousand.
- **FTS5 cost tracks the result, not the corpus.** The rare needle costs about
  zero at 5,000 and about zero at 20,000. Real searches are selective, so FTS5
  stays cheap exactly where the scan cannot. It is slower than the scan only
  when the query matches most of the store, which is not what search is for.
- **The exported index is fastest once resident and most expensive to keep
  honest.** It is the smallest artifact and the quickest query, but it must be
  built in the object (873 ms at 20,000, inside budget but not free), shipped
  out (8.5 MB at 20,000, about 43 MB at 100,000), parsed, held in memory, and
  rebuilt on every promote, because the working corpus it indexes changes under
  it. Its speed is bought with movement and staleness.

## Recommendation: FTS5 inside the Durable Object

One direction, for three reasons that are not close:

1. Its cost tracks result size, so a group's searches stay cheap as its record
   grows. The scan pays the whole corpus on every search and the export pays to
   move and refresh a whole-corpus artifact; FTS5 pays for what it returns.
2. It is the shape the plane already proved and chose in D-26: one call in, an
   answer out, run where the data is. The exported index re-introduces exactly
   the per-call transfer and whole-artifact handling that D-26 removed from the
   audit pass, in a new place.
3. It keeps the index on the protected side of the two-bucket fence by
   construction. A search op is member-scope and the index never leaves the
   object. An exported index is a second copy of a working-corpus index that
   physically leaves the fence; anywhere it is cached becomes a working-corpus
   index outside the object, which is precisely the leak the kickoff named when
   it said no index may become a way around the fence.

The export wins only on already-resident query latency, and it buys that with
build cost, transfer, staleness, and a custody problem across the fence. The
trade is not worth it.

## Design questions, since answered

Bob settled all five on 2026-07-25, and probe 2 measured the four verbs this
probe did not touch. `RETRIEVAL-SUBSTRATE.md` supersedes this section and holds
the answers, the build order, and the fix for the `op=index` hole noted in
question 4. The questions as they stood:

The kickoff is right that retrieval has no technical design in the corpus and
that inferring one is the trap that cost the membership work a reconciliation.
The measurement settles the mechanism. It does not settle these, and none of
them has one obviously correct answer:

1. **Indexed surface.** Whether FTS5 indexes the whole of `bundle.md` including
   frontmatter, or only the title and the human-written sections. Frontmatter
   carries `source.locator` and `source.authority`, and a searchable copy of
   those is a fence-relevant surface even behind member authentication. The
   probe indexed the whole document to measure worst-case size; production must
   choose what is searchable.
2. **Result contract.** What a result returns: ids alone, or ids with a ranked
   snippet (FTS5 offers `bm25()` ranking and `snippet()`), and whether a result
   carries provenance into Context as the Roadmap's Search UX category
   requires. This shapes the op's signature.
3. **Visibility filtering.** A member-facing search must respect the three
   project-visibility positions and must not leak which projects are interested
   in which Information, the same obligation D-15 records for derived reverse
   edges. That couples a viewer-filtered search to the membership model, part of
   which is unbuilt; a flat member-scope search over the working corpus is not
   coupled and could come first.
4. **Public scope and an existing inconsistency.** Whether there is any public
   search at all, or member-only. Related and worth settling in the same
   conversation: `op=index` is currently granted to the `public` token class in
   `index.mjs`, while `buildIndex()` reads the working-corpus `bundles` table.
   No public token need be issued today, but the ACL states that working-corpus
   metadata is publicly readable, and the retrieval and fence design should
   decide on purpose whether that is intended.
5. **Maintenance.** FTS5 maintained transactionally inside `promote` (insert on
   creation, update on revision, delete on purge), over live rows only and not
   history. Mechanically straightforward; confirm live-only and that a purge
   drops the FTS row in the same transaction.

## Reproducing

```
cd bio-plane
npm run probe:retrieval            # 5,000 synthetic (default)
node test/retrieval-probe.mjs 20000
node test/retrieval-probe.mjs real # needs the 30 real bundle.md fetched to
                                   # /tmp/corpus/bundles.json first
```

The harness is a probe, not a battery suite, and is deliberately not in
`npm test`. The battery stays at its measured 52 seconds.
