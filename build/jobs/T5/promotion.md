# T5 · promotion — job record

**Session** PROMOTION #3, `session_01CBqvRerSWp68oj6TfvGgfi`, on `job/T5/promotion` (from `tranche/T5`, merged up to `e717124b06`). Process: civicos-process @ `7549c0b`, `roles/JOB.md`, mechanics §6, §12.2, §13, §16. BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T5`.

**Status** · WORKING, 2026-09-27. Two questions to BOB (below), carried on the stated readings. **Waiting on:** record-core's CHANGE (for R58) and membership's CHANGE (for N73's share, R77); both are applied after everything else.

**Read whole:** `roles/JOB.md`, PROCESS-MECHANICS.md, `build/manifest.md`, `build/requirements/promotion.md`, the public parts of `record-core`, `membership` and `signatures` (legacy-checks has no requirements file), `build/layers.md`, my entries in `build/plan/current.md` (and N56, N63, N86 in full in `next.md` history), K83, K90, K96, K126–K128, the T3 and T4 promotion records, every file under `bio-plane/src/promotion/`, `bio-plane/src/gate.mjs` and every test under `bio-plane/test/m/promotion/`. D-592's row (old-plan index) and its source (`app.html` UI-109 note on the snapshot branch).

**Baseline:** `node --test test/m/promotion/` on `e717124b06`: tests 50, pass 50, fail 0. Coverage: 44 of 45 (R45 unnamed).

## Questions to BOB

- **Q1 · N56: `fact(name, ...args)` is not stated in Provides.** R40 states only `registerFact`, and how an act that needs an unprovided fact is refused. A public read needs its answer shape, and a fact's value may itself be `false` or `null`, so a bare value could not say "unavailable". Best reading, which I am building: `fact(name, ...args) → {ok: true, fact, value} | {ok: false, reason: "FACT_UNAVAILABLE", fact, detail}`; a provider that throws answers `{ok: false, reason: "FACT_FAILED", fact, detail}`; it never throws and writes nothing. Tested under R40. Please fold it into R40's wording (or tell me otherwise).
- **Q2 · D-592 is not `reopen`'s.** The row (SCHEDULER #21, 2026-09-25) is about a finding *reopened by a revision of a declared flow*: `op=queue`'s `prior_disposition` names who decided, and nothing publishes who revised the flow. Its own scope line: "`proposalsFeed` publishes, from `progression_def_versions`, the revising version's number, `declared_by` and `at` beside `prior_disposition`". That is the queue's feed over progressions' definition versions, not promotion's `reopen` (K83 (4) re-targeted it on the word "reopen"). Promotion's `reopen` already records and answers who reopened (R25: the `state_history` entry's `author`, the Session Log line, the answer's `author`). Best reading: nothing to build here; re-target D-592 to `queue` (its `op=queue` feed, K91) with `progressions` providing the definition version's author and time.

## Decisions made in the module (P17: recorded, not asked)

- **R45 without a record-core hook.** `promote` is often called inside a caller's transaction, which record-core joins (R32), so `promote` cannot tell when the real commit happens. Record-core's `transact` is synchronous (`transactionSync`), so the outermost transaction has either committed or rolled back before any microtask runs. Promotion therefore queues an accepted promotion's notice and delivers it in a microtask, first confirming that the promotion's own manifest entry (its snap key, base and `bundle.md` digest) is held: a rolled-back promotion has none, so it is never announced. No record-core service is needed.
- **The arm moves to a listener (R45's Suggestion).** The store's `promote` route armed the scheduler itself after `op=promote` (a monitored bundle; bias debt pending). It becomes `legacy-store`'s registered listener on `onCommitted`, so every committed promotion arms it, not only those through that one route.
