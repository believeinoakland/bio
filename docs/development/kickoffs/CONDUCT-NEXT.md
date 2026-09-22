# CONDUCT-NEXT — the resume prompt for CONDUCT #14, in cloud Claude Code under Bob's second account

> **THE STAND-DOWN, written by CONDUCT #13 on 2026-09-22 (UTC) ~17:05Z at Bob's order** (relayed by BOB #27 at ~16:49Z):
> development in the old account STOPPED; it continues in cloud Claude Code under Bob's second Max 20x account
> (`kickoffs/NEW-MACHINE.md` §0). **Assume you have NO memory of this session and possibly none of its tools** — the
> desktop's `list_sessions`, `ListAgents`, `archive_session`, `SendMessage` replies, `CronCreate` and scheduled tasks,
> the Agent tool's worktrees, and the old Mac's disk are all UNMEASURED where you run (NEW-MACHINE §0). **The repository
> is the channel**: everything below is on `origin` and checked by §1's commands, not by recall. Where the tree disagrees
> with a line here, the tree is right.

## 1. RE-MEASURE BEFORE ACTING

```
git fetch origin
git show origin/main:docs/development/kickoffs/CONDUCT-NEXT.md | head -1   # names YOU, CONDUCT #14
node tools/plancheck.mjs                   # in a fresh clone this ALSO installs the push guard (NEW-MACHINE §0); expect 0 fail
git show origin/main:docs/development/QUEUE.md | grep -E '· running'       # four rows, NO live worker (§3)
git ls-remote --heads origin | grep -E 'worktree-agent|conduct'
(cd bio-plane && npm ci) && (cd pdf-worker && npm ci) && (cd ocr-worker && npm ci)   # a fresh clone has none
node tools/status.mjs <topic> · node tools/decided.mjs "<subject>" · node tools/owed.mjs CONDUCT
```

Read WHOLE: `CLAUDE.md`, `kickoffs/CONDUCT.md`, this file, the open rows of `QUEUE.md`. **A fresh clone holds NO gate
record** (D-293 keys them per clone): your first gate is FULL, and `gates.mjs --since` means nothing until a GREEN FULL
record exists in YOUR clone. Measure the cloud machine (`df -h`, memory, cores) before sizing a wave: the old Mac's bound
(8 GiB, about four workers) does not carry over. If `CronCreate` does not exist where you run, you have no self-wake:
say so in your first commit, and your operator's prompts drive you.

## 2. WHAT CONDUCT #13 DID (each verified from the remote)

- Archived CONDUCT #12 under D-398 (its own CronList confirmed empty by its reply) and removed its worktree.
- **`3bbcb6e1`**: wave 1 flipped `running` — M0-107, REC-166, REC-165, M0-110 — each checked NOT LANDED by content.
- **This landing**: M0-110's `owed-at-integration:` line (BOB #27, below) and this file.
- **Integrated NOTHING**: the stand-down came about 30 minutes into the wave. Every row is where §3 says.

## 3. THE FOUR `running` ROWS — NO WORKER IS LIVE; EACH IS A RESUME

Each worker was told to push what it had and stop, and each reported stopping (VERIFIED ZERO live at ~17:00Z). By
`QUEUE.md`'s status rule a `running` row with no live worker is UNDETERMINED: read the branch. None is
done-awaiting-integration. **Each worker's full final report is on a never-merged root branch**:
`git fetch origin conduct13/standdown-reports && git show origin/conduct13/standdown-reports:<ROW>.md` (`README.md` there
indexes them).

| row | branch on origin | last pushed sha | state at the stand-down |
| --- | --- | --- | --- |
| REC-166 | `worktree-agent-a1707ddf948cd5c29` | `cd046a8e` | its CLAIMS block only (UNRELEASED); **IC-175 minted for it — REUSE IT**; the edit, the suites it breaks and the new suite are planned in the report |
| REC-165 | `worktree-agent-a085d980f98329517` | `187075ea` | WIP: two `.gitignore` pen lines; NO claim; **the 13-step plan is that commit's MESSAGE** |
| M0-107 | none (nothing edited) | — | the timeout census and an 8-step design, report only |
| M0-110 | none (nothing edited) | — | today's per-path churn, every reader of the moved files, `coord.mjs`'s design, report only |

To resume one: brief a worker exactly as `kickoffs/CONDUCT.md` says, plus *read the report first*; for REC-166 and
REC-165 it continues ON the branch (fetch it, `merge origin/main` into it, push under the same name). Rewrite the row's
spawn sentence when you spawn (the word stays `running`); keep each row within P5's 3072 B (LED-6 is done, so P5 FAILS
over it — M0-110's row is at ~3050 B).

## 4. OWED — each with its actor

- **M0-110's `owed-at-integration:` line (BOB #27)**: once the handoffs move to `coord`, `git show
  origin/main:…-NEXT.md | head -1` returns the pointer, so every gate reading line 1 there fails. The migration commit
  redirects each reader to `origin/coord` (NEW-MACHINE §6–§7, BOB.md's opening and currency check, each lane's opening,
  BOB's chips, `occupancy.mjs`, `retirable.mjs`) and an arm fails on any left. **The `coord` cutover is CONDUCT's act at
  integration** — the worker never pushes `coord`; it delivers an idempotent migration script — and **CONDUCT tells BOB
  the minute it lands**, because BOB's paste blocks must then name `origin/coord`.
- **IC-175** was minted on the old Mac's `.git/bio-idalloc`, which did not travel: a fresh clone's mint floor cannot see
  it (it is only in REC-166's branch). The REC-166 resumer reuses it; `node tools/mintid.mjs --audit --base origin/main`
  after every merge catches a collision.
- **For BOB — design gaps from the reports:** (1) M0-110: the ARCHIVE ledgers (`QUEUE-closed.md`, `DEBT-closed.md`,
  `BOB-INBOX-drained.md`, `QUEUE-cut-*.md`) are written by the same act as the live ones — move them to `coord` too,
  against TREE-SHARING §1's wording?; (2) M0-110: after the cutover, battery suites that read the live ledgers read
  `coord`, so a `main`-keyed gate record no longer settles them — the write command's checks must cover them, or they
  leave the battery; (3) M0-110: `MILESTONES.md` holds debt-row STATE inside a descriptive file; (4) M0-110: the
  heartbeat's skill lives OUTSIDE the repository (`docs/archive/conduct-heartbeat-SKILL-2026-09-19.md` is its copy; it
  reads `origin/main:…/CONDUCT-NEXT.md`) — a DELEGATION to BOB; (5) REC-165: INVESTIGATIVE-SESSION §11 item 5 rule 1 is
  silent on whether a suggestion's target question must be inside its run's context; (6) M0-107: `VERIFICATION.md` says
  nothing about a timeout's outcome. Sent to BOB #27 at the stand-down; the cloud BOB owns them.
- **For SCHEDULER — defects with their fixes named (each to be DRIVEN before placing):** REC-165's `op=capturerequest`
  accepts any running run and credits its principals (fix: the same stamp, sight check and principal gate); M0-107's
  three (the battery has no per-suite budget; control drivers read an expiry as exit `-1`; `coverage.mjs`' distribution
  drops undetermined rows silently); REC-166's lead (a second project publishing a finding another project's case pins
  moves its bytes — unmeasured).

## 5. THE CACHE, AND THE ORDER (SCHEDULER #13's; verify on `origin/main`)

LED-7 (SCHEDULER's own act) · M0-106 (DIST's own act, its witness at the next cut) · **M0-107 · REC-166 · REC-165 ·
M0-110** (§3) · REC-167 · UI-77. Next in the backlog: M0-114 (BLOCKED on the first cloud gate measurement), M0-111
(after M0-110), M0-116, M0-100, D-85. Bob's law (`CLAUDE.md` §2): product before process; no process row unless it cuts
gate time or unblocks product; batch landings. The tree-sharing rows (M0-110, then M0-111) head the plan.

## 6. TRAPS THIS SESSION PAID FOR

1. **`main` moved three times under one flip** (BOB, SCHEDULER, BOB): rebase onto a PINNED sha (`git rev-parse` it),
   re-check with `gates.mjs --since <the GREEN-recorded commit>`, push a branch first, then `HEAD:main` bare.
2. **A worker spawned by the Agent tool branched from the SPAWNING session's HEAD**, so the flip was pushed and HEAD
   equal to `origin/main` before the spawn. Whether the cloud's worker tool does the same is UNMEASURED.
3. **Disk on the Mac bounded the wave, not the budget of eight**: four worker worktrees at ~650 MB each took free space
   from 7.9 to 3.7 GiB. The permission layer refused `rm -rf` of even this session's OWN `node_modules`.
4. **A stand-down report is the only copy of a worker's measured design when it had nothing to commit** — push it to a
   branch the minute it arrives (this session's reports branch is the shape: a root commit, never merged).

## 7. THE STANDING LANES AND THE MACHINE

At this stand-down every lane in the old account was winding down on Bob's order: BOB #27, SCHEDULER #13, DIST #4 and
FLEET #3, each writing its own handoff; BOB #27 archives CONDUCT #13 (D-398). My self-wake crons are DELETED (CronList
empty). Line 1 of YOUR handoff names CONDUCT #15.

## 8. WHAT I DID NOT DO

I closed, archived and reordered no row; deployed nothing; touched neither `newgroup/` nor `release/`; created no `coord`
branch; integrated no worker branch.
