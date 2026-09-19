# BOB — resume here. Written 2026-09-18 by BOB #15, refreshing at 61% context (Bob: "Always refresh sessions with context windows that are more than 60% full").

Read `CLAUDE.md`, then `kickoffs/BOB.md`, then this. **Everything below is a POINTER measured at writing; re-measure before
you act on it.** Nothing is mid-flight in this lane: every design act is pushed, nothing is unpushed.

## 0. YOUR FIRST ACTS

1. **Archive BOB #15** (session title "BOB #15"; worktree `zealous-dirac-90a441`) under D-398's three conditions, checked at
   the moment you act; then `git worktree remove`; report the disk.
2. **Measure every live session's context** (`get_usage`). Over 60% → it writes its handoff and you file its successor's
   chip. At writing: **CONDUCT #5 was at 70% and was told to stand down and write CONDUCT-NEXT.md**; when its sha arrives,
   file the CONDUCT #6 chip (its prompt must refuse if `CONDUCT-NEXT.md` line 1 does not name #6). DIST 26%, SCHEDULER 12%,
   FLEET 10%.
3. `node tools/owed.mjs BOB`, `node tools/plancheck.mjs`, `node tools/status.mjs --check`. Tell CONDUCT, SCHEDULER, DIST and
   FLEET you are up.

## 1. THE ESTATE AS IT NOW RUNS (built this session; each in `CLAUDE.md` or its kickoff)

- **Five standing lanes**, never archived for idleness, refreshed at >60% context: **CONDUCT** (spawns, integrates; writes
  only `queued → running`), **SCHEDULER** (owns the build plan's ORDER, the cache, the backlog, the BOB INBOX drain, done +
  archive + replenish — `kickoffs/SCHEDULER.md`), **DIST** (cuts and — by Bob's STANDING permission — DEPLOYS; reports the
  landing to you), **FLEET**, and **BOB**. `tools/retirable.mjs` `STANDING_LANES` enforces the never-idle-archived half.
- **Nobody ends a turn on a question nobody reads.** Questions for Bob come to you; you bring them to him in the
  `kickoffs/README.md` shape, once, and keep working.
- **The work pipeline** (`WORK-PIPELINE.md`): QUEUE.md becomes a CACHE of ≤8 tasks, `BACKLOG.md` the full ordered plan, the
  archive what is done. **LED-6** (the migration; tool half built by a worker, file half SCHEDULER's) and **LED-7** (DEBT.md
  folded into the plan: every row triaged at the code into closed / a backlog task / a stated limitation; then DEBT.md
  retired) — both SCHEDULER's to drive. A NEW DEFECT is placed only with its FIX identified (Bob).
- **The reading budget** (`tools/readbudget.mjs` in `plancheck`): CLAUDE.md ≤16 KB, a kickoff ≤24 KB, a `-NEXT` ≤12 KB. At
  writing, **CONDUCT.md (97 KB), RECORD.md (32 KB), CONTENT-PDF.md (26 KB) are over** — cutting CONDUCT.md is THIS LANE'S
  NEXT DESIGN ACT (§3). Not yet in the budget: VERIFICATION.md (105 KB), ORCHESTRATION.md (35 KB), `BIO_System_Design.md`.
- **Measured, not assumed — M-60** (`MEASUREMENTS.md`): a clean-room readiness exam (fresh headless sessions in empty
  directories outside the repo; a no-reading control; blind grading). NEW 38/40, OLD 36/40, CONTROL 3/40; the reading ≈
  11.9k vs 33.9k tokens. Both findings corrected and re-run. **The window is 1,000,000 tokens**: capacity is not the binding
  constraint, FIDELITY is. The instrument (`exam.md` + key) is reproduced in M-60; extend it per lane.

## 2. WHAT BOB HAS PENDING — bring ONCE, in the README shape

- **WHEN A RELEASE REACHES OTHER GROUPS — RULED by Bob:** *"The release may be deployed, obviously. But once deployed, all
  groups can update to the latest release if they choose."* Recorded in `kickoffs/DIST.md`; DIST builds the `latest`
  pointer (option a). The history, kept: Every installer's `/update` fetches main's
  `release/RELEASE.json`, so a signed release reaches every group the moment it is pushed — before any live check. On
  2026-09-18 that offered five store-bricking releases (0.59.0–0.63.0) to every group for ~3½ hours (18:10–21:35) before
  DIST withdrew them (`d86b27ea`); whether any group ran `/update` in that window is UNDETERMINED. Options: (a) installers
  follow a separate `latest` pointer DIST moves only after the release is deployed and live-verified on our own instance;
  (b) RELEASE.json on main advances only after that check; (c) as is. (a) was recommended and Bob's answer is (a) in substance;
  BOB #15 told DIST and FLEET; the installer change is DIST's. Also: CONDUCT has the P0 fix (move the columns ahead of the index + an upgrade
  suite), then DIST cuts 0.64.0 and deploys under standing permission.
- **ANSWERED this session, recorded in Membership v2 §7:** anyone may ask/investigate any question (the run verdict never
  consults unseen projects); each project chooses DISCOVERABLE or HIDDEN, with a request-to-join (the setting, the request
  and the listing surfaces are THIS LANE'S NEXT DESIGN ACT, before any row).
- **Weekly usage** was at **74%** with 3d16h to reset (5-hour 15%). Told to Bob as information; if he wants work paced,
  tell SCHEDULER and CONDUCT.

## 3. THIS LANE'S OWED WORK, in order

1. **Cut `kickoffs/CONDUCT.md` to its 24 KB budget** — archived verbatim, CONDUCT reviews for anything it relies on, and the
   M-60 exam built for CONDUCT and run old-vs-new before it lands. Much of it is superseded by the SCHEDULER handover.
2. **VERIFICATION.md and ORCHESTRATION.md**: fold the rules a session must follow into CLAUDE.md / the kickoffs, archive
   the narrative, add both to `readbudget`. Budget `BIO_System_Design.md` and require it of BOB, SCHEDULER, CONDUCT.
3. **The exam per lane** (SCHEDULER, DIST, FLEET, workers) and **field counts** of process failures per lane against the
   2026-09-18 baseline.
4. **Three design acts SCHEDULER's order audit (cd9d7c86) routed here, none rowable until done:** (a) 8.contradiction —
   IDENTIFY's detector inputs, the level-2 document this lane promised 2026-09-17 (Case_Making §CONTRADICTION names the three
   mechanisms, not the detector); (b) verify the review-copy SURFACE against Program B before SCHEDULER rows it (REC-126 →
   UI delegation in CLAIMS.md); (c) design the bounded read the question page needs to show a no-project conclusion
   (UI-65's follow-up). Also decided and handed to SCHEDULER: the M0 hold is LIFTED (its audit was the re-derivation).
   **Correction:** the battery-tally row I called M0-67 is DONE; the open one is **M0-65** (D-413), placed first (SCHEDULER).
5. **Checks that suites read by NAME**: `skilldoctrine` E3 and `skillpack` F3/F4 quote CLAUDE.md's four-level sentences
   verbatim; `surface-registry` L0 and `corpuscheck` also read it. Change those sentences only together.

## 4. DECISIONS MADE THIS SESSION (all in their home documents; `decided.mjs` finds them)

Conclusion ownership (INVESTIGATIVE-SESSION §7.1 items 1–8); lead counters and `dbBytes` (MEMBER-KNOWLEDGE §5, corrected
once — no class reads every lead); observation legs carry a connection grade (§3); D-422 founder sight, "administrators
direct nothing" enforced for every administrator, case-ratification signer/deliverer, plane-minted project ids, refusals
never describe an unseen project (Membership v2 §7); review-copy grant authority, revoke owner-only (Publication §6A.2, corrected
once); project documents not publishable (Publication rule 2's note). **Bob ruled:** project names unique across the
instance; DIST deploys by standing permission; refresh at >60%; SCHEDULER exists; DEBT folds into the plan.

## 5. HOW I WAS WRONG — so you are not

1. **Two decisions of mine contradicted Bob's doctrine and were corrected within the hour** (admin lead counts; admin revoke).
   Before deciding a design gap, run `decided.mjs` AND read the construct's doctrine section — "follows a ruling" needs the ruling read.
2. **I rebased while a gate was running** and had to discard the run. Never change the tree under a gate.
3. **An unquoted heredoc deleted every backticked word** from an edit; restored by hash. Write edits as Python files or quoted heredocs.
4. **My first search for CLAUDE.md's readers missed two suites** (`skilldoctrine`, `skillpack`); the full gate caught them.
   A search for readers is a claim too — the gate is the artifact.
5. **A string-replace silently did not match** Bob's own defect rule; caught only because I checked each edit's effect. Assert
   every replacement's count.
