# D-164 design space — the content object and the extent-carrying edge

**Status** · A design-space study, 2026-09-15, by session BOB: the fixed constraints, three options for the content object and the extent-carrying edge, doctrine (Bob's) separated from mechanism (the architect's), and a dependency sketch of the build. Options and constraints, NOT a decision; the author's lean (option (c), the hybrid) is recorded as a lean. Complete as a study at `origin/main` `51d128a`; §5 brings the doctrine items to Bob in the shape he rules on and §6 records the mechanism decided provisionally by BOB #10 under his standing delegation (option (c), the hybrid). as of 2026-09-14.

**Place in the system** · A level-2 design serving `BIO_Content_Framework_v0_10.md` Part II §18, piece 1 (D-164), and through it construct 4 of `BIO_System_Design.md` §3. It touches interfaces I5 and I3 (RECORD's) and I2 (FRAMEWORK's, dormant), and its §3 doctrine list is what goes to Bob before any mechanism is chosen.

**Incomplete sections** ·
- §3 and §5 — every doctrine item is open with Bob; §5 carries each in the shape he rules on, for the sitting after his Part II review.
- §4 and §6 — the mechanism is decided provisionally (option (c)); the IC on I5/I3 and the queue items are written after Bob confirms Part II.

**Contents**
- [1. The fixed constraints](#1-the-fixed-constraints)
- [2. The design options](#2-the-design-options)
  - [(a) First-class content object](#a-first-class-content-object)
  - [(b) Extent on the edge](#b-extent-on-the-edge)
  - [(c) Hybrid — a content row minted lazily on first edge](#c-hybrid-a-content-row-minted-lazily-on-first-edge)
- [3. Doctrine (Bob's) vs mechanism (the architect's)](#3-doctrine-bobs-vs-mechanism-the-architects)
- [4. Build shape (dependency sketch, no scoping)](#4-build-shape-dependency-sketch-no-scoping)
- [5. The doctrine items, in the shape Bob rules on](#5-the-doctrine-items-in-the-shape-bob-rules-on)
  - [5.1 May a content-grain leg claim MORE on the connection axis than a document-grain one?](#51-may-a-content-grain-leg-claim-more-on-the-connection-axis-than-a-document-grain-one)
  - [5.2 Is a member's transcription a derivation or a verification?](#52-is-a-members-transcription-a-derivation-or-a-verification)
  - [5.3 Is `unstated` a legal extent?](#53-is-unstated-a-legal-extent)
  - [5.4 D-161: the determining reference pair, or all supporting mentions?](#54-d-161-the-determining-reference-pair-or-all-supporting-mentions)
  - [5.5 What is the CLAIM object, and what is its standard of proof?](#55-what-is-the-claim-object-and-what-is-its-standard-of-proof)
  - [5.6 D-184: may a firsthand observation be CONTENT with no capture behind it?](#56-d-184-may-a-firsthand-observation-be-content-with-no-capture-behind-it)
  - [5.7 DEC-24's boundary: may an AI extractor WRITE content rows?](#57-dec-24s-boundary-may-an-ai-extractor-write-content-rows)
- [6. The mechanism — decided provisionally by BOB #10, 2026-09-14](#6-the-mechanism-decided-provisionally-by-bob-10-2026-09-14)

---

**Basis and lean: design-space study, 2026-09-15, written by BOB. Options and constraints, NOT a decision.**
Basis: `origin/main` `51d128a` for code; `docs/architecture/BIO_Content_Framework_v0_10.md`
Part II (§§14–19) for the content design this prepares — §18 names this piece. Bob reopened
the D-164 thread on 2026-09-15 (DEBT D-164 row). The design step that consumes this study is
the successor BOB's, interactively with Bob on the DOCTRINE items in §3; the MECHANISM items
are the architect's. BOB's own lean, recorded for the successor and not yet ruled: **option
(c), the hybrid — a content row minted lazily on first edge, content-addressed by
`hash(capture_sha, canonical extent, chain)`**, because it gives one target vocabulary for
every leg (a whole-document leg mints a `document`-extent row), dedup by construction, no
allocator race, a small table, and first-class rows that go `stale` rather than being
rewritten. Every claim below is cited; `store.mjs` is 29,465 lines and `index.mjs` 7,390 at
`51d128a`.

## 1. The fixed constraints

**1.1 DEC-23's consequent shape** (`docs/archive/ledgers/DECISIONS-2026-08.md:1631-1636`): a leg points at CONTENT or another inquiry; a connection relates two pieces of CONTENT; a citation points at CONTENT; content carries its EXTENT and HOW IT WAS EXTRACTED; capture grade stays the DOCUMENT's. A whole document is content's *widest extent* (:1609). Enacted provisional (:1638; `QUEUE-2026-08.md:820`): target stays an `INFO-`/`INQ-` id and *"no second reference vocabulary meanwhile"*. `store.mjs:7917-7920` says `inquiry_basis.target_type` exists *because* of DEC-23's "content or another inquiry".

**1.2 DEC-4** (`DECISIONS-2026-08.md:121-135`): OCR text never indistinguishable from publisher text, *"structural and not a convention"*; **"AN OCR CITATION CARRIES ITS IMAGE REGION — a basis leg resting on OCR'd text names the page and rect"** (the one edge shape doctrine already REQUIRES); OCR never raises a capture grade. CPDF-10 fixed the arithmetic: fidelity BOUNDS the capture axis as its weakest link, *no third scale* (`QUEUE.md:873`; `textchain.mjs:92-99`, `:797-806` `captureBound` — an undetermined cap returns `null`, never passes the byte grade through). Framework §14.4: two graded facts, the document's capture grade and the content's derivation cap (`derivation_cap`, min over steps, NULL = undetermined stated, `schema.mjs:2460-2461`).

**1.3 IC-1's union and its rules** (`INTERFACES.md:314-322`; `INTERFACE-CHANGES.md:46-80`): `source: {kind: pdf-page|sheet-cell|slide-shape|doc-para|dom, ref, …} | null`; `kind` REQUIRED (silent-misread fence), `ref` REQUIRED (human form produced by the container that knows it); pure string and pure structure both rejected (:76-80). `doc-para` (:98-127): a DOCX has no pages in its bytes, so a page reference *"would claim something the captured bytes do not say"*; `para` index anchored to the capture sha; `run` optional. **The constraint recorded with acceptance** (:150-158): this union *is* D-164's per-container LEAF, *"the same tags a leg, a connection and a citation will use"*, so *"no implementer forks a second reference vocabulary"*. FRAMEWORK (dormant; CONDUCT answered in writing, :131) may re-open with a COUNTER when it wakes (:162-164). Emitters: `formats-xlsx.mjs:151`, `docx.mjs:106`, `pptx.mjs:132`, `index.mjs:2789`; **`dom` has no producer**. **Narrower than the union:** `checkAnchor` (`textchain.mjs:648-666`) accepts ONLY `pdf-page` with page+rect as a transcription anchor; a region without one is DROPPED at the wire (`index.mjs:2859-2870`).

**1.4 Three extent grammars already exist and are not one:** (i) attestation `region|page|document` + `extent_page` + `extent_rect` (`schema.mjs:2436-2438`; `EXTENT_KINDS`, `textchain.mjs:199`); (ii) derivation `step.extent = {kind:'pages', pages:[…]}` — ABSENT = whole document, UNREADABLE covers nothing and makes the cap undetermined (D-252, `textchain.mjs:200-240`; `derivationCap(chain, target)` asks per page, `:462-516`; a mixed document's cap is UNDETERMINED, `index.mjs:5146-5169`); (iii) IC-1's five container arms. A fourth grammar would be D-164's *"built three times and drifts"* (`DEBT.md:133`) realised.

**1.5 Attestation coverage** (`textchain.mjs:727-744` `extentCovers`; `:761-790` `gradeCeiling`; `store.mjs:10954-10992` `attestationsFor`): a covering attestation supersedes the derivation cap as grade determinant to `EARNED_CAPTURE_CEILING` (`'B'`, `bio-checks.mjs:2931`), *"never as record"*; an unparseable extent covers NOTHING (default-not-covering); region containment is same-page rect inclusion, PDF only; attestation is VERIFICATION not derivation (`:61-76`); stale-not-deleted when the chain moves (`store.mjs:10980-10984`). `schema.mjs:2420-2424`: extent columns are separate *"because COVERAGE IS A QUERY"*. Machine credential refused (C-35.10, `bio-checks.mjs:8990-8997`); extent required (C-35.11, `:8999-9005`).

**1.6 The column arrives with its writer** (`schema.mjs:1989-1993`; restated at `bio-checks.mjs:6843-6847`): a nullable extent nothing writes *"would be the record advertising a precision it does not have — a reader would take its absence for 'the whole document was meant' rather than 'this record cannot say'"*. This is D-129's somevalue/novalue split (`DEBT.md:97`) applied to the extent column.

**1.7 Leg targets** (C-2.8, `bio-checks.mjs:3004-3009`): target must match `BUNDLE_ID_RE` (`:23`) and normalise to `information|inquiry`; version legs the same at C-25.10 (`:7108`). D-181/D-184 (`DEBT.md:149-150`) fix the vocabulary at exactly those two. **Any content id that is not a bundle id fails C-2.8 today** — every option below changes the check catalogue's target grammar.

**1.8 DEC-32's arithmetic**: MIN over AND legs, MAX over OR branches, default AND, sufficiency only by an affirmative attributed act (`affirmed_parts`, `schema.mjs:2007-2020`). DEC-21: one document leg carries BOTH grades. Earned grades are computed by the record, never taken from a caller (`checkEarnedLeg`, `bio-checks.mjs:3322-3370`; `earnedBasisRegistry`, `store.mjs:13160`). **Content grain changes no operator** — CPDF-10 already forbids a third scale — but it changes the *inputs*: the per-leg capture ceiling becomes `captureBound(chain-over-extent)` or an attestation covering the extent, and the connection population becomes a question (§3).

**1.9 D-161's open question** (`DEBT.md:130`): determining ref pair vs all supporting mentions; recommendation the determining pair. `deriveConnections` (`store.mjs:12856-12890`) collapses to the strongest grade per capture and drops the ref; `connections` keyed `(a_capture_sha, b_capture_sha, entity_id)` (`schema.mjs:961-969`). **Hard dependency:** `reading_refs` carries no position (`schema.mjs:674-692`) and `parse()` entities carry `key/kind/label/facts` only (`index.mjs:4935-4942`), so **a content-grain connection is impossible under ANY option until readings carry WHERE a reference was read** — FRAMEWORK's `docprofile/` and I2.

**1.10 D-113** (`DEBT.md:85`; `hygiene.test.mjs:497-560`; `store.mjs:17885-17890` TABLES): a new table carries `bundle_id` to clear in BOTH purge arms, or is special-cased like `connections` (`schema.mjs:955-958`). I5's rules: before `host_governor`, in purge, version bump.

**1.11 Id namespaces.** `tools/mintid.mjs:211-260` governs DOCUMENT ids, not runtime ids. Runtime precedents: `CAL-<n>` *"minted by the store, never by a caller"* (`schema.mjs:2642`; `store.mjs:11191-11209`); `ENT-YYYY-NNNN` (`bio-checks.mjs:621`); the register's `capture_sha` (`schema.mjs:84-92`) is the content-addressed precedent that needs no allocator. `mintid.mjs:1-27` records why check-then-act allocation races.

**1.12 Interface protocol and lanes.** PROPOSED → RESPONSES (silence is not consent) → RESOLUTION (dormant consumer: CONDUCT answers in writing) → CHANGING → CHANGED → SETTLED. Touched: **I5** (RECORD; schema), **I3** (RECORD; ops, bundle.md frontmatter target grammar via C-2.8), **I2** (FRAMEWORK dormant; if `reading_refs` gains position or `dom`'s status changes). Lanes: RECORD owns `schema.mjs`, promote/gate, `query.mjs`; FRAMEWORK owns `docprofile/**` and I2; UI owns `civicos-ui/**` (frontmatter composer `app.html:2951-2960`, `:3039`); CONTENT-PDF/OFFICE produce the references. `MILESTONES.md:709`: D-164 is RECORD, M4.

**1.13 D-222 stage C / D-225** (`INVESTIGATIVE-SESSION.md:994-1069`): one compilation point (D-15); gate as WHERE predicate; candidate list withholds the whole row; envelope never a bare array; `MAX_COMPOUND = 4`; every arm joins through `bundle_id`. D-225 (`DEBT.md:179`): caps land BEFORE any new meaning surface. `schema.mjs:912-917`: an index is earned when an arm reads it.

**1.14 STORE-AS-CACHE** (`:523-536`): content axis repairs by EXTRACT; states `NOT_EXTRACTED / PARTIAL / EXTRACTED / UNEXTRACTABLE`; engine version is the content axis's invalidation key (`:551-557`). Observation record shared across axes (`:564-567`), SEPARATE lifecycle from the record (`:653-668`), shape at `:670-675`. Content-axis frontier and observation are [ABSENT].

**1.15 Promote-time facts.** Projections are DELETE+rewrite per capture on re-promotion (`store.mjs:10810-10818`); *no row for an absent chain* (`:10880-10900`). I2's `text.pages[]` and the evidentiary envelope are NOT stored and `op=pdfstructure` stops at tier 2 (D-319) — so a content row's TEXT is in hand only at promote or attest time, and a page count for an "extent outside the capture" refusal is not in any table today.

## 2. The design options

Shared across all three: (i) the extent grammar must be IC-1's arms unified with attestation's `document|page|region` and D-252's page sets — one checker, one `covers` per arm, called from the op and the store (the `checkAttestation` pattern, `store.mjs:10904-10908`); (ii) `dom` must be excluded until CONTENT-HTML produces it or refused at write by name; (iii) unknown kind covers nothing; (iv) D-161 waits on reading position; (v) C-2.8/C-25.10 target grammar changes; (vi) the UI composer emits the new shape.

### (a) First-class content object
- **Shape.** A table keyed by `content_id`; `capture_sha`, `bundle_id` (purge + compiler), flattened extent columns (kind + per-arm fields), the sub-chain covering the extent (or a projected `derivation_cap`), `minted_by` (extractor vs member act), `at`, optional text snapshot.
- **Writer.** Either a promote-time projection (every emitted region/cell/para → row: hundreds per OCR'd page; rebuilt per capture like `reading_refs`) or an authored/edge writer. A pure projection makes rows DERIVED and rewritable — which breaks any edge holding a minted id unless the id is content-addressed.
- **Identity.** Content-addressed `hash(capture_sha, canonical extent, chain)` — two members citing the same passage get one id by construction, no allocator, no race; re-extraction under a new engine yields a NEW id and the old row goes `stale`, not deleted. Or a store-minted sequential id plus a UNIQUE on the extent columns — a second dedup mechanism to keep honest.
- **Cap and coverage.** `derivationCap(chain, target)` and `gradeCeiling` already take a target; the row's extent IS the target. Non-PDF containers carry `layer` with cap null → undetermined, honest.
- **D-161/D-163.** `connections` gains `a_content_id/b_content_id` (determining pair); `refs` needs BOTH `source_content_id` and `target_content_id`.
- **Purge/reproject.** `bundle_id` → TABLES both arms. First-class rows are never rewritten by re-promotion; only marked stale.
- **Query (D-222 C).** Composes with arm A through `bundle_id`; stage C returns content rows; a stored per-row cap makes *"every OCR'd region below C"* a filter. Each new selector spends one of four compound terms.
- **UNDETERMINED.** A whole-document leg → a row with `kind=document`, one per capture; a member who "cannot say where" needs a distinct value (`unstated`) or is forbidden — doctrine (§3). NULL is never the extent.

### (b) Extent on the edge
- **Shape.** `inquiry_basis`, `inquiry_basis_version_legs`, `refs`, `connections` each gain extent columns + a chain snapshot. Four copies of one grammar — the drift D-164 names — mitigated only by a single shared checker.
- **Writer.** The edge writers already exist (`checkInquiryBasis` at promote, `op=connect`, refs from frontmatter). Frontmatter shape = I3 + catalogue; UI composer must emit it.
- **Identity.** None. "Same passage" is column equality, a `GROUP BY`, not an object.
- **Cap and coverage.** Computed at read/gate; `earnedBasisRegistry` keyed by `(target, extent)`. No stored cap → *"every leg below C"* is a scan.
- **Re-extraction.** Text under a leg's extent changes silently unless the leg snapshots the chain.
- **Query.** *"every leg citing page 14"* answerable; *"which passages mention X"* is NOT — nothing exists to search but edges. Content-grain SEARCH (§18 item 2) would need (a) anyway.
- **UNDETERMINED.** `kind` NOT NULL with explicit `document`; legacy legs need `unstated`.

### (c) Hybrid — a content row minted lazily on first edge
- **Writer.** The edge op calls find-or-mint `(capture, extent, method)`; edges hold the id. Content-addressed id makes find-or-mint idempotent and race-free. Later, an extractor writer may add rows into the SAME table (`minted_by` says which) for search.
- **Identity/dedup.** By construction (hash). Two citers, one row, its citation count a join.
- **Size.** Only cited content exists → small table, no D-224-class growth; *"which passages mention X"* covers only what was cited until the extractor writer lands.
- **Purge/reproject.** `bundle_id` both arms; rows are first-class (an edge depends on them) → never rewritten, `stale` when the chain moves.
- **Query.** As (a), over a smaller table.
- **UNDETERMINED.** A whole-document leg mints a `document`-extent row so EVERY leg targets content — uniform edge, no second vocabulary. The alternative (whole-document legs keep `INFO-` targets) is two target vocabularies, which IC-1's constraint forbids (1.3).

## 3. Doctrine (Bob's) vs mechanism (the architect's)

**Doctrine — Bob's to rule:**
- **May a content-grain leg claim MORE than a document-grain one?** On the transcription axis the tree already says yes (an attested region reaches B where the document's cap is undetermined). On the CONNECTION axis, whether a leg citing page 3 earns from ALL the document's resolutions or only refs read on page 3 is undecided and changes what a leg may claim.
- **Does the extraction method bound the leg?** Ruled (DEC-4, CPDF-10). Open inside it: DEC-23 lists *member transcription* as an extraction method; `STEP_KINDS` has no such derivation step — whether a member typing what a scan says is a weakening derivation or a verification is doctrine about what a member's act is worth.
- **Whether `unstated` is a legal extent** (D-129's split at the column).
- **D-161's determining pair vs all mentions** — recommendation on the row; Bob's confirm.
- **The claim object (L7)** and its standard of proof (framework §12.2; `LAYERS.md:68`, `:143` owner NONE); DEC-23: the two absences fail together. Whether a content object without a claim is worth minting is his.
- **D-184** — whether a firsthand observation may be CONTENT with no capture behind it, or must stay the named honest path (author, capture, cite); pairs with DEC-39 and REC-11 (`DEBT.md:150`); designed with D-194 (`:153`).
- **DEC-24's boundary for an extractor writer:** a content row is an ADDRESS, not a connection, so arguably not a hunch — but an AI proposing *"this passage is worth citing"* is the EXTRACT role DEC-24 leaves *"later work"* (`DECISIONS-2026-08.md:1696-1698`).

**Mechanism — the architect's:** table vs columns vs hybrid; hash vs minted id; extent flattening and per-arm `covers`; whether attestation references the content row; stale semantics; purge arms; where the writer sits; the query arm and statement shape; migrating legacy legs to `unstated`; the page-count source for the out-of-range refusal.

## 4. Build shape (dependency sketch, no scoping)

**Interface-change-first**: IC on **I5** (the table/columns, purge, hygiene); IC on **I3** (C-2.8/C-25.10 target grammar, the new/changed ops, bundle.md frontmatter); IC on **I2** only if readings gain position or `dom`'s status moves — CONDUCT answers for dormant FRAMEWORK in writing. D-225's caps land before any new meaning read.

**Lands first — schema + one writer + one reader, on the `pdf-page` arm**, because `checkAnchor`, `extentCovers`, `derivationCap(target)` and `gradeCeiling` already exist for it and DEC-4 already requires the OCR citation to carry page+rect: the basis leg as writer (through `checkInquiryBasis`/promote) and `earnedBasisRegistry`/`op=earnedbasis` as the reader answering the per-extent ceiling.

**Then, in dependency order:** version legs (C-25.10) → `refs` with source+target (D-163) → per-arm `covers` for `sheet-cell`/`doc-para`/`slide-shape` → **FRAMEWORK prerequisite:** `parse()` entities carry `source`, `reading_refs` gains position (I2 bump) → `connections` determining pair (D-161) → UI: composer emits extents, leg display shows `ref`, viewer jumps to page/cell → query: arm-A vocabulary, then stage-C content rows → the content-axis observation record → the claim object (Bob's).

**Negative controls the discipline demands** (each a named refusal and a driven arm): an extent outside its capture's page set refused by name (needs a stored page count — absent today, 1.15); an extent with no extraction chain refused; a non-`pdf-page` anchor on a transcription refused (`checkAnchor`, exists); an unknown/unparseable kind covers nothing and mints nothing; a `dom` extent refused while no producer exists; purge clears content rows in BOTH arms; an attested extent raises a leg's ceiling to B and an unattested one does not, and a page attestation does not cover a document-extent leg; the extent's cap is never stronger than the document's chain allows, and the leg's capture grade ≤ `captureBound`; re-extraction marks the row `stale`, never deletes it, and the leg still resolves; two citers of one extent → one row (a/c) or two rows equal on extent (b); a whole-document leg stays legal and reads `document`, never NULL; a legacy leg reads `unstated`, never `document`; C-2.8 refuses a content id whose row does not exist; a machine credential may mint an extraction-derived row (EXTRACT) and may not attest (C-35.10); `meaningrows`/stage C fail closed on an absent viewer stamp.

## 5. The doctrine items, in the shape Bob rules on

Prepared 2026-09-14 by BOB #10 for the sitting after Bob reviews Part II; none is asked before
that, and none blocks work — each carries the provisional the mechanism (§6) runs under. The
shape is `kickoffs/README.md`'s: what runs provisionally, why it is ambiguous, the alternative,
the recommendation, what reversing costs. `node tools/decided.mjs` was run on every item
(2026-09-14) and finds none of them ruled.

### 5.1 May a content-grain leg claim MORE on the connection axis than a document-grain one?
**Question.** A leg cites page 3 of a document. On the transcription axis the tree already lets
it earn more than the document (an attested region reaches B where the document's cap is
undetermined). On the connection axis: does that leg earn from ALL the document's resolutions,
or only from references read ON page 3?
**Provisional.** The whole document's — because readings carry no position, nothing else is
computable today (§1.9), and it is what every leg earns now.
**Why ambiguous.** "Earn from the whole document" lets a leg citing one paragraph borrow a
connection established by a different paragraph; "only page 3's" makes every content-grain leg
weaker on connection than the document it sits in until readings carry position (I2).
**Alternative.** Page-scoped earning, undetermined (stated) until position exists.
**Recommendation.** The provisional now; page-scoped earning becomes the rule the day
`reading_refs` carries position, and the record says which rule graded a leg. Reversing costs
a re-grade of content-grain legs, which the earned-basis registry already recomputes.

### 5.2 Is a member's transcription a derivation or a verification?
**Question.** DEC-23 lists "member transcription" among extraction methods. A member typing what
a scan says: a weakening derivation step (like OCR — the chain's cap is min over steps), or a
verification (like attestation — the only route to the top)? Bob's case, 2026-09-14: a
hundred-year-old property title, a photocopy of a mimeograph, its terms in cursive that no OCR
or vision model reads and a person can — fidelity RISING through a human act, and the system
must support it, with the caveat he named: the transcription's validity rests on the person's
correctness.
**Provisional.** Neither exists: `STEP_KINDS` has no member-transcription step and `attesttext`
attests EXISTING text; a member cannot enter text today.
**Why ambiguous.** A member is not an engine with a calibration, so a derivation step has no
measured cap to carry; but a member typing is also not verifying a machine's output — there is
nothing to verify against.
**Alternative.** (a) a derivation step `member(handle)` with cap undetermined, attestable
afterwards like any text; (b) member-typed text IS an attestation over an image region with the
text as its payload.
**Recommendation.** (a): the member's typing is authored text with the provenance of an authored
act, its cap undetermined and stated, and a SECOND member's attestation is what raises it — the
same shape as everything else here, with no member ever grading their own act. Reversing costs
one step kind and its check.

### 5.3 Is `unstated` a legal extent?
**Question.** Every leg today points at a whole document without saying so. Under any option
the extent column arrives with its writer (§1.6). A legacy leg, and a member who "cannot say
where": do they read `document` (a claim), or `unstated` (an admission)?
**Provisional.** `unstated` for every leg minted before the column exists; `document` only
when a member chose it.
**Why ambiguous.** D-129's split says an absence must never be read as a value, so `unstated`
is doctrine-consistent — but it makes the honest answer to "where in the document?" a value a
member can pick to avoid answering.
**Alternative.** No `unstated`: a leg must name an extent, legacy legs are migrated to
`document` with a dated note.
**Recommendation.** The provisional. Reversing costs a migration of legacy legs that rewrites
history the record says it never rewrites.

### 5.4 D-161: the determining reference pair, or all supporting mentions?
**Question.** A connection between two documents through an entity is derived from resolutions;
today it collapses to the strongest grade per capture and discards the reference. At content
grain, does a connection carry the ONE pair of references that determined its grade, or every
mention?
**Provisional.** The determining pair (the study's recommendation; nothing is computable until
I2 carries position).
**Alternative.** All mentions, as a join.
**Recommendation.** The determining pair as the connection's anchor, all mentions reachable by
a query — the pair is what a reader follows to check the connection. Reversing costs nothing
until the column exists.

### 5.5 What is the CLAIM object, and what is its standard of proof?
**Question.** Part II §18 piece 6. The framework has said since v0.1 that nothing models a
claim; DEC-23 found the content and claim absences fail together. Whether a content object
without a claim is worth minting is Bob's, and a claim's standard of proof is doctrine.
**Provisional.** No claim object; a FINDING (a concluded inquiry with a required falsifier and
composed strength) is what the record has instead, and a content row is minted for what legs
cite whether or not a claim exists.
**Why ambiguous.** The case-making pass argued a claim is a FIELD of a finding, not an object
(`BIO_Case_Making_v0_1.md`); Part I §12.2 argued a claim needs a standard of proof and is
therefore doctrine. Both may be true and the object still unnecessary.
**Alternative.** A claim object with a standard of proof per audience.
**Recommendation.** Bring Bob the question with the case-making pass's argument beside it;
the mechanism does not wait (content is minted for citation, not for claims). Reversing costs
one table if the object is later wanted.

### 5.6 D-184: may a firsthand observation be CONTENT with no capture behind it?
**Question.** Bob's reporter who attended the meeting. Is their observation content (an extent
of nothing), or does it stay the named honest path — author a witness statement, capture it,
cite that?
**Provisional.** The named honest path, unnamed in any surface today.
**Why ambiguous.** Content with no capture has no provenance chain and therefore no capture
grade, which is the record's one axis of trust; but the honest path forces a member to fabricate
a "document" to say what they saw.
**Alternative.** A member-authored INFORMATION bundle whose capture IS the authored act,
provenance = the member's attestation, grade D by construction, designed together with D-194's
lead (the same member knowledge, before and after the search).
**Recommendation.** The alternative, designed with D-194 as Part II §18 piece 5 says. Reversing
costs nothing now; the mechanism treats it as a document like any other.

### 5.7 DEC-24's boundary: may an AI extractor WRITE content rows?
**Question.** A content row is an address, not a connection, so arguably not a hunch. An AI
proposing "this passage is worth citing" is the EXTRACT role DEC-24 leaves as later work. May a
machine credential mint content rows (option (c)'s later extractor writer)?
**Provisional.** No machine writer; content rows are minted by a member's edge (the lazy mint)
or by the plane's own extraction at promote.
**Alternative.** A machine-minted row is legal, labelled `minted_by: machine`, never attested,
and cited only by a member's act.
**Recommendation.** The alternative, once the member-minted path exists — it is exactly
DEC-24's EXTRACT, labelled as machine work, binding nothing. Reversing costs a column.

## 6. The mechanism — decided provisionally by BOB #10, 2026-09-14

Under Bob's standing delegation (mechanism is the architect's), and carrying every §5 item as
its provisional: **option (c), the hybrid.** A `content` table whose rows are minted lazily on
first edge, content-addressed by `hash(capture_sha, canonical extent, chain)`; a whole-document
leg mints a `document`-extent row so every leg has one target vocabulary; a legacy leg reads
`unstated`; rows are first-class (an edge depends on them) and go `stale`, never deleted, when
the chain moves; dedup is by construction, no allocator; the extent grammar is IC-1's five arms
unified with attestation's `document|page|region` and D-252's page sets, one checker, one
`covers` per arm; `dom` refused by name until a producer exists; the first landing is the
`pdf-page` arm on the basis leg (writer) and the earned-basis registry (reader), because
`checkAnchor`, `extentCovers`, `derivationCap(target)` and `gradeCeiling` already exist for it
and DEC-4 already requires the OCR citation to carry page and rectangle.

Why (c) over (a) and (b), in one line each: (a) a promote-time projection makes rows derived and
rewritable, which breaks any edge holding a minted id unless the id is content-addressed — at
which point it is (c) with more rows; (b) four copies of one extent grammar is D-164's "built
three times and drifts" by construction, and cannot answer "which passages mention X" at all.

**What waits on Bob before the IC is proposed:** nothing in the mechanism; the §5 items shape
the check catalogue's target grammar (5.3), the connection population (5.1, 5.4) and two later
writers (5.2, 5.7), and each runs under its provisional. **What waits on his review of Part
II:** the understanding the mechanism rests on, in his stated order — so the IC on I5 and I3
is written the day he confirms it, not before.
