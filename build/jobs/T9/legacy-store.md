# legacy-store (T9)

**Status** · session_013A1X4NYhkV6rFR5qtbriVB · depth 2 · WORKING · handled B1

## J1 · QUESTION

**Q1 · `op=stats` (K261; START item 6).** Monitoring's Provides has no read of its own tables' counts, so there is nothing to read them "through". `op=stats` reports `monitorFired`, `monitorTickEpoch`, `monitorAddressType` as `count(*)` of `monitor_fired`, `monitor_tick_epoch`, `monitor_address_type` (MONITORING_TABLES), and purge proofs read those keys (D-113). Reading them through monitoring needs a provided service first (mechanics §4, §7), for example monitoring `counts() → {monitorFired, monitorTickEpoch, monitorAddressType}` (whole-store: `#counts` subtracts nothing from them today).
- **My best reading, which I apply:** the three counters stay as they are in T9, and the entry goes to `next.md` as a pair: monitoring provides the count (its job, T10), then legacy-store calls it.
- **Other reading:** drop the three keys from `op=stats` now, a wire change the purge-proof suites would feel.
- This decides nothing else I build, so I carry on.

**Q2 · reported, no answer needed unless you disagree.** `standardsOf(host)` declares its four tables to purge but creates none; nothing in the plane calls `migrate()` (K267's defect, in standards: filings' record J-note says the same). Constructing standards at start (N216) without the tables would make every `op=purge` fail (`no such table: standards`) and every standards op throw. So legacy-store's construction calls `standardsOf(ctx).migrate()`. Standards' factory should migrate at construction, as escalation now does (K267); then my call becomes a no-op and can go. For your routing (a standards entry).

**Done so far (pushed, dad05ca570):** N216's construction, in the modules' order after case-authoring: `standardsOf` (+ migrate), `conformanceOf`, `consequencesModule(ctx, {conformance})` (it has no default for conformance), `filingsOf(ctx, {actions, conformance, standards, consequences, producingGroup: () => this.#producingGroup()})`, `escalationOf(ctx)`; the op map spreads `standardsOps`, `conformanceOps`, `consequencesOps`, `filingsOps` and names escalation's ten (LEGACY-INDEX #5's names; `now`, `limit` numeric). No op name collides (350 ops). A flaw in my own module fixed: `actionsOf` (line 600) reaches conformance, which creates reevaluation with no `env`, so line 622's `reevaluationOf(ctx, {env})` never reached it (reevaluation R25's `REEVAL_NOTICE_DELAY_MS`); reevaluation is now constructed first. Also N89/N193/N243, N28 (nothing composes a kind any more; the unused `terminalStep`, `gradeCeiling`, `STEP_KINDS` imports removed), N208, N205, N186, N112's comment, K260's two comments. Now running the whole old battery on both trees.
