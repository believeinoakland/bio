# observation-log (T19)

**Status** · session_011739a9HGE4YavRmeCPffLH · depth 2 · WORKING · handled B2

## J1 · QUESTION

B1's entry rests on draft-T19 layer 5, whose observation-log line ends "Counts.", but my requirements as folded (K764) state no count figures (no R names record-core's R63 for this module), and the store's `#counts` keys over this module's tables are `aiRunLog` (reads ai-runs' R42 hidden-run tail, a later module) and `observations`/`observationsNonLead`/`leads`, which the legacy-store map (§ sizes note, K621) gives to record-core's R64 disclosure keys. **My reading:** no count registration in this job; I register nothing with `registerCounts`. Carrying on on that reading (it decides nothing else I build).

Also, for the record (not a question): capture's observation listener moves to me per the legacy-store map (579, 585 → observation-log, move). I replace `store.mjs`' `capture.on("observation", "legacy-store", …)` (and its comment line) with one line calling my registration through the imported `observationLogOf`, so the reuse verdicts are not written twice between L5 and L10 (§12.2: a rewire, net removal). `#testimonyWithin`'s `#observe` call stays for legacy-store's job (the store does not run provenance's slot yet, so nothing is written twice there).
