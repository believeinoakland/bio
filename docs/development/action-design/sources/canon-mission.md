# Inventory: what the requirements canon says about the Action layer

Scope: the canon named in `requirements/README.md` — Roadmap v5 §§1–12, Design Requirements v2 (whole), Functional Architecture v3 (functional analysis), System Design (whole except §3 state column), and Bob's DEC rulings. Read-only; every claim is cited by file and section (line numbers from the files as of 2026-09-29).

**Where the DEC rulings live.** `docs/development/DECISIONS.md` on `main` holds DEC-2, 25, 31–33, 39, 43, 48, 50, 51, 53, 68–84. DEC-1…DEC-67 (including **DEC-13, DEC-14, DEC-17, DEC-24, DEC-26, DEC-27, DEC-40, DEC-44, DEC-54, DEC-55, DEC-61**) were rolled on 2026-08-10 to `docs/archive/ledgers/DECISIONS-2026-08.md`. On `main` that file is only a one-line `COORD-POINTER`; the text is on branch `origin/coord` (`git show origin/coord:docs/archive/ledgers/DECISIONS-2026-08.md`). Line numbers below marked "coord" refer to that file. **This is a gap for any job that tries to cite these rulings from `main`.**

**Other canon read where it bears directly** (canon under README, outside the assigned list, read only for the passages cited): `BIO_Case_Making_v0_1.md` (whole canon — its "THE ACTION PLAN" section is the fullest canon statement on actions), `BIO_Publication_v0_1.md` §3 and §6, `BIO_Membership_Architecture_v2.md` §1.3 and §5, `BIO_State_Rules_Consistency_v1_5.md` §4.4. Not canon, cited only as evidence: `docs/archive/research/AUDIENCES.md`, Roadmap §13 and the appendices, `build/layers.md` (the approved layer contract, used here as the thing being tested).

---

## 1. Actor roles

### 1a. Kinds of actor (between groups): what exists

**Canon does recognise that different kinds of actor do different things with the same findings.** It does not model the actor kind as an attribute that gates or sets anything; the rule is that the WORK (project, output act) varies, and nothing varies by *who someone is*.

- **Case Making, "The frame, in Bob's words"** (`BIO_Case_Making_v0_1.md` 108–118): a table of "audiences, and what 'sharing' means to each": media → **reporting**; activists → **fixing — and supporting when they can**; government administrators → **understanding, tracking, adjusting, responding** to the communities they serve; lawyers → **supporting a claim, or changing a claim**; "…and so on — the list is open". The same passage names the path: "questioning → exploring → discovering → documenting → impacting. *And* sharing the products … with the outside world" (103–104).
- **Case Making, "THE ACTION PLAN" §intro** (891–898), Bob 2026-08-03, verbatim: *"This action plan may differ based on the user type (journalist, activist, lawyer, etc.) or other very important (strategic, tactical, political, financial, temporal) factors."* This is the most direct canon statement that actor kind changes what action is taken.
- **Case Making, action plan §4 "Variation by user type is already expressible"** (957–970): "**capabilities, journeys and surfaces vary by USER TYPE** … and the action repertoire is part of the journey. The seven `action_kind` values … are that repertoire's first draft. The plan therefore belongs to a PROJECT + FINDING, never to a person: a lawyer's project and a journalist's project may build different plans from the SAME finding."
- **Case Making §3** (268–289): the difference between audiences is "the strength a claim must reach before that audience can use it. A journalist can publish 'records suggest'; a lawyer needs 'the record establishes'; an administrator may act on 'worth checking.'"
- **Case Making §4 (CORRECTED)** (290–330): "an administrator is not an inversion. They are a stakeholder like any other … **the archetypes differ in what they DO with a case rather than in whose side they are on.**" And "Bad actors are … identified BY EVIDENCE, never assumed by role."
- **DEC-17** (coord 1253–1376; amended 2026-08-03): the evidentiary bar is a property of the project, with the group holding the default. Bob's worked example: *"a lawyer's project may require 'beyond a reasonable doubt' where a reporter's requires 'convincing' — and a lawyer building on a reporter's published case sees the standard it was held to … and may need to BOLSTER it."* Also: "a project convened to decide whether to refer something to an auditor needs a different standard from one convened to decide whether a thing is worth looking at … **Nobody's standard is set by who they are.**"
- **D-156 (recorded inside DEC-17)**: "**AUDIENCE** is reserved for readers and consumers of a published case … the requirements sense becomes **USER TYPE** (`ARCHETYPE`)". "Renderings vary by AUDIENCE, capabilities and journeys vary by USER TYPE, and neither ever reaches ratification." The same person can be both: "two RELATIONSHIPS to a case".
- **DEC-54** (coord 3079–3227), asked about "STANDARDS OF EVIDENCE — across user types (lawyer, journalist, auditor, activist) and within them (AP vs BBC vs NPR)". Ruling: per-user-type variation of the bar is refused ("a structural prior by role"). Variation is "**INDEXED ON THE WORK, NOT THE PERSON**". An organisation's published policy (AP, Reuters, BBC) may be **inhaled**: split into bars (`required_strength`) and bias statements, *proposed* for adoption and never installed, pinned with source, date and hash, with "what BIO ENFORCES, and what it CANNOT" published equally prominently. Bob: *"the danger in both is claiming a standard you don't follow, and denying a bias that you do have."*
- **DEC-27 limit 3** (coord ~1827–1834): the assistant "may propose project defaults from a self-identification and may never silently set them. Bob's examples open *'I'm a journalist'* and *'I'm a resident of Oakland'*, which bear on the project's declared required strength (DEC-17) **and its action repertoire**." This is the one ruling that explicitly ties actor kind to the action repertoire. Even here it is a proposal the member confirms, never an inferred attribute.
- **DEC-72 (1)** (DECISIONS.md 219–222): "the same finding may clear a journalist project's bar and fall short of a lawyer project's, and both facts stand."
- **Publication §3 rule 8** (`BIO_Publication_v0_1.md` 103): "The standard of proof attaches to the production, set by the project's bar and the audience's needs — … not to an individual member's role."
- **Publication §6 "Audiences and output acts"** (305–315): "The eight audiences are the professional roles (Bob, 2026-09-13)". An audience is a READER, distinct from user types, "though one person may be both". Adopted rule: every divergence between audiences is *"a property of the OUTPUT ACT rather than of the case: who certifies it, whether it persists, and to whom it is delivered."* Falsifiable form: *"If the second audience built costs a new `action_kind` and a rendering, this is right. If it costs a field on the case, it is wrong."* Three divergences named and **unmade**: certification, persistence, addressing (addressing = the review copy, §6A).
  - The eight are listed only in the non-canon research `AUDIENCES.md` §10 (631–660): media, activists, government administrators, lawyers, oversight bodies (auditors, controllers, inspectors general, grand juries), affected residents, researchers and peer instances, the publisher's own future members. Funders are declined. Verdict: "**Audience divergence lives in `action`, not in `case`.**" Activists: "their unit of work is `action`, not `case`." Canon points at this list without restating it.
- **Roadmap §12, "Seven categories" and "Key UX design principles"** (`BIO_Complete_Roadmap_v5.md` 736–746, 768–769): Settings holds a **group profile (name, type, expertise, credentials, engagement basis, availability, size, contact)**. Communications shows "inter-group signals with **group type tags**". Principle: "Group profile fields support professional groups (legal, accounting, technical) including credentials and engagement basis." This is the only place a group TYPE appears as a field. Nothing says what it drives.
- **Design Requirement 5** (`BIO_Design_Requirements_v2.md` 129–133): "Forks at the judgment layer are legitimate and expected: **two groups can reach different conclusions about what to do based on the same verified evidence.**"
- **OP5** (Roadmap 378–379): "Credibility is demonstrated by the work. Not by credentials, title, or assertion." **Req 3** (97–99): participation is shown by published work, "not by any formal affiliation." **OP7**: "No group speaks for Believe in Oakland."

**Actor kinds as COUNTERPARTIES or VENUES rather than users:**
- Auditors: the City Auditor appears as the source of findings (Roadmap §1, 218–231) and as a filing venue ("City Auditor whistleblower complaints", Req 8, 191). Grand jury and State Controller appear as venues (Req 8; Roadmap §1, 252–257). DEC-17 and DEC-54 speak of a project "convened to refer something to an auditor". **Neither a city auditor nor an independent auditor appears as a CivicOS user or group type anywhere in canon.** Only "accounting" professional groups (Roadmap §12) and CPAs in Membership §1.3 come close. The oversight-body audience exists only in non-canon `AUDIENCES.md` §6A.
- Journalists: "media outreach" is a Tier 1 action (Req 8, 192) and `media` is an action kind (State Rules §4.4). Journalists as users appear only through the Case Making and DEC texts above.
- Lawyers: counsel as the Tier 3 recipient (Req 8 and its 2026-09-26 amendment, 175, 202–212: "HJTA, ACTA, First Amendment Coalition, Prop 218 specialist attorneys"). Also as user type (DEC-17, Case Making).
- **Labor unions and special interests: NOTHING recognises them as actors.** The only canon mention of unions puts them in the opposition: Roadmap §1 (275–280), "the interlocking protection network (**unions**, City Attorney, external auditor, Council)". Appendix A (1039, "Unions: SEIU 1021, IFPTE Local 21, IAFF Local 55, OPOA", history rather than canon) lists them among "key officials and institutional actors". Note that the same sentence also places the "external auditor" in the protection network. Interested parties are handled only by disclosure: Req 6 (141–145) requires "disclosure of any relationships between the producing group or its members and the government entities, officials, contractors, or other stakeholders being analyzed". Declared bias covers the rest. OP1 ("We take no position on what the policies should be", Roadmap 368–369) and Req 7's 2026-09-26 amendment ("Policy advocacy and candidate support are not part of it; Operational Principle 1 stands", 162) bar exactly the policy advocacy that defines a special interest.

### 1b. Roles within a group

- **Membership v2 §5 "Capabilities"** (`BIO_Membership_Architecture_v2.md` 566–604): four capabilities are set by an administrator: **contribute**, **publish** (which also needs a registered signing key), **create projects**, **administer**. There is no capability for filing, sending correspondence or speaking for the group. "Capabilities gate a session, not a credential"; a machine holds none.
- **Membership v2 §1.3 "Declared expertise, and confirmed licenses"** (116–140): "A group needs to know which participants are lawyers, CPAs, engineers, doctors, barbers. This is **operational routing information**: who should look at a franchise-fee question, who can read an ACFR, who is qualified to judge a Brown Act claim." The member declares and an administrator confirms. "**Confirmation gates nothing.**" "Expertise informs humans and gates nothing."
- **DEC-72 (5)** (DECISIONS.md 229–230): "The publisher of a project … must be a manager of the project", which defaults to the existing project owner role. No third role was minted.
- **Publication §3 rule 7** (`BIO_Publication_v0_1.md` 102): attribution is "the attesting member's choice", at one of four levels (group, project, cover, name). A source "who spoke off the record to preserve anonymity is valid."
- **Publication §3 rule 11** (104): a second participant (or a review-copy recipient) acknowledges the exclusion statement. This is "disclosed, never enforced", because "a group may be one person (Design Requirement 2)".
- **DEC-10** (coord 638–767): an overdue condition notifies "the member who AUTHORED the connection" to the focus or project. The fallback is project manager, then an active group admin, then "honestly unassigned". Muting is personal, dismissing is a record act, and events aggregate per case.
- **DEC-69** (DECISIONS.md 99–149): members are "ENABLED to act singly or in bulk and … FORCED into neither". The workflow "must not nag or second-guess".
- **Sharing resources**: Case Making action plan §6b "Resources: an ATTACHED LIST" (1064–1082). A step carries a free-form, collapsed resources list (money, member hours, expertise the group may not hold, standing, political capital, "someone's willingness to be named"). It is deliberately not a model. Req 15 (401–402): "Cross-community learning and resource sharing are encouraged but not required." The Roadmap Settings profile lists "availability" (743).
- **Sharing information across groups**: Roadmap §11 "Inter-group awareness" (689–703): directory, voluntary "working on" signals, "the handoff pattern" ("A group's published finding notes an area warranting further investigation"), and "**No group owns an issue.** Multiple groups can work on the same topic independently." Req 5: public, traceable acceptance of other groups' work.
- **Sharing perspectives**: declared bias (DEC-54's inhale; "REGRADE … the disagreement is LOCALIZED TO NAMED LENS DIFFERENCES"). DEC-72 (6): a finding "has lasting value and serves many cases, across projects".
- **Within-group division of labour for ACTIONS specifically (who drafts, who signs or sends a filing, who speaks to press, who is the group's contact): NOTHING in canon.** Req 6's "point of contact for questions" (146) is the only role-like field on outputs.

---

## 2. Plurality: several actions, of different kinds, on one finding, or none

**Several actions: supported, and argued for.**
- Roadmap §1 (252–257, 266–273): the founding example is one matter with **three parallel enforcement actions** threatened at once (CPRA petition, grand jury complaint, State Controller referral). The legal-pathways report is an "analysis of three parallel legal mechanisms".
- Roadmap §2 (284–296): "Oakland's protection system is optimized to absorb any single pressure vector. Individual lawsuits, audit findings, grand jury reports, and media investigations have all failed to produce sustained change". The strategic answer is sustained attention "through legal mechanisms", plural.
- Functional Architecture "The three layers" (103–109): the layers are "concurrent … not phases".
- Case Making action plan §2–§3 (915–955): a PLAN holds many STEPS with dependencies, "outcome-keyed branching", resources and a disposition (chosen · declined-with-reason · done · blocked). "A step that is taken produces an `action`". The plan "may serve several findings at once".
- Case Making §4 (966–968) and DEC-72 (1): different projects may build **different plans from the SAME finding**.
- Req 5: two groups may reach "different conclusions about what to do based on the same verified evidence". Roadmap §11: multiple groups on one topic.
- DEC-13 determinations (coord 844–937): a `request_for_comment` "names its inquiries the way a basis leg names its targets", so one action may span several findings.
- DEC-44 (coord 2482–2561): a case is "a CONTAINER OVER ONE OR MORE FINDINGS".

**No action: supported.**
- Functional Architecture "Analysis outputs" (327–341): "Noncompliant: … triggers the escalation protocol **if the group chooses to pursue it**." "Compliant: … documented but does not trigger escalation."
- Functional Architecture Function 4 (309–323): "Not every discrepancy is a violation. A city department that files a report two days late is technically noncompliant but **may not warrant escalation** … The determination of significance is human judgment."
- Roadmap §10 (636–653): "Escalate (**if warranted**)". "Human decides."
- Case Making action plan §2 (926–933): the decisive argument for a plan object is "**the options NOT taken**". A plan "must be able to hold what it decided against", with the reason.
- `build/layers.md` Layer 9 ruling 1 (not canon, approved): "Significance, whether a breach warrants action and how urgently, stays the member's judgment."

**Tension on plurality.** Req 7 (165–171) calls the protocol "mechanical: when trigger conditions are met, the next stage activates." Read strictly, that leaves no room for a group to decline. It contradicts FuncArch's "if the group chooses to pursue it" (see §5).

---

## 3. Actions not premised on a breach

**What canon allows or requires:**
- **Documenting compliance is required, and is justified as a signal of even-handedness.** Functional Architecture "Analysis outputs" (330–333): "Compliant: the action conforms … This is documented but does not trigger escalation. (**Documenting compliance is important because it demonstrates that BIO examines facts evenhandedly, not just looking for violations.**)" The approved layer contract echoes it: "Compliance is documented as carefully as noncompliance" (`build/layers.md` 74).
- **Layer 3 is defined over FINDINGS generally, not breaches.** FuncArch "The three layers" (117–118): "**Layer 3: Action.** Turn findings into outputs: work products, publications, escalations, communications, and ongoing tracking." Only Function 3 (Escalate) is conditioned on noncompliance ("When findings reveal noncompliance", 401). Functions 1 (Document), 2 (Evaluate and publish) and 4 (Communicate) carry no such condition. Function 4 (410–414): "Share findings and status with the BIO network … the public (subreddit, media outreach), and the city (CPRA requests, public comment, council testimony)."
- **Actions from an UNCLEAR result, with no finding at all.** FuncArch "Analysis outputs" (338–341): "Unclear: … triggers a return to Layer 1 … and **may result in CPRA requests**, additional research, or **outreach to other groups**." The founding CPRA request (Roadmap §1, 240–250) was investigative: it asked for records in order to find out. DEC-76 item 3 (DECISIONS.md 1248): a conflict of norms none of the canons reconciles "is itself a finding that may support an **`unclear` determination and an action**."
- **Pre-publication actions.** DEC-13 (coord 844–937) adopts putting the case to its subject **before publication** (`request_for_comment`, a group-authored window with "7–30 days as the sourced precedent", a response "captured, not summarised", a non-response "recorded as a non-response with its date"). The gate is the group's *declared, justified position* on contact, never the contact itself. DEC-31 (DECISIONS.md 454–533, corrected 2026-09-17) adds a **review copy** handed to one person or internal group before publication. It "never leaves the instance", is mutable, and is reached by a scoped revocable grant.
- **Outcomes, not only impact.** DEC-14 (coord 938–1012): ProPublica's "'outcomes' short of impact" ("a hearing convened, a study commissioned, a commission appointed") are carried "at full strength"; impact claims are "unproven" absent outside evidence.
- **"Tell a story."** System Design §1 (27–29): "CivicOS exists to answer questions, make a case, **tell a story**, and take action to affect a living civic system." Case Making §4a (331–347) separates a **story** ("what the record supports, told so a person can follow it") from a **narrative** ("a frame imposed on the material"), and warns against optimising compellingness.
- **Action kinds that are not intrinsically breach-bound**: `public_comment`, `media`, `other` (State Rules §4.4, 894–896). Also "public comment at government meetings" and "media outreach" (Req 8 Tier 1, 192).
- **Non-government subjects.** Case Making action plan intro (893–894), Bob: "some government action (**or action by some other person or organization**) doesn't conform to the law, policies, regulations, **stated intentions/promises**, or other restrictions." The standard includes promises, and the subject need not be government.

**What canon does NOT contain:**
- **No action kind, stage or example for praising compliance, a community success story, a reporter's feature on something that works, informational or educational outreach, coalition building, or supportive testimony.** The only compliance-side outputs are *documenting* compliance (FuncArch) and *publishing* findings. Nothing frames a compliance finding as the basis for an outward act.
- The action plan is explicitly triggered by nonconformity: "In situations like this, an action plan needs to be constructed" (Case Making 894–895).
- The mission frames Action as corrective. Core Value 4 (Roadmap 355–356); OP6 "We pursue accountability to completion. Compliance restored. Consequences addressed." (381–382); Roadmap §10 exit condition (638–639); FuncArch Function 5 (416–422).
- State Rules §4.4's resolution vocabulary (`complied, denied, escalated, withdrawn`) is shaped for requests and breaches. No resolution fits a story published or a thank-you delivered.

**Against the approved layer contract** ("An action rests on a published finding and on a standard held in the record", `build/layers.md` 74; Bob's framing, 70: "support the group in acting to bring the government back into conformance"):
- The **published finding** premise contradicts canon in three places: records requests made to find out (FuncArch "Unclear"; Roadmap §1); the pre-publication request for comment (DEC-13); and the review copy (DEC-31). DEC-26's gate is "established", not "published" (see §4). Req 2 (91–92) lists "initiate the escalation protocol, and publish findings" as separate capabilities, and Req 7's first stage is "Discovery and Documentation", which comes before any publication.
- The **conformance** framing is narrower than canon's Layer 3, which also covers communications and the documentation of compliance.
- The layer contract's "compliance is documented as carefully as noncompliance" is canon-faithful (FuncArch).

---

## 4. Every element the canon names

### 4a. Action kinds and actions named

| kind or act | where |
| --- | --- |
| CPRA request (records request) | Req 8 Tier 1 (190); Roadmap §1, §8 (523); FuncArch "Unclear", Function 4; State Rules §4.4 `cpra_request`; D-147/D-149 (Case Making §2, 196–215): a records request is "one round trip" and names "every law that governs it", following "the AGENCY ASKED", and set by a member, with the machine only proposing |
| Grand jury complaint | Req 8 Tier 1; Roadmap §1 (Penal Code 925a), §8; `grand_jury` |
| State Controller referral | Req 8 Tier 1; Roadmap §1 (Gov. Code 12422.5(e)), §8; `controller_referral` |
| City Auditor whistleblower complaint | Req 8 Tier 1 (191) only; missing from Roadmap §8's list |
| Brown Act violation report | Req 8 Tier 1; Roadmap §8; Req 11 adds "Brown Act attendance" as a legal tool (289) |
| Public comment at government meetings | Req 8 Tier 1; FuncArch Function 4; `public_comment` |
| Council testimony | FuncArch Function 4 (412); Req 7 amendment ("testimony", 162) |
| Media outreach | Req 8 Tier 1; Roadmap §8; FuncArch Function 4; `media` |
| CPRA court petition (Tier 2) | Req 8 (198); Roadmap §1 (Gov. Code 7923.000), §8 |
| Prop 218 challenge; CCP §526a taxpayer action; federal consent decree motion; any claim of constitutional interpretation or statutory construction (Tier 3) | Req 8 (202–206); Roadmap §8 |
| Litigation support | State Rules §4.4 `litigation_support` |
| Request for comment to the subject | DEC-13 (`request_for_comment`) |
| Political accountability: asking elected officials to act on the breach, oversight and audit requests, testimony, legislation that restores or enforces an existing requirement | Req 7 amendment (162), 2026-09-26 |
| Cross-group communication: forum, directory submission, "working on" signals, subreddit | FuncArch Function 4; Roadmap §7, §11; Req 9–10 |
| Review copy (addressed, pre-publication, never leaves the instance) | DEC-31 corrected; Publication §6A |
| Publish a case / edition | DEC-12, DEC-44, DEC-72; FuncArch Function 2 |
| `other` | State Rules §4.4 |

### 4b. Stages
- Req 7 (164–171): **Discovery and Documentation → Notification → Clock Starts → Response Evaluation → Escalation to Legal Tools → Sustained Attention**, plus (amendment, 162) **Political Accountability**, "entered from Response Evaluation or Escalation to Legal Tools". "Each stage has defined entry conditions, defined actions, defined timelines, and documented trigger conditions for the next stage." **None of these is defined anywhere in canon** (see gaps).
- Roadmap §10 (634–660), the group workflow in five phases: Orient, Investigate, Document, **Escalate (if warranted)**, Monitor. Exit: "compliance restored, consequences addressed (OP6)". "New evidence triggers re-investigation (OP4)."
- Skill 8 (Roadmap 622–627): "Guides groups through the six escalation stages. Identifies current stage, trigger conditions, available actions by tier, deadlines."
- Action lifecycle (State Rules §4.4, 915–918): `planned → active → awaiting_response → resolved (complied, denied, escalated, withdrawn) | abandoned (reason-gated)`.
- Plan step dispositions: chosen · declined-with-reason · done · blocked (Case Making 946). Support status: established · short of the standard · hypothetical (DEC-26; Case Making 1036–1042).
- Project stages: forming, investigating, matured, closed (DEC-79).

### 4c. Risk tiers
- Req 8 (189–217): **Tier 1 File Freely** ("incorrect filing creates no lasting legal harm"; templates included; "**Any individual can initiate these actions**"). **Tier 2 File with Caution** ("dismissal, typically without prejudice"; templates with advisory notes). **Tier 3 Do Not File Without Competent Legal Counsel** ("adverse precedent binding on future litigants"; theory and facts published; **templates NOT included**; contact information for legal organisations). "The risk classification is included in the evidence package metadata". "The system minimizes financial barriers to escalation but does not provide or manage funding."
- The Req 8 amendment of 2026-09-26 (175) adds a **counsel packet** for counsel the group names. It holds "the facts with their citations, a chronology, exhibits with provenance, the standards' text, candidate legal theories and remedies, and any deadline that binds a claim". It is "never published, and never in a form that can be filed as it stands. Counsel drafts and files."
- Roadmap §8 (510–536): the rationale ("a poorly filed Tier 3 case could create adverse precedent"). Its tier lists are shorter than Req 8's, and Req 8 governs.
- D-182 and the risk-tier revision ruling (Case Making §2, 150–193): a tier is `1 | 2 | 3 | undetermined` and never defaults to 1. Only a member sets it. Revision is an authored, append-only act with a required reason. A machine may only propose.

### 4d. Deadlines and clocks
- OP3 (Roadmap 373): "**The clock runs. Deadlines are deadlines.**" Partial compliance "doesn't stop the clock" (Roadmap 390–392; FuncArch Function 5, 421–422).
- The CPRA 10-day statutory deadline (Gov. Code 7922.535) and the group's own follow-up deadline (Roadmap §1, 252–257).
- Req 7: "defined timelines". Skill 5 "Tracks deadlines" (Roadmap 591–596). Roadmap §12 "Deadline urgency bar" (730).
- FuncArch Function 5 resolution note (424–428) and State Rules §4.4: "every date-bearing clock entry carries the statute, order, or commitment it derives from, and overdue entries are marked, never silently stale." Clock status: `pending | met | overdue | waived`.
- DEC-13: the subject's response window is authored by the group, "with 7–30 days as the sourced precedent" (GAGAS/GAO).
- DEC-10: an authored due-by passing is "the DECLARED EXPECTATION BEING REALISED" and causes notification. The re-notify increment is the stage's own interval.
- Counsel packet: "any deadline that binds a claim" (Req 8 amendment).
- DEC-61 (coord 3700–3723): transcripts are purged on a routine trigger that is "SUSPENDABLE (a litigation hold)" once a group is on notice. This is a legal clock that bears on actions.
- Case Making action plan §3 (938–946): a step has `within_interval` (deadline). "Our own missed deadline" must not surface as a finding about the world.

### 4e. Counterparties and recipients
- `counterparty` on an action, e.g. "Oakland Finance Department, Controller's Bureau" (State Rules §4.4, 912).
- Req 6 (149–156), institutional framing: individuals are named only in official capacity. "Accountability belongs to the role and the institution."
- Venues and recipients named: the city (FuncArch Function 4), the grand jury, the State Controller, the City Auditor, government meetings and council, media, courts (Alameda County Superior Court, Roadmap §1), counsel and legal organisations (HJTA, ACTA, First Amendment Coalition, Prop 218 specialists), elected officials (stage 7), the BIO network and the public (subreddit), and the subject of a case (DEC-13).
- Security guide (Req 11, 297–299): "communications with city officials may be subject to public records requests".

### 4f. Output artifacts
- **Evidence package**, "the primary output of the escalation protocol" (Roadmap §8, 512). It carries "all factual findings, source documents, and analysis … fully public", including "identification of which laws or policies appear to have been violated" (Req 8, 177–182). Critical packages should be hosted on at least two platforms (Req 10, 269–272). "Evidence packages are available for any actor to pick up" (Req 14, 370–371).
- **Filing templates**, Tier 1 and 2, "pre-populated with case-specific facts" (Skill 8; FuncArch Function 3). None for Tier 3.
- **Counsel packet** (Req 8 amendment).
- **Work product** with standardized metadata (Req 6), and a compliance-skill evaluation before publication (FuncArch Function 2). Distributions are frozen with a manifest carrying "audience: internal | external; risk tier" (State Rules §4.5).
- **Published case**: one or more findings, editions, a scope statement, the declared bar beside the strengths reached, the bias manifest, the subject-response declaration and the exclusion statement (DEC-12, DEC-13, DEC-17, DEC-44, DEC-72).
- **Review copy** (DEC-31). Any rendering addressed to someone carries its hash, date, author and both threshold floors in-band (Publication §3 rule 9).
- **Correspondence ledger**: capture-or-testify, fee quotes as evidence (D-148), non-response recorded with date (DEC-13).
- **Action plan** (S11): steps, dependencies, deadlines, outcome branches, resources, declined options, support status. It is **never published** (DEC-25, deferred, prospective-only if ever changed).
- **Outcome record** of the group's own action (DEC-14).
- **Published form of an obligation-against-act finding**: Criteria, Condition, Cause, Effect and Recommendation (DEC-77 item 2).
- Roadmap §12 surfaces: Projects "Compliance dashboard. **Escalation tracker**. Sub-tabs: Evidence, Compliance, Escalation, Related Work"; Communications "**Compose actions**".

### 4g. The human-judgment boundary
- Roadmap §10 (658–660): "**AI skills provide support. Humans make every decision.**" Escalate: "Human decides."
- Req 12 (333–337): "**No tool has authority to approve, reject, or gate any work product or action.** No tool is required for participation."
- FuncArch Function 3 (399–406): Tier 1–2 templates pre-populated; "For Tier 3 actions, the skill identifies the legal theory and directs the group to appropriate legal counsel." Function 4 (Evaluate significance) is "a human responsibility".
- Skill 6 (Roadmap 598–611): discrepancies are presented "for human evaluation rather than rendering a determination".
- DEC-24 (coord 1640–1731): "THE MACHINE MAY DO THE LOOKING; THE MEMBER DOES THE CONCLUDING." Rule 1: the machine proposes and the member authors, and the machine "never hides why it thought there was one". Rule 4: "A checker raises; it never resolves … no machine credential performs the attested act."
- DEC-27: the assistant "MAY INITIATE AN ACT, AND THE ACT STILL RUNS ITS FOUR BEATS"; it "never commits".
- Case Making action plan §5 (972–981): the machine may SUGGEST a plan (as candidates) and CHECK it (unreachable deadline, missing resource, "an unhandled branch — an outcome with no next step", a finding below the bar). It "never adopts a step".
- DEC-26 (coord ~1733–1778): "**the gate belongs at the ACT, not at the reasoning.** A plan may rest on premises not yet established; an act reaching outside the group may not be taken on them." "An outward act's pre-flight refuses when its step is not `established`."
- DEC-55 mentions a machine fence `_CORRESPOND` / `_MOVE_ACTION`: a machine may not correspond or move an action.
- "The AI prepares, never files" is the layer contract's wording (`build/layers.md` 74). Canon supports it in substance (Roadmap §10, Req 12, DEC-24) but never uses the words.

---

## 5. Contradictions and tensions

1. **"An action rests on a published finding" (layer contract) vs canon's pre-publication and pre-finding actions**: investigative CPRA requests (FuncArch "Unclear"; Roadmap §1), `request_for_comment` before publication (DEC-13), the review copy (DEC-31), and DEC-26's gate of "established", not "published". Req 7 stage 1 and Req 2 also place initiating the protocol before or apart from publication.
2. **Req 7 "mechanical … the next stage activates" vs human decision.** The contrary texts are Roadmap §10 ("Human decides"), FuncArch "if the group chooses to pursue it", Req 12 (no tool gates an action), DEC-24 and DEC-69. `build/layers.md`'s "the next stage is proposed … a member advances it" reinterprets Req 7 rather than following its text.
3. **DEC-26's pre-flight refusal of an outward act vs Req 12 ("no tool … gate any … action"), Req 8 ("Any individual can initiate these [Tier 1] actions") and Req 2 ("without requiring … approval").** DEC-17 softens this: the bar is the group's own, can be lowered loudly, and an absent bar gates nothing. The letter of Req 12 still conflicts.
4. **The adversarial frame vs the stakeholder stance.** Roadmap §2 ("nothing short of a war"; "the protection system") and Req 13 place unions, the City Attorney, the external auditor and Council in a "protection network" (Roadmap §1). System Design §1 and Case Making §4 hold instead that "all stakeholders are presumed to want better outcomes … bad actors are identified by EVIDENCE, never assumed by role", and Bob adds "nowhere in the doctrine is anything like 'Stick it to the man!'". The product owner's framing of unions and auditors *as actors* sits on the second side and against the first.
5. **Actor kind drives action (Case Making plan §intro, §4; DEC-27 limit 3) vs nothing is indexed on who someone is (DEC-17, DEC-54, Publication rule 8).** Canon reconciles these as "repertoire and journeys vary by user type; bars attach to the project". No mechanism is defined for how a user type or group type selects a repertoire. Roadmap §12's group `type` field has no stated effect.
6. **Seven stages vs "six-stage" everywhere else.** Req 7's amendment adds stage 7, but the Roadmap §6 ("Six-stage escalation protocol", 441), Skill 8 ("six escalation stages", 624), FuncArch Function 3 and the skill inventory ("six-stage protocol", 401, 436, 578) and Req 12 ("six-stage process", 324) were not amended.
7. **The Tier 3 text differs by document.** Roadmap §8 still says only "Evidence published; filing templates NOT included. Contact information for legal organizations provided". It has no counsel packet and omits the City Auditor whistleblower complaint and public comment from Tier 1. Req 8 governs (Roadmap §6, 403–406). Roadmap §8 names `BIO_Communications_Platforms.docx` as the authority for risk classification, but README lists that document as reference, not canon.
8. **"Layer 3" means two things inside FuncArch.** The functional analysis says Layer 3 is Action. The July 27, 2026 addition, "Bob's framing, recorded as the shape of the whole system" (593–613), says "**Layer 3 is the UI surfaces**". `build/layers.md` numbers Action as layer 9. README excludes "the v3 annotations" from canon; whether the July 27 section counts as an annotation is not stated.
9. **The plan is triggered by nonconformity (Case Making) vs Layer 3 over findings generally (FuncArch).** A compliance finding has Layer 3 outputs (documentation, publication, communication) but no plan and no action kind.
10. **Grade and legal use.** DEC-81 makes a co-attested Grade B enough to publish, while "Grade A stays the ceiling for adversarial or legal use" and Grade A is deferred. Canon does not say whether a Tier 2 or 3 action, or a counsel packet, may rest on Grade B or self-attested evidence.
11. **The resolution vocabulary** (`complied, denied, escalated, withdrawn`, State Rules §4.4) fits only request and breach actions. It conflicts with non-breach action kinds such as `media` and `public_comment`, and with DEC-14's outcome/impact split.

---

## 6. Gaps / undefined

1. **The escalation protocol's content**: per-stage entry conditions, defined actions, timelines and trigger conditions (Req 7 promises them; nothing defines them). Also what "Notification" is, what it notifies and to whom.
2. **Stage 7's purposes** beyond the four examples. What counts as "legislation that restores or enforces an existing requirement" versus policy advocacy.
3. **OP6's "consequences addressed"**: what counts, who decides, and when the exit condition is met. Also what "Response Evaluation" evaluates against.
4. **Non-breach action kinds**: praise or commendation of compliance, community success stories, informational or educational outreach, coalition building, supportive testimony, and a reporter's feature. None is named and no stage or lifecycle fits them.
5. **Actor types as data**: no canon field or construct for a group's or member's actor type that affects actions. Roadmap §12's group `type` field and "group type tags" are undefined in effect. The user-type-to-repertoire mapping (Case Making §4) is asserted, not designed.
6. **Labor unions and special interests** as users: absent. Handling of interested parties is limited to Req 6 disclosure and declared bias. How an interested actor stays within OP1 is not addressed.
7. **Auditors (city or independent) and officials as CivicOS users**: absent from canon. They appear only as venues and counterparties. The oversight-body audience is non-canon research.
8. **Within-group roles for actions**: who may send, file, sign or speak for the group on an outward act. There is no capability for it (Membership §5 has contribute, publish, create projects, administer). Whether an action binds the group, a project or a member, and how OP7 ("No group speaks for BIO") applies to a group's outward speech, is undefined.
9. **The Publication §6 divergences**: certification (a licensed professional standing behind an output) and persistence are "unmade". The **catalogue of standards by audience and output act** is "OWED … does not exist" (Publication §9, 615).
10. **Confidential delivery** to a single outside recipient (a grand jury referral, counsel): DEC-31 as corrected covers only a review copy that never leaves the instance. True confidential delivery is "a different and much larger act and is NOT what this entry answers". The counsel packet's delivery path is not stated.
11. **Action preconditions** and the BACKWARD question ("what else must be true for action X"), deferred as D-165 (Case Making §6b). Also standing, exhaustion and filing-window checks.
12. **Plan publication** (DEC-25, deferred; if ever changed it applies prospectively only).
13. **Cross-group joint action** (coalitions, co-filed complaints, shared plans): nothing beyond "working on" signals, the forum and the handoff pattern.
14. **Tracking government response**: the correspondence ledger and monitoring exist. How a response is judged adequate, partial or non-compliant is not defined ("partial compliance is documented but doesn't stop the clock" is the only rule).
15. **Jurisdiction**: every named action, venue and deadline is Californian (CPRA, Prop 218, CCP 526a, Penal Code 925a). Canon has no generalisation, although Req 15 requires location neutrality.
16. **Evidence-grade requirements per action tier** (see tension 10).
17. **Funding and cost of actions**: Req 8 "does not provide or manage funding". The resources list is free-form and has no arithmetic.
18. **DEC rulings DEC-1…DEC-67 are not readable on `main`.** The text is on `origin/coord` only (the file on `main` is a pointer), yet README says the DEC rulings "in `docs/development/DECISIONS.md`" are canon.
