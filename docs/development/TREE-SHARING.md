# Sharing the tree: the message board off `main`, landing in batches, gates off the laptop

A process document (`CORPUS-STANDARD.md` §6). **RULED BY BOB 2026-09-22: *"Yes to all 3 recommendations"*** — the three
changes below, as BOB #26 put them to him that day. Designed here by BOB #26. **Change 1 is BUILT by M0-110** (§1 "As
built"; live from CONDUCT's cutover); **change 2 is BUILT by M0-111** (§2 "As built"; live from the train that lands
it); **change 3 is BUILT by M0-114** (§3 "As built"), and its per-suite result record **by M0-126** (§3a "As
built"). Until each change lands, the
rules in `CLAUDE.md` stand as written, and the landing that builds a change corrects every rule and kickoff it supersedes.
**Revised 2026-09-22 by BOB #27** for Bob's move to cloud Claude Code under his second account (§4), with three builders'
questions answered in §1 (M0-99, M0-100, M0-101), and M0-110's builder's four answered there by BOB #28 the same day;
§5 points at the rest of the same day's program. Status as of 2026-09-23.

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
- **As built (M0-110, 2026-09-22) — `tools/coord.mjs`, its suite `bio-plane/test/coord.test.mjs`, its control
  `coord.control.mjs`.** What moved is `isMovedPath` there: the four live files, every `kickoffs/*-NEXT.md`, the whole
  `docs/archive/ledgers/` family and `PLACEMENT.md` (rulings 1 and 3). **The pointer is the switch:** each old path on
  `main` holds a one-line `COORD-POINTER:` file, and `readState` answers a pointer with `origin/coord`'s copy
  (`BIO_COORD_REF` names another ref), so every reader — `ledger`, `plancheck`, `owed`, `decided`, `delegations`,
  `readbudget`, `mintid`, `attribution`, `rowdesign`/`rowsubstrate` through the lister, `op-claims` — reads the same
  code before and after the cutover, and a planted fixture as itself. `occupancy.mjs` and `retirable.mjs` read no state
  file (read at the code); `gates.mjs`' derivation reads no state CONTENT and is unchanged. **Writes:** `coord.mjs
  write` with intents (append a block; a line under a block's heading; a row's status word; a row replaced, deleted, or
  inserted before/after another; a handoff replaced; `archive`; `refill`), re-applied on every retry through a
  temporary index, pushed without force; `ledger.mjs archive|refill` route through it on a switched tree. **Ruling 2's
  moved arms are `ledgerChecks`** — LC-markers, LC-debt-token, LC-queued-refs, LC-row-design, LC-strays,
  LC-owed-agreement, LC-plan-fields, LC-delegations, LC-ledger, LC-debt-agreement, LC-undecided-route, LC-op-claims,
  LC-handoff-budget — each naming the suite it left; a write runs all and is refused by name, `plancheck` §10 runs those
  no other section runs. **Plancheck §10** also fails a switched `main` whose state path is not exactly its pointer, and
  any `origin/main:<state path>` left in the tracked tree outside the archive and `MEASUREMENTS.md`. **The push guard**
  judges a push of `coord` alone by its own commit (no merge marker) and skips `main`'s checks. **The cutover** is
  `coord.mjs migrate`: `coord` as a ROOT commit of the state files from the integration HEAD (fixed dates: re-runs agree)
  and `main`'s pointer commit on it, pushed coord-first by CONDUCT. **Not built:** a `carry <branch>` command (a branch
  cut before the cutover carries its state additions by hand, as `coord.mjs write` intents); the heartbeat's cloud
  replacement (ruling 4). **Widened by M0-119 (2026-09-22):** `docs/development/BACKLOG-LATER.md`, the backlog's tail
  (WORK-PIPELINE §2), is a state file created on `coord` with no pointer on `main`; every write ends with a rebalance of
  the backlog's split, and the intents gain `rebalance` and `swap`.

### 2 · One lane lands on `main`, in batches

- **Lanes and workers push branches only.** A branch named `land/<lane>/<topic>` means *ready to land*. **CONDUCT, the
  integrator, lands on a cadence** (about every TWO HOURS, RULED 2026-09-23 by BOB #30 below; it was 30 minutes): it merges every waiting `land/*`
  branch onto `main` in one integration branch, gates ONCE on the union class, pushes `main`, and deletes the landed
  refs. A branch that conflicts or reds is returned to its lane by name and the rest land.
- **Nobody else pushes `main`**, enforced by the push guard, not by memory; the integrator's mark is the builder's to
  choose. A release (DIST) lands through the same train; a security fix may ask for an immediate train, never a
  side door.
- **Accepts when** two lanes' `land/*` branches land in one train with one gate record, and a lane's direct push to
  `main` is refused by name. NEGATIVE CONTROL: drop the guard's `main` arm, and the refusal arm fails by name.
- **As built (M0-111, 2026-09-23) — `tools/train.mjs`, the push guard's `main` arm (`mainArmCheck` in
  `tools/pushguard.mjs`), their suite `bio-plane/test/train.test.mjs` and its control `train.control.mjs`.** `train.mjs
  list` classifies every `land/*` ref by ANCESTRY against `origin/main` (LANDED or WAITING); `run` merges each waiting tip
  (by sha, oldest first, plus any `--branch`) into `train/<id>` cut at `origin/main`, aborts and RETURNS a conflict by
  name, scans for markers, runs `mintid --audit` on the union, gates ONCE through `gates.mjs` (the union's class) and
  reads the verdict from the D-293 record, writes `<git common dir>/bio-train/<id>.json`, pushes `main`, verifies it
  from the remote, and deletes each landed ref only when the remote still holds the sha it merged, reporting DELETED or
  NOT DELETED from `ls-remote` — never from the push's exit status or words: measured 2026-09-23T00:01Z, the cloud
  proxy answers a deletion HTTP 403 (exit 1) while git prints "Everything up-to-date".
  A RED over several branches is UNDETERMINED and names them all, or `--isolate` gates each alone and lands the rest.
  **The mark, and its limit:** a push to `main` passes only when its tip carries `Bio-Train: <id>`, a train record names
  that commit and tree, and the gate recorded the tree GREEN; a deletion of `main` is refused. It proves the PROCEDURE,
  never the actor: every session shares one credential, so no hook can tell CONDUCT from a lane, and a lane that runs
  the train, forges the three local files (driven in the suite), uses `--no-verify`, or pushes from an unguarded clone
  passes. **The refusal's home (§4) is the pre-push hook**, and the cloud's SessionStart hook now installs it
  (`.claude/hooks/session-start.sh` step 2c); a host-side refusal (branch protection) was not
  measured. **RULED 2026-09-23 by BOB #29, on the M0-111 builder's two questions (via CONDUCT #14):**
  **(1) No branch protection on `main` now.** The guard exists against HONEST procedural error by sessions acting under one
  principal, never against an adversary: every bypass named above is a deliberate act a session must choose, and the
  kickoffs already forbid each. Branch protection would not add what the guard lacks — it cannot tell one session from
  another either — and would cost Bob a settings act. Its one real gain is binding the PROCEDURE host-side, independent of
  a local hook, and that needs a check for it to require: **trigger, change 3 built** (the Actions check on each commit;
  M0-114 measured Actions already enabled, FULL 278/278 in 875 s on a runner). Then requiring that check on `main` is
  brought to Bob as one setting, with change 3's figures. **AMENDED 2026-09-23 by BOB #29, the trigger having fired
  (M0-114 landed at `30475ca6`):** the premise was incomplete. The train's `main` commit is a NEW merge commit that no
  `land/*` push carried, so a required check would refuse every landing until the train first pushes `integrate/*`
  and WAITS for the runner (~15 min, measured 875 s) on each landing — gate time added, which Bob ruled against the
  same day. So it is NOT brought to Bob now. Re-trigger: a train that already lands through `integrate/*` with the
  check read (built for its own sake), or a commit on `main` after `c5c83dc4` without a `Bio-Train` trailer. Earlier trigger: any commit found on `main` after `c5c83dc4`
  without a `Bio-Train` trailer. **(2) The kickoff is enough to keep a lane from running `train.mjs` itself.** A train
  run by the wrong lane still merges, gates, records and verifies exactly as CONDUCT's would; the rule is COORDINATION
  (one lander, so two trains do not race), and a race fails loudly (non-fast-forward), never into a false record. A
  wrong-lane train is a data point on its receipt, not grounds for a mechanism.
  **M0-122 (2026-09-23) built the retry and the reuse.** A push of `main` rejected because `main` MOVED under
  the gate (read by ancestry after a fetch, never from git's words) is retried, at most three pushes in all, each stated:
  merge the new `origin/main` (a conflict returns the branches touching it, by name), scan for markers, the id audit,
  gate `gates.mjs --since <the GREEN tip>` — never FULL — write a train record `<id>-retry<n>` whose trailer the retry's
  merge carries, push, verify from the remote. And a union whose TREE this clone's D-293 record already holds GREEN —
  a lone `land/*` branch fast-forwarding `origin/main` merges to exactly its own tip's tree — lands with no gate run,
  read through pushguard's `readRuns` and `effectiveVerdict`; a tree recorded RED or NOT MEASURED is gated as before.
  **M0-131 (2026-09-23) made that reuse run the never-cached units (§3a condition 1, BOB #30):** a tree record says nothing
  about the union's NEW HISTORY, so a reused tree runs `gates.mjs --never-cached` — every unit `neverCacheOf` marks (the
  `GATE: never-cache` markers and the plancheck closures, derived in the gate, never listed in the train) and plancheck —
  recorded as class NEVERCACHE (which covers no class), and its RED refuses the union naming the unit. Every other non-FULL
  train gate (the derived class, the retry's `--since`) carries `--with-never-cached`: its plan plus every never-cached
  unit it left out, since a narrowed selection is a reuse too. Driven in `train.test.mjs`'s M0-131 section: a lane's tree
  gated GREEN, then `merge -s ours` of a main carrying a `Carry:` edit, keeps that tree and drops the edit; the train
  refuses it at the history check by name. A RED never-cached run is recorded against the TREE, so the guard's `main`
  arm then refuses that tree too — a second refusal, found by the control's verdict-ignored arm.
  **Not built:** reuse of a record held in ANOTHER clone's git dir (a cloud session's gate is not visible to CONDUCT's
  clone), so such a branch is still gated in the train.

### 3 · The gates run on GitHub's machines

**A RED GITHUB RUN IS AN ALARM THAT REACHES BOB — RULED 2026-09-23 by Bob** (*"I don't need any more of those github error
emails, but I'm glad I got them so that we knew there is a problem"*). Every push rides his account, so every failed run emails
him, and he keeps those emails on on purpose: **a red run must mean a real problem.** So: (a) a `land/*` or `integrate/*` branch
is pushed only after its own local gate is GREEN on that tree; (b) a negative control is NEVER pushed to a branch the
workflow triggers on — it runs locally, as every other control does (M0-114's two `m0114-negctl` runs were the last);
(c) a check that depends on anything but the tree — live `coord` state above all — never decides the gate's verdict (the
defect that reddened `land/conduct/batch6`'s runs 6 and 7, placed by SCHEDULER); and (d) whoever pushed a branch that
reads red diagnoses it at once and never leaves it red.

**THE BATCH IS A TIME WINDOW, ABOUT TWO HOURS — RULED 2026-09-23 by BOB #30, on Bob's question** (*"Is there an opportunity
to significantly increase the batch size?"*). MEASURED from `main`'s first-parent history and the workflow's runs that day:
13 trains landed between 05:25Z and 12:54Z, about one every 35 minutes, and 6 of them carried ONE branch (two DIST
pointers, two BOB docs branches, a leak fix, a red-main repair). Each GitHub run read 4-5 minutes only because it ran DOCS
(M0-126's finding); from M0-126 on it runs the whole battery, which took 14-16 minutes on the runner in M0-114's runs, and
the train's own local gate runs per train too. So: **a train runs about every two hours and takes EVERY waiting `land/*`
branch** (lanes' docs branches and DIST's pointers included: they wait for it). Four exceptions only, each named in the
train's commit: (1) a security fix whose release is a CUT NOW; (2) repairing a RED `main`; (3) a landing a RUNNING worker
or a release is blocked on; (4) Bob asks. **What it costs, stated:** a finished item waits up to two hours to reach `main`,
and a larger batch that reads red takes longer to pin. The per-suite `failedUnits` rerun and M0-126's per-unit record bound
the second cost. **Re-measure after a day** (trains a day, branches a train, the train's gate minutes, the red-batch
count) and widen or narrow from the figures, not from this paragraph.

**ONE GITHUB RUN PER LANDED BATCH — RULED 2026-09-23 by Bob** (*"Ok, 1 github run per batch"*, on BOB #29's
recommendation). The workflow runs on a push to `main` alone, and `main` moves only through the train, so each run audits
exactly one landed batch; it no longer runs on `land/*` or `integrate/*`. **Nobody waits on it:** a lane reuses its own GREEN
record, and the push guard's check arm, finding no check on a `land/*` commit, says so and never refuses. What it is FOR is
the one thing a second machine can see: a test whose result depends on the machine. Its email to Bob is the alarm that
`main` itself is red. The measured cost it removes: every locally-green branch re-run on a runner (~15 min a push), and
the runner-only emails of 2026-09-23.

**A GATE TEST DEPENDS ONLY ON THE CODE — RULED 2026-09-23 by Bob** (*"If a test can pass or fail because of the machine it
ran on rather than the code, that sounds like an error in the design of the test"*). A result that moves with the machine
is a DEFECT, diagnosed to its fix like any other, never waved through as "the environment". Anything that genuinely needs
the outside world is a LIVE PROBE, outside the gate (§3 above). The two found that night: esbuild writing each
dependency's RESOLVED path into the fleet bundles, so a symlinked `node_modules` changed the bytes (fix: `preserveSymlinks`,
FLEET); and a battery suite leaking miniflare sandboxes on the runner only (D-186's race, CONDUCT).

- A GitHub Actions workflow runs `node tools/gates.mjs`, in the class it derives, for each `land/*` push and each
  integration branch, and records the verdict as a check on the commit. **The push guard accepts a green check for
  HEAD's tree** as it accepts a local record today (D-293 keys both by the tree). A local gate stays the fallback.
- **The builder measures first:** the FULL battery's wall time and pass count on a GitHub runner against the Mac's; any
  suite that needs a secret or the network (that is a live probe, not a gate unit, and is named); and the monthly
  minutes at change 2's cadence.
- **Bob's acts, named once with those figures:** enabling Actions on `believeinoakland/bio`, and any spending limit.
- **Accepts when** a `land/*` push gets a GitHub check whose verdict the push guard reads, and a red check refuses the
  push. NEGATIVE CONTROL: break one suite on a branch, and the check reads red at that suite.
- **As built (M0-114, 2026-09-22) — `.github/workflows/gates.yml`, the arm in `tools/pushguard.mjs`, its suite
  `bio-plane/test/pushguard-check.test.mjs`; the measurement is `MEASUREMENTS.md` M-104.** Actions was ENABLED on the
  repository already: a workflow pushed on a worker's branch ran at once, so no act of Bob's was needed. The workflow runs
  `node tools/gates.mjs` in its derived class on every push of `land/**` and `integrate/**` (never `main`), with the
  cloud hook's five repairs and no secret, and leaves the verdict on the commit as the `gate` check run's ONE `gate
  verdict` annotation (`VERDICT=… TREE=… CLASS=… EXIT=… WALL=…s FAILED=…`), read from the gate's own `RECORDED` line, so
  a job that died before the gate recorded says UNDETERMINED. **The guard refuses** a push only when the latest
  completed `gate` check on the pushed COMMIT concluded failure and its annotation says RED for the pushed TREE; GREEN,
  NOT MEASURED, UNDETERMINED, PENDING and NONE (no check, or a commit GitHub has not seen: HTTP 422) are each said, never
  refused, and `BIO_PUSHGUARD_CHECKS=off` skips the arm aloud. The local record stays the first arm and the fallback.
  **Not built / limits:** it reads the checks of the COMMIT, so a different commit with the same tree finds none; it
  reads the `origin` remote's repository; the integration branch's prefix `integrate/**` is this landing's guess at
  M0-111's name, and that landing names the real one here.
- **A RED NAMES WHAT IS RED (M0-127, 2026-09-23; measured in `MEASUREMENTS.md` M-112).** The run on tree `6ef503c4` read
  RED with 282/282 suites green and `FAILED=none`: the red was D-186's residue check, which is not a suite. The annotation
  is now composed by `tools/gateverdict.mjs` from the gate's log, and its FAILED= names every cause as a token —
  `plane:`/`fleet:` a suite, `residue:<path>:by=<suite>:pid=<n>`, `step:<coverage--strict|civicos-ui|plancheck|…>:exit=<n>`,
  `notmeasured:`, `sharedlog:`, `gate:no-record:…` for a gate that died — read from the gate's own `gates: CAUSES` line
  (`tools/pushguard.mjs` `stepCauses`), and reads `none` ONLY on GREEN. The battery's result line carries each suite's
  pid, so a residue names the suite that left it. **Not exercised:** the Actions runner itself; the writer is driven
  locally on real gate logs (`bio-plane/test/gateverdict.test.mjs`).

### 3a · The shared, per-suite result record (M0-126) — DESIGNED 2026-09-23 by BOB #29, adopting CONDUCT #14's proposal

**Why.** Bob, 2026-09-23: *"track either which suites have passed so that they don't run again, or track those tests that
have failed so that only those run"*, and a shared record in preference to a second machine (*"that seems much better than
getting github involved"*). Today a result is keyed by a whole TREE and lives in one clone (D-293): one changed file voids every
suite's result, and a lane's GREEN is invisible to the integrator, who re-runs it. One mechanism answers both halves.

**The key.** A result belongs to a UNIT (a plane or fleet suite, a UI suite, a UI check, `coverage`) and to the HASH OF ITS
INPUTS: sha256 over the sorted list of `(path, git blob sha)` for every file the unit can read, plus the runtime it ran under
(node's major version and the sha256 of every `package-lock.json` in the tree). The input set is the one `gates.mjs` already
derives per unit for TARGETED and `--since` (the unit's source, its sibling control, the tools and scripts it names and their
transitive imports, and the files it MENTIONS), and **for a plane or fleet unit it always includes the whole FULL-class runtime
set** (`bio-plane/src/`, `bio-plane/checks/`, the plane's foreign roots, each fleet member's source), because MENTION cannot see
what the runtime reads. A unit whose inputs did not change has the same key on any branch, any merge and any clone.

**The record.** A PASS only — a failure is never cached, so it simply runs again. One small JSON file per key,
`results/<unit>/<input-hash>.json`, on an APPEND-ONLY branch `gate-results`: `{unit, inputHash, verdict: "PASS", run, tree,
head, gateVersion, clone, session, at}`. Writing a new key only ADDS a file, so two writers never conflict; a rejected push
re-fetches and re-applies, as `coord.mjs write` does. Any clone reads it with one fetch. It is state about the WORK, never
product, and it never touches `main`.

**The reuse rule.** `gates.mjs` computes each selected unit's key; a unit whose key already holds a PASS is NOT run and is
printed REUSED, naming the record; every other unit runs, and each one that passes writes its record. So a failed suite re-runs
(it has no PASS), a suite whose inputs moved re-runs (new key), and a suite that passed anywhere, on identical inputs, runs
nowhere again. The train reads the same records. It supersedes the tree-keyed reuse (`gates.mjs` §2d and M0-122's
`recordedGreen`), which stays correct until this lands.

**Three conditions, each REQUIRED.**
1. **NEVER-CACHED units.** A unit that reads anything outside its declared inputs — the clock, the network, the environment's
   secrets, live `coord` state (tonight's red) — carries a `GATE: never-cache (<reason>)` line in its source and always runs.
   `plancheck` is never cached.
   **A unit that reads GIT HISTORY or a LIVE REF is never-cache — RULED 2026-09-23 by BOB #30, on the M0-126 worker's finding
   after GitHub run #20.** `origin/main`, `origin/coord`, merge ancestry, `ls-remote`: none is in the tree a key names, so a
   PASS keyed by the tree says nothing about the history it judged. `mergecarry.test` passed on a reused GREEN tree record
   (M0-122) and failed on GitHub at `4355bfda`, a merge whose TREE was already GREEN. So such a unit carries
   `GATE: never-cache (history)` and runs on every gate, and ANY reuse — this record or M0-122's tree record — still runs the
   never-cache units. Keying them on the range they read was considered and refused: a second key scheme for a handful of
   suites, when never-cache costs only their run time.
2. **UNDER-INCLUSION FAILS.** Over-inclusion only costs a re-run; under-inclusion reuses a stale PASS and is the defect. So each
   unit, when it RUNS, is traced (a node `--import` hook recording every repository file it opens or imports); a file read that
   is not in the unit's input set FAILS the unit by name, and no PASS is written for it.
3. **A FULL BACKSTOP.** Every release cut runs the whole battery with no reuse, and the one GitHub run per landed batch on
   `main` runs everything on a second machine. The negative controls stay.
   **What the cut's run is — RULED 2026-09-23 by BOB #30 (SCHEDULER #15's question: M0-106 and this condition read
   opposite).** The backstop's property is ONE RUN OF EVERY UNIT, WITH NO REUSE, ON THE RELEASED TREE — not that DIST's
   own clone ran it. So a cut may rely on a GREEN FULL record for its EXACT tree (M0-106 stands, narrowed) only when that
   record was written by a run that REUSED NOTHING: M0-126 marks such a whole-tree record as a backstop, and a record whose
   run printed any unit REUSED, or a `gates.mjs --since` from another tree, never satisfies a cut (M0-106's `--since` arm
   is withdrawn). Absent a backstop record for the exact tree, the cut runs the whole battery, as 0.74.0's did.

**What a liar's record would look like, and why it is tolerable.** A PASS file for a key whose unit never ran, or ran red. It
is indistinguishable from an honest one where it sits: the record proves a PROCEDURE, never an actor (§2, "The mark, and its
limit"), and a session could write one only on purpose, which the kickoffs forbid. Its damage is bounded: the record names the
run, tree, clone and session that wrote it; the FULL run at each release cut and the GitHub run on `main` re-run every unit
with no reuse, so a false PASS that hid a real failure turns `main` red and emails Bob; the key is then REVOKED (a
`revoked/<unit>/<input-hash>.json` beside it, which the reader honours), and its writer is named from the record.

**Accepts when** a second clone gates a tree whose units a first clone passed and runs 0 of them (all REUSED), one input
change re-runs exactly the units whose key moved, and a never-cached unit runs every time. **NEGATIVE CONTROL:** drop one
file from a unit's input set, and condition 2 fails that unit by name.

- **As built (M0-126, 2026-09-23) — `tools/gateresults.mjs` (the key, the branch's reader and writer, revocation),
  `tools/gatetrace.mjs` (the tracer), `tools/gates.mjs` §2e (each unit's input set), §3b (key, reuse, trace) and §4b
  (the PASS records), the `gate-results` arm of `tools/pushguard.mjs`, and `.github/workflows/gates.yml`'s gate step;
  the suite `bio-plane/test/gateresults.test.mjs` and its control `gateresults.control.mjs`.** A unit whose key holds a
  PASS prints `REUSED <unit> <- results/…` and is not run; the D-293 run record carries a `reused` step naming each
  record. `--explain` prints every `KEY`. `node tools/gateresults.mjs revoke <unit> <hash> --reason "…"` revokes.
  **Decided here where the design was silent (M0-126's builder):**
  1. **The branch is CREATED by the first write**: a remote with no `gate-results` gets a ROOT commit, pushed without
     force; nothing ever deletes a ref or a file (a revocation is an added file). The results remote is `origin`, or
     `$BIO_GATE_RESULTS_REMOTE`.
  2. **The key hashes each input's CURRENT content** (the index's blob where the working file is unmodified, `git
     hash-object` otherwise), with the key version and the unit's name; so reuse works on a dirty tree, but a PASS is
     WRITTEN only under D-293's condition: the tree clean when the gate began and ended, and the same tree.
  3. **The input set (§2e; `gates.mjs --inputs <unit>` prints it)** is the MENTION rule read forward — closure,
     basename, quoted stem, walked directory, a unit's own directory walk — plus, each found by the trace over the
     whole estate (below): the IMPORT closure followed THROUGH runtime code (17 UI suites import plane modules); the
     mentions in a runtime module the unit imports directly (`skillpack`); every `docs/` path for a doc-facing unit
     (DOCS's own rule); for a plane or fleet unit, the plane's roots and shipped build, its foreign imports, every
     fleet member and `bio-plane/`'s own package/config files; the WHOLE tree for a unit whose own file, or a helper
     in at most three units' closures, walks the repository ROOT (`walk(REPO)`, `})(REPO)`, `{ repo = REPO }`), which
     no token names (`bounds`, `budget-sweep`, `case-opened` read 700–800 files their MENTION set missed; a SHARED
     helper that can walk the root is not taken as every importer's walk — that took 96 units to the whole tree over a
     median of 54 files read); every UI suite's inputs for a UI check over those suites (`check-mock-envelope`); and
     any `GATE: reads <path> <dir/> *` line in the unit's source or control — how an under-inclusion is FIXED when the
     derivation cannot see it (`status.test.mjs` carries `GATE: reads *`: it runs pushguard's checks over the tree).
     **Measured 2026-09-23 (`measurements/M-113.md`):** every unit of the estate run under the tracer: 346 of 347
     traced; the first derivation under-included 20 of them, the final one **0** (and 11 history readers, marked); input sets 3 to 1,032 files, median
     136. The same FULL gate run twice on one tree: 2,056 s running everything, then **488 s with 338 units REUSED** and
     only the 12 never-cached units and plancheck run.
  4. **History (BOB #30's ruling on condition 1, applied here):** a unit whose verdict reads this checkout's GIT HISTORY or
     a LIVE REF is never cached and carries `GATE: never-cache (history)`. The tracer ENFORCES it: a `git` child run over
     this checkout whose subcommand walks history or a remote (log, rev-list, merge-base, ls-remote, fetch, …), or whose
     arguments name a remote-tracking ref or a commit id, FAILS a cacheable unit by name (`HISTORY READ`) and writes no
     PASS; a git run in a fixture repository elsewhere does not count. The full traced gate of 2026-09-23 named eleven
     (`decided`, `migrate-released`, `mintid`, `op-claims`, `owed-controls`, `owed`, `readbudget`, `register-grammar`,
     `retirable`, `status`, `coverage`); each is marked, with `mergecarry` (named by the ruling). **Never-cache makes such
     a unit always RUN; it does not make its VERDICT depend only on the tree (§3).** `mergecarry`'s historical register
     read the live `origin/main` until M0-130 (2026-09-23): it now reads the merges reachable from `REGISTER_PIN`, a
     commit named with its why in `tools/mergecarry.mjs`, and a planted-ref arm proves the verdict is the same whatever
     `origin/main` holds; it stays never-cache (it reads history by commit id, and runs plancheck). And a REUSED record
     never answers for a never-cached unit: with the per-unit record on, §2d's tree-keyed GREEN shortcut is not taken,
     and a RERUN of what failed also runs every never-cached unit. The train's own tree-keyed reuse (M0-122's
     `recordedGreen`) was not changed here; M0-131 made it run every never-cached unit (§2).
     **Never cached** also covers a unit whose closure names `tools/plancheck.mjs`: it reads what plancheck reads (the
     whole tree and `origin/coord`); `ledger`, `mergecarry` and `pipeline-readers` traced 1,027–1,028 of 1,028 files
     that way. 12 units today, and the rule is coarse on purpose: `gates`, `train` and `gateresults` name the path only
     to plant a stub in a fixture, and still always run (about 70 s together).
  5. **The trace** (`NODE_OPTIONS=--import`, every node process of a step) records module loads and content reads
     (read/open/copy/cp, all forms). A battery step, even of one suite, attributes each process by its entry file
     (the runner is nobody's read); a UI suite, UI check or coverage step is its unit. A gate run inside a traced unit
     (a suite driving a fixture's gate) drops the outer tracer, and a fixture must drop `BIO_GATE_RESULTS*` too — found
     when this suite, run inside a real gate, wrote its fixture's records to the outer gate's results remote. A read of a path the tree held when the gate began, outside the unit's key, FAILS
     the unit by name, opens it in the D-293 record, and writes no PASS. A unit that left no trace (killed, or a child
     that dropped `NODE_OPTIONS`) gets no PASS. **Reach, stated:** reads by non-node children (git, workerd, a shell)
     — so `git show`/`git clone` of this repository, and `origin/coord` read through git — are invisible; directory
     listings are recorded and not judged; existence and stat checks are not seen.
  6. **Which units passed** is the battery verdict file's new `passed` list (never when the run's own finding, a leak
     or a shared log, stands), or a single-unit step's exit 0. A RED gate still records the PASSes of the units that
     passed, so a failure re-runs alone in every clone.
  7. **A FULL selection with any unit reused is recorded as class `FULLREUSE`**: it never clears a tree whole in
     `effectiveVerdict`, never satisfies the train's `--full` reuse or a release's GREEN FULL record. **The backstop
     mark (BOB #30's correction to condition 3):** every D-293 run record now says `backstop: true|false`, true only for
     a class-FULL run that REUSED NOTHING and used no `--since`, and the gate prints `BACKSTOP` or `NOT A BACKSTOP —
     <why>`; `pushguard.mjs` `isBackstop(run)` is the one reader — GREEN, class FULL, `backstop: true`, no `since`, and
     no `reused` step — so a run that reused ONE unit, a hand-edited record that still carries its reused step, and a
     record from before the field all read NOT a backstop. A FULL selection runs the UI harness unit by unit (each
     suite and check has its own result) while the record is on.
  8. **The backstop**: `--no-reuse` runs every selected unit and still records its passes — every release cut runs
     `gates.mjs --full --no-reuse`. `BIO_GATE_RESULTS=off` is the gate as it stood before (no key, no trace, no read,
     no write). The GitHub run on `main` now runs `--full` with the record off. **CONTRADICTION FOUND AT THE CODE:**
     until this landing that run gated the DERIVED class, and on `main` the derived diff (HEAD against `origin/main`,
     one commit) is empty, so it ran DOCS — the doc-facing suites only — not "everything" as the paragraph above says.
  9. **Append-only is enforced at the push**: the guard's `gate-results` arm (a push of that ref alone) passes only a
     commit that descends from the remote tip and ADDS `results/…` or `revoked/…` files; a modify, a stray path, a
     rewritten history or a deletion is refused by name. `main`'s checks do not judge it, as for `coord`.
  10. **The tree-keyed reuse stays as a local fast path** (§2d, M0-122's `recordedGreen`): it answers only for the
      CACHEABLE units — the train's reuse runs every never-cached unit on the union (M0-131, §2) — and is cheaper than keying; the per-unit record supersedes it as the shared
      mechanism. (Corrected at integration by CONDUCT #16 on BOB #30's order, 2026-09-23: "still correct" was not — a
      tree-identical reuse skips a unit that reads history, the 4355bfda class.)
  **Not built:** a concurrent-writer race driven in the suite (the writer re-fetches and re-applies on a rejected push,
  as `coord.mjs write` does, and the suite does not force the race); an automatic trigger that revokes a key when the
  backstop reads RED (a person runs `revoke`, naming the unit the backstop named); DIST's release step (`DIST.md`)
  still names `--since` as an alternative to the whole battery, which §3a's condition 3 now forbids — DIST's to change.

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
  recorded it: *"the line is 70%, not 60% — refresh less, work more"*). **RAISED TO 80% by Bob 2026-09-23** (*"I can't see a
  downside to increasing the context limit to 75% or 80% so as to extend session lifetimes"*; `CLAUDE.md` §4).
- **The rows:** M0-99 (`DECIDED.md` untracked, generated on demand; §1), M0-106 (DIST's release gate reuses a tree's
  GREEN record), M0-107 (a timeout reads NOT MEASURED, never a finding), M0-109 (the ledger suite's floor that the debt
  fold tripped), M0-100 (narrowed, §1; BUILT: `ORCHESTRATION.md` rule 3), M0-101 (superseded, §1), M0-114 (change 3, BUILT: §3 "As built"; it was
  unblocked by the first cloud session's full-gate figures, §4) and M0-116 (the gate's selection: one measurement appended re-ran 105 of 335
  units, 36 of them only because they import a scanner that names the file).
