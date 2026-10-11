/* image-codecs R1 and R11 (T44, N868): the JPEG decoders' live memory, measured
 * over phone-sized frames in each sampling, re-runnable:
 *
 *   node pdf-worker/test/codecs/dct-memory.probe.mjs [width height]
 *
 * Needs python3 with Pillow (it writes the images). Not a test: it measures,
 * prints a table, and asserts nothing. As `jpx-memory.probe.mjs` does, each
 * decode runs in a worker thread while this thread samples that thread's V8 heap
 * and external memory every 2 ms (`worker.getHeapStatistics()`), so the figure is
 * the decode's own isolate, heap and ArrayBuffers together, garbage not yet
 * collected included, above the isolate's level once the input is loaded (the
 * input is the caller's, and not counted).
 * R1 is measured unrotated and at a quarter turn; R11 with an `onRows` that
 * keeps nothing, as a caller reducing the picture strip by strip would. Recorded
 * in build/jobs/T44/image-codecs.md. */
import "../../../bio-plane/test/sandbox.mjs";

import { Worker, isMainThread, workerData, parentPort } from "node:worker_threads";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

if (!isMainThread) {
  const { decodeBaselineJpeg, decodeBaselineJpegRows } = await import("../../src/dctdecode.mjs");
  const { file, how } = workerData;
  const d = readFileSync(file);                    // a Buffer is a Uint8Array: no second copy
  await new Promise((r) => setTimeout(r, 50));
  parentPort.postMessage({ ready: true });
  await new Promise((r) => setTimeout(r, 50));
  const t0 = Date.now();
  let strips = 0, most = 0;
  if (how === "R11") decodeBaselineJpegRows(d, { onRows: (rows, y0, count) => { strips++; most = Math.max(most, count); } });
  else decodeBaselineJpeg(d, { rotate: how === "R1 rotate 90" ? 90 : 0 });
  parentPort.postMessage({ ms: Date.now() - t0, strips, most });
} else {
  const [W, H] = process.argv.length >= 4 ? [Number(process.argv[2]), Number(process.argv[3])] : [4032, 3024];
  const dir = mkdtempSync(join(tmpdir(), "dctmem-"));
  const py = `
import random, sys
from PIL import Image, ImageDraw, ImageFilter
random.seed(7)
w, h = int(sys.argv[1]), int(sys.argv[2])
im = Image.linear_gradient("L").resize((w, h)).convert("RGB")
d = ImageDraw.Draw(im)
for i in range(3000):
    x, y = random.randrange(w), random.randrange(h)
    d.rectangle([x, y, x + random.randrange(4, w // 20), y + random.randrange(4, h // 40)], fill=tuple(random.randrange(256) for _ in range(3)))
im = im.filter(ImageFilter.GaussianBlur(1))
for name, sub in (("4:2:0", 2), ("4:2:2", 1), ("4:4:4", 0)):
    im.save(f"{sys.argv[3]}/{name.replace(':', '')}.jpg", "JPEG", quality=90, subsampling=sub)
im.convert("L").save(f"{sys.argv[3]}/grey.jpg", "JPEG", quality=90)
`;
  execFileSync("python3", ["-c", py, String(W), String(H), dir]);
  console.log(`${W}x${H} (${(W * H / 1e6).toFixed(1)} MP)`);
  console.log("sampling | decoder | input MB | output MB | live peak above idle MB (heap, external) | bytes a pixel | ms | strips (most rows)");
  for (const [name, nc] of [["4:2:0", 3], ["4:2:2", 3], ["4:4:4", 3], ["grey", 1]]) {
    const file = join(dir, `${name.replace(/:/g, "")}.jpg`);
    const input = readFileSync(file).length;
    for (const how of ["R1", "R1 rotate 90", "R11"]) {
      const worker = new Worker(new URL(import.meta.url), { workerData: { file, how } });
      let ready = false, base = null, peak = 0, heap = 0, ext = 0;
      const iv = setInterval(async () => {
        if (!ready) return;
        try {
          const s = await worker.getHeapStatistics();
          const now = s.used_heap_size + s.external_memory;
          base ??= now;
          if (now > peak) { peak = now; heap = s.used_heap_size; ext = s.external_memory; }
        } catch { /* the worker has ended */ }
      }, 2);
      const m = await new Promise((r) => worker.on("message", (x) => { if (x.ready) ready = true; else r(x); }));
      clearInterval(iv);
      await worker.terminate();
      const mb = (b) => (b / 1e6).toFixed(1);
      const out = how === "R11" ? 0 : W * H * nc;
      console.log(`${name} | ${how} | ${mb(input)} | ${mb(out)} | ${mb(peak - base)} (${mb(heap)}, ${mb(ext)}) | ${((peak - base) / (W * H)).toFixed(2)} | ${m.ms} | ${how === "R11" ? `${m.strips} (${m.most})` : ""}`);
    }
  }
}
