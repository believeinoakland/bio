/* reading-pipeline tests (G26): the child of pdf-pieces.test.mjs. One stored PDF capture read in process of its own.
 *   whole:  one `read` with no cursor (one parse), its wall time.
 *   pieces: `read` with a cursor until `more` is false, each piece timed (reported only, R-CLOCK), the store's reads and the bytes they served counted at each
 *           piece (K4847: the bars are counts), heap + array buffers polled across the run.
 * Prints one JSON line. Pieces are asked as extraction asks them (its 2 MiB index bound, 4,096 units). A reading that outgrows the old space this process was started with (`--max-old-space-size`) dies. */
import { readFileSync } from "node:fs";
import { registerDoctype } from "../../../../docprofile/registry.mjs";
import { registerDoctypes } from "../../../../doctypes/index.mjs";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { fresh, hold, doc, evidenceStore } from "./fixture.mjs";

registerDoctypes(registerDoctype);
const [mode, file] = process.argv.slice(2);
const used = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers; };
const bytes = new Uint8Array(readFileSync(file));
const world = fresh();
const digest = await hold(world.evidence, bytes);
const call = (document, extra = {}) => read(document, { evidence: evidenceStore(world.evidence), env: {}, storeName: "bio", view: world.view(), ...extra });
const document = doc({ digest, bytes: bytes.length, ct: "application/pdf", format: "pdf" });
let peak = 0;
const timer = setInterval(() => { const v = used(); if (v > peak) peak = v; }, 2);
const t0 = performance.now();
if (mode === "whole") {
  const made = await call(document, { unitsBudget: Infinity });
  console.log(JSON.stringify({ ms: performance.now() - t0, units: (made.text_units || []).length, pages: made.reading.page_count, served: world.evidence.served }));
} else {
  const ms = [], pages = new Set(), gets = [], served = [], perPiece = [];
  let cursor = null, units = 0, first = null;
  for (let g = 0; g < 400; g++) {
    const t = performance.now(), g0 = world.evidence.calls.filter((c) => c[0] === "get").length, s0 = world.evidence.served;
    const out = await call(document, { cursor, unitsBudget: 2 * 1048576, maxUnits: 4096 });
    ms.push(performance.now() - t);
    gets.push(world.evidence.calls.filter((c) => c[0] === "get").length - g0); served.push(world.evidence.served - s0);
    if (out.refused) { console.log(JSON.stringify({ refused: out.refused.code, ms })); process.exit(0); }
    first ||= out.reading;
    perPiece.push(out.piece && out.piece.pages ? out.piece.pages[1] - out.piece.pages[0] : null);
    for (const u of out.text_units || []) { units++; pages.add(u.extent.page); }
    if (out.more !== true) break;
    cursor = out.cursor;
  }
  console.log(JSON.stringify({ ms, gets, served, perPiece, totalMs: performance.now() - t0, units, distinctPages: pages.size, pageCount: first && first.page_count,
                               peakMB: peak / 1048576, bytesMB: bytes.length / 1048576 }));
}
clearInterval(timer);
