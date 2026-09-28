# query-language (T10)

**Status** · session_018E96qPj3eH3p3P8yKxFQuJ · depth 2 · WORKING · handled B1

## J1 · QUESTION

R25 (N106), my reading; I build on it now and stop only if you answer otherwise.

1. **Signature.** As R25 writes it: a second argument, `compile({q, viewer, …}, {projection: {table, key}})`. With no second argument (or no `projection`) every statement is byte-identical to today's (the columns read from `bundles`). A `table` or `key` that is not a plain SQL identifier is ignored with a warning (the statements then read `bundles`), never interpolated; nothing throws.
2. **Which columns move.** Exactly retrieval R2's list plus `fts_id`: `schema_id produced_mode capability_tier source_locator source_authority source_retrieved source_status content_hash monitor_enabled monitor_frequency monitor_last_checked annotations_open reeval_flag reeval_since reeval_source fm_json` and the six `action_*` columns. These stay on `bundles`: record-core's (`bundle_id object_type group_id title current_state prior_state created last_updated criticality bundle_sha`) and the ones strength and inquiry write (`inquiry_capture_strength inquiry_connection_strength inquiry_basis_count`), since R61 moves only R2's columns. I mark the moved ones on my own `FIELDS` registry (`proj: true`), so no later module's table is named here.
3. **Shape.** Every statement joins `bundles b` to `<table> bp ON bp.<key> = b.bundle_id` and keys the text index through `bp.fts_id`; the gate stays over `b`.

Retrieval: `projection: {table: "bundle_projection", key: "bundle_id"}` is what it passes. If retrieval moves a different set of columns, tell me the list.
