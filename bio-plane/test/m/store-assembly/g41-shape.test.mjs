/* store-assembly's copy of plane's test. plane R84 (proposed, fix round 6, G41; K4636, K4639, K4642), THE SHAPE PROOF: a sheet is held, its text read whole, its cells made for a range. A 4 MB CSV, an 8 MB CSV, the largest CSV csv-reader's
   stated bound takes and a 200,000-row xlsx are uploaded by the member's path and read to the end by the real plane's ledger in a child under TEST-SUPPORT #9's value limit and the cap
   `capFor(N)` (the one cap convention, `shape/cap.mjs`, G123a; the `128 + 39 - N` of its first writing is retired). Each: the child alive, every tick within the work budget BY COUNT
   (`shape/bars.mjs`: evidence reads, bytes served, units, statements; never node's wall time, R-CLOCK, G123b, K4843), `readingFor` stating its state at every tick, the first, a middle and the
   last row in the index (in the text rows whose extent holds the row the generator put the mark on) and found by `op=search`, `cellsOf` of the last row giving the generator's cells, the largest
   stored value under 1 MiB. HEAVY: run alone (`node --import $PWD/bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/store-assembly/g41-shape.test.mjs`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { runCase, CASES, g41Cap, failures, runRefused, XLSX_ROWS, XLSX_REFUSED_ROWS } from "./shape/g41.probe.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import { report, capFor, OBJECT_MB, STORED_VALUE_BOUND } from "./shape/harness.mjs";
import { TICK_COUNT_BARS } from "./shape/bars.mjs";

const WHAT = { csv4: "a 4 MB CSV", csv8: "an 8 MB CSV", csv12: "a 12 MiB CSV", csv16: "a 16 MiB CSV", csvmax: "the largest CSV csv-reader takes (17 MiB, the stated bound)",
  xlsx: `a ${XLSX_ROWS.toLocaleString("en-US")}-row xlsx of 3 short cells a row (the largest under the alpha's declared-text bound, K4855)` };
for (const name of Object.keys(CASES)) {
  test(`R84 G41: ${WHAT[name]} is read whole at the platform's shape: alive, every tick within the count bars, readingFor stated, first, middle and last row found, the last row's cells made, no stored value over 1 MiB`,
    { timeout: 3_600_000 }, async () => {
      const out = await runCase(name);
      console.log(report(out.label, out.r));
      assert.deepEqual(out.failed, [], `${out.label} at cap ${out.cap} MB`);
      assert.ok(out.r.largestStored < STORED_VALUE_BOUND);
      for (const m of Object.keys(out.r.done.gen.markRows)) assert.ok(out.r.done.found[m] >= 1 && out.r.done.search[m].total >= 1, m);
    });
}
/* K4855 (P17): the 200,000-row workbook declares 42.66 MiB of sheet text, over the alpha's `xlsx.declared_text` bound: it is refused, final, in one tick, its declared size and the bound stated
   (docprofile's statement), the child alive. The standard's 50 MB is Stage 3's. */
test(`R84 G41 K4855: a ${XLSX_REFUSED_ROWS.toLocaleString("en-US")}-row xlsx, over the alpha's declared-text bound, is refused at the platform's shape: final in one tick, its size (the generator's declared sheet text) and the bound stated as data, nothing owed, the child alive`,
  { timeout: 3_600_000 }, async () => {
    const out = await runRefused("xlsx200", { bound: boundOf("xlsx", "declared_text") });
    console.log(report(out.label, out.r));
    assert.deepEqual(out.failed, [], `${out.label} at cap ${out.cap} MB`);
  });

test("R84 G123a: the cap is the one convention, `capFor`: the sheet runs' and the PDF runs' are the same function of the held MiB, and a larger file leaves a smaller cap", () => {
  for (const mib of [4, 8, 20]) assert.equal(g41Cap(mib * 1048576), capFor(mib), `${mib} MiB`);
  assert.ok(capFor(4) > capFor(8) && capFor(8) > capFor(20));
  assert.ok(Number.isInteger(capFor(15.2)), "whole megabytes");
  assert.equal(OBJECT_MB, 128, "the object's 128 MB is the harness's one stated object size");
});

const okTicks = (...c) => c.map((counts, i) => ({ n: i + 1, ms: 99_999, counts, readingFor: { state: "reading" } }));
const quiet = { gets: 4, bytesServed: 4_000_000, unitsWritten: 15, sql: 250, rowsOut: 80 };
const run = (ticks, extra = {}) => ({ died: false, ticks, done: { left: [], found: { FIRSTROWMARK: 1, MIDROWMARK: 1, LASTROWMARK: 1 }, search: { FIRSTROWMARK: { total: 1 }, MIDROWMARK: { total: 1 }, LASTROWMARK: { total: 1 } },
  gen: { markRows: { FIRSTROWMARK: 2, MIDROWMARK: 50, LASTROWMARK: 90 } }, markExtents: { FIRSTROWMARK: [[1, 40]], MIDROWMARK: [[41, 60]], LASTROWMARK: [[61, 100]] }, ...extra },
  cells: { values: [1], expected: [1], lastRow: 1 }, largestStored: 1, overBound: false });

test("R84 G123b: the tick bars are counts: a tick of 99 s of wall time within the counts passes (a busy machine is not a failure), and each count over its bar fails alone", () => {
  assert.deepEqual(failures(run(okTicks(quiet, quiet)), 1_000_000), [], "wall time is not a bar");
  const over = (k, v) => failures(run(okTicks(quiet, { ...quiet, [k]: v })), 1_000_000);
  assert.equal(over("gets", TICK_COUNT_BARS.gets + 1).length, 1);
  /* the first tick's bytes (a later tick's are bounded by its windows too, K4855 (2), below) */
  assert.equal(failures(run(okTicks({ ...quiet, bytesServed: TICK_COUNT_BARS.bytesServedPerFileByte * 1_000_000 + 1 }, quiet)), 1_000_000).length, 1);
  assert.equal(over("unitsWritten", TICK_COUNT_BARS.unitsWritten + 1).length, 1);
  assert.equal(over("sql", TICK_COUNT_BARS.sql + 1).length, 1);
  assert.equal(failures(run([{ n: 1, ms: 5, readingFor: { state: "reading" } }]), 1_000_000).length, 1, "a tick that states no counts fails");
  assert.deepEqual(over("gets", TICK_COUNT_BARS.gets), [], "a count at its bar passes");
});

test("R84 K4855 (2): from the second tick on a tick's evidence bytes are bounded by the windows it needs: a reader that reads a 12 MiB file whole every tick fails (8 times the file did not), one that reads its window passes", () => {
  const file = 12 * 1048576;
  const whole = { ...quiet, bytesServed: file }, window = { ...quiet, bytesServed: 4_400_000 };
  assert.deepEqual(failures(run(okTicks(whole, window, window)), file), [], "the first tick may read the file; later ticks read their windows");
  const rereads = failures(run(okTicks(whole, whole, whole)), file);
  assert.equal(rereads.length, 2, "ticks 2 and 3 each read the whole file again");
  assert.match(rereads[0], /tick 2 served/);
  assert.ok(file <= TICK_COUNT_BARS.bytesServedPerFileByte * file, "the old bar alone could not see it");
});

test("R84 G123b: search is judged by extent: each mark is in a text row whose range holds the row the generator put it on, and a mark in the wrong rows fails", () => {
  assert.deepEqual(failures(run(okTicks(quiet)), 1_000_000), []);
  const wrong = failures(run(okTicks(quiet), { markExtents: { FIRSTROWMARK: [[1, 40]], MIDROWMARK: [[61, 100]], LASTROWMARK: [[61, 100]] } }), 1_000_000);
  assert.equal(wrong.length, 1);
  assert.match(wrong[0], /MIDROWMARK/);
  assert.equal(failures(run(okTicks(quiet), { markExtents: { FIRSTROWMARK: [], MIDROWMARK: [[41, 60]], LASTROWMARK: [[61, 100]] } }), 1_000_000).length, 1, "a mark in no row fails");
});
