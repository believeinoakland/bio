# Task summary · T53 · consequences

Stands for the consequences job's reading set (SESSIONS §6.3): plan block `build/plan/current.md:273-275`, rows file `build/plan/T53-R1/consequences.md` (no trims file exists), `build/requirements/consequences.md` whole, `build/layers.md` (head, layer 9 row), and Purpose plus named service blocks of the used modules. The sources stay binding; read any cited section in full when the work touches it.

## Entries

- T53-287 · K5565 · English in tests: the module's one entry (`current.md:274`; R25, R26).
- rows: `build/plan/T53-R1/consequences.md` (`current.md:275`).
- Row plan-T53-draft.md · **English in tests** (K5565): every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md` (R25).
- Row plan-T53-tests-english.md · **entry, same for every module** · T53 · K5565: convert English-in-test sites to the word key and its values (assertions read the key the product reads, never a copied sentence); a B site (text only in the module's source) first gets its key in the module (a words row, UX-DESIGN's wording where shown to a member); a C site (in neither) is test input or a dead assertion: kept as input, or removed with its reason; every test touched is converted (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` · Test: the words check's baseline loses the module's files, suite green (R25).
- Row · literal sites (CENSUS) A / B files; regex sites (CENSUS-RX) A / B / C sites (files); counts before TESTS-SWEEP's conversions. "only this · <model>": BOB #324, K3518: `haiku-5-5` test-only, `sonnet-5-5` where a B site needs the module to give a key first; K5565 gives the module a job in R1 (R25).
- Row · layer 9 · consequences · literal 0 / 0 · regex 8 / 2 / 7 (5) · only this · sonnet-5-5: two B regex sites need a words key first (R19, R25).
- layers.md head · modules use earlier modules only (P4); layer 9: an action rests on the record, one asserting a breach on a member's determination, on findings published, checked and held, or accepted from another group (v0.2 §2, K2780); the AI never files or sends (R1).
- layers.md layer 9 row `consequences` (Bob 2026-09-26; OP6; Function 4): computed where the record holds figures, else undetermined; harm a finding needing evidence; a person named only with consent or where Design Requirement 6 allows, a source protected (K1484); significance the member's (K12) (R2, R5, R9, R10, R16).

## consequences (own requirements)

Status: in force, approved by Bob 2026-09-26 (K102); R2-R4 Bob's ruling K12; R9's empty case K172. Last changed T47 (R24 audit clause met, N958; R22 via `case-inputs` R9, `case-authoring` out of `uses`, N908, K2982); marked not yet met (T47). Later: R26 (T51), R27 (K5157). Size (P6) 700-1,000 lines. No requirement is retired or moved (R1-R27 stand).

Purpose: what a breach did, to whom: for a noncompliant determination, the affected, measure (money, benefits, services, time, counts) and period; computed where the record holds figures, each with basis and grade, else undetermined, members determining it from the record and their own assessment, each part recorded as what it is; harm following from the act is a finding needing evidence, never assumed; records whether each is addressed, which `escalation`'s exit condition reads (OP6); significance is the member's (K12); addressed is a reasoned statement with evidence per part, never a percentage (R9). Holds the **success record** (R17-R21) and carries outcomes into a case's next edition (R22). Breach-only: a success record is never a consequence (R23).

Terms. **Affected** `{kind, description, role?, person?}`, `kind` one of `class`, `fund`, `program`, `service`, `body`, `person`, `other`; `role` `{role, body}` for an office; `person` `{entity, named_in}` for `kind: person` (R10). **Measure** `{unit, currency?, value | range}`, `unit` one of `money`, `benefits`, `services`, `time`, `count`, each value an exact decimal (`calc-grammar`), never floating point. **Part**: one affected, one measure, one period, in one state: `computed`, `assessed` or `undetermined`.

**consequenceRecord({determination, standard, affected, measure?, period, basis, causation?, author, viewer}) → `{ok: true, id, part}` or refusal**
- R1 · Refusals in order: `NO_SUCH_DETERMINATION` (absent or invisible, one answer; `conformance.noSuchDetermination`); `DETERMINATION_SUPERSEDED` (`conformance.determinationSuperseded`); `CONSEQUENCE_NOT_NONCOMPLIANT` (outcome for `standard` not `noncompliant`; C-114.2, K275); `CONSEQUENCE_NOT_A_PARTICIPANT` (member author not joined; a machine's computed part, R2, answers no project authority, K171; C-114.3); `AFFECTED_UNKNOWN_KIND`; R10's refusals; `MEASURE_UNKNOWN_UNIT`; `MEASURE_INVALID` (bound not an exact decimal through `calc-grammar`, range reversed, or `currency` on a non-`money` unit); `PERIOD_INVALID`. After `DETERMINATION_SUPERSEDED`, a void determination (`conformance` R33) is refused through `conformance.determinationVoided`, writing nothing, for `consequenceRecord` and revisions (R6); recorded parts stand. Control: the same part on a determination not void lands.
- R2 · `computed` when `basis` is `{op, operands}`, `op` one of `sum`, `difference`, `count`, `product`, `ratio`; each operand one of: a content id whose passage holds the figure, read by `calc-grammar`'s figure reader (its R1-R3: exact, currency sign or code kept, `%` as percent; no parser here, C:A-11); a money fact (`money.readFact`), amount as held (B1b.6); a calculation output (`calculations.read`, by calculation and result key, K1448). Value is `calc-grammar`'s exact arithmetic (`product` = `multiply`), never the author's, never floating point; different currencies or units refused as `calc-grammar` refuses (`UNIT_MISMATCH`); a total `money.summable` refuses is refused by its code. Operand grades: content its capture's (`provenance.captureGrade`, K171), money fact its own, calculation output the capture axis of its grade facts (`calculations` R9); the part's grade is the weakest (DEC-21), named. A machine may record a computed part, labelled machine work with operands shown (K102); R3 and R9 stay members'. A calculation operand's held/visible state and grade are read through `calcStatusOf` (its R31) and `gradeFactsOf` (its R30, `capture`): not held or not visible to the author = not in the record (R4), answered as absent; visible = read as any operand, never withheld from a member those reads admit.
- R3 · `assessed` when a member states value or range with a rationale (at most 2,000 characters) and what it rests on (content ids or findings, possibly none, stated as none); carries who and when; never presented, summed or graded as computed. `MACHINE_CANNOT_ASSESS` for a machine.
- R4 · No measure, or a computation lacking an operand: `undetermined`, with why (figure not in the record; held in a form not read; nobody assessed). Never read as zero.
- R5 · `causation` names an inquiry whose finding is that the harm follows from the act. Measure zero (value 0 or range [0, 0]): `not_applicable`, not `unproven` for R9 (K283; N257). Otherwise none, or one not concluded: `unproven`, with why: lands, not a refusal, never a low grade (DEC-14). With one, the answer carries its strength pair (`strength.inquiryStrength`), per axis.
- R6 · Never edited: `consequenceRevise({id, ..., reason, author})` records a successor, with R1's refusals; the earlier stays readable with the link.

**consequencesOf({determination, standard?, viewer}) → `{parts, totals, undetermined, unproven}`**
- R7 · Lists every live part with state, grade or assessor, causation, addressed state. `totals` summed only within one state, unit and currency, labelled with state and parts counted; never across. `undetermined` and `unproven` list those parts. `NO_SUCH_DETERMINATION` as R1.
- R8 · A part whose operand content has a newer capture not carrying the passage, or whose causation inquiry is reopened or superseded: `basis_changed`, naming why; nothing recomputed until a member revises.

**addressedRecord({id, state, evidence, reason, author, viewer}); addressed({determination, viewer}) → `{state, parts}`**
- R9 · A member records `addressed` or `not_addressed` with evidence (content ids or findings; `ADDRESSED_NO_EVIDENCE` for `addressed` with none) and a reason; `MACHINE_CANNOT_ADDRESS` otherwise. Per part; overall `addressed` only when every live part is; any `not_addressed` or never assessed: `not_addressed`; any `undetermined` or `unproven`: `undetermined`. No live part: `undetermined`, "no consequence recorded", never `addressed` (K172). Accepted on parts of a superseded determination (`escalation` R14, K171). Partial redress does not end the escalation (Roadmap §5). `words` on `addressed`: at most five distinct of `remedied`, `mitigated`, `compensated`, `acknowledged`, `cannot_be_undone`; another token, or `words` on `not_addressed`: `ADDRESSED_WORD_REFUSED`. Any key `percent`, `percentage`, `share`, `ratio` or `score`, or `%` in `words`: `ADDRESSED_NO_PERCENTAGE`. `reason` required for both: absent or blank `ADDRESSED_NO_REASON`, over 2,000 characters `ADDRESSED_BAD_REASON`. Control: `words: ["mitigated"]` with no such key lands.

**successRecord, successRevise, successRecordRead, successRecordsFor, outcomeCarry**
- R17 · `successRecord({project, matter?, statement, changed_on, evidence, figures?, sequence?, cause?, author, viewer})` (`op=successrecord`): a record object of its own type (R14's pattern; R24), `SUC-<year>-<4 digits>`. `statement` 1-2,000 characters; `changed_on` a real calendar date (`civil-time.isCalendarDate`) or EDTF band; `evidence` 1-50 content ids or findings the author may see; `matter` `{plan, matter}` stored as given, never read here. Refusals in order, writing nothing: `MACHINE_CANNOT_RECORD_SUCCESS` (empty or machine author); `NO_SUCH_PROJECT` (`membership.noSuchProject`); `SUCCESS_NOT_A_PARTICIPANT`; `SUCCESS_NO_STATEMENT`; `SUCCESS_BAD_DATE`; `SUCCESS_NO_EVIDENCE` (none or unseen, alike); R18's; R19's; `SUCCESS_TOO_LARGE` (over 50 evidence items, 20 figures, or `sequence` over 1,000 characters), naming part and cap. Answers `{ok: true, id}`.
- R18 · Each `figures` item `{label, basis: {op, operands}}`, computed exactly as R2 (operands, refusals, weakest grade), operands shown. Stated `value` or `range`: `SUCCESS_FIGURE_NOT_COMPUTED`; an operand not in the record: `undetermined` with why, never zero (R4). A machine may compute a figure for a member to adopt; never records the success record.
- R19 · `sequence`: the member's text on order of events, answered with the sentence keyed `consequences.success.sequence_not_cause`. `cause` `{statement, evidence}`: statement 1-2,000 characters (`SUCCESS_CAUSE_UNSTATED`), evidence 1-50 items the author may see (`SUCCESS_CAUSE_NOT_EVIDENCED`). `SUCCESS_CAUSE_OWN_ACT_ONLY` when every evidence item is the group's own act, per the one registered reader `registerOwnActReader(fn)` (K31's pattern, one registration, `membership.listenerRefusal`; filled by `actions`), `fn({ids, viewer})` answering ids that are an action of this group or the capture of one of its `sent` entries. No reader, or it throws: `SUCCESS_CAUSE_UNCHECKABLE`, never accepted. No `cause`: `cause: null` with the sentence keyed `consequences.success.cause_not_stated`. Control: one evidence item not the group's own act lands.
- R20 · `successRecordRead({id, viewer})` answers R17's fields, figures with grades, `sequence`, `cause`, author, time, supersession links, carries (R22); absent or invisible `NO_SUCH_SUCCESS_RECORD`, one answer. `successRecordsFor({project?, matter?, after?, limit?, viewer})`: live ones, at most 200 per page in id order, `truncated` by reading one past; unseen withheld whole as R15; the read `actions` uses.
- R21 · Never edited: `successRevise({id, …, reason, author, viewer})` records a successor with R17's refusals and a reason (`SUCCESS_NO_REASON` absent or blank, `SUCCESS_BAD_REASON` over 2,000 characters), earlier readable with the link; a second successor of one record: `SUCCESS_SUPERSEDED`.
- R22 · `outcomeCarry({carry, case, text?, author, viewer})` (`op=outcomecarry`): carries an outcome into the next edition by `case-inputs.carryOutcome({case, kind, text, cites, on, by})` (its R9), via `caseInputsOf`. `carry` one of `{success: id}` (live: kind `success`, `text` its statement, `cites` its evidence, `on` its `changed_on`), `{addressed: part}` (latest `addressed` statement, R9: kind `harm_addressed`, `text` its reason, `cites` its evidence, `on` its date), `{cure: link}` (`conformance.curesOf`, its R37: kind `cure`, `text` the member's words in this act, `cites` the curing act's evidence, `on` its `when`). Only `text` and `cites` pass; figures, sequence, cause stay unpublished, so a carried outcome never states a cause. Refusals in order: `MACHINE_CANNOT_CARRY`; `NO_SUCH_SUCCESS_RECORD`, an absent or invisible part (R13) or `conformance`'s refusal for the link; `SUCCESS_SUPERSEDED`; then `carryOutcome`'s (`BAD_CARRIED_OUTCOME` among them), passed through. Records `{carried: outcome, case, by, at}` on the carried record, answers `carryOutcome`'s answer; the case changes only through that service. Control: each kind carries; a `cause` passes none.
- R23 · A success record is never a part: `consequencesOf` (R7), `addressed` (R9) and totals never read, list or count one; R1 keeps `CONSEQUENCE_NOT_NONCOMPLIANT`; no answer carries significance, severity, priority, percentage of success or score (R11). Append-only, declared to purge (K23). Control: a project with both answers `consequencesOf` with the part alone.
- R24 · (T46, T47; N911, N958; `record-grammar` R59, R62) With `record-grammar` registering `success_record` (`SUC`, one state `recorded`), every success record is a record object of that type, promoted through `promotion` with history, audit, export as a part (R14), under its `SUC-` id; one recorded before T46 is promoted with id, fields, author, time unchanged; successors (R21), carries (R22), reads (R20) as before. Control: one before and one after read alike with history. Audit clause met: audits with no finding through `checkBundle`; the `test.todo` naming N958 is a test (K208), control a `success_record` with a slug id auditing with its finding.
- R25 · (T46; DEC-194; N913; amends R9, R17-R22) Rows C-114.23 `ADDRESSED_WORD_REFUSED`, .24 `ADDRESSED_NO_PERCENTAGE`, .25 `ADDRESSED_NO_REASON`, .26 `ADDRESSED_BAD_REASON`, .27 `MACHINE_CANNOT_RECORD_SUCCESS`, .28 `SUCCESS_NOT_A_PARTICIPANT`, .30 `SUCCESS_BAD_DATE`, .31 `SUCCESS_NO_EVIDENCE`, .32 `SUCCESS_TOO_LARGE`, .33 `SUCCESS_FIGURE_NOT_COMPUTED`, .35 `SUCCESS_CAUSE_NOT_EVIDENCED`, .36 `SUCCESS_CAUSE_OWN_ACT_ONLY`, .38 `NO_SUCH_SUCCESS_RECORD`, .39 `SUCCESS_NO_REASON`, .40 `SUCCESS_BAD_REASON`, .41 `SUCCESS_SUPERSEDED`, .42 `MACHINE_CANNOT_CARRY` take translations from `words.json`'s `refusal.<CODE>`, read by key, never a copied sentence; codes, numbers, `where`s, behaviour unmoved. R19's sentences answered with keys and `words.json`'s words: `consequences.success.sequence_not_cause` beside a stated `sequence`, `consequences.success.cause_not_stated` beside an absent `cause`. Three rows keep present translations, returned to BOB, read by key once sentence and requirement agree: C-114.29 `SUCCESS_NO_STATEMENT` (R17 also refuses a non-text `sequence` with it), C-114.34 `SUCCESS_CAUSE_UNSTATED` (R19 also refuses a cause over 2,000 characters), C-114.37 `SUCCESS_CAUSE_UNCHECKABLE` (names "Civicsmith" bare; DEC-149: "your group's Civicsmith"). Other rows keep theirs. The seventeen wait for T47's promotion stamp (T46 rule 5 (2)).
- R26 · (T51; K4168; op-declarations R80, R81; op-grades R49, R50; test-support R15) `DECLARED_OPS` exported beside the ops map: frozen, keyed by door name, each `{classes, machineClasses?, mutating, weight, description, fields: {accepts, requires}}`, copied from existing rows, fields read from the arm whole (stamps and the shell's `reason` not accepts unless the arm reads its own): `consequencerecord`, `consequencerevise`, `addressedrecord`, `successrecord`. Test: `declaredOpHolds` for each with only its requires, without each, and with a field outside accepts (`declared-ops.test.mjs`).
- R27 · (K5157; walk-T51-final 11 §3) For R5 and R8 an inquiry is concluded when its state is `concluded` or `published`, or when the project the determination is in has concluded it (`basis-versions.conclusionOf`, basis-versions R22); reopened likewise.

Private · Uses
- R1, R2, R5, R10, R14, R17 · Uses (details below): `record-grammar` (`isMachineIdentity`; `CONS-` registration), `record-core`, `membership` (`sight`, `projectAuthority`, `viewerPredicate`, `noSuchProject`, `listenerRefusal`), `promotion` (`promote`), `content`, `provenance`, `inquiry`, `strength`, `calc-grammar` (its R1-R5; replaces `consequences/figures.mjs`), `money`, `calculations` (`read`, `gradeFactsOf`, `calcStatusOf`), `people`, `entities`, `conformance` (also `determinationVoided`, `curesOf`; supplants C-114.1), `civil-time`, `case-inputs` (replaces `case-authoring` R71; N908, K2982; new edges BOB's, K2780). `actions` (later) registers R19's reader: no edge.

Private · Invariants
- R10 · (K1484 C2 row 7; K1483) People counted as a class or named in official role; a harmed person a document names: `affected.kind: person` names a `person` entity and `named_in`, a content id of a held capture whose passage names them; none: `AFFECTED_PERSON_NOT_NAMED`; entity not a person: `AFFECTED_NOT_A_PERSON`. Published text names such a person only with consent or as Design Requirement 6 allows (`case-disclosures` R25); a protected source (`people`' link) stays protected: no read names them to a viewer that link's sight does not admit (R16; DEC-78).
- R11 · No answer composes computed, assessed and undetermined parts into one figure; none carries significance, severity, priority or score (K12).
- R12 · No harm assumed: every part answers causation `established` (naming the inquiry), `unproven`, or `not_applicable` for a zero measure (N257, K283).
- R13 · Parts, revisions, addressed records append-only, declared to `record-core`'s purge (K23). No place named in behaviour or outward text. A part in a project the viewer may not see is answered as absent; inside a visible part, R15.
- R14 · A part is a record object of its own type: promoted through `promotion`, with history, audit and export like a finding; a revision a successor (`standards` R15).
- R15 · (K903 (4), DEC-36) A part's answer (R6, R7, every read of parts) withholds whole what the viewer may not see: an operand whose content lies in an unseen bundle leaves `computation.operands`; (N576, K1649) a calculation operand leaves exactly when `calculations.calcStatusOf` (its R31) answers it not `visible`; an unseen causation inquiry is not named: `causation` keeps its `state`, `inquiry`, `why`, `strength` left out; unseen ids in `rests_on` or `evidence` leave the list; an R8 cause about a withheld item is left out. No id, title, state, placeholder or count; never a null. The part states `out_of_view: true`; value, grade and other facts stand. A viewer who sees everything: no `out_of_view` key.
- R16 · (K1484 C2 row 7) A part whose `affected` is a person: entity and naming passage to a viewer who may see that passage's capture; else `affected: {kind: person}`, both withheld whole (R15, `out_of_view: true`), value and grade standing. A protected source is withheld from every viewer the link's sight does not admit. (N600, K1649) `people.sourceLinkSight(person)` (its R34): `null` leaves the capture's sight to decide; a list withholds from all not in it. Answered as for an unseen capture, so no answer says a link is held.

Private · Satisfies
- R2, R10, R16 · K1448; K1484 C2 row 7, K1483. R9 · Roadmap v5 §5, §10. R7, R9 · Functional Architecture v3 Function 4, 5. R2, R5 · DEC-14, DEC-21, DEC-44. R11 · layers.md layer 9, K12. R1, R9, R17-R23 · `BIO_Action_v0_2.md` §3, §4 rules 1, 16, 17 (K2780; T45, N893); Actions D5, D6c.

Private · Suggestions
- R14 · Factory `consequencesModule(ctx)`; service keeps `consequencesOf` (R7, K171). Prefix `CONS-`, state `recorded`, no edges; tables `consequence_parts`, `consequence_operands`, `consequence_addressed`.
- R2 · Operands read figures from the cited passage's text; the parser is `calc-grammar`'s (the job proves its R3 accepts every figure the old one did and deletes `figures.mjs`); budget readers belong to `extraction`/`docprofile`. AI may prepare computed parts and propose assessments as text; never records `assessed` or `addressed` (R3, R9).
- R9 · Any joined participant may say a consequence is addressed (K102); an escalation ends only by a member's own act (`escalation` R14).
- R1-R16 · Tests: every refusal with a negative control; R2 hand-computed, `0.1 + 0.2` exact; R7 mixed states and currencies; R9 all mixes, empty case; R10; R16 withholding.
- R10, R6 · T33-71 (BOB's): R10's new codes join C-114 at the job's stamp; whether stored floats are re-read as exact decimals is the job's START question.
- R7, R14 · Open for Bob: none (K102). Decided by BOB: uses gain `legacy-checks`, `promotion` (R14); DEC-14's action `consequence` stays `actions`' (R5); totals within one state, unit, currency (R7), undetermined never zero (R4); a superseded determination's parts readable, not carried forward (R1, R9).

## Uses: record-grammar

- R14 · Purpose: shared grammar below every document-reading module: id and type vocabulary, front-matter parser, canonical JSON, actor identity, grade vocabulary, the one SHA-256; no store, network or clock. (Named: `isMachineIdentity`.)

## Uses: record-core

- R1 · Purpose: owns storage: id allocation, leases, append-only history and manifest of every promotion, purge; no member/fence nor promotion write path.
- R1 · **allocId(prefix, year) → `{id}`**: mints from `record-grammar`'s `ID_TABLE` (its R46). Sequential prefix (and one the table lacks): `<prefix>-<year>-N`, N next unused in the scope, zero-padded to four digits never cut, no ceiling (10,000th is `…-10000`), counter stepped so a number is never returned twice, purge or no purge. Opaque prefix: R76's id.
- R2 · allocId takes the identical step alone or inside a caller's transaction. Never throws.
- R32 · **transact(fn) → fn's result**: one transaction over the whole store; `fn` throws or returns `ok:false`: every row in any module's tables rolled back, no id spent. A nested call joins the outer one; a nested throw or refusal rolls back its own writes and ids (savepoint). Rethrows what `fn` throws, after rollback.
- R47 · **stampInstant(precision, when?) → string** (N58, K85): `when` ms since epoch (default now), UTC ISO 8601: `"second"` `YYYY-MM-DDTHH:MM:SSZ`, `"millisecond"` `YYYY-MM-DDTHH:MM:SS.sssZ`; other precision throws, naming it.

## Uses: membership

- R1 · Purpose: who members are and may do; projects as working groups at setup (joining, leaving, visibility, what a caller may see, the fence); roster reads and votes are `project-roster`'s; no credential.

## Uses: promotion

- R14 · Purpose: the one write path for a bundle: compare-and-swap, append-only history; refuses a whole promotion when any rule fails; runs the check catalogue at ratification; does not decide what a document must say.

## Uses: provenance

- R2 · Purpose: trust root: the register, acquisition receipts, the capture grade a route earns, firsthand observation; a hop attests bytes, address and time, never credibility.
- R24 · **captureGrade(captureSha) → `{grade, route, determined, basis}`**: capture axis from route. Direct receipt: `EARNED_CAPTURE_CEILING` (B), measured, `route: "direct"`.
- R25 · Only archive replay (`via: "archive.org"`): `ARCHIVE_CAPTURE_GRADE`, one rank below the ceiling in `BASIS_GRADES` (C), measured, `route: "archive"`; one exported definition.
- R26 · No recorded route: `route: "unrecorded"`, `determined: false`; grade is the member's authored letter under the ceiling, stated as authored. A via no ruling names: `CAPTURE_GRADE_VIA_UNRULED`, undetermined.
- R27 · Authored observation (R1 `authored`): `grade: null`, `determined: false`, `basis: "CAPTURE_AXIS_AUTHORED"`; `TESTIMONY_GRADE` (D) on the testimony axis. No letter above `EARNED_CAPTURE_CEILING` is earned.
- R51 · (N364; K509 (3)) Route `doorbell` (`doorbell` R13): `route: "doorbell"`, `determined: false`, `basis: "CAPTURE_RECEIVED_NOT_FETCHED"`; authored letter under the ceiling; existence proven by the receipt's timestamp.
- R59 · (N688; K1844, K1852) Route `unpacked` (`via: "unpacked"`, `UNPACKED_VIA`; R15): earns exactly its archive's `captureGrade` (locator `zip:<archiveSha>!<index>`), fields unchanged, except `route: "unpacked"`, `basis: "CAPTURE_UNPACKED_FROM_ARCHIVE"`, `archive: {sha256, through, route, basis}`. Nested, at most `ARCHIVE_DEPTH_MAX` (`ooxml` R30). Past that, or a bad locator: `grade: null`, `route: "unpacked"`, `determined: false`, `basis: "CAPTURE_UNPACKED_UNRESOLVED"`. Several routes: strongest (determined first, higher letter, then `direct`, `archive.org`, `unpacked`, `doorbell`; an unruled route never outranks a ruled one). Never throws.

## Uses: content

- R17 · Purpose: reference to a part of a captured document: extent grammar, content address `hash(capture, extent, chain)`, the row, typed transcription a second member attests; says whether a newer capture carries the passage; moves nothing.
- R17 · **contentRow(contentId) → row or null; contentRead({id, viewer, extras}) → answer or refusal** (`op=content`); **standings(contentIds)**: `contentRead` fixed-key: other parameter than `id`, `viewer` is `FIXED_KEY_ONLY` naming them sorted; no id `NO_ID`; absent or invisible `NO_SUCH_CONTENT`.
- R18 · The plane's `store` parameter is accepted.
- R19 · Answer: row, label (R16), `says` (stale or current), transcription axis (R21), attestations bearing, capture axis as the document's, connection axis not answered (`NO_SUBJECT_IN_THIS_READ`).
- R20 · `standings`: at most 200 ids, no connection axis.
- R21 · Transcription axis: n/a for `bytes`; undetermined, stated, where coverage cannot be evaluated; else `text-chain.gradeCeiling(chain, target, covering)`; neither capture's nor typing's attestations raise the other.
- R29 · **passageNotice({contentId, viewer}) → notice or refusal**: writes nothing. Asks `provenance.versionChain` at each retrieval address (at most 20). `no_newer_capture` only when every chain read and empty after it; `newer_capture_matched` when every newer candidate matched; `newer_capture_undetermined` otherwise; `chain_unread` (`newer: null`) when no address, an address not asked, or a chain not held for this viewer. Absent or invisible: `VERSION_NOTICE_NO_CONTENT` (C-80.3).
- R30 · A candidate's extent holds only where the newer capture's context holds the bound and R7 passes; else the reason says outside or unread. Nothing minted; never the same passage.
- R31 · Candidate grade from text units (`extraction`): `A` byte-identical at extent, `B` identical text elsewhere (`found_at`), `C` word-multiset Dice at or above 0.7 (`similarity`), `NOT_FOUND` only where units held whole, else `UNDETERMINED`. `A`,`B` unaffected; `C`,`NOT_FOUND` affected; `affects`: affected if any, else undetermined if any, else unaffected; null with no newer capture, undetermined when unread.

## Uses: inquiry

- R5 · Purpose: the one recursive object of case-making: question, legs of its basis, conclusion; lifecycle, leg grading, ground partition (DEC-32), supersession; holds no basis version, conclusion or strength.

## Uses: strength

- R5 · Purpose: what a claim is worth, derived: a pair, the weakest capture and the weakest connection (DEC-21), testimony beside, never composed (DEC-44).
- R6 · **inquiryStrength({id, viewer})** (`op=inquirystrength`): `NO_ID`; absent or invisible `NO_SUCH_BUNDLE`; `NOT_AN_INQUIRY`. Else R1-R5's answer, unseen members withheld whole in members and prose (no id, title, state, placeholder, count), `out_of_view: true` (DEC-36). Computed on read, not from cache (R13). (T51 K4260) Also `ungraded` (members inert on every axis) with `ungraded_count`; withheld members neither listed nor counted.

## Uses: conformance

- R9 · Purpose: a member's determination, on findings (published; held-checked by `case-check`; or accepted from another group, read-only: R2, R31, R32), that an act is compliant, noncompliant or unclear per standard; machine never determines; no significance ranking (K12); another group's never adopted (R35); a voided check or withdrawn source reads undetermined (R33); cure link (R36, R37).
- R9 · **determinationRead({id, viewer}); determinationsFor({project?, act?, standard?, finding?, outcome?, live?, after?, limit?, viewer}) → `{items, cursor, truncated}`**: read answers R1's fields, per-standard outcomes, each finding's pinned edition and strength pair frozen at publication beside live (`strength.inquiryStrength`), per axis never composed (DEC-44), author, time, supersession, R10's flag. Absent or invisible: `NO_SUCH_DETERMINATION`, one answer (R19); unseen withheld whole (R24). Also R22's cause; `outcomes_differ: true` when per-standard outcomes (R4) differ; each finding's `basis`, `void` (R33), `cured_by`, `cures` (R37).
- R10 · `live` until superseded. `basis_changed`, naming each cause: a finding reopened, superseded or published in a later edition, a standard superseded, or a content id with a newer capture not carrying the passage (`content.passageNotice`). A notice: outcome unchanged until a member supersedes (OP4).
- R11 · `determinationsFor`: at most 200 per page (lower `limit` honoured), id order, `truncated` by reading one past; `live: true` omits superseded; `act` filters by act id; the read `consequences`, `actions`, `escalation` use. (T42; N841) Page reads do not grow with items.
- R19 · **noSuchDetermination(determinationId, extra?) → refusal** (N309, N312, K275): none the caller may see (absent or invisible alike). `{ok: false, reason: "NO_SUCH_DETERMINATION", code: "NO_SUCH_DETERMINATION", check, translation, determination, detail}`; `determination` the id as asked (null if none), `detail` one fixed sentence; `extra` adds, never replaces. Used by `consequences` R1, R7, R9, `escalation` R1, `filings` R21; C-114.1, C-116.3 give way. Never throws.
- R20 · **determinationSuperseded(determinationId, supersededBy, extra?) → refusal**: not live (R10). `{ok: false, reason: "DETERMINATION_SUPERSEDED", code, check, translation, determination, superseded_by, detail}`; `superseded_by` null when unreadable. Used by `consequences` R1, `actions` R8, `escalation` R1; C-116.4 gives way. Never throws.

## Uses: entities

- R10 · Purpose: entity axis and subject registry (Framework §13): things a case is about, aliases, relations; resolves references with §8.1 grade (A, B, C; D only member testimony); derives no connection. (Named: `readEntity`.)

## Uses: calc-grammar

- R2 · Purpose: pure calculation engine: figures read exactly as printed, exact decimals with unit, currency, precision; closed grammar `bio-calc/1`; refuses by name any total the summation rule forbids; no record.

## Uses: money

- R2 · Purpose: money as stated amounts: a fact is one source's reading with kind, phase or stage, basis, period, parties, funds, two grades; never a machine-asserted truth or a total; refuses cross-axis sums by name. (Named: `readFact`, `summable`.)

## Uses: calculations

- R2 · Purpose: the `CALC-`: numbers a finding rests on, computed only by `calc-grammar`'s closed grammar, stored by key, recomputed at acceptance, publication, checker, never on read. (Named: `read`, `gradeFactsOf` R30, `calcStatusOf` R31.)

## Uses: people

- R16 · Purpose: people the record is about (K1452, K1455): identity claims never merging, dated cited graded facts, the protected source-to-person link; never concludes about a person (R29). (Named: `sourceLinkSight`, R34.)

## Uses: civil-time

- R17 · Purpose: the one civil-time engine: local days, date-times, EDTF bands, three-valued comparison, due dates, fiscal periods, `validAt`; pure. (Named: `isCalendarDate`.)

## Uses: case-inputs

- R22 · Purpose: what other acts record about a case before its next edition, read by `case-authoring`'s `op=publish`: acknowledgements, statement drafts, open requests for comment, carried outcomes, standard details (R20-R28); writes no case document but an unsigned one's acknowledgement list (R2). (Named: `caseInputsOf`, `carryOutcome`, its R9.)

## Uses: setup-words

- R25 · Purpose: the interface's word list as frozen data (key, English, note, meaning, protected mark; `words.json` at a named commit); pure; `instance-setup` reads it (its R68).

## Uses: test-support

- R26 · Purpose: a temp-file sandbox tests own and remove, stdout that keeps a final tally, in-memory ZIP writers, seeded generators (PDFs, pictures, spreadsheets, documents), ZIP64 writer, loopback origin, alarm double, job registrar stub.

## Uses: retrieval

- R25 · Purpose: runs the query language over the record and says what it could not see; four-level absence statement; no SQL of its own; mints nothing. (T51) browse is `retrieval-browse`'s (R90).

## Uses: sources

- R16 · Purpose: each source (knocker, person behind them) as a dated, attributed history of disclosures (DEC-78 item 5); what may be published, to whom.

## Uses: basis-versions

- R27 · Purpose: an inquiry's basis holds several complete, named, frozen versions (INVESTIGATIVE-SESSION §6), CURRENT (§7), a project's conclusion as adopting a version's claim (§7.1); every act a member's. Reads `conclusionOf` (its R22).

