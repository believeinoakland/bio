# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #238 (`session_017kJfT1heNKtMWETrVdBWxU`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, **secondary** account), 2026-10-21 ~07:15 UTC, at 39 % of its window. **T51 is OPEN** on `tranche/T51`; **the T51 build is deployed to biosmoke8 and walked; no job runs.** Read `build/rulings-active.md` whole (its §1 "How debugging runs", K4297, is new and governs the order of everything below), then **K4285 to the last line** of `build/rulings.md` whole, then `build/plan/walk-T51-build/CAUSES.md` whole (55 KB: a reading worker, sonnet medium, if it will not fit, K3676).

## What happened this session

- Every red the whole suite found was a stale test; all fixed and merged (K4285–K4295, K4299). No member operation failed in the suite.
- The deploy route never worked (`workflow_dispatch` needs the file on `main`, K4290); with Bob's approval (K4296) `deploy-test.yml` also runs on a push to `deploy-test/<copy>/dry-run` or `deploy-test/<copy>/deploy`. **Deployed** 05:21 UTC, run 39548609065 (K4298); smoke clean (`walk-T51-build/SMOKE.md`).
- Bob, on the slow road (K4297, K4298): BOB fixes stale tests itself, no job; no red test holds a deploy unless it shows a member's operation failing; the five overlapping lines are one rule in rulings-active. **Follow it, not older checklists.**
- Bob (K4300): "find ALL the problems then go back and fix them, redeploy, and repeat. Be efficient!" Four walkers walked the build (`walk-T51-build/setup-team.md`, `find-capture.md`, `evidence-connections.md`, `conclusions-action.md`, `bob.md`); a diagnosis worker grouped them: **`CAUSES.md`, 96 causes (87 CODE, 8 of them BLOCKER; 5 PERF; 3 DESIGN; 1 DATA; 0 TEST) and 23 WORDS items.**

## Do next, in order

1. **NEEDS BOB, first:** the walkers' findings files and screenshots in `build/plan/walk-T51-build/` are **not pushed**: two commits of them were refused by auto mode as "Data Exfiltration" (K4301); the files hold no credential (checked), but the conclusions-action walker printed a grant link and the admin password into its own transcript, and some screenshots may show a review link. If this handoff's commit carried `CAUSES.md`, the plan can be made from it alone; the findings files themselves were in BOB #238's container only. Ask Bob for nothing new unless the successor needs those files: the approval already asked is "Approved: BOB may commit and push the walk's findings files in build/plan/walk-T51-build to tranche/T51", and it is valid only in BOB #238's session.
2. **Plan the fix round from `CAUSES.md`** (P19: every CODE cause in this round): one job per cause or per module (K4271, cause jobs from `prep/cause-job-K4273`), the 8 BLOCKERs (C1–C8) first, providers merged first; PERF causes C12 (co-attestation inside the 25 s capture bound), C14 (`heldcaptures` 2–14 s), the 6 MB `interfacewords` refetch; WORDS to `later-ux.md` unless one stops an act (K4270); DESIGN to UX-DESIGN as one HANDOFF only where an operation cannot complete (K4269). B1 (`bob.md`: agent-runner's `RemoteSession` answers its version 503, so `part_signin` is false and `connect` offers no sign-in) is a CODE cause for agent-runner.
3. Diagnosis worker's open points (BOB's to decide, P17): may a wrong held capture ever be retired; is a published case's empty EVIDENCE list by design; the scanner's 403 (DATA: does the deployed file-scanner carry freshclam fix bf97a18595?); CA24 (owner's reply refusal) needs a live read; C5 (21 MB PDF kept with no bytes) unconfirmed side.
4. Then: merge, regenerate (manifest order), redeploy by pushing the tip to `deploy-test/biosmoke8/dry-run` then `.../deploy` (each deploy needs Bob's approval in the session that pushes, rulings-active §2; K4296's covered BOB #238 only), smoke, then a targeted re-walk of what changed plus the smoke, then one final full pass (rulings-active "How debugging runs").

## Accepted reds, by name, until the act named

plane R24 and screens-settings R39 (T52, `later-ux.md`); journey-check R17 (T52, K4269) and its 13 walk-dependent tests (K4149, K4295); store-door R17 until the hand-row deletion (K4292); promotion `row-census` until its stamp (K4205); coverage's held ids (K4236).

## Side effects on biosmoke8 (all walkers', K4300)

An extra administrator (the team now has two administrators besides the founder's; S-22), walk projects "Walk T51 <area>", test members, 3 record exports, four signing keys on the administrator account, the member joined "Walk T51 setup-team findable". The development copy holds nothing secret (K3556).

## Running

Nothing. The design lane (UX design #36) has nothing open (U428, ACK B440). Lanes' HANDOFFs unchanged (H43, A5, W4).

## Open with Bob

- The findings-files approval of item 1, only if still needed.
- The exact P7/§6a text for K4297 (BOB fixes stale tests itself), rendered, is owed to Bob (K1258); K4297 governs meanwhile.

## Open for BOB (not Bob's)

- wizard-scripts' `wizards` declares `state` though its arm reads it from the query (K4230).
- Registry account labels to secondary at T51's close (K4251); `prep/cause-job-K4273` and `prep/words-arms-K4208` to the process repository's `main` by PR at the close (K4275).
