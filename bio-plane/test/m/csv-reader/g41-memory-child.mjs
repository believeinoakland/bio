/* A child process for g41-memory.test.mjs: holds a harness-shaped CSV of `bytes` bytes as one Buffer (as the object holds the
   file's bytes), reads it through the entry the way reading-pipeline does (`parts`, then `text` with an inline cap), keeps
   `parts` alive as the caller's scope does, and prints one JSON line with what the reader still held after a full GC.
   Not a test. Run: node --expose-gc --max-old-space-size=<MB> g41-memory-child.mjs <bytes> */
import { csvEntry } from "../../../src/csv-reader/index.mjs";

const total = Number(process.argv[2]);
const buf = Buffer.allocUnsafe(total + 4096);
let at = buf.write("id,name,amount,note\n");
for (let i = 0, n = 20; n < total; i++) {
  const r = `${i},"name ${i}",${(i * 37) % 9973}.${i % 100},"council note ${i} budget line"\n`;
  at += buf.write(r, at); n += r.length;
}
at += buf.write(`LASTROWMARK,"last name",1.00,"the final row of the sheet"\n`, at);
const bytes = new Uint8Array(buf.buffer, buf.byteOffset, at);
globalThis.gc(); globalThis.gc();
const base = process.memoryUsage().heapUsed;

const parts = await csvEntry.parts(bytes);
const t = await csvEntry.text(parts, { inlineCellsMax: 512 * 1024 });
const sheet = t.sheets[0];
globalThis.gc(); globalThis.gc();
const retainedMB = (process.memoryUsage().heapUsed - base) / 1048576;
const last = await csvEntry.cellsIn(parts, { fromRow: sheet.usedRows, toRow: sheet.usedRows });
console.log(JSON.stringify({
  ok: t.ok, bodyBytes: at, retainedMB, cellsHeld: sheet.cells_held === true, cellsNull: sheet.cells === null,
  textHasLast: sheet.text.includes("LASTROWMARK"), usedRows: sheet.usedRows,
  lastCell: last.ok ? last.cells[0].value : null, partsKept: parts.ok,
}));
