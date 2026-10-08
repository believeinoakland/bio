# promotion (T38)

**Status** · session_013zZkEVT5VnVz668Zz9kZux · depth 2 · WORKING · handled B1

## J1 · REPORT

T38-6's stamp is prepared and pushed on `job/T38/promotion` @ `0e6b2b79cb`, over `tranche/T38` at its layer 2 (no L2 job merged yet).

**The stamp.** `CATALOG_VERSION` 1.64.0 → **1.65.0** (MINOR). `ROW_CENSUS` **1546 rows, `d235871f06d5e065388a8cf13ef26ebc3403194d5c3bf379e2556e125eaebb6d`**. The fixture is renamed `row-census-1.64.0.jsonl` → `row-census-1.65.0.jsonl`. The 36 differences from 1.64.0 are exactly what T37's records name:
- 28 new: instance-setup C-64.11–.26 (the translation rows; C-64.18 NO_SUCH_MEMBER among them); case-carriage C-141.1–.6; case-disclosures C-120.17 PHOTO_NOT_COVERABLE and C-120.18; publication C-122.6; file-safety C-140.40–.42.
- 1 retired: instance-setup C-119.5 ASSISTANT_OFF.
- 7 changed, `where` only: conformance's seven C-113 rows (fixture lines 206, 212, 222, 225, 226, 228, 229; K2231).
- T38's L1 moved no row.

row-census: 8 pass, 0 fail.

**Waiting on L2.** Please send a CHANGE once project-roster, membership and credentials have merged. I will merge the tranche, check each moved row against its record and re-pin 1.65.0 in place. Rule 9 (N793) will likely move NO_SUCH_MEMBER. membership adds the helper and its row, and instance-setup's C-64.18 stays in place until instance-setup's own job drops it, which falls in a later layer and so goes to T39's stamp unless you rule otherwise.

**Pins that move.** `build/modules.json`: swap promotion's `tests` entry `row-census-1.64.0.jsonl` → `row-census-1.65.0.jsonl`. Until then, format shows exactly this one failure. The generated `case-checker/program.mjs` embeds 1.64.0, so regenerate it at L2's close (K1540). The plane bundle follows.

**Tests now.** promotion and d526: 119/120. The 1 red is `registry.test.mjs` R39/R45/R46 `MODULE_ORDER`, rule 6 item 4's red until T38-4. architecture 0; coverage 56/56; ownership 0; format 1 (the swap).
