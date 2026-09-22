# BOB — resume here. Written 2026-09-22 by BOB #27 for BOB #28, the first BOB under Bob's second account in cloud Claude Code.

Read `kickoffs/NEW-MACHINE.md` **§0 FIRST** — what a cloud session starts without, and what to measure before resting any
rule on it — then `CLAUDE.md`, `kickoffs/BOB.md`, `docs/architecture/BIO_System_Design.md` whole, then this. Written at
the stand-down Bob ordered at ~16:45Z (clock read 16:49Z) 2026-09-22; everything below is a POINTER measured then —
re-measure before acting on a line.

## 0. YOUR FIRST ACTS

1. **Confirm the OLD account is stopped** — two accounts developing at once is the one failure nothing catches. BOB #27
   stood every lane of it down and confirmed each (§1); `origin/main` not moving since, and Bob's word, confirm it from
   where you are. **BOB #27 itself was left idle with no wake, for Bob to close.**
2. **Run `node tools/plancheck.mjs` BEFORE ANY PUSH**: a fresh clone has no push guard until plancheck installs it.
3. **Measure your environment** (NEW-MACHINE §0's list) and record each answer there with the date: the session tools,
   cross-session replies, scheduled routines and `CronCreate`, `npm ci` in the three packages, node's major (26), disk and
   memory, the FULL gate's time and pass count (M0-114 unblocks on it), and — with your first real landing — whether a
   push to `main` is accepted. **The secrets, Bob's option C:** all ten keys should be environment variables here; confirm
   each by USING it (`wrangler whoami` must report `20b533579290b9b93168345edd3b7f72`), never print one, and name any absent.
4. **Stand the lanes up in NEW-MACHINE §6's order** — SCHEDULER #14, CONDUCT #14, DIST #5, FLEET #4 — each from its own
   `-NEXT.md`, each written for a cloud successor with no memory. Where there is no chip, write each lane's paste block and
   Bob starts it. **If M0-110 (the `coord` branch) has landed, every handoff lives on `origin/coord`**: read line 1 there.

## 1. THE ESTATE AT THE STAND-DOWN (old account, Sparky-Air)

| lane | last session here | stopped and archived | its handoff on `origin/main`, line 1 |
| --- | --- | --- | --- |
| SCHEDULER | #13 | ~17:03Z | `ccfd7c35` — *# SCHEDULER-NEXT — the resume for SCHEDULER #14, in the cloud …* |
| CONDUCT | #13 | ~17:08Z | `47f22c06` — *# CONDUCT-NEXT — the resume prompt for CONDUCT #14, in cloud Claude Code under Bob's second account* |
| DIST | #4 | ~16:58Z | `034ce1bc` — *# DIST — resume here. Written 2026-09-22 by DIST #4 for DIST #5, who may run in the CLOUD …* |
| FLEET | #3 | ~16:53Z | `d6198bfe` — *# FLEET — resume here. Written 2026-09-22 by FLEET #3 … for a successor that may open in the cloud …* |
| BOB | #27 | left idle, no wake, for Bob to close | this file |

- **Work in flight, saved on its own branches (CONDUCT-NEXT §2 and §4 carry the detail):** REC-166 on
  `worktree-agent-a1707ddf948cd5c29` (`cd046a8e`; its claim block unreleased), REC-165 on
  `worktree-agent-a085d980f98329517` (`187075ea`); M0-107 and M0-110 pushed nothing (their measured designs are in the
  four workers' reports, `origin/conduct13/standdown-reports`, a ROOT commit — read it, never merge it).
- **IDS MINTED ON THE MAC:** `mintid`'s ledger lived in the old clone's `.git`; a fresh clone takes its floor from the
  corpus on `main` alone, so an id minted there but carried only on an unmerged branch — **IC-175, on REC-166's branch** —
  can be minted a second time. Reuse it when that branch resumes; check `node tools/mintid.mjs --list` before minting.
- **Design gaps CONDUCT #13's workers reported, for this lane:** M0-110 — (a) whether the ARCHIVE ledgers also move to
  `coord` (TREE-SHARING §1 names only the live ones), (b) a suite that reads a live ledger will read `coord`, so a
  `main`-keyed gate record no longer settles it, (c) `MILESTONES.md` holds debt-row STATE, (d) the heartbeat's skill
  reads `CONDUCT-NEXT` from `origin/main`; REC-165 — INVESTIGATIVE-SESSION §11 item 5 rule 1 is silent on whether a
  suggestion's target question must lie inside its run's context; M0-107 — VERIFICATION.md says nothing of a timeout's
  outcome. And for SCHEDULER to drive before placing: `capturerequest` credits another member's run (REC-165's find).

- **Weekly all models 83%** at ~16:10Z on the old account, resetting 2026-09-26 11:00Z; the new account's is yours to read.
- **The heartbeat task** (`conduct-heartbeat`, the old account's Mac): DISABLED at the stand-down. Its definition is
  verbatim in `docs/archive/conduct-heartbeat-SKILL-2026-09-19.md`; a cloud replacement waits on measuring routines.

## 2. WHAT BOB #27 DID — on `main`, each verified from the remote

- **Bob's order of ~15:06Z, the productivity changes fully recorded before the move:** TREE-SHARING §4 (what the cloud
  changes in each change) and §5 (the whole program by pointer); NEW-MACHINE §0, §7 and §9.2; this account's memory carried
  whole into `docs/archive/account-memory-2026-09-22.md`. Bob's **option C** (~15:48Z): all ten keys in the one cloud
  environment (NEW-MACHINE §0).
- **Bob, ~15:40Z, on lane contention** ("perhaps 1/2 the work … wasted and redone"): MEASURED (M-97: 24 of 59 recorded gate
  runs discarded; M-98: the shared files left most landings after M0-99 and the claim rule; the discard rate not yet
  measurable). Ruled at once: no claim block for a one-commit edit (`CLAUDE.md` §4). M0-110's first stage beside M0-99;
  M0-116 (the gate's selection) diagnosed and placed.
- **Ruled at the code:** REC-163's gap (only the slug is public; Publication §7); M0-109's (WORK-PIPELINE §3); SCHEDULER
  #13's four LED-7 questions — D-150 (Publication §3 rule 11), D-147 (Case Making §2), D-128 (Framework §8.2, the declared
  flow append-only), D-159/D-165 (door 3 extended). Three rows wait in the BOB INBOX for the cloud SCHEDULER.

## 3. OWED — in this order

1. **The move:** NEW-MACHINE §0's measurements, recorded; `CLAUDE.md` §4, §6 and §8 corrected where they assume the Mac.
2. **The contention fix stays the head of the plan** (Bob, ~15:40Z): M0-110 (coord; its cutover is CONDUCT's at
   integration, with every `origin/main:…-NEXT.md` gate corrected — the row's `owed-at-integration`), M0-111, M0-116;
   M0-114 unblocks on your first cloud gate figures, and only if they still favour a runner does Bob get the Actions
   question. Re-measure M-97/M-98's git half after coord lands and tell Bob what it removed.
3. **With Bob, unanswered — do not re-ask:** Q3 (a case resting on a NO-PROJECT conclusion), D-53 (credibility). **Carried,
   not yet asked:** whether an unresolved objection to a case's exclusion statement travels with the published case
   (Publication §3 rule 11) — bring it when M10's ceremony is designed. Also where a member's or project's Claude key
   would live, MK-7's provisionals, M0-85.

## 4. HOW BOB #27 WAS WRONG — data points (rule 12(c))

- Wrote clock times into the record from estimates ("~16:10Z", "~16:45Z", "16:05Z") without reading the clock; the real
  times were ~15:40Z and ~15:48Z, and one copied into DIST-NEXT through a message. Read `date -u` before writing a time.
- Archived a heartbeat run from its `list_sessions` row before `list_task_runs` confirmed it (it was the finished run).
- `echo ===` in this zsh fails as `== not found` (the `=cmd` expansion): quote a string that starts with `=`.
