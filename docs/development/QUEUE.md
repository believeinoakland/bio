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

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 16 in all (`CACHE_ROWS`, sized to CONDUCT's capacity plus spare: Bob, 2026-09-23, `WORK-PIPELINE.md`). The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### D-351 · integrated — finished; integrated on land/conduct/c19-batch10 @ 1747d296 (IC-245, I1 1.9.0), waiting for its train — flipped by SCHEDULER #18
order: after CAP-11, which calibrates the same export step and cites this measurement: the record says LESS than it could, never more, and CAP-7 counted the population small — 22 distinct Drive targets in COFF-6's whole census (M-13) (SCHEDULER #6, 2026-09-21, LED-7 batch 13)
milestone: M2
interface: I1 — §4c's `digests.determined`, gated today on `profiled_from_text`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §5 (a document's anatomy: regions and digests), with `docs/development/DOCUMENT-PROFILES.md` §"Three digests, not one".
depends-on: none — CAP-8's Drive capture is built.
scope: an EVIDENTIARY digest for the office/ODF path, normalised over the CONTAINER and not decoded text — `content.xml`, which the `.ods` measurement shows stable — produced in the acquire path; `capture_sha` stays the envelope's, the trust root. `.odt`'s per-request style names must be normalised out, and that is a MEASUREMENT before a build: state it, or split `.odt` out.
accepts-when: three exports of one unchanged `.ods` agree on the evidentiary digest while their `capture_sha` differ, and C-18.3 folds them; a changed cell moves the digest. How a liar passes it: an envelope digest with timestamps stripped, which agrees for free — so a real content change must move it. NEGATIVE CONTROL: digest the envelope again, and the three-exports arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 13; keeps its `D-` id).
uncut: restored whole from «D-351» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### D-66 · integrated — finished; integrated on land/conduct/c19-batch10 @ cff0ede6 (M-126; its finding is D-481), waiting for its train — flipped by SCHEDULER #18
order: directly after FW-20, §2's order: row 5 after row 4, a count before any reader (SCHEDULER #10, 2026-09-21, LED-7)
milestone: M2
interface: none — a census class and a read sample; a reader they justify is its own row.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §2, row 5 (BOB #24, 2026-09-21): *"Its count and a read sample come first, with the census instrument gaining the class, and no reader is written from what a budget probably looks like."*
depends-on: none. Sequence after FW-20 (§2's order).
scope: the census instrument gains a budget-or-dataset class judged from BODIES, re-run over COFF-6's corpus with its stratum and seed stated; a fixed-seed read sample records what each document holds and whether a spreadsheet is already read by the office entries. No content type is written here. **FULL GATE PROFILE** (`tools/`).
accepts-when: `MEASUREMENTS.md` carries the class's count with its interval beside the four measured classes, and the read sample with N and what each held, dated with the instrument. How a liar passes it: counting by filename, which §2 measured recovering 13% of staff reports, so the class is judged from bodies.
added: 2026-09-21 · SCHEDULER #10 (LED-7; D-66's DEBT row, narrowed by BOB #24 on SCHEDULER #9's Q3; keeps its `D-` id).
uncut: restored whole from «D-66» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### REC-188 · integrated — finished; integrated on land/conduct/c19-batch10 @ 1d8b7cda (IC-256, I3 83.1.0), waiting for its train — flipped by SCHEDULER #18
order: directly after REC-187: a correction to just-landed work (D-84, D-150); DEC-20's *disclosed* holds only if the gate refuses the absence (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 — the case document format becomes `bio-case-document/3` (additive, a newly REQUIRED key); /2 and /1 stay accepted; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"The bias acknowledgement, authored at export", with `docs/architecture/BIO_Publication_v0_1.md` §3 rules 11 and 12; the bump CONFIRMED by BOB #31 (22:03Z) and widened by BOB #32 (22:26Z): *ONE format bump carries both requirements.*
depends-on: D-84 (c17-batch4), D-150 (c17-batch7), both `integrated`.
scope: `op=publish` writes `bio-case-document/3`; a new C-41 check (mint its C-number) refuses a /3 document without the `bias_manifest` map or without `completeness.acknowledged` and its list; /2 and /1 keep ratifying as written. Extend `bio-plane/test/d84-case-manifest.test.mjs`.
accepts-when: a /3 document lacking `bias_manifest`, and one lacking the acknowledgement list, is each refused by the new C-41 check by name; a /2 document without it still ratifies; a published case reads /3. NEGATIVE CONTROL: drop the new check's push, and the "/3 without a manifest is refused" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs REC`).

### REC-189 · integrated — finished; integrated on land/conduct/c19-batch10 @ e0b9f887 (BOB's F2 ruling paid at 98db41cb, C-32.18 renumbered C-32.19; IC-249, I3 83.0.0 MAJOR), waiting for its train — flipped by SCHEDULER #18
order: after REC-188, ahead of the features: a correction to just-landed work (D-182) on the field BOB #21 ruled carries legal exposure; UI-85's chooser follows it so the fence and the member path arrive together (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:48Z finding (1), verified at c17-batch5 @ 74fc2e25)
milestone: M10
interface: I3 additive — a new refusal code, registered in `affordances.mjs`'s refusal table beside `actionmove`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, `risk_tier` RULED 2026-09-21 by BOB #21 (*"Only a member's authored act sets 1, 2 or 3"*); the MACHINE_CANNOT_* precedent at `actionMove`.
depends-on: D-182 (the undetermined tier; `integrated` on c17-batch5).
scope: in promote's action block (not on replay), refuse MACHINE_CANNOT_SET_RISK_TIER when the author is a machine identity and the new tier is 1, 2 or 3 and differs from the previous version's; an unchanged carry-forward passes. Inside a DEC-49 region; a bio-checks entry beside the actionmove one. Extend `bio-plane/test/machine-fences.test.mjs`.
accepts-when: a machine credential's promote changing a tier to 2 is refused by name; a member's promote setting 2 and a machine's unchanged carry-forward are accepted. How a liar passes it: refusing every machine promote of an action, so the carry-forward arm must pass. NEGATIVE CONTROL: drop the machine-identity clause, and the "a machine credential cannot set risk_tier" arm fails by name while the member arm stays green.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs REC`).

### UI-85 · running — SPAWNED 2026-09-24 ~01:32Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER UI-85 (CONDUCT #19), base origin/main 15b2a4c0 (D-182 on main; REC-189 finished at land/worker/REC-189 @ 9d9919dd, not yet trained); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/UI-85 and that session; never conclude queued from the absence alone.
order: directly after REC-189, so the plane's fence and the member's only path to a tier land together; D-182's surface half (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:48Z finding (2), verified at c17-batch5 @ 74fc2e25)
milestone: M10
interface: I3 consumer (`op=affordances`'s `vocabularies.risk_tiers`); none new.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, `risk_tier` RULED 2026-09-21 by BOB #21 (*"A surface publishes those words … invents none"*).
depends-on: D-182 (`integrated` on c17-batch5); REC-189 placed earlier.
scope: a chooser in the action intake reading the published map, `undetermined` preselected and no numeric default; `mdFor` writes `risk_tier: <n>` only when the member chose one. Extend `civicos-ui/test/add-surface.test.mjs`.
accepts-when: a member picks tier 2 and `op=projection` reads 2 with the published words; an untouched chooser writes undetermined; the page shows only words the plane published. How a liar passes it: hard-coding the three words, so an identity arm swaps the published map and the page must follow. NEGATIVE CONTROL: default the chooser to 1, and the "an untouched chooser writes undetermined" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs UI`).

### UI-86 · integrated — finished; integrated on land/conduct/c19-batch10 @ c6b2043c, waiting for its train — flipped by SCHEDULER #18
order: after UI-85: a correction to just-landed work (D-125's plane half), a surface that now tells a member something untrue (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:43Z finding (4), verified at c17-batch4 @ 65205437)
milestone: M8
interface: I3 consumer (`op=queuemute`'s item form); none new.
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class" (BOB #26, 2026-09-22; D-170).
depends-on: D-125 (`integrated` on c17-batch4).
scope: FINDING kinds in the per-case control; a per-item mute sending `{item}`; the copy and the report cover item mutes and read `mute.items`; the superseded pin corrected in place with a comment saying why. Suites: `civicos-ui/test/notifications.test.mjs`, `queue.test.mjs`, `member-respect.test.mjs`.
accepts-when: a feed holding only a lead draws a mute that reaches `op=queuemute` as `{item}` and the suppression reads under `mute.items`. How a liar passes it: offering the control without sending the item form, so the arm reads the request body. NEGATIVE CONTROL: restore the CONDITION-only filter, and the "a FINDING is offered a mute" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs UI`).

### D-291 · integrated — finished; integrated on land/conduct/c19-batch10 @ d1283d0d (IC-247, I3 83.2.0), waiting for its train — flipped by SCHEDULER #18
order: after REC-205, with the M8 selection rows (SCHEDULER #17, 2026-09-23, LED-7 S17-4)
milestone: M8
interface: I3 — a selection path per act; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Interaction_Constructs_v0_1.md` §S "SELECTION-SCOPED ACTION — how any act goes bulk, safely" (named by BOB #32's ruling of 2026-09-23 23:30Z (cite until folded)).
depends-on: none.
scope: the plane's selection path for both acts under §S; the surfaces use it; strike the carry in ARM 4d.
accepts-when: bulk and single both reach the op in one motion, and ARM 4d's carry is struck. NEGATIVE CONTROL: a client-side loop, and the one-motion arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-4; keeps its `D-` id).

### D-461 · integrated — finished; integrated on land/conduct/c19-batch10 @ 8e593969 (IC-250, I3 82.0.0 MAJOR), waiting for its train — flipped by SCHEDULER #18
order: FIRST in the backlog, as D-456 was: a live verification that names scratch and writes the real record is a safety defect on the record itself (SCHEDULER #17, 2026-09-23; D-456's and D-447's workers via CONDUCT #18 00:05Z)
milestone: M0 (a guard at the plane's front door)
interface: I3 — a second refusal on the pinned ops; the integrator mints and classifies the IC.
design: `docs/development/VERIFICATION.md` (CLAUDE.md §5: NAME `store=scratch` ON EVERY CALL; D-325).
depends-on: D-456 (`integrated` on c18-d456).
scope: every op pinned to `bio` refuses `store=scratch` by name (preferred), or answers `store:"bio"` on every reply; enumerate the pinned ops from the OPS table.
accepts-when: `op=knock&store=scratch` is refused by name and `bio`'s counters are unchanged. NEGATIVE CONTROL: accept and ignore the parameter again, and the pinned-op arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).
note: 2026-09-24 by SCHEDULER #17 (BOB #32, 00:02Z): the rule of record is CLAUDE.md §5 "NAME `store=scratch` ON EVERY CALL" (D-325, at `scopeFor`); `VERIFICATION.md` stays the cited governed path only because the design check admits it (it has no budget for the rule). On landing, the worker checks §5's wording against the new behaviour and tells BOB if it needs correcting.

### D-464 · integrated — finished; integrated on land/conduct/c19-batch10 @ 6a218c59 (IC-254, I3 82.1.0), waiting for its train — flipped by SCHEDULER #18
order: directly after D-461: a disclosure defect, D-447's class, outranks every correction and feature (SCHEDULER #17, 2026-09-23; D-456's and D-447's workers via CONDUCT #18 00:05Z)
milestone: M8
interface: I3 — counts computed through the viewer; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.9: a project the caller cannot see answers exactly as one that does not exist).
depends-on: D-447 (`integrated` on c18-d456).
scope: every count served to a class other than the operator's is computed through the caller's `viewerPredicate`. Extend `bio-plane/test/project-sight.test.mjs`.
accepts-when: creating and revising a hidden project leaves a member's `op=stats` and `op=searchindexcheck` answers byte-identical. NEGATIVE CONTROL: count over the whole store again, and the hidden-creation arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-469 · integrated — finished; integrated on land/conduct/c19-batch10 @ 30c6159d, waiting for its train — flipped by SCHEDULER #18
order: at the head, behind the safety and disclosure rows: an over-claim in the record's own provenance, the class CLAUDE.md §2 ranks worse than a missing feature (SCHEDULER #17, 2026-09-24; CAP-11's worker via CONDUCT #19, minted D-469 after a D-459 collision)
milestone: M2
interface: I3 — `existed` becomes truthful on first acquire; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (one capture, one home), with M-123 §"A defect found on the way".
depends-on: none.
scope: take the `head()` inside `flush()` before the part is written (it already runs there as the write guard) and carry its answer out for the single-part case. Extend `bio-plane/test/acquire.test.mjs` with a first-acquire arm.
accepts-when: a first acquire answers `existed: false` and a second `existed: true`. NEGATIVE CONTROL: move `head()` back after `flush()`, and the first-acquire arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (CONDUCT #19 minted it through the coord minter).

### D-462 · integrated — finished; integrated on land/conduct/c19-batch10 @ 785da1c4 (IC-253, I8 2.0.0 MAJOR), waiting for its train — flipped by SCHEDULER #18
order: after D-464 (SCHEDULER #17, 2026-09-23; D-456's and D-447's workers via CONDUCT #18 00:05Z)
milestone: M0 (the fleet's side of the same guard)
interface: none — a fleet-side refusal.
design: `docs/development/VERIFICATION.md` (CLAUDE.md §5; D-325).
depends-on: D-456 (`integrated` on c18-d456).
scope: narrow `STORE_SHAPE` to `bio` or `scratch` with its own BAD_STORE refusal; correct the over-strictness arm.
accepts-when: `store=biosmoke` is refused by the worker by name. NEGATIVE CONTROL: widen the shape again, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### REC-192 · running — SPAWNED 2026-09-24 ~01:16Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER REC-192 (CONDUCT #19), base origin/main 15b2a4c0 (REC-161 on main); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/REC-192 and that session; never conclude queued from the absence alone.
order: after D-256: a correction to just-landed work (UI-74, REC-161) that moves a doctrine from a page's choice into the wire (SCHEDULER #17, 2026-09-23)
milestone: M9
interface: I3 additive — `partitionindependence` (REC-161) takes `version=<id>` and reads that stored version's legs through the same `#independenceOf`, returning no strength field; versionstrength's gate and viewer stamp kept. The integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 (Strength, clauses (a)–(c)) with DEC-32 clause 5, and BOB #31's ruling of 2026-09-23 22:22Z (cite it until folded).
depends-on: REC-161 (`integrated` on c17-batch5).
scope: the version arm on the independence read. Extend `bio-plane/test/partitionindependence.test.mjs`.
accepts-when: the version arm's answer carries no strength key and equals versionstrength's `independence` for the same version. NEGATIVE CONTROL: add a strength field to the version-arm answer, and the "no strength key" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (UI-74's worker finding via CONDUCT #17; `node tools/mintid.mjs REC`).

### REC-190 · running — SPAWNED 2026-09-24 ~01:43Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER REC-190 (CONDUCT #19), base origin/main 15b2a4c0 (D-179 on main), IC-251 pre-minted; gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/REC-190 and that session; never conclude queued from the absence alone.
order: after UI-86: the census that tells whether D-179's residue exists on a live record, before anything repairs it (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:43Z finding (6), verified at c17-batch4 @ 65205437)
milestone: M2
interface: I3 additive — one new admin/probe census op, `mutating:false`, REC-175's shape (proposed name homecensus); the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (*"ONE CAPTURE, ONE HOME — the ORIGINAL's"*). REPAIR of what it finds, and the digest-level duplicate (the same content in different bytes, §8's Incomplete note), are NOT in scope, by BOB #31's ruling of 2026-09-23 22:03Z (cite it until folded): *the census's report STANDS ALONE*; which bundle held a capture first is UNDETERMINED and the report says so; the digest-level duplicate is named as out of reach.
depends-on: D-179 (the fence; `integrated` on c17-batch4).
scope: list every `files`/`history` row whose sha the register assigns to a DIFFERENT, still-existing bundle, with both bundles named; never write. New suite `bio-plane/test/homecensus.test.mjs`, seeding a moved row at the store.
accepts-when: a store seeded with one moved row lists that sha under both bundles; a clean store lists none; the record's counters read before and after the call are unchanged. How a liar passes it: listing every multi-bundle sha including legitimate shares, so the clean-store arm must read none. NEGATIVE CONTROL: remove the different-bundle predicate, and the "displaced row found" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs REC`).

### D-64 · running — SPAWNED 2026-09-24 ~01:45Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER D-64 (CONDUCT #19), base origin/main 15b2a4c0, IC pre-minted; gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/D-64 and that session; never conclude queued from the absence alone.
order: with the M2 capture rows, behind its substrate (BOB #31, 22:22Z: *place the capture row behind its substrate*) (SCHEDULER #17, 2026-09-23, LED-7 S17-2)
milestone: M2
interface: I3 — a render arm on capture producing the pair, and the `render` provenance block; the integrator mints and classifies the IC.
design: `docs/development/CLIENT-RENDERED.md` §"What must be recorded on a rendered capture"; scripts ALLOWED AND RECORDED (BOB #31, 22:22Z); and BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *method `rendered`; one capture holds BOTH artifacts with the RENDERED document PRIMARY and the shell beside it under its own digest; an unattended sweep MAY render within the daily render allowance and through the governor, recording DEFERRED (undetermined) when spent — never the shell as content.*
depends-on: 2.capture (BUILT); the Browser Rendering binding is NOT built and is this row's first act.
scope: the render arm writes one capture: the rendered document (method `rendered`, primary) and the shell (its method and digest), joined by `render.of`, with the `render.*` fields and `third_party_executed`; the sweep's deferral. New suite `bio-plane/test/rendered-capture.test.mjs`.
accepts-when: a rendered capture of a shell holds both artifacts and names every script origin executed, or says undetermined. NEGATIVE CONTROL: force `determined` on a page drawing data from a second origin, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; D-64's DEBT row of 2026-07-30; keeps its `D-` id).

### UI-83 · running — SPAWNED 2026-09-24 ~01:48Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER UI-83 (CONDUCT #19), base origin/main 15b2a4c0 (D-128 on main via c17-batch3); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/UI-83 and that session; never conclude queued from the absence alone.
order: directly after D-443, first of the D-128 follow-ons: a surface that answers a member's act with a refusal it gives them no field to meet is a correction to just-landed work, which outranks new work (SCHEDULER #16, 2026-09-23; D-128's worker via CONDUCT #17)
milestone: M8
interface: I3 consumer (D-128's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2, "The declared flow, and its revisions" (BOB #27, 2026-09-22), the ruling D-128 built.
depends-on: D-128 (on `land/conduct/c17-batch3`).
scope: the progression form offers, when revising an existing progression, a basis-statement field and a citation field, and sends both; a refusal still reads through `refusalWords(r)`.
accepts-when: `civicos-ui/test/` gains a suite arm driving a revision through the form with both fields to a landed version, and one without either reading the canned refusal; the UI harness green. NEGATIVE CONTROL: drop the citation field, and the revision arm reads `NO_CITATION` and fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-128's worker's finding via CONDUCT #17, verified on the batch; `node tools/mintid.mjs UI`).

### REC-184 · running — SPAWNED 2026-09-24 ~02:12Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER REC-184 (CONDUCT #19), base origin/main 15b2a4c0, IC pre-minted; gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/REC-184 and that session; never conclude queued from the absence alone.
order: directly after UI-83, the same D-128 follow-on: a decision the record applies to a definition nobody judged is the record claiming more than it supports (CLAUDE.md §2) (SCHEDULER #16, 2026-09-23; D-128's worker via CONDUCT #17)
milestone: M4
interface: I5 — a `definition_version` column on `proposal_dispositions`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2, "The declared flow, and its revisions" (BOB #27), the ruling D-128 built.
depends-on: D-128 (on `land/conduct/c17-batch3`).
scope: `op=proposedispose` writes `definition_version`; a read against a later version does not treat an earlier-version disposition as current, stated; rows written before read `not recorded`; the stats counters count the version tables.
accepts-when: `bio-plane/test/proposedispose.test.mjs` gains an arm: a disposition under version 1 does not apply under version 2, and the column reads back. NEGATIVE CONTROL: stop writing the version, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-128's worker's finding via CONDUCT #17, verified on the batch; `node tools/mintid.mjs REC`).

### D-486 · queued — **A HIDDEN PROJECT'S RUNS MOVE COUNTS SERVED OUTSIDE ITS SIGHT: `#counts`, the frontier readers, and the run side of proposedReadings, inquiryRunSurfacings and captureRequests tally rows whose `authority_kind='run'` came from a run over a hidden project, so the tally discloses that the project exists.** Found by D-464's worker (finding 1). — owner RECORD.
order: after D-480, the same disclosure class at the head (BOB #32, 02:30Z: *"Row it as disclosure-class, beside D-480 at the head"*; SCHEDULER #18, 2026-09-24)
milestone: M8
interface: I3 — the served counts subtract; shapes unchanged.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.9), with BOB #32's ruling of 2026-09-24 02:30Z (cite until folded): a hidden project's run output is the PROJECT'S THINKING until something outside uses it; the bytes stay shared, only the run's attribution is withheld. `OBSERVATION-LOG-DESIGN.md` §6 ties the readers.
depends-on: none.
scope: one predicate excluding run rows whose context is a hidden project from every tally a caller outside its sight reads, all five readers together.
accepts-when: a run over a hidden project leaves each reader's answer to an outsider unchanged. NEGATIVE CONTROL: drop the predicate from one reader and its arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-470 · queued — **THE RATIFICATION STAMP CANNOT TELL WHICH CATALOG JUDGED A CASE: `gate.mjs` `CATALOG_VERSION` still reads "1.20.0" after dozens of added checks, so `plane-gate/1.0 (bio-checks 1.20.0)` names the same catalog for documents judged by different rules.** Read at the code on `main`. — owner RECORD.
order: after D-469, at the head: a signed record that claims more precision than it holds (SCHEDULER #17, 2026-09-24; REC-188's worker via CONDUCT #19)
milestone: M10
interface: I3 — the stamp's version moves; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 (the case document's gate stamp), following REC-14's version-bump precedent.
depends-on: none.
scope: bump `CATALOG_VERSION` MINOR now; add a suite pinning the version to the catalog's check census, so an added check fails until the version moves.
accepts-when: the stamp reads the new version, and adding one check without a bump fails the pin by name. NEGATIVE CONTROL: add a check without moving the version, and the census-pin arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-482 · queued — **REC-59's HELPER-ARM MATCHER IN `bounds.test.mjs` IS OVER-STRICT: `callSites`' id pattern `(?:^|[?&,{\s])id[=:}]` does not see an id arm spelled `"id=" + x`, so correct work reads RED.** Found by UI-85's worker. — owner M0.
order: after D-481: an instrument that fails correct work costs every lane gate time (SCHEDULER #18, 2026-09-24; via CONDUCT #19 02:24Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register".
depends-on: none.
scope: add `"` and `'` to the class in `callSites`; add an over-strictness arm reading a quoted `"id=" + x` site as `id`.
accepts-when: the new arm passes. NEGATIVE CONTROL: drop the quotes from the class and that arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### M0-141 · queued — **WORKER.md's "Before you finish" HAS NO CORPUSCHECK STEP FOR A GOVERNED DESIGN DOC, so a worker who edited one meets its FIRST full gate RED on `status.test`/`corpuscheck` ("the real corpus on this tree is current") over a stale Status `as of`.** Measured 2026-09-24 in REC-192, D-461, D-351, D-64, UI-83 and REC-188: one wasted full-gate round each, ~10–20 min. — owner CONDUCT (the kickoff family).
order: after D-482, with the rows that cut gate time (product before process, Bob 2026-09-22: a process row that cuts gate time may sit near the head; SCHEDULER #18, 2026-09-24; via CONDUCT #19 02:31Z)
milestone: M0
interface: none — prose.
design: `docs/development/VERIFICATION.md` (a gate verdict measures the tree; the corpus check is part of it).
depends-on: none.
scope: one line in `docs/development/kickoffs/WORKER.md` "Before you finish": edited a governed design document (`docs/architecture/*`, or `docs/development/*` with front matter)? Move its Status `as of` to today and run `node tools/corpuscheck.mjs` to 0 fail BEFORE the gate.
accepts-when: the line is on `main`; the next worker's first gate is not RED on corpuscheck. NEGATIVE CONTROL: none (prose).
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### D-487 · queued — **`doorbell.test.mjs` FAILS WHEN ITS RUN CROSSES A 10-MINUTE BOUNDARY: `op=knock`'s window is a FIXED bucket read off the wall clock (`Math.floor(Date.now() / KNOCK.windowMs)`, `index.mjs`), so a rollover between the 13th and 14th knock fails "one source gets twelve and no more" and "refusal is a 429, not a 500".** A clock-edge bug, not a flake: REC-190's gate went RED once and passed alone on the same tree. — owner the plane estate.
order: after M0-141, with the rows that cut gate time: a suite that fails correct work by the clock costs a full-gate round (SCHEDULER #18, 2026-09-24; via CONDUCT #19 02:42Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a printed failure is a failure; a suite's verdict must not depend on the wall clock).
depends-on: none.
scope: the suite waits past a bucket edge before its run, or the window reads an injectable clock under test; the limiter itself is unchanged. Whether it should be a sliding window is a separate design question, not this row.
accepts-when: the suite passes with its run started seconds before a bucket edge. NEGATIVE CONTROL: remove the edge guard, start the run just before a rollover, and the twelve-knock arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### UI-84 · queued — **THE UI's MOCK REFUSALS FOR `verify` AND `unknown op` CARRY NO `translation`, WHILE THE LIVE WIRE NOW DOES (C-61.1, C-69.1, D-278), AND `refusalWords` RENDERS THE TRANSLATION FIRST — SO THE MOCKS ARE NARROWER THAN THE WIRE (the M-72 class).** Found in `civicos-ui/test/preauth-vocabulary.test.mjs` and sibling mocks; re-read on `land/conduct/c17-batch3` @ `d93d29c4`. — owner UI.
order: after REC-184, with the D-278 follow-ons: a suite that pins what a member reads against a mock narrower than the wire can pass while the member reads something else, a correction to just-landed work (SCHEDULER #16, 2026-09-23; D-278's worker via CONDUCT #17)
milestone: M8
interface: none (test mocks); the integrator classifies.
design: DEC-49 (`node tools/decided.mjs "DEC-49"`) as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it: every condition has a named code and a canned translation.
depends-on: D-278 (on `land/conduct/c17-batch3`).
scope: every mock refusal for `verify` and `unknown op` carries `translation`, imported from `bio-checks.mjs` (never retyped); DEC-49's SUBJECT arm in `preauth-vocabulary.test.mjs` re-pinned with the movement stated (old and new figures and why).
accepts-when: `civicos-ui/test/preauth-vocabulary.test.mjs` and `refusal-translation-surface.test.mjs` green with the imported translations; the UI harness green. NEGATIVE CONTROL: drop `translation` from one mock, and the SUBJECT arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-278's worker's finding via CONDUCT #17, verified on the batch; `node tools/mintid.mjs UI`).

### REC-185 · queued — **`op=purge`'s `purge requires confirm=<store>` (a 400 in `index.mjs`) IS STILL A BARE SENTENCE WITH NO CODE — the last of D-278's class the sweep could see.** Re-read on `land/conduct/c17-batch3` @ `d93d29c4`: `json({ ok: false, error: "purge requires confirm=<store>", … })`. UNDETERMINED, stated by the worker: its matcher sees only `json({ok:false…})` literals in `index.mjs`, not the 16 codes forwarded through a spread from the store, nor refusals built without `json()`. — owner RECORD.
order: directly after UI-84, the same D-278 class: a refusal with no code a member cannot be told in words (CLAUDE.md §2) (SCHEDULER #16, 2026-09-23; D-278's worker via CONDUCT #17)
milestone: M7
interface: I3 — `op=purge`'s refusal gains a code through `requiredArgument`; the integrator classifies the IC.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, with D-278's landed `requiredArgument` as the precedent.
depends-on: D-278 (on `land/conduct/c17-batch3`).
scope: the refusal is `requiredArgument("purge", "confirm", "<store name>", …)`; the sweep's two blind spots (spread-forwarded codes, refusals built without `json()`) are measured and each listed or coded.
accepts-when: `bio-plane/test/refusal-wire.test.mjs` gains an arm: `op=purge` without `confirm` answers the coded refusal with its canned translation, through the op. NEGATIVE CONTROL: restore the bare sentence, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-278's worker's finding via CONDUCT #17, verified on the batch; `node tools/mintid.mjs REC`).

### D-479 · queued — **REC-149's PROJECT DIRECTORY LISTS EVERY PROJECT UNPAGED, READING SIGHT AND TITLE PER ROW, AND PUBLISHES NO BOUND: a large instance's directory is unbounded work, and nothing says the list could be cut.** Found by c19-unionfix. — owner RECORD.
order: after D-476, with the corrections to just-landed work: an unbounded read on a member-facing list (SCHEDULER #17, 2026-09-24; via CONDUCT #19)
milestone: M8
interface: I3 additive — `limit` and `truncated` on the directory; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.14, the directory), with D-36's bound rule.
depends-on: REC-149 (`integrated`, riding c19-batch9).
scope: page the directory at LIMIT cap+1 with `limit` and `truncated`; the cap is a named constant declared below the method. Add a `bounds.test.mjs` drive that bites.
accepts-when: a directory over the cap answers `truncated: true` with exactly the cap. NEGATIVE CONTROL: drop the LIMIT, and the bounds drive fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-481 · queued — **A PDF THAT PLACES EACH GLYPH WITH ITS OWN OPERATOR READS ONE GLYPH PER LINE: `pdfstructure.mjs` `extractPageText` pushes a newline on EVERY Td/TD/Tm/T\*, so Budget-Basics-FY21-23 yields 18,551 characters and fewer than 60 words — 43 of 332 plane-read documents (4.3%).** Found by D-66's worker. — owner CONTENT-PDF.
order: (moved behind the ~2 h rows for tonight's quota shutdown, Bob via BOB #32 03:00Z; SCHEDULER #18) after D-479, with the corrections: a reading that says far less than the document holds, across 4% of the corpus (SCHEDULER #17, 2026-09-24; via CONDUCT #19; renumbered from a colliding D-480)
milestone: M2
interface: none — the text is truer; its shape is unchanged.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 (how content is extracted today).
depends-on: none.
scope: break only when the baseline moves — Td/TD with ty=0 and a Tm at the current line's y add nothing (a space past a word-gap advance); T\*, ', " and any y change still break. Extend the pdfstructure suite.
accepts-when: Budget-Basics-FY21-23's bytes read at least 60 words per page. NEGATIVE CONTROL: revert the fix, and that arm reads glyph-per-line and fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-484 · queued — **`NO_BASIS` AND `NO_CITATION` HAVE NO DEC-49 TRANSLATION: neither code has a row in any `*_CHECKS` family, so a member reads the store's raw `detail`.** `NO_CITATION` is minted at 3 sites in `store.mjs` (relationdeclare, the progression revision, discharge), `NO_BASIS` at 4; `NO_CITATION` has reached two member surfaces untranslated since UI-13. Found by UI-83's worker. — owner RECORD.
order: (moved behind the ~2 h rows for tonight's quota shutdown, Bob via BOB #32 03:00Z; SCHEDULER #18) after D-481, with the corrections: a refusal a member cannot read (SCHEDULER #18, 2026-09-24; via CONDUCT #19 02:30Z)
milestone: M2
interface: I3 additive — two catalogued codes gain translations.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, following REC-79's single-helper shape.
depends-on: none.
scope: route each code's sites through ONE governed helper inside a DEC-49 REGION; a row for each in ACT_SHAPE_CHECKS (C-numbers by mintid); move the check-refusal-codes floors.
accepts-when: each site's refusal carries its translation. NEGATIVE CONTROL: mint one site's code outside the helper and the DEC-49 guard fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
