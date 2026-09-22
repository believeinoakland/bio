# BOB — resume here. Written 2026-09-22 by BOB #25 for BOB #26, in the SAME Claude Code account.

Read `CLAUDE.md`, then `kickoffs/BOB.md`, then `docs/architecture/BIO_System_Design.md` whole, then this.
**Everything below is a POINTER measured at ~12:55Z 2026-09-22; re-measure before resting anything on it.** BOB #25
refreshed at 65% because SCHEDULER #11's group of four questions (LED-7 S11-1) would cross the 70% line mid-flight.

## 0. YOUR FIRST ACTS

1. **Archive BOB #25** (`local_babb2649-0f52-4648-abed-06229cedd06b`) under D-398's three conditions, re-checked AT THE
   MOMENT YOU ACT, after confirming by message to "BOB #25" that its OWN `CronList` is empty (never by ids). Its worktree
   `.claude/worktrees/bob-25` was made by hand (branch `bob25/work`, pushed as `bob25/work-5`) and holds
   `bio-plane/node_modules` (~210 MiB): `archive_session` will not remove it, so `git worktree remove` it by that literal
   path, disk measured before and after.
2. Arm your self-wake and its 5-day renewal WITH THE SELF-AUDIT IN THE PROMPT (rule 12(a)), stating 70%.
3. `owed.mjs BOB`, `plancheck`, `status.mjs --check`; `get_usage` for every lane plus the weekly figure; sweep finished
   heartbeat runs with `list_task_runs conduct-heartbeat` and archive the `succeeded` ones by id (cheaper than the verbatim
   `list_sessions` file, and BOB.md step 3 sanctions it).

## 1. THE ESTATE, measured ~12:55Z

- **Live lanes:** CONDUCT #12 (up ~12:50Z; first job: land batch 2 — REC-157, M0-97/D-341, M0-81 — under one FULL gate;
  CONDUCT #11 stays up only to forward M0-81's report), SCHEDULER #11 (gating its drain of BOB #25's D-293 entry as
  M0-104/M0-105 plus LED-7 batch S11-1), DIST #4 (0.71.0 cut, deployed, seeded, pointed at `06832aff`; ~53%), FLEET #3
  (65%; asks for the FLEET #4 chip at 70%).
- **THE MACHINE IS THE CEILING.** The Mac slept with its lid closed from ~01:56 to 05:21 PDT (`pmset -g log`: Maintenance
  Sleep stretches of 26-64 minutes, 45-second dark wakes); keep-awake prevents idle sleep only. It has 8 GiB of RAM with
  ~5 of 6 GiB swap in use. Together they made a ~16-minute battery take 8,756 s (DIST #4's landing gate). Told to Bob.
- Disk 5.72 GiB. Weekly all models **73%** at 12:51Z (64% at 02:21Z), resetting 2026-09-26 11:00Z.

## 2. WHAT BOB #25 DID — on `main`, verified from the remote

- `37367611` SCHEDULER #10's three questions: the intent layer and §13.1's measure are STATED DEFERRALS (Framework front
  matter); D-120 deferred behind the archive fallback; D-85 narrowed; the run-binding defect found (now REC-165).
- `5a807b8a` D-293's design gap RULED (a dirty run keyed by its temporary-index tree); CLAUDE.md §6's gate classes.
- `0b7328bc` D-288 archived (closed in full since 2026-09-17); M0-48's five-day-old delegation discharged.
- `032d1ce1` **BOB'S RULING ON THE RECORD — "Never queue a gate behind another lane's" (CLAUDE.md §6, Bob, 2026-09-22)**;
  the throughput entry (DIST's step 1 reuses a GREEN FULL record; timeouts read NOT MEASURED, never RED) placed before
  M0-103; REC-157 RULED (a project's make-current writes nothing on the shared question, `INVESTIGATIVE-SESSION.md` §7);
  M0-97's second specimen added to VERIFICATION's cut; Distribution §4 and System Design §6 corrected (DIST deploys the
  installer; nothing waits on Bob). Filed the DIST #4, SCHEDULER #11 and CONDUCT #12 chips; archived 12 heartbeat runs.

## 3. OWED — in this order

1. **RULED BY BOB 2026-09-22 — "The goal is BIO work. Process is overhead."** Product rows (M8-M10: publish, accept, the
   case path) go ahead of M0 process tooling; no process row unless it cuts gate time or unblocks product; batch landings;
   massive suite sets only when necessary. Measured when asked: 48 of 109 open rows were M0, and 11 of 99 commits on
   `main` in 24 h touched product code. **On the record in `CLAUDE.md` §2** (this landing); SCHEDULER #11 was told to apply
   it to the order and write it into `kickoffs/SCHEDULER.md`. **Apply it to this lane first:** one landing per turn, and
   mint no process row that does not pay for itself in gate time.
2. **SCHEDULER #11's group of four (LED-7 S11-1)** — not yet on `main` at writing; it arrives as a DELEGATION to BOB.
3. **With Bob, unanswered — do not re-ask:** Q3 (a case resting on a NO-PROJECT conclusion; REC-157's no-project corner
   rides with it), D-53 (credibility), `DECIDED.md` leaving the committed tree. **Carried:** D-148, D-149, where a member's
   or project's Claude key would live, MK-7's provisionals, M0-85.
4. **Residue with no watcher, recorded not acted on:** D-120's trigger (an archive miss is returned to the tick, never
   recorded); a measurement was dropped as low value on Bob's throughput direction.

## 4. HOW BOB #25 WAS WRONG — data points (rule 12(c))

- **Chained `waitquiet` with `;` twice, so my gate ran beside other batteries; then overcorrected and waited 2.5 hours to
  run a 4-minute DOCS check, and designed a queue before Bob named the cost.** The fix is less work, never a queue.
- A post-gate one-marker edit created a CONTRADICTORY DELEGATION warning; an amended date created a corpus RED — re-run
  plancheck after ANY post-gate edit, and read `corpuscheck` when a design document's body moved.
- Writing `list_sessions` verbatim for `retirable.mjs` cost ~12k tokens; `list_task_runs` did the heartbeat sweep for less.
