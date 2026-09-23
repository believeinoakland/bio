# BOB — resume here. Written 2026-09-23 by BOB #30 (running; refreshed at 09:20Z), in cloud Claude Code under Bob's second account.

Read `CLAUDE.md`, `kickoffs/BOB.md`, `docs/architecture/BIO_System_Design.md` whole, `kickoffs/NEW-MACHINE.md` §0 and §0.1,
then this. Every line is a POINTER measured at 2026-09-23 ~09:20Z; re-measure before acting on it. BOB #30 is LIVE
(`session_019unCkzAzfmAPMLVuRNPvui`, ~25% context): this file is its running state, not yet a handoff. When a successor is
named on line 1, confirm BOB #30 stopped (its `send_later` self-wakes gone from `list_triggers`) and archive it under D-398.

## 1. THE ESTATE (~09:20Z)

| lane | session | state |
| --- | --- | --- |
| CONDUCT #15 | `session_01DvbsQsqBM5Pjn2rcHk5rZ3` | integrator, ~37%; 7 workers (M0-126, M0-127, REC-169, REC-170, REC-171, UI-81, DIST-6); CONDUCT #14 ARCHIVED |
| SCHEDULER #15 | `session_013EpMgUGND1tFSQvtAaE2t7` | up since 06:31Z; archived #14 |
| DIST #5 | `session_01DUyQVnz7x2hK5EajCdhEfC` | 0.75.0 DEPLOYED (D-85's cut); its update pointer HELD until main is green |
| FLEET #4 | `session_01YB9VgJtjiXwQ5vtx4fLvRB` | idle |

## 2. WHAT BOB #30 DID (each verified on the remote)

- Archived BOB #29 (D-398; its tree unreadable from another container — its own report). BOB.md brought to the cloud:
  `create_session` spawning, lane messages by trigger, the retirement sweep by hand (`retirable.mjs` cannot read the cloud
  listing; not rowed).
- RULED, each in its home, landed at `4355bfda`: rule 2's reach (INVESTIGATIVE-SESSION §11 item 5 "Rule 2's reach": every
  creation stamped `surfaced_by: agent`, deploy tokens included; BOB INBOX, after D-85); TREE-SHARING §3a condition 3 (a
  cut's backstop is a run that REUSED NOTHING; M0-106 narrowed, `--since` withdrawn; M0-126 marks such a record); Content
  Framework §8.1 grade D's label (D-219); State Rules §4.1 a retired item is NOT citable (D-168; a publisher's retraction is
  `source_status`, stays citable). SCHEDULER #15's DELEGATION discharged.
- RULED, NOT YET LANDED: TREE-SHARING §3a condition 1 — a unit reading git history or a live ref is `GATE: never-cache
  (history)` and any reuse still runs it. Local branch `bob30-nevercache` @ `f187eaea`; push `land/bob/nevercache` once main
  is green and a local gate reads GREEN. Told to CONDUCT for the M0-126 worker already.

## 3. OWED — in this order

1. **Main is RED** (GitHub run #20 at `4355bfda`, `mergecarry.test`): a FALSE drop — my re-sent batch re-merged branches
   batch4 already carried. CONDUCT's fix, `land/conduct/mergecarry-4355bfd` (`carried` class: the branch's patch reverse-applies
   to the merged blob; `e241672` stays a drop; `95e401b`'s register row removed as never a drop, verified by BOB #30), was
   gating at ~09:00Z. When green: push `land/bob/nevercache`; DIST releases 0.75.0's pointer; M0-126 and M0-127 push.
2. **Read M0-126's diff WHOLE before it lands** against §3a's three conditions, the backstop mark (condition 3) and
   never-cache(history) (condition 1). CONDUCT holds it for this lane.
3. **Bob's open question: the weekly budget.** `get_session`'s `rate_limit_info` reads `seven_day` `allowed_warning`,
   reset 2026-09-29 18:00Z (no percentage). Recommended 3 concurrent workers; CONDUCT holds at 7 (added none) until he
   answers. Relay his number by trigger.
4. Carried from BOB #29, unchanged: M0-127 (CONDUCT's); the three leftover refs (`m0114-negctl`, `m0114-negctl-2`,
   `land/worker/m0-111-delete-probe`) need a GitHub-side delete — brought to Bob once, 06:47Z; the v0.72–0.74 tags — do not
   re-ask; M-97/M-98's git half; the hook's `CLAUDE_ENV_FILE` appends; Q3, D-53 unanswered, do not re-ask.

## 4. HOW BOB #30 WAS WRONG — data points (rule 12(c))

- **Re-sent a batch whose parts had already landed.** Merged three `land/bob/*` branches into one and asked CONDUCT to land it
  after the train had taken the three; the tree-identical re-merge turned main RED on GitHub (a false drop the instrument
  invented) and held a release. Check `git merge-base --is-ancestor` for every constituent before sending a batch.
