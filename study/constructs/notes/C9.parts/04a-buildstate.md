@@FILE sources_build-state.md.txt (415 lines; chunk 1-210)
@@WHAT
- sources_build-state (src/action-design/sources_build-state.md.txt): read-only inventory, 2026-09-29, of /home/user/bio at branch `claude/brave-johnson-5fqmix` (HEAD `5bb688333c`, K452), of the approved layer-9 build state: status, the six modules (standards, conformance, consequences, actions, filings, escalation) with purpose, services/ops, record types, not-yet-met, open entries and K rulings; then the layer contract, adjacent modules (jurisdictions, monitoring, publication, affordances, queue), plan state and stale marks. Every claim cites a file and id (abbreviations L, RUL, MJ, std/conf/cons/act/fil/esc.md, jur/mon/pub/aff/que.md, NX, T8/T11/T12).
@@TIME
- [BUILT] build-state §1.1 standards Purpose, line 35 — standards hold "the period it was in force. It answers which standards were in force at a date."
- [BUILT] build-state §1.1 Services, lines 40-41 — `standardsIn`: "optionally the standards in force at a date (R8)"; "`inForce(id, date)`: `in_force | not_in_force | undetermined` (R7)."
- [BUILT] build-state §1.1 Record, line 49 — "`period {from,to}` (null means "not stated", never "always")", "`supersedes` (at most one successor, R6)".
- [BUILT] build-state §1.2 conformance Record, line 82 — Act: "`{id?, description, actor: {role, body}, at | period, evidence}`" — an act is dated by instant or period.
- [BUILT] build-state §1.2, line 87 — "`live` holds until the determination is superseded. `basis_changed` is a notice only (R10)." (as-of / supersession over time).
- [BUILT] build-state §1.3 consequences Purpose/Record, lines 105, 121 — consequence records "the period"; measure unit ∈ {money, benefits, services, time, count}.
- [BUILT] build-state §1.4 actions Purpose, line 140 — "the clock, where every deadline names its basis".
- [BUILT] build-state §1.4 Record, line 168 — "`clock[] {text, description, date, basis, status ∈ pending, met, overdue, waived}`".
- [BUILT] build-state §1.4 Record, line 169 — `action_basis[] {target, kind ∈ rests_on, advances, note?, date?, extent_capture?}`.
- [BUILT] build-state §1.4 Lifecycle, line 177 — "`planned → active | abandoned`; `active → awaiting_response | resolved | abandoned`; `awaiting_response → active | resolved | abandoned`".
- [BUILT] build-state §1.4 Services, lines 159-160 — "`pendingClocks` (R31, monitoring's read)"; "`clockPropose` (R32, a clock entry from a profile deadline, stored apart)".
- [RULING] build-state §1.4 Rulings, line 193 — K102: "The clock is proposed from the profile but only a member writes it (R32, R35)."
- [BUILT] build-state §0, line 21 — K253 names `clockPropose`, `CLOCK_STATUS_NOT_MECHANICAL`.
- [GAP] build-state §1.4 Open entries, line 189 — "N277: `pendingClocks`/`project` unbounded reads, partly overtaken by N311; `NO_RULE` shadows `clockPropose`."
- [RULING] build-state §1.4 Rulings, line 198 — K368: codes `ACTION_MOVE_NO_REASON`, `PENDING_CLOCKS_BAD_BEFORE`.
- [BUILT] build-state §1.4 Purpose, line 143 — actions hold "fee quotes and the records-request lifecycle".
- [BUILT] build-state §1.5 filings Purpose, line 205 — counsel packet holds "a chronology" and "the claim deadlines" (limitation windows).
- [BUILT] build-state §0, line 24 — monitoring `deadlineRecheck`, `escalationsSeen` built though marked R34/R35 not yet met.
@@ORGANISATIONS
- [BUILT] build-state §1.2 conformance Record, line 82 — "**Act:** `{id?, description, actor: {role, body}, at | period, evidence}`. The actor is an office, never a person. The first determination mints the `ACT-` id, and "the same act" means the same id".
- [BUILT] build-state §1.3 consequences Record, line 120 — "**Affected** `{kind, description, role?}`. `kind` ∈ {class, fund, program, service, body, other}. There is **no person kind**: people appear as a class or as an office `{role, body}` (Terms; R10)."
- [BUILT] build-state §1.4 actions, line 179 — "Counterparty: `{state: named, role, body, level?, entity_id?}` or `{state: undetermined, basis}`. It is an **office, never a person** (R9; jur R24)." (note optional `entity_id` link to entities module and `level`).
- [BUILT] build-state §1.1 standards, lines 35, 49-50 — a standard has an `issuer`; source match carries `{state: matched, source, kind, issuer, level, profile, basis}`.
- [BUILT] build-state §1.2, line 89 — author must be a joined participant of the project (`membership.projectAuthority(...,"joined")`).
- [RULING] build-state §1.4, line 193 — K102: "A counterparty is an office."
@@LAW
- [BUILT] build-state §1.1 standards Purpose, line 35 — "A standard is what a government act is measured against: a statute, regulation, ordinance, court decision or order, adopted policy, or public commitment. The module holds each one as captured content in the record, with its citation, kind, issuer, source (matched to a profile's `standard_sources`, or undetermined) and the period it was in force." "It judges neither a government act nor a standard's merit (std.md Purpose; R12; Operational Principle 1). A standard belongs to the whole instance, as a bundle outside any project".
- [BUILT] build-state §1.1 Services, lines 38-45 — `standardDeclare` (R1–R4), `standardRead` "with its supersession links and text standing (R5)", `standardsIn` (R8), `inForce` (R7), `standardPropose`/`standardAdopt` (R9, R10: machine or member proposal stored apart), ops `standarddeclare`, `standard`, `standards`, `standardinforce`, `standardpropose`, `standardadopt`.
- [BUILT] build-state §1.1 Record, line 49 — `cite` (≤200 chars), `kind` ∈ {statute, regulation, ordinance, court, policy, commitment} (R1; jur R23), `issuer`, `text` (content ids, always required, R2), `period`, `supersedes` ("at most one successor, R6"). Record type `STD-`, one state `recorded`, "no edges".
- [GAP] build-state §1.1 Record, lines 48-49 — no structure below the standard (no sections, definitions, cross-references, amendment graph beyond a single `supersedes` successor link; "no edges").
- [RULING] build-state §1.1 Rulings, line 58 — K102: "a standard is held even when no profile matches, because the profile does not decide what law a group may hold its government to (R3)."
- [RULING] build-state §1.1, lines 59-61 — K108 (5)/K171 (3) the match carries its `level`; K251 code `MACHINE_CANNOT_DECLARE_STANDARD`; K369 `STANDARD_NO_ID`.
- [BUILT] build-state §1.2 conformance Purpose, lines 66-70 — determination `compliant`/`noncompliant`/`unclear` "against named standards, resting on **published findings**"; "A member determines. A machine only prepares the comparison (R13)"; "A compliant determination carries exactly the obligations a noncompliant one does (R5)"; unclear names questions sent back to an inquiry (R6); "Significance is never ranked here (R8; K12)".
- [BUILT] build-state §1.2 Record, lines 83-84 — "**Outcome**, given **per standard** and never composed across standards (R4; K102)"; "**Comparison row:** `{standard, requires, did, reading}` with reading ∈ {aligns, diverges, open}."
- [BUILT] build-state §1.2, lines 88-90 — caps 50 findings, 50 standards, 200 rows, 20 questions, 50 evidence ids; "Every finding must be a member of a published case edition **of that project** (R2; publication R37)."
- [RULING] build-state §1.2 Rulings, line 100 — K102 "(determination after publication; per-standard outcomes)"; K375 (`determine` graded `reasoned`, via aff.md R2).
- [OPEN] build-state §1.2 Open entries, lines 95-98 — N242 DEC-49 guard share; N320 null placeholder waits on DEC-36 question N303; "N344/N345: DEC-76/77 contradiction PRESENT/RESOLVE changes touch conformance. Bob approves first."
- [BUILT] build-state §1.4 actions, lines 142, 171, 173 — "the governing laws and the tier, as members' acts, with machine proposals stored apart"; "`governing_laws[] {level ∈ federal, state, county, city, citation}` (at most 12; R18; jur R31)"; "`law` (records_request only; R4)".
- [BUILT] build-state §1.4, line 175, 193 — optional `breach: true` (R8); K102: "**R8 binds breach actions only**. Evidence-gathering actions keep resting on inquiries and information."
- [BUILT] build-state §0, line 22 — code `MACHINE_CANNOT_STATE_RECORDS_LAW`, `ACTION_NO_DETERMINATION`.
- [BUILT] build-state §1.4, line 181 — kinds: product `records_request`, `request_for_comment`, `other`, plus profiles' `action_kinds`; else `ACTION_KIND_UNKNOWN` (R10).
- [BUILT] build-state §1.5 filings, line 205 — counsel packet holds "the standards' text, candidate theories and remedies".
@@COURTS
- [BUILT] build-state §1.1, lines 35, 49 — standard kind `court` ("court decision or order") — a court's order/decision can be held as a standard an act is measured against.
- [BUILT] build-state §1.5 filings Purpose, lines 203-207 — Tier 1/2 filing pre-filled from profile template, every blank names its source, Tier 2 carries profile's advisory note; Tier 3 counsel packet: "facts with citations, a chronology, exhibits with provenance, the standards' text, candidate theories and remedies, and the claim deadlines. It is marked for counsel's review, is never published and is never fileable." "Counsel drafts and files." "The instance transmits nothing (fil.md Purpose; R7; K13, K102)."
- [BUILT] build-state §1.4 actions, lines 166, 172 — `risk_tier` ∈ {1, 2, 3, undetermined}; `resolution` ∈ {complied, denied, escalated, withdrawn} (R7).
- [BUILT] build-state §1.4, line 170 — correspondence direction ∈ sent, received, no_response; "capture **xor** a member's account".
@@ANALYSIS
- [BUILT] build-state §1.3 consequences, lines 104-109 — "Computed from the record where figures exist. Otherwise assessed by a member, with a rationale, or undetermined." "Causation is a finding that needs evidence and is never assumed." "No significance".
- [BUILT] build-state §1.3 Services, line 114 — "`consequencesOf`: the parts, totals within one state, unit and currency, and the undetermined and unproven lists (R7)."
- [BUILT] build-state §1.3 Record, line 121 — "**Measure** `{unit, currency?, value | range}`, unit ∈ {money, benefits, services, time, count}."
- [BUILT] build-state §1.3 Record, line 123 — "computed: `basis {op ∈ sum, difference, count, product, ratio; operands = content ids}`. The module does the arithmetic, and the grade is the weakest of the operands' captures (R2)."
- [BUILT] build-state §1.3, lines 124-125 — assessed: member's value with rationale, "a machine is refused (R3)"; "undetermined: never read as zero (R4)."
- [BUILT] build-state §1.3, line 126 — "**Causation** ∈ {established (names an inquiry), unproven, not_applicable (zero measure)} (R5, R12; K283; N257)."
- [BUILT] build-state §1.3, lines 127-128 — Addressed needs evidence; "With no parts it is `undetermined` (R9; K172)"; "A machine may record a *computed* part only (R2; K102)."
- [RULING] build-state §0, line 9 — K172 (Bob): "a determination with no recorded consequence is `undetermined`, so an escalation cannot end on it."
- [GAP] build-state §1.3 — calculation is limited to five ops (sum, difference, count, product, ratio) over content ids, inside layer 9, attached to one standard's noncompliant outcome; no datasets, filters, aggregates beyond these, trends.
- [BUILT] build-state §1.4, line 143 — fee quotes (`actionQuotes`, R25–R27).
@@QUESTIONS
- [BUILT] build-state §1.1, line 42 — "`standardPropose` / `standardAdopt`: a machine or member proposal, stored apart; a member adopts it (R9, R10)"; line 51 proposal labels from `proposalLabel(proposer,"standard")`.
- [BUILT] build-state §1.2, lines 67, 76 — "A machine only prepares the comparison (R13)"; `comparisonPropose`/`comparisonRead`: "a machine or member comparison, never an outcome (R12, R18)".
- [BUILT] build-state §1.4, lines 153, 157, 160 — `actionLawsPropose` (R19), `actionRiskPropose` (R28), `clockPropose` (R32) — machine proposals stored apart.
- [BUILT] build-state §1.4, line 150 — "`actionFacts`, the pure projection for retrieval (R12)" (actions visible to retrieval).
- [BUILT] build-state §1.5, line 206 — "The AI prepares; a member approves, files by the venue's own means, and records the sending."
- [BUILT] build-state §0, line 22 — code `MACHINE_CANNOT_STATE_RECORDS_LAW`; §1.1 line 60 `MACHINE_CANNOT_DECLARE_STANDARD`; §1.3 line 128 machine may record computed part only.
@@DOCTRINE
- [RULING] build-state §0, line 9 — Layer 9 approved by Bob 2026-09-26 (K11–K14); requirement files approved "Open for Bob: none" (K102); folded K171; K172 changed meaning; built T8 (K248–K257); T8 suites standards 16/0, conformance 29/0, consequences 22/0, actions 30/0, filings 30/0, escalation 27/0 (K257).
- [GAP] build-state §0, lines 19-27 — bookkeeping defect: actions.md R4–R11, R22, R28–R33, R40, R41 marked not-yet-met but built; monitoring R34/R35; publication R36/R37; NX N61, N129, N130 stale (K232). "Treat these marks as stale, not as open work."
- [DOCTRINE] build-state §1.1, line 35 — standards judge "neither a government act nor a standard's merit (... Operational Principle 1)".
- [DOCTRINE] build-state §1.2, line 82 / §1.3 line 120 / §1.4 line 179 — actor, affected and counterparty are offices or classes, never a person (no person kind).
- [DOCTRINE] build-state §1.2/1.3, lines 70, 109 — "Significance is never ranked" (K12).
- [DOCTRINE] build-state §1.3, line 125 — "undetermined: never read as zero (R4)."
- [DOCTRINE] build-state §1.5, line 207 — "The instance transmits nothing".
@@CROSS
- build-state lines 35-49: standards already carry TIME (period in force, `inForce(id,date)` as-of answer with `undetermined`) and ORGANISATIONS (issuer, level) and are instance-wide bundles outside any project — the one place where LAW, TIME and organisation-level meet; but it sits in layer 9.
- build-state line 82: the conformance Act has `actor {role, body}` + `at | period` — the only structured "who did what when" record of a government act, minted only at determination (after publication).
- build-state line 123: ANALYSIS (computed consequences) carries a grade ("weakest of the operands' captures") — the grade-of-derived-number rule exists, but only for five arithmetic ops on one breach.
- build-state line 179: counterparty has optional `entity_id` — a link from an Action's office to the `entities` module (layer 5), a seam where an organisations model could attach.
