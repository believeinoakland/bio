# reevaluation (T34)

**Status** · session_01CsGKTpb9A2SCFrYJQn86h9 · depth 2 · WORKING · handled B1

## Completion

**Entries applied.** T34-41 whole (N589, N590, N591; K1624, K1626), on the services T34-15, T34-21 and T34-17 landed.
- **R34 (N591).** `eventChanged({eventId, change, at})` keeps the `at` that `events.onEventChanged` states (events R16, the instant of the write that made the change) on its row, as the cause's `since` and as R8's telling's `since`, compared with the dependent's last write; this module's clock is no longer read for it. A telling that states no instant it can order (absent, blank, unparseable) breaks events' R16: it is not kept, nothing is told, and the answer says why (`TELLING_UNTIMED`, R21), rather than falling back to the clock the requirement rules out. Schema comment updated (no column change).
- **R36 (N590).** `#acrossReader` no longer pages `standardsIn`. It reads a passage's own standards through `standards.standardsWithPortion({contentId})` and the standards at a key and portion through `standards.standardsAt({key, portion})` (memoised per batch), for both the same instrument key and each key and portion `addressesOf` names. Either answer `truncated` or failing sets the sweep's `standards_read: false` with `standards_why` (R21), and the notices it did reach are still raised.
- **R36 (N589).** Each cross-address candidate this module finds (newer by first retrieval, same work and portion, at no address of the pinned capture: unchanged) is graded by `content.passageAcross(row, capture, memo)`: its `grade` and `affects` stored, and its `grade_reason` and `grade_why` kept in the notice's `across` (`compared`, `reason`, `why`). A or B now raise nothing (R14). Where content answers null the notice is `UNDETERMINED`/`undetermined` by name with `ACROSS_UNDETERMINED_WHY` (reworded: content could not compare), `compared: false`. R8's passage telling for such a notice states the grade. `STANDARDS_PAGE` is removed (nothing outside the module imported it).
- **Improvement in this module.** `notices()` now also withholds `across.compared`, `reason` and `why` from a viewer who does not see the newer capture, since content's reason reads that version (R14, R20), as `grade` and `affects` already were.

**Deferred.** None.

**Found in other modules.**
- The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (owned by `not_product`, regenerated at the layer's close) is stale: it carries this module's old `#acrossReader` (`standardsIn`, `STANDARDS_PAGE`) and `eventChanged`. Not written here (mechanics §14).

**DEC-149.** The new member-facing strings (`ACROSS_UNDETERMINED_WHY`, `TELLING_UNTIMED`, the passage telling's detail) name no "instance", "copy", "plane" or "server"; none met elsewhere in the paths.

**Tests** (`bio-plane/test/m/reevaluation/`, run from `bio-plane/`): `node --test test/m/reevaluation/` → `tests 140, pass 140, fail 0`. New: R34 N591 (`since` is events' `at`, not the clock at the telling; a dependent written between change and telling has no cause), R34 R21 (an untimed telling is not kept), R36 N589 (graded as `passageAcross` grades: A raises nothing, a changed text affected with content's reason; null → undetermined by name), R36 N590 (reads `standardsWithPortion` and `standardsAt`, never `standardsIn`; truncated or failing → `standards_read: false`). The fixture's quiet `standards` offers the two R32 reads. No layer tests are named in `build/manifest.md`; no service this module provides changed.

**M-V5 (re-run, unchanged path).** 240 events re-imported, 60 cited (3 dependents each): tellings 240, rows 60, dependents named 180; listener 0.168 ms per event, 1.27 ms at most; bound 30,000 ms.

**Checks** (process repository @ c422581):
- `node checks/format.mjs /home/user/bio` → `format: 126 modules, 125 requirements files; 0 failures`
- `node checks/architecture.mjs /home/user/bio reevaluation` → `architecture: 21 product files, 84 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs /home/user/bio reevaluation` → `coverage: 1 modules, 36 of 36 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs /home/user/bio reevaluation tranche/T34` → `ownership: 6 files changed by reevaluation between tranche/T34 and HEAD; 0 failures`

**P6.** Module 3,439 lines (from 3,429), under 4,000.

Size (session_01CsGKTpb9A2SCFrYJQn86h9): test runs 7, module lines 3439
