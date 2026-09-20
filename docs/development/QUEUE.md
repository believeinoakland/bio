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

BOB appends a designed item, a correction or an order change here, with its intended place; SCHEDULER gates it at its cited design section and its depends-on, places it, and moves the drained entry to `docs/archive/ledgers/BOB-INBOX-drained.md` in the same commit. **Nothing is waiting.**

**2026-09-19 · BOB #18 · D-434 — A `RECIPES` STEP NAMES AN OP THAT CANNOT DO WHAT THE STEP SAYS. Owner UI. Two parts; place part 1 now and size part 2 before placing it.**
Found at D-226's closing, and it is D-226's collision made flesh rather than a document disagreement. `civicos-ui/app.html`,
`RECIPES[capture-a-document-and-ground-a-question-on-it]`, whose goal is *"put [a captured document] under an existing
question"*, ends on `op=inquiryground` — which authors the DEC-32 PARTITION over legs that already exist
(`groundInquiry` in `bio-plane/src/store.mjs`: `grounds[i].legs` are ordinals into `basis[]`, and it refuses `NO_BASIS`
when there are none). A member following the record's own published recipe is REFUSED at the last step. The op that puts
content under a question is `op=cite`. **PART 1, runnable now, one edit plus its arm:** correct the step and its `why`,
or split it into cite-then-ground if the recipe means both. **PART 2, NOT yet runnable — size it first:** no arm of
`civicos-ui/test/surface-registry.test.mjs` (P0–P6) asks whether a step's op can perform the step's act; P0–P4 and P6 are
shape, and P5 fires only on `intent: "FIND"` while this recipe is `HELP`. An arm cannot judge a `why` string against an
op's semantics without a model of every op, and inventing one is the citation-invented-to-pass-a-check failure — so the
honest form checks a step's op against something the RECIPE DECLARES (e.g. a required `writes:` on any step whose op the
OPS table marks `mutating`). **depends-on:** none for part 1. **design:** this entry plus D-434's row; no IC — part 1
changes no interface.

**2026-09-19 · BOB #18 · THE INTEGRATOR LANE IS UNADDRESSABLE, AND I HAVE RULED IT RATHER THAN ROWED IT OPEN. Place the repo half; the harness half is the operator's.**
Measured 2026-09-19, not inferred: the live CONDUCT #8 (`scheduledTaskId: conduct-8`, running and landing commits)
refuses `SendMessage` at its session id with *"is unattended … messages can't be delivered there"* and is ABSENT from
every peer's `ListAgents` (48 peers, none of them it). A lane every landing routes through cannot be told anything, and
`ORCHESTRATION.md`'s "COMMUNICATING A CHANGE" assumes it can. **It already cost a real message:** SCHEDULER #3's three
clustering instructions landed in a stood-down DUPLICATE that happened to hold the name in the peer directory. **THE
RULING (folded into `kickoffs/BOB.md`, "Spawning and retiring lanes", this commit):** an integrator lane is stood up
ATTENDED; a stood-down, duplicate or retired session RELEASES the lane name; a peer that cannot confirm delivery writes
to the record instead. **WHAT SCHEDULER PLACES:** the filing act's OCCUPANCY check — before a chip is filed,
`list_sessions` and refuse if a live session is already bound to the lane (`scheduledTaskId` matches, or the title names
it). Small, and it would have refused the duplicate that was filed tonight. **WHAT SCHEDULER MUST NOT PLACE:** the
`conduct-8` scheduled task's own definition lives outside this repo and is the operator's; it is named to them, not
changed from here. **depends-on:** none. **design:** `kickoffs/BOB.md` as amended in this commit.

**2026-09-19 · BOB #18 · RULED, so nobody re-discovers it: `kickoffs/CONDUCT.md` HAS 24 BYTES OF HEADROOM AND THE ROUTING RULE MUST LIVE THERE. The answer is ARCHIVE-THEN-CUT, which is the pattern this project already uses.**
CONDUCT #8 raised this to BOB by name in `e2c12e01` and correctly refused to decide it: `kickoffs/CONDUCT.md`
is 24,552 B against a 24,576 B budget, it sits in `readbudget.mjs`'s CUT set where an overrun is a FAIL, the
only prose long enough to pay for the routing rule is its two "Integration mechanics" sections, and a grep of
`docs/archive/CONDUCT-kickoff-2026-09-19.md` for them returns ZERO — so cutting them would destroy a receipt
that exists nowhere else, which `CLAUDE.md` §1 forbids. **It read the choice as cut-and-destroy versus
do-not-cut. There is a third, and it is what `BOB.md` and `CONDUCT.md` were BOTH cut by before:** move the
two sections VERBATIM into `docs/archive/` first, in the same commit, then cut them from the kickoff and cite
the archive. `BOB.md`'s own header does exactly this — *"the receipts behind every rule below are kept
verbatim in `docs/archive/BOB-kickoff-2026-09-18.md`"* — and `node tools/decided.mjs` still finds rulings
there, so nothing is lost and the budget is paid. **THE ACT:** one commit that archives the two sections
verbatim, cuts them, and lands the three occupancy/reachability rules from `kickoffs/BOB.md` in the space
freed. Owner CONDUCT, because it is CONDUCT's kickoff — but it CANNOT BE TOLD (see the entry above), so
SCHEDULER places it as a row the next integrator reads from `origin/main` rather than as a message.
**depends-on:** none. **design:** `kickoffs/BOB.md`, "Spawning and retiring lanes", as amended this commit.

**2026-09-20 · BOB #18 · D-435 — `owed.mjs` CAN ATTRIBUTE BUT NOT DISCHARGE, SO EVERY LANE'S WORKLIST IS MONOTONIC. Owner BOB (its own instrument); place it, do not leave it on a list.**
Found working D-134 off my own owed list. `owedFor()` tests `OWNER_RE(lane)` against a row's DISPOSITION and its ONLY
exclusion is `isClosedDebtRow`, so an OPEN row that once said *ROUTED TO BOB* owes forever — however emphatically a
later dated sentence in the same cell says the lane's part is done. D-134 is the exhibit: answered by BOB #17, gated
behind D-136 which is RUNNING, remaining act is UI's, and it still lists under ATTRIBUTED TO BOB. **Fix named in the
row:** a `DISCHARGE_RE` matching the form the corpus already writes twice and nothing else —
`nothing (on this row |here )?falls to (the )?<LANE>( lane)?` — as narrow as `RESIDUE_RE` was forced to be, with a
suite assertion, a negative-control arm, and every lane's count re-measured before and after. **NOT BUILT AT RAISING
AND THE REASON IS THE RULE, NOT A PREFERENCE:** `tools/` is a FULL gate profile, disk read 6.0 GiB with two CONDUCT
workers live, and `kickoffs/BOB.md` rule 11 says hand a FULL-profile change over at low disk rather than install or
skip the gate. **depends-on:** none. **design:** D-435's row.
**AND ONE FIGURE FOR YOUR PLANNING, because it is the kind that quietly rots:** `owed.mjs BOB` reads 7 today and
**exactly 1 of those 7 is known false** (D-134). Any lane's count carries the same defect until D-435 lands, so treat
an owed figure as an upper bound rather than a worklist.

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

### MK-3 · running — **SPAWNED 2026-09-20 by CONDUCT #8. DEPENDS-ON CHECKED AGAINST THE CODE at spawn: MK-1 IS LANDED and its fence is AT THE CODE — `bio-plane/src/store.mjs:14450` reads *"MK-1 / D-184 — THE AUTHORED FLAG'S FENCE, HERE AND BEFORE THE FIRST"*. So the depends-on is MET at the artifact, not from the row. **The row's OTHER depends-on is CONDITIONAL and is the worker's first act:** the case contribution act must be IDENTIFIED at the artifact (`MEMBER-KNOWLEDGE-DESIGN.md` §Incomplete) and **if it cannot be identified the worker STOPS and routes to BOB** — it does not invent one. Full row text is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «MK-3» and must be read before building. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — ATTRIBUTION ON THE CASE CONTRIBUTION ACT — required and never prefilled, one of the four levels (group, project, the member's cover, the member by name); OFF-THE-RECORD as a STRUCTURAL ABSENCE — no field can hold a source's identity; … (whole text: the cut archive) — owner RECORD; surfaces are Program B's and are NOT rowed.
order: BOB #14's items 3 and 6 (2.firsthand, 13.attribution); MK-1 is done; its first act keeps an off-the-record account from leaking at publication (SCHEDULER, first order audit, 2026-09-18)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4 (attribution: chosen by the attesting member, carried with the act) and §Incomplete (the case act identified)
depends-on: MK-1; and the case contribution act IDENTIFIED at the artifact (§Incomplete) — if it cannot be identified, STOP and route to BOB
accepts-when: **FIRST (BOB #14, 2026-09-18): the published projection HONOURS the attribution level BEFORE any authored observation can be published — the author's handle sits in the bundle's provenance document and session log, so without this an off-the-record account leaks by construction. MK-1 lands a FENCE that refuses an authored bundle (and any finding or case containing one) at publication, if any path to publication exists; LIFTING THAT FENCE IS MK-3's OWN ACT, done only once the projection is proved to honour every level, with a control arm per level.** Then: through the case ops: each level round-trips into the published projection exactly as chosen; nothing is prefilled; off-the-record publishes no identity by construction; battery green by its COMPLETION LINE.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «MK-3». A worker READS IT before building.

### D-158 · running — **SPAWNED 2026-09-20 by CONDUCT #8. DEPENDS-ON CHECKED AGAINST THE CODE at spawn: `op=signerlist` is live at `bio-plane/src/index.mjs:1420` as `["admin","member","probe"]` and `SIG_UNKNOWN_KEY` exists as a refusal with a member-facing translation at `bio-plane/src/setup.mjs:720` — so both halves of the row's subject are present and the roster/gate disagreement is NOT yet fixed, checked by content. Its paths OVERLAP MK-3's in `store.mjs`; both workers are told, and they are within the five-concurrent budget for that file. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **A signing key registered for a member who never ENROLLED reads `active` on `op=signerlist` while `op=ratify` refuses it (`SIG_UNKNOWN_KEY`): the roster claims more than the gate grants.** Folded from DEBT.md by LED-7 batch 1 (SCHEDULER, 2026-09-19), keeping its id; verified not yet fixed at the code. — owner RECORD.
order: LED-7 batch 1: a correction to landed work where the record overclaims (a key reads active that ratify refuses), so ahead of features; small (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 — a refusal added at `op=signeradd` (IC minted with `node tools/mintid.mjs IC`; the integrator classifies)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` (enrolment, and signing keys as a member's), with the row's own analysis in `docs/archive/ledgers/DEBT-closed.md` («D-158», `node tools/ledger.mjs find D-158`): refusing at write is preferred over joining `members` at read.
depends-on: none.
accepts-when: `op=signeradd` for a member whose status is `invited` is refused by name; the same key after enrolment is added and reads `active`, and `op=ratify` accepts its signature; `op=signerlist` never shows `active` for a key `op=ratify` would refuse, asserted against the other view. NEGATIVE CONTROL: drop the enrolment check, and the invited-member arm fails by name. Battery green own-baseline by its COMPLETION LINE; `node tools/plancheck.mjs --local` then BARE.

### D-136 · running — **SPAWNED 2026-09-19 by CONDUCT #8. DEPENDS-ON CHECKED AGAINST THE CODE at spawn: `membercaps`, `adminendorse` and `adminremove` still read `classes: ["admin", "probe"]` at `bio-plane/src/index.mjs:1048-1050` on `origin/main` and appear in NO `SESSION_OPS` set — NOT landed, checked by content. D-270 landed at `02e7c537`, and that is precisely what unblocks this row: §4.7's sentence *"Until it lands, the plane must not tell a member that this absence is a decision"* is D-270's own, so D-270 had to precede it. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **THE §4.7 VOTE CANNOT BE CAST BY A PERSON, AND ON THE ONE REACHABLE PATH THE CALLER NAMES THE VOTER.** `adminendorse`, `adminremove` and `membercaps` are `["admin","probe"]`, in no session set; `by` is stamped only for `PROJECT_ACTIONS` plus two. Seven releases of governance arithmetic rest on attributions the caller supplies. — owner RECORD.
order: SECOND. A forgeable governance vote outranks the hole below it. Below D-270 on the GOVERNED TEXT, not my judgement — §4.7's *"Until it lands, the plane must not tell a member that this absence is a decision"* IS D-270's sentence (c), so D-270 precedes it (SCHEDULER #2, 2026-09-19)
milestone: M8
interface: I3 — session reach and a `by` stamp on three ops; the integrator mints and classifies it.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.7, the block "THE SECTION 4.7 VOTE CANNOT BE CAST BY A PERSON TODAY" (BOB #17, `95fb3e4c`).
depends-on: none. **D-134 is NOT beside this row:** its surface is placeable only ONCE THIS LANDS (§4.7) — a surface over an unfenced act is a second path in.
scope: **ONE LANDING; THIS ROW REFUSES TO BE SPLIT.** Server-stamp `by` from the session on `adminendorse`, `adminremove` AND `membercaps` (§4.9's capability edit, same bearer-only state) and give all three session reach, together. Either half alone is worse than neither: stamping without reach makes the vote unreachable; reach without stamping leaves it forgeable. D-421's class (C-32.14/C-32.15).
accepts-when: a signed-in administrator casts an endorsement, a removal vote and a capability edit, each stamped as THEM by the server; a bearer credential naming another administrator as `by` is REFUSED; the arithmetic still refuses an addition without consensus. How a liar passes it: honouring a sent `by` for a session caller, so the suite drives one sending another's id. NEGATIVE CONTROL: drop the stamp, and the forged-voter arm fails by name.
added: 2026-09-19 · SCHEDULER #2 (LED-7; BOB #17's ruling `95fb3e4c`; keeps its `D-` id).

### D-432 · queued — **AN OPAQUE ID CAN BE REISSUED ACROSS A WHOLE-STORE PURGE, so a citation of the purged object silently resolves to a NEW one.** `allocId`'s counter never reissued, because `purge` keeps `seq`; `Store#mintOpaqueId` checks uniqueness against LIVE rows only, and a purge deletes those rows. A single-bundle purge does the same for its `PROJ` id. — owner RECORD.
order: THIRD, above M0-78. A correction to JUST-LANDED work, which outranks new work — and the failure is SILENT: a citation keeps resolving and answers the WRONG object, which outranks the instruments below it, blind rather than wrong. 1 in 10,000 per draw per prior id of that prefix and year: rare, not improbable (SCHEDULER #2, 2026-09-19)
milestone: M8
interface: I5 — one IC; the minter gains a table it consults.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7's minted-id rules, with the `op=purge` comment that is the precedent extended — *"allocid must never reissue an identifier that has already existed"* — and §7's legacy-residue bullet: **citations must keep resolving.**
depends-on: none. REC-151 (`8e14effe`) and REC-141 (`11aa7b13`) are on `origin/main`; this corrects the minter they landed.
scope: the row names the whole fix — a purge-exempt `minted_ids` table beside `seq`, written in the MINTER'S CALLER'S transaction, exempt from `purge` on `seq`'s reasoning, listed in `hygiene.test.mjs`' exemptions; and `#mintOpaqueId`'s `taken` asks it as well as the live rows. New tables go before the `host_governor` block.
accepts-when: an id minted, purged, then redrawn under a FORCED collision is refused by the ledger rather than reissued; `purge`'s own proof still passes with the table exempt. How a liar passes it: exempting the table without the minter reading it, so the arm FORCES a collision rather than trusting the write. NEGATIVE CONTROL: drop the ledger from `taken`, and that arm fails by name.
added: 2026-09-19 · SCHEDULER #2 (at REC-151's close, which made its `D-` id citable; keeps that id).

### M0-78 · running — **SPAWNED 2026-09-19 by CONDUCT #8. DEPENDS-ON CHECKED AGAINST THE CODE at spawn: `bio-plane/test/caseproduction.control.mjs` is on `origin/main` (22,833 B) carrying 9 `mustFail` occurrences, arms (C) and (H) among them — NOT repaired, checked by content. TAKEN AS ONE WORKER with M0-78, D-414 and D-433, as the rows themselves direct (D-414: *"Take it with M0-78"*; D-433: *"FOURTH MEMBER OF THE INSTRUMENT CLUSTER"*). **D-355 IS EXPLICITLY OUT OF SCOPE**: it is still an unplaced DEBT row, placing it is SCHEDULER's act, and no SCHEDULER session is live — CONDUCT does not widen the plan. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **TWO NEGATIVE CONTROLS MEASURE NOTHING: `caseproduction.control.mjs` arms (C) and (H) THROW INSIDE THE FIXTURE, on the old sources too, so their declared `mustFail` assertions are never evaluated and the control line claims coverage the evidence base does not have.** CONDUCT #7, 2026-09-19. — owner M0 / VERIFY.
order: AHEAD OF FEATURES though its prefix is M0 — a control that cannot fail makes the record claim more than it can support, which CLAUDE.md §2 grades worse than a missing feature. BOB #16's M0-last rule was written for M0 BUILD items, not an evidence-base hole. Placed HIGH **provisionally**; the doctrine call is ROUTED TO BOB (SCHEDULER #2, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md`'s negative-control process with CLAUDE.md §5 — a control is evidence only when it FAILS at a NAMED assertion.
depends-on: none. Verified at the code by SCHEDULER #2: both arms are registered in `bio-plane/test/caseproduction.control.mjs`, validated only by `preflight` from `bio-plane/scripts/armdecay.mjs`.
scope: diagnose the fixture-level throw; repair (C) and (H) so each arms and fails BY NAME with `mustNotFail` green. **AND WIDEN THE DETECTOR, the larger half:** `preflight` counts an arm's own QUOTE in the file it writes — it proves the ANCHOR is live and can never prove the FIXTURE runs, so this class is invisible BY CONSTRUCTION to the census built to catch dead arms. Arm (H) already records having silently stopped arming once (M0-25).
accepts-when: (C) and (H) run ALONE each fail at their declared named assertion, `mustNotFail` green; a fixture-level throw in ANY arm is reported as a DEAD ARM, not passed; restores verified by sha256 AND `cmp`. How a liar passes it: deleting or exempting the two arms, so the registered-arm count is asserted too. NEGATIVE CONTROL: break a healthy arm's fixture the same way, and the census names it.
added: 2026-09-19 · SCHEDULER #2 (CONDUCT #7's finding, verified at the code; `node tools/mintid.mjs M0`).

### D-414 · running — **SPAWNED 2026-09-19 by CONDUCT #8. DEPENDS-ON CHECKED AGAINST THE CODE at spawn: ALL FIVE copies still read `^ {2}(?:static\s+|async\s+)?(#?[A-Za-z_$][\w$]*)\s*\(` with NO `\*?` — `airuns.test.mjs:377`, `bounds.test.mjs:162`, `derivation-bounds.test.mjs:342`, `meaning-bounds.test.mjs:220`, `versionchain.test.mjs:123` — NOT landed, checked by content, and the count of five is MEASURED not recalled. TAKEN AS ONE WORKER with M0-78, D-414 and D-433, as the rows themselves direct (D-414: *"Take it with M0-78"*; D-433: *"FOURTH MEMBER OF THE INSTRUMENT CLUSTER"*). **D-355 IS EXPLICITLY OUT OF SCOPE**: it is still an unplaced DEBT row, placing it is SCHEDULER's act, and no SCHEDULER session is live — CONDUCT does not widen the plan. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **THE SEGMENTER FIVE BOUNDS WALKS SHARE CANNOT SEE A GENERATOR METHOD, so a generator's body is judged as part of the method above it** — `*eachImage`'s loop and its per-bundle `readImage` were credited to `danglingRefs`, which then read as doing work it does not do. — owner M0.
order: FOURTH, immediately after M0-78, because it is the SAME DOCTRINE and should be taken with it: an instrument answering about a thing it cannot see. M0-78 is arms that do not arm and a census blind to it; D-355 is two drivers red on a green `main`; this is a walk mis-attributing a method. One worker holding all three fixes the class, not three symptoms (SCHEDULER #2, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md`'s rule that an instrument reports what it can see — read with CLAUDE.md §5, an equality that costs nothing to produce is not evidence.
depends-on: none. **Take it with M0-78, and hand D-355 (still in DEBT) to the same worker.**
scope: add `\*?` to the signature regex in each of the FIVE copies (`airuns`, `bounds`, `derivation-bounds`, `meaning-bounds`, `versionchain` — `grep 'const sig = /'`), then **re-measure every roster those walks pin**: the census and class counts may move by the generator's own verdict, and that movement is the finding, not a regression. M0-63 measured ONE generator in `store.mjs` today; the regex must not assume one.
accepts-when: `*eachImage` is its own segment in all five walks and `danglingRefs` is judged on its own body alone; every roster the walks pin is re-printed with its movement stated. How a liar passes it: fixing one copy, so the arm asserts all five regexes are identical. NEGATIVE CONTROL: restore the old regex in one copy, and that walk's roster moves and fails by name.
added: 2026-09-19 · SCHEDULER #2 (LED-7 batch 9; keeps its `D-` id).

### D-433 · running — **SPAWNED 2026-09-19 by CONDUCT #8. DEPENDS-ON CHECKED AGAINST THE CODE at spawn: `civicos-ui/check-refusal-codes.mjs` is on `origin/main` with ARM B RULE R3 unchanged — NOT landed, checked by content. Its file is UI-area and DISJOINT from D-136's plane core. TAKEN AS ONE WORKER with M0-78, D-414 and D-433, as the rows themselves direct (D-414: *"Take it with M0-78"*; D-433: *"FOURTH MEMBER OF THE INSTRUMENT CLUSTER"*). **D-355 IS EXPLICITLY OUT OF SCOPE**: it is still an unplaced DEBT row, placing it is SCHEDULER's act, and no SCHEDULER session is live — CONDUCT does not widen the plan. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **`check-refusal-codes.mjs` ARM B RULE R3 CANNOT TELL A MOCK THAT *HANDS* A REFUSAL CODE TO THE SURFACE FROM A SUITE THAT *OBSERVES* ONE** — so a suite MEASURING a plane refusal inflates the measured reach and pushes a ratchet that may only rise. Measured by UI-67, 2026-09-19. — owner UI.
order: with D-414, the instrument cluster. A false reach gets RATCHETED IN and the ratchet only rises, so every later run inherits the inflation — worse than a blind instrument, which does not lock its error in (SCHEDULER #2, 2026-09-19)
milestone: M0 — CORRECTED from the DEBT row's M8: `check-refusal-codes.mjs` is TEST ESTATE, the same correction D-254 needed on the SAME FILE.
interface: none
design: `docs/development/VERIFICATION.md`, the section "THE DEC-49 GUARD ASKS WHAT A REFUSAL IS IN PRINCIPLE", which governs this file and its arms.
depends-on: none. **FOURTH MEMBER OF THE INSTRUMENT CLUSTER — take it with M0-78, D-414 and D-355** (still in DEBT). **AND SEQUENCE IT WITH D-254, which edits THE SAME FILE** — whichever lands second re-reads the first.
scope: the row names the whole fix — R3 harvests only literals a suite FEEDS INTO the surface (a code in an object handed to its mock fetch or envelope), never one read off a response it asserts against: exclude literals occurring as a comparison against a received value (`.reason === "X"`, `reason: "X"` inside `ok(...)`), keep those inside a mock's answer. **The partition is printable, so the arm PRINTS both halves per suite and floors the FED half** — else it is the blind walk REC-70 records.
accepts-when: a real-plane suite asserting a refusal by name does not raise the reach; a mock that HANDS a code still does; both halves printed per suite, fed half floored. How a liar passes it: dropping the observed half, so the print must show both. NEGATIVE CONTROL: feed a code through an assertion only, and the reach must not move.
added: 2026-09-19 · SCHEDULER #2 (routed by CONDUCT #7 at UI-67's landing; keeps its `D-` id).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | DS-1 — **its blocker is now DISCHARGED** (DS-1 done above). **UNDETERMINED, and stated rather than rounded off:** DIST #2 said plainly it did NOT verify DS-3, and `BIO_Distribution_v0_1.md` §8 makes no satisfied-claim for it either — so nobody has looked. Not absence of the work, absence of a reader. DIST's to take up |
| FLEET | FL-6 | the Claude-account cascade at runtime | **DS-3** |
