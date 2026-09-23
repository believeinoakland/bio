# CONDUCT-NEXT — the resume prompt for CONDUCT #15, in cloud Claude Code under Bob's second account

> Written by CONDUCT #14 on 2026-09-23 (UTC), refreshing at 68.5% context (04:45Z) (CLAUDE.md §4). You have no memory of this session;
> everything below is on `origin` (main and `coord`) and is checked by §1's commands, not by recall. Where the tree
> disagrees with a line here, the tree is right.

## 1. RE-MEASURE BEFORE ACTING

```
git fetch origin
node tools/coord.mjs read docs/development/kickoffs/CONDUCT-NEXT.md | head -1   # names YOU, CONDUCT #15
node tools/plancheck.mjs                    # a fresh clone installs the push guard here; expect 0 fail
node tools/coord.mjs read docs/development/QUEUE.md | grep -E '· running'
node tools/train.mjs list                   # WAITING land/* branches are yours to land
git ls-remote --heads origin 'worktree-agent-*'   # judge by ANCESTRY of origin/main, never by presence (§5)
```

`node -v` must read v26 and `git rev-parse --is-shallow-repository` false. 4 cores, 15 GiB, ~23 GiB disk free at handoff.
A fresh clone holds NO gate record, so your first gate is FULL.

## 2. HOW THE ESTATE WORKS NOW — three things changed in this session, each LANDED and verified from the remote

1. **THE MESSAGE BOARD IS ON `coord` (M0-110).** CLAIMS, QUEUE, BACKLOG, BACKLOG-LATER, DEBT, every `-NEXT.md` and
   `docs/archive/ledgers/` are one-line `COORD-POINTER:` files on main. Read with `node tools/coord.mjs read <path>`, write
   with `node tools/coord.mjs write` (`--status`, `--row`, `--insert`, `--append`, `--line`, `--replace`, `--intents <json>`).
   A write never moves main. Your one word (`queued` → `running`) is a `--row` or `--status` write on coord. Never edit a
   state path on main: plancheck §10 fails it. Since M0-119, EVERY coord write rebalances BACKLOG.md onto
   BACKLOG-LATER.md (150 KiB budget).
2. **ONLY THE TRAIN LANDS MAIN (M0-111).** Lanes and workers push `land/<lane>/<topic>`; you run
   `node tools/train.mjs run` (it lists every waiting `land/*`, merges each into `train/<id>` from origin/main, gates ONCE,
   writes the train record and pushes with a `Bio-Train:` trailer). The push guard refuses any push of main without that
   mark. The train cannot do a JUDGEMENT merge: when branches conflict or floors need re-reading, merge them by hand in an
   integration branch, re-read floors on the committed merge, gate it locally GREEN, push it as `land/conduct/<batch>`,
   then run the train (it re-gates; M0-122, being built by BOB, removes that second gate and adds a retry).
3. **GATES ALSO RUN ON GITHUB (M0-114).** `.github/workflows/gates.yml` gates every `land/**` and `integrate/**` push on a
   runner (875 s full); the push guard reads the commit's `gate` check. **BOB'S RULING, 2026-09-23 (TREE-SHARING §3): every
   red run EMAILS BOB, who keeps them as an ALARM.** Push a `land/*` branch only after its own local gate is GREEN on that
   exact tree; never push a negative control to a workflow-triggering branch; brief every worker with both. Whoever pushes a
   red branch diagnoses it at once.

## 3. WHAT CONDUCT #14 LANDED (each by merge sha on origin/main; read them with `git log --merges origin/main`)

REC-166 (IC-175) · REC-165 (IC-176, AUTHORITY) · M0-107 · REC-167 (IC-177) · M0-110 + the coord cutover · UI-77 · M0-117 ·
M0-116 (NARROWED; residue M0-121) · M0-111 · REC-168 (IC-178, AUTHORITY) · M0-114 · M0-119 (+ its coord data act) · DIST's
0.72.0 release pointer (at `30475ca6`) · BOB #29's branches incl. the coord-state verdict fix · D-442 (IC-179, RECORD-INTEGRITY; train at
`f05c1efd`) · DIST's 0.73.0 release pointer (the REC-168 cut) + BOB's rulings-0923 + gate-rerun-failed (a RED tree re-runs only
its failed suites) at `95c40ed9`. I3 49.2.0 → 54.0.0; I5 1.24.0 → 1.25.0. Every train landed GREEN FULL (last: 282/282 · 17,045).

## 4. IN FLIGHT AT HANDOFF — resume each

- **Live CONDUCT #14 workers** (each reports to #14; if #14 is gone, READ THE BRANCH — the claim is on coord — and
  integrate from the pushed `worktree-agent-*` branch): **M0-100** (`worktree-agent-a08c137666a63d52b`), and wave 7 flipped at
  coord `2b2868c5`: **UI-79**, **D-85**, **M0-121** (their branches: `git ls-remote --heads origin 'worktree-agent-*'` newer
  than `f05c1efd`), and a DIAGNOSIS worker for the runner leak (below). None had reported at handoff. #14 stays up
  until you archive it and RELAYS each report to you by trigger AND as a file on the never-merged branch
  `conduct14/reports` (`git fetch origin conduct14/reports && git show origin/conduct14/reports:<ROW>.md`). M0-121 has
  REPORTED there (GREEN FULL 283/283; branch `worktree-agent-adeead91b1dad5478` @ 499644a0): integrate it.
- **UI-80** (D-442's UI half, the `/2` case readers) is cached and FIRST of the product corrections — NOT spawned; spawn it.
- **M0-122** (train retry + no second gate of a recorded-GREEN tree): BUILT BY BOB #29; RETURNED on a TREE-SHARING.md
  conflict; BOB re-pushes `land/bob/m0-122-train-retry`. **`land/bob/gh-once-per-batch`** (Bob's ruling "1 github run per
  batch": gates.yml runs only on `main`) follows. Land each when WAITING; spawn no worker for either.
- **M0-126** (ADOPTED by BOB: the shared per-suite content-addressed result record) heads the backlog, blocked until
  gate-rerun-failed is on main — it now is. **M0-127**: the runner leak and the FAILED=none verdict line.
- **Bob asked (04:10Z) for per-suite result reuse**: I answered with a content-addressed per-suite record (suite + hash of its
  inputs → PASS), shared on an append-only branch so the runner and every container reuse it; sent to BOB #29 as design.
- **Runner-only red**: the GitHub gate on tree 6ef503c4 read RED with 282/282 green — 2 miniflare sandboxes leaked in the
  runner's TMPDIR (D-186) and the annotation says FAILED=none. Traced to D-442's change (the pre-D-442 runner run leaked 0). The diagnosis worker names the suite; M0-127 holds the fixes. Meanwhile land MY
  batches with `train.mjs run --branch <local ref>` (no `land/conduct/*` push, so no workflow run, so no email to Bob).

## 5. TRAPS THIS SESSION PAID FOR

1. **A BIO_COORD_REF pin set on the whole train breaks `coord.test`**, whose fixture clone cannot see a local branch. Never pin
   the train's environment; if coord content threatens the gate, rebalance on coord and ask SCHEDULER to hold placements.
2. **The gate read LIVE coord content** (strandedwork §9 → plancheck --local P5): a placement mid-gate turned two trains red.
   FIXED at `f05c1efd` by BOB's coord-state verdict (plancheck --local warns on coord state; coord.mjs checks still fail).
3. **The proxy refuses every ref deletion** ("Everything up-to-date" after a disconnect). Landed `land/*` and
   `worktree-agent-*` refs stay listed; the train reads them LANDED by ancestry. `m0114-negctl` and `m0114-negctl-2` carry a
   deliberately broken suite and need a GitHub-side delete (with BOB, for Bob).
4. **Two branches moving the same floor keys from one base**: re-read REGISTER_FLOOR and the DEC-49 guard's keys from their
   own prints on the COMMITTED merge; never sum by hand. When moving a floor comment onto its own line, keep only its own
   `/* … */` segment — the shared history on the same line ends in an open comment and will swallow the key below it.
5. **A worker branches from THIS session's HEAD**: HEAD must equal origin/main at spawn (not a train or integration branch).
6. **Lane-to-lane messages are one-shot triggers** (`create_trigger` with `persistent_session_id`); SendMessage reaches no
   other cloud session. Session ids: `list_sessions`. Self-wake: `send_later`.
7. **Scratchpads are shared with workers** — brief each to use its own `mktemp -d`.

## 6. OWED, WITH ITS ACTOR

- BOB: put "require the runner's `gate` check on main" to Bob as one setting (BOB #29's own ruling trigger fired when M0-114
  landed); the GitHub-side delete of the two negctl branches.
- SCHEDULER: mark done and archive what §3 lists as integrated since its last archive; M0-125 vs BOB's coord-state branch.
- DIST: REC-168 and D-442 are on main but not in 0.72.0 — next cut.

## 7. THE STANDING LANES

BOB #29, SCHEDULER #14, DIST #5, FLEET #4, each in its own cloud container. CONDUCT #14's self-wake is a `send_later`
chain; delete nothing of it for you — it dies with the session. Line 1 of YOUR handoff names CONDUCT #16.
