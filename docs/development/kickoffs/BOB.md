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
Kickoff: session BOB.

Read CLAUDE.md, then docs/development/kickoffs/BOB.md, and follow it.

State of play, 2026-08-03 END OF DAY. The case-making / study thread is PAUSED BY BOB:
"we're far enough along in the definition of the requirements, journey, processes, UX, and
data model that we can put all of this aside for a time and turn our focus elsewhere."
Do not resume that thread unless Bob does. The prior session went DORMANT, not closed.

YOUR FIRST JOB IS THE STANDING ONE: read DECISIONS.md and surface every `open` entry.
**There is ONE: DEC-32** — may one finding hold several parallel claims. Read it IN PLACE
before saying anything about it; it carries two clarifications from Bob and a sharpened
test (COUNT THE FALSIFIERS: same proposition, one falsifier, several independent bases ->
plurality inside one finding; different propositions -> different falsifiers -> separate
inquiries composed by recursion). Bob also asked for and received the weakest-leg
justification: min over NECESSARY legs, max over INDEPENDENTLY SUFFICIENT bases — one rule,
two shapes. DEC-32 awaits his read of that answer.

**Register state: 34 decisions.** 30 answered awaiting CONDUCT's enactment (its loop, not
yours to chase), 3 DEFERRED with named triggers — DEC-2 (root of trust; trigger: a real
multi-member instance), DEC-25 (plan publication; trigger: a group asks; any reversal is
PROSPECTIVE ONLY), DEC-31 (addressed non-public delivery; trigger: the first group that
asks; the in-band rule is BOUND NOW — hash, date, author, both floors inside any addressed
rendering).

WHAT THE CLOSING TURNS SETTLED (2026-08-03, all in DECISIONS.md; read before touching
anything they govern):
  - **DEC-28** `divided` is a terminal STATE, not a disposition (session).
  - **DEC-29** division: one authored reason + total disclosure stands; the divide prompt
    stays and its wording must state the disclosure (Bob).
  - **DEC-30** division is author-scoped; concluding needs NO ballot — one name on every
    judgment (Bob).
  - **DEC-33** the publication ceremony PROCESS is deferred (Bob); UI-17 and REC-15 deferred,
    an S8 PLACEHOLDER ships instead; REC-14/REC-22/UI-18 are NOT the process and stay.
  - **DEC-34** the published case is a CONTAINER (zip + signed hash manifest + editions)
    reduced also to PDF renderings, every page brazened with case/edition/authors/bias/
    floors/hash. **The guarantee is TAMPER-EVIDENCE (answer-by-hash), never tamper-proofing
    — PDF write-protect flags are advisory and must never be presented as the guarantee.**
  - RECONCILED §4 is fully resolved except Q14's contradiction bullet (undesigned, honestly)
    and Q14's intent-axis bullet (RECORD's call at build): Q8 -> DEC-28, Q9/Q12/Q13 settled
    by design pass in place, Q7 -> DEC-29, Q10 -> DEC-30, delivery -> DEC-31.
  - **S4 ruling of note: the finder fans out BOTH retrieval routes and only the cross-seam
    FILTERED INTERSECTION is refused** (truncated-list intersection under-reports invisibly;
    the fix is the plane-side join, HOLE-4). Bob likes the design.

PARKED WORK, in order, waiting for Bob to reopen the thread:
  1. **S11 state inventory** — specifiable NOW; the walkthrough is in
     BIO_Case_Making_v0_1.md §6-6b (nothing gates it; DEC-25/D-165 only remove affordances).
  2. **D-164 the content-extent primitive** — ruled by DEC-23, undesigned; folds
     D-161/D-163/D-123. Solve ONCE.

SESSION MECHANICS, unchanged and still binding:
  - One session per tree (DEC-3). The dormant session sits in the MAIN checkout with a
    clean, pushed tree; a NEW session takes `claude --worktree <NAME>`. On ANY resumption:
    `git worktree list`, fetch/rebase, and re-read DECISIONS.md + QUEUE.md — CONDUCT may
    have enacted 30 entries meanwhile and the world will have moved.
  - The review document: source at docs/development/research/review-document.html, published
    at https://claude.ai/code/artifact/7862c5d4-0454-429c-8b9c-00492b61e4ef — edit the file,
    verify, republish **passing `url:` or Bob's link silently breaks**. Favicon in use: 📋
    (keep it stable). Verify diagrams first, every time:
        MERMAID_DIR=/tmp/mmcheck node tools/mermaid-check.mjs \
          docs/development/research/review-document.html
    (install line is in the tool header if /tmp/mmcheck is gone). The in-app browser cannot
    reach claude.ai; verify appearance via a localhost replica (launch.json `mmpreview`) and
    content via WebFetch. Screenshots of the 50k-px page can come back blank — verify by DOM.
  - NOTATION IS SETTLED: classDiagram for structure, stateDiagram-v2 for lifecycle, edges
    labelled with the ACT; never mix, never hand-roll arrow semantics. Bob rejected two
    drafts that ignored this.
  - HOW BOB REVIEWS: as a reader who has not lived in the repo. Terms before definitions,
    precise words used loosely, examples assuming the model, overloaded edges. **When he
    asks a question, ANSWER IT — worked, not deflected.** His questions keep exposing real
    defects ("what that really is is multiple claims" produced the falsifier-count test;
    "why are those grades combined?" produced DEC-21).
  - Do not guess. Do not be lazy. Measure with python (ugrep skips store.mjs on a NUL byte,
    D-131); read the repo rather than recalling it; re-read the review document against the
    register periodically — ten decisions went missing from Part 4 once.

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
