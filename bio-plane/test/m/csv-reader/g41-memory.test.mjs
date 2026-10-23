/* csv-reader, proposed R19 (G41, K4636): a body is read in bounded memory, whatever its size up to the bound. No record list is
   kept and no cell is made at intake, so what the reader holds is the sheet's text and its row numbers. The read runs in a child
   at a small old-space cap (`--expose-gc`), and a record list or a cell list would not fit. The figures are the job's measure
   (lowest surviving cap for an 8 MiB body: 33 MB; what it still holds after a full GC with `parts` alive: 9.8 MB); no figure is
   asserted for the largest body, which is measured at the plane's real shape (the job record). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const CHILD = fileURLToPath(new URL("./g41-memory-child.mjs", import.meta.url));
const MIB = 1024 * 1024;

test("R19 (proposed) an 8 MiB CSV is read in a 64 MB old space with its cells held, its last row in the text and its last cell made by cellsIn, holding about its own size", () => {
  const r = spawnSync(process.execPath, ["--expose-gc", "--max-old-space-size=64", CHILD, String(8 * MIB)], { encoding: "utf8", timeout: 120_000 });
  assert.equal(r.status, 0, `the read survived (status ${r.status}, signal ${r.signal}): ${String(r.stderr).slice(0, 300)}`);
  const out = JSON.parse(r.stdout.trim().split("\n").at(-1));
  assert.equal(out.ok, true);
  assert.equal(out.cellsHeld, true);
  assert.equal(out.cellsNull, true);
  assert.equal(out.textHasLast, true);
  assert.equal(out.lastCell, "LASTROWMARK");
  assert.ok(out.retainedMB < 2 * (out.bodyBytes / MIB), `what the read holds is about the text it made, not a record or cell list: ${out.retainedMB.toFixed(1)} MB for ${(out.bodyBytes / MIB).toFixed(1)} MiB`);
});
