# basis-versions (T51)

**Status** · session_01SrdYb2t95osCMqx6hdxR2r · depth 2 · WORKING · handled B7

## J1 · REPORT

REPORT (note 1, P9): the refusal of a version leg for its kind lives in my module (`basis-versions/grammar.mjs`, the target arm: "a leg rests on information or on another inquiry, nothing else", D-184), and I am lifting it myself. For a calculation, an occurrence and a derived connection I judge the leg by `inquiry-grammar`'s exported `calculationLegFindings`, `occurrenceLegFindings` and `derivedConnectionLegFindings`, the same arms as `basis[]`'s.

One thing is not mine: the standard's arm, `standardLegFindings(label, leg, findings)` (inquiry-grammar R13: the `target_portion` form and STANDARD_LEG_AXIS), is private to `inquiry-grammar/grammar.mjs` (it is called only from `checkInquiryBasis`'s loop) and is not exported. Calling `checkInquiryBasis` on a one-leg document does not stand in for it: its earned arms refuse any graded leg when no registry is handed in. Copying the rule into my module would be a second statement of it.

Change needed in `inquiry-grammar` (for BOB to forward or re-plan): `export function standardLegFindings` in `bio-plane/src/inquiry-grammar/grammar.mjs` (behaviour unchanged, true when the leg's axis or source is refused), and add it to the re-export list in `bio-plane/src/inquiry-grammar/index.mjs`. Requirement text: inquiry-grammar R13 says "judged below"; a line in R4 or R13 naming it as exported, as R11/R14/R15/R17 name theirs. Until it lands I do the rest of the job (calculation, occurrence, derived connection, the composition, the projection, R51's copy, R55, P6); the standard arm and its test wait on it. If you would rather I wait, say so.

## J2 · COMPLETE

COMPLETE (T51-53 · basis-versions), answering B2.

**Entries applied.** R3's every-kind sentence for a calculation, a duty occurrence and a derived connection (`grammar.mjs`: the kind refusal lifted for these; judged by inquiry-grammar's exported `calculationLegFindings`, `occurrenceLegFindings`, `derivedConnectionLegFindings`; the resolve arm of R6 skips a leg naming no bundle; the composition freezes a derived connection's five fields as a `leg_derivation` line after the existing ones, so every held composition is byte-identical; projection types the legs `calculation`, `occurrence`, `derived_connection`). R51's copy takes every leg kind with the five derivation fields. R9 restated: a test names it (root, derived, machine-appended; control: own reading `run`/`kind` null). R55 `compareVersions` (`op=versioncompare` in `basisVersionsOps`; rows C-25.37 to .39 for its three refusals, plain translations until the design stream's word table holds keys: owed). P6: the `conclude` family moved to `conclude.mjs` (568 lines), shared constants to `shared.mjs`; `index.mjs` 1,736 lines (was 2,194).

**Deferred (B2).** The standard half of R3: a standard leg stays refused for its kind; `test.todo` names N1251 (T52), with a control that it is refused today.

**Found in other modules.** None new. Inherited reds, identical with and without my change: case-authoring 2 (standards.test.mjs R61), affordances 2 (t36.test.mjs ACT_HELP words), agent-worker 1 (requirements.test.mjs). Owed outside me: `op-declarations` declares `versioncompare`; the word table keys for `refusal.VERSION_COMPARE_*`.

**Tests run.** basis-versions 182 pass, 0 fail, 1 todo. Modules that read versions' legs, all 0 fail: strength 160, contradiction 120, run-productions 59, reevaluation 145, publication 150, ratification 246, project-stage 23, queue-producers 83, review 59, case-account 43, case-tensions 23, investigation 32, question-explorer 46, skills 130, answer-envelope 41, store-door 48, control-plane 302, plane 260 (case-authoring, affordances, agent-worker: the inherited reds above only).
**Checks.** format 0 failures; architecture 0 failures; coverage 52 of 52 ids, 0 failures; ownership 0 failures.

Size (session_01LSyNpJD3npEurHcTzv9LS6): test runs 40, module lines 4,199

## J3 · BLOCKED

Cause: needs BOB (a prerequisite is not on tranche/T51). Your START says basis-version-grammar (T51-148) and inquiry-grammar (CR-8) have merged. At tranche/T51 5fb50f87d2 neither has: (1) bio-plane/src/basis-version-grammar/ does not exist, its modules.json row (index 82) has empty paths/tests/uses, and there is no build/jobs/T51/basis-version-grammar.md (only BOB's .bob.md, B1); origin/job/T51/basis-version-grammar is at aaa6347031 'R6 open'. (2) origin/job/T51/inquiry-grammar has no job record, and inquiry-grammar's standardLegFindings (grammar.mjs:1468) is still not exported. CR-9 is delegation by import and re-export of the new module, so I cannot delete grammar.mjs or the grammar half of checks.mjs, nor build the standard-leg judgment, until both merge. I have changed nothing. I merged tranche/T51 into my branch and read my requirements, words findings and the split map. Please merge the two jobs into tranche/T51 and send RESUME or CHANGE; I will then merge tranche/T51 and start. (The words findings that do not touch the moved code could proceed now if you prefer: say so.)

## J4 · REPORT

REPORT (part 1 of CR-9, pushed; the delegation waits on your CHANGE). Done now, basis-versions 183 pass / 0 fail / 1 todo, format 0, architecture 0: (1) words: every inline finding in index.mjs and conclude.mjs converted by localize (details, repairs, session-log fragments, 'says'); the three test copies (dec149-strings now asserts no plane-naming and the names it carries, not the sentences), acts.test's op hand-list (the six from VERSION_ACT_TO, the rest one by one), the two fixture strings. (2) R55 (DEC-337): the three VERSION_COMPARE_* rows read word('refusal.VERSION_COMPARE_*'); compareVersions holds no second sentence (its detail is gone); new test 'R55 (DEC-337)' holds each translation equal to word of its key. VERSION_NOT_ACCEPTED and VERSION_CURRENT_NO_PROJECT rows now read their list rows by key too. (3) R52 relay and its test already existed (divided.test.mjs), unchanged and green. (4) amended() in registration.test.mjs is the R43 golden test, which the split map copies to the new module; I leave it for the delegation step. NOT converted, for your ruling (K3944): (a) checks.mjs 'where' strings (15 rows 'src/basis-versions/index.mjs #moveVersionState, reached from…') are source locators read by control-plane's region checks, not sentences a member reads: identifiers. (b) Findings in grammar.mjs (166,194,314,320,408–445) and checks.mjs SUGGEST_KINDS (656–666) sit in code that moves to basis-version-grammar; I leave them to that module and delete the copies in the delegation. Found in another module: contradiction/index.mjs:1781 [copy] holds a words.json sentence ('concluded through basis-versions' own door; …'). Waiting for CHANGE once basis-version-grammar and inquiry-grammar have merged.

## J5 · COMPLETE

COMPLETE (CR-9 · basis-versions), answering B5 and B6.

Entries applied. (1) Delegation (C57, P6): grammar.mjs deleted; checks.mjs keeps the store rows (BASIS_VERSION_STORE_CHECKS: C-25.11, .16–.18, .37–.39), the six acts', the conclusion's, narrowing's and the boilerplate roster, and exports BASIS_VERSION_CHECKS = {...BASIS_VERSION_GRAMMAR_CHECKS, ...store rows}, re-exporting VERSION_KIND_CHECKS and SUFFICIENCY_UNCLAIMED; index.mjs imports from basis-version-grammar and 'export *' re-exports it whole, plus BASIS_VERSION_CHECKS, VERSION_ACT_CHECKS, CONCLUDE_ACT_CHECKS, NARROW_CHECKS, BOILERPLATE_FORMS, isBoilerplate, so no user re-points; text.mjs re-exports fmSafe from the new module; the factory registers through its registerBasisVersionGrammar(record) (registrant stays 'basis-versions'; one code, one site). (2) CR-9 standard leg (N1251): met in basis-version-grammar R10; the test.todo and its control are replaced by a promotion test: a version and a member's own reading (R51) on a passage, a standard and a calculation leg hold all three, projected with their types; control: a lead is refused by name and a standard leg on a testimony axis is refused by inquiry-grammar's own code, never VERSION_LEG_NOT_CITABLE. (3) Copied test arms deleted (grammar R1–R5, sufficiency 3, registration 4 -> the factory test kept as R6, imported-legs 2); amended() went with them (N1216). (4) R55 refusals by key (DEC-337), new test; R52 relay and its test (divided.test.mjs) unchanged and green. (5) Words (K3949, K3957, K3962): all inline/test-copy findings of my module fixed (J4); B6's '+'-chain rule run against civicos-process main: no new finding.

Deferred. None.

Words not converted, for the design's unkeyed list: the 15 'where' strings in checks.mjs ('src/basis-versions/index.mjs #moveVersionState, reached from…'): source locators read by control-plane's region checks, no person reads them. The grammar's and SUGGEST_KINDS' findings went with the moved code. In another module: contradiction/index.mjs:1781 [copy] holds a words.json sentence.

Tests/checks. basis-versions 183 pass, 0 fail with basis-version-grammar's 11 (194 together). Users, mine vs a worktree of tranche/T51: strength 161/0, run-productions 59/0, reevaluation 145/0, skills 130/0, review 61/0, store-door 48/0, project-stage 23/0 all green; inherited reds, every failing test also fails on tranche/T51 and mine fail strictly fewer: contradiction 2 (conformance battery 'undetermined reason not a key', K3958), affordances 4, answer-envelope 4, plane 1, queue-producers 2. Not run by me: agent-steps' fixture (absent). format 0 failures; architecture 0; coverage 45 of 45 ids, 0; ownership 0 failures; words: only the 15 locators; setup-words build --check: stale-rows note only (accepted-work word, not mine).

Size (session_01778SRJXwE8E8B1xtKcWZ2m): test runs 14, module lines 2,825

## J6 · COMPLETE

COMPLETE (T51 · basis-versions), answering B7 (CHANGE, K4259). Branch `job/T51/basis-versions` at `3533bedc4c`, pushed.

**Entries applied.**
1. `narrowcandidates` is declared in `DECLARED_OPS` (`bio-plane/src/basis-versions/index.mjs`): classes `admin`, `member`, `probe`; `mutating: false`; `weight: "read"`; description `localize("basis-versions.declared.narrowcandidates", …)` with the sentence of op-grades' row ("read: the machine's proposals for making one leg more specific, keyed by (inquiry, reading, ordinal); labeled machine work and writes nothing"); `fields: { accepts: ["target","version","ord"], requires: ["target","version","ord"] }`. Agrees with the op-declarations hand row (`classes`, `mutating: false`).
2. Tests (`bio-plane/test/m/basis-versions/declared-ops.test.mjs`), written first and seen failing (no declaration): `R57 … declares narrowcandidates` runs `declaredOpHolds` through the module's ops map over the real `mkNarrow` fixture, with refusals named per field (`NARROW_NO_INQUIRY`, `NARROW_NO_SUCH_VERSION`, `NARROW_NO_SUCH_LEG`); and `R57 … declares narrowcandidates as a read` checks `mutating` false, `weight` read, and that the description is the sentence its key names (it writes nothing). Control: the removed row fails both.

**Requirement line for BOB.** I propose amending R57 rather than a NEW R: append to R57's list "and `narrowcandidates` (weight `read`, accepts and requires `target`, `version`, `ord`; K4259)". R57's test already covers the declaration pass; the new arm is in `declared-ops.test.mjs`.

**Deferred.** None.

**Found in other modules (P9), not touched:**
- Coverage: six live ids named by no test: agent-harness R17; agent-runner R37, R38, R40; installer-steps R26, R31; journey-check R19; screens-inquiry R110, R119; screens-intake R53.
- Words, testcopy: `bio-plane/test/m/op-grades/t37.test.mjs:32` copies the sentence "translation-directed: keyed by a language and an interface word; …" (op-grades' row). Owner: op-grades.

**Tests and checks run.**
- Installed node_modules where a lockfile had none (K4113: `npm ci --ignore-scripts`).
- `node --test test/m/basis-versions/`: tests 180, pass 180, fail 0.
- `node checks/run.mjs /home/user/bio`: format 0 failures (175 modules); architecture 0 failures; channels 0 failures; coverage 6 failures, all in the other modules listed above; words 1 failure, the op-grades testcopy above. basis-versions and its files: 0 findings in every check.
- `node checks/ownership.mjs /home/user/bio basis-versions tranche/T51 job/T51/basis-versions`: 3 files changed, 0 failures.

Size (session_012QGXjkj6ha3NnkkWJ68nZt): test runs 4, module lines 2850 (`bio-plane/src/basis-versions/*.mjs`, all lines, comments included; 2 lines added this job).
