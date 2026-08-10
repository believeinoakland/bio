# Believe in Oakland

> **Editorial note, July 27, 2026 (Bob's directive):** the construct formerly
> named **Problem** is renamed **Focus** throughout, which conveys its purpose
> non-judgmentally. Machine literals shown here use the target vocabulary
> (`focus`, `focus@1`, `focuses/`, `focus.md`); the legacy literals (`problem`,
> `problem@1`, `problems/`, `problem.md`) remain valid aliases in existing
> append-only history and in code until the rename arc lands.

# Bundle Skill Composite Design

Working Document, v1.7, July 2026

> # ⚠ SUPERSEDED IMPLEMENTATION, INHERITED FORMAT
>
> **Banner added 2026-08-10 (session BOB), moving into this file what
> `architecture/README.md` has said about it since July and no reader of this document
> alone could see.**
>
> The RUNTIME here — an Apps Script accelerator assembling per-mode skill products and
> draining a pending-package queue — was replaced by the Cloudflare plane. **The BUNDLE
> FORMAT, the promotion semantics, and the C-series check catalog this document
> specifies are what the plane implements and must continue to satisfy.**
>
> **Read it for the format and the checks, not for the runtime.** The catalog itself is
> live at `bio-plane/checks/bio-checks.mjs`, hash-verified, and the gate RUNS it rather
> than reimplementing it.

## 0. Purpose and governing documents

This document is the design for the composite bundle skill: the single
write authority for the BIO data store. It specifies the component
inventory, the component taxonomy, the products assembled for each
execution mode, the loading discipline, the check codebase, the
write-delivery paths, token budgets, and the assembly and versioning
model. It is the bridge between specification and implementation:
BIO_State_Rules_Consistency v1.5 defines what the skill must enforce;
this document defines how the skill is structured to enforce it across
three execution modes without ever loading more than a session needs.

Where this document and the State Rules spec disagree on data-store
rules, the spec governs. Where this document and
BIO_Technical_Architecture_Decisions v10 disagree on architecture, the
Tech Arch governs. This document governs the bundle skill's internal
structure.

Prior art: the Alpha Pipeline bundle skill (v2.21) and the Alpha
Pipeline Framework README (v4.34), studied July 2026. Design lessons
adopted from them are cited inline; deviations are recorded in Section
10.

**Revision note (v1.7).** Minted July 20, 2026 at bio-bundle rev 0.1.48
(bio-checks 1.9.0, accelerator 0.10.2, client 0.7.0), folding the M2'
daemon build and live fire, which this document predated entirely at
v1.6. (a) Section 9's one-codebase contract extends from two call sites
to three: the embedded gate propagates checks.js byte-verbatim into
promotion-service.gs at build time (assemble.py embed-gate,
hash-verified at compile, verdict-parity asserted by conformance on
every build over both PASS and FAIL fixtures), retiring v1.6's
accelerator caveat; the daemon gates its own packages at packaging, and
per the July 20 operator decision (Tech Arch v10 Section 10.11) the
promoter additionally gates non-mechanical manifests, implementation at
accelerator 0.10.3. (b) Section 8 records the daemon as a third
packaging surface, a mechanical writer under the I-20 field-set fence,
and defines skill_version as the writer's component version (the daemon
writes the accelerator version; a session or the client writes the
composite), matching all existing records. (c) Section 2's inventory
gains the M2' build-emergent components: the daemon operation cores in
promotion-service.gs, accelerator/test/daemon-conformance.mjs (85
assertions including the interruption-recovery and cascade-ordering
sections, count verified against an actual run), the client's
daemon-view.js with its battery, and the intake battery;
accelerator/postpkg.py (the packaged POST-with-sha-verification write
helper) is recorded as a planned component entering at the next
composite bump. (d) The check codebase stands at bio-checks 1.9.0 with
the C-18 family and C-20.1. Companion references update to State Rules
v1.5, Tech Arch v10, and BIO_Intake_Doctrine v1.0, which joined the
document set after v1.6.

**Revision note (v1.6).** Two ratifications from the Phase 1 client
ladder (bio-bundle rev 0.1.20 through 0.1.29). (a) The Section 9
one-codebase contract extends to the divergence-ladder classifier:
classifyDivergence lives in bio-checks as the single implementation of
the spec Section 5.5 rung semantics, called by the gate's C-17.2 and by
every promoter that classifies (the client promoter today); no promoter
carries its own. (b) Section 8 records the client as a second packaging
surface: the PWA writes gate-passed packages through the admitted
endpoint slate with the manifest strictly last, carrying author (the
pwa-client caller class) and skill_version (the client version) so store
provenance names the producing surface, with Edit provenance-gated to
dockets freshly synced from the live endpoint. Companion references
update to State Rules v1.4 and Tech Arch v9.

**Revision note (v1.5).** The build order of Section 11 has been
executed in full (July 10-11, 2026, bio-bundle 0.1.0, bio-checks 1.3.1);
Section 11 now records outcomes and the remaining operator items. The
component inventory gains the build-emergent components:
core/promote-reference.js (axiomatic; the executable statement of the
spec 2.4 convergent algorithm, the conformance target for the client and
accelerator implementations), accelerator/test/conformance.mjs (the
algorithm-identity harness: it executes the actual .gs source under node
and asserts byte-identical bundle trees against the reference; it is the
rebuild-together rule's enforcement mechanism), accelerator/DEPLOY.md
(the Product D one-step group-setup guide), derivatives/product-c.js
(the Product C profile emitter), and assemble.py's extract-runner
subcommand (the Product B round-trip operation). Determinism is a hard
assembly rule: products carry no timestamps or environment data, and
assemble.py --verify proves byte-for-byte reproducibility on demand.
Check C-16.5 added (stale advisory claims and presence markers surfaced
with deletion as the repair; info severity, never load-bearing,
completing the nothing-lies-around commitment of v1.2).
Requirements-traceability audit recorded: sixteen of seventeen
invariants carry executable checks; I-10's age check is deferred pending
a spec v1.2 decision (below); I-17's disjointness auto-classification
awaits the client ladder. Spec v1.2 candidates queued for ratification:
reeval_pending becoming {flag, since, source} (unblocks C-10's age
check), and Section 2 anatomy listing the transient advisory files
(PROMOTING-*.json, PRESENCE-*.json).

**Revision note (v1.4).** Multi-writer editing coherence resolved
(optimistic, base-stamped, three-rung divergence ladder; spec Section
5.5). The accelerator became dual-mode: time trigger plus a web endpoint
bound to trigger-only semantics as a hard rule. The spec amendments
carried by earlier revisions were published in spec v1.1.

**Revision note (v1.3).** Promotion concurrency designed in:
convergence, not exclusion (deterministic naming, commit-point write
order, idempotent consumption, advisory claim). The accelerator reframed
from optional extension to standard off-kernel component. Accretive-add
identity made collision-resistant.

**Revision note (v1.2).** The pending-package mechanism elevated to a
first-class queue with a defined lifecycle. A dedicated watcher process
rejected for the kernel. Checks-module durability made explicit:
designed to run unmodified for years, schema evolution the only planned
change vector, additive by construction.

**Revision note (v1.1).** Check codebase changed to plain JavaScript
with JSDoc annotations. Chat mode changed to packaging-only.

## 1. Requirements the design must satisfy

Collected from the governing documents:

-   **Single write authority, composite structure.** One skill performs
    > every store write. An always-on core carries the universal
    > protocol; per-type schemas load on demand for the one type being
    > written (Tech Arch Section 3). Annotation, Work Product, and
    > distribution writes are operations on a containing bundle.

-   **The three obligations.** Read-at-start with base recording and
    > persist-to-disk, continuous checkpoint, save-and-close with
    > convergent promotion or gate-passed packaging (spec Section 9).

-   **The full drift defense.** Canonical field names with a
    > forbidden-alias table, the column-0 rule, literal heading
    > constants per type, clean markdown (spec Section 3.3).

-   **The Mechanical Verification Law.** Every invariant has an
    > executable check; the pre-write gate and the client-side
    > consistency checker run the same check implementations; checks are
    > versioned with schema stamps; nothing is delivered on FAIL (spec
    > Section 8).

-   **Three execution modes.** The same methodology must run as
    > interactive chat (claude.ai project), interactive agentic (Claude
    > Code / Cowork), and headless agent (Agent SDK), with the headless
    > mode token-budgeted (Tech Arch Sections 6 and 10.3).

-   **Token discipline.** No session loads the whole skill. Dispatcher
    > loads the minimal set; progressive disclosure everywhere; lean
    > derivatives for agents; on-disk working copies with range reads
    > (Tech Arch Section 10.3).

-   **Substrate reality.** Drive is the default substrate with git/OSF
    > mirrors; substrate locators never link objects; there is no server
    > and no locking primitive, so promotion safety comes from
    > convergence and write coherence from base stamps (spec Sections
    > 2.4 and 5.5).

-   **Constrained repair.** The skill executes only sanctioned repairs
    > from the spec's violation-to-repair table, never free edits (spec
    > Section 7).

## 2. Component inventory and folder structure

bio-bundle/

├── README.md governing doc for this folder; carries the build-state
ledger

├── assemble.py deterministic builder; COMPOSITE_VERSION constant;
--verify

│ (byte-for-byte reproducibility) and extract-runner (the

│ Product B round-trip operation) subcommands

├── core/

│ ├── bio-bundle-core.md axiomatic always-on core (the SKILL.md body)

│ └── promote-reference.js axiomatic executable statement of the
convergent promotion

│ algorithm (spec 2.4); conformance target for client + accelerator

├── types/

│ ├── INFORMATION.md Information schema: fields, states, snapshots,
hashing rule

│ ├── FOCUS.md Focus schema: triage machine, graph edges, recheck
triggers

│ ├── PROJECT.md Project schema: lifecycle, evaluations, workproduct
ladder,

│ │ citation register

│ └── ACTION.md Action schema: lifecycle, clock discipline, risk tier

├── operations/

│ ├── ANNOTATION.md write and address annotations; anchor grammar

│ ├── DISTRIBUTION.md freeze a Work Product; risk tiering; evidence
packaging

│ ├── DELETION_CASCADE.md gated deletion; cascade flag propagation

│ └── REPAIR.md executing sanctioned repairs from checker findings

├── checks/

│ ├── bio-checks/ plain-JavaScript check module (the one check codebase)

│ │ ├── package.json module metadata only; no build step, no
dependencies

│ │ ├── src/checks.js check implementations (JSDoc typed, // \@ts-check;
imports

│ │ │ nothing, touches no node-only API: browser-importable by

│ │ │ construction, audited)

│ │ ├── src/catalog.json declarative check catalog: id, invariant,
types, schema versions

│ │ └── src/cli.js node CLI (gate call site); --store enables reference
resolution

│ └── CHECKS.md human-readable catalog; versioning rules; fixture
registry

├── accelerator/

│ ├── promotion-service.gs Product D: pure convergent core + thin Apps
Script bindings;

│ │ time trigger + trigger-only doGet; strict pre-work token check;

│ │ invocation log at index/invocations.jsonl

│ ├── DEPLOY.md one-step group deployment; token distribution and
rotation

│ └── test/conformance.mjs executes the .gs source under node; asserts
byte-identical

│ end states vs promote-reference.js; structural endpoint greps

├── derivatives/

│ ├── bio-bundle-agent-brief.md lean headless derivative of the core
(37% of core size);

│ │ mechanical derivation audit asserts every load-bearing

│ │ constant survived

│ └── product-c.js Product C profile emitter: brief + one type schema
into

│ context; gate and promoter as execute-only paths

├── fixtures/ standing regression set (one conforming bundle, one

│ 11-violation bundle, one healthy-pending-package bundle)

├── demo-store/believe-in-oakland/ the sewer-fund exemplar store: the
full pipeline as real,

│ gate-passing, cross-referenced objects

└── dist/ assembled products (regenerable; never edited directly)

├── product-a/bio-bundle/ agentic Skill package

└── product-b/bio-bundle-consolidated.md

Measured sizes at 0.1.0: core 14.2KB, agent brief 5.2KB (37%), type
schemas 2.7-7.1KB, operations 1.2-1.8KB, checks module \~40KB of
JavaScript (executed, never loaded into context), consolidated \~100KB
(chat-mode flat-rate physics), accelerator 274 lines of Apps Script.

## 3. Component taxonomy

Adopted from the Alpha Framework README: every file is either
**axiomatic** (source of truth, edited directly when the design evolves)
or a **first-level derivative** (purpose-built for a constrained
execution context, derived from one named axiomatic parent). When an
axiomatic component changes, every derivative of it must be updated in
the same session, and every product embedding it must be rebuilt.

Axiomatic: core/bio-bundle-core.md, core/promote-reference.js, all four
types/*.md, all four operations/*.md, checks/bio-checks/, CHECKS.md,
accelerator/promotion-service.gs, accelerator/DEPLOY.md. Build tooling
(assemble.py, derivatives/product-c.js,
accelerator/test/conformance.mjs) is axiomatic in the same sense: edited
directly, versioned with the components whose contracts it enforces.

Derivatives: bio-bundle-agent-brief.md (parent:
core/bio-bundle-core.md). It strips interactive machinery and keeps the
write protocol, drift defense, gate invocation, and promotion mechanics
in force; the derivation is audited mechanically (every forbidden alias,
the verbatim gate command, all seven promotion steps,
promote-on-bootstrap, the Review Notes rule, and the annotation identity
grammar must survive, asserted by grep in the build ledger's
completeness check).

The State Rules spec is upstream of all of these. The update protocol is
three-tiered: spec first, then axiomatic components, then derivatives
and product rebuilds, all in one session. The convergent promotion
algorithm exists in three implementations (the core's prose plus
promote-reference.js, the client's promotion path, the accelerator's
promoteBundleCore\_); the spec is its authoritative statement,
promote-reference.js is its executable statement, and conformance.mjs
binds the accelerator to it byte-for-byte. Any algorithm change updates
all three and re-runs conformance in the same session.

## 4. The core component

core/bio-bundle-core.md is a proper Anthropic Skill body: YAML
frontmatter (name: bio-bundle, a trigger-rich description under 1024
characters), body under 500 lines. It carries, and only carries, what
every write of every type needs:

-   **Triggers and dispatch.** When to load; which type schema or
    > operation component to load for the requested operation (the
    > loading matrix, Section 6). Nothing type-specific.

-   **The three obligations**, restated operationally: bootstrap (read
    > bundle.md, record the base hash, persist working copies to local
    > disk immediately, surface state, verify against the index if
    > present, and in promoting modes promote any pending packages
    > first), checkpoint (targeted edits to on-disk copies at natural
    > save points, never whole-file rewrites from memory), write-back
    > (complete files, refreshed timestamps, Session Log entry, Review
    > Notes verified intact).

-   **The universal frontmatter core contract** (spec Section 3.1) with
    > the forbidden-alias table, the column-0 rule, and the
    > state_history append rule.

-   **The heading contract mechanism** (headings are literal constants;
    > the per-type lists live in the type schemas).

-   **Convergent promotion and base coherence**, per spec Sections 2.4
    > and 5.5: hash verification, advisory claim, deterministic history
    > naming, commit-point write order, idempotent consumption, the base
    > check with the divergence ladder, and gate re-run. Promotion is
    > performed only in modes with the capability to replace files in
    > place; chat mode packages instead of promoting.

-   **Gate invocation**: run the checks CLI against the written bundle
    > or package, include its output in the response, deliver nothing on
    > FAIL. In consolidated (chat-mode) builds, the check runner is
    > embedded verbatim in the product (Section 7) because
    > delivery-at-distance without the mechanical check is the Alpha
    > Pipeline's proven failure mode: three live incidents (CEG, GGGOF,
    > MRLN) each produced a differently malformed emission while the
    > prose contract was correct and present.

-   **Write-delivery paths per mode**, including the pending-package
    > queue obligations and the endpoint ping (Section 8).

-   **What this skill does not do**: analytical work, index authorship
    > (the index is derived by the client), re-evaluation judgments (it
    > records them), free-form repairs.

## 5. Type and operation components

Each types/\*.md carries the per-type frontmatter extension with a
conforming example, the type's state machine with legal transitions, the
type's record-file anatomy, its literal heading list, and the
type-specific write rules (Information: the canonical data/dataset.json
with the recomputed content-hash rule, snapshot obligations,
source-status transitions, change records; Focus: recheck-trigger
mandate, disposition-reason gate, edge statuses, elevation's required
edge; Project: the citation-register shape, the evaluation-gated
workproduct ladder, closed_reason; Action: clock entries with basis and
the silently-past-due prohibition, resolution enum). Content derives
from spec Section 4 and must not restate core protocol. State-machine
edge sets are part of the check catalog's versioned surface: widening an
edge is a spec amendment first, then a catalog bump.

Each operations/\*.md carries one cross-type operation. ANNOTATION
covers the record shape, the anchor grammar, the accretive-write rule (a
pure create: no state-surface promotion, no base check), the
collision-resistant identity rule, and the addressing protocol.
DISTRIBUTION covers the ladder preconditions, freezing mechanics with
the evidence copies, the distribution manifest, and immutability with
upstream-correction cascade. DELETION_CASCADE covers the three-part gate
(reason, preservation, cascade), the deletion-record shape, and the
one-hop reverse-edge walk. REPAIR covers the constrained-repair law:
sanctioned repairs only, executed as normal logged gate-checked writes,
with auto-application limited to deterministic repairs and adjudicated
findings never auto-applied.

## 6. Loading matrix

The dispatcher rule the core carries. One row per operation; a session
loads the core plus exactly the listed components.

  -----------------------------------------------------------------------
  **Operation**           **Loads**               **Notes**
  ----------------------- ----------------------- -----------------------
  Bootstrap / resume on a core + that bundle's    type read from
  bundle                  type schema             frontmatter object_type

  Promote a pending       core only               convergent algorithm,
  package (agentic                                base check, gate
  bootstrap)                                      re-run; no schema
                                                  content needed

  Create or update        core + INFORMATION      
  Information                                     

  Create or update        core + PROBLEM          
  Focus                                         

  Create or update        core + PROJECT          includes focusing
  Project                                         (workproduct.md edits)

  Create or update Action core + ACTION           

  Write an annotation     core + ANNOTATION       no target type schema
                                                  needed; accretive add
                                                  only

  Address an annotation   core + ANNOTATION +     the response write
                          target type schema      touches the target's
                                                  record

  Distribute a Work       core + (PROJECT or      
  Product                 ACTION) + DISTRIBUTION  

  Gated deletion          core +                  
                          DELETION_CASCADE + type 
                          schema                  

  Execute a repair        core + REPAIR +         divergence adjudication
                          affected type schema    (I-17) loads the
                                                  reconciliation target's
                                                  schema

  State transition only   core + type schema      transition legality
                                                  lives in the schema
  -----------------------------------------------------------------------

The checks module is never loaded into context in any row; it is
executed. The accelerator is never loaded in any row; it is deployed
infrastructure.

## 7. Products, one per execution surface

Same components, different assemblies, one COMPOSITE_VERSION constant in
assemble.py stamped into a **Skill version:** marker line at the top of
each product at build time. Products rebuild byte-for-byte from
components (no timestamps or environment data anywhere in any output;
assemble.py --verify builds twice and asserts tree-hash identity); the
component order is canonical and defined by the assembler, not the
filesystem.

**Product A: agentic Skill package** (dist/product-a/bio-bundle/). For
Claude Code, Cowork, and the Agent SDK. SKILL.md is the core verbatim
plus the marker line; references/ holds the eight type schemas and
operations, loaded on demand per the matrix; checks/bio-checks/ and
core/promote-reference.js ship in the package and are invoked via node.
Component-verbatim integrity is asserted at build verification (thirteen
packaged files byte-identical to sources).

**Product B: chat-mode consolidated**
(dist/product-b/bio-bundle-consolidated.md, \~100KB). For claude.ai
project knowledge. One assembled document: core (frontmatter stripped,
the single sanctioned transformation), then the four type schemas, then
the four operations as identifiable discrete sections, then the check
runner embedded verbatim in **FILE:**-labeled fenced blocks with
extraction instructions. The chat session writes those files to its
sandbox and executes the gate with node; assemble.py extract-runner
performs the identical extraction as the round-trip test, asserting
byte-identity with the module and executing the extracted gate. The
consolidated deliberately omits the promotion implementation, because
chat mode never promotes. Chat-mode flat-rate cost physics make the full
load acceptable; headless budgeted physics make it unacceptable; that
asymmetry is why the products differ.

**Product C: headless agent assembly.** A loading profile, not a static
file, emitted by derivatives/product-c.js: the agent brief plus exactly
one type schema as the context payload (\~12KB at the heaviest type),
with the gate CLI and the promoter listed as execute-only paths.
Hard-fails on an unknown type or a missing store root. This emitter is
the file the Tech Arch's headless-dispatch endpoint candidate will call.

**Product D: starter-kit accelerator**
(accelerator/promotion-service.gs + DEPLOY.md). Dual-mode, off-kernel,
deployed in one guided step. Its promotion core is bound to the
reference implementation by test/conformance.mjs, which runs the actual
.gs source under node and asserts byte-identical bundle trees,
convergence on re-run and on cross-implementation interleaving,
refusal-without-touching on divergence and hash mismatch, and the
structural endpoint guarantees (no content ingestion path, no eval,
token check textually before any work, selector validated against the ID
grammar).

**Rebuild-together rule.** Any change to a shared component rebuilds all
affected products in the same session, bumps COMPOSITE_VERSION, and
re-verifies reproducibility. A checks change rebuilds Product B
(embedded runner) and re-runs the extraction round trip. A
promotion-algorithm change updates the core prose, promote-reference.js,
and the accelerator together, and re-runs conformance.mjs. Nothing
scrapes component footers for versions; consumers read the marker line.

## 8. Write-delivery paths, the queue, concurrency, and the accelerator

**The capability boundary that shapes this section.** Promotion is
snapshot-then-replace, and the Drive connector available to a chat
session can create files and copy files but cannot update, rename, or
move. In-place replacement is structurally impossible from chat mode,
which is exactly why the Alpha Pipeline needed a server-side watcher.
BIO assigns promotion only to actors that can perform it and gives chat
mode a packaging role. Beyond the capability gap, Alpha production
experience documents the connector's operational costs: reads return
content into the context window rather than to disk (the base64 spiral
on large files), writes cost multiple slow tool calls, and locating a
bundle folder requires resolving a canonical ID to a substrate locator.
Chat mode consequently depends only on create-file, the weakest
operation any substrate will ever offer, so this path survives connector
changes and substrate migration.

**Interactive agentic and headless agent (the promoting modes).** The
store is on a filesystem the session can write. The skill performs the
full write-back itself via the convergent algorithm with the base check:
history snapshot, in-place write, gate run, done. On bootstrap, before
any other work, an agentic session promotes any pending packages.

**Interactive chat (the packaging mode).** Chat mode never promotes.
Every chat write-back produces a promotion-ready package per spec
Section 2.6: the complete updated files as .pending plus a
PENDING_PROMOTION.json manifest carrying the target canonical ID, the
base hash recorded at bootstrap, the hashed file list, timestamp,
author, and skill version. The gate runs inside the chat session against
the package content via the embedded runner, so validation is never
deferred, only file mechanics. With the connector, the package is
written into the bundle folder as new files; without it, delivered as
downloads. After delivery, the session pings the group's promotion
endpoint if one is configured, closing the latency gap to seconds.

**The client (a second packaging surface, added v1.6).** The Phase 1 PWA
writes through the same queue under the same protocol, over the Tech
Arch Section 10.4 endpoint slate rather than a connector. Its Editor
gates locally with the identical checks.js, blocking: Submit enables
only on PASS. It builds the spec Section 2.6 manifest exactly (target,
base recorded at sync, per-file sha256, created, author, skill_version),
writes one text/plain POST per file with the manifest strictly last,
mirroring the commit-point order so a partial delivery is an inert set
of .pending files surfaced as orphaned-pending findings, verifies the
endpoint-echoed sha per file, then pings promotion. Authorship is
recorded honestly at the surface level: the manifest's author names the
caller class (pwa-client) and skill_version carries the client version,
so store provenance names the producing surface exactly as chat and
agentic packages do; member-level identity is a deferred
engagement-layer concern, not smuggled into the write protocol here.
Edit is offered only on a docket freshly synced from the live endpoint;
demo, local, and mirror-restored stores are read-only by construction,
which is what makes the recorded base trustworthy.

**The daemon (a third packaging surface, added v1.7).** The M2' daemon
writes through the same queue under the same protocol from inside the
accelerator itself: first-capture creations and change-detection updates
land as gate-passed packages (the embedded gate, Section 9), files first
and manifest strictly last, promoted by the same convergent algorithm in
the same or a subsequent execution. The daemon is a mechanical writer
under State Rules v1.5's I-20 fence: its manifests carry writer
mechanical and an operation name, its diffs stay within the operation's
declared field set, and C-20.1 audits every mechanical promotion after
the fact from the history record. skill_version semantics, settled v1.7
for every packaging surface: the field carries the writer's component
version, so the daemon writes the accelerator version while a session or
the client writes the composite, and a consumer reading skill_version
knows which writer's contract to interpret the package under; all
records produced to date conform without amendment. The manifest's
created is real UTC and author names the deciding member on
authority-bearing writes, per Tech Arch v10 Section 10.10. Interruption
safety for all three packaging surfaces is the Tech Arch v10 Section
10.7 model: manifest-last durability, self-expiring claims, recovery by
inflight completion.

**The queue and promotion concurrency.** Specified in full in spec
Sections 2.4 and 2.6; the design-level summary: the pending package is a
task-queue entry, the bundle folder is the queue, and every capable
actor is its processor, all running one convergent algorithm whose
safety comes from determinism (hash-verified input, byte-identical
output, deterministic snapshot naming keyed to the manifest's timestamp
and hash, commit-point write order, idempotent consumption with the
snapshotted list recorded in each history manifest entry), whose
efficiency comes from an advisory claim that is never load-bearing
(stale claims and presence markers are themselves surfaced by C-16.5
with deletion as the repair), and whose failure recovery is the
checker's torn-residue finding with re-promotion as the deterministic
repair. Racing promoters are the designed-for normal case, proven by
raced-promotion tests and by cross-implementation interleaving in the
conformance harness.

**Multi-writer editing coherence (resolved; spec Section 5.5).** Write
coherence is optimistic and base-stamped. The skill's obligations:
record the base hash at every bootstrap; carry it in every write-back
(package manifests and history manifest entries); at promotion, apply
the divergence ladder: fast-forward on a matching base,
apply-in-sequence when hash comparison against history proves the
diverged write-backs touched disjoint file sets, and adjudicate
overlapping substantive divergence as an I-17 finding whose repairs are
rebase (a reconciliation session over the live bundle and the diverged
write-back, using the same re-evaluation primitive annotations and the
cascade already invoke), supersede with the loser preserved as a
diverged branch in \_history/, or apply-disjoint. Accretive adds bypass
the ladder entirely: collision-resistant identity makes them
conflict-free by construction. Sessions write an advisory presence
marker at bootstrap so humans can coordinate socially; presence is
stale-expired and never load-bearing. Real-time co-editing and sub-file
automatic merge remain a sync-engine concern; a sync engine would
replace the mechanics of the ladder's lower rungs, never the policy of
adjudication.

**The accelerator: standard equipment, dual-mode, off-kernel.**
promotion-service.gs is a Google Apps Script deployed per group during
setup. It exposes one implementation of the convergent algorithm through
two entry points: the time-driven trigger (ambient latency; the queue
drains within minutes regardless of anyone opening a client) and the
web-app endpoint (doGet, invocable by plain URL fetch; a packaging
session pings it and promotion completes in seconds). The endpoint is
bound by the trigger-only hard rule and the Tech Arch v6 Section 10.4
token discipline: strict pre-work verification of per-caller-class
bearer tokens from Script Properties, a bundle selector validated
against the ID grammar as the only other parameter, the invocation log
at index/invocations.jsonl as the OP8 sensor, and no gate run, because
the accelerator never judges content. The off-kernel discipline is
unchanged and non-negotiable: idempotent (conformance-proven), never
load-bearing (the checker's pending and staleness findings persist
regardless), gracefully degrading (a dead accelerator leaves behavior
identical to a group that never deployed one). Belt and suspenders is
the default posture: client-as-watcher supplies the guarantee, the
accelerator supplies the latency, and the convergent algorithm is what
lets all of them run without coordination.

In every mode and path, the on-disk (or in-sandbox) working copies are
the source of truth at write time; the skill never re-reads the bundle
from the substrate at write time to "verify." That rule, and its
rationale, transfer verbatim from Alpha production experience.

## 9. The check codebase decision

The Mechanical Verification Law requires one check implementation at
every judging call site: the skill's pre-write gate, the PWA's scan-time
consistency checker, and (since M2', through the embedded gate) the
accelerator. The Alpha precedent (Python bundle_check.py) cannot satisfy
this for BIO, because the second call site is a browser.

**Decision: the checks are plain JavaScript (ES modules) with JSDoc type
annotations and // \@ts-check.** The reasoning, including why not
TypeScript:

-   **Runtimes execute JavaScript, not TypeScript.** TypeScript is
    > erased at compile time; it buys editor-time type checking, not
    > portability. Every runtime BIO could ever target (browsers, node,
    > Deno, Bun, edge workers) runs the JavaScript directly.

-   **A build step breaks the one-codebase law in a subtle way.** With
    > TypeScript, the file that runs at the gate is compiled output, not
    > the file a maintainer reads, and a pre-built artifact shipped
    > alongside source can drift from it. With plain JavaScript, the
    > byte-identical file runs at the gate, imports into the PWA, and
    > embeds into Product B. That is the strongest possible fulfillment
    > of one-codebase-two-call-sites.

-   **Bus-factor and durability.** No compiler, no tsconfig, no
    > toolchain versioning, no dependencies to rot. The module is
    > designed to run unmodified for years: zero dependencies eliminate
    > ecosystem churn, the absence of a build step eliminates toolchain
    > churn, JSDoc annotations are comments invisible to every runtime,
    > and the language plus node's basic I/O surface are as
    > backward-stable as anything in computing. The only planned change
    > vector is schema evolution, which is additive by construction: a
    > schema version bump adds catalog entries and new checks mapped to
    > the new version; existing checks are never rewritten, because old
    > bundles validate against the contract they declare. The module is
    > appended to, not maintained.

-   **The type-safety loss is negligible at this scale.** JSDoc with //
    > \@ts-check runs TypeScript's own checker over the JavaScript
    > source in any modern editor.

Structure and enforcement as built: catalog.json declares every check
(ID, invariant, applicable object types, applicable schema versions);
checks.js implements the predicates with injected file access (a file
map plus a hash function), so the browser call site supplies its own map
from IndexedDB while cli.js supplies node's; the browser-purity of
checks.js is audited (it imports nothing and touches no node-only API).
The gate runs node cli.js \[--store \] in the session sandbox; --store
(or an injected resolver) enables store-scope reference and citation
resolution. Product B embeds checks.js and cli.js verbatim at build
time, round-trip-verified. The restricted-grammar frontmatter parser is
implemented in the module against the spec's deliberately limited
grammar rather than pulling in a general YAML library, and it
specifically detects the buried-top-level-key failure mode. Checks are
versioned against schema stamps per spec Section 8.4. The accelerator
cannot import the module (Apps Script is its own runtime), so the module
comes to it: assemble.py embed-gate writes checks.js byte-verbatim into
promotion-service.gs as a generated region carrying the source, its
SHA-256, and its version; the runtime wrapper hash-verifies before
compiling, strips module syntax deterministically, and compiles once,
with check-versions asserting the region's hash and round trip on every
build and conformance asserting gate-verdict parity against the real ES
module under V8 over shared fixtures, both PASS and FAIL. The daemon
gates its own packages at packaging through this embedded gate, and per
the July 20 operator decision the promoter gates non-mechanical
manifests at promotion (implementation at accelerator 0.10.3). One
codebase, three call sites: the session gate, the client checker, and
the accelerator.

**The classifier joins the one-codebase contract (added v1.6).**
classifyDivergence lives in this module and is the single implementation
of the spec Section 5.5 rung semantics: the gate's C-17.2 calls it to
classify divergent pending packages, and every promoter that classifies
(the client promoter, and the accelerator through the embedded module)
calls the same function before applying or refusing. A promoter
implementation never carries its own classifier. Without this rule, gate
classification and promoter behavior could diverge, which is exactly the
class of defect the one-codebase law exists to make impossible.

This decision is scoped to the checks module. The broader stack
assignment stands: the PWA and Agent SDK glue remain TypeScript projects
per Tech Arch Section 9; they consume the JavaScript checks module
without friction.

## 10. Adopted and deviated, recorded

Adopted from the Alpha bundle skill and Framework README: the three
obligations and on-disk working-copy discipline; edit-in-place,
complete-files-only writes; the field-name and heading contracts with
the forbidden-alias table and column-0 rule; the mandatory mechanical
pre-delivery gate with output included in the response; \_history/ with
manifest and co-versioned assets; description-as-truth visuals with
stale detection; dual-audience {text, description} encoding; immutable
Review Notes; append-only Session Logs; axiomatic/derivative taxonomy
with same-session derivative updates; deterministic assembly with a
single composite version constant and byte-for-byte reconstruction;
per-mode products where each component earns its token cost; the
advisory-claim stale threshold (10 minutes, from the Alpha session
lock); evolution-without-code-changes (a new operation or type schema is
a file drop plus a matrix row, with code changes only when the schema or
checks change).

Deviations, each ratified upstream or in this document's revision notes:
no kernel watcher, with the accelerator admitted as standard off-kernel
dual-mode equipment (idempotent, non-load-bearing, gracefully degrading;
web endpoint bound to trigger-only semantics, general RPC prohibited);
promotion concurrency handled by convergence rather than exclusion;
multi-writer editing coherence handled optimistically with base stamps
and a divergence ladder rather than locks (advisory claims and presence
markers only, never load-bearing, and themselves stale-surfaced by
C-16.5); no Ledger (the index is client-derived and regenerable); no
lifecycle folder moves; per-type bundle anatomy instead of the fixed
two-file shape; checks in dependency-free JSDoc-typed JavaScript instead
of Python; collision-resistant accretive-add identity instead of
allocated sequence numbers; preselection built into the headless product
from the start instead of retrofitted; and chat mode as a packaging mode
whose pending-promotion queue is drained automatically by any capable
actor running one convergent algorithm.

## 11. Build order: executed

Executed July 10-11, 2026 (bio-bundle 0.1.0, bio-checks 1.3.1). The
README build-state ledger carries the per-step detail; the outcomes:

-   **Checks module.** Restricted-grammar parser plus families C-1
    > through C-4, C-13, C-14, C-16, C-17; the gate existed before the
    > first write it would have caught. Grown additively through the
    > later steps to full coverage: sixteen of seventeen invariants
    > carry executable checks (audited); I-10's age check is deferred
    > pending the spec v1.2 reeval_pending decision; I-17's disjointness
    > auto-classification awaits the client ladder (its enabling data,
    > the snapshotted/files record, is in place).

-   **Core skill plus the reference promoter.** Round trip with gate
    > PASS; two-promoter race converging byte-identical with exactly one
    > snapshot set; divergence refused with the package preserved.
    > Designing C-12's snapshot accounting later exposed and fixed a
    > real defect here: nested-path snapshots were being silently lost
    > (a tolerated ENOENT on the missing \_history/data/ directory); the
    > fix added recursive directory creation, un-tolerated snapshot
    > failure, and the snapshotted manifest record, after which the race
    > was re-proven.

-   **Information schema and the first real write.** The
    > recomputed-content-hash rule proved able to catch a single
    > silently mutated dollar figure. The first store object carries
    > only corpus-attested values, with the raw-capture gap recorded
    > explicitly rather than papered over.

-   **Step-4 families** (append-only, references with --store
    > resolution, history coherence, recheck coverage), each fired in
    > both directions.

-   **Remaining schemas and the four operations.** The demo store ran
    > the full pipeline: elevation with the required edge, an
    > investigating Project with an earned ladder rung and a resolving
    > citation register, the CPRA Action with its statutory clock
    > honestly overdue, a pending annotation correctly counted.

-   **Agent brief and Product C.** 37% of the core's size, with a
    > mechanical derivation audit; the profile emitter tested for all
    > four types plus negatives; a headless-style write performed
    > through the brief's protocol.

-   **Accelerator.** Conformance proven by executing the actual .gs
    > source under node: byte-identical bundle trees versus the
    > reference, convergence under re-run and cross-implementation
    > interleaving, refusal-without-touching on divergence and hash
    > mismatch, structural endpoint guarantees grep-proven.

-   **Assembler and Product B.** Byte-for-byte reproducibility on
    > demand; the extraction round trip proved the embedded runner
    > byte-identical and executable, and caught one final source-hygiene
    > defect (a missing trailing newline).

Post-build, an end-to-end three-mode chain was exercised on real store
data: a chat-protocol session addressed a pending annotation, gated
in-session via the Product B extracted runner, and emitted a create-only
pending package; the endpoint's actual doGet rejected an invalid token
and a malformed selector under stubs; the accelerator core promoted the
package; and the post-promotion gate plus the append-only guards passed,
with the nested annotation snapshot correctly archived.

**Remaining operator items** (outside this environment's reach): deploy
the accelerator per DEPLOY.md and live-fire the endpoint against a
scratch package; install Product B into a claude.ai project and run one
real chat packaging session; install Product A into Claude Code or
Cowork and run one real agentic session; run Product C through an actual
Agent SDK invocation (scheduling additionally waits on the Tech Arch
Section 12 permitted-use answer). **Pending decisions**: spec v1.2
ratification of reeval_pending: {flag, since, source} (unblocks C-10)
and the Section 2 anatomy listing of transient advisory files; the
client checker's browser import of checks.js is Phase 1 PWA work.

*Design version 1.6, July 18, 2026. Companion to
BIO_State_Rules_Consistency v1.4 and
BIO_Technical_Architecture_Decisions v9. Prior art: Alpha Pipeline
bundle skill v2.21 and Framework README v4.34.*
