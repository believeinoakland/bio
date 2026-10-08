# skills (T37)

**Status** · session_01DS51oYchEqheueabPH79qD · depth 2 · COMPLETE · handled B3

## Completion

**Reading set (mechanics §17).** Measured as §3 asks: my requirements (39 KB), layer 6's row of `build/layers.md`, the Purpose of each module in my `uses` and the services my Uses names (run-rules' vocabularies, `AI_RUN_CHECKS`, `DRAFT_MODE` and R21–R22; record-grammar R38 and R50), about 12 KB together, and my code (142 KB): about 193 KB, under 300 KB, so I read it all whole myself, and my tests (140 KB) whole too. Also read whole: the START's rulings (K1755, K1793, K1804, K1883, K2200, K2201), DEC-127, DEC-157 and DEC-179, and §L of the Interaction Constructs; of `words.json` only its `_note`, `protected_rule` and an entry's fields (K2053).

**Entries applied.** T37-14 (N669, its share); R5 amended, R39 new.
- `skilldoctrine.mjs`: `interfaceTranslationLayer(catalog)` in `writingHelpLayer`'s form, with `INTERFACE_TRANSLATION_CLAUSES` (eleven clauses, each a span found by R21's normaliser in §L, three of them, or in the `response:` ruling of DEC-127 (2), DEC-157 (2), (3), (4), (6) and DEC-179 (3), (4)); `INTERFACE_TRANSLATION_LABELS`, record-grammar's `PROPOSAL_STATES.translation`, the same object (R50); `INTERFACE_TRANSLATION_ACTS`: `translationdraft` (`instance-setup` R67, with its two directions `to_language` and `to_english`) and the member-only `translationadopt`, `translationconfirm`, `translationrevert` (`instance-setup`, T37-30), each named once as a selector and read from the catalogue by id; `mode` is run-rules' `DRAFT_MODE.mode`; a stated absence while no `translationdraft` is published (true of every published pack in T37: the ops are declared only in L11, T37-31); with it, a missing member act throws naming it (R1's form). Clause (d) is DEC-157 (4) as Bob ruled it: unchanged, a protected word shows once one speaker keeps it; changed or typed, it waits for the second check. `DECISIONS_SOURCE` and `LANGUAGE_SECTION` exported.
- J1 / B2 (K2211): the three sub-clauses no canon sentence states (a placeholder kept as it stands; the draft or reading keeping nothing itself; the reading back of the kept word alone, labelled, adopting nothing) are not authored; the layer's `held_by_code` names the code that holds each.
- `skillpack.mjs`: `SOURCING.interface_translation` (`authored`) and `interface_translation_unpublished` (`absent`); the layer in `disclosed` after `writing_help`, before `wizard_scripts` (R5).
- Tests: new `translation.test.mjs`, twelve tests each naming R39, one per clause (a)–(e), plus the layer's place, labels, acts, R1 throw, R9 absence with R11's version, R22 (reads no account, grant, keep-away setting, language or word list) and R16/R24/R26; `pack.test.mjs` R5 and `writing.test.mjs` R36 updated to R5's amended order. A mutation (clause (d)'s "one speaker" changed to "two speakers") turned two R39 tests red; restored.

**Deferred.** None.

**Other modules (no REPORT needed).** The rendered pack gains a layer, so every pack's version moves (R11); `agent-model` R4 caches it and reads it fresh. The users of `skills` (`agent-worker`, `answer-envelope`, `control-plane`) give the same results with my change as without it: answer-envelope and control-plane 207 pass, 0 fail; agent-worker 7 pass, 4 files fail identically before and after (`agent-worker.test.mjs`, `harness.test.mjs`, `requirements.test.mjs`, `versions.test.mjs`: the test's own helper sends its credential in the address, refused `CREDENTIAL_IN_ADDRESS`, T36 L11's admission change; not mine, and outside rule 6's census only if BOB has not listed it there).

**Tests and checks.**
- `node --test bio-plane/test/m/skills/`: tests 94, pass 94, fail 0.
- `node checks/format.mjs .`: 136 modules, 135 requirements files; 0 failures.
- `node checks/architecture.mjs . skills`: 14 product files, 66 relative imports; 0 failures.
- `node checks/coverage.mjs . skills`: 39 of 39 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs . skills tranche/T37`: 6 files changed by skills between tranche/T37 and HEAD; 0 failures.

Size (session_01DS51oYchEqheueabPH79qD): test runs 9, module lines 2514

## J1 · QUESTION

R39's clauses that no canon sentence states (K921's pattern: reported, never authored). My best reading for each, which I am building on now:

1. (b) "keeping each placeholder as it stands": canon holds only DEC-179 (3) "`{name}` marks a placeholder." Reading: the layer carries that sentence as its clause and authors no "keep it" clause; its note names the code that holds it (instance-setup drops a `to_language` draft whose placeholders changed, K2201), as `wizard_authoring`'s `judged_not_coded` names what code refuses.
2. (d) "the assistant's draft or reading keeps or confirms nothing itself": canon states the keeping and confirming as members' (DEC-157 (2) "a granted speaker reads each against the English and keeps or corrects it"; DEC-157 (4); §L DEC-127 "a member who knows the language checks and adopts each"), and record-grammar R50's `machine_proposed` sentence ("it can draft a translation and it can never adopt or confirm one") is carried unchanged in `labels`. Reading: those carry it; no authored clause.
3. (e) the reading back into English "translates the kept word alone, is labelled machine work, and adopts nothing": canon states only that an administrator confirms "after reading the assistant's translation of them back into English" (DEC-157 (4)) and §L's "an administrator reading the assistant's back-translation". Reading: carry those two; "alone", the label and "adopts nothing" are not authored as clauses, and the note names their holders (agent-worker R69: `to_english` exactly one kept word; instance-setup: `to_english` writes nothing; record-grammar R50's label).

Also, mine (recorded, not asked): the layer carries `mode` as run-rules' `DRAFT_MODE.mode`, as `writing_help` does; DECISIONS.md is canon by requirements/README.md's DEC row ("each ruling"), so each DEC clause is found in that DEC's `response:` ruling, not its `owed:` line.

## J2 · COMPLETE

T37-14 applied: the interface_translation layer (R39), R5's order. 94/94 skills tests; format, architecture, coverage (39 of 39), ownership: 0 failures. J1's readings as B2 ruled (K2211). Completion in my record; nothing deferred.

## Completion, after B3 (K2214)

Merged `tranche/T37` @ 6490d909c1 (run-rules, capture-requests, answers) into my branch; no conflict, no change to my code needed (run-rules' `DRAFT_MODE.mode` is still `draft`, read, never typed). Re-run: `node --test bio-plane/test/m/skills/`: tests 94, pass 94, fail 0; format 0 failures; architecture (15 product files, 71 relative imports) 0 failures; coverage 39 of 39, 0 failures; ownership 6 files, 0 failures.

Size (session_01DS51oYchEqheueabPH79qD): test runs 10, module lines 2514

## J3 · COMPLETE

B3 applied: tranche/T37 @ 6490d909c1 merged, no conflict, no code change. 94/94 skills tests; format, architecture, coverage (39 of 39), ownership: 0 failures.
