/* plane R100 (fix round 9; K4838 (3), K4831 (3); runtime-limits R32-R34; G123a): THE OBJECT'S MEMORY IS STATED AS A TOTAL, SHARED. The figure is runtime-limits' `PLATFORM_FIGURES`
   (about 256 MiB of buffers for an isolate, the idle figure beside it), counted whole: the heap and the backing stores, so the plane states no "N above idle". The real plane's ledger reads the
   largest file the alpha accepts in a child capped by the one convention, `capFor(N)` (the harness's `shape/cap.mjs`), with the held bytes inside it; the judge is one function of the run:
   the child alive and every tick's peak of heap and buffers within the total less the platform's idle (`capFor(0)`). A buffer leaked inside one tick fails the same judge (the control that the
   judge can fail). HEAVY: run alone (`node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/plane/r9-memory.test.mjs`). Counts and megabytes only (R-CLOCK). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { shapeRun, csvDoc, report } from "./shape/harness.mjs";
import { capFor, PLATFORM_FIGURES } from "./shape/cap.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";

const MiB = 1048576;
/** R100: what a run did against the object's total: the failures (empty: it held) */
export function heldInside(r) {
  if (r.died) return [`the child died: ${r.error || r.stderr || r.signal || "exit " + r.code}`];
  const total = capFor(0);
  return r.ticks.filter((t) => !(t.peakMB <= total)).map((t) => `tick ${t.n} peaked at ${t.peakMB} MB of heap and buffers, over the ${total} MB the platform's total leaves past its idle`);
}

test("R100: the largest CSV the alpha accepts, read by the real plane's ledger in a child capped by capFor(N), holds inside the object's total: alive, every tick's heap and buffers within it", { timeout: 3_600_000 }, async () => {
  const bytes = boundOf("csv", "bytes") - 8192;
  const r = await shapeRun({ doc: csvDoc(bytes), maxTicks: 200, readingFor: false }, { capMB: capFor(bytes / MiB) });
  console.log(report(`R100 ${(bytes / MiB).toFixed(1)} MiB CSV`, r));
  assert.deepEqual(heldInside(r), []);
  assert.deepEqual(r.done.left, [], "read to its end");
  assert.equal(PLATFORM_FIGURES.isolate_memory_bytes.value, 268435456, "the total is the platform's figure (K4838 (3)), counted whole");
});

test("R100 (control): a buffer leaked inside one tick fails the same judge at the same convention", { timeout: 1_800_000 }, async () => {
  const bytes = 3 * MiB;
  const r = await shapeRun({ doc: csvDoc(bytes), faults: { leakAt: 1, leakMB: 150 }, maxTicks: 8, readingFor: false }, { capMB: capFor(bytes / MiB) });
  assert.deepEqual(r.ticks[0] && r.ticks[0].injected, ["leak"], "the leak was held inside tick 1");
  assert.ok(heldInside(r).length >= 1, `the leak is seen: ${JSON.stringify(r.ticks.map((t) => t.peakMB))}`);
});

test("R100 (control): no requirement of the plane states a figure as so many megabytes above idle", () => {
  const text = readFileSync(fileURLToPath(new URL("../../../../build/requirements/plane.md", import.meta.url)), "utf8");
  assert.deepEqual(text.match(/\d[\d,.]*\s*(?:MB|MiB|GB)\s+above\s+(?:the\s+)?idle/gi) ?? [], []);
});
