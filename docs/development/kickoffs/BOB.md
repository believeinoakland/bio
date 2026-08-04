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

**The coordination skill is `ORCHESTRATION.md`, "COMMUNICATING A CHANGE" —
the channels, the rules that make them work, and the receipts. Read it before
making a change another session must know about.**

## Starting a BOB session — the paste block

Nothing about this role lives in a conversation. `CLAUDE.md` auto-loads, the memory index
auto-loads, and everything else this session needs it reads for itself. So a session is
replaced, not migrated: end the old one, start a new one, and paste the block below.

**The rule that matters is ONE SESSION PER CHECKOUT (DEC-3), not the command that starts
it.** In the terminal that is `claude --worktree BOB`; in the desktop app it is a new
session pointed at its own worktree. If no other session is live, the main checkout is
fine and the collision DEC-3 exists to prevent cannot occur — check `git worktree list`
and the tree's cleanliness rather than assuming either way.

```
Kickoff: session BOB, new focus.

Read CLAUDE.md, then docs/development/kickoffs/BOB.md, and follow it. Run in YOUR OWN
WORKTREE (`claude --worktree BOB`, or a desktop session pointed at one) — a DORMANT sibling
session holds the main checkout with a clean, pushed tree. Fetch before anything.

State of play, 2026-08-03 end of day.

**THE MANDATE. Bob is turning focus AWAY from the case-making study to OTHER areas of the
design, and this session's product is a DEVELOPMENT PLAN that can be communicated to
CONDUCT** — decisions worked with Bob, decomposed into scoped items with interfaces and
depends-on, handed through the BOB INBOX in QUEUE.md. Bob, verbatim: "we're far enough
along in the definition of the requirements, journey, processes, UX, and data model that we
can put all of this aside for a time and turn our focus elsewhere."

**Do NOT reopen the paused thread.** Case-making, the study document, S11's state inventory
and D-164's content-extent design are PARKED until Bob reopens them. The review document is
current and published; leave it unless a decision this session takes belongs in its Part 4.

YOUR FIRST JOB IS THE STANDING ONE: read DECISIONS.md and surface every `open` entry.
**There is ONE: DEC-32.** Read it in place. Its ARITHMETIC is now RULED by Bob — legs
relate by AND or OR; weakest leg governs across AND, strongest branch across OR (weakest
within a branch). Only the object shape awaits his confirmation (the falsifier-count test:
one proposition/one falsifier -> parallel claims inside one finding; own falsifier -> its
own inquiry, composed by recursion). Surface it in one line; do not re-argue it. Three
deferred entries have named triggers (DEC-2, DEC-25, DEC-31) — do not pre-empt them. ~30
answered entries await CONDUCT's enactment; that is CONDUCT's loop, not yours.

**YOUR FIRST WORKING MOVE: build Bob the map of candidate focus areas.** Read
MILESTONES.md, QUEUE.md, DEBT.md and docs/architecture/ FRESH — measure, do not recall —
and present the areas that are NOT the paused thread, each with: what it needs DECIDED
(vs what is already answered), what deciding it unblocks, and your recommendation. Rank
them; recommend one. Candidates you will likely find (VERIFY against the repo before
presenting — this list is a pointer, not a survey): the entity axis (M4), the office-formats
/ OCR measurement path (CPDF-9/10, DEC-4's four-way placement), capture resilience (CAP-3
arming, D-120 egress diversity), M8 member-reachability and the interaction constructs,
S12 the assistant (DEC-27, named not drawn), and distribution/installer hardening. Bob
picks the focus; you then work it to decisions and decomposition exactly as BOB.md's
closing protocol requires.

MECHANICS, unchanged and binding:
  - Decisions that are genuinely Bob's only (doctrine, his risk, outside effects); resolve
    everything the repo answers; tactical calls are yours — never block on him.
  - The review document: source docs/development/research/review-document.html, published at
    https://claude.ai/code/artifact/7862c5d4-0454-429c-8b9c-00492b61e4ef — edit the file,
    verify, republish **passing `url:`** or Bob's link silently breaks. Favicon 📋, keep it.
    Before ANY republish: MERMAID_DIR=/tmp/mmcheck node tools/mermaid-check.mjs <file>
    (install line in the tool header). The in-app browser cannot reach claude.ai — verify
    content via WebFetch, appearance via the localhost `mmpreview` harness; screenshots of
    the 50k-px page can come back blank, verify by DOM.
  - NOTATION IS SETTLED: classDiagram for structure, stateDiagram-v2 for lifecycle, edges
    labelled with the ACT. Never mix; never hand-roll arrow semantics. Bob rejected two
    drafts that ignored this.
  - HOW BOB REVIEWS: as a reader who has not lived in the repo, and he is right nearly
    every time. When he asks a question, ANSWER IT — worked, not deflected; his questions
    keep exposing real defects ("what that really is is multiple claims" -> the
    falsifier-count test; "why are those grades combined?" -> DEC-21).
  - Do not guess. Do not be lazy. Measure with python (ugrep skips store.mjs on a NUL byte,
    D-131). Read the repo rather than recalling it.

Run `node tools/plancheck.mjs` before any handoff.
```

**Two things that are easy to get wrong.** Work in a worktree — `CONDUCT` holds main and
one session per tree is the rule (DEC-3); a fresh session in main collides exactly as the
last one did. And if sub-sessions are still running when a session is replaced, their
FILES land but the completion summary and the verification over it are lost — which is
the step that caught a wrong claim in every round of the study.

## Where this session runs

**In its own worktree — `claude --worktree BOB` — and NOT in the main checkout.**
Corrected 2026-07-31 (DEC-3). `CONDUCT` holds main because it integrates and pushes
continuously; two long-running sessions in one tree collide with none of the claims
system's protection, because a claim reserves paths BETWEEN checkouts and says nothing
about two sessions writing one. The handoff is a push, which is not overhead: it is
the act that makes this session's output exist for anybody else (`CLAUDE.md`).

## Opening a BOB turn: surface what is waiting

**Read `docs/development/DECISIONS.md` FIRST and surface every `open` entry to Bob**,
before anything else this turn does. It is the return channel: CONDUCT lifts decision
items raised by workers and by itself into that file, having applied the three tests,
so what arrives there is what is genuinely Bob's — doctrine, risk carrying his name,
effects on people outside the project, and the gated acts. This is the room those get
discussed in; CONDUCT's session window is the wrong one, and an answer given there
leaves its reasoning in a transcript rather than in the record.

Present each entry as it is written — question, what is running provisionally, the
alternative, the recommendation, and what reversing it costs. When Bob answers, write
`response:` and `decided:` into the entry and set it to `answered`. **This session
does not ENACT**; CONDUCT drains answered entries and records `enacted:` with the
commit and the document that now carries the reasoning. An empty file is the healthy
state and is worth one line, not a paragraph.

**An open decision never blocks work.** Every open entry carries a `provisional:`
line, and `plancheck` refuses one that does not.

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

**Report what was DONE and what was DECIDED. Never report tactical STATE.** An
outstanding item, a dirty tree, a stale claim, a warning nobody has cleared: fix it,
or route it through the channel that owns it, or leave it unsaid. Surfacing it to Bob
as "one last item for you" is the failure dressed as diligence, and it has been
corrected three times. If this session knows how to fix a thing, mentioning it instead
of fixing it costs Bob attention and buys nothing.

**Decision items are for doctrine, risk carrying Bob's name, and effects on people
outside the project — and nothing else.** Activation order, sequencing, mechanism,
scoping and which item runs next are THIS SESSION'S, ruled explicitly by Bob on
2026-07-31: "decisions about which tasks to take on next are tactical and rely on a
greater understanding of the dependencies than I have visibility of… never block on
getting my answer when you can figure it out yourself." An empty list is the common
answer, and blocking on him is a productivity failure rather than diligence.
