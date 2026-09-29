# Layer 9 (Action): inventory of the approved build state

Read-only inventory, 2026-09-29, of `/home/user/bio` at branch `claude/brave-johnson-5fqmix` (HEAD `5bb688333c`, K452). Every claim cites a file and an id. Abbreviations: **L** = `build/layers.md`; **RUL** = `build/rulings.md`; **MJ** = `build/modules.json`; `std/conf/cons/act/fil/esc.md` = `build/requirements/{standards,conformance,consequences,actions,filings,escalation}.md`; **jur/mon/pub/aff/que.md** = the same folder's jurisdictions, monitoring, publication, affordances and queue requirements; **NX** = `build/plan/next.md`; **T8/T11/T12** = `build/plan/archive/T8.md`, etc.

---

## 0. Status in one paragraph

Layer 9 was approved by Bob on 2026-09-26 (L "Layer 9, Action"; RUL K11–K14). All six requirement files were approved the same day with "Open for Bob: none" (K102). They were folded without any change of meaning on 09-27 (K171). Bob changed meaning once more, in K172: a determination with no recorded consequence is `undetermined`, so an escalation cannot end on it. Jurisdictions N130 was built first (K232). The six modules were then **built in T8**, in the order standards, conformance, consequences, actions, filings, escalation (K248–K257). T8 closed with suites standards 16/0, conformance 29/0, consequences 22/0, actions 30/0, filings 30/0 and escalation 27/0 (K257).

Follow-up work since then:
- **T9:** construction in the durable object and routing, 36 routes (N216, K307, K312). Filings and escalation were re-opened for sight leaks and migration (K267, K268, K316–K319).
- **T11:** codes, bounds and `noSuchAction` (K368–K371).
- **T12:** the shared-refusal helpers N309, N311 and N312 (K400–K402).
- **T14 (drafted):** carries only filings N331 (`build/plan/draft-T14.md`, layer 9).

The code is at `bio-plane/src/{standards,conformance,consequences,actions,filings,escalation}/`, about 9,400 lines, with tests in `bio-plane/test/m/<module>/` (MJ lines 65–70).

**Bookkeeping defect (measured).** Many requirements are still marked `*(not yet met: …)*` although the work was built:
- `actions.md` still marks R4–R11, R22, R28–R33, R40 and R41 (its Status line and the inline marks).
- T8 built all of them (T8 layer 9 "actions" bullet; K253 names `clockPropose`, `CLOCK_STATUS_NOT_MECHANICAL` and C-32.20/C-73.6/C-90.6/C-94.12/C-101).
- The code has every named service and code, and tests for them: `actionRead`, `actionsFor`, `pendingClocks`, `clockPropose`, `ACTION_NO_DETERMINATION`, `MACHINE_CANNOT_STATE_RECORDS_LAW`, `LIFECYCLE_TOKEN_MALFORMED`, `extent_capture`, `actionKinds` and `kinds()` (grep of `src/actions/`, `test/m/actions/`).
- K370 struck only the marks N-entries had added.
- The same staleness holds for monitoring R34/R35 (code: `monitoring/index.mjs` `deadlineRecheck`, `escalationsSeen`) and publication R36/R37 (code: `publication/index.mjs` `registerEvidenceBlock`, `publishedEditionsOf`).
- `NX` still lists N61, N129 and N130 under "Before layer 9", although T8 applied them (K232: "jurisdictions' marks lifted (R7, R23–R25, R28, R29, R31–R38 met)").

Treat these marks as stale, not as open work.

---

## 1. The six modules

### 1.1 standards (layer 9, first)

**Purpose.** A standard is what a government act is measured against: a statute, regulation, ordinance, court decision or order, adopted policy, or public commitment. The module holds each one as captured content in the record, with its citation, kind, issuer, source (matched to a profile's `standard_sources`, or undetermined) and the period it was in force. It answers which standards were in force at a date. It judges neither a government act nor a standard's merit (std.md Purpose; R12; Operational Principle 1). A standard belongs to the whole instance, as a bundle outside any project (std.md Suggestions; K171 (12)).

**Services.**
- `standardDeclare`: a member declares a standard (R1–R4).
- `standardRead`: one standard with its supersession links and text standing (R5).
- `standardsIn`: a filtered page, optionally the standards in force at a date (R8).
- `inForce(id, date)`: `in_force | not_in_force | undetermined` (R7).
- `standardPropose` / `standardAdopt`: a machine or member proposal, stored apart; a member adopts it (R9, R10).
- `noSuchStandard`: the one shared refusal helper (R17; N309).
- `standardsOf(host)`: the factory, which migrates at construction (R16; N220, N267).
- Ops: `standarddeclare`, `standard`, `standards`, `standardinforce`, `standardpropose`, `standardadopt` (T8 layer 11 legacy-index bullet).

**Record type.**
- Type: `STD-`, one state `recorded`, no edges (std.md Suggestions; K171 (1)).
- Fields: `cite` (at most 200 characters), `kind` ∈ {statute, regulation, ordinance, court, policy, commitment} (R1; jur R23), `issuer`, `text` (content ids, always required, R2), `period {from,to}` (null means "not stated", never "always"), `supersedes` (at most one successor, R6).
- Source answer: `{state: matched, source, kind, issuer, level, profile, basis}` or `{state: undetermined, why}` (Terms; R3).
- Proposal labels come from `proposalLabel(proposer,"standard")` (R9; K171 (2)).

**Not yet met.** None in the file. Uses notes that jurisdictions R23/R31 were "not yet met there", but those were met in T8 (K232).

**Open entries.** None specific. `NX` N61 is stale (applied T8).

**Rulings shaping it.**
- K102: a standard is held even when no profile matches, because the profile does not decide what law a group may hold its government to (R3). It is a record object (R15).
- K108 (5) / K171 (3): the match carries its `level`.
- K251: the code `MACHINE_CANNOT_DECLARE_STANDARD`.
- K369: `STANDARD_NO_ID`.
- K400: R17.

### 1.2 conformance

**Purpose.** A determination is the group's recorded judgment that a named government act is `compliant`, `noncompliant` or `unclear` against named standards, resting on **published findings**:
- A member determines. A machine only prepares the comparison (R13).
- A compliant determination carries exactly the obligations a noncompliant one does (R5).
- An unclear one names questions, each sent back to an existing or newly opened inquiry (R6).
- Significance is never ranked here (R8; K12) (conf.md Purpose).

**Services.**
- `determine`: records a determination (R1–R8, R18).
- `determinationRead`: one determination with its frozen and live strength and the `basis_changed` flag (R9, R10).
- `determinationsFor`: a filtered page. It is the read that consequences, actions and escalation use (R11).
- `comparisonPropose` / `comparisonRead`: a machine or member comparison, never an outcome (R12, R18).
- `noSuchDetermination`, `determinationSuperseded`: shared refusal helpers (R19, R20).
- Ops: `determine`, `determination`, `determinations`, `comparisonpropose`, `comparison` (T8 layer 11).

**Record types.**
- `CONF-` determination: one state `recorded` (K171 (1)). Ids `CONF-<y>-NNNN-determination`, `ACT-<y>-NNNN` and `CMP-<y>-NNNN` (K252).
- **Act:** `{id?, description, actor: {role, body}, at | period, evidence}`. The actor is an office, never a person. The first determination mints the `ACT-` id, and "the same act" means the same id (Terms; K171 (6)).
- **Outcome**, given **per standard** and never composed across standards (R4; K102): compliant | noncompliant | unclear.
- **Comparison row:** `{standard, requires, did, reading}` with reading ∈ {aligns, diverges, open}.
- Unclear questions: `{question, inquiry}`.
- Supersession needs a `reason` (R7).
- `live` holds until the determination is superseded. `basis_changed` is a notice only (R10).
- Caps: 50 findings, 50 standards, 200 rows, 20 questions, 50 evidence ids (R18; K249).
- The author must be a **joined participant** of the project (R1; `membership.projectAuthority(...,"joined")`).
- Every finding must be a member of a published case edition **of that project** (R2; publication R37).

**Not yet met.** None.

**Open entries.**
- N242: the DEC-49 guard share (`is-outcome-stated`, three-line regions).
- N249: `determination_questions.opened` shares a field name.
- N320: the null placeholder "an object you may not see". It waits on Bob's DEC-36 question, N303.
- N344/N345: DEC-76/77 contradiction PRESENT/RESOLVE changes touch conformance. Bob approves first.

**Rulings.** K12; K102 (determination after publication; per-standard outcomes); K171 (4)–(7), (10), (11); K249; K252; K264 (`determine` rung); K369; K375 (`determine` graded `reasoned`, via aff.md R2); K400.

### 1.3 consequences

**Purpose.** What a breach did, and to whom, recorded against **one standard's noncompliant outcome** of a live determination:
- Who or what is affected, the measure, and the period.
- Computed from the record where figures exist. Otherwise assessed by a member, with a rationale, or undetermined.
- Causation is a finding that needs evidence and is never assumed.
- It records whether each part has been **addressed**, which is escalation's exit check.
- No significance (cons.md Purpose; K12).

**Services.**
- `consequenceRecord`: R1–R5.
- `consequenceRevise`: records a successor (R6).
- `consequencesOf`: the parts, totals within one state, unit and currency, and the undetermined and unproven lists (R7).
- `addressedRecord` / `addressed`: R9.
- Factory `consequencesModule(ctx)` (K171 (17)).
- Ops: `consequencerecord`, `consequencerevise`, `consequence`, `consequencesof`, `addressedrecord`, `addressed` (T8 layer 11).

**Record type.** `CONS-` part, one state `recorded` (Suggestions; K171 (1)).
- **Affected** `{kind, description, role?}`. `kind` ∈ {class, fund, program, service, body, other}. There is **no person kind**: people appear as a class or as an office `{role, body}` (Terms; R10).
- **Measure** `{unit, currency?, value | range}`, unit ∈ {money, benefits, services, time, count}.
- **Part state** ∈ {computed, assessed, undetermined}:
  - computed: `basis {op ∈ sum, difference, count, product, ratio; operands = content ids}`. The module does the arithmetic, and the grade is the weakest of the operands' captures (R2).
  - assessed: a member's value with a rationale; a machine is refused (R3).
  - undetermined: never read as zero (R4).
- **Causation** ∈ {established (names an inquiry), unproven, not_applicable (zero measure)} (R5, R12; K283; N257).
- **Addressed** ∈ {addressed, not_addressed}, needing evidence. Overall it is `addressed` only when every live part is. With no parts it is `undetermined` (R9; K172).
- A machine may record a *computed* part only (R2; K102).

**Not yet met.** None (K370 struck 15 marks).

**Open entries.** N242 (codes minted outside their rows' regions); N320.

**Rulings.** K12; K102; K171 (7)–(9), (17); **K172 (Bob)**; K249 (3); K283 (1)/(N257) zero-consequence; K370; K401–K402.

### 1.4 actions (moved from layer 6; `from` legacy-store, legacy-checks)

**Purpose.** The Action object (State Rules v1.5 §4.4): what the group sends or does outside the system, to whom, why, under which laws, at what legal exposure, by when, and what came back. It holds:
- kind, risk tier, counterparty;
- the clock, where every deadline names its basis;
- basis legs, lifecycle and the correspondence ledger;
- the governing laws and the tier, as members' acts, with machine proposals stored apart;
- fee quotes and the records-request lifecycle;
- the action's **own** outcome (DEC-14), which is not the breach consequence.

A member decides every move (act.md Purpose).

**Services and ops.**
- The write check and projection registered with promotion (R1–R11).
- `actionFacts`, the pure projection for retrieval (R12).
- `actionMove` (`op=actionmove`, R13–R14).
- `actionCorrespond` (`op=actioncorrespond`, R15–R17): leased, append-only, and adds a `responds_to` edge.
- `actionLaws` / `actionLawsPropose` (R18–R19).
- The quote and lifecycle grammars (R20–R22).
- `actionRiskTier` (R23–R24).
- The projection block and `actionQuotes` (R25–R27).
- `actionRiskPropose` (R28).
- `actionRead` (R29), `actionsFor` (R30; filter `determination`).
- `pendingClocks` (R31, monitoring's read).
- `clockPropose` (R32, a clock entry from a profile deadline, stored apart).
- `RISK_TIERS`, `riskTierState`, `actionKinds` (R40); `kinds()` / `op=actionkinds` (R42).
- `noSuchAction` (R43).

**Record type.** An `action` bundle (Terms). Its document carries:
- `action_kind`;
- `risk_tier` ∈ {1, 2, 3, undetermined};
- `counterparty`;
- `clock[] {text, description, date, basis, status ∈ pending, met, overdue, waived}`;
- `action_basis[] {target, kind ∈ rests_on, advances, note?, date?, extent_capture?}`;
- `correspondence[]` (direction ∈ sent, received, no_response; capture **xor** a member's account, R15, R34);
- `governing_laws[] {level ∈ federal, state, county, city, citation}` (at most 12; R18; jur R31);
- `risk_tier_history[]`, `resolution` ∈ {complied, denied, escalated, withdrawn} (R7);
- `law` (records_request only; R4);
- `consequence` (the own outcome, R26);
- optional **`breach: true`** (R8).

Lifecycle: `planned → active | abandoned`; `active → awaiting_response | resolved | abandoned`; `awaiting_response → active | resolved | abandoned` (Terms).

Counterparty: `{state: named, role, body, level?, entity_id?}` or `{state: undetermined, basis}`. It is an **office, never a person** (R9; jur R24).

Kinds: the product's own `records_request`, `request_for_comment` and `other`, plus the active profiles' `action_kinds`. Anything else is `ACTION_KIND_UNKNOWN` (R10).

**Not yet met, as the file stands.**
- R4 (REC-201), R5 (D-689), R6 (D-695), R7 (D-717), R8 (layer contract), R9 (jur R24), R10 (no-jurisdiction rule), R11 (D-579), R22 (D-688), R28 (REC-215), R29–R32 (new services), R33 (the direction rule of the mechanical mark), R40 (N65 (3)), R41 (K102).
- **All of these are built and tested** (T8 plan; K253; K370; code grep). The marks are stale (§0).
- Live: R3 and R31 met (N237, N311; K401).

**Open entries.**
- N277: `pendingClocks`/`project` unbounded reads, partly overtaken by N311; `NO_RULE` shadows `clockPropose`.
- `NX` "Local facts still in code" (REC-201; legacy-checks' `cpra_request`), resolved in T8 by R10/R41.

**Rulings.**
- K102: **R8 binds breach actions only**. Evidence-gathering actions keep resting on inquiries and information. Product kinds are always offered. A counterparty is an office. The clock is proposed from the profile but only a member writes it (R32, R35).
- K108 (1): law levels.
- K247: retrieval joins its uses; R8 lazily through conformance.
- K253: built.
- K256: breach-step viewer bug found and fixed.
- K368: codes `ACTION_MOVE_NO_REASON`, `PENDING_CLOCKS_BAD_BEFORE`.
- K370, K401, K402.

### 1.5 filings

**Purpose.** What the group sends, prepared from the record:
- **Tier 1/2:** a filing pre-filled into the profile's template for the kind. Every filled blank names its source. Tier 2 carries the profile's advisory note.
- **Tier 3:** a **counsel packet** for counsel the group names. It holds facts with citations, a chronology, exhibits with provenance, the standards' text, candidate theories and remedies, and the claim deadlines. It is marked for counsel's review, is never published and is never fileable.
- Counsel drafts and files. The AI prepares; a member approves, files by the venue's own means, and records the sending.
- The instance transmits nothing (fil.md Purpose; R7; K13, K102).

**Services.**
- `filingPrepare` (R1–R5).
- `filingApprove` (R6).
- `filingRecordSent` (R7): writes one `sent` correspondence entry on the action and proposes the next state and clock entries.
- `counselPacket` (R8–R10, R12) / `counselPacketRead` / `counselPacketExport` (R11).
- `filingsFor` (R13, escalation's read).
- `theoryPropose` (R14).
- The evidence-package available-actions block, registered with publication (R15; pub R36).
- `availableActions({determination})` (R21).
- Factory `filingsOf`.

**Record types.**
- `FIL-`: a draft, then an approval (with SHA-256), then one sending.
- `CPK-`: a packet, versioned, flagged `basis_changed`, with its exports.
- Theory proposals.
- Tables are listed in the Suggestions.
- **Governing tier** is the stricter of the profile kind's tier and the action's tier. It is undetermined when the action's tier is, and then the filing is refused (Terms; R2; K102).
- **Filled blank** `{name, value, source}`, or `[UNFILLED: name]` (R3).
- Labels: `proposalLabel(...,"filing_draft"|"theory")` (R5, R14).
- Packet marking: "Prepared for review by … Not legal advice. Not for filing." It has no caption, venue, signature or prayer (R10).

**Not yet met.** R3's producing-group blank (N331).

**Open entries.**
- N331: `promotion.fact("producingGroup")`; uses gain promotion. **In T14** (`draft-T14.md`; `draft-T14-wordings.md` §7; K444).
- N320.

**Rulings.**
- K13 (Bob; amends DR 8).
- K102: stricter tier governs; no transmission; advisory is profile data.
- K108 (5): holiday calendar.
- K171 (13)–(14).
- K254: codes `FILING_NO_PREPARER`, `THEORY_NO_PROPOSER`.
- **K316/K319:** packet reads and `filingsFor` need sight of every drawn-on determination's project.

### 1.6 escalation

**Purpose.** The escalation protocol (DR 7 as amended):
- It runs from a live **noncompliant** determination to its end, in seven stages, each with an entry, defined acts and a trigger.
- A met trigger is **proposed** with its age, and a member advances or declines it with a reason. The canon's "mechanical" activation is amended by K102.
- It ends only when **compliance is restored** (a live `compliant` determination of the same act, for every standard pursued) **and consequences are addressed** (Operational Principle 6).
- It takes no position on policy (esc.md Purpose; R14; R19).

**Services.**
- `escalationOpen` (R1).
- `escalationRead` (R2, R3: triggers, proposals and exit, derived at `nowMs`).
- `escalationAttach` (R9).
- `escalationEvaluate` (R10).
- `escalationAdvance` / `escalationDecline` (R13).
- `escalationEnd` (R14).
- `escalationSuspend` / `escalationResume` (R15).
- `escalationsDue` (R16, monitoring's read).
- Factory `escalationOf`; ten services routed (T8 layer 11).

**Record type.**
- `ESC-`, with states `open`, `suspended`, `ended`, and edges open↔suspended, open→ended, suspended→ended (K171 (1); R21; K108 (3)).
- Tables: moves, evaluations, attachments, declines.
- Evaluation reading ∈ {complied, partial, denied, none} (R10).
- One open or suspended escalation per determination (R1). An action attaches to one escalation at one stage (R9).

**Not yet met.** None.

**Open entries.** N242 (unclassified outcomes); N320.

**Rulings.** K12; **K14 (Bob, stage 7; amends DR 7)**; K102; K108 (3); K171 (3), (15), (16); **K172 (Bob)**; K248 (5); K256; K267/K268 (migrates at construction); K316/K318; K402.

---

## 2. Cross-cutting

### (a) The layer contract and how strictly it gates

The contract says: "An action rests on a published finding and a standard held in the record; the group decides every act, the AI prepares and never files; compliance is recorded as carefully as noncompliance; every deadline names its basis" (L table row 9; L Layer 9 "Contract").

It is enforced **fully only on the determination chain**:
- `determine` refuses unless every finding is published by the project (conf R2, R14) and every standard is held and not out of force (R3).
- `consequenceRecord` needs a live determination's noncompliant outcome (cons R1).
- `escalationOpen` needs a live noncompliant determination (esc R1).
- `counselPacket` needs the action to rest on a live determination (fil R8).
- The available-actions block needs a published case with a live determination (fil R15, R21).

On the **action object** the contract binds only actions marked `breach: true` (act R8; K102 recorded in the R8 note). These are the actions escalation attaches at stages 2, 5 and 7 (esc R9).

**What can exist with no conformance determination and no published finding:**
1. **Every action without `breach: true`**, of any kind: the product kinds `records_request`, `request_for_comment`, `other`, and every profile kind. The first profile's kinds include `media` ("media outreach", Tier 1), `public_comment`, `grand_jury`, `controller_referral`, `litigation_support`, the Tier 2 `records_petition` and the Tier 3 kinds (`jurisdictions/profiles/oakland-alameda.mjs` 208–229). Such an action's legs may rest on `INFO`, `INQ`, `PROB` or `FOCUS` bundles, none of which need to be published. A leg may also name a determination (act R8, R1 C-2.10).
2. **Tier 1/2 filings for such actions.** `filingPrepare` requires only an open action with a governing tier of 1 or 2 and a template. The determination blanks are simply left `[UNFILLED]` (fil R1–R3). Only the Tier 3 counsel packet requires a determination (fil R8).
3. **Standards and comparisons.** They exist independently of any finding (std R1; conf R12: comparison before publication is inquiry work, K102).
4. A **`compliant` determination** exists, but nothing downstream consumes it except escalation's exit (esc R14). Consequences, escalation and the counsel packet all key on `noncompliant`.

Nothing in actions requires the author to be a joined project participant. Conformance, consequences and escalation do (conf R1; cons R1; esc R1). Actions check only that the author is a member and not a machine, plus visibility (act R13, R15, R33, R36).

### (b) Full vocabularies

- **Standard kinds:** statute, regulation, ordinance, court, policy, commitment (std R1, R12; jur R23).
- **Law levels:** federal, state, county, city. A legacy `local` reads as written (jur R31; K108 (1)).
- **Office levels:** state, county, city, district (jur R24).
- **Determination outcomes:** compliant, noncompliant, unclear, per standard. Comparison readings: aligns, diverges, open (conf Terms, R4).
- **Consequences:**
  - affected kinds: class, fund, program, service, body, other;
  - units: money, benefits, services, time, count;
  - ops: sum, difference, count, product, ratio;
  - states: computed, assessed, undetermined;
  - causation: established, unproven, not_applicable;
  - addressed: addressed, not_addressed; overall also undetermined (cons Terms, R2–R5, R9).
- **Action kinds:** product kinds `records_request`, `request_for_comment`, `other`, plus the profile's `action_kinds {kind, label, tier?, laws?, venue?, template?, advisory?, basis}` (act R10; jur R25).
- **Risk tiers:** 1, 2, 3, undetermined (never defaulted; D-182) (act Terms, R23, R25).
  - Tier 1: template, no advisory.
  - Tier 2: template plus advisory note.
  - Tier 3: no template ever; counsel packet only (fil R2, R4, R17; jur R25, R28 `TEMPLATE_TIER3`).
  - Governing tier is the stricter of kind and action (fil Terms).
- **Counterparty:** `{named: role, body, level?, entity_id?}` or `{undetermined: basis}`. It is an office, never a person. The profile offers `counterparties {role, body, level, elected, oversight?, basis}` (act R9; jur R24).
- **Action lifecycle:** planned, active, awaiting_response, resolved, abandoned.
- **Resolutions:** complied, denied, escalated, withdrawn.
- **Clock status:** pending, met, overdue, waived.
- **Basis-leg kinds:** rests_on, advances.
- **Correspondence directions:** sent, received, no_response (act Terms, R7, R13, R15).
- **Venue means:** portal, mail, email, in_person, court (jur R25).
- **Deadline:** `{rule, applies_to (kind | claim), days, count ∈ calendar, business, starts ∈ received, filed, act, known, extension?, citation}` (jur R26).
- **Filing kinds:**
  - Tier 1/2 filing draft, then approved, then sent (a `sent` correspondence entry);
  - Tier 3 counsel packet (versioned, exported, never published);
  - candidate theory proposals;
  - the available-actions block (fil R5–R15, R21).
- **Escalation stages** (esc Terms, R4–R12). Table of edges: 1→2, 2→3, 3→4, 4→5, 4→7, 5→6, 5→7, 6→4, 7→4.

| stage | entry | defined acts | trigger(s) out |
| --- | --- | --- | --- |
| 1 documentation | `escalationOpen` on a live noncompliant determination (R1) | the published findings and the determination | →2: the determination is live and the actor is an office (R4) |
| 2 notification | advance from 1 | a breach action addressed to the actor's office, attached (R5, R9) | →3: its ledger holds a `sent` entry |
| 3 clock | advance from 2 | a member-stated clock entry with its basis (`clockPropose` may propose one) (R6) | →4: after `sent`, a `received` or `no_response` entry, or the earliest pending clock is past. With no clock entry, it never triggers by time |
| 4 response_evaluation | from 3, 6 or 7 | a member's evaluation: complied, partial, denied, none (R7, R10) | →5 and →7 when the latest reads denied, partial or none. `complied` proposes nothing and points to exit R14 |
| 5 legal_tools | from 4 | breach actions attached with filings or counsel packets; available kinds by tier via `availableActions` (R8) | →6: an attached action is `sent`. →7: as stage 4 |
| 6 sustained_attention | from 5 | none of its own; monitoring watches clocks and responses (R11) | →4: a new `received` entry after the latest evaluation |
| 7 political_accountability | from 4 or 5 (K14) | attached breach actions, each with a purpose ∈ {official_request, oversight_request, audit_request, testimony, enforcing_legislation} and at least one pursued standard. `official_request` needs an office not marked `elected: false`; oversight and audit requests need one not marked `oversight: false` (R12) | →4: as stage 6 |

- **Exit** (R14): a live `compliant` determination of the same act for every pursued standard, **and** `consequences.addressed = addressed`. `undetermined` gives `CONSEQUENCES_UNDETERMINED` (K172). An escalation can be suspended or resumed but never withdrawn (R15). Policy advocacy and candidate support have no purpose value (R12; K14).
- **Escalation states:** open, suspended, ended.
- **Proposal labels:** machine_proposed, member_proposed, unstated, keyed governing_laws, standard, comparison, filing_draft, theory (K171 (2)).

### (c) What jurisdiction profiles must supply

These are the action sections, all optional. An absent section is answered as undetermined, never defaulted (jur R27; std R13; fil R20; esc R20; act R39).
- `standard_sources` (R23): each with `level` (R31).
- `counterparties` (R24): with `elected`, and `oversight` (unmarked means undetermined).
- `action_kinds` (R25): tier, laws, venue `{name, how, basis}`, template with named blanks (none on Tier 3), `advisory` (Tier 2 only).
- `deadlines` (R26): including `applies_to: claim` for the counsel packet.
- `records_laws` (R7): by law level.
- `LAW_LEVELS` (R31).
- `legal_organisations` (R32): `{name, evaluates (Tier 3 kinds), contacts}`.
- `holidays` (R33): a complete year, for business-day counts. A count into an unlisted year is undetermined.
- Validation codes: R28, R35. Combine rules (conflicting facts withheld): R29, R34.

The test profile supplies every section (R36). The first profile holds measured facts, with the rest marked `UNMEASURED`, and names HJTA and the First Amendment Coalition (R30, R36; K283 (2)). No module names a place (L "No jurisdiction in the product").

### (d) How monitoring, scheduler, queue and notifications consume layer 9

**Monitoring.**
- R34/R44: a mechanical `deadline-recheck` marks `pending→overdue` only, reading `actions.pendingClocks`, and "its action's members are told".
- R35: after an overdue mark or a response, it asks `escalation` (`escalationsDue`, esc R16). It never advances.
- Its uses gain actions and escalation (mon.md Uses; MJ line 72; L Layer 9 "Uses").
- The monitoring stage of escalation is stage 6 (esc R11).
- **Measured:** `monitoring/index.mjs` `deadlineRecheck` (1967) and `escalationsSeen` exist, but **nothing in `src/` calls `deadlineRecheck`**. Only `test/m/monitoring/understanding.test.mjs` does. So the overdue mark and the escalation ask are not wired into any tick on this checkout. `op=escalationsdue` is routed (`store.mjs` 3066). Of these, only the absence of a caller is a code finding; the requirements are satisfied at the module interface.

**Queue and notifications.**
- `escalationsSeen()` "names none of R31's four kinds; no item is minted from it until a kind is catalogued" (que.md Suggestions).
- `queuestate.mjs` has **no** kind for an overdue action clock or a due escalation.
- So "members are told" (mon R34) and a proposed stage reaching a member's queue have **no delivery path yet**. There is no open N-entry for it.
- Queue R17 attaches the action vocabularies (aff R26; act R42).

**Scheduler.** No layer-9 dependency. Its uses do not include actions or escalation (MJ line 73). It reaches monitoring only.

**Affordances.** Grades the layer-9 ops on the rung ladder (aff R2; K264, K309, K375). `risk_tiers` and `action_kind` come from actions (aff R26).

### (e) The AI/human boundary as stated

**A machine may:**
- propose a standard (std R9);
- propose a comparison, with rows and questions but never an outcome (conf R12);
- record a **computed** consequence part, labelled, with operands shown (cons R2; K102);
- propose a risk tier, governing laws or a clock entry (act R19, R28, R32);
- prepare filing drafts and counsel packets' candidate theories (fil R5, R14, R16).

The one machine write to a clock is the mechanical `deadline-recheck` pending→overdue (act R33; mon R44).

**A machine may never:**
- declare a standard (std R11);
- determine (conf R13);
- assess or address a consequence (cons R3, R9);
- move an action, correspond, set a tier, laws or a records law, or edit the clock (act R33);
- approve, send, name counsel or export (fil R16);
- open, attach, evaluate, advance, decline, suspend or end an escalation (esc R17).

Escalation proposals are the protocol's derivation, "never an act" (esc R17). Significance, severity, priority, urgency and scores are refused as inputs and absent from answers (conf R8; cons R11; esc R19; K12). The Escalation Protocol skill explains; a member acts (esc Suggestions).

---

## 3. Test against the product owner's new framing

| framing element | modelled? | evidence |
| --- | --- | --- |
| **Different actor/group types** (activists, journalists, lawyers, auditors, unions) | **No.** One instance is one producing group (instance-setup Purpose). Members differ only by `admin` role, capabilities `contribute`/`publish`/`create_projects`, and declared expertise (membership R4, R12). No group type or actor type exists anywhere in `build/requirements/` (grep for journalist, lawyer, auditor, union, activist, press: no hits). Lawyers appear only as **external named counsel**, "not a member of the instance" (fil R8, R11; Decided by BOB), and as profile `legal_organisations` (jur R32). Auditors appear only as a **counterparty office** marked `oversight` (jur R24; esc R12). | membership.md R4; fil.md; jur.md |
| **Roles within a group for acting** | **No.** Every layer-9 act is open to any non-machine member. Conformance, consequences and escalation also require a joined participant; actions do not (conf R1; cons R1; esc R1; act R13). Layer-9 routes all need `contribute` (K312). "Any joined participant" may record a consequence addressed (cons Suggestions; K102). No spokesperson, legal lead, approver or reviewer role exists. | RUL K312; cons.md Suggestions |
| **Several actions per finding** | **Yes, indirectly.** Actions hang off a determination, not a finding directly. `actionsFor({determination})` lists many (act R30). Stages 5 and 7 attach several breach actions (esc R8, R9, R12). A determination rests on at most 50 findings (conf R18), and several determinations may cite the same finding. Limits: one open escalation per determination (esc R1), and one escalation and one stage per action (esc R9). | act R30; esc R9 |
| **Actions not premised on a breach** (success story, recognising compliance) | **Only as a gap in the rules, not as a concept.** An action without `breach: true` needs no determination (act R8; K102). Conformance records `compliant` "as carefully" (conf R5; L contract), but **nothing acts on a compliant determination** except escalation exit (esc R14). No kind, purpose or template exists for commending or recognising compliance. Consequences, escalation and the counsel packet are all noncompliant-only (cons R1; esc R1; fil R8). A "recognition" action would have to use kind `other` with a `rests_on` leg to the determination, and no rule or vocabulary supports it. | act R8, R10; conf R5 |
| **Communications, press and public stories vs filings** | **Weakly.** The first profile has a `media` kind ("media outreach", Tier 1) and `public_comment`, as **data** (profiles/oakland-alameda.mjs 213–214). But the counterparty must be a government office (act R9; jur R24), so a newspaper or journalist cannot be addressed as a counterparty. Correspondence is the ledger with the counterparty only (act R15). Filings cover only templated submissions and counsel packets (fil Purpose). Publication publishes signed case editions (evidence packages) and has no audience, press-release or story construct (pub.md; grep). Stage 6 has no acts of its own (esc R11), and stage 7's purposes are governmental (esc R12). | act R9; esc R11–R12 |

**Plainly:** the approved layer-9 requirements model **one group, one kind of member, acting against government offices, on a breach**. Breach-free actions are tolerated but unmodelled. Actor types, roles within a group, recognition of compliance, and outward communication to press or public are **not in the requirements**. Adding them would be a requirements and architecture change, which is Bob's to make (CLAUDE.md P17).
