/* docprofile tests (R38): one `readText` over a very large text in a process of its own, so its memory is its alone.
 * Run by memory.test.mjs as `node --expose-gc memory-child.mjs <idle|measure> [pages] [chars-per-page]`.
 *   idle:    nothing read; prints {baseMB}.
 *   measure: the text of the size given (I2's `document` and `pages[]`, the two-byte text a PDF with one character past
 *            U+00FF yields) is built and held in a worker thread, as the caller holds it; after a collection the worker
 *            runs `readText` (synchronously, with a type that scans `ctx.pages` and a fallback) while this thread polls
 *            the worker's heap + external memory as fast as it answers, above that baseline. Prints
 *            {baseMB, peakMB, samples, ms, chars, answers}, `answers` being what the type saw and read.
 * The registry holds only these stand-in types (this module holds none, R36); the answers of the real types are doctypes'. */
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { fileURLToPath } from "node:url";

const MB = 1048576;
if (isMainThread) {
  const [mode, pages, per] = process.argv.slice(2);
  const w = new Worker(fileURLToPath(import.meta.url), { workerData: { mode, pages: Number(pages), per: Number(per) } });
  let base = null, peak = 0, samples = 0, stop = false;
  const heap = async () => { const h = await w.getHeapStatistics(); return h.used_heap_size + h.external_memory; };
  w.on("message", async (m) => {
    if (m.base) {
      base = await heap();
      (async () => { while (!stop) { const v = (await heap()) - base; samples++; if (v > peak) peak = v; } })();
      w.postMessage("go");
    } else if (m.idle) {
      console.log(JSON.stringify({ baseMB: (await heap()) / MB })); w.terminate();
    } else {
      stop = true;
      console.log(JSON.stringify({ baseMB: base / MB, peakMB: Math.max(peak, m.endMB * MB) / MB, samples, ...m }));
      w.terminate();
    }
  });
  w.on("error", (e) => { console.error(e); process.exit(1); });
} else {
  const { CONFIDENCE, CONTRACT, registerDoctype, readText } = await import("../registry.mjs");
  const used = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers; };
  const { mode, pages: N, per: PER } = workerData;
  if (mode === "idle") { global.gc(); global.gc(); parentPort.postMessage({ idle: true }); }
  else await measure();
  async function measure() {
  const line = "Council Resolution 2024-001 \u2014 the fiscal year budget, Section 4.2, adopted by the Board.\n";
  const pages = [];
  for (let i = 0; i < N; i++) {
    let t = `Page ${i + 1}\n`;
    while (t.length < PER) t += line;
    pages.push({ page: i, text: t.slice(0, PER), undetermined: [] });
  }
  const supplied = { document: pages.map((p) => p.text).join("\n"), pages, undetermined: [], counts: { chars: 0, undetermined: 0 } };
  let seenPages = null, scanned = 0, sawText = 0;
  registerDoctype({
    key: "scans_pages", label: "stand-in: scans page by page", version: 1, contract: CONTRACT.SUBSTANCE,
    detect(ctx) {
      seenPages = ctx.pages;
      sawText = ctx.text.length;
      let n = 0;
      for (const p of ctx.pages) if (/Resolution 2024-001/.test(p.text)) n++;
      scanned = n;
      return n ? { match: true, confidence: CONFIDENCE.CERTAIN, signals: ["pages"] } : { match: false };
    },
    parse(ctx) { return { entities: [], facts: { pages: ctx.pages.length } }; },
  });
  registerDoctype({ key: "generic", label: "stand-in fallback", version: 1, fallback: true, contract: CONTRACT.SUBSTANCE,
    detect: () => ({ match: false }), parse: () => ({ entities: [], facts: {} }) });
  global.gc(); global.gc();
  const base = used();
  parentPort.postMessage({ base: true });
  await new Promise((go) => parentPort.once("message", go));
  const t0 = performance.now();
  const r = readText(supplied, {});
  const ms = performance.now() - t0;
  parentPort.postMessage({ endMB: Math.max(0, used() - base) / MB, ms, chars: r.chars,
    answers: { determined: r.determined, type: r.doctype.type.key, confidence: r.doctype.confidence, also: r.doctype.also,
               parsed: r.parsed, positionParts: r.position_parts, textFrom: r.text_from,
               typeSawPages: seenPages === supplied.pages, scanned, sawText } });
  }
}
