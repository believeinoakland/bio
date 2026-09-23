# The work queue

**The cache of the build plan** (`docs/development/WORK-PIPELINE.md`): the BOB INBOX's undrained entries, then the open
rows IN ORDER. **SCHEDULER owns this file** (`kickoffs/SCHEDULER.md`): it drains the inbox, orders the rows, and marks,
archives and replenishes; **CONDUCT writes one word — a row's `queued` → `running`**, pushed before its worker spawns.
READ WHOLE by every session.

**Statuses.** `queued`: runnable and unclaimed. `running`: a live worker holds an `agent-*` worktree with a claim on the
row's paths — and when none does, the row is UNDETERMINED between `queued` and done-awaiting-integration: read (1) a
`worktree-agent-*` branch whose commits name the item, then (2) the item's block in `CLAIMS.md` (`released:` means it
finished on purpose); only with neither does it fall back to `queued`. `blocked`: cannot run until something outside the
queue moves, and says what. `done` and `superseded` leave for the archive (`node tools/ledger.mjs archive <ID>`). **A
worker reads its own row from `coord` (`node tools/coord.mjs read docs/development/QUEUE.md`; M0-110, corrected by SCHEDULER #14) before it touches anything, and STOPS if the row does not read `running`.**

This file's history until 2026-09-18 — its earlier preambles, the 2026-08-04 handover, the per-area narrative — is in
`docs/archive/ledgers/QUEUE-narrative-2026-09-18.md`; drained inbox entries are in
`docs/archive/ledgers/BOB-INBOX-drained.md`; closed rows in `docs/archive/ledgers/QUEUE-closed.md`. All verbatim; look
them up (`node tools/ledger.mjs find <ID>`), do not read them whole.


## BOB INBOX — append-only. BOB writes here; SCHEDULER drains it (from 2026-09-18; CONDUCT did until then).

BOB appends a designed item, a correction or an order change here, with its intended place; SCHEDULER gates it at its cited design section and its depends-on, places it, and moves the drained entry to `docs/archive/ledgers/BOB-INBOX-drained.md` in the same commit.

## THE CACHE — the next rows, in order

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 8 in all. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### LED-7 · queued — **SCHEDULER'S OWN ACT, NOT A WORKER SLOT: CONDUCT must never brief a worker into this row, and does not need to ask again (SCHEDULER #2 to CONDUCT #7, 2026-09-19).** **THE FOLD: every open DEBT row TRIAGED AT THE CODE and archived by one of three doors (closed in fact with its evidence · a BACKLOG item in build order keeping its `D-` id · a stated permanent limitation in its home design); then DEBT.md archived whole and new defects written straight into the backlog.** — waits on LED-6 (it writes into the backlog LED-6 creates). **EXEMPT FROM THE M0 HOLD BY NAME.**
order: the debt fold: until it runs, ~222 open DEBT rows — among them disclosure defects that would outrank features — stand outside the order, so the plan cannot be proved in order without it (SCHEDULER, first order audit, 2026-09-18)
milestone: M0 (process, Bob's direction 2026-09-18: *"those debts should be appropriately folded into the build plan so that those debts are retired - in the right build order."*)
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with `docs/development/WORK-PIPELINE.md` §3, which carries LED-7's design and accepts-when.
depends-on: LED-6
scope: as §3 states, EXCEPT the actor — batches of ~20 rows driven by SCHEDULER ITSELF (Bob, 2026-09-19: *"Scheduler should be actively involved in moving debt rows into the build plan (in the proper order)."*), never spawned into a development slot. **218 open rows, measured 2026-09-19 by SCHEDULER #2** (`grep -c '^| D-' docs/development/DEBT.md`); 223 before batch 1, which closed 4 in fact, placed D-158, routed D-325 and D-52 to BOB and carried 3. A single row whose verification needs a build or a long code trace goes to CONDUCT as its OWN row with its own id — never as "LED-7". **OWED FROM M0-109's DELEGATION** (`CLAIMS.md`, 2026-09-22; SCHEDULER #13): the batch that moves D-388 waits on M0-115 (item 1); the CLOSING landing's retargets are §3's list, which BOB #27 widened to items 2 and 3 the same day.
accepts-when: as §3 states it.
added: 2026-09-18 · CONDUCT #5 (BOB #15's inbox entry of that date).

### M0-106 · queued — **NARROWED 2026-09-22 by SCHEDULER #12: the TEXT landed at `4f7efed0` (`kickoffs/DIST.md` step 1: a GREEN FULL record for the tree released, else `gates.mjs --since`, the battery only when neither exists), verified on `origin/main`. What remains is the WITNESS, at the next cut (0.72.0, owed no earlier than 2026-09-23 04:00Z): its step 1 names the record it relied on and runs no battery. DIST reports the cut commit and that line; then close.** **DIST's RELEASE GATE RE-RUNS THE WHOLE BATTERY ON MERGED `main`, CALLING IT *"a tree nobody has tested"* (`kickoffs/DIST.md`), WHICH IS FALSE WHEREVER THAT EXACT TREE ALREADY CARRIES A GREEN FULL RECORD** (D-293 keys the record by tree). DIST #4's 0.71.0 gate took ~2.5 h here for a battery that runs in ~16 min. — owner DIST (its own kickoff).
order: near the head, ahead of the product rows because it CUTS GATE TIME (Bob's ruling, 2026-09-22, `CLAUDE.md` §2: *The goal is BIO work; process is overhead*: no process row unless it cuts gate time or unblocks product); DIST's own act, never a worker slot (moved by SCHEDULER #11 on BOB #25's word, 2026-09-22)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `CLAUDE.md` §6's ruling of 2026-09-22; the item is carried in BOB #25's drained entry (`docs/archive/ledgers/BOB-INBOX-drained.md`, "GATES RUN FAR MORE THAN THEY NEED TO").
depends-on: none — D-293's record and M0-98's `--since` are on `main`.
scope: step 1 becomes: a GREEN FULL record for the tree being released, or `gates.mjs --since <the newest commit whose tree carries one>`, and the whole battery only when neither exists; the version bump's own check stays. DIST writes it; CONDUCT routes the row to DIST and briefs no worker.
accepts-when: a release from a tree with a GREEN FULL record runs no battery and names the record it relied on; one from an unrecorded tree runs the battery as today.
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 1, drained this commit; `node tools/mintid.mjs M0`).

### M0-114 · running — **SPAWNED 2026-09-22 by CONDUCT #14, wave 4, the first flips on `coord`. NOT LANDED, CHECKED BY CONTENT: no `.github/workflows/` on `origin/main` @ `a73cba2b`, and the push guard reads no check. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **A GATE'S VERDICT LIVES IN ONE CLONE'S GIT DIRECTORY, SO NO OTHER SESSION CAN READ IT: a lane re-gates a tree another already gated, and a cloud session starts with no record at all.** RULED by Bob, 2026-09-22 (*"Yes to all 3 recommendations"*): the gates run on GitHub's machines and the verdict is a check on the commit. — owner M0.
order: beside M0-110 and ahead of M0-111, the design's order (*"Change 3 is independent and starts with its measurement beside change 1"*; change 2 *"is cheapest once change 3 carries its gate"*); it *"waits for the first cloud measurement"* (BOB #27), which BOB #28 recorded (M-99), so runnable (SCHEDULER #13 and #14; BOB #26's inbox entry, item 2)
milestone: M0
interface: none.
design: `docs/development/TREE-SHARING.md` §3 (the gates run on GitHub's machines) as revised by §4, with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none — met 2026-09-22 (`kickoffs/NEW-MACHINE.md` §0.1): the first cloud FULL gate, 1,082 s wall, 272/273 suites · 16,575 assertions.
scope: FIRST the measurement, the FULL battery's wall time and pass count on a GitHub runner, on the Mac and in the cloud (that column is in); every suite needing a secret or the network, named; the monthly minutes at M0-111's cadence. A verdict still lives in one clone and every cloud clone starts with none (BOB #28). Actions' enablement stays UNDETERMINED (0 workflows; `actions/permissions` refused); Bob's acts go to BOB with the figures, only if they favour a runner (§4). Then the workflow, the check, and the push guard reading it. **FULL GATE PROFILE**.
accepts-when: the three-column measurement is in `MEASUREMENTS.md` before any workflow lands; a `land/*` push gets a check whose verdict the push guard reads, and a red check refuses the push. NEGATIVE CONTROL: break one suite on a branch, and the check reads red at that suite.
added: 2026-09-22 · SCHEDULER #13 (BOB #26's entry, item 2; `mintid`); unblocked by SCHEDULER #14 (BOB #28's entry, item 1).

### M0-116 · running — **SPAWNED 2026-09-22 by CONDUCT #14, wave 4, the first flips on `coord`. NOT LANDED, CHECKED BY CONTENT: `bio-plane/scripts/op-claims.mjs` still carries its scanned-corpus list naming `MEASUREMENTS.md` (L529) on `a73cba2b`. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **A LANDING THAT TOUCHES ONLY `MEASUREMENTS.md` RE-RUNS A THIRD OF THE BATTERY.** `gates.mjs --since 81510280` over three docs … (whole text: the cut archive)
order: directly after M0-111, where BOB #27 placed it (*"after M0-110 and M0-111, which take the ledgers off both sides first"*), ahead of M0-100 because it pays on every measurement landing: it CUTS GATE TIME, Bob's own test (`CLAUDE.md` §2) (SCHEDULER #13, 2026-09-22; BOB #27's defect, its fix named)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a comment reads nothing, so it selects … (whole text: the cut archive)
depends-on: none.
accepts-when: a `MEASUREMENTS.md`-only change selects the units that read it (`op-claims.test`, `mintid`'s readers, the ledger suites) and not the 105, both figures in the landing. NEGATIVE … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #13 (BOB #27's defect, verified at the code on `81510280`; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-116» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-111 · running — **SPAWNED 2026-09-22 by CONDUCT #14, wave 4. NOT LANDED, CHECKED BY CONTENT: `tools/pushguard.mjs` names no `land/` ref on `df9eb9f9`. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **EVERY LANE LANDS ON `main` ITSELF, SO `main` MOVES UNDER EVERY GATE AND EACH LANDING REBASES AND RE-GATES.** RULED by Bob, 2026-09-22 (*"Yes to all 3 recommendations"*): lanes and workers push `land/<lane>/<topic>` branches only, and CONDUCT lands them on a cadence in one integration branch with one gate. — owner CONDUCT, with M0.
order: directly after M0-110, which it depends on: the notes lanes trade need `coord` before `main` stops carrying them (TREE-SHARING, the order of the three changes); it cuts gate time, Bob's own test (SCHEDULER #12, 2026-09-22; BOB #26's inbox entry, item 3)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §2 (one lane lands on `main`, in batches), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: M0-110.
scope: as §2: CONDUCT merges every waiting `land/*` branch onto `main` in one integration branch, gates ONCE on the union class, pushes `main` and deletes the landed refs, returning a conflicting or red branch to its lane by name; nobody else pushes `main`, enforced by the push guard; a release lands through the same train. **FULL GATE PROFILE**.
accepts-when: two lanes' `land/*` branches land in one train with one gate record, and a lane's direct push to `main` is refused by name. NEGATIVE CONTROL: drop the guard's `main` arm, and the refusal arm fails by name.
added: 2026-09-22 · SCHEDULER #12 (BOB #26's inbox entry, item 3; `node tools/mintid.mjs M0`).

### M0-119 · running — **SPAWNED 2026-09-22 by CONDUCT #14, wave 4. NOT LANDED, CHECKED BY CONTENT: no `BACKLOG-LATER.md` on `coord` and `ledger.mjs` names none on `df9eb9f9`. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **THE BACKLOG'S BUDGET CUTS ROWS: A PLACEMENT OVER 150 KiB TRUNCATES THE ROWS NEXT TO RUN, AND ONCE EVERY ROW IS CUT NO PLACEMENT CAN LAND.** SCHEDULER #14's landing of 2026-09-22 cut 17 rows to their fields, leaving four whole; BOB #28 RULED the fix: the TAIL moves to a second file, the head is never cut. — owner M0.
order: directly after M0-111, the other row resting on M0-110: it UNBLOCKS PRODUCT, since every placement of a product row passes through the backlog's budget (Bob, 2026-09-22, `CLAUDE.md` §2); the interim 200 KiB budget holds until it lands (SCHEDULER #14; BOB #28's inbox entry, item 3)
milestone: M0
interface: none
design: `docs/development/WORK-PIPELINE.md` §2, *"When `BACKLOG.md` is over its budget, the tail moves, not the head"* (BOB #28, 2026-09-22), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: M0-110 (a new state file rides to `coord`).
scope: a placement over budget moves whole rows from `BACKLOG.md`'s foot to the head of `BACKLOG-LATER.md` (looked up, never read whole, unbounded); a refill promotes them back; `ledger.mjs`, the invariants, `plancheck` and every reader of the order read both files as ONE order; the budget returns to 150 KiB when it lands.
accepts-when: a placement over budget cuts no row and leaves every id in exactly one file, in order. NEGATIVE CONTROL: point one reader at `BACKLOG.md` alone, and its arm fails by name.
added: 2026-09-22 · SCHEDULER #14 (BOB #28's inbox entry, item 3, drained this commit; `node tools/mintid.mjs M0`).

### D-442 · running — **SPAWNED 2026-09-23 by CONDUCT #14, wave 5. NOT LANDED, CHECKED BY CONTENT: `publishCase()` (`store.mjs`) still promotes each member finding on `df9eb9f9`, untouched since M-100 measured it. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **A SECOND PROJECT'S `op=publish` MOVES A FINDING ANOTHER PROJECT'S PUBLISHED CASE PINS.** `publishCase()` promotes every member, writing the case's completeness, exclusions, frozen strength pair and grounds, edition and a receipt into the finding's bytes, so one project's PREPARE moves the finding off another project's ratified pin and flags that case (MEASURED by REC-166's worker, `MEASUREMENTS.md` M-100). — owner RECORD.
order: FIRST of the product corrections, ahead of REC-168 (BOB #28: *"Place it FIRST of the product corrections: one project's act silently moves another project's published pins, REC-166's class on the publication path"*) (SCHEDULER #14, 2026-09-22; BOB #28's inbox entry, item 1)
milestone: M10
interface: I3 — the case document's shape and the publish answer; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 12, *PUBLISHING WRITES NOTHING ON A MEMBER FINDING* (BOB #28, 2026-09-22), (a)–(e).
depends-on: none — REC-166 (the project arm) and CASE-5b (the case's stamps) are on `main`.
scope: rule 12: `op=publish` promotes no member; every block the promotion wrote is stated ONCE in the case document (completeness, exclusions, per member its role, pinned sha, edition and the frozen pair and grounds, and the receipt); the case-document signature covers them; every check and reader of a moved block follows it, each named from the code; members published before keep their blocks (rule 1).
accepts-when: project B's prepare over a finding project A's ratified case pins leaves its `bundle_sha` unmoved and flags nothing on A's case, B's ratification then succeeds, and a second case of the SAME project over the finding does the same; the case document carries every moved block. NEGATIVE CONTROL: restore the member promotion, and the unmoved-sha arm fails by name.
added: 2026-09-22 · SCHEDULER #14 (BOB #28's inbox entry, item 1, drained this commit; D-442's DEBT row, minted by CONDUCT #14; keeps its `D-` id).

### REC-168 · running — **SPAWNED 2026-09-23 by CONDUCT #14, wave 5. NOT LANDED, CHECKED BY CONTENT: `captureRequest` (`store.mjs` L35536) calls no `runPrincipalGate` on `df9eb9f9`. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **`op=capturerequest` CREDITS ANOTHER MEMBER'S RUN: IT ACCEPTS ANY RUNNING RUN AND COPIES THAT RUN'S PRINCIPALS INTO THE REQUEST ROW.** `captureRequest` (`store.mjs`) checks only that the run is `running`, never whose it is; DRIVEN by REC-165's worker (Cora filed under Alice's run, and the row recorded principals `member:alice`; CONDUCT #14, 2026-09-22) and re-read after REC-165's integration. — owner RECORD.
order: directly after D-442 and before D-85: REC-165's defect on a third op, an attribution the record cannot support, CLAUDE.md §2's class; BOB #28: *"Directly after REC-165, whose fix it reuses"*, which is integrated, so a row (SCHEDULER #14, 2026-09-22; BOB #28's inbox entry, item 2)
milestone: M9
interface: I3 — the op refuses what it accepted; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5, the paragraph *`op=capturerequest` — RULED 2026-09-22 by BOB #28* (rule 1 applies; Rule 1's target does not).
depends-on: none — REC-165's gate, stamp and sight check are on `main`.
scope: when a request names a run: REC-152's stamp of the caller's principal, the sight check first, then `runPrincipalGate`, as REC-165 applies them; the row records the CALLER's principal. A request naming no run is the member's own and is untouched; no context check (a request names an address, not a question).
accepts-when: another principal's running run is refused `AI_RUN_NOT_PRINCIPAL` and writes no row; the caller's own running run lands, naming the caller; a request naming no run is unchanged. NEGATIVE CONTROL: drop the gate, and the other-principal arm fails by name.
added: 2026-09-22 · SCHEDULER #14 (REC-165's stand-down finding, driven, via CONDUCT #14; ruled by BOB #28's inbox entry, item 2, drained this commit; `node tools/mintid.mjs REC`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
