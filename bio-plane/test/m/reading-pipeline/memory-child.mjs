/* reading-pipeline tests (memory): one `read` of one stored PDF capture in a process of its own, so its memory is its alone.
 * Run by memory.test.mjs as `node [--expose-gc --max-old-space-size=N --max-semi-space-size=2] memory-child.mjs <idle|measure|digest> <file|synth>`.
 *   idle:    the heap this process holds before any reading (modules loaded, doctypes registered as the plane does), collected.
 *   measure: baseline after a collection with the capture stored, then `read` with the peak of heap + array buffers polled
 *            while it runs; prints {baseMB, peakMB, ms, units, pages}. A reading that outgrows the heap limit dies, and so does this.
 *   digest:  the whole answer of `read` (reading, units, bound figures) as a SHA-256, with no limit set. */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { registerDoctype } from "../../../../docprofile/registry.mjs";
import { registerDoctypes } from "../../../../doctypes/index.mjs";
import { fresh, hold, doc } from "./fixture.mjs";

registerDoctypes(registerDoctype);
const [mode, file] = process.argv.slice(2);
/* A text judged from a sample says so after the basis (R52); the sentence is the sentence-owner's wording and tests never hold its text (K3810), so it is
   taken off by name before hashing and every other byte stays pinned (B52). The figures in it are the sample's and are cut with it. */
const SAMPLE = / — (?:the kind of document|What kind of document this is) was judged from a sample of its text.*$/;
const withoutSampleSentence = (made) => (made && made.reading && typeof made.reading.basis === "string" && SAMPLE.test(made.reading.basis)
  ? { ...made, reading: { ...made.reading, basis: made.reading.basis.replace(SAMPLE, "") } } : made);
const used = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers; };
const gc = () => { global.gc(); global.gc(); };
if (mode === "idle") {
  gc();
  console.log(JSON.stringify({ baseHeapMB: process.memoryUsage().heapUsed / 1048576 }));
} else {
  let bytes;
  if (file === "synth") {
    const { synthPdf } = await import("./bigpdf.mjs");
    bytes = synthPdf({ pages: 1300, linesPerPage: 120, targetBytes: 21_000_000 });
  } else bytes = new Uint8Array(readFileSync(file));
  const world = fresh();
  const digest = await hold(world.evidence, bytes);
  const document = doc({ digest, bytes: bytes.length, ct: "application/pdf", format: "pdf" });
  const size = bytes.length;
  bytes = null;
  gc();
  const base = used();
  let peak = 0;
  const timer = setInterval(() => { const v = used() - base; if (v > peak) peak = v; }, 2);
  const t0 = performance.now();
  const made = await world.read(document);
  const ms = performance.now() - t0;
  clearInterval(timer);
  peak = Math.max(peak, used() - base);
  if (mode === "measure")
    console.log(JSON.stringify({ baseMB: base / 1048576, peakMB: peak / 1048576, bytesMB: size / 1048576, ms, units: (made.text_units || []).length,
                                 pages: made.reading.page_count }));
  else
    console.log(JSON.stringify({ digest: createHash("sha256").update(JSON.stringify(withoutSampleSentence(made))).digest("hex"),
                                 units: (made.text_units || []).length, pages: made.reading.page_count }));
}
