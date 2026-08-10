**Believe in Oakland**

**Design Requirements**

Consolidated Version --- April 2026 (v2, June 2026)

These design requirements are the architectural specifications for the
Believe in Oakland (BIO) civic operating system. They define how the
system is built and how it functions. Each requirement derives from the
core values and operational principles. The system fails if any
requirement is violated. Requirements are organized into eight
categories: Architecture, Quality and Publishing, Escalation,
Communication and Access, Onboarding, Tools, Resilience, and Evolution.

# Architecture

### 1. Fully distributed. No hierarchy, no headquarters, no central authority.

There is no board, no executive, no spokesperson, no central repository,
no treasury. Believe in Oakland is a framework that people adopt, not an
organization that people join. This is the primary defense against the
protection system's optimization for neutralizing hierarchical
opponents.

Initial setup functions (domain registration, platform provisioning,
website creation, starter materials development) are bootstrapping
activities that carry no ongoing discretionary authority, analogous to
launching any distributed system such as an open-source project or a
cryptocurrency network. The bootstrapper creates the infrastructure and
defines the protocol. The protocol is the authority.

Administrative responsibilities for ongoing infrastructure maintenance
(server upkeep, website updates, directory management) may be assumed by
any willing participant, an existing nonprofit, think tank, or community
organization, or distributed among multiple individuals. Administrative
access to critical infrastructure is shared among at least two
individuals and can be transferred. Administrators are custodians of
shared infrastructure, not authorities over the network's content,
direction, or work products.

### 2. The system works at every scale without modification.

A single individual, a small group, and a federation of groups all use
the same framework: same values, same principles, same publishing
standards, same escalation protocol. Nothing is added or changed as the
network grows. A single individual must be able to learn the principles,
access public data, produce a standards-compliant work product, initiate
the escalation protocol, and publish findings without requiring
assistance from or approval by anyone else. The system must be genuinely
useful to one person with a few hours a week.

### 3. Groups form and dissolve freely without permission, registration, or announcement.

Anyone can form a group. No approval exists. A group can operate
privately. Participation in BIO is demonstrated by the quality and
standards-compliance of published work, not by any formal affiliation.
Groups can dissolve at any time without affecting any other group's
work. This eliminates gatekeeping at the point of entry.

# Quality and Publishing

### 4. Quality is enforced by publishing standards and reproducibility, not by gatekeepers.

No review board. No approval process. Any group publishes at any time.
The publishing standard is the quality mechanism: work products that
meet the standard can be evaluated on the merits. Work products that
don't are identifiable as noncompliant. Reputation accrues through
consistent quality. No authority manages this process.

Compliance with the publishing standard is defined by a published skill
file (skill.md) that serves as both a human-readable compliance standard
and an AI-executable evaluation tool. The human-readable portion defines
what compliance requires in plain language. Any participant can read it
and make a manual compliance determination. Any participant can also run
a work product through an AI using the skill file to produce a reference
opinion on the degree and areas of compliance and noncompliance. Neither
path requires a gatekeeper. Both produce results that groups consider
when deciding whether to accept a work product for their own use.

### 5. Each group maintains its own accepted body of work.

No canonical source of truth. Each group independently evaluates and
accepts or rejects other groups' work products. Acceptance is public and
traceable. Dependencies between work products are explicit, similar to
citation chains in academic research or dependency trees in software.
Forks at the judgment layer are legitimate and expected: two groups can
reach different conclusions about what to do based on the same verified
evidence. Forks at the fact or analysis layer signal a reproducibility
issue for the network to investigate through the process described in
Operational Principle 4 (follow the evidence).

### 6. Every published work product includes standardized metadata.

The metadata form accompanies every published work product and includes:
summary of the work product; area of government addressed; content
classification (facts, analysis, judgment, or combination); all data
sources with sufficient detail for independent retrieval and
verification; methodology documentation sufficient for an independent
group to reproduce the analytical results; disclosure of any
relationships between the producing group or its members and the
government entities, officials, contractors, or other stakeholders being
analyzed; status (draft, published, challenged, updated) with links to
any challenges or updates from other groups; point of contact for
questions; and references to related work products from any group.

Work products document institutional actions and compliance. Individuals
are named only in their official capacity in connection with specific
documented actions (e.g., "the Finance Director certified the ACFR" or
"the City Administrator signed the directive"). Accountability belongs
to the role and the institution. Staff turnover does not extinguish
institutional accountability. If the institution cannot answer for
actions taken by predecessor occupants of a role, that failure of
institutional recordkeeping is itself a compliance issue.

# Escalation

### 7. The escalation protocol operates on defined stages with documented trigger conditions.

Six stages: Discovery and Documentation, Notification, Clock Starts,
Response Evaluation, Escalation to Legal Tools, Sustained Attention.
Each stage has defined entry conditions, defined actions, defined
timelines, and documented trigger conditions for the next stage. Any
group or individual can initiate the protocol independently. The
protocol is designed to be mechanical: when trigger conditions are met,
the next stage activates. This removes the human hesitation that the
protection system exploits.

### 8. Evidence is separated from legal strategy. Available actions are classified by risk.

Evidence packages contain all factual findings, source documents, and
analysis. These are fully public and available to all. This includes
identification of which laws or policies appear to have been violated
and the factual basis for that determination. Evidence, analysis, and
legal theory identification are speech and civic engagement, protected
by the First Amendment.

Legal strategy and filing templates are tiered by risk to prevent
well-meaning but legally unsophisticated actors from creating adverse
precedent that could foreclose future, properly constructed legal
challenges:

**Tier 1 --- File Freely.** Actions where incorrect filing creates no
lasting legal harm. Includes: CPRA requests, grand jury complaints,
State Controller referrals, City Auditor whistleblower complaints, Brown
Act violation reports, public comment at government meetings, and media
outreach. Filing templates for these actions are included in the
evidence package. Any individual can initiate these actions.

**Tier 2 --- File with Caution.** Actions where procedural errors could
result in dismissal, typically without prejudice (meaning refiling is
possible but costs time and money). Includes: CPRA court petitions.
Filing templates are included with advisory notes recommending legal
review before filing.

**Tier 3 --- Do Not File Without Competent Legal Counsel.** Actions
where a loss on the merits could create adverse precedent binding on
future litigants. Includes: Proposition 218 challenges, CCP Section 526a
taxpayer actions, federal consent decree motions, and any claim
involving constitutional interpretation or statutory construction. The
evidence package identifies that these legal theories are available,
explains the factual basis, and explains why they require competent
counsel. Filing templates for Tier 3 actions are NOT included. The
package provides contact information for legal organizations equipped to
evaluate and file such actions (HJTA, ACTA, First Amendment Coalition,
Prop 218 specialist attorneys).

The risk classification is included in the evidence package metadata so
that the public record reflects BIO's explicit guidance about
appropriate use of the evidence. The system minimizes financial barriers
to escalation but does not provide or manage funding.

# Communication and Access

### 9. The system operates across multiple platforms. No single platform is essential.

A primary discussion forum (self-hosted Discourse at a BIO-controlled
domain such as forum.believeinoakland.org) serves as the operational hub
for cross-group discussion, discovery, and methodology debate.
Public-facing channels (a subreddit, social media) serve outreach and
recruitment. Groups communicate internally through whatever platforms
they choose (Signal is recommended for encrypted communication). Work
products are hosted by individual groups on platforms of their choosing
(an accessible mainstream shared-folder service is the default
recommendation; the Open Science Framework at osf.io is recommended for
groups wanting formal version control and reproducibility
infrastructure). Any hosting
platform is acceptable provided the work product is publicly accessible
via a stable URL.

Spam protection and basic content hygiene may be maintained through
automated back-office infrastructure (AI-based spam filtering) that
operates as part of platform maintenance, analogous to an email spam
filter. This is an infrastructure function, not a participant-facing
moderation tool. The communication platform may also employ an AI
moderation skill that flags potentially non-compliant or disruptive
content for community evaluation without removing it. All automated
moderation is advisory and transparent. No automated system removes
content without community review.

### 10. believeinoakland.org serves as the public directory and gateway.

The website provides: the mission statement, core values, and
operational principles with explanatory paragraphs; a searchable
directory of all published work products indexed by area of government,
status, date, content type, and producing group, linking to work
products wherever they are hosted; the starter kit (tutorials,
templates, guides to public data sources and legal tools, guide to
personal legal protections); a submission form for groups to add work
products to the directory; and default onramps for new groups ("Join the
discussion," "Set up a workspace," "Communicate securely," "Publish your
first work product").

Work products submitted to the directory appear without pre-approval. A
published compliance skill evaluates each submission against the
metadata standard and displays compliance status. The community can flag
entries that appear to be spam, non-compliant, or deliberately
misleading. Flagged entries remain visible but are marked as flagged,
preserving the no-gatekeeper principle while making quality signals
visible.

The directory data is maintained in a downloadable structured format
(CSV or JSON) so that any group can maintain a local mirror. Critical
work products, particularly evidence packages and work products cited as
dependencies by other groups, should be hosted on at least two
independent platforms to ensure persistence. Groups that dissolve are
encouraged to ensure their published work remains accessible. If a link
in the directory becomes inactive, the entry is flagged as archived, and
groups that previously accepted the work product are encouraged to make
their copies available.

# Onboarding

### 11. Starter materials are publicly available and sufficient for immediate participation.

The starter kit includes: mission statement and preamble; core values
and operational principles with explanatory paragraphs; walkthrough
tutorial using a real case (the sewer fund case serves as the first);
the publishing metadata template; the compliance skill file
(human-readable and AI-executable); guide to key public data sources
(OpenGov, ACFR archive, City Auditor reports, NextRequest portal, court
records); guide to available legal tools (CPRA requests, Brown Act
attendance, grand jury complaints, Prop 218 challenges, State Controller
referrals, CCP Section 526a taxpayer actions); guide to personal legal
protections and security practices (anti-SLAPP, First Amendment,
whistleblower statutes, digital security practices, personal safety
considerations); and access instructions for all communication
platforms.

The security practices guide covers: using a separate email address for
BIO-related correspondence; understanding that communications with city
officials may be subject to public records requests; understanding what
personal information becomes visible in court filings and public records
requests; personal safety considerations for attending council meetings
and public hearings; understanding anti-SLAPP protections and how to
respond to legal threats; basic digital security (strong passwords,
two-factor authentication on BIO-related accounts); and awareness that
opposition may attempt to identify and target participants through their
online activity.

All materials must be understandable by someone with no prior civic
engagement experience and usable within one session. Available at
believeinoakland.org at no cost.

# Tools

### 12. AI tools and other resources may be developed to support operations. All tools are advisory, transparent, and optional.

AI skills and other tools may be developed to support civic OS
operations. The primary tool is the compliance skill file (skill.md),
which defines publishing standards in both human-readable and
AI-executable form, enabling distributed quality control without
gatekeepers. Additional tools may include: data extraction skills for
pulling structured information from public sources (ACFRs, budget
documents, OpenGov portals); a government compliance analysis skill that
compares specific government actions against applicable legal and policy
standards; escalation protocol guidance that helps groups determine
where they are in the six-stage process and what the next step is;
cross-referencing skills that identify related published work products
across the network; comparison skills that analyze where two groups'
analyses of the same data diverge; and communication moderation skills
that flag potentially non-compliant content for community evaluation.

Every tool is published with a human-readable explanation of what it
does and transparent methodology for how it does it, consistent with
Operational Principle 2 (show your work). The human-readable portion
ensures that the tool's standards and logic are accessible to anyone,
with or without AI. No tool has authority to approve, reject, or gate
any work product or action. No tool is required for participation. Tools
are themselves civic OS resources, subject to the same scrutiny,
acceptance, and evolution as any other work product.

# Resilience

### 13. The system is designed to function under active opposition.

The architecture, communication infrastructure, publishing standards,
and onboarding materials are designed with the assumption that the
protection system will attempt to disrupt, co-opt, discredit,
infiltrate, and legally harass the network and its supporters. This
assumption informs every design choice.

Specific implications: the communication platform supports blocking and
moderation at the individual level. Publishing standards, enforced
through the compliance skill file, make noncompliant work products
identifiable without gatekeepers. Starter materials include
comprehensive guidance on legal protections and security practices. The
escalation protocol functions even if specific groups are disrupted or
individuals are targeted. Pressure against supporters is documented as
evidence per Operational Principle 8. The distributed architecture
ensures that compromising any single group, platform, or individual does
not compromise the network.

### 14. No single point of failure exists in the system.

No single person, group, platform, funding source, attorney, or
institutional relationship is essential to continued operation. If any
component is compromised, the system continues through redundant
elements:

Work products persist across multiple platforms chosen by individual
groups. Communication can migrate between platforms (if the Discourse
forum goes down, groups communicate through the subreddit, email, or
Signal while the forum is restored from backup). Evidence packages are
available for any actor to pick up. Published work survives the
dissolution of the group that produced it. Forum administration, website
hosting, and domain registration can be transferred between individuals.
Administrative access to all critical infrastructure is shared among at
least two individuals. The directory data exists in downloadable
structured format that any group can republish.

# Evolution

### 15. The system evolves through documented practice and broad consensus.

Values, principles, requirements, standards, and tools evolve based on
evidence from practice. The system is subject to the same evidence-based
evolution it demands of its work products.

Changes to core values require broad consensus across the network. The
mechanism for establishing consensus will be defined through practice,
with the expectation that core value changes are extraordinary events
requiring near-universal agreement among active groups. Changes to
operational principles and design requirements can be proposed by any
group and adopted independently, with convergence over time through
demonstrated effectiveness. This is the same Darwinian process that
governs work product acceptance: practices that produce better results
attract broader adoption.

The framework is designed to be adoptable by other communities. The core
values, operational principles, and design requirements are
location-neutral. Communities adopting the framework operate
independently under their own identity (e.g., "Believe in Richmond,"
"Believe in California") using the same shared principles.
Cross-community learning and resource sharing are encouraged but not
required.

# Reference: Core Values

**1. Our government is held accountable only when we are paying
sustained attention. There are no shortcuts and no substitutes.**

**2. It is our duty as citizens to verify that our government is acting
lawfully. The law guarantees our right to do so.**

**3. Accountability is built on credible facts. Nothing else holds up.**

**4. Our government must follow the law and its stated policies. No
exceptions.**

# Reference: Operational Principles

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

# Revision note

*June 2026: Corrected the introduction's category count from "seven" to
"eight," matching the eight category headings (Architecture; Quality and
Publishing; Escalation; Communication and Access; Onboarding; Tools;
Resilience; Evolution). For consistency with the reconciled eight-skill
inventory (see BIO_Functional_Architecture and BIO_Complete_Roadmap v3),
the example tools in Requirement 12 now also mention a government
compliance analysis skill. No requirement was added, removed, or
substantively changed.*


*Addendum, July 27, 2026 (Bob's direction, recorded as a requirement so no
future revision treats it as optional): BIO legitimizes bias as a declared,
justified, first-class construct. Any BIO work done with bias must include the
fully declared bias as part of the evidentiary record of that work; work
carrying unsettled bias debt cannot be ratified for publication; and no BIO
process may consult an undeclared lens. The construct is defined in
BIO_Declared_Bias_v0_1.md.*

> **AMENDED 2026-08-02 by Bob (DEC-20); vocabulary corrected 2026-08-05 (D-188,
> DEC-46 (d)). The middle clause above is SUPERSEDED and is left standing only
> because it is a dated record of a direction.** As it reads, *"work carrying
> unsettled bias debt cannot be ratified for publication"* states the opposite
> of the doctrine. The rule now: **only an uncleared HUNCH refuses publication**
> (`op=publishpreflight` → `UNCLEARED_HUNCH`). **Ordinary bias debt is DISCLOSED
> and TRAVELS with every published case**, which is what makes the FIRST clause
> above — the declared bias is part of the evidentiary record — mean something
> rather than being unreachable. The two clauses were in tension as written, and
> DEC-20 resolved it in favour of the first.
>
> REC-47 built the half that makes the first clause operative: a published case
> now carries an **authored bias acknowledgement**, fresh per edition, in the
> signed bytes and in the portable container (DEC-46 (a)).
