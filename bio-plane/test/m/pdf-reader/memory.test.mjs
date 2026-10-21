/* pdf-reader: requirement-named tests for the bounded reading (build/requirements/pdf-reader.md R41; fix round 4,
 * C5a; K4434), at the module's interface.
 *
 * The real files are the govinfo budget volumes EXTRACTION #30 measured (2.39, 8.39 and 15.19 MiB; 188, 295 and
 * 1,354 pages). They are fetched once into BIO_FIXTURE_CACHE (default: the temporary directory) and checked against
 * their SHA-256; each is read in a process of its own (memory-child.mjs) so its memory is its alone. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { openPdf, extractPdfStructure } from "../../../src/pdfstructure.mjs";
import { doc, bytesOf } from "./pdf.mjs";
import { indexed } from "./indexed.mjs";
import { digestOf } from "./digest.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const CHILD = here("./memory-child.mjs");
const CACHE = process.env.BIO_FIXTURE_CACHE || join(tmpdir(), "bio-test-fixtures");
const GOVINFO = (n) => `https://www.govinfo.gov/content/pkg/${n}/pdf/${n}.pdf`;

/* The answers' digests (digest.mjs) as the reader gave them before R41, on the tranche tip. */
const REAL = [
  { name: "BUDGET-2025-BUD", pages: 188, sha: "3f1df41cfa3cebfd675b2a6ed673b6f665e0848c293d8d3bb5ab1815a0bae36b",
    digest: "576cbd1d52d714538e6bc0361e50eabce5de51e9786c6e7e37c7dcb9a536e38c" },
  { name: "BUDGET-2025-PER", pages: 295, sha: "067ad707534788e9011d4b6abdb686f1c3505888218e2ca5327c04e0ad58ae7f",
    digest: "bbcf620b210916a2fd03889d3b30d5d501fd228c9ddfd93d213dceaaf899da6e" },
  { name: "BUDGET-2024-APP", pages: 1354, sha: "6e0b3dc5f2f3f5bbab8ae5032bbc29207a8dbb290ba25ebafe3feb20dfe13c1e",
    digest: "a3d4b5f44afdea88254bcacb596ce3ca5f623bfd63d68a04468b96d52d2c054c" },
];
const SMALL = [
  ["../../fixtures/cpdf20/legistar-73450.pdf", "150fd0be42de296e34f865ce3750add881e91b78d745d7a8850383fba5037774"],
  ["../../fixtures/cpdf20/legistar-73545.pdf", "1ee3d6df5f18927dfaa4aded16be1ad60f07391d0a116a65b3da1e59d0dc2e54"],
  ["../../fixtures/cpdf20/legistar-73550.pdf", "3b5c668f15669624d98e1853497eabc9ec665179cf511ed3547a2f357bb6e3ae"],
  ["../../fixtures/cpdf20/legistar-73618.pdf", "777e7d8dceb0e2218d4671652b22b2cd8079de2fcf7a31243bd066551a02f79f"],
  ["../../fixtures/legistar-agenda-1425405.pdf", "75becc10615713648324fb06ca15aad952f649ce079e77b24db8e3c311855efb"],
  ["./fixtures/f1040es.pdf", "b2a3bee690b42cf2a7bb22cef7cab71bd45fc525a5ffa9dfeaea0e7f062378eb"],
];

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
async function fixture(name, sha) {
  const path = join(CACHE, `${name}.pdf`);
  if (existsSync(path) && sha256(readFileSync(path)) === sha) return path;
  mkdirSync(CACHE, { recursive: true });
  const res = await fetch(GOVINFO(name));
  assert.ok(res.ok, `${name}: ${GOVINFO(name)} answered ${res.status}`);
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

test("R41: the answer for every PDF here is what it was before the reading was bounded, unit for unit", async () => {
  for (const [file, pinned] of SMALL) {
    const got = await extractPdfStructure(new Uint8Array(readFileSync(here(file))));
    assert.equal(digestOf(got), pinned, file);
  }
});

/* The cap is the heap an idle process holds plus 56 MB: with the heap held to it the collector runs as a limited
 * isolate's does, so a reading that needs more than that dies here, and the peak is what the reading needs, not what a
 * heap with room to spare lets it leave lying about. The 64 MB allowed is then asserted of heap + array buffers
 * together (polled while it runs, above the baseline), which leaves the reading the 8 MB the cap does not count. A
 * semi-space of 2 MB keeps the young generation inside the cap. */
async function capFlags() {
  const idle = await child(["idle"], ["--expose-gc"]);
  assert.equal(idle.code, 0, idle.err.slice(0, 300));
  const capMB = Math.ceil(JSON.parse(idle.out).baseHeapMB) + 56;
  return { capMB, flags: ["--expose-gc", `--max-old-space-size=${capMB}`, "--max-semi-space-size=2"] };
}

for (const f of REAL) {
  test(`R41: ${f.name} (${f.pages} pages) is read in under 64 MB above idle, and its answer is unchanged`, { timeout: 900_000 }, async () => {
    const path = await fixture(f.name, f.sha);
    const { capMB, flags } = await capFlags();
    const m = await child(["measure", path], flags);
    assert.equal(m.code, 0, `${f.name}: the reading did not complete in a ${capMB} MB heap (${m.signal ?? "exit " + m.code}): ${m.err.split("\n").slice(0, 3).join(" | ")}`);
    const r = JSON.parse(m.out);
    console.log(`R41 ${f.name}: ${f.pages} pages, ${Math.round(r.ms)} ms, peak heap + array buffers above idle ${r.peakMB.toFixed(1)} MB (idle ${r.baseMB.toFixed(1)} MB)`);
    assert.equal(r.pages, f.pages);
    assert.ok(r.peakMB < 64, `${f.name}: peak ${r.peakMB.toFixed(1)} MB above idle`);
    const d = await child(["digest", path]);
    assert.equal(d.code, 0, d.err.slice(0, 300));
    assert.equal(JSON.parse(d.out).digest, f.digest, `${f.name}: the answer is not the answer before`);
  });
}

/* ---- the table, the second reading of an object stream, the markers and the font cache, on small files ---- */

test("R41: an object is the object it was after its parsed value and its object stream have left the caches", async () => {
  const pad = (c, n) => `(${c.repeat(n)})`;
  const objs = { 1: "<< /Type /Catalog /Pages 2 0 R >>", 2: "<< /Type /Pages /Kids [] /Count 0 >>" };
  const groups = [];
  for (let g = 0; g < 7; g++) {
    const small = 100 + g * 10, big = small + 1;
    objs[small] = `<< /Seven ${g} /Next ${big} 0 R /Name (group ${g}) >>`;
    objs[big] = pad(String.fromCharCode(97 + g), 3_200_000);
    groups.push([small, big]);
  }
  const file = indexed(objs, { xref: "stream", packed: groups, trailer: "/Root 1 0 R" });
  const d = await openPdf(file);
  const small = (g) => d.resolve({ t: "ref", n: 100 + g * 10 });
  const first = small(0);
  assert.equal(first.map.Name.v, "group 0");
  /* read every group's big object: 22 MB of decoded object streams, past what is held */
  for (let g = 0; g < 7; g++) assert.equal(d.resolve({ t: "ref", n: 101 + g * 10 }).v.length, 3_200_000);
  for (let g = 6; g >= 0; g--) {
    const o = small(g);
    assert.equal(o.t, "dict");
    assert.equal(o.map.Seven, g);
    assert.equal(o.map.Name.v, `group ${g}`);
    assert.deepEqual(o.map.Next, { t: "ref", n: 101 + g * 10, g: 0 });
  }
  assert.deepEqual(small(0), first, "read again it is the same value");
  assert.equal(d.resolve({ t: "ref", n: 101 }).v.slice(0, 5), "aaaaa");
  assert.ok(!d.notes.includes("objstm_undecodable"));
});

test("R41: a later definition wins, an unparseable one changes nothing, and a top-level definition beats a packed one", async () => {
  const objs = { 1: "<< /Type /Catalog /Pages 2 0 R >>", 2: "<< /Type /Pages /Kids [] /Count 0 >>", 5: "(packed five)", 6: "(packed six)", 7: "(packed seven)" };
  const base = indexed(objs, { xref: "stream", packed: [5, 6, 7], trailer: "/Root 1 0 R" });
  const tail = bytesOf("\n6 0 obj\n(top-level six)\nendobj\n7 0 obj\n(first seven)\nendobj\n7 0 obj\n@@@ not a value @@@\nendobj\n8 0 obj\n(one)\nendobj\n8 0 obj\n(two)\nendobj\n");
  const file = new Uint8Array(base.length + tail.length);
  file.set(base); file.set(tail, base.length);
  const d = await openPdf(file);
  const v = (n) => d.resolve({ t: "ref", n }).v;
  assert.equal(v(5), "packed five");
  assert.equal(v(6), "top-level six", "top level beats packed");
  assert.equal(v(7), "first seven", "an unparseable later definition is no definition");
  assert.equal(v(8), "two", "the later of two wins");
  const gens = (d.objects() ?? { objects: [] }).objects.length;
  assert.ok(gens >= 0);
});

test("R41: an object stream the second decode cannot reproduce is kept as first decoded: raw deflate that passes for a zlib header", async () => {
  /* Raw deflate (no zlib header) whose first two bytes happen to be a valid zlib header: a stored block of 29 bytes
     ("08 1D" is divisible by 31), then the empty final block. The native decoder falls back to raw deflate and reads it;
     a decoder that trusts the header does not, so the second decode differs and the first is what is kept. */
  const payload = bytesOf("700 0 (hello world)          ");
  assert.equal(payload.length, 29);
  const raw = Uint8Array.from([0x08, 29, 0, ~29 & 0xff, 0xff, ...payload, 0x01, 0, 0, 0xff, 0xff]);
  assert.equal(((raw[0] << 8) | raw[1]) % 31, 0);
  const file = doc([{ content: "" }], { objs: { 900: { dict: "/Type /ObjStm /N 1 /First 6 /Filter /FlateDecode", data: raw } } });
  const d = await openPdf(file);
  assert.ok(!d.notes.includes("objstm_undecodable"));
  for (let i = 0; i < 3; i++) assert.equal(d.resolve({ t: "ref", n: 700 }).v, "hello world");
});

test("R41: a large Flate content stream is read the same whether it is proved by its checksum or needs the platform's recoveries", async () => {
  /* about 700 KB of incompressible comment text, so the compressed stream is past the size that is decoded in one proved pass */
  let seed = 12345;
  const filler = Array.from({ length: 700 }, () => "% " + Array.from({ length: 64 }, () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) >>> 8).toString(16).padStart(6, "0")).join("")).join("\n");
  const content = `BT /F1 12 Tf 1 0 0 1 10 700 Tm (proved text) Tj ET\n${filler}\nBT /F1 12 Tf 1 0 0 1 10 600 Tm (after the filler) Tj ET`;
  const z = new Uint8Array(deflateSync(bytesOf(content)));
  assert.ok(z.length > 128 * 1024, `compressed ${z.length}`);
  const read = async (data) => extractPdfStructure(doc([{ content: { dict: "/Filter /FlateDecode", data } }]));
  const plain = await read(z);
  assert.equal(plain.text.document, "proved text\nafter the filler");
  assert.ok(!plain.notes.some((n) => n.startsWith("flate_trailing")) && !plain.notes.includes("content_stream_undecodable"));
  /* trailing bytes after the checksum: the platform decoder's recovery reads it and says so */
  const trailing = await read(Uint8Array.from([...z, 10, 10, 10]));
  assert.equal(trailing.text.document, "proved text\nafter the filler");
  assert.deepEqual(trailing.notes.filter((n) => n.startsWith("flate_trailing")), ["flate_trailing_bytes:3"]);
  /* raw deflate with no zlib header */
  const rawDeflate = await read(z.subarray(2, z.length - 4));
  assert.equal(rawDeflate.text.document, "proved text\nafter the filler");
  /* a damaged stream is undecodable, named, and not read as blank */
  const damaged = z.slice(); damaged[Math.floor(damaged.length / 2)] ^= 0xff;
  const bad = await read(damaged);
  assert.deepEqual(bad.text.pages[0].undetermined.map((m) => m.reason), ["content_stream_undecodable"]);
});

test("R41: the same marker said many times is one frozen marker; two pages do not share one; the document's list is the pages' own", async () => {
  const bare = "<< /Type /Font /Subtype /TrueType /BaseFont /Bare >>";
  const page = { resources: "/Font << /F3 13 0 R >>", content: "BT /F3 12 Tf (abc) Tj (abc) Tj (zz) Tj (abc) Tj ET" };
  const r = await extractPdfStructure(doc([page, page], { objs: { 13: bare } }));
  const [p0, p1] = r.text.pages.map((p) => p.undetermined);
  const want = (page, codes, count) => ({ page, reason: "no_tounicode", font: "Bare", codes, count });
  assert.deepEqual(p0, [want(0, "616263", 3), want(0, "616263", 3), want(0, "7a7a", 2), want(0, "616263", 3)]);
  assert.deepEqual(p1.map((m) => m.page), [1, 1, 1, 1]);
  assert.ok(p0[0] === p0[1] && p0[0] === p0[3] && p0[0] !== p0[2], "identical markers are one object");
  assert.ok(p0[0] !== p1[0], "a marker of page 1 is not page 0's");
  assert.ok(Object.isFrozen(p0[0]), "a shared marker cannot be changed through its twin");
  assert.throws(() => { p0[0].count = 99; }, TypeError);
  assert.deepEqual(r.text.undetermined, [...p0, ...p1]);
  assert.ok(r.text.undetermined.every((m, i) => m === [...p0, ...p1][i]), "the document's markers are the pages' objects");
  assert.equal(r.text.counts.undetermined, 8);
});

test("R41: fonts evicted from the cache are read again when a later page uses them, and the text is the text", async () => {
  /* three fonts, each a 60,000-entry code map: together past what the cache holds */
  const cmap = "/CIDInit /ProcSet findresource begin 1 begincodespacerange <0000> <FFFF> endcodespacerange 1 beginbfrange <0000> <EA5F> <0000> endbfrange end";
  const fonts = {};
  for (let i = 0; i < 3; i++) {
    fonts[20 + i] = `<< /Type /Font /Subtype /TrueType /BaseFont /Big${i} /ToUnicode ${30 + i} 0 R >>`;
    fonts[30 + i] = { data: cmap };
  }
  const pages = [];
  const words = ["<004100420043>", "<004400450046>", "<004700480049>"];
  for (let p = 0; p < 9; p++) pages.push({ resources: "/Font << /F1 20 0 R /F2 21 0 R /F3 22 0 R >>", content: `BT /F${(p % 3) + 1} 12 Tf ${words[(p * 2) % 3]} Tj ET` });
  const r = await extractPdfStructure(doc(pages, { objs: fonts }));
  const letters = ["ABC", "DEF", "GHI"];
  assert.deepEqual(r.text.pages.map((p) => p.text), Array.from({ length: 9 }, (_, p) => letters[(p * 2) % 3]));
  assert.equal(r.text.document, r.text.pages.map((p) => p.text).join("\n"));
  assert.deepEqual(r.text.undetermined, []);
});

test("R41: the embedded files named by a tree of object-stream nodes are found as they are in a file written plainly", async () => {
  const spec = (name, n) => `<< /Type /Filespec /F (${name}) /UF (${name}) /EF << /F ${n} 0 R >> >>`;
  const objs = {
    1: "<< /Type /Catalog /Pages 2 0 R /Names 3 0 R >>", 2: "<< /Type /Pages /Kids [] /Count 0 >>", 3: "<< /EmbeddedFiles 4 0 R >>",
    4: "<< /Kids [5 0 R 6 0 R] >>", 5: "<< /Names [(a.txt) 7 0 R (b.txt) 8 0 R] >>", 6: "<< /Names [(c.txt) 9 0 R] >>",
    7: spec("a.txt", 20), 8: spec("b.txt", 21), 9: spec("c.txt", 22),
    20: { dict: "/Type /EmbeddedFile", data: "alpha" }, 21: { dict: "/Type /EmbeddedFile", data: "beta" }, 22: { dict: "/Type /EmbeddedFile", data: "gamma" },
  };
  const plain = await extractPdfStructure(indexed(objs, { xref: "stream", trailer: "/Root 1 0 R" }));
  const packed = await extractPdfStructure(indexed(objs, { xref: "stream", packed: [1, 2, 3, 4, 5, 6, 7, 8, 9], trailer: "/Root 1 0 R" }));
  const files = (r) => r.active.filter((a) => a.kind === "embedded-file").map((a) => a.detail);
  assert.deepEqual(files(plain), ["a.txt", "b.txt", "c.txt"]);
  assert.deepEqual(files(packed), ["a.txt", "b.txt", "c.txt"]);
  assert.deepEqual(packed.links.map((l) => [l.partition, l.target.name]), plain.links.map((l) => [l.partition, l.target.name]));
  assert.deepEqual(packed.links.map((l) => l.target.name), ["a.txt", "b.txt", "c.txt"]);
});

test("R41: the answer's pages are read one at a time: a link's anchor text is the page's own, whatever the page count", async () => {
  /* 300 pages, each with a link over its own words; every anchor is read from its own page */
  const objs = {};
  const pages = [];
  for (let i = 0; i < 300; i++) {
    objs[1000 + i] = `<< /Type /Annot /Subtype /Link /Rect [0 0 600 800] /A << /S /URI /URI (https://example.org/${i}) >> >>`;
    pages.push({ content: `BT /F1 12 Tf 1 0 0 1 10 700 Tm (word${i}) Tj ET`, extra: `/Annots [${1000 + i} 0 R]` });
  }
  const r = await extractPdfStructure(doc(pages, { objs }));
  assert.equal(r.links.length, 300);
  r.links.forEach((l, i) => { assert.equal(l.anchor.text, `word${i}`); assert.equal(l.target.url, `https://example.org/${i}`); });
});
