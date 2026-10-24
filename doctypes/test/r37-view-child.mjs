/* doctypes R37, a type's detect over a classification view: the garbage each `detect` leaves uncollected (fix round 9, K4892).
 * Run by r37-view.test.mjs as `node --expose-gc r37-view-child.mjs`. A worker with a 2 MB young generation, as the plane's isolate
 * runs, is handed a 3 MiB CSV-shaped sheet; its classification view (docprofile's, the text the types are handed above
 * CLASSIFY_WHOLE_MAX_CHARS) is built, and each registered type's `detect` runs over it with `ctx.work` and `ctx.window` as docprofile
 * hands them. A collection runs BEFORE each detect and none after it, so the heap and array buffers the worker holds when the detect
 * returns, above what it held before, are what the detect left behind: a large-object string is freed only by a major collection, and
 * in one tick of the isolate these pile up (K4838 (3)). Prints {chars, of, types: {key: {leftMB, match, confidence}}}. */
import { Worker, isMainThread, parentPort } from "node:worker_threads";
import { fileURLToPath } from "node:url";

const MB = 1048576;
if (isMainThread) {
  const w = new Worker(fileURLToPath(import.meta.url), { resourceLimits: { maxYoungGenerationSizeMb: 2 } });
  w.on("message", (m) => { console.log(JSON.stringify(m)); w.terminate(); });
  w.on("error", (e) => { console.error(e); process.exit(1); });
} else {
  const { DOCTYPES } = await import("../index.mjs");
  const { classificationView } = await import("../../docprofile/classify-view.mjs");
  const { HELD } = await import("./fixtures.mjs");
  const used = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers; };
  /* A sheet of 3 MiB: rows of cells, with a few of the phrases the types look for scattered through the notes. */
  const rows = ["id,name,amount,note"];
  for (let n = 20, i = 0; n < 3 * MB; i++) {
    const note = i % 400 === 0 ? "Subject: a matter before the body; Recommendation: that the body receive the report"
      : i % 570 === 0 ? "WHEREAS the Council finds that the matter is within its power"
      : i % 900 === 0 ? "A motion was made by A, seconded by B, that this matter be Accepted. The motion carried by the following vote:"
      : "council note budget line";
    const r = `${i},"name ${i}",${(i * 37) % 9973}.${i % 100},"${note} ${i}"`;
    rows.push(r); n += r.length + 1;
  }
  const text = rows.join("\n"); rows.length = 0;
  const v = classificationView(text);
  const view = v.view;
  const out = {};
  for (const t of DOCTYPES) {
    const ctx = { text: view, view: HELD, locate: () => null, alsoSatisfies: () => [], window: { from: 0, to: view.length, of: v.of },
                  work: { chars: 0, limit: 4 * view.length } };
    global.gc(); global.gc();
    const base = used();
    const r = t.detect(ctx);
    out[t.key] = { leftMB: Math.max(0, used() - base) / MB, match: !!(r && r.match), confidence: r && r.confidence, work: ctx.work.chars };
  }
  parentPort.postMessage({ chars: view.length, of: v.of, types: out });
}
