# QUEUE.md — its narrative, as it stood at LED-6's migration (2026-09-18)

Every non-row block of `docs/development/QUEUE.md` — its earlier preambles, the 2026-08-04 session handover, the item
format, the per-area sections and their status narrative — moved here VERBATIM by SCHEDULER at LED-6 step (2)
(`docs/development/WORK-PIPELINE.md` §5), so the cache holds only the inbox and the rows. Line order is kept. LOOKED UP,
not read whole; the ids it mentions still set `mintid`'s floors (the archive is in every corpus).


**SCHEDULER owns this file from 2026-09-18 (`kickoffs/SCHEDULER.md`): it drains the BOB INBOX, orders the rows,
and marks, archives and replenishes. CONDUCT writes one word — a row's `queued` → `running`.** The history below is
kept as it was. Until then: CONDUCT owned this file and was its only writer. **Exception, 2026-07-31: session BOB
restructured it once, with Bob's explicit authorisation, while CONDUCT was paused for
that purpose.** Ownership returns to CONDUCT with this rewrite; BOB hands
decompositions over rather than editing here (`ORCHESTRATION.md`).

One section per area. An area is **ACTIVE** (holds a worker slot; max two at once) or
**DORMANT** (pre-seeded, promoted when a slot frees). CONDUCT takes the top item whose
status is `queued` and whose depends-on are all `done`, **flips it to `running` with a
spawn sentence — who spawned it, when, on which model, worktree-isolated, into which
slot — gates and PUSHES that flip**, spawns the worker, and on landing marks it `done`
with a `landed:` line.

**The four statuses, stated because this preamble named only two of them for six weeks
while the loop ran on four** (CPDF-20's worker found the gap, 2026-09-14): `queued` is
runnable and unclaimed; **`running` means a live worker holds an `agent-*` worktree with
a claim on the paths the row names — and every `running` row carries its own falsification
rule saying exactly that, because a status is a claim about the world and a claim about
the world is checkable**; `done` carries the landing shas and the report's findings;
`superseded` keeps its id and names what replaced it (`ORCHESTRATION.md` rule 3).
`blocked` appears where a row cannot run until something outside the queue moves, and
says what. **A worker reads its own row from `origin/main` before it touches anything,
and STOPS if the row does not read `running`** — which is how a cohort of eight spawned
against unflipped rows cost minutes rather than a wave of colliding edits.

**THE FALSIFICATION RULE, CORRECTED 2026-09-15 (CONDUCT #11, on BOB #11's argument), and
the correction is worth more than the clause it fixes.** Every `running` row carries a
clause telling a reader how to check the status against the world. It said, in every row
and kept here as the falsified thing: *"if none does, this row reads `queued`."* **That
instructs a reader to CONCLUDE A VALUE FROM AN ABSENCE, and the absence has two causes
that are opposite facts** — nobody ever started, so no work exists; or the worker
FINISHED, committed and released, so the work exists and is waiting on integration. A
reader who applies the old clause in the second case concludes the work was never done,
**and that is the expensive direction: it invites a respawn of work that is already on a
branch.** This is D-129 in the queue's own vocabulary — *"`undetermined` conflates two
different claims: WE DO NOT KNOW, and THERE IS POSITIVELY NONE"* — and `CLAUDE.md`'s rule
is that undetermined is first-class and must be STATED. So the clause now states it, and
points at the artefact that tells the two apart rather than at a guess.

**WHAT TO READ, in order, when no live worker holds the row.** (1) A `worktree-agent-*`
branch carrying commits whose subject names this item: work exists, and the row is
done-awaiting-integration no matter how long ago the worker died. (2) This item's block in
`CLAIMS.md`: a `released:` line is the worker's DURABLE REPORT and means it finished on
purpose; a claim still open beside a branch with commits means it died mid-item, which is
a third state and is neither of the two — take the branch, do not respawn from zero. (3)
Only with no branch and no claim does the row fall back to `queued`.

**NO FIFTH STATUS WAS MINTED, and that was decided rather than missed.** The window
between a worker finishing and CONDUCT merging is real and nothing occupies it, so a word
for it (`reported`, say) is arguable. It is declined for now because the clause was wrong
in a way a new word would not have fixed — a reader applying a bad inference rule reaches
a wrong answer whatever vocabulary is available — and because the queue has just paid for
a preamble that named two statuses while the loop ran on four. **One more word is cheap to
add and expensive to half-apply.** Revisit it when there is a second reason.

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

**HELD 2026-09-18 BY BOB #14 (sequencing is BOB's): NO M0 ROW IS SPAWNED UNTIL THE BUILD PLAN IS RE-DERIVED FROM CODE-VERIFIED CONSTRUCT STATUS.** Bob's concern: over three days about half of completions (16 of 37) and half of new rows (15 of 30) were M0 while the product substrate kept surprising us. Holding M0 costs nothing a member sees. **Until lifted, a freed slot is refilled ONE-FOR-ONE with a PRODUCT row (M1–M10) only, and only after its depends-on is checked AGAINST THE CODE at spawn time, with that check named in the spawn sentence; if none passes, the slot stays EMPTY and CONDUCT says so in one line.** Rows already running when this was written (M0-61, M0-62, M0-63) finish and are integrated as normal. Lifted only by BOB or Bob, in writing here.

**LIFTED 2026-09-18 BY BOB #15, in writing to SCHEDULER:** the first order audit (`cd9d7c86`) is the re-derivation this hold waited for — every open row's depends-on read at the artifact through `status.mjs`/`ledger.mjs`. The M0 rows are ordered on their merits in THE BUILD ORDER, the battery-tally row FIRST among them (BOB named it "M0-67"; M0-67 is `done` — `node tools/ledger.mjs find M0-67` — and the open battery-tally row is M0-65, D-413).

Test-estate work spanning every area. CONDUCT spawns a worker per item with a claim on
the specific files. These are cheap, they touch no plane behaviour, and they raise the
floor everything else is judged against.

## RECORD — ACTIVE (re-promoted 2026-08-05; the 2026-08-01 handover order is fully DRAINED and the area now runs D-200)

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

## CONTENT-PDF — DORMANT, restructured by the topology decision.
CPDF-7 runs OUT OF BAND (measurement-only, holds no slot) and should run early: it
decides whether the pdf-worker path is central or marginal. *(Heading restored 2026-08-10
by CONDUCT — see the note under RECORD.)*

---

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

## CAPTURE — ACTIVE (re-activated 2026-09-14 by CONDUCT #10 into the dev slot COFF-10 freed, for CAP-8 — the Drive host-stack handler, Bob's 2026-09-14 ruling; CAP-9 queued behind it on the same ground; DORMANT before this since CAP-4).
CAP-3 runs OUT OF BAND: it touches only CAPTURE's own paths and contends with neither
active area. CAP-4 is decided and queued behind it.

## FRAMEWORK — ACTIVE (re-activated 2026-09-14 by CONDUCT #10 as a third dev area for FW-17, act 6's reading-position item; DORMANT from 2026-08-03 — FW-15 landed; FW-13/FW-14 wait on REC-11/REC-19 — until this)
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

| ~~CONDUCT~~ **DONE** | SK-2 | the investigative skill — §14b.4's table parsed out of the design, authority held to its right column in both directions | **landed `e1f497f`, merged 2026-08-10** |
| ~~CONDUCT~~ **DONE** | SK-3 | the prohibition set — verbatim as a LOOKUP against its source documents, not as a discipline | **landed `496fe8c`, merged 2026-08-10** |
| ~~CONDUCT~~ **DONE** | SK-4 | CHECK deploys first — the sequencing RECORDED, FL-3's gate dereferenced rather than re-implemented | **landed `f4483e6`, merged 2026-08-10. Its LIVE half is VF-4's and is not reached — printed by the suite every run, never simulated.** |
| ~~DIST~~ **DONE** | DS-4 | the gated deploy, then hand to VF-4 — 0.57.0 cut+signed at `ba05e9c`, deployed and SERVING account-wide (plane + agent-worker + ocr-worker with both upload parts + pdf-worker, all `/version` 0.57.0). DEC-43 re-read: biosmoke7 monitors on the ADMIN_TOKEN fallback, so this WAS a fallback-instance deployment; the fallback stays per the ruling, read recorded in the release-note commit `39730b1`. Deploy by the outgoing DIST (stand-down `14c5470`); independently re-verified by DIST #2 from the account: plane bytes byte-identical to the signed manifest (2,715,828 B), ocr parts byte-identical, member main modules wrangler-rebuilt from source per agent-worker's own THE-SOURCE-DEPLOYS ruling | **done 2026-09-13 — VF-4 unblocked** |
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
so opening a `### SK-n ·` heading here would allocate each id a SECOND time — `plancheck`
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

## UI — ACTIVE (promoted 2026-08-04 into the slot RECORD freed as it drained; UI-10 first — every other UI item depends on it)
`civicos-ui/**`; the member surfaces of M8, per `UI-PLAN.md` and the interaction
constructs **v0.2** (`BIO_Interaction_Constructs_v0_1.md` — the count came down to TWO
constructs + a weight ladder + the TASK/QUEUE attention layer; MILESTONES M8 build-order:
**the queue FIRST**). NOTE: this supersedes the earlier drained-inbox note's v0.1
`T→J→B(+S)→P→A` order — MILESTONES M8 already carries v0.2, so the queue-first order governs.
The display half of D-82 (`surfaced_by`) and the FW-4→UI already-held delegation are later
UI items, not UI-1. *(Heading restored 2026-08-10 by CONDUCT — see the note under RECORD.)*

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


_(the build-order section's header, preamble and table as they stood at LED-6 step (4), 2026-09-19 — moved verbatim by SCHEDULER; the order now lives in the rows' file positions across `QUEUE.md` then `BACKLOG.md`)_

## THE BUILD ORDER — every open row, in the order it will be processed (SCHEDULER, first order audit, 2026-09-18)

**Every open row of this file is below, in ORDER; the area sections that follow keep their narrative and hold no rows.** Set at SCHEDULER's first act (`kickoffs/SCHEDULER.md`, *"confirm the order of the whole build plan"*): for each row its `depends-on` was resolved against `node tools/status.mjs` and `node tools/ledger.mjs find` (read at the artifact, not from the row), its design section opened, its stated blocker checked against the code, and step 3's rules applied — corrections to landed work and security and disclosure defects ahead of features. `was` is the row's position in this file before the audit (file order was the only order; nothing stated one across areas). Each row carries an `order:` line saying why it is where it is. Rows whose place is provisional on BOB's or Bob's priority say so, and were sent to BOB the same turn.

| # | item | was | state | why it is here |
| --- | --- | --- | --- | --- |
| 1 | REC-153 | new | running | an authority defect (a mislabelled context walks around the joined gate); REC-145 is ON MAIN (c5d3788a), so runnable |
| 2 | REC-152 | new | running | authority: who may end a run (REC-145 on main); moved above the UI corrections at BOB #16's direction while weekly usage is short — disclosure and authority first |
| 3 | REC-151 | new | running | a §7.9 disclosure (a sequential id counts hidden objects); REC-141 is ON MAIN (11aa7b13), so runnable; above the UI corrections at BOB #16's direction |
| 4 | UI-67 | new | queued | REC-144 is ON MAIN (071e34dc), so runnable: the question page renders its read |
| 5 | UI-72 | new | queued | a correction to landed surfaces (refusals show internal detail over the plane's label); with the corrections, after UI-67 |
| 6 | M0-73 | new | running | with D-430, a precondition of LED-6's split: without it a blocked backlog row leaves `owed` and a backlog-only id sets no floor |
| 7 | LED-6 | 1 | queued | the pipeline migration, SCHEDULER's own hand act, after D-430 |
| 8 | LED-7 | 2 | queued | the debt fold: until it runs, ~222 open DEBT rows — among them disclosure defects that would outrank features — stand outside the order, so the plan cannot be proved in order without it |
| 9 | REC-135 | 8 | queued | first feature: BOB #14 item 2 (8.claim) — the project conclusion reaching the case; REC-136 is ON MAIN since c7f2df67, so it is runnable |
| 10 | MK-3 | 9 | queued | BOB #14's items 3 and 6 (2.firsthand, 13.attribution); MK-1 is done; its first act keeps an off-the-record account from leaking at publication |
| 11 | MK-5 | 10 | queued | rests on MK-3's attribution |
| 12 | REC-146 | new | queued | BOB #14's item 5 (8.contradiction), after the claim and attribution rows it follows; the pairing read first |
| 13 | M0-71 | new | queued | the measurement IDENTIFY's judgement must pass, BEFORE anything a member sees; after REC-146 |
| 14 | REC-147 | new | blocked | blocked on M0-71's measured gate |
| 15 | UI-68 | new | queued | BOB #14's item 8 (13.review-copy), its in-instance surfaces; the plane half is built |
| 16 | REC-148 | new | queued | DEC-31's in-band quartet, before any review copy leaves the instance |
| 17 | UI-69 | new | queued | after UI-68 and REC-148: export only once the quartet travels with it |
| 18 | REC-149 | new | queued | Bob's 2026-09-18 ruling (DISCOVERABLE/HIDDEN), after BOB #14's listed items; the plane half first |
| 19 | REC-150 | new | queued | after REC-149, whose EXISTENCE level it needs |
| 20 | UI-70 | new | queued | after REC-149, and after UI-66 on the same forms |
| 21 | UI-71 | new | queued | after REC-149 and REC-150 |
| 22 | REC-122 | 11 | queued | runnable product work (M4, D-161's last act); REC-120 is done; not on BOB #14's list, which governs only rows added after it |
| 23 | CAP-11 | 18 | queued | runnable since CAP-10 landed (M2 measurement); placement CONFIRMED as SCHEDULER's by BOB #15 (BOB #14's list governed rows added after it) |
| 24 | FW-20 | 19 | queued | runnable since CPDF-19 landed (M2 breadth); placement CONFIRMED as SCHEDULER's by BOB #15 (BOB #14's list governed rows added after it) |
| 25 | CPDF-3 | 16 | queued | unblocked at this audit (its deploy blocker is false); an M2 live verification, after the product rows above |
| 26 | DIST-5 | 22 | queued | DIST's own reconciliation, ACCEPTED by DIST 2026-09-18 and queued in its session behind the REC-143 P0; holds no general slot |
| 27 | M0-77 | new | queued | first of the queued M0 rows: a silent exit 0 in the id allocator every lane uses is a costs-nothing green |
| 28 | M0-68 | new | queued | M0, right after the battery tally: an instrument asserting a closed defect fails against every current plane — a correction to a superseded test |
| 29 | M0-72 | new | queued | M0; a negative control reporting a false FAIL, with M0-68's class of test corrections |
| 30 | M0-74 | new | queued | M0; a probe failing on main for a moved check, with the other instrument corrections |
| 31 | M0-75 | new | queued | M0; M0-65 is ON MAIN (5a6d5913), so runnable: retires its EXCLUDES segment |
| 32 | M0-76 | new | queued | M0, with the instrument corrections; ruled by BOB #16 |
| 33 | M0-69 | new | queued | M0, after the battery tally and M0-68: a live verification whose scratch keeps member rows stops measuring the same subject twice |
| 34 | M0-70 | new | queued | M0, after M0-68 and M0-69: the same instrument file as M0-68, and its purge-after rests on M0-69 |
| 35 | VF-7 | 17 | queued | M0 VERIFY lane, after the battery tally: it watches a credential class (DEC-43's zero), now a read-back since the 0.58.0 deploy armed it |
| 36 | M0-66 | 14 | queued | M0; an instrument producing false findings |
| 37 | M0-64 | 12 | queued | M0; a control arm proving less than it declares |
| 38 | M0-44 | 3 | queued | M0; seven truncated claims invisible to the bounds instrument |
| 39 | M0-33 | 4 | queued | M0; a third census shape |
| 40 | SK-5 | 21 | blocked | blocked: no plane op publishes the surface registry |
| 41 | UI-60 | 20 | blocked | blocked: waits on Bob's re-prioritisation of UI |
| 42 | REC-15 | 15 | blocked | blocked: DEC-33's deferral stands (the live publishing route is a human's own session); BOB #14's item 11 also places it after items 2, 5 and 6 |
| 43 | UI-17 | 23 | blocked | blocked: rests on REC-15 |

