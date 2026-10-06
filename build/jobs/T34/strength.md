# strength (T34)

**Status** · session_01HdPzDn9cNafgSHaFtViiZA · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

T34-31 and T34-86 complete on `job/T34/strength` @ e6219f30ab (code), `tranche/T34` @ 9ff5459bce as base (only plan and mailbox commits since my branch point; no file I read changed).

**Entries applied**
- **T34-31 (N576, K1601).** R36 grades a `CALC-` leg through calculations' synchronous read (its R30, `gradeFactsOf`), reached on the same host by default. STRENGTH #12 had already coded the walk to this interface, falling back to undetermined while no synchronous read existed. This job proves it against the real module: a new test, `calcread.test.mjs`, builds, accepts and withholds calculations in calculations' own test world and drives strength at its interface. Results: undetermined before acceptance; B, the table's capture, after acceptance; D with a typed value; a calculation not held is undetermined. `strengthOf`, `gradingFacts` and `recomputePair` agree. `inquiryStrength` withholds a calculation that calculations R10 withholds from the viewer, and the grade does not change with the reader. One improvement: R36 says "the method is named beside the grade". The real module's method note is usually null, so nothing was named. The leg's `why` now names the method's version (`method bio-calc/1`), plus its note when there is one. No requirement wording changes.
- **T34-86 (DEC-149, K1784).** I reworded six member-facing strings:
  - `method.mjs`:378 (the plan's line). `recomputePair`'s unknown-version refusal now needs no name: "…is not one that has been published, so the grade cannot be recomputed by it". It is also read by readers' case checkers, where "your group's" would be wrong.
  - Five more in `index.mjs` that BOB's grep missed ("this copy holds", "this plane's"). Four now say "your group's Civicsmith": another group's finding with no accepted work held, or not held at its edition (R33); a calculation not held (R36); an obligation not held (R38). One needs no name: the two-subjects refusal's detail (R11), "…and does not guess which one was meant."
  - `words.test.mjs` names each changed string in full. Code comments are unchanged.

**Deferred:** none.

**Found in other modules (for BOB)**
- (a) **Generated artifact made stale (§14):** `bio-plane/src/case-checker/program.mjs` bundles `strength/method.mjs`, so the method.mjs:378 wording stales it. case-checker R13 ("the committed program.mjs is that build") is red: 33/34, green before this change. Regenerate it at layer close (`node bio-plane/src/case-checker/build-program.mjs`), then the plane bundle, which bundles program.mjs. No other user's test asserts any old string (grep of `bio-plane/test`).
- (b) `calculations` R9 and R36 name "a value a third-party engine computed" as undetermined. Calculations' grade facts carry no field marking such an input, so strength's check (`engine` without `engine_measured`) is never met by the real module. This is harmless while no calculation input is engine-computed. When workbooks feeds a calculation, calculations should mark the input; strength reads `engine`/`engine_measured` per input.

**Tests and checks**
- strength: `node --test bio-plane/test/m/strength/` → tests 143, pass 143, fail 0.
- case-checker (it bundles method.mjs): tests 34, pass 33, fail 1 (R13, (a) above).
- `format`: 126 modules, 125 requirements files; 0 failures.
- `architecture strength`: 22 product files, 83 relative imports; 0 failures.
- `coverage strength`: 39 of 39 live requirement ids named by a test; 0 failures.
- `ownership strength tranche/T34`: 7 files changed by strength; 0 failures.

Size (session_01HdPzDn9cNafgSHaFtViiZA): test runs 7, module lines 2768
