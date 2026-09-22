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
worker reads its own row from `origin/main` before it touches anything, and STOPS if the row does not read `running`.**

This file's history until 2026-09-18 — its earlier preambles, the 2026-08-04 handover, the per-area narrative — is in
`docs/archive/ledgers/QUEUE-narrative-2026-09-18.md`; drained inbox entries are in
`docs/archive/ledgers/BOB-INBOX-drained.md`; closed rows in `docs/archive/ledgers/QUEUE-closed.md`. All verbatim; look
them up (`node tools/ledger.mjs find <ID>`), do not read them whole.


## BOB INBOX — append-only. BOB writes here; SCHEDULER drains it (from 2026-09-18; CONDUCT did until then).

BOB appends a designed item, a correction or an order change here, with its intended place; SCHEDULER gates it at its cited design section and its depends-on, places it, and moves the drained entry to `docs/archive/ledgers/BOB-INBOX-drained.md` in the same commit.

**2026-09-22 · BOB #26 · BOB RULED D-148 AND D-149: A FEE QUOTE IS EVIDENCE, AND A RECORDS REQUEST NAMES EVERY LAW THAT
GOVERNS IT.** Both folded, with Bob's words, into `BIO_Case_Making_v0_1.md` §2, where the `action` lives; Bob was told
the same day that the layers follow the AGENCY asked (federal FOIA governs federal agencies only). Each row leaves DEBT by
door 2, keeping its id; both sit at M10 with D-147, which they do not close — D-147's lifecycle stays a design row, and
the quote's revision chain is shaped so each later stage lands as its own entry. Both are product; neither waits on
anything unbuilt (the action and its correspondence are BUILT, `node tools/status.mjs 8`).

1. **RECORD (M10), D-148: the fee quote, a structured correspondence entry.** A `received` entry may carry a QUOTE: the
   amount and currency as quoted, the stated basis verbatim, and the `sent` entry it answers; a later entry may name the
   quote it revises (a waiver is a revision to zero, and both entries stand). Its grammar sits at C-2.10 beside the
   correspondence arms; `promote` projects it from the bytes into an indexed table that `purge` clears in both arms, and
   a read returns quotes by counterparty and by the request answered. I3 and I5 change (the integrator mints the ICs).
   The record states no finding about a quote. **Accepts when** a quote projects and reads back by counterparty and by
   request; a revision to zero keeps both entries; a quote answering no `sent` entry, or with an amount that is not a
   number, is refused by name; an action with no quote reads byte-identical before and after. NEGATIVE CONTROL: drop the
   projection from the per-bundle purge, and the purge arm fails by name.
2. **RECORD (M10), D-149: the laws that govern a records request, by citation.** A records-request action carries a
   list of citations, each with its level (federal, state or local), set by a member's authored act; a machine credential
   is refused by name, and a machine PROPOSAL, if built, is labelled machine work. An empty list reads UNDETERMINED with
   its sentence, never a default; the plane encodes no law's rules; `cpra_request` actions read unchanged. **Accepts
   when** a member's list lands and reads back; an action with none reads undetermined, never federal; a machine
   credential's list is refused. NEGATIVE CONTROL: default an empty list to a federal citation, and the undetermined arm
   fails by name.

**2026-09-22 · BOB #26 · SCHEDULER #11's GROUP OF FOUR ANSWERED — TWO CLOSED IN FACT, TWO BUILD ITEMS.** Each traced at
the code on `48aab56b` and ruled in its home document. **Q1, D-152 — door 1, CLOSED IN FACT:** DEC-4's *an OCR citation
carries its image region* is met at the leg by a CAP, never a refusal (`BIO_Content_Framework_v0_10.md` §14.4); evidence:
`checkEarnedLeg` bounds a leg's capture letter by `captureBound` (C-2.8, REC-88), `gradeCeiling` lets only a covering
attestation raise a content row and `extentCovers` gives a rect-less target no region's (`textchain.mjs`), the text index
carries `chain_kind`, and the rest SCHEDULER #11 verified on `06832aff`. A refusal would press a member to invent a region.
**Q2, D-164 — door 1, CLOSED IN FACT:** Bob's reopening condition of 2026-09-15 is met (Framework §18): Part II reviewed by
Bob on 2026-09-14, the six pieces designed in their homes, the primitive BUILT (`node tools/status.mjs 4`); what remains
is REC-122, D-394 and the TRANSCRIBE surface. `BIO_System_Design.md` §5's M4 cell, `INVESTIGATIVE-SESSION.md` and
`STORE-AS-CACHE.md` are marked; `MILESTONES.md`'s D-164 row is SCHEDULER's to move. **Q3, D-125, and Q4, D-179 — door 2,
each keeping its id:** items 2 and 1. Both are product corrections and neither waits on anything unbuilt.

1. **RECORD (M7), D-179, beside D-169/D-171: a second registration of held bytes is REFUSED BY NAME** (`BIO_Intake_Doctrine_v1_1.md`
   §8, ruled: one capture, one home, the original's). At `promote`, before any write, a register entry whose
   `capture_sha` is already registered under ANOTHER bundle that still exists is refused — C-53.8's authored-only fence
   generalised to every capture. The refusal says the document is already in the record and names the holder only to a
   caller who may see it (D-15). A re-registration under the SAME bundle is unchanged; a purged home's bytes register
   afresh. I3: `op=promote` refuses what it accepted (the integrator mints the IC). **Accepts when** held bytes promoted
   under a second bundle are refused and the first bundle's register row is byte-identical after; a revision
   re-registering its own bytes lands; a caller who cannot see the holder is told no bundle. A fixture registering one
   sha under two bundles is corrected, never exempted, with the reason. NEGATIVE CONTROL: drop the refusal, and the
   first-bundle-unchanged arm fails by name. **Not reached, stated so it is not assumed:** a DIGEST-level duplicate
   across bundles (different raw bytes, one evidentiary digest) — `LINK-FIDELITY.md` "The work, in order" step 5's
   cross-bundle check in `op=audit` — is neither built nor rowed; placing it is SCHEDULER's call.
2. **RECORD (M8, the inbox half), D-125: a member's PERSONAL mute of a FINDING** (`NOTIFICATIONS.md` "MARKED AS HANDLED",
   ruled; DEC-10's (b) and (c)). `queueMute` admits FINDING kinds for the per-case mute (c), over the kinds named when it is
   made, as for a condition; a per-ITEM mute (b) is added, keyed on the member and the item's stable id
   (`FINDING::<progression>::<stage>` for a derived finding, the key `proposal_dispositions` already uses), in a derived
   table `purge` clears. I5 and I3's `op=queuemute` gain it (the integrator mints the ICs). Neither writes a disposition;
   the member's own feed states the suppression, as today; an OBLIGATION stays refused. `MUTE_REFUSAL_DETAIL`'s FINDING
   sentence goes, and `current.test.mjs`'s pin that the fence refuses a FINDING is CORRECTED with its reason (DEC-10). The
   queue surface renders the producer's options (UI-45 §1): verify it offers the act with no surface change. **Accepts
   when** member A's item mute of finding F drops F from A's feed into A's `suppressed`, while member B's feed and
   `op=proposals` still carry F and no disposition row exists; A's case mute of `overdue_successor` suppresses that case's
   overdue items and a NEW kind there still reaches A; an OBLIGATION mute is refused by name. NEGATIVE CONTROL: key the
   item mute by case alone, and the B-feed arm fails by name.

## THE CACHE — the next rows, in order

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 8 in all. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### LED-7 · queued — **SCHEDULER'S OWN ACT, NOT A WORKER SLOT: CONDUCT must never brief a worker into this row, and does not need to ask again (SCHEDULER #2 to CONDUCT #7, 2026-09-19).** **THE FOLD: every open DEBT row TRIAGED AT THE CODE and archived by one of three doors (closed in fact with its evidence · a BACKLOG item in build order keeping its `D-` id · a stated permanent limitation in its home design); then DEBT.md archived whole and new defects written straight into the backlog.** — waits on LED-6 (it writes into the backlog LED-6 creates). **EXEMPT FROM THE M0 HOLD BY NAME.**
order: the debt fold: until it runs, ~222 open DEBT rows — among them disclosure defects that would outrank features — stand outside the order, so the plan cannot be proved in order without it (SCHEDULER, first order audit, 2026-09-18)
milestone: M0 (process, Bob's direction 2026-09-18: *"those debts should be appropriately folded into the build plan so that those debts are retired - in the right build order."*)
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with `docs/development/WORK-PIPELINE.md` §3, which carries LED-7's design and accepts-when.
depends-on: LED-6
scope: as §3 states, EXCEPT the actor — batches of ~20 rows driven by SCHEDULER ITSELF (Bob, 2026-09-19: *"Scheduler should be actively involved in moving debt rows into the build plan (in the proper order)."*), never spawned into a development slot. **218 open rows, measured 2026-09-19 by SCHEDULER #2** (`grep -c '^| D-' docs/development/DEBT.md`); 223 before batch 1, which closed 4 in fact, placed D-158, routed D-325 and D-52 to BOB and carried 3. A single row whose verification needs a build or a long code trace goes to CONDUCT as its OWN row with its own id — never as "LED-7".
accepts-when: as §3 states it.
added: 2026-09-18 · CONDUCT #5 (BOB #15's inbox entry of that date).

### REC-157 · running — **SPAWNED 2026-09-21 by CONDUCT #11, AFTER D-436 LANDED (the same file, `store.mjs`). NOT LANDED, CHECKED BY CONTENT at spawn: on the tree this flip lands in (`origin/main` @ `c05d71c8` with D-436's merge `38850da4`), `op=publish`'s refusal `ALREADY_A_CASE_MEMBER` still pins on `#caseRelationOf(id).member` — the finding at its `bundle_sha` (`grep -a`, `bio-plane/src/store.mjs`). Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **A CASE KEEPS ASSERTING A CLAIM ITS PROJECT WITHDREW, AND DEC-19's ONE ROUTE FORWARD — A NEW EDITION — IS REFUSED.** Since REC-135 (IC-166) a published case records the PROJECT's adopted claim; when the project withdraws and concludes again on another claim, `op=publish` still refuses `ALREADY_A_CASE_MEMBER`, whose pin is `#caseRelationOf(id).member` — the finding at its `bundle_sha`, which never moved. — owner RECORD.
order: SECOND, after D-434: a correction to just-landed work (REC-135, `84a66a30`) failing in the PUBLISHED record — the case says what its project no longer stands on and cannot be corrected forward, CLAUDE.md §2's class; below D-434 only because publishing runs through the operator (DEC-33) (SCHEDULER #5, 2026-09-21)
milestone: M10
interface: I3 — `op=publish` succeeds where it refused; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §7.1 item 9 (BOB #19, 2026-09-21), which applies items 4 and 7.
depends-on: none. REC-135 (item 4, `#caseConclusionFor`) and REC-136 (item 7, `op=withdrawconclusion`) are on `origin/main`.
scope: `ALREADY_A_CASE_MEMBER` compares the RELATIONSHIP, as `NOT_CONCLUDED` does: a new edition is warranted when the publishing project's latest conclusion is not the one the pinned edition recorded, whether or not `bundle_sha` moved. `op=reopen` does NOT change. A project that withdrew and has not concluded again still gets `NOT_CONCLUDED`, and its last edition stands (DEC-19).
accepts-when: REC-135's own probe path — conclude, publish, withdraw, conclude on another claim, publish — reaches a SECOND edition recording the new claim; publishing unchanged still refuses `ALREADY_A_CASE_MEMBER`. How a liar passes it: dropping the refusal, so the unchanged arm must still refuse. NEGATIVE CONTROL: pin on `bundle_sha` alone again, and the second-edition arm fails by name.
added: 2026-09-21 · SCHEDULER #5 (BOB #19's inbox entry, drained this commit; `node tools/mintid.mjs REC`).

### M0-97 · running — **SPAWNED 2026-09-21 by CONDUCT #11, ONE worker for M0-97 WITH D-341 (one file, one suite, one gate — BOB #22). NOT LANDED, CHECKED BY CONTENT at spawn: on the tree this flip lands in (`origin/main` @ `c05d71c8` with D-436's merge `38850da4`), `tools/decided.mjs` has no `decided:` field arm (0 matches) and `node tools/decided.mjs "severance"` returns DEC-29 and DEC-72, not DEC-70. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **`tools/decided.mjs` CANNOT SEE MOST OF BOB'S ANSWERED DECISIONS, AND IT HAS COST A RE-ASK (M-85).** `MARKER` is an uppercase-only word list, while `DECISIONS.md` records an answer in a lowercase `decided:` field: 13 of 19 entries are not filed under their own id, 11 of them answered or enacted, and `decided.mjs "severance"` returns DEC-29 and DEC-72, not DEC-70, which rules it. SCHEDULER #5 sent D-280 (c) to BOB eleven days after Bob ruled it. — owner M0.
order: FIRST among the instruments, directly after D-435 (in flight): `CLAUDE.md` §1 names this tool the one source for what has been decided (BOB #22, 2026-09-21; placed by SCHEDULER #7)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the tool's own header, which calls the index a FLOOR: *"A RULING WITH NO MARKER is invisible here."*
depends-on: none. **Take with D-341**, the same file: one file, one suite, one gate (BOB #22).
scope: a `DECISIONS.md` entry carrying a `decided:` line is indexed as ONE ruling under its own `DEC-n` (text from `response:`, date from `decided:`), beside the prose `MARKER` scan and never replacing it; an `open` or `deferred` entry is not a ruling. **FULL GATE PROFILE** (`tools/`).
accepts-when: every answered or enacted `### DEC-n` is returned by `decided.mjs "DEC-n"`, a printed count equality against the file's own headings; `"severance"` returns DEC-70; a deferred entry is not returned. How a liar passes it: lower-casing `MARKER`, which floods the index, so an arm asserts the index grows only by entries it did not file and files none twice. NEGATIVE CONTROL: drop the field arm, and the equality fails naming DEC-70.
added: 2026-09-21 · SCHEDULER #7 (BOB #22's inbox entry, drained this commit; `node tools/mintid.mjs M0`).

### D-341 · running — **SPAWNED 2026-09-21 by CONDUCT #11, in the ONE worker with M0-97. NOT LANDED, CHECKED BY CONTENT at spawn: on the tree this flip lands in (`origin/main` @ `c05d71c8` with D-436's merge `38850da4`), `scan()` in `tools/decided.mjs` still joins `[line, ...lines.slice(i + 1, i + 4)]` and stops at nothing. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **`tools/decided.mjs` GLUES AN APPENDED CLAIM'S HEADER ONTO THE PREVIOUS RULING, SO THE INDEX FILES ANOTHER AREA'S RULING AS CARRYING THE NEW CLAIM.** `scan()` joins a matched line under 200 chars with the next three lines and stops at nothing: `docs/DECIDED.md` carries an IC-82 ruling ending in a `## CLAIM 2026-09-14 RECORD (REC-80 …` header today (re-measured 2026-09-21). — owner M0.
order: directly after M0-97, the same file: one file, one suite, one gate (BOB #22, 2026-09-21); the index every session is told to trust answers with half another block's header (SCHEDULER #7, LED-7)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the tool's own header on quoting a wrapped ruling from its joined window.
depends-on: none. Take with M0-97.
scope: the row's FIX: the joiner stops at a heading line (`^#`) or a blank line. **FULL GATE PROFILE** (`tools/`).
accepts-when: a regenerated `docs/DECIDED.md` carries no `## CLAIM` text inside any ruling, and a hand-wrapped ruling still quotes whole. How a liar passes it: stopping at every line break, so the wrapped-ruling arm must pass. NEGATIVE CONTROL: an arm appends a claim after a trailing `released:` line; drop the stop, and it fails by name.
added: 2026-09-21 · SCHEDULER #7 (LED-7; D-341's DEBT row of 2026-09-14; keeps its `D-` id).

### M0-81 · running — **SPAWNED 2026-09-21 by CONDUCT #11 (re-flipped: its first flip in 86523052 was reverted in 11077afc for disk, before any spawn). NOT LANDED, CHECKED BY CONTENT at spawn: on `origin/main` @ `ab34197b`, no tool under `tools/` judges lane occupancy (`git grep -l -i occupan -- tools/` returns nothing). Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **NOTHING CHECKS WHETHER A LANE IS ALREADY OCCUPIED BEFORE A CHIP IS FILED, AND IT COST A REAL MESSAGE.** On 2026-09-19 a second CONDUCT #8 was filed six minutes after the lane was taken; it held the name in the peer directory, and SCHEDULER #3.s three clustering instructions went to it rather than the live integrator, returning `success: true`. — owner M0.
order: THIRD. Cheap, mechanical, and the only one of tonight.s session defects that PREVENTS rather than describes: a duplicate lane costs a wrong delivery nobody is told about (SCHEDULER #3, 2026-09-20)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), enacting BOB #18.s ruling in `kickoffs/BOB.md` "Spawning and retiring lanes": a stood-down, duplicate or retired session RELEASES the lane name.
depends-on: none. `tools/retirable.mjs` is the precedent: the JUDGEMENT lives in the repo where a suite drives it, the ACT stays in the harness.
scope: the OCCUPANCY half only — before a chip is filed, read the session list and REFUSE if a live session already holds the lane (by `scheduledTaskId` or title). Put it in `tools/` as a pure function over a session listing, so a suite drives it. **MUST NOT TOUCH:** the `conduct-8` scheduled task.s definition lives OUTSIDE this repo and is the operator.s — named to them, never changed from here. **FULL GATE PROFILE** (`tools/` is not `docs/`): check disk first.
accepts-when: given a listing with a live session bound to a lane, the judgement REFUSES it and names the occupant; given the same listing with that session stood down, it admits. Driven from a FIXTURE listing, never the live harness. How a liar passes it: matching on title alone — so the arm feeds a session whose title differs and whose `scheduledTaskId` matches.
NEGATIVE CONTROL: drop the occupancy test and the duplicate-CONDUCT fixture is admitted, failing by name.
added: 2026-09-20 · SCHEDULER #3 (BOB #18's inbox entry, drained this commit).

### M0-99 · running — **SPAWNED 2026-09-22 by CONDUCT #12, after batch 2 landed M0-97 + D-341 (the same file, `tools/decided.mjs`) at 9d330478; SCHEDULER #12 kept this row at the cache head under CLAUDE.md §2 (it cuts gate time on every landing, M-94). NOT LANDED, CHECKED BY CONTENT at spawn: on the tree this flip lands in (`origin/main` @ `9d330478`), `docs/DECIDED.md` is still TRACKED (`git ls-tree` lists it) and `.gitignore` names it nowhere. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **`docs/DECIDED.md` IS A GENERATED INDEX, COMMITTED, AND 88 COMMITS TOUCHED IT ON 2026-09-21: EVERY LANE'S LANDING CONFLICTS ON A FILE NOBODY WROTE.** `tools/decided.mjs` regenerates it, the push guard refuses a stale one, and every rebase regenerates it again (`ORCHESTRATION.md`'s measurement). Item 2 of BOB #23's four. — owner M0.
order: directly after M0-98, item 2 of the four in the ruling's order (SCHEDULER #8, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `docs/development/ORCHESTRATION.md` §"THE RECORD IS PARTITIONED BY WRITER" rule 2, *a generated index is not committed*.
depends-on: none. **Sequence after M0-97 and D-341** (the cache; the same file, `tools/decided.mjs`).
scope: `docs/DECIDED.md` untracked and ignored; `decided.mjs` writes it on demand, and the seven tools that read it read through one freshness call; the push guard's and plancheck's staleness arms retire, their suites corrected with dated reasons, never exempted. **FULL GATE PROFILE**.
accepts-when: a ruling edited on two branches merges with no `DECIDED.md` conflict, and `decided.mjs "<subject>"` answers from the merged corpus. How a liar passes it: keeping it committed under `merge=ours`, which hides staleness, so an arm asserts it is untracked.
added: 2026-09-21 · SCHEDULER #8 (BOB #23's inbox entry, drained this commit; `node tools/mintid.mjs M0`).

### M0-100 · queued — **SEVERAL LANES APPEND TO ONE FILE — `CLAIMS.md`, TOUCHED BY 97 COMMITS ON 2026-09-21 — SO NEARLY EVERY RE-MERGE IS ON ITS TAIL, AND A LINE ONE LANE ADDS TO ITS OWN BLOCK CAN LAND IN ANOTHER'S.** So do `MEASUREMENTS.md` and `INTERFACE-CHANGES.md`. Item 3 of BOB #23's four. — owner M0.
order: directly after M0-99, item 3 of the four in the ruling's order (SCHEDULER #8, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `docs/development/ORCHESTRATION.md` §"THE RECORD IS PARTITIONED BY WRITER" rule 3, *a file several lanes append to becomes one file per entry*.
depends-on: none.
scope: one file per NEW claim, delegation, measurement and interface-change entry; the old files frozen history plus the state lines of their open blocks; ONE reader module yields both for every reader (`plancheck`, `delegations`, `owed`, `ledger`, `decided`, `mintid` …); `CLAUDE.md` §4's claim sentence and the kickoffs corrected in the landing. **FULL GATE PROFILE**.
accepts-when: two lanes adding entries concurrently merge with no conflict; a line one lane adds to its own block beside another lane's new entry stays in its block; every reader's counts over the frozen history are unchanged. How a liar passes it: `merge=union`, which makes CONDUCT's detached-line case SILENT, so an arm reproduces that case and asserts the line stays in its block.
added: 2026-09-21 · SCHEDULER #8 (BOB #23's inbox entry, drained this commit; `node tools/mintid.mjs M0`).

### REC-163 · running — **SPAWNED 2026-09-22 by CONDUCT #12, flipped in the landing of batch 2 (REC-157, M0-97 + D-341, M0-81). NOT LANDED, CHECKED BY CONTENT at spawn: on the tree this flip lands in (the landing of batch 2 onto `origin/main` @ `48aab56b`), `bio-plane/src/setup.mjs` line 103 still renders the literal `Believe in Oakland &middot; group instance`, and `op=instancegroup` still admits only `admin`, `member` and `probe` (`bio-plane/src/index.mjs` line 503). Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **EVERY INSTALLED INSTANCE'S SETUP PAGE NAMES BELIEVE IN OAKLAND AS ITS GROUP.** `bio-plane/src/setup.mjs`, served publicly at `/`, renders *"Believe in Oakland · group instance"* as a literal; D-436 made the producing group ONE recorded value (`Store#instanceGroup`, read by `op=instancegroup`) and the page does not read it. Routed by CONDUCT #11 at D-436's integration, verified at the code on `86523052`. — owner RECORD.
order: first after BOB #23's four partition items, which Bob's direction put at the head: a correction to just-landed work (D-436), and the first page a newly installed group sees names another group (SCHEDULER #9, 2026-09-21)
milestone: M7
interface: I3 additive — `op=instancegroup` admits the public class (BOB #24, `BIO_Publication_v0_1.md` §7); the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §7 (the publishing group's public identity: the slug is PUBLIC, BOB #24, 2026-09-21), with `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §3.1 (the `group` value, D-436).
depends-on: D-436.
scope: `op=instancegroup` admits the public class, and the setup page reads the recorded slug and shows it, or says that none is recorded, signed in or out. No display name or domain is invented: they are the next row's, under Publication §7.
accepts-when: signed out, the page served at `/` renders the recorded slug and no `Believe in Oakland`, and under a store recording none it says so; a public `op=instancegroup` answers the slug. How a liar passes it: hiding the literal with CSS, so the arm reads the served bytes. NEGATIVE CONTROL: restore the literal, and the second-slug arm fails by name.
added: 2026-09-21 · SCHEDULER #9 (CONDUCT #11's route; `node tools/mintid.mjs REC`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
