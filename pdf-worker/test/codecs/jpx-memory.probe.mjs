/* N34's measurement, re-runnable: the JPX decoder's live memory against its
 * working set, over real OpenJPEG codestreams of page sizes.
 *
 *   node pdf-worker/test/codecs/jpx-memory.probe.mjs
 *
 * Needs python3 with Pillow built with OpenJPEG (it writes the images). Not a
 * test: it measures, prints a table, and asserts nothing. Each image is decoded
 * in a worker thread while this thread samples that thread's V8 heap and
 * external memory every 2 ms (`worker.getHeapStatistics()`), so the figure is
 * the decode's own isolate, heap and ArrayBuffers together, with garbage not
 * yet collected included, as an isolate's memory is. Recorded in
 * build/jobs/T4/image-codecs.md (2026-09-27). */
import "../../../bio-plane/test/sandbox.mjs";

import { Worker, isMainThread, workerData, parentPort } from "node:worker_threads";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const IMAGES = [
  [1280, 1680, "L", false, null], [1280, 1680, "RGB", true, null], [1700, 2200, "RGB", true, null],
  [2000, 2600, "RGB", true, null], [2550, 3300, "L", false, null], [2550, 3300, "RGB", true, null],
  [2550, 3300, "RGB", false, null], [2550, 3300, "RGB", true, 1024],
];

if (!isMainThread) {
  const { decodeJpx } = await import("../../src/jpxdecode.mjs");
  const d = new Uint8Array(readFileSync(workerData));
  await new Promise((r) => setTimeout(r, 50));
  const t0 = Date.now();
  try {
    const o = decodeJpx(d);
    parentPort.postMessage({ ms: Date.now() - t0, decoded: `${o.width}x${o.height}x${o.comps}` });
  } catch (e) {
    parentPort.postMessage({ ms: Date.now() - t0, refused: e.detail?.feature ?? e.message, working_set: e.detail?.working_set_bytes });
  }
} else {
  const dir = mkdtempSync(join(tmpdir(), "jpxmem-"));
  const py = `
import random, sys, json
from PIL import Image, ImageDraw
random.seed(7)
for w, h, mode, irr, tile in json.loads(sys.argv[1]):
    im = Image.new(mode, (w, h), "white"); d = ImageDraw.Draw(im)
    for i in range(400):
        x, y = random.randrange(w), random.randrange(h)
        c = tuple(random.randrange(256) for _ in range(3)) if mode == "RGB" else random.randrange(256)
        d.rectangle([x, y, x + random.randrange(10, 300), y + random.randrange(5, 40)], fill=c)
    kw = {"irreversible": irr}
    if tile: kw["tile_size"] = (tile, tile)
    im.save(sys.argv[2] + f"/{w}x{h}-{mode}-{'97' if irr else '53'}{'-t' + str(tile) if tile else ''}.j2k", "JPEG2000", **kw)
`;
  execFileSync("python3", ["-c", py, JSON.stringify(IMAGES), dir]);
  console.log("image | working set MB | live peak above idle MB (heap, external) | result");
  for (const [w, h, mode, irr, tile] of IMAGES) {
    const f = join(dir, `${w}x${h}-${mode}-${irr ? "97" : "53"}${tile ? `-t${tile}` : ""}.j2k`);
    const nc = mode === "RGB" ? 3 : 1;
    const ws = tile ? nc * tile * tile * 4 + w * h * nc : nc * w * h * 4;
    const worker = new Worker(new URL(import.meta.url), { workerData: f });
    let base = null, peak = 0, heap = 0, ext = 0;
    const iv = setInterval(async () => {
      try {
        const s = await worker.getHeapStatistics();
        const now = s.used_heap_size + s.external_memory;
        base ??= now;
        if (now > peak) { peak = now; heap = s.used_heap_size; ext = s.external_memory; }
      } catch { /* the worker has ended */ }
    }, 2);
    const m = await new Promise((r) => worker.once("message", r));
    clearInterval(iv);
    await worker.terminate();
    const mb = (b) => (b / 1e6).toFixed(1);
    console.log(`${w}x${h} ${mode} ${irr ? "9/7" : "5/3"}${tile ? ` ${tile}-tiles` : ""} | ${mb(ws)} | ${mb(peak - base)} (${mb(heap)}, ${mb(ext)}) | ${m.decoded ? `decoded in ${m.ms} ms` : `refused: ${m.refused}`}`);
  }
}
