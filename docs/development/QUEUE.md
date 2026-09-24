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

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 16 in all (`CACHE_ROWS`, sized to CONDUCT's capacity plus spare: Bob, 2026-09-23, `WORK-PIPELINE.md`). **At most 10 worker sessions are live at once** (Bob, 2026-09-24 ~03:08Z, via BOB #32; until 05:00Z, then 6, and no new spawn from 06:00Z): a `running` row whose worker has FINISHED and awaits integration holds no session, so the cache keeps a few `queued` rows behind the live ten and no slot waits. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

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

### UI-85 · integrated — finished; integrated on land/conduct/c19-batch11 @ e49f66f8, waiting for its train — flipped by CONDUCT #20 2026-09-24 ~03:43Z
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

### REC-192 · integrated — finished; integrated on land/conduct/c19-batch11 @ 8646219d (IC-248, I3 84.0.0 MAJOR), waiting for its train — flipped by CONDUCT #20 2026-09-24 ~03:43Z
order: after D-256: a correction to just-landed work (UI-74, REC-161) that moves a doctrine from a page's choice into the wire (SCHEDULER #17, 2026-09-23)
milestone: M9
interface: I3 additive — `partitionindependence` (REC-161) takes `version=<id>` and reads that stored version's legs through the same `#independenceOf`, returning no strength field; versionstrength's gate and viewer stamp kept. The integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 (Strength, clauses (a)–(c)) with DEC-32 clause 5, and BOB #31's ruling of 2026-09-23 22:22Z (cite it until folded).
depends-on: REC-161 (`integrated` on c17-batch5).
scope: the version arm on the independence read. Extend `bio-plane/test/partitionindependence.test.mjs`.
accepts-when: the version arm's answer carries no strength key and equals versionstrength's `independence` for the same version. NEGATIVE CONTROL: add a strength field to the version-arm answer, and the "no strength key" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (UI-74's worker finding via CONDUCT #17; `node tools/mintid.mjs REC`).

### REC-190 · integrated — finished; integrated on land/conduct/c19-batch11 @ c650a697 (IC-251, I3 84.1.0), waiting for its train — flipped by CONDUCT #20 2026-09-24 ~03:43Z
order: after UI-86: the census that tells whether D-179's residue exists on a live record, before anything repairs it (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:43Z finding (6), verified at c17-batch4 @ 65205437)
milestone: M2
interface: I3 additive — one new admin/probe census op, `mutating:false`, REC-175's shape (proposed name homecensus); the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (*"ONE CAPTURE, ONE HOME — the ORIGINAL's"*). REPAIR of what it finds, and the digest-level duplicate (the same content in different bytes, §8's Incomplete note), are NOT in scope, by BOB #31's ruling of 2026-09-23 22:03Z (cite it until folded): *the census's report STANDS ALONE*; which bundle held a capture first is UNDETERMINED and the report says so; the digest-level duplicate is named as out of reach.
depends-on: D-179 (the fence; `integrated` on c17-batch4).
scope: list every `files`/`history` row whose sha the register assigns to a DIFFERENT, still-existing bundle, with both bundles named; never write. New suite `bio-plane/test/homecensus.test.mjs`, seeding a moved row at the store.
accepts-when: a store seeded with one moved row lists that sha under both bundles; a clean store lists none; the record's counters read before and after the call are unchanged. How a liar passes it: listing every multi-bundle sha including legitimate shares, so the clean-store arm must read none. NEGATIVE CONTROL: remove the different-bundle predicate, and the "displaced row found" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs REC`).

### D-64 · integrated — finished; integrated on land/conduct/c20-integ1 @ d1d387e3 (IC-252; BOB's timeout ruling owed at integration), waiting for its train — flipped by CONDUCT #20 2026-09-24 ~03:43Z
order: with the M2 capture rows, behind its substrate (BOB #31, 22:22Z: *place the capture row behind its substrate*) (SCHEDULER #17, 2026-09-23, LED-7 S17-2)
milestone: M2
interface: I3 — a render arm on capture producing the pair, and the `render` provenance block; the integrator mints and classifies the IC.
design: `docs/development/CLIENT-RENDERED.md` §"What must be recorded on a rendered capture"; scripts ALLOWED AND RECORDED (BOB #31, 22:22Z); and BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *method `rendered`; one capture holds BOTH artifacts with the RENDERED document PRIMARY and the shell beside it under its own digest; an unattended sweep MAY render within the daily render allowance and through the governor, recording DEFERRED (undetermined) when spent — never the shell as content.*
depends-on: 2.capture (BUILT); the Browser Rendering binding is NOT built and is this row's first act.
scope: the render arm writes one capture: the rendered document (method `rendered`, primary) and the shell (its method and digest), joined by `render.of`, with the `render.*` fields and `third_party_executed`; the sweep's deferral. New suite `bio-plane/test/rendered-capture.test.mjs`.
accepts-when: a rendered capture of a shell holds both artifacts and names every script origin executed, or says undetermined. NEGATIVE CONTROL: force `determined` on a page drawing data from a second origin, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; D-64's DEBT row of 2026-07-30; keeps its `D-` id).
owed-at-integration: BOB #32 ruling 2026-09-24 ~03:14Z — a render whose wait fired on its TIMEOUT keeps the capture's GRADE (grade is the chain; the method is recorded); the rendered document's COMPLETENESS is UNDETERMINED: `render.wait` records that the timeout fired and the reading states "render may be incomplete (wait timed out)"; never presented as the whole page, never refused. Actor: c20-integ1 (session_011vBzoPQBRZGhdLUxxiXzPG), paid on land/conduct/c20-integ1; BOB folds it into CLIENT-RENDERED. Sent by CONDUCT #20.

### UI-83 · integrated — finished; integrated on land/conduct/c19-batch11 @ 3e3684ee, waiting for its train — flipped by CONDUCT #20 2026-09-24 ~03:43Z
order: directly after D-443, first of the D-128 follow-ons: a surface that answers a member's act with a refusal it gives them no field to meet is a correction to just-landed work, which outranks new work (SCHEDULER #16, 2026-09-23; D-128's worker via CONDUCT #17)
milestone: M8
interface: I3 consumer (D-128's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2, "The declared flow, and its revisions" (BOB #27, 2026-09-22), the ruling D-128 built.
depends-on: D-128 (on `land/conduct/c17-batch3`).
scope: the progression form offers, when revising an existing progression, a basis-statement field and a citation field, and sends both; a refusal still reads through `refusalWords(r)`.
accepts-when: `civicos-ui/test/` gains a suite arm driving a revision through the form with both fields to a landed version, and one without either reading the canned refusal; the UI harness green. NEGATIVE CONTROL: drop the citation field, and the revision arm reads `NO_CITATION` and fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-128's worker's finding via CONDUCT #17, verified on the batch; `node tools/mintid.mjs UI`).

### REC-184 · integrated — finished; integrated on land/conduct/c20-integ1 @ 4dd1e7e9 (IC-255; BOB's DEFINITION_MOVED ruling owed at integration), waiting for its train — flipped by CONDUCT #20 2026-09-24 ~03:43Z
order: directly after UI-83, the same D-128 follow-on: a decision the record applies to a definition nobody judged is the record claiming more than it supports (CLAUDE.md §2) (SCHEDULER #16, 2026-09-23; D-128's worker via CONDUCT #17)
milestone: M4
interface: I5 — a `definition_version` column on `proposal_dispositions`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2, "The declared flow, and its revisions" (BOB #27), the ruling D-128 built.
depends-on: D-128 (on `land/conduct/c17-batch3`).
scope: `op=proposedispose` writes `definition_version`; a read against a later version does not treat an earlier-version disposition as current, stated; rows written before read `not recorded`; the stats counters count the version tables.
accepts-when: `bio-plane/test/proposedispose.test.mjs` gains an arm: a disposition under version 1 does not apply under version 2, and the column reads back. NEGATIVE CONTROL: stop writing the version, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-128's worker's finding via CONDUCT #17, verified on the batch; `node tools/mintid.mjs REC`).
owed-at-integration: BOB #32 ruling 2026-09-24 ~03:14Z (Framework §8.2) — a disposition binds the definition version the member SAW: the act carries definitionVersion; if the definition has moved since, it is refused DEFINITION_MOVED by name, and the member re-reads and acts again. Authored acts bind what was authored. The worker's proposed fix is right; build it. Actor: c20-integ1 (session_011vBzoPQBRZGhdLUxxiXzPG), paid on land/conduct/c20-integ1; BOB folds it into Framework §8.2. Sent by CONDUCT #20.

### D-453 · integrated — finished; integrated on land/conduct/c20-batch15 @ 9cde34b9f, on its train — flipped by CONDUCT #20 2026-09-24 ~05:18Z
order: AT THE HEAD (Bob set the environment network to FULL ~03:02Z; BOB #32 03:05Z: *place it at the head as a measurement that can finish before the 06:00Z wind-down*; SCHEDULER #18); was: after D-64, a measurement blocked on the environment; its results feed BOB's three recogniser designs (SCHEDULER #17, 2026-09-23; D-74's worker via CONDUCT #18 22:58Z)
milestone: M0 (a measurement for M4's identifier spaces)
interface: none — measurements.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for M-119 and `tools/m119-idspace.py`.
depends-on: D-74 (on `main` at 548eb2c5); egress: FULL for sessions STARTED after ~03:02Z, so the worker is a FRESH session and records any host still refused as REFUSED, never as absent.
scope: (a) Legistar unfiltered, looking up the C.M.S. numbers the ACFRs and budget books cite; (b) the procurement host's contract and PO numbers against Legistar awards; (c) Assessor APNs against Legistar and Accela; (d) one 100xxxx project in both a budget book and a Legistar title, and whether a C-form to new-form crosswalk exists. Re-run `tools/m119-idspace.py` over the wider corpus.
accepts-when: each of (a)–(d) is recorded with date, instrument and counts, a refused host named as refused rather than read as absent. NEGATIVE CONTROL: feed the tool a corpus with one planted join, and it counts exactly one.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-486 · running — SPAWNED 2026-09-24 ~03:15Z by CONDUCT #20 as a SEPARATE CLOUD SESSION titled WORKER D-486 (CONDUCT #20), base land/conduct/c19-batch10 @ cff0ede6 (same count readers as D-464); must finish before 06:00Z (quota shutdown). Falsify rather than believe: read the branch land/worker/D-486 and that session; never conclude queued from the absence alone.
order: after D-480, the same disclosure class at the head (BOB #32, 02:30Z: *"Row it as disclosure-class, beside D-480 at the head"*; SCHEDULER #18, 2026-09-24)
milestone: M8
interface: I3 — the served counts subtract; shapes unchanged.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.9), and `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5 (BOB #32's ruling, folded at 16fe1e7f): a run over a hidden project is the project's thinking; the bytes stay shared, only the run's attribution is withheld. `OBSERVATION-LOG-DESIGN.md` §6 ties the readers.
depends-on: none.
scope: one predicate excluding run rows whose context is a hidden project from every tally a caller outside its sight reads, all five readers together.
accepts-when: a run over a hidden project leaves each reader's answer to an outsider unchanged. NEGATIVE CONTROL: drop the predicate from one reader and its arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### M0-141 · integrated — finished; integrated on land/conduct/c20-integ1 @ ad7afc3a, waiting for its train — flipped by CONDUCT #20 2026-09-24 ~03:43Z
order: after D-482, with the rows that cut gate time (product before process, Bob 2026-09-22: a process row that cuts gate time may sit near the head; SCHEDULER #18, 2026-09-24; via CONDUCT #19 02:31Z)
milestone: M0
interface: none — prose.
design: `docs/development/VERIFICATION.md` (a gate verdict measures the tree; the corpus check is part of it).
depends-on: none.
scope: one line in `docs/development/kickoffs/WORKER.md` "Before you finish": edited a governed design document (`docs/architecture/*`, or `docs/development/*` with front matter)? Move its Status `as of` to today and run `node tools/corpuscheck.mjs` to 0 fail BEFORE the gate.
accepts-when: the line is on `main`; the next worker's first gate is not RED on corpuscheck. NEGATIVE CONTROL: none (prose).
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### D-481 · integrated — finished; integrated on land/conduct/c20-batch16 @ 47dba3a38; Content Framework §16 limit folded, trains after c20-batch15 — flipped by CONDUCT #20 2026-09-24 ~05:55Z
order: (moved behind the ~2 h rows for tonight's quota shutdown, Bob via BOB #32 03:00Z; SCHEDULER #18) after D-479, with the corrections: a reading that says far less than the document holds, across 4% of the corpus (SCHEDULER #17, 2026-09-24; via CONDUCT #19; renumbered from a colliding D-480)
milestone: M2
interface: none — the text is truer; its shape is unchanged.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 (how content is extracted today).
depends-on: none.
scope: break only when the baseline moves — Td/TD with ty=0 and a Tm at the current line's y add nothing (a space past a word-gap advance); T\*, ', " and any y change still break. Extend the pdfstructure suite.
accepts-when: Budget-Basics-FY21-23's bytes read at least 60 words per page. NEGATIVE CONTROL: revert the fix, and that arm reads glyph-per-line and fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).
owed-at-integration: fold into docs/architecture/BIO_Content_Framework_v0_10.md §16 as a stated LIMIT (the worker's design gap, SCHEDULER #18 placed the fold with the integrator 05:27Z; D-502 cites it): "Tier-1 PDF text breaks a line when the baseline moves; two runs sharing a baseline and separated only by a horizontal jump are concatenated, because glyph advance widths are not read (D-502 reads them)." Move §16's Status `as of`, run corpuscheck. Actor: whoever integrates land/worker/D-481 @ dbe88ab9. Recorded by CONDUCT #20.

### D-484 · integrated — finished; integrated on land/conduct/c20-batch16 @ 0e27ffa9e (IC-263, I3 MINOR 81.4.0), trains after c20-batch15 — flipped by CONDUCT #20 2026-09-24 ~05:55Z
order: (moved behind the ~2 h rows for tonight's quota shutdown, Bob via BOB #32 03:00Z; SCHEDULER #18) after D-481, with the corrections: a refusal a member cannot read (SCHEDULER #18, 2026-09-24; via CONDUCT #19 02:30Z)
milestone: M2
interface: I3 additive — two catalogued codes gain translations.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, following REC-79's single-helper shape.
depends-on: none.
scope: route each code's sites through ONE governed helper inside a DEC-49 REGION; a row for each in ACT_SHAPE_CHECKS (C-numbers by mintid); move the check-refusal-codes floors.
accepts-when: each site's refusal carries its translation. NEGATIVE CONTROL: mint one site's code outside the helper and the DEC-49 guard fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### M0-143 · integrated — finished; integrated on land/conduct/c20-batch15 @ fce988085, on its train — flipped by CONDUCT #20 2026-09-24 ~05:18Z
order: after M0-142, the same class: gate time on every doc landing (SCHEDULER #18, 2026-09-24; via CONDUCT #20 03:37Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the gate runs the class the diff measures).
depends-on: none.
scope: strip `//` and `/* */` comments from `src` and `ctrlSrc` before matching; strings stay.
accepts-when: `gates.mjs --explain` on a prose diff lists fewer suites. NEGATIVE CONTROL: a suite whose only `tools/x.mjs` mention is in a comment is doc-facing before the fix and not after, named by the arm.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### D-493 · integrated — finished; integrated on land/conduct/c20-batch15 @ 01815614a, on its train — flipped by CONDUCT #20 2026-09-24 ~05:18Z
order: at the backlog head: a published figure's bucket is wrong in the direction of overclaiming a need, and the fix is small enough for tonight's window (SCHEDULER #18, 2026-09-24; via CONDUCT #20 03:41Z)
milestone: M0 (a measurement instrument)
interface: none.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for the Tier 1 coverage entry in `docs/development/MEASUREMENTS.md`.
depends-on: none (D-166's probe changes ride its train; branch from `land/worker/D-166` if they are needed).
scope: in `classify()`, before the NO-TEXT-LAYER branches, return `ENCRYPTED` when `r.byReason` has `encrypted`; an ENCRYPTED rollup line; re-state the 07-31 sizing entry's buckets with date and instrument.
accepts-when: the two named documents classify ENCRYPTED and the rollup counts them. NEGATIVE CONTROL: drop the branch and both read NO-TEXT-LAYER, failing by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### M0-144 · integrated — finished; integrated on land/conduct/c20-batch15 @ 6dd9d4f6f, on its train — flipped by CONDUCT #20 2026-09-24 ~05:18Z
order: after M0-143, with the instrument rows: a guard with a blind spot, not yet bitten (SCHEDULER #18, 2026-09-24; via CONDUCT #20 03:38Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the DEC-49 guard).
depends-on: none.
scope: `/(?:^|[{,\s])(["']?)([A-Z][A-Z0-9_]{2,})\1\s*:/g` with `.map(x => x[2])`; over-strictness and refusal arms in `civicos-ui/test/refusal-codes.test.mjs`; glossary keys stay out of the pairing.
accepts-when: a 3-key fixture with quoted keys returns all three. NEGATIVE CONTROL: restore the old pattern and the quoted-key arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### DIST-9 · integrated — finished; integrated on land/conduct/c20-batch15 @ da1324814 (IC-261, I4 MINOR 2.2.0), on its train — flipped by CONDUCT #20 2026-09-24 ~05:18Z
order: after D-484: the dependent half of a landed ruling, whose plane half (D-260) reads a secret nothing places; DIST builds it, no release until Bob asks (SCHEDULER #18, 2026-09-24; DIST #6 03:06Z)
milestone: M8
interface: I8 additive — the installer takes an optional operator-supplied value; the integrator classifies.
design: `docs/architecture/BIO_Distribution_v0_1.md` §6 with `BIO_Assistant_and_AI_Roles_v0_1.md` §6 (D-260, BOB #22: *carrying that secret through install and update, as DAEMON_TOKEN is*).
depends-on: D-260 (on `main`).
scope: `newgroup/src/index.mjs`, `release.mjs` and `bio-plane/scripts/deploy.mjs` CARRY a value the operator supplies; never generate one (minting is a MEMBER act, DS-3); none supplied installs without it, and says so.
accepts-when: `15.instance-ai-secret` BUILT by its probe. NEGATIVE CONTROL: have the installer generate a value when none is supplied, and the no-invention arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs DIST`).

### M0-146 · running — SPAWNED 2026-09-24 ~04:44Z by CONDUCT #20 as a SEPARATE CLOUD SESSION titled WORKER M0-146 (CONDUCT #20), base origin/main, into D-479's freed slot; push by 05:45Z. Falsify rather than believe: read the branch land/worker/M0-146 and that session; never conclude queued from the absence alone.
order: AT THE BACKLOG HEAD: two workers lost a full-gate round to it in one night (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:21Z and 04:25Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a gate measures the tree it names).
depends-on: none.
scope: name ONE ignored scratch path for workers' files and gate logs in WORKER.md and `.gitignore`, and have §2e's derivation and the clean-tree check both skip it; stated in both files.
accepts-when: a worktree with a root scratch dir gates identically to one without. NEGATIVE CONTROL: remove the exclusion and the count moves, failing by name.
note: 2026-09-24 05:02Z by SCHEDULER #18 (D-486's finding 6, via CONDUCT #20): a scratch COPY of the repo inside the worktree is walked too — statepaths read 36 files of `.d486/before1/`; the one ignored scratch path must exclude repo-walking suites as well.
note: 2026-09-24 05:05Z — BOB #32 RULED the choice (05:04Z): WORKER.md's 'keep scratch inside your worktree' collides with M0-126; it becomes 'keep scratch in the session scratchpad, OUTSIDE the worktree'. That is this row's fix; an in-worktree ignored path is not.
note: 2026-09-24 05:22Z (CONDUCT #20, integ1b): also correct WORKER.md step 0's REC-110 sentence — a plain /* */ or // comment leaves bundled.mjs byte-identical, a /** */ docstring IS emitted (measured +1,104 B); byte-neutral, WORKER.md is 2 B under budget.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### D-483 · integrated — finished; integrated on land/conduct/c20-batch16 @ f8b72f02d, trains after c20-batch15 — flipped by CONDUCT #20 2026-09-24 ~05:55Z
order: after D-478, low: truthful today (it writes undetermined, never an invented tier); a missing affordance, not an overclaim (SCHEDULER #18, 2026-09-24)
milestone: M2
interface: none — consumes `vocabularies.risk_tiers` as published.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`risk_tier`, RULED by BOB #21: only a member's authored act sets 1, 2 or 3).
depends-on: none.
scope: a radio group over `vocabularies.risk_tiers` in SETUP_HTML's action arm, unset by default; unset still writes undetermined.
accepts-when: a chosen tier is written; none chosen writes undetermined. NEGATIVE CONTROL: default the group to 1 and the unset arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### REC-193 · running — SPAWNED 2026-09-24 ~05:03Z by CONDUCT #20 as a SEPARATE CLOUD SESSION titled WORKER REC-193 (CONDUCT #20), base origin/main, the 10th slot (cap 10 until 05:45Z, Bob via BOB 05:01Z); push by 06:30Z. Falsify rather than believe: read the branch land/worker/REC-193 and that session; never conclude queued from the absence alone.
order: after REC-188, the same completeness block: a correction to just-landed work (D-150) on who may attest (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I5 additive — a `statement_by` value recorded at the draft write; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 11, with Publication §3 rule 13 (BOB #32's ruling, folded).
depends-on: D-150 (on `main` at 548eb2c5).
scope: record `statement_by` (server-stamped) at every draft write that changes the statement text; C-41.10's author exclusion reads it. Extend D-150's suite (`bio-plane/test/d150*.test.mjs`).
accepts-when: B edits another section after A wrote the statement, and B may acknowledge while A is refused by name. NEGATIVE CONTROL: read the last editor again, and the "the statement's writer is refused" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (BOB #32's G2; `node tools/mintid.mjs REC`).

### D-494 · integrated — finished; integrated on land/conduct/c20-batch16 @ 5ad782d3c, trains after c20-batch15 — flipped by CONDUCT #20 2026-09-24 ~05:55Z
order: at the backlog head (D-493 is cached): an authority boundary (no machine attests) whose instrument cannot see half its sites (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:21Z)
milestone: M7
interface: none.
design: `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 4 (no machine credential performs the attested act), with DEC-49 for the catalogue.
depends-on: REC-185 (its train).
scope: widen the harvest to `index.mjs` and the templated/variable mints; locate each OPERATOR_TOKEN_* site; one arm asserting catalogue and harvest agree, a row with no site named (delete it or build the fence).
accepts-when: the two corpora agree, 18 = 18 or each difference named. NEGATIVE CONTROL: drop one fence's mint and the agreement arm fails naming it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-495 · running — SPAWNED 2026-09-24 ~05:08Z by CONDUCT #20 as a SEPARATE CLOUD SESSION titled WORKER D-495 (CONDUCT #20), base origin/main (REC-185 on main), into D-453's slot; push by 06:30Z. Falsify rather than believe: read the branch land/worker/D-495 and that session; never conclude queued from the absence alone.
order: after D-494, the same family (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:21Z)
milestone: M7
interface: none (a test); codes it surfaces get their own rows.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it.
depends-on: REC-185 (its train).
scope: drive `record()` over ADMIN and PROBE classes; list every codeless refusal found, by op, as a finding for placement.
accepts-when: the sweep states its classes and the NO_CODE set over all three. NEGATIVE CONTROL: strip one admin refusal's code and the admin arm names it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### DIST-12 · integrated — finished; integrated on land/conduct/c20-batch16 @ 1ddb740aa, trains after c20-batch15 — flipped by CONDUCT #20 2026-09-24 ~05:55Z
order: after DIST-11, with DIST's small rows: a measurement at a step DIST already takes, no daemon (SCHEDULER #18, 2026-09-24)
milestone: M0 (a measurement instrument's corpus)
interface: none.
design: `docs/architecture/BIO_Distribution_v0_1.md` §6 "The deploy-to-serve ladder", with BOB #32's ruling of 2026-09-24 03:45Z (cite until folded).
depends-on: D-166 (the `--urls` preflight).
scope: the release live verification runs `tier1-coverage-probe.mjs --urls`; its verdict lands in `MEASUREMENTS.md` as a dated entry, one line per URL (LIVE / NOT_PDF / NOT_FOUND / REFUSED). REFUSED is recorded as refused, never as rotted; a rotted URL becomes a plan row naming the fixture that depends on it.
accepts-when: the next release's verification carries the dated entry. NEGATIVE CONTROL: feed the preflight a refused host and it records REFUSED, not NOT_FOUND, by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs DIST`).

### UI-89 · running — SPAWNED 2026-09-24 ~05:10Z by CONDUCT #20 as a SEPARATE CLOUD SESSION titled WORKER UI-89 (CONDUCT #20), base origin/main, into M0-143's slot; push by 06:30Z. Falsify rather than believe: read the branch land/worker/UI-89 and that session; never conclude queued from the absence alone.
order: after REC-194, the member half of the same block (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 consumer (IC-227).
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 11 and §6A.4 (the review copy leads with the statement).
depends-on: D-150 (`integrated` on c17-batch7; verify `statementack` in `index.mjs` on `main` first).
scope: (1) the review copy leads with the exclusion statement and its acknowledgements; (2) an acknowledge act for recipients (by the grant's secret) and joined participants (by session), with DEC-49 translations for the five `STATEMENT_ACK_*` codes; (3) the published case page renders `[]` as "nobody but the author acknowledged the statement" and `null` as "the document says nothing about acknowledgements", never "nobody".
accepts-when: the three surfaces render against a live answer, and the empty and null cases read different sentences. NEGATIVE CONTROL: render `null` as `[]`, and the "null is not nobody" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (the D-150 delegation; `node tools/mintid.mjs UI`).

### UI-90 · running — SPAWNED 2026-09-24 ~05:19Z by CONDUCT #20 as a SEPARATE CLOUD SESSION titled WORKER UI-90 (CONDUCT #20), base origin/main, into D-481's slot; push by 06:30Z. Falsify rather than believe: read the branch land/worker/UI-90 and that session; never conclude queued from the absence alone.
order: after UI-89, the member half of D-149 (SCHEDULER #17, 2026-09-23; D-149's worker via CONDUCT #18)
milestone: M10
interface: I3 consumer (IC-230).
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*, Bob's ruling of 2026-09-22).
depends-on: D-149 (`integrated` on c17-batch7; verify the op on `main` first).
scope: the action page lists the governing laws, each with the level the plane publishes (`law_levels`), offers the member's act to set them with no default level, and shows the plane's undetermined sentence for an empty list; the act is struck from `ACTS_AWAITING_SURFACE`. Extend `civicos-ui/test/surface-registry.test.mjs` and the action page's suite.
accepts-when: an empty list reads the plane's undetermined sentence, and a member's list round-trips with its levels. NEGATIVE CONTROL: preselect a level, and the "no default level" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### D-498 · queued — **CONSTRUCT CLAIM `1.discoverable` SAYS THE DIRECTORY "LISTS A MEMBER'S DISCOVERABLE PROJECTS", but since D-479 it lists AT MOST `PROJECT_DIRECTORY_LIMIT` and says `truncated`.** Found by D-479's worker. — owner RECORD.
order: at the backlog head: the record claiming more than the plane does, one line (CLAUDE.md §2; SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:49Z)
milestone: M8
interface: none.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.14).
depends-on: D-479 (its train).
scope: amend the claim to "at most the cap, stated as truncated"; add a probe pinning `PROJECT_DIRECTORY_LIMIT`.
accepts-when: `node tools/status.mjs discoverable` reads the capped claim and its probe passes. NEGATIVE CONTROL: rename the constant and the probe fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-496 · running — SPAWNED 2026-09-24 ~05:31Z by CONDUCT #20 as a SEPARATE CLOUD SESSION titled WORKER D-496 (CONDUCT #20), base origin/main (D-487 on main), into D-494's slot, before the 05:45Z cap; push by 06:40Z. Falsify rather than believe: read the branch land/worker/D-496 and that session; never conclude queued from the absence alone.
order: at the backlog head (M0-146 is cached): a record claiming a bound it does not hold (CLAUDE.md §2), small enough for tonight (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:31Z)
milestone: M2
interface: I3 behaviour — a refusal where an answer stood at the edge; MAJOR by IC-25's test; the integrator classifies.
design: `docs/architecture/BIO_System_Design.md` §3 construct 14 (the inbox), with BOB #32's ruling of 2026-09-24 04:28Z (cite until folded).
depends-on: D-487 (its pinned-clock Miniflare instance; branch from `land/worker/D-487` until it lands).
scope: a two-bucket weighted sliding window in `Store.knock` (est = prev × (1 − elapsed/W) + cur; refuse at est ≥ limit), `index.mjs` passing the previous bucket and elapsed fraction; the same for the instance-wide 300; the prune keeps win and win−1; no schema change. If the estimate is approximate, the published text says so.
accepts-when: a burst straddling the edge is refused at the stated limit, per source and instance-wide, in `doorbell.test.mjs`. NEGATIVE CONTROL: restore the fixed bucket and the straddling burst is re-admitted, failing by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-497 · queued — **THE PROJECT DIRECTORY'S CANDIDATE SCAN IS STILL LINEAR IN THE GROUP'S PROJECTS: `#sight` is a JS predicate, so D-479's page bounds the ANSWER but not the rows read.** Found by D-479's worker. — owner RECORD.
order: after D-495: a bound on work, not on disclosure; the answer is already capped (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:49Z)
milestone: M8
interface: none (I5 additive if an index table is added; the integrator classifies).
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (items 7.9, 7.14): one sight rule, never a second copy.
depends-on: D-479 (its train).
scope: give sight a row source it reads (an owner-set-derived index) so the candidate query bounds in SQL, with the sight rule stated once.
accepts-when: `bounds.test.mjs` shows the candidate read bounded. NEGATIVE CONTROL: restore the JS filter over the unbounded scan and the bounds arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### UI-100 · queued — **UI MOCKS OF THE PLANE'S REFUSALS ARE NARROWER THAN THE WIRE, ACROSS TWO FAMILIES: seven `unknown op` mocks carry no `translation` (act-proposal ×2, queue ×2, auth-surface, case-frozen-pair, document-structure; four compose "unknown op " + op, a sentence the plane never sent), and `requiredArgument`'s eight plane sites all carry C-61.1's translation while `publishedcase.test.mjs` mocks publishedbytes with `error` alone.** UI-84's class, found by its worker. — owner UI.
order: after UI-99, with the UI corrections to landed wire shapes (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:26Z)
milestone: M4
interface: none (test mocks).
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, with UI-84's derivation as the precedent.
depends-on: UI-84 (its train).
scope: build every such mock from `DISPATCH_CHECKS.UNKNOWN_OP` / the requiredArgument catalogue as UI-84 does, correcting the composed forms to the wire's shape; drive each surface and state whether it RENDERS the refusal or only gap-detects it; also correct `planeSaid`'s stale comment in `app.html` (it cites two sentences D-278 replaced).
accepts-when: no mock in the two families types a refusal by hand. NEGATIVE CONTROL: retype one mock's `error` without `translation` and the derivation arm names it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs UI`).

### REC-195 · queued — **THE GOVERNING-LAWS LIST HAS NO MACHINE PROPOSAL: D-149 built the member's act and the machine refusal; the design's labelled machine proposal (*if built*) is not.** — owner RECORD.
order: after UI-90, a feature below the corrections: the list is complete without it (SCHEDULER #17, 2026-09-23; D-149's worker via CONDUCT #18)
milestone: M10
interface: I3 additive — a proposal read labelled machine work; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*): *a machine PROPOSAL, if built, is labelled machine work*.
depends-on: D-149 (`integrated` on c17-batch7).
scope: a proposal of citations and levels for an action, stored apart from the member's list and labelled machine work; it never sets the list, which only the member's act does.
accepts-when: a proposal is read labelled machine work, and the action's list is unchanged until the member acts. NEGATIVE CONTROL: let the proposal write the list, and the "the list is the member's" arm fails by name. New suite `bio-plane/test/rec195-laws-proposal.test.mjs`.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
