# Layer 9 (Action) — built-code inventory

Repo `/home/user/bio`, read 2026-09-29. Paths are relative to `bio-plane/` unless they start with another top-level folder. Nothing was edited.

## 0. Test run

`node --test test/m/{standards,conformance,consequences,actions,filings,escalation}`: **181 tests, 181 pass, 0 fail, 0 todo, 0 skipped** (about 12 s; node_modules present).

| module | tests | pass | fail |
|---|---|---|---|
| standards | 18 | 18 | 0 |
| conformance | 36 | 36 | 0 |
| consequences | 24 | 24 | 0 |
| actions | 40 | 40 | 0 |
| filings | 34 | 34 | 0 |
| escalation | 29 | 29 | 0 |

The modules contain no TODO, FIXME or `test.todo`. The only "not yet" hit is `escalation/index.mjs:970`: a provider that has not merged yet stays an injected dependency, and its absence is refused `PROVIDER_UNAVAILABLE`.

There is also a wire-level chain test outside the module suites. `test/gate-reads.test.mjs:944-1110` runs standarddeclare, determine, comparisonpropose, consequencerecord and escalationopen, then an action promote and counselpacket, through the Worker. It had to plant the ratified case edition directly into tables (`/t9plant`, :963-973). I did not run it.

---

## 1. Per module

### 1.1 standards — `src/standards/` (811 lines of source; tests 815)
- **Files:** `index.mjs` 637, `checks.mjs` 109, `schema.mjs` 65. Tests: `declare` 191, `invariants` 170, `proposals` 84, `read` 168, `fixture` 202.
- **Services** (`index.mjs`):
  - `standardDeclare` :190 — a member records a standard: cite, kind, issuer, text content ids, period, optional supersedes.
  - `standardRead` :308 — reads one standard.
  - `inForce(id,date)` :328 — answers in_force, not_in_force or undetermined, with why (`inForceAt` :73).
  - `standardsIn` :338 — a filtered list with an `at` date; at most 200 per page.
  - `standardPropose` :371 — a proposal from the machine or a member, stored apart and labelled.
  - `standardAdopt` :428 — a member adopts a proposal as a standard.
  - `sourceOf` :131 — finds the profile's `standard_sources` entry for a cite.
  - `check` :169 — the promotion step that refuses every other write of a standard.
  - `noSuchStandard` :566 — the one "no such standard" answer.
- **Record:** a `standard` document, `STD-<year>-NNNN-<kind>`, promoted outside any project (header :8-11). **Tables:** `standards`, `standard_texts`, `standard_proposals`, `standard_adoptions` (`schema.mjs:11,26,33,45`).
- **Vocabularies:**
  - `STANDARD_KINDS = SOURCE_KINDS` = statute, regulation, ordinance, court, policy, commitment (`jurisdictions/index.mjs:26`).
  - `IN_FORCE_STATES` = in_force, not_in_force, undetermined (:43).
  - Bounds :46 — cite 200, why 240.
- **Ops** (`standardsOps` :604): `standarddeclare`, `standard`, `standards`, `standardinforce`, `standardpropose`, `standardadopt`. All routed (see §2).
- **Gap:** the header (:13) names "the Legal/Policy Lookup skill" as the source of proposals. No such skill exists (§6).

### 1.2 conformance — `src/conformance/` (1,256 lines of source; tests 1,356)
- **Files:** `index.mjs` 981, `checks.mjs` 125, `schema.mjs` 150. Tests: `determine` 480, `reads` 237, `record` 175, `helpers` 116, `fixture` 348.
- **Services:**
  - `determine` :446 — a member judges an act compliant, noncompliant or unclear against each named standard, resting on published findings, with an optional supersession and reason.
  - `determinationRead` :590.
  - `determinationsFor` :693 — filters: project, act, standard, finding, outcome, live.
  - `comparisonPropose` :750 — the machine's or a member's comparison, which is not a determination.
  - `comparisonRead` :797.
  - `basisChanged` :821 — the reevaluation listener that flags a determination when something it rests on changes.
  - `check` :847.
  - `noSuchDetermination` :876, `determinationSuperseded` :890, `determinationDoc` :910.
- **Record:** a `CONF-` bundle in a project. The act gets an `ACT-` id minted by the first determination; the act has no bundle (header :11-18). **Tables** (`schema.mjs:15-124`): `determinations`, `determination_standards`, `determination_rows`, `determination_findings`, `determination_questions`, `determination_supersessions`, `determination_flags`, `comparison_proposals`, `comparison_proposal_uses`.
- **Vocabularies:**
  - `OUTCOMES` = compliant, noncompliant, unclear (:56).
  - `READINGS` = aligns, diverges, open (:58).
  - `SIGNIFICANCE_KEYS` (:60) — refused keys: nothing is ranked.
  - `LIMITS` (:66).
- **Hard prerequisite:** a determination rests on at least one finding **published in a ratified case edition of the same project**. Otherwise it is refused `NO_FINDINGS` or `FINDING_NOT_PUBLISHED` (`#pinFindings` :272-296). The act's actor is an office (role and body).
- **Ops** (`conformanceOps` :968): `determine`, `determination`, `determinations`, `comparisonpropose`, `comparison`. All routed.

### 1.3 consequences — `src/consequences/` (1,032 lines of source; tests 1,037)
- **Files:** `index.mjs` 798, `figures.mjs` 93, `schema.mjs` 90, `checks.mjs` 51. Tests: `record` 203, `assessed` 172, `computed` 148, `addressed` 139, `reads` 127, `fixture` 248.
- **Services:**
  - `consequenceRecord` :359 (via `#record` :383) — one part for one standard's **noncompliant** outcome.
  - `consequenceRevise` :363 — a successor part, with a reason.
  - `consequenceRead` :634.
  - `consequencesOf` :649.
  - `addressedRecord` :678 — a member records a part addressed or not addressed, with evidence.
  - `addressed` :707 — the per-determination rollup that escalation reads.
  - `figures.mjs` holds the arithmetic: `compute` over `OPS` sum, difference, count, product, ratio (:10).
- **Record:** a `CONS-` bundle per part. **Tables:** `consequence_parts`, `consequence_operands`, `consequence_addressed` (`schema.mjs:21,52,68`).
- **Vocabularies:**
  - `AFFECTED_KINDS` = class, fund, program, service, body, other (:54).
  - `UNITS` = money, benefits, services, time, count (:56).
  - `PART_STATES` = computed, assessed, undetermined (:58).
  - `ADDRESSED_STATES` = addressed, not_addressed (:60).
  - `UNDETERMINED_WHY` = not_in_record, form_not_read, not_assessed, not_computable (:62).
  - Causation: an inquiry id, `unproven`, or `not_applicable` for a zero measure (:204-209, :297).
- **Refusals and rules:**
  - Anything that is not a live determination's noncompliant outcome is refused `CONSEQUENCE_NOT_NONCOMPLIANT` (:391-394).
  - A machine may record only a *computed* part (:395-397).
- **Ops** (`consequencesOps` :785): `consequencerecord`, `consequencerevise`, `consequence`, `consequencesof`, `addressedrecord`, `addressed`. All routed.

### 1.4 actions — `src/actions/` (3,498 lines of source; tests 1,068)
- **Files:** `index.mjs` 2153, `checks.mjs` 1135, `schema.mjs` 210. Tests: `acts` 218, `write` 220, `read` 177, `t11` 162, `t12` 114, `fixture` 177.
- **Origin:** extracted from the legacy `store.mjs` and `schema.mjs` (header :4-9), so this is the oldest part of the layer.
- **Creation:** an action is **created by `op=promote`** of an `action` document (`ACTN-…`). No op here creates one. The module's `check` (:520) enforces:
  - the kind, `ACTION_KIND_UNKNOWN` :436;
  - the tier vocabulary;
  - the counterparty as an office with role and body, `COUNTERPARTY_REFUSED` :447-455;
  - a resolution on `resolved`;
  - the clock entry shape (date, basis, status);
  - only a machine may move a clock entry, and only pending→overdue (`CLOCK_STATUS_NOT_MECHANICAL`);
  - legs, ledger and size limits;
  - the breach rule (`#breachRefusal` :588-614).
- **Services:**
  - `actionMove` :746 — a state move, with a reason and a resolution.
  - `actionCorrespond` :914 — a ledger entry: sent, received or no_response, with lifecycle stage, outcome, exemptions, due_by and quotes.
  - `actionLaws` :1199 — a member states the governing laws.
  - `actionRiskTier` :1356 — a member revises the tier, with a reason.
  - `actionLawsPropose` :1504 and `actionRiskPropose` :1919 — proposals from any credential.
  - `actionQuotes` :1611 — reads quotes across actions by counterparty.
  - `kinds()` :214 — the product's kinds plus the profile's `action_kinds`.
  - `derived` :1761 — the derived read block: tier words, clock_next and clock_overdue computed on read, basis legs, ledger, governing laws, proposals, records_law, lifecycle, `own_outcome`, responses.
  - `actionRead` :1816.
  - `actionsFor` :1836.
  - `pendingClocks` :1874.
  - `clockPropose` :1964 — a clock entry from a profile deadline.
  - `check`, `project`, `audit`.
  - Module helpers: `actionClockNext` :120, `actionOverdue` :131, `actionFacts` :139, `noSuchAction` :100.
- **Tables** (`schema.mjs:34-198`): `action_basis`, `correspondence`, `action_quotes`, `action_law_proposals`, `action_risk_proposals`, `action_clock_proposals`.
- **Vocabularies:**
  - `PRODUCT_KINDS` = **records_request, request_for_comment, other** (`checks.mjs:47`), plus the profile's `action_kinds` (`actionKinds` :50).
  - Legacy `ACTION_KINDS` = cpra_request, grand_jury, controller_referral, public_comment, media, litigation_support, request_for_comment, other (`checks/bio-checks.mjs:572`). Actions with these kinds read as written; they are not accepted on a new creation (`kindReadsAsWritten` :59).
  - States: planned → active → awaiting_response ↔ active → resolved or abandoned (`bio-checks.mjs:462-470`).
  - `RISK_TIERS`: 1 "file freely", 2 "file with caution", 3 "do not file without counsel", undetermined (`bio-checks.mjs:586`).
  - `RESOLUTIONS` = complied, denied, escalated, withdrawn (:767).
  - `ACTION_BASIS_KINDS` = rests_on, advances (:734).
  - `CORRESPONDENCE_DIRECTIONS` = sent, received, no_response (:740).
  - `CORRESPONDENCE_STAGES`: sent = request, fee_waiver_request, appeal, court_filing; received = acknowledgement, fee_estimate, fee_waiver_decision, extension_notice, production, denial, appeal_decision, court_decision (:4118).
  - `CORRESPONDENCE_OUTCOMES` (:4123).
  - `LAW_LEVELS` = federal, state, local (:613). The jurisdictions module has its own list: federal, state, county, city.
  - Clock status = pending, met, overdue, waived (`index.mjs:470`).
- **Ops** (`actionsOps` :2127): `actionmove`, `actionlaws`, `actionrisktier`, `actionlawspropose`, `actionriskpropose`, `actioncorrespond`, `actionquotes`, `actionkinds`. All routed.
- **Not routed as ops:** `actionRead`, `actionsFor`, `pendingClocks`, `clockPropose`. These are reached only internally, by filings, escalation and monitoring. To read an action, a surface uses `op=projection` or `op=image`, which carry the derived block.
- **Stale requirement marks:** `build/requirements/actions.md` still marks R4-R11, R22, R28-R32, R40, R41 and R33 "not yet met". Most of these are visibly implemented, for example R8 at :588, R10 at :214 and :436, R29 at :1816, R30 at :1836, R31 at :1874, R32 at :1964.

### 1.5 filings — `src/filings/` (1,381 lines of source; tests 1,260)
- **Files:** `index.mjs` 1090, `checks.mjs` 131, `schema.mjs` 111, `dates.mjs` 49. Tests: `prepare` 224, `packet` 249, `reads` 176, `approve-send` 148, `refusals` 127, `sight` 115, `fixture` 221.
- **Services:**
  - `governingTier` :280 — the stricter of the profile kind's tier and the action's tier; undetermined is never read as 1.
  - `filingPrepare` :359 — a draft filled from the profile's `action_kinds[kind].template`.
    - Refusals: `FILING_TIER_UNDETERMINED` :371, `TIER3_COUNSEL_PACKET` :374, `KIND_NO_TEMPLATE` :379.
    - Each blank names its source, or is left as `[UNFILLED: x]`.
    - Tier 2 prepends the advisory note.
  - `filingApprove` :459 — at most once per draft. Refuses a stale draft (`FILING_STALE`) and remaining markers (`STILL_UNFILLED`).
  - `filingRecordSent` :496 — writes a `sent` ledger entry through `actions.actionCorrespond` and offers `clockPropose` for each profile deadline.
  - `counselPacket` :745, `counselPacketRead` :811, `counselPacketExport` :840 — Tier 3. The packet is marked "Prepared for review by … Not legal advice. Not for filing." (:86).
  - `filingsFor` :877.
  - `theoryPropose` :910 — a candidate theory and remedy; a proposal only.
  - `availableActions` :1002 — the block escalation reads.
  - `evidenceBlock` :1018 — registered with publication for the evidence package.
- **Tables:** `filing_drafts`, `filing_approvals`, `filing_sendings`, `counsel_packets`, `counsel_packet_exports`, `theory_proposals` (`schema.mjs:12-83`).
- **Vocabularies:**
  - `FILING_BLANKS` (:57-71): counterparty_role, counterparty_body, act, act_date, standards, findings, governing_laws, law, clock, venue, venue_how, group, date.
  - `TIER_WORDS` (:92).
  - `COUNTED_FROM` (`dates.mjs:7`); `deadlineDate` counts calendar or business days with holidays.
- **Ops** (`filingsOps` :1071): `filingprepare`, `filingapprove`, `filingsent`, `counselpacket`, `counselpacketread`, `counselpacketexport`, `filingsfor`, `theorypropose`, `availableactions`. All routed.
- **Notable:**
  - `filingPrepare` does **not** need a determination. When there is none, the act, act_date, standards and findings blanks are left unfilled with why (:321). So it works for any action with a template.
  - The test profile's templates use `{{records}}` and `{{bylaw}}` (`jurisdictions/profiles/test-port-ellery.mjs:139,143`). Neither is in `FILING_BLANKS`, so they always stay unfilled and the member must edit them in before approval.

### 1.6 escalation — `src/escalation/` (1,421 lines of source; tests 1,463)
- **Files:** `index.mjs` 983, `checks.mjs` 219, `doc.mjs` 130, `schema.mjs` 89. Tests: `stages` 381, `invariants` 293, `open` 189, `exit` 181, `real` 127, `fixture` 292.
- **Services:**
  - `escalationOpen` :537 — needs a live determination with at least one noncompliant outcome (`NOT_NONCOMPLIANT` :558).
  - `escalationAttach` :595 — attaches an action at stages 2, 5 or 7.
    - The action must state `breach: true` and rest on this determination (`NOT_A_BREACH_ACTION` :612).
    - A stage-7 act needs one `ACCOUNTABILITY_PURPOSES` purpose and names only the pursued standards.
  - `escalationEvaluate` :662 — a member's reading of a response.
  - `escalationAdvance` :737 and `escalationDecline` :758 — take a proposed edge, or decline it, with a reason.
  - `escalationEnd` :777 — only when compliance is restored and the consequences are addressed.
  - `escalationSuspend` :815 and `escalationResume` :841.
  - `escalationRead` :408 — with the derived triggers and proposals (`#triggers` :208).
  - `escalationsDue` :864 — the open proposed edges, oldest first, at most 500.
- **Record:** an `escalation` document `ESC-…` in the determination's project, with an Escalation Log section (`doc.mjs`). **Tables:** `escalations`, `escalation_moves`, `escalation_evaluations`, `escalation_attachments`, `escalation_declines` (`schema.mjs:10-64`). States: open, suspended, ended.
- **Vocabularies:**
  - `STAGES` 1 documentation, 2 notification, 3 clock, 4 response_evaluation, 5 legal_tools, 6 sustained_attention, 7 political_accountability (:57).
  - `STAGE_TABLE` {1:[2], 2:[3], 3:[4], 4:[5,7], 5:[6,7], 6:[4], 7:[4]} (:60).
  - `ATTACHING_STAGES` [2,5,7] (:62).
  - `READINGS` = complied, partial, denied, none (:64).
  - `ACCOUNTABILITY_PURPOSES` = official_request, oversight_request, audit_request, testimony, enforcing_legislation (:66).
  - `JUDGMENT_KEYS` (:73) — refused keys.
- **Ops:** escalation publishes no op map. Its ten ops are written out in `store.mjs:3046-3068`: `escalationopen`, `escalation`, `escalationattach`, `escalationevaluate`, `escalationadvance`, `escalationdecline`, `escalationend`, `escalationsuspend`, `escalationresume`, `escalationsdue`. All routed.

---

## 2. Routing

- **Store dispatch:** `store.mjs:3038` spreads `actionsOps`. `:3042-3045` spread the standards, conformance, consequences and filings op maps. `:3046-3068` list escalation's ten ops by name. The instances are built on the Durable Object at `store.mjs:548` (actions) and `:582-586` (conformance, consequences, filings with its dependencies, escalation). Legacy wrappers are at `store.mjs:1223-1228`.
- **Control-plane declarations** (`control-plane/ops.mjs`): every one of the 45 layer-9 op names is in `OPS`.
  - Action ops: :171-183, :233-235.
  - The other layer-9 ops: :477-512.
  - Classes admin, member and probe; writes are `mutating: true`.
  - The per-module action and read sets are at :973-989.
  - Every act needs the `contribute` capability (:1476-1515).
  - The viewer stamp and fail-closed sight check apply to all layer-9 ops (`control-plane/index.mjs:2115`).
  - The author stamp on promote, including `actorViewer`, is at `control-plane/index.mjs:2849-2867`.
- **Unrouted services:** actions' `actionRead`, `actionsFor`, `pendingClocks` and `clockPropose`; monitoring's `deadlineRecheck` and `escalationsSeen`. Filings' `evidenceBlock` is reached through publication.

**Verdict:** everything a member needs is routed. The one exception is creating an action, which goes through the generic `op=promote`.

## 3. UI (`civicos-ui/app.html`, 26,551 lines; there is no `civicos-ui/src`)

- **Action surfaces exist**, on the legacy action loop (UI-19, UI-90, UI-104):
  - The act flows are `ACT_FLOW` at `app.html:10438-10460`: `actionmove` → `openActionMove`, `actioncorrespond` → `openActionCorrespond`, `actionlaws` → `openActionLaws` (the region around :10010-10132), `actionrisktier` → `openActionRiskTier` (:10144-10222).
  - `actionlawspropose` is mentioned once.
  - The action page reads `op=projection` (the derived block), `op=image`, `op=affordances` and `op=whoami` (:9440-9475).
- **Action intake** (`app.html:19435-19520`, "the outward ask, authored at intake") composes an action document and sends it through `op=promote`.
  - Kinds come from `vocabularies.action_kind`.
  - `request_for_comment` is filtered out whenever the plane does not publish `action_basis_kinds` (:19479-19482); affordances now does publish it (`affordances.mjs:569`).
  - **Probable break (by reading, not run):** the intake writes a named counterparty as `{state: named, name}` (`app.html:3369-3371`, :19983). actions' check now requires an office's `role` and `body` and refuses that shape `COUNTERPARTY_REFUSED` (`actions/index.mjs:447-455`). The UI's comment at :3332 still documents the old `{state, name}` shape.
  - The intake writes no `breach` field (the whole file has no "breach").
- **Missing surfaces:** there is **no** UI for standards, conformance or determinations, consequences, filings or counsel packets, escalation, `actionkinds`, `actionquotes` or `actionriskpropose`. None of their op names appear in `app.html`. The "determination" and "escalation" hits (:2062, :20508, …) are unrelated prose; "consequence" means the action's own outcome, not the consequences module.

## 4. Affordances and queue

- **Vocabularies:** `affordances.mjs` publishes the action vocabularies imported from actions (:83-88):
  - `action_kind` (PRODUCT_KINDS, or `vocabulariesFor(kinds)` with the profile's kinds, :517-521 and :664-671);
  - `action_basis_kinds` :569;
  - correspondence directions, stages and outcomes; resolutions;
  - `risk_tiers` with words :600.
- **Acts catalogue:** only four entries, all on type `action`: `actionmove` (when edges exist), `actioncorrespond`, `actionlaws`, `actionrisktier` (:1626-1650).
- **Rungs and reversibility only:** the rung table grades `actionmove`, `actionrisktier`, `consequencerevise`, `addressedrecord`, `escalationevaluate`, `escalationadvance`, `escalationdecline`, `escalationsuspend` and `determine` as "reasoned" (:716-751). It marks `actionlaws` and `escalationresume` "reversible" (:788-793).
- **Gap:** there is no act entry for standard, determination, consequence part, filing or escalation objects. `op=affordances` publishes no layer-9 act beyond the four action acts.
- **Queue** (`queue/index.mjs`): no producer for overdue action clocks, due escalations, filings awaiting approval, or anything else in layer 9. The item kinds cover governor, capture, stance, version, conclusion, export, notice, objective-gap, source-modified or removed, archive, monitoring-recheck, render-deferred and bias-debt. Queue options are `deriveActs` over affordances (:520-534), so an action subject gets only the four acts above. `queueAnswer` attaches `vocabulariesFor(kinds)` (:4152-4160).

## 5. Monitoring and scheduler

- **`monitoring/index.mjs`:**
  - `deadlineRecheck` (:1962-1996) marks passed `pending` clock entries `overdue` with one mechanical `deadline-recheck` promotion per action (actions `pendingClocks`, then promote at :2029). It then calls `escalationsDue`.
  - `actionCommitted` (:2046) is registered with `promotion.onCommitted` (:2086). After every action commit it asks `escalation.escalationsDue` and keeps the answer in memory (`#escalated`, `escalationsSeen()` :2054).
- **Gap:** **nothing calls `deadlineRecheck`.** The scheduler has no "deadline-recheck" consumer (`scheduler/index.mjs:41-160`: selection-sweep, task-drain, archive-monitor, connection-derive, overdue-scan (progressions), queue-renotify, monitor-cadence, ai-run-reap, and others). No op routes it; only `test/m/monitoring/understanding.test.mjs:97-184` calls it.
- **Gap:** `escalationsSeen()` is exposed by no op and feeds no queue item.
- **Mitigation:** overdue and triggers are also derived on read (`actionOverdue`, `actionFacts`, escalation `#triggers`), so `op=escalationsdue` and `op=escalation` answer correctly when asked. Nothing is pushed.

## 6. Skills and AI runs

- **One skill pack only:** `SKILL_PACK_ID = "investigative-session"` (`skillpack.mjs:155`, doctrine in `skilldoctrine.mjs`). There is **no Legal/Policy Lookup skill, no filing skill and no counsel skill**. The only mentions are requirement prose: `standards/index.mjs:13`, `checks/bio-checks.mjs:666`, `build/requirements/standards.md:37,64`.
- In `agent-worker/src`, "standard" means the evidence-strength standard (`subsession.mjs:189-270`), not a legal standard.
- **What an AI could reach:** machine credentials may call the proposal ops `standardpropose`, `comparisonpropose`, `actionlawspropose`, `actionriskpropose`, `theorypropose` and `filingprepare` (the preparer is labelled with `proposalLabel`). The capability for all of them is `contribute` (`control-plane/ops.mjs:1483-1515`). No skill or run template drives these ops.

## 7. Jurisdiction profiles (`jurisdictions/profiles/`)

- **Sections allowed** (`jurisdictions/index.mjs:16-18`): records_laws, standard_sources, counterparties (the offices), action_kinds (tier, laws, venue{name,how}, template, advisory), deadlines, legal_organisations, holidays. There is no separate `offices` or `venues` section.

| section | oakland-alameda (real, `test:false`) | test-port-ellery (`test:true`) |
|---|---|---|
| records_laws | 1: CPRA, Gov. Code § 7920.000 (D-149) | 3 (state, city, federal) |
| standard_sources | 3: OMC (M-24), Ordinances and Resolutions (M-24), Cal. Gov. Code (UNMEASURED) | 2 |
| counterparties | 5: Controller, City Council, Civil Grand Jury, City Auditor, State Controller; all UNMEASURED | 4 |
| action_kinds | 13; details in the list below | 3: records_request t2 (template and advisory), bylaw_complaint t1 (template), commitment_claim t3 |
| deadlines | 1: records_response, 10 calendar days + 14 extension, § 7922.535, UNMEASURED | 2 (business-day and calendar) |
| legal_organisations | 2: HJTA (assessment_challenge, taxpayer_action), First Amendment Coalition (constitutional_claim) | 1 |
| holidays | **absent** | 2026 and 2027 |

- **Oakland's 13 action kinds:**
  - records_request, tier 1, with a NextRequest venue;
  - grand_jury, controller_referral and media, tier 1;
  - public_comment, litigation_support, request_for_comment and other, with no tier;
  - records_petition, tier 2, with a court venue and an advisory;
  - assessment_challenge, taxpayer_action, consent_decree_motion and constitutional_claim, tier 3.
  - Source: `oakland-alameda.mjs:197-218`.
- **Key finding:** **no Oakland action kind has a `template`.** On the real instance, `filingPrepare` answers `KIND_NO_TEMPLATE` for every kind (`filings/index.mjs:377-381`). Only Tier 3 counsel packets are producible. Only the test profile has templates.
- A profile is active only if the installer bound `JURISDICTION_PROFILES` (`setup.mjs:2204-2220`, `newgroup/src/index.mjs:349`). With none bound, the kinds are only records_request, request_for_comment and other, and everything profile-derived is undetermined.

## 8. End to end: can a member run the chain today through ops?

| step | op(s) | routed | UI | prerequisite and breaks |
|---|---|---|---|---|
| declare standard | `standarddeclare` (or `standardpropose` then `standardadopt`) | yes | **no** | Needs content ids of the text (`contentmint`). |
| determine conformance | `determine` | yes | **no** | Needs a finding **published in a ratified case edition of the project**. The wire test had to plant those rows (`gate-reads.test.mjs:963-973`), so this rests on the case-authoring and ratification path. |
| record consequences | `consequencerecord`, `addressedrecord` | yes | **no** | Noncompliant outcome only. |
| create action | `op=promote` of an action document | yes (generic) | intake exists | The UI writes `{state: named, name}`, which the counterparty rule refuses. The UI cannot set `breach: true` (details below the table). |
| prepare filing | `filingprepare`, `filingapprove`, `filingsent`; or `counselpacket` for Tier 3 | yes | **no** | The tier must be stated first (`actionrisktier`). **Oakland has no templates**, so `KIND_NO_TEMPLATE`. Tier 3 packets work. |
| escalation | `escalationopen` … `escalationsdue` | yes | **no** | Attaching needs a `breach: true` action resting on the determination. Advancing is manual. Nothing notifies: no queue producer, and the deadline recheck is unscheduled. |

- **Breach actions through promote:** `build/jobs/T9/legacy-tests.md:46` recorded that a member session creating a `breach: true` action got `ACTION_NO_DETERMINATION`, because the viewer was read as the bare member id. The current code reads `pkg.actorViewer` first (`actions/index.mjs:568`), and the control plane stamps it on promote (`control-plane/index.mjs:2865-2867`). So this is probably fixed, but it is unverified: the wire test comment at `gate-reads.test.mjs:998-1000` still says "reported, not pinned", and the test avoids `breach: true`.

**Conclusion:** at the op level the chain is complete and routed. It breaks at four points:
1. **No UI for five of the six modules.** Only the action loop has surfaces, and its intake is probably out of step with the new counterparty rule.
2. **Filings on the real profile:** no templates, so no Tier 1 or Tier 2 draft can be prepared.
3. **Determination needs a ratified published case edition** of the same project, which is the upstream dependency.
4. **No proactive layer:** no scheduler consumer for `deadlineRecheck`, no queue items, no op for `escalationsSeen`, no affordance acts for layer-9 objects, and no skill that prepares standards, comparisons, theories or filings.

## 9. Actions not premised on a breach; actor roles; communications

- **Non-breach actions: yes.**
  - `breach` is optional; only `breach: true` needs a determination (`actions/index.mjs:588-590`).
  - The product kinds are `records_request` (with `law`), `request_for_comment` and `other` (`actions/checks.mjs:47`).
  - `request_for_comment` must name the specific inquiries it disclosed and a response window (DEC-13, `checks/bio-checks.mjs:3897-3911`).
  - `action_basis` legs may be `rests_on` or `advances`, onto any record bundle except another action.
  - Filings prepare a draft without a determination, leaving the determination blanks unfilled.
  - Only escalation insists on breach actions.
- **Actor role or group type: none on our side.**
  - Roles in the code are the **government counterparty's office** (`counterparty.role`, `body`, `level`; profile `counterparties` with `elected` and `oversight`), and the act's actor (role and body) in conformance.
  - The only group notion is `producing_group`, a setting that fills the filing `{{group}}` blank.
  - There is no group type, member role or organisation type anywhere in the six modules; a grep for group_type and actor_role finds nothing.
- **Communications and press outputs: none built.**
  - `media` exists only as a legacy action kind, and as an Oakland profile kind "media outreach", tier 1, with no template. There is no press release, statement or media artifact generator.
  - The outward texts that exist are filing drafts (from a profile template), counsel packets and their exports, and the evidence package's available-actions block (`filings/index.mjs:1002-1018`, `TIER_WORDS`, `COUNSEL_SENTENCE`).
  - Escalation stage 6 "sustained_attention" and stage 7 "political_accountability" are stages that attached actions serve. They generate no outputs.
