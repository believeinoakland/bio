# M1 working extracts (draft; restructured at end)

## local-facts.txt (54 lines, read 1–54)
TIME
- [DESIGN] local-facts Purpose L11 — members confirm profile's holidays, office hours, time zone; module answers status + governing value, lapses at horizon, lists due facts a live deadline reads — "A profile's holidays, office hours and time zone (`jurisdictions` R33, R41–R44) are researched facts; this module records each member's confirmation, correction or dispute"
- [DESIGN] R1 L18 factConfirm confirm/correct/dispute with `how` 1–500 chars; correct needs value valid per jurisdictions.validate and source.
- [DESIGN] R2 L21 factStatus: governing value = latest correction ("corrected locally by <member>, <date>") else profile's (Q6); statuses confirmed/unconfirmed/corrected/disputed/absent; absent when profiles withhold as conflict (jurisdictions R15) — "the instance transmits nothing"
- [DESIGN] R3 L22 horizons — "a holiday year's confirmation lasts until that year ends, and a year not confirmed by 1 November of the year before is due; an office's hours, and the time zone, lapse 183 days after confirmation (Q7)"
- [DESIGN] R4 L25 factsDue; paths passed by caller from action-clocks.calendarFactsRead (R11) — "this module, first in layer 9, reads no action, P4"
- [DESIGN] R6 L28 factPath: holidays (year, offices), hours (office: counterparty role+body, or venue kind), time_zone. Facts per profile, never per template (L15).
- [RULING] Status L3 K921 (Q6, Q7, Q8; holidays, hours, horizons per jurisdiction not per template), K922, K925 (holiday entry's offices may name a venue as well as a counterparty role); K933 (C-126 family); K903 (6).
- [GAP] Status L3 — "Every id is not yet met: T21." (verify)
- [DOCTRINE] Satisfies L47 Action §4 rule 5 (every deadline names basis; told without nagging), rule 11 (jurisdiction lives in data; missing fact reads undetermined); D-147 with K102 "no date computed into the record".
ORGANISATIONS
- [DESIGN] R6 L28 hours keyed by office = counterparty's `role` and `body`, or venue's `kind` — offices as calendar-bearing entities, only here.
QUESTIONS/AI
- [DOCTRINE] R5 L42 — "A machine never confirms, corrects or disputes; an assistant's re-check of a source reaches a member as a run's output, labelled machine work, and enters here only by the member's own act"
- [DESIGN] R1 L18 MACHINE_CANNOT_CONFIRM first refusal.
DOCTRINE
- [DOCTRINE] R8 L43 no place named in behaviour/outward text; tests use test profile (layers.md rule 3).
- [DOCTRINE] R5 append-only, declared to purge (K23).

## standards.txt (87 lines, read 1–87)
LAW
- [DESIGN] Purpose L15 — "A standard is what a government act is measured against: a statute, regulation, ordinance, court decision or order, adopted policy, or public commitment" — held as content in record, citation, kind, issuer, source (profile standard_sources or undetermined), period in force; "It judges nothing about a government act ... and nothing about the merit of a standard".
- [DESIGN] L19 period {from,to} YYYY-MM-DD or null; "null is 'not stated in the record', never 'always'".
- [DESIGN] R1 L22 standardDeclare refusals: MACHINE_CANNOT_DECLARE_STANDARD (K251), STANDARD_NO_CITE (>200 chars), STANDARD_KIND_UNKNOWN (statute, regulation, ordinance, court, policy, commitment = jurisdictions R23 set), STANDARD_NO_ISSUER, STANDARD_NO_REASON (C-112.20, DEC-88, K1025; ≤2000 chars), STANDARD_NO_TEXT, STANDARD_TEXT_UNRESOLVED, STANDARD_PERIOD_INVALID, STANDARD_SUPERSEDES_UNKNOWN.
- [DESIGN] R2 L23 text = content ids — "A standard is never held without a capture of its text".
- [DESIGN] R3 L24 citation matched against `cite` pattern of standard_sources entries in active profiles' combined view; level from source (jurisdictions R23, R31) else undetermined (K108(5), K171); no match → source undetermined but still held (K102) — "the profile describes local sources and does not decide what law a group may hold its government to"; declared kind/issuer differing from match "kept as declared and the difference is stated beside it, never corrected".
- [DESIGN] R5 L28 standardRead answers content standings and content.passageNotice "so a changed statute text is seen and nothing is moved".
- [DESIGN] R6 L29 supersedes (amendment, renumbering, later decision), at most one successor (STANDARD_ALREADY_SUPERSEDED). Versioning by supersession chain only.
- [DESIGN] R7 L30 inForce(id,date) → in_force | not_in_force | undetermined — "`not_in_force` only when a stated bound excludes the date; `undetermined` when a bound needed to decide is null; never a default."
- [DESIGN] R8 L31 standardsIn filters at/kind/source/cite; 200/page; with `at` lists R7 answer; not_in_force left out.
- [DESIGN] R9–R10 L37–38 standardPropose (Legal/Policy Lookup skill or member), stored apart, proposalLabel; standardAdopt by member with own reason (DEC-88, K1025) — "the proposal's `why` (R9) is the proposer's and does not serve as it".
- [DESIGN] R15 L60 standard is a record object STD- promoted, history/audit/export.
- [DESIGN] Suggestions L74 — "A standard is instance-wide, not a project's: public law is shared by every project".
- [DESIGN] Suggestions L75 docprofile code_section/instrument references can seed a proposal; "the reader that does so belongs to whoever runs it (an AI run), not here."
- [DESIGN] Status L4–6: D-149 governing laws of an action (LAW_LEVELS, governingLawsOf, actionLaws, actionLawsPropose in store.mjs) are "the laws the group's own request is made under, not the standard a government act is measured against: they stay `actions`'"; docprofile regulation.mjs/staff-report.mjs emit code_section and instrument refs; id-spaces normalises enactment numbers; jurisdictions R23 standard_sources built T2.
- [GAP] Status L7 R1 and R10 DEC-88 reason "not yet met (T22)" (verify).
- [GAP] (implied) no structure inside a standard: no sections/definitions/cross-references/hierarchy beyond kind + level; versions only via supersession; no amendment-in-part; one successor only.
- [RULING] K102 (approval; State Rules §4 gains standard, determination, consequence types), K171, K108(5), K251, K369, N309/K231/K275 (noSuchStandard R17), K1025 DEC-88, K267, K380.
TIME
- [DESIGN] R7 inForce as-of reasoning with undetermined; R8 `at`.
- [DESIGN] R4 "this module's clock" for declaration time.
COURTS
- [DESIGN] kind `court` ("court decision or order") is a standard kind (L15, L22); R6 supersedes "a later decision".
QUESTIONS/AI
- [DESIGN] R9 Legal/Policy Lookup skill proposes; never a standard.
- [DOCTRINE] R11 L56 "Nothing a machine writes is a standard".
DOCTRINE
- [DOCTRINE] R12 L57 no judgment of merit (Op Principle 1); R13 L58 undetermined never default (jurisdictions R27), no place named.
- [DOCTRINE] Satisfies L64–69: Functional Architecture Layer 2 Function 1; Roadmap §5 OP 1, 2, §9 Skill 4; Intake Doctrine; Interaction Constructs UNDETERMINED.

## conformance.txt (126 lines, read 1–126)
LAW
- [DESIGN] Purpose L15 — determination = "the group's recorded judgment that a named government act is compliant, noncompliant or unclear against named standards, resting on published findings"; machine prepares comparison, never determines; compliant recorded with same care; unclear sends questions back to inquiry; no ranking of significance (Function 4; Bob's ruling 1, K12).
- [DESIGN] Terms L19 act = {id?, description, actor:{role, body}, at|period, evidence}; ACT- id minted on first determination, no bundle; "The same act" is equality of that id (K171). comparison row {standard, requires, did, reading: aligns|diverges|open}.
- [DESIGN] R1 L22 refusal chain incl. NO_FINDINGS, FINDING_NOT_PUBLISHED, NO_STANDARDS, NO_SUCH_STANDARD, STANDARD_NOT_IN_FORCE, ROWS_INCOMPLETE, UNCLEAR_NO_QUESTION, SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT.
- [DESIGN] R3 L24 each standard read via standards.inForce at act's date (or each end of period): not_in_force refused; undetermined accepted and stated.
- [DESIGN] R4 L25 — "The outcome is given **per standard**, from the member, and is never composed across standards into one verdict." disagreement with rows stated, never corrected.
- [DESIGN] R10 L33 basis_changed flag (finding reopened/superseded/later edition, standard superseded, newer capture lacking passage) — notice only (OP 4).
- [DESIGN] R12 L37 comparisonPropose (Government Compliance Analysis skill), stored apart, proposalLabel, never an outcome (PROPOSAL_CANNOT_DETERMINE); may name contradiction inquiry (inquiry R48).
- [DESIGN] R21 L47 comparisonFacts from contradiction: requires from member-named side (a|b, never defaulted), did from other; content.passageText.
- [DESIGN] R22 L48–54 cause {statement, evidence} member-authored; CAUSE_NOT_EVIDENCED; RECOMMENDATION_IS_AN_ACTION — "A determination records what was required, what was done, and why, and never what should be done."
- [DESIGN] Suggestions L115 five elements (Criteria, Condition, Cause, Effect, Recommendation; DEC-77 item 2) "are composed by the surface, never by a module".
- [DESIGN] Status L5–6: "Published" = membership of published case edition; action today rests on any INFO-/INQ-/PROB-/FOCUS- bundle (action_basis), "not on a determination. That is `actions`' to change".
- [RULING] K102 L103 — "a determination comes after publication, resting on published findings (R2), the comparison before publication being inquiry work and `comparisonPropose` (R12)". K12, K171, K275, K249 (caps), K264, K730, K766, K903(4), DEC-36, DEC-44, DEC-72, DEC-76 item 3, DEC-77 item 2, DEC-84 items 3, 10, N345.
- [DOCTRINE] R14 L88 — "Every determination rests on at least one published finding and at least one standard held in the record (layer 9's contract)."
- [GAP] (implied by structure) conformance only post-publication; pre-publication comparison is proposal-only (R12) — no member-recorded interim compliance view during inquiry.
ORGANISATIONS
- [DESIGN] Terms L19 actor named "by official role and body, never by a person"; Decided L125 "The act's actor is an office, not a person (R1)".
- [DESIGN] Suggestions L109 — "The act's `actor` should be offered from the profile's `counterparties` (jurisdictions R24) but not limited to it." — actor is a free {role, body} pair, no organisation entity.
- [DESIGN] R1 DETERMINATION_NOT_A_PARTICIPANT membership.projectAuthority joined; Decided L124 determination is the publishing project's.
TIME
- [DESIGN] Terms act `at | period`; R3 inForce at act date or each end of period; R7 supersession with reason (CONFORMANCE_NO_REASON, ≤500 chars).
COURTS
- none specific (standard kind `court` reachable through standards; contradiction inquiry as source of determinations DEC-76 item 3).
ANALYSIS
- [DESIGN] R9 L32 each finding's frozen strength pair beside live pair, per axis never composed (DEC-44); outcomes_differ quiet mark (DEC-84 item 3).
- [DOCTRINE] R8 L29 — "No input or answer carries a significance, severity, priority, urgency, rank or score".
- [DESIGN] R18 L38 caps: 50 findings, 50 standards, 200 rows, 20 questions, 50 evidence ids (K249).
QUESTIONS/AI
- [DOCTRINE] R13 L87 — "Only a member determines; nothing a machine writes is a determination or an outcome."
- [DESIGN] Satisfies L97 Functional Arch "The eighth skill" (present for human evaluation, not as a determination); Roadmap §9 Skill 6; Design Req §12 tools advisory.
DOCTRINE
- [DOCTRINE] R24 L92 withheld whole (no id, title, state, placeholder or count), out_of_view: true (K903(4), DEC-36).
- [DOCTRINE] R16 no place named; append-only purge K23.
- [DOCTRINE] R6 L27 unclear opens inquiry atomically — "Unclear … triggers a return to Layer 1".

## consequences.txt (91 lines, read 1–91)
ANALYSIS
- [DESIGN] Purpose L14 — "What a breach did, and to whom: ... who or what is affected (a class of people, a fund, a program, a service), the measure (money, benefits, services, time, counts) and the period. Computed from the record where the record holds the figures, each with its basis and grade; otherwise undetermined".
- [DESIGN] Terms L18 affected kinds class/fund/program/service/body/other; measure {unit money|benefits|services|time|count, currency?, value|range}; part states computed/assessed/undetermined.
- [DESIGN] R2 L22 computed = {op: sum|difference|count|product|ratio, operands: content ids whose passage holds figure, with figure as read}; "The value is the module's own arithmetic over the operands, never the author's"; each operand carries captureGrade; part grade = weakest (DEC-21); machine may record computed part labelled machine work (K102).
- [DESIGN] R3 L23 assessed = member value/range + rationale ≤2000 chars; MACHINE_CANNOT_ASSESS; never summed or graded as computed.
- [DESIGN] R4 L24 undetermined with why — "An undetermined part is never read as zero."
- [DESIGN] R7 L29 totals summed only within one state, unit, currency; nothing across.
- [DESIGN] R8 L30 basis_changed when operand content newer capture lacks passage; nothing recomputed.
- [DOCTRINE] R11 L53 no composition of computed/assessed/undetermined into one figure; no significance/severity/priority/score (K12).
- [GAP] Status L5 — "Money in the record today is only a correspondence fee quote ... The record holds no amounts or fund figures as values (`EXTRACTION-BREADTH-DESIGN.md` §2 rows 5–6: no budget or financial-report reader ...). So R3's computed figures read the numbers in cited content, and until such readers exist most consequences will be assessed or undetermined."
- [DESIGN] Suggestions L77 — "a spreadsheet cell or table extent (`content`'s `sheet-range` and `doc-table` arms) is the natural operand. A parser of figures is this module's; a budget or financial-report reader, when written, belongs to `extraction`/`docprofile`, not here."
- [GAP] (implied) ops limited to five; no filters/aggregates over datasets, no trends, budget-vs-actual, no dataset construct; arithmetic only after a noncompliant determination.
TIME
- [DESIGN] part has period (PERIOD_INVALID); unit `time` as a measure.
- [DESIGN] Satisfies L67 Roadmap §5 OP 6 note "partial compliance does not stop the clock", §10 exit condition.
ORGANISATIONS
- [DESIGN] Terms L18 role {role, body} for office as affected; kind `body`.
- [DOCTRINE] R10 L52 — "People are counted as a class or named in their official role, never singled out: no part names an individual".
LAW
- [DESIGN] R1 L21 part recorded against one standard's noncompliant outcome (CONSEQUENCE_NOT_NONCOMPLIANT).
- [DESIGN] Satisfies L68 Functional Arch Layer 3 Function 5 "compliance restored AND consequences addressed".
COURTS: none in consequences.txt.
QUESTIONS/AI
- [DESIGN] Suggestions L78 — "An AI run may prepare computed parts (R2) and propose assessments as text for a member; it never records `assessed` or `addressed`."
- [DESIGN] R9 MACHINE_CANNOT_ADDRESS.
DOCTRINE
- [DOCTRINE] R5/R12 L25, L54 causation: "No harm is assumed from the act"; unproven lands, not refused, never low grade (DEC-14); zero measure not_applicable (K283, N257).
- [DESIGN] R9 L33 addressed overall only when every live part addressed; no live part = undetermined "no consequence recorded" (K172); partial redress doesn't end escalation.
- [RULING] K12 (R2–R4, Bob's ruling of 2026-09-26), K102, K171, K172, K283, K275, K380, K903(4), DEC-14, DEC-21, DEC-36, DEC-44.
- [DESIGN] Decided L89 DEC-14 consequence on action stays actions'; "The two are never read as one".

## action-grammar.txt (73 lines, read 1–73)
(module context) Status L3–5: split from actions (K617, K653 BOB-2) for size (actions 3,846 lines after T18); pure; "Every id met by ACTION-GRAMMAR #1 (T19 layer 9, K835)"; N518 (DEC-113; K1251, K1252) R9 rows C-117.23–.25 "not yet met (T27)". Size ~1,600 lines (L7).
LAW
- [DESIGN] R2 L21 vocabularies: ACTION_KINDS, PRODUCT_KINDS (records_request, request_for_comment, other), ACTION_BASIS_KINDS (rests_on, advances), CORRESPONDENCE_DIRECTIONS (sent, received, no_response), RESOLUTIONS (complied, denied, escalated, withdrawn, completed), CORRESPONDENCE_STAGES/OUTCOMES, DECISION_STAGES, LIFECYCLE_KEYS, QUOTE_KEYS; lawProposalLabel = proposalLabel(..., "governing_laws"); "`LAW_LEVELS` is re-exported from `jurisdictions` (its R31), never a copy."
- [DESIGN] R3 L24 records_request carries `law` citation ≤200 chars (RECORDS_LAW_MAX), "stated or absent (absent reads undetermined)"; law on other kinds refused RECORDS_LAW_REFUSED (C-73.6).
- [DESIGN] R8 L40 governingLawsOf, GOVERNING_LAWS_MAX, CITATION_MAX, LAW_PROPOSAL_WHY_MAX, DUE_UNDETERMINED_SAYS — "`governingLawsOf`'s undetermined sentence names no law".
- [GAP] (implied) a law here is a citation string with a level, not a link to a `standards` STD- record: two parallel law constructs (governing laws of an action vs standards).
TIME
- [DESIGN] R5 L30 lifecycle place keys `due_by`, `due_cite`; DUE_HALF_STATED (C-94.8), DUE_NOT_A_DATE (C-94.9); DUE_CITE_NOT_GOVERNING (C-94.10) is actions' — "No due date is computed."
- [DESIGN] R6 L33 request_for_comment must carry ≥1 clock[] entry with basis; RFC_RESPONSE_WINDOW_PRECEDENT {min_days 7, max_days 30, source GAO agency-comment protocol, enforced: false} — "exported by this module as a citation a surface may show, never compared against a date"; non-response recorded with date.
- [DESIGN] R7 L37 checkActionExtension reports C-11.1 "a pending clock entry past its date"; ctx.nowMs time else the clock.
- [DESIGN] R8 clockMovesNotMechanical; Satisfies L60 State Rules §4.4 (the Action object, its lifecycle and clock); D-147 records-request lifecycle.
ORGANISATIONS
- [DESIGN] R8 L40 counterpartyOffice, counterpartyName, addresseeIsOffice, counterpartyFindings, ADDRESSEE_KINDS; R7 "a missing counterparty block" is a finding.
QUESTIONS/AI
- [DESIGN] R2 lawProposalLabel (machine-proposed governing laws labelled).
DOCTRINE
- [DOCTRINE] R10 L55 pure; R11 L56 no place named; test profile.
- [DESIGN] Satisfies L61 Action v0.1 §3, §4 rules 2, 5, 6, 7, 12, 13; D-182 risk tier, REC-214, D-148 fee quote, D-149 governing laws, REC-195, D-147; DEC-13, DEC-14, DEC-24, DEC-49.
COURTS: none in action-grammar.txt.
ANALYSIS
- [DESIGN] R4 L27 quote grammar: quote_amount numeric, currency; "A waiver is a revision to zero" (only money values in record — fee quotes).

## actions.txt (172 lines, read 1–172)
(module context) Status L3–7: moved from layer 6 to layer 9; split K617 (clock reads → action-clocks), K653 BOB-2 (→ action-grammar); DEC-108 litigation hold R55 not yet met (T22 layer 9); N518/DEC-113 R52 reworded, R56–R60 new "Not yet met (T27)"; "not yet met: R7's `completed`, R8's override, R9's arms, R45–R49" at K608/K611 fold (verify). Size ~3,800 (L9).
TIME
- [DESIGN] Purpose L15 — "clock (every deadline with the statute, order or commitment it comes from)"; Terms L19 clock[] {text, description, date, basis, status} status pending|met|overdue|waived.
- [DESIGN] R7 L31 clock entry needs {text, description} shape, YYYY-MM-DD date, basis, status; "a pending entry past its date, still land and are reported by the audit".
- [DESIGN] R12 L40 actionFacts clock_next earliest pending date; "`clock_overdue` is true exactly when `clock_next` is before the UTC calendar day of `nowMs` (a deadline is met by anything on its day)" — UTC-day overdue, not jurisdiction time zone.
- [DESIGN] R14 L44 actionMove "never touches the clock: overdue is derived on read (R25)".
- [DESIGN] R25 L65 clock_next/clock_overdue derived at nowMs beside cached flag; as_of; requestLifecycleOf: each entry's follows, elapsed days, stated due date's status open|followed_by_due|followed_after_due|passed_unanswered with days past, else undetermined — lateness patterns per request.
- [DESIGN] R15 L47 DUE_CITE_NOT_GOVERNING (C-94.10) "for a `due_cite` not on the governing laws as they stand at the act".
- [DOCTRINE] R33 L134 machine never adds/removes/re-dates clock entry; only mechanical deadline-recheck moves pending→overdue (C-20.1, I-11; CLOCK_STATUS_NOT_MECHANICAL).
- [DESIGN] Satisfies L148 — "D-147 (no due date computed into the record) is read with K102: the instance proposes a clock entry from the profile, stored apart, and only a member's revision writes one".
- [DESIGN] R34 L135 non-response recorded with its date (DEC-13). R11 leg extent_capture "version undetermined" never back-filled (time-pinning of evidence).
- [DESIGN] R54 L114 holdsDue — "The action's state is not asked: a legal matter outlives the action."
ORGANISATIONS
- [DESIGN] R9 L34 counterparty = addressee: {state named, kind? office, role, body, level?, entity_id?} (jurisdictions R24); {named, kind press|organisation|group, role, organisation}; {audience, description ≤500}; {undetermined, basis}. "Never a private individual." entity_id must be ENT-YYYY-NNNN not naming a person; breach action addresses an office else ADDRESSEE_NOT_AN_OFFICE. Old {named, name} read as office's name.
- [DESIGN] R9 matching name "role, body" for office; R27 actionQuotes by counterparty "the name matches exactly" — string matching, no organisation identity.
- [DESIGN] R10 L36 kinds from profile action_kinds; "No kind, law, office or deadline is written in this module's code."
- [DESIGN] Uses L123 jurisdictions combine: action_kinds, counterparties, records_laws.
- [DESIGN] R45 L85 contact (member id), grants nothing (D5, K590). R46 plan/option link (K590).
- [GAP] (implied) counterparty is per-action {role, body} text with optional entity_id; no obligations/reporting-line model; body/role not resolved to an entity registry beyond entity_id format.
LAW
- [DESIGN] R18 L52 actionLaws: ≤12 laws (TOO_MANY_LAWS), each {level, citation}, BAD_LAW_LEVEL with LAW_LEVELS; BAD_CITATION ≤200; member only (MACHINE_CANNOT_SET_LAWS C-32.18); "No act clears the list."
- [DESIGN] R19 L53 actionLawsPropose; any credential; label machine_proposed|member_proposed|unstated; evidence:false.
- [DESIGN] R25 governing_laws stated with who/when or undetermined "with a sentence that assumes no law".
- [DESIGN] R41 L79 old kind cpra_request reads as written; "No outward text of this module names a law: a law's name comes only from what members and the profile state."
- [DESIGN] Suggestions L157 law levels federal/state/county/city (jurisdictions R31, K102, K108, N61) replace D-149's federal/state/local.
- [DESIGN] R8 L32 breach:true action rests on live conformance determination (ACTION_NO_DETERMINATION) unless premise_override {reason ≤500} by a member; override disclosed on everything prepared (filings R24); never attached to escalation (escalation R23).
- [DESIGN] R5 L29 MACHINE_CANNOT_STATE_RECORDS_LAW (C-32.20).
COURTS
- [DESIGN] R48 L89 pressure marks on received entries {kind legal|retaliation|discrediting|other, note} (K597(1); OP 8, Design Requirement 13) — "It is evidence like any capture and may be cited by an inquiry. A `legal` mark may carry a litigation hold (R52)."
- [DESIGN] R52 L94 litigation hold in_place via actionHold on legal-marked entry, covers projects; "no material of a project it covers ... is purged from the real record (R60, control-plane R46)" (DEC-61, DEC-113, K899(7), K1252).
- [DESIGN] R56–R60 L97–113 release, preview, projectHolds, holdsReleased, purgeHeld (DEC-113).
- [GAP] L7 "The device half (the transcript store's check for a hold) waits for a device-storage module (K1251)."
- [GAP] (implied) litigation is represented only as a pressure mark + hold on correspondence; no case/docket/party model of the group's own litigation in actions.
ANALYSIS
- [DESIGN] R27 L68 actionQuotes ≤500, amount as quoted, parsed value, currency; empty answer says which level empty (no_request, no_reply, no_quote, no_quote_by_name); "No field compares one quote to another."
- [DESIGN] R49 L91 — "No action is refused for the capture grade of what it rests on ... The grades are shown where the group prepares what it sends (`filings` R25)." (K597(3), K600(b): venue sets the standard)
- [DESIGN] R26 L67 action's own outcome (DEC-14): impact established or unproven, never low grade.
QUESTIONS/AI
- [DOCTRINE] Purpose L15 — "A member decides every move; a machine prepares and never advances, testifies, sets a tier or states a law."
- [DESIGN] R28 L71 actionRiskPropose, ≤12 proposals.
- [DESIGN] R12 actionFacts projected by retrieval (K75(2)) — action facts available to search/assistant via retrieval projection.
- [DESIGN] R27 empty answer states the level of absence (four-level-search style).
DOCTRINE
- [DOCTRINE] R9 "Never a private individual." (Actions R9 exact text; brief cites).
- [DOCTRINE] R39 L140 no place named. R36 invisible = absent.
- [DESIGN] Satisfies L145 Action v0.1 §3, §4 rules 2, 5, 6, 7, 12, 13, §5 rows 1, 4–8, 16; Design Req §7, §8; Functional Arch Layer 3 Functions 3–5; Roadmap §5 OP 3, 6, §8; Content Framework §18.1 (D-579); DEC-13, DEC-14, DEC-24, DEC-49.
- [RULING] K102, K253, K370, K611, K608, K617, K653, K590, K597, K600, K711, K899(7), K1019, K1023, K1025, K1134(3), K1251, K1252, K1253, K262, K275, K368, K351, K88(3), K61, K64, K75(2).

## action-clocks.txt (87 lines, read 1–87)
(module context) Status L3–5: split from actions K617; "Not yet met: R3–R6, R8 (new, K608, K614, K624 (3)) and R9"; R10, R11 (K921/K922/K925) "not yet met"; R12 factReader (K998, D6, K1038) "not yet met (T22 layer 9)" (verify current marks). Size ~500–700 (L7).
TIME
- [DESIGN] Purpose L13 — "The deadlines on the group's actions, read across actions: which clock entries are pending and which have passed, the entries a profile's deadline would give (counted in calendar days, or business days on the profile's holiday calendar, saying whether a member has confirmed that calendar), and the reminders a member asks for".
- [DESIGN] Terms L17 — "A **day** is a `YYYY-MM-DD` UTC calendar day; an entry is past on a day after its date (a deadline is met by anything on its day, `actions` R12)." — UTC-only day; profile time_zone (local-facts) not applied to past/overdue.
- [DESIGN] R1 L20 pendingClocks({before}) for monitoring; ≤500/page; cursor.
- [DESIGN] R2 L24 clockPropose from profile deadline rule (jurisdictions R26) for action's kind: start from the event the rule names in the ledger; days/count calendar or business by holiday calendar (jurisdictions R33); "undetermined with why when the calendar does not cover the period; a start the ledger does not hold is `undetermined` with why"; basis = rule's citation + profile basis; stored apart, never written to clock[]; NO_SUCH_RULE.
- [DESIGN] R3 L28 overdueClocks for queue-producers R15: overdue or pending before UTC day of instance clock; project = first determination among rests_on legs (null if none); creator.
- [DESIGN] R4–R6 L31–35 reminders (DEC-94; K613(1), K614, K615, K624(3)): member-set rows, never document fields; ≤50 per action; set from defaults when dated option chosen (action-plans R29; DEC-77 nothing preselected unseen); remindersDue for queue-producers R18; reminderAnswer with optional later day (DEC-10).
- [DESIGN] R10 L38 business count states each holiday year's local-facts status: "counted on an unconfirmed calendar (<source>, <date>)"; corrected names member; disputed/absent → undetermined; office-specific holidays (jurisdictions R43) for action addressed/filed at office.
- [DESIGN] R11 L39 calendarFactsRead: holiday years from UTC year of instance clock to year of latest pending entry (at least next year) + offices' hours (K1000).
- [DESIGN] R12 L42 factReader for filings R30 (computeDeadline's factOf shape); absent with why; null → calendar `not_read` (K998, D6, K1038).
- [DOCTRINE] R7 L60 — "Every deadline carries the statute, order or commitment it comes from; no date is computed into the record; overdue is derived at read time" (Functional Arch L3 F5; OP 3).
- [DOCTRINE] R8 L61 — "Nothing reminds that no member asked for (DEC-69)"; nearing deadline changes display only (DEC-94(2)); no outside channel (email, push) (DEC-94(3)).
- [GAP] (implied) deadlines only on actions (layer 9): no clocks for inquiries, public-body obligations (government's own deadlines), meeting notice rules, limitation windows; deadline rules only from profile `deadlines` keyed to action kinds; office hours read (R11) but no hour-of-day/time-zone cutoff logic stated.
- [DESIGN] Size L7 computeDeadline in actions/index.mjs :2056–2088 moves here.
ORGANISATIONS
- [DESIGN] R10 office-specific holiday entries for "an action addressed to, or filed at, an office".
- [DESIGN] R3 action's project derived from first determination leg.
LAW
- [DESIGN] R2 basis = profile deadline rule's citation (jurisdictions R26) — deadline law lives in profile data, not standards module.
QUESTIONS/AI
- [DOCTRINE] Purpose L13 — "A member states every entry and every reminder; a machine proposes an entry and nothing else."
- [DESIGN] R2 proposals labelled (lawProposalLabel from action-grammar).
COURTS: none in action-clocks.txt (deadline rule may cite an order — "statute, order or commitment").
ANALYSIS: none in action-clocks.txt (counts of days only).
DOCTRINE
- [DESIGN] Satisfies L66–70 State Rules §4.4 (I-11); Action §4 rule 5; Design Req §7 as amended 2026-09-26; Functional Arch L3 F5; Roadmap §5 OP 3; D-147 with K102; DEC-10, DEC-69, DEC-70, DEC-77, DEC-94.
- [DOCTRINE] R9 no place named; invisible = absent.

## filing-templates.txt (104 lines, read 1–104)
(module context) Status L3–4: APPROVED K921 (design, ten answers), K924 governs; K922(1) FILING_BLANKS/FILING_TEXT_MAX move here; "Every id is not yet met: T21"; N476 R20 project "not yet met (T22 layer 9)" (K1038) (verify). Size 1,100–1,500 (L6).
LAW
- [DESIGN] Purpose L12 — "The group's governed library of filing templates: wording, with named blanks, that a group may file in its own name (Tier 1 and 2 kinds) or send to counsel as the basis of a briefing (any tier)" — versioned, never edited; reviews by members or professionals through revocable grant; approval by member not sole author; "A machine proposes wording and nothing else. The profile's templates are read here as approved versions".
- [DESIGN] Terms L16 tier of kind is profile's (jurisdictions R25), strictest across profiles; undetermined when none states one.
- [DESIGN] R1 L20 TEMPLATE_TIER3_FILE (C-115.36): file template refused for Tier 3 kind; brief may serve any tier.
- [DESIGN] R10 L46 reviews per tier: Tier 1 one member review; Tier 2, Tier 3 brief or undetermined tier → one professional review or approver's reason for going without; APPROVER_IS_AUTHOR.
- [DESIGN] R9 L42 professional credential "shown as stated and never verified".
- [DESIGN] R15 L58 profile templates (jurisdictions R40) origin profile, read-only.
- [DOCTRINE] R18 L86 — "No place, law, venue or template wording is in this module's behaviour or outward text".
- [DESIGN] Satisfies L93 Action §4 rule 7 "nothing leaves by a system path; a counsel briefing is never fileable as it stands", rule 11 "templates come from data and the group's own record, never from code"; Design Req §8 as amended 2026-09-26 (Tier 1/2 templates; Tier 3 to counsel), §12; Functional Arch L3 F3.
COURTS
- [DESIGN] Purpose/R1: template `use: file` vs `brief` for counsel — Tier 3 (legal exposure, e.g. litigation) goes to counsel; group never files Tier 3 itself.
ORGANISATIONS
- [DESIGN] R8 L39 professional review grant: recipient + organisation 1–200 chars each, revocable, secret SHA (TRG-); professionals as non-members.
- [DESIGN] R10 approver = project owner (membership R65); widen to group needs administrator (R64).
TIME
- [DESIGN] versions with dates, updated chain (K924), revisions kept with time (R4, R12).
QUESTIONS/AI
- [DOCTRINE] R22 L87 — "A machine writes only a proposal (R6) and a labelled comment (R13): it never drafts, revises, submits, grants, reviews, approves, widens, retires or withdraws (Design Requirement 12; DEC-24)."
- [DESIGN] R5 L30 contributors include adopted proposal's run (run, model, skill pack version, proposal id); R6 templatePropose TPP- labelled proposalLabel(..., "template"), why 1–1,000.
- [DESIGN] R9 "a machine's critique is a comment, R13, never a review".
ANALYSIS: none in filing-templates.txt.
DOCTRINE
- [DESIGN] R19 L61 FILING_BLANKS frozen closed set, FILING_TEXT_MAX 65,536 bytes.
- [DOCTRINE] R16 names held by value; R17 nothing deleted (K23); R24 invisible = absent, no count.
- [RULING] K903(6), K921, K922(1), K924, K933 (C-125 family), K1038.
- [DESIGN] Suggestions L101 migration of filings' saved templates as drafts; quote "the submission of a template is gated by the defined process" (Bob).

## filings.txt (135 lines, read 1–135)
(module context) Status L3–6: APPROVED K102; K13 is R8–R12 (Design Req 8 as amended); N331 R3 met T14 (FILINGS #4, K471); K608 R22–R25 added "not yet met", R26 (retired); K921/K922/K924 fold R28–R32 "not yet met"; DEC-88 R8 PACKET_NO_REASON "not yet met (T22)"; N474 R30 factReader "not yet met (T22 layer 9)" (verify). Size 900–1,300 (L8).
COURTS
- [DESIGN] Purpose L14 counsel packet (briefing) — "the facts with their citations, a chronology, exhibits with provenance, the standards' text, candidate legal theories and remedies, and any deadline that binds a claim, marked as prepared for counsel's review, never published, never in a form that can be filed as it stands. At Tier 3 counsel drafts and files."
- [DESIGN] R9 L38–39 six sections: facts, chronology, exhibits (SHA, locator, capture time, attestations via attestation.attestationsOf), standards (citation, kind, issuer, text, in-force at act date), candidate theories and remedies (labelled candidates, "never stated as a conclusion"), deadlines ("every profile deadline that applies to `claim`, `jurisdictions` R26, with its period, count, start event and citation; its date computed only from a recorded start event ... else `undetermined` with why"); consequences included states apart.
- [DESIGN] R10 L40 marking "Prepared for review by <counsel's name, organisation>. Not legal advice. Not for filing."; no caption, court or venue heading, signature block, prayer or form of relief; fileable false.
- [DESIGN] R11 L41 packet never published; counselPacketExport by member only (K316).
- [DESIGN] R14 L48 theoryPropose: candidate theory + remedy against named standards, labelled; "included in the next packet version (R9) as a candidate, never as the group's position".
- [DESIGN] R15 L51 evidence package available-actions block: kinds available against counterparty's offices with tier; Tier 3: standards theories rest on, factual basis, "such an action requires competent counsel", profile's legal organisations (jurisdictions R32).
- [DESIGN] Decided L134 — "counsel is not a member of the instance and reads only what a member exports (R11)".
- [GAP] (implied) no representation of a court case/docket/filing in a court/opposing party/order; venue is profile data (venue.name, venue.how); group's own litigation is counsel's, outside the system; limitation windows only as profile `claim` deadlines (jurisdictions R26).
TIME
- [DESIGN] R9 chronology L38 — "every dated event from the act, the findings' publication, the action's state history, correspondence and clock, in date order, same-day ties by source id" — the system's only stated chronology construct.
- [DESIGN] R9 deadlines computed calendar or business on profile's holiday calendar (jurisdictions R33), "including a count reaching into a year the calendar does not list" → undetermined (K108(5), N72).
- [DESIGN] R30 L68 deadlines and proposed clock entries state calendar's status via action-clocks.factReader (K998, D6, K1038).
- [DESIGN] R7 L33 filingRecordSent proposes clock entries for kind's deadlines that start at filing or receipt; writes no clock entry.
- [DESIGN] Decided L135 packet deadline dates follow action-clocks R2 (recorded start events only).
LAW
- [DESIGN] Terms L19 governing tier = stricter of kind's profile tier (jurisdictions R25) and action risk tier; undetermined refused, never read as 1 (D-182) R2 L23.
- [DESIGN] R3 L24 blanks filled from addressee, determination (act, date, standards' citations, finding editions), governing laws and `law`, clock entries with bases, venue, producing group (promotion R40), preparation date; "A value is never invented, defaulted or taken from the preparer"; [UNFILLED: <name>] with why.
- [DESIGN] R4 L26 Tier 2 advisory note from profile (Design Req 8); Suggestions L123 advisory absent → undetermined, STILL_UNFILLED.
- [DESIGN] R17 L96 Tier 3 never yields file template or fileable document (jurisdictions R28 TEMPLATE_TIER3; K921).
- [DESIGN] R29 L67 template not written for the action's jurisdiction stated first (jurisdictions R13 profile tag).
- [DESIGN] R20 L99 "No place, law, venue, template or legal organisation is named in this module's behaviour or outward text".
ORGANISATIONS
- [DESIGN] R3 addressee arms: office role+body; reporter/organisation/group role+organisation; audience description.
- [DESIGN] R8 L36 counsel named by member: name + organisation (NO_COUNSEL); MACHINE_CANNOT_NAME_COUNSEL.
- [DESIGN] R15 kinds "against its counterparty's offices from the profile"; legal organisations from profile (jurisdictions R32).
- [DESIGN] R3 producingGroup fact (promotion R40, N331).
ANALYSIS
- [DESIGN] R25 L61 no refusal for capture grade; exhibits show capture grade and co-attestation; venue's evidence standard (jurisdictions R39 `evidence`, `accepts`, `contestable`) shown beside, flag below; else undetermined (K597(3), K600(b)).
- [DESIGN] R9 consequences included "as recorded, states kept apart".
QUESTIONS/AI
- [DESIGN] Purpose L14 — "The AI prepares; a member approves and files, and records that it was sent."
- [DESIGN] R5 L27 any credential prepares; draft labelled proposalLabel(preparer, "filing_draft"), evidence:false; R23 communicationPrepare (D2, K590): machine may draft "from the published case and the plan; no template is read".
- [DOCTRINE] R16 L95 — "Nothing a machine writes approves, sends, names counsel or exports; a machine prepares drafts, packets' candidate theories and proposals only, each labelled (Design Requirement 12; DEC-24)."
- [DOCTRINE] R7 L33 "The instance transmits nothing: a member files by the venue's means (K102)." Suggestions L122 sending by instance not in this version; Bob's to add.
DOCTRINE
- [DOCTRINE] R18 L97 — "Every filled value, packet item and chronology event names the record source it was read from; nothing is invented or defaulted, and an undetermined fact is stated as undetermined."
- [DESIGN] R22 L57 inbandQuartet on approved bytes (Publication §3 rule 9). R24 L60 "Rests on an unestablished premise:" disclosure (K600(a)).
- [DOCTRINE] R27 L100 withheld whole (K903(4), DEC-36).
- [DESIGN] Satisfies L109–114 Action §3, §4 rules 2, 7, 12, 13; Design Req §8 as amended, §12; Functional Arch L3 F3, F4; Roadmap §8, §9 Skill 8; Publication §8; K13.
- [RULING] K102, K13, K171, K254, K275, K316, K444, K471, K590, K597, K600, K608, K617, K651, K903(4), K906, K921, K922, K924, K998, K1025, K1038, D-182, DEC-36, DEC-88.

## escalation.txt (130 lines, read 1–130)
(module context) Status L3–6: APPROVED K102; K14 (stage 7) is R11–R12; K172 CONSEQUENCES_UNDETERMINED; K608 R16, R22, R23 met T18 (K708); K933 N462 "not yet met (T21 layer 9)"; DEC-89 (K1019) R1, R27–R29 "not yet met (T22 layer 9)"; DEC-88 R9 "not yet met (T22)"; R25 escalationreasondraft arm met T23 (K1025, N485) (verify). Size 800–1,200 (L8).
TIME
- [DESIGN] R2 L24 trigger derivation at nowMs; "That instant is the latest of the dates of the ids that meet the trigger (a `sent` entry's `at`; for a clock, the day after its date), never the read time, so the age is a fact of the record (K171)."
- [DESIGN] R6 L30 stage 3 clock: member-stated clock entry; trigger to 4 when received/no_response after sent, or earliest pending entry past (actions R12 at nowMs); "A stage-3 action with no clock entry never triggers by time, and the read says so."
- [DESIGN] R16 L58 escalationsDue with trigger's instant and age, oldest first, ≤500 (monitoring; queue-producers R17).
- [DESIGN] R29 L54 reason draft includes "every date passed without a response at `nowMs`".
- [DESIGN] R15 L45 suspend: clocks keep running in actions.
- [DESIGN] Satisfies L108 Design Req 7 "is designed to be mechanical: when trigger conditions are met, the next stage activates" amended: proposed with age, member advances/declines (K102).
ORGANISATIONS
- [DESIGN] R4 L28 trigger to 2 requires "the act's actor is an office (`conformance` R1), so a notice has an addressee".
- [DESIGN] R12 L36 stage 7 accountability purposes official_request, oversight_request, audit_request, testimony, enforcing_legislation; COUNTERPARTY_NOT_ELECTED where profile marks office `elected: false`; COUNTERPARTY_NOT_OVERSIGHT where `oversight: false` (jurisdictions R24, R27); "where the profile says nothing, it lands and the read states the office's election undetermined" (K108(5), N72) — only place office attributes (elected, oversight) drive logic; no reporting-line/oversight-relationship traversal (who oversees whom).
- [DESIGN] R8 L32 available actions "the profile's kinds for the actor's office, read through `filings.availableActions`".
- [GAP] (implied) oversight is a boolean on an office, not a relationship naming which body oversees the actor.
LAW
- [DESIGN] Purpose L14 seven stages (Design Req 7 as amended); ends only when compliance restored and consequences addressed (OP 6); "takes no position on what policy should be (Operational Principle 1)".
- [DESIGN] R14 L44 COMPLIANCE_NOT_RESTORED unless live compliant determination of same act for every standard pursued (K102 L109); CONSEQUENCES_NOT_ADDRESSED/UNDETERMINED (K172); never reopened.
- [DESIGN] R12 enforcing_legislation "legislation that restores or enforces an existing requirement"; "policy advocacy and candidate support have none" (NOT_ACCOUNTABILITY); R19 "no stage act has a purpose outside enforcing a standard the escalation pursues (Operational Principle 1, K14)".
- [DESIGN] R7 L31 evaluation complied/partial/denied/none; "Partial compliance is recorded and does not stop the clock or end the escalation".
COURTS
- [DESIGN] R8 stage 5 legal tools: breach actions with filings or counsel packets (filings.filingsFor), by tier.
- [DESIGN] R12 testimony, audit_request, oversight_request as stage 7 acts (administrative/quasi-judicial channels as purposes only).
QUESTIONS/AI
- [DESIGN] R29 L54 escalationReasonDraft machine-labelled (proposalLabel subject escalation_reason, machine_proposed; like DEC-101 edition statement draft); parts name record ids; "what could not be read is stated undetermined, never filled".
- [DESIGN] Suggestions L116 — "The Escalation Protocol skill (Roadmap §9, Skill 8) reads R2 and `filings` to explain the stage, the acts available by tier and the deadlines; it prepares, and a member acts."
- [DOCTRINE] R17 L88 nothing a machine writes opens/attaches/evaluates/advances/declines/suspends/ends (Design Req 12; DEC-24).
ANALYSIS
- [DOCTRINE] R3 L25 exit two conditions "never composes them into a score"; R19 no significance/severity/priority/urgency/score (K12).
DOCTRINE
- [DOCTRINE] R18 append-only with who/when/why; R20 no place/office/law named; R26 withheld whole, no seq gaps (K913, N460, K933).
- [DESIGN] R27–R28 declineToEscalate, escalationStatus escalated|declined|neither (DEC-89; K1019) — placed in escalation not conformance by P4.
- [DESIGN] R23 premise-overridden action refused ACTION_PREMISE_OVERRIDDEN (K600(a)).
- [DESIGN] Satisfies L102–109 Action §3, §4 rule 2, §5 rows 2, 3, 11, 16; DEC-88, DEC-89; Design Req §7 as amended, §12; Functional Arch L3 F3, F5; Roadmap §5 OP 1, 3, 6, §8, §9 Skill 8; K12, K14, K102.
- [DESIGN] Suggestions L115 progressions' declared stages (member template for recurring process) not reused.

## action-plans.txt (153 lines, read 1–153)
(module context) Status L3–6: reviewed K608(3); "Not yet met: R1–R29 (new, K608, K614)"; K660 planning skill R30–R34 "Not yet met"; N432/K727, N427/K711; DEC-114/DEC-115 R36, R37 "not yet met (T24)" (verify). Last in layer 9, reads every layer-9 module. Size 900–1,400 (L8).
QUESTIONS/AI
- [DESIGN] R11 L37 optionPropose by any credential; proposer/principal stamps (K727); labelled proposalLabel(proposer, "plan_option"); why ≤500; "it is never an option".
- [DESIGN] R30–R31 L71–73 planning run (ai-runs R47 mode `plan`; K660): machine proposal names `run` (PROPOSAL_NO_RUN, RUN_NOT_RUNNING, RUN_OTHER_PLAN), runPrincipalGate (run-rules R5), PROPOSAL_BOUND_REACHED, PROPOSAL_NO_SOURCE (sources: finding, determination, standard, consequence, plan or option id); order of submission (agent-worker R52); consumeBound.
- [DESIGN] R32 L74 disclosure — "Suggested by the assistant (machine work) in run RUN-…, under skill version …. It is not the group's decision; it becomes an option only when a member adopts it." — stops at adoption (not carried onto action).
- [DESIGN] R34 L76 tray five at a time strongest first — "No score, rank figure or strength is recorded or answered: the order is the only sign of it."
- [DESIGN] Suggestions L135 assistant inputs: subjects, standards' text, consequences, work_kinds, profile's deadlines and legal organisations, earlier plans of same project only (K660(4); agent-worker R51; skills R28).
- [DOCTRINE] R24 L107 "A machine proposes (R11) and nothing else"; R33 L112 proposals never become anything by themselves.
- [DESIGN] R21 L64 work_kinds (reporting, fixing, legal, oversight, other) read by assistant suggestions; "gates, filters and orders nothing".
LAW
- [DESIGN] Purpose L14 plan rests on suspected (open inquiry) or determined matters; "The gate stays at the outward act (DEC-26): a plan may rest on what is not yet established" — the one layer-9 construct that works pre-determination (inquiry subject).
- [DESIGN] Terms L18 subject {kind inquiry, inquiry, act?, standards?} or {kind outcome, determination, standard}; support established|short|hypothetical (strength.projectBar).
- [DESIGN] R12 L39 lobbying option must name in `enforces` a standards id or determined subject (Bob's ruling 6, K590); "The module never judges whether text is lobbying".
- [DESIGN] R5 L27 determination recorded on act of suspected subject's inquiry shown as determined_since; member adds.
- [DESIGN] R9 tier on legal option 1|2|3|undetermined, never default.
TIME
- [DESIGN] Terms L18 — "A **regulated date** is `{date: YYYY-MM-DD, basis}`, the basis naming the statute, order or commitment. A **checkpoint** is relative: `{after_days}` counted from its phase's start."
- [DESIGN] R14 L45 ≤3 scenarios; phases with starts plan_start/{after}/{branch_of, when}; checkpoint after_days 1–3,650; PHASE_CYCLE.
- [DESIGN] R15 L46 branch on another subject's track (escalation stage, action resolved), derived when read.
- [DESIGN] R16–R17 L47–48 checkpointRecord member judgement; checkpointsDue for queue-producers R16; "A checkpoint passed unjudged is never a finding about the government (R23)."
- [DESIGN] R19 L58 checks: regulated date past, or before its phase can start; no branch for hostile response (Action §4 rule 12, K597(1)).
- [DESIGN] R29 L67 reminders set at choice (DEC-94, K613(1), K614, K615, K624(3)); "an overdue date is new and notifies once (`queue-producers` R15; DEC-10, DEC-94)"; no outside channel; DEC-69.
- [DESIGN] R18 L51 optionStart composes action with regulated dates as pending clock entries with bases.
ORGANISATIONS
- [DESIGN] R10 L36 addressee = actions R9 shape (D1) "never a private individual".
- [DESIGN] R6 planRead shows started option's action state and each determined subject's escalation stage.
ANALYSIS
- [DOCTRINE] R26 L109 — "No field, input or answer holds a cost, budget, amount of money to be spent, assignee, hours or significance score" (Bob's ruling 3 of 2026-09-29; DEC-24) — OPTION_KEY_REFUSED.
- [DESIGN] Purpose L14 "not a project-management system: it holds no costs, assignees or hours".
COURTS
- [DESIGN] category `legal` options with tier; filings.availableActions shown beside legal options "never a catalogue, Bob's ruling 2 of 2026-09-29" (Uses L100).
DOCTRINE
- [DOCTRINE] R23 L106 checkpoints are group's own intentions, never finding/fact about government; R25 never published (DEC-25); R28 undetermined never default, no place named; R35 withheld whole (K903(4), DEC-36); R36 "matter" not "subject" (DEC-114); R37 preview (DEC-115, DEC-8).
- [DESIGN] Satisfies L122–130 Action §3, §4 rules 1, 2, 3, 5, 8, 9, 10, 12, §5 row 11; Functional Arch Layer 3; Roadmap §5 OP 1, 3, 6, §10; Design Req 5, 12; DEC-94, DEC-10, DEC-69, DEC-70, DEC-77, DEC-114, DEC-115, DEC-25, DEC-26, DEC-24, DEC-27.
- [RULING] K590 (Bob's rulings of 2026-09-29 1–10, D1–D6), K591, K597, K600, K608, K613–K615, K617, K624(3), K660(1)–(7), K710, K711, K727, K1134.
