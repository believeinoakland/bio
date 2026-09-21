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

**2026-09-21 · BOB #19 · `tools/retirable.mjs` HAS A THIRD DEFECT, AND IT INVERTS THE STANDING-LANE PROTECTION. Place it WITH CONDUCT #8's two (`CLAIMS.md` DELEGATION 2026-09-20) as ONE row: one file, one suite, one gate. Owner BOB (its instrument). FULL profile. Intended place: the top of the backlog, beside M0-81.**
Measured 2026-09-21 ~14:12Z. Fed the complete BIO listing (18 sessions, `--total 18`, `--self` = BOB #19's id), the tool
judged `CONDUCT #8 (BIO) — integrator lane` RETIRABLE (*"sits in the MAIN CHECKOUT — archive it"*) and `CONDUCT #7`
PROTECTED as *"live holder of the CONDUCT lane"*. CONDUCT #8 is the lane's NEWEST session. **Cause, at the code:**
`laneOf` strips only a TRAILING `#N` (`/\s*#\d+\s*$/`), so a title with text after the number is in no lane. The
newest-of-lane map then elects the predecessor, and the real holder is judged on its tree. It is harmless today only
because both sessions are stood down. On a working day, a CONDUCT started by the scheduled-task path, whose title
carries that suffix, reads RETIRABLE between waves, and that is the one act the standing-lane rule exists to prevent.
**FIX NAMED:** `laneOf` takes the word before `#<n>` wherever the number sits (`/^\s*([A-Za-z]+)\s*#\d+/`, else the
title), with a suite arm feeding the suffixed title and a NEGATIVE CONTROL restoring the trailing-only regex. CONDUCT
#8's two fixes ride in the same row: refuse when the `--self` id is found in the input, and let the caller declare its
own title so the caller counts as the newest of its lane. **depends-on:** none. **design:** the tool's header ("WHAT IS
NEVER AUTO-RETIRED") and `kickoffs/BOB.md` "Spawning and retiring lanes".

**2026-09-21 · BOB #19 · THE HEARTBEAT MEASURES A STALE TREE. Its queue counts and its sweep come from the main checkout's WORKING TREE, which sits at `aa5cc98d`, 34 commits behind `origin/main`. The durable fix is the operator's (the task definition). Named here so it is placed rather than lost. Intended place: with M0-81.**
`conduct-heartbeat` STEP 3 greps `docs/development/QUEUE.md` in `/Users/sparky/Downloads/ClaudeCodeBIO`, and STEP -1
runs `tools/retirable.mjs` there. `git fetch` moves the remote ref and never the working tree, and no session works in
that checkout (DEC-3), so nothing ever advances it. Its `queued`/`running` counts are therefore the tree's as of
2026-09-20 00:48. Its predicate lacks `d8a25035`'s stated bound. **STEP 4b's idle-with-work alarm, which reaches Bob's
phone, rests on those counts.** **FIX NAMED:** STEP 3 reads `git show origin/main:docs/development/QUEUE.md`, and STEP
-1 fast-forwards the checkout first (`git merge --ff-only origin/main`; the checkout is clean and held by nobody, so a
fast-forward cannot lose work). BOB #19 is taking the definition edit to Bob as the act only he can approve.
**depends-on:** none. **design:** the heartbeat's own STEP 3 warning, *"A QUESTION ASKED ABOUT THE WRONG UNIT"*.

**2026-09-21 · BOB #19 · A DOCUMENT-SIDE WITNESS FOR THE OCCUPANCY FAILURE: two instances of one lane BOTH landing, the older after the newer. Owner M0. Intended place: directly after M0-81, which PREVENTS what this DETECTS.**
BOB #17 landed `aa5cc98d` (00:48) after BOB #18 had landed `0ca2c216`, `8e4c30c3` and `fa58ce92`. Nothing noticed for
hours, and `BOB.md` rule 4 now carries the lesson as prose. **The check is pure git and about a second:** over `git log
origin/main --format='%h %cI %s'`, for each lane prefix `<lane> #N:`, any commit by instance N dated AFTER a commit by
instance M > N is a POST-SUCCESSION LANDING. Make it a plancheck WARN naming both commits. A predecessor correcting its
own `-NEXT` file before retiring is exempt, because that commit touches the `-NEXT` file. It would have told BOB #18 at
its next push that BOB #17 was still landing. **accepts-when:** a fixture log with an older instance landing after a
newer one WARNs by name, and the same log with the late commit touching only the `-NEXT` file does not. **depends-on:**
none. **design:** `kickoffs/BOB.md` rules 4 and 12.

**2026-09-21 · BOB #19 · M0-82 NARROWED, NOT SUPERSEDED. Correction to a placed row.**
The rule the integrator most needed in its own kickoff landed IN PLACE this commit, at NET −14 B. `CONDUCT.md` "Starting
your successor" now says: start the successor ATTENDED by a chip, and use the scheduled-task start only when no BOB
answers, in which case the lane is written down as deaf so peers route through the record. The same commit fixes the
exact-title requirement. **M0-82's archive-then-cut and the OCCUPANCY rules are still owed.** Its premise that
*"CONDUCT cannot be told"* holds only for a scheduled-task CONDUCT: CONDUCT #9 was chipped attended on 2026-09-21.

**2026-09-21 · BOB #19 · MK-3 IS STOPPED-AND-REPLACED. Its five doctrine questions are RULED (`MEMBER-KNOWLEDGE-DESIGN.md` §4.1–§4.6), and §8 names the two items that replace it. Mint their ids as you place them; none is named before its row exists. Intended place: MK-3's own slot, (i) then (ii). Disposition MK-3's row as STOPPED-AND-REPLACED: its worker's STOP landed at `8ca77e8d`.**
**(i) THE BUNDLE NAMES NO AUTHOR (§4.1).** Owner RECORD. Interface I3 and I5; the builder states whether it is
additive or breaking. **depends-on:** MK-1 (built). Today `testify` writes the author's member id into `bundle.md`'s
Session Log AND into `data/provenance.json` (`author`, `provenance_chain[].who`), and a ratified bundle's files are
what the published bucket receives. The fix: every file and manifest record an authored bundle can publish names the
author as `observer:<testimony id>`, which only the register resolves. **accepts-when:** a fixture case publishes an
observation at `group` level and NO published part (no file, no manifest entry) contains the author's member id,
handle or cover. This is a population arm, never a list of sites. **NEGATIVE CONTROL:** restore the member id in the
Session Log, and the arm fails by name. Existing authored bundles stay fenced, and no published byte moves.
**(ii) THE ACT AND THE LIFT (§4.2–§4.6).** Owner RECORD. Interface I3. **depends-on:** (i), and the review copy
(REC-126, built). The item builds the attribution act (an op the builder names), which only the observation's author may take, per (case edition,
observation), on the draft. It writes each edition's attribution into the case document, derived from the act. It
refuses ratification while any reached observation is unchosen, naming each one. It refuses `name` for a member with
no handle. **Then, as its own act, it lifts MK-1's fence (C-53.10–.12), with a control arm per level.** MK-5 now
depends on (ii). Two of (ii)'s points are provisionals carried to Bob, cheap to change until built: §4.4's narrow veto
and §4.6's `name` = handle. Build (i) regardless.

**2026-09-21 · BOB #19 · D-436. THE PLANE STAMPS A LITERAL PRODUCING GROUP, SO A SOVEREIGN GROUP'S RECORD NAMES THE WRONG PRODUCER IN ITS OWN SIGNED BYTES. Owner RECORD, with DIST. Intended place: M7's rows, AHEAD of any release a new group installs.**
The row is in `DEBT.md` in this commit, with its FIX NAMED and its one design call made. The instance's group slug
becomes ONE value in the Durable Object's durable state, written once at first bootstrap from the slug the installer
already holds (D-102). It is never a deploy-time var, because it appears in signed bytes. Every default and every stamp
reads it. **accepts-when:** an install under a second slug writes no `believe-in-oakland` into any bundle, with a
NEGATIVE CONTROL that restores one literal. **depends-on:** none. **design:** D-436's row.

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

### D-432 · queued — **AN OPAQUE ID CAN BE REISSUED ACROSS A WHOLE-STORE PURGE, so a citation of the purged object silently resolves to a NEW one.** `allocId`'s counter never reissued, because `purge` keeps `seq`; `Store#mintOpaqueId` checks uniqueness against LIVE rows only, and a purge deletes those rows. A single-bundle purge does the same for its `PROJ` id. — owner RECORD.
order: THIRD, above M0-78. A correction to JUST-LANDED work, which outranks new work — and the failure is SILENT: a citation keeps resolving and answers the WRONG object, which outranks the instruments below it, blind rather than wrong. 1 in 10,000 per draw per prior id of that prefix and year: rare, not improbable (SCHEDULER #2, 2026-09-19)
milestone: M8
interface: I5 — one IC; the minter gains a table it consults.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7's minted-id rules, with the `op=purge` comment that is the precedent extended — *"allocid must never reissue an identifier that has already existed"* — and §7's legacy-residue bullet: **citations must keep resolving.**
depends-on: none. REC-151 (`8e14effe`) and REC-141 (`11aa7b13`) are on `origin/main`; this corrects the minter they landed.
scope: the row names the whole fix — a purge-exempt `minted_ids` table beside `seq`, written in the MINTER'S CALLER'S transaction, exempt from `purge` on `seq`'s reasoning, listed in `hygiene.test.mjs`' exemptions; and `#mintOpaqueId`'s `taken` asks it as well as the live rows. New tables go before the `host_governor` block.
accepts-when: an id minted, purged, then redrawn under a FORCED collision is refused by the ledger rather than reissued; `purge`'s own proof still passes with the table exempt. How a liar passes it: exempting the table without the minter reading it, so the arm FORCES a collision rather than trusting the write. NEGATIVE CONTROL: drop the ledger from `taken`, and that arm fails by name.
added: 2026-09-19 · SCHEDULER #2 (at REC-151's close, which made its `D-` id citable; keeps that id).

### D-355 · queued — **TWO CONTROL DRIVERS ARE RED ON A GREEN `main`, AND ONE LEAKS A 4 MB PEN ON EVERY NON-ZERO EXIT.** `civicos-ui/test/refusal-partition.control.mjs` exits 1 with 2 of 18 sub-checks not as declared and leaves `.rec79-control-pristine/` behind; `bio-plane/test/provenance-floor.control.mjs` exits 1 at 55 of 58. Folded from DEBT.md by LED-7, keeping its id. — owner M0.
order: FIRST: the FOURTH MEMBER of the instrument cluster (M0-78, D-414, D-433) — controls that are not evidence — and that cluster is IN FLIGHT: CONDUCT #8 spawned the other three and rightly excluded this row, no SCHEDULER being live to place it — now discharged (SCHEDULER #3, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) — a control is evidence only when it FAILS at a named assertion.
depends-on: none. **Take it AFTER M0-78 lands:** M0-78's second half widens the census so an arm that fails to arm is REPORTED, and a driver red on a green `main` is the same class.
scope: three acts, stated whole in the archived row (`node tools/ledger.mjs find D-355`): ATTRIBUTE each red arm to a behaviour move or a suite growth, dated AT THE SITE (the D-343 precedent), never exempt; make the pen's removal UNCONDITIONAL on exit (UI-59's driver is the precedent); teach the census `refselectivity`.s `arms: ?` shape or re-spell the driver, and SAY WHICH.
accepts-when: both drivers exit 0 with every sub-check as declared, each attribution dated at its site; the pen is absent after a FORCED non-zero exit. How a liar passes it: exempting an arm instead of attributing it, so the arm count is asserted too.
residue: **NOBODY HAS RUN EITHER DRIVER SINCE 2026-09-14** — a `.control.mjs` edits and commits the tree, so confirming the redness and the leak is a worker's act. `refusal-partition` HAS changed since (m0-36, `ed815c93`); `provenance-floor` is untouched. The worker.s FIRST act: establish which is still red.
added: 2026-09-19 · SCHEDULER #3 (LED-7; keeps its `D-` id).

### D-254 · queued — **REC-76's VERDICT READER EXISTS TWICE and only a drift pin makes that safe** — `civicos-ui/check-refusal-codes.mjs` has no exports and ends in a top-level `process.exit`, so `bio-plane/test/verdict-reader.mjs` hand-carries its six functions byte-identically. — owner VERIFY.
order: a correction to landed work, so above features; below D-270 and M0-78 because this duplicate is FALSIFIABLE today — `readerDrift()` extracts from both files and both suites assert it — a measured debt, not an unmeasured risk (SCHEDULER #2, 2026-09-19)
milestone: M0 — CORRECTED from the DEBT row's M8: both files it changes are TEST ESTATE, which is what M0 is, and that is why `VERIFICATION.md` is its authority.
interface: none
design: `docs/development/VERIFICATION.md`, the section "THE DEC-49 GUARD ASKS WHAT A REFUSAL IS IN PRINCIPLE" (REC-76, D-236), which governs `check-refusal-codes.mjs` and how it grades a verdict; read with D-240's `readerDrift()` pin.
depends-on: none. **Sequence with D-270:** its branch also edits `civicos-ui/check-refusal-codes.mjs`, so whichever lands second re-reads the first.
scope: the row names the whole fix — **one import** replacing the six function declarations in `check-refusal-codes.mjs`, after which `readerDrift()` becomes an import and `verdict-reader.mjs` is the single source. `origin/worktree-agent-a61e489de171ae6c5` (`9e24ef6e`) holds a built form 1572 commits behind main — read it, do not merge it blind.
accepts-when: `check-refusal-codes.mjs` imports the reader and still runs as a script, its exit status read UNPIPED; `readerDrift()`'s extraction stays COUNTED and FLOORED, so two empty extractions cannot agree for free; both suites green. How a liar passes it: deleting the drift pin with the duplicate, so the pin's own arm must survive. NEGATIVE CONTROL: D-240's arm (3) — one character inside `verdictKind` — still fails both suites NAMING the function.
added: 2026-09-19 · SCHEDULER #2 (LED-7 batch 2; found stranded by CONDUCT #7; keeps its `D-` id).

### M0-79 · queued — **FOUR DEC-49 FLOORS ARE SLACK AND THE GUARD PRINTS IT WITHOUT FAILING** — `civicos-ui/check-refusal-codes.mjs` reads `outcomeReturns` 126 against a floor of 98 and says *"corpus GREW by 28"* on a GREEN run; `vocabularies` 22 vs 11, `vocabularyTerms` 110 vs 64, `untranslated` 297 vs 270. A floor with slack is the floor not being a ratchet — and this one announces its slack and passes. — owner M0.
order: THIRD on this file, after D-433 (running) and D-254 — whichever lands last re-reads the others. It is the INSTRUMENT CLUSTER's doctrine on the floor side: a check that reports where it should gate cannot fail, which CLAUDE.md §2 grades worse than a missing feature (SCHEDULER #3, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with the FLOOR table.s header — *"slack in a floor is not harmless: it is the floor not being a ratchet."*
depends-on: none. **Sequence after D-254** (same file).
scope: **FAIL on slack beyond a stated bound, rather than print it.** The file already computes every measured/floor pair, so the arm is a comparison it is one line from making. The bound is a design call the worker states AT THE SITE: zero for figures a landing is expected to move in the same turn, non-zero only where the header already argues it (`bodyLines` sits deliberately far below its measurement — do not gate that one without saying why).
accepts-when: with any one floor left stale by a landing, the guard EXITS NON-ZERO naming that figure, its floor and its measured value; a landing that moves a floor in the same turn stays green. How a liar passes it: gating only the figures currently equal — so the arm asserts the FULL set of floor keys is covered or explicitly exempted.
NEGATIVE CONTROL: drop one floor by one and the guard fails BY NAME; today it prints and passes.
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's item 2, RE-MEASURED — its own figures no longer reproduce, four others do; see MEASUREMENTS.md).

### D-339 · queued — **`CAPTURE-SCALING.md` §Job one AND THE PLANE STATE OPPOSITE REUSE RULES, AND THE DOCUMENT READS AS THE AUTHORITY** — the design gates reuse on `stable_since` older than the window; the built `reuseDecision` gates on RECENCY OF FETCH (24 h), because the stability gate measured live as reusing nothing at all. — owner CAPTURE.
order: after D-254, with the corrections to landed work and above the features: a builder designing against §Job one designs against a rule THE PLANE REFUSED, which is the design claiming more than it can support — CLAUDE.md §2's class, pointed at a builder rather than a member. Cheap too: prose only (SCHEDULER #2, 2026-09-19)
milestone: M7
interface: none — prose in a design document; no code moves
design: `docs/architecture/CAPTURE-SCALING.md` §Job one, which is the text being corrected, read against `reuseDecision` in the plane, which is the authority the correction adopts.
depends-on: none. The built rule is already right and measured; nothing is being decided here.
scope: fold the RECENCY rule and its live measurement into §Job one so the document states what the plane does, and mark the two constants (24 h, `minDocuments: 2`) as **CHOSEN, not measured**, beside the two open questions that still ask for them — the row's own words. The front matter moves in the same commit if the section's stated completeness changes (`CORPUS-STANDARD.md`).
accepts-when: §Job one describes the recency gate and carries the live measurement that refused the stability gate; both constants are labelled CHOSEN; no code changes in the same commit. How a liar passes it: deleting the stale rule instead of correcting it, losing why it was refused — so the superseded rule stays with its dated reason. NEGATIVE CONTROL: none applies; this is prose, and `corpuscheck` is its arm.
added: 2026-09-19 · SCHEDULER #2 (LED-7 batch 9; keeps its `D-` id).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | DS-1 — **its blocker is now DISCHARGED** (DS-1 done above). **UNDETERMINED, and stated rather than rounded off:** DIST #2 said plainly it did NOT verify DS-3, and `BIO_Distribution_v0_1.md` §8 makes no satisfied-claim for it either — so nobody has looked. Not absence of the work, absence of a reader. DIST's to take up |
| FLEET | FL-6 | the Claude-account cascade at runtime | **DS-3** |
