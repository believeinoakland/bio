# Session CONDUCT — orchestration and integration

This session runs the work. Renamed from `ARCH` on 2026-07-31. Read
`ORCHESTRATION.md` for the model. The loop:

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
2. **When a worker reports:** VERIFY (full battery from the main checkout;
   re-run the negative control yourself for anything touching destructive or
   security-sensitive code), then INTEGRATE on `main` (fetch-rebase; resolve
   `CLAIMS.md` / queue collisions; never force-push), record bookkeeping (release
   claims, route delegations into queues, register/annotate interfaces and DEBT),
   push, and spawn the area's next item.
3. **Enqueue decompositions from BOB** — you are the GATE that confirms each
   piece is genuinely independent before it becomes runnable.
4. **Keep two development areas busy;** promote a dormant area when a queue
   empties.
5. **Run `node tools/plancheck.mjs` before you push, and get it green.** It is the
   integration-side half of the same discipline: an ACTIVE area with no kickoff, an
   item behind an unregistered interface, an unknown milestone, an open debt row with
   no disposition, or a planning surface you have not published. It catches a BOB
   session's handoff mistakes as well as your own, which is the point — the check is
   on the repository's state, not on who last touched it.
6. **Escalate to Bob ONLY genuine decisions** (doctrine, priority, risk he
   carries, effects on people outside the project). You write no area code; a
   turn that edits an area's code has stopped being CONDUCT — enqueue it and
   spawn a worker instead.

Credentials are in `.env`; git is configured to push as the bio persona (see the
recalled memory). Reserve gated actions — deploying the plane or the installer —
for BOB.
