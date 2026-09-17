# BOB — resume here. Written 2026-09-17 by BOB #12, retired at Bob's direction on context (>60%), at a clean boundary.

Read `kickoffs/BOB.md` (the role, the closing protocol, the spawn-chip mechanism), then this.
**Trust `origin/main` over anything here.** Nothing is mid-flight in this lane: no design half-written, no unpushed work.

## 0. THE FIRST THING, BECAUSE IT IS OFF AND THE LOOP DIES WITHOUT IT

**`conduct-heartbeat` IS DISABLED AND MUST BE RE-ENABLED.** I paused it because Bob was moving locations and losing
internet, and a heartbeat that pokes CONDUCT into starting a wave during a network outage would strand work. It is a
scheduled task at `~/.claude/scheduled-tasks/conduct-heartbeat/SKILL.md`, fires every 20 min in its OWN session, and
exists because **CONDUCT closed a wave and sat idle 9h20m with 23 runnable rows while every board read green — a loop
that depends on a session continuing is not a loop, and GREEN AND STOPPED LOOK IDENTICAL.** Re-enable it with
`update_scheduled_task` (`enabled: true`) as soon as the network is back. **D-393 tracks what is still UNTESTED in it:
the idle-with-work poke and the no-integrator alarm have never been driven; three of five behaviours have.**

## 1. WHAT IS OWED BY THIS LANE

1. **The DEC-31 design act** — the review copy, in `BIO_Publication_v0_1.md`. Bob ruled it today and **overruled two of
   my determinations**: a review copy NEVER LEAVES THE INSTANCE, it is MUTABLE, and an editor with project permissions
   edits it; only a real publish is immutable. The open mechanism question is MINE: **how does the recipient reach
   something that never leaves?** — a scoped, revocable, read-and-comment grant against one production, nearer the gate
   and capability vocabulary than publication. Naming is Bob's (`advance copy` / `review copy`; not *pre-publish*, which
   asserts a future that may not happen).
2. **The Q14 design act** — contradiction. Bob supplied the consumer and then REFINED IT INTO THREE CASES. Read the
   2026-09-17 BOB INBOX entries; the distinction is load-bearing: a contradiction IN THE WORLD is a finding, kept and
   published; **a contradiction IN THE RECORD is a defect in our own holding and carries a DUTY to resolve.** The hard
   part is not detection, it is that *"spending was reduced a little"* vs *"spending dropped a lot"* IS NOT a
   contradiction — **the over-strictness arm is the item.** Resolution records its KIND, because *genuine double-speak*
   resolved is a finding about the subject.
3. **D-394** — a refreshed document's content rows relate to the prior version's by NOTHING. Doctrine ruled, mechanism
   undesigned, and the WHEN/WHAT/HOW is named on the row. Mine.
4. **The corpus single-authority sweep** — Bob agreed. Instrument first (a `corpuscheck` arm failing a document that
   calls a construct undesigned while the construct map names a home that covers it), then the sweep. **The receipt is
   my own error: I told Bob the claim class was undesigned because the content framework's pieces table says so, while
   the design has been in `BIO_Case_Making_v0_1.md` since 2026-08-03.**

## 2. STATE AT HANDOFF

`origin/main` at the tip you fetch. Queue **18 queued · 4 running · 4 blocked**. Decisions **0 open**. Disk **5.6 GiB
free at ~96%**, up from 1.6 GiB. **CONDUCT #2 is LIVE and was busy at handoff**; its context was ~2h in.

## 3. TODAY'S CORRECTIONS THAT OUTLIVE TODAY

- **D-288 CLOSED** — workers push their own branches, `plancheck` names what is stranded in three windows, branches
  pruned. Driven on the live estate, all three windows named → acted → quiet.
- **D-398, AND ITS OWN CORRECTION WHICH IS NOT YET IN THE ROW: THE WORKTREE LOCK DOES NOT RELEASE WHEN THE PROCESS
  EXITS — it just stops meaning anything.** Bob closed CONDUCT #1; its three worktrees stayed locked and stayed on
  disk. The lock file names the dead pid. I reclaimed four (three + FLEET's), re-verifying at that moment: holder dead,
  tree clean, tip an ancestor of `origin/main`. **Fix the row; it still says the process exiting is what releases them.**
  **AND THE RULE, which is CONDUCT #2's correction of its own morning position and is better than what I wrote:**
  it refused to unlock on the grounds that every holder was alive — **right about the fact, wrong about the rule it
  drew from it.** The rule is not *never unlock*; it is **unlock only where the holder is PROVABLY DEAD, the tree is
  CLEAN, and the tip is an ANCESTOR of `origin/main` — all three re-checked at the moment you act, never inherited
  from an earlier sweep.** *A guard keyed on a liveness check that nothing re-evaluates is a guard that outlives its
  condition.* **The third state is the finding: not *alive and protecting*, not *released*, but DEAD AND STILL
  REFUSING** — the unearned-absence class arriving in the harness itself.
- **The stand-down protocol was TWO steps short and both are now in `CONDUCT.md` and `BOB.md`:** say you are ready to be
  closed and name what closing releases; and **verify background SHELLS as well as agent tasks** — CONDUCT #1 truthfully
  reported zero live tasks while four of its own `until grep` pollers ran for sixteen more hours.

## 4. HOW I WAS WRONG, SO YOU INHERIT THE LESSONS AND NOT THE CONFIDENCE

1. **"Fresh worktree" as the exemption criterion** would have blinded the stranded-work arm to the very window I added
   — caught only by re-measuring an hour later, when the exempt worktree had 12 modified files.
2. **"Dirty OR behind" as the main-checkout anomaly** — behind is the NORMAL state of a checkout nobody uses. Caught by
   reading `plancheck`'s output instead of my own sentence.
3. **The claim class** — answered from a summary table instead of searching. Bob was right and I was wrong.
4. **DEC-31** — I took the fence as fixed and moved the artifact; Bob took the artifact as fixed and kept it behind the
   fence. His was coherent where mine was merely consistent.
5. **The lock PIDs** — my first read extracted digits from directory NAMES and reported three different dead holders.
   Right answer, wrong evidence, and it would have been invisible.

**The through-line: care caught none of these. Re-measuring, reading an instrument's own output, and going to the
artifact caught all five.**

## 5. STANDING AUTHORIZATIONS

Tactical calls, sequencing, activation, mechanism, spawning and routing are YOURS — never block on Bob, never report
tactical state. Bring him doctrine, his-name risk, outside effects. `node tools/decided.mjs` and a grep BEFORE raising
anything. Gate, then push, and **verify by the POSITIVE artifact** — `N/N suites green · M assertions` — never by the
absence of an error.

## 6. THIS SESSION IS READY TO BE CLOSED

Per the protocol I landed today. Closing BOB #12 releases **no agent worktrees** — this lane spawned none. Nothing is
unpushed and no background shell of mine is running.
