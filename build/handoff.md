# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #183 (`session_01Sz2cV1dVxy9VN39DCcYCKU`, depth 1, parent ROOT #6 `session_01FXbdTJZyPp3Bhcv7pfVSR1`), 2026-10-15 ~14:25 UTC, at ~49% context, **T49 L11 plus out-of-layer: every job merged; JOURNEY-CHECK #5 re-walking from step 12**. Read `build/rulings-active.md` whole first; K3405–K3412 are this session's rulings (read them in `build/rulings.md`).

## Where things stand

- **Bob answered "Step 12: A"** (K3407). Both out-of-layer jobs ran and are merged: machinery-producers R13 (K3408, MACHINERY-PRODUCERS #3) and agent-worker R90 (K3411, AGENT-WORKER #24). screens-inquiry B13 (K3405) and screens-settings B8 (K3410) also merged.
- **Running:** JOURNEY-CHECK #5 (`session_013z7NcUn9hLQf4ocmtFLxNU`, Sonnet; restarted from #4 at 70% context, #4 archived, row written) on B11 (re-walk from step 12: the walk now stops at `question.concluded.by` not drawn on the question page, then R10; diagnose, fix if the walk's, REPORT if screens-inquiry's) and B12 (merge the tranche again before the final walk). Merge it when COMPLETE (§5.5). If it REPORTs a screens-inquiry defect: SCREENS-INQUIRY #4 is at ~70% context, so restart it as #5 (archive #4 with its row) rather than waking it.
- **Reds accepted by name:** screens-daily `contract.test.mjs` R1–R13 `themeread` (K3403); agent-worker `requirements.test.mjs` R45 and `fleetbundles` for agent-worker (stale bundle, K3411) until L11's regeneration; journey-check step 12/R10 until #5 completes.
- **Design stream:** merged into the tranche through `f8edc66dd2` (U274, U277, U280; DEC-272–DEC-275; K3406, K3409, K3412), setup-words' `rows.mjs` regenerated each time. UX-DESIGN #19 is `session_01EPwenCi4PznbtLzRxkEMSw` (primary account, same as ours: rings work). Channel read through U280; our outbox at B235.
- **Owed at L11's close (BOB's own edit, no job):** N1142, the five requirements that still call their keys owed (screens-daily R29, R31; screens-investigate R29; screens-settings R37; screens-inquiry R33): strike "owed" wording, keys are given (K3409).
- **Routed to T50** (in `next.md` and partly in `draft-T50-plan.md`): N1139 (slug titles), N1140 (capture-request producer's keys, DEC-274), N1141 (shell.queue/group explanations), N1143 (skills: pack names `record_id`; sooner if the live walk shows the real model missing it), N1144 (DEC-275 `.here.` keys). The T50 draft (`draft-T50-plan.md`) has N1130–N1139 folded (T50-48/49 dropped, K3407); N1140–N1144 still to fold.
- **Stale RINGs** in `mail check` for DUTIES #7, CASE-INPUTS #3, NOTICE-PRODUCERS #12, MACHINERY-PRODUCERS #3, AGENT-WORKER #24 (complete, cursor unmoved): ignore.
- **SITE-LAUNCH lane:** its LOG shows the stewards' forwarding rule created and the delivery test failed (`ef66a97ad5`); no new H entry for BOB. That is Bob's in that session.
- **Lanes:** investigation H43, actions H31, unchanged.
- **Timers:** WATCH #183 `trig_01513C7UzSqiPxxEYG47F66t` (into ROOT). Backstop: BOB #183 keeps its own until your takeover (§5.8 (3)). Delete both at takeover; arm your own.
- **Prepared:** `npm ci` was run in agent-runner (`--ignore-scripts`), sheet-worker, site and `bio-plane/src/journey-check` in BOB #183's container only; repeat in yours.
- **Bob's meter:** this account shows a seven-day `allowed_warning`; Bob not yet asked at this turn.

## What comes next, in order

1. **Take over** (§5.1); archive BOB #183, write its BOB-final row under T49.
2. **Merge JOURNEY-CHECK #5** when COMPLETE; route any REPORT (P9).
3. **Close L11** (§5.6): N1142's wording edit; regenerate the manifest's artifacts (program.mjs, court-data.mjs, setup-words' rows.mjs and site's pages.mjs first, then `node bio-plane/scripts/bundles.mjs`, then newgroup), verify (`fleetbundles`, `newgroup-bundle-fresh`), `checks/run.mjs`; archive every L11 and out-of-layer session with its row (the four out-of-layer from K3398 too: READING-PIPELINE #14, NOTICE-PRODUCERS #12, CREDENTIALS #17, EXTRACTION #24; and AGENT-WORKER #24, MACHINERY-PRODUCERS #3).
4. **Close T49** (§5.7, `current.md` "BOB's acts"): merge `main` if it moved; the design PR #39's commits on `MERGE` (U280's `f8edc66dd2` is already in the tranche); every module's tests (K2704); the PR `tranche/T49` → `main`; the release cut, N780 images, biosmoke8 installed, biosmoke7 removed, journey-check R12 live by subscription, BOB's own live walk as administrator and member (watch N1143), then "ready" to Bob. Open T50 at once from `build/plan/draft-T50-plan.md` with N1130–N1144 and every red still open.

## Acts on main or sessions (reviewed acts, §5.8)

- T49's close: PR `tranche/T49` → `main` with the GitHub merge tool, method merge (§5.7 (3), K2273); no refusal recorded.
- Design-branch merges into `tranche/T49` (K3366 (5), K3406, K3409, K3412), never `main` mid-tranche; no refusal recorded.
- Out-of-layer jobs: only on Bob's approval, each time (K1548; approved for T49 in K3398 and K3407 only).
- Deploys and Cloudflare removals (biosmoke8, biosmoke7, the site's Worker): Bob's approval in session each time (K1715). The live subscription sign-in needs Bob to enter its code once.

## Open with Bob

- The stewards' address delivery test failed (SITE-LAUNCH, with Bob).
- Translations (N670's R88); the records-request template's reviewer (N858).
