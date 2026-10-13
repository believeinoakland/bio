# case-inputs (T47)

**Status** · session_01JhCwgpR5tXvnB2cSJcVRTT · depth 2 · COMPLETE · handled B1

## Completion

**Read, whole:** `build/requirements/case-inputs.md`; `build/extraction/case-authoring-split-2.md` (all of it, §2, §4, §6 among it); layer 8's contract and the T47 opening's table in `build/layers.md`; my entry T47-31, the rules at the opening and the L8 entries naming case-inputs in `build/plan/current.md`; the source I copied from, `case-authoring`'s `index.mjs`, `checks.mjs` and `schema.mjs` whole, and `document.mjs` lines 1–175 (the acknowledgement renderers and the head; the rest is `caseDocumentText`, which stays); `case-authoring`'s tests I ported (`statement`, `drafts`, `outcomes`, `openrequests`, `t46-words`, `waiting`, `invariants`, `fixture`) whole; every file of my own code and tests as written (P20). The public parts of my Uses (record-grammar, record-core, membership, publication, publish-schedule, case-grammar, case-account) I did not read whole myself, to stay under half my window: I read each service at its call site, my tests run against the real modules, and a helper read those public parts whole and checked every call and read against them. It found every call within its provider's stated contract but those listed under "Found in another module", and one caller obligation this module did not honour (publication R21's transaction), fixed below.

**Entries applied:** T47-31 (N908; K2982): `case-inputs` built by copy (split map §2), R1–R16, and R17 (N992; DEC-199).
- `src/case-inputs/`: `index.mjs` (the services, `caseInputsOf`, `caseInputsOps`), `checks.mjs` (`CASE_INPUTS_WORDS`, `fillWords`, `CARRIED_OUTCOME_CHECKS` C-136.3–.8, `STATEMENT_ACK_CHECKS` C-82.2–.8), `document.mjs` (`statementSha` and the list's renderers), `schema.mjs` (DDL unchanged, `CASE_INPUTS_*`, `migrateCaseInputs`). 1,322 lines with comments (the map said about 1,265).
- Copied unchanged in behaviour, each requirement id re-numbered in the comments, each `where` re-pointed to `src/case-inputs/index.mjs`. Checked byte for byte against case-authoring's exports before the tests: C-82 rows identical; C-136.3, .4, .6, .7, .8 identical; the renderers and `statementSha` identical.
- Made public as the map says: `statementWriter`, `pendingOutcomes`. New: `whatChangedDraftOf` (R7).
- `COMPLETENESS_MAX` copied as `CARRIED_TEXT_MAX` (K57). `carryOutcome` asks `accountShaped` of `case-account`'s instance on the host (R16's `account` dep), reached lazily.
- R17: `openRequestLine` keys every well-formed row (`line`, `noreply`, `notlaidout`, each with or without `nowindow.`); `OPEN_REQUESTS_UNREAD_SENTENCE` is `signing.openrequest.unread`'s words; C-136.5's row holds `refusal.BAD_CARRIED_OUTCOME` with `{field}` for the screen and each refusal answers it filled with the field named (ai-use's `AI_LIMIT_INVALID` form). All 13 words checked verbatim against `words.json`.
- A flaw fixed in my own copy (P8): `acknowledgeStatement` inserted its row and spliced the document's list (publication R21, which writes only inside its caller's transaction) with no transaction of its own, as case-authoring's did. It now runs as one `record.transact`, with the providers reached first so a lazily created one keeps its tables. A new R2 test (the splice failing writes nothing) fails without the fix and passes with it.
- Ruled myself (details, recorded here): `openRequestSentence` is not carried over, since R17 leaves no row to a plain sentence; `OPEN_REQUEST_KEYS` grows to seven keys (the six row keys and `unread`).

**Tests:** `bio-plane/test/m/case-inputs/`, 46 tests over a new `fixture.mjs` that builds this module alone, never case-authoring (map §3, §7 risk 1): an unsigned document is stored through `publication.storeCaseDocument` with the list and writer this module answers; a signed one by writing `case_documents`, `cases` and `published_cases` directly; a project as its `bundles` and owner rows; the review provider and `case_drafts` stood in, as case-authoring's fixture does. Files as the requirements suggest: `statement` (R1–R3, R5, R13, R14), `drafts` (R6, R7), `outcomes` (R9, R11), `openrequests` (R8, R10, R17), `t46-words` (R10, R12, R17), `waiting` (R4, through publish-schedule's real scheduling), `invariants` (R11, R15, R16). Every refusal has its control; R14 has identical-bytes arms; R16 checks the one instance per host, tables kept with their rows, declared once, and the three op arms.

**Deferred:** none.

**For BOB at merge (K1043):** `modules.json`'s row for case-inputs: `paths` `["bio-plane/src/case-inputs/"]`, `tests` `["bio-plane/test/m/case-inputs/"]`, and `uses` gaining `jurisdictions` (tests only: R15 reads the profiles' places through `jurisdictions`' `list`, as case-authoring's R30 test does; case-authoring already uses it). With that row, the checks below pass.

**Found in another module (for T47-32, T47-33 and the L9/L11 jobs):**
- `case-authoring`: its `openrequests.test.mjs` imports `openRequestSentence`, and its `t46-words.test.mjs` pins `OPEN_REQUEST_KEYS` at two keys; both go with the copies' delete. Its R34 sign step should take `openRequestLine` and `OPEN_REQUESTS_UNREAD_SENTENCE` from here; every line is now keyed, so a step that tested `key: null` changes.
- `record-grammar` R46: `ID_TABLE` has no row for `OUTC` (carried outcomes, T45), and its `WCD` row still names `case-authoring` as owner; both are now this module's mints.
- `record-core` R62: `mintExhausted` has no fixed sentence for `WCD` or `OUTC`, so an exhausted mint of either answers the generic detail (as it did in case-authoring).
- Wording only, for the providers' requirements: publication R40's list of `case_documents` readers and R23's doors (`statedEdition` is used, not named); case-grammar's public part names neither `SECTIONS` nor `OUTCOME_KINDS` (only `REAUTHORABLE_SECTIONS` and the kinds' values); membership R44 spells sight's levels in capitals while `sight` answers `"full"`.
- No generated artifact is staled by this merge: nothing in the plane imports `src/case-inputs/` until plane's L11 job.

**Tests and checks run:**
- case-inputs: `node --test test/m/case-inputs/`: tests 46, pass 46, fail 0.
- No provided service of another module changed, so no user's tests are owed (P11); this module has no users yet.
- With the `modules.json` row above set locally (not committed):
  - `node checks/format.mjs`: 168 modules, 167 requirements files; 0 failures.
  - `node checks/architecture.mjs . case-inputs`: 12 product files, 44 relative imports; 0 failures.
  - `node checks/coverage.mjs . case-inputs`: 17 of 17 live requirement ids named by a test; 0 failures.
  - `node checks/ownership.mjs . case-inputs tranche/T47`: 13 files changed; 0 failures.
  - `node checks/run.mjs`: architecture 3095 product files, 0 failures; coverage 43 failures, none case-inputs' (other modules' ids not yet met, rule 5 (1)); channels 0 failures.

Size (session_01JhCwgpR5tXvnB2cSJcVRTT): test runs 21, module lines 1322
