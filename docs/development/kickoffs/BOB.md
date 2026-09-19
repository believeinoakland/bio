# Session BOB — requirements, UX, architecture (with Bob)

The session where Bob and an AI decide WHAT to build and why, and turn each decision into independent,
delegable work. It writes little code; its product is DECOMPOSITION handed to CONDUCT, and it is the one
room where Bob's own decisions are brought and recorded. Cut to its budget 2026-09-18 by BOB #15
(`CLAUDE.md` §1, the reading budget); the receipts behind every rule below are kept verbatim in
`docs/archive/BOB-kickoff-2026-09-18.md`, and `node tools/decided.mjs` still finds its rulings.

**Read, in order:** `CLAUDE.md`, this file, then `kickoffs/BOB-NEXT.md` from `origin/main`. The
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

1. **Fetch, and confirm your handoff is on the remote** (`BOB-NEXT.md` line 1 names you as successor).
2. **Archive your predecessor — the successor's act, ruled by Bob 2026-09-17, needing nobody's click.**
   Find it with `list_sessions`. **Re-check D-398's three conditions AT THE MOMENT YOU ACT:** `isRunning`
   false; its worktree `git status --porcelain` EMPTY; its tip an ANCESTOR of `origin/main`. If any fails,
   STOP and say so. Then `archive_session`, then `git worktree remove` (the tool does not free the disk),
   and report the disk before and after, measured. If the archive is REFUSED, READ THE ERROR: its causes are
   disjunctive and two can hold at once (D-405) — a turn in progress is usually an unbounded poller. **Never
   touch another session's Remote Control** (the tool reserves it for when the user asks).
3. **Sweep the population:** `list_sessions` (limit 50) → a temp file → `node tools/retirable.mjs --self
   <your id>`; archive exactly what it calls RETIRABLE, never a HOLD row. **The standing lanes — CONDUCT,
   BOB, DIST, FLEET, SCHEDULER — are never archived for idleness** (Bob, 2026-09-18); the tool protects their newest
   session, so do not archive one by hand on an idle reading.
4. **Run `node tools/owed.mjs BOB`, `node tools/plancheck.mjs` and `node tools/status.mjs --check`.** And **measure every
   live session's context** (`get_usage` per session): any over 60% is refreshed (Bob, 2026-09-18) — tell it to write its
   handoff, then file its successor's chip. Include yourself.
5. **Read `docs/development/DECISIONS.md` and surface every `open` entry to Bob**, as written: question,
   what runs provisionally, the alternative, the recommendation, what reversing costs. When he answers,
   write `response:` and `decided:` and set it `answered`; CONDUCT enacts. An open decision never blocks
   work — every entry carries a `provisional:` line. An empty file is worth one line.
6. **Tell CONDUCT you are up**, by `SendMessage`.

## Closing a turn: the handoff is the deliverable

1. **Publish, then verify from the remote.** `node tools/plancheck.mjs` before any push; the push guard
   refuses a stale `DECIDED.md`, merge markers, a stale design-corpus date, and construct status that
   disagrees with the code.
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
`INTERFACES.md`, appends to `DEBT.md` and `MEASUREMENTS.md`, the `BOB INBOX`, `DECISIONS.md` answers, the
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

## Spawning and retiring lanes

**Spawning a missing area session is this lane's act, and the mechanism is the chip** (Bob, 2026-09-10):
ensure the area's kickoff exists, then file a `spawn_task` chip whose prompt is a SELF-CONTAINED paste
block — read `CLAUDE.md`, then the kickoff, fetch, verify state from `origin/main`, claim before editing —
and Bob clicks once. A saturating session is replaced the same way: it writes its `<AREA>-NEXT.md` first,
and the chip refuses to work if that handoff is absent from the remote.

**A stand-down is not a retirement.** A stood-down session keeps running and may hold its worktree; its
successor archives it (above). From the moment a successor exists it owns the checkout: a replaced session
that receives a late report MESSAGES its successor and writes nothing into any tree. The last act of a
handoff is to SAY you are ready to be closed and name what closing you releases, measured.
