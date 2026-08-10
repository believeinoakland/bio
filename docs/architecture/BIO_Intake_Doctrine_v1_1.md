Believe in Oakland

**Intake Doctrine**

Working Document, v1.1, July 2026

# 0. Status and ratification

> **Editorial note, July 27, 2026 (Bob's directive):** the construct formerly
> named **Problem** is renamed **Focus** throughout, which conveys its purpose
> non-judgmentally. Machine literals shown here use the target vocabulary
> (`focus`, `focus@1`, `focuses/`, `focus.md`); the legacy literals (`problem`,
> `problem@1`, `problems/`, `problem.md`) remain valid aliases in existing
> append-only history and in code until the rename arc lands.

Ratified July 18, 2026 on the operator's word, from draft 0.7 at
bio-bundle rev 0.1.40, per decision-q1-intake-doctrine-home.md: a
standalone governing document, versioned independently on its own
editorial cadence, joining the document set beside the State Rules
specification, the Bundle Skill Composite Design, and the Technical
Architecture Decisions. Authority ordering: the State Rules
specification governs bundle shape; this doctrine governs admission to
the store; the Design document governs write protocol. The M2'
acquisition skills and the authoring-check family name this document as
their governing standard, and it is written to be readable by a
collaborating journalist without the component taxonomies. Sections
accrete as the work forces each decision; a section absent here is a
decision not yet forced. The tree conforming to v1.0 is recorded in
VERSIONS.json's governing-document block from bio-bundle rev 0.1.41.
v1.1 was minted July 20, 2026 at bio-bundle rev 0.1.48 in the
documentation-first pass ordered by the operator, folding the practices
and rulings of the July 19 production sessions; its revision note
follows the v1.0 record below.

# Revision history

**Revision note (v1.2), July 27, 2026.** One operator ruling, Section 4:
what verification asserts (appears-to-be-what-it-claims, never accuracy),
and batch ratification legitimized by volume plus homogeneity of the
collection rather than by origin, with per-document transitions retained,
the acknowledgement recorded in the release record, and
crucial-criticality material excluded from batch release because F4's
co-attestation verification is per-document work. The former reading that
sweep origin alone forces per-document release is superseded: the
mechanical rule (C-18.1) was always that every release transition is
member-authored per document, and batch release satisfies it.

**Revision note (v1.1), July 20, 2026, bio-bundle rev 0.1.48.** Five
additions from production practice and operator rulings, no existing
section's meaning changed. (a) New Section 6 states the escalation
ladder as principle in the operator's formulation and defines blanket
direction, reconciling the practiced ladder with Section 4's
discovery-ratification clause (the D18 reconciliation). (b) New Section
7 records the ratification pattern as practiced through nine production
releases under I-18. (c) New Section 8 records the disposition pattern
from the July 19 cleanup: honest holds, ring-once duplicate folding,
monitoring disabled on dispositioned bundles. (d) New Section 9 states
creation authority boundaries across the three actor classes, made
concrete by the admission of creation-by-packaging. (e) New Section 10
carries the staging-versus-expunge question explicitly with its decision
criteria, to be decided at first sweep ratification. Companion note:
I-18 and I-20 enter the ratified State Rules v1.5 with their checks;
I-19 expunge remains drafted there pending its operation and check
family.

# Revision history (drafts 0.1 through 0.7)

Draft 0.7, July 18, 2026, rev 0.1.40. Draft 0.7 folds the adversarial
review's immediate amendments (phase2-adversarial-review.md, disposed
per adversarial-review-disposition.md): the expunge reconciliation of
the may-not-hold rail with the append-only history law and the off-store
posture for restricted-held originals (Sections 1a, 4a); the interim
release-log review control and the detached-signature target mechanism
for authenticated release (4a); the co-attestation verification
requirement at ratification (3); origin allowlists, https-only public
hosts, fetch caps, the collected-backlog ceiling, and the bounded
gathering-request grammar (4); and bag ingestion hygiene with publisher
signatures (3c). Draft 0.6 refines the may-not-hold rail with the
operator's discovery framing: the group cannot know what it holds until
it examines it, examination is the identification process, good-faith
receipt and examination are not the offense and knowing retention after
discovery is; the rail is discovery-then-action by an authorized member,
never pre-screening perfection, with lawful-but-confidential discoveries
routing to redaction. Draft 0.5 folded the operator's fourth review
round: the may-not-hold rail (contraband met with refusal and purge,
never fencing, distinct from the deferred chooses-not-to-hold editorial
section); release authority (the collected-to-verified transition is a
named member's decision, AI-assisted but member-made, gate-checkable,
staged named-now authenticated-later); redaction practices (derived
artifact, remove not mask, logged by class and reason, member-executed);
and the distribution container (Section 3c, the single-step zip
principle: BagIt RFC 8493 in ZIP form, whole-bag verification by one
standard tool or stock sha256sum). Draft 0.4 added the
independent-verifiability rule (Section 3b, the epistemic twin of R12:
the tool never gates verification; every trust primitive must have a
standard non-BIO verification path) and the positive form of the fetch
rule (policy-governed, never caller-governed; breadth is compatible with
accountability when the breadth is the ratified policy). Draft 0.3
folded the operator's second review round: standing intent in two forms
(named request and ratified sweep) with the ratification fence at
collected, the corrected rationale for excluding caller-directed fetch
(identity, auditability, editorial choice; not store integrity), the
pausable daemon with the due-slate manual path, mechanical
co-attestation as the Grade B trust-raiser, member-original records on
the custody chain, and corroboration as a first-class provenance
concept. Draft 0.2 folded two operator rulings from review: the two-axis
provenance principle (Section 3 preamble) and
admission-requires-provenance-never-relevance (Section 1a). Standalone
governing document per decision-q1-intake-doctrine-home.md; leaves this
tree at ratification. Authority ordering: the State Rules spec governs
bundle shape; this doctrine governs admission to the store; the Design
doc governs write protocol. Sections accrete as the M1'-M3' work forces
each decision; a section absent here is a decision not yet forced.

# 1. What the store admits (D1, draft position)

The unit of admission is the evidentiary series, not the source
document. One Information bundle carries one line of evidence (the Sewer
Service Fund transfer series), and the documents that attest it (an
auditor report, fund statements, a budget) live inside that bundle as
captures with per-document provenance. A document attesting two
independent lines of evidence is captured in each; storage is cheap and
cross-bundle capture references are a coupling the cascade would have to
walk. Rationale: consumers of the store reason about evidence, and the
reference graph (cites edges) should carry evidentiary dependency, not
file management. Revisit if a document class emerges whose whole content
is the evidence (a leaked memo, a court order); the draft position is
that such a document is itself a series of one.

# 1a. Admission requires provenance, never relevance

The store may hold any information carrying honest provenance. Relevance
to a stated need is not an admission criterion: information that
satisfies no gathering request and no live investigation is still
information with a provenance, admissible through any gated write path,
and its cost is attention (managed by criticality marking and the
navigation surfaces), not legality. The gathering-request mechanism of
Section 4 constrains what the daemon may autonomously fetch; it
constrains nothing about what the store may contain, with one exception
that is law, not doctrine. **What the group may not hold (added draft
0.5; refined draft 0.6):** material unlawful to possess is the one class
the ratification fence cannot manage as a holding state, because the
harm is the knowing holding. The epistemics run in one direction: the
group cannot know what it holds until it examines it, examination is the
identification process, and good-faith receipt and the act of examining
are not the offense; knowing retention after discovery is. So the rail's
shape is discovery-then-action, not pre-screening perfection: intake
proceeds in good faith under the fence; examination for release is the
sanctioned process by which material identifies itself as appropriate or
not; and upon discovery of unlawful material, an authorized member takes
prompt recorded action, destruction and any legally required reporting,
never silent retention. Discovery of lawful-but-confidential material
routes to the redaction process of Section 4a under the same authority.
Sweep definitions carry source-class and media-type constraints that
make exposure unlikely by construction; the full incident procedure is
drafted if ever forced. **Reconciliation with the append-only law (added
draft 0.7, per the adversarial review's F1).** Discovered material
reaches live state through promotion, which writes immutable history
snapshots under the append-only law, so destruction needs a sanctioned
mechanism or the rail is prose. Expunge is that mechanism and the one
exception to append-only history: the content is removed from live state
and from history and replaced by a tombstone recording the fact, date,
deciding authority, and reason class of the removal, never the content,
so the audit trail stays honest while the material does not persist.
Expunge is a named-member act under the same authority as release and
redaction; it enters State Rules v1.5 as its own invariant (drafted
there) and lands with its executable check when the operation is built,
per the Mechanical Verification Law. Whether sweep intake should
additionally stage before first promotion, so most discoveries happen
before any history snapshot exists, is weighed at the M2' build against
the fence's virtue that collected material is visible and durable;
staging as the front line and expunge for late discoveries may both be
right, and the decision is forced there, not here. Distinct from all of
that, and still deferred until forced: what the group CHOOSES not to
hold as editorial restraint (personal information about private
individuals being the anticipated class), which is an editorial policy
the group owns, not a schema rule.

# 2. The intake contract (D2)

Every submission, daemon or member, carries:

-   **The capture.** The document bytes as obtained, named by grade
    > (Section 3).

-   **Provenance, per document:** locator (the authoritative source
    > address, or "in hand" with chain-of-custody notes for member
    > submissions of unpublished material); authority (who issued the
    > document, free text in draft 0.1, controlled vocabulary revisited
    > when the corpus justifies one); retrieved (ISO-8601 UTC instant of
    > capture); capture method (which actor, which surface, which
    > grade); and the capturing actor's class (daemon, session, member).

-   **Classification and criticality** per the State Rules Information
    > schema: fact, analysis, or judgment; crucial or supporting. A
    > received work product from another group is analysis by rule,
    > never fact, per the no-transitive-trust storage form.

-   **The normalized dataset with its content hash,** where the document
    > yields structured content. The hash is over the normalized
    > dataset, never the raw capture (State Rules 4.1); a document with
    > no structured content hashes its canonical text extraction.

How it lands: as a gated Information bundle through the pending queue,
promotion consuming it. No intake path writes live state; the daemon and
the member are writers like every writer.

# 3. Capture grades (D3)

Provenance has two orthogonal axes, both recorded per document, neither
a quality score on the information itself. The source axis: who issued
the document and with what authority. The capture-chain axis: how
faithfully and verifiably the group obtained its copy. The grade lives
entirely on the capture-chain axis; it grades the copy's verifiability,
never the source's credibility and never the information's worth. A
Grade B capture of an auditor's report is strong source on a moderate
chain; a Grade A capture of a blog post is weak source on an airtight
chain; neither axis substitutes for the other. Grades are named honestly
because a claim about evidence is only as strong as its weakest named
layer:

-   **Grade A, evidentiary raw capture.** WACZ web-archive or equivalent
    > chain-of-custody capture of the source as served. Required before
    > external distribution of any work product resting on the document
    > (Tech Arch 7.2); produced by a network-capable agentic session or
    > the M2' fetch layer where the source permits.

-   **Grade B, fetched content.** The document bytes as fetched by a
    > capable surface, hashed at receipt, with locator and instant. What
    > the chat surface and the mechanical fetch layer produce.
    > Sufficient for internal work and for verified state; the gap to
    > Grade A is recorded in Provenance Notes, never papered over.

-   **Grade C, reference only.** A locator and citation without archived
    > bytes. Admissible only for sources that cannot be captured (a
    > physical record, a paywalled corpus the group may cite but not
    > archive), with the reason recorded. A Grade C source cannot back a
    > load-bearing claim in an externally distributed work product.

An Information bundle's verified state requires Grade B or better on
every attesting document. Grade upgrades (B to A) are accretive adds:
the new capture lands beside the old, never replacing it.

**Raising a grade mechanically (added draft 0.3).** A self-recorded hash
proves integrity since capture, not origin: it is the group's
attestation of what the source served. Two cheap, automatable
co-attestations raise a Grade B capture toward evidentiary weight and
are REQUIRED of the M2' fetch layer wherever the source permits: (1) a
co-archive request (Internet Archive or equivalent) of the same locator
at capture time, creating an independent third-party timestamped record
the group does not control, with the archive locator recorded in
provenance; (2) a trusted timestamp over the capture hash, proving the
capture existed at the claimed instant. The full replayable transaction
capture (Grade A) remains the ceiling for adversarially distributed work
products; co-attested Grade B is the working floor for verified state on
contested claims.

**Verification at ratification (added draft 0.7, per F4).**
Co-attestation earns its weight only if someone checks it. An attacker
holding a write token can fabricate plausible provenance fields, but
cannot backdate a third-party archive snapshot or forge a timestamp
token against its issuing authority; the countermeasure the design
already contains works only when enforced at review. Ratifying
crucial-criticality or contested material therefore requires the
reviewing member to verify the recorded co-attestations (visit the
co-archive locator, verify the timestamp token against its authority)
before releasing, and the review surface presents the source material
itself, never only an AI summary, so ratification is never a rubber
stamp on a possibly steered account. A genuine capture failure is
recorded honestly as attempted and unavailable, and material carrying it
inherits a lower ceiling for external distribution rather than a papered
gap. The checker surfaces crucial material lacking verifiable
co-attestation as an advisory finding when the M2' machinery lands.

# 3a. Member-original records (added draft 0.3)

Records a member creates or obtains in person (an audio recording of a
public meeting, notes taken in the room, a printed agenda in hand) are
original evidence, not captures of published documents; their
capture-chain axis is chain of custody: who made or obtained the record,
when, with what device or in what setting, hashed at intake with the
member's attestation recorded. On the two axes:

-   **A recording of the event** is primary evidence: the source is the
    > event itself. Weight rises with corroboration (the official
    > recording or minutes, a second attendee's record, device
    > metadata). Open public meetings are recordable by right (Cal.
    > Gov. Code 54953.5); material from private contexts waits on the
    > deferred what-we-choose-not-to-hold section.

-   **A document obtained in hand** (the agenda) carries the issuing
    > body's authority with locator "in hand"; it cross-checks against
    > any posted copy, which is co-attestation.

-   **Notes** are a witness account: the member's perception, honestly
    > classified as such, admissible with full provenance, carrying
    > testimonial weight; alone they back a claim cautiously, and
    > corroborated they harden.

All three are evidence at different weights, and weight is the same
everywhere in this doctrine: source authority, times chain integrity,
times corroboration.

**Corroboration as provenance (added draft 0.3).** Corroboration is a
first-class provenance concept: an edge between independent records
attesting the same fact (two captures from unrelated origins, a
recording and the official minutes, a co-archive and the group's own
fetch). The reference graph carries these edges so evidentiary weight is
readable from the store, not asserted in prose.

# 3b. Independent verifiability (added draft 0.4)

The epistemic twin of R12: as the tool never gates the work, the tool
never gates the verification. Every provenance claim in a distributed
work product must be verifiable with standard, independently available
tools; BIO tooling may make verification convenient, never necessary.
The standards stack, binding on every trust primitive this doctrine or
the M2' machinery adopts:

-   Content hashes are SHA-256, verifiable with stock tooling
    > (sha256sum, openssl) on any machine.

-   Trusted timestamps are RFC 3161 tokens, verifiable with openssl ts
    > against the issuing authority.

-   Web captures at Grade A are WARC (ISO 28500) / WACZ, replayable in
    > independent open-source players the group does not control.

-   Co-archives are third-party public archives (Internet Archive or
    > equivalent) anyone can visit at the recorded locator.

-   Manifests and provenance blocks are documented plain JSON, readable
    > without software.

-   Member-original media adopts C2PA signed-capture provenance as
    > device and tool support permits.

A trust primitive with no non-BIO verification path is not adopted,
whatever its other merits. The outsider's verification story must read,
at every step, "check it yourself with tools you already trust."

# 3c. The distribution container (added draft 0.5)

The single-step rule, the operator's zip principle: the assembled trust
wrapper, not merely each primitive inside it, must be openable and
verifiable in one step by one standard, trusted, independently available
tool. The adopted container is BagIt (RFC 8493) in ordinary ZIP form:
the work product's payload subtree plus a manifest-sha256.txt (hash,
space, path) plus bag metadata. Any BagIt tool verifies the whole bag in
a single step, and the manifest format is simple enough that stock
sha256sum verifies it with no BagIt software at all. Inside the bag,
every layer keeps its own standard form per Section 3b: captures as
WACZ, timestamps as RFC 3161 token files, provenance as documented JSON.
The honest limit, stated so it is never papered over: single-step
verification covers structure and integrity completely (every byte
accounted for and unaltered); verifying an inner layer's semantics (a
timestamp's signature, a capture's replay) uses that layer's own
standard tool, because no off-the-shelf utility spans all semantics and
a BIO tool that did would violate 3b. Depth of verification is the
outsider's choice, and every depth has a non-BIO path.

**Ingesting bags (added draft 0.7, per F7).** A bag verifies integrity,
not authorship. Consuming another group's bag applies standard
extraction hygiene (every path validated against traversal before any
write), and publisher authenticity comes from a detached standard
signature over the bag manifest, the same mechanism as 4a's target
control, verified with off-the-shelf tooling. Recorded now; built when
the first bag is produced or consumed.

# 4. Standing intent: named requests and ratified sweeps (D5, first half)

The daemon fetches only what store state authorizes; no caller ever
directs a fetch by parameter. The rationale is not store integrity (the
queue, the gate, and provenance protect that regardless): it is
identity, since fetches run as the group's infrastructure and the group
must choose what it retrieves under its own name; auditability, since
"why does the group have this?" must always be answerable from store
state; and editorial choice, since what the group declines to hold is
the group's decision, not a caller's. The positive form of the rule
(added draft 0.4): fetching is policy-governed, never caller-governed. A
crawler indexing the whole web answers challenges by pointing at its own
published policy and its compliance with it; breadth is compatible with
accountability exactly when the breadth is the group's ratified policy.
The sweep below is that policy's form here, as wide as the group chooses
to ratify it.

Standing intent takes two forms, both store state, both written through
the gated path by a human:

-   **The named request.** Names a specific document or source: target
    > identity or stable locator, the credible-source constraint (the
    > authoritative publisher first; named mirrors only as recorded
    > fallback), criticality, cadence. Carried in the target bundle's
    > monitoring block plus data/gathering.json.

-   **The ratified sweep.** Names a query, not a document: scope,
    > source-class constraints, cadence, and a breadth budget. Within a
    > sweep's scope the daemon or an AI session may fetch what matches
    > and what it deems relevant nearby, recording the deeming actor and
    > the matched sweep in provenance.

**The ratification fence.** What a named request fetches may enter at
the state its verification earns. What a sweep brings back always lands
at collected, never higher: safely in the store, fully provenanced, and
fenced by the state machine itself. Human ratification is the
collected-to-verified transition, made per-document after intake. What
is ratified up front is the sweep's scope; what is ratified afterward is
each document's standing. AI and broad discovery range wide; verified
stays earned by human decision.

**What verification asserts, and batch ratification (operator ruling,
July 27, 2026).** Verification does not promise that anyone has
confirmed the accuracy of anything stated in a document. It is the
member's reassurance that the document APPEARS to be what it claims to
be: not a spam advertisement, not a phishing artifact, but the kind of
thing it presents itself as. Accuracy and credence are separate
questions the catalog does not yet model. From that definition follows
the batch rule: the factor legitimizing a bulk release is not how the
cache of documents was found but the volume of the collection combined
with little to no variance in the trustworthiness of its contents. A
hundred postings from a public jobs board are one judgment made
honestly once, whatever origin brought them in. Per-document remains
the requirement where the definition demands it: each document in a
batch still receives its own member-authored release transition in its
own record, the member's explicit acknowledgement of the batch's
homogeneity and of their mitigation steps (what they actually sampled
and checked) is recorded as part of the operation, and
crucial-criticality or contested material is NEVER batch-released,
because ratifying it requires verifying its co-attestations (Section 3,
F4), which is inherently per-document work. The security consequence is
named honestly: under batch release, the member's recorded sampling
honesty is the boundary against a poisoned document hiding in a
homogeneous batch, which is why the acknowledgement is a record, not a
dialog. Deferred until forced: the
retention posture for collected material never ratified (an attention
question, per Section 1a, not a legality question).

Member-submitted documents in hand enter under Section 2 directly; their
gathering request is retroactive and optional (a member may plant one so
the daemon watches the source for changes thereafter).

**The manual path.** The daemon is pausable, and its due slate (every
named request and sweep currently due) is exportable as an interactive
prompt a member runs by hand in a chat session, the Alpha Pipeline
runner pattern. The tool never becomes the only way the group's standing
intent gets executed.

**Constraints as security controls (added draft 0.7, per F5 and F6).**
Named-request locators and sweep source-class constraints are explicit
origin allowlists, https-only, public hosts only, which forecloses both
lookalike origins satisfying a loose pattern and SSRF-shaped locators.
The breadth budget is a security control as much as attention hygiene:
per-tick fetch caps, a ceiling on the collected backlog awaiting
ratification (flooding collected until review becomes rubber-stamping is
an attack, not merely clutter), and an anomaly note when a sweep's yield
departs its history are all part of a sweep's ratified definition.
Gathering-request fields carry a bounded grammar the gate checks, so a
request record can never smuggle free text that a rendering surface
would interpolate as instructions; the due-slate exporter renders store
fields as quoted data inside fixed instruction framing; and examining
sessions treat collected material strictly as untrusted data, never as
instructions, a posture stated in the Data Extraction and Monitoring
skill texts that M2' mints.

# 4a. Release from hold, and redaction (added draft 0.5)

**Release authority.** The collected-to-verified transition is a
member's decision: AI may assist the review freely, but the decision is
made by, and recorded as, a named member. The transition's state_history
entry carries a member identity as author, never a surface or AI
identity, and this is mechanically checkable: a release transition
authored by a non-member identity fails the gate (an invariant candidate
that arrives with its check when the release path is built, per the
Mechanical Verification Law). Staged honestly: today the client
authenticates the group, not the person, so the rule lands as
named-member now, authenticated-member when the engagement layer adds
per-member credentials; the doctrine states the full rule and the tree
implements it in that order.

**The interim control (added draft 0.7, per F3).** Until authenticated
release, the author field is a string any write-token holder can set;
the mechanical check verifies form, not identity. The compensating
control is periodic member review of the release log: the members read
the store's verified transitions against their own memory of their acts,
and a release nobody made is an incident. Cheap, human, and honest about
what the check can and cannot see. The target mechanism, built at M3',
is a detached signature over the transition record using standard
tooling (minisign or SSH signatures), verifiable entirely outside BIO
tooling, which is exactly what Section 3b requires of a trust primitive.

**Redaction.** Material lawful to hold may still need redaction before
release. The practices: redaction produces a derived artifact, never an
in-place edit; the unredacted original stays held under restricted
handling or is destroyed by recorded decision. Redaction removes data
rather than masking it. Every redaction is logged by class and reason,
so the released artifact declares what was withheld and why, preserving
the verification story rather than quietly breaking it. AI may flag
redaction candidates during the held period; execution and approval are
member acts under the same named-member rule as release. The redacted
derivative is an ordinary capture-grade artifact with its own hash and a
derivation record in provenance, composing with the accretive model
unchanged.

**Off-store originals (added draft 0.7, per F1).** The store is designed
to mirror, fork, and distribute; it has no restricted tier, and a
restricted copy in a replicating substrate is a fiction. Until a
restricted tier exists, an unredacted original held under restricted
handling lives off-store, operator-held, with its hash and a derivation
record in the store so the redacted derivative's provenance still
verifies against material the store does not carry.

# 5. Naming and criticality (D4, draft position)

Production IDs follow the spec grammar with slugs naming the evidence,
not the document (sewer-transfer-series, not auditor-report-2022).
Crucial marks evidence a live Focus or Project cites as load-bearing;
supporting marks everything else; the checker already enforces nothing
here, and the doctrine deliberately keeps criticality as editorial
judgment recorded, not computed.

# 6. The escalation ladder and blanket direction (added v1.1)

The principle, in the operator's formulation: the workflow does
everything possible and practical so that humans focus on judgment,
assessment, communication, and action. The ladder that implements it has
three rungs, each engaging the next only for what the rung below cannot
do. The daemon executes named standing intent: mechanical capture,
mechanical change detection, mechanical bookkeeping, nothing it composes
and nothing it decides. A session discovers with its own tools: it reads
what the daemon gathered, follows the evidence to sources the standing
intent does not yet name, proposes new gathering requests, and prepares
everything a decision needs. Humans are engaged only for the impossible
or the impractical: acts of authority (ratification, release, elevation,
disposition, distribution), acts of judgment the tools cannot make, and
acts in the world.

**Blanket direction (the D18 reconciliation).** Section 4's rule stands:
discovery of new documents is proposed by sessions and ratified into
standing intent by humans. Production practice showed the ratification
can be given as a blanket: a member may direct a session, within a named
investigation scope, to plant the gathering requests its discovery
warrants, and that direction is itself the ratification for every
request within the scope, given once instead of per request. The blanket
is bounded exactly as a sweep is: it names its scope, it is recorded (in
the session's record and in each planted request's provenance, which
names the directing member), and it never extends to release, which
remains per-document under Section 4a whatever the breadth of the
gathering direction. A blanket direction is standing intent about intake
breadth; it is never standing intent about verification. The July 19
session's Legistar chain was planted under exactly this form and is the
worked example.

# 7. The ratification pattern as practiced (added v1.1)

Nine production releases under I-18 settled the working pattern,
recorded here so it is doctrine rather than habit. The session prepares:
it verifies the capture against archived bytes, extracts the canonical
dataset, computes the hashes, runs the gate locally, and assembles the
release package with the C-2.7 rebase (the dataset's canonical hash
becomes content_hash, the capture hash stays authoritative in the
register, and a change record accompanies the rebase). The member
releases: the collected-to-verified transition is the member's decision
under Section 4a, recorded with the member's name as author. The blurb
states exactly what the capture is and never more: an index-page capture
is released as a capture of an index page, not as a capture of the
documents the page lists, and the July 19 index-page releases are the
worked example. Review of crucial or contested material includes the
Section 3 co-attestation verification, and the review surface presents
the source material itself, never only an AI summary.

# 8. The disposition pattern (added v1.1)

From the July 19 cleanup, the pattern for material that enters the store
and should not proceed toward verified. Honest holds: a bundle held for
a stated reason stays at collected with the reason in Review Notes,
never silently parked and never deleted. Duplicate folding per
ring-once: byte-identical content is corroboration on the original
entry, never a second review item; the duplicate bundle is dispositioned
at collected with a Review Note naming the original, and the
corroboration edge lands on the original's register. Monitoring is
disabled on dispositioned bundles, so the daemon stops spending
attention on material the group has already judged. Everything stays at
collected because the state machine has no collected-to-retired edge;
whether one should exist is deliberately left unforced until the volume
of dispositioned material makes the answer real.

# 9. Creation authority boundaries (added v1.1)

Made concrete by the admission of creation-by-packaging (the endpoint at
0.10.2). The daemon creates Information bundles from named standing
intent only, always at collected, never anything else and never higher.
Sessions create Focus and Project bundles through
creation-by-packaging, gated in the producing session, promoted like
every write; the first production Focus and Project were created
exactly this way. Elevation, release, disposition, and distribution are
member acts under Sections 4a and 7, whatever surface records them. No
actor class creates Actions mechanically; an Action is an act in the
world and begins as a member decision.

# 10. Staging versus expunge (added v1.1; open, with decision criteria)

The open question from the draft 0.7 reconciliation, carried explicitly
rather than by allusion. Sweep intake could stage before first
promotion, so most may-not-hold discoveries happen before any history
snapshot exists and expunge is rarely needed; or the fence's current
form could stand, with collected material visible and durable from first
promotion and expunge handling late discoveries. The decision criteria:
the fence's virtue is that collected material is visible, durable, and
reviewable by every member from the moment it lands, which staging
weakens; staging's virtue is that discovery-then-action mostly happens
before immutable history exists, which shrinks the expunge surface; and
the deciding facts are the observed rate of may-not-hold discoveries in
real sweep yield and the observed cost of expunge when exercised,
neither of which exists yet because no sweep has been ratified. Decided
at first sweep ratification, not before. Both-and remains admissible:
staging as the front line and expunge for late discoveries.

# Sections not yet forced

Member-intake specifics beyond the contract (M3'); received work
products from other groups as an intake class (the Cityside consumer
posture makes this concrete; drafted when the first one arrives);
extraction and normalization standards per document type (M2', with the
Data Extraction skill); the acquisition doctrine's second draft shaped
by the Cityside collaboration (original M4 exit).


## Cross-reference: declared bias (July 27, 2026)

Intake and release are lens-independent by design: verification asserts only
that a document appears to be what it claims to be, and no bias statement
changes what may be captured or verified. Declared bias
(BIO_Declared_Bias_v0_1.md) binds ABOVE this doctrine, at evidence, analysis
and conclusions; its one touch on this document's territory is at ratification
for publication, where a work product must carry its bias manifest, an authored
**bias acknowledgement** (DEC-46 (a), REC-47), and no unsettled **HUNCH DEBT**.

> *Corrected 2026-08-05 (D-188 / DEC-46 (d)). This read "no unsettled bias
> debt", which is the pre-DEC-20 blanket rule and reads as forbidding what the
> doctrine requires: ordinary bias debt is DISCLOSED and travels with a
> published case. Only an uncleared HUNCH refuses ratification for publication.*
