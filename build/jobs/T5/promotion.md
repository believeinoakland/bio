# T5 · promotion — job record

**Session** PROMOTION #3, `session_01CBqvRerSWp68oj6TfvGgfi`, on `job/T5/promotion` (from `tranche/T5`, merged up to `e717124b06`). Process: civicos-process @ `7549c0b`, `roles/JOB.md`, mechanics §6, §12.2, §13, §16. BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T5`.

**Status** · COMPLETE, 2026-09-27. Every entry applied: N56 (with D-592 answered by K132), R58, N73's share, N86, N63's share; R59 (K130) with record-core's. No open question, nothing of my own deferred.

**Read whole:** `roles/JOB.md`, PROCESS-MECHANICS.md, `build/manifest.md`, `build/requirements/promotion.md`, the public parts of `record-core`, `membership` and `signatures` (legacy-checks has no requirements file), `build/layers.md`, my entries in `build/plan/current.md` (and N56, N63, N86 in full in `next.md` history), K83, K90, K96, K126–K128, the T3 and T4 promotion records, every file under `bio-plane/src/promotion/`, `bio-plane/src/gate.mjs` and every test under `bio-plane/test/m/promotion/`. D-592's row (old-plan index) and its source (`app.html` UI-109 note on the snapshot branch).

**Baseline:** `node --test test/m/promotion/` on `e717124b06`: tests 50, pass 50, fail 0. Coverage: 44 of 45 (R45 unnamed).

## Questions to BOB

- **Q1 · N56: `fact(name, ...args)` is not stated in Provides.** R40 states only `registerFact`, and how an act that needs an unprovided fact is refused. A public read needs its answer shape, and a fact's value may itself be `false` or `null`, so a bare value could not say "unavailable". Best reading, which I am building: `fact(name, ...args) → {ok: true, fact, value} | {ok: false, reason: "FACT_UNAVAILABLE", fact, detail}`; a provider that throws answers `{ok: false, reason: "FACT_FAILED", fact, detail}`; it never throws and writes nothing. Tested under R40. Please fold it into R40's wording (or tell me otherwise).
- **Q2 · D-592 is not `reopen`'s.** The row (SCHEDULER #21, 2026-09-25) is about a finding *reopened by a revision of a declared flow*: `op=queue`'s `prior_disposition` names who decided, and nothing publishes who revised the flow. Its own scope line: "`proposalsFeed` publishes, from `progression_def_versions`, the revising version's number, `declared_by` and `at` beside `prior_disposition`". That is the queue's feed over progressions' definition versions, not promotion's `reopen` (K83 (4) re-targeted it on the word "reopen"). Promotion's `reopen` already records and answers who reopened (R25: the `state_history` entry's `author`, the Session Log line, the answer's `author`). Best reading: nothing to build here; re-target D-592 to `queue` (its `op=queue` feed, K91) with `progressions` providing the definition version's author and time.

## Answers and changes from BOB

- **Q1, Q2** · ANSWER by K132 (merged @ `406681de0b`): R40 states `fact` as built; D-592 is not promotion's (inquiry's R19, T6).
- **CHANGE 05:52 UTC** · membership's R77 merged into `tranche/T5`; merged here @ `406681de0b`. Applied (below, N73).
- **ANSWER 06:01 UTC** (K133): the four reports handled; the stale marks cleared. **CHANGE 06:02 UTC** (R58, N51/R59): already applied at `7dafc506f6` on record-core's early merge. Merged `tranche/T5` @ `4cab05f8ab` here (`d4db2e0728`): record-core's R59 now calls `check(input, context)` with the context as a second argument (RECORD-CORE #2 @ `1a7fa3efa5`), so promotion's registration reads the release registry from `context`; the test now fails on the one-argument form.
- **record-core merged early** (`fd80cd117e`, Provides final; its CHANGE message had not yet arrived, so I acted on the tranche's state, mechanics §13): merged here @ `6b2ce97ddc`. R58 and R59 applied (below).

## Decisions made in the module (P17: recorded, not asked)

- **R45 without a record-core hook.** `promote` is often called inside a caller's transaction, which record-core joins (R32), so `promote` cannot tell when the real commit happens. Record-core's `transact` is synchronous (`transactionSync`), so the outermost transaction has either committed or rolled back before any microtask runs. Promotion therefore queues an accepted promotion's notice and delivers it in a microtask, first confirming that the promotion's own manifest entry (its snap key, base and `bundle.md` digest) is held: a rolled-back promotion has none, so it is never announced. No record-core service is needed.
- **The arm moves to a listener (R45's Suggestion).** The store's `promote` route armed the scheduler itself after `op=promote` (a monitored bundle; bias debt pending). It becomes `legacy-store`'s registered listener on `onCommitted`, so every committed promotion arms it, not only those through that one route.

## Entries applied

- **N86** · `CATALOG_VERSION` 1.33.0 → **1.34.0** (MINOR, `src/gate.mjs`, with its note): four departures (C-18.1, C-18.3, C-18.4, C-18.9, moved to `provenance` by PROVENANCE #1 after 1.33.0 was minted), no arrivals. The plane still judges a ratification by them: the store wraps the gate with `provenance.withRegisterChecks`. The d470 suite's own print on this tree: **count 568, sha256 `4f93c5f65a5d7444ca59f172ae598905f3c440fc9c5d0b222431335edc003f14`, source `4fa025acf0d59e03324c294d5225adea40c826afaa031b1d8bb71dd6c76fff31`**. `GATE_VERSION` is `plane-gate/1.0 (bio-checks 1.34.0)`.
- **N56** · `fact(name, ...args)` on Q1's reading: `{ok: true, fact, value}`, or `FACT_UNAVAILABLE` (no value key, so an unprovided fact is never read as false), or `FACT_FAILED` for a provider that throws. Tested under R40.
- **N56 · D-592** · nothing to build in promotion (Q2): `reopen` already records and answers who reopened (R25).
- **N63 (promotion's share) · R45** · `onCommitted(module, fn)`: registered once per module (`LISTENER_DECLARED`), sorted in the modules' total order; each accepted, written promotion (never a refusal, never `wrote: false`) is announced once, after the transaction it committed in has committed, with `{bundleId, bundleSha, type, replay}`; a listener that throws or rejects is contained. Mechanism in "Decisions" above. `legacy-store`'s arm (REC-26's monitored bundle, D-86's bias debt) moved from the `promote` route into its registered listener; the route now only delegates. So every committed promotion arms it (reopen, fork and internal writes included), where before only `op=promote` did: arming only schedules, and the scheduler reconciles.
- **N73 (promotion's share)** · `promote` (R20) and `forkProject` (R42) answer a caller at existence with `membership.existenceAct` (R77); promotion's own copy of C-70.1 is gone, so it is minted only in membership. The answer's keys are unchanged (`reason`, `code`, `check`, `translation`, `detail`, `project`, `name`); its `detail` is now membership's words. The tests assert the answer is membership's own, byte for byte. `machinefences-dec49` 87/0, as on the base; `project-discoverable` and `project-join-request` green; membership's suite 77/0.
- **R58** · promotion's own `fileDigestOf`, `inlineBytesOf` and `EMPTY_STRING_SHA` are gone (and `history.mjs`'s second copy of the marker); the door's digest and size checks (R5, R6), the idempotence comparison (R4), a creation's base (R3) and the two rewritten documents (a minted project id, a stamped group) all use record-core's, so the door and the census compute one digest. `EMPTY_STRING_SHA` is no longer exported by promotion (nothing imported it). `rec175-digest`, `rec178-bytes`, record-core's own suite green.
- **R59 (K130)** · `recordAudit`'s second pass (re-running the catalogue on a bundle the moved checks found in error) is gone: promotion registers C-4.2, C-17.2, C-18.8 and C-20.1 once with record-core's audit when it is reached, with the caller's release registry from the audit's context (R59's second argument), and `recordAudit` is now record-core's `auditPass` after that registration (kept by name, so `legacy-store` and `provenance` call it unchanged). Test: "R30, R32: the audit runs the moved checks too". `audit`, `audit-inheritance`, provenance's suite green.
- **The *not yet met* marks** on R11–R15, R17 and R30–R32 in the requirements' header and body are stale: all were met and tested in T3 (PROMOTION #1), and every one is green here. R45 is met now. For BOB to clear.

## Deferred

- Nothing of this module's own.

## Found in other modules (REPORT)

1. **record-core, R32 (nested transactions):** `transact` at depth > 0 runs `fn` and returns its answer, so a refusal returned by an inner call is not rolled back until (unless) the outer call also refuses. R32 says a refusal rolls back every row written inside `fn`. For promotion this matters where a refusal follows a write: a project creation mints its id (`mintOpaqueId`, R7) before `NAME_TAKEN` and the later checks, and a registered projection may refuse after `commit`. Called inside a caller's transaction that then commits, those rows stay (promotion R2 not met in that case). A savepoint per nested call (the test double does this) would meet it.
2. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` embeds `src/gate.mjs`, `src/promotion/index.mjs` and `src/store.mjs` (still 1.33.0). For the layer close (manifest §14).
3. **legacy-tests** (T5-12): `d470-catalog-census` A3 and A9 (11 pass, 2 fail here, as on the base): the row to add is `"1.34.0": { count: 568, digest: "4f93c5f6…3f14", changed: [], source: "4fa025ac…ff31" }` (full figures above), and A5's literal `1.33.0` → `1.34.0`.

## Tests and checks run (on the merged branch, `tranche/T5` @ `4cab05f8ab` merged)

- My module: `node --test bio-plane/test/m/promotion/`: `tests 55, pass 55, fail 0` (baseline 50/50; five new: R40's `fact`, three R45, the audit registration under R30/R32).
- Layer tests: none named in `build/manifest.md`. `onCommitted` and `fact` are additions and no existing service's answer changed; the extracted users and providers' suites, run anyway: record-core 46/0, membership 77/0, provenance 54/0.
- Old-battery suites that drive `promote` or the arm, green on this branch (and those that touch the arm, green on the base too): d86-bias-debt, monitor-cadence, monitor-assess, monitor-address, scheduler, bias, rec207-bias-debt-settle, projection, airun, drive, run-conditions, ratify, audit, audit-inheritance, rec178-bytes, project-discoverable, project-join-request, machinefences-dec49 (87/0), rec176-snapkey, rec175-digest, d484-refusal-translation, machine-attest, fence-e2e, refusal-wire, d168-retired-cite, rec173-migration-replay, rec-183-reinstate-retired, store.
- `node checks/format.mjs /home/user/bio`: `format: 69 modules, 64 requirements files; 0 failures`
- `node checks/architecture.mjs /home/user/bio promotion`: `architecture: 16 product files, 47 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs /home/user/bio promotion`: `coverage: 1 modules, 45 of 45 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs /home/user/bio promotion tranche/T5`: `ownership: 10 files changed by promotion between tranche/T5 and HEAD; legacy-checks: 0 line(s) added, 0 removed; legacy-store: 6 line(s) added, 21 removed; 0 failures`. The added lines, for BOB:

```
ADDED bio-plane/src/store.mjs:887  /* promotion R45: REC-26's and D-86's producer arms, for every committed promotion (a monitored bundle, a lens moved). */
ADDED bio-plane/src/store.mjs:888  promotionOf(ctx).onCommitted("legacy-store", async ({ bundleId }) => {
ADDED bio-plane/src/store.mjs:889  const monitored = this.#monitorConfigured() && this.#one(`SELECT monitor_enabled FROM bundles WHERE bundle_id=?`, bundleId)?.monitor_enabled === 1;
ADDED bio-plane/src/store.mjs:890  if (monitored || this.#biasDebtPending()) await this.#armScheduler();
ADDED bio-plane/src/store.mjs:891  });
ADDED bio-plane/src/store.mjs:45682  promote: () => promotionOf(this.ctx).promote(body),
```

Size: test runs 72, module lines 2037
