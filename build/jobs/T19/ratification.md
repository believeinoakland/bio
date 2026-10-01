# ratification (T19)

**Status** · session_01VqW5znMDGzJqRjUUs7YWJz · depth 2 · COMPLETE · handled B2

## Completion (RATIFICATION #11)

**Entries applied** (`build/plan/current.md` layer 8, ratification, amended; B1, B2 = K826):
- **`op=retire` (BOB-3; R28–R31, R33).** New `src/ratification/retire.mjs`: `Store.retire`, `#retirementCitedBy` and `EDGE_REASON_MAX` moved from `store.mjs` with their comments, behaviour unchanged. The live citers are `connections.citesInto(id).confirmed`; the `CITED` detail is `promotion`'s `RETIRE_CITED_DETAIL` (the store's own copy of the words is gone). `EDGE_REASON_MAX` (160) is exported by the module, as `RELEASE_ACK_MAX` is.
- **One per-member write (an improvement).** The release and the retirement spliced a document the same way in two copies. `release.mjs` now has one `moveMember` (state_history entry, the three scalars, the Session Log entry, carried files, one `promote`), and both call it. The release's answers are byte-identical (its 15 tests unchanged and green).
- **R32.** `ratificationOps` gains `retire` (the query's `handle`, `reason`, `viewer`, `owner`, `author`, never the body). `Ratification#retire` reaches connections and retrieval on its host, or a test's own.
- **Rule 5 (legacy-store's share), pure removal:** from `store.mjs`, `retire`, `static EDGE_REASON_MAX`, `static RETIRE_CITED_DETAIL`, `#retirementCitedBy`, `#appendStateHistory`, `#setScalar`, `#rand`, the stray comment above them, the explicit `retire:` route arm (the spread of `ratificationOps` answers it, K671), and the import line of `parseFrontmatter`, `createSha256`, `normalizeType` (no reader left). 0 lines added, 197 removed.
- **Mint seeds (K783, record-core R70).** `ratificationOf` registers `[["CASE","cases","case_id"],["CASE","case_documents","case_id"]]` once at creation; a refused registration throws (a wiring fault).
- **`attestingKeys` to credentials (K757).** `gateFacts`' signers and R18's `NO_ATTESTING_KEY` read `credentials.attestingKeys()` (its R11), reached on the host or passed as `credentials`.
- **Rule 1.** `index.mjs`, `ops.mjs`, `checks.mjs`, `release.mjs` and the new `retire.mjs` import record-grammar (`parseFrontmatter`, `normalizeType`, `isMachineIdentity`, `MACHINE_CLASS_PREFIX`, `isPublicHttpsLocator`, `createSha256`, `ISO_TS_RE`, `BUNDLE_ID_RE`, `BASIS_GRADES`, `GRADE_AXES`: the same bindings, checked). Tests: `case-commit`, `converted-a`, `converted-b`, `release` re-pointed to record-grammar; `converted-c`'s `CASE_AUTHORITY_CHECKS`, `PROJECT_AUTHORITY_CHECKS` to membership's; `checks.test.mjs` reads record-grammar (`parseFrontmatter`, `isCaseMemberBytes`, and `checkBundle` with `world().record.grammars()`, with a negative control that the record runs a C-2.8 grammar and that it was asked). Its catalogue-absence arms became `familiesHolding`, which walks this module's own row families: each moved code has exactly one home, and C-32.1 is found in `RELEASE_CHECKS` (negative control). No ratification file imports `bio-checks.mjs`.
- **K789.** The fixture builds `credentialsOf(host, {record, membership}).migrate()` after membership's tables and hands `credentials` to `ratificationOf`. The 80 `no such table: signers` reds are gone.
- **K790, K826.** The fixture registers inquiry-grammar's grammar on its record (`registerInquiryGrammar(record)`); `converted-c`:226 and `converted-d`:479 see C-2.8's case-key arm and pass.
- **K781 (4).** `release.test.mjs`' crucial test: the setup now records the N425 fact (a document saying `crucial` is recorded `crucial`) and sets the pre-N425 row by hand; the `CRUCIAL_IN_BATCH` verdict is unchanged.
- **K720.** The refuse-gate retire arm (a query selection swapped at a constant count is SET_MOVED and moves nothing; a fresh one retires) is in `retire.test.mjs` at this module's interface. `test/m/legacy-store/retire.test.mjs` is untouched (K619) and still passes through the spread.

**Requirements met, each with its test** (`bio-plane/test/m/ratification/`; marks for BOB to strike, K775 (6)):
- R28: `retire.test.mjs` "R28: the trimmed reason …" (every empty and bad shape, the exact detail, 160 passes, nothing read first).
- R29: `retire.test.mjs` "R29: the selection's refusal …", "R29, R33 (refuse-gate, K674 (4), K720) …", "R29: … EMPTY_SELECTION …", "R29, R33: the set is refused whole … CITED with promotion's RETIRE_CITED_DETAIL …", "R29: a member the record no longer holds …", "R29, R33: an edge severed … does not block".
- R30: `retire.test.mjs` "R30, R31: every member is retired …", "R30: with no author stamped … `member`; … no Session Log …", "R30, R33: … NO_DOCUMENT … UNSPLICEABLE_STATE_HISTORY … promote …".
- R31: `retire.test.mjs` "R30, R31: …" (the answer's keys in order).
- R32 (the `retire` entry): `retire.test.mjs` "R32: the ops map answers retire beside the other six …" (all seven keys; query, never body).
- R33: the four R29/R30 tests named R33 (whole set before any move; only verified Information no live edge cites).
- R7 and R18, R19 (now over credentials): `converted-a.test.mjs` "R4, R7 (signer-enrolment §4) …", `finding-commit.test.mjs` "R7: gateFacts …", `preflight.test.mjs` "R18, R19: NO_ATTESTING_KEY …".
- record-core R70 for this module's seeds: `registration.test.mjs` "record-core R70 (K783) …" (registered once; a `cases`-only and a `case_documents`-only id each learned).
- Every other live R stays met by its existing test: 33 of 33 named.

**Found in other modules** (each the owner's):
- **legacy-tests: `test/refuse-gate.test.mjs`** reads `store.mjs`' source text. Its walk "the refuse-weight callers … are found, and named" was already red at base (it expects `release`, which left in T18) and now finds no `retire` either. Its REACH (iii) stripper looks for retire's text in `STORE_SRC` and throws "MATCHED NOTHING", which ends the suite there (60 pass, 1 fail, then the throw). The behaviour it guarded is held here (`retire.test.mjs`: the gate answers SET_MOVED and nothing moves). The fix: retire walk C and REACH (iii) with the move, or re-point them to read `src/ratification/retire.mjs` and `release.mjs` (their callers are `retrieval.selectionResolve(...)`, not `this.`).
- **legacy-store: `store.mjs`.** `stampInstant` in the record-core import line is now unused. I left it, to keep my change a pure removal. `#MINT_LEDGER_LIVE`'s `["CASE","cases","case_id"]` and `["CASE","case_documents","case_id"]` now duplicate my registered seed (harmless: `INSERT OR IGNORE`). They can go once `test/mint-ledger.test.mjs` S8 (legacy-tests) reads `registerMintSeed(` literals as well as the store's list and `seedMintLedger([...])`. `test/m/legacy-store/retire.test.mjs` can be deleted by legacy-store's job (the arm is held here).
- **case-authoring: `test/m/case-authoring/preflight.test.mjs` "R34: against the real ratification R18 …"** is red identically at base (`tranche/T19` worktree) and at my HEAD. Its world builds ratification with no credentials, so R18's attesting-key read meets no `signers` table and answers `PREFLIGHT_UNDETERMINED`. The fix is K789's: its fixture runs `credentialsOf(host, {record, membership}).migrate()` and hands `credentials` to `ratificationOf`.
- **affordances:** its 4 reds (three R19 `reasoned` tests and "R8 R18: contradictionresolve …") are identical at base and at HEAD; not caused by this job (INTENT #7 reported the R19 pair).
- **Requirements wording (BOB's):** R18 names `membership.attestingKeys` and Uses' `membership` line lists `attestingKeys`; both are credentials' now (K757; credentials R11). Uses has no `credentials` line, and its `connections` line still says "not declared: T19 layer 8". The Suggestions' "Bulk retirement" paragraph is now done.
- **Generated artifact:** the bio-plane bundle is stale (`store.mjs` and ratification changed); regenerated at the close (§14).

**Deferred.** `gateFacts`' `dangling` list still reads connections' `refs` in its own SQL (reported since T8: connections states no read contract for it). Now that connections is in `uses`, a connections service for a bundle's dangling references would replace it; that is connections' to provide first.

**Tests and checks:**
- Module: `node --test test/m/ratification/`: 181 tests, 181 pass, 0 fail (168 tests, 81 fail at the start: 80 K789, 1 K781 (4)).
- Modules that reach what I changed: `test/m/legacy-store/` 4 pass, 0 fail; `test/m/case-authoring/` 78 pass, 1 fail, and `test/m/affordances/` 119 pass, 4 fail, both identical at `tranche/T19` (see above).
- Old suite read: `test/refuse-gate.test.mjs` (see above).
- Layer tests: none named.
- `format`: 87 modules, 82 requirements files, 0 failures.
- `architecture ratification`: 22 product files, 97 relative imports, 0 failures (after K826's `uses`).
- `coverage ratification`: 33 of 33 live ids named, 0 failures.
- `ownership ratification tranche/T19`: 20 files; legacy-store 0 added, 197 removed; legacy-checks and legacy-index 0; 0 failures.

Size (session_01VqW5znMDGzJqRjUUs7YWJz): test runs 26, module lines 3759

## J1 · QUESTION

K790 asks my test world to register inquiry-grammar's grammar on its record (record-core R67), so `converted-c.test.mjs`:226 and `converted-d.test.mjs`:479 see C-2.8's case-key arm at op=ratify; your B1 also has `checks.test.mjs`:224 run record-grammar's `checkBundle` "with the record's grammars". The only way in is `registerInquiryGrammar(record)` (or `INQUIRY_GRAMMARS`) from `src/inquiry-grammar/index.mjs`: `inquiry` re-exports `checkInquiryExtension` but neither the registration nor the grammar object, and `inquiryOf` does not register it. ratification's `uses` in `modules.json` lacks `inquiry-grammar`, so the architecture check would refuse the import.

My best reading: `uses` gains `inquiry-grammar` (earlier, L6; your edge, like credentials and connections), used by the test fixture only (`registerInquiryGrammar(w.record)` in `world()`), and the Uses list in `build/requirements/ratification.md` names it for the tests. I am building on that reading now and will run the architecture check against it once you answer; if you prefer another route (e.g. inquiry re-exporting the registration), say which and I will re-point.
