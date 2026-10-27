/* reading-pipeline tests (csv-range): one CSV past a whole read, read to its last row in a process of its own with the old space capped (the
 * object's 128 MB), so a read that holds the object or its text whole dies by name. Run by csv-range.test.mjs as
 * `node --expose-gc --max-old-space-size=N csv-range-child.mjs <whole|parts|undetermined> <MiB>`: the CSV's bytes are held in the store (whole under
 * its digest, or in 8 MiB parts with no whole), the generator's strings let go, and `read` is asked piece after piece until `more` is false.
 * Prints what the test judges: the first answer's facts, every piece's units counted by row, the marks found with the rows their extents hold, the
 * words the pieces add up to and the last piece's statement of them, the most evidence-store reads one piece made, the peak heap. */
import { createHash } from "node:crypto";
import { registerDoctype } from "../../../../docprofile/registry.mjs";
import { registerDoctypes } from "../../../../doctypes/index.mjs";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { fresh, hold, doc, evidenceStore, sha } from "./fixture.mjs";

registerDoctypes(registerDoctype);
const [shape, mibArg] = process.argv.slice(2);
const MIB = Number(mibArg);
const gc = () => { global.gc(); global.gc(); };
const MARKS = { FIRSTMARK: 2, MIDMARK: null, LASTMARK: null };

/* the CSV, as 1 MiB byte chunks (never one string), with three marks; its rows counted as they are made */
function* csvChunks() {
  const enc = new TextEncoder();
  let rows = 1, bytes = 0, buf = ["id,name,amount,note\n"];
  const target = MIB * 1048576 - 200;
  for (let i = 1; bytes < target; i++) {
    const mark = i === 1 ? "FIRSTMARK" : (!MARKS.MIDMARK && bytes >= target / 2) ? (MARKS.MIDMARK = rows + 1, "MIDMARK") : "";
    if (i === 1) MARKS.FIRSTMARK = rows + 1;
    const line = `${i},person ${i},${(i * 7) % 1000}.50,"note, with comma ${i} ${mark}"\n`;
    buf.push(line); bytes += line.length; rows++;
    if (buf.length === 4000) { yield enc.encode(buf.join("")); buf = []; }
  }
  buf.push(`${rows},last name,1.00,"the final row LASTMARK"\n`); rows++; MARKS.LASTMARK = rows;
  yield enc.encode(buf.join(""));
  MARKS.ROWS = rows;
}
const w = fresh();
const hash = createHash("sha256");
const parts = [];
let all = null, size = 0;
if (shape === "whole") {
  const chunks = [...csvChunks()];
  size = chunks.reduce((n, c) => n + c.length, 0);
  all = new Uint8Array(size);
  let at = 0; for (const c of chunks) { all.set(c, at); at += c.length; }
  chunks.length = 0;
} else {
  let pending = [], held = 0;
  const flush = async () => {
    if (!held) return;
    const part = new Uint8Array(held); let at = 0; for (const c of pending) { part.set(c, at); at += c.length; }
    pending = []; held = 0;
    hash.update(part); size += part.length;
    parts.push({ sha256: await hold(w.evidence, part), bytes: part.length });
  };
  for (const c of csvChunks()) { pending.push(c); held += c.length; if (held >= 8388608) await flush(); }
  await flush();
}
const digest = all ? sha(all) : hash.digest("hex");
if (all) { await hold(w.evidence, all); all = null; }
const document = doc({ digest, bytes: size, ct: "text/csv", format: shape === "undetermined" ? "undetermined" : "csv", ...(parts.length ? { parts } : {}) });
const store = evidenceStore(w.evidence);
gc();
const reads = []; const base = w.evidence.calls.length;
let peak = 0; const timer = setInterval(() => { peak = Math.max(peak, process.memoryUsage().heapUsed); }, 5);

const out = { shape, size, marks: MARKS, ticks: 0, units: 0, maxGets: 0, words: 0, rows: 0, dup: 0, found: {}, facts: null, notInPieces: null };
/* a read that is not in pieces says it is read in pieces and reads none of it */
{
  const n = await read(document, { evidence: store, view: w.view(), env: {} });
  out.notInPieces = { failure: n.reading.failure, basis: n.reading.basis, units: (n.text_units || []).length };
}
let cursor = null, rowsSeen = new Uint8Array(MARKS.ROWS + 2);
for (;;) {
  const g0 = w.evidence.calls.length;
  const r = await read(document, { evidence: store, view: w.view(), env: {}, cursor, maxUnits: 4096, unitsBudget: 2 * 1024 * 1024 });
  out.ticks++;
  out.maxGets = Math.max(out.maxGets, w.evidence.calls.slice(g0).filter((c) => c[0] === "get").length);
  if (out.ticks === 1) {
    const rd = r.reading;
    out.first = { failure: rd.failure ?? null, words_total: rd.words_total, words_read: rd.words_read, cells: rd.cells, cells_held: rd.cells_held, dialect: rd.dialect && rd.dialect.delimiter,
                  scope: rd.provenance && rd.provenance.text_scope, extent: rd.container_extent && rd.container_extent.sheets, more: r.more, total: r.total, first_unit_range: (r.text_units || [])[0] && r.text_units[0].extent.range,
                  first_lines: (r.text_units || [])[0] && r.text_units[0].text.split("\n").slice(0, 2) };
  }
  if (r.reading && !r.reading.content_type) out.facts = r.reading;
  for (const u of r.text_units || []) {
    out.units++;
    const own = u.seq > 0 && u.lineRows[0] === 1 && u.lineRows.length > 1 ? u.lineRows.slice(1) : u.lineRows;
    for (const row of own) { if (rowsSeen[row]) out.dup++; else { rowsSeen[row] = 1; out.rows++; } }
    for (const m of Object.keys(MARKS)) if (m !== "ROWS" && u.text.includes(m)) out.found[m] = { range: u.extent.range, from: own[0], to: own[own.length - 1] };
  }
  out.words += r.piece ? r.piece.words : 0;
  if (!r.more) break;
  if (r.cursor === cursor) { out.stuck = true; break; }
  cursor = r.cursor;
}
clearInterval(timer);
out.peakMB = Math.round(peak / 1048576);
out.expectedRows = MARKS.ROWS;
console.log(JSON.stringify(out));
