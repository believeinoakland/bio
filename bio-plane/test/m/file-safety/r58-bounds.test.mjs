/* file-safety R58 (fix round 10, cause 39a; K5055): the scanner's bounds are readable by an administrator. At the module's interface,
   over the scripted scanner binding (fixture.mjs), whose /version answers the real `BOUNDS` of file-scanner. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filedWorld as world } from "./fixture.mjs";
import { BOUNDS } from "../../../../file-scanner/src/limits.mjs";

test("R58: `scanStatus` states, for the scanner and for the renderer, the `bounds` each reports from its own /version, the real BOUNDS; an administrator reads them", async () => {
  const w = world({ scan: { bounds: BOUNDS } });
  const s = await w.fs.scanStatus({ viewer: "member:boss" });
  assert.equal(s.ok, true);
  assert.deepEqual(s.scanner.bounds, JSON.parse(JSON.stringify(BOUNDS)));
  assert.deepEqual(s.renderer.bounds, JSON.parse(JSON.stringify(BOUNDS)));
  assert.equal(s.scanner.bounds.SAFE_VIEW_PAGES_MAX.value, BOUNDS.SAFE_VIEW_PAGES_MAX.value);
  assert.equal(s.renderer.bounds.SCAN_MAX_BYTES.source, BOUNDS.SCAN_MAX_BYTES.source);
});

test("R58: control: a member and a machine credential are refused as for the rest of the answer, with no bounds; with no scanner bound or an unreachable one, no bounds are stated (null)", async () => {
  const w = world({ scan: { bounds: BOUNDS } });
  for (const v of ["member:m1", "class:admin", "", undefined]) {
    const r = await w.fs.scanStatus({ viewer: v });
    assert.equal(r.code, "NOT_AN_ADMIN", String(v));
    assert.equal(JSON.stringify(r).includes("SCAN_MAX_BYTES"), false, "a refusal states no bound");
  }
  const none = await world({ bound: false }).fs.scanStatus({ viewer: "member:boss" });
  assert.deepEqual([none.scanner.bounds ?? null, none.renderer.bounds ?? null], [null, null]);
  const down = await world({ scan: { throwOn: new Set(["version"]) } }).fs.scanStatus({ viewer: "member:boss" });
  assert.deepEqual([down.scanner.bounds ?? null, down.renderer.bounds ?? null], [null, null]);
});
