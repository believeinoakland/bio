# R2 · Actions in the other canon documents

Research worker R2 for ACTIONS-DESIGN #1, 2026-10-09. Read-only survey. Method: `grep -n -i action` to locate passages in each document, then each surrounding section read whole. Citations are section headings (line numbers as of `HEAD` on 2026-10-09 in brackets where helpful). R1 covers Action, Case Making, Investigation and the Capability Ladders; this report does not restate them except to compare against `BIO_Action_v0_1.md`.

**Skipped as unrelated (in every document):** "extraction", "transaction", "interaction", "abstraction", "redaction", "fraction", "compaction", "satisfaction"; code constants (`PROJECT_ACTIONS`, `GOVERNANCE_ACTIONS`, `CUSTODIAL_ACTIONS`, `PROVENANCE_JUDGEMENT_ACTIONS`, `CALIBRATION_WRITE_ACTIONS` in Membership v2 §4); "GitHub Actions" (Distribution §10); generic UI "actions" (buttons, "Mark reviewed", "To context", selection-scoped bulk acts) except where they bear on outward acts; "government action(s)" in the sense of *the act a public body took* (Functional Architecture Layer 2, Roadmap Skill 4/6, Design Requirement 12), which is the object of a determination, not a group's action, noted once below.

---

## 1. `BIO_Technical_Architecture_Decisions_v10.md`

**Status.** Working document v10 (July 2026), no document-level approval. Canon: "the general rules, not the mechanisms" (`requirements/README.md`). Its own banner: written against the retired substrate; §2 and §7.5 superseded by the INQUIRY collapse (DEC-72); §8–§9 describe the retired client.

**Action content.**
- **§0 Priority framing.** The sewer-fund case is "an exemplar pilot … not a call to act publicly. Public action waits until the stack is judged sufficiently functional, refined, and resilient." Repeated at §11 ("without any public action").
- **§1 Governing constraints.** R12 restated: "no tool gates any work product or action". R13 (opposition) and R14 (no single point of failure) listed as bearing on the technology.
- **§2 The object model (superseded in structure).** `Action` is one of four independently persisted bundle types (Information, Focus, Project, Action), layer "Action": "A pursued course from the action suite (planning, communications, calendaring, prosecutions, negotiations, settlement, collaboration). Carries the clock." A Project "initiates Actions". A **Work Product** is "the focused, publishable derived view of a Project **or Action**", persisted in the Project or Action bundle. Flow: a Project "produces a Work Product, which may be distributed … and may, in turn, initiate Actions."
- **§3 Store layout.** Flat per-type roots including `actions/`; per-type schema for Action loads on demand.
- **§4 Work products.** A Work Product is "the thing a group hands to someone else to make a case"; fact/commentary firewall; reproducible; internal vs external readiness ladder (draft, internally checked, externally compliant, distributed).
- **§5 Distribution risk tiering.** "External distribution invokes the three-tier risk classification from the evidence-package design (file freely / file with caution / requires counsel). So the Work Product is where the publishing standard, the trust hierarchy, and the risk tiering converge."
- **§8.1 Journeys.** "Action setup" (Action layer; produces Actions; lives in "Projects to Action") and "Action management" (produces "plans, comms, calendaring, ... + Work Products"; lives in Projects/Action + Communications). "Work product distribution" (Analysis/Action).
- **§8.2 "Clocks belong to Actions."** "An Action's timeline scales from a single statutory date (a CPRA request's deadline) to a multi-stage schedule with dependencies (a civil suit). Every date-bearing clock entry carries the statute, order, or commitment it derives from. The Monitoring skill watches them; New Developments and the Overview surface what is approaching or overdue."
- **§8.3 Extension surfaces.** The kernel includes the "escalation protocol". Surface kinds include "inbound/response-generating (surveys, forms, email campaigns — heavier, with a backend and an attack surface)" and internal ones such as "a negotiation tracker". "The Action layer is the broadest suite." External response-generating surfaces are "seam-now, build-later".
- **§10.2.** The "constrained set of legal repair actions" is store repair, not civic action (skipped as unrelated).

**Fences.** No tool gates an action (R12). Public action withheld until the stack is ready (a 2026-07 priority framing).

**Open / future.** §8.3 response-generating surfaces (surveys, forms, email campaigns) "build-later"; §12 open sub-question on whether WACZ/SHA-256 meet the chain of custody "an evidence package may need" (answered since by Action rule 13 and `GRADE-A-CAPTURE.md`).

## 2. `BIO_Membership_Architecture_v2.md`

**Status.** v2.0 (2026-07-26), specified by Bob; canon whole; many later built and ruled amendments.

**Action content.**
- **§1.3 Declared expertise.** Expertise is "operational routing information: who should look at a franchise-fee question, who can read an ACFR, who is qualified to judge a Brown Act claim." **DEC-135 (2026-10-05):** a project owner may ask for a check by naming an expertise; it reaches every member who declared it as a To do; first taker owns it; "the request only addresses; it gates nothing". Confirmation gates nothing.
- **§2 Not a network construct.** Membership never crosses a group boundary (the basis Action §8 cites for deferring joint action).
- **§6, DEC-133.** "Civicsmith sends no email: the website or the approver sends the link." (Consistent with Action rule 7.)
- **§7 opening and §7.3 (D54, 2026-10-09).** An administrator who is not on a hidden project sees its existence, name and owners "so that the custodial role can place a legal hold or act on a complaint" (an internal complaint about the project, not a civic filing).
- **§7.9 Containment.** "A Project `initiates` zero or more Actions." An invited-not-joined member sees the SKELETON, including "the Actions it initiates"; uninvited sees nothing. §7.12: fork is for joined participants only, since an invited member sees only "the Focuses, the Information and the Actions".
- **§7.14 Discoverable.** A discoverable project's "Actions" stay private to the uninvited.

**Fences.** Expertise informs and gates nothing; administrators "direct nothing" in a project (so an administrator cannot take or block a project's action); nothing crosses a group boundary.

**Open.** None on actions. §9 (root of trust unmodelled) is debt.

## 3. `BIO_Communications_Platforms.md`

**Status.** April 2026 working document, no approval. **Reference, not canon** (`requirements/README.md`: "an April 2026 platform selection that predates the plane"). `BIO_Publication_v0_1.md` takes over the construct; this keeps the platform selection and (per its front matter) remains "authoritative" for risk classification, which Publication §8 and Design Requirement 8 now restate.

**Action content.**
- **§Design Principles.** Resilient under "organized disruption, astroturf campaigns, SLAPP-related takedown requests".
- **§Function 1.** Discourse categories by "area of government, escalation stage, or group"; Reddit for public outreach; groups choose internal tools (Signal, email, in-person meetings); "The civic OS does not mandate internal communication tools."
- **§Function 2, OSF.** Preregistration "maps to the discovery/documentation phase of the escalation protocol".
- **§Resilience Architecture.** If the subreddit is banned, "Public outreach continues through the website, social media, and direct media engagement."
- **§Evidence Package Publication and Risk Classification (the core).** "The evidence itself … should be fully public. However, the legal strategy for acting on that evidence carries risk … A poorly filed legal action could create adverse precedent". Tier 1 *File Freely*: "CPRA requests, grand jury complaints, State Controller referrals, City Auditor complaints, Brown Act violation reports, public comment, and media outreach. Templates … included in the evidence package." Tier 2 *File with Caution*: "CPRA court petitions"; templates with advisory notes. Tier 3 *Do Not File Without Counsel*: Prop 218 challenges, CCP 526a taxpayer actions, federal consent decree motions, constitutional claims; no templates; "contact information for legal organizations" (HJTA, ACTA, First Amendment Coalition, Prop 218 specialists). "The risk classification is included in the evidence package metadata so that the public record reflects BIO's explicit guidance … if a court later considers whether a prior poorly litigated case should preclude a subsequent … case, the published risk classification is evidence that the prior filing was undertaken contrary to the evidence source's recommendation."
- **§Immediate Next Steps.** Forum category for "escalation tracking"; step 6 publish the sewer-fund Tier 1 materials (City Auditor report, CPRA request and nonresponse record) as the first work product. None dated or done.

**Fences.** Tier 3: no fileable templates. **Not amended** for the 2026-09-26 counsel packet (Design Requirement 8 and the Roadmap were).

## 4. `BIO_Functional_Architecture_v3.md`

**Status.** Working document April 2026, v3 annotations July 2026; no approval. Canon: "the functional analysis, not the v3 annotations". Its front matter: "the Compliance and Escalation skills remain unbuilt as named skills; the Communicate function's forum, directory and subreddit phase has not started."

**Action content.**
- **§The three layers.** Layer 3 Action: "Turn findings into outputs: work products, publications, escalations, communications, and ongoing tracking." Layers are concurrent, not phases; the five-phase workflow (Orient, Investigate, Document, Escalate, Monitor) is separate.
- **§Layer 1, Function 4 Monitor and notify.** Removed content "flagged as potential evidence of concealment"; notifications feed New Developments.
- **§Layer 2, Function 4 Evaluate significance (human judgment).** "Not every discrepancy is a violation. A city department that files a report two days late is technically noncompliant but may not warrant escalation. A $52.6 million unauthorized transfer … is a different matter. The determination of significance is human judgment"; the place where Operational Principle 1 is "most tested".
- **§Analysis outputs.** Compliant: "documented but does not trigger escalation. (Documenting compliance … demonstrates that BIO examines facts evenhandedly)". Noncompliant: "triggers the escalation protocol **if the group chooses to pursue it**." Unclear: "triggers a return to Layer 1 … and may result in CPRA requests, additional research, or outreach to other groups."
- **§Layer 3 Action.** Function 1 Document (work product meeting the publishing standard). Function 2 Evaluate and publish. **Function 3 Escalate:** "When findings reveal noncompliance, the seven-stage escalation protocol activates. The Escalation Skill identifies the current stage, available actions by risk tier, and upcoming deadlines. For Tier 1 and 2 actions, the skill produces filing templates pre-populated with case-specific facts. For Tier 3 actions, the skill identifies the legal theory and directs the group to appropriate legal counsel." **Function 4 Communicate:** with the BIO network (forum, directory, "working on" signals), the public (subreddit, media outreach) and the city (CPRA requests, public comment, council testimony), "governed by the operational principles: show your work, institutional framing, policy neutral." **Function 5 Track toward resolution:** "track the city's response and monitor for compliance changes. The exit condition is specific: compliance restored AND consequences addressed (Operational Principle 6) … **Partial compliance is documented but doesn't stop the clock.**" Resolution note: escalations and clocks persisted as Action objects; clock entries carry basis; overdue marked.
- **§Skills that power Layer 3.** Compliance Skill, Escalation Skill ("seven-stage protocol with tier-appropriate actions"), Monitoring Skill ("tracks deadlines, city responses, and compliance changes"). Skill inventory items 5 (Monitoring, Layers 1 and 3) and 8 (Escalation Protocol).
- **§Preamble annotation (not canon).** Humans are engaged for "acts of authority, judgment, and action".
- **§The three-layer workflow (2026-07-27 addition, outside canon).** "Layer 3 is the UI surfaces" (the numbering clash Action §5 row 14 reconciles).

**Fences.** Significance is human judgment; AI presents "for human evaluation, not as a determination". Policy neutral.

**Note.** The "six"→"seven" edit Action §6 lists is already applied here; the word "activates" in Function 3 was not changed (see Contradictions).

## 5. `BIO_Content_Framework_v0_10.md`

**Status.** Canon whole. Part I approved by Bob 2026-07-30 (v0.10); Part II reviewed by Bob 2026-09-14.

**Action content.**
- **§8.3 "The missing predecessor."** An absence in the past "either exists somewhere or does not exist at all, and either answer is worth having. **The first is a records request; the second is the case.**" Diagram: a missing successor → "records request"; a missing predecessor → "the case".
- **§8.4 Themes (D-162).** A theme is never a basis: "no basis leg, version leg or **action-basis leg** may rest on a theme", refused by name (C-81.1). Same for a member's lead (`MEMBER-KNOWLEDGE-DESIGN.md` §5; `construct-status.json` 10.lead, C-54.1).
- **§12 Intent, "This is not a new hierarchy."** "a step someone takes is an `action`, with `planned → active → awaiting_response → resolved → abandoned`."
- **§12 Satisfaction conditions.** "The gaps are the work list … the 5 missing solicitations are records requests with the request already specified." Diagram: OBJECTIVE "generates" "collection, resolution, records requests".
- **§12 The discovery loop.** A finding is a PROPOSAL; adoption is an authored act; a deferral is recorded with its reason; "An assistant may propose at any point in the loop and adopt at none of them. It can draft the decomposition, run the junction checks, assemble the progression and **write the records request**. The member's adoption is what makes any of it the group's position."
- **§12 "An assistant may open a focus unattended"** is *superseded by K1481*: every AI run but a member-authored standing question starts at a member's act.
- **§12.2 The pursuit record.** An aspiration accumulates "the records requests made and what came back", dead ends kept.
- **§9 (gap list).** `object_type` catalogue carries "information, focus, problem, project and action".
- **§18 (D-579, open).** "Not pinned yet: … an ACTION's basis leg … name only a bundle and have no slot for a capture."

**Fences.** Machine proposes, member adopts; a theme or lead never grounds an action.

**Open.** D-579: an action's basis leg is not version-pinned.

## 6. `BIO_Publication_v0_1.md`

**Status.** v0.1 DRAFT (2026-09-14, BOB #11), "Awaiting Bob's review", rules nothing of its own; canon whole (unreviewed drafts are canon as they stand). Carries many later Bob rulings (DEC-80, 100, 101, 105, 111, 112, 116, 118, 124–126, 132).

**Action content.**
- **§3 rule 6.** "The subject's right of reply is a declaration, not a gate" (DEC-13).
- **§3 rule 7.** Attribution at four levels; amended DEC-102: anonymous-level testimony is corroborated "to journalistic and legal standards before a finding rests on it".
- **§3 rule 9.** "Anything leaving the instance addressed to someone carries hash, date, author and both threshold floors in-band" (DEC-31's binding rule). The rule Action rule 7 calls "the in-band stamp".
- **§3 rule 15(d) (BOB #32, 2026-09-23).** "a quote is read 'by' the action's own **counterparty name**, matched EXACTLY; when nothing matches, 'by' is stated as undetermined" (NOT BUILT).
- **§5B "Working on" notices (DEC-111).** Directory and forum stay outside Civicsmith: after publication a member is offered links out and a prefilled directory submission "after the outward-act warning; nothing is sent automatically." A notice: only from a project, only by its owner, after a warning "that the public, including anyone being examined, will see it, and that stopping later will not unsay it"; carries the group slug, the owner's wording optionally naming the public body and matter, a start date, an activity level computed from members' acts only, optional "Interested in collaborating"; signed; sealed weekly proofs; ending says so with an optional handoff note; Stated/Reported/Proven at the directory.
- **§5D After publication: the docket, outside responses, withdrawal (DEC-100, DEC-116).** "A case is a waypoint, not an end product." The subject named in a case has "party-like standing": its responses are listed on the public docket; the group may grant standing; three shelves; the required core includes "every response the subject sends" and any captured public statement. **Outside responses:** found by a member, by "standing watches over known sources (a city's press page, council agendas)" or the assistant's labelled suggestion; "a contesting response prompts a re-evaluation notice, **may become a plan checkpoint, and a threat takes a pressure mark**." A reply naming a private person is listed without its text and the subject asked to resend. Only the project's manager places an entry in public. Withdrawal: signed, final, sends re-evaluation notices. **A court order** addressed to the group "is complied with, never silently; it is captured, a signed docket entry names it and the edition is stamped" (K1480). "Nothing is pushed and Civicsmith sends no email."
- **§6 Audiences and output acts.** An audience is a READER of a published case (D-156). AUDIENCES.md's rule: divergence between audiences is "a property of the OUTPUT ACT … who certifies it, whether it persists, and to whom it is delivered"; falsifier: "If the second audience built costs a new **`action_kind`** and a rendering, this is right. If it costs a field on the case, it is wrong." Certification and persistence "unmade"; addressing answered by §6A.
- **§6A The review copy (DEC-31's trigger, 2026-09-17).** An addressed act that stands beside publish and never leaves the instance; mutable; reached by a scoped, revocable, attributed read-and-comment grant; issued and revoked only by the project owner ("Sending unratified material to someone outside the group is the same kind of act as publishing"). §6A.3: a member who exports and emails a rendering makes it loose; the in-band quartet binds; the surface says at the act that what leaves cannot be revoked; the record does not log that a copy left.
- **§7 DEC-105.** Audience standards later take "the form already ruled for legal venues (K597 (3), K600 (b))": a sourced fact in the jurisdiction profile, "Undetermined" where none.
- **§7 DEC-118.** "The group leads everywhere it acts"; Civicsmith credited quietly. **DEC-132:** recording what kind of group it is publicly is "an outward act taken after the warning that the people the group examines will see what it is watching (principle 4.5)".
- **§8 Risk tiers.** Three tiers, quoted from Comms Platforms and Roadmap §8. "The field is `risk_tier` on the action schema." Placeholders removed (D-130, D-182): UNDETERMINED where no member stated a tier. "NOT BUILT: a member-facing tier chooser". §9 table: risk tiers "half-built and dishonest (D-182)".

**Fences.** One irreversible act (publish); addressed delivery never leaves; outward-act warning before any outward signal; nothing pushed, no email.

**Open.** Certification and persistence divergences (§6); the catalogue of standards by audience and output act (§7, OWED); the docket, case file, directory notices NOT BUILT (§9).

## 7. `BIO_Distribution_v0_1.md`

**Status.** v0.1 DRAFT (2026-09-14), awaiting review; canon whole.

**Action content.** None. All three hits are unrelated ("extraction tiers", "GitHub Actions" in §10 key custody). Relevant context only: §1–§2 each group runs a sovereign instance in its own account, which is why cross-group (joint) action needs cross-instance machinery; §7 several instances per account planned, not built.

## 8. `BIO_Complete_Roadmap_v5.md`

**Status.** Working document April 2026, v5 July 2026; no approval stated. Canon §§1–12 ("the mission of record"); §§13–15 are history per its own banner.

**Action content (canon part).**
- **§1 Origin (history narrative inside canon).** CPRA 26-3028: deadline missed, follow-up "threatening three enforcement actions: a CPRA petition …, a complaint with the Alameda County Grand Jury, and a referral to the California State Controller's Office." Legal enforcement pathways report.
- **§2 Strategic pivot.** "the city CAN ignore court orders, grand jury findings, CPRA deadlines; what it cannot ignore is SUSTAINED ATTENTION applied through legal mechanisms"; strategy of the "protection system" is to "run out the clock"; "a compliance-verification framework (not policy advocacy)"; "nothing short of a war … SLAPP suits, smear campaigns, infiltration".
- **§4 Core values** (sustained attention; duty to verify; credible facts; government must follow the law).
- **§5 Operational principles.** OP1 law and stated policies, no policy position; OP3 "The clock runs. Deadlines are deadlines."; OP6 "We pursue accountability to completion. Compliance restored. Consequences addressed." ("partial compliance doesn't stop the clock" lives in OP6's explanatory paragraph); OP7 "No group speaks for Believe in Oakland"; OP8 "Pressure against supporters is evidence … Document everything." Output must be disciplined; "residents should be allowed to be angry".
- **§6** restates Requirements 7 (seven stages), 8 (tiers), 12 ("No tool gates any work product or action"), 13, 14.
- **§8 Evidence package design and risk tiering.** "Evidence packages are the primary output of the escalation protocol." Tier lists (Tier 1 here omits City Auditor complaints and public comment). Tier 3 now includes the **counsel packet** (DR8 as amended 2026-09-26; Action §3).
- **§9 Skills 5 and 8.** Monitoring tracks deadlines and "alerts groups when attention is needed". Escalation Protocol: "Identifies current stage, trigger conditions, available actions by tier, deadlines. Produces Tier 1 and 2 filing templates pre-populated with case-specific facts."
- **§10 Five phases.** "Escalate (if warranted)"; "If noncompliant, protocol activates. Escalation Skill identifies stage and available actions by tier. **Human decides.**" Exit: compliance restored, consequences addressed. "Humans make every decision."
- **§11 Inter-group awareness.** "No group owns an issue"; the handoff pattern; DEC-111 working-on signals (above); DEC-96 acceptance of another group's work.
- **§12 UX.** Projects category: "Compliance dashboard. **Escalation tracker.** Sub-tabs: Evidence, Compliance, Escalation, Related Work." Communications: "Compose actions". Settings: group profile with "engagement basis".

**History part (not canon).** §13 sewer-fund live clock: file grand jury complaint (DocuSign), send Controller referral, evaluate CPRA petition ($435), consider a limited-scope CPRA attorney "to unlock mandatory fee provision"; near-term attorney, media and coalition lists; medium-term Prop 218 evaluation and the evidence package. §15 lists legal filings as not started. Appendix B: anti-SLAPP CCP 425.16 "Protects CPRA requests and grand jury complaints"; CPRA mandatory fees; 526a standing.

**Fences.** Human decides at Escalate; no policy advocacy.

## 9. `BIO_Design_Requirements_v2.md`

**Status.** Consolidated April 2026 (v2 June 2026); canon whole; amended by Bob 2026-09-26, 2026-09-30, 2026-10-01, 2026-10-05.

**Action content.**
- **Req 6 (amended K1483, 2026-10-05).** "Work products document institutional actions and compliance, and the people who carried them out"; persons named with their documented acts, positions, ties; "Accountability belongs to the role and the institution, and also to the person who acted"; "If the institution cannot answer for actions taken by predecessor occupants of a role, that failure of institutional recordkeeping is itself a compliance issue."
- **Req 7 Escalation (amended 2026-09-26 and 2026-09-30).** Seven stages: Discovery and Documentation, Notification, Clock Starts, Response Evaluation, Escalation to Legal Tools, Sustained Attention, **Political Accountability** (entered from Response Evaluation or Escalation to Legal Tools: "asking elected officials to act on the breach, oversight and audit requests, testimony, and legislation that restores or enforces an existing requirement. Policy advocacy and candidate support are not part of it"). "Each stage has defined entry conditions, defined actions, defined timelines, and documented trigger conditions for the next stage. **Any group or individual can initiate the protocol independently.** The protocol is designed to be mechanical: when trigger conditions are met, the next stage is proposed, and a member advances it. This removes the human hesitation that the protection system exploits." "The protocol never advances itself (Requirement 12)."
- **Req 8 (amended 2026-09-26).** Evidence packages fully public, including "identification of which laws or policies appear to have been violated"; legal theory identification is protected speech. Tier 1 adds "City Auditor whistleblower complaints … public comment at government meetings"; "**Any individual can initiate these actions.**" Tier 2 CPRA court petitions with advisory notes. Tier 3: no templates; legal organisations' contacts; **counsel packet** for counsel the group names, "never published, and never in a form that can be filed as it stands. Counsel drafts and files." "The risk classification is included in the evidence package metadata … The system minimizes financial barriers to escalation but **does not provide or manage funding**."
- **Req 10 (DEC-111).** Directory at believeincities.org/<place>; carries working-on notices.
- **Req 11 Starter materials.** "guide to available legal tools (CPRA requests, Brown Act attendance, grand jury complaints, Prop 218 challenges, State Controller referrals, CCP Section 526a taxpayer actions); guide to personal legal protections" (anti-SLAPP, whistleblower statutes); security guide: separate email for BIO correspondence; "communications with city officials may be subject to public records requests"; personal information visible in court filings; safety at council meetings; how to respond to legal threats.
- **Req 12.** "escalation protocol guidance that helps groups determine where they are in the seven-stage process and what the next step is"; "**No tool has authority to approve, reject, or gate any work product or action.**"
- **Req 13.** Opposition assumed; "The escalation protocol functions even if specific groups are disrupted or individuals are targeted. Pressure against supporters is documented as evidence per Operational Principle 8."
- **Req 14.** "No single person, group, platform, funding source, **attorney**, or institutional relationship is essential"; "Evidence packages are available for any actor to pick up."

**Fences.** No tool gates an action; Tier 3 never fileable; no policy advocacy or candidate support; no funding.

**Open.** Req 15's consensus mechanism; starter materials not started (front matter).

## 10. `BIO_Declared_Bias_v0_1.md`

**Status.** v0.1 DRAFT (2026-07-27) with ruled sections (DEC-6, 15, 20, 46, 103, BOB #31/32); canon whole.

**Action content.** None directly; the six hits are "interaction" and "transaction" (skipped). Relevant by reference: **HUNCH DEBT** (§"RULED 2026-08-01") is what Action rule 2 means by "hunch debt" on a plan's premises: a hunch counts for nothing in any strength reading (DEC-104), is visible as a hunch everywhere, and refuses publication (`UNCLEARED_HUNCH`) but nothing else; ordinary bias debt is disclosed and blocks nothing (DEC-20). A group's stake (Action rule 9, D6) may seed its declared bias (Publication §7 DEC-132).

## 11. `BIO_System_Design.md`

**Status.** v0.1 DRAFT (2026-09-14), awaiting review; canon "whole except §3's state column".

**Action content.**
- **§1 Purpose.** "Civicsmith exists to answer questions, make a case, tell a story, and **take action to affect a living civic system**"; the path's last verb is "impacting". The stance: better government; "all stakeholders are presumed to want better outcomes; bad actors are identified by EVIDENCE, never assumed by role". "derived things inform, authored acts bind" (DEC-24).
- **§2.** "outward **action** can say which findings justified it."
- **§3 row 16 Action** (added per Action §6): "standards, conformance determinations, consequences, action plans, actions, filings and communications, and the escalation protocol … where the record becomes civic effect; **every outward act is a member's, rests on the record, and names its basis**"; relates to inquiry (8), publication (13), standing intent and monitoring (10), the assistant (11), membership (1); home `BIO_Action_v0_1.md`, with `NOTIFICATIONS.md` for its reminders and `GRADE-A-CAPTURE.md` for the venue's standard of evidence; state "not rendered … the build state is `build/` (layer 9)". **Row 17** (people, events, money, obligations) relates to action (16).
- **§7 Doctrine spine.** "No structural prior against any class of actor; bad actors are identified by evidence."

**Note.** §4's class diagram and prose do not yet include Action as a node (rows 16–17 were added to §3 only).

## 12. `BIO_Bundle_Skill_Composite_Design_v1_7.md`

**Status.** v1.7 July 2026, superseded implementation; canon only "the bundle format, promotion semantics and C-series checks".

**Action content.** `types/ACTION.md`: "Action schema: lifecycle, clock discipline, risk tier"; type-specific write rules: "Action: clock entries with basis and the silently-past-due prohibition, resolution enum". Write table: "Create or update Action: core + ACTION"; "Distribute a Work Product: core + (PROJECT or ACTION) + DISTRIBUTION" (DISTRIBUTION.md: "risk tiering; evidence packaging"). Validation history: "the CPRA Action with its statutory clock honestly overdue". Other hits are "extraction" (skipped).

## 13. `CONSTRUCTS.md`

**Status.** Dated inventory of 2026-07-30; **reference, not canon**.

**Action content.** None on civic actions. Hits: "extraction" (skipped) and Step 9's "an unactioned machine finding moves to `deferred` with its reason rather than vanishing" (ageing of findings; skipped as generic).

## 14. `construct-status.json`

**Status.** **Retired** (`requirements/README.md`: replaced by the build state `build/` and each module's tests). Its claims are a late-September snapshot of what was built.

**Action content (claims under construct 8, all `BUILT`).**
- **8.action:** "the action plan and its correspondence"; an action is projected from its own bytes (D-510); `action_basis`, `correspondence` and `action_quotes` projections; type changes on revision refused (D-547).
- **8.risk-tier:** 1, 2, 3 or UNDETERMINED, "never defaulted to 1 (D-182)"; the setup page offers the tiers, unset by default (D-483).
- **8.risk-tier-revision:** a member revises the tier "by an AUTHORED, APPEND-ONLY act with a REQUIRED reason (op=actionrisktier)"; a machine is refused `MACHINE_CANNOT_SET_RISK_TIER`.
- **8.fee-quote:** "A FEE QUOTE IS EVIDENCE (D-148)": amount, currency, stated basis verbatim, the sent entry it answers, revisions (a waiver is a revision to zero); read by counterparty or by request, "judges none".
- **8.records-lifecycle:** "A RECORDS REQUEST IS ONE ROUND TRIP (D-147)": correspondence `stage` (sent: request, fee_waiver_request, appeal, court_filing; received: acknowledgement, fee_estimate, fee_waiver_decision, extension_notice, production, denial, appeal_decision, court_decision), `follows`, `outcome` (granted, denied, partial, reversed, affirmed, none_stated), `exemptions` verbatim, member-stated `due_by` with `due_cite` that must be one of the action's governing laws (DUE_CITE_NOT_GOVERNING); the lifecycle read derives open / passed_unanswered / followed_by_due / followed_after_due or UNDETERMINED.
- **8.governing-laws:** "a records request names every law that governs it (D-149)" by citation and level (federal, state, local), a member's act; machine refused; empty list reads UNDETERMINED, "never federal"; "The plane encodes no law's rules"; a machine proposal is stored apart (`op=actionlawspropose`).
- **6.themes, 10.lead:** a theme or a lead is refused as an action-basis leg.

## 15. `BIO_Assistant_and_AI_Roles_v0_1.md`

**Status.** v0.1 DRAFT (2026-09-14), awaiting review; canon whole; carries later rulings (DEC-113, DEC-125, K1880, K1899, D2, D4, D21, D56).

**Action content.**
- **§2.** Two acts beside the roles: the assistant may **request capture**, and "may **initiate an act** that then runs its four beats with the member acting (DEC-27: 'the assistant CONDUCTS and the member ACTS')".
- **§3 rule 1–4.** "The machine proposes; the member authors"; "the machine never writes the member's reason"; "The machine may not choose the question"; machine work labelled; "A checker raises; it never resolves. No machine credential performs the attested act"; attested acts only from a human's own session, never a bearer token.
- **§3 rule 6 (DEC-113).** Litigation hold: "hold in place" stops transcript deletions for the threatened project.
- **§3 rule 9 (D56, 2026-10-09).** The one permitted generated text beyond the member's own words is a labelled draft of a case's written account, checked sentence by sentence before publication; "no generated justification anywhere".
- **§3 rules 11–12 (K1880, K1899).** The assistant may read any public site; nothing so read enters the record; it may ask to capture only an address the record already holds.
- Other hits ("extraction", the `airun` op's "actions" `suggest` and `capturerequest`) skipped.

## 16. `BIO_State_Rules_Consistency_v1_5.md`

**Status.** v1.5, "Ratified July 20, 2026 on the operator's word"; canon "§3 onward"; §1, §2.4, §2.6 history. **Amended 2026-09-30 for the Action layer** (§"Amendment: the Action layer", K608).

**Action content.**
- **§1.2 ID grammar.** Types INFO, PROB, PROJ, ACTN (regex not updated for PLN-, STD-, CONF-, CONS-, ESC-, which the amendment introduces or cites as "layer-9 types (K171)").
- **§3.1.** `object_type: … | action`.
- **§4.4 Action (original).** Record file `action.md` (plan, correspondence log, outcome record). `action_kind: cpra_request | grand_jury | controller_referral | public_comment | media | litigation_support | other`. `risk_tier: 1 | 2 | 3 | undetermined` (D-182). `clock[]` entries with text, description, date, **basis**, status (`pending | met | overdue | waived`). `counterparty` (free text in the example). Lifecycle `planned → active → awaiting_response → resolved (complied, denied, escalated, withdrawn) | abandoned (reason-gated)`. "The clock array is the authoritative deadline register the Monitoring skill watches". Prose sections Plan, Status, Correspondence, Session Log, Review Notes.
- **§4.3 Project.** Distribution "applies the three-tier risk classification"; `closed_reason: resolved, superseded, abandoned`.
- **§5.1 Typed edges.** `initiates (Project to Action)`, lives on the Project (§5.2).
- **§5.4 Cascade.** reeval_pending on dependents (withdrawals and responses use this path per Publication §5D).
- **§6 I-11 Clock discipline.** "Every Action clock entry has a basis and a valid date; overdue entries are marked overdue, not silently stale." Repair (§7): supply basis; mark overdue; mark waived with reason.
- **§6 I-19 Expunge.** Reason classes gain court-order and lawful-demand (K1480, K1493).
- **§6 I-20 Mechanical writers.** `deadline-recheck` "may change clock entry status and last_updated" (the one machine write on an action).
- **Amendment 2026-09-30.** `PLN-` action plan: states `open`, `closed`, one edge by a member's act with a reason; "a plan never closes itself". `counterparty` is the **addressee**: office by role and body; reporter or outlet, organisation or civic group by role and organisation; or a described audience; "never a private individual"; breach actions addressed to an office. Kinds: product's own (`records_request`, `request_for_comment`, `other`) plus the profile's; old kinds read as written. Resolutions add `completed`. Optional `contact` (member), `plan` and `option` (set at creation, never changed). §5.1 gains `action_basis`, `responds_to`, `references`.

## 17. `BIO_Interaction_Constructs_v0_1.md`

**Status.** v0.2 (file named v0_1), 2026-07-31 with embedded rulings (DEC-8, 10, 16, 19, 27, 36, 82, 87, 88, 99, 106, 128, 129, 131, 135, 138, 142, 143); canon whole.

**Action content (most hits are generic UI "action"; these bear on outward acts).**
- **§The revised set.** QUEUE: items "grouped by the case they belong to"; OBLIGATION ("To do") vs FINDING ("Noticed") vs CONDITION ("Status"); a condition is "actionable" when a member's action can change it. DEC-16: one member's resolution settles an event for every ancestor, attributed. ACT: "choose, see what it will refuse and why BEFORE it runs, author the reason, get a receipt." The rung ladder: reversible, reasoned, terminal, attested, IRREVERSIBLE (publish).
- **§T TASK.** "an obligation with an assignee, and sometimes a clock"; DEC-135 task addressed by expertise; "a task is never silently dropped. Unactioned, it AGES with a recorded reason"; "addressed to somebody or honestly `unassigned`".
- **§F Friction matches weight (DEC-87, DEC-88).** "Friction also follows consequence in the world": "An act whose effect cannot be taken back outside the record (a disclosure once read, a person named in the registry, a group-wide gate, **a step toward something leaving the group**) opens the full dialog that states that effect, whatever its rung". DEC-143: an act that can never be undone shows the Irreversible weight.
- **§W Working and published (DEC-106).** "a review copy … and **an outgoing draft** each appear inside the working frame with a band saying what it is and who can see it"; publishing is the only crossing.
- **§R Who we design for (DEC-128).** Invited in: "the group's lawyer receiving a counsel packet". Outside: government offices and officials, oversight bodies, partner groups ("work flows both ways"). "**residents addressed by an action meet the group's words, not its screens**." "a public body may itself run a copy, so the design never assumes the group stands outside government."

## 18. `BIO_Intake_Doctrine_v1_1.md`

**Status.** v1.1 (content v1.2), "Ratified July 18, 2026 on the operator's word"; canon whole; amended per Action §6.

**Action content.**
- **§1a may-not-hold rail.** "upon discovery of unlawful material, an authorized member takes prompt recorded action, destruction and any **legally required reporting**, never silent retention" (an outward reporting act outside the Action layer).
- **§3 Capture grades (amended per Action rule 13).** Grade A "the ceiling for adversarial or legal use (**a ceiling, not a minimum: the venue sets the standard of evidence, and no action is refused for its grade**; `BIO_Action_v0_1.md` §4 rule 13)". Co-attested Grade B "the working floor for verified state on contested claims".
- **§6 The escalation ladder and blanket direction.** (A different "escalation": daemon → session → human.) Humans are engaged for "acts of authority …, acts of judgment the tools cannot make, and **acts in the world**"; the workflow lets "humans focus on judgment, assessment, communication, and action."
- **§9 Creation authority.** "**No actor class creates Actions mechanically; an Action is an act in the world and begins as a member decision.**"

## 19. `docs/architecture/README.md`

**Status.** **Retired** (replaced by `requirements/README.md`); "as of 2026-09-25", so it has no entry for `BIO_Action_v0_1.md`.

**Action content.** Only the Functional Architecture's catalogue line ("Information, Analysis, and Action"); the other two hits are "extraction". Nothing new.

## 20. Canon outside `docs/architecture/` (from `requirements/README.md`)

Canon documents with action content not in the list above: `BIO_Case_Making_v0_1.md`, `BIO_Investigation_v0_1.md`, `BIO_Action_v0_1.md`, `BIO_Capability_Ladders_v0_1.md` (all R1's). In `docs/development/` (level-2 canon), searched for action, escalation, records request, correspondence, CPRA, counsel, filing:

- **`NOTIFICATIONS.md` (canon whole; partially complete).** The queue's catalogue. OBLIGATION internally, "To do" to members (DEC-107): "obligation" is kept for a public body's own duty; "Each item's own sentence still names whose step it is where that matters ('our plan's checkpoint', 'the city's deadline')". "a member task frequently arises BECAUSE a civic obligation was observed unmet." Clock-driven kinds: overdue required successor, temporal expectation coming due, bias-debt re-run, "monitoring recheck due / deadline sweep [CONDITION] (S-7)". Item contract carries `deadline: <instant> | null`; options come from the producer. DEC-10: the overdue notice offers "(a) remind me again at a further increment, (b) stop notifying me about this one, (c) stop notifying me about that group"; an OBLIGATION is never mutable. DEC-110: queue re-sortable by "time due". **No catalogue kind exists for an action's deadline, an escalation trigger met, a plan checkpoint, or a reply received.** §What this does not settle: "Transport … might one day BE email … a separate decision".
- **`UI-KICKOFF.md` (canon: the principles).** "DR-13, the tell discipline. Asking a public archive to fetch a URL publishes the group's interest. **Surfaces that trigger outward-visible acts say so at the point of the act**." IA question: "how Focuses, Information, Projects and Actions relate on screen".
- **`INVESTIGATIVE-SESSION.md` (canon whole).** DEC-113 litigation hold: "the member's recorded statement on **a reply marked as a legal threat**", stopping deletions "for assistant sessions in the threatened action's project"; placing is light and "open to any member who can see the action"; releasing is heavier; "Counsel's review of these defaults before a group relies on them is advised." The single-bundle projection "derives an action's overdue ON READ". Replay fences include "the inquiry and action basis arms, the correspondence arms … and C-32.19's rule that no machine writes a member's `risk_tier`".
- **`ASSISTANT-PILOT.md` (canon whole).** DEC-120/121: "A step may place a labelled draft in a field: … **an offered filing template**, a named machine draft …; No step submits, signs or files; the member alone presses the act's button".
- **`LINK-FIDELITY.md` (canon whole; self-described DRAFT).** "Where a project reaches legal action there are discovery, forensics, and supporting-evidence processes … investigations and actions routinely proceed without them" (why version rigor is optional).
- **`RETRIEVAL-SUBSTRATE.md`, `INBOX-GRAMMAR.md`, `SOURCE-ACCESS.md`, `CONTRADICTION-IDENTIFY-DESIGN.md`, `EXTRACTION-BREADTH-DESIGN.md`, `OBSERVATION-LOG-DESIGN.md`, `CONTENT-SEARCH-DESIGN.md`, `DOCUMENT-PROFILES.md`, `MEMBER-KNOWLEDGE-DESIGN.md`:** hits are generic ("the research, analysis, reporting, and action workflow", selection-scoped acts, "forwarding a member action", extraction-tier "escalation", "outside counsel" on source access, a lead never an action-basis leg). Nothing on civic actions beyond what is cited above. `SCHEDULER.md`, `AUTHORITY-AND-TRUST.md`, `OFFICE-FORMATS.md`, `ARCHIVE-FALLBACK.md`, `CAPTURE-FIDELITY.md`, `CLIENT-RENDERED.md`, `MULTI-INSTANCE-ISOLATION.md`, `CONTENT-EXTENT-DESIGN-SPACE.md`: no hits.
- **Not canon but named by System Design row 16:** `docs/development/GRADE-A-CAPTURE.md` (the venue's standard of evidence). Not read here.

---

## Constructs or rules about actions found here that are absent from `BIO_Action_v0_1.md`

1. **The records-request mechanics.** One-round-trip lifecycle stages, the closed outcome vocabulary on correspondence, verbatim exemptions, member-stated `due_by` with a `due_cite` that must be one of the action's governing laws (D-147); a fee quote is evidence (D-148); a records request names every governing law at its level, machine proposals stored apart, an empty list UNDETERMINED (D-149). All BUILT (`construct-status.json` 8.records-lifecycle, 8.fee-quote, 8.governing-laws). They were ruled in Case Making §2, whose action paragraphs Action §6 made "history"; Action mentions only the correspondence entry's due date (§5 row 4) and the outcome vocabulary (row 7). **Risk: the canonical home of D-147/148/149 is now unclear.**
2. **Revising the risk tier** is an authored, append-only act with a required reason; a machine is refused (8.risk-tier-revision). Action says only "an action's tier set by a member" (§5 row 10).
3. **The published risk classification as a protective public statement.** The tier goes into the evidence-package metadata so the public record shows the group's guidance, which protects later litigants against preclusion (Comms Platforms; DR 8; Publication §8). Action does not say whether or where an action's tier is published.
4. **The evidence package** as "the primary output of the escalation protocol" that carries Tier 1–2 templates and that "any actor" can pick up (Roadmap §8; DR 8, 14). Action names it only in rule 12 (it survives disruption). Its relation to the published case and the case file (Publication §5C) is not stated.
5. **Partial compliance does not stop the clock** (Functional Architecture Function 5; Roadmap OP6's paragraph). Action keeps "partial" only as an escalation evaluation value.
6. **"Any group or individual can initiate the protocol independently"** and "any individual can initiate" Tier 1 (DR 7, 8). Action cites Requirement 8 only in its §8 reasoning.
7. **No tool provides or manages funding; minimise financial barriers** (DR 8). Action rule 8 forbids budgets in the plan but says nothing about funding or fees (except fee quotes, item 1).
8. **Content Framework's loop into actions.** An objective's gaps generate "records requests with the request already specified"; a missing predecessor makes one; the assistant may "write the records request" as a proposal; an aspiration's pursuit record keeps "the records requests made and what came back" (CF §8.3, §12, §12.2). Action's plan starts from an inquiry, a determination or a suspicion, not from a satisfaction-condition gap.
9. **No action-basis on a theme or a lead** (CF §8.4, C-81.1; 10.lead, C-54.1), and an action's basis leg is not yet version-pinned (CF §18, D-579).
10. **"No actor class creates Actions mechanically"** (Intake §9) is the creation-side form of Action rule 1. Not cited.
11. **Litigation hold on a reply marked as a legal threat** (DEC-113; Assistant rule 6; INVESTIGATIVE-SESSION). It is attached to "the threatened action's project". Action rule 12 prepares for legal harassment but does not name the hold or the "legal threat" marking on a reply.
12. **The docket and outside responses** (Publication §5D, DEC-100/116): the subject's standing, responses listed publicly, a contesting response "may become a plan checkpoint", "a threat takes a pressure mark", court orders complied with and docketed (K1480). Action has `responds_to` for replies to an action but does not say how a reply to an action relates to a docket entry on a case, or what a "pressure mark" is.
13. **"Working on" notices** (Publication §5B, DEC-111) and the outward-act warning before any outward signal, including declaring the group's kind (DEC-132). Both are outward communications the Action layer does not mention (§5 row 9 puts distribution outside the layer, but these are not distribution).
14. **The tell discipline at the act** (DR-13, UI-KICKOFF) and **friction for "a step toward something leaving the group"** (Interaction Constructs §F, DEC-88). Also **an outgoing draft shown inside the working frame with a band** (§W, DEC-106). Action's sketches (DEC-115) bind wording but the rules are not restated.
15. **Residents addressed by an action meet the group's words, not its screens** (Interaction Constructs §R, DEC-128). A public body may run its own copy (same section).
16. **The queue's place for action reminders.** NOTIFICATIONS has no catalogue kinds for an action's deadline, a met escalation trigger, a plan checkpoint, or a reply received. Its item sentence names "our plan's checkpoint" or "the city's deadline"; DEC-10's "remind me again at a further increment"; an OBLIGATION is unmutable. Action rule 5 states the reminder rules but not the queue kinds.
17. **Routing by expertise** (Membership §1.3, DEC-135): ask for a check by expertise, for example a lawyer member to look at a Brown Act claim before filing. Action's `contact` is a single member.
18. **The action suite's wider kinds.** TAD §2 and §8.3 name calendaring, prosecutions, negotiations, settlement and collaboration, a negotiation tracker, and inbound response-generating surfaces (surveys, forms, email campaigns, "seam-now, build-later"). Action has profile kinds, no negotiation or settlement tracking, no campaigns, and defers joint action.
19. **Starter-kit legal protections** (DR 11; Roadmap App. B). These are the guide to legal tools and personal legal protections: anti-SLAPP covers CPRA requests and grand jury complaints, correspondence with officials may itself be requested, and a separate email address is advised. Action rule 12 prepares for opposition but has no member guidance.
20. **"Legally required reporting" of unlawful material** (Intake §1a) is an outward act the group must take, outside Action's kinds.
21. **Accountability of persons** (DR 6 as amended, K1483): an institution that cannot answer for its predecessors' acts is "itself a compliance issue". Action's Consequence names persons only as DR 6 allows. It does not carry the predecessor rule into determinations.
22. **Publication rule 15(d):** a quote is attributed "by" the action's counterparty name, matched exactly. Action's addressee by role changes what that match reads (see Contradictions).
23. **Audience output acts as action kinds** (Publication §6: "a new `action_kind` and a rendering") and the owed catalogue of standards by audience and output act (§7). Action keeps audience as a reader (row 12) and is silent on output-act certification and persistence.
24. **The Escalation and Monitoring skills' functional description.** "Identifies current stage, trigger conditions, available actions by tier, deadlines" (Roadmap Skill 8; FA Function 3). Action places this in the assistant and monitoring layer 10 without naming the skill.

## Contradictions between documents

1. **What an action is.** Content Framework §12: "a step someone takes is an `action`" (any step toward an objective). Action §3: "one outward engagement". TAD §2: "a pursued course from the action suite … Carries the clock." These are three scopes. A records request is all three; a group's internal step is an action only under the Content Framework.
2. **Mechanical vs proposed escalation.** DR 7 was amended (a trigger proposes, a member advances). FA Function 3 still says "the seven-stage escalation protocol activates", and Roadmap §10 says "If noncompliant, protocol activates … Human decides". FA's Analysis outputs say "triggers the escalation protocol if the group chooses to pursue it". Action §6 edited only "six"→"seven" in these two documents.
3. **Work products of an Action.** TAD §2 and §4, and the Bundle Skill write table, let an Action bundle hold and distribute a Work Product. Publication §3 rule 2 says only a project publishes, through its cases (DEC-72). Action rule 7 says a plan is never published (DEC-25). TAD's mechanism is superseded by its own banner, but its §4 "Decision" still reads as a general rule.
4. **Tier 3 contents.** Comms Platforms (reference) says Tier 3 gives contact information only and no legal packaging. DR 8, Roadmap §8 and Action add the counsel packet. Comms Platforms was not amended.
5. **Tier 1 membership.** The lists differ. Comms Platforms: "City Auditor complaints … public comment". DR 8: "City Auditor whistleblower complaints … public comment at government meetings". Roadmap §8 omits both. Action defers kinds and tiers to the jurisdiction profile, so no canonical list exists.
6. **Risk-tier build state.** Publication §8 and §9 say "NOT BUILT: a member-facing tier chooser" and "half-built and dishonest". `construct-status.json` 8.risk-tier (D-483) says the setup page offers the tiers, and 8.risk-tier-revision is BUILT. Publication is stale; the JSON is retired, so `build/` should decide.
7. **Overdue: marked or derived.** State Rules I-11 ("overdue entries are marked overdue") and I-20 (deadline-recheck writes clock status) against INVESTIGATIVE-SESSION ("derives an action's overdue ON READ") and Action §5 row 4 (both: derived on read, plus one mechanical pending→overdue mark). I-11's text was not amended.
8. **Counterparty.** State Rules §4.4's example is a free-text name, amended to role-based addressee. Publication §3 rule 15(d) (2026-09-23, before the amendment) matches a quote "by the action's own counterparty name … EXACTLY". After the amendment the counterparty is a role and body, so the exact-name match may read UNDETERMINED for most quotes. Neither document reconciles this.
9. **Action kinds.** State Rules §4.4 still lists the seven state-specific kinds. Its own amendment and Action §5 row 6 replace them with product kinds plus profile kinds. Publication §6 treats `action_kind` as the unit by which audiences' output acts differ. These are three different readings of one field.
10. **Notification transport.** NOTIFICATIONS ("What this does not settle") leaves email transport open. Action rule 5 says "no outside channel"; DEC-133 and Publication §5D say "Civicsmith sends no email". The open question in NOTIFICATIONS is now closed by later rulings but still reads as open.
11. **Stance toward government.** Roadmap §2 calls it "nothing short of a war" against the "protection system". System Design §1 says all stakeholders are presumed to want better outcomes. Action §5 row 15 and rule 12 reconcile the two; the Roadmap text is unchanged.
12. **"Escalation" means two things.** It is the seven-stage protocol (DR 7, Action) and also the Intake Doctrine §6 "escalation ladder" (daemon → session → human), which the FA v3 annotation imports. Extraction-tier "escalation" (EXTRACTION-BREADTH-DESIGN) is a third use. This is a naming collision, not a doctrinal conflict.
13. **ID grammar.** State Rules §1.2 still lists only `INFO|PROB|PROJ|ACTN`. Its 2026-09-30 amendment adds `PLN-` and cites `STD-`, `CONF-`, `CONS-`, `ESC-`, so the document disagrees with itself.
14. **Compliance and action.** FA "Analysis outputs" says compliant is "documented but does not trigger escalation". Action rule 4 says a compliant determination may start a plan ("recognition and success stories are actions"). This is not a direct conflict, since escalation ≠ action, but FA presents compliance as the end of the line.
15. **System Design self-consistency.** §3 has row 16 Action, but §4's dependency prose and class diagram omit Action.
