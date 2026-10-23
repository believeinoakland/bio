/* A child process for g41-held.test.mjs: reads a package from a file under the old-space limit its parent sets, and
   answers sizes and a few cells only. Not a test. Run with --expose-gc and --max-old-space-size.
     node --expose-gc --max-old-space-size=N g41-peak.mjs <file> text|cellsIn <fromRow> <toRow>  */
import { readFileSync } from "node:fs";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";

const [file, job, fromRow, toRow] = process.argv.slice(2);
const bytes = new Uint8Array(readFileSync(file));
gc(); gc();
const idleMB = process.memoryUsage().heapUsed / 1e6;
let answer;
if (job === "text") {
  const t = await xlsxEntry.text(bytes, { inlineCellsMax: 512 * 1024 });
  const s = t.sheets[0];
  answer = { ok: t.ok, documentLength: t.document.length, lines: s.text.split("\n").length, lineRows: s.lineRows.length,
    cells: s.cells, cells_held: s.cells_held ?? null, usedRows: s.usedRows, piecewise: t.piecewise ?? null };
} else {
  const r = await xlsxEntry.cellsIn(bytes, { sheet: "Big", fromRow: Number(fromRow), toRow: Number(toRow) });
  answer = { ok: r.ok, cells: r.cells, rows: r.rows, next_row: r.next_row };
}
process.stdout.write(JSON.stringify({ idleMB, endMB: process.memoryUsage().heapUsed / 1e6, answer }));
