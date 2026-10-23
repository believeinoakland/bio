/* plane R84 (proposed, fix round 6, G41; K4636, K4639, K4642), THE SHAPE PROOF: a sheet is held, its text read whole, its cells made for a range. A 4 MB CSV, an 8 MB CSV, the largest CSV csv-reader's
   stated bound takes and a 200,000-row xlsx are uploaded by the member's path and read to the end by the real plane's ledger in a child under TEST-SUPPORT #9's value limit and the cap
   `128 + 39 - N` (the object's memory with the plane's idle, for a file of N MB; `shape/g41.probe.mjs`). Each: the child alive, every tick under 10 s by the child's wall clock (R-CLOCK), `readingFor`
   stating its state at every tick, the first, a middle and the last row in the index and found by `op=search`, `cellsOf` of the last row giving the generator's cells, the largest stored value
   under 1 MiB. HEAVY: run alone (`node --import $PWD/bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/plane/g41-shape.test.mjs`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { runCase, CASES, MARKS, g41Cap } from "./shape/g41.probe.mjs";
import { report, STORED_VALUE_BOUND } from "./shape/harness.mjs";

const WHAT = { csv4: "a 4 MB CSV", csv8: "an 8 MB CSV", csvmax: "the largest CSV csv-reader takes", xlsx: "a 200,000-row xlsx of 3 short cells a row" };
for (const name of Object.keys(CASES)) {
  test(`R84 G41: ${WHAT[name]} is read whole at the platform's shape: alive, ticks under 10 s, readingFor stated, first, middle and last row found, the last row's cells made, no stored value over 1 MiB`,
    { timeout: 3_600_000 }, async () => {
      const out = await runCase(name);
      console.log(report(out.label, out.r));
      assert.deepEqual(out.failed, [], `${out.label} at cap ${out.cap} MB`);
      assert.ok(out.r.largestStored < STORED_VALUE_BOUND);
      for (const m of MARKS) assert.ok(out.r.done.found[m] >= 1 && out.r.done.search[m].total >= 1, m);
    });
}
test("R84 G41: the cap is the object's 128 MB plus the plane's 39 MB idle less the file's MB, passed explicitly", () => {
  assert.equal(g41Cap(4 * 1048576), 163);
  assert.equal(g41Cap(8 * 1048576), 159);
  assert.equal(g41Cap(20 * 1048576), 147);
});
