# The backlog's tail — the same order, continued

`docs/development/BACKLOG.md` holds the head of the order, within its budget; this file holds the REST of the same
order, and its first row comes directly after `BACKLOG.md`'s last (`docs/development/WORK-PIPELINE.md` §2). It is
LOOKED UP, never read whole: find any row with `node tools/ledger.mjs find <ID>`. Rows arrive and leave only by
tool: a placement that puts `BACKLOG.md` over its budget moves whole rows from its foot to the head of this file,
and a refill or any later write moves them back as room frees (`tools/ledger.mjs` `planRebalance`). No row is
ever cut to fit. No whole-file budget; a row is held to 2 KiB, as in the backlog.

## Rows

### M0-76 · queued — `d280-strengthbar.control.mjs` READS NOT AS DECLARED ON EVERY RUN (arm C2 and the severedhomes arms), and D-280's site (a) — the … (whole text: the cut archive)
order: M0, with the instrument corrections; ruled by BOB #16 (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — a control driver and one suite's arm
design: `docs/development/VERIFICATION.md` (admitted for M0 by name; its one-copy rule), with D-267 and D-280 … (whole text: the cut archive)
depends-on: none.
accepts-when: `node bio-plane/test/d280-strengthbar.control.mjs` reads EVERY arm AS DECLARED and the site-(a) arm fails by name; the control leaves the tree byte-identical; the C-6.1 … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-76» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-69 · queued — A WHOLE-STORE PURGE OF THE SCRATCH STORE CLEARS THE IDENTITY TABLES; A PURGE OF THE RECORD STORE NEVER DOES, structurally (BOB … (whole text: the cut archive)
order: M0, after the battery tally and M0-68: a live verification whose scratch keeps member rows stops measuring the same subject twice (SCHEDULER, 2026-09-19)
milestone: M0 (a live verification that stops measuring the same subject twice is the verification defect)
interface: I3 — behaviour at scratch only; an IC if the op's published answer changes (the integrator classifies)
design: `docs/architecture/BIO_Distribution_v0_1.md` §6 rung 6, "What 'swept after' means" (BOB #16, folded … (whole text: the cut archive)
depends-on: none in code.
accepts-when: a scratch purge leaves every enumerated identity table empty; a record-store purge driven through the op leaves `members` byte-identical; a new member-keyed table added to the … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-69» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-70 · queued — **VF-4's LIVE-SCRATCH INSTRUMENT STATES ON ITS OWN OUTPUT THAT ARM 2a LEAVES A `proposed` MEMBER BY DESIGN (Membership v2 §4.7)** … (whole text: the cut archive)
order: M0, after M0-68 and M0-69: the same instrument file as M0-68, and its purge-after rests on M0-69 (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — the instrument `bio-plane/test/vf4-live-scratch.mjs`
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.7 (administrator consensus) and … (whole text: the cut archive)
depends-on: M0-69 (the purge must take scratch identity) and M0-68 (SAME FILE — one worker at a time in `vf4-live-scratch.mjs`).
accepts-when: a run's output carries the statement at arm 2a; after the run, scratch `members` reads empty; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: a purge call … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (BOB #16's inbox entry, item 3; id minted with `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-70» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### VF-7 · queued — CANNOT RUN until the next DIST deploy; queued now so the future act is an ITEM the deploy's integration meets, not a telling a … (whole text: the cut archive)
order: M0 VERIFY lane, after the battery tally: it watches a credential class (DEC-43's zero), now a read-back since the 0.58.0 deploy armed it (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (VERIFY lane, holds no slot)
interface: none — it watches, it does not publish a shape
design: `docs/development/SCHEDULER.md` §"The mechanism, and how the next consumer joins" (the … (whole text: the cut archive)
depends-on: **the next plane deploy through `deploy.mjs`** (DIST's next cut — D-297's release is the likely carrier)
accepts-when: (on the deploy landing) both first activations measured and recorded with the serving build named; the first armed tick attributed to the scoped class; `op=audit` clean after … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «VF-7» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-92 · queued — **`op=file` WITH A MEMBER TOKEN RETURNED AN INTERMITTENT 403 UNDER SEQUENTIAL LOAD** (the live instance, July): a different … (whole text: the cut archive)
order: last of the live verifications, after D-207: a July observation on a plane rebuilt many times since, with no report of recurrence; a bounded measurement that names a cause or retires the claim (SCHEDULER #6, 2026-09-21, LED-7 batch 11)
milestone: M0
interface: none — a probe; a fix it finds is its own row
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with CLAUDE.md §5: *a blocker is a … (whole text: the cut archive)
depends-on: none.
accepts-when: `MEASUREMENTS.md` carries the probe with its load, its count and the build; the row closes either way. How a liar passes it: a probe lighter than July's, so the load is stated beside the row's.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 11; keeps its `D-` id).
cut: cut to its fields (SCHEDULER #8, 2026-09-21) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-92» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-59 · queued — **`contemporaneous`, THE STRONGEST LINK-FIDELITY VERDICT, HAS NEVER BEEN OBSERVED ON REAL DATA, AND MAY BE UNREACHABLE FOR MOST** … (whole text: the cut archive)
order: with the live verifications, after D-92: a measurement deciding whether a verdict arm earns its complexity, not a defect shipping, since `undetermined` is honest meanwhile (SCHEDULER #7, 2026-09-21, LED-7)
milestone: M3
interface: none — a probe
design: `docs/development/LINK-FIDELITY.md`, which defines the verdict and names the establishing routes that … (whole text: the cut archive)
depends-on: none.
accepts-when: `MEASUREMENTS.md` carries the per-host table with N, the interval and the build; the row closes either way. How a liar passes it: hosts chosen for static bytes, so the list … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (LED-7; D-59's DEBT row of 2026-07-30; keeps its `D-` id).
cut: cut to its fields (SCHEDULER #8, 2026-09-21) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-59» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-66 · queued — `m025-arm-anchor-witness.test.mjs` CLOSES THE COMMENTARY CLASS ON ITS LABEL HALF AND NOT ON ITS ANCHOR HALF — prose in a … (whole text: the cut archive)
order: M0; an instrument producing false findings (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot) — an instrument that penalises a driver for documenting how it … (whole text: the cut archive)
interface: none — `bio-plane/test/m025-arm-anchor-witness.test.mjs`
design: `docs/development/VERIFICATION.md` — the test estate's own authority, admitted for the M0 lane BY … (whole text: the cut archive)
depends-on: none
accepts-when: prose in a block comment naming an anchor-bearing shape is NOT read as an anchor; a live anchor in code still is; the reach figures before and after are stated with any … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-66» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-64 · queued — M0-41's CONTROL ARM 3 NO LONGER HAS A SUBJECT:
order: M0; a control arm proving less than it declares (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot) — an arm that measures something other than what it declares … (whole text: the cut archive)
interface: none — `bio-plane/test/m041-instrument-census.control.mjs` (a `.control.mjs`, not discovered by the battery)
design: `docs/development/VERIFICATION.md` — the test estate's own authority, admitted for the M0 lane BY … (whole text: the cut archive)
depends-on: none
accepts-when: the control's run reports every arm AS DECLARED, or arm 3 is RETIRED with the falsifier's measurement at the site; the planted id uses the target's real heading shape; arms 1 … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-64» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-44 · queued — FLIPPED TO `running` AND REVERTED WITHIN THE HOUR, 2026-09-17, by CONDUCT #1, and the reversal is recorded rather than silently undone.
order: M0; seven truncated claims invisible to the bounds instrument (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot)
interface: none — a reader's pattern and the rosters derived from it; no plane source moves
design: `docs/development/VERIFICATION.md` — the test estate's own authority, admitted for the M0 lane BY … (whole text: the cut archive)
depends-on: none (M0-38 landed the grading and pinned the blind spot rather than fixing it)
accepts-when: each of the seven previously-invisible claims appears in a roster the instrument prints, or is named as out of reach with its reason; **every roster the widened pattern feeds** … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-44» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-33 · queued — D-353 RULED at M0-29's integration (CONDUCT #11, mechanism):
order: M0; a third census shape (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot) — the test estate's own instrument
interface: none — control drivers and the census only
design: `docs/development/VERIFICATION.md` §"A THROWING CONTROL DRIVER VALIDATES EVERY ANCHOR BEFORE IT ARMS ANYTHING (D-331, 2026-09-14)" … (whole text: the cut archive)
depends-on: none (M0-29 landed the sweep and its adjudication table)
accepts-when: the census reports the sweep's tally section (0 open candidates on the estate as landed, the three retired instances listed as adjudicated); one unadjudicated candidate … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-33» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### SK-5 · blocked — RE-STATED AT THE FIRST ORDER AUDIT (SCHEDULER, 2026-09-18):
order: blocked: no plane op publishes the surface registry (SCHEDULER, first order audit, 2026-09-18)
milestone: M9
interface: I3 — **it needs the plane to PUBLISH the surface registry, which nothing does today; that is the** … (whole text: the cut archive)
design: `docs/development/ASSISTANT-PILOT.md` §1 (the five-layer training pack — the **Recipes** row is this … (whole text: the cut archive)
depends-on: a published surface registry (unbuilt). **NOT schedulable until that exists** — recorded so the … (whole text: the cut archive)
accepts-when: (on unblocking) a recipe whose step names a surface or an op that does not exist **FAILS THE BUILD**; the pack's `absent_because` body is replaced by the layer rather than edited around.
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «SK-5» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

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
behind-interface: I3
depends-on: REC-14
accepts-when: (on waking) as `BUILD-ORDER.md` §2 (REC-15) plus — preflight reports `UNCLEARED_HUNCH` naming each hunch leg and … (whole text: the cut archive)
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33
cut: this row is cut to its fields (SCHEDULER #8, 2026-09-21, the backlog's 150 KiB budget); its full text, scope included, is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` under «REC-15». A worker READS IT before building.

### UI-17 · blocked
order: blocked: rests on REC-15 (SCHEDULER, first order audit, 2026-09-18)
milestone: M10
behind-interface: I3
depends-on: REC-15, UI-11
accepts-when: (on waking) as `RECONCILED.md` §3.1 (UI-17), including the Q5 negative control — any prior deferral/dismissal/severance … (whole text: the cut archive)
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33
cut: this row is cut to its fields (SCHEDULER #8, 2026-09-21, the backlog's 150 KiB budget); its full text, scope included, is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` under «UI-17». A worker READS IT before building.
