/* pdf-reader tests (R41): one reading of one file in a process of its own, so its memory is its alone. Run by
 * memory.test.mjs as `node [--expose-gc --max-old-space-size=N] memory-child.mjs <measure|digest> <file>`.
 *   measure: baseline after a collection, the reading with the peak of heap + array buffers polled while it runs;
 *            prints {baseMB, peakMB, ms, pages, ok, reason}. A reading that outgrows the heap limit dies, and so does this.
 *   objects: the same for `openPdf` and then `objects()` (R37), the file's bytes counted: prints {baseMB, peakMB, ms, objects, ok}.
 *   objdigest: a SHA-256 over every entry `objects()` answers (number, generation, value, string bytes), with no limit set.
 *   idle:    the heap this process holds before any reading (modules loaded, collected): {baseHeapMB}.
 *   digest:  the reading's whole answer as digestOf() states it, with no limit set. */
import { readFileSync } from "node:fs";
import { digestOf } from "./digest.mjs";

const [mode, file] = process.argv.slice(2);
const { extractPdfStructure, openPdf } = await import(process.env.BIO_PDFSTRUCTURE_SRC || "../../../src/pdfstructure.mjs");
if (mode === "idle") {
  global.gc(); global.gc();
  console.log(JSON.stringify({ baseHeapMB: process.memoryUsage().heapUsed / 1048576 }));
} else if (mode === "measure") {
  const bytes = new Uint8Array(readFileSync(file));
  const used = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers; };
  global.gc(); global.gc();
  const base = used();
  let peak = 0;
  const timer = setInterval(() => { const v = used() - base; if (v > peak) peak = v; }, 2);
  const t0 = performance.now();
  const r = await extractPdfStructure(bytes);
  const ms = performance.now() - t0;
  clearInterval(timer);
  console.log(JSON.stringify({ baseMB: base / 1048576, peakMB: peak / 1048576, ms, pages: r.pages, ok: r.ok, reason: r.reason ?? null }));
} else if (mode === "objects") {
  const used = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers; };
  global.gc(); global.gc();
  const base = used();
  let peak = 0;
  const timer = setInterval(() => { const v = used() - base; if (v > peak) peak = v; }, 2);
  const bytes = new Uint8Array(readFileSync(file));
  const t0 = performance.now();
  const doc = await openPdf(bytes);
  const r = doc.objects();
  const ms = performance.now() - t0;
  clearInterval(timer);
  console.log(JSON.stringify({ baseMB: base / 1048576, peakMB: peak / 1048576, ms, objects: r ? r.objects.length : null, ok: Boolean(r) }));
} else if (mode === "objdigest") {
  const { createHash } = await import("node:crypto");
  const doc = await openPdf(new Uint8Array(readFileSync(file)));
  const r = doc.objects();
  const h = createHash("sha256");
  h.update(JSON.stringify(r.trailer, (k, v) => (v instanceof Uint8Array ? Array.from(v) : v)));
  for (const o of r.objects) h.update(JSON.stringify([o.num, o.gen, o.value], (k, v) => (v instanceof Uint8Array ? Array.from(v) : v)));
  h.update(JSON.stringify(r.unresolved));
  console.log(JSON.stringify({ digest: h.digest("hex"), objects: r.objects.length }));
} else {
  const bytes = new Uint8Array(readFileSync(file));
  console.log(JSON.stringify({ digest: digestOf(await extractPdfStructure(bytes)) }));
}
