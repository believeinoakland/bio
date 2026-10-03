# case-authoring — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), split from publication's draft (K94); for Bob's approval (a product module, P17). Layer 8, third of `publication`, `ratification`, `case-authoring`. Code today (measured on `tranche/T3` @ `f324df9b`, unchanged at `03e2481`; `build/extraction/case-authoring.md` has the table): `bio-plane/src/store.mjs` 7975–9273 (`publishCase`), 9274–10035 (`CASE_CITATION_WORDS`, `#caseCitations`, `#caseDocumentText`, `#caseConclusionRowLines`, `#searchedForCase`), 11079–11815 (the statement acknowledgements, `STATEMENT_ACK_MAX` … `#statementWriter`), 12183–12197 (`COMPLETENESS_MAX`, `MEMBER_ROLES`), 42195–42199 (`SEARCHED_SUBJECT_MAX`), and the dispatch entries `publishcase`, `statementack`; `bio-plane/src/airun.mjs` 1405–1638 (`searchedSection`, `SEARCHED_LEVEL_OUTCOMES`; K82 (5)); `bio-plane/checks/bio-checks.mjs` 9081–9101 and 9110–9190 (C-44.1, C-44.3–C-44.5), 14237–14344 (C-82.2–C-82.7), row C-32.6 (9247–9254); `schema.mjs` 3576–3598 (`statement_acknowledgements`). `from`: `legacy-store`, `legacy-checks`; `airun.mjs` 1405–1638 moves out of `ai-runs`' file. Not yet met: R12 (REC-15, K102), R21 (its named-draft half); R7 (N322) met by CASE-AUTHORING #3 (K434). Carried: K82 (5) (the acknowledgements, the searched section). Old ids are listed at the end. Uses' `observation-log` line corrected by a worker for BOB #53 (K206's P3, K214): the services are observation-log's `missingCause`, `missingCauseAt` and `firstRowAt`, and the two probes move with this module. N345's contradiction part folded for T15 by a worker for BOB #68, 2026-09-30 (K455, K456, K459). N364 (DEC-80 item 3, DEC-81 items 1 and 3, DEC-78 item 5; `build/plan/draft-N345-dec78-80-81.md` §7, K497, K509) folded by a worker for BOB #71, 2026-09-30 (T16 opening): R34–R37 new, R12, R14, R29 and R32 amended, rows C-120.4–C-120.7; met by CASE-AUTHORING #5 (K557). T19 layer 8's wordings, by a worker for BOB #80 on `tranche/T19`, 2026-10-01, before layer 8 (rule 6 of `build/plan/current.md`): R34's viewer carries the door's `aiCred` stamp (N435, K737; N407's other half, met at the interface `ratification` R18 already states); Uses gains `case-grammar` (N424, BOB's edge). No change of meaning. T22's folds, by a worker for BOB #90 on `tranche/T22`, 2026-10-01, as Bob approved them (K1019): DEC-101's "What changed" statement required for an edition above 1 and the machine draft of it (R38, R39), DEC-103's lens printed into the signed case (R40), R14 widened for both; Uses gain `proposalLabel`, the public-locator test and `case-grammar`'s R8–R9 (no new module); not yet met (T22 layer 8). DEC-88's reason, by a worker for BOB #90 on `tranche/T22`, 2026-10-01 (`build/plan/t22-dec88-audit.md`; K1025): R19, the acknowledger's words (`STATEMENT_ACK_NO_REASON`, C-82.8), with R29's row; not yet met (T22). T23, by a fold worker for BOB #94 at T23's opening, on `fold/T23-b` from `tranche/T23`, 2026-10-02: R41 (`publishCase` writes `working_on` from `network-notices.noticeReferenceOf`; `build/plan/draft-network-notices.md`, DEC-111) added, not yet met (T23 L8); Uses gain `network-notices`. Folded by a worker for BOB #104 at T28's opening, 2026-10-03, from `plan/draft-T28-dec112.md` (N519, N520's DEC-112 share; K1268, K1275, K1277) and `plan/draft-T28-n522.md` (N522; K1273): R43–R49 (what the case carries and what it may rest on; DEC-112, DEC-119) and R50–R53 (another group's work the case rests on; N522) added; R14, R29, R34 and R37 amended; rows C-120.8 and C-120.10–C-120.13 (C-120.9 withdrawn unstamped, K1275, K1277); Uses gain `promotion` and `case-import`; not yet met (T28). AMENDED by a fold worker for BOB #106 on `prep/T29-folds`, 2026-10-03, entry N529, ruling K1333 (seam read `build/extraction/case-authoring-split.md`, Appendix B; K1333 governs where they differ): split for size by K617, no requirement changing meaning. R31, R35, R36, R37, R43–R52 and R54 moved to `case-disclosures` R1–R15, and R12 to its R16; each retired here as moved. R29's C-120 family moved whole to its R22 with the rows' ids and translations. R33 copied there. The disclosure renderers are moved, not copied: this module imports them from `case-disclosures` and keeps no copy (K1333; one spelling, P15), and the signed document stays byte-identical. No test file moves; the arms that drive `publishCase` are re-tagged R55. New here: R55 (the order in which `publishCase` asks `case-disclosures`), not yet met (T29). R14, R15, R32, R34 and R53 re-pointed (wording only). Uses lose `contradiction`, `attestation`, `capture`, `sources`, `promotion`, `case-import` and `inquiry-grammar`, and gain `case-disclosures`.

**Size (P6).** About 3,340 lines move (about 1,610 without comment-only and blank lines): `store.mjs` 2,818 (1,370 code) plus about 42 of dispatch, `airun.mjs` 234 (101), `bio-checks.mjs` 218 (85), `schema.mjs` 23 (13). Under 4,000 of code. Measured 4,010 at T28's merge (K1328). After N529's split, about 2,940 (`case-disclosures` about 1,210).

## Public

### Purpose

Before anything is signed, the project's owner prepares a case: which concluded findings it rests on and in what role, what it covers and excludes, who wrote its statement, what was searched and with what outcome, and what bias it acknowledges (Publication §3). This module holds that preparation, `op=publish`: it judges the preparation, authors the case document's text from the record and the owner's words, and stores it unsigned in `publication`. It also holds the statement's acknowledgements, by which members and review recipients say they have read the statement before it is signed. What the case discloses about what it rests on (tensions, grades and co-attestation, sources, materials, accepted work and flags, grading facts, hunch debt) is judged and spelled by `case-disclosures`, which `publishCase` asks (R55).

### Provides

Terms are `publication`'s. A **preparation** is an unsigned case document; a **statement** is the completeness block's authored sentence. Every refusal names `reason`; one with a catalogue row carries its `check`, `code` and `translation`.

#### Preparing a case: publishCase({project, targets|target, roles, scope, statement, excluded, subjectPosition, subjectJustification, biasAcknowledgement, whatChanged?, caseId?, newCase?, draft?, viewer, author}) (`op=publish`)

- **R1** An empty or machine `author` is `MACHINE_CANNOT_PUBLISH` (C-32.6) before anything else.
- **R2** Authority, in order: `NO_PUBLISHING_PROJECT`; a project the viewer sees only at existence answers membership's existence refusal (C-70.1); one it cannot see, or none, `NO_SUCH_PROJECT`, identically; `NOT_A_PROJECT`; `NOT_THE_PROJECT_OWNER` (an owner only; no administrator arm).
- **R3** Authored fields, in order: `NO_TARGET`, `DUPLICATE_MEMBER`, `NO_STATEMENT`, `NO_SUBJECT_POSITION` (one of `ratification`'s `SUBJECT_POSITIONS`), `NO_SUBJECT_JUSTIFICATION`, `NO_EXCLUSION_FIELD` (absent; an empty list is legal), `NO_SCOPE`, `NO_BIAS_ACKNOWLEDGEMENT`, `BAD_EXCLUSION` (with `ord`), `BAD_COMPLETENESS` (a field over 2,000 characters or holding a quote, backslash or line break).
- **R4** Each member, in order: `NO_SUCH_BUNDLE` (absent and invisible alike), `NOT_AN_INQUIRY`, `NO_DOCUMENT`, `NOT_CONCLUDED`. Concluded is asked of the publishing project's relationship (`ratification` R1), and the refusal names `relationship`, `why` (never concluded, withdrew, undetermined, question not case-bearing) and the projects that did conclude, with the read's bound.
- **R5** `roles` is a map from member id to `load_bearing` or `supporting`, with no default: `BAD_ROLES`, `NO_MEMBER_ROLE`, `BAD_MEMBER_ROLE`, `NO_LOAD_BEARING_MEMBER`.
- **R6** The project's bar (`strength.projectBar`) is read once. On each axis it declares, each load-bearing member's pair (`strength.strengthOf`) must reach it; an unrated or undetermined axis does not: `BELOW_PROJECT_STRENGTH` names member, axis, required, reached and state. Supporting members and undeclared axes are not asked; the group default is never consulted.
- **R7** The case: `caseId` with `newCase` is `CASE_IDENTITY_AMBIGUOUS` (C-44.1), and so is neither when the members serve more than one published case, naming them. A named case not published is `NO_SUCH_CASE`. Otherwise the named case, else the one case the members serve, else the case this act's own unsigned preparation names, else a minted opaque `CASE` id (`MINT_EXHAUSTED` through `record-core.mintExhausted`, its R62, if none is free, and nothing is published). `newCase` skips derivation. A case never changes project: `CASE_BELONGS_TO_ANOTHER_PROJECT`.
- **R8** `ALREADY_A_CASE_MEMBER` when an edition of this case, or any unsigned preparation, pins a member's current bytes (`publication.caseRelation`) and already records the conclusion this act would record (`ratification.editionsRecordingConclusion`). A finding may serve any number of cases.
- **R9** `draft=` binds the draft's readings to this case, refused before any id is minted when it is not a draft of this project the caller can read (`PUBLISH_DRAFT_NOT_FOUND`, C-44.3), stands at another case identity than this act authors (C-44.4), or was already named for another case edition (C-44.5). The draft door is `publication`'s review provider (its R23); with none, every `draft=` is C-44.3.
- **R10** Freshness (C-21.1): the statement, subject justification, exclusion list or bias acknowledgement byte-identical to the previous ratified edition of this case is `COMPLETENESS_CARRIED_FORWARD` (the bias acknowledgement `BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD`), naming the field, compared through `ratification.completenessFields`. The scope is not compared.
- **R11** A searched section that cannot be computed honestly (R17) is `CASE_SEARCHED_UNCOMPUTABLE`, and nothing is written.
- **R12** *(retired: moved to `case-disclosures` R16, N529)*
- **R13** Publishing writes nothing on any finding (rule 12): each member is pinned at its `bundle_sha` as prepared. A member's own edition is the published edition of that sha when another case carried it across, else the next on its chain; the case edition is the case's highest published edition plus one.
- **R14** The document, format `bio-case-document/6`, is stored unsigned through `publication.storeCaseDocument` (never over a signed one). It states: the case, edition and project; the scope; the roster with roles and pins; per member its own edition, its frozen pair (capture and connection always, testimony when not unrated) with grounds, and the conclusion it rests on (relationship, reading, claim); the completeness block (statement, subject position and justification, exclusions, `author` the publisher, `statement_by` (R21) with where the name came from, `statement_sha`, `acknowledged` and the list, R20); the bias acknowledgement; the bias manifest frozen from `bias.biasManifest` at the project's scope read as the plane (`in_force` true, false or null, with `pins_proposed` count and rows); the lens statements printed whole (R40); the bar, an undeclared axis as null and "no bar set on the <axis> axis"; the attribution statements (`publication.attributionStatements`); the citations (R16); the tensions disclosed (`case-disclosures` R1) and, in each member's block, its tension sentences; the searched section (R17); the `captures:` block (`case-disclosures` R2, R3) and the `sources:` block (its R4); the `method:` block (its R5); the `materials:` and `material_attestations:` blocks (its R7); the `accepted_work:` and `accepted_work_flags:` blocks (its R13, R14); the draft link when named (R9: draft, who named it, when); the "What changed" block and its section for an edition above 1 (R38); the `grading_facts:` and `passages:` blocks (`case-disclosures` R15); a receipt. Its body prints every authored sentence. (The lens statements and the "What changed" block: DEC-101, DEC-103; K1019. The `/6` format and its blocks: DEC-112 (3)(4)(5), DEC-96 item 4; K1268, K1273)
- **R15** The answer: `{ok, caseId, minted, edition, caseDocument: {case_id, edition, doc_sha, bytes, read}, findings, scope, project, required, roles, bias_acknowledgement, bias_manifest, case_citations, completeness, tensions, tensions_highlighted, tensions_legs_unread, author, at, weight: "single", next}` (the last three from `case-disclosures` R1's entries, R55); each finding with `bundleSha`, `promoted: false`, `edition`, its per-axis pair, `role`, `required`, and `edition_warranted` or `reevaluation` (raised through `reevaluation` when its edition is new and above 1) where they apply; `target`, `bundleSha`, `state` at the top only for one member. No key composes a case-level strength.
- **R16** Citations (rule 18): every non-severed `cites` edge of the project at the act, each `pinned` (with its capture), `only_capture` (the one held), `undetermined` (several held; never back-filled), `no_capture` or `no_bytes`.
- **R17** The searched section is computed from the observation log at authoring over the members' legs and never recomputed (`searchedSection`, subject source `case_basis` only, at most `SEARCHED_SUBJECT_MAX` subjects); it states what was looked for at each level and with what outcome, and why where undetermined.
- **R18** `publishCase` is synchronous and writes only inside the caller's transaction, so a caller may run it and roll it back (the review copy's missing-list).

#### Statement acknowledgements: acknowledgeStatement({draft?, case?, edition?, secretSha?, bySecret, reason, viewer}) (`op=statementack`)

- **R19** Doors: a recipient through a live review grant (a named draft must be the grant's own); a member, of a draft, or of an unsigned case document it has standing in. Every other caller receives the review copy's dead answer (`publication`'s review provider, its R23), byte-identical. `STATEMENT_ACK_NO_SUBJECT` (C-82.2), then a signed document `STATEMENT_ACK_ALREADY_SIGNED` (C-82.3); a member not a joined participant of the publishing project `STATEMENT_ACK_NOT_A_PARTICIPANT` (C-82.4); no statement C-82.5; the writer undetermined, for a participant, C-82.7; the writer, or on the case door the publisher, `STATEMENT_ACK_BY_ITS_AUTHOR` (C-82.6); then `STATEMENT_ACK_NO_REASON` (C-82.8: the `reason`, the acknowledger's words, absent, not a string, blank or over 2,000 characters), kept with the acknowledgement and shown in R20's list (DEC-88; K1025). A recipient is never the writer.
- **R20** An acknowledgement is keyed by the statement's SHA-256, the project, the case identity it was given at and the acknowledger, and a repeat answers `existed: true`. It is matched by that identity or by the draft named at publication, never by the statement's bytes. On an unsigned document it re-authors only that document's list (`publication.reauthorSection`), so its hash moves. Every list states `acknowledged` (zero included), withholds and counts the publisher's own and the writer's own rows, withholds and counts every participant row when the writer is undetermined, and counts, never names, readings bindable to no case. Nothing about an acknowledgement refuses publication. `statementAcknowledgements(...)` is the one list, read by R14 and by the review copy.
- **R21** `statement_by` is the member whose write made the statement's current bytes: the named draft's stamp; else a draft of the project holding that sentence; else the publisher, named as both, with the sentence saying so. Drafts disagreeing, or a draft from before the stamp, make it null, stated undetermined, never filled from the publisher.

- **R31** *(retired: moved to `case-disclosures` R1, N529)*

#### The ceremony's read: tensionsToDisclose({project, targets|target, viewer, author}) (`op=publishtensions`)

- **R32** (DEC-85: the ceremony tells the publisher before the act) The read the ceremony shows before `op=publish`.
  - **Refusals.** R2's authority refusals and R4's per-member refusals, each in its order. Then `case-disclosures` R1's `TENSIONS_UNDETERMINED` (C-120.3), when its `tensionsRead` fails or is truncated, or this read throws (`tensionsUndetermined`).
  - **The answer.** Each candidate `case-disclosures` R1 would require the act to disclose, read by its `tensionsRead` exactly as `publishCase` reads it (the same viewer, each member at its current bytes). A highlighted one (`case-disclosures` R1) carries the sentence the ceremony shows before the act: "A finding in this case rests on something in conflict with a record you cannot see. You can still publish. The published case will highlight that this finding rests on a side in conflict with a record not shown, and will not name that record or who holds it." The answer counts `highlighted`, and states that publishing discloses and is never blocked by a conflict (DEC-76 item 4).
  - It writes nothing and never throws. It is step three's read, carried in R34's answer.

#### The ceremony's pre-flight: publishPreflight({…publishCase's inputs, viewer, author}) (`op=publishpreflight`; N364, DEC-80 item 3, REC-15)

- **R34** It runs `publishCase` inside a transaction it rolls back (R18), then `ratification.caseRatifyPreflight` over the text that would be stored, with `author` as signer and, as its `viewer`, the stamped `viewer`, or `{stamp: viewer, aiCred}` when the control plane stamps the caller's minted agent credential (`aiCred`, its token id and principal; N407), so `ratification` R18's machine fences hold an agent whatever its viewer stamp. It answers `{ready, first, blockers[], steps}`. `first` is exactly the refusal `op=publish` would give (DEC-8). `blockers` lists every other refusal it can reach independently: R6, and `case-disclosures` R16, R2, R6 and R1 (as R32 reads it), and `ratification` R18's list (which carries C-92.10 and C-58.5 for off-the-record material, `ratification` R2, R35). `steps` gives the five steps' content: what becomes permanent, which states that the case republishes in full every document it includes, and that judging whether they may be republished, copyright included, is the group's (DEC-112 (4); the words are the UX stream's, and until it gives them, that plain sentence); what this rests on (roles, pairs, bar); what you are leaving out (exclusions, searched section, bias, R32's tensions, `case-disclosures` R2's self-attested documents, its R4's source statements), which also lists each source shown as "Withheld" (`case-disclosures` R4); the edition this creates; and sign. It writes nothing. (DEC-112 (4)(5); K1275)

- **R35** *(retired: moved to `case-disclosures` R2, N529)*
- **R36** *(retired: moved to `case-disclosures` R3, N529)*
- **R37** *(retired: moved to `case-disclosures` R4, N529)*

## Private

### Uses

- `record-grammar`: `parseFrontmatter`, `normalizeType`, `isMachineIdentity`; `proposalLabel` (subject `edition_statement`, its R43; R39) and the public-locator test (R40) (K1019).
- `record-core`: `recordOf(ctx)`, `transact`, `mintOpaqueId`, `mintExhausted` (its R62; R7), `stampInstant`, `declarePurge`.
- `membership`: `viewerPredicate`, `isProjectOwner`, `isJoinedParticipant`, `existenceAct`; `noSuchProject` (its R78), through which R2's `NO_SUCH_PROJECT` is answered (K231).
- `provenance`: the `register` and `captured_locators` read contracts (R16).
- `extraction`: the `readings` read (R16). `content`: the content read (R17).
- `bias`: `biasManifest` (R14), its statements with their citations (R40).
- `observation-log`: its reads, `missingCause` and `missingCauseAt` (its R11), `firstRowAt` (its R9), `MEANING_EVIDENCE_IS_ONE_SIDED` (R17). The two evidence probes that feed them, `#missingMeaningCause` and `#missingContentCause`, are legacy-store's; `#searchedForCase` is their only caller, so they move with this module (K206).
- `inquiry`: the basis read (R17).
- `basis-versions`: `testimonyReach` (R14).
- `strength`: `strengthOf`, `projectBar`, `STRENGTH_AXES`, the axis words (R6, R14).
- `reevaluation`: the raise for a new member edition (R15).
- `publication`: `caseRelation`, the published registries (R7's derivation), `storeCaseDocument`, `reauthorSection`, `attributionStatements`, `reviewProvider`, `hasCaseStanding`, the format grammar (the `/5` predicate, N345; `case-grammar` R1, R2, through `publication`'s re-export, K651).
- `case-grammar` (N424, K690): the acknowledgements section's locator (`REAUTHORABLE_SECTIONS`, its R3), read for `#reauthorAcknowledgements` rather than spelled a second time, and `fmSafe` (its one front-matter spelling), read rather than copied; the "What changed" and lens blocks' spellings (its R8, R9; R38, R40; K1019).
- `ratification`: `caseConclusionFor`, `editionsRecordingConclusion` (R4, R8), `completenessFields`, `biasAcknowledgementOf`, `SUBJECT_POSITIONS`, `SEARCHED_SUBJECT_SOURCES`.
- `ratification`: `caseRatifyPreflight` (its R18), for R34.
- `network-notices`: `noticeReferenceOf` (its R19; R41).
- `case-disclosures` (N529, K1333): `hunchDebt`, `tensionsJudged`, `tensionsRead`, `tensionsUndetermined`, `restingCaptures`, `captureFacts`, `selfAttestedJudged`, `materialsJudged`, `acceptedWorkJudged`, `flagsJudged`, `sourcesStated`, `withheldOf`, `findingFacts`, `methodOf`, `disclosureBlocks` (its R1–R16; R55); its renderers and `FLAG_SENTENCE`, imported, never copied (R14; K1333); `SELF_ATTESTED_SENTENCE` and `FLAGS_SAY` (R34, R53); `CASE_DISCLOSURE_CHECKS`, re-exported for this module's importers. Index 68, before this module.

### Invariants

- **R22** Everything a case document asserts arrived as an authored argument, was read from the record at the act (pins, pairs, conclusions, manifest, citations, searched section, acknowledgements), or is a stated fact; nothing is composed, summarised or inferred.
- **R23** Preparing a case moves no finding's bytes or pin, so no project's act moves another project's case (rule 12, INVESTIGATIVE-SESSION §7).
- **R24** No answer or document this module writes composes a case-level strength: every pair is per member and per axis (DEC-44, DEC-21).
- **R25** Every authorship field (`author`, an acknowledger, the draft link's namer) is a stamp; `statement_by` is read from the record (R21), never a body's.
- **R26** Undetermined is stated and never filled: a statement writer, an undeclared bar axis, a bias manifest not established, a citation's version.
- **R27** Working material (an unsigned document, a draft, a hidden project) answers an outsider exactly as something that does not exist; R19's dead answer is byte-identical for every door refused.
- **R28** `statement_acknowledgements` and `what_changed_drafts` (R39) are each declared whole to `record-core`'s purge (K23, K1147).
- **R29** Each check moves here as an invariant with its test (K6): C-44.1, C-44.3–C-44.5, C-82.2–C-82.8 (C-82.8 new, below; DEC-88, K1025), C-32.6 and C-33.14 (R3's `NO_STATEMENT`); C-120.1–C-120.8 and C-120.10–C-120.13, "a case's disclosures and its pre-flight", moved with their ids, codes and translations to `case-disclosures` (its R22; N529). A change to any moves `CATALOG_VERSION` (rule 17).
- **R30** No place is named in this module's behaviour or outward text.
- **R33** (DEC-85) No case document this module writes, and no answer it gives, names the project, members, content, kind or source of a side the publisher could not see at the act. A reveal (`contradiction` R52) never widens what a case names: sight at the act, by `membership` R43, governs. (Copied as `case-disclosures` R17.)

Rows C-120.1–C-120.8 and C-120.10–C-120.13 are `case-disclosures`' (its R22; N529).

Row C-82.8 (R19, R29; DEC-88, K1025), with its translation; stamped by 1.53.0:

| row | code | translation |
|---|---|---|
| C-82.8 | `STATEMENT_ACK_NO_REASON` | "An acknowledgement of a statement is recorded with your own words on it, and none were given, or they are longer than 2,000 characters. Write them. Nothing was written." |

#### What changed in this edition, and why (DEC-101 (1)(2); K1019)

- **R38** `publishCase` takes `whatChanged: {text, draft?}`. For an edition above 1, an absent `whatChanged` or a blank `text` is refused `NO_WHAT_CHANGED`, and a `text` over 8,000 characters `BAD_WHAT_CHANGED`, after R3's refusals and before anything is written. `draft` names a machine draft (R39) of this case; a `draft` that is not one is refused `NO_SUCH_WHAT_CHANGED_DRAFT`. When one is named the document records `began_as: machine_draft` and whether `text` is the draft's words unchanged; without one, `began_as: member` (`case-grammar` R8). The statement is written into the document's block and printed in its body section (`case-grammar` R8). A first edition carries none. (DEC-101 (1)(2); K1019) The `draft` arm (`began_as: machine_draft`) is met with R39 (K1025); until then `began_as` is `member`.
- **R39** `proposeWhatChanged({case, text, proposedBy, viewer})` (`op=whatchangedpropose`) stores a draft of a new edition's statement, labelled machine work when its proposer is a machine (`record-grammar`'s `proposalLabel(proposedBy, "edition_statement")`, its R43). It is never a statement until a member adopts or rewrites it through R38. Any credential may propose. `whatChangedDrafts({case, viewer})` (`op=whatchangeddrafts`) lists the case's drafts, oldest first, each with its id, text, label and when. Refusals: `NO_SUCH_CASE` (a case not published, or one the viewer may not see, answered alike); an empty `text`, or one over 8,000 characters, `BAD_WHAT_CHANGED`. Drafts are append-only. (DEC-101 (1); DEC-84 (14); K1019)

#### The lens printed into the signed case (DEC-103; K1019)

- **R40** At publication every statement in the effective set of the frozen manifest (`bias.biasManifest`, every page read) is printed into the document (`case-grammar` R9): its kind in plain words, its subject, its text, its justification, and each of its citations that is public material, being a public web address (`record-grammar`'s public-locator test) or a bundle or hash this copy has published (the published registries). Every other citation is withheld and only counted, per statement, never named. With no manifest in force the block states that none was in force. The unsigned document R14 stores, which `op=publish` answers and R34 checks, holds every byte that will be printed, so the publisher can be shown exactly what will be printed before signing. (DEC-103; K1019)

#### The project reference (DEC-111; K1019, K1031)

- **R41** (DEC-111; `case-grammar` R10) `publishCase` writes `working_on` as `network-notices.noticeReferenceOf(project)` answers it (its R19), and omits it when that answer is null.
- **R42** (DEC-111; K1031 (3); K1119) `publishPreflight`'s "What becomes permanent" step states, when the project has a notice (R41), that publishing opens its sealed weeks (`ratification` R37); the words are the UX design stream's, and until it gives them, one plain sentence saying so.

- **R43** *(retired: moved to `case-disclosures` R5, N529)*
- **R44** *(retired: moved to `case-disclosures` R6, N529)*
- **R45** *(retired: moved to `case-disclosures` R7, N529)*
- **R46** *(retired: moved to `case-disclosures` R8, N529)*
- **R47** *(retired: moved to `case-disclosures` R9, N529)*
- **R48** *(retired: moved to `case-disclosures` R10, N529)*
- **R49** *(retired: moved to `case-disclosures` R11, N529)*
- **R50** *(retired: moved to `case-disclosures` R12, N529)*
- **R51** *(retired: moved to `case-disclosures` R13, N529)*
- **R52** *(retired: moved to `case-disclosures` R14, N529)*
- **R53** The ceremony.
  - R34's `blockers` gain `case-disclosures` R13 and R14.
  - Its step "what this rests on" names each `accepted_work:` row.
  - Its step three lists the flags `case-disclosures` R14 requires, read as `publishCase` reads them, beside R32's tensions, with the statement that publishing discloses them and is never blocked by them (`FLAGS_SAY`).

  It writes nothing. (DEC-96 item 4; DEC-85)
- **R54** *(retired: moved to `case-disclosures` R15, N529)*

#### The disclosures `publishCase` asks (N529; K617, K1333)

- **R55** `publishCase` takes `tensionsDisclosed`, `selfAttested` and `flagsDisclosed`, and hands them to `case-disclosures`.
  - **The order.** After R6 and before the case identity is derived, it asks `case-disclosures`, in this order:
    - `hunchDebt` (its R16);
    - `tensionsJudged` (its R1, at the bytes R13 pins);
    - `restingCaptures`, `captureFacts` and `selfAttestedJudged` (its R2);
    - `materialsJudged` (its R6);
    - `acceptedWorkJudged` (its R13);
    - `flagsJudged` (its R14).

    It answers the first refusal of the first step that refuses. Nothing is written and no id is drawn.
  - **After R11.** After R11, and only then, it asks `sourcesStated` and `withheldOf` (its R4). It passes `publication.attributionStatements` the reached observations and the withheld captures (its R10). Then it asks `findingFacts` (its R15), `methodOf` (its R5) and `disclosureBlocks` (its R3, R7, R10, R14).
  - **Into the document.** It writes their rows into R14's document through `case-disclosures`' renderers, imported from it and never copied (K1333), in R14's order.
  - **The answer.** R15's `tensions`, `tensions_highlighted` and `tensions_legs_unread` are its R1 entries, each with the owner's words and the `author` stamp at this act.
  - **Never refused because it exists:** a contradiction, a capture that is not co-attested, off-the-record material, or an open flag.

### Satisfies

- DEC-101 (1)(2) and `BIO_Publication_v0_1.md` §5A (R14, R38, R39); DEC-103 and `BIO_Declared_Bias_v0_1.md`, "RULED 2026-10-01 by Bob (DEC-103)" (R14, R40); K1019.
- DEC-112 response 4 (3)–(5), as restored by DEC-119; `BIO_Publication_v0_1.md` §5C ("Everything a conclusion rests on must be presentable"; "Off-the-record sources", restored 2026-10-02) (R14, R34, R55; `case-disclosures` R4–R11; K1275).
- DEC-96 item 4 (R53, R55; `case-disclosures` R12–R14; N522, K1273).
- `docs/architecture/BIO_Publication_v0_1.md` §3 rules 4, 12, 13, 15, 16, 18 (preparing the case, its statement, its citations), §6A (the acknowledgements beside the review copy).
- `docs/architecture/BIO_Declared_Bias_v0_1.md` (the manifest travels with publication; the acknowledgement authored at export).
- `docs/development/INVESTIGATIVE-SESSION.md` §7.1 items 4, 7, 9 (the project's conclusion a case records).
- DEC-20, DEC-31, DEC-44, DEC-72; D-442, REC-96, REC-188, REC-212, REC-217, REC-219.
- N364 (R14's blocks, R32's step, R34; `case-disclosures` R2–R4, R16): DEC-80 item 3 (the ceremony, REC-15); DEC-81 items 1 and 3 (each document's grade and co-attestation, the self-attested acknowledgement); DEC-78 item 5 (a source stated only as consented or already public); Bob's rulings K509 (3), (4).
- N345 (R14's `/5`, R32, R33; `case-disclosures` R1): DEC-76 item 4; DEC-84 items 11–13; `BIO_Publication_v0_1.md` §3 rule 16 (what the case states about itself); DEC-85 (the highlight, and the ceremony told before the act); `CONTRADICTION-PRESENT-RESOLVE-DESIGN.md` §10.

### Suggestions

- **Factory.** `caseAuthoringOf(ctx)` answers the one instance per Durable Object storage (K61); the op handlers move here (K3). The control plane keeps admission, the stamps and `DO_PATH`'s alias of `op=publish`.
- **Shared helpers are copied** (K57): the module-level `refusal()` (store 601–605), `#fmSafe` (until N424: `case-grammar`'s, Uses), and `SELECTION_ID_CHUNK` (this module keeps its own chunk constant, equal to `retrieval`'s).
- **Direct SQL on others' tables** (`register`, `readings`, `content`, `captured_locators`, `inquiry_basis`, `observation_log`, `case_drafts`, and `publication`'s tables) becomes the owner's service or a stated read contract (K57); every write to a case document goes through `publication` R21.
- **Where `review` sits.** Layer 8, directly after this module (K102); R18 and R20's one list are what `review` reads.
- **Tests.** Each check gets a negative control; R18 an arm proving a rolled-back run leaves no row; R23 the rule-12 arm (project B's publish leaves A's pin and raises no flag); R27 identical-bytes arms.
- **N345 tests.** An undisclosed tension is refused, and a disclosed one publishes: disclose, never block. DEC-85: a tension with a hidden side is named in C-120.1 by its finding only; once disclosed it publishes highlighted, and the document's bytes hold no id, text, kind, source, project or member of that side, nor its explanation. DEC-85: R32 answers the same candidates `case-disclosures` R1 then requires (through R55), with the highlight sentence for the hidden one, and writes nothing; its refusals get negative controls. DEC-85: a publisher whose project was revealed to the hidden party (`contradiction` R52) still publishes the side as not shown (R33). An `irreconcilable` conclusion must be disclosed. A resolved candidate listed gets C-120.2. R18's rollback arm is kept. R22 and R25 are unchanged: the acknowledgement is the `author` stamp, and the section is read from the record.
- **T22 (K1019).** R38–R40's codes (`NO_WHAT_CHANGED`, `BAD_WHAT_CHANGED`, `NO_SUCH_WHAT_CHANGED_DRAFT`) take rows in this module's table (rule 17 moves `CATALOG_VERSION`; accepted red 3). Their names and the 8,000-character bound are BOB's. `whatchangedpropose` and `whatchangeddrafts` take op-declarations specs and affordances entries in L11 (accepted red 5). `review` runs `publishCase` (its R18): its tests pass `whatChanged` for an edition above 1. R34's pre-flight needs no text change: it runs `publishCase`, so `NO_WHAT_CHANGED` comes `first`. The pre-signing preview screen is the UX stream's (H9b).
- **The ceremony (N364).** `case-disclosures` R1 (asked by R55) and R32 sit in DEC-80's step three, "what you are leaving out": R55's tensions step is its `op=publish` half, and R32 the read its screen shows, carried in R34's `steps`. The screens are the interface's; R34 answers what each shows.
- **DEC-112 and DEC-119 tests (K1275).**
  - A load-bearing document from a knocker with no publishable name publishes. It travels whole, its source shows "Withheld" with its reason, and it carries the member, project and group attestation rows.
  - The same case with its attesting member at `group` and no corroborating leg is refused at signing (`ratification` R35), and with an independent leg it signs.
  - A named member's self-attested capture still publishes with its reason (`case-disclosures` R11's negative control).
  - Material not held whole under a load-bearing member is refused, and under a supporting member is listed `included: false`.
  - The `method:` block carries both versions.
- **P6 (N529).** Split at the disclosures seam after T28 (4,010 lines): `case-disclosures` holds R31, R35–R37, R43–R52, R54 and R12 as its R1–R16. The renderers move there and are imported here, never copied (K1333). The end-to-end arms of `tensions`, `carries`, `rests`, `imported` and `preflight` stay here, proving R55 and R14. The fixture builds `caseDisclosuresOf` first. Until `plane` re-points, a one-line `get attestation()` passes through to `case-disclosures`.

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for rulings)

1. `searchedSection` and `SEARCHED_LEVEL_OUTCOMES` (airun.mjs 1405–1638) move into this module's paths (K82 (5), K94); nothing in `ai-runs` calls them, so its next job deletes them from `airun.mjs` and keeps no copy (a job writes only its own paths). The `SEARCHED_SUBJECT_SOURCES` re-export there points at `ratification` until then.
2. `SEARCHED_SUBJECT_MAX`, `COMPLETENESS_MAX` and `MEMBER_ROLES` are this module's.
3. C-44.1, C-44.3–C-44.5 are this module's; C-44.2 is `publication`'s (its raiser, `#resolveOneCase`, is there).
4. `statement_acknowledgements` is this module's table; every other table it writes is `publication`'s, through its R21.
5. `from`: `legacy-store`, `legacy-checks` (nothing moves from `index.mjs`: `op=publish` and `op=statementack` have only routing and stamps there). Uses as above; not `promotion`, `connections` or `retrieval`. (`promotion` reversed at T28: K1268, BOB's decision 10; dropped again at N529, its use moving with R43 to `case-disclosures`.)
6. N529 (K1333): `case-disclosures` sits directly before this module. R32, R34 and R53 stay here, because they run `#authority`, `#judgeMembers` and `#publishCase`. R12 moves with the C-120 family (D1). The renderers are moved, not copied.

## Old ids (publication's draft → this file)

R1–R21 → R1–R21, unchanged; R52 → R22; R56 → R23; R51 → R24 (copy); R53 → R25 (its authorship half); R54's writer, bar-axis, bias-manifest and citation arms → R26; R55 → R27; R58's `statement_acknowledgements` → R28; R60's share → R29; R61 → R30. Open for Bob 1 → 1.

N529 (K1333): R31, R35, R36, R37, R43–R52, R54 → `case-disclosures` R1–R15; R12 → its R16; R33 copied as its R17; R29's C-120 share → its R22. New: R55.
