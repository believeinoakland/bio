/* plane R77 L, THE GATE (fix round 5, E2 (4); K4544, K4548, K4551): the ledger's alarm reads a large PDF through the assembled plane inside the object's memory. The harness's
   own idle is measured first, in a child of the same file with the whole plane built, the file held and the heap collected (old space in use, MB); the read then runs in a child
   whose old-space cap is that idle plus 88 MB (the object's 128 MB less 20 MB of headroom and the 20 MB file's bytes, which are array buffers outside old space), five times for
   each file. A run that dies is red. Files: the 21 MB, 1,300-page synthetic and a 22 MiB PDF; also read, printed and not gated by the cap: a 15.9 MB PDF of small objects. The
   real `Store`, `keeps_pending`, alarm and extraction's `readHeld`; the ledger ends empty and the words are in `text_units` (R-STOP). Miniflare and node enforce no CPU limit. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const CHILD = "file://" + new URL("./l77-size-child.mjs", import.meta.url).pathname;
const HEADROOM_MB = 88, RUNS = 5;
const run = async (kind, mode, cap) => {
  const args = [...(cap ? [`--max-old-space-size=${cap}`] : []), "--expose-gc", "--input-type=module", "-e", `process.argv[1]=${JSON.stringify(kind)};process.argv[2]=${JSON.stringify(mode)};await import(${JSON.stringify(CHILD)})`];
  const { stdout } = await promisify(execFile)(process.execPath, args, { maxBuffer: 1 << 24, timeout: 280000 });
  return JSON.parse(stdout.trim().split("\n").at(-1));
};
for (const [kind, mb] of [["synthetic", 21], ["pdf22", 22]]) {
  test(`R77 L (gate): the alarm reads a ${kind} PDF (${mb} MB) through the ledger in a child capped at the measured idle plus ${HEADROOM_MB} MB, ${RUNS} of ${RUNS}`, { timeout: 1_800_000 }, async () => {
    const idle = (await run(kind, "idle")).idleHeapMb;
    const cap = Math.ceil(idle) + HEADROOM_MB;
    for (let i = 1; i <= RUNS; i++) {
      let r;
      try { r = await run(kind, "alarm", cap); } catch (e) { assert.fail(`run ${i} of ${RUNS} died at the cap of ${cap} MB (idle ${idle} MB + ${HEADROOM_MB}): ${String(e.stderr || e.message).split("\n").find((l) => /FATAL|heap/.test(l)) || e.message}`); }
      console.log(`# L77 ${kind} run ${i}/${RUNS}: idle ${idle} MB, cap ${cap} MB, ${r.ms} ms, peak above idle ${r.peakAboveIdleMb} MB, ${r.units} units`);
      /* R97/R101: the reading is done in pieces, one heavy piece for each tick; it completes inside the cap, each tick moves the cursor, and the ticks are bounded by the file's pages */
      assert.equal(r.stalled, 0, `run ${i}: every tick moved the cursor (${r.moves} moves, read through ${r.lastReadThrough} of ${r.total})`);
      assert.ok(r.ticks <= r.maxTicks, `run ${i}: ${r.ticks} ticks, within the ${r.maxTicks} the ${r.pages} pages allow`);
      if (r.total != null) assert.ok(r.moves >= 1 && r.lastReadThrough >= r.total - 1 || r.left.length === 0, `run ${i}: the cursor reached the end`);
      assert.deepEqual(r.left, [], `run ${i}: the ledger holds nothing after ${r.ticks} ticks (read through ${r.lastReadThrough} of ${r.total})`);
      assert.equal(r.found, true, `run ${i}: ${r.basis}`);
      assert.ok(r.units > 0 && r.words, `run ${i}: words in text_units (${r.units} units; ${r.basis})`);
    }
  });
}
test("R77 L: a 15.9 MB PDF of small objects is read by the alarm through the ledger (printed, no cap)", { timeout: 300_000 }, async () => {
  const r = await run("manyobjects", "alarm", null);
  console.log(`# L77 manyobjects: ${r.ms} ms, peak above idle ${r.peakAboveIdleMb} MB, ${r.units} units`);
  assert.deepEqual(r.left, []);
  assert.ok(r.units > 0 && r.words);
});
