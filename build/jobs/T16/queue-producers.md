# queue-producers (T16)

**Status** · session_016V7cL4g1HNxTFSpD4VFm58 · depth 2 · WORKING · handled B2

## J1 · REPORT

What I found outside my module (none edited):

1. **The merge order the draft names (§6) holds for my branch.** It carries the N345 arms (R4–R7) with R8, so the kinds `contradiction-duty`, `-lead`, `-plurality`, `side-corrected`, `tension-after-publication`, `contradiction-duty-unseen` and `contradiction-plurality-unseen` reach queue's mint once queue reads `feedItems`. Queue must have R1's new kinds (queuestate.mjs) before it consumes `feedItems`, or the mint refuses the whole feed `NO_SUCH_KIND` (queue R11) as soon as one candidate, corrected dependent, tension or notice exists. Without contradiction data, R8's items are exactly the kinds queue already catalogues. If you want them in two merges, I can put the four arms behind a second commit; tell me.
2. **queue (its code, removed by QUEUE's rewiring):** `#findingsExportPerformed` reads `Queue.EXPORT_LOG_LIMIT_DEFAULT`, which is never defined (`queue/index.mjs`:1771). The export log was asked with `limit: undefined` (publication's default, 200) and each item's `basis.bounds.limit` was undefined, so absent from the answer. Mine uses the imported `EXPORT_LOG_LIMIT_DEFAULT` (200), so `bounds.limit` now reads 200.
3. **queue (same):** `shared-inquiry-concluded-by-another-project`'s basis carried no `detail`, so no derivation (R10 / queue R16). Mine states one; the R10 test caught it.
4. **Paths that name `src/queue/proposals.mjs`**, which go stale when QUEUE removes it (legacy-tests' and queue's to re-anchor, none broken today): `test/derivation-bounds.test.mjs`:714, :725 (the `queue/proposals.mjs` pin in the ceiling's list); `test/d125-findingmute.test.mjs`:48 (a comment naming the corpus); `src/queuestate.mjs`:97, :100 (queue's cardinality sentence says "LIVE: queue/proposals.mjs"); and `dist/bio-plane.bundled.mjs` (not_product's bundle, regenerated at the close). No hit in `civicos-ui/` or affordances' lists for anything I added.
5. **Legacy tests:** none broken by my change. The seven source-scanning suites I ran (bounds, derivation-bounds, gate-reads, hygiene, machine-fences, machinefences-dec49, meaning-bounds) are red on `tranche/T16` with or without my files, with identical failing subtests. The only difference was machinefences-dec49's provenance note about staged files, which went away once they were committed.
6. **Reevaluation R8's `source` kind (K547):** no producer here reads R8 (`onBasisChanged` / `changesOf`). The feed reads reevaluation through `notices` (R14) and `correctedDependents` (R27) only, so there was nothing to treat as `passage`.

## J2 · COMPLETE

Job complete at `job/T16/queue-producers` @ 317b36ab56. It is ready to merge. R8 and R1–R3 are met and tested, and so are N345's R4–R7; see J1 (1) for the merge order.

**Entries applied** (plan layer 11, N363; K507, K531, K533)
- New module `bio-plane/src/queue-producers/`:
  - `index.mjs`: `QueueProducers`, `queueProducersOf(ctx, deps)`, re-exporting `proposalFindingItems` and `CARDINALITY_EXCEEDED`.
  - `proposals.mjs`: queue's file whole, its cross-references re-pointed.
  - It registers nothing and holds no check row.
- The producers came from queue's code as the draft's §1 table says (re-measured on `tranche/T16`: `queue/index.mjs` :544–2100, :2328–2412, :3599–3643; `proposals.mjs` whole), with their meaning unchanged:
  - `#queueAncestors(x, viewer)` became queue's `homesOf(x)`, and `#queueOptions(x, viewer, identity)` became queue's `optionsOf(x)`, both passed in by R8 and held for the one synchronous read.
  - `#conditionHomes` and `#homesAt` are built over `homesOf`.
  - No item carries `disposition` or `catalogue_id`; export-performed's `catalogue_id` is gone, for queue to stamp.
  - The lead keeps only `LEAD_TAKE_UP` (R9). The set-aside stays in queue's mint.
- **R8** `feedItems({member, viewer, now, identity, homesOf, optionsOf}) → {items, facts}`:
  - `items` are R1–R7 and R9, in the order queue assembled them.
  - `facts` are `objective_gap {bound, truncated}`, `unattributed {count, inquiries}`, `contradiction {bound, truncated}`, and `dispositions`, from the one `proposalsFeed(now)` read that the FINDINGs came from.
  - It writes nothing. With no walk passed, an item is ungrouped, never given a home.
- **N352:** `#queueSharedInquiryCandidates` reads `membership.hiddenBundles(viewer)` (R88). No copy of queue's `#hiddenBundles` is kept.
- **N345:**
  - **R4:** `contradiction.candidatesFor({on: {project}, viewer})` for each joined (or leaving) visible project, at most 50 in id order (every visible project with no member), following the cursor for at most 20 pages. The kinds: duty open, taken up or explained becomes `OBLIGATION::contradiction::<id>`; lead open and plurality open become `FINDING::`. Each candidate is counted once, with the member's projects it reaches in `basis.projects`, and homed (as `#homesAt`) under both sides' bundles.
  - **R5:** `reevaluation.correctedDependents` paged, one `FINDING::side-corrected::<dependent>::<candidate>` each, homed under the dependent.
  - **R6:** `publication.caseTensions({project})` for each visible project the member owns (`membership.projectOwners`), at most 50. One item per (case, candidate); members the viewer cannot see are dropped, and a tension naming none makes no item. No member, or a non-owner, gets none.
  - **R7:** `contradiction.conflictNotices({project, viewer})` for R4's projects, one `<CLASS>::contradiction-unseen::<candidate>` per candidate: duty is an OBLIGATION, plurality a FINDING. It is homed from the seen side only. It carries the fixed sentence, `asked_by_another`, each of the member's party projects with its opt-in, reveal, parties and relay, and merged `responses`. It has no count, bound or truncated flag of its own. With no member, none.
- **Deferred:** R9 (REC-202, not in T16) is a `test.todo` naming its cause.
- **Improvements in my own module:**
  - The export-performed bound (J1 (2)).
  - concluded-elsewhere's basis `detail` (J1 (3)).
  - The dead `identity` parameters are dropped from the producers.
  - `#participatingProjects(me, viewer, cap)` is shared by objective-gap and R4/R7.
- **Not yet met marks my work meets (for you to strike, K460):**
  - queue-producers' status line: "Not yet met: R4–R7 (N345), R8 (N363)".
  - R4, R5, R6 and R7 each carry "*(not yet met: N345)*"; R8 carries "*(not yet met: N363)*".
  - R9's mark stays.
- **Check rows added, moved or retired:** none (this module holds no row), so nothing is awaiting a stamp.
- **Decisions I made, for `rulings.md` if you keep them:**
  - `proposalsFeed` is asked with the read's resolved `now` (ms) rather than queue's raw `nowMs`, one instant for every producer.
  - R4's and R7's projects count "joined" as membership R74's joined or leaving, as objective-gap does.
  - R4, R5 and R6 page their provider for at most 20 pages, the cut stated on each item's `basis.bound`. R7 pages the same way but states nothing (R7, R11).
  - R6 and R7 give a caller with no member nothing.

**Tests** (`bio-plane/test/m/queue-producers/`, their own `world.mjs`: record-core, membership and provenance's schema real, the rest fakes; `homesOf` is a gated walk in queue R7's shape, and `optionsOf` records its subjects):
- `producers.test.mjs` (R2, R3) and `proposals.test.mjs` (R2, R8, R10, R11) were moved from queue's and pass unchanged in substance. The disposition and catalogue asserts, which are queue's, are dropped.
- `feeditems.test.mjs` covers R8, R1, R9 (todo), R10, R11, R12 and R13.
- `contradictions.test.mjs` covers R4 (twice), R5, R6, and R7 with R11: the DEC-85 scenario of two projects on two sides, one opt-in, both opt-ins and the relay.
- `node --test test/m/queue-producers/`: tests 28, pass 27, fail 0, todo 1.

**Checks** (civicos-process @ a7155f0):
- format: 72 modules, 67 requirements files; 0 failures.
- architecture: 7 product files, 31 relative imports; 0 failures.
- coverage: 13 of 13 live requirement ids named by a test; 0 failures.
- ownership: 8 files changed by queue-producers between tranche/T16 and HEAD; 0 failures.

**Found in other modules:** J1.

Size (session_016V7cL4g1HNxTFSpD4VFm58): test runs 14, module lines 2376
