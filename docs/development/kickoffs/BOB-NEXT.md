# BOB — resume here. Written 2026-09-19 by BOB #17 for the NEXT BOB, in the SAME Claude Code account.

Read `CLAUDE.md`, then `kickoffs/BOB.md`, then `docs/architecture/BIO_System_Design.md` (the construct map, whole),
then this. **Everything below is a POINTER measured at writing; re-measure before you act on it.**

## 0. WHERE THIS ACCOUNT IS, AND YOUR FIRST ACTS

The 2026-09-19 account switch is DONE and this is the account that develops. `kickoffs/NEW-MACHINE.md` describes it;
you do not need to redo any of it. The machine is Sparky-Air, the clone is FLAT at `/Users/sparky/Downloads/ClaudeCodeBIO`
(there is no `~/ClaudeCodeBIO` wrapper — NEW-MACHINE.md §4's layout is not what exists here), and the repo's own
committed `.claude/settings.json` is the EFFECTIVE one, so a stale checkout means stale permissions.

1. **Archive your predecessor** under D-398's three conditions, re-checked at the moment you act (`kickoffs/BOB.md`).
2. **Re-arm what dies with a session:** your self-wake (`CronCreate`, session-only, 7-day expiry) AND its ONE-SHOT
   5-day renewal. Mine were `eea6be14` (every 2h at :13) and `9a918a8b` (2026-09-24). **The CONDUCT heartbeat is a
   SCHEDULED TASK and survives me** — it is registered, enabled, cron `7,27,47 * * * *`, its body byte-identical to
   `docs/archive/conduct-heartbeat-SKILL-2026-09-19.md` (verified by sha256, not by eye). Its run-sessions
   self-archive; they do not accumulate as they did in the old account.
3. `node tools/owed.mjs BOB`, `plancheck`, `status.mjs --check`, and measure every live session with `get_usage`.

## 1. THE STATE AT HANDOFF — measured 2026-09-19, re-measure before resting anything on it

- **All four standing lanes are UP and working:** SCHEDULER #2, CONDUCT #7, DIST #2, FLEET #2, each started from its
  own `-NEXT.md` handoff, each with its self-wake and renewal armed. Contexts 15–30%, weekly usage 3%, 5-hour 6%.
- **Disk is the binding constraint, not the plan.** 8.8 GiB free at 96%, having fallen from 12 GiB in the first hour
  as four lanes took worktrees. The arithmetic is M-70: a worktree is 70 MB bare and ~644 MB installed, the three
  `node_modules` are 574 MB, each concurrent gate wants ~1 GiB. **It moved a GiB in thirty minutes — re-measure, never
  carry it.**
- **0.66.0 is DEPLOYED and live-verified** on biosmoke7 (plane + three members), bytes hash-identical to the signed
  asset, 260/260 suites, signature 7/7 with two positive arms beside five refusals, and the serving build proved by an
  error string absent from 0.65.0's bundle rather than by a version label. It rests in a SAFE state: `main`'s
  `release/` still reads 0.65.0, so no installer offers 0.66.0 to anyone. Only the `latest` pointer is unadvanced.

## 2. BOB'S OPEN CALLS — BOTH ARE HARNESS PERMISSIONS, NEITHER IS DESIGN

1. **CONDUCT #7 CANNOT `git push`, AND THIS IS THE ESTATE'S BIGGEST PROBLEM.** Refused by the Claude Code auto-mode
   classifier as `[Data Exfiltration]`; DIST was later refused too (`[Production Deploy]` for `HEAD:main`). It is the
   HARNESS's gate, not the repo's — no `ask` rule on push exists and `CLAUDE.md` §4 records that pushing is not gated.
   **What is measured:** BOB, SCHEDULER and FLEET pushed fine in the same window; CONDUCT never could; DIST could and
   then could not, mid-session. So it is neither per-session-static nor command-shape — CONDUCT ran the control, a
   plain named-branch push that writes nothing to `main`, and it was refused identically. The likely lever is that the
   committed settings declare `defaultMode: bypassPermissions` while the app launches sessions in `auto`, and it is the
   AUTO-MODE classifier refusing. **Only Bob can change it. No lane may push for another** — that launders a permission
   decision. Consequence while it holds: REC-151 is finished and cannot land, and CONDUCT is deliberately spawning NO
   workers, because a worker inherits the gate and would strand its branch.
   **The data loss is SMALL and was measured, so do not treat it as a countdown:** `git rev-list d03e08ea --not
   origin/main b69d7b26` = **3 commits**, only one carrying original non-merge content. All ten `rec-151:` commits are
   already on the remote branch ref at `b69d7b26`. It is a THROUGHPUT blocker.
2. **FLEET needs approval to delete 574 MB of `node_modules` in its own worktree** — its gate declined it. It offers
   14 seconds to reinstall. Smaller, and unblocked by nothing else.

## 3. THIS LANE'S OWED WORK, in order

0. **Three design rows routed here by SCHEDULER's LED-7 fold and NOT started** — these are real design acts, not
   rulings, and each needs its own sitting:
   - **D-55** (DOCTRINE, Bob already ruled): a rendered capture may carry content whose authority is not the hosting
     site, and `capture.authority` holds exactly ONE value. Attribution must be per-origin and sub-document, a shape
     the register has never held. **Precondition for treating any rendered capture as evidence.** Blocks D-64 and
     `CLIENT-RENDERED.md`.
   - **D-80** (Bob ruled: contradiction is to FIND, not prevent): what remains is detecting CONTACT between
     aspirations, never contradiction — judging whether two prose commitments contradict would violate invariant 5.
     Relates to 8.contradiction and to §3 item 2 below.
   - **D-126**: ~30 notification generators, no catalogue, no classes, no item contract. **D-52's channel question is
     a SUB-QUESTION of this one** — ruling them apart invents the thirty-first ad-hoc wording. Sequence together at M7.
1. **BOB #16's list, untouched by me:** field counts of process failures per lane against a 2026-09-18 baseline that
   does not exist (defining it is the first act); PRESENT and RESOLVE for contradiction after IDENTIFY's measurement;
   `RECORD.md` (32 KB) and `CONTENT-PDF.md` (26 KB) over budget — their OWNERS cut them; use the corrected exam
   instrument (M-65); the checks that suites read BY NAME.
2. **`VERIFICATION.md` has 45 bytes of headroom** against its 24,576 B budget. Anything you add there must be paid for
   by a cut. That is why D-325's ruling went into `CLAUDE.md` §5 instead — see §4.

## 4. WHAT BOB #17 DECIDED (each folded into its home document; `decided.mjs` finds them)

- **TASK stays gated** — the "a minted id carries no count" set is the PREDICATE ("every prefix whose objects a read
  withholds from some caller"), not the four-name list. REC-151's worker followed the rule rather than widening it;
  the lag was the document's. Membership v2 §7. The set is PROJ, CASE, DRAFT, RVG, TASK.
- **D-325 — discipline-plus-witness is SUFFICIENT, and the rule is stronger than the row asked for.** `scopeFor`
  confines only `probe`, but honours `store=scratch` from ANY class, so the self-binding already existed PER CALL and
  nothing REQUIRED it. A live verification now NAMES `store=scratch` on every call; the record's counters before and
  after each arm are the detector. Written into `CLAUDE.md` §5, where the false assumption actually lived — NOT
  `VERIFICATION.md` as the row said. **RESIDUE, open:** no credential can be bound to scratch for life; a sticky
  confinement is RECORD's ground and is not built. The row stays OPEN — `ledger.mjs` refuses to archive a row with
  residue, and it is right.
- **D-52 — NARROWED, not closed.** No notification channel exists anywhere (verified at the code). §8.1 no longer
  reads as a description of behaviour. The CHANNEL is Bob's, at M7, with D-126.
- **D-136 — the missing session reach is an OMISSION, and the fix is NAMED (so it is placeable).** `adminendorse` and
  `adminremove` are bearer-only and `by` is server-stamped only for `PROJECT_ACTIONS`, so the one path that can cast a
  §4.7 governance vote is the path where THE CALLER NAMES THE VOTER. D-421's class. **The fix is ONE item:** stamp `by`
  from the session AND grant session reach in the same landing — either alone is worse than neither. Membership v2 §4.7.
- **D-134 ordered BEHIND D-136**, not beside it: a surface over an unfenced act is a second path to it.
- **IC-55 / D-262 — the plane must distinguish THREE sentences, not two:** *this verb is not for a person* is a design
  claim, sayable only where such a decision exists; *your credential does not reach this verb* is a fact; and for an
  OMISSION, neither — state the fact, invent no rationale. A false rationale SUPPRESSES ITS OWN BUG REPORT.
- **M0-78 and D-270 placements CONFIRMED** ahead of features. "M0 last" governs M0 BUILD items, never a live defect in
  the verification substrate. `preflight()` in `armdecay.mjs` validates an arm by counting ITS OWN QUOTE in the target
  file, so it proves the ANCHOR and can never prove the FIXTURE runs — the census built to catch dead arms is blind to
  this class BY CONSTRUCTION, so the population size is unknown.
- **The area's LAW or its `-NEXT` is a CHANNEL CHOICE** (ORCHESTRATION.md, "COMMUNICATING A CHANGE"): a `-NEXT` is
  consumed once by one successor; `<AREA>.md` is read in full by every session that ever holds the lane. FLEET taught
  me this by correcting me.
- **M-70** — the disk at the account switch, and the content verdict clearing `plancheck`'s three stranded branches.

## 5. HOW I WAS WRONG — each caught by someone else or by an instrument

- **I read a background task's "exit code 0" as the gate's verdict. The gate was RED.** The 0 was my own trailing
  `echo` in a compound command. This is `CLAUDE.md` §7's wrapper trap arriving in a new costume: **read the completion
  line (`N/N suites green`) and `gates: GREEN`, never a wrapper's status.**
- **I stated "npm ci is installed" as a fact about the machine in four lane chips.** I had measured the MAIN CHECKOUT;
  every lane gets a fresh worktree where it is absent. True of the wrong unit. DIST caught it.
- **I told FLEET to put durable lessons in its handoff.** Wrong: the law is read every time, a handoff once. FLEET
  corrected me and the correction is now ORCHESTRATION.md's rule.
- **I hypothesised the push refusal was command-shape.** CONDUCT's control refuted it cleanly.
- **I told CONDUCT to "rebase before your gate."** Wrong twice: never change the tree mid-gate, and CONDUCT integrates
  by MERGING, never rebasing, because a rebase over a merge flattens it.
- **I tried to archive D-325 while its disposition declared residue.** `ledger.mjs` refused. The tool was right.
- **The wrong-unit error is this estate's most repeated defect and I hit it twice in one day** — once on stranded
  branches (commit COUNT standing in for REACHABILITY) and once on D-325 (whether an instrument CAN bind itself versus
  whether anything REQUIRES it). Ask what unit the question is about before answering it.
