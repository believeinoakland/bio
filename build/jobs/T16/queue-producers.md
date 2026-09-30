# queue-producers (T16)

**Status** · session_016V7cL4g1HNxTFSpD4VFm58 · depth 2 · COMPLETE · handled B1

## J1 · REPORT

What I found outside my module (none edited):

1. **The merge order the draft names (§6) holds for my branch.** It carries the N345 arms (R4–R7) with R8, so the kinds `contradiction-duty`, `-lead`, `-plurality`, `side-corrected`, `tension-after-publication`, `contradiction-duty-unseen` and `contradiction-plurality-unseen` reach queue's mint once queue reads `feedItems`. Queue must have R1's new kinds (queuestate.mjs) before it consumes `feedItems`, or the mint refuses the whole feed `NO_SUCH_KIND` (queue R11) as soon as one candidate, corrected dependent, tension or notice exists. Without contradiction data, R8's items are exactly the kinds queue already catalogues. If you want them in two merges, I can put the four arms behind a second commit; tell me.
2. **queue (its code, removed by QUEUE's rewiring):** `#findingsExportPerformed` reads `Queue.EXPORT_LOG_LIMIT_DEFAULT`, which is never defined (`queue/index.mjs`:1771). The export log was asked with `limit: undefined` (publication's default, 200) and each item's `basis.bounds.limit` was undefined, so absent from the answer. Mine uses the imported `EXPORT_LOG_LIMIT_DEFAULT` (200), so `bounds.limit` now reads 200.
3. **queue (same):** `shared-inquiry-concluded-by-another-project`'s basis carried no `detail`, so no derivation (R10 / queue R16). Mine states one; the R10 test caught it.
4. **Paths that name `src/queue/proposals.mjs`**, which go stale when QUEUE removes it (legacy-tests' and queue's to re-anchor, none broken today): `test/derivation-bounds.test.mjs`:714, :725 (the `queue/proposals.mjs` pin in the ceiling's list); `test/d125-findingmute.test.mjs`:48 (a comment naming the corpus); `src/queuestate.mjs`:97, :100 (queue's cardinality sentence says "LIVE: queue/proposals.mjs"); and `dist/bio-plane.bundled.mjs` (not_product's bundle, regenerated at the close). No hit in `civicos-ui/` or affordances' lists for anything I added.
5. **Legacy tests:** none broken by my change. The seven source-scanning suites I ran (bounds, derivation-bounds, gate-reads, hygiene, machine-fences, machinefences-dec49, meaning-bounds) are red on `tranche/T16` with or without my files, with identical failing subtests. The only difference was machinefences-dec49's provenance note about staged files, which went away once they were committed.
6. **Reevaluation R8's `source` kind (K547):** no producer here reads R8 (`onBasisChanged` / `changesOf`). The feed reads reevaluation through `notices` (R14) and `correctedDependents` (R27) only, so there was nothing to treat as `passage`.
