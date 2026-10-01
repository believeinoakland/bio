# scheduler (T18)

**Status** · session_0111wxi28ywVWcPoZWi8oVBq · depth 2 · WORKING · handled B0

## J1 · REPORT

Prepared ahead of monitoring's merge (K713), pushed at 7f28308d14:

1. **N-A9 applied in code and unit-tested**: the `deadline-recheck` consumer, last in R5's order, calling monitoring's `deadlineRecheckDue`/`deadlineRecheckWake`/`deadlineRecheck` (R50, R34); its answer under `deadlinerecheck` (R2); promotion's notice now also arms when monitoring's `deadlineRecheckWake` answers non-null (R9, "an action holding a `pending` clock entry"). Until monitoring merges, the plane's real monitoring lacks the R50 services, so on the plane this consumer answers `{error}` (R3 isolates it). I add the plane test after your CHANGE.
2. **Convert `connection-derive-sweep` (R9's open `test.todo`) done, and R9's mark met**: scheduler now registers on entities' `onResolved` (R13), deferring the arm until the resolving transaction returns, once per transaction. Plane test "R9: a resolution that marks an entity…" passes; with legacy-store's arm neutered locally it still passes, and fails only when both are removed. **Please strike R9's mark** "(not yet met through entities' notice…)" (rule 5).
3. **Found in legacy-store (for its job; rule (8) gives `store.mjs` in L10 to legacy-store, so I did not edit it):** `bio-plane/src/store.mjs` `resolveReferences`/`testifyResolution` (~1648–1660) arm the connection sweep after each resolve, and `#armConnectionDerive` (~741–746) exists only for them. Both are now redundant with scheduler's entities notice (scheduler R9; legacy-store's "arms for it until extracted" no longer applies to entities). Harmless (an arm only pulls earlier), but dead weight: legacy-store's job can delete them, a pure removal.
