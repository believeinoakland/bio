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

**2026-09-21 · BOB #20 · `tools/owed.mjs` KEEPS A ROW ON A LANE'S LIST AFTER THE LANE HANDED IT BACK. Four of the seven rows it lists as owed by BOB say in their own disposition that nothing on them falls to BOB. Owner BOB (its instrument). FULL profile. Intended place: beside BOB #19's `retirable.mjs` row (one lane's instruments, one gate).**
Measured 2026-09-21 ~15:45Z: `node tools/owed.mjs BOB` lists D-80, D-126, D-134, D-148, D-149, D-195 and D-353. D-80,
D-126, D-134 and D-195 each carry a LATER sentence, *"Nothing on this row falls to BOB"* (D-134: *"… to the BOB lane"*).
**Cause, at the code:** `owedFor` sets `owned = owner.test(r.disposition)`, so one *ROUTED TO BOB* anywhere in the cell
attributes the row forever, and a disposition is append-only history. D-134 already names this bug and says it should
stop. It did not. **FIX NAMED:** add a release pattern per lane, `(?i:nothing on this row falls to (?:the\s+)?)<LANE>\b`,
and let the LAST of routing and release govern: `owned` holds when the last owner match comes after the last release
match, so a row routed back later is owed again. Apply the same rule to the blocked-row `rest`. Add a suite section
covering three cases: routed then released is not owed; released then re-routed is owed; a release naming another lane
releases nothing. It asserts a FOUND item in the same run. Add control arm A10, which restores `owned =
owner.test(...)` and must fail that section by name. **accepts-when:** on the ledger at landing, `owed.mjs BOB` lists
D-148, D-149 and D-353 and none of the four released rows, and `owed.mjs ZZZNOTALANE` is unchanged. **depends-on:**
none. **design:** the tool's header, *"the owner phrases are the ones that assign rather than merely mention"*. A release
is the inverse assignment, and the later one supersedes.

**2026-09-21 · BOB #20 · REC-155 IS DESIGNED: `BIO_Membership_Architecture_v2.md` §4.10 rules all seven session routes. It builds as TWO landings, and the second needs a NEW row whose id SCHEDULER mints. Owner RECORD. Intended place: REC-155 where it stands, the new row directly after it.**
REC-155's row still reads *"design: MISSING — routed to BOB"*. Its design is now §4.10: BOB #19 ruled it, and BOB #20
landed it after re-reading every citation at the code. **LANDING 1 is REC-155 itself.** `provenancechain`,
`provenanceroute`, `calibrate`, `calibrationsubject` and `calibrationsignal` join BOTH `SESSION_OPS` sets, each with an
arm DRIVEN through the plane from a signed-in session. `livefire` and `reproject` join `UNATTENDED_BY_DECISION`, each
with the citation §4.10 quotes. The header comment that calls the seven UNDETERMINED is corrected in the same commit. No
class list moves, so nobody loses reach, and I3 gains a MINOR IC. **LANDING 2 is a new row:** the provenance pair's
BEARER WRITE is refused BY NAME, on the D-421/D-136 pattern. That covers `provenancechain`'s `apply=1` arm (its REPORT
arm stays open to every class) and `provenanceroute` whole. It comes with a new C-number, REC-65's known-open pin in
`identity-claims.test.mjs` corrected with a comment saying why, and a MAJOR IC on I3. **depends-on:** landing 2 waits
for landing 1 to be DRIVEN, so D-200's chain-absent population keeps a route to repair. **accepts-when (1):** each of the
five answers a member session and an administrator session with the op's own result, and the two unattended ops answer
every session `MACHINE_CREDENTIAL_REQUIRED` with `recorded` citing §4.10's artifact. **(2):** a bearer `apply=1` and a
bearer `provenanceroute` are refused by name; a session's succeed, and its author is the session's member, never
`token:<class>`. **How a liar passes it:** an arm that calls the store directly. The session gate lives in `index.mjs`,
so only a request through the plane reaches it.

**2026-09-21 · BOB #19 · SIX ROWS THAT WERE "WAITING ON BOB" ARE ANSWERED, AND FOUR OF THEM HAD ALREADY BEEN ANSWERED BY THEIR OWN DESIGNS. Each is now either a BUILD row to place or a stated deferral. Every disposition is written ON ITS ROW, dated, with the evidence at the code. Mint ids for new rows as you place them.**
- **D-195 → one UI row: THE ACCEPT CEREMONY SHOWS SHARED ORIGIN.** The plane half is BUILT (`Store#independenceOf`; the
  C-27.11 write gate; `op=versionstrength`'s `independence`). `civicos-ui/app.html` neither calls that op nor reads the
  field, so a member affirms "separately sufficient" against nothing. **design:** `INVESTIGATIVE-SESSION.md` §12 (b)
  and §14b.5. **accepts-when:** a fixture whose two parts share a capture shows that shared origin at the ceremony
  BEFORE the affirmation, and a NEGATIVE CONTROL hides the field and fails by name. Owner UI.
- **D-52 → one RECORD row: THE `export-performed` GENERATOR, in-app.** The channel is the queue, which is built, and
  the kind is already catalogued (`queuestate.mjs`). A new `export_log` row raises the FINDING to every administrator,
  with its `basis` naming that row. **design:** Membership v2 §8.1 with `NOTIFICATIONS.md` §The item contract. Under
  the catalogue's own rule it is the first generator to take an `N-<n>`. The `N` namespace is NOT among the 19 that
  `mintid` registers, so registering it is part of this row. Email transport stays Bob's (D-98) and blocks nothing here.
- **D-126 → one row: THE `per-item` WEIGHT** (`NOTIFICATIONS.md` §Applying a handler to a selection). Each item succeeds
  or is RETAINED WITH ITS REASON. UI-55's ARM 4d is the alarm that flips when an act accepts a set. Owner RECORD (the
  affordance and the acts), then UI. The 26 unbuilt generators stay under their own rows.
- **REC-135's question → one RECORD row: `ALREADY_A_CASE_MEMBER` ASKS FOR A PROJECT** (`INVESTIGATIVE-SESSION.md` §7.1
  item 9, written this commit). A new edition is warranted when the publishing project's latest conclusion is not the
  one the pinned edition recorded, whether or not `bundle_sha` moved. `op=reopen` does not change. **accepts-when:**
  REC-135's own probe path (conclude, publish, withdraw, conclude on another claim, publish) reaches a second edition,
  and publishing unchanged refuses as before.
- **D-80 → DEFERRED, nothing to place.** Its subject, the aspiration as an object, is ABSENT (`status.mjs 8.goals`).
  The specification of contact becomes a required clause of 8.goals' design act.
- **REC-155's seven routes → RULED in `BIO_Membership_Architecture_v2.md` §4.10**, landing after D-158 (which touches
  that file) so the two do not collide. It yields two landings: session reach for five ops plus `UNATTENDED_BY_DECISION`
  entries for two, then the bearer-write fence on the provenance pair. The rows follow in that entry.
**STILL WITH BOB, unchanged:** D-148 and D-149, with provisionals stated on both.

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

### REC-156 · queued — **`op=memberadd` STILL LETS A PROPOSER RECORD AN ENDORSEMENT IN ANOTHER ADMINISTRATOR'S NAME.** Its `by` is not server-stamped — the stamp in `bio-plane/src/index.mjs` covers `PROJECT_ACTIONS`, `GOVERNANCE_ACTIONS` and two project ops — and `Store#memberAdd` writes an `admin_votes` ('add') row from it when an addition needs consensus. D-136 closed this class for the three ops BOB #17 ruled, and only those. — owner RECORD.
order: FIRST, and seated ABOVE D-432 when it enters the cache (refill appends): D-136's class and rank — *"A forgeable governance vote outranks the hole below it"* — and a correction to just-landed work (`08a2e4d0`), verified at the code (SCHEDULER #4, 2026-09-21; CONDUCT #8's DELEGATION 2026-09-20 item 1)
milestone: M8
interface: I3 — a server-stamped `by` on one more op; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.7 — an addition beyond the second administrator needs the consensus of all existing ones; the section D-136 enacted.
depends-on: none. D-136 landed at `08a2e4d0`.
scope: add `op === "memberadd"` to the `by` stamp's condition and relay the stamped `by`; correct each suite that sends `by` in that op's body, reason at the site. **`adminvote.test.mjs`' `memberaddStamped` arm pins this boundary and FAILS THE DAY IT CLOSES** — correct it with a dated reason, never exempt it. Correct the `GOVERNANCE_ACTIONS` comment's *"NOT memberadd/memberset"* too (`memberSet` takes no `by`).
accepts-when: a signed-in administrator's `memberadd` records the endorsement as THEM; a body `by` naming another administrator is overwritten, asserted by a drive that sends one; construct 1's *"NOT closed: op=memberadd's by"* clause leaves `construct-status.json`. How a liar passes it: stamping at the plane while the store still honours a body `by`. NEGATIVE CONTROL: drop the disjunct, and the forged-`by` arm fails by name.
added: 2026-09-21 · SCHEDULER #4 (`node tools/mintid.mjs REC`).

### D-436 · queued — **THE PLANE STAMPS A LITERAL PRODUCING GROUP, `believe-in-oakland`, SO A SOVEREIGN GROUP'S RECORD NAMES THE WRONG PRODUCER IN ITS OWN SIGNED BYTES.** `store.mjs` defaults a bundle's `group` to that literal wherever frontmatter carries none (18 fallbacks, 2 trimmed-argument defaults, 1 in `index.mjs`), and three sites stamp it UNCONDITIONALLY: `testify`'s `bundle.md` frontmatter, its promote `meta`, and project creation. The plane holds no group identity at all; the installer already knows the slug, which is the worker name. — owner RECORD, with DIST.
order: SECOND, after REC-156 and AHEAD of any release a new group installs (BOB #19, 2026-09-21): signed bytes cannot be corrected once published, so on a newly installed instance this falsehood becomes permanent (SCHEDULER #4, 2026-09-21)
milestone: M7
interface: I3 and I5 — the durable group value and its first-bootstrap write; the integrator mints and classifies the IC. DIST passes the slug the installer already holds.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §3.1 (the core field `group`: the producing group's slug, which travels with the bundle), with the design call made in D-436's own row (`node tools/ledger.mjs find D-436`).
depends-on: none.
scope: the slug becomes ONE value in the Durable Object's durable state, written once at the instance's first bootstrap from the slug the installer holds; every default and every stamp reads it; a bundle's `group` is never a literal. **Never a deploy-time var:** it appears in signed bytes, so a redeploy must not be able to change it silently.
accepts-when: an install under a second slug writes no `believe-in-oakland` into any bundle it writes. How a liar passes it: a value re-read from a deploy var, so the arm changes the var and asserts the value did not move. NEGATIVE CONTROL: restore one literal, and the arm fails by name.
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit; keeps its `D-` id).

### D-432 · running — **SPAWNED 2026-09-21 by CONDUCT #9. NOT LANDED, CHECKED BY CONTENT at spawn: `minted_ids` occurs in ZERO files under `bio-plane/src` or `bio-plane/test` on `origin/main` @ `36eaf651`. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **AN OPAQUE ID CAN BE REISSUED ACROSS A WHOLE-STORE PURGE, so a citation of the purged object silently resolves to a NEW one.** `allocId`'s counter never reissued, because `purge` keeps `seq`; `Store#mintOpaqueId` checks uniqueness against LIVE rows only, and a purge deletes those rows. A single-bundle purge does the same for its `PROJ` id. — owner RECORD.
order: THIRD, above M0-78. A correction to JUST-LANDED work, which outranks new work — and the failure is SILENT: a citation keeps resolving and answers the WRONG object, which outranks the instruments below it, blind rather than wrong. 1 in 10,000 per draw per prior id of that prefix and year: rare, not improbable (SCHEDULER #2, 2026-09-19)
milestone: M8
interface: I5 — one IC; the minter gains a table it consults.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7's minted-id rules, with the `op=purge` comment that is the precedent extended — *"allocid must never reissue an identifier that has already existed"* — and §7's legacy-residue bullet: **citations must keep resolving.**
depends-on: none. REC-151 (`8e14effe`) and REC-141 (`11aa7b13`) are on `origin/main`; this corrects the minter they landed.
scope: the row names the whole fix — a purge-exempt `minted_ids` table beside `seq`, written in the MINTER'S CALLER'S transaction, exempt from `purge` on `seq`'s reasoning, listed in `hygiene.test.mjs`' exemptions; and `#mintOpaqueId`'s `taken` asks it as well as the live rows. New tables go before the `host_governor` block.
accepts-when: an id minted, purged, then redrawn under a FORCED collision is refused by the ledger rather than reissued; `purge`'s own proof still passes with the table exempt. How a liar passes it: exempting the table without the minter reading it, so the arm FORCES a collision rather than trusting the write. NEGATIVE CONTROL: drop the ledger from `taken`, and that arm fails by name.
added: 2026-09-19 · SCHEDULER #2 (at REC-151's close, which made its `D-` id citable; keeps that id).

### D-355 · running — **SPAWNED 2026-09-21 by CONDUCT #9. NOT LANDED, CHECKED BY CONTENT at spawn: the pen `.rec79-control-pristine` is still named at `civicos-ui/test/refusal-partition.control.mjs:45`; which driver is still red is the worker's FIRST act, as the residue line says, and M0-78 (the census widening this row waits on) LANDED at `08a2e4d0`. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **TWO CONTROL DRIVERS ARE RED ON A GREEN `main`, AND ONE LEAKS A 4 MB PEN ON EVERY NON-ZERO EXIT.** `civicos-ui/test/refusal-partition.control.mjs` exits 1 with 2 of 18 sub-checks not as declared and leaves `.rec79-control-pristine/` behind; `bio-plane/test/provenance-floor.control.mjs` exits 1 at 55 of 58. Folded from DEBT.md by LED-7, keeping its id. — owner M0.
order: FIRST: the FOURTH MEMBER of the instrument cluster (M0-78, D-414, D-433) — controls that are not evidence — and that cluster is IN FLIGHT: CONDUCT #8 spawned the other three and rightly excluded this row, no SCHEDULER being live to place it — now discharged (SCHEDULER #3, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) — a control is evidence only when it FAILS at a named assertion.
depends-on: none. **Take it AFTER M0-78 lands:** M0-78's second half widens the census so an arm that fails to arm is REPORTED, and a driver red on a green `main` is the same class.
scope: three acts, stated whole in the archived row (`node tools/ledger.mjs find D-355`): ATTRIBUTE each red arm to a behaviour move or a suite growth, dated AT THE SITE (the D-343 precedent), never exempt; make the pen's removal UNCONDITIONAL on exit (UI-59's driver is the precedent); teach the census `refselectivity`.s `arms: ?` shape or re-spell the driver, and SAY WHICH.
accepts-when: both drivers exit 0 with every sub-check as declared, each attribution dated at its site; the pen is absent after a FORCED non-zero exit. How a liar passes it: exempting an arm instead of attributing it, so the arm count is asserted too.
residue: **NOBODY HAS RUN EITHER DRIVER SINCE 2026-09-14** — a `.control.mjs` edits and commits the tree, so confirming the redness and the leak is a worker's act. `refusal-partition` HAS changed since (m0-36, `ed815c93`); `provenance-floor` is untouched. The worker.s FIRST act: establish which is still red.
added: 2026-09-19 · SCHEDULER #3 (LED-7; keeps its `D-` id).

### D-254 · running — **SPAWNED 2026-09-21 by CONDUCT #9. NOT LANDED, CHECKED BY CONTENT at spawn: `civicos-ui/check-refusal-codes.mjs` imports `verdict-reader` ZERO times on `origin/main` @ `36eaf651`. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **REC-76's VERDICT READER EXISTS TWICE and only a drift pin makes that safe** — `civicos-ui/check-refusal-codes.mjs` has no exports and ends in a top-level `process.exit`, so `bio-plane/test/verdict-reader.mjs` hand-carries its six functions byte-identically. — owner VERIFY.
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

### D-339 · running — **SPAWNED 2026-09-21 by CONDUCT #9. NOT LANDED, CHECKED BY CONTENT at spawn: `CAPTURE-SCALING.md` names neither `CHOSEN` nor a recency rule on `origin/main` @ `36eaf651` (zero hits). Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **`CAPTURE-SCALING.md` §Job one AND THE PLANE STATE OPPOSITE REUSE RULES, AND THE DOCUMENT READS AS THE AUTHORITY** — the design gates reuse on `stable_since` older than the window; the built `reuseDecision` gates on RECENCY OF FETCH (24 h), because the stability gate measured live as reusing nothing at all. — owner CAPTURE.
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
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist)**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
