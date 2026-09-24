/* FW-23 (2026-09-24) — THE CSV CORPUS, THROUGH THE PLANE'S OWN CSV ENTRY.
 *
 * The measurement the `csv` format entry was written from (M-144). It drives
 * the registry seam and nothing else: `detectFormat(bytes, contentType)` in
 * the registry's own two-pass order, then, when an entry answers, that
 * entry's `parts()` / `structure()` / `text()` over the same bytes. Nothing
 * here parses a CSV itself — every figure below is the plane's answer, so a
 * defect in the entry shows up as a defect in this census rather than being
 * hidden by a second, agreeing implementation.
 *
 * usage:
 *   node tools/fw23-csv-census.mjs <dir-of-bodies> <fetched.jsonl>   # the corpus
 *   node tools/fw23-csv-census.mjs --file <path> [content-type]      # just one
 *
 * `fetched.jsonl` is one JSON object per body: { key, file, content_type,
 * bytes }, as `fw23-fetch-csv.py` writes it (kept in the session pen — a
 * 90 MB corpus is not committed; the keys are public and the fetch is one
 * public ListObjectsV2 walk of s3://cao-94612 plus one GET each).
 *
 * WHAT IT CANNOT SEE: `op=acquire`'s own content-type handling before the
 * registry is consulted, and any body the bucket does not hold. It reports on
 * the 166 `.csv` keys of one bucket on one day, which is the whole population
 * of that extension there and not a sample of CSV in general.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { detectFormat, getFormat } from "../bio-plane/src/formats.mjs";

async function readOne(bytes, ct) {
  const d = detectFormat(bytes, ct || null);
  const out = { bytes: bytes.length, format: d.format, confidence: d.confidence };
  if (d.format === "undetermined") return out;
  const entry = getFormat(d.format);
  if (!entry) return out;
  const parts = typeof entry.parts === "function" ? await entry.parts(bytes) : bytes;
  const st = typeof entry.structure === "function" ? await entry.structure(parts) : null;
  const tx = typeof entry.text === "function" ? await entry.text(parts) : null;
  if (st && st.ok) out.dialect = st.dialect;
  if (tx && tx.ok) {
    const s = tx.sheets[0] || null;
    out.text = {
      chars: tx.counts.chars, cells: tx.counts.cells,
      undetermined: tx.counts.undetermined,
      usedRows: s ? s.usedRows : null, usedCols: s ? s.usedCols : null,
      rowsBound: s ? s.rows : null, range: s && s.range ? s.range.ref : null,
      guard: tx.undetermined[0] && tx.undetermined[0].why === "over_size_bound"
        ? tx.undetermined[0] : null,
    };
  } else if (tx) out.text = { ok: false, reason: tx.reason };
  return out;
}

const argv = process.argv.slice(2);
if (argv[0] === "--file") {
  const bytes = new Uint8Array(readFileSync(argv[1]));
  console.log(JSON.stringify(await readOne(bytes, argv[2] || null), null, 1));
  process.exit(0);
}
const [dir, manifest] = argv;
if (!dir || !manifest) {
  console.error("usage: fw23-csv-census.mjs <dir-of-bodies> <fetched.jsonl> | --file <path> [ct]");
  process.exit(2);
}
const recs = readFileSync(manifest, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const tally = {
  n: 0, bytes: 0, detected: 0, undetected: 0,
  encoding: {}, encodingConfidence: {}, delimiter: {}, delimiterConfidence: {},
  overBound: 0, cells: 0, rows: 0, undeterminedCells: 0, filesWithUndeterminedCells: 0,
  boundNull: 0, rangeEmitted: 0,
};
const named = [];
const t0 = Date.now();
for (const r of recs) {
  const bytes = new Uint8Array(readFileSync(join(dir, r.file)));
  const got = await readOne(bytes, r.content_type);
  tally.n++; tally.bytes += bytes.length;
  if (got.format === "csv") tally.detected++; else { tally.undetected++; named.push(["NOT DETECTED", r.key, got.format]); continue; }
  const d = got.dialect || {};
  tally.encoding[String(d.encoding)] = (tally.encoding[String(d.encoding)] ?? 0) + 1;
  tally.encodingConfidence[d.encodingConfidence] = (tally.encodingConfidence[d.encodingConfidence] ?? 0) + 1;
  tally.delimiter[String(d.delimiter)] = (tally.delimiter[String(d.delimiter)] ?? 0) + 1;
  tally.delimiterConfidence[d.delimiterConfidence] = (tally.delimiterConfidence[d.delimiterConfidence] ?? 0) + 1;
  const t = got.text || {};
  if (t.guard) { tally.overBound++; named.push(["OVER BOUND", r.key, `${t.guard.size} > ${t.guard.bound} (${t.guard.metric})`]); continue; }
  tally.cells += t.cells ?? 0;
  tally.rows += t.usedRows ?? 0;
  if (t.rowsBound === null) tally.boundNull++;
  if (t.range) tally.rangeEmitted++;
  if (t.undetermined) {
    tally.undeterminedCells += t.undetermined;
    tally.filesWithUndeterminedCells++;
    named.push(["UNDETERMINED CELLS", r.key, `${t.undetermined} cell(s), encoding ${d.encoding}`]);
  }
}
const ms = Date.now() - t0;
console.log(JSON.stringify(tally, null, 1));
console.log(`\nelapsed ${ms} ms over ${tally.bytes} bytes`);
console.log("\n-- every file that is not the plain case, NAMED:");
for (const [what, key, why] of named) console.log(`   ${what.padEnd(20)} ${key}  ${why}`);
