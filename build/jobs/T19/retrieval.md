# retrieval (T19)

**Status** · session_01ChtF63P7fpv844FiEpcFRv · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Best reading, which I am carrying out unless you answer otherwise: your START says to remove the moved code from `store.mjs` in my layer (rule 5), while R66's last sentence and R67's say legacy-store's own job deletes the four explicit arms, `listBundles`, `buildIndex`, `#withRoute`, `#viewerSees` and the `retrievalOf(…).counts(hid)` call. I read START as the newer word for the moved code: I delete `#withRoute`, `listBundles`, `buildIndex`, `#viewerSees` and the four arms `image`, `file`, `list`, `index` from `store.mjs` (my spread at :1785 already comes after them and wins, so nothing changes on the wire), plus any import name in `store.mjs` those were its last users of. I leave the `#counts` call `retrievalOf(this.ctx).counts(hid)` and its three keys to legacy-store, as R67 says: my registration answers the same three figures through `recordOf(…).counts(hid)`, which `#counts` already spreads last, so the values are identical either way. One consequence: `test/project-sight.control.mjs`'s arm `sight-via-redactor` (a hand-run control, not in any battery) anchors on the `#viewerSees` line and goes stale; I report it rather than edit it (not my path).

## J2 · COMPLETE

**Completion record.** Branch `job/T19/retrieval`, tranche merged through B4 (observation-log, connections), conflict-free.

**Entries applied** (`current.md` layer 5, retrieval; `draft-T19.md` layer 5; B1, B2):
- legacy-store's share into retrieval: `listBundles` (with `#withRoute` over provenance's `routeFinding`), `buildIndex`, and the gated `readImage`/`readFile` (membership's `inSight`, replacing the store's `#viewerSees`), with the routes `list`, `index`, `image`, `file` in `retrievalRoutes`. Behaviour unchanged (same SQL, same envelope, same clamping and bare-array arm).
- Counts: `registerCounts("retrieval", ["indexed", "selections", "selectionItems"], counts)` once per storage in `retrievalOf` (`RETRIEVAL_COUNT_KEYS` exported). A refusal throws, as content and capture do.
- `store.mjs` (rule 5, per K804): removed `#withRoute`, `listBundles`, `buildIndex`, `#viewerSees`, the four arms `image`/`file`/`list`/`index`, and the import name `routeFinding`, which they were the last user of. `normalizeType`, `viewerPredicate` and `membershipOf` still have other users there. Net: +0/−155 lines (the one edited line is the import). The `#counts` call `retrievalOf(this.ctx).counts(hid)` and its three keys stay for legacy-store (L10). The values are identical, because `#counts` spreads `recordOf(…).counts(hid)` last.
- Rule 1 re-points: `src/retrieval/index.mjs` (`normalizeType` from `record-grammar/types.mjs`), `projection.mjs` (`parseFrontmatter` from `record-grammar/frontmatter.mjs`, `normalizeType` from `types.mjs`), `test/m/retrieval/decoration.test.mjs` (`normalizeType`). No retrieval file imports `bio-checks.mjs` now.

**Requirements met and their tests** (for striking the marks):
- R58: `projection.test.mjs` "R58: migrate() … retrievalRoutes answers every op of R1–R54 and R63–R65" (op list now includes the four).
- R63: `roster.test.mjs`, four tests: the gate over every viewer kind; the route as `routeFinding` over the standing mark; the type alias, state, after and the combined filters; the bare array vs. the paged envelope, cursor walk, 5,000 bound and gated total. Also "R63, R64: neither read writes anything".
- R64: `roster.test.mjs` "R64: buildIndex …".
- R65: `roster.test.mjs` "R65: readImage and readFile …" (every viewer × every id, hidden answers as absent).
- R66: `roster.test.mjs` "R66: retrievalRoutes holds list …" (each route equals the service for its parameters, an empty `after` is none, no stamp sees nothing).
- R67: `roster.test.mjs` "R67: retrieval registers …" (record-core's counts equal retrieval's for every viewer; the keys are held by retrieval, and a second registration is refused).

**Deferred:** nothing.

**Found elsewhere (for BOB):**
- `bio-plane/test/project-sight.control.mjs`, arm `sight-via-redactor`: its anchor is the deleted `#viewerSees` line in `store.mjs`, so the arm is now stale. It is a hand-run control, outside any battery, and not on my path (B2: carried to legacy-store L10).
- Old suites that read `store.mjs`'s text or `listBundles`: `test/system/meaning-bounds.test.mjs` (a source walk of `store.mjs`; its R63 licence comment names `store.mjs:listBundles`), `test/system/gate-reads.test.mjs` (its header control names `store.mjs listBundles`), and `test/provenance-marker.test.mjs`. All three were already red before this job (the last imports the deleted `ROUTE_MARK_CHECKS` from the catalogue), and they fail the same way after it. Left for legacy-tests at the release (K619: not deleted).
- No generated artifact made stale: retrieval feeds no bundle in the manifest's table.

**Tests and checks run:**
- `node --test test/m/retrieval/`: tests 122, pass 122, fail 0 (113 before; 9 new in `roster.test.mjs`). Run again after the merge, same result.
- Every `test/m/<module>/` was run before and after my change: the per-module pass/fail counts are identical except retrieval (113 → 122). The modules already red at baseline (ai-runs, bias, publication, queue, queue-producers, ratification and others) are unchanged.
- After the merge: legacy-store 4/0, observation-log 56/0, connections 102/0; `node --check src/store.mjs` passes.
- `checks/format.mjs`: 0 failures (87 modules, 82 requirements files).
- `checks/architecture.mjs retrieval`: 0 failures.
- `checks/coverage.mjs retrieval`: 67 of 67 live ids named, 0 failures.
- `checks/ownership.mjs retrieval tranche/T19`: 7 files; legacy-store +0/−155, legacy-checks +0/−0; 0 failures.

Size (session_01ChtF63P7fpv844FiEpcFRv): test runs 14, module lines 2345
