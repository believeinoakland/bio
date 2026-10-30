# Task summary · T53 · inquiry

This summary stands for the inquiry job's reading set (SESSIONS §6.3): the **inquiry** block of `build/plan/current.md` (Layer 6), `build/plan/T53-R1/inquiry.md` (no trims file), `build/requirements/inquiry.md` whole, each used module's Public Purpose (files `build/requirements/<module>.md`) with the named service blocks of `civil-time`, `record-core`, `membership`, `promotion`, `content`, `entities` and `leg-earning`, and `public-read` R52 (the final id of the planning line A1-R7 an entry cites). The sources stay binding; read any cited section in full when the work touches it.

## inquiry (own requirements)

Status: in force; last changed T51 (FR-45: R85, R86; K4194, K4202), met; approved by Bob (K102), split (N55, K83). R2, R3, R10, R13–R17 retired (K653, K617, K1505). R39, R55, R59, R60 (T41), R60, R62, R63 (T42), R64 (T48), R65 (T50) each marked not yet met at their tranche; T34-29 every requirement met (K1805) except R31 (MK-5). Size (P6): about 4,320 lines (K83 (2), K74).

Purpose: an inquiry is the one recursive object of case-making: a question gathering evidence and other inquiries as the legs of its basis, which may reach a conclusion. The module holds lifecycle and grammar, basis legs and their grading, the ground partition (DEC-32), exclusions, supersession and division, and what the record can earn for a leg; no basis version, conclusion or strength (`basis-versions`', `strength`'s).

Terms: an inquiry is a bundle of type `inquiry` (legacy `focus`/`problem` via `normalizeType`). A leg is a `basis[]` entry `{target, role, grade?, grade_axis?, grade_source?, note?, date?, author?, ground?, target_edition?, extent_*? | content_id?, extent_capture?}`; roles `supports`, `cuts_against`; grades A–D; axes `capture`, `connection`, `testimony`; sources `resolution`, `testimony`, `hunch`, `inherited`, `capture`. An ungraded leg is undetermined and inert (DEC-18). Every refusal names a `reason`, a row's carrying `check` and `translation`. The grammar face re-exports `inquiry-grammar`'s functions and `record-grammar`'s title helpers.

- R1 · Machine: `open`/`surfaced` → `deferred`, `dismissed`, `concluded`, `divided`; `deferred`, `dismissed` → `open`, `surfaced` or each other; `concluded` → `open`, `surfaced`, `deferred`, `dismissed`, `divided`; `divided` terminal; `published` read, never entered (DEC-72); same state is no edge.
- R2 · R3 · R10 · *(retired: R2 → `inquiry-grammar` R1, R3 → `inquiry-grammar` R2, K617, K653 BOB-2; R10 → `record-grammar` R30, R31, K653 BOB-4)*
- R4 · A leg's target is a canonical information or inquiry id in `references[]` (C-6.3); a graded leg names axis and source; capture or testimony grade on an inquiry leg refused (DEC-21); `hunch` names author and date; testimony D only; lead (C-54.1) or theme (C-81.1) refused first. Also: imported finding refs (`inquiry-grammar` R11), `STD-`, `CALC-`, duty occurrences (R13–R15), derived connection ids (R17); never an action (D113).
- R5 · A leg's part is judged by `checkLegExtentGrammar`: `content.checkContentExtent` (document-only context), a `content_id` of 64 lowercase hex, never both.
- R6 · Earned arms: a testimony grade refused unless the registry holds the target as a member's authored observation at that grade; an earned `resolution` or `capture` grade refused above what the registry earns (a resolution needs a `subject_entity` and never sits on an inquiry leg; an undetermined capture ceiling refuses any capture grade); an unreadable registry refuses the earned leg, never passes it (C-2.8).
- R7 · An `inherited` leg names a held published edition, no stronger than its frozen strength (C-21.2).
- R8 · Grounds (DEC-32): ground label per `GROUND_LABEL_RE`; a supporting leg without one is necessary (`inquiry-grammar` R68); each label declared once in `grounds[]` with named non-machine `asserted_by` and ISO `at`; no empty ground; `statement` a string (C-2.8).
- R9 · Supersession names target and reason; division disclosure names parent and siblings (C-6.1).
- R11 · Promotion check (via `promotion` R39), non-replay: `inquiry-grammar` R1–R2, R4–R9 (`BASIS_REFUSED`, findings with code and translation); `content.citationRefusals` (content R27); unknown `subject_entity` `SUBJECT_REFUSED` (C-2.8, through `entities.has`); `SUPERSESSION_REFUSED`; `NO_SIBLING_DISCLOSURE`; `SELF_BASIS` (C-33.22); `BASIS_CYCLE` (C-33.23, whole path by `leg-earning.cyclePath`); R47's arm; `CANDIDATE_ALREADY_TAKEN_UP` (C-2.17). Unheld or unseen `STD-`/`CALC-` as unknown (`BASIS_REFUSED`); `PORTION_UNKNOWN`; `NO_SUCH_OCCURRENCE`; `CALC-` read via `calculations.calcStatusOf({calcId, viewer})` (viewer the author): unaccepted `CALCULATION_NOT_ACCEPTED`, a failing read the same (fail closed, K1601).
- R12 · Projection in the promotion's transaction: `inquiry_basis` re-derived from `basis[]` via `leg-earning`'s one write; each document leg's content row (named, carried, or `content.resolveCitation`'s); exclusions; superseded-by index; the subject entity and leg count recorded; contradiction fields (R48); replay facts (REC-173).
- R50 · (C-66.5) A revision rewriting `surfaced_by` is refused `SURFACED_BY_REWRITTEN`, nothing written.
- R59 · (D13) A promotion that creates an inquiry or revises its question, whose text or named entities name a person in no public role (`entities` kind person holding no public role), carries a warning, never an error: the member is told investigations look at people through their part in a public matter, never a private life, and decides whether to go on; the warning is recorded with her choice; nothing refused. Its test is the pure export `personWarning({text, entities, viewer})` (over `personsInNoPublicRole`; public role read from `lines`' `holds` to an `office` or `seat_on`/`belongs_to` to a government `body`, K2480) → `null` or `{code, translation, persons}`, also called by `hypotheses` R19 (K2479). A machine's proposal carries the same warning to the member who takes it up. A rumour stays a lead (D52).
- R63 · (T42; N837; K2526) `personFacts({text, subject?, viewer})` answers the record's facts for the persons `text` and `subject` may name, for `personWarning` (and `intent` R32, `hypotheses` R19, `investigation` R22). Considered: the subject entity; every `ENT-` id in `text`; every person entity whose live alias, read via `entities.entitiesByAlias` (its R6) as `viewer`, is a run of `text`'s words (at most 8 words, `PERSON_NAME_WORDS_MAX`, over its first 120 words, `PERSON_TEXT_WORDS_MAX`). Each held person answered once, by id, `{entity_id, kind: "person", label, public_role, named: true}`; `public_role` true exactly when `lines` holds, not withdrawn, a `PUBLIC_ROLE_LINES` line from the person: `holds`, `responsible_for` or `acts_for` to an `office`, or `belongs_to`/`seat_on` to a `body` of sector `government`. Unheld or non-person ids left out; a failed read leaves what was found; writes nothing, never throws.
- R64 · (T48; N1012; K231; amends R11, R27) A divided question's document is closed: R11 refuses every revision (with a base; replay not asked) of an inquiry held `divided`, whatever it changes and whichever door; nothing written. Code `DIVIDED_CANNOT_RESTRUCTURE`, minted only by the pure `dividedCannotRestructure(detail, extra?)` (R27 and this check), carrying `target` and `from: "divided"`; no row added. Not refused: `divide`'s own parent write, children's creation, any child's revision.
- R65 · (T50; amends R19, R28, R33) `partitionOf({id, viewer})` answers `{ok: true, id, grouped, groups, ungrouped, changes, strength_now}`; `changes` the `ground` acts oldest first `{at, by, act, reason, groups, strength_before, strength_after}` (`act` `authored`/`restructured`, `reason` null for the first, the R28 pair kept at the act); no strength module: pairs null with `strength_absent`; pre-requirement changes `strength_after: null`, stated; unseen or non-question as absent; divided or published read; never throws; (K5077) `answered`.
- R85 · (T51; FR-45; amends R8, R27, R34) A partition labels supporting legs only; one naming a cutting leg is `BASIS_REFUSED` with the leg in `findings[]` (`check`, `ord`, `target`, `detail`); unlabelled supporting legs are necessary; `divide` carries a group whole; `partitionOf` lists cutting legs `ungrouped`; `grounds: []` held as answered (K5059).
- R86 · (T51) `DECLARED_OPS` exports `inquirydivide` (requires `target`, `reason`, `children`) and `inquiryground` (accepts `target`, `grounds`, `reason`; requires `target`, `grounds`).
- R13 · R14 · R15 · R16 · R17 · *(retired: R13 → `leg-earning` R1, R14 → R2, R15 → R3, R16 → R4, R17 → R5; K617, K1505 (1), T33-45)*
- R52 · (K861) Exports a `counts(hid)` figure source and the leg-grade resolver (`leg-earning` R1, R2) for `store-assembly`.
- R18 · `exclusionsNaming(targetId, viewer)` for `publication` R12; absent viewer fails closed.
- R19 · `stateHistory(id)` answers state transitions with who and when.
- R60 · (H38) Every read answering a question to a member answers `projects` (`leg-earning` R14 for that viewer), including the search row via `retrieval` R78; `stepsOn`'s header is `steps` R4's.
- R61 · (D59) A `bias_applied` statement not in force is `BIAS_APPLICATION_NOT_IN_FORCE` inside `BASIS_REFUSED` (`biasNotInForce`).
- R62 · (T42) `onMachinePassage(module, fn)`: one registrant; R11 calls `fn({legs, author, viewer})` for legs added or changed; a throw or misshapen answer `MACHINE_PASSAGE_UNCHECKED` (C-2.20, fail closed); pure `machinePassageUnchecked`.
- R20 · `dispose` (`op=dispose`): `BAD_TARGET_STATE`, `NOT_A_DISPOSITION`, `NO_REASON`, `BAD_REASON` (160), selection, `EMPTY_SELECTION`, `NOT_INQUIRIES`, `PUBLISHED_CANNOT_BE_SET_DOWN`, `ILLEGAL_TRANSITION`, `CITED`; every offender named.
- R21 · Each member gains a state-history entry (timestamp, from, to, reason, author), `prior_state`, `current_state`, `disposition_reason`, a Session Log entry; a deferral answers the re-evaluation raised (`since`).
- R22 · The whole set moves or none does.
- R39 · (H10, H38) Deferral and dismissal are each project's own act; a member drawn on by a shown project refuses `DRAWN_ON_BY_A_PROJECT` (C-106.2) naming shown projects only; drawn on only by hidden projects moves on its own state; `divide`, `ground` stay shared.
- R40 · `inquiry_basis` is `leg-earning`'s; `inquiry_subject_entity` of `inquiry_bundle_facts` (null or empty for none; no row reads null) stays this module's stated read contract, written only here.
- R41 · `staled(notice)` tells each citing inquiry once per re-read through `onRaised` (cause `restaled`).
- R42 · `onRaised`, `onGrounded`: one registrant each; carried as `reevaluation` and R28's pair; none: `reevaluation_absent`, `strength_absent`.
- R43 · `subjectEntityOf(id)` answers the recorded subject entity (R12, R40's column), or null; never throws.
- R44 · `memberUserAgent(id)`: the creating stamp, else the document's, else null.
- R23 · `divide` (`op=inquirydivide`) refusals: `MACHINE_CANNOT_DIVIDE` (C-32.7); `NO_REASON`, `BAD_REASON` (500); `NO_TARGET`; `NO_SUCH_BUNDLE`; `NOT_AN_INQUIRY`; `NO_DOCUMENT`; `PUBLISHED_CANNOT_DIVIDE`; `ILLEGAL_TRANSITION`; `CITED`; child and apportionment refusals; `CHILD_REFUSED`.
- R24 · Parent → `divided` with reason, apportioner, date, children and every leg's destination; each child `open`, titled from its question, its legs verbatim, `supersedes` edge, `cites` edges, `division_parent` and siblings.
- R25 · The answer lists children, apportionment, cutting-leg count and the re-evaluation raised.
- R26 · Parent and children land together or none does.
- R27 · `ground({target, grounds, reason, viewer, author})` (`op=inquiryground`) refusals in order: `MACHINE_CANNOT_GROUND` (C-32.8); `NO_TARGET`; `NO_PARTITION`; `NO_SUCH_BUNDLE`; `NOT_AN_INQUIRY`; `PUBLISHED_CANNOT_RESTRUCTURE`; `DIVIDED_CANNOT_RESTRUCTURE`; `NO_DOCUMENT`; `NO_BASIS` (C-33.40); `UNSPLICEABLE_BASIS`; `NO_REASON` when the document already carries any partition (a restructure, decided from the record, never a parameter); `BAD_REASON`; `BAD_PARTITION`; `BAD_STATEMENT` (160); `PARTITION_UNCHANGED`; `BASIS_REFUSED` when the candidate fails R4–R8.
- R28 · A group with unchanged legs and statement keeps its `asserted_by` and `at`; any other is stamped with this member and now; a caller's `asserted_by` or `at` is never read. Removing the partition is a restructure. The state does not move; the Session Log records the partition, the reason and the strength pair before the act; the answer carries the pair before and after (registered by `strength`, its R17).
- R53 · (A9) `inquiryFindings(host, bias)` registers findings as `bias` work products.
- R45 · `actNoBasis(detail, extra?)`, the one site minting `NO_BASIS` (C-33.40), used by R27 and `basis-versions` R17.
- R46 · (N345) Frozen contradiction vocabularies with `resolutionFamily`, `resolutionLines`.
- R47 · Contradiction arm (via R11): C-2.11–C-2.16 and C-2.18 (link, resolution and `explores` checks); `resolution` read only while `concluded`.
- R48 · `contradictionLink(id)`, `inquiryOfCandidate(candidate)`: in-process, ungated.
- R49 · `migratedSurfacing(id)` for replayed questions, `retrieval` R56's decoration.
- R54 · A dated wait is a dated recheck trigger, projected with `set_by`, `set_in`; removal ends it.
- R55 · `datedWaits({member, asOf, viewer})`: the setter alone; `waiting`, `due` from the start of the local day (`civil-time.localDay`, never UTC), `looked`, `ended`. `questionWaits({question, viewer})` (T41, D17; T51, K5130) answers a visible question's waits to any viewer, `set_in` only when not hidden, plus R58's answer.
- R56 · `waitLook` by the setter only (`MACHINE_CANNOT_LOOK`, `NOT_YOUR_WAIT`, `NO_SUCH_WAIT`).
- R57 · For `scheduler`: `datedWaitsDue(now)`, `datedWaitsWake(now)`, `datedWaitsTick(now)` (idempotent).
- R58 · `documentWaits({questions, viewer})` answers the set-aside-document wait via `capture.heldActsOf`, with `history`; unreadable `undetermined`; never notified.
- R87 · *(not yet met: T53)* (T53; DEC-457; shape of inquiry R27, R28; amends inquiry R35) **A member names or changes who a question is about, and the reason is kept.** `setSubject({target, subject, reason, viewer, author})` sets the question's `subject_entity` to a registered entity by a revision of its document; legs, grounds, state and conclusion are untouched. Naming one on a question that has none, and changing one, each need a reason (at most 500 characters, as R23); a subject stated when the question is created is the creation and needs none. Refusals, in this order, each writing nothing: `MACHINE_CANNOT_SET_SUBJECT` (a machine is not a member); `NO_TARGET`; `NO_SUCH_BUNDLE` (absent or not visible to the viewer, R33); `NOT_AN_INQUIRY`; `NO_DOCUMENT`; `NO_REASON`; `BAD_REASON`; `SUBJECT_UNCHANGED`; then R11's judging: an entity the registry does not hold is `SUBJECT_REFUSED` (K231). The answer is `{ok, target, subject, previous, reason, strength_before, strength_after}`, the pair as R28's registered reading answers it (`strength_absent` when none); afterwards `subjectEntityOf` answers the new value.
- R87 · (decided, K5536, L13 = A) After R11's judging, a leg whose stated connection or resolution grade the new subject would not earn (R6; nothing is earned with no subject) refuses the change as `BASIS_REFUSED`, each such leg named in `findings[]`, and no grade is lowered (R32).
- R87 · (decided, K5539, L14 = B, not the recommendation) Only the question's owner or an administrator may name or change its subject: after `NOT_AN_INQUIRY`, any other viewer is refused `NOT_THE_QUESTION_OWNER` (`question.refused.notowner`), writing nothing; an administrator is judged by `membership.isAdministrator` (the founder's claim included), the owner as the inquiry records it (the job confirms which field of the question's record names its owner, as `dispose` reads it). Test: the owner and an administrator each change the subject; control: another member who sees the question, and a machine (`MACHINE_CANNOT_SET_SUBJECT` first), are refused and the subject stands.
- R87 · (decided, K5540, L15 = B, not the recommendation) A published case member and a divided question accept the change like any other question: neither `PUBLISHED_CANNOT_RESTRUCTURE` nor `DIVIDED_CANNOT_RESTRUCTURE` is answered for it. A published edition's signed, pinned bytes never change (`case-authoring` R60 reads them); the change is made on the live question and shown as A1-R7 says. A divided question's parts are questions of their own and keep their own subjects; the change names none of them.
- R87 · (decided, K5541, L16 = A) An empty `subject` takes the subject off, with a reason as any change. (decided, K5542, L17 = A) A concluded question accepts the change and keeps its conclusion, the strength before and after shown.
- R87 · Test: naming, changing (with a reason) each land; the document, `subjectEntityOf` and both pairs read right. Controls: each refusal leaves the document and `inquiry_basis` unchanged; an unregistered entity is `SUBJECT_REFUSED`; a machine author is `MACHINE_CANNOT_SET_SUBJECT`; an invisible question answers as absent; the same subject is `SUBJECT_UNCHANGED`; and, the case each decision above governs (a leg at connection B whose new subject earns C; a published member; a divided question; clearing; a concluded question).
- R88 · *(not yet met: T53)* (T53; DEC-457; shape of inquiry R65) **The question's subject history is read.** `subjectHistory({id, viewer})` answers `{ok: true, id, subject, changes, strength_now}`. `subject` is `{entity_id, label, kind}` as the held document states it, else null (`label` null, stated, when the registry cannot be read). `changes`, oldest first and never edited, are `{at, by, act, from, to, reason, strength_before, strength_after}`, `act` being `named`, `changed` or `opened` (the creating promotion stated a subject; `reason` null, pair null) and, also `cleared` (K5541). A question whose subject was stated before this requirement has `subject` and no `opened` entry (stated, never composed). Pairs as R65 (null with `strength_absent`). An invisible or not-a-question id is answered as absent (R33). Read in any state; never throws. Test: opened with a subject, changed with a reason: two entries in order with both pairs and `subject` the last; a never-named question answers `subject: null, changes: []`. Controls: an invisible question answers as absent; a published question is read.
- R89 · *(not yet met: T53)* (T53; DEC-457; amends inquiry R59, R63; no new doctrine) **R59's private-person warning also covers the subject.** A promotion that creates a question stating a `subject_entity`, and `setSubject`, naming a person in no public role carry R59's warning (`personFacts({text, subject, viewer})` already takes the subject), never an error; her choice is recorded as R59 records it. Test: a private person draws the warning and the act writes after her choice; an officeholder carries none. Control: taking the subject off carries none.
- R90 · *(not yet met: T53)* (T53; DEC-481; K5539, K5540; PLANNING L32; amends R88) **A subject change is answered with its date, member, old and new subject, part and reason.** Each entry of `subjectHistory`'s `changes` (R88) also carries `part`: null for a change of the question's own subject, else the part of a divided question (R64) whose subject changed, named by the part's id and title, so that a divided question's history lists each part's change on its own entry (a divided question's parts keep their own subjects, R87); `at`, `by`, `from`, `to` (null for a removal, `act` `cleared`) and `reason` are as R88 states them, the reason kept inside the team. A part's entries are read under the divided question's own sight (R33). Test: a divided question whose part "B" has its subject changed with a reason answers one entry with `part` naming B, its date, member, old and new subject and reason; a change of the whole question's subject answers `part` null. Control: an undivided question's entries all carry `part` null; a viewer who may not see the question reads none.

Private Uses (compressed): `leg-earning`, `calculations`, `capture`, `civil-time` (`localDay`), `inquiry-grammar`, `record-grammar`, `record-core` (`declarePurge`), `membership` (R80, R81, R83), `promotion` (`registerStep`, facts), `content`, `connections`, `retrieval`, `progressions`, `entities` (`has` R7, `strongestByCapture` R16), `provenance`, `extraction`, `text-chain`, `bias`.

Mismatch: R63 reads `entities.entitiesByAlias` (its R6) and R87 names `membership.isAdministrator`, but Private Uses lists of `entities` only `has` and `strongestByCapture`, and of `membership` no `isAdministrator`.

- R29 · The basis is a DAG at every write; `inquiry_basis` only a projection (D-21); the one cycle walk is `leg-earning.cyclePath`.
- R30 · A machine authors no division, grouping or leg role; it may surface a question.
- R31 · A leg naming an opinion case element is refused by name (MEMBER-KNOWLEDGE §6). *(not yet met: MK-5)*
- R32 · An ungraded leg is inert and always named; nothing here gives a leg a grade the record did not earn or a member did not author (DEC-18, DEC-24).
- R33 · Every act and read naming an inquiry or project the viewer may not see answers exactly as an absent one.
- R34 · A cutting leg travels every path a supporting leg does (apportionment, projection), not grounds (R85).
- R35 · A published case member cannot be divided, re-grouped or set down; the route is reopen (DEC-12, DEC-72).
- R36 · Every table declared through `record-core.declareTable`, purged on `bundle_id`; `inquiry_subject_entity` in this module's own `bundle_id`-keyed table; dated waits `sight: "owner"`.
- R37 · No place is named in behaviour or outward text.
- R38 · C-2.11–C-2.18 in this module's own table (`checks.mjs`), each with its test; the grammar's rows are `inquiry-grammar`'s (its R7, R8), cite's `citation`'s; the translations are tabled in the source.

Satisfies (compressed): Case Making, State Rules, INVESTIGATIVE-SESSION, MEMBER-KNOWLEDGE, Declared Bias, Content Framework; DEC-12, -18, -21, -28 to -30, -32, -72, -112 (6); N345; (T53) DEC-457 (K5515, K5536, K5539–K5542): R87–R89; DEC-481: R90. Open for Bob: none (K102).

## Used services

`record-grammar.md`: the shared grammar (ids, types, front matter, canonical JSON, actors, grades, SHA-256); pure.

`jurisdictions.md`: the jurisdiction profiles, every local fact as data; no other module names a place.

`civil-time.md`: the one pure civil-time engine (local days, date-times, EDTF, three-valued comparison, the law's time rules, due dates, recurrences, fiscal periods, `validAt`); "now" is the caller's; local facts from the view given.

- civil-time R1 · `localDay(instant, zone) → YYYY-MM-DD` answers the calendar day in `zone` on which `instant` falls, across daylight-saving changes; an unknown zone is refused `ZONE_INVALID`.

`text-chain.md`: the transcription provenance chain (what each step, a member's typing included, may claim; a chain only weakens; attestation and its extent); pure.

`record-core.md`: the record's storage (ids, leases, append-only history and manifest, purge); no member, fence or write path.

- record-core R21 · Each table declared once via `declareTable(module, entries)` with classes `purge`, `expunge`, `export`, `sight` (`group`/`bundle`/`source`/`owner`), `derive`, `version_chain` (`TABLE_CLASS_MISSING`/`TABLE_CLASS_UNKNOWN`); `declarePurge(module, tables, {exempt?})` is its default form (`sight` `bundle` when keyed to a bundle); twice `TABLE_DECLARED`.
- record-core R46 · A declared table is a name (keyed by `bundle_id`) or `{name, keys, whole}`, the same fields beside the classes.

`membership.md`: who the members are and what each may do; projects at setup, sight of a project, the fence for acting in one; no record integrity, no credential.

- membership R77 · `existenceAct(projectId, viewer)` answers `PROJECT_SEEN_NOT_A_PARTICIPANT` (C-70.1: id and name only, check and translation) at existence-only sight (R43), else `null` (also with no viewer); an administrator at a hidden project's `EXISTENCE` (R44) alone also gets `owners` (D54). Asked before every no-such-project answer by this module and `promotion`; C-70.1 minted only here; never throws.

`promotion.md`: the one write path for a bundle (compare-and-swap, append-only history, the document's bytes as the record's word, all-or-nothing); the ratification gate; reopens a set-down inquiry.

- promotion R39 · `registerStep(module, {check?, project?})`: once at start, a `check` before and a `project`ion after the write in one transaction; a check's refusal refuses the promotion with its own `reason` as it came (K2653); order: promotion's own refusals, checks in the modules' total order, `commit`, projections (adding keys, never replacing); twice `STEP_DECLARED`.
- promotion R40 · `registerFact`/`fact(name, ...args)`: no provider `FACT_UNAVAILABLE` (never read as false), a throwing one `FACT_FAILED`.

`provenance.md`: the trust root (each captured byte sequence's one home, receipts, capture grade, firsthand observation).

`extraction.md`: readings from captured bytes with provenance and the transcription chain; mints no content, writes no bundle.

`content.md`: the unit the record points at (part of a captured document): extent grammar, content address `hash(capture, extent, chain)`, content rows and transcription claims, a member's typing a second member attests; never moves a reference.

- content R11 · `captureFor(bundleId, authored?)`: a non-empty held `authored` capture wins (not held: null, never replaced); else the first-held capture by `provenance.capturesOf`, never the newest; else the first-held its readings carry (`extraction.capturesReadFor`); none, null.
- content R27 · `citationRefusals(citations, label)` (citation `{target, extent?, extent_capture?, content_id?}`): non-document target with part or content id C-45.3; unheld content id `CONTENT_ROW_UNKNOWN` (C-45.5); another document's `CONTENT_ROW_NOT_THIS_TARGET` (C-45.6); a part with no held capture C-45.2; otherwise R7 against R11's capture; every refusal returned, one context per capture per call.
- content R28 · `resolveCitation(citation)` uses a named content id; else mints R5's extent over R11's capture; non-document `INQUIRY_TARGET`, no capture `NO_BYTES_HELD`, each `content_id: null` with the reason.

`entities.md`: the entity axis and subject registry (aliases, member-declared relations); resolves references with the §8.1 grade; which documents concern or name an entity; shared identifiers (§8.3); no connection.

- entities R5 · `readEntity({entityId})`: `NO_ENTITY` for empty; absent `{ok: true, found: false}`; the entity with aliases (canonical first, `declared_by`, `at`) and relations (`direction` `out`/`in`, oldest first).
- entities R6 · `entitiesByAlias({alias})` answers every entity holding the alias's fold, id order, ambiguity kept; folding to nothing `count: 0`. `readRelation({relationId})`: `NO_RELATION` for empty; absent `found: false`.
- entities R7 · `has(entityId)` answers whether the registry holds the id; `kinds()`, `relationKinds()` the closed lists.
- entities R8 · (K106) A withdrawn alias matches nothing new and `entitiesByAlias` does not answer through it; shown withdrawn; nothing deleted.
- entities R14 · `resolutionsFor({captureSha, limit, viewer})`: `NO_SHA`; the capture's resolutions with grade and method, bounded (500 default, 5,000 max), `truncated`, and `unresolved`.
- entities R15 · `concerns({entityId, limit, viewer})`: `NO_ENTITY`; one entry per capture resolving to the entity, its strongest resolution; `found`, `count`, `truncated`.
- entities R16 · `strongestByCapture(entityId)`: R15's per-capture collapse unbounded, for `connections`, `progressions` and the earned registry.

`connections.md`: derived connections, edges between bundles (`references[]`), themes; grade never states credibility.

`progressions.md`: declared flows of stages, threaded by one entity, graded and checked on read.

`observation-log.md`: the append-only record of looking and the member's lead (never evidence).

`standards.md`: what a government act is measured against, held as content with its period in force.

`duties.md`: the obligation object `DUT-`, occurrences derived on read; overdue raises a question.

`retrieval.md`: runs the query language and says what it could not see; never without the viewer's gate.

`inquiry-grammar.md`: the inquiry document's grammar as checked (C-2.8, C-6.3, C-21.2, C-45, C-6.1, C-15.1, C-54.1) and the rows inquiry's acts mint; pure.

`leg-earning.md`: what the record can earn for a leg and which questions rest on a target; the earned registry and basis, resting legs, the one cycle walk, projects drawing on a question; writes no basis, grades no conclusion.

- leg-earning R1 · `earned(subjectEntity, targetIds, contentIds?)` answers per target the connection grade earned (the strongest A–C resolution of its captures to the subject, by `entities.strongestByCapture`; D earns nothing), the capture ceiling (`EARNED_CAPTURE_CEILING`, bounded by `text-chain.captureBound` over machine transcriptions, undetermined when all are unmeasured), and for a member's authored observation testimony D, capture axis not applicable; each with a `why`; content ids add standings (`content.standings`, `connections.portionGrades`). `earnedForDoc(fm, legs)` answers for the front matter's `subject_entity`, else none.
- leg-earning R2 · `legCapped(stated, earned, targetId)` answers null when the stated grade is within what the target earns, else the earned grade and why; an undetermined ceiling answers null grade with the reason.
- leg-earning R3 · `earnedBasis({id, targets, viewer})`: `NO_ID`, `NO_SUCH_BUNDLE`, `NOT_AN_INQUIRY`; at most 200 targets; invisible left out, said so; imported legs `IMPORTED_TARGET`; document legs carry content row and capture pin (REC-220).
- leg-earning R4 · `basisFor(id, {limit?})` answers projected legs in order (`limit`, `truncated`); `restingOn(targetId)` every leg naming the target, `confirmed` or `severed` (`connections.edgeSevered`); ungated, in-process only.
- leg-earning R5 · `restsOnLive(id)`: divided citer skipped, severed `severed`, a case member's `frozen`, else `confirmed`.
- leg-earning R6 · `cyclePath(id, targets)` answers the whole cycle path `[id, target, …, id]` for the first target that would close one through inquiry legs, else null; the one walk.
- leg-earning R7 · `projectsDrawingOn(id)`: projects holding a non-severed `cites` reference, over every project, at most 32 by id, `truncated`; a severed citer takes no slot.

`bias.md`: declared bias sets and the effective lens; disclosed, never blocking.

`capture.md`: brings material in with provenance; writes no bundle.

`calculations.md`: `CALC-`, closed recipes, recomputed at acceptance and publication; never "breach".

`lines.md`: dated, cited, graded lines between entities (offices, posts, interests, ties), as of a date; `holderAt`.

`setup-words.md`: the interface's word list as frozen data from `words.json`.

`test-support.md`: test sandbox, tally-safe output, ZIPs and shared generators.

`public-read.md`, cited by an entry as "public-read A1-R7":

- public-read R52 · *(not yet met: T53)* (T53; DEC-457, DEC-481; K5540; PLANNING A1-R7) A subject changed after publication is shown on the published case: one dated line by key (`screen.published.subjectchanged.*`), naming the new subject only when the caller passes `naming` `{named: true, name}` (decided by `case-disclosures` R46; a private person never); the reason and strength pair stay inside the team; edition bytes unchanged; nothing drawn when unchanged or in no edition.

## This task

- R87 · R88 · R89 · T53-178 · A1 (DEC-457) · `setSubject` with a reason, `subjectHistory`, the private-person warning on a subject `[UX need]` (`planning/lines-A1-A7-subject-pickers.md`, inquiry R87–R90). L1 decided (K5515): offices too; L13 (K5536): a change refused until the named connections are re-graded (R87, R6, R32); L14 (K5539): only its owner or an administrator, else `NOT_THE_QUESTION_OWNER` (R87); L15 (K5540): a published or divided question too, the change shown, public-read A1-R7 the dated line on the published case `[UX need to UX-DESIGN]` (R87, R35, R64; public-read R52); L16 (K5541): the subject may be taken off with a reason (R87, R88 `cleared`); L17 (K5542): a concluded question's too, the conclusion kept (R87). Shapes R27, R28, R65; warning R59, R63 (R89); judging R11; `subjectEntityOf` R43, column R40, projection R12; sight R33.
- R90 · T53-179 · DEC-481 · each subject change answered with its date, member, old and new subject, part and reason (A1's `subjectHistory`, `planning/lines-A1-A7-subject-pickers.md` A1-R2): R90 amending R88.

T53-180 · K5565 · English in tests: the plan's common entry (convert English-in-test sites to the word key and its values; a B site first gets its key in the module; a C site kept as input or removed with its reason; every touched test converted; sources `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md`; Test: the words check's baseline loses the module's files, suite green). Counts: literal A / B files 0 / 0; regex A / B / C sites 16 / 31 / 31 (23 files).

