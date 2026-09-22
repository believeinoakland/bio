# Sharing the tree: the message board off `main`, landing in batches, gates off the laptop

A process document (`CORPUS-STANDARD.md` §6). **RULED BY BOB 2026-09-22: *"Yes to all 3 recommendations"*** — the three
changes below, as BOB #26 put them to him that day. Designed here by BOB #26; **NOT BUILT**. Until each change lands, the
rules in `CLAUDE.md` stand as written, and the landing that builds a change corrects every rule and kickoff it supersedes.

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

## The three changes, and their order

**Change 1 first**: change 2 moves every landing onto a cadence, and the notes lanes trade — CONDUCT's `running` word
above all, which must be visible before its worker spawns — cannot wait for a cadence, so they need their own channel
before `main` stops carrying them. **Change 3 is independent** and starts with its measurement beside change 1.
**Change 2 follows change 1**, and is cheapest once change 3 carries its gate.

### 1 · The message board leaves `main`: a `coord` branch

- **What moves.** A file moves to the branch `coord`, in this same repository, when it is STATE ABOUT THE WORK: `CLAIMS.md`,
  `QUEUE.md`, `BACKLOG.md`, `DEBT.md`, the `kickoffs/*-NEXT.md` handoffs, and the GENERATED `docs/DECIDED.md` — which
  settles the question *"DECIDED.md leaving the committed tree"* that was with Bob: it leaves `main`. A file stays on `main`
  when it DESCRIBES the system, instructs a lane, or must move with the code it concerns: `CLAUDE.md`, the kickoffs, the
  design corpus, `construct-status.json`, `INTERFACES.md` and `INTERFACE-CHANGES.md` (an IC lands with its code),
  `MEASUREMENTS.md` (a figure lands with what it measured). The builder MEASURES per-path churn on `main` first and
  names any file it moves or keeps against this line.
- **The channel stays the repository** (`CLAUDE.md` §4: a change is made when it is pushed): a note is made when it is
  pushed to `origin/coord` and read from there. **A write is one command** that fetches `coord`, applies the edit without
  a working checkout, commits, runs the ledger arms of `plancheck` (seconds, not a battery), pushes, and retries on a
  non-fast-forward; **a read is one command** against `origin/coord`. No session shares a checkout (DEC-3).
- **Every reader follows the files**: `plancheck`, `ledger.mjs`, `owed.mjs`, `decided.mjs`, `gates.mjs`' suite derivation,
  the push guard (it stops judging `DECIDED.md` on `main`), the heartbeat's skill, and a worker reading its row
  (*from `origin/main`* becomes *from `origin/coord`*). `plancheck` keeps its cross-checks by reading both branches: a
  row's cited design section on `main`, the row on `coord`.
- **One migration landing** moves the files, leaves a one-line pointer at each old path, and corrects `CLAUDE.md` §1's
  table and every kickoff that names a moved file, in the same commit.
- **Accepts when** a claim, a queue flip and a handoff each land on `coord` without moving `main`, every reader above
  answers as it did from `main`, and a `main` gate record survives a `coord` write. NEGATIVE CONTROL: point one reader
  back at `main`'s old path, and its suite fails by name.

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
