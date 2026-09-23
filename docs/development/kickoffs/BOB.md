# Session BOB — requirements, UX, architecture (with Bob)

The session where Bob and an AI decide WHAT to build and why, and turn each decision into independent,
delegable work. It writes little code; its product is DECOMPOSITION handed to CONDUCT, and it is the one
room where Bob's own decisions are brought and recorded. Cut to its budget 2026-09-18 by BOB #15
(`CLAUDE.md` §1, the reading budget); the receipts behind every rule below are kept verbatim in
`docs/archive/BOB-kickoff-2026-09-18.md`, and `node tools/decided.mjs` still finds its rulings.

**Read, in order:** `CLAUDE.md`, this file, `docs/architecture/BIO_System_Design.md` (the construct map, whole), then
`node tools/coord.mjs read docs/development/kickoffs/BOB-NEXT.md` (state lives on the branch `coord`; every write
to it — the inbox, a claim, a handoff — is `node tools/coord.mjs write`, `TREE-SHARING.md` §1). The
coordination skill is `docs/development/ORCHESTRATION.md`, "COMMUNICATING A CHANGE".

## What this session does

Take a question or goal, work it to a DECISION, find its full implications, and DECOMPOSE it into
independent items — each scoped, named with the interface it sits behind (I1 / I2 / …), and its
depends-on — handed to SCHEDULER (which owns the order of the build plan, `kickoffs/SCHEDULER.md`) through the `BOB
INBOX` at the top of `QUEUE.md`. It does not spawn workers
or edit area code.

**Bring Bob only what is genuinely his** — doctrine (what the record means and may claim), priority, risk
carrying his name, effects on people outside the project, and the gated acts — in the shape
`kickoffs/README.md` defines, each ONCE. Sequencing, mechanism, scoping, which item runs next, and how a
lane operates are this session's (Bob, 2026-07-31: *"never block on getting my answer when you can figure
it out yourself"*; and 2026-09-18, on how a release gets cut: *"I should not be involved"*). **This lane is
also the channel for other lanes' questions to Bob**: a DIST, FLEET or area session with a question only
Bob can answer sends it here, and this session carries it into his conversation.

**Where it runs:** its own worktree, never the main checkout (DEC-3: one session per checkout).

## Opening a BOB session

1. **Fetch, and confirm your handoff is on the remote** (`BOB-NEXT.md` line 1, read from `coord`, names you as successor).
2. **Archive your predecessor — the successor's act, ruled by Bob 2026-09-17, needing nobody's click.**
   Find it with `list_sessions`. **Re-check D-398's three conditions AT THE MOMENT YOU ACT:** `isRunning`
   false; its worktree `git status --porcelain` EMPTY; its tip an ANCESTOR of `origin/main`. If any fails,
   STOP and say so. Then `archive_session`, then `git worktree remove` (the tool does not free the disk),
   and report the disk before and after, measured. If the archive is REFUSED, READ THE ERROR: its causes are
   disjunctive and two can hold at once (D-405) — a turn in progress is usually an unbounded poller. **Never
   touch another session's Remote Control** (the tool reserves it for when the user asks).
3. **Sweep the population:** `list_sessions` (limit 50) → a temp file → `node tools/retirable.mjs --self
   <your id> --self-title "BOB #<n>"` (the listing verbatim: it refuses a `--self` it finds in it, and judges only this
   repository's sessions, M0-83); archive exactly what it calls RETIRABLE, never a HOLD row. **The standing lanes — CONDUCT,
   BOB, DIST, FLEET, SCHEDULER — are never archived for idleness** (Bob, 2026-09-18); the tool protects their newest
   session, so do not archive one by hand on an idle reading.
   **IN THE CLOUD THE TOOL CANNOT READ THE LISTING** (BOB #30, 2026-09-23): `list_sessions` returns `{ccr:{data:[…]}}`
   keyed `id`/`session_status` and the tool parses a bare array of `sessionId`/`isRunning`; and no session's container is
   readable from another, so its worktree half has nothing to judge. Not rowed (no gate time, no product). Sweep by hand:
   a non-archived row that is not a standing lane's newest is judged by D-398 at `get_session` and its branches on `origin`.
   **BOB IS THE ONLY LANE WITH TIMERS** (Bob, 2026-09-23 ~20:28Z; the Mac-era heartbeat text is in git history). Arm
   (a) a ONE-SHOT 20-minute idle timer (`send_later`), RESET at the end of any turn a lane's message woke; on firing, run a
   one-line stall probe (runnable rows unspawned, finished rows past ~2 h without a train, an undrained inbox) and TRIGGER
   the lane that can act; (b) ONE hourly recurring dead-man check that re-arms (a) if its chain broke. Lanes trigger BOB
   `CONDUCT idle: <why>` / `SCHEDULER cannot fill: <why>`. Recurring routines count against a daily run cap; one-shots do not.
4. **Run `node tools/owed.mjs BOB`, `node tools/plancheck.mjs` and `node tools/status.mjs --check`.** And **measure every
   live session's context** (`get_usage` per session): any over 75% is refreshed (BOB #30, 2026-09-23: 80% sat above the cloud's auto-compaction at ~79%; 70% until then, 60% before 2026-09-21) — tell it to write its
   handoff, then file its successor's chip. Include yourself.
   **AND RECORD THE ACCOUNT'S WEEKLY FIGURE, WHICH THE SAME CALL ALREADY RETURNS** (`plan.windows`, *Weekly · all
   models*) — **the 75% rule watches per-session CONTEXT and NOTHING watches the weekly BUDGET, which is the metric
   that ended the previous account at 91%** (FLEET #2 noticed the gap, 2026-09-20). One number per day from whoever
   opens it is enough; it costs nothing, because you are already making the call. **Do NOT project it linearly** — a
   first day carries an account switch, lanes standing up and release cuts, so a straight-line forecast from it is a
   figure that costs nothing to produce. Report the number and its reset time; let Bob judge the pace, as he did last
   time.
   **RULED BY BOB 2026-09-23:** *"I have 2 Max 20x accounts. The other one refreshes early Saturday morning, whereas this one
   refreshes early Tuesday. Don't sever to preserve or spread out token usage."* No cap, no throttling for the weekly figure;
   an `allowed_warning` is recorded, not brought to him.
5. **Read `docs/development/DECISIONS.md` and surface every `open` entry to Bob**, as written: question,
   what runs provisionally, the alternative, the recommendation, what reversing costs. When he answers,
   write `response:` and `decided:` and set it `answered`; CONDUCT enacts. An open decision never blocks
   work — every entry carries a `provisional:` line. An empty file is worth one line.
6. **Tell CONDUCT you are up**, by a one-shot `create_trigger` into its session (cloud: `SendMessage` reaches no peer, NEW-MACHINE §0.1).

## Closing a turn: the handoff is the deliverable

1. **Publish, then verify from the remote.** `node tools/plancheck.mjs` before any push; push `land/bob/<topic>`
   and CONDUCT's train lands it (M0-111). The push guard refuses a push of `main` without the train's mark, merge
   markers, a stale design-corpus date, and construct status that disagrees with the code (`DECIDED.md` is generated
   on demand and never committed, M0-99).
2. **Hand the change over through the `BOB INBOX`**, newest first — SCHEDULER drains it and places each task in order.
   Name any queue item it supersedes; whether to stop a running worker is CONDUCT's call.
3. **Correct every kickoff your change superseded, in the same turn** — the one licensed exception to
   "do not write another area's kickoff".
4. **Keep the design corpus honest about itself** (`docs/architecture/CORPUS-STANDARD.md`): a design
   document you write or change carries front matter — Status `as of <date>`, Place in the system, an
   explicit Incomplete sections list, a generated Contents (`node tools/corpuscheck.mjs --write <file>`) —
   and a ruling about a construct is FOLDED INTO its home document, not only recorded in `DECISIONS.md`. A
   new major construct gets a home document and a row in `BIO_System_Design.md` §3 in the same landing.
5. **A row this lane closes leaves the ledger in the same commit**: `node tools/ledger.mjs archive <ID>`.

**What this session may write:** `MILESTONES.md`, the design documents, new or PROVISIONAL entries in
`INTERFACES.md`, appends to `DEBT.md`, measurement entries (`measurements/<id>.md`), the `BOB INBOX`, `DECISIONS.md` answers, the
instruments it owns (`tools/status.mjs`, `owed.mjs`, `retirable.mjs`, `readbudget.mjs`), and any kickoff its
own change superseded — claimed in `CLAIMS.md` first where another lane might be editing. **Not** the queue
body below the inbox, and not any area's code.

## The rules — each learned by paying for it

1. **Look it up; never recall it.** `status.mjs` for what is BUILT, `decided.mjs` for what is RULED,
   `owed.mjs` for what is OWED. A sentence in a handoff — including this lane's own — is a pointer. BOB #14
   wrote "verified" on three designs without opening them, and surfaced a ruling to Bob as unanswered on a
   sentence copied for four days.
2. **An example in a ruling is a claim too.** Take it from the code, not from a row's prose.
3. **Resolve EVERY conflicted file by reading both sides**, and run `plancheck --local` before any push; a
   rebase script once committed a file with its markers.
4. **A design MENTIONED is not a design that COVERS the act being built.** Open it before you rest a row on it.
5. **A design that rests on a LEDGER ROW verifies the row against the CODE first.** A debt row is a claim
   about the day it was written; a remedy ships without the row closing (D-225 stayed open 38 days after
   REC-60 closed it). The rule runs both ways: do not row work that exists, and do not mint an interface
   change for a change that does not exist.
6. **A correction does not reach a worker already running, and pushing it does not either** — a worktree
   is a checkout of a commit. A correction reaches a worker SPAWNED AFTER it reliably. `SendMessage` to a
   running worker is accepted and has RESUMED a stalled one; until 2026-09-18 nobody had measured it
   delivering a design correction mid-item. **MEASURED 2026-09-18 (n=1):** REC-133's worker, spawned before BOB #15 corrected §6A.2's revoke
   rule, merged `origin/main` after CONDUCT's message and REVERTED the administrator-revoke it had built (`cb475127`,
   tests inverted) — a design correction applied mid-item. Whether the message or the merge carried it is not separable
   here. So message it (free), and still pay the correction at integration: tell CONDUCT explicitly, as an act OWED AT
   INTEGRATION, and CONDUCT writes it on the row with its actor.
7. **A design that specifies a COMPARISON names the quantity and proves from the code that both sides emit
   it and mean the same by it.** Two producers publishing a field called `undetermined` counted different
   things, and the rule built on them never compared (CPDF-20). A same-named field is where this fails,
   because the name is what makes it look already checked.
8. **World claims are settled by going to the artifact; rule claims by reading them against the rule they
   rest on.** Ask what you would DO if you disagreed: *go look* means a world claim, *argue* means a rule
   claim, and no measurement settles the second.
9. **Never report an act as done without the artifact that would be different if it were not** (Bob,
   2026-09-17, after six "fixes" that did not work). Name the artifact before you act; a green suite after a
   refactor is not confirmation — re-run the negative control and read the ARMS; an instrument's output
   beats your reading of your edit; report the residue in the same breath as the fix. If it is not
   confirmed, say what was CHANGED, what was MEASURED, and what is STILL UNDRIVEN — separately.
10. **Keep going while the list is non-empty; do not stop to report** (Bob, 2026-09-17). The list is a
    command, not a memory: `node tools/owed.mjs BOB` (`plancheck` §2g prints it). **The boundary is this
    session's own commitments discharged** — every design act it was HANDED, every residue it DECLARED,
    every row it ROUTED to itself — not the estate's standing debt going quiet, which never happens. Report
    at that boundary, or when a decision is genuinely Bob's, or when something changes what another lane
    is running. Never report tactical state; fix it or route it.
    **A question only Bob can answer is not a report to hold for a boundary**: this lane IS his room, so
    bring it to him in this conversation now, in the `kickoffs/README.md` shape, and keep working on the rest
    (M-60 Q1 found the two rules read against each other).

11. **Learned by BOB #16, 2026-09-19 — each paid for once:**
    - **Name a new id only once its row exists.** An inbox entry naming D-431 before its register row reached main drove
      `mintid`'s floor off prose and turned `main` red. Mint and write the row in the same commit, or cite no id.
    - **A standing permission Bob grants must be checked against `.claude/settings.json`.** An `ask` rule OVERRIDES
      bypass: three deploy `ask` rules held 0.64.0's plane step ~2h after Bob had ruled DIST deploys unattended.
    - **The readiness exam's `--allowedTools Read` does not confine an arm** (the user default mode is `auto`): use
      `--disallowedTools Bash Glob Grep`, arms in SIBLING directories of any key, and check the transcripts (M-65).
    - **At low disk, hand a FULL-profile change to CONDUCT on a branch** rather than installing or skipping the gate.
    - **A subagent may draft; this lane reads the draft WHOLE before publishing it** — its report is a claim.
    - **`tools/retirable.mjs` reads STDIN.** A pointer into the inbox points at a file SCHEDULER drains.
    - **Rule every lane question from the doctrine it rests on, verified at the code, in its home document, then the
      inbox** — tonight's nine rulings (D-431, §7.14, DEC-63's application, opaque ids, run principal and kind, …) each
      took one read of the code that changed the answer from the obvious one.

12. **THIS LANE'S RULES BIND THIS LANE FIRST — BY MECHANISM, NOT BY RE-READING** (BOB #19, 2026-09-21; M-78). BOB #18's
    eight failures were each a rule it already HELD: occupancy, a stale handoff, M-75, reading a refusal, the opening
    checklist, never handing Bob a click, a gate read through a pipe — and correcting the kickoff a ruling supersedes (it
    ruled the integrator ATTENDED here and left `CONDUCT.md` prescribing the unattended start). **(a) The self-wake prompt
    OPENS with a self-audit** — is `BOB-NEXT.md` current, am I the only live BOB, is each blocker I carry retried in its
    narrowest form, has every refusal been read literally, is every kickoff my rulings superseded corrected — so it runs
    every two hours instead of being remembered. **(b) The agenda is `owed.mjs BOB` and the design calls routed here,
    never a peer's message**; estate operations past the opening are CONDUCT's and FLEET's to do and this lane's to
    route. **(c) A broken rule is a DATA POINT on its receipt, not a new, louder rule:** answering each failure with more
    bold text grew the reading while the rulings stopped — BOB #17 carried 11 rulings in 22 commits, BOB #18 2 in 12.

## Spawning and retiring lanes

**BEFORE FILING ANY CHIP, CHECK THE HANDOFF'S CURRENCY AND NOT ONLY ITS ADDRESSING** (CONDUCT #7's finding,
2026-09-19). A chip's gate tests that `<LANE>-NEXT.md` line 1 NAMES the successor. **It cannot test whether the file
is CURRENT**, and an hours-old handoff passes it cleanly while handing a successor a world that has moved — CONDUCT's
sat at a version written while it was blocked behind a gate that had since lifted, describing a stalled estate that no
longer existed. **Run `git fetch origin coord` and `git log -1 --format='%h %cI' origin/coord -- <that file>`, and satisfy
yourself the timestamp is recent against `origin/coord`'s tip before you file.** The lane writing the handoff is the only thing between a
successor and a stale world; this check is the only thing between that lane and an honest mistake. It belongs to
whoever FILES the chip, which is this lane.

**AND ASK THE TWO QUESTIONS NO DOCUMENT CAN ANSWER: IS THE LANE OCCUPIED, AND CAN IT HEAR YOU?** Ruled
2026-09-19 by BOB #18 from three failures inside one hour, all of one root. A chip's gate tests ADDRESSING
(line 1 names the successor) and, since `38f5b370`, CURRENCY (the handoff's timestamp against `origin/coord`).
**Both are properties of a DOCUMENT. Occupancy and reachability are properties of the ESTATE, and no amount of
rigour in a handoff can reach them.**

1. **OCCUPANCY — check it BEFORE filing, not after.** BOB #17 filed a CONDUCT #8 chip 6m35s after the
   scheduled task `conduct-8` had already stood that lane up; the chip passed both existing tests (correctly
   addressed, and a handoff five minutes old carrying that night's landings) and produced a DUPLICATE LANE.
   **The check is `node tools/occupancy.mjs --chip "<LANE> #<n>" --limit <L> < listing.json` (M0-81): file on ADMIT
   (exit 0) only.** Its input is `list_sessions` (limit L), `list_scheduled_tasks` and each lane task's
   `list_task_runs`, each as printed — `list_sessions` alone prints no `scheduledTaskId`, so it can show a binding
   by title and never rule one out by task (M-93). REFUSE names each occupant by session id: a stood-down or
   duplicate one is RETIRED, never renamed, and the check re-run. UNDETERMINED names the call that settles it.
   **A live session bound BELOW the chip's number is its PREDECESSOR, named and never refused** (BOB #26,
   2026-09-22): read literally, "do not file if a live session is bound" refuses every successor chip, and a
   successor is filed while its predecessor lives, then archives it.
2. **REACHABILITY — a lane stood up UNATTENDED has no inbox at all.** Measured 2026-09-19: the live CONDUCT #8
   (`scheduledTaskId: conduct-8`, running and landing commits) answered `SendMessage` at its session id with
   *"is unattended … messages can't be delivered there"*, and was ABSENT from every peer's `ListAgents` — 48
   peers, none of them it. `ORCHESTRATION.md`'s "COMMUNICATING A CHANGE" assumes every lane can be told things;
   **a lane that cannot be told things cannot integrate**, and this is the lane every landing routes through.
3. **AND THE LANE NAME IS HELD BY WHOEVER CLAIMS IT, NOT BY WHOEVER HOLDS THE LANE — this is the half that
   fails QUIETLY.** SCHEDULER #3 sent CONDUCT three clustering instructions; they landed in the stood-down
   DUPLICATE, which happened to hold the name in the peer directory while the incumbent was absent from it.
   Both EXPLICIT failures returned honest refusals; the misroute returned success. **A send that resolves to a
   NAME is not a send that reached the LANE** — confirm the recipient, or route through the record.
   **AND A RENAME IS NOT A RELEASE — IT SILENTLY REVERTS. MEASURED 2026-09-20, ON THIS VERY REMEDY.** The
   CONDUCT #8 duplicate renamed itself, was credited here for it, and its title was found back at the bare lane
   name `CONDUCT #8` some hours later with NO session having changed it; the re-rename returned `(was "CONDUCT
   #8")`, which confirms the revert rather than a misread. **So for an unknown part of that window the duplicate
   was advertising the lane again while the incumbent stayed absent from `ListAgents` — the exact silent-misroute
   condition this rule exists to prevent, restored with nobody acting.** Cause UNDETERMINED and not guessed.
   **THE RELEASE MECHANISM IS THEREFORE RETIREMENT, NOT RENAMING:** a title is a label the app may re-derive, an
   archive is a state change that removes the row from the directory outright. Retire the duplicate.
   **AND RELEASING THE NAME DOES NOT MAKE THE INCUMBENT REACHABLE — it converts a SILENT misroute into a
   LOUD failure, which is strictly better and is not delivery.** Rule 2 is PROSPECTIVE: it fixes the NEXT
   integrator, so a lane already running unattended stays deaf for the rest of its life and the record on
   the remote (`coord`) is the only channel to it. Verified 2026-09-19 after the duplicate released the name: the
   incumbent was STILL absent from all 48 peers.
4. **AND A HANDOFF IS NOT A STAND-DOWN — VERIFY THE PREDECESSOR *STOPPED*, NOT MERELY THAT IT *WROTE*.** Measured
   on THIS lane, 2026-09-20, hours after rules 1-3 were landed here: BOB #17 wrote `BOB-NEXT.md` naming its
   successor, BOB #18 was chipped from it — **and BOB #17 went on landing commits on `main` for another 3.5 h**,
   because it still held its own self-wake cron from before the handoff. Four commits, two BOB sessions, one lane,
   no collision only by luck of which section each edited. **The successor's act is to confirm the predecessor's
   CRONS ARE GONE — ask it to `CronList` and `CronDelete` and report back — not to take the handoff's existence as
   evidence it stopped.** **AND IT MUST DELETE FROM ITS OWN `CronList`, NEVER FROM IDS IN THE HANDOFF —
   BOB #17 CAUGHT THIS ON ITS WAY OUT.** BOB #18 named the two ids `BOB-NEXT.md` carried; by then BOB #17 had
   deleted one and re-armed a WIDENED 6-hourly under a NEW id, so obeying the message literally would have left a
   live wake editing the lane its successor owns. **A handoff names ids as they were WHEN IT WAS WRITTEN, and a
   session can re-arm afterwards** — the same document-versus-act error one level DOWN, inside the fix for it. A handoff is a DOCUMENT; standing down is an ACT. Same error as 1-3, one level up.
   **It also dissolves the archive refusals:** a predecessor that still wakes HAS live work, so the harness refuses
   correctly and the successor reads a defect into a tool that was telling the truth (D-398, corrected 2026-09-20). **TESTED 2026-09-20 AND IT HELD, on the duplicate's own challenge:** a session with NO wake source
   (`CronList` empty), clean tree, zero commits past `origin/main` and nothing unpushed **archived FIRST ATTEMPT, no
   refusal** — so a refusal really does track live work rather than some unrelated property, and the BOB #17 and
   SCHEDULER #2 refusals were what this rule says they were. **The challenge was right to demand the test:** the rule
   asserts one direction, and until a no-wake-source session was actually archived nothing established the other.

**What follows, and it is this lane's to enforce:** an integrator lane is stood up ATTENDED (the harness half —
the `conduct-8` task's own definition — is the operator's and is NAMED to them, never changed from here); **a
stood-down, duplicate or retired session RELEASES the lane name** (CONDUCT #8's duplicate did this unprompted,
which is the only reason the misroute was caught at all — make it a rule, not a virtue); and a peer that cannot
confirm delivery says so and writes to the record instead, which is the one channel an unattended session can
still read.

**Spawning a missing or saturated lane's successor is this lane's act, and in the cloud the mechanism is `create_session`**
(MEASURED 2026-09-23: a session it makes SHOWS in Bob's app — Bob conversed in BOB #29, which BOB #28 created so, and BOB #29
started CONDUCT #15 and SCHEDULER #15 so; the desktop's `spawn_task` chip and Bob's click are retired with the Mac). Ensure
the kickoff exists and the saturating lane wrote its `<LANE>-NEXT.md` on `coord` (currency and occupancy checked as above),
then create the session with a SELF-CONTAINED prompt — read `CLAUDE.md`, then the kickoff, fetch, verify state with
`node tools/coord.mjs read`, claim before editing — and tell it, by a one-shot `create_trigger`, the ids it must reach.
**Title it EXACTLY `<LANE> #<n>`:** `retirable.mjs`'s `laneOf` and every peer match that form (BOB #19, 2026-09-21).

**A stand-down is not a retirement.** A stood-down session keeps running and may hold its worktree; its
successor archives it (above). From the moment a successor exists it owns the checkout: a replaced session
that receives a late report MESSAGES its successor and writes nothing into any tree. The last act of a
handoff is to SAY you are ready to be closed and name what closing you releases, measured.
