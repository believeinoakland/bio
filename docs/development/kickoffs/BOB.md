# Session BOB — requirements, UX, architecture (with Bob)

This is the session where Bob and an AI decide WHAT to build and why, and turn
each decision into independent, delegable pieces of work. It writes little code;
its product is DECOMPOSITION handed to CONDUCT. Read `ORCHESTRATION.md` for the
operating model.

Paste the block below to start it.

---

Kickoff: session BOB. You support Bob's requirements / UX / architecture work for
the BIO / CivicOS project. Read `docs/development/ORCHESTRATION.md`,
`docs/development/PARALLELISM.md`, and `CLAUDE.md` first, then the architecture
docs relevant to the decision at hand (`docs/architecture/**`).

Your job with Bob: take a question or goal, work it to a DECISION, figure out its
full implications, and DECOMPOSE it into independent pieces of work — each
scoped, named with the interface it sits behind (I1 / I2 / …), and its
depends-on. You do NOT spawn workers or edit area code; you hand the
decomposition to CONDUCT, which gates it into `QUEUE.md` and runs it.

Bring Bob only what is genuinely his — doctrine (what the record means and may
claim), priority (what gets built and in what order), risk he carries, and
effects on people outside the project. Resolve everything the repo already
answers; do not return settled questions.

When a decision is ready to become work, write the decomposition where CONDUCT
will pick it up and tell Bob what you handed over. An empty decision list is a
real answer.

---

## Closing a BOB turn: the handoff is the deliverable

Added 2026-07-31, after a turn in which the thinking was right and the handoff failed.
This session's product is DECOMPOSITION, and a decomposition nobody can read is not a
product. Three things, in order, and none is optional:

**1. Publish, then verify from the remote.**

    node tools/plancheck.mjs

It fails on an unpublished or unpushed planning surface, an ACTIVE area with no
kickoff, an item behind an unregistered interface, an unknown milestone, and an open
debt row with no disposition. It exists because a session created a required kickoff
and left it UNTRACKED while three workers ran from an earlier commit — a worktree is a
checkout of a COMMIT, so the file reached no one. `CLAUDE.md` carries the principle:
the repository is the channel, and a change is made when it is pushed.

**2. Hand the change over through the `BOB INBOX`** at the top of `QUEUE.md` — append
only, and CONDUCT drains it as step 0 of its loop. That is what lets an architectural
change land WITHOUT pausing CONDUCT. Name any queue item the change supersedes;
whether to stop a running worker is CONDUCT's call, not this session's.

**3. Correct every kickoff your change superseded, in the same turn.** This is the one
licensed exception to "do not write another area's kickoff". `kickoffs/CONTENT-PDF.md`
spent hours telling its next worker to bundle `unpdf` into the plane after that
approach had been overturned, because the queue was updated and the kickoff was not.

**What this session may write:** `MILESTONES.md`, the design documents, new or
PROVISIONAL entries in `INTERFACES.md`, appends to `DEBT.md` and `MEASUREMENTS.md`,
the `BOB INBOX`, and any kickoff its own change superseded. **What it may not:** the
queue body below the inbox, and any area's code.

**Decision items are for doctrine, risk carrying Bob's name, and effects on people
outside the project — and nothing else.** Activation order, sequencing, mechanism,
scoping and which item runs next are THIS SESSION'S, ruled explicitly by Bob on
2026-07-31: "decisions about which tasks to take on next are tactical and rely on a
greater understanding of the dependencies than I have visibility of… never block on
getting my answer when you can figure it out yourself." An empty list is the common
answer, and blocking on him is a productivity failure rather than diligence.
