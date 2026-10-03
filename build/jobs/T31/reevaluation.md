# reevaluation (T31)

**Status** · session_013cjuBNfdxEeQYE6n1vCq5N · depth 2 · COMPLETE · handled B0

## Completion

**Entries applied** (B1 START; `build/plan/current.md` T31 L7):
- **N534, R33.** `CAUSE_SOURCES` gains `cited_case_moved`. The arm (`#citedMovedOn`) reads `accepted-work.publisherMoves` (its R8) through each `cursor` to null (`#publisherMoves`). A live leg (R7) on an imported finding reference at `target_edition` n carries one cause per move of the same import that is (a) an `edition` move naming m > n, or (b) a `withdrawal` naming n, or naming `all` at `seq` s, unless an `edition` move naming n has a greater `seq`. `since` is the move's `at`. The cause carries `ref`, `cited_edition`, `move`, `import`, `group`, `case`, `kind`, `edition`, `seq`, `date`, `what_changed` or `reason`, `key_listed` and `taken_back`. Its detail says when the key is not listed and when the move was taken back; a move taken back still stands. The arm is read on the obligation (`reevaluations`) and the recovery read (`changesOf`). It closes through `recordReevaluation` (R16) and writes no row (R18). Only an `edition` or `withdrawal` is a move (K1366 F1): any other kind in the answer raises nothing, and the answer states `accepted_work_unreadable`. Absence is stated as `accepted_work_absent`. Unreadable is stated as `accepted_work_unreadable` with a why. New `citedCaseDependents({after, limit, viewer})`: each (dependent, move) with its legs, in dependent then recorded-move order, `<dependent>#<move>` cursor, 1–200. New `citedCaseMoved({move})`: the telling.
- **N534, R8.** `citedCaseMoved` tells the listeners once, after commit, as `kind: "cited_case_moved"` (`subject` the move), with the arm's dependents for that move, read as the plane. It writes nothing and never throws.

**Readings (BOB's to overrule):**
1. On the read paths, the group and case of a move are stated only where the viewer is answered the ref (R1's `acceptedFinding`), and otherwise null, with the detail naming neither. This follows R20 and N531's precedent for R31. The telling, the plane's own, always names them.
2. Accepted-work R8 states a registration without `moves` as `accepted_work_absent`. So every answer now says `accepted_work_absent` when `case-import` registers without `moves`, with a why naming the missing moves. R1's and R31's why are kept for a registration absent altogether, now worded to cover both arms. `acceptance.test.mjs`'s stand-in gained a `moves` function, because case-import's real registration carries one (plane R18). Its assertions are unchanged.
3. "Move order" in the listing is the order this copy recorded the moves (accepted-work R8), not the move ids' order.

**Deferred:** none.

**Found in another module (REPORT):** `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`'s generated artifact; the plane bundles this module's source) is stale after this change. It needs regenerating at the layer close (mechanics §14).

**Tests and checks:**
- `node --test bio-plane/test/m/reevaluation/`: pass 121, fail 0. New file `citedmoved.test.mjs` has 8 tests naming R33 (and R2, R7, R8, R9, R16, R18–R21). `acceptance.test.mjs`'s stand-in gained `moves`.
- Users' tests (publication, docket, ratification, case-import, case-authoring, conformance, monitoring, scheduler, affordances, queue-producers, control-plane, plane, `migrate-released`): all pass, 0 fail.
- `format`: 0 failures. `architecture reevaluation`: 0 failures. `coverage reevaluation`: 33 of 33 live ids named, 0 failures. `ownership reevaluation tranche/T31`: 0 failures.

Size (session_013cjuBNfdxEeQYE6n1vCq5N): test runs 9, module lines 3039
