# publication — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). R37 (`publishedEditionsOf`, the read `conformance` R2 uses) added 2026-09-27 (K171), a read over rows R7 and R22 already hold; no meaning changed. DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), split from publication's draft (K94); for Bob's approval (a product module, P17). Layer 8, first of `publication`, `ratification`, `case-authoring`. Code today (measured on `tranche/T3` @ `f324df9b`, unchanged at `03e2481`; `build/extraction/publication.md` has the table): `bio-plane/src/store.mjs` 3244 (`CASE_FLAGS_LIMIT`), 4868–5197 (the case relation and revision flags: `#caseRelationOf`, `#caseClaimInBytes`, `#flagCasesOnRevision`, `#dischargeCaseFlags`, `caseFlags`), 10036–10310 less 10107–10116 (`caseDocumentFacts`, `#pinnedMemberBasis`, `#projectCaseExclusions`, `#caseDocMemberFrozen`, `#noCaseDocument`, `#hasCaseStanding`, `caseDocument`, `#signedCitations`; `#memberTextAtSha` goes to `record-core`), 20684–20945 (MK-7 attribution, `ATTRIBUTION_LEVELS` … `attributeObservation`), 27584–27586, 33516–33755 (`exportManifest`, `exportLog`, `publishedManifest`), 34420–35551 (the published reads and commit primitives, `#frozenFromPinningDocuments` … `publishedTargets`), 35775–35907 (`excludedBy`, `publishedRegistryFor`, `publishedCaseRegistryFor`), migrations (954–967, 1186–1219, 1303–1314, 1348–1352, 1465–1473, 1655–1674) and the dispatch entries `caseflags`, `attribute`, `publishededitions`, `publishedcase`, `recordcasemanifest`, `publishedtargets`, `excludedby`, `export`, `exportlog`, `publishedmanifest`, `casedocfacts`, `casedocument`, `verify`, `publishedlist`; `bio-plane/src/index.mjs` 4474–4530 (`publishedStoreAbsent`, `publishedReadRow`, `noPublishedPart`, `publishedObjectMissing`), 5805–6071 (`assembleCaseContainer`), 6447–6743 (`op=publishedcase`/`op=publishedbytes`); its own `container.mjs`, `inband.mjs`, `deliverer.mjs`; `bio-plane/checks/bio-checks.mjs` 11402–11460 (the case-document formats and their three predicates), 10933–11078 (C-98), 13009–13066 (C-92.1–C-92.9), rows C-44.2 (9102–9109) and C-68.5 (10708–10715); `schema.mjs` 66–155, 1514–1859, 2859–2932, 3602–3621. `from`: `legacy-store`, `legacy-checks`, `legacy-index`. Not yet met: R30 (D-246), R32 (no row), R35 and R36 (K102), R37 (K171). Carried: N16 (export, R18–R19), K78 (2) (attribution, R17), K83 (3) (`op=excludedby`, R12). R20–R22 state, as interfaces, what the split exposes to `ratification` and `case-authoring` (no capability added). Old ids are listed at the end.

**Size (P6).** About 4,280 lines move (about 1,830 without comment-only and blank lines): `store.mjs` 2,366 (1,043 code) plus about 160 of dispatch and migrations, `index.mjs` 621 (276), the three owned files 318 (153), `bio-checks.mjs` 279 (139), `schema.mjs` 530 (about 117 of DDL). Under 4,000 of code.

## Public

### Purpose

Publication is the one irreversible act: what the group stands behind leaves the instance, content-addressed and signed, so a stranger can verify without this instance that the group said what it claims and rested it on what it says (Publication §1). This module is the published record: it holds every case document (unsigned and signed) and the published projection, answers which cases a finding serves, serves the published record to anybody without a credential, packages it (the container, the in-band quartet), lets a member choose how their firsthand words are attributed, and exports the working corpus verifiably. The two signing ceremonies (`ratification`) and preparing a case (`case-authoring`) write through it.

### Provides

Terms. A **case** is a production of one project over one or more findings (inquiries), each `load_bearing` or `supporting`; an **edition** is one numbered, separately signed version of it. The **case document** is its signed artefact. A **pin** is a member's `bundle_sha` as the document names it. The **published projection** is the `published_*` tables, `cases`, the signed case documents and the published bucket. A **stamp** (`author`, `viewer`, `by`, `deliveredBy`, `secretSha`, `bySecret`) is the control plane's, never a body's. Every refusal names `reason`; one with a catalogue row carries its `check`, `code` and `translation`.

#### The case document and the case relation

- **R1** `caseDocument(case, edition, viewer, secretSha)` (`op=casedocument`): a signed document answers anybody. An unsigned one answers only a viewer with standing in every project the record names for the case, or a live review grant bound to exactly that edition (R23); every other caller, and a case edition never authored, receives `NO_CASE_DOCUMENT`, byte-identical; `hasCaseStanding(doc, viewer)` is that standing test, exported. The answer carries the text, `doc_sha`, author, signature, `delivered_by` (R14) and `citations` (a `/4`'s signed rows; an older document states them undetermined, never today's edges).
- **R2** `caseDocumentFacts(case, edition, viewer, secretSha)` (`op=casedocfacts`) is fenced as R1 and answers what signing needs: the document, the previous edition's assertions, each member's basis at its pinned bytes, the attribution facts (R17) and the observations it reaches.
- **R3** A document's exclusions are projected, whole, whenever it is stored or re-authored (R21); `excludedBy` (R12) reads them.
- **R4** `caseRelation(id)` answers the ratified editions pinning the finding's current sha and any unsigned preparation naming it; registered with `promotion` as the fact `caseMember`.
- **R5** When a promotion replaces a sha ratified editions pin, one flag per case edition, member and new sha is written with the owning project (null for a case older than DEC-72) and the instant, never twice; a projection registered with `promotion`. `dischargeCaseFlags(case, edition, by, at)` discharges a case's outstanding flags when a newer edition is ratified, recording by whom and at which edition.
- **R6** `caseFlags({case?, target?, outstanding?, limit})` (`op=caseflags`) answers flags ordered by instant, case, edition, member; `limit` clamped to [1, 500], 500 by default; `truncated`.
- **R7** `publishedRegistryFor(id, extra)` and `publishedCaseRegistryFor(caseIds)` answer each published edition and its frozen pair, keyed on the record's `object_type` (an undetermined type read as an inquiry); registered with `promotion` as the facts `publishedRegistry` and `publishedCaseRegistry` (C-21.1, C-21.2).
- **R37** `publishedEditionsOf({finding, version?, project?})` answers `{items: [{case, edition, project, version_sha, role, strength}]}`: every ratified case edition whose members include `finding`, each with its case, edition, owning project (null for a case older than DEC-72), the member's pinned `version_sha` and `role`, and its frozen strength pair (R7), per axis, never composed. `version` keeps the editions pinning that version, `project` the cases that project owns. An unsigned preparation is never an edition here (unlike R4). `NO_ID` for an empty `finding`; a finding no ratified edition names answers `items: []`. It is the read `conformance` R2 uses. *(not yet met: K171)*
- **R38** `pinnedCaseEditionsOf(id, sha)` answers the ratified case editions whose signed document pins bundle `id` at `sha`, `ratifiedFindingsRestingOn(id)` the ratified findings whose published basis rests on `id`, and `caseClaimsOf(id)` the cases a finding is pinned or prepared into; all bounded and viewer-free, read by `ratification` R5's scope arms (K240). *(not yet met: K240)*
- **R39** `attributionInForce(caseId, edition, observation)` answers the attribution level in force for that observation in that case edition (R17's statement read at a case edition), read by `review` R16 (K240). *(not yet met: K240)*
- **R40** The tables `cases` (`case_id`, `project_id`), `published_cases` (`case_id`, `edition`, `completeness`, `bias_acknowledgement`, `ratified_at`), `published_case_members` (`case_id`, `bundle_id`), `published_bundles` (`bundle_id`, `edition`, `bundle_sha`) and `case_documents` (`case_id`, `edition`, `doc_sha`, `text`, `draft_id`, `authored_by`, `authored_at`, `sig_armored`, `ratified_at`) are a stated read contract, on record-core R37's terms: a later module may read them in its own SQL, and every write stays this module's (R21, R22, R24). Read by `case-authoring` (R7, R13) and `review` (R3, R5) (K240).

#### The public read path (no credential; the published projection only)

- **R8** `verifySha(sha)` (`op=verify`): `{published, sha256, matches: [{bundle_id, path, kind, published}]}`.
- **R9** `publishedList()` and `publishedEditions(id)` (`NO_ID`): every published edition with its signer, deliverer and gate version; a finding's rows name every case it serves (`cases`), with the scalar case only when there is one, else null.
- **R10** `publishedCase({id | sha256 | caseId, edition})`: resolved by the hash a case pinned, by case, or by finding. A finding several cases pin is `FINDING_IN_SEVERAL_CASES` (C-44.2), naming them; nothing published is `NOT_PUBLISHED` (C-98.8). The answer carries scope, completeness (with both writer and publisher, acknowledgements a list, `[]` or null as recorded), bias acknowledgement, the bar with its words, each member's pair, grounds and exclusions from its case document, `complete`/`awaiting`, the manifest and files, the editions, and the graph's `serves`, `names` and `unresolved`. It carries no case-level strength.
- **R11** `publishedManifest()` (`op=publishedmanifest`): the whole published projection. Where the ratified documents pinning one sha freeze different pairs, its row carries `strengthByCase` (each case edition's pair), `strength: null` and `strengthUndetermined: "CASES_DISAGREE"`; an agreeing row is unchanged.
- **R12** `publishedTargets(ids)` answers R7's registry for those ids; `excludedBy(id, viewer)` (`NO_ID`) answers every case naming the document in its exclusions: from `inquiry`'s live exclusions and from case documents, a ratified one to anybody, an unsigned one only with standing, a member the viewer cannot see never.
- **R13** `publishedbytes(sha256)` answers bytes by hash only (64 lowercase hex, else the required-argument refusal): `NO_PUBLISHED_PART` (C-98.1, the same answer for never-existed), `OBJECT_MISSING` (C-98.2), no published store bound (C-68.5). In container form: `NOT_A_CONTAINER` (C-98.3), `MANIFEST_UNREADABLE` (C-98.4), `PART_MISSING` (C-98.5), `DUPLICATE_PATH` (C-98.6), `CONTAINER_TOO_LARGE` over 64 MiB (C-98.7).
- **R14** `delivererOf(stored)` answers `founder`, `member` with its id, or `undetermined` with its sentence, never inferred from the signer; `deliveringPrincipal(session)` answers `founder`, `member:<id>` or null.
- **R15** The container is a stored (uncompressed) ZIP with fixed timestamps, the manifest at its root and each part under the root at its path; the same manifest and parts give the same bytes. `assembleCaseContainer(case, edition)` builds it once when a case edition's last member is published. `recordCaseManifest` records a case edition's manifest once (`MALFORMED`, `NO_SUCH_CASE_EDITION`, `MANIFEST_EXISTS`) and is no caller's op.
- **R16** `inbandQuartet({subject, over, date, author, bar})` answers `{format: "bio-inband/1", hash: {sha256 over JSON.stringify(subject, null, 1) as UTF-8, bytes, over}, date, author, floors}`; each floor is the declared grade or null, and no declared bar says so in words. It is the one hasher of the container manifest and the review copy (rule 9).

#### Attribution: attributeObservation({caseId, edition, observation, level, by}) (`op=attribute`)

- **R17** Refusals: C-92.1 (not a member), C-92.2 (no level), C-92.3 (a level not `group`, `project`, `cover`, `name`), C-92.4 (not an observation), C-92.5 (not its author), C-92.6 (author not active), C-92.7 (the edition does not reach it), C-92.8 (the edition is signed), C-92.9 (`name` with no handle). A choice is recorded per case, observation and edition, dated, and re-authors the unsigned document's attribution section. The level in force is the latest choice at or before the edition; `attributionFacts(doc)`, `attributionStatedFor(observation)`, `observationsNamingAuthor(ids)` and `attributionStatements(case, edition, project)` (the section's text, one spelling) answer what the gates and the author read.

#### Verified export (Membership v2 §8)

- **R18** `exportManifest({note})` (`op=export`) answers every bundle with its files (path, SHA-256, bytes, blob digest, inline), its promotions in write order, its snapshots and its references, and the register, with counts; in the same act it appends one `export_log` row (instant, scope `working-corpus`, counts, note cut at 280 characters). The answer says it was logged and how to verify it.
- **R19** `exportLog({limit})` (`op=exportlog`) answers the newest rows first, `limit` clamped to [1, 1000], 200 by default, with `truncated`.

#### The document's grammar and the writes the ceremonies make (for `ratification` and `case-authoring`)

- **R20** `CASE_DOCUMENT_FORMAT` is `bio-case-document/4`; `/3`, `/2` and `/1` are accepted as written (`CASE_DOCUMENT_FORMATS_ACCEPTED`). `caseDocumentStatesMemberBlocks(fm)` is true for `/4`, `/3`, `/2`; `caseDocumentRequiresDisclosures(fm)` for `/4`, `/3`; `caseDocumentRequiresV4Disclosures(fm)` for `/4` only. Pure; never throw. They are the one reading of a document's shape for every module.
- **R21** `storeCaseDocument({case, edition, text, author, draft?})` stores an unsigned document, replacing an unsigned one of the same case edition and never a signed one; `reauthorSection({case, edition, docSha, section, lines})` replaces one named section's lines (the attribution section, the acknowledgement list) only while the document is unsigned and still at `docSha`, so its `doc_sha` moves. Both project the exclusions (R3), write only inside the caller's transaction, never throw on a signed or moved document, and answer the `{case_id, edition, doc_sha}` the store holds after the call, so a caller sees a write that did not happen.
- **R22** `commitEdition(...)` appends a published edition (signer, deliverer, gate version, parts, every file's hash, edges: `serve` only to a published target, `name` otherwise) and `commitCaseEdition(...)` records a case edition's owner (first edition), scope, completeness, bar, roster with roles and pins, and signature, signer and deliverer on its document. Each writes inside the caller's transaction, answers `existed: true` for the same edition and signature, and refuses anything else already there (`EDITION_EXISTS`, `CASE_EDITION_ALREADY_RATIFIED`) with nothing written; neither decides who may publish (that is `ratification`'s).
- **R35** `commitEdition` publishing a target also turns every `name` edge to that target from a published finding into a `serve` edge, in the same transaction (`ratification` R16); this is the one change R24 permits to a published row, and it states only what both signatures already cover. *(not yet met: K102)*

#### Registrations offered (K31)

- **R23** A later module fills, once at start, one review provider: the draft door (a draft a member may read, its case identity and sentence), the grant door (whether a grant admits a case edition: R1, R2) and the dead answer and live grant. With no provider, no grant admits, and `reviewProvider()` answers so to `case-authoring` (its R9 is then C-44.3 and every grant door of its R19 answers dead). Today `legacy-store` fills it; `review` does when extracted.
- **R36** A later module fills, once at start, one evidence-package block: given a published case edition, it answers a named block `publishedCase` (R10) carries beside the case, computed at the read; with none registered, the answer says the package carries no such block. The evidence package is the published case edition; `filings` fills the available-actions block (its R15), and nothing of legal strategy enters the case's own bytes. *(not yet met: K102)*

## Private

### Uses

- `legacy-checks`: the rows until they move (R33), `parseFrontmatter`, `normalizeType`, `OBJECT_TYPES`, `sectionText`, `canonicalJson`.
- `signatures`: `verifySshsig`, `NS_RATIFY` (a published case's signature, R10). `ooxml`: `crc32` (R15).
- `record-core`: `recordOf(ctx)`, `transact`, `stampInstant`, `declarePurge`, the `bundles`, `files`, `history` and `manifest` read contracts (R18), `textAtSha` (its R60; R2). *(not yet provided: T8's record-core entry)*
- `membership`: `viewerPredicate`, `isProjectOwner`, `isJoinedParticipant`, `existenceAct`, `attestingKeys`, members' handles, covers and status (R17).
- `promotion`: `registerStep`, `registerFact`, the fact `producingGroup`.
- `provenance`: the `register` read contract, `observerRef` (R17, R18).
- `connections`: the `refs` read (R18).
- `inquiry`: `exclusionsNaming` (R12).
- `basis-versions`: `testimonyReach` (the observations an edition reaches, R17).

### Invariants

- **R24** One way: nothing updates or deletes a published row, a signed case document or a published object; a correction is a new edition, and an edition answers forever (DEC-19, DEC-12).
- **R25** The public read path (R8–R13) needs no credential and reads the published projection and the published store only, so it can disclose nothing unpublished; a scratch namespace is not readable there (rule 10).
- **R26** No answer, document or row this module serves composes a case-level strength: every pair is per member and per axis (DEC-44, DEC-21).
- **R27** Signer and deliverer are two facts, and neither is copied from the other; every authorship field is a stamp or read from a signature.
- **R28** Undetermined is stated and never filled: a deliverer, an acknowledgement list a document is silent about (null, not `[]`), a citation's version in a document older than `/4`.
- **R29** Working material (an unsigned document, a hidden project) answers an outsider exactly as something that does not exist.
- **R30** A published rendering is verified by `pixels_sha256` over its normalised samples, taken before any container is built; the file's own SHA-256 is recorded beside it, labelled informative. *(not yet met: D-246)*
- **R31** Published bytes are exempt from purge (`published_bundles`, `published_shas`, `published_cases`, `published_case_members`, `cases`, signed case documents, `export_log`); `published_edges`, unsigned case documents and their exclusions, flags and attributions are declared to `record-core`'s purge as today (K23).
- **R32** An import of an export re-derives every file's hash and every bundle's history chain and base links and byte-compares every registered capture, trusting nothing the manifest asserts (Membership v2 §8, "What verified must mean"). The verifying import belongs to this module; the tranche that carries it is BOB's to choose (K102). *(not yet met: no row; K102)*
- **R33** Each check moves here as an invariant with its test (K6): C-44.2, C-92.1–C-92.9, C-98.1–C-98.8, C-68.5 (held here as its earliest raiser; `control-plane` imports it, K93 (3)). A change to any moves `CATALOG_VERSION` (rule 17).
- **R34** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_Publication_v0_1.md` §1, §2, §3 rules 1, 2, 9–12, 16, §4, §6A.2 (the unsigned document's fence), §6A.3 point 1 (the quartet), §3 rule 7 and §7 (attribution).
- `docs/architecture/BIO_Membership_Architecture_v2.md` §8.1 and §8.2 (verified export, reconstruction without the instance).
- `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4 (MK-7 attribution levels).
- DEC-12, DEC-19, DEC-20, DEC-44, DEC-72; D-431, D-442.

### Suggestions

- **Factory.** `publicationOf(ctx)` answers the one instance per Durable Object storage, reaching its uses through their factories (K61); the op handlers move here (K3). The Worker half of `op=publishedcase`/`op=publishedbytes` and `assembleCaseContainer` live in this module's paths as a Worker-side file.
- **The tables are all this module's** except `statement_acknowledgements` (`case-authoring`'s). `ratification` and `case-authoring` never write them directly: R21 and R22 are their only writes, so R24 is kept in one place.
- **One text grammar.** Each module builds its own section's lines (attribution here, acknowledgements in `case-authoring`, the rest of the document there); R21's `reauthorSection` is the one splice, so a section's bytes are written one way.
- **For callers.** The control plane admits only the root-of-trust credential to `op=export` (`ROOT_OF_TRUST_REQUIRED`) and in-app administrators to `op=exportlog`; stamps `author`, `viewer`, `by` and `deliveredBy`; hashes a presented grant secret before calling; keeps the routes of `verify`, `publishedmanifest`, `caseflags` and `casedocument`.
- **Direct SQL on others' tables** (`register`, `refs`, `members`, `manifest`, `history`, `bundles`, `files`, `inquiry_exclusions`) becomes the owner's service or a stated read contract (K57), site by site.
- **Where `review` sits.** Layer 8, directly after `case-authoring` (K102); it uses this module (R23's provider) and `case-authoring` (its R18, R20), with no further registration here.
- **Tests.** Each check gets a negative control; R1 and R29 get identical-bytes arms; R21 an arm that a signed document is never touched; R22 a retry arm.

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for rulings)

1. The facts `caseMember`, `publishedRegistry`, `publishedCaseRegistry` and the revision-flag projection are registered with `promotion` by this module, replacing `legacy-store`'s (K94).
2. `testimonyReach` is `basis-versions`' (K94); this module calls it for R17.
3. `#memberTextAtSha` becomes `record-core`'s `textAtSha` (K94); R2 and `ratification` read it.
4. `#findingsExportPerformed` (N-1) is `queue`'s, reading R19 (K94).
5. The case-document formats and their three predicates (bio-checks 11402–11460) are this module's (R20): `#caseDocMemberFrozen`, `#signedCitations` and `assembleCaseContainer` read them, and this module is the earliest of the three. The C-41 family and `checkCaseDocument` are `ratification`'s.
6. C-44.2 (`FINDING_IN_SEVERAL_CASES`, raised by `#resolveOneCase`) is this module's; C-44.1, C-44.3–C-44.5 are `case-authoring`'s. C-92.1–C-92.9 are this module's; C-92.10–C-92.12 are `ratification`'s (rows follow their raising handlers, K93 (3)).
7. The tables stay here; the other two write through R21 and R22.
8. The review provider is one registration here (R23); `case-authoring` reads its draft door and dead answer through `reviewProvider()`.
9. `from`: `legacy-store`, `legacy-checks`, `legacy-index`. Uses as above: `intent`, `review`, `bias`, `strength`, `content` and `reevaluation` are not called by this module's code.

## Old ids (publication's draft → this file)

R22 → R1; R23 → R2; R24 → R3; R25 → R4; R26 → R5 (its discharge half as called by `ratification` R3); R27 → R6; R28 → R7; R29 → R8; R30 → R9; R31 → R10; R32 → R11; R33 → R12; R34 → R13; R35 → R14; R36 → R15; R37 → R16; R38 → R17; R39 → R18; R40 → R19; R48 → R23; R49 → R24 (its "a retry never re-signs" → `ratification` R10); R50 → R25; R51 → R26 (copied to `ratification` R11, `case-authoring` R24); R53 → R27 (copied to `ratification` R12, `case-authoring` R25); R54 → R28 (its writer, bar axis and bias-manifest arms → `case-authoring` R26); R55 → R29 (copied to `case-authoring` R27); R57 → R30; R58 → R31 (`statement_acknowledgements` → `case-authoring` R28); R59 → R32; R60 → R33 (its share); R61 → R34. New: R20 (the format grammar, from the draft's Terms and R60), R21 (from R14's storing rule and R24), R22 (from R43's and R45's commits). Open for Bob 3 → 2, 4 → 1; 1 → `case-authoring`, 2 → `ratification`.
