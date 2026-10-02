# action-grammar — requirements

**Status** · DRAFT by a worker for BOB #80, 2026-10-01, on `tranche/T19` before layer 9 starts, for BOB's review; actions' second split by K617 and K653 BOB-2 (actions is 3,846 lines after T18, and its catalogue share of about 450 would take it past the 4,000 mark: `current.md` layer 9), placed directly before `actions` with `from: ["legacy-checks"]` (rule 3: the catalogue's action share is moved straight from the legacy module; `actions`' `checks.mjs` is copied, then deleted by `actions`' job after this one merges), with no change to any requirement's meaning. R1, R3, R4, R5, R6, R7 and R9 are `actions` R40, R4, R20, R21 (its grammar; the act's one arm stays `actions` R15's), R44, R37 and R38, moved without change of meaning (each marked "was"; only cross-references re-pointed) and retired in `actions.md` with a pointer here. R2 (the vocabularies moved from the catalogue) and R8 (the readers `actions`' read and write call, copied from its `checks.mjs`) state what the code does today and had no requirement of their own; `actions` R1, R5–R10, R22, R25, R26, R33 and R41 stay `actions`' (each states a refusal at its write or act, or its read, which this module, holding no record, cannot answer: P7) and are met through R8's functions and R9's rows. REC-201's outward share (`draft-T19.md`, layer 9): `governingLawsOf`'s sentence already names no law (`actions` R41, R8 here), so nothing is added. Every id met by ACTION-GRAMMAR #1 (T19 layer 9, K835). Layer 9. Code: `bio-plane/src/action-grammar/`, moved from `bio-plane/checks/bio-checks.mjs` (`ACTION_KINDS`, `RISK_TIERS`, `riskTierState`, `lawProposalLabel`, `ACTION_BASIS_KINDS`, `CORRESPONDENCE_DIRECTIONS`, `RFC_RESPONSE_WINDOW_PRECEDENT`, `actionBasisFindings`, `correspondenceFindings`, `QUOTE_KEYS`, `QUOTE_NUMBER_RE`, `ORD_RE`, `isQuoteEntry`, `quoteValue`, `quoteFindings`, `CORRESPONDENCE_STAGES`, `CORRESPONDENCE_OUTCOMES`, `DECISION_STAGES`, `LIFECYCLE_KEYS`, `lifecycleFindings`) and copied from `bio-plane/src/actions/checks.mjs` (the action arms and readers, the rows; `RESOLUTIONS` and `PRODUCT_KINDS` among them).

**Size (P6).** About 1,600 lines: about 450 moved from the catalogue and about 1,150 copied from `actions/checks.mjs` (`draft-T19.md`, layer 9). `actions` keeps about 2,600.

## Public

### Purpose

The grammar of an action document as the record checks it: the action vocabularies (kinds, risk tiers, basis-leg kinds, correspondence directions, resolutions, the records-request lifecycle's stages and outcomes), C-2.10's arms over an action's document (its basis legs, correspondence ledger, quotes and lifecycle, counterparty, records law, governing laws and tier history), C-6.1's `responds_to` arm and C-11.1's clock discipline, the readers `actions` answers its read with, and the rows `actions`' acts mint. It reads no record: every function is pure, and the facts a check needs (the instance's kinds, the time) are handed to it. Whether a write lands is `actions`' (its R1–R11, R33).

### Provides

Terms are `actions`' (an **action**, its document's keys, the lifecycle). A **finding** is `record-grammar`'s (its R11): `{check, severity, message, repairs?, code?}`.

**The vocabularies**
- **R1** (was `actions` R40) `RISK_TIERS` and `riskTierState(document)` are exported as the one vocabulary and reading of an action's risk tier, and `actionKinds(view)` answers the kinds this instance accepts (`actions` R10: the product's own and the view's `action_kinds`), so `affordances` and `instance-setup` read them here, never from `legacy-checks`.
- **R2** Each is exported with its value unchanged from the catalogue's or `actions`' before the move, one binding read by every module: `ACTION_KINDS` (the kinds an action written before reads as, `kindReadsAsWritten(kind)`, `actions` R4, R41), `PRODUCT_KINDS` (`records_request`, `request_for_comment`, `other`), `ACTION_BASIS_KINDS` (`rests_on`, `advances`), `CORRESPONDENCE_DIRECTIONS` (`sent`, `received`, `no_response`), `RESOLUTIONS` (`complied`, `denied`, `escalated`, `withdrawn`, `completed`), `CORRESPONDENCE_STAGES`, `CORRESPONDENCE_OUTCOMES`, `DECISION_STAGES`, `LIFECYCLE_KEYS`, `QUOTE_KEYS`, `isQuoteEntry(entry)`, `quoteValue(amount)`, and `lawProposalLabel(proposedBy)`, which is `record-grammar`'s `proposalLabel(proposedBy, "governing_laws")`. `LAW_LEVELS` is re-exported from `jurisdictions` (its R31), never a copy.

**The records law: recordsLawRefusal(fm), recordsLawFindings(fm, findings), recordsLawOf(fm, author), RECORDS_LAW_MAX** Pure; never throw.
- **R3** (was `actions` R4) `action_kind: records_request` carries `law`, the citation it is made under (at most 200 characters, `RECORDS_LAW_MAX`), stated or absent (absent reads undetermined). `law` on any other kind is refused `RECORDS_LAW_REFUSED` (C-73.6), minted by `recordsLawRefusal` alone and carrying the findings (`actions` R6 answers it at the write). An action already written with a kind no longer offered reads byte-identically, its kind as written (`kindReadsAsWritten`, R2).

**The quote grammar of a correspondence entry: quoteFindings(entries, i)** (one function, run at `actions`' R15 and in the audit, R7) Pure; never throws.
- **R4** (was `actions` R20) A quote (`quote_amount`, `quote_currency`, `quote_basis?`, `quote_answers`, `quote_revises?`) is refused, first found: `QUOTE_NOT_ON_RECEIVED` (C-72.1), `QUOTE_AMOUNT_NOT_A_NUMBER` (C-72.2), `QUOTE_NO_CURRENCY` (C-72.3), `QUOTE_ANSWERS_NO_SENT` (C-72.4, not the position of an earlier `sent` entry), `QUOTE_REVISES_NO_QUOTE` (C-72.5, not an earlier quote). A waiver is a revision to zero; both stand.

**The lifecycle grammar of a correspondence entry: lifecycleFindings(entries, i)** (one function, run at `actions`' R15 and in the audit, R7) Pure; never throws.
- **R5** (was `actions` R21, its grammar) A lifecycle place (`stage`, `follows`, `outcome`, `exemptions`, `due_by`, `due_cite`) is refused, first found: `STAGE_NOT_OF_DIRECTION` (C-94.1), `FOLLOWS_NO_ENTRY` (C-94.2), `APPEAL_NAMES_NO_DECISION` (C-94.3), `OUTCOME_NOT_ON_RECEIVED` (C-94.4), `OUTCOME_NOT_IN_VOCABULARY` (C-94.5), `DECISION_WITHOUT_OUTCOME` (C-94.6), `FEE_ESTIMATE_WITHOUT_QUOTE` (C-94.7), `DUE_HALF_STATED` (C-94.8), `DUE_NOT_A_DATE` (C-94.9). `DUE_CITE_NOT_GOVERNING` (C-94.10), asked against the governing laws as they stand at the act, is `actions`' (its R15). No due date is computed.

**The action basis: actionBasisFindings(fm, findings), correspondenceFindings(fm, findings), RFC_RESPONSE_WINDOW_PRECEDENT** Pure; never throw; each finding names its check.
- **R6** (was `actions` R44; N396, DEC-13; K603) A `request_for_comment` names the specific inquiries it put to its subject and states the response window it gave: at least one `action_basis` leg of kind `advances` whose target is an inquiry, and at least one `clock[]` entry (carrying its basis as every entry does, `actions` R7, `action-clocks` R7). A `rests_on` leg, or an `advances` leg onto anything but an inquiry, is not a disclosed inquiry. `actionBasisFindings` answers one C-2.10 finding naming each missing part, which `actions` R1 refuses a creation or revision with (`ACTION_BASIS_REFUSED`) and the audit reports (R7); another kind is not asked. The window's length is the group's: no range is enforced, and `RFC_RESPONSE_WINDOW_PRECEDENT` (`{min_days: 7, max_days: 30, source, enforced: false}`, the GAO agency-comment protocol) is exported by this module as a citation a surface may show, never compared against a date. A non-response is recorded with its date (`actions` R15, R34).

**The audit's action arm: checkActionExtension(ctx, findings)** Pure; never throws; pushes findings and answers nothing.
- **R7** (was `actions` R37) Over an action's document (`ctx.fm`; `ctx.nowMs` the time, else the clock; `ctx.actionKinds` the instance's `actions` R10 set when the caller has it, else `PRODUCT_KINDS`), it reports every C-2.10 and C-11.1 finding, including a missing counterparty block and a pending clock entry past its date (C-11.1); any other document: nothing. `actions` registers it with record-core's audit (its R51).

**The readers and arms `actions` calls** (copied from `actions/checks.mjs`) Pure; never throw.
- **R8** `riskTierHistoryOf`, `governingLawsOf`, `requestLifecycleOf`, `consequenceState`, `recordsLawOf`, `counterpartyOffice`, `counterpartyName`, `addresseeIsOffice`, `counterpartyFindings`, `respondsToEdgeFindings` (C-6.1's `responds_to` arm), `clockMovesNotMechanical` and the bounds they read (`ADDRESSEE_KINDS`, `AUDIENCE_DESCRIPTION_MAX`, `RISK_TIER_REASON_MAX`, `RISK_TIER_HISTORY_MAX`, `GOVERNING_LAWS_MAX`, `CITATION_MAX`, `LAW_PROPOSAL_WHY_MAX`, `DUE_UNDETERMINED_SAYS`) answer exactly what `actions` R1's C-2.10 and C-6.1 arms, R5's reading, R9, R25, R26, R33's mechanical rule and R41 state, each the same value, finding (check, severity, message, repairs, code) and sentence as `actions`' copy before the split; `governingLawsOf`'s undetermined sentence names no law (`actions` R41). `actions` reads each from here, so those requirements are met through them.

## Private

### Uses

- `record-grammar`: `isMachineIdentity`, `BUNDLE_ID_RE`, `OBJECT_TYPES`, `proposalLabel`, the finding shape, as T19's layer 1 moved them.
- `jurisdictions`: `LAW_LEVELS` (its R31; R2, the governing-law arm).
- `connections`: `themeLegFindings` (C-81.1), asked of each leg (R6's function).
- `inquiry-grammar`: `leadLegFindings` (its R5, C-54.1), the one lead checker the action basis consults (K766: it leaves the catalogue when this module takes C-2.10).

### Invariants

- **R9** (was `actions` R38) Each check moves here as an invariant with its test (K6): C-2.10's action, counterparty, law, laws, tier-history, leg and ledger arms; C-6.1's `responds_to` arm; C-11.1; and the module holds, each `{check, where, translation}` with its number and translation unchanged and its `where` naming the site that raises it, the rows C-32.3, C-32.4, C-32.18, C-32.19 (and C-32.20, `actions` R5); C-33.3–C-33.9; C-72.1–C-72.8; C-73.1–C-73.5 (and C-73.6, R3); C-90.1–C-90.5 (and C-90.6, `actions` R28); C-94.1–C-94.11 (and C-94.12, `actions` R22); C-101 (`actions` R7); and C-117.1–C-117.4 and C-117.6–C-117.22 (`actions`' own refusals: R33, R43, R3, R13, R8, R9, R45, R46, R48, R52; C-117.20–.22 K899 (7)). `actions` mints them in its acts and reads them from here. C-117.5 (`PENDING_CLOCKS_BAD_BEFORE`) is `action-clocks`' (its R1; N428). A changed `where` was stamped by 1.50.0.
- **R10** Pure: nothing here reads or writes the record, the clock (beyond `ctx.nowMs`'s default) or the network; the same inputs give the same findings.
- **R11** No place is named in this module's behaviour or outward text; its tests include the test profile (`build/layers.md`, rule 3).

### Satisfies

- `BIO_State_Rules_Consistency_v1_5.md` §4.4 (the Action object, its lifecycle and clock).
- `BIO_Action_v0_1.md` (canon whole, K608): §3, §4 rules 2, 5, 6, 7, 12 and 13; the rulings Case Making §2 records (risk tier D-182, REC-214, the fee quote D-148, the governing laws D-149, REC-195, the records-request lifecycle D-147).
- DEC-13 (request for comment), DEC-14 (the action's own outcome), DEC-24 and DEC-49.
- `build/layers.md`, layer 9 and "No jurisdiction in the product".

### Suggestions

- **The move (rule 1, rule 3).** The job moves the catalogue's action share and copies `actions/checks.mjs` whole, then merges early; `actions`' job deletes its `checks.mjs` and re-points to this module. The catalogue's copies go once every importer reads this module: `affordances` and `instance-setup` re-point in layer 11 (later-layer tests), so the catalogue's copy of a name they read stays until their jobs or control-plane's last act. `leadLegFindings`, `LEAD_ID_RE`, `LEAD_CHECKS` and `checkLegExtentGrammar` leave the catalogue here once `actionBasisFindings` is this module's (K766).
- `action-clocks` reads `lawProposalLabel` from here (its `uses` gains this module).
- Tests: for a corpus of action documents, the findings are byte-identical, in order, to the catalogue's and `actions`' before the move (K585 (2)); each of R3–R7 gets a negative control; R6's arms from `actions`' DEC-13 tests; R9's rows by the catalogue-census arm.

## Open for Bob

None: the split is BOB's (K617, K653 BOB-2).
