# WORKER — the standing brief. Every spawned worker reads this FIRST.

**Why this file exists, and it is a measured failure rather than tidiness.** CONDUCT
hand-carried these practices into every spawn brief, ~2,000 words each. That made
spawning expensive and integration look cheap by comparison, so CONDUCT repeatedly ran
one or two workers against a budget of eight — **caught by Bob four separate times, fixed
four times with a RULE, and regressed every time.** A rule cannot beat arithmetic. The
practices live here; a spawn brief is now the ITEM and nothing else.

**If your brief contradicts this file, your brief wins** — it knows your item. If your
brief is silent, this file governs.

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
- **Do not push. Do not merge.** CONDUCT integrates.

## Measurement

- **MEASURE YOUR OWN BASELINE AND TRUST IT OVER YOUR BRIEF.** Twelve items found a briefed
  figure stale by measuring it; several then found theirs exactly right and **said so** —
  because the practice is to trust the measurement, not the streak. Report either way.
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
vigilance fix was already tried. **Never write a worked example naming "the next free
number" into a corpus file**; the tool caught its own debt row poisoning its own floor.

## Boundaries

- **Claim your paths in `docs/development/CLAIMS.md` BEFORE editing.**
- **Do not edit another area's paths.** Append a DELEGATION and continue.
- **Do not deploy, do not bump a version, do not cut a tag** — that is DIST's.
  `newgroup/**` is out of bounds without an explicit instruction.
- **Never block on Bob.** Ship a provisional and record the decision in the shape
  `kickoffs/README.md` defines: what runs provisionally, why it was ambiguous, the
  alternative, your recommendation, what reversing it costs.
- **If you change a shape another area builds against**, file the IC row in
  `INTERFACE-CHANGES.md` with **measured** consumer impact. **CONDUCT takes the version
  bump and the RESOLUTION.**

## Before you finish

1. `cd bio-plane && npm run test:battery` — the WHOLE battery, green.
2. `node scripts/coverage.mjs --strict` — run **DIRECTLY**, `$?` read **UNPIPED**, exit 0.
3. `node civicos-ui/test/run.mjs` — **from the REPO ROOT**, exit read UNPIPED, 0. Run it
   even if you believe you did not touch the UI: CONDUCT once pushed `main` with it red at
   32 failures, and twice a fixture drawing a value at runtime was refused by a plane check
   that did not exist when the fixture was written.
4. `node tools/plancheck.mjs` — clean but for UNPUSHED. It also refuses an unresolved merge
   marker anywhere in the tree.
5. Commit on your branch. **Do NOT push, do NOT merge.**

## Report back

Your final text **is the return value**, not a message to a human. Give CONDUCT: what
landed and where; the numbers (baseline, final, per-suite attribution, coverage, UI
harness, every floor moved); **every control arm with its declared and actual result,
including the ones that came back wrong**; what the class sweep found and **what it could
not see**; what your brief did not predict; every delegation; any decision for Bob.

**State plainly what you could NOT do.** A partial item reported honestly is worth more
than a complete one reported loosely, and a narrowed unknown is a legitimate result.
