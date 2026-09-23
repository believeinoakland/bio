# SCHEDULER-NEXT — the resume for SCHEDULER #15, in the cloud (written 2026-09-23 by SCHEDULER #14 at its refresh)

Read `CLAUDE.md`, then `kickoffs/SCHEDULER.md` (its mechanics section is the practical half; several of its file-level
steps are SUPERSEDED by `coord`, below), then `docs/architecture/BIO_System_Design.md` whole, then this, then `QUEUE.md`
and `BACKLOG.md` whole **from `coord`** (`node tools/coord.mjs read <path>`). Measured at SCHEDULER #14's refresh
(2026-09-23 ~06:00Z, `origin/main` @ `1755e57c`, `coord` @ `01491efc` or later). A POINTER: re-measure before resting on it.

## What changed under this lane on 2026-09-22/23 — read before your first write

- **STATE LIVES ON `coord` (M0-110).** `QUEUE.md`, `BACKLOG.md`, `BACKLOG-LATER.md`, `DEBT.md`, `CLAIMS.md`, every
  `-NEXT.md`, `PLACEMENT.md` and `docs/archive/ledgers/` are one-line pointers on `main`. Read with
  `node tools/coord.mjs read <path>`; write ONLY with `node tools/coord.mjs write -m <msg> <intents>` (`--status ID state
  --note`, `--row path ID file` (an empty file deletes), `--insert path before|after ID file`, `--archive ID`, `--refill`,
  `--append`, `--replace`). A coord write moves no `main` tree, needs no gate, and runs the ledger checks itself
  (`coord.mjs checks`: 13 arms). `--replace` is WHOLE-FILE and clobbers a concurrent write: build it from the fresh tip and
  compare the push's `was <sha>` with the base you read. SCHEDULER never pushes `main` now.
- **`main` lands only through CONDUCT's train (M0-111, `tools/train.mjs`)**; a lane pushes `land/<lane>/<topic>`. The
  GitHub gate (`.github/workflows/gates.yml`, M0-114) runs on every push, and **a red run emails Bob as an ALARM**
  (TREE-SHARING §3, Bob's ruling 2026-09-23): never cause a false red.
- **The backlog's tail moves to `BACKLOG-LATER.md` (M0-119), 150 KiB restored;** every coord write rebalances with
  `main`'s `coord.mjs` — FETCH `main` first. A write made with older code once pushed coord over budget and reddened two
  trains (my placements, 2026-09-23 ~02:30Z). Whether EVERY write should rebalance is with BOB (DELEGATION below).
- **Lane-to-lane messages are one-shot `create_trigger` calls into the peer's session** (`persistent_session_id`);
  SendMessage reaches no other cloud container. CONDUCT #15 is `session_01DvbsQsqBM5Pjn2rcHk5rZ3`; FLEET #4 is
  `session_01YB9VgJtjiXwQ5vtx4fLvRB`. BOB's session id was never sent to me: reach BOB by a DELEGATION in `CLAIMS.md`.
- **CONDUCT reports each integration by trigger; the train commits on `main` are the report of record.** Verify BY
  CONTENT (the sha an ancestor of `origin/main` AND the row's work at the code), then ONE write: `--status ID done --note`,
  `--archive ID`, `--refill`; then trigger CONDUCT naming what entered the cache. A cut row entering the cache is restored
  WHOLE from `QUEUE-cut-2026-09-22.md` (`--row`, with an `uncut:` line) so its design line reaches the spawn.
- **Your self-wake:** this session's hourly routine (`trig_0193mK7h2ChPtjFVrGG39QUg`) fires into SCHEDULER #14's session;
  arm your own with `create_trigger` (hourly is the minimum) into YOUR session, and ask BOB to delete mine when you
  archive me.

## The plan as I left it

- **Cache (8):** LED-7 (this lane's own act) · running M0-100, UI-79, D-85 (CONDUCT #14's workers), UI-80, D-116,
  CAP-13 (CONDUCT #15's) · M0-127 queued, HELD by CONDUCT until #14's runner-leak diagnosis reports.
- **Backlog head:** M0-126 `blocked` (the shared per-suite result record: BOB #29 adopted CONDUCT #14's design, but it is
  NOT on `main`; add the §3 pointer and unblock when BOB lands it in `TREE-SHARING.md` §3) · M0-106 `blocked` (DIST's
  witness: a cut from a recorded tree runs no battery; 0.72.0's clone had no record) · D-389 · REC-160 · D-57 · D-440 …
- **Placed by me and not yet run:** D-128 (FRAMEWORK, after the honesty batch), D-150/D-147 (M10), UI-79's twin
  findings, M0-118 (live helpers read only `.env`), M0-120 (mintid audit blind to coord), M0-123 (pipeline-readers
  control plants into a pointer), M0-124 (three control arms dead since REC-167), FL-11 + FL-12 (ONE FLEET worker, one
  bundle rebuild, directly before D-260).
- **Ids minted and deliberately UNUSED (gaps):** M0-125 (BOB built the coord-state verdict fix himself,
  `land/bob/coord-state-verdict`, landed).

## Owed acts, in order

1. **CONDUCT #15's completions** as reported (M0-100, UI-79, D-85, UI-80, D-116, CAP-13, M0-127): verify, done, archive,
   refill (D-389 next), trigger CONDUCT.
2. **BOB's answers to four open DELEGATIONS of mine in `CLAIMS.md`**: (a) which coord writes may rebalance (M0-119);
   (b) `op=capturerequest` with no run (REC-168's gap); (c) M0-126's design landing; plus any inbox entry. Discharge each
   with a DISCHARGED line replacing its `open as of` line (a block carrying both reads open to `plancheck`).
3. **LED-7, one batch per quiet wake.** 80-odd open DEBT rows. My batches: S14-1 (D-172 closed in fact; D-167 door 3 into
   `DOCUMENT-PROFILES.md`), BOB #27's and #29's rulings (D-128, D-150, D-147 placed; D-159, D-165, D-129, D-170, D-181
   closed). Next oldest: D-166 (Oakland finance URLs moved; a network re-locate), D-168 (citing retired information:
   doctrine, BOB), D-174 onward. D-121/D-124 are collided ids (LED-8); D-53, D-64 are Bob's.
4. **Findings stated WITHOUT a fix are not placed** (CLAUDE.md §4): D-442's publish-affordance under-offer; the unbuilt
   `coord.mjs carry`. Place each only when its fix is named.
5. **The intent layer's trigger** (the Framework §12): send its design act to BOB when `status.mjs 12.publish` and
   `12.accept` read BUILT.

## Where the lane's scripts are

`origin/scheduler13/row-drafts` (`lane-scripts-13/`: `debtpeek.mjs`, the DEBT-door and placement scripts). They edit
files in the working tree, which is WRONG since the cutover: port a DEBT-door script to build its output from
`git show origin/coord:<path>` and write through `coord.mjs --replace` with the base-sha check, as SCHEDULER #14 did.
