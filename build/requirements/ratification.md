# ratification — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), split from publication's draft (K94); for Bob's approval (a product module, P17). Layer 8, second of `publication`, `ratification`, `case-authoring`. Code today (measured on `tranche/T3` @ `f324df9b`, unchanged at `03e2481`; `build/extraction/ratification.md` has the table): `bio-plane/src/store.mjs` 6360–6588 (the case-conclusion comparison: `CASE_BEARING_STATES`, `#caseConclusionFor`, `#editionsRecordingConclusion` and three statics), 11880–12181 (`ratifyCaseDocument`), 33833–34419 (`gateFacts`, `publish`), and the dispatch entries `gatefacts`, `caseratify`, `publish`; `bio-plane/src/index.mjs` 4131–4148 (`testimonyFenceRow`, `ratifyScopeRow`), 4166–4172 (`attributionRow`), 10918–11138 (`op=caseratify`), 11140–11858 (`op=ratify`); `bio-plane/checks/bio-checks.mjs` 233–268 (`caseEditionClaimed`, `isCaseMemberBytes`), 2932 (`SUBJECT_POSITIONS`), 2946–3275 (`CASE_MEMBER_ROLES`, `biasAcknowledgementOf`, `completenessFields`, `checkPublishedExtension`), 11462–12078 (`SEARCHED_SUBJECT_SOURCES`, `CASE_DOCUMENT_FAMILY` C-41.1–C-41.15, `CASE_CITATION_VERSIONS`, `checkCaseDocument`), 13067–13088 (C-92.10–C-92.12), 13650–13670 (C-65), 13749–13790 (C-58), rows C-32.12–C-32.15 (9310–9352) and C-53.10–C-53.12 (13176–13199). No table: it writes through `publication` (its R21, R22). `from`: `legacy-store`, `legacy-checks`, `legacy-index`. Carried: K83 (3) (the case-conclusion comparison, R1). Old ids are listed at the end. "Decided 2" corrected by a worker for BOB #53 (K206's P8, K214): the caller is legacy-checks' `checkInquiryExtension`. N308 wordings folded by BOB #62, 2026-09-29 (K380). folded by a worker for BOB #66, 2026-09-29 (T14 opening; `build/plan/draft-T14-wordings.md`, K444, K445): N339 (with N349) R17; met in T14 (RATIFICATION #6, K470). N364 (DEC-80 item 3, the ceremony's pre-flight; DEC-80 item 4; `build/plan/draft-N345-dec78-80-81.md` §6, K497, K509) folded by a worker for BOB #71, 2026-09-30 (T16 opening): R18–R19; met by RATIFICATION #7 (K557). N400 (K583, K636 BOB-5) folded by a worker for BOB #75, 2026-09-30 (T18): R20–R27, the bulk release stated as built in `store.mjs`; not yet met (extracted by T18's layer-8 job).

**Size (P6).** About 3,230 lines move (about 1,440 without comment-only and blank lines): `store.mjs` 1,118 (455 code) plus the three dispatch entries, `index.mjs` 965 (449), `bio-checks.mjs` 1,136 (530). Under 4,000 of code. (`gateFacts` and `publish` measure 175 lines of code, not the parent map's 274.)

## Public

### Purpose

Publication takes two signatures: an owner signs the case document, and each finding and the evidence it rests on crosses by its own signature (Membership v2 §7). This module holds those two ceremonies and what they judge: whether the project's conclusion a document records still stands, whether the document is well-formed (the case-document catalogue), what may cross and under whose authority, and the facts the signer's gate reads. It commits through `publication`, which holds the record; it authors nothing.

### Provides

Terms are `publication`'s. A **ceremony** is `op=caseratify` (the case document) or `op=ratify` (a finding or its evidence); each runs in the Worker (signature, gate, published store) and commits in the store. Every refusal names `reason`; one with a catalogue row carries its `check`, `code` and `translation`.

#### The case-conclusion comparison

- **R1** `caseConclusionFor(project, inquiry, viewer, state)` answers `concluded` only when the project's relationship (or, with no project entry, the question's own) is concluded and the question is `open`, `surfaced` or `concluded`; else `not_concluded` with `why` (never concluded, withdrew, undetermined, question not case-bearing) and, bounded, the other projects that concluded it. `editionsRecordingConclusion(inquiry, relation, conclusion)` answers which editions pinning the finding record the same conclusion (`same`) and which another. The one reader for R3, `case-authoring` R4 and R8, and `affordances`.

#### The case ceremony

- **R2** `op=caseratify`, in order: a machine credential `MACHINE_CANNOT_RATIFY_CASE` (C-32.13) before the payload is read; not through a member's session `OPERATOR_TOKEN_CANNOT_RATIFY_CASE` (C-32.15); `MALFORMED`; a member resting on a legacy observation that names its author `TESTIMONY_CASE_UNPUBLISHABLE` (C-53.12); a reached observation whose author chose no level `ATTRIBUTION_UNCHOSEN` (C-92.10), a stated level no longer the author's `ATTRIBUTION_STATEMENT_STALE` (C-92.11), both read from `publication.caseDocumentFacts`; `CASE_RATIFY_STALE`; `NO_SIGNERS`; `SIG_<reason>` unless the signature verifies over `caseRatifyStatement(case, edition, docSha)` in `NS_RATIFY` against an active signer; `GATE_REFUSED` with the findings of `promotion.runCaseGate`.
- **R3** The commit (`ratifyCaseDocument`): `MALFORMED`, `CASE_UNSIGNED`, `NO_CASE_DOCUMENT`, `CASE_RATIFY_STALE`; then `membership.caseAuthority` (an owner signs; the founder or a joined member delivers); then a retry with the same signature answers `existed: true` and another is `CASE_EDITION_ALREADY_RATIFIED`; then `CASE_CONCLUSION_MOVED` (C-65.1) when any member's project conclusion is not the one the document records (R1, asked with the signer as viewer); then `CASE_PRODUCTION_DIVERGED`. It commits through `publication.commitCaseEdition`, in one transaction and from the signed bytes only, the case's owner (first edition), the edition's scope, completeness (the acknowledgement list, or null for a document silent about it; both names; the draft link) and bar, and the roster with roles and pins; records signature, signer and deliverer; and discharges the case's flags (`publication` R5).

#### The finding ceremony

- **R4** `op=ratify`, in order: C-32.12; not through a member's session C-32.14; `MALFORMED`; a bundle the viewer cannot see answers as one never minted (R7); `RATIFY_PROJECT_BUNDLE` (C-58.1); an observation still naming its author C-53.10, a finding resting on one C-53.11; an observation with no signed case stating its attribution `ATTRIBUTION_UNSTATED` (C-92.12); `RATIFY_STALE` unless `expectedSha` is the head; `NO_SIGNERS`; `SIG_<reason>` over `ratifyStatement(id, sha)`; `GATE_REFUSED` from `promotion.runGate` with the published, published-case and earned registries.
- **R5** The commit (`publish`): a finding at a sha a ratified case pins needs `caseAuthority` for some pinning project; a finding at a sha none pins is `RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE` (C-58.2); any other bundle crosses only as evidence a ratified case's pinned finding rests on (by `publication.ratifiedFindingsRestingOn`, its R38, read from the start through each `cursor` to null, and no further once a resting finding's project admits the act), under that authority, else C-58.3. `EDITION_EXISTS`, `EDITION_NOT_INCREMENTED`; a retry is idempotent. It writes through `publication.commitEdition`: the edition with signer, deliverer, gate version and parts, every file's hash (append-only), and edges: edges: `serve` only to a published target; a reference to a target not yet published is held privately, never in the published graph (its id is not published), and becomes a `serve` edge when the target is published (Bob, K283).
- **R6** After the commit every part's bytes are copied to the published store by hash, and when the last member of a case edition lands its container is assembled once (`public-read.assembleCaseContainer`, its R6); a copy failing midway leaves rows a re-ratification converges. The answer carries the container and the reused-parts report (`capture`'s).
- **R16** When a target is published (R5), through `publication` R35, every reference to it held privately for a published finding (R5; K283) becomes a `serve` edge, so a case's evidence published after its finding is linked, not only named; it states only what both signatures already cover, and nothing else in either edition changes (Publication §3 rule 2).
- **R7** `gateFacts(id, viewer)` (`op=gatefacts`) answers the facts `op=ratify`'s gate reads (the head, the case relation and pinning editions, the registries, the attribution facts, the earned registry) and `ABSENT` for an id the viewer cannot see, byte-identical to one never minted.

#### The case ceremony's pre-flight (N364; DEC-80 item 3)

- **R18** **caseRatifyPreflight({text, signer, viewer})** answers, over an unsigned document's bytes, every refusal of R2 and R3 that holds before a signature exists, in their order: C-32.13, C-32.15, C-53.12, C-92.10, C-92.11; `NO_ATTESTING_KEY` when `signer` holds no key `membership.attestingKeys` answers (its remedy names `membership` R89, registering one's own key); `CASE_SIGNER_NOT_AN_OWNER`; C-65.1; and `promotion.runCaseGate`'s findings. Each is byte-identical to the act's own refusal. It writes nothing and never throws.

#### The case-document catalogue

- **R8** `checkCaseDocument(fm, ctx)` answers the findings of C-41.1–C-41.15 and the case arms of C-2.8, C-3.1 and C-21.1 over a case document of any accepted format (`case-grammar` R1), each naming its check; pure, never throws; an absent member basis in `ctx` leaves those arms unasked. It is registered with `promotion` as the catalogue `runCaseGate` runs (K31). `CASE_DOCUMENT_FAMILY`, `CASE_CITATION_VERSIONS` (`pinned`, `only_capture`, `undetermined`, `no_capture`, `no_bytes`) and `SEARCHED_SUBJECT_SOURCES` (only `case_basis`; C-41.10 refuses any other) are exported.
- **R9** `checkPublishedExtension` (C-2.8's case-member arm) is registered with `promotion` as a check on bytes `isCaseMemberBytes(fm)` answers true for. `caseEditionClaimed(fm)`, `isCaseMemberBytes(fm)`, `completenessFields(fm)` (the one shape C-21.1 compares, a string comparison), `biasAcknowledgementOf(fm)`, `CASE_MEMBER_ROLES` (`load_bearing`, `supporting`) and `SUBJECT_POSITIONS` (`sought_and_answered`, `sought_no_answer`, `not_sought`) are exported, pure.

#### Bulk release (`op=release`; N400, K583, K636)

The collected-to-verified transition of many Information documents at once, over a selection (Intake Doctrine §4, "What verification asserts, and batch ratification"). Stated as built in `legacy-store`'s `release` (`store.mjs`, its op map's `release` entry); this module's layer-8 job extracts it (K636). `author`, `viewer` and `owner` are the control plane's stamps, never the caller's.

- **R20** **release({handle, acknowledgment, mitigation, viewer, owner, author})**, first refusal: `author` absent, blank or a machine identity (`isMachineIdentity`) is refused `MACHINE_CANNOT_RELEASE` (C-32.1), before anything else is read. Then, each trimmed: an empty `acknowledgment` is `NO_ACKNOWLEDGMENT` (C-33.10); an empty `mitigation` is `NO_MITIGATION` (C-33.11); an `acknowledgment`, then a `mitigation`, longer than `RELEASE_ACK_MAX` (500 characters) or containing a double quote, a backslash, a carriage return or a newline is `BAD_ACKNOWLEDGMENT` or `BAD_MITIGATION`, naming the bound and the forbidden characters.
- **R21** The selection is resolved by `retrieval.selectionResolve` with `weight: "refuse"` under the stamped `viewer` and `owner`; its refusal (`NO_SUCH_SELECTION`, `NOT_YOURS`, `SET_MOVED`) is answered as it stands. A selection resolving to no members is `EMPTY_SELECTION` with `handle` and `drift`.
- **R22** Every member is examined before any document changes, and each is counted under the first of these it fails, in this order: absent or not `information`; not `collected` (with its state); criticality `crucial`; the verified state's entry requirements. The set is then refused whole, never narrowed, by the first non-empty class: `NOT_INFORMATION` (`offenders`, sorted ids); `ILLEGAL_TRANSITION` with `to: "verified"` and `offenders` `{id, from}` sorted by id; `CRUCIAL_IN_BATCH` (`offenders`, sorted ids; crucial material is never batch-released); `ENTRY_REQUIREMENTS` (C-33.12) with `offenders` `{id, missing}` sorted by id.
- **R23** A member's `missing` names, in this order, each entry requirement its document lacks: `well-formed content_hash` (the front matter's `content_hash` is not `sha256:` and 64 lowercase hex digits), `data/dataset.json`, `a file in snapshots/`, and, when `data/provenance.json` is held and parses, `a provenance_chain for documents[i], documents[j] (C-18.9)` naming each register document whose `provenance_chain` is absent, not a list or empty.
- **R24** When every member passes, each is released in the selection's order as a new version through `promotion`'s `promote`, authored by `author`, at one instant for the whole batch (to the second): its `state_history` gains `{timestamp, from_state: <its state>, to_state: verified, blurb: "batch release via selection <handle>; acknowledgment and mitigation in Session Log", author}`; `prior_state` is its former state, `current_state` `verified`, `last_updated` the instant; its Session Log gains the entry `### Session <instant> | Released (batch) | <author>` with the lines `Trigger: selection <handle>`, `Changes: state <from> to verified.`, `Acknowledgment: <acknowledgment>` and `Mitigation: <mitigation>`, placed at the end of the Session Log section (the section is added at the document's end when absent); every other file is carried unchanged, and the new version's `criticality` is the document's.
- **R25** A member whose `bundle.md` is gone when its turn comes answers `NO_DOCUMENT`; one whose `state_history` block cannot be extended in place answers `UNSPLICEABLE_STATE_HISTORY` (a transition recorded nowhere would leave `prior_state` pointing at a history the document does not carry, C-4.2); a refusal from `promote` is answered as `promote` gave it. Each carries `bundleId` and `releasedSoFar`, the members already released in this call, which stay released: the pre-flight of R22 is whole-set, the writes are per member.
- **R26** Success answers `{ok: true, handle, released, acknowledgment, mitigation, weight: "refuse", drift}`: `released` the member ids sorted, `acknowledgment` and `mitigation` as trimmed and recorded, `drift` the selection's.

## Private

### Uses

- `legacy-checks`: the rows until they move (R14), `parseFrontmatter`, `normalizeType`, `isMachineIdentity`, `sectionText`, `canonicalJson`.
- `signatures`: `verifySshsig`, `ratifyStatement`, `caseRatifyStatement`, `NS_RATIFY` (R2, R4).
- `record-core`: `recordOf(ctx)`, `transact`, `stampInstant`, `textAtSha` (its R60; R3), the `bundles`, `history` and `manifest` read contracts (R7). *(`textAtSha` not yet provided: T8's record-core entry)*
- `membership`: `caseAuthority`, `inSight`, `existenceAct`, `attestingKeys`.
- `promotion`: `promote` (R24), `runGate`, `runCaseGate`, `registerStep` (R9) and the case-gate catalogue registration its R33 gains by K94 (R8). *(not declared: that registration not yet provided)*
- `retrieval`: `selectionResolve` (R21).
- `provenance`: the `register` read contract, `partsHeld` (R4, R6).
- `capture`: `reusedParts`, `recordReuseVerdicts`, `captureLimit` (R6).
- `inquiry`: `earned` and the subject entity (R7), the basis read.
- `basis-versions`: `conclusionOf`, `conclusionRecordOf`, `noProjectConclusionOf`, `projectsDrawingOn` (R1), `testimonyReach` (R7).
- `publication`: `caseDocumentFacts`, `caseRelation`, the registries and pinning reads, `attributionFacts`, `attributionStatedFor`, `observationsNamingAuthor`, `commitEdition`, `commitCaseEdition`, `dischargeCaseFlags`, `delivererOf`, `deliveringPrincipal`; and, through its re-export, `case-grammar`'s format grammar and `publishedGraphEdges` (`case-grammar` R1, R5; K651).
- `public-read` (K651): `assembleCaseContainer` (its R6), and the public reads R6's tests read (`publishedManifest`, `publishedList`, `publishedEditions`: its R4, R2).

### Invariants

- **R10** A retry never re-signs, and nothing this module commits is later changed: a correction is a new edition (DEC-12, DEC-19).
- **R11** No commit composes a case-level strength: every pair is per member and per axis (DEC-44, DEC-21).
- **R12** Signer and deliverer are two facts: the signer is read from the verified signature, the deliverer from the control plane's stamp, and neither is copied from the other.
- **R13** What a commit records is read from the signed bytes only; what they are silent about is recorded null, never filled (an acknowledgement list, a deliverer undetermined).
- **R14** Each check moves here as an invariant with its test (K6): C-41.1–C-41.15 with the case arms of C-2.8, C-3.1 and C-21.1; C-58.1–C-58.3; C-65.1; C-53.10–C-53.12; C-32.12–C-32.15; C-92.10–C-92.12. A change to any moves `CATALOG_VERSION` (rule 17).
- **R15** No place is named in this module's behaviour or outward text.
- **R19** (N364) A signature verifies against a key by `membership` R27's predicate alone, whatever the key's `origin` (`membership` R91).
- **R17** (N339, K421) A store answer this module's Worker handlers relay that is the store's own refusal (`control-plane` R23: `ok: false` below 500) is answered with the store's status, code and sentence through `storeRefusal`; only a reply that is no answer is `STORE_DID_NOT_ANSWER`, with the store's correlation id when it gave one (`control-plane` R25; N349). This holds for a store read made inside a longer act (K444): the ratify gate's store-half relay (`ratifygate`, which runs `promotion.runGate` on the store's host so registered grammars reach it, N417) answers the store's silence as `STORE_DID_NOT_ANSWER` with the correlation id, and its refusal as the store's own, never as a finding about the record (`PLANE_MISSING_BYTES`) (N354, K477).
- **R27** (K636) No document moves before every member of the selection has passed R22, and a batch never carries a member that is crucial or not `collected` Information: the bulk transition is a named member's decision, recorded in each document's own record with the acknowledgment and mitigation (Intake Doctrine §4).

### Satisfies

- `docs/architecture/BIO_Publication_v0_1.md` §2, §3 rules 1–3, 5, 12, 14, 17 (the catalogue version), §4.
- `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (case ratification: who signs, who delivers).
- `docs/development/INVESTIGATIVE-SESSION.md` §7.1 items 4, 7, 9 (the project's conclusion a case records).
- `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4.4 (the attribution gate).
- DEC-12, DEC-13, DEC-19, DEC-31, DEC-44, DEC-46, DEC-72; REC-140.
- DEC-80 items 3 and 4 (N364): the ceremony's pre-flight (R18) and a self-registered key (R19).
- `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §4, "What verification asserts, and batch ratification" (Bob, 2026-07-27): the bulk release (R20–R27).

### Suggestions

- **Factory.** `ratificationOf(ctx)` answers the one instance per Durable Object storage (K61); the Worker half of `op=ratify` and `op=caseratify` lives in this module's paths as a Worker-side file (K3), calling the store half through the Durable Object as today (`gatefacts`, `casedocfacts`, `caseratify`, `publish`, `reusedparts`, `recordreuseverdicts`, `capturelimit`).
- **For callers.** The control plane keeps admission (the credential class, today `classify`), the stamps (`viewer`, `deliveredBy`) and the routes; it passes the class so R2's and R4's first two refusals are asked here.
- **Direct SQL on others' tables** (`register`, `inquiry_basis`, `refs`, `manifest`, `history`, and `publication`'s tables in `publish` and `ratifyCaseDocument`) becomes the owner's service or a stated read contract (K57); every write goes through `publication` R21–R22.
- **Tests.** Each check gets a negative control; R7 an identical-bytes arm; R3 and R5 retry arms; R1 one arm per `why`.
- **Bulk release (R20–R27).** Extracted from `store.mjs` (`release`, `RELEASE_ACK_MAX` and the two front-matter helpers it calls, `#appendStateHistory` and `#setScalar`, which `retire` also calls, so the store keeps its own until `retire` moves), its op-map entry rewired to this module (§12.2); nothing new in `dispatch.mjs` (K586). `release.test.mjs` is the old suite these Rs state; converted, never deleted by the job (K619). As built, the doctrine's "contested" exclusion has no arm (nothing marks material contested); it binds here only once that term is built. Rows C-32.1 and C-33.10–.12 are copied into this module's table (split tables; T19 deletes the catalogue's).

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for rulings)

1. C-41 and `checkCaseDocument` register with `promotion` for `runCaseGate` (K94); promotion's R33 then runs the registered catalogue, `legacy-checks` re-exporting it until its entry.
2. `checkPublishedExtension` registers with `promotion` (K94); its caller, legacy-checks' `checkInquiryExtension` (inquiry's grammar, kept in `legacy-checks` by K181 (1)), stops calling it.
3. `#projectsDrawingOn` is `basis-versions'` (K94); R1 calls it.
4. `SUBJECT_POSITIONS` is this module's, not `case-authoring`'s as the parent map had it: C-2.8's case arm and C-41 read it, and this module is earlier. `case-authoring` and `affordances` import it from here.
5. `SEARCHED_SUBJECT_SOURCES` is this module's (C-41.10 reads it); `case-authoring`'s `searchedSection` imports it.
6. `caseEditionClaimed` and `isCaseMemberBytes` are this module's; `legacy-checks` keeps its own copy for C-3.1's heading rule (bio-checks 1295), which is not a case check and runs before layer 8 (K57).
7. C-92.10–C-92.12 and `attributionRow` (index 4166–4172) are this module's: its handlers raise them (K93 (3)).
8. `from`: `legacy-store`, `legacy-checks`, `legacy-index`. Uses as above.

## Old ids (publication's draft → this file)

R41 → R1; R42 → R2; R43 → R3; R44 → R4; R45 → R5 (its commit primitives → `publication` R22); R46 → R6; R47 → R7; R49's "a retry never re-signs" → R10; R51 → R11 (copy); R53 → R12 (copy); R54's committed-null arm → R13; R60's share → R14 (and R8, R9, from Decided 2 and 3 of the parent); R61 → R15. Open for Bob 2 → 1.
