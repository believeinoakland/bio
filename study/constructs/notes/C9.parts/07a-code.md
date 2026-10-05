@@FILE sources_code.md.txt (297 lines; chunk 1-150)
@@WHAT
- sources_code (src/action-design/sources_code.md.txt): built-code inventory of layer 9 (Action), read 2026-09-29 from /home/user/bio (`bio-plane/`). Records a test run (181/181 pass), per-module files/line counts/services with source line numbers/tables/vocabularies/refusals/ops for standards, conformance, consequences, actions, filings, escalation; then routing, UI, profiles, tests and skills. It is the "verify built against code" evidence for the Action layer as of that date.
@@TIME
- [BUILT] code §1.1, line 31 — `inForce(id,date)` :328 "answers in_force, not_in_force or undetermined, with why (`inForceAt` :73)"; `standardsIn` :338 "a filtered list with an `at` date; at most 200 per page" (line 32).
- [BUILT] code §1.1, line 29 — `standardDeclare` :190 records "cite, kind, issuer, text content ids, period, optional supersedes".
- [BUILT] code §1.1, line 41 — `IN_FORCE_STATES` = in_force, not_in_force, undetermined.
- [BUILT] code §1.2, line 54 — `basisChanged` :821 "the reevaluation listener that flags a determination when something it rests on changes."
- [BUILT] code §1.4, line 98 — check: "only a machine may move a clock entry, and only pending→overdue (`CLOCK_STATUS_NOT_MECHANICAL`)".
- [BUILT] code §1.4, line 103 — `actionCorrespond` :914 ledger entry "with lifecycle stage, outcome, exemptions, due_by and quotes".
- [BUILT] code §1.4, line 109 — `derived` :1761 "tier words, clock_next and clock_overdue computed on read" (derived overdue at read).
- [BUILT] code §1.4, lines 112-113, 115 — `pendingClocks` :1874; `clockPropose` :1964 "a clock entry from a profile deadline"; helpers `actionClockNext` :120, `actionOverdue` :131.
- [BUILT] code §1.4, line 116 — table `action_clock_proposals`.
- [BUILT] code §1.4, line 128 — clock status = pending, met, overdue, waived (`index.mjs:470`).
- [BUILT] code §1.4, line 120 — states: planned → active → awaiting_response ↔ active → resolved or abandoned (`bio-checks.mjs:462-470`).
- [GAP] code §1.4, line 130 — "**Not routed as ops:** `actionRead`, `actionsFor`, `pendingClocks`, `clockPropose`. These are reached only internally, by filings, escalation and monitoring."
- [BUILT] code §1.5, line 134 — filings has `dates.mjs` 49 lines (date helper in filings).
- [BUILT] code §1.5, line 142 — `filingRecordSent` :496 "writes a `sent` ledger entry through `actions.actionCorrespond` and offers `clockPropose` for each profile deadline."
- [BUILT] code §1.5, line 150 — `FILING_BLANKS` include `act_date`, `clock`, `date`.
- [BUILT] code §1.3, line 79 — consequence `UNITS` include `time`.
@@ORGANISATIONS
- [BUILT] code §1.2, line 63 — "The act's actor is an office (role and body)."; act gets an `ACT-` id minted by the first determination; "the act has no bundle" (line 57).
- [BUILT] code §1.2, line 53 — `determinationsFor` :693 filters: project, act, standard, finding, outcome, live (no filter by office/body).
- [BUILT] code §1.3, line 78 — `AFFECTED_KINDS` = class, fund, program, service, body, other (:54).
- [BUILT] code §1.4, line 95 — check: "the counterparty as an office with role and body, `COUNTERPARTY_REFUSED` :447-455".
- [BUILT] code §1.4, line 107 — `actionQuotes` :1611 "reads quotes across actions by counterparty" (a cross-action read keyed on the organisation).
- [BUILT] code §1.5, line 150 — `FILING_BLANKS`: counterparty_role, counterparty_body, venue, venue_how, group.
@@LAW
- [BUILT] code §1.1, lines 26-44 — standards: 811 lines source, tests 815; services `standardDeclare`, `standardRead`, `inForce`, `standardsIn`, `standardPropose`, `standardAdopt`, `sourceOf` :131 ("finds the profile's `standard_sources` entry for a cite"), `check`, `noSuchStandard`; record `STD-<year>-NNNN-<kind>` "promoted outside any project"; tables `standards`, `standard_texts`, `standard_proposals`, `standard_adoptions`.
- [BUILT] code §1.1, line 40 — "`STANDARD_KINDS = SOURCE_KINDS` = statute, regulation, ordinance, court, policy, commitment (`jurisdictions/index.mjs:26`)"; bounds cite 200, why 240.
- [GAP] code §1.1, line 44 — "the header (:13) names "the Legal/Policy Lookup skill" as the source of proposals. No such skill exists (§6)."
- [BUILT] code §1.2, lines 46-64 — conformance 1,256 lines source; `determine` :446 "a member judges an act compliant, noncompliant or unclear against each named standard, resting on published findings"; `comparisonPropose` :750 "the machine's or a member's comparison, which is not a determination"; tables incl. `determination_rows`, `comparison_proposals`; `OUTCOMES`, `READINGS` = aligns, diverges, open; `SIGNIFICANCE_KEYS` refused.
- [BUILT] code §1.2, line 63 — "**Hard prerequisite:** a determination rests on at least one finding **published in a ratified case edition of the same project**. Otherwise it is refused `NO_FINDINGS` or `FINDING_NOT_PUBLISHED` (`#pinFindings` :272-296)."
- [BUILT] code §1.4, lines 104, 106 — `actionLaws` :1199 member states governing laws; `actionLawsPropose` :1504 proposals "from any credential".
- [CONFLICT] code §1.4, line 127 — "`LAW_LEVELS` = federal, state, local (:613). The jurisdictions module has its own list: federal, state, county, city."
- [BUILT] code §1.4, line 100 — check enforces "the breach rule (`#breachRefusal` :588-614)".
- [BUILT] code §1.4, lines 118-119 — `PRODUCT_KINDS` = records_request, request_for_comment, other; legacy `ACTION_KINDS` (cpra_request, grand_jury, controller_referral, public_comment, media, litigation_support, request_for_comment, other) read as written, not accepted on new creation (`kindReadsAsWritten` :59).
- [BUILT] code §1.5, line 150 — `FILING_BLANKS` include standards, findings, governing_laws, law.
@@COURTS
- [BUILT] code §1.4, line 125 — "`CORRESPONDENCE_STAGES`: sent = request, fee_waiver_request, appeal, court_filing; received = acknowledgement, fee_estimate, fee_waiver_decision, extension_notice, production, denial, appeal_decision, court_decision (:4118)."; `CORRESPONDENCE_OUTCOMES` (:4123).
- [BUILT] code §1.4, line 121 — `RISK_TIERS`: 1 "file freely", 2 "file with caution", 3 "do not file without counsel", undetermined.
- [BUILT] code §1.4, line 122 — `RESOLUTIONS` = complied, denied, escalated, withdrawn.
- [BUILT] code §1.5, lines 133-147 — filings 1,381 lines source; `governingTier` :280 ("undetermined is never read as 1"); `filingPrepare` :359 (refusals `FILING_TIER_UNDETERMINED`, `TIER3_COUNSEL_PACKET`, `KIND_NO_TEMPLATE`; blanks name source or `[UNFILLED: x]`; Tier 2 advisory); `filingApprove` :459 (`FILING_STALE`, `STILL_UNFILLED`); `counselPacket` :745/`counselPacketRead` :811/`counselPacketExport` :840, marked "Prepared for review by … Not legal advice. Not for filing." (:86); `filingsFor`; `theoryPropose` :910 "a candidate theory and remedy; a proposal only"; `availableActions` :1002; `evidenceBlock` :1018.
- [BUILT] code §0, line 20 — wire-level chain test `test/gate-reads.test.mjs:944-1110` (standarddeclare → determine → comparisonpropose → consequencerecord → escalationopen → action promote → counselpacket); "It had to plant the ratified case edition directly into tables (`/t9plant`, :963-973)."
@@ANALYSIS
- [BUILT] code §1.3, lines 66-87 — consequences 1,032 lines source; "`figures.mjs` holds the arithmetic: `compute` over `OPS` sum, difference, count, product, ratio (:10)"; `consequencesOf` :649; `addressed` :707 rollup; tables `consequence_parts`, `consequence_operands`, `consequence_addressed`.
- [BUILT] code §1.3, lines 78-83 — `UNITS` = money, benefits, services, time, count; `PART_STATES` = computed, assessed, undetermined; `UNDETERMINED_WHY` = not_in_record, form_not_read, not_assessed, not_computable (:62); causation inquiry id / unproven / not_applicable.
- [BUILT] code §1.3, lines 85-86 — refused `CONSEQUENCE_NOT_NONCOMPLIANT` unless live determination's noncompliant outcome; "A machine may record only a *computed* part (:395-397)."
- [BUILT] code §1.4, line 107 — `actionQuotes` reads quotes across actions by counterparty (a cross-record aggregation of fee quotes).
- [BUILT] code §0, line 7 — 181 tests, 181 pass (standards 18, conformance 36, consequences 24, actions 40, filings 34, escalation 29).
@@QUESTIONS
- [BUILT] code §1.1, line 33 — `standardPropose` :371 "a proposal from the machine or a member, stored apart and labelled".
- [BUILT] code §1.2, line 52 — `comparisonPropose` :750 machine's comparison "not a determination".
- [BUILT] code §1.4, line 106 — `actionLawsPropose`, `actionRiskPropose` "proposals from any credential".
- [BUILT] code §1.5, line 145 — `theoryPropose` "a candidate theory and remedy; a proposal only".
- [GAP] code §1.1, line 44 — no Legal/Policy Lookup skill.
@@DOCTRINE
- [BUILT] code §1.2, line 61 — `SIGNIFICANCE_KEYS` (:60) "refused keys: nothing is ranked".
- [BUILT] code §1.4, line 91 — actions "extracted from the legacy `store.mjs` and `schema.mjs` ... the oldest part of the layer"; line 92 created only by `op=promote`, "No op here creates one."
- [GAP] code §1.4, line 131 — stale requirement marks in actions.md though implemented (R8 :588, R10 :214/:436, R29 :1816, R30 :1836, R31 :1874, R32 :1964).
- [BUILT] code §0, line 18 — no TODO/FIXME; `escalation/index.mjs:970` provider not merged stays injected, refused `PROVIDER_UNAVAILABLE`.
@@CROSS
- code line 63 + line 20: the LAW-application step (determine) is hard-gated on a ratified published case edition — even the chain test had to plant one directly; so LAW measurement cannot be exercised during investigation, only comparisons (`comparisonPropose`) can.
- code line 127: two LAW_LEVELS vocabularies (actions: federal/state/local; jurisdictions: federal/state/county/city) — a small LAW/ORGANISATIONS-level inconsistency in code.
- code line 109: overdue is derived on read in `actions.derived` (clock_next, clock_overdue) while the check allows a mechanical pending→overdue write (line 98) — both canon models (stored vs derived) coexist in code.
