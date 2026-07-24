# Believe in Oakland

# State Rules & Consistency Specification

Working Document, v1.5, July 2026

## 0. Status and scope

This is the companion specification that
BIO_Technical_Architecture_Decisions defers to for the data store. It
specifies the store layout, the bundle anatomy, the universal
frontmatter core, the six per-type schemas with their state machines,
the reference model, the pending-package queue, the promotion and
multi-writer coherence rules, the invariant set, and the
violation-to-repair mapping. Where this document conflicts with
BIO_Technical_Architecture_Decisions on data-store matters, this
document governs; the Tech Arch governs for everything else.
BIO_Design_Requirements remains the top authority on requirements.

**Revision note (v1.5).** Ratified July 20, 2026 on the operator's word,
folding the in-tree draft (state-rules-v1_5-draft-release-authority.md,
bio-bundle revs 0.1.38 through 0.1.44) as amended by production
practice; the draft leaves the tree at this ratification. Two invariants
enter with their checks per the Mechanical Verification Law: I-18
release authority (check C-18.1, bio-checks 1.8.0, exercised by nine
production releases July 19, 2026) with the intake provenance register
as its declared-contract anatomy including the daemon-era fields
(Section 4.1), its repair rows (Section 7), and the C-18.3/18.4/18.5
register-integrity family (Section 8); and I-20 mechanical-writer
conformance (check C-20.1, bio-checks 1.9.0) with its declared field-set
registry (Section 6). One invariant is drafted but deliberately not
entered: I-19 expunge, which enters only with its C-19 check family when
the expunge operation is built; until then the append-only law stands
whole (Section 6 carries the draft so the operation is built to a stated
contract). Section 2.6 gains the creation-base clarification (the
empty-string hash as the recorded form of no-prior-version), exercised
in production by daemon and member creations alike. Section 8's
check-catalog record updates from bio-checks 1.7.0 to 1.9.0 and its
call-site sentence is corrected: the embedded gate makes the accelerator
a third call site of the one check codebase, and the accelerator's
non-judging caveat is retired by the July 20 operator decision wiring
the gate into promotion for non-mechanical manifests (Tech Arch v10
Section 10.11; implementation at accelerator 0.10.3). The
verified-requires-Grade-B-or-better floor (a natural C-18.2) remains
recorded and deliberately not entered, awaiting the work that makes it
exercisable. No existing invariant's meaning changes.

**Revision note (v1.4).** Refinements from the completion of the Phase 1
client ladder (bio-bundle rev 0.1.26 through 0.1.29); no invariant's
meaning changes. (a) The Mechanical Verification Law is discharged in
fact: all seventeen invariants carry executable checks as of bio-checks
1.7.0, and Section 8 now states it. C-17.2, the disjointness
auto-classification check, closed the last gap; it and the client
promoter's ladder logic call one shared classifier, so the gate and a
promoter cannot diverge on rung classification. (b) Section 5.5's
disjoint-auto rung gains the classifier's fixed semantics: dual-anchor
resolution of a diverged base in recorded history (an entry's recorded
base, or the bundle.md after-hash carried in a verbatim promotion
record, with the latest anchor preferred), disjointness verified at file
granularity against the union of intervening promotions' file sets, and
adjudicated classification for unanchorable bases, incomplete chains,
and a tail anchor over divergent live content. (c) The disjoint-auto
history-entry shape is specified: base plus applied_over plus rung,
which is the mechanical form of I-17's both-bases requirement.

**Revision note (v1.3).** One refinement from the July 11 accelerator
conformance run. An unreadable PENDING_PROMOTION.json is discarded by
the promoter rather than preserved: substrate writes are atomic, so
unparsable means permanently corrupt; the corrupt manifest holds nothing
recoverable, while the gate-passed package files survive and surface as
orphaned-pending findings; and preserving unreadable bytes would either
wedge the queue or carve an exception into the append-only history law.
Section 2.4 gains the unreadable-manifest rule and the Section 7 I-16
group gains the discard row. No invariant's meaning changes; the rule
makes I-16's nothing-ever-lies-around commitment hold for the one
artifact that can be neither promoted nor repaired.

**Revision note (v1.2).** Two refinements surfaced during the July 10-11
bundle-skill build, each closing a gap the build made concrete. (a)
reeval_pending changes from a bare boolean to a small record {flag,
since, source}: the flag carries the same meaning, but since (the
ISO-8601 UTC instant the flag was set) and source (the cascade event
that set it) give the cascade-hygiene check the timestamp it needs to
enforce the staleness rule mechanically. Without since, "no
reeval_pending older than policy age" was unenforceable and the check
(C-10) was deferred; with it, the check is implementable. (b) The
Section 2 bundle anatomy now names the transient advisory artifacts
(PROMOTING-*.json promotion claims and PRESENCE-*.json session markers)
that convergent promotion and multi-writer coordination create, so that
their presence is documented store state rather than surprise residue; a
stale one is a surfaced finding whose repair is deletion. Neither change
alters an existing invariant's meaning; (a) makes I-10 enforceable and
(b) makes the advisory-artifact hygiene check well-founded.

**Revision note (v1.1).** Folds in the decisions of the July 2026
bundle-skill design sessions (BIO_Bundle_Skill_Composite_Design v1.1
through v1.4): annotation identity made collision-resistant (Section
1.2); the pending-package queue specified as first-class store state
(Section 2.6); promotion specified as a convergent, idempotent algorithm
safe under concurrent promoters, because the substrate offers no mutual
exclusion (Section 2.4); multi-writer editing coherence resolved by
base-stamped optimistic writes with a three-rung divergence ladder
(Section 5.5); invariants I-16 (queue integrity) and I-17 (base
coherence) added with repair rows (Sections 6 and 7); check families
extended accordingly (Section 8); write-protocol obligations extended
with base recording and the packaging obligation (Section 9).

Decisions ratified in the July 2026 design sessions and embedded here:

-   Flat per-type root folders with reference-based linking. Containment
    > is used only for exclusively owned material with no independent
    > lifecycle.

-   References are canonical bundle IDs, never Drive file IDs or any
    > substrate locator. The per-group derived index maps canonical IDs
    > to substrate locators and is regenerable by scan.

-   Frontmatter is a universal core plus a per-type extension, mirroring
    > the composite bundle skill's always-on core plus on-demand type
    > schemas.

-   Annotations are accretive records within their target bundle, not
    > peer bundles. This amends the letter of Tech Arch Section 2:
    > Annotation remains a first-class object type in the model but is
    > persisted as a within-bundle record type.

-   Lifecycle state lives in frontmatter only. There are no
    > active/concluded/archived folder moves. Bundle folders never move
    > or rename after creation.

-   Every invariant in this specification has a corresponding executable
    > check. The bundle skill's pre-write gate and the client-side
    > consistency checker run the same check set. This is the Mechanical
    > Verification Law (Section 8), adopted from Alpha Pipeline
    > production experience.

-   Promotion concurrency is handled by convergence, not exclusion:
    > multiple actors racing on the same promotion is the designed-for
    > normal case, made harmless by deterministic naming, a commit-point
    > write order, and idempotent consumption (Section 2.4).

-   Multi-writer editing coherence is optimistic and base-stamped: every
    > write-back records the base it started from; divergence is
    > detected mechanically and resolved on a fast-forward /
    > disjoint-auto / adjudicated ladder with accretive branch
    > preservation (Section 5.5).

## 1. Store layout and canonical naming

### 1.1 Root layout

A group's store is one folder tree on the bundle substrate (Google Drive
by default; git or OSF as mirrors):

/BIO//

information/

INFO-2026-0001-sewer-acfr-fy24/

INFO-2026-0002-opengov-transfers-fy20-25/

problems/

PROB-2026-0001-transfer-relabeling/

projects/

PROJ-2026-0001-sewer-fund-diversion/

actions/

ACTN-2026-0001-cpra-26-3028/

index/

index.json (derived, regenerable, never authoritative)

Four roots, one per independently persisted type. Work Products live
inside their Project or Action bundle (Tech Arch Section 4). Annotations
live inside their target bundle (Section 4.6 below). The index folder
holds the derived per-group index and is excluded from all integrity
guarantees: it can be deleted and rebuilt at any time by a client scan.

### 1.2 Canonical ID grammar

TYPE is one of INFO, PROB, PROJ, ACTN. YYYY is the creation year. NNNN
is a zero-padded per-type, per-group, per-year sequence. slug is
lowercase kebab-case, 2 to 6 words, frozen at creation. Examples:
INFO-2026-0003-omc-13-04, PROB-2026-0007-acfr-opengov-mismatch.

Rules:

-   The canonical ID is immutable for the life of the object, including
    > after retirement.

-   The bundle folder name is exactly the canonical ID.

-   The slug is never revised to track evolving understanding. It is a
    > handle, not a title. Titles live in frontmatter and may change.

-   Bundle IDs match
    > \^(INFO\|PROB\|PROJ\|ACTN)---\[a-z0-9\]+(-\[a-z0-9\]+)\*\$.

-   **Annotation identity (revised v1.1).** Annotation records are
    > identified by creation timestamp plus author, not by an allocated
    > sequence: .ann--, e.g. PROB-2026-0007.ann-20260710T191200Z-bob.
    > Sequence allocation was removed because concurrent annotators
    > would race on the next number; timestamp-plus-author identity is
    > collision-resistant by construction, and prevention is free where
    > repair is not. The checker's I-1 uniqueness finding remains as the
    > backstop for the residual same-second-same-author case, whose
    > sanctioned repair is a one-second suffix adjustment on the later
    > record.

-   **Distribution identity.** Distributions keep the readable allocated
    > form .dist- because a distribution is a deliberate,
    > evaluation-gated act performed inside a base-checked
    > promoting-mode write (Section 5.5), so sequence collision is
    > caught by base coherence rather than left to chance, and the
    > ordinal reads well in citations.

### 1.3 Naming rules for files

All filenames match \[a-zA-Z0-9\_.-\]+ with a single terminal extension:
letters, digits, underscores, hyphens, dots only where a naming rule in
this spec requires them, one lowercase extension. No spaces. This is the
Alpha Pipeline asset rule generalized to every file in the store,
because renderers key on it and mirrors depend on it.

## 2. Bundle anatomy

Every bundle, regardless of type, has this shape:

/

bundle.md (state surface: YAML frontmatter + fixed prose sections)

(per type; see Section 4)

data/ (structured JSON payloads, when the type carries them)

snapshots/ (archived source captures, Information bundles primarily)

annotations/ (accretive annotation records; may be absent until first
annotation)

distributions/ (frozen Work Product exports; Project/Action bundles
only)

\*.svg (rendered visuals, co-located, description-as-truth)

PENDING_PROMOTION.json (transient: pending-package manifest, Section
2.6; absent when queue is empty)

(transient: gate-passed files awaiting promotion, named per Section 2.6)

PROMOTING-.json (transient advisory: promotion claim, Section 2.4; never
load-bearing; stale ones are a surfaced finding, repair is deletion)

PRESENCE-.json (transient advisory: session presence marker, Section
5.5; never load-bearing; stale ones are a surfaced finding, repair is
deletion)

\_history/

manifest.json

bundle\_.md

...

### 2.1 The state/record split

bundle.md is the compact operational surface: frontmatter carries the
machine-parsed state, and a small set of fixed prose sections carries
the human decision surface. The record files carry the full work. The
state surface must stay lean enough that a resuming session can
bootstrap from bundle.md alone and load record files by range as needed.

### 2.2 Format assignment

JSON where structure matters, markdown where narrative matters, SVG
where rendering matters. Specifically: all structured payloads
(extraction outputs, normalized datasets, reference-heavy registers) are
.json files under data/. YAML appears in exactly one place, the
bundle.md frontmatter, and is subject to the full drift defense (Section
3.3). Markdown is clean standard markdown with no backslash escapes on
markdown characters. This assignment is a direct lesson from Alpha
Pipeline production: YAML indentation and alias drift produced real,
repeated failures; JSON payloads plus a mechanically validated YAML
state surface confine the fragile format to the smallest possible
footprint.

### 2.3 Description-as-truth

For every rendered artifact (SVG or otherwise), the authoritative
content is a machine-readable description in frontmatter (the visuals
array); the rendered file is a regeneratable view. At write time the
skill compares session changes against visual descriptions and flags
stale visuals for regeneration. Regeneration reuses the same filename so
references never change.

### 2.4 History and convergent promotion

Promotion installs a new version: the superseded live files are
preserved in \_history/ and the new files become live. There is no
watcher and no server, and the substrate offers no mutual exclusion (no
compare-and-swap, no exclusive create; duplicate filenames are
permitted, so a lock file does not lock). Multiple actors, a client on
open, an agentic session on bootstrap, an accelerator on schedule or on
demand, may therefore race on the same promotion, and the specification
makes the race harmless rather than pretending to prevent it. Promotion
is convergent: every promoter starts from the same hash-verified input
and produces byte-identical output, so any interleaving of correct
promoters reaches the same end state. The algorithm, identical in every
implementation:

-   **Verify.** Confirm every input file against its SHA-256 (from the
    > pending manifest for queued packages, or from the session's own
    > gate run for direct write-backs). Abort on mismatch; never promote
    > partially.

-   **Claim (advisory).** Write a claim file named for the actor with a
    > timestamp. If a fresher claim from another actor exists within the
    > stale threshold (10 minutes), back off. The claim only reduces
    > duplicate work; because the substrate cannot make it exclusive, no
    > safety property may depend on it.

-   **Snapshot deterministically.** Copy the current live files into
    > \_history/ under names derived from the write-back's timestamp and
    > content hash, never from a next-sequence counter, so racing actors
    > write identical names with identical bytes and the second detects
    > the existing file and skips. Append the manifest entry (sequence
    > derived from the same stamp; label from current_state; producing
    > mode; base per Section 5.5; files snapshotted).

-   **Write with a commit point.** Write record and data files first;
    > write bundle.md last. The state surface, whose frontmatter and
    > hashes reference the other files, is the commit point: a
    > concurrent reader sees the old consistent state or the new
    > consistent state, and any torn residue is exactly what the
    > checker's hash checks detect, with re-running promotion as the
    > deterministic repair. A crashed promoter leaves the same
    > detectable residue; partial failure and concurrency share one
    > recovery mechanism.

-   **Consume idempotently.** Archive the pending manifest (if any) into
    > \_history/ as the promotion record, then delete the consumed
    > package files and the actor's own claim, treating already-deleted
    > as success.

-   **Re-run the gate** against the promoted bundle.

**Unreadable manifests (added v1.3).** Because substrate writes are
atomic, a PENDING_PROMOTION.json that does not parse is permanently
corrupt, never mid-write. Left in place it would wedge the queue: every
sweep revisits it forever, and it sorts first in queue listings with an
empty timestamp. Preserved, it holds nothing recoverable: the
gate-passed package files are the payload, and they survive untouched.
The promoter therefore deletes the corrupt manifest and converges. The
surviving .pending files then surface through the queue-integrity family
as orphaned-pending findings, whose sanctioned repairs are re-producing
the package from the originating session's outputs or discarding with
reason, so a lost promotion is never silent. The deletion is not a gated
deletion under Section 2.5: the corrupt manifest is transient queue
state, not store content, and its consumption mirrors the consumption of
a valid manifest, differing only in that there is nothing meaningful to
archive as a promotion record.

History is append-only; nothing in \_history/ is ever modified or
deleted.

### 2.5 Accretive store and gated deletion

Material is added, not removed. Deletion is exceptional and requires all
of:

-   A stated reason recorded in the deletion record
    > (data/deletions.json, append-only).

-   Preservation: the deleted material is moved to \_history/, never
    > destroyed.

-   Cascade: every object whose references include the deleted material,
    > directly or transitively through Work Product citations, is
    > flagged reeval_pending with source: deletion (Section 5.4).
    > Deletion of cited material is never silent.

### 2.6 The pending-package queue

Sessions that cannot replace files in place (interactive chat, whose
substrate access is create-only) deliver write-backs as pending
packages: the complete updated files plus a PENDING_PROMOTION.json
manifest, written into the bundle folder (or handed to the operator to
place there). The queue is first-class store state with a complete
lifecycle, so that nothing ever lies around:

-   **Manifest shape.** { "target": , "base": \<sha256 of the bundle.md
    > the producing session bootstrapped from\>, "files": \[{ "name",
    > "sha256" }...\], "created": , "author": , "skill_version": }.
    > Package files are named .pending alongside the manifest so they
    > can never be mistaken for live files.

-   **Creation.** A package exists only after passing the gate in its
    > producing session. An unvalidated package is never written.

-   **Promotion.** Performed automatically by the next capable actor via
    > the Section 2.4 algorithm, subject to the Section 5.5 base check.
    > The repair is deterministic (gate-passed content, hash-verified
    > files), so automatic promotion is the default; group policy may
    > make it confirm-first.

-   **Consumption.** Promotion consumes the package: superseded live
    > files become the history snapshot, the manifest is archived as the
    > promotion record, package files become live files.

-   **Ordering and conflict.** Multiple pending packages on one bundle
    > promote in manifest-timestamp order within one claim. A hash
    > mismatch, or a base that no longer matches the live bundle, is
    > handled per Section 5.5; there is no auto-merge.

-   **Staleness.** A package unpromoted past policy age is a surfaced
    > finding, aging into urgency.

**The creation base (added v1.5).** A pending package that creates a
bundle has no prior bundle.md to hash. Its manifest's base field carries
the SHA-256 of the empty string
(e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855), the
recorded form of "no prior version." The promoter's base check applies
only when a live bundle.md exists, so the creation package promotes as a
fast-forward; the checker's C-17.1 likewise compares only against live
state. A queued creation folder scans as exactly one error, the missing
live bundle.md, which is the honest signature of a creation in flight;
the producing session's gate run over the package content is where
creation-time validation lives, per this section's creation rule (a
package exists only after passing the gate in its producing session).
Exercised in production by daemon first-captures and member
creation-by-packaging alike.

## 3. Universal frontmatter core

### 3.1 Core fields

Every bundle.md frontmatter carries exactly these core fields, at column
0, canonical names only:

id: PROB-2026-0007-acfr-opengov-mismatch

object_type: problem \# information \| problem \| project \| action

schema: problem@1 \# per-type schema version stamp

title: "ACFR transfers-out disagrees with OpenGov FY23-24"

current_state: elevated \# per-type state machine, Section 4

prior_state: surfaced \# previous state if a transition has occurred,
else null

created: "2026-07-09T18:00:00Z"

last_updated: "2026-07-09T21:40:00Z"

produced_by:

mode: interactive_agentic \# interactive_chat \| interactive_agentic \|
headless_agent

capability_tier: standard \# policy-defined, time-varying

group: believe-in-oakland \# producing group slug; travels with
distributed copies

references: \[\] \# typed edges, Section 5

state_history: \[\] \# append-only transition log, Section 3.4

annotations_open: 0 \# count of pending annotations; derived
convenience, checker-verified

reeval_pending: \# set by cascade events; cleared only by a recorded
re-evaluation

flag: false \# the boolean, unchanged in meaning

since: null \# ISO-8601 UTC instant the flag was set; null when flag is
false

source: null \# the cascade event that set it (deletion \| source_status
\| wp_retraction \| annotation); null when flag is false

visuals: \[\] \# description-as-truth entries when visuals exist

The per-type extension (Section 4) follows the core in the same
frontmatter block.

### 3.2 The dual-audience encoding

Every structured list item that humans read (problem statements,
deadline entries, premise-like registers, visual descriptions) uses the
{text, description} shape: text is the concise insider label,
description is the verbose explanation a newcomer can follow. Adopted
unchanged from Alpha Pipeline; it is also what powers the trust-signal
tooltips in the UX.

### 3.3 Drift defense (field and heading contract)

Imported from Alpha Pipeline as law:

-   Field names are canonical and exclusive. The checker maintains a
    > forbidden-alias table seeded with: status, state, pipeline_state,
    > verdict (all aliases of current_state); type (alias of
    > object_type); updated, modified (aliases of last_updated). The
    > gate auto-repairs known aliases and reports each repair as a
    > finding; new writes must use canonical names.

-   Every top-level key starts at column 0. The only indented lines are
    > array items and their properties. The checker scans specifically
    > for a top-level key absorbed into a preceding multi-line array.

-   Prose-section \## headings are literal, case-sensitive string
    > constants per type (Section 4). A non-matching heading is a
    > violation, not a stylistic variant.

-   Clean markdown only. No backslash escapes on markdown characters, in
    > any .md file in the store.

### 3.4 State history

state_history is an append-only array recording every current_state
transition:

state_history:

-   timestamp: "2026-07-09T21:40:00Z"

-   from_state: surfaced

-   to_state: elevated

-   blurb: "Cluster of three transfer-labeling problems elevated
    > together into PROJ-2026-0001."

-   author: claude

The blurb is one editorial sentence naming why the transition fired, not
a restatement of the transition. Entries are never modified
retroactively. This generalizes Alpha's ledger_state_history to all
types.

## 4. Per-type schemas and state machines

### 4.1 Information

Record files: data/*.json (extraction outputs in tidy/long form),
snapshots/* (raw captures: WACZ, PDF, exported datasets), optional
notes.md.

Extension fields:

criticality: crucial \# crucial \| supporting

classification: fact \# fact \| analysis \| judgment

source:

locator: "https://..." \# stable source locator (URL, docket, citation)

authority: "Oakland ACFR FY2023-24"

retrieved: "2026-07-09"

content_hash: "sha256:..." \# hash of the canonicalized normalized
dataset, not raw capture

source_status: unchanged \# unchanged \| modified \| removed

monitoring:

enabled: true

frequency: weekly \# hourly \| daily \| weekly \| monthly \| per_meeting
\| none

last_checked: "2026-07-09T12:00:00Z"

Lifecycle (current_state): collected → verified (hash recorded, snapshot
archived) → retired (superseded or no longer relevant; preserved, never
deleted).

source_status is an independent axis maintained by change detection: a
verified item whose source changes becomes source_status: modified with
both versions preserved in snapshots/ and a change record appended; a
removal becomes source_status: removed after the confirmation window,
flagged as potential concealment evidence. Source-status changes
propagate reeval_pending to every citing object, with source:
source_status.

Snapshot rule (from Tech Arch 7.2): a snapshot is the three-layer
capture keyed to a stable query definition: raw capture (evidentiary),
canonicalized normalized dataset (hashed and diffed), rendered view
(human evidence). Hash the normalized dataset.

Prose sections in bundle.md, exactly these headings: \## Summary, \##
Provenance Notes, \## Session Log, \## Review Notes.

**The intake provenance register (added v1.5).** An Information bundle
produced under the intake contract (Intake Doctrine Section 2) carries
data/provenance.json, the per-document provenance register, whose
presence declares the intake contract for the bundle (declared-contract
scoping, Section 8). Each entry in its documents array carries: file,
naming a capture that exists in the bundle (snapshots/ primarily);
locator, authority, and retrieved, all non-empty (locator may be "in
hand" with chain-of-custody detail in Provenance Notes for
member-original records); capture.method, capture.grade (A, B, or C per
the doctrine's capture-chain axis), and capture.actor_class (daemon,
session, or member); and origin.kind (named_request, sweep, or member),
with a sweep origin additionally carrying matched_sweep and
deeming_actor. Grade upgrades are accretive adds: a new register entry
lands beside the old, never replacing it. The register is documented
plain JSON per doctrine Section 3b: readable without software,
verifiable with stock tooling.

**Daemon-era register anatomy (added v1.5).** A register document
produced or extended by the M2' fetch layer carries, beyond the base
fields: capture.sha256, the lowercase hex SHA-256 of the raw captured
bytes, the identity the ring-once rule dedups on; capture.encoding, utf8
or base64, naming how the archived snapshot file holds the bytes;
corroborations, an append-only array of {locator, request, retrieved,
actor_class} records, each a later fetch whose normalized hash matched
this entry's capture (the ring-once mechanism: identical content is
corroboration on one entry, never a second review item); co_archive, the
Internet Archive locator, present only when Save Page Now succeeded;
timestamp, {authority, token_file, encoding, caveat?}, present only when
an RFC 3161 timestamp was obtained, with token_file naming the DER
TimeStampResp stored beside the capture base64-wrapped
(snapshots/.tsr.b64) because the pending byte pipe is UTF-8 text, and
caveat recording a fallback authority's non-OS-distributed CA; and
attestation_attempts, an array of {service, attempted, ok, note} records
covering every co-attestation attempt, success or failure. A failed
attestation degrades the capture to plain Grade B with the gap named in
the register, never blocks the capture, and never lies.

### 4.2 Problem

Record file: problem.md (statement, evidence discussion, analysis).

Extension fields:

surfaced_by: agent \# agent \| human

disposition_reason: "" \# required non-empty when deferred or dismissed

recheck_triggers: \# required non-empty for every Problem, all
dispositions

-   text: "FY2025-26 ACFR publication"

-   description: "Next ACFR shows whether the relabeled transfer pattern
    > continues."

-   date: "2026-12-15"

Lifecycle (current_state): surfaced → elevated \| deferred \| dismissed.
Dismissal and deferral are reversible: the object is greyed in the UX,
never deleted, and its recheck triggers stay live. An elevated Problem
must carry at least one elevated_into reference to a Project.

Graph edges: Problem-to-Problem relationships are relates_to references
with an edge status (proposed by the agent, confirmed or severed by a
human). Cluster membership is expressed purely through confirmed
relates_to edges; there is no separate cluster object.

Prose sections: \## Statement, \## Why It Matters, \## Open Questions,
\## Session Log, \## Review Notes.

### 4.3 Project

Record files: analysis.md (the cumulative analytical record, revised in
place, never a changelog), workproduct.md (the focused derived view,
once focusing begins).

Extension fields:

objective: "Establish whether post-FY21 Sewer Service Fund transfers
continue the unauthorized franchise fee under new labels."

workproduct_state: draft \# absent \| draft \| internally_checked \|
externally_compliant \| distributed

evaluations: \# results of Compliance and Argument Evaluation runs

-   kind: argument \# compliance \| argument

-   strictness: internal \# internal \| external

-   result: pass \# pass \| findings

-   timestamp: "2026-07-09T20:00:00Z"

-   findings_ref: "data/eval-0003.json"

Lifecycle (current_state): forming (Problems aggregating, scope
settling) → investigating → matured (analysis supports a defensible
position) → closed (with closed_reason: resolved, superseded, abandoned;
preserved, reversible).

The Work Product readiness ladder (workproduct_state) advances only on
recorded evaluations: internally_checked requires a passing
internal-strictness run of both evaluations; externally_compliant
requires passing external-strictness runs; distributed requires at least
one distribution record. Distribution (Section 4.5 mechanics) applies
the three-tier risk classification and snapshots archived primary-source
evidence into distributions/dist-NNNN/.

Prose sections: \## Thesis Summary, \## Open Questions, \## Ruled Out,
\## Session Log, \## Review Notes.

### 4.4 Action

Record file: action.md (plan, correspondence log, outcome record).

Extension fields:

action_kind: cpra_request \# extensible suite: cpra_request \|
grand_jury \| controller_referral \| public_comment \| media \|
litigation_support \| other

risk_tier: 1 \# 1 \| 2 \| 3, from the evidence-package classification

clock:

-   text: "CPRA 10-day statutory response"

-   description: "Gov. Code 7922.535 response deadline for request
    > 26-3028."

-   date: "2026-03-30"

-   basis: "Gov. Code 7922.535"

-   status: overdue \# pending \| met \| overdue \| waived

counterparty: "Oakland Finance Department, Controller's Bureau"

Lifecycle (current_state): planned → active → awaiting_response →
resolved (with resolution: complied, denied, escalated, withdrawn) \|
abandoned (reason-gated). The clock array is the authoritative deadline
register the Monitoring skill watches; every date-bearing entry carries
basis naming the statute, order, or commitment the date derives from.

Prose sections: \## Plan, \## Status, \## Correspondence, \## Session
Log, \## Review Notes.

### 4.5 Work Product (in-bundle derived view)

Not a peer bundle. workproduct.md lives in its Project or Action bundle
and observes:

-   Focused, legal-brief structure with progressive disclosure.

-   Fact/commentary firewall: every non-factual passage is explicitly
    > labeled commentary or narrative.

-   Source-grounding: every load-bearing claim carries a citation
    > resolving to an Information object reference plus its archived
    > snapshot and hash. The emission shape for the machine-checked
    > citation register (in data/citations.json) is:

{ "claim_id": "C-014",

"claim": "Transfers from the Sewer Service Fund continued in FY 2023-24
under cost-allocation labels.",

"cites": \["INFO-2026-0002-opengov-transfers-fy20-25"\],

"snapshot": "INFO-2026-0002/snapshots/opengov-fy24.json",

"hash": "sha256:...",

"as_of": "2026-07-01" }

The keys, not inline citations, satisfy the contract (the Alpha
sourced-v1 lesson verbatim: the gate reads keys). A claim that cannot
name its keystone sources is not a supported claim; it moves to
commentary or to Open Questions.

Distribution mechanics: a distribution freezes workproduct.md, the
citation register, and every cited snapshot into
distributions/dist-NNNN/ with its own manifest (audience: internal \|
external; risk tier; evaluation results attached as trust signals;
timestamp). Distributed copies are immutable; corrections happen
upstream and produce a new distribution, with the cascade flagging known
recipients' copies stale via the directory.

Incoming Work Products received from other groups are stored as
Information objects (classification: analysis, snapshots holding the
received package) and are subject to a locally recorded Argument
Evaluation before any citation of them: no transitive trust.

### 4.6 Annotation (in-bundle record)

One JSON file per annotation in the target bundle's annotations/:

{ "id": "PROB-2026-0007.ann-20260709T191200Z-bob",

"target_anchor": "problem.md#open-questions/OQ-3",

"author": "bob",

"created": "2026-07-09T19:12:00Z",

"state": "pending",

"text": "The FY24 number may include a one-time insurance true-up; check
note 14 of the ACFR before treating this as the pattern continuing.",

"response": null }

Lifecycle: pending → addressed. Addressing is performed by an agent
session that re-evaluates the anchored target in the annotation's light
and writes response (what was done, what changed, or why no change was
warranted) plus addressed_at and addressed_by. Annotations are never
edited or deleted after creation; a mistaken annotation is addressed
with a response saying so. Writing an annotation is an accretive add
through the bundle skill and does not promote the target bundle's state
surface; the annotations_open count refreshes on the target's next write
or checker scan. Annotation identity is collision-resistant per Section
1.2, so concurrent annotators never conflict.

Distinct from annotations, each bundle.md carries a \## Review Notes
prose section: immutable, human-authored, timestamped observations,
preserved verbatim forever, never summarized or reordered. Adopted
unchanged from Alpha Pipeline.

## 5. Reference model and write coherence

### 5.1 Typed edges

All cross-object relationships live in the references array of the
frontmatter core:

references:

-   rel: cites \# see relationship vocabulary

-   target: INFO-2026-0002-opengov-transfers-fy20-25

-   status: confirmed \# proposed \| confirmed \| severed

-   note: ""

Relationship vocabulary, closed until amended by this spec: cites
(evidence dependency), relates_to (Problem graph edge), elevated_into
(Problem to Project), initiates (Project to Action), derived_from
(successor or reopened lineage), supersedes. New relationship kinds
require a spec revision, not an inline invention; the checker rejects
unknown values.

### 5.2 Direction and ownership

Each edge is written on the object that depends on or points to the
target, and the reverse direction is derived by the index, never
hand-maintained. cites lives on the citing object. elevated_into lives
on the Problem. initiates lives on the Project.

### 5.3 Substrate independence

No Drive file ID, URL-to-substrate, or path appears in any reference or
any bundle content as a link between objects. External-world locators (a
city URL, a statute citation) appear only inside Information source
blocks, where they denote the outside source itself. The index
(index/index.json) maps canonical IDs to current substrate locators and
the full derived reverse-edge graph; it is regenerable, per-group, and
never authoritative.

### 5.4 Cascade semantics

A cascade event is any of: gated deletion (2.5), an Information
source_status change, an upstream Work Product retraction or
re-distribution, or an annotation addressed with a substantive change.
The cascade walks derived reverse edges from the changed object and sets
reeval_pending on every dependent, one hop at a time: flag: true, since
the current ISO-8601 UTC instant, and source naming the cascade event.
Each dependent's own re-evaluation decides whether to propagate further
(source-grounding makes each hop locally verifiable, so there is no
forced transitive walk). reeval_pending is cleared only by a recorded
re-evaluation (an evaluations entry, an addressed annotation, or a
state-history blurb naming the review), which resets the record to flag:
false with since and source returned to null. Because since records when
the flag was set, the checker enforces the staleness rule mechanically:
a flag: true whose since is older than the policy-set age is a surfaced
finding.

### 5.5 Multi-writer coherence (added v1.1)

Because writers cannot lock the substrate, write coherence is optimistic
and base-stamped:

-   **Base recording.** Every session records at bootstrap the SHA-256
    > of the bundle.md it started from. Every write-back carries that
    > base: pending-package manifests carry it in the base field;
    > promoting-mode write-backs record it in the history manifest entry
    > written at promotion.

-   **Write classes.** Accretive adds (annotation records, Session Log
    > appends, state_history appends, deletion records, distribution
    > folders, history snapshots) are conflict-free by construction
    > under collision-resistant identity and require no base check
    > beyond their own naming rules. Substantive writes (the state
    > surface, record files, data files) are base-checked at promotion.

-   **The divergence ladder.** At promotion, compare the write-back's
    > base to the live bundle.md hash. (1) **Fast-forward:** base
    > matches; promote normally. (2) **Disjoint-auto:** base does not
    > match, but the diverged write-back and the intervening
    > promotion(s) touched disjoint file sets, verified by hash
    > comparison against history; apply the write-back in sequence,
    > recording both bases in the manifest chain. The classification is
    > mechanical (check C-17.2) and its semantics are fixed here (added
    > v1.4). The write-back's base is anchored in the recorded history
    > chain by either legitimate form: an entry's recorded base, or the
    > bundle.md after-hash carried in a verbatim promotion record, with
    > the latest anchor preferred when both match. Disjointness is then
    > verified at file granularity against the union of every
    > intervening promotion's file set. A base that anchors nowhere, a
    > chain with missing or unreadable promotion records, or a base that
    > anchors at the chain tail while live content differs (an
    > unrecorded live edit) classifies adjudicated, never auto-applied.
    > The disjoint-auto promotion's history manifest entry records base
    > (the write-back's recorded base), applied_over (the live bundle.md
    > hash the write-back was actually applied over), and rung:
    > disjoint-auto; this is the mechanical form of I-17's both-bases
    > requirement. The classifier is one shared implementation in the
    > check codebase, called by the gate's C-17.2 and by every promoter
    > that classifies; a promoter never carries its own. (3)
    > **Adjudicated:** overlapping substantive divergence; never
    > auto-merged. It surfaces as a finding whose sanctioned repairs are
    > rebase (a reconciliation session takes the live bundle and the
    > diverged write-back as inputs and re-evaluates, the same
    > re-evaluation primitive annotations and the cascade already use),
    > supersede (a human selects one; the other is preserved in
    > \_history/ as a diverged-branch record, accretive as always), or
    > apply-disjoint where re-examination shows the overlap was
    > illusory.

-   **Editing presence (advisory).** A session may write a presence
    > marker (actor, started-at) at bootstrap so the client and other
    > sessions can surface "a session has been working on this bundle
    > since T" and humans coordinate socially. Presence markers are
    > advisory, stale-expired, and never load-bearing; safety comes from
    > the ladder, not the marker.

-   **Scope.** This resolves write-back coherence at the kernel level.
    > Real-time co-editing and automatic sub-file merge remain a
    > sync-engine concern (Tech Arch Section 12); a sync engine would
    > replace the mechanics of rungs 1 and 2, never the policy of rung
    > 3.

## 6. Invariant set

Each invariant is numbered, mechanically checkable, and mapped to
repairs in Section 7.

**I-1 Canonical identity.** Every bundle folder name equals its
frontmatter id; every ID matches the grammar (including the v1.1
annotation form); IDs are unique within the store; IDs and slugs never
change.

**I-2 Frontmatter contract.** Core fields present with canonical names;
no forbidden aliases; all top-level keys at column 0; schema stamp
present and known.

**I-3 Heading contract.** Every bundle.md contains exactly the required
\## prose sections for its type, verbatim and case-sensitive; no
invented sections.

**I-4 State legality.** current_state is a legal value for the type;
every transition recorded in state_history is a legal edge in the type's
state machine; prior_state matches the last transition.

**I-5 Append-only surfaces.** state_history, Session Log, Review Notes,
annotations, \_history/, deletion records, and distributions are
append-only. Review Notes are verbatim-immutable.

**I-6 Reference integrity.** Every reference target resolves to an
existing canonical ID (or to a preserved retired object); rel values are
from the vocabulary; no substrate locators in references; required edges
exist (elevated Problem has elevated_into; distributed Work Product has
a distribution record).

**I-7 Accretive discipline.** No content removal outside the gated
deletion path; every deletion record carries reason, preservation
pointer, and cascade flags set on dependents.

**I-8 Source-grounding.** Every load-bearing claim in a Work Product at
internally_checked or above has a citation-register entry with resolving
cites, snapshot, hash, and as_of keys; every verified Information object
has a snapshot and a hash that matches its normalized dataset.

**I-9 Evaluation gates.** workproduct_state advances only with the
recorded passing evaluations Section 4.3 requires; every accepted
incoming Work Product has a local Argument Evaluation record (no
transitive trust).

**I-10 Cascade hygiene.** Every cascade event set reeval_pending (flag
true, since stamped, source named) on all direct dependents; no
reeval_pending is cleared without a recorded re-evaluation (record reset
to flag false, since/source null); none with flag: true has a since
older than policy age without a surfaced finding. The since field makes
the age clause mechanically checkable (check C-10).

**I-11 Clock discipline.** Every Action clock entry has a basis and a
valid date; overdue entries are marked overdue, not silently stale.

**I-12 History coherence.** \_history/manifest.json entries are
sequenced, complete, and every referenced snapshot file exists; the
current bundle.md is newer than the last manifest entry; no torn
promotion residue (frontmatter hash references resolve to live files).

**I-13 Write completeness.** Written files are complete documents (never
diffs or partials); last_updated refreshed on every write; a Session Log
entry accompanies every write-back.

**I-14 Format hygiene.** Clean markdown, no escape drift; filenames
match the naming rule; JSON files parse; visuals in the visuals array
exist on disk and vice versa.

**I-15 Recheck coverage.** Every Problem, in every disposition including
dismissed, carries at least one recheck trigger; time-bound triggers
carry dates.

**I-16 Queue integrity (added v1.1).** Every pending package has a
well-formed manifest with target, base, hashed file list, timestamp, and
author; every listed file exists with a matching hash; every package
passed the gate at creation (attested by its manifest's skill-version
marker); no package is older than policy age without a surfaced finding;
promotion consumed its package (no orphaned .pending files or manifests
after the promotion record exists).

**I-17 Base coherence (added v1.1).** Every substantive write-back
records its base; every promotion either fast-forwarded from a matching
base, applied under verified disjointness with both bases recorded, or
carries a divergence-resolution record (rebase, supersede, or
apply-disjoint). A promotion over a non-matching base with none of these
is a violation. Diverged branches are preserved, never discarded.

**I-18 Release authority (added v1.5).** On every Information bundle
carrying the intake provenance register: the register is well-formed per
Section 4.1; every collected-to-verified transition in state_history is
authored by a named member identity, never a surface or AI identity; and
a bundle any of whose register entries carries a sweep origin never
stands at or beyond verified without a member-authored
collected-to-verified transition (the ratification fence: sweep intake
lands at collected, never higher; human ratification is the
collected-to-verified transition, made per-document after intake).
Staged honestly per the doctrine's 4a: today a member identity is
mechanically any named identity outside the closed surface-and-AI set
(exported as NON_MEMBER_AUTHORS from the check module); the rule
tightens to authenticated-member when the engagement layer adds
per-member credentials, changing the invariant's evidence, never its
meaning. Declared-contract scoping: the register's presence is the
declaration, C-18.1 enforces only on declaring bundles, and pre-contract
bundles keep validating against the contract they declared. Store-wide
bindingness arrives with the schema bump (information@2) that makes the
register mandatory for new bundles; that bump is deliberately not made
here, since the member-submission rung (M3') will force the register's
final member fields and one migration is better than two.

**I-19 Expunge integrity (drafted v1.5; enters with its check).**
Expunge is the one sanctioned exception to the append-only history law,
the mechanism by which the may-not-hold rail and the redaction rule's
destruction branch become executable against immutable history (Intake
Doctrine 1a, 4a). Drafted contract: expunged content is removed from
live state and from \_history/ and replaced, at each removed file's
position in the accounting, by a tombstone record {expunged: true,
timestamp, authority (a named member, under the I-18 identity rule),
reason_class (unlawful \| confidential \| recorded-decision), affected
files with their former hashes, original manifest key}. The history
manifest entry for the expunged promotion is annotated, never deleted;
C-12.2's snapshot accounting accepts a tombstone in place of the removed
bytes and only there; a history gap without a tombstone remains the
violation it always was. The tombstone carries the fact and the
authority of removal, never the content. Expunge of cited material
cascades reeval_pending exactly as gated deletion does. Per the
Mechanical Verification Law: this invariant enters the ratified set only
together with its executable check family (C-19), which arrives when the
expunge operation is built; until then it binds nothing and the
append-only law stands whole. The draft exists so the operation is built
to a stated contract rather than improvised against one.

**I-20 Mechanical-writer conformance (added v1.5).** A promotion whose
manifest carries writer: "mechanical" and an operation name changed,
relative to the immediately prior recorded snapshot, only frontmatter
fields within that operation's declared field set, confined any body
change to the Session Log section, and touched only the mechanical
envelope (bundle.md, snapshots/, and the append-only data/changes.json
and data/provenance.json). A mechanical creation (base is the
empty-string SHA, or no prior snapshot exists) lands at collected and
never higher. An undeclared operation name on a mechanical promotion is
itself a violation. The declared field sets are the registry's tables,
living in the check codebase as MECHANICAL_FIELD_SETS (exported and
shared, through the embedded gate, with the accelerator daemon: one
codebase) and amended only by revision, never by code change:
monitor-tick may change source_status, monitoring.last_checked, the
reeval_pending record fields, and last_updated; sweep is creation-only
with no mutation of existing bundles; deadline-recheck may change clock
entry status and last_updated. last_updated rides every mutating set
because the write-completeness law makes it inseparable from any update;
it is not a separate permission but a consequence of writing at all.

## 7. Violation-to-repair mapping

The checker never free-edits and never offers free-form fixes. Each
violation maps to a closed set of sanctioned repairs; a human picks one;
the repair is itself a logged, skill-mediated write. Illegal states stay
unreachable with no server policing them.

  -----------------------------------------------------------------------
  **Invariant**           **Detected violation**  **Sanctioned repairs**
  ----------------------- ----------------------- -----------------------
  I-1                     Folder/ID mismatch or   \(a\) restore folder
                          malformed ID            name from frontmatter
                                                  id; (b) restore
                                                  frontmatter id from
                                                  folder name, if history
                                                  confirms it

  I-1                     Duplicate annotation ID \(a\) adjust the later
                          (same second, same      record's timestamp
                          author)                 suffix by one second,
                                                  logged

  I-2                     Forbidden alias or      \(a\) rename to
                          indented top-level key  canonical key; (b)
                                                  re-indent to column 0.
                                                  Auto-repairable, always
                                                  reported

  I-3                     Missing/paraphrased     \(a\) insert canonical
                          heading                 heading with empty
                                                  body; (b) rename
                                                  paraphrased heading,
                                                  preserving body

  I-4                     Illegal state or        \(a\) append corrective
                          unrecorded transition   state_history entry
                                                  restoring last legal
                                                  state; (b) legalize via
                                                  the missing
                                                  intermediate
                                                  transition,
                                                  human-authored blurb
                                                  required

  I-5                     Mutated append-only     \(a\) restore from
                          surface                 \_history and re-append
                                                  new material; (b) if
                                                  history lacks the
                                                  original, record a
                                                  tamper finding (not
                                                  repairable silently)

  I-6                     Dangling reference      \(a\) restore target
                                                  from history; (b)
                                                  re-point to the
                                                  successor object
                                                  (derived_from chain);
                                                  (c) sever the edge with
                                                  a reason note

  I-6                     Unknown rel value       \(a\) map to nearest
                                                  vocabulary value; (b)
                                                  sever with reason

  I-7                     Untracked removal       \(a\) restore removed
                          detected by history     material; (b) convert
                          diff                    to a gated deletion
                                                  retroactively: reason,
                                                  preservation, cascade

  I-8                     Claim missing citation  \(a\) supply keys
                          keys                    resolving to an
                                                  Information object; (b)
                                                  demote claim to
                                                  commentary; (c) move
                                                  claim to Open Questions

  I-8                     Hash mismatch on        \(a\) re-capture
                          snapshot                source, preserve both,
                                                  set source_status
                                                  modified, cascade; (b)
                                                  mark snapshot corrupt,
                                                  restore from mirror,
                                                  verify

  I-9                     workproduct_state ahead \(a\) run the missing
                          of evaluations          evaluation; (b) demote
                                                  workproduct_state to
                                                  the highest earned rung

  I-9                     Incoming WP cited       \(a\) run Argument
                          without local           Evaluation now; (b)
                          evaluation              sever the citation
                                                  until evaluated

  I-10                    Stale reeval_pending    \(a\) perform and
                                                  record the
                                                  re-evaluation; (b)
                                                  record an explicit
                                                  accept-risk note
                                                  (policy-permitting),
                                                  which surfaces in trust
                                                  signals

  I-11                    Clock entry without     \(a\) supply basis; (b)
                          basis, or silently      mark overdue; (c) mark
                          past-due                waived with reason

  I-12                    Manifest gap or missing \(a\) rebuild manifest
                          snapshot                entry from surviving
                                                  files; (b) record a
                                                  history-loss finding
                                                  and re-snapshot current
                                                  state

  I-12                    Torn promotion residue  \(a\) re-run the
                                                  convergent promotion
                                                  from the surviving
                                                  package or history;
                                                  deterministic, always
                                                  safe

  I-13                    Partial write or        \(a\) complete the
                          missing Session Log     write from the on-disk
                                                  working copy; (b)
                                                  append the missing
                                                  Session Log entry
                                                  naming the gap

  I-14                    Escape drift, bad       \(a\) normalize
                          filename, unparsable    markdown; (b) rename
                          JSON                    file and update
                                                  references; (c) restore
                                                  JSON from history

  I-15                    Problem without recheck \(a\) author a trigger,
                          trigger                 dual-audience shape,
                                                  dated when time-bound

  I-16                    Malformed manifest or   \(a\) discard the
                          hash-mismatched package package with a finding
                          file                    to the producing author
                                                  (never promote); (b)
                                                  re-produce the package
                                                  from the originating
                                                  session's outputs

  I-16                    Unreadable (unparsable) \(a\) discard the
                          manifest                manifest and converge
                                                  (auto; performed by any
                                                  promoter; nothing
                                                  recoverable is lost);
                                                  surviving .pending
                                                  files then surface
                                                  under the
                                                  orphaned-pending row

  I-16                    Stale unpromoted        \(a\) promote now; (b)
                          package                 discard with reason if
                                                  superseded, preserving
                                                  the manifest as a
                                                  record

  I-16                    Orphaned .pending files \(a\) complete
                          after promotion         consumption: archive
                                                  manifest, delete
                                                  consumed files
                                                  (idempotent)

  I-17                    Divergent base,         \(a\) apply in sequence
                          disjoint file sets      with both bases
                                                  recorded
                                                  (auto-eligible)

  I-17                    Divergent base,         \(a\) rebase via a
                          overlapping files       reconciliation session;
                                                  (b) supersede: human
                                                  selects one, the other
                                                  preserved as a diverged
                                                  branch in \_history;
                                                  (c) apply-disjoint if
                                                  re-examination shows no
                                                  true overlap

  I-18                    Release transition      \(a\) a named member
                          authored by a surface   re-makes the release
                          or AI identity          decision and records
                                                  the transition under
                                                  their identity; (b) the
                                                  bundle returns to
                                                  collected pending
                                                  member ratification

  I-18                    Sweep-origin bundle     \(a\) set current_state
                          above collected without to collected pending
                          member ratification     ratification; (b) a
                                                  named member ratifies
                                                  and records the
                                                  collected-to-verified
                                                  transition

  I-18                    Register malformed or   \(a\) re-produce the
                          naming absent captures  register from the
                                                  producing session's
                                                  capture record; a
                                                  register is never
                                                  hand-patched into
                                                  plausibility

  I-20                    Mechanical promotion    \(a\) revert the
                          outside its declared    out-of-envelope change;
                          field set, body         (b) if the change is
                          confinement, or         legitimate, it belongs
                          envelope                to a member-authored
                                                  promotion, not a
                                                  mechanical one

  I-20                    Mechanical promotion    \(a\) a mechanical
                          naming an undeclared    promotion must name a
                          operation               registered operation;
                                                  (b) if hand-authored,
                                                  remove the mechanical
                                                  marker

  I-20                    Mechanical creation     \(a\) re-produce the
                          above collected         creation at collected;
                                                  (b) if a member
                                                  released it, the
                                                  release must be a
                                                  separate
                                                  member-authored
                                                  promotion
  -----------------------------------------------------------------------

## 8. The Mechanical Verification Law

Production experience on the Alpha Pipeline established that a correct
prose contract does not reliably produce conforming output; only a
mechanical check run against the written artifact does. Therefore:

-   Every invariant in Section 6 has an executable check with a stable
    > check ID (C-1 through C-20, subdivided as needed; C-16 covers the
    > queue-integrity family, C-17 the base-coherence family, C-18 the
    > release-authority and register-integrity family, and C-20 the
    > mechanical-writer family). As of bio-checks 1.9.0 (July 18, 2026)
    > this law is discharged for every entered invariant: I-1 through
    > I-17 as at 1.7.0 (C-17 subdivided as C-17.1 fast-forward
    > eligibility and C-17.2 disjointness auto-classification, whose
    > classifier is shared code with every classifying promoter per
    > Section 5.5); I-18 through C-18.1 (release authority whole:
    > register shape, release-transition authorship, the ratification
    > fence, scoped by declared contract), with the register-integrity
    > extensions C-18.3 (error: a capture.sha256 appearing in more than
    > one register document is a missed corroboration, repaired by
    > folding the duplicates into corroborations on the earliest entry),
    > C-18.4 (warn: a crucial-criticality document whose register entry
    > carries neither co_archive nor timestamp, so the reviewing member
    > verifies co-attestation before releasing crucial or contested
    > material), and C-18.5 (error: the data/gathering.json field
    > grammar, the bound that lets the due-slate exporter render these
    > fields as quoted data a leaked write token can litter but never
    > use to steer a member's session); and I-20 through C-20.1 (error:
    > field-set conformance, body-change confinement, envelope
    > confinement, and the mechanical-creation-at-collected rule, read
    > from the history snapshots and the verbatim promotion records).
    > I-19 is drafted and unentered; its C-19 family arrives with the
    > expunge operation. The C-18.2 slot is reserved for the
    > verified-requires-Grade-B-or-better floor, recorded and
    > deliberately not entered.

-   The bundle skill runs the applicable check set against written files
    > after every write, before presenting or promoting anything, and
    > includes the PASS/FAIL output in its response. FAIL means fix and
    > re-run; files are never delivered on FAIL.

-   The client-side consistency checker runs the same check
    > implementations at scan time across the whole store, and the
    > accelerator carries the same codebase through the embedded gate
    > (build-time byte-verbatim propagation, hash-verified at compile,
    > verdict-parity asserted by conformance on every build). One check
    > codebase, three call sites: the session gate, the client checker,
    > and the accelerator. Divergence among them is itself a defect. The
    > daemon gates its own packages at packaging; per the July 20
    > operator decision (Tech Arch v10 Section 10.11), the promoter
    > additionally runs the gate on non-mechanical manifests,
    > implementation at accelerator 0.10.3, so the store enforces its
    > own contract rather than assuming producer discipline.

-   Checks are versioned with the schema stamps: a check enforces a rule
    > only on bundles whose schema stamp declares a version that carries
    > the rule. Old bundles keep validating against their declared
    > version. Schema migration is an explicit, skill-mediated,
    > history-preserving rewrite that bumps the stamp.

## 9. Write protocol obligations (summary binding on the bundle skill)

The bundle skill specification restates these in full; the spec-level
obligations are:

-   Read-at-start: bootstrap from bundle.md (inline or substrate read),
    > record the base hash, persist working copies to local disk
    > immediately, surface state before substantive work, verify
    > frontmatter against the index and flag mismatches, and promote any
    > pending packages first when operating in a promoting mode.

-   Continuous checkpoint: apply accumulated changes to on-disk working
    > copies at natural save points via targeted edits, never whole-file
    > rewrites from memory.

-   Save-and-close: complete files, refreshed last_updated, Session Log
    > entry, Review Notes verified intact, then either convergent
    > promotion (promoting modes) or a gate-passed pending package
    > carrying the base (packaging mode), with the mechanical check set
    > PASS before delivery in every mode.

-   Single write authority: all writes to the store, including
    > annotations, deletions, distributions, packages, promotions, and
    > repairs, go through the bundle skill (or, for promotion mechanics
    > only, an actor running the identical convergent algorithm). Reads
    > are open to all skills.

## 10. Deviations from Alpha Pipeline, recorded

For the avoidance of archaeology later: BIO drops the server-side
watcher (promotion is performed by any capable actor via one convergent
algorithm, with accelerators as standard off-kernel equipment), the
Ledger (replaced by the regenerable index), lifecycle folder moves
(state is frontmatter-only), the exclusive session lock (write coherence
is optimistic and base-stamped, with advisory claims and presence
markers that are never load-bearing), and the two-file fixed shape
(replaced by per-type anatomy). BIO adopts unchanged: the three
obligations, on-disk working copies with range reads, edit-in-place
discipline, \_history/ with manifest, the drift defense, heading
constants, {text, description} encoding, description-as-truth visuals,
append-only session logs, immutable Review Notes, generalized state
history with editorial blurbs, the schema-stamp evolution pattern, the
10-minute stale threshold for advisory claims, and the mechanical
pre-delivery gate.

*Spec version 1.3, July 11, 2026. Companion to
BIO_Technical_Architecture_Decisions v8 and
BIO_Bundle_Skill_Composite_Design v1.5. Supersedes v1.2.*
