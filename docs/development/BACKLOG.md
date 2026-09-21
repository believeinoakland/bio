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

### D-389 · queued — **ON A FULL RAW FETCH `op=frontier` PUBLISHES `truncated: false`, A COVERAGE CLAIM THE READER CANNOT SUPPORT, IN ALL THREE ARMS.** Each arm over-fetches `R` raw rows (`(cap + 1) * 2` at document and content, `* 3` at meaning), gates them and cuts at `cap`; when the fetch comes back FULL, rows beyond it were never read, yet a gated list of `cap` or fewer reads complete. Raised by REC-109; `observation-content.test.mjs` arm G5 names this row. — owner RECORD.
order: after CAP-13, above the ledger tooling: CLAUDE.md §2's class, in the read that must say WHICH absence is true. The row's open question — is `true` more often acceptable? — §2 answers: a coverage claim the method did not establish is not made, and fail-safe is the direction (SCHEDULER #6, 2026-09-21, LED-7 batch 13)
milestone: M3
interface: I3 — `truncated` reads `true` on a full raw fetch at all three arms; the integrator mints and classifies the IC.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §5 (the frontier is a view over the log) and §6 (the readers), which compute `truncated` from what the viewer may read.
depends-on: none.
scope: ONE disjunct, `raw.length === R` (the supply was not exhausted), in the ONE over-fetch the three arms share — never per arm, the mirror-and-drift class this row was raised to avoid. The row's analysis stands: it leaks nothing, since an entitled viewer on a full fetch already reads `true`. Arm G5 moves in the same commit with a dated reason.
accepts-when: a fixture whose raw supply exceeds the over-fetch reads `truncated: true` at every arm for every viewer; an exhausted supply reads as before. How a liar passes it: fixing one arm, so the fixture drives all three. NEGATIVE CONTROL: drop the disjunct, and the full-fetch arm fails by name at each level.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 13; keeps its `D-` id).

### REC-160 · queued — **`op=reevaluations` SAYS A SEVERED LEG *RESTS ON* ITS TARGET AND PUBLISHES NO STATUS.** `Store#reevaluations` reads legs from `inquiry_basis`, which drops `status`, and its edition cause says *"this leg rests on edition N"* for every leg, so a withdrawn leg is described as support. `#refEdgeSevered` is the one predicate, and `restingOn` already publishes a status from it. — owner RECORD.
order: after D-389, above CAP-14: a support claim the record cannot make, CLAUDE.md §2's class, in the read that tells a member what to re-examine (SCHEDULER #7, 2026-09-21; BOB #22's inbox entry)
milestone: M9
interface: I3 additive — the integrator mints the IC.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §5.4 (cascade semantics: an upstream re-distribution sets a re-evaluation obligation on every dependent), DEC-70's home since BOB #23 folded it there (`43cd0caf`, 2026-09-21): *a read of the obligation marks which legs are severed and never describes one as resting on its target (REC-160)*; *the connection INFORMS, never binds*.
depends-on: none. D-280 closed; nothing is superseded.
scope: each obligation leg carries `status` (`severed` or `confirmed`) from `#refEdgeSevered(bundle, target)`, and a severed leg's edition detail says the withdrawn leg NAMED edition N rather than resting on it. The obligation still fires (DEC-70) and derives nothing from strength; an unrecorded or unrecognised `status` reads `confirmed`.
accepts-when: a drive through the op shows a severed leg `status: "severed"` with wording that claims no support, and a confirmed leg unchanged. How a liar passes it: filtering the severed leg out, which reverses DEC-70, so `d280-strengthbar.test.mjs` SITE (c) stays green. NEGATIVE CONTROL: drop the status, and the severed-leg arm fails by name.
added: 2026-09-21 · SCHEDULER #7 (BOB #22's inbox entry, drained this commit; `node tools/mintid.mjs REC`).

### CAP-14 · queued — **A REUSED PART DOES NOT NAME THE CAPTURE ITS BYTES CAME FROM.** The manifest records WHEN (`reused_from_fetched_at`), not WHICH capture fetched them, and `reusedParts` names only the capture that reused. RULED owed by BOB #21 (2026-09-21): for a reused part, who retrieved the bytes is an EARLIER capture. — owner CAPTURE.
order: after D-389 and behind CAP-13, the same reuse machinery and files, one worker at a time; below CAP-13 because it adds provenance the record omits rather than correcting a figure it overstates (SCHEDULER #6, 2026-09-21; the D-339 worker's item 3, ruled)
milestone: M2
interface: I5 and I1 — a derived column and an additive manifest field; the integrator mints and classifies the ICs.
design: `docs/development/CAPTURE-SCALING.md` §Job one, *"RULED 2026-09-21 by BOB #21 … a reused part names the capture it came from"*, which carries the build, with `BIO_Intake_Doctrine_v1_1.md` §2.
depends-on: none. Sequence after CAP-13 (same files).
scope: as the ruling builds it: `site_assets.last_fetched_by`, the primary capture sha whose fetch set `last_fetched`, written beside it on every FETCHED observation and never moved by a reuse (through the reshape pass, before schema application); each reused part carries it as `reused_from`; the reusing capture's `site_asset_refs` row keeps it, taken from the observation itself; `reusedParts` reads that row, never `site_assets`.
accepts-when: a reused part names the capture whose fetch served it, and a later fetch moving `site_assets` does not change what an earlier reuse names; a reuse recorded before the build reads UNDETERMINED as to its source, never inferred from timestamps. How a liar passes it: reading `site_assets` at report time, so the arm fetches again and asserts the earlier reuse still names the old capture. NEGATIVE CONTROL: read `reusedParts` from `site_assets`, and that arm fails by name.
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

### D-293 · queued — **THE PUSH GUARD NEVER RUNS `tools/gates.mjs`, AND NOTHING REFUSES A TREE WHOSE RECORDED VERDICT IS RED.** `tools/pushguard.mjs` runs `decided.mjs --check` and refuses a stale push, nothing more. RULED by BOB #22 (SCHEDULER #5's Q4): a push-time gate would not converge — a full gate takes ~25 minutes and `main` took 48 first-parent commits from 13:00Z on 2026-09-21, 46 of 47 gaps under 25 minutes (M-85) — so the guard READS a recorded verdict. — owner M0.
order: with the preventive instruments, after LED-9 and above D-107: it moves *gate before you push* from discipline to instrument for every lane's push, where D-107 does so for one deploy (SCHEDULER #7, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), its push-guard section for the half it states; the refusal's design is CARRIED in BOB #22's drained entry (`docs/archive/ledgers/BOB-INBOX-drained.md`, "D-293 RULED"), because that file is at its reading budget: the builder adds the refusal's one line in the landing.
depends-on: none.
scope: `gates.mjs` records its verdict and class keyed by the TREE it measured, only when that tree was CLEAN, untracked under the git common dir; the guard refuses a push whose tip tree carries a RED record, naming it, and says nothing when none exists. **FULL GATE PROFILE**.
accepts-when: a RED gate then a push of that tree is refused by name; a GREEN, an unrecorded and a changed tree each pass. How a liar passes it: keying on the commit sha, which an amend of the message alone evades, so the arm amends and asserts the refusal holds. NEGATIVE CONTROL: drop the guard's lookup, and the RED-then-push arm fails by name.
added: 2026-09-21 · SCHEDULER #7 (LED-7; BOB #22's ruling, drained this commit; keeps its `D-` id).

### D-107 · queued — **THE INSTALLER HAS NO SCRIPTED DEPLOY.** `newgroup/DEPLOY.md` documents a dashboard paste of the bundled module, which records nothing about what was deployed and gives a version assertion nowhere to live; `newgroup/scripts/` holds only `embed-release.mjs`. The plane has what this lacks: `bio-plane/scripts/deploy.mjs` will not report success until it reads the script back and hashes it against the signed asset. D-106 went unnoticed for thirteen releases in this gap. — owner DIST.
order: with the preventive instruments, after LED-9: DIST's law reads the installer back BY HAND at every cut (`kickoffs/DIST.md` step 9: the embedded version, and `bindings: []` still empty), so nothing ships unverified today; the script moves it from discipline to instrument (SCHEDULER #6, 2026-09-21, LED-7 batch 15)
milestone: M7
interface: I4 — the release artifact's deploy path; the integrator classifies it.
design: `docs/architecture/BIO_Distribution_v0_1.md` §6, the deploy-to-serve ladder — *every rung read back rather than believed* — with §5 (the installer).
depends-on: none.
scope: a scripted installer deploy on `deploy.mjs`'s pattern: upload the bundle, read the script back from the account, hash it against the signed asset, and REFUSE success unless the embedded release version matches and `bindings` is empty — the structural security guarantee step 9 names. `DEPLOY.md` points at the script, the paste kept as the stated fallback.
accepts-when: a deploy whose read-back differs from the signed bytes, carries another version or shows any binding reports FAILURE by name; a clean one reports the hash it read. How a liar passes it: believing what the upload API returned, so the arm tampers with the read-back. NEGATIVE CONTROL: skip the hash comparison, and the tampered-read-back arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 15; keeps its `D-` id).

### D-54 · queued — **`bio-plane/wrangler.jsonc` LEAVES `limits.subrequests` UNSET, SO THE PLANE'S SUBREQUEST CEILING IS WHATEVER CLOUDFLARE'S DEFAULT IS THAT MONTH.** NARROWED: the row's plan half is CLOSED by DEC-42, since the installer REQUIRES Workers Paid and VERIFIES it before completing (`newgroup/src/index.mjs`, "The Workers Paid plan is needed first"). What remains is its last sentence: the default moved from 1,000 to 10,000 in February 2026 (Cloudflare's documentation, a vendor claim), and a default that moves is not a decision. — owner DIST.
order: with DIST's rows, after D-107: preventive, a configuration nothing reads wrong today (SCHEDULER #7, 2026-09-21, LED-7)
milestone: M7
interface: I4 — the plane's deploy configuration; the integrator classifies it.
design: `docs/architecture/BIO_Distribution_v0_1.md` §6, the deploy-to-serve ladder (every rung read back), with DEC-42: Workers Paid is required.
depends-on: none.
scope: set `limits.subrequests` explicitly in `bio-plane/wrangler.jsonc` to the figure the plane is sized for on Workers Paid, with the reason and the vendor's figure cited at the site; DIST's deploy reads it back.
accepts-when: the deployed script's settings carry the explicit value, read back after the deploy. How a liar passes it: a value equal to today's default with no reason, so the site cites what the plane needs.
added: 2026-09-21 · SCHEDULER #7 (LED-7; D-54's DEBT row of 2026-07-29, NARROWED at the code; keeps its `D-` id).

### REC-159 · queued — **AN ENROLLED ADMINISTRATOR IS REFUSED §4.9's CUSTODIAL ACTS FROM THEIR OWN SESSION, WITH A SENTENCE THAT IS FALSE OF THEM.** `memberadd`, `memberset`, `signeradd` and `signerset` sit in `SESSION_OPS.admin` alone, the FOUNDER'S password session, so an enrolled administrator is answered `SESSION_ROLE_CANNOT_REACH_OP` (C-38.7): the op *"is reserved to an administrator of this group"*. Measured by REC-156; `adminvote.test.mjs` §8f pins it KNOWN-OPEN. — owner RECORD.
order: directly before REC-155, on the same `SESSION_OPS` sets and `d270-refusal-truth`'s ROLE literal: a false refusal shipping to a real administrator outranks a determination owed (SCHEDULER #7, 2026-09-21; REC-156's DELEGATION via CONDUCT #10)
milestone: M8
interface: I3 — four ops gain session reach and three a stamped `by`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 (each act is EVERY administrator's) and §4.7's block *"WHAT IS STILL NOT CLOSED"*, which names this fix: D-136's call applied again — both session sets, a stamped `by`, the roster refusing a non-administrator by name.
depends-on: none. D-136 and REC-156 are on `main`.
scope: the four gain `member` in `classes` and both `SESSION_OPS` sets; `memberset`, `signeradd` and `signerset` stamp `by` as `memberadd` does; each store method refuses a stamped `by` that is not an ACTIVE administrator, by name, BEFORE any lookup. §8f and the ROLE literal CORRECTED, never exempted. A bearer keeps reaching all four, its `by` naming nobody (§4.7, RULED by BOB #22). **NOT in scope:** `governorconfig`, with BOB #23.
accepts-when: an enrolled administrator performs all four from their session, attributed to them; a member is refused by name. How a liar passes it: widening the class without the roster check, so the member arm must refuse. NEGATIVE CONTROL: drop the roster check, and the member arm fails by name.
added: 2026-09-21 · SCHEDULER #7 (REC-156's DELEGATION; `node tools/mintid.mjs REC`).

### REC-162 · queued — **A FOUNDER-ONLY OP'S REFUSAL CALLS AN ENROLLED ADMINISTRATOR A NON-ADMINISTRATOR.** Five ops sit in `SESSION_OPS.admin` and not `SESSION_OPS.member`; a member-kind session refused one gets `SESSION_ROLE_CANNOT_REACH_OP`, whose sentence says the op *"is reserved to an administrator of this group"* and that the caller's role is `member`, false of an enrolled administrator. RULED by BOB #23: `op=governorconfig` is the OPERATOR's act. — owner RECORD.
order: back to back after REC-159, the same two suites (`d270-refusal-truth`'s ROLE literal, `adminvote` §8f), the second re-reading the first's pins; a false refusal sentence, CLAUDE.md §2's class (BOB #23's entry, 2026-09-21; SCHEDULER #7)
milestone: M8
interface: I3 — the refusal's sentence; the integrator classifies it in IC-55's family.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9, *AND ADMINISTRATORS DO NOT RUN THE INSTANCE* (BOB #23, 2026-09-21).
depends-on: none; true of all five today. **Sequence after REC-159.**
scope: the (b) refusal says WHICH session reaches the op, derived from the set that reaches it: an op only `SESSION_OPS.admin` reaches is *reserved to the founder's session*, never an administrator's. `index.mjs`' two `governorconfig` comments (*"the same line memberset and signerset draw"*; *"the same as the roster ops above"*) corrected: its line is §4.8's. `d270-refusal-truth`'s `/administrator/` assertion corrected with a dated reason, never exempted.
accepts-when: an enrolled administrator and a member, each refused `governorconfig`, read the founder's-session sentence; the founder's session and the ADMIN_TOKEN bearer still set an appetite. How a liar passes it: moving `governorconfig` into both sets, so an arm asserts the enrolled administrator is still REFUSED. NEGATIVE CONTROL: restore the administrator sentence for a founder-only op, and the arm fails by name.
added: 2026-09-21 · SCHEDULER #7 (BOB #23's inbox entry, drained this commit; `node tools/mintid.mjs REC`).

### REC-155 · queued — **SEVEN VERBS WHOSE `OPS` ROW ADMITS A SESSION CLASS WERE REACHABLE BY NO SESSION, AND NOBODY HAD RULED WHY — NOW RULED (§4.10): FIVE GAIN SESSION REACH, TWO ARE UNATTENDED BY DECISION. LANDING 1 of 2.** The plane answers all seven `SESSION_ROUTE_NOT_RECORDED` today, and its header calls them *"UNDETERMINED rather than decided"* (`index.mjs`). — owner RECORD.
order: where it stood, below the ledger tooling, now with its design (BOB #20's entry): the plane is honest here — a determination was owed, not a defect shipping — and this landing refuses nobody (SCHEDULER #5, 2026-09-21; placed by SCHEDULER #3, 2026-09-19)
milestone: M8
interface: I3 — MINOR: sessions gain reach and no class list moves; the integrator mints the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10 (ruled by BOB #19, landed by BOB #20 at `d9cf3283`).
depends-on: none. **NOT D-136**, whose three ops §4.7 ruled and which is built. **Sequence after REC-159** (the same `SESSION_OPS` sets and ROLE literal).
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

### D-311 · queued — **`op=affordances` PUBLISHES NOTHING ABOUT SEVEN ROSTER ACTS, AND OFFERS `publish` TO A MACHINE CREDENTIAL THE STORE REFUSES BY NAME.** `projectinvite`, `-join`, `-leave`, `-remove`, `-owneradd`, `-ownerremove` and `-ownerrescue` sit in `NON_ACTS` (`affordances.mjs`); a `class:` credential is offered `publish`, which `publishCase()` refuses `MACHINE_CANNOT_PUBLISH` — the pre-flight disagreeing with the act. — owner RECORD.
order: after REC-158, with the plane's who-may-do-what: an act OFFERED that the store refuses is an overclaim in the pre-flight; the roster half costs narration only (no surface renders one off it) (SCHEDULER #6, 2026-09-21, LED-7 batch 14)
milestone: M8
interface: I3 — an addition to the published act set and a narrowing for machine credentials; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Interaction_Constructs_v0_1.md` §"RULED 2026-08-01: the pre-flight is plane-sourced" — *see what it will refuse and why BEFORE it runs* — with the positions of `BIO_Membership_Architecture_v2.md` §7.7.
depends-on: none — D-310's pattern (IC-75) is built.
scope: the row's own fix: one per-pair fact, `#isProjectOwner(target, viewer)` — never D-310's *owns some project* — and seven `applies` predicates, each derived from its own refusal (`projectjoin` is the invitee's, `projectleave` a participant's, `projectremove` an administrator's). Then withhold from a machine credential every act its class is refused by name, correcting D-310's byte-unchanged arm with a dated reason — the consumers reading it with one named first.
accepts-when: each roster act is offered exactly where its store act succeeds, pair by pair; a machine credential is offered nothing its class is refused. How a liar passes it: reusing D-310's fact, so an owner of project A must not be offered `projectinvite` on B. NEGATIVE CONTROL: swap in D-310's fact, and the cross-project arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 14; keeps its `D-` id).

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

### D-438 · queued — **THE DEC-49 GUARD'S REAL-TREE CONTROL HARNESS `civicos-ui/test/refusal-codes.control.mjs` IS RED: FOUR ARMS FAIL THAT ARE NOT ITS SUBJECT'S.** (c) `stdio-census.test.mjs` ARM D reads the guard BY NAME, so moving the guard aside turns the harness red on an `ENOENT`; (e) its first predicate is the census sentence from before D-257; (r2) EXACTLY 33 conscripted, measured 35; (r6) EXACTLY 36, measured 38. NARROWED: its `refusal-partition` half closed with D-355 (`0e80aa8c`). — owner VERIFY.
order: FIRST of the instrument cluster, with M0-93: a control red on a green `main` measures nothing, D-355's class, and the DEC-49 guard is what a member's refusal words rest on (SCHEDULER #7, 2026-09-21; the D-254 worker via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), the section "THE DEC-49 GUARD ASKS WHAT A REFUSAL IS IN PRINCIPLE", with its rule that a control is evidence only when it FAILS at a named assertion.
depends-on: none. D-254 corrected (n2) at `cac06ae7`.
scope: per arm: (c) require the harness RED only on stdio-census's read of the missing file and every refusal-judging suite GREEN over the codeless refusal; (e) take the fixture suite's ARM 5 regex as D-257 corrected it; (r2)/(r6) re-derive both counts on the current tree and NAME the two refusals that joined `promote`. Run it to its foot.
accepts-when: the harness runs to its foot with every arm AS DECLARED, each re-declaration dated at its site. How a liar passes it: re-pinning (r2)/(r6) to whatever prints, so the two joiners are NAMED. NEGATIVE CONTROL: restore 33, and (r2) fails by name.
added: 2026-09-21 · SCHEDULER #7 (LED-7; the D-254 worker's DEBT row; keeps its `D-` id).

### M0-93 · queued — **`bio-plane/test/delegations.control.mjs` IS RED ON `main`: ITS A1 AND A6 ASSUME ONE AFFIRMATION LINE PER DELEGATION BLOCK, AND THE INSTRUMENT ALLOWS SEVERAL.** `tools/delegations.mjs` judges a block by its NEWEST `open as of`; the REC-69 "unread-index roster" DELEGATION in `CLAIMS.md` carries two (2026-09-16 and -17). A1 ages only the newest, so the block cannot go STALE; A6 compares 36 re-dated LINES with 35 BLOCKS. The D-355 worker read `m037-control: 19 pass, 5 fail` (M-83). — owner M0.
order: with D-438, first of the instrument cluster: a control red on a green `main` (SCHEDULER #7, 2026-09-21; D-355's route via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with its M0-51 rule: *never rename a subject to satisfy an instrument*. The register's two dated lines are true history and stay.
depends-on: none.
scope: correct the CONTROL to the instrument's contract: A1 ages EVERY affirmation of the block it stales; A6 counts affirmation lines, not blocks. Attributed at the site, dated, never exempted. A3 and A6's declared-pass check read UNDETERMINED in M-83: establish both on the corrected run.
accepts-when: the control reads every arm AS DECLARED on `main` with the two-line block in place, and leaves the tree byte-identical. How a liar passes it: deleting the older line, so the arm asserts the register unchanged. NEGATIVE CONTROL: restore newest-only aging, and A1 fails by name.
added: 2026-09-21 · SCHEDULER #7 (`node tools/mintid.mjs M0`).

### M0-94 · queued — **`bio-plane/test/m025-arm-census.mjs` PRINTS AN `UNCLASSIFIED` DRIVER, ONE EXITING NON-ZERO WITH NO PHRASE ITS MATCHER KNOWS, AND EXITS 0 OVER IT.** The census exits non-zero only on a stale arm, a false tally or a thrown fixture. In M-83 `provenance-floor` read `UNCLASSIFIED exit=1` and `delegations` still does: printed, gated on nobody. — owner M0.
order: directly after M0-93 and D-438, the two drivers it would turn red on landing: a gate that reports where it should fail cannot fail, M0-79's doctrine on the census side (SCHEDULER #7, 2026-09-21; D-355's route via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the census's own D-333 and M0-78 extensions of its exit: a false tally, then a thrown fixture, carry it.
depends-on: M0-93, D-438.
scope: an UNCLASSIFIED driver carries the census's non-zero exit, a third extension of the same line; it is still REPORTED unclassified, never scored stale or clean. The landing states the UNCLASSIFIED population its own full census run found; each is attributed or rowed.
accepts-when: a fixture driver exiting 1 with an unknown phrase turns the census exit 1, naming it; the population is stated. How a liar passes it: teaching the matcher the fixture's phrase, so the arm generates its phrase fresh. NEGATIVE CONTROL: drop the new disjunct, and that arm fails by name.
added: 2026-09-21 · SCHEDULER #7 (`node tools/mintid.mjs M0`).

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

### D-437 · queued — **REC-76's VERDICT READER SAYS IT READS EVERY BOOLEAN-PRODUCING OPERATOR, AND READS SIX: `<=`, `>=`, `instanceof` and `in` are not boolean-shaped to it, and the shifts `<<`, `>>`, `>>>` are.** `verdictKind` in `bio-plane/test/verdict-reader.mjs`, since D-254 the ONE home three instruments import, refuses a `<`/`>` beside `=`. Of 1,798 return-position outcomes, 6 properties carry a depth-0 `<=`/`>=` it cannot see, 3 of which would change the verdict; no instrument is known to read wrong TODAY. — owner VERIFY.
order: with the instrument cluster, after M0-92: a reader blind to an operator class but latent, a `gap` as its row classifies it (D-378's precedent), so below the controls red today (SCHEDULER #7, 2026-09-21; the D-254 worker via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), the section "THE DEC-49 GUARD ASKS WHAT A REFUSAL IS IN PRINCIPLE", which governs the reader.
depends-on: none. **Sequence after D-438**: the guard's harness reads the reader's figures.
scope: at depth 0, `<=`/`>=` are `expr`, `<<`/`>>`/`>>>` are NOT, `instanceof` and `in` (word-bounded) are `expr`, `=>` stays excluded; one READING per operator in the reader's own table; the three instruments' figures re-read and any floor moved from its own print.
accepts-when: each operator's reading passes; each moved figure is attributed to the print it came from. How a liar passes it: a floor nudged to fit, so every move cites its print. NEGATIVE CONTROL: revert the `<=` clause alone, and its reading fails naming `verdictKind`.
added: 2026-09-21 · SCHEDULER #7 (LED-7; the D-254 worker's DEBT row; keeps its `D-` id).

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

### D-439 · queued — **TWO MORE SHARED MECHANISMS ARE HAND-KEPT COPIES, NEITHER PINNED.** (1) A READER: `stripComments`, `quotedIn`, `literalsOf`, `flatten` and `citationResolves` are copied across the four `skill*.test.mjs` suites, which decide what each READS of the skill pack: REC-76's reader before D-254, unpinned. (2) A HAND-KEPT DEPENDENCY LIST: three `battery-*.test.mjs` suites carry `REAL_MODULES = ["provenance.mjs", "residue.mjs"]`, so the next relative import `battery.mjs` takes turns all three red at load, no module named (D-265's signature). — owner M0.
order: after M0-89, the instrument cluster's end: copies that agree today, the drift a pin would catch, so debt and not a live defect (SCHEDULER #7, 2026-09-21; the D-254 worker via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with D-254's single-homed verdict reader (`cac06ae7`) as the precedent.
depends-on: none.
scope: (1) one shared `bio-plane/test/skill-reader.mjs` the four suites import, pinned as D-254 pins its reader; (2) `instrumentDeps("battery.mjs")` from `instrument-deps.mjs`, which already takes an entry. CANNOT SEE: an indented or arrow function, a renamed or re-commented copy.
accepts-when: four suites import one reader, three derive their list, every suite's tally unchanged. How a liar passes it: a renamed second copy, so the pin extracts by behaviour. NEGATIVE CONTROL: add a relative import to a copy of `battery.mjs`, and the derived list carries it where the literal did not.
added: 2026-09-21 · SCHEDULER #7 (LED-7; the D-254 worker's DEBT row; keeps its `D-` id).

### M0-95 · queued — **34 CONTROL DRIVERS LEAVE THEIR PEN IN THE TREE WHEN A RUN FAILS: `nc-rec95.mjs` and `nc-rec129.mjs` never remove theirs, and 32 more remove it only at the foot.** An untracked pen makes `git status --porcelain` non-empty (D-398's archive condition) and rides a careless `git add -A` into a commit. From M-83's static sweep of 217 driver-shaped files, heuristic and stated so; the two pens are `.gitignore`d as a MITIGATION only. — owner M0.
order: after D-439, closing the instrument cluster: residue a failed control leaves, a second variable in the next run (CLAUDE.md §5: *break only the thing*), not a false measurement (SCHEDULER #7, 2026-09-21; D-355's route via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with D-355's `removePenOnExit` in `refusal-partition.control.mjs` as the precedent: an `exit` hook runs on exit 0, `process.exit(1)` and an uncaught throw (M-83).
depends-on: none. Sequence with M0-96: whichever lands second re-reads the first.
scope: each pen's removal moves into an `exit` hook (a shared helper is the builder's call, stated); the builder re-derives the population rather than trusting the sweep, and lists every driver judged with its verdict. A pen is removed BY NAME, never by a variable path (CLAUDE.md §7).
accepts-when: each fixed driver, forced to exit non-zero, leaves no pen and a clean `git status`. How a liar passes it: removing on exit 0 only, so the forced-red arm is required. NEGATIVE CONTROL: drop one driver's hook, and its forced-red arm fails by name.
added: 2026-09-21 · SCHEDULER #7 (`node tools/mintid.mjs M0`).

### M0-96 · queued — **TWO CONTROL DRIVERS INSTALL SIGINT/SIGTERM/SIGHUP HANDLERS OVER SYNCHRONOUS CHILDREN, SO A STOP SIGNAL WAITS FOR THE END OF THE RUN, and the driver keeps editing real sources after it is told to stop.** `bio-plane/test/independence.control.mjs` and `run-conditions.control.mjs` run their suites with `execFileSync`/`spawnSync`. Measured by the D-355 worker (M-83): a SIGTERM sent at 1.0 s ran the handler at 4.0 s, after the whole script; the handler suppresses the default kill. — owner M0.
order: directly after M0-95, the same class, a driver's behaviour on an abnormal exit; last of the cluster, because the run still restores, late (SCHEDULER #7, 2026-09-21; D-355's route via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with D-355's asynchronous `refusal-partition.control.mjs` and `nc-d355.mjs` arm (4) (SIGTERM mid-arm: exit 143, restored, pen absent) as the precedent.
depends-on: none. Sequence with M0-95.
scope: each driver runs its children asynchronously, so its handler runs mid-arm, restores from memory and exits; nothing else in either driver moves.
accepts-when: each driver SIGTERMed mid-arm exits promptly with its subjects byte-identical by sha256 and `cmp`. How a liar passes it: removing the handlers, so the SIGTERM arm asserts the restore. NEGATIVE CONTROL: restore the synchronous call, and the prompt-exit arm fails by name.
added: 2026-09-21 · SCHEDULER #7 (`node tools/mintid.mjs M0`).

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

### D-84 · queued — **A PUBLISHED CASE DOES NOT NAME THE BIAS LENS IT WAS HELD TO.** DEC-54 (d) and the bias design require every work product to cite its BIAS MANIFEST — the (bias bundle, revision) pairs in force and a hash of the effective set — travelling with publication. The plane computes it (`op=biasmanifest`, `statements_sha`) and pins each adoption (`bias_adoptions`), and no publication path writes it: `published_cases` holds the authored `bias_acknowledgement` and REC-44's container manifest, no lens. NARROWED: the rest of D-84 is built. — owner RECORD.
order: directly after D-52, above the features: DEC-20's *disclosed* — the manifest SHOWN in the artifact — is missing from every published case, and one published without it is corrected only by a new edition (DEC-19) (SCHEDULER #6, 2026-09-21, LED-7 batch 11)
milestone: M10
interface: I3 — the case document gains the manifest; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption" — *"The manifest is part of the evidentiary record and travels with publication"* — and §"The bias acknowledgement, authored at export", whose manifest row reads *computed and stamped by the plane*.
depends-on: none — PL-12's manifest and pins are built.
scope: at case publication the plane stamps the manifest in force for the case's project scope — its pairs and `statements_sha` — into the signed case document, FROZEN and never recomputed; the acknowledgement stays authored beside it.
accepts-when: a case published under an adopted set names each pair and the hash; adopting a new revision afterwards leaves the published bytes identical; with nothing adopted the document says no manifest was in force. How a liar passes it: recomputing at read time, so the arm moves the lens after publishing and asserts the bytes did not move. NEGATIVE CONTROL: drop the stamp, and the named-lens arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 11; keeps its `D-` id).

### D-220 · queued — **THE INVESTIGATIVE SESSION READS SIXTY CAPTURES OF ONE DOCUMENT AS SIXTY DOCUMENTS.** Bob's ruling of 2026-08-06 — link a document's versions and USE that where it helps — is built as a READ: `op=versionchain` (PL-10) exposes the join, `heldMatch` consumes it (D-221, closed) and the UI renders it. `INVESTIGATIVE-SESSION.md` names the session consumer (3), and `agent-worker` calls nine plane ops, `versionchain` not among them. NARROWED to that consumer. — owner FLEET, with SKILL for the doctrine.
order: after D-84, above the features: a deployed machine role over-counts what the record holds — the false-coverage hazard `STORE-AS-CACHE.md` names — in work a member reads and may accept; a correction to built work (SCHEDULER #6, 2026-09-21, LED-7 batch 12)
milestone: M9
interface: I8 consumer of `op=versionchain` (I3, built); no shape moves unless the builder finds one.
design: `docs/development/INVESTIGATIVE-SESSION.md` §"What the session sees" — *"AND IT MUST READ DOCUMENT VERSIONS AS VERSIONS (D-220, Bob 2026-08-06) … The session is consumer (3) on that row."*
depends-on: none — `op=versionchain` is built.
scope: the run reads an address's versions through `op=versionchain` and counts a document once, its versions as versions, wherever it counts or cites held material; the skill doctrine says so. Consumer (2), monitoring per address, is UNJUDGED here: the builder checks it at spawn and states it.
accepts-when: a fixture holding several captures of one address reads as ONE document with its versions, and a run's coverage counts it once. How a liar passes it: deduplicating by title or text, which merges different documents — so the fixture carries two different documents sharing a title. NEGATIVE CONTROL: drop the chain read, and the one-document arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 12; keeps its `D-` id).

### D-182 · queued — **AN ACTION NOBODY ASSESSED IS RECORDED AT `risk_tier` 1 — *FILE FREELY* — ON THE ONE FIELD THAT CARRIES LEGAL EXPOSURE.** C-2.10 admits 1, 2 and 3; nothing publishes member words for them and no undetermined value exists, so both writers keep the floor. RULED by BOB #21 (2026-09-21): both halves in one row. — owner RECORD, then UI.
order: after D-220, above the features: an overclaim on the field that carries legal exposure — CLAUDE.md §2's class, in the action plan a member files from (SCHEDULER #6, 2026-09-21; ruled on SCHEDULER #6's Q4)
milestone: M10
interface: I3 and I5 — a new value and published words; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, *"`risk_tier`, RULED 2026-09-21 by BOB #21"*: the Roadmap §8 words (1 file freely, 2 file with caution, 3 do not file without counsel) and UNDETERMINED, as authority and counterparty gained (D-130).
depends-on: none.
scope: `risk_tier` gains UNDETERMINED, written wherever no member stated a tier and never defaulted to 1; only a member's authored act sets 1, 2 or 3; the plane publishes the three words (REC-38's pattern) and a surface invents none. Rows already written at the default: the builder states how they read, and never back-fills an assessment nobody made.
accepts-when: an action created with no tier reads UNDETERMINED through the ops; a member's act sets 2 and reads *file with caution*; nothing writes 1 by default. How a liar passes it: a surface rendering UNDETERMINED over a stored 1, so the arm reads the stored row. NEGATIVE CONTROL: restore the default of 1, and the no-tier arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (LED-7; ruled on its row's two options; keeps its `D-` id).

### UI-74 · queued — **THE ACCEPT CEREMONY IS NOT ON `main`, SO NO SURFACE LETS A MEMBER ACCEPT A MACHINE-PROPOSED READING.** The IS plan's UI-43 built it on `worktree-agent-a9e7e017d06799858` (`fd1e2aec`, 2026-08-09) and it was never integrated (D-397's third branch): `acceptCeremonyOpen`, `ACER_` and `versionaccept` occur 0 times in `origin/main:civicos-ui/app.html`, 3, 16 and 4 times on the branch (2026-09-21). — owner UI.
order: the first feature, after D-52: DEC-24's member half — the machine proposes, the member concludes — has no door, and the IS plan recorded it done at 43/43; below the corrections because the status authority claims no ceremony (SCHEDULER #5, 2026-09-21)
milestone: M9
interface: I3 consumer (`op=versionaccept`; `op=versionstrength`'s `independence`) — both built.
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 (a)–(b), with `docs/archive/IS-BUILD-PLAN.md`'s UI-43 row as the scope it was built to.
depends-on: none; both ops are built — CHECK AT THE CODE at spawn.
scope: UI-43's scope RE-DERIVED on current `main` — the branch is EVIDENCE, 1,836 commits behind, never merged blind: the four beats, the falsifier read back, independent sufficiency AFFIRMED per branch before a name lands, DEC-46's lens diff in the ceremony, REC-36's withholding — PLUS D-195's shared origin, which the branch never read (`independence` 0×): the plane derives it; the ceremony shows it BEFORE the affirmation, and never refuses.
accepts-when: an OR accept requires the per-branch affirmation; a fixture whose two parts share a capture shows that origin before it, and one with independent parts shows NONE; driven against the real plane. NEGATIVE CONTROLS: drop the affirmation, or hide the field, and each arm fails by name.
added: 2026-09-21 · SCHEDULER #5 (D-397's third branch and D-195, verified at the code; `node tools/mintid.mjs UI`).

### REC-161 · queued — **NOTHING COMPUTES INDEPENDENCE OVER A PARTITION A MEMBER IS STILL PROPOSING, SO D-195's SHARED ORIGIN CANNOT BE SHOWN AT THEIR OWN ELICITATION.** `Store#independenceOf` has two consumers, `op=suggest`'s check and `op=versionstrength`'s read of a STORED version; UI-27's read-back (`elicFalsifier`) prints *"Your answer fails only if ALL of these fail"* and reads no independence. — owner RECORD.
order: 1 of 2, directly after UI-74, which shows the same fact at the accept ceremony (BOB #22, 2026-09-21: SCHEDULER #5's Q1, RULED)
milestone: M9
interface: I3 additive — an IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 clause (c) (BOB #22, 2026-09-21).
depends-on: none — `#independenceOf` is built.
scope: a read returning `#independenceOf` for a PROPOSED partition over an inquiry's existing legs, gated as `op=versionstrength` is, writing nothing, `checked`/`complete` as they already are.
accepts-when: two parts sharing a capture read as sharing an origin, independent parts read clean, a one-part partition reads `checked: false`, and the answer equals `op=versionstrength`'s once the partition is written. How a liar passes it: a second derivation that agrees today, so a control swaps in a copy differing in one branch and fails by name.
added: 2026-09-21 · SCHEDULER #7 (BOB #22's inbox entry, drained this commit; `node tools/mintid.mjs REC`).

### UI-75 · queued — **THE ELICITATION READ-BACK NAMES NO SHARED ORIGIN: a member affirming *"fails only if ALL of these fail"* is not told that two of the reasons trace to one capture.** — owner UI.
order: 2 of 2, after REC-161; with UI-74, whichever lands second reuses the first's rendering (BOB #22, 2026-09-21)
milestone: M9
interface: I3 consumer (REC-161's IC).
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 clause (c), with DEC-69: inform once, at the act.
depends-on: REC-161.
scope: the read-back names each shared origin between the parts it lists, once, before the answers are written; it prefills nothing, refuses nothing, shows no strength and no AND/OR word.
accepts-when: two correlated reasons show their origin and the member's answers are written unchanged. How a liar passes it: blocking or reordering the answers on a shared origin, which turns an informing fact into a gate.
added: 2026-09-21 · SCHEDULER #7 (BOB #22's inbox entry, drained this commit; `node tools/mintid.mjs UI`).

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

### D-260 · queued — **A WOKEN RUN IS NOT RE-ENTERED: FL-4's wake has nothing to consume it.** When the daemon completes a capture a run waited on, the plane holds the run's lease, logs that the daemon answered and stamps `run_woken_at`; nothing dispatches the run, because `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`. RULED by BOB #22 (SCHEDULER #5's Q3): an instance may hold ONE organisation-principal `ai` credential and resumes ONLY the runs it opened. — owner RECORD with FLEET, then DIST.
order: a feature after the rows Bob's priorities ordered (UI-71), above D-126: FL-4's wake and DS-3's and FL-6's halves are BUILT and inert until this caller exists, and I8 leaves PROVISIONAL when it lands (SCHEDULER #7, 2026-09-21)
milestone: M9
interface: I8 (leaves PROVISIONAL); the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6, the D-260 paragraph; the deploy half, `docs/architecture/BIO_Distribution_v0_1.md` §6's bullet. A member-principal run's non-resumption is the stated limitation there.
depends-on: none — FL-4, `instanceClaudeToken` (`src/tokens.mjs`, DS-3 `2de6f25f`) and FL-6's member half are on `main`.
scope: (1) RECORD with FLEET: FL-4's wake dispatches a woken run to `agent-worker` with the organisation credential ONLY when its stamped principal equals the run's `principal_plane`, and otherwise logs that it did not; the dispatch hands `claude_accounts` its instance level. (2) DIST, after 1: install and update carry that credential as a secret, as `DAEMON_TOKEN` is, never in the record, denylisted by `tokens.mjs` on publication.
accepts-when: a run the instance credential opened resumes after its capture completes; a member's run is not dispatched and says so. How a liar passes it: dispatching every woken run and leaning on REC-152 to refuse the tick, so the arm asserts the member's run is never DISPATCHED.
added: 2026-09-21 · SCHEDULER #7 (LED-7; BOB #22's ruling, drained this commit; keeps its `D-` id).

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

### D-394 · queued — **A MEMBER WHOSE CASE RESTS ON A PASSAGE IS NEVER TOLD A NEWER VERSION OF ITS DOCUMENT EXISTS.** A refreshed capture's content rows relate to the old ones by nothing. Framework §18.1 splits the question: *a newer version exists* is answerable TODAY with certainty (`op=versionchain`); *which passage survives* is a candidate at best. Re-extraction of the SAME bytes is built and correct (REC-82). — owner RECORD.
order: with the M4 product rows, after REC-122: a gap and not an over-claim (§18.1 says so, which is why no instrument catches it), resting on built substrate — the chain (PL-10) and REC-82's carry (SCHEDULER #6, 2026-09-21, LED-7 batch 12)
milestone: M4
interface: I3 — a read-time answer the builder names; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 — lazily at READ, never at capture; an answer about a PAIR attached to nothing persistent; extent-match *"a SUFFICIENT signal for a candidate and never as evidence of identity"*, UNDETERMINED where it fails.
depends-on: none — `op=versionchain` and REC-82 are built.
scope: as §18.1 — where a cited content row's document has a newer capture at its address, the read says so with certainty and offers the extent-match candidate or UNDETERMINED; NOTHING is written, so a proposal cannot be mistaken for a re-pointing.
accepts-when: a leg citing a passage whose address gained a newer capture reads *a newer version exists* with its candidate or UNDETERMINED; leg, content row and edge are byte-identical before and after; a single-version document says nothing. How a liar passes it: persisting the candidate, so an arm asserts no table grew. NEGATIVE CONTROL: drop the chain lookup, and the newer-version arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 12; keeps its `D-` id).

### CAP-11 · queued — DEC-75 ENACTED, act 3 — the export step's CALIBRATION:
order: runnable since CAP-10 landed (M2 measurement); placement CONFIRMED as SCHEDULER's by BOB #15 (BOB #14's list governed rows added after it) (SCHEDULER, first order audit, 2026-09-18)
milestone: M2 — a measurement before a letter (CLAUDE.md: measure, do not assume)
interface: none — a measurement; if the calibration record needs a home in the chain, that is CPDF-13's calibration shape, reused
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.3 (the content-axis staleness rule — when a calibration goes stale) and §16 (the Drive paragraph DEC-75 was folded into); DEC-75's answer is what makes the calibration the act that raises the cap; D-351 (the byte-instability half already taken: `.ods` `content.xml` byte-identical across three exports, `.odt` differing by one style name)
depends-on: CAP-10
accepts-when: MEASUREMENTS.md carries the per-format table with N, instrument, command and blind spots; the row records the proposed cap per format with its evidence; `node tools/gates.mjs` green (class DOCS unless a script lands); plancheck --local 0 fail.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «CAP-11». A worker READS IT before building.

### D-351 · queued — **A GOOGLE DRIVE EXPORT IS NOT BYTE-STABLE, SO ITS `capture_sha` DIFFERS ON EVERY RE-FETCH OF AN UNCHANGED DOCUMENT, AND THREE MECHANISMS GO QUIET OR CRY WOLF:** C-18.3's corroboration fold never fires; the normalised arm cannot rescue it (an ODF container is never read as text, so `digests.determined` is null); and `resolveLinks`' identity bracket never fires, so a monitoring tick reports a CHANGE on every re-fetch. CAP-8 measured three exports, three shas. — owner CAPTURE.
order: after CAP-11, which calibrates the same export step and cites this measurement: the record says LESS than it could, never more, and CAP-7 counted the population small — 22 distinct Drive targets in COFF-6's whole census (M-13) (SCHEDULER #6, 2026-09-21, LED-7 batch 13)
milestone: M2
interface: I1 — §4c's `digests.determined`, gated today on `profiled_from_text`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §5 (a document's anatomy: regions and digests), with `docs/development/DOCUMENT-PROFILES.md` §"Three digests, not one".
depends-on: none — CAP-8's Drive capture is built.
scope: an EVIDENTIARY digest for the office/ODF path, normalised over the CONTAINER and not decoded text — `content.xml`, which the `.ods` measurement shows stable — produced in the acquire path; `capture_sha` stays the envelope's, the trust root. `.odt`'s per-request style names must be normalised out, and that is a MEASUREMENT before a build: state it, or split `.odt` out.
accepts-when: three exports of one unchanged `.ods` agree on the evidentiary digest while their `capture_sha` differ, and C-18.3 folds them; a changed cell moves the digest. How a liar passes it: an envelope digest with timestamps stripped, which agrees for free — so a real content change must move it. NEGATIVE CONTROL: digest the envelope again, and the three-exports arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 13; keeps its `D-` id).

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

### D-50 · queued — **PROJECT NAME UNIQUENESS IS ENFORCED AT THE WRITE PATH AND NOT IN THE CHECK CATALOG, SO A CORPUS HANDED IN FROM ELSEWHERE CANNOT BE JUDGED FOR IT.** `store.mjs` refuses `NAME_TAKEN` by `Store.projectNameKey` at the write, and no `bio-checks` check reports two projects whose names collide, which is what the conformance path is for. — owner RECORD.
order: with the lower product rows, after CPDF-3: nothing can be WRITTEN wrong, because the write path refuses; this is the conformance half, lower than the write path by the row's own words (SCHEDULER #7, 2026-09-21, LED-7)
milestone: M7
interface: I3 — a catalog check; the integrator classifies any IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §11 item 8, *"Project name uniqueness enforced in the check catalog and at the write path"*, with §7.1's rule: case-insensitive, whitespace-collapsed, across deactivated projects.
depends-on: none.
scope: a catalog check over a handed corpus naming every pair of projects whose `Store.projectNameKey` collide, deactivated ones included, IMPORTING that key function rather than copying it.
accepts-when: a fixture corpus with two projects differing only in case and spacing is reported by name; distinct names pass; a deactivated collider is still reported. How a liar passes it: a second normaliser that agrees on the fixture, so the check imports `projectNameKey`. NEGATIVE CONTROL: compare raw titles instead of the key, and the case-and-spacing arm fails by name.
added: 2026-09-21 · SCHEDULER #7 (LED-7; D-50's DEBT row of 2026-07-26; keeps its `D-` id).

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

### D-40 · queued — **AN INFORMATION FIXTURE STILL WRITES `criticality: "notable"`, WHICH C-2.7 REFUSES, THOUGH ITS ROW SAID IT WAS FIXED.** The catalog's enum is `crucial` or `supporting`; `bio-plane/test/cite-scale.mjs`'s `infoMeta` has built every Information bundle with `notable` since `8c7e7178` (2026-07-25), and D-40's disposition listed that file as fixed. `retrieval-scale.mjs`, `search.test.mjs` and `selection.test.mjs` use `notable` DELIBERATELY as facet and filter DATA, and nothing at those sites says so. — owner M0.
order: with the probe corrections, after M0-91: a fixture non-conformant for a reason unrelated to what it measures, and a template a later session can copy; no suite is wrong today (SCHEDULER #7, 2026-09-21, LED-7)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with CLAUDE.md §5's *break only the thing*: a fixture illegal for an unrelated reason is a second variable.
depends-on: none.
scope: `cite-scale.mjs`'s `infoMeta` writes `supporting`; each deliberate DATA use gets a dated comment at its site saying the illegal value is facet data, never a template. No assertion moves.
accepts-when: `cite-scale.mjs` builds only conformant Information (C-2.7 passes over its bundles), and each of the three data sites carries its comment. How a liar passes it: changing the facet DATA too, which rewrites assertions to fix a fixture, so those suites' tallies stay byte-identical.
added: 2026-09-21 · SCHEDULER #7 (LED-7; D-40's DEBT row of 2026-07-25, re-measured; keeps its `D-` id).

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

### D-207 · queued — **A SESSION LOG ENTRY THAT `op=cite` WROTE OVER A SELECTION THAT SWAPPED AT A CONSTANT COUNT, BEFORE REC-55, IS SILENT ABOUT THE DRIFT — and silence there reads as *the set had not moved*.** REC-55 fixed it forward, and the Session Log is append-only, so any such entry is still in the record. Nobody has looked. — owner VERIFY (M0).
order: with the live verifications, after VF-7: a READ that bounds a possible over-claim in the record; the population is fixed — REC-55 is on every serving build — so waiting does not grow it (SCHEDULER #6, 2026-09-21, LED-7 batch 11)
milestone: M0
interface: none — read ops only
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` I-5 (the Session Log is append-only) — why a found entry is Bob's and is never annotated here.
depends-on: none.
scope: sweep the live record's Session Logs for `op=cite` entries over a `kind:"query"` selection written before REC-55's deploy, and judge each: drifted at a constant count, did not drift, or UNDETERMINED where the selection at mint is not recoverable — stated, never guessed. READ ONLY, the record's counters read before and after as the witness (CLAUDE.md §5).
accepts-when: the sweep reports its population and each verdict with the counters unchanged; a drifted entry goes to BOB as doctrine (may an append-only record be annotated?) and nothing is written. How a liar passes it: sweeping scratch, where nothing old lives — so the store read is named, and it is the record the entries live in.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 11; keeps its `D-` id).

### D-92 · queued — **`op=file` WITH A MEMBER TOKEN RETURNED AN INTERMITTENT 403 UNDER SEQUENTIAL LOAD** (the live instance, July): a different bundle each pass, so not a permission boundary; a 403 reads as a refusal where a rate limit is a 429, and it nearly produced a false finding that eleven bundles had no recorded source. The row's fix — the response NAMES its cause — waits on knowing the cause. — owner VERIFY (M0).
order: last of the live verifications, after D-207: a July observation on a plane rebuilt many times since, with no report of recurrence; a bounded measurement that names a cause or retires the claim (SCHEDULER #6, 2026-09-21, LED-7 batch 11)
milestone: M0
interface: none — a probe; a fix it finds is its own row
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with CLAUDE.md §5: *a blocker is a claim — about ONE actor, ONE form, ONE moment*. This one is from July.
depends-on: none.
scope: a BOUNDED live probe in the scratch namespace — `store=scratch` named on every call, swept after — driving `op=file` with a member token under sequential load over at least the row's eleven bundles; record in `MEASUREMENTS.md` whether a 403 recurs and which `index.mjs` site answered, with the serving build named. A cause found becomes a new row with its fix; none found closes this one as not reproduced at that build, stated.
accepts-when: `MEASUREMENTS.md` carries the probe with its load, its count and the build; the row closes either way. How a liar passes it: a probe lighter than July's, so the load is stated beside the row's.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 11; keeps its `D-` id).

### D-59 · queued — **`contemporaneous`, THE STRONGEST LINK-FIDELITY VERDICT, HAS NEVER BEEN OBSERVED ON REAL DATA, AND MAY BE UNREACHABLE FOR MOST OF WHAT BIO CAPTURES.** It needs one set of bytes observed on both sides of a retrieval (`observations > 1` on one `captured_locators` row); on 2026-07-30 two captures of Legistar's `Legislation.aspx` twelve minutes apart gave two different hashes (per-response viewstate). No measurement since records the verdict firing (`MEASUREMENTS.md` searched 2026-09-21). — owner VERIFY.
order: with the live verifications, after D-92: a measurement deciding whether a verdict arm earns its complexity, not a defect shipping, since `undetermined` is honest meanwhile (SCHEDULER #7, 2026-09-21, LED-7)
milestone: M3
interface: none — a probe
design: `docs/development/LINK-FIDELITY.md`, which defines the verdict and names the establishing routes that do not rest on byte identity: a timestamp token, a third-party archive, monitoring across the interval.
depends-on: none.
scope: a BOUNDED live probe in the scratch namespace, `store=scratch` named on every call and swept after: each of N named hosts' pages captured twice at an interval, recording per host whether the bytes repeat (the bracket can fire) or differ (it cannot), with the serving build named in `MEASUREMENTS.md`. Whether the bracket arm stays goes to BOB with the figure.
accepts-when: `MEASUREMENTS.md` carries the per-host table with N, the interval and the build; the row closes either way. How a liar passes it: hosts chosen for static bytes, so the list includes the municipal ASP.NET class the row measured.
added: 2026-09-21 · SCHEDULER #7 (LED-7; D-59's DEBT row of 2026-07-30; keeps its `D-` id).

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
