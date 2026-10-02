# inquiry (T22)

**Status** · session_014pJTLU4oyGLEE68RoT4y8A · depth 2 · WORKING · handled B0

## J1 · QUESTION

A9 / R53: who registers. My best reading, which I am building now: the R52 pattern (plane R10). inquiry EXPORTS `inquiryFindings(host, bias)`, a bias R33 source over its findings that also binds the host's bias as the instance a finding's lens is read from. `plane` registers it at start, after `biasOf(ctx, { env })` (store.mjs:120): `biasOf(ctx).registerWorkProducts("finding", inquiryFindings(ctx, biasOf(ctx)))`. R53 would read "exports … for `plane` to register under this module's kind" in place of "At start this module registers", with no change of meaning to what bias R40 gets.

Why not "registers itself when the factory first builds", as B1 says: inquiry cannot reach bias without creating it on a host that has not built it.
(1) Production: the plane builds inquiry (through `basisVersionsOf`, store.mjs:107) before `aiRunsOf(ctx, env)` builds bias with its `env`. If inquiry's factory called `biasOf(host)`, it would create bias first, without `env`, and BIAS_DEBT_DELAY_MS and BIAS_DEBT_BATCH would be lost (a factory reads its deps on the first call only).
(2) Tests: I measured it. Registering at the factory, or at inquiry's `migrate()`, makes bias register its promotion step on hosts that never migrated bias's tables, so every promotion fails `no such table: bias_statements`. That turns red the suites of six other modules: actions 49, consequences 29, contradiction 18, publication 82, conformance 52, reevaluation 78. Their fixtures are theirs.

What needs you: (a) the R53 re-wording, and (b) a plane entry: one line in store.mjs after :120, in plane's L11 job or wherever you place it. Bias R40's mark would then be struck at plane's registration, or at my merge if you take my test's registration on a real bias as the proof.

Until a host binds bias, a finding records lens_state `unreadable`: undetermined, never filled in. Everything else proceeds on this reading (the record, the source, my test). If you prefer the alternative (the six fixtures migrate bias and inquiry registers at `migrate()`), that is six other jobs' changes, and it still leaves (1).
