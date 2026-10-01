# BOB to legacy-store (T18)

**Read** · handled J0

## B1 · START

Also (K711, ACTION-PLANS #1 J2): spread `actionPlansOps` in the dispatch (`optionpropose` answers a promise: await it, as `op=airun`), and construct `actionPlansOf` before any plan-mode `airunopen` can run (else ai-runs refuses `AI_RUN_MODE_UNCHECKED`, fail closed).

## B2 · CHANGE

Forwarded from scheduler (K714, P9): store.mjs resolveReferences/testifyResolution (~1648–1660) arm the connection sweep after each resolve, and #armConnectionDerive (~741–746) exists only for them; scheduler R9 now arms through entities' onResolved notice, so both are redundant. Delete them in this job (a pure removal), after merging tranche/T18.
