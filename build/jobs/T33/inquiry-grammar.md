# inquiry-grammar (T33)

**Status** · session_01LroHgukPpcdTvG8EcQ4WHp · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

T33-43 readings; I am building on each now and will bring the work in line with your answer.

1. **R14 "listed in references[]" vs record-grammar's references arm.** record-grammar's `checkReferences` (`bundle.mjs:507`) refuses any `references[].target` that `BUNDLE_ID_RE` does not match with a C-6.1 error. `CALC-2026-0001` is not a bundle id (R3: CALC is a row, not a bundle), so an inquiry carrying a well-formed calculation leg, listed as R14 requires, can never pass `checkBundle` clean. My reading: build R14 as written (a calc leg missing from references[] is one C-6.3 error, as for an information leg). The fix belongs to record-grammar, which would have to admit a `CALC-` target in references[] (a REPORT follows). The other reading is that a calculation leg, like the occurrence (R15) and imported (R11) legs, is *not* listed in references[] and a references[] entry naming one is refused. Please say which.
2. **R15's key.** duties exports no key pattern; its `occurrenceKey` (`duties/index.mjs:704`) spells `OCC-` + 32 lowercase hex. I spell `OCCURRENCE_REF_RE` as `^occurrence:<idPattern("DUT") core>/OCC-[0-9a-f]{32}$` here, with no import of duties.
3. **R13's portion path.** standards exports no portion-path predicate. Its form (R18, `standards/index.mjs:356`) is a string, non-empty when trimmed, at most 200 characters. I check that form here and import nothing from standards. A `target_portion` on any other leg is left unasked (R16: nothing changes for a document holding no new leg kind).
4. **Final uses:** record-grammar, text-chain, record-core, content, connections, observation-log, **civil-time** (`isCalendarDate`, R3 and the hunch date per entry C-6) — **civil-time is not yet in my `modules.json` uses**, so the architecture check will fail until it is added (please add it). standards is not needed (reading 3).
5. **R13's single error.** A `connection` or `testimony` axis, or a `hunch` source, on a standard leg is one C-2.8 `STANDARD_LEG_AXIS` error. For that leg the hunch, testimony, earned and inherited arms then stay silent (a second complaint about one broken field). Other capture-axis departures (a testimony/resolution/inherited source) keep their existing arms. The earned-capture arm reads `earned.capture[STD-…]` as handed in (leg-earning R8).
6. **R3's message.** A trigger date not shaped `YYYY-MM-DD` keeps the catalogue's message ("is not YYYY-MM-DD"), so the golden parity holds. A shaped but impossible day (`2026-02-31`) reads "… is not a calendar date (YYYY-MM-DD)".

## J2 · REPORT

Found outside my paths, all caused by T33-43's R16 rows or reported as improvements. Each of the three reds below is green on `tranche/T33` without my change; with it, my module's own tests are 49/49.

1. **inquiry** `test/m/inquiry/grammar.test.mjs:176` ("R38 R4 the rows the module mints are inquiry-grammar's …") pins `INQUIRY_GRAMMAR_CHECKS` to exactly seven rows. R16 adds `STANDARD_LEG_AXIS`, `CALCULATION_LEG_MALFORMED` and `OCCURRENCE_LEG_MALFORMED` (all C-2.8), so the test is red until inquiry's T33 job re-pins it. Please name it as an accepted red at my merge.
2. **skills** `test/m/skills/doctrine.test.mjs:62` (R15): "C-2.8 is typed, read from no earlier owner's row". `src/skilldoctrine.mjs:244` types `"C-2.8"` (in `TYPED`), and its R15 refuses a typed number that an owner's keyed row holds. C-2.8 is now held by my three rows. Fix in skills' job: read it from a row (e.g. `INQUIRY_GRAMMAR_CHECKS.STANDARD_LEG_AXIS.check`) and drop it from `TYPED`. Please name it as an accepted red at my merge, until skills' T33 job.
3. **row-census** (`test/system/row-census.test.mjs`): `C-2.8 STANDARD_LEG_AXIS`, `C-2.8 CALCULATION_LEG_MALFORMED` and `C-2.8 OCCURRENCE_LEG_MALFORMED` arrive awaiting promotion's stamp (R16; T34). My COMPLETE names them `awaiting stamp`, and they join K1542's named red.
4. **Generated artifact (§14):** `bio-plane/dist/bio-plane.bundled.mjs` bundles my source and is now stale (layer close). `case-checker/program.mjs` does not include inquiry-grammar.
5. **Improvements for later (not needed now):** `duties` could export its occurrence key's pattern (R9; `occurrenceKey` spells `OCC-` + 32 hex). My R15 spells that form itself (J1 (2), accepted), and an export would give it one home. Likewise `standards` could export a portion-path predicate (R18: a string, non-empty when trimmed, at most 200 characters), which R13 now checks here.
