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

- **SCHEDULER #2 STOOD DOWN at 59%; its successor's CHIP IS FILED AND WAITING.** Not archived, worktree kept,
  self-wake armed — **SCHEDULER #3 archives it under D-398's three conditions**, re-checked when it acts. If the chip
  is gone and no #3 exists, file it again; the gate is SCHEDULER-NEXT.md's line 1.
- **CONDUCT #7, DIST #2 and FLEET #2 are UP**, each from its own `-NEXT.md`, each with self-wake and renewal armed.
- **Disk is the binding constraint, not the plan.** ~8.8 GiB free at 96%, down from 12 GiB in the first hour. The
  arithmetic is M-70. **It moved a GiB in thirty minutes — re-measure, never carry it.**
- **0.66.0 is DEPLOYED and live-verified** on biosmoke7, the serving build proved by an error string absent from
  0.65.0's bundle rather than by a version label. SAFE: `main`'s `release/` still reads 0.65.0, so no installer offers
  it; only the `latest` pointer is unadvanced. `DIST-NEXT.md` is its authority.

## 2. BOB'S OPEN CALLS — BOTH ARE HARNESS PERMISSIONS, NEITHER IS DESIGN

1. **THREE LANES STALLED ON ONE CLASS OF HARNESS GATE — THE ESTATE'S BIGGEST PROBLEM, AND NOT ONLY PUSH.** CONDUCT #7
   cannot `git push` at all; DIST #2 cannot advance the `latest` pointer AND was refused `wrangler deploy --dry-run
   --outdir`, a READ-ONLY build — the least privileged thing in that family, so this is a CLASS, not three incidents.
   Refused by the Claude Code AUTO-MODE classifier (`[Data Exfiltration]`, `[Production Deploy]`). The HARNESS's gate,
   not the repo's: no `ask` rule on push exists and `CLAUDE.md` §4 says pushing is not gated. **Measured:** BOB,
   SCHEDULER and FLEET pushed fine in the same window; CONDUCT never could; DIST could, then could not, mid-session —
   so neither per-session-static nor command-shape (its control was a plain named-branch push writing nothing to
   `main`, refused identically). Likely lever: the committed settings say `bypassPermissions` while the app launches
   sessions in `auto`. **Only Bob can change it; NO LANE MAY RUN A COMMAND ANOTHER SESSION'S GATE REFUSED** — three
   lanes have now declined to, which is why work is visibly STALLED rather than quietly done wrong. While it holds,
   REC-151 cannot land, D-432 is unplaceable, 0.66.0 is deployed while `main` reads 0.65.0, and CONDUCT spawns NO
   workers since a worker inherits the gate. **A THROUGHPUT blocker, not data loss — but the exposure GROWS while it holds, so
   re-measure it, never quote this figure.** `git rev-list <CONDUCT's tip> --not origin/main b69d7b26` read **3
   commits / 1 non-merge** at 14:00Z and **21 / 4** at 17:30Z (CONDUCT #7, verified here) — main has moved EIGHTEEN
   times under that integration, and the seventeen merge commits each carry a RESOLUTION, so the reconstruction cost
   is re-deriving eighteen merges, not re-running one figure move. REC-151's substance is still safe on origin at
   `b69d7b26`. **The estate is now turning over AROUND the stall:** SCHEDULER has been replaced and this lane
   refreshed, while the cache's top row `REC-151 · running` still belongs to a session that cannot land it — true row,
   real worker, no route.
2. **FLEET needs approval to delete 574 MB of `node_modules` in its own worktree** — its gate declined it. It offers
   14 seconds to reinstall. Smaller, and unblocked by nothing else.

## 3. THIS LANE'S OWED WORK, in order

0. **D-226 IS QUEUED AND UNSTARTED — take it first.** Four words mean different things in two documents a builder
   must read together ("finding" in three senses, "version" in six, the IS design's "leg" materially thinner than the
   register's, "ground" both a DEC-32-banned surface word and a real `inquiry_basis` column). The act is deciding
   which sense wins and which document yields — a CORPUS decision under CORPUS-STANDARD, not a rename SCHEDULER can
   sequence. It is the largest of the rows on this desk and needs a clear sitting; nothing in the plan depends on it.
0b. **Two more design rows routed here and NOT started** — these are real design acts, not
   rulings, and each needs its own sitting:
   - **D-55** (DOCTRINE, Bob ruled) — **NARROWED at the schema; read the row, not its headline.** The precondition
     stands, the premise does not: the register already holds per-origin, the join and sub-document grain, so only an
     AUTHORITY VALUE at that grain is owed. **The link I did NOT trace, which the design checks first:** whether a
     content row can be minted over subresource bytes and joins to `site_asset_refs`.
   - **D-80** (Bob ruled: contradiction is to FIND, not prevent): what remains is detecting CONTACT between
     aspirations, never contradiction — judging whether two prose commitments contradict violates invariant 5.
   - **D-126**: ~30 notification generators, no catalogue or item contract. **D-52's channel question is a
     SUB-QUESTION of it** — ruling them apart invents the thirty-first ad-hoc wording. Sequence together at M7.
1. **BOB #16's list, untouched:** field counts of process failures per lane against a 2026-09-18 baseline that does
   not exist (define it first); PRESENT and RESOLVE for contradiction; `CONTENT-PDF.md` over budget (its OWNER cuts
   it); the corrected exam instrument (M-65); the checks suites read BY NAME.
2. **`VERIFICATION.md` had 45 bytes of headroom**, which is why D-325's ruling went into `CLAUDE.md` §5. Anything
   added there is paid for by a cut.

## 4. WHAT BOB #17 DECIDED — each folded into its home document; `decided.mjs` finds them

- **TASK stays gated** (Membership v2 §7): the set is a PREDICATE — *every prefix whose objects a read withholds
  from some caller* — not a list. PROJ, CASE, DRAFT, RVG, TASK.
- **D-325 — discipline-plus-witness is SUFFICIENT, and stronger than the row asked** (`CLAUDE.md` §5). `scopeFor`
  honours `store=scratch` from ANY class, so the binding existed PER CALL and nothing REQUIRED it; a live verification
  now NAMES it, with the record's counters as detector. **RESIDUE, open:** no credential binds to scratch for life.
- **D-52 NARROWED** (no notification channel exists; the CHANNEL is Bob's at M7, with D-126).
- **D-136 — the missing session reach is an OMISSION; the fix is NAMED** (Membership v2 §4.7): the one path that can
  cast a §4.7 vote is the path where THE CALLER NAMES THE VOTER. **ONE item** — stamp `by` from the session AND grant
  session reach together. **D-134 is ordered BEHIND it.**
- **IC-55 / D-262 — THREE sentences, not two:** *not for a person* is a design claim; *your credential does not reach
  this* is a fact; for an OMISSION, neither. **A false rationale SUPPRESSES ITS OWN BUG REPORT.**
- **M0-78 and D-270 placements CONFIRMED** ahead of features: "M0 last" governs M0 BUILD items, never a live defect in
  the verification substrate. `preflight()` counts an arm's OWN QUOTE, proving the ANCHOR and never the FIXTURE.
- **The information ladder is ONE-WAY — no `verified -> collected` edge** (State Rules, Lifecycle): `verified` is an
  authored act; `source_status` already solves what a back-edge would. **D-200 wants a route the design lacks and does
  not need.**
- **D-203, D-284, D-306, D-356 CLOSED and archived.** D-203: the "surviving" strings are COMMENT PROSE, 0 live with
  comments stripped. D-284: `text_tier` is DEC-32's weakest-governs over a document's pages. D-306: NOT FUNDED on
  DEC-74's pattern. D-356: NULL `page_count` is UNDETERMINED, STATED — **a backfill sized at zero is the wrong job.**
- **TWICE the real defect was NEITHER option the row offered:** a limitation stated only where an INSTRUMENT prints
  it. Ask that of every row handing you options.
- **D-353 — a stated limitation of the census, NOT a recurring adjudication:** a cadence nobody honours reads as
  covered. **RESIDUE, open:** M0-29's figure must carry its DATE and BOUND wherever cited — enforced nowhere yet.
- **D-404 — BUILD the instrument** (placed as LED-9): the arm does not JUDGE builtness, it READS `status.mjs`, which
  §2 already names as the authority. **Its bound must print in the arm's own output.**
- **In `SCHEDULER.md`:** the GAP and the INSTRUMENT that closes it are different objects (mint a new id); a CITATION
  INVENTED TO PASS A CHECK is worse than the gap it hides.
- **M-70** — the disk at the account switch, and the verdict clearing `plancheck`'s three stranded branches.

## 5. HOW I WAS WRONG — each caught by someone else or by an instrument

- **I read a background task's "exit code 0" as the gate's verdict. The gate was RED** — the 0 was my own trailing
  `echo`. `CLAUDE.md` §7's wrapper trap in a new costume: **read the completion line and `gates: GREEN`, never a
  wrapper's status.**
- **I stated "npm ci is installed" as a fact about the machine in four lane chips.** I had measured the MAIN CHECKOUT;
  every lane gets a fresh worktree where it is absent. True of the wrong unit. DIST caught it.
- **I told FLEET to put durable lessons in its handoff.** Wrong: the law is read every time, a handoff once. FLEET
  corrected me and the correction is now ORCHESTRATION.md's rule.
- **I hypothesised the push refusal was command-shape.** CONDUCT's control refuted it cleanly.
- **I told CONDUCT to "rebase before your gate."** Wrong twice: never change the tree mid-gate, and CONDUCT integrates
  by MERGING, never rebasing, because a rebase over a merge flattens it.
- **I tried to archive D-325 while its disposition declared residue.** `ledger.mjs` refused. The tool was right.
- **THE WRONG-UNIT ERROR IS THIS ESTATE'S MOST REPEATED DEFECT — caught SIX times on 2026-09-19 alone**, by three
  lanes, three of them where the wrong unit was a MEASUREMENT rather than the code: stranded branches (commit COUNT
  for REACHABILITY); D-325 (CAN an instrument bind itself vs does anything REQUIRE it); D-134's figure; D-254 (a ROW
  NAMES NO DESIGN failure that was a MILESTONE error); D-203 (a STRING COUNT for LIVE ADVICE); and **both SCHEDULER
  and I reporting ESTIMATED context as measured.** **When the answer is a count, ask what the count cannot see —
  including of yourself: `get_usage` is the only honest source for your own context.**
- **A LEDGER REBASE IS THE `QUEUE.md` TRAP IN EVERY LEDGER, AND PRESENCE IS NOT THE CHECK — LENGTH IS.** A `DEBT.md`
  conflict had SCHEDULER's rewritten D-182 and D-199 on one side and my archived D-203 on the other; taking my side
  whole would have reverted both silently. **A reverted row looks exactly like a row you kept.** Carry the hunks, then
  compare the touched rows' lengths against the REMOTE.
