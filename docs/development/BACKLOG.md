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
- **Budget:** 150 KiB for the file, 2 KiB for a row (WORK-PIPELINE §2). A placement that puts this file over budget
  moves WHOLE rows from its foot to the head of `BACKLOG-LATER.md` — the same order's tail, looked up and never read
  whole — and a refill or any later write brings them back as room frees; no row is cut to fit (every `coord.mjs write`
  rebalances). `node tools/ledger.mjs invariants` prints the five pipeline invariants; `node tools/plancheck.mjs`
  enforces them.
- **Find any id** — here, in the tail, in the cache or in the archive — with `node tools/ledger.mjs find <ID>`.

Created EMPTY on 2026-09-18 by LED-6's tool half. The rows arrive with the migration (WORK-PIPELINE §5 steps 2–4),
performed by hand by the lane that owns the plan.

## Rows

### D-538 · queued — **A DRAFT THAT NAMES NO CASE AND DOES NOT SET `newCase` IS TOLD "a new case, whose identity is not yet allocated", while `publishCase` DERIVES an existing case for it: REC-199's block 10 measured draft DD saying that sentence as its gates refuse ALREADY_A_CASE_MEMBER against C1.** `Store.#caseIdentitySentence(null, 1)` is shared by the casedraft, casedrafts (REC-198) and reviewcopy reads. Found by REC-199's worker (1). — owner RECORD.
order: after D-530, with the corrections: the record asserting a new case where it will derive an existing one (CLAUDE.md §2) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 21:43Z)
milestone: M10
interface: I3 — the identity sentence's content; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4 (the review copy), with BOB #32's 2026-09-23 23:08Z newCase ruling.
depends-on: REC-199.
scope: `#caseIdentitySentence` takes the draft's `newCase`; with no case named and `newCase` unset it states the derivation route, or UNDETERMINED, never a new case.
accepts-when: draft DD reads the derivation (or undetermined), not "a new case", in all three reads (the measured failure it moves: block 10's sentence). NEGATIVE CONTROL: ignore `newCase` again and the DD arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-539 · queued — **A REVIEW COPY'S ROUND TRIP DEMOTES A LOAD-BEARING FINDING TO UNDESIGNATED: the absent-target branch of reviewCopy's `findings[]` (`{target, present:false, detail}`) drops `role`.** Found by REC-199's worker (2). — owner RECORD.
order: after D-538, the same review-copy read: an edit round trip losing what the member designated (SCHEDULER #19, 2026-09-24; via CONDUCT #20 21:43Z)
milestone: M10
interface: I3 additive — `role` on one branch; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4 (the review copy).
depends-on: REC-199.
scope: carry `role` on the absent-target branch.
accepts-when: a round trip of a copy whose load-bearing finding's target is absent keeps its role (the measured failure it moves: the role dropped). NEGATIVE CONTROL: drop `role` again and the round-trip arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-543 · queued — **THE RECORD STAMPS `at` AT TWO PRECISIONS, so a STRING compare across act kinds misorders: `…:00Z` sorts after `…:00.123Z`.** Found by REC-200's worker (F3, via CONDUCT #20 21:57Z), who measured `acknowledgeStatement` stamping without milliseconds while the review copy's other acts carry them. SCHEDULER #20 measured the store on main 9f8b69e6: 26 sites strip milliseconds (`toISOString().replace(/\.\d+Z$/, "Z")`) and the rest keep them, so the report's "every other act carries them" is false and the defect is the MIX. — owner RECORD.
order: after D-539, with the corrections to just-landed work: REC-200 orders a review copy's last change across kinds (SCHEDULER #20, 2026-09-24)
milestone: M10
interface: I3 — possibly a precision change on some `at` fields; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 (the copy carries the date of its LAST change), with D-516's ruling that `observation_log.at` STAYS whole-second (a named exception, not a site to change).
depends-on: REC-200.
scope: (1) SWEEP every site that orders or compares `at` values of different act kinds by string, and make each compare instants, not strings; (2) ONE stamping helper names the precision, used by every act that stamps, `observation_log` excepted by D-516's ruling; (3) state in the row's landing what the sweep's matcher cannot see.
accepts-when: an acknowledgement stamped `…:00Z` and a comment stamped `…:00.123Z` in one copy order by instant, and REC-200's last-change date names the later one (the measured failure it moves: the whole-second stamp sorting last). NEGATIVE CONTROL: restore the string compare, and the mixed-precision arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs D`).

### D-540 · queued — **`#statementAcknowledgements`' `unbound` COUNT INCLUDES THE STATEMENT WRITER'S OWN READING (measured 3 where the honest count is 2), so the record claims one more unbound second reading than exists.** Found by REC-213's worker (via CONDUCT #20 22:11Z): REC-212's residue — REC-212 excluded the publisher in the NOT clause, and the writer was left in. — owner RECORD.
order: after D-543, with the corrections to just-landed work: a count that overclaims second readings (CLAUDE.md §2) (SCHEDULER #20, 2026-09-24)
milestone: M10
interface: I3 — the `unbound` count narrows and a separately stated key appears; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 and §6A.4.
depends-on: REC-213.
scope: exclude the statement's writer in the `unbound` count's NOT clause, as REC-212 did for the publisher; count rows whose writer is undetermined under a separately stated key, never folded into either.
accepts-when: a case with a writer's own reading and two second readings reads `unbound` 2 and states the writer-undetermined count apart (the measured failure it moves: 3 read where 2 is true). NEGATIVE CONTROL: drop the writer exclusion and the count reads 3, failing by name.
added: 2026-09-24 · SCHEDULER #20 (id minted by REC-213's worker).

### UI-108 · queued — **THE PROGRESSION PAGE SHOWS A DISMISSED FINDING AS AN OPEN QUESTION: `progPaintInstance()` renders `inst.findings` verbatim and cannot say a member decided it.** The surface half of D-552. — owner UI.
order: directly after D-552, which it consumes (SCHEDULER #20, 2026-09-24)
milestone: M4
interface: I3 consumer (D-552's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §12 "age rather than vanish" (D-79), with D-552's published view.
depends-on: D-552.
scope: on the progression page, render each finding's disposition as the plane states it (who, when, the reason, and whether the decision still applies to the current definition_version), in the plane's words; the finding stays listed.
accepts-when: against a real-plane suite a dismissed finding renders its decision beside it (the measured failure it moves: an answered question shown as open). NEGATIVE CONTROL: render `inst.findings` without the view and the decided-finding arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs UI`).

### UI-109 · queued — **THE QUEUE'S FINDING ITEM CANNOT SHOW A REOPENED QUESTION'S EARLIER DECISION: D-527 publishes `prior_disposition` on `op=queue`'s FINDING items and no surface reads it.** D-527's own scope: *a UI follow-on renders it and is rowed once this lands* (CONDUCT #20 22:34Z). — owner UI.
order: after UI-108, in product order: the second surface for the same decision record (SCHEDULER #20, 2026-09-24)
milestone: M4
interface: I3 consumer (D-527's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2 "The declared flow, and its revisions" (a reopened proposal carries the earlier decision as `prior_disposition`).
depends-on: D-527.
scope: render on the queue's FINDING item who reopened it, the earlier decision, and whether that decision still applies, in the plane's words.
accepts-when: against a real-plane suite a reopened finding's queue item shows its earlier decision (the measured failure it moves: the reopened question shown as one nobody has answered). NEGATIVE CONTROL: omit `prior_disposition` from the render and the reopened-item arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs UI`).

### UI-106 · queued — **THE REVIEW-COPY SURFACE LOSES `newCase` AND WILL SHOW THE CORRECTED IDENTITY SENTENCE UNREAD: `app.html`'s `rvcFormFromCopy` does not read `case.newCase` (DELEGATION RECORD (WORKER REC-199) -> UI on coord CLAIMS.md), and UI-92's draft list draws `#caseIdentitySentence`, which D-538 changes.** — owner UI.
order: after D-539, the surface half of the review-copy corrections (SCHEDULER #19, 2026-09-24; via CONDUCT #20 21:43Z)
milestone: M10
interface: I3 consumer (REC-199's IC-285 and D-538's IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's newCase ruling.
depends-on: D-538, UI-92.
scope: `rvcFormFromCopy` reads `case.newCase` so a read-then-write keeps it; the draft list re-reads the plane's identity sentence as stated; discharge REC-199's DELEGATION block.
accepts-when: against a real-plane suite a round trip through the form keeps `newCase`, and draft DD shows the derivation sentence (the measured failure it moves: `newCase` lost at the surface). NEGATIVE CONTROL: drop the read and the round-trip arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs UI`).

### D-531 · queued — **A WHITESPACE-ONLY CONTENT UNIT IS STILL EMITTED AND INDEXED AS CONTENT at two emission sites: `index.mjs`'s `arm` helper and `store.mjs`'s `capture_text` ordering filter on `u.text.length`, though §16's comment at that site says a unit with no text is not emitted.** D-514's class surviving at emission; found by D-514's worker (id minted by it). — owner CONTENT-PDF, then RECORD.
order: after UI-106, with the corrections: the record indexing blank units as content (CLAUDE.md §2) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 21:46Z)
milestone: M2
interface: I5 — content-unit counts move; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with D-501's glyph rule (M-140).
depends-on: D-514.
scope: both filters read `glyphCount(u.text) > 0` (exported from textchain.mjs by D-514); measure content-unit counts and the corpus and retrieval figures resting on them BEFORE and AFTER, recorded with date and instrument.
accepts-when: a whitespace-only unit is neither emitted nor indexed, and the before/after figures are recorded (the measured failure it moves: blank units indexed as content). NEGATIVE CONTROL: restore `u.text.length` at one site and the whitespace-unit arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (placed; `D-531` minted by D-514's worker).

### D-534 · queued — **`op=queue` PUBLISHES `mute.cases` AS CASE IDS ALONE AND THE MUTED KINDS NOWHERE, so no surface can name the kinds of a case mute that is suppressing nothing today, and no member can undo that mute (the case form's unmute needs the kinds named).** `queueFeed` publishes `[...mutes.keys()].sort()` while `#queueMutes(member)` already holds `case_id -> Set(kind)`. Found by UI-97's worker (id minted by it). — owner RECORD.
order: after D-531, with the corrections: a member left unable to undo their own act (SCHEDULER #19, 2026-09-24; UI-97's worker 21:55Z)
milestone: M8
interface: I3 additive — `mute.cases` gains its kinds; the integrator mints and classifies the IC.
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class" (DEC-10's (c); D-125's case form).
depends-on: UI-97.
scope: `queueFeed`'s mute block publishes each muted case WITH its kinds (`cases: [{case, kinds}]` or a `case_kinds` map beside `cases`, whichever is least disruptive to current readers). Extend `bio-plane/test/d125-findingmute.test.mjs`.
accepts-when: a kind muted on a case whose items are not live today is named in `op=queue`'s mute block (the measured failure it moves: case ids with no kinds). NEGATIVE CONTROL: publish the case ids alone again and the "a kind holding nothing back today is still nameable" arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (placed; `D-534` minted by UI-97's worker).

### UI-107 · queued — **THE MUTE REPORT CANNOT OFFER A PER-CASE UNDO FOR A MUTED KIND THAT HOLDS NOTHING BACK TODAY: UI-97 draws no control there and states the named limit (member-respect SETS).** The surface half of D-534. — owner UI.
order: directly after D-534, which it consumes (SCHEDULER #19, 2026-09-24)
milestone: M8
interface: I3 consumer (D-534's IC).
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class".
depends-on: D-534.
scope: `queueMuteReportHtml`'s per-case undo names every kind the member muted from D-534's published kinds, not only `suppressed[]`'s; retire the named limit in member-respect's SETS row.
accepts-when: against a real plane a member undoes a case mute whose kind holds nothing back today (the measured failure it moves: no control drawn). NEGATIVE CONTROL: read `suppressed[]` alone again and the quiet-kind arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs UI`).

### D-553 · queued — **THE RETIRED-TARGET QUESTION IS SPELLED THREE WAYS IN THE STORE, AND ONLY TWO AGREE: (a) D-444's `#retiredNotCitable(id)` (store.mjs ~5185, Information-typed, not viewer-gated); (b) D-168's textually identical copy inside the DEC-49 region `is-cite-retired` at `op=cite` (~12806); (c) the suggest path's `SUGGEST_LEG_UNREACHABLE` (~40290), VIEWER-GATED and TYPE-BLIND, refusing any `retired` target with no `object_type === "information"` test.** store.mjs's comment at (b) says the suggest path "asks the same question of the same column"; the code does not. Found by D-444's worker (22:34Z). — owner RECORD.
order: after UI-107, in product order: a consistency defect, probably a no-op today, since no state machine but Information's carries `retired` (not measured) (SCHEDULER #20, 2026-09-24)
milestone: M8
interface: I3 for half (b) (a governed region contracts); half (c)'s interface waits on BOB's determination.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 ("A RETIRED ITEM IS NOT CITABLE", BOB #30), whose Incomplete-sections bullet D-444 updated to name this.
depends-on: D-444.
scope: (b) call `#retiredNotCitable` at `op=cite`, moving the `is-cite-retired` `regionLines` floor to the figure printed on the MERGED source; correct the false comment at (b); MEASURE whether any corpus holds a non-Information bundle in `retired` and state the count. (c) is a DETERMINATION routed to BOB #34 by SCHEDULER #20, 2026-09-24: should a basis leg pointing at a RETIRED non-Information target be unreachable? Build (c) only to BOB's answer; until then, state the divergence at (c) in words.
accepts-when: `affordances.test.mjs` §0's spelling count moves from TWO to ONE and (b) refuses exactly as before (the measured failure it moves: two copies that can diverge silently). NEGATIVE CONTROL: restore (b)'s inline copy and §0 names it.
added: 2026-09-24 · SCHEDULER #20 (id minted by D-444's worker).

### REC-218 · queued — **A CSV READING'S DIALECT IS NOT PERSISTED: FW-23 finds the delimiter and encoding by signature, and nothing keeps them on the record, so a re-read cannot say which dialect it read.** BOB #33 RULED 2026-09-24 21:55Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #20): option (b), a `reading.dialect` key of its own (delimiter, encoding), persisted on the acquire document — not `container_extent`; it suits other text formats with a decoding choice. — owner RECORD.
order: after D-536, beside the other reading-provenance row: the record stating how it read what it holds (SCHEDULER #20, 2026-09-24)
milestone: M2
interface: I1 additive — a `reading.dialect` key on the acquire document; the integrator mints and classifies the IC.
design: `docs/development/OFFICE-FORMATS.md` "CSV — DESIGNED 2026-09-24 by BOB #32" (delimiter and encoding RECORDED on the reading, undetermined when they cannot be told), with BOB #33's ruling of 21:55Z, which this row FOLDS into that section in the same landing.
depends-on: FW-23.
scope: persist `reading.dialect {delimiter, encoding}` on the acquire document at FW-23's reader; `undetermined` with its reason when the signature cannot tell; readable on the capture's read.
accepts-when: a semicolon-delimited latin-1 CSV's acquire document reads `reading.dialect` with both, and an ambiguous one reads undetermined (the measured failure it moves: the dialect found and discarded). NEGATIVE CONTROL: drop the persistence, and the read-back arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs REC`).

### REC-214 · queued — **NO MEMBER CAN SET OR REVISE AN ACTION'S RISK TIER AFTER INTAKE, AND A REVISION WOULD LEAVE NO TRACE.** BOB #33 RULED 2026-09-24 (sent 21:18Z; recorded in the inbox entry of 21:55Z) (UI-101's design gap; cite until folded): the `actionrisktier` op, not yet on main (member class, `contribute`), writing through the one front-matter path every reader derives the tier from; a machine credential is refused with the existing MACHINE_CANNOT_SET_RISK_TIER; a member MAY revise any tier, up or down, as an AUTHORED act recording who, when and a REQUIRED reason; APPEND-ONLY — the prior tier, its author and reason stay readable in the action's tier history; never a silent overwrite. — owner RECORD.
order: after D-533, first of the risk-tier trio in product order (plane, then UI-104, then REC-215), as BOB ruled; the field carries legal exposure, so the record must show a "do not file without counsel" was changed and by whom (SCHEDULER #19, 2026-09-24)
milestone: M7
interface: I3 additive — a new op and a tier history; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`action` is the impact substrate; `risk_tier`), with BOB #33's risk-tier ruling (sent by message 21:18Z, cited elsewhere as "21:21Z"; RECORDED in the BOB INBOX entry of 21:55Z, drained to `BOB-INBOX-drained.md` by SCHEDULER #20), which this row FOLDS into §2 in the same landing.
depends-on: D-510.
scope: the op; the append-only tier history on the action's read; "revised from 3 (by X) to 1 (by Y): <reason>" readable; a revision with no reason refused by name (catalogued, DEC-49).
accepts-when: a member's revision appends history naming both authors and the reason; a reasonless revision is refused by name; a machine is refused MACHINE_CANNOT_SET_RISK_TIER (the measured failure it moves: no revision path at all). NEGATIVE CONTROL: let a revision overwrite without history and the history arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs REC`).

### UI-104 · queued — **THE ACTION PAGE OFFERS NO RISK-TIER REVISION AND SHOWS NO TIER HISTORY.** BOB #33's risk-tier ruling (21:18Z; recorded in the inbox entry of 21:55Z), the surface half of REC-214. — owner UI.
order: directly after REC-214, which it consumes (BOB #33: plane, then UI) (SCHEDULER #19, 2026-09-24)
milestone: M7
interface: I3 consumer (REC-214's IC).
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`risk_tier`), with BOB #33's risk-tier ruling (sent by message 21:18Z, cited elsewhere as "21:21Z"; RECORDED in the BOB INBOX entry of 21:55Z, drained to `BOB-INBOX-drained.md` by SCHEDULER #20) (folded by REC-214).
depends-on: REC-214.
scope: on the action page, beside UI-90's governing-laws list, the revise act (tier plus a required reason, words from the plane's vocabulary) and the tier history as the plane states it.
accepts-when: against a real-plane suite a member revises a tier with a reason and the history renders "revised from … to …: <reason>"; the act cannot submit without a reason (the measured failure it moves: no surface for the act). NEGATIVE CONTROL: submit without a reason and the required-reason arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs UI`).

### REC-215 · queued — **NO MACHINE PROPOSAL OF A RISK TIER EXISTS, LABELLED AND APART FROM THE MEMBER'S VALUE.** BOB #33's risk-tier ruling (21:18Z; recorded in the inbox entry of 21:55Z), item 3: `actionriskpropose` (not yet an op), REC-195's shape. — owner RECORD.
order: after UI-104 (BOB #33: after (1), the proposal half last) (SCHEDULER #19, 2026-09-24)
milestone: M7
interface: I3 additive — a proposal read labelled machine work; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (only a member's authored act sets a tier), with REC-195's labelled-proposal shape and BOB #33's risk-tier ruling (sent by message 21:18Z, cited elsewhere as "21:21Z"; RECORDED in the BOB INBOX entry of 21:55Z, drained to `BOB-INBOX-drained.md` by SCHEDULER #20).
depends-on: REC-214.
scope: a proposal of a tier with its basis, stored apart from the member's value and labelled machine work; it never sets the tier.
accepts-when: a proposal reads labelled machine work and the tier is unchanged until a member acts (the measured failure it moves: no proposal read). NEGATIVE CONTROL: let the proposal write the tier and the "the tier is the member's" arm fails by name.
context: REC-216's audit (F1-F4, SCHEDULER #19's worker) and BOB #33's 21:55Z ruling: every `*propose` op is NON_ACTS in `bio-plane/src/affordances.mjs` (REC-195's reasoning) and a member states the value with their own act; so this proposal is a machine READ, never a member act in ACTS, and its surface SHOWS it beside the member's tier with no adopt control, as UI-102 (a2d974aa) does for the governing-laws proposal.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs REC`).

### D-521 · queued — **IC-246's STATEMENT_ACK_DOCUMENTS_OVER_BOUND (C-82.1) IS UNREACHABLE BY CONSTRUCTION: after REC-194 its read names (case_id, edition), `case_documents`' primary key, so at most one row returns and the bound can never fire.** Found by REC-194's worker (F1). — owner RECORD.
order: after REC-213, with the corrections to just-landed work: a catalogued refusal that cannot occur is a claim the record makes about itself (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:16Z)
milestone: M10
interface: I3 — a catalogued code retired; the catalogue version moves; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, with `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13.
depends-on: REC-194.
scope: collapse the read to `#one`; remove the bound, C-82.1, its DEC-49 region `is-statement-ack-documents-bound` and block 8's bound arms; move each refusal-code floor to its printed figure.
accepts-when: C-82.1 and its region are gone and the census floors read their printed figures (the measured failure it moves: a code no input can reach). NEGATIVE CONTROL: restore the region without its reachable site and check-refusal-codes names the orphan.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-524 · queued — **A MONITORED BUNDLE WITH AN ARCHIVE-SOURCED BASELINE READS "no captured baseline" FOREVER: `op=acquire` sets `body.locator = sel.replay`, so the register row names the Wayback replay URL while the capture files under the CDX original, and op=monitor's register lookup never finds it.** D-472's defect surviving on the ARCHIVE arm; found by D-472's worker (F1). — owner CAPTURE.
order: after D-521, with the corrections to just-landed work: a monitor that reads no baseline where one is held (CLAUDE.md §2) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 20:14Z)
milestone: M3
interface: I5 additive — `archiveHop` gains `document_address`; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6 (the monitoring contract), with D-472's Drive arm as the precedent.
depends-on: D-472.
scope: give `src/cdx.mjs` `archiveHop` a `document_address` key as `driveHop` has; op=monitor's register lookup prefers the row whose hop names the bundle's locator.
accepts-when: an archive-sourced baseline is found by op=monitor and two unchanged ticks read `unchanged` (the measured failure it moves: "no captured baseline" on every tick). NEGATIVE CONTROL: drop the hop key and the archive-baseline arm reads no baseline, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-525 · queued — **A PRE-CAP-8 DRIVE BASELINE IS A CAPTURE OF GOOGLE'S SHELL, so its monitor reads `modified` on every tick permanently, and nothing lists which bundles carry one.** Found by D-472's worker (F3). — owner CAPTURE.
order: after D-524, the same monitor path; low: the fix is a re-acquire (SCHEDULER #19, 2026-09-24; via CONDUCT #20 20:14Z)
milestone: M3
interface: none unless a read is added (the integrator classifies).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6, with CAP-8's Drive export arm.
depends-on: D-472.
scope: a sweep listing Drive-address bundles whose baseline capture's handler is an HTML stack (a shell); re-acquire each through the export address, recorded as a new capture, never overwriting the old.
accepts-when: the sweep names every shell baseline and a re-acquired one reads `unchanged` across two ticks (the measured failure it moves: a permanent `modified`). NEGATIVE CONTROL: skip the re-acquire and the two-tick arm reads `modified` by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-526 · queued — **WHICH REFUSAL A CALLER MEETS ON `op=promote` STILL DEPENDS ON THE ENVELOPE: the fences above bundle.md's parse (NAME_TAKEN, CITED retirement, LAWS_ACT carry-forward) read the envelope's type, and `#projectRow`'s action columns compare `fm.object_type === "action"` raw, not through `normalizeType`. Nothing wrong can land (D-510's fence refuses it).** Found by D-510's worker (F1, F3). — owner RECORD.
order: after D-525, with the promote corrections: the answer a caller meets should not depend on a label D-510 ruled untrusted (SCHEDULER #19, 2026-09-24; via CONDUCT #20 20:25Z)
milestone: M7
interface: none unless a refusal's order changes on the wire (the integrator classifies).
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5 and D-510's derivation.
depends-on: D-510.
scope: parse bundle.md at the top of promote's `act` and derive the type there for every fence; route `#projectRow`'s comparison through `normalizeType`.
accepts-when: an envelope-mislabelled action meets the same refusal as a correctly labelled one (the measured failure it moves: fences reading the envelope's type). NEGATIVE CONTROL: read the envelope's type in one fence again and that arm's refusal differs, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### M0-170 · queued — **THREE MORE FIXTURES KEEP HAND-KEPT TOOL COPY LISTS: `pushguard.test.mjs` scratchRepo, `pushguard-check.test.mjs` and `retirable.test.mjs` (measured correct today).** Found by M0-154's worker. — owner M0.
order: after M0-169, whose static mode it wires (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:50Z) AHEAD of the product rows by Bob's 17:41Z rule: a new import in gates.mjs breaks a hand-copied fixture with a false red (a false gate result costs a round) (SCHEDULER #19, 2026-09-24).
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a fixture derives what it carries).
depends-on: M0-169.
scope: wire the three to M0-169's static-only mode; delete the hand lists. ALSO (M0-169's F3, via CONDUCT #20 19:37Z): `bio-plane/test/instrument-deps.mjs` (D-265) calls `moduleClosure({ dynamic: false })` and maps to basenames, keeping its `outside` check (coverage-provenance, owed-controls, m051-driver-census).
accepts-when: an import added to the subject leaves all three green. NEGATIVE CONTROL: restore one hand list, add an import, and that suite fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-142 · queued — **`meaning-bounds.test.mjs`'s BOUND_KEY HAS NO `max`: `/^(?:limit|cap|bound|page_size|[a-z_]*_limit)$/` (line 382), so a read bounded by a `max`/`*_max` key (bounded actionquotes) is counted BARE and correct work reads unbounded.** Found by c18-batch7fix's worker; verified at 548eb2c5 by CONDUCT #20 and SCHEDULER #18. — owner M0.
order: (held behind c20-batch11fix, SCHEDULER #18 03:47Z) after D-484, with the rows that cut gate time: an over-strict instrument fails correct work (SCHEDULER #18, 2026-09-24; via CONDUCT #20 03:37Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register".
depends-on: land/conduct/c20-batch11fix on `main` (it rewrites meaning-bounds.test.mjs's segmenter; CONDUCT #20 03:46Z).
scope: add `max|[a-z_]*_max` to BOUND_KEY.
accepts-when: actionquotes' `max` counts as a bound. NEGATIVE CONTROL: remove actionquotes' published max, and the arm names it bare.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### D-541 · queued — **`tools/rowsubstrate.mjs` `anchorPairs` CAPTURES DIGITS AND DOTS ONLY (`§\s*(\d+(?:\.\d+)*)`), so `§6A` reads as `6`, and D-404's design-coverage arm falsely notes "substrate not evident" for REC-213, REC-199 and D-448.** Found by REC-213's worker (via CONDUCT #20 22:11Z). A false NOTE, not a failure. — owner M0.
order: after M0-142, with the process rows behind the product rows ahead of them: it prints a false note but fails nothing, so it does not cut gate time (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument states what it reads, never a neighbour of it).
depends-on: none.
scope: capture `(\d+(?:\.\d+)*[A-Za-z]?)`, compute depth from the dotted part, and escape the letter in `sectionText`.
accepts-when: rowsubstrate reads REC-213's `§6A` as §6A and the three false notes are gone (the measured failure it moves: three rows noted "substrate not evident"). NEGATIVE CONTROL: restore the digits-only capture and the §6A arm reads §6, failing by name.
added: 2026-09-24 · SCHEDULER #20 (id minted by REC-213's worker).

### M0-193 · queued — **`bio-plane/test/surfacing-run.mjs` HAS TWO LATENT FIXTURE DEFECTS: (F2) `openRun` derives `snapKey` from the whole SECOND (`${now.replace(/[-:]/g, "")}_5171f1a0`), so two fixture projects opened in one second share a snapKey; (F3) the wrapper clears its run cache on ANY whole-store `op=purge` attempt, including one REFUSED for a missing `confirm`.** Found by M0-187's worker (via CONDUCT #20 22:15Z). Harmless today. — owner RECORD (the shared test helper).
order: after D-541, with the process rows behind the product rows: latent, and neither has produced a false gate result (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none (test code).
design: `docs/development/VERIFICATION.md` (a fixture's state follows what the plane answered, never what was asked).
depends-on: M0-187 (its per-run `nth`).
scope: append M0-187's per-run `nth` to `snapKey`; clear the run cache only when the purge's answer says the purge happened.
accepts-when: two fixture projects opened in one second get distinct snapKeys, and a refused purge leaves the cache (the measured failure it moves: a shared key and a cache cleared by a refusal, each driven by a planted arm). NEGATIVE CONTROL: drop `nth` from the key and clear on any attempt, and both arms fail by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs M0`).

### D-535 · queued — **THE PLANE'S MEMBER-FACING STRINGS CITE `MEASUREMENTS.md` BY NAME, so every suite importing the check catalogue or the plane's index counts as a MEASUREMENTS reader and a MEASUREMENTS-only diff selects it: `bio-plane/checks/bio-checks.mjs` and `bio-plane/src/index.mjs` carry four citations (one DEC-49 refusal translation, three OCR cost sentences), and gates.mjs §2e reads a directly-imported runtime module's text for path mentions.** Found by M0-176's worker (M-146 §"D-535, ISOLATED HERE"); M0-176 is NARROWED to this. — owner RECORD (index.mjs), CHECKS (bio-checks.mjs).
order: after M0-193, with the process rows behind the product rows: it trims the doc-facing selection by two units (39 → 37, M-146), which is not an appreciable gate-time effect (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24; via CONDUCT #20 22:31Z)
milestone: M0
interface: I3 — one DEC-49 translation's words change; the integrator classifies.
design: `docs/development/VERIFICATION.md` (a gate selects by what a suite reads), with DEC-49 as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it for the translation.
depends-on: M0-176.
scope: rewrite the four citations as prose ("the MEASUREMENTS ledger"), the correction M0-165 made to calibration.test.mjs's `measured_by` labels one level down. Extend `statepaths.test.mjs`'s pin of this property from the TEST side to `bio-plane/src/` and `bio-plane/checks/`, so a by-name citation there cannot return (M0-176's worker). CAUTION: one is a DEC-49 refusal translation, so check its governed region, `regionLines`, and every refusal-wire pin that quotes the sentence.
accepts-when: a MEASUREMENTS-only diff no longer selects `calibration.test.mjs` and selects 37 units (the measured failure it moves: 39, M0-176's unmet accepts-when). NEGATIVE CONTROL: restore one citation by name and the selection re-admits the importing suites, failing by name.
added: 2026-09-24 · SCHEDULER #20 (id minted by M0-176's worker).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |

### D-520 · queued — **THE RENDER RESERVATION'S 30,000 ms NAVIGATION BOUND IS CHOSEN, NOT MEASURED, AND NOTHING CAPS CONCURRENT RENDERS: D-492 made the allowance an honest account, not a throttle.** BOB #33 RULED YES to both, 2026-09-24 19:11Z (cite until folded). — owner CAPTURE.
order: after D-478, in normal product order behind D-64's render rows (BOB #33, 19:11Z: *product, not ahead of it*; SCHEDULER #19, 2026-09-24)
milestone: M2
interface: none unless the waiting render's state is published (the integrator classifies).
design: `docs/development/CLIENT-RENDERED.md` "What Workers Paid actually buys, for this project" (DEC-42; re-pointed 2026-09-24 by SCHEDULER #19 from §"There is no collision", which the document marks SUPERSEDED — D-490's finding) and "RULED 2026-09-23 by BOB #32: the method, the primary, and the unattended sweep", with BOB #33's ruling of 19:11Z, which this row FOLDS into CLIENT-RENDERED as a RULED line in the same landing.
depends-on: D-492, D-490.
scope: (1) measure navigation times over the client-rendered sources already captured, recorded in `measurements/<id>.md` with date and instrument, and set the reservation's bound from the measured tail, stating the figure and its source at the site; (2) a concurrency cap from the platform's stated concurrent-browser limit, labelled the vendor's claim until measured; a render over the cap WAITS in the reconciling alarm, never dropped; a render that cannot run is recorded undetermined with its reason, never as a capture that found nothing.
accepts-when: the bound reads from a measurement id, and a burst above the cap renders no more than the cap at once with the rest completing later (the measured failure it moves: an unmeasured 30,000 ms and an uncapped burst). NEGATIVE CONTROL: remove the cap and the burst arm counts more concurrent renders than the cap, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-522 · queued — **AN UNATTENDED RENDER THAT SUCCEEDS IS DRIVEN NOWHERE, AND THE MONITORING SWEEP (CAP-3) CANNOT SET THE RENDER FLAG, though BOB #32 ruled *an unattended sweep MAY render* within the allowance and through the governor.** D-491's residue (via CONDUCT #20 19:47Z). — owner CAPTURE.
order: after D-520, with D-64's render rows: it waits on a renderer that can answer (SCHEDULER #19, 2026-09-24)
milestone: M3
interface: I3/I5 — the sweep's render request; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` "RULED 2026-09-23 by BOB #32: the method, the primary, and the unattended sweep" (item 3).
depends-on: D-490, D-491, DIST-11.
scope: the CAP-3 sweep sets `render` on a capture request for a source profiled client-rendered; drive an unattended render to SUCCESS through the drain with a stub renderer.
accepts-when: an unattended request for a client-rendered source completes as a rendered capture within the allowance (the measured failure it moves: a success path no suite drives). NEGATIVE CONTROL: drop the sweep's render flag and the success arm reads the shell, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-523 · queued — **A RENDER REFUSED FOR A C-83 REASON OTHER THAN THE ALLOWANCE IS HELD SILENTLY: D-491 holds it under the plane's code until the request row's `expires`, and no member is told a render waits, or why.** BOB #33 RULED 2026-09-24 19:54Z (cite until folded): KEEP the hold, bounded by `expires`; at expiry the render is RECORDED UNDETERMINED with its C-83 reason and released, never dropped silently; and an op=queue condition kind shows a deferred render and its reason in DEC-49 words. — owner CAPTURE.
order: after D-522, in normal product order with D-64's render rows (BOB #33, 19:54Z; SCHEDULER #19, 2026-09-24)
milestone: M3
interface: I3 additive — a new op=queue condition kind; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` "RULED 2026-09-23 by BOB #32: the method, the primary, and the unattended sweep", with BOB #33's ruling of 19:54Z, which this row FOLDS into CLIENT-RENDERED in the same landing; `docs/development/NOTIFICATIONS.md` for the condition kind.
depends-on: D-491.
scope: at `expires`, record the held render undetermined with its C-83 reason and release it (stated at the site); mint the op=queue condition kind carrying the reason's DEC-49 translation.
accepts-when: a refused non-allowance render shows in op=queue with its reason while held, and reads undetermined after expiry (the measured failure it moves: a hold no member can see, ending in nothing recorded). NEGATIVE CONTROL: let expiry delete the row and the undetermined arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-529 · queued — **A RENDERED CAPTURE RECORDS EACH SUBRESOURCE IT LOADED WITHOUT THAT SUBRESOURCE'S DIGEST, so the record of what ran cannot be verified independently.** BOB #33 RULED 2026-09-24 21:05Z (cite until folded): a per-subresource digest IS owed. A hop attests these bytes, this URL, this time (construct 2), and BOB #31 ruled every third-party script a render runs is recorded. Gap recorded in CLIENT-RENDERED's Incomplete sections by D-490. — owner CAPTURE.
order: after D-523, in normal product order with D-64's render rows (BOB #33, 21:05Z; SCHEDULER #19, 2026-09-24)
milestone: M2
interface: I5/I3 additive — a digest per recorded subresource; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` "RULED 2026-09-23 by BOB #31: third-party scripts run, and every one is recorded", with BOB #33's ruling of 21:05Z, which this row FOLDS into CLIENT-RENDERED, closing its Incomplete line, in the same landing.
depends-on: D-490.
scope: each recorded subresource carries its SHA-256; one the render loaded whose bytes were not kept reads digest UNDETERMINED with its reason.
accepts-when: a rendered capture's subresources each verify by digest, and an unkept one reads undetermined with its reason (the measured failure it moves: subresources recorded with no digest). NEGATIVE CONTROL: drop the digest and the verify arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-450 · queued — **A PROJECT WHOSE BAR DECLARES ONE AXIS CAN PUBLISH AND CAN NEVER BE SIGNED: `publishCase` admits it (*an unset axis gates nothing*), `#caseDocumentText` freezes the unset axis as null, and C-41.12 (`checkCaseDocument`'s `required_strength` arm) demands both axes A–D when the bar is declared, so `op=ratify` answers GATE_REFUSED.** Found by REC-148's worker; reported, not re-measured by SCHEDULER. — owner RECORD.
order: after D-448: a correction to just-landed work (REC-148) that strands a publishable case unsigned (SCHEDULER #17, 2026-09-23; via CONDUCT #18 22:48Z (3a))
milestone: M10
interface: none — a check's admitted values.
design: `docs/architecture/BIO_Publication_v0_1.md` §"the bar" (DEC-72) and §3 rule 12, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *C-41.12 ADMITS null for an unset axis; the pair stays a pair — both keys present, an unset axis null, stated in words "no bar set on the <axis> axis"; `op=strengthbar` keeps accepting a one-axis bar* (refusing it would pressure an invention, CLAUDE.md §4).
depends-on: REC-148 (`integrated` on c17-batch7).
scope: C-41.12 admits null for an unset axis; the case document states the unset axis in words, never defaults and never omits the key. Extend `bio-plane/test/caseproduction.test.mjs`.
accepts-when: a one-axis bar publishes, ratifies, and its document reads "no bar set on the <axis> axis" with the key present and null. NEGATIVE CONTROL: restore the both-axes demand, and the one-axis ratify arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-451 · queued — **A PROJECT RUN HAS NO TARGET A MEMBER CAN NAME: `op=airun` publishes only the run's context `{type, id}`, so FL-11's `runContextTarget` cannot seed a project run, and its level-empty candidates are refused SUGGEST_NO_TARGET.** — owner RECORD, then FLEET (one line).
order: after D-450: a correction to just-landed work (FL-11), the run's suggestions lost for every project run (SCHEDULER #17, 2026-09-23; FL-11/12's worker via CONDUCT #18 22:51Z)
milestone: M9
interface: I3 additive — `aiRunRead` publishes a project run's questions; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 (the RUN is an object) and §9 (what a SUGGESTION is).
depends-on: FL-11 (`integrated` on c17-batch7).
scope: for a project run, `aiRunRead` publishes the questions the project confirmed-cites (the set `#runContextProjects` uses); `runContextTarget` takes a single one or leaves several to the candidate. Extend `agent-worker/test/agent-worker.test.mjs` and the airun suite.
accepts-when: a project run citing one question seeds it as the target, and its level-empty candidates are filed. NEGATIVE CONTROL: drop the questions from the read, and the project-run arm reads SUGGEST_NO_TARGET by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-454 · queued — **ONE STRING READ ON SEVERAL PAGES IS ONE MENTION: `reading_refs` holds a single position per (capture_sha, ref), so a member choosing a connection's on-point mention (REC-122) cannot choose between that string's occurrences.** — owner CAPTURE / FRAMEWORK (the reading tables).
order: after D-452: a correction that REC-122's act exposes; the choice it built is only as fine as the positions it can name (SCHEDULER #17, 2026-09-23; REC-122's worker via CONDUCT #18 23:08Z)
milestone: M4
interface: I5 — `reading_refs` keyed by (capture_sha, ref, position); I3 — a resolution carries its occurrence. The integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair) and §8 (the reading positions a connection rests on).
depends-on: REC-122 (`integrated` on c17-batch7).
scope: re-key `reading_refs` by position with a migration that keeps every existing row; each resolution names its occurrence; the connection's mentions list every occurrence.
accepts-when: a ref read on three pages yields three mentions, each choosable. NEGATIVE CONTROL: restore the two-column key, and the three-occurrences arm reads one by name. Extend the reading suite (`bio-plane/test/reading-position*.test.mjs`).
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### UI-91 · queued — **A MEMBER CAN CHOOSE A CONNECTION'S ON-POINT MENTION ON THE PLANE, AND NO SURFACE OFFERS IT: REC-122's `connectionchoose` (IC-232, C-74) has no page; construct 6.on-point-ui is ABSENT.** The DELEGATION RECORD (REC-122) -> UI of 2026-09-23 is on coord `CLAIMS.md`. — owner UI.
order: after D-454, the member half of REC-122 (SCHEDULER #17, 2026-09-23; REC-122's worker via CONDUCT #18 23:08Z)
milestone: M4
interface: I3 consumer (IC-232).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair and what it is NOT), with D-161's act 3.
depends-on: REC-122 (`integrated` on c17-batch7; verify the op on `main` first).
scope: on the connection display, offer a signed-in member the choice among the mentions the C-49.4 entries name as bearing; show the chosen mention BESIDE the machine's pair, never replacing it; render a lapsed choice as the plane states it; replace 6.on-point-ui's `uinone` probe with `hit` probes.
accepts-when: a member's choice renders beside the machine's pair, and a lapsed one reads as the plane states it. NEGATIVE CONTROL: render the choice in place of the pair, and the "never replacing" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### UI-95 · queued — **A MEMBER SEES A CUT SET OF CONNECTIONS AS THE WHOLE SET: D-241 publishes the entity arm's `derivation`, and `app.html`'s subject view (`connectionsBoundHtml`) never renders `derivation.says`.** — owner UI.
order: after UI-91, the connection display: a surface that claims more than the record holds (SCHEDULER #17, 2026-09-23; D-241's worker via CONDUCT #18 00:15Z)
milestone: M3
interface: I3 consumer (IC-236).
design: `docs/development/CONTENT-SEARCH-DESIGN.md` §4.3 (the cap, and truncation stated).
depends-on: D-241 (`integrated` on c18-batch8).
scope: render `derivation.says` whenever `derivation.cut` is true or the state is not `derived`, beside the connection list. Extend the subject-view harness in `civicos-ui/test/`.
accepts-when: a cut derivation shows its sentence; a whole one shows none. NEGATIVE CONTROL: drop the render, and the cut-set arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### UI-96 · queued — **A MEMBER WHOSE CASE RESTS ON A PASSAGE IS STILL NEVER TOLD A NEWER VERSION EXISTS: D-394 built the plane's cross-version notice (`versionnotice`, C-80; construct 4.cross-version BUILT), and 4.cross-version-ui is ABSENT: no surface shows it where a member meets a citation.** — owner UI.
order: after UI-95: the plane half's member surface (SCHEDULER #17, 2026-09-23; D-394's worker via CONDUCT #18)
milestone: M4
interface: I3 consumer (IC-239).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1.
depends-on: D-394 (`integrated` on c18-batch8).
scope: where a citation is shown, render the notice's state as the plane states it, including "the chain could not be read"; replace 4.cross-version-ui's probe.
accepts-when: a citation to a superseded passage shows the notice; an unread newer capture reads as not read, never as unchanged. NEGATIVE CONTROL: collapse "not read" into "unchanged", and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).
note: 2026-09-24 — RE-SCOPED by Bob's ruling (Framework §18.1, option D; folds-0924b): the proactive notice reaches a published case's OWNERS only (delivery is REC-209); the surface shows it to owners, and anyone may still ASK at a citation.

### REC-209 · queued — **A PUBLISHED CASE'S OWNERS ARE NEVER TOLD ITS CITED DOCUMENT HAS A NEWER VERSION: D-394's notice answers only when asked.** Re-scoped 2026-09-24 to OWNERS by Bob's ruling (option D), replacing BOB #32's 00:05Z "members". — owner RECORD.
order: after UI-96, the notice's delivery (SCHEDULER #17, 2026-09-24)
milestone: M10
interface: I3 — one queue item per published case and newer version, to its owners; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 — RULED by Bob (2026-09-24, option D; folded on land/bob/folds-0924b @ bde7644d): *a published case's OWNERS alone are told ONCE when a cited document has a newer version; other members and the public are not told; the case is never altered; a new edition stays the owners' choice.*
depends-on: D-394 (`integrated` on c18-batch8).
scope: when a published case's cited document gains a newer version, raise one queue item to the case's OWNERS only, recorded so it is never raised twice for that pair; nothing to other members, the public surface, or the published case.
accepts-when: a newer version raises exactly one item to the owners and none to a non-owner member; a second tick raises none; the published bytes are unchanged. NEGATIVE CONTROL: address the item to every member, and the non-owner arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs REC`); re-scoped to owners the same day.

### UI-88 · queued — **THE ACCEPT CEREMONY FETCHES THE STRENGTH PAIR BEFORE THE MEMBER AFFIRMS, AND HIDES IT: `app.html` `acerOriginsRead` reads `op=versionstrength` and drops the pair client-side.** Once REC-192 lands it switches to the independence-only read. — owner UI.
order: directly after REC-192, which it consumes (SCHEDULER #17, 2026-09-23; BOB #31's ruling of 2026-09-23 22:22Z (cite it until folded))
milestone: M9
interface: I3 consumer (REC-192's IC).
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 (Strength) with DEC-32 clause 5.
depends-on: REC-192, UI-74 (`integrated` on c17-batch5).
scope: `acerOriginsRead` reads the version arm of the independence read; no code path fetches a strength-bearing answer before the affirmation. Extend `civicos-ui/test/accept-ceremony.test.mjs`.
accepts-when: before the affirmation the ceremony's network log holds no strength-bearing answer. NEGATIVE CONTROL: point `acerOriginsRead` back at `op=versionstrength`, and the pre-affirmation fetch arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### D-504 · queued — **D-453 LEFT SIX IDENTIFIER-SPACE MEASUREMENTS OPEN (M-132): (1) Accela not read (APN ↔ permit, scope (c)'s other half; a session-based ASP.NET UI); (2) whether data.oaklandca.gov c3xp-qcgn copies the county roll, and whether any HISTORICAL roll is published (33 of 102 Legistar APNs are retired parcels); (3) the 100xxxx join, to be sought in the CIP line-item tables, not budget prose; (4) data.acgov.org unidentified; (5) M-119's recorded tool sha256 (322fcb95…) ≠ main's (b204fc1e…); (6) 0201-cafr-2002 is a scan, unread.** — owner CONTENT (measurements).
order: before REC-203, whose recognisers rest on these joins (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:41Z)
milestone: M0 (measurements for M4's identifier spaces)
interface: none — measurements.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for M-132 and `tools/m119-idspace.py`.
depends-on: D-453.
scope: measure (1)–(4) with a fresh network session (www.oaklandca.gov's 403 is Akamai's; `cao-94612.s3` is the working route); reconcile (5) by stating which file M-119 read; send (6) to OCR or state it unread.
accepts-when: each item recorded with date, instrument and counts, a refused host named as refused. NEGATIVE CONTROL: `tools/m132-negative-control.py`'s planted join counts exactly one.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### REC-203 · queued — UNBLOCKED 2026-09-24 by BOB #32: Framework §8.3 now carries M-132 (concurrent project-number forms told apart by shape; C.M.S. referent check and coverage floor; APN apn_sort and RETIRED parcels; contract/PO unpublished at source), on land/bob/fold-m132 awaiting its train. Build to §8.3 as amended.
order: behind D-453, whose measurements it rests on, as BOB #32 ruled (*Row them RECORD, blocked behind D-453's egress*) (SCHEDULER #17, 2026-09-23)
milestone: M4
interface: I3/I5 — three recognisers and their eras; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.3 "WHAT MAKES A SHARED IDENTIFIER COUNT" (on `land/bob/rulings-0923b` @ fd93bf1d, riding the next train): a match counts when the REFERENT agrees in two INDEPENDENT systems; two publications of one source are one system; a space whose format changes is one space with dated ERAS, joined across eras only through a captured crosswalk.
depends-on: D-453 (egress), D-74 (`integrated`).
scope: a recogniser per space under §8.3's counting rule, eras for the project-number format change (C###### → 100xxxx).
accepts-when: a budget line and its Legistar award join by project number only when the referent agrees; a fund code alone never counts. NEGATIVE CONTROL: count two publications of one source as two systems, and the independence arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-191 · queued — **MONITORING SCHEDULES A BUNDLE, NOT AN ADDRESS, AND ONLY BY ITS AUTHORED FREQUENCY: sixty captures of one document are sixty schedules, and a document with no authored frequency reads `unscheduled` though `op=monitor` answered it by its contract (D-65's worker finding (a)).** `Store#monitorCadencePlan` selects `bundles WHERE monitor_enabled=1`. — owner RECORD.
order: after REC-190, behind D-65 (running; same op and path); a gap, not an over-claim (SCHEDULER #17, 2026-09-23, CONDUCT #17 21:43Z (5) and #18 22:27Z (2), verified at the code)
milestone: M3
interface: I3 — `op=monitor`'s schedule and report become per address, naming every version grouped; the integrator mints and classifies the IC.
design: D-220's ruled intent (Bob 2026-08-06, *"Monitoring an ADDRESS is what a member means"*) with `docs/architecture/BIO_Content_Framework_v0_10.md` §6 (the contract sets the check frequency); BOB #31's 22:03Z ruling (cite until folded): *the ADDRESS's own setting governs; where none is set, the CURRENT version's; never the shortest; a disagreement is STATED.*
depends-on: D-65 (c17-batch6), D-220 (c17-batch4), both `integrated`.
scope: `#monitorCadencePlan` groups monitored bundles by `captured_locators.address_norm` through the version-chain join, checks the address once against its current version, reports the versions grouped and any frequency disagreement; persists each address's content type from the tick (in `purge`) and falls back to `CONTRACT_FREQUENCY` where nothing is authored. Renumber D-220's archived body to match its disposition. Extend `bio-plane/test/monitor-cadence.test.mjs`.
accepts-when: three captures of one address give one due entry; two addresses sharing a title give two.; a calendar with no authored frequency is due a day after one tick. NEGATIVE CONTROL: restore the per-bundle select, and the one-address arm fails by name, and dropping the fallback fails the calendar arm.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs REC`).

### D-455 · queued — **A `changed` MONITOR TICK DISCARDS THE BYTES IT FETCHED: it points its result at the baseline because the new document is not captured, though the monitor already held those bytes to see the change.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *a `changed` tick CAPTURES the new bytes (a monitor capture with its own provenance, through the governor), and its result_ref points at the new capture's sha* — superseding `OBSERVATION-LOG-DESIGN.md` §4.1's reason. — owner RECORD.
order: after REC-191, the same monitor path; evidence in hand is being thrown away (SCHEDULER #17, 2026-09-23; D-65's worker finding (b))
milestone: M3
interface: I3/I5 — a monitor capture and the observation's reference; the integrator mints and classifies the IC.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §4.1, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: D-65 (`integrated` on c17-batch6).
scope: on `changed` the tick captures the served bytes with monitor provenance through the governor and points the observation at that capture. Extend `bio-plane/test/monitor-assess.test.mjs`.
accepts-when: a changed tick leaves a capture whose sha the observation names, and that sha resolves in the register. NEGATIVE CONTROL: skip the capture, and the "result names a held capture" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-338 · queued — **THE `unmonitorable` CONTRACT IS DECLARED AND UNTESTED: D-65 maps a shell to UNMONITORABLE (`CONTRACT_FREQUENCY.unmonitorable: null`, with its why), and no suite drives it; whether the monitor still reports a hash delta for such a document is UNDETERMINED.** — owner RECORD.
order: after D-455, the same monitor path (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M3
interface: none — an arm.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6.
depends-on: D-65 (`integrated` on c17-batch6).
scope: an unmonitorable arm in D-65's monitor suite (`bio-plane/test/monitor-assess.test.mjs`); fix any hash-delta report it exposes.
accepts-when: a shell-profiled document's answer states unmonitorable and grades no change. NEGATIVE CONTROL: map unmonitorable to weekly, and the arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### REC-162 · queued — **A FOUNDER-ONLY OP'S REFUSAL CALLS AN ENROLLED ADMINISTRATOR A NON-ADMINISTRATOR.** Five ops sit in `SESSION_OPS.admin` and … (whole text: the cut archive)
order: back to back after REC-159, the same two suites (`d270-refusal-truth`'s ROLE literal, `adminvote` §8f), the second re-reading the first's pins; a false refusal sentence, CLAUDE.md §2's class (BOB #23's entry, 2026-09-21; SCHEDULER #7)
milestone: M8
interface: I3 — the refusal's sentence; the integrator classifies it in IC-55's family.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9, *AND ADMINISTRATORS DO NOT RUN THE INSTANCE* (BOB #23, 2026-09-21).
depends-on: REC-159 (sequence: the same `SESSION_OPS` sets and ROLE literal; made a dependency 2026-09-23 by SCHEDULER #16 so no refill takes this row ahead of it).
accepts-when: an enrolled administrator and a member, each refused `governorconfig`, read the founder's-session sentence; the founder's session and the ADMIN_TOKEN bearer still set an … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (BOB #23's inbox entry, drained this commit; `node tools/mintid.mjs REC`).
scope-add: 2026-09-24 by SCHEDULER #17, BOB #32's ruling (00:00Z): correct `AI_SCOPE_BEYOND_MEMBER_REACH`'s detail ("not reachable by a member"), now loosely false for REC-159's four custodial acts, in the same `SESSION_OPS` sets this row touches; no new row. The founder's NOT_AN_ADMIN on an unclaimed store (scratch) STANDS: a live verification claims an administrator in scratch first.

### REC-155 · queued — **SEVEN VERBS WHOSE `OPS` ROW ADMITS A SESSION CLASS WERE REACHABLE BY NO SESSION, AND NOBODY HAD RULED WHY — NOW RULED** … (whole text: the cut archive)
order: where it stood, now with its design (BOB #20's entry): the plane is honest here — a determination was owed, not a defect shipping — and this landing refuses nobody (SCHEDULER #5, 2026-09-21; placed by SCHEDULER #3, 2026-09-19)
milestone: M8
interface: I3 — MINOR: sessions gain reach and no class list moves; the integrator mints the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10 (ruled by BOB #19, landed by BOB #20 at `d9cf3283`).
depends-on: REC-159 (sequence: the same `SESSION_OPS` sets and ROLE literal; made a dependency 2026-09-23 by SCHEDULER #16 so no refill takes this row ahead of it).
accepts-when: each of the five answers a member session and an administrator session with the op's own result; the two unattended ops answer every session `MACHINE_CREDENTIAL_REQUIRED` with … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's item 1); designed 2026-09-21 by §4.10, BOB #20's entry drained by SCHEDULER #5.

### REC-186 · queued — **MEMBERSHIP §7's TWO UNRULED EDGES, RULED (BOB #31, 2026-09-23 21:37Z): (a) THE PROJECT'S ONLY OWNER CANNOT "ASK TO LEAVE" — `projectLeave` refuses the last owner by name ("transfer ownership first") and `op=affordances` does not offer it; a non-last owner may leave. (b) A JOINED PARTICIPANT IS NOT OFFERED "JOIN" — `projectJoin` stays idempotent, but an offer that does nothing is an overclaim.** Found by D-311's worker (`projectLeave` does not check the owner flag). — owner RECORD.
order: directly after REC-185, the D-311 follow-on: a project left ownerless and an affordance that changes nothing are both the record claiming more than it supports (CLAUDE.md §2) (SCHEDULER #16, 2026-09-23; BOB #31's ruling, via CONDUCT #17)
milestone: M8
interface: I3 — a new refusal on `op=projectleave` and a narrower `op=affordances`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7.4 and §7.6, with BOB #31's ruling of 2026-09-23 21:37Z (BOB folds it into §7 at his next doc landing).
depends-on: D-311 (on `land/conduct/c17-batch3`).
scope: (a) and (b) as ruled.
accepts-when: in a NEW suite `bio-plane/test/rec-186-leave-join.test.mjs`, through the ops: the last owner's leave is refused with the membership rows byte-identical after, a co-owner's leave lands; affordances offers no join to a joined participant and does offer it to an invited non-participant. NEGATIVE CONTROL (`rec-186-leave-join.control.mjs`): drop the owner check, and the refusal arm fails by name; offer join unconditionally, and the join arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (BOB #31's ruling; `node tools/mintid.mjs REC`).

### DIST-7 · queued — **THE INSTALLER UPLOADS EVERY GROUP'S PLANE WITH NO `limits`, SO EACH INSTANCE RUNS AT CLOUDFLARE'S DEFAULT SUBREQUEST LIMIT WHATEVER THE SIGNED RELEASE CARRIES.** Re-read on `91bcea6b`: `newgroup/src/index.mjs` `uploadInstall` and `uploadUpdate` hard-code `main_module`, `compatibility_date` and `compatibility_flags` and send no `limits`. — owner DIST.
order: after D-443, the first installer row: a sovereign group's instance runs under a ceiling its own release does not set, so the project's measured subrequest figure does not reach a group (D-54's finding); product (M7), below the record-integrity rows (SCHEDULER #16, 2026-09-23; D-54's worker via CONDUCT #17)
milestone: M7
interface: I5 (the installer's upload metadata); the integrator classifies.
design: `docs/architecture/BIO_Distribution_v0_1.md` (the installer installs the signed release as released), with IC-82's carry of `compat` from the signed release as the precedent.
depends-on: D-54 (its `limits.subrequests` and `15.subrequest-limit` claim; on `land/conduct/c17-batch3`).
scope: `uploadInstall` and `uploadUpdate` carry `limits.subrequests` from the signed release, as `compat` is carried, never falling back to the default; at the next cut DIST reads `deploy.mjs`'s `limits.subrequests` read-back line (or its UNDETERMINED line) and moves `15.subrequest-limit` to match. UNDETERMINED: whether `/settings` reports `limits` once set; if not, the read-back uses the script-versions API.
accepts-when: `newgroup`'s wizard suite (`newgroup/test/`) asserts both uploads send the release's `limits.subrequests`, and a release without it is refused by name; `status.mjs --check` 0 drift. NEGATIVE CONTROL: drop `limits` from `uploadUpdate`, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-54's worker's finding via CONDUCT #17, verified at the code; `node tools/mintid.mjs DIST`).

### DIST-8 · queued — **SCRATCH ON THE LIVE INSTANCE HOLDS OTHER, GONE SESSIONS' RESIDUE (CPDF-3 counted 17 bundles, 11 aiRuns and more).** BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *scratch hygiene belongs to the session that wrote it; residue left by sessions that are gone is DIST's, swept at each cut's live verification.* — owner DIST.
order: with DIST's rows; one sweep now, then at each cut (SCHEDULER #17, 2026-09-23, LED-7 S17-4)
milestone: M0 (live-instance hygiene)
interface: none
design: `docs/development/VERIFICATION.md` (CLAUDE.md §5: verify live in scratch, swept after), with BOB #32's ruling of 2026-09-23 23:30Z (cite until folded).
depends-on: none.
scope: sweep today's residue from scratch with `store=scratch` named on every call, the record's counters read before and after; add the sweep to DIST's cut verification.
accepts-when: scratch reads empty after the sweep and `bio`'s counters are unchanged. NEGATIVE CONTROL: a sweep call without `store=scratch` is refused (D-456) or moves `bio`'s counters, and the witness arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs DIST`).

### D-485 · queued — **THE DEC-49 GUARD CANNOT SEE REACH THROUGH THE REAL PLANE: under D-433 its R3 counts only codes a MOCK feeds a surface, so "every code a surface can receive carries a canned translation" was false of `NO_CITATION` for months.** Found by UI-83's worker. D-484 closes the instance; this closes the class. — owner the plane estate.
order: after M0-140, with the M0 instruments: it catches a class of defects that reach members (SCHEDULER #18, 2026-09-24; via CONDUCT #19 02:30Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the DEC-49 guard).
depends-on: D-484 (else the new arm reads RED on its first run).
scope: a real-plane reach arm in `civicos-ui/check-refusal-codes.mjs`: a code a real-plane UI suite observes in a surface pane counts toward reach.
accepts-when: the arm lists reached codes and all carry translations. NEGATIVE CONTROL: strip `NO_CITATION`'s translation and the arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### M0-145 · queued — **`run-conditions.test.mjs`'s COLUMN READER MISSES A SQLite DOUBLE-QUOTED IDENTIFIER: `(?:^|[\s,(]|\w\.)${c}\b` (line 492).** Zero instances today. Found by D-482's worker. — owner M0.
order: low in the M0 group: latent, no instance (SCHEDULER #18, 2026-09-24; via CONDUCT #20 03:38Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the negative-control register).
depends-on: none.
scope: add `"` and `'` to the class; an over-strictness arm reading a quoted column.
accepts-when: a quoted column is read. NEGATIVE CONTROL: drop the quotes from the class and that arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-147 · queued — **TWO SUITES READ THE YEAR OFF THEIR OWN CLOCK: `mint-ledger.test.mjs` (line 76) and `opaque-ids.test.mjs` (line 67) set `YEAR = new Date()…slice(0, 4)`, so a run straddling New Year's midnight UTC compares ids minted in one year with the next.** Found by D-487's worker's sweep (the instant-dependent class, D-231, D-487). — owner M0.
order: low in the M0 group: latent, fires only across a year boundary (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:25Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a suite's verdict must not depend on the instant it starts).
depends-on: none.
scope: read the year off the plane's first minted id in each suite, not the suite's clock.
accepts-when: both suites pass under a clock pinned 1 ms before New Year UTC. NEGATIVE CONTROL: restore the clock read under that pin and the id arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-148 · queued — **THE R3-FED WALK KEYS ON LITERALS, so a code fed through a derived const (UI-84's REQUIRED_ARGUMENT_MISSING) is invisible and the walk undercounts by one.** Found by UI-84's worker. — owner M0.
order: low in the M0 group: an undercount of one, stated (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:26Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the DEC-49 guard).
depends-on: UI-84 (its train).
scope: teach the walk to follow a const to its catalogue value; failing that, record the undercount at the walk. WIDENED 2026-09-24 (UI-100's F1): the same walk OVERcounts too — `partitionSuiteLiterals` harvests quoted codes from comments (r3Fed read 81 vs 80): blank /* */ and // spans first (the obsSpans technique). Also correct UI-84's control arm C declaration (declared GREEN; the rename in fact stops the plane — M-139 §7).
accepts-when: r3Fed counts REQUIRED_ARGUMENT_MISSING. NEGATIVE CONTROL: inline-break the const's resolution and the arm names the missed code. A code named only in a comment is not counted.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-152 · queued — **`fleetbundles.control.mjs` ARM 5(b) JUDGES "OUTSIDE THE DOC-FACING SET" BY READING THE SUITE WHOLE (`suiteSrc.includes(needle)`, line ~291), while `gates.mjs` now strips comments (M0-143): the driver and the gate disagree the moment either file grows a `docs/` comment.** Found by M0-143's worker. — owner FLEET.
order: low in the M0 group: a hand-run driver line, not a battery assertion (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:15Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a control coupled to shape must read what the gate reads).
depends-on: M0-143.
scope: read the suite through the same `stripComments` M0-143 uses before the check. WIDENED 2026-09-24 (M0-153's finding b): the doc-facing rule arm 5(b) restates is also stale on comment-blanking and the edge rule — read through `stripComments` (`bio-plane/scripts/walkfloor.mjs`) and assert the derivation THROUGH `gates.mjs`, not a restatement.
accepts-when: the driver's verdict equals `gates.mjs --explain`'s for fleetbundles. NEGATIVE CONTROL: add a `docs/` comment to the suite and the old whole-read line disagrees, the new one does not.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### REC-158 · queued — **THE PROVENANCE PAIR'S BEARER WRITE IS STAMPED `token:<class>` — NOBODY'S NAME — ON WHAT §4.10 CALLS A NAMED MEMBER'S** … (whole text: the cut archive)
order: directly after REC-155, which it waits on (BOB #20's entry): this landing REFUSES a caller, so it follows the session route DRIVEN, keeping D-200's chain-absent population a route to repair (SCHEDULER #5, 2026-09-21)
milestone: M8
interface: I3 — MAJOR, breaking for bearer writers of the pair; the integrator mints the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10, the provenance pair's bullet, with D-421 … (whole text: the cut archive)
depends-on: REC-155 — DRIVEN, not merely landed.
accepts-when: a bearer `apply=1` and a bearer `provenanceroute` are refused by name; a session's succeed and the author written is the session's member, never `token:<class>`; a bearer … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #5 (BOB #20's inbox entry, drained this commit; `node tools/mintid.mjs REC`).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-158» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### UI-75 · queued — **THE ELICITATION READ-BACK NAMES NO SHARED ORIGIN: a member affirming *"fails only if ALL of these fail"* is not told that two** … (whole text: the cut archive)
order: 2 of 2, after REC-161; with UI-74, whichever lands second reuses the first's rendering (BOB #22, 2026-09-21)
milestone: M9
interface: I3 consumer (REC-161's IC).
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 clause (c), with DEC-69: inform once, at the act.
depends-on: REC-161.
accepts-when: two correlated reasons show their origin and the member's answers are written unchanged. How a liar passes it: blocking or reordering the answers on a shared origin, which turns an informing fact into a gate.
added: 2026-09-21 · SCHEDULER #7 (BOB #22's inbox entry, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-75» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.
note: 2026-09-23 by SCHEDULER #17 (CONDUCT #17's 22:00Z finding (1), verified at c17-batch5): REC-161's `partitionindependence` op exists on c17-batch5 and `app.html` calls it nowhere; `elicFalsifier` is a pure string builder. The same commit re-grades `8.partition-independence` to BUILT and drops its `none` probe. Suite `civicos-ui/test/elicitation.test.mjs`; NEGATIVE CONTROL: stub the fetch to return `shared:[]`, and the correlated-fixture arm fails by name.

### UI-78 · queued — **THE PUBLIC HEADER CANNOT SHOW A GROUP'S DISPLAY NAME OR VERIFIED DOMAIN, AND MEMBERS CANNOT SEE A DOMAIN CLAIM'S VERDICT.** … (whole text: the cut archive)
order: directly after REC-164, which it consumes (BOB #24: *"UI (M7), after 2"*) (SCHEDULER #9, 2026-09-21)
milestone: M7
interface: I3 consumer (REC-164's IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §7 (a display name shown WITH the slug, never instead of it; a … (whole text: the cut archive)
depends-on: REC-164, UI-77.
accepts-when: against the real plane, a group with a display name shows it beside the slug; an unverified or mismatched domain never appears on the public header, and members see its verdict. How a liar … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #9 (BOB #24's inbox entry, item 3, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-78» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### MK-7 · queued — **THE ATTRIBUTION ACT, AND THEN THE LIFT OF MK-1's FENCE** (MK-3's replacement (ii), `MEMBER-KNOWLEDGE-DESIGN.md` §4.2–§4.6): an … (whole text: the cut archive)
order: after MK-6, which it rests on, and above MK-5, which rests on it; replaces MK-3 (superseded 2026-09-21). Two points are provisionals carried to Bob, cheap to change until built: §4.4's narrow veto and §4.6's `name` = handle (SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3 — the builder names the op and, if a design names it first, registers it in `op-claims.mjs`' `PLANNED_OPS`.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4.2–§4.6 and §8's row for replacement (ii).
depends-on: MK-6; REC-126 (the review copy, built).
accepts-when: through the ops, each level round-trips into the published projection exactly as chosen; nothing is prefilled; an unchosen reached observation refuses ratification BY NAME; `name` without a … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit; `node tools/mintid.mjs MK`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «MK-7» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### MK-5 · queued — **AN OPINION IS NOT EVIDENCE — a case element with attribution, refused as a basis leg.** — owner RECORD; surfaces are Program B's … (whole text: the cut archive)
order: rests on MK-7's attribution act — re-pointed from MK-3, superseded 2026-09-21 (`MEMBER-KNOWLEDGE-DESIGN.md` §8) (SCHEDULER, first order audit, 2026-09-18; SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §6 (an opinion is not evidence)
depends-on: MK-7 (it carries MK-7's attribution; §8 names MK-3's replacement (ii))
accepts-when: an opinion lands as a case element with its attribution and is refused as a leg, by name, through the ops; battery green by its COMPLETION LINE.
added: 2026-09-18 · CONDUCT #4 (from BOB #14's inbox; MEMBER-KNOWLEDGE-DESIGN.md §8, build-order items 3 and 6.)
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «MK-5» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-147 · queued — UNBLOCKED 2026-09-24 by BOB #32: its dependency is met (M0-71 done, gate on main; M-118). The old block confused an ACCEPTANCE condition with a precondition — the judgement this row builds is what the gate measures. RULED: accepts-when adds that the run REPORTS recall beside false conflicts on M0-71's gate (the gate alone cannot see a detector that abstains); a judgement whose recall does not beat the lexical baseline's 2/9 (M-118) is the finding and returns to BOB.
order: blocked on M0-71's measured gate (SCHEDULER, 2026-09-19)
milestone: M9
interface: I3 and I5 (a table; ICs minted with `node tools/mintid.mjs IC`)
design: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §5 (the judgement and its vocabulary), §8 (where a candidate lives) and §9 item 3.
depends-on: M0-71, AND its measured gate met — a threshold missed is the finding, and this row then goes back to BOB.
accepts-when: M0-71's gate passes on the built judgement; a re-run over unchanged referents writes nothing new; every row names both referents and versions, the key, the run, the label and … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 3).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-147» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.
note: 2026-09-23 by SCHEDULER #17 (M0-71's worker, via CONDUCT #18): the contradiction gate cannot see a detector that ABSTAINS (recall 2/9 sits beside it); this row stays blocked until its machine judgement is measured on this gate WITH its recall reported. The measurement is M-118 (M-117 was burned by a collision).

### UI-69 · queued — **EXPORT OF A REVIEW COPY carrying the quartet in-band on every page, with §6A.3 point 2 said AT the act: what leaves cannot be revoked; the grant can.** — owner UI.
order: after UI-68 and REC-148: export only once the quartet travels with it (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 consumer (REC-148's IC)
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 point 2.
depends-on: UI-68 and REC-148.
accepts-when: an exported copy carries the quartet on every page byte-equal to the plane's; the statement renders at the act and nowhere else. NEGATIVE CONTROL: drop the quartet from one … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 8).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-69» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-147 · queued — **A RECORDS REQUEST IS ONE ROUND TRIP: `awaiting_response` HIDES THE FEE ESTIMATE, THE WAIVER DECISION, A PARTIAL PRODUCTION AND** … (whole text: the cut archive)
order: directly after D-149, on D-148's entry grammar, which it extends (BOB #27: *"depends-on D-148"*), the M10 action path (SCHEDULER #14, 2026-09-22; BOB #27's inbox entry, item 2)
milestone: M10
interface: I3 and I5 — correspondence entry kinds, a closed outcome vocabulary and a stated due date; the … (whole text: the cut archive)
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, *THE RECORDS-REQUEST LIFECYCLE* (BOB #27, 2026-09-22), bound by D-149.
depends-on: D-148 (the entry grammar it extends); D-149 (a stated due date names one of the action's citations).
accepts-when: a request, a fee estimate, a waiver decision, a partial production and an appeal read back as one dated chain; an entry with no stated due date reads UNDETERMINED; a stated … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #14 (BOB #27's inbox entry, item 2, drained this commit; D-147's DEBT row of 2026-08-01; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-147» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-196 · queued — **A READ NAMING A DISCOVERABLE PROJECT'S OWN ID ANSWERS "DOES NOT EXIST" TO A MEMBER THE DIRECTORY HAS JUST SHOWN IT TO.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *POSITIONAL WINS for the PROJECT ITSELF: an uninvited member session naming a discoverable project's own id gets the positional refusal (not a participant; id and name only); anything INSIDE the project answers exactly as today; `viewerPredicate` unchanged.* — owner RECORD.
order: before REC-150, the §7.14 sequence (SCHEDULER #17, 2026-09-23; REC-149's worker)
milestone: M8
interface: I3 — the project-id read's refusal; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.14), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-149.
scope: the project-itself read gives a discoverable project's positional refusal; contents keep the existence answer. Extend `bio-plane/test/project-sight.test.mjs`.
accepts-when: a discoverable project's id reads the positional refusal naming id and name; a bundle inside it still reads as absent. NEGATIVE CONTROL: answer "does not exist" for the project itself, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-197 · queued — **CREATE AND FORK DO NOT CARRY THE DISCOVERABLE SETTING, AND A MACHINE CREDENTIAL'S OWNERLESS PROJECT HAS NO RULE.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *create and fork take one optional `visibility` (`discoverable` or `hidden`), absent means HIDDEN; a MACHINE credential never sets it (an ownerless project has no owner to choose): its creation is HIDDEN and `visibility=discoverable` from one is refused by name.* — owner RECORD.
order: directly after REC-196 (SCHEDULER #17, 2026-09-23)
milestone: M8
interface: I3 additive — the `visibility` field and one refusal; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.14), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-149.
scope: the field on both acts, the fail-closed default, the machine refusal. Extend `bio-plane/test/project-sight.test.mjs`.
accepts-when: an absent field creates HIDDEN; a machine's `discoverable` is refused by name. NEGATIVE CONTROL: default to discoverable, and the fail-closed arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-150 · queued — **DISCOVERABLE OR HIDDEN, 2 of 4: THE REQUEST TO JOIN — ask (one open per member per project, optional comment), withdraw** … (whole text: the cut archive)
order: after REC-149, whose EXISTENCE level it needs (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 (an IC minted with `node tools/mintid.mjs IC`)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14 and §7.4 (a grant is an invitation … (whole text: the cut archive)
depends-on: REC-149.
accepts-when: a grant leaves the requester `invited` and NOT `joined`; a lapsed requester reads their own request and nothing else about the project; an administrator's grant is refused. … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 2).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-150» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### UI-70 · queued — **DISCOVERABLE OR HIDDEN, 3 of 4: the create and fork forms ASK, with neither preselected, and cannot submit without the choice** … (whole text: the cut archive)
order: after REC-149, and after UI-66 on the same forms (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's IC)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14, with DEC-69 (forced, at the act).
depends-on: REC-149; and the create and fork forms as UI-66 leaves them (same forms — one worker at a time).
accepts-when: the harness cannot submit a create or fork without the choice, and nothing is preselected; the owner changes the setting and a non-owner sees it read-only. How a liar passes … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 3).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-70» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### UI-71 · queued — **DISCOVERABLE OR HIDDEN, 4 of 4: the directory; the request button and comment; the owner's queue of open requests with grant** … (whole text: the cut archive)
order: after REC-149 and REC-150 (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's and REC-150's ICs)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14.
depends-on: REC-149 and REC-150.
accepts-when: the harness requests, the owner grants, the requester sees `invited` and joins by the checkbox, all against the real plane; a hidden project never appears in the directory. … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 4).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-71» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-134 · queued — **NO SURFACE PERFORMS §4.9's CUSTODIAL ACTS: `memberadd`, `memberset`, `signeradd` and `signerset` have ZERO call sites in** … (whole text: the cut archive)
order: with the M8 features after D-126, a surface over built ops; BOB #17 ordered it behind D-136's fence (*"a member surface over an act whose voter the caller can name is a SECOND path to a forgeable vote"*), which is built, and BOB #18 discharged BOB's half; it rests on REC-159's session reach (SCHEDULER #13, 2026-09-22, LED-7 batch S13-1)
milestone: M8
interface: I3 consumer (the four ops, reachable from an enrolled administrator's session once REC-159 lands).
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 (each custodial act is EVERY … (whole text: the cut archive)
depends-on: REC-159 (the four ops reach an enrolled administrator's session).
accepts-when: against the real plane, the founder's and an enrolled administrator's sessions each perform all four, attributed to them; a member's session renders none of the four. How a … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #13 (LED-7 batch S13-1; D-134's DEBT row of 2026-08-01, BOB #17's order and BOB #18's discharge; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-134» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### UI-76 · queued — **NO SURFACE LETS A MEMBER DECLARE, TEST OR PLACE A THEME, OR SHOWS WHOSE LENS A THEME IS.** D-162's surface half, item 2 of BOB #23's entry. — owner UI.
order: directly after D-162, which it consumes (BOB #23: *"UI (M8), after 1"*) (SCHEDULER #9, 2026-09-21)
milestone: M8
interface: I3 consumer (D-162's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.4, fences 1–3 (the cover on every reading; the … (whole text: the cut archive)
depends-on: D-162.
accepts-when: the harness declares, tests and places against the real plane, the cover shown on every theme it renders; a proposal renders as a hunch, never as membership. How a liar passes … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #9 (BOB #23's inbox entry, item 2, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-76» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-235 · queued — **`op=basisversions` DOES NOT PUBLISH A VERSION'S `kind`: `basisVersions` selects every column of `inquiry_basis_versions`, `kind` among them, and the answer carries no `kind` key, so the same version reads a kind from `op=suggest` and none from here.** — owner RECORD.
order: after D-241 (SCHEDULER #17, 2026-09-23, LED-7 S17-2)
milestone: M3
interface: I3 additive — one field; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §9 (what a SUGGESTION is).
depends-on: none.
scope: `kind` in each version of the answer. Extend `bio-plane/test/suggest.test.mjs`'s cross-op arm. The row's other half (the sweep's reach) is stated in `rec75-sweep.mjs`'s header and is not rowed.
accepts-when: a version with a kind reads the same kind from both ops. NEGATIVE CONTROL: drop the key, and the cross-op arm fails on `kind`.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-191 · queued — **A CAPTURE ASSEMBLED FROM REUSED PARTS DOES NOT STATE ITS TEMPORAL SPREAD: `subresources.mjs` records each part's `reused_from_fetched_at`, and nothing computes the earliest and latest fetch instants of the composite.** — owner CAPTURE.
order: after D-235, with the product rows before the M0 group: the record holds the instants and does not say what they add up to (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M2
interface: I5 additive — the manifest's spread; the integrator mints and classifies the IC.
design: `docs/development/CAPTURE-SCALING.md` §"Checking that a reused asset is still the same" and §"Re-fetch at ratification is mandatory".
depends-on: CAP-14 (`reused_from`, `integrated` on c17-batch5).
scope: the capture manifest (or its reading) states the earliest and latest part-fetch instants of a composite. Extend `bio-plane/test/subresources.test.mjs`.
accepts-when: a composite whose parts were fetched at two instants states both. NEGATIVE CONTROL: drop the spread, and the two-instant arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-320 · queued — **THE PASS-THROUGH JPEG ROUTE CANNOT BE TRANSCRIBED IN-ISOLATE: `ocr-worker`'s `transcribe.mjs` refuses every non-PNG route (PIXELS_UNREADABLE), so 17 of CPDF-12's 24 image-only pages (DCT) go untranscribed; 8-bit rotation is not built either (`pagepixels.mjs`).** — owner CONTENT-PDF.
order: with the M2 extraction rows, after D-191: the route with the strongest provenance reads nothing (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: I6 — the member's pixel route; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §6 (which gains the gap's statement).
depends-on: none — CPDF-12's census answered the share.
scope: a baseline DCT decoder in the member, checked against Pillow digests as `pagepixels.test.mjs` does; after decoding apply `/Rotate` (3 of the 24 are /Rotate 270; from D-244); 8-bit rotation. Extend `pdf-worker/test/pagepixels.test.mjs` and `ocr-member-e2e.test.mjs`.
accepts-when: a DCT image-only page transcribes, rotated, and its pixel hash matches Pillow's. NEGATIVE CONTROL: a no-op decoder fails on the digest by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-312 · queued — **`memoryUsageBytes` IS NOT A FRACTION OF THE 128 MB ISOLATE, AND LIVE SITES STILL SAY "of 128 MB": `agent-worker/src/index.mjs` (the shipped `BOUND_SOURCE`, and the segment bound sized on that reading), `fl1-cpu-probe.mjs`, `INTERFACES.md` §"The segment bound…", `pagepixels.mjs`.** The rule is stated in `INTERFACES.md` §"The memory bound, and how it is expressed". — owner FLEET, CONTENT-PDF.
order: after D-320, the M2 measurement corrections: a shipped bound rests on the misreading (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M0 (measurement wording, and one shipped bound)
interface: none — wording, and a re-check of one bound.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for the rule stated in `docs/development/INTERFACES.md` §"The memory bound, and how it is expressed".
depends-on: none.
scope: correct each live site; re-check the agent-worker segment bound against the rule and state the result.
accepts-when: no live site divides by 128 or says "of 128"; the bound's re-check is recorded. NEGATIVE CONTROL: a grep arm over the live sites fails by name on a planted "of 128 MB".
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-460 · queued — **DIAGNOSIS: SOME TIER-3 AGENDAS AND MINUTES READ AS GENERIC, AND NOBODY KNOWS WHY.** FW-20 observed it on its walk (M-121, on c18-batch8) without diagnosing it; one suspected cause is that the OCR member transcribes one page per invocation and the plane reads only the first. Its finder's session is archived and no CONTENT-PDF lane is live, so the diagnosis is rowed. — owner CONTENT-PDF.
order: after D-312, with the M2 extraction measurements: a possible silent under-read of scanned civic records, the class CLAUDE.md §2 ranks worst if confirmed (SCHEDULER #17, 2026-09-23; CONDUCT #18 23:51Z)
milestone: M0 (a diagnosis — a measurement)
interface: none until the fix is named.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for FW-20's M-121 walk.
depends-on: FW-20 (`integrated` on c18-batch8; M-121 lists the walk).
scope: take the tier-3 walk documents M-121 names as agendas or minutes that read generic; establish whether the member transcribes one page per invocation and the plane keeps only the first; name the fix, or show the documents are generic.
accepts-when: the named fix (then placed as its own row) or the refutation, recorded with date and instrument. NEGATIVE CONTROL: a two-page scanned fixture whose second page alone carries the agenda heading reads generic before the fix, or the refutation shows it read whole.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-465 · queued — **D-447's FIX COSTS SEARCH TIME: over 2,000 visible documents `q=culvert` takes 210 ms against 74 ms on `main`, because `highlight()` re-tokenises.** Measured by D-447's worker; its size at a real instance is UNDETERMINED. — owner RECORD.
order: with the M0 measurements, behind the product rows: fix only if it matters at real size (SCHEDULER #17, 2026-09-23; D-456's and D-447's workers via CONDUCT #18 00:05Z)
milestone: M0 (a measurement, then a fix if owed)
interface: none unless the fix is built.
design: `docs/development/VERIFICATION.md` (measure; do not recall).
depends-on: D-447 (`integrated` on c18-d456).
scope: measure the query time at a real instance's size; if it matters, compute per-term tf from an `fts5vocab` instance table instead.
accepts-when: the figure is recorded with date, instrument and size, and either the fix brings it back or the record states why none is owed. NEGATIVE CONTROL: the measurement at 2,000 documents reproduces the 210 ms figure within tolerance.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-473 · queued — **`.odt` AND `.odp` EXPORTS STAY UNDETERMINED FOR BYTE STABILITY: D-351's `.odt` normalisation (strip `xml:id` on `text:list`) was never re-measured over the population, because the worker's pull of CAP-11's scratch captures was refused (PII) and it did not route around the refusal.** — owner CAPTURE.
order: with the M0 measurements, after D-465: widening to `.odt` is a measurement first (SCHEDULER #17, 2026-09-24; D-351's worker via CONDUCT #19)
milestone: M0 (a measurement)
interface: none until widened.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for D-351's normalisation.
depends-on: D-351 (finished; rides the train after c19-batch9).
scope: re-measure the `.odt` and `.odp` normalisation over a population the lane may read (never by routing around a refusal); widen only on the figure.
accepts-when: the stability figure is recorded with date, instrument and population, and the formats are widened or stated undetermined on it. NEGATIVE CONTROL: skip the `xml:id` strip, and the re-fetch pair reads unstable by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).
note: 2026-09-24 by SCHEDULER #19 (D-472's worker F2, via CONDUCT #20 20:14Z): the monitor's cry-wolf survives for Google Docs and Slides (.odt, .odp) because only .ods has a measured container digest; land the .odt normalisation with an ODF_EVIDENTIARY_MEASURED row once measured, and name a census target for .odp.

### D-515 · queued — **NO COMMITTED FIXTURE IS A PDF WHERE TIER 2 GENUINELY DECODES FEWER GLYPHS THAN TIER 1, so D-501's degradation arm is proved on synthetic input only.** Found by D-501's worker (F1). — owner CONTENT-PDF.
order: after D-473, with the measurements: the case is covered synthetically; a real page raises the evidence, not the behaviour (SCHEDULER #19, 2026-09-24; via CONDUCT #20 17:51Z)
milestone: M2
interface: none — a fixture and an arm.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with `docs/development/VERIFICATION.md` (measure; do not recall).
depends-on: D-501.
scope: search the bytes already held for a page where tier 2 decodes fewer glyphs; commit one as a fixture and drive D-501's award over it, or record with date and instrument that the corpus holds none.
accepts-when: a real page's award keeps tier 1 by glyph count, or the search is recorded empty. NEGATIVE CONTROL: award by raw length and the real-page arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### FW-24 · queued — **THE WHOLE-CORPUS DOCUMENT-TYPE CENSUS IS NOW TAKEABLE AND NOT TAKEN: Legistar answered during FW-22, so the census can run over the whole corpus (`M032_HALVES=bucket`) instead of the sampled halves.** FW-22's worker (finding 3, via CONDUCT #20 21:21Z). — owner FRAMEWORK.
order: after D-515, with the measurements: EXTRACTION-BREADTH §2's rule that a count comes before any reader (SCHEDULER #19, 2026-09-24)
milestone: M2
interface: none — a measurement.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §2 "Readers beyond three — the rule, and the order".
depends-on: FW-22.
scope: run the census instrument over the whole corpus with `M032_HALVES=bucket`, FINANCIAL REPORT counted apart (FW-22); record each class's count with interval, date and instrument; restate §2's order if the counts move it.
accepts-when: MEASUREMENTS carries the whole-corpus counts with their instrument and date (the measured failure it moves: the order resting on sampled halves only). NEGATIVE CONTROL: fold FINANCIAL REPORT back into budget and the class count moves, by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs FW`).

### DIST-14 · queued — **THE CSV SIZE BOUND (20 MiB, reused from COFF-6) IS NOT SETTLED: node measured 254.5 MiB of heap at the bound against Cloudflare's documented 128 MiB isolate (their claim), and local workerd walked a 73.6 MB body without the production cap applying.** FW-23's worker (finding 2, via CONDUCT #20 21:52Z). — owner DIST.
order: after FW-24, with the measurements: the deciding figure needs a deployed plane, so it follows FW-23's landing and DIST's next deploy (SCHEDULER #19, 2026-09-24)
milestone: M2
interface: none unless the bound moves (the integrator classifies).
design: `docs/development/OFFICE-FORMATS.md` "CSV — DESIGNED 2026-09-24 by BOB #32", with `docs/development/VERIFICATION.md` (measure; do not recall; a vendor's documentation is their claim).
depends-on: FW-23.
scope: on the DEPLOYED plane, read a CSV just over 20 MiB in the scratch namespace (store=scratch named, counters witnessed before and after), record memory outcome and time in `measurements/<id>.md`; if it fails, set the bound from the measured ceiling and state it at the site. Costs 1 of 166 keys.
accepts-when: the measurement is recorded with date, instrument and the build that answered, and the bound is either confirmed or re-set from it (the measured failure it moves: a bound resting on a node heap figure and a vendor claim). NEGATIVE CONTROL: a CSV just under the bound reads clean, so a failure above it is attributable to size.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs DIST`).

### D-321 · queued — **NO REAL IMAGE-ONLY PAGE IN THE CORPUS CARRIES AGENDA-SHAPED TEXT, SO THE `reading_refs` JOIN OVER REAL OCR IS PROVED ONLY ON SYNTHETIC INK (`ocr-member-e2e.test.mjs`).** — owner CONTENT-PDF.
order: after D-320; the page must come from bytes already held (the cloud proxy refuses Legistar) (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: none — a fixture and an arm.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §16.
depends-on: none — the page comes from bytes already held; D-313 (the image-only corpus) is a stated limitation.
scope: commit one real scanned-agenda page image to the OCR fixtures; drive the join over it.
accepts-when: a real page's OCR yields a `reading_refs` hit. NEGATIVE CONTROL: switch the recogniser off, and the join reads empty by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-346 · queued — **THE THREE OPENDOCUMENT ENTRIES EMIT NO `core-properties` AND NO `intra` LINK: `odf.mjs` never reads `meta.xml` or the manifest and says so with `outside_content_xml_not_read` markers, while Content Framework §16 says the formats "preserve the same evidence".** — owner COFF.
order: after D-320 (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: I2 — the ODF part-map gains two item kinds; the integrator mints and classifies the IC.
design: `docs/development/OFFICE-FORMATS.md` §"What each part-map offers, and where it maps onto I2".
depends-on: none.
scope: read `meta.xml` into `core-properties`; walk the manifest for sha256 `intra` links; remove both markers. Extend `bio-plane/test/formats-odf.test.mjs`.
accepts-when: a planted creator appears as a `core-properties` item; a package without `meta.xml` still states the absence. NEGATIVE CONTROL: skip the `meta.xml` read, and the planted-creator arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### REC-204 · queued — **AN OFFICE DOCUMENT'S ENVELOPE IS EXTRACTED AND NEVER CONTENT: tracked-change authors, comments, core properties and speaker notes are emitted by the format parsers and never projected, indexed or searchable (`textUnitsFor`: *"SPEAKER NOTES ARE NOT INDEXED"*).** Under DEC-5, surface it all. — owner RECORD.
order: with the M2 extraction rows, after D-346 (SCHEDULER #17, 2026-09-23; D-124's first row, placed under a new id because D-124 names two rows)
milestone: M2
interface: I2/I5 — a NINTH extent kind, `envelope`, with an item-kind field; the integrator mints the IC for the extent census.
design: `docs/development/OFFICE-FORMATS.md` "THE ENVELOPE AS CONTENT" (on `land/bob/rulings-0923b` @ fd93bf1d, riding the next train): the extent carries the capture's grade, `cited_as` distinguishes it, and it is indexed LABELLED as envelope.
depends-on: none.
scope: the `envelope` extent and its projection; index each item labelled as its kind. Extend `bio-plane/test/search.test.mjs`.
accepts-when: a passage search finds a tracked-change author and speaker-note text, each labelled as envelope. NEGATIVE CONTROL: drop the envelope arm, and the tracked-change-author search returns 0 by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-375 · queued — **`OBSERVATION-LOG-DESIGN.md` §4.2's FOURTH OUTCOME HAS NO PRODUCER: the persisted reading carries no character count, so `contentObservationsFor` cannot write LOOKED_ABSENT for a scan read to nothing, and it reads PRESENT.** `counts.chars` exists at acquire and is dropped. — owner CAPTURE, then RECORD.
order: after D-346: a read that claims more than it holds, CLAUDE.md §2's worst class (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M3
interface: I5 additive — the reading's count; the integrator mints and classifies the IC.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §4.2.
depends-on: none.
scope: persist `counts.chars` on the reading at `op=acquire`; add the LOOKED_ABSENT branch in `contentObservationsFor`. Extend `bio-plane/test/observation-content.test.mjs` beside B8.
accepts-when: a scan read to zero characters writes LOOKED_ABSENT. NEGATIVE CONTROL: drop the count, and that arm reads PRESENT and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-374 · queued — **A `pdf-page` EXTENT'S `rect` IS BOUNDED BY NOTHING: `checkContentExtent` asks only for four finite numbers, while `pagepixels.mjs` already computes each page's MediaBox and the plane never receives it.** — owner CONTENT-PDF, CAPTURE, RECORD.
order: after D-375: content minted on a region the page does not have (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I5/I6 — per-page `{w,h}` on the reading (nullable); the integrator mints and classifies the IC.
design: `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §6 (which gains the bound).
depends-on: none.
scope: carry per-page dimensions onto the reading; the extent check refuses a rect outside the MediaBox by name (the stricter mechanism; clip-and-state is the architect's alternative if preferred). Extend the extent suite.
accepts-when: `[0,0,999999,999999]` is refused by name; a rect inside mints. NEGATIVE CONTROL: drop the bound, and the oversize arm mints and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-415 · queued — **A WORKBOOK'S `sheet-range` UNITS ARE WHOLE SHEETS ONLY: `formats-xlsx.mjs` turns `definedNames` into anchor links and emits one `usedSheetRange` per sheet; table parts and ODF named ranges are not read.** — owner COFF.
order: after D-374 (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I2 — finer sheet-range units; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.3 item 1.
depends-on: none.
scope: a defined name and a table part each emit a `sheet-range` unit; a multi-area name is skipped with a stated reason. Extend `bio-plane/test/fw19-extent-arms.test.mjs`.
accepts-when: a fixture's defined name emits its unit. NEGATIVE CONTROL: before the fix the defined-name arm emits none and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-416 · queued — **A READING POSITION CANNOT FALL INSIDE A `sheet-range` EXTENT: `readingPositionInExtent` (`textchain.mjs`) returns false whenever the reading's arm and the extent's differ, so a cell reading never earns the connection its range should.** The image-rect and `doc-table` halves wait on readings that carry rects and paragraph spans (D-352). — owner FRAMEWORK.
order: after D-415, which emits the units it reads (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: none — the containment predicate.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.2.
depends-on: D-415.
scope: the `sheet-range` half: a cell reading inside a range is contained. Extend the textchain suite.
accepts-when: a cell reading inside a sheet-range earns a connection. NEGATIVE CONTROL: restore the arm-mismatch false, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-419 · queued — **THE CROP OF A CITED PDF IMAGE EXISTS AND NOTHING CAN ASK FOR IT: `cropImage` lives only in `pdf-worker/src/imagecrop.mjs`, with no route and no plane op.** — owner CONTENT-PDF, then RECORD; a UI item renders it.
order: after D-416; display only, behind every over-claim (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I6 — a `POST /crop` route; I3 — a read-only op; the integrator mints and classifies the ICs.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.4.
depends-on: none.
scope: the member route and a read-only plane op returning the crop for a cited image extent. Extend `pdf-worker/test/` and a plane suite.
accepts-when: a cited image extent returns its crop through the op. NEGATIVE CONTROL: route to the whole page, and the crop-dimensions arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-246 · queued — **A RENDERING'S FILE HASH IS RUNTIME-DEPENDENT, AND DEC-41 ASKS FOR A HASH ANY COPY CAN CHECK.** BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *BOTH, LABELLED: `published_shas` carries the PIXEL hash (`pixels_sha256`, identical across node, workerd and Pillow) as the verifying value; the file hash is recorded beside it as "this file's bytes", for information only.* — owner CONTENT-PDF, then RECORD.
order: with the M2 extraction rows, after D-419 (SCHEDULER #17, 2026-09-23, LED-7 S17-4)
milestone: M2
interface: I3/I5 — `published_shas` for renderings; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.4 (the crop), with DEC-41 and BOB #32's ruling of 2026-09-23 23:30Z (cite until folded).
depends-on: D-419 (renderings reach the plane).
scope: when renderings join `published_shas`, the verifying value is `pixels_sha256`, the file hash beside it labelled; `imagecrop.mjs` already emits both.
accepts-when: a rendering published from workerd verifies against a Pillow-computed pixel hash. NEGATIVE CONTROL: verify by the file hash, and the cross-runtime arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-4; keeps its `D-` id).

### REC-206 · queued — **AN AGENDA ITEM'S MEMBERSHIP IN A FILE EXISTS ONLY AS RECT CO-LOCATION AN INSTRUMENT INFERS: tier-1 text units carry no position and a LinkRecord carries no anchor text.** BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *DESIGN IT — I2 gains position on tier-1 text units (page and rect) and anchor text plus a rect on LinkRecord; membership is DERIVED from containment, labelled machine work and graded inferred, never presented as the publisher's link.* — owner CONTENT-PDF, then RECORD.
order: with the M2 extraction rows, after D-246; I2 PROVISIONAL, RECORD after PDF, as ruled (SCHEDULER #17, 2026-09-23, LED-7 S17-4; CPDF-3's worker)
milestone: M2
interface: I2 PROVISIONAL — positions and anchors; I3 — the derived membership; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 (BOB folds it), with BOB #32's ruling of 2026-09-23 23:30Z (cite until folded).
depends-on: CPDF-3 (`integrated`).
scope: the PDF member emits page and rect per tier-1 unit and anchor text plus rect per link; the plane derives item-to-file membership by containment, labelled and graded inferred.
accepts-when: an agenda's item-to-file membership reads derived, labelled machine work, graded inferred. NEGATIVE CONTROL: present it as a publisher link, and the labelling arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-340 · queued — **CHROME IS A PROPERTY OF THE SITE AND THE PLANE RECORDS IT NOWHERE: `site_chrome` exists only in `LINK-FIDELITY.md`, which RATIFIES it as a derived table regenerable by scan; no table and no per-host navigation-change read are built.** — owner CAPTURE, then RECORD.
order: after D-419, with the M4 extraction rows (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I5 — a derived table (in `purge`); I3 — a per-host read; the integrator mints and classifies the ICs.
design: `docs/development/LINK-FIDELITY.md` §"Chrome: rendering and connection are different problems".
depends-on: none.
scope: derive `site_chrome` per host by scan, add it to `purge`, and a read naming links a host's navigation lost between captures.
accepts-when: two captures of one host whose nav lost a link make the read name that link. NEGATIVE CONTROL: derive per page instead of per host, and the arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-177 · queued — **THE CAPTURE GRADE BELOW THE CEILING IS STILL AUTHORED: `store.mjs` says *"there is no per-document capture grade anywhere in this schema"*; `#legEarnedCapture` applies REC-88/105's CEILING, not a measured value, so a member-authored grade under it stands unmeasured.** — owner CAPTURE, then RECORD.
order: after D-191 (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M9
interface: I3/I5 — a derived per-capture grade read by the strength walk; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part I (the chain rules), with DEC-4 and DEC-75 (*capture grade is about the fetch path*).
depends-on: none — the ceiling (REC-88, REC-105) is built.
scope: derive a per-capture grade from `captured_locators.via` plus authority state, read it in `#strengthWalk`. The letter for a non-direct `via` is UNDETERMINED by any ruling found; if none covers it, that part goes to BOB (REC-50's precedent) and the row builds the direct case first.
accepts-when: a member-authored C on a direct capture reads the earned grade, not the authored one. NEGATIVE CONTROL: read the authored grade again, and that arm fails by name. Extend the strength suite.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-194 · queued — **A MEMBER'S LEAD HAS A PLANE AND NO SURFACE: `op=lead`, `leadlook`, `leadread` and `leadshare`, the `leads` table and the internet frontier's read of them are built (`status.mjs` 10.lead), and `app.html` makes no lead call.** — owner UI.
order: after D-177, a member surface on a built plane (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M4
interface: I3 consumer.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5 (the lead's surface).
depends-on: none — the plane half is built.
scope: a member writes a lead, records a look, and sees the frontier's LOOKED_ABSENT against it; the lead is shared only by the member's act. New harness in `civicos-ui/test/`.
accepts-when: a member writes a lead, records a look, and sees LOOKED_ABSENT against it. NEGATIVE CONTROL: stub `op=lead`, and the write-and-look arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; the plane half closed; keeps its `D-` id).

### D-189 · queued — **NO SURFACE CAN SAY A PROJECT CARRIES ITS OWN BIAS: `op=biasmanifest` computes the effective set with project nullifications, `7.ui` is ABSENT, and `app.html` still says *"DECLARED BIAS is the HUNCH legs and nothing else"*.** — owner UI.
order: after D-194 (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M8
interface: I3 consumer.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption" (DEC-46).
depends-on: none — the manifest read is built.
scope: the project and publication surfaces read the manifest at project scope and state that the project carries its own bias; the hunch-only sentence is corrected. New harness in `civicos-ui/test/`.
accepts-when: a project with an adopted set shows it; an empty manifest shows no indicator. NEGATIVE CONTROL: render the indicator on an empty manifest, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### REC-201 · queued — **A RECORDS REQUEST CAN ONLY BE A CALIFORNIA ONE: the action kind is `cpra_request`, and sovereign groups sit outside California.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *DESIGN DIRECTION ADOPTED — a law-neutral `records_request` kind carrying a `law` field; `cpra_request` stays readable as written.* — owner RECORD.
order: behind the current M9/M10 product rows, as ruled (SCHEDULER #17, 2026-09-23; D-149's builder)
milestone: M10
interface: I3/I5 — a new action kind; the integrator mints the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: D-149 (`integrated` on c17-batch7).
scope: the `records_request` kind with its `law` field alongside D-149's governing-laws list; existing `cpra_request` actions read unchanged. Extend D-149's suite.
accepts-when: a `records_request` under a non-California law files and reads its law; an old `cpra_request` reads byte-identically. NEGATIVE CONTROL: rewrite `cpra_request` on read, and the unchanged arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-202 · queued — **A MEMBER CANNOT TAKE UP OR SET ASIDE AT THE INQUIRY'S GRAIN: the code declares an `options_grain` gap (offered at document grain, missing at inquiry grain) in `store.mjs`'s findings producers, and no row carried it.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *row it — a missing member door.* — owner RECORD if an op is missing, UI otherwise; check at the code at spawn.
order: behind the current M9/M10 product rows, before the M0 group (SCHEDULER #17, 2026-09-23; D-213's residue)
milestone: M9
interface: I3 — possibly an act; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §8 (the inquiry's QUESTION is a first-class object), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: none — PL-15's out-of-inquiry lead is built.
scope: offer "take this up" and "set aside" at the inquiry grain wherever the code declares the gap; close the declared `options_grain` entries.
accepts-when: a member takes up and sets aside a finding at the inquiry grain, and no declared `options_grain` gap remains. NEGATIVE CONTROL: withhold the inquiry-grain option, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### M0-139 · queued — **TWO ARMS OF `current.control.mjs` CANNOT FAIL: arm 8 refuses to arm (its anchor occurs twice in `store.mjs` since REC-124 added `#findingsConcludedElsewhere` with `#findingsStanceDiverged`'s guard), and arm 7's must-fail name survives in `current.test.mjs` only as a comment, and no suite asserts `no_project_scope`.** Predates D-125 (read on 91bcea6b, main and c17-batch4). — owner M0.
order: first of the M0 rows, ahead of process tooling: a negative control that cannot fail is a product suite (the queue's findings) left unverified, not a gate-time tool (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:43Z finding (3), verified by string count)
milestone: M0
interface: none — a control and one assertion.
design: `docs/development/VERIFICATION.md` (the negative control and its `NEGATIVE CONTROL:` line; CLAUDE.md §5's *"Run the negative control"*).
depends-on: none.
scope: split arm 8 into 8a and 8b, each anchored on its producer's signature line plus the guard; add a `current.test.mjs` assertion driving a finding filed under no project to `available:false, reason:"no_project_scope"` and point arm 7's must-fail at it.
accepts-when: `node bio-plane/test/current.control.mjs` reports every arm run and 0 NOT as declared; 8a and 8b each fail "PURGE THE SHARED QUESTION AND BOTH ITEMS GO QUIET", arm 7 fails the new no-scope assertion by name. NEGATIVE CONTROL: the control's own arms, each recorded on the suite's `NEGATIVE CONTROL:` line.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs M0`).

### M0-171 · queued — **`versions.test.mjs` HARVESTS SCHEMA TABLES WITH A LOOSE PATTERN (`/CREATE TABLE IF NOT EXISTS (\w+)/g`, ~line 719), so it still counts the prose phantom `would` that M0-155 removed from the census.** Found by M0-155's worker. — owner M0.
order: after M0-160, beside the probe-accuracy rows (SCHEDULER #18, 2026-09-24; via CONDUCT #20 17:07Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument counts code, not prose).
depends-on: M0-155.
scope: add the `\s*\(` tail `hygiene.test.mjs` (~line 685) uses; re-read the table count from its print.
accepts-when: versions.test's table census equals M0-155's 114. NEGATIVE CONTROL: drop the tail and the `would` phantom returns, failing by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-172 · queued — **`status.control.mjs` LEAVES ITS PEN BEHIND (`.status-harness/`, 25 KB `pristine.status`), and `.gitignore`'s pen preamble mis-cites WORKER.md.** BOB #33 RULED (17:12Z): a control driver's PEN is not a session's SCRATCH; in-worktree, gitignored, item-named pens STAND. — owner M0 (fold into any open M0 batch).
order: after M0-171, small; fold into an open M0 batch rather than its own gate (BOB #33, 17:12Z; SCHEDULER #18) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a driver cleans up after a clean run), with BOB #33's ruling of 17:12Z (cite until folded).
depends-on: M0-155.
scope: (1) status.control.mjs removes `.status-harness/` on a clean run; (2) `.gitignore`'s pen preamble says pens are a driver's mechanism, gitignored and item-named, distinct from session scratch; (3) WORKER.md's scratch bullet adds "a control driver's declared, gitignored pen is not scratch".
accepts-when: a clean status.control.mjs run leaves no `.status-harness/`. NEGATIVE CONTROL: remove the cleanup and the pen-gone arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (BOB #33 inbox 17:12Z; `node tools/mintid.mjs M0`).
scope-add: 2026-09-24 by SCHEDULER #19 (via CONDUCT #20, 17:25Z and 18:17Z): control drivers writing `${file}.pristine-<arm>` beside the source, an UNDECLARED pen BOB's ruling does not stand — battery-residue, contradiction-overstrict, d249-port, d301-census, d389-fullfetch, dec65-strength-reach, m041-instrument-census, m057-authority, rec174-supplyfetch, tally-through-pipe, walkfloor, and every `nc-*.mjs` harness (D-499 fixed nc-d64). Fix: a PEN from `mkdtempSync(join(tmpdir(), "<tag>-control-"))`.

### M0-174 · queued — **`mintid`'s `D` NAMESPACE STILL GRADES DUPLICATES ACROSS TWO SHAPES AS ONE: since DEBT's retirement (M0-140) a `D-` is minted as a PLAN ROW, so its allocation site is the heading `### D-n ·`; the DEBT-table rows `| D-n |` are LEGACY allocations frozen at D-443. A heading and a legacy row for one id (M-57's 17 pairs) are the item and the row it closed, never a duplicate.** BOB #33 RULED, 2026-09-24 17:35Z (drained to `BOB-INBOX-drained.md`; cite until folded). — owner M0.
order: low in the M0 group, beside M0-172: small; fold into an open M0 batch if one fits (BOB #33, 17:35Z; SCHEDULER #19)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument reads the forms the ledger actually uses), with BOB #33's ruling of 17:35Z (cite until folded).
depends-on: M0-140.
scope: `mintid`'s allocation site for `D` is the plan-row heading in QUEUE, BACKLOG and their archives; the legacy table rows count toward the floor only; the duplicate check grades EACH shape within itself.
accepts-when: two `### D-n ·` headings are refused; the 17 cross-shape pairs pass; the floor reads 508 on coord f3ca0ad8. NEGATIVE CONTROL: collapse the two patterns into one, and the arm counting 120 false duplicates fails by name.
added: 2026-09-24 · SCHEDULER #19 (BOB #33 inbox 17:35Z; `node tools/mintid.mjs M0`).

### M0-184 · queued — **`VERIFICATION.md` IS 24,569 B AGAINST ITS 24,576 B BUDGET (readbudget's CUT set), so it cannot absorb a new rule: M0-166's section cannot land.** Found by M0-173's worker (C). — owner M0.
order: directly before M0-166, which it unblocks (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:16Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the reading budget), with `docs/archive/` as the home for finished provenance.
depends-on: none.
scope: move the D-263 PROVENANCE block (~2.4 KB, marked at both ends) to `docs/archive/`, and move `bio-plane/test/register-grammar.test.mjs`'s pin to the archived copy in the same landing. ALSO (M0-169's design gap, via CONDUCT #20 19:37Z): one sentence in "The battery runs every suite"'s Incomplete sections — a fixture's carry-list is DERIVED, once (`moduleclosure.mjs`, `gatedeps.mjs`).
accepts-when: VERIFICATION.md reads ≥ 2 KB under budget and register-grammar stays green (the measured failure it moves: 7 B of headroom). NEGATIVE CONTROL: point the pin back at VERIFICATION.md and register-grammar fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-166 · queued — **`VERIFICATION.md` HAS NO PROSE ON HOW THE GATE CLASSIFIES A DIFF OR SELECTS UNITS: the rule lives only in `gates.mjs`'s header comments, and M0-116, M0-143 and M0-153 each had to rediscover it.** Found by M0-153's worker. — owner M0 (the document's owner).
order: after M0-165, the same subject; prose, small (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:33Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (this row adds its missing section).
depends-on: M0-153, M0-184.
scope: a VERIFICATION.md section stating the classes, the reader derivation (comment-blanked), the doc-facing rule and its edge rule, citing `gates.mjs` sections, with front matter moved. ALSO (M0-154's F3): beside the D-93 sentence, \"a fixture DERIVES what it must carry from its subject's own imports, never a copy kept by hand (M0-154, `bio-plane/test/gatedeps.mjs`)\".
accepts-when: the section is on `main` and `corpuscheck` reads 0 fail. NEGATIVE CONTROL: none (prose).
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-168 · queued — **`control-register.mjs` `declarationAt` ENDS A DECLARATION AT ANY LINE CONTAINING THE MARKER PHRASE, so a mere citation truncates it and LOWERS the recorded arms count (measured: coverage --strict 2093 → 2081).** Found by M0-157's worker. — owner M0.
order: after M0-166 and AHEAD of M0-167: a register that under-counts is a false floor (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:36Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register".
depends-on: none.
scope: break only where `markerPositions` says a marker BEGINS (the phrase followed by one of MARKER_SEPARATORS); re-read the coverage floor from the print. ALSO (REC-199's worker, via CONDUCT #20 21:43Z): `declarationAt` ends a declaration at the first blank line whose next paragraph does not open with an ordinal; measured reviewcopy.test.mjs credited 5 arms of 14 + baseline (`arms: 5, lines: 38`, main and branch), REC-133's and REC-198's arms never counted. Cross a blank line when ANY later paragraph of the same comment opens a list item; reviewcopy 5 -> 15 is its negative control; re-read REGISTER_FLOOR from the print. ALSO (M0-176 F3, CONDUCT #20 22:40Z): only a suite's FIRST `NEGATIVE CONTROL:` block is read, so `gates.test.mjs`'s later blocks go uncounted; count every block.
accepts-when: coverage --strict counts the full arms again, later blocks included. NEGATIVE CONTROL: a citation mid-declaration does not truncate it, and a real second marker still ends it — each arm by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-167 · queued — **`gates.control.mjs` NEVER ASSERTS THE ABSENCE OF UNDECLARED FAILURES: an arm measuring more than its subject is described, not caught — G2 fails 29 where 3 are declared, G17 fails 11 where 5 are.** Found by M0-157's worker. — owner M0.
order: after M0-166, with the gate instruments (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:36Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register" (break only the thing).
depends-on: M0-157.
scope: enumerate each arm's true failure set, then adopt nc-rec111.mjs's subset check (s.failed ⊆ mustBreak ∪ alsoBreak ∪ a per-arm alsoExpected).
accepts-when: every arm's failures are declared and the check passes. NEGATIVE CONTROL: widen one arm's break and the subset check names the undeclared failure.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-162 · queued — **M0-99's DELEGATION BLOCK STAYS OPEN ON THREE STALE SENTENCES: `kickoffs/DIST.md` lesson 20, `kickoffs/SKILL.md`'s "Design sources" list, and FLEET-NEXT's "Carried memory" ("Regenerate docs/DECIDED.md; never merge it") still describe DECIDED.md as it was.** M0-158's one residue; the candidate words are written in the block on coord `CLAIMS.md`. — owner M0.
order: after M0-160, small: the last open item of a closed contradiction sweep (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:19Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a sentence other sessions read is a claim to keep true).
depends-on: M0-158.
scope: apply the block's candidate words to the three sentences (FLEET-NEXT on coord, the kickoffs on main); close M0-99's block.
accepts-when: the block reads closed and none of the three sentences says to regenerate or merge DECIDED.md. NEGATIVE CONTROL: none (prose).
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-163 · queued — **`tools/delegations.mjs` HAS NO GRAMMAR FOR A PER-ITEM CLOSURE: `**Items <range> CLOSED <date>**` reads as neither affirm nor discharge, which produced three of M0-158's five contradictions.** Found by M0-158's worker. — owner M0.
order: after M0-162, the same register (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:19Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument reads the forms the ledger actually uses).
depends-on: none.
scope: recognise the per-item closure form; plancheck §8's warning names a block whose per-item closures cover every item.
accepts-when: a block closed item by item reads closed. NEGATIVE CONTROL: drop the form from the grammar and that block reads open, by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-149 · queued — **A PUBLISHED `limit` HAS ONE GUARD: only `bounds.test` checks it; `meaning-bounds` grades the row source, not whether an op in the BOUNDED roster publishes its bound.** Found by D-479's worker. — owner M0.
order: after M0-142, the same suite (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:49Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the negative-control register).
depends-on: land/conduct/c20-batch11fix on `main` (it rewrites meaning-bounds' segmenter).
scope: a meaning-bounds arm asserting every op in the BOUNDED roster publishes a non-empty `bound`.
accepts-when: the arm lists the roster and passes. NEGATIVE CONTROL: drop the directory's published bound and the arm names it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-150 · queued — **AN OP LEAVING THE BARE ROSTER INTO THE UNJUDGED BUCKET IS INVISIBLE TO THE FLOOR, which counts only what it still sees: `op=caseratify` was lost that way on `main`, found only by c20-batch11fix's RETURN-DELEGATE rule.** — owner M0.
order: after M0-149, the same suite; the class behind a silent loss (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:49Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a floor that cannot see a departure is not a floor).
depends-on: land/conduct/c20-batch11fix on `main`.
scope: an arm asserting every op the walk files is in exactly one judged bucket, or a ratchet on the UNJUDGED bucket's size.
accepts-when: the walk's buckets partition its ops. NEGATIVE CONTROL: hide one op's body behind an unfollowed delegate and the arm names it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-156 · queued — **`check-refusal-codes` ARM C READS ONLY THE SPANS A `where` NAMES, so a code re-minted OUTSIDE every governed region is invisible, for all 170 governed sites.** Found by D-484's worker. — owner M0 (RECORD reviews).
order: after M0-155, the same class (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:53Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the DEC-49 guard).
depends-on: D-484.
scope: an arm counting `reason:"CODE"` / `code:"CODE"` literals across `bio-plane/src` per region row, failing on any outside its claimed span.
accepts-when: every governed code's literals sit inside its region. NEGATIVE CONTROL: D-484's arm 1 (a mint outside the helper) fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-161 · queued — **NO SWEEP FINDS A CONSTRUCT CLAIM THAT DESCRIBES A CAPPED READ WITHOUT SAYING IT IS CAPPED (D-498's class): D-498's heuristic (op = the lowercased method name, `store.mjs` only) left 17 of 27 capped methods UNCLASSIFIED and cannot see caps applied in `index.mjs`.** Found by D-498's worker. — owner M0 (RECORD reviews the claims it names).
order: low in the M0 group: a sweep for further instances of a closed defect (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:13Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a claim states its bound).
depends-on: D-498.
scope: walk the OPS table's dispatch (not method names) to every capped read, then list each construct claim describing it without its cap; each hit is placed as a row.
accepts-when: the sweep classifies all 27 capped methods and names every uncapped claim. NEGATIVE CONTROL: strip "at most" from D-498's claim and the sweep names it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-175 · queued — **`tools/train.mjs` READS A FLAG AS A VALUE: `--trailer --full` takes `--full` as the trailer's text, and `--branch` does the same.** Found by M0-159's worker (optional, cosmetic). — owner M0.
order: after M0-161, behind the product rows: cosmetic, no effect on gate time, gate verdicts or product (Bob's 17:41Z rule, via BOB #33: tracked and built, placed after product; SCHEDULER #19, 2026-09-24; via CONDUCT #20 17:46Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument refuses what it cannot read, never silently takes it).
depends-on: M0-159.
scope: `--branch` and `--trailer` refuse a value starting with `--` by name, with an escape for a literal one.
accepts-when: `--trailer --full` is refused by name, and the escaped form is taken literally. NEGATIVE CONTROL: drop the check and the refusal arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-177 · queued — **A SUITE CAN NAME A `docs/` BASENAME ONLY IN A SLASH-FREE STRING, which the gate reads as a reader edge (M0-165: "MEASUREMENTS" alone is a quoted token); the worker's sweep lists 40 candidates, none confirmed.** Found by M0-165's worker. — owner M0.
order: after M0-175, behind the product rows: a sweep of candidates after M0-176 narrows the door (Bob's 17:41Z rule; SCHEDULER #19, 2026-09-24; via CONDUCT #20 18:02Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the gate runs the class the diff measures).
depends-on: M0-176.
scope: an estate-wide arm failing a suite that names a docs basename only in a slash-free string with no other edge; confirm or clear each of the 40.
accepts-when: the arm passes with each candidate fixed or stated legitimate. NEGATIVE CONTROL: plant a bare "MEASUREMENTS" label in one suite and the arm names it.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-185 · queued — **`derivation-bounds`' TRUNCATION GRADER CANNOT SEE A `this.#rows(` WRAPPED IN A TERNARY, so a capped read written that way leaves the graded roster silently (REC-194 fixed its own instance).** Found by REC-194's worker (F2). — owner M0.
order: after M0-177, behind the product rows: latent, no live instance (Bob's 17:41Z rule: tracked and built) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:16Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a floor that cannot see a departure is not a floor).
depends-on: none.
scope: the grader follows each branch of a ternary to the rows call.
accepts-when: a ternary-wrapped capped read is graded (the measured failure it moves: REC-194's read leaving the roster unseen). NEGATIVE CONTROL: plant a ternary-wrapped read and the roster names it.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-186 · queued — **A BATTERY RUN BY HAND OUTSIDE THE GATE IS UNPINNED: nothing records which `origin/main` it measured.** Found by M0-173's worker (D), the half M0-173 left. — owner M0.
order: after M0-185, behind the product rows (Bob's 17:41Z rule: tracked and built) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:16Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a gate measures ONE tree), with M0-173's coord pin as the precedent.
depends-on: M0-173.
scope: a hand-run battery prints and records the `origin/main` (and coord) sha it read, as M0-173's gate does.
accepts-when: a hand run's completion line names the main sha (the measured failure it moves: an unpinned hand verdict). NEGATIVE CONTROL: drop the pin and the provenance arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### D-532 · queued — **`bio-plane/test/d280-strengthbar.control.mjs` ARM C2 HAS BEEN STALE SINCE CASE-2 AND UNTRACKED: three of its mustFail entries name d280's §3 shapes, which no longer exist; REC-141 reported it on 2026-09-19 (the note at d280-strengthbar.test.mjs:4) and no row was made.** Id minted by its finder (via CONDUCT #20 21:21Z). — owner RECORD (the control).
order: after M0-186, behind the product rows: a hand-run driver, no battery effect (Bob's 17:41Z rule: tracked and built) (SCHEDULER #19, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register" (correct superseded tests, never exempt them).
depends-on: none.
scope: drop the three stale mustFail entries naming d280's §3 shapes, with a comment saying why; keep the severedhomes arm; re-run the driver.
accepts-when: the control reports every arm as declared (the measured failure it moves: C2 reading NOT as declared). NEGATIVE CONTROL: the driver's own arms, recorded on its line.
added: 2026-09-24 · SCHEDULER #19 (placed; `D-532` minted by its finder).

### M0-189 · queued — **THE CONTROL REGISTER'S GRAMMAR IS INVISIBLE TO THE WRITER: `readControl` returns `arms: null` or UNDETERMINED when an arm mark is not a lowercase parenthesised ordinal or the NEGATIVE CONTROL marker appears twice, and nothing says which.** Found by M0-178's worker (F3). — owner M0.
order: after M0-186, behind the product rows (Bob's 17:41Z rule: tracked and built) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 20:02Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register".
depends-on: none.
scope: `coverage.mjs`'s report names each cause per suite: "no lowercase parenthesised ordinal found"; "declaration split at a second marker at line N".
accepts-when: each UNDETERMINED suite in the report carries its cause (the measured failure it moves: a bare null). NEGATIVE CONTROL: plant a second marker in a fixture and the report names its line.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-190 · queued — **THE GATE-RESULTS DESCENT RECORD IS PER-CLONE, so a fresh clone cannot judge a rewrite of `origin/gate-results` that predates it.** Found by M0-179's worker, who RECOMMENDS NOT BUILDING IT: no measured need, and it is process tooling. — owner M0.
order: after M0-189, behind the product rows and last of the group: tracked by Bob's 17:41Z rule, with its finder's advice against it recorded; build only on a measured need (SCHEDULER #19, 2026-09-24; via CONDUCT #20 20:25Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a gate record is trusted only by its descent), with TREE-SHARING §3a (the gate-results branch is append-only) and M0-179's refutation.
depends-on: M0-179.
scope: pin a known-good gate-results tip in the tree, which a fresh clone's gate checks its descent from; FIRST re-measure whether any clone has met a pre-clone rewrite, and if none has, close this row as not owed with that measurement.
accepts-when: the pin is checked by a fresh clone, OR the measurement closes the row (the measured failure it moves: none yet, which is why the measurement comes first). NEGATIVE CONTROL: a fixture tip not descending from the pin is refused by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### D-446 · queued — **`nc-m040.mjs` ARM 1 DECLARES FIVE FAILURES AND MEASURES ONE (derivation-bounds 71/1 on `main`), AND FIVE SUITES NAME INFORMATION FIXTURES `INF-…` WHERE `OBJECT_TYPES` HAS `INFO`.** The fixtures: `frontier-chunk` (D-390's), `d389-fullfetch`, `observation-content`, `observation-log`, `cap14-reused-from`. — owner M0.
order: after M0-139, among the control-hygiene rows; after c17-batch7 lands (SCHEDULER #17, 2026-09-23; via CONDUCT #18 22:27Z (4), measured by SCHEDULER #17's verifier)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (a control declares what it measures; correct superseded tests, never exempt them).
depends-on: D-443 (`integrated`; its branch moved ARM 1's anchor).
scope: rewrite ARM 1's declaration to the measured outcome with a comment saying why the old one was wrong; rename every `INF-` fixture id to `INFO-`.
accepts-when: `node bio-plane/test/nc-m040.mjs` reports every arm as declared, and no suite names an `INF-` id. NEGATIVE CONTROL: restore the five-failure declaration, and ARM 1 reads NOT as declared by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).
