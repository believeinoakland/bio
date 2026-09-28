# content (T10)

**Status** · session_01YbRZULyy1GXdngu8HQHJc2 · depth 2 · COMPLETE · handled B1

## J1 · REPORT

These are things this job found in other modules and artifacts. I changed none of them.

1. **Generated artifacts made stale** (mechanics §14). `fleetbundles.test.mjs` names `src/content/index.mjs` as the changed source for:
   - `agent-worker/dist/agent-worker.bundled.mjs` and its `.bundle.json` (owner `agent-worker`);
   - `bio-plane/dist/bio-plane.bundled.mjs` and its `.bundle.json` (owner `not_product`).

   Regenerate them at the layer's close. The same run also shows the agent-worker bundle's input list without `src/provenance/checks.mjs`, which layer 3 added. That regeneration covers it too.
2. **citation: one red test, and this job did not cause it.** In `test/m/citation/`, R5 ("true exactly when the current state is retired…") fails 48/1. It fails the same way on `origin/tranche/T10` without my change. This is N203, citation's layer-6 entry.
3. **connections: one red test, and this job did not cause it.** `factory.test.mjs` (capture R58's `env` refusal) fails 59/1. PROVENANCE #5's J2 4 already reported it.

## J2 · COMPLETE

**Entries applied** (plan: the content bullet, layer 4):
- **N264, R46.** `passageText` now answers `null` for a row R22/R41 marked stale. It never answers the newer reading's text at that extent, even where that text is byte-identical. The row read now also selects `stale` (`src/content/index.mjs`), and the doc comment says why.
  - A typing is never staled (R22), so it keeps answering its text.
  - A row minted under the new chain is a new address (R3). It is current and answers the new text.
  - R46's `not yet met: T10` mark can be struck. The requirements file is yours, so I did not strike it.
- **N201, content's share.** New test "R13, R16, R28 (N201)" in `mint.test.mjs`. A machine credential marks a passage (`contentMint` by `class:ai`). A member's leg then cites it two ways, by its extent and by its content id:
  - the leg is not refused (R27);
  - both resolve to the machine's row with `minted: false` (R28, R13);
  - the store is byte-identical, so there is no second row and the machine's minter and instant are kept;
  - every read of the row (`contentRow`, `contentRead`, `projectStandings`) labels it `machine_marked`, machine work (R16);
  - the over-strictness arm: a leg on a passage nothing marked mints the plane's row, not a machine-labelled one.
- **Improvement (K313, K316).** The module's test fixture now answers at the plane's shape. `sql.exec` returns a cursor (never an array). It also refuses any LIKE/GLOB pattern over 50 bytes, as workerd does. All 54 earlier tests stay green on it. Content builds no LIKE/GLOB pattern, and the cap now guards every statement its tests run.

**Tests** (`passage.test.mjs`): new test "R46 (N264)". Its negative control arm shows each row's text before the re-read. The re-read then runs through extraction's `onReading` listener (its R24), with new units and a new chain. The test asserts:
- the stale rows (a page, an unchanged page, the whole document) answer `null`;
- the typing keeps its text;
- a row freshly minted under the new chain answers the new text.

With the fix reverted, this test is red (passage 3/1). Restored, it is green.

**Deferred:** none. **Other modules:** J1. Two stale bundles. Two red tests that predate this job (citation R5, which is N203; connections, capture R58).

**Tests run:**
- `node --test bio-plane/test/m/content/` gives tests 56, pass 56, fail 0, todo 0.
- The manifest names no layer tests.
- Every module that uses content: connections 59/1 (predates, J1 3), observation-log 42/0, query-language 24/0, retrieval 58/0, inquiry 50/0, citation 48/1 (predates, identical on `origin/tranche/T10`, J1 2), basis-versions 42/0, contradiction 28/0, run-productions 33/0, reevaluation 39/0, case-authoring 38/0, standards 16/0, conformance 29/0, consequences 22/0 (R46's caller), actions 30/0, filings 33/0, affordances 73/0/1 todo.
- `fleetbundles.test.mjs` fails only on the stale agent-worker bundle (J1 1).

**Checks:**
- format: 69 modules, 64 requirements files; 0 failures
- architecture: 14 product files, 42 relative imports (0 naming no tracked file, not judged); 0 failures
- coverage: 1 modules, 47 of 47 live requirement ids named by a test; 0 failures
- ownership: 5 files changed by content between tranche/T10 and HEAD; legacy-store: 0 line(s) added, 0 removed; legacy-checks: 0 line(s) added, 0 removed; 0 failures

Size (session_01YbRZULyy1GXdngu8HQHJc2): test runs 9, module lines 2232
