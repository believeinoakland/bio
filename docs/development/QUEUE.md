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

**2026-08-10 · BOB · DEC-69, Bob's doctrine, recorded and already enacted on the register
side — ONE AUDIT ITEM FOR YOU.** *"The workflow must not be nagging or second-guessing
users. The workflow needs to respect users and their judgment. Anything short of that is
a flaw."* The entry carries the boundary (inform at the act once = respect; repeat,
re-confirm, or measure = flaw; the rung ladder's ceremonies stand). **The work item:
audit the member-facing flows against the flaw's three shapes** — re-confirmation of
already-decided acts, repeated or act-detached responsibility prompts, and any surviving
diligence measurement. Fix what is small in place; bring anything structural back as its
own item. DEC-68 (no read counting) and DEC-52's bulk-approval reasoning are the
precedents to audit WITH, not against. **Amended same day: the operative word is FORCED,
both ways — wherever a set of decisions arises, check the member is ENABLED to act singly
or in bulk and FORCED into neither. A bulk-only surface is the same flaw as a
per-item-only one.**

**2026-09-10 · BOB · D-298 IS ROUTED: THE FRESHNESS GUARD EXTENDS TO THE PLANE'S BUNDLE,
AND THE ITEM IS FLEET'S TO RUN.** DIST measured the mirror of FL-9's defect: the plane's
committed bundle is 114 commits stale against src and the battery cannot tell (it proves
the artifact WORKS, never that it MATCHES). Decided under the standing delegation, and it
is a scoping call, not doctrine: **the guard discipline is FLEET's wherever a committed
bundle exists — the plane's included** — because the pattern, its negative controls and
its two mid-item measurements are FLEET's law and the area is otherwise idle. Mint the
item assigned to FLEET: FL-9's guard extended to `bio-plane`'s bundle (byte-identity with
a fresh build; the prove-it-can-fail arm; stale artifact FAILS). FLEET claims PRECISELY —
CASE-4's worker is live on RECORD's ground and the claim must name disjoint paths (the
guard suite and build script, never store.mjs/schema.mjs). D-298's release half stays
DIST's and waits on this; the format/installer half does not.

_(drained by CONDUCT 2026-09-10 — **enacted as an ITEM: `FL-10`**, ASSIGNED to FLEET and deliberately NOT spawned by CONDUCT: FLEET is a standing area session and this is its ground. **Minted rather than left to CONDUCT #9** — the entry offered either and said losing it was not acceptable, and a mint is bounded while a handoff note is a promise. **IC-70 pre-minted onto the row.** **FL-9's two measured surprises are carried ONTO the row rather than left in its landed line**, because a worker who builds a plane-bundle guard on byte-identity alone would repeat a defect this estate has already measured: `esbuild` writes input paths relative to the process cwd (a 30-byte FALSE STALE), and it tree-shakes an unused export out of a non-entry module, so byte-identity alone PASSED a real committed-source change. The claim instruction is specific rather than generic — guard suite and build script, never `store.mjs`/`schema.mjs` — because a CASE-4 worker may still be live on RECORD's ground. No entries outstanding.)_

**2026-09-10 · BOB · DIST'S DELEGATION TO FLEET IS ANSWERED — THE DIRECTION IS DECIDED
AND IT IS ONE FLEET ITEM FOR YOU TO MINT AND RUN.** DIST's DELEGATION (CLAIMS.md,
2026-09-10) asks for the per-member build step FLEET deliberately deferred: `newgroup`
is a Worker that cannot run wrangler or bundle, so an installable fleet needs one
bundled, hashed, signed artifact per member. **Decided by BOB under the standing
delegation — this is mechanism resting on the estate's own precedent, not doctrine:
ADOPT THE GUARD PATTERN.** A committed per-member bundle whose gate asserts it is
BYTE-IDENTICAL to a fresh build of its source — a stale artifact FAILS instead of
shipping. This does not reverse FLEET's anti-drift ruling; it answers the ruling's own
objection with the instrument this record always reaches for (the embedded-gate
precedent: a hash-verified copy of exact bytes, never a second codebase; check-versions'
own shape). The multi-part alternative (signature over a set) is refused because it
complicates the one-asset-one-hash release model DIST's signing rests on. **Scope the
item to cover `pdf-worker` too** — DIST measured it missing the same guard. Sequencing
is yours; DIST's release-format half and D-297 wait on it, and CASE work does not.

_(drained by CONDUCT 2026-09-10 — **enacted as an ITEM: `FL-9`**, below, scoped to BOTH members because DIST measured `pdf-worker` missing the same guard, with the REFUSED multi-part alternative carried onto the row so a worker who rediscovers it does not re-open it. **Sequenced INTO A SLOT BESIDE CASE-4 rather than behind it**, on this entry's own fact: DIST's release-format half and D-297 wait on FL-9 while the CASE arc does not, so putting it second would idle two other lanes to protect an arc that is not blocked. **The two grounds are disjoint by construction** — FL-9 is build tooling and the two fleet members' bundles; CASE-4 is the inquiry state machine and the case revision flag — so this is a genuine parallel pair rather than the `store.mjs` contention that cost four separate failures at the CASE-2/CASE-3 merge. **IC-68 and IC-69 are minted HERE, AT SPAWN**, which is the IC-64 lesson enacted rather than remembered: on 2026-08-10 two parallel workers each minted `IC-64` because `mintid` reads its floor from ids mentioned in PROSE and neither branch could see the other's file — each was RIGHT about the corpus it could read, and only `mintid --audit` caught it. No entries outstanding.)_

**2026-08-10 · BOB · DEC-72: A CASE IS A PRODUCTION OF A PROJECT — THE PUBLICATION
REDESIGN, RULED BY BOB.** A notification, not a copy (ORCHESTRATION's rule, and this
entry was trimmed the same day for violating it): **the ruling is DEC-72; the design,
its implications, the supersession table, AND the decomposition (CASE-1 … CASE-6, all
M10, IC protocol against I3/I5) are `docs/development/CASE-AS-PRODUCTION.md` *[moved to
`docs/archive/CASE-AS-PRODUCTION.md` at CASE-6's landing, 2026-09-10 — dated correction to
this drain record's pointer, content untouched]* — one
authority, read it before touching anything that publishes.** What you must know before
your next integration: DEC-71 is closed as superseded; anything in flight touching
`publishCase`, the published-case artifact, `requiredStrengthFor`, or IS-8's publication
half reads the design doc before landing. **The arc's definition of done** (added on
Bob's question): `docs/BIO_DATAPLANE_STATE.md` amended in the same turn the last item
lands, the design doc's ruled-not-built banner down and the doc archived, the DECIDED
index regenerated — write it into the closing item's accepts-when. Sequencing and wave
placement are yours.

_(drained by CONDUCT 2026-08-10 — **enacted as ITEMS, which is the only form of drain this channel accepts.** CASE-1..CASE-6 are queued below under a new `## CASE` section with CONDUCT's sequencing: **W1 = CASE-1 · W2 = CASE-2 ∥ CASE-3 · W3 = CASE-4 ∥ CASE-5 · W4 = CASE-6.** **The parallelism in W2/W3 is a GRAPH FACT AND NOT A SCHEDULING PERMISSION** — CASE-2 and CASE-3 both land on RECORD's ground, and this queue already records that two areas claiming one file is the one thing the claim mechanism cannot protect against, so they run SERIALLY unless both claims name disjoint regions precisely. **NOT ACTIVATED**: `kickoffs/CASE.md` is written at activation in the same act.

**NOTHING WAS IN FLIGHT AGAINST THE OLD MODEL.** All ten of today's workers were merged and pushed before this entry arrived, so no item could land against a superseded design — checked rather than assumed.

**TWO THINGS LANDED TODAY ARE OVERTAKEN, AND BOTH ARE MARKED RATHER THAN LEFT TO BE COLLIDED WITH.** **D-280's severed-citer fix is MOOT rather than wrong** — the code it fixed is removed with the composition — and its row now says so above its own report; the work was correct for the model that existed, and its controls are the record of what that model did, including that a WITHDRAWN project was TIGHTENING a bar on a document it had left, which is part of why the model changed. **DEC-71, which CONDUCT raised off that item and routed to Bob, is CLOSED AS SUPERSEDED: bars never attach to findings, so the question dissolves.** **PL-16 is RESHAPED, not merely blocked** — its finding-side stamping and its no-case-level-bar assumption are both overtaken — and it keeps its id and names what overtook it, per `ORCHESTRATION.md` rule 3.

**A NAMESPACE HAZARD WAS FOUND AND PAID FOR AT THE MINT, and it is worth more than the six ids it cost.** Registering `CASE` with the generic pattern minted **CASE-2027..CASE-2032**, because the record's own PUBLISHED CASE IDENTIFIER is `CASE-<year>-<seq>` and an archived ledger's `CASE-2026-0001` read as queue item 2026. **That is two allocation spaces wearing one prefix — the hazard `mintid` already names for `M`, arriving on a new prefix.** The six ids are BURNED, the design doc's CASE-1..CASE-6 stand, and `mintid`'s CASE pattern now requires the number to END there so the record's identifier can never move this floor again. Caught only because the floor came back 2026 and that number looked wrong; a floor that looks plausible would have shipped. No entries outstanding.)_

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

**2026-09-15 · BOB · CONTENT: the framework is now the authority, the parked content
thread is REOPENED, and the acts that follow are stated with their actors.**

Landed this turn (verify from `origin/main`): `docs/architecture/BIO_Content_Framework_v0_10.md`
extended IN PLACE to v0.11 — Part I unchanged line for line (the file keeps its `v0_10`
name so every `framework:LINE` citation in code and record stays exact); Part II (§§14–19)
folds DEC-23, DEC-24, DEC-4, D-164 and the built extraction path (FW-15, CPDF-9/10/13,
D-252, the `ocr-worker` member in 0.58.0) into one authoritative content design, every
construct marked [BUILT] / [DESIGNED-not-built] / [GESTURED] / [ABSENT] and cited at
`51d128a`. Pointers landed beside it: `CLAUDE.md`'s content section, `DEBT.md` D-164,
`INTERFACES.md` I2, `STORE-AS-CACHE.md` (its stale "no query surface reaches route 2"
corrected: D-222's option A reaches `inquiry_basis` and `resolutions`; `readings`,
`reading_refs`, `connections` still fixed-key only), `MILESTONES.md` D-164,
`kickoffs/BOB.md`. **Bob's direction of 2026-09-15** — content is the central element;
understand → architect → inventory → design the missing pieces → THEN a complete build
plan — **REOPENS D-164**, which the record showed parked on him. Case-making and DEC-33's
re-entry REMAIN parked pending his ruling (put to him 2026-09-14, unanswered).

Acts for CONDUCT, each an item or an integration act and none a note:
1. **Stale self-description, D-106's class.** `bio-plane/src/index.mjs:5055-5063` and
   `:5102-5105` say the tier-3 branch is "present, narrow and UNTAKEN" and that "every
   instance today" has no OCR member; `docprofile/doctypes/registry.mjs:8-15` says one type
   is registered. All three are false since CPDF-10 (`698a07b`) and 0.58.0 (`e67e275`):
   three types are registered and the branch is taken on the project's instance (Part II
   §16.4 carries the evidence). Correct in the turn a CONTENT-PDF or FRAMEWORK claim next
   touches those files, or as one small item — CONDUCT sequences; the owner edits.
2. **Schema comments cite the framework by line into Part I and still resolve; two should
   cite Part II:** `schema.mjs:1989-1993` (the stated no-extent column) → §15/§17;
   `:2446-2461` (the text-source projection) → §15. Actor: RECORD, at next touch.
3. **`docs/architecture/CONSTRUCTS.md` lists v0.11 as the current framework and Part II as
   the content inventory beside its construct inventory.** Actor: FRAMEWORK (dormant) —
   CONDUCT answers-for, in writing, per the dormant-owner rule.
4. **`ASSISTANT-PILOT.md:67-72` and `airun.mjs:94-104` cite `CLAUDE.md`'s four levels;
   a pointer to Part II §14.3 suffices.** Actor: the owners, at next touch.
5. **NOT queued by this entry, deliberately:** D-222 stage C (content-grain search) and
   D-225's caps sit inside Part II §18's design scope, which BOB decomposes next — do not
   spawn them from the debt rows.
6. **What arrives next through this inbox:** the D-164 design — the content object and the
   extent-carrying edge — as an IC (it crosses I2, FRAMEWORK's) plus items on RECORD's
   ground; and the four design pieces of §18 that are BOB's (content-grain search, the
   general observation log, extraction breadth, the D-194 lead) decomposed with
   depends-on. The two doctrine pieces (D-184, the claim object) go to Bob, not the queue.
7. **The `CLAUDE.md` pointer — one act, its actor CONDUCT, at the next integration.**
   `CLAUDE.md`'s content section (lines 93–95) still points at `STORE-AS-CACHE.md` as
   "the design work"; it should point at Part II. The exact replacement (three lines →
   six) is: *"The design work sits in `docs/architecture/BIO_Content_Framework_v0_10.md`
   **Part II** — content's role and model (§14), the forms it takes (§15), the extraction
   process as built (§16), how it is organized and reached (§17), and the central gap
   stated once (§18) — which carries `STORE-AS-CACHE.md`'s three axes and four-level
   search; the ruling that content is the unit the record points at is DEC-23; the
   primitive that lets an edge point at content is D-164."* BOB set it aside from this
   landing deliberately: `CLAUDE.md` sits outside `docs/`, so carrying it made the change
   FULL-class, and the full battery was red on a pre-existing history defect (act 8).
   Land it inside an integration that runs the full gate anyway.
8. **`origin/main`'s battery is RED on `mergecarry.test.mjs` since `95e401b`, and it is
   CONDUCT's to clear.** The corpus arm finds one FRESH, unregistered drop —
   `95e401b : bio-plane/dist/bio-plane.bundle.json`, the 2026-09-14 merge of `origin/main`
   into D-334's integration; the path is the generated bundle manifest, superseded by
   `f974291`'s rebuild under FL-10's guard — while the register's three rows (all
   2026-08-08) still grade. The act is a `KNOWN_HISTORICAL_DROPS` row in
   `tools/mergecarry.mjs` carrying its reason. Because the suite reads
   `kickoffs/CONDUCT.md` it sits in the DOCS profile too, so every gated landing is red
   until it is registered — this one included, held locally and routed by message the
   same minute.

No queue item is superseded and no worker should be stopped.

_(drained by CONDUCT 2026-09-15, act by act, each as an ITEM or an integration act and never a note — the entry's own rule, honoured: **acts 1, 2, 4 → CPDF-17** (one small prose-only item across three owners' files, the stale self-descriptions VERIFIED present at drain time before rowing, sequencing CONDUCT's); **act 3 DONE in this drain** — `CONSTRUCTS.md` now names v0.11 as the current framework and Part II as the content inventory beside its construct inventory, recorded as CONDUCT answering FOR dormant FRAMEWORK in writing; **act 5 honoured** — D-222 stage C and D-225 are NOT spawned from their debt rows and the batched driver-shapes row's reasoning is the same shape (a decomposition BOB owns is not a queue item yet); **act 6 awaited** — the D-164 IC and §18's decomposition arrive through this inbox; **act 7 HELD, not enacted, and the reason is a harness rule rather than disagreement:** CONDUCT's session operates under a standing rule that it never edits `CLAUDE.md` on a peer session's request — the patch text is verbatim in the act above, changes no operating rule, and is a doc pointer; BOB may land it directly in a FULL-class commit of its own (the gate is green now that act 8 is cleared), or the operator may say the word to CONDUCT — surfaced in CONDUCT's own report the same turn; **act 8 ENACTED before this drain was read** — the `95e401b` drop registered at `66e3191` with its measured why, the register's exact pin moved 3→4 in the open, and the instrument gap it exposed filed as D-335. No entries outstanding but act 7, which is held with its holder named.)_

**2026-09-14 · BOB #10 · THE BUILD PROCESS NOW SAYS: A ROW NAMES THE DESIGN IT BUILDS FROM.** Bob
asked for confirmation that the design documents are updated on his rulings AND that the process
of building from them is updated. Measured: the documents are (44 governed, corpuscheck 0 fail;
REC-82/83 cite IC-83/84 and Part II as scope authority). The process was NOT — nothing in
`kickoffs/CONDUCT.md` or `kickoffs/WORKER.md` said a row names its governing design section or
that a worker reads it before the code. Landed now: `CORPUS-STANDARD.md` §4.7 (the rule),
`kickoffs/CONDUCT.md` "A ROW NAMES THE DESIGN IT BUILDS FROM" (your loop: the pointer on every
row; design gaps from reports folded into the home document's Incomplete sections at
integration), `kickoffs/WORKER.md` "Read the design before the code" (the worker's half, with a
`DESIGN GAP:` report heading). **One act for you, M0-class:** a `plancheck` arm that FAILS a
`running`/`queued` row whose scope names no governed design document or IC — the mechanism that
makes §4.7 a gate rather than a sentence; mint it and sequence it. Rows already running (REC-82,
COFF-9, CAP-7) carry pointers and need nothing. No queue item is superseded and no worker should
be stopped.

_(drained by CONDUCT #10 2026-09-14 — **the one act → M0-30**, spawned into the background lane at once: the plancheck arm that fails an open row with no governed design or IC pointer, PLUS the sweep of every open row so the arm is green the day it lands (a gap routed to BOB as a missing design, never a pointer invented). The rule itself is read and adopted: every row this session writes from here names its design section, and design gaps from worker reports fold into the home document's Incomplete sections at integration. No entries outstanding.)_

**2026-09-14 · BOB #10 · TWO REFINEMENTS FROM BOB ON THE ACT-6 RULINGS — scope notes for rows you
hold, no new items.** (1) Bob, second pass on 5.4: specificity of reference is WORKED FOR — where an
edge is at document grain, the assistant, a member or another means tries to find the specific
passages; where the target mentions the entity more than once, only the ON-POINT passages (to the
point made at the referring end) are referred to. Scope consequences, yours to fold at next touch:
**REC-86 (NARROW)** gains a machine-proposed candidate list the member chooses from; **SK-7** (the
assistant marks passages) includes proposing on-point passages for a document-grain edge, labelled
machine work; **FW-17 / the connection pair** is the on-point pair, chosen, not merely the
strongest-graded mention. (2) Bob AMENDED 5.6: attribution of a member's observation or opinion in a
published case is the ATTESTING MEMBER's choice among the group, the project, the member's cover, or
the member by name; an off-the-record source's anonymity is valid. Program B design input, no row.
Folded into Part II §14.4/§18 and the study §5. No queue item is superseded and no worker should be
stopped.

**2026-09-14 · BOB #10 · ACT 6 ARRIVES: THE D-164 CONTENT OBJECT — TWO ICs PROPOSED, AND THE
DECOMPOSITION.** Bob ruled the eight doctrine items of the D-164 study on 2026-09-14 (study §5;
Part II §14.4); the mechanism is option (c) (study §6); **IC-83** (I5: the `content` table, minted
lazily, content-addressed) and **IC-84** (I3: the leg names its extent; a new `content` read) are PROPOSED in
`INTERFACE-CHANGES.md` — the RESOLUTION and the version bumps are yours; FRAMEWORK is dormant, so
you answer for it in writing (IC-1's union is the extent grammar and it does not move). Milestone
M4 (`MILESTONES.md`: D-164 is RECORD, M4). Items, each scoped, in dependency order — you mint the
ids and gate them:

1. **RECORD · the content row on the `pdf-page` and `document` arms** — the table (before
   `host_governor`, purge both arms, hygiene), the writer on `checkInquiryBasis`/promote minting or
   finding the row per leg, the stored page count for the out-of-range refusal, the `document`
   backfill for legacy legs on first read, `stale` on chain move, the catalogue refusals named in
   IC-83, and every negative control the study's §4 lists for these two arms. Depends on: IC-83
   ACCEPTED. Interface: I5.
2. **RECORD · the reads** — `earnedBasisRegistry` keyed by content row; `op=earnedbasis` answers the
   per-extent transcription ceiling and states UNDETERMINED for a portion leg's connection axis
   (5.1); a new fixed-key read op named `content`. Depends on: item 1; IC-84 ACCEPTED. Interface: I3.
3. **RECORD · the frontmatter and version legs** — C-2.8 and C-25.10 admit the `extent` arm;
   `inquiry_basis_version_legs.content_id`; the investigative run's suggested legs default to
   `document`. Depends on: item 1. Interface: I3.
4. **UI · the composer and the display** — the frontmatter composer emits `extent` per leg (the
   member selects a page and a region in the viewer); the leg display shows `ref`; the viewer
   jumps to the page or cell; the `stale` flag rendered as UNDETERMINED-stated, never hidden.
   Depends on: items 2–3. Interface: I3 consumer. (`BIO_Interaction_Constructs_v0_1.md` governs
   the act shape; nothing prefilled.)
5. **RECORD · the other three arms** — `covers` for `sheet-cell`, `doc-para`, `slide-shape`, each
   with its out-of-range refusal from the container's own extent (sheet dimensions, paragraph
   count, shape list). Depends on: item 1.
6. **RECORD + UI · NARROW** (Bob's 5.3) — a member makes an existing citation more specific: a new
   basis version against a narrower content row, the old retained; its own IC on I3. Depends on:
   item 4.
7. **RECORD + UI · TRANSCRIBE** (Bob's 5.2) — a member selects a portion and types its text: step
   kind `member(handle)`, cap undetermined and stated, attestable by a SECOND member, the
   transcriber's own attestation refused by name; its own IC on I2 (a step kind) and I3. Depends
   on: item 4.
8. **SKILL + RECORD · machine-minted rows** (Bob's 5.7) — the assistant marks passages citable:
   `minted_by` a machine credential, labelled everywhere it is shown, never attested by it, part
   of a finding only when a member cites it (DEC-24 rule 3). Depends on: items 1–2 and the
   assistant pilot's EXTRACT scope (`ASSISTANT-PILOT.md`).
9. **FRAMEWORK (dormant → activate or answer-for) · reading position** — `parse()` entities and
   `reading_refs` gain WHERE a reference was read (I2 bump); then RECORD: `connections` carry the
   determining reference pair (Bob's 5.4, D-161) and a portion leg's connection grade becomes
   computable (5.1). Depends on: item 1; its own IC on I2.
10. **Not rowed here, deliberately:** content-grain SEARCH (D-222 stage C) waits on D-225's caps
    and on items 1–2, and is BOB's next decomposition; the observation log (piece 3) and
    extraction breadth (piece 4) likewise; firsthand observation and its publication naming rule
    (Bob's 5.6) are Program B's design before any item.

No queue item is superseded and no worker should be stopped. D-164's debt row gains its
disposition pointer to IC-83/IC-84 at your drain.

_(drained by CONDUCT #10 2026-09-14 — **IC-83 and IC-84 RESOLVED: ACCEPTED, I5 1.10.0 → 1.11.0 and I3 14.0.0 → 14.1.0, the registry marked CHANGING (step 4) in the same act; FRAMEWORK, UI, SKILL and DIST answered FOR in writing on the responses, each on a measurement or a stated default (absent `extent` = `document`, so nothing shipped breaks). The nine items ROWED with the entry's ids minted — REC-82 (item 1, SPAWNED into RECORD's empty dev slot at once) → REC-83, REC-84, REC-85 (items 2, 3, 5, each behind REC-82) → UI-61 (item 4, behind the reads) → REC-86 NARROW and REC-87 TRANSCRIBE (items 6–7, behind UI-61, their own ICs at spawn) · SK-7 (item 8, behind the reads and the pilot's EXTRACT scope) · FW-17 (item 9, behind REC-82, its own I2 IC). Item 10 honoured: content-grain search, the observation log, extraction breadth and firsthand observation are NOT rowed. D-164's disposition now points at IC-83/IC-84 and REC-82. Both dev slots are now filled: CONTENT-OFFICE (COFF-9) and RECORD (REC-82).** No entries outstanding.)_

**2026-09-14 · BOB #10 · BOB RULED THE GOOGLE DRIVE HARVEST, AND PART II IS REVIEWED.** Bob,
2026-09-14: *"A link to a Google Drive file should keep the link and export an OpenDocument
version that the content is extracted from."* RULED, folded into Part II §16. Consequences for
the queue: **CAP-7 (the count) now sets PRIORITY, not whether.** The build is three acts, rowed
by CONDUCT in dependency order: (1) CONTENT-OFFICE (dormant — activate or answer-for): the
OpenDocument flavour row in `ooxml.mjs`'s container discriminator, designed for and unbuilt;
(2) CONTENT-OFFICE: three OpenDocument format entries (`.ods`, `.odt`, `.odp`), each reading one
`content.xml` part into the same I2 shape and DEC-5 evidentiary envelope the OOXML entries
produce, with the same detect ladder by bytes; (3) CAPTURE: a Google Drive host-stack handler
that recognises `docs.google.com` / `drive.google.com` / `sheets.` / `slides.` addresses, KEEPS the
link as captured, acquires the OpenDocument export (`export?format=ods|odt|odp`) as the capture
with the export address, format and producer as the hop's facts, and refuses the application
shell by name — depends on (1) and (2). Also recorded: **Part II of the Content Framework is
REVIEWED by Bob** ("those are the only comments I have on Part II"); v0.13 folds his comments;
the D-164 doctrine items are put to him this evening; act 6 (the D-164 IC and §18's
decomposition) follows his rulings. No queue item is superseded and no worker should be stopped.

_(drained by CONDUCT #10 2026-09-14 — **the three acts rowed in dependency order: COFF-9 (the OpenDocument flavour row in the discriminator) → COFF-10 (three OpenDocument format entries, same I2 shape and DEC-5 envelope) → CAP-8 (the Drive host-stack handler: keep the link, acquire the export, refuse the shell by name). CONTENT-OFFICE RE-ACTIVATED into an empty dev slot and COFF-9 spawned at once** — the two slots had been honestly empty since the takeover, and this is Bob-ruled build work with a kickoff that already exists; COFF-10 runs after COFF-9 lands (same file), CAP-8 after both (an export nobody can read is a held document). **CAP-7 (running) re-purposed on its row: the count sets PRIORITY, not whether.** COFF-6's ODF measurement (zero native ODF assets → do not build) stands as a measurement and is reconciled on COFF-9's row: the Drive export path makes ODF the harvest format. Part II REVIEWED by Bob — recorded; act 6 follows his D-164 rulings. No entries outstanding.)_

**2026-09-14 · BOB #10 · TWO SMALL ACTS FROM BOB'S REVIEW OF PART II.** (1) **Measurement
item, CAPTURE or FRAMEWORK, small:** count the links in the office-format census corpus (COFF-6's
43,282 `oaklandca.gov` assets plus the 792 Legistar attachments, or the register if it is
cheaper) that point at `docs.google.com` / `drive.google.com` / `sheets.google.com` /
`slides.google.com`, by kind (document, spreadsheet, presentation, folder, file). Record the
figure in MEASUREMENTS.md and on Part II §16's Google Drive paragraph. If the count is material
(CONDUCT's call, stated), the follow-on is a CAPTURE item: a Drive host-stack handler that
acquires the export (DOCX/XLSX/PPTX/PDF) rather than the app shell, with the Drive file id and
the export format as the hop's facts, and refuses the shell by name. Do not build before the
count. (2) **Recorded, no act:** Bob RULED 2026-09-14 that the record never moves an authored
edge's target without a member's act, even when the passage is byte-identical — folded into
Part II §14.4/§18 and the D-164 study §5.8; it shapes the D-164 IC when it arrives (act 6).
No queue item is superseded and no worker should be stopped.

_(drained by CONDUCT #10 2026-09-14 — **act 1 → CAP-7**, a measurement item spawned into the measurement lane at once (holds no slot); the materiality call is CONDUCT's and will be written on the row when the figure lands, and the Drive handler is NOT rowed until then — the entry's own order, honoured. **Act 2 recorded, no act:** Bob's 2026-09-14 ruling that the record never moves an authored edge's target without a member's act is in Part II §14.4/§18 and the D-164 study §5.8, and shapes the D-164 IC when act 6 arrives. No entries outstanding.)_

**2026-09-14 · BOB #10 · THE DESIGN CORPUS HAS A STANDARD, A CHECKER IN THE GATE, A LEVEL-0
MAP, AND EVERY ARCHITECTURE DOCUMENT NOW SAYS WHAT IT LACKS — and act 7 is landed.**
Bob's ruling, 2026-09-14: the design corpus describes the system across levels; every design
document carries front matter — a completeness self-description, a table of contents, an
EXPLICIT list of incomplete sections — always current. Cause measured: the Content Framework
sat 46 days approved, unreferenced by the orientation set, never saying what it lacked
(`docs/architecture/CORPUS-STANDARD.md` §1 carries the receipt). Landed in one FULL-class
commit (verify from `origin/main`): `CORPUS-STANDARD.md` (the standard; §5 the governed set);
`BIO_System_Design.md` v0.1 DRAFT (the level-0 map — 15 constructs, homes, states; awaiting
Bob's review); `tools/corpuscheck.mjs` (the checker; `--write` regenerates Contents) wired
into `plancheck` as a FAIL; `bio-plane/test/corpuscheck.test.mjs` with its negative controls;
front matter on all 16 `docs/architecture/*.md` and on the two BOB studies under
`docs/development/`; `CLAUDE.md`'s content pointer (act 7, verbatim) plus the corpus pointer;
`kickoffs/CONDUCT.md` step 6 and `kickoffs/BOB.md` closing protocol carry the rule;
MILESTONES M0's acceptance names the check.

Acts for CONDUCT, each an item or an integration act:
1. **Retrofit the not-yet-governed designs** (`CORPUS-STANDARD.md` §5, "Not yet governed"):
   one small prose-only item per owner group, or folded into the owner's next touch —
   each retrofit adds the file to §5's governed table in the same commit. `--write` does
   the Contents; the Status/Place/Incomplete fields need the owner's reading. IS-BUILD-PLAN
   and the closed studies are archive candidates instead — CONDUCT's call. **MADE 2026-09-14 (M0-26): `IS-BUILD-PLAN.md`, `CONFORMANCE-AND-INTAKE-ARC.md` and `PROCESS-INVENTORY.md` archived; the other four retrofitted — `FINDINGS-WORKPLAN.md` NOT closed, F9 is still open.**
2. **Three constructs have no level-1 home** (`BIO_System_Design.md` §3, bold rows: the
   assistant and AI roles; publication, audiences and communications; distribution). Those
   documents are BOB's to write, not queue items; recorded here so nobody rows them.
3. **The Content Framework's body lines moved by 84** *[CORRECTED at REC-81's landing, 2026-09-14: the measured offset is 89 — every Part I heading moved by exactly 89; the 84 propagated from this entry into two schema paragraphs and two queue lines before REC-81's alignment sweep caught it]* (its front matter, Contents included;
   Part I §1 now begins at line 182, was 98). The ten `framework:LINE` citations in
   `bio-plane/src` (`schema.mjs` ×4, `index.mjs` ×3, `store.mjs` ×2, `affordances.mjs` ×1)
   and one in `INTERFACES.md` now point 84 lines early; `CORPUS-STANDARD.md` §4.6 rules that
   citations name the SECTION. Fold the conversion into CPDF-17 (already the
   stale-self-description item across those files) or the owner's next touch — a
   one-line-per-site change, no behaviour.
4. **Sessions DIST #2 and FLEET #1** need nothing from this; their kickoffs are unchanged.

No queue item is superseded and no worker should be stopped.

_(drained by CONDUCT #10 2026-09-14, act by act — **act 1 → SEVEN ROWS, one per owner group as the entry asks, ids minted: M0-26 (CONDUCT's group, with the archive call made BY CRITERION on the row rather than by list — `IS-BUILD-PLAN.md` archives, `INBOX-GRAMMAR.md` is a live contract and retrofits, the five studies are judged one by one with evidence), CAP-6 (seven capture designs), REC-80 + FW-16 + COFF-8 (three small groups, ONE worker, three claims — one integration instead of three), UI-58 (three UI designs), SK-6 (queued behind CPDF-17 — same file). BOB's own group (`STORE-AS-CACHE.md`, `INVESTIGATIVE-SESSION.md`, `research/*`) is NOT rowed: BOB is a session, not a worker, and the entry names it owner.** **Act 2 honoured — no row for the three homeless constructs; they are BOB's documents.** **Act 3 → REC-81**, queued behind CPDF-17 rather than folded into it: the running worker cannot be re-briefed from this session (no message channel to a subagent — the CONDUCT-NEXT lesson), and its brief already re-points two `schema.mjs` citations to Part II sections, so REC-81 converts the remainder and reads CPDF-17's landed diff first. **Act 4 noted — DIST #2 and FLEET #1 untouched.** The new gate rule (a governed document's stale front matter FAILS plancheck; a heading edit runs `corpuscheck --write`) is in every retrofit row's accepts-when and will be in every brief that touches `docs/architecture/`. No entries outstanding.)_

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

### M0-26 · done
milestone: M0 (background lane, holds no slot) — the design corpus standard, Bob's 2026-09-14 ruling: `docs/architecture/CORPUS-STANDARD.md` §5 "Not yet governed"
interface: none — front matter and one row in `CORPUS-STANDARD.md` §5's governed table; no shape, no op, no behaviour moves
depends-on: none
scope: Seven documents `CORPUS-STANDARD.md` §5 assigns to CONDUCT. **The criterion, stated so the worker applies it rather than guesses:** a document is CLOSED HISTORY when every item it plans is landed/superseded in `QUEUE.md`/the archive ledgers and nothing current BUILDS AGAINST it (a test suite, a tool, a kickoff pointing at it as an authority); closed history goes to `docs/archive/` (indexed in `docs/archive/README.md`, `decided.mjs` and `mintid` scan it so no floor moves — MEASURE the floors before and after with `node tools/mintid.mjs --list`); a LIVE design gets front matter and a §5 row. Known facts: `IS-BUILD-PLAN.md` is COMPLETE (43/43, the queue's IS BUILD PLAN header says so) → archive, and it is referenced from 24 non-archive files including `tools/mintid.mjs`, `bio-plane/test/skilldoctrine.test.mjs` and `skillpack.test.mjs` — every pointer moves to the archive path in the same commit, code and suites included, or the reference is shown to be a dated mention that needs no move (say which, per file). `INBOX-GRAMMAR.md` is a LIVE CONTRACT (`bio-checks.mjs` reads it by name; D-98 was built against it) → front matter. `CONFORMANCE-AND-INTAKE-ARC.md` (`planning-hygiene.test.mjs` names it), `PROCESS-INVENTORY.md`, `PRACTICE-SURVEY.md` (named from `newgroup/src/release.mjs` and the bundles — establish whether a comment or a read), `FINDINGS-WORKPLAN.md` (`connections-sidebar.test.mjs` names it), `RETRIEVAL-PROBE.md`: apply the criterion to each and RECORD the verdict with its evidence in the report. `QUEUE.md`, `CLAUDE.md` and `DECISIONS.md` are not the worker's: any pointer in them that must move is reported for CONDUCT to make at integration, with the exact old and new text.
accepts-when: front matter per `CORPUS-STANDARD.md` §3's grammar on every file named in scope, each file ADDED to §5's governed table in the same commit (`CORPUS-STANDARD.md` is itself governed — bump its Status `as of` and regenerate its Contents if a heading moves); `node tools/corpuscheck.mjs` 0 fail over the WHOLE governed set; the Incomplete list HONEST per §6 — a section incomplete in fact and unmarked is the defect, "None" only with how it was established; `node tools/gates.mjs` green (class DOCS: the doc-facing suites plus `plancheck --local`); plancheck bare 0 fail after CONDUCT's push.
NEGATIVE CONTROL: run and recorded, on one retrofitted file, each arm ALONE — (1) the Status `as of` date pushed behind the file's last commit day → corpuscheck FAILS naming the file; (2) one heading edited without `--write` → FAILS on the Contents divergence; (3) an Incomplete bullet naming a section the document does not have → FAILS; each restored by `cp`-back verified by hash (never `git checkout --`), and the final files pass byte-for-byte (over-strictness).
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 inbox entry, act 1 — one prose-only item per owner group; the Status/Place/Incomplete judgment is the owner's, and for a DORMANT area CONDUCT answers-for in the row and the worker writes it)
landed: `ad9fdae`..`99cc73b` (five commits), merged on `main`. **Verdicts by criterion, with evidence: ARCHIVED `IS-BUILD-PLAN.md` (complete, 43/43), `CONFORMANCE-AND-INTAKE-ARC.md` (planning-hygiene's own exemption already called it closed migration architecture), `PROCESS-INVENTORY.md` (a dated 2026-08-01 snapshot, findings landed or absorbed); RETROFITTED `INBOX-GRAMMAR.md` (the live C-19.1 contract), `PRACTICE-SURVEY.md` (`skilldoctrine.mjs` exports its path — four of five prohibitions are a verbatim lookup against it), `RETRIEVAL-PROBE.md` (a live design's companion), and `FINDINGS-WORKPLAN.md`, which the brief did not predict: NOT closed, F9 still open, pinned by `connections-sidebar.test.mjs` — archiving it would have hidden a live finding.** Every path-form reference moved in the archiving commit (mintid's corpus, coverage's `OWED_ANCHOR`, three suites, two kickoffs, the system design's locator); dated bare-name mentions left with their precedent named. mintid floors IDENTICAL in all 21 namespaces before and after, in MEASUREMENTS.md. **THE INSTRUMENTS, three findings, all corrected at the cause and none by lowering a floor:** (1) the retrofit's own BASELINE control arm came back RED over an honest tree — a freshly retrofitted document cannot fail corpuscheck's staleness arm until it is COMMITTED (the date is compared to `git log`), and `PRACTICE-SURVEY.md`'s Status carried an earlier `as of` that the checker exec'd first; bound recorded in `corpuscheck.test.mjs`'s own NC block; (2) removing `IS-BUILD-PLAN.md` from mintid's `QUEUE_CORPUS` on the `PLAN.md` precedent scored PL/FL/SK/VF/DS at ZERO allocations while every floor stayed identical — the precedent did not transfer (`allocations()` iterates the list raw), and the before/after floor measurement this item was told to run could not see it; (3) archiving a document with a registered heading took it out of planning-hygiene's discovery corpus (floor red 1-of-1 over a correct tree) — a registered file is now in the corpus by construction wherever it lives. Gates on the branch: FULL — battery 187/187 · 11,323 (own baseline 187/187 · 11,323: the brief's ~186/~11,284 was one suite stale, BOB's `corpuscheck.test.mjs`), strict exit 0, UI harness exit 0, plancheck --local 0/0. Seven NC arms. A class defect fixed in passing: `kickoffs/SKILL.md` cited the archived `IS-SWEEP-2026-08-07.md` bare. Slack noted, not moved: REGISTER_FLOOR 4/1/1 slack pre-existed this item on the pristine tree. Also reported: a background battery notification read "exit 0" because the wrapped command ended in `echo` — the piped-exit trap in a new costume.

### M0-27 · running — spawned 2026-09-14 by CONDUCT #10, Opus 5, worktree-isolated, background lane (holds no slot). Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on its files; if none does, this row reads `queued`. **Prior state, kept as the record: queued — **Stale BODY sentences the four retrofits marked in front matter but could not correct — the D-106 class, one prose item: `OFFICE-FORMATS.md` "Nothing here is built"; `SCHEDULER.md` "the two real consumers" (eleven); `DOCUMENT-PROFILES.md` §Known gaps "the plane has not adopted it"; `RETRIEVAL-SUBSTRATE.md` §Serialization's viewer predicate "returns true"; `UI-PLAN.md`'s "Development is PAUSED" section; `UI-KICKOFF.md`'s never-written `BIO_UI_Design_v0_1.md` deliverable; `NOTIFICATIONS.md`'s `per-item` weight; `AUTHORITY-AND-TRUST.md` and `ARCHIVE-FALLBACK.md` "not built" preambles; `SOURCE-ACCESS.md`'s IDLE fallback; `CAPTURE-FIDELITY.md`'s ~40 cap (400).**
milestone: M2 — stale self-description, D-106's class (the retrofits' front matter is honest; the bodies beneath still say the old thing)
interface: none
depends-on: none (CAP-6, REC-80, FW-16, COFF-8, UI-58 landed the front matter that names each sentence)
scope: Correct each named sentence in place with the dated reason, in the framework's vocabulary, so the body agrees with its own front matter; remove the corresponding Incomplete bullet ONLY where the section is thereby complete (a section still describing an unbuilt mechanism stays marked). `--write` after any heading move; bump each file's Status `as of`. Prose only, docs only.
accepts-when: every sentence named in scope reads true against the tree at 0.58.0 with its dated correction; corpuscheck 0 fail over the governed set; `node tools/gates.mjs` green (class DOCS); plancheck 0 fail.
NEGATIVE CONTROL: (on spawning) one corrected sentence deliberately reverted → the worker's own before/after check names it; corpuscheck's date arm fires if a body edit leaves a file's `as of` behind — driven once.
added: 2026-09-14 · CONDUCT #10 (a worker report's owed act converted to a row in the same integration turn — the 2026-09-14 sweep rule)

### M0-28 · done — landed `bdfcb86` + `eea5260`, merged at `911e0ae` by CONDUCT #11. **Prior state, kept as the record: queued — **corpuscheck refuses a Status carrying more than one `as of YYYY-MM-DD` — SK-6's delegation, decided YES by CONDUCT: the checker exec's the FIRST date, so a document whose Status carries an earlier `as of` in its prose is judged on a date no editor would think to bump; latent today (three benign doubles with equal dates), live the next time one of them is edited.**
milestone: M0 (background lane, holds no slot) — the design corpus standard's instrument
interface: none
depends-on: none (SK-6 landed the measurement: `UI-PLAN.md`, `UI-KICKOFF.md`, `NOTIFICATIONS.md` carry two equal `as of` dates)
scope: one arm in `tools/corpuscheck.mjs`'s `checkFile`: a Status with more than one `as of YYYY-MM-DD` FAILS naming the file and both dates (the rule: one date, the latest, at the end of the Status — write it into `CORPUS-STANDARD.md` §3's grammar in the same commit); bring the three doubles to one date each; a suite arm in `bio-plane/test/corpuscheck.test.mjs` driving it. Nothing else in the checker moves.
accepts-when: `node tools/corpuscheck.mjs` 0 fail over the whole governed set with the three documents corrected; the new suite arm green; `node tools/gates.mjs` green (class FULL — a tool and a suite move: battery own-baseline, strict unpiped, UI harness from root, plancheck --local).
NEGATIVE CONTROL: run and recorded — a Status given a second earlier `as of` FAILS naming the file and both dates; over-strictness: a Status whose prose mentions a date in any OTHER form ("2026-08-01" without `as of`) still passes; the arm's own arm: remove the check → the suite arm FAILS.
added: 2026-09-14 · CONDUCT #10 (SK-6's DELEGATION routed into the queue at integration and decided — mechanism, not doctrine)
landed: `bdfcb86` + `eea5260`, merged at `911e0ae`. **The arm is one, in `checkFile`: a Status with more than one `as of YYYY-MM-DD` FAILS naming the file, every date in order, which one is judged, and `CORPUS-STANDARD.md` §3 — whose grammar now says the date appears EXACTLY ONCE, is the LATEST, and sits at the END of the Status; any other date form ("measured 2026-08-01") is not an `as of` and is untouched.** The three doubles brought to one date each on their Status lines only (`UI-PLAN.md`, `UI-KICKOFF.md`, `NOTIFICATIONS.md` — the earlier date re-spelled as "measured 2026-09-14"; M0-27 is live in the same files' bodies). `corpuscheck.test.mjs` +11 assertions (a seventh section, entry (5) in its NEGATIVE CONTROL block) including the class swept over the real corpus: all 44 governed Statuses at exactly one `as of`, floored and printed. The driver `bio-plane/test/nc-m028.mjs` at the estate's `nc-*.mjs` shape, re-runnable in one step. Measured on the branch: corpuscheck 44/0; battery 189/189 · 11,640 against a pristine 6a093bf baseline of 189/189 · 11,629 — +11, all in `corpuscheck.test.mjs` (38 → 49), every other suite byte-identical; `--strict` exit 0 with `REGISTER_FLOOR.arms` 974 → 975 from the print, one key set. Five NC arms plus baseline, all as declared first run, restores by sha256 + `cmp` + floored byte count. **THE FINDING THE BRIEF DID NOT PREDICT, the defect rendered live:** in arms A1/A2 corpuscheck reported TWO failures — the new arm AND the existing staleness arm firing on the EARLIER date ("Status says `as of 2026-08-01` but the file last changed 2026-09-14"), which is exactly SK-6's trap: the moment two dates differ the document is judged on the one nobody maintains. No act owed to any future actor; the SK-6 delegation is answered.

### M0-29 · running — spawned 2026-09-14 by CONDUCT #11, Opus 5, worktree-isolated, background lane (holds no slot). Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the four drivers; if none does, this row reads `queued`. **Prior state, kept as the record: queued — **D-343's three real tally decays fixed where they live — `caseflip.control.mjs` (5+b declared, 7 measured), `caselifecycle.control.mjs` (5+b/8), `fleetbundles.control.mjs` (6+b/13) — plus `harness.control.mjs`'s 10 vs 19, and the four unverified candidates verified or struck; the driver-estate batch found them and left them because they sat in other claims.**
milestone: M0 (background lane, holds no slot)
interface: none — control drivers only
design: `docs/development/VERIFICATION.md` §"A THROWING CONTROL DRIVER VALIDATES EVERY ANCHOR BEFORE IT ARMS ANYTHING (D-331, 2026-09-14)" — its D-333 paragraph, *"a driver's DECLARED arm count is held against its run"*, is the rule these four drivers break. A PROCESS document, ungoverned by `CORPUS-STANDARD.md` §6, and the law the M0 test estate builds from; D-343 is the LEDGER row that measured the instances, not the design.
depends-on: none (D-329+D-331+D-333 landed the census that reads declared-vs-measured tallies; D-343 is the authority)
scope: for each named driver, reconcile the declared tally to what the driver actually announces when run whole — by correcting the declaration where the arms are real, or by restoring an arm the declaration promised and the driver lost (say which, per driver, with the commit that moved it); the four unverified candidates on D-343's row are each run and either confirmed (and fixed) or struck with the reason; D-333's decay mode (c) — an arm whose SUBJECT stopped existing — is measured once across the estate and, if instances exist, filed as its own row rather than folded in. Every driver touched is run whole before and after; the census (`bio-plane/test/m025-arm-anchor-witness.test.mjs` and `scripts/armdecay.mjs`) reads 0 tally findings on the named drivers after.
accepts-when: the census's declared-vs-measured comparison reports 0 findings on the named drivers, driven; each driver's own run whole is green with its announcement count equal to its declaration; battery green own-baseline (~187/187 · ~11,338 with all three member installs); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; UI harness from the repo root; plancheck 0 fail; D-343's disposition updated with the commit.
NEGATIVE CONTROL: run and recorded — one reconciled declaration deliberately decayed by one → the census names it; over-strictness: a driver whose declaration and run already agree is untouched and reads 0 findings before and after.
added: 2026-09-14 · CONDUCT #10 (the driver-estate batch's report converted to a row in the same integration turn — the decays were found by the instrument it built and left for the claims that own them)

### M0-30 · done
milestone: M0 (background lane, holds no slot) — design authority: `docs/architecture/CORPUS-STANDARD.md` §4.7 (a row names the design it builds from) and `kickoffs/CONDUCT.md` "A ROW NAMES THE DESIGN IT BUILDS FROM"
interface: none — a planning-surface check
depends-on: none (Bob's 2026-09-14 rule is landed at `8e7e247`; the standard's §4.7 is the specification)
scope: (1) the ARM in `tools/plancheck.mjs`: for every `### <ID> · queued` or `· running` row in `QUEUE.md`, the row's heading, `milestone:`, `interface:` or `scope:` line must name at least one GOVERNED design document (a `docs/architecture/*.md` path, or a path in `CORPUS-STANDARD.md` §5's governed table — read the table, never a hand list) or an `IC-<n>` token; a row naming neither FAILS by id with the sentence §4.7 rules; `done`/`blocked`/`superseded` rows are not judged (history is not re-briefed). (2) the SWEEP: every currently open row is brought to the rule — a `design:` pointer added where the authority exists, or the gap ROUTED to BOB as a missing design (a DELEGATION in CLAIMS.md naming the row), never a pointer invented to pass the arm; M0 test-estate rows whose authority is `VERIFICATION.md` (a process document, ungoverned by §6) point at that file and the arm accepts `docs/development/VERIFICATION.md` as the test estate's authority explicitly, with the reason at the site. (3) a suite arm in `bio-plane/test/planning-hygiene.test.mjs` (or the plancheck suite that drives its arms) with the negative control.
accepts-when: `node tools/plancheck.mjs` 0 fail on the swept queue; a planted open row with no pointer FAILS by id, driven; `node tools/gates.mjs` green (class FULL — a tool and a suite move: battery own-baseline ~187/187 · ~11,410 with all three member installs, `coverage.mjs --strict` directly with `$?` unpiped, UI harness from the repo root, plancheck --local); every routed gap is a DELEGATION with the row named.
NEGATIVE CONTROL: run and recorded — (1) an open row with its pointer removed → plancheck FAILS naming the row; (2) over-strictness: a `done` row with no pointer passes; a row naming an IC only passes; (3) the arm's own arm: remove the check → the suite arm FAILS.
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 "a row names the design it builds from" inbox entry — the one act, as an item; sequenced at once because the rule is in the loop now and a rule with no gate is the class this record refuses)
landed: `a8507d1` + `cd1053b`, merged on `main`. **The arm lives in `tools/rowdesign.mjs` (a module, so the suite drives the same predicate plancheck runs — the mintid/mergecarry precedent) and `plancheck.mjs` §7 imports it: an open row's heading, `milestone:`, `interface:`, `design:` or `scope:` line must name a governed document (via `corpuscheck`'s own `governed()` — full path, or a basename unique in the set; `README.md` refused as ambiguous), an `IC-<n>`, `VERIFICATION.md` for an M0 row only, or an explicit routed gap that names CLAIMS.md. A row ends at the next `###` OR the next `##` — measured, not assumed: without the `##` bound SK-5 absorbed the whole DIST section. THE SWEEP: 7 of 19 open rows failed, 7 pointers added with the section read first (M0-29, REC-87, VF-7, CAP-7, CAP-8, SK-5, UI-59), ZERO gaps routed — every failing row had a real authority; the routed-gap path is built and driven but unexercised on today's queue, stated.** Gates on the branch: battery 187/187 · 11,432 vs pristine 187/187 · 11,410 (+22, all `planning-hygiene`); strict exit 0, floor from its print; UI harness 0; plancheck --local 0/0. NCs 25/25 first run, five arms plus baseline, restores by sha256 AND cmp AND a floored byte count; A3 runs plancheck and reads its report rather than grepping (a grep is satisfied by a comment). **Three instrument findings, recorded: the driver's first cleanup DELETED the pen directory with the session's baseline worktree inside it on a clean run (the `git checkout --` class — it now removes only what it wrote); the control register counted 3 arms in a declaration stating 5 (two outcomes in prose, three in arrow grammar — re-spelled); the item's own driver reddened `m025-arm-anchor-witness` because its corpus reached neither `tools/` nor `docs/architecture/` — widened on that file's own precedent, re-spelling the anchors to dodge the extractor refused.** Owed acts enacted at this integration: `CORPUS-STANDARD.md` §4's list was written 1,2,3,4,5,7,6 so renderers showed the row-design rule as §4.6 and the citation rule as §4.7 — the two blocks SWAPPED here so source order matches the labels (the standard's own numbering, mechanism); UI-59's scope path corrected (`docs/development/CIVICOS_UI_STATE.md`). What the arm cannot see, stated: whether a pointer is TRUE or an IC exists.

### D-301 · done
milestone: M0 (background lane, holds no slot)
interface: none — test estate; it changes no plane behaviour
depends-on: D-265 and D-302 (both landed — `strip` and the census's current corpus figures are the ground)
scope: **`DEBT.md`'s D-301 row is the authority.** The class census in `hygiene.test.mjs` is comment-blind but NOT string-blind, so a discovery primitive inside a fixture template literal counts as a WALK — `walkfigure.test.mjs` was enumerated as a new unguarded walk on its first run while containing no walk at all, and every suite that builds a walking fixture (the natural way to test a walk detector) must be allowlisted for a walk it does not perform. Run the census's matcher over `strip(src)` (`walkfloor.mjs` already exports the estate's ONE lexer, which blanks string and template literals) — never a second lexer — then **RE-MEASURE the census count, the REACH floor and `CLASS_NAMED_UNGUARDED`'s membership from printed output**: files whose only match was in a string drop off, and that is a measurement, not an edit. Every moved figure carries its reason.
accepts-when: the census scores a walking FIXTURE clean while still scoring a real walk as a walk, both DRIVEN; the re-measured corpus, floor and allowlist membership committed from PRINTED figures with each drop named; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) the arm this item exists for: a REAL discovery primitive in live code must still be enumerated after the string-blinding — a matcher blinded too far is the over-strictness twin; (2) a walking fixture in a template literal must NOT be enumerated, driven with a fixture you did not take from the existing allowlist; (3) neuter the census over `strip(src)` and its reach must fail as a DELTA with the corpus printed (D-265's arm, re-proven on the moved matcher).
added: 2026-09-10 · CONDUCT (D-265's residual, enqueued when the background lane freed — a residual row with no queue item reaches no worker)
landed: `afd5de1`, merged on `main` at `990181a`. **The census now reads through `stripToCode` — the estate's ONE lexer, consumed not forked — and its local comment-stripper is DELETED: a second reader of the same question is how two answers were allowed to differ.** Census 34 → 32 files, both drops NAMED: `walkfigure.test.mjs` (the known instance — its allowlist removal FORCED by the census's own goneFromList arm, not chosen) and **`walkfloor.test.mjs`, which the brief did not predict: 14 raw sites, ZERO code, hidden on the OTHER side of the ledger** — it graded GUARDED via an unrelated import, so no ratchet would ever have asked about it; the count overstated the class by two, not one. REACH floor 15 → 32 exact (it sat 19 LOW — a reader-changing item could have halved the corpus with that arm green). **The over-strictness twin the brief also did not predict: `${…}` interpolations are CODE THAT RUNS, and two live files walk that way** — a plain string-blinding would have gone blind on both with every membership figure still reading correct; `strip` gained `keepInterpolations` (default OFF) and an arm asks the question. NCs 6/6 as declared FIRST RUN, including a `before` arm proving the prior state (census 35 with both files back). **The sharpest finding was in the OTHER driver: `walkfloor.control.mjs`'s stripper arm anchored on `strip`'s SIGNATURE, which this item extended — the patch matched zero times, the arm neutered NOTHING, and both suites read green; only the driver's own zero-match check surfaced it.** Re-anchored on the body, 11/11, claim amended. Merged-tree gates: battery 173/173 · **10,760 (+5, walkfloor's five new arms — closes exactly)**; `--strict` exit 0 unpiped, floor **906/167/168** by print; UI harness exit 0; `mintid --audit` 0 breaks. Fifth D-303 sighting read correctly off the closed row. Deliberately not done, stated: the `guarded` import-spelling predicate (D-302 settled the cross-file version; this file's own copy is flagged, not moved) and eval'd-string walks (CANNOT-SEE, the exposure is the sandbox's).

### M0-24 · done
milestone: M0 (background lane, holds no slot)
interface: none — test estate; it changes no plane behaviour
depends-on: none — M0-23's census (arm C of `civicos-ui/check-mock-envelope.mjs`) is landed and is the instrument that measured this
scope: **M0-23's census delegation, the fixable half: `civicos-ui/test/auth-surface.test.mjs`'s `publishedmanifest` fixture cannot represent the record's own published shape.** Measured by the census: its `published[]` is 7/9 (missing `strength`, `required`); it carries NO `cases[]` and NO `caseMembers[]` at all, so it cannot represent a loose ratified finding that HAS a pair — exactly the state REC-49 corrected `pubList` to render; and it answers `manifest`/`manifest_sha`, keys the plane's `published` SELECT does not carry — a fixture asserting a shape the wire never had. Correct the fixture to the wire shape and delete the phantom keys, with any assertion that read them CORRECTED at its site, never exempted. **Leave `cases[]` at 6/9 everywhere** — the census measured zero readers of the three missing columns, and a fence tighter than its rule is the over-strictness this estate keeps refusing.
accepts-when: the census's arm C reports `auth-surface`'s `published[]` at the wire shape and its phantom keys GONE; a loose ratified finding WITH a pair representable in the fixture and asserted; `node civicos-ui/test/run.mjs` from the repo root, exit UNPIPED, 0; `cd bio-plane && npm run test:battery` green — measure your own baseline.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) restore one phantom key and something must FAIL naming it; (2) over-strictness — a fixture legitimately narrower than the wire with zero measured readers (the `cases[]` 6/9 state) must stay NAMED, never failed.
added: 2026-09-10 · CONDUCT (M0-23's delegation at integration — a delegation is a notice, and a notice is not an item)
landed: `d931814`, merged on `main` at `db1df93`. `published[]` 7/9 → 9/9, the phantom `manifest`/`manifest_sha` keys GONE (fixture-only, which is precisely why nothing could ever fail on them), `caseMembers[]` absent → 6/6, `cases[]` added at 6/9 and NAMED — across the whole package the census now reports ZERO rows wider than the wire and ZERO fields absent from a fixture. `auth-surface` 74 → 94 assertions; battery 173/173 · 10,753 on the merged tree, delta ZERO (the predicted shape); UI harness exit 0; `--strict` exit 0 unpiped; `mintid --audit` 0 breaks. **THE CONTROL CAUGHT THE ITEM'S OWN NEW ASSERTION BEING THE DEFECT THE ITEM EXISTS TO REFUSE**: the first draft pinned `cases[]`'s three columns ABSENT, so the honest widening (the day a surface renders the bar) would have gone red against a suite claiming to defend against over-strictness — found by ARMING the control, never by reading the code; corrected to assert what `pubList` demonstrably reads, free in both directions. The empty-record arm corrected with its dated reason (it emptied one array of three and would have gone red for a fixture that got MORE faithful). The worker reproduced **D-303's −6 exactly** (10,663 vs main's 10,669 at its base) — third independent sighting, recorded on that row's subject. **A BOUND ON THE CENSUS, delegated and carried here so nobody over-reads the instrument: its headline says 37 ops resolved but only ONE builds a row array from a readable SELECT — the census's real corpus is `publishedmanifest`'s four arrays, and whether the other 36 are un-SELECTable by construction or merely unreadable by that reader is UNDETERMINED.** "Class closed in reach" means closed THERE.

### D-302 · done
milestone: M0 (background lane, holds no slot)
interface: none — instrument estate; it changes no plane behaviour
depends-on: D-265 (landed — the chokepoint and buckets it builds on)
scope: **`DEBT.md`'s D-302 row is the authority, both clauses.** (1) `test/op-claims.test.mjs`'s fifth walk-derived floor, `result.attributions.length >= 4`, is STILL over the working tree — `sweep()` publishes no `attributionsRepro`, so an uncommitted arrival can only push the floor UP, D-238's payload exactly. Compute `attributionsRepro` beside the other four in `sweep()` and move the floor onto it FROM A PRINTED FIGURE. (2) `scripts/walkfloor.mjs` decides `guarded` by a regex for an import of `provenance.mjs` — a predicate that answers about the WRONG FILE: the suite grades UNGUARDED even where its floors genuinely are guarded, and the walking script grades GUARDED while saying nothing about the ratchets one import away. Decide `guarded` from the classification the walk now carries (D-265's `reproducible` bucket), not from an import spelling.
accepts-when: the fifth floor reads a reproducible figure and the working-tree unwrap at that site is GONE (the chokepoint passage removed, hygiene's passage ratchet re-measured); `walkfloor`'s GUARDED/NAMED column derived from the value classification, with the re-measured census committed from PRINTED figures; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) the arm this item exists for: an uncommitted (working-tree-only) attribution arrival must NOT move the floor's corpus, driven, where before this item it could; (2) point the `guarded` predicate back at the import spelling and something must FAIL naming a file it misgrades; (3) over-strictness — a walk that legitimately publishes only working-tree figures (a report, not a floor) must stay legal and NAMED, never failed.
added: 2026-09-10 · CONDUCT (D-265's residual, enqueued as an ITEM at integration — a residual row with no queue item reaches no worker)
landed: `2807c9d`, merged on `main` at `7a16642`. **BOTH CLAUSES.** (1) `sweep()` publishes `attributionsRepro` (the HEAD-restricted pair, resolution lifted into ONE helper so the two populations cannot drift); the floor reads the exact printed 5 — exactness ARGUED at the site: this population is five hand-written sentences, LEDGER's own argument for exact counts — and the `.overWorkingTree()` passage at that site is GONE (chokepoint 18→17). (2) `walkfloor` grades from the bucket the VALUE was declared into (`bucketsOf`/`gradeOf`, exported and driven); everything unresolvable reads UNCLASSIFIED with the reason, so the unsafe direction is unreachable by silence. **THE OLD PREDICATE WAS NOT IMPRECISE — IT WAS INVERTED, NOW AN ASSERTION: the one file whose floors are genuinely guarded does NOT import `provenance.mjs`, and both files that do import it floor on working-tree figures. It agreed with the truth on one file of four, by luck.** NCs 11 arms all as declared; the phantom arm proves its own before (an uncommitted routing claim moves the working-tree figure to `5 of 6` while the reproducible figure holds); two instrument errors recorded, the sharper being the control that spelled its `op=` fixture in a COMMITTED file — putting a real routing claim into the corpus the arm exists to prove immovable. Wider than briefed and AMENDED into the claim with reasons (the grade change forces the census arms to move or the ratchet reds on a correct estate); the cry-wolf half of the flow's scoping was narrowed only where the grade would otherwise PRINT a claim the record cannot support; **the quiet half is D-304, a row with its bound stated** (the runtime brand has no scoping problem at all). Merged-tree gates: battery **172/172 · 10,680 — closes exactly: 10,669 + the attributed +11** (walkfloor 31→39, hygiene +2, planning-hygiene +1); `--strict` exit 0 unpiped, **REGISTER_FLOOR collapsed a THIRD time in one day and re-read from the merged print: 895/166/167**; UI harness exit 0; `mintid --audit` 0 breaks. The worker independently reproduced **D-303's −6** at two bases with its files held out — corroboration, recorded on that row's subject rather than re-derived.

### M0-23 · done
milestone: M0 (background lane, holds no slot)
interface: none — test estate; it changes no plane behaviour
depends-on: none
scope: **UI-56's delegation: `civicos-ui/test/preauth-vocabulary.test.mjs` (~782) carries the same stale `caseMembers` fixture shape UI-56 corrected in `publishedcase.test.mjs`** — no `version_sha`, no `role`, two of the six columns the plane actually selects on `publishedManifest().caseMembers[]`. Its member is undiverged and single, so it renders identically under the fix and the harness is green — **a mock-shape gap of D-173's class, not a live defect**: a suite whose fixture cannot represent the wire shape cannot assert against it, and the gap is invisible until the day it matters. Correct the fixture to the wire shape; then ask the CLASS question rather than closing the instance — whether any other UI suite's `publishedmanifest` fixture drops columns the plane selects, with the census reach stated as a figure.
accepts-when: the fixture carries the wire shape (`version_sha`, `role` included); the suite still green with a DIVERGED member representable in it; the fixture-shape census across `civicos-ui/test/**` reported as a FIGURE with what it cannot see stated; `node civicos-ui/test/run.mjs` from the repo root, exit UNPIPED, 0.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) drop `version_sha` from the corrected fixture and something must FAIL naming it, else the correction is decoration; (2) over-strictness — a fixture legitimately narrower than the wire (a suite exercising a surface that never reads the dropped column) must be NAMED, never failed.
added: 2026-09-10 · CONDUCT (UI-56's delegation at integration, enqueued as an ITEM — a delegation in a report is a notice, and a notice is not an item)
landed: `47c3a9a`, merged on `main`. **THE FIXTURE CORRECTION WAS A NON-EVENT, MEASURED (68/68 green, report character-identical) — AND THEN THE ITEM'S OWN NEGATIVE CONTROL CAME BACK GREEN, WHICH IS THE REAL FINDING:** with the fixture corrected AND a diverged member added, deleting `version_sha` again ran green — the index RENDERED the defect (report 42,718→43,366 chars) and no assertion READ it, so by the item's own criterion the correction was decoration. Closed with two assertions in the `public-record` REACH block, because the published index is a PRE-AUTHENTICATION surface and the old join told a stranger three false things there. **The census landed as arm C of `check-mock-envelope.mjs` and NOTHING IN IT IS A LIST OF COLUMNS**: the op resolves to its store method through the DO's own dispatch table and columns are read out of that method's SELECTs — the invert-don't-list rule applied to the instrument itself. Figure: 108 suite/op answers across 44 ops; 37 resolved to a store method (7 not resolved, NAMED); 10 array fields judged over 70 fixture rows; **3 NARROWER THAN THE WIRE**; `caseMembers[]` now 6/6 in both suites that answer it — the reported class closed in reach, blind spots printed every run. Battery 171/171 · 10,537 on the merged tree, delta ZERO measured (35 plane suites read `civicos-ui/`, so "touches no plane file" proves nothing and was not argued). NCs 4/4 with a baseline row; the (t) arm's FIRST run, before the new assertions existed, came back GREEN and is recorded rather than smoothed; the instrument was wrong three times on its first run and each correction is at its site. **A baseline arm that DID NOT ARM said so** — `git checkout --` restores the INDEX, which after committing was the item's own bytes; the ref had to be named. Census findings outside the claim are DELEGATED in CLAIMS.md and the fixable one is **M0-24** below. **One UNDETERMINED, stated: the worker's environment reads the battery total SIX LOW on identical tracked content** (10,531 vs 10,537, reproduced at two bases with its files held out) — raised as **D-303** rather than absorbed, so nobody reads an honest 10,531 as a loss of six.

### M0-22 · done
milestone: M0 (background lane, holds no slot)
interface: none — assertion estate; it changes no plane behaviour
depends-on: none
scope: **`bio-plane/test/action-loop.test.mjs` PINS A CLOCK AT `const DUE = "2026-09-10"` AND THE CALENDAR ROLLED PAST IT.** The suite reads **73 pass / 6 FAIL** on an untouched `main`, reproducing standalone, with C-11.1 reporting the fixture silently past-due. **THIS IS THE MOST INTERESTING FAILURE THIS ESTATE HAS PRODUCED, AND THE REASON IS NOT THE BUG:** CONDUCT measured and published `168/168 · 10,351` earlier the same day, and FL-9's worker measured `167/168` hours later on the same tree. **BOTH ARE HONEST MEASUREMENTS OF THE SAME TREE. The calendar falsified the earlier one, and no re-measurement discipline catches that** — "measure your own baseline and trust it over the brief" is this project's standing defence and it points the WRONG WAY here, exactly as the missing-`node_modules` trap does, because a stale figure produced by TIME looks identical to a figure produced by a change. **Decide the shape and write the reasoning at the site — do not just move the date**, which buys silence until the next roll-past. The two candidates the estate already contains: a fixture date computed RELATIVE to now, or a clock pinned by the harness so the fixture's "now" is the fixture's own. **One of them makes this class unrepresentable and the other defers it; say which you chose and why.** **SWEEP FOR THE CLASS, do not fix the one suite:** any other fixture carrying a hard-coded date that the clock can overtake is the same defect waiting, and the census's reach must be stated as a figure rather than asserted complete.
accepts-when: `node bio-plane/test/action-loop.test.mjs` green; **the suite still green when the system clock is moved forward by a year**, driven rather than argued; the census of date-pinned fixtures reported as a FIGURE with its reach; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) **the arm this item exists for**: run the suite with the clock advanced a year and it must stay GREEN — a fix that only moves the date passes today and fails that arm, which is the whole point; (2) an over-strictness arm — a fixture that is genuinely past-due BY DESIGN must still assert past-due, since the C-11.1 behaviour being exercised is real and must not be neutered to make the clock problem go away.
added: 2026-09-10 · CONDUCT (FL-9's delegation, enqueued as an ITEM — and spawned rather than handed over, because a RED `main` at a session boundary is a baseline the next session cannot tell from its own damage)
landed: `87e0146`, merged on `main`. **`main` IS GREEN AGAIN: 170/170 · 10,475.** **THE CLOCK IS PINNED AT THE HARNESS, NOT THE DATE MOVED — and the seam was already there saying it existed for this:** `bio-checks.mjs` consults `ctx.nowMs ?? Date.now()` at five sites and `store.mjs`'s own comment says *a suite that pins BIO_NOW_MS pins the cached flag too.* **The suite already BELIEVED it was clock-injected: it injected the as-of READ and left the CATALOG and the WRITE on the wall clock.** Three lines. **THE CLASS IS NOW UNREPRESENTABLE HERE RATHER THAN DEFERRED** — after the pin the suite reads no wall clock at all, so there is no quantity left for the calendar to move — **and it caught a SECOND latent instance in the same file**: RFC3's `2026-12-01` window would have failed identically on 2026-12-02, so a per-date fix would have fixed one of two. **THE REJECTED FIX WAS MEASURED RATHER THAN DISMISSED, and the figure is the argument: "move the date" reads 79/0 TODAY and 73 pass / 6 FAIL AT +1 YEAR — `main`'s exact signature reproduced — and `2026-09-19` is the LAST date that is green today, because `DUE` must exceed the wall AND stay under `AFTER_MS` or section 5's before/after instrument stops meaning anything. THE DATE-MOVE FIX HAS A VIABLE WINDOW OF NINE DAYS.** Relative dates were rejected on a second ground: the assertion must re-derive the same date by the same formula, which is the expectation-derived-from-the-subject defect. Clock-advanced arm DRIVEN at **+1y, +5y and +20y — 82/0** — with the preload's inheritance PROVED BY PROBE (child 2027, parent 2026) rather than assumed. **CENSUS 215 SUITES — 168 battery plus the 47 `civicos-ui` harness suites the battery NEVER RUNS — zero further instances, STATED AS A FLOOR AND NOT A CLEARANCE**: four suites that fail under any shift were cleared BY MEASUREMENT (they fail identically at +1 HOUR, which cannot overtake a date), and the instrument does not reach workerd and **sees FAILURES, not FINDINGS** — a `.some()`-shaped assertion absorbs a new finding silently. Residue recorded as **D-300** with its limits. NCs 8/8, each armed ALONE, re-runnable in one step. **The over-strictness arm is the sharp one: pinning SILENCES A LIVE PRODUCTION FINDING** (`op=audit` calls `checkBundle` with no `nowMs`), so without the new section 5a *"the suite is green"* and *"the check was deleted"* read the same — 5a asserts it in both directions at independently chosen literals, including that an identical CLOSED date marked `overdue` draws nothing, **because the finding is about SILENCE, not about being late.** **THE ARITHMETIC CLOSES EXACTLY: 10,345 + 6 = 10,351, CONDUCT's morning figure** — so the calendar accounts for the entire delta and nothing else moved. **The worker reported that this row did not exist; it was RIGHT ABOUT WHAT IT COULD SEE** — it branched at `0fb2dcb`, before CONDUCT pushed the row — which is the same visibility class as the IC-64 collision: each party correct about the corpus it could read.

### D-280 · done
milestone: M9
interface: possibly I3 — `op=strengthbarof`'s answer changes for a withdrawn citer; if the published shape moves, file the IC
depends-on: none — D-267 landed (merge above) and its `#refEdgeSevered` predicate is the thing to reuse
scope: **`DEBT.md`'s D-280 row is the authority and it is on `main`; do not re-derive its corpus.** It printed the census (15 reverse-edge reads over `refs`/`inquiry_basis`, 6 confirming, 9 not) and named each of the six by method with its reach. **The strongest is `#requiredStrengthFor` and it is DRIVEN**: a project whose only citing relation is `status: severed` still answers `declared: true` and sets the publication bar on a document it left. **Take the DRIVEN one first** — it is the live harm and the others are graded by reach beneath it. **`#leadBasisAbsence` is named UNDETERMINED in the row rather than scored, and it must stay a judgement you ARGUE, not one you inherit.** Reuse D-267's ONE severance predicate; a second implementation is the shape that has already absorbed a control here. **Severance narrows only on a positive recorded withdrawal** — unreadable is live, unrecorded is live, an unrecognised `status:` spelling is live — because a fence tighter than its rule drops homes nobody gave up.
accepts-when: the driven site refuses to count a severed citer, driven THROUGH `op=strengthbarof` and not asserted at the store; each remaining site of the six either fixed or NAMED with the reason it is not; `cd bio-plane && npm run test:battery` green — **measure your own baseline and trust it over this row**, any delta attributed per suite by RE-RUNNING the true baseline; `node scripts/coverage.mjs --strict` run DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` exit read unpiped from the repo root.
NEGATIVE CONTROL: run and recorded, each arm armed ALONE, restores verified by sha256 AND content, the harness INSIDE your own worktree — (1) revert the confirmation at the driven site and the bar arm must fail naming it; (2) **an OVER-STRICTNESS arm that is the point of this item**: a citing project with NO recorded status, and one with a `status:` spelling you did not anticipate, must both still read as LIVE homes; (3) neuter the corpus walk you use and its reach must fail as a DELTA with the corpus size PRINTED.
added: 2026-08-10 · CONDUCT (D-267's sweep residue, routed at D-267's integration rather than left in the debt file)
landed: `367c1b1`, merged on `main`. **SUPERSEDED THE SAME DAY BY DEC-72, AND THE WORK IS MOOT RATHER THAN WRONG — stated here rather than left for a reader to collide with.** `CASE-AS-PRODUCTION.md`'s supersession table: *"D-280's severed-citer fix — moot rather than wrong: the code it fixed is removed with the composition."* Bars never attach to findings under DEC-72, so a severed citer's bar cannot linger and `#requiredStrengthFor`'s strictest-across-citers composition goes with **CASE-2**. **The item was correct for the model that existed when it ran and its negative controls remain the record of what that model did** — in particular that a project which had WITHDRAWN was TIGHTENING a bar on a document it had left, which is part of why the model changed. **DEC-71, which CONDUCT raised off this item, is CLOSED AS SUPERSEDED: the question dissolves.** Do not re-derive this row's corpus against the new model; read the design doc. The original report follows. **THREE OF THE SIX SITES FIXED, THREE NAMED WITH THEIR REASONS — which is what the row demanded instead of a silent partial fix.** FIXED: (a) `#requiredStrengthFor`, the driven one — a citing project now counts only while at least ONE of its reference edges to the target is live, driven THROUGH `op=strengthbarof` and not asserted at the store. **The sharpest figure: a document cited LIVE at B/B and SEVERED at A/A answered A/A and now answers B/B — a project that had WITHDRAWN was TIGHTENING a bar on a document it had left.** A document whose only citer withdrew moves from `declared: true, source: "project"` to `declared: false, source: "none"`, printing the standing *an absent bar is not a bar of zero* sentence, and the withdrawn id appears NOWHERE in the answer (REC-30's leak shape, asserted). (b) `#routeTask` — the row's UN-DRIVEN site is now driven and its obstacle CLEARED rather than restated. (d) `restingOn` publishes the status rather than filtering on it (`backlinks`' posture, deliberately not `#restsOnLive`'s), additive, nothing dropped. NAMED, each pinned so a later session must move a test: (c) `reevaluations` — the doctrine question is RAISED not taken (**DEC-70** — and the route to that number is worth one sentence, because the first correction of it was ALSO wrong. This row originally read `DEC-69` as a GUESS written before the id was minted; `mintid` derives its floor by reading ids MENTIONED IN PROSE, so the guess became the floor and the real allocation returned **70**. CONDUCT then recorded DEC-69 as a burned gap — **and that was false within the hour: session BOB allocated DEC-69 for Bob's own ruling on respecting members.** So the speculative reference did not merely name an entry nobody had written, it briefly named SOMEONE ELSE'S. **Do not write an id you have not minted** — the ledger is the allocator and prose is an input to it, which makes a guess a write.); (e) `#leadBasisAbsence` — argued rather than inherited: **a document made part of a case and then withdrawn WAS made part of a case, and reading a severed-only leg as `absent` would print "LOOKED FOR AND NOT THERE" about a document that was there**; (f) `#writeSupersededBy`/`#actionDerived` — no op writes a `supersedes`/`responds_to` reference carrying a status, so the exposure stays UNMEASURED rather than present. **Deliberately not done and stated rather than skipped:** the missing `kind` filter — `refs` has a second writer (the link projector inserts `links_to` rows with no frontmatter behind them), so narrowing by relation would drop bars the record currently honours. Battery 162/162 · 10,053 on its branch, delta +32 attributed by DIFFING TWO FULL RUNS and confirmed by grepping hygiene's own output rather than inferred; `--strict` exit 0 unpiped, OPS 163/163 and CHECKS 228/228 unchanged. NCs 6 arms, 0 not-as-declared, 0 restore failures, each armed ALONE with sha256 + content + `cmp` twice. **The over-strictness pair is the load-bearing result: the ANY-severed-edge arm is the ONLY one leaving D-267's suite wholly green, and its single failure is the over-strictness arm WITH THE HEADLINE STILL PASSING — which is the whole argument that over-strictness cannot be read off the headline.** Three declarations came back wrong on the first run and the arms were right; corrected in the driver's header rather than the paragraph rewritten. `severedhomes.test.mjs`'s caller pin `[1,3]` → `[1,6]`, CORRECTED never exempted, kept EXACT rather than relaxed to a floor because three arms proved it is a real tripwire. **IC-61 filed BEFORE any code**, measured: zero UI consumers. **CONDUCT's brief for this item was WRONG about one fact** — it said the queue row read `running`; it read `queued`, because CONDUCT marked five rows and not this one. The worker reported the discrepancy rather than editing `QUEUE.md`, which is right: CONDUCT is this file's only writer.

### D-282 · done
milestone: M0 (background lane, holds no slot)
interface: none — test estate; it changes no plane behaviour
depends-on: none
scope: **`DEBT.md`'s D-282 row is the authority.** The mechanism is measured and reproduced: `hygiene.test.mjs` ends `process.exit()`, and when stdout is a PIPE those writes are asynchronous, so `process.exit` returns to the OS unflushed. **191,434 bytes reached a FILE and 89,329 reached a PIPE in the same run — 102,105 bytes of TAIL discarded, and the tail is where the tally lives.** `scripts/battery.mjs:413` spawns EVERY suite with default stdio, which is a pipe. **`maxBuffer` was tested and killed as a hypothesis; do not re-run that experiment.** The amplifier is `t()`: D-237 caps the failure LABEL at 8 entries and then prints `want … got …` with the FULL array, so the cap defends nothing at the only moment it matters. **THE THRESHOLD AND THE HISTORICAL REACH ARE BOTH UNDETERMINED and the row says so — narrowing either is worth more than a tidy fix, and "unknown" stays stated if you cannot narrow it.**
accepts-when: a deliberately-flooding suite reports its TALLY through a pipe, asserted; the `got` dump capped the way its label already is, or suites flush before exiting, with the choice ARGUED; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) restore the unflushed exit and the flooding-suite arm must FAIL, which is the arm proving the fix is what carries the tally; (2) an OVER-STRICTNESS arm: a genuinely large but READABLE failure must not have its useful diagnosis truncated by your cap — a fix that makes every failure unreadable is the opposite defect; (3) D-93's original shape re-run and still green, so the two are independent rather than one thing measured twice.
added: 2026-08-10 · CONDUCT (D-249's control arm caught ITSELF; the arm was right while the harness was wrong)
landed: `a3a2116`/`f457b0d`, merged on `main`. **SUITES FLUSH BEFORE EXITING — the cap was REJECTED ON MEASUREMENT, and the argument is the item.** `bio-plane/test/stdio.mjs` (new) makes stdout/stderr synchronous before a suite writes anything, imported for side effect by all 153 suites and by `sandbox.mjs` (so the ~60 control/probe harnesses inherit it); `hygiene.test.mjs` gains a census that fails a 154th suite written without it. **Why not the cap, on four measured grounds:** it MOVES the threshold rather than removing it (tally still lost at ~1,563 capped failures, and at 3,125 and 6,250); it leaves a RACE (three identical runs at 1,024-byte writes: MISSING, MISSING, PRESENT); it defends ONE writer while `t()` is copy-pasted 152 times and says nothing about a stack trace; and **armed as a control it turns every loss-measuring arm GREEN while destroying the middle and tail of a readable 1,000,156-byte diagnosis — it is the fix that would have looked green.** Reader-side was rejected on a count: ~60 ad-hoc harnesses read child stdout, a new one per debt item, and **D-282 was found by a control arm and not by the battery**, so fixing readers leaves the discovery path open. **THE THRESHOLD IS BISECTED where the row called it undetermined:** a single write of 65,573 bytes survives and 65,580 does not, every partial arrival an exact multiple of **65,536** — but it is NOT one number (187,516 bytes in 470-byte writes survived; 2,000,000 in 1,024-byte writes did not) and **it is darwin-only** — node writes pipes synchronously on Linux/Windows, so a Linux CI could never have seen it. The suite runs an unfixed fixture as a reach arm and reports NOT EXHIBITED by name rather than passing quietly. Byte figures: unfixed 200,093 to a FILE / 131,099 through a PIPE with the tally MISSING; the fixture 1,000,156 / 65,587 unfixed (934,552 bytes of tail discarded), byte-identical both ways once fixed. Baseline 157/157 · 9,844 → **158/158 · 9,861**, delta +17 attributed by DIFFING THE RUNS (new suite 13, hygiene 607→611). NCs 4/4 as declared, 0 restore failures: `unflush` → 5 FAIL, and **`hygiene` STAYS GREEN, which is itself the finding — the census is a spelling check and cannot see a neutered module, so the behavioural suite is the load-bearing half**; `overstrict` → both vacuity guards fire; `d93` → a crashing suite reports `assertions unknown`, named in the summary, never zero and never green, with the suite after it still running. **Two of the four declarations came back NOT AS DECLARED on the first run, and both times the arm was right and the DECLARATION was wrong** — corrected and recorded rather than quietly rewritten. DELEGATION raised: `civicos-ui/test/**` has the same defect (every UI suite ends `process.exit(...)` and `run.mjs` pipes them) with the one-line fix and the measurement attached. The fix reaches node's private `_handle.setBlocking`, stated in the module header rather than hidden and pinned end to end, so the day node closes that door the battery goes RED instead of quiet.

### D-265 · done
milestone: M0 (background lane, holds no slot)
interface: none
depends-on: none
scope: **`DEBT.md`'s D-265 row is the authority.** `hygiene.test.mjs`'s walk census grades the file the walk is IN, so `scripts/op-claims.mjs` walked the whole repository and `test/op-claims.test.mjs` floored on four figures derived from that walk — and the census never enumerated the second at all, because it contains no `readdirSync(`. **Both instances are already GUARDED, so this row is about the DETECTOR and not a live exposure; a fix that only closes the instance closes nothing.** The row names two shapes and prefers the second: extend the census to a second question (does this file import an identifier from a walking module, and does a floor here derive from it), or **make the exported walks themselves carry the classification so a floor computed from an unguarded corpus is impossible to WRITE rather than merely detectable.** That is REC-70's inversion — *a list of spellings goes stale silently the moment a fourth is written* — and it is the reason to prefer it.
accepts-when: a file that floors on an imported walk is either GUARDED or NAMED, never silently graded harmless; **the census's REACH asserted as a DELTA with the corpus size PRINTED**; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) write a NEW file that imports a walk and floors on it, in a spelling you did not anticipate, and the census must either GUARD it or NAME it — never score it clean, which is the arm this item exists for; (2) neuter the census and its reach must fail as a DELTA with the corpus size printed; (3) an over-strictness arm — a file that merely imports a walking module without flooring on it must NOT be failed.
added: 2026-08-10 · CONDUCT (M0-18's residual, routed here rather than left sitting)
landed: `e3c2a1d`, merged on `main` at `33e0b5e`. **SHAPE (b), AND THE ARGUMENT IS A MEASUREMENT: the static detector reports 1 site for a floor bound directly from an imported walk and 0 sites AND 0 unclassified for the IDENTICAL floor held in an array first** — absent from its output entirely, not printed as UNKNOWN, which is D-265's arm exactly, live. `bio-plane/scripts/walkfigure.mjs` puts the classification ON THE VALUE: a working-tree figure refuses numeric coercion naming file and line (it still PRINTS — a report is not a floor); the escape is `.overWorkingTree(why)`, a CHOKEPOINT argued at the site, never a spelling list; `walkResult()` forces every published figure into one of four declared buckets and hygiene asserts TOTALITY over a DRIVEN result. Both halves kept, argued: a brand cannot judge a line that never runs; a detector cannot see a fourth spelling. Battery on the merged tree **171/171 · 10,537 — the arithmetic closes exactly: pre-merge main measured 10,488 and the worker's attributed +49 (walkfigure 32 new, hygiene +13, planning-hygiene +2, coverage-provenance +1, owed-controls +1) lands on 10,537**, with `op-claims` 35 and `walkfloor` 31 UNMOVED — the boundary change altered no existing assertion. `--strict` exit 0 unpiped, `REGISTER_FLOOR` 883/164/165 → 888/165/166 moved from PRINTED figures. NCs 5/5 with a baseline row, each armed ALONE, restores sha256 AND `cmp`: the newfloor arm's static half reads 0/0 while the runtime brand throws naming the probe's own line; neuter fails as a DELTA at "0 of 10" with the corpus printed. Two instrument errors recorded rather than smoothed (the baseline's first run was RED at 660/3 and all three failures were the item's own new ratchets, correct and now NAMED; the newfloor harness first unwrapped a safe-bucket array as branded). **A hand-kept list went stale ON SCHEDULE mid-item**: one added import took `coverage-provenance` to 9/19 and `owed-controls` to 29/11 — both suites' own headers name those exact figures as the staleness signature, and the delegation written in those headers was DISCHARGED: the copy list is now DERIVED from the instrument's own import graph (`test/instrument-deps.mjs`), the second copy GONE rather than corrected. Census reach: 379 modules · 21 walk modules · 5 exporting a walk-derived value (2 driven BRANDED, 3 NAMED with reasons conditional on a same-run measurement); blind spots STATED. **RESIDUALS AS ROWS, NOT NOTES: D-301** (the census is comment-blind, not string-blind) and **D-302** (one of the five floors is STILL over the working tree — the brief's "both instances are already GUARDED" was right for four and wrong for one, because `walkfloor.mjs` decides `guarded` by an import spelling, answering about the wrong file).

### D-251 · done
milestone: M2 — **CONTENT-PDF is PROMOTED for this item** (it has been DORMANT since 2026-08-03; activation order is CONDUCT's, ruled 2026-07-31)
interface: I2 — a `producer` field on the text shape is ADDITIVE; file the IC row with measured consumer impact
depends-on: none — CPDF-9 and CPDF-10 both landed and their measurements are the ground
scope: **`DEBT.md`'s D-251 row is the authority, and CPDF-9's measurement is the reason it is not theory: 3 of 14 recent Legistar attachments name ABBYY FineReader in their producer metadata — the Clerk's CERTIFIED ENACTED RESOLUTIONS carrying garbled OCR overlays the record has been reading as authored text.** Build the trailer's `/Info` `Producer`/`Creator` read in `pdfstructure.mjs` (measured: zero matches for `Producer` in that file today), carry it as a `producer` field on I2's text shape, and compose the chain step from it in `index.mjs`'s acquire assembly. **THE DESIGN IS THE DEFAULT AND NOT THE TABLE:** a layer whose producer names OCR software becomes `layer -> ocr(<product>)` with the product NAMED; a layer with no such marker stays **`undetermined`, NEVER "authored"** — an absent marker is an absent marker. **The classification may only ever make the claim WEAKER.** That is `CLAUDE.md`'s *undetermined is first-class and must be STATED* on one field, and a lookup table of product names would be the record claiming more than it can support one field wide on every document in the store.
accepts-when: a fixture PDF whose `/Info` names an OCR product reads `layer -> ocr(<product>)` with the product named, driven through the acquire op and not asserted at the parser; a fixture with NO marker reads `undetermined` and never "authored"; the IC row filed with measured consumer impact; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) remove the `/Info` read and the named-engine arm must fail; (2) **the arm this item exists for: make the classification able to STRENGTHEN — let an absent marker read as "authored" — and an assertion must fail naming it**; (3) an over-strictness arm: a producer string in a spelling you did not anticipate must leave the layer `undetermined` rather than crash or guess.
added: 2026-08-10 · CONDUCT (CPDF-9's third amendment to DEC-4; the highest-value unbuilt half of CPDF-10)
landed: `fcb78d3`, merged on `main`. **THE THREE ABBYY DOCUMENTS ARE NOW DISTINGUISHABLE, VERIFIED LIVE** — re-fetched from Legistar 2026-08-10 and read by this extractor: 89484/89498/89518 CMS all carry `ABBYY FineReader Engine 11` and now read `layer -> ocr(ABBYY FineReader Engine 11)`. Identity confirmed BY CONTENT and not merely by metadata: 89518's decoded layer still begins with the exact garbled stamp CPDF-9 quoted. **THE MARKER IS IN `/Creator` AND `/Producer` IS ABSENT ON ALL THREE — reading only `/Producer`, which is what the row's own name suggests, would have found NOTHING.** The 8 sibling attachments on those matters (Distiller, Word, Quartz, PScript5, Aspose, 3 encrypted) all read `undetermined`: zero false positives, encrypted ones NAMED rather than matched against ciphertext. `infoDict()` reads BOTH trailer shapes — the classic dict AND the xref STREAM with no `trailer` keyword at all, which is the Legistar class — plus `/Info` compressed into an `/ObjStm`, incremental updates where the last wins, and a dangling ref that falls back. **`PRODUCER_DETERMINATIONS` is `["ocr","undetermined"]`, FROZEN, and "authored" IS NOT A MEMBER** — the table is a one-directional DETECTOR and the product name comes from the document's own bytes, never from the table; composition only ever APPENDs and the named engine's `cap` is `null`, so the chain gained the engine's NAME and not a letter. Battery 158/158 · 9,915 on its own branch, delta +71 diffed between two full runs; `--strict` exit 0 unpiped, OPS 163/163 and CHECKS 228/228 unchanged (no op, no refusal code added). NCs RUN x3, armed ALONE with sha256 AND `cmp` restores: (1) `/Info` read removed → 37/87, every named-engine assertion collapsed and both trailer shapes blind, while the MUST-NOTs held (nothing read as "authored"); (2) **the arm this item exists for — classification made able to STRENGTHEN** → 52/58 and 93/94, seven failures naming it including one STRUCTURAL failure that never contains the word, with ABBYY/Tesseract/UTF-16 arms staying green so the arm measures strengthening and not breakage; (3) over-strictness, one over-broad marker row → 50/58, the unanticipated spelling GUESSED into `ocr`, nothing crashed. **IC-58 filed BEFORE the build**, measured impact: zero readers break (grepped across seven trees; nothing enumerates the text shape's keys), `op=textprovenance&step=ocr` starts answering with NO schema change because CPDF-10's index existed and had nothing to distinguish, and 3 of 3 subjects moved while 8 of 8 siblings did not. **The worker filed a FALSE FINDING and corrected it in place, visibly** — it first claimed the battery exits 0 with 124 failures; its own harness was `cmd > file; echo "EXIT=$?"`, and a compound reports `echo`'s status. The correction is left standing in `CLAIMS.md` and `MEASUREMENTS.md` rather than the paragraph being rewritten.

### VF-6 · done
milestone: M0 (background lane, holds no slot) — **a VERIFY-track instrument, run out of band the way COFF-6 and CPDF-9 were**
interface: none — it measures, it does not publish a shape
depends-on: none
scope: **DEC-53's WATCH NUMBER, and the reason it is an item rather than a note is that the ruling CARRIED it forward rather than dropping it.** DEC-53 was answered 2026-08-10 by resting on DEC-52 ("the machine may rule" — a member accepting a ranked, honestly-graded candidate is strictly WEAKER than what DEC-52 already licenses), so the cap-at-C alternative is closed. **What the answer explicitly did NOT close is its own recommendation's caveat: *"the number to watch is how often a member accepts without reading, and nobody is measuring that today."*** That sentence is the entire item. **MEASURE, DO NOT ASSUME:** the accepts-without-reading rate on machine-composed resolution candidates, with its date and instrument, into `MEASUREMENTS.md`. **DECIDE THE INSTRUMENT HONESTLY AND SAY WHAT IT CANNOT SEE** — "read" is not directly observable, so the item's first obligation is to state what the proxy actually measures (time-to-accept? whether the candidate's detail was ever expanded? acceptance of a candidate whose `grade_if_resolved` is null?) and what it would MISS, rather than shipping a number whose meaning nobody stated. **A proxy presented as the thing itself is this record's own overclaim class arriving in an instrument** — the same failure as a self-reported confidence thresholded as calibrated (CPDF-10's forbidden pseudo-confidence), one altitude up. A stated `undetermined` is a legitimate result here and must be first-class: if the surfaces cannot distinguish read from unread, that ABSENCE is the finding and is worth more than a fabricated rate.
accepts-when: a `MEASUREMENTS.md` row, dated, naming the instrument and what it CANNOT observe, carrying either the rate or a stated `undetermined` with the reason; the figure derived from recorded acts rather than from a hand count.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) **the arm this item exists for: state the proxy AS the quantity ("members accept without reading N% of the time") and the instrument's own honesty assertion must fail naming the proxy** — the number's caveat is load-bearing and travels with it or the number is worse than nothing; (2) feed the instrument a fixture where no read/unread signal exists at all and it must answer `undetermined`, never zero — an absent signal and a measured zero are different facts and must not read alike.
added: 2026-08-10 · CONDUCT (draining the 2026-08-10 BOB INBOX entry, work item 1; DEC-53's carried watch item, decided the same day)
landed: `3c5cbbf`/`e0085eb`, merged on `main`. **THE ANSWER IS A STATED `undetermined`, AND IT IS DRIVEN RATHER THAN ARGUED** — two whole stores from a byte-identical fixture diverging in exactly one call: store R calls `op=readingname`, is offered a candidate carrying `grade_if_resolved: "A"` and accepts off it; store B calls `op=resolve` on the same capture and reference having NEVER called `op=readingname`. Those are the two ends of DEC-53's quantity — a maximally-read accept and a definitionally-unread one — and **the recorded acts came back IDENTICAL** but for `at`, a wall-clock stamp that differs between any two runs by construction (reported separately, not silently dropped). All four candidate proxies probed, all four ABSENT; the sharpest is structural — **accepting a null-`grade_if_resolved` candidate writes NOTHING, so the act that would be the signal is the one act that leaves no trace**, and counting rows returns zero however many members do it. What the instrument cannot observe is stated beside the row: it sees acts and not reading; out-of-band reading makes a member who read the source last week indistinguishable from one who accepted blind, and **every available proxy is wrong in the direction that manufactures a scandal**; n=0 live member accept acts; the surface question is a source READING labelled as one, not a measurement. NCs RUN x3, each armed ALONE, baseline 7/0: proxy-as-quantity → 5/2 (`HONESTY` names the substituted proxy, and it fails TWICE because `sentence()` is the single composition point for both the published-today path and the path published the day a signal exists — reporting one would have under-counted the control); absence-as-zero → 6/1 answering `0%` while the census still reads ABSENT, so the arm moved publication and not measurement; **vacuity (over-strictness) → 6/1 with an armed answer INDISTINGUISHABLE from the baseline's, which is exactly why it had to exist — only the control can tell a MEASURED `undetermined` from a hardwired one.** Battery 157/157 · 9,844 assertions, delta ZERO (the predicted shape for an item adding no suite); `--strict` exit 0 unpiped at arms 792/792, classified 151/151, corpus 152/152. **The worker's measured baseline disagreed with its brief and it trusted the measurement:** a worktree with no `node_modules` first read 28/157 with 129 suites failing `ERR_MODULE_NOT_FOUND: miniflare`; after `npm ci` the true baseline is 157/157. **DEC-68 raised** (retain a read event for `op=readingname`? — doctrine, not schema: it is a question about surveilling members) **— AND ANSWERED THE SAME DAY BY BOB: NO, AND THE PREMISE FALLS WITH IT.** *"Why do we want to count the number of times that a user approves a candidate? If the user approves it, then it's approved."* DEC-53's watch item is CLOSED AS WITHDRAWN rather than left unmeasurable: the count guarded against member approval becoming a laundering formality over machine composition, and DEC-52 already dissolved that boundary — a machine act stands attributed AS machine, a member act binds AS the member's. Counting attention here would have been the record's ONE anomaly, since no other member act (citing, ratifying) is graded on diligence. **Authored acts bind; the approval IS the act.** VF-6's published `undetermined` stands as the honest record of what was probed — it is not an open loose end, and this line exists so nobody reads it as one and **`tools/plancheck.mjs`'s UNPUSHED wording fixed** from this item's report, which named it rather than working around it.


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

### REC-82 · done
milestone: M4 — D-164, the content-extent primitive (RECORD)
interface: I5 (IC-83 ACCEPTED 2026-09-14 — registry CHANGING at 1.11.0 until this and REC-83 land)
depends-on: IC-83 ACCEPTED (done at the drain)
scope: exactly the inbox entry's item 1 and IC-83's "What" and "Rules the writer enforces": the `content` table placed BEFORE the `host_governor` block (`schema.mjs` — no semicolon in an inline `--` comment, no backticks; hygiene asserts the literal ends on `);`), added to `op=purge` in BOTH arms (D-113), rows first-class (never rewritten by re-promotion, marked `stale` when the capture's chain moves, never deleted); the writer on `checkInquiryBasis`/promote minting or finding the row per leg by `content_id = hash(capture_sha, canonical extent, chain)`; the stored page count at mint for the out-of-range refusal; a legacy leg backfilled to its `document` row on first read, deterministically; every catalogue refusal IC-83 names as a named code (extent outside the page set; no extraction chain; unknown/unparseable kind; `dom` while no producer exists; a machine credential may mint and never attest — C-35.10 unchanged). `inquiry_basis.content_id` and `inquiry_basis_version_legs.content_id` arrive NULLABLE (CHANGING). The `pdf-page` and `document` arms ONLY — the other three are REC-85; the reads are REC-83. The D-164 study §4 and §6 and Part II §14.4/§18 are the design; IC-83 is the contract.
accepts-when: every named refusal driven through `op=promote`; a whole-document leg mints a `document` row and a `pdf-page` leg a page row, two citers of one passage sharing ONE row by construction (driven); a legacy leg reads back with its `document` row minted; purge clears both arms (D-113 driven); `cd bio-plane && npm run test:battery` green — measure your own baseline (~187/187 · ~11,343 with all three member installs); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0, with a control-plane assertion for every new op or check in the same turn; `node civicos-ui/test/run.mjs` from the repo root, unpiped; `op=audit` clean in scratch; plancheck 0 fail
NEGATIVE CONTROL: run and recorded, armed ALONE, the study §4 list for these two arms — (1) an extent outside the capture's page set → refused BY NAME; (2) an extent with no extraction chain → refused; (3) `dom` → refused while no producer exists; (4) re-extraction moves the chain → the row reads `stale`, is NOT deleted, and its edge still resolves saying so; (5) the transcriber-attests-own-transcription shape is REC-87's, not armed here; over-strictness: a `document` leg on a capture with no text layer still mints (the row is a referent, not a claim); the arm's own arm: neuter the content-address hash → the two-citers-one-row assertion FAILS.
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 act-6 entry: the nine items scoped there, in its dependency order; the entry's item text stays in the inbox record as the scope's authority beside IC-83/IC-84 and the D-164 study — a notification, not a second copy)
landed: `3c8820d` + `8330193` (on a merge of `origin/main`), merged on `main`. **The `content` table before `host_governor`, two indexes, in purge's TABLES (both arms); columns exactly IC-83's PLUS `page_count INTEGER` — required by IC-83's own Rules prose and absent from its column list (IC-83 AMENDED at this landing, the column recorded, not widened). `inquiry_basis.content_id` and `inquiry_basis_version_legs.content_id` NULLABLE; the version-leg column arrives without its writer (REC-84's). The writer: C-45.1 extent outside the page set · C-45.2 no extraction chain · C-45.3 unknown or unlanded kind · C-45.4 `dom` by name; no fifth code for the machine fence (a machine may mint, may never attest — C-35.10 asserted unchanged). `document` arm mints a `document` row even on a capture with no text layer (a referent, not a claim); absent kind reads `document`, never `unstated`; `pdf-page` asks the derivation cap about THAT extent (D-252). Mint-or-find is `INSERT OR IGNORE` on the content-address hash — two citers, one row, no allocator. THE FINDING THAT MATTERS MOST: `inquiry_basis` is delete-then-insert re-projected on every promotion and the address contains the chain, so a naive projection would have SILENTLY RE-POINTED every authored citation the first time anything re-read the document — exactly what Bob ruled the record never does (5.8); the prior referent is now read before the delete and carried forward when target and extent match, and a member narrowing mints anew; arm `carry` proves it can fail.** `promote`'s response gained an additive `content[]` array (without it a row is invisible from every op). Backfill is a pure function (`ensureLegContent`, LANDED BUT UNCALLED — REC-83 wires it); `stale` marks, never deletes, one-way. FL-10 fired on three sources, rebuilt. Gates on the branch: battery 188/188 · 11,474 vs pristine 187/187 · 11,410 (+64 attributed per suite: `content-extent` +59, hygiene +3, caselifecycle +1, planning-hygiene +1; a first baseline with `ocr-worker` SKIPPED was discarded and re-measured); strict exit 0, REGISTER_FLOOR set to 967/179/180 from its print; UI harness exit 0; plancheck --local 0/0; corpuscheck 0. NCs 8/8 — **three came back wrong and are recorded: `sha256HexSync`'s first draft mis-padded inputs of length 55 mod 64 and agreed with itself (caught by the arm driving it against `crypto.subtle`); `overstrict` read −1/−1 because the helper THREW instead of failing the named assertion; `stale` reported ARMED NO (0 matches) and looked like an unbreakable subject — caught only by the printed match count.** The derivation-bounds ratchet fired and the AMPLIFICATION was removed rather than the ceiling moved (a max() aggregate, one UPDATE, capture resolved once, one set-based pass); roster byte-identical to the pristine 32. Two superseded assertions corrected, not exempted (`caselifecycle` pinned "last in TABLES"). Owed acts enacted: the page-count column → IC-83 AMENDMENT; the inquiry-leg case (no capture, no part — `content_id` legitimately NULL and STATED, a leg naming a PART of an inquiry refused) → IC-83 AMENDMENT as the rule, CONDUCT's call; D-345 (nothing persists a capture page count, so C-45.1 reaches mixed documents only) with its DELEGATION to CAPTURE → **CAP-9**. What REC-83 must know is in the report and on its brief: `contentRow`, `#contentStandings` (set-based — never a read per leg), `ensureLegContent` uncalled, `contentContextFor`, the two legitimate NULL cases stated not collapsed.

### REC-83 · done — landed `02da952` + `d7d37c7`, merged at `cc8187d` by CONDUCT #11. **Prior state, kept as the record: waited on REC-82 (the table it reads).** — **Act 6 item 2 — the reads: `earnedBasisRegistry` keyed by content row, `op=earnedbasis` answering the per-extent transcription ceiling and stating UNDETERMINED for a portion leg's connection axis (Bob's 5.1), and the new fixed-key `content` read (not yet an op — REC-83 builds it); IC-84's read half.**
milestone: M4 — D-164, the content-extent primitive (RECORD)
interface: I3 (IC-84 ACCEPTED — CHANGING at 14.1.0 until this and REC-84 land)
depends-on: REC-82
scope: the inbox entry's item 2 and IC-84's (3) and (4): `earnedBasisRegistry` keys by content row; `gradeCeiling(chain, extent)` per extent — an attestation covering the extent raises it to B, a page attestation does not cover a `document` row; the connection grade of a non-`document` row is UNDETERMINED and STATED, never borrowed from the whole document; the leg's capture grade ≤ `captureBound` as today; the fixed-key `content` read by `content_id` (member and read classes), returning the row, `ref`, chain and cap, `stale`, and the attestations covering it — no predicate, no paging (D-222's fixed-key rule).
accepts-when: `op=earnedbasis` on a portion leg answers the per-extent ceiling and the connection axis as UNDETERMINED with the level stated (CLAUDE.md's sparse-is-normal rule), driven; the `content` read answers every field on a minted row and refuses an unknown id by name; `cd bio-plane && npm run test:battery` green — measure your own baseline (~187/187 · ~11,343 with all three member installs); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0, with a control-plane assertion for every new op or check in the same turn; `node civicos-ui/test/run.mjs` from the repo root, unpiped; `op=audit` clean in scratch; plancheck 0 fail
NEGATIVE CONTROL: run and recorded — a page attestation must NOT raise a `document` row's ceiling (driven both ways); an `content` read call with a predicate or paging → refused (fixed-key only); over-strictness: a `document` leg's earned basis is byte-identical to the pre-item answer.
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 act-6 entry: the nine items scoped there, in its dependency order; the entry's item text stays in the inbox record as the scope's authority beside IC-83/IC-84 and the D-164 study — a notification, not a second copy)
landed: `02da952` + `d7d37c7`, merged at `cc8187d`. **IC-84's read half is BUILT: `earnedBasisRegistry` answers at content grain behind an optional third argument (every existing caller byte-identical, pinned by digest against a pristine-tree measurement); the transcription ceiling is `gradeCeiling(chain, extent)` per extent from the coverage rule that already existed (a DOCUMENT attestation covers a `document` row, a PAGE attestation does not — driven both ways); a portion row's connection axis is UNDETERMINED and STATED with the empty level NAMED, never borrowed from the document; `op=earnedbasis` answers per extent and carries the two legitimate NULL `content_id` cases as codes (`INQUIRY_TARGET`, `NO_BYTES_HELD`) decided in `ensureLegContent`; the NEW fixed-key `op=content` (one row by id — the row, its ref, chain and cap, `stale`, the attestations covering it; the accept-set inverted so an uninvented spelling is refused; D-15 gated so an unseen row answers as a non-existent one); `ensureLegContent` WIRED to the first read (REC-82 landed it uncalled and said so); `content` removed from `PLANNED_OPS` in the commit that built it.** Two totality guards the brief did not foresee were answered rather than taken silently (a `NON_ACTS` row in `affordances.mjs`, a `GATED` entry in `gate-reads.test.mjs`). A LIMIT came off the leg read after `bounds.test.mjs` named it capped-but-undriven — it would have published two populations in one answer; both rosters re-measured unmoved. Measured on the branch: battery 189/189 · 11,547 against a pristine 8f2023f baseline of 188/188 · 11,474 (+73: `content-reads` +69 new, `hygiene` +3, `planning-hygiene` +1); `--strict` exit 0, 172/172 ops reached; UI harness exit 0; six NC arms as declared on the final tree, two corrected at their sites on the first run (a held-open half that the arm also broke; a `-1/-1` from a throw-instead-of-fail, REC-82's shape). **D-349 RAISED, not fixed** — `captureBound` has ZERO callers, so IC-83's "the leg's capture grade <= `captureBound` as today" describes a bound nothing computes; the doctrine is already ruled (DEC-4, framework Part II Appendix A.1) so it is queued as REC-88, an enforcement item with its own IC. The D id one below D-349 was minted by a first invocation of the tool and is unused: a gap, not a missing row. IC-84 stays CHANGING until REC-84 and UI-61. On the merged tree: mergecarry 16 of 17 carried + 1 declared (the floor block); full gate and the floor collapse recorded in the integration commit.

### REC-84 · running — spawned 2026-09-14 by CONDUCT #10, Opus 5, worktree-isolated, RECORD's dev slot, AFTER REC-82 reached `origin/main` (the loop rule of 2026-09-14). Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on `store.mjs`; if none does, this row reads `queued`. **Prior state, kept as the record: waited on REC-82.** — **Act 6 item 3 — the frontmatter and version legs: C-2.8 and C-25.10 admit the `extent` arm; `inquiry_basis_version_legs.content_id`; the investigative run's suggested legs default to `document`.**
milestone: M4 — D-164, the content-extent primitive (RECORD)
interface: I3 (IC-84's (1) and (2)); C-numbers via `node tools/mintid.mjs C` if a new check is needed
depends-on: REC-82
scope: the inbox entry's item 3 and IC-84's (1): a basis leg's optional `extent` in `bundle.md` frontmatter — one of IC-1's arms or `{kind: document}`, absent = `document` (5.3, no `unstated`); C-2.8 and C-25.10 KEEP the bundle-id target grammar and ADD the extent grammar — ONE checker, ONE `covers` per arm, called from the op and the store; a content id whose row does not exist is refused by name; version legs carry `content_id`; the investigative run's suggested legs default to `document`.
accepts-when: a frontmatter leg with a `pdf-page` extent promotes and resolves to its content row; one without resolves to `document`; a malformed extent is refused by C-2.8 by name; `cd bio-plane && npm run test:battery` green — measure your own baseline (~187/187 · ~11,343 with all three member installs); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0, with a control-plane assertion for every new op or check in the same turn; `node civicos-ui/test/run.mjs` from the repo root, unpiped; `op=audit` clean in scratch; plancheck 0 fail
NEGATIVE CONTROL: run and recorded — the checker neutered → a malformed extent lands (must FAIL); a version leg whose `content_id` names no row → refused; over-strictness: every existing frontmatter fixture in the battery promotes byte-identically.
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 act-6 entry: the nine items scoped there, in its dependency order; the entry's item text stays in the inbox record as the scope's authority beside IC-83/IC-84 and the D-164 study — a notification, not a second copy)

### REC-85 · running — spawned 2026-09-14 by CONDUCT #11, Opus 5, worktree-isolated, RECORD's dev slot, AFTER REC-83 reached `origin/main` (REC-84 is a parallel landing in disjoint regions). Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the REC-82 content region of `store.mjs`; if none does, this row reads `queued`. **Prior state, kept as the record: waited on REC-82.** — **Act 6 item 5 — the other three arms: `covers` for `sheet-cell`, `doc-para` and `slide-shape`, each with its out-of-range refusal from the container's own extent (sheet dimensions, paragraph count, shape list).**
milestone: M4 — D-164, the content-extent primitive (RECORD)
interface: I5/I3 within IC-83/IC-84 (no new IC — the arms are IC-1's union)
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §15 (the forms content takes) and §16 (how it is extracted) — the container structures the arms read; IC-83 (the page-count refusal the arms mirror) and IC-84 (the leg grammar the arms flow through); added 2026-09-14 by CONDUCT #11 at spawn (CORPUS-STANDARD §4.7)
depends-on: REC-82
scope: the inbox entry's item 5: one `covers` per arm reading the container's extent from I2's structure (COFF-3/4/5's emitters) — a cell outside the sheet, a paragraph past the count, a shape not in the list → refused by name, mirroring the page-count refusal; the content row minted the same way as `pdf-page`.
accepts-when: each arm mints on an in-range extent and refuses an out-of-range one by name, driven per arm; `cd bio-plane && npm run test:battery` green — measure your own baseline (~187/187 · ~11,343 with all three member installs); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0, with a control-plane assertion for every new op or check in the same turn; `node civicos-ui/test/run.mjs` from the repo root, unpiped; `op=audit` clean in scratch; plancheck 0 fail
NEGATIVE CONTROL: run and recorded per arm — the out-of-range refusal neutered → an impossible extent mints (must FAIL); over-strictness: `pdf-page` and `document` behaviour byte-identical to REC-82's landing.
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 act-6 entry: the nine items scoped there, in its dependency order; the entry's item text stays in the inbox record as the scope's authority beside IC-83/IC-84 and the D-164 study — a notification, not a second copy)

### REC-86 · queued — **waits on UI-61 (the selection surface it needs first); its own IC on I3, minted at spawn.** — **Act 6 item 6 — NARROW (Bob's 5.3): a member makes an existing citation more specific — a new basis version against a narrower content row, the old retained; RECORD + UI.**
milestone: M4 — D-164, the content-extent primitive (RECORD)
interface: I3 — its OWN IC, filed at spawn, before building
depends-on: UI-61
scope: the inbox entry's item 6 and IC-84's "NOT in this IC": a member act that narrows a leg — a new basis version whose leg targets a narrower content row of the same capture, the old version retained (never re-pointed: Bob's 5.8, an authored edge is never moved without a member's act — this IS the member's act); the UI affordance on the leg; the audit trail names both rows.
accepts-when: narrowing produces a new version with the narrower row and leaves the old version and its row untouched, driven through the op and the UI harness; `cd bio-plane && npm run test:battery` green — measure your own baseline (~187/187 · ~11,343 with all three member installs); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0, with a control-plane assertion for every new op or check in the same turn; `node civicos-ui/test/run.mjs` from the repo root, unpiped; `op=audit` clean in scratch; plancheck 0 fail
NEGATIVE CONTROL: run and recorded — a narrowing that would move the OLD version's target → refused (5.8 driven); a "narrowing" to a WIDER extent → refused by name; over-strictness: promote without narrowing unchanged.
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 act-6 entry: the nine items scoped there, in its dependency order; the entry's item text stays in the inbox record as the scope's authority beside IC-83/IC-84 and the D-164 study — a notification, not a second copy)

### REC-87 · queued — **waits on UI-61; its own IC on I2 (a step kind) and I3, minted at spawn.** — **Act 6 item 7 — TRANSCRIBE (Bob's 5.2): a member selects a portion and types its text — step kind `member(handle)`, cap undetermined and STATED, attestable by a SECOND member, the transcriber's own attestation refused by name; RECORD + UI.**
milestone: M4 — D-164, the content-extent primitive (RECORD)
interface: I2 (a new step kind — FRAMEWORK dormant, CONDUCT answers-for) and I3 — its OWN IC, filed at spawn
design: `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §5.2 ("Is a member's transcription a derivation or a verification?" — Bob's 5.2 ruling, which this row builds) and §6 (the mechanism), under `BIO_Content_Framework_v0_10.md` Part II §14.4 and §18 piece 1
depends-on: UI-61
scope: the inbox entry's item 7 and the study §5.2: a transcription is a DERIVATION step of kind `member(handle)` on the content row's chain with cap undetermined and stated; a second member may attest it (raising the ceiling as any attestation does); the transcriber attesting their own transcription is refused by name (the equality-that-costs-nothing rule, one altitude up); the UI act is a portion selection plus a text field, nothing prefilled.
accepts-when: a member transcribes a portion, a second member attests it, the ceiling moves as ruled, and the self-attestation is refused by name — all driven; `cd bio-plane && npm run test:battery` green — measure your own baseline (~187/187 · ~11,343 with all three member installs); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0, with a control-plane assertion for every new op or check in the same turn; `node civicos-ui/test/run.mjs` from the repo root, unpiped; `op=audit` clean in scratch; plancheck 0 fail
NEGATIVE CONTROL: run and recorded — the self-attestation refusal neutered → the ceiling rises on one member's word (must FAIL); a transcription with no portion selected → refused; over-strictness: existing attestation paths byte-identical.
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 act-6 entry: the nine items scoped there, in its dependency order; the entry's item text stays in the inbox record as the scope's authority beside IC-83/IC-84 and the D-164 study — a notification, not a second copy)

### REC-88 · queued — **waits on REC-84 (the version-leg writer shares `checkEarnedLeg`'s region); its own IC on I3 minted at spawn.** — **D-349 closed by ENFORCEMENT: the capture axis becomes the weakest link of byte provenance AND transcription fidelity, as DEC-4 already rules and nothing computes — `earnedBasisRegistry`'s capture arm calls `captureBound(chain)`, `checkEarnedLeg` compares the leg's claimed capture grade against the result, an OCR'd document's leg can no longer claim a letter stronger than its measured fidelity, an unmeasured transcription answers UNDETERMINED and STATED (never a letter), and every existing leg on an OCR'd document is re-graded under a migration story the IC states.**
milestone: M4 — D-164's content-extent primitive made honest on the capture axis; the record must not accept a grade one letter stronger than its own doctrine allows (CLAUDE.md: overclaiming is worse than a missing feature)
interface: I3 — its OWN IC, minted at spawn (a leg's earned capture grade can FALL for existing legs; the migration and the re-grade are the consumer impact, measured on the project instance's own legs before the RESOLUTION); IC-83's sentence "the leg's capture grade <= `captureBound` as today" is corrected in the same IC to say what is now true
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part II Appendix A.1 (the ruling row "fidelity bounds the capture axis as its weakest link, no third scale" — DEC-4, CPDF-10) and `docs/architecture/BIO_System_Design.md`'s capture-grade row; the rule in code is `bio-plane/src/textchain.mjs`'s header and `captureBound`; the gap is D-349 (DEBT.md), measured in MEASUREMENTS.md 2026-09-14 · REC-83
depends-on: REC-84 (landed writer regions in `store.mjs`; REC-83 landed the reads at `cc8187d`)
scope: call `captureBound` from the capture arm of `earnedBasisRegistry` (document grain — ONE value, `earned.capture[bundle_id]`, never a second copy on a content row, exactly as REC-83 left it); compare in `checkEarnedLeg`; state the two outcomes as codes (a measured fidelity caps the letter; an unmeasured transcription is UNDETERMINED and stated, never refused for being unmeasured); re-grade existing legs on OCR'd documents through the migration the IC describes, with the count of legs that move MEASURED on the project instance's data and recorded; delete nothing — `captureBound`'s four assertions in `textchain.test.mjs` stay and gain the through-the-op arm. `docs/architecture/BIO_Content_Framework_v0_10.md` Part II's front matter moves in the same commit if the construct's stated completeness changes.
accepts-when: a leg citing a document whose chain carries a measured OCR fidelity of C is REFUSED at capture grade B and accepted at C, driven through `op=promote` (the write that carries a leg) and read back through `op=earnedbasis`; a leg on an unmeasured transcription reads UNDETERMINED on the capture axis with the empty level NAMED; a leg on publisher-typed text is byte-identical to the pre-item answer (the IC-84 §7 digest pin in `content-reads.test.mjs` is MOVED with its reason, never exempted); `cd bio-plane && npm run test:battery` green own-baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; UI harness from the repo root exit 0; plancheck --local 0 fail; D-349 closed with the commit; the IC at CHANGING with its consumer impact measured.
NEGATIVE CONTROL: run and recorded — the `captureBound` call removed from the capture arm → the C-vs-B refusal arm FAILS by name and the digest pin on publisher text still passes (so the arm is measuring the bound and not the pin); over-strictness: a publisher-typed document with no derivation step keeps its letter, and a chain whose fidelity EXCEEDS the byte-provenance letter is bounded by provenance, not fidelity (the weakest link, both directions).
added: 2026-09-14 · CONDUCT #11 (D-349's closing act converted to a row at REC-83's integration — the decided index and the framework's Appendix A.1 answer the doctrine question the row asked, so it is an enforcement item and not a DEC; the 2026-09-14 sweep rule)

### REC-80 · done
milestone: M0 (background lane, holds no slot) — the design corpus standard, Bob's 2026-09-14 ruling: `docs/architecture/CORPUS-STANDARD.md` §5 "Not yet governed"
interface: none — front matter and one row in `CORPUS-STANDARD.md` §5's governed table; no shape, no op, no behaviour moves
depends-on: none
scope: `docs/development/RETRIEVAL-SUBSTRATE.md` and `docs/development/SCHEDULER.md` (~28 KB). Read each against `store.mjs` (`grep -a`; measure its size, do not assume) and `query.mjs`/the scheduler: Status states built vs designed in Part II's vocabulary; Place names the level-1 home from `BIO_System_Design.md` §3; Incomplete honest. `--write` for Contents; both added to §5's table. **Runs in the same worker as FW-16 and COFF-8** (three small dormant-or-narrow owner groups, disjoint files, one integration instead of three); each row keeps its own claim entry and its own status.
accepts-when: front matter per `CORPUS-STANDARD.md` §3's grammar on every file named in scope, each file ADDED to §5's governed table in the same commit (`CORPUS-STANDARD.md` is itself governed — bump its Status `as of` and regenerate its Contents if a heading moves); `node tools/corpuscheck.mjs` 0 fail over the WHOLE governed set; the Incomplete list HONEST per §6 — a section incomplete in fact and unmarked is the defect, "None" only with how it was established; `node tools/gates.mjs` green (class DOCS: the doc-facing suites plus `plancheck --local`); plancheck bare 0 fail after CONDUCT's push.
NEGATIVE CONTROL: run and recorded, on one retrofitted file, each arm ALONE — (1) the Status `as of` date pushed behind the file's last commit day → corpuscheck FAILS naming the file; (2) one heading edited without `--write` → FAILS on the Contents divergence; (3) an Incomplete bullet naming a section the document does not have → FAILS; each restored by `cp`-back verified by hash (never `git checkout --`), and the final files pass byte-for-byte (over-strictness).
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 inbox entry, act 1 — one prose-only item per owner group; the Status/Place/Incomplete judgment is the owner's, and for a DORMANT area CONDUCT answers-for in the row and the worker writes it)
landed: `97232bf`, merged on `main` at `de36ac7` (one worker with FW-16 and COFF-8). **`RETRIEVAL-SUBSTRATE.md` [BUILT] on everything its Recommendation names, 6 incomplete — worst: §Serialization says the viewer predicate "returns true"; the real project-participation filter landed (D-15/DEC-72/D-310). `SCHEDULER.md` [BUILT], 4 incomplete — two sections still say "the two real consumers"; the registry holds ELEVEN.** Both in §5's table, both struck from not-yet. corpuscheck 24 governed / 0 fail at the branch; gates DOCS green (19/19 · 1,118 + 4 UI); NCs 3/3 on `SCHEDULER.md`, restores by sha256 AND cmp. The report's IC-1 "contradiction" is the protocol working: states are APPENDED, never edited in place, and IC-1 carries `RESOLUTION · 2026-08-03 · ACCEPTED (as amended)` under its PROPOSED heading — no item. Its two DEBT candidates → D-338 (the per-kind monitoring contract declared and unreached); D-60's delegated stale claim discharged in FW-16's front matter (row updated). The compound-SELECT ceiling recorded in MEASUREMENTS.md. Body corrections → M0-27.

### REC-81 · done
milestone: M0 (background lane, holds no slot) — the design corpus standard, Bob's 2026-09-14 ruling: `docs/architecture/CORPUS-STANDARD.md` §5 "Not yet governed"
interface: none — front matter and one row in `CORPUS-STANDARD.md` §5's governed table; no shape, no op, no behaviour moves
depends-on: CPDF-17 (running — overlapping comment regions in `schema.mjs`/`index.mjs`)
scope: The eleven sites on `origin/main` before the shift (`git show 3f5e833:<file> | grep -an "framework:[0-9]"`): `schema.mjs` ×4 (`framework:489`, `:247`, `:251`, `:554`), `index.mjs` ×3 (`:480`, `:489` ×2), `store.mjs` ×2 (`:248`, `:554`), `affordances.mjs` ×1 (`:248`), `docs/development/INTERFACES.md` ×1 (`:554`) — minus any CPDF-17 already converted to Part II sections (read its landed diff first). Resolve each old line number against the PRE-SHIFT file (`git show 3f5e833:docs/architecture/BIO_Content_Framework_v0_10.md`) to its enclosing heading — 247/248/251 → "Two directions, and where they must meet", 480/489 → §5 "A document's anatomy: regions and digests", 554 → §6 "Change: layers, and one entry point" — and write the citation as `framework §N` (or `framework §N.N` / the heading text where a subsection has no number), the form §4.6 rules, with the dated reason once per file. Comment-only in every `.mjs`: comment-stripped diff EMPTY, asserted. `index.mjs` is bundled — FL-10's guard fires; rebuild `dist/` as it instructs, bump nothing. NEGATIVE CONTROL: every converted citation DRIVEN to resolve (section present in the post-shift file, heading text matched), and one deliberately wrong section number shown to FAIL that drive.
accepts-when: front matter per `CORPUS-STANDARD.md` §3's grammar on every file named in scope, each file ADDED to §5's governed table in the same commit (`CORPUS-STANDARD.md` is itself governed — bump its Status `as of` and regenerate its Contents if a heading moves); `node tools/corpuscheck.mjs` 0 fail over the WHOLE governed set; the Incomplete list HONEST per §6 — a section incomplete in fact and unmarked is the defect, "None" only with how it was established; `node tools/gates.mjs` green (class DOCS: the doc-facing suites plus `plancheck --local`); plancheck bare 0 fail after CONDUCT's push.
NEGATIVE CONTROL: run and recorded, on one retrofitted file, each arm ALONE — (1) the Status `as of` date pushed behind the file's last commit day → corpuscheck FAILS naming the file; (2) one heading edited without `--write` → FAILS on the Contents divergence; (3) an Incomplete bullet naming a section the document does not have → FAILS; each restored by `cp`-back verified by hash (never `git checkout --`), and the final files pass byte-for-byte (over-strictness).
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 inbox entry, act 1 — one prose-only item per owner group; the Status/Place/Incomplete judgment is the owner's, and for a DORMANT area CONDUCT answers-for in the row and the worker writes it)

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

### D-266 · done
milestone: M9
interface: I3 — the disposition key shape moves for stance-scoped kinds; file the IC with measured consumer impact before building
depends-on: none — both rulings the widening waits on are MADE (2026-08-09 doctrine, 2026-08-10 scoping)
scope: **`DEBT.md`'s D-266 row is the authority, and what remains is NARROW: the widened disposition key for STANCE-SCOPED kinds, carrying the PROJECT IDENTITY.** Both rulings the row waited on are made, and **neither was Bob's, because the repository already answered both** — (i) 2026-08-09: a disposition is a fact about the subject's STABLE IDENTITY, not about the inputs; it stands until re-triaged; it AGES the finding and never deletes it (D-79, and `proposeDispose`'s own header says so at the site); (ii) 2026-08-10: **a dismissal is scoped to THE KEY'S OWN SUBJECT.** DEC-16's instance-wide clearing is instance-wide *because its subject is* — a progression-stage finding is a fact about the SHARED record, so one act clearing it everywhere is dedup, not judgment-suppression. A stance is expressly one project's own property (§7, D-216), a dismissal is a judgment-layer act, and R5 makes forks at the judgment layer legitimate — **so one team's dismissal of a stance-scoped finding governs THAT TEAM'S feed and nothing else**, exactly the boundary `#findingsStanceDiverged` already enforces by refusing to offer `op=versioncurrent` across projects. The two rules never pointed opposite ways; they scope by subject. **NOTHING TO MIGRATE, WHICH IS WHY THIS IS CHEAP NOW AND WILL NOT BE LATER:** no disposition has ever been recorded for these kinds. The three kinds carrying no `(progression_key, stage_key)` pair are PL-15's `out-of-inquiry-lead` and PL-13's two shared-inquiry slugs. **DO NOT WIDEN THE INSTANCE-WIDE KIND'S KEY WHILE YOU ARE IN THERE** — the shared-record kinds stay instance-wide by the same ruling that scopes the others per-project, and widening both would erase the distinction this item exists to draw.
accepts-when: a stance-scoped finding dismissed in project A **still fires for project B**, driven through the control plane, while a shared-record (progression-stage) finding dismissed anywhere clears everywhere — the two behaviours asserted in the SAME suite so the distinction is pinned rather than implied; the IC filed with measured consumer impact; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) **the arm this item exists for: key the stance-scoped disposition instance-wide and project B's finding must vanish, FAILING by name** — one team silencing another team's notification about that other team's own stance is the defect the scoping ruling forbids; (2) scope the shared-record kind per-project and the dedup assertion must fail (DEC-16's own reason, in the opposite direction); (3) an over-strictness arm — a re-triage must still be able to change a standing disposition, since D-79 ages findings and never freezes them.
added: 2026-08-10 · CONDUCT (draining the 2026-08-10 BOB INBOX entry — "the widening itself is CONDUCT's to schedule"; both rulings made, the row narrowed rather than closed)
landed: `63a329d`, merged on `main`. **WHICH KINDS MOVE IS A PROPERTY, NOT A LIST OF SLUGS, and that is the load-bearing design call.** A FINDING carrying the `(progression_key, stage_key)` pair is instance-wide; one carrying none is project-scoped, keyed on the project homes it is filed under. That selects exactly PL-15's `out-of-inquiry-lead` and PL-13's two slugs **and covers a fourth minted next wave without the contract moving** — where a slug list would have gone stale the moment a fourth kind was written, which is REC-70's inversion applied before it could bite. `op=proposedispose` takes a second key shape `{project, finding}` writing a NEW table `finding_dispositions`; **`proposal_dispositions`' key is UNTOUCHED and stays instance-wide — not widening it IS the item.** `purge`'s whole-store arm takes the new table (D-113). **`key` is deliberately `null` while `available` is `true`:** the acting project is the member's to name, and a plane defaulting one where an item has several homes would choose whose judgment the record carries. A partially-disposed item STAYS in the feed with the deciding team removed from its homes and the removal declared on `case.disposed_by`. Battery 158/158 · 9,886 on its own branch; `--strict` exit 0 unpiped, 163/163 ops, 228/228 checks; UI harness exit 0. NCs armed ALONE: (1) key the stance-scoped disposition instance-wide → 27/11, the fires-for-B and one-answer arms fall BY NAME **while `ONE ACT CLEARED IT UNDER EVERY CASE` STAYS GREEN — the measurement that a suite knowing only about progression findings would have carried this defect indefinitely**; (2) scope the shared-record kind per-project → dedup falls, stance arms green; (3) over-strictness, freeze the decision → re-triage must still work (D-79). **TWO ARMS CAME BACK NOT-AS-DECLARED FIRST TIME AND BOTH CORRECTIONS ARE WORTH MORE THAN THE ARMS:** arming only the mint left "cleared everywhere" green because instance-wide ageing lives UPSTREAM in `proposalsFeed` and never consults the mint; and **a freeze is SILENT AT THE ACT** — `DO NOTHING` returns `ok:true` exactly as an UPSERT does — so an arm declared against the act's return would pass over a plane that says a re-triage landed and keeps the old decision. **IC-60 filed before the build.** Two of the worker's own defects were caught by EXISTING ratchets (the `airuns` index-reader ratchet named two indexes no statement filters on; `hygiene` caught a conditional `process.exit(1)`), and four superseded assertions in `current.test.mjs` were CORRECTED, never exempted. DELEGATION → UI: read `disposition.requires`/`projects` and send `project` + `finding`, **chosen and never defaulted when there is more than one**. Stated limit, in the suite header rather than left to be noticed: one store and one credential means the suite cannot see two members reading two feeds — "B's feed still carries it" is observed as the item's own home set, which is exactly what arm 1 destroys.

## CASE — DEC-72's publication redesign, M10. **THE ARC IS DONE, 2026-09-10: CASE-1..CASE-6 plus CASE-5b all landed, the definition of done met in CASE-6's landing turn, the design doc archived. The plane residue is D-309 (its own item below); the section stays for the record.**

**FOUR WAVES, and the shape is the dependency graph rather than a preference:**
**W1 = CASE-1 alone** (nothing depends on nothing else) · **W2 = CASE-2 ∥ CASE-3** (both on CASE-1) · **W3 = CASE-4 ∥ CASE-5** (both on CASE-2+CASE-3) · **W4 = CASE-6** (on CASE-5).

**BUT THE PARALLELISM IN W2 AND W3 IS A GRAPH FACT, NOT A SCHEDULING PERMISSION, AND THAT
DISTINCTION IS CONDUCT'S TO MAKE RATHER THAN A WORKER'S TO DISCOVER.** CASE-2 and CASE-3 are
independent in the graph and BOTH LAND ON RECORD'S GROUND — `store.mjs`, `schema.mjs`, the op
surface. `PARALLELISM.md`'s claim mechanism reserves paths BETWEEN checkouts, and this queue
already records that two areas claiming one file is *"the one thing the claim mechanism cannot
protect against"*. So: **run W2 and W3 SERIALLY unless both claims name DISJOINT REGIONS
precisely**, the way D-251's claim named `index.mjs`'s acquire assembly while RECORD held the
op surface. A merge conflict in `store.mjs` between two half-landed schema changes is not a
conflict worth having.

**NOT ACTIVATED IN THIS TURN.** CASE is M10 and the whole wave is new; `kickoffs/CASE.md` is
written AT ACTIVATION in the same act (`plancheck` fails an ACTIVE area with no kickoff).
Recorded here so activation is one act rather than a re-derivation.

### FL-8 · done
milestone: M9
interface: I3 — `RUN_STATUS` is a published vocabulary; file the IC with measured consumer impact if the shape moves
depends-on: FL-7 (landed)
scope: **FL-7's raise, and it is the SAME MISDESCRIPTION ONE VOCABULARY OVER.** A gate-refused run is recorded with status **`finished`** — because `#aiRunTerminate` keys status on whether the ending is a BOUND, and a refusal reaches no bound. **A launch the gate refused did not FINISH; it never started.** FL-7 fixed the ENDING (`cancelled` → `mode-not-deployed`, so the record stops saying a member cancelled it) and deliberately did NOT reach into `RUN_STATUS`, naming the residue in IC-62 rather than fixing it quietly — correctly, since it is a third vocabulary and was not FL-7's scope. **THIS IS NOT A DECISION FOR BOB and it is worth saying why:** the record already answered the class when FL-7 landed — a run's recorded terminal facts must name what actually happened — so applying that to `RUN_STATUS` is implementation, not doctrine. `node tools/decided.mjs` finds no ruling on the subject; the class ruling is FL-7's own. **Decide the right status IN THE ITEM and write the reasoning at the site**; do not return the question.
accepts-when: a gate-refused run's recorded STATUS names what happened, driven THROUGH the op and not asserted at the store; `RUN_ENDINGS`, `RUN_BOUNDS` and `RUN_STATUS` held in agreement with `#aiRunTerminate`'s keying, asserted rather than described.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) restore `finished` for a gate-refused run and the assertion must fail NAMING it; (2) an over-strictness arm — a run that genuinely RAN and completed must still read `finished`, and one a member stopped must still read as they left it (FL-7's own over-strictness shape, which is why it is repeated here).
added: 2026-08-10 · CONDUCT (FL-7's raise, enqueued as an ITEM rather than routed as a decision — the record already answered the class)
landed: `c004926`, merged on `main`. **`never-started` minted as a fourth `RUN_STATUS` term, and the reuse question was MEASURED rather than assumed** — §14b.6's reuse rule is conditional on the word existing (FL-7's finding), so each existing term was asked: `running` is false of a terminated run; `finished` IS the defect, its only producer being a run that reached its own end; and `stopped` — the only real candidate — **fails on its PRODUCER**, since its sole writer anywhere was `stoppedByBound` and every sentence rendered beside it names a bound. **The deciding half: all three PRESUPPOSE THE RUN STARTED.** `refused` was weighed and rejected — it names the machine's act, and is already a state word in two unrelated families. The keying moved out of `#aiRunTerminate` into one exported `runStatusFor(bound)` beside the vocabularies. **DELIBERATELY NOT MOVED, and pinned: a MEMBER-CANCELLED run still reads `finished`** — that run RAN, which is what `finished`/`stopped` presuppose and `never-started` denies. **THE THREE VOCABULARIES ARE HELD IN AGREEMENT BOTH DIRECTIONS WITH NEITHER SIDE THE OTHER'S EXPECTATION** — the catalogue live-imported from `airun.mjs`, the store's keying read from `store.mjs`'s OWN SOURCE TEXT — and **arm G2 earns that claim: a second copy of the rule that AGREES fails EXACTLY ONE assertion (125/1, ARM W1 alone)**, which is what a two-way check looks like when it is real rather than one comparison written twice. **V9 is the STATUS vocabulary's FIRST exhaustive pin** — `RUN_BOUNDS` had V5 and `RUN_ENDINGS` had V6, and the third run vocabulary had no guard at all, so a term could have been added with nothing asking why; that absence is itself the finding. Battery 167/167 → **167/167 · 10,295** (+16 across two suites, no new suite file); `--strict` exit 0 unpiped; UI harness exit 0; floor unmoved. NCs 5 arms, each armed ALONE, restores verified by sha256 AND `cmp`. **A DEFECT FOUND IN PASSING AND FIXED, AND IT IS THE SHARPEST THING IN THE ITEM: `harness.test.mjs`'s plane mock held a HAND COPY of the plane's keying and HAD BEEN WRONG SINCE FL-7 LANDED** — answering `stopped` for `mode-not-deployed` while the plane answered `finished`, with nothing comparing the two. **Every arm driven through that mock in the intervening window was evidence about a plane that does not exist.** The table is now BUILT by `runStatusFor` and interpolated as data, with arm A6c asserting it covers the whole domain a legal close can name. **IC-67 used as pre-allocated — nothing minted** — and written as a WEAKER claim than IC-62's, deliberately: unlike `RUN_ENDINGS`, the UI genuinely reads this vocabulary, so zero UI edits is a measured result (3 UI tests derive from `Object.keys`, arm E excludes it BY SHAPE, the one CSS selector pins `running`) rather than a structural impossibility. Named but not fixed, deliberately: `RUN_STATUS`'s words reach a member VERBATIM through the UI indicator while arm E excludes them from the DEC-49 guard by shape — pre-existing, noted at the site so a later item can decide whether a lifecycle word owes a sentence.

### CASE-1 · done
milestone: M10
interface: I5 via the IC protocol — new schema; file the IC before building
depends-on: none. **THIS IS THE TOP OF THE CASE WAVE and the only row in it.**
scope: **`CASE-AS-PRODUCTION.md` is the authority for scope; this file holds STATUS.** The case OBJECT: case identity owned by a project; membership rows of (finding id, version hash, role load-bearing|supporting, ordinal); editions per case. New tables go BEFORE the `host_governor` block and must be added to `purge` (D-113).
accepts-when: as the design doc's CASE-1 bullet; the IC filed with measured consumer impact.
added: 2026-08-10 · CONDUCT (draining DEC-72's decomposition as ITEMS)
landed: `5bf7610`, merged on `main`. **TWO OF THE THREE CLAUSES ALREADY EXISTED, AND THE ITEM'S REAL WORK WAS NOT BUILDING A FIFTH TABLE.** `published_cases` and `published_case_members` have been there since REC-44/DEC-44, so an item that added parallel tables would have shipped **two authorities for one fact** through CASE-2..CASE-5. Built instead: a NEW `cases` table (`case_id PRIMARY KEY, project_id NOT NULL, opened`), `published_case_members` EXTENDED with `version_sha` and `role`, and `published_cases` reused UNCHANGED because it already IS the editions table. **`cases` is keyed on `case_id` ALONE, and the reasoning is the sharpest call in the item: a `project_id` on `published_cases` would be a project PER EDITION**, letting edition 1 be project A's production and edition 2 project B's — and since the bar is read from the publishing project AT ACT TIME, that is a case whose standard of evidence can change with nobody authoring the change. One row per case makes it unrepresentable. **`project_id` is NOT NULL and a pre-DEC-72 case gets NO ROW:** DEC-72 removes the project-less path, so a row naming no project is the shape the ruling deletes; absence carries `undetermined` while a NULL would read as an owner the record lost, and backfilling would be inventing an attribution to get past a gate. **No DEFAULT on `role`** — a default designates a member BY OMISSION, which is clause 4's authored act happening without an act; CASE-2 makes it required at the door where a refusal can name what is missing. No `member_edition` (a hash identifies a version; a stored edition beside it is a second way to say one thing and the two eventually disagree). No index on `cases(project_id)` — that is clause 6's query and belongs in the commit that brings its reader (REC-69's class). **Purge: EXEMPT, with the condition that reverses it stated at the site** — if a later item lets a case exist as a DRAFT before publication, revisit, because draft data surviving a purge is D-113 pointed the other way. Placed beside its siblings in `schema.mjs` rather than at the tail, since the tail is where every concurrent schema addition also lands. Battery 164/164 → **165/165 · 10,139** on its branch; `--strict` exit 0 unpiped; UI harness exit 0. **IC-63 filed, measured impact ZERO** — the single hand-maintained reader names four fields, none of which move; everything else is a built copy DIST regenerates. NCs 5 arms + baseline, each armed ALONE with per-arm uniquely-named pristine copies verified by content AND sha256: **arm (c) — LEFT JOIN → inner — is the instructive one, declared BEFORE the run and confirmed: block 1 entirely GREEN and block 2 red, because over an EMPTY store the two joins answer identically and only a real published case sees published material being deleted from the index.** Arm (d) over-strictness (`role NOT NULL DEFAULT 'supporting'`) left the ratify path SUCCEEDING with the member designated by nobody — corrected after its first run because it also deleted a comment another block greps, dragging an unrelated assertion down; recorded, not smoothed. **On the blind-by-construction class: block 3's expectation is PARSED OUT OF `CASE-AS-PRODUCTION.md` at run time** — a document written before this schema and one the worker may not edit — and it looks in `docs/development/` AND `docs/archive/`, because CASE-6 archives that file. **TWO WRONG NUMBERS WERE PRODUCED AND BOTH WERE CAUGHT BY RE-MEASURING:** a backgrounded `battery | tail -25` reported exit 0 while the battery exited 2 — **the pipeline's status is `tail`'s, which is `CLAUDE.md`'s recorded trap arriving on a different command** — and both hidden failures were the worker's own RATCHETS (a `NEGATIVE CONTROL:` block sitting after the exit call, pushed out of the 400-char tail the rule reads; and `owed-controls` A13b catching a declaration the register could not classify because its first list item read `(baseline)` where `OPENS_ITEM` accepts at most two letters). **STATED LIMIT, not dressed up: `project_id NOT NULL` is NOT driven through an op** — nothing writes `cases` until CASE-2 — so it is pinned structurally and the suite header says so. **CASE-2's first arm should be a project-less publish refused BY NAME.** Note carried for CASE-5, not acted on: `published_cases` is now unambiguously the EDITIONS table under a name that says "published", and CASE-5 is the natural place to rename it.

### CASE-2 · done
milestone: M10
interface: I3 via the IC protocol
depends-on: CASE-1
scope: **Design doc is the authority.** Publication as the project's production: `publishCase` takes the publishing project; owner-only fence; **the bar read from THAT PROJECT ALONE at act time**; ≥1 load-bearing member; load-bearing members' derived strength ≥ bar; supporting members exempt and MARKED; ceremony unchanged. **Removes DEC-17's strictest-across-citers composition and the project-less publication path — suites CORRECTED, never exempted.** Carries D-280's composed read, which becomes MOOT rather than wrong (see its row below).
accepts-when: as the design doc's CASE-2 bullet; the IC filed.
added: 2026-08-10 · CONDUCT
landed: `ce2fe34`/`b573e13`, merged on `main`. `op=publish` takes `project` and `roles`; owner-only fence via Membership v2's own `#isProjectOwner` (no admin bypass); **the bar read ONCE from the publishing project at act time**; ≥1 load-bearing member; **supporting members exempt and MARKED in the signed bytes** (`case_project`, `case_roles`, the whole partition in every member). `cases` and `role` are committed by the RATIFY committer out of the signed bytes, so CASE-1's `purge` exemption is undisturbed and `purge` is untouched; **`schema.mjs` not touched at all**, which is what kept this disjoint from CASE-3. **THE REMOVAL IS PROVED BY ABSENCE OFF THE SOURCE, NOT BY THE OP GOING QUIET:** `#requiredStrengthFor` is GONE with DEC-17's strictest-across-citers composition and the group default AS A PUBLICATION BAR — **DEC-17's group-default half STANDS and the `group=` arm now says `seeds_new_projects`** — and arm (G) restores the composition and is caught ONLY by those absence arms. **Two ratchets moved DOWNWARD and both were re-derived rather than adjusted** (D-267's caller pin 6→5, REC-66's class 31→30), measured by running each suite's own walk over `HEAD` and the working tree and `comm`-ing the rosters: exactly one departure, no arrival. Battery 165/165 → **166/166 · 10,240** on its branch; `--strict` exit 0 unpiped; UI harness exit 0. NCs 8 arms, 0 not-as-declared, each armed ALONE — **(D) the bar comparison and (E) the exemption are THE PAIR, failing in opposite directions**, which is the item's whole shape. **THREE DECLARATIONS CAME BACK WRONG AND THE ARMS WERE RIGHT EACH TIME, and the cause is worth carrying: an arm that turns a REFUSAL INTO A SUCCESS moves the record, so removal-arms CASCADE — under (D) the cascade destroyed §5's acceptance arm, the one arm distinguishing a working gate from a WALL.** Fixed at the FIXTURE (dedicated members per removal-arm), not at the declaration. Two arms crashed instead of failing by name, and **a crash names nothing**, so three sections now read defensively. **A finding reported, not fixed, and measured as PRE-EXISTING:** `op=promote` does not re-run C-2.8's `published` entry requirements on an already-`published` document — reproduced on `case_scope` (required since REC-44), so it predates this item; `op=ratify` does run the catalog and refuses, so the plane is closed. **The one genuine ambiguity was DECIDED FROM THE AUTHORITY rather than returned:** whether the group default still backs a publication is answered verbatim by the supersession table (*group default as a publication bar — Removed*).

### CASE-3 · done
milestone: M10
interface: I3/I5 as the design doc requires
depends-on: CASE-1. **PARALLEL WITH CASE-2 BY DEPENDENCY AND CONTENDING WITH IT ON GROUND — see the sequencing note under the CASE heading.**
scope: **Design doc is the authority.** Version pinning: members frozen by version hash on the finding's existing version chain; an edit touching a published version mints a NEW version; **the pinned version is never mutated.**
accepts-when: as the design doc's CASE-3 bullet.
added: 2026-08-10 · CONDUCT
landed: `e8f6c85`/`0cb02cc`, merged on `main`. **CLAUSE 3 HAD TWO HALVES AND THEY WERE DIFFERENT SHAPES OF MISSING.** (1) **The pin was never written** — CASE-1 landed `published_case_members.version_sha` and NOTHING FILLED IT, so a published case named its members and froze nothing. `publish()` now writes it from the ratifying member's own signed `bundle_sha`, and **each member pins its OWN row at its OWN ratification**, because the roster is written by whichever member ratifies first, when the others have signed nothing — writing all N pins there would mean inventing N−1. (2) **The door that moves a finding's claims was standing open**: `#moveVersionState` had no published-state guard while BOTH its neighbours already refused exactly this, and `PUBLISHED_CANNOT_RESTRUCTURE`'s wording describes the version door precisely. New `PUBLISHED_CANNOT_MOVE_VERSION` (C-25.34) in the EXISTING `VERSION_ACT_CHECKS` — no new family, avoiding C-22's floor tax. **The fence is `to !== null` and that line is the CATALOG'S OWN (`VERSION_ACT_TO`), not the worker's judgement**: `hide` (a prune D-214 rules never deletes) and `current` (a project's stance) stay outside. **NO SCHEMA CHANGE AT ALL**, which also removed any collision risk with CASE-2. **THE PROOF IS DRIVEN THROUGH THE ANONYMOUS OP:** publish edition 1, reopen the finding, move the reading (now permitted), republish as edition 2, then re-read EDITION 1 through `op=publishedcase` and assert its `version_sha`, `bundle_sha`, `sig_armored` and `ratified_at` are unchanged and that its pin names edition 1's hash and NOT edition 2's — with the expected hash taken from the sha fed to `ssh-keygen -Y sign` BEFORE ratification, so the two sides of every pin assertion share no code path. Battery 165/165 → **166/166 · 10,193**; `--strict` exit 0 read unpiped. NCs 7 arms armed ALONE. **ARM (f) EXISTS BECAUSE ARM (b) MEASURED SOMETHING OTHER THAN WHAT IT WAS WRITTEN TO MEASURE, AND BOTH ARE KEPT** — removing the write-once predicate reddened only the STRUCTURAL assertion, and the reason is a fact about the plane rather than about the arm: the pin UPDATE is keyed `(case_id, EDITION, bundle_id)`, so a later edition writes a later edition's row and can NEVER reach edition 1's, and `EDITION_EXISTS` refuses a second sha long before the pin write. **The predicate is genuinely unreachable — claimed in words at the site and now MEASURED rather than argued** — so (f) mutates the pin by the route that IS reachable and fails exactly the two assertions saying the pin did not move. Over-strictness arm (d) widened the fence to all six acts and went red, keeping `hide` and `current` outside. **Two superseded assertions CORRECTED, never exempted** — CASE-1's `version_sha is NULL` (now the pin) and `versionstate`'s registry-equality floor, which caught the new code immediately and was working as designed; CASE-1's control driver re-run, all five arms still red. UI floors moved with **1/3/1/2 of the movement measured as PRE-EXISTING SLACK rather than this item's**, established by reverting `bio-checks.mjs` to HEAD. **HANDED TO CASE-5, and it is the pin's whole point: resolving a member BY THE PIN instead of by the case's edition number is NOT done.** Today `version_sha` and the served `bundle_sha` agree only because a member's edition is still slaved to its case's; **CASE-5 is where they can diverge and where the pin starts doing work no other column can.**

### CASE-4 · done
milestone: M10
interface: I3/I5; State Rules amendment
depends-on: CASE-2, CASE-3
scope: **Design doc is the authority.** Lifecycle and the revision flag: `published` REMOVED from the inquiry state machine; containing cases FLAGGED when a member finding revises; **flags set-but-never-clear until each owning project acts.** The precondition survives as *only a CONCLUDED finding may be a case member*.
accepts-when: as the design doc's CASE-4 bullet.
added: 2026-08-10 · CONDUCT
landed: `3f6b886`, merged on `main`. **THE PRECONDITION AND THE STATE WERE ONE ARRAY ENTRY CARRYING TWO RULES, and that is the whole item.** `concluded -> published` said BOTH *publication moves the state* (which DEC-72 deletes) and *publication is reachable from `concluded` and nowhere else* (which DEC-72 does NOT). **Delete the entry and `legalFrom.includes("published")` is false from EVERY state — a gate that reads as refusing everything and has in fact stopped asking.** `publishCase()` now carries `NOT_CONCLUDED` as its own named refusal, and block 2 proves both halves in one place: the edge is gone from the catalog's own table AND an open inquiry is still refused, by name, through `op=publish`. **FOUR MORE RULES RODE ON THAT SAME TABLE AND WOULD HAVE DIED SILENTLY — every one found by RUNNING the suites, not by reading:** `op=dispose` let a published case become deferrable (**D-79 reversed by a lifecycle change**, now `PUBLISHED_CANNOT_BE_SET_DOWN`); `op=publish` accepted a second edition of bytes nobody revised, and **C-21.1 did NOT catch it because it only compares against a RATIFIED prior** (now `ALREADY_A_CASE_MEMBER`); `inquirydivide`'s affordance was offered where the op refuses (DEC-8); and `checkCompletenessFreshness` would have returned on every document, **letting an edition reprint the last one's limits with the catalog silent.** **THE PIN DIVERGENCE IS REUSED AND NO SECOND MECHANISM WAS BUILT:** `#caseRelationOf` asks CASE-5's own question from the member's side — is this finding's CURRENT `bundle_sha` the `version_sha` some roster froze? — so **the relation and the flag are ONE comparison over ONE column read two ways**, and a marker in the bytes would have been a second authority for a fact the pin already holds. The flag is raised in `promote()`, the one write that mints a version, so every revision route is caught at one call site. **A LIMIT MEASURED AND STATED RATHER THAN PAPERED OVER: a case with several owning projects is NOT REPRESENTABLE** — `cases` is keyed on `case_id` alone (CASE-1) and `FINDING_IN_ANOTHER_CASE` still refuses a finding into a second case — so block 7 proves the scoping on the shape the store CAN build (two cases, two owning projects, one project acting) and the suite says plainly that this is the measurable shape, not the one the brief described. NCs 7 arms + baseline, each armed ALONE. **TWO CAME BACK NOT AS DECLARED AND BOTH CORRECTIONS ARE THE USEFUL HALF:** (b2) ran GREEN first time because of the FIXTURE'S ORDERING rather than the plane — the second project revised AFTER the first acted, so an unscoped discharge had nothing to over-reach; **an instrument limit, and the THIRD of that exact shape after CASE-3's (f) and CASE-5's (c)**. And (d) killed the fixture and produced NO TALLY AT ALL, **because a bare `throw` names nothing** — the fixture now reports through `bail()` and (d2) was added beside it to reach the over-strictness question (d) never gets to. **IC-69 filed before any code; impact NOT zero** — `civicos-ui/` held a HAND COPY of the machine this item changed, and its own harness caught it. **THE WORKER DID SOMETHING ITS CLAIM SAID IT WOULD NOT, AND REPORTED IT PLAINLY:** the UI harness went red and a delegation cannot carry a red gate, so it corrected three mirror sites and recorded a CLAIMS amendment — **and its FIRST correction was WRONG** (deleting `PHASE.published` turned three more suites red, and they were right: the UI is a READER of bytes already signed), reverted whole and replaced. **CASE-5b's wall was NOT walked into:** nothing here commits a case fact from an unsigned request — the flag is two hashes this plane already holds, compared, and the discharge is a RATIFIED edition, an act that already exists and is already signed. It deliberately did not mint an acknowledgement op, which would have been exactly that attribution class.

### CASE-5 · done — **PARTIAL BY DESIGN; the remaining half is CASE-5b below, and this row names it rather than absorbing it**
milestone: M10
interface: I3 via the IC protocol
depends-on: CASE-2, CASE-3
scope: **Design doc is the authority.** The artifact flip: case-side freezing; **finding bytes stop naming a case**; `op=verify` / `op=publishedcase` / `op=publishedmanifest` read the case artifact; **the stranger-verification path proven END TO END** — that property is REC-44's and must be preserved case-side, not dropped with it; checks corrected never exempted.
accepts-when: as the design doc's CASE-5 bullet; a stranger holding published material verifies WITHOUT contacting the instance, driven.
added: 2026-08-10 · CONDUCT
landed: `e3cbc94`, merged on `main`. **THE MEMBER'S EDITION IS UNSLAVED FROM THE CASE'S, and the item's first act was to MEASURE that they could not diverge on any path.** `op=publish` stamped the case's edition into every member and `op=ratify` committed it, so a member's edition WAS its case's by construction — **which is what "one case per finding baked into the FORMAT" actually meant: a finding published at edition 1 could not join a second case, because that case's edition 1 demanded bytes at a number the finding had already spent, and `EDITION_EXISTS` refused it.** So the flip is a FORMAT change first and the pin resolution is what it enables. Each member now stamps its OWN next edition off its own published chain, with the case's number travelling beside it as `case_edition:`, both inside the signed bytes and both read at ratification out of the signed document and nothing else. `#caseEditionState` resolves a member BY ITS PIN (`bundle_sha = version_sha`), with the old case-edition predicate surviving ONLY as the honest fallback for a pre-CASE-3 roster row whose pin is NULL. **FOUR MORE SITES CARRIED THE SAME CONFLATION THROUGH AN ARGUMENT LIST RATHER THAN A WHERE CLAUSE** — found by asking which callers of `#caseOf(bundleId, edition)` held a `published_bundles` row — and **`publishedEditions` was the worst: a finding at its own edition 1 inside a case at edition 3 was answered with EDITION 1's scope, completeness and bias acknowledgement.** Case-side freezing: `published_cases` gains `bar` as an additive COLUMN (no new table, so `purge` is untouched and D-113 does not bite), committed from the signed bytes under the existing `CASE_ASSERTION_DIVERGED` refusal. Container to `bio-case-container/4`, and **it had been writing the CASE's edition number onto every member — a false statement in the one artifact nobody can check against us**; `findings[].signature.statement` was a `Uint8Array` that `JSON.stringify` rendered as an object of byte indices, so the artifact told a stranger to verify over a statement printed as 47 numbered integers (zero consumers measured; corrected to ASCII). **THE STRANGER DRIVE IS REAL RATHER THAN NOMINAL: phase B REPLACES `mf.dispatchFetch` WITH A THROW** — the instance is unreachable, not merely uncalled — and every signature verifies under `ssh-keygen -Y verify` against the key the artifact names, over a statement rebuilt from the artifact's own id and hash; **one flipped byte fails all three checks while the untouched copy still passes, so the verification is not vacuous.** Battery 167/167 → **168/168 · 10,334** on its branch; `--strict` exit 0 unpiped; UI harness exit 0. NCs 6 arms + baseline, each armed ALONE. **ONE ARM CAME BACK NOT AS DECLARED AND THE CORRECTION IS WORTH MORE THAN THE ARM:** the over-strictness arm was "require a pin on every roster row", predicted RED and ran GREEN — **because this fixture writes no unpinned row. That is an INSTRUMENT LIMIT, not a defence that held**, and it is kept as arm (f) carrying that measurement while (c) was rewritten as the over-strictness question this fixture can actually answer. Arms (a) and (c) fail on the SAME 22 assertions, **verified by DIFFING THE FAILURE SETS rather than inferred from equal tallies** — different causes, one effect. Blind-by-construction avoided three ways: pins taken from the pre-ratification signing sha, block 6 parsed out of the design doc at run time (looked for in `docs/development/` AND `docs/archive/`, because CASE-6 archives it), and signatures checked by an external binary sharing no code path with `src/`. **IC-66 filed BEFORE any code with impact that is NOT zero** — one file, one function, three lines: `civicos-ui/app.html`'s `pubIndex` joins a roster row on the CASE's edition while `byId` is keyed on the finding's own, so **a diverged member MISSES SILENTLY — awaiting ratification forever, blank pair, blank bar, and listed a second time as in no case.** Enqueued as **UI-56**. Three superseded assertions corrected with dated reasons; `publishedcase`'s UI-35 arm corrected by NAMING `bar`/`bar_detail` as unread with reasons and pointing at CASE-6, never exempted.
**WHAT THIS ROW DID NOT DO, AND WHY IT IS NOT A SHORTFALL: FINDING BYTES STILL NAME A CASE.** `case_id`, `case_findings`, `case_roles`, `case_scope`, `bias_acknowledgement` and `required_strength` remain stamped in every member. The half that was load-bearing ON THE FORMAT — the edition conflation — is removed; the rest stopped at a doctrinal wall that is MEASURED rather than judged. **Every case fact this plane commits is committed from the SIGNED BYTES and from nothing else** (`#publishEdges`' doctrine, restated at seven sites in `publish()`), **and there is no signature over a case for those facts to move to** — the container manifest says so in its own words: *a case-level signature would be a signature over something nobody reviewed.* Removing them without first minting a case-level signing ceremony would leave the plane committing a group's case assertions **from an UNSIGNED REQUEST**, which is the attribution class this record refuses everywhere else. **`caseflip.test.mjs` ASSERTS THAT THE BYTES STILL CARRY THOSE KEYS, so "still there" is distinguishable from "nobody checked"** — which is the difference between a stated limit and a silent one. Multi-case membership stays REFUSED and the refusal is DRIVEN, so its state is pinned: the flip makes it representable, and lifting the fence is a surface question that belongs with CASE-6.

### FL-10 · done — **RAN BY FLEET as assigned; landed `3607b3b` (+ the floor-move commit beside it) on 2026-09-10, with the RELEASED block and acceptance evidence in the CLAIMS register. THE ROW SAT `queued` FOR FOUR DAYS AFTER THE WORK LANDED — the fifth arrival of the note-is-not-an-item class, this time as a handoff line in a CLAIMS release note, which nothing drains; it cost a >3h false stall and a reconciliation re-drive before FLEET's evidence reached this row through BOB. The rule that came out of it is now IN THE LOOP FILES (CONDUCT.md's integration step, WORKER.md): a release note may not carry an owed act — an owed act is a ROW or an INBOX/DELEGATION entry, or it does not exist. Since landing, the guard has worked in production twice: it FORCED DS-3's manifest refresh and correctly PASSED `f5872c7`. IC-70 resolved 2026-09-10 (I4 1.1.0, `a48fba9`); IC-79 — the guard's assets extension — resolved 2026-09-14 (I4 1.2.0).**
milestone: M7
interface: I4 + I6 — **IC-70 is PRE-MINTED for it**, so FLEET does not mint an id in a worktree that cannot see a parallel worker's file (the IC-64 lesson: on 2026-08-10 two parallel workers each minted `IC-64` because `mintid` reads its floor from ids mentioned in PROSE, and each was RIGHT about the corpus it could read)
depends-on: FL-9 (landed). **D-298's RELEASE half is DIST's and waits on this; the format/installer half does not.**
scope: **D-298 — DIST measured the MIRROR of FL-9's defect: the plane's committed bundle is 114 COMMITS STALE against `src`, and the battery cannot tell.** The reason generalises and is why this is worth an item: **the battery proves the artifact WORKS, never that it MATCHES its source.** A suite that boots a stale bundle and gets correct answers is reporting on a build nobody ships from. Extend FL-9's guard to `bio-plane`'s own bundle: byte-identity with a fresh build, the prove-it-can-fail arm, **a stale artifact FAILS instead of shipping.** Routed to FLEET under the standing delegation as a SCOPING call rather than doctrine — **the guard discipline is FLEET's wherever a committed bundle exists, the plane's included.**
**REUSE FL-9's LIBRARY, DO NOT WRITE A SECOND ONE** (`bio-plane/scripts/fleet-bundle.mjs` is one expression of the recipe and one of the check). **AND CARRY ITS TWO MEASURED SURPRISES, because neither is obvious and both cost the first worker real time:** (1) **`esbuild` writes input paths relative to the process cwd** — identical source built from two directories differed by **30 bytes**, a FALSE STALE; pin `absWorkingDir` and record it. (2) **`esbuild` TREE-SHAKES an unused export out of a non-entry module, so byte-identity ALONE passed a real committed-source change** — comment-only edits are invisible to it too — **so the dependency-free INPUT-HASH arm is load-bearing and not a fallback.** A plane-bundle guard built on byte-identity alone would repeat a defect this estate has already measured and written down.
claim: **PRECISELY, and this is not boilerplate — a CASE-4 worker may still be live on RECORD's ground.** Name the guard suite and the build script; **NEVER `store.mjs` or `schema.mjs`.** If the work seems to need them, that is a finding to report, not a path to claim.
accepts-when: a fresh build of `bio-plane`'s source is byte-identical to its committed bundle, asserted; **a deliberately stale committed bundle FAILS the gate**; the guard proves it can fail on an unarmed run, as FL-9's does; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) **the arm this item exists for**: edit `bio-plane/src` without rebuilding and the gate must FAIL naming it; (2) **the tree-shake arm** — remove an unused export from a NON-ENTRY module, which byte-identity alone will MISS, and the input-hash arm must still fail; (3) over-strictness — a legitimately rebuilt byte-identical bundle must still pass, and a docs-only change must not fail the build.
added: 2026-09-10 · CONDUCT (draining the 2026-09-10 BOB INBOX entry as an ITEM. **Minted rather than deferred to CONDUCT #9**: the entry said either was fine and losing it was not, and a mint is a bounded act while a handoff note is a promise. **Not spawned** — FLEET is a standing area session now and this is its ground.)

### FL-9 · done
milestone: M7
interface: I4 + I6 — the release format gains a per-member artifact; file **IC-68** with measured consumer impact before building
depends-on: none. **DIST's release-format half and D-297 WAIT ON THIS; the CASE arc does not** — which is why it takes a slot beside CASE-4 rather than queuing behind it.
scope: **THE PER-MEMBER FLEET BUILD STEP, ON THE GUARD PATTERN — Bob's answer to DIST's delegation, 2026-09-10, decided under the standing delegation as MECHANISM resting on the estate's own precedent rather than as doctrine.** The problem DIST measured: `newgroup` is a Worker, it cannot run wrangler or bundle, so an installable fleet needs one bundled, hashed, signed artifact PER MEMBER. **The build: a COMMITTED per-member bundle whose gate asserts it is BYTE-IDENTICAL to a fresh build of its source — a STALE ARTIFACT FAILS INSTEAD OF SHIPPING.** **This does NOT reverse FLEET's anti-drift ruling; it answers that ruling's own objection with the instrument this record always reaches for** — the embedded-gate precedent (a hash-verified copy of exact bytes, never a second codebase) and `check-versions`' own shape. **The multi-part alternative — a signature over a SET — is REFUSED**, because it complicates the one-asset-one-hash release model DIST's signing rests on; do not re-open it, and if the build makes that refusal expensive, report it rather than routing around it. **SCOPE COVERS `pdf-worker` TOO — DIST measured it missing the same guard**, so this is two members, not one, and a fix that guards only the new member leaves the older one exactly as it was.
accepts-when: a fresh build of each member's source is byte-identical to its committed bundle, asserted; **a DELIBERATELY STALE committed bundle FAILS the gate** rather than shipping; both members covered; `newgroup` can install from the committed artifacts without bundling; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) **the arm this item exists for**: edit a member's SOURCE without rebuilding its bundle and the gate must FAIL naming the member — a guard that passes a stale artifact is the defect wearing the costume of a guard; (2) the same arm on `pdf-worker` specifically, since it is the member that was already missing this and a one-member fix would pass arm (1) while leaving it open; (3) over-strictness — a legitimately rebuilt, byte-identical bundle must still pass, and an unrelated docs-only change must not fail the build.
added: 2026-09-10 · CONDUCT (draining the 2026-09-10 BOB INBOX entry as an ITEM — a note is not an item, the rule this queue has had to learn four times)
landed: `d83695b`/`debee98`, merged on `main`. **ONE expression of the recipe and ONE of the check** in `bio-plane/scripts/fleet-bundle.mjs`, with both build scripts and the gate as its callers — placed in the plane's `scripts/` because `esbuild` is only installed there. **THE GUARD'S TWO SIDES ARE KEPT INDEPENDENT THREE WAYS, which is what stops it agreeing with itself for free:** the committed artifact is READ FROM DISK before any build runs and verification builds with `write:false`, so the verify path cannot touch the tree; the expectation comes from the SOURCE FILES, not the artifact; and **the suite PROVES ITS OWN GUARD CAN FAIL ON EVERY RUN, UNARMED** — it builds a synthetic member in a temp dir, verifies green, moves one byte, requires RED naming the member and the file, restores (content + sha256), requires green. **TWO MEASUREMENTS CHANGED THE DESIGN AND NEITHER WAS PREDICTED.** (1) **`esbuild` writes input paths relative to the process cwd**, so identical `pdf-worker` source built from `pdf-worker/` versus `bio-plane/` differs by **30 bytes** — a FALSE STALE, and it was the worker's first measurement; `absWorkingDir` is now pinned, recorded in the manifest and asserted. (2) **`esbuild` TREE-SHAKES an unused export out of a non-entry module, so byte-identity alone PASSED a real committed-source change** — and comment-only changes are invisible to it too. **So the dependency-free INPUT-HASH arm is the load-bearing one and not a fallback**, asserted against both real members every run. **`pdf-worker`'s committed bundle was NOT stale** (byte-identical, 2,427,807 B) — **no deploy is owed** — and a third finding: **three of its six build inputs live in `bio-plane/src/`, so a PLANE change stales a FLEET member's artifact**; hashed in the manifest and driven. Both members proved SEPARATELY, and arm 2 re-run with `pdf-worker/node_modules` renamed away (the fresh-checkout condition): the byte arm SKIPPED BY NAME while the input-hash arm STILL FAILED — **a guard that skips is not a guard, and this one says so out loud.** The suite lives in the PLANE's test directory for that reason: `battery.mjs` skips a member's own suites when that member has no `node_modules`. NCs 8 arms + baseline, each armed ALONE. **THE REFUSED MULTI-PART ALTERNATIVE COST NOTHING, stated either way as asked:** both members bundle to ONE file — `agent-worker`'s with ZERO import specifiers, `pdf-worker`'s with only `node:*` — and both BOOT UNDER WORKERD from a single part and answer `GET /version`, driven under miniflare rather than argued. Floors moved and BOTH reported by name: `REGISTER_FLOOR` 858→868/163/164, and **`FLEET_FLOOR.arms` 48→58 — which this item did NOT invalidate**, having added no fleet member, suite or arm: the fleet's five suites already stated 58, so that was ten arms of PRE-EXISTING SLACK. `hygiene`'s walk census caught the new repo-root walk on the first battery and it was GUARDED rather than named, because its count feeds a floor. **IC-68 filed BEFORE building**, opening every reader of `fleet-member.json` by name (five programs, four suites; none enumerates keys, so `bundle` is additive IN FACT) and naming the `main` move as the only behavioural change with its reason — two recipes for one artifact is the defect being closed. **DELEGATION → DIST:** `tools/deploy-fleet.mjs`'s header argues from the reversed ruling and is now stale (the tool still works — verified to the token gate, no network call); the per-member assets exist and are hash-stable, and the release format is DIST's (D-297).

### CASE-5b · done
milestone: M10
interface: I3 + I5 via the IC protocol — a new signing ceremony is a new act surface; **IC-71 (pre-minted at spawn)**; file the IC before building
depends-on: CASE-5 (landed). **BLOCKS CASE-6's design-doc archive — see the note on CASE-6.**
scope: **THE REMAINING HALF OF CASE-5's BULLET, split out rather than folded in, because it is larger than the rest of CASE-5 combined and lands on different ground.** Finding bytes must stop naming a case — `case_id`, `case_findings`, `case_roles`, `case_scope`, `bias_acknowledgement`, `required_strength`. **THE BLOCKER IS DOCTRINAL AND MEASURED, NOT A MISSING FUNCTION:** every case fact this plane commits is committed FROM THE SIGNED BYTES AND FROM NOTHING ELSE (`#publishEdges`' doctrine, restated at seven sites in `publish()`), **and there is no signature over a case for those facts to move to.** Removing them first would leave the plane committing a group's case assertions from an UNSIGNED REQUEST — the attribution class this record refuses everywhere else. **So this item is a CASE-LEVEL SIGNING CEREMONY first and a deletion second:** a case document, its gate, its checks, its ratify path. The container manifest already states the constraint that governs the design — *a case-level signature would be a signature over something nobody reviewed* — so whatever is signed must be a thing a member actually reviewed, not a synthesised summary of the roster.
accepts-when: a case's own assertions are committed from bytes A MEMBER SIGNED, driven through the op; the six keys are gone from finding bytes and `caseflip.test.mjs`'s still-there assertions are CORRECTED (never exempted) to say so; the stranger-verification path still passes end to end with the instance unreachable.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) **the arm this item exists for**: commit a case assertion from an unsigned request and it must be REFUSED by name; (2) strip the six keys WITHOUT the ceremony and the unsigned-commit arm must fail — proving the ceremony is the precondition and not decoration; (3) over-strictness — a legitimately signed case must still publish, and a single-finding case (DEC-44, not superseded) must stay legal.
added: 2026-09-10 · CONDUCT (CASE-5's raise, enqueued as its own row on the worker's own recommendation — **it recommended against folding this into CASE-4 or CASE-6, both of which land on different ground**, and against half-building it)
landed: `0f628e9`, merged on `main` at `ac2941e`. **THE CEREMONY FIRST, THE DELETION SECOND, AS THE ROW ORDERED.** `op=publish` now AUTHORS a case document and commits nothing case-side; `op=casedocument` reads it whole; `op=caseratify` verifies an SSHSIG (statement `bio-ratify-case <case_id> <edition> <docSha>` — a SEPARATE message space from `ratifyStatement`, domain separation argued at the site, namespace kept so existing signer tooling stays right) and commits `cases`/`published_cases`/`published_case_members` FROM THOSE SIGNED BYTES. What is signed is the publisher's own authored assertions, never a synthesised roster summary — the container manifest's constraint honoured. **All eight keys are gone from finding bytes and C-2.8 REFUSES them there per key, so the absence is a property of the FORMAT**; `caseflip`'s still-there assertions INVERTED with the dated reason, never exempted. Four divergence refusals removed (they noticed N copies of one fact disagreeing; one copy cannot) and `CASE_ASSERTION_DIVERGED` kept but stated OUT LOUD as unreachable rather than left to look load-bearing. Container → `bio-case-container/5`; `checkCompletenessFreshness` deleted with C-21.1 REHOMED to `checkCaseDocument`, asserted by name on both sides of the move. **IC-71 filed before any code and RESOLVED at integration: I3 10.4.0 → 11.0.0 (MAJOR — removed wire strings and a container bump are breaks whatever the measured impact, which is zero UI code), I5 → 1.10.0.** Merged-tree gates: battery **173/173 · 10,753 — closes exactly: 10,680 + the attributed +73, suite for suite** (casesign 54 new, multifinding +7, publish +4, hygiene +3, caseproduction +2, caseflip/caselifecycle/casepin +1); `--strict` exit 0 unpiped, OPS 171/171, CHECKS 249/249, **REGISTER_FLOOR collapsed a FOURTH time in one day and verified by print: 901/167/168**; UI harness exit 0; `mintid --audit` 0 breaks; `dist/**` REBUILT on the merged tree (FL-10's guard). NCs 5 arms + baseline, all as declared after four not-as-declared first runs whose corrections are the useful half — (b)'s first run showed the CASCADE (the lie promoted, ratified, and reached the signed container a stranger verifies), and **the register floor caught the item numbering its own arm wrong** (`(b2)` rejected by `OPENS_ITEM`, two arms silently dropped, the register printed 886/888 and NAMED it). Two stale UI comments DELEGATED to CASE-6; multi-case membership stays REFUSED — CASE-6's question; one minted C id unused, a stated gap. **CASE-6's dependency is now MET.**

### UI-56 · done
milestone: M8
interface: I3 consumption — no shape moves; `bundle_sha` has been on the wire since IC-63
depends-on: CASE-5 (landed)
scope: **IC-66's DELEGATION, and it is a SILENT failure rather than a visible one.** `civicos-ui/app.html`'s `pubIndex` joins a roster row to its ratified row on `bundle_id + "@" + <the CASE's edition>` (~15673, ~15680, ~15701) while `byId` is keyed on the finding's OWN edition. CASE-5 unslaved those two numbers, so **a diverged member MISSES: it reads as awaiting ratification forever, with a blank pair and a blank bar, AND appears a second time in the not-in-any-case list.** Fix is one line each — `version_sha` → `bundle_sha` — and needs no new data. **Measured impact by grep over seven trees, built copies excluded: ONE file, ONE function, THREE lines. Everywhere else zero.**
accepts-when: `node civicos-ui/test/run.mjs` from the REPO ROOT, exit read UNPIPED, 0, with a DIVERGED member (its own edition ≠ its case's) rendering as ratified, with its pair and bar, and appearing exactly ONCE.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) restore the case-edition join and the diverged member must fail NAMING it, appearing as awaiting-ratification AND duplicated in the not-in-any-case list — **a fixture where the two editions AGREE cannot see this defect, so the arm must use a diverged one**; (2) over-strictness — an UNdiverged member must still render exactly as it does today.
added: 2026-09-10 · CONDUCT (IC-66's delegation, enqueued as an ITEM — a delegation in CLAIMS.md is a notice, and a notice is not an item)
landed: `9bd74b7`, merged on `main` at `b834f26`. **FIVE SITES, NOT THREE — and the two the row did not count (the `inCase` set and the not-in-any-case membership test) are exactly what produce the "appears a second time" symptom the row itself names**: a row's own symptom list could not have been closed by its own site count. All five now share one rule behind a `pubMemberKey` helper: **the join is `version_sha` to `bundle_sha` — the PIN — never edition to edition**, which is the plane's own doctrine stated verbatim in `publishedManifest().production`. The row's spelling was RIGHT and CONDUCT's paraphrase ("the member row's own edition") was not implementable — a roster row has no edition of its own; the finding's identity is reachable only through the pin. A NULL pin is a real state: an unpinned legacy member falls back to the case's edition, the pre-CASE-5 world it comes from, and the fixture keeps one standing as the over-strictness subject. **THE MOCK WAS AS WRONG AS THE SURFACE (D-173's class): the suite's `caseMembers` fixture dropped `version_sha` and `role`, two of the six columns the plane selects — the correct join could not have been WRITTEN against it and no assertion could have noticed.** Corrected at the site. Harness 47/47 exit 0 unpiped, `publishedcase` 226→234; battery 170/170 · 10,488 (delta zero, the predicted shape); `--strict` exit 0 unpiped. NCs 4/4 with a baseline row, each armed ALONE, restores by sha256 AND `cmp`: the case-edition join restored → 229/234 with four failures naming the diverged member unjoined/pairless/barless/duplicated — **and 225 of 226 pre-existing assertions stay GREEN, which is the silence the row alleged, now measured**; HEAD's actual pre-item bytes → the identical five; over-strictness → 0 byte-differing undiverged rows. Two instrument errors recorded rather than smoothed: the appears-exactly-once counter first counted badge attributes (subject right, instrument wrong), and a comment claiming the row count was blind was falsified by its own arm and now says so. Class sweep: 446 first-party files, one file/one function/five lines, generated copies excluded; blind spots STATED (joins built without the literal `"@"`, files outside four extensions, consumers outside this repo). The fixture-shape gap it found in `preauth-vocabulary.test.mjs` is **M0-23** below, not a note.

### CASE-6 · done — **AND WITH IT THE CASE ARC: CASE-1..CASE-6 plus CASE-5b, all landed. DEC-72's definition of done was met IN THE LANDING TURN — `BIO_DATAPLANE_STATE.md` at v33 on the case-as-production model, `CASE-AS-PRODUCTION.md` archived with its one unbuilt clause STATED in the banner (D-309), `DECIDED` regenerated.**
milestone: M10
interface: I3 consumption
depends-on: CASE-5 (landed) **AND CASE-5b (landed `ac2941e` — MET 2026-09-10)**. **DEPENDENCY ADDED 2026-09-10 by CONDUCT, and the reason is this row's own closing conditions:** CASE-6's `accepts-when` ARCHIVES `CASE-AS-PRODUCTION.md`, and archiving a design whose CASE-5 bullet is only half implemented would file an unfinished design as finished — the exact shape of a stale document this project keeps paying for. CASE-5b closes that bullet. **The rest of CASE-6 does not depend on it and could run first; the ARCHIVE step cannot.**
scope: **Design doc is the authority.** The surfaces: publication ceremony UI (owner-gated, load-bearing designation AUTHORED, bar shown as the case's property); published case page (bar prominent, per-claim strength beside each finding, **supporting members visibly NOT load-bearing**); multi-case membership on the finding view. **DEC-69 governs every one of these surfaces** — inform at the act once; never nag, re-confirm or force a mode.
accepts-when: as the design doc's CASE-6 bullet — **PLUS THE ARC'S DEFINITION OF DONE, WHICH IS A CONDITION ON THIS ROW AND NOT A MEMORY** (Bob, relayed 2026-08-10). CASE-6 is the closing item, so it does not pass until, **in the same turn it lands**: (1) `docs/BIO_DATAPLANE_STATE.md` is AMENDED to the case-as-production model — not afterwards, not as a follow-up row; (2) `docs/development/CASE-AS-PRODUCTION.md` is ARCHIVED to `docs/archive/`, which `decided.mjs` and `mintid` both still scan, so archiving is not lossy; (3) `node tools/decided.mjs` regenerated and committed. **Written into `accepts-when` deliberately rather than into a handoff note: this session has watched a note-not-an-item failure three times today, and a definition of done carried in prose is the same shape.**
added: 2026-08-10 · CONDUCT (the closing conditions added the same day, from Bob's relayed instruction)
landed: `39005d6`, merged on `main` at `9e738ae` (+ the ratchet fix `715ab23`). **THE PUBLISHED CASE PAGE WAS READING NONE OF FOUR FACTS THE PLANE ALREADY SERVED** (`c.bar`, `c.project`, `f.role`, `c.document` — zero reads each, measured) and drew N identical per-member copies of one fact instead, justified by a comment quoting a rule DEC-72 deleted. Now: the bar drawn ONCE as the case's with its publishing project named beside it, the plane's `bar_detail` printed VERBATIM (the one sentence built to stop "absent bar reads as zero" was reaching no reader), per-finding STRENGTH still per finding, the authored partition rendered with supporting members visibly not load-bearing — and THREE NULLS HELD APART (nobody authored a designation / the accessor sent no roster columns / the bytes are in no case), because reporting the second as "undesignated" would assert an absence of the publisher's intent where only data is absent. Beyond the delegation: the page told a stranger there IS no case-level signature — CASE-5b made that sentence FALSE on the one surface the product exists for; the class was three sites, not the two delegated, and the third was visible text. **THE FENCE DECISION: KEPT, BY COUNT, NOT JUDGEMENT** — 11 sites SELECT `published_case_members` by `bundle_id` (9 scalar, 2 plural, 0 unclassified); the nine are correct ONLY while the fence holds, so lifting it alone converts nine correct answers into nine silent LIMIT-1 guesses. **CASE-5's "surface question" framing is measured WRONG and the correction is recorded** — the plane half is **D-309**, its own item. **D-310** found in passing: `op=affordances` offers `publish` with no owner condition while the store refuses one by name — the DEC-8 disagreement on the heaviest act; must land before DEC-33 reopens. Definition of done: all three conditions IN THE BRANCH, and all four suites reading the design doc had already tried both paths unprompted. NCs 5 arms + baseline, all as declared after two corrections that are the useful half — (b) first ran GREEN WITH THE INFERENCE ARMED (the suite described coverage it did not have) and (d) GREEN WITH THE FENCE NEUTERED (the pin's OR let a different refusal answer for it). Merged-tree gates: battery 173/173 · **10,764 (+4 closing exactly: caseflip +2, planning-hygiene +2)**; `--strict` exit 0 unpiped, floor 906/167/168 UNMOVED; UI harness exit 0 — after CONDUCT fixed the one genuine cross-item ratchet at the cause (M0-24's DEC-17 per-finding-bar assertions, superseded by this item's own DEC-72 surface in the same integration; corrected never exempted, `715ab23`) and re-ran once past D-286's D0b flake, which fired on its exact recorded signature. `CEILING.reachGap` 41→40 was REC-79's own already-written sentence, the number finally moved with it.

### D-309 · done
milestone: M10 — the CASE arc's plane residue
interface: I3 via the IC protocol — a new named refusal for the ambiguous REC-44 derivation is a wire string; file the IC before building
depends-on: CASE-6 (landed — its measurement is this row's ground)
scope: **`DEBT.md`'s D-309 row is the authority.** DEC-72 clause 6 (a finding can serve many cases — Bob: "once resolved, the finding should have lasting value") is built on the surface and refused in the plane by `FINDING_IN_ANOTHER_CASE`. CASE-6 measured WHY the fence must outlive the flip: 11 sites SELECT `published_case_members` by `bundle_id` — 9 SCALAR, 2 PLURAL, 0 unclassified — and the nine are correct ONLY while the fence holds; `#caseOfSha`'s own comment already said "Nothing writes that shape today." The work: each of the nine scalar readers corrected to answer set-valued, EACH CALLER DECIDED INDIVIDUALLY (some want all cases, some want "in this case", a different question they should be asking); a NAMED refusal for the ambiguous REC-44 derivation (a member of case A published with no `caseId` must not silently append to A) — a new DEC-49 code with its canned translation and floor; the fence removed LAST. The surface half is ALREADY BUILT as a list correct for any n and does not move.
accepts-when: a finding published into two cases is representable end to end, driven through the ops; each of the nine former scalar sites either set-valued or asking the in-this-case question EXPLICITLY, named one by one against CASE-6's count; the ambiguous no-caseId publish REFUSED by the new name; the stranger-verification path green for a two-case member; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0 (the new refusal carries its control-plane assertion in the same turn); `node civicos-ui/test/run.mjs` from the repo root, unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) the arm this item exists for: re-scalar ONE former site (a LIMIT-1 over the set) and something must FAIL naming it — a second membership silently dropped is the overclaim class; (2) the ambiguous derivation allowed to default into case A must fail BY THE NEW NAME; (3) over-strictness — a single-case finding, and DEC-44's single-finding case, must both still publish exactly as today.
added: 2026-09-10 · CONDUCT (CASE-6's measured residue, enqueued as its own item — the row's own disposition says CASE-6 deliberately did not half-build it)
landed: `d720333`, merged on `main` at `dad57cd`. **DEC-72 CLAUSE 6 STOPS BEING REFUSED — a finding can serve many cases, and the fence came out LAST, exactly as ordered.** The nine scalar sites each decided AT ITS OWN SITE: `belongs` → ALL; ratify's `rel` → ALL as a loop (three consequences hung off it); `publishedCase` by finding id → REFUSE `CASE_IDENTITY_AMBIGUOUS` (C-44.1, new DEC-49 family) naming candidates rather than deciding on the reader's behalf; `#caseClaimsOf`/`#casesOf`/`#casesOfSha` → ALL, with `#casesOf` DISTINCT BY CASE so two editions of one case are not falsely set-valued; the loose arm now asks "in NO case" explicitly. The two plural sites untouched. **NC (a) came back NOT AS DECLARED and is the most useful result of the item: re-scalaring `#casesOfSha` leaves the BEHAVIOUR suite wholly green (58/0) — a finding joins a second case at a NEW version, so each case pins a different sha and a LIMIT-1 over one row is indistinguishable from the truth. That is CASE-6's "no refusal, no flag, no way for a reader to tell", MEASURED — and the argument for the shipped census (18 sites, 2 named), which fails naming the site.** NC (c) is the measurement behind the refusal's line at MORE THAN ONE candidate (the stricter reading killed two suites' fixtures and cost nine assertions elsewhere). Merged-tree gates: battery **174/174 · 10,804 — closes exactly: 10,779 + 25 (multicase 20 new, caseflip +4, hygiene +1)**; `--strict` exit 0 unpiped, floor **909/168/169** verified by print; UI harness exit 0, no flake; `mintid --audit` 0 breaks; `dist/**` rebuilt on the merged tree. **Seventh consecutive item to find floors already stale, measured against a pristine-tree run: most of the twelve `check-refusal-codes` floor moves were PRE-EXISTING SLACK, not the item's** (census 28 low, rows/reach 8, regionLines 83). A ceiling ROSE with the reasoning at the site (`meaning-bounds` bare roster 39→40 — bounding the scan would let the refusal name two cases when the record holds five). IC-74 filed before any code, UI impact measured ZERO (`pubOtherCasesHtml` already correct for any n). A case with several OWNING projects stays unrepresentable, deliberately. Instrument catches kept: the old fence arm never reached the code it tested; `op=publishedcase` never plumbed the resolution aid; the worker's own census caught its own comment, then `op-claims` caught the correction.

### D-310 · done
milestone: M10 — **should land BEFORE DEC-33 reopens** (the row's own disposition)
interface: I3 via the IC protocol — the SET of acts `op=affordances` publishes is something consumers build against; narrowing it for a class of callers is a behaviour change whether or not a field moves. File the IC before building.
depends-on: CASE-6 (landed — the finding is its)
scope: **`DEBT.md`'s D-310 row is the authority.** `op=affordances` offers `publish` on a concluded inquiry with NO owner condition while `publishCase()` refuses a non-owner BY NAME (DEC-72 clause 5) — the DEC-8 disagreement `affordances.mjs`'s own header calls the one thing it exists to prevent, on the heaviest act in the system. The work: one fact on `#affordanceFacts` (the `case_member` pattern exactly — a FACT, never a rule), the `applies` predicate consuming it, the IC row with measured consumer impact — **and the seven roster acts DECIDED, not skipped: whether they move onto the same mechanism or stay stated-as-store-enforced, with the reasoning at the table**, because gating one act and not those seven is a consequence across the act catalogue.
accepts-when: a non-owner on a concluded inquiry is NOT offered `publish` and an owner still is, driven through `op=affordances`; the store refusal and the affordance answer AGREE, asserted as one property; the seven roster acts' disposition argued at the table; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` from the repo root, unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) the arm this item exists for: re-open the disagreement (offer without the owner fact) and a DEC-8 agreement assertion must FAIL naming both surfaces; (2) over-strictness — an OWNER must never lose the offer, and a machine credential's view must not change (the gate is positional, and machine classes carry no position); (3) DEC-69 — the narrowed answer must not become a nag: the surface states the rule at the act once, never re-confirms.
added: 2026-09-10 · CONDUCT (CASE-6's in-passing finding, enqueued as its own item with the before-DEC-33 deadline carried from the DEBT row)
landed: `ed5796b`, merged on `main`. **ONE FACT, THREE-VALUED, AND `!== false` IS THE WHOLE SHAPE**: `affordanceFacts()` states `project_owner` as true/false/NULL (a machine credential holds no position, is answered null, and does NOT narrow — it is refused publication by a DIFFERENT rule at a different level, and folding two rules into one gate is a fence tighter than its rule). `#ownsAnyProject` asks `#isProjectOwner` — the SAME predicate `publishCase()`'s fence runs — so the owner rule is consumed, never restated; the store-refusal/affordance agreement is asserted as ONE property. **THE SEVEN ROSTER ACTS DECIDED: THEY STAY, argued at their own table and filed as D-311** — publish was already published with an incomplete derivation (an overclaim, which this record ranks above a gap; nothing lies about acts nobody offers); they need a DIFFERENT, per-pair fact; they are seven positions, not one; adding them is a separate I3 change. The machine fence is carried in D-311, deliberately not closed. **IC-75 filed BEFORE any code, and its measured impact found the sharp thing: `publicationEntryHtml` gates the whole publishing section on the act's presence, so CASE-6's owner-rule paragraph DISAPPEARS for exactly the readers it was written for — delegated to UI as its own item, UI-57 below, never edited cross-area.** Merged-tree gates: battery 173/173 · 10,779, **+15 attributed per suite (affordances +8, caseproduction +6, planning-hygiene +1; the worker's fourth suite, mintid +1, had already moved on main with 20bb1cf's own queue-row prose — stated so the two honest counts reconcile)**; `--strict` exit 0 unpiped, floor 906/167/168 UNMOVED at the D-255 property; UI harness exit 0 first run, no flake; `mintid --audit` 0 breaks. NCs 4 arms + baseline, all as declared, two coming back WIDER than declared and recorded (the structural pin also catches fact-deletion; the DEC-69 arm is entangled with the gate); the over-strictness arm is the load-bearing one — `=== true` keeps the headline green while the machine silently loses the act, byte-measured. FL-10's guard fired on the branch (three changed sources staled the committed bundle) and the artifact was rebuilt as the instrument instructs; nothing signed, bumped, or deployed. Instrument catches kept visible: `op-claims` caught the wrong-level claim AGAIN — prose spelling the DO-internal affordance-facts dispatch token as though it were an op (the row's own recorded correction, recommitted and re-caught; and this landed line's first draft made the identical mistake and was caught by the same ratchet at CONDUCT's own gate run, which is the fourth catch of one token in one day); the worker's own IC prose briefly drove the D floor (self-corrected); `meaning-bounds`' BARE ratchet went 40 and back to 39 with the fix AT THE CAUSE (the scan moved into a predicate) and the walk's private-helper blind spot STATED rather than exploited. **The 16 orphaned workerd processes it declared (CASE-5b's completed worktree, PPID 1, idle 2h21m — the D-186 class) were verified idle and killed by CONDUCT at integration; zero remain.**

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

### CPDF-14 · done
milestone: M2 — **measurement-only, run out of band the way COFF-6, CPDF-9 and CPDF-12 were; it gates CPDF-10's whole design**
interface: none — it measures, it does not publish a shape
depends-on: CPDF-12 (done — the renderer, and the probe precedent), CPDF-11 (done — the floor's ground truth and the degradation ladder)
scope: **THE COMPOSED-SHAPE MEASUREMENT CPDF-12's landed line RE-SCOPED ITSELF TO, minted as its own id because the ledger's CPDF-12 slot is spent twice over (the renderer row AND the probe's landed line both answer to it) and a third meaning would be the M-namespace hazard again.** The recorded state, from CPDF-12's landed line, which is the authority: Moondream returned **NO-GO** on the default path on the non-negotiable (coordinates FAIL — 2/24 box-checks, a CONFIDENT box for a figure not on the page; R3 refused 0/3 while MINTING 16–20 digits per run in fluent prose). **The live alternative is the COMPOSED shape — detect → crop → transcribe the crop — which scored 99.62%, 10/10 digits, 0 minted on the one trustworthy region, at n=1: UNPROVEN, NOT REFUTED**, and the ONLY in-account shape that can carry the image-region anchor. Measure it across the corpus: the CPDF-11 ladder rungs, reproducibility across identical bytes (the default path was NOT reproducible — 3 runs, 2 distinct transcriptions), and the invention band (does the composed shape MINT under degradation, which is the finding that killed the default). Same probe discipline as CPDF-12: scratch Worker carrying env.AI, account pinned BEFORE any upload, uploaded/used/DELETED-and-verified-gone, nothing funded, comparability with CPDF-9/CPDF-11 ENFORCED not claimed (import the floor's ground truth; exit if a metric expression moved). **The deliverable is a VERDICT with its reach stated** — GO licenses CPDF-10's in-account placement; NO-GO routes CPDF-10 to the external escalation tier, still unfunded, still Bob's to fund.
accepts-when: a MEASUREMENTS.md row, dated, naming the instrument, the corpus reach (n stated per rung), reproducibility measured over identical bytes, and the verdict — with what the probe CANNOT see stated beside the number; the scratch Worker deleted and verified gone; no version bumped, nothing signed or deployed, the real record untouched.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) the blank/noise controls (ILLEGIBLE, zero non-empty) re-run on the composed shape — an engine that answers on noise disqualifies itself whatever its clean-run score; (2) the comparability guard armed: move a metric expression and the probe must EXIT rather than publish an incomparable figure; (3) over-strictness — a clean high-fidelity page must still pass end to end, so the shape is measured, not sabotaged.
added: 2026-09-10 · CONDUCT (CPDF-12's re-scope enacted as its OWN item at CPDF-13's integration — the re-scope lived only in a landed line for a month, which is a note, and a note is not an item)
landed: `34891f7`, merged on `main`. **VERDICT: NO-GO, AND THE ANCHOR IS WHY — the finding nobody had looked for.** The composed shape exists ONLY because it can carry an image-region anchor, and nobody had asked whether the region is the same region twice: identical page bytes, 3 detect runs, 8 pages — **1/8 pages returned the same box count; 52.6% of run-1 boxes have a counterpart at IoU≥0.5; one page returned 17, 8, 7 boxes at median IoU 0.000. A rectangle that comes back about half the time cannot anchor a claim.** Transcription reproducibility WORSE than the default path (10 of 22 regions gave >1 distinct text across 3 runs on the SAME crop file); the invention band moved DOWN the ladder (R1 minted 7 digits composed where the default minted 0 — cropping does not suppress invention); the ladder is not monotone STRUCTURALLY (detect returns different boxes per rung). **CPDF-10 routes to the external escalation tier — unfunded, Bob's — raised as DEC-74 with the tesseract runtime probe named as the cheap measurement standing before any funding.** Reach stated with n per figure; corpus columns are agreement-with-the-floor, never accuracy. **R3 caught the metric itself lying: `$50,000` read as `$10,000` MINTS ZERO because a digit swapped for a digit is not a minted digit — D-305**, deliberately not fixed mid-measurement (the comparability guard exists to refuse exactly that); **D-306**: ONE page of human ground truth in the whole corpus. NCs 3/3 as declared — detect answering 0 boxes on noise is a pass that costs nothing, so a FORCED central crop was transcribed too (ILLEGIBLE 6/6); the comparability guard now pins the ground truth and ladder BY DIGEST, two arms CPDF-11's guard could not have caught. Probe discipline held end to end: account pinned before upload, scratch Worker deleted with DELETE 200 → GET 404 AND an independent post-run account listing showing zero residue; ~$0.030, nothing funded; the probe is not a `.test.mjs` and battery output confirms non-discovery. Merged-tree gates: battery 173/173 · **10,755 (+2, planning-hygiene on the two new DEBT rows — fully attributed)**; `--strict` exit 0 unpiped; UI harness exit 0 FROM THE REPO ROOT (CONDUCT first ran it from `bio-plane/` and read exit 1 — the instrument misused, recorded rather than smoothed); `mintid --audit` 0 breaks. The worker's pre-ff baseline read −6 against CPDF-13's landed figure and guessed at causes; **the real cause is D-303, closed the same hour: fleetbundles' loud skip.** Its persona finding (every commit on `main` authored with the neo email) is **DEC-73** — raised, not enacted.

### D-329+D-331+D-333 · done
milestone: M0 (background lane, holds no slot)
interface: none — driver estate
depends-on: none (the three DEBT rows are the authorities: D-329 composed-label anchors invisible to static checks; D-331 the throw-vs-record driver shape, where one dead anchor blinds every arm behind it; D-333 tally decay while anchors stay live)
scope: one worker, three shapes, the shared ground being what M0-25's census can be EXTENDED to see: composed labels (D-329) need the census to evaluate anchors the way the drivers compose them; the throw-shape (D-331) wants the record-and-continue harness M0-25's own drivers use, adopted or argued per driver; tally decay (D-333) wants the census asserting declared-vs-measured tallies on the runs it already makes. Each shape either closed or argued at the site with the declined option priced — the established pattern.
accepts-when: (on spawning) the census runs with the three extensions or the argued subset; every driver's tally and anchors evaluated the way the driver actually runs; the gates as every M0 item (battery green own-baseline, strict unpiped exit 0, UI harness from root, floors from print).
NEGATIVE CONTROL: (on spawning) per shape, the established arm-alone pattern — stale a composed label, throw mid-driver, decay one tally; each caught by name, over-strictness arms beside them.
added: 2026-09-13 · CONDUCT (three residues batched as one honest queued row at D-330's integration)
landed: `bd3f7bd`..`392c3c9` (five commits, rebased onto `b0eddbf`), merged on `main`. **All three shapes CLOSED, each at its site with the declined option priced. D-329 — the row's own conclusion OVERTURNED on a measurement: a run-time-composed label exists in no file only as RENDERED; its TEMPLATE does, and `composedSpan()` (new `scripts/armdecay.mjs`) catches a fragment that resolves against a suite's template only by eating its `${…}` slot — reach 2,700 label quotes from 87 of 88 drivers, 0 findings on the estate, the historical instance caught with `gap: "26"`; a `mustFail:`-key matcher was declined because it could not see the row's own exhibit (labels passed positionally). D-331 — RULED as the row recommended: a throwing driver PREFLIGHTS every anchor before arming anything and the throw is KEPT (`casepin` 6, `casesign` 5, `caseproduction` 8 anchors, all live); record-and-continue declined because it measures a tree patched by an arm that did not arm; the law is in `VERIFICATION.md`. D-333 — the census holds each readable declared tally against its run and carries it in the exit code; a tally may stay a literal (the defect was that nothing reconciled it).** Census after: 0 stale arms, 215 arms announced, declared-vs-measured per driver; readable tallies 46 → 13 DELIBERATELY — the first pass manufactured 8 findings (a usage example, a discipline block, a SIGTERMed driver's truncated announcements) and the reader was narrowed to what it reads TRULY; the 75 unreadable are NAMED every battery. 36 of 88 drivers never ran under the census (behind `fieldread`'s documented timeout) — stated, not hidden. Gates on the branch: battery 187/187 · 11,338 vs pristine baseline 187/187 · 11,324, +14 attributed per suite (witness +12, planning-hygiene +2); strict exit 0 with REGISTER_FLOOR moved to the print (957/178/179; it had arrived 4/1/1 stale on the pristine tree — BOB's `corpuscheck.test.mjs` — one key set); UI harness exit 0; mintid audit clean. NCs 13/13 as declared, **three arms came back wrong and are recorded: L1's first spelling consumed its own anchor; `armdecay.mjs`'s header spelled its example template in real backticks so the finding named the INSTRUMENT; the witness was blind to arms whose subject is another driver (closed structurally, 2 rescued of 163, capped at a tenth).** Filed: **D-337** (`caseproduction.control.mjs` arm C red on a green main — its subject enforced twice, D-330's class, third instance) and **D-343** (three real tally decays in other claims' drivers — `caseflip`, `caselifecycle`, `fleetbundles` — plus `harness.control.mjs`'s 10 vs 19 and four unverified candidates marked so) → the fix is **M0-29**. D-336 BURNED (minted twice, first never read back) — recorded, not reused. D-333's decay mode (c), an arm whose subject stopped existing, is NOT closed and is named on D-343's row.

### VF-7 · queued — **CANNOT RUN until the next DIST deploy; queued now so the future act is an ITEM the deploy's integration meets, not a telling a future session must remember (the 2026-09-14 rule applied to two advance tellings the same day it was written).**
milestone: M0 (VERIFY lane, holds no slot)
interface: none — it watches, it does not publish a shape
design: `docs/development/SCHEDULER.md` §"The mechanism, and how the next consumer joins" (the `monitor-cadence` consumer whose first live arming this watches) and `docs/development/ARCHIVE-FALLBACK.md` §"Shape on the capture" (CAP-3's fallback), both governed; `docs/development/VERIFICATION.md` is the VERIFY lane's own authority for what a live watch must establish (a process document, ungoverned by `CORPUS-STANDARD.md` §6).
depends-on: **the next plane deploy through `deploy.mjs`** (DIST's next cut — D-297's release is the likely carrier)
scope: **D-202's TWO ADVANCE TELLINGS, enacted as the watch they imply (CLAIMS.md, DELEGATION 2026-09-14 DIST (D-202) → RECORD and → CAPTURE).** `deploy.mjs` now derives bindings from `wrangler.jsonc` (D-292), so the next deploy of any plane instance SENDS the config's service bindings — including `SELF`, which makes `#monitorConfigured()` true and **arms REC-26's monitor cadence for the first time outside a harness**, and the same deploy **arms CAP-3's archive fallback**. On biosmoke7 the daemon credential is bound and live (DIST-4), so the first armed tick spends the SCOPED class, not the root of trust — VERIFY that: after the deploy, watch the first monitor tick and the first archive-fallback path on the smoke instance, confirm the tick runs under the daemon class (never ADMIN_TOKEN — DEC-43's zero must survive its first live consumer), confirm D-334's posture honesty holds under real arming, and record both first-activation behaviours in MEASUREMENTS.md with the build named. An anomaly STOPS at the finding (the 0.52.0/0.51.0 rule: establish which build answered before believing either).
accepts-when: (on the deploy landing) both first activations measured and recorded with the serving build named; the first armed tick attributed to the scoped class; `op=audit` clean after; any anomaly filed as a finding rather than worked around.
NEGATIVE CONTROL: (on running) the watch itself must be falsifiable — assert the tick DID run (a cadence that silently never fires must read as a failure of the arming, not as a quiet pass), and the archive fallback driven at least once in scratch.
added: 2026-09-14 · CONDUCT (two advance tellings converted to one item at IC-82's integration; the tellings stay in CLAIMS.md as the record of who told whom)

### CPDF-17 · done
milestone: M2 — stale self-description, D-106's class
interface: none — comments and a registry's prose only; no shape, no op, no behaviour moves
depends-on: none (CPDF-10 `698a07b` and release 0.58.0 `e67e275` are the facts the prose lags; Part II of `docs/architecture/BIO_Content_Framework_v0_10.md` §16.4 carries the evidence)
scope: **Three stale self-descriptions the framework landing found, verified present by CONDUCT at drain time.** (1) `bio-plane/src/index.mjs` ~:5055-5063 and ~:5102-5105 say the tier-3 branch is "present, narrow and UNTAKEN" and that "every instance today" has no OCR member — false since CPDF-10 and 0.58.0: the branch is TAKEN on the project's instance and `ocr-worker` is a shipped member. (2) `docprofile/doctypes/registry.mjs` :8-15 says "Only ONE real type is registered today" — three are. (3) `schema.mjs` :1989-1993 (the stated no-extent column) and :2446-2461 (the text-source projection) cite the framework by line into Part I and still resolve; they should cite Part II (§15/§17 and §15). (4) `docs/development/ASSISTANT-PILOT.md` :67-72 and `bio-plane/src/airun.mjs` :94-104 (the row first said `agent-worker/src/airun.mjs`; corrected at respawn 2026-09-14 — the file lives in the plane, verified against origin/main) cite `CLAUDE.md`'s four levels; a pointer to Part II §14.3 suffices. Correct each in place with the dated reason — a comment that describes a mechanism that no longer exists is the record overclaiming (D-334's posture-string precedent). THE CLAIM IS COMMENTS AND PROSE ONLY: not one executable line moves, asserted by the worker (diff of comment-stripped sources empty).
accepts-when: the four sites read true against the tree as of `698a07b`/`e67e275`, each with its dated correction; comment-stripped diff of every touched source file EMPTY, asserted in the report; `cd bio-plane && npm run test:battery` green — measure your own baseline (~186/186 · ~11,283 with all three member installs); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` from the repo root, unpiped. FL-10's guard WILL fire if a comment change reaches a bundled source — rebuild `dist/` as the instrument instructs, nothing bumped or deployed.
NEGATIVE CONTROL: run and recorded — (1) the comment-stripped-diff assertion armed against a deliberate one-token executable change must FAIL (proving the claim's boundary is measured, not promised); (2) any framework line-citation the item moves must RESOLVE (`framework:LINE` → the cited heading), driven, so a pointer to Part II is a pointer and not a guess.
added: 2026-09-15 · CONDUCT (draining the 2026-09-15 BOB INBOX entry — acts 1, 2, 4 enacted as ONE item; owners named on the row, sequencing CONDUCT's)
landed: `76ae1da` (rebased onto `b0eddbf` mid-item), merged on `main` at `07efe17`. **All four sites verified stale in the tree before editing and corrected in place with the dated reason: `index.mjs` — the tier-3 branch is TAKEN on this instance (`ocr-worker` bound, shipped, deployed) and the `else` is the sovereign instance's, equally honest; the "every instance today" clause removed; `registry.mjs` — THREE registered, TWO measured, `generic` the fallback; Part II pointers BY SECTION — the two `schema.mjs` blocks → §15/§17 and §15, `airun.mjs` + `ASSISTANT-PILOT.md` → §14.3. Where the row was wrong the worker trusted the tree: the two `schema.mjs` blocks cite no framework line at all (the `framework:NNN` tokens live in four OTHER comments there), so Part II pointers were ADDED, nothing re-pointed.** Comment-stripped diff EMPTY for all five sources INCLUDING the 2.7 MB bundle; `app.html` carried the identical registry sentence and was re-flattened (`check-semantics.mjs` refuses drift), 21/8 lines all comments. FL-10 FIRED naming all four sources; rebuilt as instructed, nothing bumped or deployed. Gates on the branch: battery 187/187 · 11,324 against a pristine-worktree baseline at `b0eddbf` of 187/187 · 11,324 — ZERO delta, measured not subtracted; strict exit 0; UI harness exit 0. NCs 7/7 as declared, restores by sha256 + cmp + byte count. **Two instrument defects found by RUNNING the stripper and fixed at their sites: a rejected `--no-index` flag made it report EMPTY over anything at all; and the whole-line `--` pass run BEFORE esbuild deleted the closing line of a JS block comment whose prose began with `-- `, swallowing ~900 lines. The citation drive's first version scored Part I's `framework:NNN` sites GREEN because it asked only 'exists' — corrected to compare against the pre-shift text, and the truthful result is that the four `schema.mjs` line citations FAIL silently since the front-matter shift (stated as +84 at the time; REC-81 measured it at +89); the worker corrected its own commit's prose that had said they 'still resolve'.** The two instruments were NOT committed (the subject no longer exists to break) — reconstructable from the report. REC-81 inherits: offset uniform +84, the four `schema.mjs` sites untouched. Instrument findings rowed: D-341 (`decided.mjs` glues an appended claim header onto the previous entry) and D-342 (three of 59 CLAIMS blocks defeat a mechanical `released:` scan). REGISTER_FLOOR slack 4/1/1 confirmed pre-existing on the pristine tree, not moved here. The code lines Part II's Appendix A cites by number moved (`index.mjs` +15, `registry.mjs` +4/+13, `schema.mjs` +20, `airun.mjs` +7) — surfaced to BOB, whose document it is.

### D-334 · done
milestone: M7 — DIST-4's delegation, the armed-alarm-firing-401s shape reachable through the denylist door
interface: I3 only if a published shape moves (the selftest wording may) — file the IC before building if so
depends-on: DIST-4 (landed — its DELEGATION in CLAIMS.md and its selftest/posture naming are the ground)
scope: **THE DELEGATION IS THE AUTHORITY (CLAIMS.md, DELEGATION 2026-09-14 DIST → RECORD).** `#monitorToken()` (store.mjs ~:27514) is `env.DAEMON_TOKEN || env.ADMIN_TOKEN` — presence-only — while `classify()` accepts daemon only when `liveToken()` passes. An instance whose DAEMON_TOKEN value is DENYLISTED (published in the repo — `tokens.mjs`'s publication-revokes rule) selects the dead token on every tick, is refused on every tick, and never reaches the ADMIN_TOKEN fallback: **monitoring armed, firing 401s forever — the exact shape DIST-1 refused for MONITOR_TOKEN, reintroduced for DAEMON_TOKEN by the denylist.** The fix per the delegation, decided at the site with the declined option priced: `#monitorToken()` skips a non-live DAEMON_TOKEN (one liveToken call at selection), or the refusal is surfaced loudly. Selftest already distinguishes the state and DIST-4's posture report names it `daemon-revoked` and counts it BROKEN — keep both truths coherent with whatever you choose (a healed selection must not make `daemon-revoked` unreachable in the REPORT while the underlying condition persists: the posture must still SAY the daemon credential is dead even while the fallback carries the ticks — silent healing is the D-106 class).
accepts-when: a denylisted DAEMON_TOKEN beside a live ADMIN_TOKEN yields monitoring that RUNS (the fallback carries it) while the posture/selftest still names the dead daemon credential, both driven; battery green — measure your own baseline (~184/184 · ~11,213 with all three member installs); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` from the repo root, unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) the arm this item exists for: restore presence-only selection and a suite must FAIL showing the armed-alarm-401s shape (ticks refused, fallback never reached); (2) over-strictness — a LIVE DAEMON_TOKEN must still be selected over the fallback, byte-for-byte the current behaviour; (3) the honesty arm — with the fix in place and the daemon token dead, the posture report must still read `daemon-revoked`/BROKEN, never clean.
added: 2026-09-14 · CONDUCT (DIST-4's delegation routed per the new sweep — an owed act stated with its actor, converted to a row in the same integration turn)
landed: `902e32f`, merged on `main` at `2f562d0` (+ the merged-tree bundle rebuild). **THE CLASS CLOSED, NOT THE INSTANCE: the rule implemented is SPEND ONLY A CREDENTIAL THE GATE WOULD ADMIT — `#monitorToken()` asks the gate's own imported `liveToken` predicate of BOTH names (a denylisted admin binding beside no daemon is the identical defect one name over), and where nothing live remains the tick refuses BY NAME (`MONITOR_NO_LIVE_CREDENTIAL`) rather than firing a request the gate was always going to refuse.** The declined option priced at the site (liveness-aware `#monitorConfigured()` would have made the reconciler's sync registry async to answer a spending question — arming is not spending; the two questions are separated instead, arming byte-for-byte). **THE HONESTY HALF HELD AND IS DRIVEN ON ONE INSTANCE BOTH WAYS: selftest still reports the dead binding, livefire still fails naming it, fleet-posture still reads `daemon-revoked`/BROKEN — while that same instance's monitoring fires the grade-C capture on the fallback.** NCs 3/3 as declared, with two arms that came back wrong RECORDED (a hand-spelled refusal regex was green over a fully broken subject because `NOT_AUTHENTICATED` contains `AUTHENTICATED` — both assertions now ask `ADMISSION_CHECKS` which codes exist; the class sweep first scored its own explanatory comment). Sweep: `#monitorToken()` was the ONLY presence-only credential selection in the plane — 29 executable binding reads, 0 presence-selections remain, pinned structurally with the blind spots stated. One REC-33 pin corrected never exempted — it matched the literal text of the old selection, and that text WAS the defect: a pin holding the defect in place by name, the second such correction in that file. `fleet-posture`'s two mechanism-describing strings corrected (a report describing a mechanism that no longer exists is the record overclaiming); the posture name and BROKEN counting unmoved. No IC owed — `index.mjs` byte-unchanged, verified. Merged-tree gates: **FL-10's guard FIRED at the merge (D-334's rebuild beside DIST's landing — neither bundle matched the merged source) and was fixed at the cause by rebuilding; then battery 186/186 · 11,283**; `--strict` exit 0 unpiped, floor 949/177/178 by print (2 slack from DIST's newest suite, routine); UI harness exit 0; `mintid --audit` 0 breaks. The worker's own first baseline was DISCARDED honestly (contaminated mid-run by its own edits, re-measured in a pristine scratch worktree).

### D-330 · done
milestone: M0 (background lane, holds no slot)
interface: none unless the attribution finds a plane defect — then the IC protocol applies to whatever fix follows, filed before building
depends-on: M0-25 (landed — its census is what found these red and left them honestly unfixed)
scope: **`DEBT.md`'s D-330 row is the authority.** M0-25's census found two hand-run instruments RED on a green `main`: `d216-sharing` reads 36 pass / 4 FAIL against its own declared 38/0, and `dec65-strength-reach` is red in a shape the row records. A red instrument unattributed is indistinguishable from a real regression — attribute each failure to its cause: a subject that legitimately changed (correct the declaration/assertion with the dated reason, never exempt), a stale arm of M0-25's class (re-anchor, staling commit named), or A REAL DEFECT the battery cannot see (in which case STOP at the finding, file it with the driven evidence, and the fix is its own item — do not fold a plane fix into an attribution item). The declarations are the record of what was true when written: where they were right and the world moved, the correction says what moved and when.
accepts-when: both drivers run whole and GREEN with every changed declaration carrying its dated reason — OR red with a filed finding naming the real defect and its evidence, whichever the attribution honestly yields; each failure's cause named (subject-moved / stale-arm / real-defect) with the commit; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` from the repo root, unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) the arm this item exists for: re-stale ONE corrected declaration (restore the old expectation) and the driver must go red naming it; (2) over-strictness — an untouched passing arm stays green byte-for-byte; (3) if a real defect is found, the driven evidence must fail WITHOUT the driver (a minimal reproduction), so the finding does not rest on the instrument being right.
added: 2026-09-13 · CONDUCT (M0-25's D-330 residue — a red instrument on a green main is either a lie in the declaration or a defect nothing gates; both are worth one worker)
landed: `d5539b8`, merged on `main`. **BOTH DRIVERS GREEN, EVERY FAILURE ATTRIBUTED TO EXACTLY ONE CAUSE WITH ITS COMMIT — all seven are SUBJECT LEGITIMATELY MOVED: no plane defect, no stale anchor (all nine anchors counted live against the committed blobs), `bio-plane/src/**` byte-unchanged.** The attributions span five commits (CASE-2's composition removal, PL-13's slugs flipping a pinned-absent arm, REC-72 summing two drifts into one figure — +2 growth and −4 false declarations, separable only by measuring apart — D-266's reach bisected over ALL 36 `store.mjs` revisions with the recogniser held fixed, and this queue's own integration commit). One arm RETIRED with the loss stated (PL-19 merged, ancestry proved; D-282's stdio import separately made it unloadable — reproduced by hand without the driver). **THE TRAP WORTH THE ROW: CASE-2's replacement site quotes the removed rule VERBATIM inside the table explaining it is gone — re-anchoring the old assertion there would have gone green over prose asserting the opposite. The arm is re-aimed, not re-anchored.** The brief itself was wrong on one figure (two not-as-declared dec65 arms; there are three — the third returns the missing-tally sentinel) and the worker trusted its measurement. NCs 3/3 as declared, the real-defect arm VACUOUS BY OUTCOME AND SAYING SO; the worker's own harness failed its first arm by the item's own staleness class (positional RESULT indexing) — recorded, not smoothed; two runs discarded honestly, one of which had a background wrapper reporting exit 0 over a battery reporting 1 — which is why exits are read unpiped. **D-333 filed: a driver's declared TALLY decays while every anchor stays live — a claim about a run, invisible to any static check; the complement of what M0-25 closed. D-332 burned** (an allocator call whose id was never read back; recorded, not reused). Merged-tree gates: battery **183/183 · 11,189 (+1, predicted then measured: planning-hygiene on D-333's row)**; `--strict` exit 0 unpiped, no floor owed; UI harness exit 0; `mintid --audit` 0 breaks. Named at the sites rather than absorbed: nothing in the estate yet RUNS either driver (D-330's own point, still true); the d216 control's declare() is a subset test (an arm may fell more than it names — stated); §4's measured harm is no longer witnessed by any arm because the composition that caused it can no longer be written.

### M0-25 · done
milestone: M0 (background lane, holds no slot)
interface: none — control-driver estate; it changes no plane behaviour
depends-on: D-323 (landed — its finding is the class exhibit: two arms in two drivers had silently stopped arming)
scope: **THE ARM-LIVENESS CENSUS.** D-323 re-ran the only two control drivers its subject touched and found BOTH had arms that no longer arm — killed by D-276, which changed the lines they quote without moving them, so `harness.control.mjs` H8 and `fanout.control.mjs` F4b sat half-armed on a green `main`, one of them the arm whose whole job is proving a suite's strongest assertion CAN fail. **An arm staled the same way in any OTHER driver is still out there, and nothing runs the drivers.** Sweep: enumerate every control driver in the estate (the `*.control.mjs` convention, all six test dirs), run each whole, and report every DID-NOT-ARM / zero-match-anchor as a FINDING with the commit that staled it (`git log -S` on the anchor); re-anchor what you find, with the finding kept at each site per the established pattern. Then the mechanization question, DECIDED not deferred: whether a cheap arm-anchoring check (each arm's anchor occurs exactly once in its subject, the D-315 exactly-once shape) can run battery-side without running the arms — or argue at the site why the census stays periodic.
accepts-when: every control driver run whole with its arm tally reported; every stale arm re-anchored and re-run ALONE as declared, the staling commit named; the census's reach stated as a figure (drivers found / drivers run / arms / stale); the mechanization decided with the declined option priced; `cd bio-plane && npm run test:battery` green — measure your own baseline (~182/182 · ~11,172; member installs or loud skips); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` from the repo root, unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) the arm this item exists for: stale one arm's anchor deliberately (in a copy or with a verified restore) and the census must report it as DID-NOT-ARM, never as a pass; (2) over-strictness — a healthy driver reads all-armed; (3) if you mechanise, the check armed ALONE catches the D-276-class edit (line changed in place, anchor now zero-match) that the drivers' own runs took a month to surface.
added: 2026-09-13 · CONDUCT (D-323's stated residue enacted as an ITEM — a defence that silently stopped arming is the undiscovered-witness class wearing its third costume this week)
landed: `8ef478f`, merged on `main`. **THE CENSUS: 6 test dirs · 88 drivers found · 88 RUN · 331 arms tallied over the 46 whose announcement the matcher reads (42 report UNKNOWN, never zero) · EIGHT drivers held dead anchors · 13 arms re-anchored · 3 RETIRED with the loss stated.** Four drivers the `*.control.mjs` convention cannot see, found and named. The staling commits span the whole recent history (CASE-2/4/5b, D-266, D-276, D-309, PL-19, REC-69, CPDF-10) — **and two arms had NEVER armed since the day they were written, one of them itself a prior re-anchoring whose padded spelling `git log -S` proves the file never held: a re-anchoring not counted against the file is not a repair.** A dead anchor BLINDS every arm behind it (half the throwing drivers). **The sharpest result is a control that failed: the first d280 re-anchor ARMED and came back not-as-declared because CASE-2 had deleted the subject — a re-anchor that merely arms is not a repair either; those three are retired with the loss stated, and one's three declared fragments left LOUD rather than patched, because re-declaring to silence a complaint is the same defect as re-anchoring to silence one.** THE MECHANIZATION built and bounded honestly: `m025-arm-anchor-witness.test.mjs`, battery-discovered, 156 literal anchors from 37 of 87 drivers (43%), the blind 51 NAMED INDIVIDUALLY, and it found a dead anchor the runtime census could not reach behind a throw; the 100% option declined and priced (88 new staleness sites). Census controls 2/2, witness 6/6, all as declared. Residues as rows: **D-329** (drivers quoting composed labels — invisible to any static check), **D-330** (two instruments already red on main: `d216-sharing` 36/4 vs declared 38/0, `dec65-strength-reach`), **D-331** (throw-vs-record driver shape). Merged-tree gates: battery **183/183 · 11,188 (+16 attributed: 12 new suite, hygiene +1, planning-hygiene +3)**; `--strict` exit 0 unpiped, floor **942/174/175 by print** (moved post-commit only — D-238 refused the pre-commit figures, working as written); UI harness exit 0; `mintid --audit` 0 breaks. CPDF-15's engine pins named-unexercised (network install), not hidden.

### D-323 · done — covers D-324
milestone: M9 — RECORD ground (the suggest endpoint's vocabulary), found by VF-4 live
interface: I3 via the IC protocol if any wire string moves — file the IC before building
depends-on: VF-4 (landed — its live measurements are the ground and are not to be re-derived)
scope: **`DEBT.md`'s D-323 and D-324 rows are the authorities.** VF-4 measured live at 0.57.0: (1) `emptyLevelCandidates` mints `level-empty:<level>` — a colon — and `VERSION_NAME_RE` forbids it, so the deployed plane answers `BASIS_REFUSED`/C-25.2 to the empty-run instrument's OWN OBJECT: VF-1's owed control 7 currently cannot write live, and the honest empty run is indistinguishable from the silent failure it exists to rule out. The over-strictness arm already isolated the defect to THE NAME (the identical candidate without the colon is written). (2) `kind:"new-version"` is not one of §9's five kinds — live answers `SUGGEST_UNKNOWN_KIND`/C-27.3. **The fix choice is yours to argue at the site — widen `VERSION_NAME_RE` or change the harness's separator (and align the kind with §9 or register it properly)** — and either way THE THREE SUITES THAT ASSERTED THE COLON FORM AGAINST A PERMISSIVE MOCK are corrected so the mock answers the wire's real vocabulary (M0-23's mock-shape class, measured again): `harness.test.mjs` B4/B5, `fanout.test.mjs`, and the third VF-4's report names. Also the smaller sibling: a report carrying only `summary` yields `description:null` → live `SUGGEST_BOILERPLATE`/C-27.12 — fix or refuse honestly at the harness, argued.
accepts-when: the empty-run candidate WRITES through the real plane-side validation (driven against the actual `VERSION_NAME_RE`/kind vocabulary, not a mock); the three suites assert the wire's vocabulary and fail against the OLD colon form; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` from the repo root, unpiped. No live call is needed — VF-4 already measured the deployed truth; build against the same validation code paths locally.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) the arm this item exists for: restore the colon-minting (or the unknown kind) and a suite must FAIL naming the refusal the live plane would give; (2) over-strictness — every currently-legal name and kind still passes; (3) the mock correction proven: the permissive mock restored → the wire-vocabulary assertion fails, so the mock cannot silently widen again.
added: 2026-09-13 · CONDUCT (VF-4's two findings enqueued as ONE item at integration — the instrument the whole plan ends on must be able to write its object)
landed: `b0bf643`, merged on `main`. **THE SEPARATOR MOVED; THE GRAMMAR DID NOT** — `level-empty-<level>`, `VERSION_NAME_RE` byte-unchanged, zero `bio-plane/src/**` edits, no IC owed. The widening was DECLINED AND PRICED at the site: it would loosen a PUBLISHED grammar permanently, in the one character this project spends on identity, for one instrument's convenience — while the separator costs one line plus the suites that pinned it and NOTHING else, because the colon form was never once written (VF-4 measured `wrote:false`, so no record holds it). **THE ROW WAS ONE THIRD OF THE DEFECT: all four of VF-1's owed control-7 objects were unwritable, for THREE causes** — the colon (C-25.2), the level bridge (the harness carried the log's spelling where a suggestion is written in `SUGGEST_LEVELS`', C-27.6 — VF-4's live run only composed two of four levels so it could not have seen it, and fixing only the colon would have left one level failing somewhere else), and C-27.12 firing UNCONDITIONALLY (`description` is not a `REPORT_KEYS` key, so the field read undefined on every contract-honouring report; the table now composes it, the model's summary APPENDED never substituted, so a model writing "n/a" cannot turn the instrument's object back into filler). The three permissive-mock arms corrected and the mock given the catalogue — **and the old mock answered EVERY staged refusal with C-27.13's number and translation whatever was asked, so an "unchanged to the byte" assertion held over bytes the plane never sent.** NCs 5/5 as declared — **W-E found its own gap first, the sharpest thing in the item: `fanout` read 176/0 with the mock FULLY WIDENED, because every candidate it submitted was already legal — a suite that cannot fail when its double is widened is not pinning its double**; arm B6b added, now 177/5. **Two control arms in OTHER drivers had stopped arming on `main` — killed by D-276, which changed the lines they quote — including the arm whose whole job is proving fanout's strongest assertion CAN fail; re-anchored with the finding kept at each site. The class residue (arms staled by D-276 in drivers this item had no reason to re-run) is M0-25 below.** Merged-tree gates: battery **182/182 · 11,172 — the worker's figure exact**; `--strict` exit 0 unpiped, `FLEET_FLOOR` 3/6/8/73 and `REGISTER_FLOOR` 936/173/174 both by print (the fleet floor had ZERO slack when found); UI harness exit 0; `mintid --audit` 0 breaks. VF-4's measurement files untouched but for dated header notes marking which pinned live answers are now stale as PREDICTIONS and exact as HISTORY. The vocabulary is closed, not the endpoint — the first deployed CHECK run confirms end to end, stated in three places.

### D-322 · done
milestone: M2 — instrument estate; it changes no plane behaviour
interface: none
depends-on: D-318 (landed — its sweep is what found this, and its temp-dir-copy witness pattern is the template)
scope: **`DEBT.md`'s D-322 row is the authority.** D-314's blank/noise gate in the floor instrument (`ocr-measure-probe.mjs`, landed by CPDF-16) is pinned by NOTHING the battery runs: neutering the gate that refuses a score over a noise-failing floor leaves every automatic gate green — the only witness is `cpdf16-floor-controls.mjs`, a hand-run driver, which is exactly the class D-318 just closed for the guard pins. Close it the way D-318 did, and the decision there is the template, not a rule to re-derive: a battery-discovered witness (temp-dir copy per arm so nothing committed mutates; the hand-run driver kept for the real-mutation path with its header saying why), OR argue at the site why this gate warrants a different shape — with the declined option's cost stated either way.
accepts-when: neutering the noise gate (in a COPY) is caught by something the battery RUNS, driven and naming the gate; the floor file byte-unchanged on the committed tree; both landed probes' comparability guards and CPDF-16's own driver still green; `cd bio-plane && npm run test:battery` green — measure your own baseline (~180/180 · ~11,060; member suites need their npm ci or they skip loudly); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0, any floor move from the PRINT; `node civicos-ui/test/run.mjs` from the repo root, unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE, restores by sha256 AND cmp — (1) the arm this item exists for: the gate neutered in the copy → the witness FAILS naming it; (2) over-strictness — the untouched floor leaves everything green byte-for-byte; (3) the gate's own over-strictness held: a CLEAN floor run still yields its reference (the witness must not make the gate fire on health).
added: 2026-09-12 · CONDUCT (D-318's sweep residue, enqueued as an ITEM in the same loop that keeps learning this lesson)
landed: `40939e2`, merged on `main`. **THE WITNESS PINS BEHAVIOUR AND WIRING, AND THE FINDING THE BRIEF DID NOT PREDICT DOUBLED THE PIN: a gate has TWO neutering surfaces and neither half of a witness sees the other** — driving the gate's functions catches a hard-wired verdict or a dropped clause, and calls FIVE other neuterings green, each measured (the gate never CALLED; the exit code removed; a fabricated verdict handed to the agreement loop; the noise page filled WHITE so the gate passes for free; both controls pointed at one page). The suite asserts the EXACT finding set per arm, 13 arms over per-arm temp copies, nothing committed mutated (the floor and all three sibling instruments byte-identical across both commits, proved). D-305's fifth-expression claim gains its first battery witness in the same suite. NCs 8 arms — including the gate's OWN over-strictness (a clean floor must still yield its reference) and one NOT-AS-AIMED kept as a finding about the arm (a four-space anchor armed in the foot's cmp block, the one run where the foot's second restore check was itself under test). **THE CLASS IS CLOSED ESTATE-WIDE: D-318's stated blind spot swept — `civicos-ui/test/` plus all three fleet members' dirs, 25 non-discovered files against 230 discovered suites across six dirs, ZERO further orphans** (`newgroup/test` deliberately left as DIST's; matcher limits stated). What only a full engine run can see stated at the site: a gate wired correctly and fed the wrong bytes. Merged-tree gates: battery **181/181 · 11,078 (+18: 16 own + hygiene's two per-suite censuses; planning-hygiene unmoved because this item CLOSES a row)**; `--strict` exit 0 unpiped, floor **936/173/174 by print, zero pre-move slack, moved only after the commit because the pre-commit print refused contaminated figures (D-238 doing its job)**; UI harness exit 0; `mintid --audit` 0 breaks. Residue: one 0-byte /tmp log joins the sandbox-denied pile.

### D-318 · done
milestone: M2 — instrument estate; it changes no plane behaviour
interface: none
depends-on: D-315 (landed — its fix is what currently has no discovered witness)
scope: **`DEBT.md`'s D-318 row is the authority.** D-315 moved the two probes' expression pins onto digest discipline, and its own honest closing note is this row: the probes' `--controls` suites passed IDENTICALLY before and after that fix (their arm tables were frozen by D-315's brief), so **the only witness to a D-315 regression is `d315-guard-controls.mjs`, a driver the battery does not discover.** Close it by the row's own options, decided at the site: either widen BOTH probes' `--controls` tables with a superstring arm (the detection's own witness inside the suites that already run) or make the D-315 driver battery-discovered — and whichever you choose, the OTHER path's cost is stated at the site rather than silently declined. The census/hygiene rules apply to anything renamed `.test.mjs` (stdio flush import, discovery, register grammar).
accepts-when: a D-315 regression (re-introduce the `.includes` substring pin in ONE guard) is caught by something the battery RUNS, driven; both probes' controls suites green; `cd bio-plane && npm run test:battery` green — measure your own baseline (expect ~179/179 · ~11,032; the member suite needs `npm ci` in `ocr-worker/` or it skips loudly); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` from the repo root, unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE, restores by sha256 AND cmp — (1) the arm this item exists for: revert ONE guard's digest pin to the substring form and the battery-reachable witness must FAIL naming it; (2) over-strictness — the untouched guards leave everything green, byte-for-byte; (3) if you widen the controls tables, the new arm armed ALONE against the CURRENT guards must pass (it must witness the regression, not fight the fix).
added: 2026-09-12 · CONDUCT (D-315's closing note enacted as an ITEM — a witness the battery cannot see is a note, and a note is not an item)
landed: `0d903c7`, merged on `main`. **OPTION (b) — a battery-discovered suite — AND THE DECISION IS A MEASUREMENT, NOT A PREFERENCE: option (a) does not put the witness anywhere the battery runs** (neither probe is a `.test.mjs`, and CPDF-15's controls need a network model fetch no battery can own); (a)'s cost stated at the site rather than silently declined. `d315-guard-witness.test.mjs` (25 assertions, <1s): nine arms over a PER-ARM TEMP-DIR COPY so nothing committed mutates; the hand-run driver KEPT deliberately (it mutates the REAL floor — the path a careless edit takes — and its header now says why it must stay undiscovered); neither guard nor floor edited, byte-identical. Five arms as declared, the regression driven in BOTH directions per guard, and arm 4's failure mode is the estate's own rule ("ARM NEVER ARMED" is a finding, not a pass). **THE CLASS SWEEP IS THE LASTING HALF: 288 files in `bio-plane/test/` = 173 discovered + 115 non-discovered; 30 orphans READ, not scored — 27 one-off measurements, 2 deliberate closures, and ONE the same defect one instrument over: `cpdf16-floor-controls.mjs` — D-314's blank/noise gate in the floor is pinned by NOTHING, so neutering the gate that refuses a score over noise leaves every automatic gate green. Filed as D-322**, matcher blind spots stated at both sites. Merged-tree gates (including DIST's f5872c7, which landed under the item): battery **180/180 · 11,060 — the worker's figure held on the fully merged tree**, its own +28 attributed to the assertion (+25 own, hygiene +2 per-suite censuses, planning-hygiene +1 on D-322); `--strict` exit 0 unpiped, **REGISTER_FLOOR 928/172/173 by print — and the pre-move floor carried ZERO slack, recorded against the 11 arms the previous integration had to absorb**; UI harness exit 0; `mintid --audit` 0 breaks.

### D-315 · done
milestone: M2 — instrument estate; it changes no plane behaviour
interface: none
depends-on: CPDF-16 (landed — its NC arm is what measured this)
scope: **`DEBT.md`'s D-315 row is the authority.** The comparability guards in `ocr-composed-probe.mjs` (CPDF-14) and `cpdf15-tesseract-runtime.probe.mjs` (CPDF-15) pin the floor's four metric expressions by `.includes` SUBSTRING PRESENCE, so a SUPERSTRING mutation (`* 100` → `* 100.0`, or `.length` → `.length - 1` where the tail still appears) passes both guards silently — measured by CPDF-16's own arm, which had to be corrected to a substring-REMOVING mutation to arm at all. The digest pins (ground truth, ladder) are immune and are the model: move the expression pins onto the same digest discipline (hash the expression's exact bytes, or pin an exact-match extraction), in BOTH probes, so a guard that reads "the expression is present" becomes "the expression is BYTE-IDENTICAL". Also mechanise CPDF-16's one un-mechanised measurement while you are in these files: each pinned literal must occur EXACTLY ONCE in the floor file, asserted, because a duplicate silently disarms the probes' first-occurrence mutation arms.
accepts-when: a superstring mutation of any pinned expression makes BOTH guards exit non-zero naming what moved, driven; the exactly-once occurrence assertion driven; both probes' own control suites still fully green; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` from the repo root, unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE, restores by sha256 AND cmp — (1) the arm this item exists for: the exact superstring mutation CPDF-16 measured passing (`* 100` → `* 100.0`) must now fail BOTH guards by name; (2) a substring-removing mutation must still fail (the old detection kept, not traded away); (3) over-strictness — an untouched floor file must leave both guards at exit 0, byte-for-byte the committed state.
added: 2026-09-11 · CONDUCT (CPDF-16's residue at integration — a guard that cannot see a superstring is a ratchet with a hole the size of a decimal point) · first spawn died on the spend limit; ran on Opus 5 after the reset
landed: `ec25a50`, merged on `main`. **THE DEFECT WAS REPRODUCED BEFORE IT WAS FIXED — against the guards exactly as committed, 7 of 10 arms passed SILENTLY, including CPDF-16's exact `* 100` → `* 100.0` exhibit — and post-fix the same driver reads 10/10 as declared.** Each of the four metric expressions is now pinned by the sha256 of the trimmed source LINE carrying it, presence asserted FIRST (a removed expression is still named as gone — the old detection kept, not traded), then exactly-once, then the digest; line scope deliberately, so D-305's additive fifth expression stays a legal edit. **THE SWEEP WIDENED THE ROW: `norm()` and `levenshteinPairs()` are not read but IMPORTED AND RUN to compute every number both probes print, and neither carried any identity check — both silently mutable pre-fix, both now digest-pinned.** `ocr-measure-probe.mjs` BYTE-UNCHANGED (all four expressions already sat alone on their own lines, measured before a byte was written). What the matcher cannot see stated at the site (a different line moving the numbers; re-indentation; the fifth expression deliberately unpinned by the probes; `REFUSAL`'s value). **D-318 raised honestly: the probes' frozen `--controls` tables passed identically before and after the fix, so the only witness to a D-315 regression is a driver the battery does not discover** — two closure options on the row. Merged-tree gates: battery **176/176 · 10,833** (the base moved under the item — FL-6's suite and DS-3 landed; the worker's own +1 was attributed to planning-hygiene on D-318); `--strict` exit 0 unpiped with **REGISTER_FLOOR moved to the merged print, 920/170/171 — 11 slack, mostly accumulated by the FL-6/DS-2/DS-3 landings which added arms without moving the floor (the stale-floor pattern's latest instance, noted for FLEET and DIST), plus this item's own arms**; UI harness exit 0; `mintid --audit` 0 breaks.

### CPDF-16 · done
milestone: M2 — instrument estate; it changes no plane behaviour
interface: none — the floor instrument is comparability-bearing, which is the whole constraint
depends-on: CPDF-15 (landed — D-314's measurement is this row's ground); D-305 and D-314 are the DEBT authorities
scope: **TWO DEFECTS IN CPDF-9's FLOOR INSTRUMENT (`bio-plane/test/ocr-measure-probe.mjs`), CLOSED TOGETHER BECAUSE EVERY PRIOR FIGURE'S COMPARABILITY IS THE CONSTRAINT ON BOTH.** (1) D-305: the minted-digit expression is blind to a digit SUBSTITUTION — `$50,000` read as `$10,000` mints zero — so add the digit-position DISAGREEMENT count as an **ADDITIVE fifth expression, its own column**, never a change to the four existing expressions: every probe reading this file pins the four by digest and one pins the ground truth, so any non-additive edit makes every prior figure incomparable (CPDF-14's and CPDF-15's guards both EXIT on exactly that, which is your negative control for free). (2) D-314: the LOCAL floor engine failed CPDF-15's noise arm with 9,968 invented characters, and it is the reference every corpus agreement-with-the-floor column rests on — give the floor instrument its own blank/noise control gate so a floor reference is only ever taken from a floor run that passed it, and where the floor engine answers on noise the agreement column reads **`undetermined` with the reason, never a number**. Re-measure and state what moves: expected NOTHING in existing committed figures (both changes are additive/gating), and if something does move, that is a finding to report, not to absorb.
accepts-when: the fifth expression reports substitutions as its own column on the ground-truth page (the R3 exhibit reads >0 where minted reads 0, driven); a noise-failing floor run cannot mint an agreement figure, driven; the four existing expressions and the ground truth BYTE-UNCHANGED (assert by the digests the guards already pin); CPDF-14's and CPDF-15's comparability guards still EXIT 0 against the edited file; `cd bio-plane && npm run test:battery` green — measure your own baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` from the repo root, unpiped.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) the arm D-305 exists for: a substitution-only corruption of the ground-truth comparison must move the NEW column and NOT the minted column, both asserted; (2) the arm D-314 exists for: feed the floor a noise page and any code path that would publish an agreement number must fail or answer `undetermined` naming the noise gate; (3) over-strictness/comparability — alter one of the four pinned expressions and BOTH landed probes' guards must EXIT non-zero naming the digest (restore verified by sha256 and cmp).
added: 2026-09-11 · CONDUCT (D-305 + D-314 enqueued as ONE item at CPDF-15's integration — two rows, one instrument, one comparability constraint) · first spawn died on the Opus 5 weekly limit; ran on Fable 5, recorded
landed: `a577795`, merged on `main`. **BOTH HALVES ADDITIVE AS CONSTRAINED, AND NOTHING COMMITTED MOVED — measured, not assumed: the run of record reproduced CPDF-9's 2026-08-03 figures EXACTLY.** D-305 closed: the fifth expression (digit-position DISAGREEMENT) is its own printed column with a self-refusing exhibit driven on every run before any engine installs ($50,000→$10,000: disagree=1, minted=0). D-314 closed: the floor generates CPDF-11's noise control itself, gates every model run on blank AND noise, and the only agreement path answers the STRING `undetermined` naming the gate over a failing run. **WHAT THE BRIEF DID NOT PREDICT, AND IT WIDENS D-314's FINDING: the default best_int model ALSO fails the noise control — 7,558 invented characters — so NEITHER local model may currently serve as an agreement reference, and the instrument now exits 1 in that state, judged the honest exit.** tessdata_fast's 9,968-char noise invention reproduced EXACTLY by a different harness — two instruments, one figure. NCs 8 arms, each ALONE, foot 8/0, restores by sha256 AND cmp; both landed probes' own control suites run as free negative controls (CPDF-14 4/4, CPDF-15 5/5). **The arm that came back wrong produced D-315: the landed guards' expression pins are `.includes` substring-presence, so a SUPERSTRING mutation (`* 100` → `* 100.0`) passes both guards silently — the digest pins are immune; filed as its own row, owned by the probes' files which this claim deliberately excluded.** One un-mechanised measurement stated as such: each pinned literal occurs exactly once in the edited file (a duplicate would silently disarm the probes' first-occurrence mutation arms). Merged-tree gates: battery 174/174 · **10,808 (+1, planning-hygiene on the D-315 row — attributed)**; `--strict` exit 0 unpiped, floor 909/168/169 unmoved; UI harness exit 0; `mintid --audit` 0 breaks.

### CPDF-15 · done
milestone: M2 — **measurement-only; DEC-42's CPU question (D-245), the ruled in-account path's own next step. Enqueued on the leading BOB session's tactical direction 2026-09-10, which is also DEC-74's recommendation: this probe needs no funding and its figures inform Bob's answer in either direction while foreclosing nothing.**
interface: none — it measures, it does not publish a shape
depends-on: none (CPDF-12's deployed-probe precedent and CPDF-14's instrument discipline are the template; CPDF-11's ladder and ground truth are the floor)
scope: **THE TESSERACT RUNTIME PROBE.** DEC-42 established the plan only: wasm tesseract fits a dedicated fleet member (2.72 MB gz, 0.72 with the model in R2) and was ruled out on the FREE CPU ceiling, which Workers Paid moves from 10 ms to 30 s — HTTP 200 with cpu_ms echoed measured the PLAN, and "a GO still has to be earned on the runtime; memory is unmeasured at 33.6 MB per RGBA frame against 128 MB." Measure the runtime: deploy a scratch Worker carrying wasm tesseract in the project account, run the CPDF-11 ladder rungs against it, and report cpu_ms per page, peak memory against the 128 MB ceiling, fidelity versus the CPDF-9 floor (comparability ENFORCED by digest — import the ground truth, exit if a metric expression moved), reproducibility over identical bytes, and the invention band. **If the account is not on Workers Paid, the CPU ceiling itself decides quickly: REPORT the measured refusal (the exact error and where the ceiling bit) and STOP — that figure is the deliverable in that branch, and funding Paid is inside DEC-74 with Bob, not yours.** Same probe discipline as CPDF-12/CPDF-14: account pinned BEFORE any upload; upload/use/DELETE-and-verify-gone with an independent post-run listing; NOTHING funded; the real record untouched; report token/CPU cost.
accepts-when: a MEASUREMENTS.md row, dated, naming the instrument, cpu_ms and memory per rung with n stated, fidelity as accuracy on the ground-truth page and agreement-with-the-floor elsewhere (columns named apart — D-306), reproducibility over identical bytes, and the verdict OR the measured ceiling refusal; the scratch Worker deleted and verified gone; nothing bumped, signed, deployed to a real slug, or funded.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) blank/noise controls: an engine that answers on noise disqualifies itself whatever its clean score (force the transcription if detection short-circuits, CPDF-14's lesson); (2) the comparability guard armed — move a metric expression and the probe must EXIT rather than publish an incomparable figure; (3) over-strictness — a clean high-fidelity page must still pass end to end.
added: 2026-09-10 · CONDUCT (BOB's re-drive enacted as an ITEM; DEC-74 stays open with Bob and this forecloses nothing)
landed: `d3c43d4`, merged on `main` at `f0c3de5`. **VERDICT: GO ON THE RUNTIME — the CPU-ceiling branch did not fire** (the account accepted `limits.cpu_ms: 50000`, re-confirmed by provocation, not inherited). Engine pinned by digest: `tesseract-wasm@0.11.0` SIMD + tessdata_fast eng — the same model bytes as CPDF-9's floor; payload 2.72 MB gz, matching DEC-42's plan figure exactly. **R0: 10,400.6 cpu_ms/page — 34.7% of the Paid ceiling, 1,040× the Free one — at 99.89% chars, 89/90 digits, 0 minted; the floor page re-measured at CPDF-9's landed figure EXACTLY.** Reproducibility: 9 images × 3 runs, ZERO gave more than one distinct text; the anchor answered 406/406/406 words at ONE distinct geometry — **everything Moondream failed, measured passing on the same discipline.** The invention band is EMPTY: R3 returns the empty string where Moondream minted 16–20 digits per run; D-305's substitution column reads 0 at every rung. **Memory binds, found BY REFUSAL: 33.7/48.5/61.3 MB frames pass, 75.7 MB killed (`exceededMemory`, reproduced), 134.6 MB a catchable in-isolate RangeError** — so single-page fits with headroom and multi-page-per-invocation is the named next question. Every cpu/memory figure platform-observed, 17/17 arms carried a row. NCs all as declared — **and NC1 found the INSTRUMENT wrong, not the subject: CPDF-9's LOCAL FLOOR engine failed the noise arm with 9,968 invented characters — D-314, and it is the reference every corpus agreement column rests on.** D-312 (the platform's memory figure is not a fraction of 128 MB) and D-313 (the image-only class is rare and clumped — two 1,377-page harvests returned ZERO; corpus reach is luck) filed with dispositions. Discipline held: account pinned, slug refused if pre-existing, DELETE 200 → GET 404 → independent listing verified TWICE, 45 invocations, 186.3 s billed CPU, ≈$0.0037 inside the existing allocation, nothing funded/bumped/signed/deployed. Merged-tree gates: battery 174/174 · **10,807 (+3, planning-hygiene on the three DEBT rows — the worker's own attribution, reproduced)**; `--strict` exit 0 unpiped; UI harness exit 0; `mintid --audit` 0 breaks. Two instrument failures recorded not smoothed (a box-arm API misname that DID NOT ARM and said so; a first memory walk that bracketed nothing). **Residue: `/tmp/cpdf15-scout` (42 MB, outside the repo) — the worker's delete was sandbox-denied and so was CONDUCT's; it joins `/tmp/mfp` as the residue needing a hand outside the sandbox.** What it cannot see, stated: one ground-truth page, one engine version, no whole-document invocation, no in-isolate PDF decode. **CPDF-10's placement question is now MEASURED: re-scoped below to the in-account tesseract fleet member, DEC-35's own default; DEC-74 stays open with Bob and the external tier stays unfunded — the probe made his answer better-informed, exactly as promised.**

### CPDF-10 · done — **RESPAWNED 2026-09-11 ON FABLE 5** — the first spawn died seconds in on the Opus 5 weekly rate limit (resets 2026-09-12 04:00 PT), and the pin-Opus-5 directive's own tactical-escalation exception applies under never-block: Fable 5 is the higher tier, the deviation is recorded here rather than silent. Falsify rather than believe: a live worker holds an `agent-*` worktree with commits toward the third fleet member; if none does, this row reads `queued`. **RE-SCOPED TWICE IN ONE DAY, EACH TIME BY A MEASUREMENT, AND THE SECOND UNBLOCKED IT: CPDF-14's NO-GO exhausted the Moondream candidates and routed this at the external tier pending DEC-74; then CPDF-15 MEASURED the remaining in-account candidate and the verdict is GO** — tesseract-wasm on the deployed runtime at 34.7% of the Paid ceiling, 99.89% chars, zero minted at every rung, reproducible, stable anchors. So the placement is DEC-35's own DEFAULT, needing nothing funded: **the Tier-3 engine is TESSERACT AS A FLEET MEMBER.** DEC-74 stays open with Bob (the external tier as ESCALATION, and whether the 13-page gap warrants it at all) and is NOT this row's blocker — the ruled default path is measured clear. Build against CPDF-15's measured bounds: single page per invocation fits with headroom (memory kills at ~75.7 MB frames — D-312's caveat on reading the platform's memory figure); whole-document invocation is UNMEASURED and not to be assumed; D-314 (the local floor engine invents on noise) bounds what any agreement-with-the-floor verification can claim.
milestone: M2
scope: **The Tier-3 OCR path, behind whatever placement CPDF-9's measurement permits.** PLACEMENT RE-BASED BY DEC-35 (2026-08-04, superseding the 2026-08-03 service-first note): in-plane and pdf-worker stay RULED OUT by bundle size; the IN-ACCOUNT path is the DEFAULT and its engine is now TESSERACT AS A FLEET MEMBER pending CPDF-12's deployed probe (DEC-42: Moondream returned NO-GO on coordinates; tesseract was never blocked on size, only on the Free CPU ceiling Paid removes) — sovereign instances must not need a second vendor account (the D-115 class); the EXTERNAL service (Azure DI Read primary) is the ESCALATION tier or the fallback on NO-GO; NOTHING FUNDED. Per-region confidence becomes confidence-WHERE-SUPPLIED, else a stated confidence: none in the chain with the fidelity cap set by measurement; pseudo-confidence (a self-reported number thresholded as calibrated) FORBIDDEN as the costs-nothing class; measured self-refusal (CPDF-11's degradation ladder) is the only earnable per-region trigger. The provenance chain and the image-region anchor UNCHANGED, non-negotiable. Deps gain CPDF-11 and (on GO) CPDF-12. D-152, DEC-4 as twice amended. THE PROVENANCE RULE IS THE ITEM, not the engine: **`text_source` records a CHAIN, not a token** — `pixels → ocr(engine, version) → ai(function, version) → attested(member, date, extent)` — each step naming what performed it, and **each step can only weaken the claim, never strengthen it** (an AI that cleans a garbled line produced more READABLE text, not more RELIABLE text; the hazard of this capability is output that looks better than its input — do not let the chain collapse to a single label). A text LAYER is itself an unverified transcription (`pdfstructure.mjs` already decodes through the file's own `/ToUnicode` map), so **the ceiling is VERIFIED AGAINST THE RENDERED IMAGE, reachable from both paths**: member attestation is offered on a text layer too, SCOPED to what was actually checked (a leg citing outside the attested extent does not inherit it); the chain is still recorded — verification supersedes it as grade determinant, never as record. Attestation is a member act refusable to a machine credential. Transcription fidelity BOUNDS the capture axis (weakest link of byte provenance and fidelity) — no third scale, no new machinery. A basis leg resting on OCR'd text carries its image region (page + rect); OCR never raises a capture grade; a low-confidence region reads `undetermined`, never a best guess. Text reaches the READING path via FW-15's wire.
behind-interface: I2
depends-on: CPDF-9, COFF-1, CPDF-11, **CPDF-14-on-verdict (CORRECTED 2026-09-10 by CONDUCT: the "CPDF-12-on-GO" this row carried was never satisfiable — CPDF-12's own landed line recorded NO-GO on the default path and re-scoped itself to the composed-shape measurement, which was never run and had no row; it is CPDF-14 now, and CONDUCT #8's handoff listing this item as "unblocked" was wrong on this point — the tree is the fact)**, formerly CPDF-12-on-GO (dependency corrected 2026-08-03: the handover's "CPDF-8" was RECONCILED §3.3's name for the FORMAT registry, carried as COFF-1. The page-to-pixels rendering path BOB flagged as the other candidate reading is real but is DECIDED by CPDF-9's placement measurement — an external-service placement needs no renderer; an in-plane or fleet placement does — so the renderer item is named when that recommendation lands, not pre-built.)
accepts-when: `cd bio-plane && npm run test:battery` green with a real image-only Oakland PDF yielding text whose `text_source` chain names each step with per-region confidence and reaching `reading_refs`, while a text-layer PDF yields its own honest chain and the two are distinguishable in the projection, the index and an export; an attestation is refused to a machine credential and scoped to its extent; negative control — strip the `text_source` marker and the suite fails naming an OCR'd document indistinguishable from a published text layer; drop the confidence floor so a garbled region emits a best guess and the suite fails; collapse the chain to one label and the suite fails.
added: 2026-08-01 · BOB · amended 2026-08-02 ×2 · enqueued 2026-08-03 · CONDUCT · two spawns died on rate limits; ran on Opus 5 after the reset
landed: `698a07b`, merged on `main`. **THE THIRD FLEET MEMBER EXISTS AND RUNS, AND ZERO LINES OF `bio-plane/src/` CHANGED** — the consumer contract (D-251/IC-39/IC-73) was built complete before its first implementer arrived, and the member CONSUMES it, which is the measured evidence the contract did not bend. `ocr-worker/` carries `tesseract-wasm@0.11.0` SIMD + tessdata_fast eng with **all three of CPDF-15's digest pins reproduced EXACTLY from a fresh install** — the member runs the engine the GO was measured on, and FL-9's byte-identity guard covers it (plus a new `assets` arm hashing the upload parts; both sibling manifests byte-unchanged, asserted). The run of record: a real Oakland scan through the real plane, real binding, real engine, in-isolate — `text_tier: 3`, chain `pixels → ocr(tesseract-wasm 0.11.0)`, both steps cap C with `measured_by` naming CPDF-15 and `calibration: null` STATED; **CPDF-15's 406/406/406 word boxes reproduced by a different harness; the pixels digest equals an INDEPENDENT Pillow/pypdf value sharing no code line; `$50,000` comes back right where a model minted `$10,000`.** Distinguishable in projection, index and export; attestation refused to a machine credential and scoped; without the binding the page stays honestly unread and says why. ONE PAGE PER INVOCATION with an over-largest-measured-frame refusal BEFORE allocation; every memory statement a workload size, never a share of 128 MB (D-312). **D-314's sentence travels INSIDE the member's own `measured_by` string, on the wire, on every document.** Two design decisions made rather than returned, both argued: engine+model as upload parts (FL-9 then hashes the bytes the cap measures — an R2 model is bytes nothing pins) and region grain `line`, measured against the newline-join making word grain trivially satisfy the agenda signal. NCs 9 arms, 0 not-as-declared, 45 restores all identical by sha256 AND cmp — two arms found things kept (the translation-invariant text pins make the independent digest the load-bearing arm; a TypeError-ended module only went red on the foot sentinel, now null-tolerant). **IC-78 (I9 PROVISIONAL — the third binding; DIST must learn multi-part member upload) and IC-79 filed; D-319/D-320/D-321 filed with the seam, the JPEG route, and the synthetic-ink reach each ASSERTED IN THE SUITE so they cannot quietly close or widen.** Merged-tree gates: battery **179/179 · 11,032 — the worker's record figure reproduced exactly after `npm ci` in `ocr-worker/`** (its suite SKIPS LOUDLY BY NAME without it — the D-303 discipline extended to the third member, and CONDUCT hit it and read it correctly); `--strict` exit 0 unpiped with **REGISTER_FLOOR 923/171/172 and FLEET_FLOOR 3/6/7/68 verified by the merged print** (the branch collapsed the D-315-vs-DS-2 floor conflict itself and the print confirms it); UI harness exit 0; `mintid --audit` 0 breaks. **NOT claimed, said out loud: the live-verify — the member actually deployed, `/version` answering from the account — is DIST's next cut** (IC-78 names the multi-part upload DIST must learn first). Residue: `/tmp/cpdf10-engine` (8.1 MB) joins the sandbox-denied /tmp pile.

## CONTENT-OFFICE — ACTIVE (re-activated 2026-09-14 by CONDUCT #10 into an empty dev slot for COFF-9 → COFF-10, Bob's Google Drive ruling; the axis was built end to end by 2026-08-03 — COFF-1..7 — and was DORMANT from then until this)

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

### COFF-9 · done
milestone: M2 — the content axis reaches OpenDocument, because Bob RULED (2026-09-14) that a Google Drive link keeps the link and extracts from the OpenDocument export; COFF-6's "ODF is ZERO in 43,282 assets → DO NOT BUILD" was about NATIVE ODF assets and stands as a measurement — the Drive export path makes ODF the HARVEST format, which is why the build is now warranted
interface: I7 (the registry-entry contract) unchanged — this act adds a flavour, not an entry; I2 untouched
depends-on: none
scope: `bio-plane/src/ooxml.mjs` — `OOXML_FLAVOURS` is the part-map PARAMETER and the file's own header says an ODF part-map is one more table: add the OpenDocument flavour table (`odt` / `ods` / `odp`), discriminated the way ODF is actually built — same ZIP container, the FIRST entry `mimetype` stored uncompressed carrying `application/vnd.oasis.opendocument.text|spreadsheet|presentation`, plus `META-INF/manifest.xml` and `content.xml` as the main part — so `discriminate(bytes, contentType, flavours)` answers `odt`/`ods`/`odp` on a real ODF container and `undetermined` on an arbitrary ZIP, with the OOXML outcomes byte-for-byte unchanged. Fixtures: minimal ODF containers built in the suite (a stored `mimetype` entry first, a manifest, a `content.xml`), since no office suite is on the machine — say so in the fixture's header. NO format entry, NO `registerFormat` call, NO I2 emission — that is COFF-10's.
accepts-when: `discriminate()` returns each ODF flavour on its fixture and `undetermined` on a ZIP with neither part map, driven in `bio-plane/test/ooxml.test.mjs` (or a sibling); every existing OOXML assertion unmoved; `cd bio-plane && npm run test:battery` green — measure your own baseline (~187/187 · ~11,329 with all three member installs); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` from the repo root, unpiped; plancheck 0 fail.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) a ZIP carrying `META-INF/manifest.xml` and `content.xml` but a WRONG `mimetype` value → `undetermined`, never a flavour (the mimetype is the discriminator, not the file list); (2) `mimetype` present but not the first entry / compressed → stated behaviour, driven (ODF requires it first and stored; decide whether to accept or refuse and PIN the decision with its reason); (3) over-strictness — the three OOXML fixtures still discriminate exactly as before, asserted by comparing the full `discriminate()` result objects to the pre-item run.
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 inbox entry "Bob ruled the Google Drive harvest" — three acts rowed in dependency order; CAP-7's count sets their PRIORITY, not whether)
landed: `932b307`, merged on `main` at `7c110cb`. **The flavour table gained `partMap` — `"opc"` for the three OOXML rows (a row with no `partMap` reads as opc, so a caller's pre-COFF-9 table still works), `"odf"` for `ODF_FLAVOURS` (`odt`/`ods`/`odp`, each naming its `mimetype` and `content.xml`); `CONTAINER_FLAVOURS = [...OOXML, ...ODF]` is `discriminate()`'s new default; OPC runs first and the ODF branch is reached only where `[Content_Types].xml` is already absent, which is what keeps every OOXML and plain-ZIP result object byte-identical. PINNED with its reason: a `mimetype` not first or compressed is REFUSED into `undetermined` by name (`odf_mimetype_not_first` / `_not_stored`) — OpenDocument 1.2's own rule, measured to cost nothing (all three real producer packages conform), the cheaply reversible direction. Against the row's wording, kept deliberately: a ZIP with neither part map stays `format:"zip"` (a POSITIVE COFF-2 determination) rather than `undetermined` — the record must not claim less than the bytes support.** THE BRIEF'S PREMISE WAS FALSE: LibreOffice 26.8 IS on the machine; real `.odt`/`.ods`/`.odp` were produced and read back through the module's own central-directory walk (mimetype first, stored, 39/46/47 bytes) — pre-item all three answered `zip`, post-item `odt`/`ods`/`odp`; recorded in MEASUREMENTS.md with its limits (one producer; Google Drive's own export NOT reachable, NOT measured — CAP-8 re-measures). FL-10 fired, rebuilt as instructed. Gates on the branch: battery 187/187 · 11,395 vs pristine 187/187 · 11,329 — exactly ONE suite moved (`ooxml.test.mjs` 101 → 167), attributed by diffing two runs; strict exit 0 (5/1/1 slack pre-existing, not moved); UI harness exit 0; corpuscheck 44/0. NCs 4/4 — **the arm's own arm found a vacuous green: a bare `ODF_FLAVOURS.every(...)` stayed GREEN over an EMPTIED table (`[].every()` is true); closed by asserting the row count beside the predicate and the arm re-run (37 of 167 fail, all inside the five OpenDocument sections, none outside) — the commit was amended for the corrected figure, reported not smoothed.** Owed acts enacted: the three falsified Part II §16 sentences → routed INTO COFF-10's scope (answering for dormant FRAMEWORK; BOB #10 told so the merge stays trivial); `OFFICE-FORMATS.md`'s ODF bullet corrected on the branch; the control-register punctuation trap → **344**; COFF-10 briefed on `partMap` dispatch and the exports.

### COFF-10 · done
milestone: M2 — three OpenDocument format entries, so an exported Drive file is READ, not merely held
interface: I7 (three new registry entries in the existing shape — CONFIRM, do not change), I2 (the emitted structure must land in the SAME shape and DEC-5 evidentiary envelope the OOXML entries produce; element references from IC-1's union — `sheet-cell` for `.ods`, `doc-para` for `.odt`, `slide-shape` for `.odp` — no new union member, so no IC unless one is needed, in which case file it BEFORE building)
depends-on: COFF-9
scope: three format entries — `.ods`, `.odt`, `.odp` — each `registerFormat`ed in `bio-plane/src/formats.mjs`'s contract (`detect(bytes, contentType)` by bytes first via COFF-9's flavour, by content type second; `structure`/text emission), each reading ONE `content.xml` part into the I2 shape the OOXML sibling of the same kind produces (`formats-xlsx.mjs` for sheets, `docx.mjs` for text, `pptx.mjs` for slides — reuse their envelope builders rather than growing a fourth), with the same detect ladder and the same DEC-5 evidentiary extras where the ODF part carries them. Fixtures as in COFF-9 (minimal containers built in the suite, stated). Everything stays inside `formats.mjs`'s promise: adding a format is a `registerFormat` call and nothing anywhere else — assert that promise by `grep`ping `index.mjs` for the three format names and finding NONE.
accepts-when: each entry detects its fixture by bytes and by content type, and emits I2 structure with element references of the right union member, driven; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0 — a NEW op is not expected, so no control-plane assertion is owed unless one appears; battery green own-baseline; UI harness from the repo root; plancheck 0 fail.
NEGATIVE CONTROL: run and recorded, per entry — the `content.xml` part removed → the entry reports the absence BY NAME (undetermined is first-class), never an empty structure; a fixture of the wrong flavour handed to each entry → refused by name; over-strictness — the three OOXML entries' outputs on their own fixtures byte-identical to the pre-item run.
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 inbox entry "Bob ruled the Google Drive harvest" — three acts rowed in dependency order; CAP-7's count sets their PRIORITY, not whether)
landed: `c1cb0fa`, merged on `main` at `737a97f` (dist rebuilt at the merge under FL-10). **Three entries in `bio-plane/src/odf.mjs` sharing one container walk, differing only in projection, every media type and main-part name taken from COFF-9's `ODF_FLAVOURS` rows: `.odt` → docx's shape with `doc-para` refs (tracked changes with the superseded wording, comments); `.ods` → the xlsx shape with `sheet-cell` refs (formulas verbatim, hidden sheets/rows/cols); `.odp` → the pptx shape with `slide-shape` refs (speaker notes counted apart, hidden slides). No new IC-1 member; I7 CONFIRMED by three more entries. What ODF cannot supply from `content.xml` — `core-properties` (in `meta.xml`) and `intra` links to embedded objects — is CARRIED on every read as a stated absence, not silence → D-346.** Real LibreOffice 26.8 files measured (MEASUREMENTS.md): detect by bytes CERTAIN on all three, `content.xml` is 37–77% of the container so COFF-6's 20 MiB bound applies to ONE part; two constructs live on styles, not elements (hidden sheet, hidden slide) — both spellings read; pre-item the registry answered `undetermined` on all three while COFF-9's tier already knew the flavour — that is the gap closed. Google Drive's own export NOT reachable, NOT measured — CAP-8 meets it first. §16's three sentences corrected, nothing else in the document (FRAMEWORK answered-for). Gates on the branch: battery 188/188 · 11,543 vs pristine 187/187 · 11,410 (+133 attributed per suite: `formats-odf` +130, hygiene +2, planning-hygiene +1); strict exit 0, floor set from the POST-commit print (the pre-commit run reported the suite as a phantom, D-238 honoured); UI harness exit 0; corpuscheck 44/0; audit 0. NCs 5/5 + baseline, the OOXML over-strictness arm a sha256-identical corpus floored at 2,000 bytes so an empty digest cannot agree for free. Claim amended twice in honesty (one `export` keyword on `sheetCellRef` to avoid duplication; `coverage.mjs`'s floor). one D id minted and UNUSED — the number after D-346 — because a grep ate the first mint's output; burned and recorded here WITHOUT its token, since a queue line naming a register id that has no row drives mintid's floor off prose (the D-277 shape, caught by the instrument at this integration). A process note: the worker's hand-rolled `pgrep -f` wait released early AND self-matched, WORKER.md's two named failures, and it switched to `waitquiet`. **CAP-8 is unblocked: both dependencies built.** For CAP-8: `ODT_CONTENT_TYPE`/`ODS_`/`ODP_` exported from `src/odf.mjs`; detection bytes-first and certain, so Google's declared content type need not be trusted; a `text/html` shell answers no entry.

### COFF-8 · done
milestone: M0 (background lane, holds no slot) — the design corpus standard, Bob's 2026-09-14 ruling: `docs/architecture/CORPUS-STANDARD.md` §5 "Not yet governed"
interface: none — front matter and one row in `CORPUS-STANDARD.md` §5's governed table; no shape, no op, no behaviour moves
depends-on: none
scope: `docs/development/OFFICE-FORMATS.md` (~11 KB). Read against `bio-plane/src/ooxml.mjs`, `formats.mjs` and the per-format entries; Status/Place/Incomplete; `--write`; §5 row. Same worker as REC-80 and FW-16.
accepts-when: front matter per `CORPUS-STANDARD.md` §3's grammar on every file named in scope, each file ADDED to §5's governed table in the same commit (`CORPUS-STANDARD.md` is itself governed — bump its Status `as of` and regenerate its Contents if a heading moves); `node tools/corpuscheck.mjs` 0 fail over the WHOLE governed set; the Incomplete list HONEST per §6 — a section incomplete in fact and unmarked is the defect, "None" only with how it was established; `node tools/gates.mjs` green (class DOCS: the doc-facing suites plus `plancheck --local`); plancheck bare 0 fail after CONDUCT's push.
NEGATIVE CONTROL: run and recorded, on one retrofitted file, each arm ALONE — (1) the Status `as of` date pushed behind the file's last commit day → corpuscheck FAILS naming the file; (2) one heading edited without `--write` → FAILS on the Contents divergence; (3) an Incomplete bullet naming a section the document does not have → FAILS; each restored by `cp`-back verified by hash (never `git checkout --`), and the final files pass byte-for-byte (over-strictness).
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 inbox entry, act 1 — one prose-only item per owner group; the Status/Place/Incomplete judgment is the owner's, and for a DORMANT area CONDUCT answers-for in the row and the worker writes it)
landed: `97232bf`, merged at `de36ac7`. **`OFFICE-FORMATS.md`: the axis it argues for is [BUILT] end to end, 8 incomplete — its own preamble still reads "Nothing here is built"; four sections superseded (DEC-5 inverted the personal-data risk; IC-1 landed I2 as `doc-para`; COFF-6 answered both empirical questions — 20 MiB bound, OLE2 0.32% deferred, ODF ZERO in 43,282 assets → DO NOT BUILD). What the axis still does not extract is now stated: tables and images as content, charts/drawings, embedded files (hashed, never opened).** §5 row added, not-yet row struck.

### CPDF-13 · done
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
landed: `f316191`, merged on `main` at `4a0c248`. **ALL FOUR CLAUSES DRIVEN THROUGH THE OPS, NEVER AT THE STORE**: a transcription names its calibration; a WORSE second calibration raises an obligation naming EXACTLY the bound transcription — with the two absences asserted as hard as the presence (same engine/no calibration, another engine's calibration) — and moves NO grade; a BETTER one raises nothing; the eleventh alarm consumer registers, fires, and self-terminates on an instance with nothing registered. `CALIBRATION_CADENCE_MS` = 30 days, declared ONCE in `bio-plane/src/calibration.mjs`, quoted BY NAME in SCHEDULER.md with the cost stated (one probe per registered engine per cadence on the instance's own account; ZERO on an instance registering nothing). **IC-72 (I5) and IC-73 (I2) filed BEFORE building**, measured impact: zero `calibration` reads in `civicos-ui/` and `newgroup/`. **THE FIRST FULL BATTERY CAME BACK 163/171 EXIT 8 AND NOT ONE WAS A FLAKE: two ratchets found real unbounded work in the first draft** (`#calDriftFor` scanning with no LIMIT under an amplifying loop; `#mintCalibrationId` reading every row for a max) — **both fixed at the cause rather than ceiling-moved, which is why `derivation-bounds` and `meaning-bounds` are UNMOVED.** NCs 4 arms + baseline, all as declared; three first-runs found the INSTRUMENT, not the subject, kept not smoothed — the sharpest: rule 4 is enforced at TWO sites, and arming one alone measured 110/0 with nothing failing, so the arm had to arm both. **An arm is source and goes stale like any other source** (a committed arm referenced a column the item's own later rename removed; it died `-1/-1` and was fixed as source). D-221's version-chain pin met and honoured, not narrowed: the column is `replaced_by` with the reasoning at the site; the wire field stays `superseded_by`. `dist/**` rebuilt byte-identically because FL-10's guard fails a stale artifact; nothing bumped, signed, or deployed. Merged-tree gates: battery **172/172 · 10,669 — the arithmetic closes exactly: pre-merge 10,537 + 132 (calibration 110 new, hygiene +10 — D-265's census counting this item's new modules, a genuine cross-term — bounds +5, textchain +5, planning-hygiene +1, scheduler +1)**; `--strict` exit 0 unpiped with **REGISTER_FLOOR collapsed to ONE SET at the merge (both branches had moved it blind to each other) and re-read from the merged run's OWN print: 892/166/167** — never summed by hand; UI harness exit 0; `mintid --audit` 0 breaks. **Deliberately not done, stated: nothing here runs a REAL fidelity probe** — every calibration in the suite is synthetic and the tick marks a subject OWED rather than treating the last measurement as current; a green here is NOT a calibrated engine. `layerChainFor` attaches no calibration reference (a text layer's cap is null by measurement — a reference would point at a measurement the step does not rest on; stated as a closure in IC-73). C-43 minted and unused, a recorded gap. The cadence's CORRECTNESS is unmeasured and says so.

## CAPTURE — ACTIVE (re-activated 2026-09-14 by CONDUCT #10 into the dev slot COFF-10 freed, for CAP-8 — the Drive host-stack handler, Bob's 2026-09-14 ruling; CAP-9 queued behind it on the same ground; DORMANT before this since CAP-4).
CAP-3 runs OUT OF BAND: it touches only CAPTURE's own paths and contends with neither
active area. CAP-4 is decided and queued behind it.

### CAP-6 · done
milestone: M0 (background lane, holds no slot) — the design corpus standard, Bob's 2026-09-14 ruling: `docs/architecture/CORPUS-STANDARD.md` §5 "Not yet governed"
interface: none — front matter and one row in `CORPUS-STANDARD.md` §5's governed table; no shape, no op, no behaviour moves
depends-on: none
scope: `docs/development/AUTHORITY-AND-TRUST.md`, `LINK-FIDELITY.md`, `ARCHIVE-FALLBACK.md`, `SOURCE-ACCESS.md`, `CAPTURE-SCALING.md`, `CAPTURE-FIDELITY.md`, `CLIENT-RENDERED.md` (~113 KB together). For each: read it against what the plane actually does today (`bio-plane/src/` — the governor, `subresources.mjs`, the archive fallback CAP-3 built, the reachability and link machinery) and write the Status as a statement of what is BUILT vs DESIGNED vs GESTURED in the framework's own vocabulary (`BIO_Content_Framework_v0_10.md` Part II marks constructs [BUILT]/[DESIGNED-not-built]/[GESTURED]/[ABSENT] — reuse it), the Place as the level-1 home (`BIO_System_Design.md` §3 names the capture construct's home), and the Incomplete list honestly. `--write` does the Contents. Add all seven to §5's table. Nothing in `bio-plane/src` moves.
accepts-when: front matter per `CORPUS-STANDARD.md` §3's grammar on every file named in scope, each file ADDED to §5's governed table in the same commit (`CORPUS-STANDARD.md` is itself governed — bump its Status `as of` and regenerate its Contents if a heading moves); `node tools/corpuscheck.mjs` 0 fail over the WHOLE governed set; the Incomplete list HONEST per §6 — a section incomplete in fact and unmarked is the defect, "None" only with how it was established; `node tools/gates.mjs` green (class DOCS: the doc-facing suites plus `plancheck --local`); plancheck bare 0 fail after CONDUCT's push.
NEGATIVE CONTROL: run and recorded, on one retrofitted file, each arm ALONE — (1) the Status `as of` date pushed behind the file's last commit day → corpuscheck FAILS naming the file; (2) one heading edited without `--write` → FAILS on the Contents divergence; (3) an Incomplete bullet naming a section the document does not have → FAILS; each restored by `cp`-back verified by hash (never `git checkout --`), and the final files pass byte-for-byte (over-strictness).
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 inbox entry, act 1 — one prose-only item per owner group; the Status/Place/Incomplete judgment is the owner's, and for a DORMANT area CONDUCT answers-for in the row and the worker writes it)
landed: `8799175`, merged on `main` at `d7cf295`. **Seven documents, 30 Incomplete bullets, none "None". Worst stale claims: `AUTHORITY-AND-TRUST.md` "Nothing here is BUILT yet" (false since 0.54.0) and the mechanical-determination clause [ABSENT] (`index.mjs` ~:5291 marks `determined` only on a caller's assertion); `LINK-FIDELITY.md` `site_chrome` never built — chrome is a per-link boolean; `ARCHIVE-FALLBACK.md` "Design, not built" (CAP-3 wired it); `SOURCE-ACCESS.md` still says the fallback is IDLE; `CAPTURE-SCALING.md` §Job one SUPERSEDED by `reuseDecision` (recency of fetch, 24 h, because the stability gate measured as reusing nothing); `CAPTURE-FIDELITY.md` records `SUBRESOURCE_CAP` ~40 — it is 400; `CLIENT-RENDERED.md` [DESIGNED-not-built], nothing renders, blocked on D-55.** corpuscheck 27/0 at the branch; gates DOCS green; `op-claims` caught a DO-internal path written as if it were an op in the worker's own prose before landing (corrected to `op=links` / `Store#resolveLinks`). NCs 3/3 on `CAPTURE-FIDELITY.md` — arm 1 had to be RE-ARMED (a `git log -1` over eight paths returned the newest of any, not the file's own day; an arm that did not arm is a finding). Findings enacted: D-109 discharged in fact → CLOSED (task-drain consumer on the reconciling alarm, `store.mjs` ~:1987); the two design-contradicts-plane candidates → **D-339** (CAPTURE-SCALING §Job one vs `reuseDecision`) and **D-340** (LINK-FIDELITY `site_chrome` vs per-link chrome); `CLAUDE.md`'s "598 of them, 167 KB" is stale (761 now) — HELD under the standing rule and surfaced to BOB, not edited.

### CAP-7 · done
milestone: M2 — the capture axis's reach, measured; follow-on (if material) a CAPTURE host-stack handler under M2
interface: none — a number in `MEASUREMENTS.md` and one dated sentence in a governed design document; no shape, no op
design: `BIO_Content_Framework_v0_10.md` Part II §16, the "Google Drive formats — not supported, and not yet measured" paragraph — the sentence this row's figure replaces, and the design that says the support is a CAPTURE-side act rather than a new format
depends-on: none (COFF-6's census — `MEASUREMENTS.md` "2026-08-03, session COFF-6", 43,282 `oaklandca.gov` assets as the WHOLE population plus the 792 Legistar attachments — is the corpus; Part II §16's "Google Drive formats — not supported, and not yet measured" paragraph is the sentence that changes)
scope: over COFF-6's census corpus (re-list from the account the way COFF-6 did, or read the register if it is cheaper — say which, and why the population is the same one), count the links whose target host is `docs.google.com`, `drive.google.com`, `sheets.google.com` or `slides.google.com`, BY KIND from the URL shape (document, spreadsheet, presentation, folder, file, other) and by whether the link is in a captured page's body or is itself an asset; record the figure with its instrument, date and the exact command in `MEASUREMENTS.md`, and replace "not yet measured" on Part II §16's Drive paragraph with the dated figure (the framework is governed: bump its Status `as of`, `corpuscheck --write` if a heading moves). NOTHING IS BUILT: no handler, no host-stack entry, no schema. The report states the count and stops; CONDUCT rules materiality on the row.
accepts-when: the figure is in `MEASUREMENTS.md` with the instrument and command that produced it, re-runnable; Part II §16's paragraph carries the dated figure and no longer says unmeasured; `node tools/corpuscheck.mjs` 0 fail; `node tools/gates.mjs` green (class DOCS unless a script was added — if a counting script is committed under `bio-plane/scripts/`, the class is FULL and the four gates run); plancheck 0 fail.
NEGATIVE CONTROL: run and recorded — the counter over a planted fixture with a known number of Drive links of each kind returns exactly that number (and zero over a fixture with none); a `drive.google.com` link with an unknown shape lands in `other`, never silently in a kind; over-strictness: a `google.com` link that is not Drive (maps, search) is NOT counted.
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 "two small acts" inbox entry — act 1 as a measurement item; placed in CAPTURE because the follow-on, if any, is CAPTURE's host-stack handler, and a measurement sits beside the item it gates)
landed: `22bf3e3` (rebased onto `8f2023f`), merged on `main`. **THE FIGURE: 50 Drive link occurrences · 22 distinct targets · 16 source documents — by kind 16 Docs, 16 `/file/d/`, 12 Sheets, 6 other, ZERO Slides, ZERO folders; by where, EVERY ONE inside a document's body and NOT ONE an asset key or a Legistar attachment in its own right (0 of 43,283 keys, 0 of 793 attachments, 0 of 62 html, 0 of 166 csv, 4 in 762 OOXML, 46 in a 1,000-of-27,783 PDF SAMPLE). 50 is a FLOOR: 98.9% of the corpus by bytes was sampled not censused (a full PDF census is ~6.4 h); 12 of 1,000 sampled PDFs carry a Drive link → point estimate 333 PDFs corpus-wide, Wilson 95% [191, 579], labelled an extrapolation.** Population re-listed anonymously the way COFF-6 did (43,283 keys vs 43,282; 793 vs 792 attachments — the Legistar half is COFF-6's shape but a different draw of "most recently modified"); no credential was needed and the brief's claim that `.env` carried one was WRONG, stated. Recorded as MEASUREMENTS.md M-13 with both commands (`drivelinks 1000`, `drivederive`) and the blind spots; Part II §16's paragraph carries the dated figure (merged by hand at this integration over COFF-10's landing of the same paragraph — its two now-false sentences replaced, nothing else). The instrument is COFF-6's own `tools/measure-office-corpus.py` gaining three commands (a stated deviation from `bio-plane/scripts/`: the corpus's definition already lives there). Gates on the branch: FULL green — battery 188/188 · 11,474, strict exit 0, UI harness exit 0, corpuscheck 44/0. NCs 6 arms / 45 assertions — **the `.rels` arm came back 0 of 14 on its first run: one raw `&` in a Target made the XML parser refuse the part and the extractor read a ParseError as "no links" — a malformed `.rels` in the wild would have scored ZERO while the run looked clean; fixed with a raw-bytes fallback and the malformed fixture kept as a permanent arm; without it the OOXML row would read 0 instead of 3.** The over-strictness arm fired on the REAL corpus too: 197 non-Drive google links refused against the 50 counted. **THE PRIORITY RULING (CONDUCT's, on the row as promised): MATERIAL ENOUGH to keep CAP-8 in the dev slot it holds — hundreds of the city's own documents point members at Drive files the record cannot presently read — and NOT ENOUGH to preempt the D-164 content track, which stays first in RECORD's slot; CAP-8 runs to completion where it is and CAP-9 follows it on CAPTURE's ground.**

### CAP-8 · running — spawned 2026-09-14 by CONDUCT #10, Opus 5, worktree-isolated, into the dev slot CONTENT-OFFICE freed (CAPTURE re-activated for it), AFTER COFF-10 reached `origin/main`. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the capture path; if none does, this row reads `queued`. **Prior state, kept as the record: waited on COFF-9 and COFF-10; act (3) of Bob's Drive ruling, the handler that KEEPS the link and acquires the export. CAP-7's count, when it lands, sets where this sits against other work — it does not decide whether.**
milestone: M2 — a source that links to a Google Drive file yields captured, extractable bytes rather than an application shell
interface: I1 (bytes → content: the register entry, R2 key, content type, transport record and PROVENANCE CHAIN) — the hop's facts (export address, export format, producer) are DERIVED by the plane at acquire, never handed in by a caller (D-112: a hop a caller can hand us is one a caller can invent); if the hop shape moves I1, file the IC BEFORE building
design: `BIO_Content_Framework_v0_10.md` Part II §16, the "Google Drive formats" paragraph — it designs exactly this handler (*"a host-stack handler that recognises a Drive address and acquires the export, recording the Drive file id and the export format as the hop's facts"*) and carries Bob's 2026-09-14 ruling verbatim; `BIO_Intake_Doctrine_v1_1.md` governs the capture construct the handler joins
depends-on: COFF-9, COFF-10 (an export nobody can read is a held document, not content — `CLAUDE.md`'s document-is-not-the-answer rule)
scope: a Google Drive HOST-STACK handler in the capture path: recognises `docs.google.com` / `drive.google.com` / `sheets.google.com` / `slides.google.com` addresses by shape (document, spreadsheet, presentation, file, folder — folders and unknown shapes are NAMED as not harvestable, not silently skipped), KEEPS the link exactly as captured on the source page, acquires the OpenDocument export (`export?format=odt|ods|odp` — the plane composes the export address from the file id and kind) as THE capture with the export address, the export format and the producer as the hop's facts, and REFUSES the application shell BY NAME (the HTML app page is never filed as the document). The governor, allowlist and every existing capture rule apply unchanged to the export fetch. Bob's ruling verbatim on the row: *"A link to a Google Drive file should keep the link and export an OpenDocument version that the content is extracted from."*
accepts-when: driven through `op=acquire` on a fixture Drive address (the fixture serving both the shell and the export): the register holds the EXPORT bytes with the hop's three facts, the source page's link is unchanged, and the shell is refused by name in the transport record; a folder address is named unharvestable; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0 with a control-plane assertion for any new op or check; battery green own-baseline; UI harness from the repo root; `op=audit` clean; plancheck 0 fail. Live-verify ONLY in the smoke instance's scratch namespace against a real public Drive document, and sweep it after.
NEGATIVE CONTROL: run and recorded — (1) the export fetch failing (403/404) → the capture is REFUSED with the failure named, the shell is NOT filed as a fallback; (2) a hop fact supplied by the caller → refused (D-112's rule, driven); (3) over-strictness — a `google.com` address that is not Drive (maps, fonts, search) takes the ordinary path, byte-for-byte the current behaviour; (4) the shell served with a `text/html` content type at the export address → refused by name, never parsed as a document.
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 inbox entry "Bob ruled the Google Drive harvest" — three acts rowed in dependency order; CAP-7's count sets their PRIORITY, not whether)

### CAP-9 · queued — **REC-82's DELEGATION to CAPTURE (D-345): nothing persists a capture's page count, so the out-of-range refusal C-45.1 reaches only documents whose reading carries one; carry I2's page count onto the persisted reading at `op=acquire`. Small, CAPTURE dormant — CONDUCT answers-for at spawn.**
milestone: M4 — D-164's out-of-range refusal made complete; design authority: `BIO_Content_Framework_v0_10.md` Part II §16 (the extraction path as built) and IC-83's Rules ("the page count I2 already carries at acquire — stored on mint")
interface: I1 (the persisted reading gains a field the plane already computes — additive; say on the row whether an IC is owed before building, by reading I1's registry entry)
depends-on: REC-82 (landed — `content.page_count` is the consumer)
scope: at `op=acquire`, persist the page count I2 already reports for a paged document onto the reading the plane stores, so `contentContextFor(captureSha)` answers `pageCount` for every captured PDF rather than only mixed documents; NULL stays undetermined-and-stated for a document with no pages (not a refusal). Nothing else in the capture path moves.
accepts-when: a freshly acquired PDF's reading carries its page count and a `pdf-page` leg beyond it is refused by C-45.1, driven through `op=acquire` then `op=promote`; `cd bio-plane && npm run test:battery` green own-baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; UI harness from the repo root; plancheck 0 fail.
NEGATIVE CONTROL: run and recorded — the page count dropped from the persisted reading → C-45.1 cannot fire on that document and the suite says so BY NAME (the arm that proves the gap was real); over-strictness: an HTML capture (no pages) still acquires with `pageCount` NULL and stated.
added: 2026-09-14 · CONDUCT #10 (REC-82's report's DELEGATION converted to a row in the same integration turn)

## FRAMEWORK — ACTIVE (re-activated 2026-09-14 by CONDUCT #10 as a third dev area for FW-17, act 6's reading-position item; DORMANT from 2026-08-03 — FW-15 landed; FW-13/FW-14 wait on REC-11/REC-19 — until this)
*(Heading restored 2026-08-10 by CONDUCT — see the note under RECORD. Every FW item is
closed and sits in the register below; the area's DORMANCY REASON is the thing that was
lost, and it is why the heading is worth restoring with no items under it.)*

### FW-16 · done
milestone: M0 (background lane, holds no slot) — the design corpus standard, Bob's 2026-09-14 ruling: `docs/architecture/CORPUS-STANDARD.md` §5 "Not yet governed"
interface: none — front matter and one row in `CORPUS-STANDARD.md` §5's governed table; no shape, no op, no behaviour moves
depends-on: none
scope: `docs/development/DOCUMENT-PROFILES.md` (~19 KB). Read against `docprofile/**` as it stands (three registered types since CPDF-10 — the registry's own stale comment is CPDF-17's, do not touch it here) and against Part II §15–§16; Status/Place/Incomplete as the rows above; `--write`; §5 row. Same worker as REC-80 and COFF-8.
accepts-when: front matter per `CORPUS-STANDARD.md` §3's grammar on every file named in scope, each file ADDED to §5's governed table in the same commit (`CORPUS-STANDARD.md` is itself governed — bump its Status `as of` and regenerate its Contents if a heading moves); `node tools/corpuscheck.mjs` 0 fail over the WHOLE governed set; the Incomplete list HONEST per §6 — a section incomplete in fact and unmarked is the defect, "None" only with how it was established; `node tools/gates.mjs` green (class DOCS: the doc-facing suites plus `plancheck --local`); plancheck bare 0 fail after CONDUCT's push.
NEGATIVE CONTROL: run and recorded, on one retrofitted file, each arm ALONE — (1) the Status `as of` date pushed behind the file's last commit day → corpuscheck FAILS naming the file; (2) one heading edited without `--write` → FAILS on the Contents divergence; (3) an Incomplete bullet naming a section the document does not have → FAILS; each restored by `cp`-back verified by hash (never `git checkout --`), and the final files pass byte-for-byte (over-strictness).
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 inbox entry, act 1 — one prose-only item per owner group; the Status/Place/Incomplete judgment is the owner's, and for a DORMANT area CONDUCT answers-for in the row and the worker writes it)
landed: `97232bf`, merged at `de36ac7`. **`DOCUMENT-PROFILES.md` [BUILT] as `docprofile/`, 5 incomplete — worst: §Known gaps' "the plane has not adopted it" is stale (the plane imports docprofile and stamps the profile at `op=acquire`; `op=audit`'s duplicate sweep is discharged on the evidentiary digest, intra-bundle only; monitoring and `resolveLinks`' bracket still raw; `compare()` has no caller).** `registry.mjs` untouched (CPDF-17's). §5 row added, not-yet row struck.

### FW-17 · running — spawned 2026-09-14 by CONDUCT #10, Opus 5, worktree-isolated, FRAMEWORK re-activated into a THIRD dev area for the content track (the budget is eight workers, at most five on the contended files; this is the fourth on `store.mjs`), AFTER REC-82 reached `origin/main`. Its I2 IC is minted at spawn as **IC-86** (the IC-64 lesson: mint shared-namespace ids at spawn, never let two branches read the same floor). Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on `docprofile/**`; if none does, this row reads `queued`. **Prior state, kept as the record: waited on REC-82; FRAMEWORK was DORMANT — activate into a slot or CONDUCT answers-for at spawn; its own IC on I2 minted at spawn.** — **Act 6 item 9 — reading position: `parse()` entities and `reading_refs` gain WHERE a reference was read (I2 bump); then RECORD: `connections` carry the determining reference pair (Bob's 5.4, D-161) and a portion leg's connection grade becomes computable (5.1).**
milestone: M4 — D-164, the content-extent primitive (RECORD)
interface: I2 — its OWN IC (a bump: readings carry position), then I5 for the pair on `connections`
depends-on: REC-82
scope: the inbox entry's item 9, in two halves that may be one worker: (a) FRAMEWORK — `docprofile`'s `parse()` entities and the plane's `reading_refs` carry the position a reference was read at, in IC-1's extent vocabulary; (b) RECORD — `connections` carry the DETERMINING reference pair (the pair of positions that established the connection, D-161), so a portion leg's connection grade is computable rather than UNDETERMINED (closing the UNDETERMINED REC-83 states).
accepts-when: a connection written from two readings carries its determining pair and a portion leg on one of them answers a connection grade, driven; readings without position still write (the field is nullable, absence STATED); `cd bio-plane && npm run test:battery` green — measure your own baseline (~187/187 · ~11,343 with all three member installs); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0, with a control-plane assertion for every new op or check in the same turn; `node civicos-ui/test/run.mjs` from the repo root, unpiped; `op=audit` clean in scratch; plancheck 0 fail
NEGATIVE CONTROL: run and recorded — a connection with no pair must still state UNDETERMINED for a portion leg (the closing is per pair, never assumed); the pair forged from readings that do not cover the extent → refused; over-strictness: document-grain connections byte-identical.
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 act-6 entry: the nine items scoped there, in its dependency order; the entry's item text stays in the inbox record as the scope's authority beside IC-83/IC-84 and the D-164 study — a notification, not a second copy)

## CONTENT-HTML — DORMANT
Not yet carvable; see `kickoffs/CONTENT-HTML.md`. D-64 waits on the rendered-capture
path, NOT on a doctrine ruling: D-55's doctrine was ruled by Bob (third-party script
output is attributed to that party) and its SHAPE is decided provisionally in
`MILESTONES.md` under M2 — attribute by ORIGIN via `rendered_origins[]`, not by region,
which needs no new reference granularity. Scope this area against that shape when a
slot frees. *(Heading restored 2026-08-10 by CONDUCT.)*

## IS BUILD PLAN — STATUS. **COMPLETE, 2026-09-13: VF-4 — the last row — landed verified live. Forty-three rows, every one done, satisfied, or superseded with its successor named. The build that began as INVESTIGATIVE-SESSION.md §18 is deployed at 0.57.0 and verified end to end in the instance's own scratch; what the closing row found (D-323/D-324/D-325) is queued work, not plan residue.** *(Header re-measured at each prior boundary; the 2026-08-10 six-rows state is history below, kept as written.)*

**UPDATED IN THE SAME TURN THE SK ROWS MERGED, DELIBERATELY.** This section exists because the plan's status was unreadable for three days; leaving it stale after closing the rows it tracks would be that failure recommitted by the person who diagnosed it. Read it as of `2cd9cb6`.

**This section exists because the plan's status was UNREADABLE and its absence was
mistaken for its emptiness.** `docs/archive/IS-BUILD-PLAN.md` (2026-08-07; archived 2026-09-14 by M0-26, complete at 43/43) holds the scope for six
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
item heading) and `| <ID> |` (a track table row in `docs/archive/IS-BUILD-PLAN.md`) — **so writing these
ids in either shape here would ALLOCATE them a second time**, and `plancheck` failed exactly
that way on this section's first draft. That failure is correct and worth keeping: **the
plan OWNS these ids and this file TRACKS them**, and two files opening one id is the
mirror-and-drift class the 2026-08-07 drain refused when it declined to transcribe the plan.
Leading with the owner keeps this a reference. **Do not "fix" it by bolding the ids to slip
past the matcher** — that dodges the detector without removing the second authority, which
is the defect wearing a disguise.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| ~~CONDUCT~~ **DONE** | SK-2 | the investigative skill — §14b.4's table parsed out of the design, authority held to its right column in both directions | **landed `e1f497f`, merged 2026-08-10** |
| ~~CONDUCT~~ **DONE** | SK-3 | the prohibition set — verbatim as a LOOKUP against its source documents, not as a discipline | **landed `496fe8c`, merged 2026-08-10** |
| ~~CONDUCT~~ **DONE** | SK-4 | CHECK deploys first — the sequencing RECORDED, FL-3's gate dereferenced rather than re-implemented | **landed `f4483e6`, merged 2026-08-10. Its LIVE half is VF-4's and is not reached — printed by the suite every run, never simulated.** |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | FL-2 (landed) |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | DS-1 |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | DS-1 |
| ~~DIST~~ **DONE** | DS-4 | the gated deploy, then hand to VF-4 — 0.57.0 cut+signed at `ba05e9c`, deployed and SERVING account-wide (plane + agent-worker + ocr-worker with both upload parts + pdf-worker, all `/version` 0.57.0). DEC-43 re-read: biosmoke7 monitors on the ADMIN_TOKEN fallback, so this WAS a fallback-instance deployment; the fallback stays per the ruling, read recorded in the release-note commit `39730b1`. Deploy by the outgoing DIST (stand-down `14c5470`); independently re-verified by DIST #2 from the account: plane bytes byte-identical to the signed manifest (2,715,828 B), ocr parts byte-identical, member main modules wrangler-rebuilt from source per agent-worker's own THE-SOURCE-DEPLOYS ruling | **done 2026-09-13 — VF-4 unblocked** |
| FLEET | FL-6 | the Claude-account cascade at runtime | **DS-3** |
| ~~VERIFY~~ **DONE** | VF-4 | live verification in scratch — **landed `cd11250`, merged 2026-09-13. ALL FOUR ACCEPTS-WHEN CLAUSES MET LIVE: the run completed (FL-3's landed table IMPORTED, 11 steps, 21 live plane calls, bound `completed`); the suggestion landed in scratch and read back; the sweep took every derived counter to 0; `op=audit` clean through the control plane, re-measured twice. ONE BUILD ANSWERED EVERYTHING — 0.57.0 read three ways at start AND exit, isolate and Durable-Object routes both. The real record's 13 counters identical before/after every arm. THE RUN EARNED ITS KEEP: D-323 (the deployed plane REFUSES the empty-run control's own object — `level-empty:` carries a colon `VERSION_NAME_RE` forbids, so VF-1's owed control 7 cannot write live, three suites asserting the colon form against a permissive mock) and D-324 (`new-version` is not one of §9's five kinds). NC 1 reported honestly as NOT-AS-WRITTEN: the scratch confinement confines the PROBE class only — ADMIN goes where told — so the no-write claim rests on the item's discipline plus the witness counters, recorded as D-325. THE IS BUILD PLAN IS COMPLETE.** | **SK-4 and DS-4 — met** |

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

### FL-7 · done
milestone: M9
interface: possibly I3 — an added run ENDING is a published vocabulary; file the IC with measured consumer impact if the shape moves
depends-on: none — FL-3 is landed
scope: **SK-4's DELEGATION, and it is a defect in what the record SAYS HAPPENED.** FL-3's mode gate closes a refused run with `bound: "cancelled"` — and the plane's `RUN_ENDINGS` defines `cancelled` as **"a member stopped it"**. A member did not; the gate refused a launch. **So the record currently attributes a machine refusal to a member act**, which is the misattribution class this project ranks worst, sitting in a run's own ending. Second half, measured: **`mode-not-deployed` — which `harness.mjs`'s own header says a refused run terminates on — appears EXACTLY ONCE in the repository, in that comment.** It is in neither `RUN_ENDINGS` nor `RUN_BOUNDS`. FLEET's call which way to close it: add an ending (a two-area change touching `airun.mjs`, likely an IC) or correct the comment — **but not both readings can stand, and the comment currently describes a value that does not exist.**
accepts-when: a run refused by the mode gate ends carrying an ending that names what actually happened, driven through the op rather than asserted at the store; whichever way it closes, `harness.mjs`'s header and the catalogue AGREE, asserted in both directions.
NEGATIVE CONTROL: SK-4's ARM D5 pins BOTH facts today and **will go RED on the fix, deliberately, so the correction and the arm move together** — do not exempt it; correct it with a dated reason. Additionally: close a gate-refused run as `cancelled` after the fix and the member-attribution assertion must fail naming it.
added: 2026-08-10 · CONDUCT (SK-4's delegation, enqueued as an ITEM — the rule this queue has had to learn three times today: a note is not an item)
landed: `a3d28ac`, merged on `main`. **THE ENDING WAS ADDED, NOT THE COMMENT CORRECTED, and the argument is the item.** Correcting the header would have closed the CHEAP half and cemented the EXPENSIVE one: the disagreement was the symptom, the misattribution was the bug, and editing the header to admit `cancelled` would have left a machine refusal permanently on record as a member act — **with the header's new accuracy as the reason it became permanent.** The precedent that appears to argue the other way is quoted in `harness.mjs`'s OWN header (§14b.6: *the record already has the word and lacks the writer — build that producer rather than minting a new kind*), and **it is conditional on the word EXISTING; measurement says it did not** — `mode-not-deployed` occurred exactly once in the repository, in the comment promising it, and ZERO times as a defined or produced value. Both existing endings are false of a gate refusal, and `RUN_ENDINGS`' own header already carried the argument one value over (*"the member asked for it to stop" and "the budget ran out" are different facts*). It is an ENDING and not a BOUND, because no bound was reached. **THE HEADER AND THE CATALOGUE ARE HELD IN AGREEMENT IN BOTH DIRECTIONS, AND NEITHER IS THE OTHER'S EXPECTATION** — `harness.test.mjs` A6b parses the catalogue from the plane's source and the claim from the harness's prose, with no literal retyped. **Control arm F3 is what EARNS that: pointing the header at a DIFFERENT REAL ending failed EXACTLY ONE assertion (208/1) — one comparison written twice would have failed both together.** IC-62 filed BEFORE building; measured basis: 10 files read `RUN_ENDINGS`, nine derive from `Object.keys` or look up by key and absorbed a third term with no edit, exactly ONE carried a hand-written exhaustive expectation; **`civicos-ui` impact is zero and STRUCTURALLY so** — its ARM V1 asserts the UI holds no copy of the vocabulary, so the change stayed two-area rather than three. Battery 164/164 · 10,134, `--strict` exit 0 read unpiped by redirection. NCs 4/4 as declared, each armed ALONE, including an over-strictness arm proving a GENUINE member cancellation still reads as a member act. **SK-4's ARM D5 CORRECTED, never exempted**, with a dated block recording what it asserted before and why that was right when written — and recording SK-4's judgement as VINDICATED: it could not fix a two-area defect, so it chose an arm that would go RED over a note that would rot. **THE FOURTH INSTANCE OF THE BLIND-ASSERTION CLASS, and the worker had read all three prior declarations before writing it:** arm F2 came back with the suite DYING rather than failing, because a new arm read `gl.entries[len-1].bound` and a refused close leaves no terminal entry. *Knowing the defect class did not prevent it; running the control did.* Swept across every nested read added, not the one site.


## SKILL — ACTIVE · **THE TRACK IS DRAINED. SK-2, SK-3 and SK-4 all landed 2026-08-10** (promoted the same day into the slot UI-53 freed; `kickoffs/SKILL.md` written in the SAME ACT, per the rule `plancheck` enforces)

**THE BUILD PLAN'S ENTIRE CONDUCT SHARE IS NOW COMPLETE.** What remains of `IS-BUILD-PLAN.md` is DS-1..DS-4 in DIST's own session, FL-6 and VF-4 each waiting behind a DS row, and PL-16 behind Bob's DEC-33 deferral — **none of it schedulable here, and that is the plan's shape rather than a stopping point.** One new SKILL row (SK-5) is seeded below: the recipe layer, which THREE items have now inherited and which cannot close from inside this area.

**PROMOTED THE SAME DAY IT WAS SEEDED, and the reason is a MEASUREMENT rather than a change of mind.** It was seeded DORMANT earlier in this turn on the reading that both slots were held. That reading was wrong and the queue's own status was why: **UI-53 read `running` with no worker alive** — its work has been on `main` since `a7b027f`, its holding session is gone, and its claim was one of four released as stale in this same turn. Measured, not assumed: zero live workers, four claims held by dead sessions, ~120 abandoned worktrees under `.claude/worktrees/`. **So the UI slot was never occupied; it only looked occupied**, which is the third instance this month of a stale status costing a scheduling decision (PL-18, PL-19, now UI-53). Slots now: **RECORD (REC-69, genuinely open) and SKILL.**

**REC-69 HOLDS RECORD'S SLOT AND IS BLOCKED ON A JUDGEMENT THAT IS NOT CONDUCT'S.** Its branch is green on itself and unmerged; what stops it is whether `aiRuns` is `PUBLISHES` or something the four roles do not yet name — a judgement about what the record publishes, which is RECORD's call. **Guessing it to get a green push is the overclaiming this project refuses**, so it stays open rather than being closed by the scheduler. Its stale path reservation was released; the item was not.

The doctrine and judgement layer of `docs/archive/IS-BUILD-PLAN.md`, **constrained to what a skill may
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
so opening a `### UI-60 · queued — **a POINTER row, not slot-eligible while content is the priority (Bob, 2026-09-15): the residue is decomposed into scoped rows at UI's next activation, and this row exists so the plan items stop living only in a MILESTONES gap-table line.** — **UI-PLAN's unrowed residue, named by UI-58's retrofit: U13 (phone parity beyond the viewing MVP), U14 (the hardening pass — keyboard and screen-reader coverage, 500+-bundle performance, deploy-token rotation), expertise and licences (no surface), verified export (no surface, §8), the doorbell (`op=inbox`/`inboxget`/`inboxresolve` unsurfaced) — plus UI-43's undrained version acts (`ACTS_AWAITING_SURFACE`'s `attesttext` row says `owed_by: "UI"` with no item id; UI-43 was rowed in `IS-BUILD-PLAN.md`, partly ran, and never drained its rows).**
milestone: M8
interface: none
depends-on: Bob's re-prioritisation of UI (DEC-33's deferral and the 2026-09-15 content direction stand)
scope: at activation, CONDUCT decomposes each named piece into its own row with an accepts-when a command can answer, minting ids then; the `attesttext` bill gets an actor and an id first because it is a bill on the register today. Until then nothing is built from this row.
accepts-when: the decomposition exists as rows and this pointer is marked superseded naming them.
NEGATIVE CONTROL: (at decomposition) each row carries its own; this pointer has none.
added: 2026-09-14 · CONDUCT #10 (a worker report's owed act converted to a row in the same integration turn — the 2026-09-14 sweep rule)
landed: `9249d67` (parented on `9d530ab`), merged on `main`. **TWELVE sites, not eleven — the twelfth a `schema.mjs` citation spelled with the document's full name, invisible to `grep framework:[0-9]`. Every one converted to a SECTION citation resolved against the PRE-SHIFT text to the heading that ENCLOSED the old line: 247/248/251 → §3 "The core objects", 480/489 → §7 "Content types", 554 → §8.1 "Connection GRADE" — and the row's own mapping ("Two directions…", §5, §6) was WRONG in the instructive way: it read what the stale pointers point at in the CURRENT file rather than resolving them, the exact equality-that-costs-nothing the item existed to refuse. The offset is 89, not 84 (every Part I heading moved by exactly 89; an alignment sweep matched 283 lines at +89 against 11 at +84) — the wrong 84 came from the inbox entry and propagated into CPDF-17's two schema paragraphs and this file; the paragraphs are corrected on the branch, this file here.** The worker began on a stale premise (its worktree at `4c6f49c`, CPDF-17 unlanded), found the truth when `git diff origin/main` disagreed with `git diff HEAD`, restored six files from HEAD blobs, fast-forwarded to `9d530ab`, DISCARDED its first baseline and re-measured. Comment-stripped diff EMPTY in all four sources and the rebuilt bundle; FL-10 fired 83/4 → rebuilt → 87/0; `app.html` embeds none of these comments (measured). Gates on the branch at `9d530ab`: battery 187/187 · 11,329 both sides, 0 of 185 counted suites moved (compared, not subtracted); strict exit 0, REGISTER FLOOR line byte-identical (slack 5/1/1 pre-existing); UI harness green; plancheck --local 0/0. NCs 4/4 — the wrong-section arm used a section that EXISTS, so only the heading-TEXT equality caught it. **Two instrument defects the controls found, both safe-direction, fixed at their sites: a removed whole-line `--` comment arrives in a diff as `---` and the file-header filter ate it (caught by the corpus FLOOR, 7 of 12 paired); esbuild without `--minify` keeps some leading comments, reading a comment-only edit as NON-EMPTY.** A near-miss recorded: the worker wrote the self-matching `pgrep -f` wait WORKER.md forbids and killed it before it ran. **CONDUCT's own error on this row, stated: its accepts-when and NEGATIVE CONTROL lines were the front-matter retrofit's boilerplate (a row helper reused across items), not this item's — the worker ran the controls the SCOPE line names; the boilerplate stands as the record of the mistake.** Class sites deliberately left: four `framework:NNN` in `reading.test.mjs`/`connection.test.mjs` (two in executable suite titles — outside a comment-only claim), the embedded copies in `newgroup/src/release.mjs` and `release/` (regenerate at DIST's next cut), `store.mjs`'s `SB-CORE.md` line cites (archived, outside the standard). No ids minted.

### SK-7 · running — spawned 2026-09-14 by CONDUCT #11, Opus 5, worktree-isolated, SKILL + RECORD, AFTER REC-83 reached `origin/main`; SCOPED TO WHAT EXISTS at spawn per the row's own caveat: the plane half (a machine credential mints, is labelled everywhere, never attests, enters a finding only when a member cites) is built; the assistant-side EXTRACT act is built only if `ASSISTANT-PILOT.md`'s front matter and `agent-worker/` show that scope as code, else reported as a DESIGN GAP. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the mint path; if none does, this row reads `queued`. **Prior state, kept as the record: waited on REC-82 and REC-83, and on the assistant pilot's EXTRACT scope (`ASSISTANT-PILOT.md`, itself [DESIGNED-not-built] per SK-6's front matter — say so on spawn if the scope is still unbuilt and scope the item to what exists).** — **Act 6 item 8 — machine-minted rows (Bob's 5.7): the assistant marks passages citable — `minted_by` a machine credential, labelled everywhere it is shown, never attested by it, part of a finding only when a member cites it (DEC-24 rule 3); SKILL + RECORD.**
milestone: M4 — D-164, the content-extent primitive (RECORD)
interface: I5/I3 within IC-83 (`minted_by` is already in the table); the assistant's scope per `ASSISTANT-PILOT.md`
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.4 (who may do what — Bob's 5.7) and §14.2; DEC-24 rule 3; IC-83 (`minted_by`); `docs/development/ASSISTANT-PILOT.md` for the assistant half, scoped to what its front matter says is built; added 2026-09-14 by CONDUCT #11 at spawn (CORPUS-STANDARD §4.7)
depends-on: REC-82, REC-83
scope: the inbox entry's item 8: a machine credential (the `ai` class, FL-6's cascade) may mint content rows (EXTRACT) and may never attest (C-35.10); every surface that shows a machine-minted row labels it as such (DEC-49: the plane's own label); such a row enters a finding only when a member cites it.
accepts-when: a machine-minted row exists, is labelled on the `content` read and on every surface, cannot be attested by its minter, and is absent from findings until a member cites it — driven; `cd bio-plane && npm run test:battery` green — measure your own baseline (~187/187 · ~11,343 with all three member installs); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0, with a control-plane assertion for every new op or check in the same turn; `node civicos-ui/test/run.mjs` from the repo root, unpiped; `op=audit` clean in scratch; plancheck 0 fail
NEGATIVE CONTROL: run and recorded — the machine credential attesting → refused by name; the label dropped from one surface → the vocabulary suite FAILS; over-strictness: member-minted rows unchanged.
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 act-6 entry: the nine items scoped there, in its dependency order; the entry's item text stays in the inbox record as the scope's authority beside IC-83/IC-84 and the D-164 study — a notification, not a second copy)

### SK-6 · done
milestone: M0 (background lane, holds no slot) — the design corpus standard, Bob's 2026-09-14 ruling: `docs/architecture/CORPUS-STANDARD.md` §5 "Not yet governed"
interface: none — front matter and one row in `CORPUS-STANDARD.md` §5's governed table; no shape, no op, no behaviour moves
depends-on: CPDF-17 (running — same file)
scope: `docs/development/ASSISTANT-PILOT.md` (~13 KB). Read against `bio-plane/src/airun.mjs` and the skill pack as shipped (SK-2..SK-4); Status/Place/Incomplete (Place: the assistant construct has NO level-1 home yet — `BIO_System_Design.md` §3's bold rows; say so in Place rather than inventing one, and point at the construct row); `--write`; §5 row.
accepts-when: front matter per `CORPUS-STANDARD.md` §3's grammar on every file named in scope, each file ADDED to §5's governed table in the same commit (`CORPUS-STANDARD.md` is itself governed — bump its Status `as of` and regenerate its Contents if a heading moves); `node tools/corpuscheck.mjs` 0 fail over the WHOLE governed set; the Incomplete list HONEST per §6 — a section incomplete in fact and unmarked is the defect, "None" only with how it was established; `node tools/gates.mjs` green (class DOCS: the doc-facing suites plus `plancheck --local`); plancheck bare 0 fail after CONDUCT's push.
NEGATIVE CONTROL: run and recorded, on one retrofitted file, each arm ALONE — (1) the Status `as of` date pushed behind the file's last commit day → corpuscheck FAILS naming the file; (2) one heading edited without `--write` → FAILS on the Contents divergence; (3) an Incomplete bullet naming a section the document does not have → FAILS; each restored by `cp`-back verified by hash (never `git checkout --`), and the final files pass byte-for-byte (over-strictness).
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 inbox entry, act 1 — one prose-only item per owner group; the Status/Place/Incomplete judgment is the owner's, and for a DORMANT area CONDUCT answers-for in the row and the worker writes it)
landed: `dd9a78d`..`c508dc4` (fast-forwarded to `8017dac` first), merged on `main`. **THE FRONTIER IS CLOSED: 44 governed documents, corpuscheck 0 fail, the "Not yet governed" table EMPTY with its sub-heading and header kept so `corpuscheck.test.mjs`'s arm keeps teeth honestly (no backticked path left in the section — the suite harvests the whole section).** `ASSISTANT-PILOT.md`: [BUILT] in four layers but as the INVESTIGATIVE SESSION's pack, not an assistant's; §2's flow and §3's wizard [DESIGNED-not-built] in full; §4 [BUILT] as the `ai` credential class and [ABSENT] as the pilot's read-only scope; 8 incomplete — the most important stale claim is the document's own TITLE (the investigative session is the first AI integration built, per `BIO_System_Design.md` §3 row 11); `~305 detail:` strings → 614, `120 per-op classes` → 171; §4's two-principal key model overtaken by FL-6's three-level cascade; DEC-47 called open — it is answered; 12/12 `MACHINE_CANNOT_*` codes now translated where SK-1 measured 1/12. Place names the gap: construct 11 has no level-1 document. Gates on the branch: DOCS green (19/19 · 1,124 + 4 UI), corpuscheck 44/0 re-run AFTER committing (M0-26's bound). NCs 4/4 — **arm 1 came back GREEN first: the Status carried TWO `as of` dates and corpuscheck exec's the FIRST; fixed to one, re-armed, fails as declared; the class swept over all 44 (three benign doubles: `UI-PLAN.md`, `UI-KICKOFF.md`, `NOTIFICATIONS.md`, equal dates).** The worker's DELEGATION (should corpuscheck refuse a Status with more than one `as of`) → **M0-28**, decided YES. CPDF-17's §14.3 pointer at lines 67–72 verified present, not redone.

### SK-n ·` heading here would allocate each id a SECOND time — `plancheck`
fails it, correctly, and the failure is the repository refusing to hold two authorities for
one id. **So the plan holds the SCOPE and this section holds the STATUS, the dependency and
the promotion order**, which is precisely what the 2026-08-07 drain meant by "a pointer row
per wave slot" and what it never actually wrote. Read the scope from the plan's own row; do
not transcribe it back here, because a copy starts rotting the day it is made.

| state | row | depends-on | the one thing a worker would otherwise get wrong |
| --- | --- | --- | --- |
| **DONE — `e1f497f`, merged** | SK-2 | none; SK-1 landed | **grades are COMPOSED, never MINTED**, and **the model NEVER decides when the loop stops** (TREC 2011, +95/−87) — it decides what to SEARCH. Four-level search states WHICH absence per level: *no meaning derived*, *nothing extracted*, *no document*, *nobody looked* are four different facts and must not read alike. Bias minimisation sits ON TOP of the fence, never instead of it (§14). |
| **DONE — `496fe8c`, merged** | SK-3 | SK-2 (landed) | The five PRACTICE-SURVEY prohibitions go in **VERBATIM**. The sharp one: **no generated justification anywhere** — a generated justification is a fabricated attribution — and **the ONE permitted auto-composition is assembling the member's OWN prior words**. `PL-3`'s landed boilerplate check is the CODE half of the fifth. |
| **DONE — `f4483e6`, merged** | SK-4 | FL-3 and VF-5 — **both landed**; SK-2/SK-3 in practice, since the skill must exist to be gated | CHECK deploys FIRST (§2, SWEEP §4b.7): the record read adversarially against an EXISTING conclusion, aimed at self-directed overclaiming — the primary threat model. **The gate is a ROW IN FL-3's TABLE and is code; SK-4 RECORDS the sequencing and must not re-implement it.** Investigate-fresh enables only after CHECK's first live run is verified, which is VF-4, which waits on DS-4. |

### SK-5 · queued
milestone: M9
interface: I3 — **it needs the plane to PUBLISH the surface registry, which nothing does today; that is the item's whole blocker.** File the IC before building.
design: `docs/development/ASSISTANT-PILOT.md` §1 (the five-layer training pack — the **Recipes** row is this layer, and it is the row that makes build-time validation the thing worth having) and §7 step 1, whose front matter names SK-5 as the blocker on the pack's `absent` recipe layer
depends-on: a published surface registry (unbuilt). **NOT schedulable until that exists** — recorded so the next CONDUCT does not spawn a worker into a wall.
scope: **THE RECIPE LAYER, WHICH THREE ITEMS HAVE NOW INHERITED AND NONE COULD CLOSE.** SK-1 declared it "SK-2's to fill"; SK-2, SK-3 and SK-4 each left it EMPTY and each said so at the site rather than carrying a stale promise. **The blocker is VALIDATION, not authorship, and that distinction is the item:** a recipe is a list of steps naming surface ids and plane ops, and it is worth carrying ONLY IF a step naming a nonexistent surface FAILS THE BUILD. No plane op publishes the surface registry — it is `civicos-ui`'s — so recipes written today could not be validated against anything. **Writing them anyway would buy the APPEARANCE of a layer**, which is the D-106 class arriving as documentation. Take the op names from the registry the plane already EMITS (that layer cannot drift), never from a hand-typed list: **a hand copy agrees at zero cost and this project has measured that five times on five subjects.**
accepts-when: (on unblocking) a recipe whose step names a surface or an op that does not exist **FAILS THE BUILD**; the pack's `absent_because` body is replaced by the layer rather than edited around.
NEGATIVE CONTROL: (on unblocking) point a recipe step at a surface id that does not exist and the build must fail NAMING it; point one at a real surface via a HAND-TYPED op list and the drift assertion must fail — the zero-cost agreement is the arm this item exists to defeat.
added: 2026-08-10 · CONDUCT (SK-4's report — the third item to inherit it. Enqueued rather than left in three file headers, because a promise carried in prose is not an item.)

**ACCEPTANCE AND NEGATIVE CONTROLS COME FROM THE PLAN'S OWN ROWS** — each carries an
`accepts-when` that is a checkable fact and an `NC`. The track's three NCs are worth naming
here because they are what makes the track's constraint enforceable rather than hoped for:
a skill edit that moves loop termination into model judgement must FAIL the
deterministic-table review criterion (SK-2); **a placeholder-text description submitted
through PL-3 must be refused BY C-NUMBER while the skill-only path would have passed it**,
and that asymmetry IS the proof the fence is code (SK-3); and an investigate-mode launch
attempted before CHECK's verification is recorded must be REFUSED by the deployment gate
(SK-4).

**SPAWNED 2026-08-10: SK-2 is live.** SK-3 and SK-4 are NOT spawned beside it and that is the
plan's own constraint rather than a capacity limit — **SK-3 depends on SK-2 and SK-4 depends on
SK-2/SK-3 in practice, so the SKILL track is STRICTLY SERIAL.** Four slots were available and
the plan could fill only one of them; the rest went to unblocked non-plan work chosen for
NON-CONTENTION (UI on `civicos-ui/**`, CONTENT-PDF on the acquire assembly with its region named
in the claim, and two lane items that hold no slot). Spawning SK-3 now would have it build
against a skill that does not exist yet.

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

### DIST-2 · done — **RAN BY DIST #2; landed `681cbbe` (+ index fix `6c8bdf9`), flipped by CONDUCT at integration 2026-09-14 from the CLAIMS release evidence: the installer binds `DAEMON_TOKEN` in BOTH upload paths (REC-33's follow-on, the first gate on DEC-43's fallback retirement). Full gate green on the merged tree (battery 182/183 with the one loud member skip · 11,113; strict exit 0; UI green; newgroup embed 15/15 + wizard 105/105 unpiped), both NC arms run and recorded with byte-identical restores. NO DEPLOY — the next real install/update run is gated to Bob. The owed act arrived STATED WITH ITS ACTOR in the release note, which is the 2026-09-14 rule already working on its first day.**
milestone: M1
scope: **The installer binds DAEMON_TOKEN (REC-33's follow-on).** newgroup generates a DAEMON_TOKEN and binds it in BOTH uploadInstall and uploadUpdate (the SELF-binding precedent DIST-1 established; the update path so already-installed instances receive it). DIST-1's constraint is now satisfied in this direction — the plane classifies the class (REC-33 landed) BEFORE the installer binds it. The ADMIN_TOKEN fallback stays until DEC-43 rules on its retirement. NO DEPLOY: land tested code; the install/update run is gated to Bob.
behind-interface: I4
depends-on: REC-33
accepts-when: the installer suite green with DAEMON_TOKEN generated and bound in both upload paths' built config; `cd bio-plane && npm run test:battery` green; negative control — remove the update-path binding and the suite names the already-installed instance that would never receive it.
added: 2026-08-04 · CONDUCT (REC-33's follow-on)

### DIST-3 · done — **RAN BY DIST #2; landed `40202cf`, flipped by CONDUCT at integration 2026-09-14 from the release evidence: D-54 re-scoped as ruled — the installer REQUIRES AND VERIFIES Workers Paid and refuses to complete dishonestly. Gate green class FULL on DIST's tree (battery 184/184 · 11,213, all three members; newgroup embed 15/15 + wizard 117/117 unpiped). The NC run in BOTH strengths, the sharp one recorded: ACCEPTING the Free answer half-installs with the damage COUNTED (want [0,0] got [2,1]), while merely deleting the check fails SAFE through the unverifiable-plan refusal — the guard's fail-closed geometry working. One assertion corrected, never exempted, on an honest distinction (the probe legitimately PUTs its throwaway; the INSTANCE was never uploaded). No real install run — gated to Bob. THE DIST BACKLOG IS EMPTY; DIST #2 proceeds to D-297 and D-202's open half under BOB's direction.**
milestone: M7
scope: **D-54 re-scoped by DEC-42: the installer REQUIRES Workers Paid, verifies it, and REFUSES to complete rather than installing something quietly degraded.** Detection was the old scope; refusing IS the fix, because the D-106 failure it guards is a group getting something quietly different from every description of it. Verify the plan the way the BOB session measured it (provoke the platform — upload with limits.cpu_ms set and read the answer; code 100328 is Free, HTTP 200 with the limit echoed is Paid) rather than trusting a plan field. The refusal names what is missing, what it costs ($0/month + a card → $5/month + a card — an instance already needs an account and a payment method, and R2 already bills past its free allowance), and what to do; it must never half-install.
behind-interface: I4
depends-on: none
accepts-when: the installer suite green with a Free-plan account refused BY NAME before anything is created and a Paid one proceeding, the plan established by provoking the platform not by reading a field; negative control — accept the Free answer and the suite names the half-installed instance.
added: 2026-08-04 · CONDUCT (DEC-42's item 1)

### DIST-4 · done — **RAN BY DIST #2; landed `6648eb2`, flipped by CONDUCT at integration 2026-09-14 from the release evidence. THE ITEM'S REAL PRODUCT IS THE TWO NUMBERS DEC-43's answer ordered on 2026-08-10 (work item 3, the fleet-visibility report): the fleet's first-ever posture reading — 1 of 1 on the ADMIN_TOKEN fallback, biosmoke7 itself, which deploy.mjs manages and the installer path can therefore never heal (D-202's open half) — and, after the reversible smoke-authority remediation (DAEMON_TOKEN minted and bound via the API, value held nowhere), DEC-43's MEASURED COUNT IS ZERO, live, from the instance's own liveToken-checked answer. The sunset sequencing in the ruling (report → DIST-2 → one cycle → a count of zero) now has its zero. Gate green class FULL on DIST's tree (battery 184/184 · 11,213 with all three members run — the fresh-worktree trap's third-member edition hit and read correctly), two instrument corrections reported not smoothed. Its DELEGATION to RECORD (the denylisted-DAEMON_TOKEN bricked-monitoring shape) is routed as its own item at this integration.**
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

### UI-61 · queued — **waits on REC-83 and REC-84 (the ops it composes against); the consumer half of IC-84.** — **Act 6 item 4 — the composer emits `extent` per leg (the member selects a page and a region in the viewer), the leg display shows `ref`, the viewer jumps to the page or cell, and `stale` renders as UNDETERMINED-stated, never hidden.**
milestone: M4 — D-164, the content-extent primitive (RECORD)
interface: I3 consumer (IC-84); the act shape governed by `BIO_Interaction_Constructs_v0_1.md` — nothing prefilled
depends-on: REC-83, REC-84
scope: the inbox entry's item 4 in `civicos-ui/**`: the frontmatter composer gains a per-leg extent picker (page + rectangle in the viewer for `pdf-page`; `document` by default, stated, never silently); the leg display shows the row's `ref` verbatim (DEC-49: the plane's words); the viewer jumps to the page or cell from a leg; a `stale` row renders as UNDETERMINED with the plane's sentence, never hidden; `check-semantics.mjs` and the vocabulary suites extended, not exempted.
accepts-when: a member can cite a page region and see the `ref` on the leg, driven in the UI harness against the real plane through miniflare; `stale` visible; `node civicos-ui/test/run.mjs` from the repo root, unpiped; `cd bio-plane && npm run test:battery` green — measure your own baseline (~187/187 · ~11,343 with all three member installs); `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0, with a control-plane assertion for every new op or check in the same turn; `node civicos-ui/test/run.mjs` from the repo root, unpiped; `op=audit` clean in scratch; plancheck 0 fail
NEGATIVE CONTROL: run and recorded — the `stale` flag hidden by a one-line change → the harness FAILS naming the surface; a prefilled extent (DEC-69: nothing forced) → refused by the vocabulary suite; over-strictness: a leg with no extent renders exactly as today.
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 act-6 entry: the nine items scoped there, in its dependency order; the entry's item text stays in the inbox record as the scope's authority beside IC-83/IC-84 and the D-164 study — a notification, not a second copy)

### UI-59 · running — spawned 2026-09-14 by CONDUCT #11, Opus 5, worktree-isolated, UI's slot (prose only: `CIVICOS_UI_STATE.md` and `kickoffs/UI.md`; `civicos-ui/**` does not move). Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on those two files; if none does, this row reads `queued`. **Prior state, kept as the record: queued — **The surface ledger is 45 days behind and the kickoff became its log: `docs/development/CIVICOS_UI_STATE.md` has not been prepended to since v33 (2026-07-31) while every UI item from UI-38 on appended to `kickoffs/UI.md` instead — the ledger the record names as the authority answers with July.**
milestone: M8
interface: none
design: `docs/development/UI-PLAN.md` §"The ladder" — the DONE/REMAINING inventory the ledger logs landings against; that file's own Place in the system names `docs/development/CIVICOS_UI_STATE.md` as what it is "logged against by", which is the relation this row restores. Governed (level 2 under `BIO_Interaction_Constructs_v0_1.md`); the prepend-never-edit shape and the rewritten-each-session kickoff shape are `kickoffs/README.md`'s, a process document ungoverned by `CORPUS-STANDARD.md` §6.
depends-on: none (UI-58 landed the measurement)
scope: Bring `docs/development/CIVICOS_UI_STATE.md` current from the landed UI items (UI-38..UI-58 — `QUEUE.md`'s UI section and the CLOSED ITEMS register are the list; `civicos-ui/**` is the fact), one prepended entry per landed surface change, dated to the landing commit; then restore `kickoffs/UI.md` to the shape `kickoffs/README.md` rules (rewritten each session, not appended) by moving its per-item log lines into the ledger they belong in. Prose only; `civicos-ui/**` does not move.
accepts-when: every UI item landed since v33 has a ledger entry naming its commit and its surface; `kickoffs/UI.md` carries no per-item log lines older than the current session; `node tools/gates.mjs` green (class DOCS); plancheck 0 fail.
NEGATIVE CONTROL: (on spawning) a landed UI item deliberately omitted from the ledger must be caught by the worker's own completeness check (an item-by-item diff against the register), driven once; over-strictness: an item that never touched a surface is NOT required to have an entry.
added: 2026-09-14 · CONDUCT #10 (a worker report's owed act converted to a row in the same integration turn — the 2026-09-14 sweep rule)

### UI-58 · done
milestone: M0 (background lane, holds no slot) — the design corpus standard, Bob's 2026-09-14 ruling: `docs/architecture/CORPUS-STANDARD.md` §5 "Not yet governed"
interface: none — front matter and one row in `CORPUS-STANDARD.md` §5's governed table; no shape, no op, no behaviour moves
depends-on: none
scope: `docs/development/UI-PLAN.md`, `UI-KICKOFF.md`, `NOTIFICATIONS.md` (~52 KB). Read against `civicos-ui/**` as shipped (UI-10..UI-57 landed; `docs/development/CIVICOS_UI_STATE.md` is the surface ledger) and `BIO_Interaction_Constructs_v0_1.md` v0.2; the Status of `UI-PLAN.md` must say which of its inventory is BUILT and which is not, by item, not "in progress"; Place names the level-1 home from `BIO_System_Design.md` §3; Incomplete honest. `--write`; all three added to §5's table. `civicos-ui/**` does not move.
accepts-when: front matter per `CORPUS-STANDARD.md` §3's grammar on every file named in scope, each file ADDED to §5's governed table in the same commit (`CORPUS-STANDARD.md` is itself governed — bump its Status `as of` and regenerate its Contents if a heading moves); `node tools/corpuscheck.mjs` 0 fail over the WHOLE governed set; the Incomplete list HONEST per §6 — a section incomplete in fact and unmarked is the defect, "None" only with how it was established; `node tools/gates.mjs` green (class DOCS: the doc-facing suites plus `plancheck --local`); plancheck bare 0 fail after CONDUCT's push.
NEGATIVE CONTROL: run and recorded, on one retrofitted file, each arm ALONE — (1) the Status `as of` date pushed behind the file's last commit day → corpuscheck FAILS naming the file; (2) one heading edited without `--write` → FAILS on the Contents divergence; (3) an Incomplete bullet naming a section the document does not have → FAILS; each restored by `cp`-back verified by hash (never `git checkout --`), and the final files pass byte-for-byte (over-strictness).
added: 2026-09-14 · CONDUCT #10 (draining the 2026-09-14 BOB #10 inbox entry, act 1 — one prose-only item per owner group; the Status/Place/Incomplete judgment is the owner's, and for a DORMANT area CONDUCT answers-for in the row and the worker writes it)
landed: `f4f9733` + `fab0d97`, merged on `main` at `f570296`. **`UI-PLAN.md`: eleven of fourteen rungs BUILT (U1–U10, U12), U11 part-built, U13 GESTURED, U14 ABSENT — the body marks eight; 9 incomplete, worst the "Development is PAUSED" section (57 UI items landed after it). `UI-KICKOFF.md`: principles current and ENFORCED, 4 incomplete; its one named deliverable `BIO_UI_Design_v0_1.md` was never written. `NOTIFICATIONS.md`: the queue surface built FIRST; 9 of 35 catalogue kinds have a producer (D-126 open); no `per-item` weight exists anywhere in the plane.** corpuscheck 23/0 at the branch; gates DOCS green; NCs 3/3 on `NOTIFICATIONS.md` (arm 3 fired twice, one per comma-split ref — reported not smoothed; arm 2 fired on Contents only because the Incomplete resolver matches substrings — the rule as written). Findings enacted: the surface ledger 45 days behind → **UI-59**; the unrowed plan items (U13, U14, expertise/licences, verified export, the doorbell) and UI-43's undrained version acts → **UI-60**; MILESTONES' four stale gap rows marked built. The 85/63/18 op-count table NOT re-taken (no instrument; stated in the Status).

### UI-53 · done
milestone: M8
scope: **THE HAND-WRITTEN `BANNED` LISTS IN `civicos-ui/test/` BECOME CONSUMERS OF ONE DERIVED FAMILY (D-269's delegation to UI).** D-269 measured that the hand lists **do not agree with each other and that NONE would have caught `independently sufficient`** — the phrase that was being rendered to members off `#axisResult` and frozen into signed `bundle.md` frontmatter. **Several disagreeing lists are worse than one, because each reads as coverage.** D-269 built the derived answer on the plane side (`bio-plane/test/analystvocab.test.mjs`: machine-side words MINUS member-side words, with the hand lists' union as a seed floor checked BEFORE the member-side skip) and deliberately did NOT impose it on UI's ground — widening a landed guard from the item that merely bumped into it is the mistake **REC-71** exists to correct. **So the rule here is INVERT, DO NOT LENGTHEN: a list of spellings goes stale the moment a fourth is written**, and the fix is one derivation with the sweeps as consumers, not a longer list in more places. **A list that turns out to be asking a genuinely DIFFERENT question is a FINDING — keep it, named, rather than folding it in for tidiness.**
behind-interface: I3
depends-on: none (D-269 is landed on `main`)
accepts-when: `node civicos-ui/test/run.mjs` from the **REPO ROOT**, exit read **UNPIPED**, 0; `cd bio-plane && npm run test:battery` green with any delta **attributed per suite by re-running the true baseline, never by subtraction** — **measure your own baseline and trust it over this brief**; `node scripts/coverage.mjs --strict` run DIRECTLY, `$?` unpiped, exit 0; `node tools/plancheck.mjs` clean but for UNPUSHED. **The census of ban instruments must NOT be spelling-keyed** — a grep over prose is a hint, not a consumer census, and D-269's own consumer grep under-reported inside the item written to fix it. NEGATIVE CONTROLS run and recorded, each armed ALONE with the others held open, **including an OVER-STRICTNESS arm in which the banned words in a code COMMENT, an internal IDENTIFIER and a FIXTURE ID must all stay GREEN** — the ban is on what a member READS, and a fence tighter than its rule is an undeclared interface change wearing the costume of caution.
added: 2026-08-09 · UI-53 (D-269's delegation to UI; the row is written by the item because CONDUCT had not minted one)
landed: `ac1c7d4`, merged at `a7b027f` on `main`. **STATUS CORRECTED 2026-08-10 by CONDUCT: it read `running` with no worker alive** — the holding session is gone, its claim was one of the four released as stale the same day, and the work has been on `main` since. This is the third instance of the class this month (PL-18 read `queued` and PL-19 read `running`, both corrected 2026-08-10, both with their work already merged), and the queue's own note on PL-18 says what it costs: *the exact shape of a brief that would have sent a worker to rebuild something that exists.* **The UI slot this item was holding is therefore FREE, which is what let SKILL be promoted in the same turn.**

### UI-54 · done
milestone: M8
scope: **DEC-51's enactment — `op=acquire`'s grade note is RENDERED, WHOLE, AT THE MOMENT OF CAPTURE.** Bob's ruling, 2026-08-10: DEC-39 already settles the substance — the plane owns the fence wording and PUBLISHES IT WITH THE ACT, and the act here is the capture itself, so a surface that RECEIVES the record's own account and DISCARDS it withholds at exactly the moment the member forms the belief. Measured today: `addCapture` receives `acquireGradeNote` on every member capture and drops it, so a member's only account of what a capture is worth arrives on the document page afterwards. **WHOLE, NOT SPLIT, and the ruling is explicit about why:** DEC-39's three-part shape was deliberate, UI-28 measured that the parts reassemble character-for-character, and **the clause describing co-attestation — an act unavailable at this surface — is exactly the sentence that stops a member reaching for co-attestation to solve a problem it does not address.** So the co-attestation clause SHIPS; removing it is the defect, not the caution. **VERBATIM, under DEC-49's translation discipline: lift what the plane published, author no member-facing word** — the UI-39/UI-40 pattern (a falsehood deleted without writing a new one; the plane's accounts rendered with no fallback). **UI-32's removal of the COMPUTED GRADE LETTER from that surface STANDS and is not reopened** — this item renders the plane's SENTENCE, never a letter the surface derived.
behind-interface: I3 — consumption only; the note is already published, so no IC is owed unless the shape moves
depends-on: none — `acquireGradeNote` is landed and already reaches `addCapture`
accepts-when: `node civicos-ui/test/run.mjs` from the **REPO ROOT**, exit read **UNPIPED**, 0; the capture surface renders the received note string-for-string against the plane's own export (not against a harness literal — **a hand copy agrees at zero cost and this project has measured that five times on five subjects**, so the assertion must read the plane's value); `cd bio-plane && npm run test:battery` green with any delta attributed per suite; `node scripts/coverage.mjs --strict` run DIRECTLY, `$?` unpiped, exit 0.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) **the arm this item exists for: drop the co-attestation clause and an assertion must fail naming DEC-51's whole-not-split ruling** — a rendering that is merely "most of the note" is the split Bob refused; (2) repoint the harness at a hand-typed copy of the note and the drift assertion must fail (the zero-cost-agreement class); (3) an over-strictness arm — re-introducing a surface-computed grade LETTER must fail, because UI-32's removal stands.
added: 2026-08-10 · CONDUCT (draining the 2026-08-10 BOB INBOX entry, work item 2; DEC-51 decided the same day)
landed: `a63c1b5`, merged on `main`. **THE CO-ATTESTATION CLAUSE SHIPS, AND IT IS DERIVED RATHER THAN LISTED** — the suite splits the note on sentence boundaries and picks the clause carrying the ceiling letter BARE, which is the one clause its own copy-detector is blind to by construction; asserted present by name, per-clause, and string-for-string against `NOTE_FLAT`. **Asserted against the plane's own export, structurally:** the expectation is `ACQUIRE_GRADE_NOTE` imported from `bio-plane/src/affordances.mjs` and RECOMPOSED from `acquireGradeNote(...)` before it is trusted — and because a hand copy would agree with that today, the real teeth are a THIRD sweep detector reading each file's WORD STREAM, since the existing two judge the remainder after `minusPublications` and are therefore blind to an exact copy by design. Four sites in `app.html`, all in the unmarked Add region; `addGo` clears the holder on reset and on both paths where the surface says nothing was added. NOTHING under `bio-plane/**`, so no IC is owed on I3. UI harness 46 suites, 0 FAIL, exit 0 unpiped; `add-surface.test.mjs` 147 → 167 assertions, **delta attributed by RE-RUNNING the restored HEAD files, never by subtraction**; battery 157/157 · 9,844 byte-identical and structurally so (no path under `bio-plane/` in the diff); `--strict` exit 0 direct and unpiped. NCs RUN x5, each armed ALONE, both watched files restored byte-identically by sha256 AND `cmp` against two independent pristine copies: (1) **the arm this item exists for** — drop the note's last clause and it goes RED at *DEC-51 — WHOLE, NOT SPLIT*, with **nothing else in either tree noticing, which is what earns the assertion**; (2) a hand-typed copy leaves every BEHAVIOURAL assertion green — the zero-cost agreement, measured — and goes red only at the new word-stream detector; (3) a surface-computed grade letter returns → RED at *UI-32 STANDS*, ordered before the equality check so a fail-fast run reports the right reason; (3b) the same letter in a CODE COMMENT stays GREEN. UI-32 is not reopened: `ADD_CAPTURE_TEACH` and `addValidate` are byte-unchanged. No DELEGATION and no DECISION raised.

### UI-55 · done
milestone: M8
scope: **DEC-69's ENACTED AUDIT, handed to CONDUCT through the BOB INBOX the same day the doctrine was recorded.** Bob, 2026-08-10: *"the workflow must not be nagging or second-guessing users. The workflow needs to respect users and their judgment. Anything short of that is a flaw."* **AMENDED the same day, and the amendment is the harder half: the operative word is FORCED, and it CUTS BOTH WAYS** — *"they shouldn't be forced to make decisions in bulk. But they should be enabled to when appropriate."* So the rule is about COMPULSION, not about which mode is better: **a surface that offers ONLY bulk is the same flaw as one that offers only forty clicks**, because both take the mode of judgment out of the member's hands. Sweep the member-facing flows for the flaw's THREE SHAPES, each finding corrected in place or brought back as its own item: (1) **re-confirmation of decided acts** — "are you sure" on anything the rung ladder classes reversible or reasoned; (2) **repeated or act-DETACHED responsibility prompts** — a reminder that is not attached to the act it is about; (3) **any surviving diligence MEASUREMENT** of a member (DEC-68: the approval IS the act). **AND THE FOURTH, from the amendment: any set of decisions a member can reach in only ONE mode** — singly with no bulk path, or in bulk with no single path.
behind-interface: I3 — consumption; if a surface needs the plane to publish something it does not (a rung, a set's membership), file the IC rather than deriving it
depends-on: none
scope-boundary: **INFORMING AT THE ACT, ONCE, IS RESPECT AND IS NOT THE TARGET** — Bob names it explicitly: DEC-39's fence sentence, DEC-51's grade note at capture (UI-54, merged today), DEC-49's honest refusal reason. **Do not strip those.** A sweep that removes the record's own account of what an act means would enact the opposite of this ruling, and the over-strictness arm exists to catch exactly that.
accepts-when: `node civicos-ui/test/run.mjs` from the REPO ROOT, exit read UNPIPED, 0; each of the four shapes either ABSENT by assertion or carried as a named item with its reason; the census of member-facing flows stated as a FIGURE with its reach, not asserted as complete.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) plant a re-confirmation dialog on a reversible act and the sweep must fail NAMING it; (2) **the over-strictness arm, which is the one this item most needs**: DEC-51's grade note, DEC-39's fence sentence and a DEC-49 refusal reason must all stay GREEN — inform-at-the-act-once is respect, and a sweep that cannot tell it from nagging is worse than no sweep; (3) offer a set of decisions in bulk ONLY, with no single-item path, and the amendment's arm must fail — a surface that forces bulk is the same flaw as one that forbids it.
added: 2026-08-10 · CONDUCT (draining the 2026-08-10 BOB INBOX entry for DEC-69 as an ITEM, because a note is not an item — the rule this queue has now had to learn twice)
landed: `050b164`, merged on `main`. **THE CENSUS IS A FIGURE WITH ITS REACH, NEVER A CLAIM OF COMPLETENESS: 40 member-facing ACT SITES reaching 31 distinct MUTATING ops of the plane's 85**, over 641 function bodies and 647,585 characters — with **four blind spots PRINTED every run**, including that **54 of the plane's mutating ops are reached by no act site this walk sees**. Shapes 1–3 ABSENT BY ASSERTION (no `confirm()`; no re-affirmation stem at any act site the imported `RUNGS` classes reversible/reasoned; all 23 checkbox/radio controls are selectors or payload choices, ZERO pure affirmations; DEC-68's enactment MEASURED — `op=readingname` is still `mutating: false` in the plane's own OPS table). **Shape 4 found the amendment's bulk-only half and it is the item's real catch: the queue's mute muted EVERY condition kind on a case, and it READ AS RESPECTFUL BECAUSE IT NAMED THE SET — but naming a set is not offering a choice within it.** Corrected in place at the cost of one parameter, since `op=queuemute` already accepted an arbitrary subset. Two more carried as D-291 (`op=resolve`, `op=proposedispose`/`taskresolve`/`taskforward`): bulk there needs the PLANE to accept a set, and **a client-side loop is the forty-dialogs shape wearing a bulk control's clothes.** **THE PROTECTED TRIO IS ASSERTED, NOT OBSERVED — ARM P runs every time, so a later tidy that strips one FAILS the suite that would otherwise report success**: DEC-51's grade note (app.html holds no copy), DEC-39's fence (read off the act's `prompt`, dialog still refuses to open without it), DEC-49's refusal reasons. **No prose was deleted anywhere.** UI harness 46 → 47 suites, exit 0 unpiped; `member-respect.test.mjs` 428 assertions; battery unmoved with nothing under `bio-plane/` in the diff. NCs 6/6 armed ALONE, `app.html` restored byte-identically by sha256 AND by content against a second pristine copy. **THE CONTROL FOUND TWO REAL GAPS IN THE SWEEP ITSELF** — `${attestFenceHtml()}` occurs three times, so a bare `String.replace` armed a site OUTSIDE the dialog and the sweep stayed green over something nothing had touched. **And the instrument was confidently wrong twice**: a JS deriver over `app.html` starts inside `<style>`, where an apostrophe in a CSS comment opened a string that never closed and every later comment landed in the prose corpus; and a single-slot string mode let a nested backtick close its parent, reporting a longest function body of 92,964 characters against a real 13,117. Both kept as arms. Three figures in its own MEASUREMENTS row were wrong in draft and corrected by re-reading the run, with the correction kept in the row.

### UI-57 · done
milestone: M10
interface: I3 consumption — no shape moves; IC-75 is the producer-side row this consumes
depends-on: D-310 (landed — IC-75's measured impact IS this item)
scope: **IC-75's delegation, and the defect is a disappearance aimed at exactly the wrong readers.** `civicos-ui/app.html`'s `publicationEntryHtml` gates the WHOLE "Publishing this case" section on the presence of the `publish` act in `op=affordances`' answer. D-310 narrowed that answer for non-owners (correctly — the store refuses them by name), so **CASE-6's `data-pubwho` paragraph — the surface statement of the owner rule, written under DEC-33's deferral precisely so the fence is not learned by silence — now disappears for exactly the readers it was written for.** The fix per IC-75's own filing: the gate goes back ON THE OBJECT (the section renders for the case's state), and what the ACT's presence gates is only the act-shaped affordance within it; the surface's own header forbids a per-credential variant, so one rendering serves every viewer with the rule stated in words. DEC-69 governs: state the rule at the act once — never nag, never re-confirm, never force a mode.
accepts-when: a NON-OWNER viewing a concluded inquiry still sees the publishing section with the owner rule stated in the record's words, and is offered NO publish control; an OWNER sees the same section WITH the act; `node civicos-ui/test/run.mjs` from the REPO ROOT, exit UNPIPED, 0; `cd bio-plane && npm run test:battery` green — measure your own baseline.
NEGATIVE CONTROL: run and recorded, armed ALONE — (1) the arm this item exists for: re-gate the section on the act and the non-owner's rule statement must FAIL as ABSENT, named; (2) over-strictness — the owner's view must not change byte for byte but for what the fixture legitimately moves; (3) DEC-69 — the rule stated ONCE: a second restatement in the same section fails.
added: 2026-09-10 · CONDUCT (IC-75's measured-impact delegation at D-310's integration, enqueued as an ITEM — a delegation is a notice, and a notice is not an item)
landed: `8e61e8f`, merged on `main`. **THE GATE MOVED FROM THE ACT'S PRESENCE TO THE OBJECT'S STATE, AND NOTHING NEW WAS ASKED OF THE PLANE** — `op=affordances` already publishes `object_type`/`current_state` beside `acts`; the condition is the publish act's own object-side clauses read VERBATIM from `affordances.mjs`, minus the per-credential one D-310 added. The act's presence now gates exactly one clause: the record's own published LABEL, which a surface may not invent; the rule statement is never gated, so a non-owner sees the owner rule in the record's words (0 B → 3,216 B, measured) while **an owner's rendering is BYTE-IDENTICAL to its pre-item self (3,258 B, sha-compared across HEAD's and the new renderer in isolated VM contexts)** — the over-strictness measurement an arm cannot make. The `elsewhere` routing site needed no edit and that is ASSERTED, not assumed. A correction to IC-75's own prose filed on the row: the object was answerable all along — only the surface's reading of it was the proxy. NCs: every arm as declared, with arm (h) sharper than the headline arm — a section that renders is distinguishable from a section that renders THE RULE. **Two driver findings the brief did not predict, both fixed at the site: CASE-6's fence arm DID NOT ARM (D-309 deleted the refusal it anchored on — RETIRED with date/reason/what-closed-it, its cover already carried by D-309's own driver, and nothing under `bio-plane/**` touched cross-area); and the driver's throw had been ENDING the run so four arms never executed while the output read as a driver that simply stopped** — an arm that fails to arm is now a printed, counted finding and the loop continues. The worker also CLOSED the −6 rather than assuming it (npm ci in `pdf-worker/` took fleetbundles 50→56 and the battery to main's exact figure — D-303's mechanism falsified live). Merged-tree gates: battery 174/174 · 10,804 (delta ZERO, predicted); `--strict` exit 0 unpiped, floor 909/168/169 unmoved; UI harness exit 0 (`publication-entry` 119→146); `mintid --audit` 0 breaks. **IC-75 RESOLVED at this integration: I3 13.0.0 → 14.0.0, MAJOR on the register's own rule, with UI's consumer answer on the row.**

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
