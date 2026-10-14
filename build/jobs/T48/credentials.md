# credentials (T48)

**Status** · session_019yjReZUpXMLtca7kaoYDyK · depth 2 · RUNNING until 2026-10-14T10:46:04Z (users' tests (638 files)) · handled B2

## Record (CREDENTIALS #15, T48-11)

**Reading.** Read whole: `build/requirements/credentials.md`; the split map `build/extraction/credentials-split.md`; `requirements/ai-accounts.md` (whole; its public part is the reading set); the public parts of `membership`, `record-core`, `record-grammar`; `layers.md`' contract and layer-2 split section; my entries in `plan/current.md` and its opening rules; every file of `src/credentials/` (index.mjs, schema.mjs, checks.mjs). The tests (25 files, over the 600 KB limit with the rest, K2700) were read by a helper in this session told my entries, which wrote a digest citing each file and line (mechanics §17 (3)); the files I changed I read in the parts I changed. Of `ai-accounts`' code I read the seams I call (R24–R26), its factory and its ops map.

**Entries applied (T48-11).**
- The copies `ai-accounts` took are deleted from `index.mjs`, `schema.mjs` and `checks.mjs` (the 36 services, their helpers and the seal; the eleven tables' DDL, additive columns and classes; `AI_WORDS` and the 21 moved C-29 rows). Own code now 2,600 lines (index 2,060, schema 282, checks 258), from 4,433.
- `credentialsOf` makes `ai-accounts` first, on the same storage, with the seal secret and membership it is given (`aiAccountsOf`); `migrate` runs `this.accounts.migrate()` first; `declareTables` declares the own fourteen only (R30, R18), in the same commit.
- Re-pointed (split map §3): R27 (`accountActBar`, `aiKeptAway`, `notYourAccount`, `accountServing`), R32 (`accountMemberNotActive`, `aiKeptAway`, `servingAccountOf`, `noAccount`), R63 (`accountMemberNotActive`, `aiKeptAway()`), R29 (`sealText`/`unsealText`, owner `group:<service>`; a set of fields that opens and does not parse answers R24's own refusal, asked of its one site, per AI-ACCOUNTS' note). R16's listener no longer clears the sign-in (ai-accounts R27).
- R72: `MOVED_TO_AI_ACCOUNTS` (frozen, the 36 names) and one delegate per name; `USE_KINDS` and a frozen `ACCOUNT_CHECKS` view (`AI_ACCOUNT_CHECKS` + own rows) re-exported from `index.mjs` only; `credentialsOps` spreads `aiAccountsOps(c, …)` over the delegates (52 ops, as before).
- R73: `start` registers `onAccountCleared("credentials", …)`: `signin` revokes her run credentials; `reference`, or `signin` with `reference_held: false`, ends her standing grants.
- R71 (6): the code already read the query (T47-81); its test added.
- Tests: `account`, `group-key`, `t42` removed and the moved arms of `t35-misc`, `t36`, `t37`, `t38`, `t40`, `t41`, `t47`, `t47-signin`, `rows-ops` removed (ported by AI-ACCOUNTS to `test/m/ai-accounts/`); the census (`rows-ops`), the declaration and purge tests (`seam`, `t35-misc`) and the keep-away test (`t37`) re-tagged to the split; new `t48.test.mjs`: R71 (6), four R72 tests (each delegate against a sentinel, the re-exports, the 24 ops through both maps, the factory and the migrate order) and four R73 tests (registration once; a disconnection revokes a run credential, control another's; a reference removed and a reference-less sign-in end a standing grant, control a held reference keeps it; a throwing later listener leaves the act). I read my own code and tests (P20); no flaw found beyond the split's.

**Deferred.** None.

**Found in other modules (REPORT J1).**
1. `modules.json` (BOB's): credentials' `uses` must gain `ai-accounts` (the entry says so). Until it does, architecture shows 4 failures for my files, each that one edge; with it, 0.
2. Two tests outside my module read credentials' `checks.mjs` for `DISCLOSURE_DUE`, now `ai-accounts`' (C-29.40): answer-envelope `test/m/answer-envelope/envelope.test.mjs` (R14, :305, asserts the one holder is `src/credentials/checks.mjs`) and control-plane `test/m/control-plane/envelope.test.mjs:433` (R32, R39, R46: the decorated wire codes lose `DISCLOSURE_DUE` while `CHECK_FAMILY_FILES` lacks `src/ai-accounts/checks.mjs`). Both are split map §7 risk 3, cleared by T48-65; the plan names only `families.test.mjs` R2, so these two want naming.
3. `ai-accounts` R26 does not tell its listeners when Anthropic refuses a sign-in (`subscriptionTokenRefused`), so R73's "or Anthropic's refusal" never reaches credentials: a refused sign-in leaves her run credentials live (as before T48). R73's listener revokes them on any `signin` notice; the gap is ai-accounts R26/R19's.
4. Generated artifact: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is staled by this merge (credentials' files changed; `ai-accounts` now imported by the plane through credentials); rule 5 (5), for L2's close.

**Tests and checks.**
- `node --test bio-plane/test/m/credentials/`: tests 136, pass 136, fail 0.
- Users through R72 (every module whose `uses` names credentials, with ai-accounts, membership, promotion, answer-envelope, op-declarations, affordances and extraction: 638 files): tests 4610, pass 4577, fail 31; on `tranche/T48` the same files 4596, 4563, 31. New on this branch: the two of item 2, and control-plane `t46-e2e` R75 `home` (load-only: passes alone, twice, its neighbour fails in both runs). ai-accounts' 109 tests pass with credentials composed.
- `format.mjs`: 0 failures. `architecture.mjs credentials`: 4 failures, all item 1 (0 with the edge, checked with `modules.json` edited and restored). `coverage.mjs credentials`: 49 of 49 live ids named; 0 failures. `ownership.mjs credentials tranche/T48`: 18 files, 0 failures. `run.mjs`: format 0, architecture 4 (item 1), coverage 46 failures none credentials', channels 0.

Size (session_019yjReZUpXMLtca7kaoYDyK): test runs 14, module lines 2600
