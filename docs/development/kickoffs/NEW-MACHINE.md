# Standing this project up on a new machine, under a new account, or in the cloud

Written 2026-09-15 by session BOB #11 on the Mac Mini, at Bob's direction, as its last act before
stopping on token budget. **Its audience is the FIRST BOB SESSION on the new machine**, and Bob
hands it over by pasting §7's block. Everything here was measured on the outgoing machine rather
than recalled; where a figure could drift, the command that re-measures it is given instead.
**Brought current 2026-09-22 by BOB #27 for Bob's move to cloud Claude Code under his second
account: §0 first.**

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

## 0. THE MOVE OF 2026-09-22 — cloud Claude Code, under Bob's second Max 20x account

Bob, 2026-09-22, to BOB #27: *"there'll be a transition at some point today that will involve both to cloud-based CC and
to using the second Max 20X account of mine"* — and the productivity changes are to be fully recorded first (their design
and what the move changes in it: `docs/development/TREE-SHARING.md` §4–§5). It is a new ACCOUNT, so §3 governs: this
account stands down first. And it is a new KIND of environment: a cloud session has its own machine and a fresh clone,
and nothing of this Mac. **Every claim about the cloud here is the vendor's tool description (read 2026-09-22) or
UNMEASURED, and says which.**

**Before the stand-down, in THIS account — each lane for itself, BOB confirming:**
1. **Every commit that exists only on this Mac is pushed**, since a cloud session starts from what `origin` holds.
   `plancheck`'s NEVER PUSHED arm names them. A tree carrying a RED record cannot be pushed on any ref; push its patch
   (SCHEDULER #12 did, as `origin/scheduler12/row-drafts`).
2. **Each `<LANE>-NEXT.md` is on `origin/main`, written for a reader with NO memory** and possibly none of the tools below.
3. **At Bob's order:** each lane deletes its own crons, stops its workers and says so; BOB disables the heartbeat task,
   archives what has finished, confirms every lane stopped (`CLAUDE.md` §4), and gives Bob §7's block.

**What a cloud session starts WITHOUT.** Each is the premise of a rule; until measured there, that rule is SUSPENDED and
the handoff says so — never silently skipped:
- **The desktop's session tools** — `list_sessions`, `get_usage` of another session, `archive_session`, `ListAgents`,
  the spawn chip (UNMEASURED there). D-398's archive of a predecessor, `occupancy.mjs`, `retirable.mjs`, BOB's opening
  sweep and the 70% measure of OTHER lanes rest on them.
- **Replies:** it receives a cross-session message and cannot send one (the vendor's `SendMessage` description). The
  repository is the channel (`TREE-SHARING.md` §4).
- **The heartbeat and the self-wakes.** The heartbeat is this Mac's scheduled task, its definition verbatim at
  `docs/archive/conduct-heartbeat-SKILL-2026-09-19.md` (body unchanged, compared 2026-09-22); the cloud's scheduled
  "routines" (the vendor's term) and `CronCreate` in a cloud session are UNMEASURED as replacements.
- **The account's memory** — carried whole into `docs/archive/account-memory-2026-09-22.md` (§9.2).
- **`.env`** (§4's key names). Only DIST's code reads a secret (`git grep -w` outside the tests, 2026-09-22: the deploy
  scripts read the Cloudflare keys, `release-assemble` the release seed), and DIST also needs stock `ssh-keygen`.
  **RULED BY BOB 2026-09-22, to BOB #27 (option C of three): all ten keys go into the ONE cloud environment every
  session uses** — *"C - I see no practical downside"* — after the risk was put to him once (the release seed signs what
  every installed copy accepts). He places the values himself; a value is never typed into a conversation or the
  repository, and a session confirms a key by USING it (`wrangler whoami` reports the pinned account), never by printing it.
- **The id ledger:** `mintid` allocates by exclusive create in the old clone's `.git`; a fresh clone takes its floor from
  the corpus on `main` alone, so an id minted on the Mac and carried only on an unmerged branch (IC-175, on REC-166's
  branch) can be minted twice. Reuse it when the branch resumes; `node tools/mintid.mjs --list` before minting.
- **The push guard,** until `node tools/plancheck.mjs` has run once (it installs the untracked `.git/hooks/pre-push`);
  **every gate record** (per clone, D-293); the three packages' `node_modules` (§4); node's major, 26, pinned by nothing.

**BOB'S OWN ACTS, in plain words (given to him by BOB #27 at the stand-down, ~17:10Z):** sign in to claude.ai with the
second Max 20x account; open Claude Code on the web and connect GitHub with access to `believeinoakland/bio`; set up the
cloud environment for that repository with internet access and the ten keys as environment variables (copied from the old
Mac's `.env` himself — a session never handles a value); start a cloud session on the repository and paste §7's block;
then paste each lane prompt BOB #28 writes him, one new cloud session each; and archive the old account's BOB #27.

**The first BOB there measures each of these before resting a rule on it**, records the answers in this section with the
date, corrects `CLAUDE.md` §4, §6 and §8 where they assume the Mac, and stands the lanes up in §6's order. Where there is
no chip, BOB writes each lane's paste block into its own handoff and Bob starts the session from it.

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
`git`, `node v26` (v26.0.0 on Sparky-Air, 2026-09-22), `npm 11`. On macOS, `xcode-select --install` if `git` is absent.

**The layout is FLAT** (Sparky-Air, verified 2026-09-19; the Mac Mini's wrapper layout of 2026-09-15 is retired): the
clone is the project directory, worktrees live under its `.claude/worktrees/`, and the committed `.claude/settings.json`
IS the effective settings file — so a stale checkout means stale permissions. A cloud session's clone is its own.

    git clone https://github.com/believeinoakland/bio.git ~/Downloads/ClaudeCodeBIO
    git -C ~/Downloads/ClaudeCodeBIO log --oneline -1     # confirm you have main's tip

**Credentials.** `.env` lives in the clone's root and is gitignored; `.worktreeinclude` copies it into every
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

The lead works in its own worktree, never in the main checkout (a cloud session is its own checkout):

    git -C ~/Downloads/ClaudeCodeBIO worktree add .claude/worktrees/bob -b bob/<n> origin/main

Create others only as lanes start. Branch names are free; nothing depends on them. **Worker worktrees are created by
CONDUCT's tooling, not by hand.**

## 6. Starting the lanes, in order — CURRENT as of 2026-09-19 (BOB #16; the 2026-09-15 text is in git history)

1. **BOB first** — §7's block. It confirms the old account is STOPPED, recreates the machine-local machinery, and reads
   `BOB-NEXT.md`.
2. **SCHEDULER, then CONDUCT, then DIST, then FLEET** — the five STANDING lanes (`ORCHESTRATION.md` "Roles"), each started
   by a chip BOB files and Bob clicks, each gated on its own `-NEXT.md` line 1 being on `origin/main` and on
   `node tools/occupancy.mjs` ADMITTING it (`kickoffs/BOB.md` rule 1). SCHEDULER first: it
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

THE LAYOUT IS FLAT: clone https://github.com/believeinoakland/bio.git into ~/Downloads/ClaudeCodeBIO;
worktrees go under its .claude/worktrees/, and its committed .claude/settings.json is the effective
one. If the clone asks for credentials, ask Bob for the GitHub token first and use it; never print it.

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

The CURRENT block is the one `BOB-NEXT.md` §0 names. For the move of 2026-09-22 it is below, exactly as BOB #27 gave it to
Bob at the stand-down: paste it into a new cloud session on the repository under the second account (on a bare machine,
§6a's bootstrap comes first). BOB #16's block for the 2026-09-19 switch is in git history.

```
Kickoff: session BOB #28 for BIO / CivicOS — the architecture lane and the LEAD, and the FIRST session of development under Bob's second Max 20x account, in cloud Claude Code. The previous account stood down on Bob's order on 2026-09-22 (about 16:45Z to 17:10Z): BOB #27 stopped and archived every lane, and all work is on origin. Keep this session's title EXACTLY "BOB #28".

GATE — run first; if it fails, STOP and say so:
  git fetch origin
  git show origin/main:docs/development/kickoffs/BOB-NEXT.md | head -1
It MUST read exactly: # BOB — resume here. Written 2026-09-22 by BOB #27 for BOB #28, the first BOB under Bob's second account in cloud Claude Code.

READ, each file WHOLE, from origin/main, in this order: docs/development/kickoffs/NEW-MACHINE.md (§0 FIRST), CLAUDE.md, docs/development/kickoffs/BOB.md, docs/architecture/BIO_System_Design.md, then docs/development/kickoffs/BOB-NEXT.md. Trust origin/main over any document, this prompt included. Look things up, never recall them: node tools/status.mjs <topic>, node tools/decided.mjs "<subject>", node tools/owed.mjs BOB, node tools/ledger.mjs find <ID>. You have no memory of earlier sessions; the old account's memory is carried whole in docs/archive/account-memory-2026-09-22.md.

FIRST ACTS, in order (NEW-MACHINE §0 and BOB-NEXT §0):
1. Confirm the old account is stopped: origin/main has not moved since the stand-down except by your own lanes.
2. Run `node tools/plancheck.mjs` BEFORE ANY PUSH: it installs the push guard a fresh clone lacks.
3. Measure this environment and record each answer in NEW-MACHINE §0 with the date: which session tools exist (listing sessions, reading another session's context, archiving, messaging, scheduling), `npm ci` in bio-plane/, pdf-worker/ and ocr-worker/ (none a symlink), node's major (the project uses 26), disk and memory, the FULL gate's wall time and pass count (M0-114 waits on it), and — with your first real landing, never a test push — whether a push to main is accepted. A rule whose premise is missing is SUSPENDED and said so in your handoff, never skipped silently.
4. The secrets, Bob's option C: the ten keys should be environment variables here. Confirm each by USING it (`npx wrangler whoami` must report account 20b533579290b9b93168345edd3b7f72), never print a value, and name any that is absent so Bob can add it in the environment's settings.
5. Stand the lanes up in NEW-MACHINE §6's order — SCHEDULER #14, CONDUCT #14, DIST #5, FLEET #4 — each from its own -NEXT.md: check that handoff's line 1, then write that lane's complete kickoff prompt for Bob to paste into a new cloud session on this repository, one at a time.

BOB'S RULINGS BIND FIRST: "The goal is BIO work; process is overhead" (CLAUDE.md §2); "Never queue a gate behind another lane's" (§6); and lane contention is "a very significant drag … perhaps 1/2 the work being done in lanes overall is wasted and redone" (Bob, 2026-09-22) — its fix (M0-110, the coord branch; M0-111, one lander; M0-116, the gate's selection; TREE-SHARING.md) heads the plan. One account develops at a time.

HOW BOB WORKS: he runs no commands and applies no diffs. Do it, script it, or name the single smallest act only he can take, in plain words. Bring him only doctrine, priority, risk carrying his name and effects on people outside the project, each once. Never end a turn on a question nobody is present to read.
```

## 9. Seeding the new account — memory and settings

**A new account starts with none of what the last one had learned about Bob or this project, and the
loss is not evenly distributed.** Doctrine is safe: it is in `CLAUDE.md` and the design corpus, which
the clone brings. What does NOT travel is the account's MEMORY and its PERMISSION SETTINGS, both of
which live on the machine. Write both in the bootstrap session, before the first real turn.

### 9.1 The permission settings — CURRENT as of 2026-09-22 (BOB #27; BOB #16's of 2026-09-19 in git history)

**The committed `.claude/settings.json` in the repository is the authority** — it travels with the clone: default mode
`bypassPermissions`, the `deny` rules (force-push and mirror in twelve spellings, `reset --hard`, `clean -fdx`, `rm -rf`,
`sudo`, `chmod 777`; seventeen entries, counted 2026-09-22),
and `ask` on writing `.env` ONLY. **Do NOT add `ask` rules for `deploy.mjs` or `wrangler deploy`:** an `ask` rule
overrides bypass, and the three that §9.1 used to prescribe held 0.64.0's plane deploy for ~2 hours on 2026-09-19 after Bob
had ruled that DIST deploys by standing permission (`CLAUDE.md` §4); Bob had them removed (`7e9ef2f9`). The layout
is flat (§4), so the committed file governs. A
per-machine `settings.local.json` of allow entries is harmless and need not be copied.

### 9.2 The memory seed — CURRENT as of 2026-09-22 (BOB #27)

**The outgoing account's memory is carried WHOLE into `docs/archive/account-memory-2026-09-22.md`**: its index and every
entry, verbatim but for the one redaction the file states — other work Bob runs under the same account stays out of this
public repository and must come from him. Where the new environment keeps a memory (the desktop app does), seed it from
that file, one entry each with its pointer in `MEMORY.md`; where it keeps none between sessions (a cloud session,
UNMEASURED), the file IS the memory, and a lane reads the entries its work touches. The 2026-09-15 seed table and BOB #16's
two additions are in git history, and their durable lessons are in `CLAUDE.md` and the kickoffs. **Each entry is a claim
about its day**: verify it before resting on it; several name this Mac's zsh or the desktop's tools and may not hold in
the cloud.

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
