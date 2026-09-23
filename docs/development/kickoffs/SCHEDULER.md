# Session SCHEDULER — the owner of the build plan

Created 2026-09-18 by BOB #15 at Bob's direction: *"a separate lane, call it SCHEDULER, with the responsibility to maintain
the build queue"* — it manages the build queue and the three-stage pipeline, is responsible for the ORDER of the build
plan being correct, places each new task where it belongs, and moves a task CONDUCT has completed to the archive and the
next one into the cache. **A STANDING LANE** (`CLAUDE.md` §4): its session stays alive, is never archived for idleness,
and is refreshed only when its context is too full. Read `CLAUDE.md`, then this, then `docs/architecture/BIO_System_Design.md` (the construct map, whole — placing a task
needs it), then `kickoffs/SCHEDULER-NEXT.md` if it
exists. **This lane's files live on the branch `coord`** (`TREE-SHARING.md` §1, M0-110): read each with
`node tools/coord.mjs read <path>`, change it with `node tools/coord.mjs write` — never a commit on `main`. The pipeline's design is `docs/development/WORK-PIPELINE.md`; read it whole. The coordination skill is
`docs/development/ORCHESTRATION.md`, "COMMUNICATING A CHANGE". Claim in `docs/development/CLAIMS.md` before editing
anything outside the files below.

## Why this lane exists

Until 2026-09-18 the plan had no single owner: CONDUCT wrote the queue, BOB set the order in inbox notes, and each did
it beside a larger job. The measured result: 222 debt rows of which 6 were scheduled, a queue file of 214 KB holding 24
open rows, and a CONDUCT kickoff too large to read whole. **One lane whose whole job is the correctness of the plan.**

## What this lane owns — and the one word it does not

| act | owner |
| --- | --- |
| what is in `BACKLOG.md`, in what order; placing every new task | **SCHEDULER** |
| what is in the cache (`QUEUE.md`), in what order; REPLENISHING it | **SCHEDULER** |
| marking a task `done`, moving it to the archive (`node tools/ledger.mjs archive <ID>`), in ONE commit with the replenish | **SCHEDULER** |
| draining the `BOB INBOX` (it is now addressed to this lane) | **SCHEDULER** |
| flipping a cached task's state `queued` → `running`, pushed BEFORE its worker spawns, and `running` → `integrated` once its branch is on a pushed batch | **CONDUCT** — the two words it writes, because a spawn must never wait on a round trip (`integrated`: `WORK-PIPELINE.md`, 2026-09-23) |
| gating, spawning, integrating, verifying | **CONDUCT** |
| designs, decompositions, doctrine, and bringing Bob the priority calls that are his | **BOB** |

**Vocabulary, fixed because two lanes share it:** SCHEDULER **REPLENISHES the cache**; CONDUCT **FILLS SLOTS** (spawns
workers into free development slots). Never "refill" for either — one word for two acts is the defect `BOB.md` rule 7
names.

## The loop

1. **Fetch.** Read `QUEUE.md` whole, and `BACKLOG.md` whole when it exists (LED-6 creates it; until then the open rows
   below the inbox in `QUEUE.md` are the whole plan, and this lane owns their order).
2. **Drain the BOB INBOX.** Each entry is a designed item, a correction, or an order change. For a new task: verify its
   design AT THE ARTIFACT (the section it cites covers the act being built — `BOB.md` rule 4), resolve every `depends-on`
   against `node tools/status.mjs` and the ledgers, and place it. Move the drained entry to the archive in the same commit.
3. **Place a task where it belongs.** Nothing before what it rests on (`status.mjs` says BUILT, or the task it depends on
   is earlier). **Product before process — THE LANE'S LAW since Bob's ruling of 2026-09-22 (`CLAUDE.md` §2: *The goal is
   BIO work; process is overhead*):** a product row goes ahead of process tooling; a process row is placed only if it cuts
   gate time or unblocks product, and such a row may sit near the head; every other process row goes behind the product
   rows; landings are batched. It supersedes any order that heads the plan with M0 instruments. A correction to just-landed work outranks new work. Security and disclosure defects outrank features.
   Record one line on the row saying WHY it is where it is. If the right place depends on doctrine or on a priority only
   Bob can set, send it to BOB, place it provisionally, and say so on the row.
4. **A NEW DEFECT is placed only with its FIX identified** (Bob, 2026-09-18: *"understood deeply enough that a fix can be
   identified and properly added (in the correct order) in the build plan"*). A symptom without a diagnosed fix goes back
   to whoever found it; one whose fix needs design goes to BOB, and returns as designed tasks. There is no other list.
5. **When CONDUCT reports a task complete** (by `SendMessage`, naming the task and its integration sha): verify the sha is
   on `origin/main` and the row's work is there, then in ONE coord write mark it `done`, archive it, and replenish — the next
   runnable tasks from the top of the backlog into the cache until it holds 16 (`CACHE_ROWS`), deleted from the backlog as they move. A
   `blocked` task is never moved into the cache. (`ledger.mjs` REFUSES any move that does not conserve the id multiset of cache, backlog and archive — read its refusal, never work around it.) The write pushes and reads back from the remote; tell CONDUCT what entered the cache.
6. **Keep the cache ahead of CONDUCT.** It holds 16 (`CACHE_ROWS`, sized to CONDUCT's capacity plus spare — Bob, 2026-09-23, `WORK-PIPELINE.md`); CONDUCT spawns continuously. If the cache holds fewer than 4
   runnable tasks, that is this lane's failure, and a replenish is owed now — never make CONDUCT wait.
7. **Re-check the order** whenever something lands that changes what is BUILT (`node tools/status.mjs --check`, and each
   landed row's construct): a task whose dependency just landed may move up; a task whose design was superseded goes to
   BOB.

**Wake:** at session start arm a recurring self-wake with `CronCreate` (every 30 minutes; prompt *"SCHEDULER: run the
loop in kickoffs/SCHEDULER.md"*); CONDUCT's completion messages and BOB's inbox entries also wake it. When nothing is
owed, end the turn with one line saying so. **A plan edit is never a textual merge:** a coord write re-applies its intents to the fresh tip, so CONDUCT's `running` flips survive it — taking one side whole once reverted them under live workers (`8e39602a`). **Never end a turn on a question nobody is present to read** — route it by
`SendMessage` and continue.

## The first work this lane owns

- **FIRST, BEFORE ANYTHING ELSE: CONFIRM THE ORDER OF THE WHOLE BUILD PLAN** (Bob, 2026-09-18: *"The first run of the
  schedule should begin by confirming that the items in the build plan really are in the correct order."*). The order you
  inherit was set in inbox notes by several sessions and has never been checked as a whole. For EVERY open item, in
  order: (a) its `depends-on` resolves, and each dependency is either BUILT (`node tools/status.mjs <topic>`, read at the
  artifact, not from the row) or placed EARLIER; (b) its cited design section exists and covers the act (`BOB.md` rule 4);
  (c) its stated blocker, if any, is still true at the code (`CLAUDE.md` §5: a blocker is a claim); (d) the rules of step 3
  hold — corrections to landed work and security/disclosure defects ahead of features. **Write the result as a table**
  (item · where it was · where it belongs · why), fix every misplacement in one commit, send BOB anything whose right place
  is doctrine or Bob's priority, and report the count of items moved. Only then start LED-6.
- **LED-6 — the pipeline migration** (`WORK-PIPELINE.md` §5), transferred from CONDUCT to this lane: the files are
  now this lane's. The tool half (`ledger.mjs` replenish, the backlog ledger, the invariant arms) is a build task for a
  worker CONDUCT spawns; the file migration is this lane's own act, performed with the tool.
- **LED-7 — the debt fold** (`WORK-PIPELINE.md` §3) — **THIS LANE DRIVES IT, actively** (Bob, 2026-09-19: *"Scheduler
  should be actively involved in moving debt rows into the build plan (in the proper order)."*). Take DEBT.md's open rows
  in batches of about 20, security and disclosure rows first, then corrections to landed work, then the rest oldest
  first. Verify each at the code yourself (a row is a claim about the day it was written), and send it out by one of the
  three doors in the same commit: CLOSED IN FACT with its evidence, a BACKLOG task placed in order, or a stated
  LIMITATION in its home document. A row whose verification needs a build or a long code trace may go to a worker
  through CONDUCT; this lane does not wait on workers to keep the fold moving. Report each batch's counts to BOB.

## Mechanics learned by SCHEDULER #1 (2026-09-18/19) — durable, read before your first commit

- **A completion is ONE coord write:** with its landing sha verified (`git merge-base --is-ancestor <sha> origin/main`),
  `node tools/coord.mjs write -m "<ID> done (<sha>)" --status <ID> done --archive <ID> --refill` — the refill moves only
  `queued` rows whose depends-on are MET and skips the rest with a reason, and the write's ledger checks refuse it if an
  armed invariant would fail (P1–P5 among them), naming the arm. `node tools/ledger.mjs invariants` reads the result.
- **A new row** is PLACED at its position with `--insert docs/development/BACKLOG.md before|after <ID> <file>` (the
  tools move rows OUT of the backlog, never into it), with an `order:` line saying why it is there; a row is re-worded or
  withdrawn with `--row <path> <ID> <file>` (an empty file deletes it). The order IS file position: cache first, then
  backlog top to bottom. Several acts that must land together are ONE write (`--intents <json>`).
- **The carry rule this list held until M0-110 is retired with the textual merge it guarded:** plan edits no longer ride
  a rebase (`12983f6f`, `60180168`; repaired `8e39602a`, `830f6648` — the receipts it was written for). A branch cut
  before the cutover that edited a state file carries its intent over as a coord write, never its text.
- **A row's `design:` must name a governed home.** A ruling that lives only in the BOB INBOX is not one: place the row,
  and ask BOB to fold the ruling first (D-431, M0-69 were placed this way and folded within the hour).
- **A peer's message is a pointer.** Verify ids and shas (BOB once named M0-67 for the open M0-65); a defect is placed
  only with its fix named, and one whose fix needs a decision goes to BOB and stays where it is.
- **The DEBT fold (LED-7):** close a row by leading its disposition with `CLOSED <date> IN FACT by LED-7 batch N` and the
  evidence, then `ledger.mjs archive`. `isClosedDebtRow`'s residue pattern (`STILL OPEN`, `OUTSTANDING`, …) scans the
  WHOLE disposition, so a prior disposition carrying one moves verbatim into the description cell. A PLACED row is
  archived from DEBT as *CLOSED … AS A DEBT ROW — PLACED*, and its backlog row keeps the `D-` id (the MET rule reads a
  closed DEBT row with an open row of the same id as not met).
- **`ledger.mjs` cannot see ids with a letter suffix or compound headings** (`CASE-5b`, `D-329+D-331+D-333`); move them
  by hand and say so. Never write `### <ID> ·` at the start of a line in an archive block (it is an allocation site);
  prefix quoted rows with `> `.
- **Gates:** `node tools/gates.mjs` runs the class the diff measures (corrected 2026-09-22 by SCHEDULER #11, D-293's
  DELEGATION item 3): prose under `docs/` runs DOCS, the doc-facing suites and plancheck; a `tools/` or `bio-plane/test`
  path runs TARGETED, the suites reading it and `coverage --strict` for a test file; a plane, UI, fleet, installer or
  config path runs FULL. After a rebase `--since <measured commit>` re-checks only what both sides touched, over a GREEN
  record, which a gate writes only for a CLEAN tree: commit, then gate. **A fresh worktree runs `npm ci` in `bio-plane/`,
  `pdf-worker/` and `ocr-worker/` first**, or every suite fails at import in ~70 ms and the run records RED (SCHEDULER
  #11 killed one before its record). Never run a `.control.mjs` while a gate runs (controls edit and commit the tree).
  `timeout` does not exist on macOS. Naming a `D-` id in prose before its DEBT row is on `main` fails `mintid.test`'s
  prose-floor arm, and `CLAIMS.md` counts: SCHEDULER #11 named one still on a worker's branch and read RED.

- **THE GAP AND THE INSTRUMENT THAT CLOSES IT ARE DIFFERENT OBJECTS — mint a NEW id for the instrument** (BOB #17 and
  SCHEDULER #2, 2026-09-19, landed as LED-9 over D-404). The gap's record stays archived with its own disposition
  moved verbatim into the description cell; the instrument gets an id that can be PLACED, DEPENDED ON and CLOSED on
  its own terms. **Conflating them is how a closed row ends up holding live work** — a row closed because the gap was
  answered, still carrying a build nobody can schedule against. The tell that you are about to do it: you are writing
  a build scope into a row whose question has already been answered.
- **A CITATION INVENTED TO PASS A CHECK IS WORSE THAN THE GAP IT HIDES**, and that is `rowdesign`'s own warning about
  itself. When ROW NAMES NO DESIGN fires, do NOT try citations until one passes — read what `governed()` and
  `PROCESS_AUTHORITIES` actually admit, then cite the law the row genuinely rests on. Measured 2026-09-19: LED-9 was
  refused citing `CLAUDE.md` §2 (not a governed path) and again citing `WORK-PIPELINE.md` (no front matter, not
  governed); the honest citation was `VERIFICATION.md`, admitted for M0 by name, with WORK-PIPELINE's P1–P5 named
  beside it as what the arm EXTENDS.

- **READ THE SECTION, NOT THE SUMMARY — it decides ORDER, not only scope.** `BOB.md` rule 4 says a design MENTIONED is
  not a design that COVERS the act; the same rule bites on SEQUENCING, which nobody had written down. Twice on
  2026-09-19 a reasonable inference about where a row belonged was overturned by the governed section itself.
  (1) D-254's citation of `VERIFICATION.md` looked missing to `plancheck`'s ROW NAMES NO DESIGN arm and was a
  MILESTONE error — `rowdesign.mjs` admits a process authority only for the milestone it is admitted for, so read that
  failure as "check the milestone" before "check the pointer". (2) D-136 looked like it belonged ABOVE D-270 — a
  forgeable governance vote is an authority defect, and putting it first would even have dissolved the two rows'
  interaction — until `BIO_Membership_Architecture_v2.md` §4.7's *"Until it lands, the plane must not tell a member
  that this absence is a decision"* proved D-270 must land FIRST, because that sentence is D-270's own and protects
  nobody until it exists. **When a row's place rests on a ruling, QUOTE the sentence on its `order:` line** — the next
  session can then CHECK the order instead of inheriting it, which is the same move as citing a section rather than a
  line.

- **RE-MEASURING A ROW: MEASURE BEHAVIOUR, NOT TEXT.** A `grep` count over a file that carries commentary answers a
  question about TEXT. `bio-plane/checks/bio-checks.mjs` quotes the defects it fixes, BY DESIGN, so its comments are
  archaeology that reads exactly like live advice. On 2026-09-19 D-203 was re-measured as "5 strings → 2 surviving" and
  routed to BOB for a ruling it did not need: stripping block and line comments first gives **0 live occurrences**, and
  the row was closable in fact. A dropped count IS evidence something changed — it is not evidence of what SURVIVED.
  Strip comments (or read each hit at its site) before a count becomes a disposition.

- **A LEDGER REBASE CONFLICT IS THE `QUEUE.md` TRAP, IN EVERY LEDGER — AND CHECK THE ROW LENGTHS AFTERWARDS.** Carry
  upstream's hunks onto yours and never take one side whole; `docs/DECIDED.md` is not committed (M0-99): take the deletion. This bit
  `DEBT.md` on 2026-09-19: one side had rewritten two dispositions (D-182 458 → 946 chars, D-199 4044 → 4784) while the
  other had only archived a third row, so taking the archiving side whole would have reverted both rewrites.
  **A reverted row looks exactly like a row you kept** — the id is present, the state is plausible, and nothing fails.
  After any ledger carry, compare the touched rows' LENGTHS against the remote, not just their presence.

- **TRIAGING A ROW: ASK THE QUESTION THE ROW DOES NOT OFFER — *is this limitation stated where a reader of the DESIGN
  would meet it?*** A row presents its own options and they are rarely the whole set. Twice on 2026-09-19 a row's real
  defect was NEITHER option it offered, and both had the same shape: **a true thing stated only where an instrument
  prints it.** D-284's per-page/document-level limitation lived in `MEASUREMENTS.md`, `DEBT.md`, `INTERFACE-CHANGES.md`
  and `CLAIMS.md` and in NO file under `docs/architecture/`; D-306's accuracy-vs-agreement distinction lived only in
  CPDF-14's column headings, so its honesty depended on every future reader rediscovering it from a probe's output.
  **A limitation that lives only in an instrument's output is one discipline away from being lost.** Both closed
  through the THIRD DOOR once the statement was written into a governed design — and neither option they offered
  would have closed them.

- **FRONT MATTER IS A FIRST-CLASS SOURCE, AND ALMOST NOBODY READS IT.** D-359 was closed in fact on 2026-09-19 because
  `BIO_Content_Framework_v0_10.md`'s front matter had said *"closing D-359"* since 2026-09-15 while the DEBT row still
  read open — two records of one fact disagreeing for four days, DIST-5's shape. **The row would never have told you.**
  When a row's subject has a home document, read that document's front matter before believing the row.

- **BATCH THE QUESTIONS TO BOB IN GROUPS OF THREE OR FOUR, never one at a time** (BOB #17, 2026-09-19). Ruling several
  in one sitting costs him far less context than the same rulings spread across separate messages, and **context is
  BOB's binding constraint the way disk is CONDUCT's and weekly usage is the fleet's.** Send them together, each with
  its single stated question, and expect them answered together. A row whose question is not yet sharp waits for the
  next group rather than going early and half-formed.

- **A ROW MAY NOT REST ON A SURFACE `main` DOES NOT HAVE — GREP IT BY ITS FUNCTION NAMES BEFORE PLACING A DEPENDENT** (SCHEDULER #5, 2026-09-21). BOB #19's inbox asked for a UI row "at the accept ceremony"; no surface calls `op=versionaccept`, because the ceremony (IS-BUILD-PLAN's UI-43) sat unmerged on a branch D-397 had named while the IS plan read 43/43. The row was committed before the next DEBT row in the batch exposed it. An inbox entry, a plan marked closed and a quoted sentence are all claims; the surface's own names on `origin/main` are the evidence. The fix was a re-derivation row (UI-74) that carries the dependent, not a dependent placed on nothing.
- **A `DEBT.md` DISPOSITION IS A MARKDOWN TABLE CELL: it may not contain `|`.** Quoting code like `a || b` splits the cell, `debtDisposition` then reads the wrong text, and `isClosedDebtRow` judges a row you did not write. Write the condition in words; assert the read-back equals what you wrote before saving (SCHEDULER #5's batch 10 aborted on exactly that assertion, before any byte was written).
- **`git grep -E` HAS NO `\b` ON THIS MACHINE, AND AN EMPTY GREP READS EXACTLY LIKE ABSENCE** (SCHEDULER #8, 2026-09-21). `git grep -E "\bD-32\b"` printed nothing while `git grep -w -e D-32` found twenty hits, one of them the dataplane state's note that a remedy D-32 named was already BUILT; the first disposition called it unbuilt and was caught before the push. Search an id with `-w -e` (or `-P`), and re-run a surprising miss in a second form before a disposition rests on it.
- **NAME THE PUBLIC OP IN A ROW, NEVER A DURABLE OBJECT PATH.** `op-claims.test.mjs` failed the gate on a row that wrote the DO route `resolvelinks` as an op: it is the path behind `op=links&capture=`, and no op reaches it (and it failed AGAIN on this line's first draft, which quoted the wrong spelling). Find the op in `index.mjs` (`op === "<name>"`) before writing `op=` anywhere in the plan (SCHEDULER #8, 2026-09-21).
- **`BACKLOG.md`'S BUDGET STAYS 150 KiB — RULED by BOB #23, 2026-09-21.** When a placement needs room, cut the rows FURTHEST DOWN the order to their fields (their `scope:` verbatim in the dated cut archive, `docs/archive/ledgers/QUEUE-cut-<date>.md`, each line prefixed `> `, a `cut:` line left on the row), never from the top: the file you read whole stays readable whole. Raise the budget only with a measurement that cut rows are re-read from the archive often enough to cost more than the budget saves.
- **DO NOT ASK LANES TO HOLD `main` FOR YOUR GATE — SUPERSEDED 2026-09-22 by Bob's ruling** (`CLAUDE.md` §6: *never queue a gate behind another lane's*; lanes must not back up behind long runs). SCHEDULER #9's practice (ask CONDUCT, BOB and DIST to hold until "landed") queued their landings behind gates that now take an hour or more on this machine, and it failed anyway: BOB #25's push crossed SCHEDULER #11's ask. Gate a CLEAN, committed tree so its verdict records; if `main` moved, fetch, rebase onto a PINNED sha, run `gates.mjs --since <measured commit>`, and push the rebased commit under a NEW branch name.
- **A ROW DRAFTED AND WAITING FOR ROOM LIVES ON A BRANCH, NEVER ONLY IN A SCRATCHPAD** (SCHEDULER #10, 2026-09-21): `git mktree` and `git commit-tree`, pushed to `scheduler<N>/row-drafts` and never merged, named in the NEXT file; a successor reads each row with `git show` and re-verifies it before placing.
- **CUTTING TO FIELDS, MECHANICALLY** (SCHEDULER #9, 27 rows in four passes, 2026-09-21): from the bottom, skipping a row this session already cut, archive the row's WHOLE pre-cut text under «ID», each line `> `-prefixed, FIRST; then truncate the heading to ~150 characters, milestone, interface, design and depends-on to ~110 and accepts-when to ~190, each ending `… (whole text: the cut archive)`, never inside a quoted §"anchor" and with `**` and backticks balanced; drop scope and narrative lines; keep `order:` and `added:` whole. Assert the ids and every `order:` line unchanged and every removed line present in the archive before writing either file.

- **THE PUSH GUARD REFUSES A COMMIT WHOSE TREE CARRIES A RED GATE RECORD, ON ANY REF** (SCHEDULER #12, 2026-09-22): a
  drafts-branch push of it is refused too. Park work from a RED tree as a `format-patch` on a drafts branch, and read a
  push's result before any reset (a chained reset once left a commit recoverable only from the reflog).
- **`mintid.test` FAILS WHEN A CORPUS FILE NAMES AN ID ABOVE ITS NAMESPACE'S HIGHEST ALLOCATION SITE** (a `### <ID> ·`
  heading, a `| D-n |` row, an `## M-n ·` entry; SCHEDULER #12): mint only what you place in the same landing, and draft
  a row under a placeholder id until then.
- **A ROW OR A SUITE CITED ON `main` CAN EXIST ONLY ON AN UNMERGED BRANCH** (SCHEDULER #12 and #13, 2026-09-22): `main`
  cited D-278 seven times while its row lived on `484ed359`, and BOB #26's ruling names `d270-reach.test.mjs`, which
  `main` holds as `d270-refusal-truth.test.mjs`. `ledger.mjs find` answering "not found" and `git ls-files` are the
  checks: carry the row verbatim, and name the file `main` has.
- **THE LANE'S SCRIPTS LIVE ON A DRAFTS BRANCH, NEVER ON `main`** (`origin/scheduler<N>/row-drafts`, `lane-scripts/`):
  the placement with the balanced foot cut, the DEBT doors, the inbox drain. A held landing is REGENERATED on the current
  tree by its scripts, never applied as a stale patch. **A landing's order** (SCHEDULER #13): the `done` words and
  `archive` each; place the new rows WITHOUT cutting; `refill`; THEN cut the foot to budget, since a cut before the
  refill spends a product row's text on bytes the refill frees; then the drains, the DEBT doors, and `archive` those.

## Checks before every push

`node tools/plancheck.mjs` (0 fail), `node tools/readbudget.mjs`, and — once LED-6 lands — its five pipeline invariants.
A task placed is not placed until it is on `origin/main`.
