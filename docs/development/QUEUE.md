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
- **2026-09-25 02:05Z · BOB #34 · REC-191's three provisional readings of BOB #31's cadence ruling are CONFIRMED as the rule (REC-191 @ cfcb33e3).** (1) The CURRENT version is the newest one at the address that ASKS to be monitored; a newer one that does not ask is stated as `newer_unmonitored`. (2) Where the current version authored no frequency, its TYPE's contract governs; an older version's authored word appears in `disagreement` and does not govern. (3) An address that was checked but never read is stated as unscheduled, never retried on an interval nobody derived. The ADDRESS-level setting (the ruling's first clause) is NOT built and NOT rowed: no member has asked for it, and adding it later costs nothing because it would be read first. construct-status 10.cadence-address states it ABSENT. The fold goes into the monitoring design's home, via the row that lands REC-191.
- **2026-09-25 02:20Z · BOB #34 · DIST-8's scratch-member residue, DECIDED: members STAY, the residue is STATED, and no row is placed.** Scratch is the verification namespace, not the record. Its 14 member rows (July d41-sf72-*, probe-*, scr-*; September vf4*, dist3-rec156-*) are the trace of who held a scratch credential, and nothing is blocked by their presence. A member-deleting purge arm would be a NEW destructive act on membership, and by Bob's rule process work goes ahead of product only when it appreciably helps; this does not. DIST-8's sweep report states "scratch is at zero on every swept counter; 14 member rows remain by design". A suite that needs an empty roster mints unique member ids, as the sweep's own arms do. This is revisited only if a measured defect needs it. (I judged this operational, not doctrine: it concerns the test namespace and changes nothing a member of the real record can see.)
- **2026-09-25 02:30Z · BOB #34 · D-579 (capture pins for the three remaining reference acts), RULED under Bob's 00:40Z version doctrine.** (a) **A case's citation edge is pinned INSIDE the signed case document.** A published case must say which version it cited, and a pin kept outside the signed bytes is one a reader cannot verify. It RIDES REC-219's `bio-case-document/4`: there is ONE format bump, not two. REC-219 and D-579(a) land together, or (a) extends REC-219's row, as SCHEDULER finds cleaner. A /3 document is never re-signed; read today, its edges state "version undetermined (signed before capture pins)". (b) An action's basis leg gains an `extent_capture` slot in its frontmatter grammar. This is an I5 ADDITIVE change, and legs that lack it read "version undetermined". (c) A run's suggested version legs carry `extent_capture` through C-25.11's composition, so a suggestion names the capture the run read. Place THREE rows: (a) with REC-219, then (b) and (c), each depending on REC-220 (done). All three are in product order, before REC-222, because the notice needs pins to compare against.



## THE CACHE — the next rows, in order

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 16 in all (`CACHE_ROWS`, sized to CONDUCT's capacity plus spare: Bob, 2026-09-23, `WORK-PIPELINE.md`). **At most 10 worker sessions are live at once** (Bob, 2026-09-24 ~03:08Z, via BOB #32; until 05:00Z, then 6, and no new spawn from 06:00Z): a `running` row whose worker has FINISHED and awaits integration holds no session, so the cache keeps a few `queued` rows behind the live ten and no slot waits. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### REC-207 · running — **NOTHING SETTLES A BIAS-DEBT OBLIGATION BUT THE LENS MOVING BACK: a re-run under the current lens is not recognised, and `op=taskresolve` addresses tasks, not runs.** BOB #32's ruling of 2026-09-23 23:42Z (cite until folded into Declared Bias "Bias debt, and HUNCH DEBT" and NOTIFICATIONS): *BOTH acts settle it, each RECORDED, never cleared silently — (1) a re-run under the CURRENT lens discharges the debt of the run it re-runs, closed with the discharging run's id and lens pins (any other lens discharges nothing); (2) a member's resolve with a REQUIRED stated reason, authored, attributed, dated, append-only, riding the task-resolve path or its equivalent.* — owner RECORD.
status: running — SPAWNED 2026-09-24 ~21:30Z by SCHEDULER #19 (dispatch, BOB #33 21:10Z) as a SEPARATE CLOUD SESSION titled WORKER REC-207 (SCHEDULER #19), base origin/main 1a7f0bcc0. Falsify rather than believe: a live worker holds the branch land/worker/REC-207; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH and that session, and never conclude queued from the absence alone.
order: behind D-86's train, as ruled; with the M4 bias rows (SCHEDULER #17, 2026-09-23)
milestone: M4
interface: I3 — the discharge on the obligation and the resolve act; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` (bias debt), with BOB #32's ruling of 2026-09-23 23:42Z (cite until folded into Declared Bias "Bias debt, and HUNCH DEBT" and NOTIFICATIONS); DEC-24 (derived informs, authored binds) and DEC-69 (a member is never forced).
depends-on: D-86 (`integrated` on c17-batch7).
scope: the re-run discharge recording the discharging run's id and lens pins; the member's resolve with a required reason; the lens moving back stays a third discharge.
accepts-when: a re-run under the current lens closes the obligation naming that run; one under another lens leaves it open; a resolve without a reason is refused by name. NEGATIVE CONTROL: discharge on any re-run, and the other-lens arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-468 · integrated — **A BIAS SET ACCEPTS `adopted` → `proposed`: promote does not enforce the STATES edges against the head, so a revision can move backwards.** Found by REC-187's worker (F4). — owner RECORD.
status: integrated — CONDUCT #20 verified 23:45Z, tip 9045c3e4, for c20-batch28
order: after REC-207, with the bias rows: a correction to a built state machine (SCHEDULER #17, 2026-09-24; REC-187's worker via CONDUCT #19)
milestone: M4
interface: I3 — one refusal; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption".
depends-on: REC-187 (`integrated` on c19-batch9).
scope: promote checks each bias-set transition against the declared STATES edges from the current head and refuses any other by name.
accepts-when: `adopted` → `proposed` is refused by name; every declared edge still passes. NEGATIVE CONTROL: drop the edge check, and the backwards arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### REC-205 · integrated — **A PROJECT-SCOPED FINDING CANNOT JOIN A QUEUE SELECTION: its act names a project per item, so D-126's set has no way to carry one.** — owner RECORD, then UI.
status: integrated — CONDUCT #20 verified 23:45Z, tip 535294c7, for c20-batch28; UI half is UI-110
order: after UI-94 (SCHEDULER #17, 2026-09-23; D-126's worker)
milestone: M8
interface: I3 — the set act carries each item's project; the integrator mints and classifies the IC.
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class".
depends-on: D-126 (`integrated` on c17-batch7).
scope: the set act admits project-scoped items, each resolved against its own project.
accepts-when: a selection mixing a project-scoped finding and a condition is handled in one act. NEGATIVE CONTROL: drop the per-item project, and the mixed-selection arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-448 · integrated — **ELEVEN REVIEW-COPY REFUSAL CODES REACH A MEMBER WITH NO CANNED TRANSLATION: UI-68's surface now shows `REVIEW_NOT_PROJECT_OWNER`, `REVIEW_NO_PROJECT`, `REVIEW_DRAFT_CHANGES_PROJECT`, `REVIEW_NO_SUCH_CASE`, `REVIEW_DRAFT_TOO_LARGE`, `REVIEW_NO_RECIPIENT`, `REVIEW_NO_SECRET`, `REVIEW_NO_GRANT`, `REVIEW_NO_COMMENT_TEXT`, `REVIEW_UNKNOWN_ACT` and `NO_REVIEW_COPY`, and none has a DEC-49 row.** — owner RECORD.
status: integrated — SCHEDULER #21 23:45Z: tip 5eadd905; first gate RED then fixed, NO recorded GREEN; D-542 placed from it
order: after D-445: a correction to just-landed work (UI-68) that shows members untranslated codes (SCHEDULER #17, 2026-09-23; REC-149's and UI-68's workers via CONDUCT #18 22:47Z)
milestone: M10
interface: none — a check family and its translations.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4 (the review copy), with DEC-49's translation rule.
depends-on: UI-68 (`integrated` on c17-batch7).
scope: a review-copy `*_CHECKS` family in `bio-checks.mjs` with DEC-49 regions and one canned sentence per code. Separately worth weighing: `check-refusal-codes.mjs` learning reach-by-op, since its R2 cannot see a code no surface names.
accepts-when: the refusal-code census reads every one of the eleven as translated. NEGATIVE CONTROL: drop one code's region, and the census arm names it.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### M0-188 · integrated — **THE GATE'S OWN REMEDY NAMES THE ONE-BUNDLE COMMAND: `verifyStatic` in `bio-plane/scripts/fleet-bundle.mjs` ends its staleness findings with "Run `npm run build` in <dir>/." at nine sites, so a worker following it rebuilds one bundle and meets the next stale one in the next gate.** Found by M0-178's worker (F1; with F2 and A6). — owner FLEET (the path), M0.
status: integrated — SCHEDULER #21 00:10Z: TIP MOVED to c0351eaf (merges 8bdf20e6; REGISTER_FLOOR.arms union 2181); 360/360 GREEN on the pre-merge tree; supersedes 71b663a7
order: at the backlog head before D-512, AHEAD of the product rows: a wrong remedy in a gate message costs a red round per stale member (Bob's 17:41Z rule) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 20:02Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a gate's message names the act that fixes it), with M0-178's `tools/bundles.mjs`.
depends-on: M0-178.
scope: replace the nine sentences with "Run `node tools/bundles.mjs`, which rebuilds every bundle this change staled."; re-read `fleetbundles.test.mjs`'s quoted assertions; point FRAMEWORK.md's docprofile line at the same command (F2); add `tools/bundles.mjs` to `m041-instrument-census.mjs`'s INSTRUMENTS (A6).
accepts-when: no staleness finding names `npm run build` (the measured failure it moves: nine sites naming the one-bundle command). NEGATIVE CONTROL: restore one site's old sentence and the fleetbundles quoted-remedy arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### D-512 · integrated — **`replay` IS HONOURED WITHOUT SERVER VERIFICATION: the end state BOB #33 ruled is that a replayed promotion of any type or revision names its drive-provenance capture, whose held bytes' preserved promotion record lists this bundle and this revision's `bundle.md` SHA-256.** — owner RECORD.
status: integrated — SCHEDULER #21 23:52Z: tip c8246cb1, idle since 23:23; NO recorded N/N GREEN
order: after D-511, which it builds on (BOB #33, 17:05Z: *the end state, a build that depends on (1)*; SCHEDULER #18)
milestone: M7
interface: I3 — the integrator classifies.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 "The RUN is an object", item 5 as BOB #33's ruling states it (folded on main e9b21be6), with REC-173's `migrationReplayOf`.
depends-on: D-511.
scope: generalise `migrationReplayOf` to every replayed promotion; keep D-511's class test as a second condition.
accepts-when: a replay whose capture does not list the bundle and SHA-256 is refused by name; a verified one is admitted. NEGATIVE CONTROL: skip the verification and the unverified arm is admitted, failing by name. AND INVERT §8 arm (δ), which D-511 pinned as the gap (admin-class replay still caller-asserted; via CONDUCT #20 19:47Z).
added: 2026-09-24 · SCHEDULER #18 (BOB #33 inbox 17:05Z; `node tools/mintid.mjs D`).

### D-528 · integrated — **THE QUEUE TELLS EACH NAMED RECIPIENT OF A BIAS-DEBT OBLIGATION "This is not addressed to anybody": `app.html` `queueAssigneeHtml` reads `assignee == null` and never `recipients`, so the surface states something it can see is false.** Found by UI-93's worker (id minted by it). The DELEGATION RECORD (D-86) → UI on coord `CLAIMS.md` is dischargeable by this row. — owner UI.
status: integrated — SCHEDULER #21 23:45Z: tip 85eb32dc; idle since 22:55 'verifying control driver placement', NO recorded GREEN
order: after D-512, with the corrections: a surface stating a falsehood about the record is worse than a missing feature (CLAUDE.md §2) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 21:06Z)
milestone: M8
interface: I3 consumer (IC-234).
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class", with `docs/architecture/BIO_Declared_Bias_v0_1.md` (bias debt).
depends-on: UI-93.
scope: when `recipients` is non-empty, render the members the record named; keep "not addressed to anybody" only when both are empty; discharge the D-86 → UI delegation.
accepts-when: an obligation with named recipients shows them, against a real-plane suite (the measured failure it moves: "not addressed to anybody" to a named recipient). NEGATIVE CONTROL: read `assignee` alone again and the named-recipient arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (placed; `D-528` minted by UI-93's worker).

### D-530 · integrated — **`op=attest` REFUSES A PARTED CAPTURE NO_SUCH_CAPTURE, a false statement that tells a member to re-capture a document the record holds: its pre-flight (index.mjs ~9194) heads only `captures/<whole sha>`.** The ratify gate's `hasCapture(sha)` may answer `{present:false}` off the same whole-key head (not yet driven). Found by D-476's worker (B, C). — owner RECORD.
status: integrated — SCHEDULER #21 23:52Z: tip 16b72652; NO recorded N/N GREEN; CATALOG 1.29.0 unions with D-448/D-512/D-521; design recommendation sent to BOB #34
order: after D-528, with the corrections: a refusal that says a held document is absent (CLAUDE.md §2) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 21:06Z)
milestone: M2
interface: I3 — the refusal changes, or attest succeeds; the integrator classifies.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (one capture, one home), with D-476's whole-document lookup (`registerholds`).
depends-on: D-476.
scope: attest asks the whole-document question (`registerholds`) and attests the hash, or refuses by a code that says why (CAPTURE_HELD_IN_PARTS); FIRST drive the ratify gate's `hasCapture` on a parted capture and fix it the same way if it reads absent, stating the result either way.
accepts-when: attesting a held parted capture succeeds or is refused CAPTURE_HELD_IN_PARTS, never NO_SUCH_CAPTURE, and the ratify gate's reading is recorded (the measured failure it moves: NO_SUCH_CAPTURE for held bytes). NEGATIVE CONTROL: restore the whole-key head and the parted-attest arm reads NO_SUCH_CAPTURE by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### REC-217 · integrated — **A RECIPIENT'S READING ON A NEW CASE'S DRAFT CANNOT BIND TO THE CASE IT PRODUCED: nothing links a draft to its published case, so REC-194's provisional counts such a reading UNDETERMINED.** BOB #33 RULED 2026-09-24 19:14Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #20): `op=publish` names the draft it publishes (`draft=`, optional, additive), and at that act the readings taken through that draft BIND to the case it produced — an ACT, recorded with the publisher and the time, stated in words in the case document. — owner RECORD.
status: integrated — SCHEDULER #21 23:45Z: tip 727a1d85; BLOCKED only on reporting (depth 8), NO recorded GREEN
order: after UI-106 and before D-521, as BOB ruled: *one RECORD row after REC-194 … place C-82.1's retirement as a small row after this one* (SCHEDULER #20, 2026-09-24)
milestone: M10
interface: I3 additive — `draft=` on `op=publish`, the stated link on the case document; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rules 11 and 13 and the §9 frontier row "a draft bound to the case it produced", with BOB #33's ruling of 19:14Z, which this row FOLDS into §3 and closes in §9 in the same landing.
depends-on: REC-194.
scope: `draft=` on `op=publish`; the bind recorded with who and when; the case document states "readings given on draft <id>, which <publisher> named as this case's draft at publication"; the signed list carries those readings; without `draft=` REC-194's undetermined count stands.
accepts-when: a recipient's reading on a new case's draft appears in the published case's signed list with the link stated, and a publish without `draft=` still reads undetermined (the measured failure it moves: every such reading undetermined). NEGATIVE CONTROL: bind by statement bytes instead of the named draft, and a twin case with the same sentence lists the reader, failing by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs REC`).

### D-552 · integrated — **`op=instance` RENDERS A FINDING A MEMBER ALREADY DISMISSED AND SAYS NOTHING ABOUT THE DECISION: `#assembleInstance` (store.mjs ~25693) never consults `proposal_dispositions` (the disposition read lives in `proposalsFeed`), and civicos-ui `progPaintInstance()` renders `inst.findings` verbatim, so a dismissed finding reads as an open question on the progression page.** Against D-79 (a decision AGES a finding and is never silently absent). Found via D-527's integration (CONDUCT #20 22:34Z). — owner RECORD, then UI (UI-108).
status: integrated — SCHEDULER #21 23:45Z: tip da6fdb8a; suite 5/5 and control stated, NO recorded battery GREEN; no report (depth 8)
order: after D-540, with the corrections: a live surface stating an answered question as open (CLAUDE.md §2) (SCHEDULER #20, 2026-09-24; via CONDUCT #20 22:34Z)
milestone: M4
interface: I3 additive — a per-finding disposition view on two ops; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2 (a decided proposal carries its decision) and §12 "age rather than vanish" (D-79).
depends-on: REC-184.
scope: `op=instance` and `op=captureprogressions` publish, per finding, the view `#dispositionVersionView` already computes (state, reason, author, instant, definition_version, applies). It is PUBLISHED, never used to hide a finding.
accepts-when: a dismissed finding on `op=instance` carries its disposition view with author and reason, and is still listed (the measured failure it moves: the decision absent from the instance read). NEGATIVE CONTROL: drop the view from `#assembleInstance` and the dismissed-finding arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (id minted by CONDUCT #20).

### D-533 · integrated — **`op=registeraudit` CALLS A PARTED CAPTURE'S BYTES MISSING AND THE RECORD UNSOUND: it heads only `captures/<whole sha>` (measured `unbacked: 1, sound: false`).** Found by D-476's worker (A). BOB #33 RULED 2026-09-24 21:17Z (cite until folded): YES — `sound` reads true for a row held IN PARTS when every part the record names is present, each part's digest verified; a fourth state "held in parts, all present"; a missing part is named; a row resolving neither way reads UNDETERMINED, counted OUTSIDE `sound`, never inside it. — owner RECORD.
status: integrated — SCHEDULER #21 23:52Z: M-150 on branch states GATE 78/78 GREEN at 74f514dd; tip d7f8a372 adds only M-150 (the report); D-556 minted, routed to BOB (conflicts with D-530's gate ruling)
order: after D-530, with the corrections: an audit calling held bytes missing (CLAUDE.md §2) (BOB #33, 21:17Z; SCHEDULER #19, 2026-09-24)
milestone: M2
interface: I3 — a fourth audit state; the integrator classifies.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (one capture, one home), with BOB #33's ruling of 21:17Z, which this row FOLDS into §8 in the same landing.
depends-on: D-476.
scope: head each part the record names and verify each part's digest; the fourth state; a missing part named; unresolvable rows UNDETERMINED outside `sound`.
accepts-when: a fully held parted capture audits "held in parts, all present" with `sound: true`, one missing part is named and makes `sound` false, and an unresolvable row is counted outside `sound` (the measured failure it moves: `unbacked: 1, sound: false` for held bytes). NEGATIVE CONTROL: head the whole key only and the parted arm reads unbacked, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-536 · integrated — **A READING DOES NOT CARRY ITS OWN PROVENANCE, so a re-read that returns different text is silent: nothing records the tier, the member that produced it, the pages transcribed, or a digest of the exact text classified.** FW-22's worker (finding 2, via CONDUCT #20). BOB #33 RULED YES 2026-09-24 21:25Z (cite until folded): a reading carries tier, producing member, pages transcribed and a SHA-256 of the exact text it classified; a re-read is compared to the earlier one and a disagreement is ATTRIBUTED ("tier 2 on ocr-worker returned different text for pages 3-4"); both readings are kept, neither overwrites; a reading from before this lands reads provenance UNDETERMINED, never inferred. Until it lands, M-143's rule stands (compare census runs only on tier 1 or on named documents). — owner CONTENT-PDF, then RECORD.
status: integrated — SCHEDULER #21 00:40Z: tip 61dff564 (M-152), NO recorded N/N GREEN (depth 8, idle 00:29); D-557 placed
order: after D-533, in product order (BOB #33, 21:25Z: *after D-533*); the record's readings becoming attributable ahead of the risk-tier feature trio (SCHEDULER #19, 2026-09-24)
milestone: M2
interface: I5 — the reading's provenance columns; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with BOB #33's ruling of 21:25Z, which this row FOLDS into §16 in the same landing.
depends-on: FW-22.
scope: record tier, producing member, pages transcribed and the text's SHA-256 on each reading; compare a re-read and attribute any disagreement; keep both; legacy readings read provenance undetermined.
accepts-when: a re-walk of D-66's sample reports, for each document whose class moved, which tier's text changed (the measured failure it moves: a silent re-read). NEGATIVE CONTROL: drop the text digest and the attribution arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### REC-214 · integrated — **NO MEMBER CAN SET OR REVISE AN ACTION'S RISK TIER AFTER INTAKE, AND A REVISION WOULD LEAVE NO TRACE.** BOB #33 RULED 2026-09-24 (sent 21:18Z; recorded in the inbox entry of 21:55Z) (UI-101's design gap; cite until folded): the `actionrisktier` op, not yet on main (member class, `contribute`), writing through the one front-matter path every reader derives the tier from; a machine credential is refused with the existing MACHINE_CANNOT_SET_RISK_TIER; a member MAY revise any tier, up or down, as an AUTHORED act recording who, when and a REQUIRED reason; APPEND-ONLY — the prior tier, its author and reason stay readable in the action's tier history; never a silent overwrite. — owner RECORD.
status: integrated — SCHEDULER #21 00:16Z: tip e5bae509, report blocked at depth 8, NO recorded GREEN
order: after D-533, first of the risk-tier trio in product order (plane, then UI-104, then REC-215), as BOB ruled; the field carries legal exposure, so the record must show a "do not file without counsel" was changed and by whom (SCHEDULER #19, 2026-09-24)
milestone: M7
interface: I3 additive — a new op and a tier history; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`action` is the impact substrate; `risk_tier`), with BOB #33's risk-tier ruling (sent by message 21:18Z, cited elsewhere as "21:21Z"; RECORDED in the BOB INBOX entry of 21:55Z, drained to `BOB-INBOX-drained.md` by SCHEDULER #20), which this row FOLDS into §2 in the same landing.
depends-on: D-510.
scope: the op; the append-only tier history on the action's read; "revised from 3 (by X) to 1 (by Y): <reason>" readable; a revision with no reason refused by name (catalogued, DEC-49).
accepts-when: a member's revision appends history naming both authors and the reason; a reasonless revision is refused by name; a machine is refused MACHINE_CANNOT_SET_RISK_TIER (the measured failure it moves: no revision path at all). NEGATIVE CONTROL: let a revision overwrite without history and the history arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs REC`).

### M0-194 · integrated — **`kickoffs/WORKER.md`, READ BY EVERY WORKER, CARRIES EACH RULE'S HISTORY INLINE (3,959 words), so the current rule is buried and a ruling can go unread: tonight three workers were misled, and BOB #33's 17:12Z pen ruling never reached the file.** BOB #34 22:50Z. — owner M0 (BOB drafts; any worker may land it).
status: integrated — SCHEDULER #21 23:45Z: tip 3325a474 (merges land/bob/batch-0924f); summary 'checks pass', NO recorded N/N GREEN; no report (depth 8)
order: at the head of the backlog, AHEAD of product (BOB #34 22:50Z: *it appreciably cuts wasted worker rounds: three sessions were misled tonight*) (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the reading budget: a file read whole is sized to be read whole), with CLAUDE.md §1's READING BUDGET and BOB #34's ruling of 22:50Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #20).
depends-on: none.
scope: rewrite WORKER.md so each rule is one or two lines naming its ruling id; move the receipts and narratives VERBATIM to `docs/archive/WORKER-kickoff-2026-09-24.md`, where `decided.mjs` finds them; nothing deleted; set its readbudget to half of 3,959 words. The current pen rule (BOB #33 17:12Z: a driver's gitignored, item-named pen is not scratch) and `store=scratch` (BOB #34 22:22Z: redundant, not optional) must be stated. Other kickoffs follow one at a time only if this measurably cuts misreads.
accepts-when: `readbudget` shows WORKER.md at or under the new budget, `decided.mjs` still finds every ruling it cited, and every old rule maps to a new line (a table in the row's measurement) (the measured failure it moves: a 3,959-word file burying current rules). NEGATIVE CONTROL: drop one mapped rule and the mapping table names it.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs M0`).

### D-545 · integrated — **`civicos-ui/check-semantics.mjs` (~352) HARVESTS PLANE STATES OVER THE RAW STORE FILE, COMMENTS INCLUDED, with `/current_state\s*[!=]==?\s*"([a-z_]+)"/`, so a `typeof` guard on that field is read as a state named after the typeof string, and the gate goes RED with "states the store writes with no semantics row" naming a state nobody wrote.** It cost REC-210 two full gate rounds, the second from a comment quoting the pattern (CONDUCT #20 22:57Z). — owner UI (the check), M0.
status: integrated — SCHEDULER #21 23:45Z: tip a812be34, summary states 71/71 green; no report (depth 8)
order: after M0-194, AHEAD of product: a false RED that has already cost two full gate rounds (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument names what it read, and a false red is a defect in the instrument).
depends-on: none.
scope: blank comments before harvesting; refuse a match preceded by `typeof` or whose right-hand side is not a catalogue state, and report it as an UNRECOGNISED MATCH, never as a state. Apply the same two guards to the `#setScalar` harvest beside it.
accepts-when: a planted `typeof x.current_state === "string"` guard and a commented-out quote of the pattern leave the state set unchanged and are reported as unrecognised matches (the measured failure it moves: a RED naming a state nobody wrote). NEGATIVE CONTROL: harvest the raw file again and the planted guard is read as a state, failing by name.
added: 2026-09-24 · SCHEDULER #20 (id minted by CONDUCT #20).

### D-549 · integrated — **NO_PUBLISHED_STORE ON THE PUBLIC `op=publishedbytes` AND `op=publishedcase` REACHES AN ANONYMOUS CALLER UNTRANSLATED: it is minted at two sites (`index.mjs` ~5747 a literal, ~5900 a ternary shared with OBJECT_MISSING; main 9f8b69e6), has no DEC-49 translation, and `app.html` names it 0 times, so the public reads a machine token.** Found by D-513's worker (via CONDUCT #20 22:59Z). — owner RECORD.
status: integrated — SCHEDULER #21 00:40Z: tip afcf1128, NO recorded N/N GREEN (depth 8, COMPLETED); CATALOG 1.29.0 unions; D-561 placed, D-562 rides D-542
order: after D-540, with the corrections: a public door answering in machine vocabulary (D-484's settled shape; CLAUDE.md §2) (SCHEDULER #20, 2026-09-24)
milestone: M10
interface: I3 — a translation added and a mint site consolidated; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, in D-484's settled shape (one governed helper, one region, one condition).
depends-on: none.
scope: one governed helper and DEC-49 region minting NO_PUBLISHED_STORE for ONE condition, with its canned translation; the ~5900 ternary says which code it mints under which condition. Move each refusal-code floor to its printed figure.
accepts-when: both public ops answer NO_PUBLISHED_STORE with its translation from one site (the measured failure it moves: an untranslated code at two sites). NEGATIVE CONTROL: restore the literal at ~5747 and check-refusal-codes names the second site.
added: 2026-09-24 · SCHEDULER #20 (id minted by D-513's worker).

### D-558 · integrated — **`bio-plane/test/ratify.test.mjs` (~240) PINS THE CATALOGUE VERSION AS A LITERAL, `"plane-gate/1.0 (bio-checks 1.28.0)"`, so every catalogue bump turns it red and it has been hand-corrected at each (five CORRECTED notes above it).** Found by D-544's and M0-192's workers independently. — owner M0.
status: integrated — SCHEDULER #21 23:45Z: tip d614da45, commit states GATE 74/74 GREEN (TARGETED); worker could not report (depth 8)
order: after D-545, AHEAD of product: the same bump-cost class as D-544 and M0-192, a red round on every catalogue move (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a suite pins what its claim asserts, read from the source, never a literal).
depends-on: none.
scope: build the expected string from `CATALOG_VERSION` imported from `bio-plane/src/gate.mjs`; keep the arm's point (the ratification records the CATALOGUE's version, not the gate's own) with a second arm that fails if the gate's own version is recorded instead; sweep `bio-plane/test/` for any other literal catalogue version and state each.
accepts-when: a catalogue bump leaves the suite green, and recording the gate's own version fails by name (the measured failure it moves: a red on every bump). NEGATIVE CONTROL: record `plane-gate/1.0` alone and the catalogue-version arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs D`).

### D-521 · queued — **IC-246's STATEMENT_ACK_DOCUMENTS_OVER_BOUND (C-82.1) IS UNREACHABLE BY CONSTRUCTION: after REC-194 its read names (case_id, edition), `case_documents`' primary key, so at most one row returns and the bound can never fire.** Found by REC-194's worker (F1). — owner RECORD.
status: queued — SCHEDULER #21 02:09Z: RETURNED from batch28 by CONDUCT #21 (tip 31501f1b not merged): REC-217 widened op=statementack's read to (case_id IS ? OR draft_id = ?), so 'at most one row by construction' must be RE-DERIVED on the union. HELD until batch28 lands; then re-spawn on main, rebased over REC-217
order: after REC-213, with the corrections to just-landed work: a catalogued refusal that cannot occur is a claim the record makes about itself (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:16Z)
milestone: M10
interface: I3 — a catalogued code retired; the catalogue version moves; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, with `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13.
depends-on: REC-194.
scope: collapse the read to `#one`; remove the bound, C-82.1, its DEC-49 region `is-statement-ack-documents-bound` and block 8's bound arms; move each refusal-code floor to its printed figure.
accepts-when: C-82.1 and its region are gone and the census floors read their printed figures (the measured failure it moves: a code no input can reach). NEGATIVE CONTROL: restore the region without its reachable site and check-refusal-codes names the orphan.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-524 · integrated — **A MONITORED BUNDLE WITH AN ARCHIVE-SOURCED BASELINE READS "no captured baseline" FOREVER: `op=acquire` sets `body.locator = sel.replay`, so the register row names the Wayback replay URL while the capture files under the CDX original, and op=monitor's register lookup never finds it.** D-472's defect surviving on the ARCHIVE arm; found by D-472's worker (F1). — owner CAPTURE.
status: integrated — SCHEDULER #21 00:16Z: tip 69c16607, GATE 361/361 GREEN; worker could not report (depth 8)
order: after D-521, with the corrections to just-landed work: a monitor that reads no baseline where one is held (CLAUDE.md §2) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 20:14Z)
milestone: M3
interface: I5 additive — `archiveHop` gains `document_address`; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6 (the monitoring contract), with D-472's Drive arm as the precedent.
depends-on: D-472.
scope: give `src/cdx.mjs` `archiveHop` a `document_address` key as `driveHop` has; op=monitor's register lookup prefers the row whose hop names the bundle's locator.
accepts-when: an archive-sourced baseline is found by op=monitor and two unchanged ticks read `unchanged` (the measured failure it moves: "no captured baseline" on every tick). NEGATIVE CONTROL: drop the hop key and the archive-baseline arm reads no baseline, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-525 · integrated — **A PRE-CAP-8 DRIVE BASELINE IS A CAPTURE OF GOOGLE'S SHELL, so its monitor reads `modified` on every tick permanently, and nothing lists which bundles carry one.** Found by D-472's worker (F3). — owner CAPTURE.
status: integrated — SCHEDULER #21 01:50Z: tip 9f11da8c (CONDUCT #21 01:47Z composing batch28 with it)
order: after D-524, the same monitor path; low: the fix is a re-acquire (SCHEDULER #19, 2026-09-24; via CONDUCT #20 20:14Z)
milestone: M3
interface: none unless a read is added (the integrator classifies).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6, with CAP-8's Drive export arm.
depends-on: D-472.
scope: a sweep listing Drive-address bundles whose baseline capture's handler is an HTML stack (a shell); re-acquire each through the export address, recorded as a new capture, never overwriting the old.
accepts-when: the sweep names every shell baseline and a re-acquired one reads `unchanged` across two ticks (the measured failure it moves: a permanent `modified`). NEGATIVE CONTROL: skip the re-acquire and the two-tick arm reads `modified` by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-526 · integrated — **WHICH REFUSAL A CALLER MEETS ON `op=promote` STILL DEPENDS ON THE ENVELOPE: the fences above bundle.md's parse (NAME_TAKEN, CITED retirement, LAWS_ACT carry-forward) read the envelope's type, and `#projectRow`'s action columns compare `fm.object_type === "action"` raw, not through `normalizeType`. Nothing wrong can land (D-510's fence refuses it).** Found by D-510's worker (F1, F3). — owner RECORD.
status: integrated — SCHEDULER #21 00:49Z: tip d1622057, GATE 92/92 GREEN (FULLREUSE); refusals change on the wire (5 promotions that landed now refused); no IC minted
order: after D-525, with the promote corrections: the answer a caller meets should not depend on a label D-510 ruled untrusted (SCHEDULER #19, 2026-09-24; via CONDUCT #20 20:25Z)
milestone: M7
interface: none unless a refusal's order changes on the wire (the integrator classifies).
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5 and D-510's derivation.
depends-on: D-510.
scope: parse bundle.md at the top of promote's `act` and derive the type there for every fence; route `#projectRow`'s comparison through `normalizeType`.
accepts-when: an envelope-mislabelled action meets the same refusal as a correctly labelled one (the measured failure it moves: fences reading the envelope's type). NEGATIVE CONTROL: read the envelope's type in one fence again and that arm's refusal differs, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### M0-170 · integrated — **THREE MORE FIXTURES KEEP HAND-KEPT TOOL COPY LISTS: `pushguard.test.mjs` scratchRepo, `pushguard-check.test.mjs` and `retirable.test.mjs` (measured correct today).** Found by M0-154's worker. — owner M0.
status: integrated — SCHEDULER #21 00:16Z: tip e3b35a26, GATE 73/73 GREEN (TARGETED); D-566 minted, report pending
order: after M0-169, whose static mode it wires (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:50Z) AHEAD of the product rows by Bob's 17:41Z rule: a new import in gates.mjs breaks a hand-copied fixture with a false red (a false gate result costs a round) (SCHEDULER #19, 2026-09-24).
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a fixture derives what it carries).
depends-on: M0-169.
scope: wire the three to M0-169's static-only mode; delete the hand lists. ALSO (M0-169's F3, via CONDUCT #20 19:37Z): `bio-plane/test/instrument-deps.mjs` (D-265) calls `moduleClosure({ dynamic: false })` and maps to basenames, keeping its `outside` check (coverage-provenance, owed-controls, m051-driver-census).
accepts-when: an import added to the subject leaves all three green. NEGATIVE CONTROL: restore one hand list, add an import, and that suite fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### D-541 · integrated — **`tools/rowsubstrate.mjs` `anchorPairs` CAPTURES DIGITS AND DOTS ONLY (`§\s*(\d+(?:\.\d+)*)`), so `§6A` reads as `6`, and D-404's design-coverage arm falsely notes "substrate not evident" for REC-213, REC-199 and D-448.** Found by REC-213's worker (via CONDUCT #20 22:11Z). A false NOTE, not a failure. — owner M0.
status: integrated — CONDUCT #20 verified 00:16Z: a3d2c566, 73/73 GREEN, A7 as declared; rides c20-batch28; finding 2 dropped (no instance)
order: after M0-142, with the process rows behind the product rows ahead of them: it prints a false note but fails nothing, so it does not cut gate time (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument states what it reads, never a neighbour of it).
depends-on: none.
scope: capture `(\d+(?:\.\d+)*[A-Za-z]?)`, compute depth from the dotted part, and escape the letter in `sectionText`.
accepts-when: rowsubstrate reads REC-213's `§6A` as §6A and the three false notes are gone (the measured failure it moves: three rows noted "substrate not evident"). NEGATIVE CONTROL: restore the digits-only capture and the §6A arm reads §6, failing by name.
added: 2026-09-24 · SCHEDULER #20 (id minted by REC-213's worker).

### D-550 · integrated — **NO GATED INSTRUMENT HOLDS A CATALOGUED REFUSAL CODE TO ONE MINT SITE: `bio-plane/test/dec49-onecode-twoconditions.sweep.mjs` measures it (60 multi-site candidates today) but has no floor, ceiling or gate, so a new second site passes silently.** Found by D-513's worker (via CONDUCT #20 22:59Z). — owner M0 (the instrument).
status: integrated — SCHEDULER #21 00:43Z: tip 0c19c1fe, GATE 86/86 GREEN (FULLREUSE); ceiling 59 (62 less 3 closures; the row's 60 was stale)
order: after D-535, with the process rows behind the product rows: it prevents a regression and does not cut gate time (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a measurement that gates nothing is not an instrument), with DEC-49's one-code-one-condition rule as D-484 settled it.
depends-on: none.
scope: a gated CEILING arm in check-refusal-codes' ratchet shape at the printed count of multi-site codes, with the deliberate closures declared BY NAME (RATE_IP and RATE_GLOBAL, VERSION_ACT_UNWRITABLE); the ceiling only moves down.
accepts-when: the gate reads the ceiling at its printed figure, and a planted second mint site of a single-site code fails by name (the measured failure it moves: 60 candidates, none gated). NEGATIVE CONTROL: plant the second site, and the ceiling arm fails naming the code.
added: 2026-09-24 · SCHEDULER #20 (id minted by D-513's worker).

### D-559 · integrated — **TWO NEGATIVE-CONTROL HARNESSES HAVE DECAYED (D-353 decay mode c), on origin/main as on the branches: `nc-rec66.mjs` ARM 1 throws "anchor is not unique" on `const scan = this.#rows(` (store.mjs now holds more than one such line), and `nc-rec129.mjs` reports 10 of 19 arms "DID NOT ARM" with every restore byte-identical.** Found by M0-182's worker (via CONDUCT #20 23:00Z). — owner M0.
status: integrated — SCHEDULER #21 00:12Z: tip e3d62fa3, GATE 74/74 GREEN recorded; 5 unarmed arms not 10 (double count fixed); merges clean with M0-182
order: after D-550, with the process rows behind the product rows: the controls fail loudly rather than pass falsely, so no gate result is wrong today (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register" (a control must arm on the tree it runs on).
depends-on: none.
scope: re-anchor each arm on the current source, one unique anchor per arm, then run each control AS DECLARED and record it on its suite's NEGATIVE CONTROL line.
accepts-when: `nc-rec66` arms all arms and `nc-rec129` arms 19 of 19 AS DECLARED (the measured failure it moves: one throw and 10 unarmed arms). NEGATIVE CONTROL: the harnesses are the controls; re-run each whole and record the counts.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs D`).

### D-537 · integrated — **M0-37'S CONTROL HAS NOT RUN SINCE THE COORD CUTOVER: `bio-plane/test/delegations.control.mjs` reads and writes `docs/development/CLAIMS.md` FROM THE WORKTREE, which since M0-110 is a 218-byte coord-pointer stub, so its byte floor refuses at the first arm (on origin/main too).** Found by M0-182's worker (via CONDUCT #20 23:00Z). — owner M0.
status: integrated — SCHEDULER #21 00:16Z: tip fa40a31a, GATE 72/72 GREEN (TARGETED); D-565 minted, report pending
order: after D-559, with the process rows behind the product rows: a control that cannot run is loud, not a false green (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register", with TREE-SHARING.md §1's coord files (M0-110).
depends-on: none.
scope: read and write CLAIMS.md through `tools/coord.mjs` readState/writeState, as `tools/delegations.mjs` already does, on a planted local coord ref, and floor the byte count on the coord content.
accepts-when: the control runs every arm AS DECLARED against the coord content (the measured failure it moves: refused at the first arm by the stub's byte floor). NEGATIVE CONTROL: point the read back at the worktree path and the byte-floor arm refuses by name.
added: 2026-09-24 · SCHEDULER #20 (id minted by M0-182's worker).

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

### D-547 · integrated — **A PROMOTE REVISION CAN RETYPE A BUNDLE IN PLACE: `#projectRow`'s write (store.mjs ~17747, `const projectedType = promotedType`) never compares the new type with `cur.object_type`, so after a retyping revision every type-scoped fence asks the wrong machine.** Found by D-468's worker (via CONDUCT #20 23:45Z). — owner RECORD.
status: integrated — SCHEDULER #21 01:37Z: tip a1a56e0a CARRIES D-526 (d1622057); GATE 362/362 GREEN; M-156 retype census 0/31 bio, 0/17 scratch; new governed region; CATALOG 1.29.0 unions
order: before D-538, at the head of the backlog with the promote corrections: a record whose type silently changes under its own fences claims more than it can support (CLAUDE.md §2), and it outranks new features (SCHEDULER #21, 2026-09-24)
milestone: M7
interface: I3 — a new refusal code on op=promote; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5 and D-510's derivation, and DEC-49 for the refusal's canned translation.
depends-on: D-510.
scope: FIRST read the corpus (bio and scratch registers) for revisions that already retyped a bundle and state the count in `measurements/<id>.md`; then refuse a revision whose derived type differs from the head's by name, with a DEC-49 catalogue row; a bundle already retyped is reported, never rewritten.
accepts-when: a revision that retypes an existing bundle is refused by its named code and the bundle's type is unchanged (the measured failure it moves: projectedType written with no comparison). NEGATIVE CONTROL: drop the comparison and the retype arm lands the new type, failing by name.
added: 2026-09-24 · SCHEDULER #21 (id minted by D-468's worker).

### D-548 · integrated — **`bio-plane/test/d84-case-manifest.test.mjs` HAS NO `block()` RECORDER, so one fixture failure ends the run and every later section goes unmeasured.** Found by D-468's worker (via CONDUCT #20 23:45Z). — owner RECORD (the suite).
status: integrated — SCHEDULER #21 00:34Z: tip 281a96eb, GATE 83/83 GREEN (TARGETED); D-564 placed
order: after D-542, with the process rows behind the product rows: a suite that stops at its first failure hides later ones for a round, but no gate result is false (SCHEDULER #21, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a suite measures every arm it declares).
depends-on: none.
scope: adopt `bias.test.mjs`'s `block()` (one call per section) and report a missing tally as -1.
accepts-when: with one section's fixture broken, every other section still reports its tally (the measured failure it moves: the run ends at the first failure). NEGATIVE CONTROL: break one section's fixture and the run names that section failed while the others report.
added: 2026-09-24 · SCHEDULER #21 (id minted by D-468's worker).

### D-522 · integrated — **AN UNATTENDED RENDER THAT SUCCEEDS IS DRIVEN NOWHERE, AND THE MONITORING SWEEP (CAP-3) CANNOT SET THE RENDER FLAG, though BOB #32 ruled *an unattended sweep MAY render* within the allowance and through the governor.** D-491's residue (via CONDUCT #20 19:47Z). — owner CAPTURE.
status: integrated — SCHEDULER #21 00:23Z: tip f9599896, GATE 90/90 GREEN (TARGETED); NARROWED: CAP-3 writes no capture request; D-567 to BOB (design)
order: after D-520, with D-64's render rows: it waits on a renderer that can answer (SCHEDULER #19, 2026-09-24)
milestone: M3
interface: I3/I5 — the sweep's render request; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` "RULED 2026-09-23 by BOB #32: the method, the primary, and the unattended sweep" (item 3).
depends-on: D-490, D-491, DIST-11.
scope: the CAP-3 sweep sets `render` on a capture request for a source profiled client-rendered; drive an unattended render to SUCCESS through the drain with a stub renderer.
accepts-when: an unattended request for a client-rendered source completes as a rendered capture within the allowance (the measured failure it moves: a success path no suite drives). NEGATIVE CONTROL: drop the sweep's render flag and the success arm reads the shell, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-538 · integrated — **A DRAFT THAT NAMES NO CASE AND DOES NOT SET `newCase` IS TOLD "a new case, whose identity is not yet allocated", while `publishCase` DERIVES an existing case for it: REC-199's block 10 measured draft DD saying that sentence as its gates refuse ALREADY_A_CASE_MEMBER against C1.** `Store.#caseIdentitySentence(null, 1)` is shared by the casedraft, casedrafts (REC-198) and reviewcopy reads. Found by REC-199's worker (1). — owner RECORD.
status: integrated — SCHEDULER #21 01:06Z: tip 9833deb4, GATE 360/360 GREEN (FULLREUSE); FOUR sites print the sentence (reviewgrant boundTo too); I3 content change; conflicts textually with D-539 in reviewcopy test/control
order: after D-530, with the corrections: the record asserting a new case where it will derive an existing one (CLAUDE.md §2) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 21:43Z)
milestone: M10
interface: I3 — the identity sentence's content; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4 (the review copy), with BOB #32's 2026-09-23 23:08Z newCase ruling.
depends-on: REC-199.
scope: `#caseIdentitySentence` takes the draft's `newCase`; with no case named and `newCase` unset it states the derivation route, or UNDETERMINED, never a new case.
accepts-when: draft DD reads the derivation (or undetermined), not "a new case", in all three reads (the measured failure it moves: block 10's sentence). NEGATIVE CONTROL: ignore `newCase` again and the DD arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-539 · integrated — **A REVIEW COPY'S ROUND TRIP DEMOTES A LOAD-BEARING FINDING TO UNDESIGNATED: the absent-target branch of reviewCopy's `findings[]` (`{target, present:false, detail}`) drops `role`.** Found by REC-199's worker (2). — owner RECORD.
status: integrated — SCHEDULER #21 00:57Z: tip 5d59c84a, GATE 360/360 GREEN (FULLREUSE); findings in its report
order: after D-538, the same review-copy read: an edit round trip losing what the member designated (SCHEDULER #19, 2026-09-24; via CONDUCT #20 21:43Z)
milestone: M10
interface: I3 additive — `role` on one branch; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4 (the review copy).
depends-on: REC-199.
scope: carry `role` on the absent-target branch.
accepts-when: a round trip of a copy whose load-bearing finding's target is absent keeps its role (the measured failure it moves: the role dropped). NEGATIVE CONTROL: drop `role` again and the round-trip arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-543 · integrated — **THE RECORD STAMPS `at` AT TWO PRECISIONS, so a STRING compare across act kinds misorders: `…:00Z` sorts after `…:00.123Z`.** Found by REC-200's worker (F3, via CONDUCT #20 21:57Z), who measured `acknowledgeStatement` stamping without milliseconds while the review copy's other acts carry them. SCHEDULER #20 measured the store on main 9f8b69e6: 26 sites strip milliseconds (`toISOString().replace(/\.\d+Z$/, "Z")`) and the rest keep them, so the report's "every other act carries them" is false and the defect is the MIX. — owner RECORD.
status: integrated — SCHEDULER #21 01:32Z: tip 873815c2, GATE 361/361 GREEN; stampInstant/instantOrder helper, 61+5 sites one line each (union with D-531/D-538/D-539 by keeping both); acks now ms (I3)
order: after D-539, with the corrections to just-landed work: REC-200 orders a review copy's last change across kinds (SCHEDULER #20, 2026-09-24)
milestone: M10
interface: I3 — possibly a precision change on some `at` fields; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 (the copy carries the date of its LAST change), with D-516's ruling that `observation_log.at` STAYS whole-second (a named exception, not a site to change).
depends-on: REC-200.
scope: (1) SWEEP every site that orders or compares `at` values of different act kinds by string, and make each compare instants, not strings; (2) ONE stamping helper names the precision, used by every act that stamps, `observation_log` excepted by D-516's ruling; (3) state in the row's landing what the sweep's matcher cannot see.
accepts-when: an acknowledgement stamped `…:00Z` and a comment stamped `…:00.123Z` in one copy order by instant, and REC-200's last-change date names the later one (the measured failure it moves: the whole-second stamp sorting last). NEGATIVE CONTROL: restore the string compare, and the mixed-precision arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs D`).

### D-531 · integrated — **A WHITESPACE-ONLY CONTENT UNIT IS STILL EMITTED AND INDEXED AS CONTENT at two emission sites: `index.mjs`'s `arm` helper and `store.mjs`'s `capture_text` ordering filter on `u.text.length`, though §16's comment at that site says a unit with no text is not emitted.** D-514's class surviving at emission; found by D-514's worker (id minted by it). — owner CONTENT-PDF, then RECORD.
status: integrated — SCHEDULER #21 01:08Z: tip 478066df, GATE 112/112 GREEN; M-154; units written before D-531 stay until re-promoted (live count UNDETERMINED, no row)
order: after UI-106, with the corrections: the record indexing blank units as content (CLAUDE.md §2) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 21:46Z)
milestone: M2
interface: I5 — content-unit counts move; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with D-501's glyph rule (M-140).
depends-on: D-514.
scope: both filters read `glyphCount(u.text) > 0` (exported from textchain.mjs by D-514); measure content-unit counts and the corpus and retrieval figures resting on them BEFORE and AFTER, recorded with date and instrument.
accepts-when: a whitespace-only unit is neither emitted nor indexed, and the before/after figures are recorded (the measured failure it moves: blank units indexed as content). NEGATIVE CONTROL: restore `u.text.length` at one site and the whitespace-unit arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (placed; `D-531` minted by D-514's worker).

### D-569 · integrated — **`tools/plancheck.mjs` §1's UNPUSHED ARM (~133) SAYS "a failure on main and a note anywhere else" AND CALLS `fail()` ON EVERY BRANCH, so a worker's required "plancheck 0 fail" cannot be met on a pushed `land/` branch.** Found by D-559's worker (00:10Z; D-541's and M0-188's workers read the same 1 fail). — owner M0.
status: integrated — SCHEDULER #21 01:00Z: tip 715c6ef5, GATE 76/76 GREEN (TARGETED); graded by any origin ref carrying HEAD
order: after D-560, with the process rows behind the product rows: every worker meets it, but its own text already says it is expected there, so no round is lost (Bob's 17:41Z rule) (SCHEDULER #21, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a gate's grade matches what its own text says it means).
depends-on: none.
scope: grade the arm `fail` only when the branch is main, or when HEAD is not on `origin/<branch>`; a `note` otherwise; its suite asserts both grades.
accepts-when: on a pushed worker branch plancheck reads 0 fail with an UNPUSHED note, and on main ahead of origin it still fails (moves: 1 fail on every pushed land/ branch). NEGATIVE CONTROL: grade it fail on every branch again and the worker-branch arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-559's worker).

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

### D-529 · integrated — **A RENDERED CAPTURE RECORDS EACH SUBRESOURCE IT LOADED WITHOUT THAT SUBRESOURCE'S DIGEST, so the record of what ran cannot be verified independently.** BOB #33 RULED 2026-09-24 21:05Z (cite until folded): a per-subresource digest IS owed. A hop attests these bytes, this URL, this time (construct 2), and BOB #31 ruled every third-party script a render runs is recorded. Gap recorded in CLIENT-RENDERED's Incomplete sections by D-490. — owner CAPTURE.
status: integrated — SCHEDULER #21 01:23Z: tip 51ecd645, GATE 66/66 GREEN; shares index.mjs render arm, render.mjs renderBlock and browserrender.mjs with D-520/D-522 (BODY_PHASE_MS inside D-492's reservation)
order: after D-523, in normal product order with D-64's render rows (BOB #33, 21:05Z; SCHEDULER #19, 2026-09-24)
milestone: M2
interface: I5/I3 additive — a digest per recorded subresource; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` "RULED 2026-09-23 by BOB #31: third-party scripts run, and every one is recorded", with BOB #33's ruling of 21:05Z, which this row FOLDS into CLIENT-RENDERED, closing its Incomplete line, in the same landing.
depends-on: D-490.
scope: each recorded subresource carries its SHA-256; one the render loaded whose bytes were not kept reads digest UNDETERMINED with its reason.
accepts-when: a rendered capture's subresources each verify by digest, and an unkept one reads undetermined with its reason (the measured failure it moves: subresources recorded with no digest). NEGATIVE CONTROL: drop the digest and the verify arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-450 · integrated — **A PROJECT WHOSE BAR DECLARES ONE AXIS CAN PUBLISH AND CAN NEVER BE SIGNED: `publishCase` admits it (*an unset axis gates nothing*), `#caseDocumentText` freezes the unset axis as null, and C-41.12 (`checkCaseDocument`'s `required_strength` arm) demands both axes A–D when the bar is declared, so `op=ratify` answers GATE_REFUSED.** Found by REC-148's worker; reported, not re-measured by SCHEDULER. — owner RECORD.
status: integrated — SCHEDULER #21 01:18Z: tip f325c440, GATE 77/77 GREEN (FULLREUSE)
order: after D-448: a correction to just-landed work (REC-148) that strands a publishable case unsigned (SCHEDULER #17, 2026-09-23; via CONDUCT #18 22:48Z (3a))
milestone: M10
interface: none — a check's admitted values.
design: `docs/architecture/BIO_Publication_v0_1.md` §"the bar" (DEC-72) and §3 rule 12, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *C-41.12 ADMITS null for an unset axis; the pair stays a pair — both keys present, an unset axis null, stated in words "no bar set on the <axis> axis"; `op=strengthbar` keeps accepting a one-axis bar* (refusing it would pressure an invention, CLAUDE.md §4).
depends-on: REC-148 (`integrated` on c17-batch7).
scope: C-41.12 admits null for an unset axis; the case document states the unset axis in words, never defaults and never omits the key. Extend `bio-plane/test/caseproduction.test.mjs`.
accepts-when: a one-axis bar publishes, ratifies, and its document reads "no bar set on the <axis> axis" with the key present and null. NEGATIVE CONTROL: restore the both-axes demand, and the one-axis ratify arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

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

### D-454 · integrated — **ONE STRING READ ON SEVERAL PAGES IS ONE MENTION: `reading_refs` holds a single position per (capture_sha, ref), so a member choosing a connection's on-point mention (REC-122) cannot choose between that string's occurrences.** — owner CAPTURE / FRAMEWORK (the reading tables).
status: integrated — SCHEDULER #21 01:40Z: tip 25e4c242, GATE 92/92 GREEN; I5 reading_refs PK + I3 connectionchoose occurrence=/C-74.4; migration keeps every row (M-155); CATALOG 1.29.0 unions; conflicts semantically with UI-91 (UI-112)
order: after D-452: a correction that REC-122's act exposes; the choice it built is only as fine as the positions it can name (SCHEDULER #17, 2026-09-23; REC-122's worker via CONDUCT #18 23:08Z)
milestone: M4
interface: I5 — `reading_refs` keyed by (capture_sha, ref, position); I3 — a resolution carries its occurrence. The integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair) and §8 (the reading positions a connection rests on).
depends-on: REC-122 (`integrated` on c17-batch7).
scope: re-key `reading_refs` by position with a migration that keeps every existing row; each resolution names its occurrence; the connection's mentions list every occurrence.
accepts-when: a ref read on three pages yields three mentions, each choosable. NEGATIVE CONTROL: restore the two-column key, and the three-occurrences arm reads one by name. Extend the reading suite (`bio-plane/test/reading-position*.test.mjs`).
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-571 · integrated — **`bio-plane/test/monitor-cadence.test.mjs`'s LAST SECTION (~520, "one whole cadence later") DEPENDS ON LOAD: its tick waits on the plane completing a real fallback fetch, so under two concurrent full gates 2 arms failed ("and re-checks the address", "so the second genuine check is a second genuine observation") while the same tree ran it alone 4 of 4 at 0 failures.** Measured by CONDUCT #20 on c20-batch27's full gate (00:16Z); the suite's header already fixed the STRAY alarm arm this way. — owner CAPTURE (the suite).
status: integrated — SCHEDULER #21 01:22Z: tip 509d70d7, GATE 73/73 GREEN; cause NARROWED to the web.archive.org governor bucket (24/min host row), whether it fired under CONDUCT's load UNDETERMINED
order: at the head of the backlog, AHEAD of product by Bob's 17:41Z rule: a false red on a full gate costs a whole integration round (SCHEDULER #21, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a verdict independent of load; the named cause, never a retry).
depends-on: none.
scope: drive the final tick's fetch the way the stray arm is driven (a stubbed fetch or governor under the test's control), so the verdict does not depend on load.
accepts-when: the section passes with the fetch artificially delayed past the tick, and alone (moves: 2 arms red under concurrent gates). NEGATIVE CONTROL: restore the real fetch under an artificial delay and those 2 arms fail by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs D`).

### D-567 · integrated — **A MONITORING TICK ON A CLIENT-RENDERED SOURCE COMPARES A FRESH SHELL WITH THE RENDERED BASELINE: `op=monitor` re-fetches the SERVED document and no tick can render, so a render:true bundle would read `modified` on every tick for a change nobody made.** Found by D-522's worker by reading the code (not driven). BOB #34 RULED (b) 2026-09-25 00:25Z (drained to `BOB-INBOX-drained.md`; cite until folded): compare shell with the pair's `shell.sha256`; every tick states the CONTENT UNDETERMINED, "not watched: this source renders its content in the browser". Rendering per tick (a) is NOT designed and NOT rowed. — owner CAPTURE.
status: integrated — SCHEDULER #21 01:15Z: tip 8df8599a, GATE 361/361 GREEN; two builder readings recorded in CLIENT-RENDERED (frame match moves no source_status)
order: after D-556, with the corrections: a record saying a page changed when nothing did is the D-472 cry-wolf class (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M3
interface: I3 — the monitor tick's verdict on a render:true bundle; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` "RULED 2026-09-23 by BOB #32: the method, the primary, and the unattended sweep", with BOB #34's 00:25Z ruling, folded beside it by this row.
depends-on: D-490.
scope: for a render:true bundle the tick compares the served shell with the pair's `shell.sha256`, never `capture.sha256`: a match reads "frame unchanged", a difference `modified` (frame); both state the content UNDETERMINED in those words.
accepts-when: a render:true bundle ticks "frame unchanged; content undetermined" on an unchanged shell and `modified` (frame) on a changed one (moves: a shell compared with the rendered digest). NEGATIVE CONTROL: point the tick at `capture.sha256` and the unchanged-shell arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-522's worker).

### UI-91 · integrated — **A MEMBER CAN CHOOSE A CONNECTION'S ON-POINT MENTION ON THE PLANE, AND NO SURFACE OFFERS IT: REC-122's `connectionchoose` (IC-232, C-74) has no page; construct 6.on-point-ui is ABSENT.** The DELEGATION RECORD (REC-122) -> UI of 2026-09-23 is on coord `CLAIMS.md`. — owner UI.
status: integrated — SCHEDULER #21 01:26Z: tip 080be905, GATE 222/222 GREEN; REC-122 delegation discharged; r3Fed floor 80->81
order: after D-454, the member half of REC-122 (SCHEDULER #17, 2026-09-23; REC-122's worker via CONDUCT #18 23:08Z)
milestone: M4
interface: I3 consumer (IC-232).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair and what it is NOT), with D-161's act 3.
depends-on: REC-122 (`integrated` on c17-batch7; verify the op on `main` first).
scope: on the connection display, offer a signed-in member the choice among the mentions the C-49.4 entries name as bearing; show the chosen mention BESIDE the machine's pair, never replacing it; render a lapsed choice as the plane states it; replace 6.on-point-ui's `uinone` probe with `hit` probes.
accepts-when: a member's choice renders beside the machine's pair, and a lapsed one reads as the plane states it. NEGATIVE CONTROL: render the choice in place of the pair, and the "never replacing" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### UI-95 · integrated — **A MEMBER SEES A CUT SET OF CONNECTIONS AS THE WHOLE SET: D-241 publishes the entity arm's `derivation`, and `app.html`'s subject view (`connectionsBoundHtml`) never renders `derivation.says`.** — owner UI.
status: integrated — SCHEDULER #21 01:11Z: tip 051b292f, GATE 153/153 GREEN; shares subjConnectionsHtml with UI-91 (keep both)
order: after UI-91, the connection display: a surface that claims more than the record holds (SCHEDULER #17, 2026-09-23; D-241's worker via CONDUCT #18 00:15Z)
milestone: M3
interface: I3 consumer (IC-236).
design: `docs/development/CONTENT-SEARCH-DESIGN.md` §4.3 (the cap, and truncation stated).
depends-on: D-241 (`integrated` on c18-batch8).
scope: render `derivation.says` whenever `derivation.cut` is true or the state is not `derived`, beside the connection list. Extend the subject-view harness in `civicos-ui/test/`.
accepts-when: a cut derivation shows its sentence; a whole one shows none. NEGATIVE CONTROL: drop the render, and the cut-set arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### UI-96 · integrated — **A MEMBER WHOSE CASE RESTS ON A PASSAGE IS STILL NEVER TOLD A NEWER VERSION EXISTS: D-394 built the plane's cross-version notice (`versionnotice`, C-80; construct 4.cross-version BUILT), and 4.cross-version-ui is ABSENT: no surface shows it where a member meets a citation.** — owner UI.
status: integrated — SCHEDULER #21 01:42Z: tip 013d80c2, full battery 221/221 GREEN then 59/59 recorded; shares basisLegRow's leg line; r3Fed 80->81 (UI-91 moved it too)
order: after UI-95: the plane half's member surface (SCHEDULER #17, 2026-09-23; D-394's worker via CONDUCT #18)
milestone: M4
interface: I3 consumer (IC-239).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1.
depends-on: D-394 (`integrated` on c18-batch8).
scope: where a citation is shown, render the notice's state as the plane states it, including "the chain could not be read"; replace 4.cross-version-ui's probe.
accepts-when: a citation to a superseded passage shows the notice; an unread newer capture reads as not read, never as unchanged. NEGATIVE CONTROL: collapse "not read" into "unchanged", and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).
note: 2026-09-24 — RE-SCOPED by Bob's ruling (Framework §18.1, option D; folds-0924b): the proactive notice reaches a published case's OWNERS only (delivery is REC-209); the surface shows it to owners, and anyone may still ASK at a citation.

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

### D-504 · integrated — **D-453 LEFT SIX IDENTIFIER-SPACE MEASUREMENTS OPEN (M-132): (1) Accela not read (APN ↔ permit, scope (c)'s other half; a session-based ASP.NET UI); (2) whether data.oaklandca.gov c3xp-qcgn copies the county roll, and whether any HISTORICAL roll is published (33 of 102 Legistar APNs are retired parcels); (3) the 100xxxx join, to be sought in the CIP line-item tables, not budget prose; (4) data.acgov.org unidentified; (5) M-119's recorded tool sha256 (322fcb95…) ≠ main's (b204fc1e…); (6) 0201-cafr-2002 is a scan, unread.** — owner CONTENT (measurements).
status: integrated — SCHEDULER #21 01:47Z: tip 2ca08780, GATE 43/43 GREEN; M-157 all six items; §8.3 rule 3 amendment sent to BOB
order: before REC-203, whose recognisers rest on these joins (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:41Z)
milestone: M0 (measurements for M4's identifier spaces)
interface: none — measurements.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for M-132 and `tools/m119-idspace.py`.
depends-on: D-453.
scope: measure (1)–(4) with a fresh network session (www.oaklandca.gov's 403 is Akamai's; `cao-94612.s3` is the working route); reconcile (5) by stating which file M-119 read; send (6) to OCR or state it unread.
accepts-when: each item recorded with date, instrument and counts, a refused host named as refused. NEGATIVE CONTROL: `tools/m132-negative-control.py`'s planted join counts exactly one.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### REC-203 · running — UNBLOCKED 2026-09-24 by BOB #32: Framework §8.3 now carries M-132 (concurrent project-number forms told apart by shape; C.M.S. referent check and coverage floor; APN apn_sort and RETIRED parcels; contract/PO unpublished at source), on land/bob/fold-m132 awaiting its train. Build to §8.3 as amended.
status: running — SCHEDULER #21 01:54Z spawns WORKER REC-203 (depth 2) on the amended §8.3 rule 3
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

### D-455 · running — **A `changed` MONITOR TICK DISCARDS THE BYTES IT FETCHED: it points its result at the baseline because the new document is not captured, though the monitor already held those bytes to see the change.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *a `changed` tick CAPTURES the new bytes (a monitor capture with its own provenance, through the governor), and its result_ref points at the new capture's sha* — superseding `OBSERVATION-LOG-DESIGN.md` §4.1's reason. — owner RECORD.
status: running — SCHEDULER #21 02:01Z spawns WORKER D-455 FROM land/worker/REC-191 (same monitor path)
order: after REC-191, the same monitor path; evidence in hand is being thrown away (SCHEDULER #17, 2026-09-23; D-65's worker finding (b))
milestone: M3
interface: I3/I5 — a monitor capture and the observation's reference; the integrator mints and classifies the IC.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §4.1, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: D-65 (`integrated` on c17-batch6).
scope: on `changed` the tick captures the served bytes with monitor provenance through the governor and points the observation at that capture. Extend `bio-plane/test/monitor-assess.test.mjs`.
accepts-when: a changed tick leaves a capture whose sha the observation names, and that sha resolves in the register. NEGATIVE CONTROL: skip the capture, and the "result names a held capture" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-338 · running — **THE `unmonitorable` CONTRACT IS DECLARED AND UNTESTED: D-65 maps a shell to UNMONITORABLE (`CONTRACT_FREQUENCY.unmonitorable: null`, with its why), and no suite drives it; whether the monitor still reports a hash delta for such a document is UNDETERMINED.** — owner RECORD.
status: running — SCHEDULER #21 01:19Z spawns WORKER D-338 (depth 2); new suite, beside REC-191/D-571
order: after D-455, the same monitor path (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M3
interface: none — an arm.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6.
depends-on: D-65 (`integrated` on c17-batch6).
scope: an unmonitorable arm in D-65's monitor suite (`bio-plane/test/monitor-assess.test.mjs`); fix any hash-delta report it exposes.
accepts-when: a shell-profiled document's answer states unmonitorable and grades no change. NEGATIVE CONTROL: map unmonitorable to weekly, and the arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### REC-162 · running — **A FOUNDER-ONLY OP'S REFUSAL CALLS AN ENROLLED ADMINISTRATOR A NON-ADMINISTRATOR.** Five ops sit in `SESSION_OPS.admin` and … (whole text: the cut archive)
status: running — SCHEDULER #21 01:23Z spawns WORKER REC-162 (depth 2)
order: back to back after REC-159, the same two suites (`d270-refusal-truth`'s ROLE literal, `adminvote` §8f), the second re-reading the first's pins; a false refusal sentence, CLAUDE.md §2's class (BOB #23's entry, 2026-09-21; SCHEDULER #7)
milestone: M8
interface: I3 — the refusal's sentence; the integrator classifies it in IC-55's family.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9, *AND ADMINISTRATORS DO NOT RUN THE INSTANCE* (BOB #23, 2026-09-21).
depends-on: REC-159 (sequence: the same `SESSION_OPS` sets and ROLE literal; made a dependency 2026-09-23 by SCHEDULER #16 so no refill takes this row ahead of it).
accepts-when: an enrolled administrator and a member, each refused `governorconfig`, read the founder's-session sentence; the founder's session and the ADMIN_TOKEN bearer still set an … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (BOB #23's inbox entry, drained this commit; `node tools/mintid.mjs REC`).
scope-add: 2026-09-24 by SCHEDULER #17, BOB #32's ruling (00:00Z): correct `AI_SCOPE_BEYOND_MEMBER_REACH`'s detail ("not reachable by a member"), now loosely false for REC-159's four custodial acts, in the same `SESSION_OPS` sets this row touches; no new row. The founder's NOT_AN_ADMIN on an unclaimed store (scratch) STANDS: a live verification claims an administrator in scratch first.

### REC-155 · running — **SEVEN VERBS WHOSE `OPS` ROW ADMITS A SESSION CLASS WERE REACHABLE BY NO SESSION, AND NOBODY HAD RULED WHY — NOW RULED** … (whole text: the cut archive)
status: running — SCHEDULER #21 01:24Z spawns WORKER REC-155 (depth 2)
order: where it stood, now with its design (BOB #20's entry): the plane is honest here — a determination was owed, not a defect shipping — and this landing refuses nobody (SCHEDULER #5, 2026-09-21; placed by SCHEDULER #3, 2026-09-19)
milestone: M8
interface: I3 — MINOR: sessions gain reach and no class list moves; the integrator mints the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10 (ruled by BOB #19, landed by BOB #20 at `d9cf3283`).
depends-on: REC-159 (sequence: the same `SESSION_OPS` sets and ROLE literal; made a dependency 2026-09-23 by SCHEDULER #16 so no refill takes this row ahead of it).
accepts-when: each of the five answers a member session and an administrator session with the op's own result; the two unattended ops answer every session `MACHINE_CREDENTIAL_REQUIRED` with … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's item 1); designed 2026-09-21 by §4.10, BOB #20's entry drained by SCHEDULER #5.

### REC-186 · running — **MEMBERSHIP §7's TWO UNRULED EDGES, RULED (BOB #31, 2026-09-23 21:37Z): (a) THE PROJECT'S ONLY OWNER CANNOT "ASK TO LEAVE" — `projectLeave` refuses the last owner by name ("transfer ownership first") and `op=affordances` does not offer it; a non-last owner may leave. (b) A JOINED PARTICIPANT IS NOT OFFERED "JOIN" — `projectJoin` stays idempotent, but an offer that does nothing is an overclaim.** Found by D-311's worker (`projectLeave` does not check the owner flag). — owner RECORD.
status: running — SCHEDULER #21 01:27Z spawns WORKER REC-186 (depth 2)
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

### D-485 · running — **THE DEC-49 GUARD CANNOT SEE REACH THROUGH THE REAL PLANE: under D-433 its R3 counts only codes a MOCK feeds a surface, so "every code a surface can receive carries a canned translation" was false of `NO_CITATION` for months.** Found by UI-83's worker. D-484 closes the instance; this closes the class. — owner the plane estate.
status: running — SCHEDULER #21 01:38Z spawns WORKER D-485 (depth 2); D-542 (reach-by-op) is its sibling in the backlog
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

### D-585 · running — **A SCANNED PAGE WITH AN INHERITED FONT DICTIONARY AND AN EMPTY BT…ET IS READ AS HAVING A TEXT LAYER, TWICE: `pdfstructure.mjs`'s tier-1 no_text_layer marker requires "no font declared", so CAFR-2002's 161 such pages read as 0 characters of TEXT, not UNREAD (and `needsTier2` stays false); `pdf-worker/src/pagepixels.mjs` `analyzePage` counts a bare BT as text, so the OCR member refuses the page PAGE_HAS_TEXT_LAYER.** Found by D-504's worker (M-157, 01:45Z). — owner CONTENT-PDF, fleet.
status: running — SCHEDULER #21 01:48Z spawns WORKER D-585 (depth 2)
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

### UI-109 · running — **THE QUEUE'S FINDING ITEM CANNOT SHOW A REOPENED QUESTION'S EARLIER DECISION: D-527 publishes `prior_disposition` on `op=queue`'s FINDING items and no surface reads it.** D-527's own scope: *a UI follow-on renders it and is rowed once this lands* (CONDUCT #20 22:34Z). — owner UI.
status: running — SCHEDULER #21 01:53Z spawns WORKER UI-109 (depth 2); D-527 done on main 964da679
order: after UI-108, in product order: the second surface for the same decision record (SCHEDULER #20, 2026-09-24)
milestone: M4
interface: I3 consumer (D-527's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2 "The declared flow, and its revisions" (a reopened proposal carries the earlier decision as `prior_disposition`).
depends-on: D-527.
scope: render on the queue's FINDING item who reopened it, the earlier decision, and whether that decision still applies, in the plane's words.
accepts-when: against a real-plane suite a reopened finding's queue item shows its earlier decision (the measured failure it moves: the reopened question shown as one nobody has answered). NEGATIVE CONTROL: omit `prior_disposition` from the render and the reopened-item arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs UI`).

### REC-219 · running — **A PUBLISHED CASE SIGNS "no manifest was in force" WHILE ITS SCOPE'S ONLY ADOPTION PINS A PROPOSED REVISION: the frozen `bias_manifest` block of `bio-case-document/3` has no field for REC-210's `pins_proposed`, so a later reader takes "a declaration was pending" for "nobody declared anything".** Found at REC-210's integration (CONDUCT #20 22:57Z). BOB #34 RULED YES 2026-09-24 23:08Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #20): `bio-case-document/4`, whose frozen `bias_manifest` states both facts as they stood at signing — none in force, and an adoption pinning a proposed revision (its id), not yet in force — and says nothing about when or whether it takes effect; /3 documents stay valid, read as they are, never re-signed. — owner RECORD.
status: running — SCHEDULER #21 01:53Z spawns WORKER REC-219 (depth 2); REC-210 done on main 964da679
order: after UI-109, IN PRODUCT ORDER after REC-210 lands, not ahead (BOB #34 23:08Z) (SCHEDULER #20, 2026-09-24)
milestone: M10
interface: I3 — a format bump; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 (the case-document format, rules 12-13's /3 bump) with `docs/architecture/BIO_Declared_Bias_v0_1.md` "Bias bundles and adoption", and BOB #34's ruling of 23:08Z, which this row FOLDS into §3.
depends-on: REC-210.
scope: bump to `/4`; the frozen block carries the pending-adoption fact with the revision id; a new C-41 check refuses a /4 document whose block omits it where the record held one. BOB named C-41.13, but /3's obligation already holds C-41.13 (bio-checks ~11548), so use the next free C-41 number and say so. /3, /2 and /1 stay accepted.
accepts-when: a case published under a proposed-only adoption signs a /4 block naming the pending revision, and a /3 document still ratifies unchanged (the measured failure it moves: "no manifest was in force" alone). NEGATIVE CONTROL: omit the field and the new check refuses by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs REC`).

### D-534 · running — **`op=queue` PUBLISHES `mute.cases` AS CASE IDS ALONE AND THE MUTED KINDS NOWHERE, so no surface can name the kinds of a case mute that is suppressing nothing today, and no member can undo that mute (the case form's unmute needs the kinds named).** `queueFeed` publishes `[...mutes.keys()].sort()` while `#queueMutes(member)` already holds `case_id -> Set(kind)`. Found by UI-97's worker (id minted by it). — owner RECORD.
status: running — SCHEDULER #21 01:56Z spawns WORKER D-534 (depth 2)
order: after D-531, with the corrections: a member left unable to undo their own act (SCHEDULER #19, 2026-09-24; UI-97's worker 21:55Z)
milestone: M8
interface: I3 additive — `mute.cases` gains its kinds; the integrator mints and classifies the IC.
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class" (DEC-10's (c); D-125's case form).
depends-on: UI-97.
scope: `queueFeed`'s mute block publishes each muted case WITH its kinds (`cases: [{case, kinds}]` or a `case_kinds` map beside `cases`, whichever is least disruptive to current readers). Extend `bio-plane/test/d125-findingmute.test.mjs`.
accepts-when: a kind muted on a case whose items are not live today is named in `op=queue`'s mute block (the measured failure it moves: case ids with no kinds). NEGATIVE CONTROL: publish the case ids alone again and the "a kind holding nothing back today is still nameable" arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (placed; `D-534` minted by UI-97's worker).

### D-553 · running — **THE RETIRED-TARGET QUESTION IS SPELLED THREE WAYS IN THE STORE, AND ONLY TWO AGREE: (a) D-444's `#retiredNotCitable(id)` (store.mjs ~5185, Information-typed); (b) an identical copy in DEC-49 region `is-cite-retired` at `op=cite` (~12806); (c) `SUGGEST_LEG_UNREACHABLE` (~40290), viewer-gated and type-blind.** The comment at (b) claims the suggest path asks the same question; it does not. Found by D-444's worker (22:34Z). — owner RECORD.
status: running — SCHEDULER #21 01:56Z spawns WORKER D-553 (depth 2); D-444 done on main 964da679
order: after UI-107, in product order: a consistency defect, probably a no-op today, since no state machine but Information's carries `retired` (not measured) (SCHEDULER #20, 2026-09-24)
milestone: M8
interface: I3 for (b) (a governed region contracts); the type-blind widening's IC is minted by the integrator ONLY if the measurement finds a second `retired` machine.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 ("A RETIRED ITEM IS NOT CITABLE", BOB #30), whose Incomplete-sections bullet D-444 updated to name this.
depends-on: D-444.
scope: BOB #34 RULED 22:55Z (drained by SCHEDULER #20): the rule WIDENS to the STATE; (c)'s type-blindness is CORRECT. ONE helper, type-blind: (a) `#retiredNotCitable` drops its Information test, (b) `op=cite` calls it (move `is-cite-retired` `regionLines` to the figure printed on the MERGED source), (c) the suggest path calls it. Viewer-gating never decides citability; only the refusal's WORDING may be viewer-gated. MEASURE which state machines carry `retired` and state the count. Correct the false comment at (b). A future machine meaning something else must name its state differently. §4.1's sentence rides BOB's batch.
accepts-when: `affordances.test.mjs` §0's spelling count moves to ONE helper read at all three sites, and a viewer who cannot see the target is still refused (the measured failure it moves: two copies that can diverge silently). NEGATIVE CONTROL: restore (b)'s inline copy and §0 names it.
added: 2026-09-24 · SCHEDULER #20 (id minted by D-444's worker).

### REC-218 · running — **A CSV READING'S DIALECT IS NOT PERSISTED: FW-23 finds the delimiter and encoding by signature, and nothing keeps them on the record, so a re-read cannot say which dialect it read.** BOB #33 RULED 2026-09-24 21:55Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #20): option (b), a `reading.dialect` key of its own (delimiter, encoding), persisted on the acquire document — not `container_extent`; it suits other text formats with a decoding choice. — owner RECORD.
status: running — SCHEDULER #21 02:04Z spawns WORKER REC-218 (depth 2); FW-23 done on main 964da679
order: after D-536, beside the other reading-provenance row: the record stating how it read what it holds (SCHEDULER #20, 2026-09-24)
milestone: M2
interface: I1 additive — a `reading.dialect` key on the acquire document; the integrator mints and classifies the IC.
design: `docs/development/OFFICE-FORMATS.md` "CSV — DESIGNED 2026-09-24 by BOB #32" (delimiter and encoding RECORDED on the reading, undetermined when they cannot be told), with BOB #33's ruling of 21:55Z, which this row FOLDS into that section in the same landing.
depends-on: FW-23.
scope: persist `reading.dialect {delimiter, encoding}` on the acquire document at FW-23's reader; `undetermined` with its reason when the signature cannot tell; readable on the capture's read.
accepts-when: a semicolon-delimited latin-1 CSV's acquire document reads `reading.dialect` with both, and an ambiguous one reads undetermined (the measured failure it moves: the dialect found and discarded). NEGATIVE CONTROL: drop the persistence, and the read-back arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs REC`).

### M0-193 · running — **`bio-plane/test/surfacing-run.mjs` HAS TWO LATENT FIXTURE DEFECTS: (F2) `openRun` derives `snapKey` from the whole SECOND (`${now.replace(/[-:]/g, "")}_5171f1a0`), so two fixture projects opened in one second share a snapKey; (F3) the wrapper clears its run cache on ANY whole-store `op=purge` attempt, including one REFUSED for a missing `confirm`.** Found by M0-187's worker (via CONDUCT #20 22:15Z). Harmless today. — owner RECORD (the shared test helper).
status: running — SCHEDULER #21 02:06Z spawns WORKER M0-193 (depth 2)
order: after D-541, with the process rows behind the product rows: latent, and neither has produced a false gate result (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none (test code).
design: `docs/development/VERIFICATION.md` (a fixture's state follows what the plane answered, never what was asked).
depends-on: M0-187 (its per-run `nth`).
scope: append M0-187's per-run `nth` to `snapKey`; clear the run cache only when the purge's answer says the purge happened.
accepts-when: two fixture projects opened in one second get distinct snapKeys, and a refused purge leaves the cache (the measured failure it moves: a shared key and a cache cleared by a refusal, each driven by a planted arm). NEGATIVE CONTROL: drop `nth` from the key and clear on any attempt, and both arms fail by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs M0`).

### D-535 · running — **THE PLANE'S MEMBER-FACING STRINGS CITE `MEASUREMENTS.md` BY NAME, so every suite importing the check catalogue or the plane's index counts as a MEASUREMENTS reader and a MEASUREMENTS-only diff selects it: `bio-plane/checks/bio-checks.mjs` and `bio-plane/src/index.mjs` carry four citations (one DEC-49 refusal translation, three OCR cost sentences), and gates.mjs §2e reads a directly-imported runtime module's text for path mentions.** Found by M0-176's worker (M-146 §"D-535, ISOLATED HERE"); M0-176 is NARROWED to this. — owner RECORD (index.mjs), CHECKS (bio-checks.mjs).
status: running — SCHEDULER #21 02:13Z spawns WORKER D-535 (depth 2)
order: after M0-193, with the process rows behind the product rows: it trims the doc-facing selection by two units (39 → 37, M-146), which is not an appreciable gate-time effect (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24; via CONDUCT #20 22:31Z)
milestone: M0
interface: I3 — one DEC-49 translation's words change; the integrator classifies.
design: `docs/development/VERIFICATION.md` (a gate selects by what a suite reads), with DEC-49 as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it for the translation.
depends-on: M0-176.
scope: rewrite the four citations as prose ("the MEASUREMENTS ledger"), the correction M0-165 made to calibration.test.mjs's `measured_by` labels one level down. Extend `statepaths.test.mjs`'s pin of this property from the TEST side to `bio-plane/src/` and `bio-plane/checks/`, so a by-name citation there cannot return (M0-176's worker). CAUTION: one is a DEC-49 refusal translation, so check its governed region, `regionLines`, and every refusal-wire pin that quotes the sentence.
accepts-when: a MEASUREMENTS-only diff no longer selects `calibration.test.mjs` and selects 37 units (the measured failure it moves: 39, M0-176's unmet accepts-when). NEGATIVE CONTROL: restore one citation by name and the selection re-admits the importing suites, failing by name.
added: 2026-09-24 · SCHEDULER #20 (id minted by M0-176's worker).

### D-589 · running — **A DEC-49 REGION INSIDE `aiRunOpen` IS JUDGED TWICE AND FAILS: its catalogue rows keep a WHOLE-FUNCTION `where`, so a new governed region inside the function is read both by the region and by every whole-function row.** Found by REC-207's worker (F2, via CONDUCT #20 01:48Z). REC-71's class. — owner RECORD (the catalogue rows), M0.
status: running — SCHEDULER #21 02:17Z spawns WORKER D-589 (depth 2)
order: after D-574, with the DEC-49 instrument rows behind the product rows: it blocks the next governed edit to aiRunOpen with a false red, and no gate result is false today (SCHEDULER #21, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the DEC-49 guard), with REC-71's narrowing of whole-function rows into regions.
depends-on: none.
scope: narrow every aiRunOpen catalogue row's `where` into its own DEC-49 region, as REC-71 did for its function; move the guard's floors to the printed figures.
accepts-when: a new region added inside aiRunOpen is judged once and passes (moves: a double judgement). NEGATIVE CONTROL: restore one whole-function `where` and the planted region's arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs D`).

### M0-147 · running — **TWO SUITES READ THE YEAR OFF THEIR OWN CLOCK: `mint-ledger.test.mjs` (line 76) and `opaque-ids.test.mjs` (line 67) set `YEAR = new Date()…slice(0, 4)`, so a run straddling New Year's midnight UTC compares ids minted in one year with the next.** Found by D-487's worker's sweep (the instant-dependent class, D-231, D-487). — owner M0.
status: running — SCHEDULER #21 02:23Z spawns WORKER M0-147 (depth 2)
order: low in the M0 group: latent, fires only across a year boundary (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:25Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a suite's verdict must not depend on the instant it starts).
depends-on: none.
scope: read the year off the plane's first minted id in each suite, not the suite's clock.
accepts-when: both suites pass under a clock pinned 1 ms before New Year UTC. NEGATIVE CONTROL: restore the clock read under that pin and the id arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-148 · queued — **THE R3-FED WALK KEYS ON LITERALS, so a code fed through a derived const (UI-84's REQUIRED_ARGUMENT_MISSING) is invisible and the walk undercounts by one.** Found by UI-84's worker. — owner M0.
status: queued — SCHEDULER #21 02:28Z: HELD until D-485 is integrated: both rework check-refusal-codes' R3 (fed) walk
order: low in the M0 group: an undercount of one, stated (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:26Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the DEC-49 guard).
depends-on: UI-84 (its train).
scope: teach the walk to follow a const to its catalogue value; failing that, record the undercount at the walk. WIDENED 2026-09-24 (UI-100's F1): the same walk OVERcounts too — `partitionSuiteLiterals` harvests quoted codes from comments (r3Fed read 81 vs 80): blank /* */ and // spans first (the obsSpans technique). Also correct UI-84's control arm C declaration (declared GREEN; the rename in fact stops the plane — M-139 §7).
accepts-when: r3Fed counts REQUIRED_ARGUMENT_MISSING. NEGATIVE CONTROL: inline-break the const's resolution and the arm names the missed code. A code named only in a comment is not counted.
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
