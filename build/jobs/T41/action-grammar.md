# action-grammar (T41)

**Status** · session_01X91czHYMgFDRuMpbnSJLFk · depth 2 · WORKING · handled B4

## Completion

**Entry applied:** T41-46a (H30 (1), intent R33; K2505): R13. My readings were confirmed by BOB in B3 (K2553), which supersedes B2's shape.
- **The outcome.** `CORRESPONDENCE_OUTCOMES` gains `none_exists`, added at the end so every earlier position stays. It is a received decision's outcome like the others: `lifecycleFindings` judges it exactly as it judges `granted`.
  - C-94.5 `OUTCOME_NOT_IN_VOCABULARY`'s translation now names `none_exists` (B3 (1)): "An outcome is one of granted, denied, partial, reversed, affirmed, none_exists when the body says no responsive record exists, or none_stated when the body stated none."
  - Its finding names the vocabulary from the array, so the finding now ends "…, none_stated, none_exists".
- **`seeks`.** New exports: `SEEKS_MAX` (12), `SEEKS_PART_MAX` (200), `seeksOf(fm)` and `seeksFindings(fm, facts, findings)`.
  - `seeksOf` answers the distinct well-formed items in order, as copies. It answers `[]` when `seeks` is absent, is not a list, or sits on another kind than `records_request`.
  - `seeksFindings` pushes one finding per fault:
    - `seeks` on another kind (and nothing more is asked of it);
    - not a list of 1 to 12 entries (`[]` is refused; absent or null is not);
    - more than 12;
    - each malformed item (exactly `{progression, entity, stage}`, each a non-empty string of at most 200 characters);
    - each repeat of an earlier item;
    - each item whose stage `facts` says its progression does not declare.
  - **The `facts` shape** (B3 (2)) is `facts.stages = {[progressionKey]: [stage_key…]}`. `null` stands for a progression not found and is its own finding. A progression with no entry is not judged; only the object's own keys count.
  - It reads no record. It is not asked by the audit (`checkActionExtension`), since R13 does not make it a C-2.10 arm.
- **The new row is C-117.29, code `SEEKS_REFUSED`**, in `ACTION_CATALOGUE_CHECKS` (last). Its `where` is `src/action-grammar/checks.mjs seeksFindings > is-seeks`: it is minted here, inside a DEC-49 region, as C-73.6 is. Every finding carries `check: "C-117.29"` and `code: "SEEKS_REFUSED"`.

**Reading set (§17).** I read all of it whole myself:
- the requirements;
- the Purpose and named services of `record-grammar`, `civil-time`, `jurisdictions`, `connections` and `inquiry-grammar`;
- layer 9's contract and the action-grammar section of `layers.md`;
- the module's code (`grammar.mjs`, `checks.mjs`, `index.mjs`) and its tests (`grammar.test.mjs`, `fixture.mjs`, `corpus.mjs`);
- T41-46a and rule 4 in `plan/current.md`;
- K2483, K2484 and K2505;
- for R13's context: actions R70 and R71, intent R33 and progressions R5's terms.

`golden.json` is a fixture. I did not read it whole: I searched only the lines my change touches (the outcome list and its finding). The set is within START's 239 KB measure.

**Final `uses`:** unchanged: `record-grammar`, `jurisdictions`, `civil-time`, `connections`, `inquiry-grammar`. There is no edge to `progressions`, which the caller reads (actions R70).

**What filing-templates reads (B1).** Nothing changes for it. It imports only `RISK_TIERS` from this module (`filing-templates/index.mjs`:39), and its suite's reds are the same with and without this change. `affordances` publishes `CORRESPONDENCE_OUTCOMES` as its `correspondence_outcomes` vocabulary, so it now carries `none_exists`. None of its tests pins that list.

**Inherited reds, mine (rule 4 (2)):** the row census (`test/system/row-census.test.mjs`) reports exactly these two, both awaiting T42's stamp:
- `arrived with no record: C-117.29 SEEKS_REFUSED` (new);
- `changed with no record: C-94.5 OUTCOME_NOT_IN_VOCABULARY` (re-worded, B3 (1)).

The plane bundle is staled (rule 4 (14)).

**Deferred:** none.

**Found in another module (REPORT J2):** answer-envelope's `catalogue-end.test.mjs` pins C-94.5's translation digest in `rows-before-r43.json` (`["C-94.5","4f2ee83d0d48dd33"]`). With the re-wording it reads `65a25bcf08b2ebd2`, so that pin must move with the row (`changed.note`, a re-wording under K2553).
- The test is already red for rule 4 (16), so it shows no new failure today. Its failure detail names neither C-94.5 nor C-117.29.
- It will name C-94.5 once T41-60 clears rule 4 (16), unless the pin is moved then.
- C-117.29 reaches `CHECK_FAMILIES` through this module's file, which is already listed (`families.mjs`:188).

**Tests and checks:**
- `node --test bio-plane/test/m/action-grammar/`: 41 tests, 41 pass, 0 fail.
  - New file `seeks.test.mjs`: 12 tests naming R13. Each tests one part fully, with a negative control (K874).
  - Changes to `grammar.test.mjs`: R1/R2 compare the vocabulary with `none_exists` appended; R9's rows add C-117.29 and C-94.5's new words; R9's census ranges now run to C-117.29.
  - `fixture.mjs`: the recorded C-94.5 finding is compared with its grown vocabulary (`GROWN`, applied the way `REWORDED` is).
- Mutation checks, each restored afterwards. Each of these broke `seeks.test.mjs`:
  - dropping the repeat check: 3 fail;
  - allowing 13 items: 1 fails;
  - not judging a `null` progression: 1 fails;
  - accepting `seeks: []`: 2 fail.
- Users' suites (actions, action-clocks, filing-templates, escalation, affordances, setup-page, answer-envelope) and the row census, run before and after this change:
  - The failing tests are identical by name, except for the census's two rows above.
  - actions 95/96, action-clocks 55/55, filing-templates 49/56, escalation 63/63, affordances 186/220, setup-page 75/83 and answer-envelope 24/28 pass. Each red is pre-existing (rule 4's named reds).
- Process checks:
  - `format`: 145 modules, 144 requirements files; 0 failures.
  - `architecture`: 7 product files, 14 relative imports; 0 failures.
  - `coverage`: 13 of 13 live requirement ids named by a test; 0 failures.
  - `ownership` (tranche/T41): 6 files; 0 failures.

Size (session_01X91czHYMgFDRuMpbnSJLFk): test runs 16, module lines 1939

## Completion: B4 CHANGE (R14; K2561)

**Change applied:** R14. I merged `tranche/T41` (my T41-46a work was already merged there) and added the row C-32.21 `MACHINE_CANNOT_STATE_SEEKS` to `RECORDS_LAW_FENCE_CHECKS`, directly after C-32.20.
- Its `where` is `src/actions/index.mjs #seeksFence > is-machine-state-seeks`, actions R72's fence, which ACTIONS #14 builds.
- Its translation follows R14's words in C-32.20's form: "Which stages a records request asks the records for is a statement a member makes and answers for. The credential that asked here is an automated one, or no member is named behind it: it can propose the stages for a member to consider, but it cannot state or change what the request seeks. Nothing was written. Sign in to state it yourself."

**Census (rule 4 (2), awaiting T42's stamp):** this adds `arrived with no record: C-32.21 MACHINE_CANNOT_STATE_SEEKS`, beside C-117.29 (arrived) and C-94.5 (changed). The plane bundle is staled (rule 4 (14)). `uses` is unchanged.

**Deferred:** none. **Found in another module:** nothing new.

**Tests and checks:**
- `node --test bio-plane/test/m/action-grammar/`: 42 tests, 42 pass, 0 fail.
  - New test in `seeks.test.mjs`: R14's row, checked whole, with negative controls (C-32.20 unchanged; no other table or code holds C-32.21).
  - Changed in `grammar.test.mjs`: R9's expected rows and census range now include C-32.21.
- Users' suites and the row census, run before and after this change: the failing tests are identical by name, except for the census's C-32.21 line.
  - actions 95/96, action-clocks 55/55, filing-templates 56/56, escalation 63/63, affordances 186/220, setup-page 75/83 and answer-envelope 24/28 pass.
  - Each red is pre-existing (rule 4's named reds).
- Process checks:
  - `format`: 145 modules, 144 requirements files; 0 failures.
  - `architecture`: 8 product files, 17 relative imports; 0 failures.
  - `coverage`: 14 of 14 live requirement ids named by a test; 0 failures.
  - `ownership` (tranche/T41): 4 files; 0 failures.

Size (session_01X91czHYMgFDRuMpbnSJLFk, B4): test runs 4, module lines 1950

## J1 · QUESTION

Q1 (R13; my best reading, being built now; the answer does not stop the job).

(1) C-94.5 OUTCOME_NOT_IN_VOCABULARY's translation lists the outcomes ("granted, denied, partial, reversed, affirmed, or none_stated"); with `none_exists` added (R13) it would be false. I re-word it to name `none_exists` ("… affirmed, none_exists when the body says no responsive record exists, or none_stated when the body stated none."). That is a CHANGED stamped row, beside R13's new row C-117.29: I read both as rule 4 (2), awaiting T42's stamp, and name both in my record. If you would rather the translation stay as stamped, say so and I revert it.

(2) The shape actions R70 hands in (mine to define, R13 says "facts (the caller's, read from progressions)"): `seeksFindings(fm, facts, findings)` reads `facts.stages`, an object `{[progressionKey]: [stage_key, …]}` for a progression `readProgression` found, `null` for one it did not (`found: false`); a progression with no entry is not judged. Findings carry `check: "C-117.29"`, `code: "SEEKS_REFUSED"`, one per fault (wrong kind, then nothing more; not a list of 1–12 (so `seeks: []` is refused; absent/null is not); more than 12; each malformed item, exactly the three keys, each a non-empty string ≤ 200; each repeat; each undeclared stage / unheld progression). The row's `where` is `src/action-grammar/checks.mjs seeksFindings > is-seeks` (minted here, as C-73.6 is). `seeksOf(fm)` answers the distinct well-formed items in order, and `[]` on another kind than records_request. Not added to the audit (`checkActionExtension`): R13 does not name it a C-2.10 arm and the audit holds no progressions.

## J2 · REPORT

answer-envelope (T41-60): `catalogue-end.test.mjs` pins C-94.5 OUTCOME_NOT_IN_VOCABULARY's translation digest in `rows-before-r43.json` (`["C-94.5","4f2ee83d0d48dd33"]`). With R13's re-wording (K2553) it reads `65a25bcf08b2ebd2`, so the pin moves with the row (`changed.note`). The test is already red for rule 4 (16), so nothing new shows today. Once T41-60 clears rule 4 (16), it will name C-94.5 unless the pin is moved then. C-117.29 SEEKS_REFUSED reaches CHECK_FAMILIES through action-grammar's file, which is already listed.

## J3 · COMPLETE

T41-46a done (R13), as confirmed in B3. Exports: `none_exists` in CORRESPONDENCE_OUTCOMES; `seeksOf`, `seeksFindings` (facts.stages shape per B3), `SEEKS_MAX`, `SEEKS_PART_MAX`. Row: C-117.29 `SEEKS_REFUSED` (`where` seeksFindings > is-seeks, minted here). C-94.5's translation is re-worded. Mine under rule 4 (2), awaiting T42's stamp: the census rows C-117.29 (arrived) and C-94.5 (changed); the plane bundle is staled (rule 4 (14)). `uses` unchanged. filing-templates is unaffected (it reads only RISK_TIERS). Tests: action-grammar 41/41. The users' suites fail exactly the same tests before and after the change. format, architecture, coverage (13/13) and ownership: 0 failures. Record: Completion, on job/T41/action-grammar @ b6dce8ecb5+.
