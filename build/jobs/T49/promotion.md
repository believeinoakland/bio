# promotion (T49)

**Status** · session_01HL5YBcopVZSndbgMuYa2TJ · depth 2 · WAITING ON BOB (J1) · handled B1

## Work notes (PROMOTION #47)

- Read whole: `build/requirements/promotion.md`, the plan's rules 5–7 and my entry, the N1073 draft. My own code and the used services were not re-read in full before the stamp: the stamp is waiting on BOB's CHANGE (the other three L2 jobs' rows), so the code read is done at the stamp.
- Plan rule 6: N1068 grep for "labelled" in `src/promotion/`, `src/gate.mjs`: none. N1072 grep for `admin` as a word: none. N1075: the module draws no screen and carries no sentence `words.json` keys (that file is the UX stream's `docs/development/ux-substrate/screens/words.json`). D29: no screen; no `ok: true` carrying a refusal is treated as success.
- N1073 done: `write-path.test.mjs` R18's `LATER` list reads the check ids of `VERSION_FROZEN`, `VERSION_LEG_UNRESOLVED` (basis-versions' `BASIS_VERSION_CHECKS`), `SELF_BASIS`, `BASIS_CYCLE` (inquiry-grammar's `INQUIRY_GRAMMAR_CHECKS`) and `SURFACED_BY_REWRITTEN` (inquiry's `INQUIRY_SURFACE_CHECKS`) from their owners' declarations; the row count (35) is unchanged.
- `node --test bio-plane/test/m/promotion/`: 137 tests, 136 pass, 1 fail: `registry.test.mjs` R39/R45/R46 "every module's steps … in the modules' total order", which fails identically before my change: membership's `MODULE_ORDER` lacks `op-capabilities` and `site` (T49-1, R145); not mine.
- Not yet done: the stamp (T49-4 (D)). Waiting for BOB's CHANGE after membership, project-roster and credentials merge.

## J1 · REPORT

J1: N1073 done and tests run (promotion suite: 136 of 137 pass; the 1 red, registry.test.mjs module order, is membership T49-1's R145, red before my change). Rule 6 greps clean. The stamp waits for your CHANGE once membership, project-roster and credentials have merged into tranche/T49. I am idle until then.
