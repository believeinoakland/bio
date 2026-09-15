# Standing this project up on a new machine, under a new account

Written 2026-09-15 by session BOB #11 on the Mac Mini, at Bob's direction, as its last act before
stopping on token budget. **Its audience is the FIRST BOB SESSION on the new machine**, and Bob
hands it over by pasting §7's block. Everything here was measured on the outgoing machine rather
than recalled; where a figure could drift, the command that re-measures it is given instead.

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

**Only one MACHINE develops this repository at a time**, and Bob has directed that no development
happens under the new account while the old machine is working, or the reverse.
`docs/development/ESTATE-HOLD.md` is the lock, `git push` is what makes it one, and the procedure
for taking and releasing it is in that file. **Take the hold before your first commit and not
after.** A session that finds another machine holding it stops and says so.

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

## 8. What will bite this machine first

- **A baseline measured before `npm ci` in all three packages**, which reads green with a whole
  member silently skipped. `CLAUDE.md`'s traps section carries this and its two other faces.
- **A working directory that reverts between turns** — a `cd` inside a subshell does not move what
  the TOOLS see, so a spawn can fail while a hundred shell commands succeeded.
- **Treating `0 fail` as verification.** Read what the check says it CHECKED.
- **Believing a ledger row.** A debt row is a claim about the day it was written; grep the code the
  row names before resting a design on it (`kickoffs/BOB.md` rule 5).
- **Two machines developing at once.** §3. It is the only failure here that nothing else catches.
