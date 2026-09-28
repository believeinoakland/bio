# inquiry (T10)

**Status** · session_01HRS6LAssjHFRPkTUcmR4Aq · depth 2 · WORKING · handled B1

## J1 · REPORT

Early push for N186, as B1 asks: `actNoBasis(detail, extra?)` is now exported from `bio-plane/src/inquiry/index.mjs` (R45), at 104a5ad087 on `job/T10/inquiry`. `extra` now joins first, so it can never replace the refusal's own fields (R45's text; it could before). Tested by `test/m/inquiry/nobasis.test.mjs`; the module's 52 tests pass. basis-versions can import it once you merge me. The rest of the job continues on this branch.
