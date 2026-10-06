# inquiry-grammar (T33)

**Status** · session_01LroHgukPpcdTvG8EcQ4WHp · depth 2 · WORKING · handled B0

## J1 · QUESTION

T33-43 readings; I am building on each now and will bring the work in line with your answer.

1. **R14 "listed in references[]" vs record-grammar's references arm.** record-grammar's `checkReferences` (`bundle.mjs:507`) refuses any `references[].target` that `BUNDLE_ID_RE` does not match with a C-6.1 error. `CALC-2026-0001` is not a bundle id (R3: CALC is a row, not a bundle), so an inquiry carrying a well-formed calculation leg, listed as R14 requires, can never pass `checkBundle` clean. My reading: build R14 as written (a calc leg missing from references[] is one C-6.3 error, as for an information leg). The fix belongs to record-grammar, which would have to admit a `CALC-` target in references[] (a REPORT follows). The other reading is that a calculation leg, like the occurrence (R15) and imported (R11) legs, is *not* listed in references[] and a references[] entry naming one is refused. Please say which.
2. **R15's key.** duties exports no key pattern; its `occurrenceKey` (`duties/index.mjs:704`) spells `OCC-` + 32 lowercase hex. I spell `OCCURRENCE_REF_RE` as `^occurrence:<idPattern("DUT") core>/OCC-[0-9a-f]{32}$` here, with no import of duties.
3. **R13's portion path.** standards exports no portion-path predicate. Its form (R18, `standards/index.mjs:356`) is a string, non-empty when trimmed, at most 200 characters. I check that form here and import nothing from standards. A `target_portion` on any other leg is left unasked (R16: nothing changes for a document holding no new leg kind).
4. **Final uses:** record-grammar, text-chain, record-core, content, connections, observation-log, **civil-time** (`isCalendarDate`, R3 and the hunch date per entry C-6) — **civil-time is not yet in my `modules.json` uses**, so the architecture check will fail until it is added (please add it). standards is not needed (reading 3).
5. **R13's single error.** A `connection` or `testimony` axis, or a `hunch` source, on a standard leg is one C-2.8 `STANDARD_LEG_AXIS` error. For that leg the hunch, testimony, earned and inherited arms then stay silent (a second complaint about one broken field). Other capture-axis departures (a testimony/resolution/inherited source) keep their existing arms. The earned-capture arm reads `earned.capture[STD-…]` as handed in (leg-earning R8).
6. **R3's message.** A trigger date not shaped `YYYY-MM-DD` keeps the catalogue's message ("is not YYYY-MM-DD"), so the golden parity holds. A shaped but impossible day (`2026-02-31`) reads "… is not a calendar date (YYYY-MM-DD)".
