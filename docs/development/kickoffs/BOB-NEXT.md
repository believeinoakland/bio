# BOB — resume here. Written 2026-09-23 by BOB #30 (running; refreshed at 13:20Z), in cloud Claude Code under Bob's second account.

Read `CLAUDE.md`, `kickoffs/BOB.md`, `docs/architecture/BIO_System_Design.md` whole, `kickoffs/NEW-MACHINE.md` §0 and §0.1,
then this. Every line is a POINTER measured at 2026-09-23 ~13:20Z; re-measure before acting on it. BOB #30 is LIVE
(`session_019unCkzAzfmAPMLVuRNPvui`, ~47% context): this file is its running state, not yet a handoff. When a successor is
named on line 1, confirm BOB #30 stopped (its `send_later` self-wakes gone from `list_triggers`) and archive it under D-398.

## 1. THE ESTATE (~09:20Z)

| lane | session | state |
| --- | --- | --- |
| CONDUCT #16 | `session_01DEAp94ny3PfWr6deFJtTaD` | started 12:21Z by BOB #30 (CONDUCT #15 refreshing at 63%); first merge M0-126 (LAND); cap 7 |
| CONDUCT #15 | `session_01DvbsQsqBM5Pjn2rcHk5rZ3` | relay-only for 6 workers; #16 archives it |
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
- RULED, PUSHED (`land/bob/migration-replay` @ `fe66cd61`): INVESTIGATIVE-SESSION §11 item 5 — a MIGRATION REPLAY is
  not a surfacing (admin class + a registered drive-provenance capture listing the revision's SHA-256; keeps its Drive-era
  `surfaced_by`). REC-171 (rule 2 for deploy tokens, stamp `class:<cls>`, NOT the `token:` this lane mis-wrote) made
  `migrate.mjs` refuse; the replay row is in the BOB INBOX after REC-171. Brought to Bob as reversible.
- RULED, PUSHED (`land/bob/nevercache`): TREE-SHARING §3a condition 1 — a unit reading git history or a live ref is
  `GATE: never-cache (history)` and any reuse still runs it.

## 3. OWED — in this order

1. **Main is GREEN again at `19101d04`** (CONDUCT's `carried` class, `cf6f14ab`; mergecarry over all of main: the 4
   registered drops, 15 carried). `land/bob/nevercache` @ `98fb13b7` (TREE-SHARING §3a condition 1, gate GREEN DOCS 51/51)
   is PUSHED and waits for CONDUCT's next train, with `land/bob/migration-replay`; verify both on main. DIST may now release 0.75.0's pointer.
2. **M0-126: READ WHOLE and answered LAND (11:15Z)** — `land/worker/M0-126` @ `d47af600`; all three §3a conditions and the
   backstop mark met; it also fixed main's GitHub run, which ran DOCS only. OWED BY THIS LANE once it is on main: correct
   `kickoffs/DIST.md` release step 1 (drop `--since`; `gates.mjs --full --no-reuse`, or an `isBackstop()` record for the exact
   tree), and TREE-SHARING "As built" item 10 if CONDUCT did not (the train's tree reuse is NOT correct for never-cached units;
   M0-131). `nevercache` LANDED at `d89e04d1`; `migration-replay` rides batch7.
3. **The weekly budget — RULED BY BOB 2026-09-23 ~13:15Z:** *"I have 2 Max 20x accounts. The other one refreshes early
   Saturday morning, whereas this one refreshes early Tuesday. Don't sever to preserve or spread out token usage. We're
   good."* No worker cap, no throttling for the weekly budget; an `allowed_warning` is NOT brought to Bob again. Relayed to
   CONDUCT #16 (cap of 7 lifted). OWED: fold into `kickoffs/BOB.md` opening step 4 with the DIST.md correction (one landing).
   STILL OPEN with Bob, brought once: migrated questions keep their Drive-era `surfaced_by` (INVESTIGATIVE-SESSION §11 item 5).
4. Carried from BOB #29, unchanged: M0-127 (CONDUCT's); the three leftover refs (`m0114-negctl`, `m0114-negctl-2`,
   `land/worker/m0-111-delete-probe`) need a GitHub-side delete — brought to Bob once, 06:47Z; the v0.72–0.74 tags — do not
   re-ask; M-97/M-98's git half; the hook's `CLAUDE_ENV_FILE` appends; Q3, D-53 unanswered, do not re-ask.

## 4. HOW BOB #30 WAS WRONG — data points (rule 12(c))

- **Re-sent a batch whose parts had already landed.** Merged three `land/bob/*` branches into one and asked CONDUCT to land it
  after the train had taken the three; the tree-identical re-merge turned main RED on GitHub (a false drop the instrument
  invented) and held a release. Check `git merge-base --is-ancestor` for every constituent before sending a batch.
