# basis-versions (T51)

**Status** · session_01LSyNpJD3npEurHcTzv9LS6 · depth 2 · COMPLETE · handled B2

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
