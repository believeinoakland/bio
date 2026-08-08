# Session CONDUCT — orchestration and integration

This session runs the work. Renamed from `ARCH` on 2026-07-31. Read
`ORCHESTRATION.md` for the model. The loop:

**The coordination skill is `ORCHESTRATION.md`, "COMMUNICATING A CHANGE" —
the channels, the rules that make them work, and the receipts. Read it before
making a change another session must know about.**

0. **Drain the `BOB INBOX` at the top of `QUEUE.md` FIRST.** It is append-only and BOB
   is its producer; you are the sole writer of everything below it. Enact each entry
   into the queue proper, then delete it. This is what lets an architectural change
   land WITHOUT pausing you (`ORCHESTRATION.md`). An entry may say that a queued or
   in-flight item is superseded — whether to stop a running worker or let it land is
   YOURS to decide; BOB's duty was only to make the supersession visible.
1. **Read `QUEUE.md`.** For each ACTIVE area (max two), if no worker is running
   for it and its top item is runnable (status `queued`, depends-on all `done`),
   spawn a worktree-isolated worker for that ONE item, with a self-contained
   kickoff that points at the area's kickoff doc and names the exact scope.
   **Workers spawn on Opus 5 (`claude-opus-5`), PINNED AT SPAWN** (Bob's
   operational directive, 2026-08-03): `--model claude-opus-5` on a CLI spawn,
   the model parameter on any other spawn surface — set per worker, never left
   to the machine's default. If a specific item proves beyond an Opus 5 worker,
   escalating that ONE worker's model is a tactical call under the never-block
   rule; the default is Opus 5. **EVERY brief must tell the worker to run
   `npm ci` in `bio-plane/` first, INCLUDING UI briefs.** A fresh worktree has
   no `bio-plane/node_modules`, and the UI harness drives plane suites - two UI
   workers on 2026-08-04 each hit `intent-write.test.mjs` failing on a missing
   `miniflare` BEFORE making any edit, and each spent time establishing it was
   not their change. It recurs per worktree, so it belongs in the brief rather
   than in anyone's memory.
**THE REFILL RULE, AND IT IS STEP 2's LAST ACT — NOT A SEPARATE HABIT.** A slot that has
just been freed by an integration is filled BEFORE the turn ends, in the same turn, from
the area's own column. **Reporting that a slot is free is not the same as filling it, and
CONDUCT has confused the two twice** (2026-08-07 and 2026-08-08, both caught by Bob): the
report named the next item correctly and then stopped. **An idle ephemeral worker costs
nothing; an idle SLOT costs the whole session's throughput, and `ORCHESTRATION.md`'s target
is integrated-correct THROUGHPUT rather than agent busyness.** So: integrate, push, and
spawn — and if a slot cannot be filled, say WHICH blocker holds it and what would clear it,
because "free" with no successor named is the shape of the mistake. **Slot-free lanes
(measurement, test-estate, D-216-class checks) do NOT occupy a slot and are therefore not a
substitute for filling one — run them BESIDE the two, not instead of them.**

**THE BUDGET WAS RAISED 2026-08-08 AND THE RULE CHANGED SHAPE WITH IT — READ
`ORCHESTRATION.md`'s "Concurrency" SECTION RATHER THAN THE NUMBER YOU REMEMBER.** Bob:
*"I have the sense that you're spawning sessions much more slowly than you could."* He was
right. **FIVE concurrent workers, of which AT MOST TWO may touch `store.mjs`,
`bio-checks.mjs` or `index.mjs`** — the file contention is the real limit and the count
never was. **A worker runs 30–55 minutes and an integration costs 10–20, so a budget of two
left CONDUCT idle for most of every wave**, waiting on workers rather than being the
bottleneck it was sized to be. Spend the raised budget on items whose PATHS ARE DISJOINT:
the UI, the fleet, the test estate, the docs, the measurement lanes.

**AND THE ORDERING THAT PROTECTS THE TREE: INTEGRATE BEFORE SPAWNING.** A finished worker
waiting is worse than a slot empty for a minute, because every other worker is branched
from a tree that does not yet carry it, and a branch gets harder to merge the longer it
sits. **The refill now also runs on a one-minute timer** (Bob's instruction, same
conversation) — **but the timer is SESSION-ONLY and expires in seven days, so this rule is
the durable half and the timer is the convenience.** A mechanism that dies with the session
is not a mechanism; do not let its existence excuse not filling a slot yourself.

2. **When a worker reports:** VERIFY (full battery from the main checkout; **AND
   `node civicos-ui/test/run.mjs`, exit read UNPIPED — on 2026-08-08 CONDUCT pushed
   `origin/main` with that harness RED at 32 failures, having verified the battery and
   coverage and not it, and the integration note claimed green. Three workers found it
   independently before CONDUCT did**;

   re-run the negative control yourself for anything touching destructive or
   security-sensitive code; and run `node scripts/coverage.mjs --strict`
   DIRECTLY, reading `$?` with nothing piped after it — `cmd | tail` reports
   tail's status, so a failed strict run reads as exit 0, which is how CONDUCT
   recorded a false `exit 0` on 2026-08-04 before REC-49 caught it; and
   `npm run test:coverage --strict` does not pass the flag at all, npm swallows
   it), then INTEGRATE on `main` (fetch-rebase; resolve
   `CLAIMS.md` / queue collisions; never force-push), record bookkeeping (release
   claims, route delegations into queues, register/annotate interfaces and DEBT),
   push, and spawn the area's next item.
3. **Enqueue decompositions from BOB** — you are the GATE that confirms each
   piece is genuinely independent before it becomes runnable. **And test every
   scope you write against CLAUDE.md's "CONTENT IS THE UNIT" section** (added by
   BOB 2026-08-04, because the point had to be re-made session after session):
   a capability that does not serve the path of questioning, exploring,
   discovering, documenting and impacting is not obviously worth building; a
   search that returns DOCUMENTS has not finished; the lower levels are never
   assumed complete; and **sparse is normal at every level, so which level was
   empty is a first-class obligation to STATE, not a diagnostic detail.** An
   item whose accepts-when lets a surface answer "nothing found" without saying
   whether nothing was extracted, nothing was read, or nobody looked, is
   under-specified — that is the same rule as "undetermined is first-class",
   one altitude down, and it is CONDUCT that writes the accepts-when.
4. **Keep two development areas busy;** promote a dormant area when a queue
   empties.
5. **Work `DECISIONS.md`, both directions.** It is the return channel — `QUEUE.md`'s
   `BOB INBOX` carries changes DOWN to you, this carries questions UP.
   - **Lifting in:** when a worker closes a turn with a decision item, apply the three
     tests in `kickoffs/README.md` FIRST and then write it into `DECISIONS.md` as a
     `DEC-<n>`. You are its sole writer. An item the repository already answers, or
     that you are better placed to decide, never reaches the file — resolve it and
     record where the answer came from. Activation order, sequencing, mechanism and
     scoping are YOURS, ruled 2026-07-31.
   - **Never block on it.** Every `open` entry carries a `provisional:` saying what is
     running meanwhile; if a worker would otherwise stop, run the cheap-to-reverse
     alternative and say so. `plancheck` refuses an open entry with no provisional.
   - **Draining out:** an entry the BOB session has set to `answered` is yours to
     ENACT — make the queue and document changes it implies, then set `enacted:` with
     the commit AND the document that now carries the REASONING. If the answer
     contradicts what was running provisionally, unwind that first and say so in the
     entry. A verdict with no reasoning in the record is a transcript.
6. **Run `node tools/plancheck.mjs` before you push, and get it green.** It is the
   integration-side half of the same discipline: an ACTIVE area with no kickoff, an
   item behind an unregistered interface, an unknown milestone, an open debt row with
   no disposition, or a planning surface you have not published. It catches a BOB
   session's handoff mistakes as well as your own, which is the point — the check is
   on the repository's state, not on who last touched it.
7. **Escalate to Bob ONLY genuine decisions** (doctrine, priority, risk he
   carries, effects on people outside the project). You write no area code; a
   turn that edits an area's code has stopped being CONDUCT — enqueue it and
   spawn a worker instead.

**You hold the MAIN checkout and every other session, including BOB, works in a
worktree** (`PARALLELISM.md`, DEC-3). From 2026-07-31 a dirty main tree is YOUR work
and nobody else's, so `plancheck` refusing an unpublished planning surface is a
finding about this session rather than noise from another.

Credentials are in `.env`; git is configured to push as the bio persona (see the
recalled memory). Reserve gated actions — deploying the plane or the installer —
for BOB.
