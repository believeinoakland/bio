# BOB to queue (T7)

**Read** · handled J1

## B1 · START

Depth 2. Your entries are in `build/plan/current.md`, layer 11, with the forwarded items at the plan's foot ("Forwarded to these jobs at their start" and "Forwarded to later jobs in T7") naming you. Apply each only as far as the item gives it to you. The layers below are merged into `tranche/T7`, and so are their records (`build/jobs/T7/`), which the forwarded items cite. Your module is extracted per its map (`build/extraction/queue.md`) and requirements; the extraction rule of mechanics §12.2 holds for legacy-store. Several items ask queue to read other modules' tables through their services rather than in SQL by name; do that as it extracts.

## B2 · CHANGE

Correction to B1 (it replaces B1's last two sentences; the rest stands): this tranche does not extract queue. Apply only your entries in layer 11 (N107, N112's share, N114's share) and the forwarded items naming you, within your own paths (`bio-plane/src/queuestate.mjs`, `bio-plane/src/queue/`). Items that say "when queue extracts" (RUN-PRODUCTIONS #1 J2.6, AI-RUNS #2 J6.5) are for that later job: leave them. The same goes for anything that needs editing legacy-store's `#counts` or SQL, which is not yours here; REPORT it if you find it must change now.

## B3 · CHANGE

This replaces B2 and B1's last sentence; the rest of B1 stands.

This tranche does not extract your module whole. It applies only your layer-11 entries and the forwarded items that name you, as far as each gives them to you.
- Where an entry changes a legacy module in your `from`, the extraction rule of mechanics §12.2 holds. You may remove code, and you may rewire the legacy code to your module or to another module's service with an import and its uses. Queue's N112, which rewires `#counts` and `#obligationsBiasDebt` to read through retrieval and bias, is of this kind.
- An addition beyond that goes in a REPORT to me, not into the legacy module. Adding `pdfstructure` to legacy-store's `PROJECT_NAMING_READS_NOT` list is such an addition.
- Items that say "when queue extracts" (RUN-PRODUCTIONS #1 J2.6, AI-RUNS #2 J6.5) are for that later job. Leave them.

## B4 · ANSWER · re J1

(K209) I folded R1 and R9 on `tranche/T7` for N107. Merge the tranche.

**Q1.** Your reading is adopted. Name by test the ids whose code sits in your paths after this job: R1–R5, and N107's share of R9, R12 and R16. Test each at the interface for full compliance. Record the coverage failure for the rest (R6–R40, whose feed is still in legacy-store) as owed by queue's extraction job (N173). It does not bar your COMPLETE. Write no Miniflare suite for them here.

**Q2.** Folded as you proposed: R1 catalogues `cardinality_exceeded`, and R9 states the join, the standalone item and its key. Build the producer in `bio-plane/src/queue/` and rewire the store to call it (§12.2), with its tests.

**Q3.** Your reading is adopted: leave both reads as they are. The provider services are N171 (retrieval, bias), and queue rewires to them afterwards.

**Q4, Q5.** Build nothing of either in this tranche. They go to queue's extraction (N172). I will fold R1, R9 and R12 from your J1 proposals before that job, with `reevaluation` and `intent` joining queue's uses then.
