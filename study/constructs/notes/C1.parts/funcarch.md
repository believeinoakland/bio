# Functional Architecture extracts (BIO_Functional_Architecture_v3.txt)

## chunk 1-200
TIME
- [GAP] status L8 — v3 annotation describes retired daemon; "periodic work now runs on one reconciling Durable Object alarm (docs/development/SCHEDULER.md). Not re-annotated."
- [BUILT] (history) annotation L82-92 — M2' daemon (retired substrate) ran "source change detection, deadline and recheck sweeps, first-capture creation from named standing intent"; "deciding what to monitor and what a detected change means stays with sessions and humans"
- [DESIGN] L1 Function 3 Archive L167-178 — "Everything retrieved is stored locally with timestamps"; evidence preservation: "the archived version provides evidence of what was publicly available and when" (as-of)
- [DESIGN] L1 Function 4 L192-194 — "Monitoring operates at configurable frequencies (hourly, daily, weekly, monthly, per council meeting)" (meeting-relative recurrence)
- [DESIGN] L1 Function 3 L183-187 — dynamic data snapshot "keyed to a stable query definition" (raw capture, normalized dataset hashed and diffed, rendered view)
ORGANISATIONS
- [EXAMPLE] L1 Function 1 L131-137 — public govt info: stated city policies "(administrative directives, council resolutions)"; audit reports "(City Auditor, grand jury, State Controller)"; public records "(CPRA responses, council agendas and minutes, NextRequest portal)"
- [EXAMPLE] L1 Function 1 L139-141 — BIO network info: other groups' work products, "working on" signals, forum discussions
LAW
- [NEED] L1 Function 1 L131-134 — discover "regulations (Municipal Code, state statutes, constitutional provisions), court decisions (case law, consent decrees), stated city policies (administrative directives, council resolutions)" — hierarchy of legal sources incl. policies
- [DESIGN] three layers L114-115 — "Layer 2: Analysis. Compare government actions against legal and policy standards to identify compliance or noncompliance."
COURTS
- [NEED] L1 Function 1 L132-133 — "court decisions (case law, consent decrees)"; L135-136 audit reports (City Auditor, grand jury, State Controller)
- [NEED] L1 Function 2 L152 — "Court decisions are embedded in legal databases."
ANALYSIS
- [NEED] L1 Function 2 L149-154 — "An ACFR is a 180-page PDF. The OpenGov portal is a JavaScript application ... Budget documents are formatted for reading, not analysis. ... extract structured, analyzable data from them."
- [DESIGN] L1 Function 2 resolved L156-163 — "The structured core is JSON in tidy/long form for line items, carrying provenance, source locator, content hash, criticality, and fact/analysis/judgment classification; .md and .svg companions are derived views." persisted as Information bundle (Tech Arch §7.1; State Rules §4.1)
- [DESIGN] L1 Function 3 L183-188 — snapshot of dynamic data = raw capture (WACZ), "canonicalized normalized dataset (hashed and diffed)", rendered view; "The hash is taken over the normalized dataset."
- [EXAMPLE] L1 Function 1 L134-135 — "financial documents (ACFRs, adopted budgets, quarterly reports, OpenGov portal data)"
QUESTIONS
- [DESIGN] L1 Function 1 L143-145 — discovery through "user-initiated search (the Search category in the UX) and AI-driven surfacing (the Context Skill assembling relevant information based on the group's focus areas)"
- [DESIGN] annotation L93-99 — escalation ladder of Intake Doctrine v1.1 §6: "the daemon executes named intent, sessions discover with their own tools, and humans are engaged only for the impossible or the impractical (acts of authority, judgment, and action)"
DOCTRINE
- [DOCTRINE] place L5 — this doc "fixes where human judgment is required per layer, which the interaction constructs and the assistant's fences inherit (BIO_System_Design.md §3 rows 11-12)"
- [DESIGN] three layers L103-109 — layers are "concurrent layers that operate throughout the workflow", not phases: "A group in the Investigate phase is doing Layer 1 work ..., Layer 2 work (analyzing ...), and potentially Layer 3 work ... simultaneously." (bears on structural observation: analysis against standards is concurrent with investigation, not after publication)
- [GAP] status L10 — cross-reference findings persisted "as a Focus object"; Focus collapsed into INQUIRY (DEC-72)
- [GAP] status L11 — Compliance and Escalation skills unbuilt as named skills
- [RULING] status L12 — no transitive trust revised to transitive-trust-when-disclosed

## chunk 201-410
TIME
- [DESIGN] L1 Function 4 L203-205 — removed content: "The archived version is preserved and the removal is flagged as potential evidence of concealment."
- [DESIGN] L1 resolution L211-214 — detected modification/removal "sets the Information object's source status and propagates a re-evaluation flag to every object citing it" (State Rules §5.4 cascade) — as-of reasoning / staleness
- [EXAMPLE] L2 Function 4 L311-313 — "A city department that files a report two days late is technically noncompliant but may not warrant escalation. A $52.6 million unauthorized transfer over nine years is a different matter." (lateness, duration, pattern)
- [EXAMPLE] L2 Function 1 L255-256 — "in FY 2023-24" (fiscal period in a government action)
- [DESIGN] L2 resolution L283-288 — Focus triaged "elevate/defer/dismiss with recheck triggers"
- [DESIGN] L3 Function 3 L401-403 — Escalation Skill identifies "the current stage, available actions by risk tier, and upcoming deadlines"
ORGANISATIONS
- [EXAMPLE] L2 Function 4 L311-312 — "A city department that files a report two days late" (department owes a report by a date: obligation)
- [EXAMPLE] L2 Function 2 L274-275 — "The City Auditor's finding may reference a policy that the Municipal Code doesn't contain" (office vs law)
LAW
- [EXAMPLE] L2 Function 1 L254-261 — "Given a government action ('the city transferred $2.1M from the Sewer Service Fund to the General Purpose Fund in FY 2023-24') and the applicable legal framework ('Municipal Code 13.04.080 restricts sewer fund revenue to sewer system purposes; Prop 218 Article XIII D Section 6(b)(2) prohibits ...'), produce a structured comparison: what the law requires, what the city did, where they match, where they don't, and what questions remain unanswered."
- [DESIGN] L2 Function 1 L263-267 — Government Compliance Analysis Skill "evaluates whether a government action meets legal and policy standards"; distinct from publishing-standard Compliance Skill
- [DESIGN] Skills L1 L227-228 — "Legal/Policy Lookup Skill: discovers applicable laws, policies, ordinances, regulations, and case law." (operates in Layer 1)
- [DESIGN] Skills L2 L351-352 — Legal/Policy Lookup "maps applicable standards so the comparison has the correct reference framework" (Layer 2)
- [DESIGN] L2 Analysis outputs L327-341 — three outputs per government action: "Compliant" (documented, no escalation; "demonstrates that BIO examines facts evenhandedly"), "Noncompliant" ("triggers the escalation protocol if the group chooses"), "Unclear: insufficient information to determine compliance. This triggers a return to Layer 1" (CPRA, research, outreach)
- [DESIGN] L3 Function 3 L404-406 — "For Tier 3 actions, the skill identifies the legal theory and directs the group to appropriate legal counsel."
- [DESIGN] L2 Function 2 L274-275 — auditor finding referencing a policy the code doesn't contain (existence check of a cited provision)
COURTS
- [DESIGN] L2 Function 4 L317-319 — AI can surface "prior findings on the same issue, other groups' analyses, applicable legal precedents" to support human significance judgment
ANALYSIS
- [NEED] L2 Function 2 L271-276 — "Government noncompliance often becomes visible only when multiple data sources are compared. The ACFR may show a transfer amount that doesn't match the OpenGov data. The budget narrative may describe a program that the actual expenditure data doesn't support." (cross-source reconciliation; budget vs actuals)
- [DESIGN] L2 Function 2 L278-281 — partially supported by Data Extraction and Govt Compliance Analysis; "the judgment about what discrepancies are significant is human work"
- [DESIGN] L2 resolution L283-288 — discrepancy persisted as Focus, "dual-sourced (agent scan or human browsing), related to existing Focuses in a graph with agent-proposed, human-decided edges" (superseded by INQUIRY)
- [DESIGN] L2 Function 3 L292-307 — classify fact/analysis/judgment: "facts are verifiable, analysis is reproducible, and judgment is debatable"; "classification is a first-class field on every Information object ... travels with the data through the pipeline"
- [DESIGN] L2 Function 4 L313-315 — significance "informed by context, scale, pattern, and consequences" (scale and pattern as analytic inputs)
- [DESIGN] L3 Function 1 L369-375 — work product with "full data, methodology, and reasoning"; "methodology documentation sufficient for reproduction"
- [DESIGN] L3 resolution L377-382 — Work Product "a focused, source-grounded derived view ... with a machine-checked citation register grounding every load-bearing claim in archived, hashed primary sources"
- [DESIGN] Skills L2 L354-355 — Data Extraction "provides structured data for cross-referencing"
QUESTIONS
- [DOCTRINE] L2 L246-250 — "most judgment-intensive layer ... AI can dramatically reduce the effort by doing initial comparison work, but the human evaluates every flagged discrepancy and makes every determination."
- [DOCTRINE] L2 Function 4 L317-319 — "AI can support this judgment by surfacing relevant context ..., but the determination itself is a human responsibility."
- [DESIGN] L1 skills L218-236 — Context, Data Extraction, Archive, Legal/Policy Lookup, Monitoring operate in Layer 1; "five of the eight skills operate in Layer 1 ... where AI support has the highest leverage"
- [DESIGN] L3 resolution L392-397 — two evaluation functions: "Compliance Evaluation (conformance) and Argument Evaluation (soundness), each in internal or external strictness mode"; readiness ladder "draft, internally checked, externally compliant, distributed" advances "only on recorded passing evaluations"
- [DESIGN] L3 Function 2 L386-389 — Compliance Skill surfaces "missing metadata, insufficient methodology documentation, unsupported claims"
DOCTRINE
- [DOCTRINE] L2 Function 4 L319-323 — OP1 "policy neutral, compliance only" most tested at significance: "the temptation to let policy preferences color compliance judgments is strongest"
- [DOCTRINE] Analysis outputs L330-333 — documenting compliance "demonstrates that BIO examines facts evenhandedly, not just looking for violations"
- [DESIGN] "Unclear" output L338-341 — undetermined as first-class outcome that returns to information gathering (precursor of UNDETERMINED)

## chunk 411-613
TIME
- [DOCTRINE] L3 Function 5 L418-422 — track toward resolution; "The exit condition is specific: compliance restored AND consequences addressed (Operational Principle 6). The Monitoring Skill tracks deadlines, response status, and data changes. Partial compliance is documented but doesn't stop the clock."
- [DESIGN] L3 resolution L424-428 — "Escalations and their clocks are persisted as Action objects; every date-bearing clock entry carries the statute, order, or commitment it derives from, and overdue entries are marked, never silently stale." (State Rules §4.4)
- [DESIGN] Cross-cutting search L453-455 — results carry provenance "(which source, which skill found it, how current)"; resolution L458-459 adapters emit "provenance, source identity, recency, and trust"
- [DESIGN] Change detection resolution L496-502 — "presence comparison with redirect-matching and a confirmation window for removals" (time window); "preserve both versions on every change"
- [DESIGN] three-layer workflow L599-604 — analysis layer requester indicates "whether found documents should be kept up to date and when or how often the data layer should look for updates (served today by named requests, monitored gathering with frequency, and source-status tracking)"
ORGANISATIONS
- [EXAMPLE] L3 Function 4 L410-412 — communicate with "the city (CPRA requests, public comment, council testimony)"
- [DOCTRINE] L3 Function 4 L413-414 — communication governed by "show your work, institutional framing, policy neutral"
- [DESIGN] eighth skill L537-538 — comparison of "what the standard requires, what the city did" (the city as the actor whose act is compared)
LAW
- [DESIGN] eighth skill L532-546 — Govt Compliance Analysis would "Accept a government action (with supporting data from Layer 1) and applicable legal/policy standards (from the Legal Lookup Skill)"; "Produce a structured comparison"; "Flag specific discrepancies with explanations of why they may constitute noncompliance"; "Identify what additional information would be needed to resolve ambiguous cases"; "Present all of this for human evaluation, not as a determination."
- [NEED] eighth skill L548-551 — "the analytical engine that every group needs. Without it, every group builds its own comparison methodology from scratch."
- [DESIGN] inventory L564-565 — Legal/Policy Lookup "Layers 1 and 2. Maps applicable laws, policies, and case law."
- [DESIGN] inventory L570-572 — Govt Compliance Analysis "Layer 2"; L583-584 "bridges Layers 1 and 2, converting information into analytical findings"
- [GAP] eighth skill L523-530 — "The current seven-skill architecture has a gap ... in Layer 2: the analytical comparison of government actions against legal standards."
- [DESIGN] Cross-cutting search L446-448 — query must hit "city data sources (Municipal Code, OpenGov, ACFR archive), legal databases (statutes, case law), the BIO directory ..., the group's local archive, and news sources"
COURTS
- [NEED] Cross-cutting search L447 — "legal databases (statutes, case law)"
ANALYSIS
- [DESIGN] Data transformation pipeline L465-477 — "retrieval ..., extraction ..., normalization (convert to consistent format for comparison), and storage"; output "Information bundle with a JSON tidy/long structured core; Layer 2 skills consume Information bundles through the store's read interface"
- [DESIGN] Change detection L484-487, L496-499 — structured data "field-level comparison"; "meaningful change versus noise (rounding differences, formatting changes)"; resolved "keyed field-level diff with numeric tolerances for structured data" (Tech Arch §7.4)
- [DESIGN] Trust signals L506-512 — "A data point extracted from an ACFR has different trust characteristics than a data point from another group's analysis. The trust signal should travel with the data through the transformation pipeline" (grade of a derived/source number per data point)
- [DESIGN] three-layer workflow L606-609 — Project work "graded by the epistemics ladder: evidence identified from Information, analysis built from evidence, conclusions graded on how they follow only from evidence and analysis"
QUESTIONS
- [DESIGN] Cross-cutting search L445-455 — single search query fans out across heterogeneous sources; must define "how results are aggregated and deduplicated, how results carry provenance ..., and how results are presented with trust signals"; resolved L457-461 "thin orchestrator over independent, optional per-source adapters, each emitting a common record shape ...; de-duplication on canonical identity; transparent ranking" (Tech Arch §7.3)
- [DESIGN] three-layer workflow L598-606 — analysis layer "articulates objectives that define what it wants to see in the data store: a specific document, a kind of document, a document set that could contain a piece of evidence it needs"; "uses AI skills to define and achieve focused analytical objectives, done in the context of a FOCUS" (now INQUIRY)
- [RULING] Trust resolution L514-519 — "Argument Evaluation is the engine behind 'independently verified'"; incoming work "locally re-evaluated before citation (no transitive trust)" (since revised: transitive-when-disclosed)
DOCTRINE
- [DOCTRINE] three-layer workflow L595-613 — Bob's framing (Jul 27): Layer 1 foundation = data plane; Layer 2 analysis relies on foundation, "under the declared bias in force and graded by the epistemics ladder"; Layer 3 = UI surfaces. (NB a different meaning of "layer" from the build's 11 layers and from the functional 3 layers; status L13 notes it neither points to constructs nor reconciles names)
- [DOCTRINE] eighth skill L546, L551 — "not as a determination"; "human judgment remains the deciding factor"
