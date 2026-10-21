# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #245 (`session_014x9XzLQGMhZC4CVqPwGUyD`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-21 ~23:50 UTC, at 50 % of its window. **T51 is OPEN** on `tranche/T51`; **fix round 4 is running** (13 job sessions). Read `build/rulings-active.md` whole, then **K4441 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-4-T51.md` whole (section 3's table: the jobs; K4453 corrects its C13 seam owner to acquisition).

## Bob's direction today (in force)

- "the focus is on getting an alpha-level release deployed as efficiently as possible" (Bob, 2026-10-21, this session). Applied (K4459, K4460): before starting or keeping a job, ask whether a member's operation fails without it; a red test alone is not that; wording waits for T52 (K4269).

## What happened this session

- 23 fix-round-4 jobs merged and archived (K4441-K4462): host-governor, file-scanner, file-safety, cause-reading-3 #2, citation, filing-templates, review, queue-producers, entities, jurisdictions, case-authoring, queue, capture, case-grammar, case-disclosures, public-read, record-core (new, R88 ranged get), money, acquisition (three passes, with the C13 seam tests), plane, capture-sources, extraction, pdf-reader, control-plane. Stale tests fixed by BOB (test files only): actions t33, case-authoring R55, intent, filings packet (R96's fallout), acquisition fix3-t51, capture R102 titles.
- DEC-412 (U447) merged into the tranche; rows regenerated (K4458); ACK B473 (the design regenerates `words-reads.json`).
- Bob's AI-lane words A26-A37 recorded (K4443; personal subscription only its owner's).
- Stopped as not needed for alpha: ACQUISITION #25 and FILE-SAFETY #16 (wording re-keys → N1261, T52; K4459); RATIFICATION #30 (P10 (d) measured, matters only past ~30k candidates → N1262; K4460).

## Running (13)

- **Priority, the blocker:** CAUSE-READING-3 #3 (`session_01SYgD5xwRehhbmdooREW3Fp`; reading-pipeline + text-chain): the large-PDF reading still peaks 888 MB above idle (pdf-reader's parse is fixed; the rest is text-chain's per-page work). Step 0 measures and reports as a QUESTION; target < 64 MB above idle, units unchanged; if the output cannot fit, BOB decides the reading's home (K4461).
- **OP-GRADES #24** (`session_01Q1BcrfRKSNQeK7397e6hvF`, haiku): the plane fails to start (`DECLARED_OP_DISAGREES: officeconfirm`) until it merges; control-plane's `t51-large-pdfs` and every plane-booting seam test wait on it. Merge it the moment it completes.
- AFFORDANCES #42, JOURNEY-CHECK #11 (local arm), CAUSE-SHELL-4 #1, SCREENS-SETTINGS #16, -INTAKE #15, -DAILY #18, -INQUIRY #20, -INVESTIGATE #14, -PUBLISH #16, -ACTION #13 (all started 23:44; K4462). At cause-shell-4's merge: CHANGE to each running screens job (merge the tranche).
- Extraction's `c5b-memory` and control-plane's R120 `t51-large-pdfs`, R122 `t51-bootstrap` are accepted red by name until cause-reading-3, op-grades, cause-shell-4 merge; then BOB re-runs them.
- Backstop `trig_01Jggb6P1YTTpBjhpDWisVvv` (23:51Z); WATCH #245 `trig_01TRKPWA6K7k1fL3F1m1RiMP` (00:30Z). Lanes: PERFORMANCE P10, JOURNEYS W4, INVESTIGATION-DESIGN H43, AI-DESIGN A37 (read through). Channel: UX-DESIGN read through U447; it has read B473.

## Do next, in order

1. **Take over** (§5.1): archive BOB #245 once idle (row `BOB-final`, T51); delete its backstop and WATCH; arm yours; `node_modules` (K4113).
2. **Merge each job as it completes** (§5.5), each ruling ending with its **Open** list (K4427 (3)); before merging a provider whose validation tightens, run its impact set's suites (K4452). Archive each at its merge, row written.
3. **One word batch to UX-DESIGN** only for stand-ins a member would otherwise not understand (K4269); readable stand-ins wait for T52.
4. **After the last merge:** regenerate (manifest order), checks, the whole suite, then K4426's check of every cause by BOB; **one redeploy** (K4296's route, K4428), the scanner image only if `container/` changed (it did not this round so far); targeted re-walk scoring old and new records apart; the performance re-measure with `Server-Timing`; one final pass; T51's close (design MERGE first, `main` merged in, every module's tests, the close PR; the process PR from `prep/T51-close-v2`).

## Accepted reds, by name, until the act named

Promotion `row-census`; acquisition `checks.test.mjs` R29 R31 and file-safety R24 (N1261, T52); op-declarations t36 R34 (AFFORDANCES #42); store-door R17; plane R24; journey-check R17; the held coverage ids (K4417); words' three op-grades findings (OP-GRADES #24 / the design's `words-reads.json`); extraction `c5b-memory`, control-plane R120 `t51-large-pdfs` and R122 `t51-bootstrap` (above); agent-worker R45 and the other stale bundles (regenerated after the last merge).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design stream's MERGE first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275).
- Job branches only by `mail jobbranch` (from `/home/user/cp-close`, the `prep/T51-close-v2` worktree of the process repository; K4385); never a force-push (K3977, K4384).
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296's approval covers the T51 build; not refused at K4423); none until round 4 is merged and checked (K4426, K4428).

## Open with Bob

Nothing.
