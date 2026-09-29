# T13: what the layers route to legacy-tests (K427)

**Status** · Kept by BOB #65 as each job reports; legacy-tests' START names this file. Each line: the source, then what legacy-tests re-anchors or re-measures.

- ODF-READER #3 J3 (K429): `bio-plane/test/formats-odf.test.mjs`:461 pins the old R16 shape (`hRows.rows` = `[3]`); R16 lists ranges `{min, max, visibility}`.
- RECORD-CORE #7 J1 (K430): the DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`): C-59.6 `MINT_EXHAUSTED` in `RECORD_CORE_CHECKS`; floors +1 each (families, rows, governedSites, regions, regionLines +5, codesChecked +2, outcomeReturns, refusalsJudged); the `MINT_EXHAUSTED` multi-site declaration (~3781) re-read once the callers converge (layers 2, 8, 11); the identical-translation pair with review's C-87.12 clears when review retires it (layer 8).
