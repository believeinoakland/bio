# legacy-store (T9)

**Status** · session_013A1X4NYhkV6rFR5qtbriVB · depth 2 · RUNNING until 2026-09-28T17:30:24Z (old battery on tranche/T9 and on this branch) · handled B2

## J1 · QUESTION

**Q1 · `op=stats` (K261; START item 6).** Monitoring's Provides has no read of its own tables' counts, so there is nothing to read them "through". `op=stats` reports `monitorFired`, `monitorTickEpoch`, `monitorAddressType` as `count(*)` of `monitor_fired`, `monitor_tick_epoch`, `monitor_address_type` (MONITORING_TABLES), and purge proofs read those keys (D-113). Reading them through monitoring needs a provided service first (mechanics §4, §7), for example monitoring `counts() → {monitorFired, monitorTickEpoch, monitorAddressType}` (whole-store: `#counts` subtracts nothing from them today).
- **My best reading, which I apply:** the three counters stay as they are in T9, and the entry goes to `next.md` as a pair: monitoring provides the count (its job, T10), then legacy-store calls it.
- **Other reading:** drop the three keys from `op=stats` now, a wire change the purge-proof suites would feel.
- This decides nothing else I build, so I carry on.

**Q2 · reported, no answer needed unless you disagree.** `standardsOf(host)` declares its four tables to purge but creates none; nothing in the plane calls `migrate()` (K267's defect, in standards: filings' record J-note says the same). Constructing standards at start (N216) without the tables would make every `op=purge` fail (`no such table: standards`) and every standards op throw. So legacy-store's construction calls `standardsOf(ctx).migrate()`. Standards' factory should migrate at construction, as escalation now does (K267); then my call becomes a no-op and can go. For your routing (a standards entry).

**Done so far (pushed, dad05ca570):** N216's construction, in the modules' order after case-authoring: `standardsOf` (+ migrate), `conformanceOf`, `consequencesModule(ctx, {conformance})` (it has no default for conformance), `filingsOf(ctx, {actions, conformance, standards, consequences, producingGroup: () => this.#producingGroup()})`, `escalationOf(ctx)`; the op map spreads `standardsOps`, `conformanceOps`, `consequencesOps`, `filingsOps` and names escalation's ten (LEGACY-INDEX #5's names; `now`, `limit` numeric). No op name collides (350 ops). A flaw in my own module fixed: `actionsOf` (line 600) reaches conformance, which creates reevaluation with no `env`, so line 622's `reevaluationOf(ctx, {env})` never reached it (reevaluation R25's `REEVAL_NOTICE_DELAY_MS`); reevaluation is now constructed first. Also N89/N193/N243, N28 (nothing composes a kind any more; the unused `terminalStep`, `gradeCeiling`, `STEP_KINDS` imports removed), N208, N205, N186, N112's comment, K260's two comments. Now running the whole old battery on both trees.

## Completion

**Entries applied** (plan layer 10, legacy-store; START B1; ANSWER B2, K302):
1. **N216.** The durable object constructs layer 9 at start, in the modules' order, after case-authoring and before monitoring: `standardsOf(ctx)` with `migrate()` (its factory creates no tables; N267, K302), `conformanceOf(ctx)`, `consequencesModule(ctx, {conformance})` (it has no default for conformance), `filingsOf(ctx, {actions, conformance, standards, consequences, producingGroup: () => this.#producingGroup()})`, `escalationOf(ctx)` (it reaches the other four through their factories on the same host). The op map spreads `standardsOps`, `conformanceOps`, `consequencesOps`, `filingsOps`, and names escalation's ten ops itself (escalation has no op map; the names are LEGACY-INDEX #5's, K262): `escalationopen`, `escalation`, `escalationattach`, `escalationevaluate`, `escalationadvance`, `escalationdecline`, `escalationend`, `escalationsuspend`, `escalationresume`, `escalationsdue`. Acts take the body with `author` and `viewer` from the query after it; `now` and `limit` are read as numbers or absent. No op name collides (350 ops in the map). The routes (legacy-index) and the affordance rows are layer 11's (K263, K264).
2. **N89, N193, N243.** `PROJECT_NAMING_READS` gains `connectionsasserted` (`bundle`) and the layer-9 reads naming a bundle or a project: `standard`, `standardinforce`, `determination`, `consequence`, `escalation` (`id`), `determinations` (`project`). `PROJECT_NAMING_READS_NOT` gains `archivelookup` (a source address), `pdfstructure` (a capture digest, beside `reading`), `contentcrop` (a content row's key), `filemembership` (a capture digest), `comparison` (a comparison proposal id) and `counselpacketread` (a counsel packet id). project-sight 11g is green.
3. **N28.** Nothing in legacy-store composes a page's kind any more (extraction and content read `chainKindFor`). What was left was the unused `terminalStep`, `gradeCeiling`, `STEP_KINDS` imports, now removed.
4. **N208.** `proposeDispose`'s scoped `NO_SUCH_PROJECT` is `noSuchProject(proj, {finding})` (membership R78). The dead `Store.#noSuchProject` is removed. No other site in legacy-store mints the code.
5. **Deletions.** N205: `#groupUndetermined`. N186: `actNoBasis` (the header comment says the one site is now inquiry's). N112: the three frontier delegates were already gone; the stale comment naming `#frontierDocumentVisible` is fixed. `enteredAfterFirstRow` was already gone. K260: both stale comments are rewritten (the bias construction's, whose unused `const bias` also went, and the one above `captureOf`).
6. **`op=stats` (K261): deferred** by K302 as N266. Monitoring's Provides has no count read, so the three counters stay until monitoring provides `counts()` (T10).

**A flaw in my own module, fixed.** `actionsOf` (constructed before reevaluation) reaches conformance, whose factory creates reevaluation with no deps. So the later `reevaluationOf(ctx, {env})` never delivered `env`, and reevaluation R25's `REEVAL_NOTICE_DELAY_MS` binding was ignored in the plane. Reevaluation is now constructed first, which is also the modules' order. A scratch proof over the real factories (node:sqlite, not committed): old order, the binding reached = null; new order = 5000.

**Deferred.** `op=stats` (N266, K302). The `standardsOf(ctx).migrate()` call goes once standards migrates at construction (N267).

**Found in other modules (REPORT J3).**
- **standards:** its factory declares its tables to purge but never creates them (K267's defect). This is N267, and the control below measured it.
- **legacy-tests:** three suites need re-anchoring:
  - `project-sight` 11g++ needs the sweep to read `standardsOps`, `conformanceOps`, `consequencesOps` and `filingsOps` (T8's loop; standards' and conformance's maps read parameters through `qp("…")`, not `q("…")`).
  - `d484-refusal-translation` has three arms scanning `store.mjs` for `NO_BASIS`, its one site and `is-act-no-basis`. They re-anchor to inquiry's `actNoBasis`, which C-33.40's `where` already names.
  - Any suite pinning `proposeDispose`'s old `NO_SUCH_PROJECT` detail now sees R78's fixed sentence and its `code`, `check`, `translation`. None differed in this battery.
- **Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (not_product), from `store.mjs`, for BOB at the layer close (fleetbundles 95/1 → 91/5).
- No catalogue row's `where` moves: C-33.40 and C-64.1 already name inquiry, and `NO_SUCH_PROJECT`'s row is membership's.

**Tests and checks.** I own no tests (legacy, `tests` empty).
- **The whole old battery, 369 suites, two at a time, on each tree:** `tranche/T9` @ 0ec5cb4109 against this branch @ dad05ca570. 27 red there, 30 here. Four suites differ:
  - `d484-refusal-translation` 30/0 → 27/3 (legacy-tests' re-anchor, above).
  - `fleetbundles` 95/1 → 91/5 (the stale plane bundle).
  - `capturerequests` 140/0 → 138/2 (the rate-rule timing arms). Re-run on this branch: 140/0.
  - `acquire` 97/0 → no count. Re-run on both trees: the same TypeError after 78 passes on each, so it is intermittent and not from this change.
  - Also `project-sight` stays at 248/1, but its red moves from 11g (the five unclassified reads) to 11g++ (the layer-9 reads classified here, which the old sweep does not read yet).
- **Module suites, unchanged:** consequences 22/0, filings 30/0, escalation 28/0, actions 30/0, conformance 29/0, standards 16/0, monitoring 43/0 (10 todo), scheduler 46/0 (6 todo), reevaluation 39/0.
- **A scratch driver through the real durable object in Miniflare (not committed):**
  - This branch: 12 pass, 0 fail. Every one of the 36 layer-9 ops is dispatched and none throws. A standard proposal lands. `escalationsdue` answers ok and empty. Absent ids answer `NO_SUCH_ESCALATION`, `NO_SUCH_PART`, `NO_SUCH_DETERMINATION`. A machine's `escalationopen` answers `MACHINE_CANNOT_OPEN`. A whole-store purge answers ok. An undispatched op still answers `unknown op`.
  - On the tranche, every layer-9 op answers `unknown op`.
  - Control, `migrate()` removed: 8/4, with purge failing on `no such table: standards`.
- **Checks** (civicos-process): format: 69 modules, 64 requirements files; 0 failures. architecture: 2 product files, 75 relative imports; 3 failures, the same 3 as on `tranche/T9` (the imports of `affordances.mjs`, `queuestate.mjs` and `queue/proposals.mjs`: N13); the five imports added here pass. coverage: 0 of 0 live ids (legacy, no requirements); 0 failures. ownership: 0 failures.

Size (session_013A1X4NYhkV6rFR5qtbriVB): test runs 760, module lines 8,379
