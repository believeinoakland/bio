# entities (T15)

**Status** · session_01KSDYyzB5ig2GsNMmtWdu8B · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

Three readings of R38/R39. I built each one (commit 326b976ab4). An ANSWER that differs is a CHANGE.
1. **R38's "readEntity answers each resolution's reports beside it".** R5 answers no resolutions, so I read this as: the entity carries `defects: [{capture_sha, ref, reason, source, by, at}]`, oldest first, bounded by R39 (`defects_truncated`), with `defect_count`. To apply R32 to `by`, `readEntity` and `entitiesByAlias` now take `viewer` (`op=entity`, `op=entitybyalias` read `q("viewer")`). An absent viewer fails closed: `by` is withheld wherever the document names a bundle.
2. **R38's `source`.** A value that is not `{module, id}` with both non-empty strings is read as `null`, a member's own report. It is not refused, because R38's refusal list is closed.
3. **R39's `resolutions_resting`.** R39 calls it a collection, so it changes from a count to a list, `[{capture_sha, ref, grade}]`, by capture then reference, at most 500, with `resolutions_resting_truncated` and `limit`. R14/R15's per-resolution `defects` are also capped at 500, with `defect_count` whole (an exact COUNT).

## J2 · REPORT

Found in other modules while applying R39 (commit 326b976ab4):
1. **intent: red test.** `test/m/intent/bounds.test.mjs`:77 ("R4 progress measures at most 1,000…") fails: it expects [1000, 1000, …] and gets [501, 501, …]. It passes on `tranche/T15`. Intent's `#measure` (`src/intent/index.mjs`:371) walks the anchor's related entities through `readEntity(...).entity.relations`. R39 now bounds that list at 500 and publishes `relations_truncated`, which intent does not read. So intent's R4 either reads `relations_truncated` into its own `truncated`, or needs a relation-walk service from entities (a requirements change, which is yours to decide). I changed nothing in intent.
2. **control-plane (layer 11):** route `op=resolutiondefect` → `reportResolutionDefect(body)`, stamping `by` (R4). Also stamp `viewer` on `op=entity` and `op=entitybyalias`: they read it now (R38/R32 on `by`). The DO entry `resolutiondefect` is in `entitiesOps`.
3. **Generated artifacts, stale, not rebuilt (§14):** `bio-plane/dist/bio-plane.bundled.mjs` and `agent-worker/dist/agent-worker.bundled.mjs`, against `src/entities/{index,checks,schema}.mjs`.
4. **legacy-tests:** `test/meaning-bounds.test.mjs` fails as a whole file on `tranche/T15` with or without this change, so I could not measure it. R39 should take `aliaswithdraw` and `entity` off its BARE roster (the two members its 38 → 40 note reported to entities). Its ceiling and floor are legacy-tests' to move.
5. **promotion (N318):** row **C-91.7 `NO_SUCH_RESOLUTION`** was added at layer 5: `awaiting stamp` for T16.
