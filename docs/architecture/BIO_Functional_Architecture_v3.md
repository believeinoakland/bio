# Believe in Oakland

> **Editorial note, July 27, 2026 (Bob's directive):** the construct formerly
> named **Problem** is renamed **Focus** throughout, which conveys its purpose
> non-judgmentally. Machine literals shown here use the target vocabulary
> (`focus`, `focus@1`, `focuses/`, `focus.md`); the legacy literals (`problem`,
> `problem@1`, `problems/`, `problem.md`) remain valid aliases in existing
> append-only history and in code until the rename arc lands.

# Three-Layer Functional Architecture

Working Document --- April 2026 (v3, July 20, 2026: daemon realization
and escalation-ladder annotations added to the July 2026
question-resolution layer; the functional analysis itself is unchanged)

This document describes the complete functional architecture of the BIO
platform. It identifies three layers (Information, Analysis, Action),
maps every function a group needs to each layer, identifies the AI
skills that support each layer, specifies where human judgment is
required, and identifies architectural gaps that the current skill
specifications don't fully cover.

**Relationship to other documents:** This document extends the AI skill
architecture described in Section 9 of the BIO Complete Roadmap. It
provides the functional context that the individual skill specifications
must fit within. The seven-category UX interface (Context, Search, New,
Monitoring, Comms, Projects, Settings) described in Section 12 of the
roadmap is the user-facing expression of this architecture. The
technology decisions that answer this document's open architectural
questions are recorded in BIO_Technical_Architecture_Decisions; the
data-store rules the skills write against are specified in
BIO_State_Rules_Consistency. The July 2026 revision annotates each
question this document originally left open with a pointer to its
resolution; the functional analysis itself is unchanged.

**Annotation (v3, July 20, 2026), two additions to the annotation
layer.** First, the Monitoring Skill's mechanical duties are realized:
the M2' daemon (live-fire verified in production
July 19, 2026) runs source change detection, deadline and recheck
sweeps, first-capture creation from named standing intent, and
co-attestation as constrained-endpoint operations under Tech Arch v10
Sections 10.4 and 10.7 through 10.9, with a pausable manual path (the
due-slate export) preserving the tools-optional requirement. The
Monitoring Skill as a functional skill retains its judgment-bearing
remainder: deciding what to monitor and what a detected change means
stays with sessions and humans. Second, the
where-human-judgment-is-required mapping is refined by the escalation
ladder of BIO_Intake_Doctrine v1.1 Section 6: the daemon executes named
intent, sessions discover with their own tools, and humans are engaged
only for the impossible or the impractical (acts of authority, judgment,
and action), with blanket direction defined there as the bounded form of
discovery ratification. Layer boundaries are unchanged; the ladder
states who does the work within them.

# The three layers

When a group does its work, three distinct kinds of activity happen.
These aren't phases that occur in sequence (like the five-phase
workflow: Orient, Investigate, Document, Escalate, Monitor). They're
concurrent layers that operate throughout the workflow. A group in the
Investigate phase is doing Layer 1 work (finding data), Layer 2 work
(analyzing what the data shows), and potentially Layer 3 work
(documenting preliminary findings) simultaneously.

**Layer 1: Information.** Acquire, store, monitor, and manage the raw
materials of the work.

**Layer 2: Analysis.** Compare government actions against legal and
policy standards to identify compliance or noncompliance.

**Layer 3: Action.** Turn findings into outputs: work products,
publications, escalations, communications, and ongoing tracking.

# Layer 1: Information

This is the foundation that everything else builds on. Without reliable,
archived, monitored information, the analysis and action layers have
nothing to work with. Layer 1 has four primary functions:

## Function 1: Discover

Find sources relevant to the group's focus area. Sources fall into two
categories:

**Public government information:** regulations (Municipal Code, state
statutes, constitutional provisions), court decisions (case law, consent
decrees), stated city policies (administrative directives, council
resolutions), financial documents (ACFRs, adopted budgets, quarterly
reports, OpenGov portal data), audit reports (City Auditor, grand jury,
State Controller), public records (CPRA responses, council agendas and
minutes, NextRequest portal), and news coverage.

**BIO network information:** published work products from other groups
(via the directory), "working on" signals, forum discussions, and
inter-group communications.

Discovery happens through two mechanisms: user-initiated search (the
Search category in the UX) and AI-driven surfacing (the Context Skill
assembling relevant information based on the group's focus areas).

## Function 2: Retrieve and extract

Raw sources are often not in usable form. An ACFR is a 180-page PDF. The
OpenGov portal is a JavaScript application that doesn't yield to simple
downloading. Budget documents are formatted for reading, not analysis.
Court decisions are embedded in legal databases. The retrieval function
must handle these diverse formats and extract structured, analyzable
data from them.

**Architectural question, resolved (July 2026):** What "structured data"
looks like coming out of this function is now defined. The structured
core is JSON in tidy/long form for line items, carrying provenance,
source locator, content hash, criticality, and fact/analysis/judgment
classification; .md and .svg companions are derived views. The
extraction output is persisted as an Information bundle. See
BIO_Technical_Architecture_Decisions Section 7.1 and the Information
schema in BIO_State_Rules_Consistency Section 4.1.

## Function 3: Archive

Everything retrieved is stored locally with timestamps. This serves
three purposes:

-   Convenience: data is available without re-retrieving from the
    > original source.

-   Evidence preservation: if the city modifies or removes data after
    > BIO scrutiny begins, the archived version provides evidence of
    > what was publicly available and when.

-   Baseline for change detection: the archived version is compared
    > against future retrievals to detect modifications.

**Technical note, resolved (July 2026):** For static documents (PDFs,
posted reports), archival is download-and-store with SHA-256 hash for
integrity verification. For dynamic data (OpenGov portal, interactive
databases), a "snapshot" is now defined as a three-layer logical capture
keyed to a stable query definition: a raw capture (evidentiary,
e.g. WACZ), a canonicalized normalized dataset (hashed and diffed), and
a rendered view (human evidence). The hash is taken over the normalized
dataset. See BIO_Technical_Architecture_Decisions Section 7.2 and
BIO_State_Rules_Consistency Section 4.1.

## Function 4: Monitor and notify

Once a source is archived, the system monitors it for changes.
Monitoring operates at configurable frequencies (hourly, daily, weekly,
monthly, per council meeting) and produces three types of notifications:

-   New content: a new document has been published, a new dataset has
    > appeared, a new council agenda item is relevant.

-   Modified content: a previously archived document or dataset has been
    > changed. Both versions are preserved. The system highlights what
    > changed.

-   Removed content: a previously available document or dataset is no
    > longer accessible. The archived version is preserved and the
    > removal is flagged as potential evidence of concealment.

These notifications feed the New Developments category in the UX. They
are the mechanism by which sustained attention (Core Value 1) becomes
systematic rather than heroic.

**Resolution note (July 2026):** A detected modification or removal also
sets the Information object's source status and propagates a
re-evaluation flag to every object citing it, per the cascade semantics
in BIO_State_Rules_Consistency Section 5.4.

## Skills that power Layer 1

**Context Skill:** assembles relevant prior work and sources based on
the group's focus areas.

**Data Extraction Skill:** retrieves and transforms raw data from public
sources into structured, analyzable form.

**Archive Skill:** downloads, timestamps, and stores data locally.
Performs hash-based integrity verification.

**Legal/Policy Lookup Skill:** discovers applicable laws, policies,
ordinances, regulations, and case law.

**Monitoring Skill:** periodically checks sources for changes and
produces notifications.

Note that five of the eight skills operate in Layer 1. This reflects the
reality that information management is the largest and most
labor-intensive part of a group's work, and where AI support has the
highest leverage.

**Infrastructure note (July 2026):** All five persist their output
through the composite bundle skill, the single write authority for the
data store. The bundle skill is infrastructure beneath this inventory,
not a ninth functional skill. See BIO_Technical_Architecture_Decisions
Section 3.

# Layer 2: Analysis

This is where a group turns raw information into findings. It is the
most judgment-intensive layer and where human involvement is most
critical. AI can dramatically reduce the effort by doing initial
comparison work, but the human evaluates every flagged discrepancy and
makes every determination.

## Function 1: Compare actions to standards

The core analytical function. Given a government action ("the city
transferred \$2.1M from the Sewer Service Fund to the General Purpose
Fund in FY 2023-24") and the applicable legal framework ("Municipal Code
13.04.080 restricts sewer fund revenue to sewer system purposes; Prop
218 Article XIII D Section 6(b)(2) prohibits using fee revenue for
purposes other than those for which the fee was imposed"), produce a
structured comparison: what the law requires, what the city did, where
they match, where they don't, and what questions remain unanswered.

This is where a new, eighth skill is needed: a Government Compliance
Analysis Skill. The existing Compliance Skill evaluates whether a BIO
work product meets BIO's publishing standards. This new skill evaluates
whether a government action meets legal and policy standards. They are
parallel but distinct evaluation functions.

## Function 2: Cross-reference multiple sources

Government noncompliance often becomes visible only when multiple data
sources are compared. The ACFR may show a transfer amount that doesn't
match the OpenGov data. The budget narrative may describe a program that
the actual expenditure data doesn't support. The City Auditor's finding
may reference a policy that the Municipal Code doesn't contain.
Cross-referencing is how discrepancies surface.

This function is partially supported by the Data Extraction Skill (which
can pull comparable data from multiple sources) and the new Government
Compliance Analysis Skill (which can compare across sources). But the
judgment about what discrepancies are significant is human work.

**Resolution note (July 2026):** A surfaced discrepancy is persisted as
a Focus object, dual-sourced (agent scan or human browsing), related
to existing Focuses in a graph with agent-proposed, human-decided
edges, and triaged elevate/defer/dismiss with recheck triggers. See
BIO_Technical_Architecture_Decisions Section 7.5 and the Focus schema
in BIO_State_Rules_Consistency Section 4.2.

## Function 3: Classify findings

Every finding must be classified as fact, analysis, or judgment (per the
three-layer epistemological framework established in the operational
principles). This classification matters because it determines how the
finding should be treated: facts are verifiable, analysis is
reproducible, and judgment is debatable. A work product that clearly
separates these layers is more useful and more defensible than one that
mixes them.

The Compliance Skill (BIO work product evaluation) checks whether this
separation is maintained in published work products. But the initial
classification happens during the analysis process, before publication.

**Resolution note (July 2026):** The classification is a first-class
field on every Information object (classification: fact \| analysis \|
judgment) and travels with the data through the pipeline, per
BIO_State_Rules_Consistency Section 4.1.

## Function 4: Evaluate significance (human judgment)

Not every discrepancy is a violation. A city department that files a
report two days late is technically noncompliant but may not warrant
escalation. A \$52.6 million unauthorized transfer over nine years is a
different matter. The determination of significance is human judgment
informed by context, scale, pattern, and consequences.

AI can support this judgment by surfacing relevant context (prior
findings on the same issue, other groups' analyses, applicable legal
precedents), but the determination itself is a human responsibility.
This is the point in the workflow where Operational Principle 1 (policy
neutral, compliance only) is most tested: the temptation to let policy
preferences color compliance judgments is strongest when evaluating
significance.

## Analysis outputs

The analysis layer produces one of three outputs for each examined
government action:

-   Compliant: the action conforms to applicable law and policy. This is
    > documented but does not trigger escalation. (Documenting
    > compliance is important because it demonstrates that BIO examines
    > facts evenhandedly, not just looking for violations.)

-   Noncompliant: the action does not conform. This triggers the
    > escalation protocol if the group chooses to pursue it.

-   Unclear: insufficient information to determine compliance. This
    > triggers a return to Layer 1 (more information needed) and may
    > result in CPRA requests, additional research, or outreach to other
    > groups.

## Skills that power Layer 2

**Government Compliance Analysis Skill (NEW, skill #8):** compares
government actions against legal/policy standards. Produces structured
comparison with discrepancies flagged for human evaluation. This is the
analytical engine that converts Layer 1 information into Layer 2
findings.

**Legal/Policy Lookup Skill:** maps applicable standards so the
comparison has the correct reference framework.

**Data Extraction Skill:** provides structured data for
cross-referencing.

**Context Skill:** surfaces prior findings and other groups' analyses
for cross-reference.

# Layer 3: Action

This is where findings become outputs. The action layer converts
analysis into published work products, escalation through the protocol,
communication with the network and the public, and ongoing tracking
toward resolution.

## Function 1: Document

Produce a work product that captures the finding with full data,
methodology, and reasoning. The work product must meet the BIO
publishing standard (evaluated by the Compliance Skill). The
documentation function includes drafting the finding, assembling
supporting evidence, writing methodology documentation sufficient for
reproduction, completing the metadata form, and separating facts from
analysis from judgment.

**Resolution note (July 2026):** The Work Product is a focused,
source-grounded derived view within its Project or Action bundle, with a
machine-checked citation register grounding every load-bearing claim in
archived, hashed primary sources. See
BIO_Technical_Architecture_Decisions Section 4 and
BIO_State_Rules_Consistency Section 4.5.

## Function 2: Evaluate and publish

Before publication, the Compliance Skill evaluates the draft work
product against the publishing standard. The evaluation surfaces any
gaps (missing metadata, insufficient methodology documentation,
unsupported claims) so the group can address them. Publication enters
the work product into the directory with full metadata and trust status.

**Resolution note (July 2026):** Two evaluation functions now apply:
Compliance Evaluation (conformance) and Argument Evaluation (soundness),
each in internal or external strictness mode, and the Work Product
readiness ladder (draft, internally checked, externally compliant,
distributed) advances only on recorded passing evaluations. See
BIO_Technical_Architecture_Decisions Section 5.

## Function 3: Escalate

When findings reveal noncompliance, the six-stage escalation protocol
activates. The Escalation Skill identifies the current stage, available
actions by risk tier, and upcoming deadlines. For Tier 1 and 2 actions,
the skill produces filing templates pre-populated with case-specific
facts. For Tier 3 actions, the skill identifies the legal theory and
directs the group to appropriate legal counsel.

## Function 4: Communicate

Share findings and status with the BIO network (forum, directory,
"working on" signals), the public (subreddit, media outreach), and the
city (CPRA requests, public comment, council testimony). Communication
is governed by the operational principles: show your work, institutional
framing, policy neutral.

## Function 5: Track toward resolution

After escalation, track the city's response and monitor for compliance
changes. The exit condition is specific: compliance restored AND
consequences addressed (Operational Principle 6). The Monitoring Skill
tracks deadlines, response status, and data changes. Partial compliance
is documented but doesn't stop the clock.

**Resolution note (July 2026):** Escalations and their clocks are
persisted as Action objects; every date-bearing clock entry carries the
statute, order, or commitment it derives from, and overdue entries are
marked, never silently stale. See the Action schema in
BIO_State_Rules_Consistency Section 4.4.

## Skills that power Layer 3

**Compliance Skill:** evaluates work products against BIO publishing
standards before publication.

**Escalation Skill:** guides groups through the six-stage protocol with
tier-appropriate actions.

**Monitoring Skill:** tracks deadlines, city responses, and compliance
changes.

# Cross-cutting concerns

## Search across heterogeneous sources

When a group searches for information, the query needs to hit multiple
systems simultaneously: city data sources (Municipal Code, OpenGov, ACFR
archive), legal databases (statutes, case law), the BIO directory (other
groups' work products), the group's local archive, and news sources.
These systems have completely different access methods, data formats,
and response structures.

The skill architecture needs to define: how a single search query fans
out across sources, how results are aggregated and deduplicated, how
results carry provenance (which source, which skill found it, how
current), and how results are presented with trust signals.

**Resolution note (July 2026):** Decided as a thin orchestrator over
independent, optional per-source adapters, each emitting a common record
shape with provenance, source identity, recency, and trust;
de-duplication on canonical identity; transparent ranking. See
BIO_Technical_Architecture_Decisions Section 7.3.

## Data transformation pipeline

Raw data from public sources passes through a transformation pipeline:
retrieval (download or access), extraction (pull structured data from
PDFs, portals, databases), normalization (convert to consistent format
for comparison), and storage (archive with timestamps and provenance).
The output format of this pipeline needs to be defined so that Layer 2
skills can consume it consistently regardless of the original source
format.

**Resolution note (July 2026):** Defined. The pipeline's output is the
Information bundle with a JSON tidy/long structured core; Layer 2 skills
consume Information bundles through the store's read interface. See
BIO_Technical_Architecture_Decisions Section 7.1 and
BIO_State_Rules_Consistency Sections 2 and 4.1.

## Change detection across source types

For static documents (PDFs, posted reports): hash comparison detects any
modification. Binary: changed or unchanged.

For structured data (OpenGov, budget tables): field-level comparison
shows what specific values changed. The system needs to define what
constitutes a meaningful change versus noise (rounding differences,
formatting changes).

For web pages (city website, NextRequest portal): content extraction and
comparison. The system needs to distinguish between layout changes
(irrelevant) and content changes (significant).

For removed content: the system needs to distinguish between "moved to a
new URL" (follow the redirect) and "deleted" (preserve and flag).

**Resolution note (July 2026):** Decided per source type: SHA-256 plus
extracted-text/table diff for static documents; keyed field-level diff
with numeric tolerances for structured data; content-extracted text diff
for web pages; presence comparison with redirect-matching and a
confirmation window for removals. Canonicalize before comparing;
preserve both versions on every change. See
BIO_Technical_Architecture_Decisions Section 7.4.

## Trust signals throughout the stack

Trust signals (the five-level hierarchy from the UX design) need to be
attached to information at every layer, not just at the work product
level. A data point extracted from an ACFR has different trust
characteristics than a data point from another group's analysis. The
trust signal should travel with the data through the transformation
pipeline so that when a human evaluates a flagged discrepancy, they can
see the provenance and trust level of each data point involved.

**Resolution note (July 2026):** The operational mechanics are decided:
Argument Evaluation is the engine behind "independently verified,"
incoming work products are stored as Information objects and locally
re-evaluated before citation (no transitive trust), and local evaluation
results attach as trust signals. See
BIO_Technical_Architecture_Decisions Section 5.

## The eighth skill: Government Compliance Analysis

The current seven-skill architecture has a gap between Layer 1
(information) and Layer 3 (action). The gap is in Layer 2: the
analytical comparison of government actions against legal standards.

The existing Compliance Skill evaluates BIO work products against BIO
publishing standards. This is an internal quality function. What's
missing is the external analytical function: evaluating government
actions against legal and policy standards.

The Government Compliance Analysis Skill would:

-   Accept a government action (with supporting data from Layer 1) and
    > applicable legal/policy standards (from the Legal Lookup Skill).

-   Produce a structured comparison: what the standard requires, what
    > the city did, where they align, where they diverge.

-   Flag specific discrepancies with explanations of why they may
    > constitute noncompliance.

-   Identify what additional information would be needed to resolve
    > ambiguous cases.

-   Present all of this for human evaluation, not as a determination.

This skill is the analytical engine that every group needs. Without it,
every group builds its own comparison methodology from scratch. With it,
comparisons are consistent, thorough, and grounded in the correct legal
framework, while human judgment remains the deciding factor.

# Updated skill inventory (8 skills)

**1. Context/Landscape Skill** --- Layer 1. Assembles what's known about
a group's area of interest.

**2. Data Archive Skill** --- Layer 1. Downloads, timestamps, archives,
detects changes and deletions.

**3. Data Extraction Skill** --- Layer 1. Retrieves and transforms raw
data into structured, analyzable form.

**4. Legal/Policy Lookup Skill** --- Layers 1 and 2. Maps applicable
laws, policies, and case law.

**5. Monitoring/Watchdog Skill** --- Layers 1 and 3. Tracks sources for
changes, deadlines, and response status.

**6. Government Compliance Analysis Skill (NEW)** --- Layer 2. Compares
government actions against legal/policy standards. Flags discrepancies
for human evaluation.

**7. Compliance Evaluation Skill** --- Layer 3. Evaluates BIO work
products against publishing standards.

**8. Escalation Protocol Skill** --- Layer 3. Guides groups through
six-stage protocol with tiered actions.

Note: Five skills operate in Layer 1 (information), reflecting the
reality that information management is the largest part of a group's
work and where AI support has the highest leverage. The Government
Compliance Analysis Skill bridges Layers 1 and 2, converting information
into analytical findings. The Compliance and Escalation Skills operate
in Layer 3, supporting action. Beneath all eight sits the composite
bundle skill, the data store's single write authority
(BIO_Technical_Architecture_Decisions Section 3;
BIO_State_Rules_Consistency).

**believeinoakland.org** \| Working Document \| April 2026, rev. July
2026


## The three-layer workflow (added July 27, 2026)

Bob's framing, recorded as the shape of the whole system. **Layer 1, the
foundation**, is the data plane and everything this corpus specifies for it:
the store, states, checks, membership, intake, publication. **Layer 2, the
analysis layer**, relies on the foundation for services. It articulates
objectives that define what it wants to see in the data store: a specific
document, a kind of document, a document set that could contain a piece of
evidence it needs, with the requester indicating whether found documents
should be kept up to date and when or how often the data layer should look for
updates (served today by named requests, monitored gathering with frequency,
and source-status tracking). It uses AI skills to define and achieve focused
analytical objectives, done in the context of a FOCUS. And it carries the
Project work, much of it also accomplished by AI skills, under the declared
bias in force and graded by the epistemics ladder: evidence identified from
Information, analysis built from evidence, conclusions graded on how they
follow only from evidence and analysis. **Layer 3 is the UI surfaces** users
interact through. Development focus remains on the foundation until it is
complete enough; it then moves first to the UI, which still needs to be
designed; once the UI is fleshed out enough, development fills in capabilities
across all three layers.
