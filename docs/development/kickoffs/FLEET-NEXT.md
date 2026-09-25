# FLEET — resume here. Written 2026-09-24 by FLEET #4 (standing lane, cloud); the account switch of 03:00Z was CANCELLED at the quota reset

Bob, 2026-09-24 03:00Z (relayed by BOB #32): this account's weekly quota runs out ~07:00Z and the work continues on
Bob's other account. This file assumes a reader with NO memory. **Every fact is a POINTER, measured at the time given:
re-measure it.** FLEET #4's longer running log is this file's previous versions in `coord`'s history
(`git log origin/coord -- docs/development/kickoffs/FLEET-NEXT.md`); nothing below depends on reading it.

## Open in this order

1. `CLAUDE.md` IN FULL from `origin/main`, then `docs/development/kickoffs/FLEET.md` (the area's law; its 2026-09-21
   section holds the corrections), then this file, then the open rows of `QUEUE.md` **on `coord`**.
2. **State files live on the branch `coord`, not `main`** (M0-110). `main` holds a one-line pointer at each. Read with
   `node tools/coord.mjs read <path>`; write this file with
   `node tools/coord.mjs write --replace docs/development/kickoffs/FLEET-NEXT.md <file> -m "<what>"`. Run `coord.mjs`
   from a checkout of `origin/main`: a branch cut before the cutover lacks the tool. It prints its header on STDERR.
3. `node tools/owed.mjs FLEET`. It counts BLOCKED rows and ledger dispositions only, never a `queued` row in build order.

## Update, 2026-09-24T15:47Z: the switch is cancelled, and 0.79.0 is live and CONSISTENT

BOB #32 at 15:44Z: the weekly quota reset, development resumes on THIS account, and FLEET returns to standing, with no
timers. `main` @ `68fecb8d` carries release **0.79.0** directly (`release/RELEASE.json`; there is no `land/dist/release-0.79.0`
branch). Live: the three members and `biosmoke7` answer `0.79.0`. **The risk named below is discharged.** 0.79.0 ships the
dispatching plane (`AGENT_WORKER_UNBOUND` in `store.mjs`) TOGETHER WITH an agent-worker carrying both fixes (`seeded.target`,
`address: t.url`). Its bytes are **`e68d71fc…`**, rebuilt again after `e295b529` by later source changes. pdf-worker
**`0f00ff03…`** and ocr-worker **`76edde3e…`** moved too, legitimately: D-481 (`d80750bd`, `a7f03e04`) changed PDF line
breaking. Every `dist/` artifact equals its `release/` copy. Staleness 23 checked, 0 drift. `fleetbundles` reads 91 pass, 0 fail
(exit 0, unpiped). `owed.mjs FLEET` reads 0. The table below is the 03:10Z hand-over state, kept as the record.

**BOB is BOB #34, `session_015xYmWbudjCX7rFPF1bDJd3`, from 2026-09-24T22:01Z** (succeeding BOB #33). Reports and questions for Bob go there,
by one-shot trigger into that session.

## A standing duty: FLEET creates every lane successor (BOB #34, 2026-09-24T23:20Z; recorded in the BOB INBOX)

FLEET #4 (`session_01YB9VgJtjiXwQ5vtx4fLvRB`, origin `desktop_app`) is the only live lane with NO parent session. Every
other lane descends from a chain that has reached the platform's depth limit: workers at depth 8 cannot create
triggers, and each refresh adds a level. So a lane's successor is created BY FLEET, which puts it at depth 1. **BOB
decides WHEN and whether the handoff is current; FLEET makes the `create_session` call with the title, source,
model and prompt BOB gives, verbatim, then reports the new id to BOB by one-shot trigger** (or the exact error).
Before calling, check that the lane's `-NEXT.md` latest commit on `coord` is the one BOB names.
- 2026-09-24T23:22Z: **DIST #7** created, `session_01FQcUMZ2f34zhHzBkMEEdQ6` (succeeding DIST #6; DIST-NEXT @ `0f832c98`).
- 2026-09-24T23:37Z: **SCHEDULER #21** created, `session_01EW169eb7SVoxFrivnk6P1f` (succeeding SCHEDULER #20; SCHEDULER-NEXT @ `e2647f99`).
  SCHEDULER now creates its own WORKERS directly (depth 2); workers create no sessions (the BOB INBOX, 23:20Z and 23:35Z).
- 2026-09-25T01:43Z: **CONDUCT #21** created, `session_01Np8wnAdDnRwswmAokZzNoY` (succeeding CONDUCT #20; BOB named CONDUCT-NEXT
  @ `59daa98d`, which by then had two later appends, to `5d69a078`. It was an ancestor, so the file had only grown, and I told BOB). If the named
  commit is NOT an ancestor of the file's head, stop and ask BOB before creating.

**A successor FLEET must keep this property:** it should itself be created with no parent (by Bob, from the app), or
this duty moves. If FLEET #4 must refresh, tell BOB that the successor cannot come from any lane session.

## State at hand-over (2026-09-24 ~03:10Z, `main` @ `548eb2c5`, `coord` @ `99cb7fc5`)

| what | reading |
| --- | --- |
| owed | `owed.mjs FLEET`: 0 attributed, 0 residue |
| FLEET rows | **FL-11 and FL-12 are INTEGRATED** (built by a CONDUCT worker on `land/conduct/c17-batch7` @ `162e6c37`, flipped by SCHEDULER #17). **D-260 is INTEGRATED too.** Verified at the code on `main`: `state.target` seeded at run open (`agent-worker/src/index.mjs`, `seeded.target`), `submit` defaults a candidate's target to it, `capturerequest` sends `address: t.url`, and the plane now reads `env.AGENT_WORKER` (`store.mjs`, `AGENT_WORKER_UNBOUND`). Nothing of FLEET's is queued or running. |
| guard | `bio-plane/test/fleetbundles.test.mjs`: **91 pass, 0 fail**, exit 0 unpiped, on `548eb2c5` |
| staleness | 23 inputs checked, **0 drift**, 0 unreadable |
| committed bytes on `main` | agent-worker **`e295b529…`** (rebuilt by FL-11/FL-12), pdf-worker `b26dee19…`, ocr-worker `0d99f5d0…` |
| released bytes | newest release `land/dist/release-0.78.0` (no tags past v0.71.0; the git proxy refuses tags). Its `RELEASE.json`, and `main`'s, name agent-worker **`a7e5f590…`**: the OLD bytes. |
| live `/version` | all three members and `biosmoke7` answer `0.78.0` (03:10Z) |

**The one thing the next release must get right:** 0.78.0 carries NEITHER D-260's dispatch (no `AGENT_WORKER_UNBOUND`
in its `store.mjs`) NOR the FL-11/FL-12 agent-worker (no `address: t.url`), so what is live is consistent. The next
release carries BOTH. It must ship agent-worker `e295b529…` with the plane that dispatches to it. A plane that
dispatches to the old `a7e5f590` would have every suggestion refused `SUGGEST_OUTSIDE_RUN_CONTEXT` and every
internet look refused `CAPTURE_REQUEST_NOT_PUBLIC`. Check it when DIST cuts: compare the release's `fleet[].sha256` for
agent-worker against `e295b529`. **And DIST #6 found D-260's DIST half has no row** (the installer carrying the
organisation `ai` credential as `INSTANCE_AI_TOKEN`; construct `15.instance-ai-secret` ABSENT), routed to SCHEDULER
#18 at 03:02Z. Until it lands, an installed instance's wake says `NO_INSTANCE_AI_CREDENTIAL`. That is DIST's, not FLEET's.
No releases of any kind until Bob asks.

## Built by FLEET #4, all on `main`

- **Install-layout reproducibility** (BOB #29's diagnosis): `preserveSymlinks: true` in `optionsFor`
  (`bio-plane/scripts/fleet-bundle.mjs`), the one recipe for all members and the plane. A recipe assertion per member
  and one for the plane in the suite, and control arm 9 in `fleetbundles.control.mjs` (84/7 on both layouts; 87/4 on a real
  install). Landed at `41c7e0c3`. A gate test may depend only on the code, never on the machine.
- Diagnosed and routed FL-11 (`state.target`) and FL-12 (`url`→`address`); SCHEDULER #14 placed both, a CONDUCT worker built them.

## How FLEET lands work now

1. Branch from `origin/main`; before pushing, `git merge origin/main` (merge, never rebase or force) so the branch
   carries the current `gates.yml` (it fires GitHub only on `main`; GitHub reads `on:` from the pushed commit).
2. Gate: run ONLY the suites the row names, their negative controls, and `node tools/plancheck.mjs`. Never
   `gates.mjs` FULL (Bob, 2026-09-23: "cut back on gates"); CONDUCT's train union gate is the one FULL gate.
3. Push `land/fleet/<topic>`; CONDUCT's train (`tools/train.mjs`) lands it on `main`. Lanes never push `main`.
4. Every failed GitHub run emails Bob: a branch you pushed that reads red is diagnosed at once; a negative control is
   never pushed to `land/*` or `integrate/*`.
5. A symlinked `node_modules` shows as UNTRACKED (`.gitignore` matches a directory), so `gates.mjs` calls the tree
   unclean and records nothing. Gate with REAL installs (`npm ci`, or `cp -a` from a checkout whose locks match).

## Commands that answer the questions; none needs a secret

- **Staleness, no install needed:**
  ```
  node -e 'const fs=require("fs"),c=require("crypto"),p=require("path");let d=0,n=0;for(const m of ["agent-worker","pdf-worker","ocr-worker"]){const j=JSON.parse(fs.readFileSync(`${m}/dist/${m}.bundle.json`));for(const i of [...j.inputs,...(j.vendoredInputs||[]),...(j.assets||[])]){const f=p.join(m,i.path);let b;try{b=fs.readFileSync(f)}catch{console.log("UNREADABLE",f);continue}n++;if(c.createHash("sha256").update(b).digest("hex")!==i.sha256){d++;console.log("DRIFT",f)}}}console.log("checked",n,"drift",d)'
  ```
- **What a release shipped:** releases are branches, `land/dist/release-<v>`. Read their `release/RELEASE.json`
  `fleet[].sha256` (`git fetch origin refs/heads/land/dist/release-<v>:refs/remotes/x/r`).
- **Live:** `curl -s https://<member>.believeinoakland.workers.dev/version` for `agent-worker`, `pdf-worker`,
  `ocr-worker`, and `https://biosmoke7.believeinoakland.workers.dev/version`. If the network refuses, report
  UNDETERMINED, never "down". Both plane fields are the ROUTING ISOLATE's `env.VERSION`, never the DO's build.
- **Waking a peer** (cloud): a one-shot `create_trigger` with `persistent_session_id` = its session, `run_once_at` a
  minute or two out. `SendMessage` reaches only sessions on the same machine. **Only BOB keeps timers** (BOB #32): arm
  none unless BOB asks.

## Standing values

- Refresh past **75%** of `get_session`'s context figure (BOB #31, 2026-09-23: the environment auto-compacts near 79%).
  Read `CLAUDE.md` §4 on `main` for the current wording; on 2026-09-23 it still lagged the rulings.
- I10 (`fleet-bundle.mjs`'s cross-lane exports) is registered and STABLE. `optionsFor` is outside it. Read
  `docs/development/INTERFACES.md` §I10 before changing any export.

## Carried memory

- A background task's exit code is its WRAPPER's. Read the tool's own completion line (`N/N suites green · …`).
- In a ledger conflict, carry BOTH sides' hunks. Regenerate `docs/DECIDED.md`; never merge it.
- What a lane must know goes on its ROW or its `-NEXT.md`, not in a message nobody may read.

## What a successor must not get wrong

1. `op=bootstrap`'s version is the routing isolate's; no version field reports the DO's build.
2. Count importers by PARSING imports; a multi-line `import { … }` is invisible to a one-line grep.
3. A range of releases is a claim about each one. Check each, or name the ones checked.
4. When a suite's count moves, attribute it at a FIXED BASE (scratch worktree, with and without the change).
5. Never write an all-caps ruling marker (the words `decided.mjs` indexes) into a handoff file (D-367).
6. Never push for a lane whose push was refused.
7. The `CLAUDE.md` in a long session's context can be older than `origin/main`'s. Re-read it when a peer cites a rule.
8. A line read through `cut -c` is a truncated VIEW, not the line.
9. A row read `integrated` is a claim: verify the DEPENDENT at the code by name (FLEET #4 did, for FL-11/FL-12/D-260).
10. Never leave a stray file outside the tree: one `cp` to `/home/user/…` had to be found and removed.
