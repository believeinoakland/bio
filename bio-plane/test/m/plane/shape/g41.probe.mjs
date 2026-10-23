/* G41 at the platform's shape (K4426 (4); plan G41 (3), D6; K4636, K4639): a sheet is HELD and its text read whole; its typed cells are not all made at intake. A 4 MB CSV, an 8 MB CSV, the
 * largest CSV csv-reader's stated bound takes (`MEASURED_CSV_TEXT_BOUND_BYTES`, 20 MiB) and a 200,000-row xlsx (3 short cells a row, about 30.5 MB of declared sheet text, a 3 MB file) are uploaded by the
 * member's path and read to the end by the real plane's ledger, in a child under TEST-SUPPORT #9's value limit whose old space is the object's 128 MB plus the 39 MB of the plane's idle that
 * `diagnosis-R6-g40.md` section 1 measures, less the file's N MB: the cap `128 + 39 - N` (passed explicitly; `capFor` has no D). Pass, per run: the child alive, every tick under 10 s by the node
 * child's wall clock (R-CLOCK), `readingFor` stating its state at every tick, the first, a middle and the last row found in the index and by `op=search` (`passage:`), `cellsOf` of the last row
 * answering the generator's cells at the same cap, the largest stored value under 1 MiB. The memory peaks are printed. A size that does not fit is reported with the largest that does.
 *   node g41.probe.mjs [csv4 csv8 csvmax xlsx ...]     (default: all four; one run at a time) */
import { fileURLToPath } from "node:url";
import { shapeRun, csvDoc, xlsxDoc, report, STORED_VALUE_BOUND } from "./harness.mjs";
import { MEASURED_CSV_TEXT_BOUND_BYTES } from "../../../../src/csv-reader/index.mjs";

export const D_MB = 39;
export const TICK_MS_MAX = 10_000;
export const XLSX_ROWS = 200_000;
export const MARKS = ["FIRSTROWMARK", "MIDROWMARK", "LASTROWMARK"];
/** the cap for a file of `bytes` (N MB = MiB the bytes take in the object): 128 + D - N */
export const g41Cap = (bytes) => Math.floor(128 + D_MB - bytes / 1048576);
const csvMax = MEASURED_CSV_TEXT_BOUND_BYTES;
export const CASES = {
  csv4: async () => ({ label: "G41 4 MB CSV", doc: csvDoc(4 * 1048576) }),
  csv8: async () => ({ label: "G41 8 MB CSV", doc: csvDoc(8 * 1048576) }),
  csvmax: async () => ({ label: `G41 ${csvMax / 1048576} MB CSV (csv-reader's MEASURED_CSV_TEXT_BOUND_BYTES)`, doc: csvDoc(csvMax) }),
  xlsx: async () => ({ label: `G41 ${XLSX_ROWS}-row xlsx`, doc: await xlsxDoc(XLSX_ROWS) }),
};

/** one case: the run, and the list of what failed (empty: pass) */
export async function runCase(name, capOverride = null) {
  const { label, doc } = await CASES[name]();
  const cap = capOverride ?? g41Cap(doc.bytes);
  const r = await shapeRun({ doc, search: MARKS, readingEachTick: true, cellsOf: true, maxTicks: 600 }, { capMB: cap });
  return { name, label, cap, r, failed: failures(r) };
}

export function failures(r) {
  const f = [];
  if (r.died) return [`the child died: ${r.error || r.stderr || r.signal || "exit " + r.code}`];
  const d = r.done;
  if (d.left.length) f.push(`the ledger still owes ${d.left} after ${d.ticks} ticks`);
  const slow = r.ticks.filter((t) => t.ms >= TICK_MS_MAX); if (slow.length) f.push(`${slow.length} tick(s) at or over 10 s (max ${Math.max(...slow.map((t) => t.ms))} ms)`);
  const mute = r.ticks.filter((t) => !t.readingFor || t.readingFor.error || !(t.readingFor.state || t.readingFor.failure)); if (mute.length) f.push(`readingFor did not state its state at ${mute.length} tick(s), first: ${JSON.stringify(mute[0] && mute[0].readingFor)}`);
  for (const m of MARKS) {
    if (!(d.found[m] >= 1)) f.push(`${m} is not in the index (capture_text_fts rows: ${d.found[m]})`);
    const s = d.search[m]; if (!s || s.error || !(s.total >= 1)) f.push(`op=search passage:${m} found nothing: ${JSON.stringify(s)}`);
  }
  const c = r.cells;
  if (!c) f.push("cellsOf of the last row was not asked"); else if (c.error) f.push(`cellsOf of the last row: ${c.error}`);
  else if (JSON.stringify(c.values) !== JSON.stringify(c.expected)) f.push(`cellsOf of the last row ${c.lastRow} answered ${JSON.stringify(c.values)}, not ${JSON.stringify(c.expected)}`);
  if (r.largestStored == null) f.push("the largest stored value was not measured"); else if (r.overBound) f.push(`a stored value of ${r.largestStored} B is over ${STORED_VALUE_BOUND} B`);
  if (r.readingDied) f.push("the child died asking readingFor of the finished reading");
  return f;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const names = process.argv.slice(2).filter((a) => CASES[a]); let worst = 0;
  for (const name of names.length ? names : Object.keys(CASES)) {
    const out = await runCase(name);
    console.log(report(out.label, out.r));
    console.log(`  ${out.failed.length ? "FAIL: " + out.failed.join("; ") : "PASS"} (cap ${out.cap} MB)`);
    if (out.failed.length) {
      worst = 1;
      if (name.startsWith("csv")) {   /* the stated bound: the largest CSV that fits, at its cap */
        for (const mb of [16, 12, 8, 6, 4, 2, 1]) {
          if (mb * 1048576 >= (await CASES[name]()).doc.bytes) continue;
          const t = await shapeRun({ doc: csvDoc(mb * 1048576), search: MARKS, readingEachTick: true, cellsOf: true, maxTicks: 600 }, { capMB: g41Cap(mb * 1048576) });
          const tf = failures(t); console.log(`  try ${mb} MB at cap ${g41Cap(mb * 1048576)}: ${tf.length ? "FAIL " + tf[0] : "PASS (the largest that fits)"}`);
          if (!tf.length) break;
        }
      }
    }
  }
  process.exit(worst);
}
