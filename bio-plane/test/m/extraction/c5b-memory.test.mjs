/* extraction, R80 as amended (T51 fix round 4, C5b; K4429, B9; fix round 5, E2, K4544): `readHeld` of a 21 MB, 1,300-page PDF reads it within the
   object's memory. The gate is the object's limit, not node's sampled peak (which over-states the object: local workerd read this file at
   the index bound in 65 MB of old space): the read runs in a child with `--max-old-space-size=88` (128 MB, less the file's 20 MB of bytes,
   less 20 MB of headroom) and must complete and write the reading with its words in `text_units` (R-STOP), for a single-part home and for
   a three-part home promoted with a failed reading. The child also prints the sampled peak above idle (a figure, not a gate). With the
   units budget at `Infinity` (the pre-fix round 5 path) the same child dies or fails at 88. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const FIXTURE = new URL("./fixture.mjs", import.meta.url).href;
const BIG = new URL("./bigpdf.mjs", import.meta.url).href;
const OLD_SPACE_MB = 88;

/* argv[1] is "single" (a whole capture with a stored document) or "parts" (a three-part capture promoted with the failed reading the real
   chain made of it, the whole then held). */
const CHILD = `
import { fresh, bundle, bucket, doc, sha } from ${JSON.stringify(FIXTURE)};
import { synthPdf } from ${JSON.stringify(BIG)};
const mode = process.argv[1];
const bytes = synthPdf({ pages: 1300, linesPerPage: 120, targetBytes: 21_000_000 });
const d = sha(bytes);
const rows = new Map(), evidence = bucket();
const w = fresh({ evidence, provenance: { homeOf: (s) => rows.get(s) ?? null, onTestimony: () => ({ ok: true }) } });
bundle(w.s, "INFO-42");
rows.set(d, { bundleId: "INFO-42", path: "a.pdf", encoding: "binary", bytes: bytes.length, registered: "t", authored: false });
let failedBefore = null;
if (mode === "parts") {
  const third = Math.floor(bytes.length / 3);
  const parts = [bytes.length - 2 * third, third, third].map((n, i) => ({ sha256: sha("part " + i), bytes: n }));
  const document = doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf", parts });
  const made = await w.x.read(document, { storeName: "bio" });
  const files = [{ path: "data/provenance.json", text: JSON.stringify({ documents: [{ ...document, reading: made.reading }] }) }];
  w.core.readFile = (b, p) => (b === "INFO-42" && p === "data/provenance.json" ? { text: files[0].text } : null);
  w.x.projectPromotion({ bundleId: "INFO-42", author: "member:m1", files });
  failedBefore = made.reading.found === false && /parts, over the/.test(made.reading.basis);
} else {
  const document = doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf" });
  w.core.readFile = (b, p) => (b === "INFO-42" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [document] }) } : null);
}
await evidence.put("bio/captures/" + d, bytes);
const use = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers; };
global.gc(); global.gc();
const base = use(); let peak = base;
const tick = setInterval(() => { peak = Math.max(peak, use()); }, 5);
const r = await w.x.readHeld({ sha: d });
clearInterval(tick); peak = Math.max(peak, use());
const got = w.x.readingFor(d, "class:admin");
const text = (got.text_units || []).map((u) => u.text).join(" ");
console.log(JSON.stringify({ mode, failedBefore, read: r.read, why: r.why ?? null, found: got.found, basis: (got.reading && got.reading.basis) || "",
  pages: got.reading && got.reading.page_count, units: (got.text_units || []).length, words: /budget/.test(text), fileMb: +(bytes.length / 1048576).toFixed(1),
  peakAboveIdleMb: +((peak - base) / 1048576).toFixed(0) }));
`;

for (const mode of ["single", "parts"]) {
  test(`R80 R83 (E2, L): \`readHeld\` of a 21 MB, 1,300-page PDF (${mode === "single" ? "one whole capture" : "a three-part home promoted with a failed reading"}) completes in ${OLD_SPACE_MB} MB of old space and writes the reading with its words in \`text_units\``, { timeout: 300000 }, async () => {
    const { stdout } = await promisify(execFile)(process.execPath,
      [`--max-old-space-size=${OLD_SPACE_MB}`, "--expose-gc", "--input-type=module", "-e", CHILD, mode],
      { maxBuffer: 1 << 24, timeout: 280000 });
    const out = JSON.parse(stdout.trim().split("\n").pop());
    console.log(`c5b-memory ${mode}: ${out.fileMb} MB file, sampled peak ${out.peakAboveIdleMb} MB above idle (a figure, not a gate)`);
    if (mode === "parts") assert.equal(out.failedBefore, true, "the real chain failed the reading for want of the whole");
    assert.deepEqual([out.read, out.found], [true, true], JSON.stringify(out));
    assert.doesNotMatch(out.basis, /parts, over the/, "the reading is no longer the failed one");
    assert.ok(out.pages >= 1000, `read ${out.pages} pages`);
    assert.ok(out.units >= 1 && out.words, "R-STOP: the words are in text_units");
  });
}
