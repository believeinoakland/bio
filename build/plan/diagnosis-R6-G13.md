# Diagnosis R6 G13: control-plane seam G13 red while plane's R90 seam is green

Root cause: CERTAIN as to mechanism, and the ledger is NOT at fault. Both paths read the whole text; control-plane's G13 looks only at page one of the reading.

## What I ran
A scratch copy of bio-plane (scratchpad, node_modules and sibling dirs symlinked) with temporary logging in `plane/pending.mjs` readNow and `extraction/index.mjs` readHeld/continueText. The repo itself is untouched (`git status` clean).

Control-plane G13 through the real Worker:
- Tick 1: `NO_HOME` (the upload registered the row before the promotion; it retries).
- Tick 2: `readHeld` has no reading, so it reads piece 1 and answers `more:true` with detail `{read_through, total}`. `settle` keeps the row, `attempts` is reset to 0, and the cursor is carried in the `capture_text_state` row.
- Ticks 3 to 31: `#moreOf` is true, so `#continueText` reads the next piece from the stored cursor. Each is 4,096 units, `refused:null`, `more:true`.
- The last tick reads 2,019 units with `more:false` and answers `{ok, read, found}`, so `end(row)` deletes the row. That is the "reading row ends, owedwork empty" in the report. It ends because the text is read whole.

So the real-Worker path gives the same 31 ticks as plane's seam. Of the candidates in #48, `readHeld` `out.more` (extraction:762-769), pending.mjs `settle` (~106), `READING_HELD` short-circuit, and promotion re-registering without the cursor are all ruled out. The cursor lives in `capture_text_state`, not in the row `detail`, so a re-registration with `detail={}` cannot lose it. `put` also keeps the old detail when the new one is `{}`.

## The difference between the two seams
- Plane's seam asserts on SQL (`capture_text` last row `seq=LINES`, `text="ENDMARKER"`, `fts("ENDMARKER")`, `capture_text_state.state="whole"`).
- Control-plane's G13 (`t51-round6-seam.test.mjs:184-200`) polls `op=reading` and checks `unitsText(x).includes("ENDMARKER")`, where `unitsText` is `JSON.stringify(x.text_units)`.
- Since this round `readingFor` (`extraction/index.mjs:1267-1340`, "R76 amended", comment at :1288-1291) returns at most 4,096 units an answer. It sets `next` (the `seq` to ask after) and accepts `after` (`reading: ... q("after")`, :2336; declared `fields.accepts ["sha256","after"]`, :2374).
- With ~190k one-line units (12 MB at ~63 B a line), page one is the first 4,096 lines. ENDMARKER is the last unit and sits on the last page.
- The test never passes `after` and never follows `next`. "First tick reads 4,096 units `found:true`" is page one of the answer, not one piece. After that the test sees the same first page every poll, until the 1,100 s timeout.
- That is why the test reads "found:true, 4,096 units, then nothing more". The index grows behind that page, and the test never looks at it.

## Why the tests missed it
G13 was written (K4577) before the answer was paged. The R76 amendment to `readingFor`'s 4,096-unit page landed in the same round. The plane seam avoids the reading op by reading SQL directly. Nothing exercised "every unit is reachable through the `reading` op", which is the point of the `after`/`next` paging.

The test's second clause (`owedMidway` includes "reading") is fine: midway the row is owed.

## Owner and minimal fix
- Owner: control-plane (test file only), and the 12 MB it uploads is the product doing the right thing. No product change is needed. The paging contract is already in extraction R76, so the test should follow it.
- Fix: in G13's `until`, page through the reading. Keep `x = await readingOf(auth, digest)`, then loop `while (x.next != null) { x = await get(auth, {op:"reading", sha256: digest, after: String(x.next)}); text += unitsText(x) }`. Check ENDMARKER and "appeal" in the accumulated text, and check `x.more === false`, or `read_through === total`, on page one. Use the paged answer only after the page-one answer says `more:false`; otherwise skip paging to save calls.
- Optional product-side assertion for G13: `completeness.state === "whole"` and `units_total` is about 190k.
- Note `readingOf` returns `.result` of `op=reading`, so `after` passes through the door as a query parameter. I did not check that the door forwards `after`; the control-plane worker should confirm that when it makes the test change. If the door drops it, that is a one-line product fix in the door's op relay, and then this diagnosis moves to control-plane's door.

## Failing-first test
The control-plane G13 seam itself. It stays red until the paging is added, then goes green. A cheaper regression for the paging contract: after the plane seam's loop, call `ex.readingFor(d, "class:admin", {after})` repeatedly and assert ENDMARKER is on the last page.

## Confidence
- CERTAIN: the ledger, `readHeld`, `settle` and `put` are correct (31 ticks observed in the real Worker, last tick `more:false`).
- CERTAIN: `readingFor` pages at 4,096 units and the test never pages.
- PROBABLE (not seen to completion): that the test then goes green with paging. I stopped the full run before it timed out, to avoid a 1,100 s wait. The scratch run's last tick read the 2,019-unit tail.
