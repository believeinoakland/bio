# bias (T18)

**Status** · session_01LB1rWefscuBDQgpU9jLcJV · depth 2 · COMPLETE · handled B0

## Completion (BIAS #4)

**Entries applied** (`build/plan/current.md` layer 5, bias; B1):
- **N242's share (`#promotionCheck`): verified still met, nothing owed.** It was met in T10 (BIAS #2) and re-read as not owed in T14 (`build/plan/t14-reread.md`:120). As of this job: C-26.11 `BIAS_REFUSED`'s `where` names `src/bias/index.mjs promotionCheck > bias-set-refusal`, and that region stands in the public `promotionCheck` (`bio-plane/src/bias/index.mjs`:199–205). The stale comment above the row (`src/bias/checks.mjs`) still said its `where` named `store.mjs` and that the reasoning was at a marker there. It now names the region and the step. Comment only: the row's `check`, `where` and `translation` are unchanged, so no row goes `awaiting stamp`.
- **Convert `d84-case-manifest`, bias's share** (`build/jobs/T17/legacy-tests.md`: "bias R8 a revision keeping the state passes in every state"). New module test `R8: a revision that keeps the state is not a move — it lands in every state of the bias machine, retired included, and the head moves to it` (`bio-plane/test/m/bias/promotion.test.mjs`). It goes through the real promotion and walks the machine to `draft`, `proposed`, `adopted` and `retired`. In each state it promotes an amended revision at that same state and asserts: it lands, a new sha is minted, and the head is at that sha and still in that state. It replaces the one `adopted` arm the ordered-pairs R8 test carried. The old suite is not deleted (K619 (3)).
- No catalogue, store or `src/index.mjs` move is owed: the catalogue holds only C-26.12 (promotion's, R29), and `store.mjs` only delegates. Ownership shows 0 lines in `legacy-store` or `legacy-checks`.

**Deferred:** R26, unchanged (`test.todo`; K102: waits on evaluation findings in `strength` and `review`). No `not yet met` mark is met by this job.

**Found in other modules / artifacts:** the comment edit in `bio-plane/src/bias/checks.mjs` stales two generated bundles that include that file: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) and `agent-worker/dist/agent-worker.bundled.mjs` (`agent-worker`, through the plane's source). I did not write either (§14). BOB regenerates them at the layer close.

**Tests and checks:**
- `node --test test/m/bias/` (from `bio-plane/`): tests 55, pass 54, fail 0, todo 1 (R26).
- `node checks/format.mjs /home/user/bio`: 82 modules, 77 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio bias`: 10 product files, 30 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio bias`: 45 of 45 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio bias tranche/T18`: legacy-store 0/0, legacy-checks 0/0; 0 failures.
- Layer tests: none named in `build/manifest.md`. No service I provide changed.

Size (session_01LB1rWefscuBDQgpU9jLcJV): test runs 1, module lines 22
