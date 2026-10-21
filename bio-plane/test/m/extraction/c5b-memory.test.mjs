/* extraction, R80 as amended (T51 fix round 4, C5b; K4429, B9): `readHeld` of a home promoted with a reading that failed for want of
   the whole reads the 21 MB three-part PDF within the object's memory. The read runs in a child process started with --expose-gc so
   the peak above the idle process is measured (heap plus array buffers, sampled while the read runs); the object's limit is 128 MB,
   which the file's own bytes and the stored object count against. It is red until pdf-reader bounds its memory (pdf-reader R41). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const FIXTURE = new URL("./fixture.mjs", import.meta.url).href;
const BIG = new URL("./bigpdf.mjs", import.meta.url).href;
const OBJECT_LIMIT_MB = 128;

const CHILD = `
import { fresh, bundle, bucket, doc, sha } from ${JSON.stringify(FIXTURE)};
import { synthPdf } from ${JSON.stringify(BIG)};
const bytes = synthPdf({ pages: 1300, linesPerPage: 120, targetBytes: 21_000_000 });
const d = sha(bytes);
const rows = new Map(), evidence = bucket();
const w = fresh({ evidence, provenance: { homeOf: (s) => rows.get(s) ?? null, onTestimony: () => ({ ok: true }) } });
bundle(w.s, "INFO-42");
rows.set(d, { bundleId: "INFO-42", path: "a.pdf", encoding: "binary", bytes: bytes.length, registered: "t", authored: false });
const third = Math.floor(bytes.length / 3);
const parts = [bytes.length - 2 * third, third, third].map((n, i) => ({ sha256: sha("part " + i), bytes: n }));
const document = doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf", parts });
const made = await w.x.read(document, { storeName: "bio" });
const files = [{ path: "data/provenance.json", text: JSON.stringify({ documents: [{ ...document, reading: made.reading }] }) }];
w.core.readFile = (b, p) => (b === "INFO-42" && p === "data/provenance.json" ? { text: files[0].text } : null);
w.x.projectPromotion({ bundleId: "INFO-42", author: "member:m1", files });
const failedBefore = made.reading.found === false && /parts, over the/.test(made.reading.basis);
await evidence.put("bio/captures/" + d, bytes);
const use = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers; };
global.gc(); global.gc();
const base = use(); let peak = base;
const tick = setInterval(() => { peak = Math.max(peak, use()); }, 5);
const r = await w.x.readHeld({ sha: d });
clearInterval(tick); peak = Math.max(peak, use());
const got = w.x.readingFor(d, "class:admin");
console.log(JSON.stringify({ failedBefore, read: r.read, why: r.why ?? null, found: got.found, basis: (got.reading && got.reading.basis) || "",
  pages: got.reading && got.reading.page_count, units: (got.text_units || []).length, fileMb: +(bytes.length / 1048576).toFixed(1),
  peakAboveIdleMb: +((peak - base) / 1048576).toFixed(0) }));
`;

test("R80 R45 (C5b, L): `readHeld` of a 21 MB three-part PDF home promoted with a failed reading reads it once, and its peak memory above the idle process is under the object's 128 MB", { timeout: 300000 }, async () => {
  const { stdout } = await promisify(execFile)(process.execPath, ["--expose-gc", "--input-type=module", "-e", CHILD],
    { maxBuffer: 1 << 24, timeout: 280000 });
  const out = JSON.parse(stdout.trim().split("\n").pop());
  assert.equal(out.failedBefore, true, "the real chain failed the reading for want of the whole");
  assert.deepEqual([out.read, out.found], [true, true], JSON.stringify(out));
  assert.doesNotMatch(out.basis, /parts, over the/, "the reading is no longer the failed one");
  assert.ok(out.pages >= 1000, `read ${out.pages} pages`);
  assert.ok(out.peakAboveIdleMb < OBJECT_LIMIT_MB, `the read of a ${out.fileMb} MB file peaked ${out.peakAboveIdleMb} MB above idle, past the object's ${OBJECT_LIMIT_MB} MB`);
});
