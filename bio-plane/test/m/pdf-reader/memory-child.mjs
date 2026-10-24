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
const { extractPdfStructure, extractPdfRange, openPdfRange, openPdf } = await import(process.env.BIO_PDFSTRUCTURE_SRC || "../../../src/pdfstructure.mjs");
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
} else if (mode === "bigpage") {
  /* R41: a file whose page 2 (index 1) is one very large content stream of text lines, read in whatever heap limit the process
     was started with: whether it completes, the first and last pages' text, and how many times page 2 says the sentence. */
  const bytes = new Uint8Array(readFileSync(file));
  const sentence = process.argv[4];
  const r = await extractPdfStructure(bytes);
  const t = r.text.pages[1].text;
  let n = 0;
  for (let at = t.indexOf(sentence); at !== -1; at = t.indexOf(sentence, at + sentence.length)) n++;
  console.log(JSON.stringify({ ok: r.ok, pages: r.pages, first: r.text.pages[0].text, last: r.text.pages[2].text, said: n,
    marked: r.text.undetermined.map((u) => u.reason), notes: r.notes }));
} else if (mode === "embedded") {
  /* R22: a file with an embedded file attached; the peak of LIVE heap + array buffers above the baseline (the file's bytes are
     read before the baseline, so they are not counted) and the embedded files' records. */
  const bytes = new Uint8Array(readFileSync(file));
  const used = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers; };
  global.gc(); global.gc();
  const base = used();
  let peak = 0;
  /* a collection before each reading, so the peak is what is LIVE (what is held), not the garbage a decoder's chunks leave */
  const timer = setInterval(() => { global.gc(); const v = used() - base; if (v > peak) peak = v; }, 20);
  const r = await extractPdfStructure(bytes);
  clearInterval(timer);
  console.log(JSON.stringify({ baseMB: base / 1048576, peakMB: peak / 1048576, ok: r.ok, notes: r.notes,
    intra: r.links.filter((l) => l.partition === "intra").map((l) => ({ sha: l.target.sha256, bytes: l.target.bytes })) }));
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
} else if (mode === "range") {
  /* R43: every range of `count` pages, in turn, from one copy of the bytes; the peak of heap + array buffers above the
     baseline over all of them, the slowest range, and the SHA-256 of the pages' text in order. */
  const { createHash } = await import("node:crypto");
  const count = Number(process.argv[4]);
  const bytes = new Uint8Array(readFileSync(file));
  const used = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers; };
  global.gc(); global.gc();
  const base = used();
  let peak = 0;
  const timer = setInterval(() => { const v = used() - base; if (v > peak) peak = v; }, 2);
  const h = createHash("sha256");
  let slowest = 0, total = 0, calls = 0;
  for (let from = 0; ; from += count) {
    const t0 = performance.now();
    const r = await extractPdfRange(bytes, { from, count });
    slowest = Math.max(slowest, performance.now() - t0);
    total = r.pages; calls++;
    for (const p of r.text.pages) h.update(JSON.stringify([p.page, p.text, p.undetermined]));
    if (r.count === 0 || from + count >= r.pages) break;
  }
  clearInterval(timer);
  console.log(JSON.stringify({ baseMB: base / 1048576, peakMB: peak / 1048576, slowestMs: slowest, pages: total, calls, digest: h.digest("hex") }));
} else if (mode === "opened") {
  /* R44: the file opened once, then every range of `count` pages from the one opened document, which is held to the end;
     the same measures as "range" (the peak is read while the opened document is still held), and the pages' digest. */
  const { createHash } = await import("node:crypto");
  const count = Number(process.argv[4]);
  const bytes = new Uint8Array(readFileSync(file));
  const used = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers; };
  global.gc(); global.gc();
  const base = used();
  let peak = 0;
  const timer = setInterval(() => { const v = used() - base; if (v > peak) peak = v; }, 2);
  const h = createHash("sha256");
  const t0 = performance.now();
  const opened = await openPdfRange(bytes);
  const openMs = performance.now() - t0;
  let slowest = 0, calls = 0;
  for (let from = 0; ; from += count) {
    const t1 = performance.now();
    const r = await opened.range({ from, count });
    slowest = Math.max(slowest, performance.now() - t1);
    calls++;
    for (const p of r.text.pages) h.update(JSON.stringify([p.page, p.text, p.undetermined]));
    if (r.count === 0 || from + count >= opened.pages) break;
  }
  clearInterval(timer);
  console.log(JSON.stringify({ baseMB: base / 1048576, peakMB: peak / 1048576, openMs, slowestMs: slowest, pages: opened.pages, calls, digest: h.digest("hex"), held: Boolean(opened.range) }));
} else {
  const bytes = new Uint8Array(readFileSync(file));
  console.log(JSON.stringify({ digest: digestOf(await extractPdfStructure(bytes)) }));
}
