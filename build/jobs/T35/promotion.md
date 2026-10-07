# promotion (T35)

**Status** · session_0149kWBQZo4PvpqDKSn6ihKi · depth 2 · WAITING ON BOB (next CHANGE) · handled B2

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
