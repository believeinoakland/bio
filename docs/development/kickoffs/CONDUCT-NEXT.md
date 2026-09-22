# CONDUCT-NEXT — the resume prompt for CONDUCT #13, in THIS Claude Code account

> **THE REFRESH, written by CONDUCT #12 on 2026-09-22 (UTC) at ~70% context, after batch 4 landed** — so the lane
> survives Bob's move, TODAY, to cloud-based Claude Code on his second account (BOB #27 records the move in
> `kickoffs/NEW-MACHINE.md` and `TREE-SHARING.md` §4). **Assume you have NO memory of this session, and possibly none
> of its tools**: `list_sessions`, `SendMessage` replies, `CronCreate` and scheduled tasks, `Agent` worktrees and this
> Mac's disk may not exist where you run. **The repository is the channel**: everything below is on `origin` and is
> checked by the commands in §1, not by recall. Where the tree disagrees with a line here, the tree is right.

## 1. RE-MEASURE BEFORE ACTING

```
git fetch origin
git show origin/main:docs/development/kickoffs/CONDUCT-NEXT.md | head -1   # names YOU, CONDUCT #13
node tools/plancheck.mjs                                                     # expect 0 fail
git show origin/main:docs/development/QUEUE.md | grep -E '· running'
git ls-remote --heads origin | grep -E 'worktree-agent|conduct'            # a surviving agent branch MEANS unintegrated work
node tools/status.mjs <topic> · node tools/decided.mjs "<subject>" · node tools/owed.mjs CONDUCT
```

Read WHOLE: `CLAUDE.md`, `kickoffs/CONDUCT.md`, this file, the open rows of `QUEUE.md`. `TREE-SHARING.md` is RULED but
NOT BUILT: until each of its three changes lands, `CLAUDE.md`'s rules stand as written (§4's push lines included).

## 2. WHAT LANDED THIS SESSION (each verified from the remote; merge shas are ancestors of `origin/main`)

| item | merge | landing | what |
| --- | --- | --- | --- |
| REC-157 | `0862b663` | `9d330478` | ALREADY_A_CASE_MEMBER compares the project's relationship; IC-173 MINOR, I3 49.1.0 |
| M0-97 + D-341 | `a3fc7581` | `9d330478` | decided.mjs files every answered register entry; the joiner stops at a heading or blank line |
| M0-81 | `3cad2084` | `9d330478` | `tools/occupancy.mjs`, the lane-occupancy judgement |
| REC-163 | `09bed92a` | `53bc7b3c` | the setup page and a PUBLIC `op=instancegroup` show the recorded slug; IC-174 MINOR, I3 49.2.0 |
| M0-109 | `1a5bc9cb` | `53bc7b3c` | the DEBT floors (`ledger`, `planning-hygiene`) become `> 0` |
| M0-99 | `508a7bc8` | batch 4 (this file's landing) | `docs/DECIDED.md` generated on demand, NEVER committed; staleness arms retired |

Batch 2's chain was RE-MADE at landing (same trees) to add two `Dropped-from-branch:` trailers `mergecarry` required;
the old -> new sha mapping is under M0-81's release in `CLAIMS.md`, and the old chain survives on the archive branch
`conduct12/batch2-pre-trailer` (and `conduct11/batch2`). Every gate: FULL or `--since` a GREEN FULL record, GREEN.

**Remote branches that are NOT unintegrated work** (so §1's `ls-remote` does not send you chasing them): the six
non-ancestor agent branches CONDUCT #10 kept (M-86: `a249f668`, `a61e489d`, `a6de3e82`, `a9e7e017`, `aa383f4f`, `aafee895`;
audited by content 2026-09-22 — three landed by another route, two superseded, and UI-43's is UI-74's evidence); and the
local-only branches pushed for the cloud move: `conduct6/batch3`, `conduct6/batch3-old`, `conduct10/flips-2`,
`conduct11/batch2`, `conduct12/batch2-pre-trailer`, `ui-65-conclude-surface`.

## 3. LIVE AT THIS REFRESH: NOTHING

- **No worker is live and no row reads `running` for CONDUCT** (verify: §1's grep). M0-99 LANDED in batch 4 as BOB #27
  ruled. **Its rule binds every later integration:** a branch cut before M0-99 that changed `docs/DECIDED.md` merges as a
  modify/delete conflict — TAKE THE DELETION (`git rm docs/DECIDED.md`), never `git add -A` over it (`plancheck` arm 2b).
- **M0-110** (the `coord` branch, TREE-SHARING §1) heads the backlog and is RUNNABLE NOW (it depended on M0-99);
  **M0-111** (landing in batches, §2) follows it; **M0-100**, NARROWED by BOB #27 to `MEASUREMENTS.md` and `INTERFACE-CHANGES.md`, sits after M0-111; M0-101 is SUPERSEDED by `coord`.
- **SLOTS I FREED AND DID NOT REFILL, on purpose:** REC-163 and M0-109 landed; I spawned no REC-166 / M0-107 / REC-165 into
  their slots, because a worker is a SUBAGENT of the session that spawns it (D-401), this session is retired by Bob's cloud
  move today, and its context stood at 64% against the 70% line. **They are YOUR first spawns**, in §4's order.

## 4. THE CACHE, AND THE ORDER (SCHEDULER #12's; verify on `origin/main`)

M0-106 is DIST's own act, NARROWED to its witness at the 0.72.0 cut. Then yours, as the machine allows:
**M0-107** (a timeout is never a finding; FULL), **REC-166** (a project's make-current writes nothing on the shared
question; depends on REC-157, landed), **REC-165** (a production cannot name a run its caller does not hold). Next in the
backlog: **REC-167** (ratify-after-withdraw), **UI-77** (unblocked by REC-163). Bob's law for the order (`CLAUDE.md` §2):
product before process tooling; no process row unless it cuts gate time or unblocks product; batch landings.

## 5. OWED, EACH WITH ITS ACTOR

- **SCHEDULER #13** (SCHEDULER #12 refreshed; BOB #27 files #13): close REC-163 and M0-109 on their merge shas — they
  wait unclosed on `main` until #13 is live; M0-109's DELEGATION (three instances of its class,
  fixes named — MOST URGENT: `corpuscheck.test.mjs` §5 requires D-388 live in `DEBT.md`, so the LED-7 batch that moves
  D-388 reds every gate); its held D-148/D-149 drain may land once M0-109 is on `main`.
- **BOB #27:** REC-163's DESIGN GAP (Publication §7 point 1 rules the slug public, silent on the rest of the row), folded
  in Publication's front matter — rule it at the code; M0-109's DESIGN GAP (`WORK-PIPELINE.md` §3's LED-7 retarget list
  omits both suites and the archiver's 10,000 B floor); BOB #26's discharge line misplaced in DIST #4's M0-106 block
  (`CLAIMS.md`), BOB's to move.
- **DIST:** REC-163's DELEGATION (`newgroup/src/index.mjs` says the op answers credentials only). DIST recorded 0.72.0 as a
  batch owed for REC-157 (IC-173), no earlier than 2026-09-23 04:00Z; REC-163 (IC-174) is a further plane change — what the
  cut carries is DIST's call, and DIST was told of both.

## 6. THE TRAPS THIS SESSION PAID FOR — receipts against me

1. **(Since M0-99 the index is never committed; the lesson holds for ANY path a merge keeps whole.)** **A merge that kept
   main's generated `docs/DECIDED.md` whole failed `mergecarry`** (via `strandedwork.test.mjs`'s
   plancheck arm) unless the merge's LAST paragraph carries `Dropped-from-branch:`. Regenerate it INSIDE the merge commit.
   An unlanded merge without it can only be RE-MADE (`git commit-tree`, same tree; push under a NEW branch name; repoint
   every in-tree citation of the old shas). `KNOWN_HISTORICAL_DROPS` is graded over `origin/main` and cannot help first.
2. **The gate records its verdict by TREE**; a RED record refuses every commit with that tree. A gate already known RED
   for a HISTORY reason: stop it (by PID, verified gone) before it records. After a GREEN FULL record, a docs-only move of
   `main` is `gates.mjs --since <that commit>` — tens of units, not the battery.
3. **A worker folded into a batch with its FULL gate unrun lands an unmet census**: hygiene's walk census named M0-81's
   control driver (`readdirSync` of its own pen). Every brief now says: name or guard any walk; ignore your pens.
4. **Never type a full sha from memory**: resolve it (`git rev-parse <short>`). A push of an invented sha failed as "the
   remote end hung up".
5. **Disk on the Mac**: `git prune-packed` returned ~380 MiB of loose objects already in packs, safely (fsck clean); your
   own `node_modules` are regenerable (`npm ci`, seconds). A worker's scratch checkout INSIDE its worktree
   (`.m099-baseline`) is walked by the estate's censuses — keep scratch checkouts as SIBLINGS.

## 7. THE MACHINE AND THE STANDING LANES

On the Mac at this checkpoint: disk ~4.4 GiB, swap ~6.2 GB of 7.2 GB, 8 GiB RAM — MEMORY bounds the wave (about three
workers). In the cloud, measure before you spawn. Standing lanes at this checkpoint: BOB #27, SCHEDULER #12, DIST #4,
FLEET #3. My self-wake (`CronCreate` `7,27,47 * * * *` + a 5-day renewal) is DELETED at this refresh; if `CronCreate` does not
exist where you run, you are driven by your operator's prompts — say so in your first report. Line 1 of YOUR handoff
names CONDUCT #14.

## 8. WHAT I DID NOT DO

I closed, archived and reordered no row; I deployed nothing; I touched neither `newgroup/` nor `release/`.
