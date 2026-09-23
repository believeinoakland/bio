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

### D-442 · running — **SPAWNED 2026-09-23 by CONDUCT #14, wave 5. NOT LANDED, CHECKED BY CONTENT: `publishCase()` (`store.mjs`) still promotes each member finding on `df9eb9f9`, untouched since M-100 measured it. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **A SECOND PROJECT'S `op=publish` MOVES A FINDING ANOTHER PROJECT'S PUBLISHED CASE PINS.** `publishCase()` promotes every member, writing the case's completeness, exclusions, frozen strength pair and grounds, edition and a receipt into the finding's bytes, so one project's PREPARE moves the finding off another project's ratified pin and flags that case (MEASURED by REC-166's worker, `MEASUREMENTS.md` M-100). — owner RECORD.
order: FIRST of the product corrections, ahead of REC-168 (BOB #28: *"Place it FIRST of the product corrections: one project's act silently moves another project's published pins, REC-166's class on the publication path"*) (SCHEDULER #14, 2026-09-22; BOB #28's inbox entry, item 1)
milestone: M10
interface: I3 — the case document's shape and the publish answer; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 12, *PUBLISHING WRITES NOTHING ON A MEMBER FINDING* (BOB #28, 2026-09-22), (a)–(e).
depends-on: none — REC-166 (the project arm) and CASE-5b (the case's stamps) are on `main`.
scope: rule 12: `op=publish` promotes no member; every block the promotion wrote is stated ONCE in the case document (completeness, exclusions, per member its role, pinned sha, edition and the frozen pair and grounds, and the receipt); the case-document signature covers them; every check and reader of a moved block follows it, each named from the code; members published before keep their blocks (rule 1).
accepts-when: project B's prepare over a finding project A's ratified case pins leaves its `bundle_sha` unmoved and flags nothing on A's case, B's ratification then succeeds, and a second case of the SAME project over the finding does the same; the case document carries every moved block. NEGATIVE CONTROL: restore the member promotion, and the unmoved-sha arm fails by name.
added: 2026-09-22 · SCHEDULER #14 (BOB #28's inbox entry, item 1, drained this commit; D-442's DEBT row, minted by CONDUCT #14; keeps its `D-` id).

### M0-122 · running — **FLIPPED 2026-09-23 by CONDUCT #14 on BOB #29's order (Bob's direct instruction, 03:15Z): BUILT BY A BOB WORKER on `land/bob/m0-122-train-retry`, NOT a CONDUCT slot; CONDUCT lands it by train when it arrives. Falsify rather than believe: if no `land/bob/m0-122-train-retry` exists on origin, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH.** **Prior state, kept as the record: queued** — **THE TRAIN HAS NO RETRY ON A NON-FAST-FORWARD, AND RE-GATES A `land/*` BRANCH'S TREE THAT ALREADY CARRIES ITS OWN GREEN RECORD.** `tools/train.mjs` fails when `main` moves under its gate (the first train lost to BOB #29's docs commit, 2026-09-23; CONDUCT #14 retried by hand, `c5c83dc4`), and gates the union even when the branch's tip tree is recorded GREEN. M0-111's finding, fix named by CONDUCT #14. — owner M0.
order: FIRST of the backlog: every landing now goes through the train, so both halves CUT GATE TIME on every landing (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #14, 2026-09-23; M0-111's finding)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §2 (one lane lands on `main`, in batches), with `docs/development/VERIFICATION.md` (admitted for M0 by name; D-293's record keyed by tree, M0-98's `--since`).
depends-on: none — M0-111 is on `main`.
scope: on a rejected push, merge `origin/main`, re-gate with `gates.mjs --since <the GREEN tip>`, re-record and push, bounded; and a `land/*` tip whose tree carries a GREEN record lands without a second gate of that tree.
accepts-when: a train whose push is rejected once lands on the retry with one `--since` gate, not a FULL one; a recorded-GREEN branch lands with no battery run of its own tree. NEGATIVE CONTROL: drop the retry, and the moved-main arm fails by name.
added: 2026-09-23 · SCHEDULER #14 (M0-111's finding via CONDUCT #14; `node tools/mintid.mjs M0`).

### M0-100 · running — **SPAWNED 2026-09-23 by CONDUCT #14, wave 6. NOT LANDED, CHECKED BY CONTENT on `30475ca6`: `docs/development/` holds one `MEASUREMENTS.md` and no per-entry measurement file. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **NARROWED 2026-09-22 by BOB #27 to `MEASUREMENTS.md` AND `INTERFACE-CHANGES.md`, WHICH STAY ON `main`: under M0-111's train two** … (whole text: the cut archive)
order: after M0-110 and M0-111, where BOB #27 placed it on narrowing: the collision it removes exists only inside M0-111's train (SCHEDULER #12, 2026-09-22)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `docs/development/ORCHESTRATION.md` … (whole text: the cut archive)
depends-on: M0-111.
accepts-when: two `land/*` branches each adding a measurement land in one train with no conflict; every reader's counts over the frozen history are unchanged. How a liar passes it … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #8 (BOB #23's inbox entry; `node tools/mintid.mjs M0`); narrowed 2026-09-22 by BOB #27 (SCHEDULER #12).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-100» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-121 · queued — **M0-116, NARROWED: A `MEASUREMENTS.md`-ONLY LANDING STILL SELECTS 85 UNITS, BECAUSE `op-claims.mjs` AND ~60 READERS IMPORT `tools/coord.mjs` FOR ITS STATE-PATH PREDICATE AND INHERIT WHAT IT WALKS.** M0-116's gates half landed (109 → 85, `e5c54c6a`); its op-claims split moves nothing until the predicate leaves the walking module. — owner M0.
order: directly after M0-119, which it follows (CONDUCT #14: *"after M0-119"*), M0-116's residue, which CUTS GATE TIME on every measurement landing (SCHEDULER #14, 2026-09-23; M0-116's finding)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a comment reads nothing, so it selects nothing, and an import that walks nothing selects nothing; with `ORCHESTRATION.md` §"THE RECORD IS PARTITIONED BY WRITER" rule 1.
depends-on: M0-119.
scope: move `MOVED_FILES`, `MOVED_DIRS`, `NEXT_RE` and `isMovedPath` (all I/O-free) out of `tools/coord.mjs` into a module that walks nothing, re-exported by `coord.mjs` and imported by `op-claims.mjs` (measured as an experiment by CONDUCT #14: 60 → 24 readers, 85 → 55 units).
accepts-when: a `MEASUREMENTS.md`-only change selects the units that read it and not the 85, both figures in the landing, closing M0-116's accepts-when. NEGATIVE CONTROL: import the predicate from `coord.mjs` again, and the unit-count arm fails by name.
added: 2026-09-23 · SCHEDULER #14 (M0-116's residue via CONDUCT #14; `node tools/mintid.mjs M0`).

### UI-79 · queued — **THE MEMBER UI WRITES `believe-in-oakland` AS THE GROUP OF EVERY BUNDLE IT AUTHORS, ON EVERY INSTANCE.** `civicos-ui/app.html` sends `group: believe-in-oakland` in `mdFor`'s front matter and three `meta.group` keys (re-read on `a73cba2b`), where the plane stamps the instance's recorded group (D-436, IC-172); the FY glossary entry and the Add form's placeholder name Oakland too. Found by UI-77's worker (CONDUCT #14); the open D-436 → UI DELEGATION. — owner UI.
order: directly after REC-168, with the product corrections: a sovereign group's bundles would claim this project's group, CLAUDE.md §2's class, UI-77's sibling on the write path; below D-442 and REC-168, whose defects move published pins and attribution (SCHEDULER #14, 2026-09-23; UI-77's findings, relayed by CONDUCT #14)
milestone: M7
interface: I3 consumer (the plane's group stamp, IC-172).
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §3.1 (a bundle's `group` is the ONE recorded value per instance, never a literal: D-436), with DEC-8 (a surface invents nothing).
depends-on: none — D-436's stamp is on `main`.
scope: drop the four literals so the plane stamps the group; reword the FY glossary entry and the Add form's placeholder to name no place; correct the 11 UI suites carrying the literal, each with a dated comment saying why the old pin was wrong.
accepts-when: against a plane recording a second slug, a bundle the UI authors carries that slug and no UI source or rendered text names `believe-in-oakland` or Oakland outside quoted record content. How a liar passes it: a different hard-coded slug, so the arm plants a second one. NEGATIVE CONTROL: restore one `meta.group` literal, and the planted-slug arm fails by name.
added: 2026-09-23 · SCHEDULER #14 (UI-77's worker's findings (a) and (b), via CONDUCT #14; `node tools/mintid.mjs UI`).

### D-85 · queued — **AN ASSISTANT CAN OPEN A QUESTION OUTSIDE ANY RUN IT HOLDS, AND A RUN KEEPS ONLY THE LENS IT WAS HANDED.** NARROWED by BOB #25 to … (whole text: the cut archive)
order: directly after REC-165, the same fence one act further (BOB #25: *"after 1"*); a gap in the assistant's fence, not a false attribution (SCHEDULER #10, 2026-09-21)
milestone: M4
interface: I3 and I5 — a refusal, an instance row and a run field; the integrator mints and classifies the ICs.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5, rules 2 and 3 (BOB #25, 2026-09-21), with §3 (the run carries the lens).
depends-on: REC-165 (the same gate).
accepts-when: a creation outside a run, in another principal's run or past the bound is refused by name; one inside lands with its row and reads the lens and `moved`; a member's is … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #10 (BOB #25's inbox entry, items 2 and 3; D-85's DEBT row of 2026-07-30; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-85» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
