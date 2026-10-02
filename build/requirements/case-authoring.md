# case-authoring — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), split from publication's draft (K94); for Bob's approval (a product module, P17). Layer 8, third of `publication`, `ratification`, `case-authoring`. Code today (measured on `tranche/T3` @ `f324df9b`, unchanged at `03e2481`; `build/extraction/case-authoring.md` has the table): `bio-plane/src/store.mjs` 7975–9273 (`publishCase`), 9274–10035 (`CASE_CITATION_WORDS`, `#caseCitations`, `#caseDocumentText`, `#caseConclusionRowLines`, `#searchedForCase`), 11079–11815 (the statement acknowledgements, `STATEMENT_ACK_MAX` … `#statementWriter`), 12183–12197 (`COMPLETENESS_MAX`, `MEMBER_ROLES`), 42195–42199 (`SEARCHED_SUBJECT_MAX`), and the dispatch entries `publishcase`, `statementack`; `bio-plane/src/airun.mjs` 1405–1638 (`searchedSection`, `SEARCHED_LEVEL_OUTCOMES`; K82 (5)); `bio-plane/checks/bio-checks.mjs` 9081–9101 and 9110–9190 (C-44.1, C-44.3–C-44.5), 14237–14344 (C-82.2–C-82.7), row C-32.6 (9247–9254); `schema.mjs` 3576–3598 (`statement_acknowledgements`). `from`: `legacy-store`, `legacy-checks`; `airun.mjs` 1405–1638 moves out of `ai-runs`' file. Not yet met: R12 (REC-15, K102), R21 (its named-draft half); R7 (N322) met by CASE-AUTHORING #3 (K434). Carried: K82 (5) (the acknowledgements, the searched section). Old ids are listed at the end. Uses' `observation-log` line corrected by a worker for BOB #53 (K206's P3, K214): the services are observation-log's `missingCause`, `missingCauseAt` and `firstRowAt`, and the two probes move with this module. N345's contradiction part folded for T15 by a worker for BOB #68, 2026-09-30 (K455, K456, K459). N364 (DEC-80 item 3, DEC-81 items 1 and 3, DEC-78 item 5; `build/plan/draft-N345-dec78-80-81.md` §7, K497, K509) folded by a worker for BOB #71, 2026-09-30 (T16 opening): R34–R37 new, R12, R14, R29 and R32 amended, rows C-120.4–C-120.7; met by CASE-AUTHORING #5 (K557). T19 layer 8's wordings, by a worker for BOB #80 on `tranche/T19`, 2026-10-01, before layer 8 (rule 6 of `build/plan/current.md`): R34's viewer carries the door's `aiCred` stamp (N435, K737; N407's other half, met at the interface `ratification` R18 already states); Uses gains `case-grammar` (N424, BOB's edge). No change of meaning. T22's folds, by a worker for BOB #90 on `tranche/T22`, 2026-10-01, as Bob approved them (K1019): DEC-101's "What changed" statement required for an edition above 1 and the machine draft of it (R38, R39), DEC-103's lens printed into the signed case (R40), R14 widened for both; Uses gain `proposalLabel`, the public-locator test and `case-grammar`'s R8–R9 (no new module); not yet met (T22 layer 8). DEC-88's reason, by a worker for BOB #90 on `tranche/T22`, 2026-10-01 (`build/plan/t22-dec88-audit.md`; K1025): R19, the acknowledger's words (`STATEMENT_ACK_NO_REASON`, C-82.8), with R29's row; not yet met (T22). T23, by a fold worker for BOB #94 at T23's opening, on `fold/T23-b` from `tranche/T23`, 2026-10-02: R41 (`publishCase` writes `working_on` from `network-notices.noticeReferenceOf`; `build/plan/draft-network-notices.md`, DEC-111) added, not yet met (T23 L8); Uses gain `network-notices`.

**Size (P6).** About 3,340 lines move (about 1,610 without comment-only and blank lines): `store.mjs` 2,818 (1,370 code) plus about 42 of dispatch, `airun.mjs` 234 (101), `bio-checks.mjs` 218 (85), `schema.mjs` 23 (13). Under 4,000 of code.

## Public

### Purpose

Before anything is signed, the project's owner prepares a case: which concluded findings it rests on and in what role, what it covers and excludes, who wrote its statement, what was searched and with what outcome, and what bias it acknowledges (Publication §3). This module holds that preparation, `op=publish`: it judges the preparation, authors the case document's text from the record and the owner's words, and stores it unsigned in `publication`. It also holds the statement's acknowledgements, by which members and review recipients say they have read the statement before it is signed.

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
- **R12** A member carrying uncleared hunch debt is refused `UNCLEARED_HUNCH` before anything is written (Publication §3 rule 4), at `op=publish` now; R34 answers it before the first screen. Its row is C-120.7.
- **R13** Publishing writes nothing on any finding (rule 12): each member is pinned at its `bundle_sha` as prepared. A member's own edition is the published edition of that sha when another case carried it across, else the next on its chain; the case edition is the case's highest published edition plus one.
- **R14** The document, format `bio-case-document/5`, is stored unsigned through `publication.storeCaseDocument` (never over a signed one). It states: the case, edition and project; the scope; the roster with roles and pins; per member its own edition, its frozen pair (capture and connection always, testimony when not unrated) with grounds, and the conclusion it rests on (relationship, reading, claim); the completeness block (statement, subject position and justification, exclusions, `author` the publisher, `statement_by` (R21) with where the name came from, `statement_sha`, `acknowledged` and the list, R20); the bias acknowledgement; the bias manifest frozen from `bias.biasManifest` at the project's scope read as the plane (`in_force` true, false or null, with `pins_proposed` count and rows); the lens statements printed whole (R40); the bar, an undeclared axis as null and "no bar set on the <axis> axis"; the attribution statements (`publication.attributionStatements`); the citations (R16); the tensions disclosed (R31) and, in each member's block, its tension sentences; the searched section (R17); the `captures:` block (R35, R36) and the `sources:` block (R37); the draft link when named (R9: draft, who named it, when); the "What changed" block and its section for an edition above 1 (R38); a receipt. Its body prints every authored sentence. (The lens statements and the "What changed" block: DEC-101, DEC-103; K1019)
- **R15** The answer: `{ok, caseId, minted, edition, caseDocument: {case_id, edition, doc_sha, bytes, read}, findings, scope, project, required, roles, bias_acknowledgement, bias_manifest, case_citations, completeness, tensions, tensions_highlighted, tensions_legs_unread, author, at, weight: "single", next}` (the last three by R31); each finding with `bundleSha`, `promoted: false`, `edition`, its per-axis pair, `role`, `required`, and `edition_warranted` or `reevaluation` (raised through `reevaluation` when its edition is new and above 1) where they apply; `target`, `bundleSha`, `state` at the top only for one member. No key composes a case-level strength.
- **R16** Citations (rule 18): every non-severed `cites` edge of the project at the act, each `pinned` (with its capture), `only_capture` (the one held), `undetermined` (several held; never back-filled), `no_capture` or `no_bytes`.
- **R17** The searched section is computed from the observation log at authoring over the members' legs and never recomputed (`searchedSection`, subject source `case_basis` only, at most `SEARCHED_SUBJECT_MAX` subjects); it states what was looked for at each level and with what outcome, and why where undetermined.
- **R18** `publishCase` is synchronous and writes only inside the caller's transaction, so a caller may run it and roll it back (the review copy's missing-list).

#### Statement acknowledgements: acknowledgeStatement({draft?, case?, edition?, secretSha?, bySecret, reason, viewer}) (`op=statementack`)

- **R19** Doors: a recipient through a live review grant (a named draft must be the grant's own); a member, of a draft, or of an unsigned case document it has standing in. Every other caller receives the review copy's dead answer (`publication`'s review provider, its R23), byte-identical. `STATEMENT_ACK_NO_SUBJECT` (C-82.2), then a signed document `STATEMENT_ACK_ALREADY_SIGNED` (C-82.3); a member not a joined participant of the publishing project `STATEMENT_ACK_NOT_A_PARTICIPANT` (C-82.4); no statement C-82.5; the writer undetermined, for a participant, C-82.7; the writer, or on the case door the publisher, `STATEMENT_ACK_BY_ITS_AUTHOR` (C-82.6); then `STATEMENT_ACK_NO_REASON` (C-82.8: the `reason`, the acknowledger's words, absent, not a string, blank or over 2,000 characters), kept with the acknowledgement and shown in R20's list (DEC-88; K1025). A recipient is never the writer.
- **R20** An acknowledgement is keyed by the statement's SHA-256, the project, the case identity it was given at and the acknowledger, and a repeat answers `existed: true`. It is matched by that identity or by the draft named at publication, never by the statement's bytes. On an unsigned document it re-authors only that document's list (`publication.reauthorSection`), so its hash moves. Every list states `acknowledged` (zero included), withholds and counts the publisher's own and the writer's own rows, withholds and counts every participant row when the writer is undetermined, and counts, never names, readings bindable to no case. Nothing about an acknowledgement refuses publication. `statementAcknowledgements(...)` is the one list, read by R14 and by the review copy.
- **R21** `statement_by` is the member whose write made the statement's current bytes: the named draft's stamp; else a draft of the project holding that sentence; else the publisher, named as both, with the sentence saying so. Drafts disagreeing, or a draft from before the stamp, make it null, stated undetermined, never filled from the publisher.

#### Disclosing a contradiction (N345; DEC-76 item 4, DEC-84 items 11–13)

- **R31**
  - **The input.** `publishCase` takes `tensionsDisclosed: [{candidate, words?}]`.
  - **The read.** After R12 and before anything is written, it reads `contradiction.unresolvedRecordOn({finding, sha, viewer})` for each member at the bytes this act pins (R13).
  - **Refusals.**
    - A read that fails, or is `truncated`, is `TENSIONS_UNDETERMINED` (C-120.3), because what cannot be read cannot be disclosed (R26).
    - Any candidate it answers that the list does not name is `TENSION_NOT_DISCLOSED` (C-120.1), naming each one. One with a side the owner may not see is named by its candidate and its finding, with the words "in conflict with a record not shown", and nothing of that side (R33).
    - A listed candidate the read does not answer is `DISCLOSURE_NOT_STANDING` (C-120.2).

    A document leg with no content row has no referent to read, so it is not a failed read: the section states each member's such legs as unread (R26).

    The case is never refused because a contradiction exists (DEC-76 item 4).
  - **The section.** Otherwise the document's tension section lists each one: the finding, both sides verbatim with source, date and doctype, its state, the explanation, the owner's words marked as the owner's, `acknowledged_by` (the `author` stamp) and the instant, and the sentence that the disclosure reaches one level (DEC-84 item 12).
  - **Each member's block.** It gains one sentence per tension on it, from fixed templates:
    - "In tension, not yet resolved: …";
    - "Explained, not yet shown: …";
    - "Held irreconcilable by the group: …";
    - "Rests on a side in conflict with a record not shown: …".

    It names no member it may not name. It composes no strength (R24).
  - **The highlight** (DEC-85). A candidate `unresolvedRecordOn` answers `unseen_other_side: true` is **highlighted**. Its entry carries `unseen_other_side: true`, the seen side, its state, `acknowledged_by` and the instant, the owner's words, and the fixed sentence "This finding rests on a side in conflict with a record not shown here. The record and who holds it are not named." Its member's block carries the last template above, and not the state's own sentence. Nothing of the other side is written (R33).

#### The ceremony's read: tensionsToDisclose({project, targets|target, viewer, author}) (`op=publishtensions`)

- **R32** (DEC-85: the ceremony tells the publisher before the act) The read the ceremony shows before `op=publish`.
  - **Refusals.** R2's authority refusals and R4's per-member refusals, each in its order. Then R31's `TENSIONS_UNDETERMINED` (C-120.3), when a read fails or is truncated.
  - **The answer.** Each candidate R31 would require the act to disclose, read exactly as R31 reads it (the same `unresolvedRecordOn`, the same viewer, each member at its current bytes). A highlighted one (R31) carries the sentence the ceremony shows before the act: "A finding in this case rests on something in conflict with a record you cannot see. You can still publish. The published case will highlight that this finding rests on a side in conflict with a record not shown, and will not name that record or who holds it." The answer counts `highlighted`, and states that publishing discloses and is never blocked by a conflict (DEC-76 item 4).
  - It writes nothing and never throws. It is step three's read, carried in R34's answer.

#### The ceremony's pre-flight: publishPreflight({…publishCase's inputs, viewer, author}) (`op=publishpreflight`; N364, DEC-80 item 3, REC-15)

- **R34** It runs `publishCase` inside a transaction it rolls back (R18), then `ratification.caseRatifyPreflight` over the text that would be stored, with `author` as signer and, as its `viewer`, the stamped `viewer`, or `{stamp: viewer, aiCred}` when the control plane stamps the caller's minted agent credential (`aiCred`, its token id and principal; N407), so `ratification` R18's machine fences hold an agent whatever its viewer stamp. It answers `{ready, first, blockers[], steps}`. `first` is exactly the refusal `op=publish` would give (DEC-8). `blockers` lists every other refusal it can reach independently: R6, R12, R35 and R31 (as R32 reads it), and `ratification` R18's list. `steps` gives the five steps' content: what becomes permanent; what this rests on (roles, pairs, bar); what you are leaving out (exclusions, searched section, bias, R32's tensions, R35's self-attested documents, R37's source statements); the edition this creates; and sign. It writes nothing.

#### Each document's grade and co-attestation, and its source (N364; DEC-81 items 1 and 3, DEC-78 item 5)

- **R35** For each capture a load-bearing member rests on, the document states its grade (`provenance.captureGrade`) and its co-attestation. The capture is `co_attested` only when it holds both a timestamp and a co-archive (`provenance.attestationsOf`, then `capture.lateAttestationsOf`, a late one stated as late). A load-bearing Grade B capture that is not co-attested needs an entry in `publishCase`'s `selfAttested: [{capture, reason}]`, else `CO_ATTESTATION_UNACKNOWLEDGED` (C-120.4), naming each. An empty reason is `SELF_ATTESTED_NO_REASON` (C-120.5). An entry for a co-attested capture, or for one not in the case, is `SELF_ATTESTATION_NOT_STANDING` (C-120.6). The case is never refused because a capture is not co-attested (DEC-81 item 3(d)).
- **R36** An acknowledged capture is marked `self_attested_only: true` with `{reason, acknowledged_by (the author stamp), at}` and `capture.captureAccountsOf`'s signed accounts. Its block carries the fixed sentence from DEC-81 item 3: "Without co-attestation an outsider can verify the copy has not changed since capture and can follow the reasoning, but cannot independently verify that the source served those bytes, or when."
- **R37** For each capture whose `source` is a knocker or a hand-carried source, the `sources:` block states only what `sources.publishableAt({audience: "public"})` answers, with its basis. With nothing publishable it states "an unnamed source" and the receipt's digest and time. No authored field adds to it.

## Private

### Uses

- `record-grammar`: `parseFrontmatter`, `normalizeType`, `isMachineIdentity`, `canonicalJson` (the rows are this module's own, R29); `proposalLabel` (subject `edition_statement`, its R43; R39) and the public-locator test (R40) (K1019).
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
- `contradiction` (N345): `unresolvedRecordOn` (its R29), for R31 and R32.
- N364: `sources`: `publishableAt` (its R8), for R37. `capture`: `lateAttestationsOf` (its R68), `captureAccountsOf` (its R69), for R35 and R36. `provenance`: `attestationsOf` (its R49), `captureGrade` (its R24–R27, R51), for R35. `ratification`: `caseRatifyPreflight` (its R18), for R34.
- `network-notices`: `noticeReferenceOf` (its R19; R41).

### Invariants

- **R22** Everything a case document asserts arrived as an authored argument, was read from the record at the act (pins, pairs, conclusions, manifest, citations, searched section, acknowledgements), or is a stated fact; nothing is composed, summarised or inferred.
- **R23** Preparing a case moves no finding's bytes or pin, so no project's act moves another project's case (rule 12, INVESTIGATIVE-SESSION §7).
- **R24** No answer or document this module writes composes a case-level strength: every pair is per member and per axis (DEC-44, DEC-21).
- **R25** Every authorship field (`author`, an acknowledger, the draft link's namer) is a stamp; `statement_by` is read from the record (R21), never a body's.
- **R26** Undetermined is stated and never filled: a statement writer, an undeclared bar axis, a bias manifest not established, a citation's version.
- **R27** Working material (an unsigned document, a draft, a hidden project) answers an outsider exactly as something that does not exist; R19's dead answer is byte-identical for every door refused.
- **R28** `statement_acknowledgements` and `what_changed_drafts` (R39) are each declared whole to `record-core`'s purge (K23, K1147).
- **R29** Each check moves here as an invariant with its test (K6): C-44.1, C-44.3–C-44.5, C-82.2–C-82.8 (C-82.8 new, below; DEC-88, K1025), C-32.6 and C-33.14 (R3's `NO_STATEMENT`); and C-120.1–C-120.3 (N345) and C-120.4–C-120.7 (N364), a family, "a case's disclosures and its pre-flight", held in this module's own table (K343's pattern), with the translations below. A change to any moves `CATALOG_VERSION` (rule 17).
- **R30** No place is named in this module's behaviour or outward text.
- **R33** (DEC-85) No case document this module writes, and no answer it gives, names the project, members, content, kind or source of a side the publisher could not see at the act. A reveal (`contradiction` R52) never widens what a case names: sight at the act, by `membership` R43, governs.

Rows C-120.1–C-120.3 (R29; N345), with their translations; promotion stamps them:

| row | code | translation |
|---|---|---|
| C-120.1 | `TENSION_NOT_DISCLOSED` | "A finding in this case rests on something the record holds in unresolved conflict, and a case may be published with it only if the conflict is disclosed. Each one is named. One in conflict with a record you cannot see is named by its finding, and the published case will highlight it without naming that record. Disclose it, or resolve it first. Nothing was published." |
| C-120.2 | `DISCLOSURE_NOT_STANDING` | "One of the conflicts disclosed is not an unresolved conflict on this case's findings: it may have been resolved since. Read the list again. Nothing was published." |
| C-120.3 | `TENSIONS_UNDETERMINED` | "The record could not be read completely for conflicts on this case's findings, so what must be disclosed is not known. Try again. Nothing was published." |

Rows C-120.4–C-120.7 (R29; N364), with their translations:

| row | code | translation |
|---|---|---|
| C-120.4 | `CO_ATTESTATION_UNACKNOWLEDGED` | "A load-bearing document has no trusted timestamp and co-archive. Retry them, or acknowledge publishing it as self-attested only, with a reason. Nothing was written." |
| C-120.5 | `SELF_ATTESTED_NO_REASON` | "Publishing a document as self-attested only says why. Give the reason. Nothing was written." |
| C-120.6 | `SELF_ATTESTATION_NOT_STANDING` | "A document acknowledged as self-attested only is either co-attested already or not one this case rests on, so it needs no acknowledgement. Remove it from the list. Nothing was written." |
| C-120.7 | `UNCLEARED_HUNCH` | "A finding in this case rests on a hunch. A hunch is temporary declared bias, and it is the one bias that must be cleared before publication: the case must still hold with the hunch removed. Give each leg a grade the record earns, or take the hunch out of the basis, and publish again. Nothing was written." |

Row C-82.8 (R19, R29; DEC-88, K1025), with its translation; `awaiting stamp`:

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

### Satisfies

- DEC-101 (1)(2) and `BIO_Publication_v0_1.md` §5A (R14, R38, R39); DEC-103 and `BIO_Declared_Bias_v0_1.md`, "RULED 2026-10-01 by Bob (DEC-103)" (R14, R40); K1019.
- `docs/architecture/BIO_Publication_v0_1.md` §3 rules 4, 12, 13, 15, 16, 18 (preparing the case, its statement, its citations), §6A (the acknowledgements beside the review copy).
- `docs/architecture/BIO_Declared_Bias_v0_1.md` (the manifest travels with publication; the acknowledgement authored at export).
- `docs/development/INVESTIGATIVE-SESSION.md` §7.1 items 4, 7, 9 (the project's conclusion a case records).
- DEC-20, DEC-31, DEC-44, DEC-72; D-442, REC-96, REC-188, REC-212, REC-217, REC-219.
- N364 (R12's pre-flight, R14's blocks, R32's step, R34–R37): DEC-80 item 3 (the ceremony, REC-15); DEC-81 items 1 and 3 (each document's grade and co-attestation, the self-attested acknowledgement); DEC-78 item 5 (a source stated only as consented or already public); Bob's rulings K509 (3), (4).
- N345 (R14's `/5`, R31–R33): DEC-76 item 4; DEC-84 items 11–13; `BIO_Publication_v0_1.md` §3 rule 16 (what the case states about itself); DEC-85 (the highlight, and the ceremony told before the act); `CONTRADICTION-PRESENT-RESOLVE-DESIGN.md` §10.

### Suggestions

- **Factory.** `caseAuthoringOf(ctx)` answers the one instance per Durable Object storage (K61); the op handlers move here (K3). The control plane keeps admission, the stamps and `DO_PATH`'s alias of `op=publish`.
- **Shared helpers are copied** (K57): the module-level `refusal()` (store 601–605), `#fmSafe` (until N424: `case-grammar`'s, Uses), and `SELECTION_ID_CHUNK` (this module keeps its own chunk constant, equal to `retrieval`'s).
- **Direct SQL on others' tables** (`register`, `readings`, `content`, `captured_locators`, `inquiry_basis`, `observation_log`, `case_drafts`, and `publication`'s tables) becomes the owner's service or a stated read contract (K57); every write to a case document goes through `publication` R21.
- **Where `review` sits.** Layer 8, directly after this module (K102); R18 and R20's one list are what `review` reads.
- **Tests.** Each check gets a negative control; R18 an arm proving a rolled-back run leaves no row; R23 the rule-12 arm (project B's publish leaves A's pin and raises no flag); R27 identical-bytes arms.
- **N345 tests.** An undisclosed tension is refused, and a disclosed one publishes: disclose, never block. DEC-85: a tension with a hidden side is named in C-120.1 by its finding only; once disclosed it publishes highlighted, and the document's bytes hold no id, text, kind, source, project or member of that side, nor its explanation. DEC-85: R32 answers the same candidates R31 then requires, with the highlight sentence for the hidden one, and writes nothing; its refusals get negative controls. DEC-85: a publisher whose project was revealed to the hidden party (`contradiction` R52) still publishes the side as not shown (R33). An `irreconcilable` conclusion must be disclosed. A resolved candidate listed gets C-120.2. R18's rollback arm is kept. R22 and R25 are unchanged: the acknowledgement is the `author` stamp, and the section is read from the record.
- **T22 (K1019).** R38–R40's codes (`NO_WHAT_CHANGED`, `BAD_WHAT_CHANGED`, `NO_SUCH_WHAT_CHANGED_DRAFT`) take rows in this module's table (rule 17 moves `CATALOG_VERSION`; accepted red 3). Their names and the 8,000-character bound are BOB's. `whatchangedpropose` and `whatchangeddrafts` take op-declarations specs and affordances entries in L11 (accepted red 5). `review` runs `publishCase` (its R18): its tests pass `whatChanged` for an edition above 1. R34's pre-flight needs no text change: it runs `publishCase`, so `NO_WHAT_CHANGED` comes `first`. The pre-signing preview screen is the UX stream's (H9b).
- **The ceremony (N364).** R31 and R32 sit in DEC-80's step three, "what you are leaving out": R31 is its `op=publish` half, and R32 the read its screen shows, carried in R34's `steps`. The screens are the interface's; R34 answers what each shows.

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for rulings)

1. `searchedSection` and `SEARCHED_LEVEL_OUTCOMES` (airun.mjs 1405–1638) move into this module's paths (K82 (5), K94); nothing in `ai-runs` calls them, so its next job deletes them from `airun.mjs` and keeps no copy (a job writes only its own paths). The `SEARCHED_SUBJECT_SOURCES` re-export there points at `ratification` until then.
2. `SEARCHED_SUBJECT_MAX`, `COMPLETENESS_MAX` and `MEMBER_ROLES` are this module's.
3. C-44.1, C-44.3–C-44.5 are this module's; C-44.2 is `publication`'s (its raiser, `#resolveOneCase`, is there).
4. `statement_acknowledgements` is this module's table; every other table it writes is `publication`'s, through its R21.
5. `from`: `legacy-store`, `legacy-checks` (nothing moves from `index.mjs`: `op=publish` and `op=statementack` have only routing and stamps there). Uses as above; not `promotion`, `connections` or `retrieval`.

## Old ids (publication's draft → this file)

R1–R21 → R1–R21, unchanged; R52 → R22; R56 → R23; R51 → R24 (copy); R53 → R25 (its authorship half); R54's writer, bar-axis, bias-manifest and citation arms → R26; R55 → R27; R58's `statement_acknowledgements` → R28; R60's share → R29; R61 → R30. Open for Bob 1 → 1.
