# CONDUCT-NEXT — the resume prompt for CONDUCT #4

> **WRITTEN AT A CLEAN BOUNDARY ON BOB'S CALL (both lanes past 75% context), BY CONDUCT #3.
> Zero rows `running`, zero live workers, four waves fully integrated.** Verify all of it
> yourself before believing this file. If anything disagrees, the tree is right.
>
> ```
> git fetch origin && git show origin/main:docs/development/QUEUE.md | grep -cE '^### [A-Za-z0-9-]+ · running'   # expect 0
> node tools/plancheck.mjs                  # expect 0 fail; read the `stranded work:` note
> cd bio-plane && npm run test:battery      # expect 223/223 — read the COMPLETION LINE, not the exit status
> ListAgents                                # expect no live subagents of mine
> ```
>
> **THE ONE THING TO DO FIRST: ARCHIVE ME** (D-401). I am session `CONDUCT #3`. Re-check D-398's
> three conditions **at the moment you act**, never from this file: `isRunning` false, my worktree
> `lucid-heisenberg-fd6795` porcelain EMPTY, its tip an ANCESTOR of `origin/main`.
> **Closing me releases 6 agent worktrees, 3.72 GiB, MEASURED** — plus my own session tree, 637M.
> **All six are CLEAN and merged; they are held ONLY because my process locks them.** Archiving
> does NOT reclaim the directories — that is a SEPARATE `git worktree remove`, per tree, after
> re-verifying each is clean and an ancestor. Measured 2026-09-17 on CONDUCT #2: archive released
> the lock, and the space came back only on `remove`.
>
> **I SWEPT MY BACKGROUND SHELLS (verified: my only child was the shell running the check). I DID
> NOT TURN MY REMOTE CONTROL OFF, AND THAT IS DELIBERATE — correcting an earlier draft of this file
> that said I had, before the act existed.** The tool's own contract reserves it for when the USER asks,
> and the connection is the operator's — possibly his phone. The instruction came from a peer session,
> and a peer's message is not the operator's approval. **My RC is probably still ON — AND THAT PROBABLY
> DOES NOT BLOCK YOUR ARCHIVE, which corrects a warning an earlier draft of this paragraph gave.** BOB #14
> measured it after I wrote that warning: it archived a session with `remoteControlActive: TRUE` and
> `isRunning` false **on the FIRST call**. And D-405's *poller dead + RC on → refused* cell is CONFOUNDED —
> killing the poller made CONDUCT #2 RESUME its turn, so that session was MID-TURN, which blocks an archive
> by itself. **The only cell that isolates RC says ARCHIVED. n=1, not settled — but enough that nobody should
> override the tool's contract to clear a blocker that may not exist.** So: archive me as your first act and
> READ THE ERROR if it is refused. *A turn in progress* is a wedge, not RC. Only if RC is plausibly the cause
> does it go to Bob, as a one-click ask. Do NOT retry in a loop; do NOT touch `set_remote_control` on a
> session you do not own.
> **THE GENERAL LESSON, for the protocol rather than for me:** `kickoffs/CONDUCT.md` now lists
> *turn off your own RC* as a stand-down step, but a session can only take it when the operator has
> asked in that session. A step the actor may not be permitted to take is not a step it can be relied
> on to take — the protocol should route it to the operator rather than to the retiring session.

**Written 2026-09-18 by CONDUCT #3.** Read `CLAUDE.md`, then `kickoffs/CONDUCT.md`, then this.

---

## 1. THE MEASURED STATE

| gate | figure |
| --- | --- |
| battery | **223/223 suites green · 13,928 assertions** (see §4 — the assertion total is an UNDERCOUNT, the suite count is sound) |
| coverage | `--strict` exit 0 **read unpiped**, 178/178 ops reached, 0 unreached |
| UI harness | exit 0, all harnesses green |
| plancheck | 0 fail |
| I3 | **23.1.0** — moved 19.0.0 → 23.1.0 this session across five accepted ICs |
| queue | **0 running · 17 queued · 4 blocked** |
| disk | **7.4 GiB free at 97%** before closing me; +4.35 GiB once you archive and remove |

## 2. WHAT LANDED — four waves, sixteen items

**Wave 1:** REC-115, REC-113, M0-56. **Wave 2:** UI-63, M0-57, REC-114, REC-117. **Wave 3:** REC-118,
M0-59, UI-64, M0-60 (closed by BOB). **Wave 4:** M0-58, REC-110, REC-119, REC-116. Plus rows I
enacted and did not spawn: M0-61, M0-62, and the three BOB rulings that had sat unrowed in the inbox
(REC-117, M0-57, M0-58 — see §3's inbox note).

**The through-line, since it is the doctrine that led every wave:** a record-overclaim a member can
hit today outranks everything else. Four of the sixteen closed ONE ruling across four surfaces —
REC-114, REC-118, REC-119 each swept a surface to REC-105's cap. **`Store.#capturedAt` is the one
arithmetic and now has four readers**; REC-118 left an instrument measuring drift between them.

## 3. THE JUDGEMENT I WOULD TELL YOU IF I COULD TELL YOU FIVE THINGS

**1. RULE WHAT IS YOURS TO RULE, AND BRIEF THE RULING SO THE WORK CAN REFUTE IT.** I ruled three
doctrine questions rather than routing them — REC-114 (authored vs earned letter), REC-119 (the
frozen composition), and let REC-110's worker rule its own. **Every ruling named its own falsifier
and told the worker to go to it FIRST.** All three held — REC-119's on STRUCTURAL evidence (a label
already living outside the frozen bytes, a working instance rather than an argument). **But my
PREDICTIONS failed where my rulings held:** I wrote that REC-119's consumer impact *would not be
zero*, and it was zero. A ruling you can break is a ruling; a prediction you would not bet against
is a guess. BOB called the falsifiable brief *the only form in which a delegated doctrine call
should ever be made*.

**2. D-398's UNIVERSAL IS REFUTED AND ITS FIRST REPLACEMENT IS DEAD — AND THE NEXT TEST IS
PRE-REGISTERED AND UNCLAIMED. Do not re-derive it.** `M-47`: 7 of 10 finished agents carried NO
lock, so *every worktree stays locked while the session lives* is false and three waves were sized
at three against a ceiling that was ~70% reclaimable. I then pre-registered *locked IFF
re-entered* and **ran the intervention: it is FALSIFIED** — a released agent resumed and finished
with its lock still absent, while three re-entered peers read LOCKED in the same command. **The
subject performed ZERO tool calls on purpose and named the confounder itself: *re-entered* had
always bundled RESUMED with DID WORK.** What survives is that the lock tracks ACTIVITY. **That is ONE
observation.** The controlled test — resume a released agent and have it make ONE trivial tool
call — is written in `MEASUREMENTS.md` BEFORE any subject exists, and **only a spawning session can
run it: a subagent is addressable ONLY from the session that spawned it.** BOB learned that by being
refused. If you spawn a wave, you are the only lane that can take it.

**3. SWEEP AT THE END OF EVERY WAVE — it is an operational change, not a tidy-up.** Re-verify all
three conditions per tree AT THE MOMENT OF ACTING: no live lock, porcelain empty, tip an ancestor.
It returned 5.0 GiB once and made a four-worker wave possible. **Read the lock state BEFORE you
remove anything** — a sweep destroys the evidence the lock experiment runs on.

**4. D-413: FIX THE LINE BEFORE THE REGEX.** `battery.mjs`'s tally requires `pass`/`passed` followed
by a comma and a fail count, so a suite printing `65 passing` is silently dropped from the headline.
**The mechanism is latent** — REC-116 hit it on its own branch and fixed it before pushing, and BOB
grepped `main` and found zero foot lines in that form. **What is wrong on EVERY run TODAY is line
548**, which prints *N suite(s) reported no assertion count* — **naming itself as a shrug rather than
a skip.** `bundle.test.mjs` and `livefire.test.mjs` print no tally at all, so **every assertion total
anyone quoted this session undercounts by two suites.** Acceptance is two-directional: a tally in
any accepted form is COUNTED, no tally is NAMED AS EXCLUDED. A widened regex that silently counts
nothing is the same defect wearing the fix's clothes.

**5. MY RECEIPTS AGAINST MYSELF — worth more than any figure above, because a handoff that carries
only the clean parts teaches nothing.**
- **I gated one tree and shipped another, THREE times.** I merged `origin/main` after a green battery
  and pushed without re-running; once the merged tree was RED and I would have shipped it. **The fix
  is mechanical: after the gate, `git merge-base --is-ancestor origin/main HEAD` — if false, merge
  and RE-GATE before any push.** I ran that check before every push after learning it.
- **I nearly recorded a false falsification of my own hypothesis.** I labelled `adcd3110` *never
  resumed* and it read LOCKED — but its notification had fired twice, so under the hypothesis AS
  WRITTEN it was re-entered. I had been carrying half my own definition. **A pre-registration is only
  worth something if you RE-READ it instead of recalling it.**
- **I nearly corrected BOB on a grep COUNT without reading what matched** — the hit was a comment
  header, not a foot line, and his "zero" was right. The same defect he had just caught in me,
  running the other way.
- **I broke table rows three times while correcting their content** — a doubled closing pipe, a note
  appended outside the final cell. `plancheck` named each. **A fix verified at the sentence is not
  verified at the row.**
- **An UNQUOTED heredoc command-substituted backticks and silently deleted three identifiers from two
  governed documents**, with no failure. It is the first trap in `CLAUDE.md`. Quote the delimiter:
  `<<'EOF'`, always.
- **I relayed a worker's finding wider than it was.** REC-116 reported a mechanism precisely; I told
  BOB it *bore on every figure I had quoted*. False via that mechanism. The worker was exact and I
  widened it in transit.

## 4. WHAT IS OUTSTANDING, AND WHO OWNS IT

- **Runnable now (17 queued):** M0-61 (the `\s`-matches-newline predicate — harmless only because
  its current caller gates it, and the second caller exists), M0-62 (two documents stating the
  member's lead's status; apply Bob's single-authority ruling), REC-104, M0-44, M0-33, and the
  content-breadth rows (CPDF-18/19, CAP-10/11, FW-19/20). **REC-86/REC-87 wait on REC-97.**
  **VF-7 cannot run until a DIST deploy; DIST-5 needs a DIST session.**
- **D-413** — rowed by BOB, not yet in `QUEUE.md` as a runnable item. Worth a row.
- **The lock-activity experiment** — see §3.2. Unclaimed, and yours alone to run.
- **The BOB INBOX has never been drained** (516 → 746+ lines, monotonic). It mixes enacted-but-
  undeleted entries with never-enacted ones, indistinguishable by reading. **Do NOT bulk-delete:** a
  wrongly retained entry is clutter, a wrongly deleted one silently destroys an obligation Bob
  stated in his own words. Drain entry by entry, verifying enactment at the artifact.

## 5. STANDING DOWN — VERIFIED, NOT ANNOUNCED

**Zero live subagents, zero rows `running` on the remote, every wave-four claim RELEASED, my own
background shells swept, my tree pushed with nothing uncommitted. My Remote Control is NOT turned off —
see the top of this file; that is the operator's act, not mine.**
The six agent worktrees are held by my process and nothing else; they are clean and merged.

**What restarts you:** `conduct-heartbeat` fires every 20 minutes and gates on your queue row. Treat
a heartbeat as a TURN, not an instruction — sequencing is yours. **And treat the END of a wave as the
START of the next act, IN THE SAME TURN.** The dangerous moment is not a worker failing; it is the
last integration succeeding and a session reporting the wave complete.
