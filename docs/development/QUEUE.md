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

### D-521 · running — **IC-246's STATEMENT_ACK_DOCUMENTS_OVER_BOUND (C-82.1) IS UNREACHABLE BY CONSTRUCTION: after REC-194 its read names (case_id, edition), `case_documents`' primary key, so at most one row returns and the bound can never fire.** Found by REC-194's worker (F1). — owner RECORD.
status: running — SCHEDULER #22 04:12Z re-spawns WORKER D-521 on main 5e8a65a8 (REC-217 landed, widened op=statementack's read)
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
status: integrated — SCHEDULER #22 04:03Z: tip 3db50421 (CARRIES REC-191 cfcb33e3), GATE 54/54 GREEN (reuse over 7216de32's full run), tree f56fc97f; op=monitor answer gains capture; OWED: the §4.1 fold of BOB #34 03:05Z (interim STANDS) is NOT on the branch, worker re-asked
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

### MK-7 · running — **THE ATTRIBUTION ACT, AND THEN THE LIFT OF MK-1's FENCE** (MK-3's replacement (ii), `MEMBER-KNOWLEDGE-DESIGN.md` §4.2–§4.6): an … (whole text: the cut archive)
status: running — SCHEDULER #21 02:36Z spawns WORKER MK-7 (depth 2)
order: after MK-6, which it rests on, and above MK-5, which rests on it; replaces MK-3 (superseded 2026-09-21). Two points are provisionals carried to Bob, cheap to change until built: §4.4's narrow veto and §4.6's `name` = handle (SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3 — the builder names the op and, if a design names it first, registers it in `op-claims.mjs`' `PLANNED_OPS`.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4.2–§4.6 and §8's row for replacement (ii).
depends-on: MK-6; REC-126 (the review copy, built).
accepts-when: through the ops, each level round-trips into the published projection exactly as chosen; nothing is prefilled; an unchosen reached observation refuses ratification BY NAME; `name` without a … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit; `node tools/mintid.mjs MK`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «MK-7» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-147 · running — UNBLOCKED 2026-09-24 by BOB #32: its dependency is met (M0-71 done, gate on main; M-118). The old block confused an ACCEPTANCE condition with a precondition — the judgement this row builds is what the gate measures. RULED: accepts-when adds that the run REPORTS recall beside false conflicts on M0-71's gate (the gate alone cannot see a detector that abstains); a judgement whose recall does not beat the lexical baseline's 2/9 (M-118) is the finding and returns to BOB.
status: running — SCHEDULER #21 02:40Z spawns WORKER REC-147 (depth 2)
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

### REC-197 · running — **CREATE AND FORK DO NOT CARRY THE DISCOVERABLE SETTING, AND A MACHINE CREDENTIAL'S OWNERLESS PROJECT HAS NO RULE.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *create and fork take one optional `visibility` (`discoverable` or `hidden`), absent means HIDDEN; a MACHINE credential never sets it (an ownerless project has no owner to choose): its creation is HIDDEN and `visibility=discoverable` from one is refused by name.* — owner RECORD.
status: running — SCHEDULER #22 03:48Z spawns WORKER REC-197 (depth 2), REC-196 integrated at 82f604d2
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

### UI-70 · queued — **DISCOVERABLE OR HIDDEN, 3 of 4: the create and fork forms ASK, with neither preselected, and cannot submit without the choice** … (whole text: the cut archive)
order: after REC-149, and after UI-66 on the same forms (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's IC)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14, with DEC-69 (forced, at the act).
depends-on: REC-149; and the create and fork forms as UI-66 leaves them (same forms — one worker at a time).
accepts-when: the harness cannot submit a create or fork without the choice, and nothing is preselected; the owner changes the setting and a non-owner sees it read-only. How a liar passes … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 3).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-70» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-134 · running — **NO SURFACE PERFORMS §4.9's CUSTODIAL ACTS: `memberadd`, `memberset`, `signeradd` and `signerset` have ZERO call sites in** … (whole text: the cut archive)
status: running — SCHEDULER #22 03:12Z spawns WORKER D-134 (depth 2)
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

### D-320 · running — **THE PASS-THROUGH JPEG ROUTE CANNOT BE TRANSCRIBED IN-ISOLATE: `ocr-worker`'s `transcribe.mjs` refuses every non-PNG route (PIXELS_UNREADABLE), so 17 of CPDF-12's 24 image-only pages (DCT) go untranscribed; 8-bit rotation is not built either (`pagepixels.mjs`).** — owner CONTENT-PDF.
status: running — SCHEDULER #22 03:30Z spawns WORKER D-320 (depth 2)
order: with the M2 extraction rows, after D-191: the route with the strongest provenance reads nothing (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: I6 — the member's pixel route; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §6 (which gains the gap's statement).
depends-on: none — CPDF-12's census answered the share.
scope: a baseline DCT decoder in the member, checked against Pillow digests as `pagepixels.test.mjs` does; after decoding apply `/Rotate` (3 of the 24 are /Rotate 270; from D-244); 8-bit rotation. Extend `pdf-worker/test/pagepixels.test.mjs` and `ocr-member-e2e.test.mjs`.
accepts-when: a DCT image-only page transcribes, rotated, and its pixel hash matches Pillow's. NEGATIVE CONTROL: a no-op decoder fails on the digest by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-312 · running — **`memoryUsageBytes` IS NOT A FRACTION OF THE 128 MB ISOLATE, AND LIVE SITES STILL SAY "of 128 MB": `agent-worker/src/index.mjs` (the shipped `BOUND_SOURCE`, and the segment bound sized on that reading), `fl1-cpu-probe.mjs`, `INTERFACES.md` §"The segment bound…", `pagepixels.mjs`.** The rule is stated in `INTERFACES.md` §"The memory bound, and how it is expressed". — owner FLEET, CONTENT-PDF.
status: running — SCHEDULER #22 03:44Z spawns WORKER D-312 (depth 2)
order: after D-320, the M2 measurement corrections: a shipped bound rests on the misreading (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M0 (measurement wording, and one shipped bound)
interface: none — wording, and a re-check of one bound.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for the rule stated in `docs/development/INTERFACES.md` §"The memory bound, and how it is expressed".
depends-on: none.
scope: correct each live site; re-check the agent-worker segment bound against the rule and state the result.
accepts-when: no live site divides by 128 or says "of 128"; the bound's re-check is recorded. NEGATIVE CONTROL: a grep arm over the live sites fails by name on a planted "of 128 MB".
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-460 · running — **DIAGNOSIS: SOME TIER-3 AGENDAS AND MINUTES READ AS GENERIC, AND NOBODY KNOWS WHY.** FW-20 observed it on its walk (M-121, on c18-batch8) without diagnosing it; one suspected cause is that the OCR member transcribes one page per invocation and the plane reads only the first. Its finder's session is archived and no CONTENT-PDF lane is live, so the diagnosis is rowed. — owner CONTENT-PDF.
status: running — SCHEDULER #22 03:48Z spawns WORKER D-460 (depth 2)
order: after D-312, with the M2 extraction measurements: a possible silent under-read of scanned civic records, the class CLAUDE.md §2 ranks worst if confirmed (SCHEDULER #17, 2026-09-23; CONDUCT #18 23:51Z)
milestone: M0 (a diagnosis — a measurement)
interface: none until the fix is named.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for FW-20's M-121 walk.
depends-on: FW-20 (`integrated` on c18-batch8; M-121 lists the walk).
scope: take the tier-3 walk documents M-121 names as agendas or minutes that read generic; establish whether the member transcribes one page per invocation and the plane keeps only the first; name the fix, or show the documents are generic.
accepts-when: the named fix (then placed as its own row) or the refutation, recorded with date and instrument. NEGATIVE CONTROL: a two-page scanned fixture whose second page alone carries the agenda heading reads generic before the fix, or the refutation shows it read whole.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-596 · running — **THE SETUP PAGE SERVED AT `/` READS THE GROUP'S SLUG ALONE (`index.mjs` `publicInstanceGroup` -> `setup.mjs` `groupLine`), so it shows neither the display name nor the verified domain, while `store.mjs` `groupNameSet`'s answer tells the administrator "every public surface shows it beside the slug".** Found by UI-78's worker (03:28Z). The construct's last NOT BUILT trace. — owner RECORD.
status: running — SCHEDULER #22 03:33Z spawns WORKER D-596 (depth 2)
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

### D-473 · running — **`.odt` AND `.odp` EXPORTS STAY UNDETERMINED FOR BYTE STABILITY: D-351's `.odt` normalisation (strip `xml:id` on `text:list`) was never re-measured over the population, because the worker's pull of CAP-11's scratch captures was refused (PII) and it did not route around the refusal.** — owner CAPTURE.
status: running — SCHEDULER #22 03:52Z spawns WORKER D-473 (depth 2)
order: with the M0 measurements, after D-465: widening to `.odt` is a measurement first (SCHEDULER #17, 2026-09-24; D-351's worker via CONDUCT #19)
milestone: M0 (a measurement)
interface: none until widened.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for D-351's normalisation.
depends-on: D-351 (finished; rides the train after c19-batch9).
scope: re-measure the `.odt` and `.odp` normalisation over a population the lane may read (never by routing around a refusal); widen only on the figure.
accepts-when: the stability figure is recorded with date, instrument and population, and the formats are widened or stated undetermined on it. NEGATIVE CONTROL: skip the `xml:id` strip, and the re-fetch pair reads unstable by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).
note: 2026-09-24 by SCHEDULER #19 (D-472's worker F2, via CONDUCT #20 20:14Z): the monitor's cry-wolf survives for Google Docs and Slides (.odt, .odp) because only .ods has a measured container digest; land the .odt normalisation with an ODF_EVIDENTIARY_MEASURED row once measured, and name a census target for .odp.

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

### FW-24 · running — **THE WHOLE-CORPUS DOCUMENT-TYPE CENSUS IS NOW TAKEABLE AND NOT TAKEN: Legistar answered during FW-22, so the census can run over the whole corpus (`M032_HALVES=bucket`) instead of the sampled halves.** FW-22's worker (finding 3, via CONDUCT #20 21:21Z). — owner FRAMEWORK.
status: running — SCHEDULER #22 03:58Z spawns WORKER FW-24 (depth 2)
order: after D-515, with the measurements: EXTRACTION-BREADTH §2's rule that a count comes before any reader (SCHEDULER #19, 2026-09-24)
milestone: M2
interface: none — a measurement.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §2 "Readers beyond three — the rule, and the order".
depends-on: FW-22.
scope: run the census instrument over the whole corpus with `M032_HALVES=bucket`, FINANCIAL REPORT counted apart (FW-22); record each class's count with interval, date and instrument; restate §2's order if the counts move it.
accepts-when: MEASUREMENTS carries the whole-corpus counts with their instrument and date (the measured failure it moves: the order resting on sampled halves only). NEGATIVE CONTROL: fold FINANCIAL REPORT back into budget and the class count moves, by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs FW`).

### D-321 · running — **NO REAL IMAGE-ONLY PAGE IN THE CORPUS CARRIES AGENDA-SHAPED TEXT, SO THE `reading_refs` JOIN OVER REAL OCR IS PROVED ONLY ON SYNTHETIC INK (`ocr-member-e2e.test.mjs`).** — owner CONTENT-PDF.
status: running — SCHEDULER #22 04:03Z spawns WORKER D-321 (depth 2)
order: after D-320; the page must come from bytes already held (the cloud proxy refuses Legistar) (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: none — a fixture and an arm.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §16.
depends-on: none — the page comes from bytes already held; D-313 (the image-only corpus) is a stated limitation.
scope: commit one real scanned-agenda page image to the OCR fixtures; drive the join over it.
accepts-when: a real page's OCR yields a `reading_refs` hit. NEGATIVE CONTROL: switch the recogniser off, and the join reads empty by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-610 · running — **THREE WRITERS CHANGE `members.status` WITHOUT `status_by` (measured at 964da679: the re-invitation ~34957, the revocation ~35008 and the enrolment ~35183 in `store.mjs`), so a row `memberset` stamped reads a later status under the WRONG actor: a live false attribution.** Measured by BOB #35 on D-134's question (04:00Z). — owner RECORD.
status: running — SCHEDULER #22 04:08Z spawns WORKER D-610 (depth 2)
order: after D-586, with the authority and attribution corrections ahead of features: a status stated under an actor who did not cause it is the record claiming more than it supports (CLAUDE.md §2); BOB #35: *"(c) is a DEFECT"* (SCHEDULER #22, 2026-09-25)
milestone: M8
interface: I5 — `status_by` now written on every transition; the integrator classifies.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 and the REC-159 paragraph as BOB #35 folded it 04:00Z (land/bob/batch-0925c), with §4.7 for the vote.
depends-on: none.
scope: every writer of members.status writes status_by = the actor whose act caused that transition: enrolment the member; invitation and re-invitation the inviter; revocation its actor; a §4.7 vote the administrator whose vote completed it. Grep every writer by the column, not the three lines named. Rows written before read as they are; never back-fill.
accepts-when: each transition read back names the actor that caused it (moves: 3 writers leaving a stale status_by). NEGATIVE CONTROL: drop the stamp from the enrolment writer and its arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs D`; BOB #35 04:00Z).

### M0-195 · running — **A BEHAVIOUR-ONLY CHANGE TO A CHECK CANNOT TAKE A CATALOG_VERSION: the D-470 census counts C-numbers only, and its (A4) refuses two versions with the same census, so publication rule 17 ("a changed check moves the version") has no instrument when a check's body changes and its number does not.** Found by D-598's worker (03:37Z); ruled by BOB #35 04:00Z. — owner M0.
status: running — SCHEDULER #22 04:12Z spawns WORKER M0-195 (depth 2)
order: at the head of the process rows, before M0-142: it unblocks a product landing (D-598 takes its version bump only after this lands) and a check changed silently is a record claiming the old rule (BOB #35 04:00Z: *"rule 17 STANDS and its instrument is short"*) (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none (the census's own grammar gains two fields).
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 17, as BOB #35 folded it 04:00Z (land/bob/batch-0925c @ 2e9d4f4e; rides the next train).
depends-on: none.
scope: the census row may declare `changed: [C-n.m, …]`, counted in the version's identity by (A4); the census pins each version to the digest of bio-checks.mjs's comment-stripped source, so a moved digest under an unmoved version fails by name unless the landing takes a new version or declares `behaviour: unchanged` against the new digest. In `bio-plane/test/d470-catalog-census.test.mjs` and its control.
accepts-when: a check's body edited with no census row fails by name, and one declared in `changed:` under a new version passes (moves: behaviour-only changes invisible to the version). NEGATIVE CONTROL: edit a check's body without a census row, and the new arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs M0`; BOB #35 04:00Z).

### D-563 · running — **`op=promote` TAKES A BUNDLE'S TITLE AND STATE FROM THE ENVELOPE, NOT THE DOCUMENT: it projects `bundles.title`, `current_state`, `prior_state`, `created` and `last_updated` from the envelope, and 7.1's name scan, 7.11's owner test and REC-181's retirement arm read `meta.title` / `meta.current_state`; MEASURED: a second project whose bytes name a TAKEN title LANDED when `meta.title` named another, and the projection shows the envelope's title over the bytes'.** D-526's class one field over; found by D-526's worker (00:48Z). — owner RECORD.
status: running — SCHEDULER #22 04:16Z spawns WORKER D-563 (depth 2)
order: at the head of the backlog with the promote corrections: a name fence and an owner test a caller can steer with a label are authority defects, which outrank features (SCHEDULER #21, 2026-09-25)
milestone: M7
interface: I3 — refusals on op=promote for a contradicting envelope; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5 and D-510's derivation (the document states what it is; the envelope is a label).
depends-on: D-526.
scope: extend D-510's derivation to title and state: derive both from the document, refuse an envelope that contradicts it by name, and make 7.1's name scan, 7.11's owner test and REC-181's retirement arm read the derived values; the projection writes the derived values.
accepts-when: the taken-title promotion is refused NAME_TAKEN whatever meta.title says, and the projection shows the document's title (moves: a taken name landing under another label). NEGATIVE CONTROL: read meta.title in the name scan again and the taken-title arm lands, failing by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-526's worker).

### D-578 · queued — **A PROMOTE REVISION WHOSE DOCUMENT AND ENVELOPE BOTH STATE NO TYPE LEAVES `promotedType` UNDEFINED, and the INSERT throws "NOT NULL constraint failed: bundles.object_type": the caller gets a raw error with a store.mjs stack instead of a named refusal (reproduced through op=promote on the D-547 tree; the transaction rolls back, nothing lands).** Found by D-547's worker (01:36Z). — owner RECORD.
order: after D-563, with the promote corrections: a raw stack on a public op breaks DEC-49 and leaks internals (SCHEDULER #21, 2026-09-25)
milestone: M7
interface: I3 — a typeless revision carries the head's type forward, stated; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5, D-510's derivation and D-547's retype fence (C-86.2).
depends-on: D-547.
scope: a revision that states no type takes the head's `cur.object_type` (the only type D-547 admits), stated on the answer, never silent; a CREATION that states no type keeps its existing refusal.
accepts-when: a typeless revision lands carrying the head's type and says so; no op=promote answer carries a stack (moves: a raw NOT NULL error). NEGATIVE CONTROL: drop the carry-forward and the typeless-revision arm reads the raw error, failing by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-547's worker).

### D-546 · queued — **`op=promote` ASKS NO STATE-EDGE TABLE EXCEPT FOR BIAS: D-468 fenced a bias set's moves against its STATES edges, and every other type with a head can still move along an edge its table does not declare.** D-468's worker. BOB #34 RULED 2026-09-24 23:55Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #21; cite until folded): *the fence governs moves MADE FROM NOW ON; the history stays as it was written, and is COUNTED and SAID.* — owner RECORD.
order: after D-547, with the promote corrections: a disallowed move lands in the record (CLAUDE.md §2); BOB #34 ruled it product order (SCHEDULER #21, 2026-09-24)
milestone: M7
interface: I3 — refusal codes on op=promote for types other than bias; the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4 (per-type schemas and state machines), with BOB #34's 23:55Z ruling, folded into §4 by this row.
depends-on: D-468.
scope: (1) MEASURE the corpus first: per type, the count of recorded moves whose edge is undeclared today, with dates, in `measurements/<id>.md`; (2) lift D-468's fence to every type with a head: promote refuses any move its type's table does not declare, for every caller by a named DEC-49 code; (3) never rewrite, reverse or repair a stored move; where a reader meets one it is stated "made by a path the current rules do not allow (before <fence date>)", neither valid nor invalid, and never larger or smaller than the count shows; (4) `STATES` keeps its valid-but-unreachable states for reading old records, unreachable by promote.
accepts-when: an undeclared move on a non-bias type is refused by name, a stored undeclared move reads with the dated sentence and is unchanged, and the measurement states the per-type counts (moves: promote asks no table but bias). NEGATIVE CONTROL: drop the fence for one type and its undeclared-move arm lands, failing by name.
added: 2026-09-24 · SCHEDULER #21 (id minted by D-468's worker).

### D-556 · running — **A WHOLE-HASH REGISTER ROW HELD IN PARTS CANNOT RATIFY: the gate refuses it PLANE_HELD_IN_PARTS (D-530) because publication copies a capture by its whole hash, while the audit calls the same bytes SOUND (D-533).** Found by D-533's worker (M-150). BOB #34 RULED YES 2026-09-25 00:00Z (drained to `BOB-INBOX-drained.md`; cite until folded): BOTH halves in ONE landing, never the gate alone. — owner RECORD.
status: running — SCHEDULER #22 04:25Z spawns WORKER D-556 (depth 2)
order: after D-546, with the corrections: a gate that treats sound bytes as missing contradicts the record, but D-530's refusal is honest until both halves land (BOB #34 00:00Z) (SCHEDULER #21, 2026-09-25)
milestone: M10
interface: I3 — publication's copy and the gate's verdict; the integrator classifies.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (D-530's parted capture), with BOB #33's D-533 ruling and BOB #34's 00:00Z ruling, folded by this row.
depends-on: D-530, D-533.
scope: (1) publication copies a parted capture part by part and re-verifies each digest at the destination; (2) the gate admits the row when every part is present and verifies, and refuses by name (the missing part, or the digest that failed) otherwise; reuse D-533's parts helper, never a third copy.
accepts-when: a parted capture ratifies AND publishes, byte-verified; one missing a part is refused naming it (moves: PLANE_HELD_IN_PARTS on sound bytes). NEGATIVE CONTROL: drop the part-copy from publication and the publish arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-533's worker).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
