# Believe in Oakland

> **Editorial note, July 27, 2026 (Bob's directive):** the construct formerly
> named **Problem** is renamed **Focus** throughout, which conveys its purpose
> non-judgmentally. Machine literals shown here use the target vocabulary
> (`focus`, `focus@1`, `focuses/`, `focus.md`); the legacy literals (`problem`,
> `problem@1`, `problems/`, `problem.md`) remain valid aliases in existing
> append-only history and in code until the rename arc lands.

# Civic Operating System

## Complete Roadmap and Architecture Document

*We believe Oakland can be the city it's supposed to be. We believe that
starts with holding our government to the same standards it sets for
itself. We believe that sustained attention, grounded in facts and
guided by law, is how citizens make that happen.*

**believeinoakland.org**

Working Document --- April 2026 (v5, July 20, 2026: status annotation
layer against the P2 development ladder; the plan text of v4 is
unchanged)

This document serves as a comprehensive roadmap, intermediate
architecture specification, and handoff document for the Believe in
Oakland civic operating system. It captures every design decision,
architectural specification, and pending work item as of July 2026.
Companion documents contain the authoritative text for specific
components and are referenced throughout.

**Status annotation layer (v5, July 20, 2026).** v5 changes no plan
text; it corrects the document's status claims, which had diverged badly
from the built system, using the annotation pattern of
BIO_Functional_Architecture. Read every status statement below through
this note. Development since v4 followed the P2 development ladder
(P2-LADDER-R1.md in the bio-bundle tree), not this document's phase
numbering, and the two numbering schemes are unrelated: this document's
Phase 1 through Phase 5 describe the adoption roadmap; the ladder's
M-rungs describe the build. Where this document says something is not
started and the annotation below says otherwise, the annotation governs;
the authoritative record is the tree (bio-bundle rev 0.1.48, README
governance line) and the production store itself.

Status as of July 20, 2026: the composite bundle skill is built and in
production (bio-bundle rev 0.1.48; bio-checks 1.9.0 with twenty
invariant families under the Mechanical Verification Law; accelerator
0.10.2 deployed with the M2' daemon live-fire verified; PWA client 0.7.0
at milestone M6, Netlify deployment pending). The production store
carries 25 information bundles (9 released to verified under I-18 member
authority), the first elevated Focus, and the first forming Project,
all on the sewer franchise pilot. The intake architecture is governed by
BIO_Intake_Doctrine v1.0 (ratified July 18, 2026), which joined the
document set after v4 and governs admission, capture grades,
co-attestation, release authority, and the distribution container
(BagIt); Section 14's Phase 1 list is complete in substance, with two
deviations recorded honestly: the client shell exceeded the "minimal"
scope (a full PWA at M6), and the Compliance Evaluation and Escalation
Protocol functional skills remain unbuilt as named skills, their
load-bearing pieces (the evaluation model, the citation register, the
readiness ladder) having landed in the data layer instead. This
document's Phase 2 (website, forum, subreddit) remains genuinely not
started.

# Companion documents

This roadmap is the overarching architecture document. Companion
documents contain the authoritative specifications for specific
components. Where this roadmap describes content covered by a companion
document, it provides orientation-level summaries and directs the reader
to the authoritative source. The companion documents are:

**BelieveInOakland_Overview.docx** --- One-page public introduction.
Contains the preamble, a summary of the problem and approach, and the
four core values. Designed for sharing with potential supporters and the
general public. Produced for and shared at a gathering of friends, April
2026.

**BIO_Design_Requirements.docx** --- The authoritative specification for
all fifteen design requirements organized into eight categories
(Architecture, Quality and Publishing, Escalation, Communication and
Access, Onboarding, Tools, Resilience, Evolution). Includes the complete
text of each requirement with full explanatory context. Also contains
the core values and operational principles as a reference appendix. This
is the engineering document. If any text in this roadmap conflicts with
the Design Requirements document, the Design Requirements document
governs.

**BIO_Communications_Platforms.docx** --- Platform recommendations for
communication, work product publishing, and the directory/gateway
function. Includes design principles for platform selection, detailed
analysis of recommended platforms (Discourse, Reddit, Signal, Google
Drive, OSF), the platform comparison summary table, resilience
architecture with failure scenarios and continuity paths, evidence
package risk classification (three-tier system), and immediate
implementation steps.

**BIO_Functional_Architecture** --- The three-layer functional
architecture (Information, Analysis, Action). Maps every group function
to a layer and identifies the AI skills supporting each. It is the
source of the eight-skill inventory used in Section 9 of this document.

**BIO_Technical_Architecture_Decisions** --- The authoritative record of
technology and architecture decisions: the six-object data model
(Information, Focus, Project, Action, Annotation, Work Product), the
bundle as the unit of persisted work, the composite bundle skill as the
single write authority, Work Product source-grounding and the two
evaluation functions, the no-transitive-trust integrity rule, the
Session abstraction with three execution modes, the UX architecture
(static local-first PWA), the technology stack, and decentralized
continuity and resource discipline. If any text in this roadmap
conflicts with that document on technology or architecture matters, the
Technical Architecture Decisions document governs.

**BIO_State_Rules_Consistency** --- The data-store specification the
Technical Architecture Decisions document defers to: store layout and
canonical naming, bundle anatomy, the universal frontmatter core plus
per-type schemas, the six per-type state machines, the typed reference
model with cascade semantics, the invariant set, the violation-to-repair
mapping, and the Mechanical Verification Law. If any text in this
roadmap or the Technical Architecture Decisions document conflicts with
it on data-store matters, the State Rules & Consistency specification
governs.

# Contents

-   Origin: the Oakland sewer fund investigation

-   Strategic pivot: from campaign to civic OS

-   Name, identity, and preamble

-   Core values (4, finalized)

-   Operational principles (8, finalized)

-   Design requirements (15, finalized)

-   Communication and publishing platform architecture

-   Evidence package design and risk tiering

-   AI skill architecture (8 skills)

-   Group workflow architecture (5 phases)

-   Trust hierarchy and inter-group awareness

-   User experience and interface design

-   Sewer fund campaign: time-sensitive items

-   Implementation roadmap and critical path

-   Pending items and open questions

Appendix A: key officials and institutional actors Appendix B: legal
framework summary

# 1. Origin: the Oakland sewer fund investigation

In February 2022, Oakland's City Auditor confirmed that \$52.6 million
in sewer maintenance fees had been diverted from the Sewer Service Fund
to the General Purpose Fund over nine fiscal years (FY 2012-2021). The
transfers, labeled as "sewer franchise fees" at approximately 10% of
sewer service charge revenues, were made without City Council
authorization, without a documented franchise agreement, without a legal
basis in the Oakland Municipal Code, and in potential violation of
Proposition 218 (California Constitution Article XIII D, Section
6(b)(2)), which restricts fee revenue to the purpose for which the fee
was imposed.

The City Auditor issued four corrective recommendations. The City
Administration set an October 2023 deadline to implement them. As of
April 2026, the city has implemented none of them.

The explicit "franchise fee" label appears to have been discontinued
sometime between FY 2021 and FY 2024, but OpenGov portal data shows
transfers from the Sewer Service Fund continue at \$1.6M to \$2.8M
annually, trending upward to \$2.77M budgeted for FY 2026-27. The
transfers may have been relabeled as cost allocations or overhead
charges.

## CPRA Request 26-3028

Filed March 19, 2026 via the NextRequest portal, directed to the Finance
Department - Controller (Audrey Lamb, point of contact). The request
covers FY 2019-20 through 2024-25 and asks for: all interfund transfers
from the Sewer Service Fund to any other fund, all cost allocations
charged to the Sewer Service Fund, the Statement of Revenues, Expenses,
and Changes in Fund Net Position for the Sewer Service Fund from each
year's ACFR, the city's cost allocation plan, all documents related to
the sewer franchise fee, and all City Auditor follow-up records on the
February 2022 recommendations.

The 10-day statutory deadline (Government Code 7922.535) expired March
30, 2026 with no response, no extension notice, and no acknowledgment. A
follow-up message was sent March 31, 2026 setting an April 7 deadline
and threatening three enforcement actions: a CPRA petition in Alameda
County Superior Court, a complaint with the Alameda County Grand Jury,
and a referral to the California State Controller's Office.

As of mid-April 2026, the city has not responded.

## Research documents produced

Two deep research reports were produced through extended search in the
earlier session:

**Legal enforcement pathways report.** Comprehensive analysis of three
parallel legal mechanisms: CPRA petition (Gov. Code 7923.000), grand
jury complaint (Penal Code 925a), and State Controller referral
(Gov. Code 12422.5(e)). Includes step-by-step filing procedures, cost
information, burden of proof analysis, and significance of total
nonresponse. Key precedents: Carachure v. City of Azusa (2025), Zolly v.
City of Oakland (2022), Howard Jarvis v. Roseville (2002), Howard Jarvis
v. Fresno (2005). See Appendix B for legal framework summary.

**Structural diagnosis of Oakland's accountability failures.**
Systems-level analysis documenting: the five-stage accountability
evasion cycle, the interlocking protection network (unions, City
Attorney, external auditor, Council), the 23-year OPD consent decree as
a case study, and three vulnerability points (EPA consent decree, Prop
218 litigation, charter reform). See Appendix A for key officials.

# 2. Strategic pivot: from campaign to civic OS

The sewer fund investigation revealed a fundamental strategic problem:
Oakland's protection system is optimized to absorb any single pressure
vector. Individual lawsuits, audit findings, grand jury reports, and
media investigations have all failed to produce sustained change because
the city's strategy is simple: run out the clock, count on citizens
losing energy, treat noncompliance penalties as a cost of doing
business.

This led to a pivot from a tactical legal campaign to the design of a
distributed civic operating system. The sewer fund becomes the
proof-of-concept, not the endpoint. The real objective: change the
relationship between Oakland residents and their government so that the
protection system loses its oxygen supply.

Key strategic insights:

-   The city CAN ignore court orders, grand jury findings, CPRA
    > deadlines; what it cannot ignore is SUSTAINED ATTENTION applied
    > through legal mechanisms.

-   Citizen apathy is rational learned helplessness, not laziness; the
    > system must demonstrate a credible path to results.

-   The protection system exploits identity-based fragmentation; a
    > compliance-verification framework (not policy advocacy) is
    > genuinely non-partisan.

-   The distributed architecture is the primary defense: no leader to
    > exhaust, no organization to co-opt, no headquarters to picket.

-   The creation, evolution, and expansion of BIO will be nothing short
    > of a war. The protection system will throw everything at it: SLAPP
    > suits, smear campaigns, infiltration, racial/class weaponization,
    > the "Believe in Oakland is destroying Oakland" inversion
    > narrative. The architecture is designed to survive all of these.

# 3. Name, identity, and preamble

**Name:** Believe in Oakland. Domain believeinoakland.org registered.

**Portability:** "Believe in Richmond," "Believe in California,"
"Believe in America." The framework is explicitly designed for adoption
by other communities.

**Preamble:** *"**We believe Oakland can be the city it's supposed to
be. We believe that starts with holding our government to the same
standards it sets for itself. We believe that sustained attention,
grounded in facts and guided by law, is how citizens make that
happen.**"*

➜ See: BelieveInOakland_Overview.docx for the complete one-page public
introduction.

# 4. Core values (4, finalized)

The core values were developed through iterative testing for clarity,
punch, memorability, stress resistance, independence, and completeness.
Every operational and design element derives from these four axioms.
Each does unique work; none is derivable from the others. The values use
"our" voice, describing the relationship between citizens and their
government.

**1. Our government is held accountable only when we are paying
sustained attention.** *There are no shortcuts and no substitutes.*

**2. It is our duty as citizens to verify that our government is acting
lawfully.** *The law guarantees our right to do so.*

**3. Accountability is built on credible facts.** *Nothing else holds
up.*

**4. Our government must follow the law and its stated policies.** *No
exceptions.*

# 5. Operational principles (8, finalized)

The operational principles tell participants what to do in specific
situations. Each derives from one or more core values. The set covers:
scope, methodology, temporal discipline, intellectual honesty, standing
and authority, persistence and exit conditions, identity and
representation, and resilience under opposition. Each principle will
have an accompanying explanatory paragraph in the starter materials. The
principles use "we" voice, describing how the civic OS community acts.

**1. We hold government to the law and its stated policies. We take no
position on what the policies should be.**

**2. Show your work. Always.**

**3. The clock runs. Deadlines are deadlines.**

**4. Follow the evidence wherever it goes. When the evidence changes,
the findings change.**

**5. Credibility is demonstrated by the work. Not by credentials, title,
or assertion.**

**6. We pursue accountability to completion. Compliance restored.
Consequences addressed.**

**7. Every group commits to the principles. No group speaks for Believe
in Oakland.**

**8. Pressure against supporters is evidence, not a distraction.
Document everything.**

Key design decisions in the principles: "partial compliance doesn't stop
the clock" is handled in the explanatory paragraph for Principle 6
rather than in the principle text. The principle about emotional
restraint ("mechanical, not emotional") was eliminated because residents
should be allowed to be angry; civic OS OUTPUT must be disciplined, but
humans can be human. The word "pressure" was chosen for Principle 8 over
"attacks" (too alarming for newcomers) or "pushback" (too mild for
what's coming). "Supporters" was chosen over "participants" because even
people who simply share a finding or attend a council meeting could be
targeted.

# 6. Design requirements (15, finalized)

**Authoritative source:** BIO_Design_Requirements.docx contains the
complete, authoritative text of all fifteen requirements. If any text in
this roadmap conflicts with that document, the Design Requirements
document governs.

The requirements are organized into eight categories. The following
provides orientation-level descriptions of each requirement's purpose.
For the full specification, including explanatory context and
implementation guidance, see the authoritative document.

➜ See: BIO_Design_Requirements.docx for the complete authoritative text.

### Architecture

**Requirement 1: Fully distributed.** No hierarchy, no central
authority. Bootstrapping functions carry no ongoing discretionary
authority. Administrative roles are custodial and transferable.

**Requirement 2: Scales without modification.** One person to a
federation of groups, same framework.

**Requirement 3: Groups form and dissolve freely** without permission or
registration.

### Quality and publishing

**Requirement 4: Quality via publishing standards, not gatekeepers.**
Compliance defined by a published skill.md file: human-readable and
AI-executable.

**Requirement 5: Each group maintains its own accepted body of work.**
No canonical source of truth. Distributed evaluation.

**Requirement 6: Standardized metadata** on every work product.
Institutional framing: roles, not individuals.

### Escalation

**Requirement 7: Six-stage escalation protocol** with documented trigger
conditions.

**Requirement 8: Evidence separated from legal strategy.** Three-tier
risk classification (Tier 1: file freely, Tier 2: file with caution,
Tier 3: requires counsel).

### Communication and access

**Requirement 9: Multiple platforms, no single platform essential.**
AI-based spam filtering as back-office infrastructure.

**Requirement 10: believeinoakland.org as directory and gateway.**
Compliance skill evaluates submissions. Community flagging. Downloadable
directory data.

### Onboarding

**Requirement 11: Starter materials sufficient for immediate
participation.** Includes security practices guide.

### Tools

**Requirement 12: AI tools are advisory, transparent, and optional.** No
tool gates any work product or action.

### Resilience

**Requirement 13: Designed for active opposition.** Assumes disruption,
co-option, infiltration, and legal harassment.

**Requirement 14: No single point of failure.** No person, group, or
platform essential to operation.

### Evolution

**Requirement 15: Evolves through practice and consensus.** Framework
designed for adoption by other communities.

# 7. Communication and publishing platform architecture

**Authoritative source:** BIO_Communications_Platforms.docx contains the
complete platform analysis, comparison table, resilience architecture,
and evidence package risk classification.

➜ See: BIO_Communications_Platforms.docx for the complete authoritative
text.

The architecture separates three distinct functions, each served by
different infrastructure to avoid single points of failure:

**Function 1: Cross-group discussion.** Self-hosted Discourse at
forum.believeinoakland.org (primary operational hub). Reddit subreddit
for public outreach (secondary). Groups choose their own internal
communication tools (Signal recommended).

**Function 2: Work product hosting.** Google Drive (default, most
accessible). Open Science Framework/osf.io (advanced, formal version
control). Any platform acceptable if work product is publicly accessible
via stable URL.

**Function 3: Directory and gateway.** believeinoakland.org serves as
searchable directory of all published work products, starter kit
repository, and default onramp for new groups. Directory data
downloadable for mirroring.

**Resilience:** Each platform failure has an explicit continuity path
documented in the Communications Platforms document.

# 8. Evidence package design and risk tiering

Evidence packages are the primary output of the escalation protocol. A
critical vulnerability was identified: a poorly filed Tier 3 case could
create adverse precedent that forecloses future, properly constructed
challenges.

**The solution:** Separate evidence from legal strategy. All factual
evidence, source documents, analysis, and identification of legal
theories are fully public. What is NOT included for Tier 3 actions is
the specific legal packaging (pre-populated court filings) that turns
analysis into a lawsuit.

**Tier 1 --- File freely.** CPRA requests, grand jury complaints, State
Controller referrals, Brown Act reports, media outreach. Templates
included.

**Tier 2 --- File with caution.** CPRA court petitions. Templates
included with advisory notes.

**Tier 3 --- Do not file without counsel.** Prop 218 challenges, CCP
526a taxpayer actions, consent decree motions. Evidence published;
filing templates NOT included. Contact information for legal
organizations provided.

➜ See: BIO_Communications_Platforms.docx, section on Evidence Package
Publication and Risk Classification, for the complete specification.

# 9. AI skill architecture (8 skills)

Eight AI skills support the civic OS workflow. Every skill is advisory,
transparent, optional, and published in the skill.md format:
human-readable explanation plus AI-executable methodology. Skills are
invisible infrastructure; users interact with interface functions, not
skills directly.

**Reconciliation note.** This architecture originally specified seven
skills. The eighth, Government Compliance Analysis, was added to fill
the Layer-2 analytical gap identified in BIO_Functional_Architecture:
the existing Compliance Evaluation skill evaluates BIO work products
against publishing standards, but nothing evaluated government actions
against legal and policy standards. The skills below are numbered to
match the authoritative eight-skill inventory in the Functional
Architecture document so that the two documents agree.

**Infrastructure note (added v4).** The eight skills below are the
functional skill inventory. Beneath them sits the composite bundle
skill: the single write authority for the data store, through which
every functional skill's output is persisted. The bundle skill is
infrastructure rather than a member of this inventory; its write
protocol is decided in BIO_Technical_Architecture_Decisions Section 3
and specified in BIO_State_Rules_Consistency. It is the first thing
built (see Section 14, Phase 1).

### Skill 1: Context/Landscape

Assembles what's known about a group's area of interest. Surfaces
relevant laws, audit and grand jury reports, BIO work products, news,
CPRA status. Primary inter-group connection mechanism. Operates at the
Orient phase (Layer 1: Information).

### Skill 2: Data Archive

Downloads, timestamps, and archives public data. Three functions:
initial baseline collection, ongoing monitoring for new publications,
and change detection (flags modifications or removals, preserving both
versions as evidence). Operates at Orient and Monitor phases (Layer 1:
Information).

### Skill 3: Data Extraction

Pulls structured information from public sources: ACFRs, OpenGov, budget
documents, court records. Lowers the barrier to producing analytical
work products. Operates at the Investigate phase (Layer 1: Information).

### Skill 4: Legal/Policy Lookup

Maps applicable laws, policies, ordinances, regulations, and case law to
specific government actions. Helps groups ground analysis in the correct
legal framework. Operates at the Investigate phase (Layers 1 and 2).

### Skill 5: Monitoring/Watchdog

Tracks deadlines, checks data sources for changes, scans council
agendas, alerts groups when attention is needed. Converts sustained
attention from heroic commitment to systematic practice. Operates at the
Monitor phase (Layers 1 and 3).

### Skill 6: Government Compliance Analysis (added)

Added to fill the Layer-2 analytical gap. Compares a specific government
action against the applicable legal and policy standards and produces a
structured comparison: what the standard requires, what the city did,
where they align, where they diverge, and what additional information
would resolve ambiguous cases. Flags specific discrepancies with
explanations of why they may constitute noncompliance, and presents them
for human evaluation rather than rendering a determination. This is the
analytical engine that converts Layer 1 information into Layer 2
findings. It is distinct from the Compliance Evaluation skill (Skill 7),
which evaluates BIO work products against publishing standards; this
skill evaluates government actions against legal standards. Operates at
the Investigate phase (Layer 2: Analysis).

### Skill 7: Compliance Evaluation

The foundation skill for distributed quality control. Defines publishing
standards as skill.md. Evaluates structural compliance (metadata
completeness) and methodological standards (reproducibility, source
documentation). Output is descriptive, not pass/fail. Operates at the
Document phase (Layer 3: Action). This is the first functional skill to
build, after the composite bundle skill core (see Section 14, Phase 1).

### Skill 8: Escalation Protocol

Guides groups through the six escalation stages. Identifies current
stage, trigger conditions, available actions by tier, deadlines.
Produces Tier 1 and 2 filing templates pre-populated with case-specific
facts. Operates at the Escalate phase (Layer 3: Action).

**System-level function:** The eight skills collectively create
institutional memory. The city's protection system depends on
institutional amnesia. The skills create continuity that persists
regardless of individual turnover.

# 10. Group workflow architecture (5 phases)

Every group follows a five-phase lifecycle: Orient, Investigate,
Document, Escalate (if warranted), Monitor. New evidence triggers
re-investigation (OP4). Exit condition: compliance restored,
consequences addressed (OP6).

**Orient:** Assemble what's known. Context Skill and Archive Skill.
Human chooses focus.

**Investigate:** Pull data, analyze, compare to legal requirements. Data
Extraction, Legal/Policy Lookup, and Government Compliance Analysis
Skills. Human applies judgment.

**Document:** Produce standards-compliant work product. Compliance
Evaluation Skill evaluates before publication. Human reviews and
publishes.

**Escalate:** If noncompliant, protocol activates. Escalation Skill
identifies stage and available actions by tier. Human decides.

**Monitor:** Sustained attention. Monitoring and Archive Skills track
changes, deadlines, responses. Human evaluates.

**At every phase:** AI skills provide support. Humans make every
decision. Skills reduce effort and increase consistency. Humans provide
judgment.

# 11. Trust hierarchy and inter-group awareness

## Five trust levels

Every piece of information carries a visible trust indicator. Users
learn to read these signals through exposure.

**Your group's work (highest).** You produced it, verified it, vouch for
it.

**Independently verified (high).** Your group checked sources,
reproduced results, accepted it.

**Compliance skill: meets standards (moderate).** Structurally compliant
but not independently verified by your group.

**Not yet evaluated (unknown).** In the directory with metadata. Treat
with caution.

**Flagged concerns (low).** Compliance skill identified specific issues.

**Note (added v4):** The trust hierarchy's operational mechanics
(Argument Evaluation as the engine behind "independently verified," the
no-transitive-trust rule for incoming work products, and trust signals
attached from local evaluation results) are decided in
BIO_Technical_Architecture_Decisions Section 5.

## Inter-group awareness

**Published work in the directory:** The Context Skill surfaces relevant
prior work. Groups discover each other through the work, not through
registration or coordination.

**Voluntary "\*\*\*\*working on\*\*\*\*"**\*\* signals:\*\* Lightweight
directory entries. Optional, anonymous-compatible, no ownership implied.

**The handoff pattern:** A group's published finding notes an area
warranting further investigation. That observation creates an
opportunity for any group running the Context Skill on related topics.

**No group owns an issue.** Multiple groups can work on the same topic
independently.

# 12. User experience and interface design

The interface is organized around seven categories reflecting how people
naturally think about their work. Interactive mockups were produced as
HTML widgets during the design session.

**Platform (resolved, v4):** The client is a static, local-first
Progressive Web App built with React and Vite, with local data in
IndexedDB. No central server. The seven categories below are navigation
surfaces; task-flow journeys thread through them. See
BIO_Technical_Architecture_Decisions Sections 8 and 9 for the
authoritative UX architecture and stack decisions.

## Seven categories

**Context:** Reference library. City-produced and BIO-produced
information with trust signals, filters, "archive now" and "add monitor"
actions. Provenance trail from Search.

**Search:** User-initiated retrieval. Persistent requests with
lifecycle: active, complete, failed, canceled. Accept results to
Context. Refine, re-run, duplicate. System commentary. Source skill
attribution.

**New Developments:** Alerts. Deadline urgency bar. City changes, BIO
network updates. "Mark reviewed" and "To context" actions.

**Monitoring:** Data source surveillance. Add, enable, disable, delete
monitors. Frequency settings. Detection history. Change/deletion
detection. Feeds New Developments.

**Communications:** Forum threads, inter-group signals with group type
tags, media coverage. Compose actions.

**Projects:** Workspace. Phase bars with tooltips and historical
navigation. Compliance dashboard. Escalation tracker. Sub-tabs:
Evidence, Compliance, Escalation, Related Work.

**Settings:** Group profile (name, type, expertise, credentials,
engagement basis, availability, size, contact). Focus areas. Accepted
body of work. "Working on" signals. Notifications. Data export/backup.
Member management. Starter kit access.

## Key UX design principles

-   Most common actions are most accessible.

-   Information organized by user intent, not system architecture.

-   Trust signals are ambient (always visible), not interrogative
    > (requiring user to ask).

-   Skills are invisible infrastructure; users see functions, not tools.

-   System prevents errors before publication (compliance dashboard).

-   Tooltips on trust dots, phase bars, and action tags provide context
    > on hover.

-   Search results carry provenance into Context when accepted.

-   Monitors show frequency, detection history, and overdue status.

-   Group profile fields support professional groups (legal, accounting,
    > technical) including credentials and engagement basis.

-   The system works identically whether there is 1 group or 1,000
    > groups.

# 13. Sewer fund campaign: time-sensitive items

The sewer fund case is both the BIO proof-of-concept and an active legal
matter with its own clock.

**Priority framing (added v4, from the Technical Architecture
Decisions):** The full distributed platform is being designed to be
right from the start. The sewer fund case is an exemplar pilot used to
pressure-test the architecture against a real, messy source. Public
action waits until the stack is judged sufficiently functional, refined,
and resilient. The items below remain the case's live clock and are
executed on their own merits as a legal matter, independent of platform
readiness.

### Immediate

-   April 7 deadline has passed. Execute threatened enforcement actions.

-   File grand jury complaint (DocuSign at grandjury.acgov.org).

-   Send State Controller referral letter (Controller Malia Cohen,
    > Gov. Code 12422.5(e)).

-   Evaluate CPRA petition filing (\$435, Alameda County Superior
    > Court).

-   Consider engaging CPRA attorney (limited scope) to unlock mandatory
    > fee provision.

### Near-term

-   Attorney contacts: David Snyder/FAC, Karl Olson, ACTA, HJTA.

-   Media: Eli Wolfe/Oaklandside, Darwin BondGraham, East Bay Express,
    > Sam Lefebvre/Oakland Report.

-   Coalition: City Auditor Michael Houston, CM Ramachandran, LWV
    > Oakland, CFABO, Baykeeper.

### Medium-term

-   Evaluate Prop 218 challenge based on disclosed records (requires
    > competent counsel).

-   Produce complete sewer fund evidence package as first BIO work
    > product.

# 14. Implementation roadmap and critical path

**Sequencing note (v4).** Phase 1 is aligned to the prototype sequence
in BIO_Technical_Architecture_Decisions Section 11, which supersedes the
v3 Phase 1 ordering. The data layer comes first: nothing else can
persist its work until the composite bundle skill exists. The State
Rules & Consistency specification (v1, July 2026) is complete and
governs Phase 1 data-layer work.

## Phase 1: Foundation (immediate)

-   Build the composite bundle skill: the always-on core protocol
    > (bootstrap, continuous checkpoint, write-back with history and
    > atomic promotion, canonical naming, drift defense, mechanical
    > pre-write gate) plus the Information-type schema. This is the
    > single write authority for the data store. Prior art: the Alpha
    > Pipeline bundle skill; specification: BIO_State_Rules_Consistency.

-   Write one Data Extraction adapter against the sewer-fund OpenGov
    > data and one ACFR PDF; confirm the JSON core round-trips to
    > companion views and that snapshots archive cleanly.

-   Build a minimal React + Vite client shell that ingests Information
    > bundles into Context with criticality, trust, and provenance;
    > surface a Focus against the Prop 218 / Municipal Code standard
    > and relate it in the Focus graph.

-   Exercise triage (elevate/defer/dismiss with recheck triggers) and
    > form one Project from an elevated Focus or cluster.

-   Build the Compliance Evaluation skill and the Argument Evaluation
    > function; focus the Project into a Work Product and run both
    > evaluations in internal then external strictness mode, confirming
    > the fact/commentary firewall and source-grounding.

-   Build the Escalation Protocol skill (needed for the sewer fund case)
    > and produce the sewer fund evidence package as the first work
    > product and tutorial.

-   Run the same analytical skill once as an interactive session and
    > once as a headless Agent SDK run; confirm both write
    > schema-conformant bundles through the one bundle skill. Stop and
    > assess functionality, refinement, and resilience before any
    > expansion.

## Phase 2: Infrastructure (weeks 2-3)

-   Set up believeinoakland.org (static site: GitHub Pages, Netlify, or
    > Cloudflare Pages).

-   Set up Discourse forum at forum.believeinoakland.org.

-   Create r/BelieveInOakland subreddit.

-   Create metadata template and directory submission form.

-   Write security practices guide.

## Phase 3: Starter kit (weeks 3-4)

-   Write explanatory paragraphs for each operational principle.

-   Complete walkthrough tutorial (from Phase 1).

-   Write guides to public data sources and legal tools.

-   Package and publish starter kit at believeinoakland.org.

## Phase 4: Additional skills (weeks 4-8)

-   Build Context/Landscape, Data Archive, Data Extraction (full),
    > Legal/Policy Lookup, Monitoring, and Government Compliance
    > Analysis skills.

## Phase 5: Scale (ongoing)

-   Recruit and onboard groups. Iterate based on experience. Define
    > success metrics. Support adoption by other communities.

# 15. Pending items and open questions

## Not yet started

**Annotation (v5, July 20, 2026).** This list is v4's and is preserved
as the record of what v4 believed; the first three items and the
prototype walkthrough are superseded by the status annotation above (the
bundle skill is in production, the walkthrough happened as the live
pilot, and the functional-skill load-bearing pieces landed in the data
layer). The remaining items (explanatory paragraphs, security guide,
website, forum, subreddit, metadata template and directory, evidence
package, starter kit, legal filings) stand as written. The sewer fund
evidence package is now the Cityside bridge artifact on the pilot track,
and legal filings await the CPRA response.

-   Composite bundle skill implementation (core protocol and per-type
    > schemas specified in BIO_State_Rules_Consistency; this is the
    > first Phase 1 item).

-   Prototype walkthrough of sewer fund case.

-   All eight functional AI skills (specifications exist;
    > implementations pending).

-   Explanatory paragraphs for operational principles.

-   Security practices guide.

-   Website, forum, subreddit.

-   Metadata template and directory.

-   Sewer fund evidence package.

-   All starter kit materials.

-   Legal filings (grand jury complaint, Controller referral, CPRA
    > petition).

## Open design questions

-   Consensus mechanism for core value changes (deferred to practice).

-   Financial dimension (system minimizes barriers; may evolve).

-   Success metrics (deferred until after prototype).

-   Scaling behavior: 1 group vs. 1,000 groups (kernel-plus-extensions
    > architecture addresses design; behavior to be validated in
    > practice).

-   The open sub-questions for specialists in
    > BIO_Technical_Architecture_Decisions Section 12 (permitted use of
    > subscription-authenticated agent runs, work-product staleness
    > propagation, dependency-chain depth, sync-engine boundary,
    > evidentiary standards for WACZ/SHA-256, accessibility validation).

## Resolved since v3

-   UX implementation platform: static local-first PWA, React + Vite,
    > IndexedDB (BIO_Technical_Architecture_Decisions Sections 8-9).

-   Structured-data output format for extraction: JSON tidy/long core
    > with provenance, hashes, criticality, and classification; .md/.svg
    > as derived views (BIO_Technical_Architecture_Decisions Section
    > 7.1).

-   Data-store state rules: specified in BIO_State_Rules_Consistency v1
    > (July 2026), including the flat per-type store layout, canonical
    > ID grammar, universal-core-plus-extension frontmatter, per-type
    > state machines, typed reference model, invariant set,
    > violation-to-repair mapping, and the Mechanical Verification Law.

-   Annotation persistence: annotations are accretive records within
    > their target bundle, not peer bundles (amends the letter of
    > Technical Architecture Decisions Section 2; recorded there and in
    > the State Rules spec).

-   Phase 1 sequencing: bundle skill first, per the Technical
    > Architecture Decisions prototype sequence.

## Decisions made, documented, and awaiting implementation

-   Core values: 4, finalized.

-   Operational principles: 8, finalized.

-   Design requirements: 15, finalized (BIO_Design_Requirements.docx).

-   Platform architecture: specified
    > (BIO_Communications_Platforms.docx).

-   Evidence package risk tiering: three tiers with criteria.

-   AI skill architecture: 8 functional skills with specifications
    > (BIO_Functional_Architecture) plus the composite bundle skill as
    > data-store infrastructure (BIO_Technical_Architecture_Decisions,
    > BIO_State_Rules_Consistency).

-   Workflow: 5 phases with skill integration.

-   Trust hierarchy: 5 levels with visual indicators; evaluation
    > mechanics decided (BIO_Technical_Architecture_Decisions Section
    > 5).

-   UX interface: 7 categories with interactive mockups; platform and
    > journeys decided (BIO_Technical_Architecture_Decisions Section 8).

-   Data model and store: 6 object types, bundle anatomy, state
    > machines, invariants, repairs (BIO_State_Rules_Consistency v1).

# Appendix A: key officials and institutional actors

These are the officials who held key positions during the FY 2012-2021
sewer fund transfer period and the subsequent non-implementation of
corrective recommendations.

**City Administrators:** Deanna Santana (\~2011-2014), Sabrina Landreth
(\~2015-2020), Edward Reiskin (\~2020-2023).

**Finance Directors:** Katano Kasaine (\~2011-2019), Erin Roseman
(\~2021-June 2025, resigned). Audrey Lamb: staff in Controller's Bureau,
CPRA contact.

**City Auditor:** Courtney Ruby, CPA, CFE (2006-Oct 2023, issued Feb
2022 sewer report). Michael Houston (current, elected March 2024; was
Whistleblower Program Manager during investigation).

**City Attorney:** Barbara Parker (July 2011-January 2025). Ryan
Richardson (current, elected November 2024).

**Public Works:** G. Harold Duffey (\~2014-2022+).

**Mayors:** Jean Quan (2011-2015), Libby Schaaf (2015-2023), Sheng Thao
(2023-2024, recalled).

**External auditor:** MGO (clean ACFR opinions). Working papers
proprietary.

**Unions:** SEIU 1021, IFPTE Local 21, IAFF Local 55, OPOA.

# Appendix B: legal framework summary

**CPRA enforcement:** Gov. Code 7923.000 (petition), 7923.005 (expedited
hearing), 7923.100 (verified petition), 7923.110 (burden on government),
7923.115 (mandatory attorney's fees). Recodified 2023 by AB 473
(nonsubstantive). Filing fee \$435.

**Grand jury:** Penal Code 925a (examine city books), 919(c) (inquire
into misconduct), 926 (hire experts). File at grandjury.acgov.org.

**State Controller:** Gov. Code 12422.5(e) (audit any local agency's
internal controls). Letter to Controller Malia Cohen, 300 Capitol Mall,
Sacramento.

**Prop 218:** Cal. Const. Art. XIII D, Sec. 6(b)(1)(2)(5). Fee revenue
restricted to service purpose.

**Key precedents:** Carachure v. Azusa (2025, identical 10% sewer fee),
Zolly v. Oakland (2022, franchise fees subject to Prop 26), Howard
Jarvis v. Roseville (2002), Howard Jarvis v. Fresno (2005). Livermore
settlement: \$3.78M (ACTA).

**CCP 526a:** Taxpayer standing. Weatherford v. San Rafael (2017): any
local tax confers standing.

**Anti-SLAPP:** CCP 425.16. Protects CPRA requests and grand jury
complaints.
