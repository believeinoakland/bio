# affordances (T49)

**Status** · session_01Sg9Baej6PovaKSxFXZivNf · depth 2 · COMPLETE · handled B3

## Completion

**How the set was read.** Whole: `build/requirements/affordances.md`; the plan's rules and T49-14; my code (`affordances.mjs` 1,707 lines, `facts.mjs`, `door.mjs`, `act-help.mjs`, `words.mjs`); `t36`, `t33` and `t48` (the tests naming R48, R39 and R59, which my entries change); `words-reads.json`'s `affordances` entry (405 keys, 1 `unkeyed`); setup-words R10–R13 (requirements). Run, not read: the other 24 test files. `mock-acts.js` at `f498560a37` was measured by script (below), not read line by line; its 338 texts are held by the word list, not copied. The used modules' services my entries touch are `setup-words.word`/`hasWord` (not yet merged; interface as written), `op-grades.OP_ALIASES` and `membership.MEMBERSHIP_CHECKS.HANDLE_FIXED` (read, unchanged); no digest helper was needed.

**Measure (entry step 1), `mock-acts.js` at `f498560a37`: 338 keys by R48's reading.** 295 are an op's own text; 27 are aliases' (held under their op); 11 are `owed_<op>` texts now held under `<op>` (`readtranslate`, `projectfork`, `versionconsider`, `versionreject`, `versionrevert`, `versioncurrent`, `updatestart`, `updatelater`, `updateskip`, `passwordresetlink`, `founderhandleset`); 5 stay `owed_` (`projectstakeset`, `actionstake`, `watchitem`, `secondlook`, `actioninquiry`; their ops are not declared in T49). The design gives `readtranslate` both bare and as `owed_readtranslate` (one text): held once, so **337 ops held** (285 before: 52 new ops' texts, 1 re-worded `queuemute`, none lost). Of the 13 ops `ACT_HELP_ABSENT` names (fold (b) finding 5) all 13 now have text (`readtranslate`, `planask`, `stepsource`, `stepsourcewithdraw`, `actionreplyquoting`, `lookedsince`, `proceedingdates`, `updatenotice`, `aiuseovertime`, `exploregraph`, `standardproposals`, `filingread`, `pressurefor`); `founderhandleset` is held; `projectownervotes` has no text and is held none. Three held keys (`instance`, `progression`, `captureprogressions`) are declared reads without a grade.

**Entries applied**
- **R60.** `step_source` has its own group `step_source` (the design's sixth), out of `ment`; `CONNECTION_GROUP_NAMES` holds six. New test in `t48.test.mjs` (totality over the registry with the six groups, the control).
- **R61.** `act-help.mjs` regenerated at `f498560a37` as above; test (`t36.test.mjs`) reads the file from git at that commit and compares op by op, with the five-`owed_` control and the variants table.
- **R62.** `ACT_HELP` holds keys: `ACT_HELP_OPS` (the ops, design order), `ACT_HELP_KEYS` (op → word key, `act.<op>.does` unless the design keys it otherwise), and `ACT_HELP` is each key read through `word` at load (a missing key fails the load, as `attestFence` does); the very object `op=affordances` answers (R49). `handlechange` stays membership's `HANDLE_FIXED` row by reference (R53). `words.mjs` reads every vocabulary word by its `label.*` key (line kinds, capacities, roles, money kinds/phases/stages/bases/precisions, identity claims; connection kinds by `label.linekinds.*`, `label.connectionkinds.*` and `holds` with its capacity); `MONEY_WORDS` is gone; a value with no key keeps R39's provisional word, the owner's registered word standing between. Tests: `hasWord` over every key read, equality with `word(key)`, no English held in a test (t33, t36).
- Spelling (N1068): "labeled" is the word list's; one control kept (`t36`). `admin` grep (N1072): none reaches a reader in my files (comments only). D29: none (`affordancesOp` answers a refusal as one). N1073: not mine (affordances is a registry, waits on N1074).

**Merge note (K2704, rule 5 (8)).** My merge opens op-declarations' `ACT_HELP_ABSENT` partition red (its R34, "never both"): `R34 (affordances R48)`, `R64, R34`, `R66, R21, R34`, `R67, R34` fail on the 13 ops above now held and still named; cleared by T49-17. The other 13 reds in op-declarations' suite are the baseline (design-file reds). R48's own red (`t36`) is cleared. Not mine: screens-investigate R10 (baseline red until T49-26).

**Deferred.** None. **Found in another module / for BOB** (also in the REPORT):
1. Member-facing English in my module that the reads list does not cover and the word list has no key for (a REPORT, never inline English, so these stay as they are): the act `label`s of `ACTS`, `CAPTURE_ACTS` and `PER_ITEM_ACTS` (the design's `act.<op>.label.<screen>` keys are per screen, not per act); `DIVIDE_PROMPT`, `GROUND_PROMPT`, `attestFence`'s sentence (DEC-39); `CATALOGUE_DETAIL`; `NOT_CATALOGUED`; `facts.mjs`:362's `detail` (marked `unkeyed`). Words-reads' scanner saw only `act-help.mjs`.
2. `words-reads.json`'s 405 keys were generated from the old `ACT_HELP` (285 acts): they lack the 52 `act.<op>.does` keys R61 adds (all are in `words.json`, so `hasWord` holds); the design lane should regenerate the entry.
3. The tree's `mock-acts.js` on `tranche/T49` is ahead of `f498560a37` (DEC-248/249 re-keys six `owed_` tags and adds `reauth`). I held the named commit, per START; `reauth` has no text in my table.
4. `connection_kinds` words changed to the design's where it keys one (`member_of` is "a member of", not the owner's "member of"; identity-claim kinds read "claimed the same person"…): a consumer comparing the old words needs the key. screens-investigate's `groupMap` doc names five groups; its R27 job covers the sixth.
5. The setup-words module is not merged: I built against `word`/`hasWord` as written with a local, uncommitted shim (reverted); when BOB's CHANGE says it merged, merge `tranche/T49` and re-run.

**Tests and checks.** `node --test bio-plane/test/m/affordances/`: 262 tests, 262 pass, 0 fail (before: 259, 1 fail, the R48 design-file red); with setup-words' interface supplied by the local shim. Dependents: op-declarations 192 tests, 176 pass, 16 fail (13 baseline + 3 new R34 partition reds named above); screens-investigate 103 tests, 102 pass (baseline R10 red); control-plane `affordances-pack` 4 pass. `format` 170 modules, 0 failures; `architecture` 32 product files, 361 relative imports, 0 failures; `coverage` (affordances) 46 of 46 live ids named, 0 failures; `ownership` 7 files changed by affordances, 0 failures. `checks/run.mjs`: architecture and format 0 failures; coverage 17 failures, none mine (other modules' new ids).

Size (session_01Sg9Baej6PovaKSxFXZivNf): test runs 9, module lines 2,613

## J1 · REPORT

Findings outside my entries (details in my record, "Completion"):
1. Member-facing English I hold that the words-reads entry does not cover and words.json has no per-act key for, so I left it (a sentence no key holds is a REPORT, never inline English): the act `label`s of ACTS, CAPTURE_ACTS and PER_ITEM_ACTS; DIVIDE_PROMPT, GROUND_PROMPT and attestFence's sentence (DEC-39); CATALOGUE_DETAIL; NOT_CATALOGUED. The design lane needs to key them or rule them unkeyed.
2. words-reads.json's affordances entry (405 keys) was generated from the old 285-act ACT_HELP; it lacks the 52 act.<op>.does keys R61 adds (all are in words.json). The design lane should regenerate it.
3. tranche/T49's mock-acts.js is ahead of f498560a37 (DEC-248/249: six owed_ tags re-keyed, `reauth` added). I held f498560a37 as START names; `reauth` has no text in ACT_HELP.
4. connection_kinds / vocabulary words now come from the design's label.* keys where it keys one (member_of reads "a member of"; identity claims "claimed the same person"). screens-investigate's groupMap doc still names five groups (its R27).
5. Merge note (K2704, rule 5 (8)): my merge opens op-declarations' ACT_HELP_ABSENT partition red (its R34, "never both"): 13 ops now have text and are still named. Cleared by T49-17.

## J2 · COMPLETE

T49-14 done: R60 (step_source its own group), R61 (ACT_HELP regenerated at f498560a37: 337 ops held), R62 (ACT_HELP and the vocabularies read by key through setup-words). Module tests 262/262 (built against setup-words' R11–R12 as written, with a local shim not committed; merge tranche/T49 once setup-words has merged and re-run). format, architecture, coverage (46/46), ownership: 0 failures. My merge opens op-declarations' R34 partition red (named in REPORT J1), cleared by T49-17. Nothing deferred. Details in my record.

## Completion, after B2 and B3

**B2 (K3369).** `affordances.mjs` imports op-grades' `IRREVERSIBLE_CORRECTION_KEY` and publishes it as `vocabularies.rung_correction_key` (my choice: the old `rung_correction_path` field is gone, since its text is no longer a path string; a reader draws it with `word(key)`). `rung_consequences` is still `CONSEQUENCE_STATEMENTS` by reference, so it carries `{friction, key}` whatever op-grades holds. `door.mjs`'s `CATALOGUE_DETAIL` names the new field. Catalogue and plane tests re-pointed. op-grades has not merged yet: I ran the module against the real setup-words (B3) with a one-line, uncommitted, reverted export of the key; the first run against the real op-grades happens at its merge, when `rung_correction_key` must be defined (an undefined import fails the load).

**B3.** Tranche merged in; real setup-words. `node --test bio-plane/test/m/affordances/`: 262 tests, 262 pass. format 0 failures; architecture 0 failures; coverage 46 of 46.

Size (session_01Sg9Baej6PovaKSxFXZivNf): test runs 10, module lines 2,614

## J3 · COMPLETE

B2 and B3 applied: rung_correction_key published (old rung_correction_path removed), tests re-run against the real setup-words, 262/262, checks 0 failures. NOTE: op-grades has not merged; at its merge affordances needs IRREVERSIBLE_CORRECTION_KEY from it or the module fails to load. Details in my record.
