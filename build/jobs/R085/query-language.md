# query-language (R085)

**Status** · session_01DiiUVwjsM1J2yZP34YaftH · depth 2 · COMPLETE · handled B1

## Completion (R085-21)

- **Entry applied:** R31. In `compile` (`bio-plane/src/query.mjs`), under `rows=passage`, a query with no `passage:` selector has its positive bare words, phrases, prefixes and `NEAR` groups (marked `bare` by the parser; `text:` atoms are not) rewritten into `passage:` match nodes, with the warning R31 names. Negated words, `text:` and selectors keep their meaning. The converted atoms leave `ctx.textAtoms`, so relevance and `plan.terms` do not weigh them, and `armSet(rowArm)` (the levels/axis scope) strips them with the passage arm: the bare word no longer narrows the scope to bundles whose own text holds it (diag item 1). `has:passage` is not a `passage:` term (no field), so bare words still convert beside it.
- **Test:** `R31 …` in `bio-plane/test/m/query-language/statements.test.mjs` (ids naming a document whose record text lacks the word: its units answer, with the warning; phrase, prefix, NEAR; levels scope; control `text:`; `passage:` no warning; negation; no `rows=passage` unchanged).
- **Deferred:** none. **Found in other modules:** none. No generated artifact of another module was rebuilt; `agent-worker`'s bundle takes query.mjs (manifest) and is stale until it is rebuilt: REPORT to BOB.
- **Ran:** `node --test bio-plane/test/m/query-language/`: 46 pass, 0 fail. `node --test bio-plane/test/m/retrieval/` (the users): 175 pass, 0 fail. format: 0 failures; architecture: 0 failures; coverage: 31 of 31 live ids named, 0 failures; ownership: 0 failures.

Size (session_01DiiUVwjsM1J2yZP34YaftH): test runs 4, module lines 2975

## J1 · COMPLETE

R085-21 done: R31 applied in compile (bare words under rows=passage read as passage: words, warning as R31 names; scope no longer keeps a bare-word text arm). query-language 46 pass; retrieval (users) 175 pass; format, architecture, coverage (31/31), ownership all 0 failures. REPORT: agent-worker's bundle takes query.mjs and is now stale; BOB regenerates it (merge order: query-language before agent-worker). Details in my record.
