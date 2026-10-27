# retrieval (T52)

**Status** · session_018BhcedyRp1uFhsb5WwxYio · depth 2 · WAITING: T52-101 names t51-fix2.test.mjs, but its R92 bracket assertions (lines 21-42) read the question excerpt that src/retrieval/index.mjs #questionExcerpt (line 855) builds with literal [ ] around the match, not the query-language MARK_OPEN/MARK_CLOSE marks. Reading A (best, applied): leave t51-fix2 unchanged, since the code it tests still marks with brackets. Reading B: move #questionExcerpt to MARK_OPEN/MARK_CLOSE (a src change, outside a test-only entry), then the test reads the marks. Which?
**Sessions** · 1
