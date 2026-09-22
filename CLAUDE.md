# BIO / CivicOS — standing instructions for every session

Loaded automatically. **Short on purpose: it is meant to be read in full, every time.** The reasoning
and receipts behind each rule are in `docs/archive/CLAUDE-2026-09-18.md`, verbatim; nothing was
deleted, and `node tools/decided.mjs` still finds every ruling there. Your area's own instructions are
`docs/development/kickoffs/<AREA>.md`; read them after this.

## 1. Do not guess. Look it up — each answer is kept in one place

Bob, 2026-09-18: *"there must be a single source of truth that can efficiently AND CONSISTENTLY be
searched, read, used, and updated. That will allow you to stop guessing and assuming because the
answers are right there."*

| question | the ONE source | command |
| --- | --- | --- |
| what is BUILT, partial or absent | `docs/architecture/construct-status.json`, checked against the code at every push | `node tools/status.mjs <topic>` |
| what has been DECIDED | every ruling in the corpus, indexed | `node tools/decided.mjs "<subject>"` |
| what a lane OWES | the ledgers' dispositions | `node tools/owed.mjs <LANE>` |
| a ledger row by id (D-, REC-, IC-, M-…) | the live ledger or its archive | `node tools/ledger.mjs find <ID>` |
| what is RUNNABLE next, in order | `docs/development/QUEUE.md` | read the open rows |

**A claim about the state of the system, the plan or a decision is not made until one of these has
answered it.** A sentence in a handoff, a kickoff or a peer's message is a POINTER to where to look,
never the answer — and that includes a claim you verified earlier, which is a claim about the moment you
verified it. When a lookup returns nothing, say so: *not found* is not *absent*; grep the code.

**Keep them true in the commit that changes the truth.** Build or remove something → update
`construct-status.json` (the push is refused until you do). Rule on something → it goes in its home
document, and `node tools/decided.mjs` regenerates. Close a row → `node tools/ledger.mjs archive <ID>`
in the same commit.

**THE READING BUDGET (Bob, 2026-09-18: every session must be able to read the record it needs IN FULL,
not scan it).** A file is either READ WHOLE or LOOKED UP, never half of each. Read whole: this file, your
lane's kickoff, its `<LANE>-NEXT.md`, and the open rows of `QUEUE.md` — each has a size budget and
`plancheck` names the file that exceeds it. Looked up, by id or by subject through the tools above:
measurements, interface changes, released claims, closed debt, archived rows. Do not open a looked-up
file to read it; ask the tool for the entry.

## 2. What this is

**CivicOS exists to answer questions, make a case, tell a story, and take action to affect a living
civic system** (Bob, 2026-08-01). Everything else — capture, content, the framework, retrieval,
progressions — is substrate for that path.

- **Content is the unit**: a reference to a PART of a document, up to the whole (DEC-23). Documents are
  harvested; content is extracted; meaning derives from both. Holding a document is not holding an answer.
- **NEVER ASSUME THE LOWER LEVELS ARE COMPLETE.** When anything goes looking it may need to search
  **meaning, content, documents, AND the open internet**, in any order. **Sparse is normal.** Absence at
  one level is not evidence of absence at the next: no meaning derived may mean nothing was extracted;
  nothing extracted may mean the document was never read; no document may mean nobody looked. Saying
  WHICH is true is a first-class obligation. (Two suites and the skill pack quote these sentences
  verbatim — reword them only together.)
- **The stance is doctrine:** better government through greater understanding, less narrative, and
  accountability. No structural prior against any class of actor; bad actors are identified by
  evidence. **"Less narrative" binds us first**: the whole product is TRUSTWORTHINESS OF THE RECORD, so a
  defect that makes the record claim more than it can support is worse than a missing feature.
- **Substrate before what rests on it.** A dependent is not built until what it depends on is verified
  BUILT — by `status.mjs`, not by a row saying so.

The plane is a Cloudflare Worker plus a Durable Object with SQLite, R2 for captured bytes. `newgroup`
installs a sovereign instance into a group's own Cloudflare account — the distribution model, not a demo.

**The design corpus** is mapped by `docs/architecture/BIO_System_Design.md` (every construct, its home
document, and its state rendered from `construct-status.json`) and held to
`docs/architecture/CORPUS-STANDARD.md`: a design document carries front matter saying what it is, where
it sits, what it lacks and what it contains. **A landing that changes a construct updates its home
document's front matter in the same commit**; a citation names the SECTION, not a line.

## 3. Working with Bob

Bob is the architect. **Never hand him a command to run or a diff to apply** — do it, script it, or name
the single smallest act only he can take. Bring him only doctrine, priority, risk carrying his name, and
effects on people outside the project, in the shape `kickoffs/README.md` defines — and only through the
BOB lane, which carries such questions into his conversation. Everything else is yours: *"never block on
getting my answer when you can figure it out yourself."* When he delegates a determination, decide it,
record it, tell him. When he is wrong, correct him with the evidence. **Report what was done and
decided, never tactical state.**

**Never end a turn on a question nobody is present to read.** A session that stops to ask *"may I?"* in a
window nobody watches has stopped, and the question is lost when the session is retired. Decide what is
yours; route what is another lane's by `SendMessage` (the build plan's order → SCHEDULER; running work → CONDUCT;
design, doctrine, anything for Bob → BOB) and continue.

## 4. Rules that are not negotiable

- **Never force-push** — the deny list refuses it outright. Fetch and rebase. Pushing itself is NOT gated
  (Bob, 2026-09-16): report the landing, not the intention.
- **Writing `.env` is gated** (a secret, not an act). **Deploying the plane and the installer is DIST's, by Bob's STANDING
  permission** (2026-09-18: *"DIST has standing permission to deploy when asked to"*) — under DIST's own gate and
  verification, reported to BOB after landing; no other lane deploys.
- **One account develops at a time**, enforced by the operator (Bob, 2026-09-16). When told to stand
  down, confirm every lane and worker under you is stopped before you report that it is. There was a lock;
  it was removed on purpose — **do not rebuild it**; if you think one is needed, say so and let Bob rule.
- **A change is made when it is committed AND pushed**, and verified from the REMOTE. Run
  `node tools/plancheck.mjs` before any handoff.
- **Claim your area in `docs/development/CLAIMS.md` before editing**; do not edit another area's paths
  (append a DELEGATION); interfaces change only through `INTERFACE-CHANGES.md`. Work in your own worktree.
- **Only DIST cuts plane releases**, from a green `main`. **The standing lanes — CONDUCT, BOB, DIST,
  FLEET, SCHEDULER — are never archived for idleness** (Bob, 2026-09-18). **A session is REFRESHED when its context is
  more than 70% full** (Bob, 2026-09-21):
  check your own with `get_usage` at every self-wake and every handoff boundary; over 70%, stop taking new work, write
  your `<LANE>-NEXT.md` from the measured state, push it, verify it on the remote, and ask BOB for your successor. The
  successor archives you under D-398's three conditions. BOB measures every live session at its own opening, so a lane
  that stops checking is still caught. **Its self-wake expires:** a session-only `CronCreate` lasts 7 days, so when
  you arm it, also arm a ONE-SHOT reminder 5 days out that deletes it, arms a fresh one, and arms the next reminder
  (FLEET's form, 2026-09-18).
- **Undetermined is first-class and must be STATED.** Never invent an attribution, a referent or a figure
  to get past a gate; a gate that pressures someone into inventing one is a bug in the gate.
- **A defect you find is diagnosed until its FIX can be named**, then sent to SCHEDULER to be placed in the build plan
  in order — or to BOB first if the fix needs design (Bob, 2026-09-18). Never park it on a list. `DEBT.md` is being
  folded into the plan (LED-7); until then a defect is still minted there, and its row must name its fix.

## 5. How to know a thing is true

- **Measure; do not recall.** Numbers go into `MEASUREMENTS.md` with date and instrument. A vendor's
  documentation is a claim, labelled as theirs.
- **Name the artifact BEFORE you act** — the output that would read differently if the change did not
  work. If you cannot name one, report the act as made-and-unconfirmed.
- **An equality or an outcome that costs nothing to produce is not evidence**: two empty-body digests
  agree on nothing; our governor refusing is not the source failing; a provenance hop a caller can hand us
  is one a caller can invent. **Several documents agreeing is usually one source copied** — go to the artifact.
- **A blocker is a claim — about ONE actor, ONE form, ONE moment, never the estate** (M-75). Verify it
  against the code on your tree before you rest a deferral, a row or a refusal on it; one from a ledger is a
  claim about its day. Retry the NARROWEST form; name the refspec, session and hour refused.
- **SUBSTRATE BUILT IS NOT DEPENDENT BUILT — and this is the JUDGING half of §2's building rule** (BOB #17,
  2026-09-19; D-60, D-115, D-116, receipts archived).
  §2 says do not BUILD a dependent until its substrate is verified BUILT. The error that keeps being made runs the
  other way: a row is READ as done because the thing underneath it is done. D-116 is the exhibit (archived verbatim). **When you judge a row, verify the DEPENDENT at the
  code by name; a built substrate is not evidence about it, and neither is the row.** The honest outcome is usually
  NARROWED to the one unbuilt trace, not closed — and a row closed by rounding off its unbuilt quarter is how a false
  "done" enters the record.
- **Run the negative control**: break the subject, watch the suite fail at a NAMED assertion, restore and
  verify by hash, and record it on the suite's `NEGATIVE CONTROL:` line. **Break only the thing** — a
  control that moves a second variable (a dirty tree, a crash) refutes nothing. When a control shows no
  effect, suspect a second cause before recording a refutation.
- **Correct superseded tests, never exempt them**, with a comment saying why the old assertion was wrong.
- **Test through the op, and verify live** in your own instance's scratch namespace, swept after; a
  store-level test is not evidence a caller can reach the feature. **NAME `store=scratch` ON EVERY CALL — the namespace is
  not fenced for you** (D-325, 2026-09-19, at `index.mjs scopeFor`): only PROBE is confined; every other class, ADMIN
  included, lands in `bio` when it asks and when it says nothing. `scopeFor` honours `store=scratch` from ANY class,
  so the binding exists per CALL and an instrument omitting it addresses the REAL record. A live verification's
  no-write guarantee is the naming plus the WITNESS — the record's counters read before and after every arm — never a
  plane fence. RESIDUE: no credential binds to scratch for life; a sticky confinement is RECORD's and is NOT built. **A deploy verified is not a build
  serving**: rollout is per-isolate — if a live probe contradicts the suite, establish which build answered.
- **A fix verified only where you changed it is not verified.** Ask who else reads it — the gate's note,
  the suite's assertion, the row that cites it, the kickoff that quotes it — and check THERE. **And re-run the
  subject's negative control after changing it**: a suite coupled to behaviour survives a refactor that disarms the
  control coupled to shape (M-60 Q9).
- **Verify by the positive artifact, never the absence of an error.** A full battery ends with
  `N/N suites green · M assertions passing`; a run without that line did not finish. **Never read an exit
  status through a pipe or a wrapper** — `cmd | tail` reports tail's.

## 6. Verification profile

`node tools/gates.mjs` classifies the diff: prose under `docs/` runs the doc-facing suites plus
`plancheck`; a plane, UI, fleet, installer or config path runs the full set; any other, the suites that name
it; `--since` re-checks a rebase; `--explain` prints the plan. **Never queue a gate behind another lane's**
(Bob, 2026-09-22): run yours when you need it; `waitquiet` is for timing figures. `docs/development/VERIFICATION.md` is the full process. **Do not
change the tree while a gate is running** — the run then measures a tree that never existed. In a fresh
worktree run `npm ci` in `bio-plane/`, `pdf-worker/` and `ocr-worker/` first, check `df -h`, and confirm
each `node_modules` is a real directory, not a symlink; read the SKIP COUNT, not only the exit status.

## 7. Traps no instrument names yet

- **Commit messages via a heredoc (`git commit -F -`)** — never `-m` with backticks, never `printf` (a `%` truncates it, exit 0).
- **`git add -A` after a merge marks a conflicted file resolved WITH ITS MARKERS IN IT, and makes
  `git diff --diff-filter=U` read EMPTY** — the verification is disabled by the act it verifies, and a check that
  cannot fail is worse than none. **Check the FILES, not the index: `git grep -c "^<<<<<<<"`, before the gate** — the push guard catches
  markers only after ten minutes of measuring an unsound tree.
- **`git checkout -- <file>` restores HEAD and discards your work.** To undo a control arm, `cp` the file
  aside and back, then verify by hash.
- **Anchor every shell command with an absolute path**; a session's working directory can revert between
  turns, and a `cd` inside a subshell does not move what the tools see.
- **`store.mjs` contains a stray byte — use `grep -a`**, and grep before assuming a helper does not exist.
- **Schema:** new tables before the `host_governor` block; no backticks in the schema or setup templates;
  no semicolon inside an inline `--` comment; a derived table must be added to `purge`.
- **Bound every poller** (`until <cond> || [ $SECONDS -gt N ]`); kill by PID from a table you read, never by pattern.
- **No shell variable in an `rm`/`rmdir` path**; write the literal absolute path. Bypass still ASKS when an empty
  variable could aim it at root (no rule or hook can pre-approve that), halting the lane. Brief workers too.

## 8. Cloudflare and credentials

Both `wrangler.jsonc` files pin `account_id`; **if wrangler ever reports an account other than
`20b533579290b9b93168345edd3b7f72`, stop and say so.** Secrets are read from `.env` (gitignored, carried
into worktrees by `.worktreeinclude`). A new one arrives on the clipboard —
`printf 'X=%s\n' "$(pbpaste)" >> .env` — and is **never printed**: confirm it by using it and reporting
what the service said. A token value published in the repo is denylisted by `tokens.mjs` and treated as NOT SET.

## 9. Where things are

| path | what |
| --- | --- |
| `bio-plane/src/` | the plane: `index.mjs` control plane and its OPS table, `store.mjs` the DO, `schema.mjs` |
| `bio-plane/checks/bio-checks.mjs` | the check catalogue (C-numbers); the gate runs it |
| `bio-plane/test/` | the battery |
| `newgroup/` | the installer — out of bounds without an explicit instruction |
| `docs/architecture/BIO_System_Design.md` | the construct map; §3's state column is rendered from `construct-status.json` |
| `docs/development/QUEUE.md` | the cache of the next tasks, in order (SCHEDULER owns it; CONDUCT flips `running`) |
| `docs/development/WORK-PIPELINE.md` | how work moves: backlog → cache → archive |
| `docs/development/MILESTONES.md` | the capability ladder |
| `docs/development/ORCHESTRATION.md` | how lanes communicate — read "COMMUNICATING A CHANGE" before a change another session must know about |
| `docs/development/kickoffs/` | each lane's instructions and its `-NEXT.md` handoff |
| `release/` | the signed artifact and `RELEASE.json` |
| `docs/archive/` | finished work, and the reasoning behind every rule here |
