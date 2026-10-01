# intent (T19)

**Status** · session_01FGB25wChLZQHKs6mFKcZPg · depth 2 · RUNNING until 2026-10-01T09:24:24Z (node --test test/m/ (HEAD and tranche base)) · handled B2

## Completion (INTENT #7)

**Entries applied** (`build/plan/current.md` layer 7, intent, amended; N433; B1, B2 = K822):
- **R29, the move.** New `src/intent/grammar.mjs`: the catalogue's `checkProjectExtension` (C-2.9's `workproduct_state`, `evaluations`, `closed_reason` arms and C-9.1, the readiness ladder), moved unchanged: the same findings, messages, repairs and order. Its one shared name, `ISO_TS_RE`, comes from record-grammar. Exports: `PROJECT_GRAMMAR` (`{module: "intent", ids: ["C-2.9", "C-9.1"], arm}`), `WORKPRODUCT_STATES`, `CLOSED_REASONS` and `registerProjectGrammar(record)`, which registers once per record through record-core's `registerGrammar` (R67) and throws on a refusal, as capture's, promotion's and inquiry-grammar's do. `intentOf` calls it at start, so the grammar claims record-grammar R28's `checkProjectExtension` slot whole and is the slot's only claimant. R1's objective arm stays this module's promotion check and audit check.
- **Catalogue (legacy-checks), rule 2.** `checkProjectExtension` and its `LEGACY_GRAMMARS` entry are deleted; `LEGACY_GRAMMARS` keeps C-2.7 only. Over the repository, nothing else called the function (outside `dist/`, `release/` and generated bundles). The net change is 0 lines added and 42 removed; no comment lines were edited (see "Found in other modules").
- **R30, R22.** C-111.4, C-111.6 and C-111.13 now answer `INTENT_NO_SUCH_PROGRESSION`, `INTENT_BAD_STAGE` and `INTENT_NO_REASON`. Each row keeps its number, translation and `where`. intent no longer answers `NO_SUCH_PROGRESSION`, `BAD_STAGE` or `NO_REASON`; those remain progressions' C-100.11, C-100.14 and C-100.18. `INTENT_NO_REASON` covers every reason-less refusal: R8 `closeGoal`, R10 `departFrom`, R16 defer and dismiss (K822), and R26's registered check on a goal closed with no reason.
- **Awaiting stamp** (the three codes changed; numbers, translations and `where`s unchanged):
  - C-111.4 INTENT_NO_SUCH_PROGRESSION awaiting stamp
  - C-111.6 INTENT_BAD_STAGE awaiting stamp
  - C-111.13 INTENT_NO_REASON awaiting stamp
  - The departed codes are C-111.4 NO_SUCH_PROGRESSION, C-111.6 BAD_STAGE and C-111.13 NO_REASON.
- **Rule 1.** These now import from record-grammar: `doc.mjs` (`parseFrontmatter`, `deriveInquiryTitle`, `BASIS_GRADES`), `index.mjs` (`isMachineIdentity`, `normalizeType`) and `test/m/intent/fixture.mjs` (`parseFrontmatter`). `objective.test.mjs` and `pursuits.test.mjs` call record-grammar's `checkBundle` with `w.record.grammars()`. No intent file imports `bio-checks.mjs`.
- **K789.** The fixture builds `credentialsOf(host, {record, membership}).migrate()` after membership's tables, and the R9 test claims the instance through `credentials.claim` (`uses` already lists credentials). Its red is gone.

**Requirements met, each with its test** (`bio-plane/test/m/intent/`):
- R29: `grammar.test.mjs`, six tests:
  - registration (once, the slot's only claimant, a stand-in left alone, a refusal throws);
  - `workproduct_state`;
  - `evaluations`;
  - `closed_reason`;
  - the ladder (all 64 rung and pass combinations);
  - the findings' order and their contiguous run at the slot's place.
  Plus the audit test "R29 R22". A negative control was run: a mutated ladder failed 2 tests, and an unregistered grammar failed 7.
- R30: `grammar.test.mjs` "R30 R2 R8 R10 R22": rows, numbers and translations; progressions holds the old codes alone; every act answers through its own code, raw promotions included; nothing is written.
- R2: the same test, plus `objective.test.mjs` "R2 setCondition's refusals, in order" and "R2 success … a raw promotion".
- R8: the same test, plus `pursuits.test.mjs` "R8 declareGoal…".
- R10: the same test, plus `pursuits.test.mjs` "R10 …".
- R22: `objective.test.mjs` "R22 C-2.9's objective arm moved…" (every row named, and no others), plus the R29 audit test.
- Every other R stays met by its existing test: 30 of 30 live ids are named.

**Found in other modules** (each is the owner's to fix):
- **affordances.** `src/affordances.mjs`:486 `JUSTIFICATION_REFUSALS` lists `NO_REASON` and not `INTENT_NO_REASON`. Two affordances tests go red at my HEAD:
  - `backing.test.mjs` "R19: triage, graded `reasoned` (K219)…";
  - `plane.test.mjs` "R19: the reasoned registry, progression and theme acts, and intent's three…".
  The fix is to add `"INTENT_NO_REASON"` beside `NO_LESSON`. reevaluation's N433 rename may need the same.
- **legacy-tests.** `civicos-ui/check-semantics.mjs` UI-16 reads `const WS = [...]` from the catalogue's source. It now fails "could not read the catalog's workproduct_state list" (a release-only suite, already red for other reasons). The fix is to read intent's exported `WORKPRODUCT_STATES` (`src/intent/grammar.mjs`, same order) instead. `bio-plane/test/system/check-firing.test.mjs` (an old suite) proves C-2.9 and C-9.1 through the catalogue's wrapper with no grammars; it should pass `PROJECT_GRAMMAR` from intent.
- **legacy-checks.** `test/m/legacy-checks/catalogue.test.mjs`' two "rule 2" tests expect six `LEGACY_GRAMMARS` slots. They were red at base already and are still red. The `LEGACY_GRAMMARS` comment (`bio-checks.mjs` ~1995: "C-2.9/C-9.1 intent (layer 7)") is now stale; I edited no legacy comment, so as to keep the change a pure removal.
- **Stale comments.**
  - promotion: `src/gate.mjs`:456–457 names C-2.9/C-9.1 among the catalogue's legacy arms.
  - legacy-store: `src/store.mjs`:144's comment ("its audit check keeps C-2.9") could add the grammar.
  - inquiry: `src/inquiry/checks.mjs`:3 says C-2.9 stays the catalogue's.
- **reevaluation (an observation, not this job's).** `src/reevaluation/index.mjs`:305 reads `workproduct_state` values `retracted` and `redistributed`, which C-2.9's four rungs do not admit.
- **Generated artifact.** The bio-plane bundle is stale (`bio-checks.mjs` and intent changed); it is regenerated at the close (§14).

**Deferred.** None.

**Tests and checks:**
- Module: `node --test test/m/intent/`: 59 pass, 0 fail (51 before; 1 red at base, the K789 one).
- `test/m/` whole at HEAD (`job/T19/intent`, tranche merged through K822): 4,517 tests, 175 fail. At `tranche/T19` @ 41e4d013c4 in a worktree: 4,373 tests, 190 fail.
  - New at HEAD: exactly the two affordances R19 tests above.
  - Red only at base: the R9 test (fixed here), one R2 temp-dir test, and 13 file-level loads that need packages the base worktree lacks (environment).
- Layer tests: none named.
- `format`: 0 failures.
- `architecture intent`: 13 product files, 0 failures.
- `coverage intent`: 30 of 30, 0 failures.
- `ownership intent tranche/T19`: 0 failures; legacy-checks 0 lines added, 42 removed; legacy-store 0 lines.

Size (session_01FGB25wChLZQHKs6mFKcZPg): test runs 12, module lines 1966

## J1 · QUESTION

R16 says a `defer` or `dismiss` without a reason answers `NO_REASON`; R30 says this module "never answers `NO_REASON`" (progressions' C-100.18) and names R8 and R10 as `INTENT_NO_REASON`'s users. Today one site (`refuseNoReason`, C-111.13) answers all four (R8 `closeGoal`, R10 `departFrom`, R16 `triage` defer/dismiss, and R26's registered check on a goal closed with no "Why It Closed"). My best reading: R30 governs, so every one of these answers `INTENT_NO_REASON` (C-111.13), R16 included, and R16's `NO_REASON` is a wording left from before K766. I am building on that reading; if R16 should keep `NO_REASON` (then C-111.13 and C-100.18 would hold one code twice, against DEC-49), tell me. Suggested fold: R16 "(a reason required, `INTENT_NO_REASON`, R30)".
