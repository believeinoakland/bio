# working extraction: BIO_Technical_Architecture_Decisions_v10.txt

## chunk 1-300
STATUS/WHAT
- l.3 status: "Working Document — v10, July 2026"; banner "THIS IS THE ARGUMENT, NOT THE SYSTEM"; written against substrate retired July 2026; "where a decision below is expressed as a general rule, it is live; where it named a mechanism, the mechanism is in the archive"; where it disagrees with docs/BIO_DATAPLANE_STATE.md, dataplane state is the system (as of 2026-09-14).
- l.6 place: governs Roadmap on tech/architecture; defers to Design Requirements, State Rules, Intake Doctrine; Membership v2 supersedes §10 per-member tokens decision; AUTHORITY-AND-TRUST revises no-transitive-trust; Mechanical Verification Law and interruption model §10.7 are what plane implements (System Design §3 rows 14–15).
- l.96-98 built system: Cloudflare Worker + Durable Object with SQLite, R2 for captured bytes, installed into group's own Cloudflare account by `newgroup`; no accelerator, no promotion queue.

QUESTIONS (AI)
- [GAP] Incomplete §6 l.13 — "sessions and execution modes are priced against a June 2026 billing change and no ruling or dataplane entry carries the Session abstraction."
- [OPEN] Incomplete §12 l.20 — "all six specialist sub-questions remain open as stated; "permitted use" still gates headless dispatch."
- [DOCTRINE] §1 l.195 — R12 "AI tools advisory, transparent, optional --- no tool gates any work product or action."
- [DESIGN] §1 l.208-212 — Fact 2: "AI capability and pricing are in continuous transition." context windows/turn budgets grew; "Providers are moving away from flat-rate subscriptions toward metered credit pools. BIO is designed for that transition, not today's convenience."
- [DESIGN] §1 l.214-220 — philosophy: "keep methodology in human-readable, AI-executable skills, and keep code thin where it can be"; caveat: real application carries UX, orchestration, validation, processing.
- [DESIGN] l.104 — doctrine kept includes "the Session abstraction and the moving capability cap".
- [DESIGN] §2 table l.245-254 — Focus: "A conflict or discrepancy, found by an analysis agent or by a person while browsing"; triage lifecycle surfaced → elevated/deferred/dismissed (superseded by INQUIRY collapse DEC-72, l.10).

TIME
- [DESIGN] §2 table l.263-272 — Action: "A pursued course from the action suite (planning, communications, calendaring, prosecutions, negotiations, settlement, collaboration). Carries the clock."
- [DESIGN] §2 table l.238-243 — Information carries "provenance and change-detection state".
- [DESIGN] §2 l.274-279 — Annotation: anchored, asynchronous human input that triggers re-evaluation of its target; lifecycle pending → addressed.

COURTS
- [DESIGN] §2 l.263-272 — action suite includes prosecutions, negotiations, settlement.
- [DESIGN] §2 l.286-300 — Work Product: "a legal-brief-style argument grounded in credible primary sources"; unit distributed and indexed; frozen into a portable artifact at distribution.

LAW / ANALYSIS
- [EXAMPLE] §0 l.129-133 — "The Oakland sewer fund case is an exemplar pilot used to pressure-test the architecture against a real, messy source, not a call to act publicly."
- [DESIGN] §2 l.245 — Focus is Analysis layer: conflict or discrepancy found by an analysis agent; Project "Carries its own analysis and initiates Actions" (l.256-261).

DOCTRINE
- [DOCTRINE] §1 l.187-202 — R1 fully distributed; R2 scales 1 to 1,000 groups without modification; R9 multiple platforms; R12; R13 "Designed for active opposition --- assume disruption, co-option, infiltration, legal harassment."; R14 no SPOF.
- [DOCTRINE] l.172-174 — Mechanical Verification Law: every store invariant carries an executable check; pre-write gate and consistency checker run same check set.
- [DESIGN] l.161-170 — v4: references are canonical bundle IDs never substrate locators; lifecycle state in frontmatter only.
- [DESIGN] §1 l.204-206 — Fact 1: build contracted; maintainers may be non-technical; bus-factor dominant risk → boring, widely-supported building blocks.

## chunk 301-600
TIME
- [DESIGN] §3 l.331-332 — history/ subfolder preserves prior versions with manifest; "In BIO this doubles as evidence preservation."
- [DESIGN] §3 l.366-369 — frontmatter universal core includes "timestamps, producing mode and capability tier, typed references, append-only state history".
- [DESIGN] §4 l.473-479 — "BIO's sources mutate and disappear (the city may revise or delete the very data an argument rests on)" → distributed Work Product carries "timestamped, hashed snapshots of the primary sources it cites" so recipient verifies against same evidence "even after the original is altered or removed."
- [DESIGN] §4 l.456-460 — Work Product live view during development; frozen at distribution (as-of a point).

LAW
- [EXAMPLE] §4 l.466-468 — argument "is a tree whose leaves are credible primary sources (an ACFR, a court record, a statute, an OpenGov dataset). You do not re-derive a primary source; you cite it and rely on its credibility."
- [DESIGN] §5 l.527-530 — Compliance Evaluation (conformance) checks a Work Product meets publishing standard (well-formed) — note: "conformance" here means document conformance to publishing standard, not government conformance to law.
- [DESIGN] §5 l.567-572 — external distribution invokes three-tier risk classification "(file freely / file with caution / requires counsel)".

COURTS
- [EXAMPLE] §4 l.467 — "a court record" as a credible primary source leaf.
- [DESIGN] §4 l.435-437 — Work Product "Focused, like a legal brief".
- [DESIGN] §5 l.569-570 — risk tier "requires counsel".

ANALYSIS
- [EXAMPLE] §4 l.467 — "an ACFR ... an OpenGov dataset" as primary-source leaves (financial reports, datasets).
- [DESIGN] §4 l.439-446 — fact/commentary firewall: "supporting evidence is factual data and fact-based analysis from credible sources; anything not 100% factual is explicitly labeled as commentary or narrative"; "Reproducible: the conclusions and their supporting data are complete enough that a recipient can rebuild the conclusion with fidelity (show your work)."
- [DESIGN] §4 l.448-449 — "Dual-mode metadata: highly structured, processable both algorithmically and by a properly skilled AI."
- [DESIGN] §4 l.469-471 — "verification is finite and local: do the cited primary sources say what is claimed, and does the synthesis validly carry that data to the conclusion."
- [DESIGN] §4 l.494-501 — external bar: focused, complete, "reproducible by anyone"; readiness ladder working draft → internally checked → externally compliant → distributed, enforced by recorded evaluations.
- [DESIGN] §3 l.384-387 — Description-as-truth, artifact-as-rendering: for rendered artifacts (SVG diagrams) authoritative content is machine-readable description; rendered file regeneratable, stale-detection at write time (relevant to charts in publications).

QUESTIONS (AI)
- [DESIGN] §2 flow l.303-311 — "Analysis agents, and people while browsing, surface Focuses"; Annotations inject human judgment; "an agent later re-evaluates the annotated thing."
- [DESIGN] §4 l.453-456 — Focusing: "an agent typically drafts the focused brief from the matured Project, a human refines it, and an evaluation skill checks it."
- [DESIGN] §4 l.481-486 — citation register: every load-bearing claim carries keys resolving to Information object, archived snapshot, hash; "a claim that cannot name its keystone sources is not a supported claim and moves to commentary or to open questions."
- [DESIGN] §5 l.532-544 — Argument Evaluation (internal validity): "do the cited primary sources say what is claimed, and does the synthesis validly carry that data to the conclusion"; "makes a Work Product machine-checkable for soundness"; engine behind 'independently verified' trust level: "an AI or another group re-derives the conclusion from the cited, archived primary sources."
- [DESIGN] §6 l.586-594 — Session = (trigger, execution mode, skill, context) producing schema-conformant bundle output; trigger = goal/policy activation; three obligations: read-at-start, continuous checkpoint, save-and-close; consumers "never need to know whether a human, an interactive-agentic surface, or a headless agent produced them."
- [DESIGN] §6 l.598 — "As of the June 15, 2026 Anthropic billing change, the modes sit at three points on a cost spectrum" (continues).

DOCTRINE
- [CONFLICT/DOCTRINE] §5 l.532-544 — Argument Evaluation lets "an AI ... re-derive the conclusion" and makes soundness "machine-checkable" — sits uneasily with later doctrine that the machine never concludes/attests (layer 6 contract); this doc is "the argument" of July 2026; later docs govern.
- [DOCTRINE] §5 l.548-555 — No transitive trust: "Trust is never inherited; it is re-established locally at every hop"; "Credibility is demonstrated by the work, never by the producer's reputation" (REVISED by AUTHORITY-AND-TRUST 2026-07-30: accepted if disclosed in provenance chain, l.12).
- [DESIGN] §3 l.349-357 — canonical IDs; "No substrate locator — a host's file id, a URL, a path — ever appears as a link between objects"; derived index regenerable, never authoritative.
- [DESIGN] §3 l.376-382 — bundles accretive; deletion exceptional, reason-gated, preserved, cascading; "deletion of cited material is never silent."
- [DESIGN] §3 l.389-391 — dual-audience encoding: concise insider label + verbose newcomer description.
- [DESIGN] §3 l.395-400 — single write authority (superseded implementation, l.11).

ORGANISATIONS
- [DESIGN] §4 l.505-510 — incoming Work Products from other groups via directory; vetted; stored as Information objects with analysis classification (group-to-group relations, not government orgs).

## chunk 601-900
QUESTIONS (AI models, providers, cost, compute)  [task asks to note especially]
- [DESIGN] §6 table l.601-619 — three execution modes (as of June 15, 2026 Anthropic billing change): Interactive chat (human drives claude.ai; flat subscription bucket, bounded by rate limits, no dollar overage); Interactive agentic (Claude Code / Cowork; human-initiated, writes bundle files; flat subscription — "The cost-bounded sweet spot"); Headless agent (Agent SDK / claude -p; scheduled, autonomous; "Separate monthly Agent SDK credit at API rates; bounded by a credit ceiling, then pay-as-you-go").
- [DESIGN] §6 l.621-623 — "Interactive work is bounded by a clock (rate limits); agent work is bounded by a budget (a credit ceiling). An agent run carries a budget; an interactive run carries a clock."
- [DESIGN] §6 l.625-630 — "Capability cap as a moving parameter": "'What a mode can reliably complete' is a configurable, time-varying policy value, not a constant"; bundle records mode and capability tier; "as windows, budgets, and models improve, the ceiling rises and work migrates interactive to agent with no rearchitecting."
- [DESIGN] §6 l.632-637 — Mode-quality boundary: "Interactive sessions can produce fundamentally higher-quality results than agents on judgment-heavy work, the analysis layer most of all"; agents for repetitive, scheduled, low-judgment work; interactive for judgment-heavy; boundary moves as capability rises.
- [DESIGN] §6 l.641-654 — two classes of human input: immutable review notes (acted on by a human) and annotations (anchored, async, re-evaluation trigger); "a human annotates a conclusion with a doubt, and an agent re-runs Argument Evaluation on just that conclusion and records whether it holds"; glide path "from interactive-heavy today toward agent-heavy-with-asynchronous-human-judgment over time."
- [DESIGN] §6 l.656-664 — annotations persisted as accretive in-bundle records; never edited or deleted.
- [RULING/DESIGN] §6 l.666-676 — Provider abstraction: "Design for Claude as the AI provider; build the schema contract and a thin Session-executor interface now and let that be the future-provider seam."; skills are portable SKILL.md files across interactive surfaces and Agent SDK; onboarding = log into a Claude subscription; "Raw API keys are advanced-only; a stray ANTHROPIC_API_KEY silently bills pay-as-you-go instead of the subscription."
- [DESIGN] §6 Decision l.678-685 — "Cost is a clock (interactive) or a budget (agent). The capability cap and mode-quality boundary are moving policy parameters."; "Claude-first, with the schema + executor interface as the provider seam."
- [GAP] (from Incomplete l.13) — this whole §6 pricing is against June 2026 billing; no ruling or dataplane entry carries the Session abstraction.
- [DESIGN] §7.5 l.742-749 — Focuses found "by the analysis agent's scan and by people during browsing"; each new Focus "cross-compared against all known Focuses to find connections"; "The relationship/clustering is agent-proposed and human-decided: the agent surfaces candidate connections; a human confirms, severs, or adds them."
- [DESIGN] §7.3 l.722-727 — Search "a thin orchestrator over independent, optional per-source adapters, each emitting the common record shape with provenance, source identity, recency, and trust"; "Rank transparently by trust, authority, and recency."
- [DESIGN] §8.1 l.841-883 — seven navigation surfaces (Context, Search, New Developments, Monitoring, Communications, Projects, Settings); journeys incl. "Conflict & discrepancy filtering" producing Focuses (+ issue-type config).

ANALYSIS (spreadsheet / data processing)  [task asks to note especially]
- [DESIGN] §7.1 l.693-699 — Data Extraction skill → Information bundles; "The structured core is JSON (tidy/long for line items, carrying provenance, source locator, content hash, criticality, and fact/analysis/judgment classification)"; .md/.svg derived views; "Tooling (June 2026): Tabula and Camelot for native PDFs, cloud ML extractors for scanned or irregular documents; prefer a source's published spreadsheet over re-parsing its PDF."
- [BUILT (historic)] §7.1 l.701-709 — proven mechanical source classes (exercised July 19, 2026): "Socrata full-file exports (the OpenGov transfer series), and Granicus Legistar REST (webapi.legistar.com/v1/{client}, unauthenticated, OData v3, percent-encoded literals; the Oakland legislative chain INFO-2026-0109 through 0119)"; source outside proven class "needs a session with its own tools until its class is proven." (Note: mechanism-level statement on retired substrate.)
- [DESIGN] §7.2 l.713-718 — snapshot of a dynamic source: three-layer capture keyed to a stable query definition: raw capture (e.g. WACZ), "a canonicalized normalized dataset (hashed and diffed)", rendered view; "Hash the normalized dataset, not raw HTML."
- [DESIGN] §7.4 l.731-738 — change detection: "SHA-256 plus extracted-text/table diff for static documents; keyed field-level diff with numeric tolerances for structured data; content-extracted text diff for web pages; presence comparison with redirect-matching and a confirmation window for removals"; change sets source status and propagates re-evaluation flag to every citing object.
- [DESIGN] §7.3 l.724-727 — de-duplicate on canonical identity "(normalized URL + content hash + (source, native-id))", preserving every provenance trail.

TIME
- [DESIGN] §7.4 l.734 — "a confirmation window for removals" (time window before a removal is declared).
- [DESIGN] §7.6 l.785-790 — "Unknown cadence values default to monthly." cadence vocabulary closed (C-18.5); "the most conservative recheck posture".
- [DESIGN] §7.6 l.778-783 — fan-out one request per document "lets the due slate name what is actually outstanding" (due slate = schedule of rechecks).
- [DESIGN] §7.5 l.753-755 — "All Focuses, dismissed or not, receive recheck triggers, making the whole graph self-correcting over time."
- [DESIGN] §7.7 l.806-816 — "Trusted timestamps are RFC 3161": timestamp.digicert.com primary "failed silently on every attempt"; freetsa.org fallback carries every token; "a token from it proves existence-at-instant to anyone who accepts that chain"; register records which authority issued each token.
- [DESIGN] §7.7 l.818-825 — M3' asymmetry: member-submitted documents (in hand, interactive-state exports, email-delivered) carry trusted timestamp over capture hash but no co-archive.
- [DESIGN] §7.3 l.723 — records carry "recency"; ranking by recency.
- [DESIGN] §8.1 l.873-875 — Action management journey produces "plans, comms, calendaring, ... + Work Products".

LAW
- [EXAMPLE] §7.1 l.705-707 — Granicus Legistar REST as a proven source class: "the Oakland legislative chain INFO-2026-0109 through 0119" (legislative records: matters, legislation).

ORGANISATIONS
- [EXAMPLE] §7.1 l.703-707 — data platforms of government (Socrata/OpenGov; Granicus Legistar per {client}) — vendors acting for governments; no org model stated.

COURTS
- none in chunk.

DOCTRINE
- [DOCTRINE] §7.5 l.748-749 — agent-proposed, human-decided (relationships among Focuses).
- [DOCTRINE] §7.5 l.751-753 — dismissal is reversible greying, not deletion.
- [DESIGN] §8 l.835-837 — Client: static local-first PWA; "no central datastore to breach or subpoena" (superseded: built plane is Worker + DO, l.16).
- [DESIGN] §7.6 l.770-776 — locators are ordered fallbacks for one document, never fan-out.

## chunk 901-1200
TIME
- [DESIGN] §8.2 l.915-920 — "Clocks belong to Actions: an Action's timeline scales from a single statutory date (a CPRA request's deadline) to a multi-stage schedule with dependencies (a civil suit). Every date-bearing clock entry carries the statute, order, or commitment it derives from. The Monitoring skill watches them; New Developments and the Overview surface what is approaching or overdue." (KEY: deadlines of statutory/order/commitment origin; multi-stage dependent schedules; approaching/overdue surfacing.)
- [DESIGN] §8.3 Decision l.946 — "clocks live on Actions".
- [DESIGN] §10.4 l.1185 — standing intent includes "a due monitor" (scheduled due-ness).
- [DESIGN] §10.2 l.1088-1091 — distributed Work Product carries "archived, hashed, timestamped primary-source evidence".
- [DESIGN] §10.2 l.1114-1116 — "Checks are versioned with the per-type schema stamps, so old bundles keep validating against the version they declare" (version in force as-of declared schema).

LAW
- [EXAMPLE] §8.2 l.916-917 — "a single statutory date (a CPRA request's deadline)" (California Public Records Act — jurisdiction-specific example in an architecture doc).
- [DESIGN] §8.2 l.918-919 — every clock entry "carries the statute, order, or commitment it derives from" — law, court orders and commitments as deadline sources.
- [DESIGN] §8.3 l.925-926 — kernel invariant includes "values, principles, publishing standard, bundle schema, escalation protocol, the seven-category shell".

COURTS
- [EXAMPLE] §8.2 l.917 — "a multi-stage schedule with dependencies (a civil suit)" — court case schedules as a clock shape.
- [DESIGN] §8.2 l.918 — "order" as a deadline origin.
- [EXAMPLE] §8.3 l.933 — internal task-specific surface: "a negotiation tracker".

ANALYSIS
- [DESIGN] §8.3 l.929-931 — extension surface kinds: "outbound/rendering (slide decks, spreadsheets, exports)", inbound/response-generating (surveys, forms, email campaigns — heavier, backend, attack surface), internal task-specific (Focus-triage board, Project workspace, negotiation tracker). Spreadsheets appear as an OUTPUT rendering surface.
- [DESIGN] §8.3 l.934-937 — "the Analysis layer is intent-driven (a group expresses interests, objectives, and requirements and the system shapes its process and products)".
- [DESIGN] §9 l.1017-1022 — "Data / extraction: Python, scoped to the information layer's document/data extraction, run as in-sandbox tool-scripts a skill invokes. The agent shells out to Python; it is not written in Python."
- [DESIGN] §9 l.1032-1037 — Bundle substrate: group-controlled multi-format folder store; "Never a spreadsheet, and no substrate as any central surface."
- [DESIGN] §9 Decision l.1058-1061 — "Python for what touches data, Markdown for what the AI does, dependency-free JavaScript for what must run identically everywhere for years." (Superseded stack: built plane is Worker + DO, l.16.)
- [DOCTRINE] §10.2 l.1106-1113 — Mechanical Verification Law: "a correct prose contract does not reliably produce conforming output; only a mechanical check run against the written artifact does."

QUESTIONS (AI cost/compute)
- [DESIGN] §9 l.986-989 — same SKILL.md across Chat, Cowork, Claude Code and headless Agent SDK; methodology portable and mode-agnostic.
- [DESIGN] §9 l.994-999 — Methodology = Markdown skills (+ Python/bash helper scripts) "The bulk of the system's logic."
- [DESIGN] §9 l.1011-1015 — "Agent orchestration: The Claude Agent SDK in TypeScript".
- [DESIGN] §10.3 l.1120-1140 — Resource and token discipline: "No session ever loads 'all of these skills.'"; thin dispatcher loads minimal set (dispatch spine, one analytical skill, one bundle-type schema); progressive disclosure; "Per-mode lean derivatives: agents run a stripped, token-budgeted derivative; interactive sessions can afford the fuller skill."; "Preselection/triage: a cheap first pass chooses which detectors or lenses this job needs."; on-disk working copy + range reads; "Bounded passes that hand off through the bundle".
- [DESIGN] §10.3 l.1142-1147 — compaction resilience: keep authoritative artifact out of volatile context; "compaction costs conversational continuity ... not analytical fidelity. The whole discipline is parameterized by the moving capability cap."
- [DESIGN] §8.2 l.906-908 — focusing: "agent drafts, human refines, evaluation validates".
- [DESIGN] §10.4 l.1187-1189 — endpoint worst outcome "wasted quota or budget".

ORGANISATIONS
- none in chunk.

DOCTRINE
- [DOCTRINE] §8.4 l.974-977 — honest-null rule: "A writer that cannot see the substrate writes the substrate locator as null rather than guessing at it ... an invented one is a claim nobody can check."
- [DOCTRINE] §8.4 l.960-972 — one check codebase never a copy; scan and gate consume identical input.
- [DOCTRINE] §10.4 l.1160-1174 — store-authoritative invocation: constrained endpoint takes no authoritative input from caller; "The invocation is a doorbell, not a delivery"; R13 answer.
- [DOCTRINE] §10.4 l.1183-1185 — "Standing intent only ... it never originates intent."
- [DESIGN] §10.2 l.1097-1104 — checker + constrained legal repairs; "a non-technical, distributed audience never free-edits the store but picks from valid repairs".
- [DESIGN] §8.3 l.937-942 — kernel uniform, surfaces where groups differ (R2 vs R15); external integrations optional, per-group, replaceable (R9/R14).

## chunk 1201-1460
QUESTIONS (AI cost/compute/permitted use)
- [GAP/OPEN] §10.4 l.1313-1317 — "Headless dispatch — reading a standing goal from the store and initiating a budgeted session — additionally requires a budget guard recorded in store policy and inherits the permitted-use question of Section 12. Until that resolves, unattended discovery beyond store-named sources stays out of scope, which is the same fence DEC-47 reaches from the other side."
- [DESIGN] §10.4 l.1209-1220 — endpoints open at transport "because AI-accessibility is the point: chat and agentic sessions invoke by plain URL fetch and cannot perform an interactive sign-in"; token is quota-and-attribution, never security boundary.
- [DESIGN] §10.5 l.1356-1368 — Tier A capability strings AI-visible by design (chat token in claude.ai project knowledge, agentic token in skill package config); "no human types them, no AI composes them".
- [DOCTRINE] §10.5 l.1370-1381 — Tier B true secrets resolved by name server-side inside a constrained endpoint; "A session composes a call that carries the name of the secret it needs, never the value"; "the AI directs work without ever holding the means to do harm with it."
- [DESIGN] §10.7 l.1429-1431 — "Every execution platform worth using will terminate a routine mid-flight — at a wall-clock or CPU limit, on an eviction, on a deploy"; rely on WRITE ORDERING (compute limits).
- [DESIGN] §10.4 l.1306-1311 — zero-caller-input index regeneration "deterministic at fixed time, so racing invocations converge byte-identically".

TIME
- [DESIGN] §10.4 l.1240-1244 — no replay defense: "Nonces, timestamps, and request signatures are deliberately omitted" (idempotence).
- [DESIGN] §10.4 l.1261-1268 — invocation log (timestamp, caller class, operation, outcome); anomalies (invalid-token bursts, unfamiliar patterns) as findings; "under Operational Principle 8, probing pressure is evidence" (patterns over time).
- [DESIGN] §10.4 l.1319-1324 — failure posture: refuse per locator, record refusals, write nothing, "leave the due condition standing"; Section 10.9's rule "absence is information, failure is not permission".
- [DESIGN] §10.7 l.1455-1460 — self-expiring claims carry timestamps, "expire on a timeout set past the platform's own execution wall"; stale claims C-16.5 findings.
- [DESIGN] §10.6 l.1399-1419 — VERSIONS.json single version authority (retired mechanism per Incomplete l.17; does not exist); design documents version independently; "Ratifying a new document version is a documentation act first; the record updates when the tree is actually brought into conformance".
- [EXAMPLE] §10.7 l.1434-1436 — July 19, 2026 tick hit the wall after packaging two of four captures, recovered without loss or duplication.

ANALYSIS
- [DESIGN] §10.6 l.1419 — "Prose claims about code contents remain outside mechanical reach; the standing mitigation is citing artifacts rather than characterizing them."
- [DESIGN] §10.7 l.1449-1453 — "Cascade before change": re-evaluation packages written before changed bundle's capture record; idempotent cascade; set-but-never-clear flags.

DOCTRINE
- [DOCTRINE] §10.4 l.1201-1207 — closed registry; "A general dispatch, eval, or RPC endpoint is permanently prohibited"; ingesting content/arbitrary ops = backend.
- [DOCTRINE] §10.4 l.1292-1297 — "An admission that cannot state its own worst case has not been made."
- [DOCTRINE] §10.4 l.1299-1304 — write endpoint that judges nothing constrained by PATH.
- [DOCTRINE] §10.5 l.1383-1388 — no secret ever written into the store ("a secret placed in it is a published secret").
- [DESIGN] §10.4 l.1222-1230 — per-member tokens deliberately not used (superseded by Membership v2, l.17).
- [DESIGN] §10.4 l.1281-1288 — rejected candidate stays on record "as a recorded decision NOT to admit, with the condition that would reopen it."

LAW / COURTS / ORGANISATIONS
- none in chunk.

## chunk 1461-1713
TIME
- [DESIGN] §10.10 l.1530-1535 — "created is real UTC. The manifest's created field carries the actual UTC instant of the write, never a session-declared or backdated stamp"; backdated session stamps exposed on first live-fire day; two early promotion keys carry them (cosmetic, unrepairable without history rewrite).
- [DESIGN] §10.9 l.1514-1517 — degraded index fails closed: "the due condition left standing for the next healthy tick. Absence is information; failure is not permission."
- [DESIGN] §10.8 l.1477-1478 — "the 5-minute trigger" (retired mechanism, l.18).
- [OPEN] §12 l.1619-1625 — work-product staleness: when a cited item changes, is the Work Product re-focused automatically or flagged stale; cascade sets flag and requires recorded re-evaluation to clear; "whether re-focusing is automatic remains open."
- [DESIGN] Declared bias l.1700-1701 — conclusions graded "UNDER THE DECLARED BIAS IN FORCE" (as-of / in-force reasoning for bias versions); changing bias marks analysis with BIAS DEBT.

LAW
- [EXAMPLE] §11 l.1592-1595 — prototype: "runs analysis to surface a Focus against the Prop 218 / Municipal Code standard" (a state constitutional provision and municipal code as the standard a finding is measured against; jurisdiction-specific example).
- [OPEN] §12 l.1641-1642 — "Evidentiary standards (legal): whether WACZ captures and SHA-256 manifests meet the chain-of-custody an evidence package may need."
- [OPEN] §12 l.1613-1617 — permitted use (legal/governance) of June 15 terms for third-party apps driving subscription-authenticated Agent SDK runs.

COURTS
- [OPEN] §12 l.1641-1642 — evidentiary standards / chain-of-custody for evidence package (admissibility question).

ANALYSIS
- [EXAMPLE] §11 l.1586-1590 — "Write one Data Extraction adapter against the sewer-fund OpenGov data and one ACFR PDF; confirm the JSON core round-trips to companions and that snapshots archive cleanly."
- [DESIGN] §11 l.1600-1603 — Compliance and Argument Evaluation in internal then external mode; fact/commentary firewall; archived snapshots travel with export.
- [EXAMPLE] §11 l.1605-1609 — "Run the same analytical skill once as an interactive session and once as a headless Agent SDK run; confirm both write schema-conformant bundles".
- [DESIGN] §10.8 l.1489-1497 — "the WHOLE id is the identity, a component of it that exists to make the id legible is a hint, and no invariant is claimed for a hint."
- [DESIGN] §10.9 l.1510-1513 — distinguish missing from failure: adapter returns null for absence, throws for transient failure.
- [EXAMPLE] References l.1678-1679 — "PDF data-extraction tools 2026" (lido.app) consulted; changedetection.io consulted (l.1675-1676).

QUESTIONS (AI)
- [OPEN] §12 l.1613-1617 — "Permitted use (legal/governance): the June 15 terms for third-party apps driving a group's subscription-authenticated Agent SDK runs, and whether scheduled/unattended runs are permitted under subscription auth. The Section 10.4 headless-dispatch endpoint candidate depends on this answer before admission."
- [OPEN] §12 l.1627-1632 — dependency-chain depth of re-evaluation; cascade walks one hop at a time; policy defaults open.
- [OPEN] §12 l.1644-1646 — Accessibility: "usable within one session by someone with no civic-tech experience" (Requirement 11).
- [EXAMPLE] References l.1660-1670 — external sources: Anthropic Agent SDK billing change (June 15, 2026, VentureBeat); "Use the Claude Agent SDK with your Claude plan"; Agent Skills in the SDK; cross-surface SKILL.md.
- [DESIGN] §10.10 l.1537-1542 — "author names the deciding member on authority-bearing writes" (release under I-18, elevation, disposition); mechanical writes carry mechanical writer's identity.

ORGANISATIONS
- none in chunk (Declared bias "subject registry" mentioned l.1703 — pointer to BIO_Declared_Bias_v0_1.md).

DOCTRINE
- [DOCTRINE] Declared bias l.1683-1690 — bias = statements of three kinds (scrutiny, inference, pattern); "declared bias may raise scrutiny, constrain inference, and assert evidenced patterns, and may never issue verdicts"; strictest-wins default; LOCKED instance statements.
- [RULING] Declared bias l.1694-1699 — DEC-20 (2026-08-02, Bob), struck 2026-08-05 (D-188): "Ordinary bias debt is DISCLOSED and blocks NEITHER workproduct_state advancement NOR ratification ... Only an uncleared HUNCH refuses publication, by name."
- [DOCTRINE] §10.11 l.1571-1574 — "a guarantee the store states must be enforced by something the store controls. Trusting a producer is a policy about producers, not a property of the store" (decided July 20, 2026, operator's word).
- [DESIGN] Focus rename l.1706-1713 — FOCUS "where the analysis layer defines and pursues focused analytical objectives"; history append-only.
