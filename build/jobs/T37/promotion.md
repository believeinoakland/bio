# promotion (T37)

**Status** · session_01WiFA4XkxDJf5nB8LQz8tAt · depth 2 · RUNNING until 2026-10-08T08:28:40Z (reading worker's summary) · handled B1

## J1 · REPORT

T37-7's stamp is done and pushed on `job/T37/promotion` @ `19fcb78829`, over `tranche/T37` after its layer 1. The re-pin for layer 2's rows waits on their merges.

**The stamp.** `CATALOG_VERSION` moves 1.63.0 → **1.64.0** (MINOR). `ROW_CENSUS` is **1516 rows, `2e65afafa4297c362499077bbfe9619ec255e5373113223b2f55f9b3b735c9e0`**. The 88 differences against 1.63.0 are exactly your START's list, each named by its T36 record: 47 new (admission C-38.10, .11; standards C-112.59–.62; case-authoring C-136.2; acquisition C-139.20; file-safety C-140.1–.39), 19 renumbered (acquisition C-137.1–.19 → C-139.1–.19), 1 retired (instance-setup C-119.6), 2 changed (C-112.41's `where`; C-119.5's translation). L1 moved no row.

**N754.** I did not rewrite 1.63.0's note to say C-139, because at 1.63.0 the rows were C-137 (its fixture holds them so). The note at `gate.mjs`:757–758 now says they were stamped under following's numbers, renumbered C-139 by T36-10, and stamped there in 1.64.0. The 1.64.0 note lists every row.

**What waits: layer 2's rows** (credentials: C-29.32's re-code, C-29.31, C-29.33, C-96.45, C-96.46 or as it numbers them; membership: none expected). **Please send a CHANGE after credentials' merge.** I will check the moved rows against its record, re-pin 1.64.0 in place, and complete.

**A red that was not named, now fixed (mine).** `d526-refusal-order.test.mjs` threw before its first arm on `tranche/T37`. It sent `token=` in the address, which admission refuses `CREDENTIAL_IN_ADDRESS` (C-38.10, T36 L11). Its section 2 also used the shared member key, now `MEMBER_TOKEN_RETIRED` (C-38.11). It now sends `Authorization: Bearer`, and section 2's machine credential is an agent credential Ruth mints with `writes: ["promote"]`. Result: 31/0.

**Improvement in my own module.** Private `#fact` (`index.mjs`): a provider that throws now refuses the act `FACT_FAILED` (C-102.5) with its row, as `fact()` does (R40, R37). Before, it escaped as a raw `PROMOTE_FAILED` or `REOPEN_FAILED`. New test in `registry.test.mjs`; negative control: the test is red without the fix.

**Pins that move with the stamp** (§14; the worker's grep, file:line):
- case-checker `bio-plane/src/case-checker/program.mjs`:4 (generated) embeds "1.63.0", 1470 and `e9ef089b…`. Its `program.test.mjs`:19–24 and the offline-run arm stay red until it is regenerated (`node bio-plane/src/case-checker/build-program.mjs`, first in K1540's order at L2's close). The plane bundle follows.
- `build/modules.json`: swap promotion's `tests` entry `row-census-1.63.0.jsonl` → `row-census-1.64.0.jsonl`. Until then, format and ownership each show exactly this one failure.
- Every other reader imports the constant. No other test pins "1.63.0".

**For BOB (requirements, yours):** promotion's Uses (`promotion.md`:126–130) has drifted from the code. The producing group is the registered fact `producingGroup`, not a membership service. Uses omits record-grammar and test-support, which `modules.json` lists. It also omits membership's `noSuchProject`, `existenceAct`, `projectCreated`, `visibilityOf`, `visibilitySettingRefusal`, `CUSTODIAL_CHECKS` and `MODULE_ORDER` (index.mjs:21, :473, :559, :840, :857). This is wording only, and nothing fails.

**Tests and checks.**
- row-census 8/0.
- promotion and d526: 119/120. The 1 red is accepted red 9 (`registry.test.mjs`:58, `MODULE_ORDER` lacks image-cover, until T37-44).
- architecture 0 failures; coverage 56/56; format and ownership 1 failure each (the swap above).
