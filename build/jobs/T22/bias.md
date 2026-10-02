# bias (T22)

**Status** · session_0134WygRosVZ3EZMS1Jdi1xK · depth 2 · COMPLETE · handled B2

## J1 · REPORT

Work done on `job/T22/bias` @ 91c6be64d8, before entities' merge. R11, R12 and R29 are met: C-26.21 `BIAS_ADOPTION_NO_REASON` is asked last in `biasAdopt`, and `bias_adoptions.reason` is migrated forward. `bio-plane/test/m/bias/` is green (56 pass, 0 fail, R26 todo). The four checks pass. Please accept or route each red below by name (P4).

1. **Row census.** `bio-plane/test/system/row-census.test.mjs` is red with "arrived with no record: C-26.21 BIAS_ADOPTION_NO_REASON". This is accepted red 3, awaiting T23's stamp.
2. **ai-runs (L6), 6 reds, all from this change.** `test/m/ai-runs/world.mjs`:167 adopts with no reason and throws `BIAS_ADOPTION_NO_REASON`. The reds are `open.test.mjs`:82 and :118, `producers.test.mjs`:66, `reads.test.mjs`:82 and :173, and `tick-close.test.mjs`:95. ai-runs' job fixes them by sending `reason`.
3. **UI (N487, Bob's: UX).** `civicos-ui/test/queue-recipients.test.mjs` is 1 pass, 14 fail. On `tranche/T22` it is 15 pass. The cause is its `op=biasadopt` GET at :160, which sends no reason. The op reads `reason` from the query when the body has none, so adding `&reason=…` there fixes it.
4. **control-plane: none from this change.** `test/m/control-plane/` is 100 pass, 2 fail. The 2 fails are `doorbell.test.mjs`:310 and `catalogue-end.test.mjs`:15, both accepted until L11. The control plane passes the caller's `reason` through: it stamps only `author`.
5. **My other users: all green.** case-authoring 80/80, scheduler 51 pass (1 todo), queue-producers 49/49, queue 80/80.
6. **Whole `bio-plane/test/m`: 4842 tests, 4814 pass, 9 fail, 19 todo.** The 9 fails are the 6 in item 2, the 2 in item 4 and `test/m/inquiry/content-legs.test.mjs`:395 (accepted until inquiry's L6). There is no other red.
7. **Stale bundle.** `bio-plane/dist/bio-plane.bundled.mjs` is stale because of my change under `bio-plane/src/bias/`. I regenerated nothing.
8. **Grep re-run** (`biasAdopt(`, `biasadopt` over `bio-plane/`, `agent-worker/`, `civicos-ui/`). It found only the two callers named above. The other hits only name the op and need no change: affordances' `RUNG_ABSENT` (L11), op-declarations, the record-grammar comments, and the comments in basis-versions and affordances tests.

Next: I merge `tranche/T22` after your CHANGE announcing entities' merge, re-run my suite, then post COMPLETE.

## J2 · COMPLETE

Complete on `job/T22/bias`, with `tranche/T22` merged after entities (K1052).

**Entries applied (DEC-88; K1025).**
- **R11:** `BIAS_ADOPTION_NO_REASON` is refused when the `reason` is absent, not a string, blank, or over 2,000 characters once trimmed, on a re-adoption too. It is asked last, after C-26.9, C-26.10, the project's existence and `owner` refusals and instance `NOT_AN_ADMIN`, and before the bundle read and the insert, so a refusal writes nothing and tells no notice.
- **R12:** the reason is kept, trimmed, in a new `bias_adoptions.reason` column. A re-adoption replaces it with the row, and R10's re-pin leaves it alone. The answer carries it beside the pin, author and instant. `migrate()` adds the column to an older table (`BIAS_ADDITIVE_COLUMNS`) and never fills it for an adoption already held. The `biasadopt` op reads `reason` from the body, else the query.
- **R29:** C-26.21 is a new row of `BIAS_CHECKS`, awaiting stamp. C-26.20 is not reused, and no other row changed.
- **Callers:** every adoption in `test/m/bias/` sends a reason except those proving the refusal. `adopt-manifest.test.mjs`:303 sends entities' note (C-91.8).
- **Re-scan:** no note in my paths names a deleted file, `tools/` or the deleted plane `index.mjs` as live. One stale comment in `checks.mjs` said "three" rows fire in the plane; I corrected it.

**Tests that prove each requirement.**
- `adopt-manifest.test.mjs`, "R11, R12: BIAS_ADOPTION_NO_REASON (C-26.21)…":
  - each bad reason is refused at both scopes, on a first adoption (no row written) and on a re-adoption (rows unchanged), with no notice told;
  - a 2,001-character reason is refused and exactly 2,000 is kept;
  - each authority refusal comes first;
  - the reasoned adoption is kept and answered;
  - the op reads the reason from the body, else the query.
- `adopt-manifest.test.mjs`: "R11: refusals in order" and the extended "R12".
- `checks.test.mjs`: "R29 … C-26.21".
- `migrate.test.mjs`: "R45".

**Deferred:** nothing.

**Found in other modules:**
- `test/m/ai-runs/world.mjs`:167 sends no reason; ai-runs' L6 job fixes it.
- `civicos-ui/test/queue-recipients.test.mjs`:160 sends no reason (N487).
- `bio-plane/dist/bio-plane.bundled.mjs` is stale from my change under `src/bias/` (J1).

**Requirements now met:** R11, R12 and R29. C-26.21 is awaiting stamp.

**Tests and checks, on the merged head.**
- `node --test test/m/bias/`: tests 57, pass 56, fail 0, todo 1 (R26, deferred by K102).
- `test/m/entities/`: 65 pass, 0 fail.
- Users' suites, from J1: case-authoring 80/80, scheduler 51 (1 todo), queue-producers 49/49 and queue 80/80. ai-runs fails 6 (`world.mjs`:167); control-plane fails 2, both accepted (`doorbell`:310, `catalogue-end`:15).
- Whole `bio-plane/test/m`: tests 4845, pass 4812, fail 14, todo 19. The 14 are:
  - 6 in ai-runs, from this change, as above;
  - 3 accepted: control-plane `catalogue-end`:15 and `doorbell`:310, and `inquiry/content-legs`:395;
  - 5 from entities' merge, not mine: `actions/t18.test.mjs`:299, `connections/converts-derivation.test.mjs`:141 and :206, `connections/derive.test.mjs`:217, and `scheduler/plane.test.mjs`:85. These are the callers of entities' C-91.8 listed in `t22-dec88-callers.md`.
- `test/system/row-census.test.mjs`: red by accepted red 3, including "arrived with no record: C-26.21 BIAS_ADOPTION_NO_REASON".
- Checks:
  - `format`: 0 failures.
  - `architecture bias`: 0 failures.
  - `coverage bias`: 46 of 46 live ids named, 0 failures.
  - `ownership bias tranche/T22`: 0 failures.

Size (session_0134WygRosVZ3EZMS1Jdi1xK): test runs 14, module lines 1826
