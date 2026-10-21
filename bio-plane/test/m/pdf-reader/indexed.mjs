/* pdf-reader tests: PDFs written the way real producers write them, WITH an
 * xref (a classic table or a cross-reference stream, objects optionally packed
 * in an object stream, revisions appended with /Prev), for R40's `pdfTitle`,
 * which reads through the xref where R8's reader does not need one. Built from
 * text here, never from any one jurisdiction's documents (R29). */
import { deflateSync } from "node:zlib";
import { bytesOf } from "./pdf.mjs";

const cat = (parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
};
const pad = (n, w) => String(n).padStart(w, "0");
const be = (n, w) => Array.from({ length: w }, (_, i) => Math.floor(n / 2 ** (8 * (w - 1 - i))) & 0xff);

/** PNG "Up" predictor (12) over rows of `cols` bytes. */
function predictUp(rows, cols) {
  const out = [];
  let prev = new Array(cols).fill(0);
  for (const r of rows) { out.push(2, ...r.map((v, i) => (v - prev[i]) & 0xff)); prev = r; }
  return Uint8Array.from(out);
}

const body = (b) => (typeof b === "string" ? { text: b } : b);

/** `objs`: { num: "<< dict >>" | { dict, data } }. `packed`: object numbers (plain
 *  values, no streams) written inside one object stream. `xref`: "table" | "stream".
 *  `trailer`: the entries beside /Size (default `/Root 1 0 R`). `prev`: the earlier
 *  file's bytes, which this revision is appended to (its startxref becomes /Prev).
 *  `level`: the zlib level of the streams this writes (0 stores). */
export function indexed(objs, { xref = "table", packed = [], trailer = "/Root 1 0 R", prev = null, level = 6,
  header = "%PDF-1.7\n", objStmNum = 900, xrefNum = 990, predictor = true, junkAfter = "" } = {}) {
  const parts = prev ? [prev] : [bytesOf(header)];
  let pos = prev ? prev.length : parts[0].length;
  const add = (b) => { parts.push(b); pos += b.length; };
  const entries = new Map(); // num -> {type:1, off} | {type:2, stm, idx}
  const loose = Object.keys(objs).map(Number).filter((n) => !packed.flat().includes(n));
  for (const n of loose) {
    entries.set(n, { type: 1, off: pos });
    const b = objs[n];
    if (typeof b === "string") add(bytesOf(`${n} 0 obj\n${b}\nendobj\n`));
    else {
      const data = bytesOf(b.data ?? "");
      add(bytesOf(`${n} 0 obj\n<< ${b.dict ?? ""} /Length ${data.length} >>\nstream\n`)); add(data); add(bytesOf("\nendstream\nendobj\n"));
    }
  }
  /* `packed` is one object stream's numbers, or a list of lists for several (numbered objStmNum, objStmNum + 1, ...) */
  const groups = packed.length && Array.isArray(packed[0]) ? packed : packed.length ? [packed] : [];
  groups.forEach((group, g) => {
    const stmNum = objStmNum + g;
    let head = "", bodies = "";
    group.forEach((n, i) => { head += `${n} ${bodies.length} `; bodies += objs[n] + "\n"; entries.set(n, { type: 2, stm: stmNum, idx: i }); });
    const raw = bytesOf(head + bodies);
    const data = new Uint8Array(deflateSync(raw, { level }));
    entries.set(stmNum, { type: 1, off: pos });
    add(bytesOf(`${stmNum} 0 obj\n<< /Type /ObjStm /N ${group.length} /First ${head.length} /Filter /FlateDecode /Length ${data.length} >>\nstream\n`));
    add(data); add(bytesOf("\nendstream\nendobj\n"));
  });
  const size = Math.max(...entries.keys(), prev ? 0 : 0, xrefNum) + 1;
  const xrefAt = pos;
  if (xref === "table") {
    const nums = [...entries.keys()].sort((a, b) => a - b);
    let t = "xref\n";
    if (!prev) {
      t += `0 1\n0000000000 65535 f \n`;
    }
    for (const n of nums) {
      const e = entries.get(n);
      if (e.type !== 1) continue; // a table cannot say "compressed"
      t += `${n} 1\n${pad(e.off, 10)} 00000 n \n`;
    }
    t += `trailer\n<< /Size ${size} ${trailer}${prev ? ` /Prev ${prevStartxref(prev)}` : ""} >>\nstartxref\n${xrefAt}\n%%EOF\n`;
    add(bytesOf(t));
  } else {
    entries.set(xrefNum, { type: 1, off: xrefAt });
    const nums = [...entries.keys()].sort((a, b) => a - b);
    const w = [1, 4, 2];
    const cols = w[0] + w[1] + w[2];
    const rows = [];
    const index = [];
    for (const n of nums) {
      const e = entries.get(n);
      rows.push(e.type === 1 ? [1, ...be(e.off, 4), ...be(0, 2)] : [2, ...be(e.stm, 4), ...be(e.idx, 2)]);
      index.push(`${n} 1`);
    }
    const flat = predictor ? predictUp(rows, cols) : Uint8Array.from(rows.flat());
    const data = new Uint8Array(deflateSync(flat, { level }));
    const parms = predictor ? `/DecodeParms << /Columns ${cols} /Predictor 12 >> ` : "";
    add(bytesOf(`${xrefNum} 0 obj\n<< /Type /XRef /Size ${size} /W [${w.join(" ")}] /Index [${index.join(" ")}] ${trailer}`
      + `${prev ? ` /Prev ${prevStartxref(prev)}` : ""} /Filter /FlateDecode ${parms}/Length ${data.length} >>\nstream\n`));
    add(data);
    add(bytesOf(`\nendstream\nendobj\nstartxref\n${xrefAt}\n%%EOF\n${junkAfter}`));
  }
  return cat(parts);
}

function prevStartxref(bytes) {
  const s = Buffer.from(bytes).toString("latin1");
  const i = s.lastIndexOf("startxref");
  return parseInt(s.slice(i + 9).trim(), 10);
}

/** A literal string's PDF text-string forms the tests share. */
export const utf16hex = (s) => "<FEFF" + Buffer.from(s, "utf16le").swap16().toString("hex") + ">";
