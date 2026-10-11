# case-account (T42)

**Status** · session_013SsuCWXrqvdc7FcZ7KSRjJ · depth 2 · COMPLETE · handled B2

## J1 · REPORT

K2616's open point: record-core's `mintExhausted` `MINTED_OBJECT` table does NOT need `ACD` from this job: it already holds `ACD: "case account draft"` (`bio-plane/src/record-core/index.mjs`:108–112, T42-2a), and `OPAQUE_PREFIXES` reads `ACD` from record-grammar's `ID_TABLE` (`ids.mjs`:75, opaque, `legacy: 'sequential'`), so `allocId("ACD", year)` mints `ACD-<year>-<16 chars>` and answers `mintExhausted("ACD")` itself when 64 draws collide. Nothing to route.
Wording only, for BOB: my requirements' Uses names `record-core`'s `mintOpaqueId`; the plan's entry and my START say `allocId` (R55's opaque form). I mint through `allocId` (best reading; `mintOpaqueId` would draw the old four-digit shape). Uses may want `allocId` in place of `mintOpaqueId`.

## J2 · COMPLETE

**Entry applied: T42-22** (N839, K2542, K2608, K2614, K2616, K2670). `case-account` built by copy from `case-authoring` (`extraction/case-account-split.md` §2), R1–R12 all met; case-authoring's paths untouched. Commits b887dbaf76 (the module and its tests), ba808ad678 (tranche/T42 merged after B2).

**Fill in `modules.json` (K1043):** `paths`: `["bio-plane/src/case-account/"]`; `tests`: `["bio-plane/test/m/case-account/"]`. Its `uses` as they stand are exactly what the code and tests import (record-grammar, record-core, membership, inquiry, content, extraction, publication, case-grammar, ai-runs, case-disclosures); `test-support` is declared but unused.

**What the module is:**
- `index.mjs` (552 lines): the class `CaseAccount`, `caseAccountOf(host, deps)` (one per host; creates and declares its tables), `caseAccountOwns`. Services: `accountPropose`, `accountDrafts`, `accountFlags`, `accountDraftJudged`, `acceptanceRecorded({caseId, edition, drafted, by, at})` (answers `{ok, acceptance}`), `accountShaped` (both the export and an instance method, since case-authoring calls `this.account.accountShaped`), `accountJudged`, `citedFor`, `reviewCommentsChosen`, `registerReviewComments`. Constants exported as before (`ACCOUNT_FRAMINGS` etc.).
- `document.mjs`: `reviewCommentBodyLines`, unchanged (re-exported from `index.mjs`).
- `schema.mjs`: `CASE_ACCOUNT_SCHEMA` (the same DDL), `CASE_ACCOUNT_TABLES`, `migrateCaseAccount`.

**Changes from a pure copy, each required by the requirements:**
1. The label goes through `proposalLabel(by, kind)` (R1, R2); `#accountLabel` is not copied.
2. Ids are minted with `allocId("ACD", year)` (R55 opaque form: `ACD-<year>-<16>`). `MINT_EXHAUSTED` comes from `allocId` itself.
3. R1's refusal order: the text's `BAD_ACCOUNT_DRAFT` now comes before `BAD_ACCOUNT_FRAMING`, as R1 lists them. The old code checked the framing first; the two differ only when both are wrong.
4. R2's "words on one line": a flag whose text has a line break is now refused (the old code did not check this).
5. R12, no throw on another module's failed read: the `cases`/`case_documents` read in `#caseForDrafts` and the `basisFor` read for conclusions in `accountJudged` are now wrapped. They answer `NO_SUCH_CASE` (byte-identical to an absent case) and no legs. The rest were already wrapped in the copy.

**Deferred:** none.

**For the other modules (nothing broken now; for T42-23 and later):**
- case-authoring (T42-23): its fixture must not build `caseAuthoringOf` alongside `caseAccountOf` while case-authoring still declares `account_drafts`/`account_acceptances`. `declarePurge` refuses the whole list on `TABLE_DECLARED` (map §7). Its job removes the two from `CASE_AUTHORING_TABLES` in the same commit that creates `caseAccountOf` eagerly.
- case-authoring re-pointing: the five call sites map 1:1 to this module's public names (map §3). The acceptance write becomes `this.account.acceptanceRecorded({caseId: theCase, edition, drafted, by: who, at: when})`.
- No generated artifact made stale by this job beyond the plane bundle, which picks up the new files only once case-authoring or plane imports them (rule 4 (10) covers it).

**Tests:** `node --test bio-plane/test/m/case-account/`: 21 tests, 21 pass, 0 fail. There are 5 files (`fixture.mjs`, `drafts`, `judgment`, `comments`, `instance`).
- Every R1–R12 is named and tested at the interface, with a negative control for each refusal.
- R10 is checked with byte-identical arms. R9 rolls back a caller's transaction and checks that transact was called. R12 creates the module over pre-existing rows; R8 covers `declaredTables` and `purge`.
- The fixture imports only modules in `uses`. Provenance's, connections' and entities' tables, which promotion needs, are migrated through the instances that inquiry and case-disclosures already reach.
- Five deliberate mutations of the code were each caught (1–3 tests red each).

**Users' suites (P11):** case-authoring 181/0, review 45/0, control-plane 216/0, op-declarations 128/0, plane 166/0. No reds.

**Checks** (run with `modules.json` holding the paths above locally and uncommitted; `format` also run on the committed state):
- format: 147 modules, 146 requirements files; 0 failures
- architecture: 8 product files, 32 relative imports; 0 failures
- coverage: 12 of 12 live requirement ids named by a test; 0 failures
- ownership: 9 files changed by case-account between tranche/T42 and HEAD; 0 failures

**Reading set (K2304):**
- Read whole myself: JOB.md and the mechanics; `requirements/case-account.md`; `extraction/case-account-split.md`; layer 8's row and section of `layers.md`; my plan entry and the opening rules; rulings K2608, K2614, K2616, K624, K874, K1043, K2304.
- Also read whole myself: the code I copied (case-authoring `index.mjs` 1–400, 1235–1262, 1320–1530, 1655–1775, 2245–2256, 2950–2990; `schema.mjs`; `document.mjs` 640–676), record-core's minting (100–135, 425–520), record-grammar's `ids.mjs` 40–80, its `proposalLabel` and `acceptanceRecord`; case-authoring's `fixture.mjs` and `account.test.mjs`.
- A worker read the rest whole: the Provides of each used module, the Purpose of all 112 earlier modules, case-authoring's requirements, and review R33. It wrote a 24,690-byte summary for this task, with each statement citing file and line.

Size (session_013SsuCWXrqvdc7FcZ7KSRjJ): test runs 22, module lines 628
