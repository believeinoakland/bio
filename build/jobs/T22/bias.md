# bias (T22)

**Status** · session_0134WygRosVZ3EZMS1Jdi1xK · depth 2 · WAITING ON BOB (J1) · handled B1

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
