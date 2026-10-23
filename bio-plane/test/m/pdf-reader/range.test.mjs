/* pdf-reader: requirement-named tests for the page range (R43; fix round 6, G26; K4606), at the module's interface.
 *
 * `extractPdfRange(bytes, {from, count})` builds the text of those pages only. The real file is the 15.2 MiB, 1,354-page
 * govinfo volume the walker's reading died on (BUDGET-2024-APP, fetched once into BIO_FIXTURE_CACHE and checked against
 * its SHA-256). The format entry's `structureRange` is format-registry's one-line wrapper over this function. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractPdfStructure, extractPdfRange } from "../../../src/pdfstructure.mjs";
import { doc } from "./pdf.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const CHILD = here("./memory-child.mjs");
const CACHE = process.env.BIO_FIXTURE_CACHE || join(tmpdir(), "bio-test-fixtures");
const APP = { name: "BUDGET-2024-APP", pages: 1354, sha: "6e0b3dc5f2f3f5bbab8ae5032bbc29207a8dbb290ba25ebafe3feb20dfe13c1e" };
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
async function fixture({ name, sha }) {
  const path = join(CACHE, `${name}.pdf`);
  if (existsSync(path) && sha256(readFileSync(path)) === sha) return path;
  mkdirSync(CACHE, { recursive: true });
  const res = await fetch(`https://www.govinfo.gov/content/pkg/${name}/pdf/${name}.pdf`);
  assert.ok(res.ok, `${name}: answered ${res.status}`);
  const body = Buffer.from(await res.arrayBuffer());
  assert.equal(sha256(body), sha, `${name}: the file fetched is not the file measured`);
  writeFileSync(`${path}.part`, body);
  renameSync(`${path}.part`, path);
  return path;
}
function child(args, nodeArgs = []) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [...nodeArgs, CHILD, ...args], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code, signal) => resolve({ code, signal, out, err }));
  });
}
const pagesDigest = (pages) => { const h = createHash("sha256"); for (const p of pages) h.update(JSON.stringify([p.page, p.text, p.undetermined])); return h.digest("hex"); };

/* a small document of 7 text pages, for the shape rules */
const small = () => doc(Array.from({ length: 7 }, (_, i) => ({ content: `BT /F1 12 Tf 10 700 Td (page number ${i + 1} text) Tj ET` })));

test("R43: a range answers the pages' text as the whole reading answers them, and the union of ranges is the whole, each page once", async () => {
  const bytes = small();
  const whole = await extractPdfStructure(bytes);
  assert.equal(whole.pages, 7);
  for (const n of [1, 2, 3, 7, 10]) {
    const seen = [];
    for (let from = 0; from < 7; from += n) {
      const r = await extractPdfRange(bytes, { from, count: n });
      assert.equal(r.ok, true);
      assert.equal(r.pages, 7);
      assert.equal(r.from, from);
      assert.equal(r.count, Math.min(n, 7 - from));
      assert.deepEqual(r.text.pages, whole.text.pages.slice(from, from + n));
      assert.equal(r.text.counts.chars, r.text.pages.filter((p) => p.text.length).map((p) => p.text).join("\n").length);
      seen.push(...r.text.pages);
    }
    assert.deepEqual(seen, whole.text.pages, `ranges of ${n}`);
    assert.ok(seen.every((p, i) => p.page === i));
  }
});

test("R43: a range past the end answers no pages with the document's total; a range is clamped; what is not a PDF answers as the whole reading does", async () => {
  const bytes = small();
  for (const from of [7, 8, 1000]) {
    const r = await extractPdfRange(bytes, { from, count: 5 });
    assert.deepEqual(r, { ok: true, container: "pdf", pages: 7, from, count: 0, text: { pages: [], undetermined: [], counts: { chars: 0, undetermined: 0 } } });
  }
  const tail = await extractPdfRange(bytes, { from: 5, count: 100 });
  assert.equal(tail.count, 2);
  assert.equal((await extractPdfRange(bytes, { from: 3, count: 0 })).count, 0);
  const notPdf = new TextEncoder().encode("hello");
  assert.deepEqual(await extractPdfRange(notPdf, { from: 0, count: 1 }), await extractPdfStructure(notPdf));
  assert.deepEqual(await extractPdfRange("x", { from: 0, count: 1 }), await extractPdfStructure("x"));
});

test("R43: BUDGET-2024-APP (1,354 pages) is read 100 pages a call in a heap of 128 MB less its bytes, each page once, the text the whole reading's", { timeout: 900_000 }, async () => {
  const path = await fixture(APP);
  const bytes = new Uint8Array(readFileSync(path));
  const mb = Math.ceil(bytes.length / 1048576);
  const heapMB = 128 - mb;
  const whole = await extractPdfStructure(bytes);
  assert.equal(whole.pages, APP.pages);
  const r = await extractPdfRange(bytes, { from: 1200, count: 100 });
  assert.deepEqual(r.text.pages, whole.text.pages.slice(1200, 1300), "a range of 100 pages equals the same pages of the whole reading");
  const m = await child(["range", path, "100"], ["--expose-gc", `--max-old-space-size=${heapMB}`, "--max-semi-space-size=2"]);
  assert.equal(m.code, 0, `the ranges did not complete in a ${heapMB} MB heap (${m.signal ?? "exit " + m.code}): ${m.err.split("\n").slice(0, 3).join(" | ")}`);
  const got = JSON.parse(m.out);
  console.log(`R43 ${APP.name}: ${got.calls} calls of 100 pages, slowest ${Math.round(got.slowestMs)} ms, peak heap + array buffers above its bytes and idle ${got.peakMB.toFixed(1)} MB`);
  assert.equal(got.pages, APP.pages);
  assert.equal(got.calls, 14);
  assert.equal(got.digest, pagesDigest(whole.text.pages), "the union of the ranges is the whole reading's pages, each once");
  assert.ok(got.peakMB < 64, `peak ${got.peakMB.toFixed(1)} MB above idle`);
  assert.ok(got.slowestMs < 10_000, `a call took ${Math.round(got.slowestMs)} ms`);
});
