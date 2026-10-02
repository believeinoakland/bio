# inquiry-grammar — requirements

**Status** · DRAFT by a worker for BOB #80, 2026-10-01, on `tranche/T19` before layer 6 starts, for BOB's review; taken from `legacy-checks` by K617 and K653 BOB-2 (inquiry's catalogue share would take `inquiry` past the 4,000 mark), placed directly before `inquiry` with `from: ["legacy-checks"]` (rule 3: moved straight from the legacy module, not copied), with no change to any requirement's meaning. R1 and R2 are `inquiry` R2 and R3, moved without change of meaning (each marked "was"); R8 is `inquiry` R38's share for the rows and arms that move here; each is retired in `inquiry.md` with a pointer here. R3 (C-15.1), R5 (C-54.1's checker) and R7 (the rows) state what the catalogue's code does today and had no requirement of their own; R4 names the leg grammar `inquiry` R4–R9 state, which stay `inquiry`'s at its grammar face; R6 is the registration rule 2 and record-grammar R28's slots (K751) need. Every id is not yet met until INQUIRY-GRAMMAR #1 moves the code (T19 layer 6). Layer 6. Code: `bio-plane/src/inquiry-grammar/`, moved from `bio-plane/checks/bio-checks.mjs` (`checkInquiryExtension`, `checkDividedExtension`, `checkGrounds`, `checkTestimonyLeg`, `checkEarnedLeg`, `checkInheritedLeg`, `checkInquiryBasis` without its `basisVersionFindings` call, `checkLegExtentGrammar`, `checkRecheckCoverage`, `supersedesEdgeFindings`, `divisionDisclosureFindings`, `leadLegFindings`, `LEAD_CHECKS`, `ENTITY_ID_RE`, `DATE_RE`, `EARNED_SOURCE_AXIS`, `GROUND_LABEL_RE`; the rows `NOT_INQUIRIES`, `SELF_BASIS`, `BASIS_CYCLE` of `ACT_SHAPE_CHECKS` and `MACHINE_CANNOT_DIVIDE`, `MACHINE_CANNOT_GROUND` of `MACHINE_FENCE_CHECKS`). AMENDED by BOB #87 at T21's opening (K933): the rows' heading names the table `INQUIRY_GRAMMAR_CHECKS` (its name since T20, K850) in place of the old name `INQUIRY_GRAMMAR_ROWS`, whose alias retires (N452; K899 (5)); R7's meaning is unchanged and no id is added.

**Size (P6).** About 1,400 lines moved and 60 written (`draft-T19.md`, layer 6). `inquiry` keeps about 3,700.

## Public

### Purpose

The grammar of an inquiry document as the record checks it: the entry requirements of each state and the division block (C-2.8), the leg grammar and its grounds, testimony, earned and inherited arms (C-2.8, C-6.3, C-21.2), a leg's part (C-45 through `content`), the supersession and division-disclosure arms of the references (C-6.1), the recheck coverage (C-15.1) and the lead checker every leg grammar consults (C-54.1). It also holds the rows `inquiry`'s acts mint for the inquiry's own refusals (C-33.13, C-33.22, C-33.23, C-32.7, C-32.8). It reads no record: every function is pure, and the facts a check needs (the published and earned registries) are handed to it.

### Provides

Terms. A **finding** is `record-grammar`'s (its R11): `{check, severity, message, repairs?, code?}`. **ctx** is `checkBundle`'s per-bundle context (record-grammar R39, R40): `fm` the parsed front matter, `files`, `publishedRegistry`, `earnedRegistry`. An **inquiry** is a document whose `object_type` normalises to `inquiry` (`normalizeType`, record-grammar).

**The entry arm: checkInquiryExtension(ctx, findings)** (record-grammar R28's `C-2.8` slot) Pure; never throws; pushes findings and answers nothing. For any document that is not an inquiry it pushes nothing.
- **R1** (was `inquiry` R2) Entry requirements (C-2.8): `surfaced_by` is `agent` or `human`; `deferred` and `dismissed` carry a non-empty `disposition_reason`; `concluded` carries a conclusion, at least one leg, and a falsifier accounted for: stated, or its absence recorded with both `falsifier_override_by` and `_at`, never both and never half (REC-117); `subject_entity`, when present, is an entity id; a finding's bytes name no case (CASE-5b).
- **R2** (was `inquiry` R3) `divided` requires a `division` block (a reason, `apportioned_by` a named member and not a machine, an ISO `at`, at least two distinct canonical children) and a `division_apportionment` giving every leg at least one home among those children, each child at least one leg, and each row's target equal to the leg's (C-2.8, R4 of Case Making).

**The recheck coverage: checkRecheckCoverage(ctx, findings)** (record-grammar R28's `C-15.1` slot) Pure; never throws.
- **R3** For an inquiry, in every state including `dismissed`: `recheck_triggers` absent, not a list, or empty is one `C-15.1` error; otherwise each trigger that is not an object carrying a non-empty `text` and a non-empty `description` is one `C-15.1` error naming its index, and each whose `date` is present and is not `YYYY-MM-DD` is one `C-15.1` error naming its index and the value. Any other document: nothing.

**The leg grammar: checkInquiryBasis(fm, findings, publishedRegistry, earnedRegistry), checkLegExtentGrammar(leg, label, checkId, findings), supersedesEdgeFindings(fm, findings), divisionDisclosureFindings(fm, findings), GROUND_LABEL_RE, EARNED_SOURCE_AXIS** Pure; never throw; each finding names its check.
- **R4** These judge exactly what `inquiry` R4–R9 state (the leg's target, vocabularies and grades, C-6.3, C-54.1 and the theme first; the leg's part; the earned and testimony arms; the inherited arm, C-21.2; the grounds, DEC-32; the supersession and division-disclosure arms, C-6.1), each finding the same in check, severity, message, repairs and code as the catalogue's before the move. `inquiry`'s grammar face re-exports each name, the same binding (`===`), so `inquiry` R4–R9 are met through it. `checkInquiryBasis` no longer calls `basisVersionFindings`: the version block is `basis-versions`' own grammar (its R43), run at R6's sub-slot where the call stood. `checkInquiryExtension` (R1, R2) calls `checkInquiryBasis` with `ctx`'s two registries, as today.

**The lead checker: leadLegFindings(label, leg, findings), LEAD_CHECKS** (C-54.1) Pure; never throws.
- **R5** A leg (any value; a non-object is read as an empty leg) whose `target` or `content_id`, trimmed, is a lead id (`observation-log`'s `LEAD_ID_RE`) gains one `C-54.1` error, code `LEAD_NOT_EVIDENCE`, naming `label`, the field and the value, the first such field only, and the answer is `true`; otherwise nothing is pushed and the answer is `false`. It is the one checker every leg grammar consults (this module's basis, `basis-versions`' version legs, the action basis), each skipping its own target complaint about a leg it answered `true` for. `LEAD_CHECKS.LEAD_NOT_EVIDENCE` is the row, `{check, where, translation}`, its number and translation unchanged.

**The registration** (rule 2; record-core R67; record-grammar R28, R40)
- **R6** At start, the module registers through record-core's grammar seam (`registerGrammar`, record-core R67) the arms of record-grammar R28's three slots it takes: `checkSupersession` (`C-6.1`: `supersedesEdgeFindings` then `divisionDisclosureFindings` over `ctx.fm`, for every document, at the end of the references arm), `checkRecheckCoverage` (`C-15.1`, R3) and `checkInquiryExtension` (`C-2.8`, R1, R2, R4), each slot claimed whole, in one registration (record-core R67, K766). Today the catalogue's C-2.8 arm runs `basisVersionFindings` inside itself, for an inquiry only, after the entry, division and subject-entity findings (R1, R2) and before the grounds and leg findings (R4); so the arm offers a sub-slot at exactly that place, and `basis-versions`' grammar, registered into the C-2.8 slot after this module's (its R43), runs there, never after the arm (P1). From then the catalogue's `LEGACY_GRAMMARS` fills neither `C-6.1` nor `C-15.1`, and the catalogue's own C-2.8 arm is gone. For every bundle, `checkBundle` called with `record.grammars()` answers the findings it answered before the move, identical in content and in order.

**The rows: INQUIRY_GRAMMAR_CHECKS** (DEC-49; K6)
- **R7** The module holds, each `{check, where, translation}` with its number and translation unchanged and its `where` naming the site that now raises it: `NOT_INQUIRIES` (C-33.13), `SELF_BASIS` (C-33.22), `BASIS_CYCLE` (C-33.23), `MACHINE_CANNOT_DIVIDE` (C-32.7), `MACHINE_CANNOT_GROUND` (C-32.8), and `LEAD_NOT_EVIDENCE` (C-54.1, R5). `inquiry` mints the first five in its acts (its R20, R11, R23, R27) and reads them from here. A changed `where` was stamped by 1.50.0.

## Private

### Uses

- `record-grammar`: `normalizeType`, `parseFrontmatter`, the finding shape, `BUNDLE_ID_RE`, `BASIS_ROLES`, `BASIS_GRADES`, `GRADE_AXES`, `GRADE_SOURCES`, `EARNED_CAPTURE_CEILING`, `TESTIMONY_GRADE`, `isMachineIdentity`, `ISO_TS_RE`, as T19's layer 1 moved them.
- `record-grammar`: the shared grammar names this module once read from the check catalogue (frontmatter, types, ids, actors, labels, grades, `SHARED_ACT_CHECKS`), re-pointed in T19 (rule 1); the catalogue rows it owned are in its own code (K808, K820).
- `text-chain`: the extent functions the leg's part is read through.
- `content`: `checkContentExtent` and its document-only context (C-45).
- `connections`: `themeLegFindings` (C-81.1), asked of each leg before any other complaint about it.
- `observation-log`: `LEAD_ID_RE` (R5).
- `record-core`: `registerGrammar` (its R67) for R6, and nothing else: no read or write of the record.

### Invariants

- **R8** (was `inquiry` R38's share) Each check moves here as an invariant with its test (K6): C-2.8 and C-21.2 as the grammar uses them, C-6.1's supersession and division arms, C-6.3, C-15.1, C-54.1, and the rows C-33.13, C-33.22, C-33.23, C-32.7, C-32.8. Promotion stamps them.
- **R9** Pure: apart from R6's registration, nothing here reads or writes the record, the clock or the network; the same inputs give the same findings.
- **R10** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_System_Design.md` §3, construct 8.
- `docs/architecture/BIO_Case_Making_v0_1.md`: the collapse, division 1–5, R1 (DEC-18), R2 (DEC-21), R4.
- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4 and its amendments.
- `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §3 (testimony grade), §5 (a lead is not evidence).
- DEC-12, DEC-15, DEC-18, DEC-21, DEC-32, REC-16, REC-117, CASE-5b.

### Suggestions

- **The move.** The job moves the names above from the catalogue, registers them (R6) and re-points `inquiry/grammar.mjs` to this module and record-grammar's `checkBundle`; the catalogue's copies go once every importer reads this module (rule 1). The catalogue's own grammars still call some of these names until their owners move them (`basisVersionFindings` until `basis-versions` in this layer; `actionBasisFindings` until `action-grammar`, layer 9), so a name they call stays in the catalogue until then.
- Tests: for a corpus of inquiry, information and project documents, `checkBundle` with the registration answers findings byte-identical, in order, to the catalogue's before the move (K585 (2), K640); each of R1–R5 gets a negative control; R6's registration is answered `{ok: true}` by record-core.
