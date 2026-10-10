# inquiry-grammar (T41)

**Status** · session_019r4sMshUDytbLD9gL3qFXk · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R18's representation, and my best reading of the closed shape (I am building on this reading now; the answer does not block me).

1. Representation. R18 states `bias_applied` as a list of objects on a leg. A leg is itself an item of `basis[]`, and record-grammar R7 lets a list item hold scalars only (the reason R17 flattens a derived connection into five `derivation_*` scalars). So a `bias_applied` list cannot be written in a bundle's front matter; it can only arrive as a parsed value (an act's JSON input, or a caller's ctx). My reading: the grammar judges the value as R18 states it, wherever it comes from, and invents no flat form. If you want it representable in front matter (a flat form, or a top-level block keyed by leg ord, as `division_apportionment` is), that is a requirement change: tell me which.

2. The shape as I check it (each departure one C-2.8 error, code `BIAS_APPLICATION_MALFORMED`, naming `basis[i].bias_applied[j]` and the field): absent, null or '' is no application; an empty list is admitted (nothing applied); not a list is one error; an item that is not an object is one error; `statement` a non-empty string (trimmed), never a minted form (K2474); `effect` one of `grade_lowered`, `leg_excluded`, `inference_refused`; `grade_lowered` requires `from` and `to` in `BASIS_GRADES` with `to` strictly weaker than `from` (a lowering); `from`/`to` on any other effect is an error; any key outside `statement, effect, from, to` is an error (the shape is closed). It runs on every object leg the lead and theme arms let through, the derived kinds (R11, R14, R15, R17) included, and moves no grade and is never compared with the leg's own grade.

3. For basis-versions R48 (which uses "R18's shape" with effects `inference_refused`, `scrutiny_raised`): I export `BIAS_EFFECTS` and `biasAppliedFindings(label, value, findings, {effects, checkId})`, effects and the check id parameters, the code and row this module's (as `importedLegFindings` takes `checkId`).

## J2 · COMPLETE

**Completion (T41-13).** Branch `job/T41/inquiry-grammar` @ the commit carrying this entry; `tranche/T41` merged in for K2479 (B2).

**Reading set (mechanics §17).** Measured at START, about 283 KB: requirements (18.5 KB), layer 6's row and the inquiry-grammar fold of `build/layers.md`, the module's code (3 files) and tests (`corpus.mjs`, `fixture.mjs`, five test files; `golden.json` is a data fixture and was not read, as K2053 allows: no change relies on its content beyond the parity tests that already compare with it), each used module's Purpose and the Provides clauses of the services the Uses names. Under 300 KB, so I read all of it whole myself; no worker summary.

**Entries applied**
- **R18 (D59; K2448, K2472, K2474, K2479)**, in `grammar.mjs`:
  - **The encoding.** Applications are written on the leg as numbered scalar keys `bias_<n>_statement`, `_effect`, `_from` and `_to`, `n` from 1 and contiguous. `flattenBiasApplied(list)` writes them; it answers `{}` when nothing is applied and null for a value it cannot write. `readBiasApplied(row)` reads them back in number order. A test shows they round-trip through record-grammar's front-matter parser and add no finding through `checkBundle`.
  - **`biasAppliedFindings(label, value, findings, {effects, checkId})`** takes a row in the encoding (a leg or a conclusion row) or the list itself. Each departure is one `checkId` error (C-2.8 by default), code `BIAS_APPLICATION_MALFORMED`, naming the key. The departures:
    - a `bias_applied` key on a row (not the encoding);
    - a number not written 1, 2, … or a field outside the four;
    - a gap in the numbering;
    - more than 32 applications;
    - a statement that is not a non-empty string, or one over 200 characters or holding a quote, backslash, newline or `#`;
    - an effect outside `effects`;
    - on `grade_lowered`, a `from` or `to` that is not a grade, or a `to` not weaker than its `from`; `from` or `to` on any other effect;
    - a statement applied with the same effect twice.

    Keys of the form `bias_<word>`, such as a conclusion row's `bias_statements_sha`, are not the encoding and are left alone. The function answers the number of departures, and it is pure.
  - **`BIAS_EFFECTS`** is `grade_lowered`, `leg_excluded`, `inference_refused`, frozen.
  - **In `checkInquiryBasis`** the arm runs on every leg the lead and theme arms let through, the derived kinds included, after role and note and before the extent. It moves no grade: it is never compared with the leg's grade. In-force is not asked here (inquiry R61).
- **The row** `BIAS_APPLICATION_MALFORMED` (C-2.8, `biasApplicationRefusal > is-bias-application-form`), with my draft translation. It awaits promotion's next stamping.
- Exports added to `index.mjs`.

**Deferred:** none.

**Found in other modules** (each red is caused by my change and is that module's to clear)
1. **inquiry** `test/m/inquiry/` "R38 R4 the rows the module mints are inquiry-grammar's…" pins `INQUIRY_GRAMMAR_CHECKS`' ids. It goes red on the new row (same as T34's item 1). INQUIRY's job (T41-15, R61) adds `BIAS_APPLICATION_MALFORMED` to its expectation.
2. **case-checker** generated artifact `bio-plane/src/case-checker/program.mjs` is stale from my grammar change: its R13 test is red until it is regenerated at the layer close (mechanics §14). I did not write it.
3. For **basis-versions R48**: use `flattenBiasApplied`/`readBiasApplied` on the conclusion row, with `biasAppliedFindings(label, row, findings, {effects: ["inference_refused", "scrutiny_raised"], checkId: <its C-25 id>})`. Its `bias_statements_sha` is not read by this arm.

**Tests and checks**
- **inquiry-grammar:** 76 pass, 0 fail (`node --test bio-plane/test/m/inquiry-grammar/`). The new file `t41.test.mjs` holds 16 R18 tests with negative controls (K874). `grammar.test.mjs`'s R7 row-list test now names twelve rows.
- **Users of the module** (accepted-work, leg-earning, inquiry, basis-versions, strength, skills, reevaluation, ratification, case-import, case-disclosures, case-authoring, action-grammar, answer-envelope, store-door, control-plane, plane with `migrate-released`, plus promotion and case-checker), run on this branch's base and on the final code:
  - base: 1947 tests, 1924 pass, 22 fail, 1 todo;
  - mine: 1947 tests, 1922 pass, 24 fail, 1 todo.

  The 22 base reds are identical by name in both runs (the inherited reds). The two new ones are items 1 and 2 above.
- **Process checks:**
  - format: 145 modules, 144 requirements files; 0 failures;
  - architecture: 12 product files, 45 relative imports; 0 failures;
  - coverage: 18 of 18 live requirement ids named by a test; 0 failures;
  - ownership: 6 files changed by inquiry-grammar between tranche/T41 and HEAD; 0 failures.

Size (session_019r4sMshUDytbLD9gL3qFXk): test runs 11, module lines 2064
