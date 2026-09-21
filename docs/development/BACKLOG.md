# The backlog — everything still to do, in order

The middle file of the work pipeline (`docs/development/WORK-PIPELINE.md` §1–§2). `QUEUE.md` is the cache of the next
few items; this file holds every OTHER open item, in the order it will be processed — the top row is next.
What is done lives in the archive (`docs/archive/ledgers/QUEUE-closed*.md`).

- **Rows here use the queue's grammar** — a level-3 heading of an id, a middle dot and a state, then the row's fields
  (WORK-PIPELINE §1). A `blocked` row stays where the order put it, with what unblocks it.
- **Rows leave only by tool.** `node tools/ledger.mjs refill` moves the next runnable rows (state `queued`, every
  `depends-on` met) from the top of this file into the cache until the cache holds 8, deleting them here in the same
  act; a closed row leaves by `node tools/ledger.mjs archive <ID>`. Both refuse any move that does not conserve the id
  multiset of cache, backlog and archive, checked on the plan and again on what is read back from disk.
- **The order is SCHEDULER's** (`kickoffs/SCHEDULER.md`); new work is inserted at its place in the order.
- **Budget:** 150 KiB for the file, 2 KiB for a row. `node tools/ledger.mjs invariants` prints the five pipeline
  invariants; `node tools/plancheck.mjs` enforces them.
- **Find any id** — here, in the cache or in the archive — with `node tools/ledger.mjs find <ID>`.

Created EMPTY on 2026-09-18 by LED-6's tool half. The rows arrive with the migration (WORK-PIPELINE §5 steps 2–4),
performed by hand by the lane that owns the plan.

## Rows

### D-434 · queued — **A PUBLISHED RECIPE REFUSES THE MEMBER AT ITS OWN LAST STEP.** `app.html`.s `RECIPES[capture-a-document-and-ground-a-question-on-it]`, ends on `op=inquiryground` — which authors the DEC-32 PARTITION over legs that ALREADY EXIST and refuses `NO_BASIS` when there are none. On a fresh capture the member is REFUSED; on a question with legs it regroups them and attaches the document to nothing. The op for this act is `op=cite`. **PART 1 ONLY.** — owner UI.
order: FIRST. The record telling a member to do what the plane refuses is the record claiming more than it can support, which CLAUDE.md §2 grades above every feature — and it is PUBLISHED, so it is wrong in the member.s hands. One edit plus its arm (SCHEDULER #3, 2026-09-20)
milestone: M8
interface: none — part 1 changes no interface.
design: `docs/development/INVESTIGATIVE-SESSION.md` §0 · Vocabulary, which ALREADY BANS this: *"GROUND PARTITION … is **never a surface word**"* — DEC-32.s elicitation clause 1 bans it from every member-facing surface. The recipe breaks a ban a governed document already states: enforcement, not a new rule.
depends-on: none.
scope: **PART 1 ONLY; THE ROW REFUSES TO GROW.** Correct the step and its `why` to `op=cite`, or split into cite-then-ground if the recipe means both — plus one arm that DRIVES it end to end, since its id appears nowhere outside `app.html`. **PART 2 IS NOT PLACED:** no arm of `surface-registry.test.mjs` asks whether a step.s op can perform its act, and BOB ruled it must be SIZED first — inventing a model of every op to judge a `why` string is the citation-invented-to-pass-a-check failure.
accepts-when: the recipe is driven end to end against the plane and COMPLETES. How a liar passes it: editing the `why` to match the wrong op — so the arm DRIVES it and asserts no refusal, instead of reading text.
NEGATIVE CONTROL: restore `op=inquiryground` and the drive arm fails by name at `NO_BASIS`.
added: 2026-09-20 · SCHEDULER #3 (BOB #18.s inbox entry, drained this commit).

### REC-157 · queued — **A CASE KEEPS ASSERTING A CLAIM ITS PROJECT WITHDREW, AND DEC-19's ONE ROUTE FORWARD — A NEW EDITION — IS REFUSED.** Since REC-135 (IC-166) a published case records the PROJECT's adopted claim; when the project withdraws and concludes again on another claim, `op=publish` still refuses `ALREADY_A_CASE_MEMBER`, whose pin is `#caseRelationOf(id).member` — the finding at its `bundle_sha`, which never moved. — owner RECORD.
order: SECOND, after D-434: a correction to just-landed work (REC-135, `84a66a30`) failing in the PUBLISHED record — the case says what its project no longer stands on and cannot be corrected forward, CLAUDE.md §2's class; below D-434 only because publishing runs through the operator (DEC-33) (SCHEDULER #5, 2026-09-21)
milestone: M10
interface: I3 — `op=publish` succeeds where it refused; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §7.1 item 9 (BOB #19, 2026-09-21), which applies items 4 and 7.
depends-on: none. REC-135 (item 4, `#caseConclusionFor`) and REC-136 (item 7, `op=withdrawconclusion`) are on `origin/main`.
scope: `ALREADY_A_CASE_MEMBER` compares the RELATIONSHIP, as `NOT_CONCLUDED` does: a new edition is warranted when the publishing project's latest conclusion is not the one the pinned edition recorded, whether or not `bundle_sha` moved. `op=reopen` does NOT change. A project that withdrew and has not concluded again still gets `NOT_CONCLUDED`, and its last edition stands (DEC-19).
accepts-when: REC-135's own probe path — conclude, publish, withdraw, conclude on another claim, publish — reaches a SECOND edition recording the new claim; publishing unchanged still refuses `ALREADY_A_CASE_MEMBER`. How a liar passes it: dropping the refusal, so the unchanged arm must still refuse. NEGATIVE CONTROL: pin on `bundle_sha` alone again, and the second-edition arm fails by name.
added: 2026-09-21 · SCHEDULER #5 (BOB #19's inbox entry, drained this commit; `node tools/mintid.mjs REC`).

### D-435 · queued — **`owed.mjs` CAN ATTRIBUTE BUT NEVER DISCHARGE, SO EVERY LANE'S WORKLIST IS MONOTONIC.** `owedFor()` tests `OWNER_RE(lane)` against a row.s DISPOSITION, excluding only `isClosedDebtRow`, so an OPEN row that once said *ROUTED TO BOB* owes forever — however emphatically a later dated sentence in the same cell says that lane.s part is done. `owed.mjs BOB` reads 7 and **exactly 1 is known false** (D-134). — owner BOB (its own instrument).
order: SECOND. Every lane plans from this number, including this one, and it can only grow — a worklist that cannot shrink quietly becomes a backlog of the past. Cheap, and the fix is named in the row rather than designed (SCHEDULER #3, 2026-09-20, BOB #18's inbox entry)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) — an instrument reports what it can see, and this one cannot see a discharge.
depends-on: none.
scope: a `DISCHARGE_RE` matching the form the corpus already writes twice and NOTHING ELSE — `nothing (on this row |here )?falls to (the )?<LANE>( lane)?` — as narrow as `RESIDUE_RE` was forced to be. **A row discharged for one lane still attributes to any OTHER lane its disposition names** — the predicate is per-lane, not per-row. **FULL GATE PROFILE** (`tools/` is not `docs/`): check disk first; BOB #18 declined to build it at raising for that reason rather than skip the gate.
accepts-when: a row carrying BOTH an owner phrase and a discharge is NOT attributed; one carrying only the owner phrase still is; D-134 leaves BOB's list and the count moves 7 → 6. Every lane's count re-measured BEFORE and AFTER, so the effect is a figure rather than a claim. How a liar passes it: widening the pattern until the count drops — so the over-strictness arm asserts an undischarged row still attributes.
NEGATIVE CONTROL: break the discharge in `owed-controls.mjs` and watch a NAMED assertion in `owed.test.mjs` fail.
added: 2026-09-20 · SCHEDULER #3 (BOB #18.s inbox entry, drained this commit).

### M0-83 · queued — **`tools/retirable.mjs` CAN PROTECT A STRANGER AND CALL A STANDING LANE'S LIVE HOLDER RETIRABLE.** Three defects, one judgement: (1) `laneOf` strips only a TRAILING `#N`, so `CONDUCT #8 (BIO) — integrator lane` is in no lane, its predecessor is elected newest, and the holder was judged RETIRABLE (BOB #19, 2026-09-21); (2) a `--self` FOUND in the input is accepted, though `list_sessions` excludes the caller (CONDUCT #8, 2026-09-20: `1 retirable … 7 judged`, correctly `8 … 14`); (3) the caller can never be the newest of its own lane. — owner BOB (its instrument).
order: directly before M0-81, as ONE row — *"one file, one suite, one gate"* (BOB #19, 2026-09-21): it inverts the standing-lane protection, and its count moves in the direction a reader takes as SAFE (SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the tool's header "WHAT IS NEVER AUTO-RETIRED" and `kickoffs/BOB.md` "Spawning and retiring lanes".
depends-on: none.
scope: (1) `laneOf` takes the word before `#<n>` wherever the number sits (`/^\s*([A-Za-z]+)\s*#\d+/`, else the title); (2) a `--self` present in the input is REFUSED with an UNKNOWN-SELF verdict; (3) the caller may declare its own title and then counts as its lane's newest. **FULL GATE PROFILE** (`tools/`): check disk first.
accepts-when: a suffixed title lands in its lane and its predecessor is not elected; a `--self` found in the input is refused by name; a declared caller is its lane's newest. How a liar passes it: fitting one title shape, so an arm feeds a suffixed and a trailing form. NEGATIVE CONTROL: restore the trailing-only regex, and the suffixed-title arm fails by name.
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry with CONDUCT #8's DELEGATION 2026-09-20, drained this commit).

### M0-81 · queued — **NOTHING CHECKS WHETHER A LANE IS ALREADY OCCUPIED BEFORE A CHIP IS FILED, AND IT COST A REAL MESSAGE.** On 2026-09-19 a second CONDUCT #8 was filed six minutes after the lane was taken; it held the name in the peer directory, and SCHEDULER #3.s three clustering instructions went to it rather than the live integrator, returning `success: true`. — owner M0.
order: THIRD. Cheap, mechanical, and the only one of tonight.s session defects that PREVENTS rather than describes: a duplicate lane costs a wrong delivery nobody is told about (SCHEDULER #3, 2026-09-20)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), enacting BOB #18.s ruling in `kickoffs/BOB.md` "Spawning and retiring lanes": a stood-down, duplicate or retired session RELEASES the lane name.
depends-on: none. `tools/retirable.mjs` is the precedent: the JUDGEMENT lives in the repo where a suite drives it, the ACT stays in the harness.
scope: the OCCUPANCY half only — before a chip is filed, read the session list and REFUSE if a live session already holds the lane (by `scheduledTaskId` or title). Put it in `tools/` as a pure function over a session listing, so a suite drives it. **MUST NOT TOUCH:** the `conduct-8` scheduled task.s definition lives OUTSIDE this repo and is the operator.s — named to them, never changed from here. **FULL GATE PROFILE** (`tools/` is not `docs/`): check disk first.
accepts-when: given a listing with a live session bound to a lane, the judgement REFUSES it and names the occupant; given the same listing with that session stood down, it admits. Driven from a FIXTURE listing, never the live harness. How a liar passes it: matching on title alone — so the arm feeds a session whose title differs and whose `scheduledTaskId` matches.
NEGATIVE CONTROL: drop the occupancy test and the duplicate-CONDUCT fixture is admitted, failing by name.
added: 2026-09-20 · SCHEDULER #3 (BOB #18's inbox entry, drained this commit).

### M0-84 · queued — **NOTHING NOTICES WHEN A RETIRED INSTANCE OF A LANE LANDS AFTER ITS SUCCESSOR.** BOB #17 landed `aa5cc98d` (00:48) after BOB #18 had landed `0ca2c216`, `8e4c30c3` and `fa58ce92`; nothing noticed for hours, and `kickoffs/BOB.md` rule 4 now carries the lesson as prose. — owner M0.
order: directly after M0-81, which PREVENTS what this DETECTS (BOB #19, 2026-09-21): pure git, about a second, and it would have told BOB #18 at its next push (SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), enacting `kickoffs/BOB.md` rules 4 and 12.
depends-on: none.
scope: a `plancheck` WARN over `git log origin/main --format='%h %cI %s'`: for each lane prefix `<lane> #N:`, a commit by instance N dated AFTER one by instance M > N is a POST-SUCCESSION LANDING, named with both commits. EXEMPT: a predecessor's commit touching only its own `-NEXT` file. **FULL GATE PROFILE** (`tools/`).
accepts-when: a fixture log with an older instance landing after a newer one WARNs naming both; the same log whose late commit touches only the `-NEXT` file does not. How a liar passes it: matching one lane's name, so the fixture carries two lanes. NEGATIVE CONTROL: drop the date comparison, and the late-landing arm fails by name.
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit).

### M0-85 · blocked — **THE HEARTBEAT MEASURES A STALE TREE.** `conduct-heartbeat` STEP 3 greps `QUEUE.md` in the MAIN CHECKOUT's working tree and STEP -1 runs `tools/retirable.mjs` there; `git fetch` never moves that tree and no session works in it (DEC-3), so on 2026-09-21 it sat at `aa5cc98d`, 34 commits behind `origin/main`. STEP 4b's idle-with-work alarm, which reaches Bob's phone, rests on those counts. — owner the OPERATOR (the task definition lives outside this repository); BOB #19 carries it.
order: with M0-81 (BOB #19, 2026-09-21); `blocked` because no worker can take it — the definition is Bob's to approve and is never changed from here (SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the heartbeat's own STEP 3 warning, *"A QUESTION ASKED ABOUT THE WRONG UNIT"*.
depends-on: Bob's approval of the definition edit (BOB #19 took it to him, 2026-09-21).
scope: STEP 3 reads `git show origin/main:docs/development/QUEUE.md`; STEP -1 fast-forwards the checkout first (`git merge --ff-only origin/main` — clean and held by nobody, so it cannot lose work).
accepts-when: a heartbeat run's `queued`/`running` counts equal those of `git show origin/main:docs/development/QUEUE.md` read at that run, and its sweep names the tip it judged.
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit).

### D-412 · queued — **THE ESTATE AUDITS EXPOSURE AND NOBODY AUDITS RESIDUE: a worktree that is registered, clean, merged and owned by no live session is correctly reported `0 EXPOSED` — and reclaimed by nothing.** `strandedwork.mjs` asks *does this work reach anybody* (loss); nothing asks *is this still needed* (cost), and `retirable.mjs` keys on SESSIONS, so a scratch checkout with no session belongs to no sweep. — owner M0.
order: with the session-hygiene instruments, after M0-84: disk is CONDUCT's binding constraint (M-80 and M-81 each measure ~286 MiB per retired tree) and this names the residue nothing reclaims; below M0-81 and M0-84, which prevent and detect a lane fault rather than a cost (SCHEDULER #5, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with D-398's three conditions asked of a TREE rather than a session.
depends-on: none. `tools/retirable.mjs` is the precedent: the JUDGEMENT in the repo where a suite drives it, the ACT in the harness.
scope: a residue predicate over `git worktree list` plus a session listing: a tree REGISTERED, CLEAN, MERGED and owned by no live session is RECLAIMABLE, reported with its size. **Do NOT fold it into `strandedwork`**: that arm warns about LOSS, and a cost signal mixed into a loss signal gets both tuned out. **FULL GATE PROFILE** (`tools/`).
accepts-when: a fixture tree registered, clean, merged and unowned is named RECLAIMABLE with its size; **one a live worker is using is NEVER named** — the over-strictness arm IS the item. How a liar passes it: ignoring ownership, so the live-owner fixture must not be named. NEGATIVE CONTROL: drop the ownership test, and the live-worker fixture is named, failing by name.
added: 2026-09-21 · SCHEDULER #5 (LED-7 batch 10; keeps its `D-` id).

### REC-154 · queued — **`kickoffs/RECORD.md` IS 36,709 B AGAINST THE 24,576 B READING BUDGET**, so the lane whose kickoff it is cannot read its own instructions whole — which is the one thing CLAUDE.md's reading budget exists to guarantee. It was already over at 32,259 B before REC-146 appended to it. — owner RECORD.
order: after D-339 with the corrections: it is not a defect in the product, but it breaks the READING BUDGET doctrine for the busiest build lane, and every RECORD worker pays it on every spawn. Cheap and mechanical (SCHEDULER #2, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` with CLAUDE.md §1's reading budget — *a file is either READ WHOLE or LOOKED UP, never half of each* — and `kickoffs/CONDUCT.md`'s own cut of 2026-09-19 as the worked precedent.
depends-on: none.
scope: cut it on CONDUCT.md's precedent — **archive the cut text VERBATIM** (nothing deleted), reduce the live file under 24,576 B, and add it to `CUT` in `tools/readbudget.mjs` so the warning clears honestly rather than by exemption. **THE TIMING CONSTRAINT IS WHY REC-146 DID NOT DO IT:** RECORD.md's own convention is append-never-rewrite while other RECORD workers are live, so this runs when no RECORD worker holds it — CONDUCT confirms that before spawning.
accepts-when: `node tools/readbudget.mjs` no longer warns on RECORD.md; the archived text is byte-identical to what left the live file; no RECORD worker was live during the cut. How a liar passes it: deleting rather than archiving, so the arm diffs the archive against the pre-cut file. NEGATIVE CONTROL: drop a paragraph instead of moving it, and the byte-identity check fails naming it.
added: 2026-09-19 · SCHEDULER #2 (routed by CONDUCT #7; `node tools/mintid.mjs REC`).

### CPDF-21 · queued — **`kickoffs/CONTENT-PDF.md` IS 25,863 B AGAINST THE 24,576 B READING BUDGET**, so the lane cannot read its own instructions whole. CPDF-18 (`e0d81cac`, 2026-09-18) took it over the line from 23,658 B; `readbudget` WARNs and does not fail, because the file is not in `CUT`. — owner CONTENT-PDF.
order: directly after REC-154, its class and its precedent: it breaks CLAUDE.md §1's reading budget for a build lane, every CONTENT-PDF worker pays it on every spawn, and it is cheap and mechanical (SCHEDULER #6, 2026-09-21; SCHEDULER #5's handoff)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) with CLAUDE.md §1's reading budget — *a file is either READ WHOLE or LOOKED UP, never half of each* — and REC-154 and `kickoffs/CONDUCT.md`'s cut of 2026-09-19 as precedents.
depends-on: none. **Same line as REC-154** (`CUT` in `tools/readbudget.mjs`): whichever lands second re-reads the first.
scope: as REC-154 — archive the cut text VERBATIM (nothing deleted), bring the live file under 24,576 B, and add it to `CUT` so the WARN clears honestly and a later overrun FAILS. Runs when no CONTENT-PDF worker holds the file; CONDUCT confirms that before spawning. **FULL GATE PROFILE** (`tools/`).
accepts-when: `node tools/readbudget.mjs` no longer warns on CONTENT-PDF.md and lists it in `CUT`; the archived text is byte-identical to what left the live file. How a liar passes it: deleting rather than archiving, so the arm diffs the archive against the pre-cut file. NEGATIVE CONTROL: drop a paragraph instead of moving it, and the byte-identity check fails naming it.
added: 2026-09-21 · SCHEDULER #6 (`node tools/mintid.mjs CPDF`).

### M0-82 · queued — **NARROWED TWICE ON 2026-09-21: WHAT IS LEFT IS THE OCCUPANCY RULE AT THE INTEGRATOR'S NO-BOB FALLBACK START.** The ATTENDED-start rule landed in `kickoffs/CONDUCT.md` "Starting your successor" (BOB #19, `89bfa0d1`). The ARCHIVE-THEN-CUT had landed before this row was placed: CONDUCT #7 at `7641d109` (2026-09-20 00:55Z) archived the kickoff verbatim to `docs/archive/CONDUCT-kickoff-2026-09-20.md`, which holds both "Integration mechanics" sections, and condensed them with a pointer; the premise came from a grep of the `-09-19` archive. `CONDUCT.md` is 24,492 B: 84 B of headroom. — owner CONDUCT.
order: beside REC-154, the reading-budget class, and after M0-81, which builds the occupancy judgement this rule points at (SCHEDULER #4, 2026-09-21, re-measured; placed by SCHEDULER #3, 2026-09-20)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) with CLAUDE.md §1's reading budget, enacting `kickoffs/BOB.md` "Spawning and retiring lanes" rules 1 and 3.
depends-on: none. Sequence after M0-81.
scope: when CONDUCT starts its successor itself because no BOB answers, it checks OCCUPANCY first — no live session bound to the lane by `scheduledTaskId` or title — and RETIRES a duplicate rather than renaming it. Paid for inside the 24,576 B budget by the file's owner; anything cut is archived VERBATIM.
accepts-when: `node tools/readbudget.mjs` reads CONDUCT.md under budget with 0 failing; the kickoff states the check at the fallback start and cites BOB.md; anything cut is byte-identical in the archive.
added: 2026-09-20 · SCHEDULER #3 (BOB #18's inbox entry); narrowed 2026-09-21 by BOB #19 and SCHEDULER #4 (BOB #19's inbox entry, drained this commit).

### D-116 · queued — **NOTHING READS BACK WHAT BUILD THE PLANE'S DURABLE OBJECT, OR ANY FLEET MEMBER, ACTUALLY SERVES.** The installer verifies the plane's ROUTING ISOLATE only: `verifyUpdate` reads `op=bootstrap`, whose `version` is that isolate's `env.VERSION`, with the DO's `bootstrapState` spread after it and carrying no build; each member is uploaded with a version and never asked what it answers. — owner DIST.
order: after D-254, above features: a group can run a stale DO or member with nothing reporting it — CLAUDE.md §2's class, in the distribution path (SCHEDULER #2, 2026-09-19; NARROWED by FLEET #3 and verified at the code by SCHEDULER #4, 2026-09-21: `vf4-live-scratch.mjs` stores the isolate's value as `plane_durable_object`)
milestone: M7
interface: I3 — ONE additive IC: `op=bootstrap`'s reply gains the DO's own build under a DISTINCT field; the op's field pin moves in the same commit.
design: `docs/architecture/BIO_Distribution_v0_1.md` §8, the fleet's version authority, with CLAUDE.md §5: *a deploy verified is not a build serving*.
depends-on: none. DS-2 built the BUILD-side authority; this is the RUNTIME half.
scope: (1) the DO reports its own build under a field that is NEVER `version` — a later spread would REPLACE the isolate's reading — and `verifyUpdate` requires both and names the one that lags; VF-4's DO arm reads it. (2) each member is read back THROUGH THE BINDING after install and deploy (D-115's surviving requirement).
accepts-when: a DO or member whose build differs from the routing isolate's is NAMED, and the install or update does not report success. How a liar passes it: filling the DO field from the isolate's env, so two values agree for free. NEGATIVE CONTROL: copy `env.VERSION` into the DO field in the handler, and the arm fails by name.
added: 2026-09-19 · SCHEDULER #2 (LED-7 batch 3; keeps its `D-` id); narrowed 2026-09-21.

### CAP-13 · queued — **A REUSED PART SAYS IT WAS SEEN *"across N documents on this host"*, AND N COUNTS CAPTURES: every re-capture of a changed page inflates it, and one page captured twice meets the two-document reuse floor ALONE.** `siteAssets` and `siteChrome` (`store.mjs`) count `DISTINCT primary_sha`; two comments still state the stability gate 0.40.0 refused (`schema.mjs` above `site_assets`; `index.mjs` before `siteKnown`). — owner CAPTURE.
order: after D-116, above the ledger tooling: CLAUDE.md §2's class — a figure the record cannot support, in content-addressed manifests nothing corrects, on monitoring's normal path; below D-116 because it concerns FURNITURE and the fetch-honesty fields are right (SCHEDULER #6, 2026-09-21; D-339 worker's items 1–2, verified at the code)
milestone: M2
interface: none expected — no op exposes `siteassets` or `sitechrome`; `reused_seen_in_documents` keeps its name and type, only its VALUE becomes true (the integrator classifies).
design: `docs/development/CAPTURE-SCALING.md` §Job one, reuse condition 3 — *"an asset only one page references is that page's own"* — which also states this defect.
depends-on: none.
scope: count distinct primary ADDRESSES (`captured_locators.address_norm` where `capture_sha = primary_sha`) in both readers — a query, not a schema change. D-58 writes the locator unconditionally but in a swallowing `try`, and older captures may lack one: say what such a primary counts as, never drop it silently. Reword the two comments to recency of fetch, and the two that say a re-capture cannot inflate the count. **FULL GATE PROFILE**.
accepts-when: one page captured twice with changed bytes reads 1 document and is NOT reused; two pages sharing a stylesheet read 2 and are; the manifest's N equals the page count. How a liar passes it: a byte-identical re-capture, which never moved the count. NEGATIVE CONTROL: count `primary_sha` again, and the changed-bytes arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (`node tools/mintid.mjs CAP`).

### LED-8 · queued — **SIX REGISTERED ID COLLISIONS: `ledger.mjs find` ANSWERS TWO DIFFERENT ROWS FOR ONE ID.** D-121 and D-124 each name two unrelated OPEN rows; IC-30 two PROPOSED interface changes; M0-16 a duplicated heading. `mintid --audit` registers all six, 0 breaks; the lookup §1 rests on answers ambiguously. — owner M0.
order: SIXTH. AMBIGUITY STATED, not the record over-claiming: the tools REFUSE loudly rather than corrupt (`archive D-121 --dry-run` prints both dispositions and stops), while every row above is SILENTLY wrong. Loud beats silent, and blocking LED-7 on two rows of 211 does not outrank five silent ones (SCHEDULER #2 + BOB #17, 2026-09-19)
milestone: M0
interface: none
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7, the bullet "The legacy residue" — **rewriting cited ids is REFUSED: citations must keep resolving** — with CLAUDE.md §1.
depends-on: none.
scope: **DISAMBIGUATE. DO NOT RENUMBER AN ID THAT ANYTHING CITES** (BOB #17, 2026-09-19 — a ruling, not a preference). A ledger id is cited by commit messages, other rows' `depends-on`, kickoffs, `DECIDED.md` and the archive — and **a commit message cannot be rewritten.** D-124's first row reading "renumbered from a colliding D-122" makes renumbering look established; it is the dangerous answer. So: the register carries BOTH, `find` REPORTS the collision and shows both rather than guessing, and a new id is minted fresh. M0-16's duplicate is an empty-bodied merge artefact — DELETED, not renumbered. If renumbering looks unavoidable, it is BOB's call before it lands.
accepts-when: `find` returns BOTH rows for a collided id and SAYS it collided; `mintid --audit` still reads 0 breaks; every existing citation of the four still resolves. How a liar passes it: deleting a copy loses a defect — so the DEBT row count must not FALL, asserted. NEGATIVE CONTROL: plant a seventh collision, and the audit names it.
added: 2026-09-19 · SCHEDULER #2 (batch 4; found by CONDUCT #7; no-renumber ruling by BOB #17).

### LED-9 · queued — **A PIPELINE INVARIANT READS `status.mjs`, SO A DEPENDENT CANNOT BE SEQUENCED ABOVE UNBUILT SUBSTRATE.** P4 fails the plan when a cache row's `depends-on` is not MET — but that names other ROWS, so it answers *is the row it waits on earlier or done*, never *is the CONSTRUCT it rests on BUILT*. — owner M0 / SCHEDULER.
order: with LED-8, the ledger tooling: preventive, not a live defect — no row is mis-sequenced today, checked by hand. Earned by THREE catches in one day (D-60, D-115, D-116): a row read as done because the thing underneath it was (SCHEDULER #2 + BOB #17, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md`, the law this gate is an arm of, with `WORK-PIPELINE.md`'s P1–P5 which it extends. The rule is CLAUDE.md §2 — *"verified BUILT by `status.mjs`, not by a row saying so"* — **RULED by BOB #17 (`a08e137a`) to be that doctrine MECHANISED:** the arm does not JUDGE builtness, it READS the one authority on it.
depends-on: none.
scope: extend `ledger.mjs`' invariants so a row whose `depends-on` names a CONSTRUCT is checked against `status.mjs`, failing the plan when a dependent sits above unbuilt substrate. **THE BOUND GOES IN THE ARM'S OWN OUTPUT, not only here** (BOB #17): it judges only a row that NAMES a construct, so **a row naming its substrate in PROSE is invisible to it** — the bound `corpuscheck`'s `--authority` arm states about itself. A green arm that hides its bound is read as more than it is.
accepts-when: a row depending on a construct `status.mjs` reads ABSENT fails the plan NAMING both; one whose substrate is BUILT passes; **a row naming substrate only in prose is UNJUDGED, never passed**, with the unjudged count printed beside the verdict. How a liar passes it: judging only rows that name a construct and reporting 100%, which the unjudged count forbids. NEGATIVE CONTROL: point a row's `depends-on` at an absent construct, and the arm fails naming it.
added: 2026-09-19 · SCHEDULER #2 (D-404's fix, ruled by BOB #17).

### REC-155 · queued — **SEVEN VERBS WHOSE `OPS` ROW ADMITS A SESSION CLASS WERE REACHABLE BY NO SESSION, AND NOBODY HAD RULED WHY — NOW RULED (§4.10): FIVE GAIN SESSION REACH, TWO ARE UNATTENDED BY DECISION. LANDING 1 of 2.** The plane answers all seven `SESSION_ROUTE_NOT_RECORDED` today, and its header calls them *"UNDETERMINED rather than decided"* (`index.mjs`). — owner RECORD.
order: where it stood, below the ledger tooling, now with its design (BOB #20's entry): the plane is honest here — a determination was owed, not a defect shipping — and this landing refuses nobody (SCHEDULER #5, 2026-09-21; placed by SCHEDULER #3, 2026-09-19)
milestone: M8
interface: I3 — MINOR: sessions gain reach and no class list moves; the integrator mints the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10 (ruled by BOB #19, landed by BOB #20 at `d9cf3283`).
depends-on: none. **NOT D-136**, whose three ops §4.7 ruled and which is built.
scope: `provenancechain`, `provenanceroute`, `calibrate`, `calibrationsubject` and `calibrationsignal` join BOTH `SESSION_OPS` sets, each with an arm DRIVEN through the plane from a signed-in session; `livefire` and `reproject` join `UNATTENDED_BY_DECISION` with the citation §4.10 quotes; the UNDETERMINED header is corrected in the same commit. **REC-65's known-open pin is NOT moved here** — it moves in REC-158, with the fence.
accepts-when: each of the five answers a member session and an administrator session with the op's own result; the two unattended ops answer every session `MACHINE_CREDENTIAL_REQUIRED` with `recorded` citing §4.10's artifact. How a liar passes it: an arm that calls the store directly — the session gate lives in `index.mjs`. NEGATIVE CONTROL: drop one op from a `SESSION_OPS` set, and its arm fails by name.
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's item 1); designed 2026-09-21 by §4.10, BOB #20's entry drained by SCHEDULER #5.

### REC-158 · queued — **THE PROVENANCE PAIR'S BEARER WRITE IS STAMPED `token:<class>` — NOBODY'S NAME — ON WHAT §4.10 CALLS A NAMED MEMBER'S JUDGEMENT. LANDING 2 of REC-155: refuse it BY NAME**, on D-421's and D-136's pattern — `provenancechain`'s `apply=1` arm (its REPORT arm stays open to every class) and `provenanceroute` whole. — owner RECORD.
order: directly after REC-155, which it waits on (BOB #20's entry): this landing REFUSES a caller, so it follows the session route DRIVEN, keeping D-200's chain-absent population a route to repair (SCHEDULER #5, 2026-09-21)
milestone: M8
interface: I3 — MAJOR, breaking for bearer writers of the pair; the integrator mints the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10, the provenance pair's bullet, with D-421 (C-32.14/.15) and D-136 (C-32.17) as the pattern.
depends-on: REC-155 — DRIVEN, not merely landed.
scope: a new C-number refusing a bearer `apply=1` and a bearer `provenanceroute` by name; REC-65's known-open pin (`identity-claims.test.mjs` arm (e), which names `provenancechain` beside `proposedispose`) CORRECTED with a dated comment saying why, never exempted.
accepts-when: a bearer `apply=1` and a bearer `provenanceroute` are refused by name; a session's succeed and the author written is the session's member, never `token:<class>`; a bearer REPORT still answers. How a liar passes it: fencing the REPORT arm too, so an arm asserts it still succeeds. NEGATIVE CONTROL: drop the refusal, and the bearer-write arm fails by name.
added: 2026-09-21 · SCHEDULER #5 (BOB #20's inbox entry, drained this commit; `node tools/mintid.mjs REC`).

### UI-73 · queued — **ELEVEN MEMBER-FACING SITES STILL READ A REFUSAL'S RAW `detail` INSTEAD OF ITS CANNED TRANSLATION** — `teach()`, `queueReason`, `planeSaid`, the finder's per-subject errors, the release / attest / capture receipts, the proposal pre-flight, the forward picker, the leg pre-flight's `subj-how`, and `INTENT_VOCAB.words`. UI-72 landed the two renderers and `refusalWords(r)`; this is its named remainder. — owner UI.
order: a CORRECTION TO JUST-LANDED WORK, which outranks new work: UI-72 shipped the helper and eleven sites still bypass it, so a member meets machine vocabulary at the moment they are told no — the failure DEC-49 exists to close (SCHEDULER #3, 2026-09-19)
milestone: M8
interface: none — the helper exists; no code, wire shape or catalogue row moves.
design: DEC-49 (`node tools/decided.mjs "DEC-49"`) as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it — every condition has a named code and a canned translation. UI-72's own citation, unchanged.
depends-on: none. UI-72 landed at `02e7c537`.
scope: each site reads `refusalWords(r)` instead of `r.detail`. **IT IS NOT ONE EDIT AND THE ROW REFUSES TO BE TREATED AS ONE:** `teach()` is pinned by `civicos-ui/test/preauth-vocabulary.test.mjs`' DEC-49 SUBJECT arm, whose FIGURES MOVE when the gate's rendered sentence changes — so this row carries that arm's re-read and re-pin as its own work rather than leaving the battery to discover it.
accepts-when: all eleven take their words from the ONE helper, asserted as `refusal-translation-surface.test.mjs` already asserts the two renderers; the SUBJECT arm re-pinned to figures a green run printed, with the movement STATED. How a liar passes it: re-pinning the arm to whatever it now reads — so the re-pin names the old and new figures and why they moved.
NEGATIVE CONTROL: restore `r.detail` at one site, and that site's arm fails by name.
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's item 3, verified in UI-72's own CLAIMS.md block).

### M0-80 · queued — **FOUR REFUSAL CODES ARE PINNED GREEN BY ABSENCE RATHER THAN BY AGREEMENT** — the plane sends a canned `translation` for `KIND_NOT_PERSONAL` (`queue.test.mjs`), `NO_ACKNOWLEDGMENT` (`release-flow.test.mjs`), `NO_SUCH_SELECTION` (`act-dispose.test.mjs`) and `NOT_CAPABLE`, and each fixture OMITS the field, so the `detail` pin passes by not looking. Of 198 hand-written refusal fixtures in the UI estate only THIRTEEN carry a `translation` at all (M-72). — owner M0.
order: with the instrument cluster and NOT beside UI-73, though they were routed together. A fixture narrower than the wire is a check that cannot fail — M0-78's doctrine exactly — whereas UI-73 is a surface correction. CLAUDE.md §5: an equality that costs nothing to produce is not evidence (SCHEDULER #3, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) — a suite is evidence only where it can disagree with the thing it measures.
depends-on: none. Measured in `docs/development/MEASUREMENTS.md` M-72 (UI-72, 2026-09-19).
scope: carry the catalogue row's `translation` in each of the four fixtures and re-read the pin. **AND THE LARGER HALF, which is why this is an M0 row and not four edits:** 185 of 198 fixtures carry no `translation`, so the same blindness is available everywhere — report the count of fixtures whose refusal shape is NARROWER than the wire the plane sends, and floor it.
accepts-when: each of the four pins DISAGREES with the plane when the translation is wrong, proved by feeding a wrong one; the narrower-than-wire count is printed per suite and floored. How a liar passes it: fixing the four and leaving the census unbuilt, so the floor is asserted to exist.
NEGATIVE CONTROL: put a WRONG translation in one repaired fixture, and that suite fails by name — today it passes, because the field is absent.
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's routed item 4; `node tools/mintid.mjs M0`).

### M0-92 · queued — **`tools/rowdesign.mjs` PASSES A DESIGN POINTER TO A FILE THAT DOES NOT EXIST.** `citations()` drops a full `docs/…md` path outside the governed set, then its basename loop matches the file name INSIDE that same path and resolves it to the one governed copy, so a wrong directory reads as naming its design. D-339 cited `docs/architecture/CAPTURE-SCALING.md`, which has never existed, and `plancheck` counted it among "0 naming no design". — owner M0.
order: with the instrument cluster, after M0-80 and above M0-87: a check that PASSES where it should fail — CLAUDE.md §5's costs-nothing green — where M0-87 is a false WARN; latent today (0 dead paths across `QUEUE.md` and `BACKLOG.md`, measured 2026-09-21) (SCHEDULER #6, 2026-09-21; the D-339 worker's DELEGATION item 4)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the tool's own header: it cannot prove a pointer TRUE, and a pointer to a file that does not exist is the one case it can prove FALSE for free.
depends-on: none.
scope: a full `docs/…md` path resolving to no file on disk is reported as a DEAD POINTER (at least a note), and the basename loop takes only a bare name — never one inside a path, as the process-authority arm's `(?<![\w/])` already refuses. **FULL GATE PROFILE** (`tools/`).
accepts-when: a fixture row citing a wrong directory is reported dead by name; the right full path still passes; a bare unique basename still resolves. How a liar passes it: dropping the basename rescue altogether, so the bare-name arm must still pass. NEGATIVE CONTROL: let the basename loop match inside a path again, and the wrong-directory arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (`node tools/mintid.mjs M0`).

### M0-87 · queued — **`tools/rowsubstrate.mjs` SCORES A ROW WHOSE EVERY CITED ANCHOR IS UNRESOLVABLE AS UNCOVERED, so `plancheck` prints a false `substrate not evident`.** When `sectionText()` returns null the scope is set aside as UNRESOLVABLE, `covered` stays false with `probes: []`, and the row still joins the findings — zero symbols against zero text, reported as a gap. D-136 carried exactly that (§4.7 and §4.9 are bold paragraphs, not headings). Latent today: the four current notes each resolve their anchor. — owner M0 / VERIFY.
order: with the instrument cluster, after M0-80: an instrument claiming about what it cannot see, the class the cluster closed three of (CONDUCT #8's DELEGATION 2026-09-20 item 2); a WARN, and latent, so below the rows that hide a failure (SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the tool's own header: *"A MISS IS NOT PROOF IT IS ABSENT"*, and a row the question cannot be asked of is UNJUDGED, never scored.
depends-on: none.
scope: when every anchor for a cited document is unresolvable, fall back to document level or count the row UNJUDGED — never uncovered. The mechanism withdrawn from the ANCHOR arm leaked into the COVERAGE arm. **FULL GATE PROFILE** (`tools/`).
accepts-when: a fixture row whose only anchor is a bold paragraph is UNJUDGED or judged at document level, never a finding; a row whose resolved section lacks every symbol still is one. How a liar passes it: scoring the unresolvable row covered, so the arm asserts it is not a pass either. NEGATIVE CONTROL: restore skip-then-push, and the unresolvable arm fails by name.
added: 2026-09-21 · SCHEDULER #4 (`node tools/mintid.mjs M0`).

### M0-88 · queued — **`caseproduction.control.mjs` ARM (H) NOW DRIVES THE PARTICIPATION FENCE, NOT THE COMMIT IT DECLARES.** It forges the committed project to a literal nobody has joined, so C-56.1 refuses it at `op=caseratify` before anything commits; its original property — *the record commits an attribution no signature covers*, the dangerous case — goes untested. M0-78 corrected the arm's declaration and REPORTED the re-aim rather than taking it. — owner M0.
order: with the instrument cluster, after M0-80: a control proving less than it declares — a second defect in a control the cluster repaired (CONDUCT #8's DELEGATION 2026-09-20 item 3; SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) — a control is evidence only when it FAILS at a named assertion; read with M0-78's note at the arm.
depends-on: none.
scope: re-aim arm (H) at a forged project the actor HAS joined (`PROJ_OTHER`'s role), minted at run time — project ids are opaque (Membership v2 §7), so it cannot be a static literal — so the ceremony completes and §8's committed-from-bytes arm fails by name.
accepts-when: the arm reaches the commit; §8's arm fails BY NAME while the four named act-side refusal arms stay green; the control leaves the tree byte-identical. How a liar passes it: a joined project the fixture never ratifies with, so the arm asserts the ceremony completed.
added: 2026-09-21 · SCHEDULER #4 (`node tools/mintid.mjs M0`).

### M0-89 · queued — **`D384_STAYS` WAS MEASURED WHILE `*eachImage` WAS INVISIBLE, so the hand-admitted compensation for the walk's helper blind spot has never judged it.** D-414 made generator methods visible to the five walks (census 109 → 110) and left `eachImage` in the CENSUS but outside the amplification CLASS: it reads one image per bundle over an unbounded scan, through `this.readImage(...)`, which the walk cannot see. — owner M0.
order: with the instrument cluster, after M0-80: D-414's named residue (*"a row of its own and is reported rather than taken here"*, at the census in `derivation-bounds.test.mjs`); an undercount a ratchet cannot catch (CONDUCT #8's DELEGATION 2026-09-20 item 4; SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with D-384 (`node tools/ledger.mjs find D-384`) and D-414's note at the census.
depends-on: none. **Same file as M0-44** — one worker at a time.
scope: re-measure the `D384_STAYS` population with generators visible, and enrol or exclude `eachImage` with its reason; any move of the class figure is attributed, never nudged.
accepts-when: `eachImage` carries a verdict in `D384_STAYS` or `D384_LEAVES` with its reason; the class figure is taken from a printed run, its delta attributed. How a liar passes it: a verdict with no measurement, so the entry cites the body it judged. NEGATIVE CONTROL: remove the entry, and the admitted-set arm fails naming `eachImage`.
added: 2026-09-21 · SCHEDULER #4 (`node tools/mintid.mjs M0`).

### COFF-13 · queued — **NO FORMAT ENTRY EMITS A DECK LENGTH, so a deck whose TRAILING slides are unreadable is recorded shorter than it is — and the content row then REFUSES A TRUE CITATION of a real trailing slide as "past the deck".** D-359's named residue, rowed at its close rather than left in prose. — owner CONTENT-OFFICE.
order: below LED-8, above the features: it refuses something TRUE — a record defect, not a gap — but errs in the CONSERVATIVE direction and reaches only decks with unreadable trailing slides, so it ranks under the defects above it (SCHEDULER #2, 2026-09-19)
milestone: M9
interface: I2 — a producer change on the text shape, so an IC is minted and the integrator classifies it.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §15's structure-shape row and §16's persistence paragraph, which both state this residue by name and say closing it is a producer change on I2.
depends-on: none. COFF-11 (IC-100) and COFF-12 landed the producer and wire halves this completes.
scope: a deck entry emits its own LENGTH — the slides the DECK has, not the ones the reader could open — and the wire carries it onto the persisted reading beside the slide list. The slide map is already keyed on each slide's OWN number (COFF-12), so the length is the missing fact, not a re-keying. `.odp` states an honestly NULL length if the format cannot answer, as `.ods` does for its grid.
accepts-when: a deck whose LAST slide part is unreadable still admits a citation of that slide, and a citation past the real deck is still refused C-45.1 BY NAME with the figure in the refusal. How a liar passes it: emitting the READABLE slide count as the length, which is the defect — so the fixture's deck must have an unreadable TRAILING slide and the arm must assert the length exceeds the readable list. NEGATIVE CONTROL: emit the readable count instead, and the trailing-slide arm fails by name.
added: 2026-09-19 · SCHEDULER #2 (LED-7 batch 7, at D-359's close; `node tools/mintid.mjs COFF`).

### D-52 · queued — **A ROOT-OF-TRUST EXPORT NOTIFIES NO ADMINISTRATOR.** `export_log` records it and `op=exportlog` reads it, so an administrator who LOOKS finds it and one who never looks never learns. The channel exists — the queue is the in-app channel, built — and `bio-plane/src/queuestate.mjs` already catalogues the FINDING `export-performed`. No generator raises it. — owner RECORD.
order: security-class, first above the features: Membership v2 §8.1's promise that an export is never silent rests on this notification and only the looking half is built; below the silent defects because the export IS logged and §8.1 says so (SCHEDULER #5, 2026-09-21)
milestone: M7
interface: I3 — a queue item kind gains a producer; the integrator mints and classifies the IC.
design: `docs/development/NOTIFICATIONS.md` §The catalogue (the export entry, FINDING) and §The item contract, with `BIO_Membership_Architecture_v2.md` §8.1 as the requirement. **§8.1's "no notification channel anywhere" is SUPERSEDED by BOB #19's narrowing (the channel is the queue; only TRANSPORT is Bob's, D-98); its fold into §8.1 was asked of BOB on 2026-09-21 — read the landed §8.1 first.**
depends-on: none in code.
scope: a generator raising `export-performed` to EVERY administrator's queue when `export_log` gains a row, its `basis` naming that row, options from the producer. It is the first generator to take an `N-<n>`, so register `N` in `tools/mintid.mjs` (absent from `--list` on 2026-09-21) — **FULL GATE PROFILE**. Email is Bob's (D-98) and out of scope.
accepts-when: one export writes one item per administrator, each naming the `export_log` row, and a non-administrator gets none; `mintid N` mints. How a liar passes it: raising to the exporter alone, so the arm counts EVERY administrator. NEGATIVE CONTROL: drop the generator, and that arm fails by name.
added: 2026-09-21 · SCHEDULER #5 (BOB #19's inbox entry, drained this commit; keeps its `D-` id).

### UI-74 · queued — **THE ACCEPT CEREMONY IS NOT ON `main`, SO NO SURFACE LETS A MEMBER ACCEPT A MACHINE-PROPOSED READING.** The IS plan's UI-43 built it on `worktree-agent-a9e7e017d06799858` (`fd1e2aec`, 2026-08-09) and it was never integrated (D-397's third branch): `acceptCeremonyOpen`, `ACER_` and `versionaccept` occur 0 times in `origin/main:civicos-ui/app.html`, 3, 16 and 4 times on the branch (2026-09-21). — owner UI.
order: the first feature, after D-52: DEC-24's member half — the machine proposes, the member concludes — has no door, and the IS plan recorded it done at 43/43; below the corrections because the status authority claims no ceremony (SCHEDULER #5, 2026-09-21)
milestone: M9
interface: I3 consumer (`op=versionaccept`; `op=versionstrength`'s `independence`) — both built.
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 (a)–(b), with `docs/archive/IS-BUILD-PLAN.md`'s UI-43 row as the scope it was built to.
depends-on: none; both ops are built — CHECK AT THE CODE at spawn.
scope: UI-43's scope RE-DERIVED on current `main` — the branch is EVIDENCE, 1,836 commits behind, never merged blind: the four beats, the falsifier read back, independent sufficiency AFFIRMED per branch before a name lands, DEC-46's lens diff in the ceremony, REC-36's withholding — PLUS D-195's shared origin, which the branch never read (`independence` 0×): the plane derives it; the ceremony shows it BEFORE the affirmation, and never refuses.
accepts-when: an OR accept requires the per-branch affirmation; a fixture whose two parts share a capture shows that origin before it, and one with independent parts shows NONE; driven against the real plane. NEGATIVE CONTROLS: drop the affirmation, or hide the field, and each arm fails by name.
added: 2026-09-21 · SCHEDULER #5 (D-397's third branch and D-195, verified at the code; `node tools/mintid.mjs UI`).

### MK-6 · queued — **THE AUTHORED BUNDLE NAMES NO AUTHOR** (MK-3's replacement (i), `MEMBER-KNOWLEDGE-DESIGN.md` §4.1). Today `testify` writes the author's member id into `bundle.md`'s Session Log AND into `data/provenance.json` (`author`, `provenance_chain[].who`), and a ratified bundle's files are what the published bucket receives. Every file and manifest record an authored bundle can publish must name the author as `observer:<testimony id>`, which only the register resolves. — owner RECORD.
order: replaces MK-3 (superseded 2026-09-21), directly above MK-7 and MK-5, which rest on it; BOB #19: *"Build (i) regardless"* — no published byte moves, since MK-1's fence still stands (SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3 and I5 (the authored provenance document's shape); the builder states additive or breaking, and the integrator mints the IC.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4.1 (the bundle never names its author) and §8's row for replacement (i).
depends-on: MK-1 (built).
scope: as §4.1 — every file and manifest record an authored bundle can publish carries `observer:<testimony id>` in place of the member id, and the register alone resolves it. Existing authored bundles stay fenced.
accepts-when: a fixture case publishes an observation at `group` level and NO published part — no file, no manifest entry — contains the author's member id, handle or cover: a POPULATION arm over every published part, never a list of sites. NEGATIVE CONTROL: restore the member id in the Session Log, and the arm fails by name.
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit; `node tools/mintid.mjs MK`).

### MK-7 · queued — **THE ATTRIBUTION ACT, AND THEN THE LIFT OF MK-1's FENCE** (MK-3's replacement (ii), `MEMBER-KNOWLEDGE-DESIGN.md` §4.2–§4.6): an op the builder names, taken only by the observation's author, per (case edition, observation), on the draft; each edition's attribution written into the case document, derived from the act; ratification refused while any reached observation is unchosen, naming each; `name` refused for a member with no handle. **Then, as its own act, MK-1's fence (C-53.10–.12) is lifted, with a control arm per level.** Off-the-record stays a structural absence. — owner RECORD.
order: after MK-6, which it rests on, and above MK-5, which rests on it; replaces MK-3 (superseded 2026-09-21). Two points are provisionals carried to Bob, cheap to change until built: §4.4's narrow veto and §4.6's `name` = handle (SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3 — the builder names the op and, if a design names it first, registers it in `op-claims.mjs`' `PLANNED_OPS`.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4.2–§4.6 and §8's row for replacement (ii).
depends-on: MK-6; REC-126 (the review copy, built).
scope: as §4.2–§4.6 and §8. The lift is its own act, taken only once the projection honours every level.
accepts-when: through the ops, each level round-trips into the published projection exactly as chosen; nothing is prefilled; an unchosen reached observation refuses ratification BY NAME; `name` without a handle is refused; off-the-record publishes no identity by construction. NEGATIVE CONTROL: one arm per level — drop a level's handling and its arm fails by name.
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit; `node tools/mintid.mjs MK`).

### MK-5 · queued — **AN OPINION IS NOT EVIDENCE — a case element with attribution, refused as a basis leg.** — owner RECORD; surfaces are Program B's and are NOT rowed.
order: rests on MK-7's attribution act — re-pointed from MK-3, superseded 2026-09-21 (`MEMBER-KNOWLEDGE-DESIGN.md` §8) (SCHEDULER, first order audit, 2026-09-18; SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §6 (an opinion is not evidence)
depends-on: MK-7 (it carries MK-7's attribution; §8 names MK-3's replacement (ii))
scope: build §6; an opinion cited as a basis leg is refused by name (§7). **Read the design section at the artifact before building (§8's own condition).**
accepts-when: an opinion lands as a case element with its attribution and is refused as a leg, by name, through the ops; battery green by its COMPLETION LINE.
NEGATIVE CONTROL: recorded in the suite's own `NEGATIVE CONTROL:` line (**with the colon**) — the refusal removed → an opinion lands as a leg and the arm FAILS. **Liar:** an opinion stored as a low-grade leg — the design refuses it as a leg at all.
added: 2026-09-18 · CONDUCT #4 (from BOB #14's inbox; MEMBER-KNOWLEDGE-DESIGN.md §8, build-order items 3 and 6.)

### M0-71 · queued — **CONTRADICTION'S IDENTIFY, 2 of 3: THE FIXTURE AND THE FIRST MEASUREMENT, BEFORE ANYTHING A MEMBER SEES — §7's corpus, the false-conflict rate and recall, and the THRESHOLD recorded.** A candidate judgement is measured OFF-RECORD (no table write). — owner M0 / VERIFY.
order: the measurement IDENTIFY's judgement must pass, BEFORE anything a member sees; after REC-146 (SCHEDULER, 2026-09-19)
milestone: M0 (VERIFY; the acceptance test of item 3 is this item's over-strictness arm)
interface: none — a fixture, a harness and a measurement
design: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §7 (the over-strictness arm, its corpus and its three negative controls) and §9 item 2.
depends-on: REC-146.
scope: build §7's labelled corpus (precision, world in both of Bob's shapes, record, unrelated) and the harness over REC-146's pairs; measure a candidate judgement off-record; record the false-conflict rate, recall and the THRESHOLD in `MEASUREMENTS.md` with the corpus size.
accepts-when: `MEASUREMENTS.md` carries the figures with date, instrument and corpus size; §7's three negative controls run and recorded (a disabled or always-`world` judgement FAILS the gate by name; an empty record returns case (a)); `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 2).

### REC-147 · blocked — **CONTRADICTION'S IDENTIFY, 3 of 3: THE JUDGEMENT AND THE CANDIDATE TABLE — §5's five labels as labelled machine work through ONE append site; §8's row, state `proposed`, idempotent over unchanged referents. ONLY IF M0-71's gate is met.** — owner RECORD + the investigative session's skill. Reads `blocked` until M0-71 records a threshold the judgement meets.
order: blocked on M0-71's measured gate (SCHEDULER, 2026-09-19)
milestone: M9
interface: I3 and I5 (a table; ICs minted with `node tools/mintid.mjs IC`)
design: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §5 (the judgement and its vocabulary), §8 (where a candidate lives) and §9 item 3.
depends-on: M0-71, AND its measured gate met — a threshold missed is the finding, and this row then goes back to BOB.
scope: as §5 and §8; PRESENT and RESOLVE are NOT in scope (BOB's next design act, after M0-71's first measurement).
accepts-when: M0-71's gate passes on the built judgement; a re-run over unchanged referents writes nothing new; every row names both referents and versions, the key, the run, the label and reason. NEGATIVE CONTROL: two append sites, and the one-site arm fails. Battery green own-baseline by its COMPLETION LINE; `node scripts/coverage.mjs --strict` exit read UNPIPED; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 3).

### UI-68 · queued — **THE REVIEW-COPY SURFACES, WITHOUT EXPORT: draft (the project's editors), read (owner/participants, and recipients by secret), grant and revoke (the owner), comment at both doors — the plane rendered verbatim, and NO export, download or print-to-file affordance.** Discharges the in-instance half of REC-126's DELEGATION to UI. — owner UI.
order: BOB #14's item 8 (13.review-copy), its in-instance surfaces; the plane half is built (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 consumer (REC-126's IC-145/IC-146)
design: `docs/architecture/BIO_Publication_v0_1.md` §6A (front matter and §6A.3), with the REC-126 → UI DELEGATION in `CLAIMS.md` and its REC-133 addendum, which specify the four surfaces. Verified by BOB #16 (2026-09-19): not Program B's.
depends-on: REC-126 (done) — CHECK AT THE CODE at spawn.
scope: the delegation's four surfaces; nothing leaves the instance from the UI.
accepts-when: the harness drafts, grants, reads by secret, comments and revokes against the real plane, and a revoked secret reads nothing. How a liar passes it: a hidden export path (a print stylesheet, a blob link), so the harness asserts NO such affordance exists. NEGATIVE CONTROL: add a download link, and the no-export arm fails by name. `node civicos-ui/test/run.mjs` from the repo root, unpiped, exit 0; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (BOB #16 inbox "THREE DESIGNS AT THEIR HOMES", item 6).

### REC-148 · queued — **`op=reviewcopy` CARRIES DEC-31's IN-BAND QUARTET: a SHA-256 over the canonical bytes it answers, its date, its author, and both threshold floors (the project's `required_strength`, both axes) — the SAME quantity the published container's header renders.** Measured by BOB #16: today it carries a date and an author and no hash and no floors. — owner RECORD.
order: DEC-31's in-band quartet, before any review copy leaves the instance (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 additive (an IC minted with `node tools/mintid.mjs IC`)
design: `docs/architecture/BIO_Publication_v0_1.md` §6A (§6A.3 point 2 and the DEC-31 in-band rule), and BOB.md rule 7 (a comparison names its quantity).
depends-on: REC-126 (done) — CHECK AT THE CODE at spawn.
scope: add the hash and both floors beside the date and author, computed by the one function the published header uses.
accepts-when: for one case edition, the review copy's quartet and the published container's header agree field for field, proved by the SAME function; the hash changes when one byte of the answer does. How a liar passes it: a second hasher over a differently-canonicalised body agrees on the fixture and drifts, so the suite asserts ONE function. NEGATIVE CONTROL: canonicalise differently in one place, and the agreement arm fails. Battery green own-baseline by its COMPLETION LINE; `node scripts/coverage.mjs --strict` exit read UNPIPED; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 7).

### UI-69 · queued — **EXPORT OF A REVIEW COPY carrying the quartet in-band on every page, with §6A.3 point 2 said AT the act: what leaves cannot be revoked; the grant can.** — owner UI.
order: after UI-68 and REC-148: export only once the quartet travels with it (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 consumer (REC-148's IC)
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 point 2.
depends-on: UI-68 and REC-148.
scope: the export affordance UI-68 withheld, every rendered page carrying the quartet; the statement at the act, once (DEC-69).
accepts-when: an exported copy carries the quartet on every page byte-equal to the plane's; the statement renders at the act and nowhere else. NEGATIVE CONTROL: drop the quartet from one page, and the per-page arm fails. `node civicos-ui/test/run.mjs` from the repo root, unpiped, exit 0; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 8).

### REC-149 · queued — **DISCOVERABLE OR HIDDEN (Membership v2 §7 item 7.14), 1 of 4: the OWNER's recorded setting (append-only, latest wins, no record = HIDDEN); `#inSight` answers three levels at the ONE predicate; EXISTENCE only for a discoverable project to a member outside it; the DIRECTORY read; `viewerPredicate` NOT changed.** — owner RECORD.
order: Bob's 2026-09-18 ruling (DISCOVERABLE/HIDDEN), after BOB #14's listed items; the plane half first (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 (an IC minted with `node tools/mintid.mjs IC`), I5 for the setting's table
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14 (Bob's ruling of 2026-09-18; decided by BOB #16, 2026-09-19).
depends-on: REC-138 (done; `Store#inSight`) — CHECK AT THE CODE at spawn.
scope: as item 7.14: at EXISTENCE every act but the request is refused POSITIONALLY with a new code carrying id and name only; every existing project boots HIDDEN.
accepts-when: through the ops, a hidden project is byte-identical to a nonexistent one at the directory, the request and every act (REC-138's suites green UNEDITED); an uninvited member's record reads, search, backlinks and run reports never show a discoverable project's contents; a predecessor's store boots with every project HIDDEN. How a liar passes it: widening `viewerPredicate` passes the directory arm and leaks contents. NEGATIVE CONTROL: widen it, and a contents arm fails by name. Battery green own-baseline by its COMPLETION LINE; `node scripts/coverage.mjs --strict` exit read UNPIPED; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 1).

### REC-150 · queued — **DISCOVERABLE OR HIDDEN, 2 of 4: THE REQUEST TO JOIN — ask (one open per member per project, optional comment), withdraw, owner GRANT (writes `invited`) or DECLINE (recorded), visible to the requester, owners and administrators only, LAPSED when the project goes hidden; administrators and the founder answer none.** — owner RECORD.
order: after REC-149, whose EXISTENCE level it needs (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 (an IC minted with `node tools/mintid.mjs IC`)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14 and §7.4 (a grant is an invitation; the requester joins by the checkbox); C-56's positional check.
depends-on: REC-149.
scope: the lifecycle as item 7.14 states it.
accepts-when: a grant leaves the requester `invited` and NOT `joined`; a lapsed requester reads their own request and nothing else about the project; an administrator's grant is refused. NEGATIVE CONTROL: let a grant write `joined`, and the invited-not-joined arm fails. Battery green own-baseline by its COMPLETION LINE; `node scripts/coverage.mjs --strict` exit read UNPIPED; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 2).

### UI-70 · queued — **DISCOVERABLE OR HIDDEN, 3 of 4: the create and fork forms ASK, with neither preselected, and cannot submit without the choice; the project's owner sees and changes the setting (others read-only).** — owner UI.
order: after REC-149, and after UI-66 on the same forms (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's IC)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14, with DEC-69 (forced, at the act).
depends-on: REC-149; and the create and fork forms as UI-66 leaves them (same forms — one worker at a time).
scope: as the design says.
accepts-when: the harness cannot submit a create or fork without the choice, and nothing is preselected; the owner changes the setting and a non-owner sees it read-only. How a liar passes it: a form that submits without the choice and gets HIDDEN from the plane silently, so the harness asserts the submit is impossible. NEGATIVE CONTROL: preselect HIDDEN, and the nothing-preselected arm fails. `node civicos-ui/test/run.mjs` from the repo root, unpiped, exit 0; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 3).

### UI-71 · queued — **DISCOVERABLE OR HIDDEN, 4 of 4: the directory; the request button and comment; the owner's queue of open requests with grant and decline; the requester's own requests and their states.** — owner UI.
order: after REC-149 and REC-150 (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's and REC-150's ICs)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14.
depends-on: REC-149 and REC-150.
scope: as the design says, rendering the plane's answers verbatim.
accepts-when: the harness requests, the owner grants, the requester sees `invited` and joins by the checkbox, all against the real plane; a hidden project never appears in the directory. NEGATIVE CONTROL: render a hidden project from a cached list, and the directory arm fails. `node civicos-ui/test/run.mjs` from the repo root, unpiped, exit 0; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 4).

### D-126 · queued — **THE `per-item` WEIGHT IS DESIGNED AND UNBUILT, SO A QUEUE SELECTION CANNOT BE HANDLED AS A SET.** `bio-plane/src/affordances.mjs` publishes `refuse` (5), `report` (1) and `single` (14) and no `per-item` (re-measured 2026-09-21), and the three acts a selection would use each take one key. The rest of what D-126 asked for is BUILT: the three classes, the 35-kind registry, the item contract, the handled-scopes. — owner RECORD, then UI.
order: a feature, after the rows Bob's priorities ordered (UI-71 closes his 2026-09-18 ruling), before the M4/M2 product rows because the queue surface is built and UI-55's ARM 4d already watches for it (SCHEDULER #5, 2026-09-21)
milestone: M4; the surface half M8
interface: I3 — the weight vocabulary and the acts' set form; the integrator mints and classifies the IC.
design: `docs/development/NOTIFICATIONS.md` §Applying a handler to a selection: *"each item independently succeeds or is RETAINED WITH A REASON"*, the reasons being named refusals in the plane's own words.
depends-on: none.
scope: ONE row in two halves, BOB #19's decomposition. RECORD publishes `per-item` and lets `op=proposedispose`, `op=taskresolve` and `op=taskforward` take a set, each item succeeding or retained with its reason; then UI applies a handler to a selection and keeps each retained item listed with that reason. **UI-55's ARM 4d (`civicos-ui/test/member-respect.test.mjs`) goes RED the day an act takes a set, BY DESIGN:** correct it with a dated reason, never exempt it. The 26 unbuilt generators stay under their own rows.
accepts-when: a selection of three where one item drifted leaves exactly that one listed with its reason and clears the other two, through the ops and on the surface. How a liar passes it: all-or-nothing relabelled, so the mixed-outcome arm is required. NEGATIVE CONTROL: refuse the whole set on one failure, and that arm fails by name.
added: 2026-09-21 · SCHEDULER #5 (BOB #19's inbox entry, drained this commit; keeps its `D-` id).

### REC-122 · queued — D-161's LAST ACT: A MEMBER CHOOSES THE ON-POINT PAIR OF A CONNECTION (Bob's 2026-09-14 refinement, §5.4) — the act that turns REC-120's honest UNDETERMINED into a definite answer where a member has established which mention is to the point.
order: runnable product work (M4, D-161's last act); REC-120 is done; not on BOB #14's list, which governs only rows added after it (SCHEDULER, first order audit, 2026-09-18)
milestone: M4 — D-164, the content-extent primitive (RECORD)
interface: I5 and I3 — its OWN IC, minted with `node tools/mintid.mjs IC` BEFORE building, against the bases as read at resolution (I5 1.18.0, I3 23.5.0 on `main` when rowed)
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair and what it is NOT, as corrected 2026-09-18) read with `DEBT.md` D-161 (act 3) and REC-86's NARROW (`op=narrow`, IC-123) — the LEG-side analogue whose rules (member-only, machine proposals labelled, the old retained, nothing claimed that was not established) this act should mirror unless the design says otherwise.
depends-on: REC-120 (DONE — `determining_pair.selection`, `pair_rule` and C-49.4 present on `main`; verify before building).
accepts-when: in M-51's fixture a member choosing the p.9 mention makes a p.9 citation answer REACHED with that grade and a p.2 citation answer outside, through the ops; with no choice made every REC-120 answer is byte-identical; a machine credential cannot choose (refused by name); a choice cannot name a mention the document does not carry; `DEBT.md` D-161 CLOSED; construct-status updated if a claim moves (`node tools/status.mjs --check` then … (whole text: the cut archive)
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «REC-122». A worker READS IT before building.

### CAP-11 · queued — DEC-75 ENACTED, act 3 — the export step's CALIBRATION:
order: runnable since CAP-10 landed (M2 measurement); placement CONFIRMED as SCHEDULER's by BOB #15 (BOB #14's list governed rows added after it) (SCHEDULER, first order audit, 2026-09-18)
milestone: M2 — a measurement before a letter (CLAUDE.md: measure, do not assume)
interface: none — a measurement; if the calibration record needs a home in the chain, that is CPDF-13's calibration shape, reused
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.3 (the content-axis staleness rule — when a calibration goes stale) and §16 (the Drive paragraph DEC-75 was folded into); DEC-75's answer is what makes the calibration the act that raises the cap; D-351 (the byte-instability half already taken: `.ods` `content.xml` byte-identical across three exports, `.odt` differing by one style name)
depends-on: CAP-10
accepts-when: MEASUREMENTS.md carries the per-format table with N, instrument, command and blind spots; the row records the proposed cap per format with its evidence; `node tools/gates.mjs` green (class DOCS unless a script lands); plancheck --local 0 fail.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «CAP-11». A worker READS IT before building.

### FW-20 · queued — FLIPPED TO `running` AND REVERTED WITHIN THE HOUR, 2026-09-18, by CONDUCT #4, BEFORE ANY SPAWN — recorded rather than silently undone.
order: runnable since CPDF-19 landed (M2 breadth); placement CONFIRMED as SCHEDULER's by BOB #15 (BOB #14's list governed rows added after it) (SCHEDULER, first order audit, 2026-09-18)
milestone: M2 — one content type per measured class (BREADTH §7 row 2), completed
interface: none expected — a content type and its registration; if a reference shape moves it is I2 and the IC is minted before building
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §2 and its §7 row 2, with §8's controls; M0-32's census in `MEASUREMENTS.md` sets the order and this is its fourth and last class; D-376 in `DEBT.md` carries the measurement
depends-on: CPDF-19 (BREADTH §7 row 5 — read-time re-extraction to tier 3; until a directory decodes at all, a type for it is unreachable code)
accepts-when: a staff-directory page FETCHED AND READ yields a type that recognises it, driven end to end through `identify`; **the re-taken decode census is recorded in `MEASUREMENTS.md` whichever way it comes out**; the `also` pass answers a directory that also satisfies another class; D-376's disposition moves with the commit; **the `docprofile/` change carries BOTH regenerations — `node tools/bundle-docprofile.mjs` for the UI embed AND `cd bio-plane && npm run build` for the plane bundle (D-377, and the second one is the half nobody had written down)**; `cd bio-plane && npm run test:battery` green own-baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` from the repo root, unpiped, exit 0; `node tools/plancheck.mjs --local` 0 fail.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «FW-20». A worker READS IT before building.

### CPDF-3 · queued — **UNBLOCKED AT THE FIRST ORDER AUDIT (SCHEDULER, 2026-09-18): its stated blocker, *a DIST deploy*, is false at the artifact — `op=pdfstructure` is in `bio-plane/src/index.mjs`, and 0.58.0 was deployed through `deploy.mjs` and verified serving on 2026-09-14 (`MEASUREMENTS.md`, "D-297/IC-82 — release 0.58.0 deployed"); releases through 0.63.0 have been cut since.** The live verification itself is still owed.
order: unblocked at this audit (its deploy blocker is false); an M2 live verification, after the product rows above (SCHEDULER, first order audit, 2026-09-18)
milestone: M2
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 "How content is extracted today" (the I2 structure shape `op=pdfstructure` answers), with `docs/development/INTERFACES.md` I1/I2.
scope: Live-verify pdfstructure against real captured Oakland PDFs (the agenda→item graph) via `op=pdfstructure`, in a `biosmoke-pdf` scratch namespace; sweep after.
behind-interface: I1
depends-on: CAP-1 (done), a DIST deploy
added: 2026-07-31 · CONDUCT
landed:

### M0-77 · queued — **`tools/mintid.mjs`' MAIN-GUARD COMPARES `resolve(process.argv[1])` WITH `import.meta.url`, WHICH NODE REALPATHS — so `mintid` invoked through a SYMLINKED path (macOS's temp dir is one) silently runs NOTHING and EXITS 0: a costs-nothing green in the id allocator every lane uses.** Found by M0-73's worker, routed by CONDUCT #6, 2026-09-19; fix named. A CLASS: SCHEDULER measured 25 `.mjs` files that read both `process.argv[1]` and `import.meta.url` (a candidate list, not a verdict — some may already realpath). — owner M0.
order: first of the queued M0 rows: a silent exit 0 in the id allocator every lane uses is a costs-nothing green (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — tools' entry guards
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): *verify by the positive artifact, never the absence of an error*; an exit 0 that ran nothing is the class it names.
depends-on: none.
scope: `mintid.mjs` compares `realpathSync(process.argv[1])` with `fileURLToPath(import.meta.url)`; SWEEP the class (`git grep -l 'process.argv\[1\]' -- '*.mjs' | xargs grep -l import.meta.url`), fixing each guard of the same shape and listing every file judged with its verdict. `newgroup/**` is out of bounds: any hit there is reported to DIST, not edited.
accepts-when: `mintid` run through a symlinked path prints its MINTED line and exits 0, and one run through a path that is not the script exits non-zero or prints nothing BY DESIGN, stated; every swept file's verdict is in the landing; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: a guard removed entirely (always runs), which breaks importing the module — so an arm IMPORTS each fixed tool and asserts its main did not run. NEGATIVE CONTROL: restore `resolve()` in `mintid`, and the symlinked-path arm fails by name.
added: 2026-09-19 · SCHEDULER (M0-73's worker's finding via CONDUCT #6; id minted with `node tools/mintid.mjs M0`).

### M0-68 · queued — **`bio-plane/test/vf4-live-scratch.mjs` ARM 4b-ii STILL ASSERTS D-323's REFUSAL, and D-323 is CLOSED: against any current plane it fails 4 assertions for the fix working, not for a regression.** Measured by FLEET on biosmoke7 at 0.58.0 with the VF-4 live-scratch instrument, 2026-09-19, routed by CONDUCT #5. A superseded test is CORRECTED, never exempted. — owner M0 (the test estate).
order: M0, right after the battery tally: an instrument asserting a closed defect fails against every current plane — a correction to a superseded test (SCHEDULER, 2026-09-18)
milestone: M0 (background lane, holds no slot)
interface: none — a live-scratch instrument's arm; no plane source moves
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with the file's own DATED NOTE of 2026-09-13 (D-323), which names the two choices: RE-PIN arm 4b-ii to `level-empty-<reporting level>` and say so, dated, in the note; or RETIRE it to `agent-worker/test/wire-vocabulary.test.mjs`, whose W8 block already drives the same question locally.
depends-on: none (D-323 done).
scope: make the choice the note hands "whoever re-runs this", state why at the site, and keep MEASUREMENTS.md M-8's figures exactly as measured at 0.57.0 (the arm's history is a measurement of record). If re-pinned, the over-strictness arm moves with it.
accepts-when: arm 4b-ii passes against the current plane with the new spelling asserted and NO refusal, or is retired with W8 named as its successor; the dated note records which, and why; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: deleting the four assertions, so the row requires the NEW spelling to be ASSERTED (or W8 named) rather than the old one removed. NEGATIVE CONTROL: restore the colon spelling in `emptyLevelCandidates` on a scratch tree, and the re-pinned arm (or W8) fails naming it.
added: 2026-09-18 · SCHEDULER (FLEET's measurement of 2026-09-19, routed by CONDUCT #5; id minted with `node tools/mintid.mjs M0`).

### M0-72 · queued — **`mergecarry.control.mjs` ARM 5 REPORTS A FALSE FAIL: its declared mustFail name "the register is the three the sweep found" no longer exists — `mergecarry.test.mjs` renamed the assertion to "…the register is the FIVE the sweeps found, not a longer list" when KNOWN_HISTORICAL_DROPS grew.** The arm ARMS and the suite goes red correctly; only the name is stale. Measured by BOB #16 on 2026-09-19. — owner M0.
order: M0; a negative control reporting a false FAIL, with M0-68's class of test corrections (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — a control driver
design: `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none.
scope: update arm 5's mustFail entry (`bio-plane/test/mergecarry.control.mjs`, near its line 168) to the current assertion name, with a dated reason; re-run the control.
accepts-when: `node bio-plane/test/mergecarry.control.mjs` reads all 7 arms AS DECLARED; the control leaves the tree byte-identical; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: a mustFail name loosened to a substring that matches any assertion, so the name must be the full current one.
added: 2026-09-19 · SCHEDULER (BOB #16's message; the fix was named).

### M0-74 · queued — **`bio-plane/test/curated-producer.probe.mjs` FAILS 9/1 ON `main`: it reads the severance check from `#restsOnLive`'s definition, and D-267 moved that check into `#refEdgeSevered`.** The probe is not in the battery, which is why `main` stays green. Measured by CONDUCT #6 and re-measured by SCHEDULER, 2026-09-19 (`curated-producer sweep: 9 pass, 1 fail`). — owner M0.
order: M0; a probe failing on main for a moved check, with the other instrument corrections (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — a probe's source read
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with D-267 (`node tools/ledger.mjs find D-267`), which moved the check.
depends-on: none.
scope: point the probe's source read (its `src.indexOf("  #restsOnLive(id) {")` near line 273) at `#refEdgeSevered`'s definition, with a dated comment saying why the old read was right when written; take the DEFINITION, never the first mention, as the existing comment requires.
accepts-when: `node bio-plane/test/curated-producer.probe.mjs` from `bio-plane/` reads 10 pass, 0 fail; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: widening the read to any mention of either name, so the read must anchor on the definition line. NEGATIVE CONTROL: rename `#refEdgeSevered` on a scratch copy, and the probe fails by name.
added: 2026-09-19 · SCHEDULER (CONDUCT #6's report; fix named; id minted with `node tools/mintid.mjs M0`).

### M0-90 · queued — **MK-1's PUBLISH PROBE CANNOT DRIVE ITS PATH 3, the `op=caseratify` route C-53.12 fences.** Its fixture concludes without naming a reading's claim, so `op=conclude` refuses `NO_CLAIM` (REC-124/REC-136, §7.1), `op=publish` then refuses `NOT_CONCLUDED`, and the path never runs. MK-3's worker made it print DEAD rather than clean (`bio-plane/test/mk1-publish-probe.mjs`); the route stays unmeasured by the instrument built to measure it. C-53.12 itself is asserted in the battery (`testify.test.mjs`, `testimonyaxis.test.mjs`). — owner M0.
order: with M0-74, the probe corrections: a probe path that cannot run, now stated rather than hidden; the measurement a lifted fence will need (SCHEDULER #4, 2026-09-21; MK-3's report, CONDUCT-NEXT §4)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §Incomplete, which MK-3 confirmed at the artifact.
depends-on: none.
scope: the fixture adopts a named reading's claim at `op=conclude`, so PATH 3 drives `op=publish` then `op=caseratify` and reads the fence's answer.
accepts-when: `node bio-plane/test/mk1-publish-probe.mjs` prints PATH 3 driven, with C-53.12's refusal code, and no DEAD ARM line for it. How a liar passes it: a path reported driven that never reached ratify, so the DEAD detector stays. NEGATIVE CONTROL: drop the claim, and PATH 3 prints DEAD by name.
added: 2026-09-21 · SCHEDULER #4 (`node tools/mintid.mjs M0`).

### M0-91 · queued — **NO SUITE FEEDS C-2.8 A NON-STRING `content_id`, SO THE ARM THAT CLOSED D-362 HAS NEVER BEEN DRIVEN.** `checkLegExtentGrammar` refuses a present `content_id` that is not a string (REC-84, `47ec7cbd`): the case where an unquoted all-digit id parses as an integer and the leg would silently become a whole-document citation. The two suites that reach the refusal feed a malformed STRING (`"not-an-id"`), never a number. — owner M0.
order: with the M0 instrument corrections (M0-74, M0-90): a fix with no arm is one refactor from being undone, and what it guards is a SILENT drop (SCHEDULER #5, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) — a check is evidence only where a suite can watch it fail; read with D-362 (`node tools/ledger.mjs find D-362`).
depends-on: none.
scope: one arm that drives an unquoted all-digit `content_id` THROUGH THE FRONTMATTER PARSE into C-2.8 and asserts the refusal by name — D-362's measured path: `parseScalar` coerces `/^-?\d+$/` to a number before anything reads it. Suites: `content-extent-leg.test.mjs` or `cite-extent.test.mjs`, the worker's choice, stated.
accepts-when: the leg is refused BY NAME at C-2.8 with the parse in the path, and the existing string arms stay green. How a liar passes it: a hand-built leg whose `content_id` is already a number, so the arm starts from `bundle.md` text. NEGATIVE CONTROL: treat a non-string `content_id` as absent again, and the arm fails by name.
added: 2026-09-21 · SCHEDULER #5 (LED-7 batch 10, D-362's instrument; `node tools/mintid.mjs M0`).

### M0-75 · queued — **`bundle.test.mjs` AND `livefire.test.mjs` PRINT NO TALLY LINE, so every battery headline carries M0-65's "EXCLUDES 2 untallied suite(s)" segment; give each a standard tally, and the segment leaves the headline.** Suggested by M0-65's worker, routed by CONDUCT #6, 2026-09-19. **It MOVES the assertion total** — the landing states the old and new totals and attributes the delta to the two suites. — owner M0.
order: M0; M0-65 is ON MAIN (5a6d5913), so runnable: retires its EXCLUDES segment (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — two suites' report lines
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with D-413 (closed by M0-65) and `bio-plane/scripts/battery.mjs`' accepted tally forms.
depends-on: M0-65 (its EXCLUDES segment and widened tally reader; in CONDUCT #6's gate).
scope: each suite prints one tally line in an accepted form, counting the assertions it actually makes; no assertion is added to reach a number.
accepts-when: a full battery's headline carries no EXCLUDES segment, and its assertion total rises by exactly the two suites' printed tallies, stated in the landing; `cd bio-plane && npm run test:battery` green by its COMPLETION LINE; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: a tally line printing a constant, so each tally must equal the suite's own assertion count, checked by making one assertion fail and watching the tally move. NEGATIVE CONTROL: remove one suite's tally line, and the EXCLUDES segment returns naming it.
added: 2026-09-19 · SCHEDULER (M0-65's worker's suggestion, routed by CONDUCT #6; id minted with `node tools/mintid.mjs M0`).

### M0-76 · queued — `d280-strengthbar.control.mjs` READS NOT AS DECLARED ON EVERY RUN (arm C2 and the severedhomes arms), and D-280's site (a) — the bar read — is covered by NO arm. — owner M0.
order: M0, with the instrument corrections; ruled by BOB #16 (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — a control driver and one suite's arm
design: `docs/development/VERIFICATION.md` (admitted for M0 by name; its one-copy rule), with D-267 and D-280 (`node tools/ledger.mjs find D-267`, `D-280`) and the control's own header (2026-09-13, M0-25), which states the gap.
depends-on: none.
accepts-when: `node bio-plane/test/d280-strengthbar.control.mjs` reads EVERY arm AS DECLARED and the site-(a) arm fails by name; the control leaves the tree byte-identical; the C-6.1 finding is stated either way; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: re-declaring mustFail names to whatever now fails, so each re-declared name must be one that asserts the predicate's width in severedhomes §4.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «M0-76». A worker READS IT before building.

### M0-69 · queued — A WHOLE-STORE PURGE OF THE SCRATCH STORE CLEARS THE IDENTITY TABLES; A PURGE OF THE RECORD STORE NEVER DOES, structurally (BOB #16, 2026-09-19). — owner M0 (the purge op's scratch behaviour; I3 behaviour at scratch only).
order: M0, after the battery tally and M0-68: a live verification whose scratch keeps member rows stops measuring the same subject twice (SCHEDULER, 2026-09-19)
milestone: M0 (a live verification that stops measuring the same subject twice is the verification defect)
interface: I3 — behaviour at scratch only; an IC if the op's published answer changes (the integrator classifies)
design: `docs/architecture/BIO_Distribution_v0_1.md` §6 rung 6, "What 'swept after' means" (BOB #16, folded at `331e3758`; the front matter lists it decided and not built), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none in code.
accepts-when: a scratch purge leaves every enumerated identity table empty; a record-store purge driven through the op leaves `members` byte-identical; a new member-keyed table added to the schema without joining the list FAILS the pin. How a liar passes it: a hand list of three tables, so the enumeration must be DERIVED from the schema and the pin must fail on a planted table. NEGATIVE CONTROLS: pass the flag for the record store, and the record arm fails; drop one table from the derivation, and the pin fails naming it.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «M0-69». A worker READS IT before building.

### M0-70 · queued — **VF-4's LIVE-SCRATCH INSTRUMENT STATES ON ITS OWN OUTPUT THAT ARM 2a LEAVES A `proposed` MEMBER BY DESIGN (Membership v2 §4.7), AND PURGES SCRATCH AFTER ITSELF once M0-69 lands.** A refused `memberadd` leaving a proposal is CORRECT (BOB #16, 2026-09-19): the proposal is what the administrators endorse; no member-removal op is owed. — owner M0.
order: M0, after M0-68 and M0-69: the same instrument file as M0-68, and its purge-after rests on M0-69 (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — the instrument `bio-plane/test/vf4-live-scratch.mjs`
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.7 (administrator consensus) and `docs/development/VERIFICATION.md`, read with BOB #16's ruling, verbatim in `docs/archive/ledgers/BOB-INBOX-drained.md` (the 2026-09-19 entry, item 3).
depends-on: M0-69 (the purge must take scratch identity) and M0-68 (SAME FILE — one worker at a time in `vf4-live-scratch.mjs`).
scope: arm 2a's output says the proposal is by design and why; the instrument ends with a scratch purge and reads back `members` empty.
accepts-when: a run's output carries the statement at arm 2a; after the run, scratch `members` reads empty; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: a purge call whose answer is not read back, so the row requires the read-back. NEGATIVE CONTROL: skip the final purge, and the read-back arm fails naming the leftover rows.
added: 2026-09-19 · SCHEDULER (BOB #16's inbox entry, item 3; id minted with `node tools/mintid.mjs M0`).

### VF-7 · queued — CANNOT RUN until the next DIST deploy; queued now so the future act is an ITEM the deploy's integration meets, not a telling a future session must remember (the 2026-09-14 rule applied to two advance tellings the same day it was written).
order: M0 VERIFY lane, after the battery tally: it watches a credential class (DEC-43's zero), now a read-back since the 0.58.0 deploy armed it (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (VERIFY lane, holds no slot)
interface: none — it watches, it does not publish a shape
design: `docs/development/SCHEDULER.md` §"The mechanism, and how the next consumer joins" (the `monitor-cadence` consumer whose first live arming this watches) and `docs/development/ARCHIVE-FALLBACK.md` §"Shape on the capture" (CAP-3's fallback), both governed; `docs/development/VERIFICATION.md` is the VERIFY lane's own authority for what a live watch must establish (a process document, ungoverned by `CORPUS-STANDARD.md` §6).
depends-on: **the next plane deploy through `deploy.mjs`** (DIST's next cut — D-297's release is the likely carrier)
accepts-when: (on the deploy landing) both first activations measured and recorded with the serving build named; the first armed tick attributed to the scoped class; `op=audit` clean after; any anomaly filed as a finding rather than worked around.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «VF-7». A worker READS IT before building.

### M0-66 · queued — `m025-arm-anchor-witness.test.mjs` CLOSES THE COMMENTARY CLASS ON ITS LABEL HALF AND NOT ON ITS ANCHOR HALF — prose in a driver's block comment that names an anchor-bearing shape in backticks reads as a live anchor, and produced TWO … (whole text: the cut archive)
order: M0; an instrument producing false findings (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot) — an instrument that penalises a driver for documenting how it arms punishes the one habit this estate most wants
interface: none — `bio-plane/test/m025-arm-anchor-witness.test.mjs`
design: `docs/development/VERIFICATION.md` — the test estate's own authority, admitted for the M0 lane BY NAME by `tools/rowdesign.mjs`; read with the DELEGATION of 2026-09-17 in `CLAIMS.md` (M0-41's control → CONDUCT) that measured it, and the suite's own arm S10, which already closes the LABEL half with `stripComments`.
depends-on: none
accepts-when: prose in a block comment naming an anchor-bearing shape is NOT read as an anchor; a live anchor in code still is; the reach figures before and after are stated with any movement named by driver; A4 green with 0 dead; `node tools/plancheck.mjs --local` then BARE; `cd bio-plane && npm run test:battery` green own-baseline, read by its COMPLETION LINE.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «M0-66». A worker READS IT before building.

### M0-64 · queued — M0-41's CONTROL ARM 3 NO LONGER HAS A SUBJECT:
order: M0; a control arm proving less than it declares (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot) — an arm that measures something other than what it declares is a control that proves strictly less than it says
interface: none — `bio-plane/test/m041-instrument-census.control.mjs` (a `.control.mjs`, not discovered by the battery)
design: `docs/development/VERIFICATION.md` — the test estate's own authority, admitted for the M0 lane BY NAME by `tools/rowdesign.mjs`; read with commit `4c6ef789`'s own account (on `main` since CONDUCT #4 integrated `elated-grothendieck-a10003`), which measured the falsification and routed the ruling rather than relaxing the judge.
depends-on: none
accepts-when: the control's run reports every arm AS DECLARED, or arm 3 is RETIRED with the falsifier's measurement at the site; the planted id uses the target's real heading shape; arms 1, 2 and 4 are unchanged in outcome; the control leaves the tree byte-identical and HEAD unchanged (its own guards); `node tools/plancheck.mjs --local` then BARE; `cd bio-plane && npm run test:battery` green own-baseline, read by its COMPLETION LINE.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «M0-64». A worker READS IT before building.

### M0-44 · queued — FLIPPED TO `running` AND REVERTED WITHIN THE HOUR, 2026-09-17, by CONDUCT #1, and the reversal is recorded rather than silently undone.
order: M0; seven truncated claims invisible to the bounds instrument (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot)
interface: none — a reader's pattern and the rosters derived from it; no plane source moves
design: `docs/development/VERIFICATION.md` — the test estate's own authority, admitted for the M0 lane BY NAME by `tools/rowdesign.mjs`; read with `bio-plane/test/derivation-bounds.test.mjs`'s own header, which states what its walk can and cannot see, and with D-378 in `DEBT.md`
depends-on: none (M0-38 landed the grading and pinned the blind spot rather than fixing it)
accepts-when: each of the seven previously-invisible claims appears in a roster the instrument prints, or is named as out of reach with its reason; **every roster the widened pattern feeds is RE-DERIVED and its delta attributed arrival by arrival — never a figure nudged to fit**; the census and the class ratchet move only if the corpus genuinely moved, and if they do, the arrival is NAMED; `cd bio-plane && npm run test:battery` green own-baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node tools/plancheck.mjs --local` 0 fail; D-378's disposition moves with the commit.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «M0-44». A worker READS IT before building.

### M0-33 · queued — D-353 RULED at M0-29's integration (CONDUCT #11, mechanism):
order: M0; a third census shape (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot) — the test estate's own instrument
interface: none — control drivers and the census only
design: `docs/development/VERIFICATION.md` §"A THROWING CONTROL DRIVER VALIDATES EVERY ANCHOR BEFORE IT ARMS ANYTHING (D-331, 2026-09-14)" — D-333's three decay modes, of which (c) is the one M0-25's census and D-333's tally comparison do not see; D-353 is the ledger row that measured it (M0-29, `13ee07f`)
depends-on: none (M0-29 landed the sweep and its adjudication table)
accepts-when: the census reports the sweep's tally section (0 open candidates on the estate as landed, the three retired instances listed as adjudicated); one unadjudicated candidate planted → the census exits non-zero naming it; `cd bio-plane && npm run test:battery` green own-baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; UI harness from the repo root exit 0; plancheck --local 0 fail.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «M0-33». A worker READS IT before building.

### SK-5 · blocked — RE-STATED AT THE FIRST ORDER AUDIT (SCHEDULER, 2026-09-18):
order: blocked: no plane op publishes the surface registry (SCHEDULER, first order audit, 2026-09-18)
milestone: M9
interface: I3 — **it needs the plane to PUBLISH the surface registry, which nothing does today; that is the item's whole blocker.** File the IC before building.
design: `docs/development/ASSISTANT-PILOT.md` §1 (the five-layer training pack — the **Recipes** row is this layer, and it is the row that makes build-time validation the thing worth having) and §7 step 1, whose front matter names SK-5 as the blocker on the pack's `absent` recipe layer
depends-on: a published surface registry (unbuilt). **NOT schedulable until that exists** — recorded so the next CONDUCT does not spawn a worker into a wall.
accepts-when: (on unblocking) a recipe whose step names a surface or an op that does not exist **FAILS THE BUILD**; the pack's `absent_because` body is replaced by the layer rather than edited around.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «SK-5». A worker READS IT before building.

### UI-60 · blocked — RESTORED AT THE FIRST ORDER AUDIT (SCHEDULER, 2026-09-18):
order: blocked: waits on Bob's re-prioritisation of UI (SCHEDULER, first order audit, 2026-09-18)
milestone: M8
interface: none
depends-on: Bob's re-prioritisation of UI (DEC-33's deferral and the 2026-09-15 content direction stand)
accepts-when: the decomposition exists as rows and this pointer is marked superseded naming them.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «UI-60». A worker READS IT before building.

### REC-15 · blocked
order: blocked: DEC-33's deferral stands (the live publishing route is a human's own session); BOB #14's item 11 also places it after items 2, 5 and 6 (SCHEDULER, first order audit, 2026-09-18)
milestone: M10
scope: **`op=publishpreflight` — the ceremony's ordering argument in one op. DEFERRED by DEC-33** (Bob, 2026-08-03: the publication ceremony process is deferred; publication runs through the operator for now). Trigger: Bob reopens the case-making thread. Recorded for when it wakes, so the deferral loses nothing: base scope as `BUILD-ORDER.md` §2 (REC-15) with `RECONCILED.md` §3.2's C-4 correction (`NO_SIGNERS` is INSTANCE-WIDE — the refusal detail must never say "for you", D-57); **DEC-15** — refuse `UNCLEARED_HUNCH` naming every hunch leg, in the same list as `NO_SIGNERS`, before any signature exists; **DEC-20** — only a hunch blocks publication on bias grounds; ordinary bias is DISCLOSED (the manifest SHOWN in the artifact, not merely cited) and refused on nothing; **DEC-17** — refuse `BELOW_PROJECT_STRENGTH` naming the axis; **D-158** bounds the per-member signing-key pre-flight (a signer row for a never-enrolled member reads `active` and is refused by ratify — fix at `signerAdd` write, assert the other view); §4 Q11 measured YES — `op=signerlist` + `op=whoami` make the per-member pre-flight computable client-side, an ADDITION to instance-wide `NO_SIGNERS`, not a replacement, until D-158 closes.
behind-interface: I3
depends-on: REC-14
accepts-when: (on waking) as `BUILD-ORDER.md` §2 (REC-15) plus — preflight reports `UNCLEARED_HUNCH` naming each hunch leg and `BELOW_PROJECT_STRENGTH` naming the axis, each BEFORE any signature exists, writing nothing; negative control — attach per-member wording to the instance-wide `NO_SIGNERS` and the suite fails; clear a hunch and the refusal disappears without any other state change.
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33

### UI-17 · blocked
order: blocked: rests on REC-15 (SCHEDULER, first order audit, 2026-09-18)
milestone: M10
scope: **O1 THE PUBLICATION CEREMONY — DEFERRED by DEC-33** (Bob, 2026-08-03: the process is deferred; publication runs through the operator for now; UI-17a ships in its place). Trigger: Bob reopens the case-making thread. Recorded for when it wakes: base scope as `research/RECONCILED.md` §3.1 (UI-17) — the pair shown in step 2, the C-9 picker, the Q5 re-keyed basis-leg panel (an assembly keyed on the SUBJECT is permitted; keyed on the ANSWER-SHAPE it performs generation by selection — the panel shows the case's own basis legs, the COMPLEMENT of the field's content), instance-wide `NO_SIGNERS` wording — plus **DEC-19 as amended** (publishing is IRREVERSIBLE; correction moves forward; the ceremony states this) and **DEC-13** (the subject-position stage, ordered BEFORE signing since authoring it changes the sha). D-158 bounds the per-member pre-flight.
behind-interface: I3
depends-on: REC-15, UI-11
accepts-when: (on waking) as `RECONCILED.md` §3.1 (UI-17), including the Q5 negative control — any prior deferral/dismissal/severance reason appearing in step 3's panel fails the harness.
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33
