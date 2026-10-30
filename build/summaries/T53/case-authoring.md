# Task summary · T53 · case-authoring

This summary stands for the case-authoring job's reading set (SESSIONS §6.3): `build/requirements/case-authoring.md` whole; the Public Purpose of the 48 used modules (files under Used services), with service blocks record-core `mintOpaqueId`, `mintExhausted`, `declarePurge`, `transact`, `stampInstant`; membership `existenceAct`, `noSuchProject`; bias `biasManifest`; strength `strengthOf`; the task in `build/plan/current.md` (Layer 8) and `build/plan/T53-R1/case-authoring.md` (no trims file). The sources stay binding; read any cited section in full when the work touches it, and the requirements file for any compressed requirement the work touches. For T53's case-authoring job only.

## case-authoring (own requirements)

Status: in force (K102, K94, K1019). Split for size to `case-disclosures` (N529), `case-account` (N839), `case-inputs` (N908; this module holds no table). R88–R91 new at T53, not yet met. Size (P6) about 3,020 lines, under 4,000.

Purpose: before signing, the project's owner prepares a case: which concluded findings it rests on and in what role, what it covers and excludes, who wrote its statement, what was searched, what bias it acknowledges (Publication §3). This module holds that preparation (`op=publish`): judges it, authors the document from the record and the owner's words, stores it unsigned in `publication`. Inputs are `case-inputs`' (R14, R34, R38, R74), disclosures `case-disclosures`' (R55), the account and reviewers' comments `case-account`'s (R69). A preparation is an unsigned case document; a statement the completeness block's sentence. Refusals name `reason`; a catalogue row adds `check`, `code`, `translation`.

`publishCase({project, targets|target, roles, scope, statement, excluded, subjectPosition, subjectJustification, biasAcknowledgement, whatChanged?, caseId?, newCase?, draft?, viewer, author})` (`op=publish`):

- R1 · Empty or machine `author`: `MACHINE_CANNOT_PUBLISH` (C-32.6) first.
- R2 · Authority in order: `NO_PUBLISHING_PROJECT`; existence-only sight C-70.1; unseen or none `NO_SUCH_PROJECT`, identically; `NOT_A_PROJECT`; `NOT_THE_PROJECT_OWNER` (no administrator arm).
- R3 · Authored fields in order: `PUBLISH_NO_FINDING` (R80), `DUPLICATE_MEMBER`, `NO_STATEMENT`, `NO_SUBJECT_POSITION`, `NO_SUBJECT_JUSTIFICATION`, `NO_EXCLUSION_FIELD` (empty list legal), `NO_SCOPE`, `NO_BIAS_ACKNOWLEDGEMENT`, `BAD_EXCLUSION` (`ord`), `BAD_COMPLETENESS` (over 2,000 or a quote, backslash, line break).
- R4 · Per member: `NO_SUCH_BUNDLE` (absent, invisible alike), `NOT_AN_INQUIRY`, `NO_DOCUMENT`, `NOT_CONCLUDED` (the publishing project's relationship, `ratification` R1; names `relationship`, `why`, the projects that concluded).
- R5 · `roles` member to `load_bearing`/`supporting`, no default: `BAD_ROLES`, `NO_MEMBER_ROLE`, `BAD_MEMBER_ROLE`, `NO_LOAD_BEARING_MEMBER`.
- R6 · Each load-bearing member's pair (`strengthOf`) must reach the project's bar (`projectBar`, read once) on each declared axis, else `BELOW_PROJECT_STRENGTH` (member, axis, required, reached, state); unrated or undetermined does not reach.
- R7 · `caseId` with `newCase`, or neither when the members serve more than one published case: `CASE_IDENTITY_AMBIGUOUS` (C-44.1). A named unpublished case `NO_SUCH_CASE`. Otherwise the named case, else the one case the members serve, else the case this act's own unsigned preparation names, else a minted opaque `CASE` id (`MINT_EXHAUSTED` via `record-core.mintExhausted`). `newCase` skips derivation. `CASE_BELONGS_TO_ANOTHER_PROJECT`.
- R8 · `ALREADY_A_CASE_MEMBER` when an edition of this case, or any unsigned preparation of another case or of another edition of this one, pins a member's current bytes (`case-tensions.caseRelation`, its R1) and already records the conclusion this act would record (`ratification.editionsRecordingConclusion`). A finding may serve any number of cases. (K2540) An unsigned preparation of this same case edition does not refuse: the new preparation replaces it (R14; `publication` R21), which is how later approvals (R68) and a first edition's account from a draft (`case-account` R4) are carried.
- R9 · `draft=` binds the draft's readings, refused before any mint: not a readable draft of this project `PUBLISH_DRAFT_NOT_FOUND` (C-44.3), another case identity (C-44.4), named for another case edition (C-44.5); the door is `publication`'s review provider (its R23).
- R10 · Freshness (C-21.1): the statement, subject justification, exclusion list or bias acknowledgement byte-identical to the previous ratified edition of this case is `COMPLETENESS_CARRIED_FORWARD` (the bias acknowledgement `BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD`), naming the field, compared through `case-catalogue.completenessFields` (read through `ratification`'s re-export). The scope is not compared.
- R11 · An uncomputable searched section is `CASE_SEARCHED_UNCOMPUTABLE`.
- R13 · Writes nothing on any finding (rule 12); the case edition is the highest published plus one.
- R14 · The document, format `bio-case-document/7` (`case-grammar` R1), is stored unsigned through `publication.storeCaseDocument` (never over a signed one), stating: case, edition, project; scope; roster with roles and pins; per member its edition, frozen pair with grounds, and the conclusion it rests on; the completeness block (statement, subject position and justification, exclusions, `author`, `statement_by` (`case-inputs` R3) with its source, `statement_sha`, `acknowledged` and the list, `case-inputs` R2); bias acknowledgement; the bias manifest frozen from `bias.biasManifest` (`in_force` true/false/null, `pins_proposed`); lens statements (R40); the bar (an undeclared axis null, "no bar set on the <axis> axis"); attribution statements; citations (R16); tensions (`case-disclosures` R1) and per-member tension sentences; searched section (R17); `captures:`, `sources:`, `method:`, `materials:`, `material_attestations:` (a marked photo as `obscured: {copy, label}`), `accepted_work:`, `accepted_work_flags:`, `grading_facts:`, `passages:` blocks (`case-disclosures` R2–R7, R13–R15); the draft link (R9); "What changed" for edition above 1 (R38); a receipt. The body prints every authored sentence. Acknowledgement list and writer asked once per act from `case-inputs`, renderers imported (K1333). (G47; K4687) Over `publication`'s `CASE_DOCUMENT_BYTES_MAX`: `CASE_DOCUMENT_TOO_LARGE` (C-136.9) with `size`, `bound`, `materials`, `members`, before any side effect; a store refusal is the act's. Format via `case-grammar`'s `caseDocumentFormatFor` (`/9` when an attestation row carries a `sha`, else `/8`).
- R15 · Answer `{ok, caseId, minted, edition, caseDocument: {case_id, edition, doc_sha, bytes, read}, findings, …, case_citations, completeness, tensions, author, at, weight: "single", next}` (full key list in the source); per finding its pin, edition, pair and role. No case-level strength.
- R16 · Citations: every non-severed `cites` edge (`pinned`, `only_capture`, `undetermined`, `no_capture`, `no_bytes`; to a finding only when a member), then R86's rows, with `bundle_sha`.
- R17 · The searched section from the observation log at authoring, never recomputed (`searchedSection`, `case_basis`, at most `SEARCHED_SUBJECT_MAX`), per level with outcome and why undetermined.
- R18 · `publishCase` is synchronous and writes only inside the caller's transaction, so a caller may run and roll it back.

The ceremony's reads:

- R32 · (DEC-85) `tensionsToDisclose` (`op=publishtensions`): R2, R4, then `TENSIONS_UNDETERMINED` (C-120.3); each candidate `case-disclosures` R1 would require, a highlighted one with its fixed sentence (publishing allowed, the unseen record never named); never blocked. Writes nothing.
- R34 · `publishPreflight({…publishCase's inputs, viewer, author})` (`op=publishpreflight`; N364, DEC-80 item 3, REC-15). It runs `publishCase` inside a transaction it rolls back (R18), then `ratification.caseRatifyPreflight` over the text that would be stored, with `author` as signer and, as its `viewer`, the stamped `viewer`, or `{stamp: viewer, aiCred}` when the control plane stamps the caller's minted agent credential (`aiCred`, its token id and principal; N407), so `ratification` R18's machine fences hold an agent whatever its viewer stamp. It answers `{ready, first, blockers[], steps}`. `first` is exactly the refusal `op=publish` would give (DEC-8). `blockers` lists every other refusal it can reach independently: R6, and `case-disclosures` R16, R2, R6 and R1 (as R32 reads it), its R25 and R27 (each person without a standing basis and each signer without an attestation, named to the publisher only), R56's undisclosed calculations, and `ratification` R18's list (which carries C-92.10 and C-58.5 for off-the-record material, `ratification` R2, R35). `steps` gives the steps' content: what becomes permanent, which states that the case republishes in full every document it includes, and that judging whether they may be republished, copyright included, is the group's (DEC-112 (4); the words are the UX stream's, and until it gives them, that plain sentence); what this rests on (roles, pairs, bar); what you are leaving out (exclusions, searched section, bias, R32's tensions, `case-disclosures` R2's self-attested documents, its R4's source statements), which also lists each source shown as "Withheld" (`case-disclosures` R4); (T37; DEC-180 (3); T38: DEC-183 (1)) `photos`, `case-disclosures` R29's answer over the materials `publishCase` judged (the ceremony's Photos step), with `unchecked` counted. Signing is refused while any photo the case relies on is unchecked: `case-disclosures` R6's `PHOTO_UNCHECKED` names each such photo (words `photo.refused.unchecked`) and is `first` when `op=publish` would refuse with it, else among `blockers`. R6's `PHOTO_NOT_COVERABLE` (words `photo.refused.format`) and `PHOTO_MARKS_UNDETERMINED` are among `blockers` as well, with R6's other refusals; the edition this creates; and sign. It writes nothing. (T45; N880; Actions D13; v0.2 rule 8) `steps` gains `open_requests`, in the sign step and nowhere else in the answer: one fact line per row `case-inputs` R8's source answers, in its order, each naming the row's four facts (whom, when asked, when the window closes, how many of the claims laid out the reply answers, or that no reply is recorded), listed once and never repeated across steps, never written into the document. Its words are the UX stream's (keys `signing.openrequest.line`, `signing.openrequest.noreply`); until given, one plain sentence per row. When `case-inputs` R8 answers `undetermined`, the step says so in one sentence (key `signing.openrequest.unread`). A row is never a blocker and never `first`, never changes `ready`, and no refusal of `op=publish`, of this pre-flight or of `ratification`'s ceremony is answered for it; no act asks a reason for signing while a window is open (a declaration, DEC-13). Control: with an open request the answer is byte-equal, but for `open_requests`, to the same act with no source registered (`ready` and `first` unchanged). (T47; N908) The rows are read through `case-inputs.openRequestsOn` (its R8) and each line is `case-inputs.openRequestLine`'s (its R10, R17), the unread sentence its `OPEN_REQUESTS_UNREAD_SENTENCE` (its R17); this module spells none of them. "What becomes permanent" lists R74's outcomes. (Fix round 8, G112; fix round 9, G112b, K4872) A call that sends no `tieAttested`, no `biasAcknowledgement` (after its draft), no `selfAttested` or no `tensionsDisclosed`, for a case whose unsigned preparation holds this author's `attestation` row (`member_ties:`), is pre-flighted with the preparation's own: her ties' confirmation, her bias acknowledgement, the reasons she gave for self-attested captures and the words she gave for the tensions she disclosed, in its rolled-back run only; `first`, `blockers` and the sign step's `publish_at` are those of that call. A field the call sends is used as sent, and none is ever handed to `op=publish` (R76). Test: `r8-prepared-preflight.test.mjs`. Controls: an unprepared draft, a published-only case and a preparation without her row still answer `TIE_ATTESTATION_MISSING`.
- R77 · (T51; DEC-340) The sign step carries `minutes` (`case-inputs.minutesComparisonsOn`, each row's `minutesLine`), or `{undetermined: true}` when unread; never changes `ready`, `first`, `blockers`.
- R78 · (T51; amends R9) A readable project draft named by `draft` supplies each of `DRAFT_FIELDS` the call does not send; nothing written to it.
- R79 · (T51) `tensionsDisclosed` and `selfAttested` judged alike in `publish` and `publishpreflight`; no `reason` is `SELF_ATTESTED_NO_REASON`.
- R80 · (T51; DEC-384) No finding named is `PUBLISH_NO_FINDING` (not `NO_TARGET`, the action request's), its words `refusal.PUBLISH_NO_FINDING`; `ceremony.gate.notargets` reworded alike. Test: its word row exists (`hasWord`).
- R81 · (T51) `DECLARED_OPS` for `publish`, `publishpreflight`, `publishtensions`, copied from the op rows. Test: `declaredOpHolds`.
- R82 · Step three's `not_co_attested` `{capture, by, findings}` and `self_attested`, listed whenever captures are known.
- R83 · (fix round 3, C48, C50; K4356; amends R15, R34; `review` R19) **The pre-flight says what a draft has prepared and published.** R34's answer also carries `editions`: `{prepared, published}` for the case identity the call stands at (R7, R9). `prepared` is the edition number of the unsigned preparation held for it (R8, R14), else `null`; `published` is `{edition, address}`, the latest published edition of the case and its public address, else `null`. What is prepared is stated as the record holds it, so a reloaded page states it again, and a published edition is never stated as prepared. A second preparation of the same draft with no edition published between answers the same case identity and the same edition and mints no case id (`minted: false`; R7, R8, R13). Reads only: the pre-flight still rolls back (R18). Test: after `publishCase` prepares edition 1 of a draft, the pre-flight states `prepared: 1` on every later call; after edition 1 is published it states `published: {edition: 1, address}` and `prepared: null`; a second preparation of one draft answers the same edition with `minted: false`. Control: a draft never prepared states `{prepared: null, published: null}`. (K4363) The same answer is exported as one read, `draftEditions({caseId, draft}) → {prepared, published}`, which the pre-flight uses and `review` R19 calls for each draft row; `address` is the published case's public address as `public-read` serves it (its route), never composed a second way. (fix round 4, C48; K4442) `draftEditions` is also asked with the call's draft, so a draft that asks for a new case states the edition its own preparation made. (fix round 4, C48; K4467) `editions` also states `case`: the case id the unsigned preparation or the latest published edition belongs to, else `null`, so a reloaded page reads the prepared document (`casedocument`) by it, including for a draft that asks for a new case.
- R84 · A multipart document counts as one capture (`capturesOf`).
- R85 · On `DOCUMENT_COPY_PENDING`, `op=publish` awaits `case-carriage.copyNow` and retries once.
- R86 · One citation row per document the members' resting captures reach, classified as R16.
- R87 · Prepare writes `case-grammar` R34's basis version per member from `basis-versions`' current version.

T53 additions:

- R88 · (T53; DEC-461; amends case-authoring R34) *(not yet met: T53)* **The signing step lists every passage still ungraded.** (decided, K5548, L23 = A) Before signing, the member is shown the list of every passage of the case, as it would be signed, that the team has not graded: for every member of each finding the publisher can see (load-bearing and supporting), in roster then passage order, the finding, the passage's number, its document title (or null, never an id as its only name, as `screens-inquiry` R116) and its role, with the count. A hunch leg is not listed (hunch debt refuses publication, `case-disclosures` R16). A finding the publisher cannot see adds no row and no count (R33). An accepted or imported finding is not listed: it is another group's finding, graded by that group and published with that edition's frozen grade (`strength` R33), so this team has no passage of its own there to grade. The list never blocks, never becomes `first`, never changes `ready` and writes nothing. After a passage is graded the next look no longer lists it. Test: three ungraded passages over two findings answer three rows, count 3; grading one and looking again answers two; `ready` and `first` equal with and without rows. Control: all graded answers no rows and count 0; a hunch leg is not listed; an unseen finding adds no row or count; an imported finding adds none.
- R89 · (T53; DEC-461; amends case-authoring R14) *(not yet met: T53)* **The edition states it was published with them ungraded.** (decided, K5548) The document the owner signs states, from the same rows as R88's list, exactly which passages are ungraded, and carries one fixed plain sentence that the edition was published with these passages not graded by the team (words the UX stream's). With none ungraded, no statement and no sentence. Preparing again after grading one of two lists the other; a replaced preparation (R8) keeps no stale list. Test: two ungraded passages store a statement listing exactly them and the sentence, equal to R88's rows. Control: all graded writes neither; a replaced preparation keeps no old list.
- R90 · (T53; DEC-461; amends case-authoring R55) *(not yet met: T53)* **An ungraded passage never refuses the act.** Preparing, the pre-flight and the ceremony refuse nothing because a passage is ungraded, provided the statement of R89 is in the document. "Sign anyway" is therefore always open. Test: a case with an ungraded load-bearing passage prepares and signs. Control: the same fully graded prepares and writes no statement.
- R91 · (T53; JOURNEYS R-100, owner half; changes R10) *(not yet met: T53)* The refusal for a statement, subject justification, exclusion list or bias acknowledgement unchanged from the previous edition names which one (`field`), in the answer. Test: change the other three and leave the bias acknowledgement: the refusal's field is `bias acknowledgement`; the position is not named. (The register says the refusal carries `field: k`; the line fixes that the screen can read it.)

Other services (compressed):

- R38 · `whatChanged: {text, draft?}` for an edition above 1: `NO_WHAT_CHANGED`, `BAD_WHAT_CHANGED` (over `WHAT_CHANGED_MAX`), `NO_SUCH_WHAT_CHANGED_DRAFT`; `began_as` recorded (`case-grammar` R8).
- R40 · (DEC-103) The frozen manifest's statements printed, public citations named, others counted.
- R41 · `working_on` from `network-notices.noticeReferenceOf`, omitted when null.
- R42 · "What becomes permanent" states that publishing opens the notice's sealed weeks.
- R53 · `blockers` gain `case-disclosures` R13, R14; accepted work named; flags listed with `FLAGS_SAY`.
- R55 · After R6, before the case identity, `publishCase` asks `case-disclosures` in order (`hunchDebt`, `tensionsJudged`, captures, materials, accepted work, flags, R56, people, `tieAttestationJudged`), first refusal answered, nothing written; later the sources, facts, method and blocks via imported renderers. Never refused because a disclosed conflict, capture, material, flag or calculation exists.
- R56 · An undisclosed load-bearing calculation that differs or has an unbound input is `CALCULATION_NOT_DISCLOSED`; nothing else refuses.
- R57 · The `timeline:` block from `events.timeline` (`audience: "public"`), only `public: true` items written.
- R58 · After R7, before R8 and any write, a waiting edition (`publish-schedule.waitingEditionOf`) is `CASE_EDITION_WAITING` (C-44.6) naming `edition`, `at`; the pre-flight answers it `first`.
- R60 · `case_roles:` rows state the pinned `subject_entity`, or null.
- R61 · `checkStandardsUse` before storing; `{ok: false}` is `STANDARDS_USE_REFUSED`.
- R63 · (D56) `account`, `accountDraft?`, `statementCites?`, judged per R69; `case-grammar` R23's block written.
- R65 · Authored fields exactly the four statements, `scope`, `biasAcknowledgement`, the account; other fields `CASE_FIELD_NOT_ALLOWED`.
- R67 · The pre-flight's "the account" step.
- R68 · (D60) Approvals listed, `APPROVAL_MISSING` among `blockers`; `case-grammar` R26's block written.
- R69 · `case-account` asked in order: R5, then after R10 R4, R6, R7; after storing, `acceptanceRecorded` in this transaction.
- R72 · A `counsel_matter` project is `COUNSEL_MATTER_NOT_PUBLISHED`, before any write; `first` in the pre-flight.
- R74 · Above the highest ratified edition, `case-inputs.pendingOutcomes` written into `case-grammar` R29's block.
- R75 · The sign step's `publish_at` is `caseRatifyPreflight`'s (its R44), never a blocker.
- R76 · `tieAttested` `true` only by the signer's confirmation in this act, else `TIE_ATTESTATION_MISSING`; recorded in the document only.

Invariants:

- R22 · Everything asserted arrived as an argument, was read at the act, or is a stated fact; nothing composed.
- R23 · Preparing moves no finding's bytes or pin; no project's act moves another's case (rule 12).
- R24 · No case-level strength in any answer or document; pairs per member and axis (DEC-44, DEC-21).
- R25 · Every authorship field is a stamp; `statement_by` read from the record (`case-inputs` R3, R13).
- R26 · Undetermined is stated, never filled.
- R27 · Working material answers an outsider as nonexistent; the acknowledgement dead answer is `case-inputs` R1's and R14's.
- R29 · This module's rows (C-44.1, C-44.3–.5, C-32.6, C-33.14, `CALCULATION_NOT_DISCLOSED`, `STANDARDS_USE_REFUSED`, C-136.1, C-136.2 in `PUBLISH_ACT_CHECKS`); a change moves `CATALOG_VERSION`.
- R30 · No place is named in this module's behaviour or outward text.
- R33 · (DEC-85) No document or answer names the project, members, content, kind or source of a side the publisher could not see at the act; a reveal (`contradiction` R52) never widens it; sight at the act (`membership` R43) governs.
- R12, R19, R20, R21, R28, R31, R35, R36, R37, R39, R43–R52, R54, R59, R62, R64, R66, R70, R71, R73 · retired, moved to `case-disclosures`, `case-account` and `case-inputs`.

Uses (Private), compressed: record-core, membership, bias, strength, publication, publish-schedule, case-grammar, ratification, case-tensions, case-disclosures, case-account, case-inputs, case-carriage, project-roster and the other read contracts; doorbell for the test fixture only; (T53; A5) `case-grammar` R36 and `case-disclosures` R35, R36 (the ungraded-passages block writer and list) for R88, R89; `strength` R3: an ungraded passage adds nothing to a pair.

Satisfies (compressed): DEC-101, DEC-103, DEC-112, DEC-96, DEC-147, DEC-85; Publication §3, §5, §6A; Action v0.2 §3, §4.

Suggestions (A5 part kept; the rest compressed to: helpers copied, K57; tests with negative controls): R88, R89: the list is the sign step's field `ungraded_passages: {rows, count}` in `steps`, built from the rolled-back run of `publishCase` (it reads current bytes); rows computed from the `passages:` and `grading_facts:` rows in one read; a row is a passage whose grading-facts row (same finding, ord) holds no member-authored grade (the recommended predicate; K5548). The pre-flight is one call, not one per finding. PLANNING's placement note: the predicate lives in `case-disclosures` R35, and R88 and R89 should call it and R36 (one read). A grade changes the finding's version, so an already-prepared unsigned edition is out of date; the screen prepares again before signing. There is no separate "sign anyway" field: the signature over bytes carrying the statement is the consent.

## Used services

record-core (`record-core.md`): the record's storage: id allocation, leases, append-only history and manifest, purge; every storing module writes through it.

- record-core R6 · `mintOpaqueId(prefix, year, tail, taken)` returns `<prefix>-<year>-DDDD<tail>`, drawn uniformly, never a taken or earlier id.
- record-core R7 · An id is recorded in the caller's transaction before it is returned; a rollback takes it back.
- record-core R8 · A recorded id is never drawn again, purged or not.
- record-core R9 · `null` only when 64 draws in a row collide. Never throws.
- record-core R62 · `mintExhausted(prefix, extra?)`: `{ok: false, reason: "MINT_EXHAUSTED", code: "MINT_EXHAUSTED", check, translation, prefix, detail}`, one fixed sentence per prefix; writes nothing, never throws.
- record-core R21 · `declarePurge(module, tables, {exempt?})`, `declareTable`'s default form (classes; `TABLE_DECLARED` on a repeat).
- record-core R46 · A declared table is a name or `{name, keys, whole}`.
- record-core R32 · `transact(fn)`: one transaction; a throw or refusal (`ok:false`) rolls back every row in any module's tables and spends no id; nested calls join as savepoints; rethrows after rollback.
- record-core R47 · `stampInstant(precision, when?)`: UTC ISO 8601, `"second"` or `"millisecond"`; another precision throws.
- record-core R48 · `instantOrder(a, b)` compares as instants; NaN when unreadable; never throws.

membership (`membership.md`): members and what each may do; projects at setup, sight and the fence.

- membership R77 · `existenceAct(projectId, viewer)`: C-70.1 `PROJECT_SEEN_NOT_A_PARTICIPANT` when sight is existence only, else null; `owners` only for an administrator at a hidden project; never throws.
- membership R78 · `noSuchProject(projectId, extra?)`: `{ok: false, reason: "NO_SUCH_PROJECT", code: "NO_SUCH_PROJECT", check, translation, project, detail}`, one sentence for every caller; `extra` adds; never throws.

bias (`bias.md`): declared bias, a group's lens disclosed, adopted and in force by scope with its hash; never blocks work.

- bias R13 · `biasManifest({scope, scopeId, viewer, limit, offset})`, synchronous: a project scope with no id or unseen answers `in_force: false`, "no manifest was in force".
- bias R14 · Instance and project adoptions from pinned bytes; a pin not `adopted` in `pins_proposed`, in force nothing; unproducible bytes `in_force: null`, `unresolved_pins`.
- bias R15 · Nothing in force: `in_force: false`, never an empty lens.
- bias R16 · Effective set: group then project statements; locked ones kept, in `lock_violations`.
- bias R17 · `statements_sha` is SHA-256 over the whole effective set before paging.
- bias R18 · Also `bundles`, `residue`, a page of `statements` (200 default, max 2,000), `total`, `truncated`.

strength (`strength.md`): a claim's worth as a pair (capture, connection) with testimony beside, never composed (DEC-21, DEC-44); the bar a project declares.

- strength R1 · `strengthOf(id) → {ok, bundleId, depth_bound, capture, connection, testimony}`, each axis over its own population; testimony legs D.
- strength R2 · An inquiry leg contributes its target's answer to depth 6, else `undetermined`.
- strength R3 · An ungraded member is inert, named in `not_load_bearing`; none graded is `unrated`.
- strength R4 · Grounds AND within, OR across; the axis the weaker of the necessary and OR parts; `cuts_against` in neither.
- strength R5 · A `hunch` leg is inert and named; hunch debt still refuses publication; answers count hunch legs left out.

Purpose only:

setup-words (`setup-words.md`): the interface's words as frozen data.

record-grammar (`record-grammar.md`): the record's shared grammar.

provenance (`provenance.md`): the trust root: register, acquisition receipts, capture grade, firsthand observation.

attestation (`attestation.md`): co-attestation by trusted timestamp and the instance's signing key.

extraction (`extraction.md`): readings from captured bytes with provenance.

content (`content.md`): the unit the record points at.

observation-log (`observation-log.md`): append-only record of looking at four levels, what was found or not.

inquiry (`inquiry.md`): the recursive question with its basis legs and grading.

basis-versions (`basis-versions.md`): frozen alternative versions of a basis, CURRENT, a project's conclusion.

contradiction (`contradiction.md`): identifying, presenting and resolving conflicts, never editing a side.

reevaluation (`reevaluation.md`): which findings a change affects, changing nothing.

publication (`publication.md`): every case document and the published projection.

ratification (`ratification.md`): the two signing ceremonies and what they judge.

capture (`capture.md`): bringing material in with provenance.

sources (`sources.md`): a source's dated history of disclosures and what may be published of it.

case-grammar (`case-grammar.md`): the case document's one grammar.

credentials (`credentials.md`): passwords, sessions, signer keys, AI credentials.

network-notices (`network-notices.md`): a project's signed public notice and its sealed weeks.

promotion (`promotion.md`): the one write path and the check catalogue at ratification.

case-import (`case-import.md`): importing another group's case and recreating its findings.

inquiry-grammar (`inquiry-grammar.md`): an inquiry document's grammar as checked, pure.

case-carriage (`case-carriage.md`): what an edition carries at commit.

case-disclosures (`case-disclosures.md`): what a case discloses about what it rests on, judged before signing.

case-account (`case-account.md`): the case's account, its drafts, judgment and reviewers' comments.

calculations (`calculations.md`): `CALC-` numbers from a closed recipe grammar, recomputed at acceptance and publication.

workbooks (`workbooks.md`): a member's spreadsheet recomputed and compared, never a gate.

events (`events.md`): happenings in the world and the timeline.

case-tensions (`case-tensions.md`): what a case says about the record after signing.

jurisdictions (`jurisdictions.md`): the profiles, every local fact as data.

entities (`entities.md`): the entity axis and subject registry.

connections (`connections.md`): derived connections, edges between bundles, themes.

lines (`lines.md`): dated graded lines between entities.

money (`money.md`): stated amounts with their axes, never totals.

people (`people.md`): the people the record is about, never concluded about.

case-checker (`case-checker.md`): the one checker of a published case, also standalone.

publish-schedule (`publish-schedule.md`): a signed edition waiting for its set time.

doorbell (`doorbell.md`): the public intake and the member's inbox.

project-roster (`project-roster.md`): the working group's acts after setup.

case-inputs (`case-inputs.md`): what other acts record before the next edition.

test-support (`test-support.md`): test sandbox, ZIP writers, seeded generators, doubles.

runtime-limits (`runtime-limits.md`): CPU measurement, token hygiene, read bounds.

doc-clean (`doc-clean.md`): a member document's metadata-free copy, pure.

retrieval (`retrieval.md`): query language over the record and what it could not see.

standards (`standards.md`): what a government act is measured against, in force by date.

## This task

Layer 8, case-authoring: five entries. Census row (K5565): literal A / B files 1 / 1; regex A / B / C sites 19 / 7 / 13 (12 files).

- R88, R89, R90, R34, R14, R55 · T53-279 · A5 (DEC-461; DEC-474 (4)'s words) · the sign step lists ungraded passages; the edition states it; never refused for it (`planning/lines-A5-A6-signing.md`, case-authoring R88-R90): the signing list and the edition's statement as A5 in DEC-474 (4)'s words (screens-publish draws `screen.published.ungraded`).
- R83, R34, R8, R7 · C T52-27 · W14 · E-K3 · BLOCKER · the pre-flight answers `published` per draft (`case_documents.draft_id`, publication R40), not per case, so a second draft over a published case shows its steps; the case's published edition stays as a note. The screen is unchanged. Test: a draft made through the question page's "Prepare a case from this" after edition 1. PL1 W14.
- R91, R10, R83 · T53-280 · K5471 (6) · JOURNEYS's defects, its rows (`planning/plan-T53-journeys.md` §A): R-100 (owner half): the unchanged-statement refusal does not tell the screen which box (`field`) (REG3 R-100; D3 case-authoring R?1). R-103 (owner part): the heading counts the ratified draft as the next edition (REG3 R-103; +T52-78, D-K9 screen half; the owner half has no line, D3 puts it in screens-publish R?8 only).
T53-281 (no requirement of this module states it yet; plain line): K4354, P15, P24 (`time-budgets-draft.md` §3; G80, G12a, G12c) · the count of drafts Home reads: Home reads kept counts and cached roll-ups (the queue's, held captures', `casedrafts`' count) in place of whole lists, Home's in-room time being the room's own work a combined read does not help; which module keeps each count is settled at START from the read Home makes. Bar: P-22's Home 3,526 ms and Queue 3,456 ms (plat-s1, Seed A). Test: Home's and Queue's in-room and net time on Seed A within their class; Control: the counts equal the lists' lengths after each act that changes them.
- R29, R80, R91 · T53-282 · K5565 · English in tests: convert the module's English-in-test sites to the word key and its values (assertions read the key the product reads and its placeholders' values, never a copied sentence; a B site first gets its key in the module, a words row in UX-DESIGN's wording where shown to a member; a C site is kept as input data or removed with its reason; every test touched for other entries is converted too, as the words check refuses English in a new or changed test). Sources: `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md`. Test: the words check's baseline loses the module's files; the suite is green.
