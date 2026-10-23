# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #265 (`session_01BbxeN7eqKoShAhoTFxmLAv`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-23 ~15:15 UTC, at 41 % of its window (`get_session`), at a clean point: every merge so far verified and pushed, every question answered. **T51 is OPEN** on `tranche/T51`; **fix round 7 is running**. Read `build/rulings-active.md` whole, then **K4742 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-7-T51.md` §0, §3, §7 and §8 whole, then `build/plan/review-round7-added-causes.md` whole (the review of `round7-added-causes.md`, G83/G84; read that plan's G83 and G84 sections whole when you rule on the review).

## Bob's direction today (in force)

- Alpha as quickly and efficiently as possible; token efficiency (K3269, K4614).
- K4426: every defect understood before the next deploy; `fixplan` 0 before any START; an independent reviewer of each plan.
- **Today, in the PERFORMANCE lane** (recorded by BOB #265): K4746 ("A for both questions": three service levels; a team's room created near the team) and K4747 ("B": the minimum of the placement enters the alpha: new rooms in the founder's region, biosmoke8's room re-created in western North America; the region shown and the picker after the alpha, N1273).
- **Nothing is open with Bob.**

## State

Merged in round 7 (K4739, K4742, K4744, K4745, K4748, K4749): site-profiles, retrieval, scheduler, record-grammar, promotion, pdf-reader (R44, R45), BOB's docprofile test fix, extraction, calculations, reevaluation, ratification (+ BOB's R59 control fix), queue-producers, screens-publish, acquisition, capture, interface-shell, screens-intake, csv-reader (R20). All their sessions archived, rows written.

**Still open:**
- **RECORD-CORE #28: COMPLETE (its J5, unread by BOB).** Merge it first (R89, R90 strike), then send QUEUE #33 a CHANGE (B14 told it to wait for this): it merges the tranche, re-runs `r7-count-cache.test.mjs`, COMPLETEs; then merge queue.
- **READING-PIPELINE #29: WORKING** on G68's PDF half and G82 (both providers merged: B34, B35 told it); it must assert the 500 ms bar in its own workerd test (B32). Unread RING at 15:10: it was rung for 15:12.
- **CONTROL-PLANE #52: COMPLETE** (J40; seam file `t51-round7-seam.test.mjs`, reds by name for unmerged providers). Merge after queue and reading-pipeline; its seam's G58 needs plane.
- **PLANE #54: COMPLETE** (J47; B67-B69 done: G58, G67, G69, G82 closed in plane, G79's keep half `NO_HOME` owes nothing, g48 stale test re-recorded). Merge last; then `t51-round6-seam` G7 and "R105, R124 (G2)" must be green (accepted red by name until plane and queue merge, K4748).
- **G83, G84 (K4746, K4747, PERFORMANCE P16, P19)**: planned in `build/plan/round7-added-causes.md` (planning worker), reviewed (`review-round7-added-causes.md`: **5 DEFECT, 9 GAP, 6 NOTE**). Before any START: rule each DEFECT (BOB's, P17): D1 the census is 18 sites (match `idFromName(`); D2 `installer-steps` R35 forbids the `runtime-limits` import (amend R35 or duplicate the allow-list with a parity test); D3 biosmoke8's room re-creation by a class delete through `deploy-test.yml` has no human step and no rollback: prefer a non-destructive route (a side-by-side copy, or a new class name by migration, keeping the old room as rollback), and every deploy act is §2's (K4296 covers the T51 build to biosmoke8, nothing more); D4 G84's data modules leave the plane's parts unsigned (`release-assemble.mjs:715-725`) and the installer's own bundle uncovered: G84 this round is the measurement at workerd and the per-key word scans only (`file-safety`, `translations`, `screens-daily`, `screens-wizards`, `screens-investigate/whywords.mjs`, `case-carriage/checks.mjs:40`, `publication/checks.mjs:33`), data modules only if the measurement says the 1 s limit is at risk, after a signed-release design; D5 G84's run-time share needs a diagnosis file at the platform's shape and `plane.md` R43/R54's 500 ms budget reconciled. Then fold the GAPs, a short second review, `fixplan` 0, STARTs.
- **G87** (Level 1's load test on a scratch copy, never biosmoke8): after the redeploy, beside PERFORMANCE #2's re-time.

## Do next, in order

1. **Take over** (§5.1): archive BOB #265 once idle (row `BOB-final`, T51); delete its backstop `trig_01JLDnGvbdfSbRZJvnUiwGPp` and WATCH #265 `trig_01Lz1VnYtNwcVHK3jf7koHBr`; arm yours; `node_modules` (K4113); a `cp-close` worktree of civicos-process `prep/T51-close-v2` for `mail`.
2. Merge record-core (K4683: merge locally, verify its suite and its direct users, then push or post), CHANGE queue, then reading-pipeline, queue, control-plane, plane as each completes; archive each, write rows.
3. Rule the review's DEFECTs and GAPs for G83/G84 (above), second review, START their jobs (sonnet, medium) in this round (P10).
4. **Round end** (plan §7): regenerate every artifact in the manifest's order (`rows.mjs` first: it clears screens-intake's two R26 reds; case-checker `program.mjs` for G59; the bundles for pdf-reader, csv-reader and others); write every requirement line the jobs proposed (listed in K4744, K4748, the plane's R90-R94, screens-intake's R31, R54, R57, R62, record-grammar's R40, reevaluation's R18, R25, retrieval's `zone({why})`, scheduler's R28, calculations' R1, R14, acquisition's R5, R96, R100, R105, capture's R103, R77, R96, reading-pipeline's R40, R1, R2, R11); the whole suite; K4426's table `k4426-check-T51-F7.md`; `fixplan` 0; one redeploy (K4296) with G83's room placement; the targeted re-walk (through the proxy only, K4733); ring **PERFORMANCE #2** (exists; find with `list_sessions`) naming the redeploy's commit; G87; the final pass; T51's close (§5.7): **the design's MERGE U464 (unread by BOB at handoff) and U458-U463 into `main` first**, words 0.

## Accepted reds (by name)

K4731's list (plane `release` R24, `l77-size` R77 L two; newgroup's and installer-steps' list; journey-check's environment reds; words `inline 6`, `missingkey 5` until the design merges at the close); `system/row-census` R50 (awaiting promotion's stamp, K1680; identical before round 7's merges); screens-intake's two R26 tests until `rows.mjs` is regenerated; control-plane `t51-round6-seam` G7 and "R105, R124 (G2)" until plane and queue merge; control-plane's round-7 seam reds until their providers merge.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275), carrying `prep/T51-close-v2`.
- Job branches only by `mail jobbranch` or by merging the tranche into them; never a force-push.
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296: Bob's approval covers the T51 build to biosmoke8; standing list: not added). A Durable Object class delete or any act destroying the copy's data is NOT covered by K4296: it is §16's if refused.
- The live copy is reached only through the environment's proxy (K4733).
- Sessions: archive each job at its merge; lanes' sessions are not BOB's to archive.
