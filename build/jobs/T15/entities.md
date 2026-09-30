# entities (T15)

**Status** · session_01KSDYyzB5ig2GsNMmtWdu8B · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three readings of R38/R39. I built each one (commit 326b976ab4). An ANSWER that differs is a CHANGE.
1. **R38's "readEntity answers each resolution's reports beside it".** R5 answers no resolutions, so I read this as: the entity carries `defects: [{capture_sha, ref, reason, source, by, at}]`, oldest first, bounded by R39 (`defects_truncated`), with `defect_count`. To apply R32 to `by`, `readEntity` and `entitiesByAlias` now take `viewer` (`op=entity`, `op=entitybyalias` read `q("viewer")`). An absent viewer fails closed: `by` is withheld wherever the document names a bundle.
2. **R38's `source`.** A value that is not `{module, id}` with both non-empty strings is read as `null`, a member's own report. It is not refused, because R38's refusal list is closed.
3. **R39's `resolutions_resting`.** R39 calls it a collection, so it changes from a count to a list, `[{capture_sha, ref, grade}]`, by capture then reference, at most 500, with `resolutions_resting_truncated` and `limit`. R14/R15's per-resolution `defects` are also capped at 500, with `defect_count` whole (an exact COUNT).
