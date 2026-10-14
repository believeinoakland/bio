# promotion (T49)

**Status** · session_01HL5YBcopVZSndbgMuYa2TJ · depth 2 · WORKING · handled B2

## Work notes (PROMOTION #47)

- Read whole: `build/requirements/promotion.md`, the plan's rules 5–7 and my entry, the N1073 draft. My own code and the used services were not re-read in full before the stamp: the stamp is waiting on BOB's CHANGE (the other three L2 jobs' rows), so the code read is done at the stamp.
- Plan rule 6: N1068 grep for "labelled" in `src/promotion/`, `src/gate.mjs`: none. N1072 grep for `admin` as a word: none. N1075: the module draws no screen and carries no sentence `words.json` keys (that file is the UX stream's `docs/development/ux-substrate/screens/words.json`). D29: no screen; no `ok: true` carrying a refusal is treated as success.
- N1073 done: `write-path.test.mjs` R18's `LATER` list reads the check ids of `VERSION_FROZEN`, `VERSION_LEG_UNRESOLVED` (basis-versions' `BASIS_VERSION_CHECKS`), `SELF_BASIS`, `BASIS_CYCLE` (inquiry-grammar's `INQUIRY_GRAMMAR_CHECKS`) and `SURFACED_BY_REWRITTEN` (inquiry's `INQUIRY_SURFACE_CHECKS`) from their owners' declarations; the row count (35) is unchanged.
- `node --test bio-plane/test/m/promotion/`: 137 tests, 136 pass, 1 fail: `registry.test.mjs` R39/R45/R46 "every module's steps … in the modules' total order", which fails identically before my change: membership's `MODULE_ORDER` lacks `op-capabilities` and `site` (T49-1, R145); not mine.
- Not yet done: the stamp (T49-4 (D)). Waiting for BOB's CHANGE after membership, project-roster and credentials merge.

## J1 · REPORT

J1: N1073 done and tests run (promotion suite: 136 of 137 pass; the 1 red, registry.test.mjs module order, is membership T49-1's R145, red before my change). Rule 6 greps clean. The stamp waits for your CHANGE once membership, project-roster and credentials have merged into tranche/T49. I am idle until then.

## J2 · COMPLETE

T49-4 is done on job/T49/promotion, with tranche/T49 merged in after B2 (membership, project-roster and credentials merged).

**Entries applied.**
- **The stamp, 1.75.0 -> 1.76.0 (MINOR).** `ROW_CENSUS` = 1907 rows, sha256 e20355819ac78cfe8991def71b3c719c0dd7507f573703422b58d5b049149835, over tranche/T49 after L2. Against 1.75.0's own lines: 10 arrived, 23 changed, 1 retired (34 lines). `gate.mjs`' note lists them by module.
  - Arrived: action-replies C-150.8, .9, .10; following C-137.26; instance-setup C-64.31, .32, .33; review C-87.17; entities C-91.9 (C-117.28 retired into it); membership C-96.54 `FOUNDER_HANDLE_NOT_FOUNDER` (T49-1).
  - Changed (23): C-113.6; C-115.47, C-115.48; C-117.34, .35; C-131.7, .24; C-144.4, .13; C-29.41; C-32.4; C-33.5-.9; and L2's C-96.32, .33, .39, .40, .41, .46 and C-96.52 (membership's and credentials' N1075 wording read by key; C-96.52 `where` and translation).
  - Credentials added no row (K3337). No family arrived. No composition change is named by any record.
  - Two of K3321's items I could not match to a record by id (C-131.7 and C-115.48 are named by code in wizard-scripts/filings records only): the figures come from the tree.
- Snapshot: `fixtures/row-census-1.76.0.jsonl` (1.75.0's renamed to it); the suite's header and AWAITING comments re-anchored. `row-census.test.mjs`: 10 arms pass.
- **N1073.** `write-path.test.mjs` R18's `LATER` list no longer hand-lists `VERSION_FROZEN`, `VERSION_LEG_UNRESOLVED`, `SELF_BASIS`, `BASIS_CYCLE` and `SURFACED_BY_REWRITTEN`'s check ids: it reads them from the tree through promotion's own census reader (`row-census.mjs`), since the architecture check refuses a direct import of a later module (an import of their tables failed it, 3 failures; reworked).
- **Plan rule 6.** N1068: no "labelled" in the module. N1072 grep: no `admin`. N1075 and D29: the module draws no screen and carries no `words.json`-keyed sentence. R41-R44's heading wording is BOB's edit.

**Read.** Myself, whole: `build/requirements/promotion.md`, `src/promotion/*.mjs` (index, checks, history, release, text, names, info2, record-checks), `src/gate.mjs` from the stamp notes (line 1043 on) and its code (1226 to the end); the first ~1040 lines of `gate.mjs` are earlier stamps' notes, not read again. Census suite and reader whole in the parts I changed; the other promotion tests were run, not read (plan rule 2). No flaw found in the module.

**Deferred:** none. **Found in other modules:** none. The 1 red `registry.test.mjs` arm of J1 is green now (membership's R145 merged).

**For you (BOB's file):** `build/modules.json` promotion `tests` must name `bio-plane/test/fixtures/row-census-1.76.0.jsonl` in place of 1.75.0 (as K3214). Until then `format` and `architecture` each show the one failure (the fixture is owned by no module). Stale generated artifacts: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) and `bio-plane/src/case-checker/program.mjs`, which carry CATALOG_VERSION 1.75.0, regenerated at the layer's close (rule 5 (5)). Requirements Status line is BOB's to update (R50's census is 1907 rows at 1.76.0).

**Tests and checks.**
- promotion's 16 files plus d526: 138 tests, 138 pass, 0 fail. row-census: 10 pass, 0 fail.
- run.mjs: format 1 failure (`modules.json`, above); architecture 1 failure (the fixture, above), 0 for my other files; coverage 7 failures, none promotion's (admission R27, agent-worker, ai-runs, capture, control-plane, op-capabilities, reading-pipeline: not yet met ids of T49 jobs); channels 0.
- ownership: 0 failures.

Size (session_01HL5YBcopVZSndbgMuYa2TJ): test runs 9, module lines 4000
