/* proto-mem (THROWAWAY): phases and top sites of one tick of results/alloc-<name>.json. node proto-mem/alloc-report.mjs name k [topn] [--json] */
import { readFileSync } from "node:fs";
const [name, k = "1", n = "15"] = process.argv.slice(2);
const o = JSON.parse(readFileSync(new URL(`./results/alloc-${name}.json`, import.meta.url)));
const t = o.ticks[Number(k) - 1];
const has = (fs, ...names) => names.some((x) => fs.includes(x));
function phase(fs) {   /* fs: frames leaf first */
  const leaf = fs[0];
  if (has(fs, "#landSteps", "indexUnitsYielding")) {
    if (has(fs, "canonicalExtent")) return "land: canonical extent key (canonicalJson)";
    if (leaf === "utf8Bytes") return "land: utf8Bytes of each unit";
    if (has(fs, "sql.exec", "#rows", "#one", "countStatement")) return "land: SQL (row objects of SELECT 1 / state reads)";
    if (has(fs, "describeExtent")) return "land: describeExtent (ref string)";
    return "land: arrays/Set/Map/closures (ordered, rows, batches, seen, kindOf)";
  }
  if (has(fs, "detect", "detectFormat") && !has(fs, "textPiece", "textWindowTick")) {
    if (has(fs, "flatSlice", "flatOnce", "flatWindows")) return "first: doctype detect, flatten of the whole text";
    if (has(fs, "decodeText")) return "first: decode (detectFormat sniff)";
    return "first: doctype detect, per-line scans (eachLine etc.)";
  }
  if (has(fs, "decodeText", "decodedTextOf") || leaf === "decode" || leaf === "TextDecoder") return "decode bytes to string";
  if (has(fs, "totalsOfText")) return "first: totalsOfText (R35 walk over the whole text)";
  if (has(fs, "textPiece", "textPieceAnswer", "textWindowTick", "openRunPiece", "runWalker", "chunksOf", "utf8Length3", "withOwnWords", "unitOf")) return "split into runs/units + unit objects (textPiece etc.)";
  if (has(fs, "rangeBytes", "readRange", "get")) return "read bytes from the store";
  if (has(fs, "sha256HexSync", "#serialOf", "compress", "feed")) return "sha256 / serial";
  if (has(fs, "closeInstruments", "measure", "keyOf8", "sumRows")) return "plane instruments (measure/closeInstruments)";
  if (has(fs, "due", "live7", "all", "registry")) return "scheduler (due check)";
  if (has(fs, "readHeld", "#storedDocument", "readFile", "safeJson4", "#one", "#rows")) return "store reads before the piece (storedDocument, state rows)";
  return "other";
}
const ph = new Map(), agg = new Map();
for (const f of t.flat) {
  const fs = f.stack.split(" < "); const p = phase(fs);
  ph.set(p, (ph.get(p) || 0) + f.self);
  const key = `${f.fn}@${f.line}:${f.col}`; const a = agg.get(key) || { key, self: 0, stack: fs.slice(1, 5).join(" < "), phase: p }; a.self += f.self; agg.set(key, a);
}
const tot = t.total_sampled_bytes, MB = (x) => (x / 1048576).toFixed(2);
console.log(`## ${name} tick ${k}: total ${MB(tot)} MB sampled, ${t.ms} ms, rows_added ${t.rows_added}, r2 gets ${JSON.stringify(t.r2.map((x) => x.range ? x.range.length : "whole " + x.size))}`);
console.log("phase | MB | share");
for (const [p, v] of [...ph.entries()].sort((a, b) => b[1] - a[1])) console.log(`${p} | ${MB(v)} | ${(100 * v / tot).toFixed(1)}%`);
console.log("top sites | MB | share | callers | phase");
for (const r of [...agg.values()].sort((a, b) => b.self - a.self).slice(0, Number(n))) console.log(`${r.key} | ${MB(r.self)} | ${(100 * r.self / tot).toFixed(1)}% | ${r.stack} | ${r.phase}`);
