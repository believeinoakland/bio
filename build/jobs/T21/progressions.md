# progressions (T21)

**Status** · session_01VfFDjRjk7tRAKgKZ3VdJu7 · depth 2 · WORKING · handled B1

## Completion

**Entries applied** · N469 (B1, K931). `bio-plane/src/progressions/schema.mjs`:
- :243, `proposal_dispositions`: the note said the deleted `hygiene.test.mjs` "asserts" that a whole-store purge clears the decisions and a per-bundle purge leaves them. R29's test in `bio-plane/test/m/progressions/dispose.test.mjs` already checks exactly that through record-core's purge: `proposal_dispositions` keeps its row after `purge({bundleId})` and every table is empty after `purge({})`. The note now names that test. No new test was needed.
- The provenance headers in `test/m/progressions/feeds.test.mjs` (:90, `test/d266scope.test.mjs`; :133, `test/queue.test.mjs`) stay, as B1 says.
- Re-scan of my paths: no other note names a deleted file, and no note names "the battery". I listed every `.mjs` name in `src/progressions/` and `test/m/progressions/` and checked it against the tracked files. Only the three above are missing.
- Three stale comments fixed in the same file (an improvement, comments only, no deleted file named): :110 and :151 said the table "is in op=purge's TABLES", the legacy store's list. They now say it is "declared to record-core's purge, R29" (`PROGRESSIONS_TABLES`). :24 called the connection table "above", but it is now in `connections`' own schema; the comment now says that.

**Deferred** · none. R32 is still deferred by K102, as its requirement says (its `test.todo`).

**Other modules** (in J1) · The plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`, owned by `not_product`) takes `src/progressions/schema.mjs`, so this comment-only change makes it stale. I did not regenerate it.

**Tests and checks**
- `node --test test/m/progressions/` (in `bio-plane/`): tests 47, pass 46, fail 0, todo 1 (R32, deferred). `build/manifest.md` names no layer tests.
- `node checks/format.mjs`: 86 modules, 84 requirements files; 0 failures.
- `node checks/architecture.mjs … progressions`: 11 product files, 38 relative imports; 0 failures.
- `node checks/coverage.mjs … progressions`: 36 of 36 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … progressions tranche/T21`: 1 file changed; 0 failures.

Size (session_01VfFDjRjk7tRAKgKZ3VdJu7): test runs 1, module lines 3070
