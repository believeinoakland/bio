# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #251 (`session_019LaUeegXQPMSR3oCkpNPgw`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-22 ~14:10 UTC, at about 43 % of its window, at a clean point (every entry answered, every merge committed). **T51 is OPEN** on `tranche/T51`; fix round 5 is merged and was deployed (K4556); its re-walk is scored (K4560, K4563); E9's three jobs and SCHEDULER #39 run. Read `build/rulings-active.md` whole, then **K4543 to the last line** of `build/rulings.md` whole, then `build/plan/walk-T51-rewalk5/A.md` and `B.md`, `build/plan/diagnosis-F5-ledger-live.md`, `build/plan/k4426-check-T51-F5.md`, `build/plan/census-join-K4557.md`, whole.

## Bob's direction today (in force)

- Alpha release deployed as efficiently as possible (K4459, K4460). Weekly meter 53 % (K4516).
- K4557 (E9): an invited, not joined member is told at the start of a weighty act to accept the invitation; gathering stays open. K4562: captures within 15 s up to ~8 MB; a larger file "being fetched" at once, fetched in the background, the member told what, why, and when it completes.
- Bob asked (2026-10-22) that a stalled scheduler be avoided and found as fast as reasonably possible: BOB's safeguards are K4563.

## What happened this session (K4543-K4563)

- Round 5 merged: pdf-reader (K4542 by #250), reading-pipeline, extraction, control-plane, roster-reader (a new cause: detectors held every line, K4548, K4551), plane (ledger, B38 alarm wake, the `l77-size` gate, K4553); a press seam test by BOB's worker (K4555); artifacts regenerated (K4554; plane bundle 32,388,221 B, 1.17 MB under 32 MiB); deployed 5ff8b5e01b (K4556).
- Re-walk 5: E4, E5, E11, E14, C47, C59 and most speed counts FIXED; **every BLOCKER is one cause: the object's alarm has not run since 06:03Z** (Cloudflare analytics: 8 `exceededResources` kills, then none), because `scheduler` `#reconcile` only pulls an alarm earlier and never replaces a spent one (K4561).

## Running jobs (mail check; doorbell routine into each, K3686)

| job | session | state | waits on |
|---|---|---|---|
| SCHEDULER #39 | `session_01WuSBArtKWiDTrSYjdTtS8z` | starting | its entry (START B2: spent alarm re-armed) and CHANGE B3 (K4563: request re-arm, heartbeat `health()`, tests); the plane's `plane.test.mjs` test that encodes "only pulled earlier" is BOB's to fix (test only) |
| FILINGS #27 | `session_01R4VFKTh7hnaT7V78r8QJnL` | RUNNING its users' suites | K4558 merge 1 |
| DOCKET #11 | `session_01SMUewbpPXf2emYuG2aQvxY` | WORKING | K4558 merge 2 |
| SCREENS-ACTION #14 | `session_012SukeKJ6jZZFc6BPcuWckQ` | COMPLETE (J23 read) | **merge after filings** (its seam test's one named red clears then); R3, R4, R5, R30, R43, R48 lines in its J23 |

## Do next, in order

1. **Take over** (§5.1): archive BOB #251 once idle (row `BOB-final`, T51); delete its backstop (the newest "BOB #251 backstop") and WATCH #251 `trig_0199Gq69TZESPKkh75MjAXdf`; arm yours; `node_modules` (K4113); `/home/user/cp-close` at civicos-process `prep/T51-close-v2` (`git worktree add`, detached is fine; its `tools/mail.mjs` has `jobbranch`). The whole suite's second half (`HALF=1`) was running in BOB #251's container and is lost: re-run it (the first half: only file-safety R24 and plane R24, accepted).
2. **Merge** filings, docket, then screens-action (K4558), then scheduler (writing R-lines from each COMPLETE).
3. **Plan fix round 6** whole (K4297 (3)) from re-walk 5's STILL and NEW rows, `later-ux.md` for MINORs: the alarm (scheduler, K4561/K4563), the plane's half of K4563 (the Worker's scheduled trigger that checks and re-arms; `owedwork` states last run, next alarm, oldest overdue row), K4562's large-capture background fetch (acquisition, control-plane, screens-intake; the "being fetched" line and a completion notice; words by HANDOFF to UX-DESIGN), B's NEW BLOCKER `DOCUMENT_COPY_PENDING` and the raw "{document}" (whether only the dead alarm, or also a screen defect), A's NEW MAJORs (15.3 MB 504 at 25.4 s; visitor capture 502 at 12.7 s; the 12 MB text read inline but `op=reading` found:false; old 0125/0127 not repaired; 0115 statement without size), speed (Project 5.6-17 s, Held with a project filter 300-400 ms a row, `in-heldcaptures` 3.4-4.6 s). Then regenerate, checks, the whole suite, K4426's check, **one redeploy**, re-walk, final pass.
4. **T51's close** (§5.7): U448 then U449 merged into `main` first, `main` merged in, every module's tests, the close PR; the process PR from `prep/T51-close-v2`. Close audit as K4540's handoff named (journey-check's older `not yet met: T51` marks, case-disclosures R33, corpus-export R11, R12).

## Accepted reds, by name, until the act named

Promotion `row-census`; file-safety R24 and plane R24 `release.test.mjs` (stale design rows: U448's merge at the close); journey-check R17 (T52); screens-action `join-seam-t51` "the real filings refuses..." until filings merges.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs U448 and U449 first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275).
- Job branches only by `mail jobbranch` (K4385); never a force-push (K3977, K4384).
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296; not refused at K4423, K4520, K4556); none until round 6's K4426 points are checked.
- Sessions: archive each job at its merge; lanes' sessions are not BOB's to archive.

## Open with Bob

- **Who is told when background work stalls** (asked 2026-10-22 ~14:05): A (recommended) administrators get a notice in Settings and a queue item, and a member waiting on a document sees "waiting: background work is delayed"; B administrators only; C no one in the product. No answer yet; the safeguards themselves are BOB's and placed (K4563).

Lanes: AI-DESIGN A40, JOURNEYS W4, INVESTIGATION-DESIGN H43, PERFORMANCE P14 unchanged. Channel: BOB posted B476 (K4557 NOTICE), B477 (HANDOFF, the join door in place and two rows), B478 (K4562 NOTICE); UX-DESIGN through U449, nothing unread.
