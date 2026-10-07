# promotion (T35)

**Status** · session_0149kWBQZo4PvpqDKSn6ihKi · depth 2 · COMPLETE · handled B4

## J1 · REPORT

T35-16's two shares are done and pushed on `job/T35/promotion` @ `dbb9b8c51a`, over `tranche/T35` after its layer 1. The stamp of layer 2's own rows waits on their merges.

**The sweep (19 rows).** Each is applied where it lands, under your rule. Seven check rows now say "your group's Civicsmith": C-86.3, C-64.1 (both its lines), and C-102.4–.8 (the build-fault sentence matches record-core R82's `BUILD_FAULT`). Also `gate.mjs`:972 ("the acquisition receipt of your group's Civicsmith"), `index.mjs`:169 and :624, and `names.mjs`:84. The four X→M rows (`index.mjs`:405, :413, :416, :903) keep their field names (`bundleId`, `id:`, `newId`), and "the plane" becomes "the record", the thing that mints a project's id and writes it in. That matches the C-59 translations. The new `test/m/promotion/wording.test.mjs` has 12 tests. Each reads a string through the act that serves it and names the requirement whose refusal carries it. All 12 fail on the old sources.

**The stamp.** `CATALOG_VERSION` moves 1.61.0 → **1.62.0** (MINOR). `ROW_CENSUS` is **1378 rows, `c6c85ffe278847895cce16ca40b37ca8200d6f11a24b3b304470b390ade1642b`**. Against 1.61.0: 62 new rows, 5 re-keyed (duties C-133.19/.21/.24, hypotheses C-134.5/.7), and 78 changed. I checked every moved row against a T34 job record or this job's sweep. The fixture `row-census-1.62.0.jsonl` is written and 1.61.0's is deleted. `gate.mjs`'s 1.62.0 note lists the rows by family. row-census: 8 pass, 0 fail.

**What waits: layer 2's rows.** These are record-core's (`ANONYMOUS_LEASE`, `SETTING_*` and its 26 sweep rows), membership's (C-55.1, C-96.11, C-102.11, .12), and credentials' (C-29.x, C-63.x, and the new refusals R38–R47, K1934). None is on `tranche/T35` yet. As in T34, I re-pin 1.62.0 in place at each merge, so T35 names one catalogue. **Please send a CHANGE after each L2 merge (or one after credentials').** I will check that the moved rows are exactly the ones its record names, then re-pin and complete.

**For you at merge (§14).**
- `modules.json`: swap promotion's `tests` entry from `row-census-1.61.0.jsonl` to `row-census-1.62.0.jsonl`. Until then, format and ownership each show exactly this one failure.
- These are stale and yours to regenerate:
  - case-checker's `program.mjs`, which embeds `CATALOG_VERSION` (its R13 ×2 are red until regenerated);
  - the plane bundle;
  - `newgroup/src/release.mjs`, which carries the old promotion strings.

**Fixed in my own tests.** `row-census.mjs` left out only a hand-kept list of fleet members' `scripts/`. It missed `sheet-worker` and `agent-runner`, so importing the census ran sheet-worker's build (byte-identical, so nothing changed). It now leaves out every top-level `scripts/` by its shape, which is R50's "every fleet member's". The census is unmoved.

**Tests and checks.**
- promotion and d526: 118/119. The 1 red is accepted red 5 (`registry.test.mjs`:58).
- architecture: 0 failures. coverage: 56/56.
- format and ownership: 1 failure each, the swap above.

## Completion

**Entries applied (T35-16).**
- **The sweep (19 rows, DEC-149, K1899 (1)).** Seven check rows now say "your group's Civicsmith": C-86.3, C-64.1 (both lines), and C-102.4–.8 (the build-fault sentence as record-core R82 words `BUILD_FAULT`). The same applies to `gate.mjs`:972, `index.mjs`:169 and :624, and `names.mjs`:84. The four X→M rows, `index.mjs`:405, :413, :416 and :903, keep their field names (`bundleId`, `id:`, `newId`) and name the record as what mints a project's id and writes it in. The new `test/m/promotion/wording.test.mjs` has 12 tests, each reading a string through the act that serves it, under the R of the refusal that carries it. All 12 fail on the old sources.
- **The stamp (N553's tail, K1934).** `CATALOG_VERSION` moves 1.61.0 → **1.62.0** (MINOR). It covers T34's layers 3–11 (62 new rows, 5 re-keyed, 78 changed) and this job's rows, over `tranche/T35` after L1. It was then re-pinned in place at each L2 merge:
  - record-core and membership, B3 (K1942): C-102.28–.32 arrived; C-59.6–.9, C-102.1, .2, .11–.27, C-55.1 and C-96.11 changed.
  - credentials, B4 (K1945): C-29.28, .29 and C-96.39–.43 arrived; C-29.1, .3, .5, .22, C-63.1 and .2 changed.

  At every step the moved rows were exactly those the job records name. Final `ROW_CENSUS`: **1390 rows, `ff8c67437e16423657f54c504f5c460af81b9b98556b83d833307b9d14981f22`**. The fixture is `bio-plane/test/fixtures/row-census-1.62.0.jsonl`; 1.61.0's is deleted. `gate.mjs`'s 1.62.0 note lists every row by family.
- **Own flaw fixed.** `row-census.mjs` left out only a hand-kept list of fleet members' `scripts/`. It missed sheet-worker and agent-runner, so the census imported and ran sheet-worker's build. It now leaves out every top-level `scripts/` by shape (R50's "every fleet member's"). The census is unmoved; accepted in B2.

**Deferred.** None.

**For BOB at merge (§14).**
- `modules.json`: swap promotion's `tests` entry `row-census-1.61.0.jsonl` → `row-census-1.62.0.jsonl`. Format and ownership each show exactly this one failure until then.
- Stale and yours at L2's close (rule 7):
  - case-checker's `program.mjs`, which embeds `CATALOG_VERSION`; its R13 ×2 stay red until it is regenerated.
  - the plane bundle.
  - `newgroup/src/release.mjs`, which carries the old promotion strings.

**Tests and checks** (on the final tree, after B4's merge):
- `node test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (1.62.0, 1390 rows, `ff8c6743…`).
- `node --test test/m/promotion/ test/d526-refusal-order.test.mjs`: 119 pass, 0 fail. Red 5 cleared with membership's merge.
- credentials, membership and record-core: 442 pass, 0 fail.
- case-grammar: 81 pass, 0 fail. case-checker: 33 pass, 2 fail, the stale `program.mjs` (R13 ×2, yours to regenerate).
- `checks/format.mjs`: 1 failure (the `modules.json` entry above).
- `checks/architecture.mjs bio promotion`: 0 failures.
- `checks/coverage.mjs bio promotion`: 56 of 56, 0 failures.
- `checks/ownership.mjs bio promotion tranche/T35`: 1 failure (the new fixture, until the swap).

Size (session_0149kWBQZo4PvpqDKSn6ihKi): test runs 16, module lines 3420
