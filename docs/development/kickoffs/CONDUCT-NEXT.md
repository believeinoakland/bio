# CONDUCT-NEXT — the resume prompt for CONDUCT #6

> **WRITTEN BY CONDUCT #5, 2026-09-18, standing down at Bob's context-refresh direction (70% full, relayed by BOB #15).**
> Verify all of it yourself before believing this file. If anything disagrees, the tree is right.
>
> ```
> git fetch origin && git show origin/main:docs/development/QUEUE.md | grep -E '^### [A-Za-z0-9-]+ · running'
> node tools/plancheck.mjs                  # expect 0 fail
> node tools/status.mjs --check             # expect 0 drift
> cd bio-plane && npm run test:battery      # read the COMPLETION LINE (it now ends `· run <id>`), not the exit status
> ```
>
> **CORRECTION, READ BEFORE ACTING: DO NOT ARCHIVE ME WHILE MY TWO WORKERS RUN.** REC-143 (`agent-a70dee1231b11c76d`) and
> REC-140 (`agent-a761302b28f105764`) are SUBAGENTS OF THIS SESSION: archiving me stops them mid-item, and their reports
> arrive HERE, not to you. Each brief ends with `git push origin HEAD` verified by `ls-remote`. **So: wait until BOTH
> `worktree-agent-a70dee1231b11c76d` and `worktree-agent-a761302b28f105764` exist on the remote with a claim `released:`
> line (or `isRunning` reads false), integrate them FROM THEIR PUSHED BRANCHES, and only then archive me.** Until then,
> REC-143 is the P0, so check its branch on the remote first at every turn.
>
> **THEN THE FIRST ACT: ARCHIVE ME** (D-401). I am session `CONDUCT #5`, worktree `nifty-wiles-7d14c3`. Re-check
> D-398's three conditions **at the moment you act**: `isRunning` false, my worktree porcelain EMPTY, its tip an ANCESTOR of
> `origin/main`. **Then READ THE `locked` LINE of every agent worktree I spawned — the archive did NOT release them last time**
> (MEASUREMENTS, D-398 DATA POINT 4: CONDUCT #4's four locks survived its archive, naming a dead pid). A lock whose pid is
> not in `ps` is stale: unlock only after re-verifying CLEAN and ANCESTOR, then `git worktree remove`. My Remote Control:
> left alone. My self-wake cron (`46c26cc2`) is deleted at stand-down; **create your OWN** (`CronCreate` `7,27,47 * * * *`,
> recurring, the prompt in `kickoffs/CONDUCT.md`) and record its id.

**Written 2026-09-18 by CONDUCT #5.** Read `CLAUDE.md`, then `kickoffs/CONDUCT.md`, then `kickoffs/SCHEDULER.md`, then this.

---

## 0. THE LANE CHANGED SHAPE THIS SESSION — READ `kickoffs/CONDUCT.md` step 0 AND `kickoffs/SCHEDULER.md`

**SCHEDULER is live** (standing lane). It owns `QUEUE.md`'s ORDER (THE BUILD ORDER table, one `order:` line per row), the BOB
INBOX drain, **done + archive + replenish in one commit**, the backlog, and LED-6's migration. **You own ONE word per row —
a cached task's `queued` → `running`, pushed BEFORE its spawn — plus gating, spawning, integrating and verifying.** When you
integrate, `SendMessage` SCHEDULER the task id and the integration merge sha on `origin/main`; it closes the row. Do NOT
flip a row to `done` or archive it yourself (I did, before SCHEDULER existed — those are all archived already).

**DIST is live** (standing) and now holds a standing deploy permission (CLAUDE.md §4, BOB #15's push). **Step 2b: when an
integration closes a security, disclosure or authority defect, say so in the merge commit and `SendMessage` DIST** with the
merge sha. DIST cuts on disclosure closings and batches the rest; it asked for, and got, **separate pushes** when a feature
would ride a security cut to a live surface. **FLEET is live** (standing). DIST and FLEET are never archived for idleness.

## 1. THE MEASURED STATE (`origin/main` `cf8992e7`, verify it)

| gate | figure |
| --- | --- |
| last full gate | **252/252 suites green · 15404 assertions** (the UI-65 + REC-136 landing), `--strict` exit 0, UI harness exit 0 |
| interfaces | I1 1.5.0 · I2 2.6.0 · **I3 37.0.0** · I5 1.22.0 — this session resolved IC-139..IC-156 (I3 27.0.0 → 37.0.0) |
| construct-status | 85 claims, 0 drift |
| plancheck | 0 fail, 8 warn (pipeline P3–P5 until LED-6; reading budgets; stranded work) |
| release/ | **0.58.0** — DIST WITHDREW 0.59.0–0.63.0 from `main`'s `release/` because **each bricks an existing store** (REC-143) |
| disk | ~5 GiB free |

## 2. WHAT IS LIVE — INTEGRATE THESE (they are yours now)

1. **REC-143 — THE P0. Every release since 0.58.0 BRICKS AN EXISTING STORE** (DIST, measured live on biosmoke7): `#migrate`
   runs the schema's `inquiry_basis_content` index before the ALTER that adds `content_id`. Worker live in
   `agent-a70dee1231b11c76d`. Brief: reproduce on a 0.58.0-shaped store read from git (`db7589b8`/`v0.58.0`), sweep every
   schema statement against the ALTER list, fix with the `chain_kind` pattern, a regression suite booting old shapes, the
   negative control = this exact bug. **Integrate it FIRST, message DIST (it cuts 0.64.0 and re-deploys), report to
   SCHEDULER.** Rowed by me AHEAD of SCHEDULER's order with `order: 0` — SCHEDULER re-numbers.
2. **REC-140 — D-429**: `op=ratify` refuses project bundles and takes caseratify's owner-signer and joined-deliverer rules.
   Worker live in `agent-a761302b28f105764` (it holds 5 untracked files mid-run — do not prune). Told mid-run to use
   `adoptable-reading.mjs` for any no-project conclude (REC-136 is on main). An authority closing → DIST.
3. **UI-65's row still reads `running` on `main`** — it LANDED with REC-136 at `c7f2df67` (pushed `67c6cc09`); I reported
   it to SCHEDULER, whose act closes it. If it still reads running, re-send the report; do not flip it yourself.

## 3. THE RECEIPTS AGAINST MYSELF — these recur, and each cost real time

- **zsh DOES NOT WORD-SPLIT `$L`.** `kill -9 $L` with a PID list killed NOTHING and my check printed the list without testing
  liveness — a stray battery ran beside a gate for minutes. **Use `${=L}`, and verify each pid gone.** CONDUCT #4 had written
  this same slip down; I made it anyway. A `TaskStop` on a background gate does NOT kill its battery either — reap by tree.
- **A chained `merge; git add -A; commit` COMMITS CONFLICT MARKERS** when the merge fails. The pre-push hook caught it
  (`UNRESOLVED MERGE MARKERS`), I amended the unpushed commit. Run the merge as its own command and read its result.
- **`git rebase` over a merge FLATTENS it** (it replayed a worker's commits one by one). Integrate by MERGING `origin/main`,
  never rebasing an integration branch.
- **TWO RELAYED DISCLOSURE LISTS WERE INCOMPLETE** (REC-103, then SK-7 missing). I built them from the handoff and my own
  landings instead of `git log`. DIST now rebuilds from the log; do the same.
- **Two garbled shas in messages** ("7c3c9e8d-era", "1e0..."). Read the sha off `git log --merges origin/main` before
  typing it; correct in the same minute if you slip.
- **A fix verified at the change site was not verified**: REC-137's new suite concluded without a version and broke the
  moment REC-136 landed under it; `case-authority.test` was repaired in the landing merge with REC-136's helper. **After
  every merge, run the suites where the two items MEET**, not only the item's own.

## 4. WHAT HELD, AND IS WORTH KEEPING

- **Holding a merge off `main` when a peer ruling or a live surface says so.** REC-128 (a REC-130 conflict: the founder lost
  standing), REC-131 (two more BOB rulings folded into ONE major), REC-136 (DIST: held until UI-65) — each parked on a
  REMOTE branch, never lost, and landed whole. **Park on the remote, then `checkout -B` to `origin/main`.**
- **Checking a new act against a parallel item's rule at the code** (REC-136's withdraw act against REC-138's
  visibility-before-role, which it did not exist to meet) — read, not assumed.
- **Re-reading every IC's base AT LANDING**: IC-139 (27→29.2), IC-153 (35→37) were proposed or resolved on stale bases.
- **Worker-ended-with-background-children locks, measured**: REC-124's worker ended with background work → its worktree
  stayed LOCKED; every other finished agent released its lock. Consistent with D-398's registered hypothesis; not a test.

## 5. OPEN WITH BOB / BOB #15

- **Bob's**: DEC-63's run verdict leaks one bit (refused over a question cited only by hidden projects, permitted over an
  uncited one). BOB #15 recommended a single verdict; **keep as built until Bob rules; do not row**.
- **Bob's**: §7.1 instance-wide project-name uniqueness against §7.9 (`NAME_TAKEN` reveals the typed name exists).
- **With SCHEDULER to row**: FLEET's scratch-purge findings (purge does not clear scratch members; VF-4 arm 2a leaves a
  proposed member; `vf4-live-scratch.mjs` arm 4b-ii asserts closed D-323); `ui-65-conclude-surface` (superseded branch).
- **DIST raised to BOB**: the installer's `/update` reads `main`'s `release/` directly, so a signed release on `main` is
  DISTRIBUTED the moment it is pushed — not when Bob approves a deploy.
