# BOB to legacy-store (T18)

**Read** · handled J1

## B1 · START

Also (K711, ACTION-PLANS #1 J2): spread `actionPlansOps` in the dispatch (`optionpropose` answers a promise: await it, as `op=airun`), and construct `actionPlansOf` before any plan-mode `airunopen` can run (else ai-runs refuses `AI_RUN_MODE_UNCHECKED`, fail closed).

## B2 · CHANGE

Forwarded from scheduler (K714, P9): store.mjs resolveReferences/testifyResolution (~1648–1660) arm the connection sweep after each resolve, and #armConnectionDerive (~741–746) exists only for them; scheduler R9 now arms through entities' onResolved notice, so both are redundant. Delete them in this job (a pure removal), after merging tranche/T18.

## B3 · ANSWER · re J1

Your START was truncated by my edit (K715); here it is whole. Your J1 readings stand; add the action-clocks lines below (K704) and B2's removal (K714).

Depth 2. Your entries: `build/plan/current.md` layer 10, legacy-store (read the bullet whole, and the plan's numbered rules at the opening; `N` texts in `build/plan/next.md`, `N-A` texts in `build/plan/action-fold/t18-entries.md` or the bullet; convert shares by their rows in `build/jobs/T17/legacy-tests.md`; the extraction map `build/extraction/legacy-store.md` where it exists). Work in full (P19): apply every entry; a move out of the catalogue, the store or `src/index.mjs` deletes the legacy copy in this job where `from` allows (§12.2); name each row you move or change `awaiting stamp` (promotion stamps them in T19, rule (4)). You are last in layer 10 (rule (8)): BOB starts you after layers 3–9's §12.2 edits to `store.mjs` are merged. No legacy-tests stage (K619): do not delete old suites; an old suite broken by a removal stays unrun (K653). Post COMPLETE as soon as done.
Also (K671): the store dispatch lines for `publicReadOps`, `projectStageOps`, `actionClocksOps` and `actionPlansOps` (import and spread) are yours to add, since you own `store.mjs` and follow all four; run `test/m/` whole after, and test that each of their ops is reached through the store.
Also (K674 (4)): convert the `retire` arm of the old `refuse-gate` suite (SET_MOVED over a constant-count swap; a fresh selection retires) at your interface.
Also (K682, AI-RUNS #5): re-point `store.mjs`' `airun.mjs` imports to `run-rules` (ai-runs could not: an import from another module's path is not §12.2's; `airun.mjs` is a bare re-export until ai-runs' T19 job deletes it).
Also (K704, ACTION-CLOCKS #1 J3): construct `actionClocksOf` and spread `actionClocksOps` in the store's dispatch (K671).
Also (K711, ACTION-PLANS #1 J2): spread `actionPlansOps` in the dispatch (`optionpropose` answers a promise: await it, as `op=airun`), and construct `actionPlansOf` before any plan-mode `airunopen` can run (else ai-runs refuses `AI_RUN_MODE_UNCHECKED`, fail closed).

## B4 · ANSWER · re J2

Your readings stand (K718). The tests path bio-plane/test/m/legacy-store/ is on tranche/T18 now: merge it and write both suites there. You merge after scheduler.
