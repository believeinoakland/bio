# The work queue

CONDUCT owns this file and is its only writer. **Exception, 2026-07-31: session BOB
restructured it once, with Bob's explicit authorisation, while CONDUCT was paused for
that purpose.** Ownership returns to CONDUCT with this rewrite; BOB hands
decompositions over rather than editing here (`ORCHESTRATION.md`).

One section per area. An area is **ACTIVE** (holds a worker slot; max two at once) or
**DORMANT** (pre-seeded, promoted when a slot frees). CONDUCT takes the top item whose
status is `queued` and whose depends-on are all `done`, spawns a worker, and on
landing marks it `done`.

**What changed in this rewrite**, so CONDUCT can read it fresh without reconstructing:

- Every item now names its **milestone** (`MILESTONES.md`) and carries an
  **`accepts-when:`** — a command, not a judgment. That was `PLAN.md`'s one
  irreplaceable property and it was lost when the queue replaced it.
- The queue previously held six items while the real forward work was ~40 debt rows,
  six design-doc order-of-work lists and ten CONSTRUCTS steps. Everything is now
  placed in `MILESTONES.md`, and this file carries the runnable slice.
- **RECORD is a new area** (`PARALLELISM.md`): the store core and retrieval, ground
  already being edited with no owner, which is why everything defaulted to CAPTURE.
- **CPDF-2 is SUPERSEDED** by Bob's function-specific Worker topology (I6). Its work
  is not discarded — it becomes the pdf-worker's Tier 2 core.
- **CAP-2 landed** (39a0e1b) and is marked done here; CONDUCT paused before recording
  it.

**BOTH slots are CONTENT-OFFICE**, decided 2026-08-03: Bob confirmed office formats
as the current focus the same day he paused the case-making thread, and his
decomposition names COFF-1 ∥ COFF-2 as "the two behavioural slots" — disjoint files,
genuinely independent. Enacted 2026-08-03 by CONDUCT:

- **Slot 1 · CONTENT-OFFICE, COFF-1** — the FORMAT registry, HTML and PDF moved onto
  it. The D-70 uniformity test, and the step that must precede the format entries or
  they are built twice.
- **Slot 2 · CONTENT-OFFICE, COFF-2** — the OOXML container reader, a pure
  zero-dependency module. Builds against I7 on paper; independent of COFF-1's landing.
- Wave 2 is COFF-3/4/5 (mutually independent; two slots against three items —
  recommended order XLSX → DOCX → PPTX by evidentiary density; final sequencing is
  CONDUCT's). All three additionally wait on IC-1 RESOLVED — done 2026-08-03, see
  `INTERFACE-CHANGES.md`. Slot rotation 2026-08-03 as the wave drained: COFF-3 and
  COFF-4 landed; COFF-5 holds one slot; FRAMEWORK promoted into the other for FW-15
  (the L2→L3 wire — prerequisite for CPDF-10's reading_refs acceptance, and the
  highest-leverage independent item on the board). CPDF-10 additionally waits on
  DEC-35 (the OCR service vendor/account — Bob's; provisional: it stays queued).
- **The case-making run (REC-10 → REC-19 → REC-11 → …, the 2026-08-01 handover order)
  stays QUEUED under a now-DORMANT RECORD**, first in line when a slot frees or Bob
  reopens the thread. Its activation order inside RECORD is unchanged; DEC-8's
  no-act-surface-before-REC-19 doctrine stands.

**Measurement-only and test-estate items hold no slot** (`ORCHESTRATION.md`): COFF-6
(the office-corpus measurement — sets COFF-2's bound, runs IMMEDIATELY), CPDF-9 (the
OCR measurement — gates CPDF-10's whole design, run early) and REC-27/M0-lane work
run out of band whenever CONDUCT has integration capacity between area items.

---

## BOB INBOX — append-only. BOB writes here; CONDUCT drains it.

The producer/consumer split that makes an architectural change landable WITHOUT
pausing CONDUCT (`ORCHESTRATION.md`). BOB appends; CONDUCT is the sole writer of
everything below this section and drains the inbox as part of its loop, deleting an
entry only once it has been enacted below. The two parties write to disjoint regions,
so neither has to stop for the other.

_(drained by CONDUCT 2026-08-07 — **`IS-BUILD-PLAN.md` IS THE AUTHORITY for the IS build and SUPERSEDES the interim IS-1..IS-9 sequencing CONDUCT drained earlier the same day.** Enacted below.

**SUPERSESSION IS NEVER SILENT, so every interim item keeps its id, takes status `superseded`, and NAMES what replaced it** (`ORCHESTRATION.md` rule 3): IS-1 → PL-1 · IS-2 → PL-2 · IS-3 → PL-13 · IS-4 → PL-3 · IS-5 → PL-11 · IS-7 → PL-14 · IS-8 → PL-16 · IS-9 → FL-3. **IS-6 is NOT superseded — it LANDED**, and the plan's PL-5 row is satisfied by it. Likewise **REC-59 satisfies PL-6** and **REC-60 satisfies PL-7** (both marked done here; the plan confirmed REC-59 before scheduling and was written before REC-60 landed). REC-61 → PL-10 and REC-62 → PL-8 + PL-9, the plan splitting D-222's staging finer than the interim item did.

**THE PLAN IS NOT COPIED INTO THIS FILE, and that is a deliberate call.** `ORCHESTRATION.md`: *"A notification, not a second copy. Restating the content creates a copy that immediately starts rotting."* Forty item scopes transcribed here would be a second authority drifting from the first — the mirror-and-drift class this project refuses everywhere else, and the same reasoning that made REC-55 decline to publish a second copy of a predicate. **So the plan holds the SCOPE and this file holds what is RUNNABLE and its STATUS**, one pointer row per wave slot. *"Nothing is work until it is in `QUEUE.md`"* is satisfied by the pointer rows, not by transcription.

**WAVE POSITION AT DRAIN: W0 and W1 ARE ALREADY SATISFIED.** W1 slot A was PL-7 (REC-60, landed) and slot B was PL-5 (IS-6, landed) — so the two items CONDUCT ran before this entry arrived closed the plan's first working wave. **Current wave is W2: slot A = PL-8 (D-222 option A, discharging D-223), slot B = PL-1 (basis versions).** W0's lanes hold no slot and are queued beside them (FL-1's D-218 probe, the D-216 model check, VF-2's DEC-49 guard, SK-1's authoring) — and two of them, D-216 and D-218, are PRECONDITIONS the plan front-loads deliberately, because each reshapes an item BEFORE its wave.

**THE ONE FLAGGED FOLLOW-UP is recorded rather than left in the entry:** the post-processing task scope that produces live machine connections for UI-44 has **no item**. Raise it when W5 approaches, or UI-44 ships fixture-verified. Written onto the W-tracking row below so it is met at the right wave rather than remembered.

Fences, placements and controls from the earlier handover STAND — the plan corrected the sequencing, not the doctrine. No entries outstanding.)_

**2026-08-10 · BOB · THE DECIDED INDEX IS IN THE LOOP, AND THERE IS A NEW GATE.**
Branch `bob-corpus-index` (596c697), green, unmerged. What changed for CONDUCT:

- **`node tools/decided.mjs "<subject>"` before raising a question or writing a decision
  item.** Added to `CLAUDE.md`, so every session loads it. It answers from
  `docs/DECIDED.md`, generated from every ruling in the corpus — 585 of them, 161 KB
  against the corpus's 7.4 MB. Measured cause: the reading a kickoff demands is ~565k
  tokens, which no session can read, and only 12% of rulings are in `DECISIONS.md`.
- **`plancheck` now FAILS on a stale `docs/DECIDED.md`.** Any turn that rules on anything
  must run `node tools/decided.mjs` and commit the result, exactly as a version bump must
  leave `check-versions` green. This is a NEW failure mode in a gate CONDUCT runs before
  every push — the first stale-index failure will look like an unrelated break otherwise.
- **No queue item is superseded and no worker should be stopped.** Nothing else moved:
  the archive and ledger-rolling moves in `docs/archive/CORPUS-STUDY.md` are
  SPECIFIED AND NOT EXECUTED, and one of them is gated on a hazard CONDUCT should know
  about before touching prose in bulk — **`mintid` derives its id floors by reading ids
  MENTIONED in prose, and its ledger is not committed, so removing prose that names a
  high id LOWERS the floor and a fresh clone re-issues an id already in use.**

**2026-08-10 · BOB · THE CORPUS WAS CONSOLIDATED WHILE YOU WERE PAUSED.** Live corpus
7.35 MB → 3.56 MB; orientation reading ~565k → ~295k tokens. Nothing deleted, nothing
edited — 3.83 MB moved to `docs/archive/`, which `decided.mjs` and `mintid` both scan.
Read `docs/archive/CORPUS-STUDY.md` once. What changes for you:

- **THIS FILE now ends in a `## CLOSED ITEMS` register** — 195 done/superseded items
  moved to `docs/archive/ledgers/QUEUE-2026-08.md`, leaving one heading and one line
  each. **Do not delete those headings**: `planning-hygiene` builds its queue-id set
  from them and checks every `QUEUED <ID>` reference in the corpus against it, and
  `mintid` reads floors from the same prose.
- **`CLAIMS.md` is 26 KB** (217 released claims archived). Four HELD claims from
  2026-08-09 remain and look stale — **releasing them is yours, not housekeeping.**
- **`DEBT.md` keeps every open row**; 110 closed rows archived. `D-124`'s two rows are
  deliberately together in the live file with a comment saying why — it is a registered
  collision and splitting it made `mintid` read it as resolved.
- **`INTERFACE-CHANGES.md` was NOT touched**, because IC-39 through IC-57 are
  resolutions you still owe, not closed history. Still owed and unchanged.
- **`plancheck` has one new failure mode:** a stale `docs/DECIDED.md`. Any turn that
  rules on anything runs `node tools/decided.mjs` and commits the result.
- No queue item is superseded and no worker should be stopped.

An entry names: what changed, which queue items it affects, and whether any in-flight
work is superseded. It does NOT decide worker lifecycle — stopping a running worker is
CONDUCT's call.

_(drained by CONDUCT 2026-07-31: restructure is reflected below; the stale `capture-bootstrap-1` claim has been RELEASED as stale per `PARALLELISM.md`; the `pdf-worker/**` note is informational — CPDF-6 creates it. No entries outstanding.)_

_(drained by CONDUCT 2026-07-31: re-read the updated `kickoffs/CONDUCT.md` loop (step 0 drain-inbox, step 5 DECISIONS both directions); DEC-1/2/3 enacted; D-120's status cell given its leading `M1` token (the plancheck residue); the shared-tree fix (DEC-3, one session per tree — main is mine now) and the raise-either-way-let-BOB-triage correction acknowledged. No entries outstanding.)_

_(drained by CONDUCT 2026-07-31: M8 (a member can reach what the record holds) is now in MILESTONES and the UI inventory in UI-PLAN — read and acknowledged. UI stays DORMANT; M8 depends on nothing and is available to activate when a slot frees, with UI-PLAN's U11 ("members & keys") to be SPLIT first since it exceeds its rung. No queue item superseded, no worker stopped.)_

_(drained by CONDUCT 2026-07-31: `BIO_Interaction_Constructs_v0_1.md` governs M8 — five INTERACTION constructs (not the CONTENT `CONSTRUCTS.md`), TASK the attention layer pointing at the acts. Recorded for when UI activates: scope M8's first item as the TASK CONSTRUCT (not "the tasks screen"), build order T→J→B(+S)→P→A per MILESTONES. UI stays dormant; no queue item superseded.)_

_(drained by CONDUCT 2026-08-03 — the 2026-07-31 office-formats directive: `INTERFACE-CHANGES.md` already existed with IC-1 PROPOSED; CONDUCT answered on dormant FRAMEWORK's behalf in writing and IC-1 is RESOLUTION: ACCEPTED (protocol step 3). The FORMAT-registry-first order is enqueued as COFF-1 → COFF-2 (BOB's 2026-08-03 decomposition, which carries RECONCILED §3.3's CPDF-8/CAP-5 namings); the evidentiary extras are IN scope per DEC-5.)_

_(drained by CONDUCT 2026-08-03 — the 2026-08-01 case-making build order and every subsequent BOB entry through the 2026-08-03 session-dormancy note: all 35 RECONCILED §3 items plus REC-28, CPDF-9 and CPDF-10 are enqueued below with every DEC reshape folded into the item scopes (DEC-12/13/14 → REC-14/REC-24; DEC-15 → REC-11/12/15/18, UI-11; DEC-16 → REC-20/21, UI-14; DEC-17+amendment → REC-14, UI-18; DEC-18/21 + D-160 → REC-12, UI-11; DEC-19+amendment → FW-14, UI-17/17a; DEC-20 → REC-15; DEC-22 → REC-13; DEC-23/D-164 → REC-11/18 provisionals + IC-1's constraint; DEC-24 recorded as doctrine on REC-13's pursue path; DEC-28/29/30 → REC-16, REC-13; DEC-31 → UI-18; DEC-33 → REC-15/UI-17 blocked, UI-17a queued; DEC-34 → REC-14/REC-22/UI-18; DEC-4 as twice amended → CPDF-9/CPDF-10, FW-15). The superseded pointers sit atop BUILD-ORDER/SB-CORE/SB-EVIDENCE/SB-OUTPUT and the corrected-by-rulings pointer atop AUDIENCES.md. D-157 is enqueued as REC-29 (CONDUCT's slot call: small, self-contained, touches people outside the project); D-158 is recorded on REC-15's deferred scope. Activation: both slots RECORD — REC-10 then REC-19, per the handover's order. S11's state inventory and D-164's content-extent design stay PARKED with Bob's paused thread, deliberately not queued. DEC-32 remains the sole open register entry; its provisional (no grounds machinery) is noted on REC-11/REC-12. No entries outstanding.)_

_(drained by CONDUCT 2026-08-07 — the investigative session HANDED OVER. **The check is the ITEM, not the note: this inbox carried the handover while ZERO `IS-` items existed in the queue, which is the same failure the 2026-08-04 handover made and the reason that rule is written down.** Enacted below in full.

**PLACEMENT — CONDUCT's call, and the reasoning is recorded so nobody re-opens it.** IS-1..IS-9 are enqueued INSIDE THE RECORD SECTION rather than as a new INVESTIGATIVE area. An area is a body of work with a queue, and a second area would contend for `store.mjs` and `index.mjs` with RECORD — which is the one thing `PARALLELISM.md`'s claim mechanism cannot protect against, since a claim reserves paths BETWEEN checkouts and two areas' workers would be claiming the same file. The IS ids are KEPT (not renumbered to `REC-`) so every item traces to `INVESTIGATIVE-SESSION.md` §18 by name. Milestones as Bob's entry directs: IS-1/2/4/7 M9, IS-5/6/9 M9, IS-3 M8, IS-8 M10 — **not M4**.

**SEQUENCING, from `IS-SWEEP-2026-08-07.md` §5a, and CONDUCT gates it:** the preconditions are queued FIRST and are all RECORD/M3 — **REC-60** (D-225's caps), **REC-61** (D-220's join), **REC-62** (D-222 staged A then C). **REC-59 lands before ANY new IS op** — it was already queued from REC-57's IC-24 and is now named as a hard precondition, since the bare-array pin allows exactly one exception and that exception is the op REC-59 itself fixes. Then IS-6 (the one unblocked start) and IS-1 in parallel; IS-3 behind D-216; IS-9's shape behind D-218's probe; IS-5 behind D-199's `ai` class; IS-8 last.

**UI-38's SCOPE IS AMENDED, which is the collision the sweep flagged and the one thing here that would have been expensive to discover late:** §14a says the running-session surface is designed ONCE for all AI features, and UI-38 was already building the assistant's surface registry — so two AI features would have grown two surfaces. UI-38 now absorbs E10 explicitly, carrying F11's finding that the budget is recorded and never SHOWN.

**§18's own heading still read "NOT HANDED OVER" and its body still carried the 2026-08-05 hold text.** Corrected in the same turn, because §18 is precisely what an IS worker reads and the stale sentence would have told them to stop. No entries outstanding.)_

---


**2026-08-10 · BOB · THE RETIRED SUBSTRATE IS OUT OF THE ARCHITECTURE RECORD** (Bob's
instruction, same day: no reference to the retired substrate's vendors belongs anywhere
in the architecture — reaffirmed with "Period.", which also answered DEC-67: the
platform-hosting advice to groups is swept too). Landed on `main` at 62e6328; all four
gates green.

**2026-08-10 · BOB · THE OPEN DECISION LIST IS DRAINED FROM THE CORPUS — five entries
closed, one debt ruling made, three work items for you.** Bob's standing instruction,
2026-08-10: many open decisions are already answered by the corpus; understand it before
returning a question to him. Applied:

- **DEC-53 answered** resting on DEC-52's "the machine may rule" (strictly stronger act
  already licensed). **Work item 1, measurement-class:** the accepts-without-reading rate
  on machine-composed resolution candidates — DEC-53's own watch number, nobody measures
  it today. Schedule as you schedule measurement items.
- **DEC-51 answered** resting on DEC-39: the plane publishes the fence wording WITH the
  act, so `addCapture` rendering the received note WHOLE at the moment of capture is the
  enactment. **Work item 2, UI:** render `acquireGradeNote`'s received text at capture
  (verbatim, DEC-49 discipline); UI-32's removal of the computed grade letter stands.
- **DEC-43 answered** — (b) then (a). **Work item 3, plane/DIST:** the fleet-visibility
  report of which instances still run monitoring on the ADMIN_TOKEN fallback; sunset only
  after DIST-2 + one cycle + the count read. (D-116's neighbourhood.)
- **DEC-48 answered** (no container until a group asks — CLAUDE.md's capability doctrine)
  and **DEC-50 answered** (the refusal stands — DEC-32's containment). Nothing to enact.
- **D-266's narrow ruling made in the row**: a dismissal is scoped to the key's own
  subject — instance-wide for shared-record findings (DEC-16's own reason), per-project
  for stance-scoped kinds (§7/D-216/R5). The stance-kind key widening carries the project
  identity; scheduling is yours.

Only **D-205** (rotate `BIO_ADMIN_TOKEN`) remains genuinely Bob's — it needs his hands.

_(drained by CONDUCT 2026-08-10 — the three work items and the D-266 scheduling, **enacted as ITEMS and not as a note**, which is the only form of drain this channel accepts. Work item 1 → **VF-6** in the M0 background lane (DEC-53's accepts-without-reading rate; the item's first obligation is to state what its proxy CANNOT see, because a proxy presented as the thing itself is this record's overclaim class arriving in an instrument). Work item 2 → **UI-54** (DEC-51: the note rendered WHOLE at the moment of capture, co-attestation clause included — the split is the defect, not the caution; UI-32's grade-letter removal stands). Work item 3 → **DIST-4** (DEC-43's (b), placed in DIST and therefore NOT CONDUCT's to run; the ruling's order — report, then DIST-2, then one cycle, then a count that is zero or a remainder KNOWINGLY ACCEPTED — is carried onto the row and is not CONDUCT's to compress). D-266's widening → **its own RECORD row**, narrow: the stance-scoped key carries the project identity, the shared-record key stays instance-wide, and widening both would erase the distinction the item exists to draw. **D-205 is Bob's and needs his hands — it is NOT enqueued**, and it is now closed: rotated and verified in both directions at `ad7d210`, which landed while this entry was still sitting undrained.

**TWO STRUCTURAL FAULTS FOUND WHILE DRAINING, both repaired in this turn, both recorded on the CLASS rather than the instance.** (1) **`cc99ec1`'s closed-item roll deleted five AREA headings** — `RECORD`, `CONTENT-PDF`, `FRAMEWORK`, `CONTENT-HTML`, `DIST`, `UI`, eleven headings down to six — because every item beneath them happened to be closed. No item was lost and no status moved; **what was lost was which area each surviving open item belongs to, and therefore which areas hold the two slots.** A bulk move keyed on ITEM status silently deletes any SECTION whose items are all closed, and a section is not an item. Restored verbatim from `c7fc5c3`, with the RECORD paragraph's fourth-stale `store.mjs` line count replaced by the command that measures it. (2) **The 2026-08-07 drain promised "one pointer row per wave slot" for `IS-BUILD-PLAN.md` and never wrote one** — no `PL-`/`FL-`/`SK-`/`VF-`/`DS-` row has ever existed in this file. **The plan was built anyway, off the plan document directly**, so the queue's silence was not an idle plan but an unrecorded one, which is strictly worse: it reads identically to nothing having happened. Repaired with the measured `## IS BUILD PLAN — STATUS` section — **34 rows landed, 3 satisfied before scheduling, 9 left, and the critical path is DIST's** — plus the SKILL track seeded DORMANT for promotion when a slot frees. **The 2026-08-05 drain wrote this exact lesson down after this exact failure, and it happened again two days later: a note is not an item.** No entries outstanding.)_

**2026-08-10 · BOB · A SURGICAL GATE PROFILE EXISTS: `node tools/gates.mjs`.** Bob asked
why a docs-only change costs ~25 minutes of gates. The tool measures the diff: entirely
prose under `docs/` → the doc-facing suites (derived at run time by grepping `test/` for
`docs/` readers, never a hand list) plus plancheck; ONE non-docs path → the full four,
unchanged. `--explain` prints the plan, `--full` forces everything. `CLAUDE.md`'s
verification section now names it, so every session loads it. Your loop's gate discipline
is unchanged in what it PROVES; only the wall clock for prose changes moves.
What changed for CONDUCT:

- **Three architecture documents were rewritten with per-reference judgment**, not
  find-and-replace: `BIO_Technical_Architecture_Decisions_v10.md` (revision log v5–v10,
  §8.4, §9's substrate rows, §10.4's registry and posture, §10.7–10.11 restated as
  rules), `BIO_Bundle_Skill_Composite_Design_v1_7.md` (revision log, inventory, §7–§9),
  `BIO_State_Rules_Consistency_v1_5.md` (banner and localized references). The retired
  runtime's own sections moved VERBATIM to `docs/archive/architecture/` (two files,
  indexed in `docs/archive/README.md`); the doctrine stayed, stated by property rather
  than vendor. Localized references in eleven further documents were rewritten in place.
- **The append-only ledgers were NOT touched** — their retired-runtime rows are dated
  records, not architecture. `BIO_Communications_Platforms.md` and R9's platform advice
  to adopting groups were also NOT touched; that is **DEC-67 (open)**, raised rather than
  folded in.
- **`mintid` floors were measured identical before and after** across all namespaces
  (the archive is in every corpus). `docs/DECIDED.md` regenerated.
- **No queue item is superseded and no worker should be stopped.** The one kickoff this
  supersedes is BOB's own (`BOB-NEXT.md`), corrected in the same turn.

## SESSION HANDOVER 2026-08-04 (CONDUCT → next CONDUCT; DIST splits off)

The CONDUCT session of 2026-08-04 ended when remote access was lost. **The resume prompt is
`docs/development/kickoffs/CONDUCT-NEXT.md`** — paste the block below its rule.

State at handover, all verified against `origin/main` rather than remembered: battery
**100/100 / 5,664**, coverage `--strict` exit 0 at 130/130 ops and 100/100 controls, UI
harness 34/34 with both guards, plancheck 0 fail / 0 warn. **Plane `biosmoke7` LIVE at
0.56.0 and UI `civicos` LIVE at build `74cc1646044b`**, the served page byte-identical to
`app.html` on main. No workers running, no worktrees but main and BOB's, and **no open
claims** — the last one (`rec10-agent`, 2026-08-03) was released as stale at handover with
its evidence, having held `bio-checks.mjs` and a large region of `store.mjs` for a day
after its session ended.

**DIST IS NOW A SEPARATE SESSION, and its resume prompt is `docs/development/kickoffs/DIST-NEXT.md`.** The next CONDUCT does not cut releases, deploy, or
touch `newgroup/**`, `release/**`, `deploy.mjs`, the plane version or tags. The baton reads
`holder: DIST since 2026-08-04` and belongs to that session. **DIST-2 and DIST-3 are its
items, not CONDUCT's.** Two things wait for it specifically: `BIO_RELEASE_SEED` is not on
this machine, so nothing has been signed and a group installing through `newgroup` still
receives **0.55.0** while the live instance runs 0.56.0; and **D-201** stays open until
`deploy.mjs` refuses the `civicos` slug by name.

Landed this session, for the record: REC-40 through REC-53, UI-28 through UI-37, M0-9, and
the first deploy of the accumulated work. Eight decisions are open with Bob, every one
running under a provisional.

---

Item format:

    ### <ID> · <queued | active | done | blocked | superseded>
    milestone:        <M0 … M10>
    scope:            <bounded description of the one piece>
    behind-interface: <I1 … I6 | none — what makes it independent>
    depends-on:       <IDs, or none>
    accepts-when:     <a command that passes, plus the negative control that must fail>
    added:            <date · CONDUCT|BOB>
    landed:           <commit, when done>

Standing gate for every item, from `VERIFICATION.md`: `npm run test:battery` green
(every suite, all reported), the item's own `accepts-when:`, the negative control RUN
and recorded in the suite's `NEGATIVE CONTROL:` line, and `npm run test:coverage`
showing no new unreached op.

---

_(drained by CONDUCT 2026-08-03 — the office-formats development plan: CONTENT-OFFICE
activated with both slots (COFF-1 ∥ COFF-2), COFF-3/4/5 queued behind them and IC-1,
COFF-6 out of band immediately; the area section below carries the six items verbatim
and the kickoff is written in the same act. IC-1 AS AMENDED (incl. `doc-para`) is
RESOLVED — CONDUCT answered AGREE on dormant FRAMEWORK's behalf in writing,
`INTERFACE-CHANGES.md` (protocol step 3). The dangling CPDF-10 dependency is fixed in
place: the handover's "CPDF-8" was RECONCILED §3.3's name for the FORMAT registry, now
COFF-1; the page-rendering question is decided by CPDF-9's placement measurement and
the renderer item is named when that lands. No entries outstanding.)_

_(drained by CONDUCT 2026-08-03 — the Opus 5 worker directive: the rule is added to
`kickoffs/CONDUCT.md`'s spawn step (loop step 1), where the spawning session actually
reads it, with the pin-at-spawn mechanism and the escalate-one-worker tactical
exception recorded. In-flight Fable 5 workers land rather than respawn (nothing is
gained by killing near-done work); every spawn from this drain forward pins
`claude-opus-5`. No entries outstanding.)_

_(drained by CONDUCT 2026-08-04 — DEC-35's answer: the premise reframed (the survey optimised for THIS instance; the product is sovereign instances), Moondream 3.1 on env.AI is the in-account candidate, NOTHING FUNDED, Azure DI Read the external escalation tier. CPDF-11 moved into CONTENT-PDF below and spawned out of band (measurement, no slot). CPDF-10's scope re-based on the ruling in place. The renderer note enacted: the dangling-CPDF-8 flag in the entry was stale (corrected to COFF-1 on 2026-08-03) but its SUBSTANCE is live — Moondream consumes pixels, so the page-to-image renderer is now named as CPDF-12, queued behind CPDF-11's verdict. DEC-35's enacted line filled. No entries outstanding.)_

_(drained by CONDUCT 2026-08-04 — the calibration-drift entry: D-183 acknowledged (the chain records the ENGINE, the grade rests on a MEASUREMENT, nothing links them — one field wide); the calibration construct enqueued as CPDF-13 (RENUMBERED from the entry's CPDF-12, which collided with the renderer item CONDUCT allocated and pushed earlier the same day — the established collision protocol, later allocation moves), engine-generic per the D-164 lesson, the asymmetric drift handler and the changelog-may-only-accelerate rule carried verbatim, deps CPDF-11. CPDF-11 unchanged, still running. No entries outstanding.)_

_(drained by CONDUCT 2026-08-04 — three entries. **DEC-42/Workers Paid:** the correction accepted with thanks (wasm OCR was never ruled out on SIZE — a dedicated third fleet member fits at 2.72 MB gz, 0.72 with the model in R2; it was ruled out on CPU, and Paid moves that line from 10 ms to 30 s), so (1) D-54 re-scoped as M7's sharpest item — the installer REQUIRES and VERIFIES Paid and refuses to complete honestly, queued as DIST-3; (2) CPDF-12 RE-SCOPED AGAIN, tesseract-fleet-member-first with the deployed wasm CPU probe (now unblocked — the third entry measured the plan, HTTP 200 with cpu_ms echoed, and measured the PLAN ONLY: a GO still has to be earned on the runtime, and memory is unmeasured at 33.6 MB per RGBA frame against 128 MB), carrying the observation that may remove the renderer entirely — on the measured exhibit each page is ONE full-page embedded image, so the image-only class wants EXTRACTION not rasterisation, to be verified across the corpus before anything is built; (3) CPDF-10's placement becomes in-account tesseract pending that probe, external still unfunded; (4) D-185 (the free-tier frugality code) is NOT deleted — recorded on its row. **The leak (D-186):** M0-8 moved into the M0 lane and spawned FIRST, ahead of every other item, because the leak scales with CONDUCT's own throughput — the sweep must spare a running battery, which is not hypothetical. Gratitude noted for the 37.2 GB reclaimed carefully. **The paid upgrade:** enacted into CPDF-12's scope as above. No entries outstanding.)_

_(drained by CONDUCT 2026-08-05 — five entries, and the outgoing handover was wrong about
them. `kickoffs/CONDUCT-NEXT.md` records the inbox as empty and it was not. FOUR were in
fact ENACTED and merely never deleted — DEC-40 → UI-27, DEC-41 → CPDF-12's scope, DEC-44 →
REC-44/UI-29, DEC-45 → MILESTONES M6, DEC-46 → REC-47 + M4/M6 — every `enacted:` line read
out of `DECISIONS.md` and checked against a real queue item before anything was deleted,
rather than taken on trust. No change was lost by those four. **The fifth — THE ASSISTANT IS
THE PILOT AI INTEGRATION — was GENUINELY UNDRAINED.** `ASSISTANT-PILOT.md` landed as a
design (b78f979) and nothing in the queue pointed at it, so its build order reached no
worker and would have reached none. Enacted now: §7 step 1 — the surface registry and the
recipe format with their build-time validation, which needs no AI — is queued as **UI-38**;
steps 2–6 stay deliberately unqueued behind it, because step 1's registry is the thing the
later steps validate against and D-199 already carries the `ai` class design step 3 needs.
**The lesson, recorded here rather than filed away, because it is the failure mode this
channel exists to prevent: an inbox entry with no queue item is UNDRAINED no matter what the
handover says. The check is the ITEM, not the note** — which is the same rule as
`ORCHESTRATION.md`'s "a mechanism that is not in the loop the reader actually runs is not a
mechanism", arriving one altitude up.)_

## M0 — VERIFICATION · cross-cutting, a BACKGROUND LANE (holds no slot)

Test-estate work spanning every area. CONDUCT spawns a worker per item with a claim on
the specific files. These are cheap, they touch no plane behaviour, and they raise the
floor everything else is judged against.

### D-280 · queued
milestone: M9
interface: possibly I3 — `op=strengthbarof`'s answer changes for a withdrawn citer; if the published shape moves, file the IC
depends-on: none — D-267 landed (merge above) and its `#refEdgeSevered` predicate is the thing to reuse
scope: **`DEBT.md`'s D-280 row is the authority and it is on `main`; do not re-derive its corpus.** It printed the census (15 reverse-edge reads over `refs`/`inquiry_basis`, 6 confirming, 9 not) and named each of the six by method with its reach. **The strongest is `#requiredStrengthFor` and it is DRIVEN**: a project whose only citing relation is `status: severed` still answers `declared: true` and sets the publication bar on a document it left. **Take the DRIVEN one first** — it is the live harm and the others are graded by reach beneath it. **`#leadBasisAbsence` is named UNDETERMINED in the row rather than scored, and it must stay a judgement you ARGUE, not one you inherit.** Reuse D-267's ONE severance predicate; a second implementation is the shape that has already absorbed a control here. **Severance narrows only on a positive recorded withdrawal** — unreadable is live, unrecorded is live, an unrecognised `status:` spelling is live — because a fence tighter than its rule drops homes nobody gave up.
accepts-when: the driven site refuses to count a severed citer, driven THROUGH `op=strengthbarof` and not asserted at the store; each remaining site of the six either fixed or NAMED with the reason it is not; `cd bio-plane && npm run test:battery` green — **measure your own baseline and trust it over this row**, any delta attributed per suite by RE-RUNNING the true baseline; `node scripts/coverage.mjs --strict` run DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` exit read unpiped from the repo root.
NEGATIVE CONTROL: run and recorded, each arm armed ALONE, restores verified by sha256 AND content, the harness INSIDE your own worktree — (1) revert the confirmation at the driven site and the bar arm must fail naming it; (2) **an OVER-STRICTNESS arm that is the point of this item**: a citing project with NO recorded status, and one with a `status:` spelling you did not anticipate, must both still read as LIVE homes; (3) neuter the corpus walk you use and its reach must fail as a DELTA with the corpus size PRINTED.
added: 2026-08-10 · CONDUCT (D-267's sweep residue, routed at D-267's integration rather than left in the debt file)

### D-282 · queued
milestone: M0 (background lane, holds no slot)
interface: none — test estate; it changes no plane behaviour
depends-on: none
scope: **`DEBT.md`'s D-282 row is the authority.** The mechanism is measured and reproduced: `hygiene.test.mjs` ends `process.exit()`, and when stdout is a PIPE those writes are asynchronous, so `process.exit` returns to the OS unflushed. **191,434 bytes reached a FILE and 89,329 reached a PIPE in the same run — 102,105 bytes of TAIL discarded, and the tail is where the tally lives.** `scripts/battery.mjs:413` spawns EVERY suite with default stdio, which is a pipe. **`maxBuffer` was tested and killed as a hypothesis; do not re-run that experiment.** The amplifier is `t()`: D-237 caps the failure LABEL at 8 entries and then prints `want … got …` with the FULL array, so the cap defends nothing at the only moment it matters. **THE THRESHOLD AND THE HISTORICAL REACH ARE BOTH UNDETERMINED and the row says so — narrowing either is worth more than a tidy fix, and "unknown" stays stated if you cannot narrow it.**
accepts-when: a deliberately-flooding suite reports its TALLY through a pipe, asserted; the `got` dump capped the way its label already is, or suites flush before exiting, with the choice ARGUED; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) restore the unflushed exit and the flooding-suite arm must FAIL, which is the arm proving the fix is what carries the tally; (2) an OVER-STRICTNESS arm: a genuinely large but READABLE failure must not have its useful diagnosis truncated by your cap — a fix that makes every failure unreadable is the opposite defect; (3) D-93's original shape re-run and still green, so the two are independent rather than one thing measured twice.
added: 2026-08-10 · CONDUCT (D-249's control arm caught ITSELF; the arm was right while the harness was wrong)

### D-265 · queued
milestone: M0 (background lane, holds no slot)
interface: none
depends-on: none
scope: **`DEBT.md`'s D-265 row is the authority.** `hygiene.test.mjs`'s walk census grades the file the walk is IN, so `scripts/op-claims.mjs` walked the whole repository and `test/op-claims.test.mjs` floored on four figures derived from that walk — and the census never enumerated the second at all, because it contains no `readdirSync(`. **Both instances are already GUARDED, so this row is about the DETECTOR and not a live exposure; a fix that only closes the instance closes nothing.** The row names two shapes and prefers the second: extend the census to a second question (does this file import an identifier from a walking module, and does a floor here derive from it), or **make the exported walks themselves carry the classification so a floor computed from an unguarded corpus is impossible to WRITE rather than merely detectable.** That is REC-70's inversion — *a list of spellings goes stale silently the moment a fourth is written* — and it is the reason to prefer it.
accepts-when: a file that floors on an imported walk is either GUARDED or NAMED, never silently graded harmless; **the census's REACH asserted as a DELTA with the corpus size PRINTED**; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) write a NEW file that imports a walk and floors on it, in a spelling you did not anticipate, and the census must either GUARD it or NAME it — never score it clean, which is the arm this item exists for; (2) neuter the census and its reach must fail as a DELTA with the corpus size printed; (3) an over-strictness arm — a file that merely imports a walking module without flooring on it must NOT be failed.
added: 2026-08-10 · CONDUCT (M0-18's residual, routed here rather than left sitting)

### D-251 · queued
milestone: M2 — **CONTENT-PDF is PROMOTED for this item** (it has been DORMANT since 2026-08-03; activation order is CONDUCT's, ruled 2026-07-31)
interface: I2 — a `producer` field on the text shape is ADDITIVE; file the IC row with measured consumer impact
depends-on: none — CPDF-9 and CPDF-10 both landed and their measurements are the ground
scope: **`DEBT.md`'s D-251 row is the authority, and CPDF-9's measurement is the reason it is not theory: 3 of 14 recent Legistar attachments name ABBYY FineReader in their producer metadata — the Clerk's CERTIFIED ENACTED RESOLUTIONS carrying garbled OCR overlays the record has been reading as authored text.** Build the trailer's `/Info` `Producer`/`Creator` read in `pdfstructure.mjs` (measured: zero matches for `Producer` in that file today), carry it as a `producer` field on I2's text shape, and compose the chain step from it in `index.mjs`'s acquire assembly. **THE DESIGN IS THE DEFAULT AND NOT THE TABLE:** a layer whose producer names OCR software becomes `layer -> ocr(<product>)` with the product NAMED; a layer with no such marker stays **`undetermined`, NEVER "authored"** — an absent marker is an absent marker. **The classification may only ever make the claim WEAKER.** That is `CLAUDE.md`'s *undetermined is first-class and must be STATED* on one field, and a lookup table of product names would be the record claiming more than it can support one field wide on every document in the store.
accepts-when: a fixture PDF whose `/Info` names an OCR product reads `layer -> ocr(<product>)` with the product named, driven through the acquire op and not asserted at the parser; a fixture with NO marker reads `undetermined` and never "authored"; the IC row filed with measured consumer impact; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) remove the `/Info` read and the named-engine arm must fail; (2) **the arm this item exists for: make the classification able to STRENGTHEN — let an absent marker read as "authored" — and an assertion must fail naming it**; (3) an over-strictness arm: a producer string in a spelling you did not anticipate must leave the layer `undetermined` rather than crash or guess.
added: 2026-08-10 · CONDUCT (CPDF-9's third amendment to DEC-4; the highest-value unbuilt half of CPDF-10)

### VF-6 · queued
milestone: M0 (background lane, holds no slot) — **a VERIFY-track instrument, run out of band the way COFF-6 and CPDF-9 were**
interface: none — it measures, it does not publish a shape
depends-on: none
scope: **DEC-53's WATCH NUMBER, and the reason it is an item rather than a note is that the ruling CARRIED it forward rather than dropping it.** DEC-53 was answered 2026-08-10 by resting on DEC-52 ("the machine may rule" — a member accepting a ranked, honestly-graded candidate is strictly WEAKER than what DEC-52 already licenses), so the cap-at-C alternative is closed. **What the answer explicitly did NOT close is its own recommendation's caveat: *"the number to watch is how often a member accepts without reading, and nobody is measuring that today."*** That sentence is the entire item. **MEASURE, DO NOT ASSUME:** the accepts-without-reading rate on machine-composed resolution candidates, with its date and instrument, into `MEASUREMENTS.md`. **DECIDE THE INSTRUMENT HONESTLY AND SAY WHAT IT CANNOT SEE** — "read" is not directly observable, so the item's first obligation is to state what the proxy actually measures (time-to-accept? whether the candidate's detail was ever expanded? acceptance of a candidate whose `grade_if_resolved` is null?) and what it would MISS, rather than shipping a number whose meaning nobody stated. **A proxy presented as the thing itself is this record's own overclaim class arriving in an instrument** — the same failure as a self-reported confidence thresholded as calibrated (CPDF-10's forbidden pseudo-confidence), one altitude up. A stated `undetermined` is a legitimate result here and must be first-class: if the surfaces cannot distinguish read from unread, that ABSENCE is the finding and is worth more than a fabricated rate.
accepts-when: a `MEASUREMENTS.md` row, dated, naming the instrument and what it CANNOT observe, carrying either the rate or a stated `undetermined` with the reason; the figure derived from recorded acts rather than from a hand count.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) **the arm this item exists for: state the proxy AS the quantity ("members accept without reading N% of the time") and the instrument's own honesty assertion must fail naming the proxy** — the number's caveat is load-bearing and travels with it or the number is worse than nothing; (2) feed the instrument a fixture where no read/unread signal exists at all and it must answer `undetermined`, never zero — an absent signal and a measured zero are different facts and must not read alike.
added: 2026-08-10 · CONDUCT (draining the 2026-08-10 BOB INBOX entry, work item 1; DEC-53's carried watch item, decided the same day)


## RECORD — ACTIVE (re-promoted 2026-08-05; the 2026-08-01 handover order is fully DRAINED and the area now runs D-200)

**HEADING RESTORED 2026-08-10 by CONDUCT — it was DELETED, with four others, by the
closed-item roll at `cc99ec1`.** The roll moved 195 done/superseded items out correctly and
took five AREA headings with them (`RECORD`, `CONTENT-PDF`, `FRAMEWORK`, `CONTENT-HTML`,
`DIST`, `UI` — 11 headings down to 6), because every item under those headings happened to
be closed. **No item was lost and no status changed; what was lost was which AREA each
surviving open item belongs to and which areas hold the two slots** — so `REC-69` and
`REC-15` read as M0 lane items, `DIST-2`/`DIST-3`/`UI-53` read as CAPTURE items, and the
queue could not answer "what is active" at all. Restored verbatim from `c7fc5c3`, the
commit before the roll. **The lesson is the roll's, not the roller's: a bulk move keyed on
ITEM status silently deletes any SECTION whose items are all closed, and a section is not
an item.** Recorded on the class rather than the instance.

Owns the store core and retrieval (`PARALLELISM.md`). Claim it in `CLAIMS.md` before
editing; **`store.mjs` needs `grep -a`, and its size is MEASURED not quoted** — `wc -l <
bio-plane/src/store.mjs` reads **25,861 (2026-08-10)**. The verbatim restore of this
paragraph carried "16,287 lines (MEASURED 2026-08-04)", which was the FOURTH stale instance
of this figure and is exactly what `CLAUDE.md`'s own trap entry now forbids quoting — so the
number is replaced by the command that produces it, and the date stands as a reading rather
than a fact. CAPTURE holds the link/capture/task/reachability functions, so name paths
precisely.

The 2026-08-01 handover run order (REC-10 → REC-19 → REC-11 → REC-13 → REC-12 → REC-14) is
DONE, and the area drained on 2026-08-04 — UI took the freed slot. It is re-promoted
2026-08-05 because **D-200 is RECORD ground and had no owner**: ten live bundles claim a
provenance route they cannot show, which is live record state no other area can touch.

### REC-69 · done

**CLOSED 2026-08-10 by CONDUCT, BY THE CHECK THIS ROW ITSELF NAMED.** The row read *STILL NOT
MERGED* and instructed: *"Mark it `done` when the merge is verified with `git merge-base
--is-ancestor`."* That check now PASSES for both branches — `worktree-agent-a5723f4c87dfd5bd0`
(`2d9c57b`, the original) and `worktree-agent-a7e307e5502e319c0` (`bb7b026`, the replay) are
both ancestors of `main`. **The replay landed at `b376c9e`**, with the register floor moved
after it at `ae34ec8`.

**THE TWO RATCHETS THIS ROW EXISTED FOR WERE BOTH ANSWERED, and the answer is worth keeping.**
`run-conditions.test.mjs` ARM W3 fired because `aiRuns` was a thirteenth reader with no ROLE
entry — resolved by MINTING A FIFTH ROLE, `SELECTS`, rather than forcing a bad fit
(`CLAIMS.md`, DECISION 2026-08-09 RECORD). Not `PUBLISHES`, because every run fact it returns
is composed by `aiRunRead` and asserted byte-identical to `op=airun`'s own block — twenty
disposition cells that are each a COPY, and **a copy agrees with its original for free while a
second declaration can drift from the reader it describes.** Not `AUTHORISES`, because no act
is authorised and filing it there would weaken what that role currently claims. The role is
EARNED: ARM W8 fails a SELECTS reader that projects a stored column beyond the key or calls no
PUBLISHES reader, ARM W8 GUARD fails over an empty SELECTS corpus, and ARM W8b proves the
reader can see both violations. `airuns.test.mjs`'s unqueried-index roster was re-measured
11 → 13 with both arrivals named, per its own rule that the list may not shrink without the
figure moving.

**STATUS WAS STALE FOR TWO DAYS AND THIS IS THE FOURTH INSTANCE THIS MONTH** (PL-18 `queued`,
PL-19 `running`, UI-53 `running`, now REC-69 `NOT MERGED` — every one of them with its work on
`main`). This one cost the most: it held RECORD's slot, and the reason it was believed is that
the row argued its case at length and persuasively. **A row that explains WHY it is not done is
not evidence that it is not done** — the row named the one-line command that settles it, and
nobody ran it. **One STATED-AND-NOT-DECIDED question is carried forward rather than closed with
the item:** whether a SELECTS reader publishing a fact COMPUTED FROM the rows it selected (a
count, a newest timestamp) is still SELECTS. ARM W8 reads the SQL projection, not arithmetic
over the page, and would not catch it. It is named at the site and is not a defect today.

**The branch `worktree-agent-a5723f4c87dfd5bd0` (`2d9c57b`) is GREEN ON ITSELF and is NOT
defective.** It was merged at the rebuild integration, its four source conflicts hand-resolved
(including the `airun.mjs` `};` and the `store.mjs` import that the handoff named), and the
merged tree then failed TWO RATCHETS THAT ONLY FIRE ON THE PAIR. It was reverted rather than
forced, and the revert is `git revert -m 1` so the resolution work is in the history and can be
replayed.

**WHAT FIRES, and both are cross-item by construction:**

1. `test/run-conditions.test.mjs` **ARM W3** — *"a thirteenth reader lands here as a FAILURE
   naming itself"*. REC-74's `ROLE` table classifies every method that reads `ai_runs` as
   PUBLISHES / WRITES / AUTHORISES / HOUSEKEEPS. REC-69's `aiRuns` is a new reader and has no
   entry, **so the suite is doing exactly what it was built to do.**
2. `test/airuns.test.mjs` **SWEEP** — the unqueried-index roster is pinned as a ceiling AND a
   floor at exactly 11, and the merged tree is over it.

**WHY CONDUCT DID NOT JUST CLASSIFY IT.** `aiRuns` reads the row to SELECT which runs to return
and delegates the per-run publishing to `aiRunRead`; its own answer echoes the context
NORMALISED FROM THE CALLER'S INPUT rather than from the stored column. Whether that is
PUBLISHES (and therefore owes a disposition for every stored column in ARM P1's matrix) or is
something the four roles do not yet name **is a judgement about what the record publishes**, and
a wrong answer installs a false assertion about exactly that. **That is RECORD's call, and
CONDUCT writes no area code.** Guessing it to get a green push is the failure this project calls
overclaiming.

accepts-when: `aiRuns` carries a ROLE with its reasoning at the site (and, if PUBLISHES, its row
in ARM P1's matrix); the `airuns.test.mjs` index ceiling/floor is re-measured on the merged tree
with the new index NAMED, per its own rule that the list may not shrink without the figure moving;
full battery green from the main checkout, `--strict` exit 0 unpiped, `node civicos-ui/test/run.mjs`
exit 0 from the repo root, plancheck clean. **Rebase onto `main` first — ten items landed after
this branch was cut.**

depends-on: none. **This is the top of RECORD's queue.**
**STATUS CORRECTED 2026-08-08 by CONDUCT. The `landed:` prose below is ACCURATE ABOUT THE WORK AND FALSE ABOUT THE LANDING.** This item is complete and green on its own branch and is NOT in `origin/main`. CONDUCT merged in a loop and checked the wrong signal — `git merge` refuses while a previous merge is unresolved, so later merges silently no-opped, and the loop grepped for a `CONFLICT` count that was zero BECAUSE git had errored out. **Caught only because a worker went looking for an op it had been told existed and found nothing.** Do not delete the entry: a described item that vanishes is indistinguishable from one nobody did. Mark it `done` when the merge is verified with `git merge-base --is-ancestor`.
milestone: M9
scope: **`op=airuns&contextType=&contextId=` — list the runs attached to an inquiry or project, because NO OP CAN ANSWER THAT QUESTION TODAY and §14a's promise names the teammate explicitly (UI-49's delegation).** Measured by UI-49: `op=airun` and `op=airunlog` are both keyed by RUN ID, `ai_runs` is queried by `run` at **all 14 sites**, and `op=airunopen` has no UI consumer — **so a window cannot ask which runs are in its context, and the browser never learns a run id by opening one.** UI-49 delivered the call site against the only source that exists, **the run addresses THIS DEVICE has already opened** — which is honest and is pinned (the device stores addresses and never context, so it cannot claim a run belongs anywhere), **but it reaches only the member who already held the address, and §14a's promise is about the teammate who did not.** The shape UI-49 needs: **gated on `context_id` through the same `#bundleGate`, the same `session` shape per row, and BOUNDED with its bound PUBLISHED.** When it lands, **exactly one function changes on the surface** — UI-49 built the seam for it. **Enveloped per IC-25/IC-26**: publish the cap AFTER clamping and whether it truncated, in a spelling the plane already uses; a bare collection fails a pin that reads ZERO with no exception list to join. Every refusal carries a C-number with a DEC-49 code and a canned translation.
behind-interface: I3
depends-on: none
accepts-when: `cd bio-plane && npm run test:battery` green — **measure your own baseline and trust it over this brief** — any delta ATTRIBUTED per suite; with runs listed for an inquiry and for a project, **a run in ANOTHER context absent from both**, an uninvited member's answer WITHHOLDING the row entirely rather than redacting it (REC-36's rule), and the bound published; the IC filed; `node scripts/coverage.mjs --strict` run DIRECTLY, `$?` unpiped, exit 0, the new op carrying a control-plane assertion in the same turn. NEGATIVE CONTROLS run and recorded — (1) drop the context filter and a foreign run appears, FAILING by name; (2) drop the gate and an uninvited member reaches a row, FAILING; (3) redact instead of withhold → FAILS; (4) answer a bare collection → the ZERO-bare-array pin FAILS naming the op; (5) polarity checked.
added: 2026-08-07 · CONDUCT (UI-49's delegation; §14a's promise reaches only the device that already holds the address)

### D-266 · queued
milestone: M9
interface: I3 — the disposition key shape moves for stance-scoped kinds; file the IC with measured consumer impact before building
depends-on: none — both rulings the widening waits on are MADE (2026-08-09 doctrine, 2026-08-10 scoping)
scope: **`DEBT.md`'s D-266 row is the authority, and what remains is NARROW: the widened disposition key for STANCE-SCOPED kinds, carrying the PROJECT IDENTITY.** Both rulings the row waited on are made, and **neither was Bob's, because the repository already answered both** — (i) 2026-08-09: a disposition is a fact about the subject's STABLE IDENTITY, not about the inputs; it stands until re-triaged; it AGES the finding and never deletes it (D-79, and `proposeDispose`'s own header says so at the site); (ii) 2026-08-10: **a dismissal is scoped to THE KEY'S OWN SUBJECT.** DEC-16's instance-wide clearing is instance-wide *because its subject is* — a progression-stage finding is a fact about the SHARED record, so one act clearing it everywhere is dedup, not judgment-suppression. A stance is expressly one project's own property (§7, D-216), a dismissal is a judgment-layer act, and R5 makes forks at the judgment layer legitimate — **so one team's dismissal of a stance-scoped finding governs THAT TEAM'S feed and nothing else**, exactly the boundary `#findingsStanceDiverged` already enforces by refusing to offer `op=versioncurrent` across projects. The two rules never pointed opposite ways; they scope by subject. **NOTHING TO MIGRATE, WHICH IS WHY THIS IS CHEAP NOW AND WILL NOT BE LATER:** no disposition has ever been recorded for these kinds. The three kinds carrying no `(progression_key, stage_key)` pair are PL-15's `out-of-inquiry-lead` and PL-13's two shared-inquiry slugs. **DO NOT WIDEN THE INSTANCE-WIDE KIND'S KEY WHILE YOU ARE IN THERE** — the shared-record kinds stay instance-wide by the same ruling that scopes the others per-project, and widening both would erase the distinction this item exists to draw.
accepts-when: a stance-scoped finding dismissed in project A **still fires for project B**, driven through the control plane, while a shared-record (progression-stage) finding dismissed anywhere clears everywhere — the two behaviours asserted in the SAME suite so the distinction is pinned rather than implied; the IC filed with measured consumer impact; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) **the arm this item exists for: key the stance-scoped disposition instance-wide and project B's finding must vanish, FAILING by name** — one team silencing another team's notification about that other team's own stance is the defect the scoping ruling forbids; (2) scope the shared-record kind per-project and the dedup assertion must fail (DEC-16's own reason, in the opposite direction); (3) an over-strictness arm — a re-triage must still be able to change a standing disposition, since D-79 ages findings and never freezes them.
added: 2026-08-10 · CONDUCT (draining the 2026-08-10 BOB INBOX entry — "the widening itself is CONDUCT's to schedule"; both rulings made, the row narrowed rather than closed)

### REC-15 · blocked
milestone: M10
scope: **`op=publishpreflight` — the ceremony's ordering argument in one op. DEFERRED by DEC-33** (Bob, 2026-08-03: the publication ceremony process is deferred; publication runs through the operator for now). Trigger: Bob reopens the case-making thread. Recorded for when it wakes, so the deferral loses nothing: base scope as `BUILD-ORDER.md` §2 (REC-15) with `RECONCILED.md` §3.2's C-4 correction (`NO_SIGNERS` is INSTANCE-WIDE — the refusal detail must never say "for you", D-57); **DEC-15** — refuse `UNCLEARED_HUNCH` naming every hunch leg, in the same list as `NO_SIGNERS`, before any signature exists; **DEC-20** — only a hunch blocks publication on bias grounds; ordinary bias is DISCLOSED (the manifest SHOWN in the artifact, not merely cited) and refused on nothing; **DEC-17** — refuse `BELOW_PROJECT_STRENGTH` naming the axis; **D-158** bounds the per-member signing-key pre-flight (a signer row for a never-enrolled member reads `active` and is refused by ratify — fix at `signerAdd` write, assert the other view); §4 Q11 measured YES — `op=signerlist` + `op=whoami` make the per-member pre-flight computable client-side, an ADDITION to instance-wide `NO_SIGNERS`, not a replacement, until D-158 closes.
behind-interface: I3
depends-on: REC-14
accepts-when: (on waking) as `BUILD-ORDER.md` §2 (REC-15) plus — preflight reports `UNCLEARED_HUNCH` naming each hunch leg and `BELOW_PROJECT_STRENGTH` naming the axis, each BEFORE any signature exists, writing nothing; negative control — attach per-member wording to the instance-wide `NO_SIGNERS` and the suite fails; clear a hunch and the refusal disappears without any other state change.
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33

## CONTENT-PDF — DORMANT, restructured by the topology decision.
CPDF-7 runs OUT OF BAND (measurement-only, holds no slot) and should run early: it
decides whether the pdf-worker path is central or marginal. *(Heading restored 2026-08-10
by CONDUCT — see the note under RECORD.)*

### CPDF-3 · blocked
milestone: M2
scope: Live-verify pdfstructure against real captured Oakland PDFs (the agenda→item graph) via `op=pdfstructure`, in a `biosmoke-pdf` scratch namespace; sweep after.
behind-interface: I1
depends-on: CAP-1 (done), a DIST deploy
added: 2026-07-31 · CONDUCT
landed:

---

### CPDF-10 · queued
milestone: M2
scope: **The Tier-3 OCR path, behind whatever placement CPDF-9's measurement permits.** PLACEMENT RE-BASED BY DEC-35 (2026-08-04, superseding the 2026-08-03 service-first note): in-plane and pdf-worker stay RULED OUT by bundle size; the IN-ACCOUNT path is the DEFAULT and its engine is now TESSERACT AS A FLEET MEMBER pending CPDF-12's deployed probe (DEC-42: Moondream returned NO-GO on coordinates; tesseract was never blocked on size, only on the Free CPU ceiling Paid removes) — sovereign instances must not need a second vendor account (the D-115 class); the EXTERNAL service (Azure DI Read primary) is the ESCALATION tier or the fallback on NO-GO; NOTHING FUNDED. Per-region confidence becomes confidence-WHERE-SUPPLIED, else a stated confidence: none in the chain with the fidelity cap set by measurement; pseudo-confidence (a self-reported number thresholded as calibrated) FORBIDDEN as the costs-nothing class; measured self-refusal (CPDF-11's degradation ladder) is the only earnable per-region trigger. The provenance chain and the image-region anchor UNCHANGED, non-negotiable. Deps gain CPDF-11 and (on GO) CPDF-12. D-152, DEC-4 as twice amended. THE PROVENANCE RULE IS THE ITEM, not the engine: **`text_source` records a CHAIN, not a token** — `pixels → ocr(engine, version) → ai(function, version) → attested(member, date, extent)` — each step naming what performed it, and **each step can only weaken the claim, never strengthen it** (an AI that cleans a garbled line produced more READABLE text, not more RELIABLE text; the hazard of this capability is output that looks better than its input — do not let the chain collapse to a single label). A text LAYER is itself an unverified transcription (`pdfstructure.mjs` already decodes through the file's own `/ToUnicode` map), so **the ceiling is VERIFIED AGAINST THE RENDERED IMAGE, reachable from both paths**: member attestation is offered on a text layer too, SCOPED to what was actually checked (a leg citing outside the attested extent does not inherit it); the chain is still recorded — verification supersedes it as grade determinant, never as record. Attestation is a member act refusable to a machine credential. Transcription fidelity BOUNDS the capture axis (weakest link of byte provenance and fidelity) — no third scale, no new machinery. A basis leg resting on OCR'd text carries its image region (page + rect); OCR never raises a capture grade; a low-confidence region reads `undetermined`, never a best guess. Text reaches the READING path via FW-15's wire.
behind-interface: I2
depends-on: CPDF-9, COFF-1, CPDF-11, CPDF-12-on-GO (dependency corrected 2026-08-03: the handover's "CPDF-8" was RECONCILED §3.3's name for the FORMAT registry, carried as COFF-1. The page-to-pixels rendering path BOB flagged as the other candidate reading is real but is DECIDED by CPDF-9's placement measurement — an external-service placement needs no renderer; an in-plane or fleet placement does — so the renderer item is named when that recommendation lands, not pre-built.)
accepts-when: `cd bio-plane && npm run test:battery` green with a real image-only Oakland PDF yielding text whose `text_source` chain names each step with per-region confidence and reaching `reading_refs`, while a text-layer PDF yields its own honest chain and the two are distinguishable in the projection, the index and an export; an attestation is refused to a machine credential and scoped to its extent; negative control — strip the `text_source` marker and the suite fails naming an OCR'd document indistinguishable from a published text layer; drop the confidence floor so a garbled region emits a best guess and the suite fails; collapse the chain to one label and the suite fails.
added: 2026-08-01 · BOB · amended 2026-08-02 ×2 · enqueued 2026-08-03 · CONDUCT

## CONTENT-OFFICE — DORMANT (queue DRAINED 2026-08-03: COFF-1..7 all done; the office-format axis is built end to end)

New area, from BOB's 2026-08-03 office-formats decomposition. Owns the OOXML container
reader and the office format entries (`bio-plane/src/ooxml.mjs`, `bio-plane/src/formats.mjs`,
the per-format entry modules, their tests), and builds the FORMAT registry (COFF-1).
Registry ownership rests here for now; promote it only if it becomes a cross-area
bottleneck. COFF-1's claim must NAME the two dispatch touchpoints it moves
(`index.mjs`'s acquire-time `HTML_CT` site and the read-time `op=pdfstructure`
dispatch) — CAPTURE and CONTENT-PDF are both dormant, so that is a claim with a note,
not a live delegation. Kickoff: `kickoffs/CONTENT-OFFICE.md` (written at activation,
one act). NAMING NOTE, so no reader hunts for ghosts: `RECONCILED.md` §3.3 lists this
same work as "CPDF-8 (the FORMAT registry)" and "CAP-5 (the OOXML container)" — those
names were never enqueued; COFF-1 and COFF-2 are the items.

### CPDF-13 · queued
milestone: M2
scope: **The CALIBRATION construct and its scheduled re-probe (D-183).** (a) A
  calibration is a dated, identified fidelity measurement of a named derivation
  engine+version, stored, with the probe inputs and scores that produced it. (b)
  `text_source`'s chain gains a calibration REFERENCE at each derivation step, so a
  transcription names the measurement its grade rests on. (c) A sixth REC-1 alarm
  consumer re-runs the probe on a cadence (start monthly; the cadence is a declared
  constant, revisable by measurement, and it runs on the INSTANCE'S OWN account —
  one probe per cadence against the free allocation, which the plan must state so
  no group discovers it as a surprise). (d) The ASYMMETRIC drift handler above: a
  worse calibration raises a re-evaluation obligation naming exactly the affected
  transcriptions and re-grades NOTHING; a better one raises nothing. (e) An
  announcement watch is OPTIONAL and may only shorten the interval to the next
  probe — it may never stand IN for one, and it may never itself change a grade.
  Build the construct ENGINE-GENERIC (pdf.js Tier 2 and any future service are
  calibratable by the same shape), not OCR-specific.
behind-interface: I2 (the chain shape), I5 (the calibration table)
depends-on: CPDF-11 (its GO/NO-GO decides whether Moondream is the first subject —
  the construct is worth building either way, since Tier-2 pdf.js already needs it)
accepts-when: `cd bio-plane && npm run test:battery` green with a transcription
  naming its calibration; a second calibration measuring WORSE raising a
  re-evaluation obligation that names exactly the transcriptions bound to the
  superseded one and changes no grade; a calibration measuring BETTER raising
  nothing; the alarm consumer registering and self-terminating per `SCHEDULER.md`;
  negative controls — (1) make the drift handler re-grade automatically and the
  suite fails naming the no-machine-mints-a-grade rule, and (2) let a changelog
  signal alone mark a calibration current with no probe run, and the suite fails
  naming the claim-versus-measurement rule.
added: 2026-08-04 · BOB (as CPDF-12; RENUMBERED CPDF-13 by CONDUCT at drain — the id collided with the renderer item CONDUCT allocated and pushed earlier the same day, the 2026-08-03 D-/DEC- collision protocol applied) · enqueued 2026-08-04 · CONDUCT

## CAPTURE — DORMANT.
CAP-3 runs OUT OF BAND: it touches only CAPTURE's own paths and contends with neither
active area. CAP-4 is decided and queued behind it.

## FRAMEWORK — DORMANT (FW-15 landed 2026-08-03; FW-13/FW-14 wait on REC-11/REC-19 — the slot returned to RECORD)
*(Heading restored 2026-08-10 by CONDUCT — see the note under RECORD. Every FW item is
closed and sits in the register below; the area's DORMANCY REASON is the thing that was
lost, and it is why the heading is worth restoring with no items under it.)*

## CONTENT-HTML — DORMANT
Not yet carvable; see `kickoffs/CONTENT-HTML.md`. D-64 waits on the rendered-capture
path, NOT on a doctrine ruling: D-55's doctrine was ruled by Bob (third-party script
output is attributed to that party) and its SHAPE is decided provisionally in
`MILESTONES.md` under M2 — attribute by ORIGIN via `rendered_origins[]`, not by region,
which needs no new reference granularity. Scope this area against that shape when a
slot frees. *(Heading restored 2026-08-10 by CONDUCT.)*

## IS BUILD PLAN — STATUS, MEASURED 2026-08-10. **NINE ROWS REMAIN OF FORTY-THREE, AND THREE OF THEM ARE CONDUCT'S.**

**This section exists because the plan's status was UNREADABLE and its absence was
mistaken for its emptiness.** `IS-BUILD-PLAN.md` (2026-08-07) holds the scope for six
tracks; the 2026-08-07 drain deliberately did NOT copy it here ("a notification, not a
second copy") and promised **one pointer row per wave slot** instead. **Those pointer rows
were never written** — no `PL-`, `FL-`, `SK-`, `VF-` or `DS-` row has ever existed in this
file, so by this project's own rule (*"the check is the ITEM, not the note"* — the lesson
recorded in the 2026-08-05 drain, on this exact failure, twice) the whole plan read as
undrained. **It was not.** Workers built it anyway, off the plan document directly, and the
queue simply never learned.

**SO THE STATUS IS MEASURED FROM `main`, NOT FROM THIS FILE, and that is the only honest
source available** — `git log --oneline main` matched against the plan's row ids. **LANDED
ON MAIN (34 rows):** PL-1, PL-2, PL-2v, PL-3, PL-4, PL-8 … PL-15, PL-17 … PL-20; FL-1 …
FL-5; SK-1; VF-1, VF-2, VF-3, VF-5; UI-38, UI-42 … UI-45. **SATISFIED BEFORE SCHEDULING
(3):** PL-5 (landed as IS-6), PL-6 (REC-59), PL-7 (REC-60) — the plan says so on its own
rows. **WHAT IS LEFT IS NINE:**

**THE ID COLUMN IS DELIBERATELY NOT FIRST, AND THE REASON IS A REAL CONSTRAINT RATHER THAN
A LAYOUT PREFERENCE.** `mintid`'s two allocation-site shapes are `### <ID> ·` (a QUEUE.md
item heading) and `| <ID> |` (a track table row in `IS-BUILD-PLAN.md`) — **so writing these
ids in either shape here would ALLOCATE them a second time**, and `plancheck` failed exactly
that way on this section's first draft. That failure is correct and worth keeping: **the
plan OWNS these ids and this file TRACKS them**, and two files opening one id is the
mirror-and-drift class the 2026-08-07 drain refused when it declined to transcribe the plan.
Leading with the owner keeps this a reference. **Do not "fix" it by bolding the ids to slip
past the matcher** — that dodges the detector without removing the second authority, which
is the defect wearing a disguise.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| **CONDUCT** | SK-2 | the investigative skill — composition judgement, description standard, search-completeness discipline (**the model never decides when the loop stops**) | **nothing — SK-1 is landed. This is the top of the plan's remaining work.** |
| **CONDUCT** | SK-3 | the PRACTICE-SURVEY prohibition set, verbatim in the skill; PL-3's boilerplate check is the code half of the fifth | SK-2 |
| **CONDUCT** | SK-4 | CHECK deploys first; investigate-fresh enables only after CHECK's first live run is verified | SK-2/SK-3 in practice; its named deps FL-3 and VF-5 are **both landed** |
| RECORD | PL-16 | the published case (IS-8, M10) | **Bob** — DEC-33 deferred the publication ceremony and PL-16 depends on it. Not schedulable, and not CONDUCT's to unblock |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | FL-2 (landed) |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | DS-1 |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | DS-1 |
| **DIST** | DS-4 | the gated deploy, then hand to VF-4 | DS-1, DS-2, FL-2 |
| FLEET | FL-6 | the Claude-account cascade at runtime | **DS-3** |
| VERIFY | VF-4 | live verification in scratch — a full CHECK run against a concluded inquiry | **SK-4 and DS-4** |

**THE CRITICAL PATH IS DIST'S, NOT CONDUCT'S, AND THAT IS THE ONE THING WORTH CARRYING OUT
OF THIS TABLE.** Four of the nine are `DS-` rows, and DIST runs as its own session
(`kickoffs/DIST-NEXT.md`) — CONDUCT cuts no releases and touches no installer path. The
last two live rows (FL-6, VF-4) each wait on a DS row, so **the plan cannot finish through
CONDUCT alone no matter how the slots rotate.** CONDUCT's entire remaining share is the
SKILL track, and it is unblocked today.

**SKILL IS PROMOTED AND SK-2 IS THE NEXT SPAWN.** The first pass of this section said both
slots were held and seeded SKILL dormant; **that was read off the queue's own stale status
and was wrong.** Measured instead: zero live workers, four claims held by dead sessions
(all four released this turn), ~120 abandoned worktrees, and **UI-53 marked `running` with
its work on `main` since `a7b027f`.** The UI slot was free. Slots are now RECORD (REC-69,
genuinely open and blocked on a judgement that is RECORD's, not the scheduler's) and SKILL.
`kickoffs/SKILL.md` was written in the same act, as `plancheck` requires.

**THE CORRECTION IS LEFT VISIBLE RATHER THAN TIDIED, because it is the finding:** a stale
`running` did not just mis-describe the board, it produced a wrong scheduling decision
inside the very turn that was repairing the board. That is the third instance this month
(PL-18, PL-19, UI-53) and the first where the cost was immediate.

## SKILL — ACTIVE (promoted 2026-08-10 by CONDUCT into the slot UI-53 freed; `kickoffs/SKILL.md` written in the SAME ACT, per the rule `plancheck` enforces)

**PROMOTED THE SAME DAY IT WAS SEEDED, and the reason is a MEASUREMENT rather than a change of mind.** It was seeded DORMANT earlier in this turn on the reading that both slots were held. That reading was wrong and the queue's own status was why: **UI-53 read `running` with no worker alive** — its work has been on `main` since `a7b027f`, its holding session is gone, and its claim was one of four released as stale in this same turn. Measured, not assumed: zero live workers, four claims held by dead sessions, ~120 abandoned worktrees under `.claude/worktrees/`. **So the UI slot was never occupied; it only looked occupied**, which is the third instance this month of a stale status costing a scheduling decision (PL-18, PL-19, now UI-53). Slots now: **RECORD (REC-69, genuinely open) and SKILL.**

**REC-69 HOLDS RECORD'S SLOT AND IS BLOCKED ON A JUDGEMENT THAT IS NOT CONDUCT'S.** Its branch is green on itself and unmerged; what stops it is whether `aiRuns` is `PUBLISHES` or something the four roles do not yet name — a judgement about what the record publishes, which is RECORD's call. **Guessing it to get a green push is the overclaiming this project refuses**, so it stays open rather than being closed by the scheduler. Its stale path reservation was released; the item was not.

The doctrine and judgement layer of `IS-BUILD-PLAN.md`, **constrained to what a skill may
legitimately hold — which is never a gate.** It owns skill/doctrine text and no plane
paths, so it contends with neither RECORD nor UI: this is the one plan track that can take
a slot without a claim collision on `store.mjs`.

**THE TRACK'S GOVERNING CONSTRAINT, carried here because it is what a worker would
otherwise get wrong: a fence in a prompt is not a fence.** Loop bounds, fan-out and gates
all live in FL-3's deterministic control-flow table — **code, never skill** (§14b.4). Every
row below is checked against that, and SK-3's negative control is built to PROVE the fence
is code by showing the skill-only path would have passed what PL-3's C-number refuses.

**STATUS ROWS, NOT ITEM HEADINGS, AND THE CONSTRAINT IS THE SAME ONE THE PLAN-STATUS
SECTION RECORDS:** `IS-BUILD-PLAN.md` ALLOCATES `SK-2`/`SK-3`/`SK-4` as track table rows,
so opening a `### SK-n ·` heading here would allocate each id a SECOND time — `plancheck`
fails it, correctly, and the failure is the repository refusing to hold two authorities for
one id. **So the plan holds the SCOPE and this section holds the STATUS, the dependency and
the promotion order**, which is precisely what the 2026-08-07 drain meant by "a pointer row
per wave slot" and what it never actually wrote. Read the scope from the plan's own row; do
not transcribe it back here, because a copy starts rotting the day it is made.

| state | row | depends-on | the one thing a worker would otherwise get wrong |
| --- | --- | --- | --- |
| **queued — top of the track** | SK-2 | none; SK-1 landed | **grades are COMPOSED, never MINTED**, and **the model NEVER decides when the loop stops** (TREC 2011, +95/−87) — it decides what to SEARCH. Four-level search states WHICH absence per level: *no meaning derived*, *nothing extracted*, *no document*, *nobody looked* are four different facts and must not read alike. Bias minimisation sits ON TOP of the fence, never instead of it (§14). |
| queued | SK-3 | SK-2 | The five PRACTICE-SURVEY prohibitions go in **VERBATIM**. The sharp one: **no generated justification anywhere** — a generated justification is a fabricated attribution — and **the ONE permitted auto-composition is assembling the member's OWN prior words**. `PL-3`'s landed boilerplate check is the CODE half of the fifth. |
| queued | SK-4 | FL-3 and VF-5 — **both landed**; SK-2/SK-3 in practice, since the skill must exist to be gated | CHECK deploys FIRST (§2, SWEEP §4b.7): the record read adversarially against an EXISTING conclusion, aimed at self-directed overclaiming — the primary threat model. **The gate is a ROW IN FL-3's TABLE and is code; SK-4 RECORDS the sequencing and must not re-implement it.** Investigate-fresh enables only after CHECK's first live run is verified, which is VF-4, which waits on DS-4. |

**ACCEPTANCE AND NEGATIVE CONTROLS COME FROM THE PLAN'S OWN ROWS** — each carries an
`accepts-when` that is a checkable fact and an `NC`. The track's three NCs are worth naming
here because they are what makes the track's constraint enforceable rather than hoped for:
a skill edit that moves loop termination into model judgement must FAIL the
deterministic-table review criterion (SK-2); **a placeholder-text description submitted
through PL-3 must be refused BY C-NUMBER while the skill-only path would have passed it**,
and that asymmetry IS the proof the fence is code (SK-3); and an investigate-mode launch
attempted before CHECK's verification is recorded must be REFUSED by the deployment gate
(SK-4).

activated: 2026-08-10 · CONDUCT — the plan's remaining CONDUCT track, written into the queue
it was never written into and promoted in the same turn once the slot state was MEASURED
rather than read off stale statuses. `kickoffs/SKILL.md` written in the same act, and the
thread registered in `kickoffs/README.md` so its owned paths are defined. **SK-2 is the
next item to spawn** — it is the top of the track, SK-1 is landed, and nothing blocks it.


## DIST — ACTIVE (promoted 2026-08-04: DIST-2 and DIST-3 both landed on it from DEC-37/DEC-42; DIST-1 done 2026-08-04; the backlog — D-115/116/107/54 and the MONITOR_TOKEN follow-on behind DEC-37/REC-33 — waits for the next activation)
Batches releases from a green `main`; the deploy step is gated to Bob. New standing
work from the topology decision: D-115 (the installer installs ONE Worker and the
topology now has a fleet), D-116 (version authority must span the fleet, or D-106's
drift class returns multiplied), D-107 (no scripted installer deploy with read-back),
D-54 (the installer does not detect the Workers plan). Activate when a fleet member is
close to shipping, and not after it ships. NEW 2026-08-04: the REC-26 delegation (CLAIMS.md) — uploadInstall AND uploadUpdate meta.bindings gain { type: service, name: SELF, service: slug } so archive-monitor and monitor-cadence arm on deployed instances; a scoped MONITOR_TOKEN is the better credential than the ADMIN_TOKEN fallback. *(Heading restored 2026-08-10 by CONDUCT.)*

**DIST RUNS AS ITS OWN SESSION** (`kickoffs/DIST-NEXT.md`, handover 2026-08-04). CONDUCT
does not cut releases, deploy, or touch `newgroup/**`, `release/**`, `deploy.mjs`, the
plane version or tags. **The build plan's whole DS track (DS-1..DS-4) is DIST's lane, not
CONDUCT's** — recorded on the plan-status row below so nobody schedules it here.

### DIST-2 · queued
milestone: M1
scope: **The installer binds DAEMON_TOKEN (REC-33's follow-on).** newgroup generates a DAEMON_TOKEN and binds it in BOTH uploadInstall and uploadUpdate (the SELF-binding precedent DIST-1 established; the update path so already-installed instances receive it). DIST-1's constraint is now satisfied in this direction — the plane classifies the class (REC-33 landed) BEFORE the installer binds it. The ADMIN_TOKEN fallback stays until DEC-43 rules on its retirement. NO DEPLOY: land tested code; the install/update run is gated to Bob.
behind-interface: I4
depends-on: REC-33
accepts-when: the installer suite green with DAEMON_TOKEN generated and bound in both upload paths' built config; `cd bio-plane && npm run test:battery` green; negative control — remove the update-path binding and the suite names the already-installed instance that would never receive it.
added: 2026-08-04 · CONDUCT (REC-33's follow-on)

### DIST-3 · queued
milestone: M7
scope: **D-54 re-scoped by DEC-42: the installer REQUIRES Workers Paid, verifies it, and REFUSES to complete rather than installing something quietly degraded.** Detection was the old scope; refusing IS the fix, because the D-106 failure it guards is a group getting something quietly different from every description of it. Verify the plan the way the BOB session measured it (provoke the platform — upload with limits.cpu_ms set and read the answer; code 100328 is Free, HTTP 200 with the limit echoed is Paid) rather than trusting a plan field. The refusal names what is missing, what it costs ($0/month + a card → $5/month + a card — an instance already needs an account and a payment method, and R2 already bills past its free allowance), and what to do; it must never half-install.
behind-interface: I4
depends-on: none
accepts-when: the installer suite green with a Free-plan account refused BY NAME before anything is created and a Paid one proceeding, the plan established by provoking the platform not by reading a field; negative control — accept the Free answer and the suite names the half-installed instance.
added: 2026-08-04 · CONDUCT (DEC-42's item 1)

### DIST-4 · queued
milestone: M7
scope: **DEC-43's (b) — THE FLEET-VISIBILITY REPORT, and it is the PRECONDITION of the fallback's retirement, not a companion to it.** Bob ruled (b) then (a), 2026-08-10: `#monitorToken()`'s ADMIN_TOKEN fallback is a silent, permanent licence for root-of-trust monitoring — an instance that never binds DAEMON_TOKEN keeps spending ADMIN_TOKEN forever **and nothing reports it except an operator reading `op=selftest`**. Build the report that makes the gap A NUMBER RATHER THAN A HOPE: which instances still monitor on the fallback, readable without an operator opening each one. **THE ORDER IS THE RULING AND IS NOT CONDUCT'S TO COMPRESS** — the fallback stays until (1) DIST-2 has landed, (2) one update cycle has passed, and (3) the measured count is zero **or its remainder is KNOWINGLY ACCEPTED**, which is a stated act and not a silence. Removing it before the fleet is visible re-inerts monitoring on every instance that missed the update — **DIST-1's own constraint arriving from the other side**, which is precisely the failure that constraint exists to prevent. D-116's neighbourhood: version authority across the fleet and credential posture across the fleet are the same visibility problem wearing two hats; if the report can answer both at one call, say so and do it once. **NO TOKEN VALUE IN THE REPORT, EVER** — the answer names WHICH CREDENTIAL CLASS an instance runs on, never the credential (`tokens.mjs`'s publication-revokes rule is the floor, and a report is a publication).
behind-interface: I4 — if the answer is published through a plane op rather than a DIST-side read, file the IC before building
depends-on: DIST-2 (the report measures who received the DAEMON_TOKEN binding, so the binding must exist to be measured)
accepts-when: the report answers, for a set of fixture instances, which run on DAEMON_TOKEN and which on the ADMIN_TOKEN fallback, with the count stated; the answer is derived from what each instance REPORTS rather than from what the installer intended to bind (**an intent is not a measurement** — the same rule that makes `deploy.mjs` read the bytes back from the account instead of trusting the upload); no token value appears anywhere in the output.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) **the arm this item exists for: an instance that never bound DAEMON_TOKEN must appear in the report BY NAME — a fallback instance that reads as clean is the exact silence DEC-43 was raised about**; (2) derive the answer from the installer's intended bindings instead of the instance's own report and the intent-is-not-a-measurement assertion must fail; (3) put a token VALUE in the output and the `tokens.mjs` denylist arm must fail.
added: 2026-08-10 · CONDUCT (draining the 2026-08-10 BOB INBOX entry, work item 3; DEC-43 decided the same day. **Placed in DIST and therefore NOT CONDUCT's to run** — the report is fleet/instance ground and DIST is its own session.)


## UI — ACTIVE (promoted 2026-08-04 into the slot RECORD freed as it drained; UI-10 first — every other UI item depends on it)
`civicos-ui/**`; the member surfaces of M8, per `UI-PLAN.md` and the interaction
constructs **v0.2** (`BIO_Interaction_Constructs_v0_1.md` — the count came down to TWO
constructs + a weight ladder + the TASK/QUEUE attention layer; MILESTONES M8 build-order:
**the queue FIRST**). NOTE: this supersedes the earlier drained-inbox note's v0.1
`T→J→B(+S)→P→A` order — MILESTONES M8 already carries v0.2, so the queue-first order governs.
The display half of D-82 (`surfaced_by`) and the FW-4→UI already-held delegation are later
UI items, not UI-1. *(Heading restored 2026-08-10 by CONDUCT — see the note under RECORD.)*

### UI-53 · done
milestone: M8
scope: **THE HAND-WRITTEN `BANNED` LISTS IN `civicos-ui/test/` BECOME CONSUMERS OF ONE DERIVED FAMILY (D-269's delegation to UI).** D-269 measured that the hand lists **do not agree with each other and that NONE would have caught `independently sufficient`** — the phrase that was being rendered to members off `#axisResult` and frozen into signed `bundle.md` frontmatter. **Several disagreeing lists are worse than one, because each reads as coverage.** D-269 built the derived answer on the plane side (`bio-plane/test/analystvocab.test.mjs`: machine-side words MINUS member-side words, with the hand lists' union as a seed floor checked BEFORE the member-side skip) and deliberately did NOT impose it on UI's ground — widening a landed guard from the item that merely bumped into it is the mistake **REC-71** exists to correct. **So the rule here is INVERT, DO NOT LENGTHEN: a list of spellings goes stale the moment a fourth is written**, and the fix is one derivation with the sweeps as consumers, not a longer list in more places. **A list that turns out to be asking a genuinely DIFFERENT question is a FINDING — keep it, named, rather than folding it in for tidiness.**
behind-interface: I3
depends-on: none (D-269 is landed on `main`)
accepts-when: `node civicos-ui/test/run.mjs` from the **REPO ROOT**, exit read **UNPIPED**, 0; `cd bio-plane && npm run test:battery` green with any delta **attributed per suite by re-running the true baseline, never by subtraction** — **measure your own baseline and trust it over this brief**; `node scripts/coverage.mjs --strict` run DIRECTLY, `$?` unpiped, exit 0; `node tools/plancheck.mjs` clean but for UNPUSHED. **The census of ban instruments must NOT be spelling-keyed** — a grep over prose is a hint, not a consumer census, and D-269's own consumer grep under-reported inside the item written to fix it. NEGATIVE CONTROLS run and recorded, each armed ALONE with the others held open, **including an OVER-STRICTNESS arm in which the banned words in a code COMMENT, an internal IDENTIFIER and a FIXTURE ID must all stay GREEN** — the ban is on what a member READS, and a fence tighter than its rule is an undeclared interface change wearing the costume of caution.
added: 2026-08-09 · UI-53 (D-269's delegation to UI; the row is written by the item because CONDUCT had not minted one)
landed: `ac1c7d4`, merged at `a7b027f` on `main`. **STATUS CORRECTED 2026-08-10 by CONDUCT: it read `running` with no worker alive** — the holding session is gone, its claim was one of the four released as stale the same day, and the work has been on `main` since. This is the third instance of the class this month (PL-18 read `queued` and PL-19 read `running`, both corrected 2026-08-10, both with their work already merged), and the queue's own note on PL-18 says what it costs: *the exact shape of a brief that would have sent a worker to rebuild something that exists.* **The UI slot this item was holding is therefore FREE, which is what let SKILL be promoted in the same turn.**

### UI-54 · queued
milestone: M8
scope: **DEC-51's enactment — `op=acquire`'s grade note is RENDERED, WHOLE, AT THE MOMENT OF CAPTURE.** Bob's ruling, 2026-08-10: DEC-39 already settles the substance — the plane owns the fence wording and PUBLISHES IT WITH THE ACT, and the act here is the capture itself, so a surface that RECEIVES the record's own account and DISCARDS it withholds at exactly the moment the member forms the belief. Measured today: `addCapture` receives `acquireGradeNote` on every member capture and drops it, so a member's only account of what a capture is worth arrives on the document page afterwards. **WHOLE, NOT SPLIT, and the ruling is explicit about why:** DEC-39's three-part shape was deliberate, UI-28 measured that the parts reassemble character-for-character, and **the clause describing co-attestation — an act unavailable at this surface — is exactly the sentence that stops a member reaching for co-attestation to solve a problem it does not address.** So the co-attestation clause SHIPS; removing it is the defect, not the caution. **VERBATIM, under DEC-49's translation discipline: lift what the plane published, author no member-facing word** — the UI-39/UI-40 pattern (a falsehood deleted without writing a new one; the plane's accounts rendered with no fallback). **UI-32's removal of the COMPUTED GRADE LETTER from that surface STANDS and is not reopened** — this item renders the plane's SENTENCE, never a letter the surface derived.
behind-interface: I3 — consumption only; the note is already published, so no IC is owed unless the shape moves
depends-on: none — `acquireGradeNote` is landed and already reaches `addCapture`
accepts-when: `node civicos-ui/test/run.mjs` from the **REPO ROOT**, exit read **UNPIPED**, 0; the capture surface renders the received note string-for-string against the plane's own export (not against a harness literal — **a hand copy agrees at zero cost and this project has measured that five times on five subjects**, so the assertion must read the plane's value); `cd bio-plane && npm run test:battery` green with any delta attributed per suite; `node scripts/coverage.mjs --strict` run DIRECTLY, `$?` unpiped, exit 0.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) **the arm this item exists for: drop the co-attestation clause and an assertion must fail naming DEC-51's whole-not-split ruling** — a rendering that is merely "most of the note" is the split Bob refused; (2) repoint the harness at a hand-typed copy of the note and the drift assertion must fail (the zero-cost-agreement class); (3) an over-strictness arm — re-introducing a surface-computed grade LETTER must fail, because UI-32's removal stands.
added: 2026-08-10 · CONDUCT (draining the 2026-08-10 BOB INBOX entry, work item 2; DEC-51 decided the same day)

### UI-17 · blocked
milestone: M10
scope: **O1 THE PUBLICATION CEREMONY — DEFERRED by DEC-33** (Bob, 2026-08-03: the process is deferred; publication runs through the operator for now; UI-17a ships in its place). Trigger: Bob reopens the case-making thread. Recorded for when it wakes: base scope as `research/RECONCILED.md` §3.1 (UI-17) — the pair shown in step 2, the C-9 picker, the Q5 re-keyed basis-leg panel (an assembly keyed on the SUBJECT is permitted; keyed on the ANSWER-SHAPE it performs generation by selection — the panel shows the case's own basis legs, the COMPLEMENT of the field's content), instance-wide `NO_SIGNERS` wording — plus **DEC-19 as amended** (publishing is IRREVERSIBLE; correction moves forward; the ceremony states this) and **DEC-13** (the subject-position stage, ordered BEFORE signing since authoring it changes the sha). D-158 bounds the per-member pre-flight.
behind-interface: I3
depends-on: REC-15, UI-11
accepts-when: (on waking) as `RECONCILED.md` §3.1 (UI-17), including the Q5 negative control — any prior deferral/dismissal/severance reason appearing in step 3's panel fails the harness.
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33

### UI-17a · done
milestone: M10
scope: **The publication entry point — the placeholder DEC-33 ships in UI-17's place.** A small surface stating what publication IS (the irreversible act, editions, what a published case promises — DEC-19's corrected top rung) and that publication currently runs THROUGH THE OPERATOR; no ceremony controls, no signing, no preflight. Q12's rule: narration is surface-scoped and plane-sourced (one sentence from `whoami`); controls are never narrated and never greyed — absent, not disabled.
behind-interface: I3
depends-on: UI-11
accepts-when: `node civicos-ui/test/run.mjs` green with a harness where the entry point renders the statement and offers NO ceremony control of any kind; a read-only credential sees the same surface with one whoami-sourced sentence; negative control — render a sign/preflight control, or grey a control instead of omitting it, and the harness fails.
added: 2026-08-03 · CONDUCT (DEC-33's placeholder)
landed: (merge on main, worker 6ee25f0) — the entry point renders iff op=affordances publishes the act; the strip names it under the producer's own label ('Publish (author the case)', never re-worded) and routes at the explanation; NO ACT_FLOW entry, nothing calls op=publish (asserted on the wire AND by driving actGo directly); the statement (irreversible, editions, correction-moves-forward, operator-run per DEC-33/DEC-19) renders IDENTICALLY for every credential — proved string-for-string, because it is a statement about the record, not a control. publication-entry 112; harness 29 suites + both guards; battery byte-identical (the no-plane-file evidence). NCs RUN x3 with two instrument findings kept (a greyed control is invisible from the credential it isn't greyed for — the read-only arm is not redundant; actGo returns synchronously, so counting calls on the next line measured nothing — a microtask drain made the arm honest). FOLLOW-UP attached to FW-14's scope: the plane publishes rung: null for publish while DEC-19 names it THE irreversible act — when FW-14 assigns RUNGS.publish, this section reads the rung off the act instead of stating it as copy.


---

## CLOSED ITEMS — the register

Rolled to `docs/archive/ledgers/QUEUE-2026-08.md` on 2026-08-10: 195 items, all `done` or
`superseded`, 871 KB of scope prose. **The headings stay here and that is not cosmetic** —
`planning-hygiene` reads this file's `### <ID> · <state>` headings to build the id set
every `QUEUED <ID>` cross-reference in the corpus is checked against, and `mintid` reads
its floors from the same prose. A register that dropped the ids would break both.

Each row is the item's own `scope:` first line, cut at a word boundary, with `op=<name>`
rendered as prose so a derived summary states no claim about the dispatch table. The
full item, unedited, is in the archived ledger.

### M0-10 · done
migrate.test.mjs fails under concurrency and passes alone — raised by UI-39 rather than smoothed, which is the only reason it is visible. Observed…

### M0-11 · done
op publishedcase's loose branch (#looseEditionState) is driven by NO suite in the plane's battery — ratified bytes that belong to no case. Found by…

### M0-12 · done
A comment naming op <name> must be checked against the dispatch table — the mechanical defence against the class that has now cost a full queue item.…

### M0-8 · done
Stop the battery leaking temp directories (D-186). Three parts: (a) the

### M0-1 · done
Control-plane assertions for the three ops no suite reaches — archivelookup, linkproject, signerlist — and a control-plane assertion for sourcereach,…

### M0-2 · done
Backfill the negative-control register: one NEGATIVE CONTROL: <what to break> -> <what must then fail> line in the first 60 lines of each of the 42…

### M0-3 · done
Name the 33 checks no assertion names. One assertion per check that tampers a conformant bundle and requires THAT check id in the findings. The…

### M0-4 · done
npm test becomes node scripts/battery.mjs, so a crash cannot hide the suites behind it (D-93 first half). Then the second half: ratify.test.mjs…

### M0-5 · done
D-117 — teach scripts/coverage.mjs to enumerate FLEET members, not just bio-plane/src/index.mjs. The topology decision (I6) means a second Worker's…

### M0-6 · done
The hygiene check that closes the planning-drift CLASS, on D-113's precedent: every open row in DEBT.md carries a disposition token, every QUEUED…

### M0-7 · done
The END-TO-END pipeline integration test — the whole M4 entity-axis chain driven THROUGH THE CONTROL PLANE in ONE suite, proving the pieces COMPOSE.…

### REC-54 · done
D-200 — ten live bundles claim a route they cannot show. op audit on the live instance answers 31 checked / 21 clean / 10 with errors, every one…

### REC-55 · done
The refuse-weight gate cannot see a query selection that moved — routed out of UI-25 as a DELEGATION, and CONDUCT decided the mechanism rather than…

### REC-56 · done
D-203 — five checks advise a repair the state machine refuses, and a sixth check refuses it BY NAME. MEASURED by REC-54: checks/bio-checks.mjs tells…

### REC-57 · done
Two plane ops publish a bound they do not name, forcing every consumer to guess — the UI-39 class, one layer down (UI → RECORD delegation). MEASURED…

### REC-58 · done
op publishcase still publishes case.opened — FALSE, and corrected 2026-08-05 at integration: it does not, and never did. CONDUCT copied this premise…

### REC-59 · done
Carry IC-24 through the protocol — op projection's capped corpus arms answer a BARE ARRAY, which can carry no bound. REC-57 made every other capped…

### REC-60 · done
D-225 — three meaning-layer reads are UNCAPPED, and they were INVISIBLE to REC-57's instrument for a reason worth stating. store.mjs:8451 (concerns,…

### REC-61 · superseded
D-220 — the version chain of one document is ALREADY RECORDED and nothing exposes it, so code that needs it reconstructs it by full-text search and…

### REC-62 · superseded
D-222 — the MEANING LAYER HAS NO QUERY SURFACE, and the investigative session is the first consumer that genuinely needs one. Staged A then C, and…

### IS-6 · done
The RUN OBJECT and its observation log (INVESTIGATIVE-SESSION.md §11), on the capture_sessions shape — scratch, ticks, expiry, resumable. THIS IS THE…

### IS-1 · superseded
VERSIONS OF THE INQUIRY'S BASIS — the spine of the whole set (§18). An inquiry carries MANY versions; a version is frozen once written; the name is…

### IS-2 · superseded
The STATE MACHINE over versions — and it is to be stated as THE SIXTH MACHINE, in those words. Four states, reversible; every transition a MEMBER act…

### IS-7 · superseded
The STRENGTH PAIR over the current version (§12) — per axis, MIN over AND legs / MAX over OR branches per DEC-32, the state-set argument, the state…

### IS-3 · superseded
CURRENT as a project-to-inquiry PROPERTY (§7) — a dated frontmatter field beside required_strength, never a settings row (DEC-17's reasoning: a…

### IS-4 · superseded
The SUGGEST ENDPOINT — §9's kinds including this level is empty, whose sole possible output is a suggested version, carrying its run. ONE WRITE PATH…

### IS-9 · superseded
THE RUN HARNESS — the run's execution model: fan-out to evidence sub-sessions, resumption, budget. The CHECK mode is its first DEPLOYED mode (§2,…

### IS-5 · superseded
The ai credential's INVESTIGATIVE SCOPE — reads across the project under a STATED viewer (§3); writes only IS-4's endpoint and capture_requests. This…

### IS-8 · superseded
The PUBLISHED CASE per §13 — the container carries each included finding's current version with its ground partition, its description, its NAME in…

### REC-63 · done
DEC-56's enactment — the record CARRIES the doubt at verified rather than un-saying a verification. Bob ruled the principle 2026-08-06 across…

### REC-64 · done
DEC-49's enactment — every refusable condition carries an ERROR CODE with a CANNED TRANSLATION, and an untranslated code FAILS THE HARNESS. Bob,…

### REC-79 · done
REC-64'S REMAINING SWEEP MADE TRACTABLE, AND ONE FAMILY PROVED END TO END. It does NOT try to translate the remainder and says so. REC-64 landed…

### REC-65 · done
DEC-52's enactment — the six fields' comments are WRONG and are corrected to match the CODE, not the code fenced to match the comments. Bob ruled…

### REC-66 · done
op connect (deriveConnections) carries the SAME quadratic defect as D-225's three and was not among them — found by REC-60's sweep and deliberately…

### PL-19 · done
DEC-65's step TWO — C-25.6 and PL-3's endpoint guard change TOGETHER. FL-3 measured that the guard refuses on legsIn.length > 0 — any leg at all — so…

### PL-20 · done
DEC-65's step THREE — re-measure the strength pair over GROUNDS, which PL-19 explicitly did not do and delegated with what it already knew.

### M0-18 · done
D-257's delegation — guard the PLANE's walk-derived floors on D-257's split: the sweep keeps reading the whole working tree, the floor is computed…

### M0-20 · done
Detect a merge that silently drops a file whole — CONDUCT's 2026-08-08 merge of REC-69 carried 11 files where the branch changed 12, losing 70 lines…

### D-269 · done
The vocabulary DEC-32 clause 1 forbids is being rendered to MEMBERS right now. UI-43 measured it: 3 of 3 of #axisResult's detail sentences on…

### D-271 · done
Two record-truth defects found by UI-43. (1) The affirmation has nowhere to land — DEC-32 clause 4 requires each set be affirmed before a multi-set…

### PL-17 · done
DEC-65's enactment, step one of three, and the ruling's own amendment is that this comes FIRST. Mint a THIRD asserted_by state: an explicit "no…

### PL-18 · done
DEC-63's enactment, and it is the one of the four that CHANGES SHIPPED BEHAVIOUR. Bob ruled 2026-08-09 that an investigation can be started by any…

### M0-13 · done
DIAGNOSE D-231 — bio-plane/test/suggest.test.mjs IS INTERMITTENTLY RED UNDER THE BATTERY AND GREEN STANDALONE. Seen twice by two sessions that could…

### REC-75 · done
D-234 — THE SUBSTANCE GATE IS DEFEATED BY A QUOTATION MARK, WITH NO CLOCK INVOLVED AND NO FLAKINESS TO WARN ANYBODY. M0-13 has just fixed the clock…

### M0-14 · done
D-233 — THE NEGATIVE-CONTROL REGISTER'S "ARMS STATED" TALLY CANNOT SEE A DECLARATION WRITTEN IN THE NUMBERED FORM, so the figure every session reads…

### CPDF-9 · done
D-232's OPEN HALF — pdf-worker's SUITE IS DARK AND THE BATTERY NAMES IT ON EVERY RUN. Measured 2026-08-08 by FL-2/VF-3's class sweep:…

### M0-15 · done
AN UNTRACKED .test.mjs APPEARED IN A WORKER'S WORKTREE, WAS DISCOVERED AND RUN BY THE BATTERY, AND WAS INVISIBLE TO git status — SO A WORKER MEASURED…

### REC-74 · done
op airun PUBLISHES TWO OF THE RUN'S THREE CONDITIONS, AND THE THIRD IS SILENT — measured at the source by SK-1 while wiring the skill version, not…

### REC-67 · done
bio-plane/test/bounds.test.mjs's REC-59 consumer walk MISCLASSIFIES A NON-CALL-SITE, and it turned another area's suite red for a reason that had…

### REC-68 · done
D-228 — a QUOTED FIELD VALUE KEEPS ITS QUOTES, and the branch written to prevent it is UNREACHABLE. Found by PL-8 while building the set-algebra arm,…

### REC-70 · done
op airunlog publishes an UNBOUNDED collection — and the ratchet built to catch exactly that DID NOT SEE IT. The blind spot is the item; the op is the…

### REC-71 · done
origin/main's UI HARNESS IS RED — 32 failures — AND CONDUCT PUSHED IT. MEASURED 2026-08-08 by CONDUCT, by checking out a24f2b0 (the pushed commit) in…

### REC-72 · done
THE EDGE THE WHOLE INVESTIGATIVE BUILD HANGS ON HAS NO CURATED PRODUCER — a project cannot cite an inquiry through an ACT, and cannot withdraw from…

### REC-73 · done
D-229 — prove the twelve MACHINE_CANNOT_ fences, because eleven of them are currently LUCK. PL-11 ran the second half of DEC-55.5 for the first time…

### REC-1 · done
Decide and build the scheduler, once. Nothing in the plane runs on a schedule: wrangler.jsonc declares no cron trigger and the only Durable Object…

### REC-2 · done
D-61 — an unattended writer cannot take a lease, because leases.actor is NOT NULL and stamped from the session, so a daemon cannot complete a capture…

### REC-3 · done
The small honesty defects in the plane's own surfaces, batched because each is minutes and none is worth a turn alone: D-39 (an empty POST body…

### REC-4 · done
The server-side TASK-ACTOR FENCE (lifted from UI-1's delegation). Today taskResolve/taskForward (store.mjs ~5299) refuse no-actor / no-such-task /…

### REC-5 · done
Close D-122 — connections AUTO-DERIVE. Today op connect is a manual contribute mutation nothing calls, so the entity axis is BUILT but stays EMPTY…

### REC-6 · done
op proposals — the DISCOVERY feed for derived findings (from UI-5's delegation). There is NO op that enumerates derived findings, so UI-5's proposal…

### REC-7 · done
op proposedispose — record a PROPOSAL's defer/dismiss WITHOUT minting a bundle (from UI-5's delegation). op dispose disposes a focus BUNDLE (handle +…

### REC-8 · done
CONSTRUCTS Step 7 (AGEING) — the record NOTICES when a temporal expectation comes DUE. FW-8 gave each progression stage a within_interval, but…

### REC-9 · done
op captureprogressions — map a CAPTURE back to its progression instances (from UI-9's delegation). UI-9's document page shows items 1–2 (resolutions,…

### REC-10 · done
The inquiry TYPE — the schema change, not eleven features. As BUILD-ORDER.md §2 (REC-10), carried with one addition from research/RECONCILED.md §3.2…

### REC-11 · done
inquiry_basis — the one genuinely new table, and basis recursion. As research/RECONCILED.md §3.1 (REC-11), which is THE DESIGN over BUILD-ORDER.md…

### REC-12 · done
STRENGTH at inquiry altitude — a PAIR over two POPULATIONS, over a bounded DAG. As research/RECONCILED.md §3.1 (REC-12), the most-changed item, read…

### REC-13 · done
The concluded state, its entry requirements, and op conclude. As BUILD-ORDER.md §2 (REC-13), carried forward per RECONCILED.md §3.3, with two rulings…

### REC-14 · done
The published state — EDITIONS, the completeness assertion, and the gates that stop it being a checkbox. As research/RECONCILED.md §3.1 (REC-14) with…

### REC-16 · done
divided and op inquirydivide — supersession gets its first producer. As research/RECONCILED.md §3.1 (REC-16): R4's disclosure is the point — each…

### REC-17 · done
P-64 — the re-evaluation obligation, as a query and not a flag, WIDENED to the walk-back edges. As research/RECONCILED.md §3.2 (REC-17): reuse…

### REC-18 · done
Earned basis grades — grade_source: 'resolution' from resolutions. As research/RECONCILED.md §3.1 (REC-18), with the blocker HALVED and then halved…

### REC-19 · done
op affordances — publish what the plane already knows about what may be done. As BUILD-ORDER.md §2 (REC-19), carried forward per RECONCILED.md §3.3…

### REC-20 · done
op queue — the item contract, with class and case. As research/RECONCILED.md §3.2 (REC-20) — the grouping read GATED before the grouping exists (the…

### REC-21 · done
queue_state — the personal half, kept structurally distinct from the record half. As research/RECONCILED.md §3.2 (REC-21): muted_kinds may contain…

### REC-22 · done
op publishedcase and op publishedbytes — the public read path, over EDITIONS. As research/RECONCILED.md §3.1 (REC-22): published_edges restricted to…

### REC-23 · done
D-130 — the counterparty becomes three-valued, and C-2.10 stops accepting a placeholder. As BUILD-ORDER.md §2 (REC-23), carried forward verbatim per…

### REC-24 · done
The action loop — action_basis, correspondence, and the two ops that operate an object nothing operates. As BUILD-ORDER.md §2 (REC-24), carried per…

### REC-25 · done
F-8 / D-135 / D-141 — the D-15 viewer gate stamped on ALL read paths. As BUILD-ORDER.md §2 (REC-25), carried forward verbatim per RECONCILED.md §3.3;…

### REC-26 · done
The two live M1 gaps — env.SELF bound nowhere, op monitor with no caller. As BUILD-ORDER.md §2 (REC-26), carried forward verbatim per RECONCILED.md…

### REC-27 · done
D-137 / D-131 — close the D-113 class for the eight tables it cannot see. As BUILD-ORDER.md §2 (REC-27), carried forward verbatim per RECONCILED.md…

### REC-28 · done
D-151 — a machine credential can RESOLVE an unassigned task, so an obligation can be closed with no member act. VERIFIED: #refuseNotYours…

### REC-29 · done
D-157 — op memberlist hands the cover↔handle pairing to ordinary members and to MEMBER_TOKEN. MEASURED (2026-08-02, BOB session, live bio store): an…

### REC-30 · done
The D-15 posture sweep of the remaining read surfaces. From REC-25's landing: op dangling can name a citing project's id when a project cites a…

### REC-31 · done
Two small RECORD chores from the REC-13/REC-20 landings, batched (the REC-3 precedent). (1) The reopen gap: deferred → open and dismissed → open are…

### REC-32 · done
The first CONDITION generator — HOLE-1's bridge gets its first real half. From REC-21's landing: the mute machinery exists and its live-item exercise…

### REC-33 · done
The DAEMON_TOKEN class — UNBLOCKED by DEC-37 (Bob: MINT IT, and his naming adopted over the entry's: the class is the UNATTENDED PATH, not the…

### REC-34 · done
op inquirystrength — the gated read for the derived pair (UI-11's delegation, and UI-12's hard blocker). The store's strength route is DO-internal,…

### REC-35 · done
Publish the intent layer's three vocabularies in affordances.mjs' VOCABULARIES (UI-13's delegation): entity_kinds, relation_kinds, stage_requiredness…

### REC-36 · done
A reverse read for a name-only mention (UI-13's delegation; bounds REC-18/UI-21): no index on reading_refs.label, so the §8.1 grade-C tier — a…

### REC-37 · done
Cite-to-inquiry — the plane half of the record-becomes-a-case edge, measured missing by UI-20. op cite refuses any non-project citing object…

### REC-38 · done
Publish the capture-directed acts' metadata — the attest delegation from UI-22. attest sits in NON_ACTS by doctrine (capture-directed, not an object…

### REC-39 · done
The login refusal's words + the last unpublished vocabulary (UI-24's delegations, batched). (1) store.mjs login() returns {ok:false,…

### REC-40 · done
The identifier tier's one-call read (UI-26's measured trade). op readingname answers on the NAME a reading recorded; op readingref answers on the…

### REC-76 · done
D-236 — THE DEC-49 GUARD'S TEETH ARE BLIND TO EIGHT REFUSAL OBJECTS, AND IT HAS ALREADY COST A TRANSLATION. Measured 2026-08-08 by REC-64, and found…

### M0-17 · done
MINT IDS INSTEAD OF READING THE FILE AND ADDING ONE. SEVEN ITEMS COLLIDED ON AN ID IN A SINGLE DAY — a C-number family (PL-11 vs PL-14, C-29), two IC…

### M0-16 · done


### M0-16 · done
D-238 — SEVEN WALKS DISCOVER OVER THE SAME UNCONTROLLED DIRECTORY AND ONLY TWO ARE GUARDED. Measured 2026-08-08 by M0-15, which closed the battery's…

### REC-77 · done
Store.#CORRESPONDENCE_RANK OFFERS THE LEAST SELECTIVE EVIDENCE FIRST, AND M-4 MEASURED IT RATHER THAN ARGUING IT. The rank places name_in_reference…

### M-4 · done
The partial-reference tier ships UNMEASURED, and it is out-of-band measurement work rather than a build (routed out of REC-40). REC-40's third tier…

### REC-41 · done
Close op bootstrap's unconsumed roster disclosure (REC-39's measurement; D-198, renumbered three times — D-184 and D-185 both collided with…

### REC-42 · done
THE AND/OR ARITHMETIC — DEC-32, and it CORRECTS SHIPPED CODE. REC-11 and REC-12 landed with a flat implicit-AND basis, which is now known WRONG. (a)…

### REC-43 · done
Publish the attestation fence wording with the act (DEC-39). The co-attestation honesty fence — what a co-attestation does and does not do to a grade…

### REC-44 · done
A PUBLISHED CASE HOLDS MULTIPLE FINDINGS — DEC-44, and it CORRECTS DONE ITEMS (REC-14, REC-22, UI-18). The one-inquiry-per-case shape was never…

### REC-45 · done
op inquiryground — the act that authors the structure (REC-42's routed gap, and it must land BEFORE UI-27). Today grounds reach the record only…

### REC-46 · done
ONE machine-identity predicate (REC-45's measurement). checkGrounds refuses an asserted_by in a WORD LIST (agent, claude, daemon…) and knows nothing…

### REC-47 · done
The AUTHORED bias acknowledgement on the publish block (DEC-46 (a)) — a CORRECTION to REC-14. A published case carries the bias it was produced under…

### CPDF-1 · done
D-91 phase-2 measurement — unpdf bundle size and node-proxy extraction cost.

### CPDF-2 · superseded
Was: inline unpdf into the plane's bundle. Superseded 2026-07-31 by Bob's function-specific Worker topology (I6). unpdf does not enter the plane's…

### CPDF-7 · done
D-118 — MEASURE whether Workers Free permits a second script and service bindings at all, and what they cost against the request and CPU budgets.…

### CPDF-4 · done
Tier 1 text extraction, in the plane, pure JS, no dependency. Content-stream text operators plus the font ToUnicode CMap, reusing the PDF object…

### CPDF-5 · done
Measure Tier 1's coverage on REAL Oakland PDFs — agenda packets, staff reports, budget exhibits, an ACFR. What fraction decode fully, what partially,…

### CPDF-6 · done
pdf-worker, the first fleet member (I6). Holds unpdf; the plane hands it a capture sha and a store, it reads the bytes from R2 itself and returns the…

### CPDF-9 · done
Measure whether OCR is reachable at all, before anything is designed. D-152, DEC-4 as twice amended. Bob overruled the accept-the-limit…

### COFF-1 · done
The FORMAT registry, with HTML and PDF moved onto it — the D-70 test, and

### COFF-2 · done
The OOXML container reader — pure module, ZERO dependency (measured:

### COFF-3 · done
The XLSX registry entry. FIRST, one mechanical enactment from COFF-6: replace ooxml.mjs's PROVISIONAL_OOXML_SIZE_BOUND_BYTES (32 MiB container) with…

### COFF-4 · done
The DOCX registry entry. Structure: word/_rels/document.xml.rels →

### COFF-5 · done
The PPTX registry entry. Structure:

### COFF-6 · done
Measure the real Oakland office corpus BEFORE the bounds and deferrals

### COFF-7 · done
Hidden slides — the pptx analogue of xlsx hidden sheets (DEC-5). Flagged by COFF-5's worker and queued by CONDUCT: a slide carrying show="0" in its…

### CPDF-11 · done
Measure Moondream 3.1 (Workers AI, env.AI) as the IN-ACCOUNT OCR path —

### CPDF-12 · done
The page-to-pixels renderer — named at last (the substance of two dangling-dependency flags). Moondream consumes IMAGES, so the in-account OCR route…

### CAP-1 · done
Wire op pdfstructure into the dispatch in src/index.mjs.

### CAP-2 · done
D-109 — drain the task queue on a Durable Object alarm, armed on enqueue, re-armed while task_queue is non-empty, self-terminating when it drains.

### CAP-3 · done
PRIMARY resilience item as of 2026-07-31 (DEC-1): the allowlist arm is closed (D-94), so the archive fallback is now the main scaling mitigation for…

### CAP-4 · done
CAPTURE-SCALING.md item 6, DECIDED 2026-07-31 under Bob's delegation — read that item before building, it carries four specifics. (a) Post-hoc reuse…

### FW-2 · done
D-68, CONSTRUCTS Step 0 — the full version, not a deduplication. Bob ruled: "we must do the work upfront in order to end up with the results we…

### FW-1 · done
Confirm or counter the provisional I2 structure interface that CONTENT-PDF produces — this is what turns I2 STABLE. Note CPDF-4 extends I2 with text,…

### FW-3 · done
CONSTRUCTS Step 1 — the plane records the profile. op acquire calls identify() and doctypeFor() and writes handler, content type, both confidences,…

### FW-4 · done
CONSTRUCTS Step 2 — the plane COMPUTES and STORES the normalisation digests on the capture, per the handler's declared normalisation policy that FW-3…

### FW-5 · done
CONSTRUCTS Step 3 — READINGS ARE PERSISTED. A reading is { entities[], facts } (BIO_Content_Framework_v0_10.md:480, parse(ctx) -> reading). Today…

### FW-6 · done
CONSTRUCTS Step 4, SLICE A — the SUBJECT REGISTRY / entity axis, built ONCE (D-83: the framework's entity axis and BIO_Declared_Bias_v0_1.md…

### FW-7 · done
CONSTRUCTS Step 4, SLICE B — the RECOGNISERS. Resolve a reading reference (reading_refs, FW-5, a raw kind:key) to a registry entity…

### FW-8 · done
CONSTRUCTS Step 5, SLICE A — PROGRESSIONS AS DATA (framework §8.2, "generalises the connection table rather than sitting beside it"). Absorbs D-67…

### FW-9 · done
CONSTRUCTS Step 5, SLICE B — progression INSTANCES and the MISSING-PREDECESSOR finding (M4's acceptance: "a progression with a missing predecessor is…

### FW-10 · done
CONSTRUCTS Step 5, SLICE C (part) — EXCEPTION DOCUMENTS that discharge a legitimate skip (framework §8.2), building on FW-9's missing-predecessor…

### FW-13 · done
Decide data/citations.json / C-8.1 — retire, or bind. As BUILD-ORDER.md §2 (FW-13), carried forward verbatim per RECONCILED.md §3.3. Doing neither is…

### FW-15 · done
C-7.1 / data/deletions.json — THE SAME ORPHAN CLASS FW-13 CLOSED, AND THE ARGUMENT THAT RETIRED ITS SIBLING DOES NOT TRANSFER. Decide it: retire, or…

### FW-14 · done
Assign the weight-ladder rung to every mutating op, or state that it has none. As BUILD-ORDER.md §2 (FW-14), carried per RECONCILED.md §3.3 (its…

### FW-15 · done
The L2→L3 wire — a PDF's text becomes a reading. As BUILD-ORDER.md §2 (FW-15), carried forward verbatim per RECONCILED.md §3.3. From DEC-4's…

### DIST-1 · done
The REC-26 delegation — the installer binds SELF so the monitoring consumers arm on deployed instances. newgroup/src/index.mjs: uploadInstall's…

### UI-38 · done
The SURFACE REGISTRY and the RECIPE format with their build-time validation — ASSISTANT-PILOT.md §7 step 1, and it needs no AI at all. Bob picked…

### UI-39 · done
The four bound-dropping sites UI-25 found and REPORTED rather than edited (they sat outside its claim). Same class as UI-25's five: the plane…

### UI-40 · done
The three unread publications on op publishedcase — decided by CONDUCT rather than raised, because REC-41 already set the precedent and this is…

### UI-41 · done
The surfaces can stop authoring their own bound sentences — REC-57 gave them the record's own (UI-39's delegation, now discharged on the plane side).…

### UI-46 · done
A LIVE MEMBER-FACING OVERCLAIM, created by REC-60 landing and invisible to every suite — this is the class the project ranks worst and it is why this…

### UI-47 · done
The running-session surface reads the run — IS-6's delegation, and its consumer was built FIRST on purpose. UI-38 shipped the once-only…

### UI-48 · done
Five surfaces now read a capped op and state NO bound — the LESSER half of UI-46's class, routed rather than absorbed (UI-46's delegation).…

### UI-49 · done
§14a's ACTUAL PROMISE IS UNDELIVERED: the running-session indicator has no call site. INVESTIGATIVE-SESSION.md §14a says any window focused on an…

### UI-50 · done
heldMatch WRITES A WRONG PREDECESSOR INTO EVERY NEW BUNDLE, permanently, and every day on the old lookup adds another (PL-10's delegation). MEASURED…

### UI-51 · done
bias joins the catalogue's type vocabulary, and until it does check-semantics.mjs FAILS — the UI harness is RED on this integration and CONDUCT is…

### UI-52 · done
surface-registry's ARM A4 asserts a property that only holds at WAVE COMPLETION, and it is blocking a finished plane item — narrow the ASSERTION, do…

### UI-1 · done
The TASK INBOX — the member surface for the attention layer, which MILESTONES M8 builds FIRST. The plane HALF ALREADY EXISTS (D-98, 0.49.0): ops…

### UI-2 · done
The first ACT surface — v0.2's FALSIFIABLE TEST ("build the queue and ONE act; if the next three acts each need a new construct, the collapse was…

### UI-3 · done
The SECOND act — a BALLOT — continuing v0.2's FALSIFIABLE test (does the ACT construct hold for an act UNLIKE the justified transition? "if the next…

### UI-4 · done
The SUBJECT VIEW — "what the record knows about a subject", making the M4 reverse index MEMBER-VISIBLE (op concerns already turns "every document…

### UI-5 · done
The THIRD act — a PROPOSAL — completing v0.2's falsifiable test (act three of "the next three acts"; also closes D-82's DISPLAY half). A proposal is…

### UI-6 · done
The ATTESTATION act — a member CO-ATTESTS a capture (op attest: co-attestation over a capture hash via a timestamp authority, raising a capture from…

### UI-7 · done
The MEMBERS & GOVERNANCE roster — the READ-ONLY half of U11 (the BOB inbox said to SPLIT U11 since it exceeds its rung; this is the safe read slice;…

### UI-8 · done
The member HOME — the "what needs you" orientation surface, the ENTRY POINT for M8's capability ("a member can reach what the record holds"). There…

### UI-9 · done
CONSTRUCTS Step 8 (PRESENTATION), the document-page half — a document page SHOWS its REFERENTIAL and TEMPORAL structure, so a member reading ONE…

### UI-10 · done
The type in the UI, and the drift guard made real. As BUILD-ORDER.md §2 (UI-10), carried forward verbatim per RECONCILED.md §3.3. The member-facing…

### UI-11 · done
S3 THE INQUIRY PAGE, read-only. As research/RECONCILED.md §3.1 (UI-11): TWO strengths, never one — each naming its own weakest leg, no…

### UI-12 · done
S3's act bar — CONCLUDE, through the ACT construct, options read from the plane. As research/RECONCILED.md §3.1 (UI-12): the live strength preview…

### UI-13 · done
A WRITE SURFACE for the intent layer — nine ops, zero callers. As BUILD-ORDER.md §2 (UI-13), carried forward verbatim per RECONCILED.md §3.3.…

### UI-14 · done
S1 THE QUEUE — three screens become one. As research/RECONCILED.md §3.2 (UI-14): mute control reads "Mute conditions on this case" and reaches…

### UI-15 · done
E3 ADD — the two worst live defects in the member UI, plus F-6 and F-7. As BUILD-ORDER.md §2 (UI-15), carried forward verbatim per RECONCILED.md §3.3…

### UI-16 · done
E4 PROJECT WORKSPACE — the ballot act finally gets a call site. As BUILD-ORDER.md §2 (UI-16), carried forward verbatim per RECONCILED.md §3.3; the…

### UI-18 · done
O2 THE PUBLISHED CASE — the reason the rest exists. As research/RECONCILED.md §3.1 (UI-18): both strengths everywhere including the index row; a…

### UI-19 · done
O3 THE ACTION PAGE — the outward ask, and what came back. As BUILD-ORDER.md §2 (UI-19), carried per RECONCILED.md §3.3 (already refuses from the…

### UI-20 · done
op cite gets its caller — the never-built U9 half. As research/RECONCILED.md §3.1 (UI-20): the pre-flight checks every member is CITABLE (information…

### UI-22 · done
Close the two pre-DEC-8 refusal residues UI-12 named. (1) disposePreflight (UI-2's, built before DEC-8) still computes and WORDS its own…

### UI-23 · done
The D-173 class sweep — every DO-op read in the UI opens the envelope, and a guard so the class cannot reopen. Five instances found across two items…

### UI-24 · done
The untested authentication surface — sign-in and the public list have zero harness coverage. UI-23's sweep found signIn's token read broken since…

### UI-25 · done
The uncapped query selection — "hold everything this query matches" (UI-21's follow-on). The finder's lease is drawn from a page capped at limit:500,…

### UI-26 · done
Consume op readingname (REC-36's UI half). UI-13's loadResolveCandidates (app.html ~:9409) loops op readingref once per alias and states a limit that…

### UI-27 · done
The reader supplies the floors — DEC-40, and it CORRECTS SHIPPED CODE. UI-18 landed a four-stance selector; the ruling removes it. (a) Remove the…

### UI-28 · done
The surface stops authoring the attestation fence (DEC-39's UI half). app.html's ATTEST_YIELDS_GRADE constant and its hand-written honesty block…

### UI-30 · done
The sign-in surface renders the plane's refusal SENTENCE, and its harness stops asserting a retired code (REC-41's consumer half). REC-41 collapsed…

### UI-31 · done
The vocabulary guard reaches the sign-in gate (UI-30's routed finding; D-174 measured rather than watched). UI-4's member-facing vocabulary guard and…

### M0-9 · done
scripts/coverage.mjs can report that a suite declares NO negative control when it declares an elaborate one — and can record only the first arm of…

### REC-50 · done
op acquire still STAMPS its capture grade letters as literals — the last place the capture axis is typed rather than composed (routed out of REC-48).…

### REC-51 · done
The grade VOCABULARY is copied by value four times inside store.mjs, one level below the statements REC-43/REC-48/REC-50 just closed (routed out of…

### REC-49 · done
The published INDEX tells the truth about a case's strengths — two defects, one region, both found by UI-29 and both introduced by REC-44's landing.…

### UI-33 · done
The half of the pre-authentication vocabulary that NO answer to DEC-49 will fix (UI-31's measurement, routed as a queue question rather than raised…

### UI-34 · done
handle renamed product-wide, and one pre-authentication surface no scenario drives (both routed out of UI-33). (a) UI-33 KEPT handle at the sign-in…

### UI-36 · done
pubVerify is a public, uncredentialed op whose answers NO scenario harvests — and it can ADD rows to DEC-49's subject (routed out of UI-34).…

### UI-37 · done
The public verification surface renders a plane REFUSAL as a substantive negative (D-195, measured by UI-36). pubVerify calls op verify through apiQ,…

### UI-35 · done
op publishedcase's top-level detail is rendered NOWHERE for a case that was found (measured by UI-33, in UI-29's ground). A published field no…

### UI-32 · done
The FOURTH hand-written statement of the capture-grade doctrine, plus two small stale copies in its neighbourhood (routed out of UI-28). REC-43…

### REC-52 · done
The PLANE converts its own failures into substantive negatives — D-197 one layer down, and invisible to every surface (found in passing by UI-37, not…

### REC-53 · done
Two LIVE instances of REC-52's class inside the publish/ratify block (reported by REC-52, not fixed because REC-47 held that ground). REC-52…

### REC-48 · done
Close the THIRD hand-written statement of the capture-grade doctrine (routed out of REC-43). REC-43 made the attest act's fence a FUNCTION of the…

### UI-29 · done
The published case renders its FINDINGS, not one finding (DEC-44's surface half). UI-18 renders a single inquiry as the case; a case is a SET. Every…

### UI-21 · done
E1 THE EVIDENCE FINDER — one finder, two NAMED routes, the intersection refused rather than approximated. As BUILD-ORDER.md §2 (UI-21), carried…
