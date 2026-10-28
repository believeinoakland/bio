# query-language (T53)

**Status** · session_018BhcegBwStEWaxuJ9S9vfM · depth 2 · COMPLETE
**Sessions** · 2

## Completion (2026-10-28)

# T53 query-language report (T53-167, K5565 · English in tests)

## Entries applied
- T53-167 · K5565 · English in tests: converted the module's English-in-test sites to the word key and its values.
  - grammar.test.mjs: unclosed-parenthesis, fm-path, "has no word" and distance warnings now assert the key (`word` / `exact`).
  - converts.test.mjs: the unknown sub-field warning asserts its key with the arm's real sub-field list (`MEANING.leg.sub`).
  - snippets.test.mjs: the fixture phrases are named once in `FRAG` and used both to build the unit text and to assert; no regex literal of English remains.
  - t33.test.mjs: the field note's detail asserts its key with the same vars the product fills; the money-list warning asserts its key.
  - build/tests-english-baseline.json: removed the two query-language lines that now hold no English (grammar, t33). Other modules' lines were not touched.

## Not done, and why
- statements.test.mjs:101 `/bundle_id ASC LIMIT/` is an SQL fragment, not English. The census flagged it (class B); the words check does not count it as a failure (testenglish 0). Its baseline line (1) is kept. Converting it would need a key for generated SQL, which no word row holds.
- t33.test.mjs:192 is a comment that the census picked up by mistake; it asserts nothing.

## Found in other modules
- None.

## Checks
- `node --import ./test/platform-sqlite.mjs --test test/m/query-language/*.test.mjs`: 62 pass, 0 fail.
- `node /home/user/civicos-process/checks/words.mjs .`: testenglish 0; 0 failures.

**Met** · none

Tests: 62/62. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegBwStEWaxuJ9S9vfM): test runs 1, module lines 3029
