# case-import (T41)

**Status** · session_01KJ4zxTUbTA3VAHVeTVs72b · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Two readings, the first decides how R23 is built.

**Q1 (R23: a synchronous read over an asynchronous checker).** R23 puts the importer's-lens assessment into R4's read, `importedCase`. That read is synchronous, and must stay so: `case-disclosures` R13 (`acceptedWorkJudged`, `case-disclosures/index.mjs:631`) calls it synchronously inside its pre-flight. But `case-checker.checkCaseFile` (its R1, and R23's `lens` with it) answers a promise, because it verifies signatures with WebCrypto. A synchronous read cannot run it, and the importer's lens can change after the import (an adoption), so an assessment recorded at import goes stale. Options:
1. *(recommended)* `case-checker` R23 also offers a pure, **synchronous** re-weighing, e.g. `reweigh({parts, documents, answer, lens})`, taking the as-published answer already recorded (so no signature is verified again) and answering what R23 answers per finding (`pair`, `bar_met`, the statements that changed it, the limit sentence). case-import's R4 calls it on every read with the reader lens built from `bias.statementInForce` (synchronous, R49), so the lens is always the one in force and nothing goes stale. One body of lens code, still case-checker's. CASE-CHECKER #10 has only just started, so the cost is a sentence in its R23.
2. `importedCase` becomes async; `case-disclosures` R13 and its callers must await it (a service change for a later L8 module, and its pre-flight becomes async).
3. case-import records the assessment at import and completion under the lens then in force; the read answers it with that lens's `statements_sha` and whether it is still the lens in force; refreshing needs a new act and op (L11 surface).
Until you answer I build option 1 against an injected synchronous re-weigher (a dep, default case-checker's export once it exists), so only the call changes.

**Q2 (R22: `findings: "all"` when nothing can be accepted).** My reading: "all" takes every finding of the edition; it accepts those `recreated` and those `recreated_in_part` whose every missing entry `gaps` states, and answers `not_accepted: [{finding, ref, result, why, unstated?}]` for the rest (`did_not_recreate`, or in part with the gaps it leaves unstated named). When it would accept none, it writes nothing and refuses: `IMPORT_NO_SUCH_FINDING` for an edition with no findings; else `IMPORT_ACCEPT_GAPS_UNSTATED` when some finding recreated in part could be accepted by stating its gaps (naming them); else `IMPORT_ACCEPT_NOT_RECREATED` naming each finding. No new catalogue row. I carry on with this.

## J2 · COMPLETE

**Entry applied: T41-41** (commit 43422d8c67).
- **R22** (D62; Q2 as read, B2): `acceptImported({findings: "all"})` takes every finding of the edition in one act with one reason. It accepts each finding that is `recreated`, and each `recreated_in_part` one whose missing entries `gaps` all states, as one acceptance row recorded as R6 records one. It answers `scope: "all"` and `not_accepted: [{finding, ref, result, why, unstated?}]`. When it would accept nothing, it writes nothing:
  - `IMPORT_NO_SUCH_FINDING` for an edition that holds no finding;
  - otherwise `IMPORT_ACCEPT_GAPS_UNSTATED`, naming each gap, when stating gaps would let a finding be accepted;
  - otherwise `IMPORT_ACCEPT_NOT_RECREATED`, naming each finding.

  R6's earlier refusals come first. A list naming `"all"` names a finding. No catalogue row was added.
- **R23** (D59, D62; K2471; Q1 option 1, K2529): on every read, `importedCase` (R4) answers each finding's `own_lens` beside its recorded pair (the source's lens) and `against_own_bar`. The edition carries `source_lens` and `own_lens`.
  - The carried applications come from `case-grammar.biasApplicationsOf` (its R24).
  - Each statement is asked of `bias.statementInForce` once, at scope `instance`, with the reading member as viewer.
  - The reader lens is `{statements in force, applications whose statement is in force}`, and the rest read as removed. It is re-weighed by `case-checker.reweigh({parts, documents, answer, lens})`, synchronous, over the recorded answer.
  - A finding resting on an undetermined (`null`) statement answers `determined: false`, `pair: null` and `bar_met: null`, with `LENS_UNDETERMINED` stated. A throw, or an answer that is a promise, is stated as `LENS_NOT_REWEIGHED`. Neither is ever read as false.
  - The read writes nothing. The acceptance, `findingFacts`' pair and the recorded results stand ("never stronger than its edition").
  - `importedCase` stays synchronous, so `case-disclosures` R13 is unaffected.

**Built against requirements, injected (B2):** `case-checker`'s `reweigh` (its R23 as K2529 amends it) and `case-grammar`'s `biasApplicationsOf` (its R24) are not on `tranche/T41` yet. The module reaches them as `caseChecker.reweigh` and `caseGrammar.biasApplicationsOf` (deps `reweigh` and `biasApplicationsOf`, which a test passes). Until they exist, the read states `LENS_NOT_REWEIGHED`. R23's tests run against scripted stand-ins in `fixture.mjs`, which apply the R23/R24 semantics. When each one merges, the CHANGE should name the export's exact name and its answer's shape (`findings[{finding, pair, bar_met, changed_by}]`, `limit`). I then add a test over the real ones and re-run steps 5–7.

**Final `uses`:** unchanged from `modules.json` (record-grammar, record-core, membership, strength, case-grammar, case-checker, inquiry-grammar, accepted-work, reevaluation, signatures, docket, calc-grammar, bias). `bias` is now imported (`biasOf`, reached lazily, only when an edition carries an application).

**Reading set (mechanics §17; K2304):** it measured about 324 KB (requirements 25, code 112, tests 153, used services 34), which is over 300.
- I read whole myself: my requirements; layer 8's row of `build/layers.md`; `index.mjs`; `accept.test.mjs`; `reads.test.mjs`; `fixture.mjs`; and the used services my Uses names (Purpose, plus case-checker R1, R6, R11, R20, R23; case-grammar R11–R13, R18, R24; bias R49; strength R16; inquiry-grammar R11; accepted-work R1, R8; reevaluation R31, R33; signatures R2, R39, R40; docket R6, R15, R24).
- A worker read in full `schema.mjs` and `import`, `calculations`, `flags`, `real`, `voice` and `watch` `.test.mjs`. Its summary is about 10 KB, citing file:line throughout: tables and columns, the R-ids per test, the exact-shape assertions a new field could break, and fixture use. Nothing it left out mattered. Its exact-shape warnings (import.test.mjs:178, flags.test.mjs:104/138/145/212) are why no field was added to `importCaseFile`'s recreation, `acceptanceOf`, `findingFacts` or the catalogue.

**Deferred:** none.

**Found elsewhere (report):**
- `case-import`'s requirements name `calculations.evaluate` (R21; Uses), while the code, `modules.json` and `case-checker` R20 use `calc-grammar.evaluate`. This is a wording mismatch in the requirements, not a code fault.
- Flaws in my own tests (fixed later only if a CHANGE re-opens them; none affects compliance): flags.test.mjs:26/37/52's negative controls add a flag rather than repeat the clear; watch.test.mjs:147 never reaches the 200 cap; calculations.test.mjs:228 states `inputs` as a map.
- Inherited reds, identical with and without my change: case-disclosures R22 (photo translations by key), and case-authoring R19, R2, R29, R34, R40. None is mine.

**Tests and checks:**
- `node --test test/m/case-import/`: tests 94, pass 94, fail 0.
- accepted-work: 23 pass, 0 fail. case-disclosures: 80 pass, 1 fail (inherited). case-authoring: 164 pass, 5 fail (inherited).
- Layer tests: none named.
- format: 0 failures. architecture: 0 failures. coverage: 23 of 23 live ids named, 0 failures. ownership: 5 files, 0 failures.

Size (session_01KJ4zxTUbTA3VAHVeTVs72b): test runs 14, module lines 2011

## J3 · COMPLETE

**CHANGE B3 applied** (K2537; commit b8577161e5, after merging `tranche/T41` @ 7fe0e94f76 as 2367c852b3).
- R23's applications now come from `case-grammar.biasApplicationsOf` (its R24), the real export, read from the edition's case document. The `biasApplicationsOf` dep and its stand-in are gone.
- The fixture writes the block with `case-grammar.biasApplicationsLines`. The R23 tests use rows of the real shape (`target` `leg`/`conclusion`; effects `grade_lowered`, `inference_refused`).
- New test: "R23 the applications are case-grammar's reading of the case document (its R24)". It checks that every row the block carries reaches the reader lens and the per-finding answers, in its order. Its negative control is an edition with no block: nothing is applied, `bias` is never asked, and each finding is re-weighed as recorded.
- `reweigh` is still the injected stand-in until case-checker merges (B3). It is reached as `caseChecker.reweigh({parts, documents, answer, lens})`, answering `findings[{finding, pair, bar_met, changed_by}]` and `limit`. The stand-in now reads the carried applications through the real `biasApplicationsOf` too. By its convention, a reversed `grade_lowered` restores capture to `from`. That is the stand-in's convention only, not a claim about case-checker.

**Final `uses`:** unchanged (as J2).

**Tests and checks:**
- `node --test test/m/case-import/`: tests 95, pass 95, fail 0.
- accepted-work: 23 pass, 0 fail.
- case-disclosures: 78 pass, 3 fail, identical with the tranche's own case-import, so inherited. They come from the case-grammar merge: R22 photo translations by key, and two R7 `obscured` copy-row tests.
- format: 0 failures. architecture: 0 failures. coverage: 23 of 23, 0 failures. ownership: 5 files, 0 failures.

Everything else is as J2.

Size (session_01KJ4zxTUbTA3VAHVeTVs72b): test runs 18, module lines 2010

## J4 · COMPLETE

**CHANGE B4 applied** (K2546; merged `tranche/T41` @ 22a2fbd6be as 4c946b076a; commit 0e550dcbe4).
- R23 re-weighs with `case-checker.reweigh` (its R23), the real export and the module's default. The `reweigh` dep stays, so a test can pass the scripted world's stand-in.
- **Built to the real interface:**
  - The reader lens is `{statements: [ids in force], applications: []}`.
  - The answer is read from `findings[{pair, bar_met, lens_changes}]`, `lens_statement` (the limit) and `lens.not_applied`. `own_lens` now carries `lens_changes`, and `changed_by` holds the statement ids they name.
  - A `lens.departure` is stated as `LENS_NOT_REWEIGHED` with the departure, and is never read as false.
- **A reading recorded here (BOB's to confirm or correct):** R23 says the reader lens's "applications are the carried rows whose statement is in force". `case-checker` already keeps (does not reverse) a carried application whose statement the reader names. It applies the reader's `applications` on top as the reader's own, so passing the carried rows there would apply them twice. For an excluded leg, that leaves out a leg the published facts count. So I name the statements in force and pass no applications, and the carried rows of those statements stand as published. The new real test shows this: with every statement in force, every finding re-weighs to its recorded pair, an excluded leg included. Passing the carried rows as applications fails that test (checked, then reverted).
- **Undetermined, refined:** a finding is undetermined when it rests on an undetermined statement at its own legs, or through another finding (an entry in `lens_changes` naming one).
- **New test** (`real.test.mjs`): "R23 over the real re-weighing", over case-checker's fixture case file with a `bias_applications:` block written by `case-grammar.biasApplicationsLines`. It checks:
  - both statements in force: every pair is as recorded, and the limit is `LENS_LIMIT_STATEMENT`;
  - S1 not in force: B's lowered leg reads as removed, A changes through B, and each finding's pair, `bar_met` and `lens_changes` equal `reweigh`'s own answer for the same lens;
  - S1 undetermined: A and B answer `determined: false`, stated, with `bar_met: null`, while C is re-weighed.

**Final `uses`:** unchanged (as J2).

**Tests and checks:**
- `node --test test/m/case-import/`: tests 96, pass 96, fail 0.
- accepted-work: 23 pass, 0 fail. case-checker: 77 pass, 0 fail.
- case-disclosures: 78 pass, 3 fail. These are the same three inherited reds as J3: R22 photo translations, and two R7 `obscured` rows.
- format: 0 failures. architecture: 0 failures. coverage: 23 of 23, 0 failures. ownership: 6 files, 0 failures.

Everything else is as J2 and J3. Every R23 service is now real: `bias.statementInForce` is injected only in the test worlds, and `case-grammar.biasApplicationsOf` and `case-checker.reweigh` are used directly.

Size (session_01KJ4zxTUbTA3VAHVeTVs72b): test runs 25, module lines 2015
