# BOB — resume here. Written 2026-09-19 by BOB #17 for the NEXT BOB, in the SAME Claude Code account.

Read `CLAUDE.md`, then `kickoffs/BOB.md`, then `docs/architecture/BIO_System_Design.md` (the construct map, whole),
then this. **Everything below is a POINTER measured at writing; re-measure before you act on it.**

## 0. WHERE THIS ACCOUNT IS, AND YOUR FIRST ACTS

The 2026-09-19 account switch is DONE and this is the account that develops; `kickoffs/NEW-MACHINE.md` describes it and
none of it needs redoing. Machine Sparky-Air; the clone is FLAT at `/Users/sparky/Downloads/ClaudeCodeBIO` (NEW-MACHINE
§4's wrapper does not exist here), so the repo's own committed `.claude/settings.json` IS the effective one — a stale
checkout means stale permissions.

1. **Archive your predecessor** under D-398's three conditions, re-checked at the moment you act (`kickoffs/BOB.md`).
2. **Re-arm what dies with a session:** your self-wake (`CronCreate`, 7-day expiry) AND its ONE-SHOT 5-day renewal. Mine were `eea6be14` (every 2h at :13) and `9a918a8b` (2026-09-24). **The CONDUCT heartbeat is a
   SCHEDULED TASK and survives me** — it is registered, enabled, cron `7,27,47 * * * *`, its body byte-identical to
   `docs/archive/conduct-heartbeat-SKILL-2026-09-19.md` (verified by sha256, not by eye). Its run-sessions
   self-archive; they do not accumulate as they did in the old account.
3. `owed.mjs BOB`, `plancheck`, `status.mjs --check`; measure every live session with `get_usage`.

## 1. THE STATE AT HANDOFF — measured 2026-09-19, re-measure before resting anything on it

- **All four standing lanes are UP and working:** SCHEDULER #2, CONDUCT #7, DIST #2, FLEET #2, each started from its
  own `-NEXT.md` handoff, each with its self-wake and renewal armed. Contexts 15–30%, weekly usage 3%, 5-hour 6%.
- **Disk is the binding constraint, not the plan.** 8.8 GiB free at 96%, having fallen from 12 GiB in the first hour
  as four lanes took worktrees. The arithmetic is M-70: a worktree is 70 MB bare and ~644 MB installed, the three
  `node_modules` are 574 MB, each concurrent gate wants ~1 GiB. **It moved a GiB in thirty minutes — re-measure, never
  carry it.**
- **0.66.0 is DEPLOYED and live-verified** on biosmoke7 (plane + three members), the serving build proved by an error
  string absent from 0.65.0's bundle rather than by a version label. SAFE state: `main`'s `release/` still reads
  0.65.0, so no installer offers 0.66.0 to anyone; only the `latest` pointer is unadvanced. `DIST-NEXT.md` is its
  authority.

## 2. BOB'S OPEN CALLS — BOTH ARE HARNESS PERMISSIONS, NEITHER IS DESIGN

1. **CONDUCT #7 CANNOT `git push` — THE ESTATE'S BIGGEST PROBLEM.** Refused by the Claude Code AUTO-MODE classifier
   (`[Data Exfiltration]`; DIST later got `[Production Deploy]` for `HEAD:main`). The HARNESS's gate, not the repo's:
   no `ask` rule on push exists and `CLAUDE.md` §4 says pushing is not gated. **Measured:** BOB, SCHEDULER and FLEET
   pushed fine in the same window; CONDUCT never could; DIST could, then could not, mid-session — so neither
   per-session-static nor command-shape (CONDUCT's control was a plain named-branch push writing nothing to `main`,
   refused identically). Likely lever: the committed settings declare `defaultMode: bypassPermissions` while the app
   launches sessions in `auto`. **Only Bob can change it; no lane may push for another** — that launders a permission
   decision. While it holds, REC-151 cannot land and CONDUCT spawns NO workers, since a worker inherits the gate.
   **The data loss is SMALL and measured — not a countdown:** `git rev-list d03e08ea --not origin/main b69d7b26` = **3
   commits**, one with original non-merge content; all ten `rec-151:` commits are already on the remote at `b69d7b26`.
   It is a THROUGHPUT blocker.
2. **FLEET needs approval to delete 574 MB of `node_modules` in its own worktree** — its gate declined it. It offers
   14 seconds to reinstall. Smaller, and unblocked by nothing else.

## 3. THIS LANE'S OWED WORK, in order

0. **Three design rows routed here by SCHEDULER's LED-7 fold and NOT started** — these are real design acts, not
   rulings, and each needs its own sitting:
   - **D-55** (DOCTRINE, Bob ruled) — **NARROWED at the schema; read the row, not its headline.** The precondition
     stands; the premise does not. The register already holds per-origin (`site_assets.host`/`address`), the join
     (`site_asset_refs` keyed `(host, address_norm, primary_sha)`) and sub-document grain (`content`, eight extents),
     so no new register shape is owed — only an AUTHORITY VALUE at that grain and the rule that third-party bytes take
     that origin's authority. **The link I did NOT trace, which the design checks first:** whether a content row can
     be minted over subresource bytes and joins to `site_asset_refs`. If not, that join IS the item.
   - **D-80** (Bob ruled: contradiction is to FIND, not prevent): what remains is detecting CONTACT between
     aspirations, never contradiction — judging whether two prose commitments contradict would violate invariant 5.
     Relates to 8.contradiction and to §3 item 2 below.
   - **D-126**: ~30 notification generators, no catalogue, no classes, no item contract. **D-52's channel question is
     a SUB-QUESTION of this one** — ruling them apart invents the thirty-first ad-hoc wording. Sequence together at M7.
1. **BOB #16's list, untouched by me:** field counts of process failures per lane against a 2026-09-18 baseline that
   does not exist (defining it is the first act); PRESENT and RESOLVE for contradiction after IDENTIFY's measurement;
   `CONTENT-PDF.md` over budget — its OWNER cuts it; the corrected exam instrument (M-65); the checks suites read BY
   NAME.
2. **`VERIFICATION.md` had 45 bytes of headroom** against its budget, which is why D-325's ruling went into
   `CLAUDE.md` §5 instead. Anything added there must be paid for by a cut.

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
- **THE INFORMATION LADDER IS ONE-WAY — no `verified -> collected` edge** (D-203/D-200), folded into
  `BIO_State_Rules_Consistency_v1_5.md`'s Lifecycle block from that section's OWN design: `verified` is an authored act
  and authored acts bind (DEC-24); the section already solves what a back-edge would solve on a second axis
  (`source_status: modified`, both versions kept); and `retired` is "preserved, never deleted", so a reversal is the
  only operation that loses a fact. A weaker-than-today verification is STATED, not reverted. **D-200 wants a route the
  design deliberately lacks and does not need** — its ten documents reconstruct.
- **D-203 CLOSED IN FACT and archived.** Its two "surviving" advice strings are REC-56's own COMMENT PROSE from
  2026-08-05, quoting what it replaced. Measured with comments stripped: **0 live**.
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
- **THE WRONG-UNIT ERROR IS THIS ESTATE'S MOST REPEATED DEFECT — it was caught FIVE times on 2026-09-19 alone**, by
  three different lanes, and twice the wrong unit was a MEASUREMENT rather than the code: stranded branches (commit
  COUNT for REACHABILITY); D-325 (whether an instrument CAN bind itself vs whether anything REQUIRES it); D-134's
  figure; D-254 (a ROW NAMES NO DESIGN failure that was really a MILESTONE error); and D-203 (a STRING COUNT standing
  in for LIVE ADVICE, where the survivors were comments quoting the defect they fixed). **Ask what unit the question
  is about before answering it, and when the answer is a count, ask what the count cannot see.**
- **A LEDGER REBASE IS THE `QUEUE.md` TRAP IN EVERY LEDGER, AND PRESENCE IS NOT THE CHECK — LENGTH IS.** A `DEBT.md`
  conflict had SCHEDULER's rewritten D-182 (458 -> 946 chars) and D-199 (4044 -> 4784) on one side and my archived
  D-203 on the other; taking my side whole would have reverted both rewrites silently. **A reverted row looks exactly
  like a row you kept** — the id is present, the state plausible, no gate fails. Carry the hunks, then compare the
  touched rows' character counts against the REMOTE.
