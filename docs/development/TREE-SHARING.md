# Sharing the tree: the message board off `main`, landing in batches, gates off the laptop

A process document (`CORPUS-STANDARD.md` §6). **RULED BY BOB 2026-09-22: *"Yes to all 3 recommendations"*** — the three
changes below, as BOB #26 put them to him that day. Designed here by BOB #26; **NOT BUILT**. Until each change lands, the
rules in `CLAUDE.md` stand as written, and the landing that builds a change corrects every rule and kickoff it supersedes.
**Revised 2026-09-22 by BOB #27** for Bob's move to cloud Claude Code under his second account (§4), with three builders'
questions answered in §1 (M0-99, M0-100, M0-101), and M0-110's builder's four answered there by BOB #28 the same day;
§5 points at the rest of the same day's program. Status as of 2026-09-22.

## Why: measured on 2026-09-22

- `main` took **112 commits** between 00:00Z and ~14:45Z; **89 touched `CLAIMS.md`, `QUEUE.md` or the generated
  `DECIDED.md`**, and **2** touched `bio-plane/src` or `civicos-ui/app.html` (`git log --since`, `origin/main` `84dd441f`).
  SCHEDULER #12 measured the same shape over 24 h (M-94): 142 and 169 of 209 commits touched `DECIDED.md` / `CLAIMS.md`;
  15 of 162 non-merge commits touched product source.
- One DOCS landing (BOB #26, `84dd441f`) took **six gate runs, ~33 min, where one (~6 min) was needed**: `main` moved five
  times while it gated (two CONDUCT `running` flips, two DIST landings, one SCHEDULER landing), and every conflict was two
  lanes appending a block to the end of `CLAIMS.md`.
- **The cause:** `main` is both the product and the lanes' message board. A note (a claim, a queue flip, the regenerated
  rulings index) is a commit, so it moves `main` for every lane; a gate record is keyed by the exact tree (D-293), so every
  move voids every other lane's green result, and each lane rebases and re-gates. On an 8 GiB machine the re-gates also
  compete for memory (the ceiling BOB #25 reported).
- **What it costs, measured (M-97, BOB #27, 2026-09-22 00:00Z–~15:45Z):** 24 of 59 recorded gate runs (41%) measured a
  tree that never reached `main`, the BOB lane 13 of its 18; 45 of 52 landings carried `CLAIMS.md` and 46 the generated
  `DECIDED.md`, 8 product source. It undercounts: a killed or dirty-tree run writes no record, and the rebasing between
  runs is not measured at all. Bob, the same day: *"perhaps 1/2 the work being done in lanes overall is wasted and
  redone because of this contention"* — and it *"must be understood and fixed."*

## The three changes, and their order

**Change 1 first**: change 2 moves every landing onto a cadence, and the notes lanes trade — CONDUCT's `running` word
above all, which must be visible before its worker spawns — cannot wait for a cadence, so they need their own channel
before `main` stops carrying them. **Change 3 is independent** and starts with its measurement beside change 1.
**Change 2 follows change 1**, and is cheapest once change 3 carries its gate. **Built as M0-110 (change 1) and M0-111
(change 2), with M0-99 before them** (SCHEDULER #12's placement). **M0-110's first stage starts BESIDE M0-99, not after
it** (BOB #27, 2026-09-22, on Bob's words): the per-path churn measurement and the write and read commands with their
suite are new files that M0-99 does not touch; moving the files and redirecting the readers waits for M0-99. Until they
land, `ORCHESTRATION.md`'s interim rules cut what they can: no same-commit claim block, batched landings.

### 1 · The message board leaves `main`: a `coord` branch

- **What moves.** A file moves to the branch `coord`, in this same repository, when it is STATE ABOUT THE WORK: `CLAIMS.md`,
  `QUEUE.md`, `BACKLOG.md`, `DEBT.md` and the `kickoffs/*-NEXT.md` handoffs. Bob's ruling also settles the question
  *"DECIDED.md leaving the committed tree"* that was with him: the GENERATED `docs/DECIDED.md` leaves `main` (how: the
  next bullet, which corrects BOB #26's first text, where it moved to `coord`). A file stays on `main`
  when it DESCRIBES the system, instructs a lane, or must move with the code it concerns: `CLAUDE.md`, the kickoffs, the
  design corpus, `construct-status.json`, `INTERFACES.md` and `INTERFACE-CHANGES.md` (an IC lands with its code),
  `MEASUREMENTS.md` (a figure lands with what it measured). The builder MEASURES per-path churn on `main` first and
  names any file it moves or keeps against this line.
- **`DECIDED.md` does not move: M0-99 settles it** (BOB #27, 2026-09-22, on CONDUCT #12's question). It leaves `main` by
  becoming untracked and generated on demand on EVERY branch (`ORCHESTRATION.md`: *a generated index is not committed*);
  committing it on `coord` would move its churn rather than remove it. The builder of this change moves no `DECIDED.md`.
- **The channel stays the repository** (`CLAUDE.md` §4: a change is made when it is pushed): a note is made when it is
  pushed to `origin/coord` and read from there. **A write is one command** that fetches `coord`, applies the edit without
  a working checkout, commits, runs the ledger arms of `plancheck` (seconds, not a battery), pushes, and retries on a
  non-fast-forward; **a read is one command** against `origin/coord`. No session shares a checkout (DEC-3).
- **A write is an INTENT, re-applied to the fresh `origin/coord` tip on every retry** and anchored to a block heading —
  append a block at the end; add a line at the end of block X; set row X's status word — **never a textual merge from a
  stale base** (BOB #27, 2026-09-22, on SCHEDULER #12's question). That is what makes two lanes' tail appends conflict
  free AND keeps a line in its own block; the receipt is BOB #26's DISCHARGED line, which a merge of two tail appends put
  inside DIST #4's claim that day. **So M0-101 is SUPERSEDED by this change** (the `running` word becomes an anchored
  write, and the two-writers conflict it existed for is gone), and **M0-100 NARROWS** to `MEASUREMENTS.md` and
  `INTERFACE-CHANGES.md`, which stay on `main`, where two `land/*` branches' tail appends still collide inside change 2's
  train.
- **The builder's four questions, RULED 2026-09-22 by BOB #28** (M0-110's stand-down report,
  `origin/conduct13/standdown-reports:M0-110.md`; each read at the code):
  1. **The archive ledgers move with the live ones: the WHOLE `docs/archive/ledgers/` directory.** `tools/ledger.mjs`
     writes `QUEUE-closed.md` and `DEBT-closed.md` in the act that edits the live file (`archive`; WORK-PIPELINE §2 step
     1), and SCHEDULER's drains and cuts write `BOB-INBOX-drained.md` and `QUEUE-cut-*.md` in the commit that edits the
     live files (`3f949ed0`, `4e52aee8`, `359e4020` each carry both, with `MILESTONES.md`). Left on `main`,
     one act would span two branches, and a `done` flip without its archive is what P2 refuses. They are the history of
     the state, written by the same act, so they are state; the frozen August rolls go with them, so `ledger.mjs`'s
     `archiveFiles` and `findId` read one family on one branch. This widens the list above, which named only live files.
  2. **A check of a ledger's CONTENT leaves the battery; a check of a tool's BEHAVIOUR stays.** A gate record is keyed by
     `main`'s tree (D-293), so after the cutover a suite that judges the LIVE rows judges `coord`, which no `main` record
     settles: a `coord` write could turn it red with `main` unmoved. Each such suite splits by its subject. Arms that run a
     tool against PLANTED ledgers (the controls in `rowdesign`, `delegations`, `debt-floor`, `ledger`, `pipeline-readers`,
     `m041-instrument-census`, `corpuscheck`) stay in the battery. Arms that judge the live rows (`planning-hygiene`'s
     live-register arms, `corpuscheck` §5, the live reads in `op-claims` and `pipeline-readers`) move into the ledger
     checks the write command runs before it pushes, so a `coord` write that breaks one is REFUSED, and `plancheck` runs
     the same checks against `origin/coord`. The builder names each moved arm and its new home; none is dropped.
     NEGATIVE CONTROL: a write that plants a closed row in the cache is refused by name, and `main`'s battery is unmoved.
  3. **`MILESTONES.md` splits at this section's line.** Its ladder (each rung and what the capability means) describes
     the system and stays on `main`. Its `## Placement: everything open, and where it now sits` table is a per-row
     disposition that the debt fold rewrites (every one of 2026-09-22's eight touches): state, so it moves to `coord` as
     `docs/development/PLACEMENT.md`, with a pointer where it stood. It repeats each placed row's own `milestone:` line,
     so LED-7's closing landing retires it once every open item carries that line.
  4. **The heartbeat is not redirected; a replacement would be.** Its skill lived on the old Mac and was disabled at the
     stand-down (`kickoffs/NEW-MACHINE.md` §0); `docs/archive/conduct-heartbeat-SKILL-2026-09-19.md` is a dated copy and
     stays verbatim. A cloud replacement, if one is built, is one more reader in the list above and reads through the
     read command.
- **Every reader follows the files**: `plancheck`, `ledger.mjs`, `owed.mjs`, `decided.mjs`, `gates.mjs`' suite derivation,
  the push guard (it stops judging `DECIDED.md` on `main`), the heartbeat's skill, and a worker reading its row
  (*from `origin/main`* becomes *from `origin/coord`*). `plancheck` keeps its cross-checks by reading both branches: a
  row's cited design section on `main`, the row on `coord`.
- **One migration landing** moves the files, leaves a one-line pointer at each old path, and corrects `CLAUDE.md` §1's
  table and every kickoff that names a moved file, in the same commit.
- **Accepts when** a claim, a queue flip and a handoff each land on `coord` without moving `main`, every reader above
  answers as it did from `main`, a `main` gate record survives a `coord` write, and a new block and a line into an
  existing block, written concurrently, both land with the line in its own block. NEGATIVE CONTROL: point one reader
  back at `main`'s old path, and its suite fails by name; make the write a textual merge, and the in-block arm fails.

### 2 · One lane lands on `main`, in batches

- **Lanes and workers push branches only.** A branch named `land/<lane>/<topic>` means *ready to land*. **CONDUCT, the
  integrator, lands on a cadence** (about every 30 minutes, or sooner when work waits): it merges every waiting `land/*`
  branch onto `main` in one integration branch, gates ONCE on the union class, pushes `main`, and deletes the landed
  refs. A branch that conflicts or reds is returned to its lane by name and the rest land.
- **Nobody else pushes `main`**, enforced by the push guard, not by memory; the integrator's mark is the builder's to
  choose. A release (DIST) lands through the same train; a security fix may ask for an immediate train, never a
  side door.
- **Accepts when** two lanes' `land/*` branches land in one train with one gate record, and a lane's direct push to
  `main` is refused by name. NEGATIVE CONTROL: drop the guard's `main` arm, and the refusal arm fails by name.

### 3 · The gates run on GitHub's machines

- A GitHub Actions workflow runs `node tools/gates.mjs`, in the class it derives, for each `land/*` push and each
  integration branch, and records the verdict as a check on the commit. **The push guard accepts a green check for
  HEAD's tree** as it accepts a local record today (D-293 keys both by the tree). A local gate stays the fallback.
- **The builder measures first:** the FULL battery's wall time and pass count on a GitHub runner against the Mac's; any
  suite that needs a secret or the network (that is a live probe, not a gate unit, and is named); and the monthly
  minutes at change 2's cadence.
- **Bob's acts, named once with those figures:** enabling Actions on `believeinoakland/bio`, and any spending limit.
- **Accepts when** a `land/*` push gets a GitHub check whose verdict the push guard reads, and a red check refuses the
  push. NEGATIVE CONTROL: break one suite on a branch, and the check reads red at that suite.

## 4 · The move to cloud Claude Code, under Bob's second account

Bob, 2026-09-22, to BOB #27: *"there'll be a transition at some point today that will involve both to cloud-based CC and
to using the second Max 20X account of mine"*, with the instruction that these changes be fully recorded first. The move
itself — what must happen before it, and what a cloud session starts without — is `kickoffs/NEW-MACHINE.md` §0. This
section records what it changes in THIS design. **Every claim about the cloud here is either the vendor's own tool
description, read 2026-09-22, or UNMEASURED, and says which;** the first session there measured them the same day
(BOB #28: `kickoffs/NEW-MACHINE.md` §0.1, `MEASUREMENTS.md` M-99), and those figures govern where they differ.

- **Change 1 gains weight and stays first.** A cloud session RECEIVES a cross-session message but cannot SEND one back
  (the vendor's `SendMessage` description), and the desktop's session tools and scheduled tasks are not known to exist
  there (UNMEASURED). The repository is then the only channel that runs both ways: `coord` is the board for lanes that
  cannot answer a message.
- **Change 2 keeps its shape; where its refusal lives is UNDETERMINED.** Whether a cloud session may push `main` at all
  is UNMEASURED. Today the refusal would live in `.git/hooks/pre-push`, which is untracked and installed only by
  `node tools/plancheck.mjs`, so a fresh clone has NO guard until plancheck has run once. The builder measures first,
  then names the home of the refusal: the hook, or the host's branch protection — which is also the route the train
  takes if a cloud session cannot push `main`.
- **Change 3 loses its first premise.** Its cause was one 8 GiB Mac's memory shared by every lane's battery; a cloud
  session runs on its own machine (the vendor's model; its size UNMEASURED), so lanes stop competing for one. What
  remains is a verdict recorded ON THE COMMIT: a gate record lives in one clone's git directory (D-293), so a cloud
  session starts with none and cannot read another's. **§3's measurement gains a third column, the full battery's wall
  time and pass count in a cloud session, and Bob's acts come to him only if the figures still favour a runner.**
  SCHEDULER #12 holds this item's placement for this section.

## 5 · The rest of the same program, by pointer

Their state is the ledger's, never this file's: `node tools/ledger.mjs find <ID>`, `node tools/decided.mjs "<subject>"`.

- **Bob's rulings of 2026-09-22, each in its home:** *"The goal is BIO work; process is overhead"* — product before
  process tooling, no process row unless it cuts gate time or unblocks product, batch landings (`CLAUDE.md` §2;
  `SCHEDULER.md` step 3 orders the plan by it); *"Never queue a gate behind another lane's"* (`CLAUDE.md` §6); a session
  refreshes past 70% of its context, not 60% (`CLAUDE.md` §4; ruled 2026-09-21, and restated 2026-09-22 as BOB #26
  recorded it: *"the line is 70%, not 60% — refresh less, work more"*).
- **The rows:** M0-99 (`DECIDED.md` untracked, generated on demand; §1), M0-106 (DIST's release gate reuses a tree's
  GREEN record), M0-107 (a timeout reads NOT MEASURED, never a finding), M0-109 (the ledger suite's floor that the debt
  fold tripped), M0-100 (narrowed, §1), M0-101 (superseded, §1), M0-114 (change 3, BLOCKED on the
  first cloud session's full-gate figures, §4) and M0-116 (the gate's selection: one measurement appended re-ran 105 of 335
  units, 36 of them only because they import a scanner that names the file).
