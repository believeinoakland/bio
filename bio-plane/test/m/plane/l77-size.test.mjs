/* plane R77 L (fix round 5, E2 (4); K4544): the ledger's alarm reads a large PDF in the object's memory. Three files, each in a child process (a node heap cap is no model of the plane, whose build alone fills most of one, so the sampled peak of heap and
   array buffers above the idle state after the file is held is PRINTED, not gated: through the whole plane it is far above extraction's own 88 MB read (record, K4544): the 21 MB, 1,300-page synthetic, a 15.9 MB PDF of small objects, and
   a 22 MiB PDF. The real `Store`, ledger and alarm and extraction's real `readHeld`; the ledger ends empty and the reading's words are in `text_units` (R-STOP). The sampled
   peak above idle and the time are printed (figures, not gates); Miniflare enforces no CPU limit, so the CPU and wall limits are the deploy's logging (`owedwork`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const CHILD = new URL("./l77-size-child.mjs", import.meta.url).pathname;
for (const [kind, mb] of [["synthetic", 21], ["manyobjects", 15.9], ["pdf22", 22]]) {
  test(`R77 L: the alarm reads a ${kind} PDF (${mb} MB) through the ledger; the ledger ends empty, the peak above idle printed, its words are in text_units`, { timeout: 600000 }, async () => {
    const { stdout } = await promisify(execFile)(process.execPath, ["--expose-gc", "--input-type=module", "-e", `process.argv[1]=${JSON.stringify(kind)};await import(${JSON.stringify("file://" + CHILD)})`],
      { maxBuffer: 1 << 24, timeout: 580000 });
    const r = JSON.parse(stdout.trim().split("\n").at(-1));
    console.log(`# L77 ${kind}: ${JSON.stringify(r)}`);
    assert.deepEqual(r.left, [], "the ledger holds nothing");
    assert.equal(r.found, true, r.basis);
    assert.ok(r.units > 0 && r.words, `words in text_units (${r.units} units; ${r.basis})`);
  });
}
