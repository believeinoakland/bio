# Draft: T45 requirement text for the actions fold, lower layers (L1, L2, L5, L6) — for BOB's review

Sources (read whole): `REQUIREMENTS-HANDOFF.md`, `canon-draft/BIO_Action_v0_2.md`, `DESIGN.md` (§2, §10, §11 and the sections they cite), `research/S1-synthesis.md` §C–§E (all on `origin/design/actions`); `build/plan/next.md`; `build/requirements/README.md`; the requirement files of project-roster, membership, standards, duties, local-facts, steps, reading-guides, jurisdictions, agent-worker, ai-runs, skills; the public parts of provenance (R28, R48), run-rules (R14–R22), action-plans (R21, R29–R34), ai-use, credentials (R54–R56), content, Design Requirement 8. Code read only for sizes and the first profile's kinds.

Next free ids: project-roster **R21**, membership **R128**, standards **R52**, duties **R30**, local-facts **R10**, steps **R29**, reading-guides **R13**, jurisdictions **R74**, agent-worker **R76**, ai-runs **R77**, skills **R45**.

Cite form for every change: "(T45; N<entry>; Actions D<n>; v0.2 rule <n>)". Every new or amended text ends *(not yet met: T45)*. Every refusal named below is tested with a negative control (the same call without the refusing condition lands).

---

## 1. project-roster (L2) and membership (L2)

**Which module.** `membership` holds the visibility setting, the fence and sight; `project-roster` holds the owners' acts after setup. The three project lines (counsel matter, a member's own project, the second-approval setting) are acts on a project's settings by its people, so they go to **project-roster** (895 lines), with one guard seam in **membership** (3,693 lines, near the 4,000 split mark, K617: it gains only the seam). The departure line needs nothing new in L2 (see 1.4).

### 1.1 project-roster — new

- **R21** (T45; N892; Actions D4, D11a; v0.2 rules 9, 15) `projectScopeSet({projectId, scope, reason, by, viewer})` (`op=projectscopeset`) records a project's scope: `counsel_matter` (a counsel matter: its members alone see its correspondence and dates; never published or used as evidence), `own` (a member's own hidden project: her source role, and her own text with its evidence check, kept there) or `none` (removing a scope). After the Terms' sight answers, refusals in order, each writing nothing: `PROJECT_ACT_NOT_A_PARTICIPANT` (`membership` R55 `joined`); `PROJECT_SCOPE_UNKNOWN`; `NO_REASON` (absent, blank or over 2,000 characters); `PROJECT_SCOPE_NEEDS_HIDDEN` when the project's setting is not `hidden` (`membership` R85); for `own`, and for removing `own`, `PROJECT_SCOPE_OWN_NOT_SOLE` unless `by` is an owner and the project's only participant in any state; `PROJECT_SCOPE_UNCHANGED` when `scope` is the current one. Otherwise it appends `{scope, reason, by, at}`; the latest record is the scope; a project with none is `none`. Every participant reads the history (R6's form). A scope changes nothing already published, sent or cited: it is read at the act that would publish, cite or send, never applied to an earlier one. *(not yet met: T45)*
- **R22** (T45; Actions D4; v0.2 rule 15) At start this module registers once in `membership`'s project-act guard (`membership` R128). Its guard refuses, writing nothing: an invitation (`membership` R32) to a project whose scope is `own`, `PROJECT_SCOPE_OWN`; setting `discoverable` (`membership` R45) on a project whose scope is `counsel_matter` or `own`, `PROJECT_SCOPE_KEEPS_HIDDEN`. R5's rescue of a project whose scope is `own` is refused `PROJECT_SCOPE_OWN` before its own refusals but `NOT_AN_ADMIN`. Controls: each act lands on a project of scope `none`. *(not yet met: T45)*
- **R23** (T45; Actions D4; v0.2 rule 15) `projectScope(projectId)` answers `{scope, since, by}` (`since` the instant of the latest record), `{scope: "none", since: null, by: null}` for a project with no record and for an id that names no project. It asks no viewer (it states only the scope, as `membership` R85 states only the setting; its callers gate by sight), writes nothing and never throws. Read by `promotion`, `publication`, `docket`, `case-account`, `actions` and `filings` (see 9). *(not yet met: T45)*
- **R24** (T45; N890; Actions D27 B; v0.2 rule 20) `projectApprovalSet({projectId, needs, reason, by, viewer})` (`op=projectapprovalset`) records which acts need a second member's approval before sending. `needs` is a list, each entry exactly one of `{kind}` (an `action_kinds` kind of the active profiles' view, `jurisdictions` R25), `{tier}` (1, 2 or 3) or `{public: true}` (an act whose audience is the public); `[]` restores the default, one member approves. Refusals in order, each writing nothing: `NOT_THE_OWNER` (an owner of the project; administrators and the founder included, as R3); `APPROVAL_RULE_INVALID` naming the entry; `APPROVAL_KIND_UNKNOWN` for a kind the view does not hold; `NO_REASON`. It appends `{needs, reason, by, at}`; the latest governs; every participant reads the history. `secondApprovalNeeded({projectId, kind, tier, public})` answers `{needed, matched}`, `matched` the entries that apply; a `tier` that is null or undetermined matches every `{tier}` entry (an undetermined tier is never read as Tier 1, v0.2 §6). It is a project setting, never a member attribute: no entry names a member. Never throws. Enforcement at approval is `filings`' (see 9). *(not yet met: T45)*

Invariants: **R18** amended: (T45) the scope records (R21) and approval settings (R24) are keyed by project and cleared with it. *(not yet met: T45)*

Tests: R21 each refusal with control (a hidden project accepts `counsel_matter`; a discoverable one is refused); `own` refused with a second participant; history read by a participant and not by an outsider (absent answer). R22 the three refusals, each with a `none` control. R23 an unknown id answers `none`. R24 an undetermined tier matching `{tier: 2}`; `[]` answering `needed: false`.

Uses: gains `jurisdictions` (L1, `combine`, R24's kinds) and `record-core` `getSetting` (the active profiles; existing edge). Both earlier.

### 1.2 membership — new

- **R128** (T45; Actions D4; v0.2 rule 15; R125's form) `registerProjectActGuard(module, fn)`: one later module (`project-roster`, its R22) registers once at start; a malformed registration is refused `LISTENER_MALFORMED` and a second, whoever makes it, `LISTENER_DECLARED` naming the holder, both through R81. R32 and R45 call `fn({act, projectId, by, setting?})` (`act` `invite` or `visibility`) synchronously inside their act, after their own refusals and before any write; a refusal it answers is answered unchanged and nothing is written; null lets the act proceed; a guard that throws or answers anything else refuses `PROJECT_GUARD_UNCHECKED` (fail closed, as R124). With none registered the acts proceed as today. This module never reads another module's tables to decide it. *(not yet met: T45)*

Size: about +40 lines on 3,693; under 4,000. `project-roster`: about +350 on 895.

### 1.3 Where the scopes are enforced (owed, see 9)
"Never published or used as evidence" is enforced through project sight and R23 at the producers: `promotion` (a leg or citation naming a bundle of a `counsel_matter` project refused), `publication` and `docket` (nothing of such a project in a case, edition or docket entry), `actions` (R66's published record of actions leaves out a counsel matter), `case-account` (the advocacy evidence check runs only over text held in an `own` project and stores nothing outside it). Packets' privilege marking is `filings`'.

### 1.4 Departure notice
No L2 change. The producer (`queue-producers` R15–R18) reads who left from what L2 already states: a removal (`membership` R120's `project_removals`) and a member's status `revoked` (R120's `members`, R79's notice). Its "owners told once" is queue-producers' requirement.

---

## 2. standards (L5)

- **R52** (T45; Actions D7; v0.2 §3 Standard) A spoken commitment is a standard only once confirmed in writing or stated publicly. R1 and R10 refuse `COMMITMENT_AS_HEARD`, naming the content ids, a standard of kind `commitment` held `text` whose every text content id is an extent of a member's authored observation (`provenance` R28; `register.authored` 1, its R48 read contract), and one held `cited` whose `cited_by` is such an extent; nothing is written. A commitment with at least one text row from another capture (the body's letter, its minutes, a recording or its own publication) is held as before. A proposal (R9) of such a commitment may be stored, labelled, and cannot be adopted (R10 refuses it so). Members' "as heard" accounts stay their own observations. Control: the same declaration naming the body's letter lands. *(not yet met: T45)*
- **R53** (T45; Actions D7; v0.2 §3 Standard; `membership` R125's form) `registerOwnSendingCheck(module, fn)`: one later module (`actions`) registers once at start, through `membership.listenerRefusal`. R52 also refuses `COMMITMENT_OWN_LETTER` a `commitment` whose every text row is of a capture `fn({captureSha})` answers is the group's own sending (its confirming letter is not the body's confirmation); a check that throws or answers anything but true or false is read as true for that capture (fail closed). With none registered only R52's authored test applies. *(not yet met: T45)* — see Doubt 14.

The silence after the group's confirming letter is a dated fact recorded on that letter's action (`actions` / `action-clocks`: "Noticed: no reply recorded by <date>"), not here (owed, 9).

Tests: R52 refusal for all-authored text and for an authored `cited_by`; control with one non-authored row. R53 a registered check answering true refuses; false lands; a throwing one refuses.

Uses: `provenance` (existing edge; its R48 `register.authored`). No new edge.

Size: 3,339 lines; about +80. Under 4,000.

---

## 3. duties (L5)

- **R30** (T45; Actions D7; v0.2 rule 16; COURTS L3) `proposeFromResponse({kind, arisingIn, quote, obligor, performance, standard?, standardProposal?, by})` composes a proposal (R2: stored apart, labelled, tracked only once a member adopts it with `adopt`) of one duty from a body's reply or a report. `kind` is `promise` or `required_response` (`RESPONSE_KIND_UNKNOWN`); `arisingIn` the held capture of the reply or report (R4); `quote` an extent of that capture (`content`'s extent refusals; `RESPONSE_EXTENT_NOT_IN` for an extent of another capture), held as the duty's quote, never paraphrased. For `promise`: time basis `commitment`; trigger `date`, the whole calendar date the quote states (`PROMISE_DATE_UNREAD` when it states none, kept as written, never completed, R28's rule); source a held standard of kind `commitment` (`standard`; `standards` R52 applies) or `standardProposal`, a `standards` R9 proposal, in which case `adopt` is refused `DUTY_SOURCE_NOT_HELD` until that proposal is adopted as a standard, the duty then naming the adopted standard. For `required_response`: source `court` (the report held as a standard, R1); time basis `rule` with the profile's deadline for that office (R5) where the active view holds one, else the due date `undetermined`, never defaulted. R1's and R29's refusals apply. *(not yet met: T45)*
- **R31** (T45; N855; Actions D6d; v0.2 rule 17) `dutiesArisingIn({captures, asOf, viewer})` answers the adopted, unwithdrawn duties whose `arising_in` is one of `captures` (1–200 ids; `NO_AS_OF` without `asOf`), each with its occurrences' states as R9 derives them as of `asOf`, and `all_met`, true exactly when there is at least one such duty and every one has at least one occurrence and every occurrence reads `met` or `met_late`. Sight is R22's; a duty the viewer may not see is neither answered nor counted, and `all_met` is answered over the visible ones only with `partial: true` when any was left out. Writes nothing. (Read by `monitoring` for v0.2 rule 17's once-only watch question.) *(not yet met: T45)*
- **R23** amended: (T45; N882; Actions D15; v0.2 rule 6; K1431) The basis kinds of a duty are the four of the Terms. The fifth K1431 gains, the other side's stated deadline, is a deadline on the group, as are the group's own obligations to a venue (service, filings, contact reports, a requester's own deadlines): both are `action-clocks`' own deadlines, never duties here. R1 refuses that kind `UNKNOWN_BASIS_KIND`, naming the four (its spelling is `civil-time`'s, owed). Control: `commitment` accepted. *(not yet met: T45)*

Tests: R30 a promise with a stated date (control) and with "by spring" (`PROMISE_DATE_UNREAD`); adoption refused while the standard proposal is unadopted, accepted after; a required response with and without a profile rule. R31 `all_met` true, false, and with a duty withdrawn. R23 the fifth kind refused.

Uses: no new edge (`standards`, `content`, `jurisdictions` held).

Size: 1,939 lines; about +200.

---

## 4. local-facts (L5)

Two changes: per-office time zones, and **member-drafted jurisdiction rules** (`jurisdictions` is pure and holds no store, R17; this module already records members' acts on profile facts, so a group's own rule lives here).

- **R6** amended: (T45; N858; Actions D8; v0.2 rules 6, 11) `factPath` takes `fact: "time_zone"` with `office` (a counterparty's `role` and `body`, or a venue's `kind`) for an office's own zone (`jurisdictions` R74), a path apart from the profile's zone. `governingPath` for `time_zone` answers the office's own path when the profile holds one, else the profile's, saying so. *(not yet met: T45)*
- **R3** amended: (T45; N858) An office's own time zone lapses as the profile's does (183 days); a day for an office fact is that office's local day when the profile holds its own zone. *(not yet met: T45)*
- **R10** (T45; N858; Actions D8; v0.2 rule 11) `ruleDraft({section, entry, source, reason, by, viewer})` (`op=ruledraft`): a member drafts a jurisdiction rule from its primary source. `section` is `deadlines` (`jurisdictions` R26) or `legal_facts` (`jurisdictions` R79); `entry` is valid as that section's entry (`jurisdictions.validate` over a profile holding it alone, its `basis` and `status` supplied here); `source` a held capture extent of the primary source (`{captureSha, extent}`). Refusals in order, each writing nothing: `MACHINE_CANNOT_DRAFT_RULE` (a machine or unstamped `by`); `RULE_SECTION_UNKNOWN`; `RULE_ENTRY_INVALID` with `validate`'s errors; `RULE_NO_SOURCE` (`content`'s extent refusals, an unseen capture answered as absent); `RULE_IN_PROFILE` when the active profiles' view already holds an entry under the same key (a deadline's `rule` and `applies_to`; a legal fact's `key`), naming it (the route is R1's dispute and R13's offer); `NO_REASON`. Answers `{ok, rule, state: "drafted"}`. *(not yet met: T45)*
- **R11** (T45; N858; Actions D8; DESIGN §10; v0.2 rules 10, 11) `ruleConfirm({rule, statement?, by, viewer})` (`op=ruleconfirm`) by a member other than its drafter. Refusals in order: `MACHINE_CANNOT_CONFIRM`; `NO_SUCH_RULE`; `RULE_SELF_CONFIRM`; `RULE_NOT_DRAFTED` (confirmed or withdrawn); when the rule's tier is 2, 3 or undetermined (the tier of the `action_kinds` kind its `applies_to` names in the active view; a `claim` rule, or a kind with no tier, read as undetermined), `RULE_NEEDS_QUALIFICATION` without `statement` (1–500 characters, the confirming member's professional qualification in her words). For a Tier 1 rule no statement is asked and one given is not recorded. The statement is recorded on that confirmation only, as an attestation of that one act: it is answered only with the rule (R12's read of that rule), never by a read keyed by member, never counted, never in any view or offer (R13), and no other module reads it. The rule applies in the group from the confirmation. *(not yet met: T45)*
- **R12** (T45; N858; v0.2 rule 11) `groupRules({section?, viewer})` answers the group's rules with their state, source, drafter, confirmer, dates and (confirmed with one) the statement, to a viewer naming a member. `governingView()` answers `jurisdictions.combine`'s view of the active profiles with each confirmed, unwithdrawn group rule added to its section, tagged `profile: "group"` and a `basis` naming the rule's id and confirmation date (no statement, no handle). With no group rule it equals `combine`'s view. Writes nothing; never throws. `action-clocks`, `filings`, `actions` and `duties` (R5) read this view for those sections in place of `combine` (owed, 9). *(not yet met: T45)*
- **R13** (T45; N858; v0.2 rule 11) `ruleWithdraw({rule, reason, by, viewer})` by any member (`NO_SUCH_RULE`; `NO_REASON`; a repeat answers `already: true`), kept, never deleted, the rule leaving `governingView` from then on. `ruleOffer({rule, by, viewer})` answers, for a confirmed rule, its entry, primary source and `confirmed: {at, with_statement: true|false}` as canonical bytes with their digest, for a member to carry to the shared profile's maintainers; it never carries the statement's words or a handle, and the instance transmits nothing (R2's report rule). *(not yet met: T45)*
- **R14** (T45) R5 and R9 hold for the rules' table: append-only, declared through `record-core.declareTable`, `sight: "group"`, purged with the store; a machine never drafts, confirms or withdraws (an assistant's draft reaches a member as labelled run output and enters only by her R10 act). Rows of R10–R13's codes join this module's family C-126. *(not yet met: T45)*

Tests: R10 each refusal with control; `RULE_IN_PROFILE` against the test profile. R11 self-confirm refused; a Tier 2 rule refused without a statement, accepted with one; a Tier 1 rule's given statement not recorded; no read keyed by member returns it. R12 `governingView` holding a confirmed rule and not a drafted or withdrawn one; equal to `combine` with none. R13 offer bytes without the statement.

Uses: gains `content` (L4: a source extent) — earlier. Existing `jurisdictions`, `record-core`, `membership`.

Size: 769 lines; about +450, to about 1,200.

---

## 5. steps (L6)

- **R29** (T45; Actions DESIGN §2.6; v0.2 rule 6; S1 §C 1) One date, one reminder. `registerDueHolder(module, fn)`: one later module (`action-clocks`) registers once at start (`membership.listenerRefusal`). `fn({step, byWhen, waits})` answers null or `{entry}` when that module holds the same date as an action's clock entry. `stepsDue` (R12) leaves out a step whose `byWhen` a holder answers held, and every read of a step (R4) answers `by_when_held: {module, entry}` beside `byWhen` (null when not held). A holder that throws or answers anything else is read as not held, so the step's own item stays. Control: with no holder, R12 answers as today. *(not yet met: T45)*
- **R30** (T45; v0.2 rule 6) `stepsWaitingOn({kind, id})` (in process, for `action-clocks`) answers the steps with an arrival wait (R11) on `{kind, id}`, each `{step, byWhen, state}`, at most 200 with `truncated`; never answered to a member; writes nothing. *(not yet met: T45)*

Uses: none new. The edge **`action-clocks` → `steps`** is action-clocks' (L9 → L6, earlier: allowed).

Size: 1,651 lines; about +80. Under its own 2,500 mark.

---

## 6. reading-guides (L6)

Civicsmith's procedure guides are profile data (`jurisdictions` R80, below: no place in product code, reading-guides R11). A group's own procedure guides live here, a second purpose beside reading guides.

- **R13** (T45; N858; Actions D8; v0.2 rule 11) A guide may have `purpose` `procedure` (a reading guide's is `reading`, the default): `kind` an `action_kinds` kind of the active profiles' view (`GUIDE_KIND_UNKNOWN` otherwise), each item `{route, expect?, citation}`, `route` and `expect` short plain strings, `citation` required (`GUIDE_ITEM_UNSOURCED`). R2, R3, R6–R8 and R12 hold for it. R4's check for a procedure guide applies only its op form, its party-to-conduct list and `skills` R16's control-flow check (a procedure names acts and duties, "send", "must", by nature); its look-for opening and its act and rule words do not apply. `procedureGuidesFor({kind, viewer})` answers the profile's guide for `kind` (from `combine`, `jurisdictions` R80) first, then the group's approved procedure guides in the order approved, each with its origin; no rank, score or preferred route; every answer carries `label` keyed `guide.procedure.legalinfo` (canon's words, v0.2 rule 11: "legal information, not legal advice"). Never throws. *(not yet met: T45)*

Tests: a procedure item without a citation refused (control: with one); an item naming "assistant" refused; "must respond within 10 days" accepted for a procedure and still refused for a reading guide; the profile's guide before the group's.

Uses: gains `jurisdictions` (L1, `combine`) and `record-core` `getSetting` — earlier.

Size: 949 lines; about +150.

---

## 7. jurisdictions (L1: the profile schema)

Every new field carries `basis` (R2) and, where it is a legal or calendar fact, `status` with a sourced basis (R44: never `UNMEASURED`). Absent reads undetermined (R27).

- **R74** (T45; N858; Actions D8; v0.2 rule 6; S1 §C 18) A counterparty (R24) or a kind's `venue` (R25) may carry `time_zone` (R41's form and status), the office's own zone; dates for that office are its local days. In `combine`, one value per key under `role` and `body`, or the venue's kind (R15). *(not yet met: T45)*
- **R75** (T45; N882; Actions D15; v0.2 rule 6; S1 §C 15, §C 18) A `deadlines` entry (R26) may carry `owed_by`, `body` or `group` (whose duty the deadline is; absent, undetermined), and `consequence`, `{text, citation}`, the law's stated consequence quoted ("deemed denied", "considered withdrawn"). `starts` gains `third_party` with `starter`, a counterparty's `role` and `body` whose act starts the count (a ruling authority's decision). Malformed: `VALUE_INVALID`; an unknown starter `ANCHOR_UNKNOWN`. In `combine`, each is one value per key under `rule` and `applies_to`. *(not yet met: T45)*
- **R76** (T45; N858; v0.2 §5, rule 11; S1 §D 15, §C 18) A `records_laws` entry (R7) may carry `stages`, `[{stage, label, citation}]` in the law's order, `stage` a product stage name (`^[a-z][a-z0-9_]*$`; whether `action-grammar` knows it is that module's check), `label` the law's own term; a stage the law lacks is absent (no fee-waiver stage under a law with none); absent, which stages the law has is undetermined. It may carry `requesters`, `{text, citation, status, basis}`, who may request under it. Malformed: `VALUE_INVALID`. One value per key under the law's `name` (R15). *(not yet met: T45)*
- **R77** (T45; v0.2 rule 16; S1 §C 11) A `response_statuses` entry (R58) may carry `applies_to`, a kind of the profile (absent: every kind; `KIND_INVALID` for a kind the profile lacks), the statuses in which a venue of that kind reports (a grand jury's required responses). Unioned in `combine`. *(not yet met: T45)*
- **R78** (T45; Actions D9; v0.2 rules 12, 13; S1 §D 16) R32 amended: `evaluates` lists kinds of Tier 2 or 3 (`ORG_KIND_UNKNOWN` for a Tier 1 or unknown kind), and may be empty when the entry carries `defends: true`, an organisation that advises a group facing legal pressure against itself (a defamation claim, an anti-SLAPP motion, a subpoena); an entry with neither is refused `ORG_PURPOSE_MISSING` (a new code beside R35's). *(not yet met: T45)*
- **R79** (T45; N858, N861; Actions D8, D11; v0.2 rules 9, 11) `legal_facts`: `[{key, trigger, statement, citation, threshold?, applies_to?, status, basis}]`, the legal facts shown with their citations at the moment they matter. `key` `^[a-z][a-z0-9_]*$`, none twice; `trigger` one of the frozen exported `LEGAL_FACT_TRIGGERS`: `paid_attendee`, `recording`, `threat_letter`, `pending_measure_or_candidate`, `serial_meeting` (a new trigger is a requirement change); `statement` the fact in plain words; `threshold` `{amount, unit}`; `applies_to` kinds. Malformed: `VALUE_INVALID`, a trigger outside the list `TRIGGER_UNKNOWN`. A known section; one value per key under `key` (R15). Detecting a trigger is the consumer's (`actions`, `filings`). *(not yet met: T45)*
- **R80** (T45; N858; Actions D8; v0.2 rule 11) `procedure_guides`: `[{kind, items: [{route, expect?, citation}], status, basis}]`, one sourced procedure guide per `action_kinds` kind, items in the profile's order with no rank field; each item's `citation` required. Malformed: `VALUE_INVALID`; a kind the profile lacks `KIND_INVALID`. One value per kind (R15). *(not yet met: T45)*
- **R81** (T45; N858; Actions D8; v0.2 rule 11) An `action_kinds` entry may carry `templates`, a list of R40 templates each with `purpose` (`^[a-z][a-z0-9_]*$`, none twice in a kind: `initial`, `immediate_disclosure`, `follow_up`, `reconsideration` …), so a kind holds its Tier 1 set; R25's single `template` reads as `templates` of one with purpose `initial`; R28's `TEMPLATE_TIER3` applies to each. One value per key under kind and purpose (R15). *(not yet met: T45)*
- **R82** (T45; N858; Actions D8; v0.2 rule 11; S1 §E) A kind's `venue` may carry `facts`: `[{fact, value, amount?, citation, status, basis}]`, `fact` one of the frozen `VENUE_FACTS`: `how_to_submit`, `anonymity`, `publishes`, `public_listing`, `speaker_limit`, `comment_cutoff`, `page_limit`, `interpreter_lead`; `value` text of at most 500 characters; `amount` `{amount, units}` (R26's units). Malformed: `VALUE_INVALID`. One value per key under kind and fact. *(not yet met: T45)*
- **R83** (T45; N858; v0.2 rule 11, §8) No field of R74–R82 names a state or assumes one state's law; the module supplies no default for any of them (R27). A real profile for a state other than the first is added only when a group there asks (v0.2 rule 11). *(not yet met: T45)*
- **R84** (T45; amends R22, R57, R62, R68, R73) The test profile supplies R74–R82 with values differing from the first profile's, including a deadline `owed_by: group` with a `consequence`, a `third_party` start, a law with `stages` that omits a stage, a `defends` organisation, one legal fact per trigger, a procedure guide and a kind with two templates. *(not yet met: T45)*
- **R85** (T45; N858, N882; amends R21, R30, R56; S1 §D 15, 16, 17, 19) The first profile holds, each sourced (R44, R56's form) or absent, never `UNMEASURED`: `owed_by` on every `deadlines` entry (the Government Claims Act's `group`); the Brown Act cure-and-correct demand as a kind `brown_act_demand` at Tier 2 with its `advisory` (Gov. Code §54960.1) and its demand and cure periods as deadlines; party participation as a kind `party_participation` at Tier 2; the grand jury's response periods (Penal Code §933, §933.05) with `response_statuses` `applies_to` that kind; the anti-SLAPP period (Code Civ. Proc. §425.16) `owed_by: group`; `legal_facts` for recording consent, the lobbyist threshold, serial meetings, the campaign-spending rule and a threat letter; `stages` on each records law (none for fee waiver under the CPRA); `public_comment` at Tier 1 (Design Requirement 8 names "public comment at government meetings" Tier 1; basis the K ruling BOB records); the First Amendment Coalition `defends` where its published scope supports it; 2027 for each closure list where a primary source states it. What no source supports is absent and named in the job's record (M-notes below). *(not yet met: T45)*

**M-notes (measure first, not requirements; BOB numbers them):**
- M-a: the City of Oakland's 2027 holiday list (M-190's source) and the 2027 judicial holidays: sourced when published; until then counts into 2027 stay undetermined (R33).
- M-b: each R85 rule family (Brown Act demand, grand jury replies, commission participation and party duties, rulemaking periods, anti-SLAPP, election thresholds, meeting-law facts, venue facts) measured as T33's time-law study did, with its worked examples, before data is written.
- M-c: whether any office the first profile addresses keeps a zone other than the profile's (R74); none expected in Oakland/Alameda; the field is for other states.

Tests: each new field malformed with its code and a well-formed control; each `combine` conflict withheld; R83 by R20's identity test over the new fields; R85 per fact with its citation.

Uses: none new.

Size: code 1,794 lines (+ about 400); profile data 1,100 lines (+ about 300, data).

---

## 8. agent-worker, ai-runs, skills (L6: the assistant)

### 8.1 agent-worker — new
- **R76** (T45; N861, N881, N887, N892; Actions D1, D11b, D14, D25, D28; v0.2 rules 2, 9, 16, 18, 19, 21) `POST /draft` takes four further `task.op`s, each the member's own act, answered as a labelled proposal and never stored here: `textcheck` (`{text}`, a prepared outward text: each sentence that reads as an assertion of breach, a policy position, an ask for the group's or its members' own benefit, or a name of staff below the responsible official, answered `{sentences: [{index, quote, reads_as, why}]}`, `reads_as` one of `assertion`, `position`, `own_benefit_ask`, `staff_named`; it never rewrites a sentence); `infractiondraft` (`{matter, audience}`, `audience` one of `violating_party`, `members`, `oversight`, `public`, `broad`: `{text, sources}`, a documented account of the act and office, the standard, the evidence per point with its grade and what is uncertain); `bearingdraft` (`{action, reply}`: `{claims: [{claim, bearing, quote}]}`, `bearing` one of `new_evidence`, `disputed_without_evidence`, `not_addressed`); `statusreportdraft` (`{plan}`: `{text, sources}` from the plan's "where it stands" read). Refusals before any model call, in R59's order and codes, plus `DRAFT_NEEDS_GRANT` for the three that read the record without a `grant`; reads go only through the grant and only to the reach `run-rules` sets for these drafts (owed, 9). Answers as R59's (`label: {kind: "machine"}`, `usage`, `calls`). Record-check assistance on a prepared filing is `/draft`'s `account_check` task over its text (N842's), not a fifth task. *(not yet met: T45)*
- **R77** (T45; N861; Actions D11b; v0.2 rules 1, 9, 12) R76's tasks are instructed by the published pack's `action_drafting` layer (`skills` R45) and never its `suggestions` or `writing_help` layer; while that layer is a stated absence they answer 502 `PACK_UNDETERMINED` and call no model. R60–R62 apply: R62's fixtures gain record text (a reply, a finding) telling the model to state a breach, a position, what to file or "you have a claim": driven through each task with a stub model that obeys, the text comes back only in the draft's fields, no write op or capture request is made, and nothing else is answered. *(not yet met: T45)*
- **R78** (T45; N887; Actions D21; v0.2 rules 16, 19) A plan-mode run whose `origin` is `reexamination` (`ai-runs` R77) reads in `read` (R51), besides R51's reads, the recorded response (its correspondence entry and its capture's extracted text, through the op `op-declarations` declares for it) and the profile's procedure guide for the action's kind (`reading-guides` R13); `PLANE_OPS` (R37) gains those reads and nothing else. Its candidates are `optionpropose` proposals as R52; it writes nothing else. *(not yet met: T45)*

Size: 3,024 lines; about +400, to about 3,400 (BOB watches; the split mark is near after T46).

### 8.2 ai-runs — new
- **R77** (T45; Actions D21; v0.2 rule 16; Capability Ladders §2) `open` in mode `plan` may take `origin: "reexamination"` with `response`, an opaque id stored verbatim and answered by `read` (R19) and `runFor` (R28). It amends R46's "nothing … starts a new one by itself": a re-examination run is started within the member's act that records a response, its `actor` that member, never by a schedule or another run. Refusals, after R46's, nothing written: `origin` other than `reexamination` `AI_RUN_ORIGIN_UNKNOWN`; `reexamination` without `response` `AI_RUN_REEXAM_NEEDS_RESPONSE`; a running re-examination run for the same plan and `response` `AI_RUN_REEXAM_OPEN`. The account is R52's for that act with the run's project (the project's own account where it holds one, else the recording member's), within `ai-use` limits and the keep-away settings. R47's registered check receives `origin` and `response`. *(not yet met: T45)*

Size: 3,446 lines; about +60.

### 8.3 skills
- **R28** amended: (T45; N861, N887; Actions D11b, D17, D25, D26, D28; v0.2 §4) Its clauses are found in `BIO_Action_v0_2.md` §4 (canon now; v0.1 is history): rules 1, 2 (the gate at the outward act; sentences that read as assertions pointed out), 4 (every option listed, no cut-off; no score; no fixed catalogue), 7, 9 (never takes or proposes a policy or vote position; the planning run never suggests advocacy; lobbying only to enforce or restore), 10, 12 (a hostile-response branch; a packet never says "you have a claim" nor whether a protection applies), 13, 16 (what the group chose changes only by a member's act), 19 (documentation first; the chance to fix offered and never withdrawn) and 21 (nothing asked for the group's own benefit; naming the office and the official responsible). `load_when` adds "or re-examines a plan after a recorded response". R29's rule-12 clause is v0.2 rule 12's. *(not yet met: T45)*
- **R30** amended: (T45; v0.2 §4) Its clauses are v0.2's rules 1, 3, 11, 13 and 14 (v0.1's rule 7 now rule 14; rule 3, the record check, added). *(not yet met: T45)*
- **R45** (T45; N861, N881, N887; Actions D1, D11b, D14, D25; v0.2 rules 1–3, 9, 12, 16, 18, 19, 21) The `action_drafting` layer, in `disclosed` after `interface_translation` (R5): `sourcing` `authored`; `load_when` "the member asks the assistant to read a prepared text, draft an infraction's documentation for an audience, propose bearings on a reply, or draft a plan's status report"; body the clauses found by R21's normaliser in v0.2 §4 rules 1, 2, 3, 9, 12, 16, 18, 19 and 21; `acts` read from `published.catalog` by id (R23): `textcheck`, `infractiondraft`, `bearingdraft`, `statusreportdraft`. With none of them in the catalogue it renders as a stated absence in R9's form; with some, a missing one throws naming it (R39's form). No clause carries control-flow authority (R16, R24). *(not yet met: T45)*
- **R46** (T45; N858; Actions D8; v0.2 rule 11) The `procedure_guide` layer: when a run or draft concerns an action of a kind, `reading-guides.procedureGuidesFor` (its R13) is rendered as the layer's body, items only, `sourcing` `guide` naming each guide's origin and carrying its legal-information label; R16 runs over every item and `renderPack` throws, naming it, on a control-flow pattern (R40's form). *(not yet met: T45)*

Size: 2,816 lines; about +200.

---

## 9. Uses changes (all edges point earlier; checked against `modules.json` order)

| edge | positions | |
|---|---|---|
| `project-roster` → `jurisdictions` | 35 → 1 | new (R24) |
| `local-facts` → `content` | 55 → 51 | new (R10) |
| `reading-guides` → `jurisdictions` | 86 → 1 | new (R13) |
| `action-clocks` → `steps` | 119 → 76 | hand-off's; reads R29, R30 |
| `monitoring` → `action-plans` | 124 → 123 | hand-off's |
| `following` → `action-plans` | 125 → 123 | hand-off's |
| `monitoring` → `duties` | 124 → 63 | new, others' (R31) |
| `actions` → `local-facts` | 118 → 55 | new, others' (R12's view) |
| `promotion`, `publication`, `docket`, `case-account`, `actions`, `filings` → `project-roster` | 37/101/103/112/118/121 → 35 | new, others' (R23, R24) |

None points later. `membership` registers nothing new from a later module but through its own slot (R128).

## 10. Owed to others

**To the UX design stream** (keyed sentences; words theirs):
- Translations of the new refusal rows: `PROJECT_SCOPE_UNKNOWN`, `PROJECT_SCOPE_NEEDS_HIDDEN`, `PROJECT_SCOPE_OWN_NOT_SOLE`, `PROJECT_SCOPE_UNCHANGED`, `PROJECT_SCOPE_OWN`, `PROJECT_SCOPE_KEEPS_HIDDEN`, `APPROVAL_RULE_INVALID`, `APPROVAL_KIND_UNKNOWN`, `PROJECT_GUARD_UNCHECKED`, `COMMITMENT_AS_HEARD`, `COMMITMENT_OWN_LETTER`, `RESPONSE_KIND_UNKNOWN`, `RESPONSE_EXTENT_NOT_IN`, `PROMISE_DATE_UNREAD`, `DUTY_SOURCE_NOT_HELD`, `MACHINE_CANNOT_DRAFT_RULE`, `RULE_SECTION_UNKNOWN`, `RULE_ENTRY_INVALID`, `RULE_NO_SOURCE`, `RULE_IN_PROFILE`, `RULE_SELF_CONFIRM`, `RULE_NOT_DRAFTED`, `RULE_NEEDS_QUALIFICATION`, `NO_SUCH_RULE`, `GUIDE_KIND_UNKNOWN`, `GUIDE_ITEM_UNSOURCED`, `DRAFT_NEEDS_GRANT`, `AI_RUN_ORIGIN_UNKNOWN`, `AI_RUN_REEXAM_NEEDS_RESPONSE`, `AI_RUN_REEXAM_OPEN` (BOB drafts, re-wordable, as R126's pattern).
- Member words for the scopes ("counsel matter", "my own project"), the second-approval setting, the group-rule states and the professional's statement prompt; the legal-information label (`guide.procedure.legalinfo`, canon's words); the `reads_as` and `bearing` names as members see them; the warning on sharing a counsel matter's packet (filings').

**To other modules** (other workers' sections):
- `promotion`, `publication`, `docket`, `case-account`, `actions` (R66), `filings`: enforce `counsel_matter` and `own` by `project-roster` R23 (1.3).
- `filings`: enforce `secondApprovalNeeded` (project-roster R24) at approval; run its phrasing check over every assistant draft (agent-worker R76) before the member sees it, as `wizard-scripts` R25 does for writing help.
- `actions` / `action-clocks`: the confirming letter's silence as a dated fact; register `standards` R53's own-sending check; read `local-facts.governingView`; hold the fifth basis kind and "our deadlines"; register `steps` R29's holder and read R30; detect `legal_facts` triggers.
- `civil-time`: spell the fifth basis kind.
- `action-grammar`: check `records_laws.stages` names against its stages.
- `run-rules`: `DRAFT_KINDS` gains the action drafts (agent-worker R76), their reach (`draftMayRead`, a read scope covering plans, actions, correspondence and findings the member sees) and their deploy flag; `answers`/`credentials`: the grant ops for that reach.
- `op-declarations`: the new ops (`projectscopeset`, `projectapprovalset`, `ruledraft`, `ruleconfirm`, `rulewithdraw`, `ruleoffer`, the draft task ops); `promotion`: stamp the new rows.
- `action-plans`: open the re-examination run (ai-runs R77) in the recording act's chain; its R30 check reads `origin`.
- `monitoring`: read `duties` R31 for the watch question.
- `queue-producers`: the departure notice from `membership` R120's reads (1.4).
- `filing-templates`: read `jurisdictions` R81's `templates` (fixes the single-template shape for the Tier 1 set); `wizard-scripts` R22's `@records-request` is that worker's.

## 11. Doubts

BOB's (technical or wording), with the recommended reading:
1. **Home of the scopes and the approval setting**: project-roster, with one guard slot in membership, because membership is at 3,693 lines. *Recommended as drafted.*
2. **"Her own hidden project" needs a mark** (`own`, R21–R22) to be enforceable (no invitations, never discoverable). Without one, "her hidden project" is any hidden project she happens to be alone in, and nothing stops an invitation. *Recommended: the mark.*
3. **Who sets a counsel matter**: any joined participant (v0.2 rule 15 "a member's act"; DESIGN §10 "a counsel matter by its members"), not only an owner. *As drafted.*
4. **Who sets second approval**: any one owner, as the visibility setting (membership R45), not the owners' consensus. An undetermined tier matches every tier entry. *As drafted.*
5. **`met_late` counts as met** for v0.2 rule 17's "reads met" (duties R31): the promise was kept, late. *As drafted; the strict reading would leave watches open after a late fix.*
6. **A group rule duplicating a profile rule** is refused (`RULE_IN_PROFILE`): one fact per key; the route is dispute plus offer. Alternative: the group's rule governs locally like a correction (R1 `correct`). *Recommended: refuse.*
7. **The offer leaves out the professional's statement** (local-facts R13), keeping "nothing else reads it" (DESIGN §10). The shared profile's maintainers see only that a statement was given.
8. **Procedure guides**: Civicsmith's in profile data (`jurisdictions` R80), a group's in `reading-guides` with R4's check narrowed for that purpose. Alternative: a new module; not needed.
9. **`legal_organisations` widened** to Tier 2 kinds and to defence (R78); Design Requirement 8 names organisations for Tier 3. A reading of v0.2 rules 11–12 and S1 §D 16; record as a K ruling and tell Bob.
10. **A promise duty's source** goes through a `commitment` standard (or its pending proposal), as v0.2 §3 and duties R28 do, rather than a new source kind `response`.
11. **The re-examination run is started by the recording act** (ai-runs R77), amending R46's sentence; v0.2 rule 16, approved, requires it. Record as a reading.
12. **The action drafts' reach** is wider than `ASK_SCOPE`; run-rules' to word. Recommended: these drafts read under the grant whatever the suggestions switch, since the member asks for a reading of named records (as `/ask` does).
13. **`public_comment` at Tier 1** from Design Requirement 8's text (S1 §D 19): a K ruling to record.
14. **A commitment resting on the group's own confirming letter** (standards R53): standards (L5) cannot tell the group's sending from the body's letter; the slot lets `actions` say so. Alternative: rely on the declarer's reason. *Recommended: the slot.*
15. **A guard that is not registered** (membership R128) lets the acts proceed; the plane's composition test asserts project-roster registers. Alternative: fail closed (R124's form), which would refuse every invitation in a store built without project-roster.

Possibly Bob's (changes what a ruled requirement means, or touches legal exposure):
16. **Rescue of a member's own project is refused** (project-roster R22 against R5, Membership §7.13). If she is revoked, her own project stays without an owner and unreadable. Options: (a) refuse rescue of an `own` project (her source role and drafts stay private; recommended); (b) allow it (an administrator can place someone in a source's private project); (c) allow rescue only to purge it. *Recommendation: (a).*
17. **Administrators see her own project's existence, name and owner** (D54). A source's own project is visible to administrators as "a hidden project owned by her". Options: (a) keep D54 as ruled, and the screens advise a neutral name (UX); (b) exempt `own` projects from administrators' existence sight (changes D54). *Recommendation: (a).*
18. **Civicsmith stewards (v0.2 rule 21; D28e): no module exists, and none can live in a group's instance.** An instance transmits nothing (rule 14) and holds no route to Civicsmith. A new module would be a Civicsmith-run deployable beside `installer` (`newgroup`), outside the eleven layers. It would need: a public intake for reports (fabricated evidence, harassment, impersonation) with its own rate limit; a store of reports and stewards' decisions, with access for stewards only, retention and personal-data rules; who the stewards are (a role Bob names); remedies limited by code to withdrawing shared services (a profile contribution or offered rule, local-facts R13; a template or guide in Civicsmith's library, reading-guides R1/R6; a public listing, which does not exist yet), with no write path into any group's record; and the plain guide for groups on what they hold and who could compel it (a document, related to membership R107's court notice). That is architecture outside the instance, and it holds third parties' reports, so it is Bob's: options (a) a new Civicsmith-side module, specified after Bob rules on terms of use; (b) a documented manual process (an address, a steward, the guide) until a group needs more. *Recommendation: (b) now, (a) when a group asks; the plain guide is written either way.*

## 12. Hand-off lines and where each went

| hand-off line | placed |
|---|---|
| project-roster: counsel matter is a project; members alone; never published or evidence | project-roster R21–R23, membership R128; enforcement owed (1.3) |
| source role in her hidden project; advocacy text and check in her own hidden project | project-roster R21 `own`, R22; case-account owed; doubts 2, 16, 17 |
| owners' second-approval setting | project-roster R24; filings owed |
| departure: owners told once (producer queue-producers) | no L2 change (1.4); queue-producers owed |
| standards: spoken commitment, as heard, silence a dated fact | standards R52, R53; silence owed to actions/action-clocks |
| duties: proposed from required responses and promises | duties R30 (and R31 for D6d) |
| duties: group's own deadlines not body duties; R23 kept | duties R23 amended |
| profile: Brown Act, grand jury, commission/party, rulemaking, anti-SLAPP, election, meeting-law facts | jurisdictions R79, R85, M-b |
| profile: venue facts | jurisdictions R82 |
| profile: `response_statuses` | jurisdictions R77 |
| profile: defence legal organisations | jurisdictions R78, R85 |
| profile: 2027 holidays | jurisdictions R85, M-a |
| profile: per-office time zones | jurisdictions R74; local-facts R3, R6 |
| profile: whose duty a deadline is | jurisdictions R75 |
| profile: stage vocabulary per law | jurisdictions R76 |
| profile: other states' schema now, data when asked; no generic fallback | jurisdictions R75, R76, R83 |
| procedure guides per kind, legal information, unranked, groups add own, assistant's reading list | jurisdictions R80, reading-guides R13, skills R46 |
| facts surfaced with citations on trigger | jurisdictions R79; detection owed (actions, filings) |
| member-drafted jurisdiction rules, drafter ≠ confirmer, professional's statement, at once, offered | local-facts R10–R14 |
| wizards | not mine (wizard-scripts) |
| assistant: labelled; never positions, what to file, "you have a claim" | skills R28, R45; agent-worker R77; filings' check owed |
| assistant: assertion reading, record-check assistance, infraction drafts, reply reading, claim bearings, status reports | agent-worker R76 (record check via N842's `account_check`), R78; ai-runs R77; skills R45 |
| Civicsmith stewards | doubt 18 (no module) |
| uses edge action-clocks → steps | section 9; steps R29, R30 |
| S1 §D 13 (`minutes_due_days` read by none) | not mine: the profile holds it; its reader is following/monitoring's |
| S1 §D 15, 16, 17, 19 | jurisdictions R76, R78, R85 |

## 13. next.md entries

None is fully applied by this draft alone; each keeps parts in other modules:
- **N858**: profile schema, facts on trigger, guides, member-drafted rules applied here (jurisdictions R74–R85, reading-guides R13, local-facts R10–R14, skills R46). Remains: the template process and offer (filing-templates), `@records-request` (wizard-scripts), D9 (filings R8), D10 holds (actions, docket).
- **N861**: the assistant's part (skills R28, R45; agent-worker R76–R77). Remains: action-plans, actions, filings, the election notice (filings).
- **N881**: status-report drafts (agent-worker R76). Remains: queue-producers, action-plans, where it stands.
- **N882**: `owed_by` (jurisdictions R75), duties R23. Remains: actions, action-clocks, following.
- **N887**: infraction drafts (agent-worker R76, R78). Remains: action-plans, actions.
- **N890**: the second-approval setting (project-roster R24). Remains: action-plans, filings (enforcement).
- **N892**: (b) and (c) pointed out by `textcheck` (agent-worker R76; skills R28). Remains: actions, filings, publication; (e) waits on doubt 18 (Bob).
- **N855** (6d): duties R31 supplies the read. Remains with monitoring, escalation, action-plans, consequences.
