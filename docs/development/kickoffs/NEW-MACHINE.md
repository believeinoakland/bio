# Standing this project up on a new machine, under a new account

Written 2026-09-15 by session BOB #11 on the Mac Mini, at Bob's direction, as its last act before
stopping on token budget. **Its audience is the FIRST BOB SESSION on the new machine**, and Bob
hands it over by pasting §7's block. Everything here was measured on the outgoing machine rather
than recalled; where a figure could drift, the command that re-measures it is given instead.

**HOW BOB WORKS, AND IT IS NOT A PREFERENCE — IT IS THE OPERATING MODEL.** Bob enters no shell
commands, edits no files, and applies no diffs. **If something must be done on the machine, the
session does it**; if it must be done repeatedly, the session scripts it; if it cannot be done
from where the session is, the session says so plainly and names the SINGLE smallest act only he
can take — a click, a clipboard copy, a decision — never a sequence and never a command dressed
up as a suggestion. This governs every instruction below: where a command appears, it is for the
SESSION to run, never for Bob to type.

**Read in this order:** this file, then `CLAUDE.md`, then `docs/development/kickoffs/BOB.md`, then
`docs/development/kickoffs/BOB-NEXT.md` — the outgoing session's handoff, whose §1 is the one
piece of design work owed.

---

## 1. What this project is, in the space a new session needs

**CivicOS exists to answer questions, make a case, tell a story, and take action to affect a living
civic system.** A group — as small as one person — installs its own sovereign instance into its own
Cloudflare account and captures what a public body published, so it can prove later that the record
says what the group claims. The whole product is the TRUSTWORTHINESS OF THE RECORD, which is why
nearly every rule in `CLAUDE.md` defends against the record claiming more than it can support.

The runtime is a Cloudflare Worker (`bio-plane`) fronting a Durable Object with SQLite, with
captured bytes in R2, three fleet members beside it (`pdf-worker`, `ocr-worker`, `agent-worker`),
the member surfaces (`civicos-ui`), and an installer (`newgroup`) that puts an instance into a
group's own account. `docs/architecture/BIO_System_Design.md` is the level-0 map and places every
construct; read it before any construct's own document.

## 2. How the work is organised, because the shape is unusual

**Lanes, not branches.** Long-lived sessions hold ROLES:

- **BOB** — requirements, UX and architecture WITH Bob. Writes designs and decompositions; does not
  write area code and does not spawn workers. **It is the LEAD**: activation, sequencing, routing
  and spawning are its calls, and it never blocks on Bob for them.
- **CONDUCT** — the integrator. Sole writer of `QUEUE.md` below the inbox. Gates each item, spawns
  workers, merges their branches, and publishes. **Every figure it publishes comes from its own full
  gate on the MERGED tree**, never from a worker's report.
- **Areas** (RECORD, CAPTURE, FRAMEWORK, UI, SKILL, DIST, FLEET, CONTENT-PDF, CONTENT-OFFICE) — each
  owns paths and an interface; sessions or workers claim before editing.

**The repository is the channel.** Sessions do not share a working tree, so a change reaches nobody
until it is committed and pushed. Handoffs, decisions, debt, measurements and the queue are all
files. A cross-session message is a courtesy; the file is the fact.

**One session per checkout** (DEC-3), **and every session Bob might need to reach is started from a
chip he clicks, never headless** — the app hides programmatically created sessions, so a headless
one cannot be seen or interrupted by him (LIVENESS rule 6, `ORCHESTRATION.md`).

## 3. WHICH ACCOUNT DEVELOPS — the operator decides, and there is no lock

**RULED by Bob, 2026-09-16: one account develops this repository at a time, enforced by him rather
than by an instrument.** He stands development down in one account — the BOB session retires itself
and every lane and worker under it — and only once that account confirms everything is stopped does
he open the other account and have it create its BOB session and lanes.

**What that asks of you:** do not develop under an account you were not told to develop under, and
when you are told to stand down, confirm that every lane and worker under you is actually stopped
before reporting that it is. He acts on your confirmation, so a confirmation you have not verified is
worse than none.

**There was a lock here and it was REMOVED on purpose — do not rebuild it.** `ESTATE-HOLD.md`,
`tools/estatehold.mjs`, its suite and the `plancheck` arm are gone. It keyed on the hostname, then
the clone, then an environment variable that is not present on a Mac — and so fell through to a
per-clone id and refused an account its own estate, naming the machine it was refusing as "another
machine". Three implementations, three wrong units, and no second account ever touched this
repository in that whole period. `CLAUDE.md` carries the full record and the standing instruction not
to re-derive it.

## 4. Making the local repo

**Prerequisites**, measured on the outgoing machine — match the majors, not the patches:
`git`, `node v26.5.0`, `npm 11.17.0`. On macOS, `xcode-select --install` if `git` is absent.

**The layout matters and is not the obvious one.** A WRAPPER directory holds the clone and a
sibling directory of worktrees, because the effective Claude settings live in the wrapper:

    ~/ClaudeCodeBIO/              <- the wrapper; .claude/settings.json lives HERE
      bio/                        <- the clone (git remote origin)
      bio-worktrees/              <- one worktree per long-lived lane

    mkdir -p ~/ClaudeCodeBIO/bio-worktrees && cd ~/ClaudeCodeBIO
    git clone https://github.com/believeinoakland/bio.git bio
    cd bio && git log --oneline -1          # confirm you have main's tip

**Credentials.** `.env` lives in `bio/` and is gitignored; `.worktreeinclude` copies it into every
worktree at creation, which is why a worktree does not start with missing-credential failures that
look like permission bugs. **The new machine has no `.env` and must be given one.** These keys are
what the outgoing machine held (names only — the file is never printed, echoed or pasted into a
conversation):

    CF_TOKEN  CF_ACCT  CLOUDFLARE_API_TOKEN  CLOUDFLARE_ACCOUNT_ID  GITHUB_TOKEN
    BIO_INSTANCE  BIO_MEMBER_TOKEN  BIO_ADMIN_TOKEN  BIO_RELEASE_SEED  BIO_RATIFY_SEED

**How a secret gets onto the machine, since Bob does not type tokens into a conversation:** he
copies the value to the clipboard and the session reads it with `pbpaste`, appending one line at a
time and never echoing it back:

    printf 'GITHUB_TOKEN=%s\n' "$(pbpaste)" >> .env

**Confirm a credential by USING it, never by printing it** — `npx wrangler whoami` reporting
account `20b533579290b9b93168345edd3b7f72` is proof; printing the token proves nothing and puts it
somewhere it was not. **If any wrangler command reports a different account, stop and say so**: the
machine may be logged in to an unrelated account, and a deploy would SUCCEED into the wrong one.

**Install the three packages that carry dependencies** — `agent-worker` carries none:

    (cd bio-plane && npm ci) && (cd ../pdf-worker && npm ci) && (cd ../ocr-worker && npm ci)

**Then verify the install rather than assuming it**, because under disk pressure `npm ci` symlinks
instead of installing and the contaminated baseline looks exactly like a broken tree:

    df -h .                                   # want several GiB free, not megabytes
    for d in bio-plane pdf-worker ocr-worker; do [ -L "$d/node_modules" ] && echo "$d SYMLINKED"; done

**Verify the checkout before trusting any baseline:**

    node tools/plancheck.mjs                  # want: 0 fail, 0 warn
    node tools/gates.mjs                      # the full battery; ~5 min

**Read the POSITIVE artifact, never the absence of an error.** `plancheck` must print its notes —
`design corpus: N governed document(s), 0 front-matter failure(s)`, the id-allocation and
attribution notes — because a predicate that cannot LOAD degrades to a warning and still reads
`0 fail`. And a full gate is a pass only if it ends with `N/N suites green · M assertions passing`;
a wrapper command reports its own status, not the battery's.

## 5. The worktrees

The lead works in its own worktree, never in the main checkout, which CONDUCT holds:

    cd ~/ClaudeCodeBIO/bio
    git worktree add ../bio-worktrees/BOB -b bob-machine2 origin/main

Create others only as lanes start (`FLEET`, and CONDUCT keeps `bio/` itself). Branch names are
free; nothing depends on them. **Worker worktrees are created by CONDUCT's tooling, not by hand.**

## 6. Starting the lanes, in order — CURRENT as of 2026-09-19 (BOB #16; the 2026-09-15 text is in git history)

1. **BOB first** — §7's block. It confirms the old account is STOPPED, recreates the machine-local machinery, and reads
   `BOB-NEXT.md`.
2. **SCHEDULER, then CONDUCT, then DIST, then FLEET** — the five STANDING lanes (`ORCHESTRATION.md` "Roles"), each started
   by a chip BOB files and Bob clicks, each gated on its own `-NEXT.md` line 1 being on `origin/main`. SCHEDULER first: it
   owns the order of the plan, and CONDUCT fills slots from its cache.
3. **Workers are CONDUCT's**, one per cached task, worktree-isolated (`kickoffs/WORKER.md`).
4. **What keeps them running dies with a session and is recreated per account:** each standing lane's own self-wake
   (`CronCreate`, with the ONE-SHOT 5-day renewal, `CLAUDE.md` §4), and the **CONDUCT heartbeat** scheduled task — its
   prompt is saved verbatim at `docs/archive/conduct-heartbeat-SKILL-2026-09-19.md` (cron `7,27,47 * * * *`, `auto`
   mode; it judges and reports, never messages or archives). The 2026-09-15 "three watches" are retired.

## 6a. THE BOOTSTRAP BLOCK — the FIRST thing pasted on a bare machine

**§7's block assumes the repository exists. On a machine that has never held it, nothing does the
cloning, so this block comes first** — pasted into a session opened in Bob's home folder, since the
project directory does not exist yet. It sets the machine up and STOPS before any development.

```
Kickoff: BOOTSTRAP this project onto a NEW MACHINE under a new Claude account. Bob does not enter
shell commands and does not edit files — you run everything, and when you need a secret you ask him
to copy it to the clipboard and you read it with pbpaste, one at a time, never echoing a value.

BUILD THE LAYOUT, which is a wrapper holding the clone beside a worktrees directory, because the
effective Claude settings live in the wrapper rather than in the repo:
  ~/ClaudeCodeBIO/bio            the clone
  ~/ClaudeCodeBIO/bio-worktrees  one worktree per lane

Clone https://github.com/believeinoakland/bio.git into ~/ClaudeCodeBIO/bio. If it asks for
credentials, ask Bob for the GitHub token first and use it; never print it.

THEN READ, before anything else: docs/development/kickoffs/NEW-MACHINE.md in full. It was written
for you. Follow §4 exactly — the .env keys, the pbpaste flow, npm ci in bio-plane, pdf-worker AND
ocr-worker, then the checks that prove the install really happened rather than symlinked, then
plancheck and the full gate. Then do §9: write the account's memory seed and the permission
settings, so this machine stops asking Bob for things the last one had settled.

VERIFY BY THE POSITIVE ARTIFACT, never by the absence of an error: plancheck must print its notes
(design-corpus, id-allocation, attribution), and a full gate is a pass only if it ends with
"N/N suites green · M assertions passing" — a wrapper reports its own status, not the battery's.

DO NOT DEVELOP, DO NOT SPAWN, DO NOT PUSH. Which account develops is Bob's call and there is no
lock to consult — STOP HERE and let him say whether this machine is the one working.

Report to Bob in one short message: what you cloned, which credentials are in place and which are
missing, the plancheck and gate results, and whether the memory seed and settings were written.
```

## 7. THE PASTE BLOCK — hand this to the first BOB session in the new account

The CURRENT block is the one `BOB-NEXT.md` §0 names; this section keeps its shape. BOB #16 gave Bob the block for the
2026-09-19 switch in its closing report, and it reads: open the session in the project directory, then the paste block
below, which assumes the repository exists (on a bare machine, §6a's bootstrap comes first).

```
Kickoff: session BOB #17 for BIO / CivicOS — the architecture lane, in the Claude Code account that now develops this
repository. The previous account stood down on Bob's order on 2026-09-19 at 91% weekly usage; every lane saved its
handoff and stopped. You are the LEAD.

BEFORE ANYTHING ELSE: `git fetch origin`, and confirm your handoff: `git show origin/main:docs/development/kickoffs/BOB-NEXT.md | head -1`
must begin `# BOB — resume here. Written 2026-09-19 by BOB #16 for the NEXT BOB`. If it does not, STOP and say so. Run
`hostname` and say which machine you are on.

READ, IN FULL, IN THIS ORDER: CLAUDE.md, docs/development/kickoffs/BOB.md, docs/architecture/BIO_System_Design.md,
docs/development/kickoffs/NEW-MACHINE.md, then BOB-NEXT.md from origin/main. Trust origin/main over any document,
including this prompt. Look things up rather than recall them: `node tools/status.mjs <topic>`, `node tools/decided.mjs
"<subject>"`, `node tools/owed.mjs BOB`.

YOUR FIRST ACTS are BOB-NEXT §0, in order: (1) confirm the OLD account is stopped — two accounts developing at once is the
one thing Bob forbade; (2) verify this machine (npm ci in bio-plane/, pdf-worker/ and ocr-worker/, none a symlink, df -h,
.env present — ask Bob to paste any missing secret via the clipboard, never print one) and that the effective
.claude/settings.json has NO `ask` rule on a deploy command (NEW-MACHINE.md §9.1); (3) recreate the CONDUCT heartbeat
scheduled task from docs/archive/conduct-heartbeat-SKILL-2026-09-19.md, and arm your own self-wake with its renewal;
(4) measure this account's weekly usage (get_usage) and your context; (5) plancheck, status.mjs --check, owed.mjs BOB;
(6) file the chips for SCHEDULER, then CONDUCT, then DIST, then FLEET, each gated on its -NEXT.md line 1, and tell Bob
they are waiting. Then work BOB-NEXT §3 in order.

Bring Bob only what is genuinely his, in plain words he can act on, once each; decide everything that follows from
existing rulings, after reading the ruling itself.
```

## 9. Seeding the new account — memory and settings

**A new account starts with none of what the last one had learned about Bob or this project, and the
loss is not evenly distributed.** Doctrine is safe: it is in `CLAUDE.md` and the design corpus, which
the clone brings. What does NOT travel is the account's MEMORY and its PERMISSION SETTINGS, both of
which live on the machine. Write both in the bootstrap session, before the first real turn.

### 9.1 The permission settings — CURRENT as of 2026-09-19 (BOB #16)

**The committed `.claude/settings.json` in the repository is the authority** — it travels with the clone: default mode
`bypassPermissions`, the eight `deny` rules (force-push ×3, `reset --hard`, `clean -fdx`, `rm -rf`, `sudo`, `chmod 777`),
and `ask` on writing `.env` ONLY. **Do NOT add `ask` rules for `deploy.mjs` or `wrangler deploy`:** an `ask` rule
overrides bypass, and the three that §9.1 used to prescribe held 0.64.0's plane deploy for ~2 hours on 2026-09-19 after Bob
had ruled that DIST deploys by standing permission (`CLAUDE.md` §4); Bob had them removed (`7e9ef2f9`). If the new
machine uses a wrapper directory whose own `.claude/settings.json` governs, make it match the committed file. A
per-machine `settings.local.json` of allow entries is harmless and need not be copied.

### 9.2 The memory seed

Write these into the new account's project memory, one file each with a one-line pointer in
`MEMORY.md`. **They are working-style and project facts only.** Anything personal — other work Bob
runs under the same account — is deliberately NOT here and must come from him, not from a shared
repository.

| memory | what it says |
| --- | --- |
| **how Bob works** | He enters no shell commands, edits no files, applies no diffs. Do it, script it, or name the one smallest act only he can take. Never return a settled question; when he hands a determination back, decide it, implement it, record it, and tell him what you chose. |
| **the working directory is the wrapper** | Sessions run from `~/ClaudeCodeBIO`; the repo is `bio/`; the effective settings are the wrapper's `.claude/settings.json`. A worktree is a checkout of a COMMIT. |
| **the persona** | GitHub `believeinoakland`, Cloudflare account `20b533579290b9b93168345edd3b7f72`. If a wrangler command ever reports a different account, stop and say so — a deploy would SUCCEED into the wrong one. |
| **decide tactical work, don't ask** | Activation order, sequencing, mechanism, scoping and which item runs next are the session's, ruled by Bob 2026-07-31. Blocking on him is a productivity failure dressed as diligence. |
| **publish or it never happened** | Sessions do not share a tree: commit, push, and verify from the REMOTE. Run `node tools/plancheck.mjs` before any handoff. |
| **notation is settled** | UML `classDiagram` for structure, `stateDiagram-v2` for lifecycle, edges labelled with the act. Never mix, never hand-roll arrow semantics; two drafts were rejected for it. |
| **the in-app browser cannot reach external origins** | It blocks pre-network on origin approval. Verify published artifacts by `WebFetch` and appearance through the local preview harness. |
| **headless sessions are invisible to Bob** | The app hides programmatically created sessions, so he can neither see nor interrupt one. Every session he might need to reach is spawned through a chip he clicks (LIVENESS rule 6). |
| **cross-session messages arrive stale** | A peer's report describes the tree at the moment it was written. Verify its premises from `origin/main` before acting on it. |
| **quote heredocs with backticks** | An unquoted `<<EOF` lets the shell eat every backticked span in an edit script. Use `<<'EOF'`, and pass values through the environment. |
| **the design corpus front-matter rule** | Every design document carries current Status / Place / Incomplete / Contents; `corpuscheck` enforces it inside `plancheck`; `BIO_System_Design.md` is the level-0 map. |

**Added 2026-09-19 by BOB #16 — the old account's memory held two lessons outside this repository:** (1) *check
`hostname` before any side-effecting step of a kickoff that names a machine* — the estate spans two machines (MiniM4 and
Sparky-Air), and an evacuation kickoff for one was once opened on the other; (2) *carry upstream's hunks when rebasing
`QUEUE.md`, never take one side whole* — now also in `kickoffs/SCHEDULER.md`. And the durable lessons of 2026-09-19 are in
each kickoff (`BOB.md` rule 11, `CONDUCT.md`, `SCHEDULER.md`, `DIST.md`, `FLEET.md`), so they need no seed.

**One more, and it is the newest:** *one account develops at a time, and Bob enforces it by hand —
the lock that used to do it was removed on 2026-09-16 and must not be rebuilt. `CLAUDE.md` carries
why.*

### 9.3 What Bob still has to supply himself

Two things this repository cannot carry and should not: **the credential VALUES** (§4), and **any
context about work he does outside this project**. If he ran other work under the old account that
shaped how a session should treat him, only he can restate it — a new account is a genuinely fresh
reader, and the honest move is to ask him once rather than to infer it.

## 8. What will bite this machine first

- **A baseline measured before `npm ci` in all three packages**, which reads green with a whole
  member silently skipped. `CLAUDE.md`'s traps section carries this and its two other faces.
- **A working directory that reverts between turns** — a `cd` inside a subshell does not move what
  the TOOLS see, so a spawn can fail while a hundred shell commands succeeded.
- **Treating `0 fail` as verification.** Read what the check says it CHECKED.
- **Believing a ledger row.** A debt row is a claim about the day it was written; grep the code the
  row names before resting a design on it (`kickoffs/BOB.md` rule 5).
- **Two machines developing at once.** §3. It is the only failure here that nothing else catches.
