# query-language (T50)

**Status** · session_01R6HaXpEWVvd8Ad3efpgvUB · depth 2 · COMPLETE · handled B0

## Completion

**Entry applied** · T50-61 (R33). The `page` shape now carries `snippet_from` (`"text"`, `"passage"` or `null`) beside `snippet`, both always columns. A text snippet is cut from `body`, else `title`, by column and only where `highlight()` changed that column's text (so `meta`, the locator and the authority never supply one, and a body that holds brackets, an ellipsis or a control character but no match is not a match). With no text snippet and a positive `passage:` term, the snippet is the first matching unit of the hit's captures (capture sha, then `seq`, then extent), cut with the same brackets, ellipsis and clamp (R12). A negated passage term, `passage:*` and a metadata term give `null`/`null`. `rows=passage`'s own snippet is unchanged. No sentence people read was added (the values are data tokens), so no setup-words key was needed; `setup-words` is not in this module's `uses` in `modules.json` and I did not import it.

**Deferred** · none. Existing inline English warnings in this module (R2, R5, R27, R31, R32 and others) predate plan rule 6 and were not touched by the entry; moving them to setup-words keys is a wording job for BOB to plan if wanted (the sentences R31/R32 name would need keys).

**Found in another module**
- Generated artifact stale by this change: `agent-worker/dist/agent-worker.bundled.mjs` (and its `.bundle.json`) now fail `agent-worker/test/requirements.test.mjs` R45 ("source ../bio-plane/src/query.mjs has changed since the bundle was built"). BOB regenerates at layer close: `node bio-plane/scripts/bundles.mjs` from the repository root. This is the only failure in that suite (24 of 25 pass; it passed before my change).
- `retrieval` must let `snippet_from` through if it maps page rows into hits (its R80/R82 name it); its 64 tests pass unchanged, so the hits already carry every column of the row.
- `build/requirements/query-language.md` still says R14's page carries "a `snippet`" and its status line marks R33 "not yet met (T50)"; BOB updates both.

**Tests and checks**
- `node --test bio-plane/test/m/query-language/`: tests 56, pass 56, fail 0 (new: `snippets.test.mjs`, nine tests naming R33; R14's column test updated to the new column list; seven of the nine fail on the code before the change).
- Users of the service: `bio-plane/test/m/retrieval/` tests 64, pass 64, fail 0; `bio-plane/test/m/answers/` tests 64, pass 64, fail 0; `agent-worker/test/` pass 24, fail 1 (R45, the stale bundle above).
- `node checks/format.mjs`: 171 modules, 169 requirements files; 0 failures. `architecture.mjs query-language`: 9 product files, 36 relative imports; 0 failures. `coverage.mjs query-language`: 33 of 33 live requirement ids named by a test; 0 failures. `ownership.mjs query-language tranche/T50`: 4 files changed; 0 failures.
- `node checks/run.mjs`: architecture 0 failures; coverage 30 failures in other modules (retrieval R80–R86, screens-* and others, none query-language) are the accepted reds of plan rule 5.

Size (session_01R6HaXpEWVvd8Ad3efpgvUB): test runs 9, module lines 3030

## J1 · COMPLETE

T50-61 done: R33  in the page shape (text/passage/null), text snippets cut from body or title only, never meta; passage hits carry the first matching unit's words (capture sha, then seq). Query-language 56/56 tests; retrieval 64/64, answers 64/64; checks format, architecture, coverage and ownership 0 failures. One thing for you: agent-worker's generated bundle is now stale (R45 of its suite, the only failure there) — regenerate with node bio-plane/scripts/bundles.mjs at layer close. Also update requirements R14's page columns and R33's not-yet-met mark. Record: build/jobs/T50/query-language.md.
