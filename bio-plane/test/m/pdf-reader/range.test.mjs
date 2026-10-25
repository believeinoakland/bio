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
/* each page of `small()` has this many decoded content bytes: R43 judges `maxBytes` against a page's own decoded size (fix round 9, G124d) */
const PAGE_BYTES = "BT /F1 12 Tf 10 700 Td (page number 1 text) Tj ET".length;
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
  const { notes } = await extractPdfStructure(bytes);   /* R50: a range carries the document's notes */
  for (const from of [7, 8, 1000]) {
    const r = await extractPdfRange(bytes, { from, count: 5 });
    assert.deepEqual(r, { ok: true, container: "pdf", pages: 7, from, count: 0, text: { pages: [], undetermined: [], counts: { chars: 0, undetermined: 0 } }, notes });
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

/* R43's byte bound (fix round 6, G56; K4693; fix round 9, G124d): an optional `range.maxBytes` shrinks the pages a call builds
 * to those whose own decoded content fits it, at least one page. Asserted in pages, never in time (R-CLOCK). */
test("R43: maxBytes shrinks a range to the pages whose own decoded size fits it, never widens it, floors it at one page, and without maxBytes the call is today's", async () => {
  const bytes = small();
  const perPage = PAGE_BYTES;
  const none = await extractPdfRange(bytes, { from: 0, count: 7 });
  assert.equal(none.count, 7);
  /* absent, or not a finite number above 0: the call equals the call without it, byte for byte */
  for (const maxBytes of [undefined, null, 0, -5, NaN, Infinity, "1200"]) {
    assert.deepEqual(await extractPdfRange(bytes, { from: 0, count: 7, maxBytes }), none, `maxBytes ${String(maxBytes)}`);
  }
  /* the bound shrinks: 3.5 pages of bytes build 3 pages, which are the first 3 of the unbounded answer */
  const three = await extractPdfRange(bytes, { from: 0, count: 7, maxBytes: perPage * 3.5 });
  assert.equal(three.count, 3);
  assert.equal(three.pages, 7);
  assert.deepEqual(three.text.pages, none.text.pages.slice(0, 3));
  assert.deepEqual(Object.keys(three), Object.keys(none), "the answer's shape is unchanged");
  assert.deepEqual(Object.keys(three.text), Object.keys(none.text));
  /* the floor: a bound under one page's bytes still builds one page, so a cursor always moves */
  for (const maxBytes of [1, perPage / 2, perPage * 0.99]) {
    const one = await extractPdfRange(bytes, { from: 4, count: 7, maxBytes });
    assert.equal(one.count, 1);
    assert.deepEqual(one.text.pages, none.text.pages.slice(4, 5));
  }
  /* never wider than asked: a bound of the whole file, or far more, leaves a smaller ask as it was */
  for (const maxBytes of [perPage * 5.5, bytes.length, bytes.length * 1000]) {
    assert.equal((await extractPdfRange(bytes, { from: 0, count: 2, maxBytes })).count, 2);
  }
  assert.equal((await extractPdfRange(bytes, { from: 0, count: 7, maxBytes: perPage * 5.5 })).count, 5);
  assert.equal((await extractPdfRange(bytes, { from: 5, count: 100, maxBytes: bytes.length * 1000 })).count, 2, "still clamped to the pages left");
  /* a range with no count is the rest of the document, and the bound applies to it too */
  assert.equal((await extractPdfRange(bytes, { from: 1, maxBytes: perPage * 2.5 })).count, 2);
  /* a from at or past the end builds no page, the floor of one does not invent one */
  assert.equal((await extractPdfRange(bytes, { from: 7, count: 5, maxBytes: 1 })).count, 0);
  assert.equal((await extractPdfRange(bytes, { from: 3, count: 0, maxBytes: 1 })).count, 0);
  /* the union of bounded ranges, advancing by the pages built, is the whole reading's pages, each once */
  const whole = await extractPdfStructure(bytes);
  const seen = [];
  for (let from = 0; from < 7;) {
    const r = await extractPdfRange(bytes, { from, count: 7, maxBytes: perPage * 2.5 });
    assert.ok(r.count >= 1 && r.count <= 2);
    seen.push(...r.text.pages);
    from += r.count;
  }
  assert.deepEqual(seen, whole.text.pages);
});
