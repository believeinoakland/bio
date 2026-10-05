# Design Requirements extracts (BIO_Design_Requirements_v2.txt)

## chunk 1-250
TIME
- [RULING] §7 amended by Bob 2026-09-30 L164 (Action §5 row 2; K102, K608) — "a met trigger proposes the next stage, with its age; a member advances it or declines with a reason. The protocol never advances itself (Requirement 12)."
- [DESIGN] §7 L166-174 — seven stages "Discovery and Documentation, Notification, Clock Starts, Response Evaluation, Escalation to Legal Tools, Sustained Attention, Political Accountability"; "Each stage has defined entry conditions, defined actions, defined timelines, and documented trigger conditions for the next stage." ("Clock Starts" is a named stage)
- [DESIGN] §8 amended 2026-09-26 L178 — counsel packet includes "a chronology" and "any deadline that binds a claim"
- [DESIGN] §6 L145-146 — metadata status "(draft, published, challenged, updated) with links to any challenges or updates" (versioning over time)
- [DOCTRINE] §6 L153-156 — "Staff turnover does not extinguish institutional accountability." (holder changes over time)
ORGANISATIONS
- [DOCTRINE] §6 L149-156 — "Work products document institutional actions and compliance. Individuals are named only in their official capacity in connection with specific documented actions (e.g., 'the Finance Director certified the ACFR' or 'the City Administrator signed the directive'). Accountability belongs to the role and the institution."; "If the institution cannot answer for actions taken by predecessor occupants of a role, that failure of institutional recordkeeping is itself a compliance issue." (position vs holder; predecessors)
- [NEED] §6 L141-145 — metadata must disclose "any relationships between the producing group or its members and the government entities, officials, contractors, or other stakeholders being analyzed" (relationships to entities, officials, contractors)
- [NEED] §6 L138 — metadata "area of government addressed"
- [EXAMPLE] §8 Tier 1 L193-196 — CPRA requests, grand jury complaints, State Controller referrals, "City Auditor whistleblower complaints, Brown Act violation reports, public comment at government meetings" (each an addressee body)
- [EXAMPLE] §8 Tier 3 L213-215 — legal orgs "HJTA, ACTA, First Amendment Coalition, Prop 218 specialist attorneys"
- [DESIGN] §1 L75-82 — admin responsibilities may be assumed by "any willing participant, an existing nonprofit, think tank, or community organization"; "Administrative access ... shared among at least two individuals" (group's own organisation)
LAW
- [DESIGN] §8 L180-185 — "Evidence packages contain all factual findings, source documents, and analysis ... includes identification of which laws or policies appear to have been violated and the factual basis for that determination." "Evidence, analysis, and legal theory identification are speech and civic engagement, protected by the First Amendment."
- [DESIGN] §8 Tier 3 L205-212 — Tier 3 includes "Proposition 218 challenges, CCP Section 526a taxpayer actions, federal consent decree motions, and any claim involving constitutional interpretation or statutory construction"; package "identifies that these legal theories are available, explains the factual basis, and explains why they require competent counsel"
- [RULING] §8 amended 2026-09-26 L178 — counsel packet: "the facts with their citations, a chronology, exhibits with provenance, the standards' text, candidate legal theories and remedies, and any deadline that binds a claim ... never in a form that can be filed as it stands. Counsel drafts and files."
- [DESIGN] §4 L113-121 — "Compliance with the publishing standard is defined by a published skill file (skill.md)" — a standard as human-readable and AI-executable (internal 'law' of quality)
COURTS
- [DESIGN] §8 L187-190 — tiering prevents actors "creating adverse precedent that could foreclose future, properly constructed legal challenges"
- [DESIGN] §8 Tier 2 L199-203 — "procedural errors could result in dismissal, typically without prejudice (meaning refiling is possible but costs time and money). Includes: CPRA court petitions."
- [DESIGN] §8 Tier 3 L205-207 — "a loss on the merits could create adverse precedent binding on future litigants"
- [EXAMPLE] §8 L208 — "federal consent decree motions"
ANALYSIS
- [NEED] §6 L139-143 — metadata "content classification (facts, analysis, judgment, or combination); all data sources with sufficient detail for independent retrieval and verification; methodology documentation sufficient for an independent group to reproduce the analytical results"
- [DOCTRINE] §4 L105 — "Quality is enforced by publishing standards and reproducibility, not by gatekeepers."
- [DOCTRINE] §5 L129-133 — "Forks at the judgment layer are legitimate ... Forks at the fact or analysis layer signal a reproducibility issue for the network to investigate"
- [NEED] §2 L89-93 — a single individual must be able to "access public data, produce a standards-compliant work product ... useful to one person with a few hours a week"
QUESTIONS
- [DESIGN] §4 L116-121 — any participant can "run a work product through an AI using the skill file to produce a reference opinion on the degree and areas of compliance and noncompliance"; results "groups consider when deciding whether to accept"
- [DESIGN] §9 L240-248 — AI spam filtering; "AI moderation skill that flags potentially non-compliant or disruptive content for community evaluation without removing it. All automated moderation is advisory and transparent. No automated system removes content without community review."
- [RULING] §7 L164 — "The protocol never advances itself (Requirement 12)."
- [GAP] status L8 — §4 and §12 name a compliance skill that "remain[s] unbuilt as named skills"
DOCTRINE
- [DOCTRINE] preamble L52-54 — "The system fails if any requirement is violated."
- [RULING] §7 amended 2026-09-26 L162 — seventh stage Political Accountability: "asking elected officials to act on the breach, oversight and audit requests, testimony, and legislation that restores or enforces an existing requirement. Policy advocacy and candidate support are not part of it; Operational Principle 1 stands."
- [DOCTRINE] §5 L125-128 — "No canonical source of truth. Each group independently evaluates and accepts or rejects other groups' work products. Acceptance is public and traceable. Dependencies between work products are explicit"
- [DOCTRINE] §1 L73 — "The protocol is the authority."
- [RULING] status L12 — declared-bias addendum middle clause SUPERSEDED by DEC-20: "only an uncleared HUNCH refuses publication"
- [DOCTRINE] §6 L149-152 — individuals named only in official capacity (bears on private individuals)

## chunk 251-487
TIME
- [DESIGN] §10 L254-255 — directory indexed by "area of government, status, date, content type, and producing group"
- [RULING] §10 DEC-111 L285-287 — directory "records when it first saw each notice and each signing key, and keeps every notice"; "Stated ... lapses after 60 days" (a lapse rule computed in days)
- [DESIGN] §10 L276-279 — inactive link -> entry "flagged as archived" (state change over time)
- [EXAMPLE] §11 L314-315 — "attending council meetings and public hearings" (meetings)
ORGANISATIONS
- [RULING] §10 DEC-111 L283-284 — "Entries are filed under the public body they examine and shown on every place page that body touches (the requirement's 'indexed by area of government')" — public body as the index key; a body touches several places (jurisdictional overlap)
- [RULING] §10 DEC-111 L281-283 — directory at "believeincities.org/<place>"; believeinoakland.org redirects to believeincities.org/oakland (place as an organising key)
- [RULING] §10 DEC-111 L288-290 — "each group's record is shown as facts, never a score"; "a group with no published work may have at most two open notices"; "This is the network site's policy; it binds no rival directory."
- [EXAMPLE] §11 L301-302 — key public data sources "OpenGov, ACFR archive, City Auditor reports, NextRequest portal, court records"
- [DESIGN] §14 L376-377 — "No single person, group, platform, funding source, attorney, or institutional relationship is essential"
LAW
- [EXAMPLE] §11 L302-304 — legal tools guide: "CPRA requests, Brown Act attendance, grand jury complaints, Prop 218 challenges, State Controller referrals, CCP Section 526a taxpayer actions"
- [EXAMPLE] §11 L305-306 — personal legal protections: "anti-SLAPP, First Amendment, whistleblower statutes"
- [DESIGN] §12 L335-337 — "a government compliance analysis skill that compares specific government actions against applicable legal and policy standards"
- [DOCTRINE] §15 L410-413 — "The core values, operational principles, and design requirements are location-neutral." (jurisdiction-free)
COURTS
- [EXAMPLE] §11 L301-302 — "court records" as a key public data source
- [EXAMPLE] §11 L312-316 — "what personal information becomes visible in court filings"; "how to respond to legal threats" (group as party)
ANALYSIS
- [DESIGN] §12 L333-335 — "data extraction skills for pulling structured information from public sources (ACFRs, budget documents, OpenGov portals)"
- [DESIGN] §12 L340-341 — "comparison skills that analyze where two groups' analyses of the same data diverge" (reproducibility across groups)
- [DESIGN] §10 L271-272 — "directory data is maintained in a downloadable structured format (CSV or JSON)"
QUESTIONS
- [DESIGN] §12 L329-342 — tools list: compliance skill file; data extraction; government compliance analysis; "escalation protocol guidance that helps groups determine where they are in the seven-stage process and what the next step is"; "cross-referencing skills that identify related published work products across the network"; comparison skills; moderation skills
- [DOCTRINE] §12 L344-351 — "Every tool is published with a human-readable explanation of what it does and transparent methodology"; "No tool has authority to approve, reject, or gate any work product or action. No tool is required for participation. Tools are themselves civic OS resources, subject to the same scrutiny"
- [DESIGN] §10 L263-265 — "A published compliance skill evaluates each submission against the metadata standard and displays compliance status."
DOCTRINE
- [RULING] Addendum L466-472 — bias "a declared, justified, first-class construct"; "no BIO process may consult an undeclared lens"
- [RULING] DEC-20 L474-483 — "only an uncleared HUNCH refuses publication (op=publishpreflight -> UNCLEARED_HUNCH). Ordinary bias debt is DISCLOSED and TRAVELS with every published case"
- [BUILT] REC-47 L485-487 — "a published case now carries an authored bias acknowledgement, fresh per edition, in the signed bytes and in the portable container (DEC-46 (a))"
- [DOCTRINE] §13 L357-361 — designed for opposition that will "disrupt, co-opt, discredit, infiltrate, and legally harass"
- [DOCTRINE] §15 L396-398 — "The system is subject to the same evidence-based evolution it demands of its work products."
- [DOCTRINE] §11 L321-322 — materials "understandable by someone with no prior civic engagement experience and usable within one session"
