# retrieval (T18)

**Status** · session_01TCHKCPT9Pzu7QFDxUNXe3m · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R62's test and query-language R26 (same layer, concurrent). R62 says every compile this module runs names each registered relation to query-language (its R26), so the field reads it. Whether compile READS through `{fields: {...}}` is query-language's R26, which QUERY-LANGUAGE #3 has not yet built (its branch has no R26 code). A full-compliance R62 test (a registered field whose value is held only in the registered table is found, filtered, faceted and sorted exactly as the same value on `bundles` was) therefore fails on my branch alone and passes only with query-language's R26.

My best reading, which I am carrying out now: I implement R62 whole (registerField with FIELD_MALFORMED / FIELD_DECLARED, total-order application, every compile passing `{projection, fields}`), and write the full test, which asserts both halves: (a) the answers with a registration equal those without (value in both places), and (b) the value held only in the registered table reads as it did on `bundles`. I verify (b) against a local merge of `origin/job/T18/query-language` once its R26 is pushed (nothing of it committed on my branch), and record that. Recommendation: merge query-language early (before retrieval's completion is merged), so my branch's test run is green on the tranche branch; until then (b) is red on my branch alone. If you prefer (b) marked `todo` until the merge, say so. I carry on with the eight converts meanwhile.

## J2 · COMPLETE

Completion (RETRIEVAL #6, T18).

**Entries applied.**
- N137 with N136 (K75 (2), K649 (6)): R62 `registerField(module, field, {table, key, col})` in `src/retrieval/index.mjs`: refuses FIELD_MALFORMED (no module; a field outside `FIELDS`; a projection column of R2, by `proj` or by column; a table, key or column that is not an SQL identifier) and FIELD_DECLARED (a field registered twice, `declaredBy` named); applies in the modules' total order (membership's `MODULE_ORDER`); every `compile` this module runs (search, its widening, meaningRows, selectionCreate both kinds, selectionResolve both kinds) passes `{projection, fields}` (query-language R25, R26). Tests: `fields.test.mjs` (4, both halves of K667).
- Converts, each old suite's retrieval share proven by requirement-named tests at the interface (old suites not deleted, K619): `observation-content` → `observation-content.test.mjs` (R24, R36–R39, R42; 3 tests); `observation-log` → `observation-log.test.mjs` (R14, R24, R32, R35, R36, R41, R43, R46: D-516's watermark band through every reader; 7); `observation-meaning` → `observation-meaning.test.mjs` (R36, R39, R45, R46, R50; 4); `meaningquery` and `rec108-cache-asof` → `legs.test.mjs` (R6–R8, R11, R12, R16, R29, R55; 7); `content-arm` → `content-arm.test.mjs` (R11, R13, R29, R58; 4); `meaningread` → `meaningread.test.mjs` (R10, R11, R13, R14, R28, R29; 7); `passage-arm` → `passage-arm.test.mjs` (R11, R13–R15, R28, R29, R54; 7). Each file's header names what of its suite is another module's (query-language's compiler and plan text, observation-log's writers and pure rule, extraction's index writer, strength's cache contract, inquiry's and entities' writers, control-plane's ops table) or source text (dropped, P7), and the stale pins not converted (observation-content B13/B14: pre-index REC-91 wording).
- No row moved or changed in the catalogue, the store or `src/index.mjs` (none `awaiting stamp`); legacy-store and legacy-checks untouched (ownership: 0 lines).

**Deferred.** None.

**Found in other modules (for BOB).** None confirmed as a flaw. One observation for membership, as its R43 states it: a viewer stamp `member:<id>` with no roster row reads non-project bundles (the participant clause fences only project bundles); the meaningread worker left that viewer out rather than assert it here. If R43 means an unenrolled member id is unrecognised (DENY), that is membership's.

**Tests and checks run.** `node --test bio-plane/test/m/retrieval/`: `tests 113, pass 113, fail 0` after merging `tranche/T18` (B3: query-language's R26 in, R62's read-through half green). Layer tests: none named in `build/manifest.md`. Checks (process repo): format `82 modules, 77 requirements files; 0 failures`; architecture `0 failures`; coverage `62 of 62 live requirement ids named by a test; 0 failures`; ownership `legacy-store: 0 line(s) added, 0 removed; legacy-checks: 0 line(s) added, 0 removed; 0 failures`.

Size (session_01TCHKCPT9Pzu7QFDxUNXe3m): test runs 16, module lines 2233
