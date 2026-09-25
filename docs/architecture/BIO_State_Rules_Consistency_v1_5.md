# Believe in Oakland

**Status** · The data-store rules every implementation writes against: the id grammar, bundle anatomy, the universal frontmatter core, per-type schemas and state machines, the closed relationship vocabulary, cascade semantics, the invariant set I-1…I-20, the violation-to-repair mapping and the Mechanical Verification Law. "Working Document, v1.5, July 2026", "Ratified July 20, 2026 on the operator's word." Partially complete and partly historical, by its own 2026-08-10 banner: **the store this document describes is not the store that was built** — read §1, §2.4 and §2.6 as history; everything from §3 on is SHAPE and RULES, which transferred to the plane's `schema.mjs`, `store.mjs` and `bio-checks.mjs`. Amended in place three times (v1.5a vocabulary, the bias cross-reference, DEC-72's `published` amendment of 2026-09-10). Where this and `docs/BIO_DATAPLANE_STATE.md` disagree about what exists, the dataplane state is the system, and the check catalog is the authority for the edge set. Amended 2026-09-18: `concluded` is read for a project's relationship with an inquiry (INVESTIGATIVE-SESSION.md §7.1). The information ladder is ONE-WAY and gains no `verified -> collected` edge (BOB #17, 2026-09-19, D-203/D-200): a verification resting on a weaker check is STATED beside the state, never reverted. DEC-70's severance rule is folded into §5.4, and D-145's cross-instance addressing is stated as M6's (BOB #23, 2026-09-21). Amended 2026-09-21 (D-436, IC-172; decision (b)'s premise RULED BY BOB, (a) and (c) the BOB lane's mechanism): §3.1's `group` is ONE recorded value per instance, written once — at the store's first boot from the slug the installer bound, or by the root of trust's one seed on a store that predates it — stamped into every document the plane creates, and never a literal or a deploy-time var; see the amendment at the foot. §5.4's REC-160 clause is BUILT (2026-09-23, IC-189 proposed): `op=reevaluations` publishes each leg's `status` from the one severance predicate and says a severed leg NAMED an edition, never that it rests on one, while its obligation still fires (DEC-70). §8's rule that a stored digest is of the stored bytes is BUILT at the write (2026-09-23, REC-175, IC-192): `op=promote` computes every inline file's SHA-256 over its UTF-8 bytes and refuses a supplied value naming another, on any file, before anything is written (`FILE_DIGEST_MISMATCH`, C-33.38); a blob's supplied digest must name its content address; `op=digestcensus` counts held rows whose digest disagrees with their bytes and rewrites none. The same rule for an inline file's SIZE is BUILT at the write (2026-09-23, REC-178, IC-196): `op=promote` computes `bytes` as the length of the file's UTF-8 encoding and stores that whatever was supplied (a differing figure is overridden, not refused: over bytes whose digest agrees it is a unit error, not a claim about the content), and `OVERSIZE_INLINE` judges that figure, never `text.length`. §2.4's closing law — *history is append-only; nothing in `_history/` is ever modified* — is ENFORCED AT THE WRITE (2026-09-23, REC-176, IC-193): `op=promote` refuses a snap key the bundle already holds (`SNAP_KEY_TAKEN`, C-67.1) before anything is written, its manifest and history writes are plain INSERT, and a byte-identical re-send is the no-op §2.4's convergent promotion describes. §8's rule that the record holds only what an act that landed wrote is BUILT for `op=promote` (2026-09-23, REC-180): every refusal its transaction returns rolls the whole act back, so a project creation refused after REC-141's mint (`NAME_TAKEN`, `NO_TITLE`) leaves `seq` and `minted_ids` byte-identical; the refusal's answer is unchanged. §4.1's rule that the terminal transition refuses while a live edge cites the item is BUILT at BOTH its doors (2026-09-23, REC-181): `op=promote` moving Information INTO `retired` asks `op=retire`'s own predicate (`#retirementCitedBy`, a severed edge not blocking) before any write and refuses `CITED` with retire's offenders and detail; an edit of an item already retired moves no state and is not asked. §6 I-20's "immediately prior recorded snapshot" is defined on a `created` tie as the one WRITTEN first (2026-09-23, REC-182): `op=export`'s promotions and the gate's facts order the manifest by `created`, then `rowid`, on D-171's precedent. Since D-674 (2026-09-25) "prior" is WRITE ORDER outright: `created` is the writer's own date, so a caller could date a promotion before the one it follows, and every manifest reader — `op=export`'s promotions, the gate's facts, `op=selection`'s drift class and `op=queue`'s unattended-capture condition — orders by `rowid` alone and publishes `created` beside it as the writer's date (I-20). Since D-700 (2026-09-25) the gate's own audit agrees: the bundle image carries each `_history/manifest.json` entry's write-order rank as `seq`, and C-20.1 walks `seq`; an image without it is walked in snap-key order and C-20.1 says so. §4.1's rule that a retired item is not citable is now kept by the PRE-FLIGHT as well as by the refusal (2026-09-24, D-444): `affordanceFacts` states `cites_out.severed_reinstatable`, counted through the one `#retiredNotCitable` predicate `#edgeTransition` itself refuses on, and the `reinstate` act's PROJECT arm keys on it, so a project whose only severed edges point at retired items is no longer offered an act the store refuses, while one holding a severed edge onto a live target still is and `op=reinstate` still accepts it. §4.1's widening to the STATE is BUILT in the store (2026-09-25, D-553, BOB #34): one type-blind `#retiredNotCitable` is read at every door that asks whether a target is citable — reinstate and its pre-flight, `op=cite` and the suggest path — and viewer-gating decides only a refusal's wording. §4's state machines are ENFORCED AT THE WRITE for every type with a head (2026-09-25, D-546, BOB #34's 23:55Z ruling folded as §4.7): `op=promote` refuses any move the type's table does not declare (`STATE_MOVE_UNDECLARED`, C-86.6; bias keeps C-26.12), the legacy `elevated` and `published` stay readable and unreachable, and a stored move outside the tables is counted and said by `op=statemovecensus`, never rewritten. §3.1's `current_state`, `created` and `last_updated` are never lost by a revision nor invented for a creation (2026-09-25, D-628, D-578's shape): `op=promote` carries the head's value for each a revision states nowhere (`fields_carried` on the answer) and refuses a creation stating one nowhere by name before the first write (`PROMOTED_FIELD_UNSTATED`, C-86.8), where both met a raw NOT NULL error; a `meta` sent as a string states nothing. as of 2026-09-25.

**Place in the system** · Owns construct 3 of `BIO_System_Design.md` §3 (the record): bundle shape and the rules the plane checks. `BIO_Intake_Doctrine_v1_1.md` defers to it for shape; `BIO_Membership_Architecture_v2.md` builds on its §4.3 and §5.1–5.3; the intake provenance register and I-18 realise the intake doctrine inside it. README calls it "the most operationally load-bearing document in the corpus."

**Incomplete sections** ·
- §1 — the folder layout is the retired substrate's; history per the banner.
- §1.2 — an id is unique within ONE instance, so nothing addressed by id survives leaving it and two instances' ids collide (D-145). Cross-instance addressing is M6's (`MILESTONES.md`), designed WITH D-99's WARC and Memento interchange, because an export carries an id-addressed graph; no shape is chosen until M6 is taken up (BOB #23, 2026-09-21). Content-hash citation, the row's third candidate, is the one the record's doctrine already leans to (identity is canonical, the address a comment).
- §2 — the state/record split and description-as-truth transferred; §2.4 convergent promotion, §2.5's gated deletion mechanics and §2.6 the pending-package queue are history, and the PENDING/PROMOTING transients no longer exist.
- §2.4 — a manifest row an `INSERT OR REPLACE` overwrote before REC-176 is NOT recoverable from the store and is not reconstructed; `op=snapkeycensus` counts the promotions a bundle's manifest lost (and states a lost CREATION row as undetermined, since a store predating the creation row shows the same). What a deployed instance's census reads is not known until an administrator runs it there; which key collided is recorded nowhere.
- §3.1 — the core field list is stated; where the `group` value comes from was unstated until the 2026-09-21 amendment at the foot (D-436), whose three decisions are settled — decision (b)'s premise RULED BY BOB on 2026-09-21, decisions (a) and (c) decided by the BOB lane at integration (§3.1) — and what a group named wrongly in bytes that are already signed can become is not designed.
- §4.1 — `op=reinstate` onto a retired item is refused `RETIRED_NOT_CITABLE` since REC-183 (2026-09-23), closing the door REC-181 found, and the PROJECT side of the `reinstate` affordance is narrowed to match since D-444 (2026-09-24), so the residue stated here is closed. The retired question is asked through ONE type-blind predicate, `#retiredNotCitable`, at every door since D-553 (2026-09-25, BOB #34's widening): reinstate and its pre-flight, `op=cite`'s `is-cite-retired` region and the suggest path's `SUGGEST_LEG_UNREACHABLE`, which asks it apart from the viewer so sight decides only the wording. Two machines carry `retired` today (`information`, `bias`); the IC for the widening is the integrator's to mint (the row's own condition). The retired-AND-hidden cell is not reachable today (the viewer filter hides only projects, and no project machine has `retired`), so its separation from sight is pinned structurally. A confirmed edge onto a retired item that predates REC-181 survives in the record and is not swept. The withdrawal door for a question's leg is a new basis version, not a sever (ruled below, BOB #31).
- §4.2 — the Focus machine is legacy: nothing produces those states; the live machine is `inquiry`, which §4 does not describe, nor `bias`.
- §4.7 — the gate's C-4.2 still reads an undeclared edge in a document's OWN `state_history` as an ERROR, not in the ruling's sentence: a timestamp in the bytes is the writer's, so "before the fence" there is a claim a writer could backdate, and how the gate should speak it is a design question routed to BOB (D-673, minted by D-546), not built.
- §4.3 — lacks the project-name-uniqueness annotation Membership v2 §11 requires.
- §4 — `published` left the inquiry lifecycle by the 2026-09-10 amendment (DEC-72 / CASE-4); the body text of the state machines is unrevised.
- §4.3 — a project's citations are bounded CUMULATIVELY by the 1 MB inline limit on its `bundle.md`, not by the 10,000-item selection cap (D-38): ~12,000 edges at ~84 bytes, refused before anything is written with `CITATION_TOO_LARGE`, and `bundle.md` cannot spill to R2 because the gate compares it byte-wise against history. A stated LIMITATION, settled by decision (`MILESTONES.md`, "Deliberately not scheduled"; BOB #23, 2026-09-21).
- §8 — an unbacked register entry is refused at RATIFY (`PLANE_MISSING_BYTES`, `PLANE_SIZE`), not at promote (D-45): `promote` verifies no R2 bytes (an INLINE file's digest IS verified at promote since REC-175, and a blob's supplied digest must name its content address, but whether bytes exist under that address is not asked), so a claim about bytes that exist nowhere can sit in the working corpus until publication or `op=registeraudit`; a promote-time guard would need R2 outside promote's transaction. A stated LIMITATION, settled by decision (BOB #23, 2026-09-21).
- §5.1 — the vocabulary text lacks `corroborates`; corrected only by the v1.5a amendment.
- §6 — I-18 is staged ("mechanically any named identity outside the closed surface-and-AI set") despite per-member credentials in Membership v2; I-19 is drafted with no check; I-16/I-17 are stated over the retired queue and manifests.
- §6 — I-20's write-order rule is kept by the store's manifest reads (REC-182, D-674) and by C-20.1's audit since D-700: the gate image's `_history/manifest.json` carries each entry's write-order rank `seq`, and C-20.1 walks it. What remains: an image WITHOUT `seq` on every entry (one written before D-700, or a foreign one) is still walked in snap-key order — C-20.1 SAYS so in an info finding, it does not repair it; and C-17.2's divergence ladder (`classifyDivergence`) still walks snap-key order, so its intervening set can be the wrong one on keys chosen against write order (D-718, found by D-700).
- §8 — C-18.2 "recorded and deliberately not entered"; the "three call sites" are the retired runtime.
- §8 — an inline file's `bytes` is computed at promote since REC-178 (the writers sent `text.length`, UTF-16 units), but rows written before it keep the figure they were stored with: `op=digestcensus`'s `bytes_disagree` counts them and nothing rewrites them. What a deployed instance's census reads is not known until an administrator runs it there. A blob-backed file's `bytes` is still not judged at promote (D-45; `PLANE_SIZE` at ratify).
- §9 and §10 — obligations "binding on the bundle skill", a superseded implementation.
- §footer — reads "Spec version 1.3, July 11, 2026"; stale.

**Contents**
- [State Rules & Consistency Specification](#state-rules-consistency-specification)
  - [0. Status and scope](#0-status-and-scope)
  - [1. Store layout and canonical naming](#1-store-layout-and-canonical-naming)
    - [1.1 Root layout](#11-root-layout)
    - [1.2 Canonical ID grammar](#12-canonical-id-grammar)
    - [1.3 Naming rules for files](#13-naming-rules-for-files)
  - [2. Bundle anatomy](#2-bundle-anatomy)
    - [2.1 The state/record split](#21-the-staterecord-split)
    - [2.2 Format assignment](#22-format-assignment)
    - [2.3 Description-as-truth](#23-description-as-truth)
    - [2.4 History and convergent promotion](#24-history-and-convergent-promotion)
    - [2.5 Accretive store and gated deletion](#25-accretive-store-and-gated-deletion)
    - [2.6 The pending-package queue](#26-the-pending-package-queue)
  - [3. Universal frontmatter core](#3-universal-frontmatter-core)
    - [3.1 Core fields](#31-core-fields)
    - [3.2 The dual-audience encoding](#32-the-dual-audience-encoding)
    - [3.3 Drift defense (field and heading contract)](#33-drift-defense-field-and-heading-contract)
    - [3.4 State history](#34-state-history)
  - [4. Per-type schemas and state machines](#4-per-type-schemas-and-state-machines)
    - [4.1 Information](#41-information)
    - [4.2 Focus](#42-focus)
    - [4.3 Project](#43-project)
    - [4.4 Action](#44-action)
    - [4.5 Work Product (in-bundle derived view)](#45-work-product-in-bundle-derived-view)
    - [4.6 Annotation (in-bundle record)](#46-annotation-in-bundle-record)
    - [4.7 Moves are fenced from now on (BOB #34, 2026-09-24; D-546)](#47-moves-are-fenced-from-now-on-bob-34-2026-09-24-d-546)
  - [5. Reference model and write coherence](#5-reference-model-and-write-coherence)
    - [5.1 Typed edges](#51-typed-edges)
    - [5.2 Direction and ownership](#52-direction-and-ownership)
    - [5.3 Substrate independence](#53-substrate-independence)
    - [5.4 Cascade semantics](#54-cascade-semantics)
    - [5.5 Multi-writer coherence (added v1.1)](#55-multi-writer-coherence-added-v11)
  - [6. Invariant set](#6-invariant-set)
  - [7. Violation-to-repair mapping](#7-violation-to-repair-mapping)
  - [8. The Mechanical Verification Law](#8-the-mechanical-verification-law)
  - [9. Write protocol obligations (summary binding on the bundle skill)](#9-write-protocol-obligations-summary-binding-on-the-bundle-skill)
  - [10. Deviations from Alpha Pipeline, recorded](#10-deviations-from-alpha-pipeline-recorded)
  - [Cross-reference: declared bias and workproduct_state (July 27, 2026)](#cross-reference-declared-bias-and-workproduct_state-july-27-2026)
  - [Amendment: `concluded` is a state of a PROJECT'S relationship with an inquiry (2026-09-18, BOB #15)](#amendment-concluded-is-a-state-of-a-projects-relationship-with-an-inquiry-2026-09-18-bob-15)
  - [Amendment: `published` leaves the INQUIRY state machine (2026-09-10, DEC-72 / CASE-4)](#amendment-published-leaves-the-inquiry-state-machine-2026-09-10-dec-72-case-4)
  - [Amendment: the producing `group` is ONE recorded value per instance (2026-09-21, D-436)](#amendment-the-producing-group-is-one-recorded-value-per-instance-2026-09-21-d-436)

---

> **Editorial note, July 27, 2026 (Bob's directive):** the construct formerly
> named **Problem** is renamed **Focus** throughout, which conveys its purpose
> non-judgmentally. Machine literals shown here use the target vocabulary
> (`focus`, `focus@1`, `focuses/`, `focus.md`); the legacy literals (`problem`,
> `problem@1`, `problems/`, `problem.md`) remain valid aliases in existing
> append-only history and in code until the rename arc lands.

# State Rules & Consistency Specification

Working Document, v1.5, July 2026

> # ⚠ THE STORE THIS DOCUMENT DESCRIBES IS NOT THE STORE THAT WAS BUILT
>
> **Banner added 2026-08-10 (session BOB), amended the same day when the retired
> substrate was removed from the text on Bob's instruction.** Section 1's store layout is
> **a folder tree on a hosted document store**, one root per type, each bundle a folder of
> files with a `history/` subfolder and a pending-package queue. **The built store is
> SQLite inside a Cloudflare Durable Object**, with captured bytes in R2. There are no
> folders, no `.pending` files and no promotion queue.
>
> **What survived the substrate change is most of this document**, and it is why the
> specification is still consulted constantly: the canonical ID grammar and substrate
> independence, the state/record split, the accretive store with gated deletion, the
> per-type schemas and their state machines, the typed reference model with cascade
> semantics, multi-writer coherence, the invariant set, the violation-to-repair mapping,
> and the Mechanical Verification Law. Those are implemented in `bio-plane/src/schema.mjs`,
> `store.mjs` and `checks/bio-checks.mjs`.
>
> **Read Sections 1, 2.4 and 2.6 as HISTORY** — layout, convergent promotion and the
> pending queue are mechanics of the retired substrate. Everything from Section 3 on is
> about SHAPE and RULES, which transferred.
>
> Where this and `docs/BIO_DATAPLANE_STATE.md` disagree about what exists, the dataplane
> state is the system. For what has been ruled since, `node tools/decided.mjs "<subject>"`.

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
call-site sentence is corrected: the embedded gate makes the endpoint a
third call site of the one check codebase, and the endpoint's
non-judging caveat is retired by the July 20 operator decision wiring
the gate into promotion for non-mechanical manifests (Tech Arch Section
10.11). The
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

**Revision note (v1.3).** One refinement from the July 11 endpoint
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

-   References are canonical bundle IDs, never a host's file ids or any
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

A group's store is one folder tree on the bundle substrate (a folder
store the group controls; git or OSF as mirrors):

/BIO//

information/

INFO-2026-0001-sewer-acfr-fy24/

INFO-2026-0002-opengov-transfers-fy20-25/

focuses/

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
open, an agentic session on bootstrap, the endpoint on schedule or on
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

**RULED 2026-09-23 by BOB #31 — A WRONG SENTENCE ALREADY WRITTEN STAYS AS WRITTEN; THE READ CORRECTS IT (D-256; S17-1
Q3).** A stored string is a fact about when it was written (D-219's precedent). The bundles whose bodies name an earlier
capture chosen before D-221 are not rewritten. No revision is appended to them either: a machine writing an "authored"
correction onto a member's bundle is exactly what the fences forbid. `op=versionchain` answers the predecessor from the
chain, and the enumeration of the affected set sorts each one as provably wrong, provably right or undetermined, and
reports the three counts separately (rowed).

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

object_type: focus \# information \| focus \| project \| action

schema: focus@1 \# per-type schema version stamp

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

**THE `group` VALUE, AND WHAT CAME BEFORE IT (D-436, 2026-09-21).** `group` is the producing group's slug:
one value in the store's durable state, written once — at a store's first boot from the installer's instance name, or
once by the root of trust — and never a deploy-time value, because it lands in signed bytes. A store that already held
bundles before D-436 records none until its root of trust sets it, and a new document naming no group is refused
meanwhile. That much is MECHANISM: BOB #19's design call on D-436's row, built as decisions (a)–(c) of the amendment at
this document's foot and accepted as built by the BOB lane. **What Bob RULED on 2026-09-21 is what came before: no
migration and no automatic setting is owed for those stores.** His words: *"everything captured so far is for testing
purposes only"*; at the MVP release the record *"will be thrown out (or at least not copied over
to the instance running a real release)"*, so nothing recorded before it binds the design. The slug is PUBLIC, and a group may add a display name in its own words
and a domain shown only while verified: `BIO_Publication_v0_1.md` §7 (BOB #24, 2026-09-21).

### 3.2 The dual-audience encoding

Every structured list item that humans read (focus statements,
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

-   blurb: "Cluster of three transfer-labeling focuses elevated
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

**THE LADDER IS ONE-WAY AND GAINS NO `verified -> collected` EDGE — RULED 2026-09-19 by BOB #17
(D-203/D-200), from this section's own design rather than as a new rule.** Three things decide it.
**(1) `verified` is an AUTHORED ACT**: the `collected -> verified` transition is a named member's
decision, AI-assisted but member-made, and authored acts BIND (DEC-24). A back-edge silently un-makes
one, and erases the fact that a named member once made it. **(2) THIS SECTION ALREADY SOLVES THE
PROBLEM A BACK-EDGE WOULD SOLVE, on a second axis**: `source_status` is an independent axis, so a
verified item whose source moves becomes `source_status: modified` with BOTH versions preserved — the
established answer to *"this verified thing is no longer what we verified"* is to RECORD it beside the
state, never to walk the state back. **(3) `retired` is "preserved, never deleted"**, so the ladder's
own end is preservation; a reversal is the only operation in the machine that would lose a fact.
**So a verification resting on a weaker check than today's is STATED, not reverted** — undetermined is
first-class, and "this was verified before check X existed" is exactly the kind of thing this record
says out loud. The repairs available are the two the catalogue already advises: fix the bundle WHERE IT
STANDS (an edit needs no state move), or `verified -> retired` with the reason recorded. A member who
believes a document should never have been verified retires it and re-collects the source as a new
bundle, which keeps both facts.

**A RETIRED ITEM IS NOT CITABLE — RULED 2026-09-23 by BOB #30 (D-168, SCHEDULER #15's question), from this section's own
design.** `retired` is the GROUP's authored judgment that an item is superseded or no longer stands, and the terminal
transition already refuses while a live leg cites the item (`CITED`), because a claim resting on it would read to every
later member as live support nobody will re-examine. A citation made AFTER the retirement is the same harm entered by the
other door, so it is refused in the STORE for every caller (DEC-8: never on a surface) — the machine's suggest path already
refuses it (`SUGGEST_LEG_UNREACHABLE`), and a member's `op=cite` gains the same check with a stated code naming the door:
cite what superseded it, or re-collect the source as a new bundle (the remedy above). This does not bar citing a
retraction: a publisher that withdraws or changes a document is the `source_status` axis below (`removed`, `modified`,
both versions preserved, flagged as potential concealment evidence), never `retired`, and stays citable. **Accepts when**
`op=cite` onto a retired Information bundle is refused by name for a member and a machine credential alike, one onto a
`source_status: removed` bundle lands, and a confirmed leg that predates the retirement is untouched. NEGATIVE CONTROL:
drop the retired check from `op=cite`, and the member arm fails by name. **WIDENED 2026-09-24 by BOB #34 (D-553 (c)):**
the rule follows the STATE, not the type: any object in a `retired` state is not citable, by any door and for every caller;
only a refusal's WORDING may be viewer-gated. A future state machine that means something else must name its state differently.

**WITHDRAWING A CITATION BEFORE A RETIREMENT — RULED 2026-09-23 by BOB #31 (REC-181's worker's question).** The terminal
transition refuses while a LIVE edge cites the item, so the citation goes first — by the door its kind has. A project's
edge is a relationship and is SEVERED (`op=sever`). A question's leg is part of its versioned basis, so it is withdrawn by an
authored NEW BASIS VERSION without that leg (`op=promote` of the question), append-only, the old version kept. No
question-leg sever op is owed. Then the item retires.

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

### 4.2 Focus

Record file: focus.md (statement, evidence discussion, analysis).

Extension fields:

surfaced_by: agent \# agent \| human

disposition_reason: "" \# required non-empty when deferred or dismissed

recheck_triggers: \# required non-empty for every Focus, all
dispositions

-   text: "FY2025-26 ACFR publication"

-   description: "Next ACFR shows whether the relabeled transfer pattern
    > continues."

-   date: "2026-12-15"

Lifecycle (current_state): surfaced → elevated \| deferred \| dismissed.
Dismissal and deferral are reversible: the object is greyed in the UX,
never deleted, and its recheck triggers stay live. An elevated Focus
must carry at least one elevated_into reference to a Project.

Graph edges: Focus-to-Focus relationships are relates_to references
with an edge status (proposed by the agent, confirmed or severed by a
human). Cluster membership is expressed purely through confirmed
relates_to edges; there is no separate cluster object.

Prose sections: \## Statement, \## Why It Matters, \## Open Questions,
\## Session Log, \## Review Notes.

### 4.3 Project

*A project's `title` is unique across the instance (`BIO_Membership_Architecture_v2.md` §7.1, Unicode-equivalent titles
counting as one; Membership §11 item 8's cross-document half, folded 2026-09-23 by BOB #32).*

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

Lifecycle (current_state): forming (Focuses aggregating, scope
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

risk_tier: undetermined \# 1 \| 2 \| 3 \| undetermined, from the evidence-package classification; undetermined wherever no member stated one (D-182)

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

"target_anchor": "focus.md#open-questions/OQ-3",

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

### 4.7 Moves are fenced from now on (BOB #34, 2026-09-24; D-546)

**RULED 2026-09-24 23:55Z by BOB #34 (D-546), folded here by that row:** *the fence governs moves MADE FROM NOW ON; the
history stays as it was written, and is COUNTED and SAID.* Every machine in this section — and the inquiry and bias
machines the catalogue carries beside them — is a table of the moves an item may make. Until D-546 the write path asked
only the bias table (D-468); every other type could be moved along an edge its table does not declare, and the tables
were descriptions nothing enforced.

- **Every move is asked.** `op=promote` refuses any move of an item with a head that its type's table does not declare,
  for every caller, by name (`STATE_MOVE_UNDECLARED`, C-86.6; a bias set keeps `BIAS_ILLEGAL_TRANSITION`, C-26.12). A
  revision that leaves an item where it stands is not a move and is how any item is amended. A creation has no head and
  is not asked here.
- **The table is the machine the plane runs.** A move is asked of the NORMALISED type's table, so a state a table keeps
  only for reading old records — the legacy Focus machine's `elevated` (§4.2), the inquiry's `published` (DEC-72) — is
  valid in the bytes that carry it and unreachable by any promotion.
- **The history is never rewritten.** Ratified bytes are immutable, so a stored move the current tables do not declare
  is never rewritten, reversed or "repaired". Where a reader meets one it is stated as *made by a path the current rules
  do not allow (before <fence date>)* — neither valid nor invalid — and the statement is never larger or smaller than
  the count. The reader is `op=statemovecensus`: it reads a stored move under the vocabulary its document was written in
  (the MAP RULE), pairs only versions whose chain joins (a pair that does not join is undetermined, counted apart), and
  dates each move by its writer's own `created`, saying so. The fence dates are the catalogue's
  (`STATE_MOVE_FENCED_SINCE`: bias 2026-09-24, every other type 2026-09-25); a move its writer dated on or after them is
  said to be so rather than placed before them.
- **Measured (M-179, 2026-09-25):** the live `bio` register holds 11 recorded moves over 79 joined version pairs — 10
  Information `collected -> verified` and one legacy `problem` `surfaced -> elevated` — and **none** is undeclared under
  the vocabulary it was written in. (Read in the machine the plane runs NOW, the `elevated` move would be the one; it
  was a declared move of the Focus machine that wrote it, and promote can no longer make it.) `scratch` holds none.

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
(evidence dependency), relates_to (Focus graph edge), elevated_into
(Focus to Project), initiates (Project to Action), derived_from
(successor or reopened lineage), supersedes. New relationship kinds
require a spec revision, not an inline invention; the checker rejects
unknown values.

**Amendment, 2026-07-24 (v1.5a).** The vocabulary gains a seventh value,
**corroborates**: an edge asserting that the citing object's content is
independently supported by the target, as distinct from `cites`, which asserts
dependency on it. Two documents that agree without either deriving from the
other are corroborating, and until now that had to be recorded as `cites`,
which overstated the dependency and understated the independence, in exactly
the situation where independence is the point.

This amendment records what the implementation already did. `bio-checks` has
carried `corroborates` in `REL_VOCAB` since before this document was published,
so a bundle using it passed the checker while contradicting the spec that claims
to be the closed authority. Discovered by the consistency audit of 2026-07-24
and recorded as DEBT D-8. The implementation was right and the document was
stale; this closes the gap in the direction of what already works, rather than
breaking records that use a value the checker has always accepted.

### 5.2 Direction and ownership

Each edge is written on the object that depends on or points to the
target, and the reverse direction is derived by the index, never
hand-maintained. cites lives on the citing object. elevated_into lives
on the Focus. initiates lives on the Project.

### 5.3 Substrate independence

No substrate file id, URL-to-substrate, or path appears in any reference or
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

**SEVERANCE DISCHARGES SUPPORT, NEVER CONNECTION — DEC-70, ruled by Bob 2026-09-10, folded here
2026-09-21 by BOB #23 (SCHEDULER #7's Q3).** A severed basis leg still receives the re-evaluation
obligation when what it named moves: the obligation attaches to what a finding EVER rested on, because
relative contributions shift under DEC-32's arithmetic, and when a strong branch later weakens, the
severed corroborating leg is the thread then needed. The boundary: a severed leg contributes nothing to
strength, gates nothing and counts toward no bar; the connection INFORMS, never binds. So a read of the
obligation marks which legs are severed and never describes one as resting on its target (REC-160). The
read is pulled, so no member is prompted (DEC-69); a pushed form, if one is ever built, tells once, is
dispositionable, and ages (D-79).

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
exist (elevated Focus has elevated_into; distributed Work Product has
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

**I-15 Recheck coverage.** Every Focus, in every disposition including
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
shared, through the embedded gate, with the endpoint daemon: one
codebase) and amended only by revision, never by code change:
monitor-tick may change source_status, monitoring.last_checked, the
reeval_pending record fields, and last_updated; sweep is creation-only
with no mutation of existing bundles; deadline-recheck may change clock
entry status and last_updated. last_updated rides every mutating set
because the write-completeness law makes it inseparable from any update;
it is not a separate permission but a consequence of writing at all. "Prior" is WRITE ORDER (D-674, 2026-09-25): a
promotion's `created` is the writer's own last_updated — kept so,
because C-12.1 compares against it — so two can carry the same one
(REC-182, 2026-09-23: on a `created` tie the immediately prior recorded
snapshot is the one written first) and a writer can date a promotion
BEFORE the one it follows. The immediately prior recorded snapshot is
therefore the one WRITTEN before — the store's write order (`rowid`),
never the writer's date and never the caller-chosen snap key, whose
lexical order is not a clock (D-171's precedent). The store's manifest
reads order by write order alone and publish `created` beside it,
named as the writer's date. The gate's audit walks the same order (D-700,
2026-09-25): the bundle image's `_history/manifest.json` carries on
every entry its write-order rank, `seq` (1..n); the file itself stays
sorted by snap key, as C-12.1 requires, and C-20.1 reads "prior" and
"next" by `seq`. An image without a distinct integer `seq` on every
entry is walked in snap-key order, as before, and C-20.1 says so in an
info finding rather than present a key-order walk as write order.

## 7. Violation-to-repair mapping

**A STATED LIMIT OF THE REACHABILITY CHECK (D-209; BOB #32, 2026-09-23).** The repair-reachability walk
(`repair-reachability.test.mjs`, REC-56) asks *"does the plane offer this act at this state"* ONLY where a repair names
an edge or a destination. A repair that names an op WITHOUT directing a state move is checked for the op's EXISTENCE
only. Closing that would need each arm's guard state extracted from its `current_state === '…'`; that is buildable, and
it is not built.

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

  I-15                    Focus without recheck \(a\) author a trigger,
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
    > endpoint carries the same codebase through the embedded gate
    > (build-time byte-verbatim propagation, hash-verified at compile,
    > verdict-parity asserted by conformance on every build). One check
    > codebase, three call sites: the session gate, the client checker,
    > and the endpoint. Divergence among them is itself a defect. The
    > daemon gates its own packages at packaging; per the July 20
    > operator decision (Tech Arch v10 Section 10.11), the promoter
    > additionally runs the gate on non-mechanical manifests,
    > so the store enforces its
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
algorithm, with the endpoint as standard off-kernel equipment), the
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

## Cross-reference: declared bias and workproduct_state (July 27, 2026)

When declared bias lands (BIO_Declared_Bias_v0_1.md), one rule joins this
document's family: a work product carrying unsettled **HUNCH DEBT** — a
connection graded ahead of its evidence (DEC-15) — cannot be ratified for
publication until it is cleared by re-running its evaluations under the current
set. Recorded here now so the state-rules corpus and the bias corpus cannot
drift apart.

> **CORRECTED 2026-08-05 (DEC-20, D-188).** This read *"a work product carrying
> unsettled BIAS DEBT (its cited bias manifest differs from the current
> effective set) cannot advance workproduct_state and cannot be ratified for
> publication"*. **Both halves were narrowed to hunches by DEC-20 on
> 2026-08-02.** Ordinary bias debt — the manifest differing from the current
> effective set — is DISCLOSED and travels with the work; it blocks no state
> transition and no ratification. The reason the two are treated differently: a
> hunch inflates a GRADE, so publishing over one states a strength that is not
> true, while ordinary bias only frames interpretation and disclosure fully
> answers it. **The drift this row was written to prevent is exactly the drift
> that happened** — the state-rules corpus went on asserting the blanket rule
> for three days after the bias corpus stopped.

## Amendment: `concluded` is a state of a PROJECT'S relationship with an inquiry (2026-09-18, BOB #15)

**Section 4's inquiry machine keeps its states; what one of them belongs to changes.** `concluded` was a single state of
the inquiry. On a shared inquiry that let one team's concluding move every team's stance, which
`docs/development/INVESTIGATIVE-SESSION.md` §7 forbids. `concluded` is now read FOR A PROJECT: the project's dated,
authored adoption of a version's claim, beside the version it stands on. An inquiry outside any project keeps its own,
as the relationship with no project. Conclusions already written into an inquiry's bytes are read as the concluding
relationship's, and ratified bytes are never edited, on the `published` amendment's precedent below. The design and
the decisions it follows are in INVESTIGATIVE-SESSION.md §7.1. It is built by REC-124.

## Amendment: `published` leaves the INQUIRY state machine (2026-09-10, DEC-72 / CASE-4)

**Section 4 owns the per-type state machines, and one word leaves the inquiry
machine here.** Bob ruled **DEC-72** on 2026-08-10 — *a case is a production of a
project: its own object, a set of finding-versions plus the publishing project* —
and its design, `docs/archive/CASE-AS-PRODUCTION.md`, states the consequence
for this section: *"A finding's lifecycle ends at `concluded`; publication is the
case relation. Reopening a finding is unchanged and never edits published
bytes."*

**WHAT CHANGES.** `published` is no longer a state an inquiry can ENTER. No
transition names it as a destination; it is removed from the machine's legal set
and carried in a separate `legacy` set, which is read when VALIDATING bytes and
by nothing that decides what the machine may DO. Its out-edges (`published ->
open | surfaced`) are retained so a document already sitting there is not
stranded. The authority for the edge set remains, as this section has always
said, the catalog: `bio-plane/checks/bio-checks.mjs`'s `STATES.inquiry`, which is
catalog-versioned and which the plane holds no second copy of.

**WHY THE LEGACY SET IS NOT A HEDGE.** Ratified bytes are immutable. A store that
has published anything holds frontmatter reading `current_state: published`,
inside a hash a stranger may already be verifying against, and inside a version
some published case froze by that hash. Rewriting those bytes would break every
pin that names them and would be this record editing what it has already signed.
The precedent is this section's own: the legacy `focus` machine is kept whole
because *a legacy document validates against the vocabulary it was authored
under*. The same rule, one machine over.

**WHAT DOES NOT CHANGE, AND IT IS THE HALF WORTH READING TWICE.** The rule that
rode on the deleted edge — **only a CONCLUDED finding may be a case member** —
survives in full. It was never a statement about a lifecycle state: it is that a
material set cannot be asserted over a question with no conclusion. Under the old
machine it was enforced as a side effect of `concluded` carrying a `published`
edge, so deleting that edge would have deleted the rule with it, silently. It is
now an explicit act-time refusal in the publishing act, named `NOT_CONCLUDED`,
which a reader can find and a suite can drive. `DEC-72`'s supersession table is
exact about this: *"the precondition survives as 'only a CONCLUDED finding may be
a case member'; the state itself becomes the case relation."*

**WHERE THE STATE WENT.** Everything the word used to answer is now answered by
the CASE RELATION — a case edition's membership row pinning that finding's
current version (`published_case_members.version_sha = bundles.bundle_sha`). That
is what fences a published case against division, restructuring and version
moves; what makes it reopenable; what makes it undisposable (§4's own rule that
*ageing is what happens to a finding nobody published* — D-79 — is preserved as a
named refusal, `PUBLISHED_CANNOT_BE_SET_DOWN`, because the edge table that used
to enforce it is gone); and what a published document's own bytes assert, through
the pair `case_id` + `case_edition` that publication stamps and reopening clears.

**Section 3.4's state history is unaffected in form and narrower in content:**
publishing appends no transition, because it moves no state. The act is recorded
in the document's Session Log and in the case relation, both inside the bytes the
member signs — which is what §2.1's state/record split has always required, and
what the catalog's own commentary had already observed in these words: *the
inquiry's STATE and its PUBLICATION HISTORY are two different records.*

Recorded here so the state-rules corpus and the case corpus cannot drift apart —
the obligation the cross-reference note above this one exists to enforce, and the
one that note measured failing for three days.

## Amendment: the producing `group` is ONE recorded value per instance (2026-09-21, D-436)

**§3.1 names `group` — the producing group's slug, which travels with every distributed copy — and did not say where
the value comes from.** The built plane answered with a literal: one group's slug, written as a default in eighteen
places, as a trimmed-argument default in two and unconditionally in three (a member's firsthand observation, its
promote meta, and a fork), and composed into new documents by the instance's own setup page. True of the instance that
wrote it and false of every instance `newgroup` installs — a sovereign group's record naming the wrong producer in its
own signed bytes. D-436's own row made the design call; this amendment records how it was built, and the three
decisions the build had to make — each made PROVISIONALLY by the D-436 worker (2026-09-21; IC-172). None is provisional
now, and two authorities settled them: decision (b)'s premise, that no migration and no automatic setting is owed for a
store that predates the value, was **RULED BY BOB** on 2026-09-21 (§3.1); decisions (a) and (c) are mechanism,
**DECIDED by the BOB lane** at integration the same day (BOB #23 accepted them as built). The merge first read all three
as Bob's; BOB #24 corrected the attribution on 2026-09-21, and IC-172's resolution carries the same split.

**THE RULE.** An instance's producing group is ONE value in its store (`instance_group`, one row, WRITTEN ONCE — no
statement updates or deletes it, and `op=purge` leaves it). Every default and every stamp reads it and nothing else:
every document the plane CREATES carries it as `group:` in its bytes, whatever a caller wrote, and the projection's
`group_id` is written with it; a revision keeps the group its creation wrote. It is never a literal in the code, and it
is never RE-READ from a deploy-time variable, because it is in signed bytes and a redeploy must not be able to move it.
A replayed creation (historical replay is not authorship) carries the past's bytes verbatim.

1. **Where it comes from (decision a).** At the store's FIRST BOOT — the first pass over storage that has never held
   this schema — from the slug the installer bound as `INSTANCE_NAME`, which is the worker name the group chose
   (D-102) and is bound in the same upload that creates the worker. It is read at that moment only, checked against the
   installer's own slug grammar, and a missing or malformed name records nothing. The first boot was chosen over the
   operator's first claim because the scratch namespace is a separate store no claim reaches, because the root of trust
   can write before anyone claims, and because a claim can be re-armed.
2. **A store that predates the value (decision b).** A store that already held the schema records nothing at boot, even
   with the variable bound: this project's own instance is named for its worker and not its group, and a sovereign store
   installed earlier holds documents already stamped with the old literal, so the variable and the record can disagree
   and choosing between them is a person's act. The root of trust records it ONCE (`op=instancegroupseed`); a second
   seed is refused (C-64.3). Documents already written are not rewritten — their bytes are signed.
3. **Nothing recorded (decision c).** A write that must name its producing group is never given a default. A caller's
   own statement of its group is kept as the caller's, exactly as before; a creation stating none, a document the plane
   composes itself, a division whose parent names none, and the group default bar with no group named are refused by
   name (C-64.1). The read `op=instancegroup` says in words when nothing is recorded.

**WHAT THIS DOES NOT DECIDE, stated rather than left to be found:** what a document already signed under a WRONG
producer can become (it cannot be rewritten; a correcting act is undesigned as of 2026-09-21); what `group` means for a document that
genuinely came from another group (no import path exists — replay is the only one, and it keeps the past's bytes); and
whether the setup page and the member UI should learn the value at all, since the plane now stamps every creation.
