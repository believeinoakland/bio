# T53 query-language report (T53-622, K5794; the K5565 rows)

## Entries applied
- T53-622 · the regex sites at grammar.test.mjs:152-156 (the R5 drop table: `leg:capture`, `leg:bogus=x`, `leg:grade>=`, both `passage:` comparisons) and :283 (`NEAR(alpha beta, -2)`) now read the key the product reads, with the values it fills (`claims` and `keys` taken from `MEANING.leg.sub`). Converted with them: the three R2 literals (unknown field, `has:`, `sort:`).
- t33.test.mjs (baseline line 2): the seven R27 drop cases read their keys, anchored whole (civil-time's own refusal reason is matched as any text, not copied); the three `localize(key, English, …)` copies are `word(key, …)`; the R30 `SAVED_QUERY_DROPS` list of seven sentences is seven `word(...)` reads.
- K5565 B sites: four warnings held only as plain strings in `query.mjs` get keys, with the English unchanged: `query-language.query.projection_not_a_table`, `.fields_not_a_map`, `.words_read_as_passage`, `.bare_words_ignored_rows_leg`. Their copies in projection.test.mjs:92, fields.test.mjs:139-141 and statements.test.mjs:320, :368 read them by key. The eight A copies left in fields.test.mjs (`is not a table, a key and a column`, `is not a field`) read their keys too.
- C sites kept as test input: snippets.test.mjs's fixture phrases (`FRAG`), and statements.test.mjs:101's `/bundle_id ASC LIMIT/`, an SQL fragment rather than English.

## For BOB (outside this module's paths)
- `build/tests-english-baseline.json`: the three query-language lines (grammar 1, statements 1, t33 2) can drop to 0 or be removed. The ownership check refuses a job editing that file, which is why the last job's report claimed a removal its merge does not hold.
- The words check is not running in this product: there is no `build/words.json`, so `checks/run.mjs` skips it and the baseline is never read. I measured the sites by reading the files and by a scan of every test file for a static chunk of any `localize` sentence in `query.mjs`: no copy is left.
- The four new keys are declared by `localize()` in code. The merge regenerates `rows.mjs` (I regenerated it only for the run and restored it, so it is not in the diff).

## Found in other modules
- None.

**Met** · none

**Evidence**
- `node --import ./test/platform-sqlite.mjs --test test/m/query-language/*.test.mjs` (in bio-plane, rows regenerated): tests 62, pass 62, fail 0
- `node bio-plane/src/setup-words/build.mjs`: wrote rows.mjs, 8,136 to 8,140 code sentences, exactly the four keys added
- bio-plane/src/query.mjs:2024, :2038, :2290, :2316: the four warnings now go through `localize`

Tests: 62/62. Checks: format, architecture, coverage, fixtures, ownership: no new finding.
Size: test runs 1, module lines 3029. Head a5bb4e4ced.