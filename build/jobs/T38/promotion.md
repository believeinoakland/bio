# promotion (T38)

**Status** · session_013zZkEVT5VnVz668Zz9kZux · depth 2 · COMPLETE · handled B3

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

## Completion

**Entry applied (T38-6; T37's red 2, plan T38 rule 6 item 2; K1542, K2231, K2232, K2275, K2283).**
- **The stamp.** `CATALOG_VERSION` moves from 1.64.0 to **1.65.0** (MINOR). It was made over `tranche/T38` at its layer 2 (`0e6b2b79cb`: 1546 rows, `d235871f…`). The rows T37's layers 3–11 left awaiting stamp:
  - 28 new: instance-setup C-64.11–.26; case-carriage C-141.1–.6; case-disclosures C-120.17 and .18; publication C-122.6; file-safety C-140.40–.42.
  - 1 retired: instance-setup C-119.5 ASSISTANT_OFF.
  - 7 changed, `where` only: conformance C-113.12, .19, .29, .31, .32, .34 and .35 (K2231).
  - Each row is named by its T37 job record. T38's layer 1 moved no row.
- **Re-pinned in place after L2's merges (B3, K2283):**
  - membership: C-96.47 NO_SUCH_MEMBER arrived.
  - project-roster: C-56.5, C-33.28, C-70.4 and C-95.1–.9 changed their `where` only, now naming `src/project-roster/index.mjs`. Numbers, codes and translations are unchanged.
  - credentials: C-29.17 and C-29.20 changed their translation.
  - Nothing else moved. Instance-setup's C-64.18 removal is T39's (B2).
- **Final `ROW_CENSUS`:** **1547 rows, `6f8d4d64c1cef0a1a028135eab93c6ece2e4e13d28026e32b4288f63d35fae0c`**. The fixture is `bio-plane/test/fixtures/row-census-1.65.0.jsonl`, renamed from 1.64.0's. The notes are in `gate.mjs` (1.65.0) and in `row-census.test.mjs`'s header.
- **Own improvement.** `wording.test.mjs`: four titles cited line numbers that had drifted. They now name the function or region (`71d5412b2c`).

**Deferred** (own module; found by the reading worker; each with why):
- `history.mjs`:294, :309: C-4.2 throws when `object_type` names an `Object.prototype` key (`toString`). At the gate, `checkBundle` throws first on the same input; the audit counts it as one AUDIT_CHECK_FAILED. A guard would change C-4.2's verdict, which is a changed check, so it waits for a stamp that names it.
- `release.mjs`:135–136, :169–171: C-18.8 verifies over the digest of the live `bundle.md`, not the bytes as released. A later revision of a released information@2 bundle could therefore fail a signature that was valid. Also, `latin1` (:30) masks characters outside Latin-1. This was carried from the catalogue and its intent is uncertain, so it is BOB's to read. A change would change a check.
- Not reachable, or not worth their code now:
  - `index.mjs`:807: a NO_BUNDLE_MD branch that cannot be reached.
  - `index.mjs`:553–554: writes into the object `record.head()` returns, safe while record-core returns a fresh one.
  - `index.mjs`:81: `rowOf` throws for a code no family holds; every caller passes a literal.
  - `index.mjs`:270, :295: `fact` and `#fact` catch only synchronous throws, and every provider is synchronous.
  - `index.mjs`:571–581: the idempotent answer to a resent creation returns the head digest without asking sight. EXISTS already discloses existence.
  - `converts.test.mjs`:17–20 repeats R34's shape test; `promote.test.mjs`:333–345 has a redundant loop.
- For BOB (wording): R22 says "a quote", but the code refuses only a double quote. That is safe, because `text.mjs`:17 writes the reason double-quoted.

**Found in other modules.**
- `build/modules.json`:41: swap promotion's `tests` entry from `row-census-1.64.0.jsonl` to `row-census-1.65.0.jsonl` (BOB's at merge, B2). Until then, format and ownership each show exactly this one failure.
- §14, stale generated artifacts:
  - `bio-plane/src/case-checker/program.mjs`:4 embeds 1.64.0, 1519 and `60d892ca…`. `program.test.mjs` is 3 pass, 2 fail until it is regenerated (K1540's order, first at L2's close).
  - `bio-plane/dist/bio-plane.bundled.mjs`:26444, :26449 carries the same.
- **Pinned digests that move:** only `ROW_CENSUS` (promotion's own) and its copy in the generated `program.mjs`. Every other reader imports the constant, and no other test pins "1.64.0".

**Reading (mechanics §17).** The set measured over 300 KB, so I followed BOB's (3).
- Read whole myself:
  - my requirements;
  - `layers.md` layer 2's row;
  - the plan's rule 6 and T38-6;
  - K1542, K2231 and K2232;
  - `gate.mjs`, `row-census.mjs` and `row-census.test.mjs` (the files this entry changes);
  - the awaiting-stamp passages of each T37 and T38 record that names a moved row.
- A worker read the rest in full: promotion's other source and tests and d526 (435,946 B), plus each used module's Purpose and named services. It also grepped the repository for every reader of the version, the census and the fixture. Its summary is about 2,200 words and cites file:line throughout.
- Nothing it left out mattered to a stamp.

**Tests and checks** (final tree, after B3's merge):
- `node bio-plane/test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (1.65.0, 1547 rows, `6f8d4d64…`).
- `node --test bio-plane/test/m/promotion/ bio-plane/test/d526-refusal-order.test.mjs`: 119 pass, 1 fail. The 1 is d526 section 4, `UNLABELLED: …its creator is its one participant and its OWNER` (`op=projectparticipants`): 30 passed, 1 failed. This red is accepted by name until T38-26 (rule 6 item 11). The `MODULE_ORDER` red cleared with membership's merge.
- `checks/format.mjs`: 1 failure (the `modules.json` swap).
- `checks/architecture.mjs bio promotion`: 0 failures.
- `checks/coverage.mjs bio promotion`: 56 of 56, 0 failures.
- `checks/ownership.mjs bio promotion tranche/T38`: 1 failure (the renamed fixture, until the swap).

Size (session_013zZkEVT5VnVz668Zz9kZux): test runs 9, module lines 3501
