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
- **2026-09-25 07:45Z · BOB #35 · D-375's gap (OBSERVATION-LOG-DESIGN §4.2 row 4; D-375 @ 9a5df6e6), CONFIRMED as built.** Ink nobody could read is not an absence of text. A page whose only OCR regions fell below the confidence floor reads LOOKED_INDETERMINATE, with the regions kept as `ocr_below_floor` residue. LOOKED_ABSENT requires that tier 3 ran, no page was left unread, and zero residue. Row 4's words "nothing above the floor" are narrowed to "no region at all" when D-375 lands, and the §4.2 note that the table's row order is not the writer's test order stands. No row.



## THE CACHE — the next rows, in order

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 16 in all (`CACHE_ROWS`, sized to CONDUCT's capacity plus spare: Bob, 2026-09-23, `WORK-PIPELINE.md`). **At most 10 worker sessions are live at once** (Bob, 2026-09-24 ~03:08Z, via BOB #32; until 05:00Z, then 6, and no new spawn from 06:00Z): a `running` row whose worker has FINISHED and awaits integration holds no session, so the cache keeps a few `queued` rows behind the live ten and no slot waits. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### D-521 · integrated — **IC-246's STATEMENT_ACK_DOCUMENTS_OVER_BOUND (C-82.1) IS UNREACHABLE BY CONSTRUCTION: after REC-194 its read names (case_id, edition), `case_documents`' primary key, so at most one row returns and the bound can never fire.** Found by REC-194's worker (F1). — owner RECORD.
status: integrated — SCHEDULER #22 05:25Z: tip land/worker/D-521b @ b75f4bc4 (NOT the stale land/worker/D-521 31501f1b), GATE 385/385 GREEN FULLREUSE (21870 assertions), tree ce8cda76; NARROWED: after REC-217 the read returns at most TWO (not one), bound 8 still unreachable, so C-82.1 + its region retired; read = two keyed #one reads merged per document; wire removal of case_documents_limit/_truncated (I3); CATALOG 1.30.0->1.31.0
order: after REC-213, with the corrections to just-landed work: a catalogued refusal that cannot occur is a claim the record makes about itself (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:16Z)
milestone: M10
interface: I3 — a catalogued code retired; the catalogue version moves; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, with `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13.
depends-on: REC-194.
scope: collapse the read to `#one`; remove the bound, C-82.1, its DEC-49 region `is-statement-ack-documents-bound` and block 8's bound arms; move each refusal-code floor to its printed figure.
accepts-when: C-82.1 and its region are gone and the census floors read their printed figures (the measured failure it moves: a code no input can reach). NEGATIVE CONTROL: restore the region without its reachable site and check-refusal-codes names the orphan.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-520 · integrated — **THE RENDER RESERVATION'S 30,000 ms NAVIGATION BOUND IS CHOSEN, NOT MEASURED, AND NOTHING CAPS CONCURRENT RENDERS: D-492 made the allowance an honest account, not a throttle.** BOB #33 RULED YES to both, 2026-09-24 19:11Z (cite until folded). — owner CAPTURE.
status: integrated — SCHEDULER #21 01:53Z: tip 5e40f8ed, GATE 360/360 GREEN; M-151 (bound 30s->10s, reservation 45s->25s); C-83.8 cap 10; text conflicts with D-522 in construct-status 2.rendered and CLIENT-RENDERED front matter; D-570 to BOB
order: after D-478, in normal product order behind D-64's render rows (BOB #33, 19:11Z: *product, not ahead of it*; SCHEDULER #19, 2026-09-24)
milestone: M2
interface: none unless the waiting render's state is published (the integrator classifies).
design: `docs/development/CLIENT-RENDERED.md` "What Workers Paid actually buys, for this project" (DEC-42; re-pointed 2026-09-24 by SCHEDULER #19 from §"There is no collision", which the document marks SUPERSEDED — D-490's finding) and "RULED 2026-09-23 by BOB #32: the method, the primary, and the unattended sweep", with BOB #33's ruling of 19:11Z, which this row FOLDS into CLIENT-RENDERED as a RULED line in the same landing.
depends-on: D-492, D-490.
scope: (1) measure navigation times over the client-rendered sources already captured, recorded in `measurements/<id>.md` with date and instrument, and set the reservation's bound from the measured tail, stating the figure and its source at the site; (2) a concurrency cap from the platform's stated concurrent-browser limit, labelled the vendor's claim until measured; a render over the cap WAITS in the reconciling alarm, never dropped; a render that cannot run is recorded undetermined with its reason, never as a capture that found nothing.
accepts-when: the bound reads from a measurement id, and a burst above the cap renders no more than the cap at once with the rest completing later (the measured failure it moves: an unmeasured 30,000 ms and an uncapped burst). NEGATIVE CONTROL: remove the cap and the burst arm counts more concurrent renders than the cap, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-523 · integrated — **A RENDER REFUSED FOR A C-83 REASON OTHER THAN THE ALLOWANCE IS HELD SILENTLY: D-491 holds it under the plane's code until the request row's `expires`, and no member is told a render waits, or why.** BOB #33 RULED 2026-09-24 19:54Z (cite until folded): KEEP the hold, bounded by `expires`; at expiry the render is RECORDED UNDETERMINED with its C-83 reason and released, never dropped silently; and an op=queue condition kind shows a deferred render and its reason in DEC-49 words. — owner CAPTURE.
status: integrated — SCHEDULER #21 02:05Z: tip 52e5e8d8, GATE 86/86 GREEN (full 358/360 fixed in-item); premise narrowed (nothing read expires); I3 additive render_deferral; shares captureRequestDrain with D-520/D-529
order: after D-522, in normal product order with D-64's render rows (BOB #33, 19:54Z; SCHEDULER #19, 2026-09-24)
milestone: M3
interface: I3 additive — a new op=queue condition kind; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` "RULED 2026-09-23 by BOB #32: the method, the primary, and the unattended sweep", with BOB #33's ruling of 19:54Z, which this row FOLDS into CLIENT-RENDERED in the same landing; `docs/development/NOTIFICATIONS.md` for the condition kind.
depends-on: D-491.
scope: at `expires`, record the held render undetermined with its C-83 reason and release it (stated at the site); mint the op=queue condition kind carrying the reason's DEC-49 translation.
accepts-when: a refused non-allowance render shows in op=queue with its reason while held, and reads undetermined after expiry (the measured failure it moves: a hold no member can see, ending in nothing recorded). NEGATIVE CONTROL: let expiry delete the row and the undetermined arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-451 · integrated — **A PROJECT RUN HAS NO TARGET A MEMBER CAN NAME: `op=airun` publishes only the run's context `{type, id}`, so FL-11's `runContextTarget` cannot seed a project run, and its level-empty candidates are refused SUGGEST_NO_TARGET.** — owner RECORD, then FLEET (one line).
status: integrated — SCHEDULER #21 01:55Z: tip 114c6969, GATE 360/360 GREEN; I3 additive context.questions; D-572 (several cited questions) to BOB
order: after D-450: a correction to just-landed work (FL-11), the run's suggestions lost for every project run (SCHEDULER #17, 2026-09-23; FL-11/12's worker via CONDUCT #18 22:51Z)
milestone: M9
interface: I3 additive — `aiRunRead` publishes a project run's questions; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 (the RUN is an object) and §9 (what a SUGGESTION is).
depends-on: FL-11 (`integrated` on c17-batch7).
scope: for a project run, `aiRunRead` publishes the questions the project confirmed-cites (the set `#runContextProjects` uses); `runContextTarget` takes a single one or leaves several to the candidate. Extend `agent-worker/test/agent-worker.test.mjs` and the airun suite.
accepts-when: a project run citing one question seeds it as the target, and its level-empty candidates are filed. NEGATIVE CONTROL: drop the questions from the read, and the project-run arm reads SUGGEST_NO_TARGET by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### REC-220 · integrated — **NOT EVERY REFERENCE IS PINNED TO A VERSION: a basis leg, a cite onto a case or question, or a claim with no `content_id` names only a BUNDLE, so a later capture changes what it resolves to.** Bob's 00:40Z doctrine, rule 1 (item 1 of BOB #34's decomposition). — owner RECORD.
status: integrated — SCHEDULER #21 02:22Z: tip 903c2023, GATE 361/361 GREEN; I3 extent_capture/pinned_capture/version.state; M-158; census 118; D-579 (case/action/suggest legs) to BOB for grammar
order: after REC-215, first of the version-doctrine rows in product order; it completes construct 4.cross-version (BOB #34 00:55Z) (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: I3 — the capture a reference was made against, recorded at the act; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 (the cross-version relation), with §14.4 and `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §5.8, and Bob's 2026-09-25 00:40Z version doctrine as BOB #34 decomposed it at 00:55Z (drained to `BOB-INBOX-drained.md`; cite until folded on BOB's batch branch).
depends-on: none.
scope: record the capture (document grain) at every reference act; MEASURE existing legs per kind (count), never back-fill by guess: a leg whose capture cannot be known reads "version undetermined".
accepts-when: a new whole-document citation stores its capture sha, and a later capture on the same bundle does not change what the leg resolves to (moves: bundle-only references). NEGATIVE CONTROL: resolve to the newest capture and the pin arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs`).

### REC-221 · integrated — **NOTHING GRADES WHETHER A NEWER VERSION AFFECTS THE REFERENCED PART: `op=versionnotice`'s extent test does not produce §5.8's grades.** Bob's 00:40Z doctrine, rule 2 (item 2). — owner RECORD.
status: integrated — SCHEDULER #21 01:55Z: tip 22d77e15, GATE 361/361 GREEN; IC-296 filed (additive); grade provisional mechanism recorded in Framework §18.1
order: after REC-220, in the version-doctrine chain (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: I3 — the grade on versionnotice's answer; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 (the cross-version relation), with §14.4 and `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §5.8, and Bob's 2026-09-25 00:40Z version doctrine as BOB #34 decomposed it at 00:55Z (drained to `BOB-INBOX-drained.md`; cite until folded on BOB's batch branch).
depends-on: none.
scope: extend the extent test to A (byte-identical at the extent), B (same text, new position), C (similar text), NOT FOUND, and UNDETERMINED with a reason; A and B read UNAFFECTED, C and NOT FOUND AFFECTED; office extent arms driven, not assumed.
accepts-when: each grade is produced by a fixture pair and named on the wire (moves: no grade). NEGATIVE CONTROL: collapse C into B and the C arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs`).

### UI-88 · integrated — **THE ACCEPT CEREMONY FETCHES THE STRENGTH PAIR BEFORE THE MEMBER AFFIRMS, AND HIDES IT: `app.html` `acerOriginsRead` reads `op=versionstrength` and drops the pair client-side.** Once REC-192 lands it switches to the independence-only read. — owner UI.
status: integrated — SCHEDULER #21 01:52Z: tip f2e40975, GATE 154/154 GREEN; surface-registry D1 79, D5 55; 8.partition-independence probe hit (UI-27's half now UNPROBED, stated)
order: directly after REC-192, which it consumes (SCHEDULER #17, 2026-09-23; BOB #31's ruling of 2026-09-23 22:22Z (cite it until folded))
milestone: M9
interface: I3 consumer (REC-192's IC).
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 (Strength) with DEC-32 clause 5.
depends-on: REC-192, UI-74 (`integrated` on c17-batch5).
scope: `acerOriginsRead` reads the version arm of the independence read; no code path fetches a strength-bearing answer before the affirmation. Extend `civicos-ui/test/accept-ceremony.test.mjs`.
accepts-when: before the affirmation the ceremony's network log holds no strength-bearing answer. NEGATIVE CONTROL: point `acerOriginsRead` back at `op=versionstrength`, and the pre-affirmation fetch arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### REC-203 · integrated — UNBLOCKED 2026-09-24 by BOB #32: Framework §8.3 now carries M-132 (concurrent project-number forms told apart by shape; C.M.S. referent check and coverage floor; APN apn_sort and RETIRED parcels; contract/PO unpublished at source), on land/bob/fold-m132 awaiting its train. Build to §8.3 as amended.
status: integrated — SCHEDULER #22 03:55Z: tip 92aa5dc9, GATE 367/367 GREEN (21111 assertions), tree e76d09c7; 6.identifier-spaces ABSENT->PARTIAL; the new idmatch read + C-91; CATALOG 1.30.0 (469; collides with REC-219's 1.30.0); census 219->220; regionLines re-read at union; two design gaps with BOB #35
order: behind D-453, whose measurements it rests on, as BOB #32 ruled (*Row them RECORD, blocked behind D-453's egress*) (SCHEDULER #17, 2026-09-23)
milestone: M4
interface: I3/I5 — three recognisers and their eras; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.3 "WHAT MAKES A SHARED IDENTIFIER COUNT" (on `land/bob/rulings-0923b` @ fd93bf1d, riding the next train): a match counts when the REFERENT agrees in two INDEPENDENT systems; two publications of one source are one system; a space whose format changes is one space with dated ERAS, joined across eras only through a captured crosswalk.
depends-on: D-453 (egress), D-74 (`integrated`).
scope: a recogniser per space under §8.3's counting rule, eras for the project-number format change (C###### → 100xxxx).
accepts-when: a budget line and its Legistar award join by project number only when the referent agrees; a fund code alone never counts. NEGATIVE CONTROL: count two publications of one source as two systems, and the independence arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-191 · integrated — **MONITORING SCHEDULES A BUNDLE, NOT AN ADDRESS, AND ONLY BY ITS AUTHORED FREQUENCY: sixty captures of one document are sixty schedules, and a document with no authored frequency reads `unscheduled` though `op=monitor` answered it by its contract (D-65's worker finding (a)).** `Store#monitorCadencePlan` selects `bundles WHERE monitor_enabled=1`. — owner RECORD.
status: integrated — SCHEDULER #21 02:01Z: tip cfcb33e3, GATE 361/361 GREEN; new table monitor_address_type; op=monitor 3 lines; I3 IC the integrator's; address-level frequency setting ABSENT (design gap to BOB)
order: after REC-190, behind D-65 (running; same op and path); a gap, not an over-claim (SCHEDULER #17, 2026-09-23, CONDUCT #17 21:43Z (5) and #18 22:27Z (2), verified at the code)
milestone: M3
interface: I3 — `op=monitor`'s schedule and report become per address, naming every version grouped; the integrator mints and classifies the IC.
design: D-220's ruled intent (Bob 2026-08-06, *"Monitoring an ADDRESS is what a member means"*) with `docs/architecture/BIO_Content_Framework_v0_10.md` §6 (the contract sets the check frequency); BOB #31's 22:03Z ruling (cite until folded): *the ADDRESS's own setting governs; where none is set, the CURRENT version's; never the shortest; a disagreement is STATED.*
depends-on: D-65 (c17-batch6), D-220 (c17-batch4), both `integrated`.
scope: `#monitorCadencePlan` groups monitored bundles by `captured_locators.address_norm` through the version-chain join, checks the address once against its current version, reports the versions grouped and any frequency disagreement; persists each address's content type from the tick (in `purge`) and falls back to `CONTRACT_FREQUENCY` where nothing is authored. Renumber D-220's archived body to match its disposition. Extend `bio-plane/test/monitor-cadence.test.mjs`.
accepts-when: three captures of one address give one due entry; two addresses sharing a title give two.; a calendar with no authored frequency is due a day after one tick. NEGATIVE CONTROL: restore the per-bundle select, and the one-address arm fails by name, and dropping the fallback fails the calendar arm.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs REC`).

### D-455 · integrated — **A `changed` MONITOR TICK DISCARDS THE BYTES IT FETCHED: it points its result at the baseline because the new document is not captured, though the monitor already held those bytes to see the change.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *a `changed` tick CAPTURES the new bytes (a monitor capture with its own provenance, through the governor), and its result_ref points at the new capture's sha* — superseding `OBSERVATION-LOG-DESIGN.md` §4.1's reason. — owner RECORD.
status: integrated — SCHEDULER #22 04:34Z: tip 674850fe (docs-only over 3db50421, BOB #34 03:05Z folded into OBSERVATION-LOG §4.1; 115/115 GREEN on tree d3866f13), CARRIES REC-191 cfcb33e3; op=monitor answer gains capture
order: after REC-191, the same monitor path; evidence in hand is being thrown away (SCHEDULER #17, 2026-09-23; D-65's worker finding (b))
milestone: M3
interface: I3/I5 — a monitor capture and the observation's reference; the integrator mints and classifies the IC.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §4.1, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: D-65 (`integrated` on c17-batch6).
scope: on `changed` the tick captures the served bytes with monitor provenance through the governor and points the observation at that capture. Extend `bio-plane/test/monitor-assess.test.mjs`.
accepts-when: a changed tick leaves a capture whose sha the observation names, and that sha resolves in the register. NEGATIVE CONTROL: skip the capture, and the "result names a held capture" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-338 · integrated — **THE `unmonitorable` CONTRACT IS DECLARED AND UNTESTED: D-65 maps a shell to UNMONITORABLE (`CONTRACT_FREQUENCY.unmonitorable: null`, with its why), and no suite drives it; whether the monitor still reports a hash delta for such a document is UNDETERMINED.** — owner RECORD.
status: integrated — SCHEDULER #21 02:29Z: tip 61c52b6e, GATE 360/360 GREEN; op=monitor withdrew a false hash delta on an unmonitorable shell (index.mjs after monitorCadence; store monitorObservationFor 'unmonitorable'); unions with D-567 and REC-191 on op=monitor
order: after D-455, the same monitor path (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M3
interface: none — an arm.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6.
depends-on: D-65 (`integrated` on c17-batch6).
scope: an unmonitorable arm in D-65's monitor suite (`bio-plane/test/monitor-assess.test.mjs`); fix any hash-delta report it exposes.
accepts-when: a shell-profiled document's answer states unmonitorable and grades no change. NEGATIVE CONTROL: map unmonitorable to weekly, and the arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### REC-162 · integrated — **A FOUNDER-ONLY OP'S REFUSAL CALLS AN ENROLLED ADMINISTRATOR A NON-ADMINISTRATOR.** Five ops sit in `SESSION_OPS.admin` and … (whole text: the cut archive)
status: integrated — SCHEDULER #21 02:39Z: tip 8c56415d, GATE 59/59 GREEN; I3 in IC-55's family, BREAKING-shaped (role -> session + reachedBy); fixed adminvote.control stamp-dropped arm (unarmed since REC-164)
order: back to back after REC-159, the same two suites (`d270-refusal-truth`'s ROLE literal, `adminvote` §8f), the second re-reading the first's pins; a false refusal sentence, CLAUDE.md §2's class (BOB #23's entry, 2026-09-21; SCHEDULER #7)
milestone: M8
interface: I3 — the refusal's sentence; the integrator classifies it in IC-55's family.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9, *AND ADMINISTRATORS DO NOT RUN THE INSTANCE* (BOB #23, 2026-09-21).
depends-on: REC-159 (sequence: the same `SESSION_OPS` sets and ROLE literal; made a dependency 2026-09-23 by SCHEDULER #16 so no refill takes this row ahead of it).
accepts-when: an enrolled administrator and a member, each refused `governorconfig`, read the founder's-session sentence; the founder's session and the ADMIN_TOKEN bearer still set an … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (BOB #23's inbox entry, drained this commit; `node tools/mintid.mjs REC`).
scope-add: 2026-09-24 by SCHEDULER #17, BOB #32's ruling (00:00Z): correct `AI_SCOPE_BEYOND_MEMBER_REACH`'s detail ("not reachable by a member"), now loosely false for REC-159's four custodial acts, in the same `SESSION_OPS` sets this row touches; no new row. The founder's NOT_AN_ADMIN on an unclaimed store (scratch) STANDS: a live verification claims an administrator in scratch first.

### REC-155 · integrated — **SEVEN VERBS WHOSE `OPS` ROW ADMITS A SESSION CLASS WERE REACHABLE BY NO SESSION, AND NOBODY HAD RULED WHY — NOW RULED** … (whole text: the cut archive)
status: integrated — SCHEDULER #21 02:39Z: tip badb54c2, GATE 361/361 GREEN; I3 MINOR; SESSION_OPS: one line after ...CUSTODIAL_ACTIONS in each set (union with REC-162); NEEDS contribute PROVISIONAL (to BOB); REGISTER_FLOOR 2180
order: where it stood, now with its design (BOB #20's entry): the plane is honest here — a determination was owed, not a defect shipping — and this landing refuses nobody (SCHEDULER #5, 2026-09-21; placed by SCHEDULER #3, 2026-09-19)
milestone: M8
interface: I3 — MINOR: sessions gain reach and no class list moves; the integrator mints the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10 (ruled by BOB #19, landed by BOB #20 at `d9cf3283`).
depends-on: REC-159 (sequence: the same `SESSION_OPS` sets and ROLE literal; made a dependency 2026-09-23 by SCHEDULER #16 so no refill takes this row ahead of it).
accepts-when: each of the five answers a member session and an administrator session with the op's own result; the two unattended ops answer every session `MACHINE_CREDENTIAL_REQUIRED` with … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's item 1); designed 2026-09-21 by §4.10, BOB #20's entry drained by SCHEDULER #5.

### REC-186 · integrated — **MEMBERSHIP §7's TWO UNRULED EDGES, RULED (BOB #31, 2026-09-23 21:37Z): (a) THE PROJECT'S ONLY OWNER CANNOT "ASK TO LEAVE" — `projectLeave` refuses the last owner by name ("transfer ownership first") and `op=affordances` does not offer it; a non-last owner may leave. (b) A JOINED PARTICIPANT IS NOT OFFERED "JOIN" — `projectJoin` stays idempotent, but an offer that does nothing is an overclaim.** Found by D-311's worker (`projectLeave` does not check the owner flag). — owner RECORD.
status: integrated — SCHEDULER #21 02:33Z: tip 7ccc44e6, GATE 79/79 GREEN; C-33.47 LAST_OWNER_CANNOT_LEAVE; CATALOG 1.29.0 unions; follow-up REC-224
order: directly after REC-185, the D-311 follow-on: a project left ownerless and an affordance that changes nothing are both the record claiming more than it supports (CLAUDE.md §2) (SCHEDULER #16, 2026-09-23; BOB #31's ruling, via CONDUCT #17)
milestone: M8
interface: I3 — a new refusal on `op=projectleave` and a narrower `op=affordances`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7.4 and §7.6, with BOB #31's ruling of 2026-09-23 21:37Z (BOB folds it into §7 at his next doc landing).
depends-on: D-311 (on `land/conduct/c17-batch3`).
scope: (a) and (b) as ruled.
accepts-when: in a NEW suite `bio-plane/test/rec-186-leave-join.test.mjs`, through the ops: the last owner's leave is refused with the membership rows byte-identical after, a co-owner's leave lands; affordances offers no join to a joined participant and does offer it to an invited non-participant. NEGATIVE CONTROL (`rec-186-leave-join.control.mjs`): drop the owner check, and the refusal arm fails by name; offer join unconditionally, and the join arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (BOB #31's ruling; `node tools/mintid.mjs REC`).

### DIST-8 · integrated — **SCRATCH ON THE LIVE INSTANCE HOLDS OTHER, GONE SESSIONS' RESIDUE (CPDF-3 counted 17 bundles, 11 aiRuns and more).** BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *scratch hygiene belongs to the session that wrote it; residue left by sessions that are gone is DIST's, swept at each cut's live verification.* — owner DIST.
status: integrated — SCHEDULER #21 02:12Z: land/dist/DIST-8 @ 8d3e3be9, GATE 33/33 GREEN; M-159: scratch swept to 0, bio byte-identical; NARROWED: 14 scratch MEMBERS remain (no op deletes a member; to BOB)
order: with DIST's rows; one sweep now, then at each cut (SCHEDULER #17, 2026-09-23, LED-7 S17-4)
milestone: M0 (live-instance hygiene)
interface: none
design: `docs/development/VERIFICATION.md` (CLAUDE.md §5: verify live in scratch, swept after), with BOB #32's ruling of 2026-09-23 23:30Z (cite until folded).
depends-on: none.
scope: sweep today's residue from scratch with `store=scratch` named on every call, the record's counters read before and after; add the sweep to DIST's cut verification.
accepts-when: scratch reads empty after the sweep and `bio`'s counters are unchanged. NEGATIVE CONTROL: a sweep call without `store=scratch` is refused (D-456) or moves `bio`'s counters, and the witness arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs DIST`).

### D-485 · integrated — **THE DEC-49 GUARD CANNOT SEE REACH THROUGH THE REAL PLANE: under D-433 its R3 counts only codes a MOCK feeds a surface, so "every code a surface can receive carries a canned translation" was false of `NO_CITATION` for months.** Found by UI-83's worker. D-484 closes the instance; this closes the class. — owner the plane estate.
status: integrated — SCHEDULER #21 02:41Z: tip a23fe7ee, GATE 74/74 GREEN; ARM H (R4); floors reach 455, reachGap 42, r4Suites 29, r4Pane 12; ARM 11g census 22 keys on the union with D-550
order: after M0-140, with the M0 instruments: it catches a class of defects that reach members (SCHEDULER #18, 2026-09-24; via CONDUCT #19 02:30Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the DEC-49 guard).
depends-on: D-484 (else the new arm reads RED on its first run).
scope: a real-plane reach arm in `civicos-ui/check-refusal-codes.mjs`: a code a real-plane UI suite observes in a surface pane counts toward reach.
accepts-when: the arm lists reached codes and all carry translations. NEGATIVE CONTROL: strip `NO_CITATION`'s translation and the arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### M0-145 · integrated — **`run-conditions.test.mjs`'s COLUMN READER MISSES A SQLite DOUBLE-QUOTED IDENTIFIER: `(?:^|[\s,(]|\w\.)${c}\b` (line 492).** Zero instances today. Found by D-482's worker. — owner M0.
status: integrated — SCHEDULER #21 02:03Z: tip 5d1acd03 (on 964da679), GATE 74/74 GREEN; relay to CONDUCT #21 pending
order: low in the M0 group: latent, no instance (SCHEDULER #18, 2026-09-24; via CONDUCT #20 03:38Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the negative-control register).
depends-on: none.
scope: add `"` and `'` to the class; an over-strictness arm reading a quoted column.
accepts-when: a quoted column is read. NEGATIVE CONTROL: drop the quotes from the class and that arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### D-588 · integrated — **`civicos-ui/test/member-respect.test.mjs` ARM 3b MATCHES THE DEC-68 DILIGENCE STEM "unread" AS A RAW SUBSTRING OF app.html's CODE, so the plane's own state codes `chain_unread` and `newer_capture_unread` in a comparison fail the suite as a "rendered diligence phrase".** Found by UI-96's worker (01:41Z), who worked around it by branching on `newer`. — owner UI (the suite).
status: integrated — SCHEDULER #21 02:16Z: tip 58c341e4 (on 964da679), GATE 72/72 GREEN; member-respect 503->506; test-only
order: after D-564, with the process rows behind the product rows: an over-strict instrument that bends correct code around it, no false green (SCHEDULER #21, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument states what it reads: prose, not identifiers), with DEC-68's diligence phrasing rule.
depends-on: none.
scope: ARM 3b matches stems at word boundaries that exclude `_` and identifier characters, or only inside string text that reaches markup.
accepts-when: a snake_case state code in a comparison passes and the prose "unread" in markup still fails (moves: identifiers read as prose). NEGATIVE CONTROL: restore the raw substring match and the snake_case over-strictness arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by UI-96's worker).

### D-585 · integrated — **A SCANNED PAGE WITH AN INHERITED FONT DICTIONARY AND AN EMPTY BT…ET IS READ AS HAVING A TEXT LAYER, TWICE: `pdfstructure.mjs`'s tier-1 no_text_layer marker requires "no font declared", so CAFR-2002's 161 such pages read as 0 characters of TEXT, not UNREAD (and `needsTier2` stays false); `pdf-worker/src/pagepixels.mjs` `analyzePage` counts a bare BT as text, so the OCR member refuses the page PAGE_HAS_TEXT_LAYER.** Found by D-504's worker (M-157, 01:45Z). — owner CONTENT-PDF, fleet.
status: integrated — D-585: pushed land/worker/D-585 @ 82fda0bf, GATE 79/79 GREEN, 6390 assertions; M-160 CAFR-2002 no_text_layer 14->175, read-and-empty 161->0; minted D-591
order: after D-557, with the reader corrections: a page never read stated as read and empty claims more than the record supports (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M2
interface: none unless a page's tier or grade changes on the wire (the integrator classifies).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with D-501's glyph rule and the OCR member's page contract.
depends-on: none.
scope: both predicates test for a text-SHOWING operator (the renderer's own TEXT_OPS: Tj, TJ, ', "), ideally one shared predicate; re-read CAFR-2002 and record the moved counts.
accepts-when: an inherited-font page with an empty BT…ET reads no_text_layer at tier 1 and is admitted by the OCR member (moves: 161 pages read as 0 characters of text). NEGATIVE CONTROL: count a bare BT as text again and both arms fail by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-504's worker).

### D-540 · integrated — **`#statementAcknowledgements`' `unbound` COUNT INCLUDES THE STATEMENT WRITER'S OWN READING (measured 3 where the honest count is 2), so the record claims one more unbound second reading than exists.** Found by REC-213's worker (via CONDUCT #20 22:11Z): REC-212's residue — REC-212 excluded the publisher in the NOT clause, and the writer was left in. — owner RECORD.
status: integrated — SCHEDULER #21 02:27Z: tip dcace8ec (on 964da679), GATE 366/366 GREEN; I3 additive acknowledgements_unbindable_writer_undetermined (IC the integrator's)
order: after D-543, with the corrections to just-landed work: a count that overclaims second readings (CLAUDE.md §2) (SCHEDULER #20, 2026-09-24)
milestone: M10
interface: I3 — the `unbound` count narrows and a separately stated key appears; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 and §6A.4.
depends-on: REC-213.
scope: exclude the statement's writer in the `unbound` count's NOT clause, as REC-212 did for the publisher; count rows whose writer is undetermined under a separately stated key, never folded into either.
accepts-when: a case with a writer's own reading and two second readings reads `unbound` 2 and states the writer-undetermined count apart (the measured failure it moves: 3 read where 2 is true). NEGATIVE CONTROL: drop the writer exclusion and the count reads 3, failing by name.
added: 2026-09-24 · SCHEDULER #20 (id minted by REC-213's worker).

### UI-109 · integrated — **THE QUEUE'S FINDING ITEM CANNOT SHOW A REOPENED QUESTION'S EARLIER DECISION: D-527 publishes `prior_disposition` on `op=queue`'s FINDING items and no surface reads it.** D-527's own scope: *a UI follow-on renders it and is rowed once this lands* (CONDUCT #20 22:34Z). — owner UI.
status: integrated — SCHEDULER #21 03:00Z: tip 5c27cf76, GATE 92/92 GREEN; additive queueFindingPriorHtml; corrected UI-99's declared-flow-surface control arm 5
order: after UI-108, in product order: the second surface for the same decision record (SCHEDULER #20, 2026-09-24)
milestone: M4
interface: I3 consumer (D-527's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2 "The declared flow, and its revisions" (a reopened proposal carries the earlier decision as `prior_disposition`).
depends-on: D-527.
scope: render on the queue's FINDING item who reopened it, the earlier decision, and whether that decision still applies, in the plane's words.
accepts-when: against a real-plane suite a reopened finding's queue item shows its earlier decision (the measured failure it moves: the reopened question shown as one nobody has answered). NEGATIVE CONTROL: omit `prior_disposition` from the render and the reopened-item arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs UI`).

### REC-219 · integrated — **A PUBLISHED CASE SIGNS "no manifest was in force" WHILE ITS SCOPE'S ONLY ADOPTION PINS A PROPOSED REVISION: the frozen `bias_manifest` block of `bio-case-document/3` has no field for REC-210's `pins_proposed`, so a later reader takes "a declaration was pending" for "nobody declared anything".** Found at REC-210's integration (CONDUCT #20 22:57Z). BOB #34 RULED YES 2026-09-24 23:08Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #20): `bio-case-document/4`, whose frozen `bias_manifest` states both facts as they stood at signing — none in force, and an adoption pinning a proposed revision (its id), not yet in force — and says nothing about when or whether it takes effect; /3 documents stay valid, read as they are, never re-signed. — owner RECORD.
status: integrated — SCHEDULER #22 03:48Z: tip b9528b03 = REC-219 (bf7e69ac, 367/367) + D-597 (c2524ad8, b9528b03; 78/78 GREEN on b191859d); CATALOG 1.30.0 (468, ce0367d3); census 117->118 (119 at union with REC-220); C-41.14, C-41.15; Publication §3 rule 18
order: after UI-109, IN PRODUCT ORDER after REC-210 lands, not ahead (BOB #34 23:08Z) (SCHEDULER #20, 2026-09-24)
milestone: M10
interface: I3 — a format bump; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 (the case-document format, rules 12-13's /3 bump) with `docs/architecture/BIO_Declared_Bias_v0_1.md` "Bias bundles and adoption", and BOB #34's ruling of 23:08Z, which this row FOLDS into §3.
depends-on: REC-210.
scope: bump to `/4`; the frozen block carries the pending-adoption fact with the revision id; a new C-41 check refuses a /4 document whose block omits it where the record held one. BOB named C-41.13, but /3's obligation already holds C-41.13 (bio-checks ~11548), so use the next free C-41 number and say so. /3, /2 and /1 stay accepted.
accepts-when: a case published under a proposed-only adoption signs a /4 block naming the pending revision, and a /3 document still ratifies unchanged (the measured failure it moves: "no manifest was in force" alone). NEGATIVE CONTROL: omit the field and the new check refuses by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs REC`).

### D-534 · integrated — **`op=queue` PUBLISHES `mute.cases` AS CASE IDS ALONE AND THE MUTED KINDS NOWHERE, so no surface can name the kinds of a case mute that is suppressing nothing today, and no member can undo that mute (the case form's unmute needs the kinds named).** `queueFeed` publishes `[...mutes.keys()].sort()` while `#queueMutes(member)` already holds `case_id -> Set(kind)`. Found by UI-97's worker (id minted by it). — owner RECORD.
status: integrated — SCHEDULER #21 02:34Z: tip 6d1b2afe, GATE 366/366 GREEN; I3 additive mute.case_kinds; UI-107 follows
order: after D-531, with the corrections: a member left unable to undo their own act (SCHEDULER #19, 2026-09-24; UI-97's worker 21:55Z)
milestone: M8
interface: I3 additive — `mute.cases` gains its kinds; the integrator mints and classifies the IC.
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class" (DEC-10's (c); D-125's case form).
depends-on: UI-97.
scope: `queueFeed`'s mute block publishes each muted case WITH its kinds (`cases: [{case, kinds}]` or a `case_kinds` map beside `cases`, whichever is least disruptive to current readers). Extend `bio-plane/test/d125-findingmute.test.mjs`.
accepts-when: a kind muted on a case whose items are not live today is named in `op=queue`'s mute block (the measured failure it moves: case ids with no kinds). NEGATIVE CONTROL: publish the case ids alone again and the "a kind holding nothing back today is still nameable" arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (placed; `D-534` minted by UI-97's worker).

### D-553 · integrated — **THE RETIRED-TARGET QUESTION IS SPELLED THREE WAYS IN THE STORE, AND ONLY TWO AGREE: (a) D-444's `#retiredNotCitable(id)` (store.mjs ~5185, Information-typed); (b) an identical copy in DEC-49 region `is-cite-retired` at `op=cite` (~12806); (c) `SUGGEST_LEG_UNREACHABLE` (~40290), viewer-gated and type-blind.** The comment at (b) claims the suggest path asks the same question; it does not. Found by D-444's worker (22:34Z). — owner RECORD.
status: integrated — SCHEDULER #21 02:41Z: tip a1d39356, GATE 366/366 GREEN; type-blind #retiredNotCitable; is-cite-retired 17->12L, is-suggest-checks 345->350L
order: after UI-107, in product order: a consistency defect, probably a no-op today, since no state machine but Information's carries `retired` (not measured) (SCHEDULER #20, 2026-09-24)
milestone: M8
interface: I3 for (b) (a governed region contracts); the type-blind widening's IC is minted by the integrator ONLY if the measurement finds a second `retired` machine.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 ("A RETIRED ITEM IS NOT CITABLE", BOB #30), whose Incomplete-sections bullet D-444 updated to name this.
depends-on: D-444.
scope: BOB #34 RULED 22:55Z (drained by SCHEDULER #20): the rule WIDENS to the STATE; (c)'s type-blindness is CORRECT. ONE helper, type-blind: (a) `#retiredNotCitable` drops its Information test, (b) `op=cite` calls it (move `is-cite-retired` `regionLines` to the figure printed on the MERGED source), (c) the suggest path calls it. Viewer-gating never decides citability; only the refusal's WORDING may be viewer-gated. MEASURE which state machines carry `retired` and state the count. Correct the false comment at (b). A future machine meaning something else must name its state differently. §4.1's sentence rides BOB's batch.
accepts-when: `affordances.test.mjs` §0's spelling count moves to ONE helper read at all three sites, and a viewer who cannot see the target is still refused (the measured failure it moves: two copies that can diverge silently). NEGATIVE CONTROL: restore (b)'s inline copy and §0 names it.
added: 2026-09-24 · SCHEDULER #20 (id minted by D-444's worker).

### REC-218 · integrated — **A CSV READING'S DIALECT IS NOT PERSISTED: FW-23 finds the delimiter and encoding by signature, and nothing keeps them on the record, so a re-read cannot say which dialect it read.** BOB #33 RULED 2026-09-24 21:55Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #20): option (b), a `reading.dialect` key of its own (delimiter, encoding), persisted on the acquire document — not `container_extent`; it suits other text formats with a decoding choice. — owner RECORD.
status: integrated — SCHEDULER #21 02:52Z: tip 8c6f1bdf, GATE 367/367 GREEN; I1 reading.dialect + optional I7 dialect(bytes) (additive); merges clean with D-536 in index.mjs
order: after D-536, beside the other reading-provenance row: the record stating how it read what it holds (SCHEDULER #20, 2026-09-24)
milestone: M2
interface: I1 additive — a `reading.dialect` key on the acquire document; the integrator mints and classifies the IC.
design: `docs/development/OFFICE-FORMATS.md` "CSV — DESIGNED 2026-09-24 by BOB #32" (delimiter and encoding RECORDED on the reading, undetermined when they cannot be told), with BOB #33's ruling of 21:55Z, which this row FOLDS into that section in the same landing.
depends-on: FW-23.
scope: persist `reading.dialect {delimiter, encoding}` on the acquire document at FW-23's reader; `undetermined` with its reason when the signature cannot tell; readable on the capture's read.
accepts-when: a semicolon-delimited latin-1 CSV's acquire document reads `reading.dialect` with both, and an ambiguous one reads undetermined (the measured failure it moves: the dialect found and discarded). NEGATIVE CONTROL: drop the persistence, and the read-back arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs REC`).

### M0-193 · integrated — **`bio-plane/test/surfacing-run.mjs` HAS TWO LATENT FIXTURE DEFECTS: (F2) `openRun` derives `snapKey` from the whole SECOND (`${now.replace(/[-:]/g, "")}_5171f1a0`), so two fixture projects opened in one second share a snapKey; (F3) the wrapper clears its run cache on ANY whole-store `op=purge` attempt, including one REFUSED for a missing `confirm`.** Found by M0-187's worker (via CONDUCT #20 22:15Z). Harmless today. — owner RECORD (the shared test helper).
status: integrated — SCHEDULER #21 02:34Z: tip dc2c3f63 (on 964da679), GATE 152/152 GREEN; test helper only; 95 importers green
order: after D-541, with the process rows behind the product rows: latent, and neither has produced a false gate result (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none (test code).
design: `docs/development/VERIFICATION.md` (a fixture's state follows what the plane answered, never what was asked).
depends-on: M0-187 (its per-run `nth`).
scope: append M0-187's per-run `nth` to `snapKey`; clear the run cache only when the purge's answer says the purge happened.
accepts-when: two fixture projects opened in one second get distinct snapKeys, and a refused purge leaves the cache (the measured failure it moves: a shared key and a cache cleared by a refusal, each driven by a planted arm). NEGATIVE CONTROL: drop `nth` from the key and clear on any attempt, and both arms fail by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs M0`).

### D-535 · integrated — **THE PLANE'S MEMBER-FACING STRINGS CITE `MEASUREMENTS.md` BY NAME, so every suite importing the check catalogue or the plane's index counts as a MEASUREMENTS reader and a MEASUREMENTS-only diff selects it: `bio-plane/checks/bio-checks.mjs` and `bio-plane/src/index.mjs` carry four citations (one DEC-49 refusal translation, three OCR cost sentences), and gates.mjs §2e reads a directly-imported runtime module's text for path mentions.** Found by M0-176's worker (M-146 §"D-535, ISOLATED HERE"); M0-176 is NARROWED to this. — owner RECORD (index.mjs), CHECKS (bio-checks.mjs).
status: integrated — SCHEDULER #22 03:20Z: tip 03f34d18, GATE 105/105 GREEN FULLREUSE (8149 assertions), tree 9032853f; M-161 (40->32 of 43); hygiene walk floor 44->45; statepaths.control arm b now arms; minted D-600
order: after M0-193, with the process rows behind the product rows: it trims the doc-facing selection by two units (39 → 37, M-146), which is not an appreciable gate-time effect (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24; via CONDUCT #20 22:31Z)
milestone: M0
interface: I3 — one DEC-49 translation's words change; the integrator classifies.
design: `docs/development/VERIFICATION.md` (a gate selects by what a suite reads), with DEC-49 as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it for the translation.
depends-on: M0-176.
scope: rewrite the four citations as prose ("the MEASUREMENTS ledger"), the correction M0-165 made to calibration.test.mjs's `measured_by` labels one level down. Extend `statepaths.test.mjs`'s pin of this property from the TEST side to `bio-plane/src/` and `bio-plane/checks/`, so a by-name citation there cannot return (M0-176's worker). CAUTION: one is a DEC-49 refusal translation, so check its governed region, `regionLines`, and every refusal-wire pin that quotes the sentence.
accepts-when: a MEASUREMENTS-only diff no longer selects `calibration.test.mjs` and selects 37 units (the measured failure it moves: 39, M0-176's unmet accepts-when). NEGATIVE CONTROL: restore one citation by name and the selection re-admits the importing suites, failing by name.
added: 2026-09-24 · SCHEDULER #20 (id minted by M0-176's worker).

### D-589 · integrated — **A DEC-49 REGION INSIDE `aiRunOpen` IS JUDGED TWICE AND FAILS: its catalogue rows keep a WHOLE-FUNCTION `where`, so a new governed region inside the function is read both by the region and by every whole-function row.** Found by REC-207's worker (F2, via CONDUCT #20 01:48Z). REC-71's class. — owner RECORD (the catalogue rows), M0.
status: integrated — SCHEDULER #22 03:10Z: tip 0676cf09, GATE 366/366 GREEN (21062 assertions), clean tree 128f0b4e; unions with REC-207's exclusion
order: after D-574, with the DEC-49 instrument rows behind the product rows: it blocks the next governed edit to aiRunOpen with a false red, and no gate result is false today (SCHEDULER #21, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the DEC-49 guard), with REC-71's narrowing of whole-function rows into regions.
depends-on: none.
scope: narrow every aiRunOpen catalogue row's `where` into its own DEC-49 region, as REC-71 did for its function; move the guard's floors to the printed figures.
accepts-when: a new region added inside aiRunOpen is judged once and passes (moves: a double judgement). NEGATIVE CONTROL: restore one whole-function `where` and the planted region's arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs D`).

### M0-147 · integrated — **TWO SUITES READ THE YEAR OFF THEIR OWN CLOCK: `mint-ledger.test.mjs` (line 76) and `opaque-ids.test.mjs` (line 67) set `YEAR = new Date()…slice(0, 4)`, so a run straddling New Year's midnight UTC compares ids minted in one year with the next.** Found by D-487's worker's sweep (the instant-dependent class, D-231, D-487). — owner M0.
status: integrated — SCHEDULER #22 03:17Z: tip 8db5d2f8, GATE 74/74 GREEN TARGETED (5669 assertions), clean tree 520f11ec; new bio-plane/test/clockpin.preload.mjs; minted D-594
order: low in the M0 group: latent, fires only across a year boundary (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:25Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a suite's verdict must not depend on the instant it starts).
depends-on: none.
scope: read the year off the plane's first minted id in each suite, not the suite's clock.
accepts-when: both suites pass under a clock pinned 1 ms before New Year UTC. NEGATIVE CONTROL: restore the clock read under that pin and the id arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-148 · integrated — **THE R3-FED WALK KEYS ON LITERALS, so a code fed through a derived const (UI-84's REQUIRED_ARGUMENT_MISSING) is invisible and the walk undercounts by one.** Found by UI-84's worker. — owner M0.
status: integrated — SCHEDULER #22 03:42Z: tip 07f38280 (CARRIES D-485 a23fe7ee), GATE 76/76 GREEN (6411 assertions), tree afccd7da; r3Fed 80->77, reach 455->457, reachGap ceiling 42->44; minted D-599
order: low in the M0 group: an undercount of one, stated (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:26Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the DEC-49 guard).
depends-on: UI-84 (its train).
scope: teach the walk to follow a const to its catalogue value; failing that, record the undercount at the walk. WIDENED 2026-09-24 (UI-100's F1): the same walk OVERcounts too — `partitionSuiteLiterals` harvests quoted codes from comments (r3Fed read 81 vs 80): blank /* */ and // spans first (the obsSpans technique). Also correct UI-84's control arm C declaration (declared GREEN; the rename in fact stops the plane — M-139 §7).
accepts-when: r3Fed counts REQUIRED_ARGUMENT_MISSING. NEGATIVE CONTROL: inline-break the const's resolution and the arm names the missed code. A code named only in a comment is not counted.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-152 · integrated — **`fleetbundles.control.mjs` ARM 5(b) JUDGES "OUTSIDE THE DOC-FACING SET" BY READING THE SUITE WHOLE (`suiteSrc.includes(needle)`, line ~291), while `gates.mjs` now strips comments (M0-143): the driver and the gate disagree the moment either file grows a `docs/` comment.** Found by M0-143's worker. — owner FLEET.
status: integrated — SCHEDULER #21 02:57Z: tip 23214fa4, GATE 73/73 GREEN; gates.mjs --explain prints the doc-facing line in every class; conflicts with M0-188 in fleetbundles.test (take both); driver head tally is SEVENTEEN arms on the union
order: low in the M0 group: a hand-run driver line, not a battery assertion (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:15Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a control coupled to shape must read what the gate reads).
depends-on: M0-143.
scope: read the suite through the same `stripComments` M0-143 uses before the check. WIDENED 2026-09-24 (M0-153's finding b): the doc-facing rule arm 5(b) restates is also stale on comment-blanking and the edge rule — read through `stripComments` (`bio-plane/scripts/walkfloor.mjs`) and assert the derivation THROUGH `gates.mjs`, not a restatement.
accepts-when: the driver's verdict equals `gates.mjs --explain`'s for fleetbundles. NEGATIVE CONTROL: add a `docs/` comment to the suite and the old whole-read line disagrees, the new one does not.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### UI-75 · integrated — **THE ELICITATION READ-BACK NAMES NO SHARED ORIGIN: a member affirming *"fails only if ALL of these fail"* is not told that two** … (whole text: the cut archive)
status: integrated — SCHEDULER #22 03:12Z: tip b287db8b, GATE 154/154 GREEN (10819 assertions); r3Fed 80->81; union with UI-88: keep both hits, drop the none, re-grade 8.partition-independence BUILT
order: 2 of 2, after REC-161; with UI-74, whichever lands second reuses the first's rendering (BOB #22, 2026-09-21)
milestone: M9
interface: I3 consumer (REC-161's IC).
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 clause (c), with DEC-69: inform once, at the act.
depends-on: REC-161.
accepts-when: two correlated reasons show their origin and the member's answers are written unchanged. How a liar passes it: blocking or reordering the answers on a shared origin, which turns an informing fact into a gate.
added: 2026-09-21 · SCHEDULER #7 (BOB #22's inbox entry, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-75» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.
note: 2026-09-23 by SCHEDULER #17 (CONDUCT #17's 22:00Z finding (1), verified at c17-batch5): REC-161's `partitionindependence` op exists on c17-batch5 and `app.html` calls it nowhere; `elicFalsifier` is a pure string builder. The same commit re-grades `8.partition-independence` to BUILT and drops its `none` probe. Suite `civicos-ui/test/elicitation.test.mjs`; NEGATIVE CONTROL: stub the fetch to return `shared:[]`, and the correlated-fixture arm fails by name.

### UI-78 · integrated — **THE PUBLIC HEADER CANNOT SHOW A GROUP'S DISPLAY NAME OR VERIFIED DOMAIN, AND MEMBERS CANNOT SEE A DOMAIN CLAIM'S VERDICT.** … (whole text: the cut archive)
status: integrated — SCHEDULER #22 03:32Z: tip facb3d0e, GATE 74/74 GREEN FULLREUSE (6290 assertions), tree 4980aa1a; 13.group-identity PARTIAL on the setup page alone (D-596)
order: directly after REC-164, which it consumes (BOB #24: *"UI (M7), after 2"*) (SCHEDULER #9, 2026-09-21)
milestone: M7
interface: I3 consumer (REC-164's IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §7 (a display name shown WITH the slug, never instead of it; a … (whole text: the cut archive)
depends-on: REC-164, UI-77.
accepts-when: against the real plane, a group with a display name shows it beside the slug; an unverified or mismatched domain never appears on the public header, and members see its verdict. How a liar … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #9 (BOB #24's inbox entry, item 3, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-78» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### MK-7 · integrated — **THE ATTRIBUTION ACT, AND THEN THE LIFT OF MK-1's FENCE** (MK-3's replacement (ii), `MEMBER-KNOWLEDGE-DESIGN.md` §4.2–§4.6): an … (whole text: the cut archive)
status: integrated — SCHEDULER #22 04:37Z: tip 687c8ea9, GATE 367/367 GREEN FULLREUSE (21096 assertions), tree 1b76729c; the new attribute act, C-92.1-12, IC-319 (builder: MAJOR); CATALOG 1.30.0 (collides with REC-219, REC-203); 13.attribution BUILT, 2.firsthand BUILT; provisionals §4.4 and §4.6 with Bob; D-598 built separately
order: after MK-6, which it rests on, and above MK-5, which rests on it; replaces MK-3 (superseded 2026-09-21). Two points are provisionals carried to Bob, cheap to change until built: §4.4's narrow veto and §4.6's `name` = handle (SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3 — the builder names the op and, if a design names it first, registers it in `op-claims.mjs`' `PLANNED_OPS`.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4.2–§4.6 and §8's row for replacement (ii).
depends-on: MK-6; REC-126 (the review copy, built).
accepts-when: through the ops, each level round-trips into the published projection exactly as chosen; nothing is prefilled; an unchosen reached observation refuses ratification BY NAME; `name` without a … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit; `node tools/mintid.mjs MK`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «MK-7» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-147 · integrated — UNBLOCKED 2026-09-24 by BOB #32: its dependency is met (M0-71 done, gate on main; M-118). The old block confused an ACCEPTANCE condition with a precondition — the judgement this row builds is what the gate measures. RULED: accepts-when adds that the run REPORTS recall beside false conflicts on M0-71's gate (the gate alone cannot see a detector that abstains); a judgement whose recall does not beat the lexical baseline's 2/9 (M-118) is the finding and returns to BOB.
status: integrated — SCHEDULER #22 04:41Z: tip abdf486d, GATE 60/60 GREEN FULLREUSE over tree 6f3ee7d5's full run (366/366 but floor slack, moved in commit 2), tree d043c47b; M-162: machine judgement MEETS M0-71's gate; the new contradiction propose act, C-93.1-7, IC-318; CATALOG 1.30.0 (collides); D-604 with BOB
order: blocked on M0-71's measured gate (SCHEDULER, 2026-09-19)
milestone: M9
interface: I3 and I5 (a table; ICs minted with `node tools/mintid.mjs IC`)
design: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §5 (the judgement and its vocabulary), §8 (where a candidate lives) and §9 item 3.
depends-on: M0-71, AND its measured gate met — a threshold missed is the finding, and this row then goes back to BOB.
accepts-when: M0-71's gate passes on the built judgement; a re-run over unchanged referents writes nothing new; every row names both referents and versions, the key, the run, the label and … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 3).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-147» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.
note: 2026-09-23 by SCHEDULER #17 (M0-71's worker, via CONDUCT #18): the contradiction gate cannot see a detector that ABSTAINS (recall 2/9 sits beside it); this row stays blocked until its machine judgement is measured on this gate WITH its recall reported. The measurement is M-118 (M-117 was burned by a collision).

### UI-69 · integrated — **EXPORT OF A REVIEW COPY carrying the quartet in-band on every page, with §6A.3 point 2 said AT the act: what leaves cannot be revoked; the grant can.** — owner UI.
status: integrated — SCHEDULER #22 03:40Z: tip d57c135e (comment-only over 0406203f; 72/72 GREEN on tree 128736d5), full set 305/305 GREEN on 0406203f (18006 assertions); 13.review-copy export BUILT (still PARTIAL); two provisionals + one design gap with BOB #35
order: after UI-68 and REC-148: export only once the quartet travels with it (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 consumer (REC-148's IC)
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 point 2.
depends-on: UI-68 and REC-148.
accepts-when: an exported copy carries the quartet on every page byte-equal to the plane's; the statement renders at the act and nowhere else. NEGATIVE CONTROL: drop the quartet from one … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 8).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-69» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-147 · integrated — **A RECORDS REQUEST IS ONE ROUND TRIP: `awaiting_response` HIDES THE FEE ESTIMATE, THE WAIVER DECISION, A PARTIAL PRODUCTION AND** … (whole text: the cut archive)
status: integrated — SCHEDULER #22 04:16Z (relayed by CONDUCT #21): tip cad047f4, GATE 367/367 GREEN FULLREUSE, tree 97c5e3cd; records-request lifecycle, C-94.1-11, three governed regions in actionCorrespond
order: directly after D-149, on D-148's entry grammar, which it extends (BOB #27: *"depends-on D-148"*), the M10 action path (SCHEDULER #14, 2026-09-22; BOB #27's inbox entry, item 2)
milestone: M10
interface: I3 and I5 — correspondence entry kinds, a closed outcome vocabulary and a stated due date; the … (whole text: the cut archive)
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, *THE RECORDS-REQUEST LIFECYCLE* (BOB #27, 2026-09-22), bound by D-149.
depends-on: D-148 (the entry grammar it extends); D-149 (a stated due date names one of the action's citations).
accepts-when: a request, a fee estimate, a waiver decision, a partial production and an appeal read back as one dated chain; an entry with no stated due date reads UNDETERMINED; a stated … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #14 (BOB #27's inbox entry, item 2, drained this commit; D-147's DEBT row of 2026-08-01; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-147» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-196 · integrated — **A READ NAMING A DISCOVERABLE PROJECT'S OWN ID ANSWERS "DOES NOT EXIST" TO A MEMBER THE DIRECTORY HAS JUST SHOWN IT TO.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *POSITIONAL WINS for the PROJECT ITSELF: an uninvited member session naming a discoverable project's own id gets the positional refusal (not a participant; id and name only); anything INSIDE the project answers exactly as today; `viewerPredicate` unchanged.* — owner RECORD.
status: integrated — SCHEDULER #22 03:48Z: tip 82f604d2, GATE 366/366 GREEN FULLREUSE (21121 assertions), tree e55d42c9; 24 read ops answer C-70.1 at EXISTENCE (I3); carries D-601's fix
order: before REC-150, the §7.14 sequence (SCHEDULER #17, 2026-09-23; REC-149's worker)
milestone: M8
interface: I3 — the project-id read's refusal; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.14), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-149.
scope: the project-itself read gives a discoverable project's positional refusal; contents keep the existence answer. Extend `bio-plane/test/project-sight.test.mjs`.
accepts-when: a discoverable project's id reads the positional refusal naming id and name; a bundle inside it still reads as absent. NEGATIVE CONTROL: answer "does not exist" for the project itself, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-601 · integrated — **`project-discoverable.control.mjs` ARM `default-discoverable` HAD NOT ARMED SINCE D-497 (its anchor ended `END,`, the comma before the removed `at` column), so the default-HIDDEN rule's only negative control was not running on main.** Found and FIXED by REC-196's worker inside its landing (03:41Z). — owner RECORD.
status: integrated — SCHEDULER #22 03:48Z: fixed in land/worker/REC-196 @ 82f604d2 (366/366 GREEN); the arm runs AS DECLARED 96/61; archive with REC-196.
order: with REC-196, which carries its fix (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the negative control: break the subject, watch the suite fail at a NAMED assertion).
depends-on: none.
scope: re-anchor the arm on the current line; done in REC-196's landing.
accepts-when: the arm reports ARMED and fails by name (moves: 1 arm that never armed). NEGATIVE CONTROL: the arm itself, re-run AS DECLARED 96/61.
added: 2026-09-25 · SCHEDULER #22 (id minted by REC-196's worker).

### REC-197 · integrated — **CREATE AND FORK DO NOT CARRY THE DISCOVERABLE SETTING, AND A MACHINE CREDENTIAL'S OWNERLESS PROJECT HAS NO RULE.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *create and fork take one optional `visibility` (`discoverable` or `hidden`), absent means HIDDEN; a MACHINE credential never sets it (an ownerless project has no owner to choose): its creation is HIDDEN and `visibility=discoverable` from one is refused by name.* — owner RECORD.
status: integrated — SCHEDULER #22 05:10Z: tip e88ef9d1 (CARRIES REC-196 82f604d2), GATE 366/366 GREEN FULLREUSE (21138 assertions), tree ae3fe673; visibility on create and fork, absent = HIDDEN, machine discoverable refused C-97.1; CATALOG 1.30.0 (a FIFTH claimant; M0-195's A9 applies)
order: directly after REC-196 (SCHEDULER #17, 2026-09-23)
milestone: M8
interface: I3 additive — the `visibility` field and one refusal; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.14), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-149.
scope: the field on both acts, the fail-closed default, the machine refusal. Extend `bio-plane/test/project-sight.test.mjs`.
accepts-when: an absent field creates HIDDEN; a machine's `discoverable` is refused by name. NEGATIVE CONTROL: default to discoverable, and the fail-closed arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-150 · integrated — **DISCOVERABLE OR HIDDEN, 2 of 4: THE REQUEST TO JOIN — ask (one open per member per project, optional comment), withdraw** … (whole text: the cut archive)
status: integrated — SCHEDULER #22 04:30Z: tip 1d02811f, GATE 367/367 GREEN (21127 assertions), tree 1b15d986; IC-320, C-95; two §7.14 gaps ruled by BOB #35 04:30Z, follow-up REC-226
order: after REC-149, whose EXISTENCE level it needs (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 (an IC minted with `node tools/mintid.mjs IC`)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14 and §7.4 (a grant is an invitation … (whole text: the cut archive)
depends-on: REC-149.
accepts-when: a grant leaves the requester `invited` and NOT `joined`; a lapsed requester reads their own request and nothing else about the project; an administrator's grant is refused. … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 2).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-150» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-602 · integrated — **`project-discoverable.control.mjs` ARM `default-discoverable` HAD NOT ARMED SINCE D-497: the SAME defect as D-601, minted and fixed independently by REC-150's worker on its branch.** — owner RECORD.
status: integrated — SCHEDULER #22 04:34Z: fixed in land/worker/REC-150 @ 1d02811f (367/367 GREEN); D-601 fixed the same anchor on REC-196 @ 82f604d2, so the union takes ONE fix; archive with REC-150.
order: with REC-150, which carries its fix (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the negative control: break the subject, watch the suite fail at a NAMED assertion).
depends-on: none.
scope: re-anchor the arm; done in REC-150's landing (and in REC-196's as D-601).
accepts-when: the arm reports ARMED and fails by name. NEGATIVE CONTROL: the arm itself.
added: 2026-09-25 · SCHEDULER #22 (id minted by REC-150's worker; CONDUCT #21's relay).

### D-598 · integrated — **C-21.2's INHERITANCE RULE READS EVERY PUBLISHED BUNDLE AS A PUBLISHED CASE, EVIDENCE INCLUDED: a document or observation published as a case's EVIDENCE (D-431(b)) forces every later citation of it to be `grade_source: inherited`, though it carries no frozen strength and is not a published finding.** Found by MK-7's worker (02:47Z). — owner RECORD.
status: integrated — SCHEDULER #22 04:08Z: tip af488f3b, GATE 366/366 GREEN FULLREUSE (21064 assertions); C-21.2 inquiry-only; its CATALOG bump (C-21.2 in changed:) is taken at CONDUCT's union AFTER M0-195 lands (BOB #35 04:00Z), not before
order: after D-597, with the case-citation rows: a later finding refused its own grade on evidence is the record claiming less than it can support and a leg ungradeable for no reason; BOB #34 03:00Z: *"C-21.2's inheritance rule applies to published INQUIRIES only"* (SCHEDULER #22, 2026-09-25)
milestone: M10
interface: I3 — a narrower C-21.2 refusal; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 5 (inheritance is per axis), narrowed by BOB #34's ruling of 2026-09-25 03:00Z (drained; BOB folds it into rule 5 with this landing).
depends-on: none.
scope: key `publishedRegistryFor` on object_type, so only a published INQUIRY is a published finding a leg must inherit from; evidence stays gradeable on its own axis (C-2.8 for testimony, the capture grade for documents). CORRECT the testify.test.mjs line that calls the captured-document case "the record's rule", with that reason.
accepts-when: a second finding over published observations lands with its own grade, and a leg onto a published INQUIRY still inherits (moves: evidence legs forced to inherit). NEGATIVE CONTROL: drop the object_type key, and the evidence arm is refused C-21.2 by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by MK-7's worker; BOB #34 03:00Z).

### UI-70 · integrated — **DISCOVERABLE OR HIDDEN, 3 of 4: the create and fork forms ASK, with neither preselected, and cannot submit without the choice** … (whole text: the cut archive)
status: integrated — SCHEDULER #22 06:14Z: tip bca3a5f7 (CARRIES REC-197 e88ef9d1 and REC-196), GATE 100/100 GREEN FULLREUSE (7436 assertions), tree 4a543570; create/fork ask Discoverable/Hidden with neither preselected; owner setting control; surface-registry A3/A4d/A4e 35/31/31
order: after REC-149, and after UI-66 on the same forms (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's IC)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14, with DEC-69 (forced, at the act).
depends-on: REC-149; and the create and fork forms as UI-66 leaves them (same forms — one worker at a time).
accepts-when: the harness cannot submit a create or fork without the choice, and nothing is preselected; the owner changes the setting and a non-owner sees it read-only. How a liar passes … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 3).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-70» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-134 · integrated — **NO SURFACE PERFORMS §4.9's CUSTODIAL ACTS: `memberadd`, `memberset`, `signeradd` and `signerset` have ZERO call sites in** … (whole text: the cut archive)
status: integrated — SCHEDULER #22 05:18Z: tip 26a3c0df, GATE 367/367 GREEN (21081 assertions), tree 6ebbd5ef; custodial surface + C-96.1-9 + members.invited_by (BOB #35 (b)); CATALOG 1.30.0 (a sixth claimant); M-171; minted D-605
order: with the M8 features after D-126, a surface over built ops; BOB #17 ordered it behind D-136's fence (*"a member surface over an act whose voter the caller can name is a SECOND path to a forgeable vote"*), which is built, and BOB #18 discharged BOB's half; it rests on REC-159's session reach (SCHEDULER #13, 2026-09-22, LED-7 batch S13-1)
milestone: M8
interface: I3 consumer (the four ops, reachable from an enrolled administrator's session once REC-159 lands).
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 (each custodial act is EVERY … (whole text: the cut archive)
depends-on: REC-159 (the four ops reach an enrolled administrator's session).
accepts-when: against the real plane, the founder's and an enrolled administrator's sessions each perform all four, attributed to them; a member's session renders none of the four. How a … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #13 (LED-7 batch S13-1; D-134's DEBT row of 2026-08-01, BOB #17's order and BOB #18's discharge; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-134» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### UI-76 · integrated — **NO SURFACE LETS A MEMBER DECLARE, TEST OR PLACE A THEME, OR SHOWS WHOSE LENS A THEME IS.** D-162's surface half, item 2 of BOB #23's entry. — owner UI.
status: integrated — SCHEDULER #22 04:08Z: tip 37035a59, GATE 225/225 GREEN FULLREUSE (14867 assertions), tree 3e74bded; Themes screen; 6.themes surface BUILT; no floor moved; router count + boot chain union with D-134/UI-78/UI-69; minted D-609
order: directly after D-162, which it consumes (BOB #23: *"UI (M8), after 1"*) (SCHEDULER #9, 2026-09-21)
milestone: M8
interface: I3 consumer (D-162's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.4, fences 1–3 (the cover on every reading; the … (whole text: the cut archive)
depends-on: D-162.
accepts-when: the harness declares, tests and places against the real plane, the cover shown on every theme it renders; a proposal renders as a hunch, never as membership. How a liar passes … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #9 (BOB #23's inbox entry, item 2, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-76» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-235 · integrated — **`op=basisversions` DOES NOT PUBLISH A VERSION'S `kind`: `basisVersions` selects every column of `inquiry_basis_versions`, `kind` among them, and the answer carries no `kind` key, so the same version reads a kind from `op=suggest` and none from here.** — owner RECORD.
status: integrated — SCHEDULER #22 03:52Z: tip 6e8c8f9a, GATE 366/366 GREEN FULLREUSE (21064 assertions), tree 519618d3; op=basisversions kind (I3 additive); suggest.control arms (3)..D-235f re-anchored (were not running)
order: after D-241 (SCHEDULER #17, 2026-09-23, LED-7 S17-2)
milestone: M3
interface: I3 additive — one field; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §9 (what a SUGGESTION is).
depends-on: none.
scope: `kind` in each version of the answer. Extend `bio-plane/test/suggest.test.mjs`'s cross-op arm. The row's other half (the sweep's reach) is stated in `rec75-sweep.mjs`'s header and is not rowed.
accepts-when: a version with a kind reads the same kind from both ops. NEGATIVE CONTROL: drop the key, and the cross-op arm fails on `kind`.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-191 · integrated — **A CAPTURE ASSEMBLED FROM REUSED PARTS DOES NOT STATE ITS TEMPORAL SPREAD: `subresources.mjs` records each part's `reused_from_fetched_at`, and nothing computes the earliest and latest fetch instants of the composite.** — owner CAPTURE.
status: integrated — SCHEDULER #22 03:58Z: tip 9351b715, GATE 366/366 GREEN FULLREUSE (21075 assertions), tree d6a77c3f; part_fetch_spread per clock (I5 additive); 2.reuse-spread BUILT; minted D-603
order: after D-235, with the product rows before the M0 group: the record holds the instants and does not say what they add up to (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M2
interface: I5 additive — the manifest's spread; the integrator mints and classifies the IC.
design: `docs/development/CAPTURE-SCALING.md` §"Checking that a reused asset is still the same" and §"Re-fetch at ratification is mandatory".
depends-on: CAP-14 (`reused_from`, `integrated` on c17-batch5).
scope: the capture manifest (or its reading) states the earliest and latest part-fetch instants of a composite. Extend `bio-plane/test/subresources.test.mjs`.
accepts-when: a composite whose parts were fetched at two instants states both. NEGATIVE CONTROL: drop the spread, and the two-instant arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-320 · integrated — **THE PASS-THROUGH JPEG ROUTE CANNOT BE TRANSCRIBED IN-ISOLATE: `ocr-worker`'s `transcribe.mjs` refuses every non-PNG route (PIXELS_UNREADABLE), so 17 of CPDF-12's 24 image-only pages (DCT) go untranscribed; 8-bit rotation is not built either (`pagepixels.mjs`).** — owner CONTENT-PDF.
status: integrated — SCHEDULER #22 04:43Z: tip 46b43c35 (CARRIES D-585 82fda0bf), GATE 78/78 GREEN FULLREUSE over 6bc01cc3's full run (366/367, its red fixed), tree 46b43c35; baseline DCT decoder, Pillow-exact; M-163; 5.pdf-dct-decode BUILT; owed after DIST's next ocr-worker cut: the deployed decode measured
order: with the M2 extraction rows, after D-191: the route with the strongest provenance reads nothing (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: I6 — the member's pixel route; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §6 (which gains the gap's statement).
depends-on: none — CPDF-12's census answered the share.
scope: a baseline DCT decoder in the member, checked against Pillow digests as `pagepixels.test.mjs` does; after decoding apply `/Rotate` (3 of the 24 are /Rotate 270; from D-244); 8-bit rotation. Extend `pdf-worker/test/pagepixels.test.mjs` and `ocr-member-e2e.test.mjs`.
accepts-when: a DCT image-only page transcribes, rotated, and its pixel hash matches Pillow's. NEGATIVE CONTROL: a no-op decoder fails on the digest by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-312 · integrated — **`memoryUsageBytes` IS NOT A FRACTION OF THE 128 MB ISOLATE, AND LIVE SITES STILL SAY "of 128 MB": `agent-worker/src/index.mjs` (the shipped `BOUND_SOURCE`, and the segment bound sized on that reading), `fl1-cpu-probe.mjs`, `INTERFACES.md` §"The segment bound…", `pagepixels.mjs`.** The rule is stated in `INTERFACES.md` §"The memory bound, and how it is expressed". — owner FLEET, CONTENT-PDF.
status: integrated — SCHEDULER #22 05:42Z: tip 223766d9, GATE 80/80 GREEN FULLREUSE over f2507a54's full run (385/386, statepaths ceiling fixed), tree 755d20b3; no live site says of 128; M-168: 120-turn bound SAFE (~8x headroom), no memory wall, CPU binds; minted D-611, D-621
order: after D-320, the M2 measurement corrections: a shipped bound rests on the misreading (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M0 (measurement wording, and one shipped bound)
interface: none — wording, and a re-check of one bound.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for the rule stated in `docs/development/INTERFACES.md` §"The memory bound, and how it is expressed".
depends-on: none.
scope: correct each live site; re-check the agent-worker segment bound against the rule and state the result.
accepts-when: no live site divides by 128 or says "of 128"; the bound's re-check is recorded. NEGATIVE CONTROL: a grep arm over the live sites fails by name on a planted "of 128 MB".
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-621 · integrated — **`statepaths.control.mjs` ARM b DOES NOT ARM: its COORD_BLOCK anchor predates `coord.mjs` importing and re-exporting RETIRED_FILES and isRetiredPath.** Found by D-312's worker (05:39Z) on main 5e8a65a8. D-535's worker found and FIXED the same arm on its branch ("statepaths.control arm b had NEVER ARMED since M0-140"), which is integrated and not yet on main. — owner M0.
status: integrated — SCHEDULER #22 05:42Z: closes with D-535 (land/worker/D-535 @ 03f34d18); CONDUCT confirms arm b ARMS on the merged tree (D-535's union figure statepaths 35/33); if it does not, this row returns to queued with D-312's named fix (re-key COORD_BLOCK/DEFS to the current import and export lines)
order: with D-535, which carries its fix (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the negative control: break the subject, watch the suite fail at a NAMED assertion).
depends-on: none.
scope: re-key COORD_BLOCK/DEFS to coord.mjs's current import and export lines; done in D-535's landing.
accepts-when: statepaths.control arm b reports ARMED and fails by name on the merged tree. NEGATIVE CONTROL: the arm itself.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-312's worker).

### D-460 · integrated — **DIAGNOSIS: SOME TIER-3 AGENDAS AND MINUTES READ AS GENERIC, AND NOBODY KNOWS WHY.** FW-20 observed it on its walk (M-121, on c18-batch8) without diagnosing it; one suspected cause is that the OCR member transcribes one page per invocation and the plane reads only the first. Its finder's session is archived and no CONTENT-PDF lane is live, so the diagnosis is rowed. — owner CONTENT-PDF.
status: integrated — SCHEDULER #22 04:34Z: tip 72879f23, GATE 64/64 GREEN TARGETED (5037 assertions), tree bc48bc56; M-165: one page per OCR acquire (174 of 190 untranscribed) AND agendas generic for lack of a Legistar file line (breadth, no defect); minted D-606, D-607
order: after D-312, with the M2 extraction measurements: a possible silent under-read of scanned civic records, the class CLAUDE.md §2 ranks worst if confirmed (SCHEDULER #17, 2026-09-23; CONDUCT #18 23:51Z)
milestone: M0 (a diagnosis — a measurement)
interface: none until the fix is named.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for FW-20's M-121 walk.
depends-on: FW-20 (`integrated` on c18-batch8; M-121 lists the walk).
scope: take the tier-3 walk documents M-121 names as agendas or minutes that read generic; establish whether the member transcribes one page per invocation and the plane keeps only the first; name the fix, or show the documents are generic.
accepts-when: the named fix (then placed as its own row) or the refutation, recorded with date and instrument. NEGATIVE CONTROL: a two-page scanned fixture whose second page alone carries the agenda heading reads generic before the fix, or the refutation shows it read whole.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-596 · integrated — **THE SETUP PAGE SERVED AT `/` READS THE GROUP'S SLUG ALONE (`index.mjs` `publicInstanceGroup` -> `setup.mjs` `groupLine`), so it shows neither the display name nor the verified domain, while `store.mjs` `groupNameSet`'s answer tells the administrator "every public surface shows it beside the slug".** Found by UI-78's worker (03:28Z). The construct's last NOT BUILT trace. — owner RECORD.
status: integrated — SCHEDULER #22 04:30Z: tip 37430658, GATE 78/78 GREEN FULLREUSE over tree ed441dc9's full run (365/366, its one red fixed), tree f161a127; setup page shows name + slug + dated domain; at union with UI-78 13.group-identity is BUILT (conjunction); live half owed after DIST's deploy
order: after D-561, with the public-surface corrections ahead of features: an answer claiming a surface shows what it does not is the record claiming more than it supports (CLAUDE.md §2) (SCHEDULER #22, 2026-09-25)
milestone: M8
interface: I3 consumer (op=groupidentity's public projection); the integrator classifies.
design: `docs/architecture/BIO_Membership_Architecture_v2.md`, the group identity section REC-164 built (UI-78 cites it), with UI-78's rendering rule: a display name as "name · slug", never alone; a domain only with its verified date.
depends-on: REC-164 (BUILT).
scope: `publicInstanceGroup` reads the Store's `groupidentitypublic` projection; `groupLine` renders "name · slug", and a domain only with its verified date. Re-grade construct-status 13.group-identity.
accepts-when: against the real plane the setup page shows the display name beside the slug and a verified domain with its date, and an unverified claim not at all (moves: the setup page reading the slug alone). NEGATIVE CONTROL: render the domain without its verified date and the setup arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by UI-78's worker).

### D-465 · integrated — **D-447's FIX COSTS SEARCH TIME: over 2,000 visible documents `q=culvert` takes 210 ms against 74 ms on `main`, because `highlight()` re-tokenises.** Measured by D-447's worker; its size at a real instance is UNDETERMINED. — owner RECORD.
status: integrated — SCHEDULER #22 04:12Z: tip 32f6b13d, GATE 36/36 GREEN TARGETED (2127 assertions), tree 70269b40; M-164: live size 31 docs, added cost below one request's network spread, no fix owed; bench kept as tools/d465-search-bench.mjs
order: with the M0 measurements, behind the product rows: fix only if it matters at real size (SCHEDULER #17, 2026-09-23; D-456's and D-447's workers via CONDUCT #18 00:05Z)
milestone: M0 (a measurement, then a fix if owed)
interface: none unless the fix is built.
design: `docs/development/VERIFICATION.md` (measure; do not recall).
depends-on: D-447 (`integrated` on c18-d456).
scope: measure the query time at a real instance's size; if it matters, compute per-term tf from an `fts5vocab` instance table instead.
accepts-when: the figure is recorded with date, instrument and size, and either the fix brings it back or the record states why none is owed. NEGATIVE CONTROL: the measurement at 2,000 documents reproduces the 210 ms figure within tolerance.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-473 · integrated — **`.odt` AND `.odp` EXPORTS STAY UNDETERMINED FOR BYTE STABILITY: D-351's `.odt` normalisation (strip `xml:id` on `text:list`) was never re-measured over the population, because the worker's pull of CAP-11's scratch captures was refused (PII) and it did not route around the refusal.** — owner CAPTURE.
status: integrated — SCHEDULER #22 05:58Z: tip 737913b0, GATE 367/367 GREEN (21093 assertions), tree 59cbdf3a; .odt WIDENED (normalised 6/8 stable, raw 3/8); .odp UNDETERMINED with its census target named; M-167; scratch residue 36 captures; wip/worker/D-473 is not for the train; minted D-612
order: with the M0 measurements, after D-465: widening to `.odt` is a measurement first (SCHEDULER #17, 2026-09-24; D-351's worker via CONDUCT #19)
milestone: M0 (a measurement)
interface: none until widened.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for D-351's normalisation.
depends-on: D-351 (finished; rides the train after c19-batch9).
scope: re-measure the `.odt` and `.odp` normalisation over a population the lane may read (never by routing around a refusal); widen only on the figure.
accepts-when: the stability figure is recorded with date, instrument and population, and the formats are widened or stated undetermined on it. NEGATIVE CONTROL: skip the `xml:id` strip, and the re-fetch pair reads unstable by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).
note: 2026-09-24 by SCHEDULER #19 (D-472's worker F2, via CONDUCT #20 20:14Z): the monitor's cry-wolf survives for Google Docs and Slides (.odt, .odp) because only .ods has a measured container digest; land the .odt normalisation with an ODF_EVIDENTIARY_MEASURED row once measured, and name a census target for .odp.

### D-612 · integrated — **EVERY REAL GOOGLE DOC EXPORT EMBEDS `Fonts/fontN.ttf`, REFERENCED BY `svg:font-face-uri`, AND D-351's MEMBER RULE REFUSES THOSE REFERENCES, so the .odt digest reads UNDETERMINED on ALL 8 real Docs (M-167) and the monitor's false "changed" alarm for Docs survives D-473.** Found by D-473's worker (05:49Z). — owner CAPTURE.
status: integrated — SCHEDULER #22 07:02Z: tip f2dcbc6c (CARRIES D-473 737913b0), GATE 367/367 GREEN FULLREUSE (21100 assertions), tree 30feba7f; font-face-uri discounted, Pictures/ still refuse; moved count UNDETERMINED (M-167 not re-addressable), minted a re-measure row; rides batch30
order: directly after D-473, which it completes: D-473's widening reaches no real Doc until fonts are admitted (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: none unless a digest's grade changes on the wire (the integrator classifies).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` (the ODF evidentiary rule, D-351 §5: a presentational part, as styles.xml).
depends-on: none (stacked on D-473's branch).
scope: in `referencedMembers`, do not count an href on a font-face-uri element (by local name); Pictures/ and Object N/ references still refuse.
accepts-when: a real-shaped .odt with Fonts/ and no image reads determined, and one with an image still refuses (moves: 8 of 8 real Docs undetermined). NEGATIVE CONTROL: count fonts again and the fonts arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-473's worker).

### D-515 · integrated — **NO COMMITTED FIXTURE IS A PDF WHERE TIER 2 GENUINELY DECODES FEWER GLYPHS THAN TIER 1, so D-501's degradation arm is proved on synthetic input only.** Found by D-501's worker (F1). — owner CONTENT-PDF.
status: integrated — SCHEDULER #22 04:18Z: tip 24546c6b, GATE 86/86 GREEN TARGETED (6246 assertions), tree 434cb08f; M-166: 0 of 2,107 held pages degrade at tier 2, D-501's arm stays synthetic; minted D-608
order: after D-473, with the measurements: the case is covered synthetically; a real page raises the evidence, not the behaviour (SCHEDULER #19, 2026-09-24; via CONDUCT #20 17:51Z)
milestone: M2
interface: none — a fixture and an arm.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with `docs/development/VERIFICATION.md` (measure; do not recall).
depends-on: D-501.
scope: search the bytes already held for a page where tier 2 decodes fewer glyphs; commit one as a fixture and drive D-501's award over it, or record with date and instrument that the corpus holds none.
accepts-when: a real page's award keeps tier 1 by glyph count, or the search is recorded empty. NEGATIVE CONTROL: award by raw length and the real-page arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### FW-24 · integrated — **THE WHOLE-CORPUS DOCUMENT-TYPE CENSUS IS NOW TAKEABLE AND NOT TAKEN: Legistar answered during FW-22, so the census can run over the whole corpus (`M032_HALVES=bucket`) instead of the sampled halves.** FW-22's worker (finding 3, via CONDUCT #20 21:21Z). — owner FRAMEWORK.
status: integrated — SCHEDULER #22 06:03Z: tip 6bc8de67, GATE 40/40 GREEN TARGETED (2345 assertions); M-176 whole-corpus census (bucket + Legistar, 2,000-doc sample): §2's ORDER DOES NOT MOVE; staff>minutes and directory>budget not separated
order: after D-515, with the measurements: EXTRACTION-BREADTH §2's rule that a count comes before any reader (SCHEDULER #19, 2026-09-24)
milestone: M2
interface: none — a measurement.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §2 "Readers beyond three — the rule, and the order".
depends-on: FW-22.
scope: run the census instrument over the whole corpus with `M032_HALVES=bucket`, FINANCIAL REPORT counted apart (FW-22); record each class's count with interval, date and instrument; restate §2's order if the counts move it.
accepts-when: MEASUREMENTS carries the whole-corpus counts with their instrument and date (the measured failure it moves: the order resting on sampled halves only). NEGATIVE CONTROL: fold FINANCIAL REPORT back into budget and the class count moves, by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs FW`).

### D-610 · integrated — **THREE WRITERS CHANGE `members.status` WITHOUT `status_by` (measured at 964da679: the re-invitation ~34957, the revocation ~35008 and the enrolment ~35183 in `store.mjs`), so a row `memberset` stamped reads a later status under the WRONG actor: a live false attribution.** Measured by BOB #35 on D-134's question (04:00Z). — owner RECORD.
status: integrated — SCHEDULER #22 04:53Z: tip 733659be, GATE 386/386 GREEN FULLREUSE (21887 assertions), tree 2cd8a884; all 7 members.status writers stamp status_by (5 were not); I5; union with D-134 on memberadd's two INSERTs and with batch-0925c on Membership v2's Status line
order: after D-586, with the authority and attribution corrections ahead of features: a status stated under an actor who did not cause it is the record claiming more than it supports (CLAUDE.md §2); BOB #35: *"(c) is a DEFECT"* (SCHEDULER #22, 2026-09-25)
milestone: M8
interface: I5 — `status_by` now written on every transition; the integrator classifies.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 and the REC-159 paragraph as BOB #35 folded it 04:00Z (land/bob/batch-0925c), with §4.7 for the vote.
depends-on: none.
scope: every writer of members.status writes status_by = the actor whose act caused that transition: enrolment the member; invitation and re-invitation the inviter; revocation its actor; a §4.7 vote the administrator whose vote completed it. Grep every writer by the column, not the three lines named. Rows written before read as they are; never back-fill.
accepts-when: each transition read back names the actor that caused it (moves: 3 writers leaving a stale status_by). NEGATIVE CONTROL: drop the stamp from the enrolment writer and its arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs D`; BOB #35 04:00Z).

### M0-195 · integrated — **A BEHAVIOUR-ONLY CHANGE TO A CHECK CANNOT TAKE A CATALOG_VERSION: the D-470 census counts C-numbers only, and its (A4) refuses two versions with the same census, so publication rule 17 ("a changed check moves the version") has no instrument when a check's body changes and its number does not.** Found by D-598's worker (03:37Z); ruled by BOB #35 04:00Z. — owner M0.
status: integrated — SCHEDULER #22 04:56Z: tip 891a2087, GATE 76/76 GREEN TARGETED (5847 assertions), tree f944bd62; A9 source pin (esbuild-printed behaviour source), changed: widened by source; every bio-checks code edit now needs a census row with source or an unchanged declaration; D-598 takes changed C-21.2 + source at union
order: at the head of the process rows, before M0-142: it unblocks a product landing (D-598 takes its version bump only after this lands) and a check changed silently is a record claiming the old rule (BOB #35 04:00Z: *"rule 17 STANDS and its instrument is short"*) (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none (the census's own grammar gains two fields).
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 17, as BOB #35 folded it 04:00Z (land/bob/batch-0925c @ 2e9d4f4e; rides the next train).
depends-on: none.
scope: the census row may declare `changed: [C-n.m, …]`, counted in the version's identity by (A4); the census pins each version to the digest of bio-checks.mjs's comment-stripped source, so a moved digest under an unmoved version fails by name unless the landing takes a new version or declares `behaviour: unchanged` against the new digest. In `bio-plane/test/d470-catalog-census.test.mjs` and its control.
accepts-when: a check's body edited with no census row fails by name, and one declared in `changed:` under a new version passes (moves: behaviour-only changes invisible to the version). NEGATIVE CONTROL: edit a check's body without a census row, and the new arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs M0`; BOB #35 04:00Z).

### D-563 · integrated — **`op=promote` TAKES A BUNDLE'S TITLE AND STATE FROM THE ENVELOPE, NOT THE DOCUMENT: it projects `bundles.title`, `current_state`, `prior_state`, `created` and `last_updated` from the envelope, and 7.1's name scan, 7.11's owner test and REC-181's retirement arm read `meta.title` / `meta.current_state`; MEASURED: a second project whose bytes name a TAKEN title LANDED when `meta.title` named another, and the projection shows the envelope's title over the bytes'.** D-526's class one field over; found by D-526's worker (00:48Z). — owner RECORD.
status: integrated — SCHEDULER #22 05:55Z: tip 30cac9a6, GATE 87/87 GREEN FULLREUSE over 1758659a's full run (385/386, pen-sweep fixed), tree 40bbe02b; title and state derived from the document, C-86.3/C-86.4; M-172; CATALOG 1.30.0->1.31.0 (504); pen-sweep ceiling 18->19; project-id slugs from the document title (I3); minted D-615
order: at the head of the backlog with the promote corrections: a name fence and an owner test a caller can steer with a label are authority defects, which outrank features (SCHEDULER #21, 2026-09-25)
milestone: M7
interface: I3 — refusals on op=promote for a contradicting envelope; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5 and D-510's derivation (the document states what it is; the envelope is a label).
depends-on: D-526.
scope: extend D-510's derivation to title and state: derive both from the document, refuse an envelope that contradicts it by name, and make 7.1's name scan, 7.11's owner test and REC-181's retirement arm read the derived values; the projection writes the derived values.
accepts-when: the taken-title promotion is refused NAME_TAKEN whatever meta.title says, and the projection shows the document's title (moves: a taken name landing under another label). NEGATIVE CONTROL: read meta.title in the name scan again and the taken-title arm lands, failing by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-526's worker).

### D-556 · integrated — **A WHOLE-HASH REGISTER ROW HELD IN PARTS CANNOT RATIFY: the gate refuses it PLANE_HELD_IN_PARTS (D-530) because publication copies a capture by its whole hash, while the audit calls the same bytes SOUND (D-533).** Found by D-533's worker (M-150). BOB #34 RULED YES 2026-09-25 00:00Z (drained to `BOB-INBOX-drained.md`; cite until folded): BOTH halves in ONE landing, never the gate alone. — owner RECORD.
status: integrated — SCHEDULER #22 05:28Z: tip 99b81cc9, GATE 80/80 GREEN FULLREUSE (378 units reused; earlier full 385/386, its op-claims red fixed), tree c9acfd64; parted captures ratify AND publish part by part (BOB #34 00:00Z); I3 wire; new PLANE_* gate findings, untranslated like D-530's (stated in §8)
order: after D-546, with the corrections: a gate that treats sound bytes as missing contradicts the record, but D-530's refusal is honest until both halves land (BOB #34 00:00Z) (SCHEDULER #21, 2026-09-25)
milestone: M10
interface: I3 — publication's copy and the gate's verdict; the integrator classifies.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (D-530's parted capture), with BOB #33's D-533 ruling and BOB #34's 00:00Z ruling, folded by this row.
depends-on: D-530, D-533.
scope: (1) publication copies a parted capture part by part and re-verifies each digest at the destination; (2) the gate admits the row when every part is present and verifies, and refuses by name (the missing part, or the digest that failed) otherwise; reuse D-533's parts helper, never a third copy.
accepts-when: a parted capture ratifies AND publishes, byte-verified; one missing a part is refused naming it (moves: PLANE_HELD_IN_PARTS on sound bytes). NEGATIVE CONTROL: drop the part-copy from publication and the publish arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-533's worker).

### D-561 · integrated — **FIVE REFUSAL CODES STILL REACH AN ANONYMOUS CALLER UNTRANSLATED ON THE PUBLIC `op=publishedbytes` AND `op=publishedcase`, after D-549 translated NO_PUBLISHED_STORE (C-68.5).** Found by D-549's worker (land/worker/D-549 @ afcf1128; codes named in its report, not on the branch). Its sibling D-562 (check-refusal-codes grades public-op codes out of reach) is D-542's reach-by-op class and rides D-542. — owner RECORD.
status: integrated — SCHEDULER #22 05:48Z: tip 1ab197c5, GATE 92/92 GREEN FULLREUSE (7372 assertions), tree 670988c1; NINE public codes (not five) translated, C-98.1-8 + C-69.2; I3 NOT purely additive: NOT_FOUND->NO_PUBLISHED_PART, TOO_LARGE->CONTAINER_TOO_LARGE, a false NOT_FOUND now OBJECT_MISSING; CATALOG 1.30.0->1.31.0 (d470 511); civicos-ui publishedcase.test mock stale (UI)
order: after D-567, with the corrections: a public caller shown a machine token is DEC-49's failure on the surface a stranger meets (SCHEDULER #21, 2026-09-25)
milestone: M10
interface: I3 additive — code, check and translation on the two public ops' refusals; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §7 (the public door), with DEC-49 (every refusal a member or the public can meet carries a canned translation).
depends-on: D-549.
scope: enumerate at the code every code the two ops mint to an anonymous caller that has no catalogue row (D-549 counted five), and mint each at one governed site with a DEC-49 row written for a member of the public.
accepts-when: each of the enumerated codes reaches a stranger with its translation, driven through the op (moves: five untranslated public codes). NEGATIVE CONTROL: strip one translation and that code's arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-549's worker).

### D-557 · integrated — **THE DECODE CENSUS NEVER CLASSIFIES TIER-3 TEXT, AND ITS READER LABEL SAYS IT DOES: `fw20-decode-census.mjs` labels the reader from the acquire reading's `text_tier` but judges the PLAIN `op=pdfstructure` text, which stops at tier 2, so 34 of 38 documents labelled "plane (text tier 3)" were judged on EMPTY text while their OCR text exists (M-152).** Found by D-536's worker. — owner CONTENT-PDF (the instrument).
status: integrated — SCHEDULER #22 06:20Z: tip 40b55ddd, GATE 86/86 GREEN TARGETED (6138 assertions); census judges the reading's text_units, label from producers; M-173: 34 of 38 tier-3 docs were judged on empty text, now 0; agenda 132->141, unclassified 202->173; page-one-only caveat (D-606/D-616)
order: after D-561, with the corrections: M-143's "38 tier 3" states a reading that never reached `judge`, so the record claims more than it holds (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M2
interface: none.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with D-536's reading provenance and M-152.
depends-on: D-536.
scope: the census judges the text the acquire reading classified (its `text_units`), or calls `op=pdfstructure&ocr=1` for a document read at tier 3; the reader label comes from `structure_provenance.producers`, never `text_tier`; re-run the sample and record the moved figures in a new measurement.
accepts-when: the 34 documents are judged on their tier-3 text, and no document is labelled tier 3 unless tier-3 text was judged (moves: 34 of 38 judged on empty text). NEGATIVE CONTROL: judge the plain answer again and the tier-3 arm reads empty, failing by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-536's worker).

### D-573 · integrated — **A REVIEW COPY'S `last_change` PICKS SILENTLY BETWEEN TWO ACTS IN THE SAME SECOND when one carries a whole-second stamp from before D-543, so the one in-band date claims an order the record cannot support.** Found by D-543's worker. BOB #34 RULED (1) 2026-09-25 01:05Z (drained to `BOB-INBOX-drained.md`; cite until folded): keep the instant-order pick as the ONE in-band date (DEC-31), and STATE the tie in `last_change.stated` ("which of <act A> and <act B> came later is undetermined: <act A> was recorded to the second"), naming the tied act in `last_change.undetermined_within`. — owner RECORD.
status: integrated — SCHEDULER #22 05:28Z: tip 114c6e0d, GATE 386/386 GREEN FULLREUSE (21882 assertions), tree 02f32dc3; tie stated in last_change.stated + undetermined_within (I3 additive); UI owed: UI-115
order: after D-557, with the corrections: a date that claims an order it cannot know is the record claiming more than it holds (CLAUDE.md §2; BOB #33's D-516 band rule) (SCHEDULER #21, 2026-09-25)
milestone: M10
interface: I3 additive — two keys on `last_change`; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 point 1, with BOB #34's 01:05Z ruling, folded by this row.
depends-on: D-543.
scope: when the two newest candidates fall in one second and one is whole-second, keep the pick, add the statement and the tied act; acts in different seconds carry no statement.
accepts-when: a legacy whole-second ack and a millisecond comment in one second give the pick PLUS the statement; acts in different seconds give none (moves: a silent pick). NEGATIVE CONTROL: drop the statement and the tie arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-543's worker).

### D-578 · integrated — **A PROMOTE REVISION WHOSE DOCUMENT AND ENVELOPE BOTH STATE NO TYPE LEAVES `promotedType` UNDEFINED, and the INSERT throws "NOT NULL constraint failed: bundles.object_type": the caller gets a raw error with a store.mjs stack instead of a named refusal (reproduced through op=promote on the D-547 tree; the transaction rolls back, nothing lands).** Found by D-547's worker (01:36Z). — owner RECORD.
status: integrated — SCHEDULER #23 06:55Z: tip 700a432d (stacked on D-563 30cac9a6), GATE 94/94 GREEN FULLREUSE (7680 assertions; 365 units reused from 64ad0306's 384/387, 3 shape pins corrected), tree 5468c228; C-86.5 PROMOTED_TYPE_UNSTATED, additive type_carried; M-177; CATALOG 1.31.0->1.32.0; minted D-628, D-629
order: after D-563, with the promote corrections: a raw stack on a public op breaks DEC-49 and leaks internals (SCHEDULER #21, 2026-09-25)
milestone: M7
interface: I3 — a typeless revision carries the head's type forward, stated; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5, D-510's derivation and D-547's retype fence (C-86.2).
depends-on: D-547; D-563 (same promote function; SCHEDULER #22).
scope: a revision that states no type takes the head's `cur.object_type` (the only type D-547 admits), stated on the answer, never silent; a CREATION that states no type keeps its existing refusal.
accepts-when: a typeless revision lands carrying the head's type and says so; no op=promote answer carries a stack (moves: a raw NOT NULL error). NEGATIVE CONTROL: drop the carry-forward and the typeless-revision arm reads the raw error, failing by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-547's worker).

### D-546 · running — **`op=promote` ASKS NO STATE-EDGE TABLE EXCEPT FOR BIAS: D-468 fenced a bias set's moves against its STATES edges, and every other type with a head can still move along an edge its table does not declare.** D-468's worker. BOB #34 RULED 2026-09-24 23:55Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #21; cite until folded): *the fence governs moves MADE FROM NOW ON; the history stays as it was written, and is COUNTED and SAID.* — owner RECORD.
status: running — SCHEDULER #23 06:55Z: spawned, stacked on land/worker/D-578 @ 700a432d
order: after D-547, with the promote corrections: a disallowed move lands in the record (CLAUDE.md §2); BOB #34 ruled it product order (SCHEDULER #21, 2026-09-24)
milestone: M7
interface: I3 — refusal codes on op=promote for types other than bias; the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4 (per-type schemas and state machines), with BOB #34's 23:55Z ruling, folded into §4 by this row.
depends-on: none (D-468 done; stacked on land/worker/D-578 @ 700a432d, integrated — same promote function, D-578 first; read `promotedType`, now carried before 7.1's scan).
scope: (1) MEASURE the corpus first: per type, the count of recorded moves whose edge is undeclared today, with dates, in `measurements/<id>.md`; (2) lift D-468's fence to every type with a head: promote refuses any move its type's table does not declare, for every caller by a named DEC-49 code; (3) never rewrite, reverse or repair a stored move; where a reader meets one it is stated "made by a path the current rules do not allow (before <fence date>)", neither valid nor invalid, and never larger or smaller than the count shows; (4) `STATES` keeps its valid-but-unreachable states for reading old records, unreachable by promote.
accepts-when: an undeclared move on a non-bias type is refused by name, a stored undeclared move reads with the dated sentence and is unchanged, and the measurement states the per-type counts (moves: promote asks no table but bias). NEGATIVE CONTROL: drop the fence for one type and its undeclared-move arm lands, failing by name.
added: 2026-09-24 · SCHEDULER #21 (id minted by D-468's worker).

### D-608 · integrated — **TIER 1's TEXT WALK (`pdfstructure.mjs` `extractPageText`) INTERPRETS NO `Do`, so text inside Form XObjects goes unread and no page marker says so: the page reads as fully decoded while missing text.** MEASURED (M-166): ACFR FY2023-24 (biosmoke7 INFO-2026-0103) p38 tier 1 80 glyphs, tier 2 546, 34 of 40 text-show ops inside forms; all 9 held pages where tier 2 reads 10% or more beyond an unflagged tier 1 carry Form XObject text. Found by D-515's worker (04:14Z). — owner CONTENT-PDF.
status: integrated — SCHEDULER #22 05:52Z: tip ffcc300b, GATE 386/386 GREEN (21884 assertions), tree e08ee68f; tier 1 descends Form XObjects; p38 80->546 glyphs; M-174: 9/9 fixed or flagged, 826 of 1,455 now exact, 605 flagged, 0 fell; near-merge with D-585 in extractPageText; a routing question with BOB #35
order: after D-591, with the reader corrections: a page stated as read while its text is unread claims more than the record holds (CLAUDE.md §2) (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: I6 if a page's tier or grade changes on the wire (the integrator classifies).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with CPDF-18's image walk (it already descends into forms).
depends-on: none.
scope: descend into Form XObjects in the text walk the way CPDF-18's image walk does (/Matrix, /Resources, cycle and depth bounds); at the least, a counted page marker when a painted form carries unread text-show ops. Re-read M-166's 9 pages and record the moved counts; the 1,455 pages under 10% stay undiagnosed unless the re-read moves them.
accepts-when: p38 reads its form text at tier 1 (moves: 9 pages reading as decoded while missing form text). NEGATIVE CONTROL: stop descending at `Do` and the form arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-515's worker).

### D-627 · integrated — **A FULL-PAGE IMAGE WHOSE ONLY TEXT IS A FOLIO IS NOT ROUTED TO OCR SINCE D-608: the page bears text so it rightly carries no `no_text_layer`, but its CONTENT is unread and nothing says so (INFO-2026-0301 pages 633, 634, 645-651: a coverage regression D-608's provisional accepts until this lands).** BOB #35 RULED 05:50Z: two facts, two markers. — owner CONTENT-PDF.
status: integrated — SCHEDULER #23 07:17Z: tip 056d3092 (stacked on D-608 ffcc300b), GATE 387/387 GREEN FULLREUSE (21928 assertions), tree f08a82d9; docs fold of BOB #35 06:25Z into §16 re-run 210/210 GREEN FULLREUSE, tree 9195fd44; image_content_unread marker + routing; M-178; construct 5.pdf-image-content; minted D-633
order: at the head of the backlog, beside D-606 (per-page OCR, running): a coverage regression on landed work outranks features; BOB #35: *"say WHICH absence"* (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: I6 — a new page marker `image_content_unread` and its OCR route; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with BOB #35's 05:50Z ruling (this row's worker folds it) and D-420's `container_extent.images`.
depends-on: none (stacked on land/worker/D-608 @ ffcc300b).
scope: MEASURE FIRST over the FY23-25 budget book and M-174's corpus each page's painted-image share of its area and its glyph count; set both thresholds where image-only pages separate from text pages (in-between pages read UNDETERMINED, never forced); a page over the image share and under the glyph floor carries `image_content_unread` naming both figures, and `needsTier3` routes it to OCR as it routes a no-text page. OCR output stays machine-read and never raises a grade (DEC-4).
accepts-when: those 9 pages carry the marker with their figures and route to OCR; text pages do not (moves: 9 unread pages routed nowhere). NEGATIVE CONTROL: drop the coverage arm and INFO-2026-0301's pages 633/634/645-651 read no marker and route nowhere, by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs D`; BOB #35 05:50Z).

### D-606 · integrated — **A SCANNED DOCUMENT IS OCR'D ONE PAGE PER ACQUIRE AND THE REST IS DROPPED: `index.mjs` `tier3Extend` (the only OCR_WORKER.fetch call site) calls the member once and never reads its answer's `deferred`, while `contract.mjs` `chooseChunk` takes the lowest page. MEASURED (M-165): on FW-20's walk rebuilt, 174 of 190 selected scanned pages were never transcribed; a per-page loop transcribes 183.** Found by D-460's worker (04:24Z). — owner CONTENT-PDF (the plane seam).
status: integrated — SCHEDULER #22 06:18Z: tip f04460ab (CARRIES D-460 72879f23, main merged at 51970f65), GATE 80/80 GREEN FULLREUSE over a 385/386 full run (owed-controls grammar fixed); per-page OCR capped at 24 invocations (M-175; the 32 is Cloudflare's claim, DIST to measure deployed); 5.tier3-perpage BUILT; REGISTER_FLOOR +3 unraised (CONDUCT at union); minted D-616
order: after D-608, with the reader corrections: most of a scanned civic record going unread is the silent under-read CLAUDE.md §2 ranks worst (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: I6 — more pages transcribed per acquire; the member contract is unchanged; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with the OCR member's page contract (its own note asks the caller to loop).
depends-on: none.
scope: tier3Extend re-asks the member for each page in `deferred`, one invocation per page, sequential, each merged by mergeTier3Text; a refused page keeps its marker. MEASURE FIRST the per-acquire CPU and subrequest budget for a 58-page scan on the deployed runtime's limits (miniflare wall 80 s shipped vs 858 s per page over the 21); if it exceeds them, the tail goes to a deferred task, stated.
accepts-when: the committed two-page fixture (bio-plane/test/fixtures/d460/) reads meeting_agenda through the op (moves: 174 of 190 pages untranscribed). NEGATIVE CONTROL: stop reading `deferred` and the fixture reads generic, 1/1 unread, by name (scripts/d460-perpage-ocr.mjs).
added: 2026-09-25 · SCHEDULER #22 (id minted by D-460's worker).

### D-616 · running — **PAGES PAST THE PER-REQUEST OCR BUDGET ARE NEVER READ ON A LATER REQUEST: D-606 caps each acquire at 24 member invocations (M-175), and the re-read (op=pdfstructure&ocr=1) starts from tier-1 text, so it asks for the SAME first pages again; a 58-page scan leaves 34 pages unread for good.** Found by D-606's worker (06:06Z). Affects every scan over 24 image-only pages. — owner CONTENT-PDF.
status: running — SCHEDULER #22 06:18Z spawns WORKER D-616 (depth 2), stacked on land/worker/D-606 @ f04460ab
order: at the head of the reader corrections, directly after D-606 which it completes: most of a long scan unread with no path to read it (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: I6 — a re-read advances through the unread tail; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with D-606's per-page loop and budget.
depends-on: none (stacked on D-606's branch).
scope: seed tier3Extend with the pages the stored reading already transcribed, so each re-read (or a deferred task) asks only for the untranscribed tail and advances by up to the budget; the reading states how many pages remain; transcribed pages are never re-asked.
accepts-when: a 30-image-page fixture reads 24 pages on the first acquire and the remaining 6 on one re-read, with no page asked twice (moves: pages past the budget unread for good). NEGATIVE CONTROL: start the re-read from tier-1 text again and the second pass re-asks page 1, failing by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-606's worker).

### D-607 · integrated — **`tier3Note` SAYS "the page that already had text kept it" ON A WHOLLY SCANNED DOCUMENT WHERE NO PAGE HAD TEXT (live: FINAL-2-6-PC-Agenda, 7 of 7 no_text_layer), so the record states a text layer that never existed.** Found by D-460's worker (04:24Z). — owner CONTENT-PDF.
status: integrated — SCHEDULER #22 05:28Z: tip 3206221a, GATE 385/385 GREEN FULLREUSE (21873 assertions), tree b093f1a2; union with D-606 keeps layerPages at tier3Note's call; re-run nc-rec102 after; minted D-614
order: directly after D-606, the same seam: a small overclaim in the tier-3 note (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: none (a note's wording).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16.
depends-on: none.
scope: emit that clause only when layerPages is non-empty.
accepts-when: a wholly scanned document's note carries no kept-text clause, and a mixed one still does (moves: a stated text layer that never existed). NEGATIVE CONTROL: emit the clause unconditionally and the wholly-scanned arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-460's worker).

### D-568 · integrated — **A DRAFT THAT NAMES NO CASE AND DOES NOT SET `newCase` STILL ANSWERS `edition: 1` on op=casedraft, casedrafts, reviewcopy and reviewgrant, the minted-case edition for a case publication will DERIVE (draft DD would be C1's next edition).** Found by D-538's worker (01:04Z). — owner RECORD, then UI.
status: integrated — SCHEDULER #22 05:38Z: tip d5da99bb, GATE 385/385 GREEN FULLREUSE (21872 assertions), tree 903310df; edition null for a derived draft in five answers (statementack too); I3; minted D-618, D-619, D-620
order: after D-573, with the review-copy corrections: an edition stated for a case the record has not chosen claims more than it holds (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M10
interface: I3 — `edition` reads null on the wire for a derived draft; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4 (the review copy), with BOB #32's 2026-09-23 23:08Z newCase ruling.
depends-on: D-538.
scope: keep the internal (case_id NULL, edition 1) key that grants and statement acknowledgements bind to, and answer `edition: null` (undetermined) on the wire for a derived draft in all four answers.
accepts-when: DD answers `edition: null` in all four while its grant and acknowledgements still bind (moves: edition 1 stated for a derived case). NEGATIVE CONTROL: answer the internal edition again and the DD edition arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-538's worker).

### UI-108 · integrated — **THE PROGRESSION PAGE SHOWS A DISMISSED FINDING AS AN OPEN QUESTION: `progPaintInstance()` renders `inst.findings` verbatim and cannot say a member decided it.** The surface half of D-552. — owner UI.
status: integrated — SCHEDULER #22 05:45Z: tip 80594009, GATE 233/233 GREEN FULLREUSE (15352 assertions), tree 75aefa90; decisions beside findings on the progression page; refused op=instance read now translated; r3Fed 82, census 729; CIVICOS_UI_STATE v120 provisional; minted D-617
order: directly after D-552, which it consumes (SCHEDULER #20, 2026-09-24)
milestone: M4
interface: I3 consumer (D-552's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §12 "age rather than vanish" (D-79), with D-552's published view.
depends-on: D-552.
scope: on the progression page, render each finding's disposition as the plane states it (who, when, the reason, and whether the decision still applies to the current definition_version), in the plane's words; the finding stays listed.
accepts-when: against a real-plane suite a dismissed finding renders its decision beside it (the measured failure it moves: an answered question shown as open). NEGATIVE CONTROL: render `inst.findings` without the view and the decided-finding arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs UI`).

### D-617 · integrated — **THE DOCUMENT PAGE STILL SHOWS A DISMISSED FINDING AS OPEN: `docInstanceHtml` (app.html, the UI-9 block) renders op=captureprogressions' findings, which carry D-552's disposition, without it.** Found by UI-108's worker (05:41Z), the second of the two sites that render progression findings. — owner UI.
status: integrated — SCHEDULER #22 06:36Z: tip 7d466c6b (CARRIES UI-108 80594009), GATE 233/233 GREEN FULLREUSE (15352 assertions), tree c7d85b96; the document page shows each finding's decision; CIVICOS_UI_STATE v121 provisional
order: directly after UI-108, its twin: an answered question shown as open on the other page (SCHEDULER #22, 2026-09-25)
milestone: M4
interface: none (I3 consumer of D-552).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §12 "age rather than vanish" (D-79), with D-552's published view.
depends-on: none (stacked on UI-108's branch, which builds the renderer).
scope: render progFindingDecisionHtml(f) (or a sibling) inside each docprog-finding; a real-plane suite.
accepts-when: against the real plane a dismissed finding on the document page renders its decision beside it (moves: an answered question shown as open). NEGATIVE CONTROL: render the findings without the disposition and the decided-finding arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by UI-108's worker).

### D-605 · integrated — **REGISTERING A SIGNING KEY FROM THE SETUP PAGE IS ALWAYS REFUSED BAD_KEY: `bio-plane/src/setup.mjs`'s key form posts the WHOLE `ssh-ed25519 AAAA… label` line as keyB64, and `Store#signerAdd`'s `/^AAAA[A-Za-z0-9+/=]+$/` can never match it.** Found by D-134's worker (05:15Z), by reading describeKey and the regex; D-134's suite shows a whole line refused. — owner DIST (the plane's setup page).
status: integrated — SCHEDULER #22 06:06Z: tip 8dcf0f2b (CARRIES D-596 37430658; land after it), GATE 367/367 GREEN (21084 assertions); setup page posts the key's second token + label; no wire change; the released bundle and newgroup's embedded page carry the old form until DIST's next release
order: after D-586, with the corrections to acts a group needs: a setup act that can never succeed blocks a new group's first signer (SCHEDULER #22, 2026-09-25)
milestone: M8
interface: none on the wire (the page's request is corrected; signeradd is unchanged).
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 (signeradd), with the setup page as D-596 leaves it.
depends-on: none.
scope: the setup page sends the line's SECOND token as keyB64 and the rest (the label) as comment, as D-134's surface does; one arm that submits a real `ssh-ed25519` line through the served page and reaches signeradd.
accepts-when: a whole public-key line pasted into the setup page registers the key (moves: every setup-page registration refused BAD_KEY). NEGATIVE CONTROL: post the whole line again and the arm reads BAD_KEY, failing by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-134's worker).

### UI-106 · integrated — **THE REVIEW-COPY SURFACE LOSES `newCase` AND WILL SHOW THE CORRECTED IDENTITY SENTENCE UNREAD: `app.html`'s `rvcFormFromCopy` does not read `case.newCase` (DELEGATION RECORD (WORKER REC-199) -> UI on coord CLAIMS.md), and UI-92's draft list draws `#caseIdentitySentence`, which D-538 changes.** — owner UI.
status: integrated — SCHEDULER #22 06:36Z: tip 5b994a67 (CARRIES D-568 d5da99bb), GATE 318/318 GREEN FULLREUSE (18697 assertions), tree 55357791; newCase round-trips, D-619 carried; REC-199 DELEGATION discharged; minted D-626
order: after D-539, the surface half of the review-copy corrections (SCHEDULER #19, 2026-09-24; via CONDUCT #20 21:43Z)
milestone: M10
interface: I3 consumer (REC-199's IC-285 and D-538's IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's newCase ruling.
depends-on: D-538, UI-92.
scope: `rvcFormFromCopy` reads `case.newCase` so a read-then-write keeps it; the draft list re-reads the plane's identity sentence as stated; discharge REC-199's DELEGATION block.
accepts-when: against a real-plane suite a round trip through the form keeps `newCase`, and draft DD shows the derivation sentence (the measured failure it moves: `newCase` lost at the surface). NEGATIVE CONTROL: drop the read and the round-trip arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs UI`).

### D-619 · integrated — **`rvcGrantsHtml` SAYS A DEAD GRANT BOUND TO NO CASE "was given for a new case", untrue for a DERIVED draft's grant (D-538's class, on the surface).** Found by D-568's worker (05:36Z). RIDES UI-106's landing (the same review-copy surface). — owner UI.
status: integrated — SCHEDULER #22 06:36Z: carried by UI-106 @ 5b994a67; closes with it
order: directly after UI-106, which carries it (SCHEDULER #22, 2026-09-25)
milestone: M10
interface: none.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with D-538's identity sentence.
depends-on: none (it rides UI-106's landing, the same surface).
scope: word the no-case branch "a draft that named no case", never "a new case".
accepts-when: a dead derived-draft grant never reads "a new case" (moves: a surface sentence claiming a new case). NEGATIVE CONTROL: restore "a new case" and the derived-grant arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-568's worker).

### UI-110 · integrated — **NO MEMBER CAN SELECT A PROJECT-SCOPED FINDING INTO A QUEUE SET: `civicos-ui/app.html`'s `queueSetOpFor` (~14393 on main 9f8b69e6; UI-94 renames it `queueSetOpsFor`) returns null for scope=project, though REC-205 makes the plane carry each item's project.** The DELEGATION RECORD (REC-205) → UI on coord `CLAIMS.md` (06b86e6d). — owner UI.
status: integrated — SCHEDULER #22 06:23Z: tip ba126d29, GATE 112/112 GREEN FULLREUSE (8318 assertions), tree 5a7aacb9; project-scoped findings join queue sets, ask-never-default for several homes; REC-205's DELEGATION discharged; peritem.test ~313 comment stale (RECORD); minted D-623, D-624
order: after UI-106, the surface half of REC-205, in product order behind its plane half (SCHEDULER #21, 2026-09-24; via CONDUCT #20 23:45Z)
milestone: M8
interface: none (reads REC-205's I3 set act).
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class", with D-266's NO_PROJECT_SCOPE.
depends-on: REC-205, UI-94.
scope: the set act sends each project-scoped item's own project; where an item has several homes the surface asks the member and NEVER defaults one (D-266); the plane's NO_PROJECT_SCOPE reaches the member in its DEC-49 words.
accepts-when: a project-scoped finding joins a selection and the set act carries its project; an item with two homes is not sent until the member names one (the measured failure it moves: null for scope=project). NEGATIVE CONTROL: return null again and the selection arm fails by name.
added: 2026-09-24 · SCHEDULER #21 (`node tools/mintid.mjs UI`).

### D-623 · integrated — **`op=proposedispose` MINTS NO_PROJECT_SCOPE AT TWO SITES (store.mjs proposeDispose: the scoped-without-project refusal and the IC-60 key bridge) WITH NO DEC-49 CODE OR TRANSLATION, so a member meets the plane's raw detail and UI-110's clause "NO_PROJECT_SCOPE reaches the member in its DEC-49 words" cannot be met.** Found by UI-110's worker (06:19Z). — owner RECORD.
status: integrated — SCHEDULER #23 07:26Z: tip 1c701e33 on 5e8a65a8, GATE 79/79 GREEN FULLREUSE (6478 assertions, 378 units reused); actNoProjectScope + region is-act-no-project-scope, C-33.48, I3 additive; CATALOG 1.30.0->1.31.0; d470 census 502->503; D-624 may render the new translation
order: at the head, with the DEC-49 translation rows: a member-facing refusal with no canned words (SCHEDULER #22, 2026-09-25)
milestone: M8
interface: I3 additive — a catalogued code and translation; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, in D-484's settled shape (one governed helper, one region, one condition).
depends-on: none.
scope: a row in a DEC-49 family (e.g. ACT_SHAPE_CHECKS) with a canned translation, built literally at both sites inside DEC-49 regions; census and reach floors move to their printed figures.
accepts-when: a project-scoped dispose without a project answers NO_PROJECT_SCOPE with its translation at both sites, driven through the op (moves: 2 untranslated member-facing sites). NEGATIVE CONTROL: strip the translation and each site's arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by UI-110's worker).

### D-576 · integrated — **THE `op=connect` RECEIPT CLAIMS THE WHOLE SET WHEN THE DERIVATION WAS CUT: `app.html` `connectGo` reads "The record derived N connections among the documents that concern this subject" and ignores the answer's `truncated`, which store.mjs documents as "whether the DERIVATION was cut".** Found by UI-95's worker (01:10Z); UI-95 states the cut on the subject panel beneath it. — owner UI.
status: integrated — SCHEDULER #22 06:00Z: tip ae998dd8, GATE 102/102 GREEN FULLREUSE (7565 assertions), tree 7dfa9679; the connect receipt states a cut derivation; CIVICOS_UI_STATE v120 provisional
order: after UI-110, with the surface corrections: a receipt reading a cut set as whole claims more than the record holds (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: none (reads op=connect's existing `truncated` and `documents`).
design: `docs/development/CONTENT-SEARCH-DESIGN.md` (D-241's derivation statement, as UI-95 renders it).
depends-on: UI-95.
scope: when `r.truncated === true`, the receipt adds that the derivation was cut at its bound after `r.documents` of the subject's documents, so the connections are part of the set.
accepts-when: a truncated connect answer's receipt states the cut; an untruncated one does not (moves: a cut receipt reading as whole). NEGATIVE CONTROL: ignore `truncated` again and the cut-receipt arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by UI-95's worker).

### D-575 · integrated — **A CONNECTION'S PAIR SAYS "which nobody has chosen" WHILE A MEMBER'S CHOICE STANDS, AND NEVER STATES A LAPSE: `Store#pairSelection`'s `says` ends that way on every row on `op=connections&id=`/`&sha256=`, including one carrying a current `on_point`; that arm's `on_point` never states a lapse (only the `content=` arm does).** Found by UI-91's worker (01:25Z). — owner RECORD.
status: integrated — SCHEDULER #22 06:44Z: tip 617fd5ef, GATE 73/73 GREEN FULLREUSE over b2d73275's 386/386, tree 36299aeb; the pair sentence names choices and lapses; I3 additive; civicos-ui onpoint-choice.test corrected (UI-112 may meet it); rides batch30
order: after D-576, with the connection corrections: the record contradicting itself about a member's act (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: I3 additive — `lapsed`/`why` on `on_point[side]`, and the selection sentence's content; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair), with REC-122's on-point choice (IC-232, C-74).
depends-on: UI-91.
scope: in `connectionsFor`'s `withChoice` (store.mjs, REC-122 block) check each current choice's ref against resolutions as `connectionGradeForContent` does and carry lapsed/why on `on_point[side]`; pass the choice state into `#pairSelection` so the sentence does not say "nobody has chosen" where a choice exists.
accepts-when: a chosen pair's sentence names the choice, and a choice whose resolution is gone reads lapsed with its why, on both arms (moves: a self-contradicting sentence). NEGATIVE CONTROL: drop the choice state from `#pairSelection` and the chosen-pair arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by UI-91's worker).

### UI-112 · integrated — **UI-91's ON-POINT CHOICE WILL BE REFUSED FOR A MENTION READ ON SEVERAL PAGES ONCE D-454 LANDS: D-454 makes `op=connectionchoose` take `occurrence=` and refuse C-74.4 CONNECTION_CHOICE_OCCURRENCE_UNNAMED when a string read at several places is named alone, and UI-91's `docChooseOnPoint` (both integrated, neither on main) sends no occurrence.** Found at SCHEDULER #21's reading of both reports (01:38Z). — owner UI.
status: integrated — SCHEDULER #22 06:36Z: tip bfd57de2, GATE 233/233 GREEN FULLREUSE (15352 assertions), tree 7d91b35f; the chooser offers each occurrence; r3Fed 82->83; rides batch30; minted D-625 (unplaced, see SCHEDULER-NEXT)
order: after D-575, with the connection surface: a chooser that the plane refuses for the common case offers an act that fails (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: none (reads D-454's I3: `occurrence=`, `occurrences` on the act and on connections&content= mentions).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair), with D-454's occurrence key and REC-122's choice (C-74).
depends-on: UI-91, D-454.
scope: the chooser offers each OCCURRENCE (page and position, from the plane's `occurrences`), sends `occurrence=` on the act, renders C-74.4 in its DEC-49 words, and shows a pre-D-454 choice the plane states AMBIGUOUS as it says.
accepts-when: a subject string read on three pages offers three choices and each is accepted (moves: C-74.4 on every multi-page mention). NEGATIVE CONTROL: omit `occurrence=` and the three-page arm reads C-74.4, failing by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs UI`).

### UI-104 · integrated — **THE ACTION PAGE OFFERS NO RISK-TIER REVISION AND SHOWS NO TIER HISTORY.** BOB #33's risk-tier ruling (21:18Z; recorded in the inbox entry of 21:55Z), the surface half of REC-214. — owner UI.
status: integrated — SCHEDULER #22 06:33Z: tip b9a13242, GATE 111/111 GREEN FULLREUSE (8245 assertions), tree 2ab2efc0; tier revision with required reason + tier history on the action page; figures unchanged
order: directly after REC-214, which it consumes (BOB #33: plane, then UI) (SCHEDULER #19, 2026-09-24)
milestone: M7
interface: I3 consumer (REC-214's IC).
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`risk_tier`), with BOB #33's risk-tier ruling (sent by message 21:18Z, cited elsewhere as "21:21Z"; RECORDED in the BOB INBOX entry of 21:55Z, drained to `BOB-INBOX-drained.md` by SCHEDULER #20) (folded by REC-214).
depends-on: REC-214.
scope: on the action page, beside UI-90's governing-laws list, the revise act (tier plus a required reason, words from the plane's vocabulary) and the tier history as the plane states it.
accepts-when: against a real-plane suite a member revises a tier with a reason and the history renders "revised from … to …: <reason>"; the act cannot submit without a reason (the measured failure it moves: no surface for the act). NEGATIVE CONTROL: submit without a reason and the required-reason arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs UI`).

### REC-215 · integrated — **NO MACHINE PROPOSAL OF A RISK TIER EXISTS, LABELLED AND APART FROM THE MEMBER'S VALUE.** BOB #33's risk-tier ruling (21:18Z; recorded in the inbox entry of 21:55Z), item 3: `actionriskpropose` (not yet an op), REC-195's shape. — owner RECORD.
status: integrated — SCHEDULER #22 06:50Z: tip 788649dc, GATE 386/386 GREEN FULLREUSE (21913 assertions), tree d359ded7; the risk proposal act (NON_ACTS, never writes the tier), C-90.6; CATALOG 1.30.0->1.31.0 (503); construct 8.risk-tier-proposal BUILT; rides batch30
order: after UI-104 (BOB #33: after (1), the proposal half last) (SCHEDULER #19, 2026-09-24)
milestone: M7
interface: I3 additive — a proposal read labelled machine work; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (only a member's authored act sets a tier), with REC-195's labelled-proposal shape and BOB #33's risk-tier ruling (sent by message 21:18Z, cited elsewhere as "21:21Z"; RECORDED in the BOB INBOX entry of 21:55Z, drained to `BOB-INBOX-drained.md` by SCHEDULER #20).
depends-on: REC-214.
scope: a proposal of a tier with its basis, stored apart from the member's value and labelled machine work; it never sets the tier.
accepts-when: a proposal reads labelled machine work and the tier is unchanged until a member acts (the measured failure it moves: no proposal read). NEGATIVE CONTROL: let the proposal write the tier and the "the tier is the member's" arm fails by name.
context: REC-216's audit (F1-F4, SCHEDULER #19's worker) and BOB #33's 21:55Z ruling: every `*propose` op is NON_ACTS in `bio-plane/src/affordances.mjs` (REC-195's reasoning) and a member states the value with their own act; so this proposal is a machine READ, never a member act in ACTS, and its surface SHOWS it beside the member's tier with no adopt control, as UI-102 (a2d974aa) does for the governing-laws proposal.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs REC`).

### M0-197 · running — **NO INSTRUMENT SEES A NEGATIVE-CONTROL ARM WHOSE PATCH ANCHOR HAS DRIFTED: four in one hour (D-535's statepaths arm b, D-600's nc-cap12 dropslides, D-601's default-discoverable, D-235's suggest.control arms) had not armed for days, each found only by a worker running its driver.** BOB #35 RULED 04:25Z: a standalone M0 instrument, not M0-188's family. — owner M0.
status: running — SCHEDULER #22 05:53Z spawns WORKER M0-197 (depth 2)
order: at the head of the process rows, before M0-142: it cuts gate time, since a drifted control today costs a worker round to find (CLAUDE.md §2) (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the negative control: break the subject, watch the suite fail at a NAMED assertion), with BOB #35's 04:25Z ruling.
depends-on: none.
scope: a pure reader that loads every `*.control.mjs` driver's arm table, dry-applies each arm's anchor by COUNTING matches (never editing), and fails naming driver and arm when an anchor matches 0 times, or more than once where the arm edits one site; it runs in EVERY gate profile; a driver whose arms cannot be loaded as data is named UNREADABLE, never skipped. D-600's arm is its first expected failure.
accepts-when: the reader runs in every profile and names each drifted or UNREADABLE driver (moves: drifts found a worker round late). NEGATIVE CONTROL: reword one anchored line in a fixture copy and the arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs M0`; BOB #35 04:25Z).

### M0-196 · integrated — **`bio-plane/scripts/pensweep.mjs`'s walk cannot resolve `fileURLToPath(new URL("..", import.meta.url))` as a tree read, so every copy-source control driver that reads its tree that way reads UNCLASSIFIED; batch28 raised the ceiling 15 -> 18 by name for D-526's, D-547's and D-548's drivers.** Found by CONDUCT #21 at batch28's integration (04:06Z). — owner M0.
status: integrated — SCHEDULER #22 06:25Z: tip 59433afe, GATE 75/75 GREEN TARGETED (5840 assertions); premise wrong (the URL form already resolved): three other shapes now read; UNCLASSIFIED ceiling 18->13; at union DROP D-563's 18->19 raise (its driver resolves), ceiling stays 13
order: after M0-142, with the gate-instrument rows behind the product rows: a ceiling raised by name is loud, not false, and every new driver of that shape raises it again (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a guard's ceiling moves only to a printed figure; the pen rule for control drivers).
depends-on: none.
scope: resolve that expression (and its `new URL("../..", …)` siblings) as a TREE root read in pensweep.mjs; then lower the UNCLASSIFIED ceiling to the printed figure (18 -> 15 or less).
accepts-when: D-526's, D-547's and D-548's drivers read classified and the ceiling falls by name (moves: 3 drivers UNCLASSIFIED). NEGATIVE CONTROL: drop the new resolution and those three read UNCLASSIFIED over the lowered ceiling, failing by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs M0`; CONDUCT #21's batch28 finding).

### D-620 · integrated — **363 OF 376 bio-plane SUITES COMPARE WITH `JSON.stringify` EQUALITY, WHICH READS AN ABSENT VALUE IN AN ARRAY AS `null`, so any arm asserting a STATED null cannot tell it from a dropped key (measured in reviewcopy.control arm v, which stayed green until hardened).** Found by D-568's worker (05:36Z). — owner M0.
status: integrated — SCHEDULER #23 07:21Z: tip 72d488e0 (one commit over main 5e8a65a8), GATE 310/310 GREEN TARGETED (19125 assertions), tree 4dea9721; test-only: statedJSON comparator in 268 null-asserting suites + stated-null guard; hygiene reach floor 45->47; no defect minted
order: after M0-196, with the gate-instrument rows: an arm that cannot fail on a dropped key is a control that refutes nothing (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an equality that costs nothing to produce is not evidence).
depends-on: none.
scope: a shared comparator whose serialiser maps undefined to a distinct sentinel; adopt it in every suite that asserts a null (grep assertions naming null), not all 363.
accepts-when: each null-asserting suite uses the comparator and fails on a dropped key (moves: stated-null arms blind to a dropped key). NEGATIVE CONTROL: drop a stated-null key in one fixture and its arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-568's worker).

### D-542 · integrated — **THE DEC-49 GUARD SCORES A CODE "OUT OF REACH" WHEN ITS SURFACE RENDERS THE PLANE'S OWN WORDS: `check-refusal-codes.mjs` puts a code in reach only by R1 (a catalogue row), R2 (a code LITERAL in `app.html`) or R3 (a harness mock), so UI-68's review-copy surface, which renders `detail` and keys on no literal, left TEN of D-448's eleven codes scored out of reach for a day while a member could meet them.** Found by D-448's worker (branch `land/worker/D-448` 5eadd905: the Publication front matter and `13.review-copy` both carry "D-542 carries that fix (reach-by-op) and is NOT BUILT"). — owner M0 (the guard).
status: integrated — SCHEDULER #23 07:33Z (relayed by CONDUCT #22): tip fac514e0 on 5e8a65a8, GATE 101/101 GREEN (8063 assertions); CARRIES D-562; DEC-49 guard R5/R6: reach 488->595, reachGap ceiling 39->146 (D-641 owes it back); minted D-641, D-664; rides batch30
order: after D-550, with the DEC-49 instrument rows behind the product rows: it makes a false gate result (a reachable code read as unreachable) visible, which is product quality, but nothing regresses today since D-448 catalogues all eleven (Bob's 17:41Z rule) (SCHEDULER #21, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a guard's verdict is a statement about its walk, never about the member), with DEC-49's rule that every refusal a member can meet carries a canned translation.
depends-on: D-448.
scope: teach the walk REACH-BY-OP: a code minted on an op that a surface in `civicos-ui/app.html` calls (by the op's name through its request helpers) is IN REACH whether or not the surface names the code literally; an op no surface calls stays out of reach.
accepts-when: on D-448's parent (origin/main 9f8b69e6's review-copy mints) the walk sorts the ten review-copy codes IN REACH rather than F6 (the measured failure it moves: ten of eleven scored out of reach while UI-68's surface existed). NEGATIVE CONTROL: remove the surface's call to `reviewcopy`, and those codes fall back to out of reach by name.
added: 2026-09-24 · SCHEDULER #21 (id minted by D-448's worker).

### D-574 · integrated — **D-550's ONE-MINT-SITE GUARD (arm G) AND ITS SWEEP WALK ONLY `store.mjs` AND `index.mjs`, so multi-site codes in other plane files go unwatched: AI_RUN_BOUND_UNKNOWN (4 sites, airun.mjs), TEXT_ATTEST_EXTENT (4) and TEXT_ANCHOR_MISSING (4, textchain.mjs), CAL_SIGNAL_SHAPE (3, calibration.mjs), AI_RUN_SKILL_VERSION_UNNAMED (2, skillpack.mjs) among them; the whole of `bio-plane/src` reads 93 candidates, not 62.** Found by D-550's worker (00:42Z). — owner M0 (the guard).
status: integrated — SCHEDULER #23 07:55Z: tip 06494735 on 5e8a65a8, GATE 104/104 GREEN FULLREUSE (8314 assertions), tree 4c524fbe; arm G reads every bio-plane/src/*.mjs but three stated; CEILING.multiSiteCodes 59->65; minted D-668
order: after D-542, with the DEC-49 instrument rows behind the product rows: it widens a guard, and no gate result is false today (SCHEDULER #21, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument states what it reads), with DEC-49's one-code-one-condition rule as D-484 settled it.
depends-on: D-550.
scope: widen `MULTI_SITE_FILES` to every `bio-plane/src` file, excluding by stated reason each file that PUBLISHES codes as data rather than minting them (affordances.mjs first); move the ceiling and candidate set to the printed figures.
accepts-when: arm G reads every src mint site and names the codes above (moves: two files walked of the plane's many). NEGATIVE CONTROL: plant a second site of a single-site code in textchain.mjs and arm G fails naming it.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-550's worker).

### D-560 · integrated — **`tools/release-assemble.mjs` (~140) STILL NAMES THE ONE-BUNDLE COMMAND: its NO_ARTIFACT detail says "Run `npm run build` in <dir>/", and the assembler dies on the FIRST missing artifact, so a releaser fixes one bundle at a time.** M0-188's sibling site (found by M0-188's worker, via CONDUCT #20 23:45Z). — owner DIST (the path), M0.
status: integrated — SCHEDULER #22 06:40Z: tip fc35dbf0, GATE 75/75 GREEN TARGETED (5844 assertions), tree bcaf7fe5; the assembler names every missing artifact once with node tools/bundles.mjs; no release cut
order: after D-548, with the process rows behind the product rows: it costs a release round, not a gate round, and no release is cut until the plan's current scope is done (BOB #34 22:30Z) (SCHEDULER #21, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a remedy an instrument prints must be the whole remedy), with M0-178's `node tools/bundles.mjs`.
depends-on: M0-188.
scope: the NO_ARTIFACT sentence names `node tools/bundles.mjs`, and the assembler reports every missing artifact before it dies; extend fleetbundles' TOTAL arm to cover it, or give release-assemble its own arm.
accepts-when: with two artifacts missing, one run names both and the one command (the measured failure it moves: one-at-a-time, the wrong command). NEGATIVE CONTROL: restore the old sentence and the arm fails by name.
added: 2026-09-24 · SCHEDULER #21 (id minted by M0-188's worker).

### D-566 · integrated — **THREE MORE HAND-KEPT TOOL COPY LISTS SURVIVE M0-170: `bio-plane/test/gates.test.mjs` ~924 (`["coord.mjs", "statepaths.mjs"]`) and `bio-plane/test/status.test.mjs` ~343 and ~565 (`["walkfloor.mjs", "provenance.mjs", "walkfigure.mjs"]`, status.mjs's closure), so a new import in the subject breaks its fixture with a false red.** Found by M0-170's worker (F2, 00:14Z). — owner M0.
status: integrated — SCHEDULER #23 07:24Z (relayed by CONDUCT #22): tip 25d51c4f on 5e8a65a8, GATE 75/75 GREEN TARGETED (5834 assertions); test-only: seven hand module lists derived via moduleClosure; rides batch30
order: after D-560 (D-569 is running), with the process rows: a false red costs a gate round only when the subject gains an import (M0-170's precedent, Bob's 17:41Z rule) (SCHEDULER #21, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a fixture derives what it carries).
depends-on: M0-170.
scope: replace each list with `moduleClosure({ repo, roots: [<tool>], dynamic: false })` as M0-170 did; state the sweep's reach (literal-name copies only).
accepts-when: an import added to coord.mjs or status.mjs leaves both suites green (moves: three hand lists). NEGATIVE CONTROL: restore one list, add an import, and that suite fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by M0-170's worker).

### D-564 · integrated — **SEVEN MORE SUITES END AT THEIR FIRST FIXTURE FAILURE ("FIXTURE ABORTED": dispose and exit), so one broken fixture hides every later section: casesearched, casesign, d150-statement-acknowledgement, d507-statement-ack-translation, rec212-statement-writer, reviewcopy, reviewcopy-inband.** Found by D-548's worker (00:33Z); 3 of 351 suites carry a `block()` recorder. — owner RECORD (the suites).
status: integrated — SCHEDULER #23 07:30Z: tip ae807e25 on 5e8a65a8, GATE 77/77 GREEN TARGETED (5899 assertions; the seven suites 85/85 on 0cdf6408); block() recorder in seven suites; coverage arms 2357->2368; pen-sweep UNCLASSIFIED ceiling 18->19 (M0-196 drops it to 13 at union); minted D-667
order: after D-566, with the process rows behind the product rows: it hides later failures for a round but no gate result is false (D-548's precedent) (SCHEDULER #21, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a suite measures every arm it declares).
depends-on: D-548.
scope: adopt `block()` and the per-section tally, -1 for a section that died, a section never reported a FAIL by name, as D-548 did; state the matcher's reach (the literal "FIXTURE ABORTED" only).
accepts-when: in each suite, one section's fixture broken leaves every other section reporting its tally (moves: 7 suites ending at the first failure). NEGATIVE CONTROL: break one fixture per suite and the others still report; disarm the recorder and the foot is missing, by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-548's worker).

### DIST-15 · queued — **THE INSTALLER'S `limits.subrequests` IS PINNED TO `wrangler.jsonc`, NOT CARRIED FROM THE SIGNED RELEASE, and a release without it is not refused: the signed manifest has no plane-limits field.** DIST-7's residue (DIST #6, 23:15Z): adding the field to the fleet statement (`bio-release-fleet/2`) would break every older installer's fleetSig reconstruction and degrade its updates to a plane-only install. — owner DIST.
status: queued — SCHEDULER #22 06:34Z: DIST's own row (the installer is out of bounds for workers); left for DIST #7
order: directly after DIST-7's place, in product order; the release-format choice is DIST's own (SCHEDULER #20, 2026-09-24)
milestone: M7
interface: I5 — a release-format change; the integrator classifies.
design: `docs/architecture/BIO_Distribution_v0_1.md` (the installer installs the signed release as released), with IC-82's carry of `compat` as the precedent.
depends-on: DIST-7.
scope: DIST decides the format first and records it in Distribution: a SEPARATELY signed plane-limits field, or a `/3` statement older installers are told to skip; then the installer carries `limits.subrequests` from the signed release and refuses a release without it by name.
accepts-when: `newgroup/test/` asserts both uploads send the RELEASE's `limits.subrequests`, a release without it is refused by name, and an older installer still verifies its fleet signature (the measured failure it moves: the value read from `wrangler.jsonc`, not the signed release). NEGATIVE CONTROL: strip the field from a signed release and the refusal arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs DIST`).

### D-626 · integrated — **TWO PLANE SENTENCES STILL SAY A DRAFT THAT NAMES NO CASE IS A NEW CASE (D-538's class): C-87.6 REVIEW_NO_SUCH_CASE's translation ends "Leave the name off and the draft is a new case." (false since D-538: leaving it off lets publication DERIVE the case), and PUBLISH_DRAFT_NOT_THIS_CASE's detail calls `#caseIdentitySentence(di.caseId, di.edition)` without the draft's newCase, so a new-case draft is described with the derivation sentence.** Found by UI-106's worker (06:24Z). — owner RECORD.
status: integrated — SCHEDULER #23 07:45Z: tip 2a5d4ed8 on 5e8a65a8, GATE 61/61 GREEN FULLREUSE (5816 assertions; 395 units reused from c201e853's 385/385), tree 0de3bdb7; C-87.6 translation, PUBLISH_DRAFT_NOT_THIS_CASE detail/remedy take newCase, acknowledgeStatement fixed; regionLines +3; C-87.6 under changed: at union; derivation-draft condition to BOB (unminted)
order: after D-618, with the review-copy corrections: D-538's class in two more sentences (SCHEDULER #22, 2026-09-25)
milestone: M10
interface: I3 — one translation's wording and one detail; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with D-538's identity sentence and BOB #32's newCase ruling.
depends-on: none.
scope: reword C-87.6's translation to say leaving the name off lets publication derive the case and asking for a new case is the separate choice; pass the draft's newCase into #caseIdentitySentence at is-publish-draft-this-case; census row per M0-195 (a translation change is behaviour).
accepts-when: neither sentence calls a derived draft new, and a new-case draft's refusal reads the new-case sentence (moves: 2 sentences claiming a new case). NEGATIVE CONTROL: drop newCase from the call and the new-case arm reads the derivation sentence, failing by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by UI-106's worker).

### D-346 · integrated — **THE THREE OPENDOCUMENT ENTRIES EMIT NO `core-properties` AND NO `intra` LINK: `odf.mjs` never reads `meta.xml` or the manifest and says so with `outside_content_xml_not_read` markers, while Content Framework §16 says the formats "preserve the same evidence".** — owner COFF.
status: integrated — SCHEDULER #23 07:12Z: tip 96eeb2d5 (stacked on D-612 f2dcbc6c on D-473 737913b0), GATE 367/367 GREEN FULLREUSE (21129 assertions), tree 4ee5b0c9; ODF meta.xml core-properties + manifest intra links; construct 5.odf-envelope; I2 IC the integrator's; design gap (no ODF column in OFFICE-FORMATS part-map table) to BOB
order: after D-320 (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: I2 — the ODF part-map gains two item kinds; the integrator mints and classifies the IC.
design: `docs/development/OFFICE-FORMATS.md` §"What each part-map offers, and where it maps onto I2".
depends-on: none.
scope: read `meta.xml` into `core-properties`; walk the manifest for sha256 `intra` links; remove both markers. Extend `bio-plane/test/formats-odf.test.mjs`.
accepts-when: a planted creator appears as a `core-properties` item; a package without `meta.xml` still states the absence. NEGATIVE CONTROL: skip the `meta.xml` read, and the planted-creator arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### REC-204 · integrated — **AN OFFICE DOCUMENT'S ENVELOPE IS EXTRACTED AND NEVER CONTENT: tracked-change authors, comments, core properties and speaker notes are emitted by the format parsers and never projected, indexed or searchable (`textUnitsFor`: *"SPEAKER NOTES ARE NOT INDEXED"*).** Under DEC-5, surface it all. — owner RECORD.
status: integrated — SCHEDULER #23 07:36Z: tip 79be56b0 on 5e8a65a8, GATE 385/385 GREEN FULL (21886 assertions), tree e018ac73; ninth extent kind envelope (tracked-change/comment/core-property/speaker-note) indexed by op=acquire; construct 5.envelope; I2/I5 IC the integrator's; leg citing an envelope item NOT built
order: with the M2 extraction rows, after D-346 (SCHEDULER #17, 2026-09-23; D-124's first row, placed under a new id because D-124 names two rows)
milestone: M2
interface: I2/I5 — a NINTH extent kind, `envelope`, with an item-kind field; the integrator mints the IC for the extent census.
design: `docs/development/OFFICE-FORMATS.md` "THE ENVELOPE AS CONTENT" (on `land/bob/rulings-0923b` @ fd93bf1d, riding the next train): the extent carries the capture's grade, `cited_as` distinguishes it, and it is indexed LABELLED as envelope.
depends-on: none.
scope: the `envelope` extent and its projection; index each item labelled as its kind. Extend `bio-plane/test/search.test.mjs`.
accepts-when: a passage search finds a tracked-change author and speaker-note text, each labelled as envelope. NEGATIVE CONTROL: drop the envelope arm, and the tracked-change-author search returns 0 by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-375 · running — **`OBSERVATION-LOG-DESIGN.md` §4.2's FOURTH OUTCOME HAS NO PRODUCER: the persisted reading carries no character count, so `contentObservationsFor` cannot write LOOKED_ABSENT for a scan read to nothing, and it reads PRESENT.** `counts.chars` exists at acquire and is dropped. — owner CAPTURE, then RECORD.
status: running — SCHEDULER #22 06:46Z spawns WORKER D-375 (depth 2)
order: after D-346: a read that claims more than it holds, CLAUDE.md §2's worst class (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M3
interface: I5 additive — the reading's count; the integrator mints and classifies the IC.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §4.2.
depends-on: none.
scope: persist `counts.chars` on the reading at `op=acquire`; add the LOOKED_ABSENT branch in `contentObservationsFor`. Extend `bio-plane/test/observation-content.test.mjs` beside B8.
accepts-when: a scan read to zero characters writes LOOKED_ABSENT. NEGATIVE CONTROL: drop the count, and that arm reads PRESENT and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-374 · integrated — **A `pdf-page` EXTENT'S `rect` IS BOUNDED BY NOTHING: `checkContentExtent` asks only for four finite numbers, while `pagepixels.mjs` already computes each page's MediaBox and the plane never receives it.** — owner CONTENT-PDF, CAPTURE, RECORD.
status: integrated — SCHEDULER #23 07:40Z: tip c7703c3d on 5e8a65a8, GATE 84/84 GREEN FULLREUSE (6852 assertions; reuses 384/386 full run, reds fixed), tree ac4c7545; reading.page_boxes, C-45.1 bounds a pdf-page rect by MediaBox; construct 5.pdf-page-rect-bound; I5/I6 IC the integrator's; adjacent-line merge with D-375 at the acquire assembly; minted D-670, D-671
order: after D-375: content minted on a region the page does not have (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I5/I6 — per-page `{w,h}` on the reading (nullable); the integrator mints and classifies the IC.
design: `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §6 (which gains the bound).
depends-on: none.
scope: carry per-page dimensions onto the reading; the extent check refuses a rect outside the MediaBox by name (the stricter mechanism; clip-and-state is the architect's alternative if preferred). Extend the extent suite.
accepts-when: `[0,0,999999,999999]` is refused by name; a rect inside mints. NEGATIVE CONTROL: drop the bound, and the oversize arm mints and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-415 · integrated — **A WORKBOOK'S `sheet-range` UNITS ARE WHOLE SHEETS ONLY: `formats-xlsx.mjs` turns `definedNames` into anchor links and emits one `usedSheetRange` per sheet; table parts and ODF named ranges are not read.** — owner COFF.
status: integrated — SCHEDULER #23 07:50Z: tip 48245247 on 5e8a65a8, GATE 385/385 GREEN FULLREUSE (21877 assertions), tree 190b28c6; xlsx defined names + table parts, ods named/database ranges emit sheet-range rangeUnits (skips with reasons); I2 additive, IC the integrator's; construct 5.tables-images probes; minted D-672
order: after D-374 (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I2 — finer sheet-range units; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.3 item 1.
depends-on: none.
scope: a defined name and a table part each emit a `sheet-range` unit; a multi-area name is skipped with a stated reason. Extend `bio-plane/test/fw19-extent-arms.test.mjs`.
accepts-when: a fixture's defined name emits its unit. NEGATIVE CONTROL: before the fix the defined-name arm emits none and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-419 · running — **THE CROP OF A CITED PDF IMAGE EXISTS AND NOTHING CAN ASK FOR IT: `cropImage` lives only in `pdf-worker/src/imagecrop.mjs`, with no route and no plane op.** — owner CONTENT-PDF, then RECORD; a UI item renders it.
status: running — SCHEDULER #23 07:12Z: spawned
order: after D-416; display only, behind every over-claim (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I6 — a `POST /crop` route; I3 — a read-only op; the integrator mints and classifies the ICs.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.4.
depends-on: none.
scope: the member route and a read-only plane op returning the crop for a cited image extent. Extend `pdf-worker/test/` and a plane suite.
accepts-when: a cited image extent returns its crop through the op. NEGATIVE CONTROL: route to the whole page, and the crop-dimensions arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-625 · running — **AN UNPLACED OCCURRENCE OF A STRING READ AT SEVERAL PLACES CAN NEVER BE CHOSEN: the choose act reads an empty `occurrence=` as NONE NAMED (`String(args.occurrence).trim() || null`), so the empty key an unplaced read carries is unreachable, and the member is refused C-74.4 for a place the plane itself listed.** Found by UI-112's worker (D-625 minted on land/worker/UI-112). — owner RECORD.
status: running — SCHEDULER #23 07:17Z: spawned
order: head of the backlog — a correction to just-landed work (D-454 done, UI-112 integrated) outranks new work (SCHEDULER #23, 2026-09-25; verified at the code on origin/main store.mjs, the `named` line of the connection-choose act)
milestone: M4
interface: I3 — the choose act treats a PRESENT-but-empty `occurrence=` as the empty key; an ABSENT one is still none named. The integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair; UI-112's sentence naming D-625 as not built).
depends-on: none (D-454 done; UI-112 integrated, rides its batch — the surface already sends what the op lists).
scope: distinguish `occurrence` absent from `occurrence` present and empty in the choose act; the empty key selects the unplaced read; §14.5's and construct `6.on-point-ui`'s "an unplaced occurrence cannot be chosen" sentences corrected in the same commit.
accepts-when: a fixture string read at two places, one unplaced, is chosen at its unplaced occurrence and the portion grade answers from it. NEGATIVE CONTROL: restore the `|| null` collapse and the unplaced-choice arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (from SCHEDULER #22's hand-over; fix named by UI-112's worker).

### D-629 · running — **THE STORE ANSWERS ANY THROWN ERROR WITH ITS STACK: `Store.fetch`'s catch (store.mjs, the outermost handler) returns `String(e.stack)` to the caller for ANY throw on ANY op, and `index.mjs` has the same shape — so file paths, line numbers and constraint text reach a caller, and a constraint error reads as a stack instead of a refusal.** Found by D-578's worker (minted on land/worker/D-578). — owner RECORD.
status: running — SCHEDULER #23 07:21Z: spawned
order: near the head — a disclosure defect outranks features (SCHEDULER.md loop step 3), behind D-625 only because that corrects just-landed work (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — every op's unhandled-error answer becomes a named internal-error code with no stack; the integrator classifies (BREAKING-shaped for any caller reading the text).
design: `docs/architecture/BIO_System_Design.md` §2 (trustworthiness of the record; DEC-49's named refusals), with CLAUDE.md §2 "less narrative binds us first".
depends-on: none.
scope: both outermost catches answer a named internal-error code and a correlation id, never the stack or message text; the stack is logged server-side; no op's named refusal changes.
accepts-when: a forced throw on a public op and on a member op answers the named code with no stack, path or line text (moves: String(e.stack) to the caller). NEGATIVE CONTROL: return the stack again and the no-stack arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-578's worker).

### REC-206 · running — **AN AGENDA ITEM'S MEMBERSHIP IN A FILE EXISTS ONLY AS RECT CO-LOCATION AN INSTRUMENT INFERS: tier-1 text units carry no position and a LinkRecord carries no anchor text.** BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *DESIGN IT — I2 gains position on tier-1 text units (page and rect) and anchor text plus a rect on LinkRecord; membership is DERIVED from containment, labelled machine work and graded inferred, never presented as the publisher's link.* — owner CONTENT-PDF, then RECORD.
status: running — SCHEDULER #23 07:24Z: spawned
order: with the M2 extraction rows, after D-246; I2 PROVISIONAL, RECORD after PDF, as ruled (SCHEDULER #17, 2026-09-23, LED-7 S17-4; CPDF-3's worker)
milestone: M2
interface: I2 PROVISIONAL — positions and anchors; I3 — the derived membership; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 (BOB folds it), with BOB #32's ruling of 2026-09-23 23:30Z (cite until folded).
depends-on: CPDF-3 (`integrated`).
scope: the PDF member emits page and rect per tier-1 unit and anchor text plus rect per link; the plane derives item-to-file membership by containment, labelled and graded inferred.
accepts-when: an agenda's item-to-file membership reads derived, labelled machine work, graded inferred. NEGATIVE CONTROL: present it as a publisher link, and the labelling arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-340 · running — **CHROME IS A PROPERTY OF THE SITE AND THE PLANE RECORDS IT NOWHERE: `site_chrome` exists only in `LINK-FIDELITY.md`, which RATIFIES it as a derived table regenerable by scan; no table and no per-host navigation-change read are built.** — owner CAPTURE, then RECORD.
status: running — SCHEDULER #23 07:26Z: spawned
order: after D-419, with the M4 extraction rows (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I5 — a derived table (in `purge`); I3 — a per-host read; the integrator mints and classifies the ICs.
design: `docs/development/LINK-FIDELITY.md` §"Chrome: rendering and connection are different problems".
depends-on: none.
scope: derive `site_chrome` per host by scan, add it to `purge`, and a read naming links a host's navigation lost between captures.
accepts-when: two captures of one host whose nav lost a link make the read name that link. NEGATIVE CONTROL: derive per page instead of per host, and the arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-177 · running — **THE CAPTURE GRADE BELOW THE CEILING IS STILL AUTHORED: `store.mjs` says *"there is no per-document capture grade anywhere in this schema"*; `#legEarnedCapture` applies REC-88/105's CEILING, not a measured value, so a member-authored grade under it stands unmeasured.** — owner CAPTURE, then RECORD.
status: running — SCHEDULER #23 07:30Z: spawned
order: after D-191 (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M9
interface: I3/I5 — a derived per-capture grade read by the strength walk; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part I (the chain rules), with DEC-4 and DEC-75 (*capture grade is about the fetch path*).
depends-on: none — the ceiling (REC-88, REC-105) is built.
scope: derive a per-capture grade from `captured_locators.via` plus authority state, read it in `#strengthWalk`. The letter for a non-direct `via` is UNDETERMINED by any ruling found; if none covers it, that part goes to BOB (REC-50's precedent) and the row builds the direct case first.
accepts-when: a member-authored C on a direct capture reads the earned grade, not the authored one. NEGATIVE CONTROL: read the authored grade again, and that arm fails by name. Extend the strength suite.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-194 · running — **A MEMBER'S LEAD HAS A PLANE AND NO SURFACE: `op=lead`, `leadlook`, `leadread` and `leadshare`, the `leads` table and the internet frontier's read of them are built (`status.mjs` 10.lead), and `app.html` makes no lead call.** — owner UI.
status: running — SCHEDULER #23 07:33Z: spawned
order: after D-177, a member surface on a built plane (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M4
interface: I3 consumer.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5 (the lead's surface).
depends-on: none — the plane half is built.
scope: a member writes a lead, records a look, and sees the frontier's LOOKED_ABSENT against it; the lead is shared only by the member's act. New harness in `civicos-ui/test/`.
accepts-when: a member writes a lead, records a look, and sees LOOKED_ABSENT against it. NEGATIVE CONTROL: stub `op=lead`, and the write-and-look arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; the plane half closed; keeps its `D-` id).

### D-189 · running — **NO SURFACE CAN SAY A PROJECT CARRIES ITS OWN BIAS: `op=biasmanifest` computes the effective set with project nullifications, `7.ui` is ABSENT, and `app.html` still says *"DECLARED BIAS is the HUNCH legs and nothing else"*.** — owner UI.
status: running — SCHEDULER #23 07:36Z: spawned
order: after D-194 (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M8
interface: I3 consumer.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption" (DEC-46).
depends-on: none — the manifest read is built.
scope: the project and publication surfaces read the manifest at project scope and state that the project carries its own bias; the hunch-only sentence is corrected. New harness in `civicos-ui/test/`.
accepts-when: a project with an adopted set shows it; an empty manifest shows no indicator. NEGATIVE CONTROL: render the indicator on an empty manifest, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-664 · running — **`civicos-ui/test/refusal-codes.control.mjs` IS STALE ON MAIN: on 5e8a65a8 arms (c), (e) and (r2) fail and (r5) THROWS on a moved anchor (store.mjs ~18517), so no arm after (r5) runs — the negative control for the refusal-code guard is not controlling anything.** Found by D-542's worker (minted on land/worker/D-542). — owner M0.
status: running — SCHEDULER #23 07:40Z: spawned
order: after D-641 — the control of the guard D-641 moves; a check that cannot fail is worse than none, so it precedes the rest of the process rows (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control), CLAUDE.md §5 (re-run a subject's control after changing it).
depends-on: none (D-542's R5/R6, integrated at fac514e0, adds arms; re-measure on the union if it lands first).
scope: re-anchor (r5) by its region marker, not a line; re-measure (c), (e) and (r2) and correct each with a comment saying why the old anchor was wrong; record the result on the suite's NEGATIVE CONTROL line.
accepts-when: every arm runs and each fails by name when its subject is broken, restored by hash (moves: three arms failing and one throwing on main). NEGATIVE CONTROL: this row is one — its record is the arm table.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-542's worker, relayed by CONDUCT #22).

### REC-201 · running — **A RECORDS REQUEST CAN ONLY BE A CALIFORNIA ONE: the action kind is `cpra_request`, and sovereign groups sit outside California.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *DESIGN DIRECTION ADOPTED — a law-neutral `records_request` kind carrying a `law` field; `cpra_request` stays readable as written.* — owner RECORD.
status: running — SCHEDULER #23 07:45Z: spawned
order: behind the current M9/M10 product rows, as ruled (SCHEDULER #17, 2026-09-23; D-149's builder)
milestone: M10
interface: I3/I5 — a new action kind; the integrator mints the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: D-149 (`integrated` on c17-batch7).
scope: the `records_request` kind with its `law` field alongside D-149's governing-laws list; existing `cpra_request` actions read unchanged. Extend D-149's suite.
accepts-when: a `records_request` under a non-California law files and reads its law; an old `cpra_request` reads byte-identically. NEGATIVE CONTROL: rewrite `cpra_request` on read, and the unchanged arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-202 · running — **A MEMBER CANNOT TAKE UP OR SET ASIDE AT THE INQUIRY'S GRAIN: the code declares an `options_grain` gap (offered at document grain, missing at inquiry grain) in `store.mjs`'s findings producers, and no row carried it.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *row it — a missing member door.* — owner RECORD if an op is missing, UI otherwise; check at the code at spawn.
status: running — SCHEDULER #23 07:50Z: spawned
order: behind the current M9/M10 product rows, before the M0 group (SCHEDULER #17, 2026-09-23; D-213's residue)
milestone: M9
interface: I3 — possibly an act; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §8 (the inquiry's QUESTION is a first-class object), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: none — PL-15's out-of-inquiry lead is built.
scope: offer "take this up" and "set aside" at the inquiry grain wherever the code declares the gap; close the declared `options_grain` entries.
accepts-when: a member takes up and sets aside a finding at the inquiry grain, and no declared `options_grain` gap remains. NEGATIVE CONTROL: withhold the inquiry-grain option, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-680 · running — **A DERIVATION DRAFT (no `caseId`, no `newCase`) IS REFUSED `PUBLISH_DRAFT_NOT_THIS_CASE` ON AN EXISTING CASE'S FURTHER EDITION: publishCase's is-publish-draft-this-case region passes it only when `predicted === 1`, refusing the very deferral D-538 names.** BOB #35 RULED 2026-09-25 07:35Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; the whole ruling there, cite until folded): it binds to the case publication derives, any edition; a named case binds only if it IS the derived one, else refused by name with both. Found by D-626's worker. — owner RECORD.
status: running — SCHEDULER #23 07:55Z: spawned, stacked on land/worker/D-626 @ 2a5d4ed8
order: with the corrections at the head of the backlog, after D-671 — it corrects just-landed D-626's region (SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 — a derivation draft admitted on a further edition; a new named refusal for a named case that differs from the derived one; the signed document's case-provenance statement; the integrator mints and classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 and §6A.4, with BOB #35's 07:35Z ruling, folded into §3 rule 13 by this row.
depends-on: none (stacked on land/worker/D-626 @ 2a5d4ed8, integrated; its reworded refusal text then says what this row makes true).
scope: in is-publish-draft-this-case, a draft with neither caseId nor newCase passes when the act's case equals the derived case; a named case differing from the derived one is refused by name with both; the signed document carries derived-at-publication or named-and-confirmed.
accepts-when: a derivation draft publishes as a further edition of the derived case, and a mismatched named case is refused with both cases (moves: `predicted !== 1` refusing a further edition). NEGATIVE CONTROL: restore `predicted !== 1` for the derivation arm and rec217-draft-binding's new further-edition arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs D`, on BOB #35's 07:35Z ruling).

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

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
