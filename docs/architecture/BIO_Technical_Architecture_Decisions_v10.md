# Believe in Oakland

# Technical Architecture Decisions

*Working Document --- v10, July 2026 (M2' daemon ratified deployed;
interruption, concurrency, and index-integrity models; manifest
contract; promotion gate posture)*

# 0. Purpose, status, and how to read this

This document records the architecture decisions for the Believe in
Oakland (BIO) civic operating system. It is a companion to the BIO
document set; where it touches design requirements,
BIO_Design_Requirements governs, and where it touches the skill
inventory it assumes the model in BIO_Complete_Roadmap and
BIO_Functional_Architecture. Where it touches data-store matters,
BIO_State_Rules_Consistency governs. Where it touches admission to the
store, BIO_Intake_Doctrine governs.

**Priority framing.** We are designing the full distributed platform to
be right from the start. The Oakland sewer fund case is an exemplar
pilot used to pressure-test the architecture against a real, messy
source, not a call to act publicly. Public action waits until the stack
is judged sufficiently functional, refined, and resilient.

**Companion status.** The data-store state rules and the consistency
checker, summarized here, are specified in full in
BIO_State_Rules_Consistency (v1.4, July 2026): store layout and
canonical naming, bundle anatomy, the universal frontmatter core plus
per-type schemas, per-type state machines, the typed reference model
with cascade semantics, the pending-package queue, convergent promotion,
multi-writer coherence, the invariant set, the
violation-to-repair-action mapping, and the Mechanical Verification Law.
The bundle skill's internal structure is specified in
BIO_Bundle_Skill_Composite_Design (v1.6, July 2026). Admission to the
store, capture grades, co-attestation, release authority, and the
distribution container are governed by BIO_Intake_Doctrine (v1.0,
ratified July 18, 2026), which joined the document set after v9 of this
document.

**Revision note (v10).** Supersedes v9. Ratifies the P2 M2' daemon
completion state at bio-bundle rev 0.1.48 (accelerator 0.10.2,
bio-checks 1.9.0, client 0.7.0), folding the M2' daemon admission slate,
the July 19 live-fire findings, and the operator decisions of July 20.
(a) Section 10.4's registry flips monitor-tick, sweep, and
deadline-recheck (duescan) from candidate to deployed, each live-fire
verified in production on July 19, 2026, and admits member
creation-by-packaging as a write-package capability extension per its
admission note (endpoint-admission-m2b-member-creation.md), deployed at
accelerator 0.10.2. (b) New Sections 10.7 through 10.9 record the
operational models the live fire validated: the interruption model
(manifest-last durability, cascade-before-change ordering, self-expiring
claims, recovery by inflight completion), daemon concurrency
(claim-serialized creation-capable operations, sequence uniqueness
deliberately not an invariant), and fail-closed index integrity (missing
versus failure, degraded-index behavior). (c) New Section 10.10 states
the manifest contract: created is real UTC, author names the deciding
member on authority-bearing writes, and skill_version is the writer's
component version. (d) New Section 10.11 records the promotion gate
posture decided July 20 on the operator's word: the embedded gate runs
at promotion for non-mechanical manifests, implementation queued at
accelerator 0.10.3. (e) Section 7 gains 7.6 (the gathering contract:
locators as ordered fallbacks, one document per request, unknown cadence
defaulting to monthly) and 7.7 (attestation in production: SPN anonymous
mode, the RFC 3161 freetsa fallback with digicert failures recorded, the
CA caveat, and the coming M3' asymmetry for unfetchable member-submitted
documents). (f) Section 7.1 records the proven mechanical source
classes: Socrata full-file exports and Granicus Legistar REST. (g)
Section 10.4's deployment posture gains the OAuth deployment discipline
by reference to DEPLOY-P2M2.md Section 2a. Companion references update
to include BIO_Intake_Doctrine v1.0.

**Revision note (v9).** Supersedes v8. Ratifies the Phase 1 completion
state at bio-bundle rev 0.1.29. (a) Section 10.4's registry folds in the
two Phase 1 admission drafts, the client caller-class slate (list, read,
write-package; drafted July 16) and reindex (drafted July 17); all four
operations are admitted and deployed, live-fire verified through the
July 17-18 deployment trip including the operator's end-to-end write,
and both draft files are superseded by this folding. The status
operation's bundle-selector probe, added during the M4 live-fire
postmortem, is recorded. (b) Section 8 gains 8.4, ratifying the Phase 1
client's settled decisions from the client's decision record
(CLIENT.md): in-repo placement importing bio-checks by relative path,
the two-table mirror schema, and Netlify hosting. (c) Section 10 gains
10.6, recording the VERSIONS.json tree-coherence discipline (adopted at
rev 0.1.16) as a decision. (d) The v8 browser-reachability finding is
upgraded from verified-in-browser to live-verified: the client's
live-fire sync, write, and reindex all ride native /exec CORS within
simple-request rules. (e) The registry's candidate list gains two named
candidates with recorded trigger conditions, batched multi-file read and
read-class log batching; the routine candidate list otherwise stands
empty, with the monitor tick and sweeps pending their Phase 2 consuming
components and headless dispatch pending Section 12. Companion
references update to State Rules v1.4 and Bundle Skill Composite Design
v1.6.

**Revision note (v8).** Supersedes v7. Records two operational findings
from the July 11 accelerator deployment and conformance work, both
binding on Section 10.4's deployment posture. (a) URL capture: inside
the Apps Script editor, getService().getUrl() returns the head
deployment's /dev URL, which demands Google sign-in and which no AI
session can invoke; setup therefore resolves the published /exec URL by
strict precedence (an explicit proxy URL, then the WEBAPP_EXEC_URL
script property the operator sets from Manage deployments, then the
service URL only when it already ends in /exec) and never writes a /dev
URL into any caller credential block; code changes republish as a new
version on the existing deployment, which keeps the URL stable. (b)
Browser reachability: /exec responses carry Access-Control-Allow-Origin:
\* on both the 302 redirect and the final hop, so simple cross-origin
GETs succeed natively from any browser origin, while preflighted
requests fail on a 405 OPTIONS response; callers must stay within
simple-request rules (plain fetch, every parameter in the query string,
no custom headers), which the endpoint contract already enforces.
Verified in a live browser on July 11. This closes the Phase 1
reachability question and covers natively the CORS role once assigned to
the discarded proxy worker.

**Revision note (v7).** Supersedes v6. Ratifies two decisions carried in
prototype as pending. (a) Section 10.4's endpoint registry is updated to
record the operations admitted and exercised during the July 10-11
deployment: the promotion endpoint (drains the queue), the status
operation (read-only health: version, configuration, trigger state,
queue depth), and the selftest operation (packages and promotes one
update in a single designated scratch bundle from standing intent,
hash-verifying the result). All three were live-fire verified against
the deployed CivicOS accelerator. A development-only companion (a
deletable second script file granting path-addressed read/write/delete
plus trash and trigger-tick, guarded by a dead-man expiry and reported
by the status operation's devMode flag) is recorded as an explicitly
temporary, non-production capability, not a registry member. (b) Section
10.5 is added, ratifying the two-tier secret-management scheme. The
permitted-use question (Section 12) remains genuinely open, as it turns
on Anthropic's external subscription terms rather than any BIO decision;
the headless-dispatch endpoint candidate stays blocked on it.

**Revision note (v6).** Supersedes v5. Section 10.4's deployment posture
gains the invocation-token discipline: endpoints deploy with "anyone"
access so AI sessions can invoke by plain fetch, layered with
per-caller-class bearer tokens that are honestly scoped as a
quota-and-attribution mechanism, never a security boundary (integrity
rests on store-authoritative semantics and cannot be strengthened by
identifying callers). Verification is strict rather than lazy (the check
is free, the work costs quota, and rejection is safe because endpoints
are non-load-bearing); replay defense is deliberately omitted
(idempotence makes replays no-ops); tokens live in Script Properties and
caller-side config, never in the mirrorable store; and every invocation
is logged to a non-authoritative operational log whose anomalies the
checker surfaces as findings, per Operational Principle 8.

**Revision note (v5).** Superseded v4. Added Section 10.4, recognizing
constrained endpoints as a capability class available throughout the
workflow: server-side Apps Script endpoints under store-authoritative
invocation semantics, admitted individually through a closed registry,
overcoming connector capability limits without reopening the no-backend
boundary. The promotion endpoint (Bundle Skill Composite Design v1.4,
Product D) is the registry's first admitted member. Section 12's
permitted-use question gained the headless-dispatch endpoint dependency.
Companion references updated to State Rules v1.1 and the Bundle Skill
Composite Design.

**Revision note (v4).** Superseded v3. Recorded the July 2026
design-session decisions, made with the Alpha Pipeline bundle skill
studied as prior art: (a) flat per-type store layout with
reference-based linking and no containment nesting (Section 3); (b)
references are canonical bundle IDs, never substrate locators such as
Drive file IDs (Section 3); (c) lifecycle state lives in frontmatter
only, with no folder moves (Section 3); (d) frontmatter is a universal
core plus a per-type extension, mirroring the composite skill's
core-plus-schemas structure (Section 3); (e) Annotations are persisted
as accretive records within their target bundle rather than as peer
bundles, amending the letter of Section 2 (Sections 2 and 6); (f) the
Mechanical Verification Law: every store invariant carries an executable
check, and the bundle skill's pre-write gate and the client-side
consistency checker run the same check set (Section 10). The v3 revision
history: v3 superseded v2, adding Work Product as the sixth first-class
object type (Section 4), the evaluation-and-trust model (Section 5), the
corrected source-grounding framing (Sections 4 and 5), the anchored
annotation model (Section 6), the Problem relationship graph (Section
7), the UX journeys model (Section 8), and the accretive-bundle,
cascading-deletion, and no-transitive-trust rules (Section 10).

# 1. Governing constraints and design philosophy

Six design requirements bear directly on the technology, and two project
facts compound them.

-   R1 Fully distributed --- no hierarchy, no central authority, no
    > headquarters.

-   R2 Scales 1 to 1,000 groups without modification --- identical
    > behavior at every scale.

-   R9 Multiple platforms, no single platform essential.

-   R12 AI tools advisory, transparent, optional --- no tool gates any
    > work product or action.

-   R13 Designed for active opposition --- assume disruption, co-option,
    > infiltration, legal harassment.

-   R14 No single point of failure --- no person, group, platform, or
    > service essential to operation.

**Fact 1: the build is contracted; maintainers may be non-technical.**
Bus-factor is the dominant risk, pushing toward boring, widely-supported
building blocks and away from any central server someone must operate.

**Fact 2: AI capability and pricing are in continuous transition.**
Context windows and turn budgets grew materially even during a prior
project's development. Providers are moving away from flat-rate
subscriptions toward metered credit pools. BIO is designed for that
transition, not today's convenience.

**Design philosophy.** Prefer client-side and local-first over
server-side; prefer exportable, forkable, mirrorable data; treat every
external service as replaceable; keep methodology in human-readable,
AI-executable skills, and keep code thin where it can be. Caveat: 'thin'
is relative --- skills carry the methodology and are load-bearing, but a
real application carries the UX, orchestration, validation, and
processing, and by volume may exceed the skills.

# 2. The object model

BIO's work is organized around six first-class object types. Four
(Information, Problem, Project, Action) are persisted as independent
bundles (Section 3), each with its own per-type schema. Two are
persisted within the bundles they belong to: the Work Product as a
derived view of its Project or Action (Section 4), and the Annotation as
an accretive record within its target bundle (Section 6; a July 2026
amendment to this table's original framing, ratified because an
annotation is meaningless apart from its target, must travel with the
target when mirrored or handed off, and anchors to sub-elements within
it).

  -----------------------------------------------------------------------
  **Object**              **Layer**               **Role**
  ----------------------- ----------------------- -----------------------
  Information             Information             A collected item of
                                                  interest, tagged by
                                                  criticality (crucial
                                                  vs. nice-to-have),
                                                  carrying provenance and
                                                  change-detection state.

  Problem                 Analysis                A conflict or
                                                  discrepancy, found by
                                                  an analysis agent or by
                                                  a person while
                                                  browsing, related to
                                                  other Problems in a
                                                  graph. Triage
                                                  lifecycle: surfaced,
                                                  then elevated /
                                                  deferred / dismissed.

  Project                 Analysis to Action      An aggregation of one
                                                  or more elevated
                                                  Problems plus other
                                                  factors. Carries its
                                                  own analysis and
                                                  initiates Actions.

  Action                  Action                  A pursued course from
                                                  the action suite
                                                  (planning,
                                                  communications,
                                                  calendaring,
                                                  prosecutions,
                                                  negotiations,
                                                  settlement,
                                                  collaboration). Carries
                                                  the clock.

  Annotation              All                     An anchored,
                                                  asynchronous human
                                                  input attached to a
                                                  specific target that
                                                  triggers re-evaluation
                                                  of that target.
                                                  Lifecycle: pending to
                                                  addressed. Persisted as
                                                  an accretive record
                                                  within the target
                                                  bundle.

  Work Product            Analysis or Action      The focused,
                                                  publishable derived
                                                  view of a Project or
                                                  Action: a
                                                  legal-brief-style
                                                  argument grounded in
                                                  credible primary
                                                  sources. The unit that
                                                  is distributed and
                                                  indexed. Persisted
                                                  within its Project or
                                                  Action bundle; frozen
                                                  into a portable
                                                  artifact at
                                                  distribution.
  -----------------------------------------------------------------------

**The flow.** Users define information of interest and mark what is
crucial. Analysis agents, and people while browsing, surface Problems;
each new Problem is related to existing ones in a graph. Users elevate,
defer, or dismiss Problems; elevated ones (often as a related cluster)
seed Projects. A Project matures its analysis and produces a Work
Product, which may be distributed internally or externally and may, in
turn, initiate Actions. Annotations inject human judgment anywhere,
anchored to a target, and an agent later re-evaluates the annotated
thing.

# 3. The bundle

The unit of persisted work is a bundle: a folder containing files of
different types plus subfolders. The pattern is adapted from a prior
production project; BIO's schemas differ, but the structural machinery
transfers.

-   A bundle is a folder (Google Drive by default; see Section 9). It
    > holds JSON where structure matters and other formats where
    > human-readability or rendering matters: .md for narrative, .svg
    > for diagrams, and others.

-   A state/record split: a compact operational state-and-decision
    > surface (frontmatter + fixed prose sections) the UX renders as a
    > summary, plus the full work-product record. The lean surface keeps
    > resume prompts cheap.

-   A history/ subfolder preserves prior versions with a manifest. In
    > BIO this doubles as evidence preservation.

**Store layout (decided July 2026).** The store is flat: one root folder
per independently persisted type (information/, problems/, projects/,
actions/), each holding that type's bundles. Cross-object relationships
are typed references in frontmatter, never containment nesting. Nesting
was rejected on four independent grounds: the relationships are
many-to-many while containment requires exclusive single-parent
ownership; lifecycles are independent of any would-be parent (a surfaced
Problem may never be elevated into any Project); atomic promotion and
the single write authority are per-bundle operations that nesting makes
ambiguous; and the cascade requires a full reference graph in the
derived index regardless, so containment adds no capability. Containment
survives only for exclusively owned material with no independent
lifecycle: history/, derived views, in-bundle Work Products,
annotations, and distribution snapshots.

**Canonical identity and substrate independence (decided July 2026).**
Every bundle carries an immutable, self-assigned, human-legible
canonical ID that is also its folder name. All references between
objects use canonical IDs. No Drive file ID, URL, or path ever appears
as a link between objects; substrate locators would die on the first
mirror to git or OSF (R9, R14). The per-group derived index maps
canonical IDs to current substrate locators and is regenerable by scan,
never authoritative. The ID grammar and naming rules are specified in
the State Rules spec.

**Lifecycle in frontmatter only (decided July 2026).** A bundle's
lifecycle state lives in its frontmatter; there are no
active/concluded/archived folder moves. The prior project's lifecycle
folders were an ops-console affordance; in BIO, folder moves on state
change would churn the substrate and destabilize nothing-but-gain
canonical paths, while the client filters by frontmatter for free.

**Frontmatter structure (decided July 2026).** Frontmatter is a
universal core (identity, type, schema version stamp, lifecycle state,
timestamps, producing mode and capability tier, typed references,
append-only state history) plus a per-type extension. This mirrors the
composite skill exactly: the always-on core protocol validates core
fields; the on-demand type schema validates the extension. The full
field contract, including the drift defense (canonical names with a
forbidden-alias table, the column-0 rule, literal heading constants,
clean markdown), is specified in the State Rules spec.

**Bundles are accretive.** Material is added far more often than
removed. Deletion is exceptional, gated behind a legitimate reason (a
foundation found incorrect, for example), preserved in history rather
than destroyed, and cascading: removing material that a Work Product's
argument rests on must flag that Work Product, its distributed copies,
and any dependents for re-evaluation. The consistency checker guards
this; deletion of cited material is never silent.

**Description-as-truth, artifact-as-rendering.** For rendered artifacts
(e.g., SVG diagrams), the authoritative content is a machine-readable
description in the bundle; the rendered file is a regeneratable view,
with stale-detection at write time.

**Dual-audience encoding.** Structured items carry both a concise
insider label and a verbose newcomer description, serving BIO's
non-technical audience and the trust-signal tooltips in the UX.

## The composite bundle skill is the single write authority

All bundle writes go through one bundle skill. It is the only writer;
other skills read bundles but delegate writes. This chokepoint keeps the
store trustworthy regardless of which analytical skill or execution mode
did the thinking, and, with no server, it is where atomic promotion
lives (writing the new version and archiving the prior to history/ in
one operation).

'One skill' means one write authority, not one monolithic always-loaded
file. The skill is composite and incrementally loaded: an always-on core
carries the universal write protocol (bootstrap, continuous checkpoint,
write-back with history and promotion, and the canonical-naming,
drift-defense, and validation discipline), while per-type schemas
(Information, Problem, Project, Action) load on demand for the one type
being written. Annotation and Work Product writes are operations on
their containing bundle, handled by the core protocol plus the
containing type's schema. The skill's composite structure, products, and
delivery paths are specified in BIO_Bundle_Skill_Composite_Design.

**Decision.** The unit of work is a bundle (folder; JSON plus .md/.svg
and others; history/). The store is flat per-type roots with
canonical-ID references; substrate locators never link objects;
lifecycle state is frontmatter-only; frontmatter is a universal core
plus per-type extension. Bundles are accretive; deletion is exceptional,
reason-gated, preserved, and cascades to dependents. All writes go
through one composite bundle skill that is the sole write authority and
performs convergent promotion; its always-on core carries the universal
protocol and per-type schemas load on demand.

# 4. Work products

A Work Product is the publishable member of the family: the thing a
group hands to someone else to make a case, analyze an issue, or present
a thesis. It is a derived view within a bundle, not a separate
self-standing object during development. The Project (or Action) bundle
holds everything, including raw notes, dead ends, and suppositions that
did not pan out; the Work Product document is the focused derivation
that refers only to solid, conclusion-supporting material.

## Properties

-   Focused, like a legal brief: only what is central to the argument is
    > presented up front, with supporting material demoted to citations,
    > mouseovers, and supporting documents (progressive disclosure).

-   Fact/commentary firewall: supporting evidence is factual data and
    > fact-based analysis from credible sources; anything not 100%
    > factual is explicitly labeled as commentary or narrative,
    > separated from facts and suppositions.

-   Reproducible: the conclusions and their supporting data are complete
    > enough that a recipient can rebuild the conclusion with fidelity
    > (show your work).

-   Dual-mode metadata: highly structured, processable both
    > algorithmically and by a properly skilled AI.

## Focusing vs. distribution

Two distinct operations. Focusing produces the derived view inside the
bundle: an agent typically drafts the focused brief from the matured
Project, a human refines it, and an evaluation skill checks it.
Distribution snapshots that view into a package that can leave the
group. During development the Work Product is a live view that evolves
with the bundle; at distribution it is frozen into a portable,
mirrorable artifact that survives the dissolution of the producing
group.

## Source-grounding (not self-containment)

A Work Product cannot contain every bit of evidence down to first
principles; as in science, a conclusion is only as convincing as its
underlying data and the synthesis that connects it. The argument is a
tree whose leaves are credible primary sources (an ACFR, a court record,
a statute, an OpenGov dataset). You do not re-derive a primary source;
you cite it and rely on its credibility. So verification is finite and
local: do the cited primary sources say what is claimed, and does the
synthesis validly carry that data to the conclusion.

Because BIO's sources mutate and disappear (the city may revise or
delete the very data an argument rests on), a distributed Work Product
carries timestamped, hashed snapshots of the primary sources it cites,
archived via the Data Archive skill, so a recipient can verify against
the same evidence the producer used even after the original is altered
or removed. The correct formulation is grounded to credible primary
sources, with those sources archived, replacing v2's 'self-contained.'

The machine-checked form of source-grounding is the citation register
specified in the State Rules spec: every load-bearing claim carries keys
resolving to an Information object, its archived snapshot, and its hash.
The keys, not inline citations, satisfy the contract; a claim that
cannot name its keystone sources is not a supported claim and moves to
commentary or to open questions.

## Internal vs. external readiness

Distribution scope sets the bar. An internal distribution need not be
externally ready: the internal check requires that everything present is
accurate and mutually consistent (nothing false, nothing
self-contradictory) but tolerates extraneous material and
incompleteness. The external bar adds the rest: focused, complete, and
reproducible by anyone. The internal check is a relaxation of the same
evaluation, not a different evaluator, so Work Products have a natural
readiness ladder: working draft, internally checked, externally
compliant, distributed. Focusing (stripping to essentials) is mandatory
only at the external boundary. The ladder is enforced by recorded
evaluations (the State Rules spec's evaluation gates): each rung
advances only on the passing evaluation runs it requires.

## Flow directions

Work Products move in three directions, which the Overview surfaces:
incoming (received from other groups via the directory), internal
(developed and shared within the group), and outgoing (distributed
externally). Incoming Work Products are vetted before acceptance
(Section 5) and are stored as Information objects with analysis
classification, which gives no-transitive-trust a concrete storage form.

**Decision.** A Work Product is a focused, source-grounded, derived view
within a Project or Action bundle, with a fact/commentary firewall and
reproducible conclusions. Focusing produces the in-bundle view;
distribution snapshots it, with archived primary-source evidence, into a
portable artifact. Internal distribution requires accuracy and
consistency only; external distribution adds focus, completeness, and
reproducibility, with the ladder enforced by recorded evaluations. Work
Products flow incoming, internal, and outgoing.

# 5. Evaluation and trust

## Two evaluation functions

Two distinct evaluations apply to Work Products.

**Compliance Evaluation (conformance).** Checks that a Work Product
meets the publishing standard: metadata complete, structure correct, the
fact/commentary firewall present, reproducibility documented. It checks
that the document is well-formed.

**Argument Evaluation (internal validity).** Checks whether the
conclusions actually follow from the supporting material and arguments
in the document: do the cited primary sources say what is claimed, and
does the synthesis validly carry that data to the conclusion. It checks
that the document is sound. This makes a Work Product machine-checkable
for soundness, not merely well-formed, and it is the operational form of
'show your work.'

Both run in the internal-strictness or external-strictness mode
described in Section 4. Argument Evaluation is also the engine behind
the trust hierarchy's 'independently verified' level: an AI or another
group re-derives the conclusion from the cited, archived primary
sources.

## No transitive trust

Trust is never inherited; it is re-established locally at every hop.
When a group accepts an incoming Work Product, it runs its own Argument
Evaluation over it regardless of how much it trusts the source, so the
foundational chain on which all Work Products rest cannot be corrupted
by one compromised or co-opted group injecting a bad product (the R13
infiltration threat). Credibility is demonstrated by the work, never by
the producer's reputation, and the local evaluation result attaches as a
trust signal.

This is tractable precisely because of source-grounding. A distributed
Work Product carries its own archived primary-source evidence, so the
receiving group re-derives locally, in one hop, from the included
material; it never has to trust or chase the upstream chain. When a Work
Product cites another Work Product, every link is still anchored in
archived primary sources at its own leaves and carries its own
evaluation, so the chain is verifiable hop by hop, and an upstream
retraction propagates downstream as a re-evaluation (the deletion
cascade of Section 3). No transitive trust, and no infinite regress.

## Distribution risk tiering

External distribution invokes the three-tier risk classification from
the evidence-package design (file freely / file with caution / requires
counsel). So the Work Product is where the publishing standard, the
trust hierarchy, and the risk tiering converge.

**Decision.** Two evaluation functions apply to Work Products:
Compliance Evaluation (conformance) and Argument Evaluation (internal
validity / soundness), each in internal or external strictness mode.
Trust is never inherited: a group always runs its own Argument
Evaluation on incoming Work Products, made tractable by
source-grounding, with the result attached as a trust signal. External
distribution invokes the three-tier risk classification.

# 6. Sessions and AI integration

## The Session abstraction

The core runtime abstraction is a Session: (trigger, execution mode,
skill, context) producing bundle output that conforms to the schema. The
trigger is a goal/policy activation. Every Session follows the same
three obligations regardless of mode: read-at-start (bootstrap from the
bundle), continuous checkpoint, and save-and-close (write-back through
the bundle skill). The standardized bundle is the integration seam: the
UX and the next layer consume bundles and never need to know whether a
human, an interactive-agentic surface, or a headless agent produced
them.

## Three execution modes and their cost physics

As of the June 15, 2026 Anthropic billing change, the modes sit at three
points on a cost spectrum:

  -----------------------------------------------------------------------
  **Mode**                **What it is**          **Cost behavior**
  ----------------------- ----------------------- -----------------------
  Interactive chat        Human drives claude.ai; Flat subscription
                          output captured into    bucket. Bounded by rate
                          the bundle.             limits, no dollar
                                                  overage.

  Interactive agentic     Claude Code / Cowork;   Also the flat
                          agentic,                subscription bucket.
                          human-initiated, writes The cost-bounded sweet
                          bundle files directly.  spot.

  Headless agent          Agent SDK / claude -p;  Separate monthly Agent
                          scheduled, autonomous,  SDK credit at API
                          programmatic.           rates; bounded by a
                                                  credit ceiling, then
                                                  pay-as-you-go.
  -----------------------------------------------------------------------

Interactive work is bounded by a clock (rate limits); agent work is
bounded by a budget (a credit ceiling). An agent run carries a budget;
an interactive run carries a clock.

**Capability cap as a moving parameter.** 'What a mode can reliably
complete' is a configurable, time-varying policy value, not a constant.
The bundle records which mode and capability tier produced it; policy
decides what that mode is permitted to finish; as windows, budgets, and
models improve, the ceiling rises and work migrates interactive to agent
with no rearchitecting.

**Mode-quality boundary.** Interactive sessions can produce
fundamentally higher-quality results than agents on judgment-heavy work,
the analysis layer most of all. Mode selection is driven by goal/policy
with layer defaults: agents for repetitive, scheduled, low-judgment
work; interactive for judgment-heavy work. The boundary itself moves as
capability rises.

## Anchored, actionable annotations

Two classes of human input exist. Immutable review notes are sacrosanct
and acted on by a human. Annotations are anchored, asynchronous inputs:
generated anywhere, always attached to a specific target (potentially a
sub-element such as a single claim or conclusion), and the attachment is
a re-evaluation trigger. An agent takes a pending annotation,
re-evaluates the anchored target in its light, and records how it
responded, so the human can verify their judgment was honored.
Annotations compose with Argument Evaluation: a human annotates a
conclusion with a doubt, and an agent re-runs Argument Evaluation on
just that conclusion and records whether it holds. This decouples expert
judgment from skillful interactive sessions, which is decisive for a
distributed, non-technical network and, with the moving cap, defines a
glide path from interactive-heavy today toward
agent-heavy-with-asynchronous-human-judgment over time.

**Persistence (decided July 2026).** An annotation is persisted as an
accretive record within its target bundle (an annotations/ subfolder,
one record per annotation), written through the bundle skill without
promoting the target's state surface. It travels with the bundle when
mirrored or distributed, and its anchor resolves within the bundle it
lives in. Annotations are never edited or deleted after creation; a
mistaken annotation is addressed with a response saying so. The record
shape, collision-resistant identity, and lifecycle are specified in the
State Rules spec.

## Provider abstraction and onboarding

Design for Claude as the AI provider; build the schema contract and a
thin Session-executor interface now and let that be the future-provider
seam. Skills are portable SKILL.md files that run unchanged across the
interactive surfaces and the Agent SDK, so moving work between modes
requires no rewrite. The cost-bounded, amateur-friendly onboarding path
is to log into a Claude subscription; guided agentic setup comes first,
with interactive mastery as a growth path. Raw API keys are
advanced-only; a stray ANTHROPIC_API_KEY silently bills pay-as-you-go
instead of the subscription.

**Decision.** The runtime unit is a Session (interactive chat,
interactive agentic, or headless agent), unified by the three
obligations and the bundle seam. Cost is a clock (interactive) or a
budget (agent). The capability cap and mode-quality boundary are moving
policy parameters. Annotations are anchored, asynchronous inputs
persisted as accretive in-bundle records that trigger agent
re-evaluation of their target. Claude-first, with the schema + executor
interface as the provider seam.

# 7. Information- and analysis-layer decisions

Full schemas are in the State Rules spec; the decisions stand.

## 7.1 Extraction output

The Data Extraction skill produces Information bundles. The structured
core is JSON (tidy/long for line items, carrying provenance, source
locator, content hash, criticality, and fact/analysis/judgment
classification); .md and .svg companions are derived views. Tooling
(June 2026): Tabula and Camelot for native PDFs, cloud ML extractors for
scanned or irregular documents; prefer a source's published spreadsheet
over re-parsing its PDF.

**Proven mechanical source classes (added v10).** Two source classes are
proven mechanically capturable by the deployed daemon, both exercised in
production July 19, 2026: Socrata full-file exports (the OpenGov
transfer series), and Granicus Legistar REST
(webapi.legistar.com/v1/{client}, unauthenticated, OData v3,
percent-encoded literals; the Oakland legislative chain INFO-2026-0109
through 0119). A source in a proven class needs only a planted gathering
request; a source outside them needs a session with its own tools until
its class is proven.

## 7.2 Snapshots of dynamic sources

A snapshot is a three-layer logical capture keyed to a stable query
definition: a raw capture (evidentiary, e.g. a WACZ web-archive), a
canonicalized normalized dataset (hashed and diffed), and a rendered
view (human evidence). Hash the normalized dataset, not raw HTML. These
archived snapshots are also the primary-source evidence that travels
with distributed Work Products (Section 4).

## 7.3 Search orchestration and de-duplication

Search is a thin orchestrator over independent, optional per-source
adapters, each emitting the common record shape with provenance, source
identity, recency, and trust. De-duplicate on canonical identity
(normalized URL + content hash + (source, native-id)), always preserving
every provenance trail. Rank transparently by trust, authority, and
recency.

## 7.4 Change detection

Per source type: SHA-256 plus extracted-text/table diff for static
documents; keyed field-level diff with numeric tolerances for structured
data; content-extracted text diff for web pages; presence comparison
with redirect-matching and a confirmation window for removals.
Canonicalize before comparing; preserve both versions as evidence on
every change. A detected change or removal sets the Information object's
source status and propagates a re-evaluation flag to every citing object
(the cascade of Section 3, specified in the State Rules spec).

## 7.5 Problems as a graph

Problems (contradictions and discrepancies) are dual-sourced: found by
the analysis agent's scan and by people during browsing. Each new
Problem carries its provenance and is cross-compared against all known
Problems to find connections and relationships, forming a graph that the
UX must convey. Related clusters are analytically meaningful and are the
natural unit that gets elevated into a Project. The
relationship/clustering is agent-proposed and human-decided: the agent
surfaces candidate connections; a human confirms, severs, or adds them.

Triage dispositions are elevate, defer, or dismiss. Dismissal (often
'outside our wheelhouse') greys or hides a Problem but does not delete
it; it remains reversible and preserved. All Problems, dismissed or not,
receive recheck triggers, making the whole graph self-correcting over
time.

**Decision.** Problems are dual-sourced (agent + human), related into a
graph the UX conveys, with clustering agent-proposed and human-decided.
Dispositions are elevate/defer/dismiss; dismissal is reversible greying,
not deletion; all Problems carry recheck triggers. Clusters are the
usual unit elevated into Projects.

## 7.6 The gathering contract (added v10)

The gathering request is the unit of named standing intent (Intake
Doctrine Section 4 governs its authority; State Rules v1.5 and check
C-18.5 govern its grammar). Three semantics were settled by production
practice and are binding on every planter and every consumer:

-   **Locators are ordered fallbacks for one document, never a fan-out
    > list.** A request names exactly one target document; its locators
    > array is the ordered set of addresses at which that one document
    > may be found, tried in order until one yields. The lesson is
    > recorded in the store: a four-locator request delivered exactly
    > one of its four intended attachment listings, because the daemon
    > correctly stopped at the first success.

-   **Fan-out is one request per document.** Capturing N documents means
    > planting N requests, each with its own id, target, and locator
    > chain. This is what makes request status meaningful (captured
    > means the document is in the store), keeps the register's origin
    > edges one-to-one, and lets the due slate name what is actually
    > outstanding.

-   **Unknown cadence values default to monthly.** The cadence
    > vocabulary is closed (C-18.5); a value outside it is a grammar
    > finding, but a daemon encountering one in a degraded or
    > transitional store treats it as monthly, the most conservative
    > recheck posture, rather than refusing the request or polling
    > aggressively.

**Decision.** One document per gathering request; locators are ordered
fallbacks; fan-out is one request per document; unknown cadence defaults
to monthly.

## 7.7 Attestation in production (added v10)

The Intake Doctrine (Section 3) defines capture grades and requires the
mechanical co-attestations of the fetch layer; this section records how
they run in the deployed system, from the July 19 live fire and every
capture since.

Co-archive requests run against Internet Archive Save Page Now in
anonymous mode (the SPN2 S3 key pair is a standing Tier B operator item;
anonymous mode is working and recorded per capture, with the http 302
confirmation and the archive locator entering the register). Trusted
timestamps are RFC 3161: timestamp.digicert.com is the configured
primary and has failed silently from the Apps Script runtime on every
attempt; the freetsa.org fallback engages and carries every token issued
to date, with the failure recorded per capture in attestation_attempts.
This concentration in a single fallback authority is a recorded exposure
to watch, and the CA caveat stands: freetsa's certificate chain is
community-operated, so a token from it proves existence-at-instant to
anyone who accepts that chain, and the register records which authority
issued each token rather than implying uniformity. Tokens are stored
base64-wrapped (.tsr.b64) because the write path is a UTF-8 byte pipe.

**The coming M3' asymmetry.** Member-submitted documents that no locator
can fetch (documents in hand, interactive-state exports, email-delivered
records) can carry a trusted timestamp over their capture hash but no
co-archive, because there is nothing public for an archive to fetch. The
register records this honestly as the asymmetry it is: chain-of-custody
attestation per Doctrine Section 3a substitutes for the co-archive on
the capture-chain axis, and the M3' member-submission machinery must
record attestation_attempts with the same honesty the daemon practices.

**Decision.** Co-attestation in production is SPN anonymous plus RFC
3161 with the freetsa fallback carrying all tokens and digicert failures
recorded per capture; the single-authority concentration is a watch
item; member-submitted unfetchable documents carry timestamps and
custody attestation without co-archives, recorded as such.

# 8. UX architecture

**Client.** A static, local-first Progressive Web App. No central server
to operate; mirrorable from static files; no headquarters and no central
datastore to breach or subpoena.

## 8.1 Surfaces and journeys

Two levels. The seven categories from the Roadmap (Context, Search, New
Developments, Monitoring, Communications, Projects, Settings) are
navigation surfaces. Journeys are task flows that thread through those
surfaces and move objects along the pipeline. The journeys identified so
far:

  ---------------------------------------------------------------------------
  **Journey**       **Layer**         **Produces**        **Lives in**
  ----------------- ----------------- ------------------- -------------------
  System & user     Kernel/config     a configured        Settings
  setup                               instance + policies 

  Information       Information       Information         Search + Monitoring
  gathering request                   bundles + standing  
  mgmt                                policies            

  Information       Information       (consumes; spawns   Context
  browsing                            annotations &       
                                      requests)           

  Conflict &        Analysis          Problems (+         New Developments +
  discrepancy                         issue-type config)  triage board
  filtering                                               

  Problem browsing  Analysis          triaged Problems    Triage board +
  & routing                           routed to Projects  Projects

  Project setup &   Analysis          matured Project +   Projects
  processing                          Work Product        

  Action setup      Action            Actions             Projects to Action

  Action management Action            plans, comms,       Projects/Action +
                                      calendaring, ... +  Communications
                                      Work Products       

  Work product      Analysis/Action   published Work      Distribution
  distribution                        Products            surface + directory
                                      (in/internal/out)   

  Workflow overview Cross-layer       (consumes; the      Overview (home)
                                      derived index)      
  ---------------------------------------------------------------------------

**Cross-cutting experiences.** Two run through all journeys rather than
beside them. Annotation/review is anchored async human judgment on any
object. Consistency-and-repair is the checker surfacing inconsistencies
and a constrained set of legal repairs; it is a sidebar, available
across surfaces, not a destination.

## 8.2 Key surface notes

-   Overview is home: a curated inventory of everything --- information,
    > problems, projects, actions, and work products (incoming,
    > internal, outgoing) --- and the user-facing view of the per-group
    > derived index.

-   Information browsing is not inert: it is the natural launch point
    > for dropping an annotation and for spawning new gathering requests
    > or monitors.

-   Conflict filtering is scope-greying, not a scan: the surface shows
    > the full Problem list with out-of-scope or dismissed items greyed
    > or hidden, and conveys the relationship graph among them.

-   Project processing includes focusing as a first-class act: turning a
    > matured Project into a Work Product (agent drafts, human refines,
    > evaluation validates) is an explicit step, not a side effect.

-   Distribution is its own surface: choosing internal vs. external
    > audience, applying the strictness bar and (externally) the risk
    > tier, rendering the layered brief, and submitting to the
    > directory.

-   Clocks belong to Actions: an Action's timeline scales from a single
    > statutory date (a CPRA request's deadline) to a multi-stage
    > schedule with dependencies (a civil suit). Every date-bearing
    > clock entry carries the statute, order, or commitment it derives
    > from. The Monitoring skill watches them; New Developments and the
    > Overview surface what is approaching or overdue.

## 8.3 Configurable extension surfaces

Extensibility is a stable kernel plus composable extension surfaces. The
kernel is invariant (values, principles, publishing standard, bundle
schema, escalation protocol, the seven-category shell). An extension is
a triple: a skill (produces or consumes an artifact type via the bundle
skill), a client surface component, and a bundle artifact type. Surfaces
come in three kinds: outbound/rendering (slide decks, spreadsheets,
exports), inbound/response-generating (surveys, forms, email campaigns
--- heavier, with a backend and an attack surface), and internal
task-specific (a Problem-triage board, a Project workspace, a
negotiation tracker). Per-layer extensibility: the Information layer is
fully configurable in what it collects and monitors; the Analysis layer
is intent-driven (a group expresses interests, objectives, and
requirements and the system shapes its process and products); the Action
layer is the broadest suite. Two tensions resolve cleanly: keep the
kernel uniform and make the surface where groups differ (R2 vs. R15);
keep the core client static and serverless and treat every
external-surface integration as optional, per-group, and replaceable
(R9/R14). External response-generating surfaces are seam-now,
build-later.

**Decision.** UX is a static local-first PWA with seven navigation
surfaces and a set of journeys that thread through them. Overview is
home and the per-group index view; clocks live on Actions;
consistency-and-repair is a sidebar; distribution is its own surface;
focusing is a first-class act. Extensibility is an invariant kernel plus
{skill, surface, artifact type} extensions in three kinds, with external
integrations always optional, per-group, and replaceable.

## 8.4 The Phase 1 client, as built (added v9)

The Phase 1 PWA shipped all six ladder rungs (client 0.6.2; the decision
record is bio-bundle/client/CLIENT.md, which this section ratifies).
Three architectural decisions:

-   **Repo shape.** The client lives at bio-bundle/client/, a sibling of
    > checks/ and accelerator/, importing bio-checks source directly by
    > relative path. No copied checks artifact exists anywhere: a copy
    > is a second codebase the moment the original moves, and the client
    > scan must byte-match the gate, so the one-check-codebase law
    > decided this. VERSIONS.json carries a client entry asserted by
    > check-versions.

-   **Local schema.** Two Dexie tables, decided against actual consumers
    > rather than speculation: bundles (primary key id, indexed by root)
    > holds the parsed render model; files (compound key bundleId plus
    > path) holds the byte-faithful string mirror, whose one indexed
    > read reconstructs exactly the file map the gate's collector feeds
    > checkBundle, so the browser scan and the node gate consume
    > identical input. The store stays authoritative; both tables
    > rebuild from ingest at any time and the app tolerates their
    > absence.

-   **Hosting.** Netlify, from the three acceptable static hosts of
    > Section 9, chosen for lowest operator friction; the build uses a
    > relative base so the bundle is statically hostable and mirrorable
    > from any path. Freely reversible; nothing downstream depends on
    > it.

As built, the client carries: folder and zip ingestion; the docket and
bundle detail; the consistency sidebar running checkBundle itself
through three adapters (WebCrypto hashing, a Set-based reference
resolver, character-identical report formatting); the live mirror over
the Section 10.4 endpoint slate with client-side hash verification that
aborts loudly on mismatch; the gated Editor, whose Submit enables only
on a local gate PASS and whose Edit is offered only on a docket freshly
synced from the live endpoint (demo, local, and mirror-restored stores
are read-only by construction); the client promoter, byte-identical to
the reference implementation and carrying the I-17 divergence ladder;
and local index regeneration with substrate locators honestly null,
since the browser never touches Drive.

**Decision.** The Phase 1 client's three architectural choices, in-repo
placement importing bio-checks by relative path, the two-table mirror
schema reconstructing the gate's exact input, and Netlify hosting, are
ratified as recorded in CLIENT.md. The client is a caller class of the
Section 10.4 registry and a packaging-mode writer under the Design
document's write protocol; it holds no Drive credential and nothing in
it is load-bearing to kernel correctness.

# 9. Technology stack

The same SKILL.md runs unchanged across the interactive surfaces (Chat,
Cowork, Claude Code) and the headless Agent SDK, loaded on demand from
the filesystem, so the methodology is portable and mode-agnostic and the
code surface is thin. The calls, optimized for bus-factor:

  -----------------------------------------------------------------------
  **Layer**                           **Choice**
  ----------------------------------- -----------------------------------
  Methodology                         Markdown skills (+ Python/bash
                                      helper scripts), versioned in git,
                                      composed by a build step into
                                      per-mode consolidations, authored
                                      with the Skill Creator. The bulk of
                                      the system's logic.

  Client / UX                         React + Vite, as a static PWA.
                                      Largest talent pool and longevity
                                      (lowest bus-factor) and the deepest
                                      component ecosystem for the broad
                                      action-layer suite. Vite, not a
                                      meta-framework, to stay purely
                                      client-side and serverless. Local
                                      data in IndexedDB (via Dexie) to
                                      start.

  Agent orchestration                 The Claude Agent SDK in TypeScript
                                      --- one primary language across
                                      client and agent glue. It loads the
                                      same skills the interactive
                                      surfaces use.

  Data / extraction                   Python, scoped to the information
                                      layer's document/data extraction,
                                      run as in-sandbox tool-scripts a
                                      skill invokes. The agent shells out
                                      to Python; it is not written in
                                      Python.

  Integrity checks                    Plain JavaScript (ES modules,
                                      JSDoc-typed, zero dependencies, no
                                      build step): one check codebase run
                                      identically at the write gate
                                      (node) and in the client scan
                                      (browser import). Decided in Bundle
                                      Skill Composite Design Section 9.

  Bundle substrate                    Google Drive folders
                                      (multi-format), with git or OSF as
                                      mirror/resilience alternates. Not
                                      Google Sheets, and not Sheets as
                                      any central surface. Substrate
                                      locators never link objects
                                      (Section 3).

  Hosting / ops                       A static host (Cloudflare Pages,
                                      Netlify, or GitHub Pages), git for
                                      versioning and the mirrorable
                                      directory, and a skill-assembler.

  Constrained endpoints               Google Apps Script, per group,
                                      under Section 10.4's admission
                                      criteria only. Off-kernel, never
                                      load-bearing.

  Backend                             None. Constrained endpoints are not
                                      a backend (Section 10.4); the
                                      no-backend boundary stands until
                                      the deferred external surfaces
                                      arrive, and then optional,
                                      per-group, and replaceable.
  -----------------------------------------------------------------------

**Decision.** TypeScript for what the app does (React + Vite client,
TypeScript Agent SDK), Python for what touches data, Markdown for what
the AI does, dependency-free JavaScript for what must run identically
everywhere for years. Drive folders as the bundle substrate; static
hosting; git; constrained Apps Script endpoints under the Section 10.4
discipline; no backend.

# 10. Decentralized continuity, integrity, and resource discipline

Summarized here; specified in full in BIO_State_Rules_Consistency.

## 10.1 Continuity without a server

Enforcement lives in exactly two places: the bundle skill at write time
(the sole writer; it validates and performs convergent promotion), and a
client-side consistency checker at scan time (the per-group
React/IndexedDB client). The bundle frontmatter is the authoritative
state; any 'ledger' is a per-group, regenerable index derived from that
group's own bundles, never central and never a source of truth. The
server-side watcher/validator/promotion of the prior project splits
cleanly: promotion folds into the skill's write-back and the
pending-package queue drained by any capable actor, and the client takes
the scanning role.

## 10.2 Integrity rules

-   Accretive store: deletion is exceptional, reason-gated, preserved in
    > history, and cascades to dependent Work Products for
    > re-evaluation.

-   Source-grounding: a distributed Work Product carries archived,
    > hashed, timestamped primary-source evidence, sufficient for a
    > recipient to verify each claim against that evidence and check the
    > synthesis.

-   No transitive trust: a group always runs its own Argument Evaluation
    > on incoming Work Products; trust is re-established locally at
    > every hop and attaches as a trust signal.

**Consistency checker and constrained repair.** The checker plus a
constrained set of legal repair actions is the enforcement mechanism for
the state rules. Each invariant violation maps to a small, well-defined
set of sanctioned repairs; a non-technical, distributed audience never
free-edits the store but picks from valid repairs, which is how illegal
states stay unreachable with no server policing them. The invariant set
and the violation-to-repair mapping are specified in the State Rules
spec.

**The Mechanical Verification Law (adopted July 2026).** Production
experience on the prior project established that a correct prose
contract does not reliably produce conforming output; only a mechanical
check run against the written artifact does. Therefore every invariant
carries an executable check; the bundle skill runs the applicable check
set against written files after every write and delivers nothing on
failure; the client-side checker runs the same check implementations at
scan time. One check codebase, two call sites; divergence between gate
and checker is itself a defect. Checks are versioned with the per-type
schema stamps, so old bundles keep validating against the version they
declare and schema migration is an explicit, history-preserving rewrite.

## 10.3 Resource and token discipline

No session ever loads 'all of these skills.' The levers, in priority
order (avoid the wall first; checkpointing is the net):

-   A thin dispatcher loads the minimal set for the goal: the dispatch
    > spine, the one analytical skill, and the one bundle-type schema.

-   Progressive disclosure everywhere: tiny always-on bodies; references
    > loaded only when triggered.

-   Per-mode lean derivatives: agents run a stripped, token-budgeted
    > derivative; interactive sessions can afford the fuller skill.

-   Preselection/triage: a cheap first pass chooses which detectors or
    > lenses this job needs.

-   On-disk working copy plus range reads: keep the bundle on disk and
    > read only the section in play.

-   Bounded passes that hand off through the bundle: decompose a long
    > job into passes, each ending cleanly and writing a lean next-pass
    > brief.

**Compaction resilience.** The defense against fidelity loss is keeping
the authoritative artifact out of the volatile context. Because the
bundle is the on-disk source of truth and the skill edits it in place,
compaction costs conversational continuity (recoverable on the next
read), not analytical fidelity. The whole discipline is parameterized by
the moving capability cap.

## 10.4 Constrained endpoints (added v5)

Since the design assumes Google Drive as the default substrate, Google
Apps Script is always available alongside it: server-side execution
hosted by Google, no machine to operate, with full Drive capability
including the update, rename, and move operations the chat-mode Drive
connector lacks. This subsection recognizes that capability as an
architectural class, available throughout the workflow, and binds it so
it can never erode into a backend.

**The defining property: store-authoritative invocation.** A constrained
endpoint takes no authoritative input from its caller. Everything it
acts on comes from the store (gate-passed packages, monitoring
definitions in frontmatter, source locators inside verified Information
objects, standing policies) or from external sources the store names.
Caller-supplied parameters are limited to selectors (which bundle, which
queue), validated against the store and non-authoritative: a wrong or
malicious selector produces a no-op or legitimate work on a different
target. The invocation is a doorbell, not a delivery: nothing enters
through the call that was not already inside, already validated, already
sanctioned as standing intent. Corruption by invocation is therefore
structurally impossible; an adversary who obtains an endpoint URL can
trigger work that was going to happen anyway or waste quota, and nothing
else. This is the R13 answer to the fact that a web-app URL is
effectively a capability token.

**Admission criteria.** An endpoint is admitted to the registry only if
all of the following hold:

-   **Store-authoritative inputs.** No content, no commands, no
    > caller-supplied value that becomes state. Inputs come from the
    > store or from external sources the store names.

-   **Standing intent only.** The endpoint executes work already
    > sanctioned by store state (a gate-passed package, a due monitor, a
    > confirmed policy); it never originates intent.

-   **Idempotent and convergent.** Racing invocations, replays, and spam
    > converge to the same store state; the worst outcome is wasted
    > quota or budget.

-   **Validated output path.** Everything the endpoint writes passes
    > through the same integrity machinery as any write: deterministic
    > naming, hashes, gate/checker validation, history preservation.

-   **Non-load-bearing.** Every endpoint operation is also performable
    > by a capable actor (the client or an agentic session); kernel
    > correctness never requires the endpoint; a dead endpoint degrades
    > to the kernel guarantee, and the checker's findings persist
    > regardless.

-   **Registry membership.** Endpoints form a closed, versioned
    > registry, each individually specified and admitted against these
    > criteria, the same closed-vocabulary discipline the spec applies
    > to relationship kinds. A general dispatch, eval, or RPC endpoint
    > is permanently prohibited; the moment an endpoint ingests content
    > or executes arbitrary operations it is a backend, and the
    > no-backend boundary applies.

**Deployment posture and invocation tokens (revised v6, extended v8).**
Endpoints are per-group Apps Script web apps and/or time-driven
triggers, deployed from starter-kit source in a guided setup step.
Web-app access is deployed as "anyone," because AI-accessibility is the
point: chat and agentic sessions invoke by plain URL fetch and cannot
perform Google sign-in. Layered on top is a lightweight bearer-token
discipline, honestly scoped: the token is a quota-and-attribution
mechanism, never a security boundary, because integrity rests entirely
on store-authoritative semantics and cannot be strengthened by
identifying callers. Access control is a second lock on a door that only
opens inward; the token guards the group's quota and names the
doorbell-ringer, nothing more.

-   **Token mechanics.** Each group generates random per-caller-class
    > tokens at setup (client, chat session, agentic session,
    > accelerator-internal). The endpoint verifies with a single string
    > comparison against Script Properties and rejects non-matching
    > calls before performing any work. Per-member tokens are
    > deliberately not used; the group shares its infrastructure, and
    > class-level attribution answers the questions that matter at
    > trivial management cost.

-   **Strict, not lazy.** Verification happens before work, not after:
    > the check is free while the work costs quota, so verify-then-work
    > is both the cheaper order and the point. Strict rejection is
    > always safe because endpoints are non-load-bearing: a wrongly
    > rejected legitimate caller loses seconds of latency, never
    > correctness, since the kernel guarantee (the next capable actor,
    > plus staleness findings) stands regardless.

-   **No replay defense.** Nonces, timestamps, and request signatures
    > are deliberately omitted: every admitted operation is idempotent
    > and convergent, so a replayed invocation is a no-op by
    > construction. Complexity is not spent defending against an attack
    > that cannot exist.

-   **Secrecy class and rotation.** Tokens travel as GET parameters and
    > share the URL's secrecy class; both can surface in logs and shared
    > prompts. The token's operational value over the URL alone is
    > rotation: a token rotates by editing Script Properties and
    > redistributing caller config, without redeploying the web app and
    > breaking its URL. Rotate both on suspected leak; stakes stay low
    > because the worst unauthorized outcome remains triggering
    > legitimate work or burning quota.

-   **Tokens never live in the store.** The store is designed to be
    > mirrored, forked, and distributed; a secret written into it is a
    > secret published. Tokens live in Script Properties server-side and
    > in each caller's local configuration (client settings, project
    > knowledge, skill package config) caller-side.

-   **Invocation log.** The endpoint appends every call (timestamp,
    > caller class or "invalid," operation, outcome) to an append-only
    > operational log outside the store's integrity guarantees
    > (non-authoritative, size-rotated, alongside the index). The
    > checker surfaces anomalies, invalid-token bursts and unfamiliar
    > patterns, as findings: under Operational Principle 8, probing
    > pressure is evidence, and the log is where it gets documented,
    > turning the endpoint's exposure into a sensor.

-   **URL capture (added v8).** The editor's getService().getUrl()
    > returns the head /dev URL, sign-in walled and unusable by AI
    > callers. Setup resolves the published /exec URL by strict
    > precedence: an explicit proxy URL, then the WEBAPP_EXEC_URL script
    > property set once from Manage deployments, then the service URL
    > only when it already ends in /exec. A /dev URL is never written
    > into any caller credential block, and republishing is a new
    > version on the existing deployment, which keeps the URL stable.

-   **Browser reachability (added v8).** /exec responses carry
    > Access-Control-Allow-Origin: \* on both the redirect and final
    > hops, so simple cross-origin GETs work natively from any browser
    > origin; preflighted requests fail on a 405 OPTIONS response.
    > Callers stay within simple-request rules: plain fetch, every
    > parameter in the query string, no custom headers. Verified in a
    > live browser on July 11, and live-verified in use during the Phase
    > 1 deployment trip (July 17-18): the client's sync, package writes,
    > and reindex all ride native /exec CORS within simple-request
    > rules. This constrains the PWA client invocation shape and covers
    > the CORS role once assigned to the discarded proxy worker.

Endpoint code follows the axiomatic-component discipline: versioned with
the components that share its algorithms, rebuilt together with them.

**The registry (updated v10).** Admitted and deployed, ten operations,
each live-fire verified against the deployed CivicOS accelerator: (1)
the promotion endpoint, which drains the pending-package queue via the
convergent promotion algorithm (Bundle Skill Composite Design, Product
D); (2) the status operation, read-only, returning script version,
configured state, trigger installation, and pending-queue depth, bounded
to information any group member may see, extended during the M4
live-fire postmortem with an optional bundle selector returning a
locate-only probe (roots seen, read-side and write-side resolution
results, no write verbs); (3) the selftest operation, which packages and
promotes one update in the single designated scratch bundle
INFO-2026-0098-accelerator-selftest entirely from server-side standing
intent and hash-verifies its own result, bounded to that one bundle; (4)
list, which enumerates bundle IDs grouped by type root, or one bundle's
file listing as relative path, size, and modified time, cheap metadata
only, no content reads and no server-side hashing, read-only by
construction with selectors validated against the ID grammar and listing
rooted inside the type roots so the credential sibling folder is
unreachable; (5) read, which returns one store file's content as a plain
UTF-8 JSON string with its sha256 and an encoding field, a deliberate
divergence from the dev companion's base64 shape because the store is
text-only by construction and base64 inflates the compressed wire by
roughly half while breaking symmetry with the text/plain write path;
read serves live files, \_history, and pending files alike, since the
client checker needs pending visibility and read exposure of pending
content is no wider than of live content; the admission records honestly
that a leaked client token grants read access to the store, acceptable
only because the store is designed to mirror, fork, and distribute and
the two-tier secret rule of Section 10.5 keeps every secret out of it;
(6) write-package, the client-to-queue transport: one text/plain POST
per file with selectors in the query string, package files first and
PENDING_PROMOTION.json strictly last, mirroring the commit-point write
order so a partial delivery is an inert set of .pending files surfaced
as orphaned-pending findings; the load-bearing constraint is that the
endpoint accepts writes to pending paths only (names ending .pending
plus the literal manifest name, inside the selected bundle) and rejects
every other path naming the constraint, which preserves promotion as the
sole writer of live state; the endpoint parses nothing and judges
nothing, a byte pipe to a constrained path; amended at accelerator
0.10.2 with member creation-by-packaging
(endpoint-admission-m2b-member-creation.md, live-fire verified July 19,
2026 through the first production Problem and Project bundles):
writePendingText creates an absent bundle folder under its type root for
pending-path writes, with the id grammar holding at the POST boundary,
nothing going live without gating and promotion, orphans remaining
C-16.4 findings, and a threat delta of nil, since a leaked write token
trades queue litter for folder litter, the same cleanup class; (7)
reindex, which regenerates index/index.json by scan with zero caller
inputs, the store-authoritative criterion in its strongest form, its
writer confined by construction to exactly that one path and its output
deterministic at fixed time so racing invocations converge
byte-identically; (8) monitor-tick, which runs the Section 7.4
change-detection duties on due gathering requests and monitored bundles
as a mechanical writer under the Section 10.8 claim discipline:
first-capture creation at collected with the intake register, ring-once
hash dedup as corroboration, change detection under the declared field
set with an accretive register entry and change record, the one-hop
set-but-never-clear cascade, the 72-hour removal confirmation window,
and the Section 7.7 co-attestations, admitted per the ratified daemon
slate (endpoint-admission-m2-daemon-slate.md) and live-fire verified in
production July 19, 2026, including the unattended completion of the
Legistar chain after session close; (9) sweep, built to its admission
and deployed inert at budget zero with no ratified sweeps, its recorded
no-op live-fire verified the same day, creation-only at collected behind
the ratification fence when a sweep is ever ratified; and (10)
deadline-recheck (duescan), whose clock pending-to-overdue flip is the
single legal mutation and whose due slate was live-fire verified against
the open gathering requests. Operations 4 through 6 were ratified from
the client caller-class admission slate and operation 7 from the reindex
admission draft, both superseded by the v9 folding; operations 8 through
10 were ratified from the M2' daemon slate as amended at operator
review, superseded by this folding. Live-fire record: promotion, status,
and selftest on July 10-11, 2026; list, read, write-package, and reindex
through the Phase 1 deployment trip of July 17-18, 2026; monitor-tick,
sweep, deadline-recheck, and creation-by-packaging through the July 19,
2026 production live fire at accelerator 0.10.0 through 0.10.2, whose
findings are recorded in Sections 10.7 through 10.9. The registry is
enforced as a closed whitelist checked before dispatch; an unknown
operation is rejected naming the valid set. The development-only
companion (promotion-service-dev.gs) remains recorded as explicitly
non-production and outside the registry, dead-man expired after
2026-08-31, deleted before production deployment, with devMode false
verified in production. Candidates: batched multi-file read and
read-class log batching keep their recorded trigger conditions from v9
(admitted only if measured sync latency or per-call log cost at
production volume demands them; until a trigger fires, each stands as a
recorded decision not to admit). Candidate class requiring extra
admissions: headless dispatch (reads a standing goal from the store and
initiates a budgeted headless session); it additionally requires a
budget guard recorded in store policy and inherits the permitted-use
open question of Section 12, and until it resolves, unattended discovery
beyond store-named sources stays out of scope.

**OAuth deployment discipline (added v10).** A paste alone never widens
the project's OAuth grant, and the first revision to call a new Google
service will refuse at runtime with a healthy-looking deployment. The
discipline, learned in the July 19 live fire and recorded operationally
in DEPLOY-P2M2.md Section 2a, which this document incorporates by
reference: pin the full scope inventory explicitly in the
appsscript.json manifest rather than trusting auto-detection to
re-prompt; when no consent dialog appears after a manifest change, the
stored grant is stale-broken and must be revoked at the account's
connections page and re-granted, which touches neither code, deployment,
URL, nor token; and diagnostic probe functions must not end in an
underscore, which the editor's Run dropdown hides. The slate's failure
posture is part of the architecture: an unauthorized fetch layer refuses
per locator, records the refusals honestly, writes nothing, and leaves
the due condition standing, so authorization failure is visible and
recoverable rather than silent.

**Decision.** Constrained endpoints are a recognized capability class:
per-group Apps Script endpoints under store-authoritative invocation
semantics, admitted individually through a closed registry against six
criteria, always off-kernel and never load-bearing. Deployment is
"anyone" access for AI invocability, layered with strict-checked
per-caller-class bearer tokens scoped to quota defense and attribution,
with no replay machinery (idempotence makes it unnecessary), tokens kept
out of the mirrorable store, and a logged invocation trail whose
anomalies the checker surfaces as evidence. They overcome connector
capability limits wherever the workflow needs server-side file mechanics
or scheduled mechanical work, without reopening the server question; a
general RPC layer remains prohibited.

**Decision (Section 10 overall).** No server: enforcement is the bundle
skill at write and a client-side consistency checker at scan;
frontmatter is authoritative; the ledger is a per-group derived index.
Integrity rests on accretive storage with cascading deletion,
source-grounding, and no transitive trust. Each invariant violation maps
to a constrained set of legal repairs, and every invariant carries an
executable check run identically at the write gate and the scan (the
Mechanical Verification Law). Constrained endpoints extend capability
under Section 10.4's discipline without becoming a backend. Token
discipline is first-class, with the on-disk bundle providing compaction
resilience and checkpointing as the net.

## 10.5 Secret management (added v7)

Secrets divide into two tiers by the stakes of their exposure, and each
tier has a different interface.

**Tier A, capability strings.** The per-caller-class endpoint tokens
(Section 10.4) are capability strings that an AI session must be able to
present, so they are deliberately visible where a session runs: the chat
token lives in the claude.ai project knowledge, the agentic token in the
skill package config. This visibility is acceptable, and only
acceptable, because store-authoritative invocation semantics make the
tokens quota-and-attribution markers rather than integrity boundaries:
the worst outcome of a leaked Tier A token is quota burn or the
triggering of promotions that were going to happen regardless. Tier A
tokens are generated server-side at setup (no human types them, no AI
composes them), stored in Script Properties and in caller-side config
that lives outside the mirrorable store, and rotated per class without
changing any URL.

**Tier B, true secrets.** Anything whose exposure carries real stakes,
future third-party API keys, credentials for communication surfaces, any
authorization that could act in the world, is a Tier B secret. Tier B
secrets are resolved by name, server-side, inside a constrained endpoint
at execution time, and never otherwise. They appear in no system code,
in no part of the store (which mirrors and forks), and in no AI-visible
config. A session composes a call that carries the name of the secret it
needs, never the value; the endpoint reads the value from Script
Properties, uses it, and returns only the result. This keeps the entire
class of true secrets on the far side of the same store-authoritative
boundary that makes the endpoints safe: the AI directs work without ever
holding the means to do harm with it.

The two tiers share one rule: no secret of either tier is ever written
into the store. The store is the thing that replicates; a secret placed
in it is a published secret. The accelerator's four promotion tokens are
the only secrets the system owns today; the Tier B interface is the
standing contract for every credential the deferred surfaces will
introduce.

**Decision.** Two secret tiers. Tier A capability strings are AI-visible
by design, generated server-side, kept out of the store, safe because
the endpoints they open are non-load-bearing. Tier B true secrets are
name-resolved inside constrained endpoints at execution time and are
never visible to code, store, or AI. Neither tier is ever stored in the
replicating substrate.

## 10.6 Tree version coherence (added v9)

Adopted July 11, 2026 (bio-bundle rev 0.1.16), after a fresh-session
audit found every mechanically asserted version stamp in the tree true
and every prose-only stamp drifted. VERSIONS.json at the repo root is
the single source of truth for every machine-stamped version: the
composite (which is also the repo revision; the two namespaces merged at
0.1.16), bio-checks, the accelerator, and the client. The assembler
reads the composite from the file, and a check-versions pass, run
standalone and automatically before every build and verification,
asserts that every echo of a version number elsewhere in the tree agrees
with it. A session that changes any component bumps the composite,
rebuilds affected products, and leaves check-versions green.

Design documents are explicitly not governed by this numbering. The
specifications and this document version independently on their own
editorial cadence; VERSIONS.json merely records which document versions
the tree was built to conform to, so the checker can catch stale prose
references. Ratifying a new document version is a documentation act
first; the record updates when the tree is actually brought into
conformance with it. Prose claims about code contents remain outside
mechanical reach; the standing mitigation is citing artifacts rather
than characterizing them.

**Decision.** VERSIONS.json is the tree's single version authority,
mechanically asserted on every build; the composite number is the repo
revision; design documents version independently and are recorded for
conformance reference only. This is the Mechanical Verification Law
applied to the tree's own metadata.

## 10.7 The interruption model (added v10)

The Apps Script platform can terminate an execution mid-routine at its
six-minute wall or otherwise, with no catch and no finally running.
Every off-kernel component therefore treats interruption as an ordinary
event and relies on write ordering, never on end-of-routine cleanup.
Four rules, all validated live and unscripted on July 19, 2026, when the
doorbell tick hit the wall after packaging two of four captures and the
system recovered without loss or duplication:

-   **Manifest-last is the durable marker.** Package files are written
    > first and PENDING_PROMOTION.json strictly last, so an incomplete
    > package is an inert set of .pending files with no manifest,
    > invisible to promotion and surfaced by C-16.4 as orphaned pending.
    > A complete package sits durably in the queue across any
    > interruption; the killed doorbell's two complete packages were
    > promoted by the queue sweep and the concurrent trigger completed
    > the remaining requests without duplicating in-flight work. An
    > interrupted creation is completed at the same id rather than
    > duplicated.

-   **Cascade before change.** The cascade's re-evaluation packages are
    > written before the changed bundle's capture record, so an
    > interruption between them causes the next tick to re-detect the
    > change and re-run the idempotent cascade rather than lose it.
    > Set-but-never-clear cascade flags make the re-run harmless.

-   **Self-expiring claims.** Advisory claims (the promoter's and the
    > daemon's) carry their timestamps and expire at 7 minutes against
    > the 6-minute wall, so a claim held by a killed execution releases
    > itself; stale claims are C-16.5 findings whose repair is deletion.
    > No claim depends on its holder surviving to release it.

-   **Recovery is inflight completion.** The recovery path after any
    > interruption is the same path as normal operation: the queue sweep
    > promotes complete packages, the next tick re-detects outstanding
    > conditions, and yielded operations (an execution that lost the
    > claim race) record the yield honestly and let the trigger retry.
    > Nothing needs a repair mode; the durable handoff is the pending
    > queue itself.

**Decision.** Off-kernel components assume platform termination at any
instant: manifest-last durability, cascade-before-change ordering,
self-expiring claims, and recovery by ordinary inflight completion, with
no reliance on catch or finally. Validated in production.

## 10.8 Daemon concurrency (added v10)

Concurrent executions are normal: the 5-minute trigger, doorbell
invocations, and the queue sweep overlap freely. Two decisions govern.

**Creation-capable operations are claim-serialized.** An overlapping
doorbell and trigger double-created bundles for dynamic-content locators
in the July 19 live fire; since accelerator 0.10.1, every
creation-capable operation first acquires a self-expiring daemon claim
inside a brief LockService critical section. The losing execution
records a yielded no-op and the trigger retries; the claim expires per
Section 10.7 if its holder is killed. Read-only operations are never
serialized.

**Sequence uniqueness is deliberately not an invariant.** Drive offers
no atomic counter, so two executions indexing the store mid-flight can
allocate the same sequence number; the full bundle id (type, year,
sequence, slug) is the identity, the sequence is a hint, and no
invariant claims sequence uniqueness. The production store carries the
worked example: two deliberate collision pairs (sequence 0100 from the
launch race, sequence 0106 from the pre-0.10.1 concurrency window),
different slugs, different folder names, no collision in identity, all
four bundles gated and promoted. Claim serialization has since made
recurrence unlikely; the tolerance remains the rule because the
substrate cannot promise more.

**Decision.** Creation-capable daemon operations serialize on a
self-expiring claim acquired under LockService; sequence uniqueness is a
non-invariant by design, with the full id as the identity and the two
recorded collision pairs standing as the worked example.

## 10.9 Index integrity: fail-closed (added v10)

The index is derived, regenerable, and never authoritative (Section
10.4, reindex), but the daemon's dedup guards read it, and a silently
degraded index turns those guards into no-ops: a transient register-read
failure in the July 19 live fire let a trigger tick re-create a
byte-identical capture. Since accelerator 0.10.1, index construction
distinguishes missing from failure: the adapter returns null for genuine
absence and throws for transient failure, and a missing-shaped throw is
treated as absence. A construction that counts any genuine failure
produces a degraded index, and a degraded index fails closed: no
creations, sweep deferred, the failure recorded on the tick result, and
the due condition left standing for the next healthy tick. Absence is
information; failure is not permission.

**Decision.** Index reads distinguish absence from failure; a degraded
index halts creation-capable work and records itself rather than
degrading the dedup guards silently. Fail-closed, validated by battery
(fail-closed and claim-semantics sections, daemon-conformance).

## 10.10 The manifest contract (added v10)

Three manifest semantics were settled by production practice; State
Rules v1.5 carries their mechanical anatomy, and this section records
them as architecture.

-   **created is real UTC.** The manifest's created field carries the
    > actual UTC instant of the write, never a session-declared or
    > backdated stamp. The daemon's honest timestamps exposed backdated
    > session stamps in the first live-fire day; two early promotion
    > keys carry them, recorded as cosmetic and unrepairable without
    > history rewrite, and the real-UTC rule prevents recurrence.

-   **author names the deciding member on authority-bearing writes.**
    > Mechanical writes carry the mechanical writer's identity; any
    > write that exercises member authority (release under I-18,
    > elevation, disposition) carries the deciding member's name as
    > author, which is what makes C-18.1's release-authority check
    > enforceable and the state history honest about who decided.

-   **skill_version is the writer's component version.** The daemon
    > writes its accelerator version; a session or the client writes the
    > composite. Both practices predate this definition and both conform
    > to it: the field names the version of the component that produced
    > the write, so a consumer reading skill_version knows which
    > writer's contract to interpret the package under. Existing records
    > conform without amendment.

**Decision.** Manifests carry real UTC creation instants, the deciding
member's name on authority-bearing writes, and the producing component's
version in skill_version.

## 10.11 Promotion gate posture (added v10)

Through accelerator 0.10.2 the embedded gate runs only for
daemon-authored packages at packaging; the promoter hash-verifies every
package against its manifest but assumes non-mechanical payloads were
gated by their producing surface. With creation-by-packaging admitted,
an ungated malformed member package can reach live state, and the
store's integrity guarantee is weaker than this document implies.
Decided July 20, 2026 on the operator's word: the embedded gate is wired
into promotion for non-mechanical manifests. The gate already lives in
the endpoint through the Section 10.4 embed mechanism; the cost is
promotion latency, which is tolerable; and the client-side gate remains
the first line per the Mechanical Verification Law, with the
promotion-time gate as the store's own enforcement rather than a
substitute for producer discipline. Mechanical manifests remain gated at
packaging, where the daemon already runs the same embedded gate.
Implementation is queued at accelerator 0.10.3 with battery coverage for
creation-by-packaging riding the same change; until that paste lands,
this section is the recorded decision and the deployment lag is stated
here rather than papered over.

**Decision.** The promotion gate runs server-side for non-mechanical
manifests, implementation at accelerator 0.10.3; daemon packages stay
gated at packaging; the client-side gate remains the first line.

# 11. Recommended prototype sequence (sewer fund strawman)

Validate against one real, messy source before generalizing, without any
public action.

-   Build the bundle skill's core protocol plus the Information-type
    > schema (both specified in BIO_State_Rules_Consistency). Write one
    > Data Extraction adapter against the sewer-fund OpenGov data and
    > one ACFR PDF; confirm the JSON core round-trips to companions and
    > that snapshots archive cleanly.

-   Build a minimal React + Vite client shell that ingests Information
    > bundles into Context with criticality, trust, and provenance, and
    > runs analysis to surface a Problem against the Prop 218 /
    > Municipal Code standard; relate it to any others in the graph.

-   Exercise triage (elevate/defer/dismiss with recheck triggers) and
    > form one Project from an elevated Problem or cluster.

-   Focus the Project into a Work Product; run Compliance and Argument
    > Evaluation in internal then external mode; confirm the
    > fact/commentary firewall and source-grounding (archived
    > primary-source snapshots travel with the export).

-   Run the same analytical skill once as an interactive session and
    > once as a headless Agent SDK run; confirm both write
    > schema-conformant bundles through the one bundle skill. Stop and
    > assess functionality, refinement, and resilience before any
    > expansion.

# 12. Open sub-questions for specialists

-   Permitted use (legal/governance): the June 15 terms for third-party
    > apps driving a group's subscription-authenticated Agent SDK runs,
    > and whether scheduled/unattended runs are permitted under
    > subscription auth. The Section 10.4 headless-dispatch endpoint
    > candidate depends on this answer before admission.

-   Work-product staleness (technical/UX): when a cited Information item
    > changes or an annotation invalidates a conclusion, is the Work
    > Product re-focused automatically or flagged stale for a human to
    > re-focus, and how does that propagate to already-distributed
    > copies. (The State Rules spec's cascade sets the flag and requires
    > a recorded re-evaluation to clear it; whether re-focusing is
    > automatic remains open.)

-   Dependency-chain depth (architecture): how deep re-evaluation should
    > run when an accepted Work Product cites other Work Products, given
    > source-grounding bounds each hop locally. (The State Rules spec's
    > cascade walks one hop at a time, with each dependent's
    > re-evaluation deciding further propagation; the policy defaults
    > remain open.)

-   Sync-engine boundary (technical): if/when multi-device is needed,
    > replicate rows, document ops, or event logs. Write-back coherence
    > is resolved at the kernel level (State Rules spec Section 5.5:
    > optimistic, base-stamped, with a divergence ladder); real-time
    > co-editing and sub-file automatic merge remain the sync-engine
    > concern.

-   Evidentiary standards (legal): whether WACZ captures and SHA-256
    > manifests meet the chain-of-custody an evidence package may need.

-   Accessibility (UX): validate that a static PWA meets Requirement 11
    > --- usable within one session by someone with no civic-tech
    > experience.

# References

*BIO document set: BIO_Complete_Roadmap v4, BIO_Design_Requirements
(rev. June 2026), BIO_Communications_Platforms,
BIO_Functional_Architecture (rev. July 2026),
BIO_State_Rules_Consistency v1.4, BIO_Bundle_Skill_Composite_Design
v1.6, BIO_Intake_Doctrine v1.0, BelieveInOakland_Overview. Prior art:
the Sparky's Coffee Fund (SCF) bundle, operations, and checkpoint
skills, and the Alpha Pipeline bundle skill (v2.21, studied July 2026).*

External sources consulted (June 2026):

-   Anthropic Agent SDK billing change (June 15, 2026):
    > <https://venturebeat.com/technology/anthropic-reinstates-openclaw-and-third-party-agent-usage-on-claude-subscriptions-with-a-catch>

-   Use the Claude Agent SDK with your Claude plan:
    > <https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan>

-   Agent Skills in the SDK:
    > <https://platform.claude.com/docs/en/agent-sdk/skills>

-   Use skills in Claude (cross-surface SKILL.md):
    > <https://support.claude.com/en/articles/12512180-use-skills-in-claude>

-   Local-first architecture (Automerge/Yjs/Loro/PGlite-ElectricSQL):
    > <https://github.com/alexanderop/awesome-local-first>

-   changedetection.io (website change detection):
    > <https://github.com/dgtlmoon/changedetection.io>

-   PDF data-extraction tools 2026:
    > <https://www.lido.app/blog/best-pdf-data-extraction-tools>
