# WORKER — the standing brief. Every spawned worker reads this FIRST.

**Why this file exists — a measured failure, not tidiness.** CONDUCT hand-carried these
practices into every spawn brief, ~2,000 words each. That made spawning expensive and
integration look cheap, so CONDUCT ran one or two workers against a budget of eight —
**caught by Bob four separate times, fixed four times with a RULE, and regressed every
time.** A rule cannot beat arithmetic. The practices live here; a spawn brief is now the
ITEM and nothing else.

**If your brief contradicts this file, your brief wins** — it knows your item. If your
brief is silent, this file governs.

## Read the design before the code (added 2026-09-14 — `CORPUS-STANDARD.md` §4.7)

Your row names the governed design document and section that is your scope's authority
(for example `BIO_Content_Framework_v0_10.md` Part II §18 and an IC). **Read that section
first, then the code.** Its front matter — Status, Place in the system, Incomplete sections —
tells you how complete the design is and what it already admits it lacks. If the code and the
design disagree, the document's Status says which is the authority; do not resolve the
disagreement silently in either direction. If you find a gap in the design, say so in your
REPORT under a heading `DESIGN GAP:` naming the document and section — CONDUCT folds it into
the document's Incomplete sections at integration. If the section your row names does not
exist, stop and report that before building anything: a row with no design is the failure this
rule exists to catch.

## TO WAIT FOR A QUIET MACHINE, RUN `node tools/waitquiet.mjs`. DO NOT WRITE THE LOOP.

```
node tools/waitquiet.mjs                  # wait, bounded, then measure
node tools/waitquiet.mjs --check          # answer once: 0 quiet, 1 busy
```

Up to eight workers share this machine, so an uncontended figure sometimes needs a wait. **Do not
hand-roll it.** On 2026-08-09 three workers sat in

```
until ! pgrep -f "scripts/battery.mjs"; do sleep 10; done      # DEADLOCKS. ALWAYS.
```

**forever.** `pgrep -f` matches the FULL COMMAND LINE, and the waiter's own command line contains
the string it searches for — so each loop found itself, slept, and found itself again. The three
also matched each other, which made the count look like real work. **No battery was running at
all**; `workerd` was at zero. They spun for hours after their item had already merged, and nothing
noticed, because **a wait that cannot fail is indistinguishable from one that has not finished.**

**This is a COMMAND rather than a warning because the warning was already tried.** This file
records the vigilance fix failing for `git stash` and for id allocation; what worked both times
was a tool. The tool matches **positionally** — the executable must BE `node` and argv[1] must BE
the battery path — so a shell that merely mentions the string cannot satisfy it. It is bounded,
and on timeout it exits 2 naming what it was still seeing.

**If you ever do write a wait of your own, its negative control is one command: run the predicate
once with nothing running.** If it still matches, it will never release you. That control is the
one nobody ran — and it is worth knowing that `waitquiet`'s own first draft failed it twice, once
by anchoring a regex that `ps`'s output never matches, and once because its "don't match another
waiter" line was itself a substring test that swallowed the fixture. Both were caught by the
over-strictness arm, in the direction that releases a wait too early.

**A WAIT ENDS WHEN THE WORLD SAYS DONE, NEVER ONLY WHEN A SIGNAL SAYS SO — and "waiting" is
not a state a worker may rest in** (2026-09-10: a CASE-4 worker's output was fully landed and
integrated while the worker sat "waiting for the battery to complete" on a machine with ZERO
battery, workerd or miniflare processes — the run had finished, the completion signal was
missed or already consumed, and nothing would ever arrive to wake it). Three rules, each the
incident's own shape inverted:

1. **Launch a long run so its EXIT is your signal** — foreground, or backgrounded through the
   harness so completion re-invokes you. Never "start it and wait to hear."
2. **Any hand-rolled wait is BOUNDED, and at every poll and at its timeout it checks the
   PROCESS, not the signal**: no battery/workerd process means the wait is OVER — read the
   result from what the run wrote (the suite output, the exit file, git state) rather than
   waiting longer. An absent process is a completed wait wearing silence.
3. **A worker is either RUNNING A TOOL or DONE AND SAYING SO.** Ending a turn with "waiting
   for X" and no pending tool call is a hang with a status message, not a state — if there is
   nothing left to run, verify, report, and EXIT, and let CONDUCT reap the worktree.

## Your environment

- Your worktree may arrive **without `bio-plane/node_modules`**. If a battery reports ~14
  green with a hundred `ERR_MODULE_NOT_FOUND`, run `npm ci` in `bio-plane/`. Read every
  exit status **unpiped** — a pre-install run once reported `exit 0` THROUGH `tail` while
  104 suites failed.
- Your worktree may be **one merge behind `main`**. Check, and fast-forward before you
  measure anything.
- **DO NOT USE `git stash`.** `refs/stash` is repository-wide across all sixty checkouts,
  so `stash@{0}` means *what any of the sixty pushed last*, and `push -u` carries untracked
  files. That is how one worker's untracked suite was materialised into another's tree and
  **counted into its baseline**. Need a clean tree? `git worktree add` a scratch checkout.
- **The shared scratchpad is NOT isolated between sessions** — two workers reported it
  independently. Keep every harness and scratch file **inside your own worktree**.
- **PUSH YOUR OWN BRANCH. Do not merge, and never push to `main`.** CONDUCT integrates; you make
  your work SURVIVE. CORRECTED 2026-09-16 (D-288, ruled by BOB #12) — this line read *do not push*
  for five weeks and that is the instruction that strands the work: `CLAUDE.md`'s rule is that a
  change is made when it is COMMITTED AND PUSHED, `plancheck` enforces it for `main` and for the
  planning surfaces, and NOTHING enforced it for a worker branch — which is where your item's code
  sits between your report and CONDUCT's merge. **The receipt: REC-91 finished, committed and
  released on its branch on 2026-09-15; its integrator was stood down before merging; the work
  reached nobody and sat on one disk until somebody went to that physical machine to get it.**
  You are the only actor GUARANTEED to be alive at the moment your commits exist, so the push is
  yours. **Since M0-111 (TREE-SHARING §2) the push is to a LANDING REF:**
  `git push origin HEAD:refs/heads/land/worker/<your row id>` — never force, never to `main`. CONDUCT's train
  (`tools/train.mjs`) merges every `land/*` branch in one integration branch with one gate; the push guard REFUSES a
  push to `main` by name. A branch the train RETURNS (a conflict, or RED) comes back to you by name: rebase it on
  `origin/main` and push the same ref again.

## Measurement

- **MEASURE YOUR OWN BASELINE AND TRUST IT OVER YOUR BRIEF.** Twelve items found a briefed
  figure stale by measuring it; several then found theirs exactly right and **said so** — the
  practice is to trust the measurement, not the streak. Report either way.
- **Attribute your delta PER SUITE by re-running the true baseline**, never by subtraction.
- **A vendor's documentation is a CLAIM, not a measurement**, and gets labelled as theirs.
- **An equality or outcome that costs nothing to produce is not evidence.** A hand copy
  agrees for free — measured five times, including a complete hand copy of 131 op names
  that passed.
- **A corpus figure is not stable while a battery runs against the same checkout** (116 vs
  118, measured). Take instrument figures on a quiet tree.

## Negative controls

- **Break what you tested and confirm the suite fails.** Each arm **ALONE**, others held
  open. **Declare before arming what MUST fail and what MUST NOT.**
- Always include an **over-strictness arm**: correct work in a spelling you did not
  anticipate must PASS.
- **Verify every restore by sha256 AND by content (`cmp`)**, against **uniquely-named
  per-arm** pristine copies, printing a byte count and guarding a minimum.
- **A surprising green is a finding about your ARM. Record it; do not smooth it.**

**Controls here find the instrument wrong more often than the subject. Real receipts:**

- A `TypeError` inside an assertion **goes through no assertion at all** — it ends the
  module while the tally reads clean. **Check your suite reached its own FOOT before
  believing any count**, and report a missing tally as `-1`, never `0`.
- Two harnesses reported a restore byte-identical **over an EMPTY manifest**, caught only
  because a digest read `e3b0c442…`, the sha256 of the empty string.
- Arms that **NEVER ARMED** (patch matched zero times; anchor occurred twice; wrote to a
  path a worktree's gitdir lacks). *An arm that did not arm is a finding.*
- Arms that **could never have been honoured** (a field set on objects the code rebuilds).
- **Headline totality assertions that PASSED OVER AN EMPTY CORPUS — three times.** Assert
  your fixture is non-empty, print your corpus, and floor it.
- A harness whose first run reported `null` for **every arm including the BASELINE** —
  only the baseline row distinguished six-arms-broken from six-arms-working. **Have one.**
- A revert that was **behaviourally invisible** because a transform was idempotent; only a
  structural pin could see it.
- A **sweep arm that failed by citing itself**, and a check that caught **its own
  correction** because the correction quoted the token it was correcting.

## Sweep for the class

**Never fix only what was reported.** Ask what KIND the defect is and find every instance.
**Print your corpus size and reach**, and **state plainly what your matcher can and cannot
see** — that sentence is load-bearing and is what lets the next reader tell a clean result
from a walk looking in the wrong place.

**Distinguish a defect from a deliberate closure.** Two sweeps earned their trust by
finding sites that were the same class **closed on purpose** and saying so.

**Invert, do not lengthen a list.** A classifier grading one literal hid 27 ops and read as
a complete sweep. Ask what makes something recognisable *in principle*; a list of spellings
goes stale the moment a fourth is written. **And print what you could not classify** — a
thing the matcher does not understand must be NAMED, never silently scored zero.

## The record's rules

- **Undetermined is first-class and must be STATED.** Never invent an attribution to pass a
  gate; a gate that pressures you into one is a bug in the gate.
- **A defect that makes the record claim more than it can support is worse than a missing
  feature**, and much worse than an ugly one.
- **Correct superseded tests, never exempt them.** Say in a comment why the old one was
  wrong. An exempted test is a rule nobody is enforcing and nobody remembers deleting.
- **Test through the op.** A store-level test and a passing battery are not evidence a
  caller can reach the feature — `op=invitelook` shipped with a ReferenceError while 1,276
  assertions passed.
- **A mechanism believed on the strength of its EXISTENCE rather than its behaviour is the
  defect this project meets most.** Eleven fences that did not fire; ten of twelve acts
  going all the way through; a documented branch that could not be reached; a comment
  describing a constraint nothing enforced. **Drive it.**
- **A fence tighter than its rule is not a safer fence** — it is an undeclared interface
  change wearing the costume of caution.

## DEC-49 and the floors

- Every refusable condition carries a **code with a canned translation**, the code a
  **STRING LITERAL** at its site through a helper named `refusal`. A code in a variable is
  invisible to the guard, and one shipped `translation: undefined` to a member that way.
- A row's `where` names **the SMALLEST SPAN** — a REGION between
  `DEC-49 REGION <name>` / `END DEC-49 REGION <name>` markers, **never a whole function**.
- **MOVE EVERY FLOOR YOU INVALIDATE IN THE SAME TURN, from the figures the instrument
  PRINTED** — never by adding to the number in the file. Five consecutive items found a
  floor already stale by measuring it; one sat 19 codes low and **had already flipped a
  control from RED to GREEN**.
- **A ceiling is not a ratchet, and a floor with slack is not one either.**
- **A floor that FALLS needs its reason at the site**: one falling because an instrument
  stopped double-counting is not slack; one falling for any other reason is.
- **`regionLines` is a property of the MERGED source** and has moved at integration five
  times. If you touch a governed region, **say so in your report** and CONDUCT re-reads it.
- **`REGISTER_FLOOR` in `bio-plane/scripts/coverage.mjs` has ONE key set on purpose.**
  Keep-both merges left duplicate `arms:` keys there **six times** — valid JavaScript where
  the last silently wins, and once the last was the lowest. **If you conflict there,
  COLLAPSE TO ONE SET and re-read the printed figures.**
- **`_CHECKS` is a RESERVED SUFFIX** — the DEC-49 guard harvests every `/_CHECKS$/` export
  as a refusal family, and a table named that way grew a ratchet's floor falsely.

## Ids

**Take every new id with `node tools/mintid.mjs <NS>`** (C, D, DEC, IC, REC, UI, CPDF, FL,
PL, SK, M0, …). **Seven items collided on an id in one day, every one having measured the
number free and every one right when it looked** — the convention was the defect, and the
vigilance fix was already tried. **Since D-242 (2026-09-24) a take is a compare-and-swap push of `ids/<NS>.tsv` to
`origin/coord`**, because every worker is its own cloud clone and a clone-local lock was exclusive against nothing
(IC-222 and IC-231 were each minted three times on 2026-09-23). So a take NEEDS the network: when it cannot push it
REFUSES and hands out nothing — report that, never fall back to reading the file and adding one. **Never write a worked example naming "the next free
number" into a corpus file**; the tool caught its own debt row poisoning its own floor.

## Boundaries

- **Claim your paths in `docs/development/CLAIMS.md` BEFORE editing.** It lives on the branch `coord` (M0-110): append
  the block with `node tools/coord.mjs write -m "<why>" --append docs/development/CLAIMS.md <file>`, and later add its
  `released:` line INTO that block with `--line docs/development/CLAIMS.md "<its heading>" <file>` — never a commit.
- **Do not edit another area's paths.** Append a DELEGATION and continue.
- **A DELEGATION YOU RAISE CARRIES ITS STATE ON A LINE OF ITS OWN, DATED, OR `plancheck`
  FAILS (M0-37, 2026-09-16).** Write `**open as of YYYY-MM-DD** — <why it is open>` under the
  block when you raise it. That is one line and it costs you nothing, and it is the whole
  difference between a register that accumulates and one that is re-affirmed: **until this
  landed, a block carried only the date it was RAISED on, so 38 of the 49 blocks in
  `CLAIMS.md` said nothing about their own state — and adjudicating them found 21 already
  CLOSED IN THE TREE and saying so nowhere.** If your own landing closes somebody else's
  delegation, write the discharge **in that block**, not in your claim or your report: this
  file has held a discharge written 2,415 lines away from the delegation it closed, which
  reads as open to everyone who goes and looks.
- **Never leave an owed act in a release note, a claim's prose, or your report alone**
  (added 2026-09-14; FL-10's handoff line sat in a release note nothing drains and cost
  a measured >3h false stall). If your landing obliges a future actor to do something —
  flip a row, resolve an IC, run a follow-up — it goes in a DELEGATION or your report's
  own "for CONDUCT" list, stated as an ACT with its actor, and you name it even if it
  feels implied. A note is not an item, and a note in a region nothing drains is not
  even a note.
- **Do not deploy, do not bump a version, do not cut a tag** — that is DIST's.
  `newgroup/**` is out of bounds without an explicit instruction.
- **Never block on Bob.** Ship a provisional and record the decision in the shape
  `kickoffs/README.md` defines: what runs provisionally, why it was ambiguous, the
  alternative, your recommendation, what reversing it costs.
- **If you change a shape another area builds against**, file the IC as its own
  file, `docs/development/interface-changes/<id>.md` (M0-100; a figure likewise goes in
  `measurements/<id>.md`), with **measured** consumer impact. **CONDUCT takes the version
  bump and the RESOLUTION.**

## Before you finish

0. **IF YOU TOUCHED ANYTHING UNDER `bio-plane/src/`, REBUILD THE BUNDLE FIRST: `cd bio-plane && npm run build`.** The
   committed `dist/bio-plane.bundled.mjs` is a TRACKED ARTIFACT and `FL-10`'s freshness guard fires when it does not
   match `src/`. **This step is owed by every `src/`-touching worker, it was in NO kickoff until 2026-09-18, and THREE
   CONSECUTIVE `RECORD` ITEMS EACH DISCOVERED IT FROM A RED SUITE** — REC-119 counted them and said the remedy is a
   process change rather than a better warning, which is what this line is. Rebuild BEFORE the battery, because the
   guard is what turns red and the failure names the artifact rather than your change.
   **A COMMENT-ONLY `src/` CHANGE IS THE EXCEPTION AND IT IS MEASURED, NOT ASSUMED: the bundler STRIPS COMMENTS, so the
   emitted bundle is BYTE-IDENTICAL while the manifest's INPUT RECORD still moves** (REC-110 measured both, twice). Rebuild
   anyway — but there is no diff to hunt in `bundled.mjs` after a comment-only change, and a session expecting
   one chases a build problem that does not exist.

0b. **EDITED A GOVERNED DESIGN DOC** (`docs/architecture/*`, or `docs/development/*` with front matter)?
   Move its Status `as of` to today and run `node tools/corpuscheck.mjs` to **0 fail** BEFORE the gate
   — `--write <file>` regenerates a Contents. The gate runs it, and a stale `as of` goes RED once the
   battery has cost you the round (M0-141).

1. `cd bio-plane && npm run test:battery` — the WHOLE battery, green.
2. `node scripts/coverage.mjs --strict` — run **DIRECTLY**, `$?` read **UNPIPED**, exit 0.
3. `node civicos-ui/test/run.mjs` — **from the REPO ROOT**, exit read UNPIPED, 0. Run it even
   if you believe you did not touch the UI: CONDUCT once pushed `main` with it red at 32
   failures, and twice a fixture drawing a value at runtime was refused by a plane check that
   did not exist when the fixture was written.
4. `node tools/plancheck.mjs` — clean but for UNPUSHED. It also refuses an unresolved merge
   marker anywhere in the tree.
5. Commit, **then PUSH** — `git push origin HEAD:refs/heads/land/worker/<your row id>` (the rule, and
   why, under "Your environment"). Then VERIFY it arrived by asking the REMOTE, not your tree:
   `git ls-remote --heads origin land/worker/<your row id>` must answer with the sha you just
   committed. An unverified push is a claim, and this project has paid for that distinction (D-288).

## Report back

Your final text **is the return value**, not a message to a human. Give CONDUCT: **your PUSHED
branch name and its sha, read back from `git ls-remote` and not from your tree** (D-288 — a report
naming a branch nobody else can fetch is worse than no report); what landed and where; the numbers (baseline, final, per-suite attribution, coverage, UI
harness, every floor moved); **every control arm with its declared and actual result,
including the ones that came back wrong**; what the class sweep found and **what it could
not see**; what your brief did not predict; every delegation; any decision for Bob.

**State plainly what you could NOT do.** A partial item reported honestly is worth more
than a complete one reported loosely, and a narrowed unknown is a legitimate result.

## A LOG FILE UNDER `/tmp` WITH A GENERIC NAME IS NOT YOURS.

**Measured 2026-09-15 by the REC-98 worker; recorded here because it cost real time and would
have cost a false bug report.** A battery redirected to `/tmp/final-battery.log` came back
**198/202 with four suites FAILED — all four of which pass alone at exit 0.**

**It was another session's run.** `/tmp` is shared across every worktree and every session on
this machine, a generic filename collides, and the second writer wins. The log that came back
was a real battery, honestly reported, of a tree that was not this worker's: its `provenance:`
line named a DIFFERENT HEAD and listed a suite that has never existed in that worktree.

**What makes this dangerous rather than merely annoying is that it looked exactly like damage
the worker had done.** All four named suites are repository readers, and a worker that has just
edited repository prose has every reason to believe it broke them. The obvious next move — start
bisecting your own change — is wasted work against a subject that was never yours.

**The practice, and it is two lines.** Write run logs into YOUR OWN WORKTREE or into a path
carrying your worktree's name, never a bare `/tmp/<generic>.log`. And **before you believe any
figure you did not watch print, read the log's `provenance:` line and check the HEAD against
your own** — the line exists for exactly this, and it is the only discriminator, because the
contents of a foreign battery are indistinguishable from the contents of yours.

**The general form, this project's oldest shape in new clothes:** a shared, unqualified name is
an identity nobody owns, so two different facts arrive under it and nothing fails loudly. Ask
what the figure is a figure OF before you ask what it means.

## KILL BY PID, OR BY THE PROCESS GROUP YOU STARTED — NEVER BY A MACHINE-WIDE PATTERN.

**Reported by the REC-105 worker against itself, 2026-09-15, with ~six batteries live.**
It ran `pkill -f "scripts/battery.mjs"` to stop ONE stale run of its own. **That pattern does not
know whose battery it is.** Every worker here runs exactly that script, and the machine read
QUIET immediately afterwards.

**The practice is one line: read the process table, take the PID you mean, kill that.** Or kill
the process group you started. **`pkill -f` matches across every worktree and every session and
is never the right tool here** — the same reasoning as *kill the tree, not the leaf* in
`kickoffs/CONDUCT.md`, one scope out: that rule is about killing too little, this about far too much.

**WHAT MAKES IT WORTH A SECTION RATHER THAN A WARNING IS THAT THE VICTIM CANNOT TELL.** A battery
killed mid-run does not report a kill. **A compound command reports the WRAPPER's status — so a
`&&` chain prints exit 0 over a battery that died at suite 165 of 205 with zero failures**, and
a truncated run containing no failures is indistinguishable from a green one. The M0-38 worker
caught exactly this **only because it read the battery's own `BATTERY EXIT=143` line instead of
the wrapper's.** **Read the battery's own completion line and its own exit, never the wrapper's**,
and if a run ends without its completion line, it did not finish no matter what the shell said.

**If you kill something on a shared machine, SAY SO in your report and name the window.** REC-105
did, and named three worktrees as candidates rather than as attribution — which is what let those
runs be checked instead of trusted. **A kill you do not report is indistinguishable from a
mysterious failure in somebody else's item.**

## A FAILED SEARCH CAN RETURN ITS OWN ERROR TEXT AS MATCHES.

**Measured by BOB #11, 2026-09-15, checking its own logs for the kill signature above.** A shell
regex the local `grep` could not compile produced **five "matches" that were the tool's own error
output** — a false positive that reads exactly like a finding, in a search run to establish that
something was ABSENT. Re-run properly it returned a clean zero.

**So a search is an instrument and gets the same treatment as one: check that it COMPILED before
you believe what it found, and be most suspicious when a search for absence comes back with
hits.** This is the *break only the thing you are testing* rule arriving in the SEARCH rather
than in the control, and it is worse there, because nobody declares a control arm for a `grep`.
