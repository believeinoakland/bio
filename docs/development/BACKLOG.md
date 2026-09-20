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
- **Budget:** 150 KiB for the file, 2 KiB for a row. `node tools/ledger.mjs invariants` prints the five pipeline
  invariants; `node tools/plancheck.mjs` enforces them.
- **Find any id** — here, in the cache or in the archive — with `node tools/ledger.mjs find <ID>`.

Created EMPTY on 2026-09-18 by LED-6's tool half. The rows arrive with the migration (WORK-PIPELINE §5 steps 2–4),
performed by hand by the lane that owns the plan.

## Rows

### D-434 · queued — **A PUBLISHED RECIPE REFUSES THE MEMBER AT ITS OWN LAST STEP.** `app.html`.s `RECIPES[capture-a-document-and-ground-a-question-on-it]`, ends on `op=inquiryground` — which authors the DEC-32 PARTITION over legs that ALREADY EXIST and refuses `NO_BASIS` when there are none. On a fresh capture the member is REFUSED; on a question with legs it regroups them and attaches the document to nothing. The op for this act is `op=cite`. **PART 1 ONLY.** — owner UI.
order: FIRST. The record telling a member to do what the plane refuses is the record claiming more than it can support, which CLAUDE.md §2 grades above every feature — and it is PUBLISHED, so it is wrong in the member.s hands. One edit plus its arm (SCHEDULER #3, 2026-09-20)
milestone: M8
interface: none — part 1 changes no interface.
design: `docs/development/INVESTIGATIVE-SESSION.md` §0 · Vocabulary, which ALREADY BANS this: *"GROUND PARTITION … is **never a surface word**"* — DEC-32.s elicitation clause 1 bans it from every member-facing surface. The recipe breaks a ban a governed document already states: enforcement, not a new rule.
depends-on: none.
scope: **PART 1 ONLY; THE ROW REFUSES TO GROW.** Correct the step and its `why` to `op=cite`, or split into cite-then-ground if the recipe means both — plus one arm that DRIVES it end to end, since its id appears nowhere outside `app.html`. **PART 2 IS NOT PLACED:** no arm of `surface-registry.test.mjs` asks whether a step.s op can perform its act, and BOB ruled it must be SIZED first — inventing a model of every op to judge a `why` string is the citation-invented-to-pass-a-check failure.
accepts-when: the recipe is driven end to end against the plane and COMPLETES. How a liar passes it: editing the `why` to match the wrong op — so the arm DRIVES it and asserts no refusal, instead of reading text.
NEGATIVE CONTROL: restore `op=inquiryground` and the drive arm fails by name at `NO_BASIS`.
added: 2026-09-20 · SCHEDULER #3 (BOB #18.s inbox entry, drained this commit).

### D-435 · queued — **`owed.mjs` CAN ATTRIBUTE BUT NEVER DISCHARGE, SO EVERY LANE'S WORKLIST IS MONOTONIC.** `owedFor()` tests `OWNER_RE(lane)` against a row.s DISPOSITION, excluding only `isClosedDebtRow`, so an OPEN row that once said *ROUTED TO BOB* owes forever — however emphatically a later dated sentence in the same cell says that lane.s part is done. `owed.mjs BOB` reads 7 and **exactly 1 is known false** (D-134). — owner BOB (its own instrument).
order: SECOND. Every lane plans from this number, including this one, and it can only grow — a worklist that cannot shrink quietly becomes a backlog of the past. Cheap, and the fix is named in the row rather than designed (SCHEDULER #3, 2026-09-20, BOB #18's inbox entry)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) — an instrument reports what it can see, and this one cannot see a discharge.
depends-on: none.
scope: a `DISCHARGE_RE` matching the form the corpus already writes twice and NOTHING ELSE — `nothing (on this row |here )?falls to (the )?<LANE>( lane)?` — as narrow as `RESIDUE_RE` was forced to be. **A row discharged for one lane still attributes to any OTHER lane its disposition names** — the predicate is per-lane, not per-row. **FULL GATE PROFILE** (`tools/` is not `docs/`): check disk first; BOB #18 declined to build it at raising for that reason rather than skip the gate.
accepts-when: a row carrying BOTH an owner phrase and a discharge is NOT attributed; one carrying only the owner phrase still is; D-134 leaves BOB's list and the count moves 7 → 6. Every lane's count re-measured BEFORE and AFTER, so the effect is a figure rather than a claim. How a liar passes it: widening the pattern until the count drops — so the over-strictness arm asserts an undischarged row still attributes.
NEGATIVE CONTROL: break the discharge in `owed-controls.mjs` and watch a NAMED assertion in `owed.test.mjs` fail.
added: 2026-09-20 · SCHEDULER #3 (BOB #18.s inbox entry, drained this commit).

### M0-81 · queued — **NOTHING CHECKS WHETHER A LANE IS ALREADY OCCUPIED BEFORE A CHIP IS FILED, AND IT COST A REAL MESSAGE.** On 2026-09-19 a second CONDUCT #8 was filed six minutes after the lane was taken; it held the name in the peer directory, and SCHEDULER #3.s three clustering instructions went to it rather than the live integrator, returning `success: true`. — owner M0.
order: THIRD. Cheap, mechanical, and the only one of tonight.s session defects that PREVENTS rather than describes: a duplicate lane costs a wrong delivery nobody is told about (SCHEDULER #3, 2026-09-20)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), enacting BOB #18.s ruling in `kickoffs/BOB.md` "Spawning and retiring lanes": a stood-down, duplicate or retired session RELEASES the lane name.
depends-on: none. `tools/retirable.mjs` is the precedent: the JUDGEMENT lives in the repo where a suite drives it, the ACT stays in the harness.
scope: the OCCUPANCY half only — before a chip is filed, read the session list and REFUSE if a live session already holds the lane (by `scheduledTaskId` or title). Put it in `tools/` as a pure function over a session listing, so a suite drives it. **MUST NOT TOUCH:** the `conduct-8` scheduled task.s definition lives OUTSIDE this repo and is the operator.s — named to them, never changed from here. **FULL GATE PROFILE** (`tools/` is not `docs/`): check disk first.
accepts-when: given a listing with a live session bound to a lane, the judgement REFUSES it and names the occupant; given the same listing with that session stood down, it admits. Driven from a FIXTURE listing, never the live harness. How a liar passes it: matching on title alone — so the arm feeds a session whose title differs and whose `scheduledTaskId` matches.
NEGATIVE CONTROL: drop the occupancy test and the duplicate-CONDUCT fixture is admitted, failing by name.
added: 2026-09-20 · SCHEDULER #3 (BOB #18's inbox entry, drained this commit).

### REC-154 · queued — **`kickoffs/RECORD.md` IS 36,709 B AGAINST THE 24,576 B READING BUDGET**, so the lane whose kickoff it is cannot read its own instructions whole — which is the one thing CLAUDE.md's reading budget exists to guarantee. It was already over at 32,259 B before REC-146 appended to it. — owner RECORD.
order: after D-339 with the corrections: it is not a defect in the product, but it breaks the READING BUDGET doctrine for the busiest build lane, and every RECORD worker pays it on every spawn. Cheap and mechanical (SCHEDULER #2, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` with CLAUDE.md §1's reading budget — *a file is either READ WHOLE or LOOKED UP, never half of each* — and `kickoffs/CONDUCT.md`'s own cut of 2026-09-19 as the worked precedent.
depends-on: none.
scope: cut it on CONDUCT.md's precedent — **archive the cut text VERBATIM** (nothing deleted), reduce the live file under 24,576 B, and add it to `CUT` in `tools/readbudget.mjs` so the warning clears honestly rather than by exemption. **THE TIMING CONSTRAINT IS WHY REC-146 DID NOT DO IT:** RECORD.md's own convention is append-never-rewrite while other RECORD workers are live, so this runs when no RECORD worker holds it — CONDUCT confirms that before spawning.
accepts-when: `node tools/readbudget.mjs` no longer warns on RECORD.md; the archived text is byte-identical to what left the live file; no RECORD worker was live during the cut. How a liar passes it: deleting rather than archiving, so the arm diffs the archive against the pre-cut file. NEGATIVE CONTROL: drop a paragraph instead of moving it, and the byte-identity check fails naming it.
added: 2026-09-19 · SCHEDULER #2 (routed by CONDUCT #7; `node tools/mintid.mjs REC`).

### M0-82 · queued — **`kickoffs/CONDUCT.md` HAS 24 BYTES OF HEADROOM, SO THE ROUTING RULE THE INTEGRATOR LANE MOST NEEDS CANNOT BE WRITTEN WHERE IT READS IT.** 24,552 B against 24,576 B, in `readbudget.mjs`. CUT set where an overrun FAILS. CONDUCT #8 raised it and rightly refused to decide it; BOB #18 ruled ARCHIVE-THEN-CUT. — owner CONDUCT.
order: beside REC-154, the same class: a kickoff at or over its reading budget, which the busiest build lane pays on every spawn. **AND IT IS PLACED AS A ROW RATHER THAN SENT AS A MESSAGE BECAUSE CONDUCT CANNOT BE TOLD** — it runs unattended and has no inbox (M-74) (SCHEDULER #3, 2026-09-20)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) with CLAUDE.md §1's reading budget — *a file is either READ WHOLE or LOOKED UP, never half of each* — enacting BOB #18's ruling in `kickoffs/BOB.md`.
depends-on: none. REC-154 is the same act on `RECORD.md`; either may land first.
scope: ONE commit that (1) moves CONDUCT.md's two "Integration mechanics" sections VERBATIM to `docs/archive/`, (2) cuts them from the kickoff and cites the archive, (3) lands the three occupancy/reachability rules from `kickoffs/BOB.md` in the space freed. **THE ARCHIVE STEP IS THE WHOLE RULING:** `docs/archive/CONDUCT-kickoff-2026-09-19.md` does NOT contain those sections (grepped, 0 hits), so cutting them without archiving destroys a receipt that exists nowhere else, which CLAUDE.md §1 forbids. `BOB.md`'s own header is the worked precedent.
accepts-when: `node tools/readbudget.mjs` reads CONDUCT.md under budget with 0 failing; `node tools/decided.mjs` still finds every ruling in the moved sections; the kickoff cites the archive by path. How a liar passes it: cutting prose that was never archived — so the arm greps the archive for each moved section's own first sentence.
NEGATIVE CONTROL: cut a section without archiving it, and the decided-index arm fails by name.
added: 2026-09-20 · SCHEDULER #3 (BOB #18's inbox entry, drained this commit).

### D-116 · queued — **NOTHING READS A FLEET MEMBER'S VERSION BACK THROUGH ITS BINDING.** The installer verifies the PLANE (`verifyUpdate` reads `op=bootstrap`) and each member is uploaded with a version and never asked what it answers — so the plane can verify itself current while a member still serves the previous build, invisibly to both. — owner DIST.
order: after D-254, above features: a group can run a stale member with nothing reporting it, so the install and the deploy both claim more than they can support — CLAUDE.md §2's class, in the distribution path (SCHEDULER #2, 2026-09-19)
milestone: M7
interface: none — a probe and its report; no plane op changes
design: `docs/architecture/BIO_Distribution_v0_1.md` §8, the fleet's version authority, read with CLAUDE.md §5 — *a deploy verified is not a build serving*, and establish which build ANSWERED.
depends-on: none. DS-2 built the BUILD-side authority (`resolve-version.mjs`; `release-assemble.mjs` refusing `VERSION_SKEW`/`VERSION_DISAGREES`); this is the RUNTIME half it does not reach.
scope: read each member's version back THROUGH THE SERVICE BINDING, after install and after deploy, reporting per member. `newgroup`'s `verifyUpdate` is the shape to follow — it already retries and reports, for the plane alone. **D-115's one surviving requirement, "verify each member's version on read-back", is DISCHARGED HERE** — that row closed naming this one.
accepts-when: an install against a fleet where ONE member serves a stale build names THAT member and does not report success; the same probe after a fleet deploy names the member that answered stale. How a liar passes it: probing a member's own endpoint instead of through the binding, which tests a path the plane does not use — so the probe goes through the binding the plane actually calls. NEGATIVE CONTROL: pin one member at the previous version, and the arm fails naming it.
added: 2026-09-19 · SCHEDULER #2 (LED-7 batch 3; keeps its `D-` id).

### LED-8 · queued — **SIX REGISTERED ID COLLISIONS: `ledger.mjs find` ANSWERS TWO DIFFERENT ROWS FOR ONE ID.** D-121 and D-124 each name two unrelated OPEN rows; IC-30 two PROPOSED interface changes; M0-16 a duplicated heading. `mintid --audit` registers all six, 0 breaks; the lookup §1 rests on answers ambiguously. — owner M0.
order: SIXTH. AMBIGUITY STATED, not the record over-claiming: the tools REFUSE loudly rather than corrupt (`archive D-121 --dry-run` prints both dispositions and stops), while every row above is SILENTLY wrong. Loud beats silent, and blocking LED-7 on two rows of 211 does not outrank five silent ones (SCHEDULER #2 + BOB #17, 2026-09-19)
milestone: M0
interface: none
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7, the bullet "The legacy residue" — **rewriting cited ids is REFUSED: citations must keep resolving** — with CLAUDE.md §1.
depends-on: none.
scope: **DISAMBIGUATE. DO NOT RENUMBER AN ID THAT ANYTHING CITES** (BOB #17, 2026-09-19 — a ruling, not a preference). A ledger id is cited by commit messages, other rows' `depends-on`, kickoffs, `DECIDED.md` and the archive — and **a commit message cannot be rewritten.** D-124's first row reading "renumbered from a colliding D-122" makes renumbering look established; it is the dangerous answer. So: the register carries BOTH, `find` REPORTS the collision and shows both rather than guessing, and a new id is minted fresh. M0-16's duplicate is an empty-bodied merge artefact — DELETED, not renumbered. If renumbering looks unavoidable, it is BOB's call before it lands.
accepts-when: `find` returns BOTH rows for a collided id and SAYS it collided; `mintid --audit` still reads 0 breaks; every existing citation of the four still resolves. How a liar passes it: deleting a copy loses a defect — so the DEBT row count must not FALL, asserted. NEGATIVE CONTROL: plant a seventh collision, and the audit names it.
added: 2026-09-19 · SCHEDULER #2 (batch 4; found by CONDUCT #7; no-renumber ruling by BOB #17).

### LED-9 · queued — **A PIPELINE INVARIANT READS `status.mjs`, SO A DEPENDENT CANNOT BE SEQUENCED ABOVE UNBUILT SUBSTRATE.** P4 fails the plan when a cache row's `depends-on` is not MET — but that names other ROWS, so it answers *is the row it waits on earlier or done*, never *is the CONSTRUCT it rests on BUILT*. — owner M0 / SCHEDULER.
order: with LED-8, the ledger tooling: preventive, not a live defect — no row is mis-sequenced today, checked by hand. Earned by THREE catches in one day (D-60, D-115, D-116): a row read as done because the thing underneath it was (SCHEDULER #2 + BOB #17, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md`, the law this gate is an arm of, with `WORK-PIPELINE.md`'s P1–P5 which it extends. The rule is CLAUDE.md §2 — *"verified BUILT by `status.mjs`, not by a row saying so"* — **RULED by BOB #17 (`a08e137a`) to be that doctrine MECHANISED:** the arm does not JUDGE builtness, it READS the one authority on it.
depends-on: none.
scope: extend `ledger.mjs`' invariants so a row whose `depends-on` names a CONSTRUCT is checked against `status.mjs`, failing the plan when a dependent sits above unbuilt substrate. **THE BOUND GOES IN THE ARM'S OWN OUTPUT, not only here** (BOB #17): it judges only a row that NAMES a construct, so **a row naming its substrate in PROSE is invisible to it** — the bound `corpuscheck`'s `--authority` arm states about itself. A green arm that hides its bound is read as more than it is.
accepts-when: a row depending on a construct `status.mjs` reads ABSENT fails the plan NAMING both; one whose substrate is BUILT passes; **a row naming substrate only in prose is UNJUDGED, never passed**, with the unjudged count printed beside the verdict. How a liar passes it: judging only rows that name a construct and reporting 100%, which the unjudged count forbids. NEGATIVE CONTROL: point a row's `depends-on` at an absent construct, and the arm fails naming it.
added: 2026-09-19 · SCHEDULER #2 (D-404's fix, ruled by BOB #17).

### REC-155 · queued — **SEVEN VERBS WHOSE `OPS` ROW ADMITS A SESSION CLASS ARE REACHABLE BY NO SESSION, AND THE PLANE ANSWERS `SESSION_ROUTE_NOT_RECORDED` BECAUSE NOBODY RULED.** The provenance pair and calibration three admit `member`; `livefire` and `reproject` admit `admin` only. All seven are mutating, in neither `SESSION_OPS` set and no `UNATTENDED_BY_DECISION` row. — owner RECORD.
order: below the ledger tooling, PROVISIONALLY. The plane is HONEST here — D-270 landed the refusal that stops it inventing a rationale — a determination owed, not a defect shipping. The order moves when BOB rules: the answer decides whether it is one landing or seven (SCHEDULER #3, 2026-09-19)
milestone: M8
interface: I3 if any op gains session reach; NONE if every answer is a recorded decision — that is the ruling.
design: MISSING — routed to BOB (CLAIMS.md DELEGATION 2026-09-19 SCHEDULER, "the seven undetermined session routes"). The gap is EXPLICIT: `index.mjs`. comment names these ops *"UNDETERMINED rather than decided"*; nothing governed rules on them.
depends-on: none. **NOT D-136**: its three ops are the same shape but are ruled (§4.7); these are not. **REC-65 already pins the provenance pair as a known-open identity claim (`test/identity-claims.test.mjs`) that fails in EITHER direction — moving those two without a ruling breaks it.**
scope: per op, ONE of two acts, BOB.s choice not the worker.s — `SESSION_OPS` with a driven arm, OR a recorded decision in `UNATTENDED_BY_DECISION` with its citation. **FIVE ARGUE AGAINST THE PRESENT REFUSAL IN THEIR OWN COMMENTS**: the provenance pair say *"a named member's judgement"*; the calibration three say the fence *"is NOT about who may measure"*.
accepts-when: each of the seven is EITHER driven from a session by role OR carries a citation a caller can check. How a liar passes it: tidying ops into the table with no decision behind them — so each citation is resolved at its artifact.
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's item 1, verified at the code).

### UI-73 · queued — **ELEVEN MEMBER-FACING SITES STILL READ A REFUSAL'S RAW `detail` INSTEAD OF ITS CANNED TRANSLATION** — `teach()`, `queueReason`, `planeSaid`, the finder's per-subject errors, the release / attest / capture receipts, the proposal pre-flight, the forward picker, the leg pre-flight's `subj-how`, and `INTENT_VOCAB.words`. UI-72 landed the two renderers and `refusalWords(r)`; this is its named remainder. — owner UI.
order: a CORRECTION TO JUST-LANDED WORK, which outranks new work: UI-72 shipped the helper and eleven sites still bypass it, so a member meets machine vocabulary at the moment they are told no — the failure DEC-49 exists to close (SCHEDULER #3, 2026-09-19)
milestone: M8
interface: none — the helper exists; no code, wire shape or catalogue row moves.
design: DEC-49 (`node tools/decided.mjs "DEC-49"`) as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it — every condition has a named code and a canned translation. UI-72's own citation, unchanged.
depends-on: none. UI-72 landed at `02e7c537`.
scope: each site reads `refusalWords(r)` instead of `r.detail`. **IT IS NOT ONE EDIT AND THE ROW REFUSES TO BE TREATED AS ONE:** `teach()` is pinned by `civicos-ui/test/preauth-vocabulary.test.mjs`' DEC-49 SUBJECT arm, whose FIGURES MOVE when the gate's rendered sentence changes — so this row carries that arm's re-read and re-pin as its own work rather than leaving the battery to discover it.
accepts-when: all eleven take their words from the ONE helper, asserted as `refusal-translation-surface.test.mjs` already asserts the two renderers; the SUBJECT arm re-pinned to figures a green run printed, with the movement STATED. How a liar passes it: re-pinning the arm to whatever it now reads — so the re-pin names the old and new figures and why they moved.
NEGATIVE CONTROL: restore `r.detail` at one site, and that site's arm fails by name.
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's item 3, verified in UI-72's own CLAIMS.md block).

### M0-80 · queued — **FOUR REFUSAL CODES ARE PINNED GREEN BY ABSENCE RATHER THAN BY AGREEMENT** — the plane sends a canned `translation` for `KIND_NOT_PERSONAL` (`queue.test.mjs`), `NO_ACKNOWLEDGMENT` (`release-flow.test.mjs`), `NO_SUCH_SELECTION` (`act-dispose.test.mjs`) and `NOT_CAPABLE`, and each fixture OMITS the field, so the `detail` pin passes by not looking. Of 198 hand-written refusal fixtures in the UI estate only THIRTEEN carry a `translation` at all (M-72). — owner M0.
order: with the instrument cluster and NOT beside UI-73, though they were routed together. A fixture narrower than the wire is a check that cannot fail — M0-78's doctrine exactly — whereas UI-73 is a surface correction. CLAUDE.md §5: an equality that costs nothing to produce is not evidence (SCHEDULER #3, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) — a suite is evidence only where it can disagree with the thing it measures.
depends-on: none. Measured in `docs/development/MEASUREMENTS.md` M-72 (UI-72, 2026-09-19).
scope: carry the catalogue row's `translation` in each of the four fixtures and re-read the pin. **AND THE LARGER HALF, which is why this is an M0 row and not four edits:** 185 of 198 fixtures carry no `translation`, so the same blindness is available everywhere — report the count of fixtures whose refusal shape is NARROWER than the wire the plane sends, and floor it.
accepts-when: each of the four pins DISAGREES with the plane when the translation is wrong, proved by feeding a wrong one; the narrower-than-wire count is printed per suite and floored. How a liar passes it: fixing the four and leaving the census unbuilt, so the floor is asserted to exist.
NEGATIVE CONTROL: put a WRONG translation in one repaired fixture, and that suite fails by name — today it passes, because the field is absent.
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's routed item 4; `node tools/mintid.mjs M0`).

### COFF-13 · queued — **NO FORMAT ENTRY EMITS A DECK LENGTH, so a deck whose TRAILING slides are unreadable is recorded shorter than it is — and the content row then REFUSES A TRUE CITATION of a real trailing slide as "past the deck".** D-359's named residue, rowed at its close rather than left in prose. — owner CONTENT-OFFICE.
order: below LED-8, above the features: it refuses something TRUE — a record defect, not a gap — but errs in the CONSERVATIVE direction and reaches only decks with unreadable trailing slides, so it ranks under the defects above it (SCHEDULER #2, 2026-09-19)
milestone: M9
interface: I2 — a producer change on the text shape, so an IC is minted and the integrator classifies it.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §15's structure-shape row and §16's persistence paragraph, which both state this residue by name and say closing it is a producer change on I2.
depends-on: none. COFF-11 (IC-100) and COFF-12 landed the producer and wire halves this completes.
scope: a deck entry emits its own LENGTH — the slides the DECK has, not the ones the reader could open — and the wire carries it onto the persisted reading beside the slide list. The slide map is already keyed on each slide's OWN number (COFF-12), so the length is the missing fact, not a re-keying. `.odp` states an honestly NULL length if the format cannot answer, as `.ods` does for its grid.
accepts-when: a deck whose LAST slide part is unreadable still admits a citation of that slide, and a citation past the real deck is still refused C-45.1 BY NAME with the figure in the refusal. How a liar passes it: emitting the READABLE slide count as the length, which is the defect — so the fixture's deck must have an unreadable TRAILING slide and the arm must assert the length exceeds the readable list. NEGATIVE CONTROL: emit the readable count instead, and the trailing-slide arm fails by name.
added: 2026-09-19 · SCHEDULER #2 (LED-7 batch 7, at D-359's close; `node tools/mintid.mjs COFF`).

### MK-5 · queued — **AN OPINION IS NOT EVIDENCE — a case element with attribution, refused as a basis leg.** — owner RECORD; surfaces are Program B's and are NOT rowed.
order: rests on MK-3's attribution (SCHEDULER, first order audit, 2026-09-18)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §6 (an opinion is not evidence)
depends-on: MK-3 (it carries MK-3's attribution)
scope: build §6; an opinion cited as a basis leg is refused by name (§7). **Read the design section at the artifact before building (§8's own condition).**
accepts-when: an opinion lands as a case element with its attribution and is refused as a leg, by name, through the ops; battery green by its COMPLETION LINE.
NEGATIVE CONTROL: recorded in the suite's own `NEGATIVE CONTROL:` line (**with the colon**) — the refusal removed → an opinion lands as a leg and the arm FAILS. **Liar:** an opinion stored as a low-grade leg — the design refuses it as a leg at all.
added: 2026-09-18 · CONDUCT #4 (from BOB #14's inbox; MEMBER-KNOWLEDGE-DESIGN.md §8, build-order items 3 and 6.)

### M0-71 · queued — **CONTRADICTION'S IDENTIFY, 2 of 3: THE FIXTURE AND THE FIRST MEASUREMENT, BEFORE ANYTHING A MEMBER SEES — §7's corpus, the false-conflict rate and recall, and the THRESHOLD recorded.** A candidate judgement is measured OFF-RECORD (no table write). — owner M0 / VERIFY.
order: the measurement IDENTIFY's judgement must pass, BEFORE anything a member sees; after REC-146 (SCHEDULER, 2026-09-19)
milestone: M0 (VERIFY; the acceptance test of item 3 is this item's over-strictness arm)
interface: none — a fixture, a harness and a measurement
design: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §7 (the over-strictness arm, its corpus and its three negative controls) and §9 item 2.
depends-on: REC-146.
scope: build §7's labelled corpus (precision, world in both of Bob's shapes, record, unrelated) and the harness over REC-146's pairs; measure a candidate judgement off-record; record the false-conflict rate, recall and the THRESHOLD in `MEASUREMENTS.md` with the corpus size.
accepts-when: `MEASUREMENTS.md` carries the figures with date, instrument and corpus size; §7's three negative controls run and recorded (a disabled or always-`world` judgement FAILS the gate by name; an empty record returns case (a)); `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 2).

### REC-147 · blocked — **CONTRADICTION'S IDENTIFY, 3 of 3: THE JUDGEMENT AND THE CANDIDATE TABLE — §5's five labels as labelled machine work through ONE append site; §8's row, state `proposed`, idempotent over unchanged referents. ONLY IF M0-71's gate is met.** — owner RECORD + the investigative session's skill. Reads `blocked` until M0-71 records a threshold the judgement meets.
order: blocked on M0-71's measured gate (SCHEDULER, 2026-09-19)
milestone: M9
interface: I3 and I5 (a table; ICs minted with `node tools/mintid.mjs IC`)
design: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §5 (the judgement and its vocabulary), §8 (where a candidate lives) and §9 item 3.
depends-on: M0-71, AND its measured gate met — a threshold missed is the finding, and this row then goes back to BOB.
scope: as §5 and §8; PRESENT and RESOLVE are NOT in scope (BOB's next design act, after M0-71's first measurement).
accepts-when: M0-71's gate passes on the built judgement; a re-run over unchanged referents writes nothing new; every row names both referents and versions, the key, the run, the label and reason. NEGATIVE CONTROL: two append sites, and the one-site arm fails. Battery green own-baseline by its COMPLETION LINE; `node scripts/coverage.mjs --strict` exit read UNPIPED; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 3).

### UI-68 · queued — **THE REVIEW-COPY SURFACES, WITHOUT EXPORT: draft (the project's editors), read (owner/participants, and recipients by secret), grant and revoke (the owner), comment at both doors — the plane rendered verbatim, and NO export, download or print-to-file affordance.** Discharges the in-instance half of REC-126's DELEGATION to UI. — owner UI.
order: BOB #14's item 8 (13.review-copy), its in-instance surfaces; the plane half is built (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 consumer (REC-126's IC-145/IC-146)
design: `docs/architecture/BIO_Publication_v0_1.md` §6A (front matter and §6A.3), with the REC-126 → UI DELEGATION in `CLAIMS.md` and its REC-133 addendum, which specify the four surfaces. Verified by BOB #16 (2026-09-19): not Program B's.
depends-on: REC-126 (done) — CHECK AT THE CODE at spawn.
scope: the delegation's four surfaces; nothing leaves the instance from the UI.
accepts-when: the harness drafts, grants, reads by secret, comments and revokes against the real plane, and a revoked secret reads nothing. How a liar passes it: a hidden export path (a print stylesheet, a blob link), so the harness asserts NO such affordance exists. NEGATIVE CONTROL: add a download link, and the no-export arm fails by name. `node civicos-ui/test/run.mjs` from the repo root, unpiped, exit 0; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (BOB #16 inbox "THREE DESIGNS AT THEIR HOMES", item 6).

### REC-148 · queued — **`op=reviewcopy` CARRIES DEC-31's IN-BAND QUARTET: a SHA-256 over the canonical bytes it answers, its date, its author, and both threshold floors (the project's `required_strength`, both axes) — the SAME quantity the published container's header renders.** Measured by BOB #16: today it carries a date and an author and no hash and no floors. — owner RECORD.
order: DEC-31's in-band quartet, before any review copy leaves the instance (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 additive (an IC minted with `node tools/mintid.mjs IC`)
design: `docs/architecture/BIO_Publication_v0_1.md` §6A (§6A.3 point 2 and the DEC-31 in-band rule), and BOB.md rule 7 (a comparison names its quantity).
depends-on: REC-126 (done) — CHECK AT THE CODE at spawn.
scope: add the hash and both floors beside the date and author, computed by the one function the published header uses.
accepts-when: for one case edition, the review copy's quartet and the published container's header agree field for field, proved by the SAME function; the hash changes when one byte of the answer does. How a liar passes it: a second hasher over a differently-canonicalised body agrees on the fixture and drifts, so the suite asserts ONE function. NEGATIVE CONTROL: canonicalise differently in one place, and the agreement arm fails. Battery green own-baseline by its COMPLETION LINE; `node scripts/coverage.mjs --strict` exit read UNPIPED; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 7).

### UI-69 · queued — **EXPORT OF A REVIEW COPY carrying the quartet in-band on every page, with §6A.3 point 2 said AT the act: what leaves cannot be revoked; the grant can.** — owner UI.
order: after UI-68 and REC-148: export only once the quartet travels with it (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 consumer (REC-148's IC)
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 point 2.
depends-on: UI-68 and REC-148.
scope: the export affordance UI-68 withheld, every rendered page carrying the quartet; the statement at the act, once (DEC-69).
accepts-when: an exported copy carries the quartet on every page byte-equal to the plane's; the statement renders at the act and nowhere else. NEGATIVE CONTROL: drop the quartet from one page, and the per-page arm fails. `node civicos-ui/test/run.mjs` from the repo root, unpiped, exit 0; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 8).

### REC-149 · queued — **DISCOVERABLE OR HIDDEN (Membership v2 §7 item 7.14), 1 of 4: the OWNER's recorded setting (append-only, latest wins, no record = HIDDEN); `#inSight` answers three levels at the ONE predicate; EXISTENCE only for a discoverable project to a member outside it; the DIRECTORY read; `viewerPredicate` NOT changed.** — owner RECORD.
order: Bob's 2026-09-18 ruling (DISCOVERABLE/HIDDEN), after BOB #14's listed items; the plane half first (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 (an IC minted with `node tools/mintid.mjs IC`), I5 for the setting's table
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14 (Bob's ruling of 2026-09-18; decided by BOB #16, 2026-09-19).
depends-on: REC-138 (done; `Store#inSight`) — CHECK AT THE CODE at spawn.
scope: as item 7.14: at EXISTENCE every act but the request is refused POSITIONALLY with a new code carrying id and name only; every existing project boots HIDDEN.
accepts-when: through the ops, a hidden project is byte-identical to a nonexistent one at the directory, the request and every act (REC-138's suites green UNEDITED); an uninvited member's record reads, search, backlinks and run reports never show a discoverable project's contents; a predecessor's store boots with every project HIDDEN. How a liar passes it: widening `viewerPredicate` passes the directory arm and leaks contents. NEGATIVE CONTROL: widen it, and a contents arm fails by name. Battery green own-baseline by its COMPLETION LINE; `node scripts/coverage.mjs --strict` exit read UNPIPED; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 1).

### REC-150 · queued — **DISCOVERABLE OR HIDDEN, 2 of 4: THE REQUEST TO JOIN — ask (one open per member per project, optional comment), withdraw, owner GRANT (writes `invited`) or DECLINE (recorded), visible to the requester, owners and administrators only, LAPSED when the project goes hidden; administrators and the founder answer none.** — owner RECORD.
order: after REC-149, whose EXISTENCE level it needs (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 (an IC minted with `node tools/mintid.mjs IC`)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14 and §7.4 (a grant is an invitation; the requester joins by the checkbox); C-56's positional check.
depends-on: REC-149.
scope: the lifecycle as item 7.14 states it.
accepts-when: a grant leaves the requester `invited` and NOT `joined`; a lapsed requester reads their own request and nothing else about the project; an administrator's grant is refused. NEGATIVE CONTROL: let a grant write `joined`, and the invited-not-joined arm fails. Battery green own-baseline by its COMPLETION LINE; `node scripts/coverage.mjs --strict` exit read UNPIPED; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 2).

### UI-70 · queued — **DISCOVERABLE OR HIDDEN, 3 of 4: the create and fork forms ASK, with neither preselected, and cannot submit without the choice; the project's owner sees and changes the setting (others read-only).** — owner UI.
order: after REC-149, and after UI-66 on the same forms (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's IC)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14, with DEC-69 (forced, at the act).
depends-on: REC-149; and the create and fork forms as UI-66 leaves them (same forms — one worker at a time).
scope: as the design says.
accepts-when: the harness cannot submit a create or fork without the choice, and nothing is preselected; the owner changes the setting and a non-owner sees it read-only. How a liar passes it: a form that submits without the choice and gets HIDDEN from the plane silently, so the harness asserts the submit is impossible. NEGATIVE CONTROL: preselect HIDDEN, and the nothing-preselected arm fails. `node civicos-ui/test/run.mjs` from the repo root, unpiped, exit 0; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 3).

### UI-71 · queued — **DISCOVERABLE OR HIDDEN, 4 of 4: the directory; the request button and comment; the owner's queue of open requests with grant and decline; the requester's own requests and their states.** — owner UI.
order: after REC-149 and REC-150 (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's and REC-150's ICs)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14.
depends-on: REC-149 and REC-150.
scope: as the design says, rendering the plane's answers verbatim.
accepts-when: the harness requests, the owner grants, the requester sees `invited` and joins by the checkbox, all against the real plane; a hidden project never appears in the directory. NEGATIVE CONTROL: render a hidden project from a cached list, and the directory arm fails. `node civicos-ui/test/run.mjs` from the repo root, unpiped, exit 0; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 4).

### REC-122 · queued — D-161's LAST ACT: A MEMBER CHOOSES THE ON-POINT PAIR OF A CONNECTION (Bob's 2026-09-14 refinement, §5.4) — the act that turns REC-120's honest UNDETERMINED into a definite answer where a member has established which mention is to the point.
order: runnable product work (M4, D-161's last act); REC-120 is done; not on BOB #14's list, which governs only rows added after it (SCHEDULER, first order audit, 2026-09-18)
milestone: M4 — D-164, the content-extent primitive (RECORD)
interface: I5 and I3 — its OWN IC, minted with `node tools/mintid.mjs IC` BEFORE building, against the bases as read at resolution (I5 1.18.0, I3 23.5.0 on `main` when rowed)
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair and what it is NOT, as corrected 2026-09-18) read with `DEBT.md` D-161 (act 3) and REC-86's NARROW (`op=narrow`, IC-123) — the LEG-side analogue whose rules (member-only, machine proposals labelled, the old retained, nothing claimed that was not established) this act should mirror unless the design says otherwise.
depends-on: REC-120 (DONE — `determining_pair.selection`, `pair_rule` and C-49.4 present on `main`; verify before building).
accepts-when: in M-51's fixture a member choosing the p.9 mention makes a p.9 citation answer REACHED with that grade and a p.2 citation answer outside, through the ops; with no choice made every REC-120 answer is byte-identical; a machine credential cannot choose (refused by name); a choice cannot name a mention the document does not carry; `DEBT.md` D-161 CLOSED; construct-status updated if a claim moves (`node tools/status.mjs --check` then … (whole text: the cut archive)
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «REC-122». A worker READS IT before building.

### CAP-11 · queued — DEC-75 ENACTED, act 3 — the export step's CALIBRATION:
order: runnable since CAP-10 landed (M2 measurement); placement CONFIRMED as SCHEDULER's by BOB #15 (BOB #14's list governed rows added after it) (SCHEDULER, first order audit, 2026-09-18)
milestone: M2 — a measurement before a letter (CLAUDE.md: measure, do not assume)
interface: none — a measurement; if the calibration record needs a home in the chain, that is CPDF-13's calibration shape, reused
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.3 (the content-axis staleness rule — when a calibration goes stale) and §16 (the Drive paragraph DEC-75 was folded into); DEC-75's answer is what makes the calibration the act that raises the cap; D-351 (the byte-instability half already taken: `.ods` `content.xml` byte-identical across three exports, `.odt` differing by one style name)
depends-on: CAP-10
accepts-when: MEASUREMENTS.md carries the per-format table with N, instrument, command and blind spots; the row records the proposed cap per format with its evidence; `node tools/gates.mjs` green (class DOCS unless a script lands); plancheck --local 0 fail.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «CAP-11». A worker READS IT before building.

### FW-20 · queued — FLIPPED TO `running` AND REVERTED WITHIN THE HOUR, 2026-09-18, by CONDUCT #4, BEFORE ANY SPAWN — recorded rather than silently undone.
order: runnable since CPDF-19 landed (M2 breadth); placement CONFIRMED as SCHEDULER's by BOB #15 (BOB #14's list governed rows added after it) (SCHEDULER, first order audit, 2026-09-18)
milestone: M2 — one content type per measured class (BREADTH §7 row 2), completed
interface: none expected — a content type and its registration; if a reference shape moves it is I2 and the IC is minted before building
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §2 and its §7 row 2, with §8's controls; M0-32's census in `MEASUREMENTS.md` sets the order and this is its fourth and last class; D-376 in `DEBT.md` carries the measurement
depends-on: CPDF-19 (BREADTH §7 row 5 — read-time re-extraction to tier 3; until a directory decodes at all, a type for it is unreachable code)
accepts-when: a staff-directory page FETCHED AND READ yields a type that recognises it, driven end to end through `identify`; **the re-taken decode census is recorded in `MEASUREMENTS.md` whichever way it comes out**; the `also` pass answers a directory that also satisfies another class; D-376's disposition moves with the commit; **the `docprofile/` change carries BOTH regenerations — `node tools/bundle-docprofile.mjs` for the UI embed AND `cd bio-plane && npm run build` for the plane bundle (D-377, and the second one is the half nobody had written down)**; `cd bio-plane && npm run test:battery` green own-baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` from the repo root, unpiped, exit 0; `node tools/plancheck.mjs --local` 0 fail.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «FW-20». A worker READS IT before building.

### CPDF-3 · queued — **UNBLOCKED AT THE FIRST ORDER AUDIT (SCHEDULER, 2026-09-18): its stated blocker, *a DIST deploy*, is false at the artifact — `op=pdfstructure` is in `bio-plane/src/index.mjs`, and 0.58.0 was deployed through `deploy.mjs` and verified serving on 2026-09-14 (`MEASUREMENTS.md`, "D-297/IC-82 — release 0.58.0 deployed"); releases through 0.63.0 have been cut since.** The live verification itself is still owed.
order: unblocked at this audit (its deploy blocker is false); an M2 live verification, after the product rows above (SCHEDULER, first order audit, 2026-09-18)
milestone: M2
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 "How content is extracted today" (the I2 structure shape `op=pdfstructure` answers), with `docs/development/INTERFACES.md` I1/I2.
scope: Live-verify pdfstructure against real captured Oakland PDFs (the agenda→item graph) via `op=pdfstructure`, in a `biosmoke-pdf` scratch namespace; sweep after.
behind-interface: I1
depends-on: CAP-1 (done), a DIST deploy
added: 2026-07-31 · CONDUCT
landed:

### M0-77 · queued — **`tools/mintid.mjs`' MAIN-GUARD COMPARES `resolve(process.argv[1])` WITH `import.meta.url`, WHICH NODE REALPATHS — so `mintid` invoked through a SYMLINKED path (macOS's temp dir is one) silently runs NOTHING and EXITS 0: a costs-nothing green in the id allocator every lane uses.** Found by M0-73's worker, routed by CONDUCT #6, 2026-09-19; fix named. A CLASS: SCHEDULER measured 25 `.mjs` files that read both `process.argv[1]` and `import.meta.url` (a candidate list, not a verdict — some may already realpath). — owner M0.
order: first of the queued M0 rows: a silent exit 0 in the id allocator every lane uses is a costs-nothing green (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — tools' entry guards
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): *verify by the positive artifact, never the absence of an error*; an exit 0 that ran nothing is the class it names.
depends-on: none.
scope: `mintid.mjs` compares `realpathSync(process.argv[1])` with `fileURLToPath(import.meta.url)`; SWEEP the class (`git grep -l 'process.argv\[1\]' -- '*.mjs' | xargs grep -l import.meta.url`), fixing each guard of the same shape and listing every file judged with its verdict. `newgroup/**` is out of bounds: any hit there is reported to DIST, not edited.
accepts-when: `mintid` run through a symlinked path prints its MINTED line and exits 0, and one run through a path that is not the script exits non-zero or prints nothing BY DESIGN, stated; every swept file's verdict is in the landing; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: a guard removed entirely (always runs), which breaks importing the module — so an arm IMPORTS each fixed tool and asserts its main did not run. NEGATIVE CONTROL: restore `resolve()` in `mintid`, and the symlinked-path arm fails by name.
added: 2026-09-19 · SCHEDULER (M0-73's worker's finding via CONDUCT #6; id minted with `node tools/mintid.mjs M0`).

### M0-68 · queued — **`bio-plane/test/vf4-live-scratch.mjs` ARM 4b-ii STILL ASSERTS D-323's REFUSAL, and D-323 is CLOSED: against any current plane it fails 4 assertions for the fix working, not for a regression.** Measured by FLEET on biosmoke7 at 0.58.0 with the VF-4 live-scratch instrument, 2026-09-19, routed by CONDUCT #5. A superseded test is CORRECTED, never exempted. — owner M0 (the test estate).
order: M0, right after the battery tally: an instrument asserting a closed defect fails against every current plane — a correction to a superseded test (SCHEDULER, 2026-09-18)
milestone: M0 (background lane, holds no slot)
interface: none — a live-scratch instrument's arm; no plane source moves
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with the file's own DATED NOTE of 2026-09-13 (D-323), which names the two choices: RE-PIN arm 4b-ii to `level-empty-<reporting level>` and say so, dated, in the note; or RETIRE it to `agent-worker/test/wire-vocabulary.test.mjs`, whose W8 block already drives the same question locally.
depends-on: none (D-323 done).
scope: make the choice the note hands "whoever re-runs this", state why at the site, and keep MEASUREMENTS.md M-8's figures exactly as measured at 0.57.0 (the arm's history is a measurement of record). If re-pinned, the over-strictness arm moves with it.
accepts-when: arm 4b-ii passes against the current plane with the new spelling asserted and NO refusal, or is retired with W8 named as its successor; the dated note records which, and why; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: deleting the four assertions, so the row requires the NEW spelling to be ASSERTED (or W8 named) rather than the old one removed. NEGATIVE CONTROL: restore the colon spelling in `emptyLevelCandidates` on a scratch tree, and the re-pinned arm (or W8) fails naming it.
added: 2026-09-18 · SCHEDULER (FLEET's measurement of 2026-09-19, routed by CONDUCT #5; id minted with `node tools/mintid.mjs M0`).

### M0-72 · queued — **`mergecarry.control.mjs` ARM 5 REPORTS A FALSE FAIL: its declared mustFail name "the register is the three the sweep found" no longer exists — `mergecarry.test.mjs` renamed the assertion to "…the register is the FIVE the sweeps found, not a longer list" when KNOWN_HISTORICAL_DROPS grew.** The arm ARMS and the suite goes red correctly; only the name is stale. Measured by BOB #16 on 2026-09-19. — owner M0.
order: M0; a negative control reporting a false FAIL, with M0-68's class of test corrections (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — a control driver
design: `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none.
scope: update arm 5's mustFail entry (`bio-plane/test/mergecarry.control.mjs`, near its line 168) to the current assertion name, with a dated reason; re-run the control.
accepts-when: `node bio-plane/test/mergecarry.control.mjs` reads all 7 arms AS DECLARED; the control leaves the tree byte-identical; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: a mustFail name loosened to a substring that matches any assertion, so the name must be the full current one.
added: 2026-09-19 · SCHEDULER (BOB #16's message; the fix was named).

### M0-74 · queued — **`bio-plane/test/curated-producer.probe.mjs` FAILS 9/1 ON `main`: it reads the severance check from `#restsOnLive`'s definition, and D-267 moved that check into `#refEdgeSevered`.** The probe is not in the battery, which is why `main` stays green. Measured by CONDUCT #6 and re-measured by SCHEDULER, 2026-09-19 (`curated-producer sweep: 9 pass, 1 fail`). — owner M0.
order: M0; a probe failing on main for a moved check, with the other instrument corrections (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — a probe's source read
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with D-267 (`node tools/ledger.mjs find D-267`), which moved the check.
depends-on: none.
scope: point the probe's source read (its `src.indexOf("  #restsOnLive(id) {")` near line 273) at `#refEdgeSevered`'s definition, with a dated comment saying why the old read was right when written; take the DEFINITION, never the first mention, as the existing comment requires.
accepts-when: `node bio-plane/test/curated-producer.probe.mjs` from `bio-plane/` reads 10 pass, 0 fail; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: widening the read to any mention of either name, so the read must anchor on the definition line. NEGATIVE CONTROL: rename `#refEdgeSevered` on a scratch copy, and the probe fails by name.
added: 2026-09-19 · SCHEDULER (CONDUCT #6's report; fix named; id minted with `node tools/mintid.mjs M0`).

### M0-75 · queued — **`bundle.test.mjs` AND `livefire.test.mjs` PRINT NO TALLY LINE, so every battery headline carries M0-65's "EXCLUDES 2 untallied suite(s)" segment; give each a standard tally, and the segment leaves the headline.** Suggested by M0-65's worker, routed by CONDUCT #6, 2026-09-19. **It MOVES the assertion total** — the landing states the old and new totals and attributes the delta to the two suites. — owner M0.
order: M0; M0-65 is ON MAIN (5a6d5913), so runnable: retires its EXCLUDES segment (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — two suites' report lines
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with D-413 (closed by M0-65) and `bio-plane/scripts/battery.mjs`' accepted tally forms.
depends-on: M0-65 (its EXCLUDES segment and widened tally reader; in CONDUCT #6's gate).
scope: each suite prints one tally line in an accepted form, counting the assertions it actually makes; no assertion is added to reach a number.
accepts-when: a full battery's headline carries no EXCLUDES segment, and its assertion total rises by exactly the two suites' printed tallies, stated in the landing; `cd bio-plane && npm run test:battery` green by its COMPLETION LINE; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: a tally line printing a constant, so each tally must equal the suite's own assertion count, checked by making one assertion fail and watching the tally move. NEGATIVE CONTROL: remove one suite's tally line, and the EXCLUDES segment returns naming it.
added: 2026-09-19 · SCHEDULER (M0-65's worker's suggestion, routed by CONDUCT #6; id minted with `node tools/mintid.mjs M0`).

### M0-76 · queued — `d280-strengthbar.control.mjs` READS NOT AS DECLARED ON EVERY RUN (arm C2 and the severedhomes arms), and D-280's site (a) — the bar read — is covered by NO arm. — owner M0.
order: M0, with the instrument corrections; ruled by BOB #16 (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — a control driver and one suite's arm
design: `docs/development/VERIFICATION.md` (admitted for M0 by name; its one-copy rule), with D-267 and D-280 (`node tools/ledger.mjs find D-267`, `D-280`) and the control's own header (2026-09-13, M0-25), which states the gap.
depends-on: none.
accepts-when: `node bio-plane/test/d280-strengthbar.control.mjs` reads EVERY arm AS DECLARED and the site-(a) arm fails by name; the control leaves the tree byte-identical; the C-6.1 finding is stated either way; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: re-declaring mustFail names to whatever now fails, so each re-declared name must be one that asserts the predicate's width in severedhomes §4.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «M0-76». A worker READS IT before building.

### M0-69 · queued — A WHOLE-STORE PURGE OF THE SCRATCH STORE CLEARS THE IDENTITY TABLES; A PURGE OF THE RECORD STORE NEVER DOES, structurally (BOB #16, 2026-09-19). — owner M0 (the purge op's scratch behaviour; I3 behaviour at scratch only).
order: M0, after the battery tally and M0-68: a live verification whose scratch keeps member rows stops measuring the same subject twice (SCHEDULER, 2026-09-19)
milestone: M0 (a live verification that stops measuring the same subject twice is the verification defect)
interface: I3 — behaviour at scratch only; an IC if the op's published answer changes (the integrator classifies)
design: `docs/architecture/BIO_Distribution_v0_1.md` §6 rung 6, "What 'swept after' means" (BOB #16, folded at `331e3758`; the front matter lists it decided and not built), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none in code.
accepts-when: a scratch purge leaves every enumerated identity table empty; a record-store purge driven through the op leaves `members` byte-identical; a new member-keyed table added to the schema without joining the list FAILS the pin. How a liar passes it: a hand list of three tables, so the enumeration must be DERIVED from the schema and the pin must fail on a planted table. NEGATIVE CONTROLS: pass the flag for the record store, and the record arm fails; drop one table from the derivation, and the pin fails naming it.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «M0-69». A worker READS IT before building.

### M0-70 · queued — **VF-4's LIVE-SCRATCH INSTRUMENT STATES ON ITS OWN OUTPUT THAT ARM 2a LEAVES A `proposed` MEMBER BY DESIGN (Membership v2 §4.7), AND PURGES SCRATCH AFTER ITSELF once M0-69 lands.** A refused `memberadd` leaving a proposal is CORRECT (BOB #16, 2026-09-19): the proposal is what the administrators endorse; no member-removal op is owed. — owner M0.
order: M0, after M0-68 and M0-69: the same instrument file as M0-68, and its purge-after rests on M0-69 (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — the instrument `bio-plane/test/vf4-live-scratch.mjs`
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.7 (administrator consensus) and `docs/development/VERIFICATION.md`, read with BOB #16's ruling, verbatim in `docs/archive/ledgers/BOB-INBOX-drained.md` (the 2026-09-19 entry, item 3).
depends-on: M0-69 (the purge must take scratch identity) and M0-68 (SAME FILE — one worker at a time in `vf4-live-scratch.mjs`).
scope: arm 2a's output says the proposal is by design and why; the instrument ends with a scratch purge and reads back `members` empty.
accepts-when: a run's output carries the statement at arm 2a; after the run, scratch `members` reads empty; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: a purge call whose answer is not read back, so the row requires the read-back. NEGATIVE CONTROL: skip the final purge, and the read-back arm fails naming the leftover rows.
added: 2026-09-19 · SCHEDULER (BOB #16's inbox entry, item 3; id minted with `node tools/mintid.mjs M0`).

### VF-7 · queued — CANNOT RUN until the next DIST deploy; queued now so the future act is an ITEM the deploy's integration meets, not a telling a future session must remember (the 2026-09-14 rule applied to two advance tellings the same day it was written).
order: M0 VERIFY lane, after the battery tally: it watches a credential class (DEC-43's zero), now a read-back since the 0.58.0 deploy armed it (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (VERIFY lane, holds no slot)
interface: none — it watches, it does not publish a shape
design: `docs/development/SCHEDULER.md` §"The mechanism, and how the next consumer joins" (the `monitor-cadence` consumer whose first live arming this watches) and `docs/development/ARCHIVE-FALLBACK.md` §"Shape on the capture" (CAP-3's fallback), both governed; `docs/development/VERIFICATION.md` is the VERIFY lane's own authority for what a live watch must establish (a process document, ungoverned by `CORPUS-STANDARD.md` §6).
depends-on: **the next plane deploy through `deploy.mjs`** (DIST's next cut — D-297's release is the likely carrier)
accepts-when: (on the deploy landing) both first activations measured and recorded with the serving build named; the first armed tick attributed to the scoped class; `op=audit` clean after; any anomaly filed as a finding rather than worked around.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «VF-7». A worker READS IT before building.

### M0-66 · queued — `m025-arm-anchor-witness.test.mjs` CLOSES THE COMMENTARY CLASS ON ITS LABEL HALF AND NOT ON ITS ANCHOR HALF — prose in a driver's block comment that names an anchor-bearing shape in backticks reads as a live anchor, and produced TWO … (whole text: the cut archive)
order: M0; an instrument producing false findings (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot) — an instrument that penalises a driver for documenting how it arms punishes the one habit this estate most wants
interface: none — `bio-plane/test/m025-arm-anchor-witness.test.mjs`
design: `docs/development/VERIFICATION.md` — the test estate's own authority, admitted for the M0 lane BY NAME by `tools/rowdesign.mjs`; read with the DELEGATION of 2026-09-17 in `CLAIMS.md` (M0-41's control → CONDUCT) that measured it, and the suite's own arm S10, which already closes the LABEL half with `stripComments`.
depends-on: none
accepts-when: prose in a block comment naming an anchor-bearing shape is NOT read as an anchor; a live anchor in code still is; the reach figures before and after are stated with any movement named by driver; A4 green with 0 dead; `node tools/plancheck.mjs --local` then BARE; `cd bio-plane && npm run test:battery` green own-baseline, read by its COMPLETION LINE.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «M0-66». A worker READS IT before building.

### M0-64 · queued — M0-41's CONTROL ARM 3 NO LONGER HAS A SUBJECT:
order: M0; a control arm proving less than it declares (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot) — an arm that measures something other than what it declares is a control that proves strictly less than it says
interface: none — `bio-plane/test/m041-instrument-census.control.mjs` (a `.control.mjs`, not discovered by the battery)
design: `docs/development/VERIFICATION.md` — the test estate's own authority, admitted for the M0 lane BY NAME by `tools/rowdesign.mjs`; read with commit `4c6ef789`'s own account (on `main` since CONDUCT #4 integrated `elated-grothendieck-a10003`), which measured the falsification and routed the ruling rather than relaxing the judge.
depends-on: none
accepts-when: the control's run reports every arm AS DECLARED, or arm 3 is RETIRED with the falsifier's measurement at the site; the planted id uses the target's real heading shape; arms 1, 2 and 4 are unchanged in outcome; the control leaves the tree byte-identical and HEAD unchanged (its own guards); `node tools/plancheck.mjs --local` then BARE; `cd bio-plane && npm run test:battery` green own-baseline, read by its COMPLETION LINE.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «M0-64». A worker READS IT before building.

### M0-44 · queued — FLIPPED TO `running` AND REVERTED WITHIN THE HOUR, 2026-09-17, by CONDUCT #1, and the reversal is recorded rather than silently undone.
order: M0; seven truncated claims invisible to the bounds instrument (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot)
interface: none — a reader's pattern and the rosters derived from it; no plane source moves
design: `docs/development/VERIFICATION.md` — the test estate's own authority, admitted for the M0 lane BY NAME by `tools/rowdesign.mjs`; read with `bio-plane/test/derivation-bounds.test.mjs`'s own header, which states what its walk can and cannot see, and with D-378 in `DEBT.md`
depends-on: none (M0-38 landed the grading and pinned the blind spot rather than fixing it)
accepts-when: each of the seven previously-invisible claims appears in a roster the instrument prints, or is named as out of reach with its reason; **every roster the widened pattern feeds is RE-DERIVED and its delta attributed arrival by arrival — never a figure nudged to fit**; the census and the class ratchet move only if the corpus genuinely moved, and if they do, the arrival is NAMED; `cd bio-plane && npm run test:battery` green own-baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node tools/plancheck.mjs --local` 0 fail; D-378's disposition moves with the commit.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «M0-44». A worker READS IT before building.

### M0-33 · queued — D-353 RULED at M0-29's integration (CONDUCT #11, mechanism):
order: M0; a third census shape (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot) — the test estate's own instrument
interface: none — control drivers and the census only
design: `docs/development/VERIFICATION.md` §"A THROWING CONTROL DRIVER VALIDATES EVERY ANCHOR BEFORE IT ARMS ANYTHING (D-331, 2026-09-14)" — D-333's three decay modes, of which (c) is the one M0-25's census and D-333's tally comparison do not see; D-353 is the ledger row that measured it (M0-29, `13ee07f`)
depends-on: none (M0-29 landed the sweep and its adjudication table)
accepts-when: the census reports the sweep's tally section (0 open candidates on the estate as landed, the three retired instances listed as adjudicated); one unadjudicated candidate planted → the census exits non-zero naming it; `cd bio-plane && npm run test:battery` green own-baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; UI harness from the repo root exit 0; plancheck --local 0 fail.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «M0-33». A worker READS IT before building.

### SK-5 · blocked — RE-STATED AT THE FIRST ORDER AUDIT (SCHEDULER, 2026-09-18):
order: blocked: no plane op publishes the surface registry (SCHEDULER, first order audit, 2026-09-18)
milestone: M9
interface: I3 — **it needs the plane to PUBLISH the surface registry, which nothing does today; that is the item's whole blocker.** File the IC before building.
design: `docs/development/ASSISTANT-PILOT.md` §1 (the five-layer training pack — the **Recipes** row is this layer, and it is the row that makes build-time validation the thing worth having) and §7 step 1, whose front matter names SK-5 as the blocker on the pack's `absent` recipe layer
depends-on: a published surface registry (unbuilt). **NOT schedulable until that exists** — recorded so the next CONDUCT does not spawn a worker into a wall.
accepts-when: (on unblocking) a recipe whose step names a surface or an op that does not exist **FAILS THE BUILD**; the pack's `absent_because` body is replaced by the layer rather than edited around.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «SK-5». A worker READS IT before building.

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
scope: **`op=publishpreflight` — the ceremony's ordering argument in one op. DEFERRED by DEC-33** (Bob, 2026-08-03: the publication ceremony process is deferred; publication runs through the operator for now). Trigger: Bob reopens the case-making thread. Recorded for when it wakes, so the deferral loses nothing: base scope as `BUILD-ORDER.md` §2 (REC-15) with `RECONCILED.md` §3.2's C-4 correction (`NO_SIGNERS` is INSTANCE-WIDE — the refusal detail must never say "for you", D-57); **DEC-15** — refuse `UNCLEARED_HUNCH` naming every hunch leg, in the same list as `NO_SIGNERS`, before any signature exists; **DEC-20** — only a hunch blocks publication on bias grounds; ordinary bias is DISCLOSED (the manifest SHOWN in the artifact, not merely cited) and refused on nothing; **DEC-17** — refuse `BELOW_PROJECT_STRENGTH` naming the axis; **D-158** bounds the per-member signing-key pre-flight (a signer row for a never-enrolled member reads `active` and is refused by ratify — fix at `signerAdd` write, assert the other view); §4 Q11 measured YES — `op=signerlist` + `op=whoami` make the per-member pre-flight computable client-side, an ADDITION to instance-wide `NO_SIGNERS`, not a replacement, until D-158 closes.
behind-interface: I3
depends-on: REC-14
accepts-when: (on waking) as `BUILD-ORDER.md` §2 (REC-15) plus — preflight reports `UNCLEARED_HUNCH` naming each hunch leg and `BELOW_PROJECT_STRENGTH` naming the axis, each BEFORE any signature exists, writing nothing; negative control — attach per-member wording to the instance-wide `NO_SIGNERS` and the suite fails; clear a hunch and the refusal disappears without any other state change.
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33

### UI-17 · blocked
order: blocked: rests on REC-15 (SCHEDULER, first order audit, 2026-09-18)
milestone: M10
scope: **O1 THE PUBLICATION CEREMONY — DEFERRED by DEC-33** (Bob, 2026-08-03: the process is deferred; publication runs through the operator for now; UI-17a ships in its place). Trigger: Bob reopens the case-making thread. Recorded for when it wakes: base scope as `research/RECONCILED.md` §3.1 (UI-17) — the pair shown in step 2, the C-9 picker, the Q5 re-keyed basis-leg panel (an assembly keyed on the SUBJECT is permitted; keyed on the ANSWER-SHAPE it performs generation by selection — the panel shows the case's own basis legs, the COMPLEMENT of the field's content), instance-wide `NO_SIGNERS` wording — plus **DEC-19 as amended** (publishing is IRREVERSIBLE; correction moves forward; the ceremony states this) and **DEC-13** (the subject-position stage, ordered BEFORE signing since authoring it changes the sha). D-158 bounds the per-member pre-flight.
behind-interface: I3
depends-on: REC-15, UI-11
accepts-when: (on waking) as `RECONCILED.md` §3.1 (UI-17), including the Q5 negative control — any prior deferral/dismissal/severance reason appearing in step 3's panel fails the harness.
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33
