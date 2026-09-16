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

**Read in this order:** this file, then `docs/development/ESTATE-HOLD.md` (which machine may
develop), then `CLAUDE.md`, then `docs/development/kickoffs/BOB.md`, then
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

## 3. THE ESTATE LOCK — read this before anything else

**CLAIM THE ESTATE FIRST: CLAIM BEFORE YOU VERIFY.** Before `npm ci`, before the battery, before
anything else on this list.
RULED 2026-09-16 at Bob's direction, and it reverses what §4 and §7 used to imply. The claim is one
command and its own gate is `plancheck`, not the battery:

    node tools/estatehold.mjs show     # who holds it, and who this machine is
    node tools/estatehold.mjs claim    # writes, gates, commits, pushes, verifies from the REMOTE

The old ordering had a machine verify and then claim, which spends nine to twenty-five minutes before
telling it that it lost the race — and every minute of that is work under exactly the condition the
lock exists to prevent. Claiming costs seconds and strands nothing if the gate then fails, because
the hold EXPIRES on its own. **`ESTATE-HOLD.md` carries the protocol, the identity rule and this
ordering; read its HOLD line from `origin/main`, never from your own tree.**

**AND THE HOLDER IS THE ACCOUNT, not this machine and not this session** — Bob, 2026-09-16. So your
account's other sessions, on this machine or any other, share your hold and are not refused; a
DIFFERENT account is. The key is derived from `CLAUDE_CODE_ACCOUNT_UUID` and hashed, because the
line lives in a repository; `machine=` on the line is a label only. The window is Bob's 48 h for
everyone, including an ephemeral container, because an ACCOUNT outlives any container and its next
session refreshes the hold inside a push it already makes. `ESTATE-HOLD.md` records the two ways
the code got this unit wrong before believing the prose here.


**Only one MACHINE develops this repository at a time**, and Bob has directed that no development
happens under the new account while the old machine is working, or the reverse.
`docs/development/ESTATE-HOLD.md` is the lock, `git push` is what makes it one, and the procedure
for taking and releasing it is in that file. **Take the hold before your first commit and not
after.** A session that finds another machine holding it stops and says so.

**The hold EXPIRES rather than waiting to be released**, and that is a correction this file's
first version earned within hours: a release that depends on a session performing it is lost the
moment that session is suspended, and the hold then outlives the machine's work. A hold past its
`held through` date is FREE — a fact, not a judgement — so **claim it, refresh it whenever you
push a planning surface, and release it at stand-down; three acts, none of which requires Bob.**

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

## 6. Starting the lanes, in order

1. **BOB first** — §7's block. It takes the estate hold, verifies state, re-arms the watches, and
   reads `BOB-NEXT.md`.
2. **CONDUCT second, through a chip BOB files and Bob clicks**, gated on `CONDUCT-NEXT.md`'s head
   line being on `origin/main` (it is). CONDUCT then holds `bio/` and runs the queue.
3. **Workers are CONDUCT's**, spawned per row, worktree-isolated, one per row.
4. **FLEET when fleet work arrives** — `FLEET-NEXT.md` is published and current.

**The watches BOB re-arms, because they die with a session** (signatures in `BOB-NEXT.md` §4): a
push-watch on `origin/main`; an edge-triggered liveness tick; and a 3-hour no-progress alarm, whose
job is not to detect a hang but to force a decision nobody has made.

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

DO NOT DEVELOP, DO NOT SPAWN, DO NOT PUSH. Read the single HOLD line in
docs/development/ESTATE-HOLD.md from origin/main — it reads
  HOLD: machine=... | account=... | status=... | through=<ISO 8601 UTC>
The estate is FREE when status=RELEASED or through is in the past; otherwise STOP and tell Bob
which machine holds it and through when. Either way STOP HERE — §7's session is the one that
claims it. plancheck ENFORCES this, so expect exactly one WARN saying no machine holds the estate:
that warning is correct on a machine that has not claimed it yet and is not a fault to fix.

Report to Bob in one short message: what you cloned, which credentials are in place and which are
missing, the plancheck and gate results, whether the memory seed and settings were written, and
whether the estate is free.
```

## 7. THE PASTE BLOCK — hand this to the first BOB session on the new machine

```
Kickoff: session BOB #1 on a NEW MACHINE under a new Claude account, succeeding BOB #11 on the Mac
Mini. You are the LEAD.

Working directory is ~/ClaudeCodeBIO (the wrapper); the repo is bio/. Persona is bio — GitHub
believeinoakland, Cloudflare account 20b533579290b9b93168345edd3b7f72 — never any other account
this machine may default to. Credentials are in bio/.env; never print one.

FIRST, THE ESTATE LOCK. git fetch origin, then read docs/development/ESTATE-HOLD.md FROM
origin/main. If it names a machine other than this one and its status is not RELEASED, STOP and say
which machine holds it. Otherwise claim it: edit the table to name this machine, this account,
today's date and this session, commit, and push to main. THE PUSH IS THE LOCK — if it is rejected,
you lost the race; fetch, read who won, and stop.

THEN READ, in order: docs/development/kickoffs/NEW-MACHINE.md (how this machine was stood up and
why the layout is what it is) · CLAUDE.md · docs/development/kickoffs/BOB.md (the role, the closing
protocol's eight rules, the spawn-chip mechanism) · docs/development/kickoffs/BOB-NEXT.md IN FULL ·
docs/architecture/BIO_System_Design.md · docs/architecture/CORPUS-STANDARD.md.

VERIFY THE MACHINE before trusting anything it tells you: node -v (want v26.x), npm ci in
bio-plane/, pdf-worker/ AND ocr-worker/, then confirm none of the three node_modules is a SYMLINK
and that several GiB are free. Then node tools/plancheck.mjs (want 0 fail, 0 warn AND its notes
present) and node tools/gates.mjs (a pass ends with "N/N suites green · M assertions passing" — a
wrapper's exit status is not the battery's).

YOUR FIRST ACTS: (1) re-arm the three watches BOB-NEXT §4 specifies and set your title. (2) Do
BOB-NEXT §1 — the owed sweep of CONTENT-SEARCH-DESIGN §4.3 and §4.1, which is wrong in TWO
independent ways; fold what REC-91 established rather than restating what was written. (3) File a
chip for CONDUCT on this machine, gated on CONDUCT-NEXT.md's head line, and tell Bob it is waiting.
(4) Report to Bob in one short message: the board, what you verified, and that nothing waits on him
beyond that click.

STANDING AUTHORIZATIONS: tactical calls, sequencing, activation, mechanism, spawning and routing are
yours; never block on Bob and never report tactical state. Push ONLY behind a green gate — node
tools/gates.mjs, then grep -q '^gates: GREEN', then push, chained with && and never with ;. Never
force-push. Verify from the REMOTE, not from your own tree. Bring Bob only doctrine, risk carrying
his name, or effects on people outside the project.
```

## 9. Seeding the new account — memory and settings

**A new account starts with none of what the last one had learned about Bob or this project, and the
loss is not evenly distributed.** Doctrine is safe: it is in `CLAUDE.md` and the design corpus, which
the clone brings. What does NOT travel is the account's MEMORY and its PERMISSION SETTINGS, both of
which live on the machine. Write both in the bootstrap session, before the first real turn.

### 9.1 The permission settings

Without these the new account stops Bob for routine commands, which `CLAUDE.md` names as making a
session unusable at this level. **Write `~/ClaudeCodeBIO/.claude/settings.json`** — in the WRAPPER,
not in the repo — with exactly this, which is what the outgoing machine ran and carries no secret:

    {
      "permissions": {
        "defaultMode": "acceptEdits",
        "allow": ["Read", "Grep", "Glob", "Bash", "Artifact", "WebFetch", "Write", "Edit"],
        "deny": [
          "Bash(git push --force:*)", "Bash(git push -f:*)", "Bash(git push --force-with-lease:*)",
          "Bash(git reset --hard:*)", "Bash(git clean -fdx:*)", "Bash(rm -rf:*)",
          "Bash(sudo:*)", "Bash(chmod 777:*)"
        ],
        "ask": [
          "Bash(node scripts/deploy.mjs:*)", "Bash(node bio-plane/scripts/deploy.mjs:*)",
          "Bash(npx wrangler deploy:*)"
        ]
      }
    }

**The `deny` list is the load-bearing half and it encodes losses this project has already paid for**
— force-push, hard reset, `clean -fdx` and `rm -rf` are the four ways a session destroys another
session's uncommitted work, and `CLAUDE.md`'s own trap section records `git checkout --` doing
exactly that twice in two days. **The `ask` list is the gate on the three irreversible outward acts**:
deploying the plane and deploying the installer are Bob's, and they stay his by being asked.

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

**One more, and it is the newest:** *one machine develops at a time; `docs/development/ESTATE-HOLD.md`
is the lock and `git push` is what makes it one.*

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
