# BOB — resume here. HANDOFF written 2026-09-23 ~18:15Z by BOB #30, which REFRESHED at Bob's order: it AUTO-COMPACTED at 18:01Z
(788,078 of 1,000,000 tokens) and may carry compaction loss. Successor: **BOB #31**.

Read `CLAUDE.md`, `kickoffs/BOB.md`, `docs/architecture/BIO_System_Design.md` whole, `kickoffs/NEW-MACHINE.md` §0 and §0.1,
then this. Every line is a POINTER measured ~18:15Z; re-measure before acting. FIRST ACT: confirm BOB #30
(`session_019unCkzAzfmAPMLVuRNPvui`) is stopped — its self-wake `trig_01ESEpYckTN5JKXS6gS7NaFS` was DELETED at 18:12Z, so
`list_triggers` shows none into it — and archive it under D-398. Then arm your own ~2h idle-and-waste self-wake (one-shot, re-armed).

## 0. BOB'S STANDING PRIORITY — READ FIRST, ACT ON IT EVERY TIME (Bob, 2026-09-23, said many times)

**BIO development productivity is the focus; everything else is overhead or time wasted waiting. Keep the process that
works; remove unnecessary work and pauses.** Before any act, ask: does this move product forward or unblock it? If not, don't.
- **No releases of any kind until Bob asks.** DIST is idle; its wake is paused.
- **Process changes go to lanes BY MESSAGE (trigger).** No branch, no commit, no push for them to take effect.
- **Doc updates ride a train:** collect them; push one `land/bob/*` only when a train is due, never a push of their own; no separate gate.
- **CONDUCT spawns continuously** (three hourly refill wakes :05/:25/:45) and lands every ~2h. A worker slot empty while runnable
  rows wait is the defect to find.
- **Refresh at 75%** (not 80%): the environment sets `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=80`, so a cloud session auto-compacts
  near 79% of the `get_session` figure; the app's "compacts at 97%" display does not reflect that variable. Bob: *"If we can't
  tell what the compression point is, and it could sometimes be 79%, then we need to refresh at 75%."* No worker cap for budget.
- **ONE FULL GATE PER TRAIN** (Bob, 2026-09-23 ~18:05Z: *"cut back on gates"*; *"sustained productivity and a process that
  works"*): a worker runs only its row's suites + negative control + plancheck; the train's union gate is the one FULL gate.
  Bob asked *"what exactly is the gate ruling? We want to make sure that it's the right ruling"* — BOB #30 explained it and
  recommended keeping it. **DECIDED ~18:20Z: Bob delegated it ("Do what you believe is right"); BOB #30 decided KEEP IT**, re-measure after a day per TREE-SHARING §2. Do not re-ask.
- BOB #30's mistakes to not repeat: pushing docs branches outside a train; letting DIST cut releases; ruling a cadence that
  made CONDUCT sleep; cancelling then re-arming own timers; over-correcting working processes.

## 1. THE ESTATE (get_session, ~18:05Z)

| lane | session | state |
| --- | --- | --- |
| CONDUCT #16 | `session_01DEAp94ny3PfWr6deFJtTaD` | 56% context; workers finishing their FULL gates (D-440, D-168 among them); cloud-worker trial; last train 16:53Z |
| SCHEDULER #16 | `session_01UZaSR1KRWmADuxBFYk1wY9` | 39%; hourly wake :49; LED-7 debt fold continuing; cache 8 (12 once its cache-size branch lands) |
| DIST #5 | `session_01DUyQVnz7x2hK5EajCdhEfC` | 71%, idle, wake PAUSED (`trig_014p69w2WQz7jfSkYeg4XHSF`); no release until Bob asks |
| FLEET #4 | `session_01YB9VgJtjiXwQ5vtx4fLvRB` | 32%, idle; next wake 2026-09-24 10:00Z |

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

## 3. OWED — in this order (18:15Z)

1. **`land/bob/spawn-continuous` @ `48614e29` waits for the next train** (not a push of its own): TREE-SHARING §2 spawning is
   continuous + ONE FULL GATE PER TRAIN; CONDUCT.md refill wakes; DIST.md no release until Bob asks; the 75% refresh line in
   CLAUDE.md §4, BOB.md, CONDUCT.md, TREE-SHARING §4. Verify on `main` after the train (~2h after 16:53Z's).
2. **Relayed by trigger at 18:08Z:** CONDUCT #16 (one full gate per train; 75%; ~4 concurrent gate cap; its one cloud-session
   worker TRIAL — relay the measured wall time to Bob when it reports) and SCHEDULER #16 (75%; accepts-when names suite + control).
   CONDUCT's three refill wakes (`trig_01L2gq4F…` :05, `trig_016gMZin…` :25, `trig_01KsgTeD…` :45) still say 80% and "up to the
   machine's limit" — only CONDUCT's session can edit them; ask CONDUCT to re-create them with 75% and the gate rule.
   FLEET #4 (32%) wakes 2026-09-24 10:00Z with a prompt saying 80% and "local gate GREEN": message it once.
   DIST #5 is idle at 71% with its wake paused: when Bob asks for a release, START A FRESH DIST, do not wake #5.
3. **Bob's question answered at ~17:55Z:** D-440's worker waited on its own FULL gate behind CPU contention (8 gates, 4 cores),
   not on batching; that led to the gate ruling above.
4. Carried, unchanged: the weekly budget ruling (no throttling; `allowed_warning` never brought to Bob); D-168 and migrated
   `surfaced_by` AFFIRMED; three leftover refs LEFT IN PLACE, never raise; M0-127 (CONDUCT's); v0.72–0.74 tags, Q3, D-53 — do not re-ask.

## 4. HOW BOB #30 WAS WRONG — data points (rule 12(c))

- **Re-sent a batch whose parts had already landed.** Merged three `land/bob/*` branches into one and asked CONDUCT to land it
  after the train had taken the three; the tree-identical re-merge turned main RED on GitHub (a false drop the instrument
  invented) and held a release. Check `git merge-base --is-ancestor` for every constituent before sending a batch.
- **Raised the refresh line to 80% without checking where compaction fires** (the environment's override = 80), removing
  the margin, and was auto-compacted before refreshing. Before moving a threshold, measure what sits next to it.
- **Ordered "fill every slot" without a CPU bound**: 8 FULL gates on 4 cores stalled all workers ~80 min.
