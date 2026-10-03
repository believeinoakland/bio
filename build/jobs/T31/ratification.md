# ratification (T31)

**Status** · session_01HDpsLF3gYUqeM8zxQGYAq7 · depth 2 · WORKING · handled B3

## J1 · REPORT

The change is done and pushed (`job/T31/ratification`). It is not COMPLETE yet: K1367 puts this entry after case-grammar's merge, and my new test is red until then. Please send a `CHANGE` to merge `tranche/T31` once case-grammar has merged. I will then re-run steps 5–7 and post `COMPLETE`.

**My reading of the entry** (N538: "read `/7` as `/6` wherever the code names the current format", `checks.mjs` 516–801). Within ratification, the only places that name the current format are message texts. The arms C-41.13, C-41.14 and C-41.15 (13 messages) said "a `${CASE_DOCUMENT_FORMAT}` case document requires…". Which arms run is decided by case-grammar's predicates, and nothing in my module compares a format to `CASE_DOCUMENT_FORMAT`.
- The messages now name the format the document declares. A `/6` document's findings are byte-identical to before T31. A `/7` document's differ only in the format token. A `/3`, `/4` or `/5` document is no longer told it is the current format (a flaw before T31).
- C-41.1's message now names the current format and every format accepted as written (it used to name only `/2` and `/1` beside the current one).

**The test.** R8 (N538) in `checks.test.mjs`:
- A `/7` document and its `/6` twin each draw no finding.
- Every arm of C-41.1 to C-41.17 fires on `/7` exactly as on `/6`, with the token swapped.
- The `/6` messages match their pre-T31 text.
- `/3`, `/4` and `/5` documents are named as themselves.
- C-41.1 names all seven accepted formats.

I checked it against a local, uncommitted simulation of case-grammar R1 (`/7` current, `/6` accepted, every predicate holding for `/7` as for `/6`). Result: module 204 of 204 passing. Without the simulation (today's tranche): 203 of 204, failing only that test, on C-41.1 for `/7`.

**Found in other modules:**
- `case-checker`: `bio-plane/src/case-checker/program.mjs` bundles ratification's `checks.mjs`, so this change makes it stale. CASE-CHECKER #3 rebuilds it in L8 anyway (its N538 entry). It should rebuild after merging my change.
- The plane bundles (`bio-plane/dist`, `release/`, `newgroup`) carry the old message text; BOB regenerates them at layer close.

**Checks:**
- `format`: 98 modules, 0 failures.
- `architecture` (ratification): 0 failures.
- `coverage` (ratification): 39 of 39, 0 failures.
- `ownership` (ratification, tranche/T31): 3 files, 0 failures.

**Module size:** 3,987 lines.
