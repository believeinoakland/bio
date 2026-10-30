# Task summary · T53 · action-records

This summary stands for: the **action-records** block of `build/plan/current.md` (lines 280-283); the rows file `build/plan/T53-R1/action-records.md` (no trims file exists); `build/requirements/action-records.md` (whole); `build/layers.md` (head and layer 9's row); and each used module's Public Purpose, with the whole block of each named service: `record-core` (readFile, declarePurge, transact, stampInstant), `progressions` (readProgression), `standards` (standardRead, noSuchStandard), `civil-time` (isCalendarDate); Purpose only for `record-grammar`, `membership`, `provenance`, `action-grammar`, `test-support`, `project-roster`, `promotion`, `setup-words`, `jurisdictions`. The sources stay binding; read any cited section in full when the work touches it.

Layer 9 (Action, `build/layers.md`): the AI proposes and prepares and never files or sends; every deadline names its basis. A module uses earlier modules only (P4).

## Entries

- T53-290 · CAPABILITIES · CAPABILITIES rows; rows in `build/plan/T53-R1/action-records.md` (R21).
- T53-291 · K5565 · English in tests: its entry (touches the module's tests, R1-R10 arms and R20's `declared-ops.test.mjs`; §K5565). Draft: every module with sites carries one conversion entry, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`.
- Rows, `plan-T53-draft.md` (R21): **conformance** · C T52-29 · **actions** · C T52-30; N1257 R112 (two laws, two clocks; the zone named) · **filings** · C T52-31 · **action-plans** · C T52-32, T52-33 · **action-clocks** · N1257 R27 (the layer a list comes from) · **filing-templates** · N1257 R36 (a template's places may name layers) · all `capabilities/N1257-requirements-modules.md`; layer names in actions, action-records, action-grammar, action-clocks, filing-templates, filings (K5458), filing-templates' shared judge `[owed: BOB writes]` · `planning/plan-T53-capabilities.md` §A Layer 9.
- Rows, `plan-T53-capabilities.md` (R21): **action-records** R21 · **action-grammar** R31 · **action-clocks** R28, R29 (proposal and entry keep `layer`; a date never recomputed by a later layer) · **filing-templates** R37 · **filings** R71 · all N1257 layer-names. filings R29 is amended, no new id.
- Rows, `plan-T53-tests-english.md`, the entry for every module (K5565; its tests of R1-R21) · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; every test the job touches is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `CENSUS-RX.md` · Test: the words check's baseline loses the module's files, and the module's suite is green.
- Same file (§K5565): literal sites (CENSUS) A / B files (A: already a `words.json` value; B: inline only); regex sites (CENSUS-RX) A / B / C; counts before TESTS-SWEEP's conversions. "only this · <model>" (BOB #324, K3518): `haiku-5-5` where test-only, `sonnet-5-5` where a B site needs the module to give a key first. No other T53 entry, so K5565 gives the module a job in R1.
- Table row (K5565; its tests of R1-R21): layer 9 · action-records · literal A / B files 0 / 2 · regex A / B / C sites (files) 7 / 5 / 6 (3) · only this · sonnet-5-5.

## action-records (own requirements)

**Status** · Drafted on `tranche/T47` (K3027), split from `actions` by copy for size (K617, K624, K2982; N961; T47-37), meaning unchanged; each id names its `actions` source (T47-38). Last changed T50 (R17, R18 moved here, R19; K3635); not yet met (T50); R20 (T51); R21 (T53, not yet met: T53).

**Purpose** · What the group records about an action in records of their own, apart from the action's document (State Rules v1.5 §4.4; v0.2 rules 6, 15): the proposals a credential makes of an action's governing laws, risk tier and what a records request seeks, stored apart from the member's value and never it (DEC-24: a machine proposes, a member acts); and the members' side records: a sent entry received or served, the confidential scope, and promises made to people. `actions` reads each into its block (R25) and asks the four single-site judgments (R7-R10) at its acts, so each code keeps one site. It writes no action document, calls nothing of `actions`'.

**Terms** · As `actions`'. An **action** is a bundle whose type normalises to `action`; a **proposal** is a row stored apart, labelled, never the action's value. `viewer`, `author`, `proposer` are the control plane's stamps. Every refusal names `reason`; a catalogue-backed one carries `code`, `check` and `translation` (its row `action-grammar`'s, its R9).

### Public: proposals stored apart (`op=actionlawspropose`, `actionriskpropose`, `actionseekspropose`)

- R1 · `actionLawsPropose({target, laws, proposer, viewer})`: refusals in order `NO_AUTHOR` (no stamped proposer); `NO_TARGET`; R7's list refusals; `NO_SUCH_BUNDLE`; `NOT_AN_ACTION` (R18 turns the last two to `NO_SUCH_ACTION`). Any credential may propose; each `{level, citation, standard?}` entry may name a held standard, asked through R9. It replaces that proposer's standing proposal on the action, nobody else's, writes no file and never changes the list; it answers the proposal with its label (`action-grammar`'s `lawProposalLabel`: `machine_proposed`, `member_proposed` or `unstated`, with sentence), the list as it stands (`actions` R25), `evidence: false`, and a sentence saying it is not the list. `lawProposalsFor(id)` answers the standing proposals, newest first, at most `LAW_PROPOSALS_READ_MAX` (12) proposers, with `truncated` and a sentence also when empty; `actions` R25 shows them beside the list.
- R2 · `actionRiskPropose({target, tier, basis, proposer, viewer})`: `NO_AUTHOR`; `NO_TARGET`; `BAD_RISK_TIER` (R8); `RISK_PROPOSAL_BASIS_REFUSED` (empty, over `RISK_PROPOSAL_BASIS_MAX` (500), or a quote, backslash or line break); `NO_SUCH_BUNDLE`; `NOT_AN_ACTION` (R18). Any credential may propose; a proposer's restatement replaces its own proposal only. It writes no file and never touches `risk_tier` or its history; it answers the proposal labelled (machine work or a member's), the tier as held, `evidence: false`, and a sentence saying it is not the tier. `riskProposalsFor(id)` answers at most `RISK_PROPOSALS_READ_MAX` (12) standing proposals, newest first, with `truncated` and a sentence also when empty; `actions` R25 shows them.
- R3 · `actionSeeksPropose({target, seeks, proposer, viewer})`, as R1 is to `actions.actionLaws`: `NO_AUTHOR` (no stamped proposer); `NO_TARGET`; `NO_SUCH_BUNDLE`; `NOT_AN_ACTION` (R18); `action-grammar` R13's findings over the proposed `seeks` on the target (its wrong-kind finding for a target not a `records_request`), through R10 (`SEEKS_REFUSED`, C-117.29, every finding carried). Any credential may propose; a proposer's restatement replaces its own standing proposal on the action only. It writes no file and never changes `seeks`, and answers as R1 does (label `machine_proposed`, `member_proposed` or `unstated` with its sentence), `seeks` as held, `evidence: false`, and a sentence saying it is not the action's `seeks`. `seeksProposalsFor(id)` answers at most `SEEKS_PROPOSALS_READ_MAX` (12) standing proposals, newest first, with `truncated` and a sentence; `actions` R25 lists them beside `seeks`.

### Public: members' side records (`op=actionreceipt`, `actionscope`, `actionpromise`)

- R4 · `actionReceipt({target, ord, kind, at, how, party?, artifactSha? | account?, author, viewer})`: records that the `sent` entry at `ord` was received (`kind: "receipt"`) or served (`kind: "service"`, `party` naming the party served, 1 to `RECEIPT_TEXT_MAX` (200) characters); `at` a real date or local date-time (`YYYY-MM-DDTHH:MM`), `how` 1 to 200 characters, held as a capture the register holds or a member's account (`actions` R34's rule). Refusals in order: `MACHINE_CANNOT_CORRESPOND`; `NO_TARGET`; `BAD_DATE`; `CAPTURE_AND_TESTIMONY`; `NEITHER_CAPTURE_NOR_TESTIMONY`; `NO_SUCH_BUNDLE`; `NOT_AN_ACTION` (R18); `RECEIPT_NOT_ON_SENT` (the entry is not `sent`, or `kind` is neither of `RECEIPT_KINDS`); `UNREGISTERED_ARTIFACT`. A second record appends. `receiptsOf(id)` answers `[{ord, kind, at, how, party?, …}]`, oldest first, the latest last ; `actions.actionRead` answers them as `receipts`. Its own table, never rewriting the entry; `action-clocks` R2 reads it, through `actions.actionRead`, as the start where a rule counts from receipt or service. Control: a receipt on a `received` entry is refused.
- R5 · `actionScope({target, confidential, reason, author, viewer})`: a member who may see it sets (`true`) or removes (`false`) its confidential scope, with a reason (`actions` R14's text rule). Refusals in order: `MACHINE_CANNOT_SET_SCOPE`; `NO_TARGET`; `SCOPE_NO_REASON`; `BAD_REASON`; `NO_SUCH_BUNDLE`; `NOT_AN_ACTION` (R18); `SCOPE_UNCHANGED`. Each statement is appended (`by`, `at`, `reason`). `scopeOf(id)` answers the statements; `confidential(id)` whether the latest is confidential (false with none, K2850), which `actions.actionRead` and `actionsFor` answer as `confidential: true|false` and `actions` R66 reads. A confidential action is seen inside the group as before and never answered by `actions` R66 or any registration feeding published output; a change alters what R66 answers from then on and never a signed edition (`publication` R63), the answer saying so with `actions.scope.published_stays` (R14). Control: the same action with the scope removed is answered by R66 again.
- R6 · `actionPromise({target, kind, text, ends?, author, viewer})`: records a promise the group made to a person, `kind` of `PROMISE_KINDS` (`action-grammar` R2), `text` 1 to `PROMISE_TEXT_MAX` (500) characters, `ends` the position of an earlier promise this one ends (`text` its reason). Refusals in order: `MACHINE_CANNOT_RECORD_PROMISE`; `NO_TARGET`; `PROMISE_REFUSED` (kind, text, or an `ends` naming no standing promise); `NO_SUCH_BUNDLE`; `NOT_AN_ACTION` (R18). Appended, never edited. `promisesOf(id)` answers every promise, standing apart from ended; `actions.actionRead` answers them to every viewer who may see the action; nothing published carries one (`actions` R66).

### Public: the single-site judgments `actions` asks

- R7 · `lawEntries(laws)` judges a governing-laws list's shape, never the law, answering the parsed `{level, citation, standard?}` entries or the first refusal, in order: `NO_LAWS` (C-73.2, not a non-empty list; a string is parsed as JSON first); `TOO_MANY_LAWS` (C-73.5, over `GOVERNING_LAWS_MAX` (12)); `BAD_LAW_LEVEL` (C-73.3, with the index and the legal levels `LAW_LEVELS` holds); `BAD_CITATION` (C-73.4: empty, over `CITATION_MAX` (200) characters, a quote, backslash or line break, or an entry repeated at its level, case-folded). Writes nothing. The one site of C-73.2-C-73.5: R1 asks it, and `actions.actionLaws` (its R18) asks it.
- R8 · `badRiskTier(target, tier, who)` answers C-90.2 `BAD_RISK_TIER`, naming `target`, `tier` and `legal: [1, 2, 3]`, its detail saying `who` states a tier of 1, 2 or 3 and that undetermined is not a tier to set. The one site of C-90.2: R2 asks it, and `actions.actionRiskTier` (its R23) asks it.
- R9 · `standardSeen(id, viewer)` answers null when `id` is a `STD-` id the viewer may read (`standards.standardRead`), else `standards.noSuchStandard`'s one answer (`NO_SUCH_STANDARD`), absent and invisible alike; a read that throws is not seen. Writes nothing. R1 asks it, and `actions` asks it for a law's `standard` (its R64).
- R10 · `seeksRefusal(fm)` judges `fm.seeks` with `action-grammar.seeksFindings` (its R13), each distinct progression an item names read once through `progressions.readProgression` (its declared stage keys; a progression not held, or one that cannot be read, is read as not held, fail closed, and the refusal then carries `cause: "PROGRESSIONS_UNREADABLE"`), and answers null or the grammar's own refusal (C-117.29 `SEEKS_REFUSED`) with every finding. Writes nothing. R3 asks it, and `actions`' write fence (its R70) asks it.

### Public: the correspondence entry's one site (T48-47; N1024; K231, K3125)

- R16 · (amends R4; `actions` R101; `action-grammar` R29) This module holds the one site of five codes, each minted nowhere else in `actions` or here, each refusal carrying its row (`withRow`, `action-grammar`'s R9):
- R16 · `correspondFence(author, extra?)` answers null for a member's stamp, and C-32.4 `MACHINE_CANNOT_CORRESPOND` for an empty or machine one (`isMachineIdentity`). Pure.
- R16 · `correspondEntryRefusal({at, artifactSha, account, dateTime?}, extra?)` answers, first found, C-33.6 `BAD_DATE` (`at` not a real calendar date, `YYYY-MM-DD`; with `dateTime: true`, also accepted as `YYYY-MM-DDTHH:MM` on a real date), C-33.7 `CAPTURE_AND_TESTIMONY` (both a capture hash and an account), C-33.8 `NEITHER_CAPTURE_NOR_TESTIMONY` (neither), else null. Pure.
- R16 · `unregisteredArtifact(sha, extra?)` answers null when the register holds `sha` (the `register` read contract, as R4 reads it), and C-33.9 `UNREGISTERED_ARTIFACT` naming `artifact_sha` otherwise. Writes nothing.
- R16 · `extra` adds the caller's own fields (`target`, `at`, its own `detail`, the sentence for its act) and never replaces `reason`, `code`, `check` or `translation`.
- R16 · R4's `actionReceipt` answers these five conditions through them (`dateTime: true`), in R4's order, answers unchanged; `actions.actionCorrespond` calls them (its R101). Each function's region in `src/action-records/index.mjs` is its row's `where` (`action-grammar` R29).
- R16 · Controls: a machine author answers C-32.4; `2026-02-30` answers `BAD_DATE`, and `2026-02-28T09:30` does so only without `dateTime`; hash and account both: `CAPTURE_AND_TESTIMONY`; unregistered hash: `UNREGISTERED_ARTIFACT`; a well-formed entry answers null from each.
- R17 · (T50; K3230; `project-roster` R31, R32; amends R11, R12, R15) `actionStake({target, stake, author, viewer})` (`op=actionstake`): a member who may see the action states its own stake, apart from its project's. Refusals in order, each writing nothing: `MACHINE_CANNOT_SET_STAKE` (an empty or machine author); `NO_TARGET`; `STAKE_MALFORMED` (`stake` neither `null` nor trimmed text of 1 to 1,000 characters on one line with no control character); `NO_SUCH_ACTION` (R18). The stake fault is `project-roster`'s, asked through its exported `stakeFault({by, stake, of: "action"})` (its R31), never copied (one code, one site); its row C-147, `STAKE_MALFORMED` read for an action by `refusal.STAKE_MALFORMED.action` (K3635). `stake: null` clears it and the action falls back to its project's (`filings` R60). Each statement is appended `{stake, by, at}`, never edited. `stakeOf(id)` answers `{stake, set_by, set_at, history}` as `project-roster` R32 does (history oldest first; `set_by` a handle, the founder as `membership.founderHandle()`; `stake: null` with none; `"undetermined"` when unreadable, never `null`). Adds the table `action_stakes` to R11's (keyed by `bundle_id`, declared to purge; R11 now names seven), to R15's tables and ops map (`actionstake`), and `actionStake` to R12's list of what a machine never does. Test: a statement reads back with `set_by` and `set_at`; clearing answers `stake: null` and keeps the history. Control: a machine credential is refused, nothing written; 1,001 characters or a line break is `STAKE_MALFORMED`; an invisible action is `NO_SUCH_ACTION`.
- R18 · (T50; K3547; `actions` R43; amends R1 to R6, R17) The seven acts of R1 to R6 and R17 answer an action no one may see (absent, invisible, or a bundle that is not an action, alike and byte for byte) with `NO_SUCH_ACTION`, never `NO_SUCH_BUNDLE` or `NOT_AN_ACTION`, in the place those refusals held in each act's order. This module being earlier in the order than `actions`, the one site of the code is here: `noSuchAction(actionId, extra?)` is this module's, with R43's body and behaviour unchanged (its region the C-117.2 row's `where`, `action-grammar` R29), and `actions` re-exports it (`actions.noSuchAction` is the same function), so every later module's use stands. Test: each of the seven acts on an unknown id, a hidden action and a non-action bundle answers the same bytes with the action sentence. Control: an action the caller may see lands as before.
- R19 · (T50; K3317; DEC-239; `promotion` R1 to R20) `actionInquiry({action, question, author, viewer})` (`op=actioninquiry`): a member who may see an action opens a question in the action's project with the action carried as its reference, not as a leg (where the question comes from, not evidence in it). The member writes the question; nothing is filled from the action. Refusals in order, each writing nothing: `MACHINE_CANNOT_OPEN_FROM_ACTION` (an empty or machine author); `NO_TARGET`; `ACTION_INQUIRY_NO_QUESTION` (`question` absent, blank, over 500 characters, or holding a line break); `NO_SUCH_ACTION` (R18); `ACTION_NO_PROJECT` (the action belongs to no project); then any `promotion` refusal returned as its own (a caller not joined to the project among them). A creation through `promote` (state `open`, titled from the question, in the action's project) with one `derived_from` reference to the action noting who opened it; answers `{ok: true, inquiry, action, project}`. The action's document, legs and state are byte-identical afterward. Test: the question exists in the action's project with that reference and no leg onto the action. Control: a machine credential, a blank question and an invisible action are each refused, nothing written; an action in no project is `ACTION_NO_PROJECT`.

### Public: its ops map; its instance

- R15 · (K61; `case-account` R12's form; amended by R17) `actionRecordsOf(host, deps)` answers the one instance per host (every caller for the same host gets the same instance), its `deps` (`record`, `membership`, `progressions`, `standards`, `now`) reached lazily on the host unless given. At creation it creates its six tables (seven with R17's) with the DDL `actions` created them by (`CREATE TABLE IF NOT EXISTS`, `action_law_proposals`' `standard` column added where absent), so rows are kept with no data move, and declares them (R11); a refused declaration is thrown at creation and no instance is kept. `actions`' factory creates it at its own creation, so its tables exist and are declared at every boot. `actionRecordsOps(r, url, body)` publishes the ops map, one route arm per act, reading each argument as `actions`' map read it (the target from the query, else the body; the stamps from the query): `actionlawspropose` (R1), `actionriskpropose` (R2), `actionseekspropose` (R3), `actionreceipt` (R4), `actionscope` (R5), `actionpromise` (R6), `actionstake` (R17), each answering exactly what its act answers, a catalogue-backed refusal with its row (`withRow`). Op names, declarations, grades, help and `proposer` stamps unchanged; the plane spreads the map.

### Public: T53 additions

- R21 · (T53; N1257; K5458; amends R1, R11) *(not yet met: T53)* **A proposed law keeps its layer.** `action_law_proposals` (`action-records/schema.mjs:38-47`, keyed `bundle_id, proposed_by, ord`) gains a column `layer`, empty for rows written before; `lawPropose` (`op=actionlawspropose`) takes and stores it, `governing_laws_proposals` answers it, and a member's `actionLaws` that adopts a proposed entry carries its `layer` (`actions` R113). A proposal naming a citation two active layers give, with no `layer`, is stored as written and answered `layer: null` with `ambiguous: true`, never settled for the proposer. Test: a proposal with `layer` is answered with it; adopting it writes it into the governing law. Control: a proposal written before the change is answered as it was, `layer` absent.

### Private: Uses

- R10 · `record-grammar`: `parseFrontmatter`, `normalizeType`, `isMachineIdentity` (R16), `BUNDLE_ID_RE`.
- R11 · `record-core`: `stampInstant`, `transact`, `readFile`, `declarePurge`; the `bundles` and `files` read contract (its R37; an action's document).
- R1 · `membership`: `viewerPredicate` (every act's visibility).
- R1 · `action-grammar`: `lawProposalLabel`, `LAW_LEVELS`, `GOVERNING_LAWS_MAX`, `CITATION_MAX` (R1, R7), `RISK_TIERS`, `riskTierState` (R2, R8), `seeksFindings`, `seeksOf`, `SEEKS_MAX` (R3, R10), `PROMISE_KINDS` (R6), `governingLawsOf` (R1's answer), and its row families (R12; every refusal's row, its R9).
- R10 · `progressions`: `readProgression`. R9 · `standards`: `standardRead`, `noSuchStandard`. R4 · `civil-time`: `isCalendarDate`.
- R4 · `provenance`: the `register` read contract (its R48; R4's `UNREGISTERED_ARTIFACT`), read as `actions` reads it.
- R1 · `test-support`: the tests' fixtures.
- R1 · Its users: `actions` creates it and calls R1-R10 (its R18, R23, R25, R64, R66, R70) and R16 (its R101); `action-grammar`'s rows name its regions; `plane` spreads R15's map; `affordances`, `escalation`, `action-clocks` tests drive its acts.
- R21 · `jurisdictions` (T53; N1257, K5458): `nameResolve` (its R121), to tell a citation two active layers give. A new `modules.json` edge, BOB's; `jurisdictions` is layer 1, earlier.

### Private: Invariants

- R11 · (was `actions` R36; K4, K23) `action_law_proposals`, `action_risk_proposals`, `action_seeks_proposals`, `action_receipts`, `action_scopes`, `action_promises` (`ACTION_RECORDS_TABLES`) (plus `action_stakes`, R17: seven) are this module's, keyed by `bundle_id` and declared to `record-core`'s purge (`declarePurge("action-records", …)`). Every read answers an invisible action as an absent one.
- R12 · (copy of `actions` R33; DEC-24, DEC-49) A machine credential never records a receipt, sets a scope or records a promise (nor, R17, states a stake); it may propose laws, a tier and what a request seeks, each stored apart and labelled, never the action's value.
- R13 · (copy of `actions` R39) No place is named in this module's behaviour or outward text; its tests include the test profile (`build/layers.md`, rule 3).
- R14 · (copy of `actions` R99; DEC-194; N913) The sentence R5 answers beside a changed scope is `actions.scope.published_stays`, answered with that key and the words `words.json` holds for it, read by key, never a copy. Its refusal rows are `action-grammar`'s (its R9), their `where`s naming `src/action-records/index.mjs` (C-73.2-C-73.5, C-90.2, the receipt, scope, promise and risk-basis rows).
- R20 · (T51; K4168; op-declarations R80, R81; op-grades R49, R50) **The module declares the ops it serves that the screens send.** `DECLARED_OPS` is exported beside the ops map: a frozen object keyed by the op's door name, each row `{classes, machineClasses?, mutating, weight, description, fields: {accepts, requires}}`, class, weight and description copied from the op's existing rows and fields read from the arm whole (the stamps and the shell's `reason` are not accepts unless the arm reads a `reason` of its own): `actionlawspropose`, `actionscope`, `actionstake`, `actioninquiry`. Test: `declaredOpHolds` for each: only its requires, without each, a field outside its accepts (`declared-ops.test.mjs`).

### Private: Satisfies

- R1 · `BIO_State_Rules_Consistency_v1_5.md` §4.4; `BIO_Action_v0_1.md` §2 (laws D-149, REC-195; tier D-182, REC-214): R1, R2, R7, R8.
- R4 · `BIO_Action_v0_2.md` (K2780) §4 rules 6 (receipt as a fact) and 15 (confidential scope; promises seen by every participant), §6 `confidential`: R4-R6.
- R1 · DEC-24 and DEC-49 (a machine proposes, a member acts; one code, one site): R1-R3, R7-R10, R12; R16 (K231; N1024). H30 (1), K2505, K2561 (what a request seeks): R3, R10.
- R11 · N961 (`actions`' split for size, K617; the map adopted, K2982): R11, R15.

### Private: Suggestions

- R1 · **The copy (K624; the map's §2).** From `actions/index.mjs`: the constants, the four judgments (each made public, body unchanged, N529's form), the six acts and reads, `PROPOSAL_SAYS`, `proposalLabelFor`, the six ops; from `schema.mjs` the six tables and `migrate()`'s `standard` column. Copied (K57): `#visibleAction`, `#heldFm`, `#rows`, `#one`, `#nowMs`, `withRow`, the key `actions.scope.published_stays`. The prototype wrapper lists the six acts. No refusal code, text or bound changes; the DEC-49 REGION markers move with their code.
- R15 · **Who creates it (the map's §7 risk 1).** Nothing composes `action-records` until `actions`' job creates it in its factory and drops the six tables from `ACTIONS_TABLES` in the same commit; this module's tests build it alone, an action being a bundle written directly through the record.
- R1 · **Tests** (`bio-plane/test/m/action-records/`, the map's §6): `acts.test.mjs` (R1, R2), `t41.test.mjs` (R3), `t45.test.mjs` (R4-R6) arms; R7-R10 each by name with a negative control; R11 the tables declared once; R15 the same instance per host. The read arms, R66's confidential control and R18, R23, R70's refusals through `actions`' own acts stay with `actions`.
- R4 · **`provenance`.** `modules.json`'s row names no `provenance` edge though R4 reads the register as `actions` does; the job adds it at its START if the use check asks a read contract's edge.

## Uses: record-grammar

Purpose: the record's shared grammar: ids and types, front-matter parser, canonical JSON, actor identity, grades, the one SHA-256; no store, network or clock (R16).

## Uses: record-core

Purpose: owns the record's storage: id allocation, leases, append-only history and manifest, and purge; no member, capability or fence (`membership`'s), no promotion write path (`promotion`'s).

`readFile(bundleId, path) → {text, sha256}` or `{blobSha, bytes, sha256}` or null
- R13 · Returns the file's live content when stored inline, or its blob reference (never its bytes) when stored as a blob, from this module's own tables alone.
- R14 · Returns `null` when the bundle or the path is not held. Never throws.

`declarePurge(module, tables, {exempt?}) → void`
- R21 · A module that owns tables declares them once, at start, through `declareTable(module, entries)`, one entry per table naming its classes: `purge` (`clear` or `exempt`), `expunge` (`tombstone` or `none`), `export` (`yes`, `admin-only`, `never`), `sight` (`group`, `bundle`, `source`, `owner`), `derive` (`stored` or `derived-rebuildable`), `version_chain`. A missing class or one outside these is refused `TABLE_CLASS_MISSING` or `TABLE_CLASS_UNKNOWN`, registering nothing. `declarePurge(module, tables, {exempt?})` is the default form: `purge` `exempt` when listed in `exempt`, else `clear`; `expunge` `none`; `export` `admin-only`; `sight` `bundle` when keyed to a bundle, else `group`; `derive` `stored`; `version_chain` `false`. `purge` clears every declared table whose `purge` is `clear`. `declaredTables()` answers every declaration in order. Declared twice, or by two modules: `TABLE_DECLARED`.
- R46 · A declared table is a name, keyed to a bundle by its `bundle_id` column when it has one, or `{name, keys: [columns], whole: "<WHERE clause>"}` (K61); under `declareTable` the same fields sit beside the classes (`{name, keys?, whole?, clears?, purge, …}`).

`transact(fn) → fn's result`
- R32 · Runs `fn` as one transaction over the whole store: when `fn` throws or returns a refusal (`ok:false`), every row written inside it, in any module's tables, is rolled back, and no id allocated inside is spent. A nested call joins the outer transaction; one that throws or refuses rolls back its own writes and ids (a savepoint). Rethrows what `fn` throws, after the rollback.

`stampInstant(precision, when?) → string; instantOrder(a, b) → number` (N58, K85)
- R47 · `stampInstant` spells the instant `when` (ms since the epoch, default now) in UTC as ISO 8601: `"second"` gives `YYYY-MM-DDTHH:MM:SSZ`, `"millisecond"` gives `YYYY-MM-DDTHH:MM:SS.sssZ`; any other precision throws, naming it.
- R48 · `instantOrder` compares two instants in either spelling as instants, never strings: negative, zero or positive, NaN when either side is not a non-empty readable instant. Never throws.

## Uses: membership

Purpose: owns who the members are and what each may do, and projects as working groups at their setup, what a caller may see of one and the fence on who may act in it; roster reads and votes are `project-roster`'s, credentials `credentials`'. Used for `viewerPredicate` (R1-R6, visibility).

## Uses: provenance

Purpose: the record's trust root: the register (the one home of each captured byte sequence), acquisition receipts, capture grades, and a member's firsthand observation. Used for the `register` read contract (R4, R16).

## Uses: action-grammar

Purpose: the pure grammar of an action document as the record checks it (vocabularies, C-2.10's arms, C-6.1, C-11.1, readers, the rows `actions`' acts mint), the T45 field grammar and phrasing lists with their finder. Reads no record; whether a write lands is `actions`' (its R1-R11, R33).

## Uses: progressions

Purpose: a progression is a group's declared flow for one kind of happening (ordered stages, timing, required or not); an instance threads captured documents through it, and the record derives on every read, never stored, its grade and its missing and overdue stages.

`readProgression({progressionKey, version?}) → definition or refusal` (`op=progression`)
- R5 · `NO_KEY`; a key never declared answers `found: false`, not a refusal. Otherwise the requested version (default the current) with its label, note, declarer, instant, basis and stages in order, `current`, `current_version`, and every version held with its declarer, instant and basis. A version not held is `PROGRESSION_VERSION_NOT_HELD` (C-100.8; N285) naming the versions held.

## Uses: standards

Purpose: a standard is what a government act is measured against; held as content with citation, kind, issuer, source and period in force; says which were in force at a date; judges nothing about an act (`conformance`) or a standard's merit.

`standardRead({id, viewer}) → answer or refusal`; `standardsIn({at?, kind?, source?, cite?, after?, limit?, viewer}) → {items, cursor, truncated}`
- R5 · `standardRead` answers R1's fields, R3's source, declarer and time, what it supersedes and is superseded by, and each text content id's standing (`content.standings`) and `content.passageNotice`. `STANDARD_NO_ID` (C-112.11; K369); an absent id, and any id for a viewer naming no member, is `NO_SUCH_STANDARD`, one answer (R17).
- R6 · `supersedes` names an earlier standard, which stays readable; both reads name the link. A standard is superseded by at most one; a second is refused `STANDARD_ALREADY_SUPERSEDED`, naming the first.
- R7 · `inForce(id, date) → "in_force" | "not_in_force" | "undetermined"`, with why: `not_in_force` only when a stated bound excludes the date; `undetermined` when a bound needed is null; never a default. An alias of R20's `inForceAt({standard: id, date})`, answering exactly its state and why, `overridden` (R38) included (`IN_FORCE_STATES`, four, K1973). Where it rests on a "known to be in force through" record (R50) it also carries `known_through: {through, source: {captureSha, extent}, by}`.
- R8 · `standardsIn` lists the standards the filters admit, in id order, at most 200 per page (a lower `limit` honoured, a higher not), `truncated` measured by reading one past the page. With `at`, each is listed with R7's answer for that date and `not_in_force` ones are left out.

`noSuchStandard(standardId, extra?) → refusal` (N309, K231, K275)
- R17 · The one answer to one condition: no standard the caller may read answers to `standardId` (absent, or any id for a viewer naming no member; R5). It answers `{ok: false, reason: "NO_SUCH_STANDARD", code: "NO_SUCH_STANDARD", check, translation, standard, detail}`: `standard` the id as asked (null when none), `detail` one fixed sentence, `check` and `translation` its row's (C-112.10; conformance's C-113.9 gives way). `extra` adds fields and never replaces these. R5 answers through it, as does every later module's act answering this condition (`conformance` R1; `filings` R14). Writes nothing, never throws.

## Uses: civil-time

Purpose: the pure civil-time engine (local days, date-times, EDTF bands, rules counted the law's way, due dates, recurrences, `validAt`); no store, network or clock.

`isCalendarDate(s) → boolean`
- R6 · `true` only for a `YYYY-MM-DD` naming a real day of the proleptic Gregorian calendar (`2024-02-29` yes, `2026-02-31` and `2026-13-01` no).

## Uses: test-support

Purpose: gives any test process a temporary-file sandbox and standard output that cannot lose a test's final tally; writes ZIP archives in memory; shared generators and doubles. Used for the tests' fixtures (R13).

## Uses: project-roster

Purpose: owns the acts on a project's working group after its setup (roster, removals, owners' votes, rescue, visibility history, directory, requests to join); the fence and participation record stay `membership`'s. R17 asks its `stakeFault` (its R31) and mirrors its R32.

## Uses: promotion

Purpose: the one write path by which a bundle enters or changes in the record (compare-and-swap, append-only history, a whole promotion refused when any rule fails); also runs the check catalogue at ratification. R19 creates through `promote`.

## Uses: setup-words

Purpose: the interface's word list as frozen data (key, English, note, meaning, protected mark); imports and reads nothing. See R14, §K5565.

## Uses: jurisdictions

Purpose: holds the jurisdiction profiles, every local fact as data with its measurement; no other module names a place (`build/layers.md`, R13). `nameResolve` (its R121), R21.
