# bias (T10)

**Status** · session_01UtHLMrHZ2X8UVfhfaiTKsg · depth 2 · WORKING · handled B1

## Completion (BIAS #2)

**Entries applied** (plan layer 5, B1):
- **N143**: `bias/interim.mjs` deleted, with its re-export and the test "R33 (interim)"; nothing else imported it.
- **N207**: the manifest reads pinned bytes through `record-core.textAtSha` (its R60); the module's own copy (`#textAtSha`, which read the whole image and hashed every snapshot) is gone.
- **N224** (R33): `biasDebtSweep(now, rank?)` reads the batch, offers each work product to the rank as `{kind: "bundle", id: <context id>, waitingSince}`, and compares in the rank's order. Each item's place rides under a symbol that the rank's copies keep and its shape does not show. A rank that throws, answers no list, or drops items falls back to the cursor's order for whatever it did not place. The cursor, the batch and the outcomes do not change. `waitingSince` follows my reading in J1 (1).
- **N202** (R23): `onLensChange` refuses through membership's `listenerRefusal` (R81), and the listeners run in `MODULE_ORDER` (R83). Bias's own LISTENER_* mint site is gone: arm G now counts 11 sites, down from 12.
- **N171**: `counts(hid)` (R42) and `uncleared({gate, limit})` (R43) added; `gate` follows my reading in J1 (2).
- **N118 / N242**: `BIAS_REFUSED`'s `where` now names the public `promotionCheck` (it named `#promotionCheck`). With the site found, the DEC-49 walk judged its return; the refusal now goes through `#refuse(…, {findings})`, and the finding mapping moved to a module helper (`refusalFindings`). Net effect in the guard: the arm C failure is gone, bias's arm G LISTENER site is gone, and there is no new failure.
- **N63**: its mark no longer holds. `biasDebtDue` and `biasDebtWake` are public on this module and tested (R41), and the scheduler calls them. Nothing was built for it.

**Deferred:** none. R26 stays a `test.todo` (deferred by K102).

**Found in other modules (for BOB):**
1. The requirement marks are stale in `build/requirements/bias.md`: R11 ("an instance scope asks no position") is met, since C-26.20 administrator authority is tested; R33–R39 "K82 (3)" are met, since ai-runs registers its runs and the sweep is this module's; R41 "N63" is met. BOB's to update.
2. **ai-runs** (its R30): its work-product `read` answers no registration time, so every run is ranked with no wait. Adding `registered` (the run's open instant) would give the rank a real wait. That is ai-runs' share.
3. **queue / legacy-store**: `store.mjs` `#obligationsBiasDebt` still reads `bias_debts` itself, and `store.mjs` counts reads `bias_statements` and `bias_adoptions` itself. Both can now call `bias.uncleared({gate: viewerPredicate(viewer), limit: 200})` and `bias.counts(hid)`. The comment in `queuestate.mjs` at line 87 still names `store.mjs #biasDebtSweep`.
4. **legacy-tests** (the DEC-49 guard, `civicos-ui/check-refusal-codes.mjs`): the floors move with this job's region, so these are re-pins, not new findings: `regions` 407→408, `regionLines` 5139→5146, `codesChecked` 867→868, `refusalsJudged` 844→845. `run-conditions.test.mjs` fails its W6, P1 and P6 arms identically before and after this job; that is pre-existing and not caused here.
5. **Generated artifact**: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) bundles the plane's source, bias included, so this job makes it stale. Regenerate at layer close.

**Tests and checks run:**
- `node --test bio-plane/test/m/bias/`: tests 49, pass 48, fail 0, todo 1 (R26).
- Users and neighbours: `test/m/scheduler/`, `test/m/ai-runs/`, `test/m/case-authoring/`, `test/m/queue/`, `test/bias.test.mjs`, `test/d526-refusal-order.control.mjs`: tests 143, pass 137, fail 0, todo 6.
- `checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `checks/architecture.mjs bias`: 9 product files, 25 relative imports; 0 failures.
- `checks/coverage.mjs bias`: 43 of 43 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs bias tranche/T10`: 6 files; legacy-store 0/0, legacy-checks 0/0; 0 failures.

Size (session_01UtHLMrHZ2X8UVfhfaiTKsg): test runs 14, module lines 1720

## J1 · QUESTION

Two readings I am building on; say if either is wrong.

1. R33 (N224), `waitingSince: when it was registered`. A work product carries no registration time today: `registerWorkProducts`' `read(key)` answers `{context, principal, lens, ranUnder, rerunOf}`, and ai-runs' source (its R30) gives no time. My reading: `waitingSince` is the work product's own `registered` field when its source's `read` answers one (ms since the epoch, or an ISO instant), else absent (null), which the scheduler's `rankBy` ranks as no wait. The sweep reads the batch first, hands the rank the items (`{kind: "bundle", id: <context id>, waitingSince}`), then compares in the rank's order; cursor, batch size and outcomes unchanged. Adding `registered` to ai-runs' source would be ai-runs' share, reported, not built.

2. R43 (N171), `gate` "over the context's bundle id, membership's predicate". My reading: `gate` is membership's `viewerPredicate(viewer)` answer (`{sql, args, scope}`, the SQL over alias `b` bound to `bundles`, its R43). `uncleared` applies it as bias's own gate does today: a machine or founder scope (`scope: "member"`) admits every debt; otherwise a debt is admitted when its context is NULL or a bundle the predicate admits. A malformed gate admits nothing. It answers `{debts, limit, truncated}`.
