# scheduler (T18)

**Status** · session_0111wxi28ywVWcPoZWi8oVBq · depth 2 · COMPLETE · handled B2

## J1 · REPORT

Prepared ahead of monitoring's merge (K713), pushed at 7f28308d14:

1. **N-A9 applied in code and unit-tested**: the `deadline-recheck` consumer, last in R5's order, calling monitoring's `deadlineRecheckDue`/`deadlineRecheckWake`/`deadlineRecheck` (R50, R34); its answer under `deadlinerecheck` (R2); promotion's notice now also arms when monitoring's `deadlineRecheckWake` answers non-null (R9, "an action holding a `pending` clock entry"). Until monitoring merges, the plane's real monitoring lacks the R50 services, so on the plane this consumer answers `{error}` (R3 isolates it). I add the plane test after your CHANGE.
2. **Convert `connection-derive-sweep` (R9's open `test.todo`) done, and R9's mark met**: scheduler now registers on entities' `onResolved` (R13), deferring the arm until the resolving transaction returns, once per transaction. Plane test "R9: a resolution that marks an entity…" passes; with legacy-store's arm neutered locally it still passes, and fails only when both are removed. **Please strike R9's mark** "(not yet met through entities' notice…)" (rule 5).
3. **Found in legacy-store (for its job; rule (8) gives `store.mjs` in L10 to legacy-store, so I did not edit it):** `bio-plane/src/store.mjs` `resolveReferences`/`testifyResolution` (~1648–1660) arm the connection sweep after each resolve, and `#armConnectionDerive` (~741–746) exists only for them. Both are now redundant with scheduler's entities notice (scheduler R9; legacy-store's "arms for it until extracted" no longer applies to entities). Harmless (an arm only pulls earlier), but dead weight: legacy-store's job can delete them, a pure removal.

## Completion

**Entries applied** (`current.md` layer 10, scheduler; N-A9; the `connection-derive-sweep` convert):
- N-A9: the `deadline-recheck` consumer, last in R5's order, calling monitoring's `deadlineRecheckDue`, `deadlineRecheckWake` (its R50) and `deadlineRecheck` (its R34, R35); its answer under `deadlinerecheck` (R2); promotion's notice arms when monitoring's wake answers one (R9, "an action holding a `pending` clock entry").
- B2's check (monitoring's finding): an entry R34 cannot mark keeps R50's wake in the past, so the reconcile after each firing would set the alarm in the past and fire again at once. The consumer now holds, after a tick that marks nothing (or throws), any wake at or before that tick to the start of the next UTC day, R50's own granularity, not an interval of this module's (R7); a tick that marks something releases it. Test "R5, R16: deadline-recheck never spins…".
- Convert `connection-derive-sweep` (R9's open `test.todo`): scheduler registers on entities' `onResolved` (R13), deferring the arm until the resolving transaction returns, once per transaction. Unit test and plane test. Negative control: the plane test passes with legacy-store's arm neutered, and fails only with both removed. **R9's mark "(not yet met through entities' notice…)" is met: strike it (rule 5). R5's "(not yet met for `deadline-recheck`)" is met: strike it.**
- `awaiting stamp`: none; this module moves no catalogue row.

**Deferred:** none. R10's standing `test.todo` (each owner orders its batch by the rank) is unchanged: the owners' to test.

**Found in other modules (J1 REPORT):** `legacy-store` (`store.mjs` `resolveReferences`/`testifyResolution`, `#armConnectionDerive`) arms the connection sweep after each resolve, now redundant with scheduler's entities notice; a pure removal for legacy-store's job (rule (8): `store.mjs` is its in L10). `monitoring` (an improvement, not a defect): R50's wake counts an entry R34 failed to mark, so it stays in the past until the next day's re-check; scheduler now bounds that to one re-check a day, but the wake itself could skip entries whose last mark failed. In the plane test, the mark is judged by the plane's wall clock (actions R33), not the alarm's `now`, so a virtual-clock alarm cannot mark a future-dated entry: the test uses a past date and the real alarm.

**Tests and checks run:**
- `node --test bio-plane/test/m/scheduler/`: tests 52, pass 51, fail 0, todo 1 (R10's).
- Users of this module and its provider: `tasks` 68 pass 0 fail; `queue` 49 pass 0 fail; `instance-setup` 65 pass 0 fail; `monitoring` 70 pass 0 fail, 6 todo. Layer tests: none named in `build/manifest.md`.
- `format`: 82 modules, 77 requirements files; 0 failures. `architecture`: 8 product files, 25 relative imports; 0 failures. `coverage`: 20 of 20 live requirement ids named by a test; 0 failures. `ownership`: 8 files changed; legacy-store 0 added, 0 removed; 0 failures.

Size (session_0111wxi28ywVWcPoZWi8oVBq): test runs 17, module lines 402
