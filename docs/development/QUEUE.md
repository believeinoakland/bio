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

### M0-99 · running — **SPAWNED 2026-09-22 by CONDUCT #12, after batch 2 landed M0-97 + D-341 (the same file, `tools/decided.mjs`) at 9d330478; SCHEDULER #12 kept this row at the cache head under CLAUDE.md §2 (it cuts gate time on every landing, M-94). NOT LANDED, CHECKED BY CONTENT at spawn: on the tree this flip lands in (`origin/main` @ `9d330478`), `docs/DECIDED.md` is still TRACKED (`git ls-tree` lists it) and `.gitignore` names it nowhere. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **`docs/DECIDED.md` IS A GENERATED INDEX, COMMITTED, AND 88 COMMITS TOUCHED IT ON 2026-09-21: EVERY LANE'S LANDING CONFLICTS ON A FILE NOBODY WROTE.** `tools/decided.mjs` regenerates it, the push guard refuses a stale one, and every rebase regenerates it again (`ORCHESTRATION.md`'s measurement). Item 2 of BOB #23's four. — owner M0.
order: kept at the head under Bob's ruling of 2026-09-22 (`CLAUDE.md` §2: no process row unless it cuts gate time or unblocks product) because it CUTS GATE TIME: 142 of the 209 commits on `main` in the 24 h to 13:30Z 2026-09-22 touched `docs/DECIDED.md` (M-94), so both sides of nearly every rebase carry it, `gates.mjs --since` re-runs its readers, and the push guard refuses a stale copy (SCHEDULER #12; placed by SCHEDULER #8 as item 2 of BOB #23's four)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `docs/development/ORCHESTRATION.md` §"THE RECORD IS PARTITIONED BY WRITER" rule 2, *a generated index is not committed*.
depends-on: none. **Sequence after M0-97 and D-341** (the cache; the same file, `tools/decided.mjs`).
scope: `docs/DECIDED.md` untracked and ignored; `decided.mjs` writes it on demand, and the seven tools that read it read through one freshness call; the push guard's and plancheck's staleness arms retire, their suites corrected with dated reasons, never exempted. **FULL GATE PROFILE**.
accepts-when: a ruling edited on two branches merges with no `DECIDED.md` conflict, and `decided.mjs "<subject>"` answers from the merged corpus. How a liar passes it: keeping it committed under `merge=ours`, which hides staleness, so an arm asserts it is untracked.
added: 2026-09-21 · SCHEDULER #8 (BOB #23's inbox entry, drained this commit; `node tools/mintid.mjs M0`).

### M0-109 · running — **SPAWNED 2026-09-22 by CONDUCT #12, as its OWN worker rather than with M0-99 (so the floor lands in minutes, not with M0-99's FULL change). NOT LANDED, CHECKED BY CONTENT at spawn: on the tree this flip lands in (`origin/main` @ `b089c584`), `bio-plane/test/ledger.test.mjs` line 286 still asserts `rows.length > 100` while `docs/development/DEBT.md` holds 101 rows. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **`bio-plane/test/ledger.test.mjs` FLOORS THE LIVE `DEBT.md` AT MORE THAN 100 ROWS, SO THE DEBT FOLD'S OWN PROGRESS REDS THE GATE.** Its agreement arm asserts *"the real DEBT.md has rows (else the agreement is vacuous)"* as `rows.length > 100`. LED-7 took the ledger to 99 open rows on 2026-09-22, and SCHEDULER #12's DOCS gate read RED on that arm alone (tree `635ded3c`, run `83089.94bae0`: 42/43 suites); at today's 101 rows the next closure reds it again. — owner M0.
order: in the cache, in M0-100's slot while CONDUCT holds M0-100 for M0-99: it UNBLOCKS PRODUCT — while the floor stands no DEBT row can leave by any door, and the fold that feeds product rows into the plan stops (Bob, 2026-09-22, `CLAUDE.md` §2: a process row that unblocks product may sit at the head); a one-line correction, so CONDUCT may brief it with M0-99's worker if that brief reaches the ledger suites (SCHEDULER #12)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a suite is evidence only where it can disagree with its subject, and this arm's subject is the owed/ledger agreement, not the ledger's size; with `CLAUDE.md` §5: *correct superseded tests, never exempt them*.
depends-on: none.
scope: the non-vacuity floor becomes `rows.length > 0` while `DEBT.md` holds rows, corrected at the site with a dated comment saying why 100 was wrong (the fold was always meant to drain the ledger); the arm's two real assertions (no residue row reads closed; no owed row is archivable) are unchanged. When LED-7 archives `DEBT.md` whole the arm reads the archive, and the site says so. **TARGETED GATE PROFILE** (`bio-plane/test`).
accepts-when: the suite passes over today's live ledger and would over any non-empty one; an EMPTY ledger fails the floor by name. How a liar passes it: deleting the floor, so the empty-ledger arm must fail. NEGATIVE CONTROL: restore `> 100`, and the suite fails at the floor by name on a ledger of 100 rows or fewer.
added: 2026-09-22 · SCHEDULER #12 (found by its own DOCS gate; `node tools/mintid.mjs M0`).

### REC-163 · running — **SPAWNED 2026-09-22 by CONDUCT #12, flipped in the landing of batch 2 (REC-157, M0-97 + D-341, M0-81). NOT LANDED, CHECKED BY CONTENT at spawn: on the tree this flip lands in (the landing of batch 2 onto `origin/main` @ `48aab56b`), `bio-plane/src/setup.mjs` line 103 still renders the literal `Believe in Oakland &middot; group instance`, and `op=instancegroup` still admits only `admin`, `member` and `probe` (`bio-plane/src/index.mjs` line 503). Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **EVERY INSTALLED INSTANCE'S SETUP PAGE NAMES BELIEVE IN OAKLAND AS ITS GROUP.** `bio-plane/src/setup.mjs`, served publicly at `/`, renders *"Believe in Oakland · group instance"* as a literal; D-436 made the producing group ONE recorded value (`Store#instanceGroup`, read by `op=instancegroup`) and the page does not read it. Routed by CONDUCT #11 at D-436's integration, verified at the code on `86523052`. — owner RECORD.
order: first after BOB #23's four partition items, which Bob's direction put at the head: a correction to just-landed work (D-436), and the first page a newly installed group sees names another group (SCHEDULER #9, 2026-09-21)
milestone: M7
interface: I3 additive — `op=instancegroup` admits the public class (BOB #24, `BIO_Publication_v0_1.md` §7); the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §7 (the publishing group's public identity: the slug is PUBLIC, BOB #24, 2026-09-21), with `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §3.1 (the `group` value, D-436).
depends-on: D-436.
scope: `op=instancegroup` admits the public class, and the setup page reads the recorded slug and shows it, or says that none is recorded, signed in or out. No display name or domain is invented: they are the next row's, under Publication §7.
accepts-when: signed out, the page served at `/` renders the recorded slug and no `Believe in Oakland`, and under a store recording none it says so; a public `op=instancegroup` answers the slug. How a liar passes it: hiding the literal with CSS, so the arm reads the served bytes. NEGATIVE CONTROL: restore the literal, and the second-slug arm fails by name.
added: 2026-09-21 · SCHEDULER #9 (CONDUCT #11's route; `node tools/mintid.mjs REC`).

### M0-106 · queued — **DIST's RELEASE GATE RE-RUNS THE WHOLE BATTERY ON MERGED `main`, CALLING IT *"a tree nobody has tested"* (`kickoffs/DIST.md`), WHICH IS FALSE WHEREVER THAT EXACT TREE ALREADY CARRIES A GREEN FULL RECORD** (D-293 keys the record by tree). DIST #4's 0.71.0 gate took ~2.5 h here for a battery that runs in ~16 min. — owner DIST (its own kickoff).
order: near the head, ahead of the product rows because it CUTS GATE TIME (Bob's ruling, 2026-09-22, `CLAUDE.md` §2: *The goal is BIO work; process is overhead*: no process row unless it cuts gate time or unblocks product); DIST's own act, never a worker slot (moved by SCHEDULER #11 on BOB #25's word, 2026-09-22)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `CLAUDE.md` §6's ruling of 2026-09-22; the item is carried in BOB #25's drained entry (`docs/archive/ledgers/BOB-INBOX-drained.md`, "GATES RUN FAR MORE THAN THEY NEED TO").
depends-on: none — D-293's record and M0-98's `--since` are on `main`.
scope: step 1 becomes: a GREEN FULL record for the tree being released, or `gates.mjs --since <the newest commit whose tree carries one>`, and the whole battery only when neither exists; the version bump's own check stays. DIST writes it; CONDUCT routes the row to DIST and briefs no worker.
accepts-when: a release from a tree with a GREEN FULL record runs no battery and names the record it relied on; one from an unrecorded tree runs the battery as today.
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 1, drained this commit; `node tools/mintid.mjs M0`).

### M0-107 · queued — **LOAD MAKES A GATE WRONG, NOT ONLY SLOW: a suite whose subprocess or wall-clock budget expires reads the expiry as a FINDING, and since D-293 the false RED is recorded and refuses the push.** DIST #4's 0.71.0 gate read RED on `owed-controls` A13/A13b beside a concurrent battery (M0-103, this row's first site); 57 `timeout:` sites sit in 43 suites and neither `gates.mjs` nor `battery.mjs` names a timeout outcome (re-read on `032d1ce1`). — owner M0.
order: directly after M0-106, near the head because it CUTS GATE TIME: a load-made RED costs a FULL re-run and blocks a push (Bob's ruling, 2026-09-22, `CLAUDE.md` §2: *The goal is BIO work; process is overhead*); it supersedes M0-103 (moved by SCHEDULER #11 on BOB #25's word, 2026-09-22)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a suite is evidence only where it can disagree with its subject, and a timeout is no disagreement; the item is carried in BOB #25's drained entry.
depends-on: none.
scope: every suite whose subprocess or wall-clock budget can expire reads the expiry as ONE named timeout assertion, never a finding; a run whose only failures are timeouts records NOT MEASURED instead of RED, so the push guard does not refuse on it. First site: M0-103's two `coverage.mjs` spawns in `owed-controls.test.mjs`. **FULL GATE PROFILE**.
accepts-when: a sweep names every `timeout:` and budget site with its outcome check; a run killed only by timeouts writes no RED record. How a liar passes it: raising every timeout, which hides a real hang, so an arm plants a hang and asserts it is still named. NEGATIVE CONTROL: a 1 ms budget on one swept site fails its timeout assertion by name and no finding assertion.
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 2, drained this commit; `node tools/mintid.mjs M0`); supersedes M0-103.

### REC-166 · queued — **A PROJECT'S MAKE-CURRENT WRITES INTO THE SHARED QUESTION.** `op=versioncurrent&project=P` promotes the INQUIRY first (its `last_updated` and the Session Log line *reading '<v>' is what P stands on*) and only then P's pointer, so the finding's `bundle_sha` moves for no change to the finding: cases pinning it lose CASE-4's fences and `#flagCasesOnRevision` flags them all, another project's included (`store.mjs`, re-read on `032d1ce1`). — owner RECORD.
order: first of the product corrections, directly after REC-157 lands (BOB #25): one team's act silently moving another team's published pins, which §7 forbids, CLAUDE.md §2's class; it completes REC-157's premise on every path (SCHEDULER #11, 2026-09-22)
milestone: M10
interface: I3 — the receipt moves from the inquiry's bytes to the project's; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §7, *"A PROJECT'S MAKE-CURRENT WRITES NOTHING ON THE SHARED QUESTION"* (BOB #25, 2026-09-22), fix (a).
depends-on: REC-157.
scope: fix (a): the project arm writes its receipt into the PROJECT's own bytes, in the promotion that writes its pointer, and does not promote the inquiry; accept, reject, hide and their siblings still promote it. Fix (b), exempting the revision flag, is refused (§7).
accepts-when: after a project-arm make-current the inquiry's `bundle_sha` is unchanged, `op=caseflags` names no case for it, a published case pinning the finding keeps CASE-4's fences, and P's Session Log carries the line; `op=versionaccept` still moves the inquiry. How a liar passes it: dropping the receipt with the promotion, so an arm asserts the line in P's bytes. NEGATIVE CONTROL: restore the inquiry promotion, and the `bundle_sha`-unchanged arm fails by name.
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 1, drained this commit; `node tools/mintid.mjs REC`).

### REC-165 · queued — **A PRODUCTION CAN NAME A RUN ITS CALLER DOES NOT HOLD.** `op=suggest` resolves `run` for existence alone and `op=extractpropose` checks running and mode, never whose run it is (`store.mjs`); `runPrincipalGate` guards only the tick and the close, so a version is read against another member's lens, bar, skill version and principal (traced by BOB #25; re-read 2026-09-21). — owner RECORD.
order: directly after UI-77, with the corrections to built work: an attribution the record cannot support, in REC-152's fence, CLAUDE.md §2's class; below REC-163 and UI-77, which every installed instance's public page shows, because this needs a signed-in caller holding another run's id (SCHEDULER #10, 2026-09-21)
milestone: M9
interface: I3 — two ops refuse what they accepted; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5, rule 1 (BOB #25, 2026-09-21).
depends-on: none — REC-152's gate and stamp are built.
scope: rule 1: REC-152's stamp of the caller's `principal` on both ops, both apply `runPrincipalGate`, and `suggest` refuses a run that is not running, as `extractpropose` already does.
accepts-when: another principal's running run is refused `AI_RUN_NOT_PRINCIPAL` on both ops; the caller's closed run is refused on `suggest`; the caller's own running run lands from a session AND from a machine credential that member minted. How a liar passes it: gating one caller kind only, so both arms run. NEGATIVE CONTROL: drop the gate in `suggest`, and the other-principal arm fails by name.
added: 2026-09-21 · SCHEDULER #10 (BOB #25's inbox entry, item 1, drained this commit; `node tools/mintid.mjs REC`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
