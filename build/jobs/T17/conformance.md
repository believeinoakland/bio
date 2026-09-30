# conformance (T17)

**Status** · session_01RwskyQxg3ceF8pkWDxKg1f · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R21's `text` on a side with no content id. Contradiction's `candidatesFor` answers a claim or stance side (K2, K3, K5) with `text` = its claim and no content id; a leg or extent side (K1, K3's passage arm, K4) with a content id and `text: null`. R21 as worded (K569) says each side's `text` is `content.passageText` for its content id, `null` where it answers `null`.

My best reading, on which I am building: a side that names a content id carries `passageText(content_id)` as `text` (null where it answers null, including a stale row); a claim or stance side names no passage, so `passageText` is not asked and its `text` stays the claim's words as contradiction answers them (today's behaviour, which `fact()` passes through). Read literally, a claim or stance side would answer `text: null`, and R21's facts would then carry no words of the claim at all, since `fact()` does not copy `claim`.

If you want the literal reading (claim and stance sides `text: null`), say so and I change one line.

## J2 · COMPLETE

**Entries applied** (on `job/T17/conformance`, tranche/T17 merged in after B2):
- **N362 (K569, K603).** `comparisonFacts` (R21): each side's `text` is now `content.passageText(content_id)` for a side that names a content id (a leg or extent), and `null` where that answers `null` (text not held whole, a stale row) or the read throws. A claim or stance side names no passage, so it keeps the claim's words as contradiction answers them, and `passageText` is not asked. The text is asked only after R12's gate and `STANDARD_SIDE_UNNAMED` pass, so only for a side the viewer already sees. The module header's Uses now names `content.passageText` (its R46).

**Mark met:** R21's `*(not yet met: N362's `text`, T17)*`, which is yours to strike.

**Deferred:** none.

**Found in other modules and artifacts:**
- **Generated artifact.** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale for `src/conformance/index.mjs`. They are yours at the layer close.
- **control-plane / affordances.** The ops are unchanged: `comparisonfacts` keeps its stamps and routing, and the answer gains no key (`text` was already present on each fact). `src/control-plane/ops.mjs` and `dispatch.mjs` name the op, and neither needs a change.

**Tests and checks:**
- `node --test test/m/conformance/`: tests 47, pass 47, fail 0, todo 0. The new test, "R21 (N362)" in `contradiction-cause.test.mjs`, checks four things. First, each leg side's `text` equals the passage's words and `content.passageText`, for both `standardSide` values. Second, `text` is `null` for a unit cut at its per-unit cap and for a stale row, with the other side unaffected. Third, `passageText` is never asked when a read is refused (a half-seen candidate, an unnamed side, an unknown viewer), and is asked once per side on the control. Fourth, a claim side keeps its claim and asks no passage, and a failing read answers `null`. Against the old code, the new test fails (1 fail).
- The users of conformance (`test/m/consequences/`, `actions/`, `filings/`, `escalation/`, `monitoring/` and `test/gate-reads.test.mjs`): tests 200, pass 194, fail 0, todo 6 (their own).
- `format`: 72 modules, 67 requirements files, 0 failures. `architecture`: 9 product files, 42 relative imports, 0 failures. `coverage`: 22 of 22 live requirement ids, 0 failures. `ownership`: 3 files, 0 failures.

Size (session_01RwskyQxg3ceF8pkWDxKg1f): test runs 4, module lines 1474
