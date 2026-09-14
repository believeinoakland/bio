# BIO / CivicOS — the system design

**Status** · v0.1 DRAFT, written 2026-09-14 by session BOB #10 at Bob's direction, as of 2026-09-14, awaiting Bob's review. This is the level-0 document the design corpus standard (`CORPUS-STANDARD.md` §2) requires: the whole system described broadly and completely at one altitude — its purpose, the path it serves, every major construct with its importance, its relationships and its home document, and the runtime shape — so that a reader can place any construct before opening its document. It is written from the record at `origin/main` `c2ba7a2` and from the documents it points at; it rules nothing and designs nothing of its own. Completeness: the construct inventory (§3) is believed complete at this altitude and every row's STATE column is this session's reading, not yet Bob's; §5's ladder states are pointers to `MILESTONES.md`, which stays the authority for what is open. The one caveat: several level-1 documents this map points at were written against the retired runtime and say so in their own front matter — read their Status before their body.

**Place in the system** · The top of the design corpus. Every level-1 document in `docs/architecture/` is a construct named in §3 or a mission document named in §2; a construct not named here is not a major construct, and a new one is added here in the same landing that gives it a home (`CORPUS-STANDARD.md` §4). `README.md` catalogs the documents; this document places the constructs. `CLAUDE.md` carries the doctrine every session loads and points here for the whole.

**Incomplete sections** ·
- §3 — the STATE column of every row is one session's reading against the record on 2026-09-14 and awaits Bob's review; the CONTENT row's state is the reason this document exists and is the first row to check.
- §4 — the class diagram shows the 14 constructs that have relationships drawn; construct 10 (standing intent and monitoring) is folded into Capture and Operations there and is not a separate class until Bob confirms the inventory.
- §5 — the capability ladder is summarised by pointer; per-milestone state is not restated here because `MILESTONES.md` is its authority and a copy would drift.
- §6 — the runtime shape names what is deployed on the project's instance; a sovereign group's instance differs (no fleet until Bob's gate, D-297) and the differences are listed, not designed.

**Contents**
- [1. Purpose — the path, and the stance](#1-purpose-the-path-and-the-stance)
- [2. The system in one view](#2-the-system-in-one-view)
- [3. The major constructs](#3-the-major-constructs)
- [4. How the constructs relate](#4-how-the-constructs-relate)
- [5. The capability ladder as the completeness map](#5-the-capability-ladder-as-the-completeness-map)
- [6. The runtime shape](#6-the-runtime-shape)
- [7. The doctrine spine](#7-the-doctrine-spine)
- [8. What this document does not own](#8-what-this-document-does-not-own)

---

## 1. Purpose — the path, and the stance

**CivicOS exists to answer questions, make a case, tell a story, and take action to affect
a living civic system** (Bob, 2026-08-01, `CLAUDE.md`). Everything in this system is
substrate for one thing: supporting a member through the winding path of *questioning,
exploring, discovering, documenting, and impacting* the civic system they live in. A
capability that does not serve that path is not obviously worth building.

The stance is doctrine (`CLAUDE.md`, "The stance"): the objective is BETTER GOVERNMENT
through greater understanding, less narrative, and accountability; all stakeholders are
presumed to want better outcomes; bad actors are identified by EVIDENCE, never assumed by
role; and *less narrative* binds us before it binds anyone else. The product is therefore
**the trustworthiness of the record**: a group captures what a public body published and
can prove later that it said what they claim. A defect that lets the record claim more
than it can support is worse than a missing feature.

Three rules follow and govern every construct below: **undetermined is first-class and
must be stated**; **an equality or outcome that costs nothing to produce is not
evidence**; **derived things inform, authored acts bind** — the machine may do the
LOOKING, the member does the CONCLUDING (DEC-24).

## 2. The system in one view

A **group** — as small as one person (Design Requirement 2) — installs its own
**sovereign instance** into its own Cloudflare account with the installer `newgroup`
(§6). The instance is a **plane** (a Worker) fronting a **Durable Object with SQLite**
that holds the **record**, with captured bytes in **R2**. Members reach it through the
member surfaces (`civicos-ui`) and, where they choose, through an **assistant** that works
under the same fences. The plane **captures** documents a public body publishes and keeps
their **provenance**; it **extracts content** from them; it derives **meaning** — entities,
connections, progressions — and states how strongly each is established; members author
**inquiries** that rest on content and on other inquiries, conclude them as **findings**,
and produce a **case** the group **stands behind** and **publishes**; the published corpus
is verifiable by a stranger with no credential; and outward **action** can say which
findings justified it. The instance keeps itself current unattended (a scheduler on one
reconciling alarm), tells the truth about what it is and can do, and can be left,
mirrored and outlived.

The mission-level constraints every construct satisfies are in two documents that own no
construct: `BIO_Complete_Roadmap_v5.md` (the mission of record: values, principles, the
seven-category UX, the stance) and `BIO_Design_Requirements_v2.md` (fifteen requirements;
"the system fails if any is violated"). On conflict the Design Requirements govern.

## 3. The major constructs

One row per construct. **Importance** says why the row exists at this altitude. **Relates
to** names the constructs it depends on or feeds. **Home** is the level-1 authority; a
level-2 design that serves the construct is named in brackets. **State** is this session's
reading of the record on 2026-09-14 (see Incomplete sections).

| # | construct | what it is | importance | relates to | home | state |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **Membership and authority** | cover and handle, administrators and the two-administrator floor, capabilities, burner-URL invitations, project participation and ownership, secure verified export; who may perform which act, and what an act is worth when a machine performs it | every authored act in the system is attributed to a member; the fences on capture, attestation and publication rest on it | record (3), publication (13), assistant (11) | `BIO_Membership_Architecture_v2.md` [`AUTHORITY-AND-TRUST.md`] | built for the acts the record carries; root of trust deliberately unmodelled (v2 §9, DEC-2 deferred) |
| 2 | **Intake, capture and provenance** | how material enters the record: admission requires provenance never relevance; capture grades; the provenance chain of hops; the daemon/member division of who fetches; the archive fallback; link fidelity; authority follows the data | the record's trust root — a hop attests "these bytes, this URL, this time" and no more; everything above inherits the document's chain | record (3), content (4), scheduler (14) | `BIO_Intake_Doctrine_v1_1.md` [`LINK-FIDELITY.md`, `ARCHIVE-FALLBACK.md`, `SOURCE-ACCESS.md`, `CAPTURE-SCALING.md`, `CLIENT-RENDERED.md`] | built (CAPTURE area); doctrine document predates the plane and names the retired daemon — see its front matter |
| 3 | **The record** | the bundle: id grammar, universal frontmatter, per-type schemas and state machines, the closed relationship vocabulary, cascade semantics, the invariant set and the violation-to-repair map, the Mechanical Verification Law; the C-series check catalog that gates every write | the shape everything else is stored in and checked against; the plane implements it and `bio-checks.mjs` runs it | all rows | `BIO_State_Rules_Consistency_v1_5.md` [`BIO_Bundle_Skill_Composite_Design_v1_7.md` for the inherited format and checks] | built and live; the specification's §1–2 describe a store that was not built (its own banner), the rules from §3 on transferred |
| 4 | **CONTENT** | the unit the record points at: a reference to a PART of a document up to and including the whole (DEC-23); its two intrinsic properties — EXTENT and EXTRACTION METHOD (DEC-4); the forms it takes; the extraction process as built; how it is organized and reached; the central gap — *the address exists, no edge carries it* (D-164) | **the heart of the system** (Bob, 2026-09-15): documents are harvested, content is extracted, meaning derives from both; a store of unread documents is noise with good provenance | capture (2), record (3), meaning (6), inquiry (8), retrieval (9), assistant (11), surfaces (12) | `BIO_Content_Framework_v0_10.md` **Part II** [`CONTENT-EXTENT-DESIGN-SPACE.md`, `STORE-AS-CACHE.md`] | model RULED, object UNBUILT; Part II is DRAFT awaiting Bob's review; the six pieces of Part II §18 are the design frontier; D-164 reopened 2026-09-15 |
| 5 | **Document profile and the extraction substrate** | recognisers over three axes (host stack, content type, format); regions and three digests; change as layers with one entry point; the transcription chain and its four rules; calibration; the L2→L3 wire through three tiers (in-plane, pdf-worker, ocr-worker) | how bytes become readable text and readings honestly — the machine's EXTRACT role as built | capture (2), content (4), fleet (15) | `BIO_Content_Framework_v0_10.md` **Part I** [`DOCUMENT-PROFILES.md`, `OFFICE-FORMATS.md`, `CONSTRUCTS.md` as the 2026-07-30 inventory] | Part I approved 2026-07-30 and built (FW series, COFF-1..7, CPDF-9/10/13/15); three doctype readers; tables and images as content absent |
| 6 | **Meaning: entities, connections, progressions** | the entity axis (registry, aliases, constitutive relations, graded resolutions); referential and temporal connections as DATA with their own grade; progressions as the many shapes a happening takes, with the missing predecessor as a finding; identifier spaces where grade collapses | "every document that concerns this ordinance" is one query; a connection has a grade like a capture does; a machine-proposed connection is a HUNCH until earned | content (4), bias (7), inquiry (8), retrieval (9) | `BIO_Content_Framework_v0_10.md` Part I §8, §8.1–8.3 | entity axis built at document grain (M4 partly); connections discard the anchor (D-161); content-grain connections wait on reading position (Part II §18) |
| 7 | **Declared bias** | bias as a declared, justified, first-class construct: three statement kinds, bundles and adoption, the subject registry (the same construct as the entity axis), bias debt versus HUNCH DEBT, the authored acknowledgement at export, regrade and the cross-group rerun | "less narrative" made mechanical: what a member brings to the record is stated, and evidence accrues to it | meaning (6), inquiry (8), publication (13) | `BIO_Declared_Bias_v0_1.md` | doctrine ruled (DEC-6, DEC-15, DEC-20, DEC-46); `object_type: bias` and the acknowledgement built; regrade/rerun prose only |
| 8 | **Intent and inquiry — from goal to case** | goals → objectives → aspirations and the discovery loop; the recursive INQUIRY (a question nests, concludes as a FINDING, its legs rest on content and other inquiries with earned grades per axis, its strength composed by DEC-32's arithmetic); the required falsifier; CHECK; a CASE as a production of a project (DEC-72); the action plan | this is what the whole system is FOR — "case-making is undesigned, and it is what the whole system is for" (D-127, since designed and built through the IS plan) | content (4), meaning (6), bias (7), assistant (11), surfaces (12), publication (13) | `BIO_Content_Framework_v0_10.md` Part I §12; `BIO_Case_Making_v0_1.md` as the reasoning record; the rulings DEC-15…DEC-32, DEC-72 [`INVESTIGATIVE-SESSION.md`, `docs/archive/IS-BUILD-PLAN.md` — the plan closed at 43/43 and is closed history] | built (IS plan 43/43 rows; CASE arc done); the claim object and its standard of proof are DOCTRINE still Bob's (Part II §18 item 6); publication ceremony deferred (DEC-33) |
| 9 | **Retrieval — the store as a read-through cache** | three axes (document, content, meaning), each with its own frontier, states and repair (FETCH / EXTRACT / DERIVE); the four-level search (meaning, content, documents, the open internet) — a search that returns documents has not finished; the query compiler with one compilation point; FTS5 inside the Durable Object | the reason the store is never assumed complete; sparse is normal at every level and saying WHICH absence is true is a first-class obligation | content (4), meaning (6), assistant (11), surfaces (12) | [`STORE-AS-CACHE.md`, `RETRIEVAL-SUBSTRATE.md`] — Part II §14.2–14.3 carry the adopted tables | document-grain search built; meaning arm A landed; content-grain search ABSENT (Part II §17); the observation log ABSENT |
| 10 | **Standing intent and monitoring** | named requests and ratified sweeps; the frontier of deferred links; monitoring contracts; change detection through the digests; what the instance does unattended | the record stays current without anyone calling an op | capture (2), scheduler (14) | `BIO_Intake_Doctrine_v1_1.md` §4; `BIO_Content_Framework_v0_10.md` Part I §6 [`SCHEDULER.md`, `NOTIFICATIONS.md`] | built (M1); the authored frontier — a member's LEAD — has no home (D-194) |
| 11 | **The assistant and the AI roles** | the machine may FIND / PURSUE / EXTRACT / CHECK and request capture; it never touches the provenance chain, never attests, never concludes; its work is labelled and graded as machine work; the investigative session and its run log; the skill and doctrine pack; the credential cascade through `agent-worker` | one way in, on every surface; central to what BIO offers, and bounded by the same fences a member's act carries | content (4), inquiry (8), surfaces (12), fleet (15) | DEC-24 and DEC-60/61/62 in the ledgers [`INVESTIGATIVE-SESSION.md`, `ASSISTANT-PILOT.md`, the SKILL kickoff] — **no level-1 document owns this construct** | investigative session built; assistant pilot designed; AI EXTRACT role named, not designed |
| 12 | **Member surfaces and the interaction constructs** | QUEUE and ACT as the two constructs, the rung ladder of authored acts (release → stand behind → ground → conclude → accept → ratify), UNDETERMINED as a display primitive; the guiding voice (inform once, never nag — DEC-69; nothing prefilled; capability absent, never greyed); the iterative case journey; the public/verify surface | how a member reaches what the record holds (M8) and traverses the path (§1); UX is paramount | every row | `BIO_Interaction_Constructs_v0_1.md` [`UI-PLAN.md`, `UI-KICKOFF.md`; the Iterative Case Journey canvas] | U1–U7 built; the journey frame and seam confirmed by Bob 2026-09-14; the member cannot yet complete the journey (publishing dead-ends; CHECK op-only) — the UX change list is the next decomposition |
| 13 | **Publication, audiences and communications** | one-way publication (DEC-19), editions (DEC-12), the authored statement of what was left out, the eight audiences and their output acts, the publication fence on the provenance chain, evidence-package risk tiers, the platforms for cross-group discussion and the directory | the point where the record's trustworthiness becomes public and irreversible | inquiry (8), bias (7), membership (1) | `BIO_Communications_Platforms.md`; the audiences research in `docs/archive/research/AUDIENCES.md`; rulings DEC-12/19/33 — **no current level-1 document owns publication as a construct** | fence and one-way publication built; the ceremony deferred on Bob's trigger (DEC-33); public/verify surface a stub; three output-act divergences unmade |
| 14 | **Scheduler and operations** | one reconciling Durable Object alarm; interruption recovered by re-deriving outstanding conditions from durable state; the host governor; the inbox; audit | the instance keeps its own record current unattended (M1) and recovers from any signal loss by state, never by signal | capture (2), monitoring (10) | [`SCHEDULER.md`, `INBOX-GRAMMAR.md`] — Tech Arch §10.7's interruption model is the rule that survived | built |
| 15 | **Distribution: installer, releases, fleet, multi-instance** | `newgroup` installs a sovereign instance into a group's own account; DIST cuts signed releases from a green main and deploys with byte-verification and rollout gates; the fleet members (pdf-worker, ocr-worker, agent-worker) beside the plane; several instances per account isolated by structural partition | the distribution model IS the product — sovereign instances, not a hosted service | record (3), extraction (5), assistant (11) | `BIO_Technical_Architecture_Decisions_v10.md` (the decisions that survived the substrate change) [`MULTI-INSTANCE-ISOLATION.md`, `kickoffs/DIST.md`, `VERIFICATION.md`] — **no current level-1 document describes the deployed topology** | installer built and verified (D-297 closed); 0.58.0 deployed; fleet to a group is Bob's gate; multi-instance planned, not built |

Three rows carry **no level-1 home** in bold: the assistant (11), publication (13), and
distribution (15). Each is described across ledgers, kickoffs and level-2 designs and
nowhere as a construct. Under `CORPUS-STANDARD.md` §4.3 those are the three documents the
corpus owes; they are named here so the gap is explicit rather than derivable.

## 4. How the constructs relate

Read §3's rows downward and the dependency runs one way: **membership** attributes every
act; **capture** establishes what the bytes are and where they came from; **the record**
stores and checks; **content** is extracted from what the record holds and is the unit
every edge should point at; **meaning** is derived over content; **bias** states what the
member brings; **inquiry** rests on content and meaning and concludes; **retrieval** is the
one process that searches all four levels and grows every layer; **the assistant** does the
looking at every layer under the member's fences; **the surfaces** are where the member
authors each rung; **publication** is where the group stands behind the result; and
**distribution** and **operations** are what make an instance exist and keep it honest
unattended.

The two cross-cutting rules: **grade tracks directness and never composes across scales**
(capture grade is the document's; a content's derivation cap is its own; a connection's
grade is a third; DEC-21 shows both on one leg and CPDF-10 forbids a third scale); and
**every layer may be sparse, and absence at one level is not evidence of absence at the
next** (Part II §14.3).

The same relationships as a UML class diagram (the settled notation for structure; edges
read as "depends on / feeds", labelled with the act; validated against the mermaid parser
with `tools/mermaid-check.mjs` before landing):

```mermaid
classDiagram
  direction TB
  class Membership {
    +cover and handle
    +administrators, capabilities
    +project participation
  }
  class Capture {
    +provenance chain
    +capture grade
    +standing intent
  }
  class Record {
    +bundle, states, checks
    +invariants I-1..I-20
  }
  class Content {
    +extent
    +extraction method
    +derivation cap
  }
  class Extraction {
    +recognisers, digests
    +transcription chain
    +three tiers
  }
  class Meaning {
    +entities, resolutions
    +connections, grade
    +progressions
  }
  class DeclaredBias {
    +statements, bundles
    +bias debt, hunch debt
  }
  class Inquiry {
    +legs, earned grades
    +finding, falsifier
    +case as production
  }
  class Retrieval {
    +three axes
    +four-level search
  }
  class Assistant {
    +FIND PURSUE EXTRACT CHECK
    +never attests
  }
  class Surfaces {
    +QUEUE, ACT
    +rung ladder
  }
  class Publication {
    +one-way, editions
    +audiences, fence
  }
  class Distribution {
    +installer, releases
    +fleet, isolation
  }
  class Operations {
    +reconciling alarm
    +audit
  }
  Membership --> Record : attributes every act
  Capture --> Record : admits with provenance
  Record --> Content : holds documents content is extracted from
  Extraction --> Content : produces
  Content --> Meaning : derived over
  DeclaredBias --> Meaning : shares the subject registry
  Content --> Inquiry : legs rest on
  Meaning --> Inquiry : legs earn grade from
  DeclaredBias --> Inquiry : states what the member brings
  Retrieval --> Content : searches and grows
  Retrieval --> Meaning : searches and grows
  Retrieval --> Record : searches and grows
  Assistant --> Retrieval : looks through
  Assistant --> Capture : requests capture
  Surfaces --> Inquiry : member authors each rung
  Surfaces --> Capture : release is the first rung
  Inquiry --> Publication : case is stood behind
  Publication --> Membership : owner-gated
  Distribution --> Record : installs the instance that holds it
  Distribution --> Extraction : deploys the fleet
  Operations --> Capture : keeps the record current
```

## 5. The capability ladder as the completeness map

`docs/development/MILESTONES.md` is the authority for what is open. Its ladder is the
system's completeness statement at the capability altitude, and each rung maps onto §3:

| rung | capability | constructs |
| --- | --- | --- |
| M0 | the plan and its verification are trustworthy | process (`VERIFICATION.md`, `plancheck`, this corpus standard) |
| M1 | the instance keeps its own record current, unattended | 10, 14 |
| M2 | every document class Oakland publishes can become evidence | 2, 5 |
| M3 | the record knows what it holds | 5 |
| M4 | the record connects what it holds | 4, 6 — **D-164 is this rung's open primitive** |
| M5 | the record can be searched over its content, not only its notes | 4, 9 |
| M6 | the record can be left, mirrored and outlived | 3, 15 |
| M7 | a group can install and run it honestly | 15 |
| M8 | a member can reach what the record holds | 12 |
| M9 | a member can state what they found, and what it rests on | 8 |
| M10 | the group can stand behind what it found, and act on it | 8, 13 |

## 6. The runtime shape

What is deployed on the project's own instance at 0.58.0 (`release/RELEASE.json`;
`bio-plane/wrangler.jsonc`):

- **`bio-plane`** — the Worker (`src/index.mjs`, the control plane and the OPS table) and
  the Durable Object `Store` (`src/store.mjs`, `src/schema.mjs`) with SQLite; bindings
  `CAPTURES` and `PUBLISHED` (R2), `PDF_WORKER`, `OCR_WORKER`, `AGENT_WORKER`, `SELF`.
- **Fleet members** beside it, each one area's code and DIST's release object:
  `pdf-worker` (tier-2 text), `ocr-worker` (tier-3 OCR, tesseract-wasm, reads captured
  bytes from R2 itself), `agent-worker` (the assistant's credential cascade and plane
  callback).
- **`civicos-ui`** — the member surfaces, a Worker-served UI proxied to the plane.
- **`newgroup`** — the installer: OAuth into the group's account, plan probe, buckets,
  plane and members uploaded and byte-verified, the front page.
- **`docprofile/`** — the recogniser library the plane bundles (`tools/bundle-docprofile.mjs`).

A sovereign group's instance differs today in one measured way: it receives no fleet
until Bob's gate clears (D-297 closed; deployment is his click), so its tier-3 branch is the
honest `else` — nothing is claimed about a scan's text. Several instances in one account
collide on bucket and fleet names today; the plan to partition them structurally is
`MULTI-INSTANCE-ISOLATION.md`, sequenced after the member surfaces.

## 7. The doctrine spine

The rulings that govern every construct, each stated once where it lives and cited from
here rather than restated:

- **Content is the unit; a document is not the answer** — DEC-23; `CLAUDE.md`; Part II §14.
- **The machine may EXTRACT; the member concludes** — DEC-24; Part II §14.5.
- **Machine-read text is never indistinguishable from publisher text; OCR never raises a
  capture grade; fidelity bounds the capture axis, no third scale** — DEC-4, CPDF-10.
- **Undetermined is first-class and stated; an outcome that costs nothing is not evidence;
  the publication fence sits on the provenance chain** — `CLAUDE.md`, Intake Doctrine.
- **Legs compose by AND/OR; weakest governs across AND, strongest across OR; sufficiency
  only by an attributed act** — DEC-32.
- **A case is a production of a project; publication is one-way; return is a new edition**
  — DEC-72, DEC-19, DEC-12.
- **The workflow respects the member's judgment: inform once at the act, never nag** — DEC-69.
- **No structural prior against any class of actor; bad actors are identified by evidence**
  — `CLAUDE.md`, "The stance".

## 8. What this document does not own

The mission and requirements (`BIO_Complete_Roadmap_v5.md`, `BIO_Design_Requirements_v2.md`);
every construct's detail (its level-1 home in §3); the process by which the system is
built (`docs/development/ORCHESTRATION.md`, `PARALLELISM.md`, `VERIFICATION.md`); the
ledgers; and every ruling, which stays in the ledger it was ruled in.
