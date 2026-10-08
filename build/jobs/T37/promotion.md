# promotion (T37)

**Status** · session_01WiFA4XkxDJf5nB8LQz8tAt · depth 2 · COMPLETE · handled B3

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

## Completion

**Entry applied (T37-7; T36's red 4, N754, N755's share).**
- **The stamp.** `CATALOG_VERSION` moves 1.63.0 → **1.64.0** (MINOR), over `tranche/T37` after L1 (`19fcb78829`). T36's layers 3–11 rows: 47 new, 19 renumbered (acquisition C-137.1–.19 → C-139.1–.19), 1 retired (C-119.6), 2 changed (C-112.41 `where`, C-119.5 translation), each named by its T36 job record (J1). T37's L1 moved no row.
- **Re-pinned in place at L2's merges (B3):** membership (K2183) moved no row. credentials (K2184) moved exactly the rows its record names: C-29.33, C-96.45, C-96.46 arrived; C-29.32 re-keyed NO_REASON → AI_KEEP_AWAY_NO_REASON; C-29.31 changed its `where` only.
- **Final `ROW_CENSUS`:** **1519 rows, `60d892ca0b04829cd026b93e791b74a9f2fd6062bdc20fd100817bcc909c3d5b`**. The fixture is `bio-plane/test/fixtures/row-census-1.64.0.jsonl` (renamed from 1.63.0's). Red 4 is cleared up to L2. Rows T37's L3–L11 jobs add are T38's stamp.
- **N754.** At 1.63.0 the rows were C-137 in fact, so `gate.mjs`:757–758 keeps that history and says they were renumbered C-139 by T36-10 and stamped there in 1.64.0 (accepted, K2182).
- **Own improvements.** `d526-refusal-order.test.mjs` sends credentials in the `Authorization` header (C-38.10) and uses an agent credential for section 2's machine credential (the member key is retired, C-38.11). The private `#fact` refuses a throwing provider `FACT_FAILED` (C-102.5) with its row (R40, R37), with a new test in `registry.test.mjs`; that test fails without the fix.

**Deferred** (own module, found by the reading worker; none is reachable or worth its code now):
- `history.mjs`:309: C-4.2 does not judge a `state_history` entry whose `from_state` is not in the type's table. Changing it changes a catalogue check, so it would need its own stamp; I left it.
- `index.mjs`:1154: `registerAuditCheck` is not guarded per record as the info2 grammar is. Record-core refuses a second registration, so nothing runs twice.
- `index.mjs`:1178: `recordAudit` has no caller.
- `#nameTaken` scans every project per write: O(projects).
- The head-group comparison with a null `groupId` cannot happen, because `group_id` is NOT NULL.

**Found in other modules.**
- §14: case-checker `src/case-checker/program.mjs`:4 (generated) embeds 1.63.0 and its census, so `program.test.mjs`:19–24 stay red until it is regenerated at L2's close (BOB's, B2). The plane bundle follows.
- Rule 4's interim red (N761), not named by credentials' record: d526's setup (`d526-refusal-order.test.mjs`:146) mints an agent credential through control-plane, which sends `secretSha` in the query until T37-33. So the suite stops at `AI_CREDENTIAL_NO_SECRET` (C-29.33), as `capture-requests/plane.test.mjs`:93 does. It was 31/0 before credentials' merge, and it passes again once T37-33 moves the send to the body.
- `build/modules.json`: promotion's `tests` entry `row-census-1.63.0.jsonl` → `row-census-1.64.0.jsonl` (BOB's at merge, B2).

**Reading (mechanics §17).** The set measured over 300 KB, so I followed BOB's (3).
- Read whole myself: my requirements; `layers.md` layer 2's row; the plan's rules and T37-7; the draft's promotion section; K1542, K1545, K1855, K2027, K2100, K2101; `gate.mjs`, `row-census.mjs`, `row-census.test.mjs` and `d526-refusal-order.test.mjs` (the files this entry changes).
- A worker read the rest of promotion's source and tests in full, about 400 KB, and the Purpose and named services of each used module. It also grepped the repository for every reader of the version, the census and the fixture. Its summary, about 2,000 words, cites file:line throughout.
- Nothing it left out mattered to a stamp.

**Tests and checks** (final tree, `d31e5c1f2b`, after B3's merge):
- `node bio-plane/test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (1.64.0, 1519 rows, `60d892ca…`).
- `node --test bio-plane/test/m/promotion/ bio-plane/test/d526-refusal-order.test.mjs`: 119 pass, 1 fail. The 1 is d526, rule 4's interim red above. The `MODULE_ORDER` red (rule 6, 9) cleared with membership's merge.
- `checks/format.mjs`: 1 failure (the `modules.json` entry above).
- `checks/architecture.mjs bio promotion`: 0 failures.
- `checks/coverage.mjs bio promotion`: 56 of 56, 0 failures.
- `checks/ownership.mjs bio promotion tranche/T37`: 1 failure (the renamed fixture, until the swap).

Size (session_01WiFA4XkxDJf5nB8LQz8tAt): test runs 24, module lines 3473
