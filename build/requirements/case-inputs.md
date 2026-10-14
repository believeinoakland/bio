# case-inputs — requirements

**Status** · Drafted 2026-10-12 on `tranche/T47` (the opening's act, plan rule 3; K3027). Split from `case-authoring` by copy (K617, K624, K531, K2982; N908; T47-31), for size (4,072 lines with comments after T45-21, M-T45-6), meaning unchanged. Each id names its `case-authoring` source, which retires the moved ids as "moved to case-inputs R<n>" (T47-32). The extraction map is `build/extraction/case-authoring-split-2.md`, its §4 table adopted (K2982, the wider cut). R17 is new (T47; N992; DEC-199): the sign step's no-window and not-laid-out lines, its unread sentence and C-136.5 read by key. Every requirement is not yet met (T47). Last changed T48 (T48-43: R18 new, amending R8, R10 and R17, a source row's `quotable` and the no-quotation line at signing, its key `signing.openrequest.noquote` asked of UX-DESIGN, BOB's plain sentence until given; N880; Actions D13; K2744, K3190, K3195); marked not yet met (T48).

| old (`case-authoring`) | new | |
|---|---|---|
| R19 | R1 | `acknowledgeStatement`'s doors and refusals C-82.2–C-82.8 |
| R20 | R2 | an acknowledgement's key, `existed`, re-authoring an unsigned document's list; `statementAcknowledgements`, the one list |
| R21 | R3 | `statement_by`, `statementWriter` |
| R59 | R4 | a waiting edition is signed for `acknowledgeStatement` |
| R62 | R5 | `secretSha` from the body only |
| R39 | R6 | `proposeWhatChanged`, `whatChangedDrafts` |
| (new) | R7 | `whatChangedDraftOf`, the read `case-authoring` R38 asks |
| R70 | R8 | `registerOpenRequests`, `openRequestsSource`, `openRequestsOn` |
| R71 (its service, withdrawal, list and purge clauses) | R9 | `carryOutcome`, `withdrawCarriedOutcome`, `carriedOutcomesOf`, `pendingOutcomes` |
| R73 | R10 | the words of R9's rows and of the sign step's lines (`openRequestLine`) |
| R28 | R11 | the four tables declared whole to purge |
| R29 (its C-82 and C-136.3–C-136.8 share) | R12 | the rows, unchanged |
| R25, R27 (R19's share), R30 (copies) | R13–R15 | stamps; the dead answer byte-identical; no place named |
| (new) | R16 | `caseInputsOf`, created by `case-authoring`'s factory; `caseInputsOps`, spread by the plane |
| (new, T47; DEC-199) | R17 | the sign step's remaining lines and C-136.5 read by key |

## Public

### Purpose

What other acts record about a case before its next edition is prepared, which `case-authoring`'s `op=publish` reads into the document (Publication §3, §6A; Action v0.2 §3, rules 8, 17). It holds the statement's acknowledgements, by which members and review recipients say they have read the statement before it is signed, and who wrote the statement; the drafts of a new edition's statement of what changed; the one source of a case's open requests for comment at signing, which `action-replies` fills; and the outcomes a member carries into a case's next edition. `case-authoring` asks this module and writes what it answers into the case document; this module writes no case document but the acknowledgement list of an unsigned one (R2), and calls nothing of `case-authoring`'s.

### Provides

Terms are `case-authoring`'s and `publication`'s. A **statement** is a case document's completeness statement. `viewer`, `author`, `proposedBy` and `by` are the control plane's stamps (R13). Every refusal names `reason`; one with a catalogue row carries its `check`, `code` and `translation` (R12).

#### Statement acknowledgements: acknowledgeStatement({draft?, case?, edition?, secretSha?, bySecret, reason, viewer}) (`op=statementack`), statementAcknowledgements(...), statementWriter(...)

- **R1** (was `case-authoring` R19) Doors: a recipient through a live review grant (a named draft must be the grant's own); a member, of a draft, or of an unsigned case document it has standing in. Every other caller receives the review copy's dead answer (`publication`'s review provider, its R23), byte-identical (R14). `STATEMENT_ACK_NO_SUBJECT` (C-82.2), then a signed document `STATEMENT_ACK_ALREADY_SIGNED` (C-82.3); a member not a joined participant of the publishing project `STATEMENT_ACK_NOT_A_PARTICIPANT` (C-82.4); no statement C-82.5; the writer undetermined, for a participant, C-82.7; the writer, or on the case door the publisher, `STATEMENT_ACK_BY_ITS_AUTHOR` (C-82.6); then `STATEMENT_ACK_NO_REASON` (C-82.8: the `reason`, the acknowledger's words, absent, not a string, blank or over `STATEMENT_ACK_REASON_MAX` (2,000) characters), kept with the acknowledgement and shown in R2's list (DEC-88; K1025). A recipient is never the writer.
- **R2** (was `case-authoring` R20) An acknowledgement is keyed by the statement's SHA-256 (`statementSha`), the project, the case identity it was given at and the acknowledger, and a repeat answers `existed: true`. It is matched by that identity or by the draft named at publication, never by the statement's bytes. On an unsigned document it re-authors only that document's list (`publication.reauthorSection`), so its hash moves. Every list states `acknowledged` (zero included), withholds and counts the publisher's own and the writer's own rows, withholds and counts every participant row when the writer is undetermined, and counts, never names, readings bindable to no case; it names at most `STATEMENT_ACK_MAX` (500), saying so (`truncated`). Nothing about an acknowledgement refuses publication. `statementAcknowledgements(project, caseId, edition, statement, exceptAuthor?, writer?, draftId?, link?)` is the one list, read by `case-authoring` R14 and by the review copy (`review` R18, R20); its renderers (`ackFrontmatterLines`, `ackBodyLines`, `withheldWriterStated`, `ACK_PROSE_HEAD`) are this module's, imported by `case-authoring`'s document, never copied (K1333).
- **R3** (was `case-authoring` R21) `statementWriter(project, caseId, edition, statement, publisher, namedDraft?)` answers `statement_by`, the member whose write made the statement's current bytes: the named draft's stamp; else a draft of the project holding that sentence; else the publisher, named as both, with the sentence saying so. Drafts disagreeing, or a draft from before the stamp, make it null, stated undetermined, never filled from the publisher; so do a draft at this identity whose arguments do not parse, and a project holding more drafts than one read of `DRAFTS_READ_MAX` (500, `review` R26's bound, copied) lists, each with its reason. It answers where the name came from. Drafts are read from `review`'s `case_drafts` under its R26 read contract. It writes nothing.
- **R4** (was `case-authoring` R59; N681; N823) A document of an edition `publish-schedule` holds waiting (its R1, read through `waitingEditionOf`, its R7) is signed for `acknowledgeStatement`: on the case door it is refused `STATEMENT_ACK_ALREADY_SIGNED` (C-82.3), in R1's order, and nothing is re-authored, as for a signed document. A cancelled edition's document is again an unsigned preparation (`publish-schedule` R3) and is acknowledged as one.
- **R5** (was `case-authoring` R62; T37; N761; K2129, K2175) This module's ops map (R16) takes `op=statementack`'s `secretSha` (R1's grant door) only from the internal request's body, where the control plane sets it after removing any a caller sent (`control-plane`'s N761 requirement), never from its query: a `secretSha` in the query opens no door, and R1 answers that caller with the dead answer. `bySecret`, `viewer`, the subject and `reason` are read from the query, as before.

#### Drafts of what changed: proposeWhatChanged({case, text, proposedBy, viewer}) (`op=whatchangedpropose`), whatChangedDrafts({case, viewer}) (`op=whatchangeddrafts`), whatChangedDraftOf(caseId, draftId)

- **R6** (was `case-authoring` R39; DEC-101 (1); DEC-84 (14); K1019) `proposeWhatChanged` stores a draft of a new edition's statement of what changed under a minted opaque `WCD` id, labelled machine work when its proposer is a machine (`record-grammar`'s `proposalLabel(proposedBy, "edition_statement")`, its R43). It is never a statement until a member adopts or rewrites it through `case-authoring` R38. Any credential may propose. `whatChangedDrafts` lists the case's drafts, oldest first, each with its id, text, label and when, at most `WHAT_CHANGED_DRAFTS_MAX` (500) with `truncated`. Refusals, each writing nothing: `NO_SUCH_CASE` (a case not published, or one the viewer may not see, answered alike); an empty `text`, or one over `WHAT_CHANGED_MAX` (8,000) characters, `BAD_WHAT_CHANGED`. Drafts are append-only. `WHAT_CHANGED_MAX` is this module's, and `case-authoring` R38 imports it (one spelling).
- **R7** (new; the map's §2) `whatChangedDraftOf(caseId, draftId)` answers `{draft_id, text}` for the draft of `caseId` that `draftId` names, or null when none does (a draft of another case included). It asks no viewer, writes nothing and never throws. It is the one read of a draft `case-authoring` R38 makes.

#### The open requests at signing: registerOpenRequests({openRequestsOn}), openRequestsSource(), openRequestsOn({case, members, viewer})

- **R8** (was `case-authoring` R70; T45; N880; Actions D13; v0.2 rule 8) The signing view's open requests for comment: a registration this module provides and a later module fills.
  - `registerOpenRequests({openRequestsOn})` (or `registerOpenRequests(module, source)`) takes, once at start, the one source of a case's open requests for comment; `action-replies` fills it (its R3). A second registration is refused `PROVIDER_DECLARED`, and one without the door `PROVIDER_MALFORMED`, each registering nothing (`publication` R77's pattern). `openRequestsSource()` answers `{registered, module}`.
  - `openRequestsOn({case, members, viewer})` is synchronous, and `case-authoring` R34 calls it: `case` the case `case-authoring` R7 resolves; `members` `[{bundle_id, version_sha}]` at the bytes `case-authoring` R13 pins; `viewer` the act's own.
  - The source answers `[{whom, asked_at, window_closes, answers, replied?}]`: `whom`, the office by role and body as the action names it; `asked_at`, the date it was sent; `window_closes`, the date the window closes, or null when none is stated; `answers`, `{answered, claims}` (of the claims the request laid out, how many the reply received answers), or null when no reply is recorded or the request laid out no claims; `replied`, optional, `true` when a reply is recorded (K2964), `false` with a non-null `answers` making the row malformed. Which requests are open on the case is the source's to answer.
  - It answers `{ok: true, rows}` in the source's order, `[]` with none registered. A source that throws, or answers anything but a list of such rows, is read `{ok: false, undetermined: true}`.
  - Nothing here refuses, writes, or enters the document.

  Controls: a second registration and a malformed one are refused; with no source the list is `[]`; a throwing source reads `undetermined`.

#### Outcomes carried into the next edition: carryOutcome({case, kind, text, cites, on, by}), withdrawCarriedOutcome({outcome, reason, by}), carriedOutcomesOf({case, viewer}), pendingOutcomes(caseId)

- **R9** (was `case-authoring` R71, its service, withdrawal, list and purge clauses; T45; N855 (6c); Actions D5, D6c; v0.2 §3 Success record, rule 17) Outcomes carried into a case's next edition, by a member's act. A later module calls this one; this module reads nothing of it.
  - **The service.** `carryOutcome` is a service with no op. Its one caller is `consequences`' carrying act (its R22, `op=outcomecarry`), for all three kinds: a success record, a harm addressed and a cure. Inside that member's act it records one pending outcome for the case's next edition under a minted opaque `OUTC` id and answers `{ok: true, outcome}`. `kind` is one of `case-grammar`'s `OUTCOME_KINDS` (`success`, `cure`, `harm_addressed`); `text` the member's statement, words on one line of at most `CARRIED_TEXT_MAX` (2,000, `case-authoring`'s `COMPLETENESS_MAX` copied) characters with no quote, backslash or line break, stating no cause; `cites` a list in `case-account` R5's cite shape (asked through `case-account.accountShaped`); `on` a calendar date that exists, the date the outcome occurred.
  - **Refusals**, in order, each writing nothing, each a row of this module's table (R12):
    - `by` absent or a machine identity: `MACHINE_CANNOT_CARRY_OUTCOME` (C-136.3);
    - a case with no ratified edition, or whose project `by` does not see in full: `NO_SUCH_CASE`, one answer;
    - `by` not a joined participant of the case's project: `CARRY_NOT_A_PARTICIPANT` (C-136.4);
    - a malformed field: `BAD_CARRIED_OUTCOME` (C-136.5), naming it.
  - **Withdrawing.** `withdrawCarriedOutcome` withdraws a pending outcome with a reason (R1's `reason` bounds, `CARRY_REASON_MAX` (2,000)). Refusals, in order: `MACHINE_CANNOT_CARRY_OUTCOME`; `NO_SUCH_CARRIED_OUTCOME` (C-136.6; absent or unseen alike); `CARRIED_OUTCOME_SETTLED` (C-136.7; already carried by a ratified edition, or already withdrawn); `CARRY_NO_REASON` (C-136.8).
  - **Pending.** An outcome is pending until a ratified edition's signed document holds it (its `outcomes:` block, `case-grammar` R29), read from `publication`'s `case_documents` (its R40), so no write marks it and a replaced preparation carries it again; a withdrawn one is not pending. `pendingOutcomes(caseId)` answers the case's pending outcomes in the order carried, each `{outcome, kind, text, cites, on, carried_by, carried_at}`, asking no viewer and writing nothing; `case-authoring` R74 reads it.
  - **The list.** `carriedOutcomesOf({case, viewer})` lists the case's outcomes, pending, carried (with the edition) and withdrawn (with the reason), fenced as R1's member door.
  - The outcomes and their withdrawals are append-only and declared to `record-core`'s purge as working material (R11); a carried one lives on in the signed document (`publication` R24).

  Controls: each refusal; a withdrawn outcome is not pending; an outcome carried by a ratified edition is not pending after it; a replaced preparation leaves it pending.

#### Its words

- **R10** (was `case-authoring` R73; T46; DEC-194; N913) Wording only, as T46 left it: codes, numbers and behaviour are unmoved, and every sentence below is read from `words.json` by key (`CASE_INPUTS_WORDS`, `fillWords`, as `membership`'s `HANDLE_WORDS` and `extraction`'s `TRANSCRIBE_WORDS` are), never a copy.
  - **R9's rows.** Four rows take their translations from `words.json`'s `refusal.<CODE>`: `MACHINE_CANNOT_CARRY_OUTCOME` (C-136.3), `NO_SUCH_CARRIED_OUTCOME` (C-136.6), `CARRIED_OUTCOME_SETTLED` (C-136.7) and `CARRY_NO_REASON` (C-136.8); `CARRY_NOT_A_PARTICIPANT` (C-136.4) is read by its key. `BAD_CARRIED_OUTCOME` (C-136.5) is R17's.
  - **The open requests at signing.** `openRequestLine(row)` answers one row's fact line, `{key, says}`, for `case-authoring` R34's sign step: `signing.openrequest.line` when the row has a window and answers `answers`; `signing.openrequest.noreply` when it has a window, `answers` is null and the row answers `replied: false`; each with `{whom}`, `{asked_at}`, `{window_closes}`, `{answered}` and `{claims}` filled from the row (`OPEN_REQUEST_KEYS`). Every other row is R17's.

  Controls: each re-worded row's translation equals its key's sentence; a row with a window and a reply, and one with no reply, read their keys' sentences with the row's facts.
- **R17** (T47; N992; DEC-199; amends R10; was returned by `case-authoring` R73) The sentences R10 left plain are read by key from `words.json` (DEC-199), never a copy:
  - **A row with no window** (`window_closes` null): `signing.openrequest.nowindow.line` when it answers `answers`; `signing.openrequest.nowindow.noreply` when `answers` is null and it answers `replied: false`; `signing.openrequest.nowindow.notlaidout` when `answers` is null and `replied` is `true` or absent.
  - **A row with a window whose reply is not laid out** (`answers` null, `replied` `true` or absent): `signing.openrequest.notlaidout`, true whether a reply came or not, so "no reply is recorded" is never shown for a recorded reply.
  - Each is filled from the row as R10's are, and `openRequestLine` then answers a key for every well-formed row (none is keyed null).
  - **The source unread.** When R8 reads `undetermined`, the step's one sentence is `signing.openrequest.unread` (`OPEN_REQUESTS_UNREAD_SENTENCE` answers its words, which name "your group's Civicsmith", DEC-198 (7)).
  - **C-136.5.** `BAD_CARRIED_OUTCOME` takes its translation from `refusal.BAD_CARRIED_OUTCOME`, with `{field}` the field R9 names, a sentence true of a missing and a malformed field alike (DEC-199).

  Codes, numbers, `where`s and behaviour are unmoved; the changed row waits for T48's promotion stamp (plan rule 5 (2)). Controls: one row of each of the four shapes reads its key's sentence with the row's facts; an unread source reads `signing.openrequest.unread`'s words; C-136.5's translation equals its key's sentence with the field filled, for an absent and for a malformed field.

#### A reply that asks not to be quoted (T48-43; N880; Actions D13, H17)

- **R18** (T48; N880; Actions D13; amends R8, R10, R17; `action-replies` R11) A source row (R8) may also answer `quotable`, a boolean. *(not yet met: T48)*
  - A value that is not a boolean makes the row malformed, so R8 reads the source `undetermined`. A row not answering it reads as `true`.
  - For a row answering `quotable: false`, `openRequestLine` (R10, R17) also answers `quoting: {key: "signing.openrequest.noquote", says}`, filled with `{whom}`. The words are read by key from `words.json` once the design stream gives the key (an ASK to UX-DESIGN). Until then `key` is null and `says` is BOB's plain sentence, "{whom}'s reply asks not to be quoted.", as `case-authoring` R34 kept its sentences until given.
  - The line is shown once, with its row's line. It asks no reason and refuses nothing (a declaration, DEC-13).
  - `case-authoring` R34 carries it unchanged: it spreads `openRequestLine`'s answer into each line, so `case-authoring` needs no job.
  - Controls: a row answering `quotable: true`, or not answering it, carries no `quoting`; a row answering `quotable: "no"` makes the source `undetermined`.

#### Its ops map; its instance

- **R16** (new; K61; the map's §1; `case-account` R12's form) `caseInputsOf(host, deps)` answers the one instance for a host: every caller for the same host gets the same instance, and `deps` (`record`, `membership`, `publication`, `publishSchedule`, `account`, `now`) are each reached lazily on the host unless given. At its creation it creates the four tables with the DDL `case-authoring` created them by (`CREATE TABLE IF NOT EXISTS`, the `reason` column added where absent), so a running store's rows are kept with no data move, and declares them (R11); a declaration `record-core` refuses (`TABLE_DECLARED`) is thrown at creation and no instance is kept. `case-authoring`'s factory creates it at its own creation, as it creates `case-account` (`case-authoring`'s Uses), so the tables exist and are declared at every boot. `caseInputsOps(c, url, body)` publishes this module's ops map, one route arm per op: `statementack` (R1, R5: `draft`, `case`, `edition`, `bySecret` (`"1"`) and `reason` from the query, `secretSha` from the body only, `viewer` the query's stamp); `whatchangedpropose` (R6: `case` from the query, else the body; `text` from the body, else the query; `proposedBy` the `author` stamp); `whatchangeddrafts` (R6: `case` as above, `viewer` the stamp); each answering exactly what its service answers. The op names, their declarations, grades and help are unchanged; the plane spreads the map (`plane`'s L11 job), directly before `case-authoring`'s.

## Private

### Uses

- `record-grammar`: `parseFrontmatter`, `isMachineIdentity`, `proposalLabel` (its R43; R6), `createSha256` (R2's key).
- `record-core`: `recordOf`, `stampInstant`, `transact`, `mintOpaqueId`, `mintExhausted` (its R62; R6, R9), `declarePurge` (R11).
- `membership`: `isJoinedParticipant` (R1, R9), `sight` (R9), `viewerPredicate` (R1, R6).
- `publication`: `reviewProvider` (its R23; R1's dead answer and grant door), `hasCaseStanding` (R1), `reauthorSection` (its R21; R2); the `cases` and `case_documents` read contracts (its R40; R4, R6, R9).
- `publish-schedule`: `waitingEditionOf` (its R7; R4).
- `case-grammar`: `SECTIONS` (the acknowledgements section's locator, its R3; R2), `fmSafe`, `OUTCOME_KINDS`, `outcomesOf` (its R29; R9).
- `case-account`: `accountShaped` (its R5; R9's cites). Directly before this module (K2982).
- `review` (layer 8, later): `case_drafts` under its R26 read contract (R3), a read contract and not a use, as in `case-authoring`.
- `test-support`: the tests' fixtures.
- Its users: `case-authoring` creates it and calls `statementWriter`, `statementAcknowledgements`, `whatChangedDraftOf`, `pendingOutcomes`, `openRequestsOn`, `openRequestLine` and `OPEN_REQUESTS_UNREAD_SENTENCE` (its R14, R34, R38, R74), and imports the acknowledgement renderers and `WHAT_CHANGED_MAX`; `review` reads R2's list (its R18, R20); `consequences` calls `carryOutcome` (its R22); `action-replies` registers R8's source (its R3); `plane` spreads R16's map; `answer-envelope` reads `checks.mjs` (its R8); `affordances` and `control-plane` tests name its ops and rows (the map's §5).

### Invariants

- **R11** (was `case-authoring` R28 and R71's purge clause; K23, K1147) `statement_acknowledgements`, `what_changed_drafts`, `carried_outcomes` and `carried_outcome_withdrawals` (`CASE_INPUTS_TABLES`) are each declared whole to `record-core`'s purge (`declarePurge("case-inputs", …)`) as working material.
- **R12** (was `case-authoring` R29, its share; K6) Each row moves here with its id, code, translation and test unchanged (but for R17): C-82.2–C-82.8 (`STATEMENT_ACK_CHECKS`, whole; C-82.8 `STATEMENT_ACK_NO_REASON`, DEC-88, K1025) and C-136.3–C-136.8 (`CARRIED_OUTCOME_CHECKS`, a family object of this module's beside `case-authoring`'s C-136.1 and C-136.2, as C-44 is shared). Each `where` names `src/case-inputs/index.mjs`. A change to any moves `CATALOG_VERSION` (rule 17).
- **R13** (a copy of `case-authoring` R25) Every authorship field this module records (an acknowledger, a draft's proposer, an outcome's `by`, a withdrawal's `by`) is a stamp; `statement_by` is read from the record (R3), never a body's.
- **R14** (a copy of `case-authoring` R27, R19's share) Working material (an unsigned document, a draft, a hidden project) answers an outsider exactly as something that does not exist; R1's dead answer is byte-identical for every door refused.
- **R15** (a copy of `case-authoring` R30) No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_Publication_v0_1.md` §6A (the acknowledgements beside the review copy), §3 rule 13 (who wrote the statement) and §5A (the statement of what changed, its drafts): R1–R6; DEC-88 (the acknowledger's words, K1025), DEC-101 (1), DEC-84 (14) (K1019).
- DEC-147 (2), (4) (a signed edition waits, not public, until its time; N681, K1833): R4. F1's rule for digests (K1874; N761, K2129, K2175): R5.
- `BIO_Action_v0_2.md` §3 (Success record) and §4 rules 8, 17 (K2780; Actions D5, D6c, D13; T45, N893): R8, R9. Rule 8's "unless the reply itself says otherwise" (Actions D13, H17; K2744; T48, N880): R18.
- DEC-194 (N913), DEC-198 (7) and DEC-199 (N992; the words read by key): R10, R17.
- N908 (`case-authoring`'s split for size, K617; the map adopted, K2982): R7, R11, R16.

### Suggestions

- **The copy (K624; the map's §2; line numbers re-taken on `tranche/T47`, unchanged since T46).** From `case-authoring/index.mjs`: `OUTCOME_KINDS`' re-export, `CARRIED_OUTCOME_PREFIX`, `CARRY_REASON_MAX`, `isDate` (236–247); `OPEN_REQUESTS_DOORS` … `OPEN_REQUESTS_UNREAD_SENTENCE` (249–305); `#openRequests`, `registerOpenRequests`, `openRequestsSource`, `openRequestsOn` (309–310, 362–400); `carryOutcome` … `#outcomeStates` with `#ratifiedCase` and `#noSuchCase` (1457–1597); `#caseInSight`, `proposeWhatChanged`, `whatChangedDrafts` (1599–1663); `#waits` (2187–2192); `acknowledgeStatement` (2420–2656); `#draftLinkOf`, `#reauthorAcknowledgements`, `statementAcknowledgements` (2658–2784); `#statementWriter`, made public (2786–2875); the constants (134–143, 158–160); the three ops (2960–2975). From `document.mjs` 39–43, 61–165 (the acknowledgement renderers); from `checks.mjs` 15–49 (`CASE_AUTHORING_WORDS` renamed `CASE_INPUTS_WORDS`), 92–133 (C-136.3–.8) and 186–241 (C-82); `schema.mjs` whole, renamed `CASE_INPUTS_*`, DDL unchanged. `COMPLETENESS_MAX` is copied as `CARRIED_TEXT_MAX` (K57). The DEC-49 REGION markers move with their code. No refusal text, code, number or translation changes in the copy; R17's re-take is this job's own change, made after the copy.
- **R17's keys** (`words.json` on `tranche/T47`): `signing.openrequest.nowindow.line`, `.nowindow.noreply`, `.nowindow.notlaidout`, `.notlaidout` (DEC-199), `.unread` (re-worded by DEC-198 (7)), `refusal.BAD_CARRIED_OUTCOME` (DEC-199). `case-authoring`'s `t46-words.test.mjs` arm "R73 not taken in T46" is the one case-authoring red K3022 named; its copy here is rewritten to R17, and `case-authoring`'s goes with the delete (T47-32).
- **Who creates it (the map's §3, §7 risk 1).** Nothing composes both `case-inputs` and `case-authoring`'s old declaration: `case-authoring`'s job switches the declaration and creates this module in the same commit. This module's own tests build it alone, with a fixture that cannot build `case-authoring` (later): an unsigned document is stored through `publication.storeCaseDocument`, a signed one by writing `case_documents` directly.
- **Tests** (`bio-plane/test/m/case-inputs/`, the map's §6): `statement.test.mjs` (R1–R3, R5, R13, R14), `drafts.test.mjs` (R6, R7), `outcomes.test.mjs` (R9), `openrequests.test.mjs` (R8, R10, R17), `t46-words.test.mjs` (R10, R12, R17), `waiting.test.mjs` (R4), `invariants.test.mjs` (R11, R12, R16). Each refusal a negative control; R14 identical-bytes arms; R16 the same instance per host and the tables declared once.
